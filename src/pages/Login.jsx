import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import ButtonLogin from "../components/Button";
import axios from "axios";
import { useUser } from "../UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser(); // Access the user context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      const result = response.data;

      // Simpan user data beserta token
      setUser({
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        profile_picture: result.data.profile_picture,
        header_picture: result.data.header_picture,
        created_at: result.data.created_at,
        token: result.token,
      });

      // Redirect ke halaman utama
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Terjadi kesalahan saat login");
    }
  };

  return (
    <section className="h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <h3 className="text-4xl text-left text-white mb-6">Login</h3>
          <Input
            icon="fa-solid fa-user"
            placeholder="Email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon="fa-solid fa-lock"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-right text-white">Forgot Password?</p>
          {error && <p className="text-red-500">{error}</p>}
          <ButtonLogin name={"Sign In"} type="submit" />
          <p className="flex gap-1 text-base text-white text-center">
            Don't have an account?
            <Link
              to="/register"
              className="hover:underline transition duration-300"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
