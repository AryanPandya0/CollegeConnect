import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
    return format(new Date(date), formatStr);
};
