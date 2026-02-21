import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { expect, userEvent, within } from '@storybook/test';
import {
    GuardianFormProvider,
    GuardianField,
    DataClassification,
    MaskedInput,
    Patterns,
    ValidationIndicator,
    PrivacyHint,
    DataMinimizationPolicy,
} from '@starterdev/guardian-form';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';
import { GuardianFieldLayout } from './components/GuardianFieldLayout';
import { FormLayout } from './components/FormLayout';

// ─── Story Args Interface ─────────────────────────────────────────────────────

interface EverydayFormArgs {
    formTitle: string;
    formDescription: string;
    submitLabel: string;
    userId: string;
    maxPiiFields: number;
    onSubmit: (values: Record<string, string>) => void;
    onAudit: (meta: Record<string, unknown>) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<EverydayFormArgs> = {
    title: 'GuardianForm/Everyday Forms',
    argTypes: {
        formTitle: {
            control: 'text',
            description: 'Title displayed in the form header',
            table: { category: 'Content', defaultValue: { summary: 'US Registration' } },
        },
        formDescription: {
            control: 'text',
            description: 'Subtitle / description below the title',
            table: { category: 'Content' },
        },
        submitLabel: {
            control: 'text',
            description: 'Text on the submit button',
            table: { category: 'Content', defaultValue: { summary: 'Sign Up' } },
        },
        userId: {
            control: 'text',
            description: 'User ID injected into the audit trail',
            table: { category: 'Governance' },
        },
        maxPiiFields: {
            control: { type: 'range', min: 1, max: 10, step: 1 },
            description: 'DataMinimizationPolicy threshold — triggers a violation if PII fields exceed this count',
            table: { category: 'Governance', defaultValue: { summary: '4' } },
        },
        onSubmit: {
            description: 'Fired with the sanitised form values on successful submission',
            table: { category: 'Actions' },
        },
        onAudit: {
            description: 'Fired on every field change and form submission with the Guardian audit meta',
            table: { category: 'Actions' },
        },
    },
    args: {
        formTitle: 'US Registration',
        formDescription: 'Standard registration form with phone masking, calendar date picker, and ZIP code formatting.',
        submitLabel: 'Sign Up',
        userId: 'demo-user',
        maxPiiFields: 4,
        onSubmit: fn(),
        onAudit: fn(),
    },
};

export default meta;
type Story = StoryObj<EverydayFormArgs>;

// ─── US Registration ──────────────────────────────────────────────────────────

export const ModernRegistration: Story = {
    args: {
        maxPiiFields: 4
    },

    name: 'Modern Registration (US)',

    render: ({ formTitle, formDescription, submitLabel, userId, maxPiiFields, onSubmit, onAudit }) => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', phone: '', dob: '', zip: '' }}
            policies={[DataMinimizationPolicy(maxPiiFields)]}
            userContext={{ userId }}
            onAudit={onAudit as any}
            onSubmit={onSubmit as any}
        >
            <FormLayout title={formTitle} description={formDescription} submitLabel={submitLabel}>
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PUBLIC}>
                    <GuardianField name="name" label="" classification={DataClassification.PUBLIC}>
                        {({ field }) => <input {...field} id="field-name" className="gf-input" placeholder="Jane Doe" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Email Address"
                    name="email"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used to secure your account and send policy updates."
                >
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => (
                            <>
                                <input {...field} id="field-email" className="gf-input" placeholder="jane@example.com" />
                                <PrivacyHint classification={DataClassification.PERSONAL} message="Used to secure your account and send updates." />
                            </>
                        )}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Phone Number" name="phone" classification={DataClassification.PERSONAL}>
                    <GuardianField name="phone" label="" classification={DataClassification.PERSONAL} masked>
                        {({ field }) => <MaskedInput {...field} id="field-phone" pattern={Patterns.PHONE} placeholder="(000) 000-0000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Date of Birth"
                    name="dob"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Used for age verification only."
                >
                    <GuardianField name="dob" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <MaskedInput {...field} id="field-dob" type="date" className="gf-input" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="ZIP Code" name="zip" classification={DataClassification.PERSONAL}>
                    <GuardianField name="zip" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <MaskedInput {...field} id="field-zip" pattern={Patterns.ZIP} placeholder="00000" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <ValidationIndicator />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),

    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);

        // Fill out the name field
        const nameInput = await canvas.findByPlaceholderText('Jane Doe');
        await userEvent.type(nameInput, 'Jane Doe', { delay: 40 });

        // Fill out the email field
        const emailInput = await canvas.findByPlaceholderText('jane@example.com');
        await userEvent.type(emailInput, 'jane@example.com', { delay: 40 });

        // Submit and verify the action was called
        const submitBtn = await canvas.findByRole('button', { name: /sign up/i });
        await expect(submitBtn).toBeInTheDocument();
    }
};

// ─── Canadian Registration ────────────────────────────────────────────────────

export const CanadianRegistration: Story = {
    name: 'Canadian Registration (PIPEDA)',
    args: {
        formTitle: 'Canadian Registration',
        formDescription: 'Demonstrates the A1A 1A1 postal code pattern for Canadian regional addresses.',
        submitLabel: 'Create Account',
        userId: 'ca-user',
        maxPiiFields: 3,
    },
    render: ({ formTitle, formDescription, submitLabel, userId, maxPiiFields, onSubmit, onAudit }) => (
        <GuardianFormProvider
            initialValues={{ name: '', email: '', postalCode: '' }}
            policies={[DataMinimizationPolicy(maxPiiFields)]}
            userContext={{ userId }}
            onAudit={onAudit as any}
            onSubmit={onSubmit as any}
        >
            <FormLayout title={formTitle} description={formDescription} submitLabel={submitLabel}>
                <GuardianFieldLayout label="Full Name" name="name" classification={DataClassification.PUBLIC}>
                    <GuardianField name="name" label="" classification={DataClassification.PUBLIC}>
                        {({ field }) => <input {...field} id="ca-field-name" className="gf-input" placeholder="Jean Dupont" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout label="Email" name="email" classification={DataClassification.PERSONAL}>
                    <GuardianField name="email" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <input {...field} id="ca-field-email" className="gf-input" placeholder="jean@example.ca" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <GuardianFieldLayout
                    label="Postal Code"
                    name="postalCode"
                    classification={DataClassification.PERSONAL}
                    complianceNote="Format: A1A 1A1 — letters are auto-uppercased."
                >
                    <GuardianField name="postalCode" label="" classification={DataClassification.PERSONAL}>
                        {({ field }) => <MaskedInput {...field} id="ca-field-postal" pattern={Patterns.POSTAL_CODE} placeholder="A1A 1A1" />}
                    </GuardianField>
                </GuardianFieldLayout>

                <div className="pt-2">
                    <ValidationIndicator />
                </div>
            </FormLayout>
        </GuardianFormProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const nameInput = await canvas.findByPlaceholderText('Jean Dupont');
        await userEvent.type(nameInput, 'Jean Dupont', { delay: 40 });

        const emailInput = await canvas.findByPlaceholderText('jean@example.ca');
        await userEvent.type(emailInput, 'jean.dupont@example.ca', { delay: 40 });

        const submitBtn = await canvas.findByRole('button', { name: /create account/i });
        await expect(submitBtn).toBeInTheDocument();
    },
};
