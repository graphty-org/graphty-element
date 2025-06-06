import { Ray as ya, Vector3 as Ye, GreasedLineTools as ba, CreateGreasedLine as lr, GreasedLineMeshWidthDistribution as wa, Color3 as xt, RawTexture as hi, Engine as $r, GreasedLineMeshColorMode as xa, SixDofDragBehavior as $a, ActionManager as li, ExecuteCodeAction as ka, StandardMaterial as di, Color4 as Ea, MeshBuilder as Ae, DynamicTexture as fi, PerfCounter as yt, SceneInstrumentation as Na, EngineInstrumentation as Ta, Observable as dr, Scene as Ma, ArcRotateCamera as za, HemisphericLight as Sa, PhotoDome as Ca, WebXREnterExitUIButton as Aa } from "@babylonjs/core";
class Ue {
  constructor(e, n, r, i, o = {}) {
    this.arrowMesh = null, this.parentGraph = e, this.srcId = n, this.dstId = r, this.metadata = o.metadata ?? {};
    const s = e.nodeCache.get(n);
    if (!s)
      throw new Error(`Attempting to create edge '${n}->${r}', Node '${n}' hasn't been created yet.`);
    const u = e.nodeCache.get(r);
    if (!u)
      throw new Error(`Attempting to create edge '${n}->${r}', Node '${r}' hasn't been created yet.`);
    this.srcNode = s, this.dstNode = u, this.ray = new ya(this.srcNode.mesh.position, this.dstNode.mesh.position), this.style = i, this.parentGraph.graphEngine.addEdge(this), this.mesh = this.style.edgeMeshFactory(this, this.parentGraph, this.style), this.mesh.isPickable = !1, this.mesh.metadata = {}, this.mesh.metadata.parentEdge = this;
  }
  update() {
    const e = this.parentGraph.graphEngine.getEdgePosition(this);
    this.parentGraph.edgeObservable.notifyObservers({ type: "edge-update-before", edge: this });
    const { srcPoint: n, dstPoint: r } = this.transformArrowCap();
    n && r ? this.transformEdgeMesh(
      n,
      r
    ) : this.transformEdgeMesh(
      new Ye(e.src.x, e.src.y, e.src.z),
      new Ye(e.dst.x, e.dst.y, e.dst.z)
    ), this.parentGraph.edgeObservable.notifyObservers({ type: "edge-update-after", edge: this });
  }
  static updateRays(e) {
    if (e.config.style.edge.arrowCap) {
      for (const n of e.graphEngine.edges) {
        const r = n.srcNode.mesh, i = n.dstNode.mesh;
        n.ray.position = i.position, n.ray.direction = i.position.subtract(r.position);
      }
      e.scene.render();
    }
  }
  static create(e, n, r, i, o = {}) {
    const s = e.edgeCache.get(n, r);
    if (s)
      return s;
    const u = new Ue(e, n, r, i, o);
    return e.edgeCache.set(n, r, u), u;
  }
  static defaultEdgeMeshFactory(e, n, r) {
    return r.arrowCap && (e.arrowMesh = n.meshCache.get("default-arrow-cap", () => {
      const i = Ia(r.width), o = pi(r.width), s = ba.GetArrowCap(
        new Ye(0, 0, -o),
        // position
        new Ye(0, 0, 1),
        // direction
        o,
        // length
        i,
        // widthUp
        i
        // widthDown
      );
      return lr(
        "lines",
        {
          points: s.points,
          widths: s.widths,
          widthDistribution: wa.WIDTH_DISTRIBUTION_START
          // instance: line,
        },
        {
          color: xt.FromHexString(r.color.slice(0, 7))
        }
        // e.parentGraph.scene
      );
    })), n.meshCache.get("default-edge", () => {
      switch (r.type) {
        case "plain":
          return Ue.createPlainLine(e, n, r);
        case "moving":
          return Ue.createMovingLine(e, n, r);
        default:
          throw new TypeError(`Unknown Edge type: '${r.type}'`);
      }
    });
  }
  static createPlainLine(e, n, r) {
    return lr(
      "edge-plain",
      {
        points: Ue.unitVectorPoints
      },
      {
        color: xt.FromHexString(r.color.slice(0, 7)),
        width: r.width
      }
    );
  }
  static createMovingLine(e, n, r) {
    const i = xt.FromHexString(r.movingLineOpts.baseColor.slice(0, 7)), o = xt.FromHexString(r.color.slice(0, 7)), s = Math.floor(i.r * 255), u = Math.floor(i.g * 255), a = Math.floor(i.b * 255), h = Math.floor(o.r * 255), d = Math.floor(o.g * 255), f = Math.floor(o.b * 255), y = new Uint8Array([s, u, a, h, d, f]), b = new hi(
      y,
      // data
      y.length / 3,
      // width
      1,
      // height
      $r.TEXTUREFORMAT_RGB,
      // format
      n.scene,
      // sceneOrEngine
      !1,
      // generateMipMaps
      !0,
      // invertY
      $r.TEXTURE_NEAREST_NEAREST
      // samplingMode
      // samplingMode
      // type
      // creationFlags
      // useSRGBBuffer
    );
    b.wrapU = hi.WRAP_ADDRESSMODE, b.name = "moving-texture";
    const m = lr(
      "edge-moving",
      {
        points: Ue.unitVectorPoints
      },
      {
        // color: Color3.FromHexString(colorNameToHex(edgeColor))
        width: r.width,
        colorMode: xa.COLOR_MODE_MULTIPLY
      }
    ), k = m.material;
    return k.emissiveTexture = b, k.disableLighting = !0, b.uScale = 5, n.scene.onBeforeRenderObservable.add(() => {
      b.uOffset -= 0.04 * n.scene.getAnimationRatio();
    }), m;
  }
  transformEdgeMesh(e, n) {
    const r = n.subtract(e), i = new Ye(
      e.x + r.x / 2,
      e.y + r.y / 2,
      e.z + r.z / 2
    ), o = r.length();
    this.mesh.position = i, this.mesh.lookAt(n), this.mesh.scaling.z = o;
  }
  transformArrowCap() {
    if (this.arrowMesh) {
      this.parentGraph.stats.arrowCapUpdate.beginMonitoring();
      const { srcPoint: e, dstPoint: n, newEndPoint: r } = this.getInterceptPoints();
      if (!e || !n || !r)
        throw new Error("Internal Error: mesh intercept points not found");
      return this.arrowMesh.position = n, this.arrowMesh.lookAt(this.dstNode.mesh.position), this.parentGraph.stats.arrowCapUpdate.endMonitoring(), {
        srcPoint: e,
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
    const e = this.srcNode.mesh, n = this.dstNode.mesh;
    this.parentGraph.stats.intersectCalc.beginMonitoring();
    const r = this.ray.intersectsMeshes([n]), i = this.ray.intersectsMeshes([e]);
    this.parentGraph.stats.intersectCalc.endMonitoring();
    let o = null, s = null, u = null;
    if (r.length && i.length) {
      const a = pi(this.style.width);
      s = r[0].pickedPoint, o = i[0].pickedPoint;
      const h = o.subtract(s).length(), d = h - a, { x: f, y, z: b } = o, { x: m, y: k, z: $ } = s, _ = f + d / h * (m - f), E = y + d / h * (k - y), N = b + d / h * ($ - b);
      u = new Ye(_, E, N);
    }
    return {
      srcPoint: o,
      dstPoint: s,
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
function Ia(t) {
  return Math.max(20 * t, 4);
}
function pi(t) {
  return Math.max(t, 0.5);
}
class Pa {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  has(e, n) {
    const r = this.map.get(e);
    return r ? r.has(n) : !1;
  }
  set(e, n, r) {
    let i = this.map.get(e);
    if (i || (i = /* @__PURE__ */ new Map(), this.map.set(e, i)), i.has(n))
      throw new Error("Attempting to create duplicate Edge");
    i.set(n, r);
  }
  get(e, n) {
    const r = this.map.get(e);
    if (r)
      return r.get(n);
  }
  get size() {
    let e = 0;
    for (const n of this.map.values())
      e += n.size;
    return e;
  }
}
const gi = 1.618;
let mo = class ie {
  constructor(e, n, r, i = {}) {
    if (this.dragging = !1, this.parentGraph = e, this.id = n, this.metadata = i.metadata ?? {}, this.style = r, this.parentGraph.graphEngine.addNode(this), this.mesh = this.style.nodeMeshFactory(this, this.parentGraph, this.style), this.mesh.isPickable = !0, this.mesh.metadata = { parentNode: this }, this.style.label && (this.label = ie.createLabel(this.id.toString(), this, this.parentGraph), this.label.parent = this.mesh, this.label.position.y += 1), this.pinOnDrag = i.pinOnDrag ?? !0, this.meshDragBehavior = new $a(), this.mesh.addBehavior(this.meshDragBehavior), this.meshDragBehavior.onDragStartObservable.add(() => {
      this.parentGraph.running = !0, this.dragging = !0;
    }), this.meshDragBehavior.onDragEndObservable.add(() => {
      this.parentGraph.running = !0, this.pinOnDrag && this.pin(), this.dragging = !1;
    }), this.meshDragBehavior.onPositionChangedObservable.add((o) => {
      this.parentGraph.running = !0, this.parentGraph.graphEngine.setNodePosition(this, o.position);
    }), this.mesh.actionManager = this.mesh.actionManager ?? new li(this.parentGraph.scene), this.parentGraph.fetchNodes && this.parentGraph.fetchEdges) {
      const { fetchNodes: o, fetchEdges: s } = this.parentGraph;
      this.mesh.actionManager.registerAction(
        new ka(
          {
            trigger: li.OnDoublePickTrigger
            // trigger: ActionManager.OnLongPressTrigger,
          },
          () => {
            this.parentGraph.running = !0;
            const u = s(this, this.parentGraph), a = /* @__PURE__ */ new Set();
            u.forEach((d) => {
              a.add(d.src), a.add(d.dst);
            }), a.delete(this.id);
            const h = o(a, this.parentGraph);
            this.parentGraph.addNodes([...h]), this.parentGraph.addEdges([...u]);
          }
        )
      );
    }
  }
  update() {
    if (this.dragging)
      return;
    this.parentGraph.nodeObservable.notifyObservers({ type: "node-update-before", node: this });
    const e = this.parentGraph.graphEngine.getNodePosition(this);
    this.mesh.position.x = e.x, this.mesh.position.y = e.y, e.z && (this.mesh.position.z = e.z), this.parentGraph.nodeObservable.notifyObservers({ type: "node-update-after", node: this });
  }
  pin() {
    this.parentGraph.graphEngine.pin(this);
  }
  unpin() {
    this.parentGraph.graphEngine.unpin(this);
  }
  static create(e, n, r, i = {}) {
    const o = e.nodeCache.get(n);
    if (o)
      return o;
    const s = new ie(e, n, r, i);
    return e.nodeCache.set(n, s), s;
  }
  static defaultNodeMeshFactory(e, n, r) {
    return n.meshCache.get("default-mesh", () => {
      let i;
      switch (r.shape) {
        case "box":
          i = ie.createBox(e, n, r);
          break;
        case "sphere":
          i = ie.createSphere(e, n, r);
          break;
        case "cylinder":
          i = ie.createCylinder(e, n, r);
          break;
        case "cone":
          i = ie.createCone(e, n, r);
          break;
        case "capsule":
          i = ie.createCapsule(e, n, r);
          break;
        case "torus-knot":
          i = ie.createTorusKnot(e, n, r);
          break;
        case "tetrahedron":
          i = ie.createPolyhedron(0, e, n, r);
          break;
        case "octahedron":
          i = ie.createPolyhedron(1, e, n, r);
          break;
        case "dodecahedron":
          i = ie.createPolyhedron(2, e, n, r);
          break;
        case "icosahedron":
          i = ie.createPolyhedron(3, e, n, r);
          break;
        case "rhombicuboctahedron":
          i = ie.createPolyhedron(4, e, n, r);
          break;
        case "triangular_prism":
          i = ie.createPolyhedron(5, e, n, r);
          break;
        case "pentagonal_prism":
          i = ie.createPolyhedron(6, e, n, r);
          break;
        case "hexagonal_prism":
          i = ie.createPolyhedron(7, e, n, r);
          break;
        case "square_pyramid":
          i = ie.createPolyhedron(8, e, n, r);
          break;
        case "pentagonal_pyramid":
          i = ie.createPolyhedron(9, e, n, r);
          break;
        case "triangular_dipyramid":
          i = ie.createPolyhedron(10, e, n, r);
          break;
        case "pentagonal_dipyramid":
          i = ie.createPolyhedron(11, e, n, r);
          break;
        case "elongated_square_dypyramid":
          i = ie.createPolyhedron(12, e, n, r);
          break;
        case "elongated_pentagonal_dipyramid":
          i = ie.createPolyhedron(13, e, n, r);
          break;
        case "elongated_pentagonal_cupola":
          i = ie.createPolyhedron(14, e, n, r);
          break;
        case "goldberg":
          i = ie.createGoldberg(e, n, r);
          break;
        case "icosphere":
          i = ie.createIcoSphere(e, n, r);
          break;
        case "geodesic":
          i = ie.createGeodesic(e, n, r);
          break;
        default:
          throw new TypeError(`unknown shape: ${r.shape}`);
      }
      const o = new di("defaultMaterial"), s = Ea.FromHexString(r.color);
      return o.diffuseColor = new xt(s.r, s.g, s.b), o.wireframe = r.wireframe, o.freeze(), i.visibility = s.a, i.visibility = 1, i.material = o, i;
    });
  }
  static createBox(e, n, r) {
    return Ae.CreateBox("box", { size: r.size });
  }
  static createSphere(e, n, r) {
    return Ae.CreateSphere("sphere", { diameter: r.size });
  }
  static createCylinder(e, n, r) {
    return Ae.CreateCylinder("cylinder", { height: r.size * gi, diameter: r.size });
  }
  static createCone(e, n, r) {
    return Ae.CreateCylinder("cylinder", { height: r.size * gi, diameterTop: 0, diameterBottom: r.size });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createCapsule(e, n, r) {
    return Ae.CreateCapsule("capsule", {});
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createTorus(e, n, r) {
    return Ae.CreateTorus("torus", {});
  }
  static createTorusKnot(e, n, r) {
    return Ae.CreateTorusKnot("tk", { radius: r.size * 0.3, tube: r.size * 0.2, radialSegments: 128 });
  }
  static createPolyhedron(e, n, r, i) {
    return Ae.CreatePolyhedron("polyhedron", { size: i.size, type: e });
  }
  static createGoldberg(e, n, r) {
    return Ae.CreateGoldberg("goldberg", { size: r.size });
  }
  static createIcoSphere(e, n, r) {
    return Ae.CreateIcoSphere("icosphere", { radius: r.size * 0.75 });
  }
  static createGeodesic(e, n, r) {
    return Ae.CreateGeodesic("geodesic", { size: r.size });
  }
  static createLabel(e, n, r) {
    const o = "48px Verdana", a = 0.006944444444444444, d = new fi("DynamicTexture", 64, r.scene).getContext();
    d.font = o;
    const f = d.measureText(e).width + 8, y = f * a, b = new fi("DynamicTexture", { width: f, height: 72 }, r.scene, !1), m = new di("mat", r.scene);
    m.specularColor = xt.Black(), b.hasAlpha = !0;
    const k = b.getContext();
    k.fillStyle = "white", k.beginPath();
    const $ = 0, _ = 0, E = [20, 20, 20, 20], N = f, M = 72;
    k.moveTo($ + E[0], _), k.lineTo($ + N - E[1], _), k.arc($ + N - E[1], _ + E[1], E[1], 3 * Math.PI / 2, Math.PI * 2), k.lineTo($ + N, _ + M - E[2]), k.arc($ + N - E[2], _ + M - E[2], E[2], 0, Math.PI / 2), k.lineTo($ + E[3], _ + M), k.arc($ + E[3], _ + M - E[3], E[3], Math.PI / 2, Math.PI), k.lineTo($, _ + E[0]), k.arc($ + E[0], _ + E[0], E[0], Math.PI, 3 * Math.PI / 2), k.closePath(), k.fill(), b.drawText(e, null, null, o, "#000000", "transparent", !0), m.opacityTexture = b, m.emissiveTexture = b, m.disableLighting = !0;
    const z = Ae.CreatePlane("plane", { width: y, height: 0.5 }, r.scene);
    return z.material = m, z.billboardMode = 7, z;
  }
};
const Re = {
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
}, yo = /* @__PURE__ */ Object.create(null);
for (const t in Re)
  Object.hasOwn(Re, t) && (yo[Re[t]] = t);
const Te = {
  to: {},
  get: {}
};
Te.get = function(t) {
  const e = t.slice(0, 3).toLowerCase();
  let n, r;
  switch (e) {
    case "hsl": {
      n = Te.get.hsl(t), r = "hsl";
      break;
    }
    case "hwb": {
      n = Te.get.hwb(t), r = "hwb";
      break;
    }
    default: {
      n = Te.get.rgb(t), r = "rgb";
      break;
    }
  }
  return n ? { model: r, value: n } : null;
};
Te.get.rgb = function(t) {
  if (!t)
    return null;
  const e = /^#([a-f\d]{3,4})$/i, n = /^#([a-f\d]{6})([a-f\d]{2})?$/i, r = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/, i = /^rgba?\(\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/, o = /^(\w+)$/;
  let s = [0, 0, 0, 1], u, a, h;
  if (u = t.match(n)) {
    for (h = u[2], u = u[1], a = 0; a < 3; a++) {
      const d = a * 2;
      s[a] = Number.parseInt(u.slice(d, d + 2), 16);
    }
    h && (s[3] = Number.parseInt(h, 16) / 255);
  } else if (u = t.match(e)) {
    for (u = u[1], h = u[3], a = 0; a < 3; a++)
      s[a] = Number.parseInt(u[a] + u[a], 16);
    h && (s[3] = Number.parseInt(h + h, 16) / 255);
  } else if (u = t.match(r)) {
    for (a = 0; a < 3; a++)
      s[a] = Number.parseInt(u[a + 1], 10);
    u[4] && (s[3] = u[5] ? Number.parseFloat(u[4]) * 0.01 : Number.parseFloat(u[4]));
  } else if (u = t.match(i)) {
    for (a = 0; a < 3; a++)
      s[a] = Math.round(Number.parseFloat(u[a + 1]) * 2.55);
    u[4] && (s[3] = u[5] ? Number.parseFloat(u[4]) * 0.01 : Number.parseFloat(u[4]));
  } else
    return (u = t.match(o)) ? u[1] === "transparent" ? [0, 0, 0, 0] : Object.hasOwn(Re, u[1]) ? (s = Re[u[1]], s[3] = 1, s) : null : null;
  for (a = 0; a < 3; a++)
    s[a] = nt(s[a], 0, 255);
  return s[3] = nt(s[3], 0, 1), s;
};
Te.get.hsl = function(t) {
  if (!t)
    return null;
  const e = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/, n = t.match(e);
  if (n) {
    const r = Number.parseFloat(n[4]), i = (Number.parseFloat(n[1]) % 360 + 360) % 360, o = nt(Number.parseFloat(n[2]), 0, 100), s = nt(Number.parseFloat(n[3]), 0, 100), u = nt(Number.isNaN(r) ? 1 : r, 0, 1);
    return [i, o, s, u];
  }
  return null;
};
Te.get.hwb = function(t) {
  if (!t)
    return null;
  const e = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/, n = t.match(e);
  if (n) {
    const r = Number.parseFloat(n[4]), i = (Number.parseFloat(n[1]) % 360 + 360) % 360, o = nt(Number.parseFloat(n[2]), 0, 100), s = nt(Number.parseFloat(n[3]), 0, 100), u = nt(Number.isNaN(r) ? 1 : r, 0, 1);
    return [i, o, s, u];
  }
  return null;
};
Te.to.hex = function(...t) {
  return "#" + En(t[0]) + En(t[1]) + En(t[2]) + (t[3] < 1 ? En(Math.round(t[3] * 255)) : "");
};
Te.to.rgb = function(...t) {
  return t.length < 4 || t[3] === 1 ? "rgb(" + Math.round(t[0]) + ", " + Math.round(t[1]) + ", " + Math.round(t[2]) + ")" : "rgba(" + Math.round(t[0]) + ", " + Math.round(t[1]) + ", " + Math.round(t[2]) + ", " + t[3] + ")";
};
Te.to.rgb.percent = function(...t) {
  const e = Math.round(t[0] / 255 * 100), n = Math.round(t[1] / 255 * 100), r = Math.round(t[2] / 255 * 100);
  return t.length < 4 || t[3] === 1 ? "rgb(" + e + "%, " + n + "%, " + r + "%)" : "rgba(" + e + "%, " + n + "%, " + r + "%, " + t[3] + ")";
};
Te.to.hsl = function(...t) {
  return t.length < 4 || t[3] === 1 ? "hsl(" + t[0] + ", " + t[1] + "%, " + t[2] + "%)" : "hsla(" + t[0] + ", " + t[1] + "%, " + t[2] + "%, " + t[3] + ")";
};
Te.to.hwb = function(...t) {
  let e = "";
  return t.length >= 4 && t[3] !== 1 && (e = ", " + t[3]), "hwb(" + t[0] + ", " + t[1] + "%, " + t[2] + "%" + e + ")";
};
Te.to.keyword = function(...t) {
  return yo[t.slice(0, 3)];
};
function nt(t, e, n) {
  return Math.min(Math.max(e, t), n);
}
function En(t) {
  const e = Math.round(t).toString(16).toUpperCase();
  return e.length < 2 ? "0" + e : e;
}
const bo = {};
for (const t of Object.keys(Re))
  bo[Re[t]] = t;
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
function $t(t) {
  const e = t > 31308e-7 ? 1.055 * t ** 0.4166666666666667 - 0.055 : t * 12.92;
  return Math.min(Math.max(0, e), 1);
}
function kt(t) {
  return t > 0.04045 ? ((t + 0.055) / 1.055) ** 2.4 : t / 12.92;
}
for (const t of Object.keys(P)) {
  if (!("channels" in P[t]))
    throw new Error("missing channels property: " + t);
  if (!("labels" in P[t]))
    throw new Error("missing channel labels property: " + t);
  if (P[t].labels.length !== P[t].channels)
    throw new Error("channel and label counts mismatch: " + t);
  const { channels: e, labels: n } = P[t];
  delete P[t].channels, delete P[t].labels, Object.defineProperty(P[t], "channels", { value: e }), Object.defineProperty(P[t], "labels", { value: n });
}
P.rgb.hsl = function(t) {
  const e = t[0] / 255, n = t[1] / 255, r = t[2] / 255, i = Math.min(e, n, r), o = Math.max(e, n, r), s = o - i;
  let u, a;
  switch (o) {
    case i: {
      u = 0;
      break;
    }
    case e: {
      u = (n - r) / s;
      break;
    }
    case n: {
      u = 2 + (r - e) / s;
      break;
    }
    case r: {
      u = 4 + (e - n) / s;
      break;
    }
  }
  u = Math.min(u * 60, 360), u < 0 && (u += 360);
  const h = (i + o) / 2;
  return o === i ? a = 0 : h <= 0.5 ? a = s / (o + i) : a = s / (2 - o - i), [u, a * 100, h * 100];
};
P.rgb.hsv = function(t) {
  let e, n, r, i, o;
  const s = t[0] / 255, u = t[1] / 255, a = t[2] / 255, h = Math.max(s, u, a), d = h - Math.min(s, u, a), f = function(y) {
    return (h - y) / 6 / d + 1 / 2;
  };
  if (d === 0)
    i = 0, o = 0;
  else {
    switch (o = d / h, e = f(s), n = f(u), r = f(a), h) {
      case s: {
        i = r - n;
        break;
      }
      case u: {
        i = 1 / 3 + e - r;
        break;
      }
      case a: {
        i = 2 / 3 + n - e;
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
P.rgb.hwb = function(t) {
  const e = t[0], n = t[1];
  let r = t[2];
  const i = P.rgb.hsl(t)[0], o = 1 / 255 * Math.min(e, Math.min(n, r));
  return r = 1 - 1 / 255 * Math.max(e, Math.max(n, r)), [i, o * 100, r * 100];
};
P.rgb.oklab = function(t) {
  const e = kt(t[0] / 255), n = kt(t[1] / 255), r = kt(t[2] / 255), i = Math.cbrt(0.4122214708 * e + 0.5363325363 * n + 0.0514459929 * r), o = Math.cbrt(0.2119034982 * e + 0.6806995451 * n + 0.1073969566 * r), s = Math.cbrt(0.0883024619 * e + 0.2817188376 * n + 0.6299787005 * r), u = 0.2104542553 * i + 0.793617785 * o - 0.0040720468 * s, a = 1.9779984951 * i - 2.428592205 * o + 0.4505937099 * s, h = 0.0259040371 * i + 0.7827717662 * o - 0.808675766 * s;
  return [u * 100, a * 100, h * 100];
};
P.rgb.cmyk = function(t) {
  const e = t[0] / 255, n = t[1] / 255, r = t[2] / 255, i = Math.min(1 - e, 1 - n, 1 - r), o = (1 - e - i) / (1 - i) || 0, s = (1 - n - i) / (1 - i) || 0, u = (1 - r - i) / (1 - i) || 0;
  return [o * 100, s * 100, u * 100, i * 100];
};
function Oa(t, e) {
  return (t[0] - e[0]) ** 2 + (t[1] - e[1]) ** 2 + (t[2] - e[2]) ** 2;
}
P.rgb.keyword = function(t) {
  const e = bo[t];
  if (e)
    return e;
  let n = Number.POSITIVE_INFINITY, r;
  for (const i of Object.keys(Re)) {
    const o = Re[i], s = Oa(t, o);
    s < n && (n = s, r = i);
  }
  return r;
};
P.keyword.rgb = function(t) {
  return Re[t];
};
P.rgb.xyz = function(t) {
  const e = kt(t[0] / 255), n = kt(t[1] / 255), r = kt(t[2] / 255), i = e * 0.4124564 + n * 0.3575761 + r * 0.1804375, o = e * 0.2126729 + n * 0.7151522 + r * 0.072175, s = e * 0.0193339 + n * 0.119192 + r * 0.9503041;
  return [i * 100, o * 100, s * 100];
};
P.rgb.lab = function(t) {
  const e = P.rgb.xyz(t);
  let n = e[0], r = e[1], i = e[2];
  n /= 95.047, r /= 100, i /= 108.883, n = n > qe ? n ** (1 / 3) : 7.787 * n + 16 / 116, r = r > qe ? r ** (1 / 3) : 7.787 * r + 16 / 116, i = i > qe ? i ** (1 / 3) : 7.787 * i + 16 / 116;
  const o = 116 * r - 16, s = 500 * (n - r), u = 200 * (r - i);
  return [o, s, u];
};
P.hsl.rgb = function(t) {
  const e = t[0] / 360, n = t[1] / 100, r = t[2] / 100;
  let i, o;
  if (n === 0)
    return o = r * 255, [o, o, o];
  const s = r < 0.5 ? r * (1 + n) : r + n - r * n, u = 2 * r - s, a = [0, 0, 0];
  for (let h = 0; h < 3; h++)
    i = e + 1 / 3 * -(h - 1), i < 0 && i++, i > 1 && i--, 6 * i < 1 ? o = u + (s - u) * 6 * i : 2 * i < 1 ? o = s : 3 * i < 2 ? o = u + (s - u) * (2 / 3 - i) * 6 : o = u, a[h] = o * 255;
  return a;
};
P.hsl.hsv = function(t) {
  const e = t[0];
  let n = t[1] / 100, r = t[2] / 100, i = n;
  const o = Math.max(r, 0.01);
  r *= 2, n *= r <= 1 ? r : 2 - r, i *= o <= 1 ? o : 2 - o;
  const s = (r + n) / 2, u = r === 0 ? 2 * i / (o + i) : 2 * n / (r + n);
  return [e, u * 100, s * 100];
};
P.hsv.rgb = function(t) {
  const e = t[0] / 60, n = t[1] / 100;
  let r = t[2] / 100;
  const i = Math.floor(e) % 6, o = e - Math.floor(e), s = 255 * r * (1 - n), u = 255 * r * (1 - n * o), a = 255 * r * (1 - n * (1 - o));
  switch (r *= 255, i) {
    case 0:
      return [r, a, s];
    case 1:
      return [u, r, s];
    case 2:
      return [s, r, a];
    case 3:
      return [s, u, r];
    case 4:
      return [a, s, r];
    case 5:
      return [r, s, u];
  }
};
P.hsv.hsl = function(t) {
  const e = t[0], n = t[1] / 100, r = t[2] / 100, i = Math.max(r, 0.01);
  let o, s;
  s = (2 - n) * r;
  const u = (2 - n) * i;
  return o = n * i, o /= u <= 1 ? u : 2 - u, o = o || 0, s /= 2, [e, o * 100, s * 100];
};
P.hwb.rgb = function(t) {
  const e = t[0] / 360;
  let n = t[1] / 100, r = t[2] / 100;
  const i = n + r;
  let o;
  i > 1 && (n /= i, r /= i);
  const s = Math.floor(6 * e), u = 1 - r;
  o = 6 * e - s, s & 1 && (o = 1 - o);
  const a = n + o * (u - n);
  let h, d, f;
  switch (s) {
    default:
    case 6:
    case 0: {
      h = u, d = a, f = n;
      break;
    }
    case 1: {
      h = a, d = u, f = n;
      break;
    }
    case 2: {
      h = n, d = u, f = a;
      break;
    }
    case 3: {
      h = n, d = a, f = u;
      break;
    }
    case 4: {
      h = a, d = n, f = u;
      break;
    }
    case 5: {
      h = u, d = n, f = a;
      break;
    }
  }
  return [h * 255, d * 255, f * 255];
};
P.cmyk.rgb = function(t) {
  const e = t[0] / 100, n = t[1] / 100, r = t[2] / 100, i = t[3] / 100, o = 1 - Math.min(1, e * (1 - i) + i), s = 1 - Math.min(1, n * (1 - i) + i), u = 1 - Math.min(1, r * (1 - i) + i);
  return [o * 255, s * 255, u * 255];
};
P.xyz.rgb = function(t) {
  const e = t[0] / 100, n = t[1] / 100, r = t[2] / 100;
  let i, o, s;
  return i = e * 3.2404542 + n * -1.5371385 + r * -0.4985314, o = e * -0.969266 + n * 1.8760108 + r * 0.041556, s = e * 0.0556434 + n * -0.2040259 + r * 1.0572252, i = $t(i), o = $t(o), s = $t(s), [i * 255, o * 255, s * 255];
};
P.xyz.lab = function(t) {
  let e = t[0], n = t[1], r = t[2];
  e /= 95.047, n /= 100, r /= 108.883, e = e > qe ? e ** (1 / 3) : 7.787 * e + 16 / 116, n = n > qe ? n ** (1 / 3) : 7.787 * n + 16 / 116, r = r > qe ? r ** (1 / 3) : 7.787 * r + 16 / 116;
  const i = 116 * n - 16, o = 500 * (e - n), s = 200 * (n - r);
  return [i, o, s];
};
P.xyz.oklab = function(t) {
  const e = t[0] / 100, n = t[1] / 100, r = t[2] / 100, i = Math.cbrt(0.8189330101 * e + 0.3618667424 * n - 0.1288597137 * r), o = Math.cbrt(0.0329845436 * e + 0.9293118715 * n + 0.0361456387 * r), s = Math.cbrt(0.0482003018 * e + 0.2643662691 * n + 0.633851707 * r), u = 0.2104542553 * i + 0.793617785 * o - 0.0040720468 * s, a = 1.9779984951 * i - 2.428592205 * o + 0.4505937099 * s, h = 0.0259040371 * i + 0.7827717662 * o - 0.808675766 * s;
  return [u * 100, a * 100, h * 100];
};
P.oklab.oklch = function(t) {
  return P.lab.lch(t);
};
P.oklab.xyz = function(t) {
  const e = t[0] / 100, n = t[1] / 100, r = t[2] / 100, i = (0.999999998 * e + 0.396337792 * n + 0.215803758 * r) ** 3, o = (1.000000008 * e - 0.105561342 * n - 0.063854175 * r) ** 3, s = (1.000000055 * e - 0.089484182 * n - 1.291485538 * r) ** 3, u = 1.227013851 * i - 0.55779998 * o + 0.281256149 * s, a = -0.040580178 * i + 1.11225687 * o - 0.071676679 * s, h = -0.076381285 * i - 0.421481978 * o + 1.58616322 * s;
  return [u * 100, a * 100, h * 100];
};
P.oklab.rgb = function(t) {
  const e = t[0] / 100, n = t[1] / 100, r = t[2] / 100, i = (e + 0.3963377774 * n + 0.2158037573 * r) ** 3, o = (e - 0.1055613458 * n - 0.0638541728 * r) ** 3, s = (e - 0.0894841775 * n - 1.291485548 * r) ** 3, u = $t(4.0767416621 * i - 3.3077115913 * o + 0.2309699292 * s), a = $t(-1.2684380046 * i + 2.6097574011 * o - 0.3413193965 * s), h = $t(-0.0041960863 * i - 0.7034186147 * o + 1.707614701 * s);
  return [u * 255, a * 255, h * 255];
};
P.oklch.oklab = function(t) {
  return P.lch.lab(t);
};
P.lab.xyz = function(t) {
  const e = t[0], n = t[1], r = t[2];
  let i, o, s;
  o = (e + 16) / 116, i = n / 500 + o, s = o - r / 200;
  const u = o ** 3, a = i ** 3, h = s ** 3;
  return o = u > qe ? u : (o - 16 / 116) / 7.787, i = a > qe ? a : (i - 16 / 116) / 7.787, s = h > qe ? h : (s - 16 / 116) / 7.787, i *= 95.047, o *= 100, s *= 108.883, [i, o, s];
};
P.lab.lch = function(t) {
  const e = t[0], n = t[1], r = t[2];
  let i;
  i = Math.atan2(r, n) * 360 / 2 / Math.PI, i < 0 && (i += 360);
  const s = Math.sqrt(n * n + r * r);
  return [e, s, i];
};
P.lch.lab = function(t) {
  const e = t[0], n = t[1], i = t[2] / 360 * 2 * Math.PI, o = n * Math.cos(i), s = n * Math.sin(i);
  return [e, o, s];
};
P.rgb.ansi16 = function(t, e = null) {
  const [n, r, i] = t;
  let o = e === null ? P.rgb.hsv(t)[2] : e;
  if (o = Math.round(o / 50), o === 0)
    return 30;
  let s = 30 + (Math.round(i / 255) << 2 | Math.round(r / 255) << 1 | Math.round(n / 255));
  return o === 2 && (s += 60), s;
};
P.hsv.ansi16 = function(t) {
  return P.rgb.ansi16(P.hsv.rgb(t), t[2]);
};
P.rgb.ansi256 = function(t) {
  const e = t[0], n = t[1], r = t[2];
  return e >> 4 === n >> 4 && n >> 4 === r >> 4 ? e < 8 ? 16 : e > 248 ? 231 : Math.round((e - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(e / 255 * 5) + 6 * Math.round(n / 255 * 5) + Math.round(r / 255 * 5);
};
P.ansi16.rgb = function(t) {
  t = t[0];
  let e = t % 10;
  if (e === 0 || e === 7)
    return t > 50 && (e += 3.5), e = e / 10.5 * 255, [e, e, e];
  const n = (Math.trunc(t > 50) + 1) * 0.5, r = (e & 1) * n * 255, i = (e >> 1 & 1) * n * 255, o = (e >> 2 & 1) * n * 255;
  return [r, i, o];
};
P.ansi256.rgb = function(t) {
  if (t = t[0], t >= 232) {
    const o = (t - 232) * 10 + 8;
    return [o, o, o];
  }
  t -= 16;
  let e;
  const n = Math.floor(t / 36) / 5 * 255, r = Math.floor((e = t % 36) / 6) / 5 * 255, i = e % 6 / 5 * 255;
  return [n, r, i];
};
P.rgb.hex = function(t) {
  const n = (((Math.round(t[0]) & 255) << 16) + ((Math.round(t[1]) & 255) << 8) + (Math.round(t[2]) & 255)).toString(16).toUpperCase();
  return "000000".slice(n.length) + n;
};
P.hex.rgb = function(t) {
  const e = t.toString(16).match(/[a-f\d]{6}|[a-f\d]{3}/i);
  if (!e)
    return [0, 0, 0];
  let n = e[0];
  e[0].length === 3 && (n = [...n].map((u) => u + u).join(""));
  const r = Number.parseInt(n, 16), i = r >> 16 & 255, o = r >> 8 & 255, s = r & 255;
  return [i, o, s];
};
P.rgb.hcg = function(t) {
  const e = t[0] / 255, n = t[1] / 255, r = t[2] / 255, i = Math.max(Math.max(e, n), r), o = Math.min(Math.min(e, n), r), s = i - o;
  let u;
  const a = s < 1 ? o / (1 - s) : 0;
  return s <= 0 ? u = 0 : i === e ? u = (n - r) / s % 6 : i === n ? u = 2 + (r - e) / s : u = 4 + (e - n) / s, u /= 6, u %= 1, [u * 360, s * 100, a * 100];
};
P.hsl.hcg = function(t) {
  const e = t[1] / 100, n = t[2] / 100, r = n < 0.5 ? 2 * e * n : 2 * e * (1 - n);
  let i = 0;
  return r < 1 && (i = (n - 0.5 * r) / (1 - r)), [t[0], r * 100, i * 100];
};
P.hsv.hcg = function(t) {
  const e = t[1] / 100, n = t[2] / 100, r = e * n;
  let i = 0;
  return r < 1 && (i = (n - r) / (1 - r)), [t[0], r * 100, i * 100];
};
P.hcg.rgb = function(t) {
  const e = t[0] / 360, n = t[1] / 100, r = t[2] / 100;
  if (n === 0)
    return [r * 255, r * 255, r * 255];
  const i = [0, 0, 0], o = e % 1 * 6, s = o % 1, u = 1 - s;
  let a = 0;
  switch (Math.floor(o)) {
    case 0: {
      i[0] = 1, i[1] = s, i[2] = 0;
      break;
    }
    case 1: {
      i[0] = u, i[1] = 1, i[2] = 0;
      break;
    }
    case 2: {
      i[0] = 0, i[1] = 1, i[2] = s;
      break;
    }
    case 3: {
      i[0] = 0, i[1] = u, i[2] = 1;
      break;
    }
    case 4: {
      i[0] = s, i[1] = 0, i[2] = 1;
      break;
    }
    default:
      i[0] = 1, i[1] = 0, i[2] = u;
  }
  return a = (1 - n) * r, [
    (n * i[0] + a) * 255,
    (n * i[1] + a) * 255,
    (n * i[2] + a) * 255
  ];
};
P.hcg.hsv = function(t) {
  const e = t[1] / 100, n = t[2] / 100, r = e + n * (1 - e);
  let i = 0;
  return r > 0 && (i = e / r), [t[0], i * 100, r * 100];
};
P.hcg.hsl = function(t) {
  const e = t[1] / 100, r = t[2] / 100 * (1 - e) + 0.5 * e;
  let i = 0;
  return r > 0 && r < 0.5 ? i = e / (2 * r) : r >= 0.5 && r < 1 && (i = e / (2 * (1 - r))), [t[0], i * 100, r * 100];
};
P.hcg.hwb = function(t) {
  const e = t[1] / 100, n = t[2] / 100, r = e + n * (1 - e);
  return [t[0], (r - e) * 100, (1 - r) * 100];
};
P.hwb.hcg = function(t) {
  const e = t[1] / 100, r = 1 - t[2] / 100, i = r - e;
  let o = 0;
  return i < 1 && (o = (r - i) / (1 - i)), [t[0], i * 100, o * 100];
};
P.apple.rgb = function(t) {
  return [t[0] / 65535 * 255, t[1] / 65535 * 255, t[2] / 65535 * 255];
};
P.rgb.apple = function(t) {
  return [t[0] / 255 * 65535, t[1] / 255 * 65535, t[2] / 255 * 65535];
};
P.gray.rgb = function(t) {
  return [t[0] / 100 * 255, t[0] / 100 * 255, t[0] / 100 * 255];
};
P.gray.hsl = function(t) {
  return [0, 0, t[0]];
};
P.gray.hsv = P.gray.hsl;
P.gray.hwb = function(t) {
  return [0, 100, t[0]];
};
P.gray.cmyk = function(t) {
  return [0, 0, 0, t[0]];
};
P.gray.lab = function(t) {
  return [t[0], 0, 0];
};
P.gray.hex = function(t) {
  const e = Math.round(t[0] / 100 * 255) & 255, r = ((e << 16) + (e << 8) + e).toString(16).toUpperCase();
  return "000000".slice(r.length) + r;
};
P.rgb.gray = function(t) {
  return [(t[0] + t[1] + t[2]) / 3 / 255 * 100];
};
function Fa() {
  const t = {}, e = Object.keys(P);
  for (let { length: n } = e, r = 0; r < n; r++)
    t[e[r]] = {
      // http://jsperf.com/1-vs-infinity
      // micro-opt, but this is simple.
      distance: -1,
      parent: null
    };
  return t;
}
function Za(t) {
  const e = Fa(), n = [t];
  for (e[t].distance = 0; n.length > 0; ) {
    const r = n.pop(), i = Object.keys(P[r]);
    for (let { length: o } = i, s = 0; s < o; s++) {
      const u = i[s], a = e[u];
      a.distance === -1 && (a.distance = e[r].distance + 1, a.parent = r, n.unshift(u));
    }
  }
  return e;
}
function La(t, e) {
  return function(n) {
    return e(t(n));
  };
}
function Ra(t, e) {
  const n = [e[t].parent, t];
  let r = P[e[t].parent][t], i = e[t].parent;
  for (; e[i].parent; )
    n.unshift(e[i].parent), r = La(P[e[i].parent][i], r), i = e[i].parent;
  return r.conversion = n, r;
}
function ja(t) {
  const e = Za(t), n = {}, r = Object.keys(e);
  for (let { length: i } = r, o = 0; o < i; o++) {
    const s = r[o];
    e[s].parent !== null && (n[s] = Ra(s, e));
  }
  return n;
}
const Xe = {}, Ba = Object.keys(P);
function Da(t) {
  const e = function(...n) {
    const r = n[0];
    return r == null ? r : (r.length > 1 && (n = r), t(n));
  };
  return "conversion" in t && (e.conversion = t.conversion), e;
}
function Ua(t) {
  const e = function(...n) {
    const r = n[0];
    if (r == null)
      return r;
    r.length > 1 && (n = r);
    const i = t(n);
    if (typeof i == "object")
      for (let { length: o } = i, s = 0; s < o; s++)
        i[s] = Math.round(i[s]);
    return i;
  };
  return "conversion" in t && (e.conversion = t.conversion), e;
}
for (const t of Ba) {
  Xe[t] = {}, Object.defineProperty(Xe[t], "channels", { value: P[t].channels }), Object.defineProperty(Xe[t], "labels", { value: P[t].labels });
  const e = ja(t), n = Object.keys(e);
  for (const r of n) {
    const i = e[r];
    Xe[t][r] = Ua(i), Xe[t][r].raw = Da(i);
  }
}
function T(t, e, n) {
  function r(u, a) {
    var h;
    Object.defineProperty(u, "_zod", {
      value: u._zod ?? {},
      enumerable: !1
    }), (h = u._zod).traits ?? (h.traits = /* @__PURE__ */ new Set()), u._zod.traits.add(t), e(u, a);
    for (const d in s.prototype)
      Object.defineProperty(u, d, { value: s.prototype[d].bind(u) });
    u._zod.constr = s, u._zod.def = a;
  }
  const i = (n == null ? void 0 : n.Parent) ?? Object;
  class o extends i {
  }
  Object.defineProperty(o, "name", { value: t });
  function s(u) {
    var a;
    const h = n != null && n.Parent ? new o() : this;
    r(h, u), (a = h._zod).deferred ?? (a.deferred = []);
    for (const d of h._zod.deferred)
      d();
    return h;
  }
  return Object.defineProperty(s, "init", { value: r }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (u) => {
      var a, h;
      return n != null && n.Parent && u instanceof n.Parent ? !0 : (h = (a = u == null ? void 0 : u._zod) == null ? void 0 : a.traits) == null ? void 0 : h.has(t);
    }
  }), Object.defineProperty(s, "name", { value: t }), s;
}
class Xt extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
const kr = {};
function ht(t) {
  return t && Object.assign(kr, t), kr;
}
function qa(t, e) {
  return typeof e == "bigint" ? e.toString() : e;
}
function wo(t) {
  return {
    get value() {
      {
        const e = t();
        return Object.defineProperty(this, "value", { value: e }), e;
      }
    }
  };
}
function Ar(t) {
  return t == null;
}
function Ir(t) {
  const e = t.startsWith("^") ? 1 : 0, n = t.endsWith("$") ? t.length - 1 : t.length;
  return t.slice(e, n);
}
function Ga(t, e) {
  const n = (t.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, i = n > r ? n : r, o = Number.parseInt(t.toFixed(i).replace(".", "")), s = Number.parseInt(e.toFixed(i).replace(".", ""));
  return o % s / 10 ** i;
}
function fe(t, e, n) {
  Object.defineProperty(t, e, {
    get() {
      {
        const r = n();
        return t[e] = r, r;
      }
    },
    set(r) {
      Object.defineProperty(t, e, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function Un(t, e, n) {
  Object.defineProperty(t, e, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function xo(t = 10) {
  const e = "abcdefghijklmnopqrstuvwxyz";
  let n = "";
  for (let r = 0; r < t; r++)
    n += e[Math.floor(Math.random() * e.length)];
  return n;
}
function Bt(t) {
  return JSON.stringify(t);
}
function Ha(t) {
  return typeof t == "object" && t !== null;
}
const Ka = wo(() => {
  try {
    const t = Function;
    return new t(""), !0;
  } catch {
    return !1;
  }
});
function vi(t) {
  return typeof t == "object" && t !== null && Object.getPrototypeOf(t) === Object.prototype;
}
const Va = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function en(t) {
  return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function pt(t, e, n) {
  const r = new t._zod.constr(e ?? t._zod.def);
  return (!e || n != null && n.parent) && (r._zod.parent = t), r;
}
function U(t) {
  const e = t;
  if (!e)
    return {};
  if (typeof e == "string")
    return { error: () => e };
  if ((e == null ? void 0 : e.message) !== void 0) {
    if ((e == null ? void 0 : e.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    e.error = e.message;
  }
  return delete e.message, typeof e.error == "string" ? { ...e, error: () => e.error } : e;
}
function Wa(t) {
  return Object.keys(t).filter((e) => t[e]._zod.optin === "optional");
}
const Qa = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Ja(t, e) {
  const n = {}, r = t._zod.def;
  for (const i in e) {
    if (!(i in r.shape))
      throw new Error(`Unrecognized key: "${i}"`);
    e[i] && (n[i] = r.shape[i]);
  }
  return pt(t, {
    ...t._zod.def,
    shape: n,
    checks: []
  });
}
function Ya(t, e) {
  const n = { ...t._zod.def.shape }, r = t._zod.def;
  for (const i in e) {
    if (!(i in r.shape))
      throw new Error(`Unrecognized key: "${i}"`);
    e[i] && delete n[i];
  }
  return pt(t, {
    ...t._zod.def,
    shape: n,
    checks: []
  });
}
function Xa(t, e) {
  const n = {
    ...t._zod.def,
    get shape() {
      const r = { ...t._zod.def.shape, ...e };
      return Un(this, "shape", r), r;
    },
    checks: []
    // delete existing checks
  };
  return pt(t, n);
}
function eu(t, e) {
  return pt(t, {
    ...t._zod.def,
    get shape() {
      const n = { ...t._zod.def.shape, ...e._zod.def.shape };
      return Un(this, "shape", n), n;
    },
    catchall: e._zod.def.catchall,
    checks: []
    // delete existing checks
  });
}
function tu(t, e, n) {
  const r = e._zod.def.shape, i = { ...r };
  if (n)
    for (const o in n) {
      if (!(o in r))
        throw new Error(`Unrecognized key: "${o}"`);
      n[o] && (i[o] = t ? new t({
        type: "optional",
        innerType: r[o]
      }) : r[o]);
    }
  else
    for (const o in r)
      i[o] = t ? new t({
        type: "optional",
        innerType: r[o]
      }) : r[o];
  return pt(e, {
    ...e._zod.def,
    shape: i,
    checks: []
  });
}
function nu(t, e, n) {
  const r = e._zod.def.shape, i = { ...r };
  if (n)
    for (const o in n) {
      if (!(o in i))
        throw new Error(`Unrecognized key: "${o}"`);
      n[o] && (i[o] = new t({
        type: "nonoptional",
        innerType: r[o]
      }));
    }
  else
    for (const o in r)
      i[o] = new t({
        type: "nonoptional",
        innerType: r[o]
      });
  return pt(e, {
    ...e._zod.def,
    shape: i,
    // optional: [],
    checks: []
  });
}
function Kt(t, e = 0) {
  for (let n = e; n < t.issues.length; n++)
    if (t.issues[n].continue !== !0)
      return !0;
  return !1;
}
function Pr(t, e) {
  return e.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(t), n;
  });
}
function Nn(t) {
  return typeof t == "string" ? t : t == null ? void 0 : t.message;
}
function lt(t, e, n) {
  var i, o, s, u, a, h;
  const r = { ...t, path: t.path ?? [] };
  if (!t.message) {
    const d = Nn((s = (o = (i = t.inst) == null ? void 0 : i._zod.def) == null ? void 0 : o.error) == null ? void 0 : s.call(o, t)) ?? Nn((u = e == null ? void 0 : e.error) == null ? void 0 : u.call(e, t)) ?? Nn((a = n.customError) == null ? void 0 : a.call(n, t)) ?? Nn((h = n.localeError) == null ? void 0 : h.call(n, t)) ?? "Invalid input";
    r.message = d;
  }
  return delete r.inst, delete r.continue, e != null && e.reportInput || delete r.input, r;
}
function Or(t) {
  return Array.isArray(t) ? "array" : typeof t == "string" ? "string" : "unknown";
}
function tn(...t) {
  const [e, n, r] = t;
  return typeof e == "string" ? {
    message: e,
    code: "custom",
    input: n,
    inst: r
  } : { ...e };
}
const $o = (t, e) => {
  t.name = "$ZodError", Object.defineProperty(t, "_zod", {
    value: t._zod,
    enumerable: !1
  }), Object.defineProperty(t, "issues", {
    value: e,
    enumerable: !1
  }), Object.defineProperty(t, "message", {
    get() {
      return JSON.stringify(e, qa, 2);
    },
    enumerable: !0
    // configurable: false,
  });
}, ko = T("$ZodError", $o), Eo = T("$ZodError", $o, { Parent: Error });
function ru(t, e = (n) => n.message) {
  const n = {}, r = [];
  for (const i of t.issues)
    i.path.length > 0 ? (n[i.path[0]] = n[i.path[0]] || [], n[i.path[0]].push(e(i))) : r.push(e(i));
  return { formErrors: r, fieldErrors: n };
}
function iu(t, e) {
  const n = e || function(o) {
    return o.message;
  }, r = { _errors: [] }, i = (o) => {
    for (const s of o.issues)
      if (s.code === "invalid_union")
        s.errors.map((u) => i({ issues: u }));
      else if (s.code === "invalid_key")
        i({ issues: s.issues });
      else if (s.code === "invalid_element")
        i({ issues: s.issues });
      else if (s.path.length === 0)
        r._errors.push(n(s));
      else {
        let u = r, a = 0;
        for (; a < s.path.length; ) {
          const h = s.path[a];
          a === s.path.length - 1 ? (u[h] = u[h] || { _errors: [] }, u[h]._errors.push(n(s))) : u[h] = u[h] || { _errors: [] }, u = u[h], a++;
        }
      }
  };
  return i(t), r;
}
const ou = (t) => (e, n, r, i) => {
  const o = r ? Object.assign(r, { async: !1 }) : { async: !1 }, s = e._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise)
    throw new Xt();
  if (s.issues.length) {
    const u = new ((i == null ? void 0 : i.Err) ?? t)(s.issues.map((a) => lt(a, o, ht())));
    throw Error.captureStackTrace(u, i == null ? void 0 : i.callee), u;
  }
  return s.value;
}, su = (t) => async (e, n, r, i) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let s = e._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const u = new ((i == null ? void 0 : i.Err) ?? t)(s.issues.map((a) => lt(a, o, ht())));
    throw Error.captureStackTrace(u, i == null ? void 0 : i.callee), u;
  }
  return s.value;
}, No = (t) => (e, n, r) => {
  const i = r ? { ...r, async: !1 } : { async: !1 }, o = e._zod.run({ value: n, issues: [] }, i);
  if (o instanceof Promise)
    throw new Xt();
  return o.issues.length ? {
    success: !1,
    error: new (t ?? ko)(o.issues.map((s) => lt(s, i, ht())))
  } : { success: !0, data: o.value };
}, au = /* @__PURE__ */ No(Eo), To = (t) => async (e, n, r) => {
  const i = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let o = e._zod.run({ value: n, issues: [] }, i);
  return o instanceof Promise && (o = await o), o.issues.length ? {
    success: !1,
    error: new t(o.issues.map((s) => lt(s, i, ht())))
  } : { success: !0, data: o.value };
}, uu = /* @__PURE__ */ To(Eo), cu = /^[cC][^\s-]{8,}$/, hu = /^[0-9a-z]+$/, lu = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, du = /^[0-9a-vA-V]{20}$/, fu = /^[A-Za-z0-9]{27}$/, pu = /^[a-zA-Z0-9_-]{21}$/, gu = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, vu = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, _i = (t) => t ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${t}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/, _u = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, mu = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function yu() {
  return new RegExp(mu, "u");
}
const bu = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, wu = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, xu = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, $u = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, ku = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Mo = /^[A-Za-z0-9_-]*$/, fr = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, Eu = /^\+(?:[0-9]){6,14}[0-9]$/, zo = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", Nu = new RegExp(`^${zo}$`);
function So(t) {
  let e = "([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d";
  return t.precision ? e = `${e}\\.\\d{${t.precision}}` : t.precision == null && (e = `${e}(\\.\\d+)?`), e;
}
function Tu(t) {
  return new RegExp(`^${So(t)}$`);
}
function Mu(t) {
  let e = `${zo}T${So(t)}`;
  const n = [];
  return n.push(t.local ? "Z?" : "Z"), t.offset && n.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${n.join("|")})`, new RegExp(`^${e}$`);
}
const zu = (t) => {
  const e = t ? `[\\s\\S]{${(t == null ? void 0 : t.minimum) ?? 0},${(t == null ? void 0 : t.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${e}$`);
}, Su = /^\d+$/, Cu = /^-?\d+(?:\.\d+)?/i, Au = /true|false/i, Iu = /^[^A-Z]*$/, Pu = /^[^a-z]*$/, Me = /* @__PURE__ */ T("$ZodCheck", (t, e) => {
  var n;
  t._zod ?? (t._zod = {}), t._zod.def = e, (n = t._zod).onattach ?? (n.onattach = []);
}), Co = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Ao = /* @__PURE__ */ T("$ZodCheckLessThan", (t, e) => {
  Me.init(t, e);
  const n = Co[typeof e.value];
  t._zod.onattach.push((r) => {
    const i = r._zod.bag, o = (e.inclusive ? i.maximum : i.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    e.value < o && (e.inclusive ? i.maximum = e.value : i.exclusiveMaximum = e.value);
  }), t._zod.check = (r) => {
    (e.inclusive ? r.value <= e.value : r.value < e.value) || r.issues.push({
      origin: n,
      code: "too_big",
      maximum: e.value,
      input: r.value,
      inclusive: e.inclusive,
      inst: t,
      continue: !e.abort
    });
  };
}), Io = /* @__PURE__ */ T("$ZodCheckGreaterThan", (t, e) => {
  Me.init(t, e);
  const n = Co[typeof e.value];
  t._zod.onattach.push((r) => {
    const i = r._zod.bag, o = (e.inclusive ? i.minimum : i.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    e.value > o && (e.inclusive ? i.minimum = e.value : i.exclusiveMinimum = e.value);
  }), t._zod.check = (r) => {
    (e.inclusive ? r.value >= e.value : r.value > e.value) || r.issues.push({
      origin: n,
      code: "too_small",
      minimum: e.value,
      input: r.value,
      inclusive: e.inclusive,
      inst: t,
      continue: !e.abort
    });
  };
}), Ou = /* @__PURE__ */ T("$ZodCheckMultipleOf", (t, e) => {
  Me.init(t, e), t._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = e.value);
  }), t._zod.check = (n) => {
    if (typeof n.value != typeof e.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % e.value === BigInt(0) : Ga(n.value, e.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: e.value,
      input: n.value,
      inst: t,
      continue: !e.abort
    });
  };
}), Fu = /* @__PURE__ */ T("$ZodCheckNumberFormat", (t, e) => {
  var s;
  Me.init(t, e), e.format = e.format || "float64";
  const n = (s = e.format) == null ? void 0 : s.includes("int"), r = n ? "int" : "number", [i, o] = Qa[e.format];
  t._zod.onattach.push((u) => {
    const a = u._zod.bag;
    a.format = e.format, a.minimum = i, a.maximum = o, n && (a.pattern = Su);
  }), t._zod.check = (u) => {
    const a = u.value;
    if (n) {
      if (!Number.isInteger(a)) {
        u.issues.push({
          expected: r,
          format: e.format,
          code: "invalid_type",
          input: a,
          inst: t
        });
        return;
      }
      if (!Number.isSafeInteger(a)) {
        a > 0 ? u.issues.push({
          input: a,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: t,
          origin: r,
          continue: !e.abort
        }) : u.issues.push({
          input: a,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: t,
          origin: r,
          continue: !e.abort
        });
        return;
      }
    }
    a < i && u.issues.push({
      origin: "number",
      input: a,
      code: "too_small",
      minimum: i,
      inclusive: !0,
      inst: t,
      continue: !e.abort
    }), a > o && u.issues.push({
      origin: "number",
      input: a,
      code: "too_big",
      maximum: o,
      inst: t
    });
  };
}), Zu = /* @__PURE__ */ T("$ZodCheckMaxLength", (t, e) => {
  Me.init(t, e), t._zod.when = (n) => {
    const r = n.value;
    return !Ar(r) && r.length !== void 0;
  }, t._zod.onattach.push((n) => {
    const r = n._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    e.maximum < r && (n._zod.bag.maximum = e.maximum);
  }), t._zod.check = (n) => {
    const r = n.value;
    if (r.length <= e.maximum)
      return;
    const o = Or(r);
    n.issues.push({
      origin: o,
      code: "too_big",
      maximum: e.maximum,
      input: r,
      inst: t,
      continue: !e.abort
    });
  };
}), Lu = /* @__PURE__ */ T("$ZodCheckMinLength", (t, e) => {
  Me.init(t, e), t._zod.when = (n) => {
    const r = n.value;
    return !Ar(r) && r.length !== void 0;
  }, t._zod.onattach.push((n) => {
    const r = n._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    e.minimum > r && (n._zod.bag.minimum = e.minimum);
  }), t._zod.check = (n) => {
    const r = n.value;
    if (r.length >= e.minimum)
      return;
    const o = Or(r);
    n.issues.push({
      origin: o,
      code: "too_small",
      minimum: e.minimum,
      input: r,
      inst: t,
      continue: !e.abort
    });
  };
}), Ru = /* @__PURE__ */ T("$ZodCheckLengthEquals", (t, e) => {
  Me.init(t, e), t._zod.when = (n) => {
    const r = n.value;
    return !Ar(r) && r.length !== void 0;
  }, t._zod.onattach.push((n) => {
    const r = n._zod.bag;
    r.minimum = e.length, r.maximum = e.length, r.length = e.length;
  }), t._zod.check = (n) => {
    const r = n.value, i = r.length;
    if (i === e.length)
      return;
    const o = Or(r), s = i > e.length;
    n.issues.push({
      origin: o,
      ...s ? { code: "too_big", maximum: e.length } : { code: "too_small", minimum: e.length },
      input: n.value,
      inst: t,
      continue: !e.abort
    });
  };
}), qn = /* @__PURE__ */ T("$ZodCheckStringFormat", (t, e) => {
  var n;
  Me.init(t, e), t._zod.onattach.push((r) => {
    r._zod.bag.format = e.format, e.pattern && (r._zod.bag.pattern = e.pattern);
  }), (n = t._zod).check ?? (n.check = (r) => {
    if (!e.pattern)
      throw new Error("Not implemented.");
    e.pattern.lastIndex = 0, !e.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: e.format,
      input: r.value,
      ...e.pattern ? { pattern: e.pattern.toString() } : {},
      inst: t,
      continue: !e.abort
    });
  });
}), ju = /* @__PURE__ */ T("$ZodCheckRegex", (t, e) => {
  qn.init(t, e), t._zod.check = (n) => {
    e.pattern.lastIndex = 0, !e.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: e.pattern.toString(),
      inst: t,
      continue: !e.abort
    });
  };
}), Bu = /* @__PURE__ */ T("$ZodCheckLowerCase", (t, e) => {
  e.pattern ?? (e.pattern = Iu), qn.init(t, e);
}), Du = /* @__PURE__ */ T("$ZodCheckUpperCase", (t, e) => {
  e.pattern ?? (e.pattern = Pu), qn.init(t, e);
}), Uu = /* @__PURE__ */ T("$ZodCheckIncludes", (t, e) => {
  Me.init(t, e);
  const n = new RegExp(en(e.includes));
  e.pattern = n, t._zod.onattach.push((r) => {
    r._zod.bag.pattern = n;
  }), t._zod.check = (r) => {
    r.value.includes(e.includes, e.position) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: e.includes,
      input: r.value,
      inst: t,
      continue: !e.abort
    });
  };
}), qu = /* @__PURE__ */ T("$ZodCheckStartsWith", (t, e) => {
  Me.init(t, e);
  const n = new RegExp(`^${en(e.prefix)}.*`);
  e.pattern ?? (e.pattern = n), t._zod.onattach.push((r) => {
    r._zod.bag.pattern = n;
  }), t._zod.check = (r) => {
    r.value.startsWith(e.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: e.prefix,
      input: r.value,
      inst: t,
      continue: !e.abort
    });
  };
}), Gu = /* @__PURE__ */ T("$ZodCheckEndsWith", (t, e) => {
  Me.init(t, e);
  const n = new RegExp(`.*${en(e.suffix)}$`);
  e.pattern ?? (e.pattern = n), t._zod.onattach.push((r) => {
    r._zod.bag.pattern = new RegExp(`.*${en(e.suffix)}$`);
  }), t._zod.check = (r) => {
    r.value.endsWith(e.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: e.suffix,
      input: r.value,
      inst: t,
      continue: !e.abort
    });
  };
}), Hu = /* @__PURE__ */ T("$ZodCheckOverwrite", (t, e) => {
  Me.init(t, e), t._zod.check = (n) => {
    n.value = e.tx(n.value);
  };
});
class Ku {
  constructor(e = []) {
    this.content = [], this.indent = 0, this && (this.args = e);
  }
  indented(e) {
    this.indent += 1, e(this), this.indent -= 1;
  }
  write(e) {
    if (typeof e == "function") {
      e(this, { execution: "sync" }), e(this, { execution: "async" });
      return;
    }
    const r = e.split(`
`).filter((s) => s), i = Math.min(...r.map((s) => s.length - s.trimStart().length)), o = r.map((s) => s.slice(i)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of o)
      this.content.push(s);
  }
  compile() {
    const e = Function, n = this == null ? void 0 : this.args, i = [...((this == null ? void 0 : this.content) ?? [""]).map((o) => `  ${o}`)];
    return new e(...n, i.join(`
`));
  }
}
const Vu = {
  major: 4,
  minor: 0,
  patch: 0
}, pe = /* @__PURE__ */ T("$ZodType", (t, e) => {
  var i;
  var n;
  t ?? (t = {}), t._zod.id = e.type + "_" + xo(10), t._zod.def = e, t._zod.bag = t._zod.bag || {}, t._zod.version = Vu;
  const r = [...t._zod.def.checks ?? []];
  t._zod.traits.has("$ZodCheck") && r.unshift(t);
  for (const o of r)
    for (const s of o._zod.onattach)
      s(t);
  if (r.length === 0)
    (n = t._zod).deferred ?? (n.deferred = []), (i = t._zod.deferred) == null || i.push(() => {
      t._zod.run = t._zod.parse;
    });
  else {
    const o = (s, u, a) => {
      let h = Kt(s), d;
      for (const f of u) {
        if (f._zod.when) {
          if (!f._zod.when(s))
            continue;
        } else if (h)
          continue;
        const y = s.issues.length, b = f._zod.check(s);
        if (b instanceof Promise && (a == null ? void 0 : a.async) === !1)
          throw new Xt();
        if (d || b instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await b, s.issues.length !== y && (h || (h = Kt(s, y)));
          });
        else {
          if (s.issues.length === y)
            continue;
          h || (h = Kt(s, y));
        }
      }
      return d ? d.then(() => s) : s;
    };
    t._zod.run = (s, u) => {
      const a = t._zod.parse(s, u);
      if (a instanceof Promise) {
        if (u.async === !1)
          throw new Xt();
        return a.then((h) => o(h, r, u));
      }
      return o(a, r, u);
    };
  }
  t["~standard"] = {
    validate: (o) => {
      var s;
      try {
        const u = au(t, o);
        return u.success ? { value: u.data } : { issues: (s = u.error) == null ? void 0 : s.issues };
      } catch {
        return uu(t, o).then((a) => {
          var h;
          return a.success ? { value: a.data } : { issues: (h = a.error) == null ? void 0 : h.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), Fr = /* @__PURE__ */ T("$ZodString", (t, e) => {
  var n;
  pe.init(t, e), t._zod.pattern = ((n = t == null ? void 0 : t._zod.bag) == null ? void 0 : n.pattern) ?? zu(t._zod.bag), t._zod.parse = (r, i) => {
    if (e.coerce)
      try {
        r.value = String(r.value);
      } catch {
      }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: t
    }), r;
  };
}), he = /* @__PURE__ */ T("$ZodStringFormat", (t, e) => {
  qn.init(t, e), Fr.init(t, e);
}), Wu = /* @__PURE__ */ T("$ZodGUID", (t, e) => {
  e.pattern ?? (e.pattern = vu), he.init(t, e);
}), Qu = /* @__PURE__ */ T("$ZodUUID", (t, e) => {
  if (e.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[e.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${e.version}"`);
    e.pattern ?? (e.pattern = _i(r));
  } else
    e.pattern ?? (e.pattern = _i());
  he.init(t, e);
}), Ju = /* @__PURE__ */ T("$ZodEmail", (t, e) => {
  e.pattern ?? (e.pattern = _u), he.init(t, e);
}), Yu = /* @__PURE__ */ T("$ZodURL", (t, e) => {
  he.init(t, e), t._zod.check = (n) => {
    try {
      const r = new URL(n.value);
      fr.lastIndex = 0, fr.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: fr.source,
        input: n.value,
        inst: t
      }), e.hostname && (e.hostname.lastIndex = 0, e.hostname.test(r.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: e.hostname.source,
        input: n.value,
        inst: t
      })), e.protocol && (e.protocol.lastIndex = 0, e.protocol.test(r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: e.protocol.source,
        input: n.value,
        inst: t
      }));
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: t
      });
    }
  };
}), Xu = /* @__PURE__ */ T("$ZodEmoji", (t, e) => {
  e.pattern ?? (e.pattern = yu()), he.init(t, e);
}), ec = /* @__PURE__ */ T("$ZodNanoID", (t, e) => {
  e.pattern ?? (e.pattern = pu), he.init(t, e);
}), tc = /* @__PURE__ */ T("$ZodCUID", (t, e) => {
  e.pattern ?? (e.pattern = cu), he.init(t, e);
}), nc = /* @__PURE__ */ T("$ZodCUID2", (t, e) => {
  e.pattern ?? (e.pattern = hu), he.init(t, e);
}), rc = /* @__PURE__ */ T("$ZodULID", (t, e) => {
  e.pattern ?? (e.pattern = lu), he.init(t, e);
}), ic = /* @__PURE__ */ T("$ZodXID", (t, e) => {
  e.pattern ?? (e.pattern = du), he.init(t, e);
}), oc = /* @__PURE__ */ T("$ZodKSUID", (t, e) => {
  e.pattern ?? (e.pattern = fu), he.init(t, e);
}), sc = /* @__PURE__ */ T("$ZodISODateTime", (t, e) => {
  e.pattern ?? (e.pattern = Mu(e)), he.init(t, e);
}), ac = /* @__PURE__ */ T("$ZodISODate", (t, e) => {
  e.pattern ?? (e.pattern = Nu), he.init(t, e);
}), uc = /* @__PURE__ */ T("$ZodISOTime", (t, e) => {
  e.pattern ?? (e.pattern = Tu(e)), he.init(t, e);
}), cc = /* @__PURE__ */ T("$ZodISODuration", (t, e) => {
  e.pattern ?? (e.pattern = gu), he.init(t, e);
}), hc = /* @__PURE__ */ T("$ZodIPv4", (t, e) => {
  e.pattern ?? (e.pattern = bu), he.init(t, e), t._zod.onattach.push((n) => {
    n._zod.bag.format = "ipv4";
  });
}), lc = /* @__PURE__ */ T("$ZodIPv6", (t, e) => {
  e.pattern ?? (e.pattern = wu), he.init(t, e), t._zod.onattach.push((n) => {
    n._zod.bag.format = "ipv6";
  }), t._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: t
      });
    }
  };
}), dc = /* @__PURE__ */ T("$ZodCIDRv4", (t, e) => {
  e.pattern ?? (e.pattern = xu), he.init(t, e);
}), fc = /* @__PURE__ */ T("$ZodCIDRv6", (t, e) => {
  e.pattern ?? (e.pattern = $u), he.init(t, e), t._zod.check = (n) => {
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
        inst: t
      });
    }
  };
});
function Po(t) {
  if (t === "")
    return !0;
  if (t.length % 4 !== 0)
    return !1;
  try {
    return atob(t), !0;
  } catch {
    return !1;
  }
}
const pc = /* @__PURE__ */ T("$ZodBase64", (t, e) => {
  e.pattern ?? (e.pattern = ku), he.init(t, e), t._zod.onattach.push((n) => {
    n._zod.bag.contentEncoding = "base64";
  }), t._zod.check = (n) => {
    Po(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: t
    });
  };
});
function gc(t) {
  if (!Mo.test(t))
    return !1;
  const e = t.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = e.padEnd(Math.ceil(e.length / 4) * 4, "=");
  return Po(n);
}
const vc = /* @__PURE__ */ T("$ZodBase64URL", (t, e) => {
  e.pattern ?? (e.pattern = Mo), he.init(t, e), t._zod.onattach.push((n) => {
    n._zod.bag.contentEncoding = "base64url";
  }), t._zod.check = (n) => {
    gc(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: t
    });
  };
}), _c = /* @__PURE__ */ T("$ZodE164", (t, e) => {
  e.pattern ?? (e.pattern = Eu), he.init(t, e);
});
function mc(t, e = null) {
  try {
    const n = t.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n, i = JSON.parse(atob(r));
    return !("typ" in i && (i == null ? void 0 : i.typ) !== "JWT" || !i.alg || e && (!("alg" in i) || i.alg !== e));
  } catch {
    return !1;
  }
}
const yc = /* @__PURE__ */ T("$ZodJWT", (t, e) => {
  he.init(t, e), t._zod.check = (n) => {
    mc(n.value, e.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: t
    });
  };
}), Oo = /* @__PURE__ */ T("$ZodNumber", (t, e) => {
  pe.init(t, e), t._zod.pattern = t._zod.bag.pattern ?? Cu, t._zod.parse = (n, r) => {
    if (e.coerce)
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
      inst: t,
      ...o ? { received: o } : {}
    }), n;
  };
}), bc = /* @__PURE__ */ T("$ZodNumber", (t, e) => {
  Fu.init(t, e), Oo.init(t, e);
}), wc = /* @__PURE__ */ T("$ZodBoolean", (t, e) => {
  pe.init(t, e), t._zod.pattern = Au, t._zod.parse = (n, r) => {
    if (e.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const i = n.value;
    return typeof i == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: i,
      inst: t
    }), n;
  };
}), xc = /* @__PURE__ */ T("$ZodUnknown", (t, e) => {
  pe.init(t, e), t._zod.parse = (n) => n;
}), $c = /* @__PURE__ */ T("$ZodNever", (t, e) => {
  pe.init(t, e), t._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: t
  }), n);
});
function mi(t, e, n) {
  t.issues.length && e.issues.push(...Pr(n, t.issues)), e.value[n] = t.value;
}
const kc = /* @__PURE__ */ T("$ZodArray", (t, e) => {
  pe.init(t, e), t._zod.parse = (n, r) => {
    const i = n.value;
    if (!Array.isArray(i))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: i,
        inst: t
      }), n;
    n.value = Array(i.length);
    const o = [];
    for (let s = 0; s < i.length; s++) {
      const u = i[s], a = e.element._zod.run({
        value: u,
        issues: []
      }, r);
      a instanceof Promise ? o.push(a.then((h) => mi(h, n, s))) : mi(a, n, s);
    }
    return o.length ? Promise.all(o).then(() => n) : n;
  };
});
function Tn(t, e, n) {
  t.issues.length && e.issues.push(...Pr(n, t.issues)), e.value[n] = t.value;
}
function yi(t, e, n, r) {
  t.issues.length ? r[n] === void 0 ? n in r ? e.value[n] = void 0 : e.value[n] = t.value : e.issues.push(...Pr(n, t.issues)) : t.value === void 0 ? n in r && (e.value[n] = void 0) : e.value[n] = t.value;
}
const Ec = /* @__PURE__ */ T("$ZodObject", (t, e) => {
  pe.init(t, e);
  const n = wo(() => {
    const f = Object.keys(e.shape), y = Wa(e.shape);
    return {
      shape: e.shape,
      keys: f,
      keySet: new Set(f),
      numKeys: f.length,
      optionalKeys: new Set(y)
    };
  });
  fe(t._zod, "disc", () => {
    const f = e.shape, y = /* @__PURE__ */ new Map();
    let b = !1;
    for (const m in f) {
      const k = f[m]._zod;
      if (k.values || k.disc) {
        b = !0;
        const $ = {
          values: new Set(k.values ?? []),
          maps: k.disc ? [k.disc] : []
        };
        y.set(m, $);
      }
    }
    if (b)
      return y;
  });
  const r = (f) => {
    const y = new Ku(["shape", "payload", "ctx"]), { keys: b, optionalKeys: m } = n.value, k = (E) => {
      const N = Bt(E);
      return `shape[${N}]._zod.run({ value: input[${N}], issues: [] }, ctx)`;
    };
    y.write("const input = payload.value;");
    const $ = /* @__PURE__ */ Object.create(null);
    for (const E of b)
      $[E] = xo(15);
    y.write("const newResult = {}");
    for (const E of b)
      if (m.has(E)) {
        const N = $[E];
        y.write(`const ${N} = ${k(E)};`);
        const M = Bt(E);
        y.write(`
        if (${N}.issues.length) {
          if (input[${M}] === undefined) {
            if (${M} in input) {
              newResult[${M}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${N}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${M}, ...iss.path] : [${M}],
              }))
            );
          }
        } else if (${N}.value === undefined) {
          if (${M} in input) newResult[${M}] = undefined;
        } else {
          newResult[${M}] = ${N}.value;
        }
        `);
      } else {
        const N = $[E];
        y.write(`const ${N} = ${k(E)};`), y.write(`
          if (${N}.issues.length) payload.issues = payload.issues.concat(${N}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${Bt(E)}, ...iss.path] : [${Bt(E)}]
          })));`), y.write(`newResult[${Bt(E)}] = ${N}.value`);
      }
    y.write("payload.value = newResult;"), y.write("return payload;");
    const _ = y.compile();
    return (E, N) => _(f, E, N);
  };
  let i;
  const o = Ha, s = !kr.jitless, a = s && Ka.value, { catchall: h } = e;
  let d;
  t._zod.parse = (f, y) => {
    d ?? (d = n.value);
    const b = f.value;
    if (!o(b))
      return f.issues.push({
        expected: "object",
        code: "invalid_type",
        input: b,
        inst: t
      }), f;
    const m = [];
    if (s && a && (y == null ? void 0 : y.async) === !1 && y.jitless !== !0)
      i || (i = r(e.shape)), f = i(f, y);
    else {
      f.value = {};
      const N = d.shape;
      for (const M of d.keys) {
        const z = N[M], A = z._zod.run({ value: b[M], issues: [] }, y), R = z._zod.optin === "optional";
        A instanceof Promise ? m.push(A.then((B) => R ? yi(B, f, M, b) : Tn(B, f, M))) : R ? yi(A, f, M, b) : Tn(A, f, M);
      }
    }
    if (!h)
      return m.length ? Promise.all(m).then(() => f) : f;
    const k = [], $ = d.keySet, _ = h._zod, E = _.def.type;
    for (const N of Object.keys(b)) {
      if ($.has(N))
        continue;
      if (E === "never") {
        k.push(N);
        continue;
      }
      const M = _.run({ value: b[N], issues: [] }, y);
      M instanceof Promise ? m.push(M.then((z) => Tn(z, f, N))) : Tn(M, f, N);
    }
    return k.length && f.issues.push({
      code: "unrecognized_keys",
      keys: k,
      input: b,
      inst: t
    }), m.length ? Promise.all(m).then(() => f) : f;
  };
});
function bi(t, e, n, r) {
  for (const i of t)
    if (i.issues.length === 0)
      return e.value = i.value, e;
  return e.issues.push({
    code: "invalid_union",
    input: e.value,
    inst: n,
    errors: t.map((i) => i.issues.map((o) => lt(o, r, ht())))
  }), e;
}
const Nc = /* @__PURE__ */ T("$ZodUnion", (t, e) => {
  pe.init(t, e), fe(t._zod, "values", () => {
    if (e.options.every((n) => n._zod.values))
      return new Set(e.options.flatMap((n) => Array.from(n._zod.values)));
  }), fe(t._zod, "pattern", () => {
    if (e.options.every((n) => n._zod.pattern)) {
      const n = e.options.map((r) => r._zod.pattern);
      return new RegExp(`^(${n.map((r) => Ir(r.source)).join("|")})$`);
    }
  }), t._zod.parse = (n, r) => {
    let i = !1;
    const o = [];
    for (const s of e.options) {
      const u = s._zod.run({
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
    return i ? Promise.all(o).then((s) => bi(s, n, t, r)) : bi(o, n, t, r);
  };
}), Tc = /* @__PURE__ */ T("$ZodIntersection", (t, e) => {
  pe.init(t, e), t._zod.parse = (n, r) => {
    const { value: i } = n, o = e.left._zod.run({ value: i, issues: [] }, r), s = e.right._zod.run({ value: i, issues: [] }, r);
    return o instanceof Promise || s instanceof Promise ? Promise.all([o, s]).then(([a, h]) => wi(n, a, h)) : wi(n, o, s);
  };
});
function Er(t, e) {
  if (t === e)
    return { valid: !0, data: t };
  if (t instanceof Date && e instanceof Date && +t == +e)
    return { valid: !0, data: t };
  if (vi(t) && vi(e)) {
    const n = Object.keys(e), r = Object.keys(t).filter((o) => n.indexOf(o) !== -1), i = { ...t, ...e };
    for (const o of r) {
      const s = Er(t[o], e[o]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [o, ...s.mergeErrorPath]
        };
      i[o] = s.data;
    }
    return { valid: !0, data: i };
  }
  if (Array.isArray(t) && Array.isArray(e)) {
    if (t.length !== e.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < t.length; r++) {
      const i = t[r], o = e[r], s = Er(i, o);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function wi(t, e, n) {
  if (e.issues.length && t.issues.push(...e.issues), n.issues.length && t.issues.push(...n.issues), Kt(t))
    return t;
  const r = Er(e.value, n.value);
  if (!r.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);
  return t.value = r.data, t;
}
const Mc = /* @__PURE__ */ T("$ZodEnum", (t, e) => {
  pe.init(t, e);
  const n = Object.values(e.entries).filter((i) => typeof i == "number"), r = Object.entries(e.entries).filter(([i, o]) => n.indexOf(+i) === -1).map(([i, o]) => o);
  t._zod.values = new Set(r), t._zod.pattern = new RegExp(`^(${r.filter((i) => Va.has(typeof i)).map((i) => typeof i == "string" ? en(i) : i.toString()).join("|")})$`), t._zod.parse = (i, o) => {
    const s = i.value;
    return t._zod.values.has(s) || i.issues.push({
      code: "invalid_value",
      values: r,
      input: s,
      inst: t
    }), i;
  };
}), zc = /* @__PURE__ */ T("$ZodTransform", (t, e) => {
  pe.init(t, e), t._zod.parse = (n, r) => {
    const i = e.transform(n.value, n);
    if (r.async)
      return (i instanceof Promise ? i : Promise.resolve(i)).then((s) => (n.value = s, n));
    if (i instanceof Promise)
      throw new Xt();
    return n.value = i, n;
  };
}), Sc = /* @__PURE__ */ T("$ZodOptional", (t, e) => {
  pe.init(t, e), t._zod.optin = "optional", t._zod.optout = "optional", fe(t._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, void 0]) : void 0), fe(t._zod, "pattern", () => {
    const n = e.innerType._zod.pattern;
    return n ? new RegExp(`^(${Ir(n.source)})?$`) : void 0;
  }), t._zod.parse = (n, r) => n.value === void 0 ? n : e.innerType._zod.run(n, r);
}), Cc = /* @__PURE__ */ T("$ZodNullable", (t, e) => {
  pe.init(t, e), fe(t._zod, "optin", () => e.innerType._zod.optin), fe(t._zod, "optout", () => e.innerType._zod.optout), fe(t._zod, "pattern", () => {
    const n = e.innerType._zod.pattern;
    return n ? new RegExp(`^(${Ir(n.source)}|null)$`) : void 0;
  }), fe(t._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, null]) : void 0), t._zod.parse = (n, r) => n.value === null ? n : e.innerType._zod.run(n, r);
}), Ac = /* @__PURE__ */ T("$ZodDefault", (t, e) => {
  pe.init(t, e), t._zod.optin = "optional", fe(t._zod, "values", () => e.innerType._zod.values), t._zod.parse = (n, r) => {
    if (n.value === void 0)
      return n.value = e.defaultValue, n;
    const i = e.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => xi(o, e)) : xi(i, e);
  };
});
function xi(t, e) {
  return t.value === void 0 && (t.value = e.defaultValue), t;
}
const Ic = /* @__PURE__ */ T("$ZodPrefault", (t, e) => {
  pe.init(t, e), t._zod.optin = "optional", fe(t._zod, "values", () => e.innerType._zod.values), t._zod.parse = (n, r) => (n.value === void 0 && (n.value = e.defaultValue), e.innerType._zod.run(n, r));
}), Pc = /* @__PURE__ */ T("$ZodNonOptional", (t, e) => {
  pe.init(t, e), fe(t._zod, "values", () => {
    const n = e.innerType._zod.values;
    return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
  }), t._zod.parse = (n, r) => {
    const i = e.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => $i(o, t)) : $i(i, t);
  };
});
function $i(t, e) {
  return !t.issues.length && t.value === void 0 && t.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: t.value,
    inst: e
  }), t;
}
const Oc = /* @__PURE__ */ T("$ZodCatch", (t, e) => {
  pe.init(t, e), fe(t._zod, "optin", () => e.innerType._zod.optin), fe(t._zod, "optout", () => e.innerType._zod.optout), fe(t._zod, "values", () => e.innerType._zod.values), t._zod.parse = (n, r) => {
    const i = e.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => (n.value = o.value, o.issues.length && (n.value = e.catchValue({
      ...n,
      error: {
        issues: o.issues.map((s) => lt(s, r, ht()))
      },
      input: n.value
    }), n.issues = []), n)) : (n.value = i.value, i.issues.length && (n.value = e.catchValue({
      ...n,
      error: {
        issues: i.issues.map((o) => lt(o, r, ht()))
      },
      input: n.value
    }), n.issues = []), n);
  };
}), Fc = /* @__PURE__ */ T("$ZodPipe", (t, e) => {
  pe.init(t, e), fe(t._zod, "values", () => e.in._zod.values), fe(t._zod, "optin", () => e.in._zod.optin), fe(t._zod, "optout", () => e.out._zod.optout), t._zod.parse = (n, r) => {
    const i = e.in._zod.run(n, r);
    return i instanceof Promise ? i.then((o) => ki(o, e, r)) : ki(i, e, r);
  };
});
function ki(t, e, n) {
  return Kt(t) ? t : e.out._zod.run({ value: t.value, issues: t.issues }, n);
}
const Zc = /* @__PURE__ */ T("$ZodReadonly", (t, e) => {
  pe.init(t, e), fe(t._zod, "disc", () => e.innerType._zod.disc), fe(t._zod, "optin", () => e.innerType._zod.optin), fe(t._zod, "optout", () => e.innerType._zod.optout), t._zod.parse = (n, r) => {
    const i = e.innerType._zod.run(n, r);
    return i instanceof Promise ? i.then(Ei) : Ei(i);
  };
});
function Ei(t) {
  return t.value = Object.freeze(t.value), t;
}
const Lc = /* @__PURE__ */ T("$ZodCustom", (t, e) => {
  Me.init(t, e), pe.init(t, e), t._zod.parse = (n, r) => n, t._zod.check = (n) => {
    const r = n.value, i = e.fn(r);
    if (i instanceof Promise)
      return i.then((o) => Ni(o, n, r, t));
    Ni(i, n, r, t);
  };
});
function Ni(t, e, n, r) {
  if (!t) {
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
    r._zod.def.params && (i.params = r._zod.def.params), e.issues.push(tn(i));
  }
}
class Rc {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(e, ...n) {
    const r = n[0];
    if (this._map.set(e, r), r && typeof r == "object" && "id" in r) {
      if (this._idmap.has(r.id))
        throw new Error(`ID ${r.id} already exists in the registry`);
      this._idmap.set(r.id, e);
    }
    return this;
  }
  remove(e) {
    return this._map.delete(e), this;
  }
  get(e) {
    const n = e._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      return delete r.id, { ...r, ...this._map.get(e) };
    }
    return this._map.get(e);
  }
  has(e) {
    return this._map.has(e);
  }
}
function jc() {
  return new Rc();
}
const Mn = /* @__PURE__ */ jc();
function Bc(t, e) {
  return new t({
    type: "string",
    ...U(e)
  });
}
function Dc(t, e) {
  return new t({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Ti(t, e) {
  return new t({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Uc(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function qc(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...U(e)
  });
}
function Gc(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...U(e)
  });
}
function Hc(t, e) {
  return new t({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...U(e)
  });
}
function Kc(t, e) {
  return new t({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Vc(t, e) {
  return new t({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Wc(t, e) {
  return new t({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Qc(t, e) {
  return new t({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Jc(t, e) {
  return new t({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Yc(t, e) {
  return new t({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function Xc(t, e) {
  return new t({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function eh(t, e) {
  return new t({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function th(t, e) {
  return new t({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function nh(t, e) {
  return new t({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function rh(t, e) {
  return new t({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function ih(t, e) {
  return new t({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function oh(t, e) {
  return new t({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function sh(t, e) {
  return new t({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function ah(t, e) {
  return new t({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function uh(t, e) {
  return new t({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...U(e)
  });
}
function ch(t, e) {
  return new t({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...U(e)
  });
}
function hh(t, e) {
  return new t({
    type: "string",
    format: "date",
    check: "string_format",
    ...U(e)
  });
}
function lh(t, e) {
  return new t({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...U(e)
  });
}
function dh(t, e) {
  return new t({
    type: "string",
    format: "duration",
    check: "string_format",
    ...U(e)
  });
}
function fh(t, e) {
  return new t({
    type: "number",
    checks: [],
    ...U(e)
  });
}
function ph(t, e) {
  return new t({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...U(e)
  });
}
function gh(t, e) {
  return new t({
    type: "boolean",
    ...U(e)
  });
}
function vh(t) {
  return new t({
    type: "unknown"
  });
}
function _h(t, e) {
  return new t({
    type: "never",
    ...U(e)
  });
}
function Mi(t, e) {
  return new Ao({
    check: "less_than",
    ...U(e),
    value: t,
    inclusive: !1
  });
}
function pr(t, e) {
  return new Ao({
    check: "less_than",
    ...U(e),
    value: t,
    inclusive: !0
  });
}
function zi(t, e) {
  return new Io({
    check: "greater_than",
    ...U(e),
    value: t,
    inclusive: !1
  });
}
function gr(t, e) {
  return new Io({
    check: "greater_than",
    ...U(e),
    value: t,
    inclusive: !0
  });
}
function Si(t, e) {
  return new Ou({
    check: "multiple_of",
    ...U(e),
    value: t
  });
}
function Fo(t, e) {
  return new Zu({
    check: "max_length",
    ...U(e),
    maximum: t
  });
}
function Pn(t, e) {
  return new Lu({
    check: "min_length",
    ...U(e),
    minimum: t
  });
}
function Zo(t, e) {
  return new Ru({
    check: "length_equals",
    ...U(e),
    length: t
  });
}
function mh(t, e) {
  return new ju({
    check: "string_format",
    format: "regex",
    ...U(e),
    pattern: t
  });
}
function yh(t) {
  return new Bu({
    check: "string_format",
    format: "lowercase",
    ...U(t)
  });
}
function bh(t) {
  return new Du({
    check: "string_format",
    format: "uppercase",
    ...U(t)
  });
}
function wh(t, e) {
  return new Uu({
    check: "string_format",
    format: "includes",
    ...U(e),
    includes: t
  });
}
function xh(t, e) {
  return new qu({
    check: "string_format",
    format: "starts_with",
    ...U(e),
    prefix: t
  });
}
function $h(t, e) {
  return new Gu({
    check: "string_format",
    format: "ends_with",
    ...U(e),
    suffix: t
  });
}
function cn(t) {
  return new Hu({
    check: "overwrite",
    tx: t
  });
}
function kh(t) {
  return cn((e) => e.normalize(t));
}
function Eh() {
  return cn((t) => t.trim());
}
function Nh() {
  return cn((t) => t.toLowerCase());
}
function Th() {
  return cn((t) => t.toUpperCase());
}
function Mh(t, e, n) {
  return new t({
    type: "array",
    element: e,
    // get element() {
    //   return element;
    // },
    ...U(n)
  });
}
function zh(t, e, n) {
  return new t({
    type: "custom",
    check: "custom",
    fn: e,
    ...U(n)
  });
}
const Sh = /* @__PURE__ */ T("ZodISODateTime", (t, e) => {
  sc.init(t, e), le.init(t, e);
});
function Ch(t) {
  return ch(Sh, t);
}
const Ah = /* @__PURE__ */ T("ZodISODate", (t, e) => {
  ac.init(t, e), le.init(t, e);
});
function Ih(t) {
  return hh(Ah, t);
}
const Ph = /* @__PURE__ */ T("ZodISOTime", (t, e) => {
  uc.init(t, e), le.init(t, e);
});
function Oh(t) {
  return lh(Ph, t);
}
const Fh = /* @__PURE__ */ T("ZodISODuration", (t, e) => {
  cc.init(t, e), le.init(t, e);
});
function Zh(t) {
  return dh(Fh, t);
}
const Lh = (t, e) => {
  ko.init(t, e), t.name = "ZodError", Object.defineProperties(t, {
    format: {
      value: (n) => iu(t, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => ru(t, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => t.issues.push(n)
      // enumerable: false,
    },
    addIssues: {
      value: (n) => t.issues.push(...n)
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return t.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, Gn = T("ZodError", Lh, {
  Parent: Error
}), Rh = /* @__PURE__ */ ou(Gn), jh = /* @__PURE__ */ su(Gn), Bh = /* @__PURE__ */ No(Gn), Dh = /* @__PURE__ */ To(Gn), ge = /* @__PURE__ */ T("ZodType", (t, e) => (pe.init(t, e), t.def = e, Object.defineProperty(t, "_def", { value: e }), t.check = (...n) => t.clone(
  {
    ...e,
    checks: [
      ...e.checks ?? [],
      ...n.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
    ]
  }
  // { parent: true }
), t.clone = (n, r) => pt(t, n, r), t.brand = () => t, t.register = (n, r) => (n.add(t, r), t), t.parse = (n, r) => Rh(t, n, r, { callee: t.parse }), t.safeParse = (n, r) => Bh(t, n, r), t.parseAsync = async (n, r) => jh(t, n, r, { callee: t.parseAsync }), t.safeParseAsync = async (n, r) => Dh(t, n, r), t.spa = t.safeParseAsync, t.refine = (n, r) => t.check(zl(n, r)), t.superRefine = (n) => t.check(Sl(n)), t.overwrite = (n) => t.check(cn(n)), t.optional = () => On(t), t.nullable = () => Pi(t), t.nullish = () => On(Pi(t)), t.nonoptional = (n) => xl(t, n), t.array = () => Bo(t), t.or = (n) => fl([t, n]), t.and = (n) => gl(t, n), t.transform = (n) => Oi(t, Kn(n)), t.default = (n) => yl(t, n), t.prefault = (n) => wl(t, n), t.catch = (n) => kl(t, n), t.pipe = (n) => Oi(t, n), t.readonly = () => Tl(t), t.describe = (n) => {
  const r = t.clone();
  return Mn.add(r, { description: n }), r;
}, Object.defineProperty(t, "description", {
  get() {
    var n;
    return (n = Mn.get(t)) == null ? void 0 : n.description;
  },
  configurable: !0
}), t.meta = (...n) => {
  if (n.length === 0)
    return Mn.get(t);
  const r = t.clone();
  return Mn.add(r, n[0]), r;
}, t.isOptional = () => t.safeParse(void 0).success, t.isNullable = () => t.safeParse(null).success, t)), Lo = /* @__PURE__ */ T("_ZodString", (t, e) => {
  Fr.init(t, e), ge.init(t, e);
  const n = t._zod.bag;
  t.format = n.format ?? null, t.minLength = n.minimum ?? null, t.maxLength = n.maximum ?? null, t.regex = (...r) => t.check(mh(...r)), t.includes = (...r) => t.check(wh(...r)), t.startsWith = (r) => t.check(xh(r)), t.endsWith = (r) => t.check($h(r)), t.min = (...r) => t.check(Pn(...r)), t.max = (...r) => t.check(Fo(...r)), t.length = (...r) => t.check(Zo(...r)), t.nonempty = (...r) => t.check(Pn(1, ...r)), t.lowercase = (r) => t.check(yh(r)), t.uppercase = (r) => t.check(bh(r)), t.trim = () => t.check(Eh()), t.normalize = (...r) => t.check(kh(...r)), t.toLowerCase = () => t.check(Nh()), t.toUpperCase = () => t.check(Th());
}), Uh = /* @__PURE__ */ T("ZodString", (t, e) => {
  Fr.init(t, e), Lo.init(t, e), t.email = (n) => t.check(Dc(qh, n)), t.url = (n) => t.check(Kc(Gh, n)), t.jwt = (n) => t.check(uh(sl, n)), t.emoji = (n) => t.check(Vc(Hh, n)), t.guid = (n) => t.check(Ti(Ci, n)), t.uuid = (n) => t.check(Uc(zn, n)), t.uuidv4 = (n) => t.check(qc(zn, n)), t.uuidv6 = (n) => t.check(Gc(zn, n)), t.uuidv7 = (n) => t.check(Hc(zn, n)), t.nanoid = (n) => t.check(Wc(Kh, n)), t.guid = (n) => t.check(Ti(Ci, n)), t.cuid = (n) => t.check(Qc(Vh, n)), t.cuid2 = (n) => t.check(Jc(Wh, n)), t.ulid = (n) => t.check(Yc(Qh, n)), t.base64 = (n) => t.check(oh(rl, n)), t.base64url = (n) => t.check(sh(il, n)), t.xid = (n) => t.check(Xc(Jh, n)), t.ksuid = (n) => t.check(eh(Yh, n)), t.ipv4 = (n) => t.check(th(Xh, n)), t.ipv6 = (n) => t.check(nh(el, n)), t.cidrv4 = (n) => t.check(rh(tl, n)), t.cidrv6 = (n) => t.check(ih(nl, n)), t.e164 = (n) => t.check(ah(ol, n)), t.datetime = (n) => t.check(Ch(n)), t.date = (n) => t.check(Ih(n)), t.time = (n) => t.check(Oh(n)), t.duration = (n) => t.check(Zh(n));
});
function $e(t) {
  return Bc(Uh, t);
}
const le = /* @__PURE__ */ T("ZodStringFormat", (t, e) => {
  he.init(t, e), Lo.init(t, e);
}), qh = /* @__PURE__ */ T("ZodEmail", (t, e) => {
  Ju.init(t, e), le.init(t, e);
}), Ci = /* @__PURE__ */ T("ZodGUID", (t, e) => {
  Wu.init(t, e), le.init(t, e);
}), zn = /* @__PURE__ */ T("ZodUUID", (t, e) => {
  Qu.init(t, e), le.init(t, e);
}), Gh = /* @__PURE__ */ T("ZodURL", (t, e) => {
  Yu.init(t, e), le.init(t, e);
}), Hh = /* @__PURE__ */ T("ZodEmoji", (t, e) => {
  Xu.init(t, e), le.init(t, e);
}), Kh = /* @__PURE__ */ T("ZodNanoID", (t, e) => {
  ec.init(t, e), le.init(t, e);
}), Vh = /* @__PURE__ */ T("ZodCUID", (t, e) => {
  tc.init(t, e), le.init(t, e);
}), Wh = /* @__PURE__ */ T("ZodCUID2", (t, e) => {
  nc.init(t, e), le.init(t, e);
}), Qh = /* @__PURE__ */ T("ZodULID", (t, e) => {
  rc.init(t, e), le.init(t, e);
}), Jh = /* @__PURE__ */ T("ZodXID", (t, e) => {
  ic.init(t, e), le.init(t, e);
}), Yh = /* @__PURE__ */ T("ZodKSUID", (t, e) => {
  oc.init(t, e), le.init(t, e);
}), Xh = /* @__PURE__ */ T("ZodIPv4", (t, e) => {
  hc.init(t, e), le.init(t, e);
}), el = /* @__PURE__ */ T("ZodIPv6", (t, e) => {
  lc.init(t, e), le.init(t, e);
}), tl = /* @__PURE__ */ T("ZodCIDRv4", (t, e) => {
  dc.init(t, e), le.init(t, e);
}), nl = /* @__PURE__ */ T("ZodCIDRv6", (t, e) => {
  fc.init(t, e), le.init(t, e);
}), rl = /* @__PURE__ */ T("ZodBase64", (t, e) => {
  pc.init(t, e), le.init(t, e);
}), il = /* @__PURE__ */ T("ZodBase64URL", (t, e) => {
  vc.init(t, e), le.init(t, e);
}), ol = /* @__PURE__ */ T("ZodE164", (t, e) => {
  _c.init(t, e), le.init(t, e);
}), sl = /* @__PURE__ */ T("ZodJWT", (t, e) => {
  yc.init(t, e), le.init(t, e);
}), Ro = /* @__PURE__ */ T("ZodNumber", (t, e) => {
  Oo.init(t, e), ge.init(t, e), t.gt = (r, i) => t.check(zi(r, i)), t.gte = (r, i) => t.check(gr(r, i)), t.min = (r, i) => t.check(gr(r, i)), t.lt = (r, i) => t.check(Mi(r, i)), t.lte = (r, i) => t.check(pr(r, i)), t.max = (r, i) => t.check(pr(r, i)), t.int = (r) => t.check(Ai(r)), t.safe = (r) => t.check(Ai(r)), t.positive = (r) => t.check(zi(0, r)), t.nonnegative = (r) => t.check(gr(0, r)), t.negative = (r) => t.check(Mi(0, r)), t.nonpositive = (r) => t.check(pr(0, r)), t.multipleOf = (r, i) => t.check(Si(r, i)), t.step = (r, i) => t.check(Si(r, i)), t.finite = () => t;
  const n = t._zod.bag;
  t.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, t.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, t.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), t.isFinite = !0, t.format = n.format ?? null;
});
function rt(t) {
  return fh(Ro, t);
}
const al = /* @__PURE__ */ T("ZodNumberFormat", (t, e) => {
  bc.init(t, e), Ro.init(t, e);
});
function Ai(t) {
  return ph(al, t);
}
const ul = /* @__PURE__ */ T("ZodBoolean", (t, e) => {
  wc.init(t, e), ge.init(t, e);
});
function Vt(t) {
  return gh(ul, t);
}
const cl = /* @__PURE__ */ T("ZodUnknown", (t, e) => {
  xc.init(t, e), ge.init(t, e);
});
function Ii() {
  return vh(cl);
}
const hl = /* @__PURE__ */ T("ZodNever", (t, e) => {
  $c.init(t, e), ge.init(t, e);
});
function jo(t) {
  return _h(hl, t);
}
const ll = /* @__PURE__ */ T("ZodArray", (t, e) => {
  kc.init(t, e), ge.init(t, e), t.element = e.element, t.min = (n, r) => t.check(Pn(n, r)), t.nonempty = (n) => t.check(Pn(1, n)), t.max = (n, r) => t.check(Fo(n, r)), t.length = (n, r) => t.check(Zo(n, r));
});
function Bo(t, e) {
  return Mh(ll, t, e);
}
const Do = /* @__PURE__ */ T("ZodObject", (t, e) => {
  Ec.init(t, e), ge.init(t, e), fe(t, "shape", () => Object.fromEntries(Object.entries(t._zod.def.shape))), t.keyof = () => Hn(Object.keys(t._zod.def.shape)), t.catchall = (n) => t.clone({ ...t._zod.def, catchall: n }), t.passthrough = () => t.clone({ ...t._zod.def, catchall: Ii() }), t.loose = () => t.clone({ ...t._zod.def, catchall: Ii() }), t.strict = () => t.clone({ ...t._zod.def, catchall: jo() }), t.strip = () => t.clone({ ...t._zod.def, catchall: void 0 }), t.extend = (n) => Xa(t, n), t.merge = (n) => eu(t, n), t.pick = (n) => Ja(t, n), t.omit = (n) => Ya(t, n), t.partial = (...n) => tu(Uo, t, n[0]), t.required = (...n) => nu(qo, t, n[0]);
});
function Et(t, e) {
  const n = {
    type: "object",
    get shape() {
      return Un(this, "shape", { ...t }), this.shape;
    },
    ...U(e)
  };
  return new Do(n);
}
function Ie(t, e) {
  return new Do({
    type: "object",
    get shape() {
      return Un(this, "shape", { ...t }), this.shape;
    },
    catchall: jo(),
    ...U(e)
  });
}
const dl = /* @__PURE__ */ T("ZodUnion", (t, e) => {
  Nc.init(t, e), ge.init(t, e), t.options = e.options;
});
function fl(t, e) {
  return new dl({
    type: "union",
    options: t,
    ...U(e)
  });
}
const pl = /* @__PURE__ */ T("ZodIntersection", (t, e) => {
  Tc.init(t, e), ge.init(t, e);
});
function gl(t, e) {
  return new pl({
    type: "intersection",
    left: t,
    right: e
  });
}
const Nr = /* @__PURE__ */ T("ZodEnum", (t, e) => {
  Mc.init(t, e), ge.init(t, e), t.enum = e.entries, t.options = Object.values(e.entries);
  const n = new Set(Object.keys(e.entries));
  t.extract = (r, i) => {
    const o = {};
    for (const s of r)
      if (n.has(s))
        o[s] = e.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Nr({
      ...e,
      checks: [],
      ...U(i),
      entries: o
    });
  }, t.exclude = (r, i) => {
    const o = { ...e.entries };
    for (const s of r)
      if (n.has(s))
        delete o[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Nr({
      ...e,
      checks: [],
      ...U(i),
      entries: o
    });
  };
});
function Hn(t, e) {
  const n = Array.isArray(t) ? Object.fromEntries(t.map((r) => [r, r])) : t;
  return new Nr({
    type: "enum",
    entries: n,
    ...U(e)
  });
}
const vl = /* @__PURE__ */ T("ZodTransform", (t, e) => {
  zc.init(t, e), ge.init(t, e), t._zod.parse = (n, r) => {
    n.addIssue = (o) => {
      if (typeof o == "string")
        n.issues.push(tn(o, n.value, e));
      else {
        const s = o;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = t), s.continue ?? (s.continue = !0), n.issues.push(tn(s));
      }
    };
    const i = e.transform(n.value, n);
    return i instanceof Promise ? i.then((o) => (n.value = o, n)) : (n.value = i, n);
  };
});
function Kn(t) {
  return new vl({
    type: "transform",
    transform: t
  });
}
const Uo = /* @__PURE__ */ T("ZodOptional", (t, e) => {
  Sc.init(t, e), ge.init(t, e), t.unwrap = () => t._zod.def.innerType;
});
function On(t) {
  return new Uo({
    type: "optional",
    innerType: t
  });
}
const _l = /* @__PURE__ */ T("ZodNullable", (t, e) => {
  Cc.init(t, e), ge.init(t, e), t.unwrap = () => t._zod.def.innerType;
});
function Pi(t) {
  return new _l({
    type: "nullable",
    innerType: t
  });
}
const ml = /* @__PURE__ */ T("ZodDefault", (t, e) => {
  Ac.init(t, e), ge.init(t, e), t.unwrap = () => t._zod.def.innerType, t.removeDefault = t.unwrap;
});
function yl(t, e) {
  return new ml({
    type: "default",
    innerType: t,
    get defaultValue() {
      return typeof e == "function" ? e() : e;
    }
  });
}
const bl = /* @__PURE__ */ T("ZodPrefault", (t, e) => {
  Ic.init(t, e), ge.init(t, e), t.unwrap = () => t._zod.def.innerType;
});
function wl(t, e) {
  return new bl({
    type: "prefault",
    innerType: t,
    get defaultValue() {
      return typeof e == "function" ? e() : e;
    }
  });
}
const qo = /* @__PURE__ */ T("ZodNonOptional", (t, e) => {
  Pc.init(t, e), ge.init(t, e), t.unwrap = () => t._zod.def.innerType;
});
function xl(t, e) {
  return new qo({
    type: "nonoptional",
    innerType: t,
    ...U(e)
  });
}
const $l = /* @__PURE__ */ T("ZodCatch", (t, e) => {
  Oc.init(t, e), ge.init(t, e), t.unwrap = () => t._zod.def.innerType, t.removeCatch = t.unwrap;
});
function kl(t, e) {
  return new $l({
    type: "catch",
    innerType: t,
    catchValue: typeof e == "function" ? e : () => e
  });
}
const El = /* @__PURE__ */ T("ZodPipe", (t, e) => {
  Fc.init(t, e), ge.init(t, e), t.in = e.in, t.out = e.out;
});
function Oi(t, e) {
  return new El({
    type: "pipe",
    in: t,
    out: e
    // ...util.normalizeParams(params),
  });
}
const Nl = /* @__PURE__ */ T("ZodReadonly", (t, e) => {
  Zc.init(t, e), ge.init(t, e);
});
function Tl(t) {
  return new Nl({
    type: "readonly",
    innerType: t
  });
}
const Go = /* @__PURE__ */ T("ZodCustom", (t, e) => {
  Lc.init(t, e), ge.init(t, e);
});
function Ml(t, e) {
  const n = new Me({
    check: "custom",
    ...U(e)
  });
  return n._zod.check = t, n;
}
function zl(t, e = {}) {
  return zh(Go, t, e);
}
function Sl(t, e) {
  const n = Ml((r) => (r.addIssue = (i) => {
    if (typeof i == "string")
      r.issues.push(tn(i, r.value, n._zod.def));
    else {
      const o = i;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = r.value), o.inst ?? (o.inst = n), o.continue ?? (o.continue = !n._zod.def.abort), r.issues.push(tn(o));
    }
  }, t(r.value, r)), e);
  return n;
}
function Fn(t, e = {
  error: `Input not instance of ${t.name}`
}) {
  const n = new Go({
    type: "custom",
    check: "custom",
    fn: (r) => r instanceof t,
    abort: !0,
    ...U(e)
  });
  return n._zod.bag.Class = t, n;
}
const Cl = Hn([
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
function Zr(t) {
  const e = Te.get(t);
  if (e === null) {
    console.warn("invalid color:", t);
    return;
  }
  let n;
  switch (e.model) {
    case "rgb":
      n = Xe.rgb.hex(e.value[0], e.value[1], e.value[2]);
      break;
    case "hsl":
      n = Xe.hsl.hex(e.value[0], e.value[1], e.value[2]);
      break;
    case "hwb":
      n = Xe.hwb.hex(e.value[0], e.value[1], e.value[2]);
      break;
    default:
      console.warn("unknown color model", e.model);
      return;
  }
  const r = e.value[3] ?? 1, i = Math.round(r * 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${n}${i}`;
}
const nn = Ie({
  size: rt().min(0).default(1),
  opacity: rt().min(0).max(1).default(1),
  wireframe: Vt().default(!1),
  color: $e().pipe(Kn(Zr)).default("#D3D3D3FF"),
  label: Vt().default(!1),
  shape: Cl.default("icosphere"),
  enabled: Vt().default(!0),
  nodeMeshFactory: Fn(Function).default(() => mo.defaultNodeMeshFactory)
}), Fi = Ie({
  baseColor: $e().pipe(Kn(Zr)).default("#D3D3D3FF")
}), Al = Hn([
  "plain",
  "moving"
]), rn = Ie({
  type: Al.default("moving"),
  arrowCap: Vt().default(!1),
  color: $e().pipe(Kn(Zr)).default("#FFFFFFFF"),
  width: rt().default(0.25),
  movingLineOpts: Fi.default(Fi.parse({})),
  edgeMeshFactory: Fn(Function).default(() => Ue.defaultEdgeMeshFactory)
}), Il = Ie({
  selector: $e(),
  style: nn
}), Pl = Ie({
  selector: $e(),
  style: rn
}), Ol = Ie({
  node: Il,
  edge: Pl
}).partial().refine(
  (t) => !!t.node || !!t.edge,
  "StyleLayer requires either 'node' or 'edge'."
), Fl = Bo(Ol), Zi = Ie({
  pinOnDrag: Vt().default(!0)
}), Tr = $e().or(rt());
Et({
  id: Tr,
  metadata: Et()
});
Et({
  src: Tr,
  dst: Tr,
  metadata: Et()
});
const Mr = Et({
  nodeIdPath: $e().default("id"),
  edgeSrcIdPath: $e().default("src"),
  edgeDstIdPath: $e().default("dst")
}), Li = Ie({
  skybox: $e().default(""),
  node: nn.default(nn.parse({})),
  edge: rn.default(rn.parse({})),
  startingCameraDistance: rt().default(30)
}), Ri = Ie({
  node: Zi.default(Zi.parse({})),
  fetchNodes: On(Fn(Function)),
  fetchEdges: On(Fn(Function))
}), Zl = Hn([
  "ngraph",
  "d3"
]), ji = Ie({
  type: Zl.default("ngraph"),
  preSteps: rt().default(0),
  stepMultiplier: rt().default(1),
  minDelta: rt().default(0)
}), Ll = Ie({
  nodeListProp: $e().default("nodes"),
  edgeListProp: $e().default("edges"),
  nodeIdProp: $e().default("id"),
  edgeSrcIdProp: $e().default("src"),
  edgeDstIdProp: $e().default("dst"),
  // fetchOpts?: Parameters<typeof fetch>[1];
  fetchOpts: Et().default({})
});
function Rl(t = {}) {
  return Ll.parse(t);
}
const jl = Ie({
  style: Li.default(Li.parse({})),
  behavior: Ri.default(Ri.parse({})),
  engine: ji.default(ji.parse({})),
  knownFields: Mr.default(Mr.parse({}))
});
function Bl(t = {}) {
  return jl.parse(t);
}
function Dl(t, e, n) {
  var r, i = 1;
  t == null && (t = 0), e == null && (e = 0), n == null && (n = 0);
  function o() {
    var s, u = r.length, a, h = 0, d = 0, f = 0;
    for (s = 0; s < u; ++s)
      a = r[s], h += a.x || 0, d += a.y || 0, f += a.z || 0;
    for (h = (h / u - t) * i, d = (d / u - e) * i, f = (f / u - n) * i, s = 0; s < u; ++s)
      a = r[s], h && (a.x -= h), d && (a.y -= d), f && (a.z -= f);
  }
  return o.initialize = function(s) {
    r = s;
  }, o.x = function(s) {
    return arguments.length ? (t = +s, o) : t;
  }, o.y = function(s) {
    return arguments.length ? (e = +s, o) : e;
  }, o.z = function(s) {
    return arguments.length ? (n = +s, o) : n;
  }, o.strength = function(s) {
    return arguments.length ? (i = +s, o) : i;
  }, o;
}
function Ul(t) {
  const e = +this._x.call(null, t);
  return Ho(this.cover(e), e, t);
}
function Ho(t, e, n) {
  if (isNaN(e))
    return t;
  var r, i = t._root, o = { data: n }, s = t._x0, u = t._x1, a, h, d, f, y;
  if (!i)
    return t._root = o, t;
  for (; i.length; )
    if ((d = e >= (a = (s + u) / 2)) ? s = a : u = a, r = i, !(i = i[f = +d]))
      return r[f] = o, t;
  if (h = +t._x.call(null, i.data), e === h)
    return o.next = i, r ? r[f] = o : t._root = o, t;
  do
    r = r ? r[f] = new Array(2) : t._root = new Array(2), (d = e >= (a = (s + u) / 2)) ? s = a : u = a;
  while ((f = +d) == (y = +(h >= a)));
  return r[y] = i, r[f] = o, t;
}
function ql(t) {
  Array.isArray(t) || (t = Array.from(t));
  const e = t.length, n = new Float64Array(e);
  let r = 1 / 0, i = -1 / 0;
  for (let o = 0, s; o < e; ++o)
    isNaN(s = +this._x.call(null, t[o])) || (n[o] = s, s < r && (r = s), s > i && (i = s));
  if (r > i)
    return this;
  this.cover(r).cover(i);
  for (let o = 0; o < e; ++o)
    Ho(this, n[o], t[o]);
  return this;
}
function Gl(t) {
  if (isNaN(t = +t))
    return this;
  var e = this._x0, n = this._x1;
  if (isNaN(e))
    n = (e = Math.floor(t)) + 1;
  else {
    for (var r = n - e || 1, i = this._root, o, s; e > t || t >= n; )
      switch (s = +(t < e), o = new Array(2), o[s] = i, i = o, r *= 2, s) {
        case 0:
          n = e + r;
          break;
        case 1:
          e = n - r;
          break;
      }
    this._root && this._root.length && (this._root = i);
  }
  return this._x0 = e, this._x1 = n, this;
}
function Hl() {
  var t = [];
  return this.visit(function(e) {
    if (!e.length)
      do
        t.push(e.data);
      while (e = e.next);
  }), t;
}
function Kl(t) {
  return arguments.length ? this.cover(+t[0][0]).cover(+t[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
}
function Ge(t, e, n) {
  this.node = t, this.x0 = e, this.x1 = n;
}
function Vl(t, e) {
  var n, r = this._x0, i, o, s = this._x1, u = [], a = this._root, h, d;
  for (a && u.push(new Ge(a, r, s)), e == null ? e = 1 / 0 : (r = t - e, s = t + e); h = u.pop(); )
    if (!(!(a = h.node) || (i = h.x0) > s || (o = h.x1) < r))
      if (a.length) {
        var f = (i + o) / 2;
        u.push(
          new Ge(a[1], f, o),
          new Ge(a[0], i, f)
        ), (d = +(t >= f)) && (h = u[u.length - 1], u[u.length - 1] = u[u.length - 1 - d], u[u.length - 1 - d] = h);
      } else {
        var y = Math.abs(t - +this._x.call(null, a.data));
        y < e && (e = y, r = t - y, s = t + y, n = a.data);
      }
  return n;
}
function Wl(t) {
  if (isNaN(a = +this._x.call(null, t)))
    return this;
  var e, n = this._root, r, i, o, s = this._x0, u = this._x1, a, h, d, f, y;
  if (!n)
    return this;
  if (n.length)
    for (; ; ) {
      if ((d = a >= (h = (s + u) / 2)) ? s = h : u = h, e = n, !(n = n[f = +d]))
        return this;
      if (!n.length)
        break;
      e[f + 1 & 1] && (r = e, y = f);
    }
  for (; n.data !== t; )
    if (i = n, !(n = n.next))
      return this;
  return (o = n.next) && delete n.next, i ? (o ? i.next = o : delete i.next, this) : e ? (o ? e[f] = o : delete e[f], (n = e[0] || e[1]) && n === (e[1] || e[0]) && !n.length && (r ? r[y] = n : this._root = n), this) : (this._root = o, this);
}
function Ql(t) {
  for (var e = 0, n = t.length; e < n; ++e)
    this.remove(t[e]);
  return this;
}
function Jl() {
  return this._root;
}
function Yl() {
  var t = 0;
  return this.visit(function(e) {
    if (!e.length)
      do
        ++t;
      while (e = e.next);
  }), t;
}
function Xl(t) {
  var e = [], n, r = this._root, i, o, s;
  for (r && e.push(new Ge(r, this._x0, this._x1)); n = e.pop(); )
    if (!t(r = n.node, o = n.x0, s = n.x1) && r.length) {
      var u = (o + s) / 2;
      (i = r[1]) && e.push(new Ge(i, u, s)), (i = r[0]) && e.push(new Ge(i, o, u));
    }
  return this;
}
function ed(t) {
  var e = [], n = [], r;
  for (this._root && e.push(new Ge(this._root, this._x0, this._x1)); r = e.pop(); ) {
    var i = r.node;
    if (i.length) {
      var o, s = r.x0, u = r.x1, a = (s + u) / 2;
      (o = i[0]) && e.push(new Ge(o, s, a)), (o = i[1]) && e.push(new Ge(o, a, u));
    }
    n.push(r);
  }
  for (; r = n.pop(); )
    t(r.node, r.x0, r.x1);
  return this;
}
function td(t) {
  return t[0];
}
function nd(t) {
  return arguments.length ? (this._x = t, this) : this._x;
}
function Ko(t, e) {
  var n = new Lr(e ?? td, NaN, NaN);
  return t == null ? n : n.addAll(t);
}
function Lr(t, e, n) {
  this._x = t, this._x0 = e, this._x1 = n, this._root = void 0;
}
function Bi(t) {
  for (var e = { data: t.data }, n = e; t = t.next; )
    n = n.next = { data: t.data };
  return e;
}
var ze = Ko.prototype = Lr.prototype;
ze.copy = function() {
  var t = new Lr(this._x, this._x0, this._x1), e = this._root, n, r;
  if (!e)
    return t;
  if (!e.length)
    return t._root = Bi(e), t;
  for (n = [{ source: e, target: t._root = new Array(2) }]; e = n.pop(); )
    for (var i = 0; i < 2; ++i)
      (r = e.source[i]) && (r.length ? n.push({ source: r, target: e.target[i] = new Array(2) }) : e.target[i] = Bi(r));
  return t;
};
ze.add = Ul;
ze.addAll = ql;
ze.cover = Gl;
ze.data = Hl;
ze.extent = Kl;
ze.find = Vl;
ze.remove = Wl;
ze.removeAll = Ql;
ze.root = Jl;
ze.size = Yl;
ze.visit = Xl;
ze.visitAfter = ed;
ze.x = nd;
function rd(t) {
  const e = +this._x.call(null, t), n = +this._y.call(null, t);
  return Vo(this.cover(e, n), e, n, t);
}
function Vo(t, e, n, r) {
  if (isNaN(e) || isNaN(n))
    return t;
  var i, o = t._root, s = { data: r }, u = t._x0, a = t._y0, h = t._x1, d = t._y1, f, y, b, m, k, $, _, E;
  if (!o)
    return t._root = s, t;
  for (; o.length; )
    if ((k = e >= (f = (u + h) / 2)) ? u = f : h = f, ($ = n >= (y = (a + d) / 2)) ? a = y : d = y, i = o, !(o = o[_ = $ << 1 | k]))
      return i[_] = s, t;
  if (b = +t._x.call(null, o.data), m = +t._y.call(null, o.data), e === b && n === m)
    return s.next = o, i ? i[_] = s : t._root = s, t;
  do
    i = i ? i[_] = new Array(4) : t._root = new Array(4), (k = e >= (f = (u + h) / 2)) ? u = f : h = f, ($ = n >= (y = (a + d) / 2)) ? a = y : d = y;
  while ((_ = $ << 1 | k) === (E = (m >= y) << 1 | b >= f));
  return i[E] = o, i[_] = s, t;
}
function id(t) {
  var e, n, r = t.length, i, o, s = new Array(r), u = new Array(r), a = 1 / 0, h = 1 / 0, d = -1 / 0, f = -1 / 0;
  for (n = 0; n < r; ++n)
    isNaN(i = +this._x.call(null, e = t[n])) || isNaN(o = +this._y.call(null, e)) || (s[n] = i, u[n] = o, i < a && (a = i), i > d && (d = i), o < h && (h = o), o > f && (f = o));
  if (a > d || h > f)
    return this;
  for (this.cover(a, h).cover(d, f), n = 0; n < r; ++n)
    Vo(this, s[n], u[n], t[n]);
  return this;
}
function od(t, e) {
  if (isNaN(t = +t) || isNaN(e = +e))
    return this;
  var n = this._x0, r = this._y0, i = this._x1, o = this._y1;
  if (isNaN(n))
    i = (n = Math.floor(t)) + 1, o = (r = Math.floor(e)) + 1;
  else {
    for (var s = i - n || 1, u = this._root, a, h; n > t || t >= i || r > e || e >= o; )
      switch (h = (e < r) << 1 | t < n, a = new Array(4), a[h] = u, u = a, s *= 2, h) {
        case 0:
          i = n + s, o = r + s;
          break;
        case 1:
          n = i - s, o = r + s;
          break;
        case 2:
          i = n + s, r = o - s;
          break;
        case 3:
          n = i - s, r = o - s;
          break;
      }
    this._root && this._root.length && (this._root = u);
  }
  return this._x0 = n, this._y0 = r, this._x1 = i, this._y1 = o, this;
}
function sd() {
  var t = [];
  return this.visit(function(e) {
    if (!e.length)
      do
        t.push(e.data);
      while (e = e.next);
  }), t;
}
function ad(t) {
  return arguments.length ? this.cover(+t[0][0], +t[0][1]).cover(+t[1][0], +t[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function ke(t, e, n, r, i) {
  this.node = t, this.x0 = e, this.y0 = n, this.x1 = r, this.y1 = i;
}
function ud(t, e, n) {
  var r, i = this._x0, o = this._y0, s, u, a, h, d = this._x1, f = this._y1, y = [], b = this._root, m, k;
  for (b && y.push(new ke(b, i, o, d, f)), n == null ? n = 1 / 0 : (i = t - n, o = e - n, d = t + n, f = e + n, n *= n); m = y.pop(); )
    if (!(!(b = m.node) || (s = m.x0) > d || (u = m.y0) > f || (a = m.x1) < i || (h = m.y1) < o))
      if (b.length) {
        var $ = (s + a) / 2, _ = (u + h) / 2;
        y.push(
          new ke(b[3], $, _, a, h),
          new ke(b[2], s, _, $, h),
          new ke(b[1], $, u, a, _),
          new ke(b[0], s, u, $, _)
        ), (k = (e >= _) << 1 | t >= $) && (m = y[y.length - 1], y[y.length - 1] = y[y.length - 1 - k], y[y.length - 1 - k] = m);
      } else {
        var E = t - +this._x.call(null, b.data), N = e - +this._y.call(null, b.data), M = E * E + N * N;
        if (M < n) {
          var z = Math.sqrt(n = M);
          i = t - z, o = e - z, d = t + z, f = e + z, r = b.data;
        }
      }
  return r;
}
function cd(t) {
  if (isNaN(d = +this._x.call(null, t)) || isNaN(f = +this._y.call(null, t)))
    return this;
  var e, n = this._root, r, i, o, s = this._x0, u = this._y0, a = this._x1, h = this._y1, d, f, y, b, m, k, $, _;
  if (!n)
    return this;
  if (n.length)
    for (; ; ) {
      if ((m = d >= (y = (s + a) / 2)) ? s = y : a = y, (k = f >= (b = (u + h) / 2)) ? u = b : h = b, e = n, !(n = n[$ = k << 1 | m]))
        return this;
      if (!n.length)
        break;
      (e[$ + 1 & 3] || e[$ + 2 & 3] || e[$ + 3 & 3]) && (r = e, _ = $);
    }
  for (; n.data !== t; )
    if (i = n, !(n = n.next))
      return this;
  return (o = n.next) && delete n.next, i ? (o ? i.next = o : delete i.next, this) : e ? (o ? e[$] = o : delete e[$], (n = e[0] || e[1] || e[2] || e[3]) && n === (e[3] || e[2] || e[1] || e[0]) && !n.length && (r ? r[_] = n : this._root = n), this) : (this._root = o, this);
}
function hd(t) {
  for (var e = 0, n = t.length; e < n; ++e)
    this.remove(t[e]);
  return this;
}
function ld() {
  return this._root;
}
function dd() {
  var t = 0;
  return this.visit(function(e) {
    if (!e.length)
      do
        ++t;
      while (e = e.next);
  }), t;
}
function fd(t) {
  var e = [], n, r = this._root, i, o, s, u, a;
  for (r && e.push(new ke(r, this._x0, this._y0, this._x1, this._y1)); n = e.pop(); )
    if (!t(r = n.node, o = n.x0, s = n.y0, u = n.x1, a = n.y1) && r.length) {
      var h = (o + u) / 2, d = (s + a) / 2;
      (i = r[3]) && e.push(new ke(i, h, d, u, a)), (i = r[2]) && e.push(new ke(i, o, d, h, a)), (i = r[1]) && e.push(new ke(i, h, s, u, d)), (i = r[0]) && e.push(new ke(i, o, s, h, d));
    }
  return this;
}
function pd(t) {
  var e = [], n = [], r;
  for (this._root && e.push(new ke(this._root, this._x0, this._y0, this._x1, this._y1)); r = e.pop(); ) {
    var i = r.node;
    if (i.length) {
      var o, s = r.x0, u = r.y0, a = r.x1, h = r.y1, d = (s + a) / 2, f = (u + h) / 2;
      (o = i[0]) && e.push(new ke(o, s, u, d, f)), (o = i[1]) && e.push(new ke(o, d, u, a, f)), (o = i[2]) && e.push(new ke(o, s, f, d, h)), (o = i[3]) && e.push(new ke(o, d, f, a, h));
    }
    n.push(r);
  }
  for (; r = n.pop(); )
    t(r.node, r.x0, r.y0, r.x1, r.y1);
  return this;
}
function gd(t) {
  return t[0];
}
function vd(t) {
  return arguments.length ? (this._x = t, this) : this._x;
}
function _d(t) {
  return t[1];
}
function md(t) {
  return arguments.length ? (this._y = t, this) : this._y;
}
function Wo(t, e, n) {
  var r = new Rr(e ?? gd, n ?? _d, NaN, NaN, NaN, NaN);
  return t == null ? r : r.addAll(t);
}
function Rr(t, e, n, r, i, o) {
  this._x = t, this._y = e, this._x0 = n, this._y0 = r, this._x1 = i, this._y1 = o, this._root = void 0;
}
function Di(t) {
  for (var e = { data: t.data }, n = e; t = t.next; )
    n = n.next = { data: t.data };
  return e;
}
var Ee = Wo.prototype = Rr.prototype;
Ee.copy = function() {
  var t = new Rr(this._x, this._y, this._x0, this._y0, this._x1, this._y1), e = this._root, n, r;
  if (!e)
    return t;
  if (!e.length)
    return t._root = Di(e), t;
  for (n = [{ source: e, target: t._root = new Array(4) }]; e = n.pop(); )
    for (var i = 0; i < 4; ++i)
      (r = e.source[i]) && (r.length ? n.push({ source: r, target: e.target[i] = new Array(4) }) : e.target[i] = Di(r));
  return t;
};
Ee.add = rd;
Ee.addAll = id;
Ee.cover = od;
Ee.data = sd;
Ee.extent = ad;
Ee.find = ud;
Ee.remove = cd;
Ee.removeAll = hd;
Ee.root = ld;
Ee.size = dd;
Ee.visit = fd;
Ee.visitAfter = pd;
Ee.x = vd;
Ee.y = md;
function yd(t) {
  const e = +this._x.call(null, t), n = +this._y.call(null, t), r = +this._z.call(null, t);
  return Qo(this.cover(e, n, r), e, n, r, t);
}
function Qo(t, e, n, r, i) {
  if (isNaN(e) || isNaN(n) || isNaN(r))
    return t;
  var o, s = t._root, u = { data: i }, a = t._x0, h = t._y0, d = t._z0, f = t._x1, y = t._y1, b = t._z1, m, k, $, _, E, N, M, z, A, R, B;
  if (!s)
    return t._root = u, t;
  for (; s.length; )
    if ((M = e >= (m = (a + f) / 2)) ? a = m : f = m, (z = n >= (k = (h + y) / 2)) ? h = k : y = k, (A = r >= ($ = (d + b) / 2)) ? d = $ : b = $, o = s, !(s = s[R = A << 2 | z << 1 | M]))
      return o[R] = u, t;
  if (_ = +t._x.call(null, s.data), E = +t._y.call(null, s.data), N = +t._z.call(null, s.data), e === _ && n === E && r === N)
    return u.next = s, o ? o[R] = u : t._root = u, t;
  do
    o = o ? o[R] = new Array(8) : t._root = new Array(8), (M = e >= (m = (a + f) / 2)) ? a = m : f = m, (z = n >= (k = (h + y) / 2)) ? h = k : y = k, (A = r >= ($ = (d + b) / 2)) ? d = $ : b = $;
  while ((R = A << 2 | z << 1 | M) === (B = (N >= $) << 2 | (E >= k) << 1 | _ >= m));
  return o[B] = s, o[R] = u, t;
}
function bd(t) {
  Array.isArray(t) || (t = Array.from(t));
  const e = t.length, n = new Float64Array(e), r = new Float64Array(e), i = new Float64Array(e);
  let o = 1 / 0, s = 1 / 0, u = 1 / 0, a = -1 / 0, h = -1 / 0, d = -1 / 0;
  for (let f = 0, y, b, m, k; f < e; ++f)
    isNaN(b = +this._x.call(null, y = t[f])) || isNaN(m = +this._y.call(null, y)) || isNaN(k = +this._z.call(null, y)) || (n[f] = b, r[f] = m, i[f] = k, b < o && (o = b), b > a && (a = b), m < s && (s = m), m > h && (h = m), k < u && (u = k), k > d && (d = k));
  if (o > a || s > h || u > d)
    return this;
  this.cover(o, s, u).cover(a, h, d);
  for (let f = 0; f < e; ++f)
    Qo(this, n[f], r[f], i[f], t[f]);
  return this;
}
function wd(t, e, n) {
  if (isNaN(t = +t) || isNaN(e = +e) || isNaN(n = +n))
    return this;
  var r = this._x0, i = this._y0, o = this._z0, s = this._x1, u = this._y1, a = this._z1;
  if (isNaN(r))
    s = (r = Math.floor(t)) + 1, u = (i = Math.floor(e)) + 1, a = (o = Math.floor(n)) + 1;
  else {
    for (var h = s - r || 1, d = this._root, f, y; r > t || t >= s || i > e || e >= u || o > n || n >= a; )
      switch (y = (n < o) << 2 | (e < i) << 1 | t < r, f = new Array(8), f[y] = d, d = f, h *= 2, y) {
        case 0:
          s = r + h, u = i + h, a = o + h;
          break;
        case 1:
          r = s - h, u = i + h, a = o + h;
          break;
        case 2:
          s = r + h, i = u - h, a = o + h;
          break;
        case 3:
          r = s - h, i = u - h, a = o + h;
          break;
        case 4:
          s = r + h, u = i + h, o = a - h;
          break;
        case 5:
          r = s - h, u = i + h, o = a - h;
          break;
        case 6:
          s = r + h, i = u - h, o = a - h;
          break;
        case 7:
          r = s - h, i = u - h, o = a - h;
          break;
      }
    this._root && this._root.length && (this._root = d);
  }
  return this._x0 = r, this._y0 = i, this._z0 = o, this._x1 = s, this._y1 = u, this._z1 = a, this;
}
function xd() {
  var t = [];
  return this.visit(function(e) {
    if (!e.length)
      do
        t.push(e.data);
      while (e = e.next);
  }), t;
}
function $d(t) {
  return arguments.length ? this.cover(+t[0][0], +t[0][1], +t[0][2]).cover(+t[1][0], +t[1][1], +t[1][2]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
}
function oe(t, e, n, r, i, o, s) {
  this.node = t, this.x0 = e, this.y0 = n, this.z0 = r, this.x1 = i, this.y1 = o, this.z1 = s;
}
function kd(t, e, n, r) {
  var i, o = this._x0, s = this._y0, u = this._z0, a, h, d, f, y, b, m = this._x1, k = this._y1, $ = this._z1, _ = [], E = this._root, N, M;
  for (E && _.push(new oe(E, o, s, u, m, k, $)), r == null ? r = 1 / 0 : (o = t - r, s = e - r, u = n - r, m = t + r, k = e + r, $ = n + r, r *= r); N = _.pop(); )
    if (!(!(E = N.node) || (a = N.x0) > m || (h = N.y0) > k || (d = N.z0) > $ || (f = N.x1) < o || (y = N.y1) < s || (b = N.z1) < u))
      if (E.length) {
        var z = (a + f) / 2, A = (h + y) / 2, R = (d + b) / 2;
        _.push(
          new oe(E[7], z, A, R, f, y, b),
          new oe(E[6], a, A, R, z, y, b),
          new oe(E[5], z, h, R, f, A, b),
          new oe(E[4], a, h, R, z, A, b),
          new oe(E[3], z, A, d, f, y, R),
          new oe(E[2], a, A, d, z, y, R),
          new oe(E[1], z, h, d, f, A, R),
          new oe(E[0], a, h, d, z, A, R)
        ), (M = (n >= R) << 2 | (e >= A) << 1 | t >= z) && (N = _[_.length - 1], _[_.length - 1] = _[_.length - 1 - M], _[_.length - 1 - M] = N);
      } else {
        var B = t - +this._x.call(null, E.data), Q = e - +this._y.call(null, E.data), X = n - +this._z.call(null, E.data), ee = B * B + Q * Q + X * X;
        if (ee < r) {
          var V = Math.sqrt(r = ee);
          o = t - V, s = e - V, u = n - V, m = t + V, k = e + V, $ = n + V, i = E.data;
        }
      }
  return i;
}
function Ed(t) {
  if (isNaN(y = +this._x.call(null, t)) || isNaN(b = +this._y.call(null, t)) || isNaN(m = +this._z.call(null, t)))
    return this;
  var e, n = this._root, r, i, o, s = this._x0, u = this._y0, a = this._z0, h = this._x1, d = this._y1, f = this._z1, y, b, m, k, $, _, E, N, M, z, A;
  if (!n)
    return this;
  if (n.length)
    for (; ; ) {
      if ((E = y >= (k = (s + h) / 2)) ? s = k : h = k, (N = b >= ($ = (u + d) / 2)) ? u = $ : d = $, (M = m >= (_ = (a + f) / 2)) ? a = _ : f = _, e = n, !(n = n[z = M << 2 | N << 1 | E]))
        return this;
      if (!n.length)
        break;
      (e[z + 1 & 7] || e[z + 2 & 7] || e[z + 3 & 7] || e[z + 4 & 7] || e[z + 5 & 7] || e[z + 6 & 7] || e[z + 7 & 7]) && (r = e, A = z);
    }
  for (; n.data !== t; )
    if (i = n, !(n = n.next))
      return this;
  return (o = n.next) && delete n.next, i ? (o ? i.next = o : delete i.next, this) : e ? (o ? e[z] = o : delete e[z], (n = e[0] || e[1] || e[2] || e[3] || e[4] || e[5] || e[6] || e[7]) && n === (e[7] || e[6] || e[5] || e[4] || e[3] || e[2] || e[1] || e[0]) && !n.length && (r ? r[A] = n : this._root = n), this) : (this._root = o, this);
}
function Nd(t) {
  for (var e = 0, n = t.length; e < n; ++e)
    this.remove(t[e]);
  return this;
}
function Td() {
  return this._root;
}
function Md() {
  var t = 0;
  return this.visit(function(e) {
    if (!e.length)
      do
        ++t;
      while (e = e.next);
  }), t;
}
function zd(t) {
  var e = [], n, r = this._root, i, o, s, u, a, h, d;
  for (r && e.push(new oe(r, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); n = e.pop(); )
    if (!t(r = n.node, o = n.x0, s = n.y0, u = n.z0, a = n.x1, h = n.y1, d = n.z1) && r.length) {
      var f = (o + a) / 2, y = (s + h) / 2, b = (u + d) / 2;
      (i = r[7]) && e.push(new oe(i, f, y, b, a, h, d)), (i = r[6]) && e.push(new oe(i, o, y, b, f, h, d)), (i = r[5]) && e.push(new oe(i, f, s, b, a, y, d)), (i = r[4]) && e.push(new oe(i, o, s, b, f, y, d)), (i = r[3]) && e.push(new oe(i, f, y, u, a, h, b)), (i = r[2]) && e.push(new oe(i, o, y, u, f, h, b)), (i = r[1]) && e.push(new oe(i, f, s, u, a, y, b)), (i = r[0]) && e.push(new oe(i, o, s, u, f, y, b));
    }
  return this;
}
function Sd(t) {
  var e = [], n = [], r;
  for (this._root && e.push(new oe(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); r = e.pop(); ) {
    var i = r.node;
    if (i.length) {
      var o, s = r.x0, u = r.y0, a = r.z0, h = r.x1, d = r.y1, f = r.z1, y = (s + h) / 2, b = (u + d) / 2, m = (a + f) / 2;
      (o = i[0]) && e.push(new oe(o, s, u, a, y, b, m)), (o = i[1]) && e.push(new oe(o, y, u, a, h, b, m)), (o = i[2]) && e.push(new oe(o, s, b, a, y, d, m)), (o = i[3]) && e.push(new oe(o, y, b, a, h, d, m)), (o = i[4]) && e.push(new oe(o, s, u, m, y, b, f)), (o = i[5]) && e.push(new oe(o, y, u, m, h, b, f)), (o = i[6]) && e.push(new oe(o, s, b, m, y, d, f)), (o = i[7]) && e.push(new oe(o, y, b, m, h, d, f));
    }
    n.push(r);
  }
  for (; r = n.pop(); )
    t(r.node, r.x0, r.y0, r.z0, r.x1, r.y1, r.z1);
  return this;
}
function Cd(t) {
  return t[0];
}
function Ad(t) {
  return arguments.length ? (this._x = t, this) : this._x;
}
function Id(t) {
  return t[1];
}
function Pd(t) {
  return arguments.length ? (this._y = t, this) : this._y;
}
function Od(t) {
  return t[2];
}
function Fd(t) {
  return arguments.length ? (this._z = t, this) : this._z;
}
function Jo(t, e, n, r) {
  var i = new jr(e ?? Cd, n ?? Id, r ?? Od, NaN, NaN, NaN, NaN, NaN, NaN);
  return t == null ? i : i.addAll(t);
}
function jr(t, e, n, r, i, o, s, u, a) {
  this._x = t, this._y = e, this._z = n, this._x0 = r, this._y0 = i, this._z0 = o, this._x1 = s, this._y1 = u, this._z1 = a, this._root = void 0;
}
function Ui(t) {
  for (var e = { data: t.data }, n = e; t = t.next; )
    n = n.next = { data: t.data };
  return e;
}
var xe = Jo.prototype = jr.prototype;
xe.copy = function() {
  var t = new jr(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), e = this._root, n, r;
  if (!e)
    return t;
  if (!e.length)
    return t._root = Ui(e), t;
  for (n = [{ source: e, target: t._root = new Array(8) }]; e = n.pop(); )
    for (var i = 0; i < 8; ++i)
      (r = e.source[i]) && (r.length ? n.push({ source: r, target: e.target[i] = new Array(8) }) : e.target[i] = Ui(r));
  return t;
};
xe.add = yd;
xe.addAll = bd;
xe.cover = wd;
xe.data = xd;
xe.extent = $d;
xe.find = kd;
xe.remove = Ed;
xe.removeAll = Nd;
xe.root = Td;
xe.size = Md;
xe.visit = zd;
xe.visitAfter = Sd;
xe.x = Ad;
xe.y = Pd;
xe.z = Fd;
function Wt(t) {
  return function() {
    return t;
  };
}
function De(t) {
  return (t() - 0.5) * 1e-6;
}
function Zd(t) {
  return t.index;
}
function qi(t, e) {
  var n = t.get(e);
  if (!n)
    throw new Error("node not found: " + e);
  return n;
}
function Ld(t) {
  var e = Zd, n = y, r, i = Wt(30), o, s, u, a, h, d, f = 1;
  t == null && (t = []);
  function y(_) {
    return 1 / Math.min(a[_.source.index], a[_.target.index]);
  }
  function b(_) {
    for (var E = 0, N = t.length; E < f; ++E)
      for (var M = 0, z, A, R, B = 0, Q = 0, X = 0, ee, V; M < N; ++M)
        z = t[M], A = z.source, R = z.target, B = R.x + R.vx - A.x - A.vx || De(d), u > 1 && (Q = R.y + R.vy - A.y - A.vy || De(d)), u > 2 && (X = R.z + R.vz - A.z - A.vz || De(d)), ee = Math.sqrt(B * B + Q * Q + X * X), ee = (ee - o[M]) / ee * _ * r[M], B *= ee, Q *= ee, X *= ee, R.vx -= B * (V = h[M]), u > 1 && (R.vy -= Q * V), u > 2 && (R.vz -= X * V), A.vx += B * (V = 1 - V), u > 1 && (A.vy += Q * V), u > 2 && (A.vz += X * V);
  }
  function m() {
    if (s) {
      var _, E = s.length, N = t.length, M = new Map(s.map((A, R) => [e(A, R, s), A])), z;
      for (_ = 0, a = new Array(E); _ < N; ++_)
        z = t[_], z.index = _, typeof z.source != "object" && (z.source = qi(M, z.source)), typeof z.target != "object" && (z.target = qi(M, z.target)), a[z.source.index] = (a[z.source.index] || 0) + 1, a[z.target.index] = (a[z.target.index] || 0) + 1;
      for (_ = 0, h = new Array(N); _ < N; ++_)
        z = t[_], h[_] = a[z.source.index] / (a[z.source.index] + a[z.target.index]);
      r = new Array(N), k(), o = new Array(N), $();
    }
  }
  function k() {
    if (s)
      for (var _ = 0, E = t.length; _ < E; ++_)
        r[_] = +n(t[_], _, t);
  }
  function $() {
    if (s)
      for (var _ = 0, E = t.length; _ < E; ++_)
        o[_] = +i(t[_], _, t);
  }
  return b.initialize = function(_, ...E) {
    s = _, d = E.find((N) => typeof N == "function") || Math.random, u = E.find((N) => [1, 2, 3].includes(N)) || 2, m();
  }, b.links = function(_) {
    return arguments.length ? (t = _, m(), b) : t;
  }, b.id = function(_) {
    return arguments.length ? (e = _, b) : e;
  }, b.iterations = function(_) {
    return arguments.length ? (f = +_, b) : f;
  }, b.strength = function(_) {
    return arguments.length ? (n = typeof _ == "function" ? _ : Wt(+_), k(), b) : n;
  }, b.distance = function(_) {
    return arguments.length ? (i = typeof _ == "function" ? _ : Wt(+_), $(), b) : i;
  }, b;
}
var Rd = { value: () => {
} };
function Yo() {
  for (var t = 0, e = arguments.length, n = {}, r; t < e; ++t) {
    if (!(r = arguments[t] + "") || r in n || /[\s.]/.test(r))
      throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new An(n);
}
function An(t) {
  this._ = t;
}
function jd(t, e) {
  return t.trim().split(/^|\s+/).map(function(n) {
    var r = "", i = n.indexOf(".");
    if (i >= 0 && (r = n.slice(i + 1), n = n.slice(0, i)), n && !e.hasOwnProperty(n))
      throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
An.prototype = Yo.prototype = {
  constructor: An,
  on: function(t, e) {
    var n = this._, r = jd(t + "", n), i, o = -1, s = r.length;
    if (arguments.length < 2) {
      for (; ++o < s; )
        if ((i = (t = r[o]).type) && (i = Bd(n[i], t.name)))
          return i;
      return;
    }
    if (e != null && typeof e != "function")
      throw new Error("invalid callback: " + e);
    for (; ++o < s; )
      if (i = (t = r[o]).type)
        n[i] = Gi(n[i], t.name, e);
      else if (e == null)
        for (i in n)
          n[i] = Gi(n[i], t.name, null);
    return this;
  },
  copy: function() {
    var t = {}, e = this._;
    for (var n in e)
      t[n] = e[n].slice();
    return new An(t);
  },
  call: function(t, e) {
    if ((i = arguments.length - 2) > 0)
      for (var n = new Array(i), r = 0, i, o; r < i; ++r)
        n[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    for (o = this._[t], r = 0, i = o.length; r < i; ++r)
      o[r].value.apply(e, n);
  },
  apply: function(t, e, n) {
    if (!this._.hasOwnProperty(t))
      throw new Error("unknown type: " + t);
    for (var r = this._[t], i = 0, o = r.length; i < o; ++i)
      r[i].value.apply(e, n);
  }
};
function Bd(t, e) {
  for (var n = 0, r = t.length, i; n < r; ++n)
    if ((i = t[n]).name === e)
      return i.value;
}
function Gi(t, e, n) {
  for (var r = 0, i = t.length; r < i; ++r)
    if (t[r].name === e) {
      t[r] = Rd, t = t.slice(0, r).concat(t.slice(r + 1));
      break;
    }
  return n != null && t.push({ name: e, value: n }), t;
}
var Nt = 0, Gt = 0, Dt = 0, Xo = 1e3, Zn, Ht, Ln = 0, dt = 0, Vn = 0, on = typeof performance == "object" && performance.now ? performance : Date, es = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(t) {
  setTimeout(t, 17);
};
function ts() {
  return dt || (es(Dd), dt = on.now() + Vn);
}
function Dd() {
  dt = 0;
}
function zr() {
  this._call = this._time = this._next = null;
}
zr.prototype = ns.prototype = {
  constructor: zr,
  restart: function(t, e, n) {
    if (typeof t != "function")
      throw new TypeError("callback is not a function");
    n = (n == null ? ts() : +n) + (e == null ? 0 : +e), !this._next && Ht !== this && (Ht ? Ht._next = this : Zn = this, Ht = this), this._call = t, this._time = n, Sr();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Sr());
  }
};
function ns(t, e, n) {
  var r = new zr();
  return r.restart(t, e, n), r;
}
function Ud() {
  ts(), ++Nt;
  for (var t = Zn, e; t; )
    (e = dt - t._time) >= 0 && t._call.call(void 0, e), t = t._next;
  --Nt;
}
function Hi() {
  dt = (Ln = on.now()) + Vn, Nt = Gt = 0;
  try {
    Ud();
  } finally {
    Nt = 0, Gd(), dt = 0;
  }
}
function qd() {
  var t = on.now(), e = t - Ln;
  e > Xo && (Vn -= e, Ln = t);
}
function Gd() {
  for (var t, e = Zn, n, r = 1 / 0; e; )
    e._call ? (r > e._time && (r = e._time), t = e, e = e._next) : (n = e._next, e._next = null, e = t ? t._next = n : Zn = n);
  Ht = t, Sr(r);
}
function Sr(t) {
  if (!Nt) {
    Gt && (Gt = clearTimeout(Gt));
    var e = t - dt;
    e > 24 ? (t < 1 / 0 && (Gt = setTimeout(Hi, t - on.now() - Vn)), Dt && (Dt = clearInterval(Dt))) : (Dt || (Ln = on.now(), Dt = setInterval(qd, Xo)), Nt = 1, es(Hi));
  }
}
const Hd = 1664525, Kd = 1013904223, Ki = 4294967296;
function Vd() {
  let t = 1;
  return () => (t = (Hd * t + Kd) % Ki) / Ki;
}
var Vi = 3;
function vr(t) {
  return t.x;
}
function Wi(t) {
  return t.y;
}
function Wd(t) {
  return t.z;
}
var Qd = 10, Jd = Math.PI * (3 - Math.sqrt(5)), Yd = Math.PI * 20 / (9 + Math.sqrt(221));
function Xd(t, e) {
  e = e || 2;
  var n = Math.min(Vi, Math.max(1, Math.round(e))), r, i = 1, o = 1e-3, s = 1 - Math.pow(o, 1 / 300), u = 0, a = 0.6, h = /* @__PURE__ */ new Map(), d = ns(b), f = Yo("tick", "end"), y = Vd();
  t == null && (t = []);
  function b() {
    m(), f.call("tick", r), i < o && (d.stop(), f.call("end", r));
  }
  function m(_) {
    var E, N = t.length, M;
    _ === void 0 && (_ = 1);
    for (var z = 0; z < _; ++z)
      for (i += (u - i) * s, h.forEach(function(A) {
        A(i);
      }), E = 0; E < N; ++E)
        M = t[E], M.fx == null ? M.x += M.vx *= a : (M.x = M.fx, M.vx = 0), n > 1 && (M.fy == null ? M.y += M.vy *= a : (M.y = M.fy, M.vy = 0)), n > 2 && (M.fz == null ? M.z += M.vz *= a : (M.z = M.fz, M.vz = 0));
    return r;
  }
  function k() {
    for (var _ = 0, E = t.length, N; _ < E; ++_) {
      if (N = t[_], N.index = _, N.fx != null && (N.x = N.fx), N.fy != null && (N.y = N.fy), N.fz != null && (N.z = N.fz), isNaN(N.x) || n > 1 && isNaN(N.y) || n > 2 && isNaN(N.z)) {
        var M = Qd * (n > 2 ? Math.cbrt(0.5 + _) : n > 1 ? Math.sqrt(0.5 + _) : _), z = _ * Jd, A = _ * Yd;
        n === 1 ? N.x = M : n === 2 ? (N.x = M * Math.cos(z), N.y = M * Math.sin(z)) : (N.x = M * Math.sin(z) * Math.cos(A), N.y = M * Math.cos(z), N.z = M * Math.sin(z) * Math.sin(A));
      }
      (isNaN(N.vx) || n > 1 && isNaN(N.vy) || n > 2 && isNaN(N.vz)) && (N.vx = 0, n > 1 && (N.vy = 0), n > 2 && (N.vz = 0));
    }
  }
  function $(_) {
    return _.initialize && _.initialize(t, y, n), _;
  }
  return k(), r = {
    tick: m,
    restart: function() {
      return d.restart(b), r;
    },
    stop: function() {
      return d.stop(), r;
    },
    numDimensions: function(_) {
      return arguments.length ? (n = Math.min(Vi, Math.max(1, Math.round(_))), h.forEach($), r) : n;
    },
    nodes: function(_) {
      return arguments.length ? (t = _, k(), h.forEach($), r) : t;
    },
    alpha: function(_) {
      return arguments.length ? (i = +_, r) : i;
    },
    alphaMin: function(_) {
      return arguments.length ? (o = +_, r) : o;
    },
    alphaDecay: function(_) {
      return arguments.length ? (s = +_, r) : +s;
    },
    alphaTarget: function(_) {
      return arguments.length ? (u = +_, r) : u;
    },
    velocityDecay: function(_) {
      return arguments.length ? (a = 1 - _, r) : 1 - a;
    },
    randomSource: function(_) {
      return arguments.length ? (y = _, h.forEach($), r) : y;
    },
    force: function(_, E) {
      return arguments.length > 1 ? (E == null ? h.delete(_) : h.set(_, $(E)), r) : h.get(_);
    },
    find: function() {
      var _ = Array.prototype.slice.call(arguments), E = _.shift() || 0, N = (n > 1 ? _.shift() : null) || 0, M = (n > 2 ? _.shift() : null) || 0, z = _.shift() || 1 / 0, A = 0, R = t.length, B, Q, X, ee, V, be;
      for (z *= z, A = 0; A < R; ++A)
        V = t[A], B = E - V.x, Q = N - (V.y || 0), X = M - (V.z || 0), ee = B * B + Q * Q + X * X, ee < z && (be = V, z = ee);
      return be;
    },
    on: function(_, E) {
      return arguments.length > 1 ? (f.on(_, E), r) : f.on(_);
    }
  };
}
function ef() {
  var t, e, n, r, i, o = Wt(-30), s, u = 1, a = 1 / 0, h = 0.81;
  function d(m) {
    var k, $ = t.length, _ = (e === 1 ? Ko(t, vr) : e === 2 ? Wo(t, vr, Wi) : e === 3 ? Jo(t, vr, Wi, Wd) : null).visitAfter(y);
    for (i = m, k = 0; k < $; ++k)
      n = t[k], _.visit(b);
  }
  function f() {
    if (t) {
      var m, k = t.length, $;
      for (s = new Array(k), m = 0; m < k; ++m)
        $ = t[m], s[$.index] = +o($, m, t);
    }
  }
  function y(m) {
    var k = 0, $, _, E = 0, N, M, z, A, R = m.length;
    if (R) {
      for (N = M = z = A = 0; A < R; ++A)
        ($ = m[A]) && (_ = Math.abs($.value)) && (k += $.value, E += _, N += _ * ($.x || 0), M += _ * ($.y || 0), z += _ * ($.z || 0));
      k *= Math.sqrt(4 / R), m.x = N / E, e > 1 && (m.y = M / E), e > 2 && (m.z = z / E);
    } else {
      $ = m, $.x = $.data.x, e > 1 && ($.y = $.data.y), e > 2 && ($.z = $.data.z);
      do
        k += s[$.data.index];
      while ($ = $.next);
    }
    m.value = k;
  }
  function b(m, k, $, _, E) {
    if (!m.value)
      return !0;
    var N = [$, _, E][e - 1], M = m.x - n.x, z = e > 1 ? m.y - n.y : 0, A = e > 2 ? m.z - n.z : 0, R = N - k, B = M * M + z * z + A * A;
    if (R * R / h < B)
      return B < a && (M === 0 && (M = De(r), B += M * M), e > 1 && z === 0 && (z = De(r), B += z * z), e > 2 && A === 0 && (A = De(r), B += A * A), B < u && (B = Math.sqrt(u * B)), n.vx += M * m.value * i / B, e > 1 && (n.vy += z * m.value * i / B), e > 2 && (n.vz += A * m.value * i / B)), !0;
    if (m.length || B >= a)
      return;
    (m.data !== n || m.next) && (M === 0 && (M = De(r), B += M * M), e > 1 && z === 0 && (z = De(r), B += z * z), e > 2 && A === 0 && (A = De(r), B += A * A), B < u && (B = Math.sqrt(u * B)));
    do
      m.data !== n && (R = s[m.data.index] * i / B, n.vx += M * R, e > 1 && (n.vy += z * R), e > 2 && (n.vz += A * R));
    while (m = m.next);
  }
  return d.initialize = function(m, ...k) {
    t = m, r = k.find(($) => typeof $ == "function") || Math.random, e = k.find(($) => [1, 2, 3].includes($)) || 2, f();
  }, d.strength = function(m) {
    return arguments.length ? (o = typeof m == "function" ? m : Wt(+m), f(), d) : o;
  }, d.distanceMin = function(m) {
    return arguments.length ? (u = m * m, d) : Math.sqrt(u);
  }, d.distanceMax = function(m) {
    return arguments.length ? (a = m * m, d) : Math.sqrt(a);
  }, d.theta = function(m) {
    return arguments.length ? (h = m * m, d) : Math.sqrt(h);
  }, d;
}
function Cr(t) {
  return typeof t == "object" && t !== null && "index" in t && typeof t.index == "number" && "x" in t && typeof t.x == "number" && "y" in t && typeof t.y == "number" && "z" in t && typeof t.z == "number" && "vx" in t && typeof t.vx == "number" && "vy" in t && typeof t.vy == "number" && "vz" in t && typeof t.vz == "number";
}
function tf(t) {
  return !!(typeof t == "object" && t !== null && Object.hasOwn(t, "index") && "index" in t && typeof t.index == "number" && "source" in t && Cr(t.source) && "target" in t && Cr(t.target));
}
class nf {
  constructor() {
    this.d3AlphaMin = 0.1, this.d3AlphaTarget = 0, this.d3AlphaDecay = 0.0228, this.d3VelocityDecay = 0.4, this.nodeMapping = /* @__PURE__ */ new Map(), this.edgeMapping = /* @__PURE__ */ new Map(), this.newNodeMap = /* @__PURE__ */ new Map(), this.newEdgeMap = /* @__PURE__ */ new Map(), this.reheat = !1, this.d3ForceLayout = Xd().numDimensions(3).alpha(1).force("link", Ld()).force("charge", ef()).force("center", Dl()).force("dagRadial", null).stop(), this.d3ForceLayout.force("link").id((e) => e.id);
  }
  get graphNeedsRefresh() {
    return !!this.newNodeMap.size || !!this.newEdgeMap.size;
  }
  async init() {
  }
  refresh() {
    if (this.graphNeedsRefresh || this.reheat) {
      let e = [...this.nodeMapping.values()];
      e = e.concat([...this.newNodeMap.values()]), this.d3ForceLayout.alpha(1).nodes(e).stop();
      for (const r of this.newNodeMap.entries()) {
        const i = r[0], o = r[1];
        if (!Cr(o))
          throw new Error("Internal error: Node is not settled as a complete D3 Node");
        this.nodeMapping.set(i, o);
      }
      this.newNodeMap.clear();
      let n = [...this.edgeMapping.values()];
      n = n.concat([...this.newEdgeMap.values()]), this.d3ForceLayout.force("link").links(n);
      for (const r of this.newEdgeMap.entries()) {
        const i = r[0], o = r[1];
        if (!tf(o))
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
  addNode(e) {
    this.newNodeMap.set(e, { id: e.id });
  }
  addEdge(e) {
    this.newEdgeMap.set(e, {
      source: e.srcId,
      target: e.dstId
    });
  }
  get nodes() {
    return this.nodeMapping.keys();
  }
  get edges() {
    return this.edgeMapping.keys();
  }
  getNodePosition(e) {
    const n = this._getMappedNode(e);
    if (n.x === void 0 || n.y === void 0 || n.z === void 0)
      throw new Error("Internal error: Node not initialized in D3GraphEngine");
    return {
      x: n.x,
      y: n.y,
      z: n.z
    };
  }
  setNodePosition(e, n) {
    const r = this._getMappedNode(e);
    r.x = n.x, r.y = n.y, r.z = n.z ?? 0, this.reheat = !0;
  }
  getEdgePosition(e) {
    const n = this._getMappedEdge(e);
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
  pin(e) {
    const n = this._getMappedNode(e);
    n.fx = n.x, n.fy = n.y, n.fz = n.z, this.reheat = !0;
  }
  unpin(e) {
    const n = this._getMappedNode(e);
    n.fx = void 0, n.fy = void 0, n.fz = void 0, this.reheat = !0;
  }
  _getMappedNode(e) {
    this.refresh();
    const n = this.nodeMapping.get(e);
    if (!n)
      throw new Error("Internal error: Node not found in D3GraphEngine");
    return n;
  }
  _getMappedEdge(e) {
    this.refresh();
    const n = this.edgeMapping.get(e);
    if (!n)
      throw new Error("Internal error: Edge not found in D3GraphEngine");
    return n;
  }
}
class rf {
  constructor() {
    this.meshCacheMap = /* @__PURE__ */ new Map(), this.hits = 0, this.misses = 0;
  }
  get(e, n) {
    let r = this.meshCacheMap.get(e);
    return r ? (this.hits++, r.createInstance(e)) : (this.misses++, r = n(), r.isVisible = !1, this.meshCacheMap.set(e, r), r.createInstance(e));
  }
  reset() {
    this.hits = 0, this.misses = 0;
  }
}
var Sn = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Wn(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Br = function(e) {
  sf(e);
  var n = of(e);
  return e.on = n.on, e.off = n.off, e.fire = n.fire, e;
};
function of(t) {
  var e = /* @__PURE__ */ Object.create(null);
  return {
    on: function(n, r, i) {
      if (typeof r != "function")
        throw new Error("callback is expected to be a function");
      var o = e[n];
      return o || (o = e[n] = []), o.push({ callback: r, ctx: i }), t;
    },
    off: function(n, r) {
      var i = typeof n > "u";
      if (i)
        return e = /* @__PURE__ */ Object.create(null), t;
      if (e[n]) {
        var o = typeof r != "function";
        if (o)
          delete e[n];
        else
          for (var s = e[n], u = 0; u < s.length; ++u)
            s[u].callback === r && s.splice(u, 1);
      }
      return t;
    },
    fire: function(n) {
      var r = e[n];
      if (!r)
        return t;
      var i;
      arguments.length > 1 && (i = Array.prototype.splice.call(arguments, 1));
      for (var o = 0; o < r.length; ++o) {
        var s = r[o];
        s.callback.apply(s.ctx, i);
      }
      return t;
    }
  };
}
function sf(t) {
  if (!t)
    throw new Error("Eventify cannot use falsy object as events subject");
  for (var e = ["on", "fire", "off"], n = 0; n < e.length; ++n)
    if (t.hasOwnProperty(e[n]))
      throw new Error("Subject cannot be eventified, since it already has property '" + e[n] + "'");
}
var af = cf, uf = Br;
function cf(t) {
  if (t = t || {}, "uniqueLinkId" in t && (console.warn(
    "ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\nUse `multigraph` option instead\n",
    `
`,
    `Note: there is also change in default behavior: From now on each graph
is considered to be not a multigraph by default (each edge is unique).`
  ), t.multigraph = t.uniqueLinkId), t.multigraph === void 0 && (t.multigraph = !1), typeof Map != "function")
    throw new Error("ngraph.graph requires `Map` to be defined. Please polyfill it before using ngraph");
  var e = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = {}, i = 0, o = t.multigraph ? M : N, s = [], u = O, a = O, h = O, d = O, f = {
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
    addNode: k,
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
    addLink: E,
    /**
     * Removes link from the graph. If link does not exist does nothing.
     *
     * @param link - object returned by addLink() or getLinks() methods.
     *
     * @returns true if link was removed; false otherwise.
     */
    removeLink: B,
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
    getNode: $,
    /**
     * Gets number of nodes in this graph.
     *
     * @return number of nodes in the graph.
     */
    getNodeCount: z,
    /**
     * Gets total number of links in the graph.
     */
    getLinkCount: A,
    /**
     * Gets total number of links in the graph.
     */
    getEdgeCount: A,
    /**
     * Synonym for `getLinkCount()`
     */
    getLinksCount: A,
    /**
     * Synonym for `getNodeCount()`
     */
    getNodesCount: z,
    /**
     * Gets all links (inbound and outbound) from the node with given id.
     * If node with given id is not found null is returned.
     *
     * @param nodeId requested node identifier.
     *
     * @return Set of links from and to requested node if such node exists;
     *   otherwise null is returned.
     */
    getLinks: R,
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
    forEachLink: V,
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
    clear: ee,
    /**
     * Detects whether there is a link between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     * NOTE: this function is synonym for getLink()
     *
     * @returns link if there is one. null otherwise.
     */
    hasLink: X,
    /**
     * Detects whether there is a node with given id
     * 
     * Operation complexity is O(1)
     * NOTE: this function is synonym for getNode()
     *
     * @returns node if there is one; Falsy value otherwise.
     */
    hasNode: $,
    /**
     * Gets an edge between two nodes.
     * Operation complexity is O(n) where n - number of links of a node.
     *
     * @param {string} fromId link start identifier
     * @param {string} toId link end identifier
     *
     * @returns link if there is one; undefined otherwise.
     */
    getLink: X
  };
  return uf(f), y(), f;
  function y() {
    var F = f.on;
    f.on = j;
    function j() {
      return f.beginUpdate = h = ne, f.endUpdate = d = me, u = b, a = m, f.on = F, F.apply(f, arguments);
    }
  }
  function b(F, j) {
    s.push({
      link: F,
      changeType: j
    });
  }
  function m(F, j) {
    s.push({
      node: F,
      changeType: j
    });
  }
  function k(F, j) {
    if (F === void 0)
      throw new Error("Invalid node identifier");
    h();
    var K = $(F);
    return K ? (K.data = j, a(K, "update")) : (K = new hf(F, j), a(K, "add")), e.set(F, K), d(), K;
  }
  function $(F) {
    return e.get(F);
  }
  function _(F) {
    var j = $(F);
    if (!j)
      return !1;
    h();
    var K = j.links;
    return K && (K.forEach(Q), j.links = null), e.delete(F), a(j, "remove"), d(), !0;
  }
  function E(F, j, K) {
    h();
    var D = $(F) || k(F), ae = $(j) || k(j), se = o(F, j, K), de = n.has(se.id);
    return n.set(se.id, se), Qi(D, se), F !== j && Qi(ae, se), u(se, de ? "update" : "add"), d(), se;
  }
  function N(F, j, K) {
    var D = Cn(F, j), ae = n.get(D);
    return ae ? (ae.data = K, ae) : new Ji(F, j, K, D);
  }
  function M(F, j, K) {
    var D = Cn(F, j), ae = r.hasOwnProperty(D);
    if (ae || X(F, j)) {
      ae || (r[D] = 0);
      var se = "@" + ++r[D];
      D = Cn(F + se, j + se);
    }
    return new Ji(F, j, K, D);
  }
  function z() {
    return e.size;
  }
  function A() {
    return n.size;
  }
  function R(F) {
    var j = $(F);
    return j ? j.links : null;
  }
  function B(F, j) {
    return j !== void 0 && (F = X(F, j)), Q(F);
  }
  function Q(F) {
    if (!F || !n.get(F.id))
      return !1;
    h(), n.delete(F.id);
    var j = $(F.fromId), K = $(F.toId);
    return j && j.links.delete(F), K && K.links.delete(F), u(F, "remove"), d(), !0;
  }
  function X(F, j) {
    if (!(F === void 0 || j === void 0))
      return n.get(Cn(F, j));
  }
  function ee() {
    h(), we(function(F) {
      _(F.id);
    }), d();
  }
  function V(F) {
    if (typeof F == "function")
      for (var j = n.values(), K = j.next(); !K.done; ) {
        if (F(K.value))
          return !0;
        K = j.next();
      }
  }
  function be(F, j, K) {
    var D = $(F);
    if (D && D.links && typeof j == "function")
      return K ? C(D.links, F, j) : I(D.links, F, j);
  }
  function I(F, j, K) {
    for (var D, ae = F.values(), se = ae.next(); !se.done; ) {
      var de = se.value, He = de.fromId === j ? de.toId : de.fromId;
      if (D = K(e.get(He), de), D)
        return !0;
      se = ae.next();
    }
  }
  function C(F, j, K) {
    for (var D, ae = F.values(), se = ae.next(); !se.done; ) {
      var de = se.value;
      if (de.fromId === j && (D = K(e.get(de.toId), de), D))
        return !0;
      se = ae.next();
    }
  }
  function O() {
  }
  function ne() {
    i += 1;
  }
  function me() {
    i -= 1, i === 0 && s.length > 0 && (f.fire("changed", s), s.length = 0);
  }
  function we(F) {
    if (typeof F != "function")
      throw new Error("Function is expected to iterate over graph nodes. You passed " + F);
    for (var j = e.values(), K = j.next(); !K.done; ) {
      if (F(K.value))
        return !0;
      K = j.next();
    }
  }
}
function hf(t, e) {
  this.id = t, this.links = null, this.data = e;
}
function Qi(t, e) {
  t.links ? t.links.add(e) : t.links = /* @__PURE__ */ new Set([e]);
}
function Ji(t, e, n, r) {
  this.fromId = t, this.toId = e, this.data = n, this.id = r;
}
function Cn(t, e) {
  return t.toString() + "👉 " + e.toString();
}
const lf = /* @__PURE__ */ Wn(af);
var Dr = { exports: {} }, hn = { exports: {} }, rs = function(e) {
  return e === 0 ? "x" : e === 1 ? "y" : e === 2 ? "z" : "c" + (e + 1);
};
const df = rs;
var zt = function(e) {
  return n;
  function n(r, i) {
    let o = i && i.indent || 0, s = i && i.join !== void 0 ? i.join : `
`, u = Array(o + 1).join(" "), a = [];
    for (let h = 0; h < e; ++h) {
      let d = df(h), f = h === 0 ? "" : u;
      a.push(f + r.replace(/{var}/g, d));
    }
    return a.join(s);
  }
};
const is = zt;
hn.exports = ff;
hn.exports.generateCreateBodyFunctionBody = os;
hn.exports.getVectorCode = as;
hn.exports.getBodyCode = ss;
function ff(t, e) {
  let n = os(t, e), { Body: r } = new Function(n)();
  return r;
}
function os(t, e) {
  return `
${as(t, e)}
${ss(t)}
return {Body: Body, Vector: Vector};
`;
}
function ss(t) {
  let e = is(t), n = e("{var}", { join: ", " });
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
  ${e("this.pos.{var} = {var} || 0;", { indent: 2 })}
};`;
}
function as(t, e) {
  let n = is(t), r = "";
  return e && (r = `${n(`
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
var pf = hn.exports, ot = { exports: {} };
const Ur = zt, We = rs;
ot.exports = gf;
ot.exports.generateQuadTreeFunctionBody = us;
ot.exports.getInsertStackCode = fs;
ot.exports.getQuadNodeCode = ds;
ot.exports.isSamePosition = cs;
ot.exports.getChildBodyCode = ls;
ot.exports.setChildBodyCode = hs;
function gf(t) {
  let e = us(t);
  return new Function(e)();
}
function us(t) {
  let e = Ur(t), n = Math.pow(2, t);
  return `
${fs()}
${ds(t)}
${cs(t)}
${ls(t)}
${hs(t)}

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
${s("      node.")}
      node.body = null;
      node.mass = ${e("node.mass_{var} = ", { join: "" })}0;
      ${e("node.min_{var} = node.max_{var} = ", { join: "" })}0;
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
    ${e("var d{var};", { indent: 4 })}
    var r; 
    ${e("var f{var} = 0;", { indent: 4 })}
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
        ${e("d{var} = body.pos.{var} - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${e("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${e("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${e("d{var} * d{var}", { join: " + " })});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${e("f{var} += v * d{var};", { indent: 8 })}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${e("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${e("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${e("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${e("d{var} * d{var}", { join: " + " })});
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${We(0)} - node.min_${We(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${e("f{var} += v * d{var};", { indent: 10 })}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${o()}
        }
      }
    }

    ${e("sourceBody.force.{var} += f{var};", { indent: 4 })}
  }

  function insertBodies(bodies) {
    ${e("var {var}min = Number.MAX_VALUE;", { indent: 4 })}
    ${e("var {var}max = Number.MIN_VALUE;", { indent: 4 })}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${e("if (pos.{var} < {var}min) {var}min = pos.{var};", { indent: 6 })}
      ${e("if (pos.{var} > {var}max) {var}max = pos.{var};", { indent: 6 })}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${e("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;", { indent: 4 })}

    currentInCache = 0;
    root = newNode();
    ${e("root.min_{var} = {var}min;", { indent: 4 })}
    ${e("root.max_{var} = {var}min + maxSideLength;", { indent: 4 })}

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
        ${e("var {var} = body.pos.{var};", { indent: 8 })}
        node.mass += body.mass;
        ${e("node.mass_{var} += body.mass * {var};", { indent: 8 })}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${e("var min_{var} = node.min_{var};", { indent: 8 })}
        ${e("var max_{var} = (min_{var} + node.max_{var}) / 2;", { indent: 8 })}

${i(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${e("child.min_{var} = min_{var};", { indent: 10 })}
          ${e("child.max_{var} = max_{var};", { indent: 10 })}
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
            ${e("var d{var} = (node.max_{var} - node.min_{var}) * offset;", { indent: 12 })}

            ${e("oldBody.pos.{var} = node.min_{var} + d{var};", { indent: 12 })}
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
    let a = [], h = Array(u + 1).join(" ");
    for (let d = 0; d < t; ++d)
      a.push(h + `if (${We(d)} > max_${We(d)}) {`), a.push(h + `  quadIdx = quadIdx + ${Math.pow(2, d)};`), a.push(h + `  min_${We(d)} = max_${We(d)};`), a.push(h + `  max_${We(d)} = node.max_${We(d)};`), a.push(h + "}");
    return a.join(`
`);
  }
  function o() {
    let u = Array(11).join(" "), a = [];
    for (let h = 0; h < n; ++h)
      a.push(u + `if (node.quad${h}) {`), a.push(u + `  queue[pushIdx] = node.quad${h};`), a.push(u + "  queueLength += 1;"), a.push(u + "  pushIdx += 1;"), a.push(u + "}");
    return a.join(`
`);
  }
  function s(u) {
    let a = [];
    for (let h = 0; h < n; ++h)
      a.push(`${u}quad${h} = null;`);
    return a.join(`
`);
  }
}
function cs(t) {
  let e = Ur(t);
  return `
  function isSamePosition(point1, point2) {
    ${e("var d{var} = Math.abs(point1.{var} - point2.{var});", { indent: 2 })}
  
    return ${e("d{var} < 1e-8", { join: " && " })};
  }  
`;
}
function hs(t) {
  var e = Math.pow(2, t);
  return `
function setChild(node, idx, child) {
  ${n()}
}`;
  function n() {
    let r = [];
    for (let i = 0; i < e; ++i) {
      let o = i === 0 ? "  " : "  else ";
      r.push(`${o}if (idx === ${i}) node.quad${i} = child;`);
    }
    return r.join(`
`);
  }
}
function ls(t) {
  return `function getChild(node, idx) {
${e()}
  return null;
}`;
  function e() {
    let n = [], r = Math.pow(2, t);
    for (let i = 0; i < r; ++i)
      n.push(`  if (idx === ${i}) return node.quad${i};`);
    return n.join(`
`);
  }
}
function ds(t) {
  let e = Ur(t), n = Math.pow(2, t);
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
  ${e("this.mass_{var} = 0;", { indent: 2 })}

  // bounding box coordinates
  ${e("this.min_{var} = 0;", { indent: 2 })}
  ${e("this.max_{var} = 0;", { indent: 2 })}
}
`;
  return r;
  function i(o) {
    let s = [];
    for (let u = 0; u < n; ++u)
      s.push(`${o}quad${u} = null;`);
    return s.join(`
`);
  }
}
function fs() {
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
var vf = ot.exports, qr = { exports: {} };
qr.exports = mf;
qr.exports.generateFunctionBody = ps;
const _f = zt;
function mf(t) {
  let e = ps(t);
  return new Function("bodies", "settings", "random", e);
}
function ps(t) {
  let e = _f(t);
  return `
  var boundingBox = {
    ${e("min_{var}: 0, max_{var}: 0,", { indent: 4 })}
  };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset: resetBoundingBox,

    getBestNewPosition: function (neighbors) {
      var ${e("base_{var} = 0", { join: ", " })};

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          let neighborPos = neighbors[i].pos;
          ${e("base_{var} += neighborPos.{var};", { indent: 10 })}
        }

        ${e("base_{var} /= neighbors.length;", { indent: 8 })}
      } else {
        ${e("base_{var} = (boundingBox.min_{var} + boundingBox.max_{var}) / 2;", { indent: 8 })}
      }

      var springLength = settings.springLength;
      return {
        ${e("{var}: base_{var} + (random.nextDouble() - 0.5) * springLength,", { indent: 8 })}
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) return; // No bodies - no borders.

    ${e("var max_{var} = -Infinity;", { indent: 4 })}
    ${e("var min_{var} = Infinity;", { indent: 4 })}

    while(i--) {
      // this is O(n), it could be done faster with quadtree, if we check the root node bounds
      var bodyPos = bodies[i].pos;
      ${e("if (bodyPos.{var} < min_{var}) min_{var} = bodyPos.{var};", { indent: 6 })}
      ${e("if (bodyPos.{var} > max_{var}) max_{var} = bodyPos.{var};", { indent: 6 })}
    }

    ${e("boundingBox.min_{var} = min_{var};", { indent: 4 })}
    ${e("boundingBox.max_{var} = max_{var};", { indent: 4 })}
  }

  function resetBoundingBox() {
    ${e("boundingBox.min_{var} = boundingBox.max_{var} = 0;", { indent: 4 })}
  }
`;
}
var yf = qr.exports, Gr = { exports: {} };
const bf = zt;
Gr.exports = wf;
Gr.exports.generateCreateDragForceFunctionBody = gs;
function wf(t) {
  let e = gs(t);
  return new Function("options", e);
}
function gs(t) {
  return `
  if (!Number.isFinite(options.dragCoefficient)) throw new Error('dragCoefficient is not a finite number');

  return {
    update: function(body) {
      ${bf(t)("body.force.{var} -= options.dragCoefficient * body.velocity.{var};", { indent: 6 })}
    }
  };
`;
}
var xf = Gr.exports, Hr = { exports: {} };
const $f = zt;
Hr.exports = kf;
Hr.exports.generateCreateSpringForceFunctionBody = vs;
function kf(t) {
  let e = vs(t);
  return new Function("options", "random", e);
}
function vs(t) {
  let e = $f(t);
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
      ${e("var d{var} = body2.pos.{var} - body1.pos.{var};", { indent: 6 })}
      var r = Math.sqrt(${e("d{var} * d{var}", { join: " + " })});

      if (r === 0) {
        ${e("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 8 })}
        r = Math.sqrt(${e("d{var} * d{var}", { join: " + " })});
      }

      var d = r - length;
      var coefficient = ((spring.coefficient > 0) ? spring.coefficient : options.springCoefficient) * d / r;

      ${e("body1.force.{var} += coefficient * d{var}", { indent: 6 })};
      body1.springCount += 1;
      body1.springLength += r;

      ${e("body2.force.{var} -= coefficient * d{var}", { indent: 6 })};
      body2.springCount += 1;
      body2.springLength += r;
    }
  };
`;
}
var Ef = Hr.exports, Kr = { exports: {} };
const Nf = zt;
Kr.exports = Tf;
Kr.exports.generateIntegratorFunctionBody = _s;
function Tf(t) {
  let e = _s(t);
  return new Function("bodies", "timeStep", "adaptiveTimeStepWeight", e);
}
function _s(t) {
  let e = Nf(t);
  return `
  var length = bodies.length;
  if (length === 0) return 0;

  ${e("var d{var} = 0, t{var} = 0;", { indent: 2 })}

  for (var i = 0; i < length; ++i) {
    var body = bodies[i];
    if (body.isPinned) continue;

    if (adaptiveTimeStepWeight && body.springCount) {
      timeStep = (adaptiveTimeStepWeight * body.springLength/body.springCount);
    }

    var coeff = timeStep / body.mass;

    ${e("body.velocity.{var} += coeff * body.force.{var};", { indent: 4 })}
    ${e("var v{var} = body.velocity.{var};", { indent: 4 })}
    var v = Math.sqrt(${e("v{var} * v{var}", { join: " + " })});

    if (v > 1) {
      // We normalize it so that we move within timeStep range. 
      // for the case when v <= 1 - we let velocity to fade out.
      ${e("body.velocity.{var} = v{var} / v;", { indent: 6 })}
    }

    ${e("d{var} = timeStep * body.velocity.{var};", { indent: 4 })}

    ${e("body.pos.{var} += d{var};", { indent: 4 })}

    ${e("t{var} += Math.abs(d{var});", { indent: 4 })}
  }

  return (${e("t{var} * t{var}", { join: " + " })})/length;
`;
}
var Mf = Kr.exports, _r, Yi;
function zf() {
  if (Yi)
    return _r;
  Yi = 1, _r = t;
  function t(e, n, r, i) {
    this.from = e, this.to = n, this.length = r, this.coefficient = i;
  }
  return _r;
}
var mr, Xi;
function Sf() {
  if (Xi)
    return mr;
  Xi = 1, mr = t;
  function t(e, n) {
    var r;
    if (e || (e = {}), n) {
      for (r in n)
        if (n.hasOwnProperty(r)) {
          var i = e.hasOwnProperty(r), o = typeof n[r], s = !i || typeof e[r] !== o;
          s ? e[r] = n[r] : o === "object" && (e[r] = t(e[r], n[r]));
        }
    }
    return e;
  }
  return mr;
}
var Ut = { exports: {} }, eo;
function Cf() {
  if (eo)
    return Ut.exports;
  eo = 1, Ut.exports = t, Ut.exports.random = t, Ut.exports.randomIterator = u;
  function t(a) {
    var h = typeof a == "number" ? a : +/* @__PURE__ */ new Date();
    return new e(h);
  }
  function e(a) {
    this.seed = a;
  }
  e.prototype.next = s, e.prototype.nextDouble = o, e.prototype.uniform = o, e.prototype.gaussian = n;
  function n() {
    var a, h, d;
    do
      h = this.nextDouble() * 2 - 1, d = this.nextDouble() * 2 - 1, a = h * h + d * d;
    while (a >= 1 || a === 0);
    return h * Math.sqrt(-2 * Math.log(a) / a);
  }
  e.prototype.levy = r;
  function r() {
    var a = 1.5, h = Math.pow(
      i(1 + a) * Math.sin(Math.PI * a / 2) / (i((1 + a) / 2) * a * Math.pow(2, (a - 1) / 2)),
      1 / a
    );
    return this.gaussian() * h / Math.pow(Math.abs(this.gaussian()), 1 / a);
  }
  function i(a) {
    return Math.sqrt(2 * Math.PI / a) * Math.pow(1 / Math.E * (a + 1 / (12 * a - 1 / (10 * a))), a);
  }
  function o() {
    var a = this.seed;
    return a = a + 2127912214 + (a << 12) & 4294967295, a = (a ^ 3345072700 ^ a >>> 19) & 4294967295, a = a + 374761393 + (a << 5) & 4294967295, a = (a + 3550635116 ^ a << 9) & 4294967295, a = a + 4251993797 + (a << 3) & 4294967295, a = (a ^ 3042594569 ^ a >>> 16) & 4294967295, this.seed = a, (a & 268435455) / 268435456;
  }
  function s(a) {
    return Math.floor(this.nextDouble() * a);
  }
  function u(a, h) {
    var d = h || t();
    if (typeof d.next != "function")
      throw new Error("customRandom does not match expected API: next() function is missing");
    return {
      forEach: y,
      /**
       * Shuffles array randomly, in place.
       */
      shuffle: f
    };
    function f() {
      var b, m, k;
      for (b = a.length - 1; b > 0; --b)
        m = d.next(b + 1), k = a[m], a[m] = a[b], a[b] = k;
      return a;
    }
    function y(b) {
      var m, k, $;
      for (m = a.length - 1; m > 0; --m)
        k = d.next(m + 1), $ = a[k], a[k] = a[m], a[m] = $, b($);
      a.length && b(a[0]);
    }
  }
  return Ut.exports;
}
var ms = Lf, Af = pf, If = vf, Pf = yf, Of = xf, Ff = Ef, Zf = Mf, to = {};
function Lf(t) {
  var e = zf(), n = Sf(), r = Br;
  if (t) {
    if (t.springCoeff !== void 0)
      throw new Error("springCoeff was renamed to springCoefficient");
    if (t.dragCoeff !== void 0)
      throw new Error("dragCoeff was renamed to dragCoefficient");
  }
  t = n(t, {
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
  var i = to[t.dimensions];
  if (!i) {
    var o = t.dimensions;
    i = {
      Body: Af(o, t.debug),
      createQuadTree: If(o),
      createBounds: Pf(o),
      createDragForce: Of(o),
      createSpringForce: Ff(o),
      integrate: Zf(o)
    }, to[o] = i;
  }
  var s = i.Body, u = i.createQuadTree, a = i.createBounds, h = i.createDragForce, d = i.createSpringForce, f = i.integrate, y = (C) => new s(C), b = Cf().random(42), m = [], k = [], $ = u(t, b), _ = a(m, t, b), E = d(t, b), N = h(t), M = 0, z = [], A = /* @__PURE__ */ new Map(), R = 0;
  X("nbody", be), X("spring", I);
  var B = {
    /**
     * Array of bodies, registered with current simulator
     *
     * Note: To add new body, use addBody() method. This property is only
     * exposed for testing/performance purposes.
     */
    bodies: m,
    quadTree: $,
    /**
     * Array of springs, registered with current simulator
     *
     * Note: To add new spring, use addSpring() method. This property is only
     * exposed for testing/performance purposes.
     */
    springs: k,
    /**
     * Returns settings with which current simulator was initialized
     */
    settings: t,
    /**
     * Adds a new force to simulation
     */
    addForce: X,
    /**
     * Removes a force from the simulation.
     */
    removeForce: ee,
    /**
     * Returns a map of all registered forces.
     */
    getForces: V,
    /**
     * Performs one step of force simulation.
     *
     * @returns {boolean} true if system is considered stable; False otherwise.
     */
    step: function() {
      for (var C = 0; C < z.length; ++C)
        z[C](R);
      var O = f(m, t.timeStep, t.adaptiveTimeStepWeight);
      return R += 1, O;
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
      var O = y(C);
      return m.push(O), O;
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
        var O = m.indexOf(C);
        if (!(O < 0))
          return m.splice(O, 1), m.length === 0 && _.reset(), !0;
      }
    },
    /**
     * Adds a spring to this simulation.
     *
     * @returns {Object} - a handle for a spring. If you want to later remove
     * spring pass it to removeSpring() method.
     */
    addSpring: function(C, O, ne, me) {
      if (!C || !O)
        throw new Error("Cannot add null spring to force simulator");
      typeof ne != "number" && (ne = -1);
      var we = new e(C, O, ne, me >= 0 ? me : -1);
      return k.push(we), we;
    },
    /**
     * Returns amount of movement performed on last step() call
     */
    getTotalMovement: function() {
      return M;
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
        var O = k.indexOf(C);
        if (O > -1)
          return k.splice(O, 1), !0;
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
      return C !== void 0 ? (t.gravity = C, $.options({ gravity: C }), this) : t.gravity;
    },
    theta: function(C) {
      return C !== void 0 ? (t.theta = C, $.options({ theta: C }), this) : t.theta;
    },
    /**
     * Returns pseudo-random number generator instance.
     */
    random: b
  };
  return Rf(t, B), r(B), B;
  function Q() {
    return _.update(), _.box;
  }
  function X(C, O) {
    if (A.has(C))
      throw new Error("Force " + C + " is already added");
    A.set(C, O), z.push(O);
  }
  function ee(C) {
    var O = z.indexOf(A.get(C));
    O < 0 || (z.splice(O, 1), A.delete(C));
  }
  function V() {
    return A;
  }
  function be() {
    if (m.length !== 0) {
      $.insertBodies(m);
      for (var C = m.length; C--; ) {
        var O = m[C];
        O.isPinned || (O.reset(), $.updateBodyForce(O), N.update(O));
      }
    }
  }
  function I() {
    for (var C = k.length; C--; )
      E.update(k[C]);
  }
}
function Rf(t, e) {
  for (var n in t)
    jf(t, e, n);
}
function jf(t, e, n) {
  if (t.hasOwnProperty(n) && typeof e[n] != "function") {
    var r = Number.isFinite(t[n]);
    r ? e[n] = function(i) {
      if (i !== void 0) {
        if (!Number.isFinite(i))
          throw new Error("Value of " + n + " should be a valid number.");
        return t[n] = i, e;
      }
      return t[n];
    } : e[n] = function(i) {
      return i !== void 0 ? (t[n] = i, e) : t[n];
    };
  }
}
Dr.exports = Df;
Dr.exports.simulator = ms;
var Bf = Br;
function Df(t, e) {
  if (!t)
    throw new Error("Graph structure cannot be undefined");
  var n = e && e.createSimulator || ms, r = n(e);
  if (Array.isArray(e))
    throw new Error("Physics settings is expected to be an object");
  var i = t.version > 19 ? be : V;
  e && typeof e.nodeMass == "function" && (i = e.nodeMass);
  var o = /* @__PURE__ */ new Map(), s = {}, u = 0, a = r.settings.springTransform || Uf;
  N(), $();
  var h = !1, d = {
    /**
     * Performs one step of iterative layout algorithm
     *
     * @returns {boolean} true if the system should be considered stable; False otherwise.
     * The system is stable if no further call to `step()` can improve the layout.
     */
    step: function() {
      if (u === 0)
        return f(!0), !0;
      var I = r.step();
      d.lastMove = I, d.fire("step");
      var C = I / u, O = C <= 0.01;
      return f(O), O;
    },
    /**
     * For a given `nodeId` returns position
     */
    getNodePosition: function(I) {
      return ee(I).pos;
    },
    /**
     * Sets position of a node to a given coordinates
     * @param {string} nodeId node identifier
     * @param {number} x position of a node
     * @param {number} y position of a node
     * @param {number=} z position of node (only if applicable to body)
     */
    setNodePosition: function(I) {
      var C = ee(I);
      C.setPosition.apply(C, Array.prototype.slice.call(arguments, 1));
    },
    /**
     * @returns {Object} Link position by link id
     * @returns {Object.from} {x, y} coordinates of link start
     * @returns {Object.to} {x, y} coordinates of link end
     */
    getLinkPosition: function(I) {
      var C = s[I];
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
    pinNode: function(I, C) {
      var O = ee(I.id);
      O.isPinned = !!C;
    },
    /**
     * Checks whether given graph's node is currently pinned
     */
    isNodePinned: function(I) {
      return ee(I.id).isPinned;
    },
    /**
     * Request to release all resources
     */
    dispose: function() {
      t.off("changed", E), d.fire("disposed");
    },
    /**
     * Gets physical body for a given node id. If node is not found undefined
     * value is returned.
     */
    getBody: k,
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
    getForceVectorLength: b,
    /**
     * [Read only] Gets current physics simulator
     */
    simulator: r,
    /**
     * Gets the graph that was used for layout
     */
    graph: t,
    /**
     * Gets amount of movement performed during last step operation
     */
    lastMove: 0
  };
  return Bf(d), d;
  function f(I) {
    h !== I && (h = I, _(I));
  }
  function y(I) {
    o.forEach(I);
  }
  function b() {
    var I = 0, C = 0;
    return y(function(O) {
      I += Math.abs(O.force.x), C += Math.abs(O.force.y);
    }), Math.sqrt(I * I + C * C);
  }
  function m(I, C) {
    var O;
    if (C === void 0)
      typeof I != "object" ? O = I : O = I.id;
    else {
      var ne = t.hasLink(I, C);
      if (!ne)
        return;
      O = ne.id;
    }
    return s[O];
  }
  function k(I) {
    return o.get(I);
  }
  function $() {
    t.on("changed", E);
  }
  function _(I) {
    d.fire("stable", I);
  }
  function E(I) {
    for (var C = 0; C < I.length; ++C) {
      var O = I[C];
      O.changeType === "add" ? (O.node && M(O.node.id), O.link && A(O.link)) : O.changeType === "remove" && (O.node && z(O.node), O.link && R(O.link));
    }
    u = t.getNodesCount();
  }
  function N() {
    u = 0, t.forEachNode(function(I) {
      M(I.id), u += 1;
    }), t.forEachLink(A);
  }
  function M(I) {
    var C = o.get(I);
    if (!C) {
      var O = t.getNode(I);
      if (!O)
        throw new Error("initBody() was called with unknown node id");
      var ne = O.position;
      if (!ne) {
        var me = B(O);
        ne = r.getBestNewBodyPosition(me);
      }
      C = r.addBodyAt(ne), C.id = I, o.set(I, C), Q(I), X(O) && (C.isPinned = !0);
    }
  }
  function z(I) {
    var C = I.id, O = o.get(C);
    O && (o.delete(C), r.removeBody(O));
  }
  function A(I) {
    Q(I.fromId), Q(I.toId);
    var C = o.get(I.fromId), O = o.get(I.toId), ne = r.addSpring(C, O, I.length);
    a(I, ne), s[I.id] = ne;
  }
  function R(I) {
    var C = s[I.id];
    if (C) {
      var O = t.getNode(I.fromId), ne = t.getNode(I.toId);
      O && Q(O.id), ne && Q(ne.id), delete s[I.id], r.removeSpring(C);
    }
  }
  function B(I) {
    var C = [];
    if (!I.links)
      return C;
    for (var O = Math.min(I.links.length, 2), ne = 0; ne < O; ++ne) {
      var me = I.links[ne], we = me.fromId !== I.id ? o.get(me.fromId) : o.get(me.toId);
      we && we.pos && C.push(we);
    }
    return C;
  }
  function Q(I) {
    var C = o.get(I);
    if (C.mass = i(I), Number.isNaN(C.mass))
      throw new Error("Node mass should be a number");
  }
  function X(I) {
    return I && (I.isPinned || I.data && I.data.isPinned);
  }
  function ee(I) {
    var C = o.get(I);
    return C || (M(I), C = o.get(I)), C;
  }
  function V(I) {
    var C = t.getLinks(I);
    return C ? 1 + C.length / 3 : 1;
  }
  function be(I) {
    var C = t.getLinks(I);
    return C ? 1 + C.size / 3 : 1;
  }
}
function Uf() {
}
var qf = Dr.exports;
const Gf = /* @__PURE__ */ Wn(qf);
class Hf {
  constructor() {
    this.nodeMapping = /* @__PURE__ */ new Map(), this.edgeMapping = /* @__PURE__ */ new Map(), this._settled = !0, this.ngraph = lf(), this.ngraphLayout = Gf(this.ngraph, { dimensions: 3 });
  }
  async init() {
  }
  step() {
    this._settled = this.ngraphLayout.step();
  }
  get isSettled() {
    return this._settled;
  }
  addNode(e) {
    const n = this.ngraph.addNode(e.id, { parentNode: e });
    this.nodeMapping.set(e, n), this._settled = !1;
  }
  addEdge(e) {
    const n = this.ngraph.addLink(e.srcId, e.dstId, { parentEdge: this });
    this.edgeMapping.set(e, n), this._settled = !1;
  }
  getNodePosition(e) {
    const n = this._getMappedNode(e);
    return this.ngraphLayout.getNodePosition(n.id);
  }
  setNodePosition(e, n) {
    const r = this._getMappedNode(e), i = this.ngraphLayout.getNodePosition(r.id);
    i.x = n.x, i.y = n.y, i.z = n.z;
  }
  getEdgePosition(e) {
    const n = this._getMappedEdge(e), r = this.ngraphLayout.getLinkPosition(n.id);
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
  pin(e) {
    const n = this._getMappedNode(e);
    this.ngraphLayout.pinNode(n, !0);
  }
  unpin(e) {
    const n = this._getMappedNode(e);
    this.ngraphLayout.pinNode(n, !1);
  }
  _getMappedNode(e) {
    const n = this.nodeMapping.get(e);
    if (!n)
      throw new Error("Internal error: Node not found in NGraphEngine");
    return n;
  }
  _getMappedEdge(e) {
    const n = this.edgeMapping.get(e);
    if (!n)
      throw new Error("Internal error: Edge not found in NGraphEngine");
    return n;
  }
}
class Kf {
  constructor(e) {
    this.graphStep = new yt(), this.nodeUpdate = new yt(), this.edgeUpdate = new yt(), this.arrowCapUpdate = new yt(), this.intersectCalc = new yt(), this.loadTime = new yt(), this.totalUpdates = 0, this.graph = e, this.sceneInstrumentation = new Na(e.scene), this.sceneInstrumentation.captureFrameTime = !0, this.sceneInstrumentation.captureRenderTime = !0, this.sceneInstrumentation.captureInterFrameTime = !0, this.sceneInstrumentation.captureCameraRenderTime = !0, this.sceneInstrumentation.captureActiveMeshesEvaluationTime = !0, this.sceneInstrumentation.captureRenderTargetsRenderTime = !0, this.babylonInstrumentation = new Ta(e.engine), this.babylonInstrumentation.captureGPUFrameTime = !0, this.babylonInstrumentation.captureShaderCompilationTime = !0;
  }
  toString() {
    let e = "";
    function n(o, s, u = "") {
      e += `${o}: ${s}${u}
`;
    }
    function r(o) {
      e += `
${o}
`;
      for (let s = 0; s < o.length; s++)
        e += "-";
      e += `
`;
    }
    function i(o, s, u = 1) {
      e += `${o} (min/avg/last sec/max [total]): `, e += `${(s.min * u).toFixed(2)} / `, e += `${(s.average * u).toFixed(2)} / `, e += `${(s.lastSecAverage * u).toFixed(2)} / `, e += `${(s.max * u).toFixed(2)} `, e += `[${(s.total * u).toFixed(2)}] ms
`;
    }
    return r("Graph"), n("Num Nodes", this.numNodes), n("Num Edges", this.numEdges), n("Total Updates", this.totalUpdates), n("Mesh Cache Hits", this.meshCacheHits), n("Mesh Cache Misses", this.meshCacheMisses), n("Number of Node Updates", this.nodeUpdate.count), n("Number of Edge Updates", this.edgeUpdate.count), n("Number of ArrowCap Updates", this.arrowCapUpdate.count), r("Graph Engine Performance"), i("JSON Load Time", this.loadTime), i("Graph Physics Engine Time", this.graphStep), i("Node Update Time", this.nodeUpdate), i("Edge Update Time", this.edgeUpdate), i("Arrow Cap Update Time", this.arrowCapUpdate), i("Ray Intersect Calculation Time", this.intersectCalc), r("BabylonJS Performance"), n("Draw Calls", this.sceneInstrumentation.drawCallsCounter.count), i("GPU Time", this.babylonInstrumentation.gpuFrameTimeCounter, 1e-6), i("Shader Time", this.babylonInstrumentation.shaderCompilationTimeCounter), i("Mesh Evaluation Time", this.sceneInstrumentation.activeMeshesEvaluationTimeCounter), i("Render Targets Time", this.sceneInstrumentation.renderTargetsRenderTimeCounter), i("Draw Calls Time", this.sceneInstrumentation.drawCallsCounter), i("Frame Time", this.sceneInstrumentation.frameTimeCounter), i("Render Time", this.sceneInstrumentation.renderTimeCounter), i("Time Between Frames", this.sceneInstrumentation.interFrameTimeCounter), i("Camera Render Time", this.sceneInstrumentation.cameraRenderTimeCounter), e;
  }
  step() {
    this.totalUpdates++;
  }
  reset() {
    this.totalUpdates = 0;
  }
  get numNodes() {
    return this.graph.nodeCache.size;
  }
  get numEdges() {
    return this.graph.edgeCache.size;
  }
  get meshCacheHits() {
    return this.graph.meshCache.hits;
  }
  get meshCacheMisses() {
    return this.graph.meshCache.misses;
  }
}
var Rn = { exports: {} };
Rn.exports;
(function(t, e) {
  var n = 200, r = "__lodash_hash_undefined__", i = 800, o = 16, s = 9007199254740991, u = "[object Arguments]", a = "[object Array]", h = "[object AsyncFunction]", d = "[object Boolean]", f = "[object Date]", y = "[object Error]", b = "[object Function]", m = "[object GeneratorFunction]", k = "[object Map]", $ = "[object Number]", _ = "[object Null]", E = "[object Object]", N = "[object Proxy]", M = "[object RegExp]", z = "[object Set]", A = "[object String]", R = "[object Undefined]", B = "[object WeakMap]", Q = "[object ArrayBuffer]", X = "[object DataView]", ee = "[object Float32Array]", V = "[object Float64Array]", be = "[object Int8Array]", I = "[object Int16Array]", C = "[object Int32Array]", O = "[object Uint8Array]", ne = "[object Uint8ClampedArray]", me = "[object Uint16Array]", we = "[object Uint32Array]", F = /[\\^$.*+?()[\]{}|]/g, j = /^\[object .+?Constructor\]$/, K = /^(?:0|[1-9]\d*)$/, D = {};
  D[ee] = D[V] = D[be] = D[I] = D[C] = D[O] = D[ne] = D[me] = D[we] = !0, D[u] = D[a] = D[Q] = D[d] = D[X] = D[f] = D[y] = D[b] = D[k] = D[$] = D[E] = D[M] = D[z] = D[A] = D[B] = !1;
  var ae = typeof Sn == "object" && Sn && Sn.Object === Object && Sn, se = typeof self == "object" && self && self.Object === Object && self, de = ae || se || Function("return this")(), He = e && !e.nodeType && e, Pe = He && !0 && t && !t.nodeType && t, Le = Pe && Pe.exports === He, je = Le && ae.process, gt = function() {
    try {
      var l = Pe && Pe.require && Pe.require("util").types;
      return l || je && je.binding && je.binding("util");
    } catch {
    }
  }(), St = gt && gt.isTypedArray;
  function dn(l, v, w) {
    switch (w.length) {
      case 0:
        return l.call(v);
      case 1:
        return l.call(v, w[0]);
      case 2:
        return l.call(v, w[0], w[1]);
      case 3:
        return l.call(v, w[0], w[1], w[2]);
    }
    return l.apply(v, w);
  }
  function Jn(l, v) {
    for (var w = -1, L = Array(l); ++w < l; )
      L[w] = v(w);
    return L;
  }
  function Yn(l) {
    return function(v) {
      return l(v);
    };
  }
  function fn(l, v) {
    return l == null ? void 0 : l[v];
  }
  function Xn(l, v) {
    return function(w) {
      return l(v(w));
    };
  }
  var Ct = Array.prototype, G = Function.prototype, Ke = Object.prototype, vt = de["__core-js_shared__"], st = G.toString, Oe = Ke.hasOwnProperty, pn = function() {
    var l = /[^.]+$/.exec(vt && vt.keys && vt.keys.IE_PROTO || "");
    return l ? "Symbol(src)_1." + l : "";
  }(), gn = Ke.toString, c = st.call(Object), p = RegExp(
    "^" + st.call(Oe).replace(F, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), g = Le ? de.Buffer : void 0, x = de.Symbol, S = de.Uint8Array, Z = g ? g.allocUnsafe : void 0, H = Xn(Object.getPrototypeOf, Object), W = Object.create, ye = Ke.propertyIsEnumerable, Fe = Ct.splice, re = x ? x.toStringTag : void 0, q = function() {
    try {
      var l = rr(Object, "defineProperty");
      return l({}, "", {}), l;
    } catch {
    }
  }(), Ze = g ? g.isBuffer : void 0, vn = Math.max, At = Date.now, It = rr(de, "Map"), Ve = rr(Object, "create"), Pt = /* @__PURE__ */ function() {
    function l() {
    }
    return function(v) {
      if (!Be(v))
        return {};
      if (W)
        return W(v);
      l.prototype = v;
      var w = new l();
      return l.prototype = void 0, w;
    };
  }();
  function ve(l) {
    var v = -1, w = l == null ? 0 : l.length;
    for (this.clear(); ++v < w; ) {
      var L = l[v];
      this.set(L[0], L[1]);
    }
  }
  function _n() {
    this.__data__ = Ve ? Ve(null) : {}, this.size = 0;
  }
  function Ot(l) {
    var v = this.has(l) && delete this.__data__[l];
    return this.size -= v ? 1 : 0, v;
  }
  function mn(l) {
    var v = this.__data__;
    if (Ve) {
      var w = v[l];
      return w === r ? void 0 : w;
    }
    return Oe.call(v, l) ? v[l] : void 0;
  }
  function Ft(l) {
    var v = this.__data__;
    return Ve ? v[l] !== void 0 : Oe.call(v, l);
  }
  function Zt(l, v) {
    var w = this.__data__;
    return this.size += this.has(l) ? 0 : 1, w[l] = Ve && v === void 0 ? r : v, this;
  }
  ve.prototype.clear = _n, ve.prototype.delete = Ot, ve.prototype.get = mn, ve.prototype.has = Ft, ve.prototype.set = Zt;
  function Ne(l) {
    var v = -1, w = l == null ? 0 : l.length;
    for (this.clear(); ++v < w; ) {
      var L = l[v];
      this.set(L[0], L[1]);
    }
  }
  function Lt() {
    this.__data__ = [], this.size = 0;
  }
  function yn(l) {
    var v = this.__data__, w = wn(v, l);
    if (w < 0)
      return !1;
    var L = v.length - 1;
    return w == L ? v.pop() : Fe.call(v, w, 1), --this.size, !0;
  }
  function bn(l) {
    var v = this.__data__, w = wn(v, l);
    return w < 0 ? void 0 : v[w][1];
  }
  function Ms(l) {
    return wn(this.__data__, l) > -1;
  }
  function zs(l, v) {
    var w = this.__data__, L = wn(w, l);
    return L < 0 ? (++this.size, w.push([l, v])) : w[L][1] = v, this;
  }
  Ne.prototype.clear = Lt, Ne.prototype.delete = yn, Ne.prototype.get = bn, Ne.prototype.has = Ms, Ne.prototype.set = zs;
  function _t(l) {
    var v = -1, w = l == null ? 0 : l.length;
    for (this.clear(); ++v < w; ) {
      var L = l[v];
      this.set(L[0], L[1]);
    }
  }
  function Ss() {
    this.size = 0, this.__data__ = {
      hash: new ve(),
      map: new (It || Ne)(),
      string: new ve()
    };
  }
  function Cs(l) {
    var v = $n(this, l).delete(l);
    return this.size -= v ? 1 : 0, v;
  }
  function As(l) {
    return $n(this, l).get(l);
  }
  function Is(l) {
    return $n(this, l).has(l);
  }
  function Ps(l, v) {
    var w = $n(this, l), L = w.size;
    return w.set(l, v), this.size += w.size == L ? 0 : 1, this;
  }
  _t.prototype.clear = Ss, _t.prototype.delete = Cs, _t.prototype.get = As, _t.prototype.has = Is, _t.prototype.set = Ps;
  function mt(l) {
    var v = this.__data__ = new Ne(l);
    this.size = v.size;
  }
  function Os() {
    this.__data__ = new Ne(), this.size = 0;
  }
  function Fs(l) {
    var v = this.__data__, w = v.delete(l);
    return this.size = v.size, w;
  }
  function Zs(l) {
    return this.__data__.get(l);
  }
  function Ls(l) {
    return this.__data__.has(l);
  }
  function Rs(l, v) {
    var w = this.__data__;
    if (w instanceof Ne) {
      var L = w.__data__;
      if (!It || L.length < n - 1)
        return L.push([l, v]), this.size = ++w.size, this;
      w = this.__data__ = new _t(L);
    }
    return w.set(l, v), this.size = w.size, this;
  }
  mt.prototype.clear = Os, mt.prototype.delete = Fs, mt.prototype.get = Zs, mt.prototype.has = Ls, mt.prototype.set = Rs;
  function js(l, v) {
    var w = sr(l), L = !w && or(l), J = !w && !L && ii(l), te = !w && !L && !J && si(l), ue = w || L || J || te, Y = ue ? Jn(l.length, String) : [], ce = Y.length;
    for (var Ce in l)
      (v || Oe.call(l, Ce)) && !(ue && // Safari 9 has enumerable `arguments.length` in strict mode.
      (Ce == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      J && (Ce == "offset" || Ce == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      te && (Ce == "buffer" || Ce == "byteLength" || Ce == "byteOffset") || // Skip index properties.
      ni(Ce, ce))) && Y.push(Ce);
    return Y;
  }
  function er(l, v, w) {
    (w !== void 0 && !kn(l[v], w) || w === void 0 && !(v in l)) && tr(l, v, w);
  }
  function Bs(l, v, w) {
    var L = l[v];
    (!(Oe.call(l, v) && kn(L, w)) || w === void 0 && !(v in l)) && tr(l, v, w);
  }
  function wn(l, v) {
    for (var w = l.length; w--; )
      if (kn(l[w][0], v))
        return w;
    return -1;
  }
  function tr(l, v, w) {
    v == "__proto__" && q ? q(l, v, {
      configurable: !0,
      enumerable: !0,
      value: w,
      writable: !0
    }) : l[v] = w;
  }
  var Ds = ea();
  function xn(l) {
    return l == null ? l === void 0 ? R : _ : re && re in Object(l) ? ta(l) : aa(l);
  }
  function Xr(l) {
    return Rt(l) && xn(l) == u;
  }
  function Us(l) {
    if (!Be(l) || oa(l))
      return !1;
    var v = ur(l) ? p : j;
    return v.test(la(l));
  }
  function qs(l) {
    return Rt(l) && oi(l.length) && !!D[xn(l)];
  }
  function Gs(l) {
    if (!Be(l))
      return sa(l);
    var v = ri(l), w = [];
    for (var L in l)
      L == "constructor" && (v || !Oe.call(l, L)) || w.push(L);
    return w;
  }
  function nr(l, v, w, L, J) {
    l !== v && Ds(v, function(te, ue) {
      if (J || (J = new mt()), Be(te))
        Hs(l, v, ue, w, nr, L, J);
      else {
        var Y = L ? L(ir(l, ue), te, ue + "", l, v, J) : void 0;
        Y === void 0 && (Y = te), er(l, ue, Y);
      }
    }, ai);
  }
  function Hs(l, v, w, L, J, te, ue) {
    var Y = ir(l, w), ce = ir(v, w), Ce = ue.get(ce);
    if (Ce) {
      er(l, w, Ce);
      return;
    }
    var Se = te ? te(Y, ce, w + "", l, v, ue) : void 0, jt = Se === void 0;
    if (jt) {
      var cr = sr(ce), hr = !cr && ii(ce), ci = !cr && !hr && si(ce);
      Se = ce, cr || hr || ci ? sr(Y) ? Se = Y : da(Y) ? Se = Js(Y) : hr ? (jt = !1, Se = Vs(ce, !0)) : ci ? (jt = !1, Se = Qs(ce, !0)) : Se = [] : fa(ce) || or(ce) ? (Se = Y, or(Y) ? Se = pa(Y) : (!Be(Y) || ur(Y)) && (Se = na(ce))) : jt = !1;
    }
    jt && (ue.set(ce, Se), J(Se, ce, L, te, ue), ue.delete(ce)), er(l, w, Se);
  }
  function ei(l, v) {
    return ca(ua(l, v, ui), l + "");
  }
  var Ks = q ? function(l, v) {
    return q(l, "toString", {
      configurable: !0,
      enumerable: !1,
      value: _a(v),
      writable: !0
    });
  } : ui;
  function Vs(l, v) {
    if (v)
      return l.slice();
    var w = l.length, L = Z ? Z(w) : new l.constructor(w);
    return l.copy(L), L;
  }
  function Ws(l) {
    var v = new l.constructor(l.byteLength);
    return new S(v).set(new S(l)), v;
  }
  function Qs(l, v) {
    var w = v ? Ws(l.buffer) : l.buffer;
    return new l.constructor(w, l.byteOffset, l.length);
  }
  function Js(l, v) {
    var w = -1, L = l.length;
    for (v || (v = Array(L)); ++w < L; )
      v[w] = l[w];
    return v;
  }
  function Ys(l, v, w, L) {
    var J = !w;
    w || (w = {});
    for (var te = -1, ue = v.length; ++te < ue; ) {
      var Y = v[te], ce = L ? L(w[Y], l[Y], Y, w, l) : void 0;
      ce === void 0 && (ce = l[Y]), J ? tr(w, Y, ce) : Bs(w, Y, ce);
    }
    return w;
  }
  function Xs(l) {
    return ei(function(v, w) {
      var L = -1, J = w.length, te = J > 1 ? w[J - 1] : void 0, ue = J > 2 ? w[2] : void 0;
      for (te = l.length > 3 && typeof te == "function" ? (J--, te) : void 0, ue && ra(w[0], w[1], ue) && (te = J < 3 ? void 0 : te, J = 1), v = Object(v); ++L < J; ) {
        var Y = w[L];
        Y && l(v, Y, L, te);
      }
      return v;
    });
  }
  function ea(l) {
    return function(v, w, L) {
      for (var J = -1, te = Object(v), ue = L(v), Y = ue.length; Y--; ) {
        var ce = ue[l ? Y : ++J];
        if (w(te[ce], ce, te) === !1)
          break;
      }
      return v;
    };
  }
  function ti(l, v, w, L, J, te) {
    return Be(l) && Be(v) && (te.set(v, l), nr(l, v, void 0, ti, te), te.delete(v)), l;
  }
  function $n(l, v) {
    var w = l.__data__;
    return ia(v) ? w[typeof v == "string" ? "string" : "hash"] : w.map;
  }
  function rr(l, v) {
    var w = fn(l, v);
    return Us(w) ? w : void 0;
  }
  function ta(l) {
    var v = Oe.call(l, re), w = l[re];
    try {
      l[re] = void 0;
      var L = !0;
    } catch {
    }
    var J = gn.call(l);
    return L && (v ? l[re] = w : delete l[re]), J;
  }
  function na(l) {
    return typeof l.constructor == "function" && !ri(l) ? Pt(H(l)) : {};
  }
  function ni(l, v) {
    var w = typeof l;
    return v = v ?? s, !!v && (w == "number" || w != "symbol" && K.test(l)) && l > -1 && l % 1 == 0 && l < v;
  }
  function ra(l, v, w) {
    if (!Be(w))
      return !1;
    var L = typeof v;
    return (L == "number" ? ar(w) && ni(v, w.length) : L == "string" && v in w) ? kn(w[v], l) : !1;
  }
  function ia(l) {
    var v = typeof l;
    return v == "string" || v == "number" || v == "symbol" || v == "boolean" ? l !== "__proto__" : l === null;
  }
  function oa(l) {
    return !!pn && pn in l;
  }
  function ri(l) {
    var v = l && l.constructor, w = typeof v == "function" && v.prototype || Ke;
    return l === w;
  }
  function sa(l) {
    var v = [];
    if (l != null)
      for (var w in Object(l))
        v.push(w);
    return v;
  }
  function aa(l) {
    return gn.call(l);
  }
  function ua(l, v, w) {
    return v = vn(v === void 0 ? l.length - 1 : v, 0), function() {
      for (var L = arguments, J = -1, te = vn(L.length - v, 0), ue = Array(te); ++J < te; )
        ue[J] = L[v + J];
      J = -1;
      for (var Y = Array(v + 1); ++J < v; )
        Y[J] = L[J];
      return Y[v] = w(ue), dn(l, this, Y);
    };
  }
  function ir(l, v) {
    if (!(v === "constructor" && typeof l[v] == "function") && v != "__proto__")
      return l[v];
  }
  var ca = ha(Ks);
  function ha(l) {
    var v = 0, w = 0;
    return function() {
      var L = At(), J = o - (L - w);
      if (w = L, J > 0) {
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
        return st.call(l);
      } catch {
      }
      try {
        return l + "";
      } catch {
      }
    }
    return "";
  }
  function kn(l, v) {
    return l === v || l !== l && v !== v;
  }
  var or = Xr(/* @__PURE__ */ function() {
    return arguments;
  }()) ? Xr : function(l) {
    return Rt(l) && Oe.call(l, "callee") && !ye.call(l, "callee");
  }, sr = Array.isArray;
  function ar(l) {
    return l != null && oi(l.length) && !ur(l);
  }
  function da(l) {
    return Rt(l) && ar(l);
  }
  var ii = Ze || ma;
  function ur(l) {
    if (!Be(l))
      return !1;
    var v = xn(l);
    return v == b || v == m || v == h || v == N;
  }
  function oi(l) {
    return typeof l == "number" && l > -1 && l % 1 == 0 && l <= s;
  }
  function Be(l) {
    var v = typeof l;
    return l != null && (v == "object" || v == "function");
  }
  function Rt(l) {
    return l != null && typeof l == "object";
  }
  function fa(l) {
    if (!Rt(l) || xn(l) != E)
      return !1;
    var v = H(l);
    if (v === null)
      return !0;
    var w = Oe.call(v, "constructor") && v.constructor;
    return typeof w == "function" && w instanceof w && st.call(w) == c;
  }
  var si = St ? Yn(St) : qs;
  function pa(l) {
    return Ys(l, ai(l));
  }
  var ga = ei(function(l) {
    return l.push(void 0, ti), dn(va, void 0, l);
  });
  function ai(l) {
    return ar(l) ? js(l, !0) : Gs(l);
  }
  var va = Xs(function(l, v, w, L) {
    nr(l, v, w, L);
  });
  function _a(l) {
    return function() {
      return l;
    };
  }
  function ui(l) {
    return l;
  }
  function ma() {
    return !1;
  }
  t.exports = ga;
})(Rn, Rn.exports);
var Vf = Rn.exports;
const no = /* @__PURE__ */ Wn(Vf);
var ys = {};
(function(t) {
  (function(e) {
    function n(c) {
      return c !== null ? Object.prototype.toString.call(c) === "[object Array]" : !1;
    }
    function r(c) {
      return c !== null ? Object.prototype.toString.call(c) === "[object Object]" : !1;
    }
    function i(c, p) {
      if (c === p)
        return !0;
      var g = Object.prototype.toString.call(c);
      if (g !== Object.prototype.toString.call(p))
        return !1;
      if (n(c) === !0) {
        if (c.length !== p.length)
          return !1;
        for (var x = 0; x < c.length; x++)
          if (i(c[x], p[x]) === !1)
            return !1;
        return !0;
      }
      if (r(c) === !0) {
        var S = {};
        for (var Z in c)
          if (hasOwnProperty.call(c, Z)) {
            if (i(c[Z], p[Z]) === !1)
              return !1;
            S[Z] = !0;
          }
        for (var H in p)
          if (hasOwnProperty.call(p, H) && S[H] !== !0)
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
        for (var p in c)
          if (c.hasOwnProperty(p))
            return !1;
        return !0;
      } else
        return !1;
    }
    function s(c) {
      for (var p = Object.keys(c), g = [], x = 0; x < p.length; x++)
        g.push(c[p[x]]);
      return g;
    }
    var u;
    typeof String.prototype.trimLeft == "function" ? u = function(c) {
      return c.trimLeft();
    } : u = function(c) {
      return c.match(/^\s*(.*)/)[1];
    };
    var a = 0, h = 1, d = 2, f = 3, y = 4, b = 5, m = 6, k = 7, $ = 8, _ = 9, E = {
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
    }, N = "EOF", M = "UnquotedIdentifier", z = "QuotedIdentifier", A = "Rbracket", R = "Rparen", B = "Comma", Q = "Colon", X = "Rbrace", ee = "Number", V = "Current", be = "Expref", I = "Pipe", C = "Or", O = "And", ne = "EQ", me = "GT", we = "LT", F = "GTE", j = "LTE", K = "NE", D = "Flatten", ae = "Star", se = "Filter", de = "Dot", He = "Not", Pe = "Lbrace", Le = "Lbracket", je = "Lparen", gt = "Literal", St = {
      ".": de,
      "*": ae,
      ",": B,
      ":": Q,
      "{": Pe,
      "}": X,
      "]": A,
      "(": je,
      ")": R,
      "@": V
    }, dn = {
      "<": !0,
      ">": !0,
      "=": !0,
      "!": !0
    }, Jn = {
      " ": !0,
      "	": !0,
      "\n": !0
    };
    function Yn(c) {
      return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "_";
    }
    function fn(c) {
      return c >= "0" && c <= "9" || c === "-";
    }
    function Xn(c) {
      return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c >= "0" && c <= "9" || c === "_";
    }
    function Ct() {
    }
    Ct.prototype = {
      tokenize: function(c) {
        var p = [];
        this._current = 0;
        for (var g, x, S; this._current < c.length; )
          if (Yn(c[this._current]))
            g = this._current, x = this._consumeUnquotedIdentifier(c), p.push({
              type: M,
              value: x,
              start: g
            });
          else if (St[c[this._current]] !== void 0)
            p.push({
              type: St[c[this._current]],
              value: c[this._current],
              start: this._current
            }), this._current++;
          else if (fn(c[this._current]))
            S = this._consumeNumber(c), p.push(S);
          else if (c[this._current] === "[")
            S = this._consumeLBracket(c), p.push(S);
          else if (c[this._current] === '"')
            g = this._current, x = this._consumeQuotedIdentifier(c), p.push({
              type: z,
              value: x,
              start: g
            });
          else if (c[this._current] === "'")
            g = this._current, x = this._consumeRawStringLiteral(c), p.push({
              type: gt,
              value: x,
              start: g
            });
          else if (c[this._current] === "`") {
            g = this._current;
            var Z = this._consumeLiteral(c);
            p.push({
              type: gt,
              value: Z,
              start: g
            });
          } else if (dn[c[this._current]] !== void 0)
            p.push(this._consumeOperator(c));
          else if (Jn[c[this._current]] !== void 0)
            this._current++;
          else if (c[this._current] === "&")
            g = this._current, this._current++, c[this._current] === "&" ? (this._current++, p.push({ type: O, value: "&&", start: g })) : p.push({ type: be, value: "&", start: g });
          else if (c[this._current] === "|")
            g = this._current, this._current++, c[this._current] === "|" ? (this._current++, p.push({ type: C, value: "||", start: g })) : p.push({ type: I, value: "|", start: g });
          else {
            var H = new Error("Unknown character:" + c[this._current]);
            throw H.name = "LexerError", H;
          }
        return p;
      },
      _consumeUnquotedIdentifier: function(c) {
        var p = this._current;
        for (this._current++; this._current < c.length && Xn(c[this._current]); )
          this._current++;
        return c.slice(p, this._current);
      },
      _consumeQuotedIdentifier: function(c) {
        var p = this._current;
        this._current++;
        for (var g = c.length; c[this._current] !== '"' && this._current < g; ) {
          var x = this._current;
          c[x] === "\\" && (c[x + 1] === "\\" || c[x + 1] === '"') ? x += 2 : x++, this._current = x;
        }
        return this._current++, JSON.parse(c.slice(p, this._current));
      },
      _consumeRawStringLiteral: function(c) {
        var p = this._current;
        this._current++;
        for (var g = c.length; c[this._current] !== "'" && this._current < g; ) {
          var x = this._current;
          c[x] === "\\" && (c[x + 1] === "\\" || c[x + 1] === "'") ? x += 2 : x++, this._current = x;
        }
        this._current++;
        var S = c.slice(p + 1, this._current - 1);
        return S.replace("\\'", "'");
      },
      _consumeNumber: function(c) {
        var p = this._current;
        this._current++;
        for (var g = c.length; fn(c[this._current]) && this._current < g; )
          this._current++;
        var x = parseInt(c.slice(p, this._current));
        return { type: ee, value: x, start: p };
      },
      _consumeLBracket: function(c) {
        var p = this._current;
        return this._current++, c[this._current] === "?" ? (this._current++, { type: se, value: "[?", start: p }) : c[this._current] === "]" ? (this._current++, { type: D, value: "[]", start: p }) : { type: Le, value: "[", start: p };
      },
      _consumeOperator: function(c) {
        var p = this._current, g = c[p];
        if (this._current++, g === "!")
          return c[this._current] === "=" ? (this._current++, { type: K, value: "!=", start: p }) : { type: He, value: "!", start: p };
        if (g === "<")
          return c[this._current] === "=" ? (this._current++, { type: j, value: "<=", start: p }) : { type: we, value: "<", start: p };
        if (g === ">")
          return c[this._current] === "=" ? (this._current++, { type: F, value: ">=", start: p }) : { type: me, value: ">", start: p };
        if (g === "=" && c[this._current] === "=")
          return this._current++, { type: ne, value: "==", start: p };
      },
      _consumeLiteral: function(c) {
        this._current++;
        for (var p = this._current, g = c.length, x; c[this._current] !== "`" && this._current < g; ) {
          var S = this._current;
          c[S] === "\\" && (c[S + 1] === "\\" || c[S + 1] === "`") ? S += 2 : S++, this._current = S;
        }
        var Z = u(c.slice(p, this._current));
        return Z = Z.replace("\\`", "`"), this._looksLikeJSON(Z) ? x = JSON.parse(Z) : x = JSON.parse('"' + Z + '"'), this._current++, x;
      },
      _looksLikeJSON: function(c) {
        var p = '[{"', g = ["true", "false", "null"], x = "-0123456789";
        if (c === "")
          return !1;
        if (p.indexOf(c[0]) >= 0)
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
    var G = {};
    G[N] = 0, G[M] = 0, G[z] = 0, G[A] = 0, G[R] = 0, G[B] = 0, G[X] = 0, G[ee] = 0, G[V] = 0, G[be] = 0, G[I] = 1, G[C] = 2, G[O] = 3, G[ne] = 5, G[me] = 5, G[we] = 5, G[F] = 5, G[j] = 5, G[K] = 5, G[D] = 9, G[ae] = 20, G[se] = 21, G[de] = 40, G[He] = 45, G[Pe] = 50, G[Le] = 55, G[je] = 60;
    function Ke() {
    }
    Ke.prototype = {
      parse: function(c) {
        this._loadTokens(c), this.index = 0;
        var p = this.expression(0);
        if (this._lookahead(0) !== N) {
          var g = this._lookaheadToken(0), x = new Error(
            "Unexpected token type: " + g.type + ", value: " + g.value
          );
          throw x.name = "ParserError", x;
        }
        return p;
      },
      _loadTokens: function(c) {
        var p = new Ct(), g = p.tokenize(c);
        g.push({ type: N, value: "", start: c.length }), this.tokens = g;
      },
      expression: function(c) {
        var p = this._lookaheadToken(0);
        this._advance();
        for (var g = this.nud(p), x = this._lookahead(0); c < G[x]; )
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
        var p, g, x;
        switch (c.type) {
          case gt:
            return { type: "Literal", value: c.value };
          case M:
            return { type: "Field", name: c.value };
          case z:
            var S = { type: "Field", name: c.value };
            if (this._lookahead(0) === je)
              throw new Error("Quoted identifier not allowed for function names.");
            return S;
          case He:
            return g = this.expression(G.Not), { type: "NotExpression", children: [g] };
          case ae:
            return p = { type: "Identity" }, g = null, this._lookahead(0) === A ? g = { type: "Identity" } : g = this._parseProjectionRHS(G.Star), { type: "ValueProjection", children: [p, g] };
          case se:
            return this.led(c.type, { type: "Identity" });
          case Pe:
            return this._parseMultiselectHash();
          case D:
            return p = { type: D, children: [{ type: "Identity" }] }, g = this._parseProjectionRHS(G.Flatten), { type: "Projection", children: [p, g] };
          case Le:
            return this._lookahead(0) === ee || this._lookahead(0) === Q ? (g = this._parseIndexExpression(), this._projectIfSlice({ type: "Identity" }, g)) : this._lookahead(0) === ae && this._lookahead(1) === A ? (this._advance(), this._advance(), g = this._parseProjectionRHS(G.Star), {
              type: "Projection",
              children: [{ type: "Identity" }, g]
            }) : this._parseMultiselectList();
          case V:
            return { type: V };
          case be:
            return x = this.expression(G.Expref), { type: "ExpressionReference", children: [x] };
          case je:
            for (var Z = []; this._lookahead(0) !== R; )
              this._lookahead(0) === V ? (x = { type: V }, this._advance()) : x = this.expression(0), Z.push(x);
            return this._match(R), Z[0];
          default:
            this._errorToken(c);
        }
      },
      led: function(c, p) {
        var g;
        switch (c) {
          case de:
            var x = G.Dot;
            return this._lookahead(0) !== ae ? (g = this._parseDotRHS(x), { type: "Subexpression", children: [p, g] }) : (this._advance(), g = this._parseProjectionRHS(x), { type: "ValueProjection", children: [p, g] });
          case I:
            return g = this.expression(G.Pipe), { type: I, children: [p, g] };
          case C:
            return g = this.expression(G.Or), { type: "OrExpression", children: [p, g] };
          case O:
            return g = this.expression(G.And), { type: "AndExpression", children: [p, g] };
          case je:
            for (var S = p.name, Z = [], H, W; this._lookahead(0) !== R; )
              this._lookahead(0) === V ? (H = { type: V }, this._advance()) : H = this.expression(0), this._lookahead(0) === B && this._match(B), Z.push(H);
            return this._match(R), W = { type: "Function", name: S, children: Z }, W;
          case se:
            var ye = this.expression(0);
            return this._match(A), this._lookahead(0) === D ? g = { type: "Identity" } : g = this._parseProjectionRHS(G.Filter), { type: "FilterProjection", children: [p, g, ye] };
          case D:
            var Fe = { type: D, children: [p] }, re = this._parseProjectionRHS(G.Flatten);
            return { type: "Projection", children: [Fe, re] };
          case ne:
          case K:
          case me:
          case F:
          case we:
          case j:
            return this._parseComparator(p, c);
          case Le:
            var q = this._lookaheadToken(0);
            return q.type === ee || q.type === Q ? (g = this._parseIndexExpression(), this._projectIfSlice(p, g)) : (this._match(ae), this._match(A), g = this._parseProjectionRHS(G.Star), { type: "Projection", children: [p, g] });
          default:
            this._errorToken(this._lookaheadToken(0));
        }
      },
      _match: function(c) {
        if (this._lookahead(0) === c)
          this._advance();
        else {
          var p = this._lookaheadToken(0), g = new Error("Expected " + c + ", got: " + p.type);
          throw g.name = "ParserError", g;
        }
      },
      _errorToken: function(c) {
        var p = new Error("Invalid token (" + c.type + '): "' + c.value + '"');
        throw p.name = "ParserError", p;
      },
      _parseIndexExpression: function() {
        if (this._lookahead(0) === Q || this._lookahead(1) === Q)
          return this._parseSliceExpression();
        var c = {
          type: "Index",
          value: this._lookaheadToken(0).value
        };
        return this._advance(), this._match(A), c;
      },
      _projectIfSlice: function(c, p) {
        var g = { type: "IndexExpression", children: [c, p] };
        return p.type === "Slice" ? {
          type: "Projection",
          children: [g, this._parseProjectionRHS(G.Star)]
        } : g;
      },
      _parseSliceExpression: function() {
        for (var c = [null, null, null], p = 0, g = this._lookahead(0); g !== A && p < 3; ) {
          if (g === Q)
            p++, this._advance();
          else if (g === ee)
            c[p] = this._lookaheadToken(0).value, this._advance();
          else {
            var x = this._lookahead(0), S = new Error("Syntax error, unexpected token: " + x.value + "(" + x.type + ")");
            throw S.name = "Parsererror", S;
          }
          g = this._lookahead(0);
        }
        return this._match(A), {
          type: "Slice",
          children: c
        };
      },
      _parseComparator: function(c, p) {
        var g = this.expression(G[p]);
        return { type: "Comparator", name: p, children: [c, g] };
      },
      _parseDotRHS: function(c) {
        var p = this._lookahead(0), g = [M, z, ae];
        if (g.indexOf(p) >= 0)
          return this.expression(c);
        if (p === Le)
          return this._match(Le), this._parseMultiselectList();
        if (p === Pe)
          return this._match(Pe), this._parseMultiselectHash();
      },
      _parseProjectionRHS: function(c) {
        var p;
        if (G[this._lookahead(0)] < 10)
          p = { type: "Identity" };
        else if (this._lookahead(0) === Le)
          p = this.expression(c);
        else if (this._lookahead(0) === se)
          p = this.expression(c);
        else if (this._lookahead(0) === de)
          this._match(de), p = this._parseDotRHS(c);
        else {
          var g = this._lookaheadToken(0), x = new Error("Sytanx error, unexpected token: " + g.value + "(" + g.type + ")");
          throw x.name = "ParserError", x;
        }
        return p;
      },
      _parseMultiselectList: function() {
        for (var c = []; this._lookahead(0) !== A; ) {
          var p = this.expression(0);
          if (c.push(p), this._lookahead(0) === B && (this._match(B), this._lookahead(0) === A))
            throw new Error("Unexpected token Rbracket");
        }
        return this._match(A), { type: "MultiSelectList", children: c };
      },
      _parseMultiselectHash: function() {
        for (var c = [], p = [M, z], g, x, S, Z; ; ) {
          if (g = this._lookaheadToken(0), p.indexOf(g.type) < 0)
            throw new Error("Expecting an identifier token, got: " + g.type);
          if (x = g.value, this._advance(), this._match(Q), S = this.expression(0), Z = { type: "KeyValuePair", name: x, value: S }, c.push(Z), this._lookahead(0) === B)
            this._match(B);
          else if (this._lookahead(0) === X) {
            this._match(X);
            break;
          }
        }
        return { type: "MultiSelectHash", children: c };
      }
    };
    function vt(c) {
      this.runtime = c;
    }
    vt.prototype = {
      search: function(c, p) {
        return this.visit(c, p);
      },
      visit: function(c, p) {
        var g, x, S, Z, H, W, ye, Fe, re, q;
        switch (c.type) {
          case "Field":
            return p !== null && r(p) ? (W = p[c.name], W === void 0 ? null : W) : null;
          case "Subexpression":
            for (S = this.visit(c.children[0], p), q = 1; q < c.children.length; q++)
              if (S = this.visit(c.children[1], S), S === null)
                return null;
            return S;
          case "IndexExpression":
            return ye = this.visit(c.children[0], p), Fe = this.visit(c.children[1], ye), Fe;
          case "Index":
            if (!n(p))
              return null;
            var Ze = c.value;
            return Ze < 0 && (Ze = p.length + Ze), S = p[Ze], S === void 0 && (S = null), S;
          case "Slice":
            if (!n(p))
              return null;
            var vn = c.children.slice(0), At = this.computeSliceParams(p.length, vn), It = At[0], Ve = At[1], Pt = At[2];
            if (S = [], Pt > 0)
              for (q = It; q < Ve; q += Pt)
                S.push(p[q]);
            else
              for (q = It; q > Ve; q += Pt)
                S.push(p[q]);
            return S;
          case "Projection":
            var ve = this.visit(c.children[0], p);
            if (!n(ve))
              return null;
            for (re = [], q = 0; q < ve.length; q++)
              x = this.visit(c.children[1], ve[q]), x !== null && re.push(x);
            return re;
          case "ValueProjection":
            if (ve = this.visit(c.children[0], p), !r(ve))
              return null;
            re = [];
            var _n = s(ve);
            for (q = 0; q < _n.length; q++)
              x = this.visit(c.children[1], _n[q]), x !== null && re.push(x);
            return re;
          case "FilterProjection":
            if (ve = this.visit(c.children[0], p), !n(ve))
              return null;
            var Ot = [], mn = [];
            for (q = 0; q < ve.length; q++)
              g = this.visit(c.children[2], ve[q]), o(g) || Ot.push(ve[q]);
            for (var Ft = 0; Ft < Ot.length; Ft++)
              x = this.visit(c.children[1], Ot[Ft]), x !== null && mn.push(x);
            return mn;
          case "Comparator":
            switch (Z = this.visit(c.children[0], p), H = this.visit(c.children[1], p), c.name) {
              case ne:
                S = i(Z, H);
                break;
              case K:
                S = !i(Z, H);
                break;
              case me:
                S = Z > H;
                break;
              case F:
                S = Z >= H;
                break;
              case we:
                S = Z < H;
                break;
              case j:
                S = Z <= H;
                break;
              default:
                throw new Error("Unknown comparator: " + c.name);
            }
            return S;
          case D:
            var Zt = this.visit(c.children[0], p);
            if (!n(Zt))
              return null;
            var Ne = [];
            for (q = 0; q < Zt.length; q++)
              x = Zt[q], n(x) ? Ne.push.apply(Ne, x) : Ne.push(x);
            return Ne;
          case "Identity":
            return p;
          case "MultiSelectList":
            if (p === null)
              return null;
            for (re = [], q = 0; q < c.children.length; q++)
              re.push(this.visit(c.children[q], p));
            return re;
          case "MultiSelectHash":
            if (p === null)
              return null;
            re = {};
            var Lt;
            for (q = 0; q < c.children.length; q++)
              Lt = c.children[q], re[Lt.name] = this.visit(Lt.value, p);
            return re;
          case "OrExpression":
            return g = this.visit(c.children[0], p), o(g) && (g = this.visit(c.children[1], p)), g;
          case "AndExpression":
            return Z = this.visit(c.children[0], p), o(Z) === !0 ? Z : this.visit(c.children[1], p);
          case "NotExpression":
            return Z = this.visit(c.children[0], p), o(Z);
          case "Literal":
            return c.value;
          case I:
            return ye = this.visit(c.children[0], p), this.visit(c.children[1], ye);
          case V:
            return p;
          case "Function":
            var yn = [];
            for (q = 0; q < c.children.length; q++)
              yn.push(this.visit(c.children[q], p));
            return this.runtime.callFunction(c.name, yn);
          case "ExpressionReference":
            var bn = c.children[0];
            return bn.jmespathType = be, bn;
          default:
            throw new Error("Unknown node type: " + c.type);
        }
      },
      computeSliceParams: function(c, p) {
        var g = p[0], x = p[1], S = p[2], Z = [null, null, null];
        if (S === null)
          S = 1;
        else if (S === 0) {
          var H = new Error("Invalid slice, step cannot be 0");
          throw H.name = "RuntimeError", H;
        }
        var W = S < 0;
        return g === null ? g = W ? c - 1 : 0 : g = this.capSliceRange(c, g, S), x === null ? x = W ? -1 : c : x = this.capSliceRange(c, x, S), Z[0] = g, Z[1] = x, Z[2] = S, Z;
      },
      capSliceRange: function(c, p, g) {
        return p < 0 ? (p += c, p < 0 && (p = g < 0 ? -1 : 0)) : p >= c && (p = g < 0 ? c - 1 : c), p;
      }
    };
    function st(c) {
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
        abs: { _func: this._functionAbs, _signature: [{ types: [a] }] },
        avg: { _func: this._functionAvg, _signature: [{ types: [$] }] },
        ceil: { _func: this._functionCeil, _signature: [{ types: [a] }] },
        contains: {
          _func: this._functionContains,
          _signature: [
            { types: [d, f] },
            { types: [h] }
          ]
        },
        ends_with: {
          _func: this._functionEndsWith,
          _signature: [{ types: [d] }, { types: [d] }]
        },
        floor: { _func: this._functionFloor, _signature: [{ types: [a] }] },
        length: {
          _func: this._functionLength,
          _signature: [{ types: [d, f, y] }]
        },
        map: {
          _func: this._functionMap,
          _signature: [{ types: [m] }, { types: [f] }]
        },
        max: {
          _func: this._functionMax,
          _signature: [{ types: [$, _] }]
        },
        merge: {
          _func: this._functionMerge,
          _signature: [{ types: [y], variadic: !0 }]
        },
        max_by: {
          _func: this._functionMaxBy,
          _signature: [{ types: [f] }, { types: [m] }]
        },
        sum: { _func: this._functionSum, _signature: [{ types: [$] }] },
        starts_with: {
          _func: this._functionStartsWith,
          _signature: [{ types: [d] }, { types: [d] }]
        },
        min: {
          _func: this._functionMin,
          _signature: [{ types: [$, _] }]
        },
        min_by: {
          _func: this._functionMinBy,
          _signature: [{ types: [f] }, { types: [m] }]
        },
        type: { _func: this._functionType, _signature: [{ types: [h] }] },
        keys: { _func: this._functionKeys, _signature: [{ types: [y] }] },
        values: { _func: this._functionValues, _signature: [{ types: [y] }] },
        sort: { _func: this._functionSort, _signature: [{ types: [_, $] }] },
        sort_by: {
          _func: this._functionSortBy,
          _signature: [{ types: [f] }, { types: [m] }]
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
          _signature: [{ types: [d, f] }]
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
    st.prototype = {
      callFunction: function(c, p) {
        var g = this.functionTable[c];
        if (g === void 0)
          throw new Error("Unknown function: " + c + "()");
        return this._validateArgs(c, p, g._signature), g._func.call(this, p);
      },
      _validateArgs: function(c, p, g) {
        var x;
        if (g[g.length - 1].variadic) {
          if (p.length < g.length)
            throw x = g.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + c + "() takes at least" + g.length + x + " but received " + p.length);
        } else if (p.length !== g.length)
          throw x = g.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + c + "() takes " + g.length + x + " but received " + p.length);
        for (var S, Z, H, W = 0; W < g.length; W++) {
          H = !1, S = g[W].types, Z = this._getTypeName(p[W]);
          for (var ye = 0; ye < S.length; ye++)
            if (this._typeMatches(Z, S[ye], p[W])) {
              H = !0;
              break;
            }
          if (!H) {
            var Fe = S.map(function(re) {
              return E[re];
            }).join(",");
            throw new Error("TypeError: " + c + "() expected argument " + (W + 1) + " to be type " + Fe + " but received type " + E[Z] + " instead.");
          }
        }
      },
      _typeMatches: function(c, p, g) {
        if (p === h)
          return !0;
        if (p === _ || p === $ || p === f) {
          if (p === f)
            return c === f;
          if (c === f) {
            var x;
            p === $ ? x = a : p === _ && (x = d);
            for (var S = 0; S < g.length; S++)
              if (!this._typeMatches(
                this._getTypeName(g[S]),
                x,
                g[S]
              ))
                return !1;
            return !0;
          }
        } else
          return c === p;
      },
      _getTypeName: function(c) {
        switch (Object.prototype.toString.call(c)) {
          case "[object String]":
            return d;
          case "[object Number]":
            return a;
          case "[object Array]":
            return f;
          case "[object Boolean]":
            return b;
          case "[object Null]":
            return k;
          case "[object Object]":
            return c.jmespathType === be ? m : y;
        }
      },
      _functionStartsWith: function(c) {
        return c[0].lastIndexOf(c[1]) === 0;
      },
      _functionEndsWith: function(c) {
        var p = c[0], g = c[1];
        return p.indexOf(g, p.length - g.length) !== -1;
      },
      _functionReverse: function(c) {
        var p = this._getTypeName(c[0]);
        if (p === d) {
          for (var g = c[0], x = "", S = g.length - 1; S >= 0; S--)
            x += g[S];
          return x;
        } else {
          var Z = c[0].slice(0);
          return Z.reverse(), Z;
        }
      },
      _functionAbs: function(c) {
        return Math.abs(c[0]);
      },
      _functionCeil: function(c) {
        return Math.ceil(c[0]);
      },
      _functionAvg: function(c) {
        for (var p = 0, g = c[0], x = 0; x < g.length; x++)
          p += g[x];
        return p / g.length;
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
        for (var p = [], g = this._interpreter, x = c[0], S = c[1], Z = 0; Z < S.length; Z++)
          p.push(g.visit(x, S[Z]));
        return p;
      },
      _functionMerge: function(c) {
        for (var p = {}, g = 0; g < c.length; g++) {
          var x = c[g];
          for (var S in x)
            p[S] = x[S];
        }
        return p;
      },
      _functionMax: function(c) {
        if (c[0].length > 0) {
          var p = this._getTypeName(c[0][0]);
          if (p === a)
            return Math.max.apply(Math, c[0]);
          for (var g = c[0], x = g[0], S = 1; S < g.length; S++)
            x.localeCompare(g[S]) < 0 && (x = g[S]);
          return x;
        } else
          return null;
      },
      _functionMin: function(c) {
        if (c[0].length > 0) {
          var p = this._getTypeName(c[0][0]);
          if (p === a)
            return Math.min.apply(Math, c[0]);
          for (var g = c[0], x = g[0], S = 1; S < g.length; S++)
            g[S].localeCompare(x) < 0 && (x = g[S]);
          return x;
        } else
          return null;
      },
      _functionSum: function(c) {
        for (var p = 0, g = c[0], x = 0; x < g.length; x++)
          p += g[x];
        return p;
      },
      _functionType: function(c) {
        switch (this._getTypeName(c[0])) {
          case a:
            return "number";
          case d:
            return "string";
          case f:
            return "array";
          case y:
            return "object";
          case b:
            return "boolean";
          case m:
            return "expref";
          case k:
            return "null";
        }
      },
      _functionKeys: function(c) {
        return Object.keys(c[0]);
      },
      _functionValues: function(c) {
        for (var p = c[0], g = Object.keys(p), x = [], S = 0; S < g.length; S++)
          x.push(p[g[S]]);
        return x;
      },
      _functionJoin: function(c) {
        var p = c[0], g = c[1];
        return g.join(p);
      },
      _functionToArray: function(c) {
        return this._getTypeName(c[0]) === f ? c[0] : [c[0]];
      },
      _functionToString: function(c) {
        return this._getTypeName(c[0]) === d ? c[0] : JSON.stringify(c[0]);
      },
      _functionToNumber: function(c) {
        var p = this._getTypeName(c[0]), g;
        return p === a ? c[0] : p === d && (g = +c[0], !isNaN(g)) ? g : null;
      },
      _functionNotNull: function(c) {
        for (var p = 0; p < c.length; p++)
          if (this._getTypeName(c[p]) !== k)
            return c[p];
        return null;
      },
      _functionSort: function(c) {
        var p = c[0].slice(0);
        return p.sort(), p;
      },
      _functionSortBy: function(c) {
        var p = c[0].slice(0);
        if (p.length === 0)
          return p;
        var g = this._interpreter, x = c[1], S = this._getTypeName(
          g.visit(x, p[0])
        );
        if ([a, d].indexOf(S) < 0)
          throw new Error("TypeError");
        for (var Z = this, H = [], W = 0; W < p.length; W++)
          H.push([W, p[W]]);
        H.sort(function(Fe, re) {
          var q = g.visit(x, Fe[1]), Ze = g.visit(x, re[1]);
          if (Z._getTypeName(q) !== S)
            throw new Error(
              "TypeError: expected " + S + ", received " + Z._getTypeName(q)
            );
          if (Z._getTypeName(Ze) !== S)
            throw new Error(
              "TypeError: expected " + S + ", received " + Z._getTypeName(Ze)
            );
          return q > Ze ? 1 : q < Ze ? -1 : Fe[0] - re[0];
        });
        for (var ye = 0; ye < H.length; ye++)
          p[ye] = H[ye][1];
        return p;
      },
      _functionMaxBy: function(c) {
        for (var p = c[1], g = c[0], x = this.createKeyFunction(p, [a, d]), S = -1 / 0, Z, H, W = 0; W < g.length; W++)
          H = x(g[W]), H > S && (S = H, Z = g[W]);
        return Z;
      },
      _functionMinBy: function(c) {
        for (var p = c[1], g = c[0], x = this.createKeyFunction(p, [a, d]), S = 1 / 0, Z, H, W = 0; W < g.length; W++)
          H = x(g[W]), H < S && (S = H, Z = g[W]);
        return Z;
      },
      createKeyFunction: function(c, p) {
        var g = this, x = this._interpreter, S = function(Z) {
          var H = x.visit(c, Z);
          if (p.indexOf(g._getTypeName(H)) < 0) {
            var W = "TypeError: expected one of " + p + ", received " + g._getTypeName(H);
            throw new Error(W);
          }
          return H;
        };
        return S;
      }
    };
    function Oe(c) {
      var p = new Ke(), g = p.parse(c);
      return g;
    }
    function pn(c) {
      var p = new Ct();
      return p.tokenize(c);
    }
    function gn(c, p) {
      var g = new Ke(), x = new st(), S = new vt(x);
      x._interpreter = S;
      var Z = g.parse(p);
      return S.search(Z, c);
    }
    e.tokenize = pn, e.compile = Oe, e.search = gn, e.strictDeepEqual = i;
  })(t);
})(ys);
const et = /* @__PURE__ */ Wn(ys), Wf = nn.parse({});
class Vr {
  constructor(e = {}) {
    this.layers = [], this.layerSelectedNodes = [], this.layerSelectedEdges = [], this.knownFields = e.knownFields || Mr.parse({}), e.layers ? this.layers = Fl.parse(e.layers) : this.layers = [], e.addDefaultStyle && this.addLayer({
      node: {
        selector: "",
        style: nn.parse({})
      },
      edge: {
        selector: "",
        style: rn.parse({})
      }
    });
  }
  static fromJson(e) {
    const n = JSON.parse(e);
    return this.fromObject(n);
  }
  static fromObject(e) {
    return new Vr({ layers: e });
  }
  addNodes(e, n) {
    const r = n || this.knownFields.nodeIdPath, i = et.search(e, `[0].${r}`);
    if (i == null)
      throw new TypeError("couldn't find node ID in first node data element");
    for (const o of this.layers) {
      let s = /* @__PURE__ */ new Set();
      if (o.node) {
        const a = `[${o.node.selector.length ? `?${o.node.selector}` : ""}].${r}`, h = et.search(e, a);
        s = new Set(h);
      }
      this.layerSelectedNodes.push(s);
    }
  }
  addEdges(e, n, r) {
    const i = n || this.knownFields.edgeSrcIdPath, o = r || this.knownFields.edgeDstIdPath, s = et.search(e, `[0].[to_string(${i})]`);
    if (!s || !Array.isArray(s) || s[0] === "null")
      throw new TypeError("couldn't find edge source ID in first edge data element");
    const u = et.search(e, `[0].[to_string(${o})]`);
    if (!u || !Array.isArray(u) || u[0] === "null")
      throw new TypeError("couldn't find edge destination ID in first edge data element");
    for (const a of this.layers) {
      let h = /* @__PURE__ */ new Set();
      if (a.edge) {
        const f = `[${a.edge.selector.length ? `?${a.edge.selector}` : ""}].[to_string(${i}), to_string(${o})] | [*].join(',',@)`, y = et.search(e, f);
        h = new Set(y);
      }
      this.layerSelectedEdges.push(h);
    }
  }
  addLayer(e) {
    this.layers.push(e);
  }
  insertLayer(e, n) {
    this.layers.splice(e, 0, n);
  }
  getStyleForNode(e) {
    const n = [];
    for (let i = 0; i < this.layers.length; i++) {
      const { node: o } = this.layers[i];
      this.layerSelectedNodes[i].has(e) && o && n.push(o.style);
    }
    const r = no({}, ...n, Wf);
    return n.length === 0 && (r.enabled = !1), r;
  }
  getStyleForEdge(e, n) {
    const r = `${e},${n}`, i = [];
    for (let s = 0; s < this.layers.length; s++) {
      const { edge: u } = this.layers[s];
      this.layerSelectedEdges[s].has(r) && u && i.push(u.style);
    }
    const o = no({}, ...i, rn.parse({}));
    return i.length === 0 && (o.enabled = !1), o;
  }
}
class Qf {
  constructor(e, n) {
    if (this.edgeCache = new Pa(), this.nodeCache = /* @__PURE__ */ new Map(), this.running = !0, this.graphObservable = new dr(), this.nodeObservable = new dr(), this.edgeObservable = new dr(), this.config = Bl(n), this.meshCache = new rf(), this.styles = new Vr({ addDefaultStyle: !0 }), this.config.behavior.fetchNodes && (this.fetchNodes = this.config.behavior.fetchNodes), this.config.behavior.fetchEdges && (this.fetchEdges = this.config.behavior.fetchEdges), typeof e == "string") {
      const r = document.getElementById(e);
      if (!r)
        throw new Error(`getElementById() could not find element '${e}'`);
      this.element = r;
    } else if (e instanceof Element)
      this.element = e;
    else
      throw new TypeError("Graph constructor requires 'element' argument that is either a string specifying the ID of the HTML element or an Element");
    if (this.element.innerHTML = "", this.canvas = document.createElement("canvas"), this.canvas.setAttribute("id", `babylonForceGraphRenderCanvas${Date.now()}`), this.canvas.setAttribute("touch-action", "none"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.touchAction = "none", this.element.appendChild(this.canvas), this.engine = new $r(this.canvas, !0), this.scene = new Ma(this.engine), this.camera = new za(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      this.config.style.startingCameraDistance,
      new Ye(0, 0, 0)
    ), delete this.camera.lowerBetaLimit, delete this.camera.upperBetaLimit, this.camera.attachControl(this.canvas, !0), new Sa("light", new Ye(1, 1, 0)), this.config.style.skybox && this.config.style.skybox.length && new Ca(
      "testdome",
      this.config.style.skybox,
      {
        resolution: 32,
        size: 1e3
      },
      this.scene
    ), this.config.engine.type === "ngraph")
      this.graphEngine = new Hf();
    else if (this.config.engine.type === "d3")
      this.graphEngine = new nf();
    else
      throw new TypeError(`Unknown graph engine type: '${this.graphEngineType}'`);
    this.stats = new Kf(this);
    for (let r = 0; r < this.config.engine.preSteps; r++)
      this.graphEngine.step();
  }
  shutdown() {
    this.engine.dispose();
  }
  async init() {
    this.engine.runRenderLoop(() => {
      this.update(), this.scene.render();
    }), Jf();
    const e = [
      ro("VR", "immersive-vr", "local-floor"),
      ro("AR", "immersive-ar", "local-floor")
    ];
    if (navigator.xr) {
      this.xrHelper = await this.scene.createDefaultXRExperienceAsync({
        uiOptions: {
          customButtons: e
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
      const n = Yf(this), r = document.createElement("button");
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
      for (let e = 0; e < this.config.engine.stepMultiplier; e++)
        this.graphEngine.step();
      this.stats.graphStep.endMonitoring(), this.stats.nodeUpdate.beginMonitoring();
      for (const e of this.graphEngine.nodes)
        e.update();
      this.stats.nodeUpdate.endMonitoring(), this.stats.edgeUpdate.beginMonitoring(), Ue.updateRays(this);
      for (const e of this.graphEngine.edges)
        e.update();
      this.stats.edgeUpdate.endMonitoring(), this.graphEngine.isSettled && (this.graphObservable.notifyObservers({ type: "graph-settled", graph: this }), this.running = !1);
    }
  }
  addNode(e, n) {
    return this.addNodes([e], n);
  }
  addNodes(e, n) {
    const r = n || this.config.knownFields.nodeIdPath;
    this.styles.addNodes(e);
    for (const i of e) {
      const o = i, s = et.search(i, r);
      this.nodeObservable.notifyObservers({ type: "node-add-before", nodeId: s, metadata: o });
      const u = this.styles.getStyleForNode(s);
      mo.create(this, s, u, {
        pinOnDrag: this.pinOnDrag,
        metadata: o
      });
    }
  }
  addEdge(e, n, r) {
    this.addEdges([e], n, r);
  }
  addEdges(e, n, r) {
    const i = n || this.config.knownFields.edgeSrcIdPath, o = r || this.config.knownFields.edgeDstIdPath;
    this.styles.addEdges(e);
    for (const s of e) {
      const u = s, a = et.search(s, i), h = et.search(s, o);
      this.edgeObservable.notifyObservers({ type: "edge-add-before", srcNodeId: a, dstNodeId: h, metadata: u });
      const d = this.styles.getStyleForEdge(a, h);
      Ue.create(this, a, h, d, {
        metadata: u
      });
    }
  }
  addListener(e, n) {
    switch (e) {
      case "graph-settled":
        this.graphObservable.add((r) => {
          r.type === e && n(r);
        });
        break;
      case "node-add-before":
        this.nodeObservable.add((r) => {
          r.type === e && n(r);
        });
        break;
      case "edge-add-before":
        this.edgeObservable.add((r) => {
          r.type === e && n(r);
        });
        break;
      default:
        throw new TypeError(`Unknown listener type in addListener: ${e}`);
    }
  }
  async loadJsonData(e, n) {
    this.stats.loadTime.beginMonitoring();
    const { nodeListProp: r, edgeListProp: i, nodeIdProp: o, edgeSrcIdProp: s, edgeDstIdProp: u, fetchOpts: a } = Rl(n), d = await (await fetch(e, a)).json();
    if (!Array.isArray(d[r]))
      throw TypeError(`when fetching JSON data: '${r}' was not an Array`);
    if (!Array.isArray(d[i]))
      throw TypeError(`when fetching JSON data: '${i}' was not an Array`);
    for (const f of d[r]) {
      const y = f[o], b = f;
      this.addNode(y, b);
    }
    for (const f of d[i]) {
      const y = f[s], b = f[u], m = f;
      this.addEdge(y, b, m);
    }
    this.stats.loadTime.endMonitoring();
  }
}
function ro(t, e, n) {
  e = e || "immersive-vr", n = n || "local-floor";
  const r = document.createElement("button");
  r.classList.add("webxr-button"), r.classList.add("webxr-available"), r.innerHTML = t;
  const i = new Aa(r, e, n);
  return i.update = function(o) {
    o === null ? (r.style.display = "", r.classList.remove("webxr-presenting")) : o === i ? (r.style.display = "", r.classList.add("webxr-presenting")) : r.style.display = "none";
  }, i;
}
function Jf() {
  const t = `
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
    }`, e = document.createElement("style");
  e.appendChild(document.createTextNode(t)), document.getElementsByTagName("head")[0].appendChild(e);
}
function Yf(t) {
  const e = document.createElement("div");
  e.classList.add("xr-button-overlay"), e.style.cssText = "z-index:11;position: absolute; right: 20px;bottom: 50px;";
  const n = t.scene.getEngine().getInputElement();
  return n && n.parentNode && n.parentNode.appendChild(e), e;
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Xf = (t) => (e, n) => {
  n !== void 0 ? n.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const In = globalThis, Wr = In.ShadowRoot && (In.ShadyCSS === void 0 || In.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, bs = Symbol(), io = /* @__PURE__ */ new WeakMap();
let ep = class {
  constructor(e, n, r) {
    if (this._$cssResult$ = !0, r !== bs)
      throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = n;
  }
  get styleSheet() {
    let e = this.o;
    const n = this.t;
    if (Wr && e === void 0) {
      const r = n !== void 0 && n.length === 1;
      r && (e = io.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && io.set(n, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const tp = (t) => new ep(typeof t == "string" ? t : t + "", void 0, bs), np = (t, e) => {
  if (Wr)
    t.adoptedStyleSheets = e.map((n) => n instanceof CSSStyleSheet ? n : n.styleSheet);
  else
    for (const n of e) {
      const r = document.createElement("style"), i = In.litNonce;
      i !== void 0 && r.setAttribute("nonce", i), r.textContent = n.cssText, t.appendChild(r);
    }
}, oo = Wr ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let n = "";
  for (const r of e.cssRules)
    n += r.cssText;
  return tp(n);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: rp, defineProperty: ip, getOwnPropertyDescriptor: op, getOwnPropertyNames: sp, getOwnPropertySymbols: ap, getPrototypeOf: up } = Object, it = globalThis, so = it.trustedTypes, cp = so ? so.emptyScript : "", yr = it.reactiveElementPolyfillSupport, Qt = (t, e) => t, jn = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? cp : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let n = t;
  switch (e) {
    case Boolean:
      n = t !== null;
      break;
    case Number:
      n = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        n = JSON.parse(t);
      } catch {
        n = null;
      }
  }
  return n;
} }, Qr = (t, e) => !rp(t, e), ao = { attribute: !0, type: String, converter: jn, reflect: !1, useDefault: !1, hasChanged: Qr };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), it.litPropertyMetadata ?? (it.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class bt extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, n = ao) {
    if (n.state && (n.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((n = Object.create(n)).wrapped = !0), this.elementProperties.set(e, n), !n.noAccessor) {
      const r = Symbol(), i = this.getPropertyDescriptor(e, r, n);
      i !== void 0 && ip(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, n, r) {
    const { get: i, set: o } = op(this.prototype, e) ?? { get() {
      return this[n];
    }, set(s) {
      this[n] = s;
    } };
    return { get: i, set(s) {
      const u = i == null ? void 0 : i.call(this);
      o == null || o.call(this, s), this.requestUpdate(e, u, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ao;
  }
  static _$Ei() {
    if (this.hasOwnProperty(Qt("elementProperties")))
      return;
    const e = up(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(Qt("finalized")))
      return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(Qt("properties"))) {
      const n = this.properties, r = [...sp(n), ...ap(n)];
      for (const i of r)
        this.createProperty(i, n[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const n = litPropertyMetadata.get(e);
      if (n !== void 0)
        for (const [r, i] of n)
          this.elementProperties.set(r, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [n, r] of this.elementProperties) {
      const i = this._$Eu(n, r);
      i !== void 0 && this._$Eh.set(i, n);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const n = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const i of r)
        n.unshift(oo(i));
    } else
      e !== void 0 && n.push(oo(e));
    return n;
  }
  static _$Eu(e, n) {
    const r = n.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((n) => this.enableUpdating = n), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((n) => n(this));
  }
  addController(e) {
    var n;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((n = e.hostConnected) == null || n.call(e));
  }
  removeController(e) {
    var n;
    (n = this._$EO) == null || n.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), n = this.constructor.elementProperties;
    for (const r of n.keys())
      this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return np(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((n) => {
      var r;
      return (r = n.hostConnected) == null ? void 0 : r.call(n);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((n) => {
      var r;
      return (r = n.hostDisconnected) == null ? void 0 : r.call(n);
    });
  }
  attributeChangedCallback(e, n, r) {
    this._$AK(e, r);
  }
  _$ET(e, n) {
    var o;
    const r = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, r);
    if (i !== void 0 && r.reflect === !0) {
      const s = (((o = r.converter) == null ? void 0 : o.toAttribute) !== void 0 ? r.converter : jn).toAttribute(n, r.type);
      this._$Em = e, s == null ? this.removeAttribute(i) : this.setAttribute(i, s), this._$Em = null;
    }
  }
  _$AK(e, n) {
    var o, s;
    const r = this.constructor, i = r._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const u = r.getPropertyOptions(i), a = typeof u.converter == "function" ? { fromAttribute: u.converter } : ((o = u.converter) == null ? void 0 : o.fromAttribute) !== void 0 ? u.converter : jn;
      this._$Em = i, this[i] = a.fromAttribute(n, u.type) ?? ((s = this._$Ej) == null ? void 0 : s.get(i)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(e, n, r) {
    var i;
    if (e !== void 0) {
      const o = this.constructor, s = this[e];
      if (r ?? (r = o.getPropertyOptions(e)), !((r.hasChanged ?? Qr)(s, n) || r.useDefault && r.reflect && s === ((i = this._$Ej) == null ? void 0 : i.get(e)) && !this.hasAttribute(o._$Eu(e, r))))
        return;
      this.C(e, n, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, n, { useDefault: r, reflect: i, wrapped: o }, s) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, s ?? n ?? this[e]), o !== !0 || s !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (n = void 0), this._$AL.set(e, n)), i === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (n) {
      Promise.reject(n);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending)
      return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, s] of this._$Ep)
          this[o] = s;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0)
        for (const [o, s] of i) {
          const { wrapped: u } = s, a = this[o];
          u !== !0 || this._$AL.has(o) || a === void 0 || this.C(o, void 0, s, a);
        }
    }
    let e = !1;
    const n = this._$AL;
    try {
      e = this.shouldUpdate(n), e ? (this.willUpdate(n), (r = this._$EO) == null || r.forEach((i) => {
        var o;
        return (o = i.hostUpdate) == null ? void 0 : o.call(i);
      }), this.update(n)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(n);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var n;
    (n = this._$EO) == null || n.forEach((r) => {
      var i;
      return (i = r.hostUpdated) == null ? void 0 : i.call(r);
    }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((n) => this._$ET(n, this[n]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
}
bt.elementStyles = [], bt.shadowRootOptions = { mode: "open" }, bt[Qt("elementProperties")] = /* @__PURE__ */ new Map(), bt[Qt("finalized")] = /* @__PURE__ */ new Map(), yr == null || yr({ ReactiveElement: bt }), (it.reactiveElementVersions ?? (it.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const hp = { attribute: !0, type: String, converter: jn, reflect: !1, hasChanged: Qr }, lp = (t = hp, e, n) => {
  const { kind: r, metadata: i } = n;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), r === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(n.name, t), r === "accessor") {
    const { name: s } = n;
    return { set(u) {
      const a = e.get.call(this);
      e.set.call(this, u), this.requestUpdate(s, a, t);
    }, init(u) {
      return u !== void 0 && this.C(s, void 0, t, u), u;
    } };
  }
  if (r === "setter") {
    const { name: s } = n;
    return function(u) {
      const a = this[s];
      e.call(this, u), this.requestUpdate(s, a, t);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function ws(t) {
  return (e, n) => typeof n == "object" ? lp(t, e, n) : ((r, i, o) => {
    const s = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, r), s ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(t, e, n);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Jt = globalThis, Bn = Jt.trustedTypes, uo = Bn ? Bn.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, xs = "$lit$", tt = `lit$${Math.random().toFixed(9).slice(2)}$`, $s = "?" + tt, dp = `<${$s}>`, ft = document, sn = () => ft.createComment(""), an = (t) => t === null || typeof t != "object" && typeof t != "function", Jr = Array.isArray, fp = (t) => Jr(t) || typeof (t == null ? void 0 : t[Symbol.iterator]) == "function", br = `[ 	
\f\r]`, qt = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, co = /-->/g, ho = />/g, at = RegExp(`>|${br}(?:([^\\s"'>=/]+)(${br}*=${br}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), lo = /'/g, fo = /"/g, ks = /^(?:script|style|textarea|title)$/i, Tt = Symbol.for("lit-noChange"), _e = Symbol.for("lit-nothing"), po = /* @__PURE__ */ new WeakMap(), ut = ft.createTreeWalker(ft, 129);
function Es(t, e) {
  if (!Jr(t) || !t.hasOwnProperty("raw"))
    throw Error("invalid template strings array");
  return uo !== void 0 ? uo.createHTML(e) : e;
}
const pp = (t, e) => {
  const n = t.length - 1, r = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", s = qt;
  for (let u = 0; u < n; u++) {
    const a = t[u];
    let h, d, f = -1, y = 0;
    for (; y < a.length && (s.lastIndex = y, d = s.exec(a), d !== null); )
      y = s.lastIndex, s === qt ? d[1] === "!--" ? s = co : d[1] !== void 0 ? s = ho : d[2] !== void 0 ? (ks.test(d[2]) && (i = RegExp("</" + d[2], "g")), s = at) : d[3] !== void 0 && (s = at) : s === at ? d[0] === ">" ? (s = i ?? qt, f = -1) : d[1] === void 0 ? f = -2 : (f = s.lastIndex - d[2].length, h = d[1], s = d[3] === void 0 ? at : d[3] === '"' ? fo : lo) : s === fo || s === lo ? s = at : s === co || s === ho ? s = qt : (s = at, i = void 0);
    const b = s === at && t[u + 1].startsWith("/>") ? " " : "";
    o += s === qt ? a + dp : f >= 0 ? (r.push(h), a.slice(0, f) + xs + a.slice(f) + tt + b) : a + tt + (f === -2 ? u : b);
  }
  return [Es(t, o + (t[n] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class un {
  constructor({ strings: e, _$litType$: n }, r) {
    let i;
    this.parts = [];
    let o = 0, s = 0;
    const u = e.length - 1, a = this.parts, [h, d] = pp(e, n);
    if (this.el = un.createElement(h, r), ut.currentNode = this.el.content, n === 2 || n === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (i = ut.nextNode()) !== null && a.length < u; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes())
          for (const f of i.getAttributeNames())
            if (f.endsWith(xs)) {
              const y = d[s++], b = i.getAttribute(f).split(tt), m = /([.?@])?(.*)/.exec(y);
              a.push({ type: 1, index: o, name: m[2], strings: b, ctor: m[1] === "." ? vp : m[1] === "?" ? _p : m[1] === "@" ? mp : Qn }), i.removeAttribute(f);
            } else
              f.startsWith(tt) && (a.push({ type: 6, index: o }), i.removeAttribute(f));
        if (ks.test(i.tagName)) {
          const f = i.textContent.split(tt), y = f.length - 1;
          if (y > 0) {
            i.textContent = Bn ? Bn.emptyScript : "";
            for (let b = 0; b < y; b++)
              i.append(f[b], sn()), ut.nextNode(), a.push({ type: 2, index: ++o });
            i.append(f[y], sn());
          }
        }
      } else if (i.nodeType === 8)
        if (i.data === $s)
          a.push({ type: 2, index: o });
        else {
          let f = -1;
          for (; (f = i.data.indexOf(tt, f + 1)) !== -1; )
            a.push({ type: 7, index: o }), f += tt.length - 1;
        }
      o++;
    }
  }
  static createElement(e, n) {
    const r = ft.createElement("template");
    return r.innerHTML = e, r;
  }
}
function Mt(t, e, n = t, r) {
  var s, u;
  if (e === Tt)
    return e;
  let i = r !== void 0 ? (s = n._$Co) == null ? void 0 : s[r] : n._$Cl;
  const o = an(e) ? void 0 : e._$litDirective$;
  return (i == null ? void 0 : i.constructor) !== o && ((u = i == null ? void 0 : i._$AO) == null || u.call(i, !1), o === void 0 ? i = void 0 : (i = new o(t), i._$AT(t, n, r)), r !== void 0 ? (n._$Co ?? (n._$Co = []))[r] = i : n._$Cl = i), i !== void 0 && (e = Mt(t, i._$AS(t, e.values), i, r)), e;
}
class gp {
  constructor(e, n) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = n;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: n }, parts: r } = this._$AD, i = ((e == null ? void 0 : e.creationScope) ?? ft).importNode(n, !0);
    ut.currentNode = i;
    let o = ut.nextNode(), s = 0, u = 0, a = r[0];
    for (; a !== void 0; ) {
      if (s === a.index) {
        let h;
        a.type === 2 ? h = new ln(o, o.nextSibling, this, e) : a.type === 1 ? h = new a.ctor(o, a.name, a.strings, this, e) : a.type === 6 && (h = new yp(o, this, e)), this._$AV.push(h), a = r[++u];
      }
      s !== (a == null ? void 0 : a.index) && (o = ut.nextNode(), s++);
    }
    return ut.currentNode = ft, i;
  }
  p(e) {
    let n = 0;
    for (const r of this._$AV)
      r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, n), n += r.strings.length - 2) : r._$AI(e[n])), n++;
  }
}
class ln {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, n, r, i) {
    this.type = 2, this._$AH = _e, this._$AN = void 0, this._$AA = e, this._$AB = n, this._$AM = r, this.options = i, this._$Cv = (i == null ? void 0 : i.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const n = this._$AM;
    return n !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = n.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, n = this) {
    e = Mt(this, e, n), an(e) ? e === _e || e == null || e === "" ? (this._$AH !== _e && this._$AR(), this._$AH = _e) : e !== this._$AH && e !== Tt && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : fp(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== _e && an(this._$AH) ? this._$AA.nextSibling.data = e : this.T(ft.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var o;
    const { values: n, _$litType$: r } = e, i = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = un.createElement(Es(r.h, r.h[0]), this.options)), r);
    if (((o = this._$AH) == null ? void 0 : o._$AD) === i)
      this._$AH.p(n);
    else {
      const s = new gp(i, this), u = s.u(this.options);
      s.p(n), this.T(u), this._$AH = s;
    }
  }
  _$AC(e) {
    let n = po.get(e.strings);
    return n === void 0 && po.set(e.strings, n = new un(e)), n;
  }
  k(e) {
    Jr(this._$AH) || (this._$AH = [], this._$AR());
    const n = this._$AH;
    let r, i = 0;
    for (const o of e)
      i === n.length ? n.push(r = new ln(this.O(sn()), this.O(sn()), this, this.options)) : r = n[i], r._$AI(o), i++;
    i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
  }
  _$AR(e = this._$AA.nextSibling, n) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, n); e && e !== this._$AB; ) {
      const i = e.nextSibling;
      e.remove(), e = i;
    }
  }
  setConnected(e) {
    var n;
    this._$AM === void 0 && (this._$Cv = e, (n = this._$AP) == null || n.call(this, e));
  }
}
class Qn {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, n, r, i, o) {
    this.type = 1, this._$AH = _e, this._$AN = void 0, this.element = e, this.name = n, this._$AM = i, this.options = o, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = _e;
  }
  _$AI(e, n = this, r, i) {
    const o = this.strings;
    let s = !1;
    if (o === void 0)
      e = Mt(this, e, n, 0), s = !an(e) || e !== this._$AH && e !== Tt, s && (this._$AH = e);
    else {
      const u = e;
      let a, h;
      for (e = o[0], a = 0; a < o.length - 1; a++)
        h = Mt(this, u[r + a], n, a), h === Tt && (h = this._$AH[a]), s || (s = !an(h) || h !== this._$AH[a]), h === _e ? e = _e : e !== _e && (e += (h ?? "") + o[a + 1]), this._$AH[a] = h;
    }
    s && !i && this.j(e);
  }
  j(e) {
    e === _e ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class vp extends Qn {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === _e ? void 0 : e;
  }
}
class _p extends Qn {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== _e);
  }
}
class mp extends Qn {
  constructor(e, n, r, i, o) {
    super(e, n, r, i, o), this.type = 5;
  }
  _$AI(e, n = this) {
    if ((e = Mt(this, e, n, 0) ?? _e) === Tt)
      return;
    const r = this._$AH, i = e === _e && r !== _e || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, o = e !== _e && (r === _e || i);
    i && this.element.removeEventListener(this.name, this, r), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var n;
    typeof this._$AH == "function" ? this._$AH.call(((n = this.options) == null ? void 0 : n.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class yp {
  constructor(e, n, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = n, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    Mt(this, e);
  }
}
const wr = Jt.litHtmlPolyfillSupport;
wr == null || wr(un, ln), (Jt.litHtmlVersions ?? (Jt.litHtmlVersions = [])).push("3.3.0");
const bp = (t, e, n) => {
  const r = (n == null ? void 0 : n.renderBefore) ?? e;
  let i = r._$litPart$;
  if (i === void 0) {
    const o = (n == null ? void 0 : n.renderBefore) ?? null;
    r._$litPart$ = i = new ln(e.insertBefore(sn(), o), o, void 0, n ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = globalThis;
class Yt extends bt {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var n;
    const e = super.createRenderRoot();
    return (n = this.renderOptions).renderBefore ?? (n.renderBefore = e.firstChild), e;
  }
  update(e) {
    const n = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = bp(n, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var e;
    super.connectedCallback(), (e = this._$Do) == null || e.setConnected(!0);
  }
  disconnectedCallback() {
    var e;
    super.disconnectedCallback(), (e = this._$Do) == null || e.setConnected(!1);
  }
  render() {
    return Tt;
  }
}
var _o;
Yt._$litElement$ = !0, Yt.finalized = !0, (_o = ct.litElementHydrateSupport) == null || _o.call(ct, { LitElement: Yt });
const xr = ct.litElementPolyfillSupport;
xr == null || xr({ LitElement: Yt });
(ct.litElementVersions ?? (ct.litElementVersions = [])).push("4.2.0");
var wp = Object.defineProperty, xp = Object.getOwnPropertyDescriptor, Yr = (t, e, n, r) => {
  for (var i = r > 1 ? void 0 : r ? xp(e, n) : e, o = t.length - 1, s; o >= 0; o--)
    (s = t[o]) && (i = (r ? s(e, n, i) : s(i)) || i);
  return r && i && wp(e, n, i), i;
}, Ns = (t, e, n) => {
  if (!e.has(t))
    throw TypeError("Cannot " + n);
}, Qe = (t, e, n) => (Ns(t, e, "read from private field"), n ? n.call(t) : e.get(t)), go = (t, e, n) => {
  if (e.has(t))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(t) : e.set(t, n);
}, vo = (t, e, n, r) => (Ns(t, e, "write to private field"), r ? r.call(t, n) : e.set(t, n), n), Je, wt;
let Dn = class extends Yt {
  constructor() {
    super(), go(this, Je, void 0), go(this, wt, void 0), this.thing = !0, this.thing3 = 42, vo(this, wt, document.createElement("div")), vo(this, Je, new Qf(Qe(this, wt))), Qe(this, Je).addNodes([
      { id: 0 },
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 }
    ]), Qe(this, Je).addEdges([
      { src: 0, dst: 1 },
      { src: 0, dst: 2 },
      { src: 2, dst: 3 },
      { src: 3, dst: 0 },
      { src: 3, dst: 4 },
      { src: 3, dst: 5 }
    ]), Qe(this, Je).init().then(() => {
      Qe(this, Je).engine.resize(!0);
    }).catch((t) => {
      throw t;
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.renderRoot.appendChild(Qe(this, wt));
  }
  render() {
    return Qe(this, wt);
  }
  // override createRenderRoot() {
  //     return this;
  // }
  disconnectedCallback() {
    var t;
    (t = Qe(this, Je)) == null || t.shutdown();
  }
};
Je = /* @__PURE__ */ new WeakMap();
wt = /* @__PURE__ */ new WeakMap();
Yr([
  ws()
], Dn.prototype, "thing", 2);
Yr([
  ws()
], Dn.prototype, "thing3", 2);
Dn = Yr([
  Xf("graphty-core")
], Dn);
const Ts = /* @__PURE__ */ new Map([
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
function $p(t) {
  const e = Ts.get(t);
  return e || t;
}
const Np = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  colorMap: Ts,
  colorNameToHex: $p
}, Symbol.toStringTag, { value: "Module" }));
export {
  Ue as Edge,
  Qf as Graph,
  Dn as Graphty,
  mo as Node,
  Vr as Styles,
  Np as util
};
