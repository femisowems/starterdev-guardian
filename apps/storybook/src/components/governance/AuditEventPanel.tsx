import React, { useState } from 'react';
import { useGovernance } from './GovernanceContext';

const ACTION_ICONS: Record<string, string> = {
    FIELD_CHANGED: '✏️',
    POLICY_VIOLATION: '🚨',
    REMEDIATION: '🔧',
    BULK_ACTION: '⚡',
    SUBMIT_BLOCKED: '🛑',
    APPROVAL_REQUESTED: '🧑‍⚖️',
    AUDIT_EXPORT: '📤',
};

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AuditEventPanel() {
    const { auditLog } = useGovernance();
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🧾 Audit Event Log</span>
                    {auditLog.length > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            {auditLog.length}
                        </span>
                    )}
                </div>
                <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className="border-t border-slate-100">
                    {auditLog.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-slate-400">No audit events recorded yet.</p>
                    ) : (
                        <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                            {auditLog.map(event => (
                                <div key={event.id} className="px-4 py-2.5 hover:bg-slate-50/50">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <span className="text-sm shrink-0">{ACTION_ICONS[event.action] ?? '📋'}</span>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-slate-700 truncate">{event.details}</p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    {event.fieldId && (
                                                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded font-mono">{event.fieldId}</span>
                                                    )}
                                                    <span className="text-[9px] text-slate-400">by {event.userId}</span>
                                                    <span className="text-[9px] text-slate-400">• {event.region}</span>
                                                    <span className="text-[9px] text-slate-400 font-mono">{event.ip}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] font-mono text-slate-500">{formatTime(event.timestamp)}</p>
                                            <p className="text-[9px] text-slate-400">Retain: {event.retentionPeriod}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400">
                            Showing last {Math.min(auditLog.length, 50)} of {auditLog.length} events
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'guardian-audit-log.json';
                                a.click();
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                        >
                            📤 Export JSON
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
