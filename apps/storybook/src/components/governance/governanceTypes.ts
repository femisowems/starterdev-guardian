import { DataClassification } from '@starterdev/guardian-form';

// ─── Policy & Role Types ───────────────────────────────────────────────────────

export type PolicyMode = 'warn' | 'enforce' | 'simulate';
export type JurisdictionMode = 'US' | 'CA' | 'EU';
export type UserSimRole = 'viewer' | 'admin' | 'auditor';
export type MaskingMode = 'none' | 'partial' | 'full' | 'role-based';
export type AccessRole = 'viewer' | 'editor' | 'restricted' | 'audit-only';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApproverRole = 'legal' | 'ciso' | 'dpo' | 'cco';
export type KmsKey = 'kms-default' | 'kms-financial' | 'kms-healthcare' | 'kms-pii';

// ─── Audit Logging Flags ──────────────────────────────────────────────────────

export interface AuditLoggingFlags {
    access: boolean;
    valueChange: boolean;
    validationFailure: boolean;
}

// ─── Field Governance State (per-field) ───────────────────────────────────────

export interface FieldGovernanceState {
    fieldId: string;
    classification: DataClassification;
    label: string;
    // Encryption
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    kmsKey: KmsKey;
    // Masking
    maskingMode: MaskingMode;
    // Access
    accessRole: AccessRole;
    auditLogging: AuditLoggingFlags;
    // Lifecycle
    retentionDays: number;
    autoDelete: boolean;
    // AI
    allowAIProcessing: boolean;
    allowModelTraining: boolean;
    // Justification (required for HIGHLY_SENSITIVE in enforce mode)
    businessJustification: string;
    approvalStatus: ApprovalStatus;
    approverRole: ApproverRole;
    // Internal
    isRemediated: boolean;
    violations: FieldViolation[];
}

export type FormGovernanceState = Record<string, FieldGovernanceState>;

// ─── Violations ───────────────────────────────────────────────────────────────

export interface FieldViolation {
    ruleId: string;
    message: string;
    severity: 'WARN' | 'BLOCK';
    fixable: boolean;
}

// ─── Risk Scoring ─────────────────────────────────────────────────────────────

export interface RiskBreakdownFull {
    piiDensity: number;              // 0-25 pts
    highlySensitiveRatio: number;    // 0-20 pts
    encryptionCoverage: number;      // 0-20 pts (inverse — low coverage = high score)
    maskingCoverage: number;         // 0-15 pts (inverse)
    retentionCompliance: number;     // 0-10 pts (inverse)
    aiExposurePenalty: number;       // 0-5 pts
    roleModifier: number;            // -10 to 0 pts
    total: number;                   // 0-100
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ─── Audit Events ─────────────────────────────────────────────────────────────

export interface GovernanceEvent {
    id: string;
    timestamp: string;
    action: 'FIELD_CHANGED' | 'POLICY_VIOLATION' | 'REMEDIATION' | 'BULK_ACTION' | 'SUBMIT_BLOCKED' | 'APPROVAL_REQUESTED' | 'AUDIT_EXPORT';
    fieldId?: string;
    userId: string;
    region: string;
    ip: string;
    retentionPeriod: string;
    details: string;
}

// ─── Remediation ──────────────────────────────────────────────────────────────

export interface RemediationResult {
    fieldId: string;
    applied: string[];
    violationsCleared: number;
}

// ─── Jurisdiction Badge ───────────────────────────────────────────────────────

export interface ComplianceBadge {
    id: string;
    label: string;
    active: boolean;
    color: string;
}

// ─── Governance Context Props (passed from stories) ───────────────────────────

export interface GovernanceConfig {
    policyMode: PolicyMode;
    jurisdiction: JurisdictionMode;
    userSimRole: UserSimRole;
    autoRemediation: boolean;
    showRiskBreakdown: boolean;
    userId: string;
    onPolicyViolation?: (fieldId: string, rule: string) => void;
    onAutoRemediation?: (fieldId: string) => void;
    onRiskScoreChange?: (score: number, breakdown: RiskBreakdownFull) => void;
    onApprovalRequested?: (fieldId: string) => void;
    onAuditEvent?: (event: GovernanceEvent) => void;
}
