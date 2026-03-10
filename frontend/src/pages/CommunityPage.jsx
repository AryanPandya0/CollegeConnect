import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommunityHeader from '../components/community/CommunityHeader';
import PostCard from '../components/post/PostCard';
import CreatePostBox from '../components/post/CreatePostBox';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CommunityPage = () => {
    const { communityId } = useParams();
    const { user, checkAuth } = useAuth();
    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    useEffect(() => {
        const fetchCommunityData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Community Details
                const commResponse = await api.get(`/communities/${communityId}`);
                const commData = commResponse.data.data.community;
                setCommunity(commData);

                // 2. Fetch Posts for this community
                const postsResponse = await api.get(`/communities/${commData._id}/posts`);
                setPosts(postsResponse.data.data.posts);
            } catch (err) {
                console.error("Failed to load community:", err);
                setError('Failed to load community');
            } finally {
                setLoading(false);
            }
        };

        if (communityId) {
            fetchCommunityData();
        }
    }, [communityId]);

    const handleJoin = async () => {
        if (!user) return toast.error('Please login to join');
        setJoinLoading(true);
        try {
            if (community.isMember) {
                await api.post(`/communities/${community._id}/leave`);
                setCommunity(prev => ({ ...prev, isMember: false, memberCount: prev.memberCount - 1 }));
                toast.success('Left community');
            } else {
                await api.post(`/communities/${community._id}/join`);
                setCommunity(prev => ({ ...prev, isMember: true, memberCount: prev.memberCount + 1 }));
                toast.success('Joined community');
            }
            await checkAuth(); // Update user context (sidebar)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setJoinLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!community) return <div className="text-center py-10">Community not found</div>;

    return (
        <div>
            <CommunityHeader
                name={community.displayName || community.name}
                members={community.memberCount}
                description={community.description}
                isMember={community.isMember}
                onJoin={handleJoin}
                joinLoading={joinLoading}
                coverImage={community.coverImage}
                avatar={community.avatar}
            />

            <CreatePostBox communityId={community._id} />

            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map(post => <PostCard key={post._id} post={post} />)
                ) : (
                    <div className="text-center py-10 text-gray-500 bg-dark-800 rounded-lg">
                        No posts in this community yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
