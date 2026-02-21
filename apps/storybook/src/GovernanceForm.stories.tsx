import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from '@storybook/test';
import { GovernanceFormShell } from './components/governance/GovernanceFormShell';
import type { GovernanceConfig, PolicyMode, JurisdictionMode, UserSimRole, RiskBreakdownFull, GovernanceEvent } from './components/governance/governanceTypes';
import '../../../packages/guardian-form/src/guardian-form.css';
import './tailwind.css';

// ─── Story Args ───────────────────────────────────────────────────────────────

interface GovernanceFormArgs {
    policyMode: PolicyMode;
    userSimRole: UserSimRole;
    jurisdiction: JurisdictionMode;
    autoRemediation: boolean;
    showRiskBreakdown: boolean;
    userId: string;
    onSubmit: (...args: any[]) => void;
    onPolicyViolation: (fieldId: string, rule: string) => void;
    onAutoRemediation: (fieldId: string) => void;
    onRiskScoreChange: (score: number, breakdown: RiskBreakdownFull) => void;
    onApprovalRequested: (fieldId: string) => void;
    onAuditEvent: (event: GovernanceEvent) => void;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<GovernanceFormArgs> = {
    title: 'GuardianForm/Governance',
    component: GovernanceFormShell as any,
    argTypes: {
        policyMode: {
            control: 'radio',
            options: ['warn', 'enforce', 'simulate'] as PolicyMode[],
            description: '**warn** — submit enabled with violation labels | **enforce** — submit blocked until all violations are fixed | **simulate** — always enabled, no persistence',
            table: { category: 'Policy Engine', defaultValue: { summary: 'enforce' } },
        },
        userSimRole: {
            control: 'radio',
            options: ['viewer', 'admin', 'auditor'] as UserSimRole[],
            description: '**viewer** — HIGHLY_SENSITIVE fields hidden in simulate mode | **admin** — full access, −5 risk pts | **auditor** — full access, −10 risk pts',
            table: { category: 'Policy Engine', defaultValue: { summary: 'admin' } },
        },
        jurisdiction: {
            control: 'radio',
            options: ['US', 'CA', 'EU'] as JurisdictionMode[],
            description: 'Active regulatory jurisdiction. Changes active compliance badges and field validation rules.',
            table: { category: 'Policy Engine', defaultValue: { summary: 'US' } },
        },
        autoRemediation: {
            control: 'boolean',
            description: 'When true, the "Fix All" bulk action is enabled and per-field Fix buttons appear on BLOCK violations.',
            table: { category: 'Policy Engine' },
        },
        showRiskBreakdown: {
            control: 'boolean',
            description: 'Toggle the animated 6-factor Risk Breakdown panel at the bottom of the form.',
            table: { category: 'UI' },
        },
        userId: {
            control: 'text',
            description: 'User ID stamped on all audit events',
            table: { category: 'Governance' },
        },
        onSubmit: { description: 'Fired when form is submitted (policy-compliant)', table: { category: 'Actions' } },
        onPolicyViolation: { description: '(fieldId, ruleId) → fired when a Fix button is clicked', table: { category: 'Events' } },
        onAutoRemediation: { description: '(fieldId) → fired after auto-remediation is applied to a field', table: { category: 'Events' } },
        onRiskScoreChange: { description: '(score, breakdown) → fired whenever the governance risk score changes', table: { category: 'Events' } },
        onApprovalRequested: { description: '(fieldId) → fired when justification approval status is set to pending', table: { category: 'Events' } },
        onAuditEvent: { description: '(GovernanceEvent) → fired on every governance state mutation', table: { category: 'Events' } },
    },
    args: {
        policyMode: 'enforce',
        userSimRole: 'admin',
        jurisdiction: 'US',
        autoRemediation: true,
        showRiskBreakdown: true,
        userId: 'compliance-officer-001',
        onSubmit: fn(),
        onPolicyViolation: fn(),
        onAutoRemediation: fn(),
        onRiskScoreChange: fn(),
        onApprovalRequested: fn(),
        onAuditEvent: fn(),
    },
};

export default meta;
type Story = StoryObj<GovernanceFormArgs>;

// ─── Helper to build GovernanceConfig from args ───────────────────────────────

function toConfig(args: GovernanceFormArgs): GovernanceConfig {
    return {
        policyMode: args.policyMode,
        jurisdiction: args.jurisdiction,
        userSimRole: args.userSimRole,
        autoRemediation: args.autoRemediation,
        showRiskBreakdown: args.showRiskBreakdown,
        userId: args.userId,
        onPolicyViolation: args.onPolicyViolation,
        onAutoRemediation: args.onAutoRemediation,
        onRiskScoreChange: args.onRiskScoreChange,
        onApprovalRequested: args.onApprovalRequested,
        onAuditEvent: args.onAuditEvent,
    };
}

// ─── EnforcedMode ─────────────────────────────────────────────────────────────

export const EnforcedMode: Story = {
    name: 'Enforced Mode (Violations Block Submit)',
    args: {
        policyMode: 'enforce',
        userSimRole: 'admin',
        jurisdiction: 'US',
        showRiskBreakdown: true,
    },
    render: (args) => (
        <GovernanceFormShell config={toConfig(args)} onSubmit={args.onSubmit} />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Verify mode indicator is visible
        const modeBadge = await canvas.findByText(/ENFORCE MODE/i);
        await expect(modeBadge).toBeInTheDocument();

        // Submit should be blocked (disabled) since violations exist
        const submitBtn = await canvas.findByRole('button', { name: /blocked by policy/i });
        await expect(submitBtn).toBeDisabled();

        // Fix All button should be present and enabled
        const fixAllBtn = await canvas.findByRole('button', { name: /fix all violations/i });
        await expect(fixAllBtn).toBeInTheDocument();

        // Click Fix All — violations should be resolved
        await userEvent.click(fixAllBtn);

        // After remediation, submit should become enabled
        const submitEnabled = await canvas.findByRole('button', { name: /submit securely/i });
        await expect(submitEnabled).not.toBeDisabled();
    },
};

// ─── RoleSimulation ───────────────────────────────────────────────────────────

export const RoleSimulation: Story = {
    name: 'Role Simulation (Viewer / Admin / Auditor)',
    args: {
        policyMode: 'simulate',
        userSimRole: 'viewer',
        jurisdiction: 'EU',
        showRiskBreakdown: true,
    },
    render: (args) => (
        <GovernanceFormShell config={toConfig(args)} onSubmit={args.onSubmit} />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // In simulate mode the mode indicator should say SIMULATE
        const modeIndicator = await canvas.findByText(/SIMULATE MODE/i);
        await expect(modeIndicator).toBeInTheDocument();

        // Submit should always be enabled in simulate mode
        const submitBtn = await canvas.findByRole('button', { name: /submit \(simulation\)/i });
        await expect(submitBtn).toBeEnabled();

        // GDPR jurisdiction rule should be visible
        const gdprBadge = await canvas.findByText(/GDPR/i);
        await expect(gdprBadge).toBeInTheDocument();
    },
};

// ─── AutoRemediationDemo ──────────────────────────────────────────────────────

export const AutoRemediationDemo: Story = {
    name: 'Auto-Remediation Demo (Fix All)',
    args: {
        policyMode: 'warn',
        userSimRole: 'auditor',
        jurisdiction: 'US',
        autoRemediation: true,
        showRiskBreakdown: true,
    },
    render: (args) => (
        <GovernanceFormShell config={toConfig(args)} onSubmit={args.onSubmit} />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Warn mode — submit should be enabled even with violations
        const warnIndicator = await canvas.findByText(/WARN MODE/i);
        await expect(warnIndicator).toBeInTheDocument();

        const submitBtn = await canvas.findByRole('button', { name: /submit \(violations detected\)/i });
        await expect(submitBtn).toBeEnabled();

        // Click "Encrypt All Sensitive" bulk action
        const encryptBtn = await canvas.findByRole('button', { name: /encrypt all sensitive/i });
        await userEvent.click(encryptBtn);

        // Now click "Apply Full Masking"
        const maskBtn = await canvas.findByRole('button', { name: /apply full masking/i });
        await userEvent.click(maskBtn);

        // Finally fix all remaining violations
        const fixAllBtn = canvas.queryByRole('button', { name: /fix all violations/i });
        if (fixAllBtn && !fixAllBtn.hasAttribute('disabled')) {
            await userEvent.click(fixAllBtn);
        }

        // After all fixes, submit label should change (no violations)
        const cleanSubmit = await canvas.findByRole('button', { name: /submit securely|submit \(violations\)/i });
        await expect(cleanSubmit).toBeInTheDocument();
    },
};
