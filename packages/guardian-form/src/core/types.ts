/**
 * Data classification levels for field-level governance.
 */
export enum DataClassification {
    /** Publicly accessible data with no privacy concerns. */
    PUBLIC = 'PUBLIC',
    /** Internal business data, not for public consumption. */
    INTERNAL = 'INTERNAL',
    /** Personal information that can identify an individual. */
    PERSONAL = 'PERSONAL',
    /** Sensitive financial data like credit card numbers. */
    FINANCIAL = 'FINANCIAL',
    /** Extremely sensitive data requiring highest protection levels. */
    HIGHLY_SENSITIVE = 'HIGHLY_SENSITIVE',
}

/**
 * Metadata for a governed form field.
 */
export interface FieldMetadata {
    name: string;
    label: string;
    classification: DataClassification;
    masked?: boolean;
    retention?: string;
    encryptionRequired?: boolean;
}

/**
 * Risk scoring breakdown.
 */
export interface RiskBreakdown {
    piiWeight: number;
    validationPenalty: number;
    freeTextPenalty: number;
}

/**
 * Risk scoring result.
 */
export interface RiskScore {
    score: number; // 0-100
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    blocking: boolean;
    breakdown: RiskBreakdown;
}

/**
 * Policy rule definition.
 */
export interface PolicyRule {
    id: string;
    name: string;
    evaluate: (value: any, meta: FieldMetadata) => PolicyViolation | null;
}

/**
 * Policy violation details.
 */
export interface PolicyViolation {
    ruleId: string;
    message: string;
    severity: 'WARN' | 'BLOCK';
}

/**
 * Audit trail metadata.
 */
export interface AuditMeta {
    userId: string;
    timestamp: string;
    fieldsTouched: string[];
    classificationLevels: DataClassification[];
    action: 'CHANGE' | 'SUBMIT' | 'VIEW';
}

/**
 * User context for policy enforcement.
 */
export interface UserContext {
    userId: string;
    role?: string;
}

/**
 * GuardianForm state interface.
 */
export interface GuardianFormState<T = any> {
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    compliance: {
        violations: PolicyViolation[];
        isCompliant: boolean;
    };
    risk: RiskScore;
    metadata: Record<string, FieldMetadata>;
}
