import React, { useState } from "react";
import Navbar from "./Navbar";
import NewPost from "./NewPost";
import NewPostProfile from "./NewPostProfile";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children, leftSlot }) {
  const [showNewPost, setShowNewPost] = useState(false);
  const { user } = useAuth();

  return (
    <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
      <Navbar />
      <div className="h-screen flex gap-2 max-lg:gap-0 justify-center">
        {/* Left panel */}
        <div className="flex flex-col max-md:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3 p-4 gap-4">
          {leftSlot}
          <NewPostProfile user={user} onClose={() => {}} />
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center justify-center gap-2 w-full bg-teal-700 hover:bg-teal-600 active:bg-teal-800 transition-colors text-white font-semibold py-2.5 rounded-xl shadow-md"
          >
            <i className="fa-solid fa-plus"></i>
            <span className="max-lg:hidden">Create Post</span>
          </button>
        </div>

        {/* Centre panel – page-specific content goes here */}
        <div className="flex flex-col w-5/12 xl:border xl:border-gray-500 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3">
          {children}
        </div>

        {/* Right sidebar */}
        <div className="max-md:block max-md:h-full max-lg:w-16 w-1/6">
          <Sidebar />
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && <NewPost onClose={() => setShowNewPost(false)} />}
    </section>
  );
}
