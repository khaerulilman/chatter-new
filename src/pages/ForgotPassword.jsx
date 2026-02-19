import { useState } from "react";
import axios from "axios";
import { authAPI } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      await authAPI.forgotPassword({ email });

      // Save email and set cooldown in localStorage
      localStorage.setItem("forgotPasswordEmail", email);
      const cooldownExpires = Date.now() + 60 * 1000;
      localStorage.setItem("forgotPasswordCooldownTime", cooldownExpires);

      navigate("/forgot-password/verify");
    } catch (error) {
      console.error("Forgot password error:", error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to send OTP");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-950 flex justify-center items-center py-6 p-4">
      <div className="bg-gray-900 rounded-lg flex flex-col h-auto max-w-md w-full items-center text-white justify-center p-6">
        <i className="fa-solid fa-lock text-9xl text-teal-700 m-6"></i>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4 text-center">
          Forgot Password
        </h2>
        <p className="text-base w-full text-center text-gray-400 mb-7">
          Enter your registered email address and we'll send you a verification
          code to reset your password.
        </p>

        <form onSubmit={handleSendOtp} className="flex flex-col w-full gap-2">
          <p className="items-start flex text-sm">Email Address</p>
          <input
            type="email"
            className="w-full p-3 bg-gray-800 rounded-lg outline-none focus:border focus:border-gray-600 text-white placeholder-gray-500"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

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
            className="flex justify-center text-white text-lg bg-teal-800 border border-teal-600 text-center p-2 rounded-lg mt-4 hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-400">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-teal-400 hover:text-teal-300 transition"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
