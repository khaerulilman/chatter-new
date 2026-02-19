import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { authAPI } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPasswordVerify() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("forgotPasswordEmail");
    if (!savedEmail) {
      navigate("/forgot-password");
      return;
    }
    setEmail(savedEmail);

    // Check cooldown from localStorage
    const cooldownTime = localStorage.getItem("forgotPasswordCooldownTime");
    if (cooldownTime) {
      const now = Date.now();
      const cooldownExpiredTime = parseInt(cooldownTime);
      const remainingTime = Math.ceil((cooldownExpiredTime - now) / 1000);

      if (remainingTime > 0) {
        setResendCooldown(remainingTime);
      } else {
        localStorage.removeItem("forgotPasswordCooldownTime");
        setResendCooldown(0);
      }
    } else {
      // Set initial 1 minute cooldown after sending OTP
      const cooldownExpires = Date.now() + 60 * 1000;
      localStorage.setItem("forgotPasswordCooldownTime", cooldownExpires);
      setResendCooldown(60);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate]);

  // Handle countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      intervalRef.current = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [resendCooldown]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the OTP code");
      return;
    }
    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword({ email, otp, newPassword });

      setSuccess("Password berhasil diubah! Redirecting to login...");
      localStorage.removeItem("forgotPasswordEmail");
      localStorage.removeItem("forgotPasswordCooldownTime");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password failed:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to reset password");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authAPI.resendForgotPasswordOtp({ email });

      setSuccess("OTP baru telah dikirim ke email Anda.");

      // Reset cooldown
      const cooldownExpires = Date.now() + 60 * 1000;
      localStorage.setItem("forgotPasswordCooldownTime", cooldownExpires);
      setResendCooldown(60);
    } catch (error) {
      console.error("Resend OTP failed:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to resend OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-950 flex justify-center items-center py-6 p-4">
      <div className="bg-gray-900 rounded-lg flex flex-col h-auto max-w-md w-full items-center text-white justify-center p-6">
        <i className="fa-solid fa-shield-halved text-9xl text-teal-700 m-6"></i>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4 text-center">
          Reset Password
        </h2>
        <p className="text-base w-full text-center text-gray-400 mb-7">
          Enter the verification code sent to{" "}
          <span className="text-teal-400">{email}</span> and your new password.
        </p>

        <form
          onSubmit={handleResetPassword}
          className="flex flex-col w-full gap-3"
        >
          {/* OTP Input */}
          <div className="flex flex-col gap-1">
            <p className="items-start flex text-sm">Verification Code</p>
            <input
              type="text"
              className="w-full p-3 bg-gray-800 rounded-lg outline-none focus:border focus:border-gray-600 text-white placeholder-gray-500"
              placeholder="Enter 6-digit OTP code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              maxLength="6"
            />
          </div>

          {/* New Password Input */}
          <div className="flex flex-col gap-1">
            <p className="items-start flex text-sm">New Password</p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-3 bg-gray-800 rounded-lg outline-none focus:border focus:border-gray-600 text-white placeholder-gray-500 pr-10"
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-1">
            <p className="items-start flex text-sm">Confirm New Password</p>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 bg-gray-800 rounded-lg outline-none focus:border focus:border-gray-600 text-white placeholder-gray-500"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 p-3 rounded text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex justify-center text-white text-lg bg-teal-800 border border-teal-600 text-center p-2 rounded-lg mt-2 hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || loading}
            className="text-teal-400 hover:text-teal-300 transition disabled:text-gray-500"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>

        <div className="mt-3 text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-gray-500 hover:text-gray-400 transition"
          >
            ← Use a different email
          </Link>
        </div>
      </div>
    </section>
  );
}
