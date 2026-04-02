import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
    const location = useLocation();
    const [selectedChat, setSelectedChat] = useState(location.state?.selectedConversationId || null);

    useEffect(() => {
        if (location.state?.selectedConversationId) {
            setSelectedChat(location.state.selectedConversationId);
        }
    }, [location.state]);

    return (
        <div className="h-[calc(100vh-100px)] flex border border-dark-600 rounded-lg overflow-hidden bg-dark-900 shadow-xl">
            <ChatSidebar activeChatId={selectedChat} onSelectChat={setSelectedChat} />
            <ChatWindow chatId={selectedChat} />
        </div>
    );
};

export default ChatPage;
