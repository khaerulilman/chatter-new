

interface ButtonProps {
  name: string; // Tipe untuk nama tombol
  type?: "button" | "submit" | "reset"; // Tipe untuk jenis tombol, bersifat opsional
}

export default function Button({ name, type = "button" }: ButtonProps) { // Menetapkan default type
  return (
    <button type={type} className="flex justify-center text-white text-2xl bg-teal-800 border border-teal-600 text-center p-2 rounded-lg">
      {name}
    </button>
  );
}
