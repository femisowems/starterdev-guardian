export const formatByPattern = (value: string, pattern: string): string => {
    if (!value) return '';

    // Determine if we should only allow digits based on the pattern
    // Only exclude non-digits if the pattern is exclusively digit placeholders
    const hasAlpha = pattern.includes('A');
    const cleanValue = hasAlpha ? value.replace(/[^a-zA-Z0-9]/g, '') : value.replace(/\D/g, '');

    let formatted = '';
    let valueIdx = 0;

    for (let i = 0; i < pattern.length && valueIdx < cleanValue.length; i++) {
        const pChar = pattern[i];
        const vChar = cleanValue[valueIdx];

        if (pChar === 'X' || pChar === '0' || pChar === '#') {
            if (/[0-9]/.test(vChar)) {
                formatted += vChar;
                valueIdx++;
            } else {
                // If the value char is not a digit but we expected one, 
                // we skip it to find the next valid one
                valueIdx++;
                i--; // Stay on same pattern char
            }
        } else if (pChar === 'A') {
            if (/[a-zA-Z]/.test(vChar)) {
                formatted += vChar.toUpperCase();
                valueIdx++;
            } else {
                valueIdx++;
                i--;
            }
        } else {
            formatted += pChar;
        }
    }

    return formatted;
};

export const maskByPattern = (value: string, pattern: string): string => {
    const formatted = formatByPattern(value, pattern);
    // Mask letters and numbers, leave separators
    return formatted.replace(/[a-zA-Z0-9]/g, '*');
};

export const Patterns = {
    SSN: '###-##-####',
    SIN: '###-###-###',
    CREDIT_CARD: '#### #### #### ####',
    PHONE: '(###) ###-####',
    DOB: '##/##/####',
    ZIP: '#####',
    POSTAL_CODE: 'A#A #A#',
};
