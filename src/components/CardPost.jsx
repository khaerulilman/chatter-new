import React, { useState, useEffect } from "react";
import CommentPost from "./CommentPost";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { commentsAPI, likesAPI, postsAPI } from "../api/api";
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

    checkLikeStatus();
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
              <p className="text-white">{post.user_name || "Anonymous"}</p>
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
        <p>{post.content || "No content available."}</p>
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="w-full h-auto px-4">
          <img
            src={post.media_url}
            alt="Post Media"
            className="h-2/6 rounded-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
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
      </div>

      {/* Comments */}
      {showComment && <CommentPost postId={post.id} />}
    </div>
  );
}
