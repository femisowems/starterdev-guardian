import { DataClassification, FieldMetadata, PolicyRule, PolicyViolation } from './types';

/**
 * Built-in policy: Bloacks submission if PII is detected in a non-encrypted field.
 */
export const NoPlaintextPiiPolicy: PolicyRule = {
    id: 'no-plaintext-pii',
    name: 'No Plaintext PII',
    evaluate: (value, meta) => {
        const isPiiValue = meta.classification !== DataClassification.PUBLIC && meta.classification !== DataClassification.INTERNAL;
        if (isPiiValue && !meta.encryptionRequired && value) {
            return {
                ruleId: 'no-plaintext-pii',
                message: `Field "${meta.label}" contains PII but encryption is not enabled.`,
                severity: 'BLOCK',
            };
        }
        return null;
    },
};

/**
 * Built-in policy: Requires encryption for FINANCIAL and HIGHLY_SENSITIVE fields.
 */
export const RequireEncryptionPolicy: PolicyRule = {
    id: 'require-encryption',
    name: 'Require Encryption',
    evaluate: (_, meta) => {
        const needsEncryption =
            meta.classification === DataClassification.FINANCIAL ||
            meta.classification === DataClassification.HIGHLY_SENSITIVE;

        if (needsEncryption && !meta.encryptionRequired) {
            return {
                ruleId: 'require-encryption',
                message: `Field "${meta.label}" requires encryption due to its classification (${meta.classification}).`,
                severity: 'BLOCK',
            };
        }
        return null;
    },
};

/**
 * Built-in policy: Forces masking for HIGHLY_SENSITIVE data.
 */
export const MaskHighlySensitivePolicy: PolicyRule = {
    id: 'mask-highly-sensitive',
    name: 'Mask Highly Sensitive',
    evaluate: (_, meta) => {
        if (meta.classification === DataClassification.HIGHLY_SENSITIVE && !meta.masked) {
            return {
                ruleId: 'mask-highly-sensitive',
                message: `Field "${meta.label}" must be masked for security.`,
                severity: 'WARN',
            };
        }
        return null;
    },
};

/**
 * Policy Engine to evaluate rules against form data.
 */
export class PolicyEngine {
    private rules: PolicyRule[];

    constructor(rules: PolicyRule[] = []) {
        this.rules = rules;
    }

    /**
     * Evaluates all rules against the provided form data.
     */
    evaluate(values: Record<string, any>, metadata: Record<string, FieldMetadata>): PolicyViolation[] {
        const violations: PolicyViolation[] = [];

        for (const [name, value] of Object.entries(values)) {
            const meta = metadata[name];
            if (!meta) continue;

            for (const rule of this.rules) {
                const violation = rule.evaluate(value, meta);
                if (violation) {
                    violations.push(violation);
                }
            }
        }

        return violations;
    }
}
