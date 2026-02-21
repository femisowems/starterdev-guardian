import React, { useState } from 'react';
import { useGovernance } from './GovernanceContext';

export function BulkActionsBar() {
    const { remediateAll, encryptAllSensitive, applyFullMasking, formGovernance, riskScore, emitEvent, config } = useGovernance();
    const [exported, setExported] = useState(false);

    const totalViolations = Object.values(formGovernance).reduce((sum, f) => sum + f.violations.length, 0);
    const fixableViolations = Object.values(formGovernance).reduce((sum, f) => sum + f.violations.filter(v => v.fixable).length, 0);
    const hasViolations = totalViolations > 0;

    const handleExport = () => {
        const report = {
            generatedAt: new Date().toISOString(),
            jurisdiction: config.jurisdiction,
            policyMode: config.policyMode,
            userRole: config.userSimRole,
            riskScore,
            fields: Object.values(formGovernance).map(f => ({
                fieldId: f.fieldId,
                classification: f.classification,
                encryptionAtRest: f.encryptionAtRest,
                encryptionInTransit: f.encryptionInTransit,
                maskingMode: f.maskingMode,
                retentionDays: f.retentionDays,
                approvalStatus: f.approvalStatus,
                violations: f.violations,
            })),
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'compliance-report.json'; a.click();
        setExported(true);
        emitEvent({ action: 'AUDIT_EXPORT', userId: config.userId, region: 'us-east-1', ip: '10.0.4.23', retentionPeriod: '7 years', details: 'Compliance report exported' });
        setTimeout(() => setExported(false), 2000);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Bulk Actions</p>

                    <button
                        id="bulk-fix-all"
                        type="button"
                        onClick={remediateAll}
                        disabled={fixableViolations === 0}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${fixableViolations > 0
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        🔧 Fix All Violations
                        {fixableViolations > 0 && (
                            <span className="bg-white/20 text-white text-[9px] font-black px-1 rounded">
                                {fixableViolations}
                            </span>
                        )}
                    </button>

                    <button
                        id="bulk-encrypt"
                        type="button"
                        onClick={encryptAllSensitive}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                    >
                        🔒 Encrypt All Sensitive
                    </button>

                    <button
                        id="bulk-mask"
                        type="button"
                        onClick={applyFullMasking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-sm shadow-violet-200"
                    >
                        🎭 Apply Full Masking
                    </button>
                </div>

                <button
                    id="export-report"
                    type="button"
                    onClick={handleExport}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${exported
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                >
                    {exported ? '✅ Exported!' : '📋 Export Report'}
                </button>
            </div>

            {hasViolations && (
                <p className="mt-2 text-[10px] text-red-500 font-semibold">
                    ⚠️ {totalViolations} violation{totalViolations !== 1 ? 's' : ''} detected — {fixableViolations} auto-fixable
                </p>
            )}
        </div>
    );
}
