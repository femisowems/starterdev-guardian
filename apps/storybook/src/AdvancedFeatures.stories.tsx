import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    RiskMeter,
    ComplianceSummary,
    DataClassification,
    NoPlaintextPiiPolicy,
    MaskHighlySensitivePolicy,
    DependentFieldPolicy,
    useEncryptedPersistence,
    useGuardianContext
} from '@starterdev/guardian-form';
import { zodAdapter } from '@starterdev/guardian-form/adapters';
import '../../../packages/guardian-form/src/guardian-form.css';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/AdvancedFeatures',
    component: GuardianFormProvider,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

const schema = z.object({
    email: z.string().email('Invalid email format'),
    ssn: z.string().min(9, 'SSN must be at least 9 digits'),
    approver: z.string().optional(),
});

const AdvancedForm = () => {
    // Note: In real usage, you'd get values/setValues from the provider context
    // This is a simplified demo of the persistence hook
    return (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', approver: '' }}
            validate={zodAdapter(schema)}
            policies={[
                NoPlaintextPiiPolicy,
                DependentFieldPolicy(
                    'ssn',
                    (val) => !!val,
                    'approver',
                    'An Approver is required when SSN is provided.'
                )
            ]}
            userContext={{ userId: 'enterprise-user-001' }}
            onSubmit={(v) => alert(JSON.stringify(v))}
        >
            <FormContent />
        </GuardianFormProvider>
    );
};

const FormContent = () => {
    // This component is needed to access context within the provider
    // for hooks like useEncryptedPersistence (if we wanted to use it here)
    return (
        <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3>Advanced Governance Form</h3>
            <p style={{ fontSize: '12px', color: '#666' }}>
                Features: Zod Validation, Cross-field Policy (SSN to Approver), and persistence.
            </p>

            <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL} encryptionRequired>
                {({ field }) => <input {...field} className="gf-input" placeholder="person@company.com" />}
            </GuardianField>

            <GuardianField name="ssn" label="SSN" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                {({ field }) => <MaskedInput {...field} />}
            </GuardianField>

            <GuardianField name="approver" label="Authorized Approver" classification={DataClassification.INTERNAL}>
                {({ field }) => <input {...field} className="gf-input" placeholder="Required if SSN provided" />}
            </GuardianField>

            <RiskMeter />
            <ComplianceSummary />

            <button type="submit" style={{ padding: '10px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Submit Secure Record
            </button>
        </div>
    );
};

export const EnterpriseGovernance: Story = {
    render: () => <AdvancedForm />,
};

export const AsyncValidationDemo: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ username: '' }}
            validate={async (v): Promise<Record<string, string>> => {
                await new Promise(r => setTimeout(r, 1500)); // Simulate API call
                if (v.username === 'admin') {
                    return { username: 'Username already taken' };
                }
                return {};
            }}
            userContext={{ userId: 'user-001' }}
            onSubmit={(v) => alert(JSON.stringify(v))}
        >
            <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <GuardianField name="username" label="Global ID" classification={DataClassification.PUBLIC}>
                    {({ field }) => <input {...field} className="gf-input" />}
                </GuardianField>

                <ValidationIndicator />
                <button type="submit" className="gf-submit-btn">Check Availability</button>
            </div>
        </GuardianFormProvider>
    )
};

const ValidationIndicator = () => {
    const { isValidating } = useGuardianContext();
    return (
        <div style={{ fontSize: '12px', fontStyle: 'italic', color: isValidating ? '#3182ce' : '#666' }}>
            {isValidating ? '🔍 Governance check in progress...' : '✓ System Idle'}
        </div>
    );
};
