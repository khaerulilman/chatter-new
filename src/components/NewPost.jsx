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

  // Follower-only state
  const [isFollowerOnly, setIsFollowerOnly] = useState(false);
  const [hiddenContent, setHiddenContent] = useState("");
  const [hiddenFileImages, setHiddenFileImages] = useState([]);
  const [hiddenPreviewImages, setHiddenPreviewImages] = useState([]);

  // Paid post state
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  // Comments disabled state
  const [commentsDisabled, setCommentsDisabled] = useState(false);

  // Current visibility mode: "public" | "follower" | "paid"
  const visibilityMode = isPaid
    ? "paid"
    : isFollowerOnly
      ? "follower"
      : "public";
  const hasHiddenSection = isFollowerOnly || isPaid;

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
    setIsFollowerOnly(false);
    setHiddenContent("");
    setHiddenFileImages([]);
    setHiddenPreviewImages([]);
    setIsPaid(false);
    setPrice("");
    setCommentsDisabled(false);
  };

  const handlePost = async () => {
    if (!user) {
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

      if (isFollowerOnly) {
        formData.append("is_follower_only", "true");
        if (hiddenContent.trim()) {
          formData.append("hidden_content", hiddenContent.trim());
        }
        hiddenFileImages.forEach((file) => {
          formData.append("hidden_media", file);
        });
      }

      if (isPaid) {
        formData.append("is_paid", "true");
        formData.append("price", price);
        if (hiddenContent.trim()) {
          formData.append("hidden_content", hiddenContent.trim());
        }
        hiddenFileImages.forEach((file) => {
          formData.append("hidden_media", file);
        });
      }

      if (commentsDisabled) {
        formData.append("comments_disabled", "true");
      }

      const response = await postsAPI.createPost(formData);

      // Menambahkan post ke context
      addPost({
        id: response.data.post.id,
        content: response.data.post.content,
        media_url: response.data.post.media_url,
        media_urls: response.data.post.media_urls,
        is_follower_only: response.data.post.is_follower_only,
        is_paid: response.data.post.is_paid,
        price: response.data.post.price,
        hidden_content: response.data.post.hidden_content,
        hidden_media_urls: response.data.post.hidden_media_urls,
        is_hidden_unlocked: true, // Owner always sees hidden content
        comments_disabled: response.data.post.comments_disabled,
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

  const handleHiddenImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remaining = MAX_FILES - hiddenFileImages.length;
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
        setHiddenPreviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setHiddenFileImages((prev) => [...prev, ...compressedFiles]);
    e.target.value = "";
  };

  const removeHiddenImage = (index) => {
    setHiddenFileImages((prev) => prev.filter((_, i) => i !== index));
    setHiddenPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
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

        {/* Visibility toggle */}
        <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={visibilityMode === "public"}
              onChange={() => {
                setIsFollowerOnly(false);
                setIsPaid(false);
              }}
              className="accent-teal-500"
              disabled={isSubmitting}
            />
            <span className="text-gray-300 text-sm">
              <i className="fa-solid fa-globe mr-1"></i>Public
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={visibilityMode === "follower"}
              onChange={() => {
                setIsFollowerOnly(true);
                setIsPaid(false);
              }}
              className="accent-teal-500"
              disabled={isSubmitting}
            />
            <span className="text-gray-300 text-sm">
              <i className="fa-solid fa-user-lock mr-1"></i>Follower Only
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="visibility"
              checked={visibilityMode === "paid"}
              onChange={() => {
                setIsPaid(true);
                setIsFollowerOnly(false);
              }}
              className="accent-teal-500"
              disabled={isSubmitting}
            />
            <span className="text-gray-300 text-sm">
              <i className="fa-solid fa-money-bill-wave mr-1"></i>Paid
            </span>
          </label>
        </div>

        <div className="flex flex-col text-white max-h-[60vh] overflow-y-auto scrollbar-hide">
          {/* Public content label */}
          {hasHiddenSection && (
            <div className="px-5 pt-2">
              <span className="text-xs font-medium text-teal-400 flex items-center gap-1">
                <i className="fa-solid fa-globe"></i> Public — visible to
                everyone
              </span>
            </div>
          )}

          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full bg-transparent outline-none px-5 pt-3 pb-1 resize-y scrollbar-hide min-h-[110px] text-white placeholder-gray-500"
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

          {/* Hidden content section (follower-only or paid) */}
          {hasHiddenSection && (
            <div className="px-5 mt-2 pt-3 border-t border-gray-700">
              <span
                className={`text-xs font-medium flex items-center gap-1 mb-2 ${isPaid ? "text-emerald-400" : "text-amber-400"}`}
              >
                {isPaid ? (
                  <>
                    <i className="fa-solid fa-money-bill-wave"></i> Paid — only
                    visible after purchase
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-eye-slash"></i> Hidden — only
                    visible to followers
                  </>
                )}
              </span>

              {/* Price input for paid posts */}
              {isPaid && (
                <div className="mb-3">
                  <label className="text-xs text-gray-400 mb-1 block">
                    Price (Rp 5.000 – Rp 100.000)
                  </label>
                  <input
                    type="number"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent outline-none px-3 py-2 text-white text-sm placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="e.g. 10000"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <textarea
                value={hiddenContent}
                onChange={(e) => setHiddenContent(e.target.value)}
                className="w-full bg-transparent outline-none px-3 py-2 resize-y scrollbar-hide min-h-[80px] text-white placeholder-gray-500 text-sm"
                placeholder={
                  isPaid
                    ? "Write hidden content for paid viewers..."
                    : "Write hidden content for followers..."
                }
                disabled={isSubmitting}
              />

              {hiddenPreviewImages.length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto scrollbar-hide rounded-lg">
                    {hiddenPreviewImages.map((preview, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={preview}
                          alt={`Hidden preview ${index + 1}`}
                          className="rounded-md w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fa-solid fa-eye-slash text-amber-400 text-sm"></i>
                        </div>
                        <button
                          onClick={() => removeHiddenImage(index)}
                          className="absolute top-1 right-1 bg-gray-800/80 hover:bg-gray-700 rounded-full w-5 h-5 flex items-center justify-center"
                        >
                          <i className="fa-solid fa-times text-white text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs mt-1.5">
                    {hiddenFileImages.length}/{MAX_FILES} hidden gambar
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-2 text-gray-400">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleHiddenImageChange}
                  id="upload-hidden-image"
                  className="hidden"
                  disabled={
                    isSubmitting || hiddenFileImages.length >= MAX_FILES
                  }
                />
                <label
                  htmlFor="upload-hidden-image"
                  className={`cursor-pointer transition-colors flex items-center gap-1 text-xs ${isPaid ? "hover:text-emerald-400" : "hover:text-amber-400"}`}
                >
                  <i className="fa-solid fa-image text-sm"></i>
                  <span>Add hidden images</span>
                </label>
              </div>
            </div>
          )}
          {/* Disable comments checkbox */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={commentsDisabled}
                onChange={(e) => setCommentsDisabled(e.target.checked)}
                className="accent-teal-500 w-4 h-4"
                disabled={isSubmitting}
              />
              <span className="text-gray-300 text-sm">
                Disable comments for this post
              </span>
            </label>
          </div>
          <div className="flex px-5 py-3 justify-between items-center border-t border-gray-700 mt-2">
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
                isSubmitting ||
                (!postContent.trim() && fileImages.length === 0) ||
                (isPaid &&
                  (!price || Number(price) < 5000 || Number(price) > 100000))
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
