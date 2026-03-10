import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
            <input
                ref={ref}
                className={clsx(
                    "bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 w-full transition-colors",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500",
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
