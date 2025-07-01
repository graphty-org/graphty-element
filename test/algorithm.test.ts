import {assert, describe, it} from "vitest";

import {DegreeAlgorithm} from "../src/algorithms/DegreeAlgorithm";
import {AdHocData} from "../src/config";

interface MockGraphOpts {
    dataPath?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mockGraph(opts: MockGraphOpts = {}): Promise<any> {
    const fakeGraph = {
        nodes: new Map<string | number, AdHocData>(),
        edges: new Map<string | number, AdHocData>(),
    };
    if (typeof opts.dataPath === "string") {
        const imp = await import(opts.dataPath);
        fakeGraph.nodes = new Map(imp.nodes.map((n: AdHocData) => [n.id, n]));
        fakeGraph.edges = new Map(imp.edges.map((e: AdHocData) => [`${e.srcId}:${e.dstId}`, e]));
    }

    return fakeGraph;
}

describe("DegreeAlgorithm", () => {
    it("exists", async() => {
        new DegreeAlgorithm(await mockGraph());
    });

    it("calculates node degree", async() => {
        const fakeGraph = await mockGraph({dataPath: "./helpers/data4.json"});
        const da = new DegreeAlgorithm(fakeGraph);

        await da.run();

        const expectedResult = {
            graphty: {
                degree: {
                    inDegree: 1,
                    outDegree: 2,
                    degree: 3,
                    inDegreePct: 1 / 10,
                    outDegreePct: 2 / 32,
                    degreePct: 3 / 36,
                },
            },
        };

        assert.deepStrictEqual(fakeGraph.nodes.get("Mlle.Baptistine").algorithmResults, expectedResult);
    });
});
