import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { notificationsAPI } from "../api/api";

/**
 * Shared profile UI for New Post context.
 *
 * Props
 * - user: current user object (or null)
 * - onClose: callback to close parent modal (optional)
 * - variant: "card" (default) or "avatar"
 */
export default function NewPostProfile({ user, onClose, variant = "card" }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: "home",
      icon: "fa-house",
      label: "Home",
      path: "/",
      requiresAuth: false,
    },
    {
      id: "messages",
      icon: "fa-message",
      label: "Messages",
      path: "/chats",
      requiresAuth: true,
    },
    {
      id: "notifications",
      icon: "fa-bell",
      label: "Notifications",
      path: "/notifications",
      requiresAuth: true,
      badge: unreadCount,
    },
    {
      id: "profile",
      icon: "fa-user",
      label: "Profile",
      path: user?.username ? `/profile/${user.username}` : "/profile",
      requiresAuth: true,
    },
    {
      id: "balance",
      icon: "fa-wallet",
      label: "Balance",
      path: "/saldo",
      requiresAuth: true,
    },
    {
      id: "settings",
      icon: "fa-gear",
      label: "Settings",
      path: "/edit-profile",
      requiresAuth: true,
    },
  ];

  // Poll unread notifications when avatar variant is used
  useEffect(() => {
    if (variant !== "avatar" || !user?.id) return;
    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getUnreadCount();
        setUnreadCount(res.data?.unreadCount ?? 0);
      } catch {
        /* ignore */
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [variant, user?.id]);

  // Clear badge when navigating to notifications
  useEffect(() => {
    if (location.pathname === "/notifications") setUnreadCount(0);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleNav = (item) => {
    if (item.requiresAuth && !user?.id) {
      navigate("/login");
    } else {
      navigate(item.path);
    }
    setDropdownOpen(false);
  };

  if (variant === "avatar") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="block"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <i className="fa-solid fa-user text-sm"></i>
              </div>
            )}
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-lg py-2 z-[60]">
            {navItems.map((item) => {
              const isActive =
                item.id === "home"
                  ? location.pathname === "/"
                  : item.id === "profile"
                    ? location.pathname.startsWith("/profile")
                    : location.pathname.startsWith(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                    isActive
                      ? "text-teal-400 bg-gray-800/50"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="relative">
                    <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                    {item.id === "notifications" && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="gap-3 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors w-full">
        <div className="flex gap-2">
          <Link
            to="/login"
            onClick={() => onClose?.()}
            className="flex-1 text-center bg-teal-700 hover:bg-teal-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            onClick={() => onClose?.()}
            className="flex-1 text-center bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center gap-3 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors w-full"
        onClick={() => onClose?.()}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={
              user.profile_picture ||
              "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
            }
            alt={user.name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-white font-medium leading-tight">{user.name}</p>
          <p className="text-gray-400 text-sm leading-tight">
            @{user.username}
          </p>
        </div>
      </Link>
    </div>
  );
}
