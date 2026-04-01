import clsx from 'clsx';

const Skeleton = ({ className, circle = false, ...props }) => {
    return (
        <div
            className={clsx(
                "animate-pulse bg-white/5",
                circle ? "rounded-full" : "rounded-lg",
                className
            )}
            {...props}
        />
    );
};

export default Skeleton;
