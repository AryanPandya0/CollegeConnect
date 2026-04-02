import { Search, Bell, MessageSquare, Plus, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 glass-panel h-14 px-4 flex items-center justify-between border-b border-white/5">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
                <button className="md:hidden text-gray-400 hover:text-white transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center gap-2 group transition-all">
                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-orange-glow group-hover:scale-105 transition-transform">
                        C
                    </div>
                    <span className="hidden md:block text-xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">CollegeConnect</span>
                </Link>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-2xl px-8 hidden md:block">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-2 border border-dark-600/50 rounded-2xl leading-5 bg-dark-950/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                        placeholder="Search Campus"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {user ? (
                    <>
                        <button onClick={() => navigate('/submit')} className="hidden md:flex items-center gap-2 text-gray-300 hover:bg-white/5 px-4 py-1.5 rounded-full transition-all border border-transparent hover:border-white/10 active:scale-95">
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-semibold">Create</span>
                        </button>
                        <button onClick={() => navigate('/chat')} className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all active:scale-90">
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate('/notifications')} className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-all relative active:scale-90">
                            <Bell className="w-5 h-5" />
                            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-dark-800"></div>
                        </button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block"></div>
                        <button onClick={() => navigate(`/u/${user._id || user.id}`)} className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-xl transition-all group">
                            <div className="w-8 h-8 rounded-xl bg-dark-600 overflow-hidden flex items-center justify-center text-white text-sm font-bold border border-white/10 shadow-premium">
                                {user.avatar ? (
                                    <img src={getImageUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name?.charAt(0)?.toUpperCase()
                                )}
                            </div>
                            <div className="hidden lg:block text-left pr-1">
                                <p className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">{user.name}</p>
                                <p className="text-[10px] text-gray-500 font-medium">✨ {user.campusScore || 0} Score</p>
                            </div>
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary px-6 py-2 shadow-orange-glow">Log In</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
