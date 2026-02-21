import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/Accessibility',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const ScreenReaderVariant: Story = {
    render: () => {
        return (
            <GuardianFormProvider
                initialValues={{ name: '', email: '' }}
                userContext={{ userId: 'demo-user' }}
                onSubmit={() => { }}
            >
                <div role="region" aria-labelledby="form-title">
                    <FormLayout
                        title="Accessible Profile Setup"
                        description="This form uses ARIA labels, semantic structure, and explicit focus management to support assistive technologies."
                    >
                        <div className="space-y-4">
                            <GuardianFieldLayout
                                label="Full Name"
                                name="name"
                                classification={DataClassification.PUBLIC}
                            >
                                <GuardianField name="name" label="Full Name" classification={DataClassification.PUBLIC}>
                                    {({ field }) => (
                                        <input
                                            {...field}
                                            className="gf-input"
                                            aria-required="true"
                                            aria-describedby="name-hint"
                                            placeholder="Enter your legal name"
                                        />
                                    )}
                                </GuardianField>
                                <span id="name-hint" className="sr-only">Please enter your legal name as it appears on your ID.</span>
                            </GuardianFieldLayout>

                            <GuardianFieldLayout
                                label="Work Email"
                                name="email"
                                classification={DataClassification.INTERNAL}
                            >
                                <GuardianField name="email" label="Email" classification={DataClassification.INTERNAL}>
                                    {({ field }) => (
                                        <input
                                            {...field}
                                            type="email"
                                            className="gf-input"
                                            aria-required="true"
                                            placeholder="name@company.com"
                                        />
                                    )}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </div>
                    </FormLayout>
                </div>
            </GuardianFormProvider>
        );
    }
};

export const HighContrast: Story = {
    render: () => {
        return (
            <div className="bg-black p-8 min-h-[500px]">
                <GuardianFormProvider
                    initialValues={{ secretKey: '', accessLevel: 'READ' }}
                    userContext={{ userId: 'demo-user' }}
                    onSubmit={() => { }}
                >
                    <div className="max-w-md mx-auto border-[3px] border-yellow-400 bg-black text-white p-8 rounded-none">
                        <h2 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-yellow-400 pb-4 mb-6 text-yellow-400">
                            System Authorization
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold uppercase mb-2 text-yellow-400">Secret Key</label>
                                <GuardianField name="secretKey" label="Secret" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                    {({ field }) => (
                                        <input
                                            {...field}
                                            className="w-full bg-black border-2 border-white text-white px-4 py-3 font-mono focus:border-yellow-400 focus:outline-none"
                                        />
                                    )}
                                </GuardianField>
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase mb-2 text-yellow-400">Access Level</label>
                                <select className="w-full bg-black border-2 border-white text-white px-4 py-3 focus:border-yellow-400 focus:outline-none appearance-none rounded-none">
                                    <option>READ ONLY</option>
                                    <option>READ / WRITE</option>
                                    <option>SYSTEM ROOT</option>
                                </select>
                            </div>

                            <button className="w-full bg-yellow-400 text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-colors">
                                Authenticate
                            </button>
                        </div>
                    </div>
                </GuardianFormProvider>
            </div>
        );
    }
};
