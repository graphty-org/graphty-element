import {
    AbstractMesh,
    ActionManager,
    Color3,
    ExecuteCodeAction,
    Mesh,
    MeshBuilder,
    SixDofDragBehavior,
    StandardMaterial,
} from "@babylonjs/core";
import jmespath from "jmespath";
import _ from "lodash";

import {CalculatedValue} from "./CalculatedValue";
import {ChangeManager} from "./ChangeManager";
import {AdHocData, NodeStyle, NodeStyleConfig} from "./config";
import {transformLegacyProperties} from "./config/RichTextStyle";
import type {Graph} from "./Graph";
import {RichTextLabel, RichTextLabelOptions} from "./RichTextLabel";
import {NodeStyleId, Styles} from "./Styles";

interface BorderConfig {
    width: number;
    color: string;
    spacing: number;
}

const GOLDEN_RATIO = 1.618;

export type NodeIdType = string | number;

interface NodeOpts {
    pinOnDrag?: boolean;
}

export class Node {
    parentGraph: Graph;
    opts: NodeOpts;
    id: NodeIdType;
    data: AdHocData<string | number>;
    algorithmResults: AdHocData;
    styleUpdates: AdHocData;
    mesh: AbstractMesh;
    label?: RichTextLabel;
    meshDragBehavior!: SixDofDragBehavior;
    dragging = false;
    styleId: NodeStyleId;
    pinOnDrag!: boolean;
    size!: number;
    changeManager: ChangeManager;

    constructor(graph: Graph, nodeId: NodeIdType, styleId: NodeStyleId, data: AdHocData<string | number>, opts: NodeOpts = {}) {
        this.parentGraph = graph;
        this.id = nodeId;
        this.opts = opts;
        this.changeManager = new ChangeManager();
        this.changeManager.loadCalculatedValues(this.parentGraph.styles.getCalculatedStylesForNode(data));
        this.data = this.changeManager.watch("data", data);
        this.algorithmResults = this.changeManager.watch("algorithmResults", {} as unknown as AdHocData);
        this.styleUpdates = this.changeManager.addData("style", {} as unknown as AdHocData, NodeStyle);

        // copy nodeMeshOpts
        this.styleId = styleId;

        // create graph node
        this.parentGraph.layoutEngine.addNode(this);

        // create mesh
        this.mesh = Node.defaultNodeMeshFactory(this, this.parentGraph, styleId);
    }

    addCalculatedStyle(cv: CalculatedValue): void {
        this.changeManager.addCalculatedValue(cv);
    }

    update(): void {
        const newStyleKeys = Object.keys(this.styleUpdates);
        if (newStyleKeys.length > 0) {
            let style = Styles.getStyleForNodeStyleId(this.styleId);
            style = _.defaultsDeep(this.styleUpdates, style);
            const styleId = Styles.getNodeIdForStyle(style);
            this.updateStyle(styleId);
            for (const key of newStyleKeys) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.styleUpdates[key];
            }
        }

        if (this.dragging) {
            return;
        }

        const pos = this.parentGraph.layoutEngine.getNodePosition(this);
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        if (pos.z) {
            this.mesh.position.z = pos.z;
        }
    }

    updateStyle(styleId: NodeStyleId): void {
        if (styleId === this.styleId) {
            return;
        }

        this.styleId = styleId;
        this.mesh.dispose();
        this.mesh = Node.defaultNodeMeshFactory(this, this.parentGraph, styleId);
    }

    pin(): void {
        this.parentGraph.layoutEngine.pin(this);
    }

    unpin(): void {
        this.parentGraph.layoutEngine.unpin(this);
    }

    static defaultNodeMeshFactory(n: Node, g: Graph, styleId: NodeStyleId): AbstractMesh {
        const o = Styles.getStyleForNodeStyleId(styleId);
        n.size = o.shape?.size ?? 0;

        n.mesh = g.meshCache.get(`node-style-${styleId}`, () => {
            let mesh: Mesh;

            if (!o.shape) {
                throw new TypeError("shape required to create mesh");
            }

            // create mesh shape
            switch (o.shape.type) {
                case "box":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/box
                    mesh = Node.createBox(n, g, o);
                    break;
                case "sphere":
                    mesh = Node.createSphere(n, g, o);
                    break;
                case "cylinder":
                    mesh = Node.createCylinder(n, g, o);
                    break;
                case "cone":
                    mesh = Node.createCone(n, g, o);
                    break;
                case "capsule":
                    mesh = Node.createCapsule(n, g, o);
                    break;
                    // Torus disabled because it breaks ray finding with arrowcaps whe
                    // the ray shoots right through the hole in the center of the torus
                    // case "torus":
                    //     mesh = Node.createTorus(n, g, o);
                    //     break;
                case "torus-knot":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/set/torus_knot
                    mesh = Node.createTorusKnot(n, g, o);
                    break;
                case "tetrahedron":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(0, n, g, o);
                    break;
                case "octahedron":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(1, n, g, o);
                    break;
                case "dodecahedron":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(2, n, g, o);
                    break;
                case "icosahedron":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(3, n, g, o);
                    break;
                case "rhombicuboctahedron":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(4, n, g, o);
                    break;
                case "triangular_prism":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(5, n, g, o);
                    break;
                case "pentagonal_prism":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(6, n, g, o);
                    break;
                case "hexagonal_prism":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(7, n, g, o);
                    break;
                case "square_pyramid":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(8, n, g, o);
                    break;
                case "pentagonal_pyramid":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(9, n, g, o);
                    break;
                case "triangular_dipyramid":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(10, n, g, o);
                    break;
                case "pentagonal_dipyramid":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(11, n, g, o);
                    break;
                case "elongated_square_dypyramid":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(12, n, g, o);
                    break;
                case "elongated_pentagonal_dipyramid":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(13, n, g, o);
                    break;
                case "elongated_pentagonal_cupola":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/polyhedra_by_numbers
                    mesh = Node.createPolyhedron(14, n, g, o);
                    break;
                case "goldberg":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/goldberg_poly
                    mesh = Node.createGoldberg(n, g, o);
                    break;
                case "icosphere":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/icosphere
                    mesh = Node.createIcoSphere(n, g, o);
                    break;
                case "geodesic":
                // https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/polyhedra/geodesic_poly
                    mesh = Node.createGeodesic(n, g, o);
                    break;
                // case "text":
                //     var fontData = await (await fetch("https://assets.babylonjs.com/fonts/Droid Sans_Regular.json")).json();
                //     mesh = MeshBuilder.CreateText("text", n.id, fontData, {
                //         size: 16,
                //         resolution: 64,
                //         depth: 10
                //     });
                default:
                    throw new TypeError(`unknown shape: ${o.shape.type}`);
            }

            // create mesh texture
            const mat = new StandardMaterial("defaultMaterial");
            let color3: Color3 | undefined;
            if (typeof o.texture?.color === "string") {
                // const color = Color4.FromHexString(o.texture.color);
                // const color3 = new Color3(color.r, color.g, color.b);
                color3 = Color3.FromHexString(o.texture.color);
            } else if (typeof o.texture?.color === "object") {
                switch (o.texture.color.colorType) {
                    case "solid":
                        color3 = Color3.FromHexString(o.texture.color.value ?? "##FFFFFF");
                        mesh.visibility = o.texture.color.opacity ?? 1;
                        break;
                        // TODO
                        // case "gradient":
                        // case "radial-gradient":
                    default:
                        throw new TypeError(`unknown advanced colorType ${o.texture.color.colorType}`);
                }
            }

            mat.wireframe = o.effect?.wireframe ?? false;
            if (color3 && o.shape.twoD !== true) {
                mat.diffuseColor = color3;
            } else if (color3) {
                mat.disableLighting = true;
                mat.emissiveColor = color3;
            }

            mat.freeze();

            mesh.material = mat;

            return mesh;
        });

        // create label
        if (o.label?.enabled) {
            n.label = Node.createLabel(n, o);
        }

        Node.addDefaultBehaviors(n, n.opts);

        return n.mesh;
    }

    static createBox(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateBox("box", {size: o.shape?.size ?? 1});
    }

    static createSphere(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateSphere("sphere", {diameter: o.shape?.size ?? 1});
    }

    static createCylinder(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateCylinder("cylinder", {height: o.shape?.size ?? 1 * GOLDEN_RATIO, diameter: o.shape?.size ?? 1});
    }

    static createCone(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateCylinder("cylinder", {height: o.shape?.size ?? 1 * GOLDEN_RATIO, diameterTop: 0, diameterBottom: o.shape?.size ?? 1});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createCapsule(_n: Node, _g: Graph, _o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateCapsule("capsule", {});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createTorus(_n: Node, _g: Graph, _o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateTorus("torus", {});
    }

    static createTorusKnot(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateTorusKnot("tk", {radius: o.shape?.size ?? 1 * 0.3, tube: o.shape?.size ?? 1 * 0.2, radialSegments: 128});
    }

    static createPolyhedron(type: number, _n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreatePolyhedron("polyhedron", {size: o.shape?.size ?? 1, type});
    }

    static createGoldberg(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateGoldberg("goldberg", {size: o.shape?.size ?? 1});
    }

    static createIcoSphere(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateIcoSphere("icosphere", {radius: o.shape?.size ?? 1 * 0.75});
    }

    static createGeodesic(_n: Node, _g: Graph, o: NodeStyleConfig): Mesh {
        return MeshBuilder.CreateGeodesic("geodesic", {size: o.shape?.size ?? 1});
    }

    static createLabel(n: Node, o: NodeStyleConfig): RichTextLabel {
        // Extract label text
        let labelText = n.id.toString();
        
        // Check if text is directly provided
        // Access the text property from the label style object
        const labelConfig = o.label as any;
        if (labelConfig?.text) {
            labelText = labelConfig.text;
        } else if (labelConfig?.textPath) {
            try {
                const result = jmespath.search(n.data, o.label.textPath);
                if (result !== null && result !== undefined) {
                    labelText = String(result);
                }
            } catch (e) {
                console.warn(`Failed to extract label text using textPath "${o.label.textPath}":`, e);
            }
        }

        // Transform legacy properties to new RichTextLabel properties
        const labelStyle = o.label ? transformLegacyProperties(o.label as Record<string, unknown>) : {};

        // Create RichTextLabelOptions from the style configuration
        // Start with basic required options
        const labelOptions: RichTextLabelOptions = {
            text: labelText,
            attachTo: n.mesh,
            attachPosition: Node.getAttachPosition(labelStyle.location ?? "top"),
            attachOffset: labelStyle.attachOffset ?? Node.getDefaultAttachOffset(labelStyle.location ?? "top"),
        };

        // Add defined properties from the label style
        if (labelStyle.font !== undefined) {
            labelOptions.font = labelStyle.font;
        }

        if (labelStyle.fontSize !== undefined) {
            labelOptions.fontSize = labelStyle.fontSize;
        }

        if (labelStyle.fontWeight !== undefined) {
            labelOptions.fontWeight = labelStyle.fontWeight;
        }

        if (labelStyle.lineHeight !== undefined) {
            labelOptions.lineHeight = labelStyle.lineHeight;
        }

        if (labelStyle.textColor !== undefined) {
            labelOptions.textColor = labelStyle.textColor;
        }

        if (labelStyle.backgroundColor !== undefined) {
            labelOptions.backgroundColor = Node.getBackgroundColor(labelStyle.backgroundColor);
        }

        if (labelStyle.borderWidth !== undefined) {
            labelOptions.borderWidth = labelStyle.borderWidth;
        }

        if (labelStyle.borderColor !== undefined) {
            labelOptions.borderColor = labelStyle.borderColor;
        }

        if (labelStyle.borders !== undefined) {
            labelOptions.borders = labelStyle.borders as BorderConfig[];
        }

        if (labelStyle.marginTop !== undefined) {
            labelOptions.marginTop = labelStyle.marginTop;
        }

        if (labelStyle.marginBottom !== undefined) {
            labelOptions.marginBottom = labelStyle.marginBottom;
        }

        if (labelStyle.marginLeft !== undefined) {
            labelOptions.marginLeft = labelStyle.marginLeft;
        }

        if (labelStyle.marginRight !== undefined) {
            labelOptions.marginRight = labelStyle.marginRight;
        }

        if (labelStyle.textAlign !== undefined) {
            labelOptions.textAlign = labelStyle.textAlign;
        }

        if (labelStyle.cornerRadius !== undefined) {
            labelOptions.cornerRadius = labelStyle.cornerRadius;
        }

        if (labelStyle.autoSize !== undefined) {
            labelOptions.autoSize = labelStyle.autoSize;
        }

        if (labelStyle.resolution !== undefined) {
            labelOptions.resolution = labelStyle.resolution;
        }

        if (labelStyle.billboardMode !== undefined) {
            labelOptions.billboardMode = labelStyle.billboardMode;
        }

        if (labelStyle.position !== undefined) {
            labelOptions.position = labelStyle.position;
        }

        if (labelStyle.attachOffset !== undefined) {
            labelOptions.attachOffset = labelStyle.attachOffset;
        }

        if (labelStyle.depthFadeEnabled !== undefined) {
            labelOptions.depthFadeEnabled = labelStyle.depthFadeEnabled;
        }

        if (labelStyle.depthFadeNear !== undefined) {
            labelOptions.depthFadeNear = labelStyle.depthFadeNear;
        }

        if (labelStyle.depthFadeFar !== undefined) {
            labelOptions.depthFadeFar = labelStyle.depthFadeFar;
        }

        if (labelStyle.textOutline !== undefined) {
            labelOptions.textOutline = labelStyle.textOutline;
        }

        if (labelStyle.textOutlineWidth !== undefined) {
            labelOptions.textOutlineWidth = labelStyle.textOutlineWidth;
        }

        if (labelStyle.textOutlineColor !== undefined) {
            labelOptions.textOutlineColor = labelStyle.textOutlineColor;
        }

        if (labelStyle.textOutlineJoin !== undefined) {
            labelOptions.textOutlineJoin = labelStyle.textOutlineJoin;
        }

        if (labelStyle.textShadow !== undefined) {
            labelOptions.textShadow = labelStyle.textShadow;
        }

        if (labelStyle.textShadowColor !== undefined) {
            labelOptions.textShadowColor = labelStyle.textShadowColor;
        }

        if (labelStyle.textShadowBlur !== undefined) {
            labelOptions.textShadowBlur = labelStyle.textShadowBlur;
        }

        if (labelStyle.textShadowOffsetX !== undefined) {
            labelOptions.textShadowOffsetX = labelStyle.textShadowOffsetX;
        }

        if (labelStyle.textShadowOffsetY !== undefined) {
            labelOptions.textShadowOffsetY = labelStyle.textShadowOffsetY;
        }

        if (labelStyle.backgroundPadding !== undefined) {
            labelOptions.backgroundPadding = labelStyle.backgroundPadding;
        }

        if (labelStyle.backgroundGradient !== undefined) {
            labelOptions.backgroundGradient = labelStyle.backgroundGradient;
        }

        if (labelStyle.backgroundGradientType !== undefined) {
            labelOptions.backgroundGradientType = labelStyle.backgroundGradientType;
        }

        if (labelStyle.backgroundGradientColors !== undefined) {
            labelOptions.backgroundGradientColors = labelStyle.backgroundGradientColors as string[];
        }

        if (labelStyle.backgroundGradientDirection !== undefined) {
            labelOptions.backgroundGradientDirection = labelStyle.backgroundGradientDirection;
        }

        if (labelStyle.pointer !== undefined) {
            labelOptions.pointer = labelStyle.pointer;
        }

        if (labelStyle.pointerDirection !== undefined) {
            labelOptions.pointerDirection = labelStyle.pointerDirection;
        }

        if (labelStyle.pointerWidth !== undefined) {
            labelOptions.pointerWidth = labelStyle.pointerWidth;
        }

        if (labelStyle.pointerHeight !== undefined) {
            labelOptions.pointerHeight = labelStyle.pointerHeight;
        }

        if (labelStyle.pointerOffset !== undefined) {
            labelOptions.pointerOffset = labelStyle.pointerOffset;
        }

        if (labelStyle.pointerCurve !== undefined) {
            labelOptions.pointerCurve = labelStyle.pointerCurve;
        }

        if (labelStyle.animation !== undefined) {
            labelOptions.animation = labelStyle.animation;
        }

        if (labelStyle.animationSpeed !== undefined) {
            labelOptions.animationSpeed = labelStyle.animationSpeed;
        }

        if (labelStyle.badge !== undefined) {
            labelOptions.badge = labelStyle.badge;
        }

        if (labelStyle.icon !== undefined) {
            labelOptions.icon = labelStyle.icon;
        }

        if (labelStyle.iconPosition !== undefined) {
            labelOptions.iconPosition = labelStyle.iconPosition;
        }

        if (labelStyle.progress !== undefined) {
            labelOptions.progress = labelStyle.progress;
        }

        if (labelStyle.smartOverflow !== undefined) {
            labelOptions.smartOverflow = labelStyle.smartOverflow;
        }

        if (labelStyle.maxNumber !== undefined) {
            labelOptions.maxNumber = labelStyle.maxNumber;
        }

        if (labelStyle.overflowSuffix !== undefined) {
            labelOptions.overflowSuffix = labelStyle.overflowSuffix;
        }
        
        if (labelStyle.attachOffset !== undefined) {
            labelOptions.attachOffset = labelStyle.attachOffset;
        }

        // Create and return the RichTextLabel
        const label = new RichTextLabel(n.parentGraph.scene, labelOptions);
        return label;
    }

    static getBackgroundColor(backgroundColor: unknown): string {
        if (typeof backgroundColor === "string") {
            return backgroundColor;
        }

        if (backgroundColor && typeof backgroundColor === "object" && "colorType" in backgroundColor) {
            const colorObj = backgroundColor as {colorType: string, value?: string};
            if (colorObj.colorType === "solid" && colorObj.value) {
                return colorObj.value;
            }
        }

        return "transparent";
    }

    static getAttachPosition(location: string): "top" | "top-left" | "top-right" | "left" | "center" | "right" | "bottom" | "bottom-left" | "bottom-right" {
        // Map TextLocation values to AttachPosition values
        switch (location) {
            case "automatic":
                return "top";
            case "top":
            case "top-left":
            case "top-right":
            case "left":
            case "center":
            case "right":
            case "bottom":
            case "bottom-left":
            case "bottom-right":
                return location;
            default:
                return "top";
        }
    }
    
    static getDefaultAttachOffset(location: string): number {
        // Return larger offsets for left/right positions to prevent overlap
        switch (location) {
            case "left":
            case "right":
                return 1.0; // Larger offset for horizontal positions
            case "center":
                return 0; // No offset for center
            default:
                return 0.5; // Standard offset for top/bottom positions
        }
    }

    static addDefaultBehaviors(n: Node, opts: NodeOpts): void {
        n.mesh.isPickable = true;

        // drag behavior
        n.pinOnDrag = opts.pinOnDrag ?? true;
        n.meshDragBehavior = new SixDofDragBehavior();
        n.mesh.addBehavior(n.meshDragBehavior);

        // drag started
        n.meshDragBehavior.onDragStartObservable.add(() => {
            // make sure the graph is running
            n.parentGraph.running = true;

            // don't let the graph engine update the node -- we are controlling it
            n.dragging = true;
        });

        // drag ended
        n.meshDragBehavior.onDragEndObservable.add(() => {
            // make sure the graph is running
            n.parentGraph.running = true;

            // pin after dragging is node
            if (n.pinOnDrag) {
                n.pin();
            }

            // the graph engine can have control of the node again
            n.dragging = false;
        });

        // position changed
        n.meshDragBehavior.onPositionChangedObservable.add((event) => {
            // make sure the graph is running
            n.parentGraph.running = true;

            // update the node position
            n.parentGraph.layoutEngine.setNodePosition(n, event.position);
        });

        // TODO: this apparently updates dragging objects faster and more fluidly
        // https://playground.babylonjs.com/#YEZPVT%23840
        // https://forum.babylonjs.com/t/expandable-lines/24681/12

        // click behavior
        n.mesh.actionManager = n.mesh.actionManager ?? new ActionManager(n.parentGraph.scene);
        // ActionManager.OnDoublePickTrigger
        // ActionManager.OnRightPickTrigger
        // ActionManager.OnCenterPickTrigger
        // ActionManager.OnLongPressTrigger
        if (n.parentGraph.fetchNodes && n.parentGraph.fetchEdges) {
            const {fetchNodes, fetchEdges} = n.parentGraph;
            n.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnDoublePickTrigger,
                        // trigger: ActionManager.OnLongPressTrigger,
                    },
                    () => {
                        // make sure the graph is running
                        n.parentGraph.running = true;

                        // fetch all edges for current node
                        // @ts-expect-error for some reason this is confusing window.Node with our Node
                        const edges = fetchEdges(n, n.parentGraph);

                        // create set of unique node ids
                        const nodeIds = new Set<NodeIdType>();
                        edges.forEach((e) => {
                            nodeIds.add(e.src);
                            nodeIds.add(e.dst);
                        });
                        nodeIds.delete(n.id);

                        // fetch all nodes from associated edges
                        const nodes = fetchNodes(nodeIds, n.parentGraph);

                        // add all the nodes and edges we collected
                        n.parentGraph.addNodes([... nodes]);
                        n.parentGraph.addEdges([... edges]);

                        // TODO: fetch and add secondary edges
                    },
                ),
            );
        }
    }
}
