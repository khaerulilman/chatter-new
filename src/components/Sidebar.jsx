import ButtonSidebar from "./ButtonSidebar";
import imgLogo from "../assets/img/LogoChatter.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
