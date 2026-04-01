import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';

const Badge = ({ variant = 'default', children, className, verified = false, ...props }) => {
    const variants = {
        default: "bg-white/5 text-gray-400 border-white/5",
        alumni: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]",
        student: "bg-secondary/10 text-secondary border-secondary/20",
        admin: "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_-3px_rgba(255,69,0,0.2)]",
    };

    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all duration-300",
                variants[variant],
                className
            )}
            {...props}
        >
            {verified && <CheckCircle2 className="w-3 h-3" />}
            {children}
        </span>
    );
};

export default Badge;
