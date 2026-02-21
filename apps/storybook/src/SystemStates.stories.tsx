import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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

const meta: Meta<typeof GuardianFormProvider> = {
    title: 'GuardianForm/System States',
    component: GuardianFormProvider,
};

export default meta;
type Story = StoryObj<typeof GuardianFormProvider>;

export const Lockout: Story = {
    render: () => {
        return (
            <SystemOverlay
                type="LOCKOUT"
                title="Account Temporarily Locked"
                message="Multiple failed authentication attempts detected. For your protection, access to this form has been suspended for 30 minutes."
                actionLabel="Contact Security Support"
                onAction={() => alert('Support ticket created.')}
            >
                <GuardianFormProvider
                    initialValues={{ username: 'j.doe@company.com', password: '' }}
                    policies={[NoPlaintextPiiPolicy]}
                    userContext={{ userId: 'demo-user' }}
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
        );
    }
};

export const SessionTimeout: Story = {
    render: () => {
        return (
            <SystemOverlay
                type="TIMEOUT"
                title="Authorization Expired"
                message="Your secure session has timed out due to inactivity. Any unsaved sensitive data has been purged from local memory."
                actionLabel="Resume Session"
                onAction={() => window.location.reload()}
            >
                <GuardianFormProvider
                    initialValues={{ data: 'Sensitive Working Data...' }}
                    userContext={{ userId: 'demo-user' }}
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
        );
    }
};

export const EncryptionFailure: Story = {
    render: () => {
        return (
            <SystemOverlay
                type="ENCRYPTION_FAILURE"
                title="Cryptography Error"
                message="Unable to establish a secure handshake with the Field-Level Encryption provider. Submission is blocked for your protection."
                actionLabel="Check System Status"
                onAction={() => alert('Redirecting to status page...')}
            >
                <GuardianFormProvider
                    initialValues={{ cc: '' }}
                    userContext={{ userId: 'demo-user' }}
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
        );
    }
};

export const PolicyBlockedSubmit: Story = {
    render: () => {
        return (
            <SystemOverlay
                type="SUBMIT_BLOCKED"
                title="Submission Intercepted"
                message="Automatic policy evaluation detected HIGHLY_SENSITIVE data without required encryption headers. Submission has been blocked by the Guardian engine."
                actionLabel="Review Policy Violations"
                onAction={() => { }}
            >
                <GuardianFormProvider
                    initialValues={{ ssn: '666-00-1111' }}
                    userContext={{ userId: 'demo-user' }}
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
        );
    }
};
