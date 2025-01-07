export default function NotificationsPost({ notification }) {
  return (
    <div className="border-b border-b-gray-500 h-auto py-4 flex flex-col justify-center gap-4">
      <div className="flex mx-4 gap-3 items-center">
        {notification.type === 'like' && (
          <i className="fa-solid fa-heart text-red-500 text-2xl"></i>
        )}
        {notification.type === 'comment' && (
          <i className="fa-solid fa-comment text-blue-500 text-2xl"></i>
        )}
        <div className="w-8 h-8 rounded-full overflow-hidden">
          {notification.actor_profile_picture ? (
            <img
              src={notification.actor_profile_picture}
              alt={notification.actor_name || "Anonymous"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <i className="fa-solid fa-user text-white"></i>
            </div>
          )}
        </div>
      </div>
      <p className="mx-4 text-white">
        {notification.type === 'like' && (
          <>
            <span className="text-white font-medium">{notification.actor_name || "Anonymous"}</span> liked your
            post: "{notification.content?.substring(0, 50) || "No content available."}..."
          </>
        )}
        {notification.type === 'comment' && (
          <>
            <span className="text-white font-medium">{notification.actor_name || "Anonymous"}</span> commented on your
            post: "{notification.content?.substring(0, 50) || "No content available."}..."
          </>
        )}
      </p>
      <p className="mx-4 text-gray-400 text-sm">
        {new Date(notification.created_at).toLocaleString()}
      </p>
    </div>
  );
}