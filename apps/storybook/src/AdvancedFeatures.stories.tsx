import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    RiskMeter,
    DataClassification,
    NoPlaintextPiiPolicy,
    MaskHighlySensitivePolicy,
    DependentFieldPolicy,
    Patterns,
    ValidationIndicator,
} from '@starterdev/guardian-form';
import { zodAdapter } from '@starterdev/guardian-form/adapters';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';
import { ComplianceData } from './components/ComplianceSummaryPanel';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/AdvancedFeatures',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
    email: z.string().email('Invalid email format'),
    ssn: z.string().min(9, 'SSN must be at least 9 digits'),
    sin: z.string().min(9, 'SIN must be at least 9 digits'),
    approver: z.string().optional(),
});

// ─── Compliance data ──────────────────────────────────────────────────────────

const enterpriseCompliance: ComplianceData = {
    totalFields: 4,
    piiFields: 3,
    encryptedFields: 3,
    violations: [],
    retentionPolicy: '7 years (regulatory)',
    auditLogging: true,
    riskScore: 55,
};

const asyncCompliance: ComplianceData = {
    totalFields: 1,
    piiFields: 0,
    encryptedFields: 0,
    violations: [],
    retentionPolicy: 'Session only',
    auditLogging: false,
    riskScore: 5,
};

// ─── EnterpriseGovernance ─────────────────────────────────────────────────────

const EnterpriseFormContent = () => (
    <FormLayout
        title="Enterprise Governance Form"
        description="Zod schema validation · Cross-field dependency policy · Identity data handling"
        complianceData={enterpriseCompliance}
        submitLabel="Submit Secure Record"
    >
        <GuardianFieldLayout
            label="Work Email"
            name="email"
            classification={DataClassification.PERSONAL}
            complianceNote="Used for audit trail notifications and compliance reporting."
        >
            <GuardianField name="email" label="" classification={DataClassification.PERSONAL} encryptionRequired>
                {({ field }) => <input {...field} className="gf-input" placeholder="person@company.com" />}
            </GuardianField>
        </GuardianFieldLayout>

        <GuardianFieldLayout
            label="SSN (Social Security Number)"
            name="ssn"
            classification={DataClassification.HIGHLY_SENSITIVE}
            complianceNote="Required for W-9 compliance. Encrypted in transit and at rest."
        >
            <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" />}
            </GuardianField>
        </GuardianFieldLayout>

        <GuardianFieldLayout
            label="SIN (Social Insurance Number)"
            name="sin"
            classification={DataClassification.HIGHLY_SENSITIVE}
            complianceNote="Required for T4 reporting. Stored in compliance vault."
        >
            <GuardianField name="sin" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                {({ field }) => <MaskedInput {...field} pattern={Patterns.SIN} placeholder="000-000-000" />}
            </GuardianField>
        </GuardianFieldLayout>

        <GuardianFieldLayout
            label="Authorized Approver"
            name="approver"
            classification={DataClassification.INTERNAL}
            complianceNote="Required when an SSN is provided — enforced by cross-field policy."
        >
            <GuardianField name="approver" label="" classification={DataClassification.INTERNAL}>
                {({ field }) => <input {...field} className="gf-input" placeholder="e.g. jane.smith@corp.com" />}
            </GuardianField>
        </GuardianFieldLayout>

        <div className="pt-2">
            <RiskMeter />
        </div>
    </FormLayout>
);

export const EnterpriseGovernance: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', sin: '', approver: '' }}
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
            userContext={{ userId: 'enterprise-user-001', role: 'compliance-officer' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <EnterpriseFormContent />
        </GuardianFormProvider>
    ),
};

// ─── AsyncValidationDemo ──────────────────────────────────────────────────────

export const AsyncValidationDemo: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ username: '' }}
            validate={async (v): Promise<Record<string, string>> => {
                await new Promise(r => setTimeout(r, 1500)); // Simulate API call
                if (v.username === 'admin') {
                    return { username: 'Username "admin" is already taken.' };
                }
                return {};
            }}
            userContext={{ userId: 'user-001' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="Async Username Check"
                description="Simulates a server-side uniqueness check with a 1.5s debounce delay."
                complianceData={asyncCompliance}
                submitLabel="Check Availability"
            >
                <GuardianFieldLayout
                    label="Global User ID"
                    name="username"
                    classification={DataClassification.PUBLIC}
                    complianceNote='Try typing "admin" to trigger a simulated server-side conflict.'
                >
                    <GuardianField name="username" label="" classification={DataClassification.PUBLIC}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="e.g. jdoe123" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <ValidationIndicator />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
};
