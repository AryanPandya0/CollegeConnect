import { usePosts } from '../context/PostContext';
import PostCard from '../components/post/PostCard';
import PostSkeleton from '../components/post/PostSkeleton';
import { useEffect, useRef, useCallback } from 'react';
import { TrendingUp, Flame, Award } from 'lucide-react';

const Popular = () => {
    const { posts, loading, setSortBy, sortBy, hasMore, loadMore } = usePosts();
    const observer = useRef();

    useEffect(() => {
        setSortBy('hot');
    }, [setSortBy]);

    const lastPostRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 px-2 py-4">
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-orange-glow">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Popular Feed</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Trending across all campuses</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map((post, index) => {
                        if (posts.length === index + 1) {
                            return (
                                <div ref={lastPostRef} key={post._id}>
                                    <PostCard post={post} />
                                </div>
                            );
                        } else {
                            return <PostCard key={post._id} post={post} />;
                        }
                    })
                ) : (
                    !loading && (
                        <div className="text-center py-20 bg-dark-800/30 border border-dark-600/50 border-dashed rounded-3xl">
                            <p className="text-gray-500 font-medium">Nothing popular right now. Come back later!</p>
                        </div>
                    )
                )}

                {loading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <PostSkeleton key={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Popular;
