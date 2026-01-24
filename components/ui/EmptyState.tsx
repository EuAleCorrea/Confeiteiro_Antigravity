import { LucideIcon, Package } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon: Icon = Package,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-text-secondary max-w-sm mb-4">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button onClick={onAction} size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

