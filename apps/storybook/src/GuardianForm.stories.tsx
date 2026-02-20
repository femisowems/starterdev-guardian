import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    RiskMeter,
    ComplianceSummary,
    DataClassification,
    NoPlaintextPiiPolicy,
    RequireEncryptionPolicy,
    MaskHighlySensitivePolicy
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/SecureForm',
    component: GuardianFormProvider,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const BasicSecureForm: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '' }}
            policies={[NoPlaintextPiiPolicy]}
            userContext={{ userId: 'user-001' }}
            onSubmit={(v) => alert(JSON.stringify(v))}
        >
            <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL} encryptionRequired>
                    {({ field }) => <input {...field} className="gf-input" />}
                </GuardianField>

                <GuardianField name="ssn" label="SSN" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                    {({ field }) => <MaskedInput {...field} />}
                </GuardianField>

                <RiskMeter />
                <ComplianceSummary />

                <button type="submit" style={{ padding: '10px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Submit
                </button>
            </div>
        </GuardianFormProvider>
    ),
};

export const HighRiskForm: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ cc: '', ssn: '', note: '' }}
            policies={[NoPlaintextPiiPolicy, RequireEncryptionPolicy, MaskHighlySensitivePolicy]}
            userContext={{ userId: 'user-002' }}
            onSubmit={(v) => alert(JSON.stringify(v))}
        >
            <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <GuardianField
                    name="cc"
                    label="Credit Card"
                    classification={DataClassification.FINANCIAL}
                    encryptionRequired={false} // This will trigger a violation
                >
                    {({ field }) => <input {...field} className="gf-input" />}
                </GuardianField>

                <GuardianField
                    name="ssn"
                    label="SSN"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    masked={false} // This will trigger a warning violation
                >
                    {({ field }) => <input {...field} className="gf-input" />}
                </GuardianField>

                <GuardianField
                    name="note"
                    label="Internal Notes (Sensitive)"
                    classification={DataClassification.INTERNAL}
                >
                    {({ field }) => (
                        <textarea
                            {...field}
                            className="gf-input"
                            placeholder="Typing a lot here will increase risk score..."
                        />
                    )}
                </GuardianField>

                <RiskMeter />
                <ComplianceSummary />
            </div>
        </GuardianFormProvider>
    ),
};
