import * as React from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
        // Basic slot support if we install radix-ui/react-slot later or mock it. 
        // For now, I'll assume we might not have radix-ui installed yet, so I'll simplify.
        // Wait, I haven't installed radix-ui. I'll remove Slot support for now to keep it simple and dependency-free.

        const Comp = "button";

        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-white shadow-md hover:bg-primary-dark hover:shadow-lg": variant === "primary",
                        "bg-secondary/20 text-primary hover:bg-secondary/30": variant === "secondary",
                        "border border-primary text-primary bg-transparent hover:bg-primary/5": variant === "outline",
                        "hover:bg-neutral-100 text-text-secondary hover:text-text-primary": variant === "ghost",
                        "bg-error text-white hover:bg-error-dark": variant === "danger",

                        "h-9 px-4 py-2": size === "sm",
                        "h-11 px-8 py-2": size === "md",
                        "h-14 px-8 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };

