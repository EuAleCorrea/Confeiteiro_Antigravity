import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";
import React from "react";

export interface Step {
    id: string;
    label: string;
    icon?: React.ReactNode;
    component: React.ReactNode;
}

interface WizardProps {
    steps: Step[];
    onComplete: () => void;
    onCancel: () => void;
    initialStep?: number;
}

export function Wizard({ steps, onComplete, onCancel, initialStep = 0 }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    function next() {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function back() {
        if (isFirstStep) {
            onCancel();
        } else {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    if (!isClient) return null;

    return (
        <div className="w-full">
            {/* Stepper Container */}
            <div className="mb-12 pt-4">
                <div className="flex items-center justify-between relative px-4 md:px-12">

                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const isPending = index > currentStep;

                        // Calculate connector width for this specific step gap
                        // We render a connector AFTER each step except the last one
                        const showConnector = index < steps.length - 1;

                        return (
                            <React.Fragment key={step.id}>
                                {/* Step Item */}
                                <div className="relative flex flex-col items-center z-10 group cursor-default">
                                    {/* Icon Floating Badge (if provided) */}
                                    {step.icon && (
                                        <div className={cn(
                                            "absolute -top-3 -right-3 z-20 p-1.5 rounded-full bg-surface shadow-sm border transition-all duration-300",
                                            isActive || isCompleted ? "text-primary border-primary/20" : "text-text-tertiary border-transparent group-hover:text-text-secondary"
                                        )}>
                                            {React.cloneElement(step.icon as any, { size: 14 })}
                                        </div>
                                    )}

                                    {/* Circle */}
                                    <div
                                        className={cn(
                                            "flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border-4 transition-all duration-500 shadow-sm",
                                            isActive
                                                ? "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                                                : isCompleted
                                                    ? "border-primary bg-background text-primary"
                                                    : "border-border bg-surface text-text-tertiary"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-xl md:text-2xl font-bold",
                                            isCompleted ? "font-extrabold" : ""
                                        )}>
                                            {isCompleted ? <Check size={28} strokeWidth={3} /> : (index + 1).toString().padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Label */}
                                    <div className={cn(
                                        "absolute top-full mt-3 text-center w-32 transition-colors duration-300",
                                        isActive ? "text-primary font-bold" : isCompleted ? "text-text-primary font-medium" : "text-text-tertiary"
                                    )}>
                                        <span className="text-xs uppercase tracking-wider block mb-0.5">Passo {index + 1}</span>
                                        <span className="text-sm">{step.label}</span>
                                    </div>
                                </div>

                                {/* Connector */}
                                {showConnector && (
                                    <div className="flex-1 h-3 mx-2 md:mx-4 relative bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-in-out rounded-full",
                                                isCompleted ? "w-full" : "w-0"
                                            )}
                                        />

                                        {/* Animated arrow head effect for active step connecting to next */}
                                        {isActive && (
                                            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent to-primary/30 animate-[shimmer_1.5s_infinite]" />
                                        )}
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Spacer for labels */}
            <div className="h-10 mb-8" />

            {/* Step Content */}
            <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-6 duration-500 ease-out fill-mode-forwards">
                <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 md:p-8">
                    {React.isValidElement(steps[currentStep].component)
                        ? React.cloneElement(steps[currentStep].component as React.ReactElement<any>, {
                            next,
                            back: isFirstStep ? onCancel : back,
                            isFirst: isFirstStep,
                            isLast: isLastStep
                        })
                        : steps[currentStep].component
                    }
                </div>
            </div>
        </div>
    );
}
