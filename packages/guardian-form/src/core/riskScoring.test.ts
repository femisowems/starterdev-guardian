import { describe, it, expect } from 'vitest';
import { calculateRiskScore } from './riskScoring';
import { DataClassification } from './types';

describe('calculateRiskScore', () => {
    it('should return low risk for empty metadata', () => {
        const risk = calculateRiskScore({}, {}, {});
        expect(risk.score).toBe(0);
        expect(risk.level).toBe('LOW');
    });

    it('should calculate high risk for multiple sensitive fields', () => {
        const metadata = {
            ssn: { name: 'ssn', label: 'SSN', classification: DataClassification.HIGHLY_SENSITIVE },
            cc: { name: 'cc', label: 'Credit Card', classification: DataClassification.FINANCIAL },
        };
        const values = { ssn: '123', cc: '456' };
        const errors = {};

        const risk = calculateRiskScore(values, metadata, errors);
        expect(risk.score).toBeGreaterThan(60);
        expect(risk.level).toBe('HIGH');
    });

    it('should apply validation penalty', () => {
        const metadata = {
            email: { name: 'email', label: 'Email', classification: DataClassification.PERSONAL },
        };
        const values = { email: 'invalid' };
        const errors = { email: 'Invalid email' };

        const risk = calculateRiskScore(values, metadata, errors);
        // 20 (PERSONAL) + 10 (Validation) = 30
        expect(risk.score).toBe(30);
    });
});
