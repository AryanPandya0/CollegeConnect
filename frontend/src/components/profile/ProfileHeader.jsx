import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { Settings, Share2, Calendar, Edit2 } from 'lucide-react'; // Added Edit2
import { formatDistanceToNow } from 'date-fns'; // Added import
import { useState } from 'react';
import EditProfileModal from './EditProfileModal';

const ProfileHeader = ({ user, isOwnProfile, onUpdate }) => {
    const [showEditModal, setShowEditModal] = useState(false);

    return (
        <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden mb-4">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-gray-700 to-gray-900 relative">
            </div>

            <div className="px-4 pb-4">
                <div className="flex justify-between items-end -mt-10 mb-4">
                    <div className="relative">
                        <Avatar src={user.avatar} size="xl" className="w-24 h-24 border-4 border-dark-800" />
                    </div>

                    <div className="flex gap-2 mb-1">
                        <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                        {isOwnProfile && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full flex items-center gap-2"
                                onClick={() => setShowEditModal(true)}
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-200">{user.name}</h1>
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
