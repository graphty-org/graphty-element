import {Algorithm} from "./Algorithm";

export class DegreeAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "degree";

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const inDegreeMap = new Map<number | string, number>();
        const outDegreeMap = new Map<number | string, number>();
        const degreeMap = new Map<number | string, number>();

        function incrementMap(m: Map<number | string, number>, idx: number | string): void {
            let num = m.get(idx); ;
            num ??= 0;

            num++;
            m.set(idx, num);
        }

        for (const e of g.getDataManager().edges.values()) {
            incrementMap(inDegreeMap, e.srcId);
            incrementMap(outDegreeMap, e.dstId);
            incrementMap(degreeMap, e.srcId);
            incrementMap(degreeMap, e.dstId);
        }

        const maxInDegree = Math.max(... inDegreeMap.values());
        const maxOutDegree = Math.max(... outDegreeMap.values());
        const maxDegree = Math.max(... degreeMap.values());

        for (const n of g.getDataManager().nodes.values()) {
            const inDegree = inDegreeMap.get(n.id) ?? 0;
            const outDegree = outDegreeMap.get(n.id) ?? 0;
            const degree = degreeMap.get(n.id) ?? 0;
            this.addNodeResult(n.id, "inDegree", inDegree);
            this.addNodeResult(n.id, "outDegree", outDegree);
            this.addNodeResult(n.id, "degree", degree);
            this.addNodeResult(n.id, "inDegreePct", inDegree / maxInDegree);
            this.addNodeResult(n.id, "outDegreePct", outDegree / maxOutDegree);
            this.addNodeResult(n.id, "degreePct", degree / maxDegree);
        }
    }
}
