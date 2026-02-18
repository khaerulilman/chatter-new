import React, { useEffect, useState, useCallback } from "react";
import { followsAPI } from "../api/api";
import CardPeople from "../components/CardPeople";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { key: "recommended", label: "Discover" },
  { key: "followers", label: "Followers" },
  { key: "following", label: "Following" },
];

export default function People() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("recommended");
  const [lists, setLists] = useState({
    recommended: [],
    followers: [],
    following: [],
  });
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [idsRes, recRes, followersRes, followingRes] = await Promise.all([
        followsAPI.getFollowingIds(),
        followsAPI.getRecommendedUsers(),
        followsAPI.getFollowers(user.id),
        followsAPI.getFollowing(user.id),
      ]);

      setFollowingIds(new Set(idsRes.data.data));
      setLists({
        recommended: recRes.data.data,
        followers: followersRes.data.data,
        following: followingRes.data.data,
      });
    } catch (error) {
      console.error("Error fetching people data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFollowChange = useCallback((userId, isNowFollowing) => {
    setFollowingIds((prev) => {
      const next = new Set(prev);
      isNowFollowing ? next.add(userId) : next.delete(userId);
      return next;
    });

    // Optimistic update: move user between lists
    setLists((prev) => {
      const recommended = [...prev.recommended];
      const following = [...prev.following];
      const followers = [...prev.followers];

      if (isNowFollowing) {
        // Move from recommended to following
        const idx = recommended.findIndex((p) => p.id === userId);
        if (idx !== -1) {
          const [person] = recommended.splice(idx, 1);
          following.unshift(person);
        }
      } else {
        // Move from following back to recommended
        const idx = following.findIndex((p) => p.id === userId);
        if (idx !== -1) {
          const [person] = following.splice(idx, 1);
          recommended.push(person);
        }
      }

      return { recommended, following, followers };
    });
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
        <i className="fa-solid fa-users text-5xl text-gray-600"></i>
        <div className="text-center">
          <p className="text-white text-lg font-medium">
            Temukan Pengguna Lainnya
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Login untuk melihat dan terhubung dengan pengguna lain
          </p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Link
            to="/login"
            className="flex-1 text-center bg-teal-700 hover:bg-teal-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="flex-1 text-center bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 rounded-lg font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const currentList = lists[activeTab] ?? [];

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.key
                ? "text-teal-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full" />
            )}
            {tab.key !== "recommended" && (
              <span className="ml-1.5 text-xs bg-gray-700 text-gray-300 rounded-full px-1.5 py-0.5">
                {lists[tab.key]?.length ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
          <i className="fa-solid fa-user-slash text-4xl" />
          <p className="text-sm">
            {activeTab === "recommended"
              ? "Tidak ada pengguna baru untuk diikuti"
              : activeTab === "followers"
                ? "Belum ada yang mengikutimu"
                : "Kamu belum mengikuti siapapun"}
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
  );
}
