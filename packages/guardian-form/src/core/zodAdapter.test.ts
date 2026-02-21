import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { zodAdapter } from '../adapters/zodAdapter';

describe('zodAdapter', () => {
    const schema = z.object({
        email: z.string().email('Invalid email'),
        age: z.number().min(18, 'Must be at least 18'),
    });

    it('returns empty object for valid data', () => {
        const validate = zodAdapter(schema);
        const errors = validate({ email: 'test@example.com', age: 20 });
        expect(errors).toEqual({});
    });

    it('returns error map for invalid data', () => {
        const validate = zodAdapter(schema);
        const errors = validate({ email: 'invalid-email', age: 16 });

        expect(errors.email).toBe('Invalid email');
        expect(errors.age).toBe('Must be at least 18');
    });

    it('handles missing fields', () => {
        const validate = zodAdapter(schema);
        const errors = validate({});
        expect(errors.email).toBeDefined();
        expect(errors.age).toBeDefined();
    });
});
