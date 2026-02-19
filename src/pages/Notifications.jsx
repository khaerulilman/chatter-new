import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Search from "../components/Search";
import NewPost from "../components/NewPost";
import { notificationsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";

// ─── Helper: label + icon per notification type ─────────────────
const TYPE_META = {
  like: {
    icon: "fa-solid fa-heart text-pink-500",
    description: "liked your post",
  },
  comment: {
    icon: "fa-solid fa-comment text-blue-400",
    description: "commented on your post",
  },
  follow: {
    icon: "fa-solid fa-user-plus text-green-400",
    description: "started following you",
  },
  message: {
    icon: "fa-solid fa-envelope text-yellow-400",
    description: "sent you a message",
  },
};

// ─── Single notification row ─────────────────────────────────────
function NotificationItem({ notif, onDoubleClick }) {
  const meta = TYPE_META[notif.type] || {
    icon: "fa-solid fa-bell text-gray-400",
    description: "interacted with you",
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div
      onDoubleClick={() => onDoubleClick(notif)}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-700 hover:bg-gray-800 transition-colors duration-200 ${
        !notif.is_read ? "bg-gray-800/60" : ""
      }`}
      title="Double-click to open"
    >
      {/* Actor avatar */}
      <div className="flex-shrink-0 relative">
        <img
          src={
            notif.actor_avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.actor_name)}&background=374151&color=fff`
          }
          alt={notif.actor_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        {/* Type badge */}
        <span
          className={`absolute -bottom-1 -right-1 bg-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs`}
        >
          <i className={meta.icon + " text-[10px]"}></i>
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white">
          <span className="font-semibold">{notif.actor_name}</span>{" "}
          <span className="text-gray-300">{meta.description}</span>
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {timeAgo(notif.created_at)}
        </p>

        {/* Redirect hint */}
        <p className="text-xs text-gray-600 mt-0.5 italic">
          {notif.type === "like" || notif.type === "comment"
            ? "Double-click → go to post"
            : "Double-click → go to profile"}
        </p>
      </div>

      {/* Unread dot */}
      {!notif.is_read && (
        <span className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-blue-500"></span>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────
export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isMobile = window.innerWidth < 600;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getNotifications();
      setNotifications(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /** Double-click: mark as read then navigate */
  const handleDoubleClick = async (notif) => {
    // Mark as read optimistically
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
      );
      try {
        await notificationsAPI.markRead(notif.id);
      } catch (e) {
        console.error("Failed to mark notification as read:", e);
      }
    }

    // Navigate
    if (notif.type === "like" || notif.type === "comment") {
      navigate(`/posts/${notif.entity_id}`);
    } else if (notif.type === "follow" || notif.type === "message") {
      navigate(`/profile/${notif.actor_username}`);
    }
  };

  /** Mark all as read */
  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await notificationsAPI.markAllRead();
    } catch (e) {
      console.error("Failed to mark all read:", e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar />
        <div className="h-screen flex gap-2 max-lg:gap-0 justify-center">
          {/* Left panel */}
          <div className="flex flex-col max-md:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3">
            <Search />
            {!isMobile && <NewPost disabled={isMobile} />}
          </div>

          {/* Center panel */}
          <div className="flex flex-col w-5/12 xl:border xl:border-gray-500 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3">
            {/* Header */}
            <div className="py-3 px-4 text-white flex items-center justify-between border-b border-gray-500">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="hover:text-gray-400 transition duration-300"
                >
                  <i className="fa-solid fa-arrow-left text-lg"></i>
                </button>
                <span className="text-lg font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-bell"></i>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto scrollbar-hide">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <i className="fa-solid fa-spinner fa-spin text-white text-3xl"></i>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 mt-10 px-4">
                  {error}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                  <i className="fa-solid fa-bell-slash text-3xl"></i>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notif={notif}
                    onDoubleClick={handleDoubleClick}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="max-md:block max-md:h-full max-lg:w-16 w-1/6">
            <Sidebar />
          </div>
        </div>
      </section>
    </>
  );
}
