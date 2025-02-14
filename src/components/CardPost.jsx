import React, { useState, useEffect } from "react";
import CommentPost from "./CommentPost";
import { useUser } from "../UserContext";
import { usePosts } from "../PostsContext";
import axios from "axios";

export default function CardPost({ post }) {
  const { user } = useUser();
  const { updatePost } = usePosts();
  const [showComment, setShowComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state for like button

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/auth/posts/${postId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setCommentCount(response.data.data.length);
      } catch (error) {
        console.error("Error fetching comment count:", error);
      }
    };

    fetchCommentCount();

    // Check if post is already liked by user
    const checkLikeStatus = async () => {
      setIsLiked(post.isLiked || false);
    };

    checkLikeStatus();
  }, [post.id, user, post.isLiked]);

  const handleLike = async () => {
    setLoading(true); // Set loading to true when the like button is clicked

    try {
      const response = await fetch("http://localhost:3000/api/auth/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          postId: post.id, // Hanya kirim postId, userId diambil dari token
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to like post");
      }

      // Toggle like status based on response
      const newIsLiked = data.message === "Post liked successfully.";
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      // Update post in context
      updatePost({
        ...post,
        likes: newLikeCount,
        isLiked: newIsLiked,
      });
    } catch (error) {
      console.error("Error liking post:", error);
      alert(error.message || "An error occurred while liking the post");
    } finally {
      setLoading(false); // Reset loading state after the request
    }
  };

  const handleShowComment = () => {
    setShowComment(!showComment);
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

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
    <div className="border-b border-gray-500 h-auto">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex justify-between items-center my-1 px-4 pt-4">
          <div className="flex gap-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              {post.profile_picture ? (
                <img
                  src={post.profile_picture}
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
            <div className="flex flex-col text-gray-400">
              <p className="text-white">{post.user_name || "Anonymous"}</p>
            </div>
          </div>
          <div className="text-gray-400">
            <p>{timeAgo(post.created_at) || "Just now"}</p>
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
          className={`flex items-center text-lg gap-2 hover:text-white ${
            isLiked ? "text-red-500" : "text-gray-600"
          }`}
          disabled={loading} // Disable the button while loading
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin text-xl"></i> // Loading spinner
          ) : (
            <i
              className={`fa-${isLiked ? "solid" : "regular"} fa-heart text-xl`}
            ></i>
          )}
          <p className="text-xl">{likeCount}</p>
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
