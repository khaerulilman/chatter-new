import { useState } from "react";
import { Link } from "react-router-dom";
import { followsAPI } from "../api/api";

export default function CardPeople({
  person,
  isFollowing: initialIsFollowing,
  onFollowChange,
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await followsAPI.toggleFollow(person.id);
      const newFollowing = res.data.following;
      setIsFollowing(newFollowing);
      if (onFollowChange) onFollowChange(person.id, newFollowing);
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-500 h-24 flex items-center justify-between">
      <Link
        to={`/profile/${person.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={person.profile_picture}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-white font-medium truncate">{person.name}</p>
          <p className="text-gray-400 text-sm truncate">@{person.username}</p>
        </div>
      </Link>

      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`ml-3 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
          isFollowing
            ? "bg-transparent border border-gray-500 text-gray-300 hover:border-red-500 hover:text-red-400"
            : "bg-teal-600 hover:bg-teal-500 text-white"
        } disabled:opacity-50`}
      >
        {loading ? "..." : isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
}
