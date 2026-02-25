import { describe, it, expect } from 'vitest';
import { computeRisk, computeFieldViolations, applyRemediation } from './riskEngine';
import { DataClassification } from '@starterdev/guardian-form';
import type { FieldGovernanceState } from './governanceTypes';

describe('riskEngine', () => {
    describe('computeRisk', () => {
        it('calculates 0 risk for empty fields', () => {
            const { score, breakdown } = computeRisk([], 'US', 'viewer');
            expect(score).toBe(0);
            expect(breakdown.level).toBe('LOW');
        });

        it('calculates low risk for PUBLIC fields', () => {
            const fields: FieldGovernanceState[] = [
                {
                    fieldId: 'name',
                    label: 'Name',
                    classification: DataClassification.PUBLIC,
                    maskingMode: 'none',
                    encryptionAtRest: false,
                    encryptionInTransit: true,
                    allowAIProcessing: true,
                    allowModelTraining: false,
                    retentionDays: 30,
                    isRemediated: false,
                },
            ];

            const { score, breakdown } = computeRisk(fields, 'GLOBAL', 'user');
            expect(score).toBe(0); // PUBLIC fields have no penalties
            expect(breakdown.level).toBe('LOW');
        });

        it('calculates high risk for unencrypted HIGHLY_SENSITIVE fields', () => {
            const fields: FieldGovernanceState[] = [
                {
                    fieldId: 'ssn',
                    label: 'SSN',
                    classification: DataClassification.HIGHLY_SENSITIVE,
                    maskingMode: 'none',
                    encryptionAtRest: false,
                    encryptionInTransit: false,
                    allowAIProcessing: true,
                    allowModelTraining: true,
                    retentionDays: 0,
                    isRemediated: false,
                },
            ];

            const { score, breakdown } = computeRisk(fields, 'GLOBAL', 'user');
            expect(score).toBeGreaterThan(70);
            expect(breakdown.piiDensity).toBe(25);
            expect(breakdown.highlySensitiveRatio).toBe(20);
            expect(breakdown.encryptionCoverage).toBe(20);
            expect(breakdown.maskingCoverage).toBe(15);
            expect(breakdown.retentionCompliance).toBe(10);
            expect(breakdown.aiExposurePenalty).toBe(2);
        });

        it('reduces risk stringently for auditors', () => {
            const fields: FieldGovernanceState[] = [
                {
                    fieldId: 'ssn',
                    label: 'SSN',
                    classification: DataClassification.HIGHLY_SENSITIVE,
                    maskingMode: 'full',
                    encryptionAtRest: true,
                    encryptionInTransit: true,
                    allowAIProcessing: false,
                    allowModelTraining: false,
                    retentionDays: 30,
                    isRemediated: false,
                } as FieldGovernanceState,
            ];

            const adminRisk = computeRisk(fields, 'US', 'admin');
            const auditorRisk = computeRisk(fields, 'US', 'auditor');

            expect(adminRisk.breakdown.roleModifier).toBe(-5);
            expect(auditorRisk.breakdown.roleModifier).toBe(-10);
            expect(auditorRisk.score).toBeLessThan(adminRisk.score);
        });
    });

    describe('computeFieldViolations', () => {
        it('flags missing encryption for FINANCIAL data', () => {
            const field: FieldGovernanceState = {
                fieldId: 'cc',
                label: 'Credit Card',
                classification: DataClassification.FINANCIAL,
                maskingMode: 'full',
                encryptionAtRest: false,
                encryptionInTransit: false,
                allowAIProcessing: false,
                allowModelTraining: false,
                retentionDays: 30,
                isRemediated: false,
            };

            const violations = computeFieldViolations(field, 'GLOBAL');
            expect(violations).toHaveLength(1);
            expect(violations[0].ruleId).toBe('require-encryption');
            expect(violations[0].severity).toBe('BLOCK');
        });

        it('flags missing masking for HIGHLY_SENSITIVE data', () => {
            const field: FieldGovernanceState = {
                fieldId: 'ssn',
                label: 'SSN',
                classification: DataClassification.HIGHLY_SENSITIVE,
                maskingMode: 'none',
                encryptionAtRest: true,
                encryptionInTransit: true,
                allowAIProcessing: false,
                allowModelTraining: false,
                retentionDays: 30,
                isRemediated: false,
            };

            const violations = computeFieldViolations(field, 'GLOBAL');
            expect(violations).toHaveLength(1);
            expect(violations[0].ruleId).toBe('require-masking');
            expect(violations[0].severity).toBe('WARN');
        });

        it('flags jurisdictional conflicts (CA block SSN)', () => {
            const field: FieldGovernanceState = {
                fieldId: 'user_ssn',
                label: 'SSN',
                classification: DataClassification.HIGHLY_SENSITIVE,
                maskingMode: 'full',
                encryptionAtRest: true,
                encryptionInTransit: true,
                allowAIProcessing: false,
                allowModelTraining: false,
                retentionDays: 30,
                isRemediated: false,
            } as FieldGovernanceState;

            const globalViolations = computeFieldViolations(field, 'US');
            const caViolations = computeFieldViolations(field, 'CA');

            expect(globalViolations).toHaveLength(0);
            expect(caViolations).toHaveLength(1);
            expect(caViolations[0].ruleId).toBe('pipeda-ssn-blocked');
        });
    });

    describe('applyRemediation', () => {
        it('applies encryption and masking fixes', () => {
            const field: FieldGovernanceState = {
                fieldId: 'ssn',
                label: 'SSN',
                classification: DataClassification.HIGHLY_SENSITIVE,
                maskingMode: 'none',
                encryptionAtRest: false,
                encryptionInTransit: false,
                allowAIProcessing: false,
                allowModelTraining: false,
                retentionDays: 30,
                isRemediated: false,
            } as FieldGovernanceState;

            const patch = applyRemediation(field);

            expect(patch.isRemediated).toBe(true);
            expect(patch.encryptionAtRest).toBe(true);
            expect(patch.encryptionInTransit).toBe(true);
            expect(patch.maskingMode).toBe('full');
            expect(patch.kmsKey).toBe('kms-pii');
        });
    });
});
