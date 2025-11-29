import {assert, describe, test} from "vitest";

import {CSVDataSource} from "../../src/data/CSVDataSource.js";

describe("CSVDataSource paired files", () => {
    test("throws clear error when nodeURL missing", async() => {
        const source = new CSVDataSource({
            edgeURL: "http://example.com/edges.csv",
            // nodeURL is missing
        });

        let errorThrown = false;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const chunk of source.getData()) {
                // Should not get here
                assert.fail("Should have thrown an error");
            }
        } catch (error) {
            errorThrown = true;
            assert.include(
                (error as Error).message,
                "parsePairedFiles requires both node and edge sources",
            );
        }

        assert.isTrue(errorThrown, "Should have thrown validation error");
    });

    test("throws clear error when edgeURL missing", async() => {
        const source = new CSVDataSource({
            nodeURL: "http://example.com/nodes.csv",
            // edgeURL is missing
        });

        let errorThrown = false;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const chunk of source.getData()) {
                // Should not get here
                assert.fail("Should have thrown an error");
            }
        } catch (error) {
            errorThrown = true;
            assert.include(
                (error as Error).message,
                "parsePairedFiles requires both node and edge sources",
            );
        }

        assert.isTrue(errorThrown, "Should have thrown validation error");
    });

    test("throws clear error when nodeFile missing but edgeFile provided", async() => {
        const blob = new Blob(["source,target\nn1,n2"], {type: "text/csv"});
        const file = new File([blob], "edges.csv");

        const source = new CSVDataSource({
            edgeFile: file,
            // nodeFile is missing
        });

        let errorThrown = false;
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for await (const chunk of source.getData()) {
                // Should not get here
                assert.fail("Should have thrown an error");
            }
        } catch (error) {
            errorThrown = true;
            assert.include(
                (error as Error).message,
                "parsePairedFiles requires both node and edge sources",
            );
        }

        assert.isTrue(errorThrown, "Should have thrown validation error");
    });

    test("processes paired files successfully when both provided", async() => {
        const nodeBlob = new Blob(["id,label\nn1,Node 1\nn2,Node 2"], {type: "text/csv"});
        const nodeFile = new File([nodeBlob], "nodes.csv");

        const edgeBlob = new Blob(["source,target\nn1,n2"], {type: "text/csv"});
        const edgeFile = new File([edgeBlob], "edges.csv");

        const source = new CSVDataSource({
            nodeFile,
            edgeFile,
        });

        const chunks = [];
        for await (const chunk of source.getData()) {
            chunks.push(chunk);
        }

        assert.strictEqual(chunks.length, 1);
        assert.strictEqual(chunks[0].nodes.length, 2);
        assert.strictEqual(chunks[0].edges.length, 1);
    });
});
