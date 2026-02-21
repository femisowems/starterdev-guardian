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
import { FormLayout } from './components/FormLayout';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/Dynamic Forms',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const ConditionalFields: Story = {
    render: () => {
        const [hasChildren, setHasChildren] = useState(false);
        return (
            <GuardianFormProvider
                initialValues={{ hasChildren: false, numberOfChildren: '', schoolName: '' }}
                userContext={{ userId: 'demo-user' }}
                onSubmit={(v) => alert(JSON.stringify(v, null, 2))}
            >
                <FormLayout
                    title="Family Benefits Intake"
                    description="Fields dynamically appear based on your selections, with governance policies applying only when active."
                >
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={hasChildren}
                            onChange={(e) => setHasChildren(e.target.checked)}
                        />
                        <div>
                            <span className="text-sm font-bold text-slate-800">I have dependent children</span>
                            <p className="text-[10px] text-slate-500">Enable this to provide dependent information for tax purposes.</p>
                        </div>
                    </label>

                    {hasChildren && (
                        <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <GuardianFieldLayout
                                label="Number of Dependents"
                                name="numberOfChildren"
                                classification={DataClassification.PERSONAL}
                            >
                                <GuardianField name="numberOfChildren" label="Dependents" classification={DataClassification.PERSONAL}>
                                    {({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            className="gf-input"
                                            placeholder="Enter count"
                                        />
                                    )}
                                </GuardianField>
                            </GuardianFieldLayout>

                            <GuardianFieldLayout
                                label="Current School / Institution"
                                name="schoolName"
                                classification={DataClassification.INTERNAL}
                            >
                                <GuardianField name="schoolName" label="School" classification={DataClassification.INTERNAL}>
                                    {({ field }) => (
                                        <input
                                            {...field}
                                            className="gf-input"
                                            placeholder="Full name of institution"
                                        />
                                    )}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    )}
                </FormLayout>
            </GuardianFormProvider>
        );
    }
};

export const RoleBasedSchema: Story = {
    render: () => {
        const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
        return (
            <GuardianFormProvider
                initialValues={{ name: '', bio: '', adminNote: '', systemTag: '' }}
                userContext={{ userId: 'demo', role }}
                onSubmit={() => { }}
            >
                <FormLayout
                    title="Profile Settings"
                    description="Switch roles to see how the form schema and governance dynamically adapt."
                >
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-6 max-w-xs">
                        <button
                            onClick={() => setRole('USER')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'USER' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Regular User
                        </button>
                        <button
                            onClick={() => setRole('ADMIN')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${role === 'ADMIN' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            System Admin
                        </button>
                    </div>

                    <div className="space-y-4">
                        <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PERSONAL}>
                            <GuardianField name="name" label="Name" classification={DataClassification.PERSONAL}>
                                {({ field }) => <input {...field} className="gf-input" />}
                            </GuardianField>
                        </GuardianFieldLayout>

                        {role === 'ADMIN' ? (
                            <div className="space-y-4 pt-4 border-t border-red-100 bg-red-50/30 p-4 rounded-xl">
                                <h4 className="text-[10px] font-bold text-red-900 uppercase tracking-widest border-b border-red-100 pb-2 mb-2">Administrative Control</h4>
                                <GuardianFieldLayout label="Internal Admin Note" name="adminNote" classification={DataClassification.HIGHLY_SENSITIVE}>
                                    <GuardianField name="adminNote" label="Admin Note" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                        {({ field }) => <textarea {...field} className="gf-input min-h-[80px]" />}
                                    </GuardianField>
                                </GuardianFieldLayout>
                                <GuardianFieldLayout label="System Resource Tag" name="systemTag" classification={DataClassification.INTERNAL}>
                                    <GuardianField name="systemTag" label="Tag" classification={DataClassification.INTERNAL}>
                                        {({ field }) => <input {...field} className="gf-input font-mono" placeholder="sys-xxxx-00" />}
                                    </GuardianField>
                                </GuardianFieldLayout>
                            </div>
                        ) : (
                            <GuardianFieldLayout label="Short Bio" name="bio" classification={DataClassification.PUBLIC}>
                                <GuardianField name="bio" label="Bio" classification={DataClassification.PUBLIC}>
                                    {({ field }) => <textarea {...field} className="gf-input min-h-[80px]" />}
                                </GuardianField>
                            </GuardianFieldLayout>
                        )}
                    </div>
                </FormLayout>
            </GuardianFormProvider>
        );
    }
};

export const CountrySwitcher: Story = {
    render: () => {
        const [country, setCountry] = useState('US');
        return (
            <GuardianFormProvider
                initialValues={{ idNumber: '', region: '', address: '' }}
                userContext={{ userId: 'demo-user' }}
                onSubmit={() => { }}
            >
                <FormLayout
                    title="Identity Verification"
                    description="Identity requirements change based on your selected jurisdiction."
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Jurisdiction</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="US">United States (SSN Required)</option>
                                <option value="CA">Canada (SIN Required)</option>
                                <option value="GB">United Kingdom (NINO Required)</option>
                            </select>
                        </div>

                        <GuardianFieldLayout
                            label={country === 'US' ? 'SSN' : country === 'CA' ? 'SIN' : 'National Insurance Number'}
                            name="idNumber"
                            classification={DataClassification.HIGHLY_SENSITIVE}
                        >
                            <GuardianField name="idNumber" label="ID Number" classification={DataClassification.HIGHLY_SENSITIVE} masked encryptionRequired>
                                {({ field }) => (
                                    <MaskedInput
                                        {...field}
                                        pattern={country === 'US' ? Patterns.SSN : country === 'CA' ? Patterns.SIN : 'AA 99 99 99 A'}
                                    />
                                )}
                            </GuardianField>
                        </GuardianFieldLayout>
                    </div>
                </FormLayout>
            </GuardianFormProvider>
        );
    }
};
