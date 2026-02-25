import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GovernanceProvider, useGovernance } from './GovernanceContext';
import { DataClassification } from '@starterdev/guardian-form';
import type { GovernanceConfig } from './governanceTypes';

function TestConsumer() {
    const { formGovernance, updateField, riskScore, canSubmit, encryptAllSensitive } = useGovernance();

    return (
        <div>
            <div data-testid="score">{riskScore}</div>
            <div data-testid="canSubmit">{canSubmit.toString()}</div>
            <div data-testid="field-ssn-encrypted">{formGovernance['ssn']?.encryptionAtRest.toString()}</div>
            <button
                data-testid="update-btn"
                onClick={() => updateField('ssn', { encryptionAtRest: true, encryptionInTransit: true })}
            >
                Update Field
            </button>
            <button
                data-testid="encrypt-all-btn"
                onClick={() => encryptAllSensitive()}
            >
                Encrypt All
            </button>
        </div>
    );
}

describe('GovernanceContext', () => {
    const mockConfig: GovernanceConfig = {
        jurisdiction: 'US',
        policyMode: 'enforce',
        userId: 'test-user',
        userSimRole: 'viewer',
        autoRemediation: true,
        showRiskBreakdown: true,
    };

    const initialFields = [
        { fieldId: 'name', classification: DataClassification.PUBLIC, label: 'Name' },
        { fieldId: 'ssn', classification: DataClassification.HIGHLY_SENSITIVE, label: 'SSN' },
    ];

    it('initializes context with default values and calculates risk', () => {
        render(
            <GovernanceProvider config={mockConfig} initialFields={initialFields}>
                <TestConsumer />
            </GovernanceProvider>
        );

        // SSN is highly sensitive and unencrypted by default, so score should be > 0
        const score = parseInt(screen.getByTestId('score').textContent || '0');
        expect(score).toBeGreaterThan(0);

        // Cannot submit unencrypted highly sensitive data in enforce mode
        expect(screen.getByTestId('canSubmit').textContent).toBe('false');
        expect(screen.getByTestId('field-ssn-encrypted').textContent).toBe('false');
    });

    it('updates field and recalculates state when updateField is called', () => {
        render(
            <GovernanceProvider config={mockConfig} initialFields={initialFields}>
                <TestConsumer />
            </GovernanceProvider>
        );

        expect(screen.getByTestId('field-ssn-encrypted').textContent).toBe('false');

        act(() => {
            screen.getByTestId('update-btn').click();
        });

        // Field should now be encrypted
        expect(screen.getByTestId('field-ssn-encrypted').textContent).toBe('true');
    });

    it('bulk actions apply to all sensitive fields', () => {
        render(
            <GovernanceProvider config={mockConfig} initialFields={initialFields}>
                <TestConsumer />
            </GovernanceProvider>
        );

        expect(screen.getByTestId('field-ssn-encrypted').textContent).toBe('false');

        act(() => {
            screen.getByTestId('encrypt-all-btn').click();
        });

        expect(screen.getByTestId('field-ssn-encrypted').textContent).toBe('true');
    });
});
