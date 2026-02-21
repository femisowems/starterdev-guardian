import React from 'react';
import { ComplianceSummaryPanel, ComplianceData } from './ComplianceSummaryPanel';

interface FormLayoutProps {
    title: string;
    description?: string;
    complianceData: ComplianceData;
    children: React.ReactNode;
    onSubmit?: () => void;
    submitLabel?: string;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
    title,
    description,
    complianceData,
    children,
    onSubmit,
    submitLabel = 'Submit',
}) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-start justify-center p-8">
            <div className="w-full max-w-5xl">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    )}
                </div>

                {/* Card with 2-col layout on desktop */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[2fr_1fr]">
                        {/* Left: form fields */}
                        <div className="px-8 py-8 border-b md:border-b-0 md:border-r border-slate-100">
                            <div className="space-y-6">
                                {children}
                            </div>

                            {/* Submit */}
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onSubmit}
                                    className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:bg-indigo-700 transition-colors"
                                >
                                    {submitLabel}
                                </button>
                            </div>
                        </div>

                        {/* Right: compliance panel */}
                        <div className="bg-slate-50/50 px-6 py-8">
                            <ComplianceSummaryPanel data={complianceData} />
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-4 text-center text-xs text-slate-400">
                    Protected by <span className="font-semibold text-indigo-500">@starterdev/guardian-form</span> · Field-level governance &amp; compliance
                </p>
            </div>
        </div>
    );
};

export default FormLayout;
