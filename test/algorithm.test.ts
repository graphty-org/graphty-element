import {assert, describe, it} from "vitest";

import {DegreeAlgorithm} from "../src/algorithms/DegreeAlgorithm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mockGraph(opts: object | string): Promise<any> {
    if (typeof opts === "string") {
        return await import(opts);
    }

    return opts;
}

describe("DegreeAlgorithm", () => {
    it("exists", () => {
        new DegreeAlgorithm();
    });

    it("calculates node degree", async() => {
        const da = new DegreeAlgorithm();
        const data = await mockGraph("./helpers/data4.json");

        await da.run(data);

        const expectedResult = {
            graphty: {
                degree: {
                    inDegree: 1,
                    outDegree: 2,
                    total: 3,
                },
            },
        };

        assert.deepStrictEqual(da.results.node["Mlle.Baptistine"], expectedResult);
    });
});
