# Guardian Monorepo

Enterprise-grade governance and security framework for regulated environments. 

This monorepo houses the `@starterdev/guardian-form` headless form library, alongside a comprehensive, interactive Storybook environment that demonstrates an **Enterprise Governance Form** implementing advanced security, compliance, and auditing features.

## Repository Structure

```tree
.
├── apps/
│   └── storybook/       # Isolated UI documentation and test environment
│                        # Contains the Enterprise Governance Form implementation
├── packages/
│   └── guardian-form/   # Core headless library (PII handling, risk scoring, policies)
├── package.json         # Monorepo root configuration
└── tsconfig.base.json   # Shared TypeScript configuration
```

## Features

### 🛡️ Core Library (`@starterdev/guardian-form`)

A headless-first, tree-shakeable React + TypeScript form framework designed for data privacy:
- **Field-level Data Classification**: Governance for various sensitivity levels (`PUBLIC`, `INTERNAL`, `PERSONAL`, `FINANCIAL`, `HIGHLY_SENSITIVE`).
- **Real-time Risk Scoring**: Instant feedback on form risk density.
- **Compliance Policy Engine**: Enforce security rules (e.g., "No Plaintext PII", "Require Encryption").
- **Audit Trails**: Built-in tracking of sensitive data access and modifications.
- **Zod Support**: First-class adapter for schema-based validation.

### 🏢 Enterprise Governance Form (Storybook UI)

![Enterprise Governance Form Demo](assets/enterprise_form_demo.webp)

The Storybook app showcases a fully realized **Enterprise Governance Form** built on top of the core library, demonstrating 10 advanced capabilities:
1. **Dynamic Risk Engine & Breakdown Panel**: Real-time visualization of risk scores and penalty factors.
2. **Field-Level Governance Controls**: Granular controls for encryption, masking, access restriction, data lifecycle, and AI flags.
3. **Inline Policy Remediation**: Instant feedback and auto-fix suggestions for rule violations.
4. **Role Simulation Mode**: Preview the form from different user perspectives (e.g., Admin, Standard User, Auditor).
5. **Justification Workflow**: Require users to provide justifications when modifying highly sensitive fields.
6. **Jurisdiction-Aware Policies**: Apply compliance rules based on regional data residency laws (e.g., GDPR, CCPA).
7. **AI Governance Flags**: Identify and explicitly flag fields that represent inputs/outputs of AI models.
8. **Audit Event Panel**: A live stream of data access and modification logs.
9. **Bulk Actions**: Perform governance updates across multiple fields simultaneously.
10. **State Management**: Robust React context handling complex form and governance state.

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
npm install
```

### Common Commands

Run these commands from the root directory:

- **Build**: `npm run build` (Builds all packages)
- **Test**: `npm test` (Runs all test suites)
- **Storybook**: `npm run storybook` (Starts the documentation server & Enterprise Form demo)
- **Lint**: `npm run lint` (Checks code quality)

## Security & compliance

This project follows strict security standards for handling PII (Personally Identifiable Information) and Financial data. 

- **Static Analysis**: ESLint and TypeScript for type safety.
- **Verification**: automated test suites for governance logic.
- **Isolation**: Storybook app is isolated from the main library to ensure zero side effects.
