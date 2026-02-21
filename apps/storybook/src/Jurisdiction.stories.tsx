import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    DataClassification,
    NoPlaintextPiiPolicy,
    RequireEncryptionPolicy,
    Patterns,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';

// ─── Args Interface ───────────────────────────────────────────────────────────

interface JurisdictionArgs {
    userId: string;
    userRole: 'user' | 'admin' | 'compliance-officer';
    submitLabel: string;
    enableNoPlaintext: boolean;
    enableRequireEncryption: boolean;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<JurisdictionArgs> = {
    title: 'GuardianForm/Jurisdiction Modes',
    tags: ['autodocs'],
    argTypes: {
        userId: { control: 'text', description: 'User ID for the audit trail', table: { category: 'Governance' } },
        userRole: {
            control: 'select',
            options: ['user', 'admin', 'compliance-officer'],
            description: 'Role for the policy engine context',
            table: { category: 'Governance', defaultValue: { summary: 'user' } },
        },
        submitLabel: { control: 'text', description: 'Submit button label', table: { category: 'Content' } },
        enableNoPlaintext: {
            control: 'boolean',
            description: 'Enforce NoPlaintextPiiPolicy',
            table: { category: 'Policies' },
        },
        enableRequireEncryption: {
            control: 'boolean',
            description: 'Enforce RequireEncryptionPolicy',
            table: { category: 'Policies' },
        },
        onSubmit: { description: 'Fired on form submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on field changes with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        userId: 'demo-user',
        userRole: 'user',
        submitLabel: 'Register (EU Jurisdiction)',
        enableNoPlaintext: true,
        enableRequireEncryption: false,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<JurisdictionArgs>;

// ─── GDPR ─────────────────────────────────────────────────────────────────────

export const GDPRComplianceForm: Story = {
    name: 'GDPR EU Registration',
    args: { submitLabel: 'Register (EU Jurisdiction)', enableNoPlaintext: true },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', region: 'EU' }}
            policies={[
                ...(args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []),
                ...(args.enableRequireEncryption ? [RequireEncryptionPolicy] : []),
            ]}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout
                title="GDPR Registration"
                description="Standard EU registration with automated Right to Information and encryption requirements."
                submitLabel={args.submitLabel}
            >
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                        <div className="mt-0.5 text-blue-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-[10px] text-blue-800 leading-tight">
                            <strong>Regulation (EU) 2016/679</strong> requires that we provide you with clear information about how your PERSONAL data is stored. All fields below are encrypted by default.
                        </p>
                    </div>

                    <GuardianFieldLayout label="Citizen Name" name="name" classification={DataClassification.PERSONAL}>
                        <GuardianField name="name" label="Name" classification={DataClassification.PERSONAL}>
                            {({ field }) => <input {...field} id="gdpr-name" className="gf-input" placeholder="Full legal name" />}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <GuardianFieldLayout label="Primary Email" name="email" classification={DataClassification.PERSONAL}>
                        <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL}>
                            {({ field }) => <input {...field} id="gdpr-email" className="gf-input" placeholder="citizen@eu-region.com" />}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input id="gdpr-eea" type="checkbox" required className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-[11px] text-slate-500">I confirm residency within the European Economic Area (EEA).</span>
                        </label>
                    </div>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const nameInput = await canvas.findByPlaceholderText('Full legal name');
        await userEvent.type(nameInput, 'Marie Dupont', { delay: 40 });
        const emailInput = await canvas.findByPlaceholderText('citizen@eu-region.com');
        await userEvent.type(emailInput, 'marie@eu-region.com', { delay: 40 });
        const eeaCheckbox = await canvas.findByRole('checkbox');
        await userEvent.click(eeaCheckbox);
        await expect(eeaCheckbox).toBeChecked();
        const submitBtn = await canvas.findByRole('button', { name: /register/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── HIPAA ────────────────────────────────────────────────────────────────────

export const HIPAAIntake: Story = {
    name: 'HIPAA Medical Intake (ePHI)',
    args: {
        submitLabel: 'Secure Submission',
        enableRequireEncryption: true,
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ patientName: '', dob: '', diagnosis: '' }}
            policies={[
                ...(args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []),
                ...(args.enableRequireEncryption ? [RequireEncryptionPolicy] : []),
            ]}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout
                title="HIPAA Medical Intake"
                description="Electronic Protected Health Information (ePHI) handling for US healthcare providers."
                submitLabel={args.submitLabel}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">PHI SECURE</span>
                            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">HIPAA Layer v4.0 Active</span>
                        </div>
                        <p className="text-[10px] text-emerald-700 leading-relaxed italic">
                            Encryption is enforced at the field level. Data is masked in memory and only unmasked for authorized providers with 'CLINICAL' clearance.
                        </p>
                    </div>

                    <GuardianFieldLayout label="Patient Full Name" name="patientName" classification={DataClassification.PERSONAL}>
                        <GuardianField name="patientName" label="Patient Name" classification={DataClassification.PERSONAL}>
                            {({ field }) => <input {...field} id="hipaa-name" className="gf-input" placeholder="Patient legal name" />}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <GuardianFieldLayout label="Date of Birth (DOB)" name="dob" classification={DataClassification.HIGHLY_SENSITIVE}>
                        <GuardianField name="dob" label="DOB" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                            {({ field }) => <MaskedInput {...field} id="hipaa-dob" pattern="99/99/9999" placeholder="MM/DD/YYYY" />}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <GuardianFieldLayout label="Medical History / Diagnosis Code" name="diagnosis" classification={DataClassification.HIGHLY_SENSITIVE}>
                        <GuardianField name="diagnosis" label="Diagnosis" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                            {({ field }) => <textarea {...field} id="hipaa-diagnosis" className="gf-input min-h-[80px]" placeholder="ICD-10 code or clinical description..." />}
                        </GuardianField>
                    </GuardianFieldLayout>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const nameInput = await canvas.findByPlaceholderText('Patient legal name');
        await userEvent.type(nameInput, 'John Patient', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /secure submission/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── PIPEDA ───────────────────────────────────────────────────────────────────

export const PIPEDAConsent: Story = {
    name: 'PIPEDA Canadian Privacy (SIN)',
    args: {
        submitLabel: 'Complete Verification',
        enableNoPlaintext: true,
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ sin: '', province: 'ON' }}
            policies={[
                ...(args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []),
                ...(args.enableRequireEncryption ? [RequireEncryptionPolicy] : []),
            ]}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout
                title="Canadian Privacy Compliance"
                description="Handling sensitive Social Insurance Numbers (SIN) under PIPEDA guidelines."
                submitLabel={args.submitLabel}
            >
                <div className="space-y-4">
                    <GuardianFieldLayout label="Social Insurance Number (SIN)" name="sin" classification={DataClassification.HIGHLY_SENSITIVE}>
                        <GuardianField name="sin" label="SIN" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                            {({ field }) => <MaskedInput {...field} id="pipeda-sin" pattern={Patterns.SIN} placeholder="000-000-000" />}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Province of Residence</label>
                        <select id="pipeda-province" className="gf-input">
                            <option value="ON">Ontario (ON)</option>
                            <option value="QC">Quebec (QC)</option>
                            <option value="BC">British Columbia (BC)</option>
                            <option value="AB">Alberta (AB)</option>
                        </select>
                    </div>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const provinceSelect = await canvas.findByRole('combobox');
        await userEvent.selectOptions(provinceSelect, 'QC');
        const submitBtn = await canvas.findByRole('button', { name: /complete verification/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};
