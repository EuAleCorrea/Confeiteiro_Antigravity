import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "error" | "info" | "neutral";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "bg-primary/10 text-primary": variant === "default",
                    "bg-success/15 text-success-darker text-green-700": variant === "success",
                    "bg-warning/15 text-warning-darker text-orange-700": variant === "warning",
                    "bg-error/15 text-error text-red-700": variant === "error",
                    "bg-info/15 text-info-darker text-blue-700": variant === "info",
                    "bg-neutral-100 text-text-secondary": variant === "neutral",
                },
                className
            )}
            {...props}
        />
    );
}
