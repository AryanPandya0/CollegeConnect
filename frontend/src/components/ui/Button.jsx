import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = 'primary', size = 'md', className, loading, disabled, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-transparent";

    const variants = {
        primary: "bg-primary text-white hover:brightness-110 shadow-orange-glow",
        secondary: "bg-white/10 text-white hover:bg-white/20 border-white/5",
        outline: "border-gray-500 text-gray-300 hover:bg-white/5 hover:border-gray-300",
        ghost: "text-gray-400 hover:bg-white/5 hover:text-white",
        danger: "bg-red-500/80 text-white hover:bg-red-500 shadow-lg shadow-red-500/20",
    };

    const sizes = {
        sm: "px-4 py-1.5 text-xs rounded-xl",
        md: "px-5 py-2.5 text-sm",
        lg: "px-7 py-3.5 text-base rounded-3xl",
        icon: "p-2.5 rounded-xl",
    };

    return (
        <button
            disabled={loading || disabled}
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : null}
            {children}
        </button>
    );
};

export default Button;
