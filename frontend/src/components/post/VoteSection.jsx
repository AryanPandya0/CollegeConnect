import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import clsx from 'clsx';

const VoteSection = ({ score, userVote, onVote }) => {
    // userVote: 1 (up), -1 (down), 0 (none)
    const liked = userVote === 1 ? 'up' : userVote === -1 ? 'down' : null;

    return (
        <div className="flex flex-col items-center p-2 bg-dark-900/30 w-10 flex-shrink-0 rounded-l-lg lg:bg-transparent lg:w-12">
            <button
                onClick={(e) => { e.stopPropagation(); onVote('up'); }}
                className={clsx("p-1 rounded hover:bg-dark-600/50 transition-colors", liked === 'up' && "text-primary")}
            >
                <ArrowBigUp className={clsx("w-6 h-6", liked === 'up' && "fill-current")} />
            </button>

            <span className={clsx("text-xs font-bold py-1",
                liked === 'up' ? "text-primary" :
                    liked === 'down' ? "text-blue-500" : "text-gray-300"
            )}>
                {score}
            </span>

            <button
                onClick={(e) => { e.stopPropagation(); onVote('down'); }}
                className={clsx("p-1 rounded hover:bg-dark-600/50 transition-colors", liked === 'down' && "text-blue-500")}
            >
                <ArrowBigDown className={clsx("w-6 h-6", liked === 'down' && "fill-current")} />
            </button>
        </div>
    );
};

export default VoteSection;
