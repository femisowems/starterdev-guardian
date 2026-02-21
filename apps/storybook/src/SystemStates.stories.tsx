import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
    NoPlaintextPiiPolicy,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';
import { SystemOverlay } from './components/SystemOverlay';
import type { SystemStateType } from './components/SystemOverlay';

// ─── Args Interface ───────────────────────────────────────────────────────────

interface SystemStatesArgs {
    overlayTitle: string;
    overlayMessage: string;
    actionLabel: string;
    userId: string;
    onAction: (...args: any[]) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<SystemStatesArgs> = {
    title: 'GuardianForm/System States',
    tags: ['autodocs'],
    argTypes: {
        overlayTitle: {
            control: 'text',
            description: 'Title text shown on the system overlay',
            table: { category: 'Content' },
        },
        overlayMessage: {
            control: 'text',
            description: 'Body message shown below the overlay title',
            table: { category: 'Content' },
        },
        actionLabel: {
            control: 'text',
            description: 'Label for the primary action button on the overlay',
            table: { category: 'Content' },
        },
        userId: {
            control: 'text',
            description: 'User ID passed to the underlying form',
            table: { category: 'Governance' },
        },
        onAction: {
            description: 'Fired when the overlay action button is clicked',
            table: { category: 'Actions' },
        },
    },
    args: {
        overlayTitle: 'Account Temporarily Locked',
        overlayMessage: 'Multiple failed authentication attempts detected. For your protection, access to this form has been suspended for 30 minutes.',
        actionLabel: 'Contact Security Support',
        userId: 'demo-user',
        onAction: fn(),
    },
};

export default meta;
type Story = StoryObj<SystemStatesArgs>;

// ─── Lockout ──────────────────────────────────────────────────────────────────

export const Lockout: Story = {
    name: 'Account Lockout',
    render: (args) => (
        <SystemOverlay
            type="LOCKOUT"
            title={args.overlayTitle}
            message={args.overlayMessage}
            actionLabel={args.actionLabel}
            onAction={args.onAction}
        >
            <GuardianFormProvider
                initialValues={{ username: 'j.doe@company.com', password: '' }}
                policies={[NoPlaintextPiiPolicy]}
                userContext={{ userId: args.userId }}
                onSubmit={() => { }}
            >
                <FormLayout title="Secure Login" description="" submitLabel="Sign In">
                    <GuardianFieldLayout label="Username" name="username" classification={DataClassification.PERSONAL}>
                        <GuardianField name="username" label="User" classification={DataClassification.PERSONAL}>
                            {({ field }) => <input {...field} disabled className="gf-input opacity-50" />}
                        </GuardianField>
                    </GuardianFieldLayout>
                    <GuardianFieldLayout label="Password" name="password" classification={DataClassification.HIGHLY_SENSITIVE}>
                        <GuardianField name="password" label="Pass" classification={DataClassification.HIGHLY_SENSITIVE} masked>
                            {({ field }) => <input {...field} disabled type="password" className="gf-input opacity-50" />}
                        </GuardianField>
                    </GuardianFieldLayout>
                </FormLayout>
            </GuardianFormProvider>
        </SystemOverlay>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const actionBtn = await canvas.findByRole('button', { name: /contact security support/i });
        await expect(actionBtn).toBeInTheDocument();
    },
};

// ─── Session Timeout ──────────────────────────────────────────────────────────

export const SessionTimeout: Story = {
    name: 'Session Timeout',
    args: {
        overlayTitle: 'Authorization Expired',
        overlayMessage: 'Your secure session has timed out due to inactivity. Any unsaved sensitive data has been purged from local memory.',
        actionLabel: 'Resume Session',
    },
    render: (args) => (
        <SystemOverlay
            type="TIMEOUT"
            title={args.overlayTitle}
            message={args.overlayMessage}
            actionLabel={args.actionLabel}
            onAction={args.onAction}
        >
            <GuardianFormProvider
                initialValues={{ data: 'Sensitive Working Data...' }}
                userContext={{ userId: args.userId }}
                onSubmit={() => { }}
            >
                <FormLayout title="Active Workspace" description="" submitLabel="Submit">
                    <GuardianFieldLayout label="Secure Notes" name="data" classification={DataClassification.INTERNAL}>
                        <GuardianField name="data" label="Notes" classification={DataClassification.INTERNAL}>
                            {({ field }) => <textarea {...field} disabled className="gf-input min-h-[200px] opacity-50" />}
                        </GuardianField>
                    </GuardianFieldLayout>
                </FormLayout>
            </GuardianFormProvider>
        </SystemOverlay>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const resumeBtn = await canvas.findByRole('button', { name: /resume session/i });
        await expect(resumeBtn).toBeInTheDocument();
        await userEvent.click(resumeBtn);
    },
};

// ─── Encryption Failure ───────────────────────────────────────────────────────

export const EncryptionFailure: Story = {
    name: 'Encryption Failure',
    args: {
        overlayTitle: 'Cryptography Error',
        overlayMessage: 'Unable to establish a secure handshake with the Field-Level Encryption provider. Submission is blocked for your protection.',
        actionLabel: 'Check System Status',
    },
    render: (args) => (
        <SystemOverlay
            type="ENCRYPTION_FAILURE"
            title={args.overlayTitle}
            message={args.overlayMessage}
            actionLabel={args.actionLabel}
            onAction={args.onAction}
        >
            <GuardianFormProvider
                initialValues={{ cc: '' }}
                userContext={{ userId: args.userId }}
                onSubmit={() => { }}
            >
                <FormLayout title="Payment Information" description="" submitLabel="Submit">
                    <GuardianFieldLayout label="Credit Card Number" name="cc" classification={DataClassification.FINANCIAL}>
                        <GuardianField name="cc" label="CC" classification={DataClassification.FINANCIAL} encryptionRequired>
                            {({ field }) => <input {...field} disabled className="gf-input opacity-50" placeholder="Handshake failed..." />}
                        </GuardianField>
                    </GuardianFieldLayout>
                </FormLayout>
            </GuardianFormProvider>
        </SystemOverlay>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const actionBtn = await canvas.findByRole('button', { name: /check system status/i });
        await expect(actionBtn).toBeInTheDocument();
    },
};

// ─── Policy Blocked Submit ────────────────────────────────────────────────────

export const PolicyBlockedSubmit: Story = {
    name: 'Policy Blocked Submit',
    args: {
        overlayTitle: 'Submission Intercepted',
        overlayMessage: 'Automatic policy evaluation detected HIGHLY_SENSITIVE data without required encryption headers. Submission has been blocked by the Guardian engine.',
        actionLabel: 'Review Policy Violations',
    },
    render: (args) => (
        <SystemOverlay
            type="SUBMIT_BLOCKED"
            title={args.overlayTitle}
            message={args.overlayMessage}
            actionLabel={args.actionLabel}
            onAction={args.onAction}
        >
            <GuardianFormProvider
                initialValues={{ ssn: '666-00-1111' }}
                userContext={{ userId: args.userId }}
                onSubmit={() => { }}
            >
                <FormLayout title="Tax Declaration" description="" submitLabel="Submit">
                    <GuardianFieldLayout label="Tax ID / SSN" name="ssn" classification={DataClassification.HIGHLY_SENSITIVE}>
                        <GuardianField name="ssn" label="ID" classification={DataClassification.HIGHLY_SENSITIVE}>
                            {({ field }) => <input {...field} disabled className="gf-input opacity-50 border-red-300" />}
                        </GuardianField>
                    </GuardianFieldLayout>
                </FormLayout>
            </GuardianFormProvider>
        </SystemOverlay>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const reviewBtn = await canvas.findByRole('button', { name: /review policy violations/i });
        await expect(reviewBtn).toBeInTheDocument();
        await userEvent.click(reviewBtn);
    },
};
