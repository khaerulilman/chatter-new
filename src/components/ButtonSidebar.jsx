import { Link } from "react-router-dom";

export default function ButtonSidebar({ icon, name, path }) {
  return (
    <Link to={path} className="xl:flex xl:items-center xl:gap-2">
      <i className={`fa-solid ${icon}`}></i>
      <p className="max-lg:hidden">{name}</p>
    </Link>
  );
}
