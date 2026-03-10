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
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

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
            </Route>
        </Routes>
    );
};

export default AppRoutes;
