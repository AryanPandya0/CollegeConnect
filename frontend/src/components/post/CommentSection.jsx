import Avatar from '../ui/Avatar';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { ArrowBigUp, ArrowBigDown, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

const CommentItem = ({ comment, postId, onReplySuccess }) => {
    const { user } = useAuth();
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [voteState, setVoteState] = useState(comment.userVote || 0); // 1, -1, 0
    const [score, setScore] = useState(comment.score || 0);

    const handleVote = async (type) => { // 'up' or 'down'
        if (!user) return toast.error('Please login to vote');

        const value = type === 'up' ? 1 : -1;
        let newVoteState = value;
        let scoreChange = 0;

        if (voteState === value) {
            newVoteState = 0; // toggle off
            scoreChange = -1 * value;
        } else {
            scoreChange = value - voteState;
        }

        // Optimistic update
        setVoteState(newVoteState);
        setScore(prev => prev + scoreChange);

        try {
            if (newVoteState === 0) {
                await api.delete(`/comments/${comment._id}/vote`);
            } else {
                await api.post(`/comments/${comment._id}/vote`, { value: newVoteState });
            }
        } catch (error) {
            console.error('Vote failed', error);
            // Revert
            setVoteState(voteState);
            setScore(score);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            await api.post(`/posts/${postId}/comments`, {
                content: replyContent,
                parentId: comment._id
            });
            toast.success('Reply added');
            setReplying(false);
            setReplyContent("");
            if (onReplySuccess) onReplySuccess();
        } catch (error) {
            toast.error('Failed to reply');
        }
    };

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <Avatar src={comment.author.avatar} size="sm" />
                <div className="h-full w-0.5 bg-dark-700 my-2 rounded-full" />
            </div>

            <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-black text-white/90">u/{comment.author.name}</span>
                    
                    {comment.author.role === 'alumni' ? (
                        <Badge variant="alumni" verified className="scale-90 origin-left">
                            Alumni {comment.author.graduationYear ? `'${String(comment.author.graduationYear).slice(-2)}` : ''}
                        </Badge>
                    ) : comment.author.year && (
                        <Badge variant="student" className="scale-90 origin-left">
                            {comment.author.year === 1 ? 'Freshman' : 
                             comment.author.year === 2 ? 'Sophomore' : 
                             comment.author.year === 3 ? 'Junior' : 'Senior'}
                        </Badge>
                    )}

                    <span className="text-[10px] text-gray-500 font-medium ml-1">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>

                <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleVote('up')}
                            className={clsx("p-0.5 rounded hover:bg-dark-700 text-gray-400", voteState === 1 && "text-primary")}
                        >
                            <ArrowBigUp className={clsx("w-5 h-5", voteState === 1 && "fill-current")} />
                        </button>
                        <span className={clsx("text-xs font-bold",
                            voteState === 1 ? "text-primary" : voteState === -1 ? "text-blue-500" : "text-gray-400"
                        )}>{score}</span>
                        <button
                            onClick={() => handleVote('down')}
                            className={clsx("p-0.5 rounded hover:bg-dark-700 text-gray-400", voteState === -1 && "text-blue-500")}
                        >
                            <ArrowBigDown className={clsx("w-5 h-5", voteState === -1 && "fill-current")} />
                        </button>
                    </div>

                    <button
                        className="text-xs font-bold text-gray-400 hover:text-gray-300"
                        onClick={() => setReplying(!replying)}
                    >
                        Reply
                    </button>
                </div>

                {replying && (
                    <form onSubmit={handleReplySubmit} className="mt-4 flex flex-col gap-3 bg-dark-950/30 p-3 rounded-2xl border border-white/5 shadow-inner">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="w-full bg-transparent text-sm text-gray-200 focus:outline-none resize-none h-24"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2 pr-1 pb-1">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setReplying(false)}>Cancel</Button>
                            <Button type="submit" size="sm" className="px-6" disabled={!replyContent.trim()}>Reply</Button>
                        </div>
                    </form>
                )}

                {/* Nested Replies (recursively only if populated) */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-4 mt-4">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                postId={postId}
                                onReplySuccess={onReplySuccess}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const CommentSection = ({ postId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            setComments(response.data.data.comments);
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) return toast.error('Please login to comment');

        try {
            await api.post(`/posts/${postId}/comments`, { content: newComment });
            setNewComment("");
            toast.success('Comment added');
            fetchComments(); // Refresh to show new comment
        } catch (error) {
            toast.error('Failed to post comment');
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-dark-600">
            <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
                <Avatar src={user?.avatar} size="sm" />
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg p-2 text-sm text-gray-200 focus:outline-none focus:border-gray-500 resize-none h-20"
                    />
                    <div className="flex justify-end mt-2">
                        <Button type="submit" size="sm" disabled={!newComment.trim()}>Comment</Button>
                    </div>
                </div>
            </form>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500 text-center">Loading comments...</p>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <CommentItem
                            key={comment._id}
                            comment={comment}
                            postId={postId}
                            onReplySuccess={fetchComments}
                        />
                    ))
                ) : (
                    <p className="text-gray-500 text-center">No comments yet.</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
