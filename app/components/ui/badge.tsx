import { cn } from '../../lib/utils';

interface BadgeProps {
    variant?: 'default' | 'secondary' | 'destructive';
    children: React.ReactNode;
    className?: string;
}

export const Badge = ({ variant = 'default', children, className }: BadgeProps) => {
    const variants = {
        default: 'bg-blue-500 text-white',
        secondary: 'bg-gray-500 text-white',
        destructive: 'bg-red-500 text-white'
    };

    return (
        <span className={cn('px-2 py-1 rounded text-sm', variants[variant], className)}>
            {children}
        </span>
    );
};