import { Link } from "react-router-dom";

export default function CardPeople({ person }) {
  return (
    <div className="p-4 border-b border-gray-500 h-24 flex">
      <Link to={`/profile/${person.id}`} className="flex items-center">
        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden">
          <img
            src={person.profile_picture} 
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col ml-2">
          <p className="text-white">{person.name}</p>
          <p className="text-gray-500">{person.id}</p>
        </div>
      </Link>
    </div>
  );
}
