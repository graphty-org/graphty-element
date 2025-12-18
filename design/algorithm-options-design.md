# Feature Design: Unified Options Schema System

## Overview

**User Value**:
- Fine-grained control over algorithm and layout behavior
- Ability to tune parameters for specific use cases (damping factor for PageRank, convergence tolerance)
- Reproducible results via seed control for stochastic algorithms
- Better visualization outcomes through parameter optimization
- Professional-grade graph analysis capabilities matching dedicated tools

**Technical Value**:
- Type-safe options with Zod-based runtime validation
- Schema-driven UI generation in consuming applications (graphty React app)
- Consistent pattern across all algorithms AND layouts
- Self-documenting API through option schemas with rich metadata
- Extensible architecture for future additions

## Implementation Summary

### Architecture

The system uses a **Zod-based unified schema** (`src/config/OptionsSchema.ts`) that provides:
1. **Zod schemas** for robust validation with type inference
2. **UI metadata** (labels, descriptions, advanced flags) for automatic form generation
3. **Consistent APIs** for both algorithms and layouts

### Key Files

| File | Purpose |
|------|---------|
| `src/config/OptionsSchema.ts` | Unified schema system (Zod + metadata) |
| `src/algorithms/types/OptionSchema.ts` | Legacy custom schema types (deprecated) |
| `src/algorithms/Algorithm.ts` | Base algorithm class with schema support |
| `src/layout/LayoutEngine.ts` | Base layout class with zodOptionsSchema |

## Schema Definition Pattern

### New Zod-Based Schema (Recommended)

Each algorithm/layout defines a `zodOptionsSchema` using `defineOptions()`:

```typescript
import { z } from "zod/v4";
import { defineOptions, type OptionsSchema } from "../config";

/**
 * Zod-based options schema for PageRank algorithm
 */
export const pageRankOptionsSchema = defineOptions({
    dampingFactor: {
        schema: z.number().min(0).max(1).default(0.85),
        meta: {
            label: "Damping Factor",
            description: "Probability of following a link (0.85 is standard for web graphs)",
            step: 0.05,
        },
    },
    maxIterations: {
        schema: z.number().int().min(1).max(1000).default(100),
        meta: {
            label: "Max Iterations",
            description: "Maximum power iterations before stopping",
            advanced: true,
        },
    },
    tolerance: {
        schema: z.number().min(1e-10).max(0.1).default(1e-6),
        meta: {
            label: "Tolerance",
            description: "Convergence threshold for early stopping",
            advanced: true,
        },
    },
});

export class PageRankAlgorithm extends Algorithm<PageRankOptions> {
    static namespace = "graphty";
    static type = "pagerank";

    // NEW: Zod-based options schema
    static zodOptionsSchema: OptionsSchema = pageRankOptionsSchema;

    // LEGACY: Old-style options schema (deprecated, for backward compatibility)
    static optionsSchema: OptionsSchema = { /* ... */ };

    constructor(g: Graph, options?: Partial<PageRankOptions>) {
        super(g, options);
        // Parse with Zod validation
        this.zodOptions = parseOptions(pageRankOptionsSchema, options ?? {});
    }

    async run(): Promise<void> {
        const { dampingFactor, maxIterations, tolerance } = this.zodOptions;
        // ... implementation
    }
}
```

### Layout Schema Pattern

Layouts follow the same pattern:

```typescript
import { z } from "zod/v4";
import { defineOptions, type OptionsSchema } from "../config";

export const ngraphLayoutOptionsSchema = defineOptions({
    dim: {
        schema: z.number().int().min(2).max(3).default(3),
        meta: {
            label: "Dimensions",
            description: "Layout dimensionality (2D or 3D)",
        },
    },
    springLength: {
        schema: z.number().positive().default(30),
        meta: {
            label: "Spring Length",
            description: "Ideal spring length between connected nodes",
        },
    },
    gravity: {
        schema: z.number().default(-1.2),
        meta: {
            label: "Gravity",
            description: "Gravity strength (negative for repulsion)",
            step: 0.1,
        },
    },
    seed: {
        schema: z.number().int().positive().nullable().default(null),
        meta: {
            label: "Random Seed",
            description: "Seed for reproducible layout",
            advanced: true,
        },
    },
});

export class NGraphEngine extends LayoutEngine {
    static type = "ngraph";
    static maxDimensions = 3;
    static zodOptionsSchema: OptionsSchema = ngraphLayoutOptionsSchema;
    // ...
}
```

## Schema Types Reference

### OptionMeta Interface

```typescript
interface OptionMeta {
    /** Human-readable label for UI display */
    label: string;
    /** Detailed description/help text */
    description: string;
    /** Hide in basic mode, show only in advanced settings */
    advanced?: boolean;
    /** Group related options together in UI */
    group?: string;
    /** Suggested step increment for numeric sliders */
    step?: number;
}
```

### OptionDefinition Interface

```typescript
interface OptionDefinition<T extends z.ZodType = z.ZodType> {
    /** Zod schema for validation and type inference */
    schema: T;
    /** UI metadata for display and organization */
    meta: OptionMeta;
}
```

### Common Zod Patterns

| Data Type | Zod Schema Pattern |
|-----------|-------------------|
| Number with range | `z.number().min(0).max(1).default(0.85)` |
| Integer with range | `z.number().int().min(1).max(1000).default(100)` |
| Boolean | `z.boolean().default(false)` |
| String | `z.string().default("")` |
| Nullable string | `z.string().nullable().default(null)` |
| NodeId (string or number) | `z.union([z.string(), z.number()]).nullable().default(null)` |
| Enum/Select | `z.enum(["vertical", "horizontal"]).default("vertical")` |
| Positive number | `z.number().positive().default(1.0)` |
| Nullable positive int | `z.number().int().positive().nullable().default(null)` |

## Utility Functions

### parseOptions

Validates and parses options using the schema:

```typescript
import { parseOptions } from "../config";

const options = parseOptions(myOptionsSchema, { dampingFactor: 0.9 });
// options is fully typed with all defaults applied
// Throws ZodError if validation fails
```

### safeParseOptions

Non-throwing version for graceful error handling:

```typescript
import { safeParseOptions } from "../config";

const result = safeParseOptions(myOptionsSchema, userInput);
if (result.success) {
    console.log(result.data);
} else {
    console.error(result.error);
}
```

### getDefaults

Extract default values from a schema:

```typescript
import { getDefaults } from "../config";

const defaults = getDefaults(pageRankOptionsSchema);
// { dampingFactor: 0.85, maxIterations: 100, tolerance: 1e-6 }
```

### getOptionsMeta

Get all metadata for UI generation:

```typescript
import { getOptionsMeta } from "../config";

const meta = getOptionsMeta(pageRankOptionsSchema);
// Map<string, OptionMeta>
```

### getOptionsFiltered

Filter options by advanced flag:

```typescript
import { getOptionsFiltered } from "../config";

const basicOptions = getOptionsFiltered(schema, false);  // Only basic options
const advancedOptions = getOptionsFiltered(schema, true); // Only advanced options
```

## Migrated Components

### Algorithms with zodOptionsSchema

**Centrality:**
- `EigenvectorCentralityAlgorithm`: maxIterations, tolerance, normalized, mode, endpoints
- `KatzCentralityAlgorithm`: alpha, beta, maxIterations, tolerance, normalized, mode, endpoints
- `HITSAlgorithm`: maxIterations, tolerance, normalized, mode, endpoints
- `PageRankAlgorithm`: dampingFactor, maxIterations, tolerance, weight, useDelta

**Community Detection:**
- `LouvainAlgorithm`: resolution, maxIterations, tolerance, useOptimized
- `LeidenAlgorithm`: resolution, randomSeed, maxIterations, threshold
- `LabelPropagationAlgorithm`: maxIterations, randomSeed
- `GirvanNewmanAlgorithm`: maxCommunities, minCommunitySize, maxIterations

**Traversal:**
- `BFSAlgorithm`: source, targetNode
- `DFSAlgorithm`: source, targetNode, recursive, preOrder

**Pathfinding:**
- `DijkstraAlgorithm`: source, target, bidirectional

**Flow:**
- `MaxFlowAlgorithm`: source, sink
- `MinCutAlgorithm`: source, sink, useGlobalMinCut, useKarger, kargerIterations

### Algorithms without configurable options

These algorithms have minimal/no meaningful UI-exposed options:
- DegreeAlgorithm
- BetweennessCentralityAlgorithm
- ClosenessCentralityAlgorithm
- ConnectedComponentsAlgorithm
- StronglyConnectedComponentsAlgorithm
- KruskalAlgorithm
- PrimAlgorithm
- FloydWarshallAlgorithm
- BellmanFordAlgorithm
- BipartiteMatchingAlgorithm

### Layouts with zodOptionsSchema

**Force-Directed:**
- `NGraphEngine`: dim, springLength, springCoefficient, gravity, theta, dragCoefficient, timeStep, seed
- `D3GraphEngine`: alphaMin, alphaTarget, alphaDecay, velocityDecay
- `ForceAtlas2Layout`: scalingFactor, maxIter, jitterTolerance, scalingRatio, gravity, distributedAction, strongGravity, dissuadeHubs, linlog, seed, dim
- `SpringLayout`: scalingFactor, k, iterations, scale, dim, seed
- `ArfLayout`: scalingFactor, scaling, a, maxIter, seed

**Hierarchical:**
- `BfsLayout`: scalingFactor, start, align, scale
- `BipartiteLayout`: scalingFactor, align, scale, aspectRatio
- `MultipartiteLayout`: scalingFactor, align, scale

**Geometric:**
- `CircularLayout`: scalingFactor, scale, dim
- `SpiralLayout`: scalingFactor, scale, dim, resolution, equidistant
- `ShellLayout`: scalingFactor, scale, dim
- `RandomLayout`: scalingFactor, dim, seed
- `PlanarLayout`: scalingFactor, scale, dim, seed
- `SpectralLayout`: scalingFactor, scale, dim
- `KamadaKawaiLayout`: scalingFactor, scale, dim, weightProperty

**Utility:**
- `FixedLayout`: dim

## UI Integration Pattern

The schema enables automatic form generation:

```typescript
// graphty/src/components/AlgorithmOptionsForm.tsx

import { getOptionsMeta, getDefaults } from "@graphty/graphty-element";

function AlgorithmOptionsForm({ schema, onChange }) {
    const meta = getOptionsMeta(schema);
    const defaults = getDefaults(schema);

    return (
        <Stack>
            {Array.from(meta.entries()).map(([key, optMeta]) => (
                <FormField
                    key={key}
                    name={key}
                    label={optMeta.label}
                    description={optMeta.description}
                    defaultValue={defaults[key]}
                    step={optMeta.step}
                    advanced={optMeta.advanced}
                    onChange={(value) => onChange(key, value)}
                />
            ))}
        </Stack>
    );
}
```

## Backward Compatibility

The system maintains full backward compatibility:

1. **Legacy `optionsSchema`**: Still supported on Algorithm base class
2. **Constructor without options**: Works with defaults
3. **`configure()` method**: Still works for algorithms that use it
4. **Gradual migration**: Both systems can coexist

## Technical Notes

### Performance
- Options validation runs once at construction time
- No runtime overhead during algorithm/layout execution
- Schema objects are static (no per-instance allocation)

### Bundle Size
- Uses Zod (already a dependency via other packages)
- Minimal additional code (~3KB)

### Type Inference
```typescript
// Full type inference from schema
const algo = new PageRankAlgorithm(graph, {
    dampingFactor: 0.9,  // ✓ Valid, typed as number
    maxIterations: 50,   // ✓ Valid, typed as number
    invalid: true,       // ✗ TypeScript error - not in schema
});
```

---

**Document Version**: 2.0
**Last Updated**: 2024-12-17
**Status**: Implemented
