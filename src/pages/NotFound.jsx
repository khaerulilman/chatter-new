import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <MainLayout>
      {/* NotFound Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-white p-8">
        <div className="text-center space-y-6">
          <i className="fa-solid fa-exclamation-triangle text-6xl text-gray-400 mb-4"></i>
          <h1 className="text-4xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-400">
            Page Not Found
          </h2>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been
            moved, deleted, or you entered the wrong URL.
          </p>
          <button
            onClick={handleGoHome}
            className="bg-teal-700 hover:bg-teal-600 transition-colors duration-300 px-8 py-3 rounded-lg font-medium text-white mt-6 flex items-center gap-2 mx-auto"
          >
            <i className="fa-solid fa-home"></i>
            Go to Home
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
