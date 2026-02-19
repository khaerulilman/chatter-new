import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { commentsAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CommentPost({ postId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch comments when component mounts or postId changes
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await commentsAPI.getComments(postId);
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
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (!commentContent.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      const response = await commentsAPI.createComment(postId, commentContent);

      // Add the new comment to the list
      const newComment = response.data.comment;
      setComments([...comments, newComment]);
      setCommentContent(""); // Clear input
    } catch (error) {
      console.error("Error creating comment:", error);
      alert(error.response?.data?.message || "Failed to post comment");
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await commentsAPI.deleteComment(postId, commentId);

      // Remove the comment from the list
      setComments(comments.filter((comment) => comment.id !== commentId));

      // Show success alert
      alert("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  };

  // Function to format time for comments (show only time)
  const formatCommentTime = (timestamp) => {
    const commentTime = new Date(timestamp);
    const hours = commentTime.getHours().toString().padStart(2, "0");
    const minutes = commentTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-auto border-t mt-2 border-gray-600 flex flex-col">
      {/* Comment Input */}
      <div className="flex items-center mb-2 pt-4 pb-3 px-8 gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden">
          <img
            src={
              user?.profile_picture ||
              "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
            }
            alt={user?.name || "User"}
            className="w-full h-full object-cover"
          />
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
                <img
                  src={
                    comment.user_profile_picture ||
                    "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                  }
                  alt={comment.user_name || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-gray-400 text-sm">
                <p className="text-white text-base">{comment.user_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-sm">
                <p>{formatCommentTime(comment.created_at)}</p>
              </div>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete comment"
                >
                  <i className="fa-solid fa-trash text-sm"></i>
                </button>
              )}
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
