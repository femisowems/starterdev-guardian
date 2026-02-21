import { describe, it, expect } from 'vitest';
import { NoPlaintextPiiPolicy, RequireEncryptionPolicy, DependentFieldPolicy, DataMinimizationPolicy } from './policyEngine';
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
            const violation = NoPlaintextPiiPolicy.evaluate('test@example.com', meta, {}, {});
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
            const violation = NoPlaintextPiiPolicy.evaluate('test@example.com', meta, {}, {});
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
            const violation = RequireEncryptionPolicy.evaluate('123', meta, {}, {});
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe('BLOCK');
        });
    });

    describe('DependentFieldPolicy', () => {
        const policy = DependentFieldPolicy(
            'hasPii',
            (val) => !!val,
            'consent',
            'Consent required'
        );

        it('should block if target is true and dependency is missing', () => {
            const meta = { name: 'hasPii', label: 'PII', classification: DataClassification.PUBLIC };
            const violation = policy.evaluate(true, meta, { hasPii: true }, { hasPii: meta });
            expect(violation).not.toBeNull();
            expect(violation?.message).toBe('Consent required');
        });

        it('should pass if target is true and dependency is present', () => {
            const meta = { name: 'hasPii', label: 'PII', classification: DataClassification.PUBLIC };
            const violation = policy.evaluate(true, meta, { hasPii: true, consent: 'yes' }, { hasPii: meta });
            expect(violation).toBeNull();
        });

        it('should pass if target is false', () => {
            const meta = { name: 'hasPii', label: 'PII', classification: DataClassification.PUBLIC };
            const violation = policy.evaluate(false, meta, { hasPii: false }, { hasPii: meta });
            expect(violation).toBeNull();
        });
    });

    describe('DataMinimizationPolicy', () => {
        const policy = DataMinimizationPolicy(1);
        const piiMeta = (name: string) => ({ name, label: name, classification: DataClassification.PERSONAL });
        const publicMeta = (name: string) => ({ name, label: name, classification: DataClassification.PUBLIC });

        it('should warn if PII count exceeds limit', () => {
            const metadata = { email: piiMeta('email'), phone: piiMeta('phone') };
            const values = { email: 'test', phone: '123' };
            // Evaluate on first field ('email' comes before 'phone')
            const violation = policy.evaluate('test', metadata.email, values, metadata);
            expect(violation).not.toBeNull();
            expect(violation?.severity).toBe('WARN');
            expect(violation?.message).toContain('Collecting 2 PII fields');
        });

        it('should not warn if PII count is within limit', () => {
            const metadata = { email: piiMeta('email'), name: publicMeta('name') };
            const values = { email: 'test', name: 'Joe' };
            const violation = policy.evaluate('test', metadata.email, values, metadata);
            expect(violation).toBeNull();
        });

        it('should only warn on the first field', () => {
            const metadata = { a: piiMeta('a'), b: piiMeta('b') };
            const values = { a: '1', b: '2' };

            const violationA = policy.evaluate('1', metadata.a, values, metadata);
            const violationB = policy.evaluate('2', metadata.b, values, metadata);

            expect(violationA).not.toBeNull();
            expect(violationB).toBeNull();
        });
    });
});
