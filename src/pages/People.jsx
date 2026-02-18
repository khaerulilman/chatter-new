import React, { useEffect, useState } from "react";
import { usersAPI } from "../api/api";
import CardPeople from "../components/CardPeople";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function People() {
  const { user } = useAuth();
  const [people, setPeople] = useState([]); // State untuk menyimpan data pengguna

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await usersAPI.getUsers();
        setPeople(response.data.data); // Simpan data pengguna ke state
      } catch (error) {
        console.error("Error fetching people data:", error);
      }
    };

    fetchPeople();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
        <i className="fa-solid fa-users text-5xl text-gray-600"></i>
        <div className="text-center">
          <p className="text-white text-lg font-medium">
            Temukan Pengguna Lainnya
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Login untuk melihat dan terhubung dengan pengguna lain
          </p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Link
            to="/login"
            className="flex-1 text-center bg-teal-700 hover:bg-teal-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 text-center bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {people.map((person) => (
        <CardPeople key={person.id} person={person} />
      ))}
    </>
  );
}
