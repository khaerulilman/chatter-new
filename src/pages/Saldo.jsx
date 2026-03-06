import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../context/AuthContext";

// ─── Dummy data ──────────────────────────────────────────────────
const DUMMY_BALANCE = 100000;

const DUMMY_TIPS = [
  {
    id: 1,
    type: "out",
    user: "john_doe",
    amount: 5000,
    date: "2026-03-05T14:30:00Z",
    note: "Great post!",
  },
  {
    id: 2,
    type: "in",
    user: "jane_smith",
    amount: 10000,
    date: "2026-03-04T09:15:00Z",
    note: "Love your content",
  },
  {
    id: 3,
    type: "out",
    user: "mike_dev",
    amount: 2000,
    date: "2026-03-03T18:45:00Z",
    note: "Helpful thread",
  },
  {
    id: 4,
    type: "in",
    user: "sarah_writes",
    amount: 15000,
    date: "2026-03-02T12:00:00Z",
    note: "Amazing artwork",
  },
  {
    id: 5,
    type: "out",
    user: "alex_k",
    amount: 3000,
    date: "2026-03-01T20:30:00Z",
    note: "Keep it up!",
  },
];

const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    type: "topup",
    amount: 50000,
    date: "2026-03-05T10:00:00Z",
    method: "Bank Transfer",
    status: "success",
  },
  {
    id: 2,
    type: "withdraw",
    amount: 20000,
    date: "2026-03-04T16:30:00Z",
    method: "E-Wallet",
    status: "success",
  },
  {
    id: 3,
    type: "topup",
    amount: 100000,
    date: "2026-03-03T08:20:00Z",
    method: "Bank Transfer",
    status: "success",
  },
  {
    id: 4,
    type: "withdraw",
    amount: 30000,
    date: "2026-03-02T14:10:00Z",
    method: "Bank Transfer",
    status: "pending",
  },
  {
    id: 5,
    type: "topup",
    amount: 25000,
    date: "2026-03-01T11:45:00Z",
    method: "E-Wallet",
    status: "success",
  },
];

// ─── Format currency ─────────────────────────────────────────────
function formatRupiah(amount) {
  return "Rp. " + amount.toLocaleString("id-ID");
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

// ─── Tip Activity Item ──────────────────────────────────────────
function TipItem({ tip }) {
  const isOut = tip.type === "out";
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isOut ? "bg-red-500/20" : "bg-green-500/20"
        }`}
      >
        <i
          className={`fa-solid ${isOut ? "fa-arrow-up-right text-red-400" : "fa-arrow-down-left text-green-400"} text-sm`}
        ></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          {isOut ? (
            <>
              Tip to <span className="font-semibold">@{tip.user}</span>
            </>
          ) : (
            <>
              Tip from <span className="font-semibold">@{tip.user}</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{tip.note}</p>
        <p className="text-xs text-gray-600 mt-0.5">{formatDate(tip.date)}</p>
      </div>
      <span
        className={`text-sm font-semibold ${isOut ? "text-red-400" : "text-green-400"}`}
      >
        {isOut ? "-" : "+"}
        {formatRupiah(tip.amount)}
      </span>
    </div>
  );
}

// ─── Transaction History Item ───────────────────────────────────
function TransactionItem({ tx }) {
  const isTopUp = tx.type === "topup";
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
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
        <p className="text-xs text-gray-500 mt-0.5">{tx.method}</p>
        <p className="text-xs text-gray-600 mt-0.5">{formatDate(tx.date)}</p>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-semibold ${isTopUp ? "text-green-400" : "text-red-400"}`}
        >
          {isTopUp ? "+" : "-"}
          {formatRupiah(tx.amount)}
        </span>
        <p
          className={`text-xs mt-0.5 ${tx.status === "success" ? "text-green-500" : "text-yellow-500"}`}
        >
          {tx.status === "success" ? "Success" : "Pending"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function Saldo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tips");

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

      {/* Balance Card */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-lg">
          <p className="text-gray-400 text-sm">Total Saldo</p>
          <p className="text-white text-3xl font-bold mt-1">
            {formatRupiah(DUMMY_BALANCE)}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-5">
            <button className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md">
              <i className="fa-solid fa-plus"></i>
              Top Up
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md border border-gray-600">
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab("tips")}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            activeTab === "tips"
              ? "text-teal-400 border-b-2 border-teal-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <i className="fa-solid fa-hand-holding-heart mr-2"></i>
          Tip Activity
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            activeTab === "transactions"
              ? "text-teal-400 border-b-2 border-teal-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <i className="fa-solid fa-clock-rotate-left mr-2"></i>
          Transaction History
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        {activeTab === "tips" ? (
          DUMMY_TIPS.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
              <i className="fa-solid fa-hand-holding-heart text-3xl"></i>
              <p className="text-sm">No tip activity yet</p>
            </div>
          ) : (
            DUMMY_TIPS.map((tip) => <TipItem key={tip.id} tip={tip} />)
          )
        ) : DUMMY_TRANSACTIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
            <i className="fa-solid fa-receipt text-3xl"></i>
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          DUMMY_TRANSACTIONS.map((tx) => (
            <TransactionItem key={tx.id} tx={tx} />
          ))
        )}
      </div>
    </MainLayout>
  );
}
