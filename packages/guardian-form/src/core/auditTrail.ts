import { AuditMeta, DataClassification, UserContext } from './types';

/**
 * Tracks field-level interactions and generates audit metadata.
 */
export class AuditTrail {
    private touchedFields = new Set<string>();
    private classifications = new Set<DataClassification>();
    private userContext: UserContext;

    constructor(userContext: UserContext) {
        this.userContext = userContext;
    }

    /**
     * Record a field interaction.
     */
    track(fieldName: string, classification: DataClassification) {
        this.touchedFields.add(fieldName);
        this.classifications.add(classification);
    }

    /**
     * Generates audit metadata for the current session.
     */
    generateMeta(action: AuditMeta['action']): AuditMeta {
        return {
            userId: this.userContext.userId,
            timestamp: new Date().toISOString(),
            fieldsTouched: Array.from(this.touchedFields),
            classificationLevels: Array.from(this.classifications),
            action,
        };
    }

    /**
     * Resets the audit trail tracking.
     */
    reset() {
        this.touchedFields.clear();
        this.classifications.clear();
    }
}
