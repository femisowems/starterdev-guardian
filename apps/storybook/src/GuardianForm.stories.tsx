import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
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

// ─── Story Args Interface ─────────────────────────────────────────────────────

interface SecureFormArgs {
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    userId: string;
    userRole: string;
    enableNoPlaintext: boolean;
    enableRequireEncryption: boolean;
    enableMaskHighlySensitive: boolean;
    onSubmit: (values: Record<string, string>) => void;
    onAudit: (meta: Record<string, unknown>) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<SecureFormArgs> = {
    title: 'GuardianForm/Secure Forms',
    component: GuardianFormProvider as any,
    argTypes: {
        formTitle: {
            control: 'text',
            description: 'Title displayed at the top of the form',
            table: { category: 'Content', defaultValue: { summary: 'Secure Identity Form' } },
        },
        formDescription: {
            control: 'text',
            description: 'Subtitle / description shown beneath the title',
            table: { category: 'Content' },
        },
        submitLabel: {
            control: 'text',
            description: 'Label for the submit button',
            table: { category: 'Content', defaultValue: { summary: 'Submit Record' } },
        },
        userId: {
            control: 'text',
            description: 'User ID for audit trail and policy enforcement',
            table: { category: 'Governance' },
        },
        userRole: {
            control: 'select',
            options: ['user', 'admin', 'compliance-officer', 'readonly'],
            description: 'User role passed into policy engine context',
            table: { category: 'Governance', defaultValue: { summary: 'user' } },
        },
        enableNoPlaintext: {
            control: 'boolean',
            description: 'Enforce NoPlaintextPiiPolicy — blocks plaintext submission of PERSONAL fields',
            table: { category: 'Policies' },
        },
        enableRequireEncryption: {
            control: 'boolean',
            description: 'Enforce RequireEncryptionPolicy — requires FINANCIAL and HIGHLY_SENSITIVE fields to declare encryptionRequired',
            table: { category: 'Policies' },
        },
        enableMaskHighlySensitive: {
            control: 'boolean',
            description: 'Enforce MaskHighlySensitivePolicy — warns if HIGHLY_SENSITIVE fields have masking disabled',
            table: { category: 'Policies' },
        },
        onSubmit: {
            description: 'Fired with sanitised form values on a successful, policy-compliant submission',
            table: { category: 'Actions' },
        },
        onAudit: {
            description: 'Fired on every field change and form submission with the Guardian AuditMeta trail object',
            table: { category: 'Actions' },
        },
    },
    args: {
        formTitle: 'Secure Identity Form',
        formDescription: 'Field-level encryption and masking enforced by the Guardian Form policy engine.',
        submitLabel: 'Submit Record',
        userId: 'user-001',
        userRole: 'user',
        enableNoPlaintext: true,
        enableRequireEncryption: false,
        enableMaskHighlySensitive: false,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<SecureFormArgs>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPolicies(args: SecureFormArgs) {
    const policies = [];
    if (args.enableNoPlaintext) policies.push(NoPlaintextPiiPolicy);
    if (args.enableRequireEncryption) policies.push(RequireEncryptionPolicy);
    if (args.enableMaskHighlySensitive) policies.push(MaskHighlySensitivePolicy);
    return policies;
}

// ─── Basic Secure Form ────────────────────────────────────────────────────────

export const BasicSecureForm: Story = {
    name: 'Basic Secure Form',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', sin: '' }}
            policies={buildPolicies(args)}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit as any}
            onSubmit={args.onSubmit as any}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout
                    label="Email Address"
                    name="email"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used for system notifications only. Never shared with third parties."
                >
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL} encryptionRequired>
                        {({ field }) => <input {...field} id="secure-field-email" className="gf-input" placeholder="email@example.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SSN (Social Security Number)"
                    name="ssn"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="AES-256 encrypted at rest. Never logged or cached in plaintext."
                >
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                        {({ field }) => <MaskedInput {...field} id="secure-field-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SIN (Social Insurance Number)"
                    name="sin"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Required for T4 reporting. Stored in compliance vault."
                >
                    <GuardianField name="sin" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                        {({ field }) => <MaskedInput {...field} id="secure-field-sin" pattern={Patterns.SIN} placeholder="000-000-000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <RiskMeter />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Type an email into the first field
        const emailInput = await canvas.findByPlaceholderText('email@example.com');
        await userEvent.type(emailInput, 'test@company.com', { delay: 40 });

        // Verify submit button exists
        const submitBtn = await canvas.findByRole('button', { name: /submit record/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── High Risk Form ───────────────────────────────────────────────────────────

export const HighRiskForm: Story = {
    name: 'High Risk Form (Policy Violations)',
    args: {
        formTitle: '⚠️ High Risk Form',
        formDescription: 'Demonstrates policy violations: unencrypted financial data and unmasked sensitive fields.',
        submitLabel: 'Submit (Violations Detected)',
        userId: 'user-002',
        userRole: 'user',
        enableNoPlaintext: true,
        enableRequireEncryption: true,
        enableMaskHighlySensitive: true,
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ cc: '', ssn: '', note: '' }}
            policies={buildPolicies(args)}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit as any}
            onSubmit={args.onSubmit as any}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout
                    label="Credit Card"
                    name="cc"
                    classification={DataClassification.FINANCIAL}
                    complianceNote="No encryption required — triggers a policy violation."
                >
                    <GuardianField name="cc" label="Credit Card" classification={DataClassification.FINANCIAL} encryptionRequired={false}>
                        {({ field }) => <MaskedInput {...field} id="high-risk-cc" pattern={Patterns.CREDIT_CARD} placeholder="0000 0000 0000 0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SSN (Social Security Number)"
                    name="ssn"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Masking disabled — triggers a HIGHLY_SENSITIVE policy warning."
                >
                    <GuardianField name="ssn" label="SSN" classification={DataClassification.HIGHLY_SENSITIVE} masked={false}>
                        {({ field }) => <MaskedInput {...field} id="high-risk-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" />}
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
                                id="high-risk-notes"
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
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Type in the notes field to drive risk score up
        const notesInput = await canvas.findByPlaceholderText('Typing here will increase the risk score...');
        await userEvent.type(notesInput, 'Accessing sensitive records for Q4 audit review.', { delay: 20 });

        // Confirm the submit button text reflects the high-risk state
        const submitBtn = await canvas.findByRole('button', { name: /violations detected/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};
