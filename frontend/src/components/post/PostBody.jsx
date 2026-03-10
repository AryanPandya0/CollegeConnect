const PostBody = ({ post }) => {
    return (
        <div className="mb-2">
            <h3 className="text-lg font-medium text-gray-200 mb-2 leading-snug">{post.title}</h3>

            {post.type === 'text' && (
                <div className="text-sm text-gray-300 line-clamp-4 relative mask-image-b">
                    {post.content}
                </div>
            )}

            {post.type === 'image' && post.images && post.images.length > 0 && (
                <div className="mt-3 rounded-xl overflow-hidden border border-dark-600 max-h-[500px] flex justify-center bg-black">
                    <img src={post.images[0]} alt={post.title} className="object-contain max-h-full" />
                </div>
            )}

            {post.flair && (
                <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-dark-700 text-gray-300 text-xs border border-dark-600">
                        {post.flair}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PostBody;
