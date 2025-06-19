import {Graph} from "../Graph";
import {Edge} from "../Edge";
import {set as deepSet} from "lodash";

type AlgorithmClass = new (opts: object) => Algorithm
const algorithmRegistry: Map<string, AlgorithmClass> = new Map();
const algorithmResults: Record<string, object> = {}; // TODO: this global should live on the graph instance

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

    get type() {
        return (this.constructor as typeof Algorithm).type;
    }

    get namespace() {
        return (this.constructor as typeof Algorithm).namespace;
    }

    get results() {
        return structuredClone(algorithmResults);
    }

    abstract run(g: Graph): Promise<void>;

    #createPath(elementType: string, id?: number | string): string[] {
        const ret: string[] = [];
        ret.push(elementType);

        if (typeof id === "number") {
            ret.push(id.toString());
        } else if (typeof id === "string") {
            ret.push(id);
        }

        ret.push(this.namespace);
        ret.push(this.type);

        return ret;
    }

    addNodeResult(nodeId: number | string, result: unknown): void {
        const p = this.#createPath("node", nodeId);
        deepSet(algorithmResults, p, result);
    }

    addEdgeResult(e: Edge, result: unknown): void {
        console.log("adding edge result", e, result);
    }

    addGraphResult(g: Graph, result: unknown): void {
        console.log("adding graph result", g, result);
    }

    static register<T extends AlgorithmClass>(cls: T) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        algorithmRegistry.set(t, cls);
        return cls;
    }

    static get(type: string, opts: object = {}): Algorithm | null {
        const SourceClass = algorithmRegistry.get(type);
        if (SourceClass) {
            return new SourceClass(opts);
        }

        return null;
    }
}
