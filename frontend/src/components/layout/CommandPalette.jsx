import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Users, LayoutGrid, FileText, X, Command, CornerDownLeft, User, ChevronRight } from 'lucide-react';
import { globalSearch } from '../../services/searchService';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import Avatar from '../ui/Avatar';

const CommandPalette = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], communities: [], resources: [] });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Flatten results for keyboard navigation
    const flatResults = [
        ...results.users.map(u => ({ ...u, type: 'user' })),
        ...results.communities.map(c => ({ ...c, type: 'community' })),
        ...results.resources.map(r => ({ ...r, type: 'resource' }))
    ];

    const handleSearch = useCallback(async (q) => {
        if (!q.trim()) {
            setResults({ users: [], communities: [], resources: [] });
            return;
        }
        setLoading(true);
        try {
            const response = await globalSearch(q);
            setResults(response.data.data);
            setSelectedIndex(0);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = (item) => {
        if (!item) return;
        onClose();
        if (item.type === 'user') navigate(`/u/${item._id}`);
        if (item.type === 'community') navigate(`/r/${item.name}`);
        if (item.type === 'resource') window.open(item.url, '_blank');
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(flatResults.length, 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + flatResults.length) % Math.max(flatResults.length, 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSelect(flatResults[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-dark-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl bg-dark-800/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-premium overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300"
                onClick={e => e.stopPropagation()}
                onKeyDown={onKeyDown}
            >
                {/* Search Input Area */}
                <div className="relative p-6 border-b border-white/5">
                    <Search className={clsx(
                        "absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300",
                        loading ? "text-primary animate-pulse" : "text-gray-500"
                    )} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for people, communities, or resources..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-12 py-5 text-sm font-black text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[9px] font-black text-gray-500 flex items-center gap-1">
                            <span className="text-[11px]">ESC</span>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                    {!query ? (
                        <div className="py-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                                <Command className="w-8 h-8 text-gray-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-gray-400">Search Anything</p>
                                <p className="text-xs text-gray-600">Communities, Students, Alumni, and Library Files</p>
                            </div>
                        </div>
                    ) : flatResults.length > 0 ? (
                        <div className="space-y-6">
                            {/* Users Section */}
                            {results.users.length > 0 && (
                                <div>
                                    <h3 className="px-4 mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" /> People
                                    </h3>
                                    <div className="space-y-1">
                                        {results.users.map((item, idx) => (
                                            <ResultItem 
                                                key={item._id}
                                                item={{...item, type: 'user'}}
                                                isSelected={flatResults[selectedIndex]?._id === item._id}
                                                onClick={() => handleSelect({...item, type: 'user'})}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Communities Section */}
                            {results.communities.length > 0 && (
                                <div>
                                    <h3 className="px-4 mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <LayoutGrid className="w-3 h-3" /> Communities
                                    </h3>
                                    <div className="space-y-1">
                                        {results.communities.map((item) => (
                                            <ResultItem 
                                                key={item._id}
                                                item={{...item, type: 'community'}}
                                                isSelected={flatResults[selectedIndex]?._id === item._id}
                                                onClick={() => handleSelect({...item, type: 'community'})}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resources Section */}
                            {results.resources.length > 0 && (
                                <div>
                                    <h3 className="px-4 mb-2 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Files & Docs
                                    </h3>
                                    <div className="space-y-1">
                                        {results.resources.map((item) => (
                                            <ResultItem 
                                                key={item._id}
                                                item={{...item, type: 'resource'}}
                                                isSelected={flatResults[selectedIndex]?._id === item._id}
                                                onClick={() => handleSelect({...item, type: 'resource'})}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : !loading && (
                        <div className="py-12 text-center">
                            <p className="text-sm font-black text-gray-600 italic">No matches found for "{query}"</p>
                        </div>
                    )}
                </div>

                {/* Footer / Shortcuts */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                        <div className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3" /> Navigate</div>
                        <div className="flex items-center gap-1.5"><CornerDownLeft className="w-3 h-3" /> Open</div>
                    </div>
                    <div className="text-[10px] font-black text-primary/40 uppercase tracking-widest italic">
                        Command Palette v1.0
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResultItem = ({ item, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => {}} // Could sync select index here
            className={clsx(
                "w-full flex items-center justify-between p-3 rounded-2xl transition-all duration-200 group",
                isSelected ? "bg-primary text-white shadow-premium" : "hover:bg-white/5"
            )}
        >
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative flex-shrink-0">
                    {item.type === 'user' ? (
                        <Avatar src={item.avatar} size="md" className={clsx("border-2", isSelected ? "border-white/20" : "border-white/5")} />
                    ) : item.type === 'community' ? (
                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border-2", isSelected ? "bg-white/20 border-white/20" : "bg-dark-900 border-white/5")}>
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                    ) : (
                        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border-2", isSelected ? "bg-white/20 border-white/20" : "bg-dark-900 border-white/5")}>
                            <FileText className="w-5 h-5" />
                        </div>
                    )}
                </div>
                <div className="text-left min-w-0">
                    <p className={clsx("text-sm font-black truncate", isSelected ? "text-white" : "text-gray-200")}>
                        {item.type === 'resource' ? item.title : item.name || item.displayName}
                    </p>
                    <p className={clsx("text-[10px] font-bold truncate opacity-60", isSelected ? "text-white" : "text-gray-500")}>
                        {item.type === 'user' ? item.college : 
                         item.type === 'community' ? `${item.memberCount || 0} members • ${item.college}` :
                         `${item.category} • Shared by ${item.author?.name}`}
                    </p>
                </div>
            </div>
            {isSelected && <CornerDownLeft className="w-4 h-4 text-white/40 animate-pulse flex-shrink-0" />}
        </button>
    );
};

export default CommandPalette;
