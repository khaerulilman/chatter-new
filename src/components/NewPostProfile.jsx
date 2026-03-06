import { Link } from "react-router-dom";

/**
 * Shared profile UI for New Post context.
 *
 * Props
 * - user: current user object (or null)
 * - onClose: callback to close parent modal (optional)
 * - variant: "card" (default) or "avatar"
 */
export default function NewPostProfile({ user, onClose, variant = "card" }) {
  if (variant === "avatar") {
    return (
      <Link
        to={user ? `/profile/${user.username}` : "/login"}
        onClick={() => onClose?.()}
        className="block"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <i className="fa-solid fa-user text-sm"></i>
            </div>
          )}
        </div>
      </Link>
    );
  }

  if (!user) {
    return (
      <div className="gap-3 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors w-full">
        <div className="flex gap-2">
          <Link
            to="/login"
            onClick={() => onClose?.()}
            className="flex-1 text-center bg-teal-700 hover:bg-teal-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            onClick={() => onClose?.()}
            className="flex-1 text-center bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center gap-3 border border-gray-600 rounded-lg p-3 hover:border-gray-500 transition-colors w-full"
        onClick={() => onClose?.()}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={
              user.profile_picture ||
              "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
            }
            alt={user.name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-white font-medium leading-tight">{user.name}</p>
          <p className="text-gray-400 text-sm leading-tight">@{user.username}</p>
        </div>
      </Link>
    </div>
  );
}
