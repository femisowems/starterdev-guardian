import React from 'react';
import { useGovernance } from './GovernanceContext';

const STAGES = [
    { id: 'collect', label: 'Collect', icon: '📥', desc: 'Field data captured' },
    { id: 'encrypt', label: 'Encrypt', icon: '🔒', desc: 'In-transit & at-rest' },
    { id: 'store', label: 'Store', icon: '🗄️', desc: 'Secure vault storage' },
    { id: 'retain', label: 'Retain', icon: '📅', desc: 'Retention window active' },
    { id: 'delete', label: 'Delete', icon: '🗑️', desc: 'Auto-purge on expiry' },
] as const;

export function DataLifecycleTimeline() {
    const { formGovernance } = useGovernance();
    const fields = Object.values(formGovernance);

    // Determine lifecycle completion per stage
    const hasAnyField = fields.length > 0;
    const allEncrypted = fields.every(f => f.encryptionAtRest && f.encryptionInTransit);
    const allWithRetention = fields.every(f => f.retentionDays > 0);
    const allAutoDelete = fields.every(f => f.autoDelete);

    const stageActive = [
        hasAnyField,   // collect — always active once fields exist
        allEncrypted,  // encrypt
        allEncrypted,  // store — needs encryption
        allWithRetention, // retain
        allAutoDelete,    // delete
    ];

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Data Lifecycle</p>

            <div className="flex items-start gap-0">
                {STAGES.map((stage, idx) => {
                    const active = stageActive[idx];
                    const isLast = idx === STAGES.length - 1;

                    return (
                        <React.Fragment key={stage.id}>
                            {/* Stage node */}
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ minWidth: '3.5rem' }}>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${active ? 'bg-indigo-600 shadow-md shadow-indigo-200 scale-110' : 'bg-slate-100'}`}>
                                    {stage.icon}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wide text-center ${active ? 'text-indigo-700' : 'text-slate-400'}`}>
                                    {stage.label}
                                </span>
                                <span className="text-[8px] text-slate-400 text-center leading-snug px-1">{stage.desc}</span>
                            </div>

                            {/* Connector */}
                            {!isLast && (
                                <div className="flex-1 mt-4 mx-0.5">
                                    <div className={`h-0.5 transition-all duration-500 ${active && stageActive[idx + 1] ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <p className="mt-3 text-[10px] text-slate-400 text-center">
                {!allEncrypted && '⚠️ Enable encryption to progress beyond Collect'}
                {allEncrypted && !allWithRetention && '⚠️ Set retention days to activate the Retain stage'}
                {allWithRetention && !allAutoDelete && '⚠️ Enable auto-delete to complete the lifecycle'}
                {allAutoDelete && '✅ Full data lifecycle is configured'}
            </p>
        </div>
    );
}
