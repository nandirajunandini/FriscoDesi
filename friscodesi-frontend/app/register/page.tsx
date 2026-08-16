"use client";

import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function handleEmailChange(email: string) {
    setForm({ ...form, email });
    setEmailError("");
    setOtpError("");
    setOtpMessage("");
    setOtp("");
    setOtpRequested(false);
    setEmailVerified(false);
    setVerificationToken("");
  }

  async function requestOtp() {
    const email = form.email.trim();

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setError("");
    setEmailError("");
    setOtpError("");
    setOtpMessage("");
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/auth/request-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEmailError(data.error || "Unable to send an OTP.");
        return;
      }

      setOtpRequested(true);
      setOtpMessage("OTP sent. Check your email and enter the 6-digit code.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function verifyOtp(code: string) {
    if (isVerifyingOtp || emailVerified || code.length !== 6) return;

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), otp: code }),
      });
      const data = await res.json();

      if (!res.ok || !data.verificationToken) {
        setOtpError("Entered OTP is invalid");
        return;
      }

      setEmailVerified(true);
      setVerificationToken(data.verificationToken);
      setOtpMessage("Email verified.");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!emailVerified || !verificationToken) {
      setError("Please verify your email address with the OTP.");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, verificationToken }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-10 rounded-xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        {error && (
          <p className="text-red-500 mb-4 text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Username"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="min-w-0 flex-1 border p-3 rounded"
                value={form.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label="Send email verification OTP"
                title="Send verification OTP"
                onClick={requestOtp}
                disabled={isSendingOtp || emailVerified}
                className="w-12 rounded border border-indigo-600 text-xl font-bold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSendingOtp ? "…" : "✓"}
              </button>
            </div>
            {emailError && <p className="mt-1 text-sm text-red-500">{emailError}</p>}
          </div>

          {otpRequested && (
            <div>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter OTP"
                className="w-full border p-3 rounded"
                value={otp}
                onChange={(e) => {
                  const code = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(code);
                  setOtpError("");
                  if (code.length === 6) void verifyOtp(code);
                }}
                disabled={emailVerified || isVerifyingOtp}
              />
              {otpError && <p className="mt-1 text-sm text-red-500">Entered OTP is invalid</p>}
              {otpMessage && (
                <p className={`mt-1 text-sm ${emailVerified ? "text-green-600" : "text-gray-600"}`}>
                  {otpMessage}
                </p>
              )}
            </div>
          )}

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 rounded"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition">
            Register
          </button>
        </form>
      </motion.div>
    </div>
  );
}
