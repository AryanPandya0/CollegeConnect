import { MessageSquare, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const communityName = post.community?.name || post.community || 'unknown';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="group flex bg-dark-800 border border-dark-600/50 rounded-3xl overflow-hidden hover:border-gray-500/50 transition-all duration-300 cursor-pointer shadow-premium hover:shadow-2xl hover:-translate-y-0.5"
            onClick={() => navigate(`/r/${communityName}/comments/${post._id}`)}
        >
            {/* Left Vote Section (Desktop) */}
            <div className="hidden sm:flex flex-col bg-dark-900/30 border-r border-white/5 py-4 w-12 items-center justify-start group-hover:bg-dark-900/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                <VoteSection
                    score={post.score || 0}
                    userVote={post.userVote}
                    onVote={handleVote}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 p-3 sm:p-5 relative outline-none focus:outline-none">
                <PostHeader post={post} />
                <div className="mt-2 group-hover:opacity-95 transition-opacity">
                    <PostBody post={post} />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center gap-2 mt-4 text-gray-500 font-bold" onClick={(e) => e.stopPropagation()}>
                    <div className="sm:hidden mr-3">
                        <VoteSection score={post.score || 0} userVote={post.userVote} onVote={handleVote} />
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 px-3 hover:bg-white/5 rounded-xl transition-all"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageSquare className="w-5 h-5 group-hover:text-secondary group-hover:animate-pulse" />
                        <span className="text-xs">{post.commentCount || 0} <span className="hidden sm:inline">Comments</span></span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2 px-3 hover:bg-white/5 rounded-xl transition-all">
                        <Share2 className="w-5 h-5" />
                        <span className="text-xs hidden sm:inline">Share</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="gap-2 px-3 hover:bg-white/5 rounded-xl transition-all">
                        <Bookmark className="w-5 h-5" />
                        <span className="text-xs hidden sm:inline">Save</span>
                    </Button>

                    <Button variant="ghost" size="sm" className="p-2 hover:bg-white/5 rounded-xl transition-all ml-auto">
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </div>

                {/* Expandable Comment Section */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="pt-6 border-t border-white/5 mt-4">
                                <CommentSection postId={post._id} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PostCard;
