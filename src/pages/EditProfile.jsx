import { Link, useNavigate } from "react-router-dom";
import imgLogo from "../assets/img/LogoChatter.png";
import { useUser } from "../UserContext";
import { useState, useEffect } from "react";
import axios from "axios";

export default function EditProfile() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [id, setId] = useState(user?.id || "");
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [headerPicture, setHeaderPicture] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setId(user.id || "");
      setName(user.name || "");
    } else {
      // Jika user tidak ada, redirect ke halaman login
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setUser(null); // Update context to null
    navigate("/", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pastikan user dan token tersedia
    if (!user || !user.token) {
      setError("User not authenticated. Please login again.");
      navigate("/login");
      return;
    }

    // Validasi tipe file
    if (
      profilePicture &&
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        profilePicture.type
      )
    ) {
      setError("Invalid file type for profile picture.");
      return;
    }

    if (
      headerPicture &&
      !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
        headerPicture.type
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
      if (password) formData.append("password", password);
      if (profilePicture) formData.append("profile_picture", profilePicture);
      if (headerPicture) formData.append("header_picture", headerPicture);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/edit-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update user context dengan data dari response
      setUser((prevUser) => ({
        ...prevUser,
        ...(response.data.data || {}),
        token: response.data.token || prevUser.token,
      }));

      alert("Profile updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error.response?.data?.error ||
          "An error occurred while updating the profile."
      );
    }
  };

  // Render hanya jika user ada
  if (!user) {
    return null;
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
              <Link to="/home">
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

            {/* Password */}
            <div>
              <label className="text-gray-300" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white outline-none focus:placeholder:text-gray-500"
                placeholder="Enter your password"
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
