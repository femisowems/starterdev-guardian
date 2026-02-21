import { DataClassification, FieldMetadata, PolicyRule, PolicyViolation } from './types';

/**
 * Built-in policy: Bloacks submission if PII is detected in a non-encrypted field.
 */
export const NoPlaintextPiiPolicy: PolicyRule = {
    id: 'no-plaintext-pii',
    name: 'No Plaintext PII',
    evaluate: (value, meta, _allValues, _allMetadata) => {
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
    evaluate: (_, meta, _allValues, _allMetadata) => {
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
    evaluate: (_, meta, _allValues, _allMetadata) => {
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
 * Built-in policy: Requires a secondary field to be present if the target field meets a certain condition.
 */
export const DependentFieldPolicy = (
    targetField: string,
    condition: (value: any) => boolean,
    dependentField: string,
    message: string
): PolicyRule => ({
    id: `dependent-${targetField}-${dependentField}`,
    name: 'Dependent Field Policy',
    evaluate: (value, meta, allValues, _allMetadata) => {
        if (meta.name === targetField && condition(value)) {
            if (!allValues[dependentField]) {
                return {
                    ruleId: `dependent-${targetField}-${dependentField}`,
                    message,
                    severity: 'BLOCK',
                };
            }
        }
        return null;
    },
});

/**
 * Built-in policy: Warns if too many PII fields are collected (Data Minimization).
 */
export const DataMinimizationPolicy = (limit: number = 3): PolicyRule => ({
    id: 'data-minimization',
    name: 'Data Minimization',
    evaluate: (_, meta, allValues, allMetadata) => {
        // Trigger only on the first field to avoid duplicate warnings
        const fields = Object.keys(allValues).sort();
        if (meta.name !== fields[0]) return null;

        const piiCount = Object.values(allMetadata).filter(m =>
            m.classification !== DataClassification.PUBLIC &&
            m.classification !== DataClassification.INTERNAL
        ).length;

        if (piiCount > limit) {
            return {
                ruleId: 'data-minimization',
                message: `Collecting ${piiCount} PII fields. Consider reducing for data minimization (limit: ${limit}).`,
                severity: 'WARN',
            };
        }
        return null;
    },
});

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
                const violation = rule.evaluate(value, meta, values, metadata);
                if (violation) {
                    violations.push(violation);
                }
            }
        }

        return violations;
    }
}
