import {z} from "zod/v4";

import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

export const FixedLayoutConfig = z.strictObject({
    ... SimpleLayoutConfig.shape,
    dim: z.number().default(3),
});
export type FixedLayoutConfigType = z.infer<typeof FixedLayoutConfig>;
export type FixedLayoutOpts = Partial<FixedLayoutConfigType>;

/**
 * Fixed layout engine that doesn't move nodes - uses positions from node data
 */
export class FixedLayout extends SimpleLayoutEngine {
    static type = "fixed";
    static maxDimensions = 3;
    config: FixedLayoutConfigType;
    scalingFactor = 1;

    constructor(opts: FixedLayoutOpts = {}) {
        super(opts);
        this.config = FixedLayoutConfig.parse(opts);
        // Use default scaling factor from parent class
    }

    doLayout(): void {
        this.stale = false;
        // Read positions from node data
        const positions: Record<string, number[]> = {};

        for (const node of this._nodes) {
            const nodeData = node.data as Record<string, unknown>;
            const position = nodeData.position as {x?: number, y?: number, z?: number} | undefined;
            if (position) {
                positions[node.id] = [
                    position.x ?? 0,
                    position.y ?? 0,
                    position.z ?? 0,
                ];
            } else {
                // Default position if not specified
                positions[node.id] = [0, 0, 0];
            }
        }

        this.positions = positions;
    }
}
