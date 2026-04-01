import Skeleton from '../ui/Skeleton';

const PostSkeleton = () => {
    return (
        <div className="flex bg-dark-800 border border-dark-600/50 rounded-3xl overflow-hidden shadow-premium h-[200px]">
            {/* Left Vote Section Placeholder */}
            <div className="hidden sm:flex flex-col bg-dark-900/30 border-r border-white/5 py-4 w-12 items-center gap-4">
                <Skeleton className="w-4 h-4 rounded-md" />
                <Skeleton className="w-6 h-6 rounded-md" />
                <Skeleton className="w-4 h-4 rounded-md" />
            </div>

            {/* Main Content Placeholder */}
            <div className="flex-1 p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton circle className="w-8 h-8" />
                    <div className="space-y-1.5 flex-1">
                        <Skeleton className="w-32 h-3 rounded-full" />
                        <Skeleton className="w-20 h-2 rounded-full opacity-60" />
                    </div>
                </div>

                <div className="space-y-2.5">
                    <Skeleton className="w-3/4 h-5 rounded-full" />
                    <Skeleton className="w-full h-3 rounded-full opacity-40" />
                    <Skeleton className="w-5/6 h-3 rounded-full opacity-40" />
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="w-20 h-8 rounded-xl" />
                    <Skeleton className="w-20 h-8 rounded-xl" />
                    <Skeleton className="w-20 h-8 rounded-xl" />
                </div>
            </div>
        </div>
    );
};

export default PostSkeleton;
