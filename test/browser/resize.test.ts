import {expect, test} from "vitest";
import {page} from "@vitest/browser/context";

import "../../src/graphty-element";

test("canvas resizes when container element dimensions change", async () => {
    // Create a container with initial dimensions
    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "600px";
    container.style.position = "relative";
    document.body.appendChild(container);

    // Create graphty-element
    const graphtyElement = document.createElement("graphty-element") as HTMLElement & {
        graph: {
            engine: {resize: () => void};
            addNodes: (nodes: Array<{id: string}>) => Promise<void>;
            addEdges: (edges: Array<{src: string; dst: string}>) => Promise<void>;
        };
    };
    graphtyElement.style.width = "100%";
    graphtyElement.style.height = "100%";
    graphtyElement.style.display = "block";
    container.appendChild(graphtyElement);

    // Wait for element to be connected and initialized
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Add some test data
    await graphtyElement.graph.addNodes([
        {id: "1"},
        {id: "2"},
        {id: "3"},
    ]);
    await graphtyElement.graph.addEdges([
        {src: "1", dst: "2"},
        {src: "2", dst: "3"},
    ]);

    // Wait for initial render
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get the canvas element - it's in the shadow root
    const canvas = graphtyElement.shadowRoot?.querySelector("canvas");
    expect(canvas).toBeTruthy();

    if (!canvas) {
        throw new Error("Canvas not found");
    }

    // Check initial canvas dimensions match container
    const initialCanvasRect = canvas.getBoundingClientRect();
    const initialContainerRect = graphtyElement.getBoundingClientRect();

    // Canvas should fill the graphty-element container (allow 5px tolerance for rounding)
    expect(Math.abs(initialCanvasRect.width - initialContainerRect.width)).toBeLessThan(5);
    expect(Math.abs(initialCanvasRect.height - initialContainerRect.height)).toBeLessThan(5);

    // Change container size
    container.style.width = "1200px";
    container.style.height = "900px";

    // Wait for ResizeObserver to trigger and for resize to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check that canvas dimensions have updated
    const newCanvasRect = canvas.getBoundingClientRect();
    const newContainerRect = graphtyElement.getBoundingClientRect();

    // Canvas should still fill the graphty-element container after resize
    expect(Math.abs(newCanvasRect.width - newContainerRect.width)).toBeLessThan(5);
    expect(Math.abs(newCanvasRect.height - newContainerRect.height)).toBeLessThan(5);

    // Verify dimensions actually changed
    expect(newCanvasRect.width).toBeGreaterThan(initialCanvasRect.width);
    expect(newCanvasRect.height).toBeGreaterThan(initialCanvasRect.height);

    // Clean up
    document.body.removeChild(container);
});

test("canvas resizes in flexbox layout", async () => {
    // Create a flexbox container
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.width = "100vw";
    container.style.height = "100vh";
    document.body.appendChild(container);

    // Add a header
    const header = document.createElement("div");
    header.style.height = "50px";
    header.style.flexShrink = "0";
    container.appendChild(header);

    // Add graphty-element that should flex to fill remaining space
    const graphtyElement = document.createElement("graphty-element") as HTMLElement & {
        graph: {
            addNodes: (nodes: Array<{id: string}>) => Promise<void>;
            addEdges: (edges: Array<{src: string; dst: string}>) => Promise<void>;
        };
    };
    graphtyElement.style.flex = "1";
    graphtyElement.style.minHeight = "0";
    container.appendChild(graphtyElement);

    // Wait for element to be connected and initialized
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Add some test data
    await graphtyElement.graph.addNodes([
        {id: "1"},
        {id: "2"},
    ]);
    await graphtyElement.graph.addEdges([
        {src: "1", dst: "2"},
    ]);

    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the canvas element
    const canvas = graphtyElement.shadowRoot?.querySelector("canvas") ??
        graphtyElement.querySelector("canvas");
    expect(canvas).toBeTruthy();

    if (!canvas) {
        throw new Error("Canvas not found");
    }

    // Check that canvas fills the available space (viewport height minus header)
    const canvasRect = canvas.getBoundingClientRect();
    const graphtyRect = graphtyElement.getBoundingClientRect();

    // Canvas should fill the graphty-element
    expect(Math.abs(canvasRect.width - graphtyRect.width)).toBeLessThan(2);
    expect(Math.abs(canvasRect.height - graphtyRect.height)).toBeLessThan(2);

    // graphty-element should fill remaining space after header
    const viewportHeight = window.innerHeight;
    expect(Math.abs(graphtyRect.height - (viewportHeight - 50))).toBeLessThan(2);

    // Change header height
    header.style.height = "100px";

    // Wait for layout and ResizeObserver
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Check that canvas adjusted to new available space
    const newCanvasRect = canvas.getBoundingClientRect();
    const newGraphtyRect = graphtyElement.getBoundingClientRect();

    expect(Math.abs(newCanvasRect.width - newGraphtyRect.width)).toBeLessThan(2);
    expect(Math.abs(newCanvasRect.height - newGraphtyRect.height)).toBeLessThan(2);
    expect(Math.abs(newGraphtyRect.height - (viewportHeight - 100))).toBeLessThan(2);

    // Canvas height should have decreased
    expect(newCanvasRect.height).toBeLessThan(canvasRect.height);

    // Clean up
    document.body.removeChild(container);
});
