/**
 * Simple Test to Validate Phase 1 Implementation
 */

import {describe, expect, test} from "vitest";

import {TrackingMockMaterial, TrackingMockMesh, TrackingMockTexture} from "./tracking-mocks";

describe("Phase 1 Validation Tests", () => {
    test("TrackingMockMesh - Basic functionality", () => {
        const mesh = new TrackingMockMesh("test-mesh");

        // Test basic properties
        expect(mesh.name).toBe("test-mesh");
        expect(mesh.id).toContain("mesh-");
        expect(mesh.configurations).toHaveLength(1); // constructor call

        // Test method tracking
        mesh.setScaling(2, 2, 2);
        mesh.setMetadata("shape", "sphere");

        expect(mesh.configurations).toHaveLength(3);
        expect(mesh.wasMethodCalled("setScaling")).toBe(true);
        expect(mesh.wasMethodCalled("setMetadata")).toBe(true);

        // Test state is maintained
        expect(mesh.scaling.x).toBe(2);
        expect(mesh.metadata.shape).toBe("sphere");

        // console.log("✅ TrackingMockMesh works correctly");
    });

    test("TrackingMockMaterial - Basic functionality", () => {
        const material = new TrackingMockMaterial("test-material");

        expect(material.name).toBe("test-material");
        expect(material.configurations).toHaveLength(1); // constructor

        // Test alpha setting
        material.setAlpha(0.5);
        expect(material.alpha).toBe(0.5);
        expect(material.hasAlpha).toBe(true);

        // Test wireframe
        material.setWireframe(true);
        expect(material.wireframe).toBe(true);

        // console.log("✅ TrackingMockMaterial works correctly");
    });

    test("TrackingMockTexture - Basic functionality", () => {
        const texture = new TrackingMockTexture("test-texture", 512, 256);

        expect(texture.name).toBe("test-texture");
        expect(texture.width).toBe(512);
        expect(texture.height).toBe(256);

        // Test canvas operations
        const ctx = texture.getContext();
        expect(ctx).toBeDefined();

        // Test drawing operations are recorded
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(0, 0, 100, 100);
        ctx.strokeStyle = "#00ff00";
        ctx.strokeRect(10, 10, 80, 80);

        const operations = texture.drawingOperations;
        expect(operations).toHaveLength(2);
        expect(operations[0].type).toBe("fillRect");
        expect(operations[1].type).toBe("strokeRect");

        // Test analysis
        const analysis = texture.analyzeDrawingOperations();
        expect(analysis.totalOperations).toBe(2);
        expect(analysis.fillColors.has("#ff0000")).toBe(true);
        expect(analysis.strokeColors.has("#00ff00")).toBe(true);

        // console.log("✅ TrackingMockTexture works correctly");
    });

    test("Integration - Complete mesh creation flow", () => {
        const mesh = new TrackingMockMesh("integration-test");
        const material = new TrackingMockMaterial("integration-material");
        const texture = new TrackingMockTexture("integration-texture", 256, 128);

        // Simulate label creation workflow
        mesh.setBillboardMode(7);
        mesh.setScaling(2.56, 1.28, 1);
        mesh.setMetadata("text", "Test Label");

        material.setEmissiveTexture(texture);
        material.setAlpha(0.9);

        mesh.setMaterial(material);

        // Draw on texture
        const ctx = texture.getContext();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = "#000000";
        ctx.fillText("Test Label", 128, 64);

        texture.update();

        // Validate the complete workflow was tracked
        expect(mesh.billboardMode).toBe(7);
        expect(mesh.material).toBe(material);
        expect(material.emissiveTexture).toBe(texture);
        expect(texture.drawingOperations).toHaveLength(2);
        expect(texture.wasMethodCalled("update")).toBe(true);

        // console.log("✅ Complete integration workflow works");
        // console.log("🎉 Phase 1 Implementation Validated!");
    });
});
