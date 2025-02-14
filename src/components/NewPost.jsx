import { useState, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import { useUser } from "../UserContext";
import { usePosts } from "../PostsContext";

export default function NewPost() {
  const { user } = useUser();
  const { addPost } = usePosts();
  const [fileImage, setFileImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (user?.token) {
      console.log("Token tersedia:", user.token.substring(0, 20) + "...");
    } else {
      console.log("Token tidak tersedia");
    }
  }, [user]);

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
        "Format file tidak didukung. Gunakan gambar (jpeg, png, gif) atau video (mp4)."
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
    if (!user?.token) {
      alert("Silakan login terlebih dahulu");
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

      const response = await fetch(
        "http://localhost:3000/api/auth/create-post",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`, // Menambahkan header Authorization dengan token Bearer
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat post");
      }

      // Menambahkan post ke context
      addPost({
        id: data.post.id,
        content: data.post.content,
        media_url: data.post.media_url,
        user_name: user.name,
        user_id: user.id,
        profile_picture: user.profile_picture,
        created_at: new Date().toISOString(),
        likes: 0,
      });

      resetForm();
      alert("Post berhasil dibuat!");

      window.location.reload(); // Reload untuk melihat post baru
    } catch (error) {
      console.error("Error saat membuat post:", error);
      alert(error.message || "Terjadi kesalahan saat membuat post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setFileImage(null);
    setPreviewImage(null);
  };

  return (
    <div className="flex flex-col p-4 gap-8 h-screen">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded-lg overflow-hidden">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <img
                src="https://ik.imagekit.io/fs0yie8l6/images%20(13).jpg?updatedAt=1736213176171"
                alt="Default Profile"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
          <div className="flex flex-col text-gray-400">
            <p className="text-white">{user?.name || "Guest"}</p>
          </div>
        </div>
        <button className="text-gray-400">
          <i className="fa-solid fa-ellipsis"></i>
        </button>
      </div>

      <div className="flex flex-col text-white bg-gray-900 rounded-lg">
        <textarea
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          className="w-full bg-transparent outline-none p-3 resize-none scrollbar-hide min-h-[100px]"
          placeholder="What's on your mind?"
          disabled={isSubmitting}
        />

        {previewImage && (
          <div className="h-auto w-full p-3 mt-8 relative">
            <img
              src={previewImage}
              alt="Upload preview"
              className="rounded-md h-36 w-full object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute top-5 right-5 bg-gray-800 rounded-full p-1"
            >
              <i className="fa-solid fa-times text-white"></i>
            </button>
          </div>
        )}

        <div className="flex px-4 py-2 justify-between items-center">
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
          <div className="absolute z-10 mt-20">
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
  );
}
