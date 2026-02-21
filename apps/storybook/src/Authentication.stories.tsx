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

interface AuthFormArgs {
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    userId: string;
    userRole: 'user' | 'admin' | 'compliance-officer' | 'readonly';
    enableNoPlaintext: boolean;
    enableRequireEncryption: boolean;
    onSubmit: (...args: any[]) => void;
    onAudit: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<AuthFormArgs> = {
    title: 'GuardianForm/Authentication Forms',
    tags: ['autodocs'],
    argTypes: {
        formTitle: {
            control: 'text',
            description: 'Title displayed in the form header',
            table: { category: 'Content' },
        },
        formDescription: {
            control: 'text',
            description: 'Subtitle below the title',
            table: { category: 'Content' },
        },
        submitLabel: {
            control: 'text',
            description: 'Label for the submit button',
            table: { category: 'Content' },
        },
        userId: {
            control: 'text',
            description: 'User ID used for the audit trail',
            table: { category: 'Governance' },
        },
        userRole: {
            control: 'select',
            options: ['user', 'admin', 'compliance-officer', 'readonly'],
            description: 'Role passed to the policy engine context',
            table: { category: 'Governance', defaultValue: { summary: 'user' } },
        },
        enableNoPlaintext: {
            control: 'boolean',
            description: 'Enable NoPlaintextPiiPolicy',
            table: { category: 'Policies' },
        },
        enableRequireEncryption: {
            control: 'boolean',
            description: 'Enable RequireEncryptionPolicy',
            table: { category: 'Policies' },
        },
        onSubmit: { description: 'Fired with form values on successful submission', table: { category: 'Actions' } },
        onAudit: { description: 'Fired on every field change with audit metadata', table: { category: 'Actions' } },
    },
    args: {
        formTitle: 'Secure Portal Login',
        formDescription: 'Standard enterprise login with PII protection on username fields.',
        submitLabel: 'Sign In',
        userId: 'anonymous',
        userRole: 'user',
        enableNoPlaintext: true,
        enableRequireEncryption: false,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<AuthFormArgs>;

// ─── Secure Login ─────────────────────────────────────────────────────────────

export const SecureLogin: Story = {
    name: 'Secure Login',
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ username: '', password: '' }}
            policies={[
                ...(args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []),
                ...(args.enableRequireEncryption ? [RequireEncryptionPolicy] : []),
            ]}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout
                    label="Username"
                    name="username"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Usernames are tracked for audit logging purpose."
                >
                    <GuardianField name="username" label="Username" classification={DataClassification.PERSONAL}>
                        {({ field }) => (
                            <input
                                {...field}
                                id="auth-username"
                                className="gf-input"
                                placeholder="e.g. j.doe@company.com"
                                autoComplete="username"
                            />
                        )}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Password"
                    name="password"
                    classification={DataClassification.HIGHLY_SENSITIVE}
                    complianceNote="Passwords are never stored or logged in plaintext."
                >
                    <GuardianField name="password" label="Password" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                        {({ field }) => (
                            <input
                                {...field}
                                id="auth-password"
                                type="password"
                                className="gf-input"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                        )}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-xs text-slate-600">Remember this device</span>
                    </label>
                    <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        Forgot password?
                    </button>
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const usernameInput = await canvas.findByPlaceholderText('e.g. j.doe@company.com');
        await userEvent.type(usernameInput, 'j.doe@company.com', { delay: 40 });
        const passwordInput = canvas.getByPlaceholderText('••••••••');
        await userEvent.type(passwordInput, 'SecureP@ss1', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /sign in/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── MFA Verification ─────────────────────────────────────────────────────────

export const MFAVerification: Story = {
    name: 'MFA Verification',
    args: {
        formTitle: 'Two-Factor Authentication',
        formDescription: 'Enter the 6-digit verification code sent to your registered device.',
        submitLabel: 'Verify Identity',
        userId: 'user_123',
        enableRequireEncryption: true,
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ code: '' }}
            policies={args.enableRequireEncryption ? [RequireEncryptionPolicy] : []}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <div className="max-w-md mx-auto">
                <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>

                    <GuardianFieldLayout
                        label="Verification Code"
                        name="code"
                        classification={DataClassification.HIGHLY_SENSITIVE}
                    >
                        <GuardianField name="code" label="MFA Code" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                            {({ field }) => (
                                <MaskedInput
                                    {...field}
                                    id="mfa-code"
                                    pattern="9 9 9 9 9 9"
                                    placeholder="0 0 0 0 0 0"
                                    className="text-center text-2xl tracking-[0.5em] font-mono"
                                />
                            )}
                        </GuardianField>
                    </GuardianFieldLayout>

                    <p className="text-center text-xs text-slate-500 mt-6">
                        Didn't receive a code? <button type="button" className="text-indigo-600 font-semibold hover:underline">Resend Code</button>
                    </p>
                </FormLayout>
            </div>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const submitBtn = await canvas.findByRole('button', { name: /verify identity/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── Password Reset ───────────────────────────────────────────────────────────

export const PasswordReset: Story = {
    name: 'Password Reset',
    args: {
        formTitle: 'Reset Password',
        formDescription: 'Enter your email to receive recovery instructions.',
        submitLabel: 'Send Reset Link',
        userId: 'anonymous',
        enableNoPlaintext: false,
        enableRequireEncryption: true
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ email: '' }}
            policies={args.enableNoPlaintext ? [NoPlaintextPiiPolicy] : []}
            userContext={{ userId: args.userId }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                <GuardianFieldLayout
                    label="Email Address"
                    name="email"
                    classification={DataClassification.PERSONAL}
                >
                    <GuardianField name="email" label="Email" classification={DataClassification.PERSONAL}>
                        {({ field }) => (
                            <input
                                {...field}
                                id="reset-email"
                                type="email"
                                className="gf-input"
                                placeholder="name@company.com"
                            />
                        )}
                    </GuardianField>
                </GuardianFieldLayout>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const emailInput = await canvas.findByPlaceholderText('name@company.com');
        await userEvent.type(emailInput, 'jane@company.com', { delay: 40 });
        const submitBtn = await canvas.findByRole('button', { name: /send reset link/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};

// ─── Step-Up Auth ─────────────────────────────────────────────────────────────

export const StepUpAuth: Story = {
    name: 'Step-Up Authentication (Admin)',
    args: {
        formTitle: '',
        formDescription: '',
        submitLabel: 'Authorize Action',
        userId: 'user_123',
        userRole: 'admin',
        enableRequireEncryption: true,
    },
    render: (args) => (
        <GuardianFormProvider
            initialValues={{ pin: '' }}
            policies={args.enableRequireEncryption ? [RequireEncryptionPolicy] : []}
            userContext={{ userId: args.userId, role: args.userRole }}
            onAudit={args.onAudit}
            onSubmit={args.onSubmit}
        >
            <div className="max-w-md mx-auto relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur opacity-20" />
                <div className="relative bg-white rounded-2xl border border-red-100 shadow-xl overflow-hidden">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-red-900 uppercase tracking-tight">Step-Up Authentication</h3>
                            <p className="text-[11px] text-red-700">High-privilege action detected (Role: {args.userRole?.toUpperCase()})</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-slate-600 mb-6">
                            To modify global security policies, please confirm your authorization by entering your security PIN.
                        </p>
                        <FormLayout title={args.formTitle} description={args.formDescription} submitLabel={args.submitLabel}>
                            <GuardianFieldLayout label="Security PIN" name="pin" classification={DataClassification.HIGHLY_SENSITIVE}>
                                <GuardianField name="pin" label="PIN" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                                    {({ field }) => (
                                        <MaskedInput
                                            {...field}
                                            id="stepup-pin"
                                            pattern="9 9 9 9"
                                            placeholder="0 0 0 0"
                                            className="text-center text-xl tracking-[1em]"
                                        />
                                    )}
                                </GuardianField>
                            </GuardianFieldLayout>
                        </FormLayout>
                    </div>
                </div>
            </div>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const authorizeBtn = await canvas.findByRole('button', { name: /authorize action/i });
        await expect(authorizeBtn).toBeInTheDocument();
    },
};
