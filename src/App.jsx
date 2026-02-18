import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PostsProvider } from "./context/PostsContext.jsx";
import { ChatsProvider } from "./context/ChatsContext.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import Otp from "./pages/Otp";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ForgotPasswordVerify from "./pages/ForgotPasswordVerify.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Chats from "./pages/Chats.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <ChatsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />

              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/otp"
                element={
                  <PublicRoute>
                    <Otp />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password/verify"
                element={
                  <PublicRoute>
                    <ForgotPasswordVerify />
                  </PublicRoute>
                }
              />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/chats/:conversationId" element={<Chats />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>{" "}
        </ChatsProvider>
      </PostsProvider>{" "}
    </AuthProvider>
  );
}

export default App;
