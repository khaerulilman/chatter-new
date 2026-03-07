import News from "./News";
import Post from "./Post";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import People from "./People";
import MainLayout from "../components/MainLayout";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab =
    rawTab === "posts" || rawTab === "people" || rawTab === "news"
      ? rawTab
      : "posts";

  useEffect(() => {
    if (rawTab !== activeTab) {
      setSearchParams({ tab: "posts" }, { replace: true });
    }
  }, [rawTab, activeTab, setSearchParams]);

  const handleShowPost = () => setSearchParams({ tab: "posts" });
  const handleShowNews = () => setSearchParams({ tab: "news" });
  const handleShowPeople = () => setSearchParams({ tab: "people" });

  return (
    <MainLayout>
      <div className="py-3 px-4 text-white flex border-b border-gray-500">
        <button className="text-lg">
          <i className="fa-solid fa-earth-europe mr-2"></i> Explore
        </button>
      </div>

      <div className="py-3 justify-between flex px-10 text-gray-400 border-b border-gray-500">
        <button
          onClick={handleShowPost}
          className={`hover:text-white transition duration-300 ${
            activeTab === "posts" ? "text-teal-400 underline" : ""
          }`}
        >
          Posts
        </button>
        <button
          onClick={handleShowPeople}
          className={`hover:text-white transition duration-300 ${
            activeTab === "people" ? "text-teal-400 underline" : ""
          }`}
        >
          People
        </button>
        <button
          onClick={handleShowNews}
          className={`hover:text-white transition duration-300 ${
            activeTab === "news" ? "text-teal-400 underline" : ""
          }`}
        >
          News
        </button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide">
        {activeTab === "posts" && <Post />}
        {activeTab === "news" && <News />}
        {activeTab === "people" && <People />}
      </div>
    </MainLayout>
  );
}
