import React, { useState } from 'react';
import { useGovernance } from './GovernanceContext';
import type { FieldGovernanceState, MaskingMode, AccessRole, KmsKey, ApproverRole } from './governanceTypes';
import { DataClassification } from '@starterdev/guardian-form';

interface Props {
    fieldId: string;
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const EncIcon = ({ on }: { on: boolean }) => (
    <span title={on ? 'Encrypted' : 'Not encrypted'}>
        {on ? '🔒' : '🔓'}
    </span>
);
const MaskIcon = ({ on }: { on: boolean }) => (
    <span title={on ? 'Masked' : 'Unmasked'}>{on ? '🎭' : '👁️'}</span>
);
const AuditIcon = ({ on }: { on: boolean }) => (
    <span title={on ? 'Audit logging on' : 'Audit logging off'}>{on ? '🧾' : '—'}</span>
);
const ApprovalIcon = ({ status }: { status: string }) => (
    <span title={`Approval: ${status}`}>
        {status === 'approved' ? '🧑‍⚖️' : status === 'rejected' ? '❌' : '⏳'}
    </span>
);

// ─── Severity badge ───────────────────────────────────────────────────────────

const SeverityBadge = ({ severity }: { severity: 'WARN' | 'BLOCK' }) => (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${severity === 'BLOCK' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
        {severity}
    </span>
);

// ─── Section toggle ───────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-t border-slate-100 first:border-t-0">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
                {title}
                <span className="text-slate-400">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
        </div>
    );
};

const Toggle = ({
    label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between gap-2 cursor-pointer group">
        <span className="text-xs text-slate-600 group-hover:text-slate-800">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-200'}`}
        >
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${checked ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
        </button>
    </label>
);

const Sel = <T extends string>({
    label, value, options, onChange,
}: { label: string; value: T; options: { label: string; value: T }[]; onChange: (v: T) => void }) => (
    <div className="space-y-1">
        <label className="block text-[10px] font-bold text-slate-500 uppercase">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value as T)}
            className="w-full text-xs bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-300 outline-none"
        >
            {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export function FieldGovernancePanel({ fieldId }: Props) {
    const { formGovernance, updateField, autoRemediate, config, emitEvent } = useGovernance();
    const [panelOpen, setPanelOpen] = useState(false);

    const field: FieldGovernanceState | undefined = formGovernance[fieldId];
    if (!field) return null;

    const isHS = field.classification === DataClassification.HIGHLY_SENSITIVE;
    const isEncrypted = field.encryptionAtRest && field.encryptionInTransit;
    const isMasked = field.maskingMode !== 'none';
    const isAudited = field.auditLogging.access || field.auditLogging.valueChange;

    const u = <K extends keyof FieldGovernanceState>(k: K, v: FieldGovernanceState[K]) =>
        updateField(fieldId, { [k]: v } as any);

    return (
        <div className={`rounded-lg border text-xs transition-all duration-200 ${field.violations.length > 0 ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'}`}>
            {/* Header */}
            <button
                type="button"
                onClick={() => setPanelOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50/80 rounded-t-lg transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Governance
                    </span>
                    <span className="flex gap-1">
                        <EncIcon on={isEncrypted} />
                        <MaskIcon on={isMasked} />
                        <AuditIcon on={isAudited} />
                        {isHS && <ApprovalIcon status={field.approvalStatus} />}
                    </span>
                    {field.violations.length > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-1 py-0.5 rounded">
                            {field.violations.length} VIOLATION{field.violations.length !== 1 ? 'S' : ''}
                        </span>
                    )}
                    {field.isRemediated && (
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1 py-0.5 rounded">FIXED ✓</span>
                    )}
                </div>
                <span className="text-slate-400 text-[10px]">{panelOpen ? '▲' : '▼'}</span>
            </button>

            {/* Violations */}
            {field.violations.length > 0 && (
                <div className="px-3 pb-2 space-y-1.5">
                    {field.violations.map(v => (
                        <div key={v.ruleId} className="flex items-start justify-between gap-2 bg-white rounded px-2 py-1.5 border border-dashed border-red-200">
                            <div className="flex items-start gap-1.5 min-w-0">
                                <SeverityBadge severity={v.severity} />
                                <span className="text-[10px] text-slate-600 leading-snug">{v.message}</span>
                            </div>
                            {v.fixable && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        autoRemediate(fieldId);
                                        config.onPolicyViolation?.(fieldId, v.ruleId);
                                    }}
                                    className="shrink-0 text-[9px] font-black px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors uppercase"
                                >
                                    Fix →
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Accordion panels */}
            {panelOpen && (
                <div className="border-t border-slate-100">
                    {/* Encryption */}
                    <Section title="🔒 Encryption">
                        <Toggle label="Encrypt at Rest" checked={field.encryptionAtRest} onChange={v => u('encryptionAtRest', v)} />
                        <Toggle label="Encrypt in Transit" checked={field.encryptionInTransit} onChange={v => u('encryptionInTransit', v)} />
                        <Sel<KmsKey>
                            label="KMS Key"
                            value={field.kmsKey}
                            options={[
                                { value: 'kms-default', label: 'Default Key' },
                                { value: 'kms-financial', label: 'Financial Key (PCI)' },
                                { value: 'kms-healthcare', label: 'Healthcare Key (HIPAA)' },
                                { value: 'kms-pii', label: 'PII Key (GDPR)' },
                            ]}
                            onChange={v => u('kmsKey', v)}
                        />
                    </Section>

                    {/* Masking */}
                    <Section title="🎭 Masking">
                        <Sel<MaskingMode>
                            label="Masking Mode"
                            value={field.maskingMode}
                            options={[
                                { value: 'none', label: 'None (visible)' },
                                { value: 'partial', label: 'Partial (last 4 visible)' },
                                { value: 'full', label: 'Full (all masked)' },
                                { value: 'role-based', label: 'Role-Based (admin only)' },
                            ]}
                            onChange={v => u('maskingMode', v)}
                        />
                    </Section>

                    {/* Access */}
                    <Section title="🧑‍💼 Access Control">
                        <Sel<AccessRole>
                            label="Access Role"
                            value={field.accessRole}
                            options={[
                                { value: 'viewer', label: 'Viewer (read-only)' },
                                { value: 'editor', label: 'Editor' },
                                { value: 'restricted', label: 'Restricted (approval required)' },
                                { value: 'audit-only', label: 'Audit Only' },
                            ]}
                            onChange={v => u('accessRole', v)}
                        />
                        <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Audit Logging</p>
                        <Toggle label="Access events" checked={field.auditLogging.access}
                            onChange={v => u('auditLogging', { ...field.auditLogging, access: v })} />
                        <Toggle label="Value change events" checked={field.auditLogging.valueChange}
                            onChange={v => u('auditLogging', { ...field.auditLogging, valueChange: v })} />
                        <Toggle label="Validation failure events" checked={field.auditLogging.validationFailure}
                            onChange={v => u('auditLogging', { ...field.auditLogging, validationFailure: v })} />
                    </Section>

                    {/* Lifecycle */}
                    <Section title="⏱ Data Lifecycle">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Retention Days</label>
                            <input
                                type="number"
                                min={0}
                                value={field.retentionDays}
                                onChange={e => u('retentionDays', parseInt(e.target.value) || 0)}
                                className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-300"
                                placeholder="0 = no policy set"
                            />
                        </div>
                        <Toggle label="Auto-delete on expiry" checked={field.autoDelete}
                            onChange={v => u('autoDelete', v)} />
                    </Section>

                    {/* AI */}
                    <Section title="🤖 AI Governance">
                        <Toggle label="Allow AI processing" checked={field.allowAIProcessing}
                            onChange={v => u('allowAIProcessing', v)} />
                        <Toggle label="Allow model training" checked={field.allowModelTraining}
                            onChange={v => u('allowModelTraining', v)} />
                        {isHS && (field.allowAIProcessing || field.allowModelTraining) && (
                            <p className="text-[10px] text-red-600 font-semibold">⚠️ HIGHLY_SENSITIVE + AI requires explicit DPO approval.</p>
                        )}
                    </Section>

                    {/* Justification (HIGHLY_SENSITIVE only) */}
                    {isHS && (
                        <Section title="🧑‍⚖️ Justification &amp; Approval">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">Business Justification</label>
                                <textarea
                                    value={field.businessJustification}
                                    onChange={e => u('businessJustification', e.target.value)}
                                    placeholder="Required for HIGHLY_SENSITIVE in enforce mode..."
                                    className="w-full text-xs border border-slate-200 rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-300 min-h-[60px] resize-none"
                                />
                            </div>
                            <Sel<'pending' | 'approved' | 'rejected'>
                                label="Approval Status"
                                value={field.approvalStatus}
                                options={[
                                    { value: 'pending', label: '⏳ Pending Review' },
                                    { value: 'approved', label: '✅ Approved' },
                                    { value: 'rejected', label: '❌ Rejected' },
                                ]}
                                onChange={v => {
                                    u('approvalStatus', v);
                                    if (v === 'pending') config.onApprovalRequested?.(fieldId);
                                }}
                            />
                            <Sel<ApproverRole>
                                label="Approver Role"
                                value={field.approverRole}
                                options={[
                                    { value: 'legal', label: 'Legal' },
                                    { value: 'ciso', label: 'CISO' },
                                    { value: 'dpo', label: 'Data Protection Officer' },
                                    { value: 'cco', label: 'Chief Compliance Officer' },
                                ]}
                                onChange={v => u('approverRole', v)}
                            />
                        </Section>
                    )}
                </div>
            )}
        </div>
    );
}
