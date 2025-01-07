import './index.css';
import { UserProvider } from "./UserContext";
import { PostsProvider } from "./PostsContext";
import { CommentsProvider } from './CommentsContext'; // Import CommentsProvider
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Otp from './pages/Otp';
import Notifications from './pages/Notifications';
import EditProfile from './pages/EditProfile.jsx';

function App() {
  return (
    <UserProvider>
      <PostsProvider>
        <CommentsProvider> 
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/otp" element={<Otp />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
          </Router>
        </CommentsProvider>
      </PostsProvider>
    </UserProvider>
  );
}

export default App;
