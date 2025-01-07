import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Otp() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil email dari localStorage
    const registeredEmail = localStorage.getItem("registeredEmail");
    if (!registeredEmail) {
      alert("No email found. Please register first.");
      navigate("/register"); // Redirect jika email tidak ditemukan
    } else {
      setEmail(registeredEmail); // Simpan email ke state
    }
  }, [navigate]);

  const handleOtp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://chatter-imagekit-frmxr41wo-khaerulilmans-projects.vercel.app/api/auth/verify-otp",
        {
          email,
          otp
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log("Otp Success verified: ", response.data);
      localStorage.removeItem("registerEmail");
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data?.message || "Otp failed");
      }
    }
  };

  return (
    <section className="h-screen bg-gray-950 flex justify-center items-center p-4">
      <div className="bg-gray-900 rounded-lg flex flex-col h-auto max-w-md w-full items-center text-white justify-center p-6">
        <i className="fa-regular fa-paper-plane text-9xl text-teal-700 m-6"></i>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4 text-center">
          An OTP has been sent to your email
        </h2>
        <p className="text-lg w-full text-center mb-7">
          Check the email that associated with your account for the verification
          code
        </p>
        <form onSubmit={handleOtp} className="flex flex-col w-full gap-2">
          <p className="items-start flex">Verification Code</p>
          <input
            type="text"
            className="w-full p-3 bg-gray-800 rounded-lg outline-none focus:border focus:border-gray-600"
            placeholder="Enter your verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            type="submit"
            className="flex justify-center text-white text-xl bg-teal-800 border border-teal-600 text-center p-2 rounded-lg mt-2"
          >
            Verify
          </button>
        </form>
      </div>
    </section>
  );
}