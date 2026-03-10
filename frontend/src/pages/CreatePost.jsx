import { useState, useEffect, useRef } from 'react';
import { usePosts } from '../context/PostContext';
import { useNavigate } from 'react-router-dom';
import { Image, Link as LinkIcon, FileText, X, Upload } from 'lucide-react';
import clsx from 'clsx';
import Button from '../components/ui/Button';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CreatePost = ({ communityId }) => {
    const { createPost } = usePosts();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('text'); // text, image, link
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCommunity, setSelectedCommunity] = useState(communityId || '');
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(false);

    // Image state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await api.get('/communities');
                setCommunities(response.data.data.communities);
                if (!communityId && response.data.data.communities.length > 0) {
                    setSelectedCommunity(response.data.data.communities[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch communities', error);
                toast.error('Failed to load communities');
            }
        };

        if (!communityId) {
            fetchCommunities();
        } else {
            setSelectedCommunity(communityId);
        }
    }, [communityId]);

    // Cleanup previews
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Limit to 5 images
        if (selectedFiles.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setSelectedFiles(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleImageUpload = async () => {
        if (selectedFiles.length === 0) return [];

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        const response = await api.post('/posts/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return response.data.data.images;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        setLoading(true);
        try {
            let postData = {
                communityId: selectedCommunity || undefined, // Allow undefined
                title: title.trim(),
            };

            if (activeTab === 'image') {
                if (selectedFiles.length === 0) {
                    toast.error('Please select at least one image');
                    setLoading(false);
                    return;
                }
                const imageUrls = await handleImageUpload();
                postData.type = 'image';
                postData.images = imageUrls;
            } else if (activeTab === 'link') {
                if (!content.trim()) {
                    toast.error('Link URL is required');
                    setLoading(false);
                    return;
                }
                postData.type = 'text'; // Start as text, could be enhanced to 'link' type if backend supports
                postData.content = content.trim(); // Just content for now, assuming it's a link
            } else {
                postData.type = 'text';
                postData.content = content || undefined;
            }

            await createPost(postData);
            navigate('/');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    // Trigger file input click
    const onUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-lg font-bold text-gray-200 py-3 border-b border-dark-600 mb-4">Create a post</h1>

            {!communityId && (
                <div className="flex items-center gap-2 mb-4">
                    <select
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        className="bg-dark-800 text-gray-200 border border-dark-600 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
                    >
                        <option value="">User Profile (No Community)</option>
                        {communities.map(c => (
                            <option key={c._id} value={c._id}>r/{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="bg-dark-800 rounded-lg border border-dark-600 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-dark-600">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={clsx("flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-dark-700 transition-colors",
                            activeTab === 'text' ? "text-secondary border-b-2 border-secondary bg-dark-700/50" : "text-gray-400 border-b-2 border-transparent"
                        )}
                    >
                        <FileText className="w-5 h-5" /> Post
                    </button>
                    <button
                        onClick={() => setActiveTab('image')}
                        className={clsx("flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-dark-700 transition-colors",
                            activeTab === 'image' ? "text-secondary border-b-2 border-secondary bg-dark-700/50" : "text-gray-400 border-b-2 border-transparent"
                        )}
                    >
                        <Image className="w-5 h-5" /> Images
                    </button>
                    <button
                        onClick={() => setActiveTab('link')}
                        className={clsx("flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-dark-700 transition-colors",
                            activeTab === 'link' ? "text-secondary border-b-2 border-secondary bg-dark-700/50" : "text-gray-400 border-b-2 border-transparent"
                        )}
                    >
                        <LinkIcon className="w-5 h-5" /> Link
                    </button>
                </div>

                {/* Form */}
                <div className="p-4">
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-gray-500 mb-4"
                    />

                    {activeTab === 'text' && (
                        <textarea
                            placeholder="Text (optional)"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-40 bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-gray-500 resize-none"
                        />
                    )}

                    {activeTab === 'image' && (
                        <div className="flex flex-col gap-4">
                            <div
                                className="border-2 border-dashed border-dark-600 rounded-lg p-10 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-dark-700/30 transition-colors"
                                onClick={onUploadClick}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                                <p className="mb-2">Drag and drop images or click to upload</p>
                                <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); onUploadClick(); }}>
                                    Upload
                                </Button>
                            </div>

                            {/* Image Previews */}
                            {previews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative group aspect-square bg-dark-900 rounded-lg overflow-hidden border border-dark-600">
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'link' && (
                        <input
                            type="text"
                            placeholder="Url"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-gray-500"
                        />
                    )}

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-dark-600">
                        <Button variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!title || loading || (activeTab === 'image' && selectedFiles.length === 0)}
                        >
                            {loading ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
