import React, { useState, useEffect } from "react";
import CommentPost from "./CommentPost";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { commentsAPI, likesAPI, postsAPI, tipsAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CardPost({ post }) {
  const { user } = useAuth();
  const { updatePost, fetchPosts } = usePosts();
  const navigate = useNavigate();
  const [showComment, setShowComment] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState(null);
  const [tipSuccess, setTipSuccess] = useState(null);

  useEffect(() => {
    // Fetch comment count for the post
    const fetchCommentCount = async () => {
      try {
        // Fetch comment count using dedicated endpoint
        const response = await commentsAPI.getCommentStatus(post.id);
        setCommentCount(response.data.commentCount || 0);
      } catch (error) {
        console.error("Error fetching comment count:", error);
        // Fallback to post data or 0
        setCommentCount(post.comments_count || post.comments?.length || 0);
      }
    };

    // Fetch comment count if post has an ID
    if (post?.id) {
      fetchCommentCount();
    }

    // Check if post is already liked by user
    const checkLikeStatus = async () => {
      if (user?.id && post?.id) {
        try {
          const response = await likesAPI.getLikeStatus(post.id);
          setIsLiked(response.data.isLiked);
          setLikeCount(response.data.likeCount);
        } catch (error) {
          console.error("Error checking like status:", error);
          // Fallback to post data
          setIsLiked(post.isLiked || false);
          setLikeCount(post.likes || 0);
        }
      } else if (post?.id) {
        // If user not logged in, use post data
        setIsLiked(post.isLiked || false);
        setLikeCount(post.likes || 0);
      }
    };

    // Check if post is saved by user
    const checkSaveStatus = async () => {
      if (user?.id && post?.id) {
        try {
          const response = await postsAPI.getSaveStatus(post.id);
          setIsSaved(response.data.isSaved);
        } catch (error) {
          console.error("Error checking save status:", error);
        }
      }
    };

    checkLikeStatus();
    checkSaveStatus();
  }, [post?.id, user?.id]); // Only depend on post.id and user.id

  const handleLike = async () => {
    // Check if user is logged in by checking token in localStorage
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await likesAPI.toggleLike(post.id);

      // Update state based on response
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likeCount);

      // Update post in context
      updatePost({
        ...post,
        likes: response.data.likeCount,
        isLiked: response.data.isLiked,
      });
    } catch (error) {
      console.error("Error liking post:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while liking the post",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    setSaveLoading(true);
    try {
      const response = await postsAPI.toggleSave(post.id);
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error("Error saving post:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while saving the post",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShowComment = () => {
    setShowComment(!showComment);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await postsAPI.deletePost(post.id);
      alert("Post deleted successfully!");
      // Refresh posts after deletion
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.message || "An error occurred while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendTip = async () => {
    const amount = Number(tipAmount);
    if (!amount || amount < 1000 || amount > 100000) {
      setTipError("Jumlah tip harus antara Rp 1.000 - Rp 100.000");
      return;
    }

    setTipLoading(true);
    setTipError(null);
    setTipSuccess(null);

    try {
      const res = await tipsAPI.sendTip(
        post.id,
        amount,
        tipMessage || undefined,
      );
      setTipSuccess(
        `Tip Rp ${amount.toLocaleString("id-ID")} berhasil dikirim!`,
      );
      setTipAmount("");
      setTipMessage("");
      setTimeout(() => {
        setShowTipModal(false);
        setTipSuccess(null);
      }, 1500);
    } catch (error) {
      setTipError(error.response?.data?.message || "Gagal mengirim tip");
    } finally {
      setTipLoading(false);
    }
  };

  const renderContent = (text) => {
    if (!text) return "No content available.";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        {line.split(urlRegex).map((part, j) =>
          /^https?:\/\//.test(part) ? (
            <a
              key={j}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          ) : (
            part
          ),
        )}
      </React.Fragment>
    ));
  };

  const formatPostTime = (timestamp) => {
    const postTime = new Date(timestamp);
    const hours = postTime.getHours().toString().padStart(2, "0");
    const minutes = postTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleDoubleClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest("button")) return;
    navigate(`/posts/${post.id}`);
  };

  return (
    <div
      className="border-b border-gray-500 h-auto cursor-pointer"
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center my-1 px-4 pt-4">
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img
                src={
                  post.profile_picture ||
                  "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-gray-400">
              <button
                onClick={() => navigate(`/profile/${post.username}`)}
                className="text-white hover:underline text-left"
                title={post.user_name}
              >
                {post.user_name || "Anonymous"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-400">
              {formatPostTime(post.created_at) || "00:00"}
            </p>
            {user?.id === post.user_id && (
              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete post"
              >
                {isDeleting ? (
                  <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                ) : (
                  <i className="fa-solid fa-trash text-lg"></i>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col text-justify text-white my-3 px-4">
        <p className="whitespace-pre-wrap break-words">
          {renderContent(post.content)}
        </p>
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="w-full h-auto px-4 py-2">
          <img
            src={post.media_url}
            alt="Post Media"
            onClick={() => setShowFullImage(true)}
            className="max-w-xs h-64 object-cover rounded-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] cursor-pointer hover:opacity-80 transition-opacity"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex mt-2 gap-3 px-4 py-2">
        <button
          onClick={handleLike}
          className={`flex items-center text-lg gap-2 transition-colors ${
            isLiked
              ? "text-red-500 hover:text-red-400"
              : "text-gray-600 hover:text-white"
          } ${loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          disabled={loading}
          title={
            user?.id
              ? isLiked
                ? "Unlike this post"
                : "Like this post"
              : "Login to like posts"
          }
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin text-xl"></i>
          ) : (
            <i
              className={`fa-${isLiked ? "solid" : "regular"} fa-heart text-xl`}
            ></i>
          )}
          <span className="text-xl">{likeCount}</span>
        </button>
        <button
          onClick={handleShowComment}
          className="flex items-center text-lg text-gray-600 gap-2 hover:text-white"
        >
          <i className="fa-regular fa-comment text-xl"></i>
          <p className="text-xl">{commentCount}</p>
        </button>
        {user?.id && user.id !== post.user_id && (
          <button
            onClick={() => {
              if (!localStorage.getItem("token")) {
                navigate("/login");
                return;
              }
              setShowTipModal(true);
              setTipError(null);
              setTipSuccess(null);
            }}
            className="flex items-center text-lg text-gray-600 gap-2 hover:text-teal-400 transition-colors cursor-pointer"
            title="Beri tip"
          >
            <i className="fa-solid fa-coins text-xl"></i>
          </button>
        )}
        <button
          onClick={handleSave}
          className={`flex items-center text-lg gap-2 transition-colors ml-auto ${
            isSaved
              ? "text-yellow-400 hover:text-yellow-300"
              : "text-gray-600 hover:text-white"
          } ${saveLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          disabled={saveLoading}
          title={
            user?.id
              ? isSaved
                ? "Unsave this post"
                : "Save this post"
              : "Login to save posts"
          }
        >
          {saveLoading ? (
            <i className="fa-solid fa-spinner fa-spin text-xl"></i>
          ) : (
            <i
              className={`fa-${isSaved ? "solid" : "regular"} fa-bookmark text-xl`}
            ></i>
          )}
        </button>
      </div>

      {/* Comments */}
      {showComment && <CommentPost postId={post.id} />}

      {/* Full-Size Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowFullImage(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={post.media_url}
              alt="Post Media Full"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTipModal(false);
            }
          }}
        >
          <div
            className="flex flex-col w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <h2 className="text-white font-semibold text-base flex items-center gap-2">
                <i className="fa-solid fa-coins text-teal-400"></i>
                Beri Tip
              </h2>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-gray-400 text-sm mb-1">
                Tip untuk{" "}
                <span className="text-white font-medium">{post.user_name}</span>
              </p>
              <p className="text-gray-500 text-xs mb-4">
                Min. Rp 1.000 — Max. Rp 100.000
              </p>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1000, 5000, 10000, 25000, 50000, 75000, 100000].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setTipAmount(String(val));
                      setTipError(null);
                    }}
                    className={`py-2 rounded-lg text-xs font-medium transition-colors border ${
                      Number(tipAmount) === val
                        ? "bg-teal-600 border-teal-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                    }`}
                  >
                    {val >= 1000 ? `${val / 1000}K` : val}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-400 text-sm">Rp</span>
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => {
                    setTipAmount(e.target.value);
                    setTipError(null);
                  }}
                  placeholder="Jumlah tip"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors"
                  min="1000"
                  max="100000"
                />
              </div>

              {/* Optional message */}
              <input
                type="text"
                value={tipMessage}
                onChange={(e) => setTipMessage(e.target.value)}
                placeholder="Pesan (opsional)"
                maxLength={100}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-teal-500 transition-colors mb-3"
              />

              {tipError && (
                <p className="text-red-400 text-sm mb-3">
                  <i className="fa-solid fa-circle-exclamation mr-1"></i>
                  {tipError}
                </p>
              )}

              {tipSuccess && (
                <p className="text-green-400 text-sm mb-3">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  {tipSuccess}
                </p>
              )}

              <button
                onClick={handleSendTip}
                disabled={tipLoading || !tipAmount}
                className="w-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tipLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Mengirim...
                  </span>
                ) : (
                  <span>
                    Kirim Tip
                    {tipAmount
                      ? ` Rp ${Number(tipAmount).toLocaleString("id-ID")}`
                      : ""}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
