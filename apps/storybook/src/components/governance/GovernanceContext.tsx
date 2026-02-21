import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DataClassification } from '@starterdev/guardian-form';
import type {
    FormGovernanceState,
    FieldGovernanceState,
    GovernanceConfig,
    GovernanceEvent,
    RiskBreakdownFull,
    RemediationResult,
    PolicyMode,
    JurisdictionMode,
    UserSimRole,
} from './governanceTypes';
import { computeRisk, computeFieldViolations, applyRemediation } from './riskEngine';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface GovernanceContextValue {
    formGovernance: FormGovernanceState;
    updateField: (fieldId: string, patch: Partial<FieldGovernanceState>) => void;
    autoRemediate: (fieldId: string) => RemediationResult;
    remediateAll: () => void;
    encryptAllSensitive: () => void;
    applyFullMasking: () => void;
    riskScore: number;
    riskBreakdown: RiskBreakdownFull;
    auditLog: GovernanceEvent[];
    policyMode: PolicyMode;
    jurisdiction: JurisdictionMode;
    userSimRole: UserSimRole;
    canSubmit: boolean;
    config: GovernanceConfig;
    emitEvent: (event: Omit<GovernanceEvent, 'id' | 'timestamp'>) => void;
}

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

export function useGovernance(): GovernanceContextValue {
    const ctx = useContext(GovernanceContext);
    if (!ctx) throw new Error('useGovernance must be used inside GovernanceProvider');
    return ctx;
}

// ─── Default field governance factory ────────────────────────────────────────

export function defaultFieldGovernance(
    fieldId: string,
    classification: DataClassification,
    label: string
): FieldGovernanceState {
    return {
        fieldId,
        classification,
        label,
        encryptionAtRest: false,
        encryptionInTransit: false,
        kmsKey: 'kms-default',
        maskingMode: 'none',
        accessRole: 'editor',
        auditLogging: { access: false, valueChange: false, validationFailure: false },
        retentionDays: 0,
        autoDelete: false,
        allowAIProcessing: false,
        allowModelTraining: false,
        businessJustification: '',
        approvalStatus: 'pending',
        approverRole: 'legal',
        isRemediated: false,
        violations: [],
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SENSITIVE_CLASSES = new Set([
    DataClassification.FINANCIAL,
    DataClassification.HIGHLY_SENSITIVE,
]);

function generateEventId() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

const MOCK_REGIONS = ['us-east-1', 'eu-west-1', 'ca-central-1'];
const MOCK_IPS = ['192.168.1.42', '10.0.4.23', '172.16.8.100'];

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
    config: GovernanceConfig;
    initialFields: Array<{ fieldId: string; classification: DataClassification; label: string }>;
    children: React.ReactNode;
}

export function GovernanceProvider({ config, initialFields, children }: Props) {
    const [formGovernance, setFormGovernance] = useState<FormGovernanceState>(() => {
        const state: FormGovernanceState = {};
        initialFields.forEach(({ fieldId, classification, label }) => {
            state[fieldId] = defaultFieldGovernance(fieldId, classification, label);
        });
        return state;
    });
    const [auditLog, setAuditLog] = useState<GovernanceEvent[]>([]);
    const prevScoreRef = useRef<number>(-1);

    // ── Recompute violations on every state change ─────────────────────────────
    const governanceWithViolations = useMemo<FormGovernanceState>(() => {
        const result: FormGovernanceState = {};
        Object.values(formGovernance).forEach(field => {
            result[field.fieldId] = {
                ...field,
                violations: computeFieldViolations(field, config.jurisdiction),
            };
        });
        return result;
    }, [formGovernance, config.jurisdiction]);

    // ── Risk score ─────────────────────────────────────────────────────────────
    const { score: riskScore, breakdown: riskBreakdown } = useMemo(
        () => computeRisk(Object.values(governanceWithViolations), config.jurisdiction, config.userSimRole),
        [governanceWithViolations, config.jurisdiction, config.userSimRole]
    );

    // ── Fire onRiskScoreChange when score changes ─────────────────────────────
    useEffect(() => {
        if (prevScoreRef.current !== riskScore) {
            prevScoreRef.current = riskScore;
            config.onRiskScoreChange?.(riskScore, riskBreakdown);
        }
    }, [riskScore, riskBreakdown, config]);

    // ── canSubmit ──────────────────────────────────────────────────────────────
    const canSubmit = useMemo(() => {
        if (config.policyMode !== 'enforce') return true;
        const allViolations = Object.values(governanceWithViolations).flatMap(f => f.violations);
        const blocked = allViolations.some(v => v.severity === 'BLOCK');
        if (blocked) return false;
        // Block if any HIGHLY_SENSITIVE field lacks approval
        const needsApproval = Object.values(governanceWithViolations).filter(
            f => f.classification === DataClassification.HIGHLY_SENSITIVE && f.approvalStatus !== 'approved'
        );
        return needsApproval.length === 0;
    }, [config.policyMode, governanceWithViolations]);

    // ── Event emitter ──────────────────────────────────────────────────────────
    const emitEvent = useCallback((event: Omit<GovernanceEvent, 'id' | 'timestamp'>) => {
        const full: GovernanceEvent = {
            ...event,
            id: generateEventId(),
            timestamp: new Date().toISOString(),
        };
        setAuditLog(prev => [full, ...prev.slice(0, 49)]);
        config.onAuditEvent?.(full);
    }, [config]);

    // ── updateField ────────────────────────────────────────────────────────────
    const updateField = useCallback((fieldId: string, patch: Partial<FieldGovernanceState>) => {
        setFormGovernance(prev => ({
            ...prev,
            [fieldId]: { ...prev[fieldId], ...patch },
        }));
        emitEvent({
            action: 'FIELD_CHANGED',
            fieldId,
            userId: config.userId,
            region: MOCK_REGIONS[0],
            ip: MOCK_IPS[0],
            retentionPeriod: '90 days',
            details: `Governance setting updated for field "${fieldId}"`,
        });
    }, [config.userId, emitEvent]);

    // ── autoRemediate ──────────────────────────────────────────────────────────
    const autoRemediate = useCallback((fieldId: string): RemediationResult => {
        const field = formGovernance[fieldId];
        const patch = applyRemediation(field);
        const applied = Object.keys(patch).filter(k => k !== 'isRemediated');
        setFormGovernance(prev => ({
            ...prev,
            [fieldId]: { ...prev[fieldId], ...patch },
        }));
        config.onAutoRemediation?.(fieldId);
        emitEvent({
            action: 'REMEDIATION',
            fieldId,
            userId: config.userId,
            region: MOCK_REGIONS[0],
            ip: MOCK_IPS[0],
            retentionPeriod: '365 days',
            details: `Auto-remediation applied: ${applied.join(', ')}`,
        });
        return { fieldId, applied, violationsCleared: field.violations.filter(v => v.fixable).length };
    }, [formGovernance, config, emitEvent]);

    // ── remediateAll ──────────────────────────────────────────────────────────
    const remediateAll = useCallback(() => {
        setFormGovernance(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(fieldId => {
                const patch = applyRemediation(next[fieldId]);
                next[fieldId] = { ...next[fieldId], ...patch };
            });
            return next;
        });
        emitEvent({
            action: 'BULK_ACTION',
            userId: config.userId,
            region: MOCK_REGIONS[0],
            ip: MOCK_IPS[0],
            retentionPeriod: '365 days',
            details: 'Bulk remediation applied to all fields',
        });
        Object.keys(formGovernance).forEach(fid => config.onAutoRemediation?.(fid));
    }, [formGovernance, config, emitEvent]);

    // ── encryptAllSensitive ───────────────────────────────────────────────────
    const encryptAllSensitive = useCallback(() => {
        setFormGovernance(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(fieldId => {
                if (SENSITIVE_CLASSES.has(next[fieldId].classification)) {
                    next[fieldId] = { ...next[fieldId], encryptionAtRest: true, encryptionInTransit: true };
                }
            });
            return next;
        });
        emitEvent({
            action: 'BULK_ACTION',
            userId: config.userId,
            region: MOCK_REGIONS[0],
            ip: MOCK_IPS[0],
            retentionPeriod: '365 days',
            details: 'Enabled encryption for all sensitive fields',
        });
    }, [config, emitEvent]);

    // ── applyFullMasking ──────────────────────────────────────────────────────
    const applyFullMasking = useCallback(() => {
        setFormGovernance(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(fieldId => {
                if (next[fieldId].classification === DataClassification.HIGHLY_SENSITIVE) {
                    next[fieldId] = { ...next[fieldId], maskingMode: 'full' };
                }
            });
            return next;
        });
        emitEvent({
            action: 'BULK_ACTION',
            userId: config.userId,
            region: MOCK_REGIONS[0],
            ip: MOCK_IPS[0],
            retentionPeriod: '365 days',
            details: 'Applied full masking to all HIGHLY_SENSITIVE fields',
        });
    }, [config, emitEvent]);

    const value = useMemo<GovernanceContextValue>(() => ({
        formGovernance: governanceWithViolations,
        updateField,
        autoRemediate,
        remediateAll,
        encryptAllSensitive,
        applyFullMasking,
        riskScore,
        riskBreakdown,
        auditLog,
        policyMode: config.policyMode,
        jurisdiction: config.jurisdiction,
        userSimRole: config.userSimRole,
        canSubmit,
        config,
        emitEvent,
    }), [
        governanceWithViolations, updateField, autoRemediate, remediateAll,
        encryptAllSensitive, applyFullMasking, riskScore, riskBreakdown,
        auditLog, config, canSubmit, emitEvent,
    ]);

    return (
        <GovernanceContext.Provider value={value}>
            {children}
        </GovernanceContext.Provider>
    );
}
