import { Search } from 'lucide-react';
import Avatar from '../ui/Avatar';
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

        // Listen for new messages to update conversation list (e.g. move to top, update last message)
        socket.on('new_message', () => {
            fetchConversations();
        });

        socket.on('new_message_notification', () => {
            fetchConversations();
        });

        return () => {
            socket.off('new_message');
            socket.off('new_message_notification');
        };
    }, [socket]);

    const filteredConversations = conversations; // search logic can be added here

    return (
        <div className="w-80 border-r border-dark-600 h-full flex flex-col bg-dark-800">
            <div className="p-4 border-b border-dark-600">
                <h2 className="text-lg font-bold text-gray-200 mb-4">Chats</h2>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search connections"
                        className="w-full bg-dark-900 border border-dark-700 rounded-full pl-9 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-gray-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : conversations.length > 0 ? (
                    filteredConversations.map(chat => (
                        <div
                            key={chat.user._id}
                            onClick={() => onSelectChat(chat.user._id)}
                            className={clsx("p-3 flex items-center gap-3 cursor-pointer hover:bg-dark-700 transition-colors",
                                activeChatId === chat.user._id ? "bg-dark-700 border-l-4 border-secondary pl-2" : "pl-3"
                            )}
                        >
                            <div className="relative">
                                <Avatar src={chat.user.avatar} size="md" />
                                {/* Online status could be checked via socket or API, hardcoded for now or if backend provides it */}
                                {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-800 rounded-full"></span> */}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-gray-200 text-sm truncate">{chat.user.name}</h3>
                                    {chat.lastMessage && <span className="text-[10px] text-gray-500">{formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}</span>}
                                </div>
                                <p className={clsx("text-xs truncate", chat.unreadCount > 0 ? "text-gray-200 font-semibold" : "text-gray-500")}>
                                    {chat.lastMessage?.content || 'Started a conversation'}
                                </p>
                            </div>

                            {chat.unreadCount > 0 && (
                                <span className="w-5 h-5 flex items-center justify-center bg-secondary text-white text-[10px] font-bold rounded-full">
                                    {chat.unreadCount}
                                </span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">No conversations yet</div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
