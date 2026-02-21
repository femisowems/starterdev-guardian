import React from 'react';
import { DataClassification } from '@starterdev/guardian-form';

// ─── Classification Badge ────────────────────────────────────────────────────

const classificationConfig: Record<DataClassification, { label: string; color: string }> = {
    [DataClassification.PUBLIC]: { label: 'PUBLIC', color: 'bg-slate-100 text-slate-600 ring-slate-200' },
    [DataClassification.INTERNAL]: { label: 'INTERNAL', color: 'bg-slate-200 text-slate-700 ring-slate-300' },
    [DataClassification.PERSONAL]: { label: 'PERSONAL', color: 'bg-blue-50 text-blue-700 ring-blue-200' },
    [DataClassification.FINANCIAL]: { label: 'FINANCIAL', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
    [DataClassification.HIGHLY_SENSITIVE]: { label: 'HIGHLY SENSITIVE', color: 'bg-red-50 text-red-700 ring-red-200' },
};

interface PiiBadgeProps {
    classification: DataClassification;
}

export const PiiBadge: React.FC<PiiBadgeProps> = ({ classification }) => {
    const { label, color } = classificationConfig[classification];
    return (
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-widest ring-1 ring-inset ${color}`}>
            {label}
        </span>
    );
};

// ─── GuardianFieldLayout ─────────────────────────────────────────────────────

interface GuardianFieldLayoutProps {
    label: string;
    name: string;
    classification: DataClassification;
    complianceNote?: string;
    error?: string;
    children: React.ReactNode;
}

export const GuardianFieldLayout: React.FC<GuardianFieldLayoutProps> = ({
    label,
    name,
    classification,
    complianceNote,
    error,
    children,
}) => {
    const descId = `${name}-desc`;
    const errId = `${name}-err`;

    return (
        <div className="space-y-1.5">
            {/* Label row */}
            <div className="flex items-center justify-between gap-3">
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-slate-700 leading-none"
                >
                    {label}
                </label>
                <PiiBadge classification={classification} />
            </div>

            {/* Input area — children provides the actual <input> / <MaskedInput> */}
            <div
                className={`
          relative rounded-lg overflow-hidden border transition-colors
          ${error
                        ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-300 focus-within:border-red-400'
                        : 'border-slate-300 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-500'
                    }
          [&_.gf-input]:!border-0 [&_.gf-input]:!ring-0 [&_.gf-input]:!rounded-none [&_.gf-input]:!shadow-none
        `}
                aria-describedby={`${complianceNote ? descId : ''} ${error ? errId : ''}`}
            >
                {children}
            </div>

            {/* Validation error */}
            {error && (
                <p id={errId} className="flex items-center gap-1 text-xs text-red-600" role="alert">
                    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}

            {/* Compliance metadata */}
            {complianceNote && !error && (
                <p id={descId} className="text-xs text-slate-400 leading-snug">
                    {complianceNote}
                </p>
            )}
        </div>
    );
};

export default GuardianFieldLayout;
