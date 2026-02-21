import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/Multi-Step Forms',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const RegistrationWizard: Story = {
    render: () => {
        const [step, setStep] = useState(1);
        const [values, setValues] = useState({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phone: '',
            agreement: false
        });

        const next = () => setStep(s => Math.min(s + 1, 3));
        const back = () => setStep(s => Math.max(s - 1, 1));

        return (
            <GuardianFormProvider
                initialValues={values}
                policies={[NoPlaintextPiiPolicy]}
                userContext={{ userId: 'demo-user' }}
                onSubmit={(v) => alert('Registration Complete!')}
            >
                <WizardLayout
                    currentStep={step}
                    totalSteps={3}
                    title={
                        step === 1 ? 'Account Credentials' :
                            step === 2 ? 'Personal Details' :
                                'Finalize Account'
                    }
                    description={
                        step === 1 ? 'Start by setting up your secure identity.' :
                            step === 2 ? 'Tell us a bit about yourself for your profile.' :
                                'Review our terms and complete your setup.'
                    }
                    onNext={step === 3 ? () => alert('Submitted!') : next}
                    onBack={back}
                    isFirstStep={step === 1}
                    isLastStep={step === 3}
                >
                    {step === 1 && (
                        <div className="space-y-4">
                            <GuardianFieldLayout label="Email Address" name="email" classification={DataClassification.PERSONAL}>
                                <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL}>
                                    {({ field }) => <input {...field} className="gf-input" placeholder="you@company.com" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                            <GuardianFieldLayout label="Password" name="password" classification={DataClassification.HIGHLY_SENSITIVE}>
                                <GuardianField name="password" label="Password" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                    {({ field }) => <input {...field} type="password" className="gf-input" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <GuardianFieldLayout label="First Name" name="firstName" classification={DataClassification.PERSONAL}>
                                    <GuardianField name="firstName" label="First Name" classification={DataClassification.PERSONAL}>
                                        {({ field }) => <input {...field} className="gf-input" />}
                                    </GuardianField>
                                </GuardianFieldLayout>
                                <GuardianFieldLayout label="Last Name" name="lastName" classification={DataClassification.PERSONAL}>
                                    <GuardianField name="lastName" label="Last Name" classification={DataClassification.PERSONAL}>
                                        {({ field }) => <input {...field} className="gf-input" />}
                                    </GuardianField>
                                </GuardianFieldLayout>
                            </div>
                            <GuardianFieldLayout label="Phone Number" name="phone" classification={DataClassification.PERSONAL}>
                                <GuardianField name="phone" label="Phone" classification={DataClassification.PERSONAL} masked>
                                    {({ field }) => <MaskedInput {...field} pattern={Patterns.PHONE} />}
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
    }
};

export const LoanApplication: Story = {
    render: () => {
        const [step, setStep] = useState(1);
        return (
            <GuardianFormProvider
                initialValues={{ income: '', existingDebt: '', ssn: '', purpose: '' }}
                policies={[NoPlaintextPiiPolicy]}
                userContext={{ userId: 'demo-user' }}
                onSubmit={() => { }}
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
                                    {({ field }) => <input {...field} type="number" className="gf-input" placeholder="$" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                            <GuardianFieldLayout label="Application Purpose" name="purpose" classification={DataClassification.INTERNAL}>
                                <GuardianField name="purpose" label="Purpose" classification={DataClassification.INTERNAL}>
                                    {({ field }) => <textarea {...field} className="gf-input min-h-[100px]" />}
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
                                    {({ field }) => <MaskedInput {...field} pattern={Patterns.SSN} />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    )}
                </WizardLayout>
            </GuardianFormProvider>
        );
    }
};
