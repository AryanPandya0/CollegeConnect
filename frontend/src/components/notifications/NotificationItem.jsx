import Avatar from '../ui/Avatar';
import { Heart, MessageSquare, UserPlus, AtSign, ArrowBigUp, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationItem = ({ notification }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'upvote': return <ArrowBigUp className="w-4 h-4 text-primary fill-current" />;
            case 'reply': return <MessageSquare className="w-4 h-4 text-secondary fill-current" />;
            case 'follow': return <UserPlus className="w-4 h-4 text-blue-500" />;
            case 'mention': return <AtSign className="w-4 h-4 text-green-500" />;
            case 'message': return <Mail className="w-4 h-4 text-yellow-500" />;
            default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActionText = () => {
        switch (notification.type) {
            case 'upvote': return 'upvoted your content';
            case 'reply': return 'replied to your post';
            case 'follow': return 'started following you';
            case 'mention': return 'mentioned you';
            case 'message': return 'sent you a message';
            default: return notification.message;
        }
    };

    return (
        <div className={`flex items-start gap-4 p-4 border-b border-dark-600 hover:bg-dark-700/50 transition-colors last:border-0 relative ${!notification.isRead ? 'bg-dark-700/30' : ''}`}>
            <div className="relative">
                <Avatar src={notification.sender?.avatar} alt={notification.sender?.name} size="md" />
                <div className="absolute -bottom-1 -right-1 bg-dark-800 rounded-full p-0.5 border border-dark-600">
                    {getIcon()}
                </div>
            </div>

            <div className="flex-1">
                <p className="text-sm text-gray-300">
                    <span className="font-bold text-gray-200">{notification.sender?.name || 'Someone'}</span>
                    {" "}
                    {getActionText()}
                </p>
                {notification.message && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{notification.message}</p>
                )}
                <span className="text-xs text-gray-500">
                    {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}
                </span>
            </div>

            {!notification.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full absolute top-1/2 right-4 -translate-y-1/2"></span>
            )}
        </div>
    );
};

export default NotificationItem;
