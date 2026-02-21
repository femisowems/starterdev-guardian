import React, { useState } from 'react';
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

interface ComplianceArgs {
    userId: string;
    submitLabel: string;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<ComplianceArgs> = {
    title: 'GuardianForm/Consent & Compliance',
    tags: ['autodocs'],
    argTypes: {
        userId: {
            control: 'text',
            description: 'User ID for the audit trail',
            table: { category: 'Governance' },
        },
        submitLabel: {
            control: 'text',
            description: 'Submit button label',
            table: { category: 'Content', defaultValue: { summary: 'Save Preferences' } },
        },
        onSubmit: { description: 'Fired with consent state on submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on field changes with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        userId: 'demo-user',
        submitLabel: 'Save Preferences',
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<ComplianceArgs>;

// ─── Consent Capture ─────────────────────────────────────────────────────────

export const ConsentCapture: Story = {
    name: 'Privacy & Consent Preferences',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ marketing: false, analytics: true, thirdParty: false }}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout
                title="Privacy & Consent Preferences"
                description="Granular control over how your data is processed and shared with partners."
                submitLabel={args.submitLabel}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-800 uppercase mb-4">Processing Purposes</h4>
                        <div className="space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input id="consent-marketing" type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <div>
                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Marketing Communications</span>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">Allows us to send updates about new features and enterprise security reports.</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input id="consent-analytics" type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <div>
                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Essential Analytics (Anonymized)</span>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">Help us improve the Guardian engine by sharing anonymized interaction data.</p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input id="consent-third-party" type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <div>
                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">Third-Party Data Verification</span>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">Allow us to share your classification metadata with certified security audit partners.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="px-2">
                        <p className="text-[11px] text-slate-400">
                            Last updated: {new Date().toLocaleDateString()} • <button type="button" className="underline hover:text-slate-600">History</button>
                        </p>
                    </div>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const marketingCheckbox = await canvas.findByRole('checkbox', { name: /marketing communications/i });
        await userEvent.click(marketingCheckbox);
        await expect(marketingCheckbox).toBeChecked();
        const saveBtn = await canvas.findByRole('button', { name: /save preferences/i });
        await expect(saveBtn).toBeInTheDocument();
    },
};

// ─── DSAR Request ─────────────────────────────────────────────────────────────

export const DSARRequest: Story = {
    name: 'Data Subject Access Request (DSAR)',
    args: { submitLabel: 'Submit Request' },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ requestType: 'ACCESS', reason: '', identityProof: '' }}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout
                title="Data Subject Access Request (DSAR)"
                description="Exercise your rights under GDPR/CCPA to access, port, or delete your personal data."
                submitLabel={args.submitLabel}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Request Type</label>
                        <select id="dsar-type" className="gf-input">
                            <option value="ACCESS">Right to Access (Get a copy of my data)</option>
                            <option value="PORTABILITY">Right to Portability (Machine-readable format)</option>
                            <option value="ERASURE">Right to Erasure (Delete my account and data)</option>
                            <option value="RECTIFICATION">Right to Rectification (Correct my data)</option>
                        </select>
                    </div>

                    <GuardianFieldLayout label="Reason for Request" name="reason" classification={DataClassification.INTERNAL}>
                        <GuardianField name="reason" label="Reason" classification={DataClassification.INTERNAL}>
                            {({ field }) => (
                                <textarea {...field} id="dsar-reason" className="gf-input min-h-[100px]" placeholder="Brief context helps us process your request faster." />
                            )}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 text-[11px] leading-relaxed">
                        <span className="font-bold">Identity Verification Required:</span> You will be asked to upload government-issued ID in the next step to verify your authority over this data.
                    </div>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const reasonField = await canvas.findByPlaceholderText('Brief context helps us process your request faster.');
        await userEvent.type(reasonField, 'I want to review what data is stored about my account.', { delay: 20 });
        const submitBtn = await canvas.findByRole('button', { name: /submit request/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── Data Retention Settings ──────────────────────────────────────────────────

export const DataRetentionSettings: Story = {
    name: 'Data Retention Configuration',
    args: { submitLabel: 'Apply Retention Policy' },
    render: (args) => {
        const [period, setPeriod] = useState(30);
        return (
            <GuardianFormProvider
                initialValues={{ retentionDays: 30, purgeStrategy: 'HARD_DELETE' }}
                userContext={{ userId: args.userId }}
                onAudit={args.onAudit}
                onSubmit={args.onSubmit}
            >
                <FormLayout
                    title="Automated Data Retention"
                    description="Configure how long sensitive form data is persisted before automated cleanup."
                    submitLabel={args.submitLabel}
                >
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">Retention Period</label>
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{period} Days</span>
                            </div>
                            <input
                                id="retention-slider"
                                type="range"
                                min="1"
                                max="365"
                                value={period}
                                onChange={(e) => setPeriod(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                                <span>1 DAY (EPHEMERAL)</span>
                                <span>1 YEAR (LOG COMPLIANT)</span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3">Post-Retention Action</label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input id="purge-hard" type="radio" name="purge" defaultChecked className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                    <span className="text-xs font-medium text-slate-700">Hard Purge (Irreversibly delete all fields)</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input id="purge-anon" type="radio" name="purge" className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                    <span className="text-xs font-medium text-slate-700">Anonymize (Keep metadata, scrub values)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </FormLayout>
            </GuardianFormProvider>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const submitBtn = await canvas.findByRole('button', { name: /apply retention policy/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};
