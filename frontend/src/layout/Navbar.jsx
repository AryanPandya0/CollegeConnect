import { Search, Bell, MessageSquare, Plus, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 bg-dark-800 border-b border-dark-600 h-14 px-4 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-300">
                    <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                        C
                    </div>
                    <span className="hidden md:block text-xl font-bold text-gray-300">CollegeConnect</span>
                </Link>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl px-4 hidden md:block">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-dark-600 rounded-full leading-5 bg-dark-700 text-gray-300 placeholder-gray-400 focus:outline-none focus:border-gray-300 sm:text-sm"
                        placeholder="Search Campus Connect"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <button onClick={() => navigate('/submit')} className="hidden md:flex items-center gap-2 text-gray-300 hover:bg-dark-700 px-3 py-1.5 rounded-full">
                            <Plus className="w-5 h-5" />
                            <span className="text-sm font-medium">Create</span>
                        </button>
                        <button onClick={() => navigate('/chat')} className="text-gray-300 hover:bg-dark-700 p-2 rounded-full">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate('/notifications')} className="text-gray-300 hover:bg-dark-700 p-2 rounded-full relative">
                            <Bell className="w-5 h-5" />
                        </button>
                        <div className="relative group">
                            <button onClick={() => navigate(`/u/${user._id || user.id}`)} className="flex items-center gap-2 hover:bg-dark-700 p-1 rounded-md">
                                <div className="w-8 h-8 rounded-md bg-gray-600 overflow-hidden flex items-center justify-center text-white text-sm font-bold">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name?.charAt(0)?.toUpperCase()
                                    )}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-xs font-semibold text-gray-300">{user.name}</p>
                                    <p className="text-[10px] text-gray-400">{user.campusScore || 0} Score</p>
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary text-sm">Log In</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
