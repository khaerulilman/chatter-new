import Sidebar from "../components/Sidebar.jsx";
import News from "./News";
import NewPost from "../components/NewPost";
import Post from "./Post";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import People from "./People";
import Search from "../components/Search.jsx";

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

  // Cek ukuran layar untuk menentukan apakah NewPost harus dinonaktifkan
  const isMobile = window.innerWidth < 600;

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
            <div className="py-3 px-4 text-white flex border-b border-gray-500">
              <button className="text-lg">
                <i className="fa-solid fa-earth-europe mr-2"></i> Explore
              </button>
            </div>

            <div className="py-3 justify-between flex px-10 text-gray-400 border-b border-gray-500">
              <button
                onClick={handleShowPost}
                className="hover:text-white transition duration-300"
              >
                Posts
              </button>
              <button
                onClick={handleShowPeople}
                className="hover:text-white transition duration-300"
              >
                People
              </button>
              <button
                onClick={handleShowNews}
                className="hover:text-white transition duration-300"
              >
                News
              </button>
            </div>

            <div className="flex-1 overflow-auto scrollbar-hide">
              {showPost && <Post />}
              {showNews && <News />}
              {showPeople && <People />}
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
