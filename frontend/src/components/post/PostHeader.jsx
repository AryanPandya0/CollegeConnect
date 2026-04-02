import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const PostHeader = ({ post }) => {
    const communityName = post.community?.name || post.community || 'unknown';
    const author = post.author;
    const isAlumni = author?.role === 'alumni';
    const gradYear = author?.graduationYear ? String(author.graduationYear).slice(-2) : null;

    return (
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
                {/* Community Icon */}
                <Link to={`/r/${communityName}`} className="flex items-center gap-1.5 hover:bg-white/5 rounded-lg px-2 py-1 -ml-2 transition-all group">
                    <div className="w-5 h-5 rounded-lg bg-secondary/20 flex items-center justify-center text-[10px] font-bold text-secondary border border-secondary/10 group-hover:bg-secondary/30 transition-colors">
                        {communityName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-extrabold text-gray-300 group-hover:text-white transition-colors">r/{communityName}</span>
                </Link>

                <span className="opacity-30">•</span>

                <div className="flex items-center gap-1.5">
                    <span className="opacity-80">Posted by</span>
                    <Link to={`/u/${author?._id}`} className="hover:underline text-gray-300 font-bold hover:text-white transition-colors">
                        u/{author?.name}
                    </Link>
                    
                    {isAlumni ? (
                        <Badge variant="alumni" verified className="ml-1 px-2.5 py-0.5">
                            Verified Alumni {gradYear && `'${gradYear}`}
                        </Badge>
                    ) : author?.year && (
                        <Badge variant="student" className="ml-1 px-2.5 py-0.5 opacity-80">
                            {author.year === 1 ? 'Freshman' : 
                             author.year === 2 ? 'Sophomore' : 
                             author.year === 3 ? 'Junior' : 'Senior'}
                        </Badge>
                    )}
                </div>

                <span className="opacity-30">•</span>

                <span className="font-medium">{formatDistanceToNow(new Date(post.createdAt))} ago</span>
            </div>

            <button className="p-1.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all">
                <MoreHorizontal className="w-4 h-4" />
            </button>
        </div>
    );
};

export default PostHeader;
