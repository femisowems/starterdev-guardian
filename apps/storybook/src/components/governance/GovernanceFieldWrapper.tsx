import React from 'react';
import { DataClassification } from '@starterdev/guardian-form';
import { useGovernance } from './GovernanceContext';
import { FieldGovernancePanel } from './FieldGovernancePanel';

interface Props {
    fieldId: string;
    classification: DataClassification;
    label: string;
    children: React.ReactNode;
}

/**
 * GovernanceFieldWrapper
 *
 * Wraps a standard GuardianField block (children) with a FieldGovernancePanel below it.
 * In "simulate" mode + "viewer" role, field value is visually obscured.
 */
export function GovernanceFieldWrapper({ fieldId, classification, label, children }: Props) {
    const { policyMode, userSimRole, formGovernance } = useGovernance();

    const isViewer = userSimRole === 'viewer';
    const isSimulate = policyMode === 'simulate';
    const isHighlySensitive = classification === DataClassification.HIGHLY_SENSITIVE;
    const shouldObscure = isSimulate && isViewer && (isHighlySensitive || classification === DataClassification.FINANCIAL);

    const field = formGovernance[fieldId];
    const hasBlockViolation = field?.violations.some(v => v.severity === 'BLOCK');

    return (
        <div className={`space-y-2 rounded-xl p-3 transition-colors duration-200 ${hasBlockViolation ? 'bg-red-50/60' : 'bg-transparent'}`}>
            {/* Actual form field — obscured in simulate+viewer mode */}
            <div className={`relative ${shouldObscure ? 'pointer-events-none select-none' : ''}`}>
                {children}
                {shouldObscure && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-lg z-10">
                        <div className="text-center">
                            <p className="text-xs font-bold text-white">🔐 RESTRICTED</p>
                            <p className="text-[9px] text-slate-300 mt-0.5">Viewer role — field hidden</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Governance panel */}
            <FieldGovernancePanel fieldId={fieldId} />
        </div>
    );
}
