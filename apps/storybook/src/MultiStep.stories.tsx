import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    MaskedInput,
    DataClassification,
    NoPlaintextPiiPolicy,
    Patterns,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { WizardLayout } from './components/WizardLayout';

// ─── Args Interface ───────────────────────────────────────────────────────────

interface MultiStepArgs {
    userId: string;
    enableNoPlaintext: boolean;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<MultiStepArgs> = {
    title: 'GuardianForm/Multi-Step Forms',
    tags: ['autodocs'],
    argTypes: {
        userId: {
            control: 'text',
            description: 'User ID for the audit trail',
            table: { category: 'Governance' },
        },
        enableNoPlaintext: {
            control: 'boolean',
            description: 'Enforce NoPlaintextPiiPolicy across all steps',
            table: { category: 'Policies' },
        },
        onSubmit: { description: 'Fired on wizard completion', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on every field change with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        userId: 'demo-user',
        enableNoPlaintext: true,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<MultiStepArgs>;

// ─── Registration Wizard ──────────────────────────────────────────────────────

export const RegistrationWizard: Story = {
    name: 'Registration Wizard (3 Steps)',
    render: (args) => {
        const [step, setStep] = useState(1);
        const next = () => setStep(s => Math.min(s + 1, 3));
        const back = () => setStep(s => Math.max(s - 1, 1));

        return (
            <GuardianFormProvider
                initialValues={{ email: '', password: '', firstName: '', lastName: '', phone: '', agreement: false }}
                policies={args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []}
                userContext={{ userId: args.userId }}
                onAudit={args.onAudit}
                onSubmit={args.onSubmit}
            >
                <WizardLayout
                    currentStep={step}
                    totalSteps={3}
                    title={step === 1 ? 'Account Credentials' : step === 2 ? 'Personal Details' : 'Finalize Account'}
                    description={
                        step === 1 ? 'Start by setting up your secure identity.' :
                            step === 2 ? 'Tell us a bit about yourself for your profile.' :
                                'Review our terms and complete your setup.'
                    }
                    onNext={step === 3 ? args.onSubmit : next}
                    onBack={back}
                    isFirstStep={step === 1}
                    isLastStep={step === 3}
                >
                    {step === 1 && (
                        <div className="space-y-4">
                            <GuardianFieldLayout label="Email Address" name="email" classification={DataClassification.PERSONAL}>
                                <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL}>
                                    {({ field }) => <input {...field} id="rw-email" className="gf-input" placeholder="you@company.com" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                            <GuardianFieldLayout label="Password" name="password" classification={DataClassification.HIGHLY_SENSITIVE}>
                                <GuardianField name="password" label="Password" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                    {({ field }) => <input {...field} id="rw-password" type="password" className="gf-input" placeholder="Min. 8 characters" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <GuardianFieldLayout label="First Name" name="firstName" classification={DataClassification.PERSONAL}>
                                    <GuardianField name="firstName" label="First Name" classification={DataClassification.PERSONAL}>
                                        {({ field }) => <input {...field} id="rw-firstname" className="gf-input" placeholder="Jane" />}
                                    </GuardianField>
                                </GuardianFieldLayout>
                                <GuardianFieldLayout label="Last Name" name="lastName" classification={DataClassification.PERSONAL}>
                                    <GuardianField name="lastName" label="Last Name" classification={DataClassification.PERSONAL}>
                                        {({ field }) => <input {...field} id="rw-lastname" className="gf-input" placeholder="Doe" />}
                                    </GuardianField>
                                </GuardianFieldLayout>
                            </div>
                            <GuardianFieldLayout label="Phone Number" name="phone" classification={DataClassification.PERSONAL}>
                                <GuardianField name="phone" label="Phone" classification={DataClassification.PERSONAL} masked>
                                    {({ field }) => <MaskedInput {...field} id="rw-phone" pattern={Patterns.PHONE} placeholder="(000) 000-0000" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Review Security Posture</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Classification Level:</span>
                                        <span className="font-semibold text-blue-600">PERSONAL/INTERNAL MIX</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Encryption Required:</span>
                                        <span className="font-semibold text-emerald-600">YES (Field-Level)</span>
                                    </div>
                                </div>
                            </div>
                            <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <input type="checkbox" className="mt-1 rounded border-slate-300 text-indigo-600" />
                                <span className="text-xs text-slate-600 leading-relaxed">
                                    I agree to the <button type="button" className="text-indigo-600 font-bold">Data Processing Agreement</button> and confirm that my information will be stored in compliance with local regulations.
                                </span>
                            </label>
                        </div>
                    )}
                </WizardLayout>
            </GuardianFormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const emailInput = await canvas.findByPlaceholderText('you@company.com');
        await userEvent.type(emailInput, 'jane@company.com', { delay: 40 });
        const nextBtn = await canvas.findByRole('button', { name: /continue/i });
        await expect(nextBtn).toBeInTheDocument();
    },
};

// ─── Loan Application ─────────────────────────────────────────────────────────

export const LoanApplication: Story = {
    name: 'Loan Application (Finance + Security)',
    render: (args) => {
        const [step, setStep] = useState(1);
        return (
            <GuardianFormProvider
                initialValues={{ income: '', existingDebt: '', ssn: '', purpose: '' }}
                policies={args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []}
                userContext={{ userId: args.userId }}
                onAudit={args.onAudit}
                onSubmit={args.onSubmit}
            >
                <WizardLayout
                    currentStep={step}
                    totalSteps={2}
                    title={step === 1 ? 'Finance Verification' : 'Security Clearance'}
                    onNext={() => setStep(s => Math.min(s + 1, 2))}
                    onBack={() => setStep(s => Math.max(s - 1, 1))}
                    isFirstStep={step === 1}
                    isLastStep={step === 2}
                >
                    {step === 1 ? (
                        <div className="space-y-4">
                            <GuardianFieldLayout label="Annual Income" name="income" classification={DataClassification.FINANCIAL}>
                                <GuardianField name="income" label="Income" classification={DataClassification.FINANCIAL}>
                                    {({ field }) => <input {...field} id="la-income" type="number" className="gf-input" placeholder="$ Annual income" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                            <GuardianFieldLayout label="Application Purpose" name="purpose" classification={DataClassification.INTERNAL}>
                                <GuardianField name="purpose" label="Purpose" classification={DataClassification.INTERNAL}>
                                    {({ field }) => <textarea {...field} id="la-purpose" className="gf-input min-h-[100px]" placeholder="Why are you applying..." />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-800 leading-relaxed">
                                <h5 className="font-bold mb-1">Financial Data Protection</h5>
                                This step requires HIGHLY_SENSITIVE data. Your SSN will be encrypted immediately and never kept in memory plaintext after submission.
                            </div>
                            <GuardianFieldLayout label="Social Security Number (SSN)" name="ssn" classification={DataClassification.HIGHLY_SENSITIVE}>
                                <GuardianField name="ssn" label="SSN" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                                    {({ field }) => <MaskedInput {...field} id="la-ssn" pattern={Patterns.SSN} placeholder="000-00-0000" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    )}
                </WizardLayout>
            </GuardianFormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const incomeInput = await canvas.findByPlaceholderText('$ Annual income');
        await userEvent.type(incomeInput, '85000', { delay: 40 });
        const continueBtn = await canvas.findByRole('button', { name: /continue/i });
        await expect(continueBtn).toBeInTheDocument();
    },
};
