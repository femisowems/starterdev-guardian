import { DataClassification, FieldMetadata, RiskScore } from './types';

/**
 * Calculates real-time risk score based on form fields and their metadata.
 */
export function calculateRiskScore(
    values: Record<string, any>,
    metadata: Record<string, FieldMetadata>,
    errors: Record<string, string>
): RiskScore {
    let classificationWeight = 0;
    let piiWeight = 0;
    let validationPenalty = 0;
    let freeTextPenalty = 0;

    const totalFields = Object.keys(metadata).length;
    if (totalFields === 0) {
        return {
            score: 0,
            level: 'LOW',
            blocking: false,
            breakdown: { piiWeight: 0, validationPenalty: 0, freeTextPenalty: 0 },
        };
    }

    for (const [name, meta] of Object.entries(metadata)) {
        const value = values[name];
        const hasValue = value !== undefined && value !== null && String(value).trim().length > 0;
        const hasError = !!errors[name];


        // 1. Classification Weight & PII Tracking (Only if field has data)
        if (hasValue) {
            // PII is defined as PERSONAL, FINANCIAL, or HIGHLY_SENSITIVE
            switch (meta.classification) {
                case DataClassification.HIGHLY_SENSITIVE:
                    classificationWeight += 40;
                    piiWeight += 40;
                    break;
                case DataClassification.FINANCIAL:
                    classificationWeight += 30;
                    piiWeight += 30;
                    break;
                case DataClassification.PERSONAL:
                    classificationWeight += 20;
                    piiWeight += 20;
                    break;
                case DataClassification.INTERNAL:
                    classificationWeight += 5;
                    // INTERNAL is proprietary but not PII
                    break;
                default:
                    classificationWeight += 0;
            }
        }

        // 2. Validation Penalty (Always applies if error exists)
        if (hasError) {
            validationPenalty += 10;
        }

        // 3. Free Text Penalty
        // Heuristic: If value is a long string and classification is sensitive, it's a risk.
        if (
            hasValue &&
            typeof value === 'string' &&
            value.length > 50 &&
            meta.classification !== DataClassification.PUBLIC
        ) {
            freeTextPenalty += 15;
        }
    }


    // Normalize score to 0-100
    const rawScore = classificationWeight + validationPenalty + freeTextPenalty;
    const score = Math.min(100, Math.max(0, rawScore));

    let level: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (score >= 70) level = 'HIGH';
    else if (score > 30) level = 'MEDIUM';

    return {
        score,
        level,
        blocking: level === 'HIGH',
        breakdown: {
            piiWeight: Math.min(100, piiWeight),
            validationPenalty: Math.min(100, validationPenalty),
            freeTextPenalty: Math.min(100, freeTextPenalty),
        },
    };
}

