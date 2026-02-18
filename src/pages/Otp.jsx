import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { authAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  useEffect(() => {
    // Ambil email dari localStorage
    const registeredEmail = localStorage.getItem("registeredEmail");
    if (!registeredEmail) {
      alert("No email found. Please register first.");
      navigate("/register");
    } else {
      setEmail(registeredEmail);

      // Check if there's a resend cooldown in localStorage
      const resendCooldownTime = localStorage.getItem("resendCooldownTime");
      if (resendCooldownTime) {
        const now = Date.now();
        const cooldownExpiredTime = parseInt(resendCooldownTime);
        const remainingTime = Math.ceil((cooldownExpiredTime - now) / 1000);

        if (remainingTime > 0) {
          setResendCooldown(remainingTime);
        } else {
          // Cooldown expired
          localStorage.removeItem("resendCooldownTime");
          setResendCooldown(0);
        }
      } else {
        // Set cooldown for the first time (1 minute)
        const cooldownExpires = Date.now() + 60 * 1000;
        localStorage.setItem("resendCooldownTime", cooldownExpires);
        setResendCooldown(60);
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate]);

  const handleOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!otp.trim()) {
        setError("Please enter the OTP code");
        setLoading(false);
        return;
      }

      const response = await authAPI.verifyOtp({
        email,
        otp,
      });
      console.log("Otp Success verified:", response.data);
      localStorage.removeItem("registeredEmail");
      localStorage.removeItem("resendCooldownTime");
      navigate("/login");
    } catch (error) {
      console.error("Otp verification failed:", error);
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message || "OTP verification failed";
        setError(message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError("");

    try {
      await authAPI.resendOtp({ email });

      // Set cooldown for 1 minute and save to localStorage
      const cooldownExpires = Date.now() + 60 * 1000;
      localStorage.setItem("resendCooldownTime", cooldownExpires);
      setResendCooldown(60); // 1 minute rate limiting before next resend
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
        <i className="fa-regular fa-paper-plane text-9xl text-teal-700 m-6"></i>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4 text-center">
          Verify Your Email
        </h2>
        <p className="text-lg w-full text-center mb-7">
          Check the email associated with your account for the verification code
        </p>
        <form onSubmit={handleOtp} className="flex flex-col w-full gap-2">
          <p className="items-start flex text-sm">Verification Code</p>
          <input
            type="text"
            className="w-full p-3 bg-gray-800 rounded-lg outline-none focus:border focus:border-gray-600 text-white placeholder-gray-500"
            placeholder="Enter your verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
            maxLength="6"
          />
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-3 rounded text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center text-white text-lg bg-teal-800 border border-teal-600 text-center p-2 rounded-lg mt-4 hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

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
      </div>
    </section>
  );
}
