import React from "react";

export default function TipModal({
  showTipModal,
  setShowTipModal,
  post,
  tipAmount,
  setTipAmount,
  tipMessage,
  setTipMessage,
  tipLoading,
  tipError,
  setTipError,
  tipSuccess,
  setTipSuccess,
  handleSendTip,
}) {
  if (!showTipModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowTipModal(false);
        }
      }}
    >
      <div
        className="flex flex-col w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <i className="fa-solid fa-coins text-teal-400"></i>
            Beri Tip
          </h2>
          <button
            onClick={() => setShowTipModal(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-gray-400 text-sm mb-1">
            Tip untuk{" "}
            <span className="text-white font-medium">{post.user_name}</span>
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Min. Rp 1.000 — Max. Rp 100.000
          </p>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1000, 5000, 10000, 25000, 50000, 75000, 100000].map((val) => (
              <button
                key={val}
                onClick={() => {
                  setTipAmount(String(val));
                  setTipError(null);
                }}
                className={`py-2 rounded-lg text-xs font-medium transition-colors border ${
                  Number(tipAmount) === val
                    ? "bg-teal-600 border-teal-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                {val >= 1000 ? `${val / 1000}K` : val}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-gray-400 text-sm">Rp</span>
            <input
              type="number"
              value={tipAmount}
              onChange={(e) => {
                setTipAmount(e.target.value);
                setTipError(null);
              }}
              placeholder="Jumlah tip"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors"
              min="1000"
              max="100000"
            />
          </div>

          {/* Optional message */}
          <input
            type="text"
            value={tipMessage}
            onChange={(e) => setTipMessage(e.target.value)}
            placeholder="Pesan (opsional)"
            maxLength={100}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors mb-3"
          />

          {tipError && (
            <p className="text-red-400 text-sm mb-3">
              <i className="fa-solid fa-circle-exclamation mr-1"></i>
              {tipError}
            </p>
          )}

          {tipSuccess && (
            <p className="text-green-400 text-sm mb-3">
              <i className="fa-solid fa-check-circle mr-1"></i>
              {tipSuccess}
            </p>
          )}

          <button
            onClick={handleSendTip}
            disabled={tipLoading || !tipAmount}
            className="w-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tipLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Mengirim...
              </span>
            ) : (
              <span>
                Kirim Tip
                {tipAmount
                  ? ` Rp ${Number(tipAmount).toLocaleString("id-ID")}`
                  : ""}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
