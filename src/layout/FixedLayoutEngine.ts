import {z} from "zod/v4";

import {defineOptions, type OptionsSchema} from "../config";
import {SimpleLayoutConfig, SimpleLayoutEngine} from "./LayoutEngine";

/**
 * Zod-based options schema for Fixed Layout
 */
export const fixedLayoutOptionsSchema = defineOptions({
    dim: {
        schema: z.number().int().min(2).max(3).default(3),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D or 3D)",
        },
    },
});

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
    static zodOptionsSchema: OptionsSchema = fixedLayoutOptionsSchema;
    config: FixedLayoutConfigType;
    scalingFactor = 1;

    constructor(opts: FixedLayoutOpts = {}) {
        super(opts);
        this.config = FixedLayoutConfig.parse(opts);
        // Use default scaling factor from parent class
    }

    override addNode(n: import("../Node.js").Node): void {
        super.addNode(n);
        // For fixed layout, apply position immediately when node is added
        const nodeData = n.data as Record<string, unknown>;
        const position = nodeData.position as {x?: number, y?: number, z?: number} | undefined;
        if (position) {
            n.mesh.position.set(position.x ?? 0, position.y ?? 0, position.z ?? 0);
        }
    }

    doLayout(): void {
        this.stale = false;
        // Read positions from node data
        const positions: Record<string, number[]> = {};

        for (const node of this._nodes) {
            const nodeData = node.data as Record<string, unknown>;
            const position = nodeData.position as {x?: number, y?: number, z?: number} | undefined;

            let pos: number[];
            if (position) {
                pos = [
                    position.x ?? 0,
                    position.y ?? 0,
                    position.z ?? 0,
                ];
            } else {
                // Default position if not specified
                pos = [0, 0, 0];
            }

            positions[node.id] = pos;

            // Apply position directly to node mesh
            node.mesh.position.set(pos[0], pos[1], pos[2]);
        }

        this.positions = positions;
    }
}
