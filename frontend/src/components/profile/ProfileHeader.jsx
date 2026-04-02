import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Settings, Share2, Calendar, Edit2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditProfileModal from './EditProfileModal';
import { getOrCreateConversation } from '../../services/chatService';
import { toast } from 'react-hot-toast';

const ProfileHeader = ({ user, isOwnProfile, onUpdate }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const navigate = useNavigate();

    const handleMessage = () => {
        setMessageLoading(true);
        try {
            navigate('/chat', { state: { selectedConversationId: user._id } });
        } catch (error) {
            console.error('Failed to navigate to conversation:', error);
            toast.error('Could not start chat');
        } finally {
            setMessageLoading(false);
        }
    };

    return (
        <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden mb-4 shadow-premium">
            {/* Banner */}
            <div className="h-40 bg-gradient-to-r from-primary-900/50 to-dark-900 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            </div>

            <div className="px-6 pb-6 mt-[-3rem] relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div className="relative group">
                        <Avatar src={user.avatar} size="xl" className="w-32 h-32 border-8 border-dark-800 shadow-premium group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="flex gap-3 mb-2">
                        {!isOwnProfile && (
                            <Button 
                                variant="primary" 
                                size="md" 
                                className="rounded-2xl flex items-center gap-2 font-black shadow-orange-glow px-6 py-2"
                                onClick={handleMessage}
                                loading={messageLoading}
                            >
                                <MessageSquare className="w-4 h-4" /> Message
                            </Button>
                        )}
                        <Button variant="outline" size="md" className="rounded-2xl flex items-center gap-2 border-white/10 hover:bg-white/5 transition-all text-sm font-black px-6 py-2 bg-dark-900/40 backdrop-blur-md">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                        {isOwnProfile && (
                            <Button
                                variant="outline"
                                size="md"
                                className="rounded-2xl flex items-center gap-2 border-white/10 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-black px-6 py-2 bg-dark-900/40 backdrop-blur-md"
                                onClick={() => setShowEditModal(true)}
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-gray-200">{user.name}</h1>
                    {user.role === 'alumni' && (
                        <Badge variant="alumni" verified className="scale-100">
                            Verified Alumni
                        </Badge>
                    )}
                </div>
                <p className="text-gray-400 text-sm mb-4">{user.college || ''}</p>
                {user.bio && <p className="text-gray-300 text-sm mb-4">{user.bio}</p>}

                <div className="flex gap-6 text-sm mb-6">
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{user.campusScore || 0}</span>
                        <span className="text-gray-500">Campus Score</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{user.followers?.length || 0}</span>
                        {/* Assuming followers is array or count. Controller sends populated array, so length is fine */}
                        <span className="text-gray-500">Followers</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{user.following?.length || 0}</span>
                        <span className="text-gray-500">Following</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-200">{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                        <span className="text-gray-500">Campus Age</span>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {user.badges && user.badges.map((badge, idx) => (
                        <span key={idx} className="px-2 py-1 bg-dark-700 border border-dark-600 rounded-full text-xs text-gray-300">
                            {badge}
                        </span>
                    ))}
                    {user.course && (
                        <span className="px-2 py-1 bg-dark-700 border border-dark-600 rounded-full text-xs text-gray-300">
                            {user.course} {user.year ? `- ${user.year}` : ''}
                        </span>
                    )}
                </div>

                <div className="flex border-b border-dark-600 mt-6 gap-6">
                    <button className="pb-3 border-b-2 border-gray-200 text-gray-200 font-bold text-sm">Posts</button>
                    <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-300 font-bold text-sm">Comments</button>
                </div>
            </div>

            {showEditModal && (
                <EditProfileModal
                    user={user}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};

export default ProfileHeader;
