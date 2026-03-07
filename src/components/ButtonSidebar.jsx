import { NavLink } from "react-router-dom";

export default function ButtonSidebar({ icon, name, path }) {
  return (
    <NavLink
      to={path}
      end={path === "/"}
      className={({ isActive }) =>
        `xl:flex xl:items-center xl:gap-2 transition-colors ${
          isActive ? "text-teal-400" : "text-white hover:text-teal-300"
        }`
      }
    >
      <i className={`fa-solid ${icon}`}></i>
      <p className="max-lg:hidden">{name}</p>
    </NavLink>
  );
}
