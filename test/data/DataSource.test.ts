import {assert, describe, test} from "vitest";

import {type BaseDataSourceConfig, DataSource, DataSourceChunk} from "../../src/data/DataSource.js";

// Create a minimal test implementation
class TestDataSource extends DataSource {
    static type = "test";
    private config: BaseDataSourceConfig;
    private testNodes: unknown[] = [{id: "n1"}, {id: "n2"}];
    private testEdges: unknown[] = [{src: "n1", dst: "n2"}];

    constructor(config: BaseDataSourceConfig) {
        super(config.errorLimit ?? 100, config.chunkSize);
        this.config = config;
    }

    protected getConfig(): BaseDataSourceConfig {
        return this.config;
    }

    // Test helper to set data for chunking tests
    setTestData(nodes: unknown[], edges: unknown[]): void {
        this.testNodes = nodes;
        this.testEdges = edges;
    }

    // Public accessor for testing protected getContent method
    async testGetContent(): Promise<string> {
        return await this.getContent();
    }

    async *sourceFetchData(): AsyncGenerator<DataSourceChunk> {
        await this.getContent();
        yield* this.chunkData(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.testNodes as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.testEdges as any,
        );
    }
}

describe("DataSource base class", () => {
    describe("getContent()", () => {
        test("loads from inline data string", async() => {
            const source = new TestDataSource({data: "test content"});
            const content = await source.testGetContent();
            assert.strictEqual(content, "test content");
        });

        test("throws when no input provided", async() => {
            const source = new TestDataSource({});
            let errorThrown = false;
            try {
                await source.testGetContent();
            } catch (error) {
                errorThrown = true;
                assert.match((error as Error).message, /DataSource requires data, file, or url/);
            }
            assert.strictEqual(errorThrown, true, "Expected error to be thrown");
        });

        // TODO: Add file and URL tests after implementing retry logic
    });

    describe("chunkData()", () => {
        test("chunks large node arrays", async() => {
            const nodes = Array.from({length: 2500}, (_, i) => ({id: `n${i}`}));
            const edges = [{src: "n0", dst: "n1"}];

            const source = new TestDataSource({data: "", chunkSize: 1000});
            source.setTestData(nodes, edges);

            const chunks = [];
            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks.length, 3);
            assert.strictEqual(chunks[0].nodes.length, 1000);
            assert.strictEqual(chunks[0].edges.length, 1); // Edges in first chunk
            assert.strictEqual(chunks[1].edges.length, 0); // No edges in subsequent chunks
        });

        test("yields edges-only chunk when no nodes", async() => {
            const source = new TestDataSource({data: "", chunkSize: 1000});
            source.setTestData([], [{src: "n1", dst: "n2"}]);

            const chunks = [];
            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks.length, 1);
            assert.strictEqual(chunks[0].nodes.length, 0);
            assert.strictEqual(chunks[0].edges.length, 1);
        });

        test("respects custom chunkSize", async() => {
            const nodes = Array.from({length: 150}, (_, i) => ({id: `n${i}`}));

            const source = new TestDataSource({data: "", chunkSize: 50});
            source.setTestData(nodes, []);

            const chunks = [];
            for await (const chunk of source.getData()) {
                chunks.push(chunk);
            }

            assert.strictEqual(chunks.length, 3);
        });
    });

    describe("DEFAULT_CHUNK_SIZE", () => {
        test("uses default chunk size when not specified", () => {
            const source = new TestDataSource({data: ""});
            // Access protected property for testing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            assert.strictEqual((source as any).chunkSize, 1000);
        });
    });
});
