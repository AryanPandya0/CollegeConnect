import clsx from 'clsx';

const Skeleton = ({ className, circle = false, ...props }) => {
    return (
        <div
            className={clsx(
                "relative overflow-hidden bg-white/5",
                circle ? "rounded-full" : "rounded-lg",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-[0_0_40px_rgba(255,255,255,0.05)]" />
        </div>
    );
};

export default Skeleton;
