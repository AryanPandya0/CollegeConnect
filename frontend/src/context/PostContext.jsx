import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const PostContext = createContext();

export const usePosts = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('hot');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const postsRef = useRef(posts);
    postsRef.current = posts;

    const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
        if (reset) {
            setLoading(true);
        }
        try {
            const response = await api.get(`/posts?sort=${sortBy}&page=${pageNum}`);
            const newPosts = response.data.data.posts;

            setPosts(prev => reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]);
            setHasMore(response.data.pagination?.hasNextPage || false);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            toast.error('Failed to load feed');
        } finally {
            setLoading(false);
        }
    }, [sortBy]);

    useEffect(() => {
        fetchPosts(1, true);
    }, [sortBy]);

    const loadMore = useCallback(() => {
        const nextPage = page + 1;
        fetchPosts(nextPage, false);
    }, [page, fetchPosts]);

    const vote = async (postId, type) => {
        const currentPosts = postsRef.current;
        const post = currentPosts.find(p => p._id === postId);
        if (!post) return;

        const currentVote = post.userVote || 0;
        let newVote;
        if (type === 'up') {
            newVote = currentVote === 1 ? 0 : 1;
        } else {
            newVote = currentVote === -1 ? 0 : -1;
        }
        const scoreChange = newVote - currentVote;

        // Optimistic update
        setPosts(prevPosts => prevPosts.map(p => {
            if (p._id === postId) {
                return { ...p, userVote: newVote, score: (p.score || 0) + scoreChange };
            }
            return p;
        }));

        try {
            if (newVote === 0) {
                await api.delete(`/posts/${postId}/vote`);
            } else {
                await api.post(`/posts/${postId}/vote`, { value: newVote });
            }
        } catch (error) {
            console.error('Vote failed:', error);
            toast.error('Vote failed');
            // Revert on failure
            setPosts(prevPosts => prevPosts.map(p => {
                if (p._id === postId) {
                    return { ...p, userVote: currentVote, score: (p.score || 0) - scoreChange };
                }
                return p;
            }));
        }
    };

    const createPost = async (postData) => {
        try {
            const response = await api.post('/posts', postData);
            setPosts(prev => [response.data.data.post, ...prev]);
            toast.success('Post created!');
            return response.data.data.post;
        } catch (error) {
            console.error('Create post failed:', error);
            throw error;
        }
    };

    return (
        <PostContext.Provider value={{ posts, loading, vote, createPost, setSortBy, sortBy, fetchPosts, hasMore, loadMore }}>
            {children}
        </PostContext.Provider>
    );
};
