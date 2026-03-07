import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import CardPost from "../components/CardPost";
import { postsAPI, commentsAPI, likesAPI } from "../api/api";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setLoading(true);
        const response = await postsAPI.getPostById(postId);
        // Ensure we get the actual post object
        const postData =
          response.data?.post || response.data?.data || response.data;

        // Ensure postData has an id
        if (!postData.id) {
          postData.id = postId;
        }

        // Fetch likes:
        // - logged in: include isLiked status
        // - guest: only fetch public like count to avoid 401 redirect
        try {
          if (user) {
            const likesResponse = await likesAPI.getLikeStatus(postId);
            postData.likes = likesResponse.data.likeCount;
            postData.isLiked = likesResponse.data.isLiked;
          } else {
            const likesCountResponse = await likesAPI.getLikeCount(postId);
            postData.likes = likesCountResponse.data.likeCount || 0;
            postData.isLiked = false;
          }
        } catch (e) {
          console.error("Error fetching likes:", e);
        }

        // Fetch comments count
        try {
          const commentsResponse = await commentsAPI.getCommentStatus(postId);
          postData.comments_count = commentsResponse.data.commentCount;
        } catch (e) {
          console.error("Error fetching comments:", e);
        }

        setPost(postData);
        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.response?.data?.message || "Failed to load post details");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  const header = (
    <div className="py-3 px-4 text-white flex gap-2 border-b border-gray-500">
      <button
        onClick={() => navigate("/")}
        className="hover:text-gray-400 transition duration-300"
      >
        <i className="fa-solid fa-arrow-left text-lg"></i>
      </button>
      <button className="text-lg">
        <i className="fa-solid fa-rss mr-2"></i> Post Detail
      </button>
    </div>
  );

  return (
    <MainLayout>
      {header}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loading />
        </div>
      )}
      {!loading && (error || !post) && (
        <div className="flex-1 flex justify-center items-center">
          <div className="text-white text-center">
            <p className="text-red-500 mb-4">{error || "Post not found"}</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
      {!loading && post && (
        <div className="flex-1 overflow-auto scrollbar-hide">
          <CardPost post={post} />
        </div>
      )}
    </MainLayout>
  );
}
