"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [verificationCode, setVerificationCode] = useState("");

  const [step, setStep] = useState<"register" | "verify">(
    "register"
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* =========================================================
     SEND VERIFICATION CODE
  ========================================================= */

  async function handleSendVerification(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    /* =========================
       FRONTEND VALIDATION
    ========================= */

    if (!username) {
      setError("Please enter your username.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/send-registration-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
          }),
        }
      );

      let data: any = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(
          data?.error ||
            "Unable to send verification code. Please try again."
        );
        return;
      }

      setForm({
        username,
        email,
        password,
      });

      setVerificationCode("");

      setSuccess(
        "A verification code has been sent to your email address."
      );

      setStep("verify");
    } catch (error) {
      console.error(
        "Registration verification error:",
        error
      );

      setError(
        "Unable to send verification code. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     VERIFY CODE
  ========================================================= */

  async function handleVerifyCode(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const code = verificationCode.trim();

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "/api/auth/verify-registration-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            verificationCode: code,
            username: form.username.trim(),
            password: form.password,
          }),
        }
      );

      let data: any = {};

      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(
          data?.error ||
            "Verification failed. Please try again."
        );
        return;
      }

      if (data?.success) {
        setSuccess(
          "Email verified successfully. Creating your account..."
        );

        /*
         * Account creation and authentication are completed
         * by the verify-registration-code route.
         */

        setTimeout(() => {
          router.push("/dashboard");
        }, 500);

        return;
      }

      setError(
        "Unable to complete registration. Please try again."
      );
    } catch (error) {
      console.error(
        "Registration verification error:",
        error
      );

      setError(
        "Something went wrong while verifying your email."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     BACK TO REGISTRATION
  ========================================================= */

  function handleBack() {
    setStep("register");
    setVerificationCode("");
    setError("");
    setSuccess("");
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 to-purple-200 px-4">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl sm:p-10"
      >

        {/* =====================================================
            REGISTRATION STEP
        ===================================================== */}

        {step === "register" && (
          <>
            {/* TITLE */}

            <div className="mb-7 text-center">

              <h2 className="text-2xl font-bold text-gray-900">
                Create Account
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Join the FriscoDesi community
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSendVerification}
              className="space-y-4"
            >

              {/* USERNAME */}

              <div>

                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  disabled={loading}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      username: e.target.value,
                    });

                    setError("");
                    setSuccess("");
                  }}
                  className="
                    w-full
                    rounded-lg
                    border border-gray-200
                    bg-gray-50
                    px-4 py-3
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-red-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-red-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  required
                />

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  disabled={loading}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      email: e.target.value,
                    });

                    setError("");
                    setSuccess("");
                  }}
                  className="
                    w-full
                    rounded-lg
                    border border-gray-200
                    bg-gray-50
                    px-4 py-3
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-red-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-red-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                  required
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  A verification code will be sent to this
                  email address.
                </p>

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={form.password}
                    disabled={loading}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        password: e.target.value,
                      });

                      setError("");
                      setSuccess("");
                    }}
                    className="
                      w-full
                      rounded-lg
                      border border-gray-200
                      bg-gray-50
                      px-4 py-3
                      pr-12
                      text-gray-900
                      outline-none
                      transition
                      placeholder:text-gray-400
                      focus:border-red-500
                      focus:bg-white
                      focus:ring-2
                      focus:ring-red-100
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    disabled={loading}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-md
                      p-1.5
                      text-gray-400
                      transition
                      hover:bg-gray-100
                      hover:text-gray-600
                      focus:outline-none
                      focus:ring-2
                      focus:ring-red-200
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.6 10.6a2 2 0 102.8 2.8"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.9 4.3A10.8 10.8 0 0112 4c5 0 8.5 4 9.5 6a11.8 11.8 0 01-4 4.7"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.6 6.6C4.8 7.8 3.5 9.3 2.5 10.5c1 2 4.5 6 9.5 6 1.1 0 2.1-.2 3-.5"
                        />
                      </svg>

                    ) : (

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                        />
                      </svg>

                    )}

                  </button>

                </div>

                <p className="mt-1.5 text-xs text-gray-400">
                  Password must be at least 6 characters.
                </p>

              </div>

              {/* SUCCESS */}

              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm text-green-700">
                    {success}
                  </p>
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-2
                  w-full
                  rounded-lg
                  bg-red-500
                  px-4
                  py-3
                  font-semibold
                  text-white
                  shadow-md
                  shadow-red-500/20
                  transition
                  hover:bg-red-600
                  hover:-translate-y-0.5
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-200
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Sending Code..."
                  : "Continue"}
              </button>

            </form>
          </>
        )}

        {/* =====================================================
            VERIFICATION STEP
        ===================================================== */}

        {step === "verify" && (
          <>
            <div className="mb-7 text-center">

              <h2 className="text-2xl font-bold text-gray-900">
                Verify Your Email
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                We sent a 6-digit verification code to
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                {form.email}
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">
                  {success}
                </p>
              </div>
            )}

            <form
              onSubmit={handleVerifyCode}
              className="space-y-5"
            >

              <div>

                <label
                  htmlFor="verificationCode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>

                <input
                  id="verificationCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  disabled={loading}
                  onChange={(e) => {
                    const value =
                      e.target.value.replace(
                        /\D/g,
                        ""
                      );

                    setVerificationCode(value);
                    setError("");
                    setSuccess("");
                  }}
                  className="
                    w-full
                    rounded-lg
                    border border-gray-200
                    bg-gray-50
                    px-4 py-3
                    text-center
                    text-xl
                    font-semibold
                    tracking-[0.4em]
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    placeholder:tracking-normal
                    focus:border-red-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-red-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  verificationCode.length !== 6
                }
                className="
                  w-full
                  rounded-lg
                  bg-red-500
                  px-4
                  py-3
                  font-semibold
                  text-white
                  shadow-md
                  shadow-red-500/20
                  transition
                  hover:bg-red-600
                  hover:-translate-y-0.5
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-200
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Create Account"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-3
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                Back
              </button>

            </form>
          </>
        )}

      </motion.div>

    </div>
  );
}