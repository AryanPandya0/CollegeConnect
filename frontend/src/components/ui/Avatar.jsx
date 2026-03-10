import { twMerge } from 'tailwind-merge';
import { User } from 'lucide-react';

const Avatar = ({ src, alt, size = 'md', className }) => {
    const sizes = {
        xs: "w-5 h-5",
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-10 h-10",
        xl: "w-16 h-16",
    };

    return (
        <div className={twMerge("rounded-full bg-dark-600 overflow-hidden flex-shrink-0 flex items-center justify-center", sizes[size], className)}>
            {src ? (
                <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
            ) : (
                <User className="w-1/2 h-1/2 text-gray-400" />
            )}
        </div>
    );
};

export default Avatar;
