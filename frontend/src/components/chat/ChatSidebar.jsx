import { Search } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Skeleton from '../ui/Skeleton';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const ChatSidebar = ({ activeChatId, onSelectChat }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchConversations = async () => {
        try {
            const response = await api.get('/chat/conversations');
            setConversations(response.data.data.conversations);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('new_message', () => fetchConversations());
        socket.on('new_message_notification', () => fetchConversations());

        return () => {
            socket.off('new_message');
            socket.off('new_message_notification');
        };
    }, [socket]);

    const ConversationSkeleton = () => (
        <div className="p-3 flex items-center gap-3 animate-pulse opacity-50">
            <Skeleton circle className="w-12 h-12" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="w-24 h-3 rounded-full" />
                    <Skeleton className="w-8 h-2 rounded-full" />
                </div>
                <Skeleton className="w-full h-2.5 rounded-full opacity-60" />
            </div>
        </div>
    );

    return (
        <div className="w-80 border-r border-white/5 h-full flex flex-col bg-dark-900/50 backdrop-blur-md">
            <div className="p-5">
                <h2 className="text-xl font-extrabold text-white mb-5 tracking-tight">Messages</h2>
                <div className="relative group">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search connections..."
                        className="w-full bg-dark-950/50 border border-dark-600/50 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
                {loading ? (
                    [...Array(6)].map((_, i) => <ConversationSkeleton key={i} />)
                ) : conversations.length > 0 ? (
                    conversations.map(chat => (
                        <div
                            key={chat.user._id}
                            onClick={() => onSelectChat(chat.user._id)}
                            className={clsx(
                                "p-3 flex items-center gap-4 cursor-pointer rounded-2xl transition-all duration-300 group",
                                activeChatId === chat.user._id 
                                    ? "bg-white/10 text-white shadow-premium border border-white/5" 
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <div className="relative">
                                <div className={clsx(
                                    "p-0.5 rounded-2xl transition-all duration-300 group-hover:scale-105",
                                    activeChatId === chat.user._id ? "bg-gradient-to-tr from-primary to-secondary" : "bg-dark-600 p-0.5"
                                )}>
                                    <Avatar src={chat.user.avatar} size="md" className="rounded-xl border-2 border-dark-800" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-dark-800 rounded-full shadow-lg"></span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={clsx("font-bold text-xs truncate transition-colors flex items-center gap-1", activeChatId === chat.user._id ? "text-white" : "text-gray-300 group-hover:text-white")}>
                                        {chat.user.name}
                                        {chat.user.role === 'alumni' && (
                                            <span className="text-cyan-400" title="Verified Alumni">
                                                <CheckCircle2 className="w-3 h-3 fill-current/10" />
                                            </span>
                                        )}
                                    </h3>
                                    {chat.lastMessage && (
                                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                                        </span>
                                    )}
                                </div>
                                <p className={clsx("text-[11px] truncate font-medium", chat.unreadCount > 0 ? "text-white font-bold" : "text-gray-500")}>
                                    {chat.lastMessage?.content || 'Say hello! 👋'}
                                </p>
                            </div>

                            {chat.unreadCount > 0 && (
                                <span className="w-5 h-5 flex items-center justify-center bg-primary text-white text-[10px] font-black rounded-lg shadow-orange-glow animate-pulse">
                                    {chat.unreadCount}
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-dark-600/50 m-4">
                        <p className="text-gray-500 text-xs font-semibold">No connections yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
