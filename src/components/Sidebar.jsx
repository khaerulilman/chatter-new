import { useState, useEffect } from "react";
import ButtonSidebar from "./ButtonSidebar";
import imgLogo from "../assets/img/LogoChatter.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { notificationsAPI } from "../api/api";

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <>
      <div className="flex px-4 py-3 text-white">
        <div className="flex flex-col gap-8 mt-2">
          <div className="flex items-center gap-2 max-lg:hidden">
            <img src={imgLogo} alt="Logo Chatter" className="w-10" />
            <p className="text-lg">Chatter</p>
          </div>
          <ButtonSidebar icon="fa-solid fa-house" name="Home" path={"/"} />
          <button
            onClick={() => handleProtectedNav("/chats")}
            className="xl:flex xl:items-center xl:gap-2 text-white"
          >
            <i className="fa-solid fa-message"></i>
            <p className="max-lg:hidden">Messages</p>
          </button>
          {/* Notifications */}
          <button
            onClick={() => handleProtectedNav("/notifications")}
            className="xl:flex xl:items-center xl:gap-2 text-white relative"
          >
            <span className="relative">
              <i className="fa-solid fa-bell"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <p className="max-lg:hidden">Notifications</p>
          </button>
          <button
            onClick={() =>
              handleProtectedNav(
                user?.username ? `/profile/${user.username}` : "/profile",
              )
            }
            className="xl:flex xl:items-center xl:gap-2 text-white"
          >
            <i className="fa-solid fa-user"></i>
            <p className="max-lg:hidden">Profile</p>
          </button>
          <button
            onClick={() => handleProtectedNav("/edit-profile")}
            className="xl:flex xl:items-center xl:gap-2 text-white"
          >
            <i className="fa-solid fa-gear"></i>
            <p className="max-lg:hidden">Settings</p>
          </button>
        </div>
      </div>
    </>
  );
}
