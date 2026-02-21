import React from 'react';
import { useGuardianContext } from './GuardianFormProvider';

/**
 * Displays the current validation status of the form.
 * Specifically handles the `isValidating` state for asynchronous checks.
 */
export function ValidationIndicator() {
    const { isValidating } = useGuardianContext();

    return (
        <div
            className="gf-validation-indicator"
            style={{
                fontSize: '12px',
                fontStyle: 'italic',
                color: isValidating ? 'var(--gf-accent)' : 'var(--gf-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 0'
            }}
        >
            {isValidating && (
                <span className="gf-spinner" style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(0,0,0,0.1)',
                    borderTopColor: 'currentColor',
                    borderRadius: '50%',
                    animation: 'gf-spin 1s linear infinite'
                }} />
            )}
            {isValidating ? '🔍 Governance check in progress...' : '✓ System Idle'}
        </div>
    );
}
