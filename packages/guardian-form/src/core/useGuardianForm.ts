import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    GuardianFormState,
    FieldMetadata,
    PolicyRule,
    UserContext,
    AuditMeta
} from './types';
import { PolicyEngine } from './policyEngine';
import { calculateRiskScore } from './riskScoring';
import { AuditTrail } from './auditTrail';

export interface UseGuardianFormOptions<T> {
    initialValues: T;
    schema?: any; // To be used by adapters
    policies?: PolicyRule[];
    userContext: UserContext;
    onAudit?: (meta: AuditMeta) => void;
    onSubmit: (values: T) => Promise<void> | void;
    validate?: (values: T) => Record<string, string> | Promise<Record<string, string>>;
}

const DEFAULT_POLICIES: PolicyRule[] = [];

/**
 * Headless hook for managing enterprise-grade forms with governance.
 */
export function useGuardianForm<T extends Record<string, any>>({
    initialValues,
    policies = DEFAULT_POLICIES,
    userContext,

    onAudit,
    onSubmit,
    validate,
}: UseGuardianFormOptions<T>) {
    const [state, setState] = useState<GuardianFormState<T>>({
        values: initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        compliance: {
            violations: [],
            isCompliant: true,
        },
        risk: {
            score: 0,
            level: 'LOW',
            blocking: false,
            breakdown: { piiWeight: 0, validationPenalty: 0, freeTextPenalty: 0 },
        },
        metadata: {},
    });

    const policyEngine = useMemo(() => new PolicyEngine(policies), [policies]);
    const auditTrailRef = useRef(new AuditTrail(userContext));

    // Update audit trail if user context changes
    useEffect(() => {
        auditTrailRef.current = new AuditTrail(userContext);
    }, [userContext]);

    /**
     * Registers a field with its governance metadata.
     */
    const registerField = useCallback((name: string, meta: FieldMetadata) => {
        setState((prev) => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [name]: meta,
            },
        }));
    }, []);

    /**
     * Pure governance evaluator (async).
     */
    const evaluateGovernance = useCallback(async (values: T, metadata: Record<string, FieldMetadata>) => {
        let errors: Record<string, string> = {};
        if (validate) {
            errors = await validate(values);
        }
        const violations = policyEngine.evaluate(values, metadata);
        const risk = calculateRiskScore(values, metadata, errors);

        return {
            errors,
            violations,
            risk,
        };
    }, [policyEngine, validate]);

    /**
     * Internal validation and compliance check with state updates.
     */
    const runValidation = useCallback(async (values: T, metadata: Record<string, FieldMetadata>) => {
        setState((prev) => ({ ...prev, isValidating: true }));
        try {
            const result = await evaluateGovernance(values, metadata);
            return result;
        } finally {
            setState((prev) => ({ ...prev, isValidating: false }));
        }
    }, [evaluateGovernance]);

    /**
     * Handles field value changes.
     */
    const setFieldValue = useCallback(async (name: keyof T, value: any) => {
        setState((prev) => ({
            ...prev,
            values: { ...prev.values, [name]: value },
            touched: { ...prev.touched, [name]: true },
        }));

        const meta = state.metadata[name as string];
        if (meta) {
            auditTrailRef.current.track(name as string, meta.classification);
            if (onAudit) {
                onAudit(auditTrailRef.current.generateMeta('CHANGE'));
            }
        }
    }, [state.metadata, onAudit]);

    /**
     * Effect to synchronize governance metrics whenever values, metadata or policies change.
     */
    useEffect(() => {
        if (Object.keys(state.metadata).length === 0) return;

        let isMounted = true;
        const syncGovernance = async () => {
            const { errors, violations, risk } = await evaluateGovernance(state.values, state.metadata);
            if (isMounted) {
                setState((prev) => ({
                    ...prev,
                    errors,
                    compliance: {
                        violations,
                        isCompliant: violations.every((v) => v.severity !== 'BLOCK'),
                    },
                    risk,
                }));
            }
        };

        syncGovernance();
        return () => {
            isMounted = false;
        };
    }, [state.values, state.metadata, evaluateGovernance]);





    /**
     * Handles form submission.
     */
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        setState((prev) => ({ ...prev, isSubmitting: true }));

        const { errors, violations, risk } = await runValidation(state.values, state.metadata);
        const isCompliant = violations.every((v) => v.severity !== 'BLOCK');

        if (Object.keys(errors).length === 0 && isCompliant) {
            const auditMeta = auditTrailRef.current.generateMeta('SUBMIT');
            if (onAudit) onAudit(auditMeta);

            try {
                await onSubmit(state.values);
            } finally {
                setState((prev) => ({ ...prev, isSubmitting: false }));
            }
        } else {
            setState((prev) => ({
                ...prev,
                errors,
                compliance: { violations, isCompliant },
                risk,
                isSubmitting: false
            }));
        }
    }, [state.values, state.metadata, runValidation, onSubmit, onAudit]);

    const resetForm = useCallback(() => {
        setState((prev) => ({
            ...prev,
            values: initialValues,
            errors: {},
            touched: {},
            isSubmitting: false,
        }));
        auditTrailRef.current.reset();
    }, [initialValues]);

    return {
        ...state,
        setFieldValue,
        handleSubmit,
        resetForm,
        registerField,
        setValues: (values: T) => setState(prev => ({ ...prev, values })),
    };
}
