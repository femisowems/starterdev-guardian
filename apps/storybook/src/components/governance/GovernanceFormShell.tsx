import React from 'react';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    DataClassification,
    NoPlaintextPiiPolicy,
    RequireEncryptionPolicy,
    MaskHighlySensitivePolicy,
    Patterns,
    RiskMeter,
} from '@starterdev/guardian-form';
import { GovernanceProvider, useGovernance } from './GovernanceContext';
import { GovernanceFieldWrapper } from './GovernanceFieldWrapper';
import { JurisdictionBadges } from './JurisdictionBadges';
import { BulkActionsBar } from './BulkActionsBar';
import { RiskBreakdownPanel } from './RiskBreakdownPanel';
import { AuditEventPanel } from './AuditEventPanel';
import { DataLifecycleTimeline } from './DataLifecycleTimeline';
import type { GovernanceConfig } from './governanceTypes';

// ─── Field definitions ────────────────────────────────────────────────────────

const GOVERNED_FIELDS = [
    { fieldId: 'cc', classification: DataClassification.FINANCIAL, label: 'Credit Card' },
    { fieldId: 'ssn', classification: DataClassification.HIGHLY_SENSITIVE, label: 'Social Security Number' },
    { fieldId: 'email', classification: DataClassification.PERSONAL, label: 'Email Address' },
    { fieldId: 'note', classification: DataClassification.INTERNAL, label: 'Internal Notes' },
] as const;

// ─── Submit button ────────────────────────────────────────────────────────────

interface SubmitButtonProps {
    canSubmit: boolean;
    policyMode: string;
    hasViolations: boolean;
    onSubmit?: () => void;
}

function GovernanceSubmitButton({ canSubmit, policyMode, hasViolations, onSubmit }: SubmitButtonProps) {
    let label = 'Submit Securely';
    if (policyMode === 'enforce' && !canSubmit) label = '🛑 Blocked by Policy';
    else if (policyMode === 'warn' && hasViolations) label = '⚠️ Submit (Violations Detected)';
    else if (policyMode === 'simulate') label = '🔬 Submit (Simulation)';

    return (
        <button
            id="governance-submit"
            type="button"
            disabled={policyMode === 'enforce' && !canSubmit}
            onClick={onSubmit}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${policyMode === 'enforce' && !canSubmit
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : policyMode === 'warn' && hasViolations
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 active:scale-[0.98]'
                }`}
        >
            {label}
        </button>
    );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

interface Props {
    config: GovernanceConfig;
    onSubmit?: (values: any) => void;
}

export function GovernanceFormShell({ config, onSubmit }: Props) {
    // Build Guardian policies from policyMode context
    const guardianPolicies = [
        NoPlaintextPiiPolicy,
        RequireEncryptionPolicy,
        MaskHighlySensitivePolicy,
    ];

    return (
        <GovernanceProvider config={config} initialFields={[...GOVERNED_FIELDS]}>
            <GovernanceShellInner config={config} guardianPolicies={guardianPolicies} onSubmit={onSubmit} />
        </GovernanceProvider>
    );
}

// ─── Inner shell (has access to context) ─────────────────────────────────────

function GovernanceShellInner({ config, guardianPolicies, onSubmit }: { config: GovernanceConfig; guardianPolicies: any[]; onSubmit?: (values: any) => void }) {
    const { canSubmit, formGovernance } = useGovernance();
    const hasViolations = Object.values(formGovernance).some((f: any) => f.violations.length > 0);

    return (
        <GuardianFormProvider
            initialValues={{ cc: '', ssn: '', email: '', note: '' }}
            policies={guardianPolicies}
            userContext={{ userId: config.userId, role: config.userSimRole }}
            onAudit={config.onAuditEvent as any}
            onSubmit={onSubmit as any}
        >
            <div className="max-w-2xl mx-auto space-y-4 p-4">
                {/* Mode indicator strip */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold"
                    style={{
                        borderColor: config.policyMode === 'enforce' ? '#fca5a5' : config.policyMode === 'simulate' ? '#a5b4fc' : '#fde68a',
                        backgroundColor: config.policyMode === 'enforce' ? '#fef2f2' : config.policyMode === 'simulate' ? '#eef2ff' : '#fffbeb',
                        color: config.policyMode === 'enforce' ? '#dc2626' : config.policyMode === 'simulate' ? '#4338ca' : '#b45309',
                    }}
                >
                    {config.policyMode === 'enforce' && '🔴 ENFORCE MODE — violations block submission'}
                    {config.policyMode === 'simulate' && '🟣 SIMULATE MODE — changes are not persisted, viewer fields are hidden'}
                    {config.policyMode === 'warn' && '🟡 WARN MODE — violations shown but submission permitted'}
                    <span className="ml-auto font-mono bg-white/50 px-1.5 py-0.5 rounded">
                        Role: {config.userSimRole} • Jurisdiction: {config.jurisdiction}
                    </span>
                </div>

                {/* Jurisdiction strip */}
                <JurisdictionBadges />

                {/* Bulk actions */}
                <BulkActionsBar />

                {/* Form fields with governance panels */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-sm">
                    <h2 className="text-base font-bold text-slate-800 mb-4">🏛️ Enterprise Governance Form</h2>

                    {/* Credit Card */}
                    <GovernanceFieldWrapper fieldId="cc" classification={DataClassification.FINANCIAL} label="Credit Card">
                        <div className="space-y-1 mb-1">
                            <label className="block text-xs font-bold text-slate-600">Credit Card <span className="text-[9px] text-orange-500 font-bold bg-orange-50 px-1 rounded">FINANCIAL</span></label>
                            <GuardianField name="cc" label="Credit Card" classification={DataClassification.FINANCIAL} encryptionRequired={false}>
                                {({ field }) => <MaskedInput {...field} id="gov-cc" pattern={Patterns.CREDIT_CARD} placeholder="0000 0000 0000 0000" />}
                            </GuardianField>
                        </div>
                    </GovernanceFieldWrapper>

                    {/* SSN */}
                    <GovernanceFieldWrapper fieldId="ssn" classification={DataClassification.HIGHLY_SENSITIVE} label="Social Security Number">
                        <div className="space-y-1 mb-1">
                            <label className="block text-xs font-bold text-slate-600">SSN <span className="text-[9px] text-red-500 font-bold bg-red-50 px-1 rounded">HIGHLY SENSITIVE</span></label>
                            <GuardianField name="ssn" label="SSN" classification={DataClassification.HIGHLY_SENSITIVE} masked={false}>
                                {({ field }) => <MaskedInput {...field} id="gov-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" />}
                            </GuardianField>
                        </div>
                    </GovernanceFieldWrapper>

                    {/* Email */}
                    <GovernanceFieldWrapper fieldId="email" classification={DataClassification.PERSONAL} label="Email Address">
                        <div className="space-y-1 mb-1">
                            <label className="block text-xs font-bold text-slate-600">Email <span className="text-[9px] text-blue-500 font-bold bg-blue-50 px-1 rounded">PERSONAL</span></label>
                            <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL} encryptionRequired>
                                {({ field }) => <input {...field} id="gov-email" className="gf-input" placeholder="employee@company.com" />}
                            </GuardianField>
                        </div>
                    </GovernanceFieldWrapper>

                    {/* Notes */}
                    <GovernanceFieldWrapper fieldId="note" classification={DataClassification.INTERNAL} label="Internal Notes">
                        <div className="space-y-1 mb-1">
                            <label className="block text-xs font-bold text-slate-600">Internal Notes <span className="text-[9px] text-slate-500 font-bold bg-slate-50 px-1 rounded border">INTERNAL</span></label>
                            <GuardianField name="note" label="Notes" classification={DataClassification.INTERNAL}>
                                {({ field }) => <textarea {...field} id="gov-notes" className="gf-input min-h-[60px] resize-none" placeholder="Internal case notes..." />}
                            </GuardianField>
                        </div>
                    </GovernanceFieldWrapper>
                </div>

                {/* RiskMeter from library */}
                <RiskMeter />

                {/* Governance Submit */}
                <GovernanceSubmitButton
                    canSubmit={canSubmit}
                    policyMode={config.policyMode}
                    hasViolations={hasViolations}
                    onSubmit={() => { }}
                />

                {/* Risk breakdown panel */}
                <RiskBreakdownPanel />

                {/* Data lifecycle */}
                <DataLifecycleTimeline />

                {/* Audit log */}
                <AuditEventPanel />
            </div>
        </GuardianFormProvider>
    );
}
