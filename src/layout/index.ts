import type {OptionsSchema} from "../config";
import {ArfLayout} from "./ArfLayoutEngine";
import {BfsLayout} from "./BfsLayoutEngine";
import {BipartiteLayout} from "./BipartiteLayoutEngine";
import {CircularLayout} from "./CircularLayoutEngine";
import {D3GraphEngine} from "./D3GraphLayoutEngine";
import {FixedLayout} from "./FixedLayoutEngine";
import {ForceAtlas2Layout} from "./ForceAtlas2LayoutEngine";
import {KamadaKawaiLayout} from "./KamadaKawaiLayoutEngine";
import {LayoutEngine, type LayoutEngineStatics} from "./LayoutEngine";
import {MultipartiteLayout} from "./MultipartiteLayoutEngine";
import {NGraphEngine} from "./NGraphLayoutEngine";
import {PlanarLayout} from "./PlanarLayoutEngine";
import {RandomLayout} from "./RandomLayoutEngine";
import {ShellLayout} from "./ShellLayoutEngine";
import {SpectralLayout} from "./SpectralLayoutEngine";
import {SpiralLayout} from "./SpiralLayoutEngine";
import {SpringLayout} from "./SpringLayoutEngine";

LayoutEngine.register(D3GraphEngine);
LayoutEngine.register(NGraphEngine);
LayoutEngine.register(SpiralLayout);
LayoutEngine.register(CircularLayout);
LayoutEngine.register(ShellLayout);
LayoutEngine.register(RandomLayout);
LayoutEngine.register(SpringLayout);
LayoutEngine.register(PlanarLayout);
LayoutEngine.register(KamadaKawaiLayout);
LayoutEngine.register(ForceAtlas2Layout);
LayoutEngine.register(ArfLayout);
LayoutEngine.register(SpectralLayout);
LayoutEngine.register(BfsLayout);
LayoutEngine.register(BipartiteLayout);
LayoutEngine.register(MultipartiteLayout);
LayoutEngine.register(FixedLayout);

/**
 * Information about a registered layout
 */
export interface LayoutInfo {
    /** Layout type identifier (e.g., "circular", "ngraph") */
    type: string;
    /** Maximum dimensions supported (2 or 3) */
    maxDimensions: number;
    /** Zod-based options schema with UI metadata (if defined) */
    zodOptionsSchema: OptionsSchema;
    /** Whether the layout has a Zod-based options schema */
    hasZodOptions: boolean;
}

/**
 * Get information about all registered layouts including their options schemas
 *
 * @returns Array of layout information objects
 *
 * @example
 * ```typescript
 * const layouts = getAllLayoutInfo();
 * for (const layout of layouts) {
 *     if (layout.hasZodOptions) {
 *         console.log(`${layout.type} has options:`, layout.zodOptionsSchema);
 *     }
 * }
 * ```
 */
export function getAllLayoutInfo(): LayoutInfo[] {
    const layouts: LayoutInfo[] = [];

    // Get all registered layout types
    const types = LayoutEngine.getRegisteredTypes();

    for (const type of types) {
        const LayoutClass = LayoutEngine.getClass(type);
        if (LayoutClass) {
            layouts.push({
                type: LayoutClass.type,
                maxDimensions: LayoutClass.maxDimensions,
                zodOptionsSchema: LayoutClass.getZodOptionsSchema(),
                hasZodOptions: LayoutClass.hasZodOptions(),
            });
        }
    }

    return layouts;
}

/**
 * Get all layout Zod-based options schemas as a Map
 *
 * @returns Map of layout type to options schema
 *
 * @example
 * ```typescript
 * const schemas = getAllLayoutSchemas();
 * const circularSchema = schemas.get("circular");
 * ```
 */
export function getAllLayoutSchemas(): Map<string, OptionsSchema> {
    const schemas = new Map<string, OptionsSchema>();

    for (const info of getAllLayoutInfo()) {
        if (info.hasZodOptions) {
            schemas.set(info.type, info.zodOptionsSchema);
        }
    }

    return schemas;
}

// Re-export types and classes
export {LayoutEngine, type LayoutEngineStatics};
