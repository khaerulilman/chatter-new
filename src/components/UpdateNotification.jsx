import { useState, useEffect, useRef } from "react";

const POLL_INTERVAL = 60_000; // check every 60 seconds

export default function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialBuildId = useRef(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch("/version.json?t=" + Date.now());
        if (!res.ok) return;
        const data = await res.json();

        if (!initialBuildId.current) {
          // first fetch – store the current build id
          initialBuildId.current = data.buildId;
          return;
        }

        if (data.buildId !== initialBuildId.current) {
          setUpdateAvailable(true);
        }
      } catch {
        // network error – ignore silently
      }
    };

    checkVersion();
    const id = setInterval(checkVersion, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white text-center py-2.5 px-4 flex items-center justify-center gap-3 shadow-lg text-sm font-medium">
      <i className="fa-solid fa-rotate"></i>
      <span>A new version is available!</span>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-red-600 font-bold px-4 py-1 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Refresh Now
      </button>
    </div>
  );
}
