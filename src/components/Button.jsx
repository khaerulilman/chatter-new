export default function Button({ name, type = "button" }) {
  return (
    <button
      type={type}
      className="flex justify-center text-white text-2xl bg-teal-800 border border-teal-600 text-center p-2 rounded-lg"
    >
      {name}
    </button>
  );
}
