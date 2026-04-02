import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import AuthLayout from '../layout/AuthLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CommunityPage from '../pages/CommunityPage';
import ProfilePage from '../pages/ProfilePage';
import ChatPage from '../pages/ChatPage';
import Notifications from '../pages/Notifications';
import CreatePost from '../pages/CreatePost';
import Library from '../pages/Library';
import Leaderboard from '../pages/Leaderboard';
import Popular from '../pages/Popular';
import AllCommunities from '../pages/AllCommunities';
import Events from '../pages/Events';
import HelpCenter from '../pages/HelpCenter';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-orange-glow animate-pulse">
                C
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-white font-black text-xl tracking-tighter">CollegeConnect</h2>
                <div className="w-48 h-1 background-dark-600 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-primary animate-loading-bar"></div>
                </div>
            </div>
        </div>
    );

    return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route path="/" element={
                <PrivateRoute>
                    <MainLayout />
                </PrivateRoute>
            }>
                <Route index element={<Home />} />
                <Route path="r/:communityId" element={<CommunityPage />} />
                <Route path="r/:communityId/comments/:postId" element={<Home />} />
                <Route path="u/:userId" element={<ProfilePage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="submit" element={<CreatePost />} />
                <Route path="library" element={<Library />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="popular" element={<Popular />} />
                <Route path="communities" element={<AllCommunities />} />
                <Route path="events" element={<Events />} />
                <Route path="help" element={<HelpCenter />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
