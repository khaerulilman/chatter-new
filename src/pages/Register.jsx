import React, { useState } from "react";
import Input from "../components/Input";
import ButtonRegister from "../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Otp success: ${response.data}`);
      localStorage.setItem("registeredEmail", email);
      navigate("/otp");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <>
      <section className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-full max-w-md p-6 rounded-lg shadow-lg">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <h3 className="text-4xl text-left text-white mb-6">Register</h3>
            <Input
              icon="fa-solid fa-user"
              placeholder="Username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              icon="fa-solid fa-envelope"
              placeholder="Email"
              type="email"
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
            {error && <p className="text-red-500">{error}</p>}
            <ButtonRegister name={"Sign Up"} type="submit" />
          </form>
        </div>
      </section>
    </>
  );
}
