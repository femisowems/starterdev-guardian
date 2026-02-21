import React from 'react';
import { useGovernance } from './GovernanceContext';

interface BadgeDef {
    id: string;
    label: string;
    activeFor: string[]; // jurisdiction codes
    color: string;
    description: string;
}

const BADGE_DEFINITIONS: BadgeDef[] = [
    {
        id: 'gdpr', label: 'GDPR', activeFor: ['EU'], color: 'bg-blue-600',
        description: 'EU General Data Protection Regulation',
    },
    {
        id: 'hipaa', label: 'HIPAA', activeFor: ['US'], color: 'bg-emerald-600',
        description: 'US Health Insurance Portability & Accountability Act',
    },
    {
        id: 'pci-dss', label: 'PCI-DSS', activeFor: ['US', 'CA', 'EU'], color: 'bg-purple-600',
        description: 'Payment Card Industry Data Security Standard',
    },
    {
        id: 'pipeda', label: 'PIPEDA', activeFor: ['CA'], color: 'bg-red-600',
        description: 'Canadian Personal Information Protection and Electronic Documents Act',
    },
    {
        id: 'ccpa', label: 'CCPA', activeFor: ['US'], color: 'bg-orange-600',
        description: 'California Consumer Privacy Act',
    },
];

const JURISDICTION_RULES: Record<string, string[]> = {
    US: ['SSN collection permitted', 'SIN collection blocked', 'HIPAA PHI fields require BLOCK-level encryption'],
    CA: ['SIN collection permitted', 'SSN collection blocked', 'PIPEDA consent required for PERSONAL data'],
    EU: ['Financial fields require GDPR business justification', 'Right to erasure must be documented', 'Cross-border transfer requires SCCs'],
};

const JURISDICTION_FLAGS: Record<string, string> = { US: '🇺🇸', CA: '🇨🇦', EU: '🇪🇺' };

export function JurisdictionBadges() {
    const { jurisdiction } = useGovernance();

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{JURISDICTION_FLAGS[jurisdiction]}</span>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Jurisdiction</p>
                        <p className="text-sm font-bold text-slate-800">
                            {jurisdiction === 'US' ? 'United States' : jurisdiction === 'CA' ? 'Canada' : 'European Union'}
                        </p>
                    </div>
                </div>

                {/* Compliance badges */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {BADGE_DEFINITIONS.map(badge => {
                        const active = badge.activeFor.includes(jurisdiction);
                        return (
                            <span
                                key={badge.id}
                                title={badge.description}
                                className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all ${active
                                    ? `${badge.color} text-white shadow-sm`
                                    : 'bg-slate-100 text-slate-300 line-through'
                                    }`}
                            >
                                {badge.label}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Active rules */}
            <div className="bg-slate-50 rounded-lg px-3 py-2 space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Policy Rules</p>
                {JURISDICTION_RULES[jurisdiction].map(rule => (
                    <div key={rule} className="flex items-start gap-1.5">
                        <span className="text-[10px] text-indigo-500 mt-px">▸</span>
                        <span className="text-[10px] text-slate-600">{rule}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
