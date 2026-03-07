import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

const ToastContext = createContext(null);

const ICONS = {
  like: "fa-heart",
  comment: "fa-comment",
  post: "fa-pen-to-square",
  profile: "fa-user-check",
  tip: "fa-coins",
  topup: "fa-wallet",
  save: "fa-bookmark",
  delete: "fa-trash",
  success: "fa-check-circle",
  error: "fa-circle-exclamation",
};

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icon = ICONS[toast.type] || ICONS.success;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/95 border border-teal-500/30 shadow-lg shadow-teal-500/10 backdrop-blur-md max-w-sm w-full transition-all duration-300 ${
        exiting
          ? "opacity-0 translate-x-full"
          : "opacity-100 translate-x-0 animate-[slideIn_0.3s_ease-out]"
      }`}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-500/15 flex items-center justify-center">
        <i className={`fa-solid ${icon} text-teal-300 text-sm`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-teal-300 text-sm font-medium leading-snug truncate">
          {toast.message}
        </p>
        {toast.description && (
          <p className="text-gray-400 text-xs mt-0.5 truncate">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
      >
        <i className="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success", description = null) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [
        ...prev.slice(-4),
        { id, message, type, description },
      ]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
