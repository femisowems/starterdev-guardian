import type { Preview } from "@storybook/react";
import "../src/tailwind.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
            // Disable the "Update Story" confirmation prompt — args apply immediately
            disableDefaultShortcuts: false,
            hideNoControlsWarning: true,
        },
        // Auto-wire any prop starting with "on" as a Storybook action logger
        actions: { argTypesRegex: '^on[A-Z].*' },
        options: {
            storySort: {
                order: ['GuardianForm', [
                    'Everyday Forms',
                    'Secure Forms',
                    'Governance',
                    'Advanced Forms',
                    'Enterprise Forms',
                    'Authentication Forms',
                    'Multi-Step Forms',
                    'Dynamic Forms',
                    'Document Intake',
                    'Consent & Compliance',
                    'Accessibility',
                    'Jurisdiction Modes',
                    'System States'
                ]],
            },
        },
    },
    // Disable play function step-through mode so interactions run automatically
    globals: {
        sb_theme: 'light',
    },
};

export default preview;
