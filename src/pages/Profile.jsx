import NewPost from "../components/NewPost";
import { useState, useEffect } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usersAPI, postsAPI } from "../api/api.ts";
import CardPost from "../components/CardPost.jsx";
import Search from "../components/Search.jsx";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: loggedInUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPost, setShowPost] = useState(true);
  const [showNews, setShowNews] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const isOwner = loggedInUser?.username === username;

  const formatProfileDate = (timestamp) => {
    if (!timestamp) return "20 June 2023"; // fallback

    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  // Redirect to logged-in user's profile if no username is provided
  useEffect(() => {
    if (!username && loggedInUser?.username) {
      navigate(`/profile/${loggedInUser.username}`, { replace: true });
    }
  }, [username, loggedInUser?.username, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getUserByUsername(username);
        setProfileUser(res.data.user);

        // Fetch user posts
        try {
          setPostsLoading(true);
          const postsRes = await postsAPI.getPostsByUserId(res.data.user.id);
          setUserPosts(postsRes.data.data || []);
        } catch (postsErr) {
          console.error("Error fetching user posts:", postsErr);
          setUserPosts([]);
        } finally {
          setPostsLoading(false);
        }
      } catch (err) {
        setError("User not found.");
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "news") {
      setShowPost(false);
      setShowNews(true);
    } else {
      // Default to posts if no tab or tab is not "news"
      setShowPost(true);
      setShowNews(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <section className="h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </section>
    );
  }

  if (error) {
    return (
      <section className="h-screen bg-gray-950 flex items-center justify-center text-white">
        {error}
      </section>
    );
  }

  return (
    <>
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar onClick={() => {}} />
        <div className="h-screen bg-gray-950 flex gap-2 max-lg:gap-0 justify-center ">
          <div className="flex flex-col max-lg:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3">
            <Search />
            <NewPost />
          </div>

          <div className="flex flex-col w-5/12 xl:border xl:border-gray-700 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3 ">
            <div className="py-3 px-4 text-white flex border-b border-gray-700">
              <Link to="/" className="text-lg">
                <i className="fa-solid fa-arrow-left mr-2"></i> Back
              </Link>
            </div>

            <div className="overflow-auto scrollbar-hide">
              <div className="flex flex-col h-96 border-b border-gray-700">
                <div className="flex h-40 bg-slate-900 w-full">
                  {profileUser?.header_picture ? (
                    <img
                      src={profileUser.header_picture}
                      alt="Profile Header"
                      className="flex w-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://ik.imagekit.io/fs0yie8l6/smooth-gray-background-with-high-quality_53876-124606.png?updatedAt=1736214212559"
                      alt="Default Header"
                      className="flex w-full object-cover"
                    />
                  )}
                </div>

                <div className="h-auto rounded-lg mx-6 -mt-12 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <img
                      src={
                        profileUser?.profile_picture ||
                        "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                      }
                      alt="Profile"
                      className="flex w-24 h-full object-cover rounded-lg"
                    />

                    {isOwner && (
                      <Link
                        to="/edit-profile"
                        className="text-white mt-16 p-4 h-9 w-auto bg-gray-600 flex items-center rounded-lg"
                      >
                        Edit Profile
                      </Link>
                    )}
                  </div>

                  <div className="text-white mt-3">
                    <h3 className="font-medium text-xl">{profileUser?.name}</h3>
                    <p className="text-gray-400 text-sm">
                      @{profileUser?.username}
                    </p>
                  </div>

                  <div className="flex border border-gray-700 h-16 mt-5 rounded-lg">
                    <div className="flex flex-col justify-center ml-4 text-gray-500">
                      <h3 className="text-sm">Joined</h3>
                      <p className="text-sm">
                        {formatProfileDate(profileUser?.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => {
                    setShowPost(true);
                    setShowNews(false);
                    setSearchParams({ tab: "posts" });
                  }}
                  className={`px-6 py-3 text-sm font-medium ${
                    showPost
                      ? "text-white border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Posts
                </button>
                {/* <button
                  onClick={() => {
                    setShowPost(false);
                    setShowNews(true);
                    setSearchParams({ tab: "news" });
                  }}
                  className={`px-6 py-3 text-sm font-medium ${
                    showNews
                      ? "text-white border-b-2 border-blue-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  News
                </button> */}
              </div>

              <div className="overflow-auto scrollbar-hide">
                {showPost && (
                  <div>
                    {postsLoading ? (
                      <div className="flex items-center justify-center py-8 text-white">
                        Loading posts...
                      </div>
                    ) : userPosts.length > 0 ? (
                      userPosts.map((post) => (
                        <CardPost key={post.id} post={post} />
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8 text-gray-400">
                        No posts yet
                      </div>
                    )}
                  </div>
                )}
              </div>
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
