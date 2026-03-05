export default function Input({icon, placeholder, type, value, onChange, disabled = false}) {
  return (
    <div className="flex p-3 items-center gap-3 bg-cyan-900 border-2 border-cyan-700 rounded-xl disabled:opacity-50">
      <i className= {`text-white ml-2 ${icon}`}></i>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-transparent placeholder:text-white outline-none w-full text-white disabled:cursor-not-allowed"
      />
    </div>
  );
}
