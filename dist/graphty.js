var m5 = Object.defineProperty;
var np = (n) => {
  throw TypeError(n);
};
var v5 = (n, e, t) => e in n ? m5(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var Gl = (n, e, t) => v5(n, typeof e != "symbol" ? e + "" : e, t), jl = (n, e, t) => e.has(n) || np("Cannot " + t);
var Vl = (n, e, t) => (jl(n, e, "read from private field"), t ? t.call(n) : e.get(n)), ba = (n, e, t) => e.has(n) ? np("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), Kl = (n, e, t, r) => (jl(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), rp = (n, e, t) => (jl(n, e, "access private method"), t);
import { Color3 as Mr, Mesh as ip, Vector3 as kt, DynamicTexture as _5, Texture as y5, StandardMaterial as Mg, Engine as Ga, MeshBuilder as jn, AbstractMesh as b5, Ray as w5, GreasedLineTools as x5, CreateGreasedLine as Jl, GreasedLineMeshWidthDistribution as T5, RawTexture as op, GreasedLineMeshColorMode as S5, Color4 as Za, TransformNode as Eg, UniversalCamera as C5, Axis as Yl, Space as Ql, Scalar as sp, FreeCamera as M5, Camera as E5, PointerEventTypes as Ho, SixDofDragBehavior as A5, ActionManager as ap, ExecuteCodeAction as I5, PerfCounter as io, SceneInstrumentation as P5, EngineInstrumentation as O5, Observable as Xl, Logger as up, Scene as k5, HemisphericLight as $5, PhotoDome as N5 } from "@babylonjs/core";
function dt(n, e) {
  let t = n.length;
  Array.isArray(n[0]) || (n = [n]), Array.isArray(e[0]) || (e = e.map((u) => [u]));
  let r = e[0].length, o = e[0].map((u, h) => e.map((c) => c[h])), a = n.map((u) => o.map((h) => {
    let c = 0;
    if (!Array.isArray(u)) {
      for (let f of h)
        c += u * f;
      return c;
    }
    for (let f = 0; f < u.length; f++)
      c += u[f] * (h[f] || 0);
    return c;
  }));
  return t === 1 && (a = a[0]), r === 1 ? a.map((u) => u[0]) : a;
}
function ys(n) {
  return Vr(n) === "string";
}
function Vr(n) {
  return (Object.prototype.toString.call(n).match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
function ja(n, { precision: e, unit: t }) {
  return Yr(n) ? "none" : Ag(n, e) + (t ?? "");
}
function Yr(n) {
  return Number.isNaN(n) || n instanceof Number && (n == null ? void 0 : n.none);
}
function It(n) {
  return Yr(n) ? 0 : n;
}
function Ag(n, e) {
  if (n === 0)
    return 0;
  let t = ~~n, r = 0;
  t && e && (r = ~~Math.log10(Math.abs(t)) + 1);
  const o = 10 ** (e - r);
  return Math.floor(n * o + 0.5) / o;
}
const R5 = {
  deg: 1,
  grad: 0.9,
  rad: 180 / Math.PI,
  turn: 360
};
function Ig(n) {
  if (!n)
    return;
  n = n.trim();
  const e = /^([a-z]+)\((.+?)\)$/i, t = /^-?[\d.]+$/, r = /%|deg|g?rad|turn$/, o = /\/?\s*(none|[-\w.]+(?:%|deg|g?rad|turn)?)/g;
  let a = n.match(e);
  if (a) {
    let u = [];
    return a[2].replace(o, (h, c) => {
      let f = c.match(r), d = c;
      if (f) {
        let g = f[0], v = d.slice(0, -g.length);
        g === "%" ? (d = new Number(v / 100), d.type = "<percentage>") : (d = new Number(v * R5[g]), d.type = "<angle>", d.unit = g);
      } else t.test(d) ? (d = new Number(d), d.type = "<number>") : d === "none" && (d = new Number(NaN), d.none = !0);
      h.startsWith("/") && (d = d instanceof Number ? d : new Number(d), d.alpha = !0), typeof d == "object" && d instanceof Number && (d.raw = c), u.push(d);
    }), {
      name: a[1].toLowerCase(),
      rawName: a[1],
      rawArgs: a[2],
      // An argument could be (as of css-color-4):
      // a number, percentage, degrees (hue), ident (in color())
      args: u
    };
  }
}
function Pg(n) {
  return n[n.length - 1];
}
function ss(n, e, t) {
  return isNaN(n) ? e : isNaN(e) ? n : n + (e - n) * t;
}
function Og(n, e, t) {
  return (t - n) / (e - n);
}
function _h(n, e, t) {
  return ss(e[0], e[1], Og(n[0], n[1], t));
}
function kg(n) {
  return n.map((e) => e.split("|").map((t) => {
    t = t.trim();
    let r = t.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
    if (r) {
      let o = new String(r[1]);
      return o.range = [+r[2], +r[3]], o;
    }
    return t;
  }));
}
function $g(n, e, t) {
  return Math.max(Math.min(t, e), n);
}
function Cu(n, e) {
  return Math.sign(n) === Math.sign(e) ? n : -n;
}
function ur(n, e) {
  return Cu(Math.abs(n) ** e, n);
}
function yh(n, e) {
  return e === 0 ? 0 : n / e;
}
function Ng(n, e, t = 0, r = n.length) {
  for (; t < r; ) {
    const o = t + r >> 1;
    n[o] < e ? t = o + 1 : r = o;
  }
  return t;
}
var z5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  bisectLeft: Ng,
  clamp: $g,
  copySign: Cu,
  interpolate: ss,
  interpolateInv: Og,
  isNone: Yr,
  isString: ys,
  last: Pg,
  mapRange: _h,
  multiplyMatrices: dt,
  parseCoordGrammar: kg,
  parseFunction: Ig,
  serializeNumber: ja,
  skipNone: It,
  spow: ur,
  toPrecision: Ag,
  type: Vr,
  zdiv: yh
});
class D5 {
  add(e, t, r) {
    if (typeof arguments[0] != "string") {
      for (var e in arguments[0])
        this.add(e, arguments[0][e], arguments[1]);
      return;
    }
    (Array.isArray(e) ? e : [e]).forEach(function(o) {
      this[o] = this[o] || [], t && this[o][r ? "unshift" : "push"](t);
    }, this);
  }
  run(e, t) {
    this[e] = this[e] || [], this[e].forEach(function(r) {
      r.call(t && t.context ? t.context : t, t);
    });
  }
}
const Qr = new D5();
var xg, Tg, Sg, Pn = {
  gamut_mapping: "css",
  precision: 5,
  deltaE: "76",
  // Default deltaE method
  verbose: ((Sg = (Tg = (xg = globalThis == null ? void 0 : globalThis.process) == null ? void 0 : xg.env) == null ? void 0 : Tg.NODE_ENV) == null ? void 0 : Sg.toLowerCase()) !== "test",
  warn: function(e) {
    var t, r;
    this.verbose && ((r = (t = globalThis == null ? void 0 : globalThis.console) == null ? void 0 : t.warn) == null || r.call(t, e));
  }
};
const rn = {
  // for compatibility, the four-digit chromaticity-derived ones everyone else uses
  D50: [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585],
  D65: [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329]
};
function kc(n) {
  return Array.isArray(n) ? n : rn[n];
}
function Va(n, e, t, r = {}) {
  if (n = kc(n), e = kc(e), !n || !e)
    throw new TypeError(`Missing white point to convert ${n ? "" : "from"}${!n && !e ? "/" : ""}${e ? "" : "to"}`);
  if (n === e)
    return t;
  let o = { W1: n, W2: e, XYZ: t, options: r };
  if (Qr.run("chromatic-adaptation-start", o), o.M || (o.W1 === rn.D65 && o.W2 === rn.D50 ? o.M = [
    [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
    [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
    [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371]
  ] : o.W1 === rn.D50 && o.W2 === rn.D65 && (o.M = [
    [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
    [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
    [0.012314014864481998, -0.020507649298898964, 1.330365926242124]
  ])), Qr.run("chromatic-adaptation-end", o), o.M)
    return dt(o.M, o.XYZ);
  throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
}
const L5 = /* @__PURE__ */ new Set(["<number>", "<percentage>", "<angle>"]);
function lp(n, e, t, r) {
  return Object.entries(n.coords).map(([a, u], h) => {
    let c = e.coordGrammar[h], f = r[h], d = f == null ? void 0 : f.type, g;
    if (f.none ? g = c.find((_) => L5.has(_)) : g = c.find((_) => _ == d), !g) {
      let _ = u.name || a;
      throw new TypeError(`${d ?? f.raw} not allowed for ${_} in ${t}()`);
    }
    let v = g.range;
    d === "<percentage>" && (v || (v = [0, 1]));
    let b = u.range || u.refRange;
    return v && b && (r[h] = _h(v, b, r[h])), g;
  });
}
function Rg(n, { meta: e } = {}) {
  var r, o, a, u;
  let t = { str: (r = String(n)) == null ? void 0 : r.trim() };
  if (Qr.run("parse-start", t), t.color)
    return t.color;
  if (t.parsed = Ig(t.str), t.parsed) {
    let h = t.parsed.name;
    if (h === "color") {
      let c = t.parsed.args.shift(), f = c.startsWith("--") ? c.substring(2) : `--${c}`, d = [c, f], g = t.parsed.rawArgs.indexOf("/") > 0 ? t.parsed.args.pop() : 1;
      for (let _ of ye.all) {
        let O = _.getFormat("color");
        if (O && (d.includes(O.id) || (o = O.ids) != null && o.filter((E) => d.includes(E)).length)) {
          const E = Object.keys(_.coords).map((k, C) => t.parsed.args[C] || 0);
          let S;
          return O.coordGrammar && (S = lp(_, O, "color", E)), e && Object.assign(e, { formatId: "color", types: S }), O.id.startsWith("--") && !c.startsWith("--") && Pn.warn(`${_.name} is a non-standard space and not currently supported in the CSS spec. Use prefixed color(${O.id}) instead of color(${c}).`), c.startsWith("--") && !O.id.startsWith("--") && Pn.warn(`${_.name} is a standard space and supported in the CSS spec. Use color(${O.id}) instead of prefixed color(${c}).`), { spaceId: _.id, coords: E, alpha: g };
        }
      }
      let v = "", b = c in ye.registry ? c : f;
      if (b in ye.registry) {
        let _ = (u = (a = ye.registry[b].formats) == null ? void 0 : a.color) == null ? void 0 : u.id;
        _ && (v = `Did you mean color(${_})?`);
      }
      throw new TypeError(`Cannot parse color(${c}). ` + (v || "Missing a plugin?"));
    } else
      for (let c of ye.all) {
        let f = c.getFormat(h);
        if (f && f.type === "function") {
          let d = 1;
          (f.lastAlpha || Pg(t.parsed.args).alpha) && (d = t.parsed.args.pop());
          let g = t.parsed.args, v;
          return f.coordGrammar && (v = lp(c, f, h, g)), e && Object.assign(e, { formatId: f.name, types: v }), {
            spaceId: c.id,
            coords: g,
            alpha: d
          };
        }
      }
  } else
    for (let h of ye.all)
      for (let c in h.formats) {
        let f = h.formats[c];
        if (f.type !== "custom" || f.test && !f.test(t.str))
          continue;
        let d = f.parse(t.str);
        if (d)
          return d.alpha ?? (d.alpha = 1), e && (e.formatId = c), d;
      }
  throw new TypeError(`Could not parse ${n} as a color. Missing a plugin?`);
}
function Ne(n) {
  if (Array.isArray(n))
    return n.map(Ne);
  if (!n)
    throw new TypeError("Empty color reference");
  ys(n) && (n = Rg(n));
  let e = n.space || n.spaceId;
  return e instanceof ye || (n.space = ye.get(e)), n.alpha === void 0 && (n.alpha = 1), n;
}
const B5 = 75e-6, fn = class fn {
  constructor(e) {
    var o;
    this.id = e.id, this.name = e.name, this.base = e.base ? fn.get(e.base) : null, this.aliases = e.aliases, this.base && (this.fromBase = e.fromBase, this.toBase = e.toBase);
    let t = e.coords ?? this.base.coords;
    for (let a in t)
      "name" in t[a] || (t[a].name = a);
    this.coords = t;
    let r = e.white ?? this.base.white ?? "D65";
    this.white = kc(r), this.formats = e.formats ?? {};
    for (let a in this.formats) {
      let u = this.formats[a];
      u.type || (u.type = "function"), u.name || (u.name = a);
    }
    (o = this.formats.color) != null && o.id || (this.formats.color = {
      ...this.formats.color ?? {},
      id: e.cssId || this.id
    }), e.gamutSpace ? this.gamutSpace = e.gamutSpace === "self" ? this : fn.get(e.gamutSpace) : this.isPolar ? this.gamutSpace = this.base : this.gamutSpace = this, this.gamutSpace.isUnbounded && (this.inGamut = (a, u) => !0), this.referred = e.referred, Object.defineProperty(this, "path", {
      value: F5(this).reverse(),
      writable: !1,
      enumerable: !0,
      configurable: !0
    }), Qr.run("colorspace-init-end", this);
  }
  inGamut(e, { epsilon: t = B5 } = {}) {
    if (!this.equals(this.gamutSpace))
      return e = this.to(this.gamutSpace, e), this.gamutSpace.inGamut(e, { epsilon: t });
    let r = Object.values(this.coords);
    return e.every((o, a) => {
      let u = r[a];
      if (u.type !== "angle" && u.range) {
        if (Number.isNaN(o))
          return !0;
        let [h, c] = u.range;
        return (h === void 0 || o >= h - t) && (c === void 0 || o <= c + t);
      }
      return !0;
    });
  }
  get isUnbounded() {
    return Object.values(this.coords).every((e) => !("range" in e));
  }
  get cssId() {
    var e, t;
    return ((t = (e = this.formats) == null ? void 0 : e.color) == null ? void 0 : t.id) || this.id;
  }
  get isPolar() {
    for (let e in this.coords)
      if (this.coords[e].type === "angle")
        return !0;
    return !1;
  }
  getFormat(e) {
    if (typeof e == "object")
      return e = cp(e, this), e;
    let t;
    return e === "default" ? t = Object.values(this.formats)[0] : t = this.formats[e], t ? (t = cp(t, this), t) : null;
  }
  /**
   * Check if this color space is the same as another color space reference.
   * Allows proxying color space objects and comparing color spaces with ids.
   * @param {string | ColorSpace} space ColorSpace object or id to compare to
   * @returns {boolean}
   */
  equals(e) {
    return e ? this === e || this.id === e || this.id === e.id : !1;
  }
  to(e, t) {
    if (arguments.length === 1) {
      const h = Ne(e);
      [e, t] = [h.space, h.coords];
    }
    if (e = fn.get(e), this.equals(e))
      return t;
    t = t.map((h) => Number.isNaN(h) ? 0 : h);
    let r = this.path, o = e.path, a, u;
    for (let h = 0; h < r.length && r[h].equals(o[h]); h++)
      a = r[h], u = h;
    if (!a)
      throw new Error(`Cannot convert between color spaces ${this} and ${e}: no connection space was found`);
    for (let h = r.length - 1; h > u; h--)
      t = r[h].toBase(t);
    for (let h = u + 1; h < o.length; h++)
      t = o[h].fromBase(t);
    return t;
  }
  from(e, t) {
    if (arguments.length === 1) {
      const r = Ne(e);
      [e, t] = [r.space, r.coords];
    }
    return e = fn.get(e), e.to(this, t);
  }
  toString() {
    return `${this.name} (${this.id})`;
  }
  getMinCoords() {
    let e = [];
    for (let t in this.coords) {
      let r = this.coords[t], o = r.range || r.refRange;
      e.push((o == null ? void 0 : o.min) ?? 0);
    }
    return e;
  }
  // Returns array of unique color spaces
  static get all() {
    return [...new Set(Object.values(fn.registry))];
  }
  static register(e, t) {
    if (arguments.length === 1 && (t = arguments[0], e = t.id), t = this.get(t), this.registry[e] && this.registry[e] !== t)
      throw new Error(`Duplicate color space registration: '${e}'`);
    if (this.registry[e] = t, arguments.length === 1 && t.aliases)
      for (let r of t.aliases)
        this.register(r, t);
    return t;
  }
  /**
   * Lookup ColorSpace object by name
   * @param {ColorSpace | string} name
   */
  static get(e, ...t) {
    if (!e || e instanceof fn)
      return e;
    if (Vr(e) === "string") {
      let o = fn.registry[e.toLowerCase()];
      if (!o)
        throw new TypeError(`No color space found with id = "${e}"`);
      return o;
    }
    if (t.length)
      return fn.get(...t);
    throw new TypeError(`${e} is not a valid color space`);
  }
  /**
   * Get metadata about a coordinate of a color space
   *
   * @static
   * @param {Array | string} ref
   * @param {ColorSpace | string} [workingSpace]
   * @return {Object}
   */
  static resolveCoord(e, t) {
    var c;
    let r = Vr(e), o, a;
    if (r === "string" ? e.includes(".") ? [o, a] = e.split(".") : [o, a] = [, e] : Array.isArray(e) ? [o, a] = e : (o = e.space, a = e.coordId), o = fn.get(o), o || (o = t), !o)
      throw new TypeError(`Cannot resolve coordinate reference ${e}: No color space specified and relative references are not allowed here`);
    if (r = Vr(a), r === "number" || r === "string" && a >= 0) {
      let f = Object.entries(o.coords)[a];
      if (f)
        return { space: o, id: f[0], index: a, ...f[1] };
    }
    o = fn.get(o);
    let u = a.toLowerCase(), h = 0;
    for (let f in o.coords) {
      let d = o.coords[f];
      if (f.toLowerCase() === u || ((c = d.name) == null ? void 0 : c.toLowerCase()) === u)
        return { space: o, id: f, index: h, ...d };
      h++;
    }
    throw new TypeError(`No "${a}" coordinate found in ${o.name}. Its coordinates are: ${Object.keys(o.coords).join(", ")}`);
  }
};
Gl(fn, "registry", {}), Gl(fn, "DEFAULT_FORMAT", {
  type: "functions",
  name: "color"
});
let ye = fn;
function F5(n) {
  let e = [n];
  for (let t = n; t = t.base; )
    e.push(t);
  return e;
}
function cp(n, { coords: e } = {}) {
  if (n.coords && !n.coordGrammar) {
    n.type || (n.type = "function"), n.name || (n.name = "color"), n.coordGrammar = kg(n.coords);
    let t = Object.entries(e).map(([r, o], a) => {
      let u = n.coordGrammar[a][0], h = o.range || o.refRange, c = u.range, f = "";
      return u == "<percentage>" ? (c = [0, 100], f = "%") : u == "<angle>" && (f = "deg"), { fromRange: h, toRange: c, suffix: f };
    });
    n.serializeCoords = (r, o) => r.map((a, u) => {
      let { fromRange: h, toRange: c, suffix: f } = t[u];
      return h && c && (a = _h(h, c, a)), a = ja(a, { precision: o, unit: f }), a;
    });
  }
  return n;
}
var qt = new ye({
  id: "xyz-d65",
  name: "XYZ D65",
  coords: {
    x: { name: "X" },
    y: { name: "Y" },
    z: { name: "Z" }
  },
  white: "D65",
  formats: {
    color: {
      ids: ["xyz-d65", "xyz"]
    }
  },
  aliases: ["xyz"]
});
class gn extends ye {
  /**
   * Creates a new RGB ColorSpace.
   * If coords are not specified, they will use the default RGB coords.
   * Instead of `fromBase()` and `toBase()` functions,
   * you can specify to/from XYZ matrices and have `toBase()` and `fromBase()` automatically generated.
   * @param {*} options - Same options as {@link ColorSpace} plus:
   * @param {number[][]} options.toXYZ_M - Matrix to convert to XYZ
   * @param {number[][]} options.fromXYZ_M - Matrix to convert from XYZ
   */
  constructor(e) {
    e.coords || (e.coords = {
      r: {
        range: [0, 1],
        name: "Red"
      },
      g: {
        range: [0, 1],
        name: "Green"
      },
      b: {
        range: [0, 1],
        name: "Blue"
      }
    }), e.base || (e.base = qt), e.toXYZ_M && e.fromXYZ_M && (e.toBase ?? (e.toBase = (t) => {
      let r = dt(e.toXYZ_M, t);
      return this.white !== this.base.white && (r = Va(this.white, this.base.white, r)), r;
    }), e.fromBase ?? (e.fromBase = (t) => (t = Va(this.base.white, this.white, t), dt(e.fromXYZ_M, t)))), e.referred ?? (e.referred = "display"), super(e);
  }
}
function bs(n, e) {
  return n = Ne(n), !e || n.space.equals(e) ? n.coords.slice() : (e = ye.get(e), e.from(n));
}
function An(n, e) {
  n = Ne(n);
  let { space: t, index: r } = ye.resolveCoord(e, n.space);
  return bs(n, t)[r];
}
function bh(n, e, t) {
  return n = Ne(n), e = ye.get(e), n.coords = e.to(n.space, t), n;
}
bh.returns = "color";
function Ir(n, e, t) {
  if (n = Ne(n), arguments.length === 2 && Vr(arguments[1]) === "object") {
    let r = arguments[1];
    for (let o in r)
      Ir(n, o, r[o]);
  } else {
    typeof t == "function" && (t = t(An(n, e)));
    let { space: r, index: o } = ye.resolveCoord(e, n.space), a = bs(n, r);
    a[o] = t, bh(n, r, a);
  }
  return n;
}
Ir.returns = "color";
var wh = new ye({
  id: "xyz-d50",
  name: "XYZ D50",
  white: "D50",
  base: qt,
  fromBase: (n) => Va(qt.white, "D50", n),
  toBase: (n) => Va("D50", qt.white, n)
});
const U5 = 216 / 24389, hp = 24 / 116, wa = 24389 / 27;
let ec = rn.D50;
var In = new ye({
  id: "lab",
  name: "Lab",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    a: {
      refRange: [-125, 125]
    },
    b: {
      refRange: [-125, 125]
    }
  },
  // Assuming XYZ is relative to D50, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  white: ec,
  base: wh,
  // Convert D50-adapted XYX to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(n) {
    let t = n.map((r, o) => r / ec[o]).map((r) => r > U5 ? Math.cbrt(r) : (wa * r + 16) / 116);
    return [
      116 * t[1] - 16,
      // L
      500 * (t[0] - t[1]),
      // a
      200 * (t[1] - t[2])
      // b
    ];
  },
  // Convert Lab to D50-adapted XYZ
  // Same result as CIE 15.3:2004 Appendix D although the derivation is different
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  toBase(n) {
    let e = [];
    return e[1] = (n[0] + 16) / 116, e[0] = n[1] / 500 + e[1], e[2] = e[1] - n[2] / 200, [
      e[0] > hp ? Math.pow(e[0], 3) : (116 * e[0] - 16) / wa,
      n[0] > 8 ? Math.pow((n[0] + 16) / 116, 3) : n[0] / wa,
      e[2] > hp ? Math.pow(e[2], 3) : (116 * e[2] - 16) / wa
    ].map((r, o) => r * ec[o]);
  },
  formats: {
    lab: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function lr(n) {
  return (n % 360 + 360) % 360;
}
function Z5(n, e) {
  if (n === "raw")
    return e;
  let [t, r] = e.map(lr), o = r - t;
  return n === "increasing" ? o < 0 && (r += 360) : n === "decreasing" ? o > 0 && (t += 360) : n === "longer" ? -180 < o && o < 180 && (o > 0 ? t += 360 : r += 360) : n === "shorter" && (o > 180 ? t += 360 : o < -180 && (r += 360)), [t, r];
}
var as = new ye({
  id: "lch",
  name: "LCH",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    c: {
      refRange: [0, 150],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: In,
  fromBase(n) {
    let [e, t, r] = n, o;
    const a = 0.02;
    return Math.abs(t) < a && Math.abs(r) < a ? o = NaN : o = Math.atan2(r, t) * 180 / Math.PI, [
      e,
      // L is still L
      Math.sqrt(t ** 2 + r ** 2),
      // Chroma
      lr(o)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(n) {
    let [e, t, r] = n;
    return t < 0 && (t = 0), isNaN(r) && (r = 0), [
      e,
      // L is still L
      t * Math.cos(r * Math.PI / 180),
      // a
      t * Math.sin(r * Math.PI / 180)
      // b
    ];
  },
  formats: {
    lch: {
      coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"]
    }
  }
});
const fp = 25 ** 7, Ka = Math.PI, dp = 180 / Ka, oo = Ka / 180;
function pp(n) {
  const e = n * n;
  return e * e * e * n;
}
function zg(n, e, { kL: t = 1, kC: r = 1, kH: o = 1 } = {}) {
  [n, e] = Ne([n, e]);
  let [a, u, h] = In.from(n), c = as.from(In, [a, u, h])[1], [f, d, g] = In.from(e), v = as.from(In, [f, d, g])[1];
  c < 0 && (c = 0), v < 0 && (v = 0);
  let b = (c + v) / 2, _ = pp(b), O = 0.5 * (1 - Math.sqrt(_ / (_ + fp))), E = (1 + O) * u, S = (1 + O) * d, k = Math.sqrt(E ** 2 + h ** 2), C = Math.sqrt(S ** 2 + g ** 2), A = E === 0 && h === 0 ? 0 : Math.atan2(h, E), N = S === 0 && g === 0 ? 0 : Math.atan2(g, S);
  A < 0 && (A += 2 * Ka), N < 0 && (N += 2 * Ka), A *= dp, N *= dp;
  let L = f - a, F = C - k, H = N - A, se = A + N, be = Math.abs(H), ge;
  k * C === 0 ? ge = 0 : be <= 180 ? ge = H : H > 180 ? ge = H - 360 : H < -180 ? ge = H + 360 : Pn.warn("the unthinkable has happened");
  let pe = 2 * Math.sqrt(C * k) * Math.sin(ge * oo / 2), Je = (a + f) / 2, Le = (k + C) / 2, rt = pp(Le), We;
  k * C === 0 ? We = se : be <= 180 ? We = se / 2 : se < 360 ? We = (se + 360) / 2 : We = (se - 360) / 2;
  let te = (Je - 50) ** 2, oe = 1 + 0.015 * te / Math.sqrt(20 + te), re = 1 + 0.045 * Le, ce = 1;
  ce -= 0.17 * Math.cos((We - 30) * oo), ce += 0.24 * Math.cos(2 * We * oo), ce += 0.32 * Math.cos((3 * We + 6) * oo), ce -= 0.2 * Math.cos((4 * We - 63) * oo);
  let ve = 1 + 0.015 * Le * ce, xe = 30 * Math.exp(-1 * ((We - 275) / 25) ** 2), Re = 2 * Math.sqrt(rt / (rt + fp)), Ve = -1 * Math.sin(2 * xe * oo) * Re, ae = (L / (t * oe)) ** 2;
  return ae += (F / (r * re)) ** 2, ae += (pe / (o * ve)) ** 2, ae += Ve * (F / (r * re)) * (pe / (o * ve)), Math.sqrt(ae);
}
const q5 = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
], H5 = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
], W5 = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.42859224204858, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
], G5 = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092]
];
var fo = new ye({
  id: "oklab",
  name: "Oklab",
  coords: {
    l: {
      refRange: [0, 1],
      name: "Lightness"
    },
    a: {
      refRange: [-0.4, 0.4]
    },
    b: {
      refRange: [-0.4, 0.4]
    }
  },
  // Note that XYZ is relative to D65
  white: "D65",
  base: qt,
  fromBase(n) {
    let t = dt(q5, n).map((r) => Math.cbrt(r));
    return dt(W5, t);
  },
  toBase(n) {
    let t = dt(G5, n).map((r) => r ** 3);
    return dt(H5, t);
  },
  formats: {
    oklab: {
      coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function $c(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = fo.from(n), [a, u, h] = fo.from(e), c = t - a, f = r - u, d = o - h;
  return Math.sqrt(c ** 2 + f ** 2 + d ** 2);
}
const j5 = 75e-6;
function Ii(n, e, { epsilon: t = j5 } = {}) {
  n = Ne(n), e || (e = n.space), e = ye.get(e);
  let r = n.coords;
  return e !== n.space && (r = e.from(n)), e.inGamut(r, { epsilon: t });
}
function po(n) {
  return {
    space: n.space,
    coords: n.coords.slice(),
    alpha: n.alpha
  };
}
function Dg(n, e, t = "lab") {
  t = ye.get(t);
  let r = t.from(n), o = t.from(e);
  return Math.sqrt(r.reduce((a, u, h) => {
    let c = o[h];
    return isNaN(u) || isNaN(c) ? a : a + (c - u) ** 2;
  }, 0));
}
function V5(n, e) {
  return Dg(n, e, "lab");
}
const K5 = Math.PI, gp = K5 / 180;
function J5(n, e, { l: t = 2, c: r = 1 } = {}) {
  [n, e] = Ne([n, e]);
  let [o, a, u] = In.from(n), [, h, c] = as.from(In, [o, a, u]), [f, d, g] = In.from(e), v = as.from(In, [f, d, g])[1];
  h < 0 && (h = 0), v < 0 && (v = 0);
  let b = o - f, _ = h - v, O = a - d, E = u - g, S = O ** 2 + E ** 2 - _ ** 2, k = 0.511;
  o >= 16 && (k = 0.040975 * o / (1 + 0.01765 * o));
  let C = 0.0638 * h / (1 + 0.0131 * h) + 0.638, A;
  Number.isNaN(c) && (c = 0), c >= 164 && c <= 345 ? A = 0.56 + Math.abs(0.2 * Math.cos((c + 168) * gp)) : A = 0.36 + Math.abs(0.4 * Math.cos((c + 35) * gp));
  let N = Math.pow(h, 4), L = Math.sqrt(N / (N + 1900)), F = C * (L * A + 1 - L), H = (b / (t * k)) ** 2;
  return H += (_ / (r * C)) ** 2, H += S / F ** 2, Math.sqrt(H);
}
const mp = 203;
var xh = new ye({
  // Absolute CIE XYZ, with a D65 whitepoint,
  // as used in most HDR colorspaces as a starting point.
  // SDR spaces are converted per BT.2048
  // so that diffuse, media white is 203 cd/m²
  id: "xyz-abs-d65",
  cssId: "--xyz-abs-d65",
  name: "Absolute XYZ D65",
  coords: {
    x: {
      refRange: [0, 9504.7],
      name: "Xa"
    },
    y: {
      refRange: [0, 1e4],
      name: "Ya"
    },
    z: {
      refRange: [0, 10888.3],
      name: "Za"
    }
  },
  base: qt,
  fromBase(n) {
    return n.map((e) => Math.max(e * mp, 0));
  },
  toBase(n) {
    return n.map((e) => Math.max(e / mp, 0));
  }
});
const xa = 1.15, Ta = 0.66, vp = 2610 / 2 ** 14, Y5 = 2 ** 14 / 2610, _p = 3424 / 2 ** 12, yp = 2413 / 2 ** 7, bp = 2392 / 2 ** 7, Q5 = 1.7 * 2523 / 2 ** 5, wp = 2 ** 5 / (1.7 * 2523), Sa = -0.56, tc = 16295499532821565e-27, X5 = [
  [0.41478972, 0.579999, 0.014648],
  [-0.20151, 1.120649, 0.0531008],
  [-0.0166008, 0.2648, 0.6684799]
], ex = [
  [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
  [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
  [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
], tx = [
  [0.5, 0.5, 0],
  [3.524, -4.066708, 0.542708],
  [0.199076, 1.096799, -1.295875]
], nx = [
  [1, 0.1386050432715393, 0.05804731615611886],
  [0.9999999999999999, -0.1386050432715393, -0.05804731615611886],
  [0.9999999999999998, -0.09601924202631895, -0.8118918960560388]
];
var Lg = new ye({
  id: "jzazbz",
  name: "Jzazbz",
  coords: {
    jz: {
      refRange: [0, 1],
      name: "Jz"
    },
    az: {
      refRange: [-0.5, 0.5]
    },
    bz: {
      refRange: [-0.5, 0.5]
    }
  },
  base: xh,
  fromBase(n) {
    let [e, t, r] = n, o = xa * e - (xa - 1) * r, a = Ta * t - (Ta - 1) * e, h = dt(X5, [o, a, r]).map(function(v) {
      let b = _p + yp * (v / 1e4) ** vp, _ = 1 + bp * (v / 1e4) ** vp;
      return (b / _) ** Q5;
    }), [c, f, d] = dt(tx, h);
    return [(1 + Sa) * c / (1 + Sa * c) - tc, f, d];
  },
  toBase(n) {
    let [e, t, r] = n, o = (e + tc) / (1 + Sa - Sa * (e + tc)), u = dt(nx, [o, t, r]).map(function(v) {
      let b = _p - v ** wp, _ = bp * v ** wp - yp;
      return 1e4 * (b / _) ** Y5;
    }), [h, c, f] = dt(ex, u), d = (h + (xa - 1) * f) / xa, g = (c + (Ta - 1) * d) / Ta;
    return [d, g, f];
  },
  formats: {
    // https://drafts.csswg.org/css-color-hdr/#Jzazbz
    color: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
}), Nc = new ye({
  id: "jzczhz",
  name: "JzCzHz",
  coords: {
    jz: {
      refRange: [0, 1],
      name: "Jz"
    },
    cz: {
      refRange: [0, 1],
      name: "Chroma"
    },
    hz: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: Lg,
  fromBase(n) {
    let [e, t, r] = n, o;
    const a = 2e-4;
    return Math.abs(t) < a && Math.abs(r) < a ? o = NaN : o = Math.atan2(r, t) * 180 / Math.PI, [
      e,
      // Jz is still Jz
      Math.sqrt(t ** 2 + r ** 2),
      // Chroma
      lr(o)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(n) {
    return [
      n[0],
      // Jz is still Jz
      n[1] * Math.cos(n[2] * Math.PI / 180),
      // az
      n[1] * Math.sin(n[2] * Math.PI / 180)
      // bz
    ];
  }
});
function rx(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = Nc.from(n), [a, u, h] = Nc.from(e), c = t - a, f = r - u;
  Number.isNaN(o) && Number.isNaN(h) ? (o = 0, h = 0) : Number.isNaN(o) ? o = h : Number.isNaN(h) && (h = o);
  let d = o - h, g = 2 * Math.sqrt(r * u) * Math.sin(d / 2 * (Math.PI / 180));
  return Math.sqrt(c ** 2 + f ** 2 + g ** 2);
}
const Bg = 3424 / 4096, Fg = 2413 / 128, Ug = 2392 / 128, xp = 2610 / 16384, ix = 2523 / 32, ox = 16384 / 2610, Tp = 32 / 2523, sx = [
  [0.3592832590121217, 0.6976051147779502, -0.035891593232029],
  [-0.1920808463704993, 1.100476797037432, 0.0753748658519118],
  [0.0070797844607479, 0.0748396662186362, 0.8433265453898765]
], ax = [
  [2048 / 4096, 2048 / 4096, 0],
  [6610 / 4096, -13613 / 4096, 7003 / 4096],
  [17933 / 4096, -17390 / 4096, -543 / 4096]
], ux = [
  [0.9999999999999998, 0.0086090370379328, 0.111029625003026],
  [0.9999999999999998, -0.0086090370379328, -0.1110296250030259],
  [0.9999999999999998, 0.5600313357106791, -0.3206271749873188]
], lx = [
  [2.0701522183894223, -1.3263473389671563, 0.2066510476294053],
  [0.3647385209748072, 0.6805660249472273, -0.0453045459220347],
  [-0.0497472075358123, -0.0492609666966131, 1.1880659249923042]
];
var Rc = new ye({
  id: "ictcp",
  name: "ICTCP",
  // From BT.2100-2 page 7:
  // During production, signal values are expected to exceed the
  // range E′ = [0.0 : 1.0]. This provides processing headroom and avoids
  // signal degradation during cascaded processing. Such values of E′,
  // below 0.0 or exceeding 1.0, should not be clipped during production
  // and exchange.
  // Values below 0.0 should not be clipped in reference displays (even
  // though they represent “negative” light) to allow the black level of
  // the signal (LB) to be properly set using test signals known as “PLUGE”
  coords: {
    i: {
      refRange: [0, 1],
      // Constant luminance,
      name: "I"
    },
    ct: {
      refRange: [-0.5, 0.5],
      // Full BT.2020 gamut in range [-0.5, 0.5]
      name: "CT"
    },
    cp: {
      refRange: [-0.5, 0.5],
      name: "CP"
    }
  },
  base: xh,
  fromBase(n) {
    let e = dt(sx, n);
    return cx(e);
  },
  toBase(n) {
    let e = hx(n);
    return dt(lx, e);
  }
});
function cx(n) {
  let e = n.map(function(t) {
    let r = Bg + Fg * (t / 1e4) ** xp, o = 1 + Ug * (t / 1e4) ** xp;
    return (r / o) ** ix;
  });
  return dt(ax, e);
}
function hx(n) {
  return dt(ux, n).map(function(r) {
    let o = Math.max(r ** Tp - Bg, 0), a = Fg - Ug * r ** Tp;
    return 1e4 * (o / a) ** ox;
  });
}
function fx(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = Rc.from(n), [a, u, h] = Rc.from(e);
  return 720 * Math.sqrt((t - a) ** 2 + 0.25 * (r - u) ** 2 + (o - h) ** 2);
}
const dx = rn.D65, Zg = 0.42, Sp = 1 / Zg, nc = 2 * Math.PI, qg = [
  [0.401288, 0.650173, -0.051461],
  [-0.250268, 1.204414, 0.045854],
  [-2079e-6, 0.048952, 0.953127]
], px = [
  [1.8620678550872327, -1.0112546305316843, 0.14918677544445175],
  [0.38752654323613717, 0.6214474419314753, -0.008973985167612518],
  [-0.015841498849333856, -0.03412293802851557, 1.0499644368778496]
], gx = [
  [460, 451, 288],
  [460, -891, -261],
  [460, -220, -6300]
], mx = {
  dark: [0.8, 0.525, 0.8],
  dim: [0.9, 0.59, 0.9],
  average: [1, 0.69, 1]
}, Ti = {
  // Red, Yellow, Green, Blue, Red
  h: [20.14, 90, 164.25, 237.53, 380.14],
  e: [0.8, 0.7, 1, 1.2, 0.8],
  H: [0, 100, 200, 300, 400]
}, vx = 180 / Math.PI, Cp = Math.PI / 180;
function Hg(n, e) {
  return n.map((r) => {
    const o = ur(e * Math.abs(r) * 0.01, Zg);
    return 400 * Cu(o, r) / (o + 27.13);
  });
}
function _x(n, e) {
  const t = 100 / e * 27.13 ** Sp;
  return n.map((r) => {
    const o = Math.abs(r);
    return Cu(t * ur(o / (400 - o), Sp), r);
  });
}
function yx(n) {
  let e = lr(n);
  e <= Ti.h[0] && (e += 360);
  const t = Ng(Ti.h, e) - 1, [r, o] = Ti.h.slice(t, t + 2), [a, u] = Ti.e.slice(t, t + 2), h = Ti.H[t], c = (e - r) / a;
  return h + 100 * c / (c + (o - e) / u);
}
function bx(n) {
  let e = (n % 400 + 400) % 400;
  const t = Math.floor(0.01 * e);
  e = e % 100;
  const [r, o] = Ti.h.slice(t, t + 2), [a, u] = Ti.e.slice(t, t + 2);
  return lr(
    (e * (u * r - a * o) - 100 * r * u) / (e * (u - a) - 100 * u)
  );
}
function Wg(n, e, t, r, o) {
  const a = {};
  a.discounting = o, a.refWhite = n, a.surround = r;
  const u = n.map((O) => O * 100);
  a.la = e, a.yb = t;
  const h = u[1], c = dt(qg, u);
  r = mx[a.surround];
  const f = r[0];
  a.c = r[1], a.nc = r[2];
  const g = (1 / (5 * a.la + 1)) ** 4;
  a.fl = g * a.la + 0.1 * (1 - g) * (1 - g) * Math.cbrt(5 * a.la), a.flRoot = a.fl ** 0.25, a.n = a.yb / h, a.z = 1.48 + Math.sqrt(a.n), a.nbb = 0.725 * a.n ** -0.2, a.ncb = a.nbb;
  const v = Math.max(
    Math.min(f * (1 - 1 / 3.6 * Math.exp((-a.la - 42) / 92)), 1),
    0
  );
  a.dRgb = c.map((O) => ss(1, h / O, v)), a.dRgbInv = a.dRgb.map((O) => 1 / O);
  const b = c.map((O, E) => O * a.dRgb[E]), _ = Hg(b, a.fl);
  return a.aW = a.nbb * (2 * _[0] + _[1] + 0.05 * _[2]), a;
}
const Mp = Wg(
  dx,
  64 / Math.PI * 0.2,
  20,
  "average",
  !1
);
function zc(n, e) {
  if (!(n.J !== void 0 ^ n.Q !== void 0))
    throw new Error("Conversion requires one and only one: 'J' or 'Q'");
  if (!(n.C !== void 0 ^ n.M !== void 0 ^ n.s !== void 0))
    throw new Error("Conversion requires one and only one: 'C', 'M' or 's'");
  if (!(n.h !== void 0 ^ n.H !== void 0))
    throw new Error("Conversion requires one and only one: 'h' or 'H'");
  if (n.J === 0 || n.Q === 0)
    return [0, 0, 0];
  let t = 0;
  n.h !== void 0 ? t = lr(n.h) * Cp : t = bx(n.H) * Cp;
  const r = Math.cos(t), o = Math.sin(t);
  let a = 0;
  n.J !== void 0 ? a = ur(n.J, 1 / 2) * 0.1 : n.Q !== void 0 && (a = 0.25 * e.c * n.Q / ((e.aW + 4) * e.flRoot));
  let u = 0;
  n.C !== void 0 ? u = n.C / a : n.M !== void 0 ? u = n.M / e.flRoot / a : n.s !== void 0 && (u = 4e-4 * n.s ** 2 * (e.aW + 4) / e.c);
  const h = ur(
    u * Math.pow(1.64 - Math.pow(0.29, e.n), -0.73),
    10 / 9
  ), c = 0.25 * (Math.cos(t + 2) + 3.8), f = e.aW * ur(a, 2 / e.c / e.z), d = 5e4 / 13 * e.nc * e.ncb * c, g = f / e.nbb, v = 23 * (g + 0.305) * yh(h, 23 * d + h * (11 * r + 108 * o)), b = v * r, _ = v * o, O = _x(
    dt(gx, [g, b, _]).map((E) => E * 1 / 1403),
    e.fl
  );
  return dt(
    px,
    O.map((E, S) => E * e.dRgbInv[S])
  ).map((E) => E / 100);
}
function Gg(n, e) {
  const t = n.map((C) => C * 100), r = Hg(
    dt(qg, t).map((C, A) => C * e.dRgb[A]),
    e.fl
  ), o = r[0] + (-12 * r[1] + r[2]) / 11, a = (r[0] + r[1] - 2 * r[2]) / 9, u = (Math.atan2(a, o) % nc + nc) % nc, h = 0.25 * (Math.cos(u + 2) + 3.8), c = 5e4 / 13 * e.nc * e.ncb * yh(
    h * Math.sqrt(o ** 2 + a ** 2),
    r[0] + r[1] + 1.05 * r[2] + 0.305
  ), f = ur(c, 0.9) * Math.pow(1.64 - Math.pow(0.29, e.n), 0.73), d = e.nbb * (2 * r[0] + r[1] + 0.05 * r[2]), g = ur(d / e.aW, 0.5 * e.c * e.z), v = 100 * ur(g, 2), b = 4 / e.c * g * (e.aW + 4) * e.flRoot, _ = f * g, O = _ * e.flRoot, E = lr(u * vx), S = yx(E), k = 50 * ur(e.c * f / (e.aW + 4), 1 / 2);
  return { J: v, C: _, h: E, s: k, Q: b, M: O, H: S };
}
var wx = new ye({
  id: "cam16-jmh",
  cssId: "--cam16-jmh",
  name: "CAM16-JMh",
  coords: {
    j: {
      refRange: [0, 100],
      name: "J"
    },
    m: {
      refRange: [0, 105],
      name: "Colorfulness"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: qt,
  fromBase(n) {
    const e = Gg(n, Mp);
    return [e.J, e.M, e.h];
  },
  toBase(n) {
    return zc(
      { J: n[0], M: n[1], h: n[2] },
      Mp
    );
  }
});
const xx = rn.D65, Tx = 216 / 24389, jg = 24389 / 27;
function Sx(n) {
  return 116 * (n > Tx ? Math.cbrt(n) : (jg * n + 16) / 116) - 16;
}
function Dc(n) {
  return n > 8 ? Math.pow((n + 16) / 116, 3) : n / jg;
}
function Cx(n, e) {
  let [t, r, o] = n, a = [], u = 0;
  if (o === 0)
    return [0, 0, 0];
  let h = Dc(o);
  o > 0 ? u = 0.00379058511492914 * o ** 2 + 0.608983189401032 * o + 0.9155088574762233 : u = 9514440756550361e-21 * o ** 2 + 0.08693057439788597 * o - 21.928975842194614;
  const c = 2e-12, f = 15;
  let d = 0, g = 1 / 0;
  for (; d <= f; ) {
    a = zc({ J: u, C: r, h: t }, e);
    const v = Math.abs(a[1] - h);
    if (v < g) {
      if (v <= c)
        return a;
      g = v;
    }
    u = u - (a[1] - h) * u / (2 * a[1]), d += 1;
  }
  return zc({ J: u, C: r, h: t }, e);
}
function Mx(n, e) {
  const t = Sx(n[1]);
  if (t === 0)
    return [0, 0, 0];
  const r = Gg(n, Th);
  return [lr(r.h), r.C, t];
}
const Th = Wg(
  xx,
  200 / Math.PI * Dc(50),
  Dc(50) * 100,
  "average",
  !1
);
var us = new ye({
  id: "hct",
  name: "HCT",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    c: {
      refRange: [0, 145],
      name: "Colorfulness"
    },
    t: {
      refRange: [0, 100],
      name: "Tone"
    }
  },
  base: qt,
  fromBase(n) {
    return Mx(n);
  },
  toBase(n) {
    return Cx(n, Th);
  },
  formats: {
    color: {
      id: "--hct",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
const Ex = Math.PI / 180, Ep = [1, 7e-3, 0.0228];
function Ap(n) {
  n[1] < 0 && (n = us.fromBase(us.toBase(n)));
  const e = Math.log(Math.max(1 + Ep[2] * n[1] * Th.flRoot, 1)) / Ep[2], t = n[0] * Ex, r = e * Math.cos(t), o = e * Math.sin(t);
  return [n[2], r, o];
}
function Ax(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = Ap(us.from(n)), [a, u, h] = Ap(us.from(e));
  return Math.sqrt((t - a) ** 2 + (r - u) ** 2 + (o - h) ** 2);
}
var go = {
  deltaE76: V5,
  deltaECMC: J5,
  deltaE2000: zg,
  deltaEJz: rx,
  deltaEITP: fx,
  deltaEOK: $c,
  deltaEHCT: Ax
};
function Ix(n) {
  const e = n ? Math.floor(Math.log10(Math.abs(n))) : 0;
  return Math.max(parseFloat(`1e${e - 2}`), 1e-6);
}
const Ip = {
  hct: {
    method: "hct.c",
    jnd: 2,
    deltaEMethod: "hct",
    blackWhiteClamp: {}
  },
  "hct-tonal": {
    method: "hct.c",
    jnd: 0,
    deltaEMethod: "hct",
    blackWhiteClamp: { channel: "hct.t", min: 0, max: 100 }
  }
};
function Xr(n, {
  method: e = Pn.gamut_mapping,
  space: t = void 0,
  deltaEMethod: r = "",
  jnd: o = 2,
  blackWhiteClamp: a = {}
} = {}) {
  if (n = Ne(n), ys(arguments[1]) ? t = arguments[1] : t || (t = n.space), t = ye.get(t), Ii(n, t, { epsilon: 0 }))
    return n;
  let u;
  if (e === "css")
    u = Px(n, { space: t });
  else {
    if (e !== "clip" && !Ii(n, t)) {
      Object.prototype.hasOwnProperty.call(Ip, e) && ({ method: e, jnd: o, deltaEMethod: r, blackWhiteClamp: a } = Ip[e]);
      let h = zg;
      if (r !== "") {
        for (let f in go)
          if ("deltae" + r.toLowerCase() === f.toLowerCase()) {
            h = go[f];
            break;
          }
      }
      let c = Xr(ft(n, t), { method: "clip", space: t });
      if (h(n, c) > o) {
        if (Object.keys(a).length === 3) {
          let k = ye.resolveCoord(a.channel), C = An(ft(n, k.space), k.id);
          if (Yr(C) && (C = 0), C >= a.max)
            return ft({ space: "xyz-d65", coords: rn.D65 }, n.space);
          if (C <= a.min)
            return ft({ space: "xyz-d65", coords: [0, 0, 0] }, n.space);
        }
        let f = ye.resolveCoord(e), d = f.space, g = f.id, v = ft(n, d);
        v.coords.forEach((k, C) => {
          Yr(k) && (v.coords[C] = 0);
        });
        let _ = (f.range || f.refRange)[0], O = Ix(o), E = _, S = An(v, g);
        for (; S - E > O; ) {
          let k = po(v);
          k = Xr(k, { space: t, method: "clip" }), h(v, k) - o < O ? E = An(v, g) : S = An(v, g), Ir(v, g, (E + S) / 2);
        }
        u = ft(v, t);
      } else
        u = c;
    } else
      u = ft(n, t);
    if (e === "clip" || !Ii(u, t, { epsilon: 0 })) {
      let h = Object.values(t.coords).map((c) => c.range || []);
      u.coords = u.coords.map((c, f) => {
        let [d, g] = h[f];
        return d !== void 0 && (c = Math.max(d, c)), g !== void 0 && (c = Math.min(c, g)), c;
      });
    }
  }
  return t !== n.space && (u = ft(u, n.space)), n.coords = u.coords, n;
}
Xr.returns = "color";
const Pp = {
  WHITE: { space: fo, coords: [1, 0, 0] },
  BLACK: { space: fo, coords: [0, 0, 0] }
};
function Px(n, { space: e } = {}) {
  n = Ne(n), e || (e = n.space), e = ye.get(e);
  const o = ye.get("oklch");
  if (e.isUnbounded)
    return ft(n, e);
  const a = ft(n, o);
  let u = a.coords[0];
  if (u >= 1) {
    const _ = ft(Pp.WHITE, e);
    return _.alpha = n.alpha, ft(_, e);
  }
  if (u <= 0) {
    const _ = ft(Pp.BLACK, e);
    return _.alpha = n.alpha, ft(_, e);
  }
  if (Ii(a, e, { epsilon: 0 }))
    return ft(a, e);
  function h(_) {
    const O = ft(_, e), E = Object.values(e.coords);
    return O.coords = O.coords.map((S, k) => {
      if ("range" in E[k]) {
        const [C, A] = E[k].range;
        return $g(C, S, A);
      }
      return S;
    }), O;
  }
  let c = 0, f = a.coords[1], d = !0, g = po(a), v = h(g), b = $c(v, g);
  if (b < 0.02)
    return v;
  for (; f - c > 1e-4; ) {
    const _ = (c + f) / 2;
    if (g.coords[1] = _, d && Ii(g, e, { epsilon: 0 }))
      c = _;
    else if (v = h(g), b = $c(v, g), b < 0.02) {
      if (0.02 - b < 1e-4)
        break;
      d = !1, c = _;
    } else
      f = _;
  }
  return v;
}
function ft(n, e, { inGamut: t } = {}) {
  n = Ne(n), e = ye.get(e);
  let r = e.from(n), o = { space: e, coords: r, alpha: n.alpha };
  return t && (o = Xr(o, t === !0 ? void 0 : t)), o;
}
ft.returns = "color";
function es(n, {
  precision: e = Pn.precision,
  format: t = "default",
  inGamut: r = !0,
  ...o
} = {}) {
  var c;
  let a;
  n = Ne(n);
  let u = t;
  t = n.space.getFormat(t) ?? n.space.getFormat("default") ?? ye.DEFAULT_FORMAT;
  let h = n.coords.slice();
  if (r || (r = t.toGamut), r && !Ii(n) && (h = Xr(po(n), r === !0 ? void 0 : r).coords), t.type === "custom")
    if (o.precision = e, t.serialize)
      a = t.serialize(h, n.alpha, o);
    else
      throw new TypeError(`format ${u} can only be used to parse colors, not for serialization`);
  else {
    let f = t.name || "color";
    t.serializeCoords ? h = t.serializeCoords(h, e) : e !== null && (h = h.map((b) => ja(b, { precision: e })));
    let d = [...h];
    if (f === "color") {
      let b = t.id || ((c = t.ids) == null ? void 0 : c[0]) || n.space.id;
      d.unshift(b);
    }
    let g = n.alpha;
    e !== null && (g = ja(g, { precision: e }));
    let v = n.alpha >= 1 || t.noAlpha ? "" : `${t.commas ? "," : " /"} ${g}`;
    a = `${f}(${d.join(t.commas ? ", " : " ")}${v})`;
  }
  return a;
}
const Ox = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791]
], kx = [
  [1.716651187971268, -0.355670783776392, -0.25336628137366],
  [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
  [0.017639857445311, -0.042770613257809, 0.942103121235474]
];
var Mu = new gn({
  id: "rec2020-linear",
  cssId: "--rec2020-linear",
  name: "Linear REC.2020",
  white: "D65",
  toXYZ_M: Ox,
  fromXYZ_M: kx
});
const Ca = 1.09929682680944, Op = 0.018053968510807;
var Vg = new gn({
  id: "rec2020",
  name: "REC.2020",
  base: Mu,
  // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
  toBase(n) {
    return n.map(function(e) {
      return e < Op * 4.5 ? e / 4.5 : Math.pow((e + Ca - 1) / Ca, 1 / 0.45);
    });
  },
  fromBase(n) {
    return n.map(function(e) {
      return e >= Op ? Ca * Math.pow(e, 0.45) - (Ca - 1) : 4.5 * e;
    });
  }
});
const $x = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976]
], Nx = [
  [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
  [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
  [0.03584583024378447, -0.07617238926804182, 0.9568845240076872]
];
var Kg = new gn({
  id: "p3-linear",
  cssId: "--display-p3-linear",
  name: "Linear P3",
  white: "D65",
  toXYZ_M: $x,
  fromXYZ_M: Nx
});
const Rx = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
], $t = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
var Jg = new gn({
  id: "srgb-linear",
  name: "Linear sRGB",
  white: "D65",
  toXYZ_M: Rx,
  fromXYZ_M: $t
}), kp = {
  aliceblue: [240 / 255, 248 / 255, 1],
  antiquewhite: [250 / 255, 235 / 255, 215 / 255],
  aqua: [0, 1, 1],
  aquamarine: [127 / 255, 1, 212 / 255],
  azure: [240 / 255, 1, 1],
  beige: [245 / 255, 245 / 255, 220 / 255],
  bisque: [1, 228 / 255, 196 / 255],
  black: [0, 0, 0],
  blanchedalmond: [1, 235 / 255, 205 / 255],
  blue: [0, 0, 1],
  blueviolet: [138 / 255, 43 / 255, 226 / 255],
  brown: [165 / 255, 42 / 255, 42 / 255],
  burlywood: [222 / 255, 184 / 255, 135 / 255],
  cadetblue: [95 / 255, 158 / 255, 160 / 255],
  chartreuse: [127 / 255, 1, 0],
  chocolate: [210 / 255, 105 / 255, 30 / 255],
  coral: [1, 127 / 255, 80 / 255],
  cornflowerblue: [100 / 255, 149 / 255, 237 / 255],
  cornsilk: [1, 248 / 255, 220 / 255],
  crimson: [220 / 255, 20 / 255, 60 / 255],
  cyan: [0, 1, 1],
  darkblue: [0, 0, 139 / 255],
  darkcyan: [0, 139 / 255, 139 / 255],
  darkgoldenrod: [184 / 255, 134 / 255, 11 / 255],
  darkgray: [169 / 255, 169 / 255, 169 / 255],
  darkgreen: [0, 100 / 255, 0],
  darkgrey: [169 / 255, 169 / 255, 169 / 255],
  darkkhaki: [189 / 255, 183 / 255, 107 / 255],
  darkmagenta: [139 / 255, 0, 139 / 255],
  darkolivegreen: [85 / 255, 107 / 255, 47 / 255],
  darkorange: [1, 140 / 255, 0],
  darkorchid: [153 / 255, 50 / 255, 204 / 255],
  darkred: [139 / 255, 0, 0],
  darksalmon: [233 / 255, 150 / 255, 122 / 255],
  darkseagreen: [143 / 255, 188 / 255, 143 / 255],
  darkslateblue: [72 / 255, 61 / 255, 139 / 255],
  darkslategray: [47 / 255, 79 / 255, 79 / 255],
  darkslategrey: [47 / 255, 79 / 255, 79 / 255],
  darkturquoise: [0, 206 / 255, 209 / 255],
  darkviolet: [148 / 255, 0, 211 / 255],
  deeppink: [1, 20 / 255, 147 / 255],
  deepskyblue: [0, 191 / 255, 1],
  dimgray: [105 / 255, 105 / 255, 105 / 255],
  dimgrey: [105 / 255, 105 / 255, 105 / 255],
  dodgerblue: [30 / 255, 144 / 255, 1],
  firebrick: [178 / 255, 34 / 255, 34 / 255],
  floralwhite: [1, 250 / 255, 240 / 255],
  forestgreen: [34 / 255, 139 / 255, 34 / 255],
  fuchsia: [1, 0, 1],
  gainsboro: [220 / 255, 220 / 255, 220 / 255],
  ghostwhite: [248 / 255, 248 / 255, 1],
  gold: [1, 215 / 255, 0],
  goldenrod: [218 / 255, 165 / 255, 32 / 255],
  gray: [128 / 255, 128 / 255, 128 / 255],
  green: [0, 128 / 255, 0],
  greenyellow: [173 / 255, 1, 47 / 255],
  grey: [128 / 255, 128 / 255, 128 / 255],
  honeydew: [240 / 255, 1, 240 / 255],
  hotpink: [1, 105 / 255, 180 / 255],
  indianred: [205 / 255, 92 / 255, 92 / 255],
  indigo: [75 / 255, 0, 130 / 255],
  ivory: [1, 1, 240 / 255],
  khaki: [240 / 255, 230 / 255, 140 / 255],
  lavender: [230 / 255, 230 / 255, 250 / 255],
  lavenderblush: [1, 240 / 255, 245 / 255],
  lawngreen: [124 / 255, 252 / 255, 0],
  lemonchiffon: [1, 250 / 255, 205 / 255],
  lightblue: [173 / 255, 216 / 255, 230 / 255],
  lightcoral: [240 / 255, 128 / 255, 128 / 255],
  lightcyan: [224 / 255, 1, 1],
  lightgoldenrodyellow: [250 / 255, 250 / 255, 210 / 255],
  lightgray: [211 / 255, 211 / 255, 211 / 255],
  lightgreen: [144 / 255, 238 / 255, 144 / 255],
  lightgrey: [211 / 255, 211 / 255, 211 / 255],
  lightpink: [1, 182 / 255, 193 / 255],
  lightsalmon: [1, 160 / 255, 122 / 255],
  lightseagreen: [32 / 255, 178 / 255, 170 / 255],
  lightskyblue: [135 / 255, 206 / 255, 250 / 255],
  lightslategray: [119 / 255, 136 / 255, 153 / 255],
  lightslategrey: [119 / 255, 136 / 255, 153 / 255],
  lightsteelblue: [176 / 255, 196 / 255, 222 / 255],
  lightyellow: [1, 1, 224 / 255],
  lime: [0, 1, 0],
  limegreen: [50 / 255, 205 / 255, 50 / 255],
  linen: [250 / 255, 240 / 255, 230 / 255],
  magenta: [1, 0, 1],
  maroon: [128 / 255, 0, 0],
  mediumaquamarine: [102 / 255, 205 / 255, 170 / 255],
  mediumblue: [0, 0, 205 / 255],
  mediumorchid: [186 / 255, 85 / 255, 211 / 255],
  mediumpurple: [147 / 255, 112 / 255, 219 / 255],
  mediumseagreen: [60 / 255, 179 / 255, 113 / 255],
  mediumslateblue: [123 / 255, 104 / 255, 238 / 255],
  mediumspringgreen: [0, 250 / 255, 154 / 255],
  mediumturquoise: [72 / 255, 209 / 255, 204 / 255],
  mediumvioletred: [199 / 255, 21 / 255, 133 / 255],
  midnightblue: [25 / 255, 25 / 255, 112 / 255],
  mintcream: [245 / 255, 1, 250 / 255],
  mistyrose: [1, 228 / 255, 225 / 255],
  moccasin: [1, 228 / 255, 181 / 255],
  navajowhite: [1, 222 / 255, 173 / 255],
  navy: [0, 0, 128 / 255],
  oldlace: [253 / 255, 245 / 255, 230 / 255],
  olive: [128 / 255, 128 / 255, 0],
  olivedrab: [107 / 255, 142 / 255, 35 / 255],
  orange: [1, 165 / 255, 0],
  orangered: [1, 69 / 255, 0],
  orchid: [218 / 255, 112 / 255, 214 / 255],
  palegoldenrod: [238 / 255, 232 / 255, 170 / 255],
  palegreen: [152 / 255, 251 / 255, 152 / 255],
  paleturquoise: [175 / 255, 238 / 255, 238 / 255],
  palevioletred: [219 / 255, 112 / 255, 147 / 255],
  papayawhip: [1, 239 / 255, 213 / 255],
  peachpuff: [1, 218 / 255, 185 / 255],
  peru: [205 / 255, 133 / 255, 63 / 255],
  pink: [1, 192 / 255, 203 / 255],
  plum: [221 / 255, 160 / 255, 221 / 255],
  powderblue: [176 / 255, 224 / 255, 230 / 255],
  purple: [128 / 255, 0, 128 / 255],
  rebeccapurple: [102 / 255, 51 / 255, 153 / 255],
  red: [1, 0, 0],
  rosybrown: [188 / 255, 143 / 255, 143 / 255],
  royalblue: [65 / 255, 105 / 255, 225 / 255],
  saddlebrown: [139 / 255, 69 / 255, 19 / 255],
  salmon: [250 / 255, 128 / 255, 114 / 255],
  sandybrown: [244 / 255, 164 / 255, 96 / 255],
  seagreen: [46 / 255, 139 / 255, 87 / 255],
  seashell: [1, 245 / 255, 238 / 255],
  sienna: [160 / 255, 82 / 255, 45 / 255],
  silver: [192 / 255, 192 / 255, 192 / 255],
  skyblue: [135 / 255, 206 / 255, 235 / 255],
  slateblue: [106 / 255, 90 / 255, 205 / 255],
  slategray: [112 / 255, 128 / 255, 144 / 255],
  slategrey: [112 / 255, 128 / 255, 144 / 255],
  snow: [1, 250 / 255, 250 / 255],
  springgreen: [0, 1, 127 / 255],
  steelblue: [70 / 255, 130 / 255, 180 / 255],
  tan: [210 / 255, 180 / 255, 140 / 255],
  teal: [0, 128 / 255, 128 / 255],
  thistle: [216 / 255, 191 / 255, 216 / 255],
  tomato: [1, 99 / 255, 71 / 255],
  turquoise: [64 / 255, 224 / 255, 208 / 255],
  violet: [238 / 255, 130 / 255, 238 / 255],
  wheat: [245 / 255, 222 / 255, 179 / 255],
  white: [1, 1, 1],
  whitesmoke: [245 / 255, 245 / 255, 245 / 255],
  yellow: [1, 1, 0],
  yellowgreen: [154 / 255, 205 / 255, 50 / 255]
};
let $p = Array(3).fill("<percentage> | <number>[0, 255]"), Np = Array(3).fill("<number>[0, 255]");
var mo = new gn({
  id: "srgb",
  name: "sRGB",
  base: Jg,
  fromBase: (n) => n.map((e) => {
    let t = e < 0 ? -1 : 1, r = e * t;
    return r > 31308e-7 ? t * (1.055 * r ** (1 / 2.4) - 0.055) : 12.92 * e;
  }),
  toBase: (n) => n.map((e) => {
    let t = e < 0 ? -1 : 1, r = e * t;
    return r <= 0.04045 ? e / 12.92 : t * ((r + 0.055) / 1.055) ** 2.4;
  }),
  formats: {
    rgb: {
      coords: $p
    },
    rgb_number: {
      name: "rgb",
      commas: !0,
      coords: Np,
      noAlpha: !0
    },
    color: {
      /* use defaults */
    },
    rgba: {
      coords: $p,
      commas: !0,
      lastAlpha: !0
    },
    rgba_number: {
      name: "rgba",
      commas: !0,
      coords: Np
    },
    hex: {
      type: "custom",
      toGamut: !0,
      test: (n) => /^#([a-f0-9]{3,4}){1,2}$/i.test(n),
      parse(n) {
        n.length <= 5 && (n = n.replace(/[a-f0-9]/gi, "$&$&"));
        let e = [];
        return n.replace(/[a-f0-9]{2}/gi, (t) => {
          e.push(parseInt(t, 16) / 255);
        }), {
          spaceId: "srgb",
          coords: e.slice(0, 3),
          alpha: e.slice(3)[0]
        };
      },
      serialize: (n, e, {
        collapse: t = !0
        // collapse to 3-4 digit hex when possible?
      } = {}) => {
        e < 1 && n.push(e), n = n.map((a) => Math.round(a * 255));
        let r = t && n.every((a) => a % 17 === 0);
        return "#" + n.map((a) => r ? (a / 17).toString(16) : a.toString(16).padStart(2, "0")).join("");
      }
    },
    keyword: {
      type: "custom",
      test: (n) => /^[a-z]+$/i.test(n),
      parse(n) {
        n = n.toLowerCase();
        let e = { spaceId: "srgb", coords: null, alpha: 1 };
        if (n === "transparent" ? (e.coords = kp.black, e.alpha = 0) : e.coords = kp[n], e.coords)
          return e;
      }
    }
  }
}), Yg = new gn({
  id: "p3",
  cssId: "display-p3",
  name: "P3",
  base: Kg,
  // Gamma encoding/decoding is the same as sRGB
  fromBase: mo.fromBase,
  toBase: mo.toBase
});
Pn.display_space = mo;
let zx;
if (typeof CSS < "u" && CSS.supports)
  for (let n of [In, Vg, Yg]) {
    let e = n.getMinCoords(), r = es({ space: n, coords: e, alpha: 1 });
    if (CSS.supports("color", r)) {
      Pn.display_space = n;
      break;
    }
  }
function Dx(n, { space: e = Pn.display_space, ...t } = {}) {
  let r = es(n, t);
  if (typeof CSS > "u" || CSS.supports("color", r) || !Pn.display_space)
    r = new String(r), r.color = n;
  else {
    let o = n;
    if ((n.coords.some(Yr) || Yr(n.alpha)) && !(zx ?? (zx = CSS.supports("color", "hsl(none 50% 50%)"))) && (o = po(n), o.coords = o.coords.map(It), o.alpha = It(o.alpha), r = es(o, t), CSS.supports("color", r)))
      return r = new String(r), r.color = o, r;
    o = ft(o, e), r = new String(es(o, t)), r.color = o;
  }
  return r;
}
function Lx(n, e) {
  return n = Ne(n), e = Ne(e), n.space === e.space && n.alpha === e.alpha && n.coords.every((t, r) => t === e.coords[r]);
}
function ei(n) {
  return An(n, [qt, "y"]);
}
function Qg(n, e) {
  Ir(n, [qt, "y"], e);
}
function Bx(n) {
  Object.defineProperty(n.prototype, "luminance", {
    get() {
      return ei(this);
    },
    set(e) {
      Qg(this, e);
    }
  });
}
var Fx = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getLuminance: ei,
  register: Bx,
  setLuminance: Qg
});
function Ux(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Math.max(ei(n), 0), r = Math.max(ei(e), 0);
  return r > t && ([t, r] = [r, t]), (t + 0.05) / (r + 0.05);
}
const Zx = 0.56, qx = 0.57, Hx = 0.62, Wx = 0.65, Rp = 0.022, Gx = 1.414, jx = 0.1, Vx = 5e-4, Kx = 1.14, zp = 0.027, Jx = 1.14;
function Dp(n) {
  return n >= Rp ? n : n + (Rp - n) ** Gx;
}
function so(n) {
  let e = n < 0 ? -1 : 1, t = Math.abs(n);
  return e * Math.pow(t, 2.4);
}
function Yx(n, e) {
  e = Ne(e), n = Ne(n);
  let t, r, o, a, u, h;
  e = ft(e, "srgb"), [a, u, h] = e.coords;
  let c = so(a) * 0.2126729 + so(u) * 0.7151522 + so(h) * 0.072175;
  n = ft(n, "srgb"), [a, u, h] = n.coords;
  let f = so(a) * 0.2126729 + so(u) * 0.7151522 + so(h) * 0.072175, d = Dp(c), g = Dp(f), v = g > d;
  return Math.abs(g - d) < Vx ? r = 0 : v ? (t = g ** Zx - d ** qx, r = t * Kx) : (t = g ** Wx - d ** Hx, r = t * Jx), Math.abs(r) < jx ? o = 0 : r > 0 ? o = r - zp : o = r + zp, o * 100;
}
function Qx(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Math.max(ei(n), 0), r = Math.max(ei(e), 0);
  r > t && ([t, r] = [r, t]);
  let o = t + r;
  return o === 0 ? 0 : (t - r) / o;
}
const Xx = 5e4;
function eT(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Math.max(ei(n), 0), r = Math.max(ei(e), 0);
  return r > t && ([t, r] = [r, t]), r === 0 ? Xx : (t - r) / r;
}
function tT(n, e) {
  n = Ne(n), e = Ne(e);
  let t = An(n, [In, "l"]), r = An(e, [In, "l"]);
  return Math.abs(t - r);
}
const nT = 216 / 24389, Lp = 24 / 116, Ma = 24389 / 27;
let rc = rn.D65;
var Lc = new ye({
  id: "lab-d65",
  name: "Lab D65",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    a: {
      refRange: [-125, 125]
    },
    b: {
      refRange: [-125, 125]
    }
  },
  // Assuming XYZ is relative to D65, convert to CIE Lab
  // from CIE standard, which now defines these as a rational fraction
  white: rc,
  base: qt,
  // Convert D65-adapted XYZ to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(n) {
    let t = n.map((r, o) => r / rc[o]).map((r) => r > nT ? Math.cbrt(r) : (Ma * r + 16) / 116);
    return [
      116 * t[1] - 16,
      // L
      500 * (t[0] - t[1]),
      // a
      200 * (t[1] - t[2])
      // b
    ];
  },
  // Convert Lab to D65-adapted XYZ
  // Same result as CIE 15.3:2004 Appendix D although the derivation is different
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  toBase(n) {
    let e = [];
    return e[1] = (n[0] + 16) / 116, e[0] = n[1] / 500 + e[1], e[2] = e[1] - n[2] / 200, [
      e[0] > Lp ? Math.pow(e[0], 3) : (116 * e[0] - 16) / Ma,
      n[0] > 8 ? Math.pow((n[0] + 16) / 116, 3) : n[0] / Ma,
      e[2] > Lp ? Math.pow(e[2], 3) : (116 * e[2] - 16) / Ma
    ].map((r, o) => r * rc[o]);
  },
  formats: {
    "lab-d65": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
const ic = Math.pow(5, 0.5) * 0.5 + 0.5;
function rT(n, e) {
  n = Ne(n), e = Ne(e);
  let t = An(n, [Lc, "l"]), r = An(e, [Lc, "l"]), o = Math.abs(Math.pow(t, ic) - Math.pow(r, ic)), a = Math.pow(o, 1 / ic) * Math.SQRT2 - 40;
  return a < 7.5 ? 0 : a;
}
var qa = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  contrastAPCA: Yx,
  contrastDeltaPhi: rT,
  contrastLstar: tT,
  contrastMichelson: Qx,
  contrastWCAG21: Ux,
  contrastWeber: eT
});
function iT(n, e, t = {}) {
  ys(t) && (t = { algorithm: t });
  let { algorithm: r, ...o } = t;
  if (!r) {
    let a = Object.keys(qa).map((u) => u.replace(/^contrast/, "")).join(", ");
    throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${a}`);
  }
  n = Ne(n), e = Ne(e);
  for (let a in qa)
    if ("contrast" + r.toLowerCase() === a.toLowerCase())
      return qa[a](n, e, o);
  throw new TypeError(`Unknown contrast algorithm: ${r}`);
}
function Eu(n) {
  let [e, t, r] = bs(n, qt), o = e + 15 * t + 3 * r;
  return [4 * e / o, 9 * t / o];
}
function Xg(n) {
  let [e, t, r] = bs(n, qt), o = e + t + r;
  return [e / o, t / o];
}
function oT(n) {
  Object.defineProperty(n.prototype, "uv", {
    get() {
      return Eu(this);
    }
  }), Object.defineProperty(n.prototype, "xy", {
    get() {
      return Xg(this);
    }
  });
}
var sT = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  register: oT,
  uv: Eu,
  xy: Xg
});
function Ko(n, e, t = {}) {
  ys(t) && (t = { method: t });
  let { method: r = Pn.deltaE, ...o } = t;
  for (let a in go)
    if ("deltae" + r.toLowerCase() === a.toLowerCase())
      return go[a](n, e, o);
  throw new TypeError(`Unknown deltaE method: ${r}`);
}
function aT(n, e = 0.25) {
  let r = [ye.get("oklch", "lch"), "l"];
  return Ir(n, r, (o) => o * (1 + e));
}
function uT(n, e = 0.25) {
  let r = [ye.get("oklch", "lch"), "l"];
  return Ir(n, r, (o) => o * (1 - e));
}
var lT = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  darken: uT,
  lighten: aT
});
function em(n, e, t = 0.5, r = {}) {
  return [n, e] = [Ne(n), Ne(e)], Vr(t) === "object" && ([t, r] = [0.5, t]), ws(n, e, r)(t);
}
function tm(n, e, t = {}) {
  let r;
  Sh(n) && ([r, t] = [n, e], [n, e] = r.rangeArgs.colors);
  let {
    maxDeltaE: o,
    deltaEMethod: a,
    steps: u = 2,
    maxSteps: h = 1e3,
    ...c
  } = t;
  r || ([n, e] = [Ne(n), Ne(e)], r = ws(n, e, c));
  let f = Ko(n, e), d = o > 0 ? Math.max(u, Math.ceil(f / o) + 1) : u, g = [];
  if (h !== void 0 && (d = Math.min(d, h)), d === 1)
    g = [{ p: 0.5, color: r(0.5) }];
  else {
    let v = 1 / (d - 1);
    g = Array.from({ length: d }, (b, _) => {
      let O = _ * v;
      return { p: O, color: r(O) };
    });
  }
  if (o > 0) {
    let v = g.reduce((b, _, O) => {
      if (O === 0)
        return 0;
      let E = Ko(_.color, g[O - 1].color, a);
      return Math.max(b, E);
    }, 0);
    for (; v > o; ) {
      v = 0;
      for (let b = 1; b < g.length && g.length < h; b++) {
        let _ = g[b - 1], O = g[b], E = (O.p + _.p) / 2, S = r(E);
        v = Math.max(v, Ko(S, _.color), Ko(S, O.color)), g.splice(b, 0, { p: E, color: r(E) }), b++;
      }
    }
  }
  return g = g.map((v) => v.color), g;
}
function ws(n, e, t = {}) {
  if (Sh(n)) {
    let [c, f] = [n, e];
    return ws(...c.rangeArgs.colors, { ...c.rangeArgs.options, ...f });
  }
  let { space: r, outputSpace: o, progression: a, premultiplied: u } = t;
  n = Ne(n), e = Ne(e), n = po(n), e = po(e);
  let h = { colors: [n, e], options: t };
  if (r ? r = ye.get(r) : r = ye.registry[Pn.interpolationSpace] || n.space, o = o ? ye.get(o) : r, n = ft(n, r), e = ft(e, r), n = Xr(n), e = Xr(e), r.coords.h && r.coords.h.type === "angle") {
    let c = t.hue = t.hue || "shorter", f = [r, "h"], [d, g] = [An(n, f), An(e, f)];
    isNaN(d) && !isNaN(g) ? d = g : isNaN(g) && !isNaN(d) && (g = d), [d, g] = Z5(c, [d, g]), Ir(n, f, d), Ir(e, f, g);
  }
  return u && (n.coords = n.coords.map((c) => c * n.alpha), e.coords = e.coords.map((c) => c * e.alpha)), Object.assign((c) => {
    c = a ? a(c) : c;
    let f = n.coords.map((v, b) => {
      let _ = e.coords[b];
      return ss(v, _, c);
    }), d = ss(n.alpha, e.alpha, c), g = { space: r, coords: f, alpha: d };
    return u && (g.coords = g.coords.map((v) => v / d)), o !== r && (g = ft(g, o)), g;
  }, {
    rangeArgs: h
  });
}
function Sh(n) {
  return Vr(n) === "function" && !!n.rangeArgs;
}
Pn.interpolationSpace = "lab";
function cT(n) {
  n.defineFunction("mix", em, { returns: "color" }), n.defineFunction("range", ws, { returns: "function<color>" }), n.defineFunction("steps", tm, { returns: "array<color>" });
}
var hT = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  isRange: Sh,
  mix: em,
  range: ws,
  register: cT,
  steps: tm
}), nm = new ye({
  id: "hsl",
  name: "HSL",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: mo,
  // Adapted from https://drafts.csswg.org/css-color-4/better-rgbToHsl.js
  fromBase: (n) => {
    let e = Math.max(...n), t = Math.min(...n), [r, o, a] = n, [u, h, c] = [NaN, 0, (t + e) / 2], f = e - t;
    if (f !== 0) {
      switch (h = c === 0 || c === 1 ? 0 : (e - c) / Math.min(c, 1 - c), e) {
        case r:
          u = (o - a) / f + (o < a ? 6 : 0);
          break;
        case o:
          u = (a - r) / f + 2;
          break;
        case a:
          u = (r - o) / f + 4;
      }
      u = u * 60;
    }
    return h < 0 && (u += 180, h = Math.abs(h)), u >= 360 && (u -= 360), [u, h * 100, c * 100];
  },
  // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
  toBase: (n) => {
    let [e, t, r] = n;
    e = e % 360, e < 0 && (e += 360), t /= 100, r /= 100;
    function o(a) {
      let u = (a + e / 30) % 12, h = t * Math.min(r, 1 - r);
      return r - h * Math.max(-1, Math.min(u - 3, 9 - u, 1));
    }
    return [o(0), o(8), o(4)];
  },
  formats: {
    hsl: {
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"]
    },
    hsla: {
      coords: ["<number> | <angle>", "<percentage>", "<percentage>"],
      commas: !0,
      lastAlpha: !0
    }
  }
}), rm = new ye({
  id: "hsv",
  name: "HSV",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    v: {
      range: [0, 100],
      name: "Value"
    }
  },
  base: nm,
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  fromBase(n) {
    let [e, t, r] = n;
    t /= 100, r /= 100;
    let o = r + t * Math.min(r, 1 - r);
    return [
      e,
      // h is the same
      o === 0 ? 0 : 200 * (1 - r / o),
      // s
      100 * o
    ];
  },
  // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
  toBase(n) {
    let [e, t, r] = n;
    t /= 100, r /= 100;
    let o = r * (1 - t / 2);
    return [
      e,
      // h is the same
      o === 0 || o === 1 ? 0 : (r - o) / Math.min(o, 1 - o) * 100,
      o * 100
    ];
  },
  formats: {
    color: {
      id: "--hsv",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
}), fT = new ye({
  id: "hwb",
  name: "HWB",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    w: {
      range: [0, 100],
      name: "Whiteness"
    },
    b: {
      range: [0, 100],
      name: "Blackness"
    }
  },
  base: rm,
  fromBase(n) {
    let [e, t, r] = n;
    return [e, r * (100 - t) / 100, 100 - r];
  },
  toBase(n) {
    let [e, t, r] = n;
    t /= 100, r /= 100;
    let o = t + r;
    if (o >= 1) {
      let h = t / o;
      return [e, 0, h * 100];
    }
    let a = 1 - r, u = a === 0 ? 0 : 1 - t / a;
    return [e, u * 100, a * 100];
  },
  formats: {
    hwb: {
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
const dT = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
], pT = [
  [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
  [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
  [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
];
var im = new gn({
  id: "a98rgb-linear",
  cssId: "--a98-rgb-linear",
  name: "Linear Adobe® 98 RGB compatible",
  white: "D65",
  toXYZ_M: dT,
  fromXYZ_M: pT
}), gT = new gn({
  id: "a98rgb",
  cssId: "a98-rgb",
  name: "Adobe® 98 RGB compatible",
  base: im,
  toBase: (n) => n.map((e) => Math.pow(Math.abs(e), 563 / 256) * Math.sign(e)),
  fromBase: (n) => n.map((e) => Math.pow(Math.abs(e), 256 / 563) * Math.sign(e))
});
const mT = [
  [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
  [0.2880748288194013, 0.711835234241873, 8993693872564e-17],
  [0, 0, 0.8251046025104602]
], vT = [
  [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
  [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
  [0, 0, 1.2119675456389452]
];
var om = new gn({
  id: "prophoto-linear",
  cssId: "--prophoto-rgb-linear",
  name: "Linear ProPhoto",
  white: "D50",
  base: wh,
  toXYZ_M: mT,
  fromXYZ_M: vT
});
const _T = 1 / 512, yT = 16 / 512;
var bT = new gn({
  id: "prophoto",
  cssId: "prophoto-rgb",
  name: "ProPhoto",
  base: om,
  toBase(n) {
    return n.map((e) => e < yT ? e / 16 : e ** 1.8);
  },
  fromBase(n) {
    return n.map((e) => e >= _T ? e ** (1 / 1.8) : 16 * e);
  }
}), wT = new ye({
  id: "oklch",
  name: "Oklch",
  coords: {
    l: {
      refRange: [0, 1],
      name: "Lightness"
    },
    c: {
      refRange: [0, 0.4],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  white: "D65",
  base: fo,
  fromBase(n) {
    let [e, t, r] = n, o;
    const a = 2e-4;
    return Math.abs(t) < a && Math.abs(r) < a ? o = NaN : o = Math.atan2(r, t) * 180 / Math.PI, [
      e,
      // OKLab L is still L
      Math.sqrt(t ** 2 + r ** 2),
      // Chroma
      lr(o)
      // Hue, in degrees [0 to 360)
    ];
  },
  // Convert from polar form
  toBase(n) {
    let [e, t, r] = n, o, a;
    return isNaN(r) ? (o = 0, a = 0) : (o = t * Math.cos(r * Math.PI / 180), a = t * Math.sin(r * Math.PI / 180)), [e, o, a];
  },
  formats: {
    oklch: {
      coords: ["<percentage> | <number>", "<number> | <percentage>[0,1]", "<number> | <angle>"]
    }
  }
});
let sm = rn.D65;
const xT = 216 / 24389, Bp = 24389 / 27, [Fp, Up] = Eu({ space: qt, coords: sm });
var am = new ye({
  id: "luv",
  name: "Luv",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    // Reference ranges from https://facelessuser.github.io/coloraide/colors/luv/
    u: {
      refRange: [-215, 215]
    },
    v: {
      refRange: [-215, 215]
    }
  },
  white: sm,
  base: qt,
  // Convert D65-adapted XYZ to Luv
  // https://en.wikipedia.org/wiki/CIELUV#The_forward_transformation
  fromBase(n) {
    let e = [It(n[0]), It(n[1]), It(n[2])], t = e[1], [r, o] = Eu({ space: qt, coords: e });
    if (!Number.isFinite(r) || !Number.isFinite(o))
      return [0, 0, 0];
    let a = t <= xT ? Bp * t : 116 * Math.cbrt(t) - 16;
    return [
      a,
      13 * a * (r - Fp),
      13 * a * (o - Up)
    ];
  },
  // Convert Luv to D65-adapted XYZ
  // https://en.wikipedia.org/wiki/CIELUV#The_reverse_transformation
  toBase(n) {
    let [e, t, r] = n;
    if (e === 0 || Yr(e))
      return [0, 0, 0];
    t = It(t), r = It(r);
    let o = t / (13 * e) + Fp, a = r / (13 * e) + Up, u = e <= 8 ? e / Bp : Math.pow((e + 16) / 116, 3);
    return [
      u * (9 * o / (4 * a)),
      u,
      u * ((12 - 3 * o - 20 * a) / (4 * a))
    ];
  },
  formats: {
    color: {
      id: "--luv",
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
}), Ch = new ye({
  id: "lchuv",
  name: "LChuv",
  coords: {
    l: {
      refRange: [0, 100],
      name: "Lightness"
    },
    c: {
      refRange: [0, 220],
      name: "Chroma"
    },
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    }
  },
  base: am,
  fromBase(n) {
    let [e, t, r] = n, o;
    const a = 0.02;
    return Math.abs(t) < a && Math.abs(r) < a ? o = NaN : o = Math.atan2(r, t) * 180 / Math.PI, [
      e,
      // L is still L
      Math.sqrt(t ** 2 + r ** 2),
      // Chroma
      lr(o)
      // Hue, in degrees [0 to 360)
    ];
  },
  toBase(n) {
    let [e, t, r] = n;
    return t < 0 && (t = 0), isNaN(r) && (r = 0), [
      e,
      // L is still L
      t * Math.cos(r * Math.PI / 180),
      // u
      t * Math.sin(r * Math.PI / 180)
      // v
    ];
  },
  formats: {
    color: {
      id: "--lchuv",
      coords: ["<number> | <percentage>", "<number> | <percentage>", "<number> | <angle>"]
    }
  }
});
const TT = 216 / 24389, ST = 24389 / 27, Zp = $t[0][0], qp = $t[0][1], oc = $t[0][2], Hp = $t[1][0], Wp = $t[1][1], sc = $t[1][2], Gp = $t[2][0], jp = $t[2][1], ac = $t[2][2];
function ao(n, e, t) {
  const r = e / (Math.sin(t) - n * Math.cos(t));
  return r < 0 ? 1 / 0 : r;
}
function Ja(n) {
  const e = Math.pow(n + 16, 3) / 1560896, t = e > TT ? e : n / ST, r = t * (284517 * Zp - 94839 * oc), o = t * (838422 * oc + 769860 * qp + 731718 * Zp), a = t * (632260 * oc - 126452 * qp), u = t * (284517 * Hp - 94839 * sc), h = t * (838422 * sc + 769860 * Wp + 731718 * Hp), c = t * (632260 * sc - 126452 * Wp), f = t * (284517 * Gp - 94839 * ac), d = t * (838422 * ac + 769860 * jp + 731718 * Gp), g = t * (632260 * ac - 126452 * jp);
  return {
    r0s: r / a,
    r0i: o * n / a,
    r1s: r / (a + 126452),
    r1i: (o - 769860) * n / (a + 126452),
    g0s: u / c,
    g0i: h * n / c,
    g1s: u / (c + 126452),
    g1i: (h - 769860) * n / (c + 126452),
    b0s: f / g,
    b0i: d * n / g,
    b1s: f / (g + 126452),
    b1i: (d - 769860) * n / (g + 126452)
  };
}
function Vp(n, e) {
  const t = e / 360 * Math.PI * 2, r = ao(n.r0s, n.r0i, t), o = ao(n.r1s, n.r1i, t), a = ao(n.g0s, n.g0i, t), u = ao(n.g1s, n.g1i, t), h = ao(n.b0s, n.b0i, t), c = ao(n.b1s, n.b1i, t);
  return Math.min(r, o, a, u, h, c);
}
var CT = new ye({
  id: "hsluv",
  name: "HSLuv",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: Ch,
  gamutSpace: mo,
  // Convert LCHuv to HSLuv
  fromBase(n) {
    let [e, t, r] = [It(n[0]), It(n[1]), It(n[2])], o;
    if (e > 99.9999999)
      o = 0, e = 100;
    else if (e < 1e-8)
      o = 0, e = 0;
    else {
      let a = Ja(e), u = Vp(a, r);
      o = t / u * 100;
    }
    return [r, o, e];
  },
  // Convert HSLuv to LCHuv
  toBase(n) {
    let [e, t, r] = [It(n[0]), It(n[1]), It(n[2])], o;
    if (r > 99.9999999)
      r = 100, o = 0;
    else if (r < 1e-8)
      r = 0, o = 0;
    else {
      let a = Ja(r);
      o = Vp(a, e) / 100 * t;
    }
    return [r, o, e];
  },
  formats: {
    color: {
      id: "--hsluv",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
$t[0][0];
$t[0][1];
$t[0][2];
$t[1][0];
$t[1][1];
$t[1][2];
$t[2][0];
$t[2][1];
$t[2][2];
function uo(n, e) {
  return Math.abs(e) / Math.sqrt(Math.pow(n, 2) + 1);
}
function Kp(n) {
  let e = uo(n.r0s, n.r0i), t = uo(n.r1s, n.r1i), r = uo(n.g0s, n.g0i), o = uo(n.g1s, n.g1i), a = uo(n.b0s, n.b0i), u = uo(n.b1s, n.b1i);
  return Math.min(e, t, r, o, a, u);
}
var MT = new ye({
  id: "hpluv",
  name: "HPLuv",
  coords: {
    h: {
      refRange: [0, 360],
      type: "angle",
      name: "Hue"
    },
    s: {
      range: [0, 100],
      name: "Saturation"
    },
    l: {
      range: [0, 100],
      name: "Lightness"
    }
  },
  base: Ch,
  gamutSpace: "self",
  // Convert LCHuv to HPLuv
  fromBase(n) {
    let [e, t, r] = [It(n[0]), It(n[1]), It(n[2])], o;
    if (e > 99.9999999)
      o = 0, e = 100;
    else if (e < 1e-8)
      o = 0, e = 0;
    else {
      let a = Ja(e), u = Kp(a);
      o = t / u * 100;
    }
    return [r, o, e];
  },
  // Convert HPLuv to LCHuv
  toBase(n) {
    let [e, t, r] = [It(n[0]), It(n[1]), It(n[2])], o;
    if (r > 99.9999999)
      r = 100, o = 0;
    else if (r < 1e-8)
      r = 0, o = 0;
    else {
      let a = Ja(r);
      o = Kp(a) / 100 * t;
    }
    return [r, o, e];
  },
  formats: {
    color: {
      id: "--hpluv",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
const Jp = 203, Yp = 2610 / 2 ** 14, ET = 2 ** 14 / 2610, AT = 2523 / 2 ** 5, Qp = 2 ** 5 / 2523, Xp = 3424 / 2 ** 12, e0 = 2413 / 2 ** 7, t0 = 2392 / 2 ** 7;
var IT = new gn({
  id: "rec2100pq",
  cssId: "rec2100-pq",
  name: "REC.2100-PQ",
  base: Mu,
  toBase(n) {
    return n.map(function(e) {
      return (Math.max(e ** Qp - Xp, 0) / (e0 - t0 * e ** Qp)) ** ET * 1e4 / Jp;
    });
  },
  fromBase(n) {
    return n.map(function(e) {
      let t = Math.max(e * Jp / 1e4, 0), r = Xp + e0 * t ** Yp, o = 1 + t0 * t ** Yp;
      return (r / o) ** AT;
    });
  }
});
const n0 = 0.17883277, r0 = 0.28466892, i0 = 0.55991073, uc = 3.7743;
var PT = new gn({
  id: "rec2100hlg",
  cssId: "rec2100-hlg",
  name: "REC.2100-HLG",
  referred: "scene",
  base: Mu,
  toBase(n) {
    return n.map(function(e) {
      return e <= 0.5 ? e ** 2 / 3 * uc : (Math.exp((e - i0) / n0) + r0) / 12 * uc;
    });
  },
  fromBase(n) {
    return n.map(function(e) {
      return e /= uc, e <= 1 / 12 ? Math.sqrt(3 * e) : n0 * Math.log(12 * e - r0) + i0;
    });
  }
});
const um = {};
Qr.add("chromatic-adaptation-start", (n) => {
  n.options.method && (n.M = lm(n.W1, n.W2, n.options.method));
});
Qr.add("chromatic-adaptation-end", (n) => {
  n.M || (n.M = lm(n.W1, n.W2, n.options.method));
});
function Au({ id: n, toCone_M: e, fromCone_M: t }) {
  um[n] = arguments[0];
}
function lm(n, e, t = "Bradford") {
  let r = um[t], [o, a, u] = dt(r.toCone_M, n), [h, c, f] = dt(r.toCone_M, e), d = [
    [h / o, 0, 0],
    [0, c / a, 0],
    [0, 0, f / u]
  ], g = dt(d, r.toCone_M);
  return dt(r.fromCone_M, g);
}
Au({
  id: "von Kries",
  toCone_M: [
    [0.40024, 0.7076, -0.08081],
    [-0.2263, 1.16532, 0.0457],
    [0, 0, 0.91822]
  ],
  fromCone_M: [
    [1.8599363874558397, -1.1293816185800916, 0.21989740959619328],
    [0.3611914362417676, 0.6388124632850422, -6370596838649899e-21],
    [0, 0, 1.0890636230968613]
  ]
});
Au({
  id: "Bradford",
  // Convert an array of XYZ values in the range 0.0 - 1.0
  // to cone fundamentals
  toCone_M: [
    [0.8951, 0.2664, -0.1614],
    [-0.7502, 1.7135, 0.0367],
    [0.0389, -0.0685, 1.0296]
  ],
  // and back
  fromCone_M: [
    [0.9869929054667121, -0.14705425642099013, 0.15996265166373122],
    [0.4323052697233945, 0.5183602715367774, 0.049291228212855594],
    [-0.00852866457517732, 0.04004282165408486, 0.96848669578755]
  ]
});
Au({
  id: "CAT02",
  // with complete chromatic adaptation to W2, so D = 1.0
  toCone_M: [
    [0.7328, 0.4296, -0.1624],
    [-0.7036, 1.6975, 61e-4],
    [3e-3, 0.0136, 0.9834]
  ],
  fromCone_M: [
    [1.0961238208355142, -0.27886900021828726, 0.18274517938277307],
    [0.4543690419753592, 0.4735331543074117, 0.07209780371722911],
    [-0.009627608738429355, -0.00569803121611342, 1.0153256399545427]
  ]
});
Au({
  id: "CAT16",
  toCone_M: [
    [0.401288, 0.650173, -0.051461],
    [-0.250268, 1.204414, 0.045854],
    [-2079e-6, 0.048952, 0.953127]
  ],
  // the extra precision is needed to avoid roundtripping errors
  fromCone_M: [
    [1.862067855087233, -1.0112546305316845, 0.14918677544445172],
    [0.3875265432361372, 0.6214474419314753, -0.008973985167612521],
    [-0.01584149884933386, -0.03412293802851557, 1.0499644368778496]
  ]
});
Object.assign(rn, {
  // whitepoint values from ASTM E308-01 with 10nm spacing, 1931 2 degree observer
  // all normalized to Y (luminance) = 1.00000
  // Illuminant A is a tungsten electric light, giving a very warm, orange light.
  A: [1.0985, 1, 0.35585],
  // Illuminant C was an early approximation to daylight: illuminant A with a blue filter.
  C: [0.98074, 1, 1.18232],
  // The daylight series of illuminants simulate natural daylight.
  // The color temperature (in degrees Kelvin/100) ranges from
  // cool, overcast daylight (D50) to bright, direct sunlight (D65).
  D55: [0.95682, 1, 0.92149],
  D75: [0.94972, 1, 1.22638],
  // Equal-energy illuminant, used in two-stage CAT16
  E: [1, 1, 1],
  // The F series of illuminants represent fluorescent lights
  F2: [0.99186, 1, 0.67393],
  F7: [0.95041, 1, 1.08747],
  F11: [1.00962, 1, 0.6435]
});
rn.ACES = [0.32168 / 0.33767, 1, (1 - 0.32168 - 0.33767) / 0.33767];
const OT = [
  [0.6624541811085053, 0.13400420645643313, 0.1561876870049078],
  [0.27222871678091454, 0.6740817658111484, 0.05368951740793705],
  [-0.005574649490394108, 0.004060733528982826, 1.0103391003129971]
], kT = [
  [1.6410233796943257, -0.32480329418479, -0.23642469523761225],
  [-0.6636628587229829, 1.6153315916573379, 0.016756347685530137],
  [0.011721894328375376, -0.008284441996237409, 0.9883948585390215]
];
var cm = new gn({
  id: "acescg",
  cssId: "--acescg",
  name: "ACEScg",
  // ACEScg – A scene-referred, linear-light encoding of ACES Data
  // https://docs.acescentral.com/specifications/acescg/
  // uses the AP1 primaries, see section 4.3.1 Color primaries
  coords: {
    r: {
      range: [0, 65504],
      name: "Red"
    },
    g: {
      range: [0, 65504],
      name: "Green"
    },
    b: {
      range: [0, 65504],
      name: "Blue"
    }
  },
  referred: "scene",
  white: rn.ACES,
  toXYZ_M: OT,
  fromXYZ_M: kT
});
const Ea = 2 ** -16, lc = -0.35828683, Aa = (Math.log2(65504) + 9.72) / 17.52;
var $T = new gn({
  id: "acescc",
  cssId: "--acescc",
  name: "ACEScc",
  // see S-2014-003 ACEScc – A Logarithmic Encoding of ACES Data
  // https://docs.acescentral.com/specifications/acescc/
  // uses the AP1 primaries, see section 4.3.1 Color primaries
  // Appendix A: "Very small ACES scene referred values below 7 1/4 stops
  // below 18% middle gray are encoded as negative ACEScc values.
  // These values should be preserved per the encoding in Section 4.4
  // so that all positive ACES values are maintained."
  coords: {
    r: {
      range: [lc, Aa],
      name: "Red"
    },
    g: {
      range: [lc, Aa],
      name: "Green"
    },
    b: {
      range: [lc, Aa],
      name: "Blue"
    }
  },
  referred: "scene",
  base: cm,
  // from section 4.4.2 Decoding Function
  toBase(n) {
    const e = -0.3013698630136986;
    return n.map(function(t) {
      return t <= e ? (2 ** (t * 17.52 - 9.72) - Ea) * 2 : t < Aa ? 2 ** (t * 17.52 - 9.72) : 65504;
    });
  },
  // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
  fromBase(n) {
    return n.map(function(e) {
      return e <= 0 ? (Math.log2(Ea) + 9.72) / 17.52 : e < Ea ? (Math.log2(Ea + e * 0.5) + 9.72) / 17.52 : (Math.log2(e) + 9.72) / 17.52;
    });
  }
  // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
  // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
}), o0 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A98RGB: gT,
  A98RGB_Linear: im,
  ACEScc: $T,
  ACEScg: cm,
  CAM16_JMh: wx,
  HCT: us,
  HPLuv: MT,
  HSL: nm,
  HSLuv: CT,
  HSV: rm,
  HWB: fT,
  ICTCP: Rc,
  JzCzHz: Nc,
  Jzazbz: Lg,
  LCH: as,
  LCHuv: Ch,
  Lab: In,
  Lab_D65: Lc,
  Luv: am,
  OKLCH: wT,
  OKLab: fo,
  P3: Yg,
  P3_Linear: Kg,
  ProPhoto: bT,
  ProPhoto_Linear: om,
  REC_2020: Vg,
  REC_2020_Linear: Mu,
  REC_2100_HLG: PT,
  REC_2100_PQ: IT,
  XYZ_ABS_D65: xh,
  XYZ_D50: wh,
  XYZ_D65: qt,
  sRGB: mo,
  sRGB_Linear: Jg
});
class ot {
  /**
   * Creates an instance of Color.
   * Signatures:
   * - `new Color(stringToParse)`
   * - `new Color(otherColor)`
   * - `new Color({space, coords, alpha})`
   * - `new Color(space, coords, alpha)`
   * - `new Color(spaceId, coords, alpha)`
   */
  constructor(...e) {
    let t;
    e.length === 1 && (t = Ne(e[0]));
    let r, o, a;
    t ? (r = t.space || t.spaceId, o = t.coords, a = t.alpha) : [r, o, a] = e, Object.defineProperty(this, "space", {
      value: ye.get(r),
      writable: !1,
      enumerable: !0,
      configurable: !0
      // see note in https://262.ecma-international.org/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
    }), this.coords = o ? o.slice() : [0, 0, 0], this.alpha = a > 1 || a === void 0 ? 1 : a < 0 ? 0 : a;
    for (let u = 0; u < this.coords.length; u++)
      this.coords[u] === "NaN" && (this.coords[u] = NaN);
    for (let u in this.space.coords)
      Object.defineProperty(this, u, {
        get: () => this.get(u),
        set: (h) => this.set(u, h)
      });
  }
  get spaceId() {
    return this.space.id;
  }
  clone() {
    return new ot(this.space, this.coords, this.alpha);
  }
  toJSON() {
    return {
      spaceId: this.spaceId,
      coords: this.coords,
      alpha: this.alpha
    };
  }
  display(...e) {
    let t = Dx(this, ...e);
    return t.color = new ot(t.color), t;
  }
  /**
   * Get a color from the argument passed
   * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
   */
  static get(e, ...t) {
    return e instanceof ot ? e : new ot(e, ...t);
  }
  static defineFunction(e, t, r = t) {
    let { instance: o = !0, returns: a } = r, u = function(...h) {
      let c = t(...h);
      if (a === "color")
        c = ot.get(c);
      else if (a === "function<color>") {
        let f = c;
        c = function(...d) {
          let g = f(...d);
          return ot.get(g);
        }, Object.assign(c, f);
      } else a === "array<color>" && (c = c.map((f) => ot.get(f)));
      return c;
    };
    e in ot || (ot[e] = u), o && (ot.prototype[e] = function(...h) {
      return u(this, ...h);
    });
  }
  static defineFunctions(e) {
    for (let t in e)
      ot.defineFunction(t, e[t], e[t]);
  }
  static extend(e) {
    if (e.register)
      e.register(ot);
    else
      for (let t in e)
        ot.defineFunction(t, e[t]);
  }
}
ot.defineFunctions({
  get: An,
  getAll: bs,
  set: Ir,
  setAll: bh,
  to: ft,
  equals: Lx,
  inGamut: Ii,
  toGamut: Xr,
  distance: Dg,
  toString: es
});
Object.assign(ot, {
  util: z5,
  hooks: Qr,
  WHITES: rn,
  Space: ye,
  spaces: ye.registry,
  parse: Rg,
  // Global defaults one may want to configure
  defaults: Pn
});
for (let n of Object.keys(o0))
  ye.register(o0[n]);
for (let n in ye.registry)
  Bc(n, ye.registry[n]);
Qr.add("colorspace-init-end", (n) => {
  var e;
  Bc(n.id, n), (e = n.aliases) == null || e.forEach((t) => {
    Bc(t, n);
  });
});
function Bc(n, e) {
  let t = n.replace(/-/g, "_");
  Object.defineProperty(ot.prototype, t, {
    // Convert coords to coords in another colorspace and return them
    // Source colorspace: this.spaceId
    // Target colorspace: id
    get() {
      let r = this.getAll(n);
      return typeof Proxy > "u" ? r : new Proxy(r, {
        has: (o, a) => {
          try {
            return ye.resolveCoord([e, a]), !0;
          } catch {
          }
          return Reflect.has(o, a);
        },
        get: (o, a, u) => {
          if (a && typeof a != "symbol" && !(a in o)) {
            let { index: h } = ye.resolveCoord([e, a]);
            if (h >= 0)
              return o[h];
          }
          return Reflect.get(o, a, u);
        },
        set: (o, a, u, h) => {
          if (a && typeof a != "symbol" && !(a in o) || a >= 0) {
            let { index: c } = ye.resolveCoord([e, a]);
            if (c >= 0)
              return o[c] = u, this.setAll(n, o), !0;
          }
          return Reflect.set(o, a, u, h);
        }
      });
    },
    // Convert coords in another colorspace to internal coords and set them
    // Target colorspace: this.spaceId
    // Source colorspace: id
    set(r) {
      this.setAll(n, r);
    },
    configurable: !0,
    enumerable: !0
  });
}
ot.extend(go);
ot.extend({ deltaE: Ko });
Object.assign(ot, { deltaEMethods: go });
ot.extend(lT);
ot.extend({ contrast: iT });
ot.extend(sT);
ot.extend(Fx);
ot.extend(hT);
ot.extend(qa);
function K(n, e, t) {
  function r(h, c) {
    var f;
    Object.defineProperty(h, "_zod", {
      value: h._zod ?? {},
      enumerable: !1
    }), (f = h._zod).traits ?? (f.traits = /* @__PURE__ */ new Set()), h._zod.traits.add(n), e(h, c);
    for (const d in u.prototype)
      d in h || Object.defineProperty(h, d, { value: u.prototype[d].bind(h) });
    h._zod.constr = u, h._zod.def = c;
  }
  const o = (t == null ? void 0 : t.Parent) ?? Object;
  class a extends o {
  }
  Object.defineProperty(a, "name", { value: n });
  function u(h) {
    var c;
    const f = t != null && t.Parent ? new a() : this;
    r(f, h), (c = f._zod).deferred ?? (c.deferred = []);
    for (const d of f._zod.deferred)
      d();
    return f;
  }
  return Object.defineProperty(u, "init", { value: r }), Object.defineProperty(u, Symbol.hasInstance, {
    value: (h) => {
      var c, f;
      return t != null && t.Parent && h instanceof t.Parent ? !0 : (f = (c = h == null ? void 0 : h._zod) == null ? void 0 : c.traits) == null ? void 0 : f.has(n);
    }
  }), Object.defineProperty(u, "name", { value: n }), u;
}
class ls extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
const hm = {};
function ti(n) {
  return hm;
}
function NT(n) {
  const e = Object.values(n).filter((r) => typeof r == "number");
  return Object.entries(n).filter(([r, o]) => e.indexOf(+r) === -1).map(([r, o]) => o);
}
function RT(n, e) {
  return typeof e == "bigint" ? e.toString() : e;
}
function Mh(n) {
  return {
    get value() {
      {
        const e = n();
        return Object.defineProperty(this, "value", { value: e }), e;
      }
    }
  };
}
function Eh(n) {
  return n == null;
}
function Ah(n) {
  const e = n.startsWith("^") ? 1 : 0, t = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(e, t);
}
function zT(n, e) {
  const t = (n.toString().split(".")[1] || "").length, r = (e.toString().split(".")[1] || "").length, o = t > r ? t : r, a = Number.parseInt(n.toFixed(o).replace(".", "")), u = Number.parseInt(e.toFixed(o).replace(".", ""));
  return a % u / 10 ** o;
}
function pt(n, e, t) {
  Object.defineProperty(n, e, {
    get() {
      {
        const r = t();
        return n[e] = r, r;
      }
    },
    set(r) {
      Object.defineProperty(n, e, {
        value: r
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function xs(n, e, t) {
  Object.defineProperty(n, e, {
    value: t,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function fm(n = 10) {
  const e = "abcdefghijklmnopqrstuvwxyz";
  let t = "";
  for (let r = 0; r < n; r++)
    t += e[Math.floor(Math.random() * e.length)];
  return t;
}
function Wo(n) {
  return JSON.stringify(n);
}
const dm = Error.captureStackTrace ? Error.captureStackTrace : (...n) => {
};
function Ya(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
const DT = Mh(() => {
  var n;
  if (typeof navigator < "u" && ((n = navigator == null ? void 0 : navigator.userAgent) != null && n.includes("Cloudflare")))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function Fc(n) {
  if (Ya(n) === !1)
    return !1;
  const e = n.constructor;
  if (e === void 0)
    return !0;
  const t = e.prototype;
  return !(Ya(t) === !1 || Object.prototype.hasOwnProperty.call(t, "isPrototypeOf") === !1);
}
const LT = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function Ts(n) {
  return n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Ri(n, e, t) {
  const r = new n._zod.constr(e ?? n._zod.def);
  return (!e || t != null && t.parent) && (r._zod.parent = n), r;
}
function me(n) {
  const e = n;
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
function BT(n) {
  return Object.keys(n).filter((e) => n[e]._zod.optin === "optional" && n[e]._zod.optout === "optional");
}
const FT = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function UT(n, e) {
  const t = {}, r = n._zod.def;
  for (const o in e) {
    if (!(o in r.shape))
      throw new Error(`Unrecognized key: "${o}"`);
    e[o] && (t[o] = r.shape[o]);
  }
  return Ri(n, {
    ...n._zod.def,
    shape: t,
    checks: []
  });
}
function ZT(n, e) {
  const t = { ...n._zod.def.shape }, r = n._zod.def;
  for (const o in e) {
    if (!(o in r.shape))
      throw new Error(`Unrecognized key: "${o}"`);
    e[o] && delete t[o];
  }
  return Ri(n, {
    ...n._zod.def,
    shape: t,
    checks: []
  });
}
function qT(n, e) {
  const t = {
    ...n._zod.def,
    get shape() {
      const r = { ...n._zod.def.shape, ...e };
      return xs(this, "shape", r), r;
    },
    checks: []
    // delete existing checks
  };
  return Ri(n, t);
}
function HT(n, e) {
  return Ri(n, {
    ...n._zod.def,
    get shape() {
      const t = { ...n._zod.def.shape, ...e._zod.def.shape };
      return xs(this, "shape", t), t;
    },
    catchall: e._zod.def.catchall,
    checks: []
    // delete existing checks
  });
}
function WT(n, e, t) {
  const r = e._zod.def.shape, o = { ...r };
  if (t)
    for (const a in t) {
      if (!(a in r))
        throw new Error(`Unrecognized key: "${a}"`);
      t[a] && (o[a] = n ? new n({
        type: "optional",
        innerType: r[a]
      }) : r[a]);
    }
  else
    for (const a in r)
      o[a] = n ? new n({
        type: "optional",
        innerType: r[a]
      }) : r[a];
  return Ri(e, {
    ...e._zod.def,
    shape: o,
    checks: []
  });
}
function GT(n, e, t) {
  const r = e._zod.def.shape, o = { ...r };
  if (t)
    for (const a in t) {
      if (!(a in o))
        throw new Error(`Unrecognized key: "${a}"`);
      t[a] && (o[a] = new n({
        type: "nonoptional",
        innerType: r[a]
      }));
    }
  else
    for (const a in r)
      o[a] = new n({
        type: "nonoptional",
        innerType: r[a]
      });
  return Ri(e, {
    ...e._zod.def,
    shape: o,
    // optional: [],
    checks: []
  });
}
function ts(n, e = 0) {
  for (let t = e; t < n.issues.length; t++)
    if (n.issues[t].continue !== !0)
      return !0;
  return !1;
}
function Mi(n, e) {
  return e.map((t) => {
    var r;
    return (r = t).path ?? (r.path = []), t.path.unshift(n), t;
  });
}
function Ia(n) {
  return typeof n == "string" ? n : n == null ? void 0 : n.message;
}
function ni(n, e, t) {
  var o, a, u, h, c, f;
  const r = { ...n, path: n.path ?? [] };
  if (!n.message) {
    const d = Ia((u = (a = (o = n.inst) == null ? void 0 : o._zod.def) == null ? void 0 : a.error) == null ? void 0 : u.call(a, n)) ?? Ia((h = e == null ? void 0 : e.error) == null ? void 0 : h.call(e, n)) ?? Ia((c = t.customError) == null ? void 0 : c.call(t, n)) ?? Ia((f = t.localeError) == null ? void 0 : f.call(t, n)) ?? "Invalid input";
    r.message = d;
  }
  return delete r.inst, delete r.continue, e != null && e.reportInput || delete r.input, r;
}
function Ih(n) {
  return Array.isArray(n) ? "array" : typeof n == "string" ? "string" : "unknown";
}
function cs(...n) {
  const [e, t, r] = n;
  return typeof e == "string" ? {
    message: e,
    code: "custom",
    input: t,
    inst: r
  } : { ...e };
}
const pm = (n, e) => {
  n.name = "$ZodError", Object.defineProperty(n, "_zod", {
    value: n._zod,
    enumerable: !1
  }), Object.defineProperty(n, "issues", {
    value: e,
    enumerable: !1
  }), Object.defineProperty(n, "message", {
    get() {
      return JSON.stringify(e, RT, 2);
    },
    enumerable: !0
    // configurable: false,
  });
}, gm = K("$ZodError", pm), mm = K("$ZodError", pm, { Parent: Error });
function jT(n, e = (t) => t.message) {
  const t = {}, r = [];
  for (const o of n.issues)
    o.path.length > 0 ? (t[o.path[0]] = t[o.path[0]] || [], t[o.path[0]].push(e(o))) : r.push(e(o));
  return { formErrors: r, fieldErrors: t };
}
function VT(n, e) {
  const t = e || function(a) {
    return a.message;
  }, r = { _errors: [] }, o = (a) => {
    for (const u of a.issues)
      if (u.code === "invalid_union" && u.errors.length)
        u.errors.map((h) => o({ issues: h }));
      else if (u.code === "invalid_key")
        o({ issues: u.issues });
      else if (u.code === "invalid_element")
        o({ issues: u.issues });
      else if (u.path.length === 0)
        r._errors.push(t(u));
      else {
        let h = r, c = 0;
        for (; c < u.path.length; ) {
          const f = u.path[c];
          c === u.path.length - 1 ? (h[f] = h[f] || { _errors: [] }, h[f]._errors.push(t(u))) : h[f] = h[f] || { _errors: [] }, h = h[f], c++;
        }
      }
  };
  return o(n), r;
}
function KT(n) {
  const e = [];
  for (const t of n)
    typeof t == "number" ? e.push(`[${t}]`) : typeof t == "symbol" ? e.push(`[${JSON.stringify(String(t))}]`) : /[^\w$]/.test(t) ? e.push(`[${JSON.stringify(t)}]`) : (e.length && e.push("."), e.push(t));
  return e.join("");
}
function JT(n) {
  var r;
  const e = [], t = [...n.issues].sort((o, a) => o.path.length - a.path.length);
  for (const o of t)
    e.push(`✖ ${o.message}`), (r = o.path) != null && r.length && e.push(`  → at ${KT(o.path)}`);
  return e.join(`
`);
}
const YT = (n) => (e, t, r, o) => {
  const a = r ? Object.assign(r, { async: !1 }) : { async: !1 }, u = e._zod.run({ value: t, issues: [] }, a);
  if (u instanceof Promise)
    throw new ls();
  if (u.issues.length) {
    const h = new ((o == null ? void 0 : o.Err) ?? n)(u.issues.map((c) => ni(c, a, ti())));
    throw dm(h, o == null ? void 0 : o.callee), h;
  }
  return u.value;
}, QT = (n) => async (e, t, r, o) => {
  const a = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let u = e._zod.run({ value: t, issues: [] }, a);
  if (u instanceof Promise && (u = await u), u.issues.length) {
    const h = new ((o == null ? void 0 : o.Err) ?? n)(u.issues.map((c) => ni(c, a, ti())));
    throw dm(h, o == null ? void 0 : o.callee), h;
  }
  return u.value;
}, vm = (n) => (e, t, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, a = e._zod.run({ value: t, issues: [] }, o);
  if (a instanceof Promise)
    throw new ls();
  return a.issues.length ? {
    success: !1,
    error: new (n ?? gm)(a.issues.map((u) => ni(u, o, ti())))
  } : { success: !0, data: a.value };
}, XT = /* @__PURE__ */ vm(mm), _m = (n) => async (e, t, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let a = e._zod.run({ value: t, issues: [] }, o);
  return a instanceof Promise && (a = await a), a.issues.length ? {
    success: !1,
    error: new n(a.issues.map((u) => ni(u, o, ti())))
  } : { success: !0, data: a.value };
}, ym = /* @__PURE__ */ _m(mm), eS = /^[cC][^\s-]{8,}$/, tS = /^[0-9a-z]+$/, nS = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, rS = /^[0-9a-vA-V]{20}$/, iS = /^[A-Za-z0-9]{27}$/, oS = /^[a-zA-Z0-9_-]{21}$/, sS = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, aS = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, s0 = (n) => n ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/, uS = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, lS = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function cS() {
  return new RegExp(lS, "u");
}
const hS = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, fS = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, dS = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, pS = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, gS = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, bm = /^[A-Za-z0-9_-]*$/, mS = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, vS = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, _S = /^\+(?:[0-9]){6,14}[0-9]$/, wm = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", yS = /* @__PURE__ */ new RegExp(`^${wm}$`);
function xm(n) {
  const e = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number" ? n.precision === -1 ? `${e}` : n.precision === 0 ? `${e}:[0-5]\\d` : `${e}:[0-5]\\d\\.\\d{${n.precision}}` : `${e}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function bS(n) {
  return new RegExp(`^${xm(n)}$`);
}
function wS(n) {
  const e = xm({ precision: n.precision }), t = ["Z"];
  n.local && t.push(""), n.offset && t.push("([+-]\\d{2}:\\d{2})");
  const r = `${e}(?:${t.join("|")})`;
  return new RegExp(`^${wm}T(?:${r})$`);
}
const xS = (n) => {
  const e = n ? `[\\s\\S]{${(n == null ? void 0 : n.minimum) ?? 0},${(n == null ? void 0 : n.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${e}$`);
}, TS = /^\d+$/, SS = /^-?\d+(?:\.\d+)?/i, CS = /true|false/i, MS = /null/i, ES = /^[^A-Z]*$/, AS = /^[^a-z]*$/, mn = /* @__PURE__ */ K("$ZodCheck", (n, e) => {
  var t;
  n._zod ?? (n._zod = {}), n._zod.def = e, (t = n._zod).onattach ?? (t.onattach = []);
}), Tm = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Sm = /* @__PURE__ */ K("$ZodCheckLessThan", (n, e) => {
  mn.init(n, e);
  const t = Tm[typeof e.value];
  n._zod.onattach.push((r) => {
    const o = r._zod.bag, a = (e.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    e.value < a && (e.inclusive ? o.maximum = e.value : o.exclusiveMaximum = e.value);
  }), n._zod.check = (r) => {
    (e.inclusive ? r.value <= e.value : r.value < e.value) || r.issues.push({
      origin: t,
      code: "too_big",
      maximum: e.value,
      input: r.value,
      inclusive: e.inclusive,
      inst: n,
      continue: !e.abort
    });
  };
}), Cm = /* @__PURE__ */ K("$ZodCheckGreaterThan", (n, e) => {
  mn.init(n, e);
  const t = Tm[typeof e.value];
  n._zod.onattach.push((r) => {
    const o = r._zod.bag, a = (e.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    e.value > a && (e.inclusive ? o.minimum = e.value : o.exclusiveMinimum = e.value);
  }), n._zod.check = (r) => {
    (e.inclusive ? r.value >= e.value : r.value > e.value) || r.issues.push({
      origin: t,
      code: "too_small",
      minimum: e.value,
      input: r.value,
      inclusive: e.inclusive,
      inst: n,
      continue: !e.abort
    });
  };
}), IS = /* @__PURE__ */ K("$ZodCheckMultipleOf", (n, e) => {
  mn.init(n, e), n._zod.onattach.push((t) => {
    var r;
    (r = t._zod.bag).multipleOf ?? (r.multipleOf = e.value);
  }), n._zod.check = (t) => {
    if (typeof t.value != typeof e.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof t.value == "bigint" ? t.value % e.value === BigInt(0) : zT(t.value, e.value) === 0) || t.issues.push({
      origin: typeof t.value,
      code: "not_multiple_of",
      divisor: e.value,
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), PS = /* @__PURE__ */ K("$ZodCheckNumberFormat", (n, e) => {
  var u;
  mn.init(n, e), e.format = e.format || "float64";
  const t = (u = e.format) == null ? void 0 : u.includes("int"), r = t ? "int" : "number", [o, a] = FT[e.format];
  n._zod.onattach.push((h) => {
    const c = h._zod.bag;
    c.format = e.format, c.minimum = o, c.maximum = a, t && (c.pattern = TS);
  }), n._zod.check = (h) => {
    const c = h.value;
    if (t) {
      if (!Number.isInteger(c)) {
        h.issues.push({
          expected: r,
          format: e.format,
          code: "invalid_type",
          input: c,
          inst: n
        });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? h.issues.push({
          input: c,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: n,
          origin: r,
          continue: !e.abort
        }) : h.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: n,
          origin: r,
          continue: !e.abort
        });
        return;
      }
    }
    c < o && h.issues.push({
      origin: "number",
      input: c,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: n,
      continue: !e.abort
    }), c > a && h.issues.push({
      origin: "number",
      input: c,
      code: "too_big",
      maximum: a,
      inst: n
    });
  };
}), OS = /* @__PURE__ */ K("$ZodCheckMaxLength", (n, e) => {
  mn.init(n, e), n._zod.when = (t) => {
    const r = t.value;
    return !Eh(r) && r.length !== void 0;
  }, n._zod.onattach.push((t) => {
    const r = t._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    e.maximum < r && (t._zod.bag.maximum = e.maximum);
  }), n._zod.check = (t) => {
    const r = t.value;
    if (r.length <= e.maximum)
      return;
    const a = Ih(r);
    t.issues.push({
      origin: a,
      code: "too_big",
      maximum: e.maximum,
      inclusive: !0,
      input: r,
      inst: n,
      continue: !e.abort
    });
  };
}), kS = /* @__PURE__ */ K("$ZodCheckMinLength", (n, e) => {
  mn.init(n, e), n._zod.when = (t) => {
    const r = t.value;
    return !Eh(r) && r.length !== void 0;
  }, n._zod.onattach.push((t) => {
    const r = t._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    e.minimum > r && (t._zod.bag.minimum = e.minimum);
  }), n._zod.check = (t) => {
    const r = t.value;
    if (r.length >= e.minimum)
      return;
    const a = Ih(r);
    t.issues.push({
      origin: a,
      code: "too_small",
      minimum: e.minimum,
      inclusive: !0,
      input: r,
      inst: n,
      continue: !e.abort
    });
  };
}), $S = /* @__PURE__ */ K("$ZodCheckLengthEquals", (n, e) => {
  mn.init(n, e), n._zod.when = (t) => {
    const r = t.value;
    return !Eh(r) && r.length !== void 0;
  }, n._zod.onattach.push((t) => {
    const r = t._zod.bag;
    r.minimum = e.length, r.maximum = e.length, r.length = e.length;
  }), n._zod.check = (t) => {
    const r = t.value, o = r.length;
    if (o === e.length)
      return;
    const a = Ih(r), u = o > e.length;
    t.issues.push({
      origin: a,
      ...u ? { code: "too_big", maximum: e.length } : { code: "too_small", minimum: e.length },
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), Iu = /* @__PURE__ */ K("$ZodCheckStringFormat", (n, e) => {
  var t;
  mn.init(n, e), n._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.format = e.format, e.pattern && (o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(e.pattern));
  }), (t = n._zod).check ?? (t.check = (r) => {
    if (!e.pattern)
      throw new Error("Not implemented.");
    e.pattern.lastIndex = 0, !e.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: e.format,
      input: r.value,
      ...e.pattern ? { pattern: e.pattern.toString() } : {},
      inst: n,
      continue: !e.abort
    });
  });
}), NS = /* @__PURE__ */ K("$ZodCheckRegex", (n, e) => {
  Iu.init(n, e), n._zod.check = (t) => {
    e.pattern.lastIndex = 0, !e.pattern.test(t.value) && t.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: t.value,
      pattern: e.pattern.toString(),
      inst: n,
      continue: !e.abort
    });
  };
}), RS = /* @__PURE__ */ K("$ZodCheckLowerCase", (n, e) => {
  e.pattern ?? (e.pattern = ES), Iu.init(n, e);
}), zS = /* @__PURE__ */ K("$ZodCheckUpperCase", (n, e) => {
  e.pattern ?? (e.pattern = AS), Iu.init(n, e);
}), DS = /* @__PURE__ */ K("$ZodCheckIncludes", (n, e) => {
  mn.init(n, e);
  const t = Ts(e.includes), r = new RegExp(typeof e.position == "number" ? `^.{${e.position}}${t}` : t);
  e.pattern = r, n._zod.onattach.push((o) => {
    const a = o._zod.bag;
    a.patterns ?? (a.patterns = /* @__PURE__ */ new Set()), a.patterns.add(r);
  }), n._zod.check = (o) => {
    o.value.includes(e.includes, e.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: e.includes,
      input: o.value,
      inst: n,
      continue: !e.abort
    });
  };
}), LS = /* @__PURE__ */ K("$ZodCheckStartsWith", (n, e) => {
  mn.init(n, e);
  const t = new RegExp(`^${Ts(e.prefix)}.*`);
  e.pattern ?? (e.pattern = t), n._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(t);
  }), n._zod.check = (r) => {
    r.value.startsWith(e.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: e.prefix,
      input: r.value,
      inst: n,
      continue: !e.abort
    });
  };
}), BS = /* @__PURE__ */ K("$ZodCheckEndsWith", (n, e) => {
  mn.init(n, e);
  const t = new RegExp(`.*${Ts(e.suffix)}$`);
  e.pattern ?? (e.pattern = t), n._zod.onattach.push((r) => {
    const o = r._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(t);
  }), n._zod.check = (r) => {
    r.value.endsWith(e.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: e.suffix,
      input: r.value,
      inst: n,
      continue: !e.abort
    });
  };
}), FS = /* @__PURE__ */ K("$ZodCheckOverwrite", (n, e) => {
  mn.init(n, e), n._zod.check = (t) => {
    t.value = e.tx(t.value);
  };
});
class US {
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
`).filter((u) => u), o = Math.min(...r.map((u) => u.length - u.trimStart().length)), a = r.map((u) => u.slice(o)).map((u) => " ".repeat(this.indent * 2) + u);
    for (const u of a)
      this.content.push(u);
  }
  compile() {
    const e = Function, t = this == null ? void 0 : this.args, o = [...((this == null ? void 0 : this.content) ?? [""]).map((a) => `  ${a}`)];
    return new e(...t, o.join(`
`));
  }
}
const ZS = {
  major: 4,
  minor: 0,
  patch: 0
}, ct = /* @__PURE__ */ K("$ZodType", (n, e) => {
  var o;
  var t;
  n ?? (n = {}), pt(n._zod, "id", () => e.type + "_" + fm(10)), n._zod.def = e, n._zod.bag = n._zod.bag || {}, n._zod.version = ZS;
  const r = [...n._zod.def.checks ?? []];
  n._zod.traits.has("$ZodCheck") && r.unshift(n);
  for (const a of r)
    for (const u of a._zod.onattach)
      u(n);
  if (r.length === 0)
    (t = n._zod).deferred ?? (t.deferred = []), (o = n._zod.deferred) == null || o.push(() => {
      n._zod.run = n._zod.parse;
    });
  else {
    const a = (u, h, c) => {
      let f = ts(u), d;
      for (const g of h) {
        if (g._zod.when) {
          if (!g._zod.when(u))
            continue;
        } else if (f)
          continue;
        const v = u.issues.length, b = g._zod.check(u);
        if (b instanceof Promise && (c == null ? void 0 : c.async) === !1)
          throw new ls();
        if (d || b instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await b, u.issues.length !== v && (f || (f = ts(u, v)));
          });
        else {
          if (u.issues.length === v)
            continue;
          f || (f = ts(u, v));
        }
      }
      return d ? d.then(() => u) : u;
    };
    n._zod.run = (u, h) => {
      const c = n._zod.parse(u, h);
      if (c instanceof Promise) {
        if (h.async === !1)
          throw new ls();
        return c.then((f) => a(f, r, h));
      }
      return a(c, r, h);
    };
  }
  n["~standard"] = {
    validate: (a) => {
      var u;
      try {
        const h = XT(n, a);
        return h.success ? { value: h.data } : { issues: (u = h.error) == null ? void 0 : u.issues };
      } catch {
        return ym(n, a).then((c) => {
          var f;
          return c.success ? { value: c.data } : { issues: (f = c.error) == null ? void 0 : f.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), Ph = /* @__PURE__ */ K("$ZodString", (n, e) => {
  var t;
  ct.init(n, e), n._zod.pattern = [...((t = n == null ? void 0 : n._zod.bag) == null ? void 0 : t.patterns) ?? []].pop() ?? xS(n._zod.bag), n._zod.parse = (r, o) => {
    if (e.coerce)
      try {
        r.value = String(r.value);
      } catch {
      }
    return typeof r.value == "string" || r.issues.push({
      expected: "string",
      code: "invalid_type",
      input: r.value,
      inst: n
    }), r;
  };
}), gt = /* @__PURE__ */ K("$ZodStringFormat", (n, e) => {
  Iu.init(n, e), Ph.init(n, e);
}), qS = /* @__PURE__ */ K("$ZodGUID", (n, e) => {
  e.pattern ?? (e.pattern = aS), gt.init(n, e);
}), HS = /* @__PURE__ */ K("$ZodUUID", (n, e) => {
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
    e.pattern ?? (e.pattern = s0(r));
  } else
    e.pattern ?? (e.pattern = s0());
  gt.init(n, e);
}), WS = /* @__PURE__ */ K("$ZodEmail", (n, e) => {
  e.pattern ?? (e.pattern = uS), gt.init(n, e);
}), GS = /* @__PURE__ */ K("$ZodURL", (n, e) => {
  gt.init(n, e), n._zod.check = (t) => {
    try {
      const r = new URL(t.value);
      e.hostname && (e.hostname.lastIndex = 0, e.hostname.test(r.hostname) || t.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: mS.source,
        input: t.value,
        inst: n,
        continue: !e.abort
      })), e.protocol && (e.protocol.lastIndex = 0, e.protocol.test(r.protocol.endsWith(":") ? r.protocol.slice(0, -1) : r.protocol) || t.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: e.protocol.source,
        input: t.value,
        inst: n,
        continue: !e.abort
      }));
      return;
    } catch {
      t.issues.push({
        code: "invalid_format",
        format: "url",
        input: t.value,
        inst: n,
        continue: !e.abort
      });
    }
  };
}), jS = /* @__PURE__ */ K("$ZodEmoji", (n, e) => {
  e.pattern ?? (e.pattern = cS()), gt.init(n, e);
}), VS = /* @__PURE__ */ K("$ZodNanoID", (n, e) => {
  e.pattern ?? (e.pattern = oS), gt.init(n, e);
}), KS = /* @__PURE__ */ K("$ZodCUID", (n, e) => {
  e.pattern ?? (e.pattern = eS), gt.init(n, e);
}), JS = /* @__PURE__ */ K("$ZodCUID2", (n, e) => {
  e.pattern ?? (e.pattern = tS), gt.init(n, e);
}), YS = /* @__PURE__ */ K("$ZodULID", (n, e) => {
  e.pattern ?? (e.pattern = nS), gt.init(n, e);
}), QS = /* @__PURE__ */ K("$ZodXID", (n, e) => {
  e.pattern ?? (e.pattern = rS), gt.init(n, e);
}), XS = /* @__PURE__ */ K("$ZodKSUID", (n, e) => {
  e.pattern ?? (e.pattern = iS), gt.init(n, e);
}), eC = /* @__PURE__ */ K("$ZodISODateTime", (n, e) => {
  e.pattern ?? (e.pattern = wS(e)), gt.init(n, e), n._zod.check;
}), tC = /* @__PURE__ */ K("$ZodISODate", (n, e) => {
  e.pattern ?? (e.pattern = yS), gt.init(n, e);
}), nC = /* @__PURE__ */ K("$ZodISOTime", (n, e) => {
  e.pattern ?? (e.pattern = bS(e)), gt.init(n, e), n._zod.check;
}), rC = /* @__PURE__ */ K("$ZodISODuration", (n, e) => {
  e.pattern ?? (e.pattern = sS), gt.init(n, e);
}), iC = /* @__PURE__ */ K("$ZodIPv4", (n, e) => {
  e.pattern ?? (e.pattern = hS), gt.init(n, e), n._zod.onattach.push((t) => {
    const r = t._zod.bag;
    r.format = "ipv4";
  });
}), oC = /* @__PURE__ */ K("$ZodIPv6", (n, e) => {
  e.pattern ?? (e.pattern = fS), gt.init(n, e), n._zod.onattach.push((t) => {
    const r = t._zod.bag;
    r.format = "ipv6";
  }), n._zod.check = (t) => {
    try {
      new URL(`http://[${t.value}]`);
    } catch {
      t.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: t.value,
        inst: n,
        continue: !e.abort
      });
    }
  };
}), sC = /* @__PURE__ */ K("$ZodCIDRv4", (n, e) => {
  e.pattern ?? (e.pattern = dS), gt.init(n, e);
}), aC = /* @__PURE__ */ K("$ZodCIDRv6", (n, e) => {
  e.pattern ?? (e.pattern = pS), gt.init(n, e), n._zod.check = (t) => {
    const [r, o] = t.value.split("/");
    try {
      if (!o)
        throw new Error();
      const a = Number(o);
      if (`${a}` !== o)
        throw new Error();
      if (a < 0 || a > 128)
        throw new Error();
      new URL(`http://[${r}]`);
    } catch {
      t.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: t.value,
        inst: n,
        continue: !e.abort
      });
    }
  };
});
function Mm(n) {
  if (n === "")
    return !0;
  if (n.length % 4 !== 0)
    return !1;
  try {
    return atob(n), !0;
  } catch {
    return !1;
  }
}
const uC = /* @__PURE__ */ K("$ZodBase64", (n, e) => {
  e.pattern ?? (e.pattern = gS), gt.init(n, e), n._zod.onattach.push((t) => {
    t._zod.bag.contentEncoding = "base64";
  }), n._zod.check = (t) => {
    Mm(t.value) || t.issues.push({
      code: "invalid_format",
      format: "base64",
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
});
function lC(n) {
  if (!bm.test(n))
    return !1;
  const e = n.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), t = e.padEnd(Math.ceil(e.length / 4) * 4, "=");
  return Mm(t);
}
const cC = /* @__PURE__ */ K("$ZodBase64URL", (n, e) => {
  e.pattern ?? (e.pattern = bm), gt.init(n, e), n._zod.onattach.push((t) => {
    t._zod.bag.contentEncoding = "base64url";
  }), n._zod.check = (t) => {
    lC(t.value) || t.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), hC = /* @__PURE__ */ K("$ZodE164", (n, e) => {
  e.pattern ?? (e.pattern = _S), gt.init(n, e);
});
function fC(n, e = null) {
  try {
    const t = n.split(".");
    if (t.length !== 3)
      return !1;
    const [r] = t, o = JSON.parse(atob(r));
    return !("typ" in o && (o == null ? void 0 : o.typ) !== "JWT" || !o.alg || e && (!("alg" in o) || o.alg !== e));
  } catch {
    return !1;
  }
}
const dC = /* @__PURE__ */ K("$ZodJWT", (n, e) => {
  gt.init(n, e), n._zod.check = (t) => {
    fC(t.value, e.alg) || t.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), Em = /* @__PURE__ */ K("$ZodNumber", (n, e) => {
  ct.init(n, e), n._zod.pattern = n._zod.bag.pattern ?? SS, n._zod.parse = (t, r) => {
    if (e.coerce)
      try {
        t.value = Number(t.value);
      } catch {
      }
    const o = t.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return t;
    const a = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : "Infinity" : void 0;
    return t.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: n,
      ...a ? { received: a } : {}
    }), t;
  };
}), pC = /* @__PURE__ */ K("$ZodNumber", (n, e) => {
  PS.init(n, e), Em.init(n, e);
}), gC = /* @__PURE__ */ K("$ZodBoolean", (n, e) => {
  ct.init(n, e), n._zod.pattern = CS, n._zod.parse = (t, r) => {
    if (e.coerce)
      try {
        t.value = !!t.value;
      } catch {
      }
    const o = t.value;
    return typeof o == "boolean" || t.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: n
    }), t;
  };
}), mC = /* @__PURE__ */ K("$ZodNull", (n, e) => {
  ct.init(n, e), n._zod.pattern = MS, n._zod.values = /* @__PURE__ */ new Set([null]), n._zod.parse = (t, r) => {
    const { value: o } = t;
    return o === null || t.issues.push({
      expected: "null",
      code: "invalid_type",
      input: o,
      inst: n
    }), t;
  };
}), vC = /* @__PURE__ */ K("$ZodUnknown", (n, e) => {
  ct.init(n, e), n._zod.parse = (t) => t;
}), _C = /* @__PURE__ */ K("$ZodNever", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => (t.issues.push({
    expected: "never",
    code: "invalid_type",
    input: t.value,
    inst: n
  }), t);
});
function a0(n, e, t) {
  n.issues.length && e.issues.push(...Mi(t, n.issues)), e.value[t] = n.value;
}
const yC = /* @__PURE__ */ K("$ZodArray", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => {
    const o = t.value;
    if (!Array.isArray(o))
      return t.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: n
      }), t;
    t.value = Array(o.length);
    const a = [];
    for (let u = 0; u < o.length; u++) {
      const h = o[u], c = e.element._zod.run({
        value: h,
        issues: []
      }, r);
      c instanceof Promise ? a.push(c.then((f) => a0(f, t, u))) : a0(c, t, u);
    }
    return a.length ? Promise.all(a).then(() => t) : t;
  };
});
function Pa(n, e, t) {
  n.issues.length && e.issues.push(...Mi(t, n.issues)), e.value[t] = n.value;
}
function u0(n, e, t, r) {
  n.issues.length ? r[t] === void 0 ? t in r ? e.value[t] = void 0 : e.value[t] = n.value : e.issues.push(...Mi(t, n.issues)) : n.value === void 0 ? t in r && (e.value[t] = void 0) : e.value[t] = n.value;
}
const Am = /* @__PURE__ */ K("$ZodObject", (n, e) => {
  ct.init(n, e);
  const t = Mh(() => {
    const g = Object.keys(e.shape);
    for (const b of g)
      if (!(e.shape[b] instanceof ct))
        throw new Error(`Invalid element at key "${b}": expected a Zod schema`);
    const v = BT(e.shape);
    return {
      shape: e.shape,
      keys: g,
      keySet: new Set(g),
      numKeys: g.length,
      optionalKeys: new Set(v)
    };
  });
  pt(n._zod, "propValues", () => {
    const g = e.shape, v = {};
    for (const b in g) {
      const _ = g[b]._zod;
      if (_.values) {
        v[b] ?? (v[b] = /* @__PURE__ */ new Set());
        for (const O of _.values)
          v[b].add(O);
      }
    }
    return v;
  });
  const r = (g) => {
    const v = new US(["shape", "payload", "ctx"]), { keys: b, optionalKeys: _ } = t.value, O = (k) => {
      const C = Wo(k);
      return `shape[${C}]._zod.run({ value: input[${C}], issues: [] }, ctx)`;
    };
    v.write("const input = payload.value;");
    const E = /* @__PURE__ */ Object.create(null);
    for (const k of b)
      E[k] = fm(15);
    v.write("const newResult = {}");
    for (const k of b)
      if (_.has(k)) {
        const C = E[k];
        v.write(`const ${C} = ${O(k)};`);
        const A = Wo(k);
        v.write(`
        if (${C}.issues.length) {
          if (input[${A}] === undefined) {
            if (${A} in input) {
              newResult[${A}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${C}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${A}, ...iss.path] : [${A}],
              }))
            );
          }
        } else if (${C}.value === undefined) {
          if (${A} in input) newResult[${A}] = undefined;
        } else {
          newResult[${A}] = ${C}.value;
        }
        `);
      } else {
        const C = E[k];
        v.write(`const ${C} = ${O(k)};`), v.write(`
          if (${C}.issues.length) payload.issues = payload.issues.concat(${C}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${Wo(k)}, ...iss.path] : [${Wo(k)}]
          })));`), v.write(`newResult[${Wo(k)}] = ${C}.value`);
      }
    v.write("payload.value = newResult;"), v.write("return payload;");
    const S = v.compile();
    return (k, C) => S(g, k, C);
  };
  let o;
  const a = Ya, u = !hm.jitless, c = u && DT.value, { catchall: f } = e;
  let d;
  n._zod.parse = (g, v) => {
    d ?? (d = t.value);
    const b = g.value;
    if (!a(b))
      return g.issues.push({
        expected: "object",
        code: "invalid_type",
        input: b,
        inst: n
      }), g;
    const _ = [];
    if (u && c && (v == null ? void 0 : v.async) === !1 && v.jitless !== !0)
      o || (o = r(e.shape)), g = o(g, v);
    else {
      g.value = {};
      const C = d.shape;
      for (const A of d.keys) {
        const N = C[A], L = N._zod.run({ value: b[A], issues: [] }, v), F = N._zod.optin === "optional" && N._zod.optout === "optional";
        L instanceof Promise ? _.push(L.then((H) => F ? u0(H, g, A, b) : Pa(H, g, A))) : F ? u0(L, g, A, b) : Pa(L, g, A);
      }
    }
    if (!f)
      return _.length ? Promise.all(_).then(() => g) : g;
    const O = [], E = d.keySet, S = f._zod, k = S.def.type;
    for (const C of Object.keys(b)) {
      if (E.has(C))
        continue;
      if (k === "never") {
        O.push(C);
        continue;
      }
      const A = S.run({ value: b[C], issues: [] }, v);
      A instanceof Promise ? _.push(A.then((N) => Pa(N, g, C))) : Pa(A, g, C);
    }
    return O.length && g.issues.push({
      code: "unrecognized_keys",
      keys: O,
      input: b,
      inst: n
    }), _.length ? Promise.all(_).then(() => g) : g;
  };
});
function l0(n, e, t, r) {
  for (const o of n)
    if (o.issues.length === 0)
      return e.value = o.value, e;
  return e.issues.push({
    code: "invalid_union",
    input: e.value,
    inst: t,
    errors: n.map((o) => o.issues.map((a) => ni(a, r, ti())))
  }), e;
}
const Im = /* @__PURE__ */ K("$ZodUnion", (n, e) => {
  ct.init(n, e), pt(n._zod, "values", () => {
    if (e.options.every((t) => t._zod.values))
      return new Set(e.options.flatMap((t) => Array.from(t._zod.values)));
  }), pt(n._zod, "pattern", () => {
    if (e.options.every((t) => t._zod.pattern)) {
      const t = e.options.map((r) => r._zod.pattern);
      return new RegExp(`^(${t.map((r) => Ah(r.source)).join("|")})$`);
    }
  }), n._zod.parse = (t, r) => {
    let o = !1;
    const a = [];
    for (const u of e.options) {
      const h = u._zod.run({
        value: t.value,
        issues: []
      }, r);
      if (h instanceof Promise)
        a.push(h), o = !0;
      else {
        if (h.issues.length === 0)
          return h;
        a.push(h);
      }
    }
    return o ? Promise.all(a).then((u) => l0(u, t, n, r)) : l0(a, t, n, r);
  };
}), bC = /* @__PURE__ */ K("$ZodDiscriminatedUnion", (n, e) => {
  Im.init(n, e);
  const t = n._zod.parse;
  pt(n._zod, "propValues", () => {
    const o = {};
    for (const a of e.options) {
      const u = a._zod.propValues;
      if (!u || Object.keys(u).length === 0)
        throw new Error(`Invalid discriminated union option at index "${e.options.indexOf(a)}"`);
      for (const [h, c] of Object.entries(u)) {
        o[h] || (o[h] = /* @__PURE__ */ new Set());
        for (const f of c)
          o[h].add(f);
      }
    }
    return o;
  });
  const r = Mh(() => {
    const o = e.options, a = /* @__PURE__ */ new Map();
    for (const u of o) {
      const h = u._zod.propValues[e.discriminator];
      if (!h || h.size === 0)
        throw new Error(`Invalid discriminated union option at index "${e.options.indexOf(u)}"`);
      for (const c of h) {
        if (a.has(c))
          throw new Error(`Duplicate discriminator value "${String(c)}"`);
        a.set(c, u);
      }
    }
    return a;
  });
  n._zod.parse = (o, a) => {
    const u = o.value;
    if (!Ya(u))
      return o.issues.push({
        code: "invalid_type",
        expected: "object",
        input: u,
        inst: n
      }), o;
    const h = r.value.get(u == null ? void 0 : u[e.discriminator]);
    return h ? h._zod.run(o, a) : e.unionFallback ? t(o, a) : (o.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      input: u,
      path: [e.discriminator],
      inst: n
    }), o);
  };
}), wC = /* @__PURE__ */ K("$ZodIntersection", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => {
    const { value: o } = t, a = e.left._zod.run({ value: o, issues: [] }, r), u = e.right._zod.run({ value: o, issues: [] }, r);
    return a instanceof Promise || u instanceof Promise ? Promise.all([a, u]).then(([c, f]) => c0(t, c, f)) : c0(t, a, u);
  };
});
function Uc(n, e) {
  if (n === e)
    return { valid: !0, data: n };
  if (n instanceof Date && e instanceof Date && +n == +e)
    return { valid: !0, data: n };
  if (Fc(n) && Fc(e)) {
    const t = Object.keys(e), r = Object.keys(n).filter((a) => t.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of r) {
      const u = Uc(n[a], e[a]);
      if (!u.valid)
        return {
          valid: !1,
          mergeErrorPath: [a, ...u.mergeErrorPath]
        };
      o[a] = u.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(n) && Array.isArray(e)) {
    if (n.length !== e.length)
      return { valid: !1, mergeErrorPath: [] };
    const t = [];
    for (let r = 0; r < n.length; r++) {
      const o = n[r], a = e[r], u = Uc(o, a);
      if (!u.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...u.mergeErrorPath]
        };
      t.push(u.data);
    }
    return { valid: !0, data: t };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function c0(n, e, t) {
  if (e.issues.length && n.issues.push(...e.issues), t.issues.length && n.issues.push(...t.issues), ts(n))
    return n;
  const r = Uc(e.value, t.value);
  if (!r.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);
  return n.value = r.data, n;
}
const xC = /* @__PURE__ */ K("$ZodRecord", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => {
    const o = t.value;
    if (!Fc(o))
      return t.issues.push({
        expected: "record",
        code: "invalid_type",
        input: o,
        inst: n
      }), t;
    const a = [];
    if (e.keyType._zod.values) {
      const u = e.keyType._zod.values;
      t.value = {};
      for (const c of u)
        if (typeof c == "string" || typeof c == "number" || typeof c == "symbol") {
          const f = e.valueType._zod.run({ value: o[c], issues: [] }, r);
          f instanceof Promise ? a.push(f.then((d) => {
            d.issues.length && t.issues.push(...Mi(c, d.issues)), t.value[c] = d.value;
          })) : (f.issues.length && t.issues.push(...Mi(c, f.issues)), t.value[c] = f.value);
        }
      let h;
      for (const c in o)
        u.has(c) || (h = h ?? [], h.push(c));
      h && h.length > 0 && t.issues.push({
        code: "unrecognized_keys",
        input: o,
        inst: n,
        keys: h
      });
    } else {
      t.value = {};
      for (const u of Reflect.ownKeys(o)) {
        if (u === "__proto__")
          continue;
        const h = e.keyType._zod.run({ value: u, issues: [] }, r);
        if (h instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (h.issues.length) {
          t.issues.push({
            origin: "record",
            code: "invalid_key",
            issues: h.issues.map((f) => ni(f, r, ti())),
            input: u,
            path: [u],
            inst: n
          }), t.value[h.value] = h.value;
          continue;
        }
        const c = e.valueType._zod.run({ value: o[u], issues: [] }, r);
        c instanceof Promise ? a.push(c.then((f) => {
          f.issues.length && t.issues.push(...Mi(u, f.issues)), t.value[h.value] = f.value;
        })) : (c.issues.length && t.issues.push(...Mi(u, c.issues)), t.value[h.value] = c.value);
      }
    }
    return a.length ? Promise.all(a).then(() => t) : t;
  };
}), TC = /* @__PURE__ */ K("$ZodEnum", (n, e) => {
  ct.init(n, e);
  const t = NT(e.entries);
  n._zod.values = new Set(t), n._zod.pattern = new RegExp(`^(${t.filter((r) => LT.has(typeof r)).map((r) => typeof r == "string" ? Ts(r) : r.toString()).join("|")})$`), n._zod.parse = (r, o) => {
    const a = r.value;
    return n._zod.values.has(a) || r.issues.push({
      code: "invalid_value",
      values: t,
      input: a,
      inst: n
    }), r;
  };
}), SC = /* @__PURE__ */ K("$ZodLiteral", (n, e) => {
  ct.init(n, e), n._zod.values = new Set(e.values), n._zod.pattern = new RegExp(`^(${e.values.map((t) => typeof t == "string" ? Ts(t) : t ? t.toString() : String(t)).join("|")})$`), n._zod.parse = (t, r) => {
    const o = t.value;
    return n._zod.values.has(o) || t.issues.push({
      code: "invalid_value",
      values: e.values,
      input: o,
      inst: n
    }), t;
  };
}), CC = /* @__PURE__ */ K("$ZodTransform", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => {
    const o = e.transform(t.value, t);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((u) => (t.value = u, t));
    if (o instanceof Promise)
      throw new ls();
    return t.value = o, t;
  };
}), Pm = /* @__PURE__ */ K("$ZodOptional", (n, e) => {
  ct.init(n, e), n._zod.optin = "optional", n._zod.optout = "optional", pt(n._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, void 0]) : void 0), pt(n._zod, "pattern", () => {
    const t = e.innerType._zod.pattern;
    return t ? new RegExp(`^(${Ah(t.source)})?$`) : void 0;
  }), n._zod.parse = (t, r) => t.value === void 0 ? t : e.innerType._zod.run(t, r);
}), MC = /* @__PURE__ */ K("$ZodNullable", (n, e) => {
  ct.init(n, e), pt(n._zod, "optin", () => e.innerType._zod.optin), pt(n._zod, "optout", () => e.innerType._zod.optout), pt(n._zod, "pattern", () => {
    const t = e.innerType._zod.pattern;
    return t ? new RegExp(`^(${Ah(t.source)}|null)$`) : void 0;
  }), pt(n._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, null]) : void 0), n._zod.parse = (t, r) => t.value === null ? t : e.innerType._zod.run(t, r);
}), EC = /* @__PURE__ */ K("$ZodDefault", (n, e) => {
  ct.init(n, e), n._zod.optin = "optional", pt(n._zod, "values", () => e.innerType._zod.values), n._zod.parse = (t, r) => {
    if (t.value === void 0)
      return t.value = e.defaultValue, t;
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => h0(a, e)) : h0(o, e);
  };
});
function h0(n, e) {
  return n.value === void 0 && (n.value = e.defaultValue), n;
}
const AC = /* @__PURE__ */ K("$ZodPrefault", (n, e) => {
  ct.init(n, e), n._zod.optin = "optional", pt(n._zod, "values", () => e.innerType._zod.values), n._zod.parse = (t, r) => (t.value === void 0 && (t.value = e.defaultValue), e.innerType._zod.run(t, r));
}), IC = /* @__PURE__ */ K("$ZodNonOptional", (n, e) => {
  ct.init(n, e), pt(n._zod, "values", () => {
    const t = e.innerType._zod.values;
    return t ? new Set([...t].filter((r) => r !== void 0)) : void 0;
  }), n._zod.parse = (t, r) => {
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => f0(a, n)) : f0(o, n);
  };
});
function f0(n, e) {
  return !n.issues.length && n.value === void 0 && n.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: n.value,
    inst: e
  }), n;
}
const PC = /* @__PURE__ */ K("$ZodCatch", (n, e) => {
  ct.init(n, e), pt(n._zod, "optin", () => e.innerType._zod.optin), pt(n._zod, "optout", () => e.innerType._zod.optout), pt(n._zod, "values", () => e.innerType._zod.values), n._zod.parse = (t, r) => {
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => (t.value = a.value, a.issues.length && (t.value = e.catchValue({
      ...t,
      error: {
        issues: a.issues.map((u) => ni(u, r, ti()))
      },
      input: t.value
    }), t.issues = []), t)) : (t.value = o.value, o.issues.length && (t.value = e.catchValue({
      ...t,
      error: {
        issues: o.issues.map((a) => ni(a, r, ti()))
      },
      input: t.value
    }), t.issues = []), t);
  };
}), OC = /* @__PURE__ */ K("$ZodPipe", (n, e) => {
  ct.init(n, e), pt(n._zod, "values", () => e.in._zod.values), pt(n._zod, "optin", () => e.in._zod.optin), pt(n._zod, "optout", () => e.out._zod.optout), n._zod.parse = (t, r) => {
    const o = e.in._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => d0(a, e, r)) : d0(o, e, r);
  };
});
function d0(n, e, t) {
  return ts(n) ? n : e.out._zod.run({ value: n.value, issues: n.issues }, t);
}
const kC = /* @__PURE__ */ K("$ZodReadonly", (n, e) => {
  ct.init(n, e), pt(n._zod, "propValues", () => e.innerType._zod.propValues), pt(n._zod, "optin", () => e.innerType._zod.optin), pt(n._zod, "optout", () => e.innerType._zod.optout), n._zod.parse = (t, r) => {
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then(p0) : p0(o);
  };
});
function p0(n) {
  return n.value = Object.freeze(n.value), n;
}
const $C = /* @__PURE__ */ K("$ZodCustom", (n, e) => {
  mn.init(n, e), ct.init(n, e), n._zod.parse = (t, r) => t, n._zod.check = (t) => {
    const r = t.value, o = e.fn(r);
    if (o instanceof Promise)
      return o.then((a) => g0(a, t, r, n));
    g0(o, t, r, n);
  };
});
function g0(n, e, t, r) {
  if (!n) {
    const o = {
      code: "custom",
      input: t,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), e.issues.push(cs(o));
  }
}
class NC {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(e, ...t) {
    const r = t[0];
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
    const t = e._zod.parent;
    if (t) {
      const r = { ...this.get(t) ?? {} };
      return delete r.id, { ...r, ...this._map.get(e) };
    }
    return this._map.get(e);
  }
  has(e) {
    return this._map.has(e);
  }
}
function RC() {
  return new NC();
}
const Oa = /* @__PURE__ */ RC();
function zC(n, e) {
  return new n({
    type: "string",
    ...me(e)
  });
}
function DC(n, e) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function m0(n, e) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function LC(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function BC(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...me(e)
  });
}
function FC(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...me(e)
  });
}
function UC(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...me(e)
  });
}
function Om(n, e) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function ZC(n, e) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function qC(n, e) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function HC(n, e) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function WC(n, e) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function GC(n, e) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function jC(n, e) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function VC(n, e) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function KC(n, e) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function JC(n, e) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function YC(n, e) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function QC(n, e) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function XC(n, e) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function eM(n, e) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function tM(n, e) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function nM(n, e) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function rM(n, e) {
  return new n({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...me(e)
  });
}
function iM(n, e) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...me(e)
  });
}
function oM(n, e) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...me(e)
  });
}
function sM(n, e) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...me(e)
  });
}
function aM(n, e) {
  return new n({
    type: "number",
    checks: [],
    ...me(e)
  });
}
function uM(n, e) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...me(e)
  });
}
function lM(n, e) {
  return new n({
    type: "boolean",
    ...me(e)
  });
}
function cM(n, e) {
  return new n({
    type: "null",
    ...me(e)
  });
}
function hM(n) {
  return new n({
    type: "unknown"
  });
}
function fM(n, e) {
  return new n({
    type: "never",
    ...me(e)
  });
}
function v0(n, e) {
  return new Sm({
    check: "less_than",
    ...me(e),
    value: n,
    inclusive: !1
  });
}
function cc(n, e) {
  return new Sm({
    check: "less_than",
    ...me(e),
    value: n,
    inclusive: !0
  });
}
function _0(n, e) {
  return new Cm({
    check: "greater_than",
    ...me(e),
    value: n,
    inclusive: !1
  });
}
function hc(n, e) {
  return new Cm({
    check: "greater_than",
    ...me(e),
    value: n,
    inclusive: !0
  });
}
function y0(n, e) {
  return new IS({
    check: "multiple_of",
    ...me(e),
    value: n
  });
}
function km(n, e) {
  return new OS({
    check: "max_length",
    ...me(e),
    maximum: n
  });
}
function Qa(n, e) {
  return new kS({
    check: "min_length",
    ...me(e),
    minimum: n
  });
}
function $m(n, e) {
  return new $S({
    check: "length_equals",
    ...me(e),
    length: n
  });
}
function dM(n, e) {
  return new NS({
    check: "string_format",
    format: "regex",
    ...me(e),
    pattern: n
  });
}
function pM(n) {
  return new RS({
    check: "string_format",
    format: "lowercase",
    ...me(n)
  });
}
function gM(n) {
  return new zS({
    check: "string_format",
    format: "uppercase",
    ...me(n)
  });
}
function mM(n, e) {
  return new DS({
    check: "string_format",
    format: "includes",
    ...me(e),
    includes: n
  });
}
function vM(n, e) {
  return new LS({
    check: "string_format",
    format: "starts_with",
    ...me(e),
    prefix: n
  });
}
function _M(n, e) {
  return new BS({
    check: "string_format",
    format: "ends_with",
    ...me(e),
    suffix: n
  });
}
function Ss(n) {
  return new FS({
    check: "overwrite",
    tx: n
  });
}
function yM(n) {
  return Ss((e) => e.normalize(n));
}
function bM() {
  return Ss((n) => n.trim());
}
function wM() {
  return Ss((n) => n.toLowerCase());
}
function xM() {
  return Ss((n) => n.toUpperCase());
}
function TM(n, e, t) {
  return new n({
    type: "array",
    element: e,
    // get element() {
    //   return element;
    // },
    ...me(t)
  });
}
function SM(n, e, t) {
  const r = me(t);
  return r.abort ?? (r.abort = !0), new n({
    type: "custom",
    check: "custom",
    fn: e,
    ...r
  });
}
function CM(n, e, t) {
  return new n({
    type: "custom",
    check: "custom",
    fn: e,
    ...me(t)
  });
}
const MM = /* @__PURE__ */ K("ZodISODateTime", (n, e) => {
  eC.init(n, e), bt.init(n, e);
});
function Zc(n) {
  return rM(MM, n);
}
const EM = /* @__PURE__ */ K("ZodISODate", (n, e) => {
  tC.init(n, e), bt.init(n, e);
});
function AM(n) {
  return iM(EM, n);
}
const IM = /* @__PURE__ */ K("ZodISOTime", (n, e) => {
  nC.init(n, e), bt.init(n, e);
});
function PM(n) {
  return oM(IM, n);
}
const OM = /* @__PURE__ */ K("ZodISODuration", (n, e) => {
  rC.init(n, e), bt.init(n, e);
});
function kM(n) {
  return sM(OM, n);
}
const $M = (n, e) => {
  gm.init(n, e), n.name = "ZodError", Object.defineProperties(n, {
    format: {
      value: (t) => VT(n, t)
      // enumerable: false,
    },
    flatten: {
      value: (t) => jT(n, t)
      // enumerable: false,
    },
    addIssue: {
      value: (t) => n.issues.push(t)
      // enumerable: false,
    },
    addIssues: {
      value: (t) => n.issues.push(...t)
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return n.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, Pu = K("ZodError", $M, {
  Parent: Error
}), NM = /* @__PURE__ */ YT(Pu), RM = /* @__PURE__ */ QT(Pu), zM = /* @__PURE__ */ vm(Pu), DM = /* @__PURE__ */ _m(Pu), yt = /* @__PURE__ */ K("ZodType", (n, e) => (ct.init(n, e), n.def = e, Object.defineProperty(n, "_def", { value: e }), n.check = (...t) => n.clone(
  {
    ...e,
    checks: [
      ...e.checks ?? [],
      ...t.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
    ]
  }
  // { parent: true }
), n.clone = (t, r) => Ri(n, t, r), n.brand = () => n, n.register = (t, r) => (t.add(n, r), n), n.parse = (t, r) => NM(n, t, r, { callee: n.parse }), n.safeParse = (t, r) => zM(n, t, r), n.parseAsync = async (t, r) => RM(n, t, r, { callee: n.parseAsync }), n.safeParseAsync = async (t, r) => DM(n, t, r), n.spa = n.safeParseAsync, n.refine = (t, r) => n.check(AE(t, r)), n.superRefine = (t) => n.check(IE(t)), n.overwrite = (t) => n.check(Ss(t)), n.optional = () => Xa(n), n.nullable = () => x0(n), n.nullish = () => Xa(x0(n)), n.nonoptional = (t) => wE(n, t), n.array = () => nt(n), n.or = (t) => uE([n, t]), n.and = (t) => hE(n, t), n.transform = (t) => T0(n, gE(t)), n.default = (t) => _E(n, t), n.prefault = (t) => bE(n, t), n.catch = (t) => TE(n, t), n.pipe = (t) => T0(n, t), n.readonly = () => ME(n), n.describe = (t) => {
  const r = n.clone();
  return Oa.add(r, { description: t }), r;
}, Object.defineProperty(n, "description", {
  get() {
    var t;
    return (t = Oa.get(n)) == null ? void 0 : t.description;
  },
  configurable: !0
}), n.meta = (...t) => {
  if (t.length === 0)
    return Oa.get(n);
  const r = n.clone();
  return Oa.add(r, t[0]), r;
}, n.isOptional = () => n.safeParse(void 0).success, n.isNullable = () => n.safeParse(null).success, n)), Nm = /* @__PURE__ */ K("_ZodString", (n, e) => {
  Ph.init(n, e), yt.init(n, e);
  const t = n._zod.bag;
  n.format = t.format ?? null, n.minLength = t.minimum ?? null, n.maxLength = t.maximum ?? null, n.regex = (...r) => n.check(dM(...r)), n.includes = (...r) => n.check(mM(...r)), n.startsWith = (...r) => n.check(vM(...r)), n.endsWith = (...r) => n.check(_M(...r)), n.min = (...r) => n.check(Qa(...r)), n.max = (...r) => n.check(km(...r)), n.length = (...r) => n.check($m(...r)), n.nonempty = (...r) => n.check(Qa(1, ...r)), n.lowercase = (r) => n.check(pM(r)), n.uppercase = (r) => n.check(gM(r)), n.trim = () => n.check(bM()), n.normalize = (...r) => n.check(yM(...r)), n.toLowerCase = () => n.check(wM()), n.toUpperCase = () => n.check(xM());
}), LM = /* @__PURE__ */ K("ZodString", (n, e) => {
  Ph.init(n, e), Nm.init(n, e), n.email = (t) => n.check(DC(BM, t)), n.url = (t) => n.check(Om(Rm, t)), n.jwt = (t) => n.check(nM(eE, t)), n.emoji = (t) => n.check(ZC(FM, t)), n.guid = (t) => n.check(m0(b0, t)), n.uuid = (t) => n.check(LC(ka, t)), n.uuidv4 = (t) => n.check(BC(ka, t)), n.uuidv6 = (t) => n.check(FC(ka, t)), n.uuidv7 = (t) => n.check(UC(ka, t)), n.nanoid = (t) => n.check(qC(UM, t)), n.guid = (t) => n.check(m0(b0, t)), n.cuid = (t) => n.check(HC(ZM, t)), n.cuid2 = (t) => n.check(WC(qM, t)), n.ulid = (t) => n.check(GC(HM, t)), n.base64 = (t) => n.check(XC(YM, t)), n.base64url = (t) => n.check(eM(QM, t)), n.xid = (t) => n.check(jC(WM, t)), n.ksuid = (t) => n.check(VC(GM, t)), n.ipv4 = (t) => n.check(KC(jM, t)), n.ipv6 = (t) => n.check(JC(VM, t)), n.cidrv4 = (t) => n.check(YC(KM, t)), n.cidrv6 = (t) => n.check(QC(JM, t)), n.e164 = (t) => n.check(tM(XM, t)), n.datetime = (t) => n.check(Zc(t)), n.date = (t) => n.check(AM(t)), n.time = (t) => n.check(PM(t)), n.duration = (t) => n.check(kM(t));
});
function qe(n) {
  return zC(LM, n);
}
const bt = /* @__PURE__ */ K("ZodStringFormat", (n, e) => {
  gt.init(n, e), Nm.init(n, e);
}), BM = /* @__PURE__ */ K("ZodEmail", (n, e) => {
  WS.init(n, e), bt.init(n, e);
}), b0 = /* @__PURE__ */ K("ZodGUID", (n, e) => {
  qS.init(n, e), bt.init(n, e);
}), ka = /* @__PURE__ */ K("ZodUUID", (n, e) => {
  HS.init(n, e), bt.init(n, e);
}), Rm = /* @__PURE__ */ K("ZodURL", (n, e) => {
  GS.init(n, e), bt.init(n, e);
});
function zm(n) {
  return Om(Rm, n);
}
const FM = /* @__PURE__ */ K("ZodEmoji", (n, e) => {
  jS.init(n, e), bt.init(n, e);
}), UM = /* @__PURE__ */ K("ZodNanoID", (n, e) => {
  VS.init(n, e), bt.init(n, e);
}), ZM = /* @__PURE__ */ K("ZodCUID", (n, e) => {
  KS.init(n, e), bt.init(n, e);
}), qM = /* @__PURE__ */ K("ZodCUID2", (n, e) => {
  JS.init(n, e), bt.init(n, e);
}), HM = /* @__PURE__ */ K("ZodULID", (n, e) => {
  YS.init(n, e), bt.init(n, e);
}), WM = /* @__PURE__ */ K("ZodXID", (n, e) => {
  QS.init(n, e), bt.init(n, e);
}), GM = /* @__PURE__ */ K("ZodKSUID", (n, e) => {
  XS.init(n, e), bt.init(n, e);
}), jM = /* @__PURE__ */ K("ZodIPv4", (n, e) => {
  iC.init(n, e), bt.init(n, e);
}), VM = /* @__PURE__ */ K("ZodIPv6", (n, e) => {
  oC.init(n, e), bt.init(n, e);
}), KM = /* @__PURE__ */ K("ZodCIDRv4", (n, e) => {
  sC.init(n, e), bt.init(n, e);
}), JM = /* @__PURE__ */ K("ZodCIDRv6", (n, e) => {
  aC.init(n, e), bt.init(n, e);
}), YM = /* @__PURE__ */ K("ZodBase64", (n, e) => {
  uC.init(n, e), bt.init(n, e);
}), QM = /* @__PURE__ */ K("ZodBase64URL", (n, e) => {
  cC.init(n, e), bt.init(n, e);
}), XM = /* @__PURE__ */ K("ZodE164", (n, e) => {
  hC.init(n, e), bt.init(n, e);
}), eE = /* @__PURE__ */ K("ZodJWT", (n, e) => {
  dC.init(n, e), bt.init(n, e);
}), Dm = /* @__PURE__ */ K("ZodNumber", (n, e) => {
  Em.init(n, e), yt.init(n, e), n.gt = (r, o) => n.check(_0(r, o)), n.gte = (r, o) => n.check(hc(r, o)), n.min = (r, o) => n.check(hc(r, o)), n.lt = (r, o) => n.check(v0(r, o)), n.lte = (r, o) => n.check(cc(r, o)), n.max = (r, o) => n.check(cc(r, o)), n.int = (r) => n.check(w0(r)), n.safe = (r) => n.check(w0(r)), n.positive = (r) => n.check(_0(0, r)), n.nonnegative = (r) => n.check(hc(0, r)), n.negative = (r) => n.check(v0(0, r)), n.nonpositive = (r) => n.check(cc(0, r)), n.multipleOf = (r, o) => n.check(y0(r, o)), n.step = (r, o) => n.check(y0(r, o)), n.finite = () => n;
  const t = n._zod.bag;
  n.minValue = Math.max(t.minimum ?? Number.NEGATIVE_INFINITY, t.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, n.maxValue = Math.min(t.maximum ?? Number.POSITIVE_INFINITY, t.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, n.isInt = (t.format ?? "").includes("int") || Number.isSafeInteger(t.multipleOf ?? 0.5), n.isFinite = !0, n.format = t.format ?? null;
});
function V(n) {
  return aM(Dm, n);
}
const tE = /* @__PURE__ */ K("ZodNumberFormat", (n, e) => {
  pC.init(n, e), Dm.init(n, e);
});
function w0(n) {
  return uM(tE, n);
}
const nE = /* @__PURE__ */ K("ZodBoolean", (n, e) => {
  gC.init(n, e), yt.init(n, e);
});
function vt(n) {
  return lM(nE, n);
}
const rE = /* @__PURE__ */ K("ZodNull", (n, e) => {
  mC.init(n, e), yt.init(n, e);
});
function Ke(n) {
  return cM(rE, n);
}
const iE = /* @__PURE__ */ K("ZodUnknown", (n, e) => {
  vC.init(n, e), yt.init(n, e);
});
function qc() {
  return hM(iE);
}
const oE = /* @__PURE__ */ K("ZodNever", (n, e) => {
  _C.init(n, e), yt.init(n, e);
});
function Lm(n) {
  return fM(oE, n);
}
const sE = /* @__PURE__ */ K("ZodArray", (n, e) => {
  yC.init(n, e), yt.init(n, e), n.element = e.element, n.min = (t, r) => n.check(Qa(t, r)), n.nonempty = (t) => n.check(Qa(1, t)), n.max = (t, r) => n.check(km(t, r)), n.length = (t, r) => n.check($m(t, r)), n.unwrap = () => n.element;
});
function nt(n, e) {
  return TM(sE, n, e);
}
const Oh = /* @__PURE__ */ K("ZodObject", (n, e) => {
  Am.init(n, e), yt.init(n, e), pt(n, "shape", () => e.shape), n.keyof = () => Bt(Object.keys(n._zod.def.shape)), n.catchall = (t) => n.clone({ ...n._zod.def, catchall: t }), n.passthrough = () => n.clone({ ...n._zod.def, catchall: qc() }), n.loose = () => n.clone({ ...n._zod.def, catchall: qc() }), n.strict = () => n.clone({ ...n._zod.def, catchall: Lm() }), n.strip = () => n.clone({ ...n._zod.def, catchall: void 0 }), n.extend = (t) => qT(n, t), n.merge = (t) => HT(n, t), n.pick = (t) => UT(n, t), n.omit = (t) => ZT(n, t), n.partial = (...t) => WT(Fm, n, t[0]), n.required = (...t) => GT(Um, n, t[0]);
});
function ki(n, e) {
  const t = {
    type: "object",
    get shape() {
      return xs(this, "shape", { ...n }), this.shape;
    },
    ...me(e)
  };
  return new Oh(t);
}
function Ie(n, e) {
  return new Oh({
    type: "object",
    get shape() {
      return xs(this, "shape", { ...n }), this.shape;
    },
    catchall: Lm(),
    ...me(e)
  });
}
function aE(n, e) {
  return new Oh({
    type: "object",
    get shape() {
      return xs(this, "shape", { ...n }), this.shape;
    },
    catchall: qc(),
    ...me(e)
  });
}
const Bm = /* @__PURE__ */ K("ZodUnion", (n, e) => {
  Im.init(n, e), yt.init(n, e), n.options = e.options;
});
function uE(n, e) {
  return new Bm({
    type: "union",
    options: n,
    ...me(e)
  });
}
const lE = /* @__PURE__ */ K("ZodDiscriminatedUnion", (n, e) => {
  Bm.init(n, e), bC.init(n, e);
});
function kh(n, e, t) {
  return new lE({
    type: "union",
    options: e,
    discriminator: n,
    ...me(t)
  });
}
const cE = /* @__PURE__ */ K("ZodIntersection", (n, e) => {
  wC.init(n, e), yt.init(n, e);
});
function hE(n, e) {
  return new cE({
    type: "intersection",
    left: n,
    right: e
  });
}
const fE = /* @__PURE__ */ K("ZodRecord", (n, e) => {
  xC.init(n, e), yt.init(n, e), n.keyType = e.keyType, n.valueType = e.valueType;
});
function Er(n, e, t) {
  return new fE({
    type: "record",
    keyType: n,
    valueType: e,
    ...me(t)
  });
}
const Hc = /* @__PURE__ */ K("ZodEnum", (n, e) => {
  TC.init(n, e), yt.init(n, e), n.enum = e.entries, n.options = Object.values(e.entries);
  const t = new Set(Object.keys(e.entries));
  n.extract = (r, o) => {
    const a = {};
    for (const u of r)
      if (t.has(u))
        a[u] = e.entries[u];
      else
        throw new Error(`Key ${u} not found in enum`);
    return new Hc({
      ...e,
      checks: [],
      ...me(o),
      entries: a
    });
  }, n.exclude = (r, o) => {
    const a = { ...e.entries };
    for (const u of r)
      if (t.has(u))
        delete a[u];
      else
        throw new Error(`Key ${u} not found in enum`);
    return new Hc({
      ...e,
      checks: [],
      ...me(o),
      entries: a
    });
  };
});
function Bt(n, e) {
  const t = Array.isArray(n) ? Object.fromEntries(n.map((r) => [r, r])) : n;
  return new Hc({
    type: "enum",
    entries: t,
    ...me(e)
  });
}
const dE = /* @__PURE__ */ K("ZodLiteral", (n, e) => {
  SC.init(n, e), yt.init(n, e), n.values = new Set(e.values), Object.defineProperty(n, "value", {
    get() {
      if (e.values.length > 1)
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      return e.values[0];
    }
  });
});
function Pi(n, e) {
  return new dE({
    type: "literal",
    values: Array.isArray(n) ? n : [n],
    ...me(e)
  });
}
const pE = /* @__PURE__ */ K("ZodTransform", (n, e) => {
  CC.init(n, e), yt.init(n, e), n._zod.parse = (t, r) => {
    t.addIssue = (a) => {
      if (typeof a == "string")
        t.issues.push(cs(a, t.value, e));
      else {
        const u = a;
        u.fatal && (u.continue = !1), u.code ?? (u.code = "custom"), u.input ?? (u.input = t.value), u.inst ?? (u.inst = n), u.continue ?? (u.continue = !0), t.issues.push(cs(u));
      }
    };
    const o = e.transform(t.value, t);
    return o instanceof Promise ? o.then((a) => (t.value = a, t)) : (t.value = o, t);
  };
});
function gE(n) {
  return new pE({
    type: "transform",
    transform: n
  });
}
const Fm = /* @__PURE__ */ K("ZodOptional", (n, e) => {
  Pm.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function Xa(n) {
  return new Fm({
    type: "optional",
    innerType: n
  });
}
const mE = /* @__PURE__ */ K("ZodNullable", (n, e) => {
  MC.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function x0(n) {
  return new mE({
    type: "nullable",
    innerType: n
  });
}
const vE = /* @__PURE__ */ K("ZodDefault", (n, e) => {
  EC.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType, n.removeDefault = n.unwrap;
});
function _E(n, e) {
  return new vE({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof e == "function" ? e() : e;
    }
  });
}
const yE = /* @__PURE__ */ K("ZodPrefault", (n, e) => {
  AC.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function bE(n, e) {
  return new yE({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof e == "function" ? e() : e;
    }
  });
}
const Um = /* @__PURE__ */ K("ZodNonOptional", (n, e) => {
  IC.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function wE(n, e) {
  return new Um({
    type: "nonoptional",
    innerType: n,
    ...me(e)
  });
}
const xE = /* @__PURE__ */ K("ZodCatch", (n, e) => {
  PC.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType, n.removeCatch = n.unwrap;
});
function TE(n, e) {
  return new xE({
    type: "catch",
    innerType: n,
    catchValue: typeof e == "function" ? e : () => e
  });
}
const SE = /* @__PURE__ */ K("ZodPipe", (n, e) => {
  OC.init(n, e), yt.init(n, e), n.in = e.in, n.out = e.out;
});
function T0(n, e) {
  return new SE({
    type: "pipe",
    in: n,
    out: e
    // ...util.normalizeParams(params),
  });
}
const CE = /* @__PURE__ */ K("ZodReadonly", (n, e) => {
  kC.init(n, e), yt.init(n, e);
});
function ME(n) {
  return new CE({
    type: "readonly",
    innerType: n
  });
}
const $h = /* @__PURE__ */ K("ZodCustom", (n, e) => {
  $C.init(n, e), yt.init(n, e);
});
function EE(n, e) {
  const t = new mn({
    check: "custom",
    ...me(e)
  });
  return t._zod.check = n, t;
}
function Zm(n, e) {
  return SM($h, () => !0, e);
}
function AE(n, e = {}) {
  return CM($h, n, e);
}
function IE(n, e) {
  const t = EE((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(cs(o, r.value, t._zod.def));
    else {
      const a = o;
      a.fatal && (a.continue = !1), a.code ?? (a.code = "custom"), a.input ?? (a.input = r.value), a.inst ?? (a.inst = t), a.continue ?? (a.continue = !t._zod.def.abort), r.issues.push(cs(a));
    }
  }, n(r.value, r)), e);
  return t;
}
function S0(n, e = {
  error: `Input not instance of ${n.name}`
}) {
  const t = new $h({
    type: "custom",
    check: "custom",
    fn: (r) => r instanceof n,
    abort: !0,
    ...me(e)
  });
  return t._zod.bag.Class = n, t;
}
function PE(n) {
  let t = new ot(n).to("srgb").toString({ format: "hex" }).toUpperCase();
  return t.length === 4 && (t = `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`), t;
}
const Dt = qe().transform(PE), Wc = kh("colorType", [
  Ie({
    colorType: Pi("solid"),
    value: Dt,
    opacity: V().min(0).max(1).optional()
  }),
  Ie({
    colorType: Pi("gradient"),
    direction: V().min(0).max(360),
    colors: nt(Dt),
    opacity: V().min(0).max(1).optional()
  }),
  Ie({
    colorType: Pi("radial-gradient"),
    colors: nt(Dt),
    opacity: V().min(0).max(1).optional()
  })
]);
Bt([
  "plain",
  "markdown",
  "html"
]);
const OE = Bt([
  "top",
  "top-right",
  "top-left",
  "left",
  "center",
  "right",
  "bottom",
  "bottom-left",
  "bottom-right",
  "automatic"
]), kE = zm({
  protocol: /^https?$/,
  hostname: vS
}), $E = qe().startsWith("data:image/png;base64,"), NE = kE.or($E), RE = Ie({
  x: V(),
  y: V(),
  z: V()
}), zE = Bt([
  "top",
  "top-left",
  "top-right",
  "left",
  "center",
  "right",
  "bottom",
  "bottom-left",
  "bottom-right"
]), DE = Bt(["left", "center", "right"]), LE = Bt(["pulse", "bounce", "shake", "glow", "fill"]), BE = Bt([
  "notification",
  "label",
  "label-success",
  "label-warning",
  "label-danger",
  "count",
  "icon",
  "progress",
  "dot"
]), FE = Bt(["linear", "radial"]), UE = Bt(["vertical", "horizontal", "diagonal"]), ZE = Bt(["round", "bevel", "miter"]), qE = Ie({
  width: V(),
  color: Dt,
  spacing: V()
}), hs = Ie({
  // Basic properties from original TextBlockStyle
  enabled: vt().default(!1).optional(),
  textPath: qe().optional(),
  location: OE.default("top").optional(),
  // Text content
  text: qe().optional(),
  // Font settings
  font: qe().default("Verdana").optional(),
  fontSize: V().default(48).optional(),
  fontWeight: qe().default("normal").optional(),
  lineHeight: V().default(1.2).optional(),
  // Colors
  textColor: Dt.default("#000000").optional(),
  backgroundColor: Wc.or(Dt).optional(),
  // Single border (legacy)
  borderWidth: V().default(0).optional(),
  borderColor: Dt.default("#000000").optional(),
  // Multiple borders
  borders: nt(qE).optional(),
  // Margins
  marginTop: V().default(5).optional(),
  marginBottom: V().default(5).optional(),
  marginLeft: V().default(5).optional(),
  marginRight: V().default(5).optional(),
  // Layout
  textAlign: DE.default("center").optional(),
  cornerRadius: V().default(0).optional(),
  autoSize: vt().default(!0).optional(),
  resolution: V().default(128).optional(),
  billboardMode: V().default(7).optional(),
  // BABYLON.Mesh.BILLBOARDMODE_ALL
  // Position
  position: RE.optional(),
  attachPosition: zE.optional(),
  attachOffset: V().default(0).optional(),
  // Depth fading
  depthFadeEnabled: vt().default(!1).optional(),
  depthFadeNear: V().default(10).optional(),
  depthFadeFar: V().default(50).optional(),
  // Text effects
  textOutline: vt().default(!1).optional(),
  textOutlineWidth: V().default(2).optional(),
  textOutlineColor: Dt.default("#000000").optional(),
  textOutlineJoin: ZE.default("round").optional(),
  textShadow: vt().default(!1).optional(),
  textShadowColor: Dt.default("#000000").optional(),
  textShadowBlur: V().default(4).optional(),
  textShadowOffsetX: V().default(2).optional(),
  textShadowOffsetY: V().default(2).optional(),
  // Background effects
  backgroundPadding: V().default(0).optional(),
  backgroundGradient: vt().default(!1).optional(),
  backgroundGradientType: FE.default("linear").optional(),
  backgroundGradientColors: nt(Dt).optional(),
  backgroundGradientDirection: UE.default("vertical").optional(),
  // Pointer/Arrow
  pointer: vt().default(!1).optional(),
  pointerDirection: Bt(["top", "bottom", "left", "right", "auto"]).default("auto").optional(),
  pointerWidth: V().default(20).optional(),
  pointerHeight: V().default(10).optional(),
  pointerOffset: V().default(0).optional(),
  pointerCurve: vt().default(!1).optional(),
  // Animation
  animation: LE.nullable().default(null).optional(),
  animationSpeed: V().default(1).optional(),
  // Badge
  badge: BE.optional(),
  icon: qe().optional(),
  iconPosition: Bt(["left", "right"]).default("left").optional(),
  progress: V().min(0).max(1).optional(),
  // Smart overflow
  smartOverflow: vt().default(!1).optional(),
  maxNumber: V().default(999).optional(),
  overflowSuffix: qe().default("+").optional(),
  // Legacy compatibility mappings
  size: V().optional(),
  // maps to fontSize
  color: Dt.optional(),
  // maps to textColor
  background: Wc.or(Dt).optional(),
  // maps to backgroundColor
  backgroundCornerRadius: V().optional(),
  // maps to cornerRadius
  margin: V().optional(),
  // maps to all margins
  style: qe().optional()
  // maps to fontWeight (bold, italic, etc.)
});
function HE(n) {
  const e = { ...n };
  return e.size !== void 0 && e.fontSize === void 0 && (e.fontSize = e.size, delete e.size), e.color !== void 0 && e.textColor === void 0 && (e.textColor = e.color, delete e.color), e.background !== void 0 && e.backgroundColor === void 0 && (e.backgroundColor = e.background, delete e.background), e.backgroundCornerRadius !== void 0 && e.cornerRadius === void 0 && (e.cornerRadius = e.backgroundCornerRadius, delete e.backgroundCornerRadius), e.margin !== void 0 && (e.marginTop ?? (e.marginTop = e.margin), e.marginBottom ?? (e.marginBottom = e.margin), e.marginLeft ?? (e.marginLeft = e.margin), e.marginRight ?? (e.marginRight = e.margin), delete e.margin), e.style !== void 0 && e.fontWeight === void 0 && (e.style.includes("bold") ? e.fontWeight = "bold" : e.style.includes("normal") ? e.fontWeight = "normal" : e.fontWeight = e.style, delete e.style), e;
}
const WE = Bt([
  // https://graphviz.org/docs/attr-types/arrowType/
  // https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
  "normal",
  "inverted",
  "dot",
  "open-dot",
  "none",
  "tee",
  "empty",
  "diamond",
  "open-diamond",
  "crow",
  "box",
  "open",
  "half-open",
  "vee"
]), Gc = Ie({
  type: WE.default("normal"),
  size: V().positive().default(1),
  color: Dt.default("white"),
  opacity: V().min(0).max(1).default(1),
  text: hs.optional()
}), GE = Bt([
  // https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
  "solid",
  "dash",
  "dash-dot",
  "dots",
  "equal-dash",
  "sinewave",
  "zigzag"
]), jE = Ie({
  type: GE.optional(),
  animationSpeed: V().min(0).optional(),
  width: V().positive().optional(),
  color: Dt.optional(),
  opacity: V().min(0).max(1).optional(),
  bezier: vt().optional()
}), jc = Ie({
  arrowHead: Gc.optional(),
  arrowTail: Gc.optional(),
  line: jE.optional(),
  label: hs.prefault({ location: "top" }).optional(),
  tooltip: hs.prefault({ location: "bottom" }).optional(),
  // effects: glow // https://playground.babylonjs.com/#H1LRZ3#35
  enabled: vt().default(!0)
}), VE = {
  line: {
    type: "solid",
    animationSpeed: 0,
    width: 0.25,
    color: "darkgrey"
  },
  arrowHead: Gc.parse({
    type: "normal",
    color: "darkgrey"
  }),
  enabled: !0
}, KE = Bt([
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
]), eu = Ie({
  shape: Ie({
    size: V().positive().optional(),
    type: KE.optional()
    // custom mesh https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/custom/custom
    // import mesh https://doc.babylonjs.com/typedoc/functions/BABYLON.ImportMeshAsync
  }).optional(),
  texture: Ie({
    color: Wc.or(Dt).optional(),
    image: zm().optional(),
    icon: qe().optional()
    // pieChart: z.string().or(z.null()).default(null), // https://manual.cytoscape.org/en/stable/Styles.html#using-graphics-in-styles
    // shader: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/
    // bumpmap: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/moreMaterials/#bump-map
    // refraction // https://forum.babylonjs.com/t/how-to-make-a-semi-transparent-glass-ball-with-a-through-hole-with-albedotexture/27357/24
    // reflection // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/reflectionTexture/
  }).optional(),
  effect: Ie({
    glow: Ie({
      // https://doc.babylonjs.com/features/featuresDeepDive/mesh/glowLayer
      color: Dt.optional(),
      strength: V().positive().optional()
    }).optional(),
    outline: Ie({
      // https://forum.babylonjs.com/t/how-to-get-the-perfect-outline/31711
      color: Dt.optional(),
      width: V().positive().optional()
    }).optional(),
    wireframe: vt().optional(),
    flatShaded: vt().optional()
  }).optional(),
  label: hs.prefault({ location: "top", textColor: "#000000" }).optional(),
  tooltip: hs.prefault({ location: "top-right", textColor: "#000000", backgroundColor: "#FFFFFF" }).optional(),
  enabled: vt().default(!0)
}), JE = {
  shape: {
    type: "icosphere",
    size: 1
  },
  texture: {
    color: "#6366F1"
  },
  enabled: !0
}, YE = ki({
  nodeIdPath: qe().default("id"),
  nodeWeightPath: qe().or(Ke()).default(null),
  nodeTimePath: qe().or(Ke()).default(null),
  edgeSrcIdPath: qe().default("src"),
  edgeDstIdPath: qe().default("dst"),
  edgeWeightPath: qe().or(Ke()).default(null),
  edgeTimePath: qe().or(Ke()).default(null)
}), QE = Ie({
  algorithms: nt(qe()).optional(),
  knownFields: YE.prefault({})
  // schema: z4.$ZodObject,
}), XE = Ie({
  pinOnDrag: vt().default(!0)
}).prefault({}), eA = Ie({
  type: qe().default("ngraph"),
  preSteps: V().default(0),
  stepMultiplier: V().default(1),
  minDelta: V().default(0)
}), tA = Ie({
  // dimensions: z.int().min(2).max(3).default(3),
  layout: eA.prefault({}),
  node: XE,
  fetchNodes: Xa(S0(Function)),
  fetchEdges: Xa(S0(Function))
}), Vc = qe().or(V());
ki({
  id: Vc,
  metadata: ki()
});
ki({
  src: Vc,
  dst: Vc,
  metadata: ki()
});
const nA = Ie({
  backgroundType: Pi("color"),
  color: Dt
}), rA = Ie({
  backgroundType: Pi("skybox"),
  data: NE
}), iA = kh("backgroundType", [
  nA,
  rA
]), oA = Ie({
  // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/motionBlurPostProcess/
  motionBlur: V().optional(),
  // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/dofLenseEffects/
  depthOfField: V().optional(),
  // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/SSRRenderingPipeline/
  screenSpaceReflections: vt().optional()
}), sA = Ie({
  addDefaultStyle: vt().default(!0),
  background: iA.prefault({ backgroundType: "color", color: "whitesmoke" }),
  effects: oA.optional(),
  startingCameraDistance: V().default(30),
  // TODO: replace with "zoomToFit: z.boolean()"
  layout: qe().default("ngraph"),
  layoutOptions: ki().optional(),
  twoD: vt().default(!1)
}), aA = qe().regex(/^data\.|algorithmResults\./), uA = qe().startsWith("style."), qm = Ie({
  inputs: nt(aA),
  output: uA,
  expr: qe()
}), lA = Ie({
  selector: qe(),
  style: eu,
  calculatedStyle: qm.optional()
}), cA = Ie({
  selector: qe(),
  style: jc,
  calculatedStyle: qm.optional()
}), hA = Ie({
  node: lA,
  edge: cA
}).partial().refine(
  (n) => !!n.node || !!n.edge,
  "StyleLayer requires either 'node' or 'edge'."
), fA = Ie({
  templateName: qe().optional(),
  templateCreator: qe().optional(),
  templateCreationTimestamp: Zc().optional(),
  templateModificationTimestamp: Zc().optional()
}), dA = Ie({
  graphtyTemplate: Pi(!0),
  majorVersion: Pi("1"),
  metadata: fA.optional(),
  graph: sA.prefault({}),
  layers: nt(hA).prefault([]),
  data: QE.prefault({}),
  behavior: tA.prefault({})
}), pA = kh("majorVersion", [
  dA
]), C0 = /* @__PURE__ */ new Map();
class Nh {
  constructor() {
    this.edgeSchema = null, this.nodeSchema = null;
  }
  async *getData() {
    for await (const e of this.sourceFetchData()) {
      if (this.nodeSchema)
        for (const t of e.nodes)
          await this.dataValidator(this.nodeSchema, t);
      if (this.edgeSchema)
        for (const t of e.edges)
          await this.dataValidator(this.edgeSchema, t);
      yield e;
    }
  }
  async dataValidator(e, t) {
    const r = await ym(e, t);
    if (!r.success) {
      const o = JT(r.error);
      throw new TypeError(`Error while validating data in '${this.type}' data source:
${o}`);
    }
  }
  get type() {
    return this.constructor.type;
  }
  static register(e) {
    const t = e.type;
    return C0.set(t, e), e;
  }
  static get(e, t = {}) {
    const r = C0.get(e);
    return r ? new r(t) : null;
  }
}
var $a = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Cs(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var fc = {}, M0;
function gA() {
  return M0 || (M0 = 1, function(n) {
    (function(e) {
      function t(x) {
        return x !== null ? Object.prototype.toString.call(x) === "[object Array]" : !1;
      }
      function r(x) {
        return x !== null ? Object.prototype.toString.call(x) === "[object Object]" : !1;
      }
      function o(x, P) {
        if (x === P)
          return !0;
        var z = Object.prototype.toString.call(x);
        if (z !== Object.prototype.toString.call(P))
          return !1;
        if (t(x) === !0) {
          if (x.length !== P.length)
            return !1;
          for (var W = 0; W < x.length; W++)
            if (o(x[W], P[W]) === !1)
              return !1;
          return !0;
        }
        if (r(x) === !0) {
          var Q = {};
          for (var le in x)
            if (hasOwnProperty.call(x, le)) {
              if (o(x[le], P[le]) === !1)
                return !1;
              Q[le] = !0;
            }
          for (var Ae in P)
            if (hasOwnProperty.call(P, Ae) && Q[Ae] !== !0)
              return !1;
          return !0;
        }
        return !1;
      }
      function a(x) {
        if (x === "" || x === !1 || x === null)
          return !0;
        if (t(x) && x.length === 0)
          return !0;
        if (r(x)) {
          for (var P in x)
            if (x.hasOwnProperty(P))
              return !1;
          return !0;
        } else
          return !1;
      }
      function u(x) {
        for (var P = Object.keys(x), z = [], W = 0; W < P.length; W++)
          z.push(x[P[W]]);
        return z;
      }
      var h;
      typeof String.prototype.trimLeft == "function" ? h = function(x) {
        return x.trimLeft();
      } : h = function(x) {
        return x.match(/^\s*(.*)/)[1];
      };
      var c = 0, f = 1, d = 2, g = 3, v = 4, b = 5, _ = 6, O = 7, E = 8, S = 9, k = {
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
      }, C = "EOF", A = "UnquotedIdentifier", N = "QuotedIdentifier", L = "Rbracket", F = "Rparen", H = "Comma", se = "Colon", be = "Rbrace", ge = "Number", pe = "Current", Je = "Expref", Le = "Pipe", rt = "Or", We = "And", te = "EQ", oe = "GT", re = "LT", ce = "GTE", ve = "LTE", xe = "NE", Re = "Flatten", Ve = "Star", ae = "Filter", ee = "Dot", U = "Not", G = "Lbrace", J = "Lbracket", he = "Lparen", we = "Literal", Ue = {
        ".": ee,
        "*": Ve,
        ",": H,
        ":": se,
        "{": G,
        "}": be,
        "]": L,
        "(": he,
        ")": F,
        "@": pe
      }, wt = {
        "<": !0,
        ">": !0,
        "=": !0,
        "!": !0
      }, ke = {
        " ": !0,
        "	": !0,
        "\n": !0
      };
      function tt(x) {
        return x >= "a" && x <= "z" || x >= "A" && x <= "Z" || x === "_";
      }
      function Nt(x) {
        return x >= "0" && x <= "9" || x === "-";
      }
      function xt(x) {
        return x >= "a" && x <= "z" || x >= "A" && x <= "Z" || x >= "0" && x <= "9" || x === "_";
      }
      function Nn() {
      }
      Nn.prototype = {
        tokenize: function(x) {
          var P = [];
          this._current = 0;
          for (var z, W, Q; this._current < x.length; )
            if (tt(x[this._current]))
              z = this._current, W = this._consumeUnquotedIdentifier(x), P.push({
                type: A,
                value: W,
                start: z
              });
            else if (Ue[x[this._current]] !== void 0)
              P.push({
                type: Ue[x[this._current]],
                value: x[this._current],
                start: this._current
              }), this._current++;
            else if (Nt(x[this._current]))
              Q = this._consumeNumber(x), P.push(Q);
            else if (x[this._current] === "[")
              Q = this._consumeLBracket(x), P.push(Q);
            else if (x[this._current] === '"')
              z = this._current, W = this._consumeQuotedIdentifier(x), P.push({
                type: N,
                value: W,
                start: z
              });
            else if (x[this._current] === "'")
              z = this._current, W = this._consumeRawStringLiteral(x), P.push({
                type: we,
                value: W,
                start: z
              });
            else if (x[this._current] === "`") {
              z = this._current;
              var le = this._consumeLiteral(x);
              P.push({
                type: we,
                value: le,
                start: z
              });
            } else if (wt[x[this._current]] !== void 0)
              P.push(this._consumeOperator(x));
            else if (ke[x[this._current]] !== void 0)
              this._current++;
            else if (x[this._current] === "&")
              z = this._current, this._current++, x[this._current] === "&" ? (this._current++, P.push({ type: We, value: "&&", start: z })) : P.push({ type: Je, value: "&", start: z });
            else if (x[this._current] === "|")
              z = this._current, this._current++, x[this._current] === "|" ? (this._current++, P.push({ type: rt, value: "||", start: z })) : P.push({ type: Le, value: "|", start: z });
            else {
              var Ae = new Error("Unknown character:" + x[this._current]);
              throw Ae.name = "LexerError", Ae;
            }
          return P;
        },
        _consumeUnquotedIdentifier: function(x) {
          var P = this._current;
          for (this._current++; this._current < x.length && xt(x[this._current]); )
            this._current++;
          return x.slice(P, this._current);
        },
        _consumeQuotedIdentifier: function(x) {
          var P = this._current;
          this._current++;
          for (var z = x.length; x[this._current] !== '"' && this._current < z; ) {
            var W = this._current;
            x[W] === "\\" && (x[W + 1] === "\\" || x[W + 1] === '"') ? W += 2 : W++, this._current = W;
          }
          return this._current++, JSON.parse(x.slice(P, this._current));
        },
        _consumeRawStringLiteral: function(x) {
          var P = this._current;
          this._current++;
          for (var z = x.length; x[this._current] !== "'" && this._current < z; ) {
            var W = this._current;
            x[W] === "\\" && (x[W + 1] === "\\" || x[W + 1] === "'") ? W += 2 : W++, this._current = W;
          }
          this._current++;
          var Q = x.slice(P + 1, this._current - 1);
          return Q.replace("\\'", "'");
        },
        _consumeNumber: function(x) {
          var P = this._current;
          this._current++;
          for (var z = x.length; Nt(x[this._current]) && this._current < z; )
            this._current++;
          var W = parseInt(x.slice(P, this._current));
          return { type: ge, value: W, start: P };
        },
        _consumeLBracket: function(x) {
          var P = this._current;
          return this._current++, x[this._current] === "?" ? (this._current++, { type: ae, value: "[?", start: P }) : x[this._current] === "]" ? (this._current++, { type: Re, value: "[]", start: P }) : { type: J, value: "[", start: P };
        },
        _consumeOperator: function(x) {
          var P = this._current, z = x[P];
          if (this._current++, z === "!")
            return x[this._current] === "=" ? (this._current++, { type: xe, value: "!=", start: P }) : { type: U, value: "!", start: P };
          if (z === "<")
            return x[this._current] === "=" ? (this._current++, { type: ve, value: "<=", start: P }) : { type: re, value: "<", start: P };
          if (z === ">")
            return x[this._current] === "=" ? (this._current++, { type: ce, value: ">=", start: P }) : { type: oe, value: ">", start: P };
          if (z === "=" && x[this._current] === "=")
            return this._current++, { type: te, value: "==", start: P };
        },
        _consumeLiteral: function(x) {
          this._current++;
          for (var P = this._current, z = x.length, W; x[this._current] !== "`" && this._current < z; ) {
            var Q = this._current;
            x[Q] === "\\" && (x[Q + 1] === "\\" || x[Q + 1] === "`") ? Q += 2 : Q++, this._current = Q;
          }
          var le = h(x.slice(P, this._current));
          return le = le.replace("\\`", "`"), this._looksLikeJSON(le) ? W = JSON.parse(le) : W = JSON.parse('"' + le + '"'), this._current++, W;
        },
        _looksLikeJSON: function(x) {
          var P = '[{"', z = ["true", "false", "null"], W = "-0123456789";
          if (x === "")
            return !1;
          if (P.indexOf(x[0]) >= 0)
            return !0;
          if (z.indexOf(x) >= 0)
            return !0;
          if (W.indexOf(x[0]) >= 0)
            try {
              return JSON.parse(x), !0;
            } catch {
              return !1;
            }
          else
            return !1;
        }
      };
      var Se = {};
      Se[C] = 0, Se[A] = 0, Se[N] = 0, Se[L] = 0, Se[F] = 0, Se[H] = 0, Se[be] = 0, Se[ge] = 0, Se[pe] = 0, Se[Je] = 0, Se[Le] = 1, Se[rt] = 2, Se[We] = 3, Se[te] = 5, Se[oe] = 5, Se[re] = 5, Se[ce] = 5, Se[ve] = 5, Se[xe] = 5, Se[Re] = 9, Se[Ve] = 20, Se[ae] = 21, Se[ee] = 40, Se[U] = 45, Se[G] = 50, Se[J] = 55, Se[he] = 60;
      function Ft() {
      }
      Ft.prototype = {
        parse: function(x) {
          this._loadTokens(x), this.index = 0;
          var P = this.expression(0);
          if (this._lookahead(0) !== C) {
            var z = this._lookaheadToken(0), W = new Error(
              "Unexpected token type: " + z.type + ", value: " + z.value
            );
            throw W.name = "ParserError", W;
          }
          return P;
        },
        _loadTokens: function(x) {
          var P = new Nn(), z = P.tokenize(x);
          z.push({ type: C, value: "", start: x.length }), this.tokens = z;
        },
        expression: function(x) {
          var P = this._lookaheadToken(0);
          this._advance();
          for (var z = this.nud(P), W = this._lookahead(0); x < Se[W]; )
            this._advance(), z = this.led(W, z), W = this._lookahead(0);
          return z;
        },
        _lookahead: function(x) {
          return this.tokens[this.index + x].type;
        },
        _lookaheadToken: function(x) {
          return this.tokens[this.index + x];
        },
        _advance: function() {
          this.index++;
        },
        nud: function(x) {
          var P, z, W;
          switch (x.type) {
            case we:
              return { type: "Literal", value: x.value };
            case A:
              return { type: "Field", name: x.value };
            case N:
              var Q = { type: "Field", name: x.value };
              if (this._lookahead(0) === he)
                throw new Error("Quoted identifier not allowed for function names.");
              return Q;
            case U:
              return z = this.expression(Se.Not), { type: "NotExpression", children: [z] };
            case Ve:
              return P = { type: "Identity" }, z = null, this._lookahead(0) === L ? z = { type: "Identity" } : z = this._parseProjectionRHS(Se.Star), { type: "ValueProjection", children: [P, z] };
            case ae:
              return this.led(x.type, { type: "Identity" });
            case G:
              return this._parseMultiselectHash();
            case Re:
              return P = { type: Re, children: [{ type: "Identity" }] }, z = this._parseProjectionRHS(Se.Flatten), { type: "Projection", children: [P, z] };
            case J:
              return this._lookahead(0) === ge || this._lookahead(0) === se ? (z = this._parseIndexExpression(), this._projectIfSlice({ type: "Identity" }, z)) : this._lookahead(0) === Ve && this._lookahead(1) === L ? (this._advance(), this._advance(), z = this._parseProjectionRHS(Se.Star), {
                type: "Projection",
                children: [{ type: "Identity" }, z]
              }) : this._parseMultiselectList();
            case pe:
              return { type: pe };
            case Je:
              return W = this.expression(Se.Expref), { type: "ExpressionReference", children: [W] };
            case he:
              for (var le = []; this._lookahead(0) !== F; )
                this._lookahead(0) === pe ? (W = { type: pe }, this._advance()) : W = this.expression(0), le.push(W);
              return this._match(F), le[0];
            default:
              this._errorToken(x);
          }
        },
        led: function(x, P) {
          var z;
          switch (x) {
            case ee:
              var W = Se.Dot;
              return this._lookahead(0) !== Ve ? (z = this._parseDotRHS(W), { type: "Subexpression", children: [P, z] }) : (this._advance(), z = this._parseProjectionRHS(W), { type: "ValueProjection", children: [P, z] });
            case Le:
              return z = this.expression(Se.Pipe), { type: Le, children: [P, z] };
            case rt:
              return z = this.expression(Se.Or), { type: "OrExpression", children: [P, z] };
            case We:
              return z = this.expression(Se.And), { type: "AndExpression", children: [P, z] };
            case he:
              for (var Q = P.name, le = [], Ae, Be; this._lookahead(0) !== F; )
                this._lookahead(0) === pe ? (Ae = { type: pe }, this._advance()) : Ae = this.expression(0), this._lookahead(0) === H && this._match(H), le.push(Ae);
              return this._match(F), Be = { type: "Function", name: Q, children: le }, Be;
            case ae:
              var St = this.expression(0);
              return this._match(L), this._lookahead(0) === Re ? z = { type: "Identity" } : z = this._parseProjectionRHS(Se.Filter), { type: "FilterProjection", children: [P, z, St] };
            case Re:
              var Kt = { type: Re, children: [P] }, ut = this._parseProjectionRHS(Se.Flatten);
              return { type: "Projection", children: [Kt, ut] };
            case te:
            case xe:
            case oe:
            case ce:
            case re:
            case ve:
              return this._parseComparator(P, x);
            case J:
              var Te = this._lookaheadToken(0);
              return Te.type === ge || Te.type === se ? (z = this._parseIndexExpression(), this._projectIfSlice(P, z)) : (this._match(Ve), this._match(L), z = this._parseProjectionRHS(Se.Star), { type: "Projection", children: [P, z] });
            default:
              this._errorToken(this._lookaheadToken(0));
          }
        },
        _match: function(x) {
          if (this._lookahead(0) === x)
            this._advance();
          else {
            var P = this._lookaheadToken(0), z = new Error("Expected " + x + ", got: " + P.type);
            throw z.name = "ParserError", z;
          }
        },
        _errorToken: function(x) {
          var P = new Error("Invalid token (" + x.type + '): "' + x.value + '"');
          throw P.name = "ParserError", P;
        },
        _parseIndexExpression: function() {
          if (this._lookahead(0) === se || this._lookahead(1) === se)
            return this._parseSliceExpression();
          var x = {
            type: "Index",
            value: this._lookaheadToken(0).value
          };
          return this._advance(), this._match(L), x;
        },
        _projectIfSlice: function(x, P) {
          var z = { type: "IndexExpression", children: [x, P] };
          return P.type === "Slice" ? {
            type: "Projection",
            children: [z, this._parseProjectionRHS(Se.Star)]
          } : z;
        },
        _parseSliceExpression: function() {
          for (var x = [null, null, null], P = 0, z = this._lookahead(0); z !== L && P < 3; ) {
            if (z === se)
              P++, this._advance();
            else if (z === ge)
              x[P] = this._lookaheadToken(0).value, this._advance();
            else {
              var W = this._lookahead(0), Q = new Error("Syntax error, unexpected token: " + W.value + "(" + W.type + ")");
              throw Q.name = "Parsererror", Q;
            }
            z = this._lookahead(0);
          }
          return this._match(L), {
            type: "Slice",
            children: x
          };
        },
        _parseComparator: function(x, P) {
          var z = this.expression(Se[P]);
          return { type: "Comparator", name: P, children: [x, z] };
        },
        _parseDotRHS: function(x) {
          var P = this._lookahead(0), z = [A, N, Ve];
          if (z.indexOf(P) >= 0)
            return this.expression(x);
          if (P === J)
            return this._match(J), this._parseMultiselectList();
          if (P === G)
            return this._match(G), this._parseMultiselectHash();
        },
        _parseProjectionRHS: function(x) {
          var P;
          if (Se[this._lookahead(0)] < 10)
            P = { type: "Identity" };
          else if (this._lookahead(0) === J)
            P = this.expression(x);
          else if (this._lookahead(0) === ae)
            P = this.expression(x);
          else if (this._lookahead(0) === ee)
            this._match(ee), P = this._parseDotRHS(x);
          else {
            var z = this._lookaheadToken(0), W = new Error("Sytanx error, unexpected token: " + z.value + "(" + z.type + ")");
            throw W.name = "ParserError", W;
          }
          return P;
        },
        _parseMultiselectList: function() {
          for (var x = []; this._lookahead(0) !== L; ) {
            var P = this.expression(0);
            if (x.push(P), this._lookahead(0) === H && (this._match(H), this._lookahead(0) === L))
              throw new Error("Unexpected token Rbracket");
          }
          return this._match(L), { type: "MultiSelectList", children: x };
        },
        _parseMultiselectHash: function() {
          for (var x = [], P = [A, N], z, W, Q, le; ; ) {
            if (z = this._lookaheadToken(0), P.indexOf(z.type) < 0)
              throw new Error("Expecting an identifier token, got: " + z.type);
            if (W = z.value, this._advance(), this._match(se), Q = this.expression(0), le = { type: "KeyValuePair", name: W, value: Q }, x.push(le), this._lookahead(0) === H)
              this._match(H);
            else if (this._lookahead(0) === be) {
              this._match(be);
              break;
            }
          }
          return { type: "MultiSelectHash", children: x };
        }
      };
      function Qe(x) {
        this.runtime = x;
      }
      Qe.prototype = {
        search: function(x, P) {
          return this.visit(x, P);
        },
        visit: function(x, P) {
          var z, W, Q, le, Ae, Be, St, Kt, ut, Te;
          switch (x.type) {
            case "Field":
              return P !== null && r(P) ? (Be = P[x.name], Be === void 0 ? null : Be) : null;
            case "Subexpression":
              for (Q = this.visit(x.children[0], P), Te = 1; Te < x.children.length; Te++)
                if (Q = this.visit(x.children[1], Q), Q === null)
                  return null;
              return Q;
            case "IndexExpression":
              return St = this.visit(x.children[0], P), Kt = this.visit(x.children[1], St), Kt;
            case "Index":
              if (!t(P))
                return null;
              var Wt = x.value;
              return Wt < 0 && (Wt = P.length + Wt), Q = P[Wt], Q === void 0 && (Q = null), Q;
            case "Slice":
              if (!t(P))
                return null;
              var xo = x.children.slice(0), oi = this.computeSliceParams(P.length, xo), Pr = oi[0], Or = oi[1], hr = oi[2];
              if (Q = [], hr > 0)
                for (Te = Pr; Te < Or; Te += hr)
                  Q.push(P[Te]);
              else
                for (Te = Pr; Te > Or; Te += hr)
                  Q.push(P[Te]);
              return Q;
            case "Projection":
              var Jt = this.visit(x.children[0], P);
              if (!t(Jt))
                return null;
              for (ut = [], Te = 0; Te < Jt.length; Te++)
                W = this.visit(x.children[1], Jt[Te]), W !== null && ut.push(W);
              return ut;
            case "ValueProjection":
              if (Jt = this.visit(x.children[0], P), !r(Jt))
                return null;
              ut = [];
              var zi = u(Jt);
              for (Te = 0; Te < zi.length; Te++)
                W = this.visit(x.children[1], zi[Te]), W !== null && ut.push(W);
              return ut;
            case "FilterProjection":
              if (Jt = this.visit(x.children[0], P), !t(Jt))
                return null;
              var si = [], kr = [];
              for (Te = 0; Te < Jt.length; Te++)
                z = this.visit(x.children[2], Jt[Te]), a(z) || si.push(Jt[Te]);
              for (var ai = 0; ai < si.length; ai++)
                W = this.visit(x.children[1], si[ai]), W !== null && kr.push(W);
              return kr;
            case "Comparator":
              switch (le = this.visit(x.children[0], P), Ae = this.visit(x.children[1], P), x.name) {
                case te:
                  Q = o(le, Ae);
                  break;
                case xe:
                  Q = !o(le, Ae);
                  break;
                case oe:
                  Q = le > Ae;
                  break;
                case ce:
                  Q = le >= Ae;
                  break;
                case re:
                  Q = le < Ae;
                  break;
                case ve:
                  Q = le <= Ae;
                  break;
                default:
                  throw new Error("Unknown comparator: " + x.name);
              }
              return Q;
            case Re:
              var ui = this.visit(x.children[0], P);
              if (!t(ui))
                return null;
              var $r = [];
              for (Te = 0; Te < ui.length; Te++)
                W = ui[Te], t(W) ? $r.push.apply($r, W) : $r.push(W);
              return $r;
            case "Identity":
              return P;
            case "MultiSelectList":
              if (P === null)
                return null;
              for (ut = [], Te = 0; Te < x.children.length; Te++)
                ut.push(this.visit(x.children[Te], P));
              return ut;
            case "MultiSelectHash":
              if (P === null)
                return null;
              ut = {};
              var zn;
              for (Te = 0; Te < x.children.length; Te++)
                zn = x.children[Te], ut[zn.name] = this.visit(zn.value, P);
              return ut;
            case "OrExpression":
              return z = this.visit(x.children[0], P), a(z) && (z = this.visit(x.children[1], P)), z;
            case "AndExpression":
              return le = this.visit(x.children[0], P), a(le) === !0 ? le : this.visit(x.children[1], P);
            case "NotExpression":
              return le = this.visit(x.children[0], P), a(le);
            case "Literal":
              return x.value;
            case Le:
              return St = this.visit(x.children[0], P), this.visit(x.children[1], St);
            case pe:
              return P;
            case "Function":
              var Di = [];
              for (Te = 0; Te < x.children.length; Te++)
                Di.push(this.visit(x.children[Te], P));
              return this.runtime.callFunction(x.name, Di);
            case "ExpressionReference":
              var Nr = x.children[0];
              return Nr.jmespathType = Je, Nr;
            default:
              throw new Error("Unknown node type: " + x.type);
          }
        },
        computeSliceParams: function(x, P) {
          var z = P[0], W = P[1], Q = P[2], le = [null, null, null];
          if (Q === null)
            Q = 1;
          else if (Q === 0) {
            var Ae = new Error("Invalid slice, step cannot be 0");
            throw Ae.name = "RuntimeError", Ae;
          }
          var Be = Q < 0;
          return z === null ? z = Be ? x - 1 : 0 : z = this.capSliceRange(x, z, Q), W === null ? W = Be ? -1 : x : W = this.capSliceRange(x, W, Q), le[0] = z, le[1] = W, le[2] = Q, le;
        },
        capSliceRange: function(x, P, z) {
          return P < 0 ? (P += x, P < 0 && (P = z < 0 ? -1 : 0)) : P >= x && (P = z < 0 ? x - 1 : x), P;
        }
      };
      function yn(x) {
        this._interpreter = x, this.functionTable = {
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
          abs: { _func: this._functionAbs, _signature: [{ types: [c] }] },
          avg: { _func: this._functionAvg, _signature: [{ types: [E] }] },
          ceil: { _func: this._functionCeil, _signature: [{ types: [c] }] },
          contains: {
            _func: this._functionContains,
            _signature: [
              { types: [d, g] },
              { types: [f] }
            ]
          },
          ends_with: {
            _func: this._functionEndsWith,
            _signature: [{ types: [d] }, { types: [d] }]
          },
          floor: { _func: this._functionFloor, _signature: [{ types: [c] }] },
          length: {
            _func: this._functionLength,
            _signature: [{ types: [d, g, v] }]
          },
          map: {
            _func: this._functionMap,
            _signature: [{ types: [_] }, { types: [g] }]
          },
          max: {
            _func: this._functionMax,
            _signature: [{ types: [E, S] }]
          },
          merge: {
            _func: this._functionMerge,
            _signature: [{ types: [v], variadic: !0 }]
          },
          max_by: {
            _func: this._functionMaxBy,
            _signature: [{ types: [g] }, { types: [_] }]
          },
          sum: { _func: this._functionSum, _signature: [{ types: [E] }] },
          starts_with: {
            _func: this._functionStartsWith,
            _signature: [{ types: [d] }, { types: [d] }]
          },
          min: {
            _func: this._functionMin,
            _signature: [{ types: [E, S] }]
          },
          min_by: {
            _func: this._functionMinBy,
            _signature: [{ types: [g] }, { types: [_] }]
          },
          type: { _func: this._functionType, _signature: [{ types: [f] }] },
          keys: { _func: this._functionKeys, _signature: [{ types: [v] }] },
          values: { _func: this._functionValues, _signature: [{ types: [v] }] },
          sort: { _func: this._functionSort, _signature: [{ types: [S, E] }] },
          sort_by: {
            _func: this._functionSortBy,
            _signature: [{ types: [g] }, { types: [_] }]
          },
          join: {
            _func: this._functionJoin,
            _signature: [
              { types: [d] },
              { types: [S] }
            ]
          },
          reverse: {
            _func: this._functionReverse,
            _signature: [{ types: [d, g] }]
          },
          to_array: { _func: this._functionToArray, _signature: [{ types: [f] }] },
          to_string: { _func: this._functionToString, _signature: [{ types: [f] }] },
          to_number: { _func: this._functionToNumber, _signature: [{ types: [f] }] },
          not_null: {
            _func: this._functionNotNull,
            _signature: [{ types: [f], variadic: !0 }]
          }
        };
      }
      yn.prototype = {
        callFunction: function(x, P) {
          var z = this.functionTable[x];
          if (z === void 0)
            throw new Error("Unknown function: " + x + "()");
          return this._validateArgs(x, P, z._signature), z._func.call(this, P);
        },
        _validateArgs: function(x, P, z) {
          var W;
          if (z[z.length - 1].variadic) {
            if (P.length < z.length)
              throw W = z.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + x + "() takes at least" + z.length + W + " but received " + P.length);
          } else if (P.length !== z.length)
            throw W = z.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + x + "() takes " + z.length + W + " but received " + P.length);
          for (var Q, le, Ae, Be = 0; Be < z.length; Be++) {
            Ae = !1, Q = z[Be].types, le = this._getTypeName(P[Be]);
            for (var St = 0; St < Q.length; St++)
              if (this._typeMatches(le, Q[St], P[Be])) {
                Ae = !0;
                break;
              }
            if (!Ae) {
              var Kt = Q.map(function(ut) {
                return k[ut];
              }).join(",");
              throw new Error("TypeError: " + x + "() expected argument " + (Be + 1) + " to be type " + Kt + " but received type " + k[le] + " instead.");
            }
          }
        },
        _typeMatches: function(x, P, z) {
          if (P === f)
            return !0;
          if (P === S || P === E || P === g) {
            if (P === g)
              return x === g;
            if (x === g) {
              var W;
              P === E ? W = c : P === S && (W = d);
              for (var Q = 0; Q < z.length; Q++)
                if (!this._typeMatches(
                  this._getTypeName(z[Q]),
                  W,
                  z[Q]
                ))
                  return !1;
              return !0;
            }
          } else
            return x === P;
        },
        _getTypeName: function(x) {
          switch (Object.prototype.toString.call(x)) {
            case "[object String]":
              return d;
            case "[object Number]":
              return c;
            case "[object Array]":
              return g;
            case "[object Boolean]":
              return b;
            case "[object Null]":
              return O;
            case "[object Object]":
              return x.jmespathType === Je ? _ : v;
          }
        },
        _functionStartsWith: function(x) {
          return x[0].lastIndexOf(x[1]) === 0;
        },
        _functionEndsWith: function(x) {
          var P = x[0], z = x[1];
          return P.indexOf(z, P.length - z.length) !== -1;
        },
        _functionReverse: function(x) {
          var P = this._getTypeName(x[0]);
          if (P === d) {
            for (var z = x[0], W = "", Q = z.length - 1; Q >= 0; Q--)
              W += z[Q];
            return W;
          } else {
            var le = x[0].slice(0);
            return le.reverse(), le;
          }
        },
        _functionAbs: function(x) {
          return Math.abs(x[0]);
        },
        _functionCeil: function(x) {
          return Math.ceil(x[0]);
        },
        _functionAvg: function(x) {
          for (var P = 0, z = x[0], W = 0; W < z.length; W++)
            P += z[W];
          return P / z.length;
        },
        _functionContains: function(x) {
          return x[0].indexOf(x[1]) >= 0;
        },
        _functionFloor: function(x) {
          return Math.floor(x[0]);
        },
        _functionLength: function(x) {
          return r(x[0]) ? Object.keys(x[0]).length : x[0].length;
        },
        _functionMap: function(x) {
          for (var P = [], z = this._interpreter, W = x[0], Q = x[1], le = 0; le < Q.length; le++)
            P.push(z.visit(W, Q[le]));
          return P;
        },
        _functionMerge: function(x) {
          for (var P = {}, z = 0; z < x.length; z++) {
            var W = x[z];
            for (var Q in W)
              P[Q] = W[Q];
          }
          return P;
        },
        _functionMax: function(x) {
          if (x[0].length > 0) {
            var P = this._getTypeName(x[0][0]);
            if (P === c)
              return Math.max.apply(Math, x[0]);
            for (var z = x[0], W = z[0], Q = 1; Q < z.length; Q++)
              W.localeCompare(z[Q]) < 0 && (W = z[Q]);
            return W;
          } else
            return null;
        },
        _functionMin: function(x) {
          if (x[0].length > 0) {
            var P = this._getTypeName(x[0][0]);
            if (P === c)
              return Math.min.apply(Math, x[0]);
            for (var z = x[0], W = z[0], Q = 1; Q < z.length; Q++)
              z[Q].localeCompare(W) < 0 && (W = z[Q]);
            return W;
          } else
            return null;
        },
        _functionSum: function(x) {
          for (var P = 0, z = x[0], W = 0; W < z.length; W++)
            P += z[W];
          return P;
        },
        _functionType: function(x) {
          switch (this._getTypeName(x[0])) {
            case c:
              return "number";
            case d:
              return "string";
            case g:
              return "array";
            case v:
              return "object";
            case b:
              return "boolean";
            case _:
              return "expref";
            case O:
              return "null";
          }
        },
        _functionKeys: function(x) {
          return Object.keys(x[0]);
        },
        _functionValues: function(x) {
          for (var P = x[0], z = Object.keys(P), W = [], Q = 0; Q < z.length; Q++)
            W.push(P[z[Q]]);
          return W;
        },
        _functionJoin: function(x) {
          var P = x[0], z = x[1];
          return z.join(P);
        },
        _functionToArray: function(x) {
          return this._getTypeName(x[0]) === g ? x[0] : [x[0]];
        },
        _functionToString: function(x) {
          return this._getTypeName(x[0]) === d ? x[0] : JSON.stringify(x[0]);
        },
        _functionToNumber: function(x) {
          var P = this._getTypeName(x[0]), z;
          return P === c ? x[0] : P === d && (z = +x[0], !isNaN(z)) ? z : null;
        },
        _functionNotNull: function(x) {
          for (var P = 0; P < x.length; P++)
            if (this._getTypeName(x[P]) !== O)
              return x[P];
          return null;
        },
        _functionSort: function(x) {
          var P = x[0].slice(0);
          return P.sort(), P;
        },
        _functionSortBy: function(x) {
          var P = x[0].slice(0);
          if (P.length === 0)
            return P;
          var z = this._interpreter, W = x[1], Q = this._getTypeName(
            z.visit(W, P[0])
          );
          if ([c, d].indexOf(Q) < 0)
            throw new Error("TypeError");
          for (var le = this, Ae = [], Be = 0; Be < P.length; Be++)
            Ae.push([Be, P[Be]]);
          Ae.sort(function(Kt, ut) {
            var Te = z.visit(W, Kt[1]), Wt = z.visit(W, ut[1]);
            if (le._getTypeName(Te) !== Q)
              throw new Error(
                "TypeError: expected " + Q + ", received " + le._getTypeName(Te)
              );
            if (le._getTypeName(Wt) !== Q)
              throw new Error(
                "TypeError: expected " + Q + ", received " + le._getTypeName(Wt)
              );
            return Te > Wt ? 1 : Te < Wt ? -1 : Kt[0] - ut[0];
          });
          for (var St = 0; St < Ae.length; St++)
            P[St] = Ae[St][1];
          return P;
        },
        _functionMaxBy: function(x) {
          for (var P = x[1], z = x[0], W = this.createKeyFunction(P, [c, d]), Q = -1 / 0, le, Ae, Be = 0; Be < z.length; Be++)
            Ae = W(z[Be]), Ae > Q && (Q = Ae, le = z[Be]);
          return le;
        },
        _functionMinBy: function(x) {
          for (var P = x[1], z = x[0], W = this.createKeyFunction(P, [c, d]), Q = 1 / 0, le, Ae, Be = 0; Be < z.length; Be++)
            Ae = W(z[Be]), Ae < Q && (Q = Ae, le = z[Be]);
          return le;
        },
        createKeyFunction: function(x, P) {
          var z = this, W = this._interpreter, Q = function(le) {
            var Ae = W.visit(x, le);
            if (P.indexOf(z._getTypeName(Ae)) < 0) {
              var Be = "TypeError: expected one of " + P + ", received " + z._getTypeName(Ae);
              throw new Error(Be);
            }
            return Ae;
          };
          return Q;
        }
      };
      function Rn(x) {
        var P = new Ft(), z = P.parse(x);
        return z;
      }
      function wo(x) {
        var P = new Nn();
        return P.tokenize(x);
      }
      function cr(x, P) {
        var z = new Ft(), W = new yn(), Q = new Qe(W);
        W._interpreter = Q;
        var le = z.parse(P);
        return Q.search(le, x);
      }
      e.tokenize = wo, e.compile = Rn, e.search = cr, e.strictDeepEqual = o;
    })(n);
  }(fc)), fc;
}
var Hm = gA();
const Kr = /* @__PURE__ */ Cs(Hm), mA = {
  notification: {
    backgroundColor: "rgba(255, 59, 48, 1)",
    textColor: "white",
    fontWeight: "bold",
    fontSize: 24,
    cornerRadius: 999,
    textAlign: "center",
    smartOverflow: !0,
    animation: "pulse",
    textOutline: !0,
    textOutlineWidth: 1,
    textOutlineColor: "rgba(0, 0, 0, 0.3)",
    pointer: !1,
    _badgeType: "notification",
    _smartSizing: !0,
    _paddingRatio: 0.8
  },
  label: {
    fontSize: 24,
    cornerRadius: 12,
    fontWeight: "600",
    backgroundColor: "rgba(0, 122, 255, 1)",
    textColor: "white",
    textShadow: !0,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowBlur: 2,
    textShadowOffsetX: 1,
    textShadowOffsetY: 1,
    _badgeType: "label",
    _paddingRatio: 0.6
  },
  "label-success": {
    fontSize: 24,
    cornerRadius: 12,
    fontWeight: "600",
    backgroundColor: "rgba(52, 199, 89, 1)",
    textColor: "white",
    textShadow: !0,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    _badgeType: "label",
    _paddingRatio: 0.6
  },
  "label-warning": {
    fontSize: 24,
    cornerRadius: 12,
    fontWeight: "600",
    backgroundColor: "rgba(255, 204, 0, 1)",
    textColor: "black",
    textOutline: !0,
    textOutlineWidth: 1,
    textOutlineColor: "rgba(255, 255, 255, 0.5)",
    _badgeType: "label",
    _paddingRatio: 0.6
  },
  "label-danger": {
    fontSize: 24,
    cornerRadius: 12,
    fontWeight: "600",
    backgroundColor: "rgba(255, 59, 48, 1)",
    textColor: "white",
    textShadow: !0,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    _badgeType: "label",
    _paddingRatio: 0.6
  },
  count: {
    backgroundColor: "rgba(0, 122, 255, 1)",
    textColor: "white",
    fontWeight: "bold",
    fontSize: 22,
    cornerRadius: 999,
    textAlign: "center",
    smartOverflow: !0,
    textOutline: !0,
    textOutlineWidth: 1,
    textOutlineColor: "rgba(0, 0, 0, 0.2)",
    _badgeType: "count",
    _smartSizing: !0,
    _paddingRatio: 0.7
  },
  icon: {
    fontSize: 28,
    cornerRadius: 999,
    textAlign: "center",
    backgroundColor: "rgba(100, 100, 100, 0.8)",
    textShadow: !0,
    _badgeType: "icon",
    _paddingRatio: 0.5
  },
  progress: {
    backgroundColor: "rgba(235, 235, 235, 1)",
    textColor: "black",
    fontSize: 24,
    cornerRadius: 12,
    fontWeight: "600",
    animation: "fill",
    textOutline: !0,
    textOutlineWidth: 1,
    textOutlineColor: "white",
    _badgeType: "progress",
    _paddingRatio: 0.8,
    _progressBar: !0
  },
  dot: {
    backgroundColor: "rgba(255, 59, 48, 1)",
    cornerRadius: 999,
    animation: "pulse",
    pointer: !1,
    _badgeType: "dot",
    _smartSizing: !0,
    _paddingRatio: 1,
    _removeText: !0
  }
}, tu = {
  getBadgeStyle(n) {
    if (n)
      return mA[n];
  },
  applyBadgeBehaviors(n, e) {
    const t = n._badgeType;
    if (n._paddingRatio && !e.marginTop) {
      const r = (n.fontSize ?? 48) * n._paddingRatio;
      n.marginTop = n.marginBottom = r, n.marginLeft = n.marginRight = r;
    }
    switch (t) {
      case "notification":
      case "count":
        tu.applySmartOverflow(n, e);
        break;
      case "dot":
        n._removeText && (n.text = "");
        break;
      case "icon":
        tu.applyIconBehavior(n, e);
        break;
    }
  },
  applySmartOverflow(n, e) {
    if (n.smartOverflow && !isNaN(Number(e.text))) {
      const t = parseInt(e.text ?? "0"), r = n.maxNumber ?? 999, o = n.overflowSuffix ?? "+";
      t > r && (t >= 1e3 ? n.text = `${Math.floor(t / 1e3)}k` : n.text = `${r}${o}`);
    }
  },
  applyIconBehavior(n, e) {
    e.icon && !e.text ? n.text = e.icon : e.icon && e.text && ((e.iconPosition ?? "left") === "left" ? n.text = `${e.icon} ${e.text}` : n.text = `${e.text} ${e.icon}`);
  }
};
class vA {
  createSpeechBubblePath(e, t, r, o) {
    const { x: a, y: u, width: h, height: c } = t, { width: f, height: d, offset: g, direction: v, curved: b } = o;
    switch (v) {
      case "bottom":
        this.createBottomPointer(e, a, u, h, c, r, f, d, g, b);
        break;
      case "top":
        this.createTopPointer(e, a, u, h, c, r, f, d, g, b);
        break;
      case "left":
        this.createLeftPointer(e, a, u, h, c, r, f, d, g, b);
        break;
      case "right":
        this.createRightPointer(e, a, u, h, c, r, f, d, g, b);
        break;
      default:
        this.createBottomPointer(e, a, u, h, c, r, f, d, g, b);
    }
  }
  createSpeechBubblePathCCW(e, t, r, o) {
    const { x: a, y: u, width: h, height: c } = t, { width: f, height: d, offset: g, direction: v, curved: b } = o;
    switch (v) {
      case "bottom":
        this.createBottomPointerCCW(e, a, u, h, c, r, f, d, g, b);
        break;
      case "top":
        this.createTopPointerCCW(e, a, u, h, c, r, f, d, g, b);
        break;
      case "left":
        this.createLeftPointerCCW(e, a, u, h, c, r, f, d, g, b);
        break;
      case "right":
        this.createRightPointerCCW(e, a, u, h, c, r, f, d, g, b);
        break;
      default:
        this.createBottomPointerCCW(e, a, u, h, c, r, f, d, g, b);
    }
  }
  createBottomPointer(e, t, r, o, a, u, h, c, f, d) {
    e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a);
    const g = t + o / 2 + f;
    e.lineTo(Math.min(g + h / 2, t + o - u), r + a), d ? e.quadraticCurveTo(g, r + a + c, Math.max(g - h / 2, t + u), r + a) : (e.lineTo(g, r + a + c), e.lineTo(Math.max(g - h / 2, t + u), r + a)), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
  }
  createTopPointer(e, t, r, o, a, u, h, c, f, d) {
    const g = t + o / 2 + f;
    e.moveTo(Math.max(g - h / 2, t + u), r), d ? e.quadraticCurveTo(g, r - c, Math.min(g + h / 2, t + o - u), r) : (e.lineTo(g, r - c), e.lineTo(Math.min(g + h / 2, t + o - u), r)), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
  }
  createLeftPointer(e, t, r, o, a, u, h, c, f, d) {
    e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u);
    const g = r + a / 2 + f;
    e.lineTo(t, Math.min(g + h / 2, r + a - u)), d ? e.quadraticCurveTo(t - c, g, t, Math.max(g - h / 2, r + u)) : (e.lineTo(t - c, g), e.lineTo(t, Math.max(g - h / 2, r + u))), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
  }
  createRightPointer(e, t, r, o, a, u, h, c, f, d) {
    e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u);
    const g = r + a / 2 + f;
    e.lineTo(t + o, Math.max(g - h / 2, r + u)), d ? e.quadraticCurveTo(t + o + c, g, t + o, Math.min(g + h / 2, r + a - u)) : (e.lineTo(t + o + c, g), e.lineTo(t + o, Math.min(g + h / 2, r + a - u))), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
  }
  createBottomPointerCCW(e, t, r, o, a, u, h, c, f, d) {
    e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a);
    const g = t + o / 2 + f;
    e.lineTo(Math.min(g + h / 2, t + o - u), r + a), d ? e.quadraticCurveTo(g, r + a + c, Math.max(g - h / 2, t + u), r + a) : (e.lineTo(g, r + a + c), e.lineTo(Math.max(g - h / 2, t + u), r + a)), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u);
  }
  createTopPointerCCW(e, t, r, o, a, u, h, c, f, d) {
    e.lineTo(t, r + a - u), e.quadraticCurveTo(t, r + a, t + u, r + a), e.lineTo(t + o - u, r + a), e.quadraticCurveTo(t + o, r + a, t + o, r + a - u), e.lineTo(t + o, r + u), e.quadraticCurveTo(t + o, r, t + o - u, r);
    const g = t + o / 2 + f;
    e.lineTo(Math.min(g + h / 2, t + o - u), r), d ? e.quadraticCurveTo(g, r - c, Math.max(g - h / 2, t + u), r) : (e.lineTo(g, r - c), e.lineTo(Math.max(g - h / 2, t + u), r)), e.lineTo(t + u, r), e.quadraticCurveTo(t, r, t, r + u);
  }
  createLeftPointerCCW(e, t, r, o, a, u, h, c, f, d) {
    e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u);
    const g = r + a / 2 + f;
    e.lineTo(t, Math.min(g + h / 2, r + a - u)), d ? e.quadraticCurveTo(t - c, g, t, Math.max(g - h / 2, r + u)) : (e.lineTo(t - c, g), e.lineTo(t, Math.max(g - h / 2, r + u))), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
  }
  createRightPointerCCW(e, t, r, o, a, u, h, c, f, d) {
    e.lineTo(t + u, r), e.quadraticCurveTo(t, r, t, r + u), e.lineTo(t, r + a - u), e.quadraticCurveTo(t, r + a, t + u, r + a), e.lineTo(t + o - u, r + a), e.quadraticCurveTo(t + o, r + a, t + o, r + a - u);
    const g = r + a / 2 + f;
    e.lineTo(t + o, Math.min(g + h / 2, r + a - u)), d ? e.quadraticCurveTo(t + o + c, g, t + o, Math.max(g - h / 2, r + u)) : (e.lineTo(t + o + c, g), e.lineTo(t + o, Math.max(g - h / 2, r + u))), e.lineTo(t + o, r + u), e.quadraticCurveTo(t + o, r, t + o - u, r);
  }
}
class _A {
  constructor(e, t) {
    this.scene = e, this.options = t, this.animationTime = 0, this.originalPosition = null, this.originalScale = null, this.sceneCallback = null;
  }
  setupAnimation(e, t, r) {
    this.options.animation !== "none" && (this.originalPosition = e.position.clone(), this.originalScale = e.scaling.clone(), this.sceneCallback = () => {
      this.animationTime += 0.016 * this.options.animationSpeed, this.updateAnimation(e, t, r);
    }, this.scene.registerBeforeRender(this.sceneCallback));
  }
  updateAnimation(e, t, r) {
    switch (this.options.animation) {
      case "pulse":
        this.animatePulse(e);
        break;
      case "bounce":
        this.animateBounce(e);
        break;
      case "shake":
        this.animateShake(e);
        break;
      case "glow":
        this.animateGlow(t);
        break;
      case "fill":
        this.animateFill(r);
        break;
    }
  }
  animatePulse(e) {
    const t = 1 + Math.sin(this.animationTime * 3) * 0.1;
    e.scaling.x = t, e.scaling.y = t;
  }
  animateBounce(e) {
    if (this.originalPosition) {
      const t = Math.abs(Math.sin(this.animationTime * 2)) * 0.3;
      e.position.y = this.originalPosition.y + t;
    }
  }
  animateShake(e) {
    if (this.originalPosition) {
      const t = Math.sin(this.animationTime * 20) * 0.02, r = Math.cos(this.animationTime * 25) * 0.02;
      e.position.x = this.originalPosition.x + t, e.position.y = this.originalPosition.y + r;
    }
  }
  animateGlow(e) {
    if (e) {
      const t = 0.8 + Math.sin(this.animationTime * 2) * 0.2;
      e.emissiveColor = new Mr(t, t, t);
    }
  }
  animateFill(e) {
    if (e) {
      const t = (Math.sin(this.animationTime) + 1) / 2;
      e(t);
    }
  }
  updateOriginalPosition(e) {
    this.originalPosition = e.clone();
  }
  dispose() {
    this.sceneCallback && (this.scene.unregisterBeforeRender(this.sceneCallback), this.sceneCallback = null);
  }
}
class yA {
  constructor(e) {
    this.defaultStyle = e;
  }
  parse(e) {
    const t = e.split(`
`), r = [];
    for (const o of t) {
      const a = this.parseLine(o);
      r.push(a);
    }
    return r;
  }
  parseLine(e) {
    const t = [];
    let r = 0;
    const o = [
      Object.assign({}, this.defaultStyle)
    ], a = /<(\/?)(bold|italic|color|size|font|bg)(?:='([^']*)')?>/g;
    let u;
    for (; (u = a.exec(e)) !== null; ) {
      u.index > r && t.push({
        text: e.substring(r, u.index),
        style: Object.assign({}, o[o.length - 1])
      });
      const h = u[1] === "/", c = u[2], f = u[3];
      if (h)
        o.length > 1 && o.pop();
      else {
        const d = Object.assign({}, o[o.length - 1]);
        switch (c) {
          case "bold":
            d.weight = "bold";
            break;
          case "italic":
            d.style = "italic";
            break;
          case "color":
            d.color = f || this.defaultStyle.color;
            break;
          case "size":
            d.size = parseInt(f || "0") || this.defaultStyle.size;
            break;
          case "font":
            d.font = f || this.defaultStyle.font;
            break;
          case "bg":
            d.background = f || null;
            break;
        }
        o.push(d);
      }
      r = u.index + u[0].length;
    }
    return r < e.length && t.push({
      text: e.substring(r),
      style: Object.assign({}, o[o.length - 1])
    }), t;
  }
  measureText(e, t, r) {
    let o = 0, a = 0;
    for (const u of e) {
      let h = 0, c = 0;
      for (const f of u) {
        const { style: d } = f;
        t.font = `${d.style} ${d.weight} ${d.size}px ${d.font}`;
        const g = t.measureText(f.text);
        h += g.width, c = Math.max(c, d.size);
      }
      r.textOutline && (h += r.textOutlineWidth * 2, c += r.textOutlineWidth * 2), o = Math.max(o, h), a += c * r.lineHeight;
    }
    return { maxWidth: o, totalHeight: a };
  }
}
class bA {
  constructor(e) {
    this.options = e;
  }
  drawText(e, t, r) {
    const o = r.width - this.options.marginLeft - this.options.marginRight, a = r.x + this.options.marginLeft;
    let u = r.y + this.options.marginTop;
    for (const h of t) {
      if (h.length === 0)
        continue;
      const { totalWidth: c, maxLineHeight: f } = this.measureLine(e, h), d = this.calculateLineStartX(a, o, c);
      this.drawLine(e, h, d, u, f), u += f * this.options.lineHeight;
    }
  }
  measureLine(e, t) {
    let r = 0, o = 0;
    for (const a of t) {
      const { style: u } = a;
      e.font = `${u.style} ${u.weight} ${u.size}px ${u.font}`;
      const h = e.measureText(a.text);
      r += h.width, o = Math.max(o, u.size);
    }
    return { totalWidth: r, maxLineHeight: o };
  }
  calculateLineStartX(e, t, r) {
    const o = e + t / 2;
    switch (this.options.textAlignment) {
      case "left":
        return e;
      case "right":
        return e + t - r;
      case "center":
      default:
        return o - r / 2;
    }
  }
  drawLine(e, t, r, o, a) {
    let u = r;
    for (const h of t) {
      const { style: c } = h;
      if (e.font = `${c.style} ${c.weight} ${c.size}px ${c.font}`, e.textBaseline = "top", c.background) {
        const f = e.measureText(h.text);
        e.fillStyle = c.background, e.fillRect(u, o, f.width, a);
      }
      this.options.textShadow && this.drawTextWithShadow(e, h.text, u, o, c.color), this.options.textOutline && this.drawTextOutline(e, h.text, u, o), e.fillStyle = c.color, e.fillText(h.text, u, o), u += e.measureText(h.text).width;
    }
  }
  drawTextWithShadow(e, t, r, o, a) {
    e.save(), e.shadowColor = this.options.textShadowColor, e.shadowBlur = this.options.textShadowBlur, e.shadowOffsetX = this.options.textShadowOffsetX, e.shadowOffsetY = this.options.textShadowOffsetY, e.fillStyle = a, e.fillText(t, r, o), e.restore();
  }
  drawTextOutline(e, t, r, o) {
    e.save(), e.strokeStyle = this.options.textOutlineColor, e.lineWidth = this.options.textOutlineWidth * 2, e.lineJoin = this.options.textOutlineJoin, e.miterLimit = 2, e.strokeText(t, r, o), e.restore();
  }
}
class Ou {
  constructor(e, t) {
    this.mesh = null, this.texture = null, this.material = null, this.parsedContent = [], this.actualDimensions = { width: 0, height: 0 }, this.contentArea = { x: 0, y: 0, width: 0, height: 0 }, this.totalBorderWidth = 0, this.pointerInfo = null, this._progressValue = 0, this.originalPosition = null, this.animator = null, this.scene = e;
    const r = {
      text: "Label",
      position: { x: 0, y: 0, z: 0 },
      resolution: 1024,
      autoSize: !0,
      font: "Verdana",
      fontSize: 48,
      fontWeight: "normal",
      textColor: "black",
      textAlign: "center",
      lineHeight: 1.2,
      backgroundColor: "transparent",
      backgroundGradient: !1,
      backgroundGradientColors: ["rgba(0, 0, 0, 0.8)", "rgba(50, 50, 50, 0.8)"],
      backgroundGradientType: "linear",
      backgroundGradientDirection: "vertical",
      backgroundPadding: 0,
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 5,
      marginRight: 5,
      borderWidth: 0,
      borderColor: "rgba(255, 255, 255, 0.8)",
      borders: [],
      cornerRadius: 0,
      animation: "none",
      animationSpeed: 1,
      billboardMode: ip.BILLBOARDMODE_ALL,
      textShadow: !1,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowBlur: 4,
      textShadowOffsetX: 2,
      textShadowOffsetY: 2,
      textOutline: !1,
      textOutlineColor: "black",
      textOutlineWidth: 2,
      textOutlineJoin: "round",
      pointer: !1,
      pointerDirection: "bottom",
      pointerWidth: 20,
      pointerHeight: 15,
      pointerOffset: 0,
      pointerCurve: !0,
      attachTo: void 0,
      attachPosition: "top",
      attachOffset: 0.5,
      depthFadeEnabled: !1,
      depthFadeNear: 5,
      depthFadeFar: 20,
      badge: void 0,
      icon: void 0,
      iconPosition: "left",
      progress: void 0,
      smartOverflow: !1,
      maxNumber: 999,
      overflowSuffix: "+",
      _badgeType: void 0,
      _smartSizing: void 0,
      _paddingRatio: void 0,
      _removeText: void 0,
      _progressBar: void 0
    }, o = Object.assign({}, r, t);
    if (o.badge) {
      const a = tu.getBadgeStyle(o.badge);
      a && Object.assign(o, a, t);
    }
    tu.applyBadgeBehaviors(o, t), o.borderWidth > 0 && o.borders.length === 0 && (o.borders = [{
      width: o.borderWidth,
      color: o.borderColor,
      spacing: 0
    }]), this.options = o, this.id = `richLabel_${Math.random().toString(36).substring(2, 11)}`, t.progress !== void 0 && (this._progressValue = Math.max(0, Math.min(1, t.progress))), this.parser = new yA({
      font: this.options.font,
      size: this.options.fontSize,
      weight: this.options.fontWeight,
      style: "normal",
      color: this.options.textColor,
      background: null
    }), this.renderer = new bA({
      textAlignment: this.options.textAlign,
      marginLeft: this.options.marginLeft,
      marginRight: this.options.marginRight,
      marginTop: this.options.marginTop,
      marginBottom: this.options.marginBottom,
      backgroundPadding: this.options.backgroundPadding,
      lineHeight: this.options.lineHeight,
      textShadow: this.options.textShadow,
      textShadowColor: this.options.textShadowColor,
      textShadowBlur: this.options.textShadowBlur,
      textShadowOffsetX: this.options.textShadowOffsetX,
      textShadowOffsetY: this.options.textShadowOffsetY,
      textOutline: this.options.textOutline,
      textOutlineColor: this.options.textOutlineColor,
      textOutlineWidth: this.options.textOutlineWidth,
      textOutlineJoin: this.options.textOutlineJoin
    }), this.pointerRenderer = new vA(), this.options.animation !== "none" && (this.animator = new _A(this.scene, {
      animation: this.options.animation,
      animationSpeed: this.options.animationSpeed
    })), this._create();
  }
  static createLabel(e, t) {
    return new Ou(e, t);
  }
  _create() {
    this._parseRichText(), this._calculateDimensions(), this._createTexture(), this._createMaterial(), this._createMesh(), this.options.attachTo ? this._attachToTarget() : this.mesh && (this.mesh.position = new kt(
      this.options.position.x,
      this.options.position.y,
      this.options.position.z
    ), this.originalPosition ?? (this.originalPosition = this.mesh.position.clone())), this.options.depthFadeEnabled && this._setupDepthFading(), this.animator && this.mesh && this.material && this.animator.setupAnimation(this.mesh, this.material, (e) => {
      this._progressValue = e, this._drawContent();
    });
  }
  _parseRichText() {
    this.parsedContent = this.parser.parse(this.options.text);
  }
  _calculateDimensions() {
    const t = document.createElement("canvas").getContext("2d");
    if (!t)
      return;
    const { maxWidth: r, totalHeight: o } = this.parser.measureText(this.parsedContent, t, {
      lineHeight: this.options.lineHeight,
      textOutline: this.options.textOutline,
      textOutlineWidth: this.options.textOutlineWidth
    }), a = this.options.backgroundPadding * 2;
    if (this.totalBorderWidth = 0, this.options.borders.length > 0)
      for (let c = 0; c < this.options.borders.length; c++)
        this.totalBorderWidth += this.options.borders[c].width, c < this.options.borders.length - 1 && this.options.borders[c].spacing > 0 && (this.totalBorderWidth += this.options.borders[c].spacing);
    const u = r + this.options.marginLeft + this.options.marginRight + a, h = o + this.options.marginTop + this.options.marginBottom + a;
    if (this.contentArea = {
      x: this.totalBorderWidth,
      y: this.totalBorderWidth,
      width: u,
      height: h
    }, this.actualDimensions.width = u + this.totalBorderWidth * 2, this.actualDimensions.height = h + this.totalBorderWidth * 2, this.options.pointer && (this._calculatePointerDimensions(), this.pointerInfo))
      switch (this.pointerInfo.direction) {
        case "top":
          this.actualDimensions.height += this.options.pointerHeight, this.contentArea.y = this.totalBorderWidth + this.options.pointerHeight;
          break;
        case "bottom":
          this.actualDimensions.height += this.options.pointerHeight;
          break;
        case "left":
          this.actualDimensions.width += this.options.pointerHeight, this.contentArea.x = this.totalBorderWidth + this.options.pointerHeight;
          break;
        case "right":
          this.actualDimensions.width += this.options.pointerHeight;
          break;
      }
    if (this.options._smartSizing) {
      const c = this.actualDimensions.height;
      if (this.actualDimensions.width < c) {
        const f = c - this.actualDimensions.width;
        this.actualDimensions.width = c, this.contentArea.x += f / 2;
      }
    }
  }
  _calculatePointerDimensions() {
    let e = this.options.pointerDirection;
    e === "auto" && (e = "bottom"), this.pointerInfo = {
      direction: e,
      width: this.options.pointerWidth,
      height: this.options.pointerHeight,
      offset: this.options.pointerOffset,
      curve: this.options.pointerCurve
    };
  }
  _createTexture() {
    let t = this.options.autoSize ? Math.pow(2, Math.ceil(Math.log2(this.actualDimensions.width))) : this.options.resolution;
    const r = this.actualDimensions.width / this.actualDimensions.height;
    let o = this.options.autoSize ? Math.pow(2, Math.ceil(Math.log2(this.actualDimensions.height))) : Math.floor(t / r);
    if (t > 4096 || o > 4096) {
      const a = 4096 / Math.max(t, o);
      t = Math.floor(t * a), o = Math.floor(o * a), console.warn(`RichTextLabel: Texture size clamped to ${t}x${o} (max: 4096)`);
    }
    this.texture = new _5(`richTextTexture_${this.id}`, {
      width: t,
      height: o
    }, this.scene, !0), this.texture.hasAlpha = !0, this.texture.updateSamplingMode(y5.TRILINEAR_SAMPLINGMODE), this._drawContent();
  }
  _drawContent() {
    if (!this.texture)
      return;
    const e = this.texture.getContext(), { width: t } = this.texture.getSize(), { height: r } = this.texture.getSize();
    e.clearRect(0, 0, t, r);
    const o = t / this.actualDimensions.width, a = r / this.actualDimensions.height;
    e.save(), e.scale(o, a), this.options.pointer ? this._drawBackgroundWithPointer(e) : this._drawBackgroundWithBorders(e), this.renderer.drawText(e, this.parsedContent, this.contentArea), e.restore(), this.texture.update();
  }
  _drawBackgroundWithBorders(e) {
    const { width: t } = this.actualDimensions, { height: r } = this.actualDimensions, o = this.options.cornerRadius;
    if (this.options.borders.length > 0) {
      let a = 0;
      for (let u = 0; u < this.options.borders.length; u++) {
        const h = this.options.borders[u];
        u > 0 && this.options.borders[u - 1].spacing > 0 && (a += this.options.borders[u - 1].spacing), e.save(), e.fillStyle = h.color;
        const c = a, f = a, d = t - a * 2, g = r - a * 2, v = Math.max(0, o - a);
        this._createRoundedRectPath(e, c, f, d, g, v);
        const b = a + h.width;
        if (u < this.options.borders.length - 1 || b < this.totalBorderWidth) {
          let _;
          if (o > 0) {
            const O = Math.max(2, o * 0.2);
            if (_ = Math.max(O, o - b), u === this.options.borders.length - 1) {
              const E = Math.max(O, o - this.totalBorderWidth);
              _ < E + 5 && (_ = E);
            }
          } else
            _ = 0;
          this._createRoundedRectPath(
            e,
            b,
            b,
            t - b * 2,
            r - b * 2,
            _
          );
        }
        e.fill("evenodd"), e.restore(), a = b;
      }
    }
    e.beginPath(), this._createRoundedRectPath(
      e,
      this.contentArea.x,
      this.contentArea.y,
      this.contentArea.width,
      this.contentArea.height,
      Math.max(0, o - this.totalBorderWidth)
    ), e.closePath(), this._fillBackground(e, this.actualDimensions.width, this.actualDimensions.height), this.options._progressBar && this._drawProgressBar(e);
  }
  _drawBackgroundWithPointer(e) {
    const { width: t } = this.actualDimensions, { height: r } = this.actualDimensions, o = this.options.cornerRadius;
    if (this.options.borders.length > 0 && this.pointerInfo) {
      let a = 0;
      for (let u = 0; u < this.options.borders.length; u++) {
        const h = this.options.borders[u];
        u > 0 && this.options.borders[u - 1].spacing > 0 && (a += this.options.borders[u - 1].spacing), e.save(), e.fillStyle = h.color, e.beginPath();
        const c = {
          x: this.contentArea.x - this.totalBorderWidth + a,
          y: this.contentArea.y - this.totalBorderWidth + a,
          width: this.contentArea.width + (this.totalBorderWidth - a) * 2,
          height: this.contentArea.height + (this.totalBorderWidth - a) * 2
        };
        this.pointerRenderer.createSpeechBubblePath(e, c, Math.max(0, o - a), {
          width: this.pointerInfo.width,
          height: this.pointerInfo.height,
          offset: this.pointerInfo.offset,
          direction: this.pointerInfo.direction,
          curved: this.pointerInfo.curve
        });
        const f = a + h.width;
        if (u < this.options.borders.length - 1 || f < this.totalBorderWidth) {
          let d;
          if (o > 0) {
            const _ = Math.max(2, o * 0.2);
            if (d = Math.max(_, o - f), u === this.options.borders.length - 1) {
              const O = Math.max(_, o - this.totalBorderWidth);
              d < O + 5 && (d = O);
            }
          } else
            d = 0;
          const g = this.contentArea.x - this.totalBorderWidth + f, v = this.contentArea.y - this.totalBorderWidth + f;
          e.moveTo(g + d, v);
          const b = {
            x: g,
            y: v,
            width: this.contentArea.width + (this.totalBorderWidth - f) * 2,
            height: this.contentArea.height + (this.totalBorderWidth - f) * 2
          };
          this.pointerRenderer.createSpeechBubblePathCCW(e, b, d, {
            width: this.pointerInfo.width,
            height: this.pointerInfo.height,
            offset: this.pointerInfo.offset,
            direction: this.pointerInfo.direction,
            curved: this.pointerInfo.curve
          });
        }
        e.fill("evenodd"), e.restore(), a = f;
      }
    }
    e.beginPath(), this.pointerInfo && this.pointerRenderer.createSpeechBubblePath(e, this.contentArea, o, {
      width: this.pointerInfo.width,
      height: this.pointerInfo.height,
      offset: this.pointerInfo.offset,
      direction: this.pointerInfo.direction,
      curved: this.pointerInfo.curve
    }), e.closePath(), this._fillBackground(e, t, r), this.options._progressBar && this._drawProgressBar(e);
  }
  _fillBackground(e, t, r) {
    if (this.options.backgroundGradient) {
      let o;
      if (this.options.backgroundGradientType === "radial")
        o = e.createRadialGradient(t / 2, r / 2, 0, t / 2, r / 2, Math.max(t, r) / 2);
      else
        switch (this.options.backgroundGradientDirection) {
          case "horizontal":
            o = e.createLinearGradient(0, 0, t, 0);
            break;
          case "diagonal":
            o = e.createLinearGradient(0, 0, t, r);
            break;
          case "vertical":
          default:
            o = e.createLinearGradient(0, 0, 0, r);
            break;
        }
      const a = this.options.backgroundGradientColors;
      for (let u = 0; u < a.length; u++)
        o.addColorStop(u / (a.length - 1), a[u]);
      e.fillStyle = o;
    } else
      e.fillStyle = this.options.backgroundColor;
    e.fill();
  }
  _drawProgressBar(e) {
    const t = this.contentArea.height * 0.2, r = this.contentArea.y + this.contentArea.height - t - this.options.backgroundPadding, o = this.contentArea.x + this.options.backgroundPadding, a = this.contentArea.width - this.options.backgroundPadding * 2;
    e.save(), e.fillStyle = "rgba(0, 122, 255, 1)", e.fillRect(o, r, a * this._progressValue, t), e.restore();
  }
  _createRoundedRectPath(e, t, r, o, a, u) {
    e.beginPath(), e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r), e.closePath();
  }
  _createMaterial() {
    this.material = new Mg(`richTextMaterial_${this.id}`, this.scene), this.texture && (this.material.diffuseTexture = this.texture), this.material.specularColor = new Mr(0, 0, 0), this.material.emissiveColor = new Mr(1, 1, 1), this.material.backFaceCulling = !1, this.material.useAlphaFromDiffuseTexture = !0, this.material.alphaMode = Ga.ALPHA_COMBINE;
  }
  _createMesh() {
    const e = this.options.fontSize / 48, t = this.actualDimensions.width / this.actualDimensions.height, r = e, o = t * e;
    this.mesh = jn.CreatePlane(`richTextPlane_${this.id}`, {
      width: o,
      height: r,
      sideOrientation: ip.DOUBLESIDE
    }, this.scene), this.mesh.material = this.material, this.mesh.billboardMode = this.options.billboardMode;
  }
  _attachToTarget() {
    const e = this.options.attachTo, t = this.options.attachPosition, r = this.options.attachOffset;
    if (!this.mesh)
      return;
    let o, a;
    if (e instanceof kt)
      o = e.clone(), a = {
        min: o.clone(),
        max: o.clone()
      };
    else if (e && "getBoundingInfo" in e && e instanceof b5) {
      this.mesh.parent = e, o = kt.Zero();
      const d = e.getBoundingInfo();
      a = {
        min: d.boundingBox.minimum,
        max: d.boundingBox.maximum
      };
    } else {
      this.mesh.position = new kt(
        this.options.position.x,
        this.options.position.y,
        this.options.position.z
      );
      return;
    }
    const u = this.options.fontSize / 48, h = this.actualDimensions.width / this.actualDimensions.height * u, c = u, f = o.clone();
    if (this.options.pointer && this.options.pointerDirection === "auto" && this.pointerInfo) {
      switch (t) {
        case "top":
        case "top-left":
        case "top-right":
          this.pointerInfo.direction = "bottom";
          break;
        case "bottom":
        case "bottom-left":
        case "bottom-right":
          this.pointerInfo.direction = "top";
          break;
        case "left":
          this.pointerInfo.direction = "right";
          break;
        case "right":
          this.pointerInfo.direction = "left";
          break;
        default:
          this.pointerInfo.direction = "bottom";
      }
      this._calculateDimensions(), this._drawContent();
    }
    switch (t) {
      case "top-left":
        f.x = a.min.x - h / 2 - r, f.y = a.max.y + c / 2 + r;
        break;
      case "top":
        f.x = (a.min.x + a.max.x) / 2, f.y = a.max.y + c / 2 + r;
        break;
      case "top-right":
        f.x = a.max.x + h / 2 + r, f.y = a.max.y + c / 2 + r;
        break;
      case "left":
        f.x = a.min.x - h / 2 - r, f.y = (a.min.y + a.max.y) / 2;
        break;
      case "center":
        f.x = (a.min.x + a.max.x) / 2, f.y = (a.min.y + a.max.y) / 2;
        break;
      case "right":
        f.x = a.max.x + h / 2 + r, f.y = (a.min.y + a.max.y) / 2;
        break;
      case "bottom-left":
        f.x = a.min.x - h / 2 - r, f.y = a.min.y - c / 2 - r;
        break;
      case "bottom":
        f.x = (a.min.x + a.max.x) / 2, f.y = a.min.y - c / 2 - r;
        break;
      case "bottom-right":
        f.x = a.max.x + h / 2 + r, f.y = a.min.y - c / 2 - r;
        break;
      default:
        f.y = a.max.y + c / 2 + r;
    }
    this.mesh.position = f, this.originalPosition ?? (this.originalPosition = f.clone()), this.animator && this.animator.updateOriginalPosition(f);
  }
  _setupDepthFading() {
    const e = this.scene.activeCamera;
    this.scene.registerBeforeRender(() => {
      if (!e || !this.mesh || !this.material)
        return;
      const t = kt.Distance(e.position, this.mesh.position);
      let r = 1;
      if (t < this.options.depthFadeNear)
        r = 1;
      else if (t > this.options.depthFadeFar)
        r = 0;
      else {
        const o = this.options.depthFadeFar - this.options.depthFadeNear;
        r = 1 - (t - this.options.depthFadeNear) / o;
      }
      this.material.alpha = r;
    });
  }
  setText(e) {
    if (this.options.smartOverflow && !isNaN(Number(e))) {
      const t = parseInt(e);
      t > this.options.maxNumber ? t >= 1e3 ? this.options.text = `${Math.floor(t / 1e3)}k` : this.options.text = `${this.options.maxNumber}${this.options.overflowSuffix}` : this.options.text = e;
    } else
      this.options.text = e;
    this._parseRichText(), this._calculateDimensions(), this._drawContent();
  }
  setProgress(e) {
    this._progressValue = Math.max(0, Math.min(1, e)), this._drawContent();
  }
  attachTo(e, t = "top", r = 0.5) {
    var o;
    this.options.attachTo = e, this.options.attachPosition = t, this.options.attachOffset = r, (o = this.mesh) != null && o.parent && this.mesh.parent !== e && (this.mesh.parent = null), this._attachToTarget();
  }
  dispose() {
    this.animator && this.animator.dispose(), this.mesh && this.mesh.dispose(), this.material && this.material.dispose(), this.texture && this.texture.dispose();
  }
  get labelMesh() {
    return this.mesh;
  }
  get labelId() {
    return this.id;
  }
}
var Jo = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var wA = Jo.exports, E0;
function xA() {
  return E0 || (E0 = 1, function(n, e) {
    (function() {
      var t, r = "4.17.21", o = 200, a = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", u = "Expected a function", h = "Invalid `variable` option passed into `_.template`", c = "__lodash_hash_undefined__", f = 500, d = "__lodash_placeholder__", g = 1, v = 2, b = 4, _ = 1, O = 2, E = 1, S = 2, k = 4, C = 8, A = 16, N = 32, L = 64, F = 128, H = 256, se = 512, be = 30, ge = "...", pe = 800, Je = 16, Le = 1, rt = 2, We = 3, te = 1 / 0, oe = 9007199254740991, re = 17976931348623157e292, ce = NaN, ve = 4294967295, xe = ve - 1, Re = ve >>> 1, Ve = [
        ["ary", F],
        ["bind", E],
        ["bindKey", S],
        ["curry", C],
        ["curryRight", A],
        ["flip", se],
        ["partial", N],
        ["partialRight", L],
        ["rearg", H]
      ], ae = "[object Arguments]", ee = "[object Array]", U = "[object AsyncFunction]", G = "[object Boolean]", J = "[object Date]", he = "[object DOMException]", we = "[object Error]", Ue = "[object Function]", wt = "[object GeneratorFunction]", ke = "[object Map]", tt = "[object Number]", Nt = "[object Null]", xt = "[object Object]", Nn = "[object Promise]", Se = "[object Proxy]", Ft = "[object RegExp]", Qe = "[object Set]", yn = "[object String]", Rn = "[object Symbol]", wo = "[object Undefined]", cr = "[object WeakMap]", x = "[object WeakSet]", P = "[object ArrayBuffer]", z = "[object DataView]", W = "[object Float32Array]", Q = "[object Float64Array]", le = "[object Int8Array]", Ae = "[object Int16Array]", Be = "[object Int32Array]", St = "[object Uint8Array]", Kt = "[object Uint8ClampedArray]", ut = "[object Uint16Array]", Te = "[object Uint32Array]", Wt = /\b__p \+= '';/g, xo = /\b(__p \+=) '' \+/g, oi = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Pr = /&(?:amp|lt|gt|quot|#39);/g, Or = /[&<>"']/g, hr = RegExp(Pr.source), Jt = RegExp(Or.source), zi = /<%-([\s\S]+?)%>/g, si = /<%([\s\S]+?)%>/g, kr = /<%=([\s\S]+?)%>/g, ai = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ui = /^\w*$/, $r = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, zn = /[\\^$.*+?()[\]{}|]/g, Di = RegExp(zn.source), Nr = /^\s+/, Es = /\s/, To = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Ru = /\{\n\/\* \[wrapped with (.+)\] \*/, As = /,? & /, zu = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Is = /[()=,{}\[\]\/\s]/, Ps = /\\(\\)?/g, Os = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, So = /\w*$/, Co = /^[-+]0x[0-9a-f]+$/i, fr = /^0b[01]+$/i, li = /^\[object .+?Constructor\]$/, ci = /^0o[0-7]+$/i, Li = /^(?:0|[1-9]\d*)$/, Mo = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Bi = /($^)/, Du = /['\n\r\u2028\u2029\\]/g, dr = "\\ud800-\\udfff", sn = "\\u0300-\\u036f", Rr = "\\ufe20-\\ufe2f", ir = "\\u20d0-\\u20ff", Dn = sn + Rr + ir, zr = "\\u2700-\\u27bf", bn = "a-z\\xdf-\\xf6\\xf8-\\xff", Yn = "\\xac\\xb1\\xd7\\xf7", ks = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", $s = "\\u2000-\\u206f", Fi = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", an = "A-Z\\xc0-\\xd6\\xd8-\\xde", hi = "\\ufe0e\\ufe0f", Ui = Yn + ks + $s + Fi, fi = "['’]", Eo = "[" + dr + "]", Zi = "[" + Ui + "]", pr = "[" + Dn + "]", Qn = "\\d+", Lu = "[" + zr + "]", Ao = "[" + bn + "]", qi = "[^" + dr + Ui + Qn + zr + bn + an + "]", Hi = "\\ud83c[\\udffb-\\udfff]", Bu = "(?:" + pr + "|" + Hi + ")", Ns = "[^" + dr + "]", y = "(?:\\ud83c[\\udde6-\\uddff]){2}", M = "[\\ud800-\\udbff][\\udc00-\\udfff]", $ = "[" + an + "]", Z = "\\u200d", ie = "(?:" + Ao + "|" + qi + ")", fe = "(?:" + $ + "|" + qi + ")", ze = "(?:" + fi + "(?:d|ll|m|re|s|t|ve))?", Ct = "(?:" + fi + "(?:D|LL|M|RE|S|T|VE))?", At = Bu + "?", Rt = "[" + hi + "]?", Ln = "(?:" + Z + "(?:" + [Ns, y, M].join("|") + ")" + Rt + At + ")*", wv = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", xv = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", jh = Rt + At + Ln, Tv = "(?:" + [Lu, y, M].join("|") + ")" + jh, Sv = "(?:" + [Ns + pr + "?", pr, y, M, Eo].join("|") + ")", Cv = RegExp(fi, "g"), Mv = RegExp(pr, "g"), Fu = RegExp(Hi + "(?=" + Hi + ")|" + Sv + jh, "g"), Ev = RegExp([
        $ + "?" + Ao + "+" + ze + "(?=" + [Zi, $, "$"].join("|") + ")",
        fe + "+" + Ct + "(?=" + [Zi, $ + ie, "$"].join("|") + ")",
        $ + "?" + ie + "+" + ze,
        $ + "+" + Ct,
        xv,
        wv,
        Qn,
        Tv
      ].join("|"), "g"), Av = RegExp("[" + Z + dr + Dn + hi + "]"), Iv = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Pv = [
        "Array",
        "Buffer",
        "DataView",
        "Date",
        "Error",
        "Float32Array",
        "Float64Array",
        "Function",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "Map",
        "Math",
        "Object",
        "Promise",
        "RegExp",
        "Set",
        "String",
        "Symbol",
        "TypeError",
        "Uint8Array",
        "Uint8ClampedArray",
        "Uint16Array",
        "Uint32Array",
        "WeakMap",
        "_",
        "clearTimeout",
        "isFinite",
        "parseInt",
        "setTimeout"
      ], Ov = -1, lt = {};
      lt[W] = lt[Q] = lt[le] = lt[Ae] = lt[Be] = lt[St] = lt[Kt] = lt[ut] = lt[Te] = !0, lt[ae] = lt[ee] = lt[P] = lt[G] = lt[z] = lt[J] = lt[we] = lt[Ue] = lt[ke] = lt[tt] = lt[xt] = lt[Ft] = lt[Qe] = lt[yn] = lt[cr] = !1;
      var at = {};
      at[ae] = at[ee] = at[P] = at[z] = at[G] = at[J] = at[W] = at[Q] = at[le] = at[Ae] = at[Be] = at[ke] = at[tt] = at[xt] = at[Ft] = at[Qe] = at[yn] = at[Rn] = at[St] = at[Kt] = at[ut] = at[Te] = !0, at[we] = at[Ue] = at[cr] = !1;
      var kv = {
        // Latin-1 Supplement block.
        À: "A",
        Á: "A",
        Â: "A",
        Ã: "A",
        Ä: "A",
        Å: "A",
        à: "a",
        á: "a",
        â: "a",
        ã: "a",
        ä: "a",
        å: "a",
        Ç: "C",
        ç: "c",
        Ð: "D",
        ð: "d",
        È: "E",
        É: "E",
        Ê: "E",
        Ë: "E",
        è: "e",
        é: "e",
        ê: "e",
        ë: "e",
        Ì: "I",
        Í: "I",
        Î: "I",
        Ï: "I",
        ì: "i",
        í: "i",
        î: "i",
        ï: "i",
        Ñ: "N",
        ñ: "n",
        Ò: "O",
        Ó: "O",
        Ô: "O",
        Õ: "O",
        Ö: "O",
        Ø: "O",
        ò: "o",
        ó: "o",
        ô: "o",
        õ: "o",
        ö: "o",
        ø: "o",
        Ù: "U",
        Ú: "U",
        Û: "U",
        Ü: "U",
        ù: "u",
        ú: "u",
        û: "u",
        ü: "u",
        Ý: "Y",
        ý: "y",
        ÿ: "y",
        Æ: "Ae",
        æ: "ae",
        Þ: "Th",
        þ: "th",
        ß: "ss",
        // Latin Extended-A block.
        Ā: "A",
        Ă: "A",
        Ą: "A",
        ā: "a",
        ă: "a",
        ą: "a",
        Ć: "C",
        Ĉ: "C",
        Ċ: "C",
        Č: "C",
        ć: "c",
        ĉ: "c",
        ċ: "c",
        č: "c",
        Ď: "D",
        Đ: "D",
        ď: "d",
        đ: "d",
        Ē: "E",
        Ĕ: "E",
        Ė: "E",
        Ę: "E",
        Ě: "E",
        ē: "e",
        ĕ: "e",
        ė: "e",
        ę: "e",
        ě: "e",
        Ĝ: "G",
        Ğ: "G",
        Ġ: "G",
        Ģ: "G",
        ĝ: "g",
        ğ: "g",
        ġ: "g",
        ģ: "g",
        Ĥ: "H",
        Ħ: "H",
        ĥ: "h",
        ħ: "h",
        Ĩ: "I",
        Ī: "I",
        Ĭ: "I",
        Į: "I",
        İ: "I",
        ĩ: "i",
        ī: "i",
        ĭ: "i",
        į: "i",
        ı: "i",
        Ĵ: "J",
        ĵ: "j",
        Ķ: "K",
        ķ: "k",
        ĸ: "k",
        Ĺ: "L",
        Ļ: "L",
        Ľ: "L",
        Ŀ: "L",
        Ł: "L",
        ĺ: "l",
        ļ: "l",
        ľ: "l",
        ŀ: "l",
        ł: "l",
        Ń: "N",
        Ņ: "N",
        Ň: "N",
        Ŋ: "N",
        ń: "n",
        ņ: "n",
        ň: "n",
        ŋ: "n",
        Ō: "O",
        Ŏ: "O",
        Ő: "O",
        ō: "o",
        ŏ: "o",
        ő: "o",
        Ŕ: "R",
        Ŗ: "R",
        Ř: "R",
        ŕ: "r",
        ŗ: "r",
        ř: "r",
        Ś: "S",
        Ŝ: "S",
        Ş: "S",
        Š: "S",
        ś: "s",
        ŝ: "s",
        ş: "s",
        š: "s",
        Ţ: "T",
        Ť: "T",
        Ŧ: "T",
        ţ: "t",
        ť: "t",
        ŧ: "t",
        Ũ: "U",
        Ū: "U",
        Ŭ: "U",
        Ů: "U",
        Ű: "U",
        Ų: "U",
        ũ: "u",
        ū: "u",
        ŭ: "u",
        ů: "u",
        ű: "u",
        ų: "u",
        Ŵ: "W",
        ŵ: "w",
        Ŷ: "Y",
        ŷ: "y",
        Ÿ: "Y",
        Ź: "Z",
        Ż: "Z",
        Ž: "Z",
        ź: "z",
        ż: "z",
        ž: "z",
        Ĳ: "IJ",
        ĳ: "ij",
        Œ: "Oe",
        œ: "oe",
        ŉ: "'n",
        ſ: "s"
      }, $v = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }, Nv = {
        "&amp;": "&",
        "&lt;": "<",
        "&gt;": ">",
        "&quot;": '"',
        "&#39;": "'"
      }, Rv = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "\u2028": "u2028",
        "\u2029": "u2029"
      }, zv = parseFloat, Dv = parseInt, Vh = typeof $a == "object" && $a && $a.Object === Object && $a, Lv = typeof self == "object" && self && self.Object === Object && self, Ut = Vh || Lv || Function("return this")(), Uu = e && !e.nodeType && e, di = Uu && !0 && n && !n.nodeType && n, Kh = di && di.exports === Uu, Zu = Kh && Vh.process, Bn = function() {
        try {
          var D = di && di.require && di.require("util").types;
          return D || Zu && Zu.binding && Zu.binding("util");
        } catch {
        }
      }(), Jh = Bn && Bn.isArrayBuffer, Yh = Bn && Bn.isDate, Qh = Bn && Bn.isMap, Xh = Bn && Bn.isRegExp, ef = Bn && Bn.isSet, tf = Bn && Bn.isTypedArray;
      function wn(D, j, q) {
        switch (q.length) {
          case 0:
            return D.call(j);
          case 1:
            return D.call(j, q[0]);
          case 2:
            return D.call(j, q[0], q[1]);
          case 3:
            return D.call(j, q[0], q[1], q[2]);
        }
        return D.apply(j, q);
      }
      function Bv(D, j, q, de) {
        for (var Pe = -1, Ye = D == null ? 0 : D.length; ++Pe < Ye; ) {
          var Pt = D[Pe];
          j(de, Pt, q(Pt), D);
        }
        return de;
      }
      function Fn(D, j) {
        for (var q = -1, de = D == null ? 0 : D.length; ++q < de && j(D[q], q, D) !== !1; )
          ;
        return D;
      }
      function Fv(D, j) {
        for (var q = D == null ? 0 : D.length; q-- && j(D[q], q, D) !== !1; )
          ;
        return D;
      }
      function nf(D, j) {
        for (var q = -1, de = D == null ? 0 : D.length; ++q < de; )
          if (!j(D[q], q, D))
            return !1;
        return !0;
      }
      function Dr(D, j) {
        for (var q = -1, de = D == null ? 0 : D.length, Pe = 0, Ye = []; ++q < de; ) {
          var Pt = D[q];
          j(Pt, q, D) && (Ye[Pe++] = Pt);
        }
        return Ye;
      }
      function Rs(D, j) {
        var q = D == null ? 0 : D.length;
        return !!q && Wi(D, j, 0) > -1;
      }
      function qu(D, j, q) {
        for (var de = -1, Pe = D == null ? 0 : D.length; ++de < Pe; )
          if (q(j, D[de]))
            return !0;
        return !1;
      }
      function ht(D, j) {
        for (var q = -1, de = D == null ? 0 : D.length, Pe = Array(de); ++q < de; )
          Pe[q] = j(D[q], q, D);
        return Pe;
      }
      function Lr(D, j) {
        for (var q = -1, de = j.length, Pe = D.length; ++q < de; )
          D[Pe + q] = j[q];
        return D;
      }
      function Hu(D, j, q, de) {
        var Pe = -1, Ye = D == null ? 0 : D.length;
        for (de && Ye && (q = D[++Pe]); ++Pe < Ye; )
          q = j(q, D[Pe], Pe, D);
        return q;
      }
      function Uv(D, j, q, de) {
        var Pe = D == null ? 0 : D.length;
        for (de && Pe && (q = D[--Pe]); Pe--; )
          q = j(q, D[Pe], Pe, D);
        return q;
      }
      function Wu(D, j) {
        for (var q = -1, de = D == null ? 0 : D.length; ++q < de; )
          if (j(D[q], q, D))
            return !0;
        return !1;
      }
      var Zv = Gu("length");
      function qv(D) {
        return D.split("");
      }
      function Hv(D) {
        return D.match(zu) || [];
      }
      function rf(D, j, q) {
        var de;
        return q(D, function(Pe, Ye, Pt) {
          if (j(Pe, Ye, Pt))
            return de = Ye, !1;
        }), de;
      }
      function zs(D, j, q, de) {
        for (var Pe = D.length, Ye = q + (de ? 1 : -1); de ? Ye-- : ++Ye < Pe; )
          if (j(D[Ye], Ye, D))
            return Ye;
        return -1;
      }
      function Wi(D, j, q) {
        return j === j ? n1(D, j, q) : zs(D, of, q);
      }
      function Wv(D, j, q, de) {
        for (var Pe = q - 1, Ye = D.length; ++Pe < Ye; )
          if (de(D[Pe], j))
            return Pe;
        return -1;
      }
      function of(D) {
        return D !== D;
      }
      function sf(D, j) {
        var q = D == null ? 0 : D.length;
        return q ? Vu(D, j) / q : ce;
      }
      function Gu(D) {
        return function(j) {
          return j == null ? t : j[D];
        };
      }
      function ju(D) {
        return function(j) {
          return D == null ? t : D[j];
        };
      }
      function af(D, j, q, de, Pe) {
        return Pe(D, function(Ye, Pt, it) {
          q = de ? (de = !1, Ye) : j(q, Ye, Pt, it);
        }), q;
      }
      function Gv(D, j) {
        var q = D.length;
        for (D.sort(j); q--; )
          D[q] = D[q].value;
        return D;
      }
      function Vu(D, j) {
        for (var q, de = -1, Pe = D.length; ++de < Pe; ) {
          var Ye = j(D[de]);
          Ye !== t && (q = q === t ? Ye : q + Ye);
        }
        return q;
      }
      function Ku(D, j) {
        for (var q = -1, de = Array(D); ++q < D; )
          de[q] = j(q);
        return de;
      }
      function jv(D, j) {
        return ht(j, function(q) {
          return [q, D[q]];
        });
      }
      function uf(D) {
        return D && D.slice(0, ff(D) + 1).replace(Nr, "");
      }
      function xn(D) {
        return function(j) {
          return D(j);
        };
      }
      function Ju(D, j) {
        return ht(j, function(q) {
          return D[q];
        });
      }
      function Io(D, j) {
        return D.has(j);
      }
      function lf(D, j) {
        for (var q = -1, de = D.length; ++q < de && Wi(j, D[q], 0) > -1; )
          ;
        return q;
      }
      function cf(D, j) {
        for (var q = D.length; q-- && Wi(j, D[q], 0) > -1; )
          ;
        return q;
      }
      function Vv(D, j) {
        for (var q = D.length, de = 0; q--; )
          D[q] === j && ++de;
        return de;
      }
      var Kv = ju(kv), Jv = ju($v);
      function Yv(D) {
        return "\\" + Rv[D];
      }
      function Qv(D, j) {
        return D == null ? t : D[j];
      }
      function Gi(D) {
        return Av.test(D);
      }
      function Xv(D) {
        return Iv.test(D);
      }
      function e1(D) {
        for (var j, q = []; !(j = D.next()).done; )
          q.push(j.value);
        return q;
      }
      function Yu(D) {
        var j = -1, q = Array(D.size);
        return D.forEach(function(de, Pe) {
          q[++j] = [Pe, de];
        }), q;
      }
      function hf(D, j) {
        return function(q) {
          return D(j(q));
        };
      }
      function Br(D, j) {
        for (var q = -1, de = D.length, Pe = 0, Ye = []; ++q < de; ) {
          var Pt = D[q];
          (Pt === j || Pt === d) && (D[q] = d, Ye[Pe++] = q);
        }
        return Ye;
      }
      function Ds(D) {
        var j = -1, q = Array(D.size);
        return D.forEach(function(de) {
          q[++j] = de;
        }), q;
      }
      function t1(D) {
        var j = -1, q = Array(D.size);
        return D.forEach(function(de) {
          q[++j] = [de, de];
        }), q;
      }
      function n1(D, j, q) {
        for (var de = q - 1, Pe = D.length; ++de < Pe; )
          if (D[de] === j)
            return de;
        return -1;
      }
      function r1(D, j, q) {
        for (var de = q + 1; de--; )
          if (D[de] === j)
            return de;
        return de;
      }
      function ji(D) {
        return Gi(D) ? o1(D) : Zv(D);
      }
      function Xn(D) {
        return Gi(D) ? s1(D) : qv(D);
      }
      function ff(D) {
        for (var j = D.length; j-- && Es.test(D.charAt(j)); )
          ;
        return j;
      }
      var i1 = ju(Nv);
      function o1(D) {
        for (var j = Fu.lastIndex = 0; Fu.test(D); )
          ++j;
        return j;
      }
      function s1(D) {
        return D.match(Fu) || [];
      }
      function a1(D) {
        return D.match(Ev) || [];
      }
      var u1 = function D(j) {
        j = j == null ? Ut : Vi.defaults(Ut.Object(), j, Vi.pick(Ut, Pv));
        var q = j.Array, de = j.Date, Pe = j.Error, Ye = j.Function, Pt = j.Math, it = j.Object, Qu = j.RegExp, l1 = j.String, Un = j.TypeError, Ls = q.prototype, c1 = Ye.prototype, Ki = it.prototype, Bs = j["__core-js_shared__"], Fs = c1.toString, et = Ki.hasOwnProperty, h1 = 0, df = function() {
          var i = /[^.]+$/.exec(Bs && Bs.keys && Bs.keys.IE_PROTO || "");
          return i ? "Symbol(src)_1." + i : "";
        }(), Us = Ki.toString, f1 = Fs.call(it), d1 = Ut._, p1 = Qu(
          "^" + Fs.call(et).replace(zn, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), Zs = Kh ? j.Buffer : t, Fr = j.Symbol, qs = j.Uint8Array, pf = Zs ? Zs.allocUnsafe : t, Hs = hf(it.getPrototypeOf, it), gf = it.create, mf = Ki.propertyIsEnumerable, Ws = Ls.splice, vf = Fr ? Fr.isConcatSpreadable : t, Po = Fr ? Fr.iterator : t, pi = Fr ? Fr.toStringTag : t, Gs = function() {
          try {
            var i = yi(it, "defineProperty");
            return i({}, "", {}), i;
          } catch {
          }
        }(), g1 = j.clearTimeout !== Ut.clearTimeout && j.clearTimeout, m1 = de && de.now !== Ut.Date.now && de.now, v1 = j.setTimeout !== Ut.setTimeout && j.setTimeout, js = Pt.ceil, Vs = Pt.floor, Xu = it.getOwnPropertySymbols, _1 = Zs ? Zs.isBuffer : t, _f = j.isFinite, y1 = Ls.join, b1 = hf(it.keys, it), Ot = Pt.max, Gt = Pt.min, w1 = de.now, x1 = j.parseInt, yf = Pt.random, T1 = Ls.reverse, el = yi(j, "DataView"), Oo = yi(j, "Map"), tl = yi(j, "Promise"), Ji = yi(j, "Set"), ko = yi(j, "WeakMap"), $o = yi(it, "create"), Ks = ko && new ko(), Yi = {}, S1 = bi(el), C1 = bi(Oo), M1 = bi(tl), E1 = bi(Ji), A1 = bi(ko), Js = Fr ? Fr.prototype : t, No = Js ? Js.valueOf : t, bf = Js ? Js.toString : t;
        function w(i) {
          if (Tt(i) && !Oe(i) && !(i instanceof He)) {
            if (i instanceof Zn)
              return i;
            if (et.call(i, "__wrapped__"))
              return wd(i);
          }
          return new Zn(i);
        }
        var Qi = /* @__PURE__ */ function() {
          function i() {
          }
          return function(s) {
            if (!mt(s))
              return {};
            if (gf)
              return gf(s);
            i.prototype = s;
            var l = new i();
            return i.prototype = t, l;
          };
        }();
        function Ys() {
        }
        function Zn(i, s) {
          this.__wrapped__ = i, this.__actions__ = [], this.__chain__ = !!s, this.__index__ = 0, this.__values__ = t;
        }
        w.templateSettings = {
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          escape: zi,
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          evaluate: si,
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type {RegExp}
           */
          interpolate: kr,
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type {string}
           */
          variable: "",
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type {Object}
           */
          imports: {
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type {Function}
             */
            _: w
          }
        }, w.prototype = Ys.prototype, w.prototype.constructor = w, Zn.prototype = Qi(Ys.prototype), Zn.prototype.constructor = Zn;
        function He(i) {
          this.__wrapped__ = i, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = ve, this.__views__ = [];
        }
        function I1() {
          var i = new He(this.__wrapped__);
          return i.__actions__ = un(this.__actions__), i.__dir__ = this.__dir__, i.__filtered__ = this.__filtered__, i.__iteratees__ = un(this.__iteratees__), i.__takeCount__ = this.__takeCount__, i.__views__ = un(this.__views__), i;
        }
        function P1() {
          if (this.__filtered__) {
            var i = new He(this);
            i.__dir__ = -1, i.__filtered__ = !0;
          } else
            i = this.clone(), i.__dir__ *= -1;
          return i;
        }
        function O1() {
          var i = this.__wrapped__.value(), s = this.__dir__, l = Oe(i), p = s < 0, m = l ? i.length : 0, T = q_(0, m, this.__views__), I = T.start, R = T.end, B = R - I, Y = p ? R : I - 1, X = this.__iteratees__, ne = X.length, ue = 0, _e = Gt(B, this.__takeCount__);
          if (!l || !p && m == B && _e == B)
            return Hf(i, this.__actions__);
          var Me = [];
          e:
            for (; B-- && ue < _e; ) {
              Y += s;
              for (var De = -1, Ee = i[Y]; ++De < ne; ) {
                var Ze = X[De], Ge = Ze.iteratee, Cn = Ze.type, Xt = Ge(Ee);
                if (Cn == rt)
                  Ee = Xt;
                else if (!Xt) {
                  if (Cn == Le)
                    continue e;
                  break e;
                }
              }
              Me[ue++] = Ee;
            }
          return Me;
        }
        He.prototype = Qi(Ys.prototype), He.prototype.constructor = He;
        function gi(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.clear(); ++s < l; ) {
            var p = i[s];
            this.set(p[0], p[1]);
          }
        }
        function k1() {
          this.__data__ = $o ? $o(null) : {}, this.size = 0;
        }
        function $1(i) {
          var s = this.has(i) && delete this.__data__[i];
          return this.size -= s ? 1 : 0, s;
        }
        function N1(i) {
          var s = this.__data__;
          if ($o) {
            var l = s[i];
            return l === c ? t : l;
          }
          return et.call(s, i) ? s[i] : t;
        }
        function R1(i) {
          var s = this.__data__;
          return $o ? s[i] !== t : et.call(s, i);
        }
        function z1(i, s) {
          var l = this.__data__;
          return this.size += this.has(i) ? 0 : 1, l[i] = $o && s === t ? c : s, this;
        }
        gi.prototype.clear = k1, gi.prototype.delete = $1, gi.prototype.get = N1, gi.prototype.has = R1, gi.prototype.set = z1;
        function gr(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.clear(); ++s < l; ) {
            var p = i[s];
            this.set(p[0], p[1]);
          }
        }
        function D1() {
          this.__data__ = [], this.size = 0;
        }
        function L1(i) {
          var s = this.__data__, l = Qs(s, i);
          if (l < 0)
            return !1;
          var p = s.length - 1;
          return l == p ? s.pop() : Ws.call(s, l, 1), --this.size, !0;
        }
        function B1(i) {
          var s = this.__data__, l = Qs(s, i);
          return l < 0 ? t : s[l][1];
        }
        function F1(i) {
          return Qs(this.__data__, i) > -1;
        }
        function U1(i, s) {
          var l = this.__data__, p = Qs(l, i);
          return p < 0 ? (++this.size, l.push([i, s])) : l[p][1] = s, this;
        }
        gr.prototype.clear = D1, gr.prototype.delete = L1, gr.prototype.get = B1, gr.prototype.has = F1, gr.prototype.set = U1;
        function mr(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.clear(); ++s < l; ) {
            var p = i[s];
            this.set(p[0], p[1]);
          }
        }
        function Z1() {
          this.size = 0, this.__data__ = {
            hash: new gi(),
            map: new (Oo || gr)(),
            string: new gi()
          };
        }
        function q1(i) {
          var s = ca(this, i).delete(i);
          return this.size -= s ? 1 : 0, s;
        }
        function H1(i) {
          return ca(this, i).get(i);
        }
        function W1(i) {
          return ca(this, i).has(i);
        }
        function G1(i, s) {
          var l = ca(this, i), p = l.size;
          return l.set(i, s), this.size += l.size == p ? 0 : 1, this;
        }
        mr.prototype.clear = Z1, mr.prototype.delete = q1, mr.prototype.get = H1, mr.prototype.has = W1, mr.prototype.set = G1;
        function mi(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.__data__ = new mr(); ++s < l; )
            this.add(i[s]);
        }
        function j1(i) {
          return this.__data__.set(i, c), this;
        }
        function V1(i) {
          return this.__data__.has(i);
        }
        mi.prototype.add = mi.prototype.push = j1, mi.prototype.has = V1;
        function er(i) {
          var s = this.__data__ = new gr(i);
          this.size = s.size;
        }
        function K1() {
          this.__data__ = new gr(), this.size = 0;
        }
        function J1(i) {
          var s = this.__data__, l = s.delete(i);
          return this.size = s.size, l;
        }
        function Y1(i) {
          return this.__data__.get(i);
        }
        function Q1(i) {
          return this.__data__.has(i);
        }
        function X1(i, s) {
          var l = this.__data__;
          if (l instanceof gr) {
            var p = l.__data__;
            if (!Oo || p.length < o - 1)
              return p.push([i, s]), this.size = ++l.size, this;
            l = this.__data__ = new mr(p);
          }
          return l.set(i, s), this.size = l.size, this;
        }
        er.prototype.clear = K1, er.prototype.delete = J1, er.prototype.get = Y1, er.prototype.has = Q1, er.prototype.set = X1;
        function wf(i, s) {
          var l = Oe(i), p = !l && wi(i), m = !l && !p && Wr(i), T = !l && !p && !m && no(i), I = l || p || m || T, R = I ? Ku(i.length, l1) : [], B = R.length;
          for (var Y in i)
            (s || et.call(i, Y)) && !(I && // Safari 9 has enumerable `arguments.length` in strict mode.
            (Y == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            m && (Y == "offset" || Y == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            T && (Y == "buffer" || Y == "byteLength" || Y == "byteOffset") || // Skip index properties.
            br(Y, B))) && R.push(Y);
          return R;
        }
        function xf(i) {
          var s = i.length;
          return s ? i[fl(0, s - 1)] : t;
        }
        function e_(i, s) {
          return ha(un(i), vi(s, 0, i.length));
        }
        function t_(i) {
          return ha(un(i));
        }
        function nl(i, s, l) {
          (l !== t && !tr(i[s], l) || l === t && !(s in i)) && vr(i, s, l);
        }
        function Ro(i, s, l) {
          var p = i[s];
          (!(et.call(i, s) && tr(p, l)) || l === t && !(s in i)) && vr(i, s, l);
        }
        function Qs(i, s) {
          for (var l = i.length; l--; )
            if (tr(i[l][0], s))
              return l;
          return -1;
        }
        function n_(i, s, l, p) {
          return Ur(i, function(m, T, I) {
            s(p, m, l(m), I);
          }), p;
        }
        function Tf(i, s) {
          return i && sr(s, zt(s), i);
        }
        function r_(i, s) {
          return i && sr(s, cn(s), i);
        }
        function vr(i, s, l) {
          s == "__proto__" && Gs ? Gs(i, s, {
            configurable: !0,
            enumerable: !0,
            value: l,
            writable: !0
          }) : i[s] = l;
        }
        function rl(i, s) {
          for (var l = -1, p = s.length, m = q(p), T = i == null; ++l < p; )
            m[l] = T ? t : Dl(i, s[l]);
          return m;
        }
        function vi(i, s, l) {
          return i === i && (l !== t && (i = i <= l ? i : l), s !== t && (i = i >= s ? i : s)), i;
        }
        function qn(i, s, l, p, m, T) {
          var I, R = s & g, B = s & v, Y = s & b;
          if (l && (I = m ? l(i, p, m, T) : l(i)), I !== t)
            return I;
          if (!mt(i))
            return i;
          var X = Oe(i);
          if (X) {
            if (I = W_(i), !R)
              return un(i, I);
          } else {
            var ne = jt(i), ue = ne == Ue || ne == wt;
            if (Wr(i))
              return jf(i, R);
            if (ne == xt || ne == ae || ue && !m) {
              if (I = B || ue ? {} : fd(i), !R)
                return B ? N_(i, r_(I, i)) : $_(i, Tf(I, i));
            } else {
              if (!at[ne])
                return m ? i : {};
              I = G_(i, ne, R);
            }
          }
          T || (T = new er());
          var _e = T.get(i);
          if (_e)
            return _e;
          T.set(i, I), Ud(i) ? i.forEach(function(Ee) {
            I.add(qn(Ee, s, l, Ee, i, T));
          }) : Bd(i) && i.forEach(function(Ee, Ze) {
            I.set(Ze, qn(Ee, s, l, Ze, i, T));
          });
          var Me = Y ? B ? Tl : xl : B ? cn : zt, De = X ? t : Me(i);
          return Fn(De || i, function(Ee, Ze) {
            De && (Ze = Ee, Ee = i[Ze]), Ro(I, Ze, qn(Ee, s, l, Ze, i, T));
          }), I;
        }
        function i_(i) {
          var s = zt(i);
          return function(l) {
            return Sf(l, i, s);
          };
        }
        function Sf(i, s, l) {
          var p = l.length;
          if (i == null)
            return !p;
          for (i = it(i); p--; ) {
            var m = l[p], T = s[m], I = i[m];
            if (I === t && !(m in i) || !T(I))
              return !1;
          }
          return !0;
        }
        function Cf(i, s, l) {
          if (typeof i != "function")
            throw new Un(u);
          return Zo(function() {
            i.apply(t, l);
          }, s);
        }
        function zo(i, s, l, p) {
          var m = -1, T = Rs, I = !0, R = i.length, B = [], Y = s.length;
          if (!R)
            return B;
          l && (s = ht(s, xn(l))), p ? (T = qu, I = !1) : s.length >= o && (T = Io, I = !1, s = new mi(s));
          e:
            for (; ++m < R; ) {
              var X = i[m], ne = l == null ? X : l(X);
              if (X = p || X !== 0 ? X : 0, I && ne === ne) {
                for (var ue = Y; ue--; )
                  if (s[ue] === ne)
                    continue e;
                B.push(X);
              } else T(s, ne, p) || B.push(X);
            }
          return B;
        }
        var Ur = Qf(or), Mf = Qf(ol, !0);
        function o_(i, s) {
          var l = !0;
          return Ur(i, function(p, m, T) {
            return l = !!s(p, m, T), l;
          }), l;
        }
        function Xs(i, s, l) {
          for (var p = -1, m = i.length; ++p < m; ) {
            var T = i[p], I = s(T);
            if (I != null && (R === t ? I === I && !Sn(I) : l(I, R)))
              var R = I, B = T;
          }
          return B;
        }
        function s_(i, s, l, p) {
          var m = i.length;
          for (l = $e(l), l < 0 && (l = -l > m ? 0 : m + l), p = p === t || p > m ? m : $e(p), p < 0 && (p += m), p = l > p ? 0 : qd(p); l < p; )
            i[l++] = s;
          return i;
        }
        function Ef(i, s) {
          var l = [];
          return Ur(i, function(p, m, T) {
            s(p, m, T) && l.push(p);
          }), l;
        }
        function Zt(i, s, l, p, m) {
          var T = -1, I = i.length;
          for (l || (l = V_), m || (m = []); ++T < I; ) {
            var R = i[T];
            s > 0 && l(R) ? s > 1 ? Zt(R, s - 1, l, p, m) : Lr(m, R) : p || (m[m.length] = R);
          }
          return m;
        }
        var il = Xf(), Af = Xf(!0);
        function or(i, s) {
          return i && il(i, s, zt);
        }
        function ol(i, s) {
          return i && Af(i, s, zt);
        }
        function ea(i, s) {
          return Dr(s, function(l) {
            return wr(i[l]);
          });
        }
        function _i(i, s) {
          s = qr(s, i);
          for (var l = 0, p = s.length; i != null && l < p; )
            i = i[ar(s[l++])];
          return l && l == p ? i : t;
        }
        function If(i, s, l) {
          var p = s(i);
          return Oe(i) ? p : Lr(p, l(i));
        }
        function Yt(i) {
          return i == null ? i === t ? wo : Nt : pi && pi in it(i) ? Z_(i) : ty(i);
        }
        function sl(i, s) {
          return i > s;
        }
        function a_(i, s) {
          return i != null && et.call(i, s);
        }
        function u_(i, s) {
          return i != null && s in it(i);
        }
        function l_(i, s, l) {
          return i >= Gt(s, l) && i < Ot(s, l);
        }
        function al(i, s, l) {
          for (var p = l ? qu : Rs, m = i[0].length, T = i.length, I = T, R = q(T), B = 1 / 0, Y = []; I--; ) {
            var X = i[I];
            I && s && (X = ht(X, xn(s))), B = Gt(X.length, B), R[I] = !l && (s || m >= 120 && X.length >= 120) ? new mi(I && X) : t;
          }
          X = i[0];
          var ne = -1, ue = R[0];
          e:
            for (; ++ne < m && Y.length < B; ) {
              var _e = X[ne], Me = s ? s(_e) : _e;
              if (_e = l || _e !== 0 ? _e : 0, !(ue ? Io(ue, Me) : p(Y, Me, l))) {
                for (I = T; --I; ) {
                  var De = R[I];
                  if (!(De ? Io(De, Me) : p(i[I], Me, l)))
                    continue e;
                }
                ue && ue.push(Me), Y.push(_e);
              }
            }
          return Y;
        }
        function c_(i, s, l, p) {
          return or(i, function(m, T, I) {
            s(p, l(m), T, I);
          }), p;
        }
        function Do(i, s, l) {
          s = qr(s, i), i = md(i, s);
          var p = i == null ? i : i[ar(Wn(s))];
          return p == null ? t : wn(p, i, l);
        }
        function Pf(i) {
          return Tt(i) && Yt(i) == ae;
        }
        function h_(i) {
          return Tt(i) && Yt(i) == P;
        }
        function f_(i) {
          return Tt(i) && Yt(i) == J;
        }
        function Lo(i, s, l, p, m) {
          return i === s ? !0 : i == null || s == null || !Tt(i) && !Tt(s) ? i !== i && s !== s : d_(i, s, l, p, Lo, m);
        }
        function d_(i, s, l, p, m, T) {
          var I = Oe(i), R = Oe(s), B = I ? ee : jt(i), Y = R ? ee : jt(s);
          B = B == ae ? xt : B, Y = Y == ae ? xt : Y;
          var X = B == xt, ne = Y == xt, ue = B == Y;
          if (ue && Wr(i)) {
            if (!Wr(s))
              return !1;
            I = !0, X = !1;
          }
          if (ue && !X)
            return T || (T = new er()), I || no(i) ? ld(i, s, l, p, m, T) : F_(i, s, B, l, p, m, T);
          if (!(l & _)) {
            var _e = X && et.call(i, "__wrapped__"), Me = ne && et.call(s, "__wrapped__");
            if (_e || Me) {
              var De = _e ? i.value() : i, Ee = Me ? s.value() : s;
              return T || (T = new er()), m(De, Ee, l, p, T);
            }
          }
          return ue ? (T || (T = new er()), U_(i, s, l, p, m, T)) : !1;
        }
        function p_(i) {
          return Tt(i) && jt(i) == ke;
        }
        function ul(i, s, l, p) {
          var m = l.length, T = m, I = !p;
          if (i == null)
            return !T;
          for (i = it(i); m--; ) {
            var R = l[m];
            if (I && R[2] ? R[1] !== i[R[0]] : !(R[0] in i))
              return !1;
          }
          for (; ++m < T; ) {
            R = l[m];
            var B = R[0], Y = i[B], X = R[1];
            if (I && R[2]) {
              if (Y === t && !(B in i))
                return !1;
            } else {
              var ne = new er();
              if (p)
                var ue = p(Y, X, B, i, s, ne);
              if (!(ue === t ? Lo(X, Y, _ | O, p, ne) : ue))
                return !1;
            }
          }
          return !0;
        }
        function Of(i) {
          if (!mt(i) || J_(i))
            return !1;
          var s = wr(i) ? p1 : li;
          return s.test(bi(i));
        }
        function g_(i) {
          return Tt(i) && Yt(i) == Ft;
        }
        function m_(i) {
          return Tt(i) && jt(i) == Qe;
        }
        function v_(i) {
          return Tt(i) && va(i.length) && !!lt[Yt(i)];
        }
        function kf(i) {
          return typeof i == "function" ? i : i == null ? hn : typeof i == "object" ? Oe(i) ? Rf(i[0], i[1]) : Nf(i) : ep(i);
        }
        function ll(i) {
          if (!Uo(i))
            return b1(i);
          var s = [];
          for (var l in it(i))
            et.call(i, l) && l != "constructor" && s.push(l);
          return s;
        }
        function __(i) {
          if (!mt(i))
            return ey(i);
          var s = Uo(i), l = [];
          for (var p in i)
            p == "constructor" && (s || !et.call(i, p)) || l.push(p);
          return l;
        }
        function cl(i, s) {
          return i < s;
        }
        function $f(i, s) {
          var l = -1, p = ln(i) ? q(i.length) : [];
          return Ur(i, function(m, T, I) {
            p[++l] = s(m, T, I);
          }), p;
        }
        function Nf(i) {
          var s = Cl(i);
          return s.length == 1 && s[0][2] ? pd(s[0][0], s[0][1]) : function(l) {
            return l === i || ul(l, i, s);
          };
        }
        function Rf(i, s) {
          return El(i) && dd(s) ? pd(ar(i), s) : function(l) {
            var p = Dl(l, i);
            return p === t && p === s ? Ll(l, i) : Lo(s, p, _ | O);
          };
        }
        function ta(i, s, l, p, m) {
          i !== s && il(s, function(T, I) {
            if (m || (m = new er()), mt(T))
              y_(i, s, I, l, ta, p, m);
            else {
              var R = p ? p(Il(i, I), T, I + "", i, s, m) : t;
              R === t && (R = T), nl(i, I, R);
            }
          }, cn);
        }
        function y_(i, s, l, p, m, T, I) {
          var R = Il(i, l), B = Il(s, l), Y = I.get(B);
          if (Y) {
            nl(i, l, Y);
            return;
          }
          var X = T ? T(R, B, l + "", i, s, I) : t, ne = X === t;
          if (ne) {
            var ue = Oe(B), _e = !ue && Wr(B), Me = !ue && !_e && no(B);
            X = B, ue || _e || Me ? Oe(R) ? X = R : Mt(R) ? X = un(R) : _e ? (ne = !1, X = jf(B, !0)) : Me ? (ne = !1, X = Vf(B, !0)) : X = [] : qo(B) || wi(B) ? (X = R, wi(R) ? X = Hd(R) : (!mt(R) || wr(R)) && (X = fd(B))) : ne = !1;
          }
          ne && (I.set(B, X), m(X, B, p, T, I), I.delete(B)), nl(i, l, X);
        }
        function zf(i, s) {
          var l = i.length;
          if (l)
            return s += s < 0 ? l : 0, br(s, l) ? i[s] : t;
        }
        function Df(i, s, l) {
          s.length ? s = ht(s, function(T) {
            return Oe(T) ? function(I) {
              return _i(I, T.length === 1 ? T[0] : T);
            } : T;
          }) : s = [hn];
          var p = -1;
          s = ht(s, xn(Ce()));
          var m = $f(i, function(T, I, R) {
            var B = ht(s, function(Y) {
              return Y(T);
            });
            return { criteria: B, index: ++p, value: T };
          });
          return Gv(m, function(T, I) {
            return k_(T, I, l);
          });
        }
        function b_(i, s) {
          return Lf(i, s, function(l, p) {
            return Ll(i, p);
          });
        }
        function Lf(i, s, l) {
          for (var p = -1, m = s.length, T = {}; ++p < m; ) {
            var I = s[p], R = _i(i, I);
            l(R, I) && Bo(T, qr(I, i), R);
          }
          return T;
        }
        function w_(i) {
          return function(s) {
            return _i(s, i);
          };
        }
        function hl(i, s, l, p) {
          var m = p ? Wv : Wi, T = -1, I = s.length, R = i;
          for (i === s && (s = un(s)), l && (R = ht(i, xn(l))); ++T < I; )
            for (var B = 0, Y = s[T], X = l ? l(Y) : Y; (B = m(R, X, B, p)) > -1; )
              R !== i && Ws.call(R, B, 1), Ws.call(i, B, 1);
          return i;
        }
        function Bf(i, s) {
          for (var l = i ? s.length : 0, p = l - 1; l--; ) {
            var m = s[l];
            if (l == p || m !== T) {
              var T = m;
              br(m) ? Ws.call(i, m, 1) : gl(i, m);
            }
          }
          return i;
        }
        function fl(i, s) {
          return i + Vs(yf() * (s - i + 1));
        }
        function x_(i, s, l, p) {
          for (var m = -1, T = Ot(js((s - i) / (l || 1)), 0), I = q(T); T--; )
            I[p ? T : ++m] = i, i += l;
          return I;
        }
        function dl(i, s) {
          var l = "";
          if (!i || s < 1 || s > oe)
            return l;
          do
            s % 2 && (l += i), s = Vs(s / 2), s && (i += i);
          while (s);
          return l;
        }
        function Fe(i, s) {
          return Pl(gd(i, s, hn), i + "");
        }
        function T_(i) {
          return xf(ro(i));
        }
        function S_(i, s) {
          var l = ro(i);
          return ha(l, vi(s, 0, l.length));
        }
        function Bo(i, s, l, p) {
          if (!mt(i))
            return i;
          s = qr(s, i);
          for (var m = -1, T = s.length, I = T - 1, R = i; R != null && ++m < T; ) {
            var B = ar(s[m]), Y = l;
            if (B === "__proto__" || B === "constructor" || B === "prototype")
              return i;
            if (m != I) {
              var X = R[B];
              Y = p ? p(X, B, R) : t, Y === t && (Y = mt(X) ? X : br(s[m + 1]) ? [] : {});
            }
            Ro(R, B, Y), R = R[B];
          }
          return i;
        }
        var Ff = Ks ? function(i, s) {
          return Ks.set(i, s), i;
        } : hn, C_ = Gs ? function(i, s) {
          return Gs(i, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Fl(s),
            writable: !0
          });
        } : hn;
        function M_(i) {
          return ha(ro(i));
        }
        function Hn(i, s, l) {
          var p = -1, m = i.length;
          s < 0 && (s = -s > m ? 0 : m + s), l = l > m ? m : l, l < 0 && (l += m), m = s > l ? 0 : l - s >>> 0, s >>>= 0;
          for (var T = q(m); ++p < m; )
            T[p] = i[p + s];
          return T;
        }
        function E_(i, s) {
          var l;
          return Ur(i, function(p, m, T) {
            return l = s(p, m, T), !l;
          }), !!l;
        }
        function na(i, s, l) {
          var p = 0, m = i == null ? p : i.length;
          if (typeof s == "number" && s === s && m <= Re) {
            for (; p < m; ) {
              var T = p + m >>> 1, I = i[T];
              I !== null && !Sn(I) && (l ? I <= s : I < s) ? p = T + 1 : m = T;
            }
            return m;
          }
          return pl(i, s, hn, l);
        }
        function pl(i, s, l, p) {
          var m = 0, T = i == null ? 0 : i.length;
          if (T === 0)
            return 0;
          s = l(s);
          for (var I = s !== s, R = s === null, B = Sn(s), Y = s === t; m < T; ) {
            var X = Vs((m + T) / 2), ne = l(i[X]), ue = ne !== t, _e = ne === null, Me = ne === ne, De = Sn(ne);
            if (I)
              var Ee = p || Me;
            else Y ? Ee = Me && (p || ue) : R ? Ee = Me && ue && (p || !_e) : B ? Ee = Me && ue && !_e && (p || !De) : _e || De ? Ee = !1 : Ee = p ? ne <= s : ne < s;
            Ee ? m = X + 1 : T = X;
          }
          return Gt(T, xe);
        }
        function Uf(i, s) {
          for (var l = -1, p = i.length, m = 0, T = []; ++l < p; ) {
            var I = i[l], R = s ? s(I) : I;
            if (!l || !tr(R, B)) {
              var B = R;
              T[m++] = I === 0 ? 0 : I;
            }
          }
          return T;
        }
        function Zf(i) {
          return typeof i == "number" ? i : Sn(i) ? ce : +i;
        }
        function Tn(i) {
          if (typeof i == "string")
            return i;
          if (Oe(i))
            return ht(i, Tn) + "";
          if (Sn(i))
            return bf ? bf.call(i) : "";
          var s = i + "";
          return s == "0" && 1 / i == -te ? "-0" : s;
        }
        function Zr(i, s, l) {
          var p = -1, m = Rs, T = i.length, I = !0, R = [], B = R;
          if (l)
            I = !1, m = qu;
          else if (T >= o) {
            var Y = s ? null : L_(i);
            if (Y)
              return Ds(Y);
            I = !1, m = Io, B = new mi();
          } else
            B = s ? [] : R;
          e:
            for (; ++p < T; ) {
              var X = i[p], ne = s ? s(X) : X;
              if (X = l || X !== 0 ? X : 0, I && ne === ne) {
                for (var ue = B.length; ue--; )
                  if (B[ue] === ne)
                    continue e;
                s && B.push(ne), R.push(X);
              } else m(B, ne, l) || (B !== R && B.push(ne), R.push(X));
            }
          return R;
        }
        function gl(i, s) {
          return s = qr(s, i), i = md(i, s), i == null || delete i[ar(Wn(s))];
        }
        function qf(i, s, l, p) {
          return Bo(i, s, l(_i(i, s)), p);
        }
        function ra(i, s, l, p) {
          for (var m = i.length, T = p ? m : -1; (p ? T-- : ++T < m) && s(i[T], T, i); )
            ;
          return l ? Hn(i, p ? 0 : T, p ? T + 1 : m) : Hn(i, p ? T + 1 : 0, p ? m : T);
        }
        function Hf(i, s) {
          var l = i;
          return l instanceof He && (l = l.value()), Hu(s, function(p, m) {
            return m.func.apply(m.thisArg, Lr([p], m.args));
          }, l);
        }
        function ml(i, s, l) {
          var p = i.length;
          if (p < 2)
            return p ? Zr(i[0]) : [];
          for (var m = -1, T = q(p); ++m < p; )
            for (var I = i[m], R = -1; ++R < p; )
              R != m && (T[m] = zo(T[m] || I, i[R], s, l));
          return Zr(Zt(T, 1), s, l);
        }
        function Wf(i, s, l) {
          for (var p = -1, m = i.length, T = s.length, I = {}; ++p < m; ) {
            var R = p < T ? s[p] : t;
            l(I, i[p], R);
          }
          return I;
        }
        function vl(i) {
          return Mt(i) ? i : [];
        }
        function _l(i) {
          return typeof i == "function" ? i : hn;
        }
        function qr(i, s) {
          return Oe(i) ? i : El(i, s) ? [i] : bd(Xe(i));
        }
        var A_ = Fe;
        function Hr(i, s, l) {
          var p = i.length;
          return l = l === t ? p : l, !s && l >= p ? i : Hn(i, s, l);
        }
        var Gf = g1 || function(i) {
          return Ut.clearTimeout(i);
        };
        function jf(i, s) {
          if (s)
            return i.slice();
          var l = i.length, p = pf ? pf(l) : new i.constructor(l);
          return i.copy(p), p;
        }
        function yl(i) {
          var s = new i.constructor(i.byteLength);
          return new qs(s).set(new qs(i)), s;
        }
        function I_(i, s) {
          var l = s ? yl(i.buffer) : i.buffer;
          return new i.constructor(l, i.byteOffset, i.byteLength);
        }
        function P_(i) {
          var s = new i.constructor(i.source, So.exec(i));
          return s.lastIndex = i.lastIndex, s;
        }
        function O_(i) {
          return No ? it(No.call(i)) : {};
        }
        function Vf(i, s) {
          var l = s ? yl(i.buffer) : i.buffer;
          return new i.constructor(l, i.byteOffset, i.length);
        }
        function Kf(i, s) {
          if (i !== s) {
            var l = i !== t, p = i === null, m = i === i, T = Sn(i), I = s !== t, R = s === null, B = s === s, Y = Sn(s);
            if (!R && !Y && !T && i > s || T && I && B && !R && !Y || p && I && B || !l && B || !m)
              return 1;
            if (!p && !T && !Y && i < s || Y && l && m && !p && !T || R && l && m || !I && m || !B)
              return -1;
          }
          return 0;
        }
        function k_(i, s, l) {
          for (var p = -1, m = i.criteria, T = s.criteria, I = m.length, R = l.length; ++p < I; ) {
            var B = Kf(m[p], T[p]);
            if (B) {
              if (p >= R)
                return B;
              var Y = l[p];
              return B * (Y == "desc" ? -1 : 1);
            }
          }
          return i.index - s.index;
        }
        function Jf(i, s, l, p) {
          for (var m = -1, T = i.length, I = l.length, R = -1, B = s.length, Y = Ot(T - I, 0), X = q(B + Y), ne = !p; ++R < B; )
            X[R] = s[R];
          for (; ++m < I; )
            (ne || m < T) && (X[l[m]] = i[m]);
          for (; Y--; )
            X[R++] = i[m++];
          return X;
        }
        function Yf(i, s, l, p) {
          for (var m = -1, T = i.length, I = -1, R = l.length, B = -1, Y = s.length, X = Ot(T - R, 0), ne = q(X + Y), ue = !p; ++m < X; )
            ne[m] = i[m];
          for (var _e = m; ++B < Y; )
            ne[_e + B] = s[B];
          for (; ++I < R; )
            (ue || m < T) && (ne[_e + l[I]] = i[m++]);
          return ne;
        }
        function un(i, s) {
          var l = -1, p = i.length;
          for (s || (s = q(p)); ++l < p; )
            s[l] = i[l];
          return s;
        }
        function sr(i, s, l, p) {
          var m = !l;
          l || (l = {});
          for (var T = -1, I = s.length; ++T < I; ) {
            var R = s[T], B = p ? p(l[R], i[R], R, l, i) : t;
            B === t && (B = i[R]), m ? vr(l, R, B) : Ro(l, R, B);
          }
          return l;
        }
        function $_(i, s) {
          return sr(i, Ml(i), s);
        }
        function N_(i, s) {
          return sr(i, cd(i), s);
        }
        function ia(i, s) {
          return function(l, p) {
            var m = Oe(l) ? Bv : n_, T = s ? s() : {};
            return m(l, i, Ce(p, 2), T);
          };
        }
        function Xi(i) {
          return Fe(function(s, l) {
            var p = -1, m = l.length, T = m > 1 ? l[m - 1] : t, I = m > 2 ? l[2] : t;
            for (T = i.length > 3 && typeof T == "function" ? (m--, T) : t, I && Qt(l[0], l[1], I) && (T = m < 3 ? t : T, m = 1), s = it(s); ++p < m; ) {
              var R = l[p];
              R && i(s, R, p, T);
            }
            return s;
          });
        }
        function Qf(i, s) {
          return function(l, p) {
            if (l == null)
              return l;
            if (!ln(l))
              return i(l, p);
            for (var m = l.length, T = s ? m : -1, I = it(l); (s ? T-- : ++T < m) && p(I[T], T, I) !== !1; )
              ;
            return l;
          };
        }
        function Xf(i) {
          return function(s, l, p) {
            for (var m = -1, T = it(s), I = p(s), R = I.length; R--; ) {
              var B = I[i ? R : ++m];
              if (l(T[B], B, T) === !1)
                break;
            }
            return s;
          };
        }
        function R_(i, s, l) {
          var p = s & E, m = Fo(i);
          function T() {
            var I = this && this !== Ut && this instanceof T ? m : i;
            return I.apply(p ? l : this, arguments);
          }
          return T;
        }
        function ed(i) {
          return function(s) {
            s = Xe(s);
            var l = Gi(s) ? Xn(s) : t, p = l ? l[0] : s.charAt(0), m = l ? Hr(l, 1).join("") : s.slice(1);
            return p[i]() + m;
          };
        }
        function eo(i) {
          return function(s) {
            return Hu(Qd(Yd(s).replace(Cv, "")), i, "");
          };
        }
        function Fo(i) {
          return function() {
            var s = arguments;
            switch (s.length) {
              case 0:
                return new i();
              case 1:
                return new i(s[0]);
              case 2:
                return new i(s[0], s[1]);
              case 3:
                return new i(s[0], s[1], s[2]);
              case 4:
                return new i(s[0], s[1], s[2], s[3]);
              case 5:
                return new i(s[0], s[1], s[2], s[3], s[4]);
              case 6:
                return new i(s[0], s[1], s[2], s[3], s[4], s[5]);
              case 7:
                return new i(s[0], s[1], s[2], s[3], s[4], s[5], s[6]);
            }
            var l = Qi(i.prototype), p = i.apply(l, s);
            return mt(p) ? p : l;
          };
        }
        function z_(i, s, l) {
          var p = Fo(i);
          function m() {
            for (var T = arguments.length, I = q(T), R = T, B = to(m); R--; )
              I[R] = arguments[R];
            var Y = T < 3 && I[0] !== B && I[T - 1] !== B ? [] : Br(I, B);
            if (T -= Y.length, T < l)
              return od(
                i,
                s,
                oa,
                m.placeholder,
                t,
                I,
                Y,
                t,
                t,
                l - T
              );
            var X = this && this !== Ut && this instanceof m ? p : i;
            return wn(X, this, I);
          }
          return m;
        }
        function td(i) {
          return function(s, l, p) {
            var m = it(s);
            if (!ln(s)) {
              var T = Ce(l, 3);
              s = zt(s), l = function(R) {
                return T(m[R], R, m);
              };
            }
            var I = i(s, l, p);
            return I > -1 ? m[T ? s[I] : I] : t;
          };
        }
        function nd(i) {
          return yr(function(s) {
            var l = s.length, p = l, m = Zn.prototype.thru;
            for (i && s.reverse(); p--; ) {
              var T = s[p];
              if (typeof T != "function")
                throw new Un(u);
              if (m && !I && la(T) == "wrapper")
                var I = new Zn([], !0);
            }
            for (p = I ? p : l; ++p < l; ) {
              T = s[p];
              var R = la(T), B = R == "wrapper" ? Sl(T) : t;
              B && Al(B[0]) && B[1] == (F | C | N | H) && !B[4].length && B[9] == 1 ? I = I[la(B[0])].apply(I, B[3]) : I = T.length == 1 && Al(T) ? I[R]() : I.thru(T);
            }
            return function() {
              var Y = arguments, X = Y[0];
              if (I && Y.length == 1 && Oe(X))
                return I.plant(X).value();
              for (var ne = 0, ue = l ? s[ne].apply(this, Y) : X; ++ne < l; )
                ue = s[ne].call(this, ue);
              return ue;
            };
          });
        }
        function oa(i, s, l, p, m, T, I, R, B, Y) {
          var X = s & F, ne = s & E, ue = s & S, _e = s & (C | A), Me = s & se, De = ue ? t : Fo(i);
          function Ee() {
            for (var Ze = arguments.length, Ge = q(Ze), Cn = Ze; Cn--; )
              Ge[Cn] = arguments[Cn];
            if (_e)
              var Xt = to(Ee), Mn = Vv(Ge, Xt);
            if (p && (Ge = Jf(Ge, p, m, _e)), T && (Ge = Yf(Ge, T, I, _e)), Ze -= Mn, _e && Ze < Y) {
              var Et = Br(Ge, Xt);
              return od(
                i,
                s,
                oa,
                Ee.placeholder,
                l,
                Ge,
                Et,
                R,
                B,
                Y - Ze
              );
            }
            var nr = ne ? l : this, Tr = ue ? nr[i] : i;
            return Ze = Ge.length, R ? Ge = ny(Ge, R) : Me && Ze > 1 && Ge.reverse(), X && B < Ze && (Ge.length = B), this && this !== Ut && this instanceof Ee && (Tr = De || Fo(Tr)), Tr.apply(nr, Ge);
          }
          return Ee;
        }
        function rd(i, s) {
          return function(l, p) {
            return c_(l, i, s(p), {});
          };
        }
        function sa(i, s) {
          return function(l, p) {
            var m;
            if (l === t && p === t)
              return s;
            if (l !== t && (m = l), p !== t) {
              if (m === t)
                return p;
              typeof l == "string" || typeof p == "string" ? (l = Tn(l), p = Tn(p)) : (l = Zf(l), p = Zf(p)), m = i(l, p);
            }
            return m;
          };
        }
        function bl(i) {
          return yr(function(s) {
            return s = ht(s, xn(Ce())), Fe(function(l) {
              var p = this;
              return i(s, function(m) {
                return wn(m, p, l);
              });
            });
          });
        }
        function aa(i, s) {
          s = s === t ? " " : Tn(s);
          var l = s.length;
          if (l < 2)
            return l ? dl(s, i) : s;
          var p = dl(s, js(i / ji(s)));
          return Gi(s) ? Hr(Xn(p), 0, i).join("") : p.slice(0, i);
        }
        function D_(i, s, l, p) {
          var m = s & E, T = Fo(i);
          function I() {
            for (var R = -1, B = arguments.length, Y = -1, X = p.length, ne = q(X + B), ue = this && this !== Ut && this instanceof I ? T : i; ++Y < X; )
              ne[Y] = p[Y];
            for (; B--; )
              ne[Y++] = arguments[++R];
            return wn(ue, m ? l : this, ne);
          }
          return I;
        }
        function id(i) {
          return function(s, l, p) {
            return p && typeof p != "number" && Qt(s, l, p) && (l = p = t), s = xr(s), l === t ? (l = s, s = 0) : l = xr(l), p = p === t ? s < l ? 1 : -1 : xr(p), x_(s, l, p, i);
          };
        }
        function ua(i) {
          return function(s, l) {
            return typeof s == "string" && typeof l == "string" || (s = Gn(s), l = Gn(l)), i(s, l);
          };
        }
        function od(i, s, l, p, m, T, I, R, B, Y) {
          var X = s & C, ne = X ? I : t, ue = X ? t : I, _e = X ? T : t, Me = X ? t : T;
          s |= X ? N : L, s &= ~(X ? L : N), s & k || (s &= -4);
          var De = [
            i,
            s,
            m,
            _e,
            ne,
            Me,
            ue,
            R,
            B,
            Y
          ], Ee = l.apply(t, De);
          return Al(i) && vd(Ee, De), Ee.placeholder = p, _d(Ee, i, s);
        }
        function wl(i) {
          var s = Pt[i];
          return function(l, p) {
            if (l = Gn(l), p = p == null ? 0 : Gt($e(p), 292), p && _f(l)) {
              var m = (Xe(l) + "e").split("e"), T = s(m[0] + "e" + (+m[1] + p));
              return m = (Xe(T) + "e").split("e"), +(m[0] + "e" + (+m[1] - p));
            }
            return s(l);
          };
        }
        var L_ = Ji && 1 / Ds(new Ji([, -0]))[1] == te ? function(i) {
          return new Ji(i);
        } : ql;
        function sd(i) {
          return function(s) {
            var l = jt(s);
            return l == ke ? Yu(s) : l == Qe ? t1(s) : jv(s, i(s));
          };
        }
        function _r(i, s, l, p, m, T, I, R) {
          var B = s & S;
          if (!B && typeof i != "function")
            throw new Un(u);
          var Y = p ? p.length : 0;
          if (Y || (s &= -97, p = m = t), I = I === t ? I : Ot($e(I), 0), R = R === t ? R : $e(R), Y -= m ? m.length : 0, s & L) {
            var X = p, ne = m;
            p = m = t;
          }
          var ue = B ? t : Sl(i), _e = [
            i,
            s,
            l,
            p,
            m,
            X,
            ne,
            T,
            I,
            R
          ];
          if (ue && X_(_e, ue), i = _e[0], s = _e[1], l = _e[2], p = _e[3], m = _e[4], R = _e[9] = _e[9] === t ? B ? 0 : i.length : Ot(_e[9] - Y, 0), !R && s & (C | A) && (s &= -25), !s || s == E)
            var Me = R_(i, s, l);
          else s == C || s == A ? Me = z_(i, s, R) : (s == N || s == (E | N)) && !m.length ? Me = D_(i, s, l, p) : Me = oa.apply(t, _e);
          var De = ue ? Ff : vd;
          return _d(De(Me, _e), i, s);
        }
        function ad(i, s, l, p) {
          return i === t || tr(i, Ki[l]) && !et.call(p, l) ? s : i;
        }
        function ud(i, s, l, p, m, T) {
          return mt(i) && mt(s) && (T.set(s, i), ta(i, s, t, ud, T), T.delete(s)), i;
        }
        function B_(i) {
          return qo(i) ? t : i;
        }
        function ld(i, s, l, p, m, T) {
          var I = l & _, R = i.length, B = s.length;
          if (R != B && !(I && B > R))
            return !1;
          var Y = T.get(i), X = T.get(s);
          if (Y && X)
            return Y == s && X == i;
          var ne = -1, ue = !0, _e = l & O ? new mi() : t;
          for (T.set(i, s), T.set(s, i); ++ne < R; ) {
            var Me = i[ne], De = s[ne];
            if (p)
              var Ee = I ? p(De, Me, ne, s, i, T) : p(Me, De, ne, i, s, T);
            if (Ee !== t) {
              if (Ee)
                continue;
              ue = !1;
              break;
            }
            if (_e) {
              if (!Wu(s, function(Ze, Ge) {
                if (!Io(_e, Ge) && (Me === Ze || m(Me, Ze, l, p, T)))
                  return _e.push(Ge);
              })) {
                ue = !1;
                break;
              }
            } else if (!(Me === De || m(Me, De, l, p, T))) {
              ue = !1;
              break;
            }
          }
          return T.delete(i), T.delete(s), ue;
        }
        function F_(i, s, l, p, m, T, I) {
          switch (l) {
            case z:
              if (i.byteLength != s.byteLength || i.byteOffset != s.byteOffset)
                return !1;
              i = i.buffer, s = s.buffer;
            case P:
              return !(i.byteLength != s.byteLength || !T(new qs(i), new qs(s)));
            case G:
            case J:
            case tt:
              return tr(+i, +s);
            case we:
              return i.name == s.name && i.message == s.message;
            case Ft:
            case yn:
              return i == s + "";
            case ke:
              var R = Yu;
            case Qe:
              var B = p & _;
              if (R || (R = Ds), i.size != s.size && !B)
                return !1;
              var Y = I.get(i);
              if (Y)
                return Y == s;
              p |= O, I.set(i, s);
              var X = ld(R(i), R(s), p, m, T, I);
              return I.delete(i), X;
            case Rn:
              if (No)
                return No.call(i) == No.call(s);
          }
          return !1;
        }
        function U_(i, s, l, p, m, T) {
          var I = l & _, R = xl(i), B = R.length, Y = xl(s), X = Y.length;
          if (B != X && !I)
            return !1;
          for (var ne = B; ne--; ) {
            var ue = R[ne];
            if (!(I ? ue in s : et.call(s, ue)))
              return !1;
          }
          var _e = T.get(i), Me = T.get(s);
          if (_e && Me)
            return _e == s && Me == i;
          var De = !0;
          T.set(i, s), T.set(s, i);
          for (var Ee = I; ++ne < B; ) {
            ue = R[ne];
            var Ze = i[ue], Ge = s[ue];
            if (p)
              var Cn = I ? p(Ge, Ze, ue, s, i, T) : p(Ze, Ge, ue, i, s, T);
            if (!(Cn === t ? Ze === Ge || m(Ze, Ge, l, p, T) : Cn)) {
              De = !1;
              break;
            }
            Ee || (Ee = ue == "constructor");
          }
          if (De && !Ee) {
            var Xt = i.constructor, Mn = s.constructor;
            Xt != Mn && "constructor" in i && "constructor" in s && !(typeof Xt == "function" && Xt instanceof Xt && typeof Mn == "function" && Mn instanceof Mn) && (De = !1);
          }
          return T.delete(i), T.delete(s), De;
        }
        function yr(i) {
          return Pl(gd(i, t, Sd), i + "");
        }
        function xl(i) {
          return If(i, zt, Ml);
        }
        function Tl(i) {
          return If(i, cn, cd);
        }
        var Sl = Ks ? function(i) {
          return Ks.get(i);
        } : ql;
        function la(i) {
          for (var s = i.name + "", l = Yi[s], p = et.call(Yi, s) ? l.length : 0; p--; ) {
            var m = l[p], T = m.func;
            if (T == null || T == i)
              return m.name;
          }
          return s;
        }
        function to(i) {
          var s = et.call(w, "placeholder") ? w : i;
          return s.placeholder;
        }
        function Ce() {
          var i = w.iteratee || Ul;
          return i = i === Ul ? kf : i, arguments.length ? i(arguments[0], arguments[1]) : i;
        }
        function ca(i, s) {
          var l = i.__data__;
          return K_(s) ? l[typeof s == "string" ? "string" : "hash"] : l.map;
        }
        function Cl(i) {
          for (var s = zt(i), l = s.length; l--; ) {
            var p = s[l], m = i[p];
            s[l] = [p, m, dd(m)];
          }
          return s;
        }
        function yi(i, s) {
          var l = Qv(i, s);
          return Of(l) ? l : t;
        }
        function Z_(i) {
          var s = et.call(i, pi), l = i[pi];
          try {
            i[pi] = t;
            var p = !0;
          } catch {
          }
          var m = Us.call(i);
          return p && (s ? i[pi] = l : delete i[pi]), m;
        }
        var Ml = Xu ? function(i) {
          return i == null ? [] : (i = it(i), Dr(Xu(i), function(s) {
            return mf.call(i, s);
          }));
        } : Hl, cd = Xu ? function(i) {
          for (var s = []; i; )
            Lr(s, Ml(i)), i = Hs(i);
          return s;
        } : Hl, jt = Yt;
        (el && jt(new el(new ArrayBuffer(1))) != z || Oo && jt(new Oo()) != ke || tl && jt(tl.resolve()) != Nn || Ji && jt(new Ji()) != Qe || ko && jt(new ko()) != cr) && (jt = function(i) {
          var s = Yt(i), l = s == xt ? i.constructor : t, p = l ? bi(l) : "";
          if (p)
            switch (p) {
              case S1:
                return z;
              case C1:
                return ke;
              case M1:
                return Nn;
              case E1:
                return Qe;
              case A1:
                return cr;
            }
          return s;
        });
        function q_(i, s, l) {
          for (var p = -1, m = l.length; ++p < m; ) {
            var T = l[p], I = T.size;
            switch (T.type) {
              case "drop":
                i += I;
                break;
              case "dropRight":
                s -= I;
                break;
              case "take":
                s = Gt(s, i + I);
                break;
              case "takeRight":
                i = Ot(i, s - I);
                break;
            }
          }
          return { start: i, end: s };
        }
        function H_(i) {
          var s = i.match(Ru);
          return s ? s[1].split(As) : [];
        }
        function hd(i, s, l) {
          s = qr(s, i);
          for (var p = -1, m = s.length, T = !1; ++p < m; ) {
            var I = ar(s[p]);
            if (!(T = i != null && l(i, I)))
              break;
            i = i[I];
          }
          return T || ++p != m ? T : (m = i == null ? 0 : i.length, !!m && va(m) && br(I, m) && (Oe(i) || wi(i)));
        }
        function W_(i) {
          var s = i.length, l = new i.constructor(s);
          return s && typeof i[0] == "string" && et.call(i, "index") && (l.index = i.index, l.input = i.input), l;
        }
        function fd(i) {
          return typeof i.constructor == "function" && !Uo(i) ? Qi(Hs(i)) : {};
        }
        function G_(i, s, l) {
          var p = i.constructor;
          switch (s) {
            case P:
              return yl(i);
            case G:
            case J:
              return new p(+i);
            case z:
              return I_(i, l);
            case W:
            case Q:
            case le:
            case Ae:
            case Be:
            case St:
            case Kt:
            case ut:
            case Te:
              return Vf(i, l);
            case ke:
              return new p();
            case tt:
            case yn:
              return new p(i);
            case Ft:
              return P_(i);
            case Qe:
              return new p();
            case Rn:
              return O_(i);
          }
        }
        function j_(i, s) {
          var l = s.length;
          if (!l)
            return i;
          var p = l - 1;
          return s[p] = (l > 1 ? "& " : "") + s[p], s = s.join(l > 2 ? ", " : " "), i.replace(To, `{
/* [wrapped with ` + s + `] */
`);
        }
        function V_(i) {
          return Oe(i) || wi(i) || !!(vf && i && i[vf]);
        }
        function br(i, s) {
          var l = typeof i;
          return s = s ?? oe, !!s && (l == "number" || l != "symbol" && Li.test(i)) && i > -1 && i % 1 == 0 && i < s;
        }
        function Qt(i, s, l) {
          if (!mt(l))
            return !1;
          var p = typeof s;
          return (p == "number" ? ln(l) && br(s, l.length) : p == "string" && s in l) ? tr(l[s], i) : !1;
        }
        function El(i, s) {
          if (Oe(i))
            return !1;
          var l = typeof i;
          return l == "number" || l == "symbol" || l == "boolean" || i == null || Sn(i) ? !0 : ui.test(i) || !ai.test(i) || s != null && i in it(s);
        }
        function K_(i) {
          var s = typeof i;
          return s == "string" || s == "number" || s == "symbol" || s == "boolean" ? i !== "__proto__" : i === null;
        }
        function Al(i) {
          var s = la(i), l = w[s];
          if (typeof l != "function" || !(s in He.prototype))
            return !1;
          if (i === l)
            return !0;
          var p = Sl(l);
          return !!p && i === p[0];
        }
        function J_(i) {
          return !!df && df in i;
        }
        var Y_ = Bs ? wr : Wl;
        function Uo(i) {
          var s = i && i.constructor, l = typeof s == "function" && s.prototype || Ki;
          return i === l;
        }
        function dd(i) {
          return i === i && !mt(i);
        }
        function pd(i, s) {
          return function(l) {
            return l == null ? !1 : l[i] === s && (s !== t || i in it(l));
          };
        }
        function Q_(i) {
          var s = ga(i, function(p) {
            return l.size === f && l.clear(), p;
          }), l = s.cache;
          return s;
        }
        function X_(i, s) {
          var l = i[1], p = s[1], m = l | p, T = m < (E | S | F), I = p == F && l == C || p == F && l == H && i[7].length <= s[8] || p == (F | H) && s[7].length <= s[8] && l == C;
          if (!(T || I))
            return i;
          p & E && (i[2] = s[2], m |= l & E ? 0 : k);
          var R = s[3];
          if (R) {
            var B = i[3];
            i[3] = B ? Jf(B, R, s[4]) : R, i[4] = B ? Br(i[3], d) : s[4];
          }
          return R = s[5], R && (B = i[5], i[5] = B ? Yf(B, R, s[6]) : R, i[6] = B ? Br(i[5], d) : s[6]), R = s[7], R && (i[7] = R), p & F && (i[8] = i[8] == null ? s[8] : Gt(i[8], s[8])), i[9] == null && (i[9] = s[9]), i[0] = s[0], i[1] = m, i;
        }
        function ey(i) {
          var s = [];
          if (i != null)
            for (var l in it(i))
              s.push(l);
          return s;
        }
        function ty(i) {
          return Us.call(i);
        }
        function gd(i, s, l) {
          return s = Ot(s === t ? i.length - 1 : s, 0), function() {
            for (var p = arguments, m = -1, T = Ot(p.length - s, 0), I = q(T); ++m < T; )
              I[m] = p[s + m];
            m = -1;
            for (var R = q(s + 1); ++m < s; )
              R[m] = p[m];
            return R[s] = l(I), wn(i, this, R);
          };
        }
        function md(i, s) {
          return s.length < 2 ? i : _i(i, Hn(s, 0, -1));
        }
        function ny(i, s) {
          for (var l = i.length, p = Gt(s.length, l), m = un(i); p--; ) {
            var T = s[p];
            i[p] = br(T, l) ? m[T] : t;
          }
          return i;
        }
        function Il(i, s) {
          if (!(s === "constructor" && typeof i[s] == "function") && s != "__proto__")
            return i[s];
        }
        var vd = yd(Ff), Zo = v1 || function(i, s) {
          return Ut.setTimeout(i, s);
        }, Pl = yd(C_);
        function _d(i, s, l) {
          var p = s + "";
          return Pl(i, j_(p, ry(H_(p), l)));
        }
        function yd(i) {
          var s = 0, l = 0;
          return function() {
            var p = w1(), m = Je - (p - l);
            if (l = p, m > 0) {
              if (++s >= pe)
                return arguments[0];
            } else
              s = 0;
            return i.apply(t, arguments);
          };
        }
        function ha(i, s) {
          var l = -1, p = i.length, m = p - 1;
          for (s = s === t ? p : s; ++l < s; ) {
            var T = fl(l, m), I = i[T];
            i[T] = i[l], i[l] = I;
          }
          return i.length = s, i;
        }
        var bd = Q_(function(i) {
          var s = [];
          return i.charCodeAt(0) === 46 && s.push(""), i.replace($r, function(l, p, m, T) {
            s.push(m ? T.replace(Ps, "$1") : p || l);
          }), s;
        });
        function ar(i) {
          if (typeof i == "string" || Sn(i))
            return i;
          var s = i + "";
          return s == "0" && 1 / i == -te ? "-0" : s;
        }
        function bi(i) {
          if (i != null) {
            try {
              return Fs.call(i);
            } catch {
            }
            try {
              return i + "";
            } catch {
            }
          }
          return "";
        }
        function ry(i, s) {
          return Fn(Ve, function(l) {
            var p = "_." + l[0];
            s & l[1] && !Rs(i, p) && i.push(p);
          }), i.sort();
        }
        function wd(i) {
          if (i instanceof He)
            return i.clone();
          var s = new Zn(i.__wrapped__, i.__chain__);
          return s.__actions__ = un(i.__actions__), s.__index__ = i.__index__, s.__values__ = i.__values__, s;
        }
        function iy(i, s, l) {
          (l ? Qt(i, s, l) : s === t) ? s = 1 : s = Ot($e(s), 0);
          var p = i == null ? 0 : i.length;
          if (!p || s < 1)
            return [];
          for (var m = 0, T = 0, I = q(js(p / s)); m < p; )
            I[T++] = Hn(i, m, m += s);
          return I;
        }
        function oy(i) {
          for (var s = -1, l = i == null ? 0 : i.length, p = 0, m = []; ++s < l; ) {
            var T = i[s];
            T && (m[p++] = T);
          }
          return m;
        }
        function sy() {
          var i = arguments.length;
          if (!i)
            return [];
          for (var s = q(i - 1), l = arguments[0], p = i; p--; )
            s[p - 1] = arguments[p];
          return Lr(Oe(l) ? un(l) : [l], Zt(s, 1));
        }
        var ay = Fe(function(i, s) {
          return Mt(i) ? zo(i, Zt(s, 1, Mt, !0)) : [];
        }), uy = Fe(function(i, s) {
          var l = Wn(s);
          return Mt(l) && (l = t), Mt(i) ? zo(i, Zt(s, 1, Mt, !0), Ce(l, 2)) : [];
        }), ly = Fe(function(i, s) {
          var l = Wn(s);
          return Mt(l) && (l = t), Mt(i) ? zo(i, Zt(s, 1, Mt, !0), t, l) : [];
        });
        function cy(i, s, l) {
          var p = i == null ? 0 : i.length;
          return p ? (s = l || s === t ? 1 : $e(s), Hn(i, s < 0 ? 0 : s, p)) : [];
        }
        function hy(i, s, l) {
          var p = i == null ? 0 : i.length;
          return p ? (s = l || s === t ? 1 : $e(s), s = p - s, Hn(i, 0, s < 0 ? 0 : s)) : [];
        }
        function fy(i, s) {
          return i && i.length ? ra(i, Ce(s, 3), !0, !0) : [];
        }
        function dy(i, s) {
          return i && i.length ? ra(i, Ce(s, 3), !0) : [];
        }
        function py(i, s, l, p) {
          var m = i == null ? 0 : i.length;
          return m ? (l && typeof l != "number" && Qt(i, s, l) && (l = 0, p = m), s_(i, s, l, p)) : [];
        }
        function xd(i, s, l) {
          var p = i == null ? 0 : i.length;
          if (!p)
            return -1;
          var m = l == null ? 0 : $e(l);
          return m < 0 && (m = Ot(p + m, 0)), zs(i, Ce(s, 3), m);
        }
        function Td(i, s, l) {
          var p = i == null ? 0 : i.length;
          if (!p)
            return -1;
          var m = p - 1;
          return l !== t && (m = $e(l), m = l < 0 ? Ot(p + m, 0) : Gt(m, p - 1)), zs(i, Ce(s, 3), m, !0);
        }
        function Sd(i) {
          var s = i == null ? 0 : i.length;
          return s ? Zt(i, 1) : [];
        }
        function gy(i) {
          var s = i == null ? 0 : i.length;
          return s ? Zt(i, te) : [];
        }
        function my(i, s) {
          var l = i == null ? 0 : i.length;
          return l ? (s = s === t ? 1 : $e(s), Zt(i, s)) : [];
        }
        function vy(i) {
          for (var s = -1, l = i == null ? 0 : i.length, p = {}; ++s < l; ) {
            var m = i[s];
            p[m[0]] = m[1];
          }
          return p;
        }
        function Cd(i) {
          return i && i.length ? i[0] : t;
        }
        function _y(i, s, l) {
          var p = i == null ? 0 : i.length;
          if (!p)
            return -1;
          var m = l == null ? 0 : $e(l);
          return m < 0 && (m = Ot(p + m, 0)), Wi(i, s, m);
        }
        function yy(i) {
          var s = i == null ? 0 : i.length;
          return s ? Hn(i, 0, -1) : [];
        }
        var by = Fe(function(i) {
          var s = ht(i, vl);
          return s.length && s[0] === i[0] ? al(s) : [];
        }), wy = Fe(function(i) {
          var s = Wn(i), l = ht(i, vl);
          return s === Wn(l) ? s = t : l.pop(), l.length && l[0] === i[0] ? al(l, Ce(s, 2)) : [];
        }), xy = Fe(function(i) {
          var s = Wn(i), l = ht(i, vl);
          return s = typeof s == "function" ? s : t, s && l.pop(), l.length && l[0] === i[0] ? al(l, t, s) : [];
        });
        function Ty(i, s) {
          return i == null ? "" : y1.call(i, s);
        }
        function Wn(i) {
          var s = i == null ? 0 : i.length;
          return s ? i[s - 1] : t;
        }
        function Sy(i, s, l) {
          var p = i == null ? 0 : i.length;
          if (!p)
            return -1;
          var m = p;
          return l !== t && (m = $e(l), m = m < 0 ? Ot(p + m, 0) : Gt(m, p - 1)), s === s ? r1(i, s, m) : zs(i, of, m, !0);
        }
        function Cy(i, s) {
          return i && i.length ? zf(i, $e(s)) : t;
        }
        var My = Fe(Md);
        function Md(i, s) {
          return i && i.length && s && s.length ? hl(i, s) : i;
        }
        function Ey(i, s, l) {
          return i && i.length && s && s.length ? hl(i, s, Ce(l, 2)) : i;
        }
        function Ay(i, s, l) {
          return i && i.length && s && s.length ? hl(i, s, t, l) : i;
        }
        var Iy = yr(function(i, s) {
          var l = i == null ? 0 : i.length, p = rl(i, s);
          return Bf(i, ht(s, function(m) {
            return br(m, l) ? +m : m;
          }).sort(Kf)), p;
        });
        function Py(i, s) {
          var l = [];
          if (!(i && i.length))
            return l;
          var p = -1, m = [], T = i.length;
          for (s = Ce(s, 3); ++p < T; ) {
            var I = i[p];
            s(I, p, i) && (l.push(I), m.push(p));
          }
          return Bf(i, m), l;
        }
        function Ol(i) {
          return i == null ? i : T1.call(i);
        }
        function Oy(i, s, l) {
          var p = i == null ? 0 : i.length;
          return p ? (l && typeof l != "number" && Qt(i, s, l) ? (s = 0, l = p) : (s = s == null ? 0 : $e(s), l = l === t ? p : $e(l)), Hn(i, s, l)) : [];
        }
        function ky(i, s) {
          return na(i, s);
        }
        function $y(i, s, l) {
          return pl(i, s, Ce(l, 2));
        }
        function Ny(i, s) {
          var l = i == null ? 0 : i.length;
          if (l) {
            var p = na(i, s);
            if (p < l && tr(i[p], s))
              return p;
          }
          return -1;
        }
        function Ry(i, s) {
          return na(i, s, !0);
        }
        function zy(i, s, l) {
          return pl(i, s, Ce(l, 2), !0);
        }
        function Dy(i, s) {
          var l = i == null ? 0 : i.length;
          if (l) {
            var p = na(i, s, !0) - 1;
            if (tr(i[p], s))
              return p;
          }
          return -1;
        }
        function Ly(i) {
          return i && i.length ? Uf(i) : [];
        }
        function By(i, s) {
          return i && i.length ? Uf(i, Ce(s, 2)) : [];
        }
        function Fy(i) {
          var s = i == null ? 0 : i.length;
          return s ? Hn(i, 1, s) : [];
        }
        function Uy(i, s, l) {
          return i && i.length ? (s = l || s === t ? 1 : $e(s), Hn(i, 0, s < 0 ? 0 : s)) : [];
        }
        function Zy(i, s, l) {
          var p = i == null ? 0 : i.length;
          return p ? (s = l || s === t ? 1 : $e(s), s = p - s, Hn(i, s < 0 ? 0 : s, p)) : [];
        }
        function qy(i, s) {
          return i && i.length ? ra(i, Ce(s, 3), !1, !0) : [];
        }
        function Hy(i, s) {
          return i && i.length ? ra(i, Ce(s, 3)) : [];
        }
        var Wy = Fe(function(i) {
          return Zr(Zt(i, 1, Mt, !0));
        }), Gy = Fe(function(i) {
          var s = Wn(i);
          return Mt(s) && (s = t), Zr(Zt(i, 1, Mt, !0), Ce(s, 2));
        }), jy = Fe(function(i) {
          var s = Wn(i);
          return s = typeof s == "function" ? s : t, Zr(Zt(i, 1, Mt, !0), t, s);
        });
        function Vy(i) {
          return i && i.length ? Zr(i) : [];
        }
        function Ky(i, s) {
          return i && i.length ? Zr(i, Ce(s, 2)) : [];
        }
        function Jy(i, s) {
          return s = typeof s == "function" ? s : t, i && i.length ? Zr(i, t, s) : [];
        }
        function kl(i) {
          if (!(i && i.length))
            return [];
          var s = 0;
          return i = Dr(i, function(l) {
            if (Mt(l))
              return s = Ot(l.length, s), !0;
          }), Ku(s, function(l) {
            return ht(i, Gu(l));
          });
        }
        function Ed(i, s) {
          if (!(i && i.length))
            return [];
          var l = kl(i);
          return s == null ? l : ht(l, function(p) {
            return wn(s, t, p);
          });
        }
        var Yy = Fe(function(i, s) {
          return Mt(i) ? zo(i, s) : [];
        }), Qy = Fe(function(i) {
          return ml(Dr(i, Mt));
        }), Xy = Fe(function(i) {
          var s = Wn(i);
          return Mt(s) && (s = t), ml(Dr(i, Mt), Ce(s, 2));
        }), e2 = Fe(function(i) {
          var s = Wn(i);
          return s = typeof s == "function" ? s : t, ml(Dr(i, Mt), t, s);
        }), t2 = Fe(kl);
        function n2(i, s) {
          return Wf(i || [], s || [], Ro);
        }
        function r2(i, s) {
          return Wf(i || [], s || [], Bo);
        }
        var i2 = Fe(function(i) {
          var s = i.length, l = s > 1 ? i[s - 1] : t;
          return l = typeof l == "function" ? (i.pop(), l) : t, Ed(i, l);
        });
        function Ad(i) {
          var s = w(i);
          return s.__chain__ = !0, s;
        }
        function o2(i, s) {
          return s(i), i;
        }
        function fa(i, s) {
          return s(i);
        }
        var s2 = yr(function(i) {
          var s = i.length, l = s ? i[0] : 0, p = this.__wrapped__, m = function(T) {
            return rl(T, i);
          };
          return s > 1 || this.__actions__.length || !(p instanceof He) || !br(l) ? this.thru(m) : (p = p.slice(l, +l + (s ? 1 : 0)), p.__actions__.push({
            func: fa,
            args: [m],
            thisArg: t
          }), new Zn(p, this.__chain__).thru(function(T) {
            return s && !T.length && T.push(t), T;
          }));
        });
        function a2() {
          return Ad(this);
        }
        function u2() {
          return new Zn(this.value(), this.__chain__);
        }
        function l2() {
          this.__values__ === t && (this.__values__ = Zd(this.value()));
          var i = this.__index__ >= this.__values__.length, s = i ? t : this.__values__[this.__index__++];
          return { done: i, value: s };
        }
        function c2() {
          return this;
        }
        function h2(i) {
          for (var s, l = this; l instanceof Ys; ) {
            var p = wd(l);
            p.__index__ = 0, p.__values__ = t, s ? m.__wrapped__ = p : s = p;
            var m = p;
            l = l.__wrapped__;
          }
          return m.__wrapped__ = i, s;
        }
        function f2() {
          var i = this.__wrapped__;
          if (i instanceof He) {
            var s = i;
            return this.__actions__.length && (s = new He(this)), s = s.reverse(), s.__actions__.push({
              func: fa,
              args: [Ol],
              thisArg: t
            }), new Zn(s, this.__chain__);
          }
          return this.thru(Ol);
        }
        function d2() {
          return Hf(this.__wrapped__, this.__actions__);
        }
        var p2 = ia(function(i, s, l) {
          et.call(i, l) ? ++i[l] : vr(i, l, 1);
        });
        function g2(i, s, l) {
          var p = Oe(i) ? nf : o_;
          return l && Qt(i, s, l) && (s = t), p(i, Ce(s, 3));
        }
        function m2(i, s) {
          var l = Oe(i) ? Dr : Ef;
          return l(i, Ce(s, 3));
        }
        var v2 = td(xd), _2 = td(Td);
        function y2(i, s) {
          return Zt(da(i, s), 1);
        }
        function b2(i, s) {
          return Zt(da(i, s), te);
        }
        function w2(i, s, l) {
          return l = l === t ? 1 : $e(l), Zt(da(i, s), l);
        }
        function Id(i, s) {
          var l = Oe(i) ? Fn : Ur;
          return l(i, Ce(s, 3));
        }
        function Pd(i, s) {
          var l = Oe(i) ? Fv : Mf;
          return l(i, Ce(s, 3));
        }
        var x2 = ia(function(i, s, l) {
          et.call(i, l) ? i[l].push(s) : vr(i, l, [s]);
        });
        function T2(i, s, l, p) {
          i = ln(i) ? i : ro(i), l = l && !p ? $e(l) : 0;
          var m = i.length;
          return l < 0 && (l = Ot(m + l, 0)), _a(i) ? l <= m && i.indexOf(s, l) > -1 : !!m && Wi(i, s, l) > -1;
        }
        var S2 = Fe(function(i, s, l) {
          var p = -1, m = typeof s == "function", T = ln(i) ? q(i.length) : [];
          return Ur(i, function(I) {
            T[++p] = m ? wn(s, I, l) : Do(I, s, l);
          }), T;
        }), C2 = ia(function(i, s, l) {
          vr(i, l, s);
        });
        function da(i, s) {
          var l = Oe(i) ? ht : $f;
          return l(i, Ce(s, 3));
        }
        function M2(i, s, l, p) {
          return i == null ? [] : (Oe(s) || (s = s == null ? [] : [s]), l = p ? t : l, Oe(l) || (l = l == null ? [] : [l]), Df(i, s, l));
        }
        var E2 = ia(function(i, s, l) {
          i[l ? 0 : 1].push(s);
        }, function() {
          return [[], []];
        });
        function A2(i, s, l) {
          var p = Oe(i) ? Hu : af, m = arguments.length < 3;
          return p(i, Ce(s, 4), l, m, Ur);
        }
        function I2(i, s, l) {
          var p = Oe(i) ? Uv : af, m = arguments.length < 3;
          return p(i, Ce(s, 4), l, m, Mf);
        }
        function P2(i, s) {
          var l = Oe(i) ? Dr : Ef;
          return l(i, ma(Ce(s, 3)));
        }
        function O2(i) {
          var s = Oe(i) ? xf : T_;
          return s(i);
        }
        function k2(i, s, l) {
          (l ? Qt(i, s, l) : s === t) ? s = 1 : s = $e(s);
          var p = Oe(i) ? e_ : S_;
          return p(i, s);
        }
        function $2(i) {
          var s = Oe(i) ? t_ : M_;
          return s(i);
        }
        function N2(i) {
          if (i == null)
            return 0;
          if (ln(i))
            return _a(i) ? ji(i) : i.length;
          var s = jt(i);
          return s == ke || s == Qe ? i.size : ll(i).length;
        }
        function R2(i, s, l) {
          var p = Oe(i) ? Wu : E_;
          return l && Qt(i, s, l) && (s = t), p(i, Ce(s, 3));
        }
        var z2 = Fe(function(i, s) {
          if (i == null)
            return [];
          var l = s.length;
          return l > 1 && Qt(i, s[0], s[1]) ? s = [] : l > 2 && Qt(s[0], s[1], s[2]) && (s = [s[0]]), Df(i, Zt(s, 1), []);
        }), pa = m1 || function() {
          return Ut.Date.now();
        };
        function D2(i, s) {
          if (typeof s != "function")
            throw new Un(u);
          return i = $e(i), function() {
            if (--i < 1)
              return s.apply(this, arguments);
          };
        }
        function Od(i, s, l) {
          return s = l ? t : s, s = i && s == null ? i.length : s, _r(i, F, t, t, t, t, s);
        }
        function kd(i, s) {
          var l;
          if (typeof s != "function")
            throw new Un(u);
          return i = $e(i), function() {
            return --i > 0 && (l = s.apply(this, arguments)), i <= 1 && (s = t), l;
          };
        }
        var $l = Fe(function(i, s, l) {
          var p = E;
          if (l.length) {
            var m = Br(l, to($l));
            p |= N;
          }
          return _r(i, p, s, l, m);
        }), $d = Fe(function(i, s, l) {
          var p = E | S;
          if (l.length) {
            var m = Br(l, to($d));
            p |= N;
          }
          return _r(s, p, i, l, m);
        });
        function Nd(i, s, l) {
          s = l ? t : s;
          var p = _r(i, C, t, t, t, t, t, s);
          return p.placeholder = Nd.placeholder, p;
        }
        function Rd(i, s, l) {
          s = l ? t : s;
          var p = _r(i, A, t, t, t, t, t, s);
          return p.placeholder = Rd.placeholder, p;
        }
        function zd(i, s, l) {
          var p, m, T, I, R, B, Y = 0, X = !1, ne = !1, ue = !0;
          if (typeof i != "function")
            throw new Un(u);
          s = Gn(s) || 0, mt(l) && (X = !!l.leading, ne = "maxWait" in l, T = ne ? Ot(Gn(l.maxWait) || 0, s) : T, ue = "trailing" in l ? !!l.trailing : ue);
          function _e(Et) {
            var nr = p, Tr = m;
            return p = m = t, Y = Et, I = i.apply(Tr, nr), I;
          }
          function Me(Et) {
            return Y = Et, R = Zo(Ze, s), X ? _e(Et) : I;
          }
          function De(Et) {
            var nr = Et - B, Tr = Et - Y, tp = s - nr;
            return ne ? Gt(tp, T - Tr) : tp;
          }
          function Ee(Et) {
            var nr = Et - B, Tr = Et - Y;
            return B === t || nr >= s || nr < 0 || ne && Tr >= T;
          }
          function Ze() {
            var Et = pa();
            if (Ee(Et))
              return Ge(Et);
            R = Zo(Ze, De(Et));
          }
          function Ge(Et) {
            return R = t, ue && p ? _e(Et) : (p = m = t, I);
          }
          function Cn() {
            R !== t && Gf(R), Y = 0, p = B = m = R = t;
          }
          function Xt() {
            return R === t ? I : Ge(pa());
          }
          function Mn() {
            var Et = pa(), nr = Ee(Et);
            if (p = arguments, m = this, B = Et, nr) {
              if (R === t)
                return Me(B);
              if (ne)
                return Gf(R), R = Zo(Ze, s), _e(B);
            }
            return R === t && (R = Zo(Ze, s)), I;
          }
          return Mn.cancel = Cn, Mn.flush = Xt, Mn;
        }
        var L2 = Fe(function(i, s) {
          return Cf(i, 1, s);
        }), B2 = Fe(function(i, s, l) {
          return Cf(i, Gn(s) || 0, l);
        });
        function F2(i) {
          return _r(i, se);
        }
        function ga(i, s) {
          if (typeof i != "function" || s != null && typeof s != "function")
            throw new Un(u);
          var l = function() {
            var p = arguments, m = s ? s.apply(this, p) : p[0], T = l.cache;
            if (T.has(m))
              return T.get(m);
            var I = i.apply(this, p);
            return l.cache = T.set(m, I) || T, I;
          };
          return l.cache = new (ga.Cache || mr)(), l;
        }
        ga.Cache = mr;
        function ma(i) {
          if (typeof i != "function")
            throw new Un(u);
          return function() {
            var s = arguments;
            switch (s.length) {
              case 0:
                return !i.call(this);
              case 1:
                return !i.call(this, s[0]);
              case 2:
                return !i.call(this, s[0], s[1]);
              case 3:
                return !i.call(this, s[0], s[1], s[2]);
            }
            return !i.apply(this, s);
          };
        }
        function U2(i) {
          return kd(2, i);
        }
        var Z2 = A_(function(i, s) {
          s = s.length == 1 && Oe(s[0]) ? ht(s[0], xn(Ce())) : ht(Zt(s, 1), xn(Ce()));
          var l = s.length;
          return Fe(function(p) {
            for (var m = -1, T = Gt(p.length, l); ++m < T; )
              p[m] = s[m].call(this, p[m]);
            return wn(i, this, p);
          });
        }), Nl = Fe(function(i, s) {
          var l = Br(s, to(Nl));
          return _r(i, N, t, s, l);
        }), Dd = Fe(function(i, s) {
          var l = Br(s, to(Dd));
          return _r(i, L, t, s, l);
        }), q2 = yr(function(i, s) {
          return _r(i, H, t, t, t, s);
        });
        function H2(i, s) {
          if (typeof i != "function")
            throw new Un(u);
          return s = s === t ? s : $e(s), Fe(i, s);
        }
        function W2(i, s) {
          if (typeof i != "function")
            throw new Un(u);
          return s = s == null ? 0 : Ot($e(s), 0), Fe(function(l) {
            var p = l[s], m = Hr(l, 0, s);
            return p && Lr(m, p), wn(i, this, m);
          });
        }
        function G2(i, s, l) {
          var p = !0, m = !0;
          if (typeof i != "function")
            throw new Un(u);
          return mt(l) && (p = "leading" in l ? !!l.leading : p, m = "trailing" in l ? !!l.trailing : m), zd(i, s, {
            leading: p,
            maxWait: s,
            trailing: m
          });
        }
        function j2(i) {
          return Od(i, 1);
        }
        function V2(i, s) {
          return Nl(_l(s), i);
        }
        function K2() {
          if (!arguments.length)
            return [];
          var i = arguments[0];
          return Oe(i) ? i : [i];
        }
        function J2(i) {
          return qn(i, b);
        }
        function Y2(i, s) {
          return s = typeof s == "function" ? s : t, qn(i, b, s);
        }
        function Q2(i) {
          return qn(i, g | b);
        }
        function X2(i, s) {
          return s = typeof s == "function" ? s : t, qn(i, g | b, s);
        }
        function eb(i, s) {
          return s == null || Sf(i, s, zt(s));
        }
        function tr(i, s) {
          return i === s || i !== i && s !== s;
        }
        var tb = ua(sl), nb = ua(function(i, s) {
          return i >= s;
        }), wi = Pf(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Pf : function(i) {
          return Tt(i) && et.call(i, "callee") && !mf.call(i, "callee");
        }, Oe = q.isArray, rb = Jh ? xn(Jh) : h_;
        function ln(i) {
          return i != null && va(i.length) && !wr(i);
        }
        function Mt(i) {
          return Tt(i) && ln(i);
        }
        function ib(i) {
          return i === !0 || i === !1 || Tt(i) && Yt(i) == G;
        }
        var Wr = _1 || Wl, ob = Yh ? xn(Yh) : f_;
        function sb(i) {
          return Tt(i) && i.nodeType === 1 && !qo(i);
        }
        function ab(i) {
          if (i == null)
            return !0;
          if (ln(i) && (Oe(i) || typeof i == "string" || typeof i.splice == "function" || Wr(i) || no(i) || wi(i)))
            return !i.length;
          var s = jt(i);
          if (s == ke || s == Qe)
            return !i.size;
          if (Uo(i))
            return !ll(i).length;
          for (var l in i)
            if (et.call(i, l))
              return !1;
          return !0;
        }
        function ub(i, s) {
          return Lo(i, s);
        }
        function lb(i, s, l) {
          l = typeof l == "function" ? l : t;
          var p = l ? l(i, s) : t;
          return p === t ? Lo(i, s, t, l) : !!p;
        }
        function Rl(i) {
          if (!Tt(i))
            return !1;
          var s = Yt(i);
          return s == we || s == he || typeof i.message == "string" && typeof i.name == "string" && !qo(i);
        }
        function cb(i) {
          return typeof i == "number" && _f(i);
        }
        function wr(i) {
          if (!mt(i))
            return !1;
          var s = Yt(i);
          return s == Ue || s == wt || s == U || s == Se;
        }
        function Ld(i) {
          return typeof i == "number" && i == $e(i);
        }
        function va(i) {
          return typeof i == "number" && i > -1 && i % 1 == 0 && i <= oe;
        }
        function mt(i) {
          var s = typeof i;
          return i != null && (s == "object" || s == "function");
        }
        function Tt(i) {
          return i != null && typeof i == "object";
        }
        var Bd = Qh ? xn(Qh) : p_;
        function hb(i, s) {
          return i === s || ul(i, s, Cl(s));
        }
        function fb(i, s, l) {
          return l = typeof l == "function" ? l : t, ul(i, s, Cl(s), l);
        }
        function db(i) {
          return Fd(i) && i != +i;
        }
        function pb(i) {
          if (Y_(i))
            throw new Pe(a);
          return Of(i);
        }
        function gb(i) {
          return i === null;
        }
        function mb(i) {
          return i == null;
        }
        function Fd(i) {
          return typeof i == "number" || Tt(i) && Yt(i) == tt;
        }
        function qo(i) {
          if (!Tt(i) || Yt(i) != xt)
            return !1;
          var s = Hs(i);
          if (s === null)
            return !0;
          var l = et.call(s, "constructor") && s.constructor;
          return typeof l == "function" && l instanceof l && Fs.call(l) == f1;
        }
        var zl = Xh ? xn(Xh) : g_;
        function vb(i) {
          return Ld(i) && i >= -oe && i <= oe;
        }
        var Ud = ef ? xn(ef) : m_;
        function _a(i) {
          return typeof i == "string" || !Oe(i) && Tt(i) && Yt(i) == yn;
        }
        function Sn(i) {
          return typeof i == "symbol" || Tt(i) && Yt(i) == Rn;
        }
        var no = tf ? xn(tf) : v_;
        function _b(i) {
          return i === t;
        }
        function yb(i) {
          return Tt(i) && jt(i) == cr;
        }
        function bb(i) {
          return Tt(i) && Yt(i) == x;
        }
        var wb = ua(cl), xb = ua(function(i, s) {
          return i <= s;
        });
        function Zd(i) {
          if (!i)
            return [];
          if (ln(i))
            return _a(i) ? Xn(i) : un(i);
          if (Po && i[Po])
            return e1(i[Po]());
          var s = jt(i), l = s == ke ? Yu : s == Qe ? Ds : ro;
          return l(i);
        }
        function xr(i) {
          if (!i)
            return i === 0 ? i : 0;
          if (i = Gn(i), i === te || i === -te) {
            var s = i < 0 ? -1 : 1;
            return s * re;
          }
          return i === i ? i : 0;
        }
        function $e(i) {
          var s = xr(i), l = s % 1;
          return s === s ? l ? s - l : s : 0;
        }
        function qd(i) {
          return i ? vi($e(i), 0, ve) : 0;
        }
        function Gn(i) {
          if (typeof i == "number")
            return i;
          if (Sn(i))
            return ce;
          if (mt(i)) {
            var s = typeof i.valueOf == "function" ? i.valueOf() : i;
            i = mt(s) ? s + "" : s;
          }
          if (typeof i != "string")
            return i === 0 ? i : +i;
          i = uf(i);
          var l = fr.test(i);
          return l || ci.test(i) ? Dv(i.slice(2), l ? 2 : 8) : Co.test(i) ? ce : +i;
        }
        function Hd(i) {
          return sr(i, cn(i));
        }
        function Tb(i) {
          return i ? vi($e(i), -oe, oe) : i === 0 ? i : 0;
        }
        function Xe(i) {
          return i == null ? "" : Tn(i);
        }
        var Sb = Xi(function(i, s) {
          if (Uo(s) || ln(s)) {
            sr(s, zt(s), i);
            return;
          }
          for (var l in s)
            et.call(s, l) && Ro(i, l, s[l]);
        }), Wd = Xi(function(i, s) {
          sr(s, cn(s), i);
        }), ya = Xi(function(i, s, l, p) {
          sr(s, cn(s), i, p);
        }), Cb = Xi(function(i, s, l, p) {
          sr(s, zt(s), i, p);
        }), Mb = yr(rl);
        function Eb(i, s) {
          var l = Qi(i);
          return s == null ? l : Tf(l, s);
        }
        var Ab = Fe(function(i, s) {
          i = it(i);
          var l = -1, p = s.length, m = p > 2 ? s[2] : t;
          for (m && Qt(s[0], s[1], m) && (p = 1); ++l < p; )
            for (var T = s[l], I = cn(T), R = -1, B = I.length; ++R < B; ) {
              var Y = I[R], X = i[Y];
              (X === t || tr(X, Ki[Y]) && !et.call(i, Y)) && (i[Y] = T[Y]);
            }
          return i;
        }), Ib = Fe(function(i) {
          return i.push(t, ud), wn(Gd, t, i);
        });
        function Pb(i, s) {
          return rf(i, Ce(s, 3), or);
        }
        function Ob(i, s) {
          return rf(i, Ce(s, 3), ol);
        }
        function kb(i, s) {
          return i == null ? i : il(i, Ce(s, 3), cn);
        }
        function $b(i, s) {
          return i == null ? i : Af(i, Ce(s, 3), cn);
        }
        function Nb(i, s) {
          return i && or(i, Ce(s, 3));
        }
        function Rb(i, s) {
          return i && ol(i, Ce(s, 3));
        }
        function zb(i) {
          return i == null ? [] : ea(i, zt(i));
        }
        function Db(i) {
          return i == null ? [] : ea(i, cn(i));
        }
        function Dl(i, s, l) {
          var p = i == null ? t : _i(i, s);
          return p === t ? l : p;
        }
        function Lb(i, s) {
          return i != null && hd(i, s, a_);
        }
        function Ll(i, s) {
          return i != null && hd(i, s, u_);
        }
        var Bb = rd(function(i, s, l) {
          s != null && typeof s.toString != "function" && (s = Us.call(s)), i[s] = l;
        }, Fl(hn)), Fb = rd(function(i, s, l) {
          s != null && typeof s.toString != "function" && (s = Us.call(s)), et.call(i, s) ? i[s].push(l) : i[s] = [l];
        }, Ce), Ub = Fe(Do);
        function zt(i) {
          return ln(i) ? wf(i) : ll(i);
        }
        function cn(i) {
          return ln(i) ? wf(i, !0) : __(i);
        }
        function Zb(i, s) {
          var l = {};
          return s = Ce(s, 3), or(i, function(p, m, T) {
            vr(l, s(p, m, T), p);
          }), l;
        }
        function qb(i, s) {
          var l = {};
          return s = Ce(s, 3), or(i, function(p, m, T) {
            vr(l, m, s(p, m, T));
          }), l;
        }
        var Hb = Xi(function(i, s, l) {
          ta(i, s, l);
        }), Gd = Xi(function(i, s, l, p) {
          ta(i, s, l, p);
        }), Wb = yr(function(i, s) {
          var l = {};
          if (i == null)
            return l;
          var p = !1;
          s = ht(s, function(T) {
            return T = qr(T, i), p || (p = T.length > 1), T;
          }), sr(i, Tl(i), l), p && (l = qn(l, g | v | b, B_));
          for (var m = s.length; m--; )
            gl(l, s[m]);
          return l;
        });
        function Gb(i, s) {
          return jd(i, ma(Ce(s)));
        }
        var jb = yr(function(i, s) {
          return i == null ? {} : b_(i, s);
        });
        function jd(i, s) {
          if (i == null)
            return {};
          var l = ht(Tl(i), function(p) {
            return [p];
          });
          return s = Ce(s), Lf(i, l, function(p, m) {
            return s(p, m[0]);
          });
        }
        function Vb(i, s, l) {
          s = qr(s, i);
          var p = -1, m = s.length;
          for (m || (m = 1, i = t); ++p < m; ) {
            var T = i == null ? t : i[ar(s[p])];
            T === t && (p = m, T = l), i = wr(T) ? T.call(i) : T;
          }
          return i;
        }
        function Kb(i, s, l) {
          return i == null ? i : Bo(i, s, l);
        }
        function Jb(i, s, l, p) {
          return p = typeof p == "function" ? p : t, i == null ? i : Bo(i, s, l, p);
        }
        var Vd = sd(zt), Kd = sd(cn);
        function Yb(i, s, l) {
          var p = Oe(i), m = p || Wr(i) || no(i);
          if (s = Ce(s, 4), l == null) {
            var T = i && i.constructor;
            m ? l = p ? new T() : [] : mt(i) ? l = wr(T) ? Qi(Hs(i)) : {} : l = {};
          }
          return (m ? Fn : or)(i, function(I, R, B) {
            return s(l, I, R, B);
          }), l;
        }
        function Qb(i, s) {
          return i == null ? !0 : gl(i, s);
        }
        function Xb(i, s, l) {
          return i == null ? i : qf(i, s, _l(l));
        }
        function ew(i, s, l, p) {
          return p = typeof p == "function" ? p : t, i == null ? i : qf(i, s, _l(l), p);
        }
        function ro(i) {
          return i == null ? [] : Ju(i, zt(i));
        }
        function tw(i) {
          return i == null ? [] : Ju(i, cn(i));
        }
        function nw(i, s, l) {
          return l === t && (l = s, s = t), l !== t && (l = Gn(l), l = l === l ? l : 0), s !== t && (s = Gn(s), s = s === s ? s : 0), vi(Gn(i), s, l);
        }
        function rw(i, s, l) {
          return s = xr(s), l === t ? (l = s, s = 0) : l = xr(l), i = Gn(i), l_(i, s, l);
        }
        function iw(i, s, l) {
          if (l && typeof l != "boolean" && Qt(i, s, l) && (s = l = t), l === t && (typeof s == "boolean" ? (l = s, s = t) : typeof i == "boolean" && (l = i, i = t)), i === t && s === t ? (i = 0, s = 1) : (i = xr(i), s === t ? (s = i, i = 0) : s = xr(s)), i > s) {
            var p = i;
            i = s, s = p;
          }
          if (l || i % 1 || s % 1) {
            var m = yf();
            return Gt(i + m * (s - i + zv("1e-" + ((m + "").length - 1))), s);
          }
          return fl(i, s);
        }
        var ow = eo(function(i, s, l) {
          return s = s.toLowerCase(), i + (l ? Jd(s) : s);
        });
        function Jd(i) {
          return Bl(Xe(i).toLowerCase());
        }
        function Yd(i) {
          return i = Xe(i), i && i.replace(Mo, Kv).replace(Mv, "");
        }
        function sw(i, s, l) {
          i = Xe(i), s = Tn(s);
          var p = i.length;
          l = l === t ? p : vi($e(l), 0, p);
          var m = l;
          return l -= s.length, l >= 0 && i.slice(l, m) == s;
        }
        function aw(i) {
          return i = Xe(i), i && Jt.test(i) ? i.replace(Or, Jv) : i;
        }
        function uw(i) {
          return i = Xe(i), i && Di.test(i) ? i.replace(zn, "\\$&") : i;
        }
        var lw = eo(function(i, s, l) {
          return i + (l ? "-" : "") + s.toLowerCase();
        }), cw = eo(function(i, s, l) {
          return i + (l ? " " : "") + s.toLowerCase();
        }), hw = ed("toLowerCase");
        function fw(i, s, l) {
          i = Xe(i), s = $e(s);
          var p = s ? ji(i) : 0;
          if (!s || p >= s)
            return i;
          var m = (s - p) / 2;
          return aa(Vs(m), l) + i + aa(js(m), l);
        }
        function dw(i, s, l) {
          i = Xe(i), s = $e(s);
          var p = s ? ji(i) : 0;
          return s && p < s ? i + aa(s - p, l) : i;
        }
        function pw(i, s, l) {
          i = Xe(i), s = $e(s);
          var p = s ? ji(i) : 0;
          return s && p < s ? aa(s - p, l) + i : i;
        }
        function gw(i, s, l) {
          return l || s == null ? s = 0 : s && (s = +s), x1(Xe(i).replace(Nr, ""), s || 0);
        }
        function mw(i, s, l) {
          return (l ? Qt(i, s, l) : s === t) ? s = 1 : s = $e(s), dl(Xe(i), s);
        }
        function vw() {
          var i = arguments, s = Xe(i[0]);
          return i.length < 3 ? s : s.replace(i[1], i[2]);
        }
        var _w = eo(function(i, s, l) {
          return i + (l ? "_" : "") + s.toLowerCase();
        });
        function yw(i, s, l) {
          return l && typeof l != "number" && Qt(i, s, l) && (s = l = t), l = l === t ? ve : l >>> 0, l ? (i = Xe(i), i && (typeof s == "string" || s != null && !zl(s)) && (s = Tn(s), !s && Gi(i)) ? Hr(Xn(i), 0, l) : i.split(s, l)) : [];
        }
        var bw = eo(function(i, s, l) {
          return i + (l ? " " : "") + Bl(s);
        });
        function ww(i, s, l) {
          return i = Xe(i), l = l == null ? 0 : vi($e(l), 0, i.length), s = Tn(s), i.slice(l, l + s.length) == s;
        }
        function xw(i, s, l) {
          var p = w.templateSettings;
          l && Qt(i, s, l) && (s = t), i = Xe(i), s = ya({}, s, p, ad);
          var m = ya({}, s.imports, p.imports, ad), T = zt(m), I = Ju(m, T), R, B, Y = 0, X = s.interpolate || Bi, ne = "__p += '", ue = Qu(
            (s.escape || Bi).source + "|" + X.source + "|" + (X === kr ? Os : Bi).source + "|" + (s.evaluate || Bi).source + "|$",
            "g"
          ), _e = "//# sourceURL=" + (et.call(s, "sourceURL") ? (s.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++Ov + "]") + `
`;
          i.replace(ue, function(Ee, Ze, Ge, Cn, Xt, Mn) {
            return Ge || (Ge = Cn), ne += i.slice(Y, Mn).replace(Du, Yv), Ze && (R = !0, ne += `' +
__e(` + Ze + `) +
'`), Xt && (B = !0, ne += `';
` + Xt + `;
__p += '`), Ge && (ne += `' +
((__t = (` + Ge + `)) == null ? '' : __t) +
'`), Y = Mn + Ee.length, Ee;
          }), ne += `';
`;
          var Me = et.call(s, "variable") && s.variable;
          if (!Me)
            ne = `with (obj) {
` + ne + `
}
`;
          else if (Is.test(Me))
            throw new Pe(h);
          ne = (B ? ne.replace(Wt, "") : ne).replace(xo, "$1").replace(oi, "$1;"), ne = "function(" + (Me || "obj") + `) {
` + (Me ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (R ? ", __e = _.escape" : "") + (B ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + ne + `return __p
}`;
          var De = Xd(function() {
            return Ye(T, _e + "return " + ne).apply(t, I);
          });
          if (De.source = ne, Rl(De))
            throw De;
          return De;
        }
        function Tw(i) {
          return Xe(i).toLowerCase();
        }
        function Sw(i) {
          return Xe(i).toUpperCase();
        }
        function Cw(i, s, l) {
          if (i = Xe(i), i && (l || s === t))
            return uf(i);
          if (!i || !(s = Tn(s)))
            return i;
          var p = Xn(i), m = Xn(s), T = lf(p, m), I = cf(p, m) + 1;
          return Hr(p, T, I).join("");
        }
        function Mw(i, s, l) {
          if (i = Xe(i), i && (l || s === t))
            return i.slice(0, ff(i) + 1);
          if (!i || !(s = Tn(s)))
            return i;
          var p = Xn(i), m = cf(p, Xn(s)) + 1;
          return Hr(p, 0, m).join("");
        }
        function Ew(i, s, l) {
          if (i = Xe(i), i && (l || s === t))
            return i.replace(Nr, "");
          if (!i || !(s = Tn(s)))
            return i;
          var p = Xn(i), m = lf(p, Xn(s));
          return Hr(p, m).join("");
        }
        function Aw(i, s) {
          var l = be, p = ge;
          if (mt(s)) {
            var m = "separator" in s ? s.separator : m;
            l = "length" in s ? $e(s.length) : l, p = "omission" in s ? Tn(s.omission) : p;
          }
          i = Xe(i);
          var T = i.length;
          if (Gi(i)) {
            var I = Xn(i);
            T = I.length;
          }
          if (l >= T)
            return i;
          var R = l - ji(p);
          if (R < 1)
            return p;
          var B = I ? Hr(I, 0, R).join("") : i.slice(0, R);
          if (m === t)
            return B + p;
          if (I && (R += B.length - R), zl(m)) {
            if (i.slice(R).search(m)) {
              var Y, X = B;
              for (m.global || (m = Qu(m.source, Xe(So.exec(m)) + "g")), m.lastIndex = 0; Y = m.exec(X); )
                var ne = Y.index;
              B = B.slice(0, ne === t ? R : ne);
            }
          } else if (i.indexOf(Tn(m), R) != R) {
            var ue = B.lastIndexOf(m);
            ue > -1 && (B = B.slice(0, ue));
          }
          return B + p;
        }
        function Iw(i) {
          return i = Xe(i), i && hr.test(i) ? i.replace(Pr, i1) : i;
        }
        var Pw = eo(function(i, s, l) {
          return i + (l ? " " : "") + s.toUpperCase();
        }), Bl = ed("toUpperCase");
        function Qd(i, s, l) {
          return i = Xe(i), s = l ? t : s, s === t ? Xv(i) ? a1(i) : Hv(i) : i.match(s) || [];
        }
        var Xd = Fe(function(i, s) {
          try {
            return wn(i, t, s);
          } catch (l) {
            return Rl(l) ? l : new Pe(l);
          }
        }), Ow = yr(function(i, s) {
          return Fn(s, function(l) {
            l = ar(l), vr(i, l, $l(i[l], i));
          }), i;
        });
        function kw(i) {
          var s = i == null ? 0 : i.length, l = Ce();
          return i = s ? ht(i, function(p) {
            if (typeof p[1] != "function")
              throw new Un(u);
            return [l(p[0]), p[1]];
          }) : [], Fe(function(p) {
            for (var m = -1; ++m < s; ) {
              var T = i[m];
              if (wn(T[0], this, p))
                return wn(T[1], this, p);
            }
          });
        }
        function $w(i) {
          return i_(qn(i, g));
        }
        function Fl(i) {
          return function() {
            return i;
          };
        }
        function Nw(i, s) {
          return i == null || i !== i ? s : i;
        }
        var Rw = nd(), zw = nd(!0);
        function hn(i) {
          return i;
        }
        function Ul(i) {
          return kf(typeof i == "function" ? i : qn(i, g));
        }
        function Dw(i) {
          return Nf(qn(i, g));
        }
        function Lw(i, s) {
          return Rf(i, qn(s, g));
        }
        var Bw = Fe(function(i, s) {
          return function(l) {
            return Do(l, i, s);
          };
        }), Fw = Fe(function(i, s) {
          return function(l) {
            return Do(i, l, s);
          };
        });
        function Zl(i, s, l) {
          var p = zt(s), m = ea(s, p);
          l == null && !(mt(s) && (m.length || !p.length)) && (l = s, s = i, i = this, m = ea(s, zt(s)));
          var T = !(mt(l) && "chain" in l) || !!l.chain, I = wr(i);
          return Fn(m, function(R) {
            var B = s[R];
            i[R] = B, I && (i.prototype[R] = function() {
              var Y = this.__chain__;
              if (T || Y) {
                var X = i(this.__wrapped__), ne = X.__actions__ = un(this.__actions__);
                return ne.push({ func: B, args: arguments, thisArg: i }), X.__chain__ = Y, X;
              }
              return B.apply(i, Lr([this.value()], arguments));
            });
          }), i;
        }
        function Uw() {
          return Ut._ === this && (Ut._ = d1), this;
        }
        function ql() {
        }
        function Zw(i) {
          return i = $e(i), Fe(function(s) {
            return zf(s, i);
          });
        }
        var qw = bl(ht), Hw = bl(nf), Ww = bl(Wu);
        function ep(i) {
          return El(i) ? Gu(ar(i)) : w_(i);
        }
        function Gw(i) {
          return function(s) {
            return i == null ? t : _i(i, s);
          };
        }
        var jw = id(), Vw = id(!0);
        function Hl() {
          return [];
        }
        function Wl() {
          return !1;
        }
        function Kw() {
          return {};
        }
        function Jw() {
          return "";
        }
        function Yw() {
          return !0;
        }
        function Qw(i, s) {
          if (i = $e(i), i < 1 || i > oe)
            return [];
          var l = ve, p = Gt(i, ve);
          s = Ce(s), i -= ve;
          for (var m = Ku(p, s); ++l < i; )
            s(l);
          return m;
        }
        function Xw(i) {
          return Oe(i) ? ht(i, ar) : Sn(i) ? [i] : un(bd(Xe(i)));
        }
        function e5(i) {
          var s = ++h1;
          return Xe(i) + s;
        }
        var t5 = sa(function(i, s) {
          return i + s;
        }, 0), n5 = wl("ceil"), r5 = sa(function(i, s) {
          return i / s;
        }, 1), i5 = wl("floor");
        function o5(i) {
          return i && i.length ? Xs(i, hn, sl) : t;
        }
        function s5(i, s) {
          return i && i.length ? Xs(i, Ce(s, 2), sl) : t;
        }
        function a5(i) {
          return sf(i, hn);
        }
        function u5(i, s) {
          return sf(i, Ce(s, 2));
        }
        function l5(i) {
          return i && i.length ? Xs(i, hn, cl) : t;
        }
        function c5(i, s) {
          return i && i.length ? Xs(i, Ce(s, 2), cl) : t;
        }
        var h5 = sa(function(i, s) {
          return i * s;
        }, 1), f5 = wl("round"), d5 = sa(function(i, s) {
          return i - s;
        }, 0);
        function p5(i) {
          return i && i.length ? Vu(i, hn) : 0;
        }
        function g5(i, s) {
          return i && i.length ? Vu(i, Ce(s, 2)) : 0;
        }
        return w.after = D2, w.ary = Od, w.assign = Sb, w.assignIn = Wd, w.assignInWith = ya, w.assignWith = Cb, w.at = Mb, w.before = kd, w.bind = $l, w.bindAll = Ow, w.bindKey = $d, w.castArray = K2, w.chain = Ad, w.chunk = iy, w.compact = oy, w.concat = sy, w.cond = kw, w.conforms = $w, w.constant = Fl, w.countBy = p2, w.create = Eb, w.curry = Nd, w.curryRight = Rd, w.debounce = zd, w.defaults = Ab, w.defaultsDeep = Ib, w.defer = L2, w.delay = B2, w.difference = ay, w.differenceBy = uy, w.differenceWith = ly, w.drop = cy, w.dropRight = hy, w.dropRightWhile = fy, w.dropWhile = dy, w.fill = py, w.filter = m2, w.flatMap = y2, w.flatMapDeep = b2, w.flatMapDepth = w2, w.flatten = Sd, w.flattenDeep = gy, w.flattenDepth = my, w.flip = F2, w.flow = Rw, w.flowRight = zw, w.fromPairs = vy, w.functions = zb, w.functionsIn = Db, w.groupBy = x2, w.initial = yy, w.intersection = by, w.intersectionBy = wy, w.intersectionWith = xy, w.invert = Bb, w.invertBy = Fb, w.invokeMap = S2, w.iteratee = Ul, w.keyBy = C2, w.keys = zt, w.keysIn = cn, w.map = da, w.mapKeys = Zb, w.mapValues = qb, w.matches = Dw, w.matchesProperty = Lw, w.memoize = ga, w.merge = Hb, w.mergeWith = Gd, w.method = Bw, w.methodOf = Fw, w.mixin = Zl, w.negate = ma, w.nthArg = Zw, w.omit = Wb, w.omitBy = Gb, w.once = U2, w.orderBy = M2, w.over = qw, w.overArgs = Z2, w.overEvery = Hw, w.overSome = Ww, w.partial = Nl, w.partialRight = Dd, w.partition = E2, w.pick = jb, w.pickBy = jd, w.property = ep, w.propertyOf = Gw, w.pull = My, w.pullAll = Md, w.pullAllBy = Ey, w.pullAllWith = Ay, w.pullAt = Iy, w.range = jw, w.rangeRight = Vw, w.rearg = q2, w.reject = P2, w.remove = Py, w.rest = H2, w.reverse = Ol, w.sampleSize = k2, w.set = Kb, w.setWith = Jb, w.shuffle = $2, w.slice = Oy, w.sortBy = z2, w.sortedUniq = Ly, w.sortedUniqBy = By, w.split = yw, w.spread = W2, w.tail = Fy, w.take = Uy, w.takeRight = Zy, w.takeRightWhile = qy, w.takeWhile = Hy, w.tap = o2, w.throttle = G2, w.thru = fa, w.toArray = Zd, w.toPairs = Vd, w.toPairsIn = Kd, w.toPath = Xw, w.toPlainObject = Hd, w.transform = Yb, w.unary = j2, w.union = Wy, w.unionBy = Gy, w.unionWith = jy, w.uniq = Vy, w.uniqBy = Ky, w.uniqWith = Jy, w.unset = Qb, w.unzip = kl, w.unzipWith = Ed, w.update = Xb, w.updateWith = ew, w.values = ro, w.valuesIn = tw, w.without = Yy, w.words = Qd, w.wrap = V2, w.xor = Qy, w.xorBy = Xy, w.xorWith = e2, w.zip = t2, w.zipObject = n2, w.zipObjectDeep = r2, w.zipWith = i2, w.entries = Vd, w.entriesIn = Kd, w.extend = Wd, w.extendWith = ya, Zl(w, w), w.add = t5, w.attempt = Xd, w.camelCase = ow, w.capitalize = Jd, w.ceil = n5, w.clamp = nw, w.clone = J2, w.cloneDeep = Q2, w.cloneDeepWith = X2, w.cloneWith = Y2, w.conformsTo = eb, w.deburr = Yd, w.defaultTo = Nw, w.divide = r5, w.endsWith = sw, w.eq = tr, w.escape = aw, w.escapeRegExp = uw, w.every = g2, w.find = v2, w.findIndex = xd, w.findKey = Pb, w.findLast = _2, w.findLastIndex = Td, w.findLastKey = Ob, w.floor = i5, w.forEach = Id, w.forEachRight = Pd, w.forIn = kb, w.forInRight = $b, w.forOwn = Nb, w.forOwnRight = Rb, w.get = Dl, w.gt = tb, w.gte = nb, w.has = Lb, w.hasIn = Ll, w.head = Cd, w.identity = hn, w.includes = T2, w.indexOf = _y, w.inRange = rw, w.invoke = Ub, w.isArguments = wi, w.isArray = Oe, w.isArrayBuffer = rb, w.isArrayLike = ln, w.isArrayLikeObject = Mt, w.isBoolean = ib, w.isBuffer = Wr, w.isDate = ob, w.isElement = sb, w.isEmpty = ab, w.isEqual = ub, w.isEqualWith = lb, w.isError = Rl, w.isFinite = cb, w.isFunction = wr, w.isInteger = Ld, w.isLength = va, w.isMap = Bd, w.isMatch = hb, w.isMatchWith = fb, w.isNaN = db, w.isNative = pb, w.isNil = mb, w.isNull = gb, w.isNumber = Fd, w.isObject = mt, w.isObjectLike = Tt, w.isPlainObject = qo, w.isRegExp = zl, w.isSafeInteger = vb, w.isSet = Ud, w.isString = _a, w.isSymbol = Sn, w.isTypedArray = no, w.isUndefined = _b, w.isWeakMap = yb, w.isWeakSet = bb, w.join = Ty, w.kebabCase = lw, w.last = Wn, w.lastIndexOf = Sy, w.lowerCase = cw, w.lowerFirst = hw, w.lt = wb, w.lte = xb, w.max = o5, w.maxBy = s5, w.mean = a5, w.meanBy = u5, w.min = l5, w.minBy = c5, w.stubArray = Hl, w.stubFalse = Wl, w.stubObject = Kw, w.stubString = Jw, w.stubTrue = Yw, w.multiply = h5, w.nth = Cy, w.noConflict = Uw, w.noop = ql, w.now = pa, w.pad = fw, w.padEnd = dw, w.padStart = pw, w.parseInt = gw, w.random = iw, w.reduce = A2, w.reduceRight = I2, w.repeat = mw, w.replace = vw, w.result = Vb, w.round = f5, w.runInContext = D, w.sample = O2, w.size = N2, w.snakeCase = _w, w.some = R2, w.sortedIndex = ky, w.sortedIndexBy = $y, w.sortedIndexOf = Ny, w.sortedLastIndex = Ry, w.sortedLastIndexBy = zy, w.sortedLastIndexOf = Dy, w.startCase = bw, w.startsWith = ww, w.subtract = d5, w.sum = p5, w.sumBy = g5, w.template = xw, w.times = Qw, w.toFinite = xr, w.toInteger = $e, w.toLength = qd, w.toLower = Tw, w.toNumber = Gn, w.toSafeInteger = Tb, w.toString = Xe, w.toUpper = Sw, w.trim = Cw, w.trimEnd = Mw, w.trimStart = Ew, w.truncate = Aw, w.unescape = Iw, w.uniqueId = e5, w.upperCase = Pw, w.upperFirst = Bl, w.each = Id, w.eachRight = Pd, w.first = Cd, Zl(w, function() {
          var i = {};
          return or(w, function(s, l) {
            et.call(w.prototype, l) || (i[l] = s);
          }), i;
        }(), { chain: !1 }), w.VERSION = r, Fn(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(i) {
          w[i].placeholder = w;
        }), Fn(["drop", "take"], function(i, s) {
          He.prototype[i] = function(l) {
            l = l === t ? 1 : Ot($e(l), 0);
            var p = this.__filtered__ && !s ? new He(this) : this.clone();
            return p.__filtered__ ? p.__takeCount__ = Gt(l, p.__takeCount__) : p.__views__.push({
              size: Gt(l, ve),
              type: i + (p.__dir__ < 0 ? "Right" : "")
            }), p;
          }, He.prototype[i + "Right"] = function(l) {
            return this.reverse()[i](l).reverse();
          };
        }), Fn(["filter", "map", "takeWhile"], function(i, s) {
          var l = s + 1, p = l == Le || l == We;
          He.prototype[i] = function(m) {
            var T = this.clone();
            return T.__iteratees__.push({
              iteratee: Ce(m, 3),
              type: l
            }), T.__filtered__ = T.__filtered__ || p, T;
          };
        }), Fn(["head", "last"], function(i, s) {
          var l = "take" + (s ? "Right" : "");
          He.prototype[i] = function() {
            return this[l](1).value()[0];
          };
        }), Fn(["initial", "tail"], function(i, s) {
          var l = "drop" + (s ? "" : "Right");
          He.prototype[i] = function() {
            return this.__filtered__ ? new He(this) : this[l](1);
          };
        }), He.prototype.compact = function() {
          return this.filter(hn);
        }, He.prototype.find = function(i) {
          return this.filter(i).head();
        }, He.prototype.findLast = function(i) {
          return this.reverse().find(i);
        }, He.prototype.invokeMap = Fe(function(i, s) {
          return typeof i == "function" ? new He(this) : this.map(function(l) {
            return Do(l, i, s);
          });
        }), He.prototype.reject = function(i) {
          return this.filter(ma(Ce(i)));
        }, He.prototype.slice = function(i, s) {
          i = $e(i);
          var l = this;
          return l.__filtered__ && (i > 0 || s < 0) ? new He(l) : (i < 0 ? l = l.takeRight(-i) : i && (l = l.drop(i)), s !== t && (s = $e(s), l = s < 0 ? l.dropRight(-s) : l.take(s - i)), l);
        }, He.prototype.takeRightWhile = function(i) {
          return this.reverse().takeWhile(i).reverse();
        }, He.prototype.toArray = function() {
          return this.take(ve);
        }, or(He.prototype, function(i, s) {
          var l = /^(?:filter|find|map|reject)|While$/.test(s), p = /^(?:head|last)$/.test(s), m = w[p ? "take" + (s == "last" ? "Right" : "") : s], T = p || /^find/.test(s);
          m && (w.prototype[s] = function() {
            var I = this.__wrapped__, R = p ? [1] : arguments, B = I instanceof He, Y = R[0], X = B || Oe(I), ne = function(Ze) {
              var Ge = m.apply(w, Lr([Ze], R));
              return p && ue ? Ge[0] : Ge;
            };
            X && l && typeof Y == "function" && Y.length != 1 && (B = X = !1);
            var ue = this.__chain__, _e = !!this.__actions__.length, Me = T && !ue, De = B && !_e;
            if (!T && X) {
              I = De ? I : new He(this);
              var Ee = i.apply(I, R);
              return Ee.__actions__.push({ func: fa, args: [ne], thisArg: t }), new Zn(Ee, ue);
            }
            return Me && De ? i.apply(this, R) : (Ee = this.thru(ne), Me ? p ? Ee.value()[0] : Ee.value() : Ee);
          });
        }), Fn(["pop", "push", "shift", "sort", "splice", "unshift"], function(i) {
          var s = Ls[i], l = /^(?:push|sort|unshift)$/.test(i) ? "tap" : "thru", p = /^(?:pop|shift)$/.test(i);
          w.prototype[i] = function() {
            var m = arguments;
            if (p && !this.__chain__) {
              var T = this.value();
              return s.apply(Oe(T) ? T : [], m);
            }
            return this[l](function(I) {
              return s.apply(Oe(I) ? I : [], m);
            });
          };
        }), or(He.prototype, function(i, s) {
          var l = w[s];
          if (l) {
            var p = l.name + "";
            et.call(Yi, p) || (Yi[p] = []), Yi[p].push({ name: s, func: l });
          }
        }), Yi[oa(t, S).name] = [{
          name: "wrapper",
          func: t
        }], He.prototype.clone = I1, He.prototype.reverse = P1, He.prototype.value = O1, w.prototype.at = s2, w.prototype.chain = a2, w.prototype.commit = u2, w.prototype.next = l2, w.prototype.plant = h2, w.prototype.reverse = f2, w.prototype.toJSON = w.prototype.valueOf = w.prototype.value = d2, w.prototype.first = w.prototype.head, Po && (w.prototype[Po] = c2), w;
      }, Vi = u1();
      di ? ((di.exports = Vi)._ = Vi, Uu._ = Vi) : Ut._ = Vi;
    }).call(wA);
  }(Jo, Jo.exports)), Jo.exports;
}
var Vn = xA();
const TA = /* @__PURE__ */ Cs(Vn);
class SA {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  constructor(e, t, r) {
    if (this.inputs = e, this.output = t, typeof r == "function") {
      const o = r.toString(), a = /[^{]+(\{[\s\S]*\})/.exec(o);
      if (!(a != null && a[1]))
        throw new Error("couldn't get function body from expression");
      r = a[1];
    }
    this.expr = r, this.exprFn = Function(r);
  }
  run(e, t) {
    const r = this.inputs.map((a) => Vn.get(e, a));
    let o = this.exprFn(...r);
    t && (o = t.parse(o)), Vn.set(e, this.output, o);
  }
}
var vs, _s;
const Ci = class Ci {
  constructor(e) {
    ba(this, vs);
    ba(this, _s);
    this.config = e, this.layers = e.layers, Kl(this, vs, eu.parse({})), Kl(this, _s, jc.parse({})), this.config.graph.addDefaultStyle && this.layers.unshift({
      node: {
        selector: "",
        style: eu.parse(JE)
      },
      edge: {
        selector: "",
        style: jc.parse(VE)
      }
    });
  }
  static fromJson(e) {
    const t = JSON.parse(e);
    return this.fromObject(t);
  }
  static fromObject(e) {
    const t = pA.parse(e);
    return new Ci(t);
  }
  static async fromUrl(e) {
    const t = await fetch(e);
    if (!t.body)
      throw new Error("JSON response had no body");
    const r = await t.json();
    return Ci.fromObject(r);
  }
  static default() {
    return Ci.fromObject({
      graphtyTemplate: !0,
      majorVersion: "1"
    });
  }
  addLayer(e) {
    this.layers.push(e);
  }
  insertLayer(e, t) {
    this.layers.splice(e, 0, t);
  }
  getStyleForNode(e) {
    const t = [];
    for (const o of this.layers) {
      const { node: a } = o;
      O0(a, e) && (a != null && a.style) && t.unshift(a.style);
    }
    const r = Vn.defaultsDeep({}, ...t, Vl(this, vs));
    return t.length === 0 && (r.enabled = !1), Ci.getNodeIdForStyle(r);
  }
  getCalculatedStylesForNode(e) {
    const t = [];
    for (const r of this.layers) {
      const { node: o } = r;
      if (O0(o, e) && (o != null && o.calculatedStyle)) {
        const { inputs: u, output: h, expr: c } = o.calculatedStyle, f = new SA(u, h, c);
        t.unshift(f);
      }
    }
    return t;
  }
  getStyleForEdge(e) {
    const t = [];
    for (const o of this.layers) {
      const { edge: a } = o;
      let u = (a == null ? void 0 : a.selector) !== void 0 && a.selector.length === 0;
      if (!u) {
        const h = Kr.search(e, `[${a == null ? void 0 : a.selector}]`);
        Array.isArray(h) && typeof h[0] == "boolean" && (u = h[0]);
      }
      u && (a != null && a.style) && t.unshift(a.style);
    }
    const r = Vn.defaultsDeep({}, ...t, Vl(this, _s));
    return t.length === 0 && (r.enabled = !1), Ci.getEdgeIdForStyle(r);
  }
  static getStyleForNodeStyleId(e) {
    const t = A0.get(e);
    if (!t)
      throw new TypeError(`couldn't find NodeStyleId: ${e}`);
    return t;
  }
  static getStyleForEdgeStyleId(e) {
    const t = I0.get(e);
    if (!t)
      throw new TypeError(`couldn't find NodeStyleId: ${e}`);
    return t;
  }
  static getNodeIdForStyle(e) {
    return P0(A0, e);
  }
  static getEdgeIdForStyle(e) {
    return P0(I0, e);
  }
};
vs = new WeakMap(), _s = new WeakMap();
let En = Ci;
const A0 = /* @__PURE__ */ new Map(), I0 = /* @__PURE__ */ new Map();
function P0(n, e) {
  let t;
  for (const [r, o] of n.entries())
    if (Vn.isEqual(o, e)) {
      t = r;
      break;
    }
  return t === void 0 && (t = n.size, n.set(t, e)), t;
}
function O0(n, e) {
  if (!n)
    return !1;
  let t = n.selector.length === 0;
  if (!t) {
    const r = Kr.search(e, `[${n.selector}]`);
    Array.isArray(r) && typeof r[0] == "boolean" && (t = r[0]);
  }
  return t;
}
class rr {
  constructor(e, t, r, o, a, u = {}) {
    var d, g;
    this.arrowMesh = null, this.label = null, this.parentGraph = e, this.srcId = t, this.dstId = r, this.id = `${t}:${r}`, this.data = a, this.opts = u;
    const h = e.nodeCache.get(t);
    if (!h)
      throw new Error(`Attempting to create edge '${t}->${r}', Node '${t}' hasn't been created yet.`);
    const c = e.nodeCache.get(r);
    if (!c)
      throw new Error(`Attempting to create edge '${t}->${r}', Node '${r}' hasn't been created yet.`);
    this.srcNode = h, this.dstNode = c, this.ray = new w5(this.srcNode.mesh.position, this.dstNode.mesh.position), this.styleId = o, (d = this.parentGraph.layoutEngine) == null || d.addEdge(this), this.mesh = rr.defaultEdgeMeshFactory(this, this.parentGraph, this.styleId);
    const f = En.getStyleForEdgeStyleId(this.styleId);
    (g = f.label) != null && g.enabled && (this.label = rr.createLabel(this, f));
  }
  update() {
    var o;
    const e = (o = this.parentGraph.layoutEngine) == null ? void 0 : o.getEdgePosition(this);
    if (!e)
      return;
    const { srcPoint: t, dstPoint: r } = this.transformArrowCap();
    if (t && r ? this.transformEdgeMesh(
      t,
      r
    ) : this.transformEdgeMesh(
      new kt(e.src.x, e.src.y, e.src.z),
      new kt(e.dst.x, e.dst.y, e.dst.z)
    ), this.label) {
      const a = new kt(
        (e.src.x + e.dst.x) / 2,
        (e.src.y + e.dst.y) / 2,
        ((e.src.z ?? 0) + (e.dst.z ?? 0)) / 2
      );
      this.label.attachTo(a, "center", 0);
    }
  }
  updateStyle(e) {
    var r;
    if (e === this.styleId)
      return;
    this.styleId = e, this.mesh.dispose(), this.mesh = rr.defaultEdgeMeshFactory(this, this.parentGraph, e);
    const t = En.getStyleForEdgeStyleId(e);
    (r = t.label) != null && r.enabled ? (this.label && this.label.dispose(), this.label = rr.createLabel(this, t)) : this.label && (this.label.dispose(), this.label = null);
  }
  static updateRays(e) {
    var t;
    if (e.needRays && e.layoutEngine) {
      for (const r of e.layoutEngine.edges) {
        const o = r.srcNode.mesh, a = r.dstNode.mesh, u = En.getStyleForEdgeStyleId(r.styleId);
        ((t = u.arrowHead) == null ? void 0 : t.type) === void 0 || u.arrowHead.type === "none" || (r.ray.position = a.position, r.ray.direction = a.position.subtract(o.position));
      }
      e.scene.render();
    }
  }
  static defaultEdgeMeshFactory(e, t, r) {
    const o = En.getStyleForEdgeStyleId(r);
    o.arrowHead && o.arrowHead.type !== "none" && (e.arrowMesh = t.meshCache.get(`edge-arrowhead-style-${r}`, () => {
      var f, d, g;
      const u = CA(((f = o.line) == null ? void 0 : f.width) ?? 0.25), h = dc(((d = o.line) == null ? void 0 : d.width) ?? 0.25), c = x5.GetArrowCap(
        new kt(0, 0, -h),
        // position
        new kt(0, 0, 1),
        // direction
        h,
        // length
        u,
        // widthUp
        u
        // widthDown
      );
      return Jl(
        "lines",
        {
          points: c.points,
          widths: c.widths,
          widthDistribution: T5.WIDTH_DISTRIBUTION_START
          // instance: line,
        },
        {
          color: Mr.FromHexString(((g = o.line) == null ? void 0 : g.color) ?? "#FFFFFF")
        }
        // e.parentGraph.scene
      );
    }));
    const a = t.meshCache.get(`edge-style-${r}`, () => {
      var u;
      return (u = o.line) != null && u.animationSpeed ? rr.createMovingLine(e, t, o) : rr.createPlainLine(e, t, o);
    });
    return a.isPickable = !1, a.metadata = {}, a.metadata.parentEdge = this, a;
  }
  static createPlainLine(e, t, r) {
    var o, a;
    return Jl(
      "edge-plain",
      {
        points: rr.unitVectorPoints
      },
      {
        color: Mr.FromHexString(((o = r.line) == null ? void 0 : o.color) ?? "#FFFFFF"),
        width: ((a = r.line) == null ? void 0 : a.width) ?? 0.25
      }
    );
  }
  static createMovingLine(e, t, r) {
    var E, S;
    const o = Mr.FromHexString("#D3D3D3"), a = Mr.FromHexString(((E = r.line) == null ? void 0 : E.color) ?? "#FF0000"), u = Math.floor(o.r * 255), h = Math.floor(o.g * 255), c = Math.floor(o.b * 255), f = Math.floor(a.r * 255), d = Math.floor(a.g * 255), g = Math.floor(a.b * 255), v = new Uint8Array([u, h, c, f, d, g]), b = new op(
      v,
      // data
      v.length / 3,
      // width
      1,
      // height
      Ga.TEXTUREFORMAT_RGB,
      // format
      t.scene,
      // sceneOrEngine
      !1,
      // generateMipMaps
      !0,
      // invertY
      Ga.TEXTURE_NEAREST_NEAREST
      // samplingMode
      // samplingMode
      // type
      // creationFlags
      // useSRGBBuffer
    );
    b.wrapU = op.WRAP_ADDRESSMODE, b.name = "moving-texture";
    const _ = Jl(
      "edge-moving",
      {
        points: rr.unitVectorPoints
      },
      {
        // color: Color3.FromHexString(colorNameToHex(edgeColor))
        width: ((S = r.line) == null ? void 0 : S.width) ?? 0.25,
        colorMode: S5.COLOR_MODE_MULTIPLY
      }
    ), O = _.material;
    return O.emissiveTexture = b, O.disableLighting = !0, b.uScale = 5, t.scene.onBeforeRenderObservable.add(() => {
      b.uOffset -= 0.04 * t.scene.getAnimationRatio();
    }), _;
  }
  transformEdgeMesh(e, t) {
    const r = t.subtract(e), o = new kt(
      e.x + r.x / 2,
      e.y + r.y / 2,
      e.z + r.z / 2
    ), a = r.length();
    this.mesh.position = o, this.mesh.lookAt(t), this.mesh.scaling.z = a;
  }
  transformArrowCap() {
    var e;
    if (this.arrowMesh) {
      this.parentGraph.stats.arrowCapUpdate.beginMonitoring();
      const { srcPoint: t, dstPoint: r, newEndPoint: o } = this.getInterceptPoints();
      if (!t || !r || !o) {
        const a = this.srcNode.mesh.position, u = this.dstNode.mesh.position;
        if (a.equalsWithEpsilon(u, 0.01))
          return this.arrowMesh.setEnabled(!1), this.parentGraph.stats.arrowCapUpdate.endMonitoring(), {
            srcPoint: a,
            dstPoint: u
          };
        const h = u.subtract(a).normalize(), c = En.getStyleForEdgeStyleId(this.styleId), f = dc(((e = c.line) == null ? void 0 : e.width) ?? 0.25), d = this.dstNode.size || 1, g = this.srcNode.size || 1, v = u.subtract(h.scale(d)), b = a.add(h.scale(g)), _ = v.subtract(h.scale(f));
        return this.arrowMesh.setEnabled(!0), this.arrowMesh.position = v, this.arrowMesh.lookAt(this.dstNode.mesh.position), this.parentGraph.stats.arrowCapUpdate.endMonitoring(), {
          srcPoint: b,
          dstPoint: _
        };
      }
      return this.arrowMesh.setEnabled(!0), this.arrowMesh.position = r, this.arrowMesh.lookAt(this.dstNode.mesh.position), this.parentGraph.stats.arrowCapUpdate.endMonitoring(), {
        srcPoint: t,
        dstPoint: o
        // dstPoint,
      };
    }
    return {
      srcPoint: null,
      dstPoint: null
    };
  }
  getInterceptPoints() {
    var c;
    const e = this.srcNode.mesh, t = this.dstNode.mesh;
    this.parentGraph.stats.intersectCalc.beginMonitoring();
    const r = this.ray.intersectsMeshes([t]), o = this.ray.intersectsMeshes([e]);
    this.parentGraph.stats.intersectCalc.endMonitoring();
    let a = null, u = null, h = null;
    if (r.length && o.length) {
      const f = En.getStyleForEdgeStyleId(this.styleId), d = dc(((c = f.line) == null ? void 0 : c.width) ?? 0.25);
      if (u = r[0].pickedPoint, a = o[0].pickedPoint, !a || !u)
        throw new TypeError("error picking points");
      const g = a.subtract(u).length(), v = g - d, { x: b, y: _, z: O } = a, { x: E, y: S, z: k } = u, C = b + v / g * (E - b), A = _ + v / g * (S - _), N = O + v / g * (k - O);
      h = new kt(C, A, N);
    }
    return {
      srcPoint: a,
      dstPoint: u,
      newEndPoint: h
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
  static createLabel(e, t) {
    var h, c, f, d, g, v, b, _, O, E, S, k, C, A, N, L, F, H, se, be, ge, pe, Je, Le, rt, We, te, oe, re, ce, ve, xe, Re, Ve, ae, ee, U, G, J, he, we, Ue, wt, ke, tt, Nt, xt, Nn, Se, Ft, Qe, yn;
    let r = e.id;
    const o = t.label;
    if (o.text !== void 0 && o.text !== null)
      (typeof o.text == "string" || typeof o.text == "number" || typeof o.text == "boolean") && (r = String(o.text));
    else if (o.textPath && typeof o.textPath == "string")
      try {
        const Rn = Hm.search(e.data, o.textPath);
        Rn != null && (r = String(Rn));
      } catch {
      }
    const a = {
      text: r
    };
    return ((h = t.label) == null ? void 0 : h.font) !== void 0 && (a.font = t.label.font), ((c = t.label) == null ? void 0 : c.fontSize) !== void 0 && (a.fontSize = t.label.fontSize), ((f = t.label) == null ? void 0 : f.fontWeight) !== void 0 && (a.fontWeight = t.label.fontWeight), ((d = t.label) == null ? void 0 : d.lineHeight) !== void 0 && (a.lineHeight = t.label.lineHeight), ((g = t.label) == null ? void 0 : g.textColor) !== void 0 && (a.textColor = t.label.textColor), ((v = t.label) == null ? void 0 : v.backgroundColor) !== void 0 && (a.backgroundColor = t.label.backgroundColor), ((b = t.label) == null ? void 0 : b.borderWidth) !== void 0 && (a.borderWidth = t.label.borderWidth), ((_ = t.label) == null ? void 0 : _.borderColor) !== void 0 && (a.borderColor = t.label.borderColor), ((O = t.label) == null ? void 0 : O.borders) !== void 0 && (a.borders = t.label.borders), ((E = t.label) == null ? void 0 : E.marginTop) !== void 0 && (a.marginTop = t.label.marginTop), ((S = t.label) == null ? void 0 : S.marginBottom) !== void 0 && (a.marginBottom = t.label.marginBottom), ((k = t.label) == null ? void 0 : k.marginLeft) !== void 0 && (a.marginLeft = t.label.marginLeft), ((C = t.label) == null ? void 0 : C.marginRight) !== void 0 && (a.marginRight = t.label.marginRight), ((A = t.label) == null ? void 0 : A.textAlign) !== void 0 && (a.textAlign = t.label.textAlign), ((N = t.label) == null ? void 0 : N.cornerRadius) !== void 0 && (a.cornerRadius = t.label.cornerRadius), ((L = t.label) == null ? void 0 : L.autoSize) !== void 0 && (a.autoSize = t.label.autoSize), ((F = t.label) == null ? void 0 : F.resolution) !== void 0 && (a.resolution = t.label.resolution), ((H = t.label) == null ? void 0 : H.billboardMode) !== void 0 && (a.billboardMode = t.label.billboardMode), ((se = t.label) == null ? void 0 : se.depthFadeEnabled) !== void 0 && (a.depthFadeEnabled = t.label.depthFadeEnabled), ((be = t.label) == null ? void 0 : be.depthFadeNear) !== void 0 && (a.depthFadeNear = t.label.depthFadeNear), ((ge = t.label) == null ? void 0 : ge.depthFadeFar) !== void 0 && (a.depthFadeFar = t.label.depthFadeFar), ((pe = t.label) == null ? void 0 : pe.textOutline) !== void 0 && (a.textOutline = t.label.textOutline), ((Je = t.label) == null ? void 0 : Je.textOutlineWidth) !== void 0 && (a.textOutlineWidth = t.label.textOutlineWidth), ((Le = t.label) == null ? void 0 : Le.textOutlineColor) !== void 0 && (a.textOutlineColor = t.label.textOutlineColor), ((rt = t.label) == null ? void 0 : rt.textOutlineJoin) !== void 0 && (a.textOutlineJoin = t.label.textOutlineJoin), ((We = t.label) == null ? void 0 : We.textShadow) !== void 0 && (a.textShadow = t.label.textShadow), ((te = t.label) == null ? void 0 : te.textShadowColor) !== void 0 && (a.textShadowColor = t.label.textShadowColor), ((oe = t.label) == null ? void 0 : oe.textShadowBlur) !== void 0 && (a.textShadowBlur = t.label.textShadowBlur), ((re = t.label) == null ? void 0 : re.textShadowOffsetX) !== void 0 && (a.textShadowOffsetX = t.label.textShadowOffsetX), ((ce = t.label) == null ? void 0 : ce.textShadowOffsetY) !== void 0 && (a.textShadowOffsetY = t.label.textShadowOffsetY), ((ve = t.label) == null ? void 0 : ve.backgroundPadding) !== void 0 && (a.backgroundPadding = t.label.backgroundPadding), ((xe = t.label) == null ? void 0 : xe.backgroundGradient) !== void 0 && (a.backgroundGradient = t.label.backgroundGradient), ((Re = t.label) == null ? void 0 : Re.backgroundGradientType) !== void 0 && (a.backgroundGradientType = t.label.backgroundGradientType), ((Ve = t.label) == null ? void 0 : Ve.backgroundGradientColors) !== void 0 && (a.backgroundGradientColors = t.label.backgroundGradientColors), ((ae = t.label) == null ? void 0 : ae.backgroundGradientDirection) !== void 0 && (a.backgroundGradientDirection = t.label.backgroundGradientDirection), ((ee = t.label) == null ? void 0 : ee.pointer) !== void 0 && (a.pointer = t.label.pointer), ((U = t.label) == null ? void 0 : U.pointerDirection) !== void 0 && (a.pointerDirection = t.label.pointerDirection), ((G = t.label) == null ? void 0 : G.pointerWidth) !== void 0 && (a.pointerWidth = t.label.pointerWidth), ((J = t.label) == null ? void 0 : J.pointerHeight) !== void 0 && (a.pointerHeight = t.label.pointerHeight), ((he = t.label) == null ? void 0 : he.pointerOffset) !== void 0 && (a.pointerOffset = t.label.pointerOffset), ((we = t.label) == null ? void 0 : we.pointerCurve) !== void 0 && (a.pointerCurve = t.label.pointerCurve), ((Ue = t.label) == null ? void 0 : Ue.animation) !== void 0 && (a.animation = t.label.animation), ((wt = t.label) == null ? void 0 : wt.animationSpeed) !== void 0 && (a.animationSpeed = t.label.animationSpeed), ((ke = t.label) == null ? void 0 : ke.badge) !== void 0 && (a.badge = t.label.badge), ((tt = t.label) == null ? void 0 : tt.icon) !== void 0 && (a.icon = t.label.icon), ((Nt = t.label) == null ? void 0 : Nt.iconPosition) !== void 0 && (a.iconPosition = t.label.iconPosition), ((xt = t.label) == null ? void 0 : xt.progress) !== void 0 && (a.progress = t.label.progress), ((Nn = t.label) == null ? void 0 : Nn.smartOverflow) !== void 0 && (a.smartOverflow = t.label.smartOverflow), ((Se = t.label) == null ? void 0 : Se.maxNumber) !== void 0 && (a.maxNumber = t.label.maxNumber), ((Ft = t.label) == null ? void 0 : Ft.overflowSuffix) !== void 0 && (a.overflowSuffix = t.label.overflowSuffix), a.attachPosition = ((Qe = t.label) == null ? void 0 : Qe.location) ?? "center", a.attachOffset = ((yn = t.label) == null ? void 0 : yn.attachOffset) ?? 0, new Ou(e.parentGraph.scene, a);
  }
}
function CA(n) {
  return Math.max(20 * n, 4);
}
function dc(n) {
  return Math.max(n, 0.5);
}
class MA {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  has(e, t) {
    const r = this.map.get(e);
    return r ? r.has(t) : !1;
  }
  set(e, t, r) {
    let o = this.map.get(e);
    if (o || (o = /* @__PURE__ */ new Map(), this.map.set(e, o)), o.has(t))
      throw new Error("Attempting to create duplicate Edge");
    o.set(t, r);
  }
  get(e, t) {
    const r = this.map.get(e);
    if (r)
      return r.get(t);
  }
  get size() {
    let e = 0;
    for (const t of this.map.values())
      e += t.size;
    return e;
  }
}
const EA = Ie({
  path: qe().default("nodes"),
  schema: Zm().or(Ke()).default(null)
}).prefault({}), AA = Ie({
  path: qe().default("edges"),
  schema: Zm().or(Ke()).default(null)
}).prefault({}), IA = ki({
  data: qe(),
  node: EA,
  edge: AA
}), Gh = class Gh extends Nh {
  constructor(e) {
    super();
    const t = IA.parse(e);
    this.opts = t, t.node.schema && (this.nodeSchema = t.node.schema), t.edge.schema && (this.edgeSchema = t.edge.schema), this.url = t.data;
  }
  async *sourceFetchData() {
    const e = await fetch(this.url);
    if (!e.body)
      throw new Error("JSON response had no body");
    const t = await e.json(), r = Kr.search(t, this.opts.node.path);
    if (!Array.isArray(r))
      throw new TypeError(`JsonDataProvider expected 'nodes' to be an array of objects, got ${r}`);
    const o = Kr.search(t, this.opts.edge.path);
    if (!Array.isArray(o))
      throw new TypeError(`JsonDataProvider expected 'edges' to be an array of objects, got ${o}`);
    yield { nodes: r, edges: o };
  }
};
Gh.type = "json";
let Kc = Gh;
Nh.register(Kc);
const nu = {
  zeros: function(n) {
    return typeof n == "number" ? Array(n).fill(0) : n.length === 1 ? Array(n[0]).fill(0) : Array(n[0]).fill(0).map(() => this.zeros(n.slice(1)));
  },
  ones: function(n) {
    return typeof n == "number" ? Array(n).fill(1) : n.length === 1 ? Array(n[0]).fill(1) : Array(n[0]).fill(1).map(() => this.ones(n.slice(1)));
  },
  linspace: function(n, e, t) {
    const r = (e - n) / (t - 1);
    return Array.from({ length: t }, (o, a) => n + a * r);
  },
  array: function(n) {
    return Array.isArray(n) ? [...n] : [n];
  },
  repeat: function(n, e) {
    const t = [];
    for (let r = 0; r < e; r++)
      t.push(...nu.array(n));
    return t;
  },
  mean: function(n, e = null) {
    if (e === null) {
      const t = Array.isArray(n[0]) ? n.flat(1 / 0) : n;
      return t.reduce((o, a) => o + a, 0) / t.length;
    }
    if (e === 0) {
      const t = [], r = n;
      for (let o = 0; o < r[0].length; o++) {
        let a = 0;
        for (let u = 0; u < r.length; u++)
          a += r[u][o];
        t.push(a / r.length);
      }
      return t;
    }
    return n.map((t) => nu.mean(t));
  },
  add: function(n, e) {
    return !Array.isArray(n) && !Array.isArray(e) ? n + e : Array.isArray(n) ? Array.isArray(e) ? n.map((t, r) => t + e[r]) : n.map((t) => t + e) : e.map((t) => n + t);
  },
  subtract: function(n, e) {
    return !Array.isArray(n) && !Array.isArray(e) ? n - e : Array.isArray(n) ? Array.isArray(e) ? n.map((t, r) => t - e[r]) : n.map((t) => t - e) : e.map((t) => n - t);
  },
  max: function(n) {
    return Array.isArray(n) ? Math.max(...n.flat(1 / 0)) : n;
  },
  min: function(n) {
    return Array.isArray(n) ? Math.min(...n.flat(1 / 0)) : n;
  },
  norm: function(n) {
    return Math.sqrt(n.reduce((e, t) => e + t * t, 0));
  }
};
class fs {
  constructor(e) {
    this.seed = e || Math.floor(Math.random() * 1e6), this.m = 2 ** 35 - 31, this.a = 185852, this.c = 1, this._state = this.seed % this.m;
  }
  _next() {
    return this._state = (this.a * this._state + this.c) % this.m, this._state / this.m;
  }
  rand(e = null) {
    if (e === null)
      return this._next();
    if (typeof e == "number") {
      const r = [];
      for (let o = 0; o < e; o++)
        r.push(this._next());
      return r;
    }
    if (e.length === 1) {
      const r = [];
      for (let o = 0; o < e[0]; o++)
        r.push(this._next());
      return r;
    }
    const t = [];
    for (let r = 0; r < e[0]; r++)
      t.push(this.rand(e.slice(1)));
    return t;
  }
}
function On(n) {
  return n.nodes ? n.nodes() : n;
}
function ku(n) {
  return n.edges ? n.edges() : [];
}
function Kn(n, e, t) {
  if (e || (e = Array(t).fill(0)), e.length !== t)
    throw new Error("length of center coordinates must match dimension of layout");
  return { G: n, center: e };
}
function Rh(n, e = null, t = 2, r = null) {
  const o = Kn(n, e, t), a = On(o.G);
  e = o.center;
  const u = new fs(r ?? void 0), h = {};
  return a.forEach((c) => {
    h[c] = u.rand(t).map((f, d) => f + e[d]);
  }), h;
}
function Wm(n, e = 1, t = null, r = 2) {
  if (r < 2)
    throw new Error("cannot handle dimensions < 2");
  const o = Kn(n, t, r), a = On(o.G);
  t = o.center;
  const u = {};
  if (a.length === 0)
    return u;
  if (a.length === 1)
    return u[a[0]] = t, u;
  const h = nu.linspace(0, 2 * Math.PI, a.length + 1).slice(0, -1);
  return a.forEach((c, f) => {
    const d = Math.cos(h[f]) * e + t[0], g = Math.sin(h[f]) * e + t[1];
    u[c] = Array(r).fill(0).map((v, b) => b === 0 ? d : b === 1 ? g : 0);
  }), u;
}
function PA(n, e = null, t = 1, r = null, o = 2) {
  if (o !== 2)
    throw new Error("can only handle 2 dimensions");
  const a = Kn(n, r, o), u = On(a.G);
  r = a.center;
  const h = {};
  if (u.length === 0)
    return h;
  if (u.length === 1)
    return h[u[0]] = r, h;
  e || (e = [u]);
  const c = t / e.length;
  let f;
  e[0].length === 1 ? (f = 0, h[e[0][0]] = [...r], f += c) : f = c;
  for (let d = 0; d < e.length; d++) {
    const g = e[d];
    if (g.length === 0 || g.length === 1 && d === 0)
      continue;
    const v = nu.linspace(0, 2 * Math.PI, g.length + 1).slice(0, -1);
    g.forEach((b, _) => {
      const O = Math.cos(v[_]) * f + r[0], E = Math.sin(v[_]) * f + r[1];
      h[b] = [O, E];
    }), f += c;
  }
  return h;
}
function OA(n, e = null, t = null, r = null, o = 50, a = 1, u = null, h = 2, c = null) {
  return kA(n, e, t, r, o, a, u, h, c);
}
function kA(n, e = null, t = null, r = null, o = 50, a = 1, u = null, h = 2, c = null) {
  const f = Kn(n, u, h);
  let d = f.G;
  u = f.center;
  const g = On(d), v = ku(d);
  if (g.length === 0)
    return {};
  if (g.length === 1) {
    const S = {};
    return S[g[0]] = u, S;
  }
  let b = {};
  if (t)
    for (const S of g)
      if (t[S])
        b[S] = [...t[S]];
      else {
        const k = new fs(c ?? void 0);
        b[S] = k.rand(h);
      }
  else {
    const S = new fs(c ?? void 0);
    for (const k of g)
      b[k] = S.rand(h);
  }
  const _ = new Set(r || []);
  e || (e = 1 / Math.sqrt(g.length));
  let O = 0.1;
  const E = O / (o + 1);
  for (let S = 0; S < o; S++) {
    const k = {};
    for (const C of g)
      k[C] = Array(h).fill(0);
    for (let C = 0; C < g.length; C++) {
      const A = g[C];
      for (let N = C + 1; N < g.length; N++) {
        const L = g[N], F = b[A].map((be, ge) => be - b[L][ge]), H = Math.sqrt(F.reduce((be, ge) => be + ge * ge, 0)) || 0.1, se = e * e / H;
        for (let be = 0; be < h; be++) {
          const ge = F[be] / H;
          k[A][be] += ge * se, k[L][be] -= ge * se;
        }
      }
    }
    for (const [C, A] of v) {
      const N = b[C].map((H, se) => H - b[A][se]), L = Math.sqrt(N.reduce((H, se) => H + se * se, 0)) || 0.1, F = L * L / e;
      for (let H = 0; H < h; H++) {
        const se = N[H] / L;
        k[C][H] -= se * F, k[A][H] += se * F;
      }
    }
    for (const C of g) {
      if (_.has(C)) continue;
      const A = Math.sqrt(k[C].reduce((L, F) => L + F * F, 0)), N = Math.min(A, O);
      for (let L = 0; L < h; L++) {
        const F = A === 0 ? 0 : k[C][L] / A;
        b[C][L] += F * N;
      }
    }
    O -= E;
  }
  return r || (b = ii(b, a, u)), b;
}
function $A(n, e = 1, t = null, r = 2) {
  const o = Kn(n, t, r), a = o.G;
  t = o.center;
  const u = On(a);
  if (u.length <= 2)
    return u.length === 0 ? {} : u.length === 1 ? { [u[0]]: t } : {
      [u[0]]: t.map((E) => E - e),
      [u[1]]: t.map((E) => E + e)
    };
  const h = u.length, c = {};
  u.forEach((E, S) => {
    c[E] = S;
  });
  const f = Array(h).fill(0).map(() => Array(h).fill(0)), d = ku(a);
  for (const [E, S] of d) {
    const k = c[E], C = c[S];
    f[k][C] = 1, f[C][k] = 1;
  }
  const g = Array(h).fill(0).map(() => Array(h).fill(0));
  for (let E = 0; E < h; E++) {
    g[E][E] = f[E].reduce((S, k) => S + k, 0);
    for (let S = 0; S < h; S++)
      g[E][S] -= f[E][S];
  }
  const v = [];
  for (let E = 0; E < r; E++) {
    let S = Array(h).fill(0).map(() => Math.random() - 0.5);
    for (const C of v) {
      const A = S.reduce((N, L, F) => N + L * C[F], 0);
      S = S.map((N, L) => N - A * C[L]);
    }
    const k = Math.sqrt(S.reduce((C, A) => C + A * A, 0));
    S = S.map((C) => C / k);
    for (let C = 0; C < 100; C++) {
      const A = Array(h).fill(0);
      for (let F = 0; F < h; F++)
        for (let H = 0; H < h; H++)
          A[F] += g[F][H] * S[H];
      const N = A.reduce((F, H) => F + H, 0) / h;
      A.forEach((F, H, se) => {
        se[H] = F - N;
      });
      const L = Math.sqrt(A.reduce((F, H) => F + H * H, 0));
      L < 1e-10 || (S = A.map((F) => F / L));
    }
    v.push(S);
  }
  const b = Array(h).fill(0).map(() => Array(r).fill(0));
  for (let E = 0; E < h; E++)
    for (let S = 0; S < r; S++)
      b[E][S] = v[S][E];
  const _ = ii(b, e), O = {};
  return u.forEach((E, S) => {
    O[E] = _[S].map((k, C) => k + t[C]);
  }), O;
}
function NA(n, e = 1, t = null, r = 2, o = 0.35, a = !1) {
  if (r !== 2)
    throw new Error("can only handle 2 dimensions");
  const u = Kn(n, t || [0, 0], r), h = On(u.G);
  t = u.center;
  const c = {};
  if (h.length === 0)
    return c;
  if (h.length === 1)
    return c[h[0]] = [...t], c;
  let f = [];
  if (a) {
    let _ = o;
    _ += 1 / (0.5 * _);
    for (let O = 0; O < h.length; O++) {
      const E = 0.5 * _;
      _ += 1 / E, f.push([Math.cos(_) * E, Math.sin(_) * E]);
    }
  } else {
    const v = Array.from({ length: h.length }, (_, O) => parseFloat(String(O))), b = v.map((_) => o * _);
    f = v.map((_, O) => [
      Math.cos(b[O]) * _,
      Math.sin(b[O]) * _
    ]);
  }
  const d = [];
  for (let v = 0; v < f.length; v++)
    d.push(f[v]);
  const g = ii(d, e);
  for (let v = 0; v < g.length; v++)
    g[v][0] += t[0], g[v][1] += t[1];
  for (let v = 0; v < h.length; v++)
    c[h[v]] = g[v];
  return c;
}
function ii(n, e = 1, t = [0, 0]) {
  if (Array.isArray(n)) {
    if (n.length === 0) return [];
  } else if (Object.keys(n).length === 0) return {};
  const r = Array.isArray(n) ? n : Object.values(n), o = r[0].length, a = Array(o).fill(0);
  for (const d of r)
    for (let g = 0; g < o; g++)
      a[g] += d[g] / r.length;
  let u = {};
  if (Array.isArray(n))
    u = n.map((d) => d.map((g, v) => g - a[v]));
  else
    for (const [d, g] of Object.entries(n))
      u[d] = g.map((v, b) => v - a[b]);
  let h = 0;
  const c = Array.isArray(u) ? u : Object.values(u);
  for (const d of c) {
    const g = Math.sqrt(d.reduce((v, b) => v + b * b, 0));
    h = Math.max(h, g);
  }
  let f = Array.isArray(n) ? [] : {};
  if (h > 0) {
    const d = e / h;
    if (Array.isArray(n))
      f = u.map(
        (g) => g.map((v, b) => v * d + t[b])
      );
    else
      for (const [g, v] of Object.entries(u))
        f[g] = v.map((b, _) => b * d + t[_]);
  } else if (Array.isArray(n))
    f = Array(n.length).fill(0).map(() => [...t]);
  else
    for (const d of Object.keys(n))
      f[d] = [...t];
  return f;
}
function RA(n, e = null, t = "vertical", r = 1, o = null, a = 4 / 3) {
  if (t !== "vertical" && t !== "horizontal")
    throw new Error("align must be either vertical or horizontal");
  const u = Kn(n, o || [0, 0], 2), h = u.G;
  o = u.center;
  const c = On(h);
  if (c.length === 0)
    return {};
  e || (e = c.filter((k, C) => C % 2 === 0));
  const f = new Set(e), d = new Set(c.filter((k) => !f.has(k))), g = 1, v = a * g, b = [v / 2, g / 2], _ = {}, O = [...f];
  O.forEach((k, C) => {
    const N = C * g / (O.length || 1);
    _[k] = [0, N];
  });
  const E = [...d];
  E.forEach((k, C) => {
    const A = v, N = C * g / (E.length || 1);
    _[k] = [A, N];
  });
  for (const k in _)
    _[k][0] -= b[0], _[k][1] -= b[1];
  const S = ii(_, r, o);
  if (t === "horizontal")
    for (const k in S) {
      const C = S[k][0];
      S[k][0] = S[k][1], S[k][1] = C;
    }
  return S;
}
function Gm(n, e = "subset", t = "vertical", r = 1, o = null) {
  if (t !== "vertical" && t !== "horizontal")
    throw new Error("align must be either vertical or horizontal");
  const a = Kn(n, o || [0, 0], 2), u = a.G;
  o = a.center;
  const h = On(u);
  if (h.length === 0)
    return {};
  let c = {};
  if (typeof e == "string")
    console.warn("Using string subsetKey requires node attributes, using default partitioning"), c = { 0: h };
  else
    for (const [g, v] of Object.entries(e))
      Array.isArray(v) ? c[g] = v : c[g] = [v];
  const f = Object.keys(c).length;
  let d = {};
  if (Object.entries(c).forEach(([g, v], b) => {
    const _ = Array.isArray(v) ? v : [v], O = _.length;
    _.forEach((E, S) => {
      const k = b - (f - 1) / 2, C = S - (O - 1) / 2;
      d[E] = [k, C];
    });
  }), d = ii(d, r, o), t === "horizontal")
    for (const g in d) {
      const v = d[g][0];
      d[g][0] = d[g][1], d[g][1] = v;
    }
  return d;
}
function zA(n, e, t = "vertical", r = 1, o = null) {
  const a = Kn(n, o || [0, 0], 2), u = a.G;
  o = a.center;
  const h = On(u);
  if (h.length === 0)
    return {};
  const c = {}, f = /* @__PURE__ */ new Set();
  let d = 0;
  for (c[d] = [e], f.add(e); Object.values(c).flat().length < h.length; ) {
    const v = [], b = c[d];
    for (const _ of b) {
      const O = g(u, _);
      for (const E of O)
        f.has(E) || (v.push(E), f.add(E));
    }
    if (v.length === 0) {
      if (h.filter((O) => !f.has(O)).length > 0)
        throw new Error("bfs_layout didn't include all nodes. Graph may be disconnected.");
      break;
    }
    d++, c[d] = v;
  }
  return Gm(u, c, t, r, o);
  function g(v, b) {
    return v.edges ? v.edges().filter((_) => _[0] === b || _[1] === b).map((_) => _[0] === b ? _[1] : _[0]) : [];
  }
}
function DA(n, e = 1, t = null, r = 2) {
  if (r !== 2)
    throw new Error("can only handle 2 dimensions");
  const o = Kn(n, t || [0, 0], r), a = o.G;
  t = o.center;
  const u = On(a), h = ku(a);
  if (u.length === 0)
    return {};
  const { isPlanar: c, embedding: f } = LA(a, u, h);
  if (!c)
    throw new Error("G is not planar.");
  if (!f)
    throw new Error("Failed to generate planar embedding.");
  let d = HA(f, u);
  return d = ii(d, e, t), d;
}
function LA(n, e, t) {
  return e.length <= 4 ? { isPlanar: !0, embedding: Jc(e, t) } : BA(e, t) || FA(e, t) ? { isPlanar: !1, embedding: null } : ZA(e, t);
}
function BA(n, e) {
  if (n.length !== 5 || e.length !== 10) return !1;
  for (let t = 0; t < n.length; t++)
    for (let r = t + 1; r < n.length; r++)
      if (!e.some(
        (a) => a[0] === n[t] && a[1] === n[r] || a[0] === n[r] && a[1] === n[t]
      )) return !1;
  return !0;
}
function FA(n, e) {
  if (n.length !== 6 || e.length !== 9) return !1;
  const t = UA(n, e);
  if (!t) return !1;
  const [r, o] = t;
  if (r.length !== 3 || o.length !== 3) return !1;
  for (const a of r)
    for (const u of o)
      if (!e.some(
        (c) => c[0] === a && c[1] === u || c[0] === u && c[1] === a
      )) return !1;
  return !0;
}
function UA(n, e) {
  const t = {}, r = {};
  for (const h of n)
    r[h] = [];
  for (const [h, c] of e)
    r[h].push(c), r[c].push(h);
  const o = [n[0]];
  for (t[n[0]] = 0; o.length > 0; ) {
    const h = o.shift(), c = t[h];
    for (const f of r[h])
      if (t[f] === void 0)
        t[f] = 1 - c, o.push(f);
      else if (t[f] === c)
        return null;
  }
  const a = [], u = [];
  for (const h of n)
    t[h] === 0 ? a.push(h) : u.push(h);
  return [a, u];
}
function ZA(n, e) {
  const t = {};
  for (const h of n)
    t[h] = [];
  for (const [h, c] of e)
    t[h].push(c), t[c].push(h);
  const r = /* @__PURE__ */ new Set(), o = [];
  function a(h) {
    r.add(h), o.push(h);
    for (const c of t[h])
      r.has(c) || a(c);
  }
  return a(n[0]), o.length < n.length ? { isPlanar: !0, embedding: Jc(n, e) } : e.length > 3 * n.length - 6 ? { isPlanar: !1, embedding: null } : { isPlanar: !0, embedding: Jc(n, e) };
}
function Jc(n, e) {
  const t = {
    nodeOrder: [...n],
    faceList: [],
    nodePositions: {}
  }, r = {};
  for (const h of n)
    r[h] = /* @__PURE__ */ new Set();
  for (const [h, c] of e)
    r[h].add(c), r[c].add(h);
  const o = qA(n, e, r) || n;
  t.faceList.push(o);
  const a = o.length;
  for (let h = 0; h < a; h++) {
    const c = 2 * Math.PI * h / a;
    t.nodePositions[o[h]] = [Math.cos(c), Math.sin(c)];
  }
  const u = n.filter((h) => !t.nodePositions[h]);
  for (const h of u) {
    const c = Array.from(r[h]);
    if (c.length === 0)
      t.nodePositions[h] = [0, 0];
    else {
      let f = 0, d = 0, g = 0;
      for (const v of c)
        t.nodePositions[v] && (f += t.nodePositions[v][0], d += t.nodePositions[v][1], g++);
      if (g > 0) {
        const v = 0.1 * Math.random();
        t.nodePositions[h] = [
          f / g + v * (Math.random() - 0.5),
          d / g + v * (Math.random() - 0.5)
        ];
      } else {
        const v = 0.5 * Math.random(), b = 2 * Math.PI * Math.random();
        t.nodePositions[h] = [v * Math.cos(b), v * Math.sin(b)];
      }
    }
  }
  return t;
}
function qA(n, e, t) {
  if (n.length === 0) return null;
  if (n.length <= 2) return n;
  if (n.length <= 8) {
    let c = function(g) {
      if (d.push(g), f.add(g), d.length === n.length)
        return t[g].has(d[0]) ? !0 : (f.delete(g), d.pop(), !1);
      for (const v of t[g])
        if (!f.has(v) && c(v))
          return !0;
      return f.delete(g), d.pop(), !1;
    };
    const f = /* @__PURE__ */ new Set(), d = [];
    if (c(n[0]))
      return d;
  }
  const r = /* @__PURE__ */ new Set(), o = {};
  let a = null;
  function u(c, f) {
    r.add(c);
    for (const d of t[c])
      if (d !== f) {
        if (r.has(d))
          return a = h(c, d, o), !0;
        if (o[d] = c, u(d, c))
          return !0;
      }
    return !1;
  }
  function h(c, f, d) {
    const g = [f, c];
    let v = c;
    for (; d[v] !== void 0 && d[v] !== f; )
      v = d[v], g.push(v);
    return g;
  }
  for (const c of n)
    if (!r.has(c) && (o[c] = null, u(c, null)))
      break;
  return a || n;
}
function HA(n, e) {
  const t = {};
  for (const r of e)
    n.nodePositions[r] ? t[r] = n.nodePositions[r] : t[r] = [0, 0];
  return t;
}
function WA(n, e = null, t = null, r = "weight", o = 1, a = null, u = 2) {
  const h = Kn(n, a, u), c = h.G;
  a = h.center;
  const f = On(c);
  if (f.length === 0)
    return {};
  if (f.length === 1)
    return { [f[0]]: a };
  e || (e = GA(c, r));
  const d = Array.from(f), g = d.length, v = Array(g).fill(0).map(() => Array(g).fill(1e6));
  for (let E = 0; E < g; E++) {
    const S = d[E];
    if (v[E][E] = 0, !!e[S])
      for (let k = 0; k < g; k++) {
        const C = d[k];
        e[S][C] !== void 0 && (v[E][k] = e[S][C]);
      }
  }
  if (!t)
    if (u >= 3)
      t = Rh(n, null, u);
    else if (u === 2)
      t = Wm(n, 1, [0, 0], u);
    else {
      const E = {};
      d.forEach((S, k) => {
        E[S] = [k / (g - 1 || 1)];
      }), t = E;
    }
  const b = new Array(g);
  for (let E = 0; E < g; E++) {
    const S = d[E];
    for (b[E] = t[S] ? [...t[S]] : Array(u).fill(0); b[E].length < u; )
      b[E].push(0);
  }
  const _ = jA(v, b, u), O = {};
  for (let E = 0; E < g; E++)
    O[d[E]] = _[E];
  return ii(O, o, a);
}
function GA(n, e) {
  const t = {}, r = n.nodes ? n.nodes() : n, o = n.edges ? n.edges() : [];
  for (const a of r) {
    t[a] = {}, t[a][a] = 0;
    for (const u of r)
      a !== u && (t[a][u] = 1 / 0);
  }
  for (const [a, u] of o) {
    let h = 1;
    n.getEdgeData && (h = n.getEdgeData(a, u, e) || 1), t[a][u] = h, t[u][a] = h;
  }
  for (const a of r)
    for (const u of r)
      for (const h of r)
        t[u][a] + t[a][h] < t[u][h] && (t[u][h] = t[u][a] + t[a][h]);
  return t;
}
function jA(n, e, t) {
  const r = e.length, o = 1e-3, a = n.map(
    (_) => _.map((O) => O === 0 ? 0 : 1 / (O + 1e-3))
  );
  let u = e.flat();
  const h = 500, c = 1e-5, f = 10;
  let d = 1;
  const g = [], v = [];
  for (let _ = 0; _ < h; _++) {
    const [O, E] = pc(u, a, o, t), S = VA(E, g, v);
    d = KA(
      u,
      S,
      O,
      E,
      (N) => pc(N, a, o, t)[0],
      d
    );
    const k = [...u];
    for (let N = 0; N < u.length; N++)
      u[N] += d * S[N];
    const [, C] = pc(u, a, o, t);
    if (g.push(u.map((N, L) => N - k[L])), v.push(C.map((N, L) => N - E[L])), g.length > f && (g.shift(), v.shift()), Math.sqrt(C.reduce((N, L) => N + L * L, 0)) < c)
      break;
  }
  const b = [];
  for (let _ = 0; _ < r; _++)
    b.push(u.slice(_ * t, (_ + 1) * t));
  return b;
}
function pc(n, e, t, r) {
  const o = e.length, a = [];
  for (let f = 0; f < o; f++)
    a.push(n.slice(f * r, (f + 1) * r));
  let u = 0;
  const h = Array(r).fill(0);
  for (let f = 0; f < o; f++)
    for (let d = 0; d < r; d++)
      h[d] += a[f][d];
  u += 0.5 * t * h.reduce((f, d) => f + d * d, 0);
  for (let f = 0; f < o; f++)
    for (let d = f + 1; d < o; d++) {
      const g = a[f].map((O, E) => O - a[d][E]), v = Math.sqrt(g.reduce((O, E) => O + E * E, 0)), b = e[f][d], _ = v * b - 1;
      u += 0.5 * _ * _;
    }
  const c = new Array(n.length).fill(0);
  for (let f = 0; f < o; f++)
    for (let d = 0; d < r; d++)
      c[f * r + d] += t * h[d];
  for (let f = 0; f < o; f++)
    for (let d = f + 1; d < o; d++) {
      const g = a[f].map((E, S) => E - a[d][S]), v = Math.sqrt(g.reduce((E, S) => E + S * S, 0)) || 1e-10, b = g.map((E) => E / v), _ = e[f][d], O = v * _ - 1;
      for (let E = 0; E < r; E++) {
        const S = _ * O * b[E];
        c[f * r + E] += S, c[d * r + E] -= S;
      }
    }
  return [u, c];
}
function VA(n, e, t, r) {
  if (e.length === 0)
    return n.map((f) => -f);
  const o = n.slice(), a = Array(e.length).fill(0), u = [];
  for (let f = 0; f < e.length; f++) {
    const d = e[f], g = t[f];
    u.push(1 / g.reduce((v, b, _) => v + b * d[_], 0));
  }
  for (let f = e.length - 1; f >= 0; f--) {
    const d = e[f];
    a[f] = u[f] * d.reduce((g, v, b) => g + v * o[b], 0);
    for (let g = 0; g < o.length; g++)
      o[g] -= a[f] * t[f][g];
  }
  let h = 1;
  if (e.length > 0 && t.length > 0) {
    const f = t[t.length - 1];
    h = e[e.length - 1].reduce((g, v, b) => g + v * f[b], 0) / f.reduce((g, v) => g + v * v, 0);
  }
  const c = o.map((f) => -h * f);
  for (let f = 0; f < e.length; f++) {
    const d = e[f], g = t[f], v = u[f] * g.reduce((b, _, O) => b + _ * c[O], 0);
    for (let b = 0; b < c.length; b++)
      c[b] += d[b] * (a[f] - v);
  }
  return c;
}
function KA(n, e, t, r, o, a) {
  const c = r.reduce((g, v, b) => g + v * e[b], 0);
  if (c >= 0)
    return 1e-8;
  let f = a;
  const d = 20;
  for (let g = 0; g < d; g++) {
    const v = n.map((_, O) => _ + f * e[O]);
    if (o(v) <= t + 1e-4 * f * c)
      return f;
    f *= 0.9;
  }
  return f;
}
function JA(n, e = null, t = 100, r = 1, o = 2, a = 1, u = !1, h = !1, c = null, f = null, d = null, g = !1, v = !1, b = null, _ = 2) {
  const E = Kn(n, null, _).G, S = On(E);
  if (S.length === 0)
    return {};
  const k = new fs(b ?? void 0);
  let C;
  if (e === null) {
    e = {}, C = new Array(S.length);
    for (let re = 0; re < S.length; re++)
      C[re] = Array(_).fill(0).map(() => k.rand() * 2 - 1), e[S[re]] = C[re];
  } else if (Object.keys(e).length === S.length) {
    C = new Array(S.length);
    for (let re = 0; re < S.length; re++)
      C[re] = [...e[S[re]]];
  } else {
    let re = Array(_).fill(Number.POSITIVE_INFINITY), ce = Array(_).fill(Number.NEGATIVE_INFINITY);
    for (const ve in e)
      for (let xe = 0; xe < _; xe++)
        re[xe] = Math.min(re[xe], e[ve][xe]), ce[xe] = Math.max(ce[xe], e[ve][xe]);
    C = new Array(S.length);
    for (let ve = 0; ve < S.length; ve++) {
      const xe = S[ve];
      e[xe] ? C[ve] = [...e[xe]] : (C[ve] = Array(_).fill(0).map(
        (Re, Ve) => re[Ve] + k.rand() * (ce[Ve] - re[Ve])
      ), e[xe] = C[ve]);
    }
  }
  const A = new Array(S.length).fill(0), N = new Array(S.length).fill(0), L = f !== null;
  for (let re = 0; re < S.length; re++) {
    const ce = S[re];
    A[re] = c && c[ce] ? c[ce] : E.edges ? oe(E, ce) + 1 : 1, N[re] = f && f[ce] ? f[ce] : 1;
  }
  const F = S.length, H = Array(F).fill(0).map(() => Array(F).fill(0)), se = E.edges ? E.edges() : [], be = {};
  S.forEach((re, ce) => {
    be[re] = ce;
  });
  for (const [re, ce] of se) {
    const ve = be[re], xe = be[ce];
    let Re = 1;
    d && E.getEdgeData && (Re = E.getEdgeData(re, ce, d) || 1), H[ve][xe] = Re, H[xe][ve] = Re;
  }
  const ge = Array(F).fill(0).map(() => Array(_).fill(0)), pe = Array(F).fill(0).map(() => Array(_).fill(0)), Je = Array(F).fill(0).map(() => Array(_).fill(0));
  let Le = 1, rt = 1;
  function We(re, ce, ve, xe, Re, Ve) {
    const ae = 0.05 * Math.sqrt(re), ee = Math.sqrt(ae), U = 10, G = 0.05, J = Math.min(U, ae * ve / (re * re));
    let he = Ve * Math.max(ee, J);
    ce / ve > 2 && (Re > G && (Re *= 0.5), he = Math.max(he, Ve));
    let we = ce === 0 ? Number.POSITIVE_INFINITY : he * Re * ve / ce;
    return ce > he * ve ? Re > G && (Re *= 0.7) : xe < 1e3 && (Re *= 1.3), xe = xe + Math.min(we - xe, 0.5 * xe), [xe, Re];
  }
  for (let re = 0; re < t; re++) {
    for (let U = 0; U < F; U++)
      for (let G = 0; G < _; G++)
        pe[U][G] = 0, Je[U][G] = 0, ge[U][G] = 0;
    const ce = Array(F).fill(0).map(
      () => Array(F).fill(0).map(() => Array(_).fill(0))
    ), ve = Array(F).fill(0).map(() => Array(F).fill(0));
    for (let U = 0; U < F; U++)
      for (let G = 0; G < F; G++)
        if (U !== G) {
          for (let J = 0; J < _; J++)
            ce[U][G][J] = C[U][J] - C[G][J];
          ve[U][G] = Math.sqrt(ce[U][G].reduce((J, he) => J + he * he, 0)), ve[U][G] < 0.01 && (ve[U][G] = 0.01);
        }
    if (v)
      for (let U = 0; U < F; U++)
        for (let G = 0; G < F; G++) {
          if (U === G || H[U][G] === 0) continue;
          const J = ve[U][G], he = -Math.log(1 + J) / J * H[U][G];
          for (let we = 0; we < _; we++) {
            const Ue = he * ce[U][G][we];
            pe[U][we] += Ue;
          }
        }
    else
      for (let U = 0; U < F; U++)
        for (let G = 0; G < F; G++)
          if (!(U === G || H[U][G] === 0))
            for (let J = 0; J < _; J++) {
              const he = -ce[U][G][J] * H[U][G];
              pe[U][J] += he;
            }
    if (u)
      for (let U = 0; U < F; U++)
        for (let G = 0; G < _; G++)
          pe[U][G] /= A[U];
    for (let U = 0; U < F; U++)
      for (let G = 0; G < F; G++) {
        if (U === G) continue;
        let J = ve[U][G];
        L && (J -= N[U] - N[G], J = Math.max(J, 0.01));
        const he = J * J, Ue = A[U] * A[G] / he * o;
        for (let wt = 0; wt < _; wt++) {
          const ke = ce[U][G][wt] / J;
          Je[U][wt] += ke * Ue;
        }
      }
    const xe = Array(_).fill(0);
    for (let U = 0; U < F; U++)
      for (let G = 0; G < _; G++)
        xe[G] += C[U][G] / F;
    for (let U = 0; U < F; U++) {
      const G = Array(_);
      for (let J = 0; J < _; J++)
        G[J] = C[U][J] - xe[J];
      if (h)
        for (let J = 0; J < _; J++)
          ge[U][J] = -a * A[U] * G[J];
      else {
        const J = Math.sqrt(G.reduce((he, we) => he + we * we, 0));
        if (J > 0.01)
          for (let he = 0; he < _; he++) {
            const we = G[he] / J;
            ge[U][he] = -a * A[U] * we;
          }
      }
    }
    const Re = Array(F).fill(0).map(() => Array(_).fill(0));
    let Ve = 0, ae = 0;
    for (let U = 0; U < F; U++) {
      for (let ke = 0; ke < _; ke++)
        Re[U][ke] = pe[U][ke] + Je[U][ke] + ge[U][ke];
      const G = [...C[U]], J = G.map((ke, tt) => ke + Re[U][tt]), he = G.map((ke, tt) => ke - J[tt]), we = G.map((ke, tt) => ke + J[tt]), Ue = Math.sqrt(he.reduce((ke, tt) => ke + tt * tt, 0)), wt = Math.sqrt(we.reduce((ke, tt) => ke + tt * tt, 0));
      Ve += A[U] * Ue, ae += 0.5 * A[U] * wt;
    }
    [Le, rt] = We(
      F,
      Ve,
      ae,
      Le,
      rt,
      r
    );
    let ee = 0;
    for (let U = 0; U < F; U++) {
      let G;
      if (L) {
        const J = Math.sqrt(Re[U].reduce((we, Ue) => we + Ue * Ue, 0)), he = A[U] * J;
        G = 0.1 * Le / (1 + Math.sqrt(Le * he)), G = Math.min(G * J, 10) / J;
      } else {
        const J = A[U] * Math.sqrt(Re[U].reduce((he, we) => he + we * we, 0));
        G = Le / (1 + Math.sqrt(Le * J));
      }
      for (let J = 0; J < _; J++) {
        const he = Re[U][J] * G;
        C[U][J] += he, ee += Math.abs(he);
      }
    }
    if (ee < 1e-10)
      break;
  }
  const te = {};
  for (let re = 0; re < F; re++)
    te[S[re]] = C[re];
  return ii(te);
  function oe(re, ce) {
    return re.edges ? re.edges().filter(
      (ve) => ve[0] === ce || ve[1] === ce
    ).length : 0;
  }
}
function YA(n, e = null, t = 1, r = 1.1, o = 1e3, a = null) {
  if (r <= 1)
    throw new Error("The parameter a should be larger than 1");
  const u = On(n), h = ku(n);
  if (u.length === 0)
    return {};
  if (!e)
    e = Rh(n, null, 2, a);
  else {
    const k = new fs(a ?? void 0), C = {};
    u.forEach((A) => {
      e[A] || (C[A] = [k.rand(), k.rand()]);
    }), e = { ...e, ...C };
  }
  const c = {};
  u.forEach((k, C) => {
    c[k] = C;
  });
  const f = u.map((k) => [...e[k]]), d = u.length, g = Array(d).fill(0).map(() => Array(d).fill(1));
  for (let k = 0; k < d; k++)
    g[k][k] = 0;
  for (const [k, C] of h) {
    if (k === C) continue;
    const A = c[k], N = c[C];
    g[A][N] = r, g[N][A] = r;
  }
  const v = t * Math.sqrt(d), b = 1e-3, _ = 1e-6;
  let O = _ + 1, E = 0;
  for (; O > _ && E < o; ) {
    const k = Array(d).fill(0).map(() => [0, 0]);
    for (let C = 0; C < d; C++)
      for (let A = 0; A < d; A++) {
        if (C === A) continue;
        const N = f[C].map((F, H) => F - f[A][H]), L = Math.sqrt(N.reduce((F, H) => F + H * H, 0)) || 0.01;
        for (let F = 0; F < N.length; F++)
          k[C][F] += g[C][A] * N[F] - v / L * N[F];
      }
    for (let C = 0; C < d; C++)
      for (let A = 0; A < f[C].length; A++)
        f[C][A] += k[C][A] * b;
    O = k.reduce((C, A) => C + Math.sqrt(A.reduce((N, L) => N + L * L, 0)), 0), E++;
  }
  const S = {};
  return u.forEach((k, C) => {
    S[k] = f[C];
  }), S;
}
const gc = /* @__PURE__ */ new Map();
class _t {
  addNodes(e) {
    for (const t of e)
      this.addNode(t);
  }
  addEdges(e) {
    for (const t of e)
      this.addEdge(t);
  }
  get type() {
    return this.constructor.type;
  }
  static register(e) {
    const t = e.type;
    return gc.set(t, e), e;
  }
  static get(e, t = {}) {
    const r = gc.get(e);
    return r ? new r(t) : null;
  }
  static getOptionsForDimension(e) {
    return e > this.maxDimensions ? null : {};
  }
  static getOptionsForDimensionByType(e, t) {
    const r = gc.get(e);
    return r ? r.getOptionsForDimension(t) : null;
  }
}
const vn = aE({
  scalingFactor: V().default(100)
});
class kn extends _t {
  constructor(e = {}) {
    super(), this._nodes = [], this._edges = [], this.stale = !0, this.positions = {}, this.scalingFactor = 100, this.isSettled = !0;
    const t = vn.parse(e);
    this.scalingFactor = t.scalingFactor;
  }
  static getOptionsForDimension(e) {
    return e > this.maxDimensions ? null : { dim: e };
  }
  // basic functionality
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init() {
  }
  addNode(e) {
    this._nodes.push(e), this.stale = !0;
  }
  addEdge(e) {
    this._edges.push(e), this.stale = !0;
  }
  getNodePosition(e) {
    return this.stale && this.doLayout(), mc(this.positions[e.id], this.scalingFactor);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setNodePosition() {
  }
  getEdgePosition(e) {
    return this.stale && this.doLayout(), {
      src: mc(this.positions[e.srcId], this.scalingFactor),
      dst: mc(this.positions[e.dstId], this.scalingFactor)
    };
  }
  // for animated layouts
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  step() {
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pin() {
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unpin() {
  }
  // properties
  get nodes() {
    return this._nodes;
  }
  get edges() {
    return this._edges;
  }
}
function mc(n, e) {
  const t = n[0] * e, r = n[1] * e, o = (n[2] ?? 0) * e;
  return { x: t, y: r, z: o };
}
const QA = Ie({
  ...vn.shape,
  pos: Er(
    V(),
    nt(V())
  ).or(Ke()).default(null),
  scaling: V().positive().default(1),
  a: V().positive().default(1.1),
  maxIter: V().positive().default(1e3),
  seed: V().positive().or(Ke()).default(null)
}), uu = class uu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = QA.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = YA(
      { nodes: e, edges: t },
      this.config.pos,
      this.config.scaling,
      this.config.a,
      this.config.maxIter,
      this.config.seed
    );
  }
};
uu.type = "arf", uu.maxDimensions = 2;
let Yc = uu;
const XA = Ie({
  ...vn.shape,
  start: V().or(qe()),
  align: Bt(["vertical", "horizontal"]).default("vertical"),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null)
}), lu = class lu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 20, this.config = XA.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = zA(
      { nodes: e, edges: t },
      this.config.start,
      this.config.align,
      this.config.scale,
      this.config.center
    );
  }
};
lu.type = "bfs", lu.maxDimensions = 2;
let Qc = lu;
const e3 = Ie({
  ...vn.shape,
  nodes: nt(V().or(qe())),
  align: Bt(["vertical", "horizontal"]).default("vertical"),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  aspectRatio: V().positive().default(4 / 3)
}), cu = class cu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 40, this.config = e3.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = RA(
      { nodes: e, edges: t },
      this.config.nodes,
      this.config.align,
      this.config.scale,
      this.config.center,
      this.config.aspectRatio
    );
  }
};
cu.type = "bipartite", cu.maxDimensions = 2;
let Xc = cu;
const t3 = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2)
}), hu = class hu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 80, this.config = t3.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = Wm(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
hu.type = "circular", hu.maxDimensions = 2;
let eh = hu;
function n3(n, e, t) {
  var r, o = 1;
  n == null && (n = 0), e == null && (e = 0), t == null && (t = 0);
  function a() {
    var u, h = r.length, c, f = 0, d = 0, g = 0;
    for (u = 0; u < h; ++u)
      c = r[u], f += c.x || 0, d += c.y || 0, g += c.z || 0;
    for (f = (f / h - n) * o, d = (d / h - e) * o, g = (g / h - t) * o, u = 0; u < h; ++u)
      c = r[u], f && (c.x -= f), d && (c.y -= d), g && (c.z -= g);
  }
  return a.initialize = function(u) {
    r = u;
  }, a.x = function(u) {
    return arguments.length ? (n = +u, a) : n;
  }, a.y = function(u) {
    return arguments.length ? (e = +u, a) : e;
  }, a.z = function(u) {
    return arguments.length ? (t = +u, a) : t;
  }, a.strength = function(u) {
    return arguments.length ? (o = +u, a) : o;
  }, a;
}
function r3(n) {
  const e = +this._x.call(null, n);
  return jm(this.cover(e), e, n);
}
function jm(n, e, t) {
  if (isNaN(e)) return n;
  var r, o = n._root, a = { data: t }, u = n._x0, h = n._x1, c, f, d, g, v;
  if (!o) return n._root = a, n;
  for (; o.length; )
    if ((d = e >= (c = (u + h) / 2)) ? u = c : h = c, r = o, !(o = o[g = +d])) return r[g] = a, n;
  if (f = +n._x.call(null, o.data), e === f) return a.next = o, r ? r[g] = a : n._root = a, n;
  do
    r = r ? r[g] = new Array(2) : n._root = new Array(2), (d = e >= (c = (u + h) / 2)) ? u = c : h = c;
  while ((g = +d) == (v = +(f >= c)));
  return r[v] = o, r[g] = a, n;
}
function i3(n) {
  Array.isArray(n) || (n = Array.from(n));
  const e = n.length, t = new Float64Array(e);
  let r = 1 / 0, o = -1 / 0;
  for (let a = 0, u; a < e; ++a)
    isNaN(u = +this._x.call(null, n[a])) || (t[a] = u, u < r && (r = u), u > o && (o = u));
  if (r > o) return this;
  this.cover(r).cover(o);
  for (let a = 0; a < e; ++a)
    jm(this, t[a], n[a]);
  return this;
}
function o3(n) {
  if (isNaN(n = +n)) return this;
  var e = this._x0, t = this._x1;
  if (isNaN(e))
    t = (e = Math.floor(n)) + 1;
  else {
    for (var r = t - e || 1, o = this._root, a, u; e > n || n >= t; )
      switch (u = +(n < e), a = new Array(2), a[u] = o, o = a, r *= 2, u) {
        case 0:
          t = e + r;
          break;
        case 1:
          e = t - r;
          break;
      }
    this._root && this._root.length && (this._root = o);
  }
  return this._x0 = e, this._x1 = t, this;
}
function s3() {
  var n = [];
  return this.visit(function(e) {
    if (!e.length) do
      n.push(e.data);
    while (e = e.next);
  }), n;
}
function a3(n) {
  return arguments.length ? this.cover(+n[0][0]).cover(+n[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
}
function Ar(n, e, t) {
  this.node = n, this.x0 = e, this.x1 = t;
}
function u3(n, e) {
  var t, r = this._x0, o, a, u = this._x1, h = [], c = this._root, f, d;
  for (c && h.push(new Ar(c, r, u)), e == null ? e = 1 / 0 : (r = n - e, u = n + e); f = h.pop(); )
    if (!(!(c = f.node) || (o = f.x0) > u || (a = f.x1) < r))
      if (c.length) {
        var g = (o + a) / 2;
        h.push(
          new Ar(c[1], g, a),
          new Ar(c[0], o, g)
        ), (d = +(n >= g)) && (f = h[h.length - 1], h[h.length - 1] = h[h.length - 1 - d], h[h.length - 1 - d] = f);
      } else {
        var v = Math.abs(n - +this._x.call(null, c.data));
        v < e && (e = v, r = n - v, u = n + v, t = c.data);
      }
  return t;
}
function l3(n) {
  if (isNaN(c = +this._x.call(null, n))) return this;
  var e, t = this._root, r, o, a, u = this._x0, h = this._x1, c, f, d, g, v;
  if (!t) return this;
  if (t.length) for (; ; ) {
    if ((d = c >= (f = (u + h) / 2)) ? u = f : h = f, e = t, !(t = t[g = +d])) return this;
    if (!t.length) break;
    e[g + 1 & 1] && (r = e, v = g);
  }
  for (; t.data !== n; ) if (o = t, !(t = t.next)) return this;
  return (a = t.next) && delete t.next, o ? (a ? o.next = a : delete o.next, this) : e ? (a ? e[g] = a : delete e[g], (t = e[0] || e[1]) && t === (e[1] || e[0]) && !t.length && (r ? r[v] = t : this._root = t), this) : (this._root = a, this);
}
function c3(n) {
  for (var e = 0, t = n.length; e < t; ++e) this.remove(n[e]);
  return this;
}
function h3() {
  return this._root;
}
function f3() {
  var n = 0;
  return this.visit(function(e) {
    if (!e.length) do
      ++n;
    while (e = e.next);
  }), n;
}
function d3(n) {
  var e = [], t, r = this._root, o, a, u;
  for (r && e.push(new Ar(r, this._x0, this._x1)); t = e.pop(); )
    if (!n(r = t.node, a = t.x0, u = t.x1) && r.length) {
      var h = (a + u) / 2;
      (o = r[1]) && e.push(new Ar(o, h, u)), (o = r[0]) && e.push(new Ar(o, a, h));
    }
  return this;
}
function p3(n) {
  var e = [], t = [], r;
  for (this._root && e.push(new Ar(this._root, this._x0, this._x1)); r = e.pop(); ) {
    var o = r.node;
    if (o.length) {
      var a, u = r.x0, h = r.x1, c = (u + h) / 2;
      (a = o[0]) && e.push(new Ar(a, u, c)), (a = o[1]) && e.push(new Ar(a, c, h));
    }
    t.push(r);
  }
  for (; r = t.pop(); )
    n(r.node, r.x0, r.x1);
  return this;
}
function g3(n) {
  return n[0];
}
function m3(n) {
  return arguments.length ? (this._x = n, this) : this._x;
}
function Vm(n, e) {
  var t = new zh(e ?? g3, NaN, NaN);
  return n == null ? t : t.addAll(n);
}
function zh(n, e, t) {
  this._x = n, this._x0 = e, this._x1 = t, this._root = void 0;
}
function k0(n) {
  for (var e = { data: n.data }, t = e; n = n.next; ) t = t.next = { data: n.data };
  return e;
}
var _n = Vm.prototype = zh.prototype;
_n.copy = function() {
  var n = new zh(this._x, this._x0, this._x1), e = this._root, t, r;
  if (!e) return n;
  if (!e.length) return n._root = k0(e), n;
  for (t = [{ source: e, target: n._root = new Array(2) }]; e = t.pop(); )
    for (var o = 0; o < 2; ++o)
      (r = e.source[o]) && (r.length ? t.push({ source: r, target: e.target[o] = new Array(2) }) : e.target[o] = k0(r));
  return n;
};
_n.add = r3;
_n.addAll = i3;
_n.cover = o3;
_n.data = s3;
_n.extent = a3;
_n.find = u3;
_n.remove = l3;
_n.removeAll = c3;
_n.root = h3;
_n.size = f3;
_n.visit = d3;
_n.visitAfter = p3;
_n.x = m3;
function v3(n) {
  const e = +this._x.call(null, n), t = +this._y.call(null, n);
  return Km(this.cover(e, t), e, t, n);
}
function Km(n, e, t, r) {
  if (isNaN(e) || isNaN(t)) return n;
  var o, a = n._root, u = { data: r }, h = n._x0, c = n._y0, f = n._x1, d = n._y1, g, v, b, _, O, E, S, k;
  if (!a) return n._root = u, n;
  for (; a.length; )
    if ((O = e >= (g = (h + f) / 2)) ? h = g : f = g, (E = t >= (v = (c + d) / 2)) ? c = v : d = v, o = a, !(a = a[S = E << 1 | O])) return o[S] = u, n;
  if (b = +n._x.call(null, a.data), _ = +n._y.call(null, a.data), e === b && t === _) return u.next = a, o ? o[S] = u : n._root = u, n;
  do
    o = o ? o[S] = new Array(4) : n._root = new Array(4), (O = e >= (g = (h + f) / 2)) ? h = g : f = g, (E = t >= (v = (c + d) / 2)) ? c = v : d = v;
  while ((S = E << 1 | O) === (k = (_ >= v) << 1 | b >= g));
  return o[k] = a, o[S] = u, n;
}
function _3(n) {
  var e, t, r = n.length, o, a, u = new Array(r), h = new Array(r), c = 1 / 0, f = 1 / 0, d = -1 / 0, g = -1 / 0;
  for (t = 0; t < r; ++t)
    isNaN(o = +this._x.call(null, e = n[t])) || isNaN(a = +this._y.call(null, e)) || (u[t] = o, h[t] = a, o < c && (c = o), o > d && (d = o), a < f && (f = a), a > g && (g = a));
  if (c > d || f > g) return this;
  for (this.cover(c, f).cover(d, g), t = 0; t < r; ++t)
    Km(this, u[t], h[t], n[t]);
  return this;
}
function y3(n, e) {
  if (isNaN(n = +n) || isNaN(e = +e)) return this;
  var t = this._x0, r = this._y0, o = this._x1, a = this._y1;
  if (isNaN(t))
    o = (t = Math.floor(n)) + 1, a = (r = Math.floor(e)) + 1;
  else {
    for (var u = o - t || 1, h = this._root, c, f; t > n || n >= o || r > e || e >= a; )
      switch (f = (e < r) << 1 | n < t, c = new Array(4), c[f] = h, h = c, u *= 2, f) {
        case 0:
          o = t + u, a = r + u;
          break;
        case 1:
          t = o - u, a = r + u;
          break;
        case 2:
          o = t + u, r = a - u;
          break;
        case 3:
          t = o - u, r = a - u;
          break;
      }
    this._root && this._root.length && (this._root = h);
  }
  return this._x0 = t, this._y0 = r, this._x1 = o, this._y1 = a, this;
}
function b3() {
  var n = [];
  return this.visit(function(e) {
    if (!e.length) do
      n.push(e.data);
    while (e = e.next);
  }), n;
}
function w3(n) {
  return arguments.length ? this.cover(+n[0][0], +n[0][1]).cover(+n[1][0], +n[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function nn(n, e, t, r, o) {
  this.node = n, this.x0 = e, this.y0 = t, this.x1 = r, this.y1 = o;
}
function x3(n, e, t) {
  var r, o = this._x0, a = this._y0, u, h, c, f, d = this._x1, g = this._y1, v = [], b = this._root, _, O;
  for (b && v.push(new nn(b, o, a, d, g)), t == null ? t = 1 / 0 : (o = n - t, a = e - t, d = n + t, g = e + t, t *= t); _ = v.pop(); )
    if (!(!(b = _.node) || (u = _.x0) > d || (h = _.y0) > g || (c = _.x1) < o || (f = _.y1) < a))
      if (b.length) {
        var E = (u + c) / 2, S = (h + f) / 2;
        v.push(
          new nn(b[3], E, S, c, f),
          new nn(b[2], u, S, E, f),
          new nn(b[1], E, h, c, S),
          new nn(b[0], u, h, E, S)
        ), (O = (e >= S) << 1 | n >= E) && (_ = v[v.length - 1], v[v.length - 1] = v[v.length - 1 - O], v[v.length - 1 - O] = _);
      } else {
        var k = n - +this._x.call(null, b.data), C = e - +this._y.call(null, b.data), A = k * k + C * C;
        if (A < t) {
          var N = Math.sqrt(t = A);
          o = n - N, a = e - N, d = n + N, g = e + N, r = b.data;
        }
      }
  return r;
}
function T3(n) {
  if (isNaN(d = +this._x.call(null, n)) || isNaN(g = +this._y.call(null, n))) return this;
  var e, t = this._root, r, o, a, u = this._x0, h = this._y0, c = this._x1, f = this._y1, d, g, v, b, _, O, E, S;
  if (!t) return this;
  if (t.length) for (; ; ) {
    if ((_ = d >= (v = (u + c) / 2)) ? u = v : c = v, (O = g >= (b = (h + f) / 2)) ? h = b : f = b, e = t, !(t = t[E = O << 1 | _])) return this;
    if (!t.length) break;
    (e[E + 1 & 3] || e[E + 2 & 3] || e[E + 3 & 3]) && (r = e, S = E);
  }
  for (; t.data !== n; ) if (o = t, !(t = t.next)) return this;
  return (a = t.next) && delete t.next, o ? (a ? o.next = a : delete o.next, this) : e ? (a ? e[E] = a : delete e[E], (t = e[0] || e[1] || e[2] || e[3]) && t === (e[3] || e[2] || e[1] || e[0]) && !t.length && (r ? r[S] = t : this._root = t), this) : (this._root = a, this);
}
function S3(n) {
  for (var e = 0, t = n.length; e < t; ++e) this.remove(n[e]);
  return this;
}
function C3() {
  return this._root;
}
function M3() {
  var n = 0;
  return this.visit(function(e) {
    if (!e.length) do
      ++n;
    while (e = e.next);
  }), n;
}
function E3(n) {
  var e = [], t, r = this._root, o, a, u, h, c;
  for (r && e.push(new nn(r, this._x0, this._y0, this._x1, this._y1)); t = e.pop(); )
    if (!n(r = t.node, a = t.x0, u = t.y0, h = t.x1, c = t.y1) && r.length) {
      var f = (a + h) / 2, d = (u + c) / 2;
      (o = r[3]) && e.push(new nn(o, f, d, h, c)), (o = r[2]) && e.push(new nn(o, a, d, f, c)), (o = r[1]) && e.push(new nn(o, f, u, h, d)), (o = r[0]) && e.push(new nn(o, a, u, f, d));
    }
  return this;
}
function A3(n) {
  var e = [], t = [], r;
  for (this._root && e.push(new nn(this._root, this._x0, this._y0, this._x1, this._y1)); r = e.pop(); ) {
    var o = r.node;
    if (o.length) {
      var a, u = r.x0, h = r.y0, c = r.x1, f = r.y1, d = (u + c) / 2, g = (h + f) / 2;
      (a = o[0]) && e.push(new nn(a, u, h, d, g)), (a = o[1]) && e.push(new nn(a, d, h, c, g)), (a = o[2]) && e.push(new nn(a, u, g, d, f)), (a = o[3]) && e.push(new nn(a, d, g, c, f));
    }
    t.push(r);
  }
  for (; r = t.pop(); )
    n(r.node, r.x0, r.y0, r.x1, r.y1);
  return this;
}
function I3(n) {
  return n[0];
}
function P3(n) {
  return arguments.length ? (this._x = n, this) : this._x;
}
function O3(n) {
  return n[1];
}
function k3(n) {
  return arguments.length ? (this._y = n, this) : this._y;
}
function Jm(n, e, t) {
  var r = new Dh(e ?? I3, t ?? O3, NaN, NaN, NaN, NaN);
  return n == null ? r : r.addAll(n);
}
function Dh(n, e, t, r, o, a) {
  this._x = n, this._y = e, this._x0 = t, this._y0 = r, this._x1 = o, this._y1 = a, this._root = void 0;
}
function $0(n) {
  for (var e = { data: n.data }, t = e; n = n.next; ) t = t.next = { data: n.data };
  return e;
}
var on = Jm.prototype = Dh.prototype;
on.copy = function() {
  var n = new Dh(this._x, this._y, this._x0, this._y0, this._x1, this._y1), e = this._root, t, r;
  if (!e) return n;
  if (!e.length) return n._root = $0(e), n;
  for (t = [{ source: e, target: n._root = new Array(4) }]; e = t.pop(); )
    for (var o = 0; o < 4; ++o)
      (r = e.source[o]) && (r.length ? t.push({ source: r, target: e.target[o] = new Array(4) }) : e.target[o] = $0(r));
  return n;
};
on.add = v3;
on.addAll = _3;
on.cover = y3;
on.data = b3;
on.extent = w3;
on.find = x3;
on.remove = T3;
on.removeAll = S3;
on.root = C3;
on.size = M3;
on.visit = E3;
on.visitAfter = A3;
on.x = P3;
on.y = k3;
function $3(n) {
  const e = +this._x.call(null, n), t = +this._y.call(null, n), r = +this._z.call(null, n);
  return Ym(this.cover(e, t, r), e, t, r, n);
}
function Ym(n, e, t, r, o) {
  if (isNaN(e) || isNaN(t) || isNaN(r)) return n;
  var a, u = n._root, h = { data: o }, c = n._x0, f = n._y0, d = n._z0, g = n._x1, v = n._y1, b = n._z1, _, O, E, S, k, C, A, N, L, F, H;
  if (!u) return n._root = h, n;
  for (; u.length; )
    if ((A = e >= (_ = (c + g) / 2)) ? c = _ : g = _, (N = t >= (O = (f + v) / 2)) ? f = O : v = O, (L = r >= (E = (d + b) / 2)) ? d = E : b = E, a = u, !(u = u[F = L << 2 | N << 1 | A])) return a[F] = h, n;
  if (S = +n._x.call(null, u.data), k = +n._y.call(null, u.data), C = +n._z.call(null, u.data), e === S && t === k && r === C) return h.next = u, a ? a[F] = h : n._root = h, n;
  do
    a = a ? a[F] = new Array(8) : n._root = new Array(8), (A = e >= (_ = (c + g) / 2)) ? c = _ : g = _, (N = t >= (O = (f + v) / 2)) ? f = O : v = O, (L = r >= (E = (d + b) / 2)) ? d = E : b = E;
  while ((F = L << 2 | N << 1 | A) === (H = (C >= E) << 2 | (k >= O) << 1 | S >= _));
  return a[H] = u, a[F] = h, n;
}
function N3(n) {
  Array.isArray(n) || (n = Array.from(n));
  const e = n.length, t = new Float64Array(e), r = new Float64Array(e), o = new Float64Array(e);
  let a = 1 / 0, u = 1 / 0, h = 1 / 0, c = -1 / 0, f = -1 / 0, d = -1 / 0;
  for (let g = 0, v, b, _, O; g < e; ++g)
    isNaN(b = +this._x.call(null, v = n[g])) || isNaN(_ = +this._y.call(null, v)) || isNaN(O = +this._z.call(null, v)) || (t[g] = b, r[g] = _, o[g] = O, b < a && (a = b), b > c && (c = b), _ < u && (u = _), _ > f && (f = _), O < h && (h = O), O > d && (d = O));
  if (a > c || u > f || h > d) return this;
  this.cover(a, u, h).cover(c, f, d);
  for (let g = 0; g < e; ++g)
    Ym(this, t[g], r[g], o[g], n[g]);
  return this;
}
function R3(n, e, t) {
  if (isNaN(n = +n) || isNaN(e = +e) || isNaN(t = +t)) return this;
  var r = this._x0, o = this._y0, a = this._z0, u = this._x1, h = this._y1, c = this._z1;
  if (isNaN(r))
    u = (r = Math.floor(n)) + 1, h = (o = Math.floor(e)) + 1, c = (a = Math.floor(t)) + 1;
  else {
    for (var f = u - r || 1, d = this._root, g, v; r > n || n >= u || o > e || e >= h || a > t || t >= c; )
      switch (v = (t < a) << 2 | (e < o) << 1 | n < r, g = new Array(8), g[v] = d, d = g, f *= 2, v) {
        case 0:
          u = r + f, h = o + f, c = a + f;
          break;
        case 1:
          r = u - f, h = o + f, c = a + f;
          break;
        case 2:
          u = r + f, o = h - f, c = a + f;
          break;
        case 3:
          r = u - f, o = h - f, c = a + f;
          break;
        case 4:
          u = r + f, h = o + f, a = c - f;
          break;
        case 5:
          r = u - f, h = o + f, a = c - f;
          break;
        case 6:
          u = r + f, o = h - f, a = c - f;
          break;
        case 7:
          r = u - f, o = h - f, a = c - f;
          break;
      }
    this._root && this._root.length && (this._root = d);
  }
  return this._x0 = r, this._y0 = o, this._z0 = a, this._x1 = u, this._y1 = h, this._z1 = c, this;
}
function z3() {
  var n = [];
  return this.visit(function(e) {
    if (!e.length) do
      n.push(e.data);
    while (e = e.next);
  }), n;
}
function D3(n) {
  return arguments.length ? this.cover(+n[0][0], +n[0][1], +n[0][2]).cover(+n[1][0], +n[1][1], +n[1][2]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
}
function st(n, e, t, r, o, a, u) {
  this.node = n, this.x0 = e, this.y0 = t, this.z0 = r, this.x1 = o, this.y1 = a, this.z1 = u;
}
function L3(n, e, t, r) {
  var o, a = this._x0, u = this._y0, h = this._z0, c, f, d, g, v, b, _ = this._x1, O = this._y1, E = this._z1, S = [], k = this._root, C, A;
  for (k && S.push(new st(k, a, u, h, _, O, E)), r == null ? r = 1 / 0 : (a = n - r, u = e - r, h = t - r, _ = n + r, O = e + r, E = t + r, r *= r); C = S.pop(); )
    if (!(!(k = C.node) || (c = C.x0) > _ || (f = C.y0) > O || (d = C.z0) > E || (g = C.x1) < a || (v = C.y1) < u || (b = C.z1) < h))
      if (k.length) {
        var N = (c + g) / 2, L = (f + v) / 2, F = (d + b) / 2;
        S.push(
          new st(k[7], N, L, F, g, v, b),
          new st(k[6], c, L, F, N, v, b),
          new st(k[5], N, f, F, g, L, b),
          new st(k[4], c, f, F, N, L, b),
          new st(k[3], N, L, d, g, v, F),
          new st(k[2], c, L, d, N, v, F),
          new st(k[1], N, f, d, g, L, F),
          new st(k[0], c, f, d, N, L, F)
        ), (A = (t >= F) << 2 | (e >= L) << 1 | n >= N) && (C = S[S.length - 1], S[S.length - 1] = S[S.length - 1 - A], S[S.length - 1 - A] = C);
      } else {
        var H = n - +this._x.call(null, k.data), se = e - +this._y.call(null, k.data), be = t - +this._z.call(null, k.data), ge = H * H + se * se + be * be;
        if (ge < r) {
          var pe = Math.sqrt(r = ge);
          a = n - pe, u = e - pe, h = t - pe, _ = n + pe, O = e + pe, E = t + pe, o = k.data;
        }
      }
  return o;
}
const B3 = (n, e, t, r, o, a) => Math.sqrt((n - r) ** 2 + (e - o) ** 2 + (t - a) ** 2);
function F3(n, e, t, r) {
  const o = [], a = n - r, u = e - r, h = t - r, c = n + r, f = e + r, d = t + r;
  return this.visit((g, v, b, _, O, E, S) => {
    if (!g.length)
      do {
        const k = g.data;
        B3(n, e, t, this._x(k), this._y(k), this._z(k)) <= r && o.push(k);
      } while (g = g.next);
    return v > c || b > f || _ > d || O < a || E < u || S < h;
  }), o;
}
function U3(n) {
  if (isNaN(v = +this._x.call(null, n)) || isNaN(b = +this._y.call(null, n)) || isNaN(_ = +this._z.call(null, n))) return this;
  var e, t = this._root, r, o, a, u = this._x0, h = this._y0, c = this._z0, f = this._x1, d = this._y1, g = this._z1, v, b, _, O, E, S, k, C, A, N, L;
  if (!t) return this;
  if (t.length) for (; ; ) {
    if ((k = v >= (O = (u + f) / 2)) ? u = O : f = O, (C = b >= (E = (h + d) / 2)) ? h = E : d = E, (A = _ >= (S = (c + g) / 2)) ? c = S : g = S, e = t, !(t = t[N = A << 2 | C << 1 | k])) return this;
    if (!t.length) break;
    (e[N + 1 & 7] || e[N + 2 & 7] || e[N + 3 & 7] || e[N + 4 & 7] || e[N + 5 & 7] || e[N + 6 & 7] || e[N + 7 & 7]) && (r = e, L = N);
  }
  for (; t.data !== n; ) if (o = t, !(t = t.next)) return this;
  return (a = t.next) && delete t.next, o ? (a ? o.next = a : delete o.next, this) : e ? (a ? e[N] = a : delete e[N], (t = e[0] || e[1] || e[2] || e[3] || e[4] || e[5] || e[6] || e[7]) && t === (e[7] || e[6] || e[5] || e[4] || e[3] || e[2] || e[1] || e[0]) && !t.length && (r ? r[L] = t : this._root = t), this) : (this._root = a, this);
}
function Z3(n) {
  for (var e = 0, t = n.length; e < t; ++e) this.remove(n[e]);
  return this;
}
function q3() {
  return this._root;
}
function H3() {
  var n = 0;
  return this.visit(function(e) {
    if (!e.length) do
      ++n;
    while (e = e.next);
  }), n;
}
function W3(n) {
  var e = [], t, r = this._root, o, a, u, h, c, f, d;
  for (r && e.push(new st(r, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); t = e.pop(); )
    if (!n(r = t.node, a = t.x0, u = t.y0, h = t.z0, c = t.x1, f = t.y1, d = t.z1) && r.length) {
      var g = (a + c) / 2, v = (u + f) / 2, b = (h + d) / 2;
      (o = r[7]) && e.push(new st(o, g, v, b, c, f, d)), (o = r[6]) && e.push(new st(o, a, v, b, g, f, d)), (o = r[5]) && e.push(new st(o, g, u, b, c, v, d)), (o = r[4]) && e.push(new st(o, a, u, b, g, v, d)), (o = r[3]) && e.push(new st(o, g, v, h, c, f, b)), (o = r[2]) && e.push(new st(o, a, v, h, g, f, b)), (o = r[1]) && e.push(new st(o, g, u, h, c, v, b)), (o = r[0]) && e.push(new st(o, a, u, h, g, v, b));
    }
  return this;
}
function G3(n) {
  var e = [], t = [], r;
  for (this._root && e.push(new st(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); r = e.pop(); ) {
    var o = r.node;
    if (o.length) {
      var a, u = r.x0, h = r.y0, c = r.z0, f = r.x1, d = r.y1, g = r.z1, v = (u + f) / 2, b = (h + d) / 2, _ = (c + g) / 2;
      (a = o[0]) && e.push(new st(a, u, h, c, v, b, _)), (a = o[1]) && e.push(new st(a, v, h, c, f, b, _)), (a = o[2]) && e.push(new st(a, u, b, c, v, d, _)), (a = o[3]) && e.push(new st(a, v, b, c, f, d, _)), (a = o[4]) && e.push(new st(a, u, h, _, v, b, g)), (a = o[5]) && e.push(new st(a, v, h, _, f, b, g)), (a = o[6]) && e.push(new st(a, u, b, _, v, d, g)), (a = o[7]) && e.push(new st(a, v, b, _, f, d, g));
    }
    t.push(r);
  }
  for (; r = t.pop(); )
    n(r.node, r.x0, r.y0, r.z0, r.x1, r.y1, r.z1);
  return this;
}
function j3(n) {
  return n[0];
}
function V3(n) {
  return arguments.length ? (this._x = n, this) : this._x;
}
function K3(n) {
  return n[1];
}
function J3(n) {
  return arguments.length ? (this._y = n, this) : this._y;
}
function Y3(n) {
  return n[2];
}
function Q3(n) {
  return arguments.length ? (this._z = n, this) : this._z;
}
function Qm(n, e, t, r) {
  var o = new Lh(e ?? j3, t ?? K3, r ?? Y3, NaN, NaN, NaN, NaN, NaN, NaN);
  return n == null ? o : o.addAll(n);
}
function Lh(n, e, t, r, o, a, u, h, c) {
  this._x = n, this._y = e, this._z = t, this._x0 = r, this._y0 = o, this._z0 = a, this._x1 = u, this._y1 = h, this._z1 = c, this._root = void 0;
}
function N0(n) {
  for (var e = { data: n.data }, t = e; n = n.next; ) t = t.next = { data: n.data };
  return e;
}
var Ht = Qm.prototype = Lh.prototype;
Ht.copy = function() {
  var n = new Lh(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), e = this._root, t, r;
  if (!e) return n;
  if (!e.length) return n._root = N0(e), n;
  for (t = [{ source: e, target: n._root = new Array(8) }]; e = t.pop(); )
    for (var o = 0; o < 8; ++o)
      (r = e.source[o]) && (r.length ? t.push({ source: r, target: e.target[o] = new Array(8) }) : e.target[o] = N0(r));
  return n;
};
Ht.add = $3;
Ht.addAll = N3;
Ht.cover = R3;
Ht.data = z3;
Ht.extent = D3;
Ht.find = L3;
Ht.findAllWithinRadius = F3;
Ht.remove = U3;
Ht.removeAll = Z3;
Ht.root = q3;
Ht.size = H3;
Ht.visit = W3;
Ht.visitAfter = G3;
Ht.x = V3;
Ht.y = J3;
Ht.z = Q3;
function ns(n) {
  return function() {
    return n;
  };
}
function Cr(n) {
  return (n() - 0.5) * 1e-6;
}
function X3(n) {
  return n.index;
}
function R0(n, e) {
  var t = n.get(e);
  if (!t) throw new Error("node not found: " + e);
  return t;
}
function eI(n) {
  var e = X3, t = v, r, o = ns(30), a, u, h, c, f, d, g = 1;
  n == null && (n = []);
  function v(S) {
    return 1 / Math.min(c[S.source.index], c[S.target.index]);
  }
  function b(S) {
    for (var k = 0, C = n.length; k < g; ++k)
      for (var A = 0, N, L, F, H = 0, se = 0, be = 0, ge, pe; A < C; ++A)
        N = n[A], L = N.source, F = N.target, H = F.x + F.vx - L.x - L.vx || Cr(d), h > 1 && (se = F.y + F.vy - L.y - L.vy || Cr(d)), h > 2 && (be = F.z + F.vz - L.z - L.vz || Cr(d)), ge = Math.sqrt(H * H + se * se + be * be), ge = (ge - a[A]) / ge * S * r[A], H *= ge, se *= ge, be *= ge, F.vx -= H * (pe = f[A]), h > 1 && (F.vy -= se * pe), h > 2 && (F.vz -= be * pe), L.vx += H * (pe = 1 - pe), h > 1 && (L.vy += se * pe), h > 2 && (L.vz += be * pe);
  }
  function _() {
    if (u) {
      var S, k = u.length, C = n.length, A = new Map(u.map((L, F) => [e(L, F, u), L])), N;
      for (S = 0, c = new Array(k); S < C; ++S)
        N = n[S], N.index = S, typeof N.source != "object" && (N.source = R0(A, N.source)), typeof N.target != "object" && (N.target = R0(A, N.target)), c[N.source.index] = (c[N.source.index] || 0) + 1, c[N.target.index] = (c[N.target.index] || 0) + 1;
      for (S = 0, f = new Array(C); S < C; ++S)
        N = n[S], f[S] = c[N.source.index] / (c[N.source.index] + c[N.target.index]);
      r = new Array(C), O(), a = new Array(C), E();
    }
  }
  function O() {
    if (u)
      for (var S = 0, k = n.length; S < k; ++S)
        r[S] = +t(n[S], S, n);
  }
  function E() {
    if (u)
      for (var S = 0, k = n.length; S < k; ++S)
        a[S] = +o(n[S], S, n);
  }
  return b.initialize = function(S, ...k) {
    u = S, d = k.find((C) => typeof C == "function") || Math.random, h = k.find((C) => [1, 2, 3].includes(C)) || 2, _();
  }, b.links = function(S) {
    return arguments.length ? (n = S, _(), b) : n;
  }, b.id = function(S) {
    return arguments.length ? (e = S, b) : e;
  }, b.iterations = function(S) {
    return arguments.length ? (g = +S, b) : g;
  }, b.strength = function(S) {
    return arguments.length ? (t = typeof S == "function" ? S : ns(+S), O(), b) : t;
  }, b.distance = function(S) {
    return arguments.length ? (o = typeof S == "function" ? S : ns(+S), E(), b) : o;
  }, b;
}
var tI = { value: () => {
} };
function Xm() {
  for (var n = 0, e = arguments.length, t = {}, r; n < e; ++n) {
    if (!(r = arguments[n] + "") || r in t || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    t[r] = [];
  }
  return new Ha(t);
}
function Ha(n) {
  this._ = n;
}
function nI(n, e) {
  return n.trim().split(/^|\s+/).map(function(t) {
    var r = "", o = t.indexOf(".");
    if (o >= 0 && (r = t.slice(o + 1), t = t.slice(0, o)), t && !e.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name: r };
  });
}
Ha.prototype = Xm.prototype = {
  constructor: Ha,
  on: function(n, e) {
    var t = this._, r = nI(n + "", t), o, a = -1, u = r.length;
    if (arguments.length < 2) {
      for (; ++a < u; ) if ((o = (n = r[a]).type) && (o = rI(t[o], n.name))) return o;
      return;
    }
    if (e != null && typeof e != "function") throw new Error("invalid callback: " + e);
    for (; ++a < u; )
      if (o = (n = r[a]).type) t[o] = z0(t[o], n.name, e);
      else if (e == null) for (o in t) t[o] = z0(t[o], n.name, null);
    return this;
  },
  copy: function() {
    var n = {}, e = this._;
    for (var t in e) n[t] = e[t].slice();
    return new Ha(n);
  },
  call: function(n, e) {
    if ((o = arguments.length - 2) > 0) for (var t = new Array(o), r = 0, o, a; r < o; ++r) t[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    for (a = this._[n], r = 0, o = a.length; r < o; ++r) a[r].value.apply(e, t);
  },
  apply: function(n, e, t) {
    if (!this._.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    for (var r = this._[n], o = 0, a = r.length; o < a; ++o) r[o].value.apply(e, t);
  }
};
function rI(n, e) {
  for (var t = 0, r = n.length, o; t < r; ++t)
    if ((o = n[t]).name === e)
      return o.value;
}
function z0(n, e, t) {
  for (var r = 0, o = n.length; r < o; ++r)
    if (n[r].name === e) {
      n[r] = tI, n = n.slice(0, r).concat(n.slice(r + 1));
      break;
    }
  return t != null && n.push({ name: e, value: t }), n;
}
var vo = 0, Yo = 0, Go = 0, ev = 1e3, ru, Qo, iu = 0, $i = 0, $u = 0, ds = typeof performance == "object" && performance.now ? performance : Date, tv = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(n) {
  setTimeout(n, 17);
};
function nv() {
  return $i || (tv(iI), $i = ds.now() + $u);
}
function iI() {
  $i = 0;
}
function th() {
  this._call = this._time = this._next = null;
}
th.prototype = rv.prototype = {
  constructor: th,
  restart: function(n, e, t) {
    if (typeof n != "function") throw new TypeError("callback is not a function");
    t = (t == null ? nv() : +t) + (e == null ? 0 : +e), !this._next && Qo !== this && (Qo ? Qo._next = this : ru = this, Qo = this), this._call = n, this._time = t, nh();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, nh());
  }
};
function rv(n, e, t) {
  var r = new th();
  return r.restart(n, e, t), r;
}
function oI() {
  nv(), ++vo;
  for (var n = ru, e; n; )
    (e = $i - n._time) >= 0 && n._call.call(void 0, e), n = n._next;
  --vo;
}
function D0() {
  $i = (iu = ds.now()) + $u, vo = Yo = 0;
  try {
    oI();
  } finally {
    vo = 0, aI(), $i = 0;
  }
}
function sI() {
  var n = ds.now(), e = n - iu;
  e > ev && ($u -= e, iu = n);
}
function aI() {
  for (var n, e = ru, t, r = 1 / 0; e; )
    e._call ? (r > e._time && (r = e._time), n = e, e = e._next) : (t = e._next, e._next = null, e = n ? n._next = t : ru = t);
  Qo = n, nh(r);
}
function nh(n) {
  if (!vo) {
    Yo && (Yo = clearTimeout(Yo));
    var e = n - $i;
    e > 24 ? (n < 1 / 0 && (Yo = setTimeout(D0, n - ds.now() - $u)), Go && (Go = clearInterval(Go))) : (Go || (iu = ds.now(), Go = setInterval(sI, ev)), vo = 1, tv(D0));
  }
}
const uI = 1664525, lI = 1013904223, L0 = 4294967296;
function cI() {
  let n = 1;
  return () => (n = (uI * n + lI) % L0) / L0;
}
var B0 = 3;
function vc(n) {
  return n.x;
}
function F0(n) {
  return n.y;
}
function hI(n) {
  return n.z;
}
var fI = 10, dI = Math.PI * (3 - Math.sqrt(5)), pI = Math.PI * 20 / (9 + Math.sqrt(221));
function gI(n, e) {
  e = e || 2;
  var t = Math.min(B0, Math.max(1, Math.round(e))), r, o = 1, a = 1e-3, u = 1 - Math.pow(a, 1 / 300), h = 0, c = 0.6, f = /* @__PURE__ */ new Map(), d = rv(b), g = Xm("tick", "end"), v = cI();
  n == null && (n = []);
  function b() {
    _(), g.call("tick", r), o < a && (d.stop(), g.call("end", r));
  }
  function _(S) {
    var k, C = n.length, A;
    S === void 0 && (S = 1);
    for (var N = 0; N < S; ++N)
      for (o += (h - o) * u, f.forEach(function(L) {
        L(o);
      }), k = 0; k < C; ++k)
        A = n[k], A.fx == null ? A.x += A.vx *= c : (A.x = A.fx, A.vx = 0), t > 1 && (A.fy == null ? A.y += A.vy *= c : (A.y = A.fy, A.vy = 0)), t > 2 && (A.fz == null ? A.z += A.vz *= c : (A.z = A.fz, A.vz = 0));
    return r;
  }
  function O() {
    for (var S = 0, k = n.length, C; S < k; ++S) {
      if (C = n[S], C.index = S, C.fx != null && (C.x = C.fx), C.fy != null && (C.y = C.fy), C.fz != null && (C.z = C.fz), isNaN(C.x) || t > 1 && isNaN(C.y) || t > 2 && isNaN(C.z)) {
        var A = fI * (t > 2 ? Math.cbrt(0.5 + S) : t > 1 ? Math.sqrt(0.5 + S) : S), N = S * dI, L = S * pI;
        t === 1 ? C.x = A : t === 2 ? (C.x = A * Math.cos(N), C.y = A * Math.sin(N)) : (C.x = A * Math.sin(N) * Math.cos(L), C.y = A * Math.cos(N), C.z = A * Math.sin(N) * Math.sin(L));
      }
      (isNaN(C.vx) || t > 1 && isNaN(C.vy) || t > 2 && isNaN(C.vz)) && (C.vx = 0, t > 1 && (C.vy = 0), t > 2 && (C.vz = 0));
    }
  }
  function E(S) {
    return S.initialize && S.initialize(n, v, t), S;
  }
  return O(), r = {
    tick: _,
    restart: function() {
      return d.restart(b), r;
    },
    stop: function() {
      return d.stop(), r;
    },
    numDimensions: function(S) {
      return arguments.length ? (t = Math.min(B0, Math.max(1, Math.round(S))), f.forEach(E), r) : t;
    },
    nodes: function(S) {
      return arguments.length ? (n = S, O(), f.forEach(E), r) : n;
    },
    alpha: function(S) {
      return arguments.length ? (o = +S, r) : o;
    },
    alphaMin: function(S) {
      return arguments.length ? (a = +S, r) : a;
    },
    alphaDecay: function(S) {
      return arguments.length ? (u = +S, r) : +u;
    },
    alphaTarget: function(S) {
      return arguments.length ? (h = +S, r) : h;
    },
    velocityDecay: function(S) {
      return arguments.length ? (c = 1 - S, r) : 1 - c;
    },
    randomSource: function(S) {
      return arguments.length ? (v = S, f.forEach(E), r) : v;
    },
    force: function(S, k) {
      return arguments.length > 1 ? (k == null ? f.delete(S) : f.set(S, E(k)), r) : f.get(S);
    },
    find: function() {
      var S = Array.prototype.slice.call(arguments), k = S.shift() || 0, C = (t > 1 ? S.shift() : null) || 0, A = (t > 2 ? S.shift() : null) || 0, N = S.shift() || 1 / 0, L = 0, F = n.length, H, se, be, ge, pe, Je;
      for (N *= N, L = 0; L < F; ++L)
        pe = n[L], H = k - pe.x, se = C - (pe.y || 0), be = A - (pe.z || 0), ge = H * H + se * se + be * be, ge < N && (Je = pe, N = ge);
      return Je;
    },
    on: function(S, k) {
      return arguments.length > 1 ? (g.on(S, k), r) : g.on(S);
    }
  };
}
function mI() {
  var n, e, t, r, o, a = ns(-30), u, h = 1, c = 1 / 0, f = 0.81;
  function d(_) {
    var O, E = n.length, S = (e === 1 ? Vm(n, vc) : e === 2 ? Jm(n, vc, F0) : e === 3 ? Qm(n, vc, F0, hI) : null).visitAfter(v);
    for (o = _, O = 0; O < E; ++O) t = n[O], S.visit(b);
  }
  function g() {
    if (n) {
      var _, O = n.length, E;
      for (u = new Array(O), _ = 0; _ < O; ++_) E = n[_], u[E.index] = +a(E, _, n);
    }
  }
  function v(_) {
    var O = 0, E, S, k = 0, C, A, N, L, F = _.length;
    if (F) {
      for (C = A = N = L = 0; L < F; ++L)
        (E = _[L]) && (S = Math.abs(E.value)) && (O += E.value, k += S, C += S * (E.x || 0), A += S * (E.y || 0), N += S * (E.z || 0));
      O *= Math.sqrt(4 / F), _.x = C / k, e > 1 && (_.y = A / k), e > 2 && (_.z = N / k);
    } else {
      E = _, E.x = E.data.x, e > 1 && (E.y = E.data.y), e > 2 && (E.z = E.data.z);
      do
        O += u[E.data.index];
      while (E = E.next);
    }
    _.value = O;
  }
  function b(_, O, E, S, k) {
    if (!_.value) return !0;
    var C = [E, S, k][e - 1], A = _.x - t.x, N = e > 1 ? _.y - t.y : 0, L = e > 2 ? _.z - t.z : 0, F = C - O, H = A * A + N * N + L * L;
    if (F * F / f < H)
      return H < c && (A === 0 && (A = Cr(r), H += A * A), e > 1 && N === 0 && (N = Cr(r), H += N * N), e > 2 && L === 0 && (L = Cr(r), H += L * L), H < h && (H = Math.sqrt(h * H)), t.vx += A * _.value * o / H, e > 1 && (t.vy += N * _.value * o / H), e > 2 && (t.vz += L * _.value * o / H)), !0;
    if (_.length || H >= c) return;
    (_.data !== t || _.next) && (A === 0 && (A = Cr(r), H += A * A), e > 1 && N === 0 && (N = Cr(r), H += N * N), e > 2 && L === 0 && (L = Cr(r), H += L * L), H < h && (H = Math.sqrt(h * H)));
    do
      _.data !== t && (F = u[_.data.index] * o / H, t.vx += A * F, e > 1 && (t.vy += N * F), e > 2 && (t.vz += L * F));
    while (_ = _.next);
  }
  return d.initialize = function(_, ...O) {
    n = _, r = O.find((E) => typeof E == "function") || Math.random, e = O.find((E) => [1, 2, 3].includes(E)) || 2, g();
  }, d.strength = function(_) {
    return arguments.length ? (a = typeof _ == "function" ? _ : ns(+_), g(), d) : a;
  }, d.distanceMin = function(_) {
    return arguments.length ? (h = _ * _, d) : Math.sqrt(h);
  }, d.distanceMax = function(_) {
    return arguments.length ? (c = _ * _, d) : Math.sqrt(c);
  }, d.theta = function(_) {
    return arguments.length ? (f = _ * _, d) : Math.sqrt(f);
  }, d;
}
function rh(n) {
  return typeof n == "object" && n !== null && "index" in n && typeof n.index == "number" && "x" in n && typeof n.x == "number" && "y" in n && typeof n.y == "number" && "z" in n && typeof n.z == "number" && "vx" in n && typeof n.vx == "number" && "vy" in n && typeof n.vy == "number" && "vz" in n && typeof n.vz == "number";
}
const vI = Ie({
  alphaMin: V().positive().default(0.1),
  alphaTarget: V().min(0).default(0),
  alphaDecay: V().positive().default(0.0228),
  velocityDecay: V().positive().default(0.4)
});
function _I(n) {
  return !!(typeof n == "object" && n !== null && Object.hasOwn(n, "index") && "index" in n && typeof n.index == "number" && "source" in n && rh(n.source) && "target" in n && rh(n.target));
}
const fu = class fu extends _t {
  constructor(e = {}) {
    super(), this.nodeMapping = /* @__PURE__ */ new Map(), this.edgeMapping = /* @__PURE__ */ new Map(), this.newNodeMap = /* @__PURE__ */ new Map(), this.newEdgeMap = /* @__PURE__ */ new Map(), this.reheat = !1;
    const t = vI.parse(e);
    this.d3AlphaMin = t.alphaMin, this.d3AlphaTarget = t.alphaTarget, this.d3AlphaDecay = t.alphaDecay, this.d3VelocityDecay = t.velocityDecay;
    const r = eI();
    r.strength(0.9), this.d3ForceLayout = gI().numDimensions(3).alpha(1).force("link", r).force("charge", mI()).force("center", n3()).force("dagRadial", null).stop(), this.d3ForceLayout.force("link").id((o) => o.id);
  }
  get graphNeedsRefresh() {
    return !!this.newNodeMap.size || !!this.newEdgeMap.size;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init() {
  }
  refresh() {
    if (this.graphNeedsRefresh || this.reheat) {
      let e = [...this.nodeMapping.values()];
      e = e.concat([...this.newNodeMap.values()]), this.d3ForceLayout.alpha(1).nodes(e).stop();
      for (const r of this.newNodeMap.entries()) {
        const o = r[0], a = r[1];
        if (!rh(a))
          throw new Error("Internal error: Node is not settled as a complete D3 Node");
        this.nodeMapping.set(o, a);
      }
      this.newNodeMap.clear();
      let t = [...this.edgeMapping.values()];
      t = t.concat([...this.newEdgeMap.values()]), this.d3ForceLayout.force("link").links(t);
      for (const r of this.newEdgeMap.entries()) {
        const o = r[0], a = r[1];
        if (!_I(a))
          throw new Error("Internal error: Edge is not settled as a complete D3 Edge");
        this.edgeMapping.set(o, a);
      }
      this.newEdgeMap.clear();
    }
  }
  step() {
    this.refresh(), this.d3ForceLayout.tick();
  }
  get isSettled() {
    return this.d3ForceLayout.alpha() < this.d3AlphaMin;
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
    const t = this._getMappedNode(e);
    return {
      x: t.x,
      y: t.y,
      z: t.z
    };
  }
  setNodePosition(e, t) {
    const r = this._getMappedNode(e);
    r.x = t.x, r.y = t.y, r.z = t.z ?? 0, this.reheat = !0;
  }
  getEdgePosition(e) {
    const t = this._getMappedEdge(e);
    return {
      src: {
        x: t.source.x,
        y: t.source.y,
        z: t.source.z
      },
      dst: {
        x: t.target.x,
        y: t.target.y,
        z: t.target.z
      }
    };
  }
  pin(e) {
    const t = this._getMappedNode(e);
    t.fx = t.x, t.fy = t.y, t.fz = t.z, this.reheat = !0;
  }
  unpin(e) {
    const t = this._getMappedNode(e);
    t.fx = void 0, t.fy = void 0, t.fz = void 0, this.reheat = !0;
  }
  _getMappedNode(e) {
    this.refresh();
    const t = this.nodeMapping.get(e);
    if (!t)
      throw new Error("Internal error: Node not found in D3GraphEngine");
    return t;
  }
  _getMappedEdge(e) {
    this.refresh();
    const t = this.edgeMapping.get(e);
    if (!t)
      throw new Error("Internal error: Edge not found in D3GraphEngine");
    return t;
  }
};
fu.type = "d3", fu.maxDimensions = 3;
let ih = fu;
const yI = Ie({
  ...vn.shape,
  pos: Er(V(), nt(V()).min(2).max(3)).or(Ke()).default(null),
  maxIter: V().positive().default(100),
  jitterTolerance: V().positive().default(1),
  scalingRatio: V().positive().default(2),
  gravity: V().positive().default(1),
  distributedAction: vt().default(!1),
  strongGravity: vt().default(!1),
  nodeMass: Er(V(), V()).or(Ke()).default(null),
  nodeSize: Er(V(), V()).or(Ke()).default(null),
  weightPath: qe().or(Ke()).default(null),
  dissuadeHubs: vt().default(!1),
  linlog: vt().default(!1),
  seed: V().or(Ke()).default(null),
  dim: V().default(2)
}), du = class du extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = yI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = JA(
      { nodes: e, edges: t },
      this.config.pos,
      this.config.maxIter,
      this.config.jitterTolerance,
      this.config.scalingRatio,
      this.config.gravity,
      this.config.distributedAction,
      this.config.strongGravity,
      this.config.nodeMass,
      this.config.nodeSize,
      this.config.weightPath,
      this.config.dissuadeHubs,
      this.config.linlog,
      this.config.seed,
      this.config.dim
    );
  }
};
du.type = "forceatlas2", du.maxDimensions = 3;
let oh = du;
const bI = Ie({
  ...vn.shape,
  dist: Er(V(), Er(V(), V())).or(Ke()).default(null),
  pos: Er(V(), nt(V()).min(1).max(3)).or(Ke()).default(null),
  weightProperty: qe().optional(),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(3)
}), pu = class pu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 50, this.config = bI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = WA(
      { nodes: e, edges: t },
      this.config.dist,
      this.config.pos,
      this.config.weightProperty,
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
pu.type = "kamada-kawai", pu.maxDimensions = 3;
let sh = pu;
const wI = Ie({
  ...vn.shape,
  // subsetKey: z.string().or(z.record(z.number(), z.array(z.string().or(z.number())))),
  subsetKey: Er(qe(), nt(qe().or(V()))),
  align: Bt(["vertical", "horizontal"]).default("vertical"),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null)
}), gu = class gu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 40, this.config = wI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = Gm(
      { nodes: e, edges: t },
      this.config.subsetKey,
      this.config.align,
      this.config.scale,
      this.config.center
    );
  }
};
gu.type = "multipartite", gu.maxDimensions = 2;
let ah = gu;
var Na = { exports: {} }, lo = { exports: {} }, _c, U0;
function iv() {
  return U0 || (U0 = 1, _c = function(e) {
    return e === 0 ? "x" : e === 1 ? "y" : e === 2 ? "z" : "c" + (e + 1);
  }), _c;
}
var yc, Z0;
function bo() {
  if (Z0) return yc;
  Z0 = 1;
  const n = iv();
  return yc = function(t) {
    return r;
    function r(o, a) {
      let u = a && a.indent || 0, h = a && a.join !== void 0 ? a.join : `
`, c = Array(u + 1).join(" "), f = [];
      for (let d = 0; d < t; ++d) {
        let g = n(d), v = d === 0 ? "" : c;
        f.push(v + o.replace(/{var}/g, g));
      }
      return f.join(h);
    }
  }, yc;
}
var q0;
function xI() {
  if (q0) return lo.exports;
  q0 = 1;
  const n = bo();
  lo.exports = e, lo.exports.generateCreateBodyFunctionBody = t, lo.exports.getVectorCode = o, lo.exports.getBodyCode = r;
  function e(a, u) {
    let h = t(a, u), { Body: c } = new Function(h)();
    return c;
  }
  function t(a, u) {
    return `
${o(a, u)}
${r(a)}
return {Body: Body, Vector: Vector};
`;
  }
  function r(a) {
    let u = n(a), h = u("{var}", { join: ", " });
    return `
function Body(${h}) {
  this.isPinned = false;
  this.pos = new Vector(${h});
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

Body.prototype.setPosition = function (${h}) {
  ${u("this.pos.{var} = {var} || 0;", { indent: 2 })}
};`;
  }
  function o(a, u) {
    let h = n(a), c = "";
    return u && (c = `${h(`
	   var v{var};
	Object.defineProperty(this, '{var}', {
	  set: function(v) { 
	    if (!Number.isFinite(v)) throw new Error('Cannot set non-numbers to {var}');
	    v{var} = v; 
	  },
	  get: function() { return v{var}; }
	});`)}`), `function Vector(${h("{var}", { join: ", " })}) {
  ${c}
    if (typeof arguments[0] === 'object') {
      // could be another vector
      let v = arguments[0];
      ${h('if (!Number.isFinite(v.{var})) throw new Error("Expected value is not a finite number at Vector constructor ({var})");', { indent: 4 })}
      ${h("this.{var} = v.{var};", { indent: 4 })}
    } else {
      ${h('this.{var} = typeof {var} === "number" ? {var} : 0;', { indent: 4 })}
    }
  }
  
  Vector.prototype.reset = function () {
    ${h("this.{var} = ", { join: "" })}0;
  };`;
  }
  return lo.exports;
}
var Sr = { exports: {} }, H0;
function TI() {
  if (H0) return Sr.exports;
  H0 = 1;
  const n = bo(), e = iv();
  Sr.exports = t, Sr.exports.generateQuadTreeFunctionBody = r, Sr.exports.getInsertStackCode = c, Sr.exports.getQuadNodeCode = h, Sr.exports.isSamePosition = o, Sr.exports.getChildBodyCode = u, Sr.exports.setChildBodyCode = a;
  function t(f) {
    let d = r(f);
    return new Function(d)();
  }
  function r(f) {
    let d = n(f), g = Math.pow(2, f);
    return `
${c()}
${h(f)}
${o(f)}
${u(f)}
${a(f)}

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
${O("      node.")}
      node.body = null;
      node.mass = ${d("node.mass_{var} = ", { join: "" })}0;
      ${d("node.min_{var} = node.max_{var} = ", { join: "" })}0;
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
    ${d("var d{var};", { indent: 4 })}
    var r; 
    ${d("var f{var} = 0;", { indent: 4 })}
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
        ${d("d{var} = body.pos.{var} - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${d("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${d("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${d("d{var} * d{var}", { join: " + " })});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${d("f{var} += v * d{var};", { indent: 8 })}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${d("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${d("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${d("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${d("d{var} * d{var}", { join: " + " })});
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${e(0)} - node.min_${e(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${d("f{var} += v * d{var};", { indent: 10 })}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${_()}
        }
      }
    }

    ${d("sourceBody.force.{var} += f{var};", { indent: 4 })}
  }

  function insertBodies(bodies) {
    ${d("var {var}min = Number.MAX_VALUE;", { indent: 4 })}
    ${d("var {var}max = Number.MIN_VALUE;", { indent: 4 })}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${d("if (pos.{var} < {var}min) {var}min = pos.{var};", { indent: 6 })}
      ${d("if (pos.{var} > {var}max) {var}max = pos.{var};", { indent: 6 })}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${d("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;", { indent: 4 })}

    currentInCache = 0;
    root = newNode();
    ${d("root.min_{var} = {var}min;", { indent: 4 })}
    ${d("root.max_{var} = {var}min + maxSideLength;", { indent: 4 })}

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
        ${d("var {var} = body.pos.{var};", { indent: 8 })}
        node.mass += body.mass;
        ${d("node.mass_{var} += body.mass * {var};", { indent: 8 })}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${d("var min_{var} = node.min_{var};", { indent: 8 })}
        ${d("var max_{var} = (min_{var} + node.max_{var}) / 2;", { indent: 8 })}

${b(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${d("child.min_{var} = min_{var};", { indent: 10 })}
          ${d("child.max_{var} = max_{var};", { indent: 10 })}
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
            ${d("var d{var} = (node.max_{var} - node.min_{var}) * offset;", { indent: 12 })}

            ${d("oldBody.pos.{var} = node.min_{var} + d{var};", { indent: 12 })}
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
    function b(E) {
      let S = [], k = Array(E + 1).join(" ");
      for (let C = 0; C < f; ++C)
        S.push(k + `if (${e(C)} > max_${e(C)}) {`), S.push(k + `  quadIdx = quadIdx + ${Math.pow(2, C)};`), S.push(k + `  min_${e(C)} = max_${e(C)};`), S.push(k + `  max_${e(C)} = node.max_${e(C)};`), S.push(k + "}");
      return S.join(`
`);
    }
    function _() {
      let E = Array(11).join(" "), S = [];
      for (let k = 0; k < g; ++k)
        S.push(E + `if (node.quad${k}) {`), S.push(E + `  queue[pushIdx] = node.quad${k};`), S.push(E + "  queueLength += 1;"), S.push(E + "  pushIdx += 1;"), S.push(E + "}");
      return S.join(`
`);
    }
    function O(E) {
      let S = [];
      for (let k = 0; k < g; ++k)
        S.push(`${E}quad${k} = null;`);
      return S.join(`
`);
    }
  }
  function o(f) {
    let d = n(f);
    return `
  function isSamePosition(point1, point2) {
    ${d("var d{var} = Math.abs(point1.{var} - point2.{var});", { indent: 2 })}
  
    return ${d("d{var} < 1e-8", { join: " && " })};
  }  
`;
  }
  function a(f) {
    var d = Math.pow(2, f);
    return `
function setChild(node, idx, child) {
  ${g()}
}`;
    function g() {
      let v = [];
      for (let b = 0; b < d; ++b) {
        let _ = b === 0 ? "  " : "  else ";
        v.push(`${_}if (idx === ${b}) node.quad${b} = child;`);
      }
      return v.join(`
`);
    }
  }
  function u(f) {
    return `function getChild(node, idx) {
${d()}
  return null;
}`;
    function d() {
      let g = [], v = Math.pow(2, f);
      for (let b = 0; b < v; ++b)
        g.push(`  if (idx === ${b}) return node.quad${b};`);
      return g.join(`
`);
    }
  }
  function h(f) {
    let d = n(f), g = Math.pow(2, f);
    var v = `
function QuadNode() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain bodies:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
${b("  this.")}

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  ${d("this.mass_{var} = 0;", { indent: 2 })}

  // bounding box coordinates
  ${d("this.min_{var} = 0;", { indent: 2 })}
  ${d("this.max_{var} = 0;", { indent: 2 })}
}
`;
    return v;
    function b(_) {
      let O = [];
      for (let E = 0; E < g; ++E)
        O.push(`${_}quad${E} = null;`);
      return O.join(`
`);
    }
  }
  function c() {
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
  return Sr.exports;
}
var Ra = { exports: {} }, W0;
function SI() {
  if (W0) return Ra.exports;
  W0 = 1, Ra.exports = e, Ra.exports.generateFunctionBody = t;
  const n = bo();
  function e(r) {
    let o = t(r);
    return new Function("bodies", "settings", "random", o);
  }
  function t(r) {
    let o = n(r);
    return `
  var boundingBox = {
    ${o("min_{var}: 0, max_{var}: 0,", { indent: 4 })}
  };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset: resetBoundingBox,

    getBestNewPosition: function (neighbors) {
      var ${o("base_{var} = 0", { join: ", " })};

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          let neighborPos = neighbors[i].pos;
          ${o("base_{var} += neighborPos.{var};", { indent: 10 })}
        }

        ${o("base_{var} /= neighbors.length;", { indent: 8 })}
      } else {
        ${o("base_{var} = (boundingBox.min_{var} + boundingBox.max_{var}) / 2;", { indent: 8 })}
      }

      var springLength = settings.springLength;
      return {
        ${o("{var}: base_{var} + (random.nextDouble() - 0.5) * springLength,", { indent: 8 })}
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) return; // No bodies - no borders.

    ${o("var max_{var} = -Infinity;", { indent: 4 })}
    ${o("var min_{var} = Infinity;", { indent: 4 })}

    while(i--) {
      // this is O(n), it could be done faster with quadtree, if we check the root node bounds
      var bodyPos = bodies[i].pos;
      ${o("if (bodyPos.{var} < min_{var}) min_{var} = bodyPos.{var};", { indent: 6 })}
      ${o("if (bodyPos.{var} > max_{var}) max_{var} = bodyPos.{var};", { indent: 6 })}
    }

    ${o("boundingBox.min_{var} = min_{var};", { indent: 4 })}
    ${o("boundingBox.max_{var} = max_{var};", { indent: 4 })}
  }

  function resetBoundingBox() {
    ${o("boundingBox.min_{var} = boundingBox.max_{var} = 0;", { indent: 4 })}
  }
`;
  }
  return Ra.exports;
}
var za = { exports: {} }, G0;
function CI() {
  if (G0) return za.exports;
  G0 = 1;
  const n = bo();
  za.exports = e, za.exports.generateCreateDragForceFunctionBody = t;
  function e(r) {
    let o = t(r);
    return new Function("options", o);
  }
  function t(r) {
    return `
  if (!Number.isFinite(options.dragCoefficient)) throw new Error('dragCoefficient is not a finite number');

  return {
    update: function(body) {
      ${n(r)("body.force.{var} -= options.dragCoefficient * body.velocity.{var};", { indent: 6 })}
    }
  };
`;
  }
  return za.exports;
}
var Da = { exports: {} }, j0;
function MI() {
  if (j0) return Da.exports;
  j0 = 1;
  const n = bo();
  Da.exports = e, Da.exports.generateCreateSpringForceFunctionBody = t;
  function e(r) {
    let o = t(r);
    return new Function("options", "random", o);
  }
  function t(r) {
    let o = n(r);
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
      ${o("var d{var} = body2.pos.{var} - body1.pos.{var};", { indent: 6 })}
      var r = Math.sqrt(${o("d{var} * d{var}", { join: " + " })});

      if (r === 0) {
        ${o("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 8 })}
        r = Math.sqrt(${o("d{var} * d{var}", { join: " + " })});
      }

      var d = r - length;
      var coefficient = ((spring.coefficient > 0) ? spring.coefficient : options.springCoefficient) * d / r;

      ${o("body1.force.{var} += coefficient * d{var}", { indent: 6 })};
      body1.springCount += 1;
      body1.springLength += r;

      ${o("body2.force.{var} -= coefficient * d{var}", { indent: 6 })};
      body2.springCount += 1;
      body2.springLength += r;
    }
  };
`;
  }
  return Da.exports;
}
var La = { exports: {} }, V0;
function EI() {
  if (V0) return La.exports;
  V0 = 1;
  const n = bo();
  La.exports = e, La.exports.generateIntegratorFunctionBody = t;
  function e(r) {
    let o = t(r);
    return new Function("bodies", "timeStep", "adaptiveTimeStepWeight", o);
  }
  function t(r) {
    let o = n(r);
    return `
  var length = bodies.length;
  if (length === 0) return 0;

  ${o("var d{var} = 0, t{var} = 0;", { indent: 2 })}

  for (var i = 0; i < length; ++i) {
    var body = bodies[i];
    if (body.isPinned) continue;

    if (adaptiveTimeStepWeight && body.springCount) {
      timeStep = (adaptiveTimeStepWeight * body.springLength/body.springCount);
    }

    var coeff = timeStep / body.mass;

    ${o("body.velocity.{var} += coeff * body.force.{var};", { indent: 4 })}
    ${o("var v{var} = body.velocity.{var};", { indent: 4 })}
    var v = Math.sqrt(${o("v{var} * v{var}", { join: " + " })});

    if (v > 1) {
      // We normalize it so that we move within timeStep range. 
      // for the case when v <= 1 - we let velocity to fade out.
      ${o("body.velocity.{var} = v{var} / v;", { indent: 6 })}
    }

    ${o("d{var} = timeStep * body.velocity.{var};", { indent: 4 })}

    ${o("body.pos.{var} += d{var};", { indent: 4 })}

    ${o("t{var} += Math.abs(d{var});", { indent: 4 })}
  }

  return (${o("t{var} * t{var}", { join: " + " })})/length;
`;
  }
  return La.exports;
}
var bc, K0;
function AI() {
  if (K0) return bc;
  K0 = 1, bc = n;
  function n(e, t, r, o) {
    this.from = e, this.to = t, this.length = r, this.coefficient = o;
  }
  return bc;
}
var wc, J0;
function II() {
  if (J0) return wc;
  J0 = 1, wc = n;
  function n(e, t) {
    var r;
    if (e || (e = {}), t) {
      for (r in t)
        if (t.hasOwnProperty(r)) {
          var o = e.hasOwnProperty(r), a = typeof t[r], u = !o || typeof e[r] !== a;
          u ? e[r] = t[r] : a === "object" && (e[r] = n(e[r], t[r]));
        }
    }
    return e;
  }
  return wc;
}
var xc, Y0;
function Bh() {
  if (Y0) return xc;
  Y0 = 1, xc = function(r) {
    e(r);
    var o = n(r);
    return r.on = o.on, r.off = o.off, r.fire = o.fire, r;
  };
  function n(t) {
    var r = /* @__PURE__ */ Object.create(null);
    return {
      on: function(o, a, u) {
        if (typeof a != "function")
          throw new Error("callback is expected to be a function");
        var h = r[o];
        return h || (h = r[o] = []), h.push({ callback: a, ctx: u }), t;
      },
      off: function(o, a) {
        var u = typeof o > "u";
        if (u)
          return r = /* @__PURE__ */ Object.create(null), t;
        if (r[o]) {
          var h = typeof a != "function";
          if (h)
            delete r[o];
          else
            for (var c = r[o], f = 0; f < c.length; ++f)
              c[f].callback === a && c.splice(f, 1);
        }
        return t;
      },
      fire: function(o) {
        var a = r[o];
        if (!a)
          return t;
        var u;
        arguments.length > 1 && (u = Array.prototype.splice.call(arguments, 1));
        for (var h = 0; h < a.length; ++h) {
          var c = a[h];
          c.callback.apply(c.ctx, u);
        }
        return t;
      }
    };
  }
  function e(t) {
    if (!t)
      throw new Error("Eventify cannot use falsy object as events subject");
    for (var r = ["on", "fire", "off"], o = 0; o < r.length; ++o)
      if (t.hasOwnProperty(r[o]))
        throw new Error("Subject cannot be eventified, since it already has property '" + r[o] + "'");
  }
  return xc;
}
var jo = { exports: {} }, Q0;
function PI() {
  if (Q0) return jo.exports;
  Q0 = 1, jo.exports = n, jo.exports.random = n, jo.exports.randomIterator = h;
  function n(c) {
    var f = typeof c == "number" ? c : +/* @__PURE__ */ new Date();
    return new e(f);
  }
  function e(c) {
    this.seed = c;
  }
  e.prototype.next = u, e.prototype.nextDouble = a, e.prototype.uniform = a, e.prototype.gaussian = t, e.prototype.random = a;
  function t() {
    var c, f, d;
    do
      f = this.nextDouble() * 2 - 1, d = this.nextDouble() * 2 - 1, c = f * f + d * d;
    while (c >= 1 || c === 0);
    return f * Math.sqrt(-2 * Math.log(c) / c);
  }
  e.prototype.levy = r;
  function r() {
    var c = 1.5, f = Math.pow(
      o(1 + c) * Math.sin(Math.PI * c / 2) / (o((1 + c) / 2) * c * Math.pow(2, (c - 1) / 2)),
      1 / c
    );
    return this.gaussian() * f / Math.pow(Math.abs(this.gaussian()), 1 / c);
  }
  function o(c) {
    return Math.sqrt(2 * Math.PI / c) * Math.pow(1 / Math.E * (c + 1 / (12 * c - 1 / (10 * c))), c);
  }
  function a() {
    var c = this.seed;
    return c = c + 2127912214 + (c << 12) & 4294967295, c = (c ^ 3345072700 ^ c >>> 19) & 4294967295, c = c + 374761393 + (c << 5) & 4294967295, c = (c + 3550635116 ^ c << 9) & 4294967295, c = c + 4251993797 + (c << 3) & 4294967295, c = (c ^ 3042594569 ^ c >>> 16) & 4294967295, this.seed = c, (c & 268435455) / 268435456;
  }
  function u(c) {
    return Math.floor(this.nextDouble() * c);
  }
  function h(c, f) {
    var d = f || n();
    if (typeof d.next != "function")
      throw new Error("customRandom does not match expected API: next() function is missing");
    return {
      /**
       * Visits every single element of a collection once, in a random order.
       * Note: collection is modified in place.
       */
      forEach: v,
      /**
       * Shuffles array randomly, in place.
       */
      shuffle: g
    };
    function g() {
      var b, _, O;
      for (b = c.length - 1; b > 0; --b)
        _ = d.next(b + 1), O = c[_], c[_] = c[b], c[b] = O;
      return c;
    }
    function v(b) {
      var _, O, E;
      for (_ = c.length - 1; _ > 0; --_)
        O = d.next(_ + 1), E = c[O], c[O] = c[_], c[_] = E, b(E);
      c.length && b(c[0]);
    }
  }
  return jo.exports;
}
var Tc, X0;
function eg() {
  if (X0) return Tc;
  X0 = 1, Tc = h;
  var n = xI(), e = TI(), t = SI(), r = CI(), o = MI(), a = EI(), u = {};
  function h(d) {
    var g = AI(), v = II(), b = Bh();
    if (d) {
      if (d.springCoeff !== void 0) throw new Error("springCoeff was renamed to springCoefficient");
      if (d.dragCoeff !== void 0) throw new Error("dragCoeff was renamed to dragCoefficient");
    }
    d = v(d, {
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
    var _ = u[d.dimensions];
    if (!_) {
      var O = d.dimensions;
      _ = {
        Body: n(O, d.debug),
        createQuadTree: e(O),
        createBounds: t(O),
        createDragForce: r(O),
        createSpringForce: o(O),
        integrate: a(O)
      }, u[O] = _;
    }
    var E = _.Body, S = _.createQuadTree, k = _.createBounds, C = _.createDragForce, A = _.createSpringForce, N = _.integrate, L = (ae) => new E(ae), F = PI().random(42), H = [], se = [], be = S(d, F), ge = k(H, d, F), pe = A(d, F), Je = C(d), Le = 0, rt = [], We = /* @__PURE__ */ new Map(), te = 0;
    ce("nbody", Re), ce("spring", Ve);
    var oe = {
      /**
       * Array of bodies, registered with current simulator
       *
       * Note: To add new body, use addBody() method. This property is only
       * exposed for testing/performance purposes.
       */
      bodies: H,
      quadTree: be,
      /**
       * Array of springs, registered with current simulator
       *
       * Note: To add new spring, use addSpring() method. This property is only
       * exposed for testing/performance purposes.
       */
      springs: se,
      /**
       * Returns settings with which current simulator was initialized
       */
      settings: d,
      /**
       * Adds a new force to simulation
       */
      addForce: ce,
      /**
       * Removes a force from the simulation.
       */
      removeForce: ve,
      /**
       * Returns a map of all registered forces.
       */
      getForces: xe,
      /**
       * Performs one step of force simulation.
       *
       * @returns {boolean} true if system is considered stable; False otherwise.
       */
      step: function() {
        for (var ae = 0; ae < rt.length; ++ae)
          rt[ae](te);
        var ee = N(H, d.timeStep, d.adaptiveTimeStepWeight);
        return te += 1, ee;
      },
      /**
       * Adds body to the system
       *
       * @param {ngraph.physics.primitives.Body} body physical body
       *
       * @returns {ngraph.physics.primitives.Body} added body
       */
      addBody: function(ae) {
        if (!ae)
          throw new Error("Body is required");
        return H.push(ae), ae;
      },
      /**
       * Adds body to the system at given position
       *
       * @param {Object} pos position of a body
       *
       * @returns {ngraph.physics.primitives.Body} added body
       */
      addBodyAt: function(ae) {
        if (!ae)
          throw new Error("Body position is required");
        var ee = L(ae);
        return H.push(ee), ee;
      },
      /**
       * Removes body from the system
       *
       * @param {ngraph.physics.primitives.Body} body to remove
       *
       * @returns {Boolean} true if body found and removed. falsy otherwise;
       */
      removeBody: function(ae) {
        if (ae) {
          var ee = H.indexOf(ae);
          if (!(ee < 0))
            return H.splice(ee, 1), H.length === 0 && ge.reset(), !0;
        }
      },
      /**
       * Adds a spring to this simulation.
       *
       * @returns {Object} - a handle for a spring. If you want to later remove
       * spring pass it to removeSpring() method.
       */
      addSpring: function(ae, ee, U, G) {
        if (!ae || !ee)
          throw new Error("Cannot add null spring to force simulator");
        typeof U != "number" && (U = -1);
        var J = new g(ae, ee, U, G >= 0 ? G : -1);
        return se.push(J), J;
      },
      /**
       * Returns amount of movement performed on last step() call
       */
      getTotalMovement: function() {
        return Le;
      },
      /**
       * Removes spring from the system
       *
       * @param {Object} spring to remove. Spring is an object returned by addSpring
       *
       * @returns {Boolean} true if spring found and removed. falsy otherwise;
       */
      removeSpring: function(ae) {
        if (ae) {
          var ee = se.indexOf(ae);
          if (ee > -1)
            return se.splice(ee, 1), !0;
        }
      },
      getBestNewBodyPosition: function(ae) {
        return ge.getBestNewPosition(ae);
      },
      /**
       * Returns bounding box which covers all bodies
       */
      getBBox: re,
      getBoundingBox: re,
      invalidateBBox: function() {
        console.warn("invalidateBBox() is deprecated, bounds always recomputed on `getBBox()` call");
      },
      // TODO: Move the force specific stuff to force
      gravity: function(ae) {
        return ae !== void 0 ? (d.gravity = ae, be.options({ gravity: ae }), this) : d.gravity;
      },
      theta: function(ae) {
        return ae !== void 0 ? (d.theta = ae, be.options({ theta: ae }), this) : d.theta;
      },
      /**
       * Returns pseudo-random number generator instance.
       */
      random: F
    };
    return c(d, oe), b(oe), oe;
    function re() {
      return ge.update(), ge.box;
    }
    function ce(ae, ee) {
      if (We.has(ae)) throw new Error("Force " + ae + " is already added");
      We.set(ae, ee), rt.push(ee);
    }
    function ve(ae) {
      var ee = rt.indexOf(We.get(ae));
      ee < 0 || (rt.splice(ee, 1), We.delete(ae));
    }
    function xe() {
      return We;
    }
    function Re() {
      if (H.length !== 0) {
        be.insertBodies(H);
        for (var ae = H.length; ae--; ) {
          var ee = H[ae];
          ee.isPinned || (ee.reset(), be.updateBodyForce(ee), Je.update(ee));
        }
      }
    }
    function Ve() {
      for (var ae = se.length; ae--; )
        pe.update(se[ae]);
    }
  }
  function c(d, g) {
    for (var v in d)
      f(d, g, v);
  }
  function f(d, g, v) {
    if (d.hasOwnProperty(v) && typeof g[v] != "function") {
      var b = Number.isFinite(d[v]);
      b ? g[v] = function(_) {
        if (_ !== void 0) {
          if (!Number.isFinite(_)) throw new Error("Value of " + v + " should be a valid number.");
          return d[v] = _, g;
        }
        return d[v];
      } : g[v] = function(_) {
        return _ !== void 0 ? (d[v] = _, g) : d[v];
      };
    }
  }
  return Tc;
}
var tg;
function OI() {
  if (tg) return Na.exports;
  tg = 1, Na.exports = e, Na.exports.simulator = eg();
  var n = Bh();
  function e(r, o) {
    if (!r)
      throw new Error("Graph structure cannot be undefined");
    var a = o && o.createSimulator || eg(), u = a(o);
    if (Array.isArray(o)) throw new Error("Physics settings is expected to be an object");
    var h = r.version > 19 ? We : rt;
    o && typeof o.nodeMass == "function" && (h = o.nodeMass);
    var c = /* @__PURE__ */ new Map(), f = {}, d = 0, g = u.settings.springTransform || t;
    L(), C();
    var v = !1, b = {
      /**
       * Performs one step of iterative layout algorithm
       *
       * @returns {boolean} true if the system should be considered stable; False otherwise.
       * The system is stable if no further call to `step()` can improve the layout.
       */
      step: function() {
        if (d === 0)
          return _(!0), !0;
        var te = u.step();
        b.lastMove = te, b.fire("step");
        var oe = te / d, re = oe <= 0.01;
        return _(re), re;
      },
      /**
       * For a given `nodeId` returns position
       */
      getNodePosition: function(te) {
        return Le(te).pos;
      },
      /**
       * Sets position of a node to a given coordinates
       * @param {string} nodeId node identifier
       * @param {number} x position of a node
       * @param {number} y position of a node
       * @param {number=} z position of node (only if applicable to body)
       */
      setNodePosition: function(te) {
        var oe = Le(te);
        oe.setPosition.apply(oe, Array.prototype.slice.call(arguments, 1));
      },
      /**
       * @returns {Object} Link position by link id
       * @returns {Object.from} {x, y} coordinates of link start
       * @returns {Object.to} {x, y} coordinates of link end
       */
      getLinkPosition: function(te) {
        var oe = f[te];
        if (oe)
          return {
            from: oe.from.pos,
            to: oe.to.pos
          };
      },
      /**
       * @returns {Object} area required to fit in the graph. Object contains
       * `x1`, `y1` - top left coordinates
       * `x2`, `y2` - bottom right coordinates
       */
      getGraphRect: function() {
        return u.getBBox();
      },
      /**
       * Iterates over each body in the layout simulator and performs a callback(body, nodeId)
       */
      forEachBody: O,
      /*
       * Requests layout algorithm to pin/unpin node to its current position
       * Pinned nodes should not be affected by layout algorithm and always
       * remain at their position
       */
      pinNode: function(te, oe) {
        var re = Le(te.id);
        re.isPinned = !!oe;
      },
      /**
       * Checks whether given graph's node is currently pinned
       */
      isNodePinned: function(te) {
        return Le(te.id).isPinned;
      },
      /**
       * Request to release all resources
       */
      dispose: function() {
        r.off("changed", N), b.fire("disposed");
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
      getSpring: S,
      /**
       * Returns length of cumulative force vector. The closer this to zero - the more stable the system is
       */
      getForceVectorLength: E,
      /**
       * [Read only] Gets current physics simulator
       */
      simulator: u,
      /**
       * Gets the graph that was used for layout
       */
      graph: r,
      /**
       * Gets amount of movement performed during last step operation
       */
      lastMove: 0
    };
    return n(b), b;
    function _(te) {
      v !== te && (v = te, A(te));
    }
    function O(te) {
      c.forEach(te);
    }
    function E() {
      var te = 0, oe = 0;
      return O(function(re) {
        te += Math.abs(re.force.x), oe += Math.abs(re.force.y);
      }), Math.sqrt(te * te + oe * oe);
    }
    function S(te, oe) {
      var re;
      if (oe === void 0)
        typeof te != "object" ? re = te : re = te.id;
      else {
        var ce = r.hasLink(te, oe);
        if (!ce) return;
        re = ce.id;
      }
      return f[re];
    }
    function k(te) {
      return c.get(te);
    }
    function C() {
      r.on("changed", N);
    }
    function A(te) {
      b.fire("stable", te);
    }
    function N(te) {
      for (var oe = 0; oe < te.length; ++oe) {
        var re = te[oe];
        re.changeType === "add" ? (re.node && F(re.node.id), re.link && se(re.link)) : re.changeType === "remove" && (re.node && H(re.node), re.link && be(re.link));
      }
      d = r.getNodesCount();
    }
    function L() {
      d = 0, r.forEachNode(function(te) {
        F(te.id), d += 1;
      }), r.forEachLink(se);
    }
    function F(te) {
      var oe = c.get(te);
      if (!oe) {
        var re = r.getNode(te);
        if (!re)
          throw new Error("initBody() was called with unknown node id");
        var ce = re.position;
        if (!ce) {
          var ve = ge(re);
          ce = u.getBestNewBodyPosition(ve);
        }
        oe = u.addBodyAt(ce), oe.id = te, c.set(te, oe), pe(te), Je(re) && (oe.isPinned = !0);
      }
    }
    function H(te) {
      var oe = te.id, re = c.get(oe);
      re && (c.delete(oe), u.removeBody(re));
    }
    function se(te) {
      pe(te.fromId), pe(te.toId);
      var oe = c.get(te.fromId), re = c.get(te.toId), ce = u.addSpring(oe, re, te.length);
      g(te, ce), f[te.id] = ce;
    }
    function be(te) {
      var oe = f[te.id];
      if (oe) {
        var re = r.getNode(te.fromId), ce = r.getNode(te.toId);
        re && pe(re.id), ce && pe(ce.id), delete f[te.id], u.removeSpring(oe);
      }
    }
    function ge(te) {
      var oe = [];
      if (!te.links)
        return oe;
      for (var re = Math.min(te.links.length, 2), ce = 0; ce < re; ++ce) {
        var ve = te.links[ce], xe = ve.fromId !== te.id ? c.get(ve.fromId) : c.get(ve.toId);
        xe && xe.pos && oe.push(xe);
      }
      return oe;
    }
    function pe(te) {
      var oe = c.get(te);
      if (oe.mass = h(te), Number.isNaN(oe.mass))
        throw new Error("Node mass should be a number");
    }
    function Je(te) {
      return te && (te.isPinned || te.data && te.data.isPinned);
    }
    function Le(te) {
      var oe = c.get(te);
      return oe || (F(te), oe = c.get(te)), oe;
    }
    function rt(te) {
      var oe = r.getLinks(te);
      return oe ? 1 + oe.length / 3 : 1;
    }
    function We(te) {
      var oe = r.getLinks(te);
      return oe ? 1 + oe.size / 3 : 1;
    }
  }
  function t() {
  }
  return Na.exports;
}
var kI = OI();
const $I = /* @__PURE__ */ Cs(kI);
var Sc, ng;
function NI() {
  if (ng) return Sc;
  ng = 1, Sc = e;
  var n = Bh();
  function e(u) {
    if (u = u || {}, "uniqueLinkId" in u && (console.warn(
      "ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\nUse `multigraph` option instead\n",
      `
`,
      `Note: there is also change in default behavior: From now on each graph
is considered to be not a multigraph by default (each edge is unique).`
    ), u.multigraph = u.uniqueLinkId), u.multigraph === void 0 && (u.multigraph = !1), typeof Map != "function")
      throw new Error("ngraph.graph requires `Map` to be defined. Please polyfill it before using ngraph");
    var h = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), f = {}, d = 0, g = u.multigraph ? be : se, v = [], b = xe, _ = xe, O = xe, E = xe, S = {
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
      addNode: N,
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
      addLink: H,
      /**
       * Removes link from the graph. If link does not exist does nothing.
       *
       * @param link - object returned by addLink() or getLinks() methods.
       *
       * @returns true if link was removed; false otherwise.
       */
      removeLink: Le,
      /**
       * Removes node with given id from the graph. If node does not exist in the graph
       * does nothing.
       *
       * @param nodeId node's identifier passed to addNode() function.
       *
       * @returns true if node was removed; false otherwise.
       */
      removeNode: F,
      /**
       * Gets node with given identifier. If node does not exist undefined value is returned.
       *
       * @param nodeId requested node identifier;
       *
       * @return {node} in with requested identifier or undefined if no such node exists.
       */
      getNode: L,
      /**
       * Gets number of nodes in this graph.
       *
       * @return number of nodes in the graph.
       */
      getNodeCount: ge,
      /**
       * Gets total number of links in the graph.
       */
      getLinkCount: pe,
      /**
       * Gets total number of links in the graph.
       */
      getEdgeCount: pe,
      /**
       * Synonym for `getLinkCount()`
       */
      getLinksCount: pe,
      /**
       * Synonym for `getNodeCount()`
       */
      getNodesCount: ge,
      /**
       * Gets all links (inbound and outbound) from the node with given id.
       * If node with given id is not found null is returned.
       *
       * @param nodeId requested node identifier.
       *
       * @return Set of links from and to requested node if such node exists;
       *   otherwise null is returned.
       */
      getLinks: Je,
      /**
       * Invokes callback on each node of the graph.
       *
       * @param {Function(node)} callback Function to be invoked. The function
       *   is passed one argument: visited node.
       */
      forEachNode: ae,
      /**
       * Invokes callback on every linked (adjacent) node to the given one.
       *
       * @param nodeId Identifier of the requested node.
       * @param {Function(node, link)} callback Function to be called on all linked nodes.
       *   The function is passed two parameters: adjacent node and link object itself.
       * @param oriented if true graph treated as oriented.
       */
      forEachLinkedNode: re,
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
      forEachLink: oe,
      /**
       * Suspend all notifications about graph changes until
       * endUpdate is called.
       */
      beginUpdate: O,
      /**
       * Resumes all notifications about graph changes and fires
       * graph 'changed' event in case there are any pending changes.
       */
      endUpdate: E,
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
      hasLink: We,
      /**
       * Detects whether there is a node with given id
       * 
       * Operation complexity is O(1)
       * NOTE: this function is synonym for getNode()
       *
       * @returns node if there is one; Falsy value otherwise.
       */
      hasNode: L,
      /**
       * Gets an edge between two nodes.
       * Operation complexity is O(n) where n - number of links of a node.
       *
       * @param {string} fromId link start identifier
       * @param {string} toId link end identifier
       *
       * @returns link if there is one; undefined otherwise.
       */
      getLink: We
    };
    return n(S), k(), S;
    function k() {
      var ee = S.on;
      S.on = U;
      function U() {
        return S.beginUpdate = O = Re, S.endUpdate = E = Ve, b = C, _ = A, S.on = ee, ee.apply(S, arguments);
      }
    }
    function C(ee, U) {
      v.push({
        link: ee,
        changeType: U
      });
    }
    function A(ee, U) {
      v.push({
        node: ee,
        changeType: U
      });
    }
    function N(ee, U) {
      if (ee === void 0)
        throw new Error("Invalid node identifier");
      O();
      var G = L(ee);
      return G ? (G.data = U, _(G, "update")) : (G = new t(ee, U), _(G, "add")), h.set(ee, G), E(), G;
    }
    function L(ee) {
      return h.get(ee);
    }
    function F(ee) {
      var U = L(ee);
      if (!U)
        return !1;
      O();
      var G = U.links;
      return G && (G.forEach(rt), U.links = null), h.delete(ee), _(U, "remove"), E(), !0;
    }
    function H(ee, U, G) {
      O();
      var J = L(ee) || N(ee), he = L(U) || N(U), we = g(ee, U, G), Ue = c.has(we.id);
      return c.set(we.id, we), r(J, we), ee !== U && r(he, we), b(we, Ue ? "update" : "add"), E(), we;
    }
    function se(ee, U, G) {
      var J = a(ee, U), he = c.get(J);
      return he ? (he.data = G, he) : new o(ee, U, G, J);
    }
    function be(ee, U, G) {
      var J = a(ee, U), he = f.hasOwnProperty(J);
      if (he || We(ee, U)) {
        he || (f[J] = 0);
        var we = "@" + ++f[J];
        J = a(ee + we, U + we);
      }
      return new o(ee, U, G, J);
    }
    function ge() {
      return h.size;
    }
    function pe() {
      return c.size;
    }
    function Je(ee) {
      var U = L(ee);
      return U ? U.links : null;
    }
    function Le(ee, U) {
      return U !== void 0 && (ee = We(ee, U)), rt(ee);
    }
    function rt(ee) {
      if (!ee || !c.get(ee.id)) return !1;
      O(), c.delete(ee.id);
      var U = L(ee.fromId), G = L(ee.toId);
      return U && U.links.delete(ee), G && G.links.delete(ee), b(ee, "remove"), E(), !0;
    }
    function We(ee, U) {
      if (!(ee === void 0 || U === void 0))
        return c.get(a(ee, U));
    }
    function te() {
      O(), ae(function(ee) {
        F(ee.id);
      }), E();
    }
    function oe(ee) {
      if (typeof ee == "function")
        for (var U = c.values(), G = U.next(); !G.done; ) {
          if (ee(G.value))
            return !0;
          G = U.next();
        }
    }
    function re(ee, U, G) {
      var J = L(ee);
      if (J && J.links && typeof U == "function")
        return G ? ve(J.links, ee, U) : ce(J.links, ee, U);
    }
    function ce(ee, U, G) {
      for (var J, he = ee.values(), we = he.next(); !we.done; ) {
        var Ue = we.value, wt = Ue.fromId === U ? Ue.toId : Ue.fromId;
        if (J = G(h.get(wt), Ue), J)
          return !0;
        we = he.next();
      }
    }
    function ve(ee, U, G) {
      for (var J, he = ee.values(), we = he.next(); !we.done; ) {
        var Ue = we.value;
        if (Ue.fromId === U && (J = G(h.get(Ue.toId), Ue), J))
          return !0;
        we = he.next();
      }
    }
    function xe() {
    }
    function Re() {
      d += 1;
    }
    function Ve() {
      d -= 1, d === 0 && v.length > 0 && (S.fire("changed", v), v.length = 0);
    }
    function ae(ee) {
      if (typeof ee != "function")
        throw new Error("Function is expected to iterate over graph nodes. You passed " + ee);
      for (var U = h.values(), G = U.next(); !G.done; ) {
        if (ee(G.value))
          return !0;
        G = U.next();
      }
    }
  }
  function t(u, h) {
    this.id = u, this.links = null, this.data = h;
  }
  function r(u, h) {
    u.links ? u.links.add(h) : u.links = /* @__PURE__ */ new Set([h]);
  }
  function o(u, h, c, f) {
    this.fromId = u, this.toId = h, this.data = c, this.id = f;
  }
  function a(u, h) {
    return u.toString() + "👉 " + h.toString();
  }
  return Sc;
}
var RI = NI();
const zI = /* @__PURE__ */ Cs(RI), mu = class mu extends _t {
  constructor() {
    super(), this.nodeMapping = /* @__PURE__ */ new Map(), this.edgeMapping = /* @__PURE__ */ new Map(), this._settled = !0, this.ngraph = zI(), this.ngraphLayout = $I(this.ngraph, { dimensions: 3 });
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async init() {
  }
  step() {
    this._settled = this.ngraphLayout.step();
  }
  get isSettled() {
    return this._settled;
  }
  addNode(e) {
    const t = this.ngraph.addNode(e.id, { parentNode: e });
    this.nodeMapping.set(e, t), this._settled = !1;
  }
  addEdge(e) {
    const t = this.ngraph.addLink(e.srcId, e.dstId, { parentEdge: this });
    this.edgeMapping.set(e, t), this._settled = !1;
  }
  getNodePosition(e) {
    const t = this._getMappedNode(e);
    return this.ngraphLayout.getNodePosition(t.id);
  }
  setNodePosition(e, t) {
    const r = this._getMappedNode(e), o = this.ngraphLayout.getNodePosition(r.id);
    o.x = t.x, o.y = t.y, o.z = t.z;
  }
  getEdgePosition(e) {
    const t = this._getMappedEdge(e), r = this.ngraphLayout.getLinkPosition(t.id);
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
    const t = this._getMappedNode(e);
    this.ngraphLayout.pinNode(t, !0);
  }
  unpin(e) {
    const t = this._getMappedNode(e);
    this.ngraphLayout.pinNode(t, !1);
  }
  _getMappedNode(e) {
    const t = this.nodeMapping.get(e);
    if (!t)
      throw new Error("Internal error: Node not found in NGraphEngine");
    return t;
  }
  _getMappedEdge(e) {
    const t = this.edgeMapping.get(e);
    if (!t)
      throw new Error("Internal error: Edge not found in NGraphEngine");
    return t;
  }
};
mu.type = "ngraph", mu.maxDimensions = 3;
let uh = mu;
const DI = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2)
}), vu = class vu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 70, this.config = DI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = DA(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
vu.type = "planar", vu.maxDimensions = 2;
let lh = vu;
const LI = Ie({
  ...vn.shape,
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2),
  seed: V().positive().or(Ke()).default(null)
}), _u = class _u extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = LI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = Rh(
      { nodes: e, edges: t },
      this.config.center,
      this.config.dim,
      this.config.seed
    );
  }
};
_u.type = "random", _u.maxDimensions = 3;
let ch = _u;
const BI = Ie({
  ...vn.shape,
  nlist: nt(nt(V())).or(Ke()).default(null),
  dim: V().default(2),
  center: nt(V()).length(2).or(Ke()).default(null),
  scale: V().positive().default(1)
}), yu = class yu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = BI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = PA(
      { nodes: e, edges: t },
      this.config.nlist,
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
yu.type = "shell", yu.maxDimensions = 2;
let hh = yu;
const FI = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2)
}), bu = class bu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = FI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = $A(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
bu.type = "spectral", bu.maxDimensions = 2;
let fh = bu;
const UI = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2),
  resolution: V().positive().default(0.35),
  equidistant: vt().default(!1)
}), wu = class wu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 80, this.config = UI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = NA(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim,
      this.config.resolution,
      this.config.equidistant
    );
  }
};
wu.type = "spiral", wu.maxDimensions = 2;
let dh = wu;
const ZI = Ie({
  ...vn.shape,
  k: V().or(Ke()).default(null),
  pos: Er(
    V(),
    nt(V())
  ).or(Ke()).default(null),
  fixed: nt(V()).or(Ke()).default(null),
  iterations: V().positive().default(50),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(3),
  seed: V().positive().or(Ke()).default(null)
}), xu = class xu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = ZI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = OA(
      { nodes: e, edges: t },
      this.config.k,
      this.config.pos,
      this.config.fixed,
      this.config.iterations,
      this.config.scale,
      this.config.center,
      this.config.dim,
      this.config.seed
    );
  }
};
xu.type = "spring", xu.maxDimensions = 3;
let ph = xu;
_t.register(ih);
_t.register(uh);
_t.register(dh);
_t.register(eh);
_t.register(hh);
_t.register(ch);
_t.register(ph);
_t.register(lh);
_t.register(sh);
_t.register(oh);
_t.register(Yc);
_t.register(fh);
_t.register(Qc);
_t.register(Xc);
_t.register(ah);
const rg = /* @__PURE__ */ new Map();
var Tu, ov;
class Fh {
  constructor(e) {
    ba(this, Tu);
    this.graph = e;
  }
  get type() {
    return this.constructor.type;
  }
  get namespace() {
    return this.constructor.namespace;
  }
  get results() {
    const e = {};
    for (const t of this.graph.nodes.values())
      Vn.set(e, `node.${t.id}`, t.algorithmResults);
    return e;
  }
  addNodeResult(e, t, r) {
    const o = rp(this, Tu, ov).call(this, t), a = this.graph.nodes.get(e);
    if (!a)
      throw new Error(`couldn't find nodeId '${e}' while trying to run algorithm '${this.type}'`);
    Vn.set(a, o, r);
  }
  addEdgeResult(e, t) {
    console.log("adding edge result", e, t);
  }
  addGraphResult(e, t) {
    console.log("adding graph result", e, t);
  }
  static register(e) {
    const t = e.type, r = e.namespace;
    return rg.set(`${r}:${t}`, e), e;
  }
  static get(e, t, r) {
    const o = rg.get(`${t}:${r}`);
    return o ? new o(e) : null;
  }
}
Tu = new WeakSet(), ov = function(e) {
  const t = [];
  return t.push("algorithmResults"), t.push(this.namespace), t.push(this.type), t.push(e), t;
};
const Su = class Su extends Fh {
  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    const e = this.graph, t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
    function a(f, d) {
      let g = f.get(d);
      g ?? (g = 0), g++, f.set(d, g);
    }
    for (const f of e.edges.values())
      a(t, f.srcId), a(r, f.dstId), a(o, f.srcId), a(o, f.dstId);
    const u = Math.max(...t.values()), h = Math.max(...r.values()), c = Math.max(...o.values());
    for (const f of e.nodes.values()) {
      const d = t.get(f.id) ?? 0, g = r.get(f.id) ?? 0, v = o.get(f.id) ?? 0;
      this.addNodeResult(f.id, "inDegree", d), this.addNodeResult(f.id, "outDegree", g), this.addNodeResult(f.id, "degree", v), this.addNodeResult(f.id, "inDegreePct", d / u), this.addNodeResult(f.id, "outDegreePct", g / h), this.addNodeResult(f.id, "degreePct", v / c);
    }
  }
};
Su.namespace = "graphty", Su.type = "degree";
let gh = Su;
Fh.register(gh);
class qI {
  constructor(e) {
    this.activeCameraController = null, this.activeInputHandler = null, this.controllers = /* @__PURE__ */ new Map(), this.inputs = /* @__PURE__ */ new Map(), this.scene = e;
  }
  registerCamera(e, t, r) {
    this.controllers.set(e, t), this.inputs.set(e, r);
  }
  activateCamera(e) {
    var o, a;
    const t = this.controllers.get(e), r = this.inputs.get(e);
    if (!t || !r) {
      console.warn(`Camera or input for key '${e}' not registered.`);
      return;
    }
    (o = this.activeInputHandler) == null || o.disable(), (a = this.activeCameraController) == null || a.camera.detachControl(), this.scene.activeCamera = t.camera, t.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), !0), r.enable(), this.activeCameraController = t, this.activeInputHandler = r;
  }
  zoomToBoundingBox(e, t) {
    var r;
    (r = this.activeCameraController) == null || r.zoomToBoundingBox(e, t);
  }
  update() {
    var e;
    (e = this.activeInputHandler) == null || e.update();
  }
}
class HI {
  constructor(e, t, r) {
    this.canvas = e, this.config = r, this.scene = t, this.scene.clearColor = new Za(0, 0, 0, 1), this.pivot = new Eg("pivot", this.scene), this.cameraDistance = 10, this.camera = new C5("camera", new kt(0, 0, -this.cameraDistance), this.scene), this.camera.parent = this.pivot, this.camera.lockedTarget = this.pivot, this.camera.inputs.clear(), this.scene.activeCamera = this.camera, this.camera.attachControl(e, !0);
  }
  rotate(e, t) {
    this.pivot.rotate(Yl.Y, -e * this.config.trackballRotationSpeed, Ql.LOCAL), this.pivot.rotate(Yl.X, -t * this.config.trackballRotationSpeed, Ql.LOCAL);
  }
  spin(e) {
    this.pivot.rotate(Yl.Z, e, Ql.LOCAL);
  }
  zoom(e) {
    this.cameraDistance = sp.Clamp(this.cameraDistance + e, this.config.minZoomDistance, this.config.maxZoomDistance);
  }
  updateCameraPosition() {
    this.camera.position.copyFrom(kt.Forward().scale(-this.cameraDistance));
  }
  zoomToBoundingBox(e, t) {
    const r = e.add(t).scale(0.5), o = t.subtract(e);
    this.pivot.position.copyFrom(r);
    const a = o.length();
    this.cameraDistance = sp.Clamp(a * 0.7, this.config.minZoomDistance, this.config.maxZoomDistance), this.updateCameraPosition();
  }
}
var Cc = { exports: {} };
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
var ig;
function WI() {
  return ig || (ig = 1, function(n) {
    (function(e, t, r, o) {
      var a = ["", "webkit", "Moz", "MS", "ms", "o"], u = t.createElement("div"), h = "function", c = Math.round, f = Math.abs, d = Date.now;
      function g(y, M, $) {
        return setTimeout(C(y, $), M);
      }
      function v(y, M, $) {
        return Array.isArray(y) ? (b(y, $[M], $), !0) : !1;
      }
      function b(y, M, $) {
        var Z;
        if (y)
          if (y.forEach)
            y.forEach(M, $);
          else if (y.length !== o)
            for (Z = 0; Z < y.length; )
              M.call($, y[Z], Z, y), Z++;
          else
            for (Z in y)
              y.hasOwnProperty(Z) && M.call($, y[Z], Z, y);
      }
      function _(y, M, $) {
        var Z = "DEPRECATED METHOD: " + M + `
` + $ + ` AT 
`;
        return function() {
          var ie = new Error("get-stack-trace"), fe = ie && ie.stack ? ie.stack.replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@") : "Unknown Stack Trace", ze = e.console && (e.console.warn || e.console.log);
          return ze && ze.call(e.console, Z, fe), y.apply(this, arguments);
        };
      }
      var O;
      typeof Object.assign != "function" ? O = function(M) {
        if (M === o || M === null)
          throw new TypeError("Cannot convert undefined or null to object");
        for (var $ = Object(M), Z = 1; Z < arguments.length; Z++) {
          var ie = arguments[Z];
          if (ie !== o && ie !== null)
            for (var fe in ie)
              ie.hasOwnProperty(fe) && ($[fe] = ie[fe]);
        }
        return $;
      } : O = Object.assign;
      var E = _(function(M, $, Z) {
        for (var ie = Object.keys($), fe = 0; fe < ie.length; )
          (!Z || Z && M[ie[fe]] === o) && (M[ie[fe]] = $[ie[fe]]), fe++;
        return M;
      }, "extend", "Use `assign`."), S = _(function(M, $) {
        return E(M, $, !0);
      }, "merge", "Use `assign`.");
      function k(y, M, $) {
        var Z = M.prototype, ie;
        ie = y.prototype = Object.create(Z), ie.constructor = y, ie._super = Z, $ && O(ie, $);
      }
      function C(y, M) {
        return function() {
          return y.apply(M, arguments);
        };
      }
      function A(y, M) {
        return typeof y == h ? y.apply(M && M[0] || o, M) : y;
      }
      function N(y, M) {
        return y === o ? M : y;
      }
      function L(y, M, $) {
        b(be(M), function(Z) {
          y.addEventListener(Z, $, !1);
        });
      }
      function F(y, M, $) {
        b(be(M), function(Z) {
          y.removeEventListener(Z, $, !1);
        });
      }
      function H(y, M) {
        for (; y; ) {
          if (y == M)
            return !0;
          y = y.parentNode;
        }
        return !1;
      }
      function se(y, M) {
        return y.indexOf(M) > -1;
      }
      function be(y) {
        return y.trim().split(/\s+/g);
      }
      function ge(y, M, $) {
        if (y.indexOf && !$)
          return y.indexOf(M);
        for (var Z = 0; Z < y.length; ) {
          if ($ && y[Z][$] == M || !$ && y[Z] === M)
            return Z;
          Z++;
        }
        return -1;
      }
      function pe(y) {
        return Array.prototype.slice.call(y, 0);
      }
      function Je(y, M, $) {
        for (var Z = [], ie = [], fe = 0; fe < y.length; ) {
          var ze = y[fe][M];
          ge(ie, ze) < 0 && Z.push(y[fe]), ie[fe] = ze, fe++;
        }
        return Z = Z.sort(function(At, Rt) {
          return At[M] > Rt[M];
        }), Z;
      }
      function Le(y, M) {
        for (var $, Z, ie = M[0].toUpperCase() + M.slice(1), fe = 0; fe < a.length; ) {
          if ($ = a[fe], Z = $ ? $ + ie : M, Z in y)
            return Z;
          fe++;
        }
        return o;
      }
      var rt = 1;
      function We() {
        return rt++;
      }
      function te(y) {
        var M = y.ownerDocument || y;
        return M.defaultView || M.parentWindow || e;
      }
      var oe = /mobile|tablet|ip(ad|hone|od)|android/i, re = "ontouchstart" in e, ce = Le(e, "PointerEvent") !== o, ve = re && oe.test(navigator.userAgent), xe = "touch", Re = "pen", Ve = "mouse", ae = "kinect", ee = 25, U = 1, G = 2, J = 4, he = 8, we = 1, Ue = 2, wt = 4, ke = 8, tt = 16, Nt = Ue | wt, xt = ke | tt, Nn = Nt | xt, Se = ["x", "y"], Ft = ["clientX", "clientY"];
      function Qe(y, M) {
        var $ = this;
        this.manager = y, this.callback = M, this.element = y.element, this.target = y.options.inputTarget, this.domHandler = function(Z) {
          A(y.options.enable, [y]) && $.handler(Z);
        }, this.init();
      }
      Qe.prototype = {
        /**
         * should handle the inputEvent data and trigger the callback
         * @virtual
         */
        handler: function() {
        },
        /**
         * bind the events
         */
        init: function() {
          this.evEl && L(this.element, this.evEl, this.domHandler), this.evTarget && L(this.target, this.evTarget, this.domHandler), this.evWin && L(te(this.element), this.evWin, this.domHandler);
        },
        /**
         * unbind the events
         */
        destroy: function() {
          this.evEl && F(this.element, this.evEl, this.domHandler), this.evTarget && F(this.target, this.evTarget, this.domHandler), this.evWin && F(te(this.element), this.evWin, this.domHandler);
        }
      };
      function yn(y) {
        var M, $ = y.options.inputClass;
        return $ ? M = $ : ce ? M = hr : ve ? M = zn : re ? M = To : M = Wt, new M(y, Rn);
      }
      function Rn(y, M, $) {
        var Z = $.pointers.length, ie = $.changedPointers.length, fe = M & U && Z - ie === 0, ze = M & (J | he) && Z - ie === 0;
        $.isFirst = !!fe, $.isFinal = !!ze, fe && (y.session = {}), $.eventType = M, wo(y, $), y.emit("hammer.input", $), y.recognize($), y.session.prevInput = $;
      }
      function wo(y, M) {
        var $ = y.session, Z = M.pointers, ie = Z.length;
        $.firstInput || ($.firstInput = P(M)), ie > 1 && !$.firstMultiple ? $.firstMultiple = P(M) : ie === 1 && ($.firstMultiple = !1);
        var fe = $.firstInput, ze = $.firstMultiple, Ct = ze ? ze.center : fe.center, At = M.center = z(Z);
        M.timeStamp = d(), M.deltaTime = M.timeStamp - fe.timeStamp, M.angle = Ae(Ct, At), M.distance = le(Ct, At), cr($, M), M.offsetDirection = Q(M.deltaX, M.deltaY);
        var Rt = W(M.deltaTime, M.deltaX, M.deltaY);
        M.overallVelocityX = Rt.x, M.overallVelocityY = Rt.y, M.overallVelocity = f(Rt.x) > f(Rt.y) ? Rt.x : Rt.y, M.scale = ze ? St(ze.pointers, Z) : 1, M.rotation = ze ? Be(ze.pointers, Z) : 0, M.maxPointers = $.prevInput ? M.pointers.length > $.prevInput.maxPointers ? M.pointers.length : $.prevInput.maxPointers : M.pointers.length, x($, M);
        var Ln = y.element;
        H(M.srcEvent.target, Ln) && (Ln = M.srcEvent.target), M.target = Ln;
      }
      function cr(y, M) {
        var $ = M.center, Z = y.offsetDelta || {}, ie = y.prevDelta || {}, fe = y.prevInput || {};
        (M.eventType === U || fe.eventType === J) && (ie = y.prevDelta = {
          x: fe.deltaX || 0,
          y: fe.deltaY || 0
        }, Z = y.offsetDelta = {
          x: $.x,
          y: $.y
        }), M.deltaX = ie.x + ($.x - Z.x), M.deltaY = ie.y + ($.y - Z.y);
      }
      function x(y, M) {
        var $ = y.lastInterval || M, Z = M.timeStamp - $.timeStamp, ie, fe, ze, Ct;
        if (M.eventType != he && (Z > ee || $.velocity === o)) {
          var At = M.deltaX - $.deltaX, Rt = M.deltaY - $.deltaY, Ln = W(Z, At, Rt);
          fe = Ln.x, ze = Ln.y, ie = f(Ln.x) > f(Ln.y) ? Ln.x : Ln.y, Ct = Q(At, Rt), y.lastInterval = M;
        } else
          ie = $.velocity, fe = $.velocityX, ze = $.velocityY, Ct = $.direction;
        M.velocity = ie, M.velocityX = fe, M.velocityY = ze, M.direction = Ct;
      }
      function P(y) {
        for (var M = [], $ = 0; $ < y.pointers.length; )
          M[$] = {
            clientX: c(y.pointers[$].clientX),
            clientY: c(y.pointers[$].clientY)
          }, $++;
        return {
          timeStamp: d(),
          pointers: M,
          center: z(M),
          deltaX: y.deltaX,
          deltaY: y.deltaY
        };
      }
      function z(y) {
        var M = y.length;
        if (M === 1)
          return {
            x: c(y[0].clientX),
            y: c(y[0].clientY)
          };
        for (var $ = 0, Z = 0, ie = 0; ie < M; )
          $ += y[ie].clientX, Z += y[ie].clientY, ie++;
        return {
          x: c($ / M),
          y: c(Z / M)
        };
      }
      function W(y, M, $) {
        return {
          x: M / y || 0,
          y: $ / y || 0
        };
      }
      function Q(y, M) {
        return y === M ? we : f(y) >= f(M) ? y < 0 ? Ue : wt : M < 0 ? ke : tt;
      }
      function le(y, M, $) {
        $ || ($ = Se);
        var Z = M[$[0]] - y[$[0]], ie = M[$[1]] - y[$[1]];
        return Math.sqrt(Z * Z + ie * ie);
      }
      function Ae(y, M, $) {
        $ || ($ = Se);
        var Z = M[$[0]] - y[$[0]], ie = M[$[1]] - y[$[1]];
        return Math.atan2(ie, Z) * 180 / Math.PI;
      }
      function Be(y, M) {
        return Ae(M[1], M[0], Ft) + Ae(y[1], y[0], Ft);
      }
      function St(y, M) {
        return le(M[0], M[1], Ft) / le(y[0], y[1], Ft);
      }
      var Kt = {
        mousedown: U,
        mousemove: G,
        mouseup: J
      }, ut = "mousedown", Te = "mousemove mouseup";
      function Wt() {
        this.evEl = ut, this.evWin = Te, this.pressed = !1, Qe.apply(this, arguments);
      }
      k(Wt, Qe, {
        /**
         * handle mouse events
         * @param {Object} ev
         */
        handler: function(M) {
          var $ = Kt[M.type];
          $ & U && M.button === 0 && (this.pressed = !0), $ & G && M.which !== 1 && ($ = J), this.pressed && ($ & J && (this.pressed = !1), this.callback(this.manager, $, {
            pointers: [M],
            changedPointers: [M],
            pointerType: Ve,
            srcEvent: M
          }));
        }
      });
      var xo = {
        pointerdown: U,
        pointermove: G,
        pointerup: J,
        pointercancel: he,
        pointerout: he
      }, oi = {
        2: xe,
        3: Re,
        4: Ve,
        5: ae
        // see https://twitter.com/jacobrossi/status/480596438489890816
      }, Pr = "pointerdown", Or = "pointermove pointerup pointercancel";
      e.MSPointerEvent && !e.PointerEvent && (Pr = "MSPointerDown", Or = "MSPointerMove MSPointerUp MSPointerCancel");
      function hr() {
        this.evEl = Pr, this.evWin = Or, Qe.apply(this, arguments), this.store = this.manager.session.pointerEvents = [];
      }
      k(hr, Qe, {
        /**
         * handle mouse events
         * @param {Object} ev
         */
        handler: function(M) {
          var $ = this.store, Z = !1, ie = M.type.toLowerCase().replace("ms", ""), fe = xo[ie], ze = oi[M.pointerType] || M.pointerType, Ct = ze == xe, At = ge($, M.pointerId, "pointerId");
          fe & U && (M.button === 0 || Ct) ? At < 0 && ($.push(M), At = $.length - 1) : fe & (J | he) && (Z = !0), !(At < 0) && ($[At] = M, this.callback(this.manager, fe, {
            pointers: $,
            changedPointers: [M],
            pointerType: ze,
            srcEvent: M
          }), Z && $.splice(At, 1));
        }
      });
      var Jt = {
        touchstart: U,
        touchmove: G,
        touchend: J,
        touchcancel: he
      }, zi = "touchstart", si = "touchstart touchmove touchend touchcancel";
      function kr() {
        this.evTarget = zi, this.evWin = si, this.started = !1, Qe.apply(this, arguments);
      }
      k(kr, Qe, {
        handler: function(M) {
          var $ = Jt[M.type];
          if ($ === U && (this.started = !0), !!this.started) {
            var Z = ai.call(this, M, $);
            $ & (J | he) && Z[0].length - Z[1].length === 0 && (this.started = !1), this.callback(this.manager, $, {
              pointers: Z[0],
              changedPointers: Z[1],
              pointerType: xe,
              srcEvent: M
            });
          }
        }
      });
      function ai(y, M) {
        var $ = pe(y.touches), Z = pe(y.changedTouches);
        return M & (J | he) && ($ = Je($.concat(Z), "identifier")), [$, Z];
      }
      var ui = {
        touchstart: U,
        touchmove: G,
        touchend: J,
        touchcancel: he
      }, $r = "touchstart touchmove touchend touchcancel";
      function zn() {
        this.evTarget = $r, this.targetIds = {}, Qe.apply(this, arguments);
      }
      k(zn, Qe, {
        handler: function(M) {
          var $ = ui[M.type], Z = Di.call(this, M, $);
          Z && this.callback(this.manager, $, {
            pointers: Z[0],
            changedPointers: Z[1],
            pointerType: xe,
            srcEvent: M
          });
        }
      });
      function Di(y, M) {
        var $ = pe(y.touches), Z = this.targetIds;
        if (M & (U | G) && $.length === 1)
          return Z[$[0].identifier] = !0, [$, $];
        var ie, fe, ze = pe(y.changedTouches), Ct = [], At = this.target;
        if (fe = $.filter(function(Rt) {
          return H(Rt.target, At);
        }), M === U)
          for (ie = 0; ie < fe.length; )
            Z[fe[ie].identifier] = !0, ie++;
        for (ie = 0; ie < ze.length; )
          Z[ze[ie].identifier] && Ct.push(ze[ie]), M & (J | he) && delete Z[ze[ie].identifier], ie++;
        if (Ct.length)
          return [
            // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
            Je(fe.concat(Ct), "identifier"),
            Ct
          ];
      }
      var Nr = 2500, Es = 25;
      function To() {
        Qe.apply(this, arguments);
        var y = C(this.handler, this);
        this.touch = new zn(this.manager, y), this.mouse = new Wt(this.manager, y), this.primaryTouch = null, this.lastTouches = [];
      }
      k(To, Qe, {
        /**
         * handle mouse and touch events
         * @param {Hammer} manager
         * @param {String} inputEvent
         * @param {Object} inputData
         */
        handler: function(M, $, Z) {
          var ie = Z.pointerType == xe, fe = Z.pointerType == Ve;
          if (!(fe && Z.sourceCapabilities && Z.sourceCapabilities.firesTouchEvents)) {
            if (ie)
              Ru.call(this, $, Z);
            else if (fe && zu.call(this, Z))
              return;
            this.callback(M, $, Z);
          }
        },
        /**
         * remove the event listeners
         */
        destroy: function() {
          this.touch.destroy(), this.mouse.destroy();
        }
      });
      function Ru(y, M) {
        y & U ? (this.primaryTouch = M.changedPointers[0].identifier, As.call(this, M)) : y & (J | he) && As.call(this, M);
      }
      function As(y) {
        var M = y.changedPointers[0];
        if (M.identifier === this.primaryTouch) {
          var $ = { x: M.clientX, y: M.clientY };
          this.lastTouches.push($);
          var Z = this.lastTouches, ie = function() {
            var fe = Z.indexOf($);
            fe > -1 && Z.splice(fe, 1);
          };
          setTimeout(ie, Nr);
        }
      }
      function zu(y) {
        for (var M = y.srcEvent.clientX, $ = y.srcEvent.clientY, Z = 0; Z < this.lastTouches.length; Z++) {
          var ie = this.lastTouches[Z], fe = Math.abs(M - ie.x), ze = Math.abs($ - ie.y);
          if (fe <= Es && ze <= Es)
            return !0;
        }
        return !1;
      }
      var Is = Le(u.style, "touchAction"), Ps = Is !== o, Os = "compute", So = "auto", Co = "manipulation", fr = "none", li = "pan-x", ci = "pan-y", Li = Du();
      function Mo(y, M) {
        this.manager = y, this.set(M);
      }
      Mo.prototype = {
        /**
         * set the touchAction value on the element or enable the polyfill
         * @param {String} value
         */
        set: function(y) {
          y == Os && (y = this.compute()), Ps && this.manager.element.style && Li[y] && (this.manager.element.style[Is] = y), this.actions = y.toLowerCase().trim();
        },
        /**
         * just re-set the touchAction value
         */
        update: function() {
          this.set(this.manager.options.touchAction);
        },
        /**
         * compute the value for the touchAction property based on the recognizer's settings
         * @returns {String} value
         */
        compute: function() {
          var y = [];
          return b(this.manager.recognizers, function(M) {
            A(M.options.enable, [M]) && (y = y.concat(M.getTouchAction()));
          }), Bi(y.join(" "));
        },
        /**
         * this method is called on each input cycle and provides the preventing of the browser behavior
         * @param {Object} input
         */
        preventDefaults: function(y) {
          var M = y.srcEvent, $ = y.offsetDirection;
          if (this.manager.session.prevented) {
            M.preventDefault();
            return;
          }
          var Z = this.actions, ie = se(Z, fr) && !Li[fr], fe = se(Z, ci) && !Li[ci], ze = se(Z, li) && !Li[li];
          if (ie) {
            var Ct = y.pointers.length === 1, At = y.distance < 2, Rt = y.deltaTime < 250;
            if (Ct && At && Rt)
              return;
          }
          if (!(ze && fe) && (ie || fe && $ & Nt || ze && $ & xt))
            return this.preventSrc(M);
        },
        /**
         * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
         * @param {Object} srcEvent
         */
        preventSrc: function(y) {
          this.manager.session.prevented = !0, y.preventDefault();
        }
      };
      function Bi(y) {
        if (se(y, fr))
          return fr;
        var M = se(y, li), $ = se(y, ci);
        return M && $ ? fr : M || $ ? M ? li : ci : se(y, Co) ? Co : So;
      }
      function Du() {
        if (!Ps)
          return !1;
        var y = {}, M = e.CSS && e.CSS.supports;
        return ["auto", "manipulation", "pan-y", "pan-x", "pan-x pan-y", "none"].forEach(function($) {
          y[$] = M ? e.CSS.supports("touch-action", $) : !0;
        }), y;
      }
      var dr = 1, sn = 2, Rr = 4, ir = 8, Dn = ir, zr = 16, bn = 32;
      function Yn(y) {
        this.options = O({}, this.defaults, y || {}), this.id = We(), this.manager = null, this.options.enable = N(this.options.enable, !0), this.state = dr, this.simultaneous = {}, this.requireFail = [];
      }
      Yn.prototype = {
        /**
         * @virtual
         * @type {Object}
         */
        defaults: {},
        /**
         * set options
         * @param {Object} options
         * @return {Recognizer}
         */
        set: function(y) {
          return O(this.options, y), this.manager && this.manager.touchAction.update(), this;
        },
        /**
         * recognize simultaneous with an other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        recognizeWith: function(y) {
          if (v(y, "recognizeWith", this))
            return this;
          var M = this.simultaneous;
          return y = Fi(y, this), M[y.id] || (M[y.id] = y, y.recognizeWith(this)), this;
        },
        /**
         * drop the simultaneous link. it doesnt remove the link on the other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        dropRecognizeWith: function(y) {
          return v(y, "dropRecognizeWith", this) ? this : (y = Fi(y, this), delete this.simultaneous[y.id], this);
        },
        /**
         * recognizer can only run when an other is failing
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        requireFailure: function(y) {
          if (v(y, "requireFailure", this))
            return this;
          var M = this.requireFail;
          return y = Fi(y, this), ge(M, y) === -1 && (M.push(y), y.requireFailure(this)), this;
        },
        /**
         * drop the requireFailure link. it does not remove the link on the other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        dropRequireFailure: function(y) {
          if (v(y, "dropRequireFailure", this))
            return this;
          y = Fi(y, this);
          var M = ge(this.requireFail, y);
          return M > -1 && this.requireFail.splice(M, 1), this;
        },
        /**
         * has require failures boolean
         * @returns {boolean}
         */
        hasRequireFailures: function() {
          return this.requireFail.length > 0;
        },
        /**
         * if the recognizer can recognize simultaneous with an other recognizer
         * @param {Recognizer} otherRecognizer
         * @returns {Boolean}
         */
        canRecognizeWith: function(y) {
          return !!this.simultaneous[y.id];
        },
        /**
         * You should use `tryEmit` instead of `emit` directly to check
         * that all the needed recognizers has failed before emitting.
         * @param {Object} input
         */
        emit: function(y) {
          var M = this, $ = this.state;
          function Z(ie) {
            M.manager.emit(ie, y);
          }
          $ < ir && Z(M.options.event + ks($)), Z(M.options.event), y.additionalEvent && Z(y.additionalEvent), $ >= ir && Z(M.options.event + ks($));
        },
        /**
         * Check that all the require failure recognizers has failed,
         * if true, it emits a gesture event,
         * otherwise, setup the state to FAILED.
         * @param {Object} input
         */
        tryEmit: function(y) {
          if (this.canEmit())
            return this.emit(y);
          this.state = bn;
        },
        /**
         * can we emit?
         * @returns {boolean}
         */
        canEmit: function() {
          for (var y = 0; y < this.requireFail.length; ) {
            if (!(this.requireFail[y].state & (bn | dr)))
              return !1;
            y++;
          }
          return !0;
        },
        /**
         * update the recognizer
         * @param {Object} inputData
         */
        recognize: function(y) {
          var M = O({}, y);
          if (!A(this.options.enable, [this, M])) {
            this.reset(), this.state = bn;
            return;
          }
          this.state & (Dn | zr | bn) && (this.state = dr), this.state = this.process(M), this.state & (sn | Rr | ir | zr) && this.tryEmit(M);
        },
        /**
         * return the state of the recognizer
         * the actual recognizing happens in this method
         * @virtual
         * @param {Object} inputData
         * @returns {Const} STATE
         */
        process: function(y) {
        },
        // jshint ignore:line
        /**
         * return the preferred touch-action
         * @virtual
         * @returns {Array}
         */
        getTouchAction: function() {
        },
        /**
         * called when the gesture isn't allowed to recognize
         * like when another is being recognized or it is disabled
         * @virtual
         */
        reset: function() {
        }
      };
      function ks(y) {
        return y & zr ? "cancel" : y & ir ? "end" : y & Rr ? "move" : y & sn ? "start" : "";
      }
      function $s(y) {
        return y == tt ? "down" : y == ke ? "up" : y == Ue ? "left" : y == wt ? "right" : "";
      }
      function Fi(y, M) {
        var $ = M.manager;
        return $ ? $.get(y) : y;
      }
      function an() {
        Yn.apply(this, arguments);
      }
      k(an, Yn, {
        /**
         * @namespace
         * @memberof AttrRecognizer
         */
        defaults: {
          /**
           * @type {Number}
           * @default 1
           */
          pointers: 1
        },
        /**
         * Used to check if it the recognizer receives valid input, like input.distance > 10.
         * @memberof AttrRecognizer
         * @param {Object} input
         * @returns {Boolean} recognized
         */
        attrTest: function(y) {
          var M = this.options.pointers;
          return M === 0 || y.pointers.length === M;
        },
        /**
         * Process the input and return the state for the recognizer
         * @memberof AttrRecognizer
         * @param {Object} input
         * @returns {*} State
         */
        process: function(y) {
          var M = this.state, $ = y.eventType, Z = M & (sn | Rr), ie = this.attrTest(y);
          return Z && ($ & he || !ie) ? M | zr : Z || ie ? $ & J ? M | ir : M & sn ? M | Rr : sn : bn;
        }
      });
      function hi() {
        an.apply(this, arguments), this.pX = null, this.pY = null;
      }
      k(hi, an, {
        /**
         * @namespace
         * @memberof PanRecognizer
         */
        defaults: {
          event: "pan",
          threshold: 10,
          pointers: 1,
          direction: Nn
        },
        getTouchAction: function() {
          var y = this.options.direction, M = [];
          return y & Nt && M.push(ci), y & xt && M.push(li), M;
        },
        directionTest: function(y) {
          var M = this.options, $ = !0, Z = y.distance, ie = y.direction, fe = y.deltaX, ze = y.deltaY;
          return ie & M.direction || (M.direction & Nt ? (ie = fe === 0 ? we : fe < 0 ? Ue : wt, $ = fe != this.pX, Z = Math.abs(y.deltaX)) : (ie = ze === 0 ? we : ze < 0 ? ke : tt, $ = ze != this.pY, Z = Math.abs(y.deltaY))), y.direction = ie, $ && Z > M.threshold && ie & M.direction;
        },
        attrTest: function(y) {
          return an.prototype.attrTest.call(this, y) && (this.state & sn || !(this.state & sn) && this.directionTest(y));
        },
        emit: function(y) {
          this.pX = y.deltaX, this.pY = y.deltaY;
          var M = $s(y.direction);
          M && (y.additionalEvent = this.options.event + M), this._super.emit.call(this, y);
        }
      });
      function Ui() {
        an.apply(this, arguments);
      }
      k(Ui, an, {
        /**
         * @namespace
         * @memberof PinchRecognizer
         */
        defaults: {
          event: "pinch",
          threshold: 0,
          pointers: 2
        },
        getTouchAction: function() {
          return [fr];
        },
        attrTest: function(y) {
          return this._super.attrTest.call(this, y) && (Math.abs(y.scale - 1) > this.options.threshold || this.state & sn);
        },
        emit: function(y) {
          if (y.scale !== 1) {
            var M = y.scale < 1 ? "in" : "out";
            y.additionalEvent = this.options.event + M;
          }
          this._super.emit.call(this, y);
        }
      });
      function fi() {
        Yn.apply(this, arguments), this._timer = null, this._input = null;
      }
      k(fi, Yn, {
        /**
         * @namespace
         * @memberof PressRecognizer
         */
        defaults: {
          event: "press",
          pointers: 1,
          time: 251,
          // minimal time of the pointer to be pressed
          threshold: 9
          // a minimal movement is ok, but keep it low
        },
        getTouchAction: function() {
          return [So];
        },
        process: function(y) {
          var M = this.options, $ = y.pointers.length === M.pointers, Z = y.distance < M.threshold, ie = y.deltaTime > M.time;
          if (this._input = y, !Z || !$ || y.eventType & (J | he) && !ie)
            this.reset();
          else if (y.eventType & U)
            this.reset(), this._timer = g(function() {
              this.state = Dn, this.tryEmit();
            }, M.time, this);
          else if (y.eventType & J)
            return Dn;
          return bn;
        },
        reset: function() {
          clearTimeout(this._timer);
        },
        emit: function(y) {
          this.state === Dn && (y && y.eventType & J ? this.manager.emit(this.options.event + "up", y) : (this._input.timeStamp = d(), this.manager.emit(this.options.event, this._input)));
        }
      });
      function Eo() {
        an.apply(this, arguments);
      }
      k(Eo, an, {
        /**
         * @namespace
         * @memberof RotateRecognizer
         */
        defaults: {
          event: "rotate",
          threshold: 0,
          pointers: 2
        },
        getTouchAction: function() {
          return [fr];
        },
        attrTest: function(y) {
          return this._super.attrTest.call(this, y) && (Math.abs(y.rotation) > this.options.threshold || this.state & sn);
        }
      });
      function Zi() {
        an.apply(this, arguments);
      }
      k(Zi, an, {
        /**
         * @namespace
         * @memberof SwipeRecognizer
         */
        defaults: {
          event: "swipe",
          threshold: 10,
          velocity: 0.3,
          direction: Nt | xt,
          pointers: 1
        },
        getTouchAction: function() {
          return hi.prototype.getTouchAction.call(this);
        },
        attrTest: function(y) {
          var M = this.options.direction, $;
          return M & (Nt | xt) ? $ = y.overallVelocity : M & Nt ? $ = y.overallVelocityX : M & xt && ($ = y.overallVelocityY), this._super.attrTest.call(this, y) && M & y.offsetDirection && y.distance > this.options.threshold && y.maxPointers == this.options.pointers && f($) > this.options.velocity && y.eventType & J;
        },
        emit: function(y) {
          var M = $s(y.offsetDirection);
          M && this.manager.emit(this.options.event + M, y), this.manager.emit(this.options.event, y);
        }
      });
      function pr() {
        Yn.apply(this, arguments), this.pTime = !1, this.pCenter = !1, this._timer = null, this._input = null, this.count = 0;
      }
      k(pr, Yn, {
        /**
         * @namespace
         * @memberof PinchRecognizer
         */
        defaults: {
          event: "tap",
          pointers: 1,
          taps: 1,
          interval: 300,
          // max time between the multi-tap taps
          time: 250,
          // max time of the pointer to be down (like finger on the screen)
          threshold: 9,
          // a minimal movement is ok, but keep it low
          posThreshold: 10
          // a multi-tap can be a bit off the initial position
        },
        getTouchAction: function() {
          return [Co];
        },
        process: function(y) {
          var M = this.options, $ = y.pointers.length === M.pointers, Z = y.distance < M.threshold, ie = y.deltaTime < M.time;
          if (this.reset(), y.eventType & U && this.count === 0)
            return this.failTimeout();
          if (Z && ie && $) {
            if (y.eventType != J)
              return this.failTimeout();
            var fe = this.pTime ? y.timeStamp - this.pTime < M.interval : !0, ze = !this.pCenter || le(this.pCenter, y.center) < M.posThreshold;
            this.pTime = y.timeStamp, this.pCenter = y.center, !ze || !fe ? this.count = 1 : this.count += 1, this._input = y;
            var Ct = this.count % M.taps;
            if (Ct === 0)
              return this.hasRequireFailures() ? (this._timer = g(function() {
                this.state = Dn, this.tryEmit();
              }, M.interval, this), sn) : Dn;
          }
          return bn;
        },
        failTimeout: function() {
          return this._timer = g(function() {
            this.state = bn;
          }, this.options.interval, this), bn;
        },
        reset: function() {
          clearTimeout(this._timer);
        },
        emit: function() {
          this.state == Dn && (this._input.tapCount = this.count, this.manager.emit(this.options.event, this._input));
        }
      });
      function Qn(y, M) {
        return M = M || {}, M.recognizers = N(M.recognizers, Qn.defaults.preset), new qi(y, M);
      }
      Qn.VERSION = "2.0.7", Qn.defaults = {
        /**
         * set if DOM events are being triggered.
         * But this is slower and unused by simple implementations, so disabled by default.
         * @type {Boolean}
         * @default false
         */
        domEvents: !1,
        /**
         * The value for the touchAction property/fallback.
         * When set to `compute` it will magically set the correct value based on the added recognizers.
         * @type {String}
         * @default compute
         */
        touchAction: Os,
        /**
         * @type {Boolean}
         * @default true
         */
        enable: !0,
        /**
         * EXPERIMENTAL FEATURE -- can be removed/changed
         * Change the parent input target element.
         * If Null, then it is being set the to main element.
         * @type {Null|EventTarget}
         * @default null
         */
        inputTarget: null,
        /**
         * force an input class
         * @type {Null|Function}
         * @default null
         */
        inputClass: null,
        /**
         * Default recognizer setup when calling `Hammer()`
         * When creating a new Manager these will be skipped.
         * @type {Array}
         */
        preset: [
          // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
          [Eo, { enable: !1 }],
          [Ui, { enable: !1 }, ["rotate"]],
          [Zi, { direction: Nt }],
          [hi, { direction: Nt }, ["swipe"]],
          [pr],
          [pr, { event: "doubletap", taps: 2 }, ["tap"]],
          [fi]
        ],
        /**
         * Some CSS properties can be used to improve the working of Hammer.
         * Add them to this method and they will be set when creating a new Manager.
         * @namespace
         */
        cssProps: {
          /**
           * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
           * @type {String}
           * @default 'none'
           */
          userSelect: "none",
          /**
           * Disable the Windows Phone grippers when pressing an element.
           * @type {String}
           * @default 'none'
           */
          touchSelect: "none",
          /**
           * Disables the default callout shown when you touch and hold a touch target.
           * On iOS, when you touch and hold a touch target such as a link, Safari displays
           * a callout containing information about the link. This property allows you to disable that callout.
           * @type {String}
           * @default 'none'
           */
          touchCallout: "none",
          /**
           * Specifies whether zooming is enabled. Used by IE10>
           * @type {String}
           * @default 'none'
           */
          contentZooming: "none",
          /**
           * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
           * @type {String}
           * @default 'none'
           */
          userDrag: "none",
          /**
           * Overrides the highlight color shown when the user taps a link or a JavaScript
           * clickable element in iOS. This property obeys the alpha value, if specified.
           * @type {String}
           * @default 'rgba(0,0,0,0)'
           */
          tapHighlightColor: "rgba(0,0,0,0)"
        }
      };
      var Lu = 1, Ao = 2;
      function qi(y, M) {
        this.options = O({}, Qn.defaults, M || {}), this.options.inputTarget = this.options.inputTarget || y, this.handlers = {}, this.session = {}, this.recognizers = [], this.oldCssProps = {}, this.element = y, this.input = yn(this), this.touchAction = new Mo(this, this.options.touchAction), Hi(this, !0), b(this.options.recognizers, function($) {
          var Z = this.add(new $[0]($[1]));
          $[2] && Z.recognizeWith($[2]), $[3] && Z.requireFailure($[3]);
        }, this);
      }
      qi.prototype = {
        /**
         * set options
         * @param {Object} options
         * @returns {Manager}
         */
        set: function(y) {
          return O(this.options, y), y.touchAction && this.touchAction.update(), y.inputTarget && (this.input.destroy(), this.input.target = y.inputTarget, this.input.init()), this;
        },
        /**
         * stop recognizing for this session.
         * This session will be discarded, when a new [input]start event is fired.
         * When forced, the recognizer cycle is stopped immediately.
         * @param {Boolean} [force]
         */
        stop: function(y) {
          this.session.stopped = y ? Ao : Lu;
        },
        /**
         * run the recognizers!
         * called by the inputHandler function on every movement of the pointers (touches)
         * it walks through all the recognizers and tries to detect the gesture that is being made
         * @param {Object} inputData
         */
        recognize: function(y) {
          var M = this.session;
          if (!M.stopped) {
            this.touchAction.preventDefaults(y);
            var $, Z = this.recognizers, ie = M.curRecognizer;
            (!ie || ie && ie.state & Dn) && (ie = M.curRecognizer = null);
            for (var fe = 0; fe < Z.length; )
              $ = Z[fe], M.stopped !== Ao && // 1
              (!ie || $ == ie || // 2
              $.canRecognizeWith(ie)) ? $.recognize(y) : $.reset(), !ie && $.state & (sn | Rr | ir) && (ie = M.curRecognizer = $), fe++;
          }
        },
        /**
         * get a recognizer by its event name.
         * @param {Recognizer|String} recognizer
         * @returns {Recognizer|Null}
         */
        get: function(y) {
          if (y instanceof Yn)
            return y;
          for (var M = this.recognizers, $ = 0; $ < M.length; $++)
            if (M[$].options.event == y)
              return M[$];
          return null;
        },
        /**
         * add a recognizer to the manager
         * existing recognizers with the same event name will be removed
         * @param {Recognizer} recognizer
         * @returns {Recognizer|Manager}
         */
        add: function(y) {
          if (v(y, "add", this))
            return this;
          var M = this.get(y.options.event);
          return M && this.remove(M), this.recognizers.push(y), y.manager = this, this.touchAction.update(), y;
        },
        /**
         * remove a recognizer by name or instance
         * @param {Recognizer|String} recognizer
         * @returns {Manager}
         */
        remove: function(y) {
          if (v(y, "remove", this))
            return this;
          if (y = this.get(y), y) {
            var M = this.recognizers, $ = ge(M, y);
            $ !== -1 && (M.splice($, 1), this.touchAction.update());
          }
          return this;
        },
        /**
         * bind event
         * @param {String} events
         * @param {Function} handler
         * @returns {EventEmitter} this
         */
        on: function(y, M) {
          if (y !== o && M !== o) {
            var $ = this.handlers;
            return b(be(y), function(Z) {
              $[Z] = $[Z] || [], $[Z].push(M);
            }), this;
          }
        },
        /**
         * unbind event, leave emit blank to remove all handlers
         * @param {String} events
         * @param {Function} [handler]
         * @returns {EventEmitter} this
         */
        off: function(y, M) {
          if (y !== o) {
            var $ = this.handlers;
            return b(be(y), function(Z) {
              M ? $[Z] && $[Z].splice(ge($[Z], M), 1) : delete $[Z];
            }), this;
          }
        },
        /**
         * emit event to the listeners
         * @param {String} event
         * @param {Object} data
         */
        emit: function(y, M) {
          this.options.domEvents && Bu(y, M);
          var $ = this.handlers[y] && this.handlers[y].slice();
          if (!(!$ || !$.length)) {
            M.type = y, M.preventDefault = function() {
              M.srcEvent.preventDefault();
            };
            for (var Z = 0; Z < $.length; )
              $[Z](M), Z++;
          }
        },
        /**
         * destroy the manager and unbinds all events
         * it doesn't unbind dom events, that is the user own responsibility
         */
        destroy: function() {
          this.element && Hi(this, !1), this.handlers = {}, this.session = {}, this.input.destroy(), this.element = null;
        }
      };
      function Hi(y, M) {
        var $ = y.element;
        if ($.style) {
          var Z;
          b(y.options.cssProps, function(ie, fe) {
            Z = Le($.style, fe), M ? (y.oldCssProps[Z] = $.style[Z], $.style[Z] = ie) : $.style[Z] = y.oldCssProps[Z] || "";
          }), M || (y.oldCssProps = {});
        }
      }
      function Bu(y, M) {
        var $ = t.createEvent("Event");
        $.initEvent(y, !0, !0), $.gesture = M, M.target.dispatchEvent($);
      }
      O(Qn, {
        INPUT_START: U,
        INPUT_MOVE: G,
        INPUT_END: J,
        INPUT_CANCEL: he,
        STATE_POSSIBLE: dr,
        STATE_BEGAN: sn,
        STATE_CHANGED: Rr,
        STATE_ENDED: ir,
        STATE_RECOGNIZED: Dn,
        STATE_CANCELLED: zr,
        STATE_FAILED: bn,
        DIRECTION_NONE: we,
        DIRECTION_LEFT: Ue,
        DIRECTION_RIGHT: wt,
        DIRECTION_UP: ke,
        DIRECTION_DOWN: tt,
        DIRECTION_HORIZONTAL: Nt,
        DIRECTION_VERTICAL: xt,
        DIRECTION_ALL: Nn,
        Manager: qi,
        Input: Qe,
        TouchAction: Mo,
        TouchInput: zn,
        MouseInput: Wt,
        PointerEventInput: hr,
        TouchMouseInput: To,
        SingleTouchInput: kr,
        Recognizer: Yn,
        AttrRecognizer: an,
        Tap: pr,
        Pan: hi,
        Swipe: Zi,
        Pinch: Ui,
        Rotate: Eo,
        Press: fi,
        on: L,
        off: F,
        each: b,
        merge: S,
        extend: E,
        assign: O,
        inherit: k,
        bindFn: C,
        prefixed: Le
      });
      var Ns = typeof e < "u" ? e : typeof self < "u" ? self : {};
      Ns.Hammer = Qn, n.exports ? n.exports = Qn : e[r] = Qn;
    })(window, document, "Hammer");
  }(Cc)), Cc.exports;
}
var GI = WI();
const Ei = /* @__PURE__ */ Cs(GI);
class jI {
  constructor(e, t) {
    this.isPointerDown = !1, this.lastX = 0, this.lastY = 0, this.isMultiTouch = !1, this.rotationVelocityX = 0, this.rotationVelocityY = 0, this.keysDown = {}, this.hammer = null, this.enabled = !1, this.pointerDownHandler = (r) => {
      r.button === 0 && !this.isMultiTouch && (this.isPointerDown = !0, this.lastX = r.clientX, this.lastY = r.clientY, this.canvas.focus());
    }, this.pointerUpHandler = () => {
      this.isPointerDown = !1;
    }, this.pointerMoveHandler = (r) => {
      if (!this.isPointerDown || this.isMultiTouch)
        return;
      const o = r.clientX - this.lastX, a = r.clientY - this.lastY;
      this.lastX = r.clientX, this.lastY = r.clientY, this.controller.rotate(o, a);
    }, this.keyDownHandler = (r) => {
      console.log("orbit keydown handler"), this.keysDown[r.key.toLowerCase()] = !0;
    }, this.keyUpHandler = (r) => {
      this.keysDown[r.key.toLowerCase()] = !1;
    }, this.canvas = e, this.controller = t, this.config = t.config, this.canvas.setAttribute("tabindex", "0"), this.attachMouseTouch();
  }
  attachMouseTouch() {
    this.hammer = new Ei.Manager(this.canvas), this.hammer.add(new Ei.Pinch()), this.hammer.add(new Ei.Rotate());
    let e = 0, t = 1;
    this.hammer.on("pinchstart rotatestart", (r) => {
      this.isMultiTouch = !0, e = r.rotation || 0, t = r.scale || 1;
    }), this.hammer.on("pinchend rotateend", () => {
      this.isMultiTouch = !1;
    }), this.hammer.on("pinchmove rotatemove", (r) => {
      const o = r.scale - t;
      this.controller.zoom(-o * this.config.pinchZoomSensitivity), t = r.scale;
      const a = (r.rotation - e) * (Math.PI / 180) * this.config.twistYawSensitivity;
      this.controller.spin(a), e = r.rotation;
    });
  }
  enable() {
    this.enabled || (this.enabled = !0, this.canvas.addEventListener("pointerdown", this.pointerDownHandler), this.canvas.addEventListener("pointerup", this.pointerUpHandler), this.canvas.addEventListener("pointermove", this.pointerMoveHandler), this.canvas.addEventListener("keydown", this.keyDownHandler), this.canvas.addEventListener("keyup", this.keyUpHandler), this.canvas.focus(), this.hammer || this.attachMouseTouch());
  }
  disable() {
    this.enabled && (this.enabled = !1, this.canvas.removeEventListener("pointerdown", this.pointerDownHandler), this.canvas.removeEventListener("pointerup", this.pointerUpHandler), this.canvas.removeEventListener("pointermove", this.pointerMoveHandler), this.canvas.removeEventListener("keydown", this.keyDownHandler), this.canvas.removeEventListener("keyup", this.keyUpHandler), this.hammer && (this.hammer.destroy(), this.hammer = null));
  }
  update() {
    if (!this.enabled)
      return;
    const e = this.keysDown, t = this.controller;
    e.arrowleft && (this.rotationVelocityY += this.config.keyboardRotationSpeed), e.arrowright && (this.rotationVelocityY -= this.config.keyboardRotationSpeed), e.arrowup && (this.rotationVelocityX += this.config.keyboardRotationSpeed), e.arrowdown && (this.rotationVelocityX -= this.config.keyboardRotationSpeed), e.w && t.zoom(-this.config.keyboardZoomSpeed), e.s && t.zoom(this.config.keyboardZoomSpeed), e.a && t.spin(this.config.keyboardYawSpeed), e.d && t.spin(-this.config.keyboardYawSpeed), Math.abs(this.rotationVelocityX) > 1e-5 && (t.rotate(0, -this.rotationVelocityX / this.config.trackballRotationSpeed), this.rotationVelocityX *= this.config.inertiaDamping), Math.abs(this.rotationVelocityY) > 1e-5 && (t.rotate(-this.rotationVelocityY / this.config.trackballRotationSpeed, 0), this.rotationVelocityY *= this.config.inertiaDamping), t.updateCameraPosition();
  }
}
class VI {
  constructor(e, t, r, o) {
    this.scene = e, this.engine = t, this.canvas = r, this.config = o, this.velocity = { x: 0, y: 0, zoom: 0, rotate: 0 }, this.camera = new M5("orthoCamera", new kt(0, 0, -10), e), this.camera.mode = E5.ORTHOGRAPHIC_CAMERA, this.camera.inertia = 0, this.camera.inputs.clear(), this.parent = new Eg("parent", e), this.updateOrtho(o.initialOrthoSize), this.camera.setTarget(kt.Zero());
  }
  updateOrtho(e) {
    const t = this.engine.getRenderHeight() / this.engine.getRenderWidth();
    this.camera.orthoLeft = -e, this.camera.orthoRight = e, this.camera.orthoTop = e * t, this.camera.orthoBottom = -e * t;
  }
  pan(e, t) {
    this.camera.position.x += e, this.camera.position.y += t;
  }
  zoom(e) {
    this.camera.orthoLeft = e * (this.camera.orthoLeft ?? 1), this.camera.orthoRight = e * (this.camera.orthoRight ?? 1), this.camera.orthoTop = e * (this.camera.orthoTop ?? 1), this.camera.orthoBottom = e * (this.camera.orthoBottom ?? 1);
  }
  rotate(e) {
    this.parent.rotation.z += e;
  }
  applyInertia() {
    const e = this.velocity, t = this.config;
    this.camera.position.x += e.x, this.camera.position.y += e.y;
    const r = Math.exp(e.zoom);
    this.camera.orthoLeft = r * (this.camera.orthoLeft ?? 1), this.camera.orthoRight = r * (this.camera.orthoRight ?? 1), this.camera.orthoTop = r * (this.camera.orthoTop ?? 1), this.camera.orthoBottom = r * (this.camera.orthoBottom ?? 1), this.parent.rotation.z += e.rotate, e.x *= t.panDamping, e.y *= t.panDamping, e.zoom *= t.zoomDamping, e.rotate *= t.rotateDamping;
  }
  zoomToBoundingBox(e, t) {
    const r = (e.x + t.x) / 2, o = (e.y + t.y) / 2, a = t.x - e.x, u = t.y - e.y, h = Math.max(a, u);
    this.camera.position.x = r, this.camera.position.y = o, this.updateOrtho(h * 0.6);
  }
}
class KI {
  constructor(e, t, r) {
    this.cam = e, this.canvas = t, this.config = r, this.keyState = {}, this.gestureSession = null, this.hammer = null, this.enabled = !1, this.pointerDownHandler = () => {
      this.cam.canvas.focus();
    }, this.keyDownHandler = (o) => {
      this.keyState[o.key] = !0;
    }, this.keyUpHandler = (o) => {
      this.keyState[o.key] = !1;
    }, this.canvas.setAttribute("tabindex", "0"), this.setupMouse(), this.setupTouch();
  }
  setupMouse() {
    let e = !1, t = 0, r = 0;
    this.cam.scene.onPointerObservable.add((o) => {
      const a = o.event;
      switch (o.type) {
        case Ho.POINTERDOWN:
          e = !0, t = a.clientX, r = a.clientY, this.pointerDownHandler();
          break;
        case Ho.POINTERUP:
          e = !1;
          break;
        case Ho.POINTERMOVE:
          if (e && a.buttons === 1) {
            const u = this.cam.camera.orthoRight ?? 1, h = this.cam.camera.orthoLeft ?? 1, c = this.cam.camera.orthoTop ?? 1, f = this.cam.camera.orthoBottom ?? 1, d = (u - h) / this.cam.engine.getRenderWidth(), g = (c - f) / this.cam.engine.getRenderHeight(), v = a.clientX - t, b = a.clientY - r;
            this.cam.pan(-v * d * this.config.mousePanScale, b * g * this.config.mousePanScale), t = a.clientX, r = a.clientY;
          }
          break;
      }
    }), this.cam.scene.onPrePointerObservable.add((o) => {
      const a = o.event;
      if (o.type === Ho.POINTERWHEEL) {
        const u = a.deltaY > 0 ? this.config.mouseWheelZoomSpeed : 1 / this.config.mouseWheelZoomSpeed;
        this.cam.zoom(u), a.preventDefault();
      }
    }, Ho.POINTERWHEEL);
  }
  setupTouch() {
    this.hammer = new Ei.Manager(this.canvas);
    const e = new Ei.Pan({ threshold: 0, pointers: 0 }), t = new Ei.Pinch(), r = new Ei.Rotate();
    this.hammer.add([e, t, r]), this.hammer.get("pinch").recognizeWith(this.hammer.get("rotate")), this.hammer.get("pan").requireFailure(this.hammer.get("pinch")), this.hammer.on("panstart pinchstart rotatestart", (o) => {
      this.gestureSession = {
        panX: o.center.x,
        panY: o.center.y,
        panStartX: this.cam.camera.position.x,
        panStartY: this.cam.camera.position.y,
        ortho: {
          left: this.cam.camera.orthoLeft ?? 1,
          right: this.cam.camera.orthoRight ?? 1,
          top: this.cam.camera.orthoTop ?? 1,
          bottom: this.cam.camera.orthoBottom ?? 1
        },
        scale: o.scale || 1,
        rotation: this.cam.parent.rotation.z,
        startRotDeg: o.rotation || 0
      };
    }), this.hammer.on("panmove pinchmove rotatemove", (o) => {
      if (!this.gestureSession)
        return;
      const a = this.cam.camera.orthoRight ?? 1, u = this.cam.camera.orthoLeft ?? 1, h = this.cam.camera.orthoTop ?? 1, c = this.cam.camera.orthoBottom ?? 1, f = (a - u) / this.cam.engine.getRenderWidth(), d = (h - c) / this.cam.engine.getRenderHeight(), g = o.center.x - this.gestureSession.panX, v = o.center.y - this.gestureSession.panY;
      this.cam.camera.position.x = this.gestureSession.panStartX - g * f * this.config.touchPanScale, this.cam.camera.position.y = this.gestureSession.panStartY + v * d * this.config.touchPanScale;
      const b = (o.scale || 1) / this.gestureSession.scale;
      this.cam.camera.orthoLeft = this.gestureSession.ortho.left / b, this.cam.camera.orthoRight = this.gestureSession.ortho.right / b, this.cam.camera.orthoTop = this.gestureSession.ortho.top / b, this.cam.camera.orthoBottom = this.gestureSession.ortho.bottom / b;
      const _ = -(o.rotation - this.gestureSession.startRotDeg) * Math.PI / 180;
      this.cam.parent.rotation.z = this.gestureSession.rotation + _;
    }), this.hammer.on("panend pinchend rotateend", () => {
      this.gestureSession = null;
    });
  }
  enable() {
    this.enabled || (this.enabled = !0, this.canvas.addEventListener("keydown", this.keyDownHandler), this.canvas.addEventListener("keyup", this.keyUpHandler));
  }
  disable() {
    this.enabled && (this.enabled = !1, this.canvas.removeEventListener("keydown", this.keyDownHandler), this.canvas.removeEventListener("keyup", this.keyUpHandler));
  }
  applyKeyboardInertia() {
    if (!this.enabled)
      return;
    const e = this.cam.velocity, t = this.config;
    (this.keyState.w || this.keyState.ArrowUp) && (e.y += t.panAcceleration), (this.keyState.s || this.keyState.ArrowDown) && (e.y -= t.panAcceleration), (this.keyState.a || this.keyState.ArrowLeft) && (e.x -= t.panAcceleration), (this.keyState.d || this.keyState.ArrowRight) && (e.x += t.panAcceleration), (this.keyState["+"] || this.keyState["="]) && (e.zoom -= t.zoomFactorPerFrame), (this.keyState["-"] || this.keyState._) && (e.zoom += t.zoomFactorPerFrame), this.keyState.q && (e.rotate += t.rotateSpeedPerFrame), this.keyState.e && (e.rotate -= t.rotateSpeedPerFrame);
  }
  update() {
    this.applyKeyboardInertia(), this.cam.applyInertia();
  }
}
class JI {
  constructor() {
    this.meshCacheMap = /* @__PURE__ */ new Map(), this.hits = 0, this.misses = 0;
  }
  get(e, t) {
    let r = this.meshCacheMap.get(e);
    return r ? (this.hits++, r.createInstance(`${e}`)) : (this.misses++, r = t(), r.position.set(0, -1e4, 0), r.freezeWorldMatrix(), this.meshCacheMap.set(e, r), r.createInstance(`${e}`));
  }
  reset() {
    this.hits = 0, this.misses = 0;
  }
  clear() {
    for (const e of this.meshCacheMap.values())
      e.dispose();
    this.meshCacheMap.clear(), this.reset();
  }
}
const Gr = ".", Uh = Symbol("target"), sv = Symbol("unsubscribe");
function mh(n) {
  return n instanceof Date || n instanceof Set || n instanceof Map || n instanceof WeakSet || n instanceof WeakMap || ArrayBuffer.isView(n);
}
function YI(n) {
  return (typeof n == "object" ? n === null : typeof n != "function") || n instanceof RegExp;
}
const tn = Array.isArray;
function ou(n) {
  return typeof n == "symbol";
}
const dn = {
  after(n, e) {
    return tn(n) ? n.slice(e.length) : e === "" ? n : n.slice(e.length + 1);
  },
  concat(n, e) {
    return tn(n) ? (n = [...n], e && n.push(e), n) : e && e.toString !== void 0 ? (n !== "" && (n += Gr), ou(e) ? n + e.toString() : n + e) : n;
  },
  initial(n) {
    if (tn(n))
      return n.slice(0, -1);
    if (n === "")
      return n;
    const e = n.lastIndexOf(Gr);
    return e === -1 ? "" : n.slice(0, e);
  },
  last(n) {
    if (tn(n))
      return n.at(-1) ?? "";
    if (n === "")
      return n;
    const e = n.lastIndexOf(Gr);
    return e === -1 ? n : n.slice(e + 1);
  },
  walk(n, e) {
    if (tn(n))
      for (const t of n)
        e(t);
    else if (n !== "") {
      let t = 0, r = n.indexOf(Gr);
      if (r === -1)
        e(n);
      else
        for (; t < n.length; )
          r === -1 && (r = n.length), e(n.slice(t, r)), t = r + 1, r = n.indexOf(Gr, t);
    }
  },
  get(n, e) {
    return this.walk(e, (t) => {
      n && (n = n[t]);
    }), n;
  },
  isSubPath(n, e) {
    if (tn(n)) {
      if (n.length < e.length)
        return !1;
      for (let t = 0; t < e.length; t++)
        if (n[t] !== e[t])
          return !1;
      return !0;
    }
    return n.length < e.length ? !1 : n === e ? !0 : n.startsWith(e) ? n[e.length] === Gr : !1;
  },
  isRootPath(n) {
    return tn(n) ? n.length === 0 : n === "";
  }
};
function QI(n) {
  return typeof n == "object" && typeof n.next == "function";
}
function XI(n, e, t, r, o) {
  const a = n.next;
  if (e.name === "entries")
    n.next = function() {
      const u = a.call(this);
      return u.done === !1 && (u.value[0] = o(
        u.value[0],
        e,
        u.value[0],
        r
      ), u.value[1] = o(
        u.value[1],
        e,
        u.value[0],
        r
      )), u;
    };
  else if (e.name === "values") {
    const u = t[Uh].keys();
    n.next = function() {
      const h = a.call(this);
      return h.done === !1 && (h.value = o(
        h.value,
        e,
        u.next().value,
        r
      )), h;
    };
  } else
    n.next = function() {
      const u = a.call(this);
      return u.done === !1 && (u.value = o(
        u.value,
        e,
        u.value,
        r
      )), u;
    };
  return n;
}
function og(n, e, t) {
  return n.isUnsubscribed || e.ignoreSymbols && ou(t) || e.ignoreUnderscores && t.charAt(0) === "_" || "ignoreKeys" in e && e.ignoreKeys.includes(t);
}
class e4 {
  constructor(e) {
    this._equals = e, this._proxyCache = /* @__PURE__ */ new WeakMap(), this._pathCache = /* @__PURE__ */ new WeakMap(), this.isUnsubscribed = !1;
  }
  _getDescriptorCache() {
    return this._descriptorCache === void 0 && (this._descriptorCache = /* @__PURE__ */ new WeakMap()), this._descriptorCache;
  }
  _getProperties(e) {
    const t = this._getDescriptorCache();
    let r = t.get(e);
    return r === void 0 && (r = {}, t.set(e, r)), r;
  }
  _getOwnPropertyDescriptor(e, t) {
    if (this.isUnsubscribed)
      return Reflect.getOwnPropertyDescriptor(e, t);
    const r = this._getProperties(e);
    let o = r[t];
    return o === void 0 && (o = Reflect.getOwnPropertyDescriptor(e, t), r[t] = o), o;
  }
  getProxy(e, t, r, o) {
    if (this.isUnsubscribed)
      return e;
    const a = e[o], u = a ?? e;
    this._pathCache.set(u, t);
    let h = this._proxyCache.get(u);
    return h === void 0 && (h = a === void 0 ? new Proxy(e, r) : e, this._proxyCache.set(u, h)), h;
  }
  getPath(e) {
    return this.isUnsubscribed ? void 0 : this._pathCache.get(e);
  }
  isDetached(e, t) {
    return !Object.is(e, dn.get(t, this.getPath(e)));
  }
  defineProperty(e, t, r) {
    return Reflect.defineProperty(e, t, r) ? (this.isUnsubscribed || (this._getProperties(e)[t] = r), !0) : !1;
  }
  setProperty(e, t, r, o, a) {
    if (!this._equals(a, r) || !(t in e)) {
      const u = this._getOwnPropertyDescriptor(e, t);
      return u !== void 0 && "set" in u ? Reflect.set(e, t, r, o) : Reflect.set(e, t, r);
    }
    return !0;
  }
  deleteProperty(e, t, r) {
    if (Reflect.deleteProperty(e, t)) {
      if (!this.isUnsubscribed) {
        const o = this._getDescriptorCache().get(e);
        o && (delete o[t], this._pathCache.delete(r));
      }
      return !0;
    }
    return !1;
  }
  isSameDescriptor(e, t, r) {
    const o = this._getOwnPropertyDescriptor(t, r);
    return e !== void 0 && o !== void 0 && Object.is(e.value, o.value) && (e.writable || !1) === (o.writable || !1) && (e.enumerable || !1) === (o.enumerable || !1) && (e.configurable || !1) === (o.configurable || !1) && e.get === o.get && e.set === o.set;
  }
  isGetInvariant(e, t) {
    const r = this._getOwnPropertyDescriptor(e, t);
    return r !== void 0 && r.configurable !== !0 && r.writable !== !0;
  }
  unsubscribe() {
    this._descriptorCache = null, this._pathCache = null, this._proxyCache = null, this.isUnsubscribed = !0;
  }
}
function vh(n) {
  return toString.call(n) === "[object Object]";
}
function Ba() {
  return !0;
}
function co(n, e) {
  return n.length !== e.length || n.some((t, r) => e[r] !== t);
}
const av = /* @__PURE__ */ new Set([
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
  "toString",
  "valueOf"
]), t4 = /* @__PURE__ */ new Set([
  "concat",
  "includes",
  "indexOf",
  "join",
  "keys",
  "lastIndexOf"
]), uv = {
  push: Ba,
  pop: Ba,
  shift: Ba,
  unshift: Ba,
  copyWithin: co,
  reverse: co,
  sort: co,
  splice: co,
  flat: co,
  fill: co
}, n4 = /* @__PURE__ */ new Set([
  ...av,
  ...t4,
  ...Object.keys(uv)
]);
function Fa(n, e) {
  if (n.size !== e.size)
    return !0;
  for (const t of n)
    if (!e.has(t))
      return !0;
  return !1;
}
const lv = [
  "keys",
  "values",
  "entries"
], cv = /* @__PURE__ */ new Set([
  "has",
  "toString"
]), hv = {
  add: Fa,
  clear: Fa,
  delete: Fa,
  forEach: Fa
}, r4 = /* @__PURE__ */ new Set([
  ...cv,
  ...Object.keys(hv),
  ...lv
]);
function Ua(n, e) {
  if (n.size !== e.size)
    return !0;
  let t;
  for (const [r, o] of n)
    if (t = e.get(r), t !== o || t === void 0 && !e.has(r))
      return !0;
  return !1;
}
const i4 = /* @__PURE__ */ new Set([...cv, "get"]), fv = {
  set: Ua,
  clear: Ua,
  delete: Ua,
  forEach: Ua
}, o4 = /* @__PURE__ */ new Set([
  ...i4,
  ...Object.keys(fv),
  ...lv
]);
class ri {
  constructor(e, t, r, o) {
    this._path = t, this._isChanged = !1, this._clonedCache = /* @__PURE__ */ new Set(), this._hasOnValidate = o, this._changes = o ? [] : null, this.clone = t === void 0 ? e : this._shallowClone(e);
  }
  static isHandledMethod(e) {
    return av.has(e);
  }
  _shallowClone(e) {
    let t = e;
    if (vh(e))
      t = { ...e };
    else if (tn(e) || ArrayBuffer.isView(e))
      t = [...e];
    else if (e instanceof Date)
      t = new Date(e);
    else if (e instanceof Set)
      t = new Set([...e].map((r) => this._shallowClone(r)));
    else if (e instanceof Map) {
      t = /* @__PURE__ */ new Map();
      for (const [r, o] of e.entries())
        t.set(r, this._shallowClone(o));
    }
    return this._clonedCache.add(t), t;
  }
  preferredThisArg(e, t, r, o) {
    return e ? (tn(o) ? this._onIsChanged = uv[t] : o instanceof Set ? this._onIsChanged = hv[t] : o instanceof Map && (this._onIsChanged = fv[t]), o) : r;
  }
  update(e, t, r) {
    const o = dn.after(e, this._path);
    if (t !== "length") {
      let a = this.clone;
      dn.walk(o, (u) => {
        a != null && a[u] && (this._clonedCache.has(a[u]) || (a[u] = this._shallowClone(a[u])), a = a[u]);
      }), this._hasOnValidate && this._changes.push({
        path: o,
        property: t,
        previous: r
      }), a != null && a[t] && (a[t] = r);
    }
    this._isChanged = !0;
  }
  undo(e) {
    let t;
    for (let r = this._changes.length - 1; r !== -1; r--)
      t = this._changes[r], dn.get(e, t.path)[t.property] = t.previous;
  }
  isChanged(e) {
    return this._onIsChanged === void 0 ? this._isChanged : this._onIsChanged(this.clone, e);
  }
  isPathApplicable(e) {
    return dn.isRootPath(this._path) || dn.isSubPath(e, this._path);
  }
}
class sg extends ri {
  static isHandledMethod(e) {
    return n4.has(e);
  }
}
class s4 extends ri {
  undo(e) {
    e.setTime(this.clone.getTime());
  }
  isChanged(e, t) {
    return !t(this.clone.valueOf(), e.valueOf());
  }
}
class ag extends ri {
  static isHandledMethod(e) {
    return r4.has(e);
  }
  undo(e) {
    for (const t of this.clone)
      e.add(t);
    for (const t of e)
      this.clone.has(t) || e.delete(t);
  }
}
class ug extends ri {
  static isHandledMethod(e) {
    return o4.has(e);
  }
  undo(e) {
    for (const [t, r] of this.clone.entries())
      e.set(t, r);
    for (const t of e.keys())
      this.clone.has(t) || e.delete(t);
  }
}
class a4 extends ri {
  constructor(e, t, r, o) {
    super(void 0, t, r, o), this._argument1 = r[0], this._weakValue = e.has(this._argument1);
  }
  isChanged(e) {
    return this._weakValue !== e.has(this._argument1);
  }
  undo(e) {
    this._weakValue && !e.has(this._argument1) ? e.add(this._argument1) : e.delete(this._argument1);
  }
}
class u4 extends ri {
  constructor(e, t, r, o) {
    super(void 0, t, r, o), this._weakKey = r[0], this._weakHas = e.has(this._weakKey), this._weakValue = e.get(this._weakKey);
  }
  isChanged(e) {
    return this._weakValue !== e.get(this._weakKey);
  }
  undo(e) {
    const t = e.has(this._weakKey);
    this._weakHas && !t ? e.set(this._weakKey, this._weakValue) : !this._weakHas && t ? e.delete(this._weakKey) : this._weakValue !== e.get(this._weakKey) && e.set(this._weakKey, this._weakValue);
  }
}
class Si {
  constructor(e) {
    this._stack = [], this._hasOnValidate = e;
  }
  static isHandledType(e) {
    return vh(e) || tn(e) || mh(e);
  }
  static isHandledMethod(e, t) {
    return vh(e) ? ri.isHandledMethod(t) : tn(e) ? sg.isHandledMethod(t) : e instanceof Set ? ag.isHandledMethod(t) : e instanceof Map ? ug.isHandledMethod(t) : mh(e);
  }
  get isCloning() {
    return this._stack.length > 0;
  }
  start(e, t, r) {
    let o = ri;
    tn(e) ? o = sg : e instanceof Date ? o = s4 : e instanceof Set ? o = ag : e instanceof Map ? o = ug : e instanceof WeakSet ? o = a4 : e instanceof WeakMap && (o = u4), this._stack.push(new o(e, t, r, this._hasOnValidate));
  }
  update(e, t, r) {
    this._stack.at(-1).update(e, t, r);
  }
  preferredThisArg(e, t, r) {
    const { name: o } = e, a = Si.isHandledMethod(r, o);
    return this._stack.at(-1).preferredThisArg(a, o, t, r);
  }
  isChanged(e, t, r) {
    return this._stack.at(-1).isChanged(e, t, r);
  }
  isPartOfClone(e) {
    return this._stack.at(-1).isPathApplicable(e);
  }
  undo(e) {
    this._previousClone !== void 0 && this._previousClone.undo(e);
  }
  stop() {
    return this._previousClone = this._stack.pop(), this._previousClone.clone;
  }
}
const l4 = {
  equals: Object.is,
  isShallow: !1,
  pathAsArray: !1,
  ignoreSymbols: !1,
  ignoreUnderscores: !1,
  ignoreDetached: !1,
  details: !1
}, Zh = (n, e, t = {}) => {
  t = {
    ...l4,
    ...t
  };
  const r = Symbol("ProxyTarget"), { equals: o, isShallow: a, ignoreDetached: u, details: h } = t, c = new e4(o), f = typeof t.onValidate == "function", d = new Si(f), g = (C, A, N, L, F) => !f || d.isCloning || t.onValidate(dn.concat(c.getPath(C), A), N, L, F) === !0, v = (C, A, N, L) => {
    !og(c, t, A) && !(u && c.isDetached(C, n)) && b(c.getPath(C), A, N, L);
  }, b = (C, A, N, L, F) => {
    d.isCloning && d.isPartOfClone(C) ? d.update(C, A, L) : e(dn.concat(C, A), N, L, F);
  }, _ = (C) => C && (C[r] ?? C), O = (C, A, N, L) => {
    if (YI(C) || N === "constructor" || a && !Si.isHandledMethod(A, N) || og(c, t, N) || c.isGetInvariant(A, N) || u && c.isDetached(A, n))
      return C;
    L === void 0 && (L = c.getPath(A));
    const F = dn.concat(L, N), H = c.getPath(C);
    return H && E(F, H) ? c.getProxy(C, H, S, r) : c.getProxy(C, F, S, r);
  }, E = (C, A) => {
    if (ou(C) || C.length <= A.length || tn(A) && A.length === 0)
      return !1;
    const N = tn(C) ? C : C.split(Gr), L = tn(A) ? A : A.split(Gr);
    return N.length <= L.length ? !1 : !L.some((F, H) => F !== N[H]);
  }, S = {
    get(C, A, N) {
      if (ou(A)) {
        if (A === r || A === Uh)
          return C;
        if (A === sv && !c.isUnsubscribed && c.getPath(C).length === 0)
          return c.unsubscribe(), C;
      }
      const L = mh(C) ? Reflect.get(C, A) : Reflect.get(C, A, N);
      return O(L, C, A);
    },
    set(C, A, N, L) {
      N = _(N);
      const F = C[r] ?? C, H = F[A];
      if (o(H, N) && A in C)
        return !0;
      const se = g(C, A, N, H);
      return se && c.setProperty(F, A, N, L, H) ? (v(C, A, C[A], H), !0) : !se;
    },
    defineProperty(C, A, N) {
      if (!c.isSameDescriptor(N, C, A)) {
        const L = C[A];
        g(C, A, N.value, L) && c.defineProperty(C, A, N, L) && v(C, A, N.value, L);
      }
      return !0;
    },
    deleteProperty(C, A) {
      if (!Reflect.has(C, A))
        return !0;
      const N = Reflect.get(C, A), L = g(C, A, void 0, N);
      return L && c.deleteProperty(C, A, N) ? (v(C, A, void 0, N), !0) : !L;
    },
    apply(C, A, N) {
      const L = A[r] ?? A;
      if (c.isUnsubscribed)
        return Reflect.apply(C, L, N);
      if ((h === !1 || h !== !0 && !h.includes(C.name)) && Si.isHandledType(L)) {
        let F = dn.initial(c.getPath(C));
        const H = Si.isHandledMethod(L, C.name);
        d.start(L, F, N);
        let se = Reflect.apply(
          C,
          d.preferredThisArg(C, A, L),
          H ? N.map((pe) => _(pe)) : N
        );
        const be = d.isChanged(L, o), ge = d.stop();
        if (Si.isHandledType(se) && H && (A instanceof Map && C.name === "get" && (F = dn.concat(F, N[0])), se = c.getProxy(se, F, S)), be) {
          const pe = {
            name: C.name,
            args: N,
            result: se
          }, Je = d.isCloning ? dn.initial(F) : F, Le = d.isCloning ? dn.last(F) : "";
          g(dn.get(n, Je), Le, L, ge, pe) ? b(Je, Le, L, ge, pe) : d.undo(L);
        }
        return (A instanceof Map || A instanceof Set) && QI(se) ? XI(se, C, A, F, O) : se;
      }
      return Reflect.apply(C, A, N);
    }
  }, k = c.getProxy(n, t.pathAsArray ? [] : "", S);
  return e = e.bind(k), f && (t.onValidate = t.onValidate.bind(k)), k;
};
Zh.target = (n) => (n == null ? void 0 : n[Uh]) ?? n;
Zh.unsubscribe = (n) => (n == null ? void 0 : n[sv]) ?? n;
class c4 {
  constructor() {
    this.watchedInputs = /* @__PURE__ */ new Map(), this.dataObjects = {}, this.calculatedValues = /* @__PURE__ */ new Set(), this.schemas = {};
  }
  watch(e, t, r) {
    const o = Zh(t, (a, u, h) => {
      if (typeof u == "object" && u !== null && Object.keys(u).length === 0 && h === void 0)
        return;
      const c = this.watchedInputs.get(`${e}.${a}`);
      if (c) {
        const f = h4(this.schemas, c.output);
        c.run(this.dataObjects, f);
      }
    });
    return this.addData(e, o, r);
  }
  addData(e, t, r) {
    if (this.dataObjects[e] !== void 0)
      throw new TypeError(`data type: ${e} already exists in change manager`);
    return this.dataObjects[e] = t, r && (this.schemas[e] = r), t;
  }
  addCalculatedValue(e) {
    this.calculatedValues.add(e), e.inputs.forEach((t) => this.watchedInputs.set(t, e));
  }
  addCalculatedValues(e) {
    e.forEach((t) => {
      this.addCalculatedValue(t);
    });
  }
  loadCalculatedValues(e) {
    this.watchedInputs.clear(), this.addCalculatedValues(e);
  }
}
function h4(n, e) {
  const t = e.split("."), r = t.shift();
  if (!r)
    throw new Error("error getting data type of output for calculated value");
  const o = n[r];
  if (o)
    return dv(o, t);
}
function dv(n, e) {
  n instanceof Pm && (n = n.unwrap());
  const t = e.shift();
  if (!t)
    return n;
  if (n instanceof Am) {
    const r = n.shape[t];
    return dv(r, e);
  }
  throw new Error(`don't know how to retreive path for: ${t}.${e.join(".")}`);
}
const lg = 1.618;
class je {
  constructor(e, t, r, o, a = {}) {
    var u;
    this.dragging = !1, this.parentGraph = e, this.id = t, this.opts = a, this.changeManager = new c4(), this.changeManager.loadCalculatedValues(this.parentGraph.styles.getCalculatedStylesForNode(o)), this.data = this.changeManager.watch("data", o), this.algorithmResults = this.changeManager.watch("algorithmResults", {}), this.styleUpdates = this.changeManager.addData("style", {}, eu), this.styleId = r, (u = this.parentGraph.layoutEngine) == null || u.addNode(this), this.mesh = je.defaultNodeMeshFactory(this, this.parentGraph, r);
  }
  addCalculatedStyle(e) {
    this.changeManager.addCalculatedValue(e);
  }
  update() {
    var r;
    const e = Object.keys(this.styleUpdates);
    if (e.length > 0) {
      let o = En.getStyleForNodeStyleId(this.styleId);
      o = TA.defaultsDeep(this.styleUpdates, o);
      const a = En.getNodeIdForStyle(o);
      this.updateStyle(a);
      for (const u of e)
        delete this.styleUpdates[u];
    }
    if (this.dragging)
      return;
    const t = (r = this.parentGraph.layoutEngine) == null ? void 0 : r.getNodePosition(this);
    t && (this.mesh.position.x = t.x, this.mesh.position.y = t.y, this.mesh.position.z = t.z ?? 0);
  }
  updateStyle(e) {
    e !== this.styleId && (this.styleId = e, this.mesh.dispose(), this.mesh = je.defaultNodeMeshFactory(this, this.parentGraph, e));
  }
  pin() {
    var e;
    (e = this.parentGraph.layoutEngine) == null || e.pin(this);
  }
  unpin() {
    var e;
    (e = this.parentGraph.layoutEngine) == null || e.unpin(this);
  }
  static defaultNodeMeshFactory(e, t, r) {
    var u, h;
    const o = En.getStyleForNodeStyleId(r);
    e.size = ((u = o.shape) == null ? void 0 : u.size) ?? 0;
    const a = t.styles.config.graph.twoD;
    return e.mesh = t.meshCache.get(`node-style-${r}-${a ? "2d" : "3d"}`, () => {
      var g, v, b;
      let c;
      if (!o.shape)
        throw new TypeError("shape required to create mesh");
      switch (o.shape.type) {
        case "box":
          c = je.createBox(e, t, o);
          break;
        case "sphere":
          c = je.createSphere(e, t, o);
          break;
        case "cylinder":
          c = je.createCylinder(e, t, o);
          break;
        case "cone":
          c = je.createCone(e, t, o);
          break;
        case "capsule":
          c = je.createCapsule(e, t, o);
          break;
        // Torus disabled because it breaks ray finding with arrowcaps whe
        // the ray shoots right through the hole in the center of the torus
        // case "torus":
        //     mesh = Node.createTorus(n, g, o);
        //     break;
        case "torus-knot":
          c = je.createTorusKnot(e, t, o);
          break;
        case "tetrahedron":
          c = je.createPolyhedron(0, e, t, o);
          break;
        case "octahedron":
          c = je.createPolyhedron(1, e, t, o);
          break;
        case "dodecahedron":
          c = je.createPolyhedron(2, e, t, o);
          break;
        case "icosahedron":
          c = je.createPolyhedron(3, e, t, o);
          break;
        case "rhombicuboctahedron":
          c = je.createPolyhedron(4, e, t, o);
          break;
        case "triangular_prism":
          c = je.createPolyhedron(5, e, t, o);
          break;
        case "pentagonal_prism":
          c = je.createPolyhedron(6, e, t, o);
          break;
        case "hexagonal_prism":
          c = je.createPolyhedron(7, e, t, o);
          break;
        case "square_pyramid":
          c = je.createPolyhedron(8, e, t, o);
          break;
        case "pentagonal_pyramid":
          c = je.createPolyhedron(9, e, t, o);
          break;
        case "triangular_dipyramid":
          c = je.createPolyhedron(10, e, t, o);
          break;
        case "pentagonal_dipyramid":
          c = je.createPolyhedron(11, e, t, o);
          break;
        case "elongated_square_dypyramid":
          c = je.createPolyhedron(12, e, t, o);
          break;
        case "elongated_pentagonal_dipyramid":
          c = je.createPolyhedron(13, e, t, o);
          break;
        case "elongated_pentagonal_cupola":
          c = je.createPolyhedron(14, e, t, o);
          break;
        case "goldberg":
          c = je.createGoldberg(e, t, o);
          break;
        case "icosphere":
          c = je.createIcoSphere(e, t, o);
          break;
        case "geodesic":
          c = je.createGeodesic(e, t, o);
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
      const f = new Mg("defaultMaterial");
      let d;
      if (typeof ((g = o.texture) == null ? void 0 : g.color) == "string")
        d = Mr.FromHexString(o.texture.color);
      else if (typeof ((v = o.texture) == null ? void 0 : v.color) == "object")
        switch (o.texture.color.colorType) {
          case "solid":
            d = Mr.FromHexString(o.texture.color.value ?? "##FFFFFF"), c.visibility = o.texture.color.opacity ?? 1;
            break;
          // TODO
          // case "gradient":
          // case "radial-gradient":
          default:
            throw new TypeError(`unknown advanced colorType ${o.texture.color.colorType}`);
        }
      return f.wireframe = ((b = o.effect) == null ? void 0 : b.wireframe) ?? !1, d && !t.styles.config.graph.twoD ? f.diffuseColor = d : d && (f.disableLighting = !0, f.emissiveColor = d), f.freeze(), c.material = f, c;
    }), (h = o.label) != null && h.enabled && (e.label = je.createLabel(e, o)), je.addDefaultBehaviors(e, e.opts), e.mesh;
  }
  static createBox(e, t, r) {
    var o;
    return jn.CreateBox("box", { size: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createSphere(e, t, r) {
    var o;
    return jn.CreateSphere("sphere", { diameter: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createCylinder(e, t, r) {
    var o, a;
    return jn.CreateCylinder("cylinder", { height: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * lg, diameter: ((a = r.shape) == null ? void 0 : a.size) ?? 1 });
  }
  static createCone(e, t, r) {
    var o, a;
    return jn.CreateCylinder("cylinder", { height: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * lg, diameterTop: 0, diameterBottom: ((a = r.shape) == null ? void 0 : a.size) ?? 1 });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createCapsule(e, t, r) {
    return jn.CreateCapsule("capsule", {});
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createTorus(e, t, r) {
    return jn.CreateTorus("torus", {});
  }
  static createTorusKnot(e, t, r) {
    var o, a;
    return jn.CreateTorusKnot("tk", { radius: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * 0.3, tube: ((a = r.shape) == null ? void 0 : a.size) ?? 1 * 0.2, radialSegments: 128 });
  }
  static createPolyhedron(e, t, r, o) {
    var a;
    return jn.CreatePolyhedron("polyhedron", { size: ((a = o.shape) == null ? void 0 : a.size) ?? 1, type: e });
  }
  static createGoldberg(e, t, r) {
    var o;
    return jn.CreateGoldberg("goldberg", { size: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createIcoSphere(e, t, r) {
    var o;
    return jn.CreateIcoSphere("icosphere", { radius: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * 0.75 });
  }
  static createGeodesic(e, t, r) {
    var o;
    return jn.CreateGeodesic("geodesic", { size: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createLabel(e, t) {
    let r = e.id.toString();
    const o = t.label;
    if (o.text !== void 0 && o.text !== null)
      (typeof o.text == "string" || typeof o.text == "number" || typeof o.text == "boolean") && (r = String(o.text));
    else if (o.textPath && typeof o.textPath == "string")
      try {
        const c = Kr.search(e.data, o.textPath);
        c != null && (r = String(c));
      } catch {
      }
    const a = t.label ? HE(t.label) : {}, u = {
      text: r,
      attachTo: e.mesh,
      attachPosition: je.getAttachPosition(a.location ?? "top"),
      attachOffset: a.attachOffset ?? je.getDefaultAttachOffset(a.location ?? "top")
    };
    return a.font !== void 0 && (u.font = a.font), a.fontSize !== void 0 && (u.fontSize = a.fontSize), a.fontWeight !== void 0 && (u.fontWeight = a.fontWeight), a.lineHeight !== void 0 && (u.lineHeight = a.lineHeight), a.textColor !== void 0 && (u.textColor = a.textColor), a.backgroundColor !== void 0 && (u.backgroundColor = je.getBackgroundColor(a.backgroundColor)), a.borderWidth !== void 0 && (u.borderWidth = a.borderWidth), a.borderColor !== void 0 && (u.borderColor = a.borderColor), a.borders !== void 0 && (u.borders = a.borders), a.marginTop !== void 0 && (u.marginTop = a.marginTop), a.marginBottom !== void 0 && (u.marginBottom = a.marginBottom), a.marginLeft !== void 0 && (u.marginLeft = a.marginLeft), a.marginRight !== void 0 && (u.marginRight = a.marginRight), a.textAlign !== void 0 && (u.textAlign = a.textAlign), a.cornerRadius !== void 0 && (u.cornerRadius = a.cornerRadius), a.autoSize !== void 0 && (u.autoSize = a.autoSize), a.resolution !== void 0 && (u.resolution = a.resolution), a.billboardMode !== void 0 && (u.billboardMode = a.billboardMode), a.position !== void 0 && (u.position = a.position), a.attachOffset !== void 0 && (u.attachOffset = a.attachOffset), a.depthFadeEnabled !== void 0 && (u.depthFadeEnabled = a.depthFadeEnabled), a.depthFadeNear !== void 0 && (u.depthFadeNear = a.depthFadeNear), a.depthFadeFar !== void 0 && (u.depthFadeFar = a.depthFadeFar), a.textOutline !== void 0 && (u.textOutline = a.textOutline), a.textOutlineWidth !== void 0 && (u.textOutlineWidth = a.textOutlineWidth), a.textOutlineColor !== void 0 && (u.textOutlineColor = a.textOutlineColor), a.textOutlineJoin !== void 0 && (u.textOutlineJoin = a.textOutlineJoin), a.textShadow !== void 0 && (u.textShadow = a.textShadow), a.textShadowColor !== void 0 && (u.textShadowColor = a.textShadowColor), a.textShadowBlur !== void 0 && (u.textShadowBlur = a.textShadowBlur), a.textShadowOffsetX !== void 0 && (u.textShadowOffsetX = a.textShadowOffsetX), a.textShadowOffsetY !== void 0 && (u.textShadowOffsetY = a.textShadowOffsetY), a.backgroundPadding !== void 0 && (u.backgroundPadding = a.backgroundPadding), a.backgroundGradient !== void 0 && (u.backgroundGradient = a.backgroundGradient), a.backgroundGradientType !== void 0 && (u.backgroundGradientType = a.backgroundGradientType), a.backgroundGradientColors !== void 0 && (u.backgroundGradientColors = a.backgroundGradientColors), a.backgroundGradientDirection !== void 0 && (u.backgroundGradientDirection = a.backgroundGradientDirection), a.pointer !== void 0 && (u.pointer = a.pointer), a.pointerDirection !== void 0 && (u.pointerDirection = a.pointerDirection), a.pointerWidth !== void 0 && (u.pointerWidth = a.pointerWidth), a.pointerHeight !== void 0 && (u.pointerHeight = a.pointerHeight), a.pointerOffset !== void 0 && (u.pointerOffset = a.pointerOffset), a.pointerCurve !== void 0 && (u.pointerCurve = a.pointerCurve), a.animation && (u.animation = a.animation), a.animationSpeed !== void 0 && (u.animationSpeed = a.animationSpeed), a.badge !== void 0 && (u.badge = a.badge), a.icon !== void 0 && (u.icon = a.icon), a.iconPosition !== void 0 && (u.iconPosition = a.iconPosition), a.progress !== void 0 && (u.progress = a.progress), a.smartOverflow !== void 0 && (u.smartOverflow = a.smartOverflow), a.maxNumber !== void 0 && (u.maxNumber = a.maxNumber), a.overflowSuffix !== void 0 && (u.overflowSuffix = a.overflowSuffix), a.attachOffset !== void 0 && (u.attachOffset = a.attachOffset), new Ou(e.parentGraph.scene, u);
  }
  static getBackgroundColor(e) {
    if (typeof e == "string")
      return e;
    if (e && typeof e == "object" && "colorType" in e) {
      const t = e;
      if (t.colorType === "solid" && t.value)
        return t.value;
    }
    return "transparent";
  }
  static getAttachPosition(e) {
    switch (e) {
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
        return e;
      default:
        return "top";
    }
  }
  static getDefaultAttachOffset(e) {
    switch (e) {
      case "left":
      case "right":
        return 1;
      // Larger offset for horizontal positions
      case "center":
        return 0;
      // No offset for center
      default:
        return 0.5;
    }
  }
  static addDefaultBehaviors(e, t) {
    if (e.mesh.isPickable = !0, e.pinOnDrag = t.pinOnDrag ?? !0, e.meshDragBehavior = new A5(), e.mesh.addBehavior(e.meshDragBehavior), e.meshDragBehavior.onDragStartObservable.add(() => {
      e.parentGraph.running = !0, e.dragging = !0;
    }), e.meshDragBehavior.onDragEndObservable.add(() => {
      e.parentGraph.running = !0, e.pinOnDrag && e.pin(), e.dragging = !1;
    }), e.meshDragBehavior.onPositionChangedObservable.add((r) => {
      var o;
      e.parentGraph.running = !0, (o = e.parentGraph.layoutEngine) == null || o.setNodePosition(e, r.position);
    }), e.mesh.actionManager = e.mesh.actionManager ?? new ap(e.parentGraph.scene), e.parentGraph.fetchNodes && e.parentGraph.fetchEdges) {
      const { fetchNodes: r, fetchEdges: o } = e.parentGraph;
      e.mesh.actionManager.registerAction(
        new I5(
          {
            trigger: ap.OnDoublePickTrigger
            // trigger: ActionManager.OnLongPressTrigger,
          },
          () => {
            e.parentGraph.running = !0;
            const a = o(e, e.parentGraph), u = /* @__PURE__ */ new Set();
            a.forEach((c) => {
              u.add(c.src), u.add(c.dst);
            }), u.delete(e.id);
            const h = r(u, e.parentGraph);
            e.parentGraph.addNodes([...h]), e.parentGraph.addEdges([...a]);
          }
        )
      );
    }
  }
}
class f4 {
  constructor(e) {
    this.graphStep = new io(), this.nodeUpdate = new io(), this.edgeUpdate = new io(), this.arrowCapUpdate = new io(), this.intersectCalc = new io(), this.loadTime = new io(), this.totalUpdates = 0, this.graph = e, this.sceneInstrumentation = new P5(e.scene), this.sceneInstrumentation.captureFrameTime = !0, this.sceneInstrumentation.captureRenderTime = !0, this.sceneInstrumentation.captureInterFrameTime = !0, this.sceneInstrumentation.captureCameraRenderTime = !0, this.sceneInstrumentation.captureActiveMeshesEvaluationTime = !0, this.sceneInstrumentation.captureRenderTargetsRenderTime = !0, this.babylonInstrumentation = new O5(e.engine), this.babylonInstrumentation.captureGPUFrameTime = !0, this.babylonInstrumentation.captureShaderCompilationTime = !0;
  }
  toString() {
    let e = "";
    function t(a, u, h = "") {
      e += `${a}: ${u}${h}
`;
    }
    function r(a) {
      e += `
${a}
`;
      for (let u = 0; u < a.length; u++)
        e += "-";
      e += `
`;
    }
    function o(a, u, h = 1) {
      e += `${a} (min/avg/last sec/max [total]): `, e += `${(u.min * h).toFixed(2)} / `, e += `${(u.average * h).toFixed(2)} / `, e += `${(u.lastSecAverage * h).toFixed(2)} / `, e += `${(u.max * h).toFixed(2)} `, e += `[${(u.total * h).toFixed(2)}] ms
`;
    }
    return r("Graph"), t("Num Nodes", this.numNodes), t("Num Edges", this.numEdges), t("Total Updates", this.totalUpdates), t("Mesh Cache Hits", this.meshCacheHits), t("Mesh Cache Misses", this.meshCacheMisses), t("Number of Node Updates", this.nodeUpdate.count), t("Number of Edge Updates", this.edgeUpdate.count), t("Number of ArrowCap Updates", this.arrowCapUpdate.count), r("Graph Engine Performance"), o("JSON Load Time", this.loadTime), o("Graph Physics Engine Time", this.graphStep), o("Node Update Time", this.nodeUpdate), o("Edge Update Time", this.edgeUpdate), o("Arrow Cap Update Time", this.arrowCapUpdate), o("Ray Intersect Calculation Time", this.intersectCalc), r("BabylonJS Performance"), t("Draw Calls", this.sceneInstrumentation.drawCallsCounter.count), o("GPU Time", this.babylonInstrumentation.gpuFrameTimeCounter, 1e-6), o("Shader Time", this.babylonInstrumentation.shaderCompilationTimeCounter), o("Mesh Evaluation Time", this.sceneInstrumentation.activeMeshesEvaluationTimeCounter), o("Render Targets Time", this.sceneInstrumentation.renderTargetsRenderTimeCounter), o("Draw Calls Time", this.sceneInstrumentation.drawCallsCounter), o("Frame Time", this.sceneInstrumentation.frameTimeCounter), o("Render Time", this.sceneInstrumentation.renderTimeCounter), o("Time Between Frames", this.sceneInstrumentation.interFrameTimeCounter), o("Camera Render Time", this.sceneInstrumentation.cameraRenderTimeCounter), e;
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
class d4 {
  constructor(e) {
    if (this.nodes = /* @__PURE__ */ new Map(), this.edges = /* @__PURE__ */ new Map(), this.xrHelper = null, this.edgeCache = new MA(), this.nodeCache = /* @__PURE__ */ new Map(), this.needRays = !1, this.running = !1, this.initialized = !1, this.runAlgorithmsOnLoad = !1, this.graphObservable = new Xl(), this.nodeObservable = new Xl(), this.edgeObservable = new Xl(), this.meshCache = new JI(), this.styles = En.default(), typeof e == "string") {
      const h = document.getElementById(e);
      if (!h)
        throw new Error(`getElementById() could not find element '${e}'`);
      this.element = h;
    } else if (e instanceof Element)
      this.element = e;
    else
      throw new TypeError("Graph constructor requires 'element' argument that is either a string specifying the ID of the HTML element or an Element");
    this.element.innerHTML = "", this.canvas = document.createElement("canvas"), this.canvas.setAttribute("id", `babylonForceGraphRenderCanvas${Date.now()}`), this.canvas.setAttribute("touch-action", "none"), this.canvas.setAttribute("autofocus", "true"), this.canvas.setAttribute("tabindex", "0"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.touchAction = "none", this.element.appendChild(this.canvas), up.LogLevels = up.ErrorLogLevel, this.engine = new Ga(this.canvas, !0), this.scene = new k5(this.engine), this.camera = new qI(this.scene);
    const t = new HI(this.canvas, this.scene, {
      trackballRotationSpeed: 5e-3,
      keyboardRotationSpeed: 0.03,
      keyboardZoomSpeed: 0.2,
      keyboardYawSpeed: 0.02,
      pinchZoomSensitivity: 10,
      twistYawSensitivity: 1.5,
      minZoomDistance: 2,
      maxZoomDistance: 500,
      inertiaDamping: 0.9
    }), r = new jI(this.canvas, t);
    this.camera.registerCamera("orbit", t, r);
    const o = new VI(this.scene, this.engine, this.canvas, {
      panAcceleration: 0.02,
      panDamping: 0.85,
      zoomFactorPerFrame: 0.02,
      zoomDamping: 0.85,
      zoomMin: 0.1,
      zoomMax: 500,
      rotateSpeedPerFrame: 0.02,
      rotateDamping: 0.85,
      rotateMin: null,
      rotateMax: null,
      mousePanScale: 1,
      mouseWheelZoomSpeed: 1.1,
      touchPanScale: 1,
      touchPinchMin: 0.1,
      touchPinchMax: 100,
      initialOrthoSize: 5,
      rotationEnabled: !0,
      inertiaEnabled: !0
    }), a = new KI(o, this.canvas, {
      panAcceleration: 0.02,
      panDamping: 0.85,
      zoomFactorPerFrame: 0.02,
      zoomDamping: 0.85,
      zoomMin: 0.1,
      zoomMax: 100,
      rotateSpeedPerFrame: 0.02,
      rotateDamping: 0.85,
      rotateMin: null,
      rotateMax: null,
      mousePanScale: 1,
      mouseWheelZoomSpeed: 1.1,
      touchPanScale: 1,
      touchPinchMin: 0.1,
      touchPinchMax: 100,
      initialOrthoSize: 5,
      rotationEnabled: !0,
      inertiaEnabled: !0
    });
    this.camera.registerCamera("2d", o, a), this.camera.activateCamera("orbit"), new $5("light", new kt(1, 1, 0));
    const u = "#F5F5F5";
    this.scene.clearColor = Za.FromHexString(u), this.setLayout("ngraph").catch((h) => {
      console.error("ERROR setting default layout:", h);
    }), this.stats = new f4(this);
  }
  shutdown() {
    this.engine.dispose();
  }
  async init() {
    this.initialized || (await this.scene.whenReadyAsync(), this.engine.runRenderLoop(() => {
      this.update(), this.scene.render();
    }), window.addEventListener("resize", () => {
      this.engine.resize();
    }), this.initialized = !0);
  }
  update() {
    var h, c;
    if (this.camera.update(), !this.running)
      return;
    this.stats.step(), this.stats.graphStep.beginMonitoring();
    for (let f = 0; f < this.styles.config.behavior.layout.stepMultiplier; f++)
      (h = this.layoutEngine) == null || h.step();
    this.stats.graphStep.endMonitoring();
    let e, t;
    function r(f) {
      const d = f.mesh.getAbsolutePosition(), g = f.size;
      if (!e || !t) {
        e = d.clone(), t = d.clone();
        return;
      }
      Mc(d, e, g, "x"), Mc(d, e, g, "y"), Mc(d, e, g, "z"), Ec(d, t, g, "x"), Ec(d, t, g, "y"), Ec(d, t, g, "z");
    }
    if (this.stats.nodeUpdate.beginMonitoring(), this.layoutEngine)
      for (const f of this.layoutEngine.nodes)
        f.update(), r(f);
    if (this.stats.nodeUpdate.endMonitoring(), this.stats.edgeUpdate.beginMonitoring(), rr.updateRays(this), this.layoutEngine)
      for (const f of this.layoutEngine.edges)
        f.update();
    this.stats.edgeUpdate.endMonitoring();
    const o = 1.3, a = (e == null ? void 0 : e.multiplyByFloats(o, o, o)) ?? new kt(-20, -20, -20), u = (t == null ? void 0 : t.multiplyByFloats(o, o, o)) ?? new kt(20, 20, 20);
    this.camera.zoomToBoundingBox(a, u), (c = this.layoutEngine) != null && c.isSettled && (this.graphObservable.notifyObservers({ type: "graph-settled", graph: this }), this.running = !1);
  }
  async setStyleTemplate(e) {
    const t = this.styles.config.graph.twoD;
    this.styles = En.fromObject(e);
    const r = this.styles.config.graph.twoD;
    t !== r && this.meshCache.clear();
    for (const u of this.nodes.values()) {
      const h = this.styles.getStyleForNode(u.data);
      u.changeManager.loadCalculatedValues(this.styles.getCalculatedStylesForNode(u.data)), u.updateStyle(h);
    }
    for (const u of this.edges.values()) {
      const h = this.styles.getStyleForEdge(u.data);
      u.updateStyle(h);
    }
    if (this.styles.config.graph.background.backgroundType === "skybox" && typeof this.styles.config.graph.background.data == "string") {
      const u = new N5(
        "testdome",
        this.styles.config.graph.background.data,
        {
          resolution: 32,
          size: 500
        },
        this.scene
      );
      u.rotation.z = -Math.PI / 2, u.rotation.x = Math.PI;
    }
    const o = "#F5F5F5";
    this.styles.config.graph.background.backgroundType === "color" && this.styles.config.graph.background.color ? this.scene.clearColor = Za.FromHexString(this.styles.config.graph.background.color) : this.scene.clearColor = Za.FromHexString(o);
    const a = this.styles.config.graph.twoD ? "2d" : "orbit";
    this.camera.activateCamera(a);
    try {
      if (this.layoutEngine) {
        const u = this.styles.config.graph.twoD ? 2 : 3, h = _t.getOptionsForDimensionByType(this.layoutEngine.type, u);
        if (h && Object.keys(h).length > 0) {
          const c = this.layoutEngine.type, f = this.layoutEngine.config ? { ...this.layoutEngine.config } : {}, d = _t.getOptionsForDimensionByType(c, 2), g = _t.getOptionsForDimensionByType(c, 3);
          (/* @__PURE__ */ new Set([
            ...Object.keys(d ?? {}),
            ...Object.keys(g ?? {})
          ])).forEach((b) => {
            delete f[b];
          }), await this.setLayout(c, f);
        }
      }
    } catch {
    }
    if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms)
      for (const u of this.styles.config.data.algorithms) {
        const [h, c] = u.split(":");
        await this.runAlgorithm(h, c);
      }
    return this.styles;
  }
  async addDataFromSource(e, t = {}) {
    this.stats.loadTime.beginMonitoring();
    const r = Nh.get(e, t);
    if (!r)
      throw new TypeError(`No data source named: ${e}`);
    for await (const o of r.getData())
      this.addNodes(o.nodes), this.addEdges(o.edges);
    this.stats.loadTime.endMonitoring();
  }
  addNode(e, t) {
    this.addNodes([e], t);
  }
  addNodes(e, t) {
    const r = t ?? this.styles.config.data.knownFields.nodeIdPath;
    for (const o of e) {
      const a = Kr.search(o, r);
      if (this.nodeCache.get(a))
        continue;
      const u = this.styles.getStyleForNode(o), h = new je(this, a, u, o, {
        pinOnDrag: this.pinOnDrag
      });
      this.nodeCache.set(a, h), this.nodes.set(a, h);
    }
    this.running = !0;
  }
  addEdge(e, t, r) {
    this.addEdges([e], t, r);
  }
  addEdges(e, t, r) {
    const o = t ?? this.styles.config.data.knownFields.edgeSrcIdPath, a = r ?? this.styles.config.data.knownFields.edgeDstIdPath;
    for (const u of e) {
      const h = Kr.search(u, o), c = Kr.search(u, a);
      if (this.edgeCache.get(h, c))
        continue;
      const f = this.styles.getStyleForEdge(u), d = {}, g = new rr(this, h, c, f, u, d);
      this.edgeCache.set(h, c, g), this.edges.set(g.id, g);
    }
    this.running = !0;
  }
  async setLayout(e, t = {}) {
    const r = { ...t }, o = this.styles.config.graph.twoD ? 2 : 3, a = _t.getOptionsForDimensionByType(e, o);
    a && Object.keys(a).forEach((h) => {
      h in r || (r[h] = a[h]);
    });
    const u = _t.get(e, r);
    if (!u)
      throw new TypeError(`No layout named: ${e}`);
    u.addNodes([...this.nodes.values()]), u.addEdges([...this.edges.values()]), this.layoutEngine = u, await u.init();
    for (let h = 0; h < this.styles.config.behavior.layout.preSteps; h++)
      this.layoutEngine.step();
    this.running = !0;
  }
  async runAlgorithm(e, t) {
    const r = Fh.get(this, e, t);
    if (!r)
      throw new Error(`algorithm not found: ${e}:${t}`);
    await r.run(this);
  }
  addListener(e, t) {
    switch (e) {
      case "graph-settled":
        this.graphObservable.add((r) => {
          t(r);
        });
        break;
      default:
        throw new TypeError(`Unknown listener type in addListener: ${e}`);
    }
  }
}
function Mc(n, e, t, r) {
  const o = n[r] - t;
  o < e[r] && (e[r] = o);
}
function Ec(n, e, t, r) {
  const o = n[r] + t;
  o > e[r] && (e[r] = o);
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Wa = globalThis, qh = Wa.ShadowRoot && (Wa.ShadyCSS === void 0 || Wa.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, pv = Symbol(), cg = /* @__PURE__ */ new WeakMap();
let p4 = class {
  constructor(e, t, r) {
    if (this._$cssResult$ = !0, r !== pv) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (qh && e === void 0) {
      const r = t !== void 0 && t.length === 1;
      r && (e = cg.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && cg.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const g4 = (n) => new p4(typeof n == "string" ? n : n + "", void 0, pv), m4 = (n, e) => {
  if (qh) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const r = document.createElement("style"), o = Wa.litNonce;
    o !== void 0 && r.setAttribute("nonce", o), r.textContent = t.cssText, n.appendChild(r);
  }
}, hg = qh ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const r of e.cssRules) t += r.cssText;
  return g4(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: v4, defineProperty: _4, getOwnPropertyDescriptor: y4, getOwnPropertyNames: b4, getOwnPropertySymbols: w4, getPrototypeOf: x4 } = Object, Jr = globalThis, fg = Jr.trustedTypes, T4 = fg ? fg.emptyScript : "", Ac = Jr.reactiveElementPolyfillSupport, rs = (n, e) => n, su = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? T4 : null;
      break;
    case Object:
    case Array:
      n = n == null ? n : JSON.stringify(n);
  }
  return n;
}, fromAttribute(n, e) {
  let t = n;
  switch (e) {
    case Boolean:
      t = n !== null;
      break;
    case Number:
      t = n === null ? null : Number(n);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(n);
      } catch {
        t = null;
      }
  }
  return t;
} }, Hh = (n, e) => !v4(n, e), dg = { attribute: !0, type: String, converter: su, reflect: !1, useDefault: !1, hasChanged: Hh };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Jr.litPropertyMetadata ?? (Jr.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class ho extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = dg) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const r = Symbol(), o = this.getPropertyDescriptor(e, r, t);
      o !== void 0 && _4(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, r) {
    const { get: o, set: a } = y4(this.prototype, e) ?? { get() {
      return this[t];
    }, set(u) {
      this[t] = u;
    } };
    return { get: o, set(u) {
      const h = o == null ? void 0 : o.call(this);
      a == null || a.call(this, u), this.requestUpdate(e, h, r);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? dg;
  }
  static _$Ei() {
    if (this.hasOwnProperty(rs("elementProperties"))) return;
    const e = x4(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(rs("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(rs("properties"))) {
      const t = this.properties, r = [...b4(t), ...w4(t)];
      for (const o of r) this.createProperty(o, t[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [r, o] of t) this.elementProperties.set(r, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, r] of this.elementProperties) {
      const o = this._$Eu(t, r);
      o !== void 0 && this._$Eh.set(o, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const r = new Set(e.flat(1 / 0).reverse());
      for (const o of r) t.unshift(hg(o));
    } else e !== void 0 && t.push(hg(e));
    return t;
  }
  static _$Eu(e, t) {
    const r = t.attribute;
    return r === !1 ? void 0 : typeof r == "string" ? r : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var e;
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (e = this.constructor.l) == null || e.forEach((t) => t(this));
  }
  addController(e) {
    var t;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && ((t = e.hostConnected) == null || t.call(e));
  }
  removeController(e) {
    var t;
    (t = this._$EO) == null || t.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const r of t.keys()) this.hasOwnProperty(r) && (e.set(r, this[r]), delete this[r]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return m4(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    var e;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), (e = this._$EO) == null || e.forEach((t) => {
      var r;
      return (r = t.hostConnected) == null ? void 0 : r.call(t);
    });
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    var e;
    (e = this._$EO) == null || e.forEach((t) => {
      var r;
      return (r = t.hostDisconnected) == null ? void 0 : r.call(t);
    });
  }
  attributeChangedCallback(e, t, r) {
    this._$AK(e, r);
  }
  _$ET(e, t) {
    var a;
    const r = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, r);
    if (o !== void 0 && r.reflect === !0) {
      const u = (((a = r.converter) == null ? void 0 : a.toAttribute) !== void 0 ? r.converter : su).toAttribute(t, r.type);
      this._$Em = e, u == null ? this.removeAttribute(o) : this.setAttribute(o, u), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var a, u;
    const r = this.constructor, o = r._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const h = r.getPropertyOptions(o), c = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((a = h.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? h.converter : su;
      this._$Em = o, this[o] = c.fromAttribute(t, h.type) ?? ((u = this._$Ej) == null ? void 0 : u.get(o)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(e, t, r) {
    var o;
    if (e !== void 0) {
      const a = this.constructor, u = this[e];
      if (r ?? (r = a.getPropertyOptions(e)), !((r.hasChanged ?? Hh)(u, t) || r.useDefault && r.reflect && u === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, r)))) return;
      this.C(e, t, r);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: r, reflect: o, wrapped: a }, u) {
    r && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, u ?? t ?? this[e]), a !== !0 || u !== void 0) || (this._$AL.has(e) || (this.hasUpdated || r || (t = void 0), this._$AL.set(e, t)), o === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var r;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [a, u] of this._$Ep) this[a] = u;
        this._$Ep = void 0;
      }
      const o = this.constructor.elementProperties;
      if (o.size > 0) for (const [a, u] of o) {
        const { wrapped: h } = u, c = this[a];
        h !== !0 || this._$AL.has(a) || c === void 0 || this.C(a, void 0, u, c);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), (r = this._$EO) == null || r.forEach((o) => {
        var a;
        return (a = o.hostUpdate) == null ? void 0 : a.call(o);
      }), this.update(t)) : this._$EM();
    } catch (o) {
      throw e = !1, this._$EM(), o;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    var t;
    (t = this._$EO) == null || t.forEach((r) => {
      var o;
      return (o = r.hostUpdated) == null ? void 0 : o.call(r);
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
}
ho.elementStyles = [], ho.shadowRootOptions = { mode: "open" }, ho[rs("elementProperties")] = /* @__PURE__ */ new Map(), ho[rs("finalized")] = /* @__PURE__ */ new Map(), Ac == null || Ac({ ReactiveElement: ho }), (Jr.reactiveElementVersions ?? (Jr.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const is = globalThis, au = is.trustedTypes, pg = au ? au.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, gv = "$lit$", jr = `lit$${Math.random().toFixed(9).slice(2)}$`, mv = "?" + jr, S4 = `<${mv}>`, Ni = document, ps = () => Ni.createComment(""), gs = (n) => n === null || typeof n != "object" && typeof n != "function", Wh = Array.isArray, C4 = (n) => Wh(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", Ic = `[ 	
\f\r]`, Vo = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, gg = /-->/g, mg = />/g, xi = RegExp(`>|${Ic}(?:([^\\s"'>=/]+)(${Ic}*=${Ic}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), vg = /'/g, _g = /"/g, vv = /^(?:script|style|textarea|title)$/i, _o = Symbol.for("lit-noChange"), Lt = Symbol.for("lit-nothing"), yg = /* @__PURE__ */ new WeakMap(), Ai = Ni.createTreeWalker(Ni, 129);
function _v(n, e) {
  if (!Wh(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return pg !== void 0 ? pg.createHTML(e) : e;
}
const M4 = (n, e) => {
  const t = n.length - 1, r = [];
  let o, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", u = Vo;
  for (let h = 0; h < t; h++) {
    const c = n[h];
    let f, d, g = -1, v = 0;
    for (; v < c.length && (u.lastIndex = v, d = u.exec(c), d !== null); ) v = u.lastIndex, u === Vo ? d[1] === "!--" ? u = gg : d[1] !== void 0 ? u = mg : d[2] !== void 0 ? (vv.test(d[2]) && (o = RegExp("</" + d[2], "g")), u = xi) : d[3] !== void 0 && (u = xi) : u === xi ? d[0] === ">" ? (u = o ?? Vo, g = -1) : d[1] === void 0 ? g = -2 : (g = u.lastIndex - d[2].length, f = d[1], u = d[3] === void 0 ? xi : d[3] === '"' ? _g : vg) : u === _g || u === vg ? u = xi : u === gg || u === mg ? u = Vo : (u = xi, o = void 0);
    const b = u === xi && n[h + 1].startsWith("/>") ? " " : "";
    a += u === Vo ? c + S4 : g >= 0 ? (r.push(f), c.slice(0, g) + gv + c.slice(g) + jr + b) : c + jr + (g === -2 ? h : b);
  }
  return [_v(n, a + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ms {
  constructor({ strings: e, _$litType$: t }, r) {
    let o;
    this.parts = [];
    let a = 0, u = 0;
    const h = e.length - 1, c = this.parts, [f, d] = M4(e, t);
    if (this.el = ms.createElement(f, r), Ai.currentNode = this.el.content, t === 2 || t === 3) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (o = Ai.nextNode()) !== null && c.length < h; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const g of o.getAttributeNames()) if (g.endsWith(gv)) {
          const v = d[u++], b = o.getAttribute(g).split(jr), _ = /([.?@])?(.*)/.exec(v);
          c.push({ type: 1, index: a, name: _[2], strings: b, ctor: _[1] === "." ? A4 : _[1] === "?" ? I4 : _[1] === "@" ? P4 : Nu }), o.removeAttribute(g);
        } else g.startsWith(jr) && (c.push({ type: 6, index: a }), o.removeAttribute(g));
        if (vv.test(o.tagName)) {
          const g = o.textContent.split(jr), v = g.length - 1;
          if (v > 0) {
            o.textContent = au ? au.emptyScript : "";
            for (let b = 0; b < v; b++) o.append(g[b], ps()), Ai.nextNode(), c.push({ type: 2, index: ++a });
            o.append(g[v], ps());
          }
        }
      } else if (o.nodeType === 8) if (o.data === mv) c.push({ type: 2, index: a });
      else {
        let g = -1;
        for (; (g = o.data.indexOf(jr, g + 1)) !== -1; ) c.push({ type: 7, index: a }), g += jr.length - 1;
      }
      a++;
    }
  }
  static createElement(e, t) {
    const r = Ni.createElement("template");
    return r.innerHTML = e, r;
  }
}
function yo(n, e, t = n, r) {
  var u, h;
  if (e === _o) return e;
  let o = r !== void 0 ? (u = t._$Co) == null ? void 0 : u[r] : t._$Cl;
  const a = gs(e) ? void 0 : e._$litDirective$;
  return (o == null ? void 0 : o.constructor) !== a && ((h = o == null ? void 0 : o._$AO) == null || h.call(o, !1), a === void 0 ? o = void 0 : (o = new a(n), o._$AT(n, t, r)), r !== void 0 ? (t._$Co ?? (t._$Co = []))[r] = o : t._$Cl = o), o !== void 0 && (e = yo(n, o._$AS(n, e.values), o, r)), e;
}
class E4 {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: r } = this._$AD, o = ((e == null ? void 0 : e.creationScope) ?? Ni).importNode(t, !0);
    Ai.currentNode = o;
    let a = Ai.nextNode(), u = 0, h = 0, c = r[0];
    for (; c !== void 0; ) {
      if (u === c.index) {
        let f;
        c.type === 2 ? f = new Ms(a, a.nextSibling, this, e) : c.type === 1 ? f = new c.ctor(a, c.name, c.strings, this, e) : c.type === 6 && (f = new O4(a, this, e)), this._$AV.push(f), c = r[++h];
      }
      u !== (c == null ? void 0 : c.index) && (a = Ai.nextNode(), u++);
    }
    return Ai.currentNode = Ni, o;
  }
  p(e) {
    let t = 0;
    for (const r of this._$AV) r !== void 0 && (r.strings !== void 0 ? (r._$AI(e, r, t), t += r.strings.length - 2) : r._$AI(e[t])), t++;
  }
}
class Ms {
  get _$AU() {
    var e;
    return ((e = this._$AM) == null ? void 0 : e._$AU) ?? this._$Cv;
  }
  constructor(e, t, r, o) {
    this.type = 2, this._$AH = Lt, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = r, this.options = o, this._$Cv = (o == null ? void 0 : o.isConnected) ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && (e == null ? void 0 : e.nodeType) === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = yo(this, e, t), gs(e) ? e === Lt || e == null || e === "" ? (this._$AH !== Lt && this._$AR(), this._$AH = Lt) : e !== this._$AH && e !== _o && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : C4(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== Lt && gs(this._$AH) ? this._$AA.nextSibling.data = e : this.T(Ni.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    var a;
    const { values: t, _$litType$: r } = e, o = typeof r == "number" ? this._$AC(e) : (r.el === void 0 && (r.el = ms.createElement(_v(r.h, r.h[0]), this.options)), r);
    if (((a = this._$AH) == null ? void 0 : a._$AD) === o) this._$AH.p(t);
    else {
      const u = new E4(o, this), h = u.u(this.options);
      u.p(t), this.T(h), this._$AH = u;
    }
  }
  _$AC(e) {
    let t = yg.get(e.strings);
    return t === void 0 && yg.set(e.strings, t = new ms(e)), t;
  }
  k(e) {
    Wh(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let r, o = 0;
    for (const a of e) o === t.length ? t.push(r = new Ms(this.O(ps()), this.O(ps()), this, this.options)) : r = t[o], r._$AI(a), o++;
    o < t.length && (this._$AR(r && r._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    var r;
    for ((r = this._$AP) == null ? void 0 : r.call(this, !1, !0, t); e && e !== this._$AB; ) {
      const o = e.nextSibling;
      e.remove(), e = o;
    }
  }
  setConnected(e) {
    var t;
    this._$AM === void 0 && (this._$Cv = e, (t = this._$AP) == null || t.call(this, e));
  }
}
class Nu {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, r, o, a) {
    this.type = 1, this._$AH = Lt, this._$AN = void 0, this.element = e, this.name = t, this._$AM = o, this.options = a, r.length > 2 || r[0] !== "" || r[1] !== "" ? (this._$AH = Array(r.length - 1).fill(new String()), this.strings = r) : this._$AH = Lt;
  }
  _$AI(e, t = this, r, o) {
    const a = this.strings;
    let u = !1;
    if (a === void 0) e = yo(this, e, t, 0), u = !gs(e) || e !== this._$AH && e !== _o, u && (this._$AH = e);
    else {
      const h = e;
      let c, f;
      for (e = a[0], c = 0; c < a.length - 1; c++) f = yo(this, h[r + c], t, c), f === _o && (f = this._$AH[c]), u || (u = !gs(f) || f !== this._$AH[c]), f === Lt ? e = Lt : e !== Lt && (e += (f ?? "") + a[c + 1]), this._$AH[c] = f;
    }
    u && !o && this.j(e);
  }
  j(e) {
    e === Lt ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class A4 extends Nu {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === Lt ? void 0 : e;
  }
}
class I4 extends Nu {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== Lt);
  }
}
class P4 extends Nu {
  constructor(e, t, r, o, a) {
    super(e, t, r, o, a), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = yo(this, e, t, 0) ?? Lt) === _o) return;
    const r = this._$AH, o = e === Lt && r !== Lt || e.capture !== r.capture || e.once !== r.once || e.passive !== r.passive, a = e !== Lt && (r === Lt || o);
    o && this.element.removeEventListener(this.name, this, r), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    var t;
    typeof this._$AH == "function" ? this._$AH.call(((t = this.options) == null ? void 0 : t.host) ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class O4 {
  constructor(e, t, r) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = r;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    yo(this, e);
  }
}
const Pc = is.litHtmlPolyfillSupport;
Pc == null || Pc(ms, Ms), (is.litHtmlVersions ?? (is.litHtmlVersions = [])).push("3.3.0");
const k4 = (n, e, t) => {
  const r = (t == null ? void 0 : t.renderBefore) ?? e;
  let o = r._$litPart$;
  if (o === void 0) {
    const a = (t == null ? void 0 : t.renderBefore) ?? null;
    r._$litPart$ = o = new Ms(e.insertBefore(ps(), a), a, void 0, t ?? {});
  }
  return o._$AI(n), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Oi = globalThis;
class os extends ho {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = k4(t, this.renderRoot, this.renderOptions);
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
    return _o;
  }
}
var Cg;
os._$litElement$ = !0, os.finalized = !0, (Cg = Oi.litElementHydrateSupport) == null || Cg.call(Oi, { LitElement: os });
const Oc = Oi.litElementPolyfillSupport;
Oc == null || Oc({ LitElement: os });
(Oi.litElementVersions ?? (Oi.litElementVersions = [])).push("4.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const $4 = (n) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(n, e);
  }) : customElements.define(n, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N4 = { attribute: !0, type: String, converter: su, reflect: !1, hasChanged: Hh }, R4 = (n = N4, e, t) => {
  const { kind: r, metadata: o } = t;
  let a = globalThis.litPropertyMetadata.get(o);
  if (a === void 0 && globalThis.litPropertyMetadata.set(o, a = /* @__PURE__ */ new Map()), r === "setter" && ((n = Object.create(n)).wrapped = !0), a.set(t.name, n), r === "accessor") {
    const { name: u } = t;
    return { set(h) {
      const c = e.get.call(this);
      e.set.call(this, h), this.requestUpdate(u, c, n);
    }, init(h) {
      return h !== void 0 && this.C(u, void 0, n, h), h;
    } };
  }
  if (r === "setter") {
    const { name: u } = t;
    return function(h) {
      const c = this[u];
      e.call(this, h), this.requestUpdate(u, c, n);
    };
  }
  throw Error("Unsupported decorator location: " + r);
};
function Jn(n) {
  return (e, t) => typeof t == "object" ? R4(n, e, t) : ((r, o, a) => {
    const u = o.hasOwnProperty(a);
    return o.constructor.createProperty(a, r), u ? Object.getOwnPropertyDescriptor(o, a) : void 0;
  })(n, e, t);
}
var z4 = Object.defineProperty, D4 = Object.getOwnPropertyDescriptor, yv = (n) => {
  throw TypeError(n);
}, $n = (n, e, t, r) => {
  for (var o = r > 1 ? void 0 : r ? D4(e, t) : e, a = n.length - 1, u; a >= 0; a--)
    (u = n[a]) && (o = (r ? u(e, t, o) : u(o)) || o);
  return r && o && z4(e, t, o), o;
}, bv = (n, e, t) => e.has(n) || yv("Cannot " + t), en = (n, e, t) => (bv(n, e, "read from private field"), t ? t.call(n) : e.get(n)), bg = (n, e, t) => e.has(n) ? yv("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), wg = (n, e, t, r) => (bv(n, e, "write to private field"), e.set(n, t), t), Vt, Xo;
let pn = class extends os {
  constructor() {
    super(), bg(this, Vt), bg(this, Xo), wg(this, Xo, document.createElement("div")), wg(this, Vt, new d4(en(this, Xo)));
  }
  // connectedCallback() {
  //     super.connectedCallback();
  //     this.renderRoot.appendChild(this.#element);
  // }
  // update(changedProperties: Map<string, unknown>) {
  //     super.update(changedProperties);
  //     // console.log(`update: ${[... changedProperties.keys()].join(", ")}`);
  // }
  firstUpdated(n) {
    super.firstUpdated(n), this.asyncFirstUpdated(n).catch((e) => {
      throw e;
    });
  }
  async asyncFirstUpdated(n) {
    if (n.has("styleTemplate") && this.styleTemplate && await en(this, Vt).setStyleTemplate(this.styleTemplate), n.has("layout2d") && this.layout2d !== void 0 && Vn.set(en(this, Vt).styles.config, "graph.twoD", this.layout2d), n.has("runAlgorithmsOnLoad") && this.runAlgorithmsOnLoad !== void 0 && (en(this, Vt).runAlgorithmsOnLoad = !0), n.has("layout")) {
      const e = this.layout ?? "ngraph", t = this.layoutConfig ?? {};
      await en(this, Vt).setLayout(e, t);
    }
    if (n.has("nodeIdPath") && this.nodeIdPath && Vn.set(en(this, Vt).styles.config, "data.knownFields.nodeIdPath", this.nodeIdPath), n.has("edgeSrcIdPath") && this.edgeSrcIdPath && Vn.set(en(this, Vt).styles.config, "data.knownFields.edgeSrcIdPath", this.edgeSrcIdPath), n.has("edgeDstIdPath") && this.edgeDstIdPath && Vn.set(en(this, Vt).styles.config, "data.knownFields.edgeDstIdPath", this.edgeDstIdPath), n.has("nodeData") && Array.isArray(this.nodeData) && en(this, Vt).addNodes(this.nodeData), n.has("edgeData") && Array.isArray(this.edgeData) && en(this, Vt).addEdges(this.edgeData), n.has("dataSource") && this.dataSource) {
      const e = this.dataSourceConfig ?? {};
      await en(this, Vt).addDataFromSource(this.dataSource, e);
    }
    await en(this, Vt).init(), en(this, Vt).engine.resize();
  }
  render() {
    return en(this, Xo);
  }
  disconnectedCallback() {
    en(this, Vt).shutdown();
  }
  /**
   * The color to use for the background. Accepts any CSS 4 color specifier.
   */
  // @property({attribute: "background"})
  // background?: string;
  /**
   * Use a skybox image for the background. This can be a URL or base64
   * encoded data for the image.
   */
  // @property({attribute: "skybox"})
  // skybox?: string;
};
Vt = /* @__PURE__ */ new WeakMap();
Xo = /* @__PURE__ */ new WeakMap();
$n([
  Jn({ attribute: "node-data" })
], pn.prototype, "nodeData", 2);
$n([
  Jn({ attribute: "edge-data" })
], pn.prototype, "edgeData", 2);
$n([
  Jn({ attribute: "data-source" })
], pn.prototype, "dataSource", 2);
$n([
  Jn({ attribute: "data-source-config" })
], pn.prototype, "dataSourceConfig", 2);
$n([
  Jn({ attribute: "node-id-path" })
], pn.prototype, "nodeIdPath", 2);
$n([
  Jn({ attribute: "edge-src-id-path" })
], pn.prototype, "edgeSrcIdPath", 2);
$n([
  Jn({ attribute: "edge-src-id-path" })
], pn.prototype, "edgeDstIdPath", 2);
$n([
  Jn()
], pn.prototype, "layout", 2);
$n([
  Jn({ attribute: "layout-config" })
], pn.prototype, "layoutConfig", 2);
$n([
  Jn({ attribute: "layout-2d" })
], pn.prototype, "layout2d", 2);
$n([
  Jn({ attribute: "style-template" })
], pn.prototype, "styleTemplate", 2);
$n([
  Jn({ attribute: "run-algorithms-on-load" })
], pn.prototype, "runAlgorithmsOnLoad", 2);
pn = $n([
  $4("graphty-element")
], pn);
export {
  Nh as DataSource,
  rr as Edge,
  d4 as Graph,
  pn as Graphty,
  _t as LayoutEngine,
  je as Node,
  pA as StyleTemplate,
  En as Styles
};
