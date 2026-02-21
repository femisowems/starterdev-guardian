import React, { useMemo } from 'react';
import { useGuardianContext, DataClassification, FieldMetadata } from '@starterdev/guardian-form';



// ─── Types ───────────────────────────────────────────────────────────────────

export type ComplianceStatus = 'ok' | 'warn' | 'error';

export interface PolicyWarning {
    ruleId: string;
    message: string;
    severity: 'WARN' | 'ERROR';
}

export interface ComplianceData {
    totalFields: number;
    piiFields: number;
    encryptedFields: number;
    violations: PolicyWarning[];
    retentionPolicy?: string;
    auditLogging: boolean;
    riskScore: number; // 0–100
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const riskColor = (score: number): string => {
    if (score <= 30) return 'bg-emerald-500';
    if (score <= 60) return 'bg-amber-400';
    return 'bg-red-500';
};

const riskLabel = (score: number): { label: string; color: string } => {
    if (score <= 30) return { label: 'Low Risk', color: 'text-emerald-700 bg-emerald-50 ring-emerald-200' };
    if (score <= 60) return { label: 'Medium Risk', color: 'text-amber-700  bg-amber-50  ring-amber-200' };
    return { label: 'High Risk', color: 'text-red-700   bg-red-50    ring-red-200' };
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

const KVRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
        <span className="text-xs text-slate-500 shrink-0">{label}</span>
        <span className="text-xs font-medium text-slate-800 text-right">{value}</span>
    </div>
);

const StatusDot: React.FC<{ status: ComplianceStatus }> = ({ status }) => {
    const color = { ok: 'bg-emerald-400', warn: 'bg-amber-400', error: 'bg-red-500' }[status];
    return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden="true" />;
};

// ─── RiskMeter ────────────────────────────────────────────────────────────────

const InlineRiskMeter: React.FC<{ score: number }> = ({ score }) => {
    const { label, color } = riskLabel(score);
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Risk Score</span>
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ring-1 ring-inset ${color}`}>
                    {label}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${riskColor(score)}`}
                    style={{ width: `${score}%` }}
                    role="meter"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Risk score: ${score} out of 100`}
                />
            </div>
            <p className="text-right text-[10px] text-slate-400">{score}/100</p>
        </div>
    );
};

// ─── ComplianceSummaryPanel ───────────────────────────────────────────────────

interface ComplianceSummaryPanelProps {
    data?: ComplianceData;
}


export const ComplianceSummaryPanel: React.FC<ComplianceSummaryPanelProps> = ({ data: propData }) => {
    const context = useGuardianContext<any>();

    // Derive data from context if not provided via props
    const data: ComplianceData = useMemo(() => {
        if (propData) return propData;

        const { metadata, compliance, risk } = context;
        const metadataValues = Object.values(metadata) as FieldMetadata[];

        const totalFields = Object.keys(metadata).length;
        const piiFields = metadataValues.filter(
            (m) => m.classification !== DataClassification.PUBLIC && m.classification !== DataClassification.INTERNAL
        ).length;
        const encryptedFields = metadataValues.filter((m) => m.encryptionRequired).length;

        // Find a retention policy if any exists
        const firstRetentionField = metadataValues.find(m => m.retention);

        return {
            totalFields,
            piiFields,
            encryptedFields,
            violations: compliance.violations.map((v: any) => ({
                ruleId: v.ruleId,
                message: v.message,
                severity: v.severity === 'BLOCK' ? 'ERROR' : 'WARN'
            })),
            riskScore: risk.score,
            auditLogging: true, // Defaulting to true for demo
            retentionPolicy: firstRetentionField?.retention || '90 days'
        };
    }, [propData, context]);


    const hasViolations = data.violations.length > 0;
    const overallStatus: ComplianceStatus = data.violations.some(v => v.severity === 'ERROR')
        ? 'error'
        : data.violations.some(v => v.severity === 'WARN')
            ? 'warn'
            : 'ok';


    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">Governance Summary</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Real-time compliance status</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <StatusDot status={overallStatus} />
                    <span className="text-xs font-medium text-slate-600 capitalize">{overallStatus === 'ok' ? 'Compliant' : overallStatus === 'warn' ? 'Warning' : 'Violation'}</span>
                </div>
            </div>

            <div className="px-5 py-4 space-y-4">
                {/* Risk meter */}
                <InlineRiskMeter score={data.riskScore} />

                {/* Key-value stats */}
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-1">
                    <KVRow label="Total Fields" value={data.totalFields} />
                    <KVRow label="PII Fields" value={<span className={data.piiFields > 0 ? 'text-amber-600' : ''}>{data.piiFields}</span>} />
                    <KVRow label="Encrypted" value={
                        <span className="flex items-center gap-1">
                            <StatusDot status={data.encryptedFields === data.piiFields && data.piiFields > 0 ? 'ok' : data.piiFields > 0 ? 'warn' : 'ok'} />
                            {data.encryptedFields}/{data.piiFields}
                        </span>
                    } />

                    <KVRow label="Audit Logging" value={
                        data.auditLogging
                            ? <span className="text-emerald-600">Enabled</span>
                            : <span className="text-red-500">Disabled</span>
                    } />
                    {data.retentionPolicy && (
                        <KVRow label="Retention Policy" value={data.retentionPolicy} />
                    )}
                </div>

                {/* Policy warnings */}
                {hasViolations && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Policy Warnings</p>
                        {data.violations.map((v, i) => (
                            <div
                                key={i}
                                role="alert"
                                className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${v.severity === 'ERROR'
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                            >
                                <span className="shrink-0 font-bold">{v.severity}</span>
                                <span className="leading-relaxed">{v.message}</span>
                            </div>
                        ))}
                    </div>
                )}

                {!hasViolations && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        No policy violations detected
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplianceSummaryPanel;
