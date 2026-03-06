import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { useNavigate } from "react-router-dom";
import NewPostProfile from "./NewPostProfile";
import { postsAPI } from "../api/api";

export default function NewPost({ onClose }) {
  const { user } = useAuth();
  const { addPost } = usePosts();
  const navigate = useNavigate();
  const [fileImage, setFileImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentUser, setCurrentUser] = useState(user);
  const emojiPickerRef = useRef(null);

  // Sync currentUser whenever user context changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Close emoji picker when clicking outside
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
    ];
    if (!supportedTypes.includes(file.type)) {
      alert(
        "Format file tidak didukung. Gunakan gambar (jpeg, png, gif) atau video (mp4).",
      );
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      alert("Ukuran file terlalu besar. Maksimal 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      console.log("Preview Image:", reader.result);
    };
    reader.readAsDataURL(file);
    setFileImage(file);
  };

  const resetForm = () => {
    setPostContent("");
    setFileImage(null);
    setPreviewImage(null);
    setShowEmojiPicker(false);
  };

  const handlePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!postContent.trim() && !fileImage) {
      alert("Silakan tambahkan konten atau gambar untuk post Anda");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", postContent.trim()); // Hanya kirim content

      if (fileImage) {
        formData.append("media", fileImage); // Menambahkan file media jika ada
      }

      const response = await postsAPI.createPost(formData);

      // Menambahkan post ke context
      addPost({
        id: response.data.post.id,
        content: response.data.post.content,
        media_url: response.data.post.media_url,
        user_name: currentUser.name,
        user_id: currentUser.id,
        profile_picture: currentUser.profile_picture,
        created_at: new Date().toISOString(),
        likes: 0,
      });

      resetForm();
      alert("Post berhasil dibuat!");
      onClose?.();
      navigate("/?tab=posts"); // Redirect ke tab posts
    } catch (error) {
      console.error("Error saat membuat post:", error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat membuat post",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setFileImage(null);
    setPreviewImage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="flex flex-col w-full max-w-lg bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-base">Create Post</h2>
          <button
            onClick={() => onClose?.()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Author info */}
        <NewPostProfile user={currentUser} onClose={onClose} />

        <div className="flex flex-col text-white">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full bg-transparent outline-none px-5 pt-3 pb-1 resize-none scrollbar-hide min-h-[110px] text-white placeholder-gray-500"
            placeholder="What's on your mind?"
            disabled={isSubmitting}
            autoFocus
          />

          {previewImage && (
            <div className="h-auto w-full px-5 pb-3 relative">
              <img
                src={previewImage}
                alt="Upload preview"
                className="rounded-lg h-40 w-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-7 bg-gray-800/80 hover:bg-gray-700 rounded-full w-7 h-7 flex items-center justify-center"
              >
                <i className="fa-solid fa-times text-white text-sm"></i>
              </button>
            </div>
          )}

          <div className="flex px-5 py-3 justify-between items-center border-t border-gray-700">
            <div className="flex gap-3 text-gray-400">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleImageChange}
                id="upload-image"
                className="hidden"
                disabled={isSubmitting}
              />
              <label
                htmlFor="upload-image"
                className="cursor-pointer hover:text-white transition-colors"
              >
                <i className="fa-solid fa-image text-xl"></i>
              </label>
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
              disabled={isSubmitting || (!postContent.trim() && !fileImage)}
            >
              {isSubmitting ? "Posting..." : "Post"}
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
