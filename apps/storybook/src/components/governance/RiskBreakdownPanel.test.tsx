import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBreakdownPanel } from './RiskBreakdownPanel';
import { GovernanceProvider } from './GovernanceContext';
import { DataClassification } from '@starterdev/guardian-form';
import type { GovernanceConfig } from './governanceTypes';

function renderWithProvider(ui: React.ReactElement, configOverrides?: Partial<GovernanceConfig>) {
    const config: GovernanceConfig = {
        jurisdiction: 'US',
        policyMode: 'enforce',
        userId: 'test-user',
        userSimRole: 'viewer',
        showRiskBreakdown: true,
        autoRemediation: true,
        ...configOverrides,
    };

    const initialFields = [
        { fieldId: 'ssn', classification: DataClassification.HIGHLY_SENSITIVE, label: 'SSN' },
        { fieldId: 'creditCard', classification: DataClassification.FINANCIAL, label: 'Credit Card' },
    ];

    return render(
        <GovernanceProvider config={config} initialFields={initialFields}>
            {ui}
        </GovernanceProvider>
    );
}

describe('RiskBreakdownPanel', () => {
    it('renders the risk score and all factor rows', () => {
        renderWithProvider(<RiskBreakdownPanel />);

        // Should render the main score header
        expect(screen.getByText('Governance Risk Score')).toBeInTheDocument();

        // Both fields are sensitive, unencrypted, completely unmasked by default
        // So risk should be very high (CRITICAL)
        expect(screen.getByText('CRITICAL')).toBeInTheDocument();

        // Should render the breakdown rows
        expect(screen.getByText('PII Density')).toBeInTheDocument();
        expect(screen.getByText('Highly Sensitive Ratio')).toBeInTheDocument();
        expect(screen.getByText('Encryption Gap')).toBeInTheDocument();
        expect(screen.getByText('Masking Gap')).toBeInTheDocument();
        expect(screen.getByText('Retention Non-Compliance')).toBeInTheDocument();
        expect(screen.getByText('AI Exposure Penalty')).toBeInTheDocument();
        expect(screen.getByText('Role Modifier')).toBeInTheDocument();
    });

    it('returns null if showRiskBreakdown is false', () => {
        const { container } = renderWithProvider(<RiskBreakdownPanel />, { showRiskBreakdown: false });
        expect(container.firstChild).toBeNull();
    });
});
