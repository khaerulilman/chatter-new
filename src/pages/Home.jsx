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

  return (
    <MainLayout>
      <div className="py-3 px-4 text-white flex border-b border-gray-500">
        <button className="text-lg">
          <i className="fa-solid fa-earth-europe mr-2"></i> Explore
        </button>
      </div>

      <div className="flex border-b border-gray-500">
        {[
          { key: "posts", label: "Posts" },
          { key: "people", label: "People" },
          { key: "news", label: "News" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams({ tab: tab.key })}
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
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide">
        {activeTab === "posts" && <Post />}
        {activeTab === "news" && <News />}
        {activeTab === "people" && <People />}
      </div>
    </MainLayout>
  );
}
