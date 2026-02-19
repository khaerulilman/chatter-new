import Sidebar from "../components/Sidebar.jsx";
import NewPost from "../components/NewPost";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  // Cek ukuran layar untuk menentukan apakah NewPost harus dinonaktifkan
  const isMobile = window.innerWidth < 600;

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <section className="h-screen bg-gray-950 scrollbar-hide overflow-auto">
        <Navbar />
        <div className="h-screen flex gap-2 max-lg:gap-0 justify-center">
          <div className="flex flex-col max-md:hidden w-1/5 max-md:w-full max-lg:w-6/12 xl:mt-3">
            <div className="px-4 text-white flex rounded-lg">
              <div className="flex w-full items-center bg-gray-900 border-gray-800 border py-2 px-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Search"
                  className="outline-none bg-transparent w-full"
                />
                <i className="fa-solid fa-magnifying-glass ml-2 text-gray-400"></i>
              </div>
            </div>
            {/* Tampilkan NewPost hanya jika bukan mobile */}
            {!isMobile && <NewPost disabled={isMobile} />}
          </div>

          <div className="flex flex-col w-5/12 xl:border xl:border-gray-500 max-lg:border-x max-md:border-r max-md:border-l-0 max-lg:w-full max-lg:border-gray-500 xl:rounded-md xl:mt-3">
            {/* NotFound Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-white p-8">
              <div className="text-center space-y-6">
                <i className="fa-solid fa-exclamation-triangle text-6xl text-gray-400 mb-4"></i>
                <h1 className="text-4xl font-bold text-gray-300">404</h1>
                <h2 className="text-2xl font-semibold text-gray-400">
                  Page Not Found
                </h2>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  Oops! The page you're looking for doesn't exist. It might have
                  been moved, deleted, or you entered the wrong URL.
                </p>
                <button
                  onClick={handleGoHome}
                  className="bg-teal-700 hover:bg-teal-600 transition-colors duration-300 px-8 py-3 rounded-lg font-medium text-white mt-6 flex items-center gap-2 mx-auto"
                >
                  <i className="fa-solid fa-home"></i>
                  Go to Home
                </button>
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
