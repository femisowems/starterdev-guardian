import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';

// ─── Args Interface ───────────────────────────────────────────────────────────

interface AccessibilityArgs {
    userId: string;
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<AccessibilityArgs> = {
    title: 'GuardianForm/Accessibility',
    tags: ['autodocs'],
    argTypes: {
        userId: { control: 'text', description: 'User ID for audit trail', table: { category: 'Governance' } },
        formTitle: { control: 'text', description: 'Form title', table: { category: 'Content' } },
        formDescription: { control: 'text', description: 'Form subtitle', table: { category: 'Content' } },
        submitLabel: { control: 'text', description: 'Submit button label', table: { category: 'Content' } },
        onSubmit: { description: 'Fired on form submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on field changes with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        userId: 'demo-user',
        formTitle: 'Accessible Profile Setup',
        formDescription: 'This form uses ARIA labels, semantic structure, and explicit focus management to support assistive technologies.',
        submitLabel: 'Save Profile',
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<AccessibilityArgs>;

// ─── Screen Reader Variant ────────────────────────────────────────────────────

export const ScreenReaderVariant: Story = {
    name: 'ARIA-Compliant Form (Screen Reader)',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '' }}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <div role="region" aria-labelledby="form-title">
                <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                    <div className="space-y-4">
                        <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PUBLIC}>
                            <GuardianField name="name" label="Full Name" classification={DataClassification.PUBLIC}>
                                {({ field }) => (
                                    <input
                                        {...field}
                                        id="a11y-name"
                                        className="gf-input"
                                        aria-required="true"
                                        aria-describedby="name-hint"
                                        placeholder="Enter your legal name"
                                    />
                                )}
                            </GuardianField>
                            <span id="name-hint" className="sr-only">Please enter your legal name as it appears on your ID.</span>
                        </GuardianFieldLayout>

                        <GuardianFieldLayout label="Work Email" name="email" classification={DataClassification.INTERNAL}>
                            <GuardianField name="email" label="Email" classification={DataClassification.INTERNAL}>
                                {({ field }) => (
                                    <input
                                        {...field}
                                        id="a11y-email"
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
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const nameInput = await canvas.findByPlaceholderText('Enter your legal name');
        await userEvent.type(nameInput, 'Jane Doe', { delay: 40 });
        const emailInput = await canvas.findByPlaceholderText('name@company.com');
        await userEvent.type(emailInput, 'jane@company.com', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /save profile/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── High Contrast ────────────────────────────────────────────────────────────

export const HighContrast: Story = {
    name: 'High Contrast Mode (WCAG AA)',
    args: {
        formTitle: 'System Authorization',
        submitLabel: 'Authenticate',
    },
    render: (args) => (
        <div className="bg-black p-8 min-h-[500px]">
            <GuardianFormProvider
                initialValues={{ secretKey: '', accessLevel: 'READ' }}
                userContext={{ userId: args.userId }}
                onAudit={args.onAudit}
                onSubmit={args.onSubmit}
            >
                <div className="max-w-md mx-auto border-[3px] border-yellow-400 bg-black text-white p-8 rounded-none">
                    <h2 className="text-2xl font-black uppercase tracking-tighter border-b-2 border-yellow-400 pb-4 mb-6 text-yellow-400">
                        {args.formTitle}
                    </h2>

                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold uppercase mb-2 text-yellow-400" htmlFor="hc-secret">Secret Key</label>
                            <GuardianField name="secretKey" label="Secret" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                {({ field }) => (
                                    <input
                                        {...field}
                                        id="hc-secret"
                                        className="w-full bg-black border-2 border-white text-white px-4 py-3 font-mono focus:border-yellow-400 focus:outline-none"
                                        placeholder="••••••••••••"
                                    />
                                )}
                            </GuardianField>
                        </div>

                        <div>
                            <label className="block text-sm font-bold uppercase mb-2 text-yellow-400" htmlFor="hc-access">Access Level</label>
                            <select id="hc-access" className="w-full bg-black border-2 border-white text-white px-4 py-3 focus:border-yellow-400 focus:outline-none appearance-none rounded-none">
                                <option>READ ONLY</option>
                                <option>READ / WRITE</option>
                                <option>SYSTEM ROOT</option>
                            </select>
                        </div>

                        <button
                            id="hc-submit"
                            className="w-full bg-yellow-400 text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-colors"
                            type="button"
                            onClick={args.onSubmit}
                        >
                            {args.submitLabel}
                        </button>
                    </div>
                </div>
            </GuardianFormProvider>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const authenticateBtn = await canvas.findByRole('button', { name: /authenticate/i });
        await expect(authenticateBtn).toBeInTheDocument();
        await userEvent.click(authenticateBtn);
    },
};
