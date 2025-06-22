import {z} from "zod/v4";
import {DeepPartial} from "./common";
import type {Graph} from "../Graph";
import type {GraphConfig} from "./GraphStyle";

export const NodeBehaviorOpts = z.strictObject({
    pinOnDrag: z.boolean().default(true),
}).prefault({});

export const GraphBehaviorOpts = z.strictObject({
    node: NodeBehaviorOpts,
    fetchNodes: z.optional(z.instanceof(Function)),
    fetchEdges: z.optional(z.instanceof(Function)),
}).prefault({});

export const GraphLayoutOpts = z.strictObject({
    dimensions: z.number().min(2).max(3).default(3),
    type: z.string().default("ngraph"),
    preSteps: z.number().default(0),
    stepMultiplier: z.number().default(1),
    minDelta: z.number().default(0),
}).prefault({});

/* ******* REFACTOR EVERYTHING BELOW THIS LINE *********/
export const NodeId = z.string().or(z.number());
export type NodeIdType = z.infer<typeof NodeId>;

export const NodeObject = z.object({
    id: NodeId,
    metadata: z.object(),
});

export const EdgeObject = z.object({
    src: NodeId,
    dst: NodeId,
    metadata: z.object(),
});

export type NodeObjectType = z.infer<typeof NodeObject>;
export type EdgeObjectType = z.infer<typeof EdgeObject>;
// export type GraphKnownFieldsType = z.infer<typeof GraphKnownFields>
export type GraphOptsType = DeepPartial<GraphConfig>;

export type FetchNodesFn = (nodeIds: Set<NodeIdType>, g: Graph) => Set<NodeObjectType>;
export type FetchEdgesFn = (node: Node, g: Graph) => Set<EdgeObjectType>;
