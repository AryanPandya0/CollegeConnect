import { Loader2 } from 'lucide-react';

const Loader = ({ className }) => {
    return (
        <div className="flex items-center justify-center p-4">
            <Loader2 className={`w-8 h-8 animate-spin text-secondary ${className}`} />
        </div>
    );
};

export default Loader;
