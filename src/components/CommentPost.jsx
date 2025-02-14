import { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import axios from "axios";

export default function CommentPost({ postId }) {
  const { user } = useUser();
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments when component mounts or postId changes
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`, // Endpoint untuk mengambil komentar
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setComments(response.data.data); // Ambil data dari response
      } catch (error) {
        console.error("Error fetching comments:", error);
        alert(error.response?.data?.message || "Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId, user]);

  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/comments`, // Endpoint untuk membuat komentar
        {
          content: commentContent, // Hanya kirim content
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // Sertakan token untuk autentikasi
          },
        }
      );

      // Add the new comment to the list
      const newComment = response.data.comment;
      setComments([...comments, newComment]);
      setCommentContent(""); // Clear input
    } catch (error) {
      console.error("Error creating comment:", error);
      alert(error.response?.data?.message || "Failed to post comment");
    }
  };

  // Function to calculate time ago
  const timeAgo = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - commentTime) / 1000);

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    }
  };

  return (
    <div className="h-auto border-t mt-2 border-gray-600 flex flex-col">
      {/* Comment Input */}
      <div className="flex items-center mb-2 pt-4 pb-3 px-8 gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
              alt="Default Profile"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-1 py-2 px-3 bg-gray-800 text-white rounded-lg outline-none"
          onChange={(e) => setCommentContent(e.target.value)}
          value={commentContent}
        />
        <button
          className="ml-2 bg-teal-700 text-white p-2 px-4 rounded-lg hover:bg-teal-800"
          onClick={handleCommentSubmit}
        >
          Post
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin border-t-4 border-teal-700 border-solid w-8 h-8 rounded-full"></div>
        </div>
      )}

      {/* Comment Display */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col px-8 py-4 border-t-gray-800 border-t"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                {comment.user_profile_picture ? (
                  <img
                    src={comment.user_profile_picture}
                    alt={comment.user_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                    alt="Default Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col text-gray-400 text-sm">
                <p className="text-white text-base">{comment.user_name}</p>
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              <p>{timeAgo(comment.created_at)}</p>
            </div>
          </div>
          <div className="text-white text-sm mt-2 px-12">
            <p>{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
