import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/post/PostCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const userRes = await api.get(`/users/${userId}`);
                const userData = userRes.data.data.user;
                setProfileUser(userData);

                const postsRes = await api.get(`/posts/user/${userData._id}`);
                setPosts(postsRes.data.data.posts);
            } catch (err) {
                console.error("Failed to load profile:", err);
                setError("User not found or failed to load");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfileData();
        }
    }, [userId]);

    if (loading) return <div className="text-center py-10">Loading profile...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!profileUser) return null;

    return (
        <div>
            <ProfileHeader
                user={profileUser}
                isOwnProfile={currentUser?._id === profileUser._id}
                onUpdate={setProfileUser}
            />

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-200">Posts</h3>
                {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post._id} post={post} />)
                ) : (
                    <div className="text-center py-10 text-gray-500 bg-dark-800 rounded-lg border border-dark-600">
                        This user hasn't posted anything yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
