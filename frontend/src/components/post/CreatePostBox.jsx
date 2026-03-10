import Avatar from '../ui/Avatar';
import { Image, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreatePostBox = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="bg-dark-800 p-2 sm:p-3 rounded-lg border border-dark-600 flex items-center gap-2 mb-4">
            {user ? (
                <Avatar src={user.avatar} className="w-8 h-8 sm:w-10 sm:h-10 border border-dark-600" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-dark-600" />
            )}

            <input
                type="text"
                placeholder="Create Post"
                className="flex-1 bg-dark-700 border border-dark-600 rounded-md px-4 py-2 text-gray-300 hover:bg-dark-600/80 hover:border-dark-500 focus:outline-none focus:bg-dark-900 transition-colors cursor-text"
                onClick={() => navigate('/submit')}
            />

            <button className="p-2 text-gray-400 hover:bg-dark-700 rounded-full" onClick={() => navigate('/submit')}>
                <Image className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:bg-dark-700 rounded-full" onClick={() => navigate('/submit')}>
                <LinkIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default CreatePostBox;
