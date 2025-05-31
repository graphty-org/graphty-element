var ya = Object.defineProperty;
var ba = (e, t, n) => t in e ? ya(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var Z = (e, t, n) => (ba(e, typeof t != "symbol" ? t + "" : t, n), n);
import { SixDofDragBehavior as wa, ActionManager as Tr, ExecuteCodeAction as xa, StandardMaterial as Mr, Color4 as ka, Color3 as lt, MeshBuilder as Ce, DynamicTexture as Ir, Ray as Ea, Vector3 as Je, GreasedLineTools as Na, CreateGreasedLine as Zn, GreasedLineMeshWidthDistribution as $a, RawTexture as Cr, Engine as Gn, GreasedLineMeshColorMode as za, PerfCounter as ht, SceneInstrumentation as Ta, EngineInstrumentation as Ma, Observable as Ln, Scene as Ia, ArcRotateCamera as Ca, HemisphericLight as Sa, PhotoDome as Oa, WebXREnterExitUIButton as Pa } from "@babylonjs/core";
const Sr = 1.618;
let Pt = class ie {
  constructor(t, n, r = {}) {
    Z(this, "parentGraph");
    Z(this, "id");
    Z(this, "metadata");
    Z(this, "mesh");
    Z(this, "label");
    Z(this, "meshDragBehavior");
    Z(this, "dragging", !1);
    Z(this, "nodeMeshConfig");
    Z(this, "pinOnDrag");
    if (this.parentGraph = t, this.id = n, this.metadata = r.metadata ?? {}, this.nodeMeshConfig = this.parentGraph.config.style.node, this.parentGraph.graphEngine.addNode(this), this.mesh = this.nodeMeshConfig.nodeMeshFactory(this, this.parentGraph, this.nodeMeshConfig), this.mesh.isPickable = !0, this.mesh.metadata = { parentNode: this }, this.nodeMeshConfig.label && (this.label = ie.createLabel(this.id.toString(), this, this.parentGraph), this.label.parent = this.mesh, this.label.position.y += 1), this.pinOnDrag = r.pinOnDrag ?? !0, this.meshDragBehavior = new wa(), this.mesh.addBehavior(this.meshDragBehavior), this.meshDragBehavior.onDragStartObservable.add(() => {
      this.parentGraph.running = !0, this.dragging = !0;
    }), this.meshDragBehavior.onDragEndObservable.add(() => {
      this.parentGraph.running = !0, this.pinOnDrag && this.pin(), this.dragging = !1;
    }), this.meshDragBehavior.onPositionChangedObservable.add((i) => {
      this.parentGraph.running = !0, this.parentGraph.graphEngine.setNodePosition(this, i.position);
    }), this.mesh.actionManager = this.mesh.actionManager ?? new Tr(this.parentGraph.scene), this.parentGraph.fetchNodes && this.parentGraph.fetchEdges) {
      const { fetchNodes: i, fetchEdges: o } = this.parentGraph;
      this.mesh.actionManager.registerAction(
        new xa(
          {
            trigger: Tr.OnDoublePickTrigger
            // trigger: ActionManager.OnLongPressTrigger,
          },
          () => {
            this.parentGraph.running = !0;
            const a = o(this, this.parentGraph), u = /* @__PURE__ */ new Set();
            a.forEach((h) => {
              u.add(h.src), u.add(h.dst);
            }), u.delete(this.id), i(u, this.parentGraph).forEach((h) => this.parentGraph.addNode(h.id, h.metadata)), a.forEach((h) => this.parentGraph.addEdge(h.src, h.dst, h.metadata));
          }
        )
      );
    }
  }
  update() {
    if (this.dragging)
      return;
    this.parentGraph.nodeObservable.notifyObservers({ type: "node-update-before", node: this });
    const t = this.parentGraph.graphEngine.getNodePosition(this);
    this.mesh.position.x = t.x, this.mesh.position.y = t.y, t.z && (this.mesh.position.z = t.z), this.parentGraph.nodeObservable.notifyObservers({ type: "node-update-after", node: this });
  }
  pin() {
    this.parentGraph.graphEngine.pin(this);
  }
  unpin() {
    this.parentGraph.graphEngine.unpin(this);
  }
  static get list() {
    return Aa;
  }
  static create(t, n, r = {}) {
    const i = ie.list.get(n);
    if (i)
      return i;
    const o = new ie(t, n, r);
    return ie.list.set(n, o), o;
  }
  static defaultNodeMeshFactory(t, n, r) {
    return n.meshCache.get("default-mesh", () => {
      let i;
      switch (r.shape) {
        case "box":
          i = ie.createBox(t, n, r);
          break;
        case "sphere":
          i = ie.createSphere(t, n, r);
          break;
        case "cylinder":
          i = ie.createCylinder(t, n, r);
          break;
        case "cone":
          i = ie.createCone(t, n, r);
          break;
        case "capsule":
          i = ie.createCapsule(t, n, r);
          break;
        case "torus-knot":
          i = ie.createTorusKnot(t, n, r);
          break;
        case "tetrahedron":
          i = ie.createPolyhedron(0, t, n, r);
          break;
        case "octahedron":
          i = ie.createPolyhedron(1, t, n, r);
          break;
        case "dodecahedron":
          i = ie.createPolyhedron(2, t, n, r);
          break;
        case "icosahedron":
          i = ie.createPolyhedron(3, t, n, r);
          break;
        case "rhombicuboctahedron":
          i = ie.createPolyhedron(4, t, n, r);
          break;
        case "triangular_prism":
          i = ie.createPolyhedron(5, t, n, r);
          break;
        case "pentagonal_prism":
          i = ie.createPolyhedron(6, t, n, r);
          break;
        case "hexagonal_prism":
          i = ie.createPolyhedron(7, t, n, r);
          break;
        case "square_pyramid":
          i = ie.createPolyhedron(8, t, n, r);
          break;
        case "pentagonal_pyramid":
          i = ie.createPolyhedron(9, t, n, r);
          break;
        case "triangular_dipyramid":
          i = ie.createPolyhedron(10, t, n, r);
          break;
        case "pentagonal_dipyramid":
          i = ie.createPolyhedron(11, t, n, r);
          break;
        case "elongated_square_dypyramid":
          i = ie.createPolyhedron(12, t, n, r);
          break;
        case "elongated_pentagonal_dipyramid":
          i = ie.createPolyhedron(13, t, n, r);
          break;
        case "elongated_pentagonal_cupola":
          i = ie.createPolyhedron(14, t, n, r);
          break;
        case "goldberg":
          i = ie.createGoldberg(t, n, r);
          break;
        case "icosphere":
          i = ie.createIcoSphere(t, n, r);
          break;
        case "geodesic":
          i = ie.createGeodesic(t, n, r);
          break;
        default:
          throw new TypeError(`unknown shape: ${r.shape}`);
      }
      const o = new Mr("defaultMaterial"), a = ka.FromHexString(r.color);
      return o.diffuseColor = new lt(a.r, a.g, a.b), o.wireframe = r.wireframe, o.freeze(), i.visibility = a.a, i.visibility = 1, i.material = o, i;
    });
  }
  static createBox(t, n, r) {
    return Ce.CreateBox("box", { size: r.size });
  }
  static createSphere(t, n, r) {
    return Ce.CreateSphere("sphere", { diameter: r.size });
  }
  static createCylinder(t, n, r) {
    return Ce.CreateCylinder("cylinder", { height: r.size * Sr, diameter: r.size });
  }
  static createCone(t, n, r) {
    return Ce.CreateCylinder("cylinder", { height: r.size * Sr, diameterTop: 0, diameterBottom: r.size });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createCapsule(t, n, r) {
    return Ce.CreateCapsule("capsule", {});
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createTorus(t, n, r) {
    return Ce.CreateTorus("torus", {});
  }
  static createTorusKnot(t, n, r) {
    return Ce.CreateTorusKnot("tk", { radius: r.size * 0.3, tube: r.size * 0.2, radialSegments: 128 });
  }
  static createPolyhedron(t, n, r, i) {
    return Ce.CreatePolyhedron("polyhedron", { size: i.size, type: t });
  }
  static createGoldberg(t, n, r) {
    return Ce.CreateGoldberg("goldberg", { size: r.size });
  }
  static createIcoSphere(t, n, r) {
    return Ce.CreateIcoSphere("icosphere", { radius: r.size * 0.75 });
  }
  static createGeodesic(t, n, r) {
    return Ce.CreateGeodesic("geodesic", { size: r.size });
  }
  static createLabel(t, n, r) {
    const o = "48px Verdana", s = 0.006944444444444444, d = new Ir("DynamicTexture", 64, r.scene).getContext();
    d.font = o;
    const p = d.measureText(t).width + 8, y = p * s, w = new Ir("DynamicTexture", { width: p, height: 72 }, r.scene, !1), m = new Mr("mat", r.scene);
    m.specularColor = lt.Black(), w.hasAlpha = !0;
    const E = w.getContext();
    E.fillStyle = "white", E.beginPath();
    const k = 0, _ = 0, N = [20, 20, 20, 20], $ = p, T = 72;
    E.moveTo(k + N[0], _), E.lineTo(k + $ - N[1], _), E.arc(k + $ - N[1], _ + N[1], N[1], 3 * Math.PI / 2, Math.PI * 2), E.lineTo(k + $, _ + T - N[2]), E.arc(k + $ - N[2], _ + T - N[2], N[2], 0, Math.PI / 2), E.lineTo(k + N[3], _ + T), E.arc(k + N[3], _ + T - N[3], N[3], Math.PI / 2, Math.PI), E.lineTo(k, _ + N[0]), E.arc(k + N[0], _ + N[0], N[0], Math.PI, 3 * Math.PI / 2), E.closePath(), E.fill(), w.drawText(t, null, null, o, "#000000", "transparent", !0), m.opacityTexture = w, m.emissiveTexture = w, m.disableLighting = !0;
    const M = Ce.CreatePlane("plane", { width: y, height: 0.5 }, r.scene);
    return M.material = m, M.billboardMode = 7, M;
  }
};
const Aa = /* @__PURE__ */ new Map();
class Se {
  constructor(t, n, r, i = {}) {
    Z(this, "parentGraph");
    Z(this, "srcId");
    Z(this, "dstId");
    Z(this, "dstNode");
    Z(this, "srcNode");
    Z(this, "metadata");
    Z(this, "mesh");
    Z(this, "arrowMesh", null);
    Z(this, "edgeStyleConfig");
    // XXX: performance impact when not needed?
    Z(this, "ray");
    this.parentGraph = t, this.srcId = n, this.dstId = r, this.metadata = i.metadata ?? {};
    const o = Pt.list.get(n);
    if (!o)
      throw new Error(`Attempting to create edge '${n}->${r}', Node '${n}' hasn't been created yet.`);
    const a = Pt.list.get(r);
    if (!a)
      throw new Error(`Attempting to create edge '${n}->${r}', Node '${r}' hasn't been created yet.`);
    this.srcNode = o, this.dstNode = a, this.ray = new Ea(this.srcNode.mesh.position, this.dstNode.mesh.position), this.edgeStyleConfig = this.parentGraph.config.style.edge, this.parentGraph.graphEngine.addEdge(this), this.mesh = this.edgeStyleConfig.edgeMeshFactory(this, this.parentGraph, this.edgeStyleConfig), this.mesh.isPickable = !1, this.mesh.metadata = {}, this.mesh.metadata.parentEdge = this;
  }
  update() {
    const t = this.parentGraph.graphEngine.getEdgePosition(this);
    this.parentGraph.edgeObservable.notifyObservers({ type: "edge-update-before", edge: this });
    const { srcPoint: n, dstPoint: r } = this.transformArrowCap();
    n && r ? this.transformEdgeMesh(
      n,
      r
    ) : this.transformEdgeMesh(
      new Je(t.src.x, t.src.y, t.src.z),
      new Je(t.dst.x, t.dst.y, t.dst.z)
    ), this.parentGraph.edgeObservable.notifyObservers({ type: "edge-update-after", edge: this });
  }
  static updateRays(t) {
    if (t.config.style.edge.arrowCap) {
      for (const n of t.graphEngine.edges) {
        const r = n.srcNode.mesh, i = n.dstNode.mesh;
        n.ray.position = i.position, n.ray.direction = i.position.subtract(r.position);
      }
      t.scene.render();
    }
  }
  static get list() {
    return La;
  }
  static create(t, n, r, i = {}) {
    const o = Se.list.get(n, r);
    if (o)
      return o;
    const a = new Se(t, n, r, i);
    return Se.list.set(n, r, a), a;
  }
  static defaultEdgeMeshFactory(t, n, r) {
    return r.arrowCap && (t.arrowMesh = n.meshCache.get("default-arrow-cap", () => {
      const i = Fa(r.width), o = Or(r.width), a = Na.GetArrowCap(
        new Je(0, 0, -o),
        // position
        new Je(0, 0, 1),
        // direction
        o,
        // length
        i,
        // widthUp
        i
        // widthDown
      );
      return Zn(
        "lines",
        {
          points: a.points,
          widths: a.widths,
          widthDistribution: $a.WIDTH_DISTRIBUTION_START
          // instance: line,
        },
        {
          color: lt.FromHexString(r.color.slice(0, 7))
        }
        // e.parentGraph.scene
      );
    })), n.meshCache.get("default-edge", () => {
      switch (r.type) {
        case "plain":
          return Se.createPlainLine(t, n, r);
        case "moving":
          return Se.createMovingLine(t, n, r);
        default:
          throw new TypeError(`Unknown Edge type: '${r.type}'`);
      }
    });
  }
  static createPlainLine(t, n, r) {
    return Zn(
      "edge-plain",
      {
        points: Se.unitVectorPoints
      },
      {
        color: lt.FromHexString(r.color.slice(0, 7)),
        width: r.width
      }
    );
  }
  static createMovingLine(t, n, r) {
    const i = lt.FromHexString(r.movingLineOpts.baseColor.slice(0, 7)), o = lt.FromHexString(r.color.slice(0, 7)), a = Math.floor(i.r * 255), u = Math.floor(i.g * 255), s = Math.floor(i.b * 255), h = Math.floor(o.r * 255), d = Math.floor(o.g * 255), p = Math.floor(o.b * 255), y = new Uint8Array([a, u, s, h, d, p]), w = new Cr(
      y,
      // data
      y.length / 3,
      // width
      1,
      // height
      Gn.TEXTUREFORMAT_RGB,
      // format
      n.scene,
      // sceneOrEngine
      !1,
      // generateMipMaps
      !0,
      // invertY
      Gn.TEXTURE_NEAREST_NEAREST
      // samplingMode
      // samplingMode
      // type
      // creationFlags
      // useSRGBBuffer
    );
    w.wrapU = Cr.WRAP_ADDRESSMODE, w.name = "moving-texture";
    const m = Zn(
      "edge-moving",
      {
        points: Se.unitVectorPoints
      },
      {
        // color: Color3.FromHexString(colorNameToHex(edgeColor))
        width: r.width,
        colorMode: za.COLOR_MODE_MULTIPLY
      }
    ), E = m.material;
    return E.emissiveTexture = w, E.disableLighting = !0, w.uScale = 5, n.scene.onBeforeRenderObservable.add(() => {
      w.uOffset -= 0.04 * n.scene.getAnimationRatio();
    }), m;
  }
  transformEdgeMesh(t, n) {
    const r = n.subtract(t), i = new Je(
      t.x + r.x / 2,
      t.y + r.y / 2,
      t.z + r.z / 2
    ), o = r.length();
    this.mesh.position = i, this.mesh.lookAt(n), this.mesh.scaling.z = o;
  }
  transformArrowCap() {
    if (this.arrowMesh) {
      this.parentGraph.stats.arrowCapUpdate.beginMonitoring();
      const { srcPoint: t, dstPoint: n, newEndPoint: r } = this.getInterceptPoints();
      if (!t || !n || !r)
        throw new Error("Internal Error: mesh intercept points not found");
      return this.arrowMesh.position = n, this.arrowMesh.lookAt(this.dstNode.mesh.position), this.parentGraph.stats.arrowCapUpdate.endMonitoring(), {
        srcPoint: t,
        dstPoint: r
        // dstPoint,
      };
    }
    return {
      srcPoint: null,
      dstPoint: null
    };
  }
  getInterceptPoints() {
    const t = this.srcNode.mesh, n = this.dstNode.mesh;
    this.parentGraph.stats.intersectCalc.beginMonitoring();
    const r = this.ray.intersectsMeshes([n]), i = this.ray.intersectsMeshes([t]);
    this.parentGraph.stats.intersectCalc.endMonitoring();
    let o = null, a = null, u = null;
    if (r.length && i.length) {
      const s = Or(this.edgeStyleConfig.width);
      a = r[0].pickedPoint, o = i[0].pickedPoint;
      const h = o.subtract(a).length(), d = h - s, { x: p, y, z: w } = o, { x: m, y: E, z: k } = a, _ = p + d / h * (m - p), N = y + d / h * (E - y), $ = w + d / h * (k - w);
      u = new Je(_, N, $);
    }
    return {
      srcPoint: o,
      dstPoint: a,
      newEndPoint: u
    };
  }
  static get unitVectorPoints() {
    return [
      // start point
      0,
      0,
      -0.5,
      // end point
      0,
      0,
      0.5
    ];
  }
}
function Fa(e) {
  return Math.max(20 * e, 4);
}
function Or(e) {
  return Math.max(e, 0.5);
}
class Za {
  constructor() {
    Z(this, "map", /* @__PURE__ */ new Map());
  }
  has(t, n) {
    const r = this.map.get(t);
    return r ? r.has(n) : !1;
  }
  set(t, n, r) {
    let i = this.map.get(t);
    if (i || (i = /* @__PURE__ */ new Map(), this.map.set(t, i)), i.has(n))
      throw new Error("Attempting to create duplicate Edge");
    i.set(n, r);
  }
  get(t, n) {
    const r = this.map.get(t);
    if (r)
      return r.get(n);
  }
  get size() {
    let t = 0;
    for (const n of this.map.values())
      t += n.size;
    return t;
  }
}
const La = new Za(), Be = {
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  grey: [128, 128, 128],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  rebeccapurple: [102, 51, 153],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
}, ki = /* @__PURE__ */ Object.create(null);
for (const e in Be)
  Object.hasOwn(Be, e) && (ki[Be[e]] = e);
const $e = {
  to: {},
  get: {}
};
$e.get = function(e) {
  const t = e.slice(0, 3).toLowerCase();
  let n, r;
  switch (t) {
    case "hsl": {
      n = $e.get.hsl(e), r = "hsl";
      break;
    }
    case "hwb": {
      n = $e.get.hwb(e), r = "hwb";
      break;
    }
    default: {
      n = $e.get.rgb(e), r = "rgb";
      break;
    }
  }
  return n ? { model: r, value: n } : null;
};
$e.get.rgb = function(e) {
  if (!e)
    return null;
  const t = /^#([a-f\d]{3,4})$/i, n = /^#([a-f\d]{6})([a-f\d]{2})?$/i, r = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/, i = /^rgba?\(\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/, o = /^(\w+)$/;
  let a = [0, 0, 0, 1], u, s, h;
  if (u = e.match(n)) {
    for (h = u[2], u = u[1], s = 0; s < 3; s++) {
      const d = s * 2;
      a[s] = Number.parseInt(u.slice(d, d + 2), 16);
    }
    h && (a[3] = Number.parseInt(h, 16) / 255);
  } else if (u = e.match(t)) {
    for (u = u[1], h = u[3], s = 0; s < 3; s++)
      a[s] = Number.parseInt(u[s] + u[s], 16);
    h && (a[3] = Number.parseInt(h + h, 16) / 255);
  } else if (u = e.match(r)) {
    for (s = 0; s < 3; s++)
      a[s] = Number.parseInt(u[s + 1], 10);
    u[4] && (a[3] = u[5] ? Number.parseFloat(u[4]) * 0.01 : Number.parseFloat(u[4]));
  } else if (u = e.match(i)) {
    for (s = 0; s < 3; s++)
      a[s] = Math.round(Number.parseFloat(u[s + 1]) * 2.55);
    u[4] && (a[3] = u[5] ? Number.parseFloat(u[4]) * 0.01 : Number.parseFloat(u[4]));
  } else
    return (u = e.match(o)) ? u[1] === "transparent" ? [0, 0, 0, 0] : Object.hasOwn(Be, u[1]) ? (a = Be[u[1]], a[3] = 1, a) : null : null;
  for (s = 0; s < 3; s++)
    a[s] = Ye(a[s], 0, 255);
  return a[3] = Ye(a[3], 0, 1), a;
};
$e.get.hsl = function(e) {
  if (!e)
    return null;
  const t = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/, n = e.match(t);
  if (n) {
    const r = Number.parseFloat(n[4]), i = (Number.parseFloat(n[1]) % 360 + 360) % 360, o = Ye(Number.parseFloat(n[2]), 0, 100), a = Ye(Number.parseFloat(n[3]), 0, 100), u = Ye(Number.isNaN(r) ? 1 : r, 0, 1);
    return [i, o, a, u];
  }
  return null;
};
$e.get.hwb = function(e) {
  if (!e)
    return null;
  const t = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/, n = e.match(t);
  if (n) {
    const r = Number.parseFloat(n[4]), i = (Number.parseFloat(n[1]) % 360 + 360) % 360, o = Ye(Number.parseFloat(n[2]), 0, 100), a = Ye(Number.parseFloat(n[3]), 0, 100), u = Ye(Number.isNaN(r) ? 1 : r, 0, 1);
    return [i, o, a, u];
  }
  return null;
};
$e.to.hex = function(...e) {
  return "#" + tn(e[0]) + tn(e[1]) + tn(e[2]) + (e[3] < 1 ? tn(Math.round(e[3] * 255)) : "");
};
$e.to.rgb = function(...e) {
  return e.length < 4 || e[3] === 1 ? "rgb(" + Math.round(e[0]) + ", " + Math.round(e[1]) + ", " + Math.round(e[2]) + ")" : "rgba(" + Math.round(e[0]) + ", " + Math.round(e[1]) + ", " + Math.round(e[2]) + ", " + e[3] + ")";
};
$e.to.rgb.percent = function(...e) {
  const t = Math.round(e[0] / 255 * 100), n = Math.round(e[1] / 255 * 100), r = Math.round(e[2] / 255 * 100);
  return e.length < 4 || e[3] === 1 ? "rgb(" + t + "%, " + n + "%, " + r + "%)" : "rgba(" + t + "%, " + n + "%, " + r + "%, " + e[3] + ")";
};
$e.to.hsl = function(...e) {
  return e.length < 4 || e[3] === 1 ? "hsl(" + e[0] + ", " + e[1] + "%, " + e[2] + "%)" : "hsla(" + e[0] + ", " + e[1] + "%, " + e[2] + "%, " + e[3] + ")";
};
$e.to.hwb = function(...e) {
  let t = "";
  return e.length >= 4 && e[3] !== 1 && (t = ", " + e[3]), "hwb(" + e[0] + ", " + e[1] + "%, " + e[2] + "%" + t + ")";
};
$e.to.keyword = function(...e) {
  return ki[e.slice(0, 3)];
};
function Ye(e, t, n) {
  return Math.min(Math.max(t, e), n);
}
function tn(e) {
  const t = Math.round(e).toString(16).toUpperCase();
  return t.length < 2 ? "0" + t : t;
}
const Ei = {};
for (const e of Object.keys(Be))
  Ei[Be[e]] = e;
const P = {
  rgb: { channels: 3, labels: "rgb" },
  hsl: { channels: 3, labels: "hsl" },
  hsv: { channels: 3, labels: "hsv" },
  hwb: { channels: 3, labels: "hwb" },
  cmyk: { channels: 4, labels: "cmyk" },
  xyz: { channels: 3, labels: "xyz" },
  lab: { channels: 3, labels: "lab" },
  oklab: { channels: 3, labels: ["okl", "oka", "okb"] },
  lch: { channels: 3, labels: "lch" },
  oklch: { channels: 3, labels: ["okl", "okc", "okh"] },
  hex: { channels: 1, labels: ["hex"] },
  keyword: { channels: 1, labels: ["keyword"] },
  ansi16: { channels: 1, labels: ["ansi16"] },
  ansi256: { channels: 1, labels: ["ansi256"] },
  hcg: { channels: 3, labels: ["h", "c", "g"] },
  apple: { channels: 3, labels: ["r16", "g16", "b16"] },
  gray: { channels: 1, labels: ["gray"] }
}, qe = (6 / 29) ** 3;
function ft(e) {
  const t = e > 31308e-7 ? 1.055 * e ** 0.4166666666666667 - 0.055 : e * 12.92;
  return Math.min(Math.max(0, t), 1);
}
function dt(e) {
  return e > 0.04045 ? ((e + 0.055) / 1.055) ** 2.4 : e / 12.92;
}
for (const e of Object.keys(P)) {
  if (!("channels" in P[e]))
    throw new Error("missing channels property: " + e);
  if (!("labels" in P[e]))
    throw new Error("missing channel labels property: " + e);
  if (P[e].labels.length !== P[e].channels)
    throw new Error("channel and label counts mismatch: " + e);
  const { channels: t, labels: n } = P[e];
  delete P[e].channels, delete P[e].labels, Object.defineProperty(P[e], "channels", { value: t }), Object.defineProperty(P[e], "labels", { value: n });
}
P.rgb.hsl = function(e) {
  const t = e[0] / 255, n = e[1] / 255, r = e[2] / 255, i = Math.min(t, n, r), o = Math.max(t, n, r), a = o - i;
  let u, s;
  switch (o) {
    case i: {
      u = 0;
      break;
    }
    case t: {
      u = (n - r) / a;
      break;
    }
    case n: {
      u = 2 + (r - t) / a;
      break;
    }
    case r: {
      u = 4 + (t - n) / a;
      break;
    }
  }
  u = Math.min(u * 60, 360), u < 0 && (u += 360);
  const h = (i + o) / 2;
  return o === i ? s = 0 : h <= 0.5 ? s = a / (o + i) : s = a / (2 - o - i), [u, s * 100, h * 100];
};
P.rgb.hsv = function(e) {
  let t, n, r, i, o;
  const a = e[0] / 255, u = e[1] / 255, s = e[2] / 255, h = Math.max(a, u, s), d = h - Math.min(a, u, s), p = function(y) {
    return (h - y) / 6 / d + 1 / 2;
  };
  if (d === 0)
    i = 0, o = 0;
  else {
    switch (o = d / h, t = p(a), n = p(u), r = p(s), h) {
      case a: {
        i = r - n;
        break;
      }
      case u: {
        i = 1 / 3 + t - r;
        break;
      }
      case s: {
        i = 2 / 3 + n - t;
        break;
      }
    }
    i < 0 ? i += 1 : i > 1 && (i -= 1);
  }
  return [
    i * 360,
    o * 100,
    h * 100
  ];
};
P.rgb.hwb = function(e) {
  const t = e[0], n = e[1];
  let r = e[2];
  const i = P.rgb.hsl(e)[0], o = 1 / 255 * Math.min(t, Math.min(n, r));
  return r = 1 - 1 / 255 * Math.max(t, Math.max(n, r)), [i, o * 100, r * 100];
};
P.rgb.oklab = function(e) {
  const t = dt(e[0] / 255), n = dt(e[1] / 255), r = dt(e[2] / 255), i = Math.cbrt(0.4122214708 * t + 0.5363325363 * n + 0.0514459929 * r), o = Math.cbrt(0.2119034982 * t + 0.6806995451 * n + 0.1073969566 * r), a = Math.cbrt(0.0883024619 * t + 0.2817188376 * n + 0.6299787005 * r), u = 0.2104542553 * i + 0.793617785 * o - 0.0040720468 * a, s = 1.9779984951 * i - 2.428592205 * o + 0.4505937099 * a, h = 0.0259040371 * i + 0.7827717662 * o - 0.808675766 * a;
  return [u * 100, s * 100, h * 100];
};
P.rgb.cmyk = function(e) {
  const t = e[0] / 255, n = e[1] / 255, r = e[2] / 255, i = Math.min(1 - t, 1 - n, 1 - r), o = (1 - t - i) / (1 - i) || 0, a = (1 - n - i) / (1 - i) || 0, u = (1 - r - i) / (1 - i) || 0;
  return [o * 100, a * 100, u * 100, i * 100];
};
function ja(e, t) {
  return (e[0] - t[0]) ** 2 + (e[1] - t[1]) ** 2 + (e[2] - t[2]) ** 2;
}
P.rgb.keyword = function(e) {
  const t = Ei[e];
  if (t)
    return t;
  let n = Number.POSITIVE_INFINITY, r;
  for (const i of Object.keys(Be)) {
    const o = Be[i], a = ja(e, o);
    a < n && (n = a, r = i);
  }
  return r;
};
P.keyword.rgb = function(e) {
  return Be[e];
};
P.rgb.xyz = function(e) {
  const t = dt(e[0] / 255), n = dt(e[1] / 255), r = dt(e[2] / 255), i = t * 0.4124564 + n * 0.3575761 + r * 0.1804375, o = t * 0.2126729 + n * 0.7151522 + r * 0.072175, a = t * 0.0193339 + n * 0.119192 + r * 0.9503041;
  return [i * 100, o * 100, a * 100];
};
P.rgb.lab = function(e) {
  const t = P.rgb.xyz(e);
  let n = t[0], r = t[1], i = t[2];
  n /= 95.047, r /= 100, i /= 108.883, n = n > qe ? n ** (1 / 3) : 7.787 * n + 16 / 116, r = r > qe ? r ** (1 / 3) : 7.787 * r + 16 / 116, i = i > qe ? i ** (1 / 3) : 7.787 * i + 16 / 116;
  const o = 116 * r - 16, a = 500 * (n - r), u = 200 * (r - i);
  return [o, a, u];
};
P.hsl.rgb = function(e) {
  const t = e[0] / 360, n = e[1] / 100, r = e[2] / 100;
  let i, o;
  if (n === 0)
    return o = r * 255, [o, o, o];
  const a = r < 0.5 ? r * (1 + n) : r + n - r * n, u = 2 * r - a, s = [0, 0, 0];
  for (let h = 0; h < 3; h++)
    i = t + 1 / 3 * -(h - 1), i < 0 && i++, i > 1 && i--, 6 * i < 1 ? o = u + (a - u) * 6 * i : 2 * i < 1 ? o = a : 3 * i < 2 ? o = u + (a - u) * (2 / 3 - i) * 6 : o = u, s[h] = o * 255;
  return s;
};
P.hsl.hsv = function(e) {
  const t = e[0];
  let n = e[1] / 100, r = e[2] / 100, i = n;
  const o = Math.max(r, 0.01);
  r *= 2, n *= r <= 1 ? r : 2 - r, i *= o <= 1 ? o : 2 - o;
  const a = (r + n) / 2, u = r === 0 ? 2 * i / (o + i) : 2 * n / (r + n);
  return [t, u * 100, a * 100];
};
P.hsv.rgb = function(e) {
  const t = e[0] / 60, n = e[1] / 100;
  let r = e[2] / 100;
  const i = Math.floor(t) % 6, o = t - Math.floor(t), a = 255 * r * (1 - n), u = 255 * r * (1 - n * o), s = 255 * r * (1 - n * (1 - o));
  switch (r *= 255, i) {
    case 0:
      return [r, s, a];
    case 1:
      return [u, r, a];
    case 2:
      return [a, r, s];
    case 3:
      return [a, u, r];
    case 4:
      return [s, a, r];
    case 5:
      return [r, a, u];
  }
};
P.hsv.hsl = function(e) {
  const t = e[0], n = e[1] / 100, r = e[2] / 100, i = Math.max(r, 0.01);
  let o, a;
  a = (2 - n) * r;
  const u = (2 - n) * i;
  return o = n * i, o /= u <= 1 ? u : 2 - u, o = o || 0, a /= 2, [t, o * 100, a * 100];
};
P.hwb.rgb = function(e) {
  const t = e[0] / 360;
  let n = e[1] / 100, r = e[2] / 100;
  const i = n + r;
  let o;
  i > 1 && (n /= i, r /= i);
  const a = Math.floor(6 * t), u = 1 - r;
  o = 6 * t - a, a & 1 && (o = 1 - o);
  const s = n + o * (u - n);
  let h, d, p;
  switch (a) {
    default:
    case 6:
    case 0: {
      h = u, d = s, p = n;
      break;
    }
    case 1: {
      h = s, d = u, p = n;
      break;
    }
    case 2: {
      h = n, d = u, p = s;
      break;
    }
    case 3: {
      h = n, d = s, p = u;
      break;
    }
    case 4: {
      h = s, d = n, p = u;
      break;
    }
    case 5: {
      h = u, d = n, p = s;
      break;
    }
  }
  return [h * 255, d * 255, p * 255];
};
P.cmyk.rgb = function(e) {
  const t = e[0] / 100, n = e[1] / 100, r = e[2] / 100, i = e[3] / 100, o = 1 - Math.min(1, t * (1 - i) + i), a = 1 - Math.min(1, n * (1 - i) + i), u = 1 - Math.min(1, r * (1 - i) + i);
  return [o * 255, a * 255, u * 255];
};
P.xyz.rgb = function(e) {
  const t = e[0] / 100, n = e[1] / 100, r = e[2] / 100;
  let i, o, a;
  return i = t * 3.2404542 + n * -1.5371385 + r * -0.4985314, o = t * -0.969266 + n * 1.8760108 + r * 0.041556, a = t * 0.0556434 + n * -0.2040259 + r * 1.0572252, i = ft(i), o = ft(o), a = ft(a), [i * 255, o * 255, a * 255];
};
P.xyz.lab = function(e) {
  let t = e[0], n = e[1], r = e[2];
  t /= 95.047, n /= 100, r /= 108.883, t = t > qe ? t ** (1 / 3) : 7.787 * t + 16 / 116, n = n > qe ? n ** (1 / 3) : 7.787 * n + 16 / 116, r = r > qe ? r ** (1 / 3) : 7.787 * r + 16 / 116;
  const i = 116 * n - 16, o = 500 * (t - n), a = 200 * (n - r);
  return [i, o, a];
};
P.xyz.oklab = function(e) {
  const t = e[0] / 100, n = e[1] / 100, r = e[2] / 100, i = Math.cbrt(0.8189330101 * t + 0.3618667424 * n - 0.1288597137 * r), o = Math.cbrt(0.0329845436 * t + 0.9293118715 * n + 0.0361456387 * r), a = Math.cbrt(0.0482003018 * t + 0.2643662691 * n + 0.633851707 * r), u = 0.2104542553 * i + 0.793617785 * o - 0.0040720468 * a, s = 1.9779984951 * i - 2.428592205 * o + 0.4505937099 * a, h = 0.0259040371 * i + 0.7827717662 * o - 0.808675766 * a;
  return [u * 100, s * 100, h * 100];
};
P.oklab.oklch = function(e) {
  return P.lab.lch(e);
};
P.oklab.xyz = function(e) {
  const t = e[0] / 100, n = e[1] / 100, r = e[2] / 100, i = (0.999999998 * t + 0.396337792 * n + 0.215803758 * r) ** 3, o = (1.000000008 * t - 0.105561342 * n - 0.063854175 * r) ** 3, a = (1.000000055 * t - 0.089484182 * n - 1.291485538 * r) ** 3, u = 1.227013851 * i - 0.55779998 * o + 0.281256149 * a, s = -0.040580178 * i + 1.11225687 * o - 0.071676679 * a, h = -0.076381285 * i - 0.421481978 * o + 1.58616322 * a;
  return [u * 100, s * 100, h * 100];
};
P.oklab.rgb = function(e) {
  const t = e[0] / 100, n = e[1] / 100, r = e[2] / 100, i = (t + 0.3963377774 * n + 0.2158037573 * r) ** 3, o = (t - 0.1055613458 * n - 0.0638541728 * r) ** 3, a = (t - 0.0894841775 * n - 1.291485548 * r) ** 3, u = ft(4.0767416621 * i - 3.3077115913 * o + 0.2309699292 * a), s = ft(-1.2684380046 * i + 2.6097574011 * o - 0.3413193965 * a), h = ft(-0.0041960863 * i - 0.7034186147 * o + 1.707614701 * a);
  return [u * 255, s * 255, h * 255];
};
P.oklch.oklab = function(e) {
  return P.lch.lab(e);
};
P.lab.xyz = function(e) {
  const t = e[0], n = e[1], r = e[2];
  let i, o, a;
  o = (t + 16) / 116, i = n / 500 + o, a = o - r / 200;
  const u = o ** 3, s = i ** 3, h = a ** 3;
  return o = u > qe ? u : (o - 16 / 116) / 7.787, i = s > qe ? s : (i - 16 / 116) / 7.787, a = h > qe ? h : (a - 16 / 116) / 7.787, i *= 95.047, o *= 100, a *= 108.883, [i, o, a];
};
P.lab.lch = function(e) {
  const t = e[0], n = e[1], r = e[2];
  let i;
  i = Math.atan2(r, n) * 360 / 2 / Math.PI, i < 0 && (i += 360);
  const a = Math.sqrt(n * n + r * r);
  return [t, a, i];
};
P.lch.lab = function(e) {
  const t = e[0], n = e[1], i = e[2] / 360 * 2 * Math.PI, o = n * Math.cos(i), a = n * Math.sin(i);
  return [t, o, a];
};
P.rgb.ansi16 = function(e, t = null) {
  const [n, r, i] = e;
  let o = t === null ? P.rgb.hsv(e)[2] : t;
  if (o = Math.round(o / 50), o === 0)
    return 30;
  let a = 30 + (Math.round(i / 255) << 2 | Math.round(r / 255) << 1 | Math.round(n / 255));
  return o === 2 && (a += 60), a;
};
P.hsv.ansi16 = function(e) {
  return P.rgb.ansi16(P.hsv.rgb(e), e[2]);
};
P.rgb.ansi256 = function(e) {
  const t = e[0], n = e[1], r = e[2];
  return t >> 4 === n >> 4 && n >> 4 === r >> 4 ? t < 8 ? 16 : t > 248 ? 231 : Math.round((t - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(t / 255 * 5) + 6 * Math.round(n / 255 * 5) + Math.round(r / 255 * 5);
};
P.ansi16.rgb = function(e) {
  e = e[0];
  let t = e % 10;
  if (t === 0 || t === 7)
    return e > 50 && (t += 3.5), t = t / 10.5 * 255, [t, t, t];
  const n = (Math.trunc(e > 50) + 1) * 0.5, r = (t & 1) * n * 255, i = (t >> 1 & 1) * n * 255, o = (t >> 2 & 1) * n * 255;
  return [r, i, o];
};
P.ansi256.rgb = function(e) {
  if (e = e[0], e >= 232) {
    const o = (e - 232) * 10 + 8;
    return [o, o, o];
  }
  e -= 16;
  let t;
  const n = Math.floor(e / 36) / 5 * 255, r = Math.floor((t = e % 36) / 6) / 5 * 255, i = t % 6 / 5 * 255;
  return [n, r, i];
};
P.rgb.hex = function(e) {
  const n = (((Math.round(e[0]) & 255) << 16) + ((Math.round(e[1]) & 255) << 8) + (Math.round(e[2]) & 255)).toString(16).toUpperCase();
  return "000000".slice(n.length) + n;
};
P.hex.rgb = function(e) {
  const t = e.toString(16).match(/[a-f\d]{6}|[a-f\d]{3}/i);
  if (!t)
    return [0, 0, 0];
  let n = t[0];
  t[0].length === 3 && (n = [...n].map((u) => u + u).join(""));
  const r = Number.parseInt(n, 16), i = r >> 16 & 255, o = r >> 8 & 255, a = r & 255;
  return [i, o, a];
};
P.rgb.hcg = function(e) {
  const t = e[0] / 255, n = e[1] / 255, r = e[2] / 255, i = Math.max(Math.max(t, n), r), o = Math.min(Math.min(t, n), r), a = i - o;
  let u;
  const s = a < 1 ? o / (1 - a) : 0;
  return a <= 0 ? u = 0 : i === t ? u = (n - r) / a % 6 : i === n ? u = 2 + (r - t) / a : u = 4 + (t - n) / a, u /= 6, u %= 1, [u * 360, a * 100, s * 100];
};
P.hsl.hcg = function(e) {
  const t = e[1] / 100, n = e[2] / 100, r = n < 0.5 ? 2 * t * n : 2 * t * (1 - n);
  let i = 0;
  return r < 1 && (i = (n - 0.5 * r) / (1 - r)), [e[0], r * 100, i * 100];
};
P.hsv.hcg = function(e) {
  const t = e[1] / 100, n = e[2] / 100, r = t * n;
  let i = 0;
  return r < 1 && (i = (n - r) / (1 - r)), [e[0], r * 100, i * 100];
};
P.hcg.rgb = function(e) {
  const t = e[0] / 360, n = e[1] / 100, r = e[2] / 100;
  if (n === 0)
    return [r * 255, r * 255, r * 255];
  const i = [0, 0, 0], o = t % 1 * 6, a = o % 1, u = 1 - a;
  let s = 0;
  switch (Math.floor(o)) {
    case 0: {
      i[0] = 1, i[1] = a, i[2] = 0;
      break;
    }
    case 1: {
      i[0] = u, i[1] = 1, i[2] = 0;
      break;
    }
    case 2: {
      i[0] = 0, i[1] = 1, i[2] = a;
      break;
    }
    case 3: {
      i[0] = 0, i[1] = u, i[2] = 1;
      break;
    }
    case 4: {
      i[0] = a, i[1] = 0, i[2] = 1;
      break;
    }
    default:
      i[0] = 1, i[1] = 0, i[2] = u;
  }
  return s = (1 - n) * r, [
    (n * i[0] + s) * 255,
    (n * i[1] + s) * 255,
    (n * i[2] + s) * 255
  ];
};
P.hcg.hsv = function(e) {
  const t = e[1] / 100, n = e[2] / 100, r = t + n * (1 - t);
  let i = 0;
  return r > 0 && (i = t / r), [e[0], i * 100, r * 100];
};
P.hcg.hsl = function(e) {
  const t = e[1] / 100, r = e[2] / 100 * (1 - t) + 0.5 * t;
  let i = 0;
  return r > 0 && r < 0.5 ? i = t / (2 * r) : r >= 0.5 && r < 1 && (i = t / (2 * (1 - r))), [e[0], i * 100, r * 100];
};
P.hcg.hwb = function(e) {
  const t = e[1] / 100, n = e[2] / 100, r = t + n * (1 - t);
  return [e[0], (r - t) * 100, (1 - r) * 100];
};
P.hwb.hcg = function(e) {
  const t = e[1] / 100, r = 1 - e[2] / 100, i = r - t;
  let o = 0;
  return i < 1 && (o = (r - i) / (1 - i)), [e[0], i * 100, o * 100];
};
P.apple.rgb = function(e) {
  return [e[0] / 65535 * 255, e[1] / 65535 * 255, e[2] / 65535 * 255];
};
P.rgb.apple = function(e) {
  return [e[0] / 255 * 65535, e[1] / 255 * 65535, e[2] / 255 * 65535];
};
P.gray.rgb = function(e) {
  return [e[0] / 100 * 255, e[0] / 100 * 255, e[0] / 100 * 255];
};
P.gray.hsl = function(e) {
  return [0, 0, e[0]];
};
P.gray.hsv = P.gray.hsl;
P.gray.hwb = function(e) {
  return [0, 100, e[0]];
};
P.gray.cmyk = function(e) {
  return [0, 0, 0, e[0]];
};
P.gray.lab = function(e) {
  return [e[0], 0, 0];
};
P.gray.hex = function(e) {
  const t = Math.round(e[0] / 100 * 255) & 255, r = ((t << 16) + (t << 8) + t).toString(16).toUpperCase();
  return "000000".slice(r.length) + r;
};
P.rgb.gray = function(e) {
  return [(e[0] + e[1] + e[2]) / 3 / 255 * 100];
};
function Ba() {
  const e = {}, t = Object.keys(P);
  for (let { length: n } = t, r = 0; r < n; r++)
    e[t[r]] = {
      // http://jsperf.com/1-vs-infinity
      // micro-opt, but this is simple.
      distance: -1,
      parent: null
    };
  return e;
}
function Ra(e) {
  const t = Ba(), n = [e];
  for (t[e].distance = 0; n.length > 0; ) {
    const r = n.pop(), i = Object.keys(P[r]);
    for (let { length: o } = i, a = 0; a < o; a++) {
      const u = i[a], s = t[u];
      s.distance === -1 && (s.distance = t[r].distance + 1, s.parent = r, n.unshift(u));
    }
  }
  return t;
}
function Da(e, t) {
  return function(n) {
    return t(e(n));
  };
}
function Ua(e, t) {
  const n = [t[e].parent, e];
  let r = P[t[e].parent][e], i = t[e].parent;
  for (; t[i].parent; )
    n.unshift(t[i].parent), r = Da(P[t[i].parent][i], r), i = t[i].parent;
  return r.conversion = n, r;
}
function qa(e) {
  const t = Ra(e), n = {}, r = Object.keys(t);
  for (let { length: i } = r, o = 0; o < i; o++) {
    const a = r[o];
    t[a].parent !== null && (n[a] = Ua(a, t));
  }
  return n;
}
const Qe = {}, Ga = Object.keys(P);
function Ha(e) {
  const t = function(...n) {
    const r = n[0];
    return r == null ? r : (r.length > 1 && (n = r), e(n));
  };
  return "conversion" in e && (t.conversion = e.conversion), t;
}
function Ka(e) {
  const t = function(...n) {
    const r = n[0];
    if (r == null)
      return r;
    r.length > 1 && (n = r);
    const i = e(n);
    if (typeof i == "object")
      for (let { length: o } = i, a = 0; a < o; a++)
        i[a] = Math.round(i[a]);
    return i;
  };
  return "conversion" in e && (t.conversion = e.conversion), t;
}
for (const e of Ga) {
  Qe[e] = {}, Object.defineProperty(Qe[e], "channels", { value: P[e].channels }), Object.defineProperty(Qe[e], "labels", { value: P[e].labels });
  const t = qa(e), n = Object.keys(t);
  for (const r of n) {
    const i = t[r];
    Qe[e][r] = Ka(i), Qe[e][r].raw = Ha(i);
  }
}
function z(e, t, n) {
  function r(u, s) {
    var h;
    Object.defineProperty(u, "_zod", {
      value: u._zod ?? {},
      enumerable: !1
    }), (h = u._zod).traits ?? (h.traits = /* @__PURE__ */ new Set()), u._zod.traits.add(e), t(u, s);
    for (const d in a.prototype)
      Object.defineProperty(u, d, { value: a.prototype[d].bind(u) });
    u._zod.constr = a, u._zod.def = s;
  }
  const i = (n == null ? void 0 : n.Parent) ?? Object;
  class o extends i {
  }
  Object.defineProperty(o, "name", { value: e });
  function a(u) {
    var s;
    const h = n != null && n.Parent ? new o() : this;
    r(h, u), (s = h._zod).deferred ?? (s.deferred = []);
    for (const d of h._zod.deferred)
      d();
    return h;
  }
  return Object.defineProperty(a, "init", { value: r }), Object.defineProperty(a, Symbol.hasInstance, {
    value: (u) => {
      var s, h;
      return n != null && n.Parent && u instanceof n.Parent ? !0 : (h = (s = u == null ? void 0 : u._zod) == null ? void 0 : s.traits) == null ? void 0 : h.has(e);
    }
  }), Object.defineProperty(a, "name", { value: e }), a;
}
class At extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
const Hn = {};
function nt(e) {
  return e && Object.assign(Hn, e), Hn;
}
function Va(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Ni(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function tr(e) {
  return e == null;
}
function nr(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Wa(e, t) {
  const n = (e.toString().split(".")[1] || "").length, r = (t.toString().split(".")[1] || "").length, i = n > r ? n : r, o = Number.parseInt(e.toFixed(i).replace(".", "")), a = Number.parseInt(t.toFixed(i).replace(".", ""));
  return o % a / 10 ** i;
}
function pe(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      {
        const r = n();
        return e[t] = r, r;
      }
    },
    set(r) {
      Object.defineProperty(e, t, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function _n(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function $i(e = 10) {
  const t = "abcdefghijklmnopqrstuvwxyz";
  let n = "";
  for (let r = 0; r < e; r++)
    n += t[Math.floor(Math.random() * t.length)];
  return n;
}
function zt(e) {
  return JSON.stringify(e);
}
function Ja(e) {
  return typeof e == "object" && e !== null;
}
const Qa = Ni(() => {
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function Pr(e) {
  return typeof e == "object" && e !== null && Object.getPrototypeOf(e) === Object.prototype;
}
const Ya = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function Ft(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ot(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n != null && n.parent) && (r._zod.parent = e), r;
}
function q(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if ((t == null ? void 0 : t.message) !== void 0) {
    if ((t == null ? void 0 : t.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function Xa(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional");
}
const es = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function ts(e, t) {
  const n = {}, r = e._zod.def;
  for (const i in t) {
    if (!(i in r.shape))
      throw new Error(`Unrecognized key: "${i}"`);
    t[i] && (n[i] = r.shape[i]);
  }
  return ot(e, {
    ...e._zod.def,
    shape: n,
    checks: []
  });
}
function ns(e, t) {
  const n = { ...e._zod.def.shape }, r = e._zod.def;
  for (const i in t) {
    if (!(i in r.shape))
      throw new Error(`Unrecognized key: "${i}"`);
    t[i] && delete n[i];
  }
  return ot(e, {
    ...e._zod.def,
    shape: n,
    checks: []
  });
}
function rs(e, t) {
  const n = {
    ...e._zod.def,
    get shape() {
      const r = { ...e._zod.def.shape, ...t };
      return _n(this, "shape", r), r;
    },
    checks: []
    // delete existing checks
  };
  return ot(e, n);
}
function is(e, t) {
  return ot(e, {
    ...e._zod.def,
    get shape() {
      const n = { ...e._zod.def.shape, ...t._zod.def.shape };
      return _n(this, "shape", n), n;
    },
    catchall: t._zod.def.catchall,
    checks: []
    // delete existing checks
  });
}
function os(e, t, n) {
  const r = t._zod.def.shape, i = { ...r };
  if (n)
    for (const o in n) {
      if (!(o in r))
        throw new Error(`Unrecognized key: "${o}"`);
      n[o] && (i[o] = e ? new e({
        type: "optional",
        innerType: r[o]
      }) : r[o]);
    }
  else
    for (const o in r)
      i[o] = e ? new e({
        type: "optional",
        innerType: r[o]
      }) : r[o];
  return ot(t, {
    ...t._zod.def,
    shape: i,
    checks: []
  });
}
function as(e, t, n) {
  const r = t._zod.def.shape, i = { ...r };
  if (n)
    for (const o in n) {
      if (!(o in i))
        throw new Error(`Unrecognized key: "${o}"`);
      n[o] && (i[o] = new e({
        type: "nonoptional",
        innerType: r[o]
      }));
    }
  else
    for (const o in r)
      i[o] = new e({
        type: "nonoptional",
        innerType: r[o]
      });
  return ot(t, {
    ...t._zod.def,
    shape: i,
    // optional: [],
    checks: []
  });
}
function St(e, t = 0) {
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n].continue !== !0)
      return !0;
  return !1;
}
function rr(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function nn(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function rt(e, t, n) {
  var i, o, a, u, s, h;
  const r = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const d = nn((a = (o = (i = e.inst) == null ? void 0 : i._zod.def) == null ? void 0 : o.error) == null ? void 0 : a.call(o, e)) ?? nn((u = t == null ? void 0 : t.error) == null ? void 0 : u.call(t, e)) ?? nn((s = n.customError) == null ? void 0 : s.call(n, e)) ?? nn((h = n.localeError) == null ? void 0 : h.call(n, e)) ?? "Invalid input";
    r.message = d;
  }
  return delete r.inst, delete r.continue, t != null && t.reportInput || delete r.input, r;
}
function ir(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Zt(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
const zi = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), Object.defineProperty(e, "message", {
    get() {
      return JSON.stringify(t, Va, 2);
    },
    enumerable: !0
    // configurable: false,
  });
}, Ti = z("$ZodError", zi), Mi = z("$ZodError", zi, { Parent: Error });
function ss(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const i of e.issues)
    i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(t(i))) : r.push(t(i));
  return { formErrors: r, fieldErrors: n };
}
function us(e, t) {
  const n = t || function(o) {
    return o.message;
  }, r = { _errors: [] }, i = (o) => {
    for (const a of o.issues)
      if (a.code === "invalid_union")
        a.errors.map((u) => i({ issues: u }));
      else if (a.code === "invalid_key")
        i({ issues: a.issues });
      else if (a.code === "invalid_element")
        i({ issues: a.issues });
      else if (a.path.length === 0)
        r._errors.push(n(a));
      else {
        let u = r, s = 0;
        for (; s < a.path.length; ) {
          const h = a.path[s];
          s === a.path.length - 1 ? (u[h] = u[h] || { _errors: [] }, u[h]._errors.push(n(a))) : u[h] = u[h] || { _errors: [] }, u = u[h], s++;
        }
      }
  };
  return i(e), r;
}
const cs = (e) => (t, n, r, i) => {
  const o = r ? Object.assign(r, { async: !1 }) : { async: !1 }, a = t._zod.run({ value: n, issues: [] }, o);
  if (a instanceof Promise)
    throw new At();
  if (a.issues.length) {
    const u = new ((i == null ? void 0 : i.Err) ?? e)(a.issues.map((s) => rt(s, o, nt())));
    throw Error.captureStackTrace(u, i == null ? void 0 : i.callee), u;
  }
  return a.value;
}, hs = (e) => async (t, n, r, i) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let a = t._zod.run({ value: n, issues: [] }, o);
  if (a instanceof Promise && (a = await a), a.issues.length) {
    const u = new ((i == null ? void 0 : i.Err) ?? e)(a.issues.map((s) => rt(s, o, nt())));
    throw Error.captureStackTrace(u, i == null ? void 0 : i.callee), u;
  }
  return a.value;
}, Ii = (e) => (t, n, r) => {
  const i = r ? { ...r, async: !1 } : { async: !1 }, o = t._zod.run({ value: n, issues: [] }, i);
  if (o instanceof Promise)
    throw new At();
  return o.issues.length ? {
    success: !1,
    error: new (e ?? Ti)(o.issues.map((a) => rt(a, i, nt())))
  } : { success: !0, data: o.value };
}, ls = /* @__PURE__ */ Ii(Mi), Ci = (e) => async (t, n, r) => {
  const i = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let o = t._zod.run({ value: n, issues: [] }, i);
  return o instanceof Promise && (o = await o), o.issues.length ? {
    success: !1,
    error: new e(o.issues.map((a) => rt(a, i, nt())))
  } : { success: !0, data: o.value };
}, fs = /* @__PURE__ */ Ci(Mi), ds = /^[cC][^\s-]{8,}$/, ps = /^[0-9a-z]+$/, gs = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, vs = /^[0-9a-vA-V]{20}$/, _s = /^[A-Za-z0-9]{27}$/, ms = /^[a-zA-Z0-9_-]{21}$/, ys = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, bs = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, Ar = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/, ws = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, xs = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function ks() {
  return new RegExp(xs, "u");
}
const Es = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Ns = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, $s = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, zs = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ts = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Si = /^[A-Za-z0-9_-]*$/, jn = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, Ms = /^\+(?:[0-9]){6,14}[0-9]$/, Oi = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Is = new RegExp(`^${Oi}$`);
function Pi(e) {
  let t = "([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d";
  return e.precision ? t = `${t}\\.\\d{${e.precision}}` : e.precision == null && (t = `${t}(\\.\\d+)?`), t;
}
function Cs(e) {
  return new RegExp(`^${Pi(e)}$`);
}
function Ss(e) {
  let t = `${Oi}T${Pi(e)}`;
  const n = [];
  return n.push(e.local ? "Z?" : "Z"), e.offset && n.push("([+-]\\d{2}:?\\d{2})"), t = `${t}(${n.join("|")})`, new RegExp(`^${t}$`);
}
const Os = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, Ps = /^\d+$/, As = /^-?\d+(?:\.\d+)?/i, Fs = /true|false/i, Zs = /^[^A-Z]*$/, Ls = /^[^a-z]*$/, ze = /* @__PURE__ */ z("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Ai = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Fi = /* @__PURE__ */ z("$ZodCheckLessThan", (e, t) => {
  ze.init(e, t);
  const n = Ai[typeof t.value];
  e._zod.onattach.push((r) => {
    const i = r._zod.bag, o = (t.inclusive ? i.maximum : i.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < o && (t.inclusive ? i.maximum = t.value : i.exclusiveMaximum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: n,
      code: "too_big",
      maximum: t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Zi = /* @__PURE__ */ z("$ZodCheckGreaterThan", (e, t) => {
  ze.init(e, t);
  const n = Ai[typeof t.value];
  e._zod.onattach.push((r) => {
    const i = r._zod.bag, o = (t.inclusive ? i.minimum : i.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > o && (t.inclusive ? i.minimum = t.value : i.exclusiveMinimum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: n,
      code: "too_small",
      minimum: t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), js = /* @__PURE__ */ z("$ZodCheckMultipleOf", (e, t) => {
  ze.init(e, t), e._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Wa(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Bs = /* @__PURE__ */ z("$ZodCheckNumberFormat", (e, t) => {
  var a;
  ze.init(e, t), t.format = t.format || "float64";
  const n = (a = t.format) == null ? void 0 : a.includes("int"), r = n ? "int" : "number", [i, o] = es[t.format];
  e._zod.onattach.push((u) => {
    const s = u._zod.bag;
    s.format = t.format, s.minimum = i, s.maximum = o, n && (s.pattern = Ps);
  }), e._zod.check = (u) => {
    const s = u.value;
    if (n) {
      if (!Number.isInteger(s)) {
        u.issues.push({
          expected: r,
          format: t.format,
          code: "invalid_type",
          input: s,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(s)) {
        s > 0 ? u.issues.push({
          input: s,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          continue: !t.abort
        }) : u.issues.push({
          input: s,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          continue: !t.abort
        });
        return;
      }
    }
    s < i && u.issues.push({
      origin: "number",
      input: s,
      code: "too_small",
      minimum: i,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), s > o && u.issues.push({
      origin: "number",
      input: s,
      code: "too_big",
      maximum: o,
      inst: e
    });
  };
}), Rs = /* @__PURE__ */ z("$ZodCheckMaxLength", (e, t) => {
  ze.init(e, t), e._zod.when = (n) => {
    const r = n.value;
    return !tr(r) && r.length !== void 0;
  }, e._zod.onattach.push((n) => {
    const r = n._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < r && (n._zod.bag.maximum = t.maximum);
  }), e._zod.check = (n) => {
    const r = n.value;
    if (r.length <= t.maximum)
      return;
    const o = ir(r);
    n.issues.push({
      origin: o,
      code: "too_big",
      maximum: t.maximum,
      input: r,
      inst: e,
      continue: !t.abort
    });
  };
}), Ds = /* @__PURE__ */ z("$ZodCheckMinLength", (e, t) => {
  ze.init(e, t), e._zod.when = (n) => {
    const r = n.value;
    return !tr(r) && r.length !== void 0;
  }, e._zod.onattach.push((n) => {
    const r = n._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > r && (n._zod.bag.minimum = t.minimum);
  }), e._zod.check = (n) => {
    const r = n.value;
    if (r.length >= t.minimum)
      return;
    const o = ir(r);
    n.issues.push({
      origin: o,
      code: "too_small",
      minimum: t.minimum,
      input: r,
      inst: e,
      continue: !t.abort
    });
  };
}), Us = /* @__PURE__ */ z("$ZodCheckLengthEquals", (e, t) => {
  ze.init(e, t), e._zod.when = (n) => {
    const r = n.value;
    return !tr(r) && r.length !== void 0;
  }, e._zod.onattach.push((n) => {
    const r = n._zod.bag;
    r.minimum = t.length, r.maximum = t.length, r.length = t.length;
  }), e._zod.check = (n) => {
    const r = n.value, i = r.length;
    if (i === t.length)
      return;
    const o = ir(r), a = i > t.length;
    n.issues.push({
      origin: o,
      ...a ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), mn = /* @__PURE__ */ z("$ZodCheckStringFormat", (e, t) => {
  var n;
  ze.init(e, t), e._zod.onattach.push((r) => {
    r._zod.bag.format = t.format, t.pattern && (r._zod.bag.pattern = t.pattern);
  }), (n = e._zod).check ?? (n.check = (r) => {
    if (!t.pattern)
      throw new Error("Not implemented.");
    t.pattern.lastIndex = 0, !t.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: r.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  });
}), qs = /* @__PURE__ */ z("$ZodCheckRegex", (e, t) => {
  mn.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), Gs = /* @__PURE__ */ z("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Zs), mn.init(e, t);
}), Hs = /* @__PURE__ */ z("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Ls), mn.init(e, t);
}), Ks = /* @__PURE__ */ z("$ZodCheckIncludes", (e, t) => {
  ze.init(e, t);
  const n = new RegExp(Ft(t.includes));
  t.pattern = n, e._zod.onattach.push((r) => {
    r._zod.bag.pattern = n;
  }), e._zod.check = (r) => {
    r.value.includes(t.includes, t.position) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Vs = /* @__PURE__ */ z("$ZodCheckStartsWith", (e, t) => {
  ze.init(e, t);
  const n = new RegExp(`^${Ft(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    r._zod.bag.pattern = n;
  }), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ws = /* @__PURE__ */ z("$ZodCheckEndsWith", (e, t) => {
  ze.init(e, t);
  const n = new RegExp(`.*${Ft(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    r._zod.bag.pattern = new RegExp(`.*${Ft(t.suffix)}$`);
  }), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Js = /* @__PURE__ */ z("$ZodCheckOverwrite", (e, t) => {
  ze.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Qs {
  constructor(t = []) {
    this.content = [], this.indent = 0, this && (this.args = t);
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((a) => a), i = Math.min(...r.map((a) => a.length - a.trimStart().length)), o = r.map((a) => a.slice(i)).map((a) => " ".repeat(this.indent * 2) + a);
    for (const a of o)
      this.content.push(a);
  }
  compile() {
    const t = Function, n = this == null ? void 0 : this.args, i = [...((this == null ? void 0 : this.content) ?? [""]).map((o) => `  ${o}`)];
    return new t(...n, i.join(`
`));
  }
}
const Ys = {
  major: 4,
  minor: 0,
  patch: 0
}, ge = /* @__PURE__ */ z("$ZodType", (e, t) => {
  var i;
  var n;
  e ?? (e = {}), e._zod.id = t.type + "_" + $i(10), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Ys;
  const r = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && r.unshift(e);
  for (const o of r)
    for (const a of o._zod.onattach)
      a(e);
  if (r.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), (i = e._zod.deferred) == null || i.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const o = (a, u, s) => {
      let h = St(a), d;
      for (const p of u) {
        if (p._zod.when) {
          if (!p._zod.when(a))
            continue;
        } else if (h)
          continue;
        const y = a.issues.length, w = p._zod.check(a);
        if (w instanceof Promise && (s == null ? void 0 : s.async) === !1)
          throw new At();
        if (d || w instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await w, a.issues.length !== y && (h || (h = St(a, y)));
          });
        else {
          if (a.issues.length === y)
            continue;
          h || (h = St(a, y));
        }
      }
      return d ? d.then(() => a) : a;
    };
    e._zod.run = (a, u) => {
      const s = e._zod.parse(a, u);
      if (s instanceof Promise) {
        if (u.async === !1)
          throw new At();
        return s.then((h) => o(h, r, u));
      }
      return o(s, r, u);
    };
  }
  e["~standard"] = {
    validate: (o) => {
      var a;
      try {
        const u = ls(e, o);
        return u.success ? { value: u.data } : { issues: (a = u.error) == null ? void 0 : a.issues };
      } catch {
        return fs(e, o).then((s) => {
          var h;
          return s.success ? { value: s.data } : { issues: (h = s.error) == null ? void 0 : h.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), or = /* @__PURE__ */ z("$ZodString", (e, t) => {
  var n;
  ge.init(e, t), e._zod.pattern = ((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.pattern) ?? Os(e._zod.bag), e._zod.parse = (r, i) => {
    if (t.coerce)
      try {
        r.value = String(r.value);
      } catch {
      }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: e
    }), r;
  };
}), le = /* @__PURE__ */ z("$ZodStringFormat", (e, t) => {
  mn.init(e, t), or.init(e, t);
}), Xs = /* @__PURE__ */ z("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = bs), le.init(e, t);
}), eu = /* @__PURE__ */ z("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = Ar(r));
  } else
    t.pattern ?? (t.pattern = Ar());
  le.init(e, t);
}), tu = /* @__PURE__ */ z("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = ws), le.init(e, t);
}), nu = /* @__PURE__ */ z("$ZodURL", (e, t) => {
  le.init(e, t), e._zod.check = (n) => {
    try {
      const r = new URL(n.value);
      jn.lastIndex = 0, jn.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: jn.source,
        input: n.value,
        inst: e
      }), t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e
      }));
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e
      });
    }
  };
}), ru = /* @__PURE__ */ z("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = ks()), le.init(e, t);
}), iu = /* @__PURE__ */ z("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = ms), le.init(e, t);
}), ou = /* @__PURE__ */ z("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = ds), le.init(e, t);
}), au = /* @__PURE__ */ z("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = ps), le.init(e, t);
}), su = /* @__PURE__ */ z("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = gs), le.init(e, t);
}), uu = /* @__PURE__ */ z("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = vs), le.init(e, t);
}), cu = /* @__PURE__ */ z("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = _s), le.init(e, t);
}), hu = /* @__PURE__ */ z("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Ss(t)), le.init(e, t);
}), lu = /* @__PURE__ */ z("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Is), le.init(e, t);
}), fu = /* @__PURE__ */ z("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Cs(t)), le.init(e, t);
}), du = /* @__PURE__ */ z("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = ys), le.init(e, t);
}), pu = /* @__PURE__ */ z("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = Es), le.init(e, t), e._zod.onattach.push((n) => {
    n._zod.bag.format = "ipv4";
  });
}), gu = /* @__PURE__ */ z("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Ns), le.init(e, t), e._zod.onattach.push((n) => {
    n._zod.bag.format = "ipv6";
  }), e._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: e
      });
    }
  };
}), vu = /* @__PURE__ */ z("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = $s), le.init(e, t);
}), _u = /* @__PURE__ */ z("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = zs), le.init(e, t), e._zod.check = (n) => {
    const [r, i] = n.value.split("/");
    try {
      if (!i)
        throw new Error();
      const o = Number(i);
      if (`${o}` !== i)
        throw new Error();
      if (o < 0 || o > 128)
        throw new Error();
      new URL(`http://[${r}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: n.value,
        inst: e
      });
    }
  };
});
function Li(e) {
  if (e === "")
    return !0;
  if (e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const mu = /* @__PURE__ */ z("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Ts), le.init(e, t), e._zod.onattach.push((n) => {
    n._zod.bag.contentEncoding = "base64";
  }), e._zod.check = (n) => {
    Li(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e
    });
  };
});
function yu(e) {
  if (!Si.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Li(n);
}
const bu = /* @__PURE__ */ z("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Si), le.init(e, t), e._zod.onattach.push((n) => {
    n._zod.bag.contentEncoding = "base64url";
  }), e._zod.check = (n) => {
    yu(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e
    });
  };
}), wu = /* @__PURE__ */ z("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Ms), le.init(e, t);
});
function xu(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n, i = JSON.parse(atob(r));
    return !("typ" in i && (i == null ? void 0 : i.typ) !== "JWT" || !i.alg || t && (!("alg" in i) || i.alg !== t));
  } catch {
    return !1;
  }
}
const ku = /* @__PURE__ */ z("$ZodJWT", (e, t) => {
  le.init(e, t), e._zod.check = (n) => {
    xu(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e
    });
  };
}), ji = /* @__PURE__ */ z("$ZodNumber", (e, t) => {
  ge.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? As, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const i = n.value;
    if (typeof i == "number" && !Number.isNaN(i) && Number.isFinite(i))
      return n;
    const o = typeof i == "number" ? Number.isNaN(i) ? "NaN" : Number.isFinite(i) ? void 0 : "Infinity" : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: i,
      inst: e,
      ...o ? { received: o } : {}
    }), n;
  };
}), Eu = /* @__PURE__ */ z("$ZodNumber", (e, t) => {
  Bs.init(e, t), ji.init(e, t);
}), Nu = /* @__PURE__ */ z("$ZodBoolean", (e, t) => {
  ge.init(e, t), e._zod.pattern = Fs, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const i = n.value;
    return typeof i == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: i,
      inst: e
    }), n;
  };
}), $u = /* @__PURE__ */ z("$ZodUnknown", (e, t) => {
  ge.init(e, t), e._zod.parse = (n) => n;
}), zu = /* @__PURE__ */ z("$ZodNever", (e, t) => {
  ge.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Fr(e, t, n) {
  e.issues.length && t.issues.push(...rr(n, e.issues)), t.value[n] = e.value;
}
const Tu = /* @__PURE__ */ z("$ZodArray", (e, t) => {
  ge.init(e, t), e._zod.parse = (n, r) => {
    const i = n.value;
    if (!Array.isArray(i))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: i,
        inst: e
      }), n;
    n.value = Array(i.length);
    const o = [];
    for (let a = 0; a < i.length; a++) {
      const u = i[a], s = t.element._zod.run({
        value: u,
        issues: []
      }, r);
      s instanceof Promise ? o.push(s.then((h) => Fr(h, n, a))) : Fr(s, n, a);
    }
    return o.length ? Promise.all(o).then(() => n) : n;
  };
});
function rn(e, t, n) {
  e.issues.length && t.issues.push(...rr(n, e.issues)), t.value[n] = e.value;
}
function Zr(e, t, n, r) {
  e.issues.length ? r[n] === void 0 ? n in r ? t.value[n] = void 0 : t.value[n] = e.value : t.issues.push(...rr(n, e.issues)) : e.value === void 0 ? n in r && (t.value[n] = void 0) : t.value[n] = e.value;
}
const Mu = /* @__PURE__ */ z("$ZodObject", (e, t) => {
  ge.init(e, t);
  const n = Ni(() => {
    const p = Object.keys(t.shape), y = Xa(t.shape);
    return {
      shape: t.shape,
      keys: p,
      keySet: new Set(p),
      numKeys: p.length,
      optionalKeys: new Set(y)
    };
  });
  pe(e._zod, "disc", () => {
    const p = t.shape, y = /* @__PURE__ */ new Map();
    let w = !1;
    for (const m in p) {
      const E = p[m]._zod;
      if (E.values || E.disc) {
        w = !0;
        const k = {
          values: new Set(E.values ?? []),
          maps: E.disc ? [E.disc] : []
        };
        y.set(m, k);
      }
    }
    if (w)
      return y;
  });
  const r = (p) => {
    const y = new Qs(["shape", "payload", "ctx"]), { keys: w, optionalKeys: m } = n.value, E = (N) => {
      const $ = zt(N);
      return `shape[${$}]._zod.run({ value: input[${$}], issues: [] }, ctx)`;
    };
    y.write("const input = payload.value;");
    const k = /* @__PURE__ */ Object.create(null);
    for (const N of w)
      k[N] = $i(15);
    y.write("const newResult = {}");
    for (const N of w)
      if (m.has(N)) {
        const $ = k[N];
        y.write(`const ${$} = ${E(N)};`);
        const T = zt(N);
        y.write(`
        if (${$}.issues.length) {
          if (input[${T}] === undefined) {
            if (${T} in input) {
              newResult[${T}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${$}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${T}, ...iss.path] : [${T}],
              }))
            );
          }
        } else if (${$}.value === undefined) {
          if (${T} in input) newResult[${T}] = undefined;
        } else {
          newResult[${T}] = ${$}.value;
        }
        `);
      } else {
        const $ = k[N];
        y.write(`const ${$} = ${E(N)};`), y.write(`
          if (${$}.issues.length) payload.issues = payload.issues.concat(${$}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${zt(N)}, ...iss.path] : [${zt(N)}]
          })));`), y.write(`newResult[${zt(N)}] = ${$}.value`);
      }
    y.write("payload.value = newResult;"), y.write("return payload;");
    const _ = y.compile();
    return (N, $) => _(p, N, $);
  };
  let i;
  const o = Ja, a = !Hn.jitless, s = a && Qa.value, { catchall: h } = t;
  let d;
  e._zod.parse = (p, y) => {
    d ?? (d = n.value);
    const w = p.value;
    if (!o(w))
      return p.issues.push({
        expected: "object",
        code: "invalid_type",
        input: w,
        inst: e
      }), p;
    const m = [];
    if (a && s && (y == null ? void 0 : y.async) === !1 && y.jitless !== !0)
      i || (i = r(t.shape)), p = i(p, y);
    else {
      p.value = {};
      const $ = d.shape;
      for (const T of d.keys) {
        const M = $[T], S = M._zod.run({ value: w[T], issues: [] }, y), B = M._zod.optin === "optional";
        S instanceof Promise ? m.push(S.then((D) => B ? Zr(D, p, T, w) : rn(D, p, T))) : B ? Zr(S, p, T, w) : rn(S, p, T);
      }
    }
    if (!h)
      return m.length ? Promise.all(m).then(() => p) : p;
    const E = [], k = d.keySet, _ = h._zod, N = _.def.type;
    for (const $ of Object.keys(w)) {
      if (k.has($))
        continue;
      if (N === "never") {
        E.push($);
        continue;
      }
      const T = _.run({ value: w[$], issues: [] }, y);
      T instanceof Promise ? m.push(T.then((M) => rn(M, p, $))) : rn(T, p, $);
    }
    return E.length && p.issues.push({
      code: "unrecognized_keys",
      keys: E,
      input: w,
      inst: e
    }), m.length ? Promise.all(m).then(() => p) : p;
  };
});
function Lr(e, t, n, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  return t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((o) => rt(o, r, nt())))
  }), t;
}
const Iu = /* @__PURE__ */ z("$ZodUnion", (e, t) => {
  ge.init(e, t), pe(e._zod, "values", () => {
    if (t.options.every((n) => n._zod.values))
      return new Set(t.options.flatMap((n) => Array.from(n._zod.values)));
  }), pe(e._zod, "pattern", () => {
    if (t.options.every((n) => n._zod.pattern)) {
      const n = t.options.map((r) => r._zod.pattern);
      return new RegExp(`^(${n.map((r) => nr(r.source)).join("|")})$`);
    }
  }), e._zod.parse = (n, r) => {
    let i = !1;
    const o = [];
    for (const a of t.options) {
      const u = a._zod.run({
        value: n.value,
        issues: []
      }, r);
      if (u instanceof Promise)
        o.push(u), i = !0;
      else {
        if (u.issues.length === 0)
          return u;
        o.push(u);
      }
    }
    return i ? Promise.all(o).then((a) => Lr(a, n, e, r)) : Lr(o, n, e, r);
  };
}), Cu = /* @__PURE__ */ z("$ZodIntersection", (e, t) => {
  ge.init(e, t), e._zod.parse = (n, r) => {
    const { value: i } = n, o = t.left._zod.run({ value: i, issues: [] }, r), a = t.right._zod.run({ value: i, issues: [] }, r);
    return o instanceof Promise || a instanceof Promise ? Promise.all([o, a]).then(([s, h]) => jr(n, s, h)) : jr(n, o, a);
  };
});
function Kn(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (Pr(e) && Pr(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((o) => n.indexOf(o) !== -1), i = { ...e, ...t };
    for (const o of r) {
      const a = Kn(e[o], t[o]);
      if (!a.valid)
        return {
          valid: !1,
          mergeErrorPath: [o, ...a.mergeErrorPath]
        };
      i[o] = a.data;
    }
    return { valid: !0, data: i };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const i = e[r], o = t[r], a = Kn(i, o);
      if (!a.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...a.mergeErrorPath]
        };
      n.push(a.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function jr(e, t, n) {
  if (t.issues.length && e.issues.push(...t.issues), n.issues.length && e.issues.push(...n.issues), St(e))
    return e;
  const r = Kn(t.value, n.value);
  if (!r.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);
  return e.value = r.data, e;
}
const Su = /* @__PURE__ */ z("$ZodEnum", (e, t) => {
  ge.init(e, t);
  const n = Object.values(t.entries).filter((i) => typeof i == "number"), r = Object.entries(t.entries).filter(([i, o]) => n.indexOf(+i) === -1).map(([i, o]) => o);
  e._zod.values = new Set(r), e._zod.pattern = new RegExp(`^(${r.filter((i) => Ya.has(typeof i)).map((i) => typeof i == "string" ? Ft(i) : i.toString()).join("|")})$`), e._zod.parse = (i, o) => {
    const a = i.value;
    return e._zod.values.has(a) || i.issues.push({
      code: "invalid_value",
      values: r,
      input: a,
      inst: e
    }), i;
  };
}), Ou = /* @__PURE__ */ z("$ZodTransform", (e, t) => {
  ge.init(e, t), e._zod.parse = (n, r) => {
    const i = t.transform(n.value, n);
    if (r.async)
      return (i instanceof Promise ? i : Promise.resolve(i)).then((a) => (n.value = a, n));
    if (i instanceof Promise)
      throw new At();
    return n.value = i, n;
  };
}), Pu = /* @__PURE__ */ z("$ZodOptional", (e, t) => {
  ge.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", pe(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), pe(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${nr(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => n.value === void 0 ? n : t.innerType._zod.run(n, r);
}), Au = /* @__PURE__ */ z("$ZodNullable", (e, t) => {
  ge.init(e, t), pe(e._zod, "optin", () => t.innerType._zod.optin), pe(e._zod, "optout", () => t.innerType._zod.optout), pe(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${nr(n.source)}|null)$`) : void 0;
  }), pe(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), Fu = /* @__PURE__ */ z("$ZodDefault", (e, t) => {
  ge.init(e, t), e._zod.optin = "optional", pe(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const i = t.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => Br(o, t)) : Br(i, t);
  };
});
function Br(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Zu = /* @__PURE__ */ z("$ZodPrefault", (e, t) => {
  ge.init(e, t), e._zod.optin = "optional", pe(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Lu = /* @__PURE__ */ z("$ZodNonOptional", (e, t) => {
  ge.init(e, t), pe(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const i = t.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => Rr(o, e)) : Rr(i, e);
  };
});
function Rr(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const ju = /* @__PURE__ */ z("$ZodCatch", (e, t) => {
  ge.init(e, t), pe(e._zod, "optin", () => t.innerType._zod.optin), pe(e._zod, "optout", () => t.innerType._zod.optout), pe(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    const i = t.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => (n.value = o.value, o.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: o.issues.map((a) => rt(a, r, nt()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = i.value, i.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: i.issues.map((o) => rt(o, r, nt()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), Bu = /* @__PURE__ */ z("$ZodPipe", (e, t) => {
  ge.init(e, t), pe(e._zod, "values", () => t.in._zod.values), pe(e._zod, "optin", () => t.in._zod.optin), pe(e._zod, "optout", () => t.out._zod.optout), e._zod.parse = (n, r) => {
    const i = t.in._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => Dr(o, t, r)) : Dr(i, t, r);
  };
});
function Dr(e, t, n) {
  return St(e) ? e : t.out._zod.run({ value: e.value, issues: e.issues }, n);
}
const Ru = /* @__PURE__ */ z("$ZodReadonly", (e, t) => {
  ge.init(e, t), pe(e._zod, "disc", () => t.innerType._zod.disc), pe(e._zod, "optin", () => t.innerType._zod.optin), pe(e._zod, "optout", () => t.innerType._zod.optout), e._zod.parse = (n, r) => {
    const i = t.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then(Ur) : Ur(i);
  };
});
function Ur(e) {
  return e.value = Object.freeze(e.value), e;
}
const Du = /* @__PURE__ */ z("$ZodCustom", (e, t) => {
  ze.init(e, t), ge.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, i = t.fn(r);
    if (i instanceof Promise)
      return i.then((o) => qr(o, n, r, e));
    qr(i, n, r, e);
  };
});
function qr(e, t, n, r) {
  if (!e) {
    const i = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (i.params = r._zod.def.params), t.issues.push(Zt(i));
  }
}
class Uu {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    if (this._map.set(t, r), r && typeof r == "object" && "id" in r) {
      if (this._idmap.has(r.id))
        throw new Error(`ID ${r.id} already exists in the registry`);
      this._idmap.set(r.id, t);
    }
    return this;
  }
  remove(t) {
    return this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      return delete r.id, { ...r, ...this._map.get(t) };
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function qu() {
  return new Uu();
}
const on = /* @__PURE__ */ qu();
function Gu(e, t) {
  return new e({
    type: "string",
    ...q(t)
  });
}
function Hu(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function Gr(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function Ku(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function Vu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...q(t)
  });
}
function Wu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...q(t)
  });
}
function Ju(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...q(t)
  });
}
function Qu(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function Yu(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function Xu(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function ec(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function tc(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function nc(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function rc(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function ic(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function oc(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function ac(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function sc(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function uc(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function cc(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function hc(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function lc(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function fc(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...q(t)
  });
}
function dc(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...q(t)
  });
}
function pc(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...q(t)
  });
}
function gc(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...q(t)
  });
}
function vc(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...q(t)
  });
}
function _c(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...q(t)
  });
}
function mc(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...q(t)
  });
}
function yc(e, t) {
  return new e({
    type: "boolean",
    ...q(t)
  });
}
function bc(e) {
  return new e({
    type: "unknown"
  });
}
function wc(e, t) {
  return new e({
    type: "never",
    ...q(t)
  });
}
function Hr(e, t) {
  return new Fi({
    check: "less_than",
    ...q(t),
    value: e,
    inclusive: !1
  });
}
function Bn(e, t) {
  return new Fi({
    check: "less_than",
    ...q(t),
    value: e,
    inclusive: !0
  });
}
function Kr(e, t) {
  return new Zi({
    check: "greater_than",
    ...q(t),
    value: e,
    inclusive: !1
  });
}
function Rn(e, t) {
  return new Zi({
    check: "greater_than",
    ...q(t),
    value: e,
    inclusive: !0
  });
}
function Vr(e, t) {
  return new js({
    check: "multiple_of",
    ...q(t),
    value: e
  });
}
function Bi(e, t) {
  return new Rs({
    check: "max_length",
    ...q(t),
    maximum: e
  });
}
function hn(e, t) {
  return new Ds({
    check: "min_length",
    ...q(t),
    minimum: e
  });
}
function Ri(e, t) {
  return new Us({
    check: "length_equals",
    ...q(t),
    length: e
  });
}
function xc(e, t) {
  return new qs({
    check: "string_format",
    format: "regex",
    ...q(t),
    pattern: e
  });
}
function kc(e) {
  return new Gs({
    check: "string_format",
    format: "lowercase",
    ...q(e)
  });
}
function Ec(e) {
  return new Hs({
    check: "string_format",
    format: "uppercase",
    ...q(e)
  });
}
function Nc(e, t) {
  return new Ks({
    check: "string_format",
    format: "includes",
    ...q(t),
    includes: e
  });
}
function $c(e, t) {
  return new Vs({
    check: "string_format",
    format: "starts_with",
    ...q(t),
    prefix: e
  });
}
function zc(e, t) {
  return new Ws({
    check: "string_format",
    format: "ends_with",
    ...q(t),
    suffix: e
  });
}
function Bt(e) {
  return new Js({
    check: "overwrite",
    tx: e
  });
}
function Tc(e) {
  return Bt((t) => t.normalize(e));
}
function Mc() {
  return Bt((e) => e.trim());
}
function Ic() {
  return Bt((e) => e.toLowerCase());
}
function Cc() {
  return Bt((e) => e.toUpperCase());
}
function Sc(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...q(n)
  });
}
function Oc(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...q(n)
  });
}
const Pc = /* @__PURE__ */ z("ZodISODateTime", (e, t) => {
  hu.init(e, t), fe.init(e, t);
});
function Ac(e) {
  return dc(Pc, e);
}
const Fc = /* @__PURE__ */ z("ZodISODate", (e, t) => {
  lu.init(e, t), fe.init(e, t);
});
function Zc(e) {
  return pc(Fc, e);
}
const Lc = /* @__PURE__ */ z("ZodISOTime", (e, t) => {
  fu.init(e, t), fe.init(e, t);
});
function jc(e) {
  return gc(Lc, e);
}
const Bc = /* @__PURE__ */ z("ZodISODuration", (e, t) => {
  du.init(e, t), fe.init(e, t);
});
function Rc(e) {
  return vc(Bc, e);
}
const Dc = (e, t) => {
  Ti.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => us(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => ss(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => e.issues.push(n)
      // enumerable: false,
    },
    addIssues: {
      value: (n) => e.issues.push(...n)
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, yn = z("ZodError", Dc, {
  Parent: Error
}), Uc = /* @__PURE__ */ cs(yn), qc = /* @__PURE__ */ hs(yn), Gc = /* @__PURE__ */ Ii(yn), Hc = /* @__PURE__ */ Ci(yn), ve = /* @__PURE__ */ z("ZodType", (e, t) => (ge.init(e, t), e.def = t, Object.defineProperty(e, "_def", { value: t }), e.check = (...n) => e.clone(
  {
    ...t,
    checks: [
      ...t.checks ?? [],
      ...n.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
    ]
  }
  // { parent: true }
), e.clone = (n, r) => ot(e, n, r), e.brand = () => e, e.register = (n, r) => (n.add(e, r), e), e.parse = (n, r) => Uc(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => Gc(e, n, r), e.parseAsync = async (n, r) => qc(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => Hc(e, n, r), e.spa = e.safeParseAsync, e.refine = (n, r) => e.check(Oh(n, r)), e.superRefine = (n) => e.check(Ph(n)), e.overwrite = (n) => e.check(Bt(n)), e.optional = () => fn(e), e.nullable = () => Yr(e), e.nullish = () => fn(Yr(e)), e.nonoptional = (n) => $h(e, n), e.array = () => Gi(e), e.or = (n) => _h([e, n]), e.and = (n) => yh(e, n), e.transform = (n) => Xr(e, ar(n)), e.default = (n) => kh(e, n), e.prefault = (n) => Nh(e, n), e.catch = (n) => Th(e, n), e.pipe = (n) => Xr(e, n), e.readonly = () => Ch(e), e.describe = (n) => {
  const r = e.clone();
  return on.add(r, { description: n }), r;
}, Object.defineProperty(e, "description", {
  get() {
    var n;
    return (n = on.get(e)) == null ? void 0 : n.description;
  },
  configurable: !0
}), e.meta = (...n) => {
  if (n.length === 0)
    return on.get(e);
  const r = e.clone();
  return on.add(r, n[0]), r;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e)), Di = /* @__PURE__ */ z("_ZodString", (e, t) => {
  or.init(e, t), ve.init(e, t);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, e.regex = (...r) => e.check(xc(...r)), e.includes = (...r) => e.check(Nc(...r)), e.startsWith = (r) => e.check($c(r)), e.endsWith = (r) => e.check(zc(r)), e.min = (...r) => e.check(hn(...r)), e.max = (...r) => e.check(Bi(...r)), e.length = (...r) => e.check(Ri(...r)), e.nonempty = (...r) => e.check(hn(1, ...r)), e.lowercase = (r) => e.check(kc(r)), e.uppercase = (r) => e.check(Ec(r)), e.trim = () => e.check(Mc()), e.normalize = (...r) => e.check(Tc(...r)), e.toLowerCase = () => e.check(Ic()), e.toUpperCase = () => e.check(Cc());
}), Kc = /* @__PURE__ */ z("ZodString", (e, t) => {
  or.init(e, t), Di.init(e, t), e.email = (n) => e.check(Hu(Vc, n)), e.url = (n) => e.check(Qu(Wc, n)), e.jwt = (n) => e.check(fc(hh, n)), e.emoji = (n) => e.check(Yu(Jc, n)), e.guid = (n) => e.check(Gr(Wr, n)), e.uuid = (n) => e.check(Ku(an, n)), e.uuidv4 = (n) => e.check(Vu(an, n)), e.uuidv6 = (n) => e.check(Wu(an, n)), e.uuidv7 = (n) => e.check(Ju(an, n)), e.nanoid = (n) => e.check(Xu(Qc, n)), e.guid = (n) => e.check(Gr(Wr, n)), e.cuid = (n) => e.check(ec(Yc, n)), e.cuid2 = (n) => e.check(tc(Xc, n)), e.ulid = (n) => e.check(nc(eh, n)), e.base64 = (n) => e.check(cc(sh, n)), e.base64url = (n) => e.check(hc(uh, n)), e.xid = (n) => e.check(rc(th, n)), e.ksuid = (n) => e.check(ic(nh, n)), e.ipv4 = (n) => e.check(oc(rh, n)), e.ipv6 = (n) => e.check(ac(ih, n)), e.cidrv4 = (n) => e.check(sc(oh, n)), e.cidrv6 = (n) => e.check(uc(ah, n)), e.e164 = (n) => e.check(lc(ch, n)), e.datetime = (n) => e.check(Ac(n)), e.date = (n) => e.check(Zc(n)), e.time = (n) => e.check(jc(n)), e.duration = (n) => e.check(Rc(n));
});
function Oe(e) {
  return Gu(Kc, e);
}
const fe = /* @__PURE__ */ z("ZodStringFormat", (e, t) => {
  le.init(e, t), Di.init(e, t);
}), Vc = /* @__PURE__ */ z("ZodEmail", (e, t) => {
  tu.init(e, t), fe.init(e, t);
}), Wr = /* @__PURE__ */ z("ZodGUID", (e, t) => {
  Xs.init(e, t), fe.init(e, t);
}), an = /* @__PURE__ */ z("ZodUUID", (e, t) => {
  eu.init(e, t), fe.init(e, t);
}), Wc = /* @__PURE__ */ z("ZodURL", (e, t) => {
  nu.init(e, t), fe.init(e, t);
}), Jc = /* @__PURE__ */ z("ZodEmoji", (e, t) => {
  ru.init(e, t), fe.init(e, t);
}), Qc = /* @__PURE__ */ z("ZodNanoID", (e, t) => {
  iu.init(e, t), fe.init(e, t);
}), Yc = /* @__PURE__ */ z("ZodCUID", (e, t) => {
  ou.init(e, t), fe.init(e, t);
}), Xc = /* @__PURE__ */ z("ZodCUID2", (e, t) => {
  au.init(e, t), fe.init(e, t);
}), eh = /* @__PURE__ */ z("ZodULID", (e, t) => {
  su.init(e, t), fe.init(e, t);
}), th = /* @__PURE__ */ z("ZodXID", (e, t) => {
  uu.init(e, t), fe.init(e, t);
}), nh = /* @__PURE__ */ z("ZodKSUID", (e, t) => {
  cu.init(e, t), fe.init(e, t);
}), rh = /* @__PURE__ */ z("ZodIPv4", (e, t) => {
  pu.init(e, t), fe.init(e, t);
}), ih = /* @__PURE__ */ z("ZodIPv6", (e, t) => {
  gu.init(e, t), fe.init(e, t);
}), oh = /* @__PURE__ */ z("ZodCIDRv4", (e, t) => {
  vu.init(e, t), fe.init(e, t);
}), ah = /* @__PURE__ */ z("ZodCIDRv6", (e, t) => {
  _u.init(e, t), fe.init(e, t);
}), sh = /* @__PURE__ */ z("ZodBase64", (e, t) => {
  mu.init(e, t), fe.init(e, t);
}), uh = /* @__PURE__ */ z("ZodBase64URL", (e, t) => {
  bu.init(e, t), fe.init(e, t);
}), ch = /* @__PURE__ */ z("ZodE164", (e, t) => {
  wu.init(e, t), fe.init(e, t);
}), hh = /* @__PURE__ */ z("ZodJWT", (e, t) => {
  ku.init(e, t), fe.init(e, t);
}), Ui = /* @__PURE__ */ z("ZodNumber", (e, t) => {
  ji.init(e, t), ve.init(e, t), e.gt = (r, i) => e.check(Kr(r, i)), e.gte = (r, i) => e.check(Rn(r, i)), e.min = (r, i) => e.check(Rn(r, i)), e.lt = (r, i) => e.check(Hr(r, i)), e.lte = (r, i) => e.check(Bn(r, i)), e.max = (r, i) => e.check(Bn(r, i)), e.int = (r) => e.check(Jr(r)), e.safe = (r) => e.check(Jr(r)), e.positive = (r) => e.check(Kr(0, r)), e.nonnegative = (r) => e.check(Rn(0, r)), e.negative = (r) => e.check(Hr(0, r)), e.nonpositive = (r) => e.check(Bn(0, r)), e.multipleOf = (r, i) => e.check(Vr(r, i)), e.step = (r, i) => e.check(Vr(r, i)), e.finite = () => e;
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function Xe(e) {
  return _c(Ui, e);
}
const lh = /* @__PURE__ */ z("ZodNumberFormat", (e, t) => {
  Eu.init(e, t), Ui.init(e, t);
});
function Jr(e) {
  return mc(lh, e);
}
const fh = /* @__PURE__ */ z("ZodBoolean", (e, t) => {
  Nu.init(e, t), ve.init(e, t);
});
function ln(e) {
  return yc(fh, e);
}
const dh = /* @__PURE__ */ z("ZodUnknown", (e, t) => {
  $u.init(e, t), ve.init(e, t);
});
function Qr() {
  return bc(dh);
}
const ph = /* @__PURE__ */ z("ZodNever", (e, t) => {
  zu.init(e, t), ve.init(e, t);
});
function qi(e) {
  return wc(ph, e);
}
const gh = /* @__PURE__ */ z("ZodArray", (e, t) => {
  Tu.init(e, t), ve.init(e, t), e.element = t.element, e.min = (n, r) => e.check(hn(n, r)), e.nonempty = (n) => e.check(hn(1, n)), e.max = (n, r) => e.check(Bi(n, r)), e.length = (n, r) => e.check(Ri(n, r));
});
function Gi(e, t) {
  return Sc(gh, e, t);
}
const Hi = /* @__PURE__ */ z("ZodObject", (e, t) => {
  Mu.init(e, t), ve.init(e, t), pe(e, "shape", () => Object.fromEntries(Object.entries(e._zod.def.shape))), e.keyof = () => bn(Object.keys(e._zod.def.shape)), e.catchall = (n) => e.clone({ ...e._zod.def, catchall: n }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: Qr() }), e.loose = () => e.clone({ ...e._zod.def, catchall: Qr() }), e.strict = () => e.clone({ ...e._zod.def, catchall: qi() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (n) => rs(e, n), e.merge = (n) => is(e, n), e.pick = (n) => ts(e, n), e.omit = (n) => ns(e, n), e.partial = (...n) => os(Ki, e, n[0]), e.required = (...n) => as(Vi, e, n[0]);
});
function Lt(e, t) {
  const n = {
    type: "object",
    get shape() {
      return _n(this, "shape", { ...e }), this.shape;
    },
    ...q(t)
  };
  return new Hi(n);
}
function Pe(e, t) {
  return new Hi({
    type: "object",
    get shape() {
      return _n(this, "shape", { ...e }), this.shape;
    },
    catchall: qi(),
    ...q(t)
  });
}
const vh = /* @__PURE__ */ z("ZodUnion", (e, t) => {
  Iu.init(e, t), ve.init(e, t), e.options = t.options;
});
function _h(e, t) {
  return new vh({
    type: "union",
    options: e,
    ...q(t)
  });
}
const mh = /* @__PURE__ */ z("ZodIntersection", (e, t) => {
  Cu.init(e, t), ve.init(e, t);
});
function yh(e, t) {
  return new mh({
    type: "intersection",
    left: e,
    right: t
  });
}
const Vn = /* @__PURE__ */ z("ZodEnum", (e, t) => {
  Su.init(e, t), ve.init(e, t), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, i) => {
    const o = {};
    for (const a of r)
      if (n.has(a))
        o[a] = t.entries[a];
      else
        throw new Error(`Key ${a} not found in enum`);
    return new Vn({
      ...t,
      checks: [],
      ...q(i),
      entries: o
    });
  }, e.exclude = (r, i) => {
    const o = { ...t.entries };
    for (const a of r)
      if (n.has(a))
        delete o[a];
      else
        throw new Error(`Key ${a} not found in enum`);
    return new Vn({
      ...t,
      checks: [],
      ...q(i),
      entries: o
    });
  };
});
function bn(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new Vn({
    type: "enum",
    entries: n,
    ...q(t)
  });
}
const bh = /* @__PURE__ */ z("ZodTransform", (e, t) => {
  Ou.init(e, t), ve.init(e, t), e._zod.parse = (n, r) => {
    n.addIssue = (o) => {
      if (typeof o == "string")
        n.issues.push(Zt(o, n.value, t));
      else {
        const a = o;
        a.fatal && (a.continue = !1), a.code ?? (a.code = "custom"), a.input ?? (a.input = n.value), a.inst ?? (a.inst = e), a.continue ?? (a.continue = !0), n.issues.push(Zt(a));
      }
    };
    const i = t.transform(n.value, n);
    return i instanceof Promise ? i.then((o) => (n.value = o, n)) : (n.value = i, n);
  };
});
function ar(e) {
  return new bh({
    type: "transform",
    transform: e
  });
}
const Ki = /* @__PURE__ */ z("ZodOptional", (e, t) => {
  Pu.init(e, t), ve.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function fn(e) {
  return new Ki({
    type: "optional",
    innerType: e
  });
}
const wh = /* @__PURE__ */ z("ZodNullable", (e, t) => {
  Au.init(e, t), ve.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function Yr(e) {
  return new wh({
    type: "nullable",
    innerType: e
  });
}
const xh = /* @__PURE__ */ z("ZodDefault", (e, t) => {
  Fu.init(e, t), ve.init(e, t), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function kh(e, t) {
  return new xh({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : t;
    }
  });
}
const Eh = /* @__PURE__ */ z("ZodPrefault", (e, t) => {
  Zu.init(e, t), ve.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function Nh(e, t) {
  return new Eh({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : t;
    }
  });
}
const Vi = /* @__PURE__ */ z("ZodNonOptional", (e, t) => {
  Lu.init(e, t), ve.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function $h(e, t) {
  return new Vi({
    type: "nonoptional",
    innerType: e,
    ...q(t)
  });
}
const zh = /* @__PURE__ */ z("ZodCatch", (e, t) => {
  ju.init(e, t), ve.init(e, t), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Th(e, t) {
  return new zh({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const Mh = /* @__PURE__ */ z("ZodPipe", (e, t) => {
  Bu.init(e, t), ve.init(e, t), e.in = t.in, e.out = t.out;
});
function Xr(e, t) {
  return new Mh({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Ih = /* @__PURE__ */ z("ZodReadonly", (e, t) => {
  Ru.init(e, t), ve.init(e, t);
});
function Ch(e) {
  return new Ih({
    type: "readonly",
    innerType: e
  });
}
const Wi = /* @__PURE__ */ z("ZodCustom", (e, t) => {
  Du.init(e, t), ve.init(e, t);
});
function Sh(e, t) {
  const n = new ze({
    check: "custom",
    ...q(t)
  });
  return n._zod.check = e, n;
}
function Oh(e, t = {}) {
  return Oc(Wi, e, t);
}
function Ph(e, t) {
  const n = Sh((r) => (r.addIssue = (i) => {
    if (typeof i == "string")
      r.issues.push(Zt(i, r.value, n._zod.def));
    else {
      const o = i;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = r.value), o.inst ?? (o.inst = n), o.continue ?? (o.continue = !n._zod.def.abort), r.issues.push(Zt(o));
    }
  }, e(r.value, r)), t);
  return n;
}
function dn(e, t = {
  error: `Input not instance of ${e.name}`
}) {
  const n = new Wi({
    type: "custom",
    check: "custom",
    fn: (r) => r instanceof e,
    abort: !0,
    ...q(t)
  });
  return n._zod.bag.Class = e, n;
}
const Ah = bn([
  "box",
  "sphere",
  "cylinder",
  "cone",
  "capsule",
  "torus-knot",
  "tetrahedron",
  "octahedron",
  "dodecahedron",
  "icosahedron",
  "rhombicuboctahedron",
  "triangular_prism",
  "pentagonal_prism",
  "hexagonal_prism",
  "square_pyramid",
  "pentagonal_pyramid",
  "triangular_dipyramid",
  "pentagonal_dipyramid",
  "elongated_square_dypyramid",
  "elongated_pentagonal_dipyramid",
  "elongated_pentagonal_cupola",
  "goldberg",
  "icosphere",
  "geodesic"
]);
function Ji(e) {
  const t = $e.get(e);
  if (t === null) {
    console.warn("invalid color:", e);
    return;
  }
  let n;
  switch (t.model) {
    case "rgb":
      n = Qe.rgb.hex(t.value[0], t.value[1], t.value[2]);
      break;
    case "hsl":
      n = Qe.hsl.hex(t.value[0], t.value[1], t.value[2]);
      break;
    case "hwb":
      n = Qe.hwb.hex(t.value[0], t.value[1], t.value[2]);
      break;
    default:
      console.warn("unknown color model", t.model);
      return;
  }
  const r = t.value[3] ?? 1, i = Math.round(r * 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${n}${i}`;
}
const Wn = Pe({
  size: Xe().min(0).default(1),
  opacity: Xe().min(0).max(1).default(1),
  wireframe: ln().default(!1),
  color: Oe().pipe(ar(Ji)).default("#D3D3D3FF"),
  label: ln().default(!1),
  shape: Ah.default("icosphere"),
  nodeMeshFactory: dn(Function).default(() => Pt.defaultNodeMeshFactory)
}), ei = Pe({
  baseColor: Oe().default("#D3D3D3FF")
}), Fh = bn([
  "plain",
  "moving"
]), Jn = Pe({
  type: Fh.default("moving"),
  arrowCap: ln().default(!1),
  color: Oe().pipe(ar(Ji)).default("#FFFFFFFF"),
  width: Xe().default(0.25),
  movingLineOpts: ei.default(ei.parse({})),
  edgeMeshFactory: dn(Function).default(() => Se.defaultEdgeMeshFactory)
}), Zh = Pe({
  selector: Oe(),
  style: Wn
}), Lh = Pe({
  selector: Oe(),
  style: Jn
}), jh = Pe({
  node: Zh,
  edge: Lh
}).partial().refine(
  (e) => !!e.node || !!e.edge,
  "StyleLayer requires either 'node' or 'edge'."
), Bh = Gi(jh), ti = Pe({
  pinOnDrag: ln().default(!0)
}), Qn = Oe().or(Xe());
Lt({
  id: Qn,
  metadata: Lt()
});
Lt({
  src: Qn,
  dst: Qn,
  metadata: Lt()
});
const ni = Pe({
  skybox: Oe().default(""),
  node: Wn.default(Wn.parse({})),
  edge: Jn.default(Jn.parse({})),
  startingCameraDistance: Xe().default(30)
}), ri = Pe({
  node: ti.default(ti.parse({})),
  fetchNodes: fn(dn(Function)),
  fetchEdges: fn(dn(Function))
}), Rh = bn([
  "ngraph",
  "d3"
]), ii = Pe({
  type: Rh.default("ngraph"),
  preSteps: Xe().default(0),
  stepMultiplier: Xe().default(1),
  minDelta: Xe().default(0)
}), Dh = Pe({
  nodeListProp: Oe().default("nodes"),
  edgeListProp: Oe().default("edges"),
  nodeIdProp: Oe().default("id"),
  edgeSrcIdProp: Oe().default("src"),
  edgeDstIdProp: Oe().default("dst"),
  // fetchOpts?: Parameters<typeof fetch>[1];
  fetchOpts: Lt().default({})
});
function Uh(e = {}) {
  return Dh.parse(e);
}
const qh = Pe({
  style: ni.default(ni.parse({})),
  behavior: ri.default(ri.parse({})),
  engine: ii.default(ii.parse({}))
});
function Gh(e = {}) {
  return qh.parse(e);
}
function Hh(e, t, n) {
  var r, i = 1;
  e == null && (e = 0), t == null && (t = 0), n == null && (n = 0);
  function o() {
    var a, u = r.length, s, h = 0, d = 0, p = 0;
    for (a = 0; a < u; ++a)
      s = r[a], h += s.x || 0, d += s.y || 0, p += s.z || 0;
    for (h = (h / u - e) * i, d = (d / u - t) * i, p = (p / u - n) * i, a = 0; a < u; ++a)
      s = r[a], h && (s.x -= h), d && (s.y -= d), p && (s.z -= p);
  }
  return o.initialize = function(a) {
    r = a;
  }, o.x = function(a) {
    return arguments.length ? (e = +a, o) : e;
  }, o.y = function(a) {
    return arguments.length ? (t = +a, o) : t;
  }, o.z = function(a) {
    return arguments.length ? (n = +a, o) : n;
  }, o.strength = function(a) {
    return arguments.length ? (i = +a, o) : i;
  }, o;
}
function Kh(e) {
  const t = +this._x.call(null, e);
  return Qi(this.cover(t), t, e);
}
function Qi(e, t, n) {
  if (isNaN(t))
    return e;
  var r, i = e._root, o = { data: n }, a = e._x0, u = e._x1, s, h, d, p, y;
  if (!i)
    return e._root = o, e;
  for (; i.length; )
    if ((d = t >= (s = (a + u) / 2)) ? a = s : u = s, r = i, !(i = i[p = +d]))
      return r[p] = o, e;
  if (h = +e._x.call(null, i.data), t === h)
    return o.next = i, r ? r[p] = o : e._root = o, e;
  do
    r = r ? r[p] = new Array(2) : e._root = new Array(2), (d = t >= (s = (a + u) / 2)) ? a = s : u = s;
  while ((p = +d) == (y = +(h >= s)));
  return r[y] = i, r[p] = o, e;
}
function Vh(e) {
  Array.isArray(e) || (e = Array.from(e));
  const t = e.length, n = new Float64Array(t);
  let r = 1 / 0, i = -1 / 0;
  for (let o = 0, a; o < t; ++o)
    isNaN(a = +this._x.call(null, e[o])) || (n[o] = a, a < r && (r = a), a > i && (i = a));
  if (r > i)
    return this;
  this.cover(r).cover(i);
  for (let o = 0; o < t; ++o)
    Qi(this, n[o], e[o]);
  return this;
}
function Wh(e) {
  if (isNaN(e = +e))
    return this;
  var t = this._x0, n = this._x1;
  if (isNaN(t))
    n = (t = Math.floor(e)) + 1;
  else {
    for (var r = n - t || 1, i = this._root, o, a; t > e || e >= n; )
      switch (a = +(e < t), o = new Array(2), o[a] = i, i = o, r *= 2, a) {
        case 0:
          n = t + r;
          break;
        case 1:
          t = n - r;
          break;
      }
    this._root && this._root.length && (this._root = i);
  }
  return this._x0 = t, this._x1 = n, this;
}
function Jh() {
  var e = [];
  return this.visit(function(t) {
    if (!t.length)
      do
        e.push(t.data);
      while (t = t.next);
  }), e;
}
function Qh(e) {
  return arguments.length ? this.cover(+e[0][0]).cover(+e[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
}
function Ge(e, t, n) {
  this.node = e, this.x0 = t, this.x1 = n;
}
function Yh(e, t) {
  var n, r = this._x0, i, o, a = this._x1, u = [], s = this._root, h, d;
  for (s && u.push(new Ge(s, r, a)), t == null ? t = 1 / 0 : (r = e - t, a = e + t); h = u.pop(); )
    if (!(!(s = h.node) || (i = h.x0) > a || (o = h.x1) < r))
      if (s.length) {
        var p = (i + o) / 2;
        u.push(
          new Ge(s[1], p, o),
          new Ge(s[0], i, p)
        ), (d = +(e >= p)) && (h = u[u.length - 1], u[u.length - 1] = u[u.length - 1 - d], u[u.length - 1 - d] = h);
      } else {
        var y = Math.abs(e - +this._x.call(null, s.data));
        y < t && (t = y, r = e - y, a = e + y, n = s.data);
      }
  return n;
}
function Xh(e) {
  if (isNaN(s = +this._x.call(null, e)))
    return this;
  var t, n = this._root, r, i, o, a = this._x0, u = this._x1, s, h, d, p, y;
  if (!n)
    return this;
  if (n.length)
    for (; ; ) {
      if ((d = s >= (h = (a + u) / 2)) ? a = h : u = h, t = n, !(n = n[p = +d]))
        return this;
      if (!n.length)
        break;
      t[p + 1 & 1] && (r = t, y = p);
    }
  for (; n.data !== e; )
    if (i = n, !(n = n.next))
      return this;
  return (o = n.next) && delete n.next, i ? (o ? i.next = o : delete i.next, this) : t ? (o ? t[p] = o : delete t[p], (n = t[0] || t[1]) && n === (t[1] || t[0]) && !n.length && (r ? r[y] = n : this._root = n), this) : (this._root = o, this);
}
function el(e) {
  for (var t = 0, n = e.length; t < n; ++t)
    this.remove(e[t]);
  return this;
}
function tl() {
  return this._root;
}
function nl() {
  var e = 0;
  return this.visit(function(t) {
    if (!t.length)
      do
        ++e;
      while (t = t.next);
  }), e;
}
function rl(e) {
  var t = [], n, r = this._root, i, o, a;
  for (r && t.push(new Ge(r, this._x0, this._x1)); n = t.pop(); )
    if (!e(r = n.node, o = n.x0, a = n.x1) && r.length) {
      var u = (o + a) / 2;
      (i = r[1]) && t.push(new Ge(i, u, a)), (i = r[0]) && t.push(new Ge(i, o, u));
    }
  return this;
}
function il(e) {
  var t = [], n = [], r;
  for (this._root && t.push(new Ge(this._root, this._x0, this._x1)); r = t.pop(); ) {
    var i = r.node;
    if (i.length) {
      var o, a = r.x0, u = r.x1, s = (a + u) / 2;
      (o = i[0]) && t.push(new Ge(o, a, s)), (o = i[1]) && t.push(new Ge(o, s, u));
    }
    n.push(r);
  }
  for (; r = n.pop(); )
    e(r.node, r.x0, r.x1);
  return this;
}
function ol(e) {
  return e[0];
}
function al(e) {
  return arguments.length ? (this._x = e, this) : this._x;
}
function Yi(e, t) {
  var n = new sr(t ?? ol, NaN, NaN);
  return e == null ? n : n.addAll(e);
}
function sr(e, t, n) {
  this._x = e, this._x0 = t, this._x1 = n, this._root = void 0;
}
function oi(e) {
  for (var t = { data: e.data }, n = t; e = e.next; )
    n = n.next = { data: e.data };
  return t;
}
var Te = Yi.prototype = sr.prototype;
Te.copy = function() {
  var e = new sr(this._x, this._x0, this._x1), t = this._root, n, r;
  if (!t)
    return e;
  if (!t.length)
    return e._root = oi(t), e;
  for (n = [{ source: t, target: e._root = new Array(2) }]; t = n.pop(); )
    for (var i = 0; i < 2; ++i)
      (r = t.source[i]) && (r.length ? n.push({ source: r, target: t.target[i] = new Array(2) }) : t.target[i] = oi(r));
  return e;
};
Te.add = Kh;
Te.addAll = Vh;
Te.cover = Wh;
Te.data = Jh;
Te.extent = Qh;
Te.find = Yh;
Te.remove = Xh;
Te.removeAll = el;
Te.root = tl;
Te.size = nl;
Te.visit = rl;
Te.visitAfter = il;
Te.x = al;
function sl(e) {
  const t = +this._x.call(null, e), n = +this._y.call(null, e);
  return Xi(this.cover(t, n), t, n, e);
}
function Xi(e, t, n, r) {
  if (isNaN(t) || isNaN(n))
    return e;
  var i, o = e._root, a = { data: r }, u = e._x0, s = e._y0, h = e._x1, d = e._y1, p, y, w, m, E, k, _, N;
  if (!o)
    return e._root = a, e;
  for (; o.length; )
    if ((E = t >= (p = (u + h) / 2)) ? u = p : h = p, (k = n >= (y = (s + d) / 2)) ? s = y : d = y, i = o, !(o = o[_ = k << 1 | E]))
      return i[_] = a, e;
  if (w = +e._x.call(null, o.data), m = +e._y.call(null, o.data), t === w && n === m)
    return a.next = o, i ? i[_] = a : e._root = a, e;
  do
    i = i ? i[_] = new Array(4) : e._root = new Array(4), (E = t >= (p = (u + h) / 2)) ? u = p : h = p, (k = n >= (y = (s + d) / 2)) ? s = y : d = y;
  while ((_ = k << 1 | E) === (N = (m >= y) << 1 | w >= p));
  return i[N] = o, i[_] = a, e;
}
function ul(e) {
  var t, n, r = e.length, i, o, a = new Array(r), u = new Array(r), s = 1 / 0, h = 1 / 0, d = -1 / 0, p = -1 / 0;
  for (n = 0; n < r; ++n)
    isNaN(i = +this._x.call(null, t = e[n])) || isNaN(o = +this._y.call(null, t)) || (a[n] = i, u[n] = o, i < s && (s = i), i > d && (d = i), o < h && (h = o), o > p && (p = o));
  if (s > d || h > p)
    return this;
  for (this.cover(s, h).cover(d, p), n = 0; n < r; ++n)
    Xi(this, a[n], u[n], e[n]);
  return this;
}
function cl(e, t) {
  if (isNaN(e = +e) || isNaN(t = +t))
    return this;
  var n = this._x0, r = this._y0, i = this._x1, o = this._y1;
  if (isNaN(n))
    i = (n = Math.floor(e)) + 1, o = (r = Math.floor(t)) + 1;
  else {
    for (var a = i - n || 1, u = this._root, s, h; n > e || e >= i || r > t || t >= o; )
      switch (h = (t < r) << 1 | e < n, s = new Array(4), s[h] = u, u = s, a *= 2, h) {
        case 0:
          i = n + a, o = r + a;
          break;
        case 1:
          n = i - a, o = r + a;
          break;
        case 2:
          i = n + a, r = o - a;
          break;
        case 3:
          n = i - a, r = o - a;
          break;
      }
    this._root && this._root.length && (this._root = u);
  }
  return this._x0 = n, this._y0 = r, this._x1 = i, this._y1 = o, this;
}
function hl() {
  var e = [];
  return this.visit(function(t) {
    if (!t.length)
      do
        e.push(t.data);
      while (t = t.next);
  }), e;
}
function ll(e) {
  return arguments.length ? this.cover(+e[0][0], +e[0][1]).cover(+e[1][0], +e[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function ke(e, t, n, r, i) {
  this.node = e, this.x0 = t, this.y0 = n, this.x1 = r, this.y1 = i;
}
function fl(e, t, n) {
  var r, i = this._x0, o = this._y0, a, u, s, h, d = this._x1, p = this._y1, y = [], w = this._root, m, E;
  for (w && y.push(new ke(w, i, o, d, p)), n == null ? n = 1 / 0 : (i = e - n, o = t - n, d = e + n, p = t + n, n *= n); m = y.pop(); )
    if (!(!(w = m.node) || (a = m.x0) > d || (u = m.y0) > p || (s = m.x1) < i || (h = m.y1) < o))
      if (w.length) {
        var k = (a + s) / 2, _ = (u + h) / 2;
        y.push(
          new ke(w[3], k, _, s, h),
          new ke(w[2], a, _, k, h),
          new ke(w[1], k, u, s, _),
          new ke(w[0], a, u, k, _)
        ), (E = (t >= _) << 1 | e >= k) && (m = y[y.length - 1], y[y.length - 1] = y[y.length - 1 - E], y[y.length - 1 - E] = m);
      } else {
        var N = e - +this._x.call(null, w.data), $ = t - +this._y.call(null, w.data), T = N * N + $ * $;
        if (T < n) {
          var M = Math.sqrt(n = T);
          i = e - M, o = t - M, d = e + M, p = t + M, r = w.data;
        }
      }
  return r;
}
function dl(e) {
  if (isNaN(d = +this._x.call(null, e)) || isNaN(p = +this._y.call(null, e)))
    return this;
  var t, n = this._root, r, i, o, a = this._x0, u = this._y0, s = this._x1, h = this._y1, d, p, y, w, m, E, k, _;
  if (!n)
    return this;
  if (n.length)
    for (; ; ) {
      if ((m = d >= (y = (a + s) / 2)) ? a = y : s = y, (E = p >= (w = (u + h) / 2)) ? u = w : h = w, t = n, !(n = n[k = E << 1 | m]))
        return this;
      if (!n.length)
        break;
      (t[k + 1 & 3] || t[k + 2 & 3] || t[k + 3 & 3]) && (r = t, _ = k);
    }
  for (; n.data !== e; )
    if (i = n, !(n = n.next))
      return this;
  return (o = n.next) && delete n.next, i ? (o ? i.next = o : delete i.next, this) : t ? (o ? t[k] = o : delete t[k], (n = t[0] || t[1] || t[2] || t[3]) && n === (t[3] || t[2] || t[1] || t[0]) && !n.length && (r ? r[_] = n : this._root = n), this) : (this._root = o, this);
}
function pl(e) {
  for (var t = 0, n = e.length; t < n; ++t)
    this.remove(e[t]);
  return this;
}
function gl() {
  return this._root;
}
function vl() {
  var e = 0;
  return this.visit(function(t) {
    if (!t.length)
      do
        ++e;
      while (t = t.next);
  }), e;
}
function _l(e) {
  var t = [], n, r = this._root, i, o, a, u, s;
  for (r && t.push(new ke(r, this._x0, this._y0, this._x1, this._y1)); n = t.pop(); )
    if (!e(r = n.node, o = n.x0, a = n.y0, u = n.x1, s = n.y1) && r.length) {
      var h = (o + u) / 2, d = (a + s) / 2;
      (i = r[3]) && t.push(new ke(i, h, d, u, s)), (i = r[2]) && t.push(new ke(i, o, d, h, s)), (i = r[1]) && t.push(new ke(i, h, a, u, d)), (i = r[0]) && t.push(new ke(i, o, a, h, d));
    }
  return this;
}
function ml(e) {
  var t = [], n = [], r;
  for (this._root && t.push(new ke(this._root, this._x0, this._y0, this._x1, this._y1)); r = t.pop(); ) {
    var i = r.node;
    if (i.length) {
      var o, a = r.x0, u = r.y0, s = r.x1, h = r.y1, d = (a + s) / 2, p = (u + h) / 2;
      (o = i[0]) && t.push(new ke(o, a, u, d, p)), (o = i[1]) && t.push(new ke(o, d, u, s, p)), (o = i[2]) && t.push(new ke(o, a, p, d, h)), (o = i[3]) && t.push(new ke(o, d, p, s, h));
    }
    n.push(r);
  }
  for (; r = n.pop(); )
    e(r.node, r.x0, r.y0, r.x1, r.y1);
  return this;
}
function yl(e) {
  return e[0];
}
function bl(e) {
  return arguments.length ? (this._x = e, this) : this._x;
}
function wl(e) {
  return e[1];
}
function xl(e) {
  return arguments.length ? (this._y = e, this) : this._y;
}
function eo(e, t, n) {
  var r = new ur(t ?? yl, n ?? wl, NaN, NaN, NaN, NaN);
  return e == null ? r : r.addAll(e);
}
function ur(e, t, n, r, i, o) {
  this._x = e, this._y = t, this._x0 = n, this._y0 = r, this._x1 = i, this._y1 = o, this._root = void 0;
}
function ai(e) {
  for (var t = { data: e.data }, n = t; e = e.next; )
    n = n.next = { data: e.data };
  return t;
}
var Ee = eo.prototype = ur.prototype;
Ee.copy = function() {
  var e = new ur(this._x, this._y, this._x0, this._y0, this._x1, this._y1), t = this._root, n, r;
  if (!t)
    return e;
  if (!t.length)
    return e._root = ai(t), e;
  for (n = [{ source: t, target: e._root = new Array(4) }]; t = n.pop(); )
    for (var i = 0; i < 4; ++i)
      (r = t.source[i]) && (r.length ? n.push({ source: r, target: t.target[i] = new Array(4) }) : t.target[i] = ai(r));
  return e;
};
Ee.add = sl;
Ee.addAll = ul;
Ee.cover = cl;
Ee.data = hl;
Ee.extent = ll;
Ee.find = fl;
Ee.remove = dl;
Ee.removeAll = pl;
Ee.root = gl;
Ee.size = vl;
Ee.visit = _l;
Ee.visitAfter = ml;
Ee.x = bl;
Ee.y = xl;
function kl(e) {
  const t = +this._x.call(null, e), n = +this._y.call(null, e), r = +this._z.call(null, e);
  return to(this.cover(t, n, r), t, n, r, e);
}
function to(e, t, n, r, i) {
  if (isNaN(t) || isNaN(n) || isNaN(r))
    return e;
  var o, a = e._root, u = { data: i }, s = e._x0, h = e._y0, d = e._z0, p = e._x1, y = e._y1, w = e._z1, m, E, k, _, N, $, T, M, S, B, D;
  if (!a)
    return e._root = u, e;
  for (; a.length; )
    if ((T = t >= (m = (s + p) / 2)) ? s = m : p = m, (M = n >= (E = (h + y) / 2)) ? h = E : y = E, (S = r >= (k = (d + w) / 2)) ? d = k : w = k, o = a, !(a = a[B = S << 2 | M << 1 | T]))
      return o[B] = u, e;
  if (_ = +e._x.call(null, a.data), N = +e._y.call(null, a.data), $ = +e._z.call(null, a.data), t === _ && n === N && r === $)
    return u.next = a, o ? o[B] = u : e._root = u, e;
  do
    o = o ? o[B] = new Array(8) : e._root = new Array(8), (T = t >= (m = (s + p) / 2)) ? s = m : p = m, (M = n >= (E = (h + y) / 2)) ? h = E : y = E, (S = r >= (k = (d + w) / 2)) ? d = k : w = k;
  while ((B = S << 2 | M << 1 | T) === (D = ($ >= k) << 2 | (N >= E) << 1 | _ >= m));
  return o[D] = a, o[B] = u, e;
}
function El(e) {
  Array.isArray(e) || (e = Array.from(e));
  const t = e.length, n = new Float64Array(t), r = new Float64Array(t), i = new Float64Array(t);
  let o = 1 / 0, a = 1 / 0, u = 1 / 0, s = -1 / 0, h = -1 / 0, d = -1 / 0;
  for (let p = 0, y, w, m, E; p < t; ++p)
    isNaN(w = +this._x.call(null, y = e[p])) || isNaN(m = +this._y.call(null, y)) || isNaN(E = +this._z.call(null, y)) || (n[p] = w, r[p] = m, i[p] = E, w < o && (o = w), w > s && (s = w), m < a && (a = m), m > h && (h = m), E < u && (u = E), E > d && (d = E));
  if (o > s || a > h || u > d)
    return this;
  this.cover(o, a, u).cover(s, h, d);
  for (let p = 0; p < t; ++p)
    to(this, n[p], r[p], i[p], e[p]);
  return this;
}
function Nl(e, t, n) {
  if (isNaN(e = +e) || isNaN(t = +t) || isNaN(n = +n))
    return this;
  var r = this._x0, i = this._y0, o = this._z0, a = this._x1, u = this._y1, s = this._z1;
  if (isNaN(r))
    a = (r = Math.floor(e)) + 1, u = (i = Math.floor(t)) + 1, s = (o = Math.floor(n)) + 1;
  else {
    for (var h = a - r || 1, d = this._root, p, y; r > e || e >= a || i > t || t >= u || o > n || n >= s; )
      switch (y = (n < o) << 2 | (t < i) << 1 | e < r, p = new Array(8), p[y] = d, d = p, h *= 2, y) {
        case 0:
          a = r + h, u = i + h, s = o + h;
          break;
        case 1:
          r = a - h, u = i + h, s = o + h;
          break;
        case 2:
          a = r + h, i = u - h, s = o + h;
          break;
        case 3:
          r = a - h, i = u - h, s = o + h;
          break;
        case 4:
          a = r + h, u = i + h, o = s - h;
          break;
        case 5:
          r = a - h, u = i + h, o = s - h;
          break;
        case 6:
          a = r + h, i = u - h, o = s - h;
          break;
        case 7:
          r = a - h, i = u - h, o = s - h;
          break;
      }
    this._root && this._root.length && (this._root = d);
  }
  return this._x0 = r, this._y0 = i, this._z0 = o, this._x1 = a, this._y1 = u, this._z1 = s, this;
}
function $l() {
  var e = [];
  return this.visit(function(t) {
    if (!t.length)
      do
        e.push(t.data);
      while (t = t.next);
  }), e;
}
function zl(e) {
  return arguments.length ? this.cover(+e[0][0], +e[0][1], +e[0][2]).cover(+e[1][0], +e[1][1], +e[1][2]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
}
function ae(e, t, n, r, i, o, a) {
  this.node = e, this.x0 = t, this.y0 = n, this.z0 = r, this.x1 = i, this.y1 = o, this.z1 = a;
}
function Tl(e, t, n, r) {
  var i, o = this._x0, a = this._y0, u = this._z0, s, h, d, p, y, w, m = this._x1, E = this._y1, k = this._z1, _ = [], N = this._root, $, T;
  for (N && _.push(new ae(N, o, a, u, m, E, k)), r == null ? r = 1 / 0 : (o = e - r, a = t - r, u = n - r, m = e + r, E = t + r, k = n + r, r *= r); $ = _.pop(); )
    if (!(!(N = $.node) || (s = $.x0) > m || (h = $.y0) > E || (d = $.z0) > k || (p = $.x1) < o || (y = $.y1) < a || (w = $.z1) < u))
      if (N.length) {
        var M = (s + p) / 2, S = (h + y) / 2, B = (d + w) / 2;
        _.push(
          new ae(N[7], M, S, B, p, y, w),
          new ae(N[6], s, S, B, M, y, w),
          new ae(N[5], M, h, B, p, S, w),
          new ae(N[4], s, h, B, M, S, w),
          new ae(N[3], M, S, d, p, y, B),
          new ae(N[2], s, S, d, M, y, B),
          new ae(N[1], M, h, d, p, S, B),
          new ae(N[0], s, h, d, M, S, B)
        ), (T = (n >= B) << 2 | (t >= S) << 1 | e >= M) && ($ = _[_.length - 1], _[_.length - 1] = _[_.length - 1 - T], _[_.length - 1 - T] = $);
      } else {
        var D = e - +this._x.call(null, N.data), Q = t - +this._y.call(null, N.data), ee = n - +this._z.call(null, N.data), te = D * D + Q * Q + ee * ee;
        if (te < r) {
          var W = Math.sqrt(r = te);
          o = e - W, a = t - W, u = n - W, m = e + W, E = t + W, k = n + W, i = N.data;
        }
      }
  return i;
}
function Ml(e) {
  if (isNaN(y = +this._x.call(null, e)) || isNaN(w = +this._y.call(null, e)) || isNaN(m = +this._z.call(null, e)))
    return this;
  var t, n = this._root, r, i, o, a = this._x0, u = this._y0, s = this._z0, h = this._x1, d = this._y1, p = this._z1, y, w, m, E, k, _, N, $, T, M, S;
  if (!n)
    return this;
  if (n.length)
    for (; ; ) {
      if ((N = y >= (E = (a + h) / 2)) ? a = E : h = E, ($ = w >= (k = (u + d) / 2)) ? u = k : d = k, (T = m >= (_ = (s + p) / 2)) ? s = _ : p = _, t = n, !(n = n[M = T << 2 | $ << 1 | N]))
        return this;
      if (!n.length)
        break;
      (t[M + 1 & 7] || t[M + 2 & 7] || t[M + 3 & 7] || t[M + 4 & 7] || t[M + 5 & 7] || t[M + 6 & 7] || t[M + 7 & 7]) && (r = t, S = M);
    }
  for (; n.data !== e; )
    if (i = n, !(n = n.next))
      return this;
  return (o = n.next) && delete n.next, i ? (o ? i.next = o : delete i.next, this) : t ? (o ? t[M] = o : delete t[M], (n = t[0] || t[1] || t[2] || t[3] || t[4] || t[5] || t[6] || t[7]) && n === (t[7] || t[6] || t[5] || t[4] || t[3] || t[2] || t[1] || t[0]) && !n.length && (r ? r[S] = n : this._root = n), this) : (this._root = o, this);
}
function Il(e) {
  for (var t = 0, n = e.length; t < n; ++t)
    this.remove(e[t]);
  return this;
}
function Cl() {
  return this._root;
}
function Sl() {
  var e = 0;
  return this.visit(function(t) {
    if (!t.length)
      do
        ++e;
      while (t = t.next);
  }), e;
}
function Ol(e) {
  var t = [], n, r = this._root, i, o, a, u, s, h, d;
  for (r && t.push(new ae(r, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); n = t.pop(); )
    if (!e(r = n.node, o = n.x0, a = n.y0, u = n.z0, s = n.x1, h = n.y1, d = n.z1) && r.length) {
      var p = (o + s) / 2, y = (a + h) / 2, w = (u + d) / 2;
      (i = r[7]) && t.push(new ae(i, p, y, w, s, h, d)), (i = r[6]) && t.push(new ae(i, o, y, w, p, h, d)), (i = r[5]) && t.push(new ae(i, p, a, w, s, y, d)), (i = r[4]) && t.push(new ae(i, o, a, w, p, y, d)), (i = r[3]) && t.push(new ae(i, p, y, u, s, h, w)), (i = r[2]) && t.push(new ae(i, o, y, u, p, h, w)), (i = r[1]) && t.push(new ae(i, p, a, u, s, y, w)), (i = r[0]) && t.push(new ae(i, o, a, u, p, y, w));
    }
  return this;
}
function Pl(e) {
  var t = [], n = [], r;
  for (this._root && t.push(new ae(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); r = t.pop(); ) {
    var i = r.node;
    if (i.length) {
      var o, a = r.x0, u = r.y0, s = r.z0, h = r.x1, d = r.y1, p = r.z1, y = (a + h) / 2, w = (u + d) / 2, m = (s + p) / 2;
      (o = i[0]) && t.push(new ae(o, a, u, s, y, w, m)), (o = i[1]) && t.push(new ae(o, y, u, s, h, w, m)), (o = i[2]) && t.push(new ae(o, a, w, s, y, d, m)), (o = i[3]) && t.push(new ae(o, y, w, s, h, d, m)), (o = i[4]) && t.push(new ae(o, a, u, m, y, w, p)), (o = i[5]) && t.push(new ae(o, y, u, m, h, w, p)), (o = i[6]) && t.push(new ae(o, a, w, m, y, d, p)), (o = i[7]) && t.push(new ae(o, y, w, m, h, d, p));
    }
    n.push(r);
  }
  for (; r = n.pop(); )
    e(r.node, r.x0, r.y0, r.z0, r.x1, r.y1, r.z1);
  return this;
}
function Al(e) {
  return e[0];
}
function Fl(e) {
  return arguments.length ? (this._x = e, this) : this._x;
}
function Zl(e) {
  return e[1];
}
function Ll(e) {
  return arguments.length ? (this._y = e, this) : this._y;
}
function jl(e) {
  return e[2];
}
function Bl(e) {
  return arguments.length ? (this._z = e, this) : this._z;
}
function no(e, t, n, r) {
  var i = new cr(t ?? Al, n ?? Zl, r ?? jl, NaN, NaN, NaN, NaN, NaN, NaN);
  return e == null ? i : i.addAll(e);
}
function cr(e, t, n, r, i, o, a, u, s) {
  this._x = e, this._y = t, this._z = n, this._x0 = r, this._y0 = i, this._z0 = o, this._x1 = a, this._y1 = u, this._z1 = s, this._root = void 0;
}
function si(e) {
  for (var t = { data: e.data }, n = t; e = e.next; )
    n = n.next = { data: e.data };
  return t;
}
var xe = no.prototype = cr.prototype;
xe.copy = function() {
  var e = new cr(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), t = this._root, n, r;
  if (!t)
    return e;
  if (!t.length)
    return e._root = si(t), e;
  for (n = [{ source: t, target: e._root = new Array(8) }]; t = n.pop(); )
    for (var i = 0; i < 8; ++i)
      (r = t.source[i]) && (r.length ? n.push({ source: r, target: t.target[i] = new Array(8) }) : t.target[i] = si(r));
  return e;
};
xe.add = kl;
xe.addAll = El;
xe.cover = Nl;
xe.data = $l;
xe.extent = zl;
xe.find = Tl;
xe.remove = Ml;
xe.removeAll = Il;
xe.root = Cl;
xe.size = Sl;
xe.visit = Ol;
xe.visitAfter = Pl;
xe.x = Fl;
xe.y = Ll;
xe.z = Bl;
function Ot(e) {
  return function() {
    return e;
  };
}
function Ue(e) {
  return (e() - 0.5) * 1e-6;
}
function Rl(e) {
  return e.index;
}
function ui(e, t) {
  var n = e.get(t);
  if (!n)
    throw new Error("node not found: " + t);
  return n;
}
function Dl(e) {
  var t = Rl, n = y, r, i = Ot(30), o, a, u, s, h, d, p = 1;
  e == null && (e = []);
  function y(_) {
    return 1 / Math.min(s[_.source.index], s[_.target.index]);
  }
  function w(_) {
    for (var N = 0, $ = e.length; N < p; ++N)
      for (var T = 0, M, S, B, D = 0, Q = 0, ee = 0, te, W; T < $; ++T)
        M = e[T], S = M.source, B = M.target, D = B.x + B.vx - S.x - S.vx || Ue(d), u > 1 && (Q = B.y + B.vy - S.y - S.vy || Ue(d)), u > 2 && (ee = B.z + B.vz - S.z - S.vz || Ue(d)), te = Math.sqrt(D * D + Q * Q + ee * ee), te = (te - o[T]) / te * _ * r[T], D *= te, Q *= te, ee *= te, B.vx -= D * (W = h[T]), u > 1 && (B.vy -= Q * W), u > 2 && (B.vz -= ee * W), S.vx += D * (W = 1 - W), u > 1 && (S.vy += Q * W), u > 2 && (S.vz += ee * W);
  }
  function m() {
    if (a) {
      var _, N = a.length, $ = e.length, T = new Map(a.map((S, B) => [t(S, B, a), S])), M;
      for (_ = 0, s = new Array(N); _ < $; ++_)
        M = e[_], M.index = _, typeof M.source != "object" && (M.source = ui(T, M.source)), typeof M.target != "object" && (M.target = ui(T, M.target)), s[M.source.index] = (s[M.source.index] || 0) + 1, s[M.target.index] = (s[M.target.index] || 0) + 1;
      for (_ = 0, h = new Array($); _ < $; ++_)
        M = e[_], h[_] = s[M.source.index] / (s[M.source.index] + s[M.target.index]);
      r = new Array($), E(), o = new Array($), k();
    }
  }
  function E() {
    if (a)
      for (var _ = 0, N = e.length; _ < N; ++_)
        r[_] = +n(e[_], _, e);
  }
  function k() {
    if (a)
      for (var _ = 0, N = e.length; _ < N; ++_)
        o[_] = +i(e[_], _, e);
  }
  return w.initialize = function(_, ...N) {
    a = _, d = N.find(($) => typeof $ == "function") || Math.random, u = N.find(($) => [1, 2, 3].includes($)) || 2, m();
  }, w.links = function(_) {
    return arguments.length ? (e = _, m(), w) : e;
  }, w.id = function(_) {
    return arguments.length ? (t = _, w) : t;
  }, w.iterations = function(_) {
    return arguments.length ? (p = +_, w) : p;
  }, w.strength = function(_) {
    return arguments.length ? (n = typeof _ == "function" ? _ : Ot(+_), E(), w) : n;
  }, w.distance = function(_) {
    return arguments.length ? (i = typeof _ == "function" ? _ : Ot(+_), k(), w) : i;
  }, w;
}
var Ul = { value: () => {
} };
function ro() {
  for (var e = 0, t = arguments.length, n = {}, r; e < t; ++e) {
    if (!(r = arguments[e] + "") || r in n || /[\s.]/.test(r))
      throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new cn(n);
}
function cn(e) {
  this._ = e;
}
function ql(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var r = "", i = n.indexOf(".");
    if (i >= 0 && (r = n.slice(i + 1), n = n.slice(0, i)), n && !t.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
cn.prototype = ro.prototype = {
  constructor: cn,
  on: function(e, t) {
    var n = this._, r = ql(e + "", n), i, o = -1, a = r.length;
    if (arguments.length < 2) {
      for (; ++o < a; )
        if ((i = (e = r[o]).type) && (i = Gl(n[i], e.name)))
          return i;
      return;
    }
    if (t != null && typeof t != "function")
      throw new Error("invalid callback: " + t);
    for (; ++o < a; )
      if (i = (e = r[o]).type)
        n[i] = ci(n[i], e.name, t);
      else if (t == null)
        for (i in n)
          n[i] = ci(n[i], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t)
      e[n] = t[n].slice();
    return new cn(e);
  },
  call: function(e, t) {
    if ((i = arguments.length - 2) > 0)
      for (var n = new Array(i), r = 0, i, o; r < i; ++r)
        n[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (o = this._[e], r = 0, i = o.length; r < i; ++r)
      o[r].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e))
      throw new Error("unknown type: " + e);
    for (var r = this._[e], i = 0, o = r.length; i < o; ++i)
      r[i].value.apply(t, n);
  }
};
function Gl(e, t) {
  for (var n = 0, r = e.length, i; n < r; ++n)
    if ((i = e[n]).name === t)
      return i.value;
}
function ci(e, t, n) {
  for (var r = 0, i = e.length; r < i; ++r)
    if (e[r].name === t) {
      e[r] = Ul, e = e.slice(0, r).concat(e.slice(r + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var pt = 0, It = 0, Tt = 0, io = 1e3, pn, Ct, gn = 0, it = 0, wn = 0, jt = typeof performance == "object" && performance.now ? performance : Date, oo = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function ao() {
  return it || (oo(Hl), it = jt.now() + wn);
}
function Hl() {
  it = 0;
}
function Yn() {
  this._call = this._time = this._next = null;
}
Yn.prototype = so.prototype = {
  constructor: Yn,
  restart: function(e, t, n) {
    if (typeof e != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? ao() : +n) + (t == null ? 0 : +t), !this._next && Ct !== this && (Ct ? Ct._next = this : pn = this, Ct = this), this._call = e, this._time = n, Xn();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Xn());
  }
};
function so(e, t, n) {
  var r = new Yn();
  return r.restart(e, t, n), r;
}
function Kl() {
  ao(), ++pt;
  for (var e = pn, t; e; )
    (t = it - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --pt;
}
function hi() {
  it = (gn = jt.now()) + wn, pt = It = 0;
  try {
    Kl();
  } finally {
    pt = 0, Wl(), it = 0;
  }
}
function Vl() {
  var e = jt.now(), t = e - gn;
  t > io && (wn -= t, gn = e);
}
function Wl() {
  for (var e, t = pn, n, r = 1 / 0; t; )
    t._call ? (r > t._time && (r = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : pn = n);
  Ct = e, Xn(r);
}
function Xn(e) {
  if (!pt) {
    It && (It = clearTimeout(It));
    var t = e - it;
    t > 24 ? (e < 1 / 0 && (It = setTimeout(hi, e - jt.now() - wn)), Tt && (Tt = clearInterval(Tt))) : (Tt || (gn = jt.now(), Tt = setInterval(Vl, io)), pt = 1, oo(hi));
  }
}
const Jl = 1664525, Ql = 1013904223, li = 4294967296;
function Yl() {
  let e = 1;
  return () => (e = (Jl * e + Ql) % li) / li;
}
var fi = 3;
function Dn(e) {
  return e.x;
}
function di(e) {
  return e.y;
}
function Xl(e) {
  return e.z;
}
var ef = 10, tf = Math.PI * (3 - Math.sqrt(5)), nf = Math.PI * 20 / (9 + Math.sqrt(221));
function rf(e, t) {
  t = t || 2;
  var n = Math.min(fi, Math.max(1, Math.round(t))), r, i = 1, o = 1e-3, a = 1 - Math.pow(o, 1 / 300), u = 0, s = 0.6, h = /* @__PURE__ */ new Map(), d = so(w), p = ro("tick", "end"), y = Yl();
  e == null && (e = []);
  function w() {
    m(), p.call("tick", r), i < o && (d.stop(), p.call("end", r));
  }
  function m(_) {
    var N, $ = e.length, T;
    _ === void 0 && (_ = 1);
    for (var M = 0; M < _; ++M)
      for (i += (u - i) * a, h.forEach(function(S) {
        S(i);
      }), N = 0; N < $; ++N)
        T = e[N], T.fx == null ? T.x += T.vx *= s : (T.x = T.fx, T.vx = 0), n > 1 && (T.fy == null ? T.y += T.vy *= s : (T.y = T.fy, T.vy = 0)), n > 2 && (T.fz == null ? T.z += T.vz *= s : (T.z = T.fz, T.vz = 0));
    return r;
  }
  function E() {
    for (var _ = 0, N = e.length, $; _ < N; ++_) {
      if ($ = e[_], $.index = _, $.fx != null && ($.x = $.fx), $.fy != null && ($.y = $.fy), $.fz != null && ($.z = $.fz), isNaN($.x) || n > 1 && isNaN($.y) || n > 2 && isNaN($.z)) {
        var T = ef * (n > 2 ? Math.cbrt(0.5 + _) : n > 1 ? Math.sqrt(0.5 + _) : _), M = _ * tf, S = _ * nf;
        n === 1 ? $.x = T : n === 2 ? ($.x = T * Math.cos(M), $.y = T * Math.sin(M)) : ($.x = T * Math.sin(M) * Math.cos(S), $.y = T * Math.cos(M), $.z = T * Math.sin(M) * Math.sin(S));
      }
      (isNaN($.vx) || n > 1 && isNaN($.vy) || n > 2 && isNaN($.vz)) && ($.vx = 0, n > 1 && ($.vy = 0), n > 2 && ($.vz = 0));
    }
  }
  function k(_) {
    return _.initialize && _.initialize(e, y, n), _;
  }
  return E(), r = {
    tick: m,
    restart: function() {
      return d.restart(w), r;
    },
    stop: function() {
      return d.stop(), r;
    },
    numDimensions: function(_) {
      return arguments.length ? (n = Math.min(fi, Math.max(1, Math.round(_))), h.forEach(k), r) : n;
    },
    nodes: function(_) {
      return arguments.length ? (e = _, E(), h.forEach(k), r) : e;
    },
    alpha: function(_) {
      return arguments.length ? (i = +_, r) : i;
    },
    alphaMin: function(_) {
      return arguments.length ? (o = +_, r) : o;
    },
    alphaDecay: function(_) {
      return arguments.length ? (a = +_, r) : +a;
    },
    alphaTarget: function(_) {
      return arguments.length ? (u = +_, r) : u;
    },
    velocityDecay: function(_) {
      return arguments.length ? (s = 1 - _, r) : 1 - s;
    },
    randomSource: function(_) {
      return arguments.length ? (y = _, h.forEach(k), r) : y;
    },
    force: function(_, N) {
      return arguments.length > 1 ? (N == null ? h.delete(_) : h.set(_, k(N)), r) : h.get(_);
    },
    find: function() {
      var _ = Array.prototype.slice.call(arguments), N = _.shift() || 0, $ = (n > 1 ? _.shift() : null) || 0, T = (n > 2 ? _.shift() : null) || 0, M = _.shift() || 1 / 0, S = 0, B = e.length, D, Q, ee, te, W, be;
      for (M *= M, S = 0; S < B; ++S)
        W = e[S], D = N - W.x, Q = $ - (W.y || 0), ee = T - (W.z || 0), te = D * D + Q * Q + ee * ee, te < M && (be = W, M = te);
      return be;
    },
    on: function(_, N) {
      return arguments.length > 1 ? (p.on(_, N), r) : p.on(_);
    }
  };
}
function of() {
  var e, t, n, r, i, o = Ot(-30), a, u = 1, s = 1 / 0, h = 0.81;
  function d(m) {
    var E, k = e.length, _ = (t === 1 ? Yi(e, Dn) : t === 2 ? eo(e, Dn, di) : t === 3 ? no(e, Dn, di, Xl) : null).visitAfter(y);
    for (i = m, E = 0; E < k; ++E)
      n = e[E], _.visit(w);
  }
  function p() {
    if (e) {
      var m, E = e.length, k;
      for (a = new Array(E), m = 0; m < E; ++m)
        k = e[m], a[k.index] = +o(k, m, e);
    }
  }
  function y(m) {
    var E = 0, k, _, N = 0, $, T, M, S, B = m.length;
    if (B) {
      for ($ = T = M = S = 0; S < B; ++S)
        (k = m[S]) && (_ = Math.abs(k.value)) && (E += k.value, N += _, $ += _ * (k.x || 0), T += _ * (k.y || 0), M += _ * (k.z || 0));
      E *= Math.sqrt(4 / B), m.x = $ / N, t > 1 && (m.y = T / N), t > 2 && (m.z = M / N);
    } else {
      k = m, k.x = k.data.x, t > 1 && (k.y = k.data.y), t > 2 && (k.z = k.data.z);
      do
        E += a[k.data.index];
      while (k = k.next);
    }
    m.value = E;
  }
  function w(m, E, k, _, N) {
    if (!m.value)
      return !0;
    var $ = [k, _, N][t - 1], T = m.x - n.x, M = t > 1 ? m.y - n.y : 0, S = t > 2 ? m.z - n.z : 0, B = $ - E, D = T * T + M * M + S * S;
    if (B * B / h < D)
      return D < s && (T === 0 && (T = Ue(r), D += T * T), t > 1 && M === 0 && (M = Ue(r), D += M * M), t > 2 && S === 0 && (S = Ue(r), D += S * S), D < u && (D = Math.sqrt(u * D)), n.vx += T * m.value * i / D, t > 1 && (n.vy += M * m.value * i / D), t > 2 && (n.vz += S * m.value * i / D)), !0;
    if (m.length || D >= s)
      return;
    (m.data !== n || m.next) && (T === 0 && (T = Ue(r), D += T * T), t > 1 && M === 0 && (M = Ue(r), D += M * M), t > 2 && S === 0 && (S = Ue(r), D += S * S), D < u && (D = Math.sqrt(u * D)));
    do
      m.data !== n && (B = a[m.data.index] * i / D, n.vx += T * B, t > 1 && (n.vy += M * B), t > 2 && (n.vz += S * B));
    while (m = m.next);
  }
  return d.initialize = function(m, ...E) {
    e = m, r = E.find((k) => typeof k == "function") || Math.random, t = E.find((k) => [1, 2, 3].includes(k)) || 2, p();
  }, d.strength = function(m) {
    return arguments.length ? (o = typeof m == "function" ? m : Ot(+m), p(), d) : o;
  }, d.distanceMin = function(m) {
    return arguments.length ? (u = m * m, d) : Math.sqrt(u);
  }, d.distanceMax = function(m) {
    return arguments.length ? (s = m * m, d) : Math.sqrt(s);
  }, d.theta = function(m) {
    return arguments.length ? (h = m * m, d) : Math.sqrt(h);
  }, d;
}
function er(e) {
  return typeof e == "object" && e !== null && "index" in e && typeof e.index == "number" && "x" in e && typeof e.x == "number" && "y" in e && typeof e.y == "number" && "z" in e && typeof e.z == "number" && "vx" in e && typeof e.vx == "number" && "vy" in e && typeof e.vy == "number" && "vz" in e && typeof e.vz == "number";
}
function af(e) {
  return !!(typeof e == "object" && e !== null && Object.hasOwn(e, "index") && "index" in e && typeof e.index == "number" && "source" in e && er(e.source) && "target" in e && er(e.target));
}
class sf {
  constructor() {
    Z(this, "d3ForceLayout");
    Z(this, "d3AlphaMin", 0.1);
    Z(this, "d3AlphaTarget", 0);
    Z(this, "d3AlphaDecay", 0.0228);
    Z(this, "d3VelocityDecay", 0.4);
    Z(this, "nodeMapping", /* @__PURE__ */ new Map());
    Z(this, "edgeMapping", /* @__PURE__ */ new Map());
    Z(this, "newNodeMap", /* @__PURE__ */ new Map());
    Z(this, "newEdgeMap", /* @__PURE__ */ new Map());
    Z(this, "reheat", !1);
    this.d3ForceLayout = rf().numDimensions(3).alpha(1).force("link", Dl()).force("charge", of()).force("center", Hh()).force("dagRadial", null).stop(), this.d3ForceLayout.force("link").id((t) => t.id);
  }
  get graphNeedsRefresh() {
    return !!this.newNodeMap.size || !!this.newEdgeMap.size;
  }
  async init() {
  }
  refresh() {
    if (this.graphNeedsRefresh || this.reheat) {
      let t = [...this.nodeMapping.values()];
      t = t.concat([...this.newNodeMap.values()]), this.d3ForceLayout.alpha(1).nodes(t).stop();
      for (const r of this.newNodeMap.entries()) {
        const i = r[0], o = r[1];
        if (!er(o))
          throw new Error("Internal error: Node is not settled as a complete D3 Node");
        this.nodeMapping.set(i, o);
      }
      this.newNodeMap.clear();
      let n = [...this.edgeMapping.values()];
      n = n.concat([...this.newEdgeMap.values()]), this.d3ForceLayout.force("link").links(n);
      for (const r of this.newEdgeMap.entries()) {
        const i = r[0], o = r[1];
        if (!af(o))
          throw new Error("Internal error: Edge is not settled as a complete D3 Edge");
        this.edgeMapping.set(i, o);
      }
      this.newEdgeMap.clear();
    }
  }
  step() {
    this.refresh(), this.d3ForceLayout.tick();
  }
  get isSettled() {
    return console.log(`this.d3ForceLayout.alpha() ${this.d3ForceLayout.alpha()}`), this.d3ForceLayout.alpha() < this.d3AlphaMin;
  }
  addNode(t) {
    this.newNodeMap.set(t, { id: t.id });
  }
  addEdge(t) {
    this.newEdgeMap.set(t, {
      source: t.srcId,
      target: t.dstId
    });
  }
  get nodes() {
    return this.nodeMapping.keys();
  }
  get edges() {
    return this.edgeMapping.keys();
  }
  getNodePosition(t) {
    const n = this._getMappedNode(t);
    if (n.x === void 0 || n.y === void 0 || n.z === void 0)
      throw new Error("Internal error: Node not initialized in D3GraphEngine");
    return {
      x: n.x,
      y: n.y,
      z: n.z
    };
  }
  setNodePosition(t, n) {
    const r = this._getMappedNode(t);
    r.x = n.x, r.y = n.y, r.z = n.z ?? 0, this.reheat = !0;
  }
  getEdgePosition(t) {
    const n = this._getMappedEdge(t);
    return {
      src: {
        x: n.source.x,
        y: n.source.y,
        z: n.source.z
      },
      dst: {
        x: n.target.x,
        y: n.target.y,
        z: n.target.z
      }
    };
  }
  pin(t) {
    const n = this._getMappedNode(t);
    n.fx = n.x, n.fy = n.y, n.fz = n.z, this.reheat = !0;
  }
  unpin(t) {
    const n = this._getMappedNode(t);
    n.fx = void 0, n.fy = void 0, n.fz = void 0, this.reheat = !0;
  }
  _getMappedNode(t) {
    this.refresh();
    const n = this.nodeMapping.get(t);
    if (!n)
      throw new Error("Internal error: Node not found in D3GraphEngine");
    return n;
  }
  _getMappedEdge(t) {
    this.refresh();
    const n = this.edgeMapping.get(t);
    if (!n)
      throw new Error("Internal error: Edge not found in D3GraphEngine");
    return n;
  }
}
const pi = /* @__PURE__ */ new Map();
class uf {
  constructor() {
    Z(this, "hits", 0);
    Z(this, "misses", 0);
  }
  get(t, n) {
    let r = pi.get(t);
    return r ? (this.hits++, r.createInstance(t)) : (this.misses++, r = n(), r.isVisible = !1, pi.set(t, r), r.createInstance(t));
  }
  reset() {
    this.hits = 0, this.misses = 0;
  }
}
var sn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function xn(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var hr = function(t) {
  hf(t);
  var n = cf(t);
  return t.on = n.on, t.off = n.off, t.fire = n.fire, t;
};
function cf(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return {
    on: function(n, r, i) {
      if (typeof r != "function")
        throw new Error("callback is expected to be a function");
      var o = t[n];
      return o || (o = t[n] = []), o.push({ callback: r, ctx: i }), e;
    },
    off: function(n, r) {
      var i = typeof n > "u";
      if (i)
        return t = /* @__PURE__ */ Object.create(null), e;
      if (t[n]) {
        var o = typeof r != "function";
        if (o)
          delete t[n];
        else
          for (var a = t[n], u = 0; u < a.length; ++u)
            a[u].callback === r && a.splice(u, 1);
      }
      return e;
    },
    fire: function(n) {
      var r = t[n];
      if (!r)
        return e;
      var i;
      arguments.length > 1 && (i = Array.prototype.splice.call(arguments, 1));
      for (var o = 0; o < r.length; ++o) {
        var a = r[o];
        a.callback.apply(a.ctx, i);
      }
      return e;
    }
  };
}
function hf(e) {
  if (!e)
    throw new Error("Eventify cannot use falsy object as events subject");
  for (var t = ["on", "fire", "off"], n = 0; n < t.length; ++n)
    if (e.hasOwnProperty(t[n]))
      throw new Error("Subject cannot be eventified, since it already has property '" + t[n] + "'");
}
var lf = df, ff = hr;
function df(e) {
  if (e = e || {}, "uniqueLinkId" in e && (console.warn(
    "ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\nUse `multigraph` option instead\n",
    `
`,
    `Note: there is also change in default behavior: From now on each graph
is considered to be not a multigraph by default (each edge is unique).`
  ), e.multigraph = e.uniqueLinkId), e.multigraph === void 0 && (e.multigraph = !1), typeof Map != "function")
    throw new Error("ngraph.graph requires `Map` to be defined. Please polyfill it before using ngraph");
  var t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = {}, i = 0, o = e.multigraph ? T : $, a = [], u = A, s = A, h = A, d = A, p = {
    /**
     * Sometimes duck typing could be slow. Giving clients a hint about data structure
     * via explicit version number here:
     */
    version: 20,
    /**
     * Adds node to the graph. If node with given id already exists in the graph
     * its data is extended with whatever comes in 'data' argument.
     *
     * @param nodeId the node's identifier. A string or number is preferred.
     * @param [data] additional data for the node being added. If node already
     *   exists its data object is augmented with the new one.
     *
     * @return {node} The newly added node or node with given id if it already exists.
     */
    addNode: E,
    /**
     * Adds a link to the graph. The function always create a new
     * link between two nodes. If one of the nodes does not exists
     * a new node is created.
     *
     * @param fromId link start node id;
     * @param toId link end node id;
     * @param [data] additional data to be set on the new link;
     *
     * @return {link} The newly created link
     */
    addLink: N,
    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: D,
    /**
     * Removes node with given id from the graph. If node does not exist in the graph
     * does nothing.
     *
     * @param nodeId node's identifier passed to addNode() function.
     *
     * @returns true if node was removed; false otherwise.
     */
    removeNode: _,
    /**
     * Gets node with given identifier. If node does not exist undefined value is returned.
     *
     * @param nodeId requested node identifier;
     *
     * @return {node} in with requested identifier or undefined if no such node exists.
     */
    getNode: k,
    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodeCount: M,
    /**
     * Gets total number of links in the graph.
     */
    getLinkCount: S,
    /**
     * Gets total number of links in the graph.
     */
    getEdgeCount: S,
    /**
     * Synonym for `getLinkCount()`
     */
    getLinksCount: S,
    /**
     * Synonym for `getNodeCount()`
     */
    getNodesCount: M,
    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Set of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: B,
    /**
     * Invokes callback on each node of the graph.
     *
     * @param {Function(node)} callback Function to be invoked. The function
     *   is passed one argument: visited node.
     */
    forEachNode: we,
    /**
     * Invokes callback on every linked (adjacent) node to the given one.
     *
     * @param nodeId Identifier of the requested node.
     * @param {Function(node, link)} callback Function to be called on all linked nodes.
     *   The function is passed two parameters: adjacent node and link object itself.
     * @param oriented if true graph treated as oriented.
     */
    forEachLinkedNode: be,
    /**
     * Enumerates all links in the graph
     *
     * @param {Function(link)} callback Function to be called on all links in the graph.
     *   The function is passed one parameter: graph's link object.
     *
     * Link object contains at least the following fields:
     *  fromId - node id where link starts;
     *  toId - node id where link ends,
     *  data - additional data passed to graph.addLink() method.
     */
    forEachLink: W,
    /**
     * Suspend all notifications about graph changes until
     * endUpdate is called.
     */
    beginUpdate: h,
    /**
     * Resumes all notifications about graph changes and fires
     * graph 'changed' event in case there are any pending changes.
     */
    endUpdate: d,
    /**
     * Removes all nodes and links from the graph.
     */
    clear: te,
    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonym for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: ee,
    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonym for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: k,
    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one; undefined otherwise.
     */
    getLink: ee
  };
  return ff(p), y(), p;
  function y() {
    var F = p.on;
    p.on = R;
    function R() {
      return p.beginUpdate = h = re, p.endUpdate = d = me, u = w, s = m, p.on = F, F.apply(p, arguments);
    }
  }
  function w(F, R) {
    a.push({
      link: F,
      changeType: R
    });
  }
  function m(F, R) {
    a.push({
      node: F,
      changeType: R
    });
  }
  function E(F, R) {
    if (F === void 0)
      throw new Error("Invalid node identifier");
    h();
    var V = k(F);
    return V ? (V.data = R, s(V, "update")) : (V = new pf(F, R), s(V, "add")), t.set(F, V), d(), V;
  }
  function k(F) {
    return t.get(F);
  }
  function _(F) {
    var R = k(F);
    if (!R)
      return !1;
    h();
    var V = R.links;
    return V && (V.forEach(Q), R.links = null), t.delete(F), s(R, "remove"), d(), !0;
  }
  function N(F, R, V) {
    h();
    var U = k(F) || E(F), ue = k(R) || E(R), se = o(F, R, V), de = n.has(se.id);
    return n.set(se.id, se), gi(U, se), F !== R && gi(ue, se), u(se, de ? "update" : "add"), d(), se;
  }
  function $(F, R, V) {
    var U = un(F, R), ue = n.get(U);
    return ue ? (ue.data = V, ue) : new vi(F, R, V, U);
  }
  function T(F, R, V) {
    var U = un(F, R), ue = r.hasOwnProperty(U);
    if (ue || ee(F, R)) {
      ue || (r[U] = 0);
      var se = "@" + ++r[U];
      U = un(F + se, R + se);
    }
    return new vi(F, R, V, U);
  }
  function M() {
    return t.size;
  }
  function S() {
    return n.size;
  }
  function B(F) {
    var R = k(F);
    return R ? R.links : null;
  }
  function D(F, R) {
    return R !== void 0 && (F = ee(F, R)), Q(F);
  }
  function Q(F) {
    if (!F || !n.get(F.id))
      return !1;
    h(), n.delete(F.id);
    var R = k(F.fromId), V = k(F.toId);
    return R && R.links.delete(F), V && V.links.delete(F), u(F, "remove"), d(), !0;
  }
  function ee(F, R) {
    if (!(F === void 0 || R === void 0))
      return n.get(un(F, R));
  }
  function te() {
    h(), we(function(F) {
      _(F.id);
    }), d();
  }
  function W(F) {
    if (typeof F == "function")
      for (var R = n.values(), V = R.next(); !V.done; ) {
        if (F(V.value))
          return !0;
        V = R.next();
      }
  }
  function be(F, R, V) {
    var U = k(F);
    if (U && U.links && typeof R == "function")
      return V ? C(U.links, F, R) : O(U.links, F, R);
  }
  function O(F, R, V) {
    for (var U, ue = F.values(), se = ue.next(); !se.done; ) {
      var de = se.value, He = de.fromId === R ? de.toId : de.fromId;
      if (U = V(t.get(He), de), U)
        return !0;
      se = ue.next();
    }
  }
  function C(F, R, V) {
    for (var U, ue = F.values(), se = ue.next(); !se.done; ) {
      var de = se.value;
      if (de.fromId === R && (U = V(t.get(de.toId), de), U))
        return !0;
      se = ue.next();
    }
  }
  function A() {
  }
  function re() {
    i += 1;
  }
  function me() {
    i -= 1, i === 0 && a.length > 0 && (p.fire("changed", a), a.length = 0);
  }
  function we(F) {
    if (typeof F != "function")
      throw new Error("Function is expected to iterate over graph nodes. You passed " + F);
    for (var R = t.values(), V = R.next(); !V.done; ) {
      if (F(V.value))
        return !0;
      V = R.next();
    }
  }
}
function pf(e, t) {
  this.id = e, this.links = null, this.data = t;
}
function gi(e, t) {
  e.links ? e.links.add(t) : e.links = /* @__PURE__ */ new Set([t]);
}
function vi(e, t, n, r) {
  this.fromId = e, this.toId = t, this.data = n, this.id = r;
}
function un(e, t) {
  return e.toString() + "👉 " + t.toString();
}
const gf = /* @__PURE__ */ xn(lf);
var lr = { exports: {} }, Rt = { exports: {} }, uo = function(t) {
  return t === 0 ? "x" : t === 1 ? "y" : t === 2 ? "z" : "c" + (t + 1);
};
const vf = uo;
var gt = function(t) {
  return n;
  function n(r, i) {
    let o = i && i.indent || 0, a = i && i.join !== void 0 ? i.join : `
`, u = Array(o + 1).join(" "), s = [];
    for (let h = 0; h < t; ++h) {
      let d = vf(h), p = h === 0 ? "" : u;
      s.push(p + r.replace(/{var}/g, d));
    }
    return s.join(a);
  }
};
const co = gt;
Rt.exports = _f;
Rt.exports.generateCreateBodyFunctionBody = ho;
Rt.exports.getVectorCode = fo;
Rt.exports.getBodyCode = lo;
function _f(e, t) {
  let n = ho(e, t), { Body: r } = new Function(n)();
  return r;
}
function ho(e, t) {
  return `
${fo(e, t)}
${lo(e)}
return {Body: Body, Vector: Vector};
`;
}
function lo(e) {
  let t = co(e), n = t("{var}", { join: ", " });
  return `
function Body(${n}) {
  this.isPinned = false;
  this.pos = new Vector(${n});
  this.force = new Vector();
  this.velocity = new Vector();
  this.mass = 1;

  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.reset = function() {
  this.force.reset();
  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.setPosition = function (${n}) {
  ${t("this.pos.{var} = {var} || 0;", { indent: 2 })}
};`;
}
function fo(e, t) {
  let n = co(e), r = "";
  return t && (r = `${n(`
   var v{var};
Object.defineProperty(this, '{var}', {
  set: function(v) { 
    if (!Number.isFinite(v)) throw new Error('Cannot set non-numbers to {var}');
    v{var} = v; 
  },
  get: function() { return v{var}; }
});`)}`), `function Vector(${n("{var}", { join: ", " })}) {
  ${r}
    if (typeof arguments[0] === 'object') {
      // could be another vector
      let v = arguments[0];
      ${n('if (!Number.isFinite(v.{var})) throw new Error("Expected value is not a finite number at Vector constructor ({var})");', { indent: 4 })}
      ${n("this.{var} = v.{var};", { indent: 4 })}
    } else {
      ${n('this.{var} = typeof {var} === "number" ? {var} : 0;', { indent: 4 })}
    }
  }
  
  Vector.prototype.reset = function () {
    ${n("this.{var} = ", { join: "" })}0;
  };`;
}
var mf = Rt.exports, et = { exports: {} };
const fr = gt, We = uo;
et.exports = yf;
et.exports.generateQuadTreeFunctionBody = po;
et.exports.getInsertStackCode = yo;
et.exports.getQuadNodeCode = mo;
et.exports.isSamePosition = go;
et.exports.getChildBodyCode = _o;
et.exports.setChildBodyCode = vo;
function yf(e) {
  let t = po(e);
  return new Function(t)();
}
function po(e) {
  let t = fr(e), n = Math.pow(2, e);
  return `
${yo()}
${mo(e)}
${go(e)}
${_o(e)}
${vo(e)}

function createQuadTree(options, random) {
  options = options || {};
  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

  var gravity = options.gravity;
  var updateQueue = [];
  var insertStack = new InsertStack();
  var theta = options.theta;

  var nodesCache = [];
  var currentInCache = 0;
  var root = newNode();

  return {
    insertBodies: insertBodies,

    /**
     * Gets root node if it is present
     */
    getRoot: function() {
      return root;
    },

    updateBodyForce: update,

    options: function(newOptions) {
      if (newOptions) {
        if (typeof newOptions.gravity === 'number') {
          gravity = newOptions.gravity;
        }
        if (typeof newOptions.theta === 'number') {
          theta = newOptions.theta;
        }

        return this;
      }

      return {
        gravity: gravity,
        theta: theta
      };
    }
  };

  function newNode() {
    // To avoid pressure on GC we reuse nodes.
    var node = nodesCache[currentInCache];
    if (node) {
${a("      node.")}
      node.body = null;
      node.mass = ${t("node.mass_{var} = ", { join: "" })}0;
      ${t("node.min_{var} = node.max_{var} = ", { join: "" })}0;
    } else {
      node = new QuadNode();
      nodesCache[currentInCache] = node;
    }

    ++currentInCache;
    return node;
  }

  function update(sourceBody) {
    var queue = updateQueue;
    var v;
    ${t("var d{var};", { indent: 4 })}
    var r; 
    ${t("var f{var} = 0;", { indent: 4 })}
    var queueLength = 1;
    var shiftIdx = 0;
    var pushIdx = 1;

    queue[0] = root;

    while (queueLength) {
      var node = queue[shiftIdx];
      var body = node.body;

      queueLength -= 1;
      shiftIdx += 1;
      var differentBody = (body !== sourceBody);
      if (body && differentBody) {
        // If the current node is a leaf node (and it is not source body),
        // calculate the force exerted by the current node on body, and add this
        // amount to body's net force.
        ${t("d{var} = body.pos.{var} - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${t("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${t("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${t("d{var} * d{var}", { join: " + " })});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${t("f{var} += v * d{var};", { indent: 8 })}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${t("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${t("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${t("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${t("d{var} * d{var}", { join: " + " })});
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${We(0)} - node.min_${We(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${t("f{var} += v * d{var};", { indent: 10 })}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${o()}
        }
      }
    }

    ${t("sourceBody.force.{var} += f{var};", { indent: 4 })}
  }

  function insertBodies(bodies) {
    ${t("var {var}min = Number.MAX_VALUE;", { indent: 4 })}
    ${t("var {var}max = Number.MIN_VALUE;", { indent: 4 })}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${t("if (pos.{var} < {var}min) {var}min = pos.{var};", { indent: 6 })}
      ${t("if (pos.{var} > {var}max) {var}max = pos.{var};", { indent: 6 })}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${t("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;", { indent: 4 })}

    currentInCache = 0;
    root = newNode();
    ${t("root.min_{var} = {var}min;", { indent: 4 })}
    ${t("root.max_{var} = {var}min + maxSideLength;", { indent: 4 })}

    i = bodies.length - 1;
    if (i >= 0) {
      root.body = bodies[i];
    }
    while (i--) {
      insert(bodies[i], root);
    }
  }

  function insert(newBody) {
    insertStack.reset();
    insertStack.push(root, newBody);

    while (!insertStack.isEmpty()) {
      var stackItem = insertStack.pop();
      var node = stackItem.node;
      var body = stackItem.body;

      if (!node.body) {
        // This is internal node. Update the total mass of the node and center-of-mass.
        ${t("var {var} = body.pos.{var};", { indent: 8 })}
        node.mass += body.mass;
        ${t("node.mass_{var} += body.mass * {var};", { indent: 8 })}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${t("var min_{var} = node.min_{var};", { indent: 8 })}
        ${t("var max_{var} = (min_{var} + node.max_{var}) / 2;", { indent: 8 })}

${i(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${t("child.min_{var} = min_{var};", { indent: 10 })}
          ${t("child.max_{var} = max_{var};", { indent: 10 })}
          child.body = body;

          setChild(node, quadIdx, child);
        } else {
          // continue searching in this quadrant.
          insertStack.push(child, body);
        }
      } else {
        // We are trying to add to the leaf node.
        // We have to convert current leaf into internal node
        // and continue adding two nodes.
        var oldBody = node.body;
        node.body = null; // internal nodes do not cary bodies

        if (isSamePosition(oldBody.pos, body.pos)) {
          // Prevent infinite subdivision by bumping one node
          // anywhere in this quadrant
          var retriesCount = 3;
          do {
            var offset = random.nextDouble();
            ${t("var d{var} = (node.max_{var} - node.min_{var}) * offset;", { indent: 12 })}

            ${t("oldBody.pos.{var} = node.min_{var} + d{var};", { indent: 12 })}
            retriesCount -= 1;
            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
          } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

          if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
            // This is very bad, we ran out of precision.
            // if we do not return from the method we'll get into
            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
            // Next layout iteration should get larger bounding box in the first step and fix this
            return;
          }
        }
        // Next iteration should subdivide node further.
        insertStack.push(node, oldBody);
        insertStack.push(node, body);
      }
    }
  }
}
return createQuadTree;

`;
  function i(u) {
    let s = [], h = Array(u + 1).join(" ");
    for (let d = 0; d < e; ++d)
      s.push(h + `if (${We(d)} > max_${We(d)}) {`), s.push(h + `  quadIdx = quadIdx + ${Math.pow(2, d)};`), s.push(h + `  min_${We(d)} = max_${We(d)};`), s.push(h + `  max_${We(d)} = node.max_${We(d)};`), s.push(h + "}");
    return s.join(`
`);
  }
  function o() {
    let u = Array(11).join(" "), s = [];
    for (let h = 0; h < n; ++h)
      s.push(u + `if (node.quad${h}) {`), s.push(u + `  queue[pushIdx] = node.quad${h};`), s.push(u + "  queueLength += 1;"), s.push(u + "  pushIdx += 1;"), s.push(u + "}");
    return s.join(`
`);
  }
  function a(u) {
    let s = [];
    for (let h = 0; h < n; ++h)
      s.push(`${u}quad${h} = null;`);
    return s.join(`
`);
  }
}
function go(e) {
  let t = fr(e);
  return `
  function isSamePosition(point1, point2) {
    ${t("var d{var} = Math.abs(point1.{var} - point2.{var});", { indent: 2 })}
  
    return ${t("d{var} < 1e-8", { join: " && " })};
  }  
`;
}
function vo(e) {
  var t = Math.pow(2, e);
  return `
function setChild(node, idx, child) {
  ${n()}
}`;
  function n() {
    let r = [];
    for (let i = 0; i < t; ++i) {
      let o = i === 0 ? "  " : "  else ";
      r.push(`${o}if (idx === ${i}) node.quad${i} = child;`);
    }
    return r.join(`
`);
  }
}
function _o(e) {
  return `function getChild(node, idx) {
${t()}
  return null;
}`;
  function t() {
    let n = [], r = Math.pow(2, e);
    for (let i = 0; i < r; ++i)
      n.push(`  if (idx === ${i}) return node.quad${i};`);
    return n.join(`
`);
  }
}
function mo(e) {
  let t = fr(e), n = Math.pow(2, e);
  var r = `
function QuadNode() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain bodies:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
${i("  this.")}

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  ${t("this.mass_{var} = 0;", { indent: 2 })}

  // bounding box coordinates
  ${t("this.min_{var} = 0;", { indent: 2 })}
  ${t("this.max_{var} = 0;", { indent: 2 })}
}
`;
  return r;
  function i(o) {
    let a = [];
    for (let u = 0; u < n; ++u)
      a.push(`${o}quad${u} = null;`);
    return a.join(`
`);
  }
}
function yo() {
  return `
/**
 * Our implementation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack () {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function() {
        return this.popIdx === 0;
    },
    push: function (node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressure: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function () {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function () {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}
`;
}
var bf = et.exports, dr = { exports: {} };
dr.exports = xf;
dr.exports.generateFunctionBody = bo;
const wf = gt;
function xf(e) {
  let t = bo(e);
  return new Function("bodies", "settings", "random", t);
}
function bo(e) {
  let t = wf(e);
  return `
  var boundingBox = {
    ${t("min_{var}: 0, max_{var}: 0,", { indent: 4 })}
  };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset: resetBoundingBox,

    getBestNewPosition: function (neighbors) {
      var ${t("base_{var} = 0", { join: ", " })};

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          let neighborPos = neighbors[i].pos;
          ${t("base_{var} += neighborPos.{var};", { indent: 10 })}
        }

        ${t("base_{var} /= neighbors.length;", { indent: 8 })}
      } else {
        ${t("base_{var} = (boundingBox.min_{var} + boundingBox.max_{var}) / 2;", { indent: 8 })}
      }

      var springLength = settings.springLength;
      return {
        ${t("{var}: base_{var} + (random.nextDouble() - 0.5) * springLength,", { indent: 8 })}
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) return; // No bodies - no borders.

    ${t("var max_{var} = -Infinity;", { indent: 4 })}
    ${t("var min_{var} = Infinity;", { indent: 4 })}

    while(i--) {
      // this is O(n), it could be done faster with quadtree, if we check the root node bounds
      var bodyPos = bodies[i].pos;
      ${t("if (bodyPos.{var} < min_{var}) min_{var} = bodyPos.{var};", { indent: 6 })}
      ${t("if (bodyPos.{var} > max_{var}) max_{var} = bodyPos.{var};", { indent: 6 })}
    }

    ${t("boundingBox.min_{var} = min_{var};", { indent: 4 })}
    ${t("boundingBox.max_{var} = max_{var};", { indent: 4 })}
  }

  function resetBoundingBox() {
    ${t("boundingBox.min_{var} = boundingBox.max_{var} = 0;", { indent: 4 })}
  }
`;
}
var kf = dr.exports, pr = { exports: {} };
const Ef = gt;
pr.exports = Nf;
pr.exports.generateCreateDragForceFunctionBody = wo;
function Nf(e) {
  let t = wo(e);
  return new Function("options", t);
}
function wo(e) {
  return `
  if (!Number.isFinite(options.dragCoefficient)) throw new Error('dragCoefficient is not a finite number');

  return {
    update: function(body) {
      ${Ef(e)("body.force.{var} -= options.dragCoefficient * body.velocity.{var};", { indent: 6 })}
    }
  };
`;
}
var $f = pr.exports, gr = { exports: {} };
const zf = gt;
gr.exports = Tf;
gr.exports.generateCreateSpringForceFunctionBody = xo;
function Tf(e) {
  let t = xo(e);
  return new Function("options", "random", t);
}
function xo(e) {
  let t = zf(e);
  return `
  if (!Number.isFinite(options.springCoefficient)) throw new Error('Spring coefficient is not a number');
  if (!Number.isFinite(options.springLength)) throw new Error('Spring length is not a number');

  return {
    /**
     * Updates forces acting on a spring
     */
    update: function (spring) {
      var body1 = spring.from;
      var body2 = spring.to;
      var length = spring.length < 0 ? options.springLength : spring.length;
      ${t("var d{var} = body2.pos.{var} - body1.pos.{var};", { indent: 6 })}
      var r = Math.sqrt(${t("d{var} * d{var}", { join: " + " })});

      if (r === 0) {
        ${t("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 8 })}
        r = Math.sqrt(${t("d{var} * d{var}", { join: " + " })});
      }

      var d = r - length;
      var coefficient = ((spring.coefficient > 0) ? spring.coefficient : options.springCoefficient) * d / r;

      ${t("body1.force.{var} += coefficient * d{var}", { indent: 6 })};
      body1.springCount += 1;
      body1.springLength += r;

      ${t("body2.force.{var} -= coefficient * d{var}", { indent: 6 })};
      body2.springCount += 1;
      body2.springLength += r;
    }
  };
`;
}
var Mf = gr.exports, vr = { exports: {} };
const If = gt;
vr.exports = Cf;
vr.exports.generateIntegratorFunctionBody = ko;
function Cf(e) {
  let t = ko(e);
  return new Function("bodies", "timeStep", "adaptiveTimeStepWeight", t);
}
function ko(e) {
  let t = If(e);
  return `
  var length = bodies.length;
  if (length === 0) return 0;

  ${t("var d{var} = 0, t{var} = 0;", { indent: 2 })}

  for (var i = 0; i < length; ++i) {
    var body = bodies[i];
    if (body.isPinned) continue;

    if (adaptiveTimeStepWeight && body.springCount) {
      timeStep = (adaptiveTimeStepWeight * body.springLength/body.springCount);
    }

    var coeff = timeStep / body.mass;

    ${t("body.velocity.{var} += coeff * body.force.{var};", { indent: 4 })}
    ${t("var v{var} = body.velocity.{var};", { indent: 4 })}
    var v = Math.sqrt(${t("v{var} * v{var}", { join: " + " })});

    if (v > 1) {
      // We normalize it so that we move within timeStep range. 
      // for the case when v <= 1 - we let velocity to fade out.
      ${t("body.velocity.{var} = v{var} / v;", { indent: 6 })}
    }

    ${t("d{var} = timeStep * body.velocity.{var};", { indent: 4 })}

    ${t("body.pos.{var} += d{var};", { indent: 4 })}

    ${t("t{var} += Math.abs(d{var});", { indent: 4 })}
  }

  return (${t("t{var} * t{var}", { join: " + " })})/length;
`;
}
var Sf = vr.exports, Un, _i;
function Of() {
  if (_i)
    return Un;
  _i = 1, Un = e;
  function e(t, n, r, i) {
    this.from = t, this.to = n, this.length = r, this.coefficient = i;
  }
  return Un;
}
var qn, mi;
function Pf() {
  if (mi)
    return qn;
  mi = 1, qn = e;
  function e(t, n) {
    var r;
    if (t || (t = {}), n) {
      for (r in n)
        if (n.hasOwnProperty(r)) {
          var i = t.hasOwnProperty(r), o = typeof n[r], a = !i || typeof t[r] !== o;
          a ? t[r] = n[r] : o === "object" && (t[r] = e(t[r], n[r]));
        }
    }
    return t;
  }
  return qn;
}
var Mt = { exports: {} }, yi;
function Af() {
  if (yi)
    return Mt.exports;
  yi = 1, Mt.exports = e, Mt.exports.random = e, Mt.exports.randomIterator = u;
  function e(s) {
    var h = typeof s == "number" ? s : +/* @__PURE__ */ new Date();
    return new t(h);
  }
  function t(s) {
    this.seed = s;
  }
  t.prototype.next = a, t.prototype.nextDouble = o, t.prototype.uniform = o, t.prototype.gaussian = n;
  function n() {
    var s, h, d;
    do
      h = this.nextDouble() * 2 - 1, d = this.nextDouble() * 2 - 1, s = h * h + d * d;
    while (s >= 1 || s === 0);
    return h * Math.sqrt(-2 * Math.log(s) / s);
  }
  t.prototype.levy = r;
  function r() {
    var s = 1.5, h = Math.pow(
      i(1 + s) * Math.sin(Math.PI * s / 2) / (i((1 + s) / 2) * s * Math.pow(2, (s - 1) / 2)),
      1 / s
    );
    return this.gaussian() * h / Math.pow(Math.abs(this.gaussian()), 1 / s);
  }
  function i(s) {
    return Math.sqrt(2 * Math.PI / s) * Math.pow(1 / Math.E * (s + 1 / (12 * s - 1 / (10 * s))), s);
  }
  function o() {
    var s = this.seed;
    return s = s + 2127912214 + (s << 12) & 4294967295, s = (s ^ 3345072700 ^ s >>> 19) & 4294967295, s = s + 374761393 + (s << 5) & 4294967295, s = (s + 3550635116 ^ s << 9) & 4294967295, s = s + 4251993797 + (s << 3) & 4294967295, s = (s ^ 3042594569 ^ s >>> 16) & 4294967295, this.seed = s, (s & 268435455) / 268435456;
  }
  function a(s) {
    return Math.floor(this.nextDouble() * s);
  }
  function u(s, h) {
    var d = h || e();
    if (typeof d.next != "function")
      throw new Error("customRandom does not match expected API: next() function is missing");
    return {
      forEach: y,
      /**
       * Shuffles array randomly, in place.
       */
      shuffle: p
    };
    function p() {
      var w, m, E;
      for (w = s.length - 1; w > 0; --w)
        m = d.next(w + 1), E = s[m], s[m] = s[w], s[w] = E;
      return s;
    }
    function y(w) {
      var m, E, k;
      for (m = s.length - 1; m > 0; --m)
        E = d.next(m + 1), k = s[E], s[E] = s[m], s[m] = k, w(k);
      s.length && w(s[0]);
    }
  }
  return Mt.exports;
}
var Eo = Df, Ff = mf, Zf = bf, Lf = kf, jf = $f, Bf = Mf, Rf = Sf, bi = {};
function Df(e) {
  var t = Of(), n = Pf(), r = hr;
  if (e) {
    if (e.springCoeff !== void 0)
      throw new Error("springCoeff was renamed to springCoefficient");
    if (e.dragCoeff !== void 0)
      throw new Error("dragCoeff was renamed to dragCoefficient");
  }
  e = n(e, {
    /**
     * Ideal length for links (springs in physical model).
     */
    springLength: 10,
    /**
     * Hook's law coefficient. 1 - solid spring.
     */
    springCoefficient: 0.8,
    /**
     * Coulomb's law coefficient. It's used to repel nodes thus should be negative
     * if you make it positive nodes start attract each other :).
     */
    gravity: -12,
    /**
     * Theta coefficient from Barnes Hut simulation. Ranged between (0, 1).
     * The closer it's to 1 the more nodes algorithm will have to go through.
     * Setting it to one makes Barnes Hut simulation no different from
     * brute-force forces calculation (each node is considered).
     */
    theta: 0.8,
    /**
     * Drag force coefficient. Used to slow down system, thus should be less than 1.
     * The closer it is to 0 the less tight system will be.
     */
    dragCoefficient: 0.9,
    // TODO: Need to rename this to something better. E.g. `dragCoefficient`
    /**
     * Default time step (dt) for forces integration
     */
    timeStep: 0.5,
    /**
     * Adaptive time step uses average spring length to compute actual time step:
     * See: https://twitter.com/anvaka/status/1293067160755957760
     */
    adaptiveTimeStepWeight: 0,
    /**
     * This parameter defines number of dimensions of the space where simulation
     * is performed. 
     */
    dimensions: 2,
    /**
     * In debug mode more checks are performed, this will help you catch errors
     * quickly, however for production build it is recommended to turn off this flag
     * to speed up computation.
     */
    debug: !1
  });
  var i = bi[e.dimensions];
  if (!i) {
    var o = e.dimensions;
    i = {
      Body: Ff(o, e.debug),
      createQuadTree: Zf(o),
      createBounds: Lf(o),
      createDragForce: jf(o),
      createSpringForce: Bf(o),
      integrate: Rf(o)
    }, bi[o] = i;
  }
  var a = i.Body, u = i.createQuadTree, s = i.createBounds, h = i.createDragForce, d = i.createSpringForce, p = i.integrate, y = (C) => new a(C), w = Af().random(42), m = [], E = [], k = u(e, w), _ = s(m, e, w), N = d(e, w), $ = h(e), T = 0, M = [], S = /* @__PURE__ */ new Map(), B = 0;
  ee("nbody", be), ee("spring", O);
  var D = {
    /**
     * Array of bodies, registered with current simulator
     *
     * Note: To add new body, use addBody() method. This property is only
     * exposed for testing/performance purposes.
     */
    bodies: m,
    quadTree: k,
    /**
     * Array of springs, registered with current simulator
     *
     * Note: To add new spring, use addSpring() method. This property is only
     * exposed for testing/performance purposes.
     */
    springs: E,
    /**
     * Returns settings with which current simulator was initialized
     */
    settings: e,
    /**
     * Adds a new force to simulation
     */
    addForce: ee,
    /**
     * Removes a force from the simulation.
     */
    removeForce: te,
    /**
     * Returns a map of all registered forces.
     */
    getForces: W,
    /**
     * Performs one step of force simulation.
     *
     * @returns {boolean} true if system is considered stable; False otherwise.
     */
    step: function() {
      for (var C = 0; C < M.length; ++C)
        M[C](B);
      var A = p(m, e.timeStep, e.adaptiveTimeStepWeight);
      return B += 1, A;
    },
    /**
     * Adds body to the system
     *
     * @param {ngraph.physics.primitives.Body} body physical body
     *
     * @returns {ngraph.physics.primitives.Body} added body
     */
    addBody: function(C) {
      if (!C)
        throw new Error("Body is required");
      return m.push(C), C;
    },
    /**
     * Adds body to the system at given position
     *
     * @param {Object} pos position of a body
     *
     * @returns {ngraph.physics.primitives.Body} added body
     */
    addBodyAt: function(C) {
      if (!C)
        throw new Error("Body position is required");
      var A = y(C);
      return m.push(A), A;
    },
    /**
     * Removes body from the system
     *
     * @param {ngraph.physics.primitives.Body} body to remove
     *
     * @returns {Boolean} true if body found and removed. falsy otherwise;
     */
    removeBody: function(C) {
      if (C) {
        var A = m.indexOf(C);
        if (!(A < 0))
          return m.splice(A, 1), m.length === 0 && _.reset(), !0;
      }
    },
    /**
     * Adds a spring to this simulation.
     *
     * @returns {Object} - a handle for a spring. If you want to later remove
     * spring pass it to removeSpring() method.
     */
    addSpring: function(C, A, re, me) {
      if (!C || !A)
        throw new Error("Cannot add null spring to force simulator");
      typeof re != "number" && (re = -1);
      var we = new t(C, A, re, me >= 0 ? me : -1);
      return E.push(we), we;
    },
    /**
     * Returns amount of movement performed on last step() call
     */
    getTotalMovement: function() {
      return T;
    },
    /**
     * Removes spring from the system
     *
     * @param {Object} spring to remove. Spring is an object returned by addSpring
     *
     * @returns {Boolean} true if spring found and removed. falsy otherwise;
     */
    removeSpring: function(C) {
      if (C) {
        var A = E.indexOf(C);
        if (A > -1)
          return E.splice(A, 1), !0;
      }
    },
    getBestNewBodyPosition: function(C) {
      return _.getBestNewPosition(C);
    },
    /**
     * Returns bounding box which covers all bodies
     */
    getBBox: Q,
    getBoundingBox: Q,
    invalidateBBox: function() {
      console.warn("invalidateBBox() is deprecated, bounds always recomputed on `getBBox()` call");
    },
    // TODO: Move the force specific stuff to force
    gravity: function(C) {
      return C !== void 0 ? (e.gravity = C, k.options({ gravity: C }), this) : e.gravity;
    },
    theta: function(C) {
      return C !== void 0 ? (e.theta = C, k.options({ theta: C }), this) : e.theta;
    },
    /**
     * Returns pseudo-random number generator instance.
     */
    random: w
  };
  return Uf(e, D), r(D), D;
  function Q() {
    return _.update(), _.box;
  }
  function ee(C, A) {
    if (S.has(C))
      throw new Error("Force " + C + " is already added");
    S.set(C, A), M.push(A);
  }
  function te(C) {
    var A = M.indexOf(S.get(C));
    A < 0 || (M.splice(A, 1), S.delete(C));
  }
  function W() {
    return S;
  }
  function be() {
    if (m.length !== 0) {
      k.insertBodies(m);
      for (var C = m.length; C--; ) {
        var A = m[C];
        A.isPinned || (A.reset(), k.updateBodyForce(A), $.update(A));
      }
    }
  }
  function O() {
    for (var C = E.length; C--; )
      N.update(E[C]);
  }
}
function Uf(e, t) {
  for (var n in e)
    qf(e, t, n);
}
function qf(e, t, n) {
  if (e.hasOwnProperty(n) && typeof t[n] != "function") {
    var r = Number.isFinite(e[n]);
    r ? t[n] = function(i) {
      if (i !== void 0) {
        if (!Number.isFinite(i))
          throw new Error("Value of " + n + " should be a valid number.");
        return e[n] = i, t;
      }
      return e[n];
    } : t[n] = function(i) {
      return i !== void 0 ? (e[n] = i, t) : e[n];
    };
  }
}
lr.exports = Hf;
lr.exports.simulator = Eo;
var Gf = hr;
function Hf(e, t) {
  if (!e)
    throw new Error("Graph structure cannot be undefined");
  var n = t && t.createSimulator || Eo, r = n(t);
  if (Array.isArray(t))
    throw new Error("Physics settings is expected to be an object");
  var i = e.version > 19 ? be : W;
  t && typeof t.nodeMass == "function" && (i = t.nodeMass);
  var o = /* @__PURE__ */ new Map(), a = {}, u = 0, s = r.settings.springTransform || Kf;
  $(), k();
  var h = !1, d = {
    /**
     * Performs one step of iterative layout algorithm
     *
     * @returns {boolean} true if the system should be considered stable; False otherwise.
     * The system is stable if no further call to `step()` can improve the layout.
     */
    step: function() {
      if (u === 0)
        return p(!0), !0;
      var O = r.step();
      d.lastMove = O, d.fire("step");
      var C = O / u, A = C <= 0.01;
      return p(A), A;
    },
    /**
     * For a given `nodeId` returns position
     */
    getNodePosition: function(O) {
      return te(O).pos;
    },
    /**
     * Sets position of a node to a given coordinates
     * @param {string} nodeId node identifier
     * @param {number} x position of a node
     * @param {number} y position of a node
     * @param {number=} z position of node (only if applicable to body)
     */
    setNodePosition: function(O) {
      var C = te(O);
      C.setPosition.apply(C, Array.prototype.slice.call(arguments, 1));
    },
    /**
     * @returns {Object} Link position by link id
     * @returns {Object.from} {x, y} coordinates of link start
     * @returns {Object.to} {x, y} coordinates of link end
     */
    getLinkPosition: function(O) {
      var C = a[O];
      if (C)
        return {
          from: C.from.pos,
          to: C.to.pos
        };
    },
    /**
     * @returns {Object} area required to fit in the graph. Object contains
     * `x1`, `y1` - top left coordinates
     * `x2`, `y2` - bottom right coordinates
     */
    getGraphRect: function() {
      return r.getBBox();
    },
    /**
     * Iterates over each body in the layout simulator and performs a callback(body, nodeId)
     */
    forEachBody: y,
    /*
     * Requests layout algorithm to pin/unpin node to its current position
     * Pinned nodes should not be affected by layout algorithm and always
     * remain at their position
     */
    pinNode: function(O, C) {
      var A = te(O.id);
      A.isPinned = !!C;
    },
    /**
     * Checks whether given graph's node is currently pinned
     */
    isNodePinned: function(O) {
      return te(O.id).isPinned;
    },
    /**
     * Request to release all resources
     */
    dispose: function() {
      e.off("changed", N), d.fire("disposed");
    },
    /**
     * Gets physical body for a given node id. If node is not found undefined
     * value is returned.
     */
    getBody: E,
    /**
     * Gets spring for a given edge.
     *
     * @param {string} linkId link identifer. If two arguments are passed then
     * this argument is treated as formNodeId
     * @param {string=} toId when defined this parameter denotes head of the link
     * and first argument is treated as tail of the link (fromId)
     */
    getSpring: m,
    /**
     * Returns length of cumulative force vector. The closer this to zero - the more stable the system is
     */
    getForceVectorLength: w,
    /**
     * [Read only] Gets current physics simulator
     */
    simulator: r,
    /**
     * Gets the graph that was used for layout
     */
    graph: e,
    /**
     * Gets amount of movement performed during last step operation
     */
    lastMove: 0
  };
  return Gf(d), d;
  function p(O) {
    h !== O && (h = O, _(O));
  }
  function y(O) {
    o.forEach(O);
  }
  function w() {
    var O = 0, C = 0;
    return y(function(A) {
      O += Math.abs(A.force.x), C += Math.abs(A.force.y);
    }), Math.sqrt(O * O + C * C);
  }
  function m(O, C) {
    var A;
    if (C === void 0)
      typeof O != "object" ? A = O : A = O.id;
    else {
      var re = e.hasLink(O, C);
      if (!re)
        return;
      A = re.id;
    }
    return a[A];
  }
  function E(O) {
    return o.get(O);
  }
  function k() {
    e.on("changed", N);
  }
  function _(O) {
    d.fire("stable", O);
  }
  function N(O) {
    for (var C = 0; C < O.length; ++C) {
      var A = O[C];
      A.changeType === "add" ? (A.node && T(A.node.id), A.link && S(A.link)) : A.changeType === "remove" && (A.node && M(A.node), A.link && B(A.link));
    }
    u = e.getNodesCount();
  }
  function $() {
    u = 0, e.forEachNode(function(O) {
      T(O.id), u += 1;
    }), e.forEachLink(S);
  }
  function T(O) {
    var C = o.get(O);
    if (!C) {
      var A = e.getNode(O);
      if (!A)
        throw new Error("initBody() was called with unknown node id");
      var re = A.position;
      if (!re) {
        var me = D(A);
        re = r.getBestNewBodyPosition(me);
      }
      C = r.addBodyAt(re), C.id = O, o.set(O, C), Q(O), ee(A) && (C.isPinned = !0);
    }
  }
  function M(O) {
    var C = O.id, A = o.get(C);
    A && (o.delete(C), r.removeBody(A));
  }
  function S(O) {
    Q(O.fromId), Q(O.toId);
    var C = o.get(O.fromId), A = o.get(O.toId), re = r.addSpring(C, A, O.length);
    s(O, re), a[O.id] = re;
  }
  function B(O) {
    var C = a[O.id];
    if (C) {
      var A = e.getNode(O.fromId), re = e.getNode(O.toId);
      A && Q(A.id), re && Q(re.id), delete a[O.id], r.removeSpring(C);
    }
  }
  function D(O) {
    var C = [];
    if (!O.links)
      return C;
    for (var A = Math.min(O.links.length, 2), re = 0; re < A; ++re) {
      var me = O.links[re], we = me.fromId !== O.id ? o.get(me.fromId) : o.get(me.toId);
      we && we.pos && C.push(we);
    }
    return C;
  }
  function Q(O) {
    var C = o.get(O);
    if (C.mass = i(O), Number.isNaN(C.mass))
      throw new Error("Node mass should be a number");
  }
  function ee(O) {
    return O && (O.isPinned || O.data && O.data.isPinned);
  }
  function te(O) {
    var C = o.get(O);
    return C || (T(O), C = o.get(O)), C;
  }
  function W(O) {
    var C = e.getLinks(O);
    return C ? 1 + C.length / 3 : 1;
  }
  function be(O) {
    var C = e.getLinks(O);
    return C ? 1 + C.size / 3 : 1;
  }
}
function Kf() {
}
var Vf = lr.exports;
const Wf = /* @__PURE__ */ xn(Vf);
class Jf {
  constructor() {
    Z(this, "ngraph");
    Z(this, "ngraphLayout");
    Z(this, "nodeMapping", /* @__PURE__ */ new Map());
    Z(this, "edgeMapping", /* @__PURE__ */ new Map());
    Z(this, "_settled", !0);
    this.ngraph = gf(), this.ngraphLayout = Wf(this.ngraph, { dimensions: 3 });
  }
  async init() {
  }
  step() {
    this._settled = this.ngraphLayout.step();
  }
  get isSettled() {
    return this._settled;
  }
  addNode(t) {
    const n = this.ngraph.addNode(t.id, { parentNode: t });
    this.nodeMapping.set(t, n), this._settled = !1;
  }
  addEdge(t) {
    const n = this.ngraph.addLink(t.srcId, t.dstId, { parentEdge: this });
    this.edgeMapping.set(t, n), this._settled = !1;
  }
  getNodePosition(t) {
    const n = this._getMappedNode(t);
    return this.ngraphLayout.getNodePosition(n.id);
  }
  setNodePosition(t, n) {
    const r = this._getMappedNode(t), i = this.ngraphLayout.getNodePosition(r.id);
    i.x = n.x, i.y = n.y, i.z = n.z;
  }
  getEdgePosition(t) {
    const n = this._getMappedEdge(t), r = this.ngraphLayout.getLinkPosition(n.id);
    return {
      src: {
        x: r.from.x,
        y: r.from.y,
        z: r.from.z
      },
      dst: {
        x: r.to.x,
        y: r.to.y,
        z: r.to.z
      }
    };
  }
  get nodes() {
    return this.nodeMapping.keys();
  }
  get edges() {
    return this.edgeMapping.keys();
  }
  pin(t) {
    const n = this._getMappedNode(t);
    this.ngraphLayout.pinNode(n, !0);
  }
  unpin(t) {
    const n = this._getMappedNode(t);
    this.ngraphLayout.pinNode(n, !1);
  }
  _getMappedNode(t) {
    const n = this.nodeMapping.get(t);
    if (!n)
      throw new Error("Internal error: Node not found in NGraphEngine");
    return n;
  }
  _getMappedEdge(t) {
    const n = this.edgeMapping.get(t);
    if (!n)
      throw new Error("Internal error: Edge not found in NGraphEngine");
    return n;
  }
}
class Qf {
  constructor(t) {
    Z(this, "graph");
    Z(this, "sceneInstrumentation");
    Z(this, "babylonInstrumentation");
    Z(this, "graphStep", new ht());
    Z(this, "nodeUpdate", new ht());
    Z(this, "edgeUpdate", new ht());
    Z(this, "arrowCapUpdate", new ht());
    Z(this, "intersectCalc", new ht());
    Z(this, "loadTime", new ht());
    Z(this, "totalUpdates", 0);
    this.graph = t, this.sceneInstrumentation = new Ta(t.scene), this.sceneInstrumentation.captureFrameTime = !0, this.sceneInstrumentation.captureRenderTime = !0, this.sceneInstrumentation.captureInterFrameTime = !0, this.sceneInstrumentation.captureCameraRenderTime = !0, this.sceneInstrumentation.captureActiveMeshesEvaluationTime = !0, this.sceneInstrumentation.captureRenderTargetsRenderTime = !0, this.babylonInstrumentation = new Ma(t.engine), this.babylonInstrumentation.captureGPUFrameTime = !0, this.babylonInstrumentation.captureShaderCompilationTime = !0;
  }
  toString() {
    let t = "";
    function n(o, a, u = "") {
      t += `${o}: ${a}${u}
`;
    }
    function r(o) {
      t += `
${o}
`;
      for (let a = 0; a < o.length; a++)
        t += "-";
      t += `
`;
    }
    function i(o, a, u = 1) {
      t += `${o} (min/avg/last sec/max [total]): `, t += `${(a.min * u).toFixed(2)} / `, t += `${(a.average * u).toFixed(2)} / `, t += `${(a.lastSecAverage * u).toFixed(2)} / `, t += `${(a.max * u).toFixed(2)} `, t += `[${(a.total * u).toFixed(2)}] ms
`;
    }
    return r("Graph"), n("Num Nodes", this.numNodes), n("Num Edges", this.numEdges), n("Total Updates", this.totalUpdates), n("Mesh Cache Hits", this.meshCacheHits), n("Mesh Cache Misses", this.meshCacheMisses), n("Number of Node Updates", this.nodeUpdate.count), n("Number of Edge Updates", this.edgeUpdate.count), n("Number of ArrowCap Updates", this.arrowCapUpdate.count), r("Graph Engine Performance"), i("JSON Load Time", this.loadTime), i("Graph Physics Engine Time", this.graphStep), i("Node Update Time", this.nodeUpdate), i("Edge Update Time", this.edgeUpdate), i("Arrow Cap Update Time", this.arrowCapUpdate), i("Ray Intersect Calculation Time", this.intersectCalc), r("BabylonJS Performance"), n("Draw Calls", this.sceneInstrumentation.drawCallsCounter.count), i("GPU Time", this.babylonInstrumentation.gpuFrameTimeCounter, 1e-6), i("Shader Time", this.babylonInstrumentation.shaderCompilationTimeCounter), i("Mesh Evaluation Time", this.sceneInstrumentation.activeMeshesEvaluationTimeCounter), i("Render Targets Time", this.sceneInstrumentation.renderTargetsRenderTimeCounter), i("Draw Calls Time", this.sceneInstrumentation.drawCallsCounter), i("Frame Time", this.sceneInstrumentation.frameTimeCounter), i("Render Time", this.sceneInstrumentation.renderTimeCounter), i("Time Between Frames", this.sceneInstrumentation.interFrameTimeCounter), i("Camera Render Time", this.sceneInstrumentation.cameraRenderTimeCounter), t;
  }
  step() {
    this.totalUpdates++;
  }
  reset() {
    this.totalUpdates = 0;
  }
  get numNodes() {
    return Pt.list.size;
  }
  get numEdges() {
    return Se.list.size;
  }
  get meshCacheHits() {
    return this.graph.meshCache.hits;
  }
  get meshCacheMisses() {
    return this.graph.meshCache.misses;
  }
}
class ad {
  constructor(t, n) {
    Z(this, "config");
    Z(this, "stats");
    // babylon
    Z(this, "element");
    Z(this, "canvas");
    Z(this, "engine");
    Z(this, "scene");
    Z(this, "camera");
    Z(this, "skybox");
    Z(this, "xrHelper");
    Z(this, "meshCache");
    // graph engine
    Z(this, "graphEngineType");
    Z(this, "graphEngine");
    Z(this, "running", !0);
    Z(this, "pinOnDrag");
    // graph
    Z(this, "fetchNodes");
    Z(this, "fetchEdges");
    // observeables
    Z(this, "graphObservable", new Ln());
    Z(this, "nodeObservable", new Ln());
    Z(this, "edgeObservable", new Ln());
    if (this.config = Gh(n), this.meshCache = new uf(), this.config.behavior.fetchNodes && (this.fetchNodes = this.config.behavior.fetchNodes), this.config.behavior.fetchEdges && (this.fetchEdges = this.config.behavior.fetchEdges), typeof t == "string") {
      const r = document.getElementById(t);
      if (!r)
        throw new Error(`getElementById() could not find element '${t}'`);
      this.element = r;
    } else if (t instanceof HTMLElement)
      this.element = t;
    else
      throw new TypeError("Graph constructor requires 'element' argument that is either a string specifying the ID of the HTML element or an HTMLElement");
    if (this.element.innerHTML = "", this.canvas = document.createElement("canvas"), this.canvas.setAttribute("id", "babylonForceGraphRenderCanvas"), this.canvas.setAttribute("touch-action", "none"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.touchAction = "none", this.element.appendChild(this.canvas), this.engine = new Gn(this.canvas, !0), this.scene = new Ia(this.engine), this.camera = new Ca(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      this.config.style.startingCameraDistance,
      new Je(0, 0, 0)
    ), delete this.camera.lowerBetaLimit, delete this.camera.upperBetaLimit, this.camera.attachControl(this.canvas, !0), new Sa("light", new Je(1, 1, 0)), this.config.style.skybox && this.config.style.skybox.length && new Oa(
      "testdome",
      this.config.style.skybox,
      {
        resolution: 32,
        size: 1e3
      },
      this.scene
    ), this.config.engine.type === "ngraph")
      this.graphEngine = new Jf();
    else if (this.config.engine.type === "d3")
      this.graphEngine = new sf();
    else
      throw new TypeError(`Unknown graph engine type: '${this.graphEngineType}'`);
    this.stats = new Qf(this);
    for (let r = 0; r < this.config.engine.preSteps; r++)
      this.graphEngine.step();
  }
  async init() {
    this.engine.runRenderLoop(() => {
      this.update(), this.scene.render();
    }), Yf();
    const t = [
      wi("VR", "immersive-vr", "local-floor"),
      wi("AR", "immersive-ar", "local-floor")
    ];
    if (navigator.xr) {
      this.xrHelper = await this.scene.createDefaultXRExperienceAsync({
        uiOptions: {
          customButtons: t
        },
        disableTeleportation: !0
        // optionalFeatures: true,
        // outputCanvasOptions: {
        //     canvasOptions: {
        //         framebufferScaleFactor: 0.5,
        //     },
        // },
      }), this.xrHelper.baseExperience.onInitialXRPoseSetObservable.add((r) => {
        var i;
        ((i = this.xrHelper) == null ? void 0 : i.baseExperience.sessionManager.sessionMode) === "immersive-ar" && r.setTransformationFromNonVRCamera(this.camera);
      });
      const n = document.querySelector(".xr-button-overlay");
      n && (n.style.cssText = "z-index:11;position: absolute; right: 20px;bottom: 50px;");
    } else {
      const n = Xf(this), r = document.createElement("button");
      r.classList.add("webxr-button"), r.classList.add("webxr-not-available"), r.innerHTML = "VR / AR NOT AVAILABLE", n.appendChild(r), setTimeout(() => {
        n.remove();
      }, 5e3);
    }
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }
  update() {
    if (this.running) {
      this.stats.step(), this.stats.graphStep.beginMonitoring();
      for (let t = 0; t < this.config.engine.stepMultiplier; t++)
        this.graphEngine.step();
      this.stats.graphStep.endMonitoring(), this.stats.nodeUpdate.beginMonitoring();
      for (const t of this.graphEngine.nodes)
        t.update();
      this.stats.nodeUpdate.endMonitoring(), this.stats.edgeUpdate.beginMonitoring(), Se.updateRays(this);
      for (const t of this.graphEngine.edges)
        t.update();
      this.stats.edgeUpdate.endMonitoring(), this.graphEngine.isSettled && (this.graphObservable.notifyObservers({ type: "graph-settled", graph: this }), this.running = !1);
    }
  }
  addNode(t, n = {}) {
    return this.nodeObservable.notifyObservers({ type: "node-add-before", nodeId: t, metadata: n }), Pt.create(this, t, {
      nodeMeshConfig: this.config.style.node,
      pinOnDrag: this.pinOnDrag,
      metadata: n
    });
  }
  addEdge(t, n, r = {}) {
    return this.edgeObservable.notifyObservers({ type: "edge-add-before", srcNodeId: t, dstNodeId: n, metadata: r }), Se.create(this, t, n, {
      edgeMeshConfig: this.config.style.edge,
      metadata: r
    });
  }
  addListener(t, n) {
    switch (t) {
      case "graph-settled":
        this.graphObservable.add((r) => {
          r.type === t && n(r);
        });
        break;
      case "node-add-before":
        this.nodeObservable.add((r) => {
          r.type === t && n(r);
        });
        break;
      case "edge-add-before":
        this.edgeObservable.add((r) => {
          r.type === t && n(r);
        });
        break;
      default:
        throw new TypeError(`Unknown listener type in addListener: ${t}`);
    }
  }
  async loadJsonData(t, n) {
    this.stats.loadTime.beginMonitoring();
    const { nodeListProp: r, edgeListProp: i, nodeIdProp: o, edgeSrcIdProp: a, edgeDstIdProp: u, fetchOpts: s } = Uh(n), d = await (await fetch(t, s)).json();
    if (!Array.isArray(d[r]))
      throw TypeError(`when fetching JSON data: '${r}' was not an Array`);
    if (!Array.isArray(d[i]))
      throw TypeError(`when fetching JSON data: '${i}' was not an Array`);
    for (const p of d[r]) {
      const y = p[o], w = p;
      this.addNode(y, w);
    }
    for (const p of d[i]) {
      const y = p[a], w = p[u], m = p;
      this.addEdge(y, w, m);
    }
    this.stats.loadTime.endMonitoring();
  }
}
function wi(e, t, n) {
  t = t || "immersive-vr", n = n || "local-floor";
  const r = document.createElement("button");
  r.classList.add("webxr-button"), r.classList.add("webxr-available"), r.innerHTML = e;
  const i = new Pa(r, t, n);
  return i.update = function(o) {
    o === null ? (r.style.display = "", r.classList.remove("webxr-presenting")) : o === i ? (r.style.display = "", r.classList.add("webxr-presenting")) : r.style.display = "none";
  }, i;
}
function Yf() {
  const e = `
    .webxr-button {
        font-family: 'Verdana', sans-serif;
        font-size: 1em;
        font-weight: bold;
        color: white;
        border: 2px solid white;
        padding: 4px 16px 4px 16px;
        margin-left: 10px;
        border-radius: 8px;
    }

    .webxr-available {
        background: black;
        box-shadow:0 0 0 0px white, 0 0 0 2px black;
    }

    .webxr-presenting {
        background: red;
    }

    .webxr-presenting::before {
        content: "EXIT ";
    }

    .webxr-not-available {
        background: grey;
        box-shadow:0 0 0 0px white, 0 0 0 2px grey;
    }

    .webxr-available:hover {
        transform: scale(1.05);
    } 

    .webxr-available:active {
        background-color: rgba(51,51,51,1);
    } 
    
    .webxr-available:focus {
        background-color: rgba(51,51,51,1);
    }
    
    canvas {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        outline: none;
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
    }`, t = document.createElement("style");
  t.appendChild(document.createTextNode(e)), document.getElementsByTagName("head")[0].appendChild(t);
}
function Xf(e) {
  const t = document.createElement("div");
  t.classList.add("xr-button-overlay"), t.style.cssText = "z-index:11;position: absolute; right: 20px;bottom: 50px;";
  const n = e.scene.getEngine().getInputElement();
  return n && n.parentNode && n.parentNode.appendChild(t), t;
}
class ed extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "<p>Placeholder: Graphty goes here.</p>";
  }
  /**
   * This is my thing description
   * @default false
   */
  get thing() {
    return !0;
  }
  set thing(t) {
  }
}
window.customElements.define("graphty-core", ed);
var vn = { exports: {} };
vn.exports;
(function(e, t) {
  var n = 200, r = "__lodash_hash_undefined__", i = 800, o = 16, a = 9007199254740991, u = "[object Arguments]", s = "[object Array]", h = "[object AsyncFunction]", d = "[object Boolean]", p = "[object Date]", y = "[object Error]", w = "[object Function]", m = "[object GeneratorFunction]", E = "[object Map]", k = "[object Number]", _ = "[object Null]", N = "[object Object]", $ = "[object Proxy]", T = "[object RegExp]", M = "[object Set]", S = "[object String]", B = "[object Undefined]", D = "[object WeakMap]", Q = "[object ArrayBuffer]", ee = "[object DataView]", te = "[object Float32Array]", W = "[object Float64Array]", be = "[object Int8Array]", O = "[object Int16Array]", C = "[object Int32Array]", A = "[object Uint8Array]", re = "[object Uint8ClampedArray]", me = "[object Uint16Array]", we = "[object Uint32Array]", F = /[\\^$.*+?()[\]{}|]/g, R = /^\[object .+?Constructor\]$/, V = /^(?:0|[1-9]\d*)$/, U = {};
  U[te] = U[W] = U[be] = U[O] = U[C] = U[A] = U[re] = U[me] = U[we] = !0, U[u] = U[s] = U[Q] = U[d] = U[ee] = U[p] = U[y] = U[w] = U[E] = U[k] = U[N] = U[T] = U[M] = U[S] = U[D] = !1;
  var ue = typeof sn == "object" && sn && sn.Object === Object && sn, se = typeof self == "object" && self && self.Object === Object && self, de = ue || se || Function("return this")(), He = t && !t.nodeType && t, Ae = He && !0 && e && !e.nodeType && e, je = Ae && Ae.exports === He, Re = je && ue.process, at = function() {
    try {
      var l = Ae && Ae.require && Ae.require("util").types;
      return l || Re && Re.binding && Re.binding("util");
    } catch {
    }
  }(), vt = at && at.isTypedArray;
  function Dt(l, v, b) {
    switch (b.length) {
      case 0:
        return l.call(v);
      case 1:
        return l.call(v, b[0]);
      case 2:
        return l.call(v, b[0], b[1]);
      case 3:
        return l.call(v, b[0], b[1], b[2]);
    }
    return l.apply(v, b);
  }
  function kn(l, v) {
    for (var b = -1, j = Array(l); ++b < l; )
      j[b] = v(b);
    return j;
  }
  function En(l) {
    return function(v) {
      return l(v);
    };
  }
  function Ut(l, v) {
    return l == null ? void 0 : l[v];
  }
  function Nn(l, v) {
    return function(b) {
      return l(v(b));
    };
  }
  var _t = Array.prototype, H = Function.prototype, Ke = Object.prototype, st = de["__core-js_shared__"], tt = H.toString, Fe = Ke.hasOwnProperty, qt = function() {
    var l = /[^.]+$/.exec(st && st.keys && st.keys.IE_PROTO || "");
    return l ? "Symbol(src)_1." + l : "";
  }(), Gt = Ke.toString, c = tt.call(Object), f = RegExp(
    "^" + tt.call(Fe).replace(F, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), g = je ? de.Buffer : void 0, x = de.Symbol, I = de.Uint8Array, L = g ? g.allocUnsafe : void 0, K = Nn(Object.getPrototypeOf, Object), J = Object.create, ye = Ke.propertyIsEnumerable, Ze = _t.splice, oe = x ? x.toStringTag : void 0, G = function() {
    try {
      var l = Mn(Object, "defineProperty");
      return l({}, "", {}), l;
    } catch {
    }
  }(), Le = g ? g.isBuffer : void 0, Ht = Math.max, mt = Date.now, yt = Mn(de, "Map"), Ve = Mn(Object, "create"), bt = /* @__PURE__ */ function() {
    function l() {
    }
    return function(v) {
      if (!De(v))
        return {};
      if (J)
        return J(v);
      l.prototype = v;
      var b = new l();
      return l.prototype = void 0, b;
    };
  }();
  function _e(l) {
    var v = -1, b = l == null ? 0 : l.length;
    for (this.clear(); ++v < b; ) {
      var j = l[v];
      this.set(j[0], j[1]);
    }
  }
  function Kt() {
    this.__data__ = Ve ? Ve(null) : {}, this.size = 0;
  }
  function wt(l) {
    var v = this.has(l) && delete this.__data__[l];
    return this.size -= v ? 1 : 0, v;
  }
  function Vt(l) {
    var v = this.__data__;
    if (Ve) {
      var b = v[l];
      return b === r ? void 0 : b;
    }
    return Fe.call(v, l) ? v[l] : void 0;
  }
  function xt(l) {
    var v = this.__data__;
    return Ve ? v[l] !== void 0 : Fe.call(v, l);
  }
  function kt(l, v) {
    var b = this.__data__;
    return this.size += this.has(l) ? 0 : 1, b[l] = Ve && v === void 0 ? r : v, this;
  }
  _e.prototype.clear = Kt, _e.prototype.delete = wt, _e.prototype.get = Vt, _e.prototype.has = xt, _e.prototype.set = kt;
  function Ne(l) {
    var v = -1, b = l == null ? 0 : l.length;
    for (this.clear(); ++v < b; ) {
      var j = l[v];
      this.set(j[0], j[1]);
    }
  }
  function Et() {
    this.__data__ = [], this.size = 0;
  }
  function Wt(l) {
    var v = this.__data__, b = Qt(v, l);
    if (b < 0)
      return !1;
    var j = v.length - 1;
    return b == j ? v.pop() : Ze.call(v, b, 1), --this.size, !0;
  }
  function Jt(l) {
    var v = this.__data__, b = Qt(v, l);
    return b < 0 ? void 0 : v[b][1];
  }
  function To(l) {
    return Qt(this.__data__, l) > -1;
  }
  function Mo(l, v) {
    var b = this.__data__, j = Qt(b, l);
    return j < 0 ? (++this.size, b.push([l, v])) : b[j][1] = v, this;
  }
  Ne.prototype.clear = Et, Ne.prototype.delete = Wt, Ne.prototype.get = Jt, Ne.prototype.has = To, Ne.prototype.set = Mo;
  function ut(l) {
    var v = -1, b = l == null ? 0 : l.length;
    for (this.clear(); ++v < b; ) {
      var j = l[v];
      this.set(j[0], j[1]);
    }
  }
  function Io() {
    this.size = 0, this.__data__ = {
      hash: new _e(),
      map: new (yt || Ne)(),
      string: new _e()
    };
  }
  function Co(l) {
    var v = Xt(this, l).delete(l);
    return this.size -= v ? 1 : 0, v;
  }
  function So(l) {
    return Xt(this, l).get(l);
  }
  function Oo(l) {
    return Xt(this, l).has(l);
  }
  function Po(l, v) {
    var b = Xt(this, l), j = b.size;
    return b.set(l, v), this.size += b.size == j ? 0 : 1, this;
  }
  ut.prototype.clear = Io, ut.prototype.delete = Co, ut.prototype.get = So, ut.prototype.has = Oo, ut.prototype.set = Po;
  function ct(l) {
    var v = this.__data__ = new Ne(l);
    this.size = v.size;
  }
  function Ao() {
    this.__data__ = new Ne(), this.size = 0;
  }
  function Fo(l) {
    var v = this.__data__, b = v.delete(l);
    return this.size = v.size, b;
  }
  function Zo(l) {
    return this.__data__.get(l);
  }
  function Lo(l) {
    return this.__data__.has(l);
  }
  function jo(l, v) {
    var b = this.__data__;
    if (b instanceof Ne) {
      var j = b.__data__;
      if (!yt || j.length < n - 1)
        return j.push([l, v]), this.size = ++b.size, this;
      b = this.__data__ = new ut(j);
    }
    return b.set(l, v), this.size = b.size, this;
  }
  ct.prototype.clear = Ao, ct.prototype.delete = Fo, ct.prototype.get = Zo, ct.prototype.has = Lo, ct.prototype.set = jo;
  function Bo(l, v) {
    var b = Sn(l), j = !b && Cn(l), Y = !b && !j && xr(l), ne = !b && !j && !Y && Er(l), ce = b || j || Y || ne, X = ce ? kn(l.length, String) : [], he = X.length;
    for (var Ie in l)
      (v || Fe.call(l, Ie)) && !(ce && // Safari 9 has enumerable `arguments.length` in strict mode.
      (Ie == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Y && (Ie == "offset" || Ie == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      ne && (Ie == "buffer" || Ie == "byteLength" || Ie == "byteOffset") || // Skip index properties.
      br(Ie, he))) && X.push(Ie);
    return X;
  }
  function $n(l, v, b) {
    (b !== void 0 && !en(l[v], b) || b === void 0 && !(v in l)) && zn(l, v, b);
  }
  function Ro(l, v, b) {
    var j = l[v];
    (!(Fe.call(l, v) && en(j, b)) || b === void 0 && !(v in l)) && zn(l, v, b);
  }
  function Qt(l, v) {
    for (var b = l.length; b--; )
      if (en(l[b][0], v))
        return b;
    return -1;
  }
  function zn(l, v, b) {
    v == "__proto__" && G ? G(l, v, {
      configurable: !0,
      enumerable: !0,
      value: b,
      writable: !0
    }) : l[v] = b;
  }
  var Do = ea();
  function Yt(l) {
    return l == null ? l === void 0 ? B : _ : oe && oe in Object(l) ? ta(l) : sa(l);
  }
  function _r(l) {
    return Nt(l) && Yt(l) == u;
  }
  function Uo(l) {
    if (!De(l) || oa(l))
      return !1;
    var v = Pn(l) ? f : R;
    return v.test(la(l));
  }
  function qo(l) {
    return Nt(l) && kr(l.length) && !!U[Yt(l)];
  }
  function Go(l) {
    if (!De(l))
      return aa(l);
    var v = wr(l), b = [];
    for (var j in l)
      j == "constructor" && (v || !Fe.call(l, j)) || b.push(j);
    return b;
  }
  function Tn(l, v, b, j, Y) {
    l !== v && Do(v, function(ne, ce) {
      if (Y || (Y = new ct()), De(ne))
        Ho(l, v, ce, b, Tn, j, Y);
      else {
        var X = j ? j(In(l, ce), ne, ce + "", l, v, Y) : void 0;
        X === void 0 && (X = ne), $n(l, ce, X);
      }
    }, Nr);
  }
  function Ho(l, v, b, j, Y, ne, ce) {
    var X = In(l, b), he = In(v, b), Ie = ce.get(he);
    if (Ie) {
      $n(l, b, Ie);
      return;
    }
    var Me = ne ? ne(X, he, b + "", l, v, ce) : void 0, $t = Me === void 0;
    if ($t) {
      var An = Sn(he), Fn = !An && xr(he), zr = !An && !Fn && Er(he);
      Me = he, An || Fn || zr ? Sn(X) ? Me = X : fa(X) ? Me = Qo(X) : Fn ? ($t = !1, Me = Vo(he, !0)) : zr ? ($t = !1, Me = Jo(he, !0)) : Me = [] : da(he) || Cn(he) ? (Me = X, Cn(X) ? Me = pa(X) : (!De(X) || Pn(X)) && (Me = na(he))) : $t = !1;
    }
    $t && (ce.set(he, Me), Y(Me, he, j, ne, ce), ce.delete(he)), $n(l, b, Me);
  }
  function mr(l, v) {
    return ca(ua(l, v, $r), l + "");
  }
  var Ko = G ? function(l, v) {
    return G(l, "toString", {
      configurable: !0,
      enumerable: !1,
      value: _a(v),
      writable: !0
    });
  } : $r;
  function Vo(l, v) {
    if (v)
      return l.slice();
    var b = l.length, j = L ? L(b) : new l.constructor(b);
    return l.copy(j), j;
  }
  function Wo(l) {
    var v = new l.constructor(l.byteLength);
    return new I(v).set(new I(l)), v;
  }
  function Jo(l, v) {
    var b = v ? Wo(l.buffer) : l.buffer;
    return new l.constructor(b, l.byteOffset, l.length);
  }
  function Qo(l, v) {
    var b = -1, j = l.length;
    for (v || (v = Array(j)); ++b < j; )
      v[b] = l[b];
    return v;
  }
  function Yo(l, v, b, j) {
    var Y = !b;
    b || (b = {});
    for (var ne = -1, ce = v.length; ++ne < ce; ) {
      var X = v[ne], he = j ? j(b[X], l[X], X, b, l) : void 0;
      he === void 0 && (he = l[X]), Y ? zn(b, X, he) : Ro(b, X, he);
    }
    return b;
  }
  function Xo(l) {
    return mr(function(v, b) {
      var j = -1, Y = b.length, ne = Y > 1 ? b[Y - 1] : void 0, ce = Y > 2 ? b[2] : void 0;
      for (ne = l.length > 3 && typeof ne == "function" ? (Y--, ne) : void 0, ce && ra(b[0], b[1], ce) && (ne = Y < 3 ? void 0 : ne, Y = 1), v = Object(v); ++j < Y; ) {
        var X = b[j];
        X && l(v, X, j, ne);
      }
      return v;
    });
  }
  function ea(l) {
    return function(v, b, j) {
      for (var Y = -1, ne = Object(v), ce = j(v), X = ce.length; X--; ) {
        var he = ce[l ? X : ++Y];
        if (b(ne[he], he, ne) === !1)
          break;
      }
      return v;
    };
  }
  function yr(l, v, b, j, Y, ne) {
    return De(l) && De(v) && (ne.set(v, l), Tn(l, v, void 0, yr, ne), ne.delete(v)), l;
  }
  function Xt(l, v) {
    var b = l.__data__;
    return ia(v) ? b[typeof v == "string" ? "string" : "hash"] : b.map;
  }
  function Mn(l, v) {
    var b = Ut(l, v);
    return Uo(b) ? b : void 0;
  }
  function ta(l) {
    var v = Fe.call(l, oe), b = l[oe];
    try {
      l[oe] = void 0;
      var j = !0;
    } catch {
    }
    var Y = Gt.call(l);
    return j && (v ? l[oe] = b : delete l[oe]), Y;
  }
  function na(l) {
    return typeof l.constructor == "function" && !wr(l) ? bt(K(l)) : {};
  }
  function br(l, v) {
    var b = typeof l;
    return v = v ?? a, !!v && (b == "number" || b != "symbol" && V.test(l)) && l > -1 && l % 1 == 0 && l < v;
  }
  function ra(l, v, b) {
    if (!De(b))
      return !1;
    var j = typeof v;
    return (j == "number" ? On(b) && br(v, b.length) : j == "string" && v in b) ? en(b[v], l) : !1;
  }
  function ia(l) {
    var v = typeof l;
    return v == "string" || v == "number" || v == "symbol" || v == "boolean" ? l !== "__proto__" : l === null;
  }
  function oa(l) {
    return !!qt && qt in l;
  }
  function wr(l) {
    var v = l && l.constructor, b = typeof v == "function" && v.prototype || Ke;
    return l === b;
  }
  function aa(l) {
    var v = [];
    if (l != null)
      for (var b in Object(l))
        v.push(b);
    return v;
  }
  function sa(l) {
    return Gt.call(l);
  }
  function ua(l, v, b) {
    return v = Ht(v === void 0 ? l.length - 1 : v, 0), function() {
      for (var j = arguments, Y = -1, ne = Ht(j.length - v, 0), ce = Array(ne); ++Y < ne; )
        ce[Y] = j[v + Y];
      Y = -1;
      for (var X = Array(v + 1); ++Y < v; )
        X[Y] = j[Y];
      return X[v] = b(ce), Dt(l, this, X);
    };
  }
  function In(l, v) {
    if (!(v === "constructor" && typeof l[v] == "function") && v != "__proto__")
      return l[v];
  }
  var ca = ha(Ko);
  function ha(l) {
    var v = 0, b = 0;
    return function() {
      var j = mt(), Y = o - (j - b);
      if (b = j, Y > 0) {
        if (++v >= i)
          return arguments[0];
      } else
        v = 0;
      return l.apply(void 0, arguments);
    };
  }
  function la(l) {
    if (l != null) {
      try {
        return tt.call(l);
      } catch {
      }
      try {
        return l + "";
      } catch {
      }
    }
    return "";
  }
  function en(l, v) {
    return l === v || l !== l && v !== v;
  }
  var Cn = _r(/* @__PURE__ */ function() {
    return arguments;
  }()) ? _r : function(l) {
    return Nt(l) && Fe.call(l, "callee") && !ye.call(l, "callee");
  }, Sn = Array.isArray;
  function On(l) {
    return l != null && kr(l.length) && !Pn(l);
  }
  function fa(l) {
    return Nt(l) && On(l);
  }
  var xr = Le || ma;
  function Pn(l) {
    if (!De(l))
      return !1;
    var v = Yt(l);
    return v == w || v == m || v == h || v == $;
  }
  function kr(l) {
    return typeof l == "number" && l > -1 && l % 1 == 0 && l <= a;
  }
  function De(l) {
    var v = typeof l;
    return l != null && (v == "object" || v == "function");
  }
  function Nt(l) {
    return l != null && typeof l == "object";
  }
  function da(l) {
    if (!Nt(l) || Yt(l) != N)
      return !1;
    var v = K(l);
    if (v === null)
      return !0;
    var b = Fe.call(v, "constructor") && v.constructor;
    return typeof b == "function" && b instanceof b && tt.call(b) == c;
  }
  var Er = vt ? En(vt) : qo;
  function pa(l) {
    return Yo(l, Nr(l));
  }
  var ga = mr(function(l) {
    return l.push(void 0, yr), Dt(va, void 0, l);
  });
  function Nr(l) {
    return On(l) ? Bo(l, !0) : Go(l);
  }
  var va = Xo(function(l, v, b, j) {
    Tn(l, v, b, j);
  });
  function _a(l) {
    return function() {
      return l;
    };
  }
  function $r(l) {
    return l;
  }
  function ma() {
    return !1;
  }
  e.exports = ga;
})(vn, vn.exports);
var td = vn.exports;
const nd = /* @__PURE__ */ xn(td);
var No = {};
(function(e) {
  (function(t) {
    function n(c) {
      return c !== null ? Object.prototype.toString.call(c) === "[object Array]" : !1;
    }
    function r(c) {
      return c !== null ? Object.prototype.toString.call(c) === "[object Object]" : !1;
    }
    function i(c, f) {
      if (c === f)
        return !0;
      var g = Object.prototype.toString.call(c);
      if (g !== Object.prototype.toString.call(f))
        return !1;
      if (n(c) === !0) {
        if (c.length !== f.length)
          return !1;
        for (var x = 0; x < c.length; x++)
          if (i(c[x], f[x]) === !1)
            return !1;
        return !0;
      }
      if (r(c) === !0) {
        var I = {};
        for (var L in c)
          if (hasOwnProperty.call(c, L)) {
            if (i(c[L], f[L]) === !1)
              return !1;
            I[L] = !0;
          }
        for (var K in f)
          if (hasOwnProperty.call(f, K) && I[K] !== !0)
            return !1;
        return !0;
      }
      return !1;
    }
    function o(c) {
      if (c === "" || c === !1 || c === null)
        return !0;
      if (n(c) && c.length === 0)
        return !0;
      if (r(c)) {
        for (var f in c)
          if (c.hasOwnProperty(f))
            return !1;
        return !0;
      } else
        return !1;
    }
    function a(c) {
      for (var f = Object.keys(c), g = [], x = 0; x < f.length; x++)
        g.push(c[f[x]]);
      return g;
    }
    var u;
    typeof String.prototype.trimLeft == "function" ? u = function(c) {
      return c.trimLeft();
    } : u = function(c) {
      return c.match(/^\s*(.*)/)[1];
    };
    var s = 0, h = 1, d = 2, p = 3, y = 4, w = 5, m = 6, E = 7, k = 8, _ = 9, N = {
      0: "number",
      1: "any",
      2: "string",
      3: "array",
      4: "object",
      5: "boolean",
      6: "expression",
      7: "null",
      8: "Array<number>",
      9: "Array<string>"
    }, $ = "EOF", T = "UnquotedIdentifier", M = "QuotedIdentifier", S = "Rbracket", B = "Rparen", D = "Comma", Q = "Colon", ee = "Rbrace", te = "Number", W = "Current", be = "Expref", O = "Pipe", C = "Or", A = "And", re = "EQ", me = "GT", we = "LT", F = "GTE", R = "LTE", V = "NE", U = "Flatten", ue = "Star", se = "Filter", de = "Dot", He = "Not", Ae = "Lbrace", je = "Lbracket", Re = "Lparen", at = "Literal", vt = {
      ".": de,
      "*": ue,
      ",": D,
      ":": Q,
      "{": Ae,
      "}": ee,
      "]": S,
      "(": Re,
      ")": B,
      "@": W
    }, Dt = {
      "<": !0,
      ">": !0,
      "=": !0,
      "!": !0
    }, kn = {
      " ": !0,
      "	": !0,
      "\n": !0
    };
    function En(c) {
      return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
    }
    function Ut(c) {
      return c >= "0" && c <= "9" || c === "-";
    }
    function Nn(c) {
      return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "_";
    }
    function _t() {
    }
    _t.prototype = {
      tokenize: function(c) {
        var f = [];
        this._current = 0;
        for (var g, x, I; this._current < c.length; )
          if (En(c[this._current]))
            g = this._current, x = this._consumeUnquotedIdentifier(c), f.push({
              type: T,
              value: x,
              start: g
            });
          else if (vt[c[this._current]] !== void 0)
            f.push({
              type: vt[c[this._current]],
              value: c[this._current],
              start: this._current
            }), this._current++;
          else if (Ut(c[this._current]))
            I = this._consumeNumber(c), f.push(I);
          else if (c[this._current] === "[")
            I = this._consumeLBracket(c), f.push(I);
          else if (c[this._current] === '"')
            g = this._current, x = this._consumeQuotedIdentifier(c), f.push({
              type: M,
              value: x,
              start: g
            });
          else if (c[this._current] === "'")
            g = this._current, x = this._consumeRawStringLiteral(c), f.push({
              type: at,
              value: x,
              start: g
            });
          else if (c[this._current] === "`") {
            g = this._current;
            var L = this._consumeLiteral(c);
            f.push({
              type: at,
              value: L,
              start: g
            });
          } else if (Dt[c[this._current]] !== void 0)
            f.push(this._consumeOperator(c));
          else if (kn[c[this._current]] !== void 0)
            this._current++;
          else if (c[this._current] === "&")
            g = this._current, this._current++, c[this._current] === "&" ? (this._current++, f.push({ type: A, value: "&&", start: g })) : f.push({ type: be, value: "&", start: g });
          else if (c[this._current] === "|")
            g = this._current, this._current++, c[this._current] === "|" ? (this._current++, f.push({ type: C, value: "||", start: g })) : f.push({ type: O, value: "|", start: g });
          else {
            var K = new Error("Unknown character:" + c[this._current]);
            throw K.name = "LexerError", K;
          }
        return f;
      },
      _consumeUnquotedIdentifier: function(c) {
        var f = this._current;
        for (this._current++; this._current < c.length && Nn(c[this._current]); )
          this._current++;
        return c.slice(f, this._current);
      },
      _consumeQuotedIdentifier: function(c) {
        var f = this._current;
        this._current++;
        for (var g = c.length; c[this._current] !== '"' && this._current < g; ) {
          var x = this._current;
          c[x] === "\\" && (c[x + 1] === "\\" || c[x + 1] === '"') ? x += 2 : x++, this._current = x;
        }
        return this._current++, JSON.parse(c.slice(f, this._current));
      },
      _consumeRawStringLiteral: function(c) {
        var f = this._current;
        this._current++;
        for (var g = c.length; c[this._current] !== "'" && this._current < g; ) {
          var x = this._current;
          c[x] === "\\" && (c[x + 1] === "\\" || c[x + 1] === "'") ? x += 2 : x++, this._current = x;
        }
        this._current++;
        var I = c.slice(f + 1, this._current - 1);
        return I.replace("\\'", "'");
      },
      _consumeNumber: function(c) {
        var f = this._current;
        this._current++;
        for (var g = c.length; Ut(c[this._current]) && this._current < g; )
          this._current++;
        var x = parseInt(c.slice(f, this._current));
        return { type: te, value: x, start: f };
      },
      _consumeLBracket: function(c) {
        var f = this._current;
        return this._current++, c[this._current] === "?" ? (this._current++, { type: se, value: "[?", start: f }) : c[this._current] === "]" ? (this._current++, { type: U, value: "[]", start: f }) : { type: je, value: "[", start: f };
      },
      _consumeOperator: function(c) {
        var f = this._current, g = c[f];
        if (this._current++, g === "!")
          return c[this._current] === "=" ? (this._current++, { type: V, value: "!=", start: f }) : { type: He, value: "!", start: f };
        if (g === "<")
          return c[this._current] === "=" ? (this._current++, { type: R, value: "<=", start: f }) : { type: we, value: "<", start: f };
        if (g === ">")
          return c[this._current] === "=" ? (this._current++, { type: F, value: ">=", start: f }) : { type: me, value: ">", start: f };
        if (g === "=" && c[this._current] === "=")
          return this._current++, { type: re, value: "==", start: f };
      },
      _consumeLiteral: function(c) {
        this._current++;
        for (var f = this._current, g = c.length, x; c[this._current] !== "`" && this._current < g; ) {
          var I = this._current;
          c[I] === "\\" && (c[I + 1] === "\\" || c[I + 1] === "`") ? I += 2 : I++, this._current = I;
        }
        var L = u(c.slice(f, this._current));
        return L = L.replace("\\`", "`"), this._looksLikeJSON(L) ? x = JSON.parse(L) : x = JSON.parse('"' + L + '"'), this._current++, x;
      },
      _looksLikeJSON: function(c) {
        var f = '[{"', g = ["true", "false", "null"], x = "-0123456789";
        if (c === "")
          return !1;
        if (f.indexOf(c[0]) >= 0)
          return !0;
        if (g.indexOf(c) >= 0)
          return !0;
        if (x.indexOf(c[0]) >= 0)
          try {
            return JSON.parse(c), !0;
          } catch {
            return !1;
          }
        else
          return !1;
      }
    };
    var H = {};
    H[$] = 0, H[T] = 0, H[M] = 0, H[S] = 0, H[B] = 0, H[D] = 0, H[ee] = 0, H[te] = 0, H[W] = 0, H[be] = 0, H[O] = 1, H[C] = 2, H[A] = 3, H[re] = 5, H[me] = 5, H[we] = 5, H[F] = 5, H[R] = 5, H[V] = 5, H[U] = 9, H[ue] = 20, H[se] = 21, H[de] = 40, H[He] = 45, H[Ae] = 50, H[je] = 55, H[Re] = 60;
    function Ke() {
    }
    Ke.prototype = {
      parse: function(c) {
        this._loadTokens(c), this.index = 0;
        var f = this.expression(0);
        if (this._lookahead(0) !== $) {
          var g = this._lookaheadToken(0), x = new Error(
            "Unexpected token type: " + g.type + ", value: " + g.value
          );
          throw x.name = "ParserError", x;
        }
        return f;
      },
      _loadTokens: function(c) {
        var f = new _t(), g = f.tokenize(c);
        g.push({ type: $, value: "", start: c.length }), this.tokens = g;
      },
      expression: function(c) {
        var f = this._lookaheadToken(0);
        this._advance();
        for (var g = this.nud(f), x = this._lookahead(0); c < H[x]; )
          this._advance(), g = this.led(x, g), x = this._lookahead(0);
        return g;
      },
      _lookahead: function(c) {
        return this.tokens[this.index + c].type;
      },
      _lookaheadToken: function(c) {
        return this.tokens[this.index + c];
      },
      _advance: function() {
        this.index++;
      },
      nud: function(c) {
        var f, g, x;
        switch (c.type) {
          case at:
            return { type: "Literal", value: c.value };
          case T:
            return { type: "Field", name: c.value };
          case M:
            var I = { type: "Field", name: c.value };
            if (this._lookahead(0) === Re)
              throw new Error("Quoted identifier not allowed for function names.");
            return I;
          case He:
            return g = this.expression(H.Not), { type: "NotExpression", children: [g] };
          case ue:
            return f = { type: "Identity" }, g = null, this._lookahead(0) === S ? g = { type: "Identity" } : g = this._parseProjectionRHS(H.Star), { type: "ValueProjection", children: [f, g] };
          case se:
            return this.led(c.type, { type: "Identity" });
          case Ae:
            return this._parseMultiselectHash();
          case U:
            return f = { type: U, children: [{ type: "Identity" }] }, g = this._parseProjectionRHS(H.Flatten), { type: "Projection", children: [f, g] };
          case je:
            return this._lookahead(0) === te || this._lookahead(0) === Q ? (g = this._parseIndexExpression(), this._projectIfSlice({ type: "Identity" }, g)) : this._lookahead(0) === ue && this._lookahead(1) === S ? (this._advance(), this._advance(), g = this._parseProjectionRHS(H.Star), {
              type: "Projection",
              children: [{ type: "Identity" }, g]
            }) : this._parseMultiselectList();
          case W:
            return { type: W };
          case be:
            return x = this.expression(H.Expref), { type: "ExpressionReference", children: [x] };
          case Re:
            for (var L = []; this._lookahead(0) !== B; )
              this._lookahead(0) === W ? (x = { type: W }, this._advance()) : x = this.expression(0), L.push(x);
            return this._match(B), L[0];
          default:
            this._errorToken(c);
        }
      },
      led: function(c, f) {
        var g;
        switch (c) {
          case de:
            var x = H.Dot;
            return this._lookahead(0) !== ue ? (g = this._parseDotRHS(x), { type: "Subexpression", children: [f, g] }) : (this._advance(), g = this._parseProjectionRHS(x), { type: "ValueProjection", children: [f, g] });
          case O:
            return g = this.expression(H.Pipe), { type: O, children: [f, g] };
          case C:
            return g = this.expression(H.Or), { type: "OrExpression", children: [f, g] };
          case A:
            return g = this.expression(H.And), { type: "AndExpression", children: [f, g] };
          case Re:
            for (var I = f.name, L = [], K, J; this._lookahead(0) !== B; )
              this._lookahead(0) === W ? (K = { type: W }, this._advance()) : K = this.expression(0), this._lookahead(0) === D && this._match(D), L.push(K);
            return this._match(B), J = { type: "Function", name: I, children: L }, J;
          case se:
            var ye = this.expression(0);
            return this._match(S), this._lookahead(0) === U ? g = { type: "Identity" } : g = this._parseProjectionRHS(H.Filter), { type: "FilterProjection", children: [f, g, ye] };
          case U:
            var Ze = { type: U, children: [f] }, oe = this._parseProjectionRHS(H.Flatten);
            return { type: "Projection", children: [Ze, oe] };
          case re:
          case V:
          case me:
          case F:
          case we:
          case R:
            return this._parseComparator(f, c);
          case je:
            var G = this._lookaheadToken(0);
            return G.type === te || G.type === Q ? (g = this._parseIndexExpression(), this._projectIfSlice(f, g)) : (this._match(ue), this._match(S), g = this._parseProjectionRHS(H.Star), { type: "Projection", children: [f, g] });
          default:
            this._errorToken(this._lookaheadToken(0));
        }
      },
      _match: function(c) {
        if (this._lookahead(0) === c)
          this._advance();
        else {
          var f = this._lookaheadToken(0), g = new Error("Expected " + c + ", got: " + f.type);
          throw g.name = "ParserError", g;
        }
      },
      _errorToken: function(c) {
        var f = new Error("Invalid token (" + c.type + '): "' + c.value + '"');
        throw f.name = "ParserError", f;
      },
      _parseIndexExpression: function() {
        if (this._lookahead(0) === Q || this._lookahead(1) === Q)
          return this._parseSliceExpression();
        var c = {
          type: "Index",
          value: this._lookaheadToken(0).value
        };
        return this._advance(), this._match(S), c;
      },
      _projectIfSlice: function(c, f) {
        var g = { type: "IndexExpression", children: [c, f] };
        return f.type === "Slice" ? {
          type: "Projection",
          children: [g, this._parseProjectionRHS(H.Star)]
        } : g;
      },
      _parseSliceExpression: function() {
        for (var c = [null, null, null], f = 0, g = this._lookahead(0); g !== S && f < 3; ) {
          if (g === Q)
            f++, this._advance();
          else if (g === te)
            c[f] = this._lookaheadToken(0).value, this._advance();
          else {
            var x = this._lookahead(0), I = new Error("Syntax error, unexpected token: " + x.value + "(" + x.type + ")");
            throw I.name = "Parsererror", I;
          }
          g = this._lookahead(0);
        }
        return this._match(S), {
          type: "Slice",
          children: c
        };
      },
      _parseComparator: function(c, f) {
        var g = this.expression(H[f]);
        return { type: "Comparator", name: f, children: [c, g] };
      },
      _parseDotRHS: function(c) {
        var f = this._lookahead(0), g = [T, M, ue];
        if (g.indexOf(f) >= 0)
          return this.expression(c);
        if (f === je)
          return this._match(je), this._parseMultiselectList();
        if (f === Ae)
          return this._match(Ae), this._parseMultiselectHash();
      },
      _parseProjectionRHS: function(c) {
        var f;
        if (H[this._lookahead(0)] < 10)
          f = { type: "Identity" };
        else if (this._lookahead(0) === je)
          f = this.expression(c);
        else if (this._lookahead(0) === se)
          f = this.expression(c);
        else if (this._lookahead(0) === de)
          this._match(de), f = this._parseDotRHS(c);
        else {
          var g = this._lookaheadToken(0), x = new Error("Sytanx error, unexpected token: " + g.value + "(" + g.type + ")");
          throw x.name = "ParserError", x;
        }
        return f;
      },
      _parseMultiselectList: function() {
        for (var c = []; this._lookahead(0) !== S; ) {
          var f = this.expression(0);
          if (c.push(f), this._lookahead(0) === D && (this._match(D), this._lookahead(0) === S))
            throw new Error("Unexpected token Rbracket");
        }
        return this._match(S), { type: "MultiSelectList", children: c };
      },
      _parseMultiselectHash: function() {
        for (var c = [], f = [T, M], g, x, I, L; ; ) {
          if (g = this._lookaheadToken(0), f.indexOf(g.type) < 0)
            throw new Error("Expecting an identifier token, got: " + g.type);
          if (x = g.value, this._advance(), this._match(Q), I = this.expression(0), L = { type: "KeyValuePair", name: x, value: I }, c.push(L), this._lookahead(0) === D)
            this._match(D);
          else if (this._lookahead(0) === ee) {
            this._match(ee);
            break;
          }
        }
        return { type: "MultiSelectHash", children: c };
      }
    };
    function st(c) {
      this.runtime = c;
    }
    st.prototype = {
      search: function(c, f) {
        return this.visit(c, f);
      },
      visit: function(c, f) {
        var g, x, I, L, K, J, ye, Ze, oe, G;
        switch (c.type) {
          case "Field":
            return f !== null && r(f) ? (J = f[c.name], J === void 0 ? null : J) : null;
          case "Subexpression":
            for (I = this.visit(c.children[0], f), G = 1; G < c.children.length; G++)
              if (I = this.visit(c.children[1], I), I === null)
                return null;
            return I;
          case "IndexExpression":
            return ye = this.visit(c.children[0], f), Ze = this.visit(c.children[1], ye), Ze;
          case "Index":
            if (!n(f))
              return null;
            var Le = c.value;
            return Le < 0 && (Le = f.length + Le), I = f[Le], I === void 0 && (I = null), I;
          case "Slice":
            if (!n(f))
              return null;
            var Ht = c.children.slice(0), mt = this.computeSliceParams(f.length, Ht), yt = mt[0], Ve = mt[1], bt = mt[2];
            if (I = [], bt > 0)
              for (G = yt; G < Ve; G += bt)
                I.push(f[G]);
            else
              for (G = yt; G > Ve; G += bt)
                I.push(f[G]);
            return I;
          case "Projection":
            var _e = this.visit(c.children[0], f);
            if (!n(_e))
              return null;
            for (oe = [], G = 0; G < _e.length; G++)
              x = this.visit(c.children[1], _e[G]), x !== null && oe.push(x);
            return oe;
          case "ValueProjection":
            if (_e = this.visit(c.children[0], f), !r(_e))
              return null;
            oe = [];
            var Kt = a(_e);
            for (G = 0; G < Kt.length; G++)
              x = this.visit(c.children[1], Kt[G]), x !== null && oe.push(x);
            return oe;
          case "FilterProjection":
            if (_e = this.visit(c.children[0], f), !n(_e))
              return null;
            var wt = [], Vt = [];
            for (G = 0; G < _e.length; G++)
              g = this.visit(c.children[2], _e[G]), o(g) || wt.push(_e[G]);
            for (var xt = 0; xt < wt.length; xt++)
              x = this.visit(c.children[1], wt[xt]), x !== null && Vt.push(x);
            return Vt;
          case "Comparator":
            switch (L = this.visit(c.children[0], f), K = this.visit(c.children[1], f), c.name) {
              case re:
                I = i(L, K);
                break;
              case V:
                I = !i(L, K);
                break;
              case me:
                I = L > K;
                break;
              case F:
                I = L >= K;
                break;
              case we:
                I = L < K;
                break;
              case R:
                I = L <= K;
                break;
              default:
                throw new Error("Unknown comparator: " + c.name);
            }
            return I;
          case U:
            var kt = this.visit(c.children[0], f);
            if (!n(kt))
              return null;
            var Ne = [];
            for (G = 0; G < kt.length; G++)
              x = kt[G], n(x) ? Ne.push.apply(Ne, x) : Ne.push(x);
            return Ne;
          case "Identity":
            return f;
          case "MultiSelectList":
            if (f === null)
              return null;
            for (oe = [], G = 0; G < c.children.length; G++)
              oe.push(this.visit(c.children[G], f));
            return oe;
          case "MultiSelectHash":
            if (f === null)
              return null;
            oe = {};
            var Et;
            for (G = 0; G < c.children.length; G++)
              Et = c.children[G], oe[Et.name] = this.visit(Et.value, f);
            return oe;
          case "OrExpression":
            return g = this.visit(c.children[0], f), o(g) && (g = this.visit(c.children[1], f)), g;
          case "AndExpression":
            return L = this.visit(c.children[0], f), o(L) === !0 ? L : this.visit(c.children[1], f);
          case "NotExpression":
            return L = this.visit(c.children[0], f), o(L);
          case "Literal":
            return c.value;
          case O:
            return ye = this.visit(c.children[0], f), this.visit(c.children[1], ye);
          case W:
            return f;
          case "Function":
            var Wt = [];
            for (G = 0; G < c.children.length; G++)
              Wt.push(this.visit(c.children[G], f));
            return this.runtime.callFunction(c.name, Wt);
          case "ExpressionReference":
            var Jt = c.children[0];
            return Jt.jmespathType = be, Jt;
          default:
            throw new Error("Unknown node type: " + c.type);
        }
      },
      computeSliceParams: function(c, f) {
        var g = f[0], x = f[1], I = f[2], L = [null, null, null];
        if (I === null)
          I = 1;
        else if (I === 0) {
          var K = new Error("Invalid slice, step cannot be 0");
          throw K.name = "RuntimeError", K;
        }
        var J = I < 0;
        return g === null ? g = J ? c - 1 : 0 : g = this.capSliceRange(c, g, I), x === null ? x = J ? -1 : c : x = this.capSliceRange(c, x, I), L[0] = g, L[1] = x, L[2] = I, L;
      },
      capSliceRange: function(c, f, g) {
        return f < 0 ? (f += c, f < 0 && (f = g < 0 ? -1 : 0)) : f >= c && (f = g < 0 ? c - 1 : c), f;
      }
    };
    function tt(c) {
      this._interpreter = c, this.functionTable = {
        // name: [function, <signature>]
        // The <signature> can be:
        //
        // {
        //   args: [[type1, type2], [type1, type2]],
        //   variadic: true|false
        // }
        //
        // Each arg in the arg list is a list of valid types
        // (if the function is overloaded and supports multiple
        // types.  If the type is "any" then no type checking
        // occurs on the argument.  Variadic is optional
        // and if not provided is assumed to be false.
        abs: { _func: this._functionAbs, _signature: [{ types: [s] }] },
        avg: { _func: this._functionAvg, _signature: [{ types: [k] }] },
        ceil: { _func: this._functionCeil, _signature: [{ types: [s] }] },
        contains: {
          _func: this._functionContains,
          _signature: [
            { types: [d, p] },
            { types: [h] }
          ]
        },
        ends_with: {
          _func: this._functionEndsWith,
          _signature: [{ types: [d] }, { types: [d] }]
        },
        floor: { _func: this._functionFloor, _signature: [{ types: [s] }] },
        length: {
          _func: this._functionLength,
          _signature: [{ types: [d, p, y] }]
        },
        map: {
          _func: this._functionMap,
          _signature: [{ types: [m] }, { types: [p] }]
        },
        max: {
          _func: this._functionMax,
          _signature: [{ types: [k, _] }]
        },
        merge: {
          _func: this._functionMerge,
          _signature: [{ types: [y], variadic: !0 }]
        },
        max_by: {
          _func: this._functionMaxBy,
          _signature: [{ types: [p] }, { types: [m] }]
        },
        sum: { _func: this._functionSum, _signature: [{ types: [k] }] },
        starts_with: {
          _func: this._functionStartsWith,
          _signature: [{ types: [d] }, { types: [d] }]
        },
        min: {
          _func: this._functionMin,
          _signature: [{ types: [k, _] }]
        },
        min_by: {
          _func: this._functionMinBy,
          _signature: [{ types: [p] }, { types: [m] }]
        },
        type: { _func: this._functionType, _signature: [{ types: [h] }] },
        keys: { _func: this._functionKeys, _signature: [{ types: [y] }] },
        values: { _func: this._functionValues, _signature: [{ types: [y] }] },
        sort: { _func: this._functionSort, _signature: [{ types: [_, k] }] },
        sort_by: {
          _func: this._functionSortBy,
          _signature: [{ types: [p] }, { types: [m] }]
        },
        join: {
          _func: this._functionJoin,
          _signature: [
            { types: [d] },
            { types: [_] }
          ]
        },
        reverse: {
          _func: this._functionReverse,
          _signature: [{ types: [d, p] }]
        },
        to_array: { _func: this._functionToArray, _signature: [{ types: [h] }] },
        to_string: { _func: this._functionToString, _signature: [{ types: [h] }] },
        to_number: { _func: this._functionToNumber, _signature: [{ types: [h] }] },
        not_null: {
          _func: this._functionNotNull,
          _signature: [{ types: [h], variadic: !0 }]
        }
      };
    }
    tt.prototype = {
      callFunction: function(c, f) {
        var g = this.functionTable[c];
        if (g === void 0)
          throw new Error("Unknown function: " + c + "()");
        return this._validateArgs(c, f, g._signature), g._func.call(this, f);
      },
      _validateArgs: function(c, f, g) {
        var x;
        if (g[g.length - 1].variadic) {
          if (f.length < g.length)
            throw x = g.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + c + "() takes at least" + g.length + x + " but received " + f.length);
        } else if (f.length !== g.length)
          throw x = g.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + c + "() takes " + g.length + x + " but received " + f.length);
        for (var I, L, K, J = 0; J < g.length; J++) {
          K = !1, I = g[J].types, L = this._getTypeName(f[J]);
          for (var ye = 0; ye < I.length; ye++)
            if (this._typeMatches(L, I[ye], f[J])) {
              K = !0;
              break;
            }
          if (!K) {
            var Ze = I.map(function(oe) {
              return N[oe];
            }).join(",");
            throw new Error("TypeError: " + c + "() expected argument " + (J + 1) + " to be type " + Ze + " but received type " + N[L] + " instead.");
          }
        }
      },
      _typeMatches: function(c, f, g) {
        if (f === h)
          return !0;
        if (f === _ || f === k || f === p) {
          if (f === p)
            return c === p;
          if (c === p) {
            var x;
            f === k ? x = s : f === _ && (x = d);
            for (var I = 0; I < g.length; I++)
              if (!this._typeMatches(
                this._getTypeName(g[I]),
                x,
                g[I]
              ))
                return !1;
            return !0;
          }
        } else
          return c === f;
      },
      _getTypeName: function(c) {
        switch (Object.prototype.toString.call(c)) {
          case "[object String]":
            return d;
          case "[object Number]":
            return s;
          case "[object Array]":
            return p;
          case "[object Boolean]":
            return w;
          case "[object Null]":
            return E;
          case "[object Object]":
            return c.jmespathType === be ? m : y;
        }
      },
      _functionStartsWith: function(c) {
        return c[0].lastIndexOf(c[1]) === 0;
      },
      _functionEndsWith: function(c) {
        var f = c[0], g = c[1];
        return f.indexOf(g, f.length - g.length) !== -1;
      },
      _functionReverse: function(c) {
        var f = this._getTypeName(c[0]);
        if (f === d) {
          for (var g = c[0], x = "", I = g.length - 1; I >= 0; I--)
            x += g[I];
          return x;
        } else {
          var L = c[0].slice(0);
          return L.reverse(), L;
        }
      },
      _functionAbs: function(c) {
        return Math.abs(c[0]);
      },
      _functionCeil: function(c) {
        return Math.ceil(c[0]);
      },
      _functionAvg: function(c) {
        for (var f = 0, g = c[0], x = 0; x < g.length; x++)
          f += g[x];
        return f / g.length;
      },
      _functionContains: function(c) {
        return c[0].indexOf(c[1]) >= 0;
      },
      _functionFloor: function(c) {
        return Math.floor(c[0]);
      },
      _functionLength: function(c) {
        return r(c[0]) ? Object.keys(c[0]).length : c[0].length;
      },
      _functionMap: function(c) {
        for (var f = [], g = this._interpreter, x = c[0], I = c[1], L = 0; L < I.length; L++)
          f.push(g.visit(x, I[L]));
        return f;
      },
      _functionMerge: function(c) {
        for (var f = {}, g = 0; g < c.length; g++) {
          var x = c[g];
          for (var I in x)
            f[I] = x[I];
        }
        return f;
      },
      _functionMax: function(c) {
        if (c[0].length > 0) {
          var f = this._getTypeName(c[0][0]);
          if (f === s)
            return Math.max.apply(Math, c[0]);
          for (var g = c[0], x = g[0], I = 1; I < g.length; I++)
            x.localeCompare(g[I]) < 0 && (x = g[I]);
          return x;
        } else
          return null;
      },
      _functionMin: function(c) {
        if (c[0].length > 0) {
          var f = this._getTypeName(c[0][0]);
          if (f === s)
            return Math.min.apply(Math, c[0]);
          for (var g = c[0], x = g[0], I = 1; I < g.length; I++)
            g[I].localeCompare(x) < 0 && (x = g[I]);
          return x;
        } else
          return null;
      },
      _functionSum: function(c) {
        for (var f = 0, g = c[0], x = 0; x < g.length; x++)
          f += g[x];
        return f;
      },
      _functionType: function(c) {
        switch (this._getTypeName(c[0])) {
          case s:
            return "number";
          case d:
            return "string";
          case p:
            return "array";
          case y:
            return "object";
          case w:
            return "boolean";
          case m:
            return "expref";
          case E:
            return "null";
        }
      },
      _functionKeys: function(c) {
        return Object.keys(c[0]);
      },
      _functionValues: function(c) {
        for (var f = c[0], g = Object.keys(f), x = [], I = 0; I < g.length; I++)
          x.push(f[g[I]]);
        return x;
      },
      _functionJoin: function(c) {
        var f = c[0], g = c[1];
        return g.join(f);
      },
      _functionToArray: function(c) {
        return this._getTypeName(c[0]) === p ? c[0] : [c[0]];
      },
      _functionToString: function(c) {
        return this._getTypeName(c[0]) === d ? c[0] : JSON.stringify(c[0]);
      },
      _functionToNumber: function(c) {
        var f = this._getTypeName(c[0]), g;
        return f === s ? c[0] : f === d && (g = +c[0], !isNaN(g)) ? g : null;
      },
      _functionNotNull: function(c) {
        for (var f = 0; f < c.length; f++)
          if (this._getTypeName(c[f]) !== E)
            return c[f];
        return null;
      },
      _functionSort: function(c) {
        var f = c[0].slice(0);
        return f.sort(), f;
      },
      _functionSortBy: function(c) {
        var f = c[0].slice(0);
        if (f.length === 0)
          return f;
        var g = this._interpreter, x = c[1], I = this._getTypeName(
          g.visit(x, f[0])
        );
        if ([s, d].indexOf(I) < 0)
          throw new Error("TypeError");
        for (var L = this, K = [], J = 0; J < f.length; J++)
          K.push([J, f[J]]);
        K.sort(function(Ze, oe) {
          var G = g.visit(x, Ze[1]), Le = g.visit(x, oe[1]);
          if (L._getTypeName(G) !== I)
            throw new Error(
              "TypeError: expected " + I + ", received " + L._getTypeName(G)
            );
          if (L._getTypeName(Le) !== I)
            throw new Error(
              "TypeError: expected " + I + ", received " + L._getTypeName(Le)
            );
          return G > Le ? 1 : G < Le ? -1 : Ze[0] - oe[0];
        });
        for (var ye = 0; ye < K.length; ye++)
          f[ye] = K[ye][1];
        return f;
      },
      _functionMaxBy: function(c) {
        for (var f = c[1], g = c[0], x = this.createKeyFunction(f, [s, d]), I = -1 / 0, L, K, J = 0; J < g.length; J++)
          K = x(g[J]), K > I && (I = K, L = g[J]);
        return L;
      },
      _functionMinBy: function(c) {
        for (var f = c[1], g = c[0], x = this.createKeyFunction(f, [s, d]), I = 1 / 0, L, K, J = 0; J < g.length; J++)
          K = x(g[J]), K < I && (I = K, L = g[J]);
        return L;
      },
      createKeyFunction: function(c, f) {
        var g = this, x = this._interpreter, I = function(L) {
          var K = x.visit(c, L);
          if (f.indexOf(g._getTypeName(K)) < 0) {
            var J = "TypeError: expected one of " + f + ", received " + g._getTypeName(K);
            throw new Error(J);
          }
          return K;
        };
        return I;
      }
    };
    function Fe(c) {
      var f = new Ke(), g = f.parse(c);
      return g;
    }
    function qt(c) {
      var f = new _t();
      return f.tokenize(c);
    }
    function Gt(c, f) {
      var g = new Ke(), x = new tt(), I = new st(x);
      x._interpreter = I;
      var L = g.parse(f);
      return I.search(L, c);
    }
    t.tokenize = qt, t.compile = Fe, t.search = Gt, t.strictDeepEqual = i;
  })(e);
})(No);
const xi = /* @__PURE__ */ xn(No);
class $o {
  constructor(t) {
    Z(this, "layers", []);
    Z(this, "dataLoaded", !1);
    Z(this, "layerSelectedNodes", []);
    Z(this, "layerSelectedEdges", []);
    this.layers = Bh.parse(t);
  }
  static fromJson(t) {
    const n = JSON.parse(t);
    return this.fromObject(n);
  }
  static fromObject(t) {
    return new $o(t);
  }
  applyData(t, n) {
    const r = "id", i = "source", o = "target";
    this.layerSelectedEdges.length = 0, this.layerSelectedNodes.length = 0;
    for (const a of this.layers) {
      let u = /* @__PURE__ */ new Set();
      if (a.node) {
        const d = `[${a.node.selector.length ? `?${a.node.selector}` : ""}].${r}`, p = xi.search(t, d);
        u = new Set(p);
      }
      this.layerSelectedNodes.push(u);
      let s = /* @__PURE__ */ new Set();
      if (a.edge) {
        const d = `[${a.edge.selector.length ? `?${a.edge.selector}` : ""}].{src: ${i}, dst: ${o}}`, p = xi.search(n, d);
        s = new Set(p);
      }
      this.layerSelectedEdges.push(s);
    }
    this.dataLoaded = !0;
  }
  addLayer(t) {
    this.layers.push(t);
  }
  insertLayer(t, n) {
    this.layers.splice(t, 0, n);
  }
  getStyleForNode(t) {
    const n = [];
    for (let i = 0; i < this.layers.length; i++) {
      const { node: o } = this.layers[i];
      this.layerSelectedNodes[i].has(t) && o && n.push(o.style);
    }
    return nd({}, ...n);
  }
}
const zo = /* @__PURE__ */ new Map([
  ["aliceblue", "#f0f8ff"],
  ["antiquewhite", "#faebd7"],
  ["aqua", "#00ffff"],
  ["aquamarine", "#7fffd4"],
  ["azure", "#f0ffff"],
  ["beige", "#f5f5dc"],
  ["bisque", "#ffe4c4"],
  ["black", "#000000"],
  ["blanchedalmond", "#ffebcd"],
  ["blue", "#0000ff"],
  ["blueviolet", "#8a2be2"],
  ["brown", "#a52a2a"],
  ["burlywood", "#deb887"],
  ["cadetblue", "#5f9ea0"],
  ["chartreuse", "#7fff00"],
  ["chocolate", "#d2691e"],
  ["coral", "#ff7f50"],
  ["cornflowerblue", "#6495ed"],
  ["cornsilk", "#fff8dc"],
  ["crimson", "#dc143c"],
  ["cyan", "#00ffff"],
  ["darkblue", "#00008b"],
  ["darkcyan", "#008b8b"],
  ["darkgoldenrod", "#b8860b"],
  ["darkgray", "#a9a9a9"],
  ["darkgreen", "#006400"],
  ["darkkhaki", "#bdb76b"],
  ["darkmagenta", "#8b008b"],
  ["darkolivegreen", "#556b2f"],
  ["darkorange", "#ff8c00"],
  ["darkorchid", "#9932cc"],
  ["darkred", "#8b0000"],
  ["darksalmon", "#e9967a"],
  ["darkseagreen", "#8fbc8f"],
  ["darkslateblue", "#483d8b"],
  ["darkslategray", "#2f4f4f"],
  ["darkturquoise", "#00ced1"],
  ["darkviolet", "#9400d3"],
  ["deeppink", "#ff1493"],
  ["deepskyblue", "#00bfff"],
  ["dimgray", "#696969"],
  ["dodgerblue", "#1e90ff"],
  ["firebrick", "#b22222"],
  ["floralwhite", "#fffaf0"],
  ["forestgreen", "#228b22"],
  ["fuchsia", "#ff00ff"],
  ["gainsboro", "#dcdcdc"],
  ["ghostwhite", "#f8f8ff"],
  ["gold", "#ffd700"],
  ["goldenrod", "#daa520"],
  ["gray", "#808080"],
  ["green", "#008000"],
  ["greenyellow", "#adff2f"],
  ["honeydew", "#f0fff0"],
  ["hotpink", "#ff69b4"],
  ["indianred ", "#cd5c5c"],
  ["indigo", "#4b0082"],
  ["ivory", "#fffff0"],
  ["khaki", "#f0e68c"],
  ["lavender", "#e6e6fa"],
  ["lavenderblush", "#fff0f5"],
  ["lawngreen", "#7cfc00"],
  ["lemonchiffon", "#fffacd"],
  ["lightblue", "#add8e6"],
  ["lightcoral", "#f08080"],
  ["lightcyan", "#e0ffff"],
  ["lightgoldenrodyellow", "#fafad2"],
  ["lightgrey", "#d3d3d3"],
  ["lightgreen", "#90ee90"],
  ["lightpink", "#ffb6c1"],
  ["lightsalmon", "#ffa07a"],
  ["lightseagreen", "#20b2aa"],
  ["lightskyblue", "#87cefa"],
  ["lightslategray", "#778899"],
  ["lightsteelblue", "#b0c4de"],
  ["lightyellow", "#ffffe0"],
  ["lime", "#00ff00"],
  ["limegreen", "#32cd32"],
  ["linen", "#faf0e6"],
  ["magenta", "#ff00ff"],
  ["maroon", "#800000"],
  ["mediumaquamarine", "#66cdaa"],
  ["mediumblue", "#0000cd"],
  ["mediumorchid", "#ba55d3"],
  ["mediumpurple", "#9370d8"],
  ["mediumseagreen", "#3cb371"],
  ["mediumslateblue", "#7b68ee"],
  ["mediumspringgreen", "#00fa9a"],
  ["mediumturquoise", "#48d1cc"],
  ["mediumvioletred", "#c71585"],
  ["midnightblue", "#191970"],
  ["mintcream", "#f5fffa"],
  ["mistyrose", "#ffe4e1"],
  ["moccasin", "#ffe4b5"],
  ["navajowhite", "#ffdead"],
  ["navy", "#000080"],
  ["oldlace", "#fdf5e6"],
  ["olive", "#808000"],
  ["olivedrab", "#6b8e23"],
  ["orange", "#ffa500"],
  ["orangered", "#ff4500"],
  ["orchid", "#da70d6"],
  ["palegoldenrod", "#eee8aa"],
  ["palegreen", "#98fb98"],
  ["paleturquoise", "#afeeee"],
  ["palevioletred", "#d87093"],
  ["papayawhip", "#ffefd5"],
  ["peachpuff", "#ffdab9"],
  ["peru", "#cd853f"],
  ["pink", "#ffc0cb"],
  ["plum", "#dda0dd"],
  ["powderblue", "#b0e0e6"],
  ["purple", "#800080"],
  ["rebeccapurple", "#663399"],
  ["red", "#ff0000"],
  ["rosybrown", "#bc8f8f"],
  ["royalblue", "#4169e1"],
  ["saddlebrown", "#8b4513"],
  ["salmon", "#fa8072"],
  ["sandybrown", "#f4a460"],
  ["seagreen", "#2e8b57"],
  ["seashell", "#fff5ee"],
  ["sienna", "#a0522d"],
  ["silver", "#c0c0c0"],
  ["skyblue", "#87ceeb"],
  ["slateblue", "#6a5acd"],
  ["slategray", "#708090"],
  ["snow", "#fffafa"],
  ["springgreen", "#00ff7f"],
  ["steelblue", "#4682b4"],
  ["tan", "#d2b48c"],
  ["teal", "#008080"],
  ["thistle", "#d8bfd8"],
  ["tomato", "#ff6347"],
  ["turquoise", "#40e0d0"],
  ["violet", "#ee82ee"],
  ["wheat", "#f5deb3"],
  ["white", "#ffffff"],
  ["whitesmoke", "#f5f5f5"],
  ["yellow", "#ffff00"],
  ["yellowgreen", "#9acd32"]
]);
function rd(e) {
  const t = zo.get(e);
  return t || e;
}
const sd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  colorMap: zo,
  colorNameToHex: rd
}, Symbol.toStringTag, { value: "Module" }));
export {
  Se as Edge,
  ad as Graph,
  ed as Graphty,
  Pt as Node,
  $o as Styles,
  sd as util
};
