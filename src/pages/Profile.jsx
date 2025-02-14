import News from "./News";
import NewPost from "../components/NewPost";
import Post from "./Post";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { useUser } from "../UserContext";

export default function Profile() {
  const [showPost, setShowPost] = useState(false);
  const [showNews, setShowNews] = useState(true);
  const [showNewsPost, setShowNewsPost] = useState(false);
  const { user } = useUser(); // State untuk menyimpan data pengguna

  const handleShowPost = () => {
    setShowPost(true);
    setShowNews(false);
    setShowNewsPost(false);
  };

  const handleShowNews = () => {
    setShowPost(false);
    setShowNews(true);
    setShowNewsPost(false);
  };

  return (
    <>
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar onClick={() => {}} />
        <div className="h-screen bg-gray-950 flex gap-2 max-lg:gap-0 justify-center ">
          <div className="flex flex-col max-lg:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3">
            <div className="py-3 px-4 text-white flex bg-gray-900 rounded-lg">
              <div className="flex w-full items-center border-gray-600 border py-2 px-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Search"
                  className="outline-none bg-transparent w-full"
                />
                <i className="fa-solid fa-magnifying-glass ml-2 text-gray-400"></i>
              </div>
            </div>
            <NewPost />
          </div>

          <div className="flex flex-col w-5/12 xl:border xl:border-gray-700 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3 ">
            <div className="py-3 px-4 text-white flex border-b border-gray-700">
              <Link to="/home" className="text-lg">
                <i className="fa-solid fa-arrow-left mr-2"></i> Back
              </Link>
            </div>

            <div className="overflow-auto scrollbar-hide">
              <div className="flex flex-col h-96 border-b border-gray-700">
                <div className="flex h-40 bg-slate-900 w-full">
                  {user && user.header_picture ? (
                    <img
                      src={user.header_picture}
                      alt="Profile Header"
                      className="flex w-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://ik.imagekit.io/fs0yie8l6/smooth-gray-background-with-high-quality_53876-124606.avif?updatedAt=1736214212559" // URL gambar header default
                      alt="Default Header"
                      className="flex w-full object-cover"
                    />
                  )}
                </div>

                <div className="h-auto rounded-lg mx-6 -mt-12 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <img
                      src={
                        user?.profile_picture ||
                        "https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                      } // Default profile picture
                      alt="Profile"
                      className="flex w-24 h-full object-cover rounded-lg"
                    />

                    <Link
                      to="/edit-profile"
                      className="text-white mt-16 p-4 h-9 w-auto bg-gray-600 flex items-center rounded-lg"
                    >
                      Edit Profile
                    </Link>
                  </div>
                  <div className="text-white mt-3">
                    {user ? (
                      <>
                        <h3 className="font-medium text-xl">{user.name}</h3>
                      </>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>

                  <div className="flex border border-gray-700 h-16 mt-5 rounded-lg">
                    <div className="flex flex-col justify-center ml-4 text-gray-500">
                      <h3 className="text-sm">Joined</h3>
                      <p className="text-sm">20 June 2023</p>{" "}
                      {/* Replace this with actual join date if available */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-3 justify-evenly flex px-10 text-gray-400 border-b border-gray-700">
                <button
                  onClick={handleShowPost}
                  className="hover:text-white transition duration-300"
                >
                  Posts
                </button>
                <button
                  onClick={handleShowNews}
                  className="hover:text-white transition duration-300"
                >
                  News
                </button>
              </div>

              <div className="overflow-auto scrollbar-hide">
                {showPost && <Post />}
                {showNews && <News />}
                {showNewsPost && <NewPost />}
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
