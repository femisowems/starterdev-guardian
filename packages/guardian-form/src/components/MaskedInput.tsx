import React, { useState } from 'react';

export interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    highlySensitive?: boolean;
}

/**
 * Input component with visibility toggles and security restrictions.
 */
export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
    ({ highlySensitive, ...props }, ref) => {
        const [hidden, setHidden] = useState(true);

        const handleCopy = (e: React.ClipboardEvent) => {
            if (highlySensitive) {
                e.preventDefault();
                alert('Copying is disabled for highly sensitive fields.');
            }
        };

        return (
            <div className="gf-input-container">
                <input
                    {...props}
                    ref={ref}
                    type={hidden ? 'password' : 'text'}
                    className={`gf-input ${props.className || ''}`}
                    onCopy={handleCopy}
                    autoComplete="off"
                />
                <button
                    type="button"
                    className="gf-input-toggle"
                    onClick={() => setHidden(!hidden)}
                    tabIndex={-1}
                >
                    {hidden ? 'Show' : 'Hide'}
                </button>
            </div>
        );
    }
);

MaskedInput.displayName = 'MaskedInput';
