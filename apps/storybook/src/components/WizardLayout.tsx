import React, { ReactNode } from 'react';

interface WizardLayoutProps {
    currentStep: number;
    totalSteps: number;
    title: string;
    description?: string;
    children: ReactNode;
    onNext: () => void;
    onBack: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    canNext?: boolean;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
    currentStep,
    totalSteps,
    title,
    description,
    children,
    onNext,
    onBack,
    isFirstStep,
    isLastStep,
    canNext = true,
}) => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto">
            {/* Progress Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                            {currentStep}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                        Step {currentStep} of {totalSteps}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
                {description && (
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="p-6 min-h-[300px]">
                {children}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    disabled={isFirstStep}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isFirstStep
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    Back
                </button>

                <button
                    onClick={onNext}
                    disabled={!canNext}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${canNext
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                >
                    {isLastStep ? 'Complete Submission' : 'Continue'}
                </button>
            </div>
        </div>
    );
};
