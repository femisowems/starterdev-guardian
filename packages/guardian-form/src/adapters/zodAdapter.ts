import { z } from 'zod';

/**
 * Zod adapter to convert Zod validation errors to GuardianForm error format.
 */
export function zodAdapter<T>(schema: z.ZodSchema<T>) {
    return (values: Record<string, any>) => {
        const result = schema.safeParse(values);
        if (result.success) {
            return {};
        }

        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            if (path && !errors[path]) {
                errors[path] = issue.message;
            }
        });

        return errors;
    };
}
