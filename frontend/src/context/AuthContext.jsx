import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            try {
                const response = await api.post('/auth/guest');
                const { accessToken, user: userData } = response.data.data;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setToken(accessToken);
            } catch (error) {
                console.error('Guest login failed:', error);
            } finally {
                setLoading(false);
            }
            return;
        }
        setToken(storedToken);

        try {
            const response = await api.get('/users/profile/me');
            setUser(response.data.data.user);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, user: userData } = response.data.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setToken(accessToken);

            toast.success(`Welcome back, ${userData.name}!`);
            return userData;
        } catch (error) {
            const message = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Login failed';
            toast.error(message);
            throw message;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        window.location.href = '/login';
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { accessToken, user: newUser } = response.data.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            setToken(accessToken);

            toast.success('Account created! Welcome to the campus.');
            return newUser;
        } catch (error) {
            const message = error.response?.data?.errors?.[0]?.message || error.response?.data?.message || 'Registration failed';
            toast.error(message);
            throw message;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, register, loading, checkAuth }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
