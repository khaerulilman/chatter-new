import React, { useEffect, useState } from "react";
import axios from "axios"; // Pastikan axios sudah terinstal
import CardPeople from "../components/CardPeople";

export default function People() {
  const [people, setPeople] = useState([]); // State untuk menyimpan data pengguna

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await axios.get("https://chatter-imagekit-frmxr41wo-khaerulilmans-projects.vercel.app/api/auth/users"); // Ganti dengan URL backend Anda
        setPeople(response.data.users); // Simpan data pengguna ke state
      } catch (error) {
        console.error("Error fetching people data:", error);
      }
    };

    fetchPeople();
  }, []);

  return (
    <>
      {people.map((person) => (
        <CardPeople key={person.id} person={person} /> // Render CardPeople untuk setiap pengguna
      ))}
    </>
  );
}
