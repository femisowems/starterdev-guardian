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
    useGuardianContext,
    Patterns,
    ValidationIndicator
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
    ssn: z.string().min(9, 'SSN (Social Security Number) must be at least 9 digits'),
    sin: z.string().min(9, 'SIN (Social Insurance Number) must be at least 9 digits'),
    approver: z.string().optional(),
});

const AdvancedForm = () => {
    // Note: In real usage, you'd get values/setValues from the provider context
    // This is a simplified demo of the persistence hook
    return (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', sin: '', approver: '' }}
            validate={zodAdapter(schema)}
            policies={[
                NoPlaintextPiiPolicy,
                DependentFieldPolicy(
                    'ssn',
                    (val) => !!val,
                    'approver',
                    'An Approver is required when SSN (Social Security Number) is provided.'
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
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100vh',
            padding: '40px',
            backgroundColor: '#f9fafb'
        }}>
            <div style={{
                display: 'flex',
                gap: '60px',
                alignItems: 'flex-start',
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3>Advanced Governance Form</h3>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
                        Features: Zod Validation, Cross-field Policy (SSN to Approver), and persistence.
                    </p>

                    <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL} encryptionRequired>
                        {({ field }) => <input {...field} className="gf-input" placeholder="person@company.com" />}
                    </GuardianField>

                    <GuardianField name="ssn" label="SSN (Social Security Number)" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" />}
                    </GuardianField>

                    <GuardianField name="sin" label="SIN (Social Insurance Number)" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SIN} placeholder="000-000-000" />}
                    </GuardianField>

                    <GuardianField name="approver" label="Authorized Approver" classification={DataClassification.INTERNAL}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="Required if SSN provided" />}
                    </GuardianField>

                    <RiskMeter />

                    <button type="submit" style={{ padding: '10px', background: '#2c5282', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                        Submit Secure Record
                    </button>
                </div>

                <div style={{ width: '320px', marginTop: '64px' }}>
                    <ComplianceSummary />
                </div>
            </div>
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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '100vh',
                padding: '40px',
                backgroundColor: '#f9fafb'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '60px',
                    alignItems: 'flex-start',
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h2 style={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>Async Governance</h2>
                        <GuardianField name="username" label="Global ID" classification={DataClassification.PUBLIC}>
                            {({ field }) => <input {...field} className="gf-input" placeholder="e.g. jdoe123" />}
                        </GuardianField>

                        <ValidationIndicator />
                        <button type="submit" className="gf-submit-btn" style={{ marginTop: '10px' }}>Check Availability</button>
                    </div>

                    <div style={{ width: '320px', marginTop: '64px' }}>
                        <ComplianceSummary />
                    </div>
                </div>
            </div>
        </GuardianFormProvider>
    )
};
