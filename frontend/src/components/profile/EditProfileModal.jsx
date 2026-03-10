import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        bio: user.bio || '',
        course: user.course || '',
        year: user.year || '',
        college: user.college || '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(user.avatar);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload avatar if changed
            let updatedAvatar = user.avatar;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const uploadRes = await api.put('/users/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                updatedAvatar = uploadRes.data.data.avatar;
            }

            // Update profile info
            const updateRes = await api.put('/users/profile/me', formData);
            const updatedUser = updateRes.data.data.user;

            toast.success('Profile updated successfully');
            onUpdate({ ...updatedUser, avatar: updatedAvatar }); // Merge updates
            onClose();
        } catch (error) {
            console.error('Update failed', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-100 mb-6">Edit Profile</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <div className="relative group cursor-pointer">
                                <Avatar src={previewAvatar} size="xl" className="w-24 h-24 border-2 border-dark-600" />
                                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                                    <Upload className="w-6 h-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <span className="text-xs text-gray-500">Click to upload new avatar</span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-dark-700 border border-dark-600 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full bg-dark-700 border border-dark-600 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500 resize-none h-20"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">Course</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="w-full bg-dark-700 border border-dark-600 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1">Year</label>
                                <input
                                    type="text"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full bg-dark-700 border border-dark-600 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">College</label>
                            <input
                                type="text"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                className="w-full bg-dark-700 border border-dark-600 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
