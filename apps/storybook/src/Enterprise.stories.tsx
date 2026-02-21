import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    DataClassification,
    Patterns,
    NoPlaintextPiiPolicy,
    RequireEncryptionPolicy,
    MaskHighlySensitivePolicy,
    DataMinimizationPolicy,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';

import { PatternTable, PATTERN_ROWS, PatternRow } from './components/PatternTable';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';

// ─── Args Interface ───────────────────────────────────────────────────────────

interface EnterpriseFormArgs {
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    userId: string;
    userRole: 'user' | 'admin' | 'compliance-officer';
    enableRequireEncryption: boolean;
    enableMaskHighlySensitive: boolean;
    maxPiiFields: number;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<EnterpriseFormArgs> = {
    title: 'GuardianForm/Enterprise Forms',
    tags: ['autodocs'],
    argTypes: {
        formTitle: { control: 'text', description: 'Form header title', table: { category: 'Content' } },
        formDescription: { control: 'text', description: 'Subtitle below the title', table: { category: 'Content' } },
        submitLabel: { control: 'text', description: 'Submit button label', table: { category: 'Content' } },
        userId: { control: 'text', description: 'User ID for audit trail', table: { category: 'Governance' } },
        userRole: {
            control: 'select',
            options: ['user', 'admin', 'compliance-officer'],
            description: 'User role passed to the policy engine',
            table: { category: 'Governance', defaultValue: { summary: 'compliance-officer' } },
        },
        enableRequireEncryption: {
            control: 'boolean',
            description: 'Enforce RequireEncryptionPolicy',
            table: { category: 'Policies' },
        },
        enableMaskHighlySensitive: {
            control: 'boolean',
            description: 'Enforce MaskHighlySensitivePolicy',
            table: { category: 'Policies' },
        },
        maxPiiFields: {
            control: { type: 'range', min: 1, max: 10, step: 1 },
            description: 'DataMinimizationPolicy field limit',
            table: { category: 'Policies', defaultValue: { summary: '3' } },
        },
        onSubmit: { description: 'Fired with form values on submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on field changes with AuditMeta', table: { category: 'Actions' } },
    },
    args: {
        formTitle: 'Secure Employee Record',
        formDescription: 'All fields are governed by the Guardian Form policy engine.',
        submitLabel: 'Submit Record',
        userId: 'admin-001',
        userRole: 'compliance-officer',
        enableRequireEncryption: true,
        enableMaskHighlySensitive: true,
        maxPiiFields: 3,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<EnterpriseFormArgs>;

// ─── Pattern Reference ────────────────────────────────────────────────────────

export const PatternReference: Story = {
    name: 'Input Mask Pattern Reference',
    render: () => (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Input Mask Patterns</h1>
                    <p className="mt-1 text-sm text-slate-500">All available formatting patterns provided by the Guardian Form library.</p>
                </div>
                <PatternTable rows={PATTERN_ROWS} />
                <div className="mt-8">
                    <h2 className="text-base font-semibold text-slate-700 mb-3">Everyday Patterns</h2>
                    <PatternTable
                        rows={PATTERN_ROWS.filter((r: PatternRow) => ['Patterns.PHONE', 'Patterns.ZIP', 'Patterns.POSTAL_CODE', 'Patterns.DOB'].includes(r.pattern))}
                        title="Everyday Patterns"
                        description="Common patterns suitable for registration and contact forms."
                    />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-slate-700 mb-3">Sensitive / Identity Patterns</h2>
                    <PatternTable
                        rows={PATTERN_ROWS.filter((r: PatternRow) => ['Patterns.SSN', 'Patterns.SIN', 'Patterns.CREDIT_CARD'].includes(r.pattern))}
                        title="Sensitive / Identity Patterns"
                        description="High-security patterns for financial and identity data. Always combine with HIGHLY_SENSITIVE classification and encryption."
                    />
                </div>
            </div>
        </div>
    ),
};

// ─── Enterprise Form Demo ─────────────────────────────────────────────────────

export const EnterpriseFormDemo: Story = {
    name: 'Full Enterprise Form',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', ssn: '', phone: '' }}
            policies={[
                NoPlaintextPiiPolicy,
                ...(args.enableRequireEncryption ? [RequireEncryptionPolicy] : []),
                ...(args.enableMaskHighlySensitive ? [MaskHighlySensitivePolicy] : []),
            ]}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.INTERNAL}>
                    <GuardianField name="name" label="" classification={DataClassification.INTERNAL}>
                        {({ field }) => <input {...field} id="ef-name" className="gf-input" placeholder="Jane Smith" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Email" name="email" classification={DataClassification.PERSONAL} complianceNote="Used for system notifications only.">
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} id="ef-email" className="gf-input" placeholder="jane@corp.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Phone Number" name="phone" classification={DataClassification.PERSONAL} complianceNote="Used for 2FA and account recovery.">
                    <GuardianField name="phone" label="" classification={DataClassification.PERSONAL} masked>
                        {({ field }) => <MaskedInput {...field} id="ef-phone" pattern={Patterns.PHONE} placeholder="(000) 000-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Social Security Number" name="ssn" classification={DataClassification.HIGHLY_SENSITIVE} complianceNote="Encrypted at rest. Never logged.">
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} id="ef-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" highlySensitive />}
                    </GuardianField>
                </GuardianFieldLayout>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const nameInput = await canvas.findByPlaceholderText('Jane Smith');
        await userEvent.type(nameInput, 'Jane Smith', { delay: 40 });
        const emailInput = await canvas.findByPlaceholderText('jane@corp.com');
        await userEvent.type(emailInput, 'jane@corp.com', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /submit record/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── High Risk Warning State ──────────────────────────────────────────────────

export const HighRiskWarningState: Story = {
    name: 'High Risk Warning State',
    args: {
        formTitle: '⚠️ High Risk Form',
        formDescription: 'This form demonstrates policy violations and high-risk governance state.',
        submitLabel: 'Submit (Blocked)',
        maxPiiFields: 3,
        enableRequireEncryption: true,
        enableMaskHighlySensitive: true,
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', ssn: '', creditCard: '', salary: '', dob: '' }}
            policies={[
                DataMinimizationPolicy(args.maxPiiFields),
                ...(args.enableRequireEncryption ? [RequireEncryptionPolicy] : []),
                ...(args.enableMaskHighlySensitive ? [MaskHighlySensitivePolicy] : []),
            ]}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PERSONAL}>
                    <GuardianField name="name" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} id="hr-name" className="gf-input" placeholder="Jane Smith" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Email" name="email" classification={DataClassification.PERSONAL}>
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} id="hr-email" className="gf-input" placeholder="jane@corp.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="SSN" name="ssn" classification={DataClassification.HIGHLY_SENSITIVE}>
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} id="hr-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" highlySensitive />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Credit Card" name="creditCard" classification={DataClassification.FINANCIAL}>
                    <GuardianField name="creditCard" label="" classification={DataClassification.FINANCIAL} masked>
                        {({ field }) => <MaskedInput {...field} id="hr-cc" pattern={Patterns.CREDIT_CARD} placeholder="4111 1111 1111 1111" />}
                    </GuardianField>
                </GuardianFieldLayout>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const nameInput = await canvas.findByPlaceholderText('Jane Smith');
        await userEvent.type(nameInput, 'Jane Smith', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /submit \(blocked\)/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};
