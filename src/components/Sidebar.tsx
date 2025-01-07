import ButtonSidebar from "./ButtonSidebar";
import imgLogo from "../assets/img/LogoChatter.png";

export default function Sidebar() {
  return (
    <>
      <div className="flex px-4 py-3 text-white">
        <div className="flex flex-col gap-8 mt-2">
          <div className="flex items-center gap-2 max-lg:hidden">
            <img src={imgLogo} alt="Logo Chatter" className="w-10" />
            <p className="text-lg">Chatter</p>
          </div>
          <ButtonSidebar icon="fa-solid fa-house" name="Home" path={"/home"}/>
          <ButtonSidebar icon="fa-solid fa-earth-europe" name="Explore" path={"/home"}/>
          <ButtonSidebar icon="fa-solid fa-bell" name="Notification" path={"/notifications"}/>
          <ButtonSidebar icon="fa-solid fa-user" name="Profile" path={"/profile"}/>
          <ButtonSidebar icon="fa-solid fa-gear" name="Settings" path={"/edit-profile"}/>
        </div>
      </div>
    </>
  );
}
