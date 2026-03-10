import Avatar from '../ui/Avatar';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const PostHeader = ({ post }) => {
    const communityName = post.community?.name || post.community || 'unknown';

    return (
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-2">
                {/* Community Icon */}
                <Link to={`/r/${communityName}`} className="flex items-center gap-1 hover:bg-dark-700 rounded p-0.5 -ml-1 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-gray-600" />
                    <span className="font-bold text-gray-300 hover:underline">r/{communityName}</span>
                </Link>

                <span>•</span>

                <span className="flex items-center gap-1">
                    Posted by
                    <Link to={`/u/${post.author?._id}`} className="hover:underline text-gray-300">
                        u/{post.author?.name}
                    </Link>
                </span>

                <span>•</span>

                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
            </div>

            <button className="p-1 hover:bg-dark-700 rounded-full">
                <MoreHorizontal className="w-4 h-4" />
            </button>
        </div>
    );
};

export default PostHeader;
