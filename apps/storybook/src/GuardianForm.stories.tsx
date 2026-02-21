import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    RiskMeter,
    DataClassification,
    NoPlaintextPiiPolicy,
    RequireEncryptionPolicy,
    MaskHighlySensitivePolicy,
    Patterns
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';
import { ComplianceData } from './components/ComplianceSummaryPanel';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/SecureForm',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

// ─── Compliance data props ────────────────────────────────────────────────────

const secureCompliance: ComplianceData = {
    totalFields: 3,
    piiFields: 3,
    encryptedFields: 3,
    violations: [],
    retentionPolicy: '30 days',
    auditLogging: true,
    riskScore: 42,
};

const highRiskCompliance: ComplianceData = {
    totalFields: 3,
    piiFields: 3,
    encryptedFields: 0,
    violations: [
        { ruleId: 'require-encryption', message: 'Credit Card field (FINANCIAL) is missing encryption requirement.', severity: 'ERROR' },
        { ruleId: 'mask-highly-sensitive', message: 'SSN field is classified HIGHLY_SENSITIVE but masking is disabled.', severity: 'WARN' },
    ],
    retentionPolicy: '365 days',
    auditLogging: true,
    riskScore: 91,
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const BasicSecureForm: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', sin: '' }}
            policies={[NoPlaintextPiiPolicy]}
            userContext={{ userId: 'user-001' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="Secure Identity Form"
                description="Field-level encryption and masking enforced by the Guardian Form policy engine."
                complianceData={secureCompliance}
                submitLabel="Submit Record"
            >
                <GuardianFieldLayout
                    label="Email Address"
                    name="email"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used for system notifications only. Never shared with third parties."
                >
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL} encryptionRequired>
                        {({ field }) => <input {...field} className="gf-input" placeholder="email@example.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SSN (Social Security Number)"
                    name="ssn"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="AES-256 encrypted at rest. Never logged or cached in plaintext."
                >
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SIN (Social Insurance Number)"
                    name="sin"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Required for T4 reporting. Stored in compliance vault."
                >
                    <GuardianField name="sin" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SIN} placeholder="000-000-000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                {/* Inline risk meter below the fields */}
                <div className="pt-2">
                    <RiskMeter />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
};

export const HighRiskForm: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ cc: '', ssn: '', note: '' }}
            policies={[NoPlaintextPiiPolicy, RequireEncryptionPolicy, MaskHighlySensitivePolicy]}
            userContext={{ userId: 'user-002' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="⚠️ High Risk Form"
                description="Demonstrates policy violations: unencrypted financial data and unmasked sensitive fields."
                complianceData={highRiskCompliance}
                submitLabel="Submit (Violations Detected)"
            >
                <GuardianFieldLayout
                    label="Credit Card"
                    name="cc"
                    classification={DataClassification.FINANCIAL}
                    complianceNote="No encryption required — triggers a policy violation."
                >
                    <GuardianField name="cc" label="" classification={DataClassification.FINANCIAL} encryptionRequired={false}>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.CREDIT_CARD} placeholder="0000 0000 0000 0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SSN (Social Security Number)"
                    name="ssn"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Masking disabled — triggers a HIGHLY_SENSITIVE policy warning."
                >
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked={false}>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Internal Notes"
                    name="note"
                    classification={DataClassification.INTERNAL}
                >
                    <GuardianField name="note" label="" classification={DataClassification.INTERNAL}>
                        {({ field }) => (
                            <textarea
                                {...field}
                                className="gf-input min-h-[80px] resize-none"
                                placeholder="Typing here will increase the risk score..."
                            />
                        )}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <RiskMeter />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
};
