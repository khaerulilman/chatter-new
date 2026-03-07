import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "../context/AuthContext";
import { usePosts } from "../context/PostsContext";
import { useNavigate } from "react-router-dom";
import NewPostProfile from "./NewPostProfile";
import { postsAPI } from "../api/api";
import { useToast } from "./Toast";

export default function NewPost({ onClose }) {
  const { user } = useAuth();
  const { addPost } = usePosts();
  const navigate = useNavigate();
  const showToast = useToast();
  const [fileImages, setFileImages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
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

  const MAX_FILES = 30;

  // Compress image using canvas — returns a compressed File
  const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/") || file.type === "image/gif") {
        resolve(file);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            const compressed = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/jpeg",
          quality,
        );
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = MAX_FILES - fileImages.length;
    if (remaining <= 0) {
      alert(`Maksimal ${MAX_FILES} gambar per post.`);
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remaining);
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const MAX_SIZE = 20 * 1024 * 1024;

    const validFiles = filesToAdd.filter((file) => {
      if (!supportedTypes.includes(file.type)) {
        alert(
          `Format file "${file.name}" tidak didukung. Gunakan jpeg, png, gif, atau webp.`,
        );
        return false;
      }
      if (file.size > MAX_SIZE) {
        alert(`File "${file.name}" terlalu besar. Maksimal 20MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const compressedFiles = await Promise.all(
      validFiles.map((file) => compressImage(file)),
    );

    compressedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setFileImages((prev) => [...prev, ...compressedFiles]);
    e.target.value = "";
  };

  const resetForm = () => {
    setPostContent("");
    setFileImages([]);
    setPreviewImages([]);
    setShowEmojiPicker(false);
  };

  const handlePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!postContent.trim() && fileImages.length === 0) {
      showToast("Please add content or an image for your post", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", postContent.trim());

      fileImages.forEach((file) => {
        formData.append("media", file);
      });

      const response = await postsAPI.createPost(formData);

      // Menambahkan post ke context
      addPost({
        id: response.data.post.id,
        content: response.data.post.content,
        media_url: response.data.post.media_url,
        media_urls: response.data.post.media_urls,
        user_name: currentUser.name,
        user_id: currentUser.id,
        profile_picture: currentUser.profile_picture,
        created_at: new Date().toISOString(),
        likes: 0,
      });

      resetForm();
      showToast("Post created successfully!", "post");
      onClose?.();
      navigate("/?tab=posts"); // Redirect ke tab posts
    } catch (error) {
      console.error("Error saat membuat post:", error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to create post",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (index) => {
    setFileImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
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

          {previewImages.length > 0 && (
            <div className="px-5 pb-3">
              <div className="grid grid-cols-3 gap-1.5 max-h-60 overflow-y-auto scrollbar-hide rounded-lg">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Upload preview ${index + 1}`}
                      className="rounded-md w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-gray-800/80 hover:bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <i className="fa-solid fa-times text-white text-[10px]"></i>
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-1.5">
                {fileImages.length}/{MAX_FILES} gambar
              </p>
            </div>
          )}

          <div className="flex px-5 py-3 justify-between items-center border-t border-gray-700">
            <div className="flex gap-3 text-gray-400">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                id="upload-image"
                className="hidden"
                disabled={isSubmitting || fileImages.length >= MAX_FILES}
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
              disabled={
                isSubmitting || (!postContent.trim() && fileImages.length === 0)
              }
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
