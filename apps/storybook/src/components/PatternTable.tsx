import React from 'react';

export interface PatternRow {
    pattern: string;
    format: string;
    example: string;
    masked: string;
    useCase: string;
}

interface PatternTableProps {
    rows: PatternRow[];
    title?: string;
    description?: string;
}

export const PATTERN_ROWS: PatternRow[] = [
    { pattern: 'Patterns.PHONE', format: '(###) ###-####', example: '(123) 456-7890', masked: '(***) ***-****', useCase: 'Contact forms, SMS opt-ins' },
    { pattern: 'Patterns.ZIP', format: '#####', example: '90210', masked: '*****', useCase: 'US shipping / billing' },
    { pattern: 'Patterns.POSTAL_CODE', format: 'A#A #A#', example: 'K1A 0B1', masked: '*** ***', useCase: 'Canadian addresses' },
    { pattern: 'Patterns.DOB', format: '##/##/####', example: '01/01/1990', masked: '**/**/****', useCase: 'Age verification' },
    { pattern: 'Patterns.SSN', format: '###-##-####', example: '123-45-6789', masked: '***-**-****', useCase: 'US tax / identity' },
    { pattern: 'Patterns.SIN', format: '###-###-###', example: '123-456-789', masked: '***-***-***', useCase: 'Canadian tax / identity' },
    { pattern: 'Patterns.CREDIT_CARD', format: '#### #### #### ####', example: '4111 1111 1111 1111', masked: '**** **** **** ****', useCase: 'Payment flows' },
];

export const PatternTable: React.FC<PatternTableProps> = ({
    rows,
    title = 'Input Mask Reference',
    description = 'Structural masking preserves separators when the field is blurred. # matches a digit, A matches a letter (auto-uppercased).',
}) => {
    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-sm text-slate-400">No patterns defined.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight">{title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>

            {/* Scrollable table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            {['Pattern', 'Format', 'Example', 'Masked', 'Use Case'].map((h) => (
                                <th
                                    key={h}
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="group hover:bg-indigo-50/40 transition-colors duration-100"
                            >
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <code className="font-mono text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                        {row.pattern}
                                    </code>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <code className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                        {row.format}
                                    </code>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 font-mono">
                                    {row.example}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <code className="font-mono text-xs text-slate-400 tracking-widest">
                                        {row.masked}
                                    </code>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                    {row.useCase}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatternTable;
