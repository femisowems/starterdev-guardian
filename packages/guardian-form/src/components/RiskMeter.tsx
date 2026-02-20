import React from 'react';
import { useGuardianContext } from './GuardianFormProvider';

/**
 * Visual gauge for form risk scoring.
 */
export function RiskMeter() {
    const { risk } = useGuardianContext();

    return (
        <div className="gf-risk-meter">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gf-secondary)' }}>
                    FORM RISK LEVEL: {risk.level}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>
                    {risk.score}/100
                </span>
            </div>
            <div className="gf-risk-bar-bg">
                <div
                    className={`gf-risk-bar-fill gf-risk-${risk.level}`}
                    style={{ width: `${risk.score}%` }}
                />
            </div>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--gf-secondary)' }}>
                <ul style={{ margin: 0, paddingLeft: '16px', listStyleType: 'square' }}>
                    <li>PII Density: {risk.breakdown.piiWeight} pts</li>
                    <li>Validation Issues: {risk.breakdown.validationPenalty} pts</li>
                    <li>Sensitive Area Density: {risk.breakdown.freeTextPenalty} pts</li>
                </ul>
            </div>
        </div>
    );
}
