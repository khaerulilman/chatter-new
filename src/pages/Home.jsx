import News from "./News";
import Post from "./Post";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import People from "./People";
import MainLayout from "../components/MainLayout";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPost, setShowPost] = useState(false);
  const [showNews, setShowNews] = useState(true);
  const [showPeople, setShowPeople] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "posts") {
      setShowPost(true);
      setShowNews(false);
      setShowPeople(false);
    } else if (tab === "people") {
      setShowPost(false);
      setShowNews(false);
      setShowPeople(true);
    } else if (tab === "news") {
      setShowPost(false);
      setShowNews(true);
      setShowPeople(false);
    } else {
      // default to posts
      setShowPost(true);
      setShowNews(false);
      setShowPeople(false);
    }
  }, [searchParams]);

  const handleShowPost = () => {
    setSearchParams({ tab: "posts" });
  };

  const handleShowNews = () => {
    setSearchParams({ tab: "news" });
  };

  const handleShowPeople = () => {
    setSearchParams({ tab: "people" });
  };

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
            showPost ? "text-teal-400 underline" : ""
          }`}
        >
          Posts
        </button>
        <button
          onClick={handleShowPeople}
          className={`hover:text-white transition duration-300 ${
            showPeople ? "text-teal-400 underline" : ""
          }`}
        >
          People
        </button>
        <button
          onClick={handleShowNews}
          className={`hover:text-white transition duration-300 ${
            showNews ? "text-teal-400 underline" : ""
          }`}
        >
          News
        </button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide">
        {showPost && <Post />}
        {showNews && <News />}
        {showPeople && <People />}
      </div>
    </MainLayout>
  );
}
