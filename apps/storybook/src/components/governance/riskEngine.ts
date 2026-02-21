import { DataClassification } from '@starterdev/guardian-form';
import type { FieldGovernanceState, JurisdictionMode, UserSimRole, RiskBreakdownFull } from './governanceTypes';

const SENSITIVE_CLASSES = new Set([
    DataClassification.PERSONAL,
    DataClassification.FINANCIAL,
    DataClassification.HIGHLY_SENSITIVE,
]);

const ENCRYPT_REQUIRED_CLASSES = new Set([
    DataClassification.FINANCIAL,
    DataClassification.HIGHLY_SENSITIVE,
]);

// ─── Main entry point ─────────────────────────────────────────────────────────

export function computeRisk(
    fields: FieldGovernanceState[],
    _jurisdiction: JurisdictionMode,
    userRole: UserSimRole
): { score: number; breakdown: RiskBreakdownFull } {
    const total = fields.length;
    if (total === 0) return { score: 0, breakdown: emptyBreakdown() };

    const sensitive = fields.filter(f => SENSITIVE_CLASSES.has(f.classification));
    const highlySensitive = fields.filter(f => f.classification === DataClassification.HIGHLY_SENSITIVE);
    const needsEncryption = fields.filter(f => ENCRYPT_REQUIRED_CLASSES.has(f.classification));
    const encrypted = needsEncryption.filter(f => f.encryptionAtRest && f.encryptionInTransit);
    const maskedFull = sensitive.filter(f => f.maskingMode === 'full');
    const withRetention = fields.filter(f => f.retentionDays > 0);

    // ── Factor scores ─────────────────────────────────────────────────────────

    // PII density (0–25): proportion of sensitive fields
    const piiDensity = Math.round((sensitive.length / total) * 25);

    // Highly sensitive ratio (0–20)
    const highlySensitiveRatio = Math.round((highlySensitive.length / total) * 20);

    // Encryption coverage (0–20): INVERSE — low coverage → high risk
    const encCoverage = needsEncryption.length > 0
        ? encrypted.length / needsEncryption.length
        : 1;
    const encryptionCoverage = Math.round((1 - encCoverage) * 20);

    // Masking coverage (0–15): INVERSE — no masking → high risk
    const maskCoverage = sensitive.length > 0
        ? maskedFull.length / sensitive.length
        : 1;
    const maskingCoverage = Math.round((1 - maskCoverage) * 15);

    // Retention compliance (0–10): INVERSE — no retention policy → higher risk
    const retCompliance = fields.length > 0
        ? withRetention.length / fields.length
        : 1;
    const retentionCompliance = Math.round((1 - retCompliance) * 10);

    // AI exposure penalty (0–5): HIGHLY_SENSITIVE fields with AI processing enabled
    const aiExposed = highlySensitive.filter(f => f.allowAIProcessing || f.allowModelTraining);
    const aiExposurePenalty = Math.min(aiExposed.length * 2, 5);

    // Role modifier (−10 to 0): privileged roles reduce perceived risk
    const roleModifier = userRole === 'auditor' ? -10 : userRole === 'admin' ? -5 : 0;

    // ── Aggregate ─────────────────────────────────────────────────────────────

    const raw = piiDensity + highlySensitiveRatio + encryptionCoverage
        + maskingCoverage + retentionCompliance + aiExposurePenalty + roleModifier;
    const total_score = Math.max(0, Math.min(100, raw));

    const level: RiskBreakdownFull['level'] =
        total_score >= 75 ? 'CRITICAL' :
            total_score >= 50 ? 'HIGH' :
                total_score >= 25 ? 'MEDIUM' : 'LOW';

    return {
        score: total_score,
        breakdown: {
            piiDensity,
            highlySensitiveRatio,
            encryptionCoverage,
            maskingCoverage,
            retentionCompliance,
            aiExposurePenalty,
            roleModifier,
            total: total_score,
            level,
        },
    };
}

// ─── Violation rules ──────────────────────────────────────────────────────────

export function computeFieldViolations(
    field: FieldGovernanceState,
    jurisdiction: JurisdictionMode
): import('./governanceTypes').FieldViolation[] {
    const violations: import('./governanceTypes').FieldViolation[] = [];

    if (ENCRYPT_REQUIRED_CLASSES.has(field.classification)) {
        if (!field.encryptionAtRest || !field.encryptionInTransit) {
            violations.push({
                ruleId: 'require-encryption',
                message: `${field.label} requires encryption at rest and in transit.`,
                severity: 'BLOCK',
                fixable: true,
            });
        }
    }

    if (field.classification === DataClassification.HIGHLY_SENSITIVE && field.maskingMode === 'none') {
        violations.push({
            ruleId: 'require-masking',
            message: `${field.label} is HIGHLY_SENSITIVE and must use at least "partial" masking.`,
            severity: 'WARN',
            fixable: true,
        });
    }

    if (field.classification === DataClassification.HIGHLY_SENSITIVE &&
        (field.allowAIProcessing || field.allowModelTraining)) {
        violations.push({
            ruleId: 'ai-exposure',
            message: `${field.label} is HIGHLY_SENSITIVE — AI processing is prohibited without explicit approval.`,
            severity: 'WARN',
            fixable: false,
        });
    }

    if (jurisdiction === 'EU' && field.classification === DataClassification.FINANCIAL) {
        if (!field.businessJustification) {
            violations.push({
                ruleId: 'gdpr-financial-consent',
                message: `EU jurisdiction: financial fields require a documented GDPR business justification.`,
                severity: 'WARN',
                fixable: false,
            });
        }
    }

    if (jurisdiction === 'CA' && field.fieldId.toLowerCase().includes('ssn')) {
        violations.push({
            ruleId: 'pipeda-ssn-blocked',
            message: `CA jurisdiction: SSN collection is blocked. Use SIN instead.`,
            severity: 'BLOCK',
            fixable: false,
        });
    }

    if (jurisdiction === 'US' && field.fieldId.toLowerCase().includes('sin')) {
        violations.push({
            ruleId: 'hipaa-sin-blocked',
            message: `US jurisdiction: SIN collection is blocked. Use SSN instead.`,
            severity: 'BLOCK',
            fixable: false,
        });
    }

    return violations;
}

// ─── Auto-remediation ─────────────────────────────────────────────────────────

export function applyRemediation(
    field: FieldGovernanceState
): Partial<FieldGovernanceState> {
    const patch: Partial<FieldGovernanceState> = {
        isRemediated: true,
    };
    if (!field.encryptionAtRest || !field.encryptionInTransit) {
        patch.encryptionAtRest = true;
        patch.encryptionInTransit = true;
        patch.kmsKey = field.classification === DataClassification.FINANCIAL ? 'kms-financial' : 'kms-pii';
    }
    if (field.classification === DataClassification.HIGHLY_SENSITIVE && field.maskingMode === 'none') {
        patch.maskingMode = 'full';
    }
    return patch;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyBreakdown(): RiskBreakdownFull {
    return {
        piiDensity: 0,
        highlySensitiveRatio: 0,
        encryptionCoverage: 0,
        maskingCoverage: 0,
        retentionCompliance: 0,
        aiExposurePenalty: 0,
        roleModifier: 0,
        total: 0,
        level: 'LOW',
    };
}
