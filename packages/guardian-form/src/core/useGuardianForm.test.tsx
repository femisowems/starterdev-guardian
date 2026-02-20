import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGuardianForm } from './useGuardianForm';
import { DataClassification } from './types';

describe('useGuardianForm hook', () => {
    const initialValues = { name: '', email: '' };
    const userContext = { userId: 'test-user' };
    const onSubmit = vi.fn();

    it('should initialize with provided values', () => {
        const { result } = renderHook(() =>
            useGuardianForm({ initialValues, userContext, onSubmit })
        );

        expect(result.current.values).toEqual(initialValues);
        expect(result.current.compliance.isCompliant).toBe(true);
    });

    it('should update field value and recalculate risk', async () => {
        const { result } = renderHook(() =>
            useGuardianForm({ initialValues, userContext, onSubmit })
        );

        // Register a sensitive field to see risk change
        act(() => {
            result.current.registerField('email', {
                name: 'email',
                label: 'Email',
                classification: DataClassification.PERSONAL
            });
        });

        await act(async () => {
            await result.current.setFieldValue('email', 'test@example.com');
        });

        expect(result.current.values.email).toBe('test@example.com');
        expect(result.current.risk.score).toBeGreaterThan(0);
    });

    it('should handle submission if compliant', async () => {
        const { result } = renderHook(() =>
            useGuardianForm({ initialValues, userContext, onSubmit })
        );

        await act(async () => {
            await result.current.handleSubmit();
        });

        expect(onSubmit).toHaveBeenCalledWith(initialValues);
    });
});
