import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";
import { walletAPI, tipsAPI } from "../api/api";
import Loading from "../components/Loading";
import { useToast } from "../components/Toast";

// ─── Top-up amount options ───────────────────────────────────────
const TOPUP_OPTIONS = [
  { label: "Rp 10.000", value: 10000 },
  { label: "Rp 20.000", value: 20000 },
  { label: "Rp 50.000", value: 50000 },
  { label: "Rp 100.000", value: 100000 },
  { label: "Rp 200.000", value: 200000 },
  { label: "Rp 500.000", value: 500000 },
];

// ─── Format currency ─────────────────────────────────────────────
function formatRupiah(amount) {
  return "Rp " + Number(amount).toLocaleString("id-ID");
}

// ─── Format date ─────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Status badge ────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    success: "text-green-400 bg-green-400/10",
    pending: "text-yellow-400 bg-yellow-400/10",
    failed: "text-red-400 bg-red-400/10",
    expired: "text-gray-400 bg-gray-400/10",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.pending}`}
    >
      {status === "success"
        ? "Success"
        : status === "pending"
          ? "Pending"
          : status === "failed"
            ? "Failed"
            : "Expired"}
    </span>
  );
}

// ─── Transaction History Item ───────────────────────────────────
function TransactionItem({ tx, onResume }) {
  const isTopUp = tx.type === "topup";
  const isPending = tx.status === "pending";
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-700 hover:bg-gray-800/50 transition-colors ${isPending ? "cursor-pointer" : ""}`}
      onClick={() => isPending && onResume?.(tx)}
      title={isPending ? "Klik untuk lanjutkan pembayaran" : ""}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isTopUp ? "bg-teal-500/20" : "bg-orange-500/20"
        }`}
      >
        <i
          className={`fa-solid ${isTopUp ? "fa-wallet text-teal-400" : "fa-money-bill-transfer text-orange-400"} text-sm`}
        ></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">
          {isTopUp ? "Top Up" : "Withdraw"}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {isPending ? (
            <span className="text-yellow-400">
              <i className="fa-solid fa-arrow-pointer mr-1"></i>
              Klik untuk lanjutkan pembayaran
            </span>
          ) : (
            tx.payment_type || "—"
          )}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          {formatDate(tx.created_at)}
        </p>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${isTopUp ? "text-green-400" : "text-red-400"}`}
        >
          {isTopUp ? "+" : "-"}
          {formatRupiah(tx.amount)}
        </span>
        <div className="mt-1">
          <StatusBadge status={tx.status} />
        </div>
      </div>
    </div>
  );
}

// ─── Tip Activity Item ──────────────────────────────────────────
function TipItem({ tip, type }) {
  const isReceived = type === "received";
  const personName = isReceived ? tip.sender_name : tip.receiver_name;
  const personUsername = isReceived
    ? tip.sender_username
    : tip.receiver_username;
  const personPicture = isReceived
    ? tip.sender_profile_picture
    : tip.receiver_profile_picture;
  const postPreview = tip.post_content
    ? tip.post_content.length > 40
      ? tip.post_content.slice(0, 40) + "..."
      : tip.post_content
    : "Post";

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
        <img
          src={
            personPicture ||
            "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
          }
          alt={personName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">
          {isReceived ? (
            <>
              <span className="text-teal-400">@{personUsername}</span> memberi
              tip
            </>
          ) : (
            <>
              Tip ke <span className="text-teal-400">@{personUsername}</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{postPreview}</p>
        {tip.message && (
          <p className="text-xs text-gray-400 mt-0.5 italic">"{tip.message}"</p>
        )}
        <p className="text-xs text-gray-600 mt-0.5">
          {formatDate(tip.created_at)}
        </p>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${isReceived ? "text-green-400" : "text-red-400"}`}
        >
          {isReceived ? "+" : "-"}
          {formatRupiah(tip.amount)}
        </span>
      </div>
    </div>
  );
}

// ─── Top Up Modal ────────────────────────────────────────────────
function TopUpModal({ onClose, onSuccess }) {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const getAmount = () => {
    if (customAmount) return Number(customAmount);
    return selectedAmount;
  };

  const handleTopUp = async () => {
    const amount = getAmount();
    if (!amount || amount < 10000) {
      setError("Minimum top up Rp 10.000");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1) Create top-up transaction on backend
      const res = await walletAPI.createTopUp(amount);
      const { snap_token, order_id } = res.data.data;

      // Helper: verify payment status with backend then refresh
      const verifyAndRefresh = async () => {
        try {
          await walletAPI.verifyTopUp(order_id);
        } catch (e) {
          console.error("Verify error:", e);
        }
        onSuccess?.();
      };

      // 2) Open Midtrans Snap popup
      window.snap.pay(snap_token, {
        onSuccess: async () => {
          await verifyAndRefresh();
          onClose();
        },
        onPending: async () => {
          await verifyAndRefresh();
          onClose();
        },
        onError: () => {
          setError("Pembayaran gagal. Silakan coba lagi.");
          setIsProcessing(false);
        },
        onClose: async () => {
          // User closed popup — still verify in case payment went through
          await verifyAndRefresh();
          onClose();
        },
      });
    } catch (err) {
      console.error("Top up error:", err);
      setError(err.response?.data?.message || "Gagal membuat transaksi top up");
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-base">Top Up Saldo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Amount options */}
          <p className="text-gray-400 text-sm mb-3">Pilih nominal top up:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TOPUP_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setSelectedAmount(opt.value);
                  setCustomAmount("");
                  setError(null);
                }}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  selectedAmount === opt.value && !customAmount
                    ? "bg-teal-600 border-teal-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <p className="text-gray-400 text-sm mb-2">
            Atau masukkan nominal lain:
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-400 text-sm">Rp</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
                setError(null);
              }}
              placeholder="Min. 10.000"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors"
              min="10000"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-3">
              <i className="fa-solid fa-circle-exclamation mr-1"></i>
              {error}
            </p>
          )}

          {/* Confirm button */}
          <button
            onClick={handleTopUp}
            disabled={isProcessing || (!selectedAmount && !customAmount)}
            className="w-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Memproses...
              </span>
            ) : (
              <span>Top Up {getAmount() ? formatRupiah(getAmount()) : ""}</span>
            )}
          </button>

          <p className="text-gray-600 text-xs text-center mt-3">
            Pembayaran diproses melalui Midtrans (Sandbox)
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function Saldo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const showToast = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [tipsReceived, setTipsReceived] = useState([]);
  const [tipsSent, setTipsSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [snapReady, setSnapReady] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [tipsSubTab, setTipsSubTab] = useState("received");

  // Load Midtrans Snap.js script
  useEffect(() => {
    if (document.getElementById("midtrans-snap-script")) {
      setSnapReady(true);
      return;
    }

    const loadSnap = async () => {
      try {
        const res = await walletAPI.getMidtransClientKey();
        const clientKey = res.data.data.clientKey;

        const script = document.createElement("script");
        script.id = "midtrans-snap-script";
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", clientKey);
        script.onload = () => setSnapReady(true);
        document.head.appendChild(script);
      } catch (err) {
        console.error("Failed to load Midtrans Snap:", err);
      }
    };

    loadSnap();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [balanceRes, txRes, tipsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        tipsAPI.getActivity(),
      ]);
      setBalance(balanceRes.data.data.balance);
      setTransactions(txRes.data.data || []);
      setTipsReceived(tipsRes.data.data.received || []);
      setTipsSent(tipsRes.data.data.sent || []);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-verify if redirected back from Midtrans with order_id in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("order_id");
    if (orderId) {
      // Clean URL without reloading
      window.history.replaceState({}, "", "/saldo");
      // Verify the transaction
      walletAPI
        .verifyTopUp(orderId)
        .then(() => fetchData())
        .catch(console.error);
    }
  }, []);

  // Resume a pending transaction by reopening Midtrans Snap
  const handleResumePending = (tx) => {
    if (!snapReady || !tx.snap_token) return;

    const verifyAndRefresh = async () => {
      try {
        await walletAPI.verifyTopUp(tx.midtrans_order_id);
      } catch (e) {
        console.error("Verify error:", e);
      }
      fetchData();
    };

    window.snap.pay(tx.snap_token, {
      onSuccess: async () => await verifyAndRefresh(),
      onPending: async () => await verifyAndRefresh(),
      onError: async () => await verifyAndRefresh(),
      onClose: async () => await verifyAndRefresh(),
    });
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="py-3 px-4 text-white flex items-center gap-2 border-b border-gray-500">
        <button
          onClick={() => navigate("/")}
          className="hover:text-gray-400 transition duration-300"
        >
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <span className="text-lg font-semibold flex items-center gap-2">
          <i className="fa-solid fa-wallet"></i>
          Balance
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loading />
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="px-4 py-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-lg">
              <p className="text-gray-400 text-sm">Total Saldo</p>
              <p className="text-white text-3xl font-bold mt-1">
                {formatRupiah(balance)}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowTopUp(true)}
                  disabled={!snapReady}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md disabled:opacity-50"
                >
                  <i className="fa-solid fa-plus"></i>
                  Top Up
                </button>
                <button
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-gray-400 font-semibold py-2.5 rounded-xl transition-colors shadow-md border border-gray-600 cursor-not-allowed opacity-50"
                  title="Coming soon"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === "transactions"
                  ? "text-teal-400 border-b-2 border-teal-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left"></i>
              Transactions
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                activeTab === "tips"
                  ? "text-teal-400 border-b-2 border-teal-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-coins"></i>
              Tips Activity
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto scrollbar-hide">
            {activeTab === "transactions" ? (
              /* Transaction List */
              transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                  <i className="fa-solid fa-receipt text-3xl"></i>
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    tx={tx}
                    onResume={handleResumePending}
                  />
                ))
              )
            ) : (
              /* Tips Activity */
              <>
                {/* Sub-tabs: Received / Sent */}
                <div className="flex border-b border-gray-800">
                  <button
                    onClick={() => setTipsSubTab("received")}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                      tipsSubTab === "received"
                        ? "text-green-400 border-b-2 border-green-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <i className="fa-solid fa-arrow-down mr-1"></i>
                    Tip Masuk ({tipsReceived.length})
                  </button>
                  <button
                    onClick={() => setTipsSubTab("sent")}
                    className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                      tipsSubTab === "sent"
                        ? "text-red-400 border-b-2 border-red-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    <i className="fa-solid fa-arrow-up mr-1"></i>
                    Tip Keluar ({tipsSent.length})
                  </button>
                </div>

                {tipsSubTab === "received" ? (
                  tipsReceived.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                      <i className="fa-solid fa-coins text-3xl"></i>
                      <p className="text-sm">Belum ada tip masuk</p>
                    </div>
                  ) : (
                    tipsReceived.map((tip) => (
                      <TipItem key={tip.id} tip={tip} type="received" />
                    ))
                  )
                ) : tipsSent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                    <i className="fa-solid fa-coins text-3xl"></i>
                    <p className="text-sm">Belum ada tip keluar</p>
                  </div>
                ) : (
                  tipsSent.map((tip) => (
                    <TipItem key={tip.id} tip={tip} type="sent" />
                  ))
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Top Up Modal */}
      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSuccess={() => {
            fetchData();
            showToast("Top up successful!", "topup");
          }}
        />
      )}
    </MainLayout>
  );
}
