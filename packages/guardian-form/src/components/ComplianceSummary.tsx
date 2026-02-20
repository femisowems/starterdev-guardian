import React from 'react';
import { useGuardianContext } from './GuardianFormProvider';
import { DataClassification } from '../core/types';

/**
 * Summary panel for form governance state.
 */
export function ComplianceSummary() {
    const { compliance, metadata, values } = useGuardianContext();

    const fieldCount = Object.keys(metadata).length;
    const piiCount = Object.values(metadata).filter(
        (m) => m.classification !== DataClassification.PUBLIC && m.classification !== DataClassification.INTERNAL
    ).length;
    const encryptedCount = Object.values(metadata).filter((m) => m.encryptionRequired).length;

    return (
        <div className="gf-compliance-card">
            <div className="gf-compliance-header">
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Governance Summary</h3>
                <span className={`gf-status-badge ${compliance.isCompliant ? 'gf-risk-LOW' : 'gf-risk-HIGH'}`} style={{ color: '#fff' }}>
                    {compliance.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </span>
            </div>

            <div style={{ borderTop: '1px solid var(--gf-border)', paddingTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--gf-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Fields</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{fieldCount}</div>
                </div>
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--gf-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>PII Fields</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{piiCount}</div>
                </div>
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--gf-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Encrypted</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{encryptedCount}</div>
                </div>
                <div>
                    <div style={{ fontSize: '11px', color: 'var(--gf-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Violations</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: compliance.violations.length > 0 ? 'var(--gf-danger)' : 'inherit' }}>
                        {compliance.violations.length}
                    </div>
                </div>
            </div>

            {compliance.violations.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(229, 62, 62, 0.05)', borderRadius: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gf-danger)', marginBottom: '4px' }}>Violations:</div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--gf-danger)' }}>
                        {compliance.violations.map((v, i) => (
                            <li key={i}>{v.message}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
