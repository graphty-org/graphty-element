/**
 * Test Graph Fixtures for LLM Regression Tests
 * @module test/ai/llm-regression/fixtures/test-graph-fixtures
 *
 * Shared test data fixtures used across LLM regression test files.
 * These fixtures provide consistent, realistic graph data for testing.
 */

import type {TestGraphFixture} from "../../../helpers/llm-regression-harness";

/**
 * Server network fixture with various node types and edge properties.
 * Represents a typical IT infrastructure graph.
 */
export const serverNetworkFixture: TestGraphFixture = {
    nodes: [
        {id: "1", data: {type: "server", name: "web-01", status: "online"}},
        {id: "2", data: {type: "server", name: "db-01", status: "online"}},
        {id: "3", data: {type: "database", name: "postgres", status: "online"}},
        {id: "4", data: {type: "client", name: "app-01", status: "offline"}},
    ],
    edges: [
        {source: "1", target: "2", data: {weight: 0.8, latency: 5}},
        {source: "2", target: "3", data: {weight: 1.0, latency: 2}},
        {source: "4", target: "1", data: {weight: 0.3, latency: 100}},
    ],
};

/**
 * Extended server network fixture with more nodes for testing scale.
 * Useful for testing pagination and limits.
 */
export const largeServerNetworkFixture: TestGraphFixture = {
    nodes: [
        {id: "1", data: {type: "server", name: "web-01", status: "online", region: "us-east"}},
        {id: "2", data: {type: "server", name: "web-02", status: "online", region: "us-west"}},
        {id: "3", data: {type: "server", name: "api-01", status: "online", region: "us-east"}},
        {id: "4", data: {type: "database", name: "postgres-01", status: "online", region: "us-east"}},
        {id: "5", data: {type: "database", name: "redis-01", status: "online", region: "us-east"}},
        {id: "6", data: {type: "database", name: "mongodb-01", status: "offline", region: "eu-west"}},
        {id: "7", data: {type: "client", name: "mobile-app", status: "online", region: "global"}},
        {id: "8", data: {type: "client", name: "web-app", status: "online", region: "global"}},
        {id: "9", data: {type: "loadbalancer", name: "lb-01", status: "online", region: "us-east"}},
        {id: "10", data: {type: "loadbalancer", name: "lb-02", status: "online", region: "us-west"}},
    ],
    edges: [
        {source: "9", target: "1", data: {weight: 1.0, latency: 1, type: "http"}},
        {source: "9", target: "2", data: {weight: 1.0, latency: 1, type: "http"}},
        {source: "1", target: "3", data: {weight: 0.8, latency: 5, type: "http"}},
        {source: "2", target: "3", data: {weight: 0.8, latency: 15, type: "http"}},
        {source: "3", target: "4", data: {weight: 1.0, latency: 2, type: "tcp"}},
        {source: "3", target: "5", data: {weight: 0.9, latency: 1, type: "tcp"}},
        {source: "3", target: "6", data: {weight: 0.5, latency: 50, type: "tcp"}},
        {source: "7", target: "9", data: {weight: 0.3, latency: 100, type: "https"}},
        {source: "8", target: "9", data: {weight: 0.7, latency: 20, type: "https"}},
    ],
};

/**
 * Simple graph fixture for basic tests.
 * Minimal graph with just 2 nodes and 1 edge.
 */
export const simpleGraphFixture: TestGraphFixture = {
    nodes: [
        {id: "a", data: {name: "Node A", value: 10}},
        {id: "b", data: {name: "Node B", value: 20}},
    ],
    edges: [
        {source: "a", target: "b", data: {weight: 0.5}},
    ],
};
