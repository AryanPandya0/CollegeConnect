import { FileText, Link as LinkIcon, Download, ExternalLink, Calendar, User, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../utils/imageUrl';

const ResourceCard = ({ resource, onDelete, onDownload }) => {
    const { user: currentUser } = useAuth();
    const isAuthor = currentUser?._id === resource.author?._id;
    const isAdmin = currentUser?.role === 'admin';

    const categories = {
        'notes': { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Notes' },
        'exam-paper': { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Exam Paper' },
        'book': { icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Book' },
        'link': { icon: LinkIcon, color: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Link' },
        'other': { icon: ExternalLink, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Other' }
    };

    const config = categories[resource.category] || categories['other'];
    const Icon = config.icon;

    return (
        <div className="group relative bg-dark-800/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 hover:bg-dark-700/60 transition-all duration-500 hover:shadow-premium hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className={clsx("p-3 rounded-2xl border border-white/5 shadow-inner transition-transform duration-500 group-hover:scale-110", config.bg)}>
                    <Icon className={clsx("w-6 h-6", config.color)} />
                </div>
                
                <div className="flex items-center gap-2">
                    {(isAuthor || isAdmin) && (
                        <button 
                            onClick={() => onDelete(resource._id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                            title="Delete Resource"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <a 
                        href={getFileUrl(resource.url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => onDownload(resource._id)}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl transition-all"
                        title="Open Resource"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <h3 className="text-sm font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                    {resource.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {resource.description}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
                <Badge variant="default" className="bg-white/5 border-white/5 italic">
                    {config.label}
                </Badge>
                {resource.tags?.map(tag => (
                    <Badge key={tag} variant="default" className="opacity-60">#{tag}</Badge>
                ))}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20">
                        <div className="w-6 h-6 rounded-full bg-dark-900 flex items-center justify-center border border-white/5 overflow-hidden">
                            {resource.author?.avatar ? (
                                <img src={resource.author.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-3 h-3 text-gray-500" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-300 flex items-center gap-1">
                            {resource.author?.name}
                            {resource.author?.role === 'alumni' && <Badge variant="alumni" verified className="scale-75 origin-left" />}
                        </span>
                        <span className="text-[9px] text-gray-500 font-medium italic">
                            {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
                
                <div className="text-[10px] font-black text-white/20">
                    {resource.downloadCount || 0} downloads
                </div>
            </div>
        </div>
    );
};

export default ResourceCard;
