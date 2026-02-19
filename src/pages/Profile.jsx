import NewPost from "../components/NewPost";
import { useState, useEffect, useCallback } from "react";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usersAPI, postsAPI, followsAPI } from "../api/api.ts";
import { useChats } from "../context/ChatsContext.jsx";
import CardPost from "../components/CardPost.jsx";
import CardPeople from "../components/CardPeople.jsx";
import Search from "../components/Search.jsx";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: loggedInUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Follow stats
  const [followStats, setFollowStats] = useState({
    followerCount: 0,
    followingCount: 0,
  });
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

  const { startConversation } = useChats();

  // Followers / Following lists
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [listsLoading, setListsLoading] = useState(false);

  // Saved posts (only for profile owner)
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const activeTab = searchParams.get("tab") || "posts";
  const isOwner = loggedInUser?.username === username;

  const formatProfileDate = (timestamp) => {
    if (!timestamp) return "20 June 2023";
    const date = new Date(timestamp);
    return `${date.getDate()} ${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
  };

  // Redirect to logged-in user's profile if no username
  useEffect(() => {
    if (!username && loggedInUser?.username) {
      navigate(`/profile/${loggedInUser.username}`, { replace: true });
    }
  }, [username, loggedInUser?.username, navigate]);

  // Fetch profile + posts + follow stats
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      try {
        setLoading(true);
        const res = await usersAPI.getUserByUsername(username);
        const user = res.data.user;
        setProfileUser(user);

        // Posts
        try {
          setPostsLoading(true);
          const postsRes = await postsAPI.getPostsByUserId(user.id);
          setUserPosts(postsRes.data.data || []);
        } catch (e) {
          setUserPosts([]);
        } finally {
          setPostsLoading(false);
        }

        // Follow stats
        try {
          const statsRes = await followsAPI.getFollowStats(user.id);
          setFollowStats({
            followerCount: statsRes.data.followerCount,
            followingCount: statsRes.data.followingCount,
          });
        } catch (e) {
          // ignore
        }

        // Current user follow status toward profile user
        if (loggedInUser && loggedInUser.username !== username) {
          try {
            const statusRes = await followsAPI.getFollowStatus(user.id);
            setIsFollowingProfile(statusRes.data.isFollowing);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        setError("User not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, loggedInUser]);

  // Fetch followers / following lists when tab changes
  useEffect(() => {
    if (
      (activeTab !== "followers" && activeTab !== "following") ||
      !profileUser
    )
      return;

    const fetchLists = async () => {
      setListsLoading(true);
      try {
        const [followersRes, followingRes] = await Promise.all([
          followsAPI.getFollowers(profileUser.id),
          followsAPI.getFollowing(profileUser.id),
        ]);
        setFollowersList(followersRes.data.data || []);
        setFollowingList(followingRes.data.data || []);

        // Also get logged-in user's following IDs to show correct button state
        if (loggedInUser) {
          try {
            const idsRes = await followsAPI.getFollowingIds();
            setFollowingIds(new Set(idsRes.data.data));
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error("Error fetching follow lists:", e);
      } finally {
        setListsLoading(false);
      }
    };
    fetchLists();
  }, [activeTab, profileUser, loggedInUser]);

  const handleFollowProfile = async () => {
    if (!loggedInUser) return navigate("/login");
    setFollowLoading(true);
    try {
      const res = await followsAPI.toggleFollow(profileUser.id);
      setIsFollowingProfile(res.data.following);
      setFollowStats((prev) => ({
        ...prev,
        followerCount: res.data.followerCount,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = async () => {
    if (!loggedInUser) return navigate("/login");
    setMessageLoading(true);
    try {
      const conversation = await startConversation(profileUser.id);
      navigate(`/chats/${conversation.id}`);
    } catch (e) {
      console.error("Error creating conversation:", e);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleFollowChange = useCallback((userId, isNowFollowing) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      isNowFollowing ? next.add(userId) : next.delete(userId);
      return next;
    });
  }, []);

  // Fetch saved posts when tab = "saved" and user is owner
  useEffect(() => {
    if (activeTab !== "saved" || !isOwner) return;

    const fetchSaved = async () => {
      setSavedLoading(true);
      try {
        const res = await postsAPI.getSavedPosts();
        setSavedPosts(res.data.data || []);
      } catch (e) {
        console.error("Error fetching saved posts:", e);
        setSavedPosts([]);
      } finally {
        setSavedLoading(false);
      }
    };
    fetchSaved();
  }, [activeTab, isOwner]);

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

  const currentList = activeTab === "followers" ? followersList : followingList;

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
              {activeTab !== "posts" ? (
                <button
                  onClick={() => setSearchParams({ tab: "posts" })}
                  className="text-lg"
                >
                  <i className="fa-solid fa-arrow-left mr-2"></i> Back
                </button>
              ) : (
                <Link to="/" className="text-lg">
                  <i className="fa-solid fa-arrow-left mr-2"></i> Back
                </Link>
              )}
            </div>

            <div className="overflow-auto scrollbar-hide">
              {/* Profile header */}
              <div className="flex flex-col border-b border-gray-700">
                {/* Cover */}
                <div className="flex h-40 bg-slate-900 w-full">
                  {profileUser?.header_picture ? (
                    <img
                      src={profileUser.header_picture}
                      alt="Header"
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

                <div className="h-auto rounded-lg mx-6 -mt-12 flex flex-col justify-between pb-4">
                  {/* Avatar + action buttons */}
                  <div className="flex justify-between items-end">
                    <img
                      src={
                        profileUser?.profile_picture ||
                        "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                      }
                      alt="Profile"
                      className="flex w-24 h-24 object-cover rounded-lg border-4 border-gray-950"
                    />
                    <div className="mt-2 flex gap-2">
                      {isOwner ? (
                        <Link
                          to="/edit-profile"
                          className="text-white p-4 h-9 w-auto bg-gray-600 flex items-center rounded-lg text-sm"
                        >
                          Edit Profile
                        </Link>
                      ) : loggedInUser ? (
                        <>
                          <button
                            onClick={handleFollowProfile}
                            disabled={followLoading}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                              isFollowingProfile
                                ? "bg-transparent border border-gray-500 text-gray-300 hover:border-red-500 hover:text-red-400"
                                : "bg-teal-600 hover:bg-teal-500 text-white"
                            } disabled:opacity-50`}
                          >
                            {followLoading
                              ? "..."
                              : isFollowingProfile
                                ? "Following"
                                : "Follow"}
                          </button>
                          <button
                            onClick={handleMessageClick}
                            disabled={messageLoading}
                            className="px-5 py-2 rounded-full text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
                          >
                            <i className="fa-solid fa-message text-[16px]"></i>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Name + username */}
                  <div className="text-white mt-3">
                    <h3 className="font-medium text-xl">{profileUser?.name}</h3>
                    <p className="text-gray-400 text-sm">
                      @{profileUser?.username}
                    </p>
                  </div>

                  {/* Follower / Following counts */}
                  <div className="flex gap-5 mt-3">
                    <button
                      onClick={() => setSearchParams({ tab: "following" })}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="text-white font-semibold">
                        {followStats.followingCount}
                      </span>{" "}
                      Following
                    </button>
                    <button
                      onClick={() => setSearchParams({ tab: "followers" })}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="text-white font-semibold">
                        {followStats.followerCount}
                      </span>{" "}
                      Followers
                    </button>
                  </div>

                  {/* Joined */}
                  <div className="flex border border-gray-700 h-16 mt-4 rounded-lg">
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
                  onClick={() => setSearchParams({ tab: "posts" })}
                  className={`px-6 py-3 text-sm font-medium relative ${
                    activeTab === "posts"
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Posts
                  {activeTab === "posts" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setSearchParams({ tab: "followers" })}
                  className={`px-6 py-3 text-sm font-medium relative ${
                    activeTab === "followers"
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Followers
                  {activeTab === "followers" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setSearchParams({ tab: "following" })}
                  className={`px-6 py-3 text-sm font-medium relative ${
                    activeTab === "following"
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Following
                  {activeTab === "following" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                  )}
                </button>
                {isOwner && (
                  <button
                    onClick={() => setSearchParams({ tab: "saved" })}
                    className={`px-6 py-3 text-sm font-medium relative ${
                      activeTab === "saved"
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Saved
                    {activeTab === "saved" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 rounded-full" />
                    )}
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div className="overflow-auto scrollbar-hide">
                {/* Posts tab */}
                {activeTab === "posts" && (
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

                {/* Followers / Following tab */}
                {/* Saved posts tab — only visible to owner */}
                {activeTab === "saved" && isOwner && (
                  <div>
                    {savedLoading ? (
                      <div className="flex items-center justify-center py-8 text-white">
                        Loading saved posts...
                      </div>
                    ) : savedPosts.length > 0 ? (
                      savedPosts.map((post) => (
                        <CardPost key={post.id} post={post} />
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8 text-gray-400">
                        No saved posts yet
                      </div>
                    )}
                  </div>
                )}

                {(activeTab === "followers" || activeTab === "following") && (
                  <div>
                    {listsLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : currentList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
                        <i className="fa-solid fa-user-slash text-4xl" />
                        <p className="text-sm">
                          {activeTab === "followers"
                            ? "Belum ada followers"
                            : "Belum mengikuti siapapun"}
                        </p>
                      </div>
                    ) : (
                      currentList.map((person) => (
                        <CardPeople
                          key={person.id}
                          person={person}
                          isFollowing={followingIds.has(person.id)}
                          onFollowChange={handleFollowChange}
                        />
                      ))
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
