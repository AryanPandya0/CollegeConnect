import { useState, useEffect, useCallback } from 'react';
import ResourceCard from '../components/library/ResourceCard';
import AddResourceModal from '../components/library/AddResourceModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Search, Plus, Filter, BookOpen, GraduationCap, Link as LinkIcon, FileText, LayoutGrid } from 'lucide-react';
import { getResources, incrementDownload, deleteResource } from '../services/resourceService';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import Skeleton from '../components/ui/Skeleton';

const Library = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'all') params.category = category;
            if (search) params.search = search;
            
            const response = await getResources(params);
            setResources(response.data.data.resources);
        } catch (error) {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    }, [category, search]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleDownload = async (id) => {
        try {
            await incrementDownload(id);
            setResources(prev => prev.map(r => 
                r._id === id ? { ...r, downloadCount: (r.downloadCount || 0) + 1 } : r
            ));
        } catch (error) {
            console.error('Failed to track download', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this resource?')) return;
        try {
            await deleteResource(id);
            toast.success('Resource deleted');
            setResources(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            toast.error('Failed to delete resource');
        }
    };

    const categories = [
        { id: 'all', label: 'All', icon: LayoutGrid },
        { id: 'notes', label: 'Notes', icon: FileText },
        { id: 'exam-paper', label: 'Exam Papers', icon: GraduationCap },
        { id: 'book', label: 'Books', icon: BookOpen },
        { id: 'link', label: 'Links/Tools', icon: LinkIcon },
    ];

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto px-4">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-3 text-center md:text-left">
                        <h1 className="text-4xl font-black text-white tracking-tight">Campus Library</h1>
                        <p className="text-gray-400 font-medium max-w-md">
                            The ultimate repository for academic survival. Shared by students, for students.
                        </p>
                    </div>
                    <Button 
                        size="lg" 
                        className="rounded-2xl px-8 py-6 shadow-orange-glow group"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
                        Share Resource
                    </Button>
                </div>
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" />
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex items-center p-1.5 bg-dark-800/40 backdrop-blur-md border border-white/5 rounded-3xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={clsx(
                                    "px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 flex-shrink-0",
                                    category === cat.id 
                                        ? "bg-white/10 text-white shadow-premium border border-white/5" 
                                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative flex-1 w-full group">
                    <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for notes, books, or papers..."
                        className="w-full bg-dark-800/40 backdrop-blur-md border border-white/5 rounded-3xl pl-14 pr-6 py-4 text-xs font-bold text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5 transition-all shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-dark-800/20 backdrop-blur-sm border border-white/5 rounded-[2rem] p-6 space-y-4">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="w-3/4 h-4 rounded-full" />
                                <Skeleton className="w-full h-3 rounded-full opacity-50" />
                                <Skeleton className="w-1/2 h-3 rounded-full opacity-50" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="w-16 h-4 rounded-full" />
                                <Skeleton className="w-16 h-4 rounded-full opacity-50" />
                            </div>
                        </div>
                    ))
                ) : resources.length > 0 ? (
                    resources.map(resource => (
                        <ResourceCard 
                            key={resource._id} 
                            resource={resource}
                            onDelete={handleDelete}
                            onDownload={handleDownload}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-dark-800/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <Filter className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400">Empty Library</h3>
                            <p className="text-gray-500 text-xs font-medium">
                                We couldn't find any resources matching your criteria. Be the first to share one!
                            </p>
                            <Button variant="outline" size="sm" onClick={() => {setCategory('all'); setSearch('');}}>Clear filters</Button>
                        </div>
                    </div>
                )}
            </div>

            <AddResourceModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchResources}
            />
        </div>
    );
};

export default Library;
