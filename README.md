# Guardian Monorepo

Enterprise-grade governance and security framework for regulated environments.

## Repository Structure

```tree
.
├── apps/
│   └── storybook/       # Isolated UI documentation and test environment
├── packages/
│   └── guardian-form/   # Core headless library (PII handling & risk scoring)
├── package.json         # Monorepo root configuration
└── tsconfig.base.json   # Shared TypeScript configuration
```

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
- **Storybook**: `npm run storybook` (Starts documentation server)
- **Lint**: `npm run lint` (Checks code quality)

## Security & compliance

This project follows strict security standards for handling PII (Personally Identifiable Information) and Financial data. 

- **Static Analysis**: ESLint and TypeScript for type safety.
- **Verification**: automated test suites for governance logic.
- **Isolation**: Storybook app is isolated from the main library to ensure zero side effects.
