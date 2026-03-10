import { usePosts } from '../context/PostContext';
import PostCard from '../components/post/PostCard';
import CreatePostBox from '../components/post/CreatePostBox';
import clsx from 'clsx';

const Home = () => {
    const { posts, loading, setSortBy, sortBy, hasMore, loadMore } = usePosts();

    return (
        <div className="space-y-4">
            <CreatePostBox />
            {/* Sort Tabs */}
            <div className="flex items-center gap-4 mb-4 px-2">
                <button
                    onClick={() => setSortBy('hot')}
                    className={clsx("px-3 py-1 rounded-full text-sm font-bold transition-colors", sortBy === 'hot' ? "bg-dark-700 text-gray-300" : "text-gray-400 hover:bg-dark-700")}
                >
                    Hot
                </button>
                <button
                    onClick={() => setSortBy('new')}
                    className={clsx("px-3 py-1 rounded-full text-sm font-bold transition-colors", sortBy === 'new' ? "bg-dark-700 text-gray-300" : "text-gray-400 hover:bg-dark-700")}
                >
                    New
                </button>
                <button
                    onClick={() => setSortBy('top')}
                    className={clsx("px-3 py-1 rounded-full text-sm font-bold transition-colors", sortBy === 'top' ? "bg-dark-700 text-gray-300" : "text-gray-400 hover:bg-dark-700")}
                >
                    Top
                </button>
            </div>

            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))
                ) : (
                    !loading && <div className="text-center py-10 text-gray-500">No posts found.</div>
                )}
                {loading && <div className="text-center py-4 text-gray-500">Loading...</div>}

                {hasMore && !loading && posts.length > 0 && (
                    <button
                        onClick={loadMore}
                        className="w-full py-2 text-sm text-secondary hover:underline"
                    >
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
};

export default Home;
