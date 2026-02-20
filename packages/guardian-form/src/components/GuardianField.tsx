import React, { useEffect } from 'react';
import { useGuardianContext } from './GuardianFormProvider';
import { DataClassification } from '../core/types';
import { PiiBadge } from './PiiBadge';

export interface GuardianFieldProps {
    name: string;
    label: string;
    classification: DataClassification;
    children: (props: {
        field: {
            value: any;
            onChange: (value: any) => void;
            onBlur: () => void;
            name: string;
        };
        meta: {
            error?: string;
            touched?: boolean;
            classification: DataClassification;
        };
    }) => React.ReactNode;
    masked?: boolean;
    retention?: string;
    encryptionRequired?: boolean;
}

/**
 * Smart field wrapper that handles governance registration and state mapping.
 */
export function GuardianField({
    name,
    label,
    classification,
    masked,
    retention,
    encryptionRequired,
    children,
}: GuardianFieldProps) {
    const { values, errors, touched, registerField, setFieldValue } = useGuardianContext();

    useEffect(() => {
        registerField(name, {
            name,
            label,
            classification,
            masked,
            retention,
            encryptionRequired,
        });
    }, [name, label, classification, masked, retention, encryptionRequired, registerField]);

    const field = {
        name,
        value: values[name] || '',
        onChange: (e: any) => {
            const value = e && typeof e === 'object' && 'target' in e ? e.target.value : e;
            setFieldValue(name, value);
        },
        onBlur: () => { }, // Can be extended to track blur
    };

    const meta = {
        error: errors[name],
        touched: touched[name],
        classification,
    };

    return (
        <div className="gf-field-wrapper" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                {label}
                <PiiBadge level={classification} />
            </label>
            {children({ field, meta })}
            {meta.touched && meta.error && (
                <div style={{ color: 'var(--gf-danger)', fontSize: '12px', marginTop: '4px' }}>
                    {meta.error}
                </div>
            )}
        </div>
    );
}
