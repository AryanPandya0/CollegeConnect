import { useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
    const [selectedChat, setSelectedChat] = useState(null);

    return (
        <div className="h-[calc(100vh-100px)] flex border border-dark-600 rounded-lg overflow-hidden bg-dark-900 shadow-xl">
            <ChatSidebar activeChatId={selectedChat} onSelectChat={setSelectedChat} />
            <ChatWindow chatId={selectedChat} />
        </div>
    );
};

export default ChatPage;
