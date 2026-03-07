import { useState, useEffect } from "react";
import imgLogo from "../assets/img/LogoChatter.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { notificationsAPI } from "../api/api";

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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

  const navButtonClass = (isActive) =>
    `xl:flex flex xl:items-center xl:gap-2 transition-colors ${
      isActive ? "text-teal-400" : "text-white"
    }`;

  // Poll unread count every 30s when logged in
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnread = async () => {
      try {
        const res = await notificationsAPI.getUnreadCount();
        setUnreadCount(res.data?.unreadCount ?? 0);
      } catch {
        // silently ignore
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Clear badge when user navigates to /notifications
  useEffect(() => {
    if (location.pathname === "/notifications") {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const handleProtectedNav = (path) => {
    if (!user?.id) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const renderNavItem = (item) => {
    let isActive;
    if (item.id === "home") {
      isActive = location.pathname === "/";
    } else if (item.id === "profile") {
      isActive = location.pathname.startsWith("/profile");
    } else {
      isActive = location.pathname.startsWith(item.path);
    }

    const onClick = () => {
      if (item.requiresAuth) {
        handleProtectedNav(item.path);
      } else {
        navigate(item.path);
      }
    };

    if (item.id === "home") {
      return (
        <button
          key={item.id}
          onClick={onClick}
          className={navButtonClass(isActive)}
        >
          <i className={`fa-solid ${item.icon}`}></i>
          <p className="max-lg:hidden">{item.label}</p>
        </button>
      );
    }

    if (item.id === "notifications") {
      return (
        <button
          key={item.id}
          onClick={onClick}
          className={`${navButtonClass(isActive)} relative`}
        >
          <span className="relative">
            <i className={`fa-solid ${item.icon}`}></i>
            {item.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            )}
          </span>
          <p className="max-lg:hidden">{item.label}</p>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={onClick}
        className={navButtonClass(isActive)}
      >
        <i className={`fa-solid ${item.icon}`}></i>
        <p className="max-lg:hidden">{item.label}</p>
      </button>
    );
  };

  return (
    <>
      <div className="flex px-4 py-3 max-md:pt-16 text-white h-full">
        <div className="flex flex-col gap-8 mt-2">
          <div className="flex items-center gap-2 max-lg:hidden">
            <img src={imgLogo} alt="Logo Chatter" className="w-10" />
            <p className="text-lg">Chatter</p>
          </div>
          {navItems.map((item) => renderNavItem(item))}
        </div>
      </div>
    </>
  );
}
