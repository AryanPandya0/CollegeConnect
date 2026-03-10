import { MessageSquare, Share2, Bookmark } from 'lucide-react';
import VoteSection from './VoteSection';
import PostHeader from './PostHeader';
import PostBody from './PostBody';
import CommentSection from './CommentSection';
import Button from '../ui/Button';
import { usePosts } from '../../context/PostContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const PostCard = ({ post }) => {
    const { vote } = usePosts();
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);

    const handleVote = (type) => {
        vote(post._id, type);
    };

    // Handle populated community object or ID string
    const communityName = post.community?.name || post.community || 'unknown';

    return (
        <div
            className="flex bg-dark-800 border border-dark-600 rounded-lg overflow-hidden hover:border-gray-500 transition-colors cursor-pointer"
            onClick={() => navigate(`/r/${communityName}/comments/${post._id}`)}
        >
            {/* Left Vote Section (Desktop) */}
            <div className="hidden sm:block bg-dark-900/20" onClick={(e) => e.stopPropagation()}>
                <VoteSection
                    score={post.score || 0}
                    userVote={post.userVote}
                    onVote={handleVote}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-2 sm:p-3">
                <PostHeader post={post} />
                <PostBody post={post} />

                {/* Footer Actions */}
                <div className="flex items-center gap-1 mt-2 text-gray-400" onClick={(e) => e.stopPropagation()}>
                    <div className="sm:hidden mr-2">
                        <VoteSection score={post.score || 0} userVote={post.userVote} onVote={handleVote} />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.commentCount || 0} Comments</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2">
                        <Bookmark className="w-5 h-5" />
                        <span>Save</span>
                    </Button>
                </div>

                {/* Expandable Comment Section */}
                {showComments && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <CommentSection postId={post._id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
