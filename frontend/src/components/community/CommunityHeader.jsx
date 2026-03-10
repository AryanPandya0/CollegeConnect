import JoinButton from './JoinButton';

const CommunityHeader = ({ name, members, description, isMember, onJoin, joinLoading, coverImage, avatar }) => {
    return (
        <div className="bg-dark-800 border border-dark-600 mb-4 rounded-lg overflow-hidden">
            {/* Banner */}
            <div className="h-24 sm:h-32 bg-gradient-to-r from-secondary to-primary relative overflow-hidden">
                {coverImage && (
                    <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <div className="flex items-end -mt-6 sm:-mt-8 mb-4 gap-4">
                    {/* Icon */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-dark-800 rounded-full p-1 border-4 border-dark-900 overflow-hidden">
                        {avatar ? (
                            <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-2xl sm:text-4xl font-bold text-white">
                                r/
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pb-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-white leading-none mb-1">{name}</h1>
                        <p className="text-sm text-gray-400">r/{name}</p>
                    </div>

                    <div className="pb-2">
                        <JoinButton isMember={isMember} onJoin={onJoin} loading={joinLoading} />
                    </div>
                </div>

                <div className="text-sm text-gray-300 mb-4">
                    {description}
                </div>

                <div className="flex gap-6 text-sm font-bold border-t border-dark-600 pt-3">
                    <div>
                        <span className="text-gray-200 block">{members}</span>
                        <span className="text-gray-500 font-normal">Members</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityHeader;
