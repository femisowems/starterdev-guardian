import { z } from 'zod';

/**
 * Adapter to use Zod schemas for validation within GuardianForm.
 */
export function zodAdapter<T>(schema: z.ZodSchema<T>) {
    return async (values: T): Promise<Record<string, string>> => {
        const result = await schema.safeParseAsync(values);

        if (result.success) {
            return {};
        }

        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            errors[path] = issue.message;
        });

        return errors;
    };
}
