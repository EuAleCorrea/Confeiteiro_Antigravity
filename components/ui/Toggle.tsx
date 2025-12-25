"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    labelPosition?: "left" | "right";
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: {
        track: "w-8 h-4",
        thumb: "w-3 h-3",
        translate: "translate-x-4",
    },
    md: {
        track: "w-11 h-6",
        thumb: "w-5 h-5",
        translate: "translate-x-5",
    },
    lg: {
        track: "w-14 h-7",
        thumb: "w-6 h-6",
        translate: "translate-x-7",
    },
};

export function Toggle({
    checked,
    onChange,
    disabled = false,
    label,
    labelPosition = "right",
    size = "md",
    className,
}: ToggleProps) {
    const sizes = sizeClasses[size];

    const handleClick = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
        }
    };

    const toggle = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
                "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                sizes.track,
                checked ? "bg-primary" : "bg-neutral-300",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    sizes.thumb,
                    checked ? sizes.translate : "translate-x-0.5"
                )}
            />
        </button>
    );

    if (!label) {
        return toggle;
    }

    return (
        <label
            className={cn(
                "inline-flex items-center gap-3 cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {labelPosition === "left" && (
                <span className="text-sm text-text-primary">{label}</span>
            )}
            {toggle}
            {labelPosition === "right" && (
                <span className="text-sm text-text-primary">{label}</span>
            )}
        </label>
    );
}
