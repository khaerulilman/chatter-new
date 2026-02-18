import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NewPost from "../components/NewPost";
import Navbar from "../components/Navbar";
import Search from "../components/Search";
import CardPost from "../components/CardPost";
import { postsAPI, commentsAPI, likesAPI } from "../api/api";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
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

        // Fetch like count
        try {
          const likesResponse = await likesAPI.getLikeStatus(postId);
          postData.likes = likesResponse.data.likeCount;
          postData.isLiked = likesResponse.data.isLiked;
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

  // Check screen size for mobile view
  const isMobile = window.innerWidth < 600;

  if (loading) {
    return (
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar />
        <div className="h-screen flex gap-2 max-lg:gap-0 justify-center items-center">
          <div className="text-white text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
            <p>Loading post...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar />
        <div className="h-screen flex gap-2 max-lg:gap-0 justify-center items-center">
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
      </section>
    );
  }

  return (
    <>
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar />
        <div className="h-screen flex gap-2 max-lg:gap-0 justify-center">
          <div className="flex flex-col max-md:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3">
            <Search />
            {/* Tampilkan NewPost hanya jika bukan mobile */}
            {!isMobile && <NewPost disabled={isMobile} />}
          </div>

          <div className="flex flex-col w-5/12 xl:border xl:border-gray-500 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3">
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

            <div className="flex-1 overflow-auto scrollbar-hide">
              <CardPost post={post} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="max-md:block max-md:h-full max-lg:w-16 w-1/6">
            <Sidebar />
          </div>
        </div>
      </section>
    </>
  );
}
