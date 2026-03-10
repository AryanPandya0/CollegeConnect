import { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const { user, token } = useAuth();

    useEffect(() => {
        if (user && token) {
            const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const baseUrl = socketUrl.replace('/api', '');

            const newSocket = io(baseUrl, {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('[Socket] Connected');
            });

            newSocket.on('disconnect', () => {
                console.log('[Socket] Disconnected');
            });

            newSocket.on('connect_error', (err) => {
                console.error('[Socket] Connection error:', err.message);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                socketRef.current = null;
                setSocket(null);
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        }
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
