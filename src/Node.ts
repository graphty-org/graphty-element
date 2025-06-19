import {
    AbstractMesh,
    ActionManager,
    Color3,
    DynamicTexture,
    ExecuteCodeAction,
    Mesh,
    MeshBuilder,
    SixDofDragBehavior,
    StandardMaterial,
} from "@babylonjs/core";
import type {Graph} from "./Graph";
import {NodeStyleConfig} from "./config";
import {NodeStyleId, Styles} from "./Styles";

const GOLDEN_RATIO = 1.618;

export type NodeIdType = string | number;

interface NodeOpts {
    pinOnDrag?: boolean;
}

export class Node {
    parentGraph: Graph;
    opts: NodeOpts;
    id: NodeIdType;
    data: Record<string | number, unknown>;
    mesh: AbstractMesh;
    label?: Mesh;
    meshDragBehavior!: SixDofDragBehavior;
    dragging = false;
    styleId: NodeStyleId;
    pinOnDrag!: boolean;

    constructor(graph: Graph, nodeId: NodeIdType, styleId: NodeStyleId, data: Record<string | number, unknown>, opts: NodeOpts = {}) {
        this.parentGraph = graph;
        this.id = nodeId;
        this.data = data;
        this.opts = opts;

        // copy nodeMeshOpts
        this.styleId = styleId;

        // create graph node
        this.parentGraph.layoutEngine.addNode(this);

        // create mesh
        this.mesh = Node.defaultNodeMeshFactory(this, this.parentGraph, styleId);
    }

    update(): void {
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
        return g.meshCache.get(`node-style-${styleId}`, () => {
            const o = Styles.getStyleForNodeStyleId(styleId);
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
            if (o.texture && o.texture.color) {
                if (typeof o.texture.color === "string"){
                    // const color = Color4.FromHexString(o.texture.color);
                    // const color3 = new Color3(color.r, color.g, color.b);
                    color3 = Color3.FromHexString(o.texture.color);
                }
            }

            mat.wireframe = o?.effect?.wireframe ?? false;
            if (color3 && g.config.layout.dimensions === 3) {
                mat.diffuseColor = color3;
            } else if (color3) {
                mat.disableLighting = true;
                mat.emissiveColor = color3;
            }

            mat.freeze();

            // set opacity
            if (o.texture && o.texture.color && typeof o.texture.color === "object" && typeof o.texture.color.opacity === "number") {
                mesh.visibility = o.texture.color.opacity;
            }

            mesh.visibility = 1;
            mesh.material = mat;
            n.mesh = mesh;

            // create label
            if (o.label && o.label.enabled) {
                n.label = Node.createLabel(n.id.toString(), n, n.parentGraph);
                n.label.parent = n.mesh;
                n.label.position.y += 1;
            }

            Node.addDefaultBehaviors(n, n.opts);

            return mesh;
        });
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

    static createLabel(text: string, _n: Node, g: Graph): Mesh {
        // adapted from: https://playground.babylonjs.com/#TMHF80

        // Set font
        const fontSize = 48;
        // var font = "bold " + font_size + "px Arial";
        const font = `${fontSize}px Arial`;

        // Set height for plane
        const planeHeight = 0.5;

        // Set height for dynamic texture
        const DTHeight = 1.5 * fontSize; // or set as wished

        // Calcultae ratio
        const ratio = planeHeight / DTHeight;

        // Use a temporay dynamic texture to calculate the length of the text on the dynamic texture canvas
        const temp = new DynamicTexture("DynamicTexture", 64, g.scene);
        const tmpctx = temp.getContext();
        tmpctx.font = font;
        const DTWidth = tmpctx.measureText(text).width + 8;

        // Calculate width the plane has to be
        const planeWidth = DTWidth * ratio;

        // Create dynamic texture and write the text
        const dynamicTexture = new DynamicTexture("DynamicTexture", {width: DTWidth, height: DTHeight}, g.scene, false);
        const mat = new StandardMaterial("mat", g.scene);
        mat.specularColor = Color3.Black();
        dynamicTexture.hasAlpha = true;

        // draw rounded rectangle for background
        // borrowed from https://github.com/BabylonJS/Babylon.js/blob/2a7bd37ec899846b7a02c0507b1b9e27e4293180/packages/dev/gui/src/2D/controls/rectangle.ts#L209
        const context = dynamicTexture.getContext();
        context.fillStyle = "white";
        context.beginPath();
        const x = 0;
        const y = 0;
        const radiusList = [20, 20, 20, 20];
        const width = DTWidth;
        const height = DTHeight;
        context.moveTo(x + radiusList[0], y);
        context.lineTo(x + width - radiusList[1], y);
        context.arc(x + width - radiusList[1], y + radiusList[1], radiusList[1], (3 * Math.PI) / 2, Math.PI * 2);
        context.lineTo(x + width, y + height - radiusList[2]);
        context.arc(x + width - radiusList[2], y + height - radiusList[2], radiusList[2], 0, Math.PI / 2);
        context.lineTo(x + radiusList[3], y + height);
        context.arc(x + radiusList[3], y + height - radiusList[3], radiusList[3], Math.PI / 2, Math.PI);
        context.lineTo(x, y + radiusList[0]);
        context.arc(x + radiusList[0], y + radiusList[0], radiusList[0], Math.PI, (3 * Math.PI) / 2);
        context.closePath();
        context.fill();

        // draw label text
        dynamicTexture.drawText(text, null, null, font, "#000000", "transparent", true);
        mat.opacityTexture = dynamicTexture; // TODO: might be able to just use a rounded rectangle as the opacity layer rather than a colored background?
        mat.emissiveTexture = dynamicTexture;
        mat.disableLighting = true;

        // Create plane and set dynamic texture as material
        const plane = MeshBuilder.CreatePlane("plane", {width: planeWidth, height: planeHeight}, g.scene);
        plane.material = mat;

        // make text always face the camera
        plane.billboardMode = 7;

        return plane;
    }

    static addDefaultBehaviors(n: Node, opts: NodeOpts) {
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
                        const nodeIds: Set<NodeIdType> = new Set();
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
