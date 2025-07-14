import {assert} from "chai";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {Algorithm} from "../../src/algorithms/Algorithm";
import type {Graph} from "../../src/Graph";
import {AlgorithmManager} from "../../src/managers/AlgorithmManager";
import type {EventManager} from "../../src/managers/EventManager";

// Mock the Algorithm registry
vi.mock("../../src/algorithms/Algorithm", () => ({
    Algorithm: {
        get: vi.fn(),
    },
}));

describe("AlgorithmManager", () => {
    let algorithmManager: AlgorithmManager;
    let mockEventManager: EventManager;
    let mockGraph: Graph;
    let mockAlgorithm: {run: ReturnType<typeof vi.fn>};

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create mock event manager
        mockEventManager = {
            emitGraphError: vi.fn(),
            emitGraphEvent: vi.fn(),
        } as EventManager;

        // Create mock graph
        mockGraph = {
            id: "test-graph",
        } as Graph;

        // Create mock algorithm
        mockAlgorithm = {
            run: vi.fn().mockResolvedValue(undefined),
        };

        // Default Algorithm.get to return mock algorithm
        vi.mocked(Algorithm.get).mockReturnValue(mockAlgorithm);

        algorithmManager = new AlgorithmManager(mockEventManager, mockGraph);
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await algorithmManager.init();
            assert.isNotNull(algorithmManager);
        });

        it("should dispose without errors", () => {
            algorithmManager.dispose();
            assert.isNotNull(algorithmManager);
        });
    });

    describe("runAlgorithm", () => {
        it("should run a valid algorithm successfully", async() => {
            await algorithmManager.runAlgorithm("test", "algorithm");

            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            const {mock: {calls: algorithmRunCalls}} = mockAlgorithm.run;
            assert.equal(algorithmGetCalls.length, 1);
            assert.deepEqual(algorithmGetCalls[0], [mockGraph, "test", "algorithm"]);
            assert.equal(algorithmRunCalls.length, 1);
            assert.equal(algorithmRunCalls[0][0], mockGraph);
        });

        it("should handle algorithm not found", async() => {
            vi.mocked(Algorithm.get).mockReturnValue(null);

            await expect(
                algorithmManager.runAlgorithm("unknown", "algorithm"),
            ).rejects.toThrow(/algorithm not found: unknown:algorithm/);

            const {mock: {calls: errorCalls}} = vi.mocked(mockEventManager.emitGraphError);
            assert.equal(errorCalls.length, 1);
            const errorCall = errorCalls[0];
            assert.equal(errorCall[0], mockGraph);
            assert.match(errorCall[1].message, /algorithm not found/);
            assert.equal(errorCall[2], "algorithm");
        });

        it("should handle algorithm execution error", async() => {
            const error = new Error("Algorithm execution failed");
            mockAlgorithm.run.mockRejectedValue(error);

            await expect(
                algorithmManager.runAlgorithm("test", "algorithm"),
            ).rejects.toThrow(error);

            // Should emit error event
            const {mock: {calls: errorCalls}} = vi.mocked(mockEventManager.emitGraphError);
            assert.equal(errorCalls.length, 1);
            const errorCall = errorCalls[0];
            assert.equal(errorCall[0], mockGraph);
            assert.equal(errorCall[1], error);
            assert.equal(errorCall[2], "algorithm");
            assert.deepEqual(errorCall[3], {
                algorithm: "test:algorithm",
                component: "AlgorithmManager",
            });
        });

        it("should handle non-Error exceptions", async() => {
            mockAlgorithm.run.mockRejectedValue("string error");

            await expect(
                algorithmManager.runAlgorithm("test", "algorithm"),
            ).rejects.toThrow(/string error/);

            const {mock: {calls: errorCalls}} = vi.mocked(mockEventManager.emitGraphError);
            assert.equal(errorCalls.length, 1);
            const errorCall = errorCalls[0];
            assert.instanceOf(errorCall[1], Error);
            assert.equal(errorCall[1].message, "string error");
        });
    });

    describe("runAlgorithmsFromTemplate", () => {
        it("should run multiple algorithms successfully", async() => {
            const algorithms = ["algo1:type1", "algo2:type2", "algo3:type3"];

            await algorithmManager.runAlgorithmsFromTemplate(algorithms);

            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            const {mock: {calls: algorithmRunCalls}} = mockAlgorithm.run;
            const {mock: {calls: errorCalls}} = vi.mocked(mockEventManager.emitGraphError);
            assert.equal(algorithmGetCalls.length, 3);
            assert.equal(algorithmRunCalls.length, 3);
            assert.equal(errorCalls.length, 0);
        });

        it("should handle invalid algorithm name format", async() => {
            const algorithms = ["valid:algorithm", "invalid-format", "another:valid"];

            await expect(
                algorithmManager.runAlgorithmsFromTemplate(algorithms),
            ).rejects.toThrow(/1 algorithm\(s\) failed/);

            // Should still try to run valid algorithms
            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            assert.equal(algorithmGetCalls.length, 2); // Only valid ones

            // Should emit individual error for invalid format
            const errorCalls = vi.mocked(mockEventManager.emitGraphError).mock.calls;
            assert.isAtLeast(errorCalls.length, 1);
            assert.match(errorCalls[0][1].message, /invalid algorithm name format/);
        });

        it("should continue running algorithms after one fails", async() => {
            const algorithms = ["algo1:type1", "algo2:type2", "algo3:type3"];

            // Make the second algorithm fail
            let callCount = 0;
            mockAlgorithm.run.mockImplementation(() => {
                callCount++;
                if (callCount === 2) {
                    throw new Error("Algorithm 2 failed");
                }
                return Promise.resolve();
            });

            await expect(
                algorithmManager.runAlgorithmsFromTemplate(algorithms),
            ).rejects.toThrow(/1 algorithm\(s\) failed/);

            // Should run all algorithms even if one fails
            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            assert.equal(algorithmGetCalls.length, 3);
            const {mock: {calls: algorithmRunCalls}} = mockAlgorithm.run;
            assert.equal(algorithmRunCalls.length, 3);

            // Should emit individual error for failed algorithm plus summary error
            const individualErrors = vi.mocked(mockEventManager.emitGraphError).mock.calls.filter(
                (call) => call[3]?.algorithm === "algo2:type2",
            );
            assert.equal(individualErrors.length, 1);

            // Should also emit summary error
            const summaryErrors = vi.mocked(mockEventManager.emitGraphError).mock.calls.filter(
                (call) => call[3]?.errorCount === 1,
            );
            assert.equal(summaryErrors.length, 1);
        });

        it("should emit summary error when multiple algorithms fail", async() => {
            const algorithms = ["algo1:type1", "algo2:type2", "algo3:type3"];

            // Make all algorithms fail
            mockAlgorithm.run.mockRejectedValue(new Error("Algorithm failed"));

            await expect(
                algorithmManager.runAlgorithmsFromTemplate(algorithms),
            ).rejects.toThrow(/3 algorithm\(s\) failed/);

            // Should emit individual errors for each failure plus summary
            const errorCalls = vi.mocked(mockEventManager.emitGraphError).mock.calls;
            assert.isAtLeast(errorCalls.length, 4); // 3 individual + 1 summary

            // Check summary error
            const summaryError = errorCalls.find((call) => call[3]?.errorCount === 3);
            assert.isDefined(summaryError);
            assert.match(summaryError[1].message, /3 algorithm\(s\) failed/);
        });

        it("should handle empty algorithm list", async() => {
            await algorithmManager.runAlgorithmsFromTemplate([]);

            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            assert.equal(algorithmGetCalls.length, 0);
            assert.equal(vi.mocked(mockEventManager.emitGraphError).mock.calls.length, 0);
        });

        it("should handle algorithms with spaces in names", async() => {
            const algorithms = ["  algo1:type1  ", "algo2:type2"];

            await algorithmManager.runAlgorithmsFromTemplate(algorithms);

            // Should handle trimmed names correctly
            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            assert.equal(algorithmGetCalls.length, 2);
            assert.deepEqual(algorithmGetCalls[0], [mockGraph, "algo1", "type1"]);
        });
    });

    describe("hasAlgorithm", () => {
        it("should return true for existing algorithm", () => {
            vi.mocked(Algorithm.get).mockReturnValue(mockAlgorithm);

            const result = algorithmManager.hasAlgorithm("test", "algorithm");

            assert.isTrue(result);
            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            assert.equal(algorithmGetCalls.length, 1);
            assert.deepEqual(algorithmGetCalls[0], [mockGraph, "test", "algorithm"]);
        });

        it("should return false for non-existent algorithm", () => {
            vi.mocked(Algorithm.get).mockReturnValue(null);

            const result = algorithmManager.hasAlgorithm("unknown", "algorithm");

            assert.isFalse(result);
        });

        it("should handle exceptions from Algorithm.get", () => {
            vi.mocked(Algorithm.get).mockImplementation(() => {
                throw new Error("Registry error");
            });

            const result = algorithmManager.hasAlgorithm("test", "algorithm");

            assert.isFalse(result);
        });
    });

    describe("getAvailableAlgorithms", () => {
        it("should return empty array (current implementation)", () => {
            const algorithms = algorithmManager.getAvailableAlgorithms();

            assert.isArray(algorithms);
            assert.equal(algorithms.length, 0);
        });
    });

    describe("error handling", () => {
        it("should include component name in error events", async() => {
            mockAlgorithm.run.mockRejectedValue(new Error("Test error"));

            try {
                await algorithmManager.runAlgorithm("test", "algorithm");
            } catch {
                // Expected to throw
            }

            const errorCall = vi.mocked(mockEventManager.emitGraphError).mock.calls[0];
            assert.equal(errorCall[3].component, "AlgorithmManager");
        });

        it("should preserve original error messages", async() => {
            const originalError = new Error("Original error message");
            mockAlgorithm.run.mockRejectedValue(originalError);

            await expect(
                algorithmManager.runAlgorithm("test", "algorithm"),
            ).rejects.toThrow("Original error message");
        });
    });

    describe("integration scenarios", () => {
        it("should handle complex algorithm workflow", async() => {
            const algorithms = [
                "preprocessing:normalize",
                "layout:force",
                "analysis:centrality",
                "visualization:highlight",
            ];

            // Mock different behaviors for different algorithms
            vi.mocked(Algorithm.get).mockImplementation((graph, namespace, type) => {
                if (namespace === "layout" && type === "force") {
                    // Layout algorithm takes longer
                    return {
                        run: vi.fn().mockImplementation(() =>
                            new Promise((resolve) => setTimeout(resolve, 10)),
                        ),
                    };
                }

                return mockAlgorithm;
            });

            await algorithmManager.runAlgorithmsFromTemplate(algorithms);

            const {mock: {calls: algorithmGetCalls}} = vi.mocked(Algorithm.get);
            assert.equal(algorithmGetCalls.length, 4);
            // Verify all algorithms were called with correct parameters
            assert.deepEqual(algorithmGetCalls[0], [mockGraph, "preprocessing", "normalize"]);
            assert.deepEqual(vi.mocked(Algorithm.get).mock.calls[1], [mockGraph, "layout", "force"]);
            assert.deepEqual(vi.mocked(Algorithm.get).mock.calls[2], [mockGraph, "analysis", "centrality"]);
            assert.deepEqual(vi.mocked(Algorithm.get).mock.calls[3], [mockGraph, "visualization", "highlight"]);
        });

        it("should handle partial failures in complex workflow", async() => {
            const algorithms = [
                "step1:init",
                "step2:process",
                "step3:finalize",
            ];

            // Make middle step fail
            let callCount = 0;
            mockAlgorithm.run.mockImplementation(() => {
                callCount++;
                if (callCount === 2) {
                    throw new Error("Processing failed");
                }
                return Promise.resolve();
            });

            await expect(
                algorithmManager.runAlgorithmsFromTemplate(algorithms),
            ).rejects.toThrow(/1 algorithm\(s\) failed/);

            // All algorithms should still be attempted
            const {mock: {calls: algorithmRunCalls}} = mockAlgorithm.run;
            assert.equal(algorithmRunCalls.length, 3);
        });
    });
});
