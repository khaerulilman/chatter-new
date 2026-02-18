import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { usersAPI } from "../api/api";
import ImageCropModal from "../components/ImageCropModal";

export default function EditProfile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState(user?.id || "");
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [headerPicture, setHeaderPicture] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Preview URLs for display before upload
  const [profilePreview, setProfilePreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);

  // Crop modal state
  const [cropModal, setCropModal] = useState(null); // { src, aspect, title, type }

  const profileInputRef = useRef(null);
  const headerInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.username) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await usersAPI.getUserByUsername(user.username);
        const userData = response.data.user;

        // Update form fields with fetched data
        setId(userData.id || "");
        setName(userData.name || "");
        setUsername(userData.username || "");
        setEmail(userData.email || "");
        setCreatedAt(userData.created_at || "");
        setUpdatedAt(userData.updated_at || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.username, navigate]);

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    navigate("/", { replace: true });
  };

  // Open file picker → then open crop modal
  const openPicker = (type) => {
    if (type === "profile") profileInputRef.current?.click();
    else headerInputRef.current?.click();
  };

  const handleFileSelected = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const src = URL.createObjectURL(file);
    setCropModal({
      src,
      aspect: type === "profile" ? 1 : 3,
      title:
        type === "profile" ? "Crop Profile Picture" : "Crop Header Picture",
      type,
    });
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleCropApply = (croppedFile) => {
    if (cropModal.type === "profile") {
      setProfilePicture(croppedFile);
      setProfilePreview(URL.createObjectURL(croppedFile));
    } else {
      setHeaderPicture(croppedFile);
      setHeaderPreview(URL.createObjectURL(croppedFile));
    }
    setCropModal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pastikan user dan token tersedia
    if (!user || !localStorage.getItem("token")) {
      setError("User not authenticated. Please login again.");
      navigate("/login");
      return;
    }

    // Validasi tipe file
    if (
      profilePicture &&
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        profilePicture.type,
      )
    ) {
      setError("Invalid file type for profile picture.");
      return;
    }

    if (
      headerPicture &&
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        headerPicture.type,
      )
    ) {
      setError("Invalid file type for header picture.");
      return;
    }

    try {
      const formData = new FormData();

      // Hanya tambahkan field yang diubah
      if (id !== user.id) formData.append("id", id);
      if (name !== user.name) formData.append("name", name);
      if (email !== user.email) formData.append("email", email);
      if (password) formData.append("password", password);
      if (profilePicture) formData.append("profile_picture", profilePicture);
      if (headerPicture) formData.append("header_picture", headerPicture);

      const response = await usersAPI.updateProfile(formData);

      // Fetch fresh user data from API
      const freshUserRes = await usersAPI.getUserByUsername(user.username);
      const freshUserData = freshUserRes.data.user;

      // Update user context dengan data terbaru dari API
      setUser({
        id: freshUserData.id,
        name: freshUserData.name,
        email: freshUserData.email,
        username: freshUserData.username,
        profile_picture: freshUserData.profile_picture,
        header_picture: freshUserData.header_picture,
        created_at: freshUserData.created_at,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.error ||
          "An error occurred while updating the profile.",
      );
    }
  };

  // Render hanya jika user ada
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <section className="h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </section>
    );
  }

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={profileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(e) => handleFileSelected(e, "profile")}
      />
      <input
        ref={headerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={(e) => handleFileSelected(e, "header")}
      />

      {/* Crop modal */}
      {cropModal && (
        <ImageCropModal
          imageSrc={cropModal.src}
          aspect={cropModal.aspect}
          title={cropModal.title}
          onCancel={() => setCropModal(null)}
          onApply={handleCropApply}
        />
      )}

      <section className="min-h-screen bg-gray-950 flex items-center justify-center py-6">
        <div className="flex w-4/5 gap-6">
          {/* Sidebar Left */}
          <div className="w-1/4 flex flex-col gap-6 flex-shrink-0">
            {/* Profile picture */}
            <div className="flex justify-center">
              <div
                className="relative group cursor-pointer"
                onClick={() => openPicker("profile")}
              >
                <img
                  src={profilePreview || user?.profile_picture}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-700"
                />
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fa-solid fa-camera text-white text-xl"></i>
                </div>
              </div>
            </div>

            {/* Header picture preview */}
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 text-xs text-center">Header</p>
              <div
                className="relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => openPicker("header")}
              >
                <img
                  src={headerPreview || user?.header_picture}
                  alt="Header"
                  className="w-full h-20 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <i className="fa-solid fa-camera text-white text-lg"></i>
                </div>
              </div>
            </div>

            <ul className="text-gray-300 flex flex-col gap-2">
              <li className="hover:text-white">
                <Link to="/">
                  <i className="fa-solid fa-arrow-left mr-2"></i> Back to
                  Chatter
                </Link>
              </li>
              <li className="hover:text-white">
                <button onClick={handleLogout} className="flex items-center">
                  <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>{" "}
                  Logout
                </button>
              </li>
            </ul>
          </div>
          {/* Content Edit Profile */}
          <div className="flex flex-col w-3/4 p-6">
            <h2 className="text-white text-2xl mb-4">Edit Profile</h2>
            {error && <p className="text-red-500">{error}</p>}{" "}
            {/* Display error message */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Display Name */}
              <div>
                <label className="text-gray-300">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white outline-none focus:placeholder:text-gray-500"
                  placeholder="Your full name or fun name"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-gray-300">Username</label>
                <input
                  type="text"
                  value={username}
                  disabled
                  className="w-full p-2 rounded bg-gray-600 text-gray-400 outline-none cursor-not-allowed"
                  placeholder="Your username"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-gray-300">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded bg-gray-600 text-gray-400 outline-none cursor-not-allowed"
                  placeholder="Your email address"
                />
              </div>
              {/* Created At */}
              <div>
                <label className="text-gray-300">Account Created</label>
                <input
                  type="text"
                  value={createdAt ? new Date(createdAt).toLocaleString() : ""}
                  disabled
                  className="w-full p-2 rounded bg-gray-600 text-gray-400 outline-none cursor-not-allowed"
                  placeholder="Account creation date"
                />
              </div>

              {/* Updated At */}
              <div>
                <label className="text-gray-300">Last Updated</label>
                <input
                  type="text"
                  value={updatedAt ? new Date(updatedAt).toLocaleString() : ""}
                  disabled
                  className="w-full p-2 rounded bg-gray-600 text-gray-400 outline-none cursor-not-allowed"
                  placeholder="Last update date"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-500"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
