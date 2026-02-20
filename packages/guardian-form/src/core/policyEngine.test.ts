import { describe, it, expect } from 'vitest';
import { NoPlaintextPiiPolicy, RequireEncryptionPolicy } from './policyEngine';
import { DataClassification } from './types';

describe('PolicyEngine Built-ins', () => {
    describe('NoPlaintextPiiPolicy', () => {
        it('should block if PII is present without encryption', () => {
            const meta = {
                name: 'email',
                label: 'Email',
                classification: DataClassification.PERSONAL,
                encryptionRequired: false
            };
            const violation = NoPlaintextPiiPolicy.evaluate('test@example.com', meta);
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe('BLOCK');
        });

        it('should not block if encryption is enabled', () => {
            const meta = {
                name: 'email',
                label: 'Email',
                classification: DataClassification.PERSONAL,
                encryptionRequired: true
            };
            const violation = NoPlaintextPiiPolicy.evaluate('test@example.com', meta);
            expect(violation).toBeNull();
        });
    });

    describe('RequireEncryptionPolicy', () => {
        it('should block FINANCIAL fields without encryptionRequired flag', () => {
            const meta = {
                name: 'card',
                label: 'Card',
                classification: DataClassification.FINANCIAL,
                encryptionRequired: false
            };
            const violation = RequireEncryptionPolicy.evaluate('123', meta);
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe('BLOCK');
        });
    });
});
