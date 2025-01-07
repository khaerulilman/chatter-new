import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationsPost from "../components/NotificationsPost.jsx";
import NewPost from "../components/NewPost";
import { useUser } from '../UserContext';
import { useEffect, useState } from "react";

export default function Notifications() {
  const { user } = useUser();
  const [notification, setNotification] = useState([]); // Corrected line

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('https://chatter-imagekit-frmxr41wo-khaerulilmans-projects.vercel.app/api/auth/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch notifications');
        }

        setNotification(data.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (user?.token) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <>
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar onClick={() => { }} />
        <div className="h-screen flex gap-2 max-lg:gap-0 justify-center">
          <div className="flex flex-col max-md:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3">
            <div className="py-3 px-4 text-white flex bg-gray-900 rounded-lg">
              <div className="flex w-full items-center border-gray-600 border py-2 px-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Search"
                  className="outline-none bg-transparent w-full"
                />
                <i className="fa-solid fa-magnifying-glass ml-2 text-gray-400"></i>
              </div>
            </div>
            <NewPost />
          </div>

          <div className="flex flex-col w-5/12 xl:border xl:border-gray-500 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3 ">
            <div className="py-3 px-4 text-white flex border-b border-gray-500">
              <button className="text-lg">
                <i className="fa-solid fa-bell mr-2"></i> Notifications
              </button>
            </div>

            <div className="overflow-auto scrollbar-hide">
              {notification.length > 0 ? (
                notification.map((notif) => (
                  <NotificationsPost key={notif.id} notification={notif} />
                ))
              ) : (
                <p className="text-white">You don't have any notifications yet.</p>
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
