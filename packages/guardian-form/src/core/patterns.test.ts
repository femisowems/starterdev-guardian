import { describe, it, expect } from 'vitest';
import { formatByPattern, Patterns } from './patterns';

describe('Pattern Formatter', () => {
    it('formats SSN correctly', () => {
        expect(formatByPattern('123456789', Patterns.SSN)).toBe('123-45-6789');
    });

    it('formats SIN correctly', () => {
        expect(formatByPattern('123456789', Patterns.SIN)).toBe('123-456-789');
    });

    it('formats Credit Card correctly', () => {
        expect(formatByPattern('1234567890123456', Patterns.CREDIT_CARD)).toBe('1234 5678 9012 3456');
    });

    it('handles partial values', () => {
        expect(formatByPattern('123', Patterns.SSN)).toBe('123');
        expect(formatByPattern('1234', Patterns.SSN)).toBe('123-4');
    });

    it('strips non-digits', () => {
        expect(formatByPattern('123-abc-456', Patterns.SIN)).toBe('123-456');
    });
});
