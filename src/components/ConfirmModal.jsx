import { useEffect } from "react";

export default function ConfirmModal({
  show,
  title = "Confirm",
  message = "Are you sure?",
  icon = "fa-triangle-exclamation",
  iconColor = "text-yellow-400",
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmColor = "bg-red-600 hover:bg-red-500",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!show) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div
        className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex flex-col items-center pt-6 pb-2 px-5">
          <div
            className={`w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-3`}
          >
            <i className={`fa-solid ${icon} text-2xl ${iconColor}`}></i>
          </div>
          <h3 className="text-white font-semibold text-lg text-center">
            {title}
          </h3>
          <p className="text-gray-400 text-sm text-center mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-medium text-sm transition-colors ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
