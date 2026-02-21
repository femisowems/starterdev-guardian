import type { Preview } from "@storybook/react";
import "../src/tailwind.css";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        options: {
            storySort: {
                order: ['GuardianForm', [
                    'Everyday Forms',
                    'Secure Forms',
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
};

export default preview;
