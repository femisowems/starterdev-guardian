import React, { useEffect, useRef } from 'react';
import { useGovernance } from './GovernanceContext';

// ─── Score color helpers ──────────────────────────────────────────────────────

function scoreColor(score: number) {
    if (score >= 75) return { bar: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-100 text-red-700' };
    if (score >= 50) return { bar: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700' };
    if (score >= 25) return { bar: 'bg-amber-400', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' };
}

// ─── Factor row ───────────────────────────────────────────────────────────────

interface FactorRowProps {
    label: string;
    score: number;
    max: number;
    inverse?: boolean; // lower is better
    description: string;
}

function FactorRow({ label, score, max, description }: FactorRowProps) {
    const pct = max > 0 ? (Math.abs(score) / max) * 100 : 0;
    const isNegative = score < 0; // role modifier
    const displayScore = score < 0 ? score : `+${score}`;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[11px] font-semibold text-slate-700">{label}</span>
                    <p className="text-[9px] text-slate-400 leading-snug">{description}</p>
                </div>
                <span className={`text-[11px] font-black font-mono ${isNegative ? 'text-emerald-600' : score > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {displayScore}
                </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isNegative ? 'bg-emerald-400' : score === 0 ? 'bg-slate-200' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RiskBreakdownPanel() {
    const { riskScore, riskBreakdown, config } = useGovernance();
    const colors = scoreColor(riskScore);
    const prevScoreRef = useRef(riskScore);
    const barRef = useRef<HTMLDivElement>(null);

    // Animate on score change
    useEffect(() => {
        if (!barRef.current) return;
        barRef.current.style.transition = 'width 600ms cubic-bezier(0.4,0,0.2,1)';
        prevScoreRef.current = riskScore;
    }, [riskScore]);

    if (!config.showRiskBreakdown) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* Score header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Governance Risk Score</p>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-3xl font-black ${colors.text}`}>{riskScore}</span>
                            <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                    </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider ${colors.badge}`}>
                    {riskBreakdown.level}
                </span>
            </div>

            {/* Animated score bar */}
            <div className="h-2 bg-slate-100">
                <div
                    ref={barRef}
                    className={`h-full ${colors.bar}`}
                    style={{ width: `${riskScore}%`, transition: 'width 600ms cubic-bezier(0.4,0,0.2,1)' }}
                />
            </div>

            {/* Factor breakdown table */}
            <div className="px-4 py-4 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score Breakdown</p>

                <FactorRow
                    label="PII Density"
                    score={riskBreakdown.piiDensity}
                    max={25}
                    description="Proportion of PERSONAL + FINANCIAL + HIGHLY_SENSITIVE fields"
                />
                <FactorRow
                    label="Highly Sensitive Ratio"
                    score={riskBreakdown.highlySensitiveRatio}
                    max={20}
                    description="Proportion of HIGHLY_SENSITIVE fields vs total"
                />
                <FactorRow
                    label="Encryption Gap"
                    score={riskBreakdown.encryptionCoverage}
                    max={20}
                    description="Sensitive fields missing at-rest or in-transit encryption"
                />
                <FactorRow
                    label="Masking Gap"
                    score={riskBreakdown.maskingCoverage}
                    max={15}
                    description="Sensitive fields without full or partial masking"
                />
                <FactorRow
                    label="Retention Non-Compliance"
                    score={riskBreakdown.retentionCompliance}
                    max={10}
                    description="Fields without a data retention policy set"
                />
                <FactorRow
                    label="AI Exposure Penalty"
                    score={riskBreakdown.aiExposurePenalty}
                    max={5}
                    description="HIGHLY_SENSITIVE fields with AI processing enabled"
                />
                <FactorRow
                    label="Role Modifier"
                    score={riskBreakdown.roleModifier}
                    max={10}
                    description="Privileged roles (admin/auditor) reduce perceived risk"
                />
            </div>
        </div>
    );
}
