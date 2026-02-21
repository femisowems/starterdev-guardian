import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/Jurisdiction Modes',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const GDPRComplianceForm: Story = {
    render: () => {
        return (
            <GuardianFormProvider
                initialValues={{ name: '', email: '', region: 'EU' }}
                policies={[NoPlaintextPiiPolicy]}
                userContext={{ userId: 'demo-user' }}
                onSubmit={() => { }}
            >
                <FormLayout
                    title="GDPR Registration"
                    description="Standard EU registration with automated Right to Information and encryption requirements."
                    submitLabel="Register (EU Jurisdiction)"
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
                                {({ field }) => <input {...field} className="gf-input" />}
                            </GuardianField>
                        </GuardianFieldLayout>

                        <GuardianFieldLayout label="Primary Email" name="email" classification={DataClassification.PERSONAL}>
                            <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL}>
                                {({ field }) => <input {...field} className="gf-input" />}
                            </GuardianField>
                        </GuardianFieldLayout>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" required className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-[11px] text-slate-500">I confirm residency within the European Economic Area (EEA).</span>
                            </label>
                        </div>
                    </div>
                </FormLayout>
            </GuardianFormProvider>
        );
    }
};

export const HIPAAIntake: Story = {
    render: () => {
        return (
            <GuardianFormProvider
                initialValues={{ patientName: '', dob: '', diagnosis: '' }}
                policies={[RequireEncryptionPolicy]}
                userContext={{ userId: 'demo-user' }}
                onSubmit={() => { }}
            >
                <FormLayout
                    title="HIPAA Medical Intake"
                    description="Electronic Protected Health Information (ePHI) handling for US healthcare providers."
                    submitLabel="Secure Submission"
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
                                {({ field }) => <input {...field} className="gf-input" />}
                            </GuardianField>
                        </GuardianFieldLayout>

                        <GuardianFieldLayout label="Date of Birth (DOB)" name="dob" classification={DataClassification.HIGHLY_SENSITIVE}>
                            <GuardianField name="dob" label="DOB" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                {({ field }) => <MaskedInput {...field} pattern="99/99/9999" placeholder="MM/DD/YYYY" />}
                            </GuardianField>
                        </GuardianFieldLayout>

                        <GuardianFieldLayout label="Medical History / Diagnosis Code" name="diagnosis" classification={DataClassification.HIGHLY_SENSITIVE}>
                            <GuardianField name="diagnosis" label="Diagnosis" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                                {({ field }) => <textarea {...field} className="gf-input min-h-[80px]" />}
                            </GuardianField>
                        </GuardianFieldLayout>
                    </div>
                </FormLayout>
            </GuardianFormProvider>
        );
    }
};

export const PIPEDAConsent: Story = {
    render: () => {
        return (
            <GuardianFormProvider
                initialValues={{ sin: '', province: 'ON' }}
                policies={[NoPlaintextPiiPolicy]}
                userContext={{ userId: 'demo-user' }}
                onSubmit={() => { }}
            >
                <FormLayout
                    title="Canadian Privacy Compliance"
                    description="Handling sensitive Social Insurance Numbers (SIN) under PIPEDA guidelines."
                    submitLabel="Complete Verification"
                >
                    <div className="space-y-4">
                        <GuardianFieldLayout label="Social Insurance Number (SIN)" name="sin" classification={DataClassification.HIGHLY_SENSITIVE}>
                            <GuardianField name="sin" label="SIN" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                                {({ field }) => <MaskedInput {...field} pattern={Patterns.SIN} />}
                            </GuardianField>
                        </GuardianFieldLayout>

                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Province of Residence</label>
                            <select className="gf-input">
                                <option value="ON">Ontario (ON)</option>
                                <option value="QC">Quebec (QC)</option>
                                <option value="BC">British Columbia (BC)</option>
                                <option value="AB">Alberta (AB)</option>
                            </select>
                        </div>
                    </div>
                </FormLayout>
            </GuardianFormProvider>
        );
    }
};
