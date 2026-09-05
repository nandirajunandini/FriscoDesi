"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [verificationCode, setVerificationCode] = useState("");

  const [step, setStep] = useState<"form" | "verification">(
    "form"
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     Handle input changes
  ========================================================= */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     Step 1 - Request verification code
  ========================================================= */

  const handleSendVerification = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const message = form.message.trim();

    /* =====================================================
       Frontend validation
    ===================================================== */

    if (!name) {
      setError("Please enter your name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!message) {
      setError("Please enter your message.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      /* =================================================
         Send verification code
      ================================================= */

      const response = await fetch(
        "/api/contact/send-verification",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            message,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to send the verification code. Please try again."
        );

        return;
      }

      /* =================================================
         Verification code sent
      ================================================= */

      setForm({
        name,
        email,
        message,
      });

      setVerificationCode("");

      setStep("verification");

      setSuccess(
        data?.message ||
          "If this email address can receive messages, a verification code has been sent. Please check your inbox."
      );
    } catch (error) {
      console.error(
        "Send verification error:",
        error
      );

      setError(
        "Unable to send the verification code. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Step 2 - Verify code and send message
  ========================================================= */

  const handleVerifyCode = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const email = form.email.trim().toLowerCase();
    const code = verificationCode.trim();

    /* =====================================================
       Validate code
    ===================================================== */

    if (!code) {
      setError(
        "Please enter the verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      /* =================================================
         Verify code
      ================================================= */

      const response = await fetch(
        "/api/contact/verify-code",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            verificationCode: code,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to verify your email. Please try again."
        );

        return;
      }

      /* =================================================
         Successful verification
      ================================================= */

      if (data?.success) {
        setSuccess(
          data?.message ||
            "Your email has been verified and your message has been sent successfully."
        );

        setForm({
          name: "",
          email: "",
          message: "",
        });

        setVerificationCode("");

        setStep("form");

        return;
      }

      setError(
        "Unable to confirm your message. Please try again."
      );
    } catch (error) {
      console.error(
        "Verify contact error:",
        error
      );

      setError(
        "Unable to verify your email. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Request a new verification code
  ========================================================= */

  const handleResendCode = async () => {
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const message = form.message.trim();

    if (!name || !email || !message) {
      setError(
        "Your contact information is incomplete. Please start again."
      );

      setStep("form");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/contact/send-verification",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            message,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(
          data?.error ||
            "Unable to resend the verification code."
        );

        return;
      }

      setVerificationCode("");

      setSuccess(
        data?.message ||
          "A new verification code has been sent to your email address."
      );
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      setError(
        "Unable to resend the verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     Go back to contact form
  ========================================================= */

  const handleBackToForm = () => {
    if (loading) return;

    setStep("form");

    setVerificationCode("");

    setError("");
    setSuccess("");
  };

  /* =========================================================
     Render
  ========================================================= */

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">

        {/* ===================================================
            FORM STEP
        =================================================== */}

        {step === "form" && (
          <>
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Contact Us
            </h1>

            <p className="mb-8 text-sm text-gray-500">
              Have a question or need help? Send us a
              message and our team will get back to you.
            </p>

            <form
              onSubmit={handleSendVerification}
              className="space-y-6"
            >

              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    p-3
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                />
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="email"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    p-3
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  We'll send a verification code to this
                  email address.
                </p>
              </div>

              {/* Message */}

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  placeholder="Your message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  disabled={loading}
                  className="
                    w-full
                    resize-y
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    p-3
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                />
              </div>

              {/* Error */}

              {error && (
                <div
                  className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}

              {/* Success */}

              {success && (
                <div
                  className="
                    rounded-lg
                    border
                    border-green-200
                    bg-green-50
                    px-4
                    py-3
                    text-sm
                    text-green-700
                  "
                >
                  {success}
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  bg-indigo-600
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Sending verification code..."
                  : "Send Message"}
              </button>
            </form>
          </>
        )}

        {/* ===================================================
            VERIFICATION STEP
        =================================================== */}

        {step === "verification" && (
          <>
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Verify Your Email
            </h1>

            <p className="mb-2 text-sm text-gray-600">
              We've sent a 6-digit verification code to:
            </p>

            <p className="mb-8 font-medium text-gray-900">
              {form.email}
            </p>

            <form
              onSubmit={handleVerifyCode}
              className="space-y-6"
            >

              {/* Verification Code */}

              <div>
                <label
                  htmlFor="verificationCode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Verification Code
                </label>

                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
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
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    p-3
                    text-center
                    text-xl
                    font-semibold
                    tracking-[0.4em]
                    text-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400
                    placeholder:tracking-normal
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-100
                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                />

                <p className="mt-2 text-xs text-gray-400">
                  The verification code expires in 10
                  minutes.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div
                  className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}

              {/* Success */}

              {success && (
                <div
                  className="
                    rounded-lg
                    border
                    border-green-200
                    bg-green-50
                    px-4
                    py-3
                    text-sm
                    text-green-700
                  "
                >
                  {success}
                </div>
              )}

              {/* Verify */}

              <button
                type="submit"
                disabled={
                  loading ||
                  verificationCode.length !== 6
                }
                className="
                  w-full
                  rounded-lg
                  bg-indigo-600
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Verifying..."
                  : "Verify & Send Message"}
              </button>

              {/* Resend */}

              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  py-3
                  font-medium
                  text-gray-700
                  transition
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                Resend Code
              </button>

              {/* Back */}

              <button
                type="button"
                onClick={handleBackToForm}
                disabled={loading}
                className="
                  w-full
                  py-2
                  text-sm
                  text-gray-500
                  transition
                  hover:text-gray-800
                  disabled:cursor-not-allowed
                "
              >
                ← Back to Contact Form
              </button>
            </form>
          </>
        )}

      </div>
    </main>
  );
}