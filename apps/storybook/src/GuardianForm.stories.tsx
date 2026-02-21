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
    MaskHighlySensitivePolicy,
    Patterns
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/SecureForm',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const BasicSecureForm: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', sin: '' }}
            policies={[NoPlaintextPiiPolicy]}
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
                        <h2 style={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>Secure Form</h2>
                        <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL} encryptionRequired>
                            {({ field }) => <input {...field} className="gf-input" placeholder="email@example.com" />}
                        </GuardianField>

                        <GuardianField name="ssn" label="SSN (Social Security Number)" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                            {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" />}
                        </GuardianField>

                        <GuardianField name="sin" label="SIN (Social Insurance Number)" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                            {({ field }) => <MaskedInput {...field} pattern={Patterns.SIN} placeholder="000-000-000" />}
                        </GuardianField>

                        <RiskMeter />

                        <button type="submit" style={{ padding: '10px', background: '#3182ce', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                            Submit
                        </button>
                    </div>

                    <div style={{ width: '320px', marginTop: '64px' }}>
                        <ComplianceSummary />
                    </div>
                </div>
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
                        <h2 style={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif' }}>High Risk Form</h2>
                        <GuardianField
                            name="cc"
                            label="Credit Card"
                            classification={DataClassification.FINANCIAL}
                            encryptionRequired={false} // This will trigger a violation
                        >
                            {({ field }) => <MaskedInput {...field} pattern={Patterns.CREDIT_CARD} placeholder="0000 0000 0000 0000" />}
                        </GuardianField>

                        <GuardianField
                            name="ssn"
                            label="SSN (Social Security Number)"
                            classification={DataClassification.HIGHLY_SENSITIVE}
                            masked={false} // This will trigger a warning violation
                        >
                            {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" />}
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
                    </div>

                    <div style={{ width: '320px', marginTop: '64px' }}>
                        <ComplianceSummary />
                    </div>
                </div>
            </div>
        </GuardianFormProvider>
    ),
};
