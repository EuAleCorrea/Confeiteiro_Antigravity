import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className={cn(
                "relative z-50 w-full max-w-lg rounded-2xl bg-surface p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200",
                className
            )}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X size={20} />
                    <span className="sr-only">Fechar</span>
                </button>

                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-6">
                    <h2 className="text-lg font-semibold leading-none tracking-tight">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-text-secondary">
                            {description}
                        </p>
                    )}
                </div>

                {children}
            </div>
        </div>
    );
}
