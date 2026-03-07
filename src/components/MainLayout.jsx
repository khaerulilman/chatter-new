import React, { useState } from "react";

import NewPost from "./NewPost";
import LeftPanel from "./LeftPanel";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function MainLayout({ children, leftSlot }) {
  const [showNewPost, setShowNewPost] = useState(false);
  const { user } = useAuth();

  return (
    <section className="h-screen bg-gray-950 overflow-hidden">
      <div className="h-screen flex gap-2 max-lg:gap-0 justify-center">
        {/* Left panel */}
        <LeftPanel
          leftSlot={leftSlot}
          user={user}
          onShowNewPost={() => setShowNewPost(true)}
        />

        {/* Centre panel – page-specific content goes here */}
        <div className="flex flex-col w-5/12 xl:border xl:border-gray-500 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3 max-md:pt-14 overflow-auto scrollbar-hide">
          {children}
        </div>

        {/* Right sidebar – hidden on mobile, visible on md+ */}
        <div className="max-md:hidden max-lg:w-16 w-1/6 h-screen overflow-hidden shrink-0">
          <Sidebar />
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && <NewPost onClose={() => setShowNewPost(false)} />}
    </section>
  );
}
