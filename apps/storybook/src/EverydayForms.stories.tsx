import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
    MaskedInput,
    Patterns,
    ValidationIndicator,
    PrivacyHint,
    DataMinimizationPolicy,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';
import { ComplianceData } from './components/ComplianceSummaryPanel';

const meta: Meta = {
    title: 'GuardianForm/EverydayForms',
};

export default meta;
type Story = StoryObj;

// ─── Compliance data ──────────────────────────────────────────────────────────

const usCompliance: ComplianceData = {
    totalFields: 5,
    piiFields: 4,
    encryptedFields: 0,
    violations: [],
    retentionPolicy: '90 days',
    auditLogging: false,
    riskScore: 32,
};

const caCompliance: ComplianceData = {
    totalFields: 3,
    piiFields: 2,
    encryptedFields: 0,
    violations: [],
    retentionPolicy: '90 days',
    auditLogging: false,
    riskScore: 18,
};

// ─── US Registration ──────────────────────────────────────────────────────────

export const ModernRegistration: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', phone: '', dob: '', zip: '' }}
            policies={[DataMinimizationPolicy(4)]}
            userContext={{ userId: 'demo-user' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="US Registration"
                description="Standard registration form with phone masking, calendar date picker, and ZIP code formatting."
                complianceData={usCompliance}
                submitLabel="Sign Up"
            >
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PUBLIC}>
                    <GuardianField name="name" label="" classification={DataClassification.PUBLIC}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="Jane Doe" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Email Address"
                    name="email"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used to secure your account and send policy updates."
                >
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => (
                            <>
                                <input {...field} className="gf-input" placeholder="jane@example.com" />
                                <PrivacyHint classification={DataClassification.PERSONAL} message="Used to secure your account and send updates." />
                            </>
                        )}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Phone Number" name="phone" classification={DataClassification.PERSONAL}>
                    <GuardianField name="phone" label="" classification={DataClassification.PERSONAL} masked>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.PHONE} placeholder="(000) 000-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Date of Birth"
                    name="dob"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used for age verification only."
                >
                    <GuardianField name="dob" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <MaskedInput {...field} type="date" className="gf-input" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="ZIP Code" name="zip" classification={DataClassification.PERSONAL}>
                    <GuardianField name="zip" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.ZIP} placeholder="00000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <ValidationIndicator />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
};

// ─── Canadian Registration ────────────────────────────────────────────────────

export const CanadianRegistration: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', postalCode: '' }}
            policies={[DataMinimizationPolicy(3)]}
            userContext={{ userId: 'ca-user' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="Canadian Registration"
                description="Demonstrates the A1A 1A1 postal code pattern for Canadian regional addresses."
                complianceData={caCompliance}
                submitLabel="Create Account"
            >
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PUBLIC}>
                    <GuardianField name="name" label="" classification={DataClassification.PUBLIC}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="Jean Dupont" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Email" name="email" classification={DataClassification.PERSONAL}>
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="jean@example.ca" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Postal Code"
                    name="postalCode"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Format: A1A 1A1 — letters are auto-uppercased."
                >
                    <GuardianField name="postalCode" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.POSTAL_CODE} placeholder="A1A 1A1" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <ValidationIndicator />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
};
