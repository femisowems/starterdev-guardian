import React from 'react';
import { DataClassification } from '../core/types';

export interface PiiBadgeProps {
    level: DataClassification;
}

/**
 * Visual indicators for data classification.
 */
export function PiiBadge({ level }: PiiBadgeProps) {
    const label = level.replace('_', ' ');

    return (
        <span className={`gf-pii-badge gf-level-${level}`}>
            {label}
        </span>
    );
}
