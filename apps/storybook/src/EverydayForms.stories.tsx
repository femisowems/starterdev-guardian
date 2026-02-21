import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
    MaskedInput,
    Patterns,
    ValidationIndicator,
    ComplianceSummary,
    PrivacyHint,
    DataMinimizationPolicy,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';

const meta: Meta = {
    title: 'GuardianForm/EverydayForms',
};

export default meta;
type Story = StoryObj;

const CenteredLayout = ({ children, title }: { children: React.ReactNode, title: string }) => (
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
            <div style={{ maxWidth: '400px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h2 style={{ marginBottom: '16px', fontFamily: 'Inter, sans-serif', color: '#111827' }}>{title}</h2>
                {children}
            </div>
            <div style={{ width: '320px', marginTop: '64px' }}>
                <ComplianceSummary />
            </div>
        </div>
    </div>
);

export const ModernRegistration: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', phone: '', dob: '', zip: '' }}
            policies={[DataMinimizationPolicy(4)]}
            userContext={{ userId: 'demo-user' }}
            onSubmit={(v) => alert(JSON.stringify(v))}
        >
            <CenteredLayout title="US Registration">
                <GuardianField name="name" label="Full Name" classification={DataClassification.PUBLIC}>
                    {({ field }) => <input {...field} className="gf-input" placeholder="Jane Doe" />}
                </GuardianField>

                <GuardianField name="email" label="Email Address" classification={DataClassification.PERSONAL}>
                    {({ field }) => (
                        <>
                            <input {...field} className="gf-input" placeholder="jane@example.com" />
                            <PrivacyHint classification={DataClassification.PERSONAL} message="Used to secure your account and send updates." />
                        </>
                    )}
                </GuardianField>

                <GuardianField name="phone" label="Phone Number" classification={DataClassification.PERSONAL} masked>
                    {({ field }) => (
                        <MaskedInput {...field} pattern={Patterns.PHONE} placeholder="(000) 000-0000" />
                    )}
                </GuardianField>

                <GuardianField name="dob" label="Date of Birth" classification={DataClassification.PERSONAL}>
                    {({ field }) => (
                        <MaskedInput {...field} type="date" className="gf-input" />
                    )}
                </GuardianField>

                <GuardianField name="zip" label="ZIP Code" classification={DataClassification.PERSONAL}>
                    {({ field }) => (
                        <MaskedInput {...field} pattern={Patterns.ZIP} placeholder="00000" />
                    )}
                </GuardianField>

                <div style={{ marginTop: '20px' }}>
                    <ValidationIndicator />
                    <button type="submit" className="gf-input" style={{
                        marginTop: '12px',
                        backgroundColor: 'var(--gf-accent)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        Sign Up
                    </button>
                </div>
            </CenteredLayout>
        </GuardianFormProvider>
    ),
};

export const CanadianRegistration: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', postalCode: '' }}
            policies={[DataMinimizationPolicy(3)]}
            userContext={{ userId: 'ca-user' }}
            onSubmit={(v) => alert(JSON.stringify(v))}
        >
            <CenteredLayout title="Canadian Registration">
                <GuardianField name="name" label="Full Name" classification={DataClassification.PUBLIC}>
                    {({ field }) => <input {...field} className="gf-input" placeholder="Jean Dupont" />}
                </GuardianField>

                <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL}>
                    {({ field }) => <input {...field} className="gf-input" placeholder="jean@example.ca" />}
                </GuardianField>

                <GuardianField name="postalCode" label="Postal Code" classification={DataClassification.PERSONAL}>
                    {({ field }) => (
                        <MaskedInput {...field} pattern={Patterns.POSTAL_CODE} placeholder="A1A 1A1" />
                    )}
                </GuardianField>

                <div style={{ marginTop: '20px' }}>
                    <ValidationIndicator />
                    <button type="submit" className="gf-input" style={{
                        marginTop: '12px',
                        backgroundColor: '#38a169',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        Create Account
                    </button>
                </div>
            </CenteredLayout>
        </GuardianFormProvider>
    ),
};
