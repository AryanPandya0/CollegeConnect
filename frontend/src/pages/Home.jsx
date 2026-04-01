import { usePosts } from '../context/PostContext';
import PostCard from '../components/post/PostCard';
import CreatePostBox from '../components/post/CreatePostBox';
import PostSkeleton from '../components/post/PostSkeleton';
import clsx from 'clsx';
import { useEffect, useRef, useCallback } from 'react';

const Home = () => {
    const { posts, loading, setSortBy, sortBy, hasMore, loadMore } = usePosts();
    const observer = useRef();

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
            <CreatePostBox />
            
            {/* Sort Tabs - Modern Glass Version */}
            <div className="flex items-center p-1 bg-dark-800/50 backdrop-blur-sm border border-white/5 rounded-2xl w-fit ml-2">
                {['hot', 'new', 'top'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setSortBy(type)}
                        className={clsx(
                            "px-5 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all duration-300",
                            sortBy === type 
                                ? "bg-white/10 text-white shadow-premium" 
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                    >
                        {type}
                    </button>
                ))}
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
                        <div className="text-center py-20 card border-dashed border-dark-600/50">
                            <p className="text-gray-500 font-medium">No posts found in this campus.</p>
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

export default Home;
