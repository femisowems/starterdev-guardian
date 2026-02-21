import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
    Patterns,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';
import { SecureUpload } from './components/SecureUpload';

// ─── Args Interface ───────────────────────────────────────────────────────────

interface DocumentIntakeArgs {
    userId: string;
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<DocumentIntakeArgs> = {
    title: 'GuardianForm/Document Intake',
    tags: ['autodocs'],
    argTypes: {
        userId: { control: 'text', description: 'User ID for audit trail', table: { category: 'Governance' } },
        formTitle: { control: 'text', description: 'Form header title', table: { category: 'Content' } },
        formDescription: { control: 'text', description: 'Subtitle description', table: { category: 'Content' } },
        submitLabel: { control: 'text', description: 'Submit button label', table: { category: 'Content' } },
        onSubmit: { description: 'Fired on form submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on field changes with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        userId: 'demo-user',
        formTitle: 'Identity Verification',
        formDescription: 'Securely upload identification documents for automated verification and compliance checking.',
        submitLabel: 'Submit Documents',
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<DocumentIntakeArgs>;

// ─── Identity Verification ────────────────────────────────────────────────────

export const IdentityVerification: Story = {
    name: 'Identity Document Upload',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ docType: 'PASSPORT', docNumber: '' }}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Document Type</label>
                            <select id="doc-type" className="gf-input">
                                <option value="PASSPORT">Passport (International)</option>
                                <option value="LICENSE">Driver's License</option>
                                <option value="ID">National Identity Card</option>
                            </select>
                        </div>
                        <GuardianFieldLayout label="Document Number" name="docNumber" classification={DataClassification.HIGHLY_SENSITIVE}>
                            <GuardianField name="docNumber" label="Doc Number" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                {({ field }) => <input {...field} id="doc-number" className="gf-input" placeholder="Enter ID number" />}
                            </GuardianField>
                        </GuardianFieldLayout>
                    </div>

                    <SecureUpload label="Upload ID Document (Front)" />

                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <h5 className="text-[11px] font-bold text-indigo-900 uppercase tracking-tight mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 14.535a45.241 45.241 0 0012 8.47 45.241 45.241 0 0012-8.47l-1.382-8.591z" />
                            </svg>
                            Compliance Guarantee
                        </h5>
                        <p className="text-[10px] text-indigo-700 leading-relaxed">
                            Uploaded documents are processed within a Trusted Execution Environment (TEE). Personal data is redacted from system logs automatically using the @starterdev/guardian engine.
                        </p>
                    </div>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const docNumberInput = await canvas.findByPlaceholderText('Enter ID number');
        await userEvent.type(docNumberInput, 'P123456789', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /submit documents/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── Redaction Preview ────────────────────────────────────────────────────────

export const RedactionPreview: Story = {
    name: 'PII Redaction Engine (Live Demo)',
    render: () => {
        const [isRedacting, setIsRedacting] = useState(false);
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">PII Redaction Engine</h3>
                            <p className="text-xs text-slate-500">Live preview of how Guardian handles sensitive document fragments.</p>
                        </div>
                        <button
                            id="toggle-redaction"
                            onClick={() => setIsRedacting(!isRedacting)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isRedacting
                                ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {isRedacting ? 'Stop Redaction' : 'Simulate Redaction'}
                        </button>
                    </div>

                    <div className="relative font-mono text-sm border border-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Document Fragment (X-Ray View)</span>
                            <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                SECURE LAYER ACTIVE
                            </span>
                        </div>
                        <div className="p-6 bg-slate-950 text-slate-300 leading-loose">
                            <p>Subject: Account Update Notification</p>
                            <p>Customer Name: {isRedacting ? <span className="bg-slate-700 text-transparent select-none rounded">REDACTED_PII</span> : 'Jane S. Doe'}</p>
                            <p>Account ID: {isRedacting ? <span className="bg-slate-700 text-transparent select-none rounded">REDACTED_FINANCIAL</span> : '8829-1102-3932'}</p>
                            <p>Mailing Address: {isRedacting ? <span className="bg-slate-700 text-transparent select-none rounded">REDACTED_PII</span> : '123 Privacy Lane, Security Heights, CA'}</p>
                            <br />
                            <p className="text-slate-500 italic text-xs">// Automated governance scan completed at {new Date().toLocaleTimeString()}</p>
                            <p className="text-slate-500 italic text-xs">// Policy ID: PII-MASK-GLOBAL-v1.2</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const simulateBtn = await canvas.findByRole('button', { name: /simulate redaction/i });
        await userEvent.click(simulateBtn);
        // After click, button should say "Stop Redaction"
        const stopBtn = await canvas.findByRole('button', { name: /stop redaction/i });
        await expect(stopBtn).toBeInTheDocument();
    },
};
