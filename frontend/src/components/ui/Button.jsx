import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gray-300 text-dark-900 hover:bg-white",
        secondary: "bg-gray-700 text-white hover:bg-gray-600",
        outline: "border border-gray-300 text-gray-300 hover:bg-gray-300/10",
        ghost: "text-gray-400 hover:bg-dark-700 hover:text-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-400",
    };

    const sizes = {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
