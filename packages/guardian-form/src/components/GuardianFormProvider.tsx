import React, { createContext, useContext, ReactNode } from 'react';
import { useGuardianForm, UseGuardianFormOptions } from '../core/useGuardianForm';

interface GuardianFormContextType<T extends Record<string, any> = any> extends ReturnType<typeof useGuardianForm<T>> {
    // Add any additional context properties here
}

const GuardianFormContext = createContext<GuardianFormContextType | null>(null);

export interface GuardianFormProviderProps<T> extends UseGuardianFormOptions<T> {
    children: ReactNode;
}

/**
 * Provider component to inject guardian form state into the application.
 */
export function GuardianFormProvider<T extends Record<string, any>>({
    children,
    ...options
}: GuardianFormProviderProps<T>) {
    const form = useGuardianForm<T>(options);

    return (
        <GuardianFormContext.Provider value={form as any}>
            <form onSubmit={form.handleSubmit} className="gf-container">
                {children}
            </form>
        </GuardianFormContext.Provider>
    );
}

/**
 * Hook to access the current GuardianForm context.
 */
export function useGuardianContext<T extends Record<string, any> = any>() {
    const context = useContext(GuardianFormContext);
    if (!context) {
        throw new Error('useGuardianContext must be used within a GuardianFormProvider');
    }
    return context as GuardianFormContextType<T>;
}
