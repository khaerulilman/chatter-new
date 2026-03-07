import React, { useState, useEffect } from "react";
import CommentPost from "./CommentPost";
import TipModal from "./TipModal";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { commentsAPI, likesAPI, postsAPI, tipsAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function CardPost({ post }) {
  const { user } = useAuth();
  const { updatePost, fetchPosts } = usePosts();
  const navigate = useNavigate();
  const showToast = useToast();
  const [showComment, setShowComment] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [tipLoading, setTipLoading] = useState(false);
  const [tipError, setTipError] = useState(null);
  const [tipSuccess, setTipSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // Fetch like count (public endpoint, no auth required)
    const fetchLikeCount = async () => {
      try {
        const response = await likesAPI.getLikeCount(post.id);
        setLikeCount(response.data.likeCount);
      } catch (error) {
        console.error("Error fetching like count:", error);
        setLikeCount(post.likes || 0);
      }
    };

    // Fetch comment count if post has an ID
    if (post?.id) {
      fetchCommentCount();
      fetchLikeCount();
    }

    // Check if post is already liked by user
    const checkLikeStatus = async () => {
      if (user?.id && post?.id) {
        try {
          const response = await likesAPI.getLikeStatus(post.id);
          setIsLiked(response.data.isLiked);
        } catch (error) {
          console.error("Error checking like status:", error);
          // Fallback to post data
          setIsLiked(post.isLiked || false);
        }
      } else if (post?.id) {
        // If user not logged in, use post data
        setIsLiked(post.isLiked || false);
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
      showToast(
        error.response?.data?.message || "Failed to like post",
        "error",
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
      showToast(response.data.isSaved ? "Post saved!" : "Post unsaved", "save");
    } catch (error) {
      console.error("Error saving post:", error);
      showToast(
        error.response?.data?.message || "Failed to save post",
        "error",
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShowComment = () => {
    setShowComment(!showComment);
  };

  const handleDeletePost = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeletePost = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await postsAPI.deletePost(post.id);
      showToast("Post deleted successfully!", "delete");
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast(error.message || "Failed to delete post", "error");
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
      showToast(`Tip Rp ${amount.toLocaleString("id-ID")} sent!`, "tip");
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

  const MAX_CHARS = 280;

  const renderContent = (text) => {
    if (!text) return "No content available.";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const displayText =
      !showFullContent && text.length > MAX_CHARS
        ? text.slice(0, MAX_CHARS).trimEnd()
        : text;

    return (
      <>
        {displayText.split("\n").map((line, i) => (
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
        ))}
        {!showFullContent && text.length > MAX_CHARS && (
          <>
            {"... "}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(true);
              }}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Read more
            </button>
          </>
        )}
        {showFullContent && text.length > MAX_CHARS && (
          <>
            {" "}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFullContent(false);
              }}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Show less
            </button>
          </>
        )}
      </>
    );
  };

  const formatPostTime = (timestamp) => {
    const postTime = new Date(timestamp);
    const hours = postTime.getHours().toString().padStart(2, "0");
    const minutes = postTime.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Get all media images - prefer media_urls (array), fallback to single media_url
  const allImages =
    post.media_urls && post.media_urls.length > 0
      ? post.media_urls
      : post.media_url
        ? [post.media_url]
        : [];

  const MAX_VISIBLE = 3;
  const visibleImages = allImages.slice(0, MAX_VISIBLE);
  const remainingCount = allImages.length - MAX_VISIBLE;

  const openGallery = (index) => {
    setGalleryIndex(index);
    setShowFullImage(true);
  };

  const handleDoubleClick = (e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest("button")) return;
    navigate(`/posts/${post.id}`);
  };

  return (
    <div
      className="border-b border-gray-500 h-auto cursor-pointer overflow-hidden"
      onDoubleClick={handleDoubleClick}
    >
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center my-1 px-4 pt-4">
          <div className="flex gap-2">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg overflow-hidden">
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

      {/* Media Grid */}
      {allImages.length > 0 && (
        <div className="w-full px-4 py-2">
          <div
            className={`grid gap-0.5 rounded-xl overflow-hidden ${
              allImages.length === 1
                ? "grid-cols-1"
                : allImages.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
            }`}
          >
            {visibleImages.map((url, i) => {
              const isLastVisible = i === MAX_VISIBLE - 1 && remainingCount > 0;
              return (
                <div
                  key={i}
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() =>
                    openGallery(isLastVisible ? MAX_VISIBLE - 1 : i)
                  }
                >
                  <img
                    src={url}
                    alt={`Post Media ${i + 1}`}
                    className={`w-full object-cover hover:opacity-90 transition-opacity ${
                      allImages.length === 1
                        ? "max-h-80"
                        : allImages.length === 2
                          ? "h-[200px]"
                          : "h-[110px]"
                    }`}
                  />
                  {isLastVisible && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        +{remainingCount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

      {/* Image Gallery Modal */}
      {showFullImage && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowFullImage(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>

            {/* Counter */}
            {allImages.length > 1 && (
              <div className="absolute top-4 left-4 z-10 bg-gray-800/80 rounded-full px-3 py-1 text-white text-sm">
                {galleryIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Prev */}
            {allImages.length > 1 && galleryIndex > 0 && (
              <button
                onClick={() => setGalleryIndex((prev) => prev - 1)}
                className="absolute left-6 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-white"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}

            {/* Image */}
            <img
              src={allImages[galleryIndex]}
              alt={`Post Media ${galleryIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            {/* Next */}
            {allImages.length > 1 && galleryIndex < allImages.length - 1 && (
              <button
                onClick={() => setGalleryIndex((prev) => prev + 1)}
                className="absolute right-6 z-10 bg-gray-800/80 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-white"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tip Modal */}
      <TipModal
        showTipModal={showTipModal}
        setShowTipModal={setShowTipModal}
        post={post}
        tipAmount={tipAmount}
        setTipAmount={setTipAmount}
        tipMessage={tipMessage}
        setTipMessage={setTipMessage}
        tipLoading={tipLoading}
        tipError={tipError}
        setTipError={setTipError}
        tipSuccess={tipSuccess}
        setTipSuccess={setTipSuccess}
        handleSendTip={handleSendTip}
      />

      <ConfirmModal
        show={showDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        icon="fa-trash"
        iconColor="text-red-400"
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-500"
        onConfirm={confirmDeletePost}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
