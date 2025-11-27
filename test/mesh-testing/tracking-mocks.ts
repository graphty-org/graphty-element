/**
 * Tracking Mock System for Mesh Testing
 *
 * These mocks record all configuration and drawing operations to enable
 * precise validation without requiring actual rendering or pixels.
 */

import {Color3, Vector3} from "@babylonjs/core";

// Configuration tracking interface
export interface ConfigurationRecord {
    method: string;
    args: unknown[];
    timestamp: number;
}

// Drawing operation interface
export interface DrawingOperation {
    type: string;
    [key: string]: unknown;
}

// Canvas context state interface
export interface CanvasContextState {
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
    font: string;
    textAlign: CanvasTextAlign;
    textBaseline: CanvasTextBaseline;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
}

/**
 * TrackingMockMesh - Records all mesh configuration operations
 */
export class TrackingMockMesh {
    public name: string;
    public configurations: ConfigurationRecord[] = [];

    // Babylon.js mesh properties
    public position = new Vector3(0, 0, 0);
    public scaling = new Vector3(1, 1, 1);
    public rotation = new Vector3(0, 0, 0);
    public material: TrackingMockMaterial | null = null;
    public metadata: Record<string, unknown> = {};
    public billboardMode = 0;
    public isVisible = true;
    public visibility = 1;
    public parent: TrackingMockMesh | null = null;
    public id: string;

    constructor(name: string) {
        this.name = name;
        this.id = `mesh-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        this._record("constructor", [name]);
    }

    private _record(method: string, args: unknown[]): void {
        this.configurations.push({
            method,
            args: JSON.parse(JSON.stringify(args)), // Deep clone to prevent mutations
            timestamp: Date.now(),
        });
    }

    // Position methods
    setPosition(x: number, y: number, z: number): void {
        this._record("setPosition", [x, y, z]);
        this.position.set(x, y, z);
    }

    setAbsolutePosition(position: Vector3): void {
        this._record("setAbsolutePosition", [position.x, position.y, position.z]);
        this.position.copyFrom(position);
    }

    // Scaling methods
    setScaling(x: number, y: number, z: number): void {
        this._record("setScaling", [x, y, z]);
        this.scaling.set(x, y, z);
    }

    // Rotation methods
    setRotation(x: number, y: number, z: number): void {
        this._record("setRotation", [x, y, z]);
        this.rotation.set(x, y, z);
    }

    // Material assignment
    setMaterial(material: TrackingMockMaterial | null): void {
        this._record("setMaterial", [material?.name ?? null]);
        this.material = material;
    }

    // Billboard mode
    setBillboardMode(mode: number): void {
        this._record("setBillboardMode", [mode]);
        this.billboardMode = mode;
    }

    // Visibility
    setEnabled(enabled: boolean): void {
        this._record("setEnabled", [enabled]);
        this.isVisible = enabled;
    }

    // Metadata
    setMetadata(key: string, value: unknown): void {
        this._record("setMetadata", [key, value]);
        this.metadata[key] = value;
    }

    // Parent relationship
    setParent(parent: TrackingMockMesh | null): void {
        this._record("setParent", [parent?.name ?? null]);
        this.parent = parent;
    }

    // Disposal
    dispose(): void {
        this._record("dispose", []);
        this.material = null;
        this.parent = null;
    }

    // Query methods
    getConfigurationHistory(): ConfigurationRecord[] {
        return [... this.configurations];
    }

    findConfigurations(method: string): ConfigurationRecord[] {
        return this.configurations.filter((c) => c.method === method);
    }

    getLastConfiguration(method: string): ConfigurationRecord | undefined {
        const configs = this.findConfigurations(method);
        return configs[configs.length - 1];
    }

    // Validation helpers
    wasMethodCalled(method: string): boolean {
        return this.configurations.some((c) => c.method === method);
    }

    getMethodCallCount(method: string): number {
        return this.configurations.filter((c) => c.method === method).length;
    }
}

/**
 * TrackingMockMaterial - Records all material configuration operations
 */
export class TrackingMockMaterial {
    public name: string;
    public configurations: ConfigurationRecord[] = [];
    public metadata: Record<string, unknown> = {};

    // Babylon.js material properties
    public diffuseTexture: TrackingMockTexture | null = null;
    public emissiveTexture: TrackingMockTexture | null = null;
    public alpha = 1.0;
    public hasAlpha = false;
    public diffuseColor = new Color3(1, 1, 1);
    public emissiveColor = new Color3(0, 0, 0);
    public backFaceCulling = true;
    public wireframe = false;
    public id: string;

    constructor(name: string) {
        this.name = name;
        this.id = `material-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        this._record("constructor", [name]);
    }

    private _record(method: string, args: unknown[]): void {
        this.configurations.push({
            method,
            args: JSON.parse(JSON.stringify(args)),
            timestamp: Date.now(),
        });
    }

    // Texture methods
    setDiffuseTexture(texture: TrackingMockTexture | null): void {
        this._record("setDiffuseTexture", [texture?.name ?? null]);
        this.diffuseTexture = texture;
    }

    setEmissiveTexture(texture: TrackingMockTexture | null): void {
        this._record("setEmissiveTexture", [texture?.name ?? null]);
        this.emissiveTexture = texture;
    }

    // Alpha methods
    setAlpha(alpha: number): void {
        this._record("setAlpha", [alpha]);
        this.alpha = Math.max(0, Math.min(1, alpha));
        this.hasAlpha = this.alpha < 1.0;
    }

    // Color methods
    setDiffuseColor(color: Color3): void {
        this._record("setDiffuseColor", [color.r, color.g, color.b]);
        this.diffuseColor = color.clone();
    }

    setEmissiveColor(color: Color3): void {
        this._record("setEmissiveColor", [color.r, color.g, color.b]);
        this.emissiveColor = color.clone();
    }

    // Rendering properties
    setBackFaceCulling(enabled: boolean): void {
        this._record("setBackFaceCulling", [enabled]);
        this.backFaceCulling = enabled;
    }

    setWireframe(enabled: boolean): void {
        this._record("setWireframe", [enabled]);
        this.wireframe = enabled;
    }

    // Metadata
    setMetadata(key: string, value: unknown): void {
        this._record("setMetadata", [key, value]);
        this.metadata[key] = value;
    }

    // Disposal
    dispose(): void {
        this._record("dispose", []);
        this.diffuseTexture = null;
        this.emissiveTexture = null;
    }

    // Query methods
    getConfigurationHistory(): ConfigurationRecord[] {
        return [... this.configurations];
    }

    findConfigurations(method: string): ConfigurationRecord[] {
        return this.configurations.filter((c) => c.method === method);
    }

    wasMethodCalled(method: string): boolean {
        return this.configurations.some((c) => c.method === method);
    }

    getMethodCallCount(method: string): number {
        return this.configurations.filter((c) => c.method === method).length;
    }
}

/**
 * TrackingMockTexture - Records all texture and canvas drawing operations
 */
export class TrackingMockTexture {
    public name: string;
    public width: number;
    public height: number;
    public configurations: ConfigurationRecord[] = [];
    public drawingOperations: DrawingOperation[] = [];
    public id: string;

    private _contextState: CanvasContextState = {
        fillStyle: "#000000",
        strokeStyle: "#000000",
        lineWidth: 1,
        font: "10px sans-serif",
        textAlign: "start",
        textBaseline: "alphabetic",
        shadowColor: "rgba(0, 0, 0, 0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    };

    constructor(name: string, width: number, height: number) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.id = `texture-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        this._record("constructor", [name, width, height]);
    }

    private _record(method: string, args: unknown[]): void {
        this.configurations.push({
            method,
            args: JSON.parse(JSON.stringify(args)),
            timestamp: Date.now(),
        });
    }

    private _recordDrawing(operation: DrawingOperation): void {
        this.drawingOperations.push({
            ... operation,
            timestamp: Date.now(),
            contextState: {... this._contextState},
        });
    }

    // Size methods
    getSize(): {width: number, height: number} {
        return {width: this.width, height: this.height};
    }

    resize(width: number, height: number): void {
        this._record("resize", [width, height]);
        this.width = width;
        this.height = height;
    }

    // Canvas context mock
    getContext(): CanvasRenderingContext2D {
        const contextState = this._contextState;
        const record = this._recordDrawing.bind(this);

        return {
            // State properties
            get fillStyle() {
                return contextState.fillStyle;
            },
            set fillStyle(value) {
                contextState.fillStyle = value;
            },

            get strokeStyle() {
                return contextState.strokeStyle;
            },
            set strokeStyle(value) {
                contextState.strokeStyle = value;
            },

            get lineWidth() {
                return contextState.lineWidth;
            },
            set lineWidth(value) {
                contextState.lineWidth = value;
            },

            get font() {
                return contextState.font;
            },
            set font(value) {
                contextState.font = value;
            },

            get textAlign() {
                return contextState.textAlign;
            },
            set textAlign(value) {
                contextState.textAlign = value;
            },

            get textBaseline() {
                return contextState.textBaseline;
            },
            set textBaseline(value) {
                contextState.textBaseline = value;
            },

            get shadowColor() {
                return contextState.shadowColor;
            },
            set shadowColor(value) {
                contextState.shadowColor = value;
            },

            get shadowBlur() {
                return contextState.shadowBlur;
            },
            set shadowBlur(value) {
                contextState.shadowBlur = value;
            },

            get shadowOffsetX() {
                return contextState.shadowOffsetX;
            },
            set shadowOffsetX(value) {
                contextState.shadowOffsetX = value;
            },

            get shadowOffsetY() {
                return contextState.shadowOffsetY;
            },
            set shadowOffsetY(value) {
                contextState.shadowOffsetY = value;
            },

            // Drawing methods
            fillRect(x: number, y: number, w: number, h: number): void {
                record({
                    type: "fillRect",
                    x, y, w, h,
                    fillStyle: contextState.fillStyle,
                });
            },

            strokeRect(x: number, y: number, w: number, h: number): void {
                record({
                    type: "strokeRect",
                    x, y, w, h,
                    strokeStyle: contextState.strokeStyle,
                    lineWidth: contextState.lineWidth,
                });
            },

            clearRect(x: number, y: number, w: number, h: number): void {
                record({
                    type: "clearRect",
                    x, y, w, h,
                });
            },

            fillText(text: string, x: number, y: number, maxWidth?: number): void {
                record({
                    type: "fillText",
                    text, x, y, maxWidth,
                    fillStyle: contextState.fillStyle,
                    font: contextState.font,
                });
            },

            strokeText(text: string, x: number, y: number, maxWidth?: number): void {
                record({
                    type: "strokeText",
                    text, x, y, maxWidth,
                    strokeStyle: contextState.strokeStyle,
                    lineWidth: contextState.lineWidth,
                    font: contextState.font,
                });
            },

            // Path methods
            beginPath(): void {
                record({type: "beginPath"});
            },

            closePath(): void {
                record({type: "closePath"});
            },

            moveTo(x: number, y: number): void {
                record({type: "moveTo", x, y});
            },

            lineTo(x: number, y: number): void {
                record({type: "lineTo", x, y});
            },

            arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
                record({
                    type: "arc",
                    x, y, radius, startAngle, endAngle, counterclockwise,
                });
            },

            quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
                record({
                    type: "quadraticCurveTo",
                    cpx, cpy, x, y,
                });
            },

            fill(fillRule?: CanvasFillRule): void {
                record({
                    type: "fill",
                    fillRule,
                    fillStyle: contextState.fillStyle,
                });
            },

            stroke(): void {
                record({
                    type: "stroke",
                    strokeStyle: contextState.strokeStyle,
                    lineWidth: contextState.lineWidth,
                });
            },

            // State methods
            save(): void {
                record({type: "save"});
            },

            restore(): void {
                record({type: "restore"});
            },

            // Measurement methods
            measureText(text: string): TextMetrics {
                // Simple mock implementation
                const fontSize = parseInt(contextState.font);
                const width = text.length * (isNaN(fontSize) ? 10 : fontSize) * 0.6;
                return {
                    width,
                    actualBoundingBoxLeft: 0,
                    actualBoundingBoxRight: width,
                    actualBoundingBoxAscent: isNaN(fontSize) ? 10 : fontSize,
                    actualBoundingBoxDescent: 0,
                    fontBoundingBoxAscent: isNaN(fontSize) ? 10 : fontSize,
                    fontBoundingBoxDescent: 0,
                    alphabeticBaseline: 0,
                    emHeightAscent: isNaN(fontSize) ? 10 : fontSize,
                    emHeightDescent: 0,
                    hangingBaseline: 0,
                    ideographicBaseline: 0,
                } as TextMetrics;
            },
        } as CanvasRenderingContext2D;
    }

    // Update method
    update(): void {
        this._record("update", []);
    }

    // Disposal
    dispose(): void {
        this._record("dispose", []);
        this.drawingOperations = [];
    }

    // Analysis methods
    analyzeDrawingOperations(): {
        totalOperations: number;
        operationTypes: Record<string, number>;
        fillColors: Set<string>;
        strokeColors: Set<string>;
        texts: string[];
        rectangles: {
            x: number;
            y: number;
            width: number;
            height: number;
            color: string;
            lineWidth?: number;
        }[];
    } {
        const analysis = {
            totalOperations: this.drawingOperations.length,
            operationTypes: {} as Record<string, number>,
            fillColors: new Set<string>(),
            strokeColors: new Set<string>(),
            texts: [] as string[],
            rectangles: [] as {
                x: number;
                y: number;
                width: number;
                height: number;
                color: string;
                lineWidth?: number;
            }[],
        };

        this.drawingOperations.forEach((op) => {
            analysis.operationTypes[op.type] = (analysis.operationTypes[op.type] || 0) + 1;

            if (op.fillStyle && typeof op.fillStyle === "string") {
                analysis.fillColors.add(op.fillStyle);
            }

            if (op.strokeStyle && typeof op.strokeStyle === "string") {
                analysis.strokeColors.add(op.strokeStyle);
            }

            if (op.type === "fillText" || op.type === "strokeText") {
                analysis.texts.push(op.text as string);
            }

            if (op.type === "strokeRect") {
                analysis.rectangles.push({
                    x: op.x as number,
                    y: op.y as number,
                    width: op.w as number,
                    height: op.h as number,
                    color: op.strokeStyle as string,
                    lineWidth: op.lineWidth as number | undefined,
                });
            }
        });

        return analysis;
    }

    // Query methods
    getDrawingOperations(type: string): DrawingOperation[] {
        return this.drawingOperations.filter((op) => op.type === type);
    }

    getLastDrawingOperation(type: string): DrawingOperation | undefined {
        const ops = this.getDrawingOperations(type);
        return ops[ops.length - 1];
    }

    // Query methods (similar to TrackingMockMesh)
    wasMethodCalled(method: string): boolean {
        return this.configurations.some((c) => c.method === method);
    }

    getMethodCallCount(method: string): number {
        return this.configurations.filter((c) => c.method === method).length;
    }
}
