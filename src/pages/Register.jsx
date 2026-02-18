import React, { useState } from "react";
import axios from "axios";
import Input from "../components/Input";
import ButtonRegister from "../components/Button";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../api/api";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.register({
        name,
        username,
        email,
        password,
      });

      console.log("Registration success:", response.data);
      localStorage.setItem("registeredEmail", email);
      navigate("/otp");
    } catch (error) {
      console.error("Registration error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Registration failed";
        setError(message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-gray-950 flex items-center justify-center py-6">
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <h3 className="text-4xl text-left text-white mb-6">Register</h3>
            <Input
              icon="fa-solid fa-user"
              placeholder="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <Input
              icon="fa-solid fa-at"
              placeholder="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <Input
              icon="fa-solid fa-envelope"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              icon="fa-solid fa-lock"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 p-3 rounded">
                {error}
              </div>
            )}
            <ButtonRegister
              name={loading ? "Loading..." : "Sign Up"}
              type="submit"
              disabled={loading}
            />
          </form>
          <br></br>
          <p className="flex gap-1 text-base text-white text-center">
            have an account?
            <Link
              to="/login"
              className="text-teal-400 hover:text-teal-300 transition"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
