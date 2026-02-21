import React, { useState } from 'react';
import { formatByPattern, maskByPattern } from '../core/patterns';

export interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    highlySensitive?: boolean;
    pattern?: string;
}

/**
 * Input component with visibility toggles and security restrictions.
 */
export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
    ({ highlySensitive, pattern, value, onChange, ...props }, ref) => {
        const [hidden, setHidden] = useState(true);
        const [isFocused, setIsFocused] = useState(false);

        const handleCopy = (e: React.ClipboardEvent) => {
            if (highlySensitive) {
                e.preventDefault();
                alert('Copying is disabled for highly sensitive fields.');
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (pattern && onChange) {
                const hasAlpha = pattern.includes('A');
                // If the pattern has 'A', allow alphanumeric. otherwise just digits.
                const rawValue = hasAlpha
                    ? e.target.value.replace(/[^a-zA-Z0-9]/g, '')
                    : e.target.value.replace(/\D/g, '');
                onChange(rawValue as any);
            } else if (onChange) {
                onChange(e);
            }
        };

        const getDisplayValue = () => {
            if (!pattern || typeof value !== 'string' || props.type === 'date') return value;
            if (hidden) {
                if (isFocused) {
                    return formatByPattern(value, pattern);
                }
                return maskByPattern(value, pattern);
            }
            return formatByPattern(value, pattern);
        };

        const isDate = props.type === 'date';

        return (
            <div className="gf-input-container">
                <input
                    {...props}
                    ref={ref}
                    value={getDisplayValue()}
                    onChange={handleChange}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={`gf-input ${hidden && isFocused && !isDate ? 'gf-input-masked' : ''} ${props.className || ''}`}
                    onCopy={handleCopy}
                    autoComplete="off"
                />
                {!isDate && (
                    <button
                        type="button"
                        className="gf-input-toggle"
                        onClick={() => setHidden(!hidden)}
                        tabIndex={-1}
                    >
                        {hidden ? 'Show' : 'Hide'}
                    </button>
                )}
            </div>
        );
    }
);

MaskedInput.displayName = 'MaskedInput';
