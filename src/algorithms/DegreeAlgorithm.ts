import {Algorithm} from "./Algorithm";
import {Graph} from "../Graph";

export class DegreeAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "degree";

    async run(g: Graph) {
        const inDegreeMap = new Map<number | string, number>();
        const outDegreeMap = new Map<number | string, number>();
        const degreeMap = new Map<number | string, number>();

        function incrementMap(m: Map<number | string, number>, idx: number | string) {
            let num = m.get(idx); ;
            if (num === undefined) {
                num = 0;
            }

            num++;
            m.set(idx, num);
        }

        for (const e of g.edges) {
            incrementMap(inDegreeMap, e.srcId);
            incrementMap(outDegreeMap, e.dstId);
            incrementMap(degreeMap, e.srcId);
            incrementMap(degreeMap, e.dstId);
        }

        for (const n of g.nodes) {
            this.addNodeResult(n.id, {
                inDegree: inDegreeMap.get(n.id) ?? 0,
                outDegree: outDegreeMap.get(n.id) ?? 0,
                total: degreeMap.get(n.id) ?? 0,
            });
        }
    }
}
