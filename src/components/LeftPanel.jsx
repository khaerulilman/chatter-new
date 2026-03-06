import React from "react";
import { Link } from "react-router-dom";
import imgLogo from "../assets/img/LogoChatter.png";
import NewPostProfile from "./NewPostProfile";

export default function LeftPanel({ leftSlot, user, onShowNewPost }) {
  return (
    <>
      {/* visible mobile */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800 px-4 py-2.5 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-lg"
        >
          <img src={imgLogo} alt="Logo Chatter" className="w-10" />
          <p className="text-lg">Chatter</p>
        </Link>

        <div className="flex">
          <button
            onClick={onShowNewPost}
            className="flex items-center justify-center w-36 sm:w-40 bg-teal-700 hover:bg-teal-600 active:bg-teal-800 transition-colors text-white font-semibold  rounded-xl shadow-md mr-2"
          >
            <span>Create Post</span>
          </button>

          <NewPostProfile user={user} variant="avatar" />
        </div>
      </nav>

      {/* visible desktop */}
      <div className="flex flex-col max-md:hidden w-1/5 max-lg:w-6/12 xl:mt-3 p-4 gap-4">
        {leftSlot}
        <NewPostProfile user={user} />
        <button
          onClick={onShowNewPost}
          className="flex items-center justify-center gap-2 w-full bg-teal-700 hover:bg-teal-600 active:bg-teal-800 transition-colors text-white font-semibold py-2.5 rounded-xl shadow-md"
        >
          <i className="fa-solid fa-plus"></i>
          <span>Create Post</span>
        </button>
      </div>
    </>
  );
}
