import { Link, useNavigate } from "react-router-dom";
import imgLogo from "../assets/img/LogoChatter.png";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { usersAPI } from "../api/api";

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

      // Update user context dengan data dari response
      setUser((prevUser) => ({
        ...prevUser,
        ...(response.data.data || {}),
      }));

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
    <section className="h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex h-4/5 w-4/5">
        {/* Sidebar Left */}
        <div className="w-1/4 flex flex-col gap-8">
          <div className="flex justify-center">
            <img src={imgLogo} alt="logo-chatter" className="w-28" />
          </div>
          <ul className="text-gray-300 flex flex-col gap-2">
            <li className="hover:text-white">
              <Link to="/">
                <i className="fa-solid fa-arrow-left mr-2"></i> Back to Chatter
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
        <div className="flex flex-col w-3/4 p-6 ">
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
            {/* Profile Picture */}
            <div>
              <label className="text-gray-300" htmlFor="profilePicture">
                Profile Picture
              </label>
              <input
                type="file"
                id="profilePicture"
                onChange={(e) => setProfilePicture(e.target.files[0])}
                className="w-full p-2 rounded bg-gray-700 text-white"
                accept="image/png, image/jpeg, image/gif, image/webp"
              />
            </div>

            {/* Header Picture */}
            <div>
              <label className="text-gray-300" htmlFor="headerPicture">
                Header Picture
              </label>
              <input
                type="file"
                id="headerPicture"
                onChange={(e) => setHeaderPicture(e.target.files[0])}
                className="w-full p-2 rounded bg-gray-700 text-white"
                accept="image/png, image/jpeg, image/gif, image/webp"
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
  );
}
