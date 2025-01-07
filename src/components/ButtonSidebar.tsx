import { Link } from "react-router-dom";

interface ButtonSidebarProps {
  icon: string; // Tipe untuk ikon
  name: string; // Tipe untuk nama
  path: string; // Tipe untuk jalur
}

export default function ButtonSidebar({ icon, name, path }: ButtonSidebarProps) {
  return (
    <Link to={path} className="xl:flex xl:items-center xl:gap-2">
      <i className={`fa-solid ${icon}`}></i>
      <p className="max-lg:hidden">{name}</p>
    </Link>
  );
}
