import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageSquare, Plus, Menu, Users, Hash, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import { globalSearch } from '../services/searchService';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                setIsSearching(true);
                setShowDropdown(true);
                try {
                    const res = await globalSearch(searchQuery);
                    setSearchResults(res.data.data);
                } catch (error) {
                    console.error('Search error:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults(null);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleResultClick = (path) => {
        navigate(path);
        setShowDropdown(false);
        setSearchQuery('');
    };

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
            <div className="flex-1 max-w-2xl px-8 hidden md:block relative" ref={dropdownRef}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        ) : (
                            <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                        )}
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
                        className="block w-full pl-11 pr-4 py-2 border border-dark-600/50 rounded-2xl leading-5 bg-dark-950/50 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                        placeholder="Search users, communities, or resources..."
                    />
                </div>

                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute mt-2 w-full left-0 right-0 max-h-[480px] overflow-hidden bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[100] px-2 py-4"
                        >
                            <div className="overflow-y-auto max-h-[440px] px-2 custom-scrollbar">
                                {searchResults ? (
                                    <div className="space-y-6">
                                        {/* Communities */}
                                        {searchResults.communities?.length > 0 && (
                                            <div>
                                                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
                                                    <Hash className="w-3 h-3" /> Communities
                                                </p>
                                                {searchResults.communities.map(community => (
                                                    <div
                                                        key={community._id}
                                                        onClick={() => handleResultClick(`/r/${community.name}`)}
                                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-xl bg-dark-600 flex items-center justify-center text-white overflow-hidden border border-white/5">
                                                            {community.avatar ? (
                                                                <img src={getImageUrl(community.avatar)} alt={community.name} className="w-full h-full object-cover" />
                                                            ) : community.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white/90 group-hover:text-primary transition-colors">r/{community.name}</p>
                                                            <p className="text-[10px] text-gray-500">{community.memberCount} members</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Users */}
                                        {searchResults.users?.length > 0 && (
                                            <div>
                                                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-2">
                                                    <Users className="w-3 h-3" /> Users
                                                </p>
                                                {searchResults.users.map(u => (
                                                    <div
                                                        key={u._id}
                                                        onClick={() => handleResultClick(`/u/${u._id}`)}
                                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-xl bg-dark-600 flex items-center justify-center text-white overflow-hidden border border-white/5">
                                                            {u.avatar ? (
                                                                <img src={getImageUrl(u.avatar)} alt={u.name} className="w-full h-full object-cover" />
                                                            ) : u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white/90 group-hover:text-primary transition-colors">{u.name}</p>
                                                            <p className="text-[10px] text-gray-500">@{u.username} • {u.college}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Resources */}
                                        {searchResults.resources?.length > 0 && (
                                            <div>
                                                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-2">
                                                    <FileText className="w-3 h-3" /> Resources
                                                </p>
                                                {searchResults.resources.map(res => (
                                                    <div
                                                        key={res._id}
                                                        onClick={() => window.open(res.url, '_blank')}
                                                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group"
                                                    >
                                                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white/90 group-hover:text-primary transition-colors truncate max-w-[200px]">{res.title}</p>
                                                            <p className="text-[10px] text-gray-500">{res.category} • {res.downloadCount} downloads</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!isSearching && (!searchResults.users?.length && !searchResults.communities?.length && !searchResults.resources?.length) && (
                                            <div className="py-10 text-center">
                                                <p className="text-gray-500 text-sm italic">No campus matches for "{searchQuery}"</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    isSearching && (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="w-10 h-10 text-primary animate-spin opacity-50" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">Scouring the Campus...</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
