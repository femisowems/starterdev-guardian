import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
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

// ─── Args Interface ───────────────────────────────────────────────────────────

interface AdvancedFormArgs {
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    userId: string;
    userRole: 'user' | 'admin' | 'compliance-officer' | 'readonly';
    requireApproverForSSN: boolean;
    enableMaskHighlySensitive: boolean;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const schema = z.object({
    email: z.string().email('Invalid email format'),
    ssn: z.string().min(9, 'SSN must be at least 9 digits'),
    sin: z.string().min(9, 'SIN must be at least 9 digits'),
    approver: z.string().optional(),
});

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<AdvancedFormArgs> = {
    title: 'GuardianForm/Advanced Forms',
    // No autodocs tag — AdvancedFeatures.mdx provides the Docs page
    argTypes: {
        formTitle: {
            control: 'text',
            description: 'Title displayed at the top of the form',
            table: { category: 'Content' },
        },
        formDescription: {
            control: 'text',
            description: 'Subtitle / description shown beneath the title',
            table: { category: 'Content' },
        },
        submitLabel: {
            control: 'text',
            description: 'Label for the submit button',
            table: { category: 'Content' },
        },
        userId: {
            control: 'text',
            description: 'User ID for audit trail and policy enforcement',
            table: { category: 'Governance' },
        },
        userRole: {
            control: 'select',
            options: ['user', 'admin', 'compliance-officer', 'readonly'],
            description: 'Role passed into the policy engine context',
            table: { category: 'Governance', defaultValue: { summary: 'compliance-officer' } },
        },
        requireApproverForSSN: {
            control: 'boolean',
            description: 'When enabled, DependentFieldPolicy requires an approver to be provided when SSN is filled',
            table: { category: 'Policies' },
        },
        enableMaskHighlySensitive: {
            control: 'boolean',
            description: 'Enable MaskHighlySensitivePolicy — warns if HIGHLY_SENSITIVE fields have masking disabled',
            table: { category: 'Policies' },
        },
        onSubmit: { description: 'Fired with sanitised form values on successful submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on every field change with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        formTitle: 'Enterprise Governance Form',
        formDescription: 'Zod schema validation · Cross-field dependency policy · Identity data handling',
        submitLabel: 'Submit Secure Record',
        userId: 'enterprise-user-001',
        userRole: 'compliance-officer',
        requireApproverForSSN: true,
        enableMaskHighlySensitive: false,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<AdvancedFormArgs>;

// ─── Enterprise Governance ────────────────────────────────────────────────────

export const EnterpriseGovernance: Story = {
    name: 'Enterprise Governance (Zod + Cross-Field)',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ email: '', ssn: '', sin: '', approver: '' }}
            validate={zodAdapter(schema)}
            policies={[
                NoPlaintextPiiPolicy,
                ...(args.requireApproverForSSN ? [DependentFieldPolicy('ssn', (val) => !!val, 'approver', 'An Approver is required when SSN is provided.')] : []),
                ...(args.enableMaskHighlySensitive ? [MaskHighlySensitivePolicy] : []),
            ]}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout
                    label="Work Email"
                    name="email"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used for audit trail notifications and compliance reporting."
                >
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL} encryptionRequired>
                        {({ field }) => <input {...field} id="eg-email" className="gf-input" placeholder="person@company.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SSN (Social Security Number)"
                    name="ssn"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Required for W-9 compliance. Encrypted in transit and at rest."
                >
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} id="eg-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="SIN (Social Insurance Number)"
                    name="sin"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Required for T4 reporting. Stored in compliance vault."
                >
                    <GuardianField name="sin" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} id="eg-sin" pattern={Patterns.SIN} placeholder="000-000-000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Authorized Approver"
                    name="approver"
                    classification={DataClassification.INTERNAL}
                    complianceNote={args.requireApproverForSSN ? 'Required when an SSN is provided — enforced by cross-field policy.' : 'Optional approver for this submission.'}
                >
                    <GuardianField name="approver" label="" classification={DataClassification.INTERNAL}>
                        {({ field }) => <input {...field} id="eg-approver" className="gf-input" placeholder="e.g. jane.smith@corp.com" />}
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
        const emailInput = await canvas.findByPlaceholderText('person@company.com');
        await userEvent.type(emailInput, 'alice@enterprise.com', { delay: 40 });
        const approverInput = await canvas.findByPlaceholderText('e.g. jane.smith@corp.com');
        await userEvent.type(approverInput, 'manager@enterprise.com', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /submit secure record/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── Async Validation ─────────────────────────────────────────────────────────

export const AsyncValidationDemo: Story = {
    name: 'Async Username Check (1.5s debounce)',
    args: {
        formTitle: 'Async Username Check',
        formDescription: 'Simulates a server-side uniqueness check with a 1.5s debounce delay.',
        submitLabel: 'Check Availability',
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ username: '' }}
            validate={async (v): Promise<Record<string, string>> => {
                await new Promise(r => setTimeout(r, 1500));
                if (v.username === 'admin') {
                    return { username: 'Username "admin" is already taken.' };
                }
                return {};
            }}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout
                    label="Global User ID"
                    name="username"
                    classification={DataClassification.PUBLIC}
                    complianceNote='Try typing "admin" to trigger a simulated server-side conflict.'
                >
                    <GuardianField name="username" label="" classification={DataClassification.PUBLIC}>
                        {({ field }) => <input {...field} id="async-username" className="gf-input" placeholder="e.g. jdoe123" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <ValidationIndicator />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const usernameInput = await canvas.findByPlaceholderText('e.g. jdoe123');
        await userEvent.type(usernameInput, 'jdoe123', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /check availability/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};
