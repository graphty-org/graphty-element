import type {OperationCategory} from "../managers/OperationQueueManager";

export interface ObsolescenceRule {
    /**
     * Categories that this operation obsoletes
     */
    obsoletes: OperationCategory[];

    /**
     * Whether to respect progress (don't cancel >90% complete)
     */
    respectProgress?: boolean;

    /**
     * Only obsolete queued operations, not running ones
     */
    skipRunning?: boolean;
}

/**
 * Default obsolescence rules for operation categories
 * These rules define which operations make others obsolete
 */
export const OBSOLESCENCE_RULES: Partial<Record<OperationCategory, ObsolescenceRule>> = {
    // Data operations obsolete dependent calculations
    "data-add": {
        obsoletes: ["layout-update", "algorithm-run"],
        respectProgress: true,
    },

    "data-remove": {
        obsoletes: ["layout-update", "algorithm-run", "render-update"],
        respectProgress: true,
    },

    "data-update": {
        obsoletes: ["algorithm-run", "render-update"],
        respectProgress: true,
        skipRunning: false,
    },

    // Style changes obsolete renders
    "style-init": {
        obsoletes: ["style-apply", "render-update"],
        respectProgress: false, // Style init is critical
    },

    "style-apply": {
        obsoletes: ["render-update"],
        respectProgress: true,
    },

    // Layout changes obsolete dependent operations
    "layout-set": {
        obsoletes: ["layout-update", "camera-update"],
        respectProgress: false, // New layout engine is important
    },

    "layout-update": {
        obsoletes: ["render-update"],
        respectProgress: true,
    },

    // Camera changes obsolete renders
    "camera-update": {
        obsoletes: ["render-update"],
        respectProgress: true,
        skipRunning: true, // Don't interrupt running renders
    },
};
