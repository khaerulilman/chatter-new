import React from "react";

export default function Loading({
  size = "md",
  text = "",
  fullHeight = false,
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const containerClass = fullHeight
    ? "flex flex-col items-center justify-center py-16"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClass}>
      <div
        className={`${sizeClasses[size]} border-2 border-teal-400 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-gray-400 text-sm mt-4">{text}</p>}
    </div>
  );
}
