import { Send, Smile, Paperclip, MoreVertical } from 'lucide-react';
import Avatar from '../ui/Avatar';
import MessageBubble from './MessageBubble';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = ({ chatId }) => {
    const { user: currentUser } = useAuth();
    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chatUser, setChatUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch Chat User Details
    useEffect(() => {
        const fetchUser = async () => {
            if (!chatId) return;
            try {
                const response = await api.get(`/users/${chatId}`);
                setChatUser(response.data.data.user);
            } catch (error) {
                console.error('Failed to load user', error);
            }
        };
        fetchUser();
    }, [chatId]);

    // Fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!chatId) return;
            setLoading(true);
            try {
                const response = await api.get(`/chat/messages/${chatId}`);
                setMessages(response.data.data.messages.reverse()); // Backend returns newest first usually, depending on logic
            } catch (error) {
                console.error('Failed to load messages', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [chatId]);

    // Join Room & Listen for Messages
    useEffect(() => {
        if (!socket || !chatId) return;

        socket.emit('join_conversation', { userId: chatId });

        const handleNewMessage = (data) => {
            // Check if message belongs to current conversation
            // Check if sender is chatId OR sender is currentUser (echo)
            // But we append optimistically or via response?
            // If sender is ME, I might have already added it.
            // The backend emits 'new_message' to the room.
            const msg = data.message;
            if (msg.sender._id === chatId || msg.sender._id === currentUser._id) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m._id === msg._id || m.id === msg.id)) return prev;
                    return [...prev, msg];
                });
                scrollToBottom();
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.emit('leave_conversation', { userId: chatId });
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, chatId, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId) return;

        const content = newMessage;
        setNewMessage("");

        try {
            await api.post(`/chat/messages/${chatId}`, { content });
            // The backend will emit 'new_message' via socket, which we listen to
            // Or we can optimistically add it here
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    if (!chatId) return <div className="flex-1 flex items-center justify-center text-gray-500">Select a chat</div>;

    return (
        <div className="flex-1 flex flex-col h-full bg-dark-900">
            {/* Header */}
            <div className="p-4 border-b border-dark-600 flex items-center justify-between bg-dark-800">
                <div className="flex items-center gap-3">
                    {chatUser && <Avatar src={chatUser.avatar} />}
                    <div>
                        <h3 className="font-bold text-gray-200">{chatUser ? chatUser.name : 'Loading...'}</h3>
                        {/* Online status placeholder */}
                        {/* <span className="text-xs text-green-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                        </span> */}
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-200"><MoreVertical className="w-5 h-5" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? <div className="text-center text-gray-500">Loading messages...</div> : (
                    messages.map(msg => {
                        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                        return (
                            <MessageBubble key={msg._id || msg.id} message={msg} isOwn={senderId === currentUser?._id} />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-600 bg-dark-800">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-700 rounded-full">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="w-full bg-dark-900 border border-dark-700 rounded-full pl-4 pr-10 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-secondary transition-colors"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                            <Smile className="w-5 h-5" />
                        </button>
                    </div>
                    <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-secondary text-white rounded-full hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform active:scale-95">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
