import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import imgLogo from "../assets/img/LogoChatter.png";
import { useUser } from '../UserContext';

export default function Navbar({onClick}) {
  const { user } = useUser();
  return (
    <div>
      <header>
        <nav className="hidden max-lg:flex max-lg:justify-between max-lg:px-4 py-3 max-lg:border-b max-lg:border-gray-600 items-center bg-gray-950">
          <div className="flex items-center gap-2">
            <img src={imgLogo} className="w-7" alt="Logo Chatter" />
            <p className="text-white text-lg">Chatter</p>
          </div>
          <div className="max-lg:flex gap-3">
            
            <div className=" text-gray-200 max-lg:hidden max-md:flex">
              <button onClick={onClick} className="border border-gray-400 px-4 py-1 max-md:py-0 rounded-md hover:border-gray-100 hover:text-white">New Post</button>
            </div>
            <div className=" rounded-lg">
              <img src={user.profile_picture} alt="" className="rounded-lg w-9"/>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
