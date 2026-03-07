import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { useNavigate } from "react-router-dom";
import NewPostProfile from "./NewPostProfile";
import { postsAPI } from "../api/api";

export default function ShareNewsModal({ article, onClose }) {
  const { user } = useAuth();
  const { addPost } = usePosts();
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handlePost = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const newsBlock = `\n\n📰 ${article.title}\n📌 ${article.source.name}\n🔗 ${article.url}`;
      const fullContent = postContent.trim()
        ? postContent.trim() + newsBlock
        : newsBlock.trim();

      const formData = new FormData();
      formData.append("content", fullContent);

      const response = await postsAPI.createPost(formData);

      addPost({
        id: response.data.post.id,
        content: response.data.post.content,
        media_url: response.data.post.media_url,
        media_urls: response.data.post.media_urls,
        user_name: user.name,
        user_id: user.id,
        profile_picture: user.profile_picture,
        created_at: new Date().toISOString(),
        likes: 0,
      });

      onClose?.();
      navigate("/?tab=posts");
    } catch (error) {
      console.error("Error sharing news:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat membagikan berita",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="flex flex-col w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <i className="fa-solid fa-share-nodes text-teal-400"></i>
            Share News
          </h2>
          <button
            onClick={() => onClose?.()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Author */}
        <NewPostProfile user={user} onClose={onClose} />

        <div className="flex flex-col text-white">
          {/* Text input */}
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full bg-transparent outline-none px-5 pt-3 pb-1 resize-none scrollbar-hide min-h-[80px] text-white placeholder-gray-500"
            placeholder="Tambahkan komentar..."
            disabled={isSubmitting}
            autoFocus
          />

          {/* News preview card */}
          <div className="mx-5 mb-4 border border-gray-700 rounded-xl overflow-hidden p-4">
            <h3 className="text-gray-400 text-sm mb-2">
              {article.source.name}
            </h3>
            <div className="flex text-white gap-2 items-center">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base w-5/6 hover:text-gray-400 leading-snug"
                onClick={(e) => e.stopPropagation()}
              >
                {article.title}
              </a>
              {article.image && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="rounded-md w-36 h-28 object-cover shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
                  />
                </a>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex px-5 py-3 justify-between items-center border-t border-gray-700">
            <div className="flex gap-3 text-gray-400">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <i className="fa-regular fa-face-smile text-xl"></i>
              </button>
            </div>

            <button
              className="bg-teal-700 hover:bg-teal-600 transition-colors rounded-md px-10 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePost}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sharing..." : "Share"}
            </button>
          </div>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute z-20 bottom-14 left-4"
            >
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setPostContent((prev) => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
