import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
import { ComplianceSummaryPanel, ComplianceData } from './components/ComplianceSummaryPanel';
import { FormLayout } from './components/FormLayout';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
    title: 'GuardianForm/Enterprise',
};

export default meta;
type Story = StoryObj;

// ─── Mock compliance data ──────────────────────────────────────────────────────

const baseCompliance: ComplianceData = {
    totalFields: 4,
    piiFields: 3,
    encryptedFields: 3,
    violations: [],
    retentionPolicy: '90 days',
    auditLogging: true,
    riskScore: 28,
};

const highRiskCompliance: ComplianceData = {
    totalFields: 6,
    piiFields: 5,
    encryptedFields: 2,
    violations: [
        { ruleId: 'data-minimization', message: 'Collecting 5 PII fields. Consider reducing for data minimization (limit: 3).', severity: 'WARN' },
        { ruleId: 'require-encryption', message: 'Field "creditCard" is classified FINANCIAL but encryption is not required.', severity: 'ERROR' },
    ],
    retentionPolicy: '365 days',
    auditLogging: false,
    riskScore: 82,
};

// ─── Pattern Table reference ───────────────────────────────────────────────────

export const PatternReference: Story = {
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

// ─── GuardianFieldLayout demos ─────────────────────────────────────────────────

export const FieldLayouts: Story = {
    render: () => (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-lg mx-auto space-y-6">
                <h1 className="text-xl font-bold text-slate-900">Field Layouts</h1>

                <GuardianFieldLayout
                    label="Phone Number"
                    name="phone"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used for two-factor authentication and account recovery."
                >
                    <GuardianFormProvider initialValues={{ phone: '' }} userContext={{ userId: 'demo' }} onSubmit={() => { }}>
                        <GuardianField name="phone" label="" classification={DataClassification.PERSONAL} masked>
                            {({ field }) => <MaskedInput {...field} pattern={Patterns.PHONE} placeholder="(000) 000-0000" />}
                        </GuardianField>
                    </GuardianFormProvider>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Social Security Number"
                    name="ssn"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Stored encrypted. Never logged or cached."
                >
                    <GuardianFormProvider initialValues={{ ssn: '' }} userContext={{ userId: 'demo' }} onSubmit={() => { }}>
                        <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                            {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" highlySensitive />}
                        </GuardianField>
                    </GuardianFormProvider>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Email Address"
                    name="email"
                    classification={DataClassification.PERSONAL}
                    error="Please enter a valid email address."
                >
                    <GuardianFormProvider initialValues={{ email: '' }} userContext={{ userId: 'demo' }} onSubmit={() => { }}>
                        <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                            {({ field }) => <input {...field} className="gf-input" placeholder="you@example.com" />}
                        </GuardianField>
                    </GuardianFormProvider>
                </GuardianFieldLayout>
            </div>
        </div>
    ),
};

// ─── Full enterprise form ──────────────────────────────────────────────────────

export const EnterpriseFormDemo: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', ssn: '', phone: '' }}
            policies={[NoPlaintextPiiPolicy, RequireEncryptionPolicy, MaskHighlySensitivePolicy]}
            userContext={{ userId: 'admin-001', role: 'compliance-officer' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="Secure Employee Record"
                description="All fields are governed by the Guardian Form policy engine."
                complianceData={baseCompliance}
                submitLabel="Submit Record"
            >
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.INTERNAL}>
                    <GuardianField name="name" label="" classification={DataClassification.INTERNAL}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="Jane Smith" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Email" name="email" classification={DataClassification.PERSONAL} complianceNote="Used for system notifications only.">
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="jane@corp.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Phone Number" name="phone" classification={DataClassification.PERSONAL} complianceNote="Used for 2FA and account recovery.">
                    <GuardianField name="phone" label="" classification={DataClassification.PERSONAL} masked>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.PHONE} placeholder="(000) 000-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Social Security Number" name="ssn" classification={DataClassification.HIGHLY_SENSITIVE} complianceNote="Encrypted at rest. Never logged.">
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" highlySensitive />}
                    </GuardianField>
                </GuardianFieldLayout>
            </FormLayout>
        </GuardianFormProvider>
    ),
};

// ─── High risk warning state ─────────────────────────────────────────────────

export const HighRiskWarningState: Story = {
    render: () => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', ssn: '', creditCard: '', salary: '', dob: '' }}
            policies={[DataMinimizationPolicy(3), RequireEncryptionPolicy, MaskHighlySensitivePolicy]}
            userContext={{ userId: 'admin-001' }}
            onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
        >
            <FormLayout
                title="⚠️ High Risk Form"
                description="This form demonstrates policy violations and high-risk governance state."
                complianceData={highRiskCompliance}
                submitLabel="Submit (Blocked)"
            >
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PERSONAL}>
                    <GuardianField name="name" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="Jane Smith" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Email" name="email" classification={DataClassification.PERSONAL}>
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} className="gf-input" placeholder="jane@corp.com" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="SSN" name="ssn" classification={DataClassification.HIGHLY_SENSITIVE}>
                    <GuardianField name="ssn" label="" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} placeholder="000-00-0000" highlySensitive />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Credit Card" name="creditCard" classification={DataClassification.FINANCIAL}>
                    <GuardianField name="creditCard" label="" classification={DataClassification.FINANCIAL} masked>
                        {({ field }) => <MaskedInput {...field} pattern={Patterns.CREDIT_CARD} placeholder="4111 1111 1111 1111" />}
                    </GuardianField>
                </GuardianFieldLayout>
            </FormLayout>
        </GuardianFormProvider>
    ),
};
