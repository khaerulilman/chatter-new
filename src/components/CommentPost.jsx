import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { commentsAPI } from "../api/api";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";

export default function CommentPost({
  postId,
  commentsDisabled = false,
  postOwnerId,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showToast = useToast();
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch comments when component mounts or postId changes
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const response = await commentsAPI.getComments(postId);
        setComments(response.data.data); // Ambil data dari response
      } catch (error) {
        console.error("Error fetching comments:", error);
        showToast(
          error.response?.data?.message || "Failed to fetch comments",
          "error",
        );
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
      showToast("Comment cannot be empty!", "error");
      return;
    }

    try {
      const response = await commentsAPI.createComment(postId, commentContent);

      // Add the new comment to the list
      const newComment = response.data.comment;
      setComments([...comments, newComment]);
      setCommentContent(""); // Clear input
      showToast("Comment posted!", "comment");
    } catch (error) {
      console.error("Error creating comment:", error);
      showToast(
        error.response?.data?.message || "Failed to post comment",
        "error",
      );
    }
  };

  // Handle comment deletion
  const handleDeleteComment = (commentId) => {
    setDeleteTarget(commentId);
  };

  const confirmDeleteComment = async () => {
    const commentId = deleteTarget;
    setDeleteTarget(null);

    try {
      await commentsAPI.deleteComment(postId, commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
      showToast("Comment deleted!", "delete");
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast(
        error.response?.data?.message || "Failed to delete comment",
        "error",
      );
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
    <div className="h-auto border-t mt-2 border-gray-600 flex flex-col w-full overflow-hidden">
      {/* Comment Input */}
      <div className="flex items-center mb-2 pt-4 pb-3 px-4 gap-3">
        {commentsDisabled && user?.id !== postOwnerId ? (
          <div className="flex-1 flex items-center gap-2 py-2 px-3 bg-gray-800/50 text-gray-500 rounded-lg text-sm">
            <i className="fa-solid fa-comment-slash"></i>
            <span>Comments are disabled for this post</span>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {loading && <Loading />}

      {/* Comment Display */}
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="flex flex-col px-4 py-4 border-t-gray-800 border-t"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg overflow-hidden">
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
          <div className="text-white text-sm mt-2 pl-12">
            <p>{comment.content}</p>
          </div>
        </div>
      ))}

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        icon="fa-trash"
        iconColor="text-red-400"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-500"
        onConfirm={confirmDeleteComment}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
