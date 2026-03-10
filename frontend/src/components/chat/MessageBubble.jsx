import clsx from 'clsx';
import Avatar from '../ui/Avatar';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn }) => {
    return (
        <div className={clsx("flex gap-3 mb-4", isOwn ? "flex-row-reverse" : "flex-row")}>
            <Avatar src={typeof message.sender === 'object' ? message.sender?.avatar : null} size="xs" className="mt-1" />

            <div className={clsx("max-w-[70%] rounded-2xl px-4 py-2",
                isOwn ? "bg-secondary text-white rounded-br-none" : "bg-dark-700 text-gray-200 rounded-bl-none"
            )}>
                <p className="text-sm">{message.content}</p>
                <span className={clsx("text-[10px] mt-1 block opacity-70", isOwn ? "text-blue-100" : "text-gray-400")}>
                    {format(new Date(message.createdAt || message.timestamp), 'h:mm a')}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
