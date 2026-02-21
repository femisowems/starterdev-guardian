import React from 'react';
import { DataClassification } from '../core/types';

interface PrivacyHintProps {
    classification: DataClassification;
    message?: string;
}

const classificationHints: Record<DataClassification, string> = {
    [DataClassification.PUBLIC]: "This information is public and not sensitive.",
    [DataClassification.INTERNAL]: "Used for internal business purposes only.",
    [DataClassification.PERSONAL]: "This helps us identify you and provide a personalized experience.",
    [DataClassification.FINANCIAL]: "Required for payment processing. This data is handled with extra security.",
    [DataClassification.HIGHLY_SENSITIVE]: "Critical identity information. We use the highest level of protection for this data.",
};

/**
 * A user-friendly component to explain why certain data is being collected.
 * Ideal for "Everyday Forms" to build user trust.
 */
export function PrivacyHint({ classification, message }: PrivacyHintProps) {
    const hint = message || classificationHints[classification];

    return (
        <div className="gf-privacy-hint" style={{
            fontSize: '12px',
            color: 'var(--gf-secondary)',
            marginTop: '4px',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            {hint}
        </div>
    );
}
