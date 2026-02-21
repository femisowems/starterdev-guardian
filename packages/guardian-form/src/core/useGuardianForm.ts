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

/**
 * Headless hook for managing enterprise-grade forms with governance.
 */
export function useGuardianForm<T extends Record<string, any>>({
    initialValues,
    policies = [],
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
     * Internal validation and compliance check.
     */
    const runValidation = useCallback(async (values: T, metadata: Record<string, FieldMetadata>) => {
        setState((prev) => ({ ...prev, isValidating: true }));
        let errors: Record<string, string> = {};
        if (validate) {
            errors = await validate(values);
        }
        setState((prev) => ({ ...prev, isValidating: false }));

        const violations = policyEngine.evaluate(values, metadata);
        const risk = calculateRiskScore(values, metadata, errors);

        return {
            errors,
            violations,
            risk,
        };
    }, [policyEngine, validate]);

    /**
     * Handles field value changes.
     */
    const setFieldValue = useCallback(async (name: keyof T, value: any) => {
        const newValues = { ...state.values, [name]: value };
        const meta = state.metadata[name as string];

        if (meta) {
            auditTrailRef.current.track(name as string, meta.classification);
            if (onAudit) {
                onAudit(auditTrailRef.current.generateMeta('CHANGE'));
            }
        }

        const { errors, violations, risk } = await runValidation(newValues, state.metadata);

        setState((prev) => ({
            ...prev,
            values: newValues,
            errors,
            compliance: {
                violations,
                isCompliant: violations.every((v) => v.severity !== 'BLOCK'),
            },
            risk,
            touched: { ...prev.touched, [name]: true },
        }));
    }, [state.values, state.metadata, runValidation, onAudit]);

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
