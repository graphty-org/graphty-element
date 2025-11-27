import {set as deepSet} from "lodash";

import {AdHocData, SuggestedStylesConfig, SuggestedStylesProvider} from "../config";
import {Edge} from "../Edge";
import {Graph} from "../Graph";

type AlgorithmClass = new (g: Graph) => Algorithm;
const algorithmRegistry = new Map<string, AlgorithmClass>();

// algorithmResults layout:
// {
//     node: {
//         id: {
//             namespace: {
//                 algorithm: {
//                     result: unknown
//                 }
//             }
//         }
//     },
//     edge: {
//         id: {
//             namespace: {
//                 algorithm: {
//                     result: unknown
//                 }
//             }
//         }
//     },
//     graph: {
//         namespace: {
//             algorithm: {
//                 result: unknown
//             }
//         }
//     }
// }

export abstract class Algorithm {
    static type: string;
    static namespace: string;
    static suggestedStyles?: SuggestedStylesProvider;
    protected graph: Graph;

    constructor(g: Graph) {
        this.graph = g;
    }

    get type(): string {
        return (this.constructor as typeof Algorithm).type;
    }

    get namespace(): string {
        return (this.constructor as typeof Algorithm).namespace;
    }

    get results(): AdHocData {
        const algorithmResults = {} as AdHocData;

        // Node results
        for (const n of this.graph.getDataManager().nodes.values()) {
            deepSet(algorithmResults, `node.${n.id}`, n.algorithmResults);
        }

        // Edge results
        for (const e of this.graph.getDataManager().edges.values()) {
            const edgeKey = `${e.srcId}:${e.dstId}`;
            deepSet(algorithmResults, `edge.${edgeKey}`, e.algorithmResults);
        }

        // Graph results
        const dm = this.graph.getDataManager();
        if (dm.graphResults) {
            algorithmResults.graph = dm.graphResults;
        }

        return algorithmResults;
    }

    abstract run(g: Graph): Promise<void>;

    #createPath(resultName: string): string[] {
        const ret: string[] = [];

        ret.push("algorithmResults");
        ret.push(this.namespace);
        ret.push(this.type);
        ret.push(resultName);

        return ret;
    }

    addNodeResult(nodeId: number | string, resultName: string, result: unknown): void {
        const p = this.#createPath(resultName);
        const n = this.graph.getDataManager().nodes.get(nodeId);
        if (!n) {
            throw new Error(`couldn't find nodeId '${nodeId}' while trying to run algorithm '${this.type}'`);
        }

        deepSet(n, p, result);
        // XXX: THIS IS WHERE I LEFT OFF
        // replace algorithmResults with graph.nodes; set result on each node.algorithmResult
    }

    addEdgeResult(edge: Edge, resultName: string, result: unknown): void {
        const p = this.#createPath(resultName);
        deepSet(edge, p, result);
    }

    addGraphResult(resultName: string, result: unknown): void {
        const dm = this.graph.getDataManager();
        dm.graphResults ??= {} as AdHocData;

        const path = [this.namespace, this.type, resultName];
        deepSet(dm.graphResults, path, result);
    }

    static register<T extends AlgorithmClass>(cls: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ns: string = (cls as any).namespace;
        algorithmRegistry.set(`${ns}:${t}`, cls);
        return cls;
    }

    static get(g: Graph, namespace: string, type: string): Algorithm | null {
        const SourceClass = algorithmRegistry.get(`${namespace}:${type}`);
        if (SourceClass) {
            return new SourceClass(g);
        }

        return null;
    }

    static getClass(namespace: string, type: string): (AlgorithmClass & typeof Algorithm) | null {
        return algorithmRegistry.get(`${namespace}:${type}`) as (AlgorithmClass & typeof Algorithm) | null ?? null;
    }

    /**
     * Check if this algorithm has suggested styles
     */
    static hasSuggestedStyles(): boolean {
        return !!this.suggestedStyles;
    }

    /**
     * Get suggested styles for this algorithm
     */
    static getSuggestedStyles(): SuggestedStylesConfig | null {
        return this.suggestedStyles ? this.suggestedStyles() : null;
    }
}
