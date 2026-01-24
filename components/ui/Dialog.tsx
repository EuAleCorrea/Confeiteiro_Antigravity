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
    fullScreenOnMobile?: boolean;
}

export function Dialog({ isOpen, onClose, title, description, children, className, fullScreenOnMobile = true }: DialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Content */}
            <div className={cn(
                "relative z-50 w-full bg-surface shadow-xl",
                // Mobile: slide from bottom, full width, rounded top
                fullScreenOnMobile
                    ? "max-h-[90vh] rounded-t-2xl md:rounded-2xl max-w-lg animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:fade-in md:zoom-in-95 duration-300"
                    : "max-w-lg rounded-2xl mx-4 animate-in fade-in zoom-in-95 duration-200",
                "p-4 md:p-6 overflow-y-auto",
                className
            )}>
                {/* Mobile drag indicator */}
                {fullScreenOnMobile && (
                    <div className="md:hidden flex justify-center mb-3">
                        <div className="w-10 h-1 bg-neutral-300 rounded-full" />
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute right-3 top-3 md:right-4 md:top-4 rounded-full p-2 opacity-70 transition-opacity hover:opacity-100 hover:bg-neutral-100 focus:outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                    <X size={20} />
                    <span className="sr-only">Fechar</span>
                </button>

                <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4 md:mb-6 pr-10">
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

