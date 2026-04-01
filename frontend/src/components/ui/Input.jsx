import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
    return (
        <div className="w-full space-y-1.5">
            {label && <label className="block text-xs font-bold text-gray-500 ml-4 uppercase tracking-wider">{label}</label>}
            <input
                ref={ref}
                className={clsx(
                    "bg-dark-950/40 border border-dark-600/50 rounded-2xl px-5 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 w-full transition-all duration-300 text-sm shadow-inner",
                    error && "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/5",
                    className
                )}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
