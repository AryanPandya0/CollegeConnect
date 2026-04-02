import { useState, useEffect } from 'react';
import { getCommunities } from '../services/communityService';
import { Search, Users, LayoutGrid, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const AllCommunities = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchCommunities = async (query = '') => {
        setLoading(true);
        try {
            const response = await getCommunities(query);
            setCommunities(response.data.data.communities);
        } catch (error) {
            console.error('Failed to load communities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCommunities(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="relative p-8 rounded-[2.5rem] bg-dark-800 border border-white/5 overflow-hidden shadow-premium">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Explore Communities</h1>
                        <p className="text-gray-400 font-bold max-w-md">Find your tribe. Join clubs, branches, and student-run groups across the campus.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search by name or college..." 
                            className="w-full bg-dark-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Communities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    [...Array(6)].map((_, i) => <CommunitySkeleton key={i} />)
                ) : communities.length > 0 ? (
                    communities.map((community) => (
                        <Link 
                            key={community._id} 
                            to={`/r/${community.name}`}
                            className="group flex items-center gap-4 p-5 rounded-[2rem] bg-dark-800 border border-white/5 hover:border-primary/20 hover:bg-dark-700/50 transition-all duration-300 shadow-premium"
                        >
                            <div className="relative flex-shrink-0">
                                <Avatar 
                                    src={community.avatar} 
                                    alt={community.name} 
                                    size="lg" 
                                    className="border-2 border-white/5 group-hover:border-primary/40 transition-colors"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-lg flex items-center justify-center text-white border-2 border-dark-800 scale-0 group-hover:scale-100 transition-transform duration-300">
                                    <Plus className="w-3 h-3 font-black" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-white group-hover:text-primary transition-colors truncate">{community.displayName || community.name}</h3>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{community.college}</p>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                        <Users className="w-3 h-3" /> {community.memberCount || 0}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-600 truncate max-w-[150px]">
                                        {community.description}
                                    </span>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-dark-800/30 border border-dashed border-dark-600/50 rounded-3xl">
                        <p className="text-gray-500 font-bold">No communities matching "{search}" found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CommunitySkeleton = () => (
    <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-dark-800 border border-white/5">
        <Skeleton variant="avatar" size="lg" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
        </div>
    </div>
);

export default AllCommunities;
