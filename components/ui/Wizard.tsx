import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import React from "react";

interface Step {
    id: string;
    label: string;
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

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    function next() {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        }
    }

    function back() {
        if (isFirstStep) {
            onCancel();
        } else {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    }

    return (
        <div className="w-full">
            {/* ProgressBar */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative overflow-hidden">
                    {/* Connecting Lines */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-200 -z-10 translate-y-[-50%]" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-300 translate-y-[-50%]"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold border-2 transition-colors",
                                        isActive ? "border-primary bg-primary text-white" :
                                            isCompleted ? "border-primary bg-primary text-white" : "border-neutral-200 bg-surface text-text-secondary"
                                    )}
                                >
                                    {isCompleted ? <Check size={14} /> : index + 1}
                                </div>
                                <span className={cn(
                                    "text-xs font-medium hidden sm:block",
                                    isActive ? "text-primary" : "text-text-secondary"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="mb-8 min-h-[400px] animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Pass props to the child component */}
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
    );
}
