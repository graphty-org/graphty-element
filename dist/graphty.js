var m5 = Object.defineProperty;
var Xd = (n) => {
  throw TypeError(n);
};
var v5 = (n, e, t) => e in n ? m5(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var Hl = (n, e, t) => v5(n, typeof e != "symbol" ? e + "" : e, t), Wl = (n, e, t) => e.has(n) || Xd("Cannot " + t);
var jl = (n, e, t) => (Wl(n, e, "read from private field"), t ? t.call(n) : e.get(n)), ba = (n, e, t) => e.has(n) ? Xd("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), Vl = (n, e, t, r) => (Wl(n, e, "write to private field"), r ? r.call(n, t) : e.set(n, t), t), ep = (n, e, t) => (Wl(n, e, "access private method"), t);
import { Mesh as tp, Vector3 as $t, DynamicTexture as _5, Texture as y5, StandardMaterial as Mg, Color3 as Er, Engine as Ha, MeshBuilder as Wn, Ray as b5, GreasedLineTools as w5, CreateGreasedLine as Kl, GreasedLineMeshWidthDistribution as x5, RawTexture as np, GreasedLineMeshColorMode as T5, Color4 as Eg, TransformNode as Cg, UniversalCamera as S5, Axis as Jl, Space as Yl, Scalar as rp, FreeCamera as M5, Camera as E5, PointerEventTypes as Go, SixDofDragBehavior as C5, ActionManager as ip, ExecuteCodeAction as A5, PerfCounter as io, SceneInstrumentation as I5, EngineInstrumentation as P5, Observable as Ql, Logger as op, Scene as k5, HemisphericLight as $5, PhotoDome as O5 } from "@babylonjs/core";
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
function Wa(n, { precision: e, unit: t }) {
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
const N5 = {
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
      let f = c.match(r), p = c;
      if (f) {
        let g = f[0], m = p.slice(0, -g.length);
        g === "%" ? (p = new Number(m / 100), p.type = "<percentage>") : (p = new Number(m * N5[g]), p.type = "<angle>", p.unit = g);
      } else t.test(p) ? (p = new Number(p), p.type = "<number>") : p === "none" && (p = new Number(NaN), p.none = !0);
      h.startsWith("/") && (p = p instanceof Number ? p : new Number(p), p.alpha = !0), typeof p == "object" && p instanceof Number && (p.raw = c), u.push(p);
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
function kg(n, e, t) {
  return (t - n) / (e - n);
}
function gh(n, e, t) {
  return ss(e[0], e[1], kg(n[0], n[1], t));
}
function $g(n) {
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
function Og(n, e, t) {
  return Math.max(Math.min(t, e), n);
}
function Mu(n, e) {
  return Math.sign(n) === Math.sign(e) ? n : -n;
}
function ur(n, e) {
  return Mu(Math.abs(n) ** e, n);
}
function mh(n, e) {
  return e === 0 ? 0 : n / e;
}
function Ng(n, e, t = 0, r = n.length) {
  for (; t < r; ) {
    const o = t + r >> 1;
    n[o] < e ? t = o + 1 : r = o;
  }
  return t;
}
var R5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  bisectLeft: Ng,
  clamp: Og,
  copySign: Mu,
  interpolate: ss,
  interpolateInv: kg,
  isNone: Yr,
  isString: ys,
  last: Pg,
  mapRange: gh,
  multiplyMatrices: dt,
  parseCoordGrammar: $g,
  parseFunction: Ig,
  serializeNumber: Wa,
  skipNone: It,
  spow: ur,
  toPrecision: Ag,
  type: Vr,
  zdiv: mh
});
class z5 {
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
const Qr = new z5();
var wg, xg, Tg, In = {
  gamut_mapping: "css",
  precision: 5,
  deltaE: "76",
  // Default deltaE method
  verbose: ((Tg = (xg = (wg = globalThis == null ? void 0 : globalThis.process) == null ? void 0 : wg.env) == null ? void 0 : xg.NODE_ENV) == null ? void 0 : Tg.toLowerCase()) !== "test",
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
function Pc(n) {
  return Array.isArray(n) ? n : rn[n];
}
function ja(n, e, t, r = {}) {
  if (n = Pc(n), e = Pc(e), !n || !e)
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
const D5 = /* @__PURE__ */ new Set(["<number>", "<percentage>", "<angle>"]);
function sp(n, e, t, r) {
  return Object.entries(n.coords).map(([a, u], h) => {
    let c = e.coordGrammar[h], f = r[h], p = f == null ? void 0 : f.type, g;
    if (f.none ? g = c.find((_) => D5.has(_)) : g = c.find((_) => _ == p), !g) {
      let _ = u.name || a;
      throw new TypeError(`${p ?? f.raw} not allowed for ${_} in ${t}()`);
    }
    let m = g.range;
    p === "<percentage>" && (m || (m = [0, 1]));
    let b = u.range || u.refRange;
    return m && b && (r[h] = gh(m, b, r[h])), g;
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
      let c = t.parsed.args.shift(), f = c.startsWith("--") ? c.substring(2) : `--${c}`, p = [c, f], g = t.parsed.rawArgs.indexOf("/") > 0 ? t.parsed.args.pop() : 1;
      for (let _ of ye.all) {
        let $ = _.getFormat("color");
        if ($ && (p.includes($.id) || (o = $.ids) != null && o.filter((C) => p.includes(C)).length)) {
          const C = Object.keys(_.coords).map((I, T) => t.parsed.args[T] || 0);
          let S;
          return $.coordGrammar && (S = sp(_, $, "color", C)), e && Object.assign(e, { formatId: "color", types: S }), $.id.startsWith("--") && !c.startsWith("--") && In.warn(`${_.name} is a non-standard space and not currently supported in the CSS spec. Use prefixed color(${$.id}) instead of color(${c}).`), c.startsWith("--") && !$.id.startsWith("--") && In.warn(`${_.name} is a standard space and supported in the CSS spec. Use color(${$.id}) instead of prefixed color(${c}).`), { spaceId: _.id, coords: C, alpha: g };
        }
      }
      let m = "", b = c in ye.registry ? c : f;
      if (b in ye.registry) {
        let _ = (u = (a = ye.registry[b].formats) == null ? void 0 : a.color) == null ? void 0 : u.id;
        _ && (m = `Did you mean color(${_})?`);
      }
      throw new TypeError(`Cannot parse color(${c}). ` + (m || "Missing a plugin?"));
    } else
      for (let c of ye.all) {
        let f = c.getFormat(h);
        if (f && f.type === "function") {
          let p = 1;
          (f.lastAlpha || Pg(t.parsed.args).alpha) && (p = t.parsed.args.pop());
          let g = t.parsed.args, m;
          return f.coordGrammar && (m = sp(c, f, h, g)), e && Object.assign(e, { formatId: f.name, types: m }), {
            spaceId: c.id,
            coords: g,
            alpha: p
          };
        }
      }
  } else
    for (let h of ye.all)
      for (let c in h.formats) {
        let f = h.formats[c];
        if (f.type !== "custom" || f.test && !f.test(t.str))
          continue;
        let p = f.parse(t.str);
        if (p)
          return p.alpha ?? (p.alpha = 1), e && (e.formatId = c), p;
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
const L5 = 75e-6, fn = class fn {
  constructor(e) {
    var o;
    this.id = e.id, this.name = e.name, this.base = e.base ? fn.get(e.base) : null, this.aliases = e.aliases, this.base && (this.fromBase = e.fromBase, this.toBase = e.toBase);
    let t = e.coords ?? this.base.coords;
    for (let a in t)
      "name" in t[a] || (t[a].name = a);
    this.coords = t;
    let r = e.white ?? this.base.white ?? "D65";
    this.white = Pc(r), this.formats = e.formats ?? {};
    for (let a in this.formats) {
      let u = this.formats[a];
      u.type || (u.type = "function"), u.name || (u.name = a);
    }
    (o = this.formats.color) != null && o.id || (this.formats.color = {
      ...this.formats.color ?? {},
      id: e.cssId || this.id
    }), e.gamutSpace ? this.gamutSpace = e.gamutSpace === "self" ? this : fn.get(e.gamutSpace) : this.isPolar ? this.gamutSpace = this.base : this.gamutSpace = this, this.gamutSpace.isUnbounded && (this.inGamut = (a, u) => !0), this.referred = e.referred, Object.defineProperty(this, "path", {
      value: B5(this).reverse(),
      writable: !1,
      enumerable: !0,
      configurable: !0
    }), Qr.run("colorspace-init-end", this);
  }
  inGamut(e, { epsilon: t = L5 } = {}) {
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
      return e = ap(e, this), e;
    let t;
    return e === "default" ? t = Object.values(this.formats)[0] : t = this.formats[e], t ? (t = ap(t, this), t) : null;
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
      let p = o.coords[f];
      if (f.toLowerCase() === u || ((c = p.name) == null ? void 0 : c.toLowerCase()) === u)
        return { space: o, id: f, index: h, ...p };
      h++;
    }
    throw new TypeError(`No "${a}" coordinate found in ${o.name}. Its coordinates are: ${Object.keys(o.coords).join(", ")}`);
  }
};
Hl(fn, "registry", {}), Hl(fn, "DEFAULT_FORMAT", {
  type: "functions",
  name: "color"
});
let ye = fn;
function B5(n) {
  let e = [n];
  for (let t = n; t = t.base; )
    e.push(t);
  return e;
}
function ap(n, { coords: e } = {}) {
  if (n.coords && !n.coordGrammar) {
    n.type || (n.type = "function"), n.name || (n.name = "color"), n.coordGrammar = $g(n.coords);
    let t = Object.entries(e).map(([r, o], a) => {
      let u = n.coordGrammar[a][0], h = o.range || o.refRange, c = u.range, f = "";
      return u == "<percentage>" ? (c = [0, 100], f = "%") : u == "<angle>" && (f = "deg"), { fromRange: h, toRange: c, suffix: f };
    });
    n.serializeCoords = (r, o) => r.map((a, u) => {
      let { fromRange: h, toRange: c, suffix: f } = t[u];
      return h && c && (a = gh(h, c, a)), a = Wa(a, { precision: o, unit: f }), a;
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
      return this.white !== this.base.white && (r = ja(this.white, this.base.white, r)), r;
    }), e.fromBase ?? (e.fromBase = (t) => (t = ja(this.base.white, this.white, t), dt(e.fromXYZ_M, t)))), e.referred ?? (e.referred = "display"), super(e);
  }
}
function bs(n, e) {
  return n = Ne(n), !e || n.space.equals(e) ? n.coords.slice() : (e = ye.get(e), e.from(n));
}
function Cn(n, e) {
  n = Ne(n);
  let { space: t, index: r } = ye.resolveCoord(e, n.space);
  return bs(n, t)[r];
}
function vh(n, e, t) {
  return n = Ne(n), e = ye.get(e), n.coords = e.to(n.space, t), n;
}
vh.returns = "color";
function Ir(n, e, t) {
  if (n = Ne(n), arguments.length === 2 && Vr(arguments[1]) === "object") {
    let r = arguments[1];
    for (let o in r)
      Ir(n, o, r[o]);
  } else {
    typeof t == "function" && (t = t(Cn(n, e)));
    let { space: r, index: o } = ye.resolveCoord(e, n.space), a = bs(n, r);
    a[o] = t, vh(n, r, a);
  }
  return n;
}
Ir.returns = "color";
var _h = new ye({
  id: "xyz-d50",
  name: "XYZ D50",
  white: "D50",
  base: qt,
  fromBase: (n) => ja(qt.white, "D50", n),
  toBase: (n) => ja("D50", qt.white, n)
});
const F5 = 216 / 24389, up = 24 / 116, wa = 24389 / 27;
let Xl = rn.D50;
var An = new ye({
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
  white: Xl,
  base: _h,
  // Convert D50-adapted XYX to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(n) {
    let t = n.map((r, o) => r / Xl[o]).map((r) => r > F5 ? Math.cbrt(r) : (wa * r + 16) / 116);
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
      e[0] > up ? Math.pow(e[0], 3) : (116 * e[0] - 16) / wa,
      n[0] > 8 ? Math.pow((n[0] + 16) / 116, 3) : n[0] / wa,
      e[2] > up ? Math.pow(e[2], 3) : (116 * e[2] - 16) / wa
    ].map((r, o) => r * Xl[o]);
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
function U5(n, e) {
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
  base: An,
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
const lp = 25 ** 7, Va = Math.PI, cp = 180 / Va, oo = Va / 180;
function hp(n) {
  const e = n * n;
  return e * e * e * n;
}
function zg(n, e, { kL: t = 1, kC: r = 1, kH: o = 1 } = {}) {
  [n, e] = Ne([n, e]);
  let [a, u, h] = An.from(n), c = as.from(An, [a, u, h])[1], [f, p, g] = An.from(e), m = as.from(An, [f, p, g])[1];
  c < 0 && (c = 0), m < 0 && (m = 0);
  let b = (c + m) / 2, _ = hp(b), $ = 0.5 * (1 - Math.sqrt(_ / (_ + lp))), C = (1 + $) * u, S = (1 + $) * p, I = Math.sqrt(C ** 2 + h ** 2), T = Math.sqrt(S ** 2 + g ** 2), A = C === 0 && h === 0 ? 0 : Math.atan2(h, C), N = S === 0 && g === 0 ? 0 : Math.atan2(g, S);
  A < 0 && (A += 2 * Va), N < 0 && (N += 2 * Va), A *= cp, N *= cp;
  let D = f - a, L = T - I, q = N - A, oe = A + N, be = Math.abs(q), ge;
  I * T === 0 ? ge = 0 : be <= 180 ? ge = q : q > 180 ? ge = q - 360 : q < -180 ? ge = q + 360 : In.warn("the unthinkable has happened");
  let pe = 2 * Math.sqrt(T * I) * Math.sin(ge * oo / 2), Je = (a + f) / 2, Le = (I + T) / 2, rt = hp(Le), He;
  I * T === 0 ? He = oe : be <= 180 ? He = oe / 2 : oe < 360 ? He = (oe + 360) / 2 : He = (oe - 360) / 2;
  let te = (Je - 50) ** 2, se = 1 + 0.015 * te / Math.sqrt(20 + te), re = 1 + 0.045 * Le, ce = 1;
  ce -= 0.17 * Math.cos((He - 30) * oo), ce += 0.24 * Math.cos(2 * He * oo), ce += 0.32 * Math.cos((3 * He + 6) * oo), ce -= 0.2 * Math.cos((4 * He - 63) * oo);
  let ve = 1 + 0.015 * Le * ce, xe = 30 * Math.exp(-1 * ((He - 275) / 25) ** 2), Re = 2 * Math.sqrt(rt / (rt + lp)), Ve = -1 * Math.sin(2 * xe * oo) * Re, ae = (D / (t * se)) ** 2;
  return ae += (L / (r * re)) ** 2, ae += (pe / (o * ve)) ** 2, ae += Ve * (L / (r * re)) * (pe / (o * ve)), Math.sqrt(ae);
}
const Z5 = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309]
], q5 = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816]
], G5 = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.42859224204858, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774]
], H5 = [
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
    let t = dt(Z5, n).map((r) => Math.cbrt(r));
    return dt(G5, t);
  },
  toBase(n) {
    let t = dt(H5, n).map((r) => r ** 3);
    return dt(q5, t);
  },
  formats: {
    oklab: {
      coords: ["<percentage> | <number>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
function kc(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = fo.from(n), [a, u, h] = fo.from(e), c = t - a, f = r - u, p = o - h;
  return Math.sqrt(c ** 2 + f ** 2 + p ** 2);
}
const W5 = 75e-6;
function Ii(n, e, { epsilon: t = W5 } = {}) {
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
function j5(n, e) {
  return Dg(n, e, "lab");
}
const V5 = Math.PI, fp = V5 / 180;
function K5(n, e, { l: t = 2, c: r = 1 } = {}) {
  [n, e] = Ne([n, e]);
  let [o, a, u] = An.from(n), [, h, c] = as.from(An, [o, a, u]), [f, p, g] = An.from(e), m = as.from(An, [f, p, g])[1];
  h < 0 && (h = 0), m < 0 && (m = 0);
  let b = o - f, _ = h - m, $ = a - p, C = u - g, S = $ ** 2 + C ** 2 - _ ** 2, I = 0.511;
  o >= 16 && (I = 0.040975 * o / (1 + 0.01765 * o));
  let T = 0.0638 * h / (1 + 0.0131 * h) + 0.638, A;
  Number.isNaN(c) && (c = 0), c >= 164 && c <= 345 ? A = 0.56 + Math.abs(0.2 * Math.cos((c + 168) * fp)) : A = 0.36 + Math.abs(0.4 * Math.cos((c + 35) * fp));
  let N = Math.pow(h, 4), D = Math.sqrt(N / (N + 1900)), L = T * (D * A + 1 - D), q = (b / (t * I)) ** 2;
  return q += (_ / (r * T)) ** 2, q += S / L ** 2, Math.sqrt(q);
}
const dp = 203;
var yh = new ye({
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
    return n.map((e) => Math.max(e * dp, 0));
  },
  toBase(n) {
    return n.map((e) => Math.max(e / dp, 0));
  }
});
const xa = 1.15, Ta = 0.66, pp = 2610 / 2 ** 14, J5 = 2 ** 14 / 2610, gp = 3424 / 2 ** 12, mp = 2413 / 2 ** 7, vp = 2392 / 2 ** 7, Y5 = 1.7 * 2523 / 2 ** 5, _p = 2 ** 5 / (1.7 * 2523), Sa = -0.56, ec = 16295499532821565e-27, Q5 = [
  [0.41478972, 0.579999, 0.014648],
  [-0.20151, 1.120649, 0.0531008],
  [-0.0166008, 0.2648, 0.6684799]
], X5 = [
  [1.9242264357876067, -1.0047923125953657, 0.037651404030618],
  [0.35031676209499907, 0.7264811939316552, -0.06538442294808501],
  [-0.09098281098284752, -0.3127282905230739, 1.5227665613052603]
], ex = [
  [0.5, 0.5, 0],
  [3.524, -4.066708, 0.542708],
  [0.199076, 1.096799, -1.295875]
], tx = [
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
  base: yh,
  fromBase(n) {
    let [e, t, r] = n, o = xa * e - (xa - 1) * r, a = Ta * t - (Ta - 1) * e, h = dt(Q5, [o, a, r]).map(function(m) {
      let b = gp + mp * (m / 1e4) ** pp, _ = 1 + vp * (m / 1e4) ** pp;
      return (b / _) ** Y5;
    }), [c, f, p] = dt(ex, h);
    return [(1 + Sa) * c / (1 + Sa * c) - ec, f, p];
  },
  toBase(n) {
    let [e, t, r] = n, o = (e + ec) / (1 + Sa - Sa * (e + ec)), u = dt(tx, [o, t, r]).map(function(m) {
      let b = gp - m ** _p, _ = vp * m ** _p - mp;
      return 1e4 * (b / _) ** J5;
    }), [h, c, f] = dt(X5, u), p = (h + (xa - 1) * f) / xa, g = (c + (Ta - 1) * p) / Ta;
    return [p, g, f];
  },
  formats: {
    // https://drafts.csswg.org/css-color-hdr/#Jzazbz
    color: {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
}), $c = new ye({
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
function nx(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = $c.from(n), [a, u, h] = $c.from(e), c = t - a, f = r - u;
  Number.isNaN(o) && Number.isNaN(h) ? (o = 0, h = 0) : Number.isNaN(o) ? o = h : Number.isNaN(h) && (h = o);
  let p = o - h, g = 2 * Math.sqrt(r * u) * Math.sin(p / 2 * (Math.PI / 180));
  return Math.sqrt(c ** 2 + f ** 2 + g ** 2);
}
const Bg = 3424 / 4096, Fg = 2413 / 128, Ug = 2392 / 128, yp = 2610 / 16384, rx = 2523 / 32, ix = 16384 / 2610, bp = 32 / 2523, ox = [
  [0.3592832590121217, 0.6976051147779502, -0.035891593232029],
  [-0.1920808463704993, 1.100476797037432, 0.0753748658519118],
  [0.0070797844607479, 0.0748396662186362, 0.8433265453898765]
], sx = [
  [2048 / 4096, 2048 / 4096, 0],
  [6610 / 4096, -13613 / 4096, 7003 / 4096],
  [17933 / 4096, -17390 / 4096, -543 / 4096]
], ax = [
  [0.9999999999999998, 0.0086090370379328, 0.111029625003026],
  [0.9999999999999998, -0.0086090370379328, -0.1110296250030259],
  [0.9999999999999998, 0.5600313357106791, -0.3206271749873188]
], ux = [
  [2.0701522183894223, -1.3263473389671563, 0.2066510476294053],
  [0.3647385209748072, 0.6805660249472273, -0.0453045459220347],
  [-0.0497472075358123, -0.0492609666966131, 1.1880659249923042]
];
var Oc = new ye({
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
  base: yh,
  fromBase(n) {
    let e = dt(ox, n);
    return lx(e);
  },
  toBase(n) {
    let e = cx(n);
    return dt(ux, e);
  }
});
function lx(n) {
  let e = n.map(function(t) {
    let r = Bg + Fg * (t / 1e4) ** yp, o = 1 + Ug * (t / 1e4) ** yp;
    return (r / o) ** rx;
  });
  return dt(sx, e);
}
function cx(n) {
  return dt(ax, n).map(function(r) {
    let o = Math.max(r ** bp - Bg, 0), a = Fg - Ug * r ** bp;
    return 1e4 * (o / a) ** ix;
  });
}
function hx(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = Oc.from(n), [a, u, h] = Oc.from(e);
  return 720 * Math.sqrt((t - a) ** 2 + 0.25 * (r - u) ** 2 + (o - h) ** 2);
}
const fx = rn.D65, Zg = 0.42, wp = 1 / Zg, tc = 2 * Math.PI, qg = [
  [0.401288, 0.650173, -0.051461],
  [-0.250268, 1.204414, 0.045854],
  [-2079e-6, 0.048952, 0.953127]
], dx = [
  [1.8620678550872327, -1.0112546305316843, 0.14918677544445175],
  [0.38752654323613717, 0.6214474419314753, -0.008973985167612518],
  [-0.015841498849333856, -0.03412293802851557, 1.0499644368778496]
], px = [
  [460, 451, 288],
  [460, -891, -261],
  [460, -220, -6300]
], gx = {
  dark: [0.8, 0.525, 0.8],
  dim: [0.9, 0.59, 0.9],
  average: [1, 0.69, 1]
}, Ti = {
  // Red, Yellow, Green, Blue, Red
  h: [20.14, 90, 164.25, 237.53, 380.14],
  e: [0.8, 0.7, 1, 1.2, 0.8],
  H: [0, 100, 200, 300, 400]
}, mx = 180 / Math.PI, xp = Math.PI / 180;
function Gg(n, e) {
  return n.map((r) => {
    const o = ur(e * Math.abs(r) * 0.01, Zg);
    return 400 * Mu(o, r) / (o + 27.13);
  });
}
function vx(n, e) {
  const t = 100 / e * 27.13 ** wp;
  return n.map((r) => {
    const o = Math.abs(r);
    return Mu(t * ur(o / (400 - o), wp), r);
  });
}
function _x(n) {
  let e = lr(n);
  e <= Ti.h[0] && (e += 360);
  const t = Ng(Ti.h, e) - 1, [r, o] = Ti.h.slice(t, t + 2), [a, u] = Ti.e.slice(t, t + 2), h = Ti.H[t], c = (e - r) / a;
  return h + 100 * c / (c + (o - e) / u);
}
function yx(n) {
  let e = (n % 400 + 400) % 400;
  const t = Math.floor(0.01 * e);
  e = e % 100;
  const [r, o] = Ti.h.slice(t, t + 2), [a, u] = Ti.e.slice(t, t + 2);
  return lr(
    (e * (u * r - a * o) - 100 * r * u) / (e * (u - a) - 100 * u)
  );
}
function Hg(n, e, t, r, o) {
  const a = {};
  a.discounting = o, a.refWhite = n, a.surround = r;
  const u = n.map(($) => $ * 100);
  a.la = e, a.yb = t;
  const h = u[1], c = dt(qg, u);
  r = gx[a.surround];
  const f = r[0];
  a.c = r[1], a.nc = r[2];
  const g = (1 / (5 * a.la + 1)) ** 4;
  a.fl = g * a.la + 0.1 * (1 - g) * (1 - g) * Math.cbrt(5 * a.la), a.flRoot = a.fl ** 0.25, a.n = a.yb / h, a.z = 1.48 + Math.sqrt(a.n), a.nbb = 0.725 * a.n ** -0.2, a.ncb = a.nbb;
  const m = Math.max(
    Math.min(f * (1 - 1 / 3.6 * Math.exp((-a.la - 42) / 92)), 1),
    0
  );
  a.dRgb = c.map(($) => ss(1, h / $, m)), a.dRgbInv = a.dRgb.map(($) => 1 / $);
  const b = c.map(($, C) => $ * a.dRgb[C]), _ = Gg(b, a.fl);
  return a.aW = a.nbb * (2 * _[0] + _[1] + 0.05 * _[2]), a;
}
const Tp = Hg(
  fx,
  64 / Math.PI * 0.2,
  20,
  "average",
  !1
);
function Nc(n, e) {
  if (!(n.J !== void 0 ^ n.Q !== void 0))
    throw new Error("Conversion requires one and only one: 'J' or 'Q'");
  if (!(n.C !== void 0 ^ n.M !== void 0 ^ n.s !== void 0))
    throw new Error("Conversion requires one and only one: 'C', 'M' or 's'");
  if (!(n.h !== void 0 ^ n.H !== void 0))
    throw new Error("Conversion requires one and only one: 'h' or 'H'");
  if (n.J === 0 || n.Q === 0)
    return [0, 0, 0];
  let t = 0;
  n.h !== void 0 ? t = lr(n.h) * xp : t = yx(n.H) * xp;
  const r = Math.cos(t), o = Math.sin(t);
  let a = 0;
  n.J !== void 0 ? a = ur(n.J, 1 / 2) * 0.1 : n.Q !== void 0 && (a = 0.25 * e.c * n.Q / ((e.aW + 4) * e.flRoot));
  let u = 0;
  n.C !== void 0 ? u = n.C / a : n.M !== void 0 ? u = n.M / e.flRoot / a : n.s !== void 0 && (u = 4e-4 * n.s ** 2 * (e.aW + 4) / e.c);
  const h = ur(
    u * Math.pow(1.64 - Math.pow(0.29, e.n), -0.73),
    10 / 9
  ), c = 0.25 * (Math.cos(t + 2) + 3.8), f = e.aW * ur(a, 2 / e.c / e.z), p = 5e4 / 13 * e.nc * e.ncb * c, g = f / e.nbb, m = 23 * (g + 0.305) * mh(h, 23 * p + h * (11 * r + 108 * o)), b = m * r, _ = m * o, $ = vx(
    dt(px, [g, b, _]).map((C) => C * 1 / 1403),
    e.fl
  );
  return dt(
    dx,
    $.map((C, S) => C * e.dRgbInv[S])
  ).map((C) => C / 100);
}
function Wg(n, e) {
  const t = n.map((T) => T * 100), r = Gg(
    dt(qg, t).map((T, A) => T * e.dRgb[A]),
    e.fl
  ), o = r[0] + (-12 * r[1] + r[2]) / 11, a = (r[0] + r[1] - 2 * r[2]) / 9, u = (Math.atan2(a, o) % tc + tc) % tc, h = 0.25 * (Math.cos(u + 2) + 3.8), c = 5e4 / 13 * e.nc * e.ncb * mh(
    h * Math.sqrt(o ** 2 + a ** 2),
    r[0] + r[1] + 1.05 * r[2] + 0.305
  ), f = ur(c, 0.9) * Math.pow(1.64 - Math.pow(0.29, e.n), 0.73), p = e.nbb * (2 * r[0] + r[1] + 0.05 * r[2]), g = ur(p / e.aW, 0.5 * e.c * e.z), m = 100 * ur(g, 2), b = 4 / e.c * g * (e.aW + 4) * e.flRoot, _ = f * g, $ = _ * e.flRoot, C = lr(u * mx), S = _x(C), I = 50 * ur(e.c * f / (e.aW + 4), 1 / 2);
  return { J: m, C: _, h: C, s: I, Q: b, M: $, H: S };
}
var bx = new ye({
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
    const e = Wg(n, Tp);
    return [e.J, e.M, e.h];
  },
  toBase(n) {
    return Nc(
      { J: n[0], M: n[1], h: n[2] },
      Tp
    );
  }
});
const wx = rn.D65, xx = 216 / 24389, jg = 24389 / 27;
function Tx(n) {
  return 116 * (n > xx ? Math.cbrt(n) : (jg * n + 16) / 116) - 16;
}
function Rc(n) {
  return n > 8 ? Math.pow((n + 16) / 116, 3) : n / jg;
}
function Sx(n, e) {
  let [t, r, o] = n, a = [], u = 0;
  if (o === 0)
    return [0, 0, 0];
  let h = Rc(o);
  o > 0 ? u = 0.00379058511492914 * o ** 2 + 0.608983189401032 * o + 0.9155088574762233 : u = 9514440756550361e-21 * o ** 2 + 0.08693057439788597 * o - 21.928975842194614;
  const c = 2e-12, f = 15;
  let p = 0, g = 1 / 0;
  for (; p <= f; ) {
    a = Nc({ J: u, C: r, h: t }, e);
    const m = Math.abs(a[1] - h);
    if (m < g) {
      if (m <= c)
        return a;
      g = m;
    }
    u = u - (a[1] - h) * u / (2 * a[1]), p += 1;
  }
  return Nc({ J: u, C: r, h: t }, e);
}
function Mx(n, e) {
  const t = Tx(n[1]);
  if (t === 0)
    return [0, 0, 0];
  const r = Wg(n, bh);
  return [lr(r.h), r.C, t];
}
const bh = Hg(
  wx,
  200 / Math.PI * Rc(50),
  Rc(50) * 100,
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
    return Sx(n, bh);
  },
  formats: {
    color: {
      id: "--hct",
      coords: ["<number> | <angle>", "<percentage> | <number>", "<percentage> | <number>"]
    }
  }
});
const Ex = Math.PI / 180, Sp = [1, 7e-3, 0.0228];
function Mp(n) {
  n[1] < 0 && (n = us.fromBase(us.toBase(n)));
  const e = Math.log(Math.max(1 + Sp[2] * n[1] * bh.flRoot, 1)) / Sp[2], t = n[0] * Ex, r = e * Math.cos(t), o = e * Math.sin(t);
  return [n[2], r, o];
}
function Cx(n, e) {
  [n, e] = Ne([n, e]);
  let [t, r, o] = Mp(us.from(n)), [a, u, h] = Mp(us.from(e));
  return Math.sqrt((t - a) ** 2 + (r - u) ** 2 + (o - h) ** 2);
}
var go = {
  deltaE76: j5,
  deltaECMC: K5,
  deltaE2000: zg,
  deltaEJz: nx,
  deltaEITP: hx,
  deltaEOK: kc,
  deltaEHCT: Cx
};
function Ax(n) {
  const e = n ? Math.floor(Math.log10(Math.abs(n))) : 0;
  return Math.max(parseFloat(`1e${e - 2}`), 1e-6);
}
const Ep = {
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
  method: e = In.gamut_mapping,
  space: t = void 0,
  deltaEMethod: r = "",
  jnd: o = 2,
  blackWhiteClamp: a = {}
} = {}) {
  if (n = Ne(n), ys(arguments[1]) ? t = arguments[1] : t || (t = n.space), t = ye.get(t), Ii(n, t, { epsilon: 0 }))
    return n;
  let u;
  if (e === "css")
    u = Ix(n, { space: t });
  else {
    if (e !== "clip" && !Ii(n, t)) {
      Object.prototype.hasOwnProperty.call(Ep, e) && ({ method: e, jnd: o, deltaEMethod: r, blackWhiteClamp: a } = Ep[e]);
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
          let I = ye.resolveCoord(a.channel), T = Cn(ft(n, I.space), I.id);
          if (Yr(T) && (T = 0), T >= a.max)
            return ft({ space: "xyz-d65", coords: rn.D65 }, n.space);
          if (T <= a.min)
            return ft({ space: "xyz-d65", coords: [0, 0, 0] }, n.space);
        }
        let f = ye.resolveCoord(e), p = f.space, g = f.id, m = ft(n, p);
        m.coords.forEach((I, T) => {
          Yr(I) && (m.coords[T] = 0);
        });
        let _ = (f.range || f.refRange)[0], $ = Ax(o), C = _, S = Cn(m, g);
        for (; S - C > $; ) {
          let I = po(m);
          I = Xr(I, { space: t, method: "clip" }), h(m, I) - o < $ ? C = Cn(m, g) : S = Cn(m, g), Ir(m, g, (C + S) / 2);
        }
        u = ft(m, t);
      } else
        u = c;
    } else
      u = ft(n, t);
    if (e === "clip" || !Ii(u, t, { epsilon: 0 })) {
      let h = Object.values(t.coords).map((c) => c.range || []);
      u.coords = u.coords.map((c, f) => {
        let [p, g] = h[f];
        return p !== void 0 && (c = Math.max(p, c)), g !== void 0 && (c = Math.min(c, g)), c;
      });
    }
  }
  return t !== n.space && (u = ft(u, n.space)), n.coords = u.coords, n;
}
Xr.returns = "color";
const Cp = {
  WHITE: { space: fo, coords: [1, 0, 0] },
  BLACK: { space: fo, coords: [0, 0, 0] }
};
function Ix(n, { space: e } = {}) {
  n = Ne(n), e || (e = n.space), e = ye.get(e);
  const o = ye.get("oklch");
  if (e.isUnbounded)
    return ft(n, e);
  const a = ft(n, o);
  let u = a.coords[0];
  if (u >= 1) {
    const _ = ft(Cp.WHITE, e);
    return _.alpha = n.alpha, ft(_, e);
  }
  if (u <= 0) {
    const _ = ft(Cp.BLACK, e);
    return _.alpha = n.alpha, ft(_, e);
  }
  if (Ii(a, e, { epsilon: 0 }))
    return ft(a, e);
  function h(_) {
    const $ = ft(_, e), C = Object.values(e.coords);
    return $.coords = $.coords.map((S, I) => {
      if ("range" in C[I]) {
        const [T, A] = C[I].range;
        return Og(T, S, A);
      }
      return S;
    }), $;
  }
  let c = 0, f = a.coords[1], p = !0, g = po(a), m = h(g), b = kc(m, g);
  if (b < 0.02)
    return m;
  for (; f - c > 1e-4; ) {
    const _ = (c + f) / 2;
    if (g.coords[1] = _, p && Ii(g, e, { epsilon: 0 }))
      c = _;
    else if (m = h(g), b = kc(m, g), b < 0.02) {
      if (0.02 - b < 1e-4)
        break;
      p = !1, c = _;
    } else
      f = _;
  }
  return m;
}
function ft(n, e, { inGamut: t } = {}) {
  n = Ne(n), e = ye.get(e);
  let r = e.from(n), o = { space: e, coords: r, alpha: n.alpha };
  return t && (o = Xr(o, t === !0 ? void 0 : t)), o;
}
ft.returns = "color";
function es(n, {
  precision: e = In.precision,
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
    t.serializeCoords ? h = t.serializeCoords(h, e) : e !== null && (h = h.map((b) => Wa(b, { precision: e })));
    let p = [...h];
    if (f === "color") {
      let b = t.id || ((c = t.ids) == null ? void 0 : c[0]) || n.space.id;
      p.unshift(b);
    }
    let g = n.alpha;
    e !== null && (g = Wa(g, { precision: e }));
    let m = n.alpha >= 1 || t.noAlpha ? "" : `${t.commas ? "," : " /"} ${g}`;
    a = `${f}(${p.join(t.commas ? ", " : " ")}${m})`;
  }
  return a;
}
const Px = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791]
], kx = [
  [1.716651187971268, -0.355670783776392, -0.25336628137366],
  [-0.666684351832489, 1.616481236634939, 0.0157685458139111],
  [0.017639857445311, -0.042770613257809, 0.942103121235474]
];
var Eu = new gn({
  id: "rec2020-linear",
  cssId: "--rec2020-linear",
  name: "Linear REC.2020",
  white: "D65",
  toXYZ_M: Px,
  fromXYZ_M: kx
});
const Ma = 1.09929682680944, Ap = 0.018053968510807;
var Vg = new gn({
  id: "rec2020",
  name: "REC.2020",
  base: Eu,
  // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
  toBase(n) {
    return n.map(function(e) {
      return e < Ap * 4.5 ? e / 4.5 : Math.pow((e + Ma - 1) / Ma, 1 / 0.45);
    });
  },
  fromBase(n) {
    return n.map(function(e) {
      return e >= Ap ? Ma * Math.pow(e, 0.45) - (Ma - 1) : 4.5 * e;
    });
  }
});
const $x = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976]
], Ox = [
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
  fromXYZ_M: Ox
});
const Nx = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607]
], Ot = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786]
];
var Jg = new gn({
  id: "srgb-linear",
  name: "Linear sRGB",
  white: "D65",
  toXYZ_M: Nx,
  fromXYZ_M: Ot
}), Ip = {
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
let Pp = Array(3).fill("<percentage> | <number>[0, 255]"), kp = Array(3).fill("<number>[0, 255]");
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
      coords: Pp
    },
    rgb_number: {
      name: "rgb",
      commas: !0,
      coords: kp,
      noAlpha: !0
    },
    color: {
      /* use defaults */
    },
    rgba: {
      coords: Pp,
      commas: !0,
      lastAlpha: !0
    },
    rgba_number: {
      name: "rgba",
      commas: !0,
      coords: kp
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
        if (n === "transparent" ? (e.coords = Ip.black, e.alpha = 0) : e.coords = Ip[n], e.coords)
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
In.display_space = mo;
let Rx;
if (typeof CSS < "u" && CSS.supports)
  for (let n of [An, Vg, Yg]) {
    let e = n.getMinCoords(), r = es({ space: n, coords: e, alpha: 1 });
    if (CSS.supports("color", r)) {
      In.display_space = n;
      break;
    }
  }
function zx(n, { space: e = In.display_space, ...t } = {}) {
  let r = es(n, t);
  if (typeof CSS > "u" || CSS.supports("color", r) || !In.display_space)
    r = new String(r), r.color = n;
  else {
    let o = n;
    if ((n.coords.some(Yr) || Yr(n.alpha)) && !(Rx ?? (Rx = CSS.supports("color", "hsl(none 50% 50%)"))) && (o = po(n), o.coords = o.coords.map(It), o.alpha = It(o.alpha), r = es(o, t), CSS.supports("color", r)))
      return r = new String(r), r.color = o, r;
    o = ft(o, e), r = new String(es(o, t)), r.color = o;
  }
  return r;
}
function Dx(n, e) {
  return n = Ne(n), e = Ne(e), n.space === e.space && n.alpha === e.alpha && n.coords.every((t, r) => t === e.coords[r]);
}
function ei(n) {
  return Cn(n, [qt, "y"]);
}
function Qg(n, e) {
  Ir(n, [qt, "y"], e);
}
function Lx(n) {
  Object.defineProperty(n.prototype, "luminance", {
    get() {
      return ei(this);
    },
    set(e) {
      Qg(this, e);
    }
  });
}
var Bx = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  getLuminance: ei,
  register: Lx,
  setLuminance: Qg
});
function Fx(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Math.max(ei(n), 0), r = Math.max(ei(e), 0);
  return r > t && ([t, r] = [r, t]), (t + 0.05) / (r + 0.05);
}
const Ux = 0.56, Zx = 0.57, qx = 0.62, Gx = 0.65, $p = 0.022, Hx = 1.414, Wx = 0.1, jx = 5e-4, Vx = 1.14, Op = 0.027, Kx = 1.14;
function Np(n) {
  return n >= $p ? n : n + ($p - n) ** Hx;
}
function so(n) {
  let e = n < 0 ? -1 : 1, t = Math.abs(n);
  return e * Math.pow(t, 2.4);
}
function Jx(n, e) {
  e = Ne(e), n = Ne(n);
  let t, r, o, a, u, h;
  e = ft(e, "srgb"), [a, u, h] = e.coords;
  let c = so(a) * 0.2126729 + so(u) * 0.7151522 + so(h) * 0.072175;
  n = ft(n, "srgb"), [a, u, h] = n.coords;
  let f = so(a) * 0.2126729 + so(u) * 0.7151522 + so(h) * 0.072175, p = Np(c), g = Np(f), m = g > p;
  return Math.abs(g - p) < jx ? r = 0 : m ? (t = g ** Ux - p ** Zx, r = t * Vx) : (t = g ** Gx - p ** qx, r = t * Kx), Math.abs(r) < Wx ? o = 0 : r > 0 ? o = r - Op : o = r + Op, o * 100;
}
function Yx(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Math.max(ei(n), 0), r = Math.max(ei(e), 0);
  r > t && ([t, r] = [r, t]);
  let o = t + r;
  return o === 0 ? 0 : (t - r) / o;
}
const Qx = 5e4;
function Xx(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Math.max(ei(n), 0), r = Math.max(ei(e), 0);
  return r > t && ([t, r] = [r, t]), r === 0 ? Qx : (t - r) / r;
}
function eT(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Cn(n, [An, "l"]), r = Cn(e, [An, "l"]);
  return Math.abs(t - r);
}
const tT = 216 / 24389, Rp = 24 / 116, Ea = 24389 / 27;
let nc = rn.D65;
var zc = new ye({
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
  white: nc,
  base: qt,
  // Convert D65-adapted XYZ to Lab
  //  CIE 15.3:2004 section 8.2.1.1
  fromBase(n) {
    let t = n.map((r, o) => r / nc[o]).map((r) => r > tT ? Math.cbrt(r) : (Ea * r + 16) / 116);
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
      e[0] > Rp ? Math.pow(e[0], 3) : (116 * e[0] - 16) / Ea,
      n[0] > 8 ? Math.pow((n[0] + 16) / 116, 3) : n[0] / Ea,
      e[2] > Rp ? Math.pow(e[2], 3) : (116 * e[2] - 16) / Ea
    ].map((r, o) => r * nc[o]);
  },
  formats: {
    "lab-d65": {
      coords: ["<number> | <percentage>", "<number> | <percentage>[-1,1]", "<number> | <percentage>[-1,1]"]
    }
  }
});
const rc = Math.pow(5, 0.5) * 0.5 + 0.5;
function nT(n, e) {
  n = Ne(n), e = Ne(e);
  let t = Cn(n, [zc, "l"]), r = Cn(e, [zc, "l"]), o = Math.abs(Math.pow(t, rc) - Math.pow(r, rc)), a = Math.pow(o, 1 / rc) * Math.SQRT2 - 40;
  return a < 7.5 ? 0 : a;
}
var Za = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  contrastAPCA: Jx,
  contrastDeltaPhi: nT,
  contrastLstar: eT,
  contrastMichelson: Yx,
  contrastWCAG21: Fx,
  contrastWeber: Xx
});
function rT(n, e, t = {}) {
  ys(t) && (t = { algorithm: t });
  let { algorithm: r, ...o } = t;
  if (!r) {
    let a = Object.keys(Za).map((u) => u.replace(/^contrast/, "")).join(", ");
    throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${a}`);
  }
  n = Ne(n), e = Ne(e);
  for (let a in Za)
    if ("contrast" + r.toLowerCase() === a.toLowerCase())
      return Za[a](n, e, o);
  throw new TypeError(`Unknown contrast algorithm: ${r}`);
}
function Cu(n) {
  let [e, t, r] = bs(n, qt), o = e + 15 * t + 3 * r;
  return [4 * e / o, 9 * t / o];
}
function Xg(n) {
  let [e, t, r] = bs(n, qt), o = e + t + r;
  return [e / o, t / o];
}
function iT(n) {
  Object.defineProperty(n.prototype, "uv", {
    get() {
      return Cu(this);
    }
  }), Object.defineProperty(n.prototype, "xy", {
    get() {
      return Xg(this);
    }
  });
}
var oT = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  register: iT,
  uv: Cu,
  xy: Xg
});
function Ko(n, e, t = {}) {
  ys(t) && (t = { method: t });
  let { method: r = In.deltaE, ...o } = t;
  for (let a in go)
    if ("deltae" + r.toLowerCase() === a.toLowerCase())
      return go[a](n, e, o);
  throw new TypeError(`Unknown deltaE method: ${r}`);
}
function sT(n, e = 0.25) {
  let r = [ye.get("oklch", "lch"), "l"];
  return Ir(n, r, (o) => o * (1 + e));
}
function aT(n, e = 0.25) {
  let r = [ye.get("oklch", "lch"), "l"];
  return Ir(n, r, (o) => o * (1 - e));
}
var uT = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  darken: aT,
  lighten: sT
});
function em(n, e, t = 0.5, r = {}) {
  return [n, e] = [Ne(n), Ne(e)], Vr(t) === "object" && ([t, r] = [0.5, t]), ws(n, e, r)(t);
}
function tm(n, e, t = {}) {
  let r;
  wh(n) && ([r, t] = [n, e], [n, e] = r.rangeArgs.colors);
  let {
    maxDeltaE: o,
    deltaEMethod: a,
    steps: u = 2,
    maxSteps: h = 1e3,
    ...c
  } = t;
  r || ([n, e] = [Ne(n), Ne(e)], r = ws(n, e, c));
  let f = Ko(n, e), p = o > 0 ? Math.max(u, Math.ceil(f / o) + 1) : u, g = [];
  if (h !== void 0 && (p = Math.min(p, h)), p === 1)
    g = [{ p: 0.5, color: r(0.5) }];
  else {
    let m = 1 / (p - 1);
    g = Array.from({ length: p }, (b, _) => {
      let $ = _ * m;
      return { p: $, color: r($) };
    });
  }
  if (o > 0) {
    let m = g.reduce((b, _, $) => {
      if ($ === 0)
        return 0;
      let C = Ko(_.color, g[$ - 1].color, a);
      return Math.max(b, C);
    }, 0);
    for (; m > o; ) {
      m = 0;
      for (let b = 1; b < g.length && g.length < h; b++) {
        let _ = g[b - 1], $ = g[b], C = ($.p + _.p) / 2, S = r(C);
        m = Math.max(m, Ko(S, _.color), Ko(S, $.color)), g.splice(b, 0, { p: C, color: r(C) }), b++;
      }
    }
  }
  return g = g.map((m) => m.color), g;
}
function ws(n, e, t = {}) {
  if (wh(n)) {
    let [c, f] = [n, e];
    return ws(...c.rangeArgs.colors, { ...c.rangeArgs.options, ...f });
  }
  let { space: r, outputSpace: o, progression: a, premultiplied: u } = t;
  n = Ne(n), e = Ne(e), n = po(n), e = po(e);
  let h = { colors: [n, e], options: t };
  if (r ? r = ye.get(r) : r = ye.registry[In.interpolationSpace] || n.space, o = o ? ye.get(o) : r, n = ft(n, r), e = ft(e, r), n = Xr(n), e = Xr(e), r.coords.h && r.coords.h.type === "angle") {
    let c = t.hue = t.hue || "shorter", f = [r, "h"], [p, g] = [Cn(n, f), Cn(e, f)];
    isNaN(p) && !isNaN(g) ? p = g : isNaN(g) && !isNaN(p) && (g = p), [p, g] = U5(c, [p, g]), Ir(n, f, p), Ir(e, f, g);
  }
  return u && (n.coords = n.coords.map((c) => c * n.alpha), e.coords = e.coords.map((c) => c * e.alpha)), Object.assign((c) => {
    c = a ? a(c) : c;
    let f = n.coords.map((m, b) => {
      let _ = e.coords[b];
      return ss(m, _, c);
    }), p = ss(n.alpha, e.alpha, c), g = { space: r, coords: f, alpha: p };
    return u && (g.coords = g.coords.map((m) => m / p)), o !== r && (g = ft(g, o)), g;
  }, {
    rangeArgs: h
  });
}
function wh(n) {
  return Vr(n) === "function" && !!n.rangeArgs;
}
In.interpolationSpace = "lab";
function lT(n) {
  n.defineFunction("mix", em, { returns: "color" }), n.defineFunction("range", ws, { returns: "function<color>" }), n.defineFunction("steps", tm, { returns: "array<color>" });
}
var cT = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  isRange: wh,
  mix: em,
  range: ws,
  register: lT,
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
}), hT = new ye({
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
const fT = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388]
], dT = [
  [2.0415879038107465, -0.5650069742788596, -0.34473135077832956],
  [-0.9692436362808795, 1.8759675015077202, 0.04155505740717557],
  [0.013444280632031142, -0.11836239223101838, 1.0151749943912054]
];
var im = new gn({
  id: "a98rgb-linear",
  cssId: "--a98-rgb-linear",
  name: "Linear Adobe® 98 RGB compatible",
  white: "D65",
  toXYZ_M: fT,
  fromXYZ_M: dT
}), pT = new gn({
  id: "a98rgb",
  cssId: "a98-rgb",
  name: "Adobe® 98 RGB compatible",
  base: im,
  toBase: (n) => n.map((e) => Math.pow(Math.abs(e), 563 / 256) * Math.sign(e)),
  fromBase: (n) => n.map((e) => Math.pow(Math.abs(e), 256 / 563) * Math.sign(e))
});
const gT = [
  [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
  [0.2880748288194013, 0.711835234241873, 8993693872564e-17],
  [0, 0, 0.8251046025104602]
], mT = [
  [1.3457868816471583, -0.25557208737979464, -0.05110186497554526],
  [-0.5446307051249019, 1.5082477428451468, 0.02052744743642139],
  [0, 0, 1.2119675456389452]
];
var om = new gn({
  id: "prophoto-linear",
  cssId: "--prophoto-rgb-linear",
  name: "Linear ProPhoto",
  white: "D50",
  base: _h,
  toXYZ_M: gT,
  fromXYZ_M: mT
});
const vT = 1 / 512, _T = 16 / 512;
var yT = new gn({
  id: "prophoto",
  cssId: "prophoto-rgb",
  name: "ProPhoto",
  base: om,
  toBase(n) {
    return n.map((e) => e < _T ? e / 16 : e ** 1.8);
  },
  fromBase(n) {
    return n.map((e) => e >= vT ? e ** (1 / 1.8) : 16 * e);
  }
}), bT = new ye({
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
const wT = 216 / 24389, zp = 24389 / 27, [Dp, Lp] = Cu({ space: qt, coords: sm });
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
    let e = [It(n[0]), It(n[1]), It(n[2])], t = e[1], [r, o] = Cu({ space: qt, coords: e });
    if (!Number.isFinite(r) || !Number.isFinite(o))
      return [0, 0, 0];
    let a = t <= wT ? zp * t : 116 * Math.cbrt(t) - 16;
    return [
      a,
      13 * a * (r - Dp),
      13 * a * (o - Lp)
    ];
  },
  // Convert Luv to D65-adapted XYZ
  // https://en.wikipedia.org/wiki/CIELUV#The_reverse_transformation
  toBase(n) {
    let [e, t, r] = n;
    if (e === 0 || Yr(e))
      return [0, 0, 0];
    t = It(t), r = It(r);
    let o = t / (13 * e) + Dp, a = r / (13 * e) + Lp, u = e <= 8 ? e / zp : Math.pow((e + 16) / 116, 3);
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
}), xh = new ye({
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
const xT = 216 / 24389, TT = 24389 / 27, Bp = Ot[0][0], Fp = Ot[0][1], ic = Ot[0][2], Up = Ot[1][0], Zp = Ot[1][1], oc = Ot[1][2], qp = Ot[2][0], Gp = Ot[2][1], sc = Ot[2][2];
function ao(n, e, t) {
  const r = e / (Math.sin(t) - n * Math.cos(t));
  return r < 0 ? 1 / 0 : r;
}
function Ka(n) {
  const e = Math.pow(n + 16, 3) / 1560896, t = e > xT ? e : n / TT, r = t * (284517 * Bp - 94839 * ic), o = t * (838422 * ic + 769860 * Fp + 731718 * Bp), a = t * (632260 * ic - 126452 * Fp), u = t * (284517 * Up - 94839 * oc), h = t * (838422 * oc + 769860 * Zp + 731718 * Up), c = t * (632260 * oc - 126452 * Zp), f = t * (284517 * qp - 94839 * sc), p = t * (838422 * sc + 769860 * Gp + 731718 * qp), g = t * (632260 * sc - 126452 * Gp);
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
    b0i: p * n / g,
    b1s: f / (g + 126452),
    b1i: (p - 769860) * n / (g + 126452)
  };
}
function Hp(n, e) {
  const t = e / 360 * Math.PI * 2, r = ao(n.r0s, n.r0i, t), o = ao(n.r1s, n.r1i, t), a = ao(n.g0s, n.g0i, t), u = ao(n.g1s, n.g1i, t), h = ao(n.b0s, n.b0i, t), c = ao(n.b1s, n.b1i, t);
  return Math.min(r, o, a, u, h, c);
}
var ST = new ye({
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
  base: xh,
  gamutSpace: mo,
  // Convert LCHuv to HSLuv
  fromBase(n) {
    let [e, t, r] = [It(n[0]), It(n[1]), It(n[2])], o;
    if (e > 99.9999999)
      o = 0, e = 100;
    else if (e < 1e-8)
      o = 0, e = 0;
    else {
      let a = Ka(e), u = Hp(a, r);
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
      let a = Ka(r);
      o = Hp(a, e) / 100 * t;
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
Ot[0][0];
Ot[0][1];
Ot[0][2];
Ot[1][0];
Ot[1][1];
Ot[1][2];
Ot[2][0];
Ot[2][1];
Ot[2][2];
function uo(n, e) {
  return Math.abs(e) / Math.sqrt(Math.pow(n, 2) + 1);
}
function Wp(n) {
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
  base: xh,
  gamutSpace: "self",
  // Convert LCHuv to HPLuv
  fromBase(n) {
    let [e, t, r] = [It(n[0]), It(n[1]), It(n[2])], o;
    if (e > 99.9999999)
      o = 0, e = 100;
    else if (e < 1e-8)
      o = 0, e = 0;
    else {
      let a = Ka(e), u = Wp(a);
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
      let a = Ka(r);
      o = Wp(a) / 100 * t;
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
const jp = 203, Vp = 2610 / 2 ** 14, ET = 2 ** 14 / 2610, CT = 2523 / 2 ** 5, Kp = 2 ** 5 / 2523, Jp = 3424 / 2 ** 12, Yp = 2413 / 2 ** 7, Qp = 2392 / 2 ** 7;
var AT = new gn({
  id: "rec2100pq",
  cssId: "rec2100-pq",
  name: "REC.2100-PQ",
  base: Eu,
  toBase(n) {
    return n.map(function(e) {
      return (Math.max(e ** Kp - Jp, 0) / (Yp - Qp * e ** Kp)) ** ET * 1e4 / jp;
    });
  },
  fromBase(n) {
    return n.map(function(e) {
      let t = Math.max(e * jp / 1e4, 0), r = Jp + Yp * t ** Vp, o = 1 + Qp * t ** Vp;
      return (r / o) ** CT;
    });
  }
});
const Xp = 0.17883277, e0 = 0.28466892, t0 = 0.55991073, ac = 3.7743;
var IT = new gn({
  id: "rec2100hlg",
  cssId: "rec2100-hlg",
  name: "REC.2100-HLG",
  referred: "scene",
  base: Eu,
  toBase(n) {
    return n.map(function(e) {
      return e <= 0.5 ? e ** 2 / 3 * ac : (Math.exp((e - t0) / Xp) + e0) / 12 * ac;
    });
  },
  fromBase(n) {
    return n.map(function(e) {
      return e /= ac, e <= 1 / 12 ? Math.sqrt(3 * e) : Xp * Math.log(12 * e - e0) + t0;
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
  let r = um[t], [o, a, u] = dt(r.toCone_M, n), [h, c, f] = dt(r.toCone_M, e), p = [
    [h / o, 0, 0],
    [0, c / a, 0],
    [0, 0, f / u]
  ], g = dt(p, r.toCone_M);
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
const PT = [
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
  toXYZ_M: PT,
  fromXYZ_M: kT
});
const Ca = 2 ** -16, uc = -0.35828683, Aa = (Math.log2(65504) + 9.72) / 17.52;
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
      range: [uc, Aa],
      name: "Red"
    },
    g: {
      range: [uc, Aa],
      name: "Green"
    },
    b: {
      range: [uc, Aa],
      name: "Blue"
    }
  },
  referred: "scene",
  base: cm,
  // from section 4.4.2 Decoding Function
  toBase(n) {
    const e = -0.3013698630136986;
    return n.map(function(t) {
      return t <= e ? (2 ** (t * 17.52 - 9.72) - Ca) * 2 : t < Aa ? 2 ** (t * 17.52 - 9.72) : 65504;
    });
  },
  // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
  fromBase(n) {
    return n.map(function(e) {
      return e <= 0 ? (Math.log2(Ca) + 9.72) / 17.52 : e < Ca ? (Math.log2(Ca + e * 0.5) + 9.72) / 17.52 : (Math.log2(e) + 9.72) / 17.52;
    });
  }
  // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
  // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
}), n0 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  A98RGB: pT,
  A98RGB_Linear: im,
  ACEScc: $T,
  ACEScg: cm,
  CAM16_JMh: bx,
  HCT: us,
  HPLuv: MT,
  HSL: nm,
  HSLuv: ST,
  HSV: rm,
  HWB: hT,
  ICTCP: Oc,
  JzCzHz: $c,
  Jzazbz: Lg,
  LCH: as,
  LCHuv: xh,
  Lab: An,
  Lab_D65: zc,
  Luv: am,
  OKLCH: bT,
  OKLab: fo,
  P3: Yg,
  P3_Linear: Kg,
  ProPhoto: yT,
  ProPhoto_Linear: om,
  REC_2020: Vg,
  REC_2020_Linear: Eu,
  REC_2100_HLG: IT,
  REC_2100_PQ: AT,
  XYZ_ABS_D65: yh,
  XYZ_D50: _h,
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
    let t = zx(this, ...e);
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
        c = function(...p) {
          let g = f(...p);
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
  get: Cn,
  getAll: bs,
  set: Ir,
  setAll: vh,
  to: ft,
  equals: Dx,
  inGamut: Ii,
  toGamut: Xr,
  distance: Dg,
  toString: es
});
Object.assign(ot, {
  util: R5,
  hooks: Qr,
  WHITES: rn,
  Space: ye,
  spaces: ye.registry,
  parse: Rg,
  // Global defaults one may want to configure
  defaults: In
});
for (let n of Object.keys(n0))
  ye.register(n0[n]);
for (let n in ye.registry)
  Dc(n, ye.registry[n]);
Qr.add("colorspace-init-end", (n) => {
  var e;
  Dc(n.id, n), (e = n.aliases) == null || e.forEach((t) => {
    Dc(t, n);
  });
});
function Dc(n, e) {
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
ot.extend(uT);
ot.extend({ contrast: rT });
ot.extend(oT);
ot.extend(Bx);
ot.extend(cT);
ot.extend(Za);
function K(n, e, t) {
  function r(h, c) {
    var f;
    Object.defineProperty(h, "_zod", {
      value: h._zod ?? {},
      enumerable: !1
    }), (f = h._zod).traits ?? (f.traits = /* @__PURE__ */ new Set()), h._zod.traits.add(n), e(h, c);
    for (const p in u.prototype)
      p in h || Object.defineProperty(h, p, { value: u.prototype[p].bind(h) });
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
    for (const p of f._zod.deferred)
      p();
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
function OT(n) {
  const e = Object.values(n).filter((r) => typeof r == "number");
  return Object.entries(n).filter(([r, o]) => e.indexOf(+r) === -1).map(([r, o]) => o);
}
function NT(n, e) {
  return typeof e == "bigint" ? e.toString() : e;
}
function Th(n) {
  return {
    get value() {
      {
        const e = n();
        return Object.defineProperty(this, "value", { value: e }), e;
      }
    }
  };
}
function Sh(n) {
  return n == null;
}
function Mh(n) {
  const e = n.startsWith("^") ? 1 : 0, t = n.endsWith("$") ? n.length - 1 : n.length;
  return n.slice(e, t);
}
function RT(n, e) {
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
function Ho(n) {
  return JSON.stringify(n);
}
const dm = Error.captureStackTrace ? Error.captureStackTrace : (...n) => {
};
function Ja(n) {
  return typeof n == "object" && n !== null && !Array.isArray(n);
}
const zT = Th(() => {
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
function Lc(n) {
  if (Ja(n) === !1)
    return !1;
  const e = n.constructor;
  if (e === void 0)
    return !0;
  const t = e.prototype;
  return !(Ja(t) === !1 || Object.prototype.hasOwnProperty.call(t, "isPrototypeOf") === !1);
}
const DT = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
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
function LT(n) {
  return Object.keys(n).filter((e) => n[e]._zod.optin === "optional" && n[e]._zod.optout === "optional");
}
const BT = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function FT(n, e) {
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
function UT(n, e) {
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
function ZT(n, e) {
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
function qT(n, e) {
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
function GT(n, e, t) {
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
function HT(n, e, t) {
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
function Ei(n, e) {
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
    const p = Ia((u = (a = (o = n.inst) == null ? void 0 : o._zod.def) == null ? void 0 : a.error) == null ? void 0 : u.call(a, n)) ?? Ia((h = e == null ? void 0 : e.error) == null ? void 0 : h.call(e, n)) ?? Ia((c = t.customError) == null ? void 0 : c.call(t, n)) ?? Ia((f = t.localeError) == null ? void 0 : f.call(t, n)) ?? "Invalid input";
    r.message = p;
  }
  return delete r.inst, delete r.continue, e != null && e.reportInput || delete r.input, r;
}
function Eh(n) {
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
      return JSON.stringify(e, NT, 2);
    },
    enumerable: !0
    // configurable: false,
  });
}, gm = K("$ZodError", pm), mm = K("$ZodError", pm, { Parent: Error });
function WT(n, e = (t) => t.message) {
  const t = {}, r = [];
  for (const o of n.issues)
    o.path.length > 0 ? (t[o.path[0]] = t[o.path[0]] || [], t[o.path[0]].push(e(o))) : r.push(e(o));
  return { formErrors: r, fieldErrors: t };
}
function jT(n, e) {
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
function VT(n) {
  const e = [];
  for (const t of n)
    typeof t == "number" ? e.push(`[${t}]`) : typeof t == "symbol" ? e.push(`[${JSON.stringify(String(t))}]`) : /[^\w$]/.test(t) ? e.push(`[${JSON.stringify(t)}]`) : (e.length && e.push("."), e.push(t));
  return e.join("");
}
function KT(n) {
  var r;
  const e = [], t = [...n.issues].sort((o, a) => o.path.length - a.path.length);
  for (const o of t)
    e.push(`✖ ${o.message}`), (r = o.path) != null && r.length && e.push(`  → at ${VT(o.path)}`);
  return e.join(`
`);
}
const JT = (n) => (e, t, r, o) => {
  const a = r ? Object.assign(r, { async: !1 }) : { async: !1 }, u = e._zod.run({ value: t, issues: [] }, a);
  if (u instanceof Promise)
    throw new ls();
  if (u.issues.length) {
    const h = new ((o == null ? void 0 : o.Err) ?? n)(u.issues.map((c) => ni(c, a, ti())));
    throw dm(h, o == null ? void 0 : o.callee), h;
  }
  return u.value;
}, YT = (n) => async (e, t, r, o) => {
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
}, QT = /* @__PURE__ */ vm(mm), _m = (n) => async (e, t, r) => {
  const o = r ? Object.assign(r, { async: !0 }) : { async: !0 };
  let a = e._zod.run({ value: t, issues: [] }, o);
  return a instanceof Promise && (a = await a), a.issues.length ? {
    success: !1,
    error: new n(a.issues.map((u) => ni(u, o, ti())))
  } : { success: !0, data: a.value };
}, ym = /* @__PURE__ */ _m(mm), XT = /^[cC][^\s-]{8,}$/, eS = /^[0-9a-z]+$/, tS = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, nS = /^[0-9a-vA-V]{20}$/, rS = /^[A-Za-z0-9]{27}$/, iS = /^[a-zA-Z0-9_-]{21}$/, oS = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, sS = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, r0 = (n) => n ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${n}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/, aS = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, uS = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function lS() {
  return new RegExp(uS, "u");
}
const cS = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, hS = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/, fS = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, dS = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, pS = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, bm = /^[A-Za-z0-9_-]*$/, gS = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/, mS = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, vS = /^\+(?:[0-9]){6,14}[0-9]$/, wm = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", _S = /* @__PURE__ */ new RegExp(`^${wm}$`);
function xm(n) {
  const e = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof n.precision == "number" ? n.precision === -1 ? `${e}` : n.precision === 0 ? `${e}:[0-5]\\d` : `${e}:[0-5]\\d\\.\\d{${n.precision}}` : `${e}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function yS(n) {
  return new RegExp(`^${xm(n)}$`);
}
function bS(n) {
  const e = xm({ precision: n.precision }), t = ["Z"];
  n.local && t.push(""), n.offset && t.push("([+-]\\d{2}:\\d{2})");
  const r = `${e}(?:${t.join("|")})`;
  return new RegExp(`^${wm}T(?:${r})$`);
}
const wS = (n) => {
  const e = n ? `[\\s\\S]{${(n == null ? void 0 : n.minimum) ?? 0},${(n == null ? void 0 : n.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${e}$`);
}, xS = /^\d+$/, TS = /^-?\d+(?:\.\d+)?/i, SS = /true|false/i, MS = /null/i, ES = /^[^A-Z]*$/, CS = /^[^a-z]*$/, mn = /* @__PURE__ */ K("$ZodCheck", (n, e) => {
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
}), Mm = /* @__PURE__ */ K("$ZodCheckGreaterThan", (n, e) => {
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
}), AS = /* @__PURE__ */ K("$ZodCheckMultipleOf", (n, e) => {
  mn.init(n, e), n._zod.onattach.push((t) => {
    var r;
    (r = t._zod.bag).multipleOf ?? (r.multipleOf = e.value);
  }), n._zod.check = (t) => {
    if (typeof t.value != typeof e.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof t.value == "bigint" ? t.value % e.value === BigInt(0) : RT(t.value, e.value) === 0) || t.issues.push({
      origin: typeof t.value,
      code: "not_multiple_of",
      divisor: e.value,
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), IS = /* @__PURE__ */ K("$ZodCheckNumberFormat", (n, e) => {
  var u;
  mn.init(n, e), e.format = e.format || "float64";
  const t = (u = e.format) == null ? void 0 : u.includes("int"), r = t ? "int" : "number", [o, a] = BT[e.format];
  n._zod.onattach.push((h) => {
    const c = h._zod.bag;
    c.format = e.format, c.minimum = o, c.maximum = a, t && (c.pattern = xS);
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
}), PS = /* @__PURE__ */ K("$ZodCheckMaxLength", (n, e) => {
  mn.init(n, e), n._zod.when = (t) => {
    const r = t.value;
    return !Sh(r) && r.length !== void 0;
  }, n._zod.onattach.push((t) => {
    const r = t._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    e.maximum < r && (t._zod.bag.maximum = e.maximum);
  }), n._zod.check = (t) => {
    const r = t.value;
    if (r.length <= e.maximum)
      return;
    const a = Eh(r);
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
    return !Sh(r) && r.length !== void 0;
  }, n._zod.onattach.push((t) => {
    const r = t._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    e.minimum > r && (t._zod.bag.minimum = e.minimum);
  }), n._zod.check = (t) => {
    const r = t.value;
    if (r.length >= e.minimum)
      return;
    const a = Eh(r);
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
    return !Sh(r) && r.length !== void 0;
  }, n._zod.onattach.push((t) => {
    const r = t._zod.bag;
    r.minimum = e.length, r.maximum = e.length, r.length = e.length;
  }), n._zod.check = (t) => {
    const r = t.value, o = r.length;
    if (o === e.length)
      return;
    const a = Eh(r), u = o > e.length;
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
}), OS = /* @__PURE__ */ K("$ZodCheckRegex", (n, e) => {
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
}), NS = /* @__PURE__ */ K("$ZodCheckLowerCase", (n, e) => {
  e.pattern ?? (e.pattern = ES), Iu.init(n, e);
}), RS = /* @__PURE__ */ K("$ZodCheckUpperCase", (n, e) => {
  e.pattern ?? (e.pattern = CS), Iu.init(n, e);
}), zS = /* @__PURE__ */ K("$ZodCheckIncludes", (n, e) => {
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
}), DS = /* @__PURE__ */ K("$ZodCheckStartsWith", (n, e) => {
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
}), LS = /* @__PURE__ */ K("$ZodCheckEndsWith", (n, e) => {
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
}), BS = /* @__PURE__ */ K("$ZodCheckOverwrite", (n, e) => {
  mn.init(n, e), n._zod.check = (t) => {
    t.value = e.tx(t.value);
  };
});
class FS {
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
const US = {
  major: 4,
  minor: 0,
  patch: 0
}, ct = /* @__PURE__ */ K("$ZodType", (n, e) => {
  var o;
  var t;
  n ?? (n = {}), pt(n._zod, "id", () => e.type + "_" + fm(10)), n._zod.def = e, n._zod.bag = n._zod.bag || {}, n._zod.version = US;
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
      let f = ts(u), p;
      for (const g of h) {
        if (g._zod.when) {
          if (!g._zod.when(u))
            continue;
        } else if (f)
          continue;
        const m = u.issues.length, b = g._zod.check(u);
        if (b instanceof Promise && (c == null ? void 0 : c.async) === !1)
          throw new ls();
        if (p || b instanceof Promise)
          p = (p ?? Promise.resolve()).then(async () => {
            await b, u.issues.length !== m && (f || (f = ts(u, m)));
          });
        else {
          if (u.issues.length === m)
            continue;
          f || (f = ts(u, m));
        }
      }
      return p ? p.then(() => u) : u;
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
        const h = QT(n, a);
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
}), Ch = /* @__PURE__ */ K("$ZodString", (n, e) => {
  var t;
  ct.init(n, e), n._zod.pattern = [...((t = n == null ? void 0 : n._zod.bag) == null ? void 0 : t.patterns) ?? []].pop() ?? wS(n._zod.bag), n._zod.parse = (r, o) => {
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
  Iu.init(n, e), Ch.init(n, e);
}), ZS = /* @__PURE__ */ K("$ZodGUID", (n, e) => {
  e.pattern ?? (e.pattern = sS), gt.init(n, e);
}), qS = /* @__PURE__ */ K("$ZodUUID", (n, e) => {
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
    e.pattern ?? (e.pattern = r0(r));
  } else
    e.pattern ?? (e.pattern = r0());
  gt.init(n, e);
}), GS = /* @__PURE__ */ K("$ZodEmail", (n, e) => {
  e.pattern ?? (e.pattern = aS), gt.init(n, e);
}), HS = /* @__PURE__ */ K("$ZodURL", (n, e) => {
  gt.init(n, e), n._zod.check = (t) => {
    try {
      const r = new URL(t.value);
      e.hostname && (e.hostname.lastIndex = 0, e.hostname.test(r.hostname) || t.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: gS.source,
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
}), WS = /* @__PURE__ */ K("$ZodEmoji", (n, e) => {
  e.pattern ?? (e.pattern = lS()), gt.init(n, e);
}), jS = /* @__PURE__ */ K("$ZodNanoID", (n, e) => {
  e.pattern ?? (e.pattern = iS), gt.init(n, e);
}), VS = /* @__PURE__ */ K("$ZodCUID", (n, e) => {
  e.pattern ?? (e.pattern = XT), gt.init(n, e);
}), KS = /* @__PURE__ */ K("$ZodCUID2", (n, e) => {
  e.pattern ?? (e.pattern = eS), gt.init(n, e);
}), JS = /* @__PURE__ */ K("$ZodULID", (n, e) => {
  e.pattern ?? (e.pattern = tS), gt.init(n, e);
}), YS = /* @__PURE__ */ K("$ZodXID", (n, e) => {
  e.pattern ?? (e.pattern = nS), gt.init(n, e);
}), QS = /* @__PURE__ */ K("$ZodKSUID", (n, e) => {
  e.pattern ?? (e.pattern = rS), gt.init(n, e);
}), XS = /* @__PURE__ */ K("$ZodISODateTime", (n, e) => {
  e.pattern ?? (e.pattern = bS(e)), gt.init(n, e), n._zod.check;
}), eM = /* @__PURE__ */ K("$ZodISODate", (n, e) => {
  e.pattern ?? (e.pattern = _S), gt.init(n, e);
}), tM = /* @__PURE__ */ K("$ZodISOTime", (n, e) => {
  e.pattern ?? (e.pattern = yS(e)), gt.init(n, e), n._zod.check;
}), nM = /* @__PURE__ */ K("$ZodISODuration", (n, e) => {
  e.pattern ?? (e.pattern = oS), gt.init(n, e);
}), rM = /* @__PURE__ */ K("$ZodIPv4", (n, e) => {
  e.pattern ?? (e.pattern = cS), gt.init(n, e), n._zod.onattach.push((t) => {
    const r = t._zod.bag;
    r.format = "ipv4";
  });
}), iM = /* @__PURE__ */ K("$ZodIPv6", (n, e) => {
  e.pattern ?? (e.pattern = hS), gt.init(n, e), n._zod.onattach.push((t) => {
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
}), oM = /* @__PURE__ */ K("$ZodCIDRv4", (n, e) => {
  e.pattern ?? (e.pattern = fS), gt.init(n, e);
}), sM = /* @__PURE__ */ K("$ZodCIDRv6", (n, e) => {
  e.pattern ?? (e.pattern = dS), gt.init(n, e), n._zod.check = (t) => {
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
function Em(n) {
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
const aM = /* @__PURE__ */ K("$ZodBase64", (n, e) => {
  e.pattern ?? (e.pattern = pS), gt.init(n, e), n._zod.onattach.push((t) => {
    t._zod.bag.contentEncoding = "base64";
  }), n._zod.check = (t) => {
    Em(t.value) || t.issues.push({
      code: "invalid_format",
      format: "base64",
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
});
function uM(n) {
  if (!bm.test(n))
    return !1;
  const e = n.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), t = e.padEnd(Math.ceil(e.length / 4) * 4, "=");
  return Em(t);
}
const lM = /* @__PURE__ */ K("$ZodBase64URL", (n, e) => {
  e.pattern ?? (e.pattern = bm), gt.init(n, e), n._zod.onattach.push((t) => {
    t._zod.bag.contentEncoding = "base64url";
  }), n._zod.check = (t) => {
    uM(t.value) || t.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), cM = /* @__PURE__ */ K("$ZodE164", (n, e) => {
  e.pattern ?? (e.pattern = vS), gt.init(n, e);
});
function hM(n, e = null) {
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
const fM = /* @__PURE__ */ K("$ZodJWT", (n, e) => {
  gt.init(n, e), n._zod.check = (t) => {
    hM(t.value, e.alg) || t.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: t.value,
      inst: n,
      continue: !e.abort
    });
  };
}), Cm = /* @__PURE__ */ K("$ZodNumber", (n, e) => {
  ct.init(n, e), n._zod.pattern = n._zod.bag.pattern ?? TS, n._zod.parse = (t, r) => {
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
}), dM = /* @__PURE__ */ K("$ZodNumber", (n, e) => {
  IS.init(n, e), Cm.init(n, e);
}), pM = /* @__PURE__ */ K("$ZodBoolean", (n, e) => {
  ct.init(n, e), n._zod.pattern = SS, n._zod.parse = (t, r) => {
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
}), gM = /* @__PURE__ */ K("$ZodNull", (n, e) => {
  ct.init(n, e), n._zod.pattern = MS, n._zod.values = /* @__PURE__ */ new Set([null]), n._zod.parse = (t, r) => {
    const { value: o } = t;
    return o === null || t.issues.push({
      expected: "null",
      code: "invalid_type",
      input: o,
      inst: n
    }), t;
  };
}), mM = /* @__PURE__ */ K("$ZodUnknown", (n, e) => {
  ct.init(n, e), n._zod.parse = (t) => t;
}), vM = /* @__PURE__ */ K("$ZodNever", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => (t.issues.push({
    expected: "never",
    code: "invalid_type",
    input: t.value,
    inst: n
  }), t);
});
function i0(n, e, t) {
  n.issues.length && e.issues.push(...Ei(t, n.issues)), e.value[t] = n.value;
}
const _M = /* @__PURE__ */ K("$ZodArray", (n, e) => {
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
      c instanceof Promise ? a.push(c.then((f) => i0(f, t, u))) : i0(c, t, u);
    }
    return a.length ? Promise.all(a).then(() => t) : t;
  };
});
function Pa(n, e, t) {
  n.issues.length && e.issues.push(...Ei(t, n.issues)), e.value[t] = n.value;
}
function o0(n, e, t, r) {
  n.issues.length ? r[t] === void 0 ? t in r ? e.value[t] = void 0 : e.value[t] = n.value : e.issues.push(...Ei(t, n.issues)) : n.value === void 0 ? t in r && (e.value[t] = void 0) : e.value[t] = n.value;
}
const Am = /* @__PURE__ */ K("$ZodObject", (n, e) => {
  ct.init(n, e);
  const t = Th(() => {
    const g = Object.keys(e.shape);
    for (const b of g)
      if (!(e.shape[b] instanceof ct))
        throw new Error(`Invalid element at key "${b}": expected a Zod schema`);
    const m = LT(e.shape);
    return {
      shape: e.shape,
      keys: g,
      keySet: new Set(g),
      numKeys: g.length,
      optionalKeys: new Set(m)
    };
  });
  pt(n._zod, "propValues", () => {
    const g = e.shape, m = {};
    for (const b in g) {
      const _ = g[b]._zod;
      if (_.values) {
        m[b] ?? (m[b] = /* @__PURE__ */ new Set());
        for (const $ of _.values)
          m[b].add($);
      }
    }
    return m;
  });
  const r = (g) => {
    const m = new FS(["shape", "payload", "ctx"]), { keys: b, optionalKeys: _ } = t.value, $ = (I) => {
      const T = Ho(I);
      return `shape[${T}]._zod.run({ value: input[${T}], issues: [] }, ctx)`;
    };
    m.write("const input = payload.value;");
    const C = /* @__PURE__ */ Object.create(null);
    for (const I of b)
      C[I] = fm(15);
    m.write("const newResult = {}");
    for (const I of b)
      if (_.has(I)) {
        const T = C[I];
        m.write(`const ${T} = ${$(I)};`);
        const A = Ho(I);
        m.write(`
        if (${T}.issues.length) {
          if (input[${A}] === undefined) {
            if (${A} in input) {
              newResult[${A}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${T}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${A}, ...iss.path] : [${A}],
              }))
            );
          }
        } else if (${T}.value === undefined) {
          if (${A} in input) newResult[${A}] = undefined;
        } else {
          newResult[${A}] = ${T}.value;
        }
        `);
      } else {
        const T = C[I];
        m.write(`const ${T} = ${$(I)};`), m.write(`
          if (${T}.issues.length) payload.issues = payload.issues.concat(${T}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${Ho(I)}, ...iss.path] : [${Ho(I)}]
          })));`), m.write(`newResult[${Ho(I)}] = ${T}.value`);
      }
    m.write("payload.value = newResult;"), m.write("return payload;");
    const S = m.compile();
    return (I, T) => S(g, I, T);
  };
  let o;
  const a = Ja, u = !hm.jitless, c = u && zT.value, { catchall: f } = e;
  let p;
  n._zod.parse = (g, m) => {
    p ?? (p = t.value);
    const b = g.value;
    if (!a(b))
      return g.issues.push({
        expected: "object",
        code: "invalid_type",
        input: b,
        inst: n
      }), g;
    const _ = [];
    if (u && c && (m == null ? void 0 : m.async) === !1 && m.jitless !== !0)
      o || (o = r(e.shape)), g = o(g, m);
    else {
      g.value = {};
      const T = p.shape;
      for (const A of p.keys) {
        const N = T[A], D = N._zod.run({ value: b[A], issues: [] }, m), L = N._zod.optin === "optional" && N._zod.optout === "optional";
        D instanceof Promise ? _.push(D.then((q) => L ? o0(q, g, A, b) : Pa(q, g, A))) : L ? o0(D, g, A, b) : Pa(D, g, A);
      }
    }
    if (!f)
      return _.length ? Promise.all(_).then(() => g) : g;
    const $ = [], C = p.keySet, S = f._zod, I = S.def.type;
    for (const T of Object.keys(b)) {
      if (C.has(T))
        continue;
      if (I === "never") {
        $.push(T);
        continue;
      }
      const A = S.run({ value: b[T], issues: [] }, m);
      A instanceof Promise ? _.push(A.then((N) => Pa(N, g, T))) : Pa(A, g, T);
    }
    return $.length && g.issues.push({
      code: "unrecognized_keys",
      keys: $,
      input: b,
      inst: n
    }), _.length ? Promise.all(_).then(() => g) : g;
  };
});
function s0(n, e, t, r) {
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
      return new RegExp(`^(${t.map((r) => Mh(r.source)).join("|")})$`);
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
    return o ? Promise.all(a).then((u) => s0(u, t, n, r)) : s0(a, t, n, r);
  };
}), yM = /* @__PURE__ */ K("$ZodDiscriminatedUnion", (n, e) => {
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
  const r = Th(() => {
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
    if (!Ja(u))
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
}), bM = /* @__PURE__ */ K("$ZodIntersection", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => {
    const { value: o } = t, a = e.left._zod.run({ value: o, issues: [] }, r), u = e.right._zod.run({ value: o, issues: [] }, r);
    return a instanceof Promise || u instanceof Promise ? Promise.all([a, u]).then(([c, f]) => a0(t, c, f)) : a0(t, a, u);
  };
});
function Bc(n, e) {
  if (n === e)
    return { valid: !0, data: n };
  if (n instanceof Date && e instanceof Date && +n == +e)
    return { valid: !0, data: n };
  if (Lc(n) && Lc(e)) {
    const t = Object.keys(e), r = Object.keys(n).filter((a) => t.indexOf(a) !== -1), o = { ...n, ...e };
    for (const a of r) {
      const u = Bc(n[a], e[a]);
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
      const o = n[r], a = e[r], u = Bc(o, a);
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
function a0(n, e, t) {
  if (e.issues.length && n.issues.push(...e.issues), t.issues.length && n.issues.push(...t.issues), ts(n))
    return n;
  const r = Bc(e.value, t.value);
  if (!r.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(r.mergeErrorPath)}`);
  return n.value = r.data, n;
}
const wM = /* @__PURE__ */ K("$ZodRecord", (n, e) => {
  ct.init(n, e), n._zod.parse = (t, r) => {
    const o = t.value;
    if (!Lc(o))
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
          f instanceof Promise ? a.push(f.then((p) => {
            p.issues.length && t.issues.push(...Ei(c, p.issues)), t.value[c] = p.value;
          })) : (f.issues.length && t.issues.push(...Ei(c, f.issues)), t.value[c] = f.value);
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
          f.issues.length && t.issues.push(...Ei(u, f.issues)), t.value[h.value] = f.value;
        })) : (c.issues.length && t.issues.push(...Ei(u, c.issues)), t.value[h.value] = c.value);
      }
    }
    return a.length ? Promise.all(a).then(() => t) : t;
  };
}), xM = /* @__PURE__ */ K("$ZodEnum", (n, e) => {
  ct.init(n, e);
  const t = OT(e.entries);
  n._zod.values = new Set(t), n._zod.pattern = new RegExp(`^(${t.filter((r) => DT.has(typeof r)).map((r) => typeof r == "string" ? Ts(r) : r.toString()).join("|")})$`), n._zod.parse = (r, o) => {
    const a = r.value;
    return n._zod.values.has(a) || r.issues.push({
      code: "invalid_value",
      values: t,
      input: a,
      inst: n
    }), r;
  };
}), TM = /* @__PURE__ */ K("$ZodLiteral", (n, e) => {
  ct.init(n, e), n._zod.values = new Set(e.values), n._zod.pattern = new RegExp(`^(${e.values.map((t) => typeof t == "string" ? Ts(t) : t ? t.toString() : String(t)).join("|")})$`), n._zod.parse = (t, r) => {
    const o = t.value;
    return n._zod.values.has(o) || t.issues.push({
      code: "invalid_value",
      values: e.values,
      input: o,
      inst: n
    }), t;
  };
}), SM = /* @__PURE__ */ K("$ZodTransform", (n, e) => {
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
    return t ? new RegExp(`^(${Mh(t.source)})?$`) : void 0;
  }), n._zod.parse = (t, r) => t.value === void 0 ? t : e.innerType._zod.run(t, r);
}), MM = /* @__PURE__ */ K("$ZodNullable", (n, e) => {
  ct.init(n, e), pt(n._zod, "optin", () => e.innerType._zod.optin), pt(n._zod, "optout", () => e.innerType._zod.optout), pt(n._zod, "pattern", () => {
    const t = e.innerType._zod.pattern;
    return t ? new RegExp(`^(${Mh(t.source)}|null)$`) : void 0;
  }), pt(n._zod, "values", () => e.innerType._zod.values ? /* @__PURE__ */ new Set([...e.innerType._zod.values, null]) : void 0), n._zod.parse = (t, r) => t.value === null ? t : e.innerType._zod.run(t, r);
}), EM = /* @__PURE__ */ K("$ZodDefault", (n, e) => {
  ct.init(n, e), n._zod.optin = "optional", pt(n._zod, "values", () => e.innerType._zod.values), n._zod.parse = (t, r) => {
    if (t.value === void 0)
      return t.value = e.defaultValue, t;
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => u0(a, e)) : u0(o, e);
  };
});
function u0(n, e) {
  return n.value === void 0 && (n.value = e.defaultValue), n;
}
const CM = /* @__PURE__ */ K("$ZodPrefault", (n, e) => {
  ct.init(n, e), n._zod.optin = "optional", pt(n._zod, "values", () => e.innerType._zod.values), n._zod.parse = (t, r) => (t.value === void 0 && (t.value = e.defaultValue), e.innerType._zod.run(t, r));
}), AM = /* @__PURE__ */ K("$ZodNonOptional", (n, e) => {
  ct.init(n, e), pt(n._zod, "values", () => {
    const t = e.innerType._zod.values;
    return t ? new Set([...t].filter((r) => r !== void 0)) : void 0;
  }), n._zod.parse = (t, r) => {
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => l0(a, n)) : l0(o, n);
  };
});
function l0(n, e) {
  return !n.issues.length && n.value === void 0 && n.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: n.value,
    inst: e
  }), n;
}
const IM = /* @__PURE__ */ K("$ZodCatch", (n, e) => {
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
}), PM = /* @__PURE__ */ K("$ZodPipe", (n, e) => {
  ct.init(n, e), pt(n._zod, "values", () => e.in._zod.values), pt(n._zod, "optin", () => e.in._zod.optin), pt(n._zod, "optout", () => e.out._zod.optout), n._zod.parse = (t, r) => {
    const o = e.in._zod.run(t, r);
    return o instanceof Promise ? o.then((a) => c0(a, e, r)) : c0(o, e, r);
  };
});
function c0(n, e, t) {
  return ts(n) ? n : e.out._zod.run({ value: n.value, issues: n.issues }, t);
}
const kM = /* @__PURE__ */ K("$ZodReadonly", (n, e) => {
  ct.init(n, e), pt(n._zod, "propValues", () => e.innerType._zod.propValues), pt(n._zod, "optin", () => e.innerType._zod.optin), pt(n._zod, "optout", () => e.innerType._zod.optout), n._zod.parse = (t, r) => {
    const o = e.innerType._zod.run(t, r);
    return o instanceof Promise ? o.then(h0) : h0(o);
  };
});
function h0(n) {
  return n.value = Object.freeze(n.value), n;
}
const $M = /* @__PURE__ */ K("$ZodCustom", (n, e) => {
  mn.init(n, e), ct.init(n, e), n._zod.parse = (t, r) => t, n._zod.check = (t) => {
    const r = t.value, o = e.fn(r);
    if (o instanceof Promise)
      return o.then((a) => f0(a, t, r, n));
    f0(o, t, r, n);
  };
});
function f0(n, e, t, r) {
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
class OM {
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
function NM() {
  return new OM();
}
const ka = /* @__PURE__ */ NM();
function RM(n, e) {
  return new n({
    type: "string",
    ...me(e)
  });
}
function zM(n, e) {
  return new n({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function d0(n, e) {
  return new n({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function DM(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function LM(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...me(e)
  });
}
function BM(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...me(e)
  });
}
function FM(n, e) {
  return new n({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...me(e)
  });
}
function km(n, e) {
  return new n({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function UM(n, e) {
  return new n({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function ZM(n, e) {
  return new n({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function qM(n, e) {
  return new n({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function GM(n, e) {
  return new n({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function HM(n, e) {
  return new n({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function WM(n, e) {
  return new n({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function jM(n, e) {
  return new n({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function VM(n, e) {
  return new n({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function KM(n, e) {
  return new n({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function JM(n, e) {
  return new n({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function YM(n, e) {
  return new n({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function QM(n, e) {
  return new n({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function XM(n, e) {
  return new n({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function eE(n, e) {
  return new n({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function tE(n, e) {
  return new n({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...me(e)
  });
}
function nE(n, e) {
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
function rE(n, e) {
  return new n({
    type: "string",
    format: "date",
    check: "string_format",
    ...me(e)
  });
}
function iE(n, e) {
  return new n({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...me(e)
  });
}
function oE(n, e) {
  return new n({
    type: "string",
    format: "duration",
    check: "string_format",
    ...me(e)
  });
}
function sE(n, e) {
  return new n({
    type: "number",
    checks: [],
    ...me(e)
  });
}
function aE(n, e) {
  return new n({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...me(e)
  });
}
function uE(n, e) {
  return new n({
    type: "boolean",
    ...me(e)
  });
}
function lE(n, e) {
  return new n({
    type: "null",
    ...me(e)
  });
}
function cE(n) {
  return new n({
    type: "unknown"
  });
}
function hE(n, e) {
  return new n({
    type: "never",
    ...me(e)
  });
}
function p0(n, e) {
  return new Sm({
    check: "less_than",
    ...me(e),
    value: n,
    inclusive: !1
  });
}
function lc(n, e) {
  return new Sm({
    check: "less_than",
    ...me(e),
    value: n,
    inclusive: !0
  });
}
function g0(n, e) {
  return new Mm({
    check: "greater_than",
    ...me(e),
    value: n,
    inclusive: !1
  });
}
function cc(n, e) {
  return new Mm({
    check: "greater_than",
    ...me(e),
    value: n,
    inclusive: !0
  });
}
function m0(n, e) {
  return new AS({
    check: "multiple_of",
    ...me(e),
    value: n
  });
}
function $m(n, e) {
  return new PS({
    check: "max_length",
    ...me(e),
    maximum: n
  });
}
function Ya(n, e) {
  return new kS({
    check: "min_length",
    ...me(e),
    minimum: n
  });
}
function Om(n, e) {
  return new $S({
    check: "length_equals",
    ...me(e),
    length: n
  });
}
function fE(n, e) {
  return new OS({
    check: "string_format",
    format: "regex",
    ...me(e),
    pattern: n
  });
}
function dE(n) {
  return new NS({
    check: "string_format",
    format: "lowercase",
    ...me(n)
  });
}
function pE(n) {
  return new RS({
    check: "string_format",
    format: "uppercase",
    ...me(n)
  });
}
function gE(n, e) {
  return new zS({
    check: "string_format",
    format: "includes",
    ...me(e),
    includes: n
  });
}
function mE(n, e) {
  return new DS({
    check: "string_format",
    format: "starts_with",
    ...me(e),
    prefix: n
  });
}
function vE(n, e) {
  return new LS({
    check: "string_format",
    format: "ends_with",
    ...me(e),
    suffix: n
  });
}
function Ss(n) {
  return new BS({
    check: "overwrite",
    tx: n
  });
}
function _E(n) {
  return Ss((e) => e.normalize(n));
}
function yE() {
  return Ss((n) => n.trim());
}
function bE() {
  return Ss((n) => n.toLowerCase());
}
function wE() {
  return Ss((n) => n.toUpperCase());
}
function xE(n, e, t) {
  return new n({
    type: "array",
    element: e,
    // get element() {
    //   return element;
    // },
    ...me(t)
  });
}
function TE(n, e, t) {
  const r = me(t);
  return r.abort ?? (r.abort = !0), new n({
    type: "custom",
    check: "custom",
    fn: e,
    ...r
  });
}
function SE(n, e, t) {
  return new n({
    type: "custom",
    check: "custom",
    fn: e,
    ...me(t)
  });
}
const ME = /* @__PURE__ */ K("ZodISODateTime", (n, e) => {
  XS.init(n, e), bt.init(n, e);
});
function Fc(n) {
  return nE(ME, n);
}
const EE = /* @__PURE__ */ K("ZodISODate", (n, e) => {
  eM.init(n, e), bt.init(n, e);
});
function CE(n) {
  return rE(EE, n);
}
const AE = /* @__PURE__ */ K("ZodISOTime", (n, e) => {
  tM.init(n, e), bt.init(n, e);
});
function IE(n) {
  return iE(AE, n);
}
const PE = /* @__PURE__ */ K("ZodISODuration", (n, e) => {
  nM.init(n, e), bt.init(n, e);
});
function kE(n) {
  return oE(PE, n);
}
const $E = (n, e) => {
  gm.init(n, e), n.name = "ZodError", Object.defineProperties(n, {
    format: {
      value: (t) => jT(n, t)
      // enumerable: false,
    },
    flatten: {
      value: (t) => WT(n, t)
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
}, Pu = K("ZodError", $E, {
  Parent: Error
}), OE = /* @__PURE__ */ JT(Pu), NE = /* @__PURE__ */ YT(Pu), RE = /* @__PURE__ */ vm(Pu), zE = /* @__PURE__ */ _m(Pu), yt = /* @__PURE__ */ K("ZodType", (n, e) => (ct.init(n, e), n.def = e, Object.defineProperty(n, "_def", { value: e }), n.check = (...t) => n.clone(
  {
    ...e,
    checks: [
      ...e.checks ?? [],
      ...t.map((r) => typeof r == "function" ? { _zod: { check: r, def: { check: "custom" }, onattach: [] } } : r)
    ]
  }
  // { parent: true }
), n.clone = (t, r) => Ri(n, t, r), n.brand = () => n, n.register = (t, r) => (t.add(n, r), n), n.parse = (t, r) => OE(n, t, r, { callee: n.parse }), n.safeParse = (t, r) => RE(n, t, r), n.parseAsync = async (t, r) => NE(n, t, r, { callee: n.parseAsync }), n.safeParseAsync = async (t, r) => zE(n, t, r), n.spa = n.safeParseAsync, n.refine = (t, r) => n.check(CC(t, r)), n.superRefine = (t) => n.check(AC(t)), n.overwrite = (t) => n.check(Ss(t)), n.optional = () => Qa(n), n.nullable = () => y0(n), n.nullish = () => Qa(y0(n)), n.nonoptional = (t) => bC(n, t), n.array = () => nt(n), n.or = (t) => aC([n, t]), n.and = (t) => cC(n, t), n.transform = (t) => b0(n, pC(t)), n.default = (t) => vC(n, t), n.prefault = (t) => yC(n, t), n.catch = (t) => xC(n, t), n.pipe = (t) => b0(n, t), n.readonly = () => MC(n), n.describe = (t) => {
  const r = n.clone();
  return ka.add(r, { description: t }), r;
}, Object.defineProperty(n, "description", {
  get() {
    var t;
    return (t = ka.get(n)) == null ? void 0 : t.description;
  },
  configurable: !0
}), n.meta = (...t) => {
  if (t.length === 0)
    return ka.get(n);
  const r = n.clone();
  return ka.add(r, t[0]), r;
}, n.isOptional = () => n.safeParse(void 0).success, n.isNullable = () => n.safeParse(null).success, n)), Nm = /* @__PURE__ */ K("_ZodString", (n, e) => {
  Ch.init(n, e), yt.init(n, e);
  const t = n._zod.bag;
  n.format = t.format ?? null, n.minLength = t.minimum ?? null, n.maxLength = t.maximum ?? null, n.regex = (...r) => n.check(fE(...r)), n.includes = (...r) => n.check(gE(...r)), n.startsWith = (...r) => n.check(mE(...r)), n.endsWith = (...r) => n.check(vE(...r)), n.min = (...r) => n.check(Ya(...r)), n.max = (...r) => n.check($m(...r)), n.length = (...r) => n.check(Om(...r)), n.nonempty = (...r) => n.check(Ya(1, ...r)), n.lowercase = (r) => n.check(dE(r)), n.uppercase = (r) => n.check(pE(r)), n.trim = () => n.check(yE()), n.normalize = (...r) => n.check(_E(...r)), n.toLowerCase = () => n.check(bE()), n.toUpperCase = () => n.check(wE());
}), DE = /* @__PURE__ */ K("ZodString", (n, e) => {
  Ch.init(n, e), Nm.init(n, e), n.email = (t) => n.check(zM(LE, t)), n.url = (t) => n.check(km(Rm, t)), n.jwt = (t) => n.check(tE(XE, t)), n.emoji = (t) => n.check(UM(BE, t)), n.guid = (t) => n.check(d0(v0, t)), n.uuid = (t) => n.check(DM($a, t)), n.uuidv4 = (t) => n.check(LM($a, t)), n.uuidv6 = (t) => n.check(BM($a, t)), n.uuidv7 = (t) => n.check(FM($a, t)), n.nanoid = (t) => n.check(ZM(FE, t)), n.guid = (t) => n.check(d0(v0, t)), n.cuid = (t) => n.check(qM(UE, t)), n.cuid2 = (t) => n.check(GM(ZE, t)), n.ulid = (t) => n.check(HM(qE, t)), n.base64 = (t) => n.check(QM(JE, t)), n.base64url = (t) => n.check(XM(YE, t)), n.xid = (t) => n.check(WM(GE, t)), n.ksuid = (t) => n.check(jM(HE, t)), n.ipv4 = (t) => n.check(VM(WE, t)), n.ipv6 = (t) => n.check(KM(jE, t)), n.cidrv4 = (t) => n.check(JM(VE, t)), n.cidrv6 = (t) => n.check(YM(KE, t)), n.e164 = (t) => n.check(eE(QE, t)), n.datetime = (t) => n.check(Fc(t)), n.date = (t) => n.check(CE(t)), n.time = (t) => n.check(IE(t)), n.duration = (t) => n.check(kE(t));
});
function qe(n) {
  return RM(DE, n);
}
const bt = /* @__PURE__ */ K("ZodStringFormat", (n, e) => {
  gt.init(n, e), Nm.init(n, e);
}), LE = /* @__PURE__ */ K("ZodEmail", (n, e) => {
  GS.init(n, e), bt.init(n, e);
}), v0 = /* @__PURE__ */ K("ZodGUID", (n, e) => {
  ZS.init(n, e), bt.init(n, e);
}), $a = /* @__PURE__ */ K("ZodUUID", (n, e) => {
  qS.init(n, e), bt.init(n, e);
}), Rm = /* @__PURE__ */ K("ZodURL", (n, e) => {
  HS.init(n, e), bt.init(n, e);
});
function zm(n) {
  return km(Rm, n);
}
const BE = /* @__PURE__ */ K("ZodEmoji", (n, e) => {
  WS.init(n, e), bt.init(n, e);
}), FE = /* @__PURE__ */ K("ZodNanoID", (n, e) => {
  jS.init(n, e), bt.init(n, e);
}), UE = /* @__PURE__ */ K("ZodCUID", (n, e) => {
  VS.init(n, e), bt.init(n, e);
}), ZE = /* @__PURE__ */ K("ZodCUID2", (n, e) => {
  KS.init(n, e), bt.init(n, e);
}), qE = /* @__PURE__ */ K("ZodULID", (n, e) => {
  JS.init(n, e), bt.init(n, e);
}), GE = /* @__PURE__ */ K("ZodXID", (n, e) => {
  YS.init(n, e), bt.init(n, e);
}), HE = /* @__PURE__ */ K("ZodKSUID", (n, e) => {
  QS.init(n, e), bt.init(n, e);
}), WE = /* @__PURE__ */ K("ZodIPv4", (n, e) => {
  rM.init(n, e), bt.init(n, e);
}), jE = /* @__PURE__ */ K("ZodIPv6", (n, e) => {
  iM.init(n, e), bt.init(n, e);
}), VE = /* @__PURE__ */ K("ZodCIDRv4", (n, e) => {
  oM.init(n, e), bt.init(n, e);
}), KE = /* @__PURE__ */ K("ZodCIDRv6", (n, e) => {
  sM.init(n, e), bt.init(n, e);
}), JE = /* @__PURE__ */ K("ZodBase64", (n, e) => {
  aM.init(n, e), bt.init(n, e);
}), YE = /* @__PURE__ */ K("ZodBase64URL", (n, e) => {
  lM.init(n, e), bt.init(n, e);
}), QE = /* @__PURE__ */ K("ZodE164", (n, e) => {
  cM.init(n, e), bt.init(n, e);
}), XE = /* @__PURE__ */ K("ZodJWT", (n, e) => {
  fM.init(n, e), bt.init(n, e);
}), Dm = /* @__PURE__ */ K("ZodNumber", (n, e) => {
  Cm.init(n, e), yt.init(n, e), n.gt = (r, o) => n.check(g0(r, o)), n.gte = (r, o) => n.check(cc(r, o)), n.min = (r, o) => n.check(cc(r, o)), n.lt = (r, o) => n.check(p0(r, o)), n.lte = (r, o) => n.check(lc(r, o)), n.max = (r, o) => n.check(lc(r, o)), n.int = (r) => n.check(_0(r)), n.safe = (r) => n.check(_0(r)), n.positive = (r) => n.check(g0(0, r)), n.nonnegative = (r) => n.check(cc(0, r)), n.negative = (r) => n.check(p0(0, r)), n.nonpositive = (r) => n.check(lc(0, r)), n.multipleOf = (r, o) => n.check(m0(r, o)), n.step = (r, o) => n.check(m0(r, o)), n.finite = () => n;
  const t = n._zod.bag;
  n.minValue = Math.max(t.minimum ?? Number.NEGATIVE_INFINITY, t.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, n.maxValue = Math.min(t.maximum ?? Number.POSITIVE_INFINITY, t.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, n.isInt = (t.format ?? "").includes("int") || Number.isSafeInteger(t.multipleOf ?? 0.5), n.isFinite = !0, n.format = t.format ?? null;
});
function V(n) {
  return sE(Dm, n);
}
const eC = /* @__PURE__ */ K("ZodNumberFormat", (n, e) => {
  dM.init(n, e), Dm.init(n, e);
});
function _0(n) {
  return aE(eC, n);
}
const tC = /* @__PURE__ */ K("ZodBoolean", (n, e) => {
  pM.init(n, e), yt.init(n, e);
});
function vt(n) {
  return uE(tC, n);
}
const nC = /* @__PURE__ */ K("ZodNull", (n, e) => {
  gM.init(n, e), yt.init(n, e);
});
function Ke(n) {
  return lE(nC, n);
}
const rC = /* @__PURE__ */ K("ZodUnknown", (n, e) => {
  mM.init(n, e), yt.init(n, e);
});
function Uc() {
  return cE(rC);
}
const iC = /* @__PURE__ */ K("ZodNever", (n, e) => {
  vM.init(n, e), yt.init(n, e);
});
function Lm(n) {
  return hE(iC, n);
}
const oC = /* @__PURE__ */ K("ZodArray", (n, e) => {
  _M.init(n, e), yt.init(n, e), n.element = e.element, n.min = (t, r) => n.check(Ya(t, r)), n.nonempty = (t) => n.check(Ya(1, t)), n.max = (t, r) => n.check($m(t, r)), n.length = (t, r) => n.check(Om(t, r)), n.unwrap = () => n.element;
});
function nt(n, e) {
  return xE(oC, n, e);
}
const Ah = /* @__PURE__ */ K("ZodObject", (n, e) => {
  Am.init(n, e), yt.init(n, e), pt(n, "shape", () => e.shape), n.keyof = () => Bt(Object.keys(n._zod.def.shape)), n.catchall = (t) => n.clone({ ...n._zod.def, catchall: t }), n.passthrough = () => n.clone({ ...n._zod.def, catchall: Uc() }), n.loose = () => n.clone({ ...n._zod.def, catchall: Uc() }), n.strict = () => n.clone({ ...n._zod.def, catchall: Lm() }), n.strip = () => n.clone({ ...n._zod.def, catchall: void 0 }), n.extend = (t) => ZT(n, t), n.merge = (t) => qT(n, t), n.pick = (t) => FT(n, t), n.omit = (t) => UT(n, t), n.partial = (...t) => GT(Fm, n, t[0]), n.required = (...t) => HT(Um, n, t[0]);
});
function $i(n, e) {
  const t = {
    type: "object",
    get shape() {
      return xs(this, "shape", { ...n }), this.shape;
    },
    ...me(e)
  };
  return new Ah(t);
}
function Ie(n, e) {
  return new Ah({
    type: "object",
    get shape() {
      return xs(this, "shape", { ...n }), this.shape;
    },
    catchall: Lm(),
    ...me(e)
  });
}
function sC(n, e) {
  return new Ah({
    type: "object",
    get shape() {
      return xs(this, "shape", { ...n }), this.shape;
    },
    catchall: Uc(),
    ...me(e)
  });
}
const Bm = /* @__PURE__ */ K("ZodUnion", (n, e) => {
  Im.init(n, e), yt.init(n, e), n.options = e.options;
});
function aC(n, e) {
  return new Bm({
    type: "union",
    options: n,
    ...me(e)
  });
}
const uC = /* @__PURE__ */ K("ZodDiscriminatedUnion", (n, e) => {
  Bm.init(n, e), yM.init(n, e);
});
function Ih(n, e, t) {
  return new uC({
    type: "union",
    options: e,
    discriminator: n,
    ...me(t)
  });
}
const lC = /* @__PURE__ */ K("ZodIntersection", (n, e) => {
  bM.init(n, e), yt.init(n, e);
});
function cC(n, e) {
  return new lC({
    type: "intersection",
    left: n,
    right: e
  });
}
const hC = /* @__PURE__ */ K("ZodRecord", (n, e) => {
  wM.init(n, e), yt.init(n, e), n.keyType = e.keyType, n.valueType = e.valueType;
});
function Cr(n, e, t) {
  return new hC({
    type: "record",
    keyType: n,
    valueType: e,
    ...me(t)
  });
}
const Zc = /* @__PURE__ */ K("ZodEnum", (n, e) => {
  xM.init(n, e), yt.init(n, e), n.enum = e.entries, n.options = Object.values(e.entries);
  const t = new Set(Object.keys(e.entries));
  n.extract = (r, o) => {
    const a = {};
    for (const u of r)
      if (t.has(u))
        a[u] = e.entries[u];
      else
        throw new Error(`Key ${u} not found in enum`);
    return new Zc({
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
    return new Zc({
      ...e,
      checks: [],
      ...me(o),
      entries: a
    });
  };
});
function Bt(n, e) {
  const t = Array.isArray(n) ? Object.fromEntries(n.map((r) => [r, r])) : n;
  return new Zc({
    type: "enum",
    entries: t,
    ...me(e)
  });
}
const fC = /* @__PURE__ */ K("ZodLiteral", (n, e) => {
  TM.init(n, e), yt.init(n, e), n.values = new Set(e.values), Object.defineProperty(n, "value", {
    get() {
      if (e.values.length > 1)
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      return e.values[0];
    }
  });
});
function Pi(n, e) {
  return new fC({
    type: "literal",
    values: Array.isArray(n) ? n : [n],
    ...me(e)
  });
}
const dC = /* @__PURE__ */ K("ZodTransform", (n, e) => {
  SM.init(n, e), yt.init(n, e), n._zod.parse = (t, r) => {
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
function pC(n) {
  return new dC({
    type: "transform",
    transform: n
  });
}
const Fm = /* @__PURE__ */ K("ZodOptional", (n, e) => {
  Pm.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function Qa(n) {
  return new Fm({
    type: "optional",
    innerType: n
  });
}
const gC = /* @__PURE__ */ K("ZodNullable", (n, e) => {
  MM.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function y0(n) {
  return new gC({
    type: "nullable",
    innerType: n
  });
}
const mC = /* @__PURE__ */ K("ZodDefault", (n, e) => {
  EM.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType, n.removeDefault = n.unwrap;
});
function vC(n, e) {
  return new mC({
    type: "default",
    innerType: n,
    get defaultValue() {
      return typeof e == "function" ? e() : e;
    }
  });
}
const _C = /* @__PURE__ */ K("ZodPrefault", (n, e) => {
  CM.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function yC(n, e) {
  return new _C({
    type: "prefault",
    innerType: n,
    get defaultValue() {
      return typeof e == "function" ? e() : e;
    }
  });
}
const Um = /* @__PURE__ */ K("ZodNonOptional", (n, e) => {
  AM.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType;
});
function bC(n, e) {
  return new Um({
    type: "nonoptional",
    innerType: n,
    ...me(e)
  });
}
const wC = /* @__PURE__ */ K("ZodCatch", (n, e) => {
  IM.init(n, e), yt.init(n, e), n.unwrap = () => n._zod.def.innerType, n.removeCatch = n.unwrap;
});
function xC(n, e) {
  return new wC({
    type: "catch",
    innerType: n,
    catchValue: typeof e == "function" ? e : () => e
  });
}
const TC = /* @__PURE__ */ K("ZodPipe", (n, e) => {
  PM.init(n, e), yt.init(n, e), n.in = e.in, n.out = e.out;
});
function b0(n, e) {
  return new TC({
    type: "pipe",
    in: n,
    out: e
    // ...util.normalizeParams(params),
  });
}
const SC = /* @__PURE__ */ K("ZodReadonly", (n, e) => {
  kM.init(n, e), yt.init(n, e);
});
function MC(n) {
  return new SC({
    type: "readonly",
    innerType: n
  });
}
const Ph = /* @__PURE__ */ K("ZodCustom", (n, e) => {
  $M.init(n, e), yt.init(n, e);
});
function EC(n, e) {
  const t = new mn({
    check: "custom",
    ...me(e)
  });
  return t._zod.check = n, t;
}
function Zm(n, e) {
  return TE(Ph, () => !0, e);
}
function CC(n, e = {}) {
  return SE(Ph, n, e);
}
function AC(n, e) {
  const t = EC((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(cs(o, r.value, t._zod.def));
    else {
      const a = o;
      a.fatal && (a.continue = !1), a.code ?? (a.code = "custom"), a.input ?? (a.input = r.value), a.inst ?? (a.inst = t), a.continue ?? (a.continue = !t._zod.def.abort), r.issues.push(cs(a));
    }
  }, n(r.value, r)), e);
  return t;
}
function w0(n, e = {
  error: `Input not instance of ${n.name}`
}) {
  const t = new Ph({
    type: "custom",
    check: "custom",
    fn: (r) => r instanceof n,
    abort: !0,
    ...me(e)
  });
  return t._zod.bag.Class = n, t;
}
function IC(n) {
  let t = new ot(n).to("srgb").toString({ format: "hex" }).toUpperCase();
  return t.length === 4 && (t = `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`), t;
}
const Dt = qe().transform(IC), qc = Ih("colorType", [
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
const PC = Bt([
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
]), kC = zm({
  protocol: /^https?$/,
  hostname: mS
}), $C = qe().startsWith("data:image/png;base64,"), OC = kC.or($C), NC = Ie({
  x: V(),
  y: V(),
  z: V()
}), RC = Bt([
  "top",
  "top-left",
  "top-right",
  "left",
  "center",
  "right",
  "bottom",
  "bottom-left",
  "bottom-right"
]), zC = Bt(["left", "center", "right"]), DC = Bt(["pulse", "bounce", "shake", "glow", "fill"]), LC = Bt([
  "notification",
  "label",
  "label-success",
  "label-warning",
  "label-danger",
  "count",
  "icon",
  "progress",
  "dot"
]), BC = Bt(["linear", "radial"]), FC = Bt(["vertical", "horizontal", "diagonal"]), UC = Bt(["round", "bevel", "miter"]), ZC = Ie({
  width: V(),
  color: Dt,
  spacing: V()
}), hs = Ie({
  // Basic properties from original TextBlockStyle
  enabled: vt().default(!1).optional(),
  textPath: qe().optional(),
  location: PC.default("top").optional(),
  // Text content
  text: qe().optional(),
  // Font settings
  font: qe().default("Verdana").optional(),
  fontSize: V().default(48).optional(),
  fontWeight: qe().default("normal").optional(),
  lineHeight: V().default(1.2).optional(),
  // Colors
  textColor: Dt.default("#000000").optional(),
  backgroundColor: qc.or(Dt).optional(),
  // Single border (legacy)
  borderWidth: V().default(0).optional(),
  borderColor: Dt.default("#000000").optional(),
  // Multiple borders
  borders: nt(ZC).optional(),
  // Margins
  marginTop: V().default(5).optional(),
  marginBottom: V().default(5).optional(),
  marginLeft: V().default(5).optional(),
  marginRight: V().default(5).optional(),
  // Layout
  textAlign: zC.default("center").optional(),
  cornerRadius: V().default(0).optional(),
  autoSize: vt().default(!0).optional(),
  resolution: V().default(128).optional(),
  billboardMode: V().default(7).optional(),
  // BABYLON.Mesh.BILLBOARDMODE_ALL
  // Position
  position: NC.optional(),
  attachPosition: RC.optional(),
  attachOffset: V().default(0).optional(),
  // Depth fading
  depthFadeEnabled: vt().default(!1).optional(),
  depthFadeNear: V().default(10).optional(),
  depthFadeFar: V().default(50).optional(),
  // Text effects
  textOutline: vt().default(!1).optional(),
  textOutlineWidth: V().default(2).optional(),
  textOutlineColor: Dt.default("#000000").optional(),
  textOutlineJoin: UC.default("round").optional(),
  textShadow: vt().default(!1).optional(),
  textShadowColor: Dt.default("#000000").optional(),
  textShadowBlur: V().default(4).optional(),
  textShadowOffsetX: V().default(2).optional(),
  textShadowOffsetY: V().default(2).optional(),
  // Background effects
  backgroundPadding: V().default(0).optional(),
  backgroundGradient: vt().default(!1).optional(),
  backgroundGradientType: BC.default("linear").optional(),
  backgroundGradientColors: nt(Dt).optional(),
  backgroundGradientDirection: FC.default("vertical").optional(),
  // Pointer/Arrow
  pointer: vt().default(!1).optional(),
  pointerDirection: Bt(["top", "bottom", "left", "right", "auto"]).default("auto").optional(),
  pointerWidth: V().default(20).optional(),
  pointerHeight: V().default(10).optional(),
  pointerOffset: V().default(0).optional(),
  pointerCurve: vt().default(!1).optional(),
  // Animation
  animation: DC.nullable().default(null).optional(),
  animationSpeed: V().default(1).optional(),
  // Badge
  badge: LC.optional(),
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
  background: qc.or(Dt).optional(),
  // maps to backgroundColor
  backgroundCornerRadius: V().optional(),
  // maps to cornerRadius
  margin: V().optional(),
  // maps to all margins
  style: qe().optional()
  // maps to fontWeight (bold, italic, etc.)
});
function qC(n) {
  const e = { ...n };
  return e.size !== void 0 && e.fontSize === void 0 && (e.fontSize = e.size, delete e.size), e.color !== void 0 && e.textColor === void 0 && (e.textColor = e.color, delete e.color), e.background !== void 0 && e.backgroundColor === void 0 && (e.backgroundColor = e.background, delete e.background), e.backgroundCornerRadius !== void 0 && e.cornerRadius === void 0 && (e.cornerRadius = e.backgroundCornerRadius, delete e.backgroundCornerRadius), e.margin !== void 0 && (e.marginTop ?? (e.marginTop = e.margin), e.marginBottom ?? (e.marginBottom = e.margin), e.marginLeft ?? (e.marginLeft = e.margin), e.marginRight ?? (e.marginRight = e.margin), delete e.margin), e.style !== void 0 && e.fontWeight === void 0 && (e.style.includes("bold") ? e.fontWeight = "bold" : e.style.includes("normal") ? e.fontWeight = "normal" : e.fontWeight = e.style, delete e.style), e;
}
const GC = Bt([
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
]), x0 = Ie({
  type: GC.default("normal"),
  size: V().positive().default(1),
  color: Dt.default("white"),
  opacity: V().min(0).max(1).default(1),
  text: hs.prefault({ location: "top" })
}), HC = Bt([
  // https://manual.cytoscape.org/en/stable/Styles.html#available-shapes-and-line-styles
  "solid",
  "dash",
  "dash-dot",
  "dots",
  "equal-dash",
  "sinewave",
  "zigzag"
]), WC = Ie({
  type: HC.optional(),
  animationSpeed: V().min(0).optional(),
  width: V().positive().optional(),
  color: Dt.optional(),
  opacity: V().min(0).max(1).optional(),
  bezier: vt().optional()
}), Gc = Ie({
  arrowHead: x0.optional(),
  arrowTail: x0.optional(),
  line: WC.optional(),
  label: hs.prefault({ location: "top" }).optional(),
  tooltip: hs.prefault({ location: "bottom" }).optional(),
  // effects: glow // https://playground.babylonjs.com/#H1LRZ3#35
  enabled: vt().default(!0)
}), jC = {
  line: {
    type: "solid",
    animationSpeed: 0.1,
    width: 0.25,
    color: "darkgrey"
  },
  enabled: !0
}, VC = Bt([
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
]), Xa = Ie({
  shape: Ie({
    size: V().positive().optional(),
    type: VC.optional()
    // custom mesh https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/custom/custom
    // import mesh https://doc.babylonjs.com/typedoc/functions/BABYLON.ImportMeshAsync
  }).optional(),
  texture: Ie({
    color: qc.or(Dt).optional(),
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
}), KC = {
  shape: {
    type: "icosphere",
    size: 1
  },
  texture: {
    color: "grey"
  },
  enabled: !0
}, JC = $i({
  nodeIdPath: qe().default("id"),
  nodeWeightPath: qe().or(Ke()).default(null),
  nodeTimePath: qe().or(Ke()).default(null),
  edgeSrcIdPath: qe().default("src"),
  edgeDstIdPath: qe().default("dst"),
  edgeWeightPath: qe().or(Ke()).default(null),
  edgeTimePath: qe().or(Ke()).default(null)
}), YC = Ie({
  algorithms: nt(qe()).optional(),
  knownFields: JC.prefault({})
  // schema: z4.$ZodObject,
}), QC = Ie({
  pinOnDrag: vt().default(!0)
}).prefault({}), XC = Ie({
  type: qe().default("ngraph"),
  preSteps: V().default(0),
  stepMultiplier: V().default(1),
  minDelta: V().default(0)
}), eA = Ie({
  // dimensions: z.int().min(2).max(3).default(3),
  layout: XC.prefault({}),
  node: QC,
  fetchNodes: Qa(w0(Function)),
  fetchEdges: Qa(w0(Function))
}), Hc = qe().or(V());
$i({
  id: Hc,
  metadata: $i()
});
$i({
  src: Hc,
  dst: Hc,
  metadata: $i()
});
const tA = Ie({
  backgroundType: Pi("color"),
  color: Dt
}), nA = Ie({
  backgroundType: Pi("skybox"),
  data: OC
}), rA = Ih("backgroundType", [
  tA,
  nA
]), iA = Ie({
  // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/motionBlurPostProcess/
  motionBlur: V().optional(),
  // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/dofLenseEffects/
  depthOfField: V().optional(),
  // https://doc.babylonjs.com/features/featuresDeepDive/postProcesses/SSRRenderingPipeline/
  screenSpaceReflections: vt().optional()
}), oA = Ie({
  addDefaultStyle: vt().default(!0),
  background: rA.prefault({ backgroundType: "color", color: "whitesmoke" }),
  effects: iA.optional(),
  startingCameraDistance: V().default(30),
  // TODO: replace with "zoomToFit: z.boolean()"
  layout: qe().default("ngraph"),
  layoutOptions: $i().optional(),
  twoD: vt().default(!1)
}), sA = qe().regex(/^data\.|algorithmResults\./), aA = qe().startsWith("style."), qm = Ie({
  inputs: nt(sA),
  output: aA,
  expr: qe()
}), uA = Ie({
  selector: qe(),
  style: Xa,
  calculatedStyle: qm.optional()
}), lA = Ie({
  selector: qe(),
  style: Gc,
  calculatedStyle: qm.optional()
}), cA = Ie({
  node: uA,
  edge: lA
}).partial().refine(
  (n) => !!n.node || !!n.edge,
  "StyleLayer requires either 'node' or 'edge'."
), hA = Ie({
  templateName: qe().optional(),
  templateCreator: qe().optional(),
  templateCreationTimestamp: Fc().optional(),
  templateModificationTimestamp: Fc().optional()
}), fA = Ie({
  graphtyTemplate: Pi(!0),
  majorVersion: Pi("1"),
  metadata: hA.optional(),
  graph: oA.prefault({}),
  layers: nt(cA).prefault([]),
  data: YC.prefault({}),
  behavior: eA.prefault({})
}), dA = Ih("majorVersion", [
  fA
]), T0 = /* @__PURE__ */ new Map();
class kh {
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
      const o = KT(r.error);
      throw new TypeError(`Error while validating data in '${this.type}' data source:
${o}`);
    }
  }
  get type() {
    return this.constructor.type;
  }
  static register(e) {
    const t = e.type;
    return T0.set(t, e), e;
  }
  static get(e, t = {}) {
    const r = T0.get(e);
    return r ? new r(t) : null;
  }
}
var Oa = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ms(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var hc = {}, S0;
function pA() {
  return S0 || (S0 = 1, function(n) {
    (function(e) {
      function t(x) {
        return x !== null ? Object.prototype.toString.call(x) === "[object Array]" : !1;
      }
      function r(x) {
        return x !== null ? Object.prototype.toString.call(x) === "[object Object]" : !1;
      }
      function o(x, k) {
        if (x === k)
          return !0;
        var z = Object.prototype.toString.call(x);
        if (z !== Object.prototype.toString.call(k))
          return !1;
        if (t(x) === !0) {
          if (x.length !== k.length)
            return !1;
          for (var H = 0; H < x.length; H++)
            if (o(x[H], k[H]) === !1)
              return !1;
          return !0;
        }
        if (r(x) === !0) {
          var Q = {};
          for (var le in x)
            if (hasOwnProperty.call(x, le)) {
              if (o(x[le], k[le]) === !1)
                return !1;
              Q[le] = !0;
            }
          for (var Ae in k)
            if (hasOwnProperty.call(k, Ae) && Q[Ae] !== !0)
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
          for (var k in x)
            if (x.hasOwnProperty(k))
              return !1;
          return !0;
        } else
          return !1;
      }
      function u(x) {
        for (var k = Object.keys(x), z = [], H = 0; H < k.length; H++)
          z.push(x[k[H]]);
        return z;
      }
      var h;
      typeof String.prototype.trimLeft == "function" ? h = function(x) {
        return x.trimLeft();
      } : h = function(x) {
        return x.match(/^\s*(.*)/)[1];
      };
      var c = 0, f = 1, p = 2, g = 3, m = 4, b = 5, _ = 6, $ = 7, C = 8, S = 9, I = {
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
      }, T = "EOF", A = "UnquotedIdentifier", N = "QuotedIdentifier", D = "Rbracket", L = "Rparen", q = "Comma", oe = "Colon", be = "Rbrace", ge = "Number", pe = "Current", Je = "Expref", Le = "Pipe", rt = "Or", He = "And", te = "EQ", se = "GT", re = "LT", ce = "GTE", ve = "LTE", xe = "NE", Re = "Flatten", Ve = "Star", ae = "Filter", ee = "Dot", U = "Not", W = "Lbrace", J = "Lbracket", he = "Lparen", we = "Literal", Ue = {
        ".": ee,
        "*": Ve,
        ",": q,
        ":": oe,
        "{": W,
        "}": be,
        "]": D,
        "(": he,
        ")": L,
        "@": pe
      }, wt = {
        "<": !0,
        ">": !0,
        "=": !0,
        "!": !0
      }, $e = {
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
      function On() {
      }
      On.prototype = {
        tokenize: function(x) {
          var k = [];
          this._current = 0;
          for (var z, H, Q; this._current < x.length; )
            if (tt(x[this._current]))
              z = this._current, H = this._consumeUnquotedIdentifier(x), k.push({
                type: A,
                value: H,
                start: z
              });
            else if (Ue[x[this._current]] !== void 0)
              k.push({
                type: Ue[x[this._current]],
                value: x[this._current],
                start: this._current
              }), this._current++;
            else if (Nt(x[this._current]))
              Q = this._consumeNumber(x), k.push(Q);
            else if (x[this._current] === "[")
              Q = this._consumeLBracket(x), k.push(Q);
            else if (x[this._current] === '"')
              z = this._current, H = this._consumeQuotedIdentifier(x), k.push({
                type: N,
                value: H,
                start: z
              });
            else if (x[this._current] === "'")
              z = this._current, H = this._consumeRawStringLiteral(x), k.push({
                type: we,
                value: H,
                start: z
              });
            else if (x[this._current] === "`") {
              z = this._current;
              var le = this._consumeLiteral(x);
              k.push({
                type: we,
                value: le,
                start: z
              });
            } else if (wt[x[this._current]] !== void 0)
              k.push(this._consumeOperator(x));
            else if ($e[x[this._current]] !== void 0)
              this._current++;
            else if (x[this._current] === "&")
              z = this._current, this._current++, x[this._current] === "&" ? (this._current++, k.push({ type: He, value: "&&", start: z })) : k.push({ type: Je, value: "&", start: z });
            else if (x[this._current] === "|")
              z = this._current, this._current++, x[this._current] === "|" ? (this._current++, k.push({ type: rt, value: "||", start: z })) : k.push({ type: Le, value: "|", start: z });
            else {
              var Ae = new Error("Unknown character:" + x[this._current]);
              throw Ae.name = "LexerError", Ae;
            }
          return k;
        },
        _consumeUnquotedIdentifier: function(x) {
          var k = this._current;
          for (this._current++; this._current < x.length && xt(x[this._current]); )
            this._current++;
          return x.slice(k, this._current);
        },
        _consumeQuotedIdentifier: function(x) {
          var k = this._current;
          this._current++;
          for (var z = x.length; x[this._current] !== '"' && this._current < z; ) {
            var H = this._current;
            x[H] === "\\" && (x[H + 1] === "\\" || x[H + 1] === '"') ? H += 2 : H++, this._current = H;
          }
          return this._current++, JSON.parse(x.slice(k, this._current));
        },
        _consumeRawStringLiteral: function(x) {
          var k = this._current;
          this._current++;
          for (var z = x.length; x[this._current] !== "'" && this._current < z; ) {
            var H = this._current;
            x[H] === "\\" && (x[H + 1] === "\\" || x[H + 1] === "'") ? H += 2 : H++, this._current = H;
          }
          this._current++;
          var Q = x.slice(k + 1, this._current - 1);
          return Q.replace("\\'", "'");
        },
        _consumeNumber: function(x) {
          var k = this._current;
          this._current++;
          for (var z = x.length; Nt(x[this._current]) && this._current < z; )
            this._current++;
          var H = parseInt(x.slice(k, this._current));
          return { type: ge, value: H, start: k };
        },
        _consumeLBracket: function(x) {
          var k = this._current;
          return this._current++, x[this._current] === "?" ? (this._current++, { type: ae, value: "[?", start: k }) : x[this._current] === "]" ? (this._current++, { type: Re, value: "[]", start: k }) : { type: J, value: "[", start: k };
        },
        _consumeOperator: function(x) {
          var k = this._current, z = x[k];
          if (this._current++, z === "!")
            return x[this._current] === "=" ? (this._current++, { type: xe, value: "!=", start: k }) : { type: U, value: "!", start: k };
          if (z === "<")
            return x[this._current] === "=" ? (this._current++, { type: ve, value: "<=", start: k }) : { type: re, value: "<", start: k };
          if (z === ">")
            return x[this._current] === "=" ? (this._current++, { type: ce, value: ">=", start: k }) : { type: se, value: ">", start: k };
          if (z === "=" && x[this._current] === "=")
            return this._current++, { type: te, value: "==", start: k };
        },
        _consumeLiteral: function(x) {
          this._current++;
          for (var k = this._current, z = x.length, H; x[this._current] !== "`" && this._current < z; ) {
            var Q = this._current;
            x[Q] === "\\" && (x[Q + 1] === "\\" || x[Q + 1] === "`") ? Q += 2 : Q++, this._current = Q;
          }
          var le = h(x.slice(k, this._current));
          return le = le.replace("\\`", "`"), this._looksLikeJSON(le) ? H = JSON.parse(le) : H = JSON.parse('"' + le + '"'), this._current++, H;
        },
        _looksLikeJSON: function(x) {
          var k = '[{"', z = ["true", "false", "null"], H = "-0123456789";
          if (x === "")
            return !1;
          if (k.indexOf(x[0]) >= 0)
            return !0;
          if (z.indexOf(x) >= 0)
            return !0;
          if (H.indexOf(x[0]) >= 0)
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
      Se[T] = 0, Se[A] = 0, Se[N] = 0, Se[D] = 0, Se[L] = 0, Se[q] = 0, Se[be] = 0, Se[ge] = 0, Se[pe] = 0, Se[Je] = 0, Se[Le] = 1, Se[rt] = 2, Se[He] = 3, Se[te] = 5, Se[se] = 5, Se[re] = 5, Se[ce] = 5, Se[ve] = 5, Se[xe] = 5, Se[Re] = 9, Se[Ve] = 20, Se[ae] = 21, Se[ee] = 40, Se[U] = 45, Se[W] = 50, Se[J] = 55, Se[he] = 60;
      function Ft() {
      }
      Ft.prototype = {
        parse: function(x) {
          this._loadTokens(x), this.index = 0;
          var k = this.expression(0);
          if (this._lookahead(0) !== T) {
            var z = this._lookaheadToken(0), H = new Error(
              "Unexpected token type: " + z.type + ", value: " + z.value
            );
            throw H.name = "ParserError", H;
          }
          return k;
        },
        _loadTokens: function(x) {
          var k = new On(), z = k.tokenize(x);
          z.push({ type: T, value: "", start: x.length }), this.tokens = z;
        },
        expression: function(x) {
          var k = this._lookaheadToken(0);
          this._advance();
          for (var z = this.nud(k), H = this._lookahead(0); x < Se[H]; )
            this._advance(), z = this.led(H, z), H = this._lookahead(0);
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
          var k, z, H;
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
              return k = { type: "Identity" }, z = null, this._lookahead(0) === D ? z = { type: "Identity" } : z = this._parseProjectionRHS(Se.Star), { type: "ValueProjection", children: [k, z] };
            case ae:
              return this.led(x.type, { type: "Identity" });
            case W:
              return this._parseMultiselectHash();
            case Re:
              return k = { type: Re, children: [{ type: "Identity" }] }, z = this._parseProjectionRHS(Se.Flatten), { type: "Projection", children: [k, z] };
            case J:
              return this._lookahead(0) === ge || this._lookahead(0) === oe ? (z = this._parseIndexExpression(), this._projectIfSlice({ type: "Identity" }, z)) : this._lookahead(0) === Ve && this._lookahead(1) === D ? (this._advance(), this._advance(), z = this._parseProjectionRHS(Se.Star), {
                type: "Projection",
                children: [{ type: "Identity" }, z]
              }) : this._parseMultiselectList();
            case pe:
              return { type: pe };
            case Je:
              return H = this.expression(Se.Expref), { type: "ExpressionReference", children: [H] };
            case he:
              for (var le = []; this._lookahead(0) !== L; )
                this._lookahead(0) === pe ? (H = { type: pe }, this._advance()) : H = this.expression(0), le.push(H);
              return this._match(L), le[0];
            default:
              this._errorToken(x);
          }
        },
        led: function(x, k) {
          var z;
          switch (x) {
            case ee:
              var H = Se.Dot;
              return this._lookahead(0) !== Ve ? (z = this._parseDotRHS(H), { type: "Subexpression", children: [k, z] }) : (this._advance(), z = this._parseProjectionRHS(H), { type: "ValueProjection", children: [k, z] });
            case Le:
              return z = this.expression(Se.Pipe), { type: Le, children: [k, z] };
            case rt:
              return z = this.expression(Se.Or), { type: "OrExpression", children: [k, z] };
            case He:
              return z = this.expression(Se.And), { type: "AndExpression", children: [k, z] };
            case he:
              for (var Q = k.name, le = [], Ae, Be; this._lookahead(0) !== L; )
                this._lookahead(0) === pe ? (Ae = { type: pe }, this._advance()) : Ae = this.expression(0), this._lookahead(0) === q && this._match(q), le.push(Ae);
              return this._match(L), Be = { type: "Function", name: Q, children: le }, Be;
            case ae:
              var St = this.expression(0);
              return this._match(D), this._lookahead(0) === Re ? z = { type: "Identity" } : z = this._parseProjectionRHS(Se.Filter), { type: "FilterProjection", children: [k, z, St] };
            case Re:
              var Kt = { type: Re, children: [k] }, ut = this._parseProjectionRHS(Se.Flatten);
              return { type: "Projection", children: [Kt, ut] };
            case te:
            case xe:
            case se:
            case ce:
            case re:
            case ve:
              return this._parseComparator(k, x);
            case J:
              var Te = this._lookaheadToken(0);
              return Te.type === ge || Te.type === oe ? (z = this._parseIndexExpression(), this._projectIfSlice(k, z)) : (this._match(Ve), this._match(D), z = this._parseProjectionRHS(Se.Star), { type: "Projection", children: [k, z] });
            default:
              this._errorToken(this._lookaheadToken(0));
          }
        },
        _match: function(x) {
          if (this._lookahead(0) === x)
            this._advance();
          else {
            var k = this._lookaheadToken(0), z = new Error("Expected " + x + ", got: " + k.type);
            throw z.name = "ParserError", z;
          }
        },
        _errorToken: function(x) {
          var k = new Error("Invalid token (" + x.type + '): "' + x.value + '"');
          throw k.name = "ParserError", k;
        },
        _parseIndexExpression: function() {
          if (this._lookahead(0) === oe || this._lookahead(1) === oe)
            return this._parseSliceExpression();
          var x = {
            type: "Index",
            value: this._lookaheadToken(0).value
          };
          return this._advance(), this._match(D), x;
        },
        _projectIfSlice: function(x, k) {
          var z = { type: "IndexExpression", children: [x, k] };
          return k.type === "Slice" ? {
            type: "Projection",
            children: [z, this._parseProjectionRHS(Se.Star)]
          } : z;
        },
        _parseSliceExpression: function() {
          for (var x = [null, null, null], k = 0, z = this._lookahead(0); z !== D && k < 3; ) {
            if (z === oe)
              k++, this._advance();
            else if (z === ge)
              x[k] = this._lookaheadToken(0).value, this._advance();
            else {
              var H = this._lookahead(0), Q = new Error("Syntax error, unexpected token: " + H.value + "(" + H.type + ")");
              throw Q.name = "Parsererror", Q;
            }
            z = this._lookahead(0);
          }
          return this._match(D), {
            type: "Slice",
            children: x
          };
        },
        _parseComparator: function(x, k) {
          var z = this.expression(Se[k]);
          return { type: "Comparator", name: k, children: [x, z] };
        },
        _parseDotRHS: function(x) {
          var k = this._lookahead(0), z = [A, N, Ve];
          if (z.indexOf(k) >= 0)
            return this.expression(x);
          if (k === J)
            return this._match(J), this._parseMultiselectList();
          if (k === W)
            return this._match(W), this._parseMultiselectHash();
        },
        _parseProjectionRHS: function(x) {
          var k;
          if (Se[this._lookahead(0)] < 10)
            k = { type: "Identity" };
          else if (this._lookahead(0) === J)
            k = this.expression(x);
          else if (this._lookahead(0) === ae)
            k = this.expression(x);
          else if (this._lookahead(0) === ee)
            this._match(ee), k = this._parseDotRHS(x);
          else {
            var z = this._lookaheadToken(0), H = new Error("Sytanx error, unexpected token: " + z.value + "(" + z.type + ")");
            throw H.name = "ParserError", H;
          }
          return k;
        },
        _parseMultiselectList: function() {
          for (var x = []; this._lookahead(0) !== D; ) {
            var k = this.expression(0);
            if (x.push(k), this._lookahead(0) === q && (this._match(q), this._lookahead(0) === D))
              throw new Error("Unexpected token Rbracket");
          }
          return this._match(D), { type: "MultiSelectList", children: x };
        },
        _parseMultiselectHash: function() {
          for (var x = [], k = [A, N], z, H, Q, le; ; ) {
            if (z = this._lookaheadToken(0), k.indexOf(z.type) < 0)
              throw new Error("Expecting an identifier token, got: " + z.type);
            if (H = z.value, this._advance(), this._match(oe), Q = this.expression(0), le = { type: "KeyValuePair", name: H, value: Q }, x.push(le), this._lookahead(0) === q)
              this._match(q);
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
        search: function(x, k) {
          return this.visit(x, k);
        },
        visit: function(x, k) {
          var z, H, Q, le, Ae, Be, St, Kt, ut, Te;
          switch (x.type) {
            case "Field":
              return k !== null && r(k) ? (Be = k[x.name], Be === void 0 ? null : Be) : null;
            case "Subexpression":
              for (Q = this.visit(x.children[0], k), Te = 1; Te < x.children.length; Te++)
                if (Q = this.visit(x.children[1], Q), Q === null)
                  return null;
              return Q;
            case "IndexExpression":
              return St = this.visit(x.children[0], k), Kt = this.visit(x.children[1], St), Kt;
            case "Index":
              if (!t(k))
                return null;
              var Ht = x.value;
              return Ht < 0 && (Ht = k.length + Ht), Q = k[Ht], Q === void 0 && (Q = null), Q;
            case "Slice":
              if (!t(k))
                return null;
              var xo = x.children.slice(0), oi = this.computeSliceParams(k.length, xo), Pr = oi[0], kr = oi[1], hr = oi[2];
              if (Q = [], hr > 0)
                for (Te = Pr; Te < kr; Te += hr)
                  Q.push(k[Te]);
              else
                for (Te = Pr; Te > kr; Te += hr)
                  Q.push(k[Te]);
              return Q;
            case "Projection":
              var Jt = this.visit(x.children[0], k);
              if (!t(Jt))
                return null;
              for (ut = [], Te = 0; Te < Jt.length; Te++)
                H = this.visit(x.children[1], Jt[Te]), H !== null && ut.push(H);
              return ut;
            case "ValueProjection":
              if (Jt = this.visit(x.children[0], k), !r(Jt))
                return null;
              ut = [];
              var zi = u(Jt);
              for (Te = 0; Te < zi.length; Te++)
                H = this.visit(x.children[1], zi[Te]), H !== null && ut.push(H);
              return ut;
            case "FilterProjection":
              if (Jt = this.visit(x.children[0], k), !t(Jt))
                return null;
              var si = [], $r = [];
              for (Te = 0; Te < Jt.length; Te++)
                z = this.visit(x.children[2], Jt[Te]), a(z) || si.push(Jt[Te]);
              for (var ai = 0; ai < si.length; ai++)
                H = this.visit(x.children[1], si[ai]), H !== null && $r.push(H);
              return $r;
            case "Comparator":
              switch (le = this.visit(x.children[0], k), Ae = this.visit(x.children[1], k), x.name) {
                case te:
                  Q = o(le, Ae);
                  break;
                case xe:
                  Q = !o(le, Ae);
                  break;
                case se:
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
              var ui = this.visit(x.children[0], k);
              if (!t(ui))
                return null;
              var Or = [];
              for (Te = 0; Te < ui.length; Te++)
                H = ui[Te], t(H) ? Or.push.apply(Or, H) : Or.push(H);
              return Or;
            case "Identity":
              return k;
            case "MultiSelectList":
              if (k === null)
                return null;
              for (ut = [], Te = 0; Te < x.children.length; Te++)
                ut.push(this.visit(x.children[Te], k));
              return ut;
            case "MultiSelectHash":
              if (k === null)
                return null;
              ut = {};
              var Rn;
              for (Te = 0; Te < x.children.length; Te++)
                Rn = x.children[Te], ut[Rn.name] = this.visit(Rn.value, k);
              return ut;
            case "OrExpression":
              return z = this.visit(x.children[0], k), a(z) && (z = this.visit(x.children[1], k)), z;
            case "AndExpression":
              return le = this.visit(x.children[0], k), a(le) === !0 ? le : this.visit(x.children[1], k);
            case "NotExpression":
              return le = this.visit(x.children[0], k), a(le);
            case "Literal":
              return x.value;
            case Le:
              return St = this.visit(x.children[0], k), this.visit(x.children[1], St);
            case pe:
              return k;
            case "Function":
              var Di = [];
              for (Te = 0; Te < x.children.length; Te++)
                Di.push(this.visit(x.children[Te], k));
              return this.runtime.callFunction(x.name, Di);
            case "ExpressionReference":
              var Nr = x.children[0];
              return Nr.jmespathType = Je, Nr;
            default:
              throw new Error("Unknown node type: " + x.type);
          }
        },
        computeSliceParams: function(x, k) {
          var z = k[0], H = k[1], Q = k[2], le = [null, null, null];
          if (Q === null)
            Q = 1;
          else if (Q === 0) {
            var Ae = new Error("Invalid slice, step cannot be 0");
            throw Ae.name = "RuntimeError", Ae;
          }
          var Be = Q < 0;
          return z === null ? z = Be ? x - 1 : 0 : z = this.capSliceRange(x, z, Q), H === null ? H = Be ? -1 : x : H = this.capSliceRange(x, H, Q), le[0] = z, le[1] = H, le[2] = Q, le;
        },
        capSliceRange: function(x, k, z) {
          return k < 0 ? (k += x, k < 0 && (k = z < 0 ? -1 : 0)) : k >= x && (k = z < 0 ? x - 1 : x), k;
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
          avg: { _func: this._functionAvg, _signature: [{ types: [C] }] },
          ceil: { _func: this._functionCeil, _signature: [{ types: [c] }] },
          contains: {
            _func: this._functionContains,
            _signature: [
              { types: [p, g] },
              { types: [f] }
            ]
          },
          ends_with: {
            _func: this._functionEndsWith,
            _signature: [{ types: [p] }, { types: [p] }]
          },
          floor: { _func: this._functionFloor, _signature: [{ types: [c] }] },
          length: {
            _func: this._functionLength,
            _signature: [{ types: [p, g, m] }]
          },
          map: {
            _func: this._functionMap,
            _signature: [{ types: [_] }, { types: [g] }]
          },
          max: {
            _func: this._functionMax,
            _signature: [{ types: [C, S] }]
          },
          merge: {
            _func: this._functionMerge,
            _signature: [{ types: [m], variadic: !0 }]
          },
          max_by: {
            _func: this._functionMaxBy,
            _signature: [{ types: [g] }, { types: [_] }]
          },
          sum: { _func: this._functionSum, _signature: [{ types: [C] }] },
          starts_with: {
            _func: this._functionStartsWith,
            _signature: [{ types: [p] }, { types: [p] }]
          },
          min: {
            _func: this._functionMin,
            _signature: [{ types: [C, S] }]
          },
          min_by: {
            _func: this._functionMinBy,
            _signature: [{ types: [g] }, { types: [_] }]
          },
          type: { _func: this._functionType, _signature: [{ types: [f] }] },
          keys: { _func: this._functionKeys, _signature: [{ types: [m] }] },
          values: { _func: this._functionValues, _signature: [{ types: [m] }] },
          sort: { _func: this._functionSort, _signature: [{ types: [S, C] }] },
          sort_by: {
            _func: this._functionSortBy,
            _signature: [{ types: [g] }, { types: [_] }]
          },
          join: {
            _func: this._functionJoin,
            _signature: [
              { types: [p] },
              { types: [S] }
            ]
          },
          reverse: {
            _func: this._functionReverse,
            _signature: [{ types: [p, g] }]
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
        callFunction: function(x, k) {
          var z = this.functionTable[x];
          if (z === void 0)
            throw new Error("Unknown function: " + x + "()");
          return this._validateArgs(x, k, z._signature), z._func.call(this, k);
        },
        _validateArgs: function(x, k, z) {
          var H;
          if (z[z.length - 1].variadic) {
            if (k.length < z.length)
              throw H = z.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + x + "() takes at least" + z.length + H + " but received " + k.length);
          } else if (k.length !== z.length)
            throw H = z.length === 1 ? " argument" : " arguments", new Error("ArgumentError: " + x + "() takes " + z.length + H + " but received " + k.length);
          for (var Q, le, Ae, Be = 0; Be < z.length; Be++) {
            Ae = !1, Q = z[Be].types, le = this._getTypeName(k[Be]);
            for (var St = 0; St < Q.length; St++)
              if (this._typeMatches(le, Q[St], k[Be])) {
                Ae = !0;
                break;
              }
            if (!Ae) {
              var Kt = Q.map(function(ut) {
                return I[ut];
              }).join(",");
              throw new Error("TypeError: " + x + "() expected argument " + (Be + 1) + " to be type " + Kt + " but received type " + I[le] + " instead.");
            }
          }
        },
        _typeMatches: function(x, k, z) {
          if (k === f)
            return !0;
          if (k === S || k === C || k === g) {
            if (k === g)
              return x === g;
            if (x === g) {
              var H;
              k === C ? H = c : k === S && (H = p);
              for (var Q = 0; Q < z.length; Q++)
                if (!this._typeMatches(
                  this._getTypeName(z[Q]),
                  H,
                  z[Q]
                ))
                  return !1;
              return !0;
            }
          } else
            return x === k;
        },
        _getTypeName: function(x) {
          switch (Object.prototype.toString.call(x)) {
            case "[object String]":
              return p;
            case "[object Number]":
              return c;
            case "[object Array]":
              return g;
            case "[object Boolean]":
              return b;
            case "[object Null]":
              return $;
            case "[object Object]":
              return x.jmespathType === Je ? _ : m;
          }
        },
        _functionStartsWith: function(x) {
          return x[0].lastIndexOf(x[1]) === 0;
        },
        _functionEndsWith: function(x) {
          var k = x[0], z = x[1];
          return k.indexOf(z, k.length - z.length) !== -1;
        },
        _functionReverse: function(x) {
          var k = this._getTypeName(x[0]);
          if (k === p) {
            for (var z = x[0], H = "", Q = z.length - 1; Q >= 0; Q--)
              H += z[Q];
            return H;
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
          for (var k = 0, z = x[0], H = 0; H < z.length; H++)
            k += z[H];
          return k / z.length;
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
          for (var k = [], z = this._interpreter, H = x[0], Q = x[1], le = 0; le < Q.length; le++)
            k.push(z.visit(H, Q[le]));
          return k;
        },
        _functionMerge: function(x) {
          for (var k = {}, z = 0; z < x.length; z++) {
            var H = x[z];
            for (var Q in H)
              k[Q] = H[Q];
          }
          return k;
        },
        _functionMax: function(x) {
          if (x[0].length > 0) {
            var k = this._getTypeName(x[0][0]);
            if (k === c)
              return Math.max.apply(Math, x[0]);
            for (var z = x[0], H = z[0], Q = 1; Q < z.length; Q++)
              H.localeCompare(z[Q]) < 0 && (H = z[Q]);
            return H;
          } else
            return null;
        },
        _functionMin: function(x) {
          if (x[0].length > 0) {
            var k = this._getTypeName(x[0][0]);
            if (k === c)
              return Math.min.apply(Math, x[0]);
            for (var z = x[0], H = z[0], Q = 1; Q < z.length; Q++)
              z[Q].localeCompare(H) < 0 && (H = z[Q]);
            return H;
          } else
            return null;
        },
        _functionSum: function(x) {
          for (var k = 0, z = x[0], H = 0; H < z.length; H++)
            k += z[H];
          return k;
        },
        _functionType: function(x) {
          switch (this._getTypeName(x[0])) {
            case c:
              return "number";
            case p:
              return "string";
            case g:
              return "array";
            case m:
              return "object";
            case b:
              return "boolean";
            case _:
              return "expref";
            case $:
              return "null";
          }
        },
        _functionKeys: function(x) {
          return Object.keys(x[0]);
        },
        _functionValues: function(x) {
          for (var k = x[0], z = Object.keys(k), H = [], Q = 0; Q < z.length; Q++)
            H.push(k[z[Q]]);
          return H;
        },
        _functionJoin: function(x) {
          var k = x[0], z = x[1];
          return z.join(k);
        },
        _functionToArray: function(x) {
          return this._getTypeName(x[0]) === g ? x[0] : [x[0]];
        },
        _functionToString: function(x) {
          return this._getTypeName(x[0]) === p ? x[0] : JSON.stringify(x[0]);
        },
        _functionToNumber: function(x) {
          var k = this._getTypeName(x[0]), z;
          return k === c ? x[0] : k === p && (z = +x[0], !isNaN(z)) ? z : null;
        },
        _functionNotNull: function(x) {
          for (var k = 0; k < x.length; k++)
            if (this._getTypeName(x[k]) !== $)
              return x[k];
          return null;
        },
        _functionSort: function(x) {
          var k = x[0].slice(0);
          return k.sort(), k;
        },
        _functionSortBy: function(x) {
          var k = x[0].slice(0);
          if (k.length === 0)
            return k;
          var z = this._interpreter, H = x[1], Q = this._getTypeName(
            z.visit(H, k[0])
          );
          if ([c, p].indexOf(Q) < 0)
            throw new Error("TypeError");
          for (var le = this, Ae = [], Be = 0; Be < k.length; Be++)
            Ae.push([Be, k[Be]]);
          Ae.sort(function(Kt, ut) {
            var Te = z.visit(H, Kt[1]), Ht = z.visit(H, ut[1]);
            if (le._getTypeName(Te) !== Q)
              throw new Error(
                "TypeError: expected " + Q + ", received " + le._getTypeName(Te)
              );
            if (le._getTypeName(Ht) !== Q)
              throw new Error(
                "TypeError: expected " + Q + ", received " + le._getTypeName(Ht)
              );
            return Te > Ht ? 1 : Te < Ht ? -1 : Kt[0] - ut[0];
          });
          for (var St = 0; St < Ae.length; St++)
            k[St] = Ae[St][1];
          return k;
        },
        _functionMaxBy: function(x) {
          for (var k = x[1], z = x[0], H = this.createKeyFunction(k, [c, p]), Q = -1 / 0, le, Ae, Be = 0; Be < z.length; Be++)
            Ae = H(z[Be]), Ae > Q && (Q = Ae, le = z[Be]);
          return le;
        },
        _functionMinBy: function(x) {
          for (var k = x[1], z = x[0], H = this.createKeyFunction(k, [c, p]), Q = 1 / 0, le, Ae, Be = 0; Be < z.length; Be++)
            Ae = H(z[Be]), Ae < Q && (Q = Ae, le = z[Be]);
          return le;
        },
        createKeyFunction: function(x, k) {
          var z = this, H = this._interpreter, Q = function(le) {
            var Ae = H.visit(x, le);
            if (k.indexOf(z._getTypeName(Ae)) < 0) {
              var Be = "TypeError: expected one of " + k + ", received " + z._getTypeName(Ae);
              throw new Error(Be);
            }
            return Ae;
          };
          return Q;
        }
      };
      function Nn(x) {
        var k = new Ft(), z = k.parse(x);
        return z;
      }
      function wo(x) {
        var k = new On();
        return k.tokenize(x);
      }
      function cr(x, k) {
        var z = new Ft(), H = new yn(), Q = new Qe(H);
        H._interpreter = Q;
        var le = z.parse(k);
        return Q.search(le, x);
      }
      e.tokenize = wo, e.compile = Nn, e.search = cr, e.strictDeepEqual = o;
    })(n);
  }(hc)), hc;
}
var Gm = pA();
const Kr = /* @__PURE__ */ Ms(Gm), au = class au {
  constructor(e, t = {}) {
    this.mesh = null, this.texture = null, this.material = null, this.parsedContent = [], this.actualDimensions = { width: 0, height: 0 }, this.contentArea = { x: 0, y: 0, width: 0, height: 0 }, this.totalBorderWidth = 0, this.pointerInfo = null, this.animationTime = 0, this._progressValue = 0, this.originalPosition = null, this.scene = e, t.fontSize !== void 0 && t.fontSize > 500 && (console.warn(`RichTextLabel: fontSize ${t.fontSize} exceeds maximum of 500, clamping to 500`), t.fontSize = 500);
    const r = {
      text: "Label",
      font: "Verdana",
      fontSize: 48,
      fontWeight: "normal",
      lineHeight: 1.2,
      textColor: "black",
      backgroundColor: "transparent",
      borderWidth: 0,
      borderColor: "rgba(255, 255, 255, 0.8)",
      borders: [],
      marginTop: 5,
      marginBottom: 5,
      marginLeft: 5,
      marginRight: 5,
      textAlign: "center",
      cornerRadius: 0,
      autoSize: !0,
      resolution: 1024,
      billboardMode: tp.BILLBOARDMODE_ALL,
      depthFadeEnabled: !1,
      depthFadeNear: 5,
      depthFadeFar: 20,
      position: { x: 0, y: 0, z: 0 },
      attachTo: null,
      attachPosition: "top",
      attachOffset: 0.5,
      textOutline: !1,
      textOutlineWidth: 2,
      textOutlineColor: "black",
      textOutlineJoin: "round",
      textShadow: !1,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowBlur: 4,
      textShadowOffsetX: 2,
      textShadowOffsetY: 2,
      backgroundPadding: 0,
      backgroundGradient: !1,
      backgroundGradientType: "linear",
      backgroundGradientColors: ["rgba(0, 0, 0, 0.8)", "rgba(50, 50, 50, 0.8)"],
      backgroundGradientDirection: "vertical",
      pointer: !1,
      pointerDirection: "bottom",
      pointerWidth: 20,
      pointerHeight: 15,
      pointerOffset: 0,
      pointerCurve: !0,
      animation: null,
      animationSpeed: 1,
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
    };
    let o = Object.assign({}, r);
    if (t.badge !== void 0) {
      const a = au.BADGE_STYLES[t.badge];
      o = Object.assign(o, a), this._applyBadgeBehaviors(o, t);
    }
    if (o = Object.assign(o, t), o.smartOverflow && o.text && !isNaN(Number(o.text))) {
      const a = parseInt(o.text);
      a > o.maxNumber && (a >= 1e3 ? o.text = `${Math.floor(a / 1e3)}k` : o.text = `${o.maxNumber}${o.overflowSuffix}`);
    }
    o.borderWidth > 0 && o.borders.length === 0 && (o.borders = [{
      width: o.borderWidth,
      color: o.borderColor,
      spacing: 0
    }]), this.options = o, this.id = `richLabel_${Math.random().toString(36).substring(2, 11)}`, this._create();
  }
  _applyBadgeBehaviors(e, t) {
    const r = e._badgeType;
    if (e._paddingRatio && !t.marginTop) {
      const o = e.fontSize * e._paddingRatio;
      e.marginTop = e.marginBottom = o, e.marginLeft = e.marginRight = o;
    }
    switch (r) {
      case "notification":
      case "count": {
        if (e.smartOverflow && !isNaN(Number(t.text))) {
          const o = parseInt(t.text ?? "0");
          o > e.maxNumber && (o >= 1e3 ? e.text = `${Math.floor(o / 1e3)}k` : e.text = `${e.maxNumber}${e.overflowSuffix}`);
        }
        break;
      }
      case "dot": {
        e._removeText && (e.text = "");
        break;
      }
      case "progress": {
        t.progress !== void 0 && (this._progressValue = Math.max(0, Math.min(1, t.progress)));
        break;
      }
      case "icon": {
        t.icon && !t.text ? e.text = t.icon : t.icon && t.text && ((t.iconPosition ?? "left") === "left" ? e.text = `${t.icon} ${t.text}` : e.text = `${t.text} ${t.icon}`);
        break;
      }
    }
  }
  _create() {
    this._parseRichText(), this._calculateDimensions(), this._createTexture(), this._createMaterial(), this._createMesh(), this.options.attachTo ? this._attachToTarget() : this.mesh && (this.mesh.position = new $t(
      this.options.position.x,
      this.options.position.y,
      this.options.position.z
    ), this.originalPosition ?? (this.originalPosition = this.mesh.position.clone())), this.options.depthFadeEnabled && this._setupDepthFading(), this.options.animation && this._setupAnimation();
  }
  _parseRichText() {
    const { text: e } = this.options, t = e.split(`
`);
    this.parsedContent = [];
    for (const r of t) {
      const o = [];
      let a = 0;
      const u = [{
        font: this.options.font,
        size: this.options.fontSize,
        weight: this.options.fontWeight,
        style: "normal",
        color: this.options.textColor,
        background: null
      }], h = /<(\/?)(bold|italic|color|size|font|bg)(?:='([^']*)')?>/g;
      let c;
      for (; (c = h.exec(r)) !== null; ) {
        c.index > a && o.push({
          text: r.substring(a, c.index),
          style: Object.assign({}, u[u.length - 1])
        });
        const f = c[1] === "/", p = c[2], g = c[3];
        if (f)
          u.length > 1 && u.pop();
        else {
          const m = Object.assign({}, u[u.length - 1]);
          switch (p) {
            case "bold":
              m.weight = "bold";
              break;
            case "italic":
              m.style = "italic";
              break;
            case "color":
              m.color = g || this.options.textColor;
              break;
            case "size":
              m.size = parseInt(g || "0") || this.options.fontSize;
              break;
            case "font":
              m.font = g || this.options.font;
              break;
            case "bg":
              m.background = g || null;
              break;
          }
          u.push(m);
        }
        a = c.index + c[0].length;
      }
      a < r.length && o.push({
        text: r.substring(a),
        style: Object.assign({}, u[u.length - 1])
      }), this.parsedContent.push(o);
    }
  }
  _calculateDimensions() {
    const t = document.createElement("canvas").getContext("2d");
    if (!t)
      return;
    let r = 0, o = 0;
    for (const c of this.parsedContent) {
      let f = 0, p = 0;
      for (const g of c) {
        const { style: m } = g;
        t.font = `${m.style} ${m.weight} ${m.size}px ${m.font}`;
        const b = t.measureText(g.text);
        f += b.width, p = Math.max(p, m.size);
      }
      this.options.textOutline && (f += this.options.textOutlineWidth * 2, p += this.options.textOutlineWidth * 2), r = Math.max(r, f), o += p * this.options.lineHeight;
    }
    const a = this.options.backgroundPadding * 2;
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
    e === "auto" && this.options.attachTo && (e = "bottom"), this.pointerInfo = {
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
    e.save(), e.scale(o, a), this.options.pointer ? this._drawBackgroundWithPointer(e) : this._drawBackgroundWithBorders(e), this._drawRichText(e), e.restore(), this.texture.update();
  }
  _drawBackgroundWithBorders(e) {
    const { width: t } = this.actualDimensions, { height: r } = this.actualDimensions, o = this.options.cornerRadius;
    if (this.options.borders.length > 0) {
      let p = 0;
      for (let g = 0; g < this.options.borders.length; g++) {
        const m = this.options.borders[g];
        g > 0 && this.options.borders[g - 1].spacing > 0 && (p += this.options.borders[g - 1].spacing);
        const b = p, _ = p, $ = t - p * 2, C = r - p * 2, S = Math.max(0, o - p), I = p + m.width, T = I, A = I, N = t - I * 2, D = r - I * 2;
        let L;
        if (o > 0) {
          const q = Math.max(2, o * 0.2);
          if (L = Math.max(q, o - I), g === this.options.borders.length - 1) {
            const oe = Math.max(0, o - this.totalBorderWidth);
            L < oe + 5 && (L = oe);
          }
        } else
          L = 0;
        e.fillStyle = m.color, e.beginPath(), this._createRoundedRectPath(e, b, _, $, C, S), (g < this.options.borders.length - 1 || I < this.totalBorderWidth) && (e.moveTo(T + L, A), e.arcTo(T + N, A, T + N, A + L, L), e.lineTo(T + N, A + D - L), e.arcTo(T + N, A + D, T + N - L, A + D, L), e.lineTo(T + L, A + D), e.arcTo(T, A + D, T, A + D - L, L), e.lineTo(T, A + L), e.arcTo(T, A, T + L, A, L), e.closePath()), e.fill("evenodd"), p = I;
      }
    }
    const a = this.totalBorderWidth, u = this.totalBorderWidth, h = t - this.totalBorderWidth * 2, c = r - this.totalBorderWidth * 2;
    let f;
    if (o > 0) {
      const p = Math.max(2, o * 0.2);
      f = Math.max(p, o - this.totalBorderWidth);
    } else
      f = 0;
    if (e.beginPath(), this._createRoundedRectPath(e, a, u, h, c, f), this.options.backgroundGradient) {
      let p;
      if (this.options.backgroundGradientType === "radial")
        p = e.createRadialGradient(t / 2, r / 2, 0, t / 2, r / 2, Math.max(t, r) / 2);
      else
        switch (this.options.backgroundGradientDirection) {
          case "horizontal":
            p = e.createLinearGradient(0, 0, t, 0);
            break;
          case "diagonal":
            p = e.createLinearGradient(0, 0, t, r);
            break;
          case "vertical":
          default:
            p = e.createLinearGradient(0, 0, 0, r);
            break;
        }
      const g = this.options.backgroundGradientColors;
      for (let m = 0; m < g.length; m++)
        p.addColorStop(m / (g.length - 1), g[m]);
      e.fillStyle = p;
    } else
      e.fillStyle = this.options.backgroundColor;
    e.fill();
  }
  _drawBackgroundWithPointer(e) {
    const { width: t } = this.actualDimensions, { height: r } = this.actualDimensions, o = this.options.cornerRadius, { pointerHeight: a } = this.options, { pointerWidth: u } = this.options, { pointerOffset: h } = this.options, c = this.contentArea.x, f = this.contentArea.y, p = this.contentArea.width, g = this.contentArea.height;
    if (this.options.borders.length > 0) {
      let m = 0;
      for (let b = 0; b < this.options.borders.length; b++) {
        const _ = this.options.borders[b];
        b > 0 && this.options.borders[b - 1].spacing > 0 && (m += this.options.borders[b - 1].spacing), e.save(), e.fillStyle = _.color, e.beginPath(), this.pointerInfo && this._createSpeechBubblePath(
          e,
          c - this.totalBorderWidth + m,
          f - this.totalBorderWidth + m,
          p + (this.totalBorderWidth - m) * 2,
          g + (this.totalBorderWidth - m) * 2,
          Math.max(0, o - m),
          u,
          a,
          h,
          this.pointerInfo.direction,
          this.options.pointerCurve
        );
        const $ = m + _.width;
        if (b < this.options.borders.length - 1 || $ < this.totalBorderWidth) {
          let C;
          if (o > 0) {
            const T = Math.max(2, o * 0.2);
            if (C = Math.max(T, o - $), b === this.options.borders.length - 1) {
              const A = Math.max(T, o - this.totalBorderWidth);
              C < A + 5 && (C = A);
            }
          } else
            C = 0;
          const S = c - this.totalBorderWidth + $, I = f - this.totalBorderWidth + $;
          e.moveTo(S + C, I), this.pointerInfo && this._createSpeechBubblePathCCW(
            e,
            S,
            I,
            p + (this.totalBorderWidth - $) * 2,
            g + (this.totalBorderWidth - $) * 2,
            C,
            u,
            a,
            h,
            this.pointerInfo.direction,
            this.options.pointerCurve
          );
        }
        e.fill("evenodd"), e.restore(), m = $;
      }
    }
    if (e.beginPath(), this.pointerInfo && this._createSpeechBubblePath(e, c, f, p, g, o, u, a, h, this.pointerInfo.direction, this.options.pointerCurve), e.closePath(), this.options.backgroundGradient) {
      let m;
      if (this.options.backgroundGradientType === "radial")
        m = e.createRadialGradient(t / 2, r / 2, 0, t / 2, r / 2, Math.max(t, r) / 2);
      else
        switch (this.options.backgroundGradientDirection) {
          case "horizontal":
            m = e.createLinearGradient(0, 0, t, 0);
            break;
          case "diagonal":
            m = e.createLinearGradient(0, 0, t, r);
            break;
          case "vertical":
          default:
            m = e.createLinearGradient(0, 0, 0, r);
            break;
        }
      const b = this.options.backgroundGradientColors;
      for (let _ = 0; _ < b.length; _++)
        m.addColorStop(_ / (b.length - 1), b[_]);
      e.fillStyle = m;
    } else
      e.fillStyle = this.options.backgroundColor;
    e.fill();
  }
  _createSpeechBubblePath(e, t, r, o, a, u, h, c, f, p, g) {
    switch (p) {
      case "bottom": {
        e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a);
        const m = t + o / 2 + f;
        e.lineTo(Math.min(m + h / 2, t + o - u), r + a), g ? e.quadraticCurveTo(m, r + a + c, Math.max(m - h / 2, t + u), r + a) : (e.lineTo(m, r + a + c), e.lineTo(Math.max(m - h / 2, t + u), r + a)), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
        break;
      }
      case "top": {
        const m = t + o / 2 + f;
        e.moveTo(Math.max(m - h / 2, t + u), r), g ? e.quadraticCurveTo(m, r - c, Math.min(m + h / 2, t + o - u), r) : (e.lineTo(m, r - c), e.lineTo(Math.min(m + h / 2, t + o - u), r)), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r), e.lineTo(Math.max(m - h / 2, t + u), r);
        break;
      }
      case "left": {
        const m = r + a / 2 + f;
        e.moveTo(t, Math.max(m - h / 2, r + u)), g ? e.quadraticCurveTo(t - c, m, t, Math.min(m + h / 2, r + a - u)) : (e.lineTo(t - c, m), e.lineTo(t, Math.min(m + h / 2, r + a - u))), e.lineTo(t, r + a - u), e.quadraticCurveTo(t, r + a, t + u, r + a), e.lineTo(t + o - u, r + a), e.quadraticCurveTo(t + o, r + a, t + o, r + a - u), e.lineTo(t + o, r + u), e.quadraticCurveTo(t + o, r, t + o - u, r), e.lineTo(t + u, r), e.quadraticCurveTo(t, r, t, r + u), e.lineTo(t, Math.max(m - h / 2, r + u));
        break;
      }
      case "right": {
        e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u);
        const m = r + a / 2 + f;
        e.lineTo(t + o, Math.max(m - h / 2, r + u)), g ? e.quadraticCurveTo(t + o + c, m, t + o, Math.min(m + h / 2, r + a - u)) : (e.lineTo(t + o + c, m), e.lineTo(t + o, Math.min(m + h / 2, r + a - u))), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r);
        break;
      }
      default:
        this._createRoundedRectPath(e, t, r, o, a, u);
        break;
    }
  }
  // Helper method to create counter-clockwise speech bubble path (for holes)
  _createSpeechBubblePathCCW(e, t, r, o, a, u, h, c, f, p, g) {
    switch (p) {
      case "bottom": {
        e.lineTo(t + u, r + a), e.arcTo(t, r + a, t, r + a - u, u), e.lineTo(t, r + u), e.arcTo(t, r, t + u, r, u), e.lineTo(t + o - u, r), e.arcTo(t + o, r, t + o, r + u, u), e.lineTo(t + o, r + a - u), e.arcTo(t + o, r + a, t + o - u, r + a, u);
        const m = t + o / 2 + f;
        e.lineTo(Math.min(m + h / 2, t + o - u), r + a), g ? e.quadraticCurveTo(m, r + a + c, Math.max(m - h / 2, t + u), r + a) : (e.lineTo(m, r + a + c), e.lineTo(Math.max(m - h / 2, t + u), r + a)), e.lineTo(t + u, r + a);
        break;
      }
      case "top": {
        const m = t + o / 2 + f;
        e.lineTo(Math.min(m + h / 2, t + o - u), r), e.lineTo(t + o - u, r), e.arcTo(t + o, r, t + o, r + u, u), e.lineTo(t + o, r + a - u), e.arcTo(t + o, r + a, t + o - u, r + a, u), e.lineTo(t + u, r + a), e.arcTo(t, r + a, t, r + a - u, u), e.lineTo(t, r + u), e.arcTo(t, r, t + u, r, u), e.lineTo(Math.max(m - h / 2, t + u), r), g ? e.quadraticCurveTo(m, r - c, Math.min(m + h / 2, t + o - u), r) : (e.lineTo(m, r - c), e.lineTo(Math.min(m + h / 2, t + o - u), r));
        break;
      }
      case "left": {
        const m = r + a / 2 + f;
        e.lineTo(t, Math.min(m + h / 2, r + a - u)), e.lineTo(t, r + a - u), e.arcTo(t, r + a, t + u, r + a, u), e.lineTo(t + o - u, r + a), e.arcTo(t + o, r + a, t + o, r + a - u, u), e.lineTo(t + o, r + u), e.arcTo(t + o, r, t + o - u, r, u), e.lineTo(t + u, r), e.arcTo(t, r, t, r + u, u), e.lineTo(t, Math.max(m - h / 2, r + u)), g ? e.quadraticCurveTo(t - c, m, t, Math.min(m + h / 2, r + a - u)) : (e.lineTo(t - c, m), e.lineTo(t, Math.min(m + h / 2, r + a - u)));
        break;
      }
      case "right": {
        const m = r + a / 2 + f;
        e.lineTo(t + o, Math.max(m - h / 2, r + u)), e.lineTo(t + o, r + u), e.arcTo(t + o, r, t + o - u, r, u), e.lineTo(t + u, r), e.arcTo(t, r, t, r + u, u), e.lineTo(t, r + a - u), e.arcTo(t, r + a, t + u, r + a, u), e.lineTo(t + o - u, r + a), e.arcTo(t + o, r + a, t + o, r + a - u, u), e.lineTo(t + o, Math.min(m + h / 2, r + a - u)), g ? e.quadraticCurveTo(t + o + c, m, t + o, Math.max(m - h / 2, r + u)) : (e.lineTo(t + o + c, m), e.lineTo(t + o, Math.max(m - h / 2, r + u)));
        break;
      }
    }
  }
  _drawRichText(e) {
    const t = this.options.backgroundPadding;
    let r = this.contentArea.y + this.options.marginTop + t;
    this.options.textOutline && (r += this.options.textOutlineWidth);
    for (const o of this.parsedContent) {
      let a = 0;
      for (const m of o)
        a = Math.max(a, m.style.size);
      let u = 0;
      for (const m of o) {
        const { style: b } = m;
        e.font = `${b.style} ${b.weight} ${b.size}px ${b.font}`, u += e.measureText(m.text).width;
      }
      let h;
      const c = this.contentArea.x + this.options.marginLeft + t, f = this.contentArea.x + this.contentArea.width - this.options.marginRight - t, p = this.contentArea.x + this.contentArea.width / 2;
      switch (this.options.textAlign) {
        case "left":
          h = c, this.options.textOutline && (h += this.options.textOutlineWidth);
          break;
        case "right":
          h = f - u, this.options.textOutline && (h -= this.options.textOutlineWidth);
          break;
        case "center":
        default:
          h = p - u / 2;
          break;
      }
      let g = h;
      for (const m of o) {
        const { style: b } = m;
        if (e.font = `${b.style} ${b.weight} ${b.size}px ${b.font}`, e.textBaseline = "top", b.background) {
          const _ = e.measureText(m.text);
          e.fillStyle = b.background, e.fillRect(g, r, _.width, a);
        }
        this.options.textShadow && (e.save(), e.shadowColor = this.options.textShadowColor, e.shadowBlur = this.options.textShadowBlur, e.shadowOffsetX = this.options.textShadowOffsetX, e.shadowOffsetY = this.options.textShadowOffsetY, e.fillStyle = b.color, e.fillText(m.text, g, r), e.restore()), this.options.textOutline && (e.save(), e.strokeStyle = this.options.textOutlineColor, e.lineWidth = this.options.textOutlineWidth * 2, e.lineJoin = this.options.textOutlineJoin, e.miterLimit = 2, e.strokeText(m.text, g, r), e.restore()), e.fillStyle = b.color, e.fillText(m.text, g, r), g += e.measureText(m.text).width;
      }
      r += a * this.options.lineHeight;
    }
  }
  _createRoundedRectPath(e, t, r, o, a, u) {
    e.beginPath(), e.moveTo(t + u, r), e.lineTo(t + o - u, r), e.quadraticCurveTo(t + o, r, t + o, r + u), e.lineTo(t + o, r + a - u), e.quadraticCurveTo(t + o, r + a, t + o - u, r + a), e.lineTo(t + u, r + a), e.quadraticCurveTo(t, r + a, t, r + a - u), e.lineTo(t, r + u), e.quadraticCurveTo(t, r, t + u, r), e.closePath();
  }
  _createMaterial() {
    this.material = new Mg(`richTextMaterial_${this.id}`, this.scene), this.texture && (this.material.diffuseTexture = this.texture), this.material.specularColor = new Er(0, 0, 0), this.material.emissiveColor = new Er(1, 1, 1), this.material.backFaceCulling = !1, this.material.useAlphaFromDiffuseTexture = !0, this.material.alphaMode = Ha.ALPHA_COMBINE;
  }
  _createMesh() {
    const e = this.options.fontSize / 48, t = this.actualDimensions.width / this.actualDimensions.height, r = e, o = t * e;
    this.mesh = Wn.CreatePlane(`richTextPlane_${this.id}`, {
      width: o,
      height: r,
      sideOrientation: tp.DOUBLESIDE
    }, this.scene), this.mesh.material = this.material, this.mesh.billboardMode = this.options.billboardMode;
  }
  _attachToTarget() {
    const e = this.options.attachTo, t = this.options.attachPosition, r = this.options.attachOffset;
    if (!this.mesh)
      return;
    let o, a;
    if (e instanceof $t)
      o = e.clone(), a = {
        min: o.clone(),
        max: o.clone()
      };
    else if (e && "getBoundingInfo" in e) {
      this.mesh.parent = e, o = $t.Zero();
      const p = e.getBoundingInfo();
      a = {
        min: p.boundingBox.minimum,
        max: p.boundingBox.maximum
      };
    } else {
      this.mesh.position = new $t(
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
        f.x = (a.min.x + a.max.x) / 2, f.y = a.max.y + c / 2 + r;
    }
    this.mesh.position = f, this.originalPosition ?? (this.originalPosition = f.clone());
  }
  _setupDepthFading() {
    const e = this.scene.activeCamera;
    this.scene.registerBeforeRender(() => {
      if (!e || !this.mesh || !this.material)
        return;
      const t = $t.Distance(e.position, this.mesh.position);
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
  _setupAnimation() {
    this.scene.registerBeforeRender(() => {
      if (this.mesh)
        switch (this.animationTime += 0.016 * this.options.animationSpeed, this.options.animation) {
          case "pulse": {
            const e = 1 + Math.sin(this.animationTime * 3) * 0.1;
            this.mesh.scaling.x = e, this.mesh.scaling.y = e;
            break;
          }
          case "bounce": {
            if (this.originalPosition) {
              const e = Math.abs(Math.sin(this.animationTime * 2)) * 0.3;
              this.mesh.position.y = this.originalPosition.y + e;
            }
            break;
          }
          case "shake": {
            if (this.originalPosition) {
              const e = Math.sin(this.animationTime * 20) * 0.02, t = Math.cos(this.animationTime * 25) * 0.02;
              this.mesh.position.x = this.originalPosition.x + e, this.mesh.position.y = this.originalPosition.y + t;
            }
            break;
          }
          case "glow": {
            const e = 0.8 + Math.sin(this.animationTime * 2) * 0.2;
            this.material && (this.material.emissiveColor = new Er(e, e, e));
            break;
          }
          case "fill": {
            this.options._progressBar && (this._progressValue = (Math.sin(this.animationTime) + 1) / 2, this._drawContent());
            break;
          }
        }
    });
  }
  // Public methods
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
    this.mesh && this.mesh.dispose(), this.material && this.material.dispose(), this.texture && this.texture.dispose();
  }
  // Getters
  get labelMesh() {
    return this.mesh;
  }
  get labelId() {
    return this.id;
  }
};
au.BADGE_STYLES = {
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
    _removeText: !0,
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 6,
    marginRight: 6,
    fontSize: 8
  }
};
let eu = au;
var Jo = { exports: {} };
/**
 * @license
 * Lodash <https://lodash.com/>
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */
var gA = Jo.exports, M0;
function mA() {
  return M0 || (M0 = 1, function(n, e) {
    (function() {
      var t, r = "4.17.21", o = 200, a = "Unsupported core-js use. Try https://npms.io/search?q=ponyfill.", u = "Expected a function", h = "Invalid `variable` option passed into `_.template`", c = "__lodash_hash_undefined__", f = 500, p = "__lodash_placeholder__", g = 1, m = 2, b = 4, _ = 1, $ = 2, C = 1, S = 2, I = 4, T = 8, A = 16, N = 32, D = 64, L = 128, q = 256, oe = 512, be = 30, ge = "...", pe = 800, Je = 16, Le = 1, rt = 2, He = 3, te = 1 / 0, se = 9007199254740991, re = 17976931348623157e292, ce = NaN, ve = 4294967295, xe = ve - 1, Re = ve >>> 1, Ve = [
        ["ary", L],
        ["bind", C],
        ["bindKey", S],
        ["curry", T],
        ["curryRight", A],
        ["flip", oe],
        ["partial", N],
        ["partialRight", D],
        ["rearg", q]
      ], ae = "[object Arguments]", ee = "[object Array]", U = "[object AsyncFunction]", W = "[object Boolean]", J = "[object Date]", he = "[object DOMException]", we = "[object Error]", Ue = "[object Function]", wt = "[object GeneratorFunction]", $e = "[object Map]", tt = "[object Number]", Nt = "[object Null]", xt = "[object Object]", On = "[object Promise]", Se = "[object Proxy]", Ft = "[object RegExp]", Qe = "[object Set]", yn = "[object String]", Nn = "[object Symbol]", wo = "[object Undefined]", cr = "[object WeakMap]", x = "[object WeakSet]", k = "[object ArrayBuffer]", z = "[object DataView]", H = "[object Float32Array]", Q = "[object Float64Array]", le = "[object Int8Array]", Ae = "[object Int16Array]", Be = "[object Int32Array]", St = "[object Uint8Array]", Kt = "[object Uint8ClampedArray]", ut = "[object Uint16Array]", Te = "[object Uint32Array]", Ht = /\b__p \+= '';/g, xo = /\b(__p \+=) '' \+/g, oi = /(__e\(.*?\)|\b__t\)) \+\n'';/g, Pr = /&(?:amp|lt|gt|quot|#39);/g, kr = /[&<>"']/g, hr = RegExp(Pr.source), Jt = RegExp(kr.source), zi = /<%-([\s\S]+?)%>/g, si = /<%([\s\S]+?)%>/g, $r = /<%=([\s\S]+?)%>/g, ai = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, ui = /^\w*$/, Or = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, Rn = /[\\^$.*+?()[\]{}|]/g, Di = RegExp(Rn.source), Nr = /^\s+/, Cs = /\s/, To = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, Nu = /\{\n\/\* \[wrapped with (.+)\] \*/, As = /,? & /, Ru = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g, Is = /[()=,{}\[\]\/\s]/, Ps = /\\(\\)?/g, ks = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g, So = /\w*$/, Mo = /^[-+]0x[0-9a-f]+$/i, fr = /^0b[01]+$/i, li = /^\[object .+?Constructor\]$/, ci = /^0o[0-7]+$/i, Li = /^(?:0|[1-9]\d*)$/, Eo = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, Bi = /($^)/, zu = /['\n\r\u2028\u2029\\]/g, dr = "\\ud800-\\udfff", sn = "\\u0300-\\u036f", Rr = "\\ufe20-\\ufe2f", ir = "\\u20d0-\\u20ff", zn = sn + Rr + ir, zr = "\\u2700-\\u27bf", bn = "a-z\\xdf-\\xf6\\xf8-\\xff", Yn = "\\xac\\xb1\\xd7\\xf7", $s = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", Os = "\\u2000-\\u206f", Fi = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", an = "A-Z\\xc0-\\xd6\\xd8-\\xde", hi = "\\ufe0e\\ufe0f", Ui = Yn + $s + Os + Fi, fi = "['’]", Co = "[" + dr + "]", Zi = "[" + Ui + "]", pr = "[" + zn + "]", Qn = "\\d+", Du = "[" + zr + "]", Ao = "[" + bn + "]", qi = "[^" + dr + Ui + Qn + zr + bn + an + "]", Gi = "\\ud83c[\\udffb-\\udfff]", Lu = "(?:" + pr + "|" + Gi + ")", Ns = "[^" + dr + "]", y = "(?:\\ud83c[\\udde6-\\uddff]){2}", E = "[\\ud800-\\udbff][\\udc00-\\udfff]", O = "[" + an + "]", Z = "\\u200d", ie = "(?:" + Ao + "|" + qi + ")", fe = "(?:" + O + "|" + qi + ")", ze = "(?:" + fi + "(?:d|ll|m|re|s|t|ve))?", Mt = "(?:" + fi + "(?:D|LL|M|RE|S|T|VE))?", At = Lu + "?", Rt = "[" + hi + "]?", Dn = "(?:" + Z + "(?:" + [Ns, y, E].join("|") + ")" + Rt + At + ")*", wv = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", xv = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", Gh = Rt + At + Dn, Tv = "(?:" + [Du, y, E].join("|") + ")" + Gh, Sv = "(?:" + [Ns + pr + "?", pr, y, E, Co].join("|") + ")", Mv = RegExp(fi, "g"), Ev = RegExp(pr, "g"), Bu = RegExp(Gi + "(?=" + Gi + ")|" + Sv + Gh, "g"), Cv = RegExp([
        O + "?" + Ao + "+" + ze + "(?=" + [Zi, O, "$"].join("|") + ")",
        fe + "+" + Mt + "(?=" + [Zi, O + ie, "$"].join("|") + ")",
        O + "?" + ie + "+" + ze,
        O + "+" + Mt,
        xv,
        wv,
        Qn,
        Tv
      ].join("|"), "g"), Av = RegExp("[" + Z + dr + zn + hi + "]"), Iv = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/, Pv = [
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
      ], kv = -1, lt = {};
      lt[H] = lt[Q] = lt[le] = lt[Ae] = lt[Be] = lt[St] = lt[Kt] = lt[ut] = lt[Te] = !0, lt[ae] = lt[ee] = lt[k] = lt[W] = lt[z] = lt[J] = lt[we] = lt[Ue] = lt[$e] = lt[tt] = lt[xt] = lt[Ft] = lt[Qe] = lt[yn] = lt[cr] = !1;
      var at = {};
      at[ae] = at[ee] = at[k] = at[z] = at[W] = at[J] = at[H] = at[Q] = at[le] = at[Ae] = at[Be] = at[$e] = at[tt] = at[xt] = at[Ft] = at[Qe] = at[yn] = at[Nn] = at[St] = at[Kt] = at[ut] = at[Te] = !0, at[we] = at[Ue] = at[cr] = !1;
      var $v = {
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
      }, Ov = {
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
      }, zv = parseFloat, Dv = parseInt, Hh = typeof Oa == "object" && Oa && Oa.Object === Object && Oa, Lv = typeof self == "object" && self && self.Object === Object && self, Ut = Hh || Lv || Function("return this")(), Fu = e && !e.nodeType && e, di = Fu && !0 && n && !n.nodeType && n, Wh = di && di.exports === Fu, Uu = Wh && Hh.process, Ln = function() {
        try {
          var B = di && di.require && di.require("util").types;
          return B || Uu && Uu.binding && Uu.binding("util");
        } catch {
        }
      }(), jh = Ln && Ln.isArrayBuffer, Vh = Ln && Ln.isDate, Kh = Ln && Ln.isMap, Jh = Ln && Ln.isRegExp, Yh = Ln && Ln.isSet, Qh = Ln && Ln.isTypedArray;
      function wn(B, j, G) {
        switch (G.length) {
          case 0:
            return B.call(j);
          case 1:
            return B.call(j, G[0]);
          case 2:
            return B.call(j, G[0], G[1]);
          case 3:
            return B.call(j, G[0], G[1], G[2]);
        }
        return B.apply(j, G);
      }
      function Bv(B, j, G, de) {
        for (var Pe = -1, Ye = B == null ? 0 : B.length; ++Pe < Ye; ) {
          var Pt = B[Pe];
          j(de, Pt, G(Pt), B);
        }
        return de;
      }
      function Bn(B, j) {
        for (var G = -1, de = B == null ? 0 : B.length; ++G < de && j(B[G], G, B) !== !1; )
          ;
        return B;
      }
      function Fv(B, j) {
        for (var G = B == null ? 0 : B.length; G-- && j(B[G], G, B) !== !1; )
          ;
        return B;
      }
      function Xh(B, j) {
        for (var G = -1, de = B == null ? 0 : B.length; ++G < de; )
          if (!j(B[G], G, B))
            return !1;
        return !0;
      }
      function Dr(B, j) {
        for (var G = -1, de = B == null ? 0 : B.length, Pe = 0, Ye = []; ++G < de; ) {
          var Pt = B[G];
          j(Pt, G, B) && (Ye[Pe++] = Pt);
        }
        return Ye;
      }
      function Rs(B, j) {
        var G = B == null ? 0 : B.length;
        return !!G && Hi(B, j, 0) > -1;
      }
      function Zu(B, j, G) {
        for (var de = -1, Pe = B == null ? 0 : B.length; ++de < Pe; )
          if (G(j, B[de]))
            return !0;
        return !1;
      }
      function ht(B, j) {
        for (var G = -1, de = B == null ? 0 : B.length, Pe = Array(de); ++G < de; )
          Pe[G] = j(B[G], G, B);
        return Pe;
      }
      function Lr(B, j) {
        for (var G = -1, de = j.length, Pe = B.length; ++G < de; )
          B[Pe + G] = j[G];
        return B;
      }
      function qu(B, j, G, de) {
        var Pe = -1, Ye = B == null ? 0 : B.length;
        for (de && Ye && (G = B[++Pe]); ++Pe < Ye; )
          G = j(G, B[Pe], Pe, B);
        return G;
      }
      function Uv(B, j, G, de) {
        var Pe = B == null ? 0 : B.length;
        for (de && Pe && (G = B[--Pe]); Pe--; )
          G = j(G, B[Pe], Pe, B);
        return G;
      }
      function Gu(B, j) {
        for (var G = -1, de = B == null ? 0 : B.length; ++G < de; )
          if (j(B[G], G, B))
            return !0;
        return !1;
      }
      var Zv = Hu("length");
      function qv(B) {
        return B.split("");
      }
      function Gv(B) {
        return B.match(Ru) || [];
      }
      function ef(B, j, G) {
        var de;
        return G(B, function(Pe, Ye, Pt) {
          if (j(Pe, Ye, Pt))
            return de = Ye, !1;
        }), de;
      }
      function zs(B, j, G, de) {
        for (var Pe = B.length, Ye = G + (de ? 1 : -1); de ? Ye-- : ++Ye < Pe; )
          if (j(B[Ye], Ye, B))
            return Ye;
        return -1;
      }
      function Hi(B, j, G) {
        return j === j ? n1(B, j, G) : zs(B, tf, G);
      }
      function Hv(B, j, G, de) {
        for (var Pe = G - 1, Ye = B.length; ++Pe < Ye; )
          if (de(B[Pe], j))
            return Pe;
        return -1;
      }
      function tf(B) {
        return B !== B;
      }
      function nf(B, j) {
        var G = B == null ? 0 : B.length;
        return G ? ju(B, j) / G : ce;
      }
      function Hu(B) {
        return function(j) {
          return j == null ? t : j[B];
        };
      }
      function Wu(B) {
        return function(j) {
          return B == null ? t : B[j];
        };
      }
      function rf(B, j, G, de, Pe) {
        return Pe(B, function(Ye, Pt, it) {
          G = de ? (de = !1, Ye) : j(G, Ye, Pt, it);
        }), G;
      }
      function Wv(B, j) {
        var G = B.length;
        for (B.sort(j); G--; )
          B[G] = B[G].value;
        return B;
      }
      function ju(B, j) {
        for (var G, de = -1, Pe = B.length; ++de < Pe; ) {
          var Ye = j(B[de]);
          Ye !== t && (G = G === t ? Ye : G + Ye);
        }
        return G;
      }
      function Vu(B, j) {
        for (var G = -1, de = Array(B); ++G < B; )
          de[G] = j(G);
        return de;
      }
      function jv(B, j) {
        return ht(j, function(G) {
          return [G, B[G]];
        });
      }
      function of(B) {
        return B && B.slice(0, lf(B) + 1).replace(Nr, "");
      }
      function xn(B) {
        return function(j) {
          return B(j);
        };
      }
      function Ku(B, j) {
        return ht(j, function(G) {
          return B[G];
        });
      }
      function Io(B, j) {
        return B.has(j);
      }
      function sf(B, j) {
        for (var G = -1, de = B.length; ++G < de && Hi(j, B[G], 0) > -1; )
          ;
        return G;
      }
      function af(B, j) {
        for (var G = B.length; G-- && Hi(j, B[G], 0) > -1; )
          ;
        return G;
      }
      function Vv(B, j) {
        for (var G = B.length, de = 0; G--; )
          B[G] === j && ++de;
        return de;
      }
      var Kv = Wu($v), Jv = Wu(Ov);
      function Yv(B) {
        return "\\" + Rv[B];
      }
      function Qv(B, j) {
        return B == null ? t : B[j];
      }
      function Wi(B) {
        return Av.test(B);
      }
      function Xv(B) {
        return Iv.test(B);
      }
      function e1(B) {
        for (var j, G = []; !(j = B.next()).done; )
          G.push(j.value);
        return G;
      }
      function Ju(B) {
        var j = -1, G = Array(B.size);
        return B.forEach(function(de, Pe) {
          G[++j] = [Pe, de];
        }), G;
      }
      function uf(B, j) {
        return function(G) {
          return B(j(G));
        };
      }
      function Br(B, j) {
        for (var G = -1, de = B.length, Pe = 0, Ye = []; ++G < de; ) {
          var Pt = B[G];
          (Pt === j || Pt === p) && (B[G] = p, Ye[Pe++] = G);
        }
        return Ye;
      }
      function Ds(B) {
        var j = -1, G = Array(B.size);
        return B.forEach(function(de) {
          G[++j] = de;
        }), G;
      }
      function t1(B) {
        var j = -1, G = Array(B.size);
        return B.forEach(function(de) {
          G[++j] = [de, de];
        }), G;
      }
      function n1(B, j, G) {
        for (var de = G - 1, Pe = B.length; ++de < Pe; )
          if (B[de] === j)
            return de;
        return -1;
      }
      function r1(B, j, G) {
        for (var de = G + 1; de--; )
          if (B[de] === j)
            return de;
        return de;
      }
      function ji(B) {
        return Wi(B) ? o1(B) : Zv(B);
      }
      function Xn(B) {
        return Wi(B) ? s1(B) : qv(B);
      }
      function lf(B) {
        for (var j = B.length; j-- && Cs.test(B.charAt(j)); )
          ;
        return j;
      }
      var i1 = Wu(Nv);
      function o1(B) {
        for (var j = Bu.lastIndex = 0; Bu.test(B); )
          ++j;
        return j;
      }
      function s1(B) {
        return B.match(Bu) || [];
      }
      function a1(B) {
        return B.match(Cv) || [];
      }
      var u1 = function B(j) {
        j = j == null ? Ut : Vi.defaults(Ut.Object(), j, Vi.pick(Ut, Pv));
        var G = j.Array, de = j.Date, Pe = j.Error, Ye = j.Function, Pt = j.Math, it = j.Object, Yu = j.RegExp, l1 = j.String, Fn = j.TypeError, Ls = G.prototype, c1 = Ye.prototype, Ki = it.prototype, Bs = j["__core-js_shared__"], Fs = c1.toString, et = Ki.hasOwnProperty, h1 = 0, cf = function() {
          var i = /[^.]+$/.exec(Bs && Bs.keys && Bs.keys.IE_PROTO || "");
          return i ? "Symbol(src)_1." + i : "";
        }(), Us = Ki.toString, f1 = Fs.call(it), d1 = Ut._, p1 = Yu(
          "^" + Fs.call(et).replace(Rn, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
        ), Zs = Wh ? j.Buffer : t, Fr = j.Symbol, qs = j.Uint8Array, hf = Zs ? Zs.allocUnsafe : t, Gs = uf(it.getPrototypeOf, it), ff = it.create, df = Ki.propertyIsEnumerable, Hs = Ls.splice, pf = Fr ? Fr.isConcatSpreadable : t, Po = Fr ? Fr.iterator : t, pi = Fr ? Fr.toStringTag : t, Ws = function() {
          try {
            var i = yi(it, "defineProperty");
            return i({}, "", {}), i;
          } catch {
          }
        }(), g1 = j.clearTimeout !== Ut.clearTimeout && j.clearTimeout, m1 = de && de.now !== Ut.Date.now && de.now, v1 = j.setTimeout !== Ut.setTimeout && j.setTimeout, js = Pt.ceil, Vs = Pt.floor, Qu = it.getOwnPropertySymbols, _1 = Zs ? Zs.isBuffer : t, gf = j.isFinite, y1 = Ls.join, b1 = uf(it.keys, it), kt = Pt.max, Wt = Pt.min, w1 = de.now, x1 = j.parseInt, mf = Pt.random, T1 = Ls.reverse, Xu = yi(j, "DataView"), ko = yi(j, "Map"), el = yi(j, "Promise"), Ji = yi(j, "Set"), $o = yi(j, "WeakMap"), Oo = yi(it, "create"), Ks = $o && new $o(), Yi = {}, S1 = bi(Xu), M1 = bi(ko), E1 = bi(el), C1 = bi(Ji), A1 = bi($o), Js = Fr ? Fr.prototype : t, No = Js ? Js.valueOf : t, vf = Js ? Js.toString : t;
        function w(i) {
          if (Tt(i) && !ke(i) && !(i instanceof Ge)) {
            if (i instanceof Un)
              return i;
            if (et.call(i, "__wrapped__"))
              return _d(i);
          }
          return new Un(i);
        }
        var Qi = /* @__PURE__ */ function() {
          function i() {
          }
          return function(s) {
            if (!mt(s))
              return {};
            if (ff)
              return ff(s);
            i.prototype = s;
            var l = new i();
            return i.prototype = t, l;
          };
        }();
        function Ys() {
        }
        function Un(i, s) {
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
          interpolate: $r,
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
        }, w.prototype = Ys.prototype, w.prototype.constructor = w, Un.prototype = Qi(Ys.prototype), Un.prototype.constructor = Un;
        function Ge(i) {
          this.__wrapped__ = i, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = !1, this.__iteratees__ = [], this.__takeCount__ = ve, this.__views__ = [];
        }
        function I1() {
          var i = new Ge(this.__wrapped__);
          return i.__actions__ = un(this.__actions__), i.__dir__ = this.__dir__, i.__filtered__ = this.__filtered__, i.__iteratees__ = un(this.__iteratees__), i.__takeCount__ = this.__takeCount__, i.__views__ = un(this.__views__), i;
        }
        function P1() {
          if (this.__filtered__) {
            var i = new Ge(this);
            i.__dir__ = -1, i.__filtered__ = !0;
          } else
            i = this.clone(), i.__dir__ *= -1;
          return i;
        }
        function k1() {
          var i = this.__wrapped__.value(), s = this.__dir__, l = ke(i), d = s < 0, v = l ? i.length : 0, M = q_(0, v, this.__views__), P = M.start, R = M.end, F = R - P, Y = d ? R : P - 1, X = this.__iteratees__, ne = X.length, ue = 0, _e = Wt(F, this.__takeCount__);
          if (!l || !d && v == F && _e == F)
            return Uf(i, this.__actions__);
          var Ee = [];
          e:
            for (; F-- && ue < _e; ) {
              Y += s;
              for (var De = -1, Ce = i[Y]; ++De < ne; ) {
                var Ze = X[De], We = Ze.iteratee, Mn = Ze.type, Xt = We(Ce);
                if (Mn == rt)
                  Ce = Xt;
                else if (!Xt) {
                  if (Mn == Le)
                    continue e;
                  break e;
                }
              }
              Ee[ue++] = Ce;
            }
          return Ee;
        }
        Ge.prototype = Qi(Ys.prototype), Ge.prototype.constructor = Ge;
        function gi(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.clear(); ++s < l; ) {
            var d = i[s];
            this.set(d[0], d[1]);
          }
        }
        function $1() {
          this.__data__ = Oo ? Oo(null) : {}, this.size = 0;
        }
        function O1(i) {
          var s = this.has(i) && delete this.__data__[i];
          return this.size -= s ? 1 : 0, s;
        }
        function N1(i) {
          var s = this.__data__;
          if (Oo) {
            var l = s[i];
            return l === c ? t : l;
          }
          return et.call(s, i) ? s[i] : t;
        }
        function R1(i) {
          var s = this.__data__;
          return Oo ? s[i] !== t : et.call(s, i);
        }
        function z1(i, s) {
          var l = this.__data__;
          return this.size += this.has(i) ? 0 : 1, l[i] = Oo && s === t ? c : s, this;
        }
        gi.prototype.clear = $1, gi.prototype.delete = O1, gi.prototype.get = N1, gi.prototype.has = R1, gi.prototype.set = z1;
        function gr(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.clear(); ++s < l; ) {
            var d = i[s];
            this.set(d[0], d[1]);
          }
        }
        function D1() {
          this.__data__ = [], this.size = 0;
        }
        function L1(i) {
          var s = this.__data__, l = Qs(s, i);
          if (l < 0)
            return !1;
          var d = s.length - 1;
          return l == d ? s.pop() : Hs.call(s, l, 1), --this.size, !0;
        }
        function B1(i) {
          var s = this.__data__, l = Qs(s, i);
          return l < 0 ? t : s[l][1];
        }
        function F1(i) {
          return Qs(this.__data__, i) > -1;
        }
        function U1(i, s) {
          var l = this.__data__, d = Qs(l, i);
          return d < 0 ? (++this.size, l.push([i, s])) : l[d][1] = s, this;
        }
        gr.prototype.clear = D1, gr.prototype.delete = L1, gr.prototype.get = B1, gr.prototype.has = F1, gr.prototype.set = U1;
        function mr(i) {
          var s = -1, l = i == null ? 0 : i.length;
          for (this.clear(); ++s < l; ) {
            var d = i[s];
            this.set(d[0], d[1]);
          }
        }
        function Z1() {
          this.size = 0, this.__data__ = {
            hash: new gi(),
            map: new (ko || gr)(),
            string: new gi()
          };
        }
        function q1(i) {
          var s = ca(this, i).delete(i);
          return this.size -= s ? 1 : 0, s;
        }
        function G1(i) {
          return ca(this, i).get(i);
        }
        function H1(i) {
          return ca(this, i).has(i);
        }
        function W1(i, s) {
          var l = ca(this, i), d = l.size;
          return l.set(i, s), this.size += l.size == d ? 0 : 1, this;
        }
        mr.prototype.clear = Z1, mr.prototype.delete = q1, mr.prototype.get = G1, mr.prototype.has = H1, mr.prototype.set = W1;
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
            var d = l.__data__;
            if (!ko || d.length < o - 1)
              return d.push([i, s]), this.size = ++l.size, this;
            l = this.__data__ = new mr(d);
          }
          return l.set(i, s), this.size = l.size, this;
        }
        er.prototype.clear = K1, er.prototype.delete = J1, er.prototype.get = Y1, er.prototype.has = Q1, er.prototype.set = X1;
        function _f(i, s) {
          var l = ke(i), d = !l && wi(i), v = !l && !d && Hr(i), M = !l && !d && !v && no(i), P = l || d || v || M, R = P ? Vu(i.length, l1) : [], F = R.length;
          for (var Y in i)
            (s || et.call(i, Y)) && !(P && // Safari 9 has enumerable `arguments.length` in strict mode.
            (Y == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
            v && (Y == "offset" || Y == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
            M && (Y == "buffer" || Y == "byteLength" || Y == "byteOffset") || // Skip index properties.
            br(Y, F))) && R.push(Y);
          return R;
        }
        function yf(i) {
          var s = i.length;
          return s ? i[hl(0, s - 1)] : t;
        }
        function e_(i, s) {
          return ha(un(i), vi(s, 0, i.length));
        }
        function t_(i) {
          return ha(un(i));
        }
        function tl(i, s, l) {
          (l !== t && !tr(i[s], l) || l === t && !(s in i)) && vr(i, s, l);
        }
        function Ro(i, s, l) {
          var d = i[s];
          (!(et.call(i, s) && tr(d, l)) || l === t && !(s in i)) && vr(i, s, l);
        }
        function Qs(i, s) {
          for (var l = i.length; l--; )
            if (tr(i[l][0], s))
              return l;
          return -1;
        }
        function n_(i, s, l, d) {
          return Ur(i, function(v, M, P) {
            s(d, v, l(v), P);
          }), d;
        }
        function bf(i, s) {
          return i && sr(s, zt(s), i);
        }
        function r_(i, s) {
          return i && sr(s, cn(s), i);
        }
        function vr(i, s, l) {
          s == "__proto__" && Ws ? Ws(i, s, {
            configurable: !0,
            enumerable: !0,
            value: l,
            writable: !0
          }) : i[s] = l;
        }
        function nl(i, s) {
          for (var l = -1, d = s.length, v = G(d), M = i == null; ++l < d; )
            v[l] = M ? t : zl(i, s[l]);
          return v;
        }
        function vi(i, s, l) {
          return i === i && (l !== t && (i = i <= l ? i : l), s !== t && (i = i >= s ? i : s)), i;
        }
        function Zn(i, s, l, d, v, M) {
          var P, R = s & g, F = s & m, Y = s & b;
          if (l && (P = v ? l(i, d, v, M) : l(i)), P !== t)
            return P;
          if (!mt(i))
            return i;
          var X = ke(i);
          if (X) {
            if (P = H_(i), !R)
              return un(i, P);
          } else {
            var ne = jt(i), ue = ne == Ue || ne == wt;
            if (Hr(i))
              return Gf(i, R);
            if (ne == xt || ne == ae || ue && !v) {
              if (P = F || ue ? {} : ld(i), !R)
                return F ? N_(i, r_(P, i)) : O_(i, bf(P, i));
            } else {
              if (!at[ne])
                return v ? i : {};
              P = W_(i, ne, R);
            }
          }
          M || (M = new er());
          var _e = M.get(i);
          if (_e)
            return _e;
          M.set(i, P), Ld(i) ? i.forEach(function(Ce) {
            P.add(Zn(Ce, s, l, Ce, i, M));
          }) : zd(i) && i.forEach(function(Ce, Ze) {
            P.set(Ze, Zn(Ce, s, l, Ze, i, M));
          });
          var Ee = Y ? F ? xl : wl : F ? cn : zt, De = X ? t : Ee(i);
          return Bn(De || i, function(Ce, Ze) {
            De && (Ze = Ce, Ce = i[Ze]), Ro(P, Ze, Zn(Ce, s, l, Ze, i, M));
          }), P;
        }
        function i_(i) {
          var s = zt(i);
          return function(l) {
            return wf(l, i, s);
          };
        }
        function wf(i, s, l) {
          var d = l.length;
          if (i == null)
            return !d;
          for (i = it(i); d--; ) {
            var v = l[d], M = s[v], P = i[v];
            if (P === t && !(v in i) || !M(P))
              return !1;
          }
          return !0;
        }
        function xf(i, s, l) {
          if (typeof i != "function")
            throw new Fn(u);
          return Zo(function() {
            i.apply(t, l);
          }, s);
        }
        function zo(i, s, l, d) {
          var v = -1, M = Rs, P = !0, R = i.length, F = [], Y = s.length;
          if (!R)
            return F;
          l && (s = ht(s, xn(l))), d ? (M = Zu, P = !1) : s.length >= o && (M = Io, P = !1, s = new mi(s));
          e:
            for (; ++v < R; ) {
              var X = i[v], ne = l == null ? X : l(X);
              if (X = d || X !== 0 ? X : 0, P && ne === ne) {
                for (var ue = Y; ue--; )
                  if (s[ue] === ne)
                    continue e;
                F.push(X);
              } else M(s, ne, d) || F.push(X);
            }
          return F;
        }
        var Ur = Kf(or), Tf = Kf(il, !0);
        function o_(i, s) {
          var l = !0;
          return Ur(i, function(d, v, M) {
            return l = !!s(d, v, M), l;
          }), l;
        }
        function Xs(i, s, l) {
          for (var d = -1, v = i.length; ++d < v; ) {
            var M = i[d], P = s(M);
            if (P != null && (R === t ? P === P && !Sn(P) : l(P, R)))
              var R = P, F = M;
          }
          return F;
        }
        function s_(i, s, l, d) {
          var v = i.length;
          for (l = Oe(l), l < 0 && (l = -l > v ? 0 : v + l), d = d === t || d > v ? v : Oe(d), d < 0 && (d += v), d = l > d ? 0 : Fd(d); l < d; )
            i[l++] = s;
          return i;
        }
        function Sf(i, s) {
          var l = [];
          return Ur(i, function(d, v, M) {
            s(d, v, M) && l.push(d);
          }), l;
        }
        function Zt(i, s, l, d, v) {
          var M = -1, P = i.length;
          for (l || (l = V_), v || (v = []); ++M < P; ) {
            var R = i[M];
            s > 0 && l(R) ? s > 1 ? Zt(R, s - 1, l, d, v) : Lr(v, R) : d || (v[v.length] = R);
          }
          return v;
        }
        var rl = Jf(), Mf = Jf(!0);
        function or(i, s) {
          return i && rl(i, s, zt);
        }
        function il(i, s) {
          return i && Mf(i, s, zt);
        }
        function ea(i, s) {
          return Dr(s, function(l) {
            return wr(i[l]);
          });
        }
        function _i(i, s) {
          s = qr(s, i);
          for (var l = 0, d = s.length; i != null && l < d; )
            i = i[ar(s[l++])];
          return l && l == d ? i : t;
        }
        function Ef(i, s, l) {
          var d = s(i);
          return ke(i) ? d : Lr(d, l(i));
        }
        function Yt(i) {
          return i == null ? i === t ? wo : Nt : pi && pi in it(i) ? Z_(i) : ty(i);
        }
        function ol(i, s) {
          return i > s;
        }
        function a_(i, s) {
          return i != null && et.call(i, s);
        }
        function u_(i, s) {
          return i != null && s in it(i);
        }
        function l_(i, s, l) {
          return i >= Wt(s, l) && i < kt(s, l);
        }
        function sl(i, s, l) {
          for (var d = l ? Zu : Rs, v = i[0].length, M = i.length, P = M, R = G(M), F = 1 / 0, Y = []; P--; ) {
            var X = i[P];
            P && s && (X = ht(X, xn(s))), F = Wt(X.length, F), R[P] = !l && (s || v >= 120 && X.length >= 120) ? new mi(P && X) : t;
          }
          X = i[0];
          var ne = -1, ue = R[0];
          e:
            for (; ++ne < v && Y.length < F; ) {
              var _e = X[ne], Ee = s ? s(_e) : _e;
              if (_e = l || _e !== 0 ? _e : 0, !(ue ? Io(ue, Ee) : d(Y, Ee, l))) {
                for (P = M; --P; ) {
                  var De = R[P];
                  if (!(De ? Io(De, Ee) : d(i[P], Ee, l)))
                    continue e;
                }
                ue && ue.push(Ee), Y.push(_e);
              }
            }
          return Y;
        }
        function c_(i, s, l, d) {
          return or(i, function(v, M, P) {
            s(d, l(v), M, P);
          }), d;
        }
        function Do(i, s, l) {
          s = qr(s, i), i = dd(i, s);
          var d = i == null ? i : i[ar(Gn(s))];
          return d == null ? t : wn(d, i, l);
        }
        function Cf(i) {
          return Tt(i) && Yt(i) == ae;
        }
        function h_(i) {
          return Tt(i) && Yt(i) == k;
        }
        function f_(i) {
          return Tt(i) && Yt(i) == J;
        }
        function Lo(i, s, l, d, v) {
          return i === s ? !0 : i == null || s == null || !Tt(i) && !Tt(s) ? i !== i && s !== s : d_(i, s, l, d, Lo, v);
        }
        function d_(i, s, l, d, v, M) {
          var P = ke(i), R = ke(s), F = P ? ee : jt(i), Y = R ? ee : jt(s);
          F = F == ae ? xt : F, Y = Y == ae ? xt : Y;
          var X = F == xt, ne = Y == xt, ue = F == Y;
          if (ue && Hr(i)) {
            if (!Hr(s))
              return !1;
            P = !0, X = !1;
          }
          if (ue && !X)
            return M || (M = new er()), P || no(i) ? sd(i, s, l, d, v, M) : F_(i, s, F, l, d, v, M);
          if (!(l & _)) {
            var _e = X && et.call(i, "__wrapped__"), Ee = ne && et.call(s, "__wrapped__");
            if (_e || Ee) {
              var De = _e ? i.value() : i, Ce = Ee ? s.value() : s;
              return M || (M = new er()), v(De, Ce, l, d, M);
            }
          }
          return ue ? (M || (M = new er()), U_(i, s, l, d, v, M)) : !1;
        }
        function p_(i) {
          return Tt(i) && jt(i) == $e;
        }
        function al(i, s, l, d) {
          var v = l.length, M = v, P = !d;
          if (i == null)
            return !M;
          for (i = it(i); v--; ) {
            var R = l[v];
            if (P && R[2] ? R[1] !== i[R[0]] : !(R[0] in i))
              return !1;
          }
          for (; ++v < M; ) {
            R = l[v];
            var F = R[0], Y = i[F], X = R[1];
            if (P && R[2]) {
              if (Y === t && !(F in i))
                return !1;
            } else {
              var ne = new er();
              if (d)
                var ue = d(Y, X, F, i, s, ne);
              if (!(ue === t ? Lo(X, Y, _ | $, d, ne) : ue))
                return !1;
            }
          }
          return !0;
        }
        function Af(i) {
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
        function If(i) {
          return typeof i == "function" ? i : i == null ? hn : typeof i == "object" ? ke(i) ? $f(i[0], i[1]) : kf(i) : Yd(i);
        }
        function ul(i) {
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
          for (var d in i)
            d == "constructor" && (s || !et.call(i, d)) || l.push(d);
          return l;
        }
        function ll(i, s) {
          return i < s;
        }
        function Pf(i, s) {
          var l = -1, d = ln(i) ? G(i.length) : [];
          return Ur(i, function(v, M, P) {
            d[++l] = s(v, M, P);
          }), d;
        }
        function kf(i) {
          var s = Sl(i);
          return s.length == 1 && s[0][2] ? hd(s[0][0], s[0][1]) : function(l) {
            return l === i || al(l, i, s);
          };
        }
        function $f(i, s) {
          return El(i) && cd(s) ? hd(ar(i), s) : function(l) {
            var d = zl(l, i);
            return d === t && d === s ? Dl(l, i) : Lo(s, d, _ | $);
          };
        }
        function ta(i, s, l, d, v) {
          i !== s && rl(s, function(M, P) {
            if (v || (v = new er()), mt(M))
              y_(i, s, P, l, ta, d, v);
            else {
              var R = d ? d(Al(i, P), M, P + "", i, s, v) : t;
              R === t && (R = M), tl(i, P, R);
            }
          }, cn);
        }
        function y_(i, s, l, d, v, M, P) {
          var R = Al(i, l), F = Al(s, l), Y = P.get(F);
          if (Y) {
            tl(i, l, Y);
            return;
          }
          var X = M ? M(R, F, l + "", i, s, P) : t, ne = X === t;
          if (ne) {
            var ue = ke(F), _e = !ue && Hr(F), Ee = !ue && !_e && no(F);
            X = F, ue || _e || Ee ? ke(R) ? X = R : Et(R) ? X = un(R) : _e ? (ne = !1, X = Gf(F, !0)) : Ee ? (ne = !1, X = Hf(F, !0)) : X = [] : qo(F) || wi(F) ? (X = R, wi(R) ? X = Ud(R) : (!mt(R) || wr(R)) && (X = ld(F))) : ne = !1;
          }
          ne && (P.set(F, X), v(X, F, d, M, P), P.delete(F)), tl(i, l, X);
        }
        function Of(i, s) {
          var l = i.length;
          if (l)
            return s += s < 0 ? l : 0, br(s, l) ? i[s] : t;
        }
        function Nf(i, s, l) {
          s.length ? s = ht(s, function(M) {
            return ke(M) ? function(P) {
              return _i(P, M.length === 1 ? M[0] : M);
            } : M;
          }) : s = [hn];
          var d = -1;
          s = ht(s, xn(Me()));
          var v = Pf(i, function(M, P, R) {
            var F = ht(s, function(Y) {
              return Y(M);
            });
            return { criteria: F, index: ++d, value: M };
          });
          return Wv(v, function(M, P) {
            return $_(M, P, l);
          });
        }
        function b_(i, s) {
          return Rf(i, s, function(l, d) {
            return Dl(i, d);
          });
        }
        function Rf(i, s, l) {
          for (var d = -1, v = s.length, M = {}; ++d < v; ) {
            var P = s[d], R = _i(i, P);
            l(R, P) && Bo(M, qr(P, i), R);
          }
          return M;
        }
        function w_(i) {
          return function(s) {
            return _i(s, i);
          };
        }
        function cl(i, s, l, d) {
          var v = d ? Hv : Hi, M = -1, P = s.length, R = i;
          for (i === s && (s = un(s)), l && (R = ht(i, xn(l))); ++M < P; )
            for (var F = 0, Y = s[M], X = l ? l(Y) : Y; (F = v(R, X, F, d)) > -1; )
              R !== i && Hs.call(R, F, 1), Hs.call(i, F, 1);
          return i;
        }
        function zf(i, s) {
          for (var l = i ? s.length : 0, d = l - 1; l--; ) {
            var v = s[l];
            if (l == d || v !== M) {
              var M = v;
              br(v) ? Hs.call(i, v, 1) : pl(i, v);
            }
          }
          return i;
        }
        function hl(i, s) {
          return i + Vs(mf() * (s - i + 1));
        }
        function x_(i, s, l, d) {
          for (var v = -1, M = kt(js((s - i) / (l || 1)), 0), P = G(M); M--; )
            P[d ? M : ++v] = i, i += l;
          return P;
        }
        function fl(i, s) {
          var l = "";
          if (!i || s < 1 || s > se)
            return l;
          do
            s % 2 && (l += i), s = Vs(s / 2), s && (i += i);
          while (s);
          return l;
        }
        function Fe(i, s) {
          return Il(fd(i, s, hn), i + "");
        }
        function T_(i) {
          return yf(ro(i));
        }
        function S_(i, s) {
          var l = ro(i);
          return ha(l, vi(s, 0, l.length));
        }
        function Bo(i, s, l, d) {
          if (!mt(i))
            return i;
          s = qr(s, i);
          for (var v = -1, M = s.length, P = M - 1, R = i; R != null && ++v < M; ) {
            var F = ar(s[v]), Y = l;
            if (F === "__proto__" || F === "constructor" || F === "prototype")
              return i;
            if (v != P) {
              var X = R[F];
              Y = d ? d(X, F, R) : t, Y === t && (Y = mt(X) ? X : br(s[v + 1]) ? [] : {});
            }
            Ro(R, F, Y), R = R[F];
          }
          return i;
        }
        var Df = Ks ? function(i, s) {
          return Ks.set(i, s), i;
        } : hn, M_ = Ws ? function(i, s) {
          return Ws(i, "toString", {
            configurable: !0,
            enumerable: !1,
            value: Bl(s),
            writable: !0
          });
        } : hn;
        function E_(i) {
          return ha(ro(i));
        }
        function qn(i, s, l) {
          var d = -1, v = i.length;
          s < 0 && (s = -s > v ? 0 : v + s), l = l > v ? v : l, l < 0 && (l += v), v = s > l ? 0 : l - s >>> 0, s >>>= 0;
          for (var M = G(v); ++d < v; )
            M[d] = i[d + s];
          return M;
        }
        function C_(i, s) {
          var l;
          return Ur(i, function(d, v, M) {
            return l = s(d, v, M), !l;
          }), !!l;
        }
        function na(i, s, l) {
          var d = 0, v = i == null ? d : i.length;
          if (typeof s == "number" && s === s && v <= Re) {
            for (; d < v; ) {
              var M = d + v >>> 1, P = i[M];
              P !== null && !Sn(P) && (l ? P <= s : P < s) ? d = M + 1 : v = M;
            }
            return v;
          }
          return dl(i, s, hn, l);
        }
        function dl(i, s, l, d) {
          var v = 0, M = i == null ? 0 : i.length;
          if (M === 0)
            return 0;
          s = l(s);
          for (var P = s !== s, R = s === null, F = Sn(s), Y = s === t; v < M; ) {
            var X = Vs((v + M) / 2), ne = l(i[X]), ue = ne !== t, _e = ne === null, Ee = ne === ne, De = Sn(ne);
            if (P)
              var Ce = d || Ee;
            else Y ? Ce = Ee && (d || ue) : R ? Ce = Ee && ue && (d || !_e) : F ? Ce = Ee && ue && !_e && (d || !De) : _e || De ? Ce = !1 : Ce = d ? ne <= s : ne < s;
            Ce ? v = X + 1 : M = X;
          }
          return Wt(M, xe);
        }
        function Lf(i, s) {
          for (var l = -1, d = i.length, v = 0, M = []; ++l < d; ) {
            var P = i[l], R = s ? s(P) : P;
            if (!l || !tr(R, F)) {
              var F = R;
              M[v++] = P === 0 ? 0 : P;
            }
          }
          return M;
        }
        function Bf(i) {
          return typeof i == "number" ? i : Sn(i) ? ce : +i;
        }
        function Tn(i) {
          if (typeof i == "string")
            return i;
          if (ke(i))
            return ht(i, Tn) + "";
          if (Sn(i))
            return vf ? vf.call(i) : "";
          var s = i + "";
          return s == "0" && 1 / i == -te ? "-0" : s;
        }
        function Zr(i, s, l) {
          var d = -1, v = Rs, M = i.length, P = !0, R = [], F = R;
          if (l)
            P = !1, v = Zu;
          else if (M >= o) {
            var Y = s ? null : L_(i);
            if (Y)
              return Ds(Y);
            P = !1, v = Io, F = new mi();
          } else
            F = s ? [] : R;
          e:
            for (; ++d < M; ) {
              var X = i[d], ne = s ? s(X) : X;
              if (X = l || X !== 0 ? X : 0, P && ne === ne) {
                for (var ue = F.length; ue--; )
                  if (F[ue] === ne)
                    continue e;
                s && F.push(ne), R.push(X);
              } else v(F, ne, l) || (F !== R && F.push(ne), R.push(X));
            }
          return R;
        }
        function pl(i, s) {
          return s = qr(s, i), i = dd(i, s), i == null || delete i[ar(Gn(s))];
        }
        function Ff(i, s, l, d) {
          return Bo(i, s, l(_i(i, s)), d);
        }
        function ra(i, s, l, d) {
          for (var v = i.length, M = d ? v : -1; (d ? M-- : ++M < v) && s(i[M], M, i); )
            ;
          return l ? qn(i, d ? 0 : M, d ? M + 1 : v) : qn(i, d ? M + 1 : 0, d ? v : M);
        }
        function Uf(i, s) {
          var l = i;
          return l instanceof Ge && (l = l.value()), qu(s, function(d, v) {
            return v.func.apply(v.thisArg, Lr([d], v.args));
          }, l);
        }
        function gl(i, s, l) {
          var d = i.length;
          if (d < 2)
            return d ? Zr(i[0]) : [];
          for (var v = -1, M = G(d); ++v < d; )
            for (var P = i[v], R = -1; ++R < d; )
              R != v && (M[v] = zo(M[v] || P, i[R], s, l));
          return Zr(Zt(M, 1), s, l);
        }
        function Zf(i, s, l) {
          for (var d = -1, v = i.length, M = s.length, P = {}; ++d < v; ) {
            var R = d < M ? s[d] : t;
            l(P, i[d], R);
          }
          return P;
        }
        function ml(i) {
          return Et(i) ? i : [];
        }
        function vl(i) {
          return typeof i == "function" ? i : hn;
        }
        function qr(i, s) {
          return ke(i) ? i : El(i, s) ? [i] : vd(Xe(i));
        }
        var A_ = Fe;
        function Gr(i, s, l) {
          var d = i.length;
          return l = l === t ? d : l, !s && l >= d ? i : qn(i, s, l);
        }
        var qf = g1 || function(i) {
          return Ut.clearTimeout(i);
        };
        function Gf(i, s) {
          if (s)
            return i.slice();
          var l = i.length, d = hf ? hf(l) : new i.constructor(l);
          return i.copy(d), d;
        }
        function _l(i) {
          var s = new i.constructor(i.byteLength);
          return new qs(s).set(new qs(i)), s;
        }
        function I_(i, s) {
          var l = s ? _l(i.buffer) : i.buffer;
          return new i.constructor(l, i.byteOffset, i.byteLength);
        }
        function P_(i) {
          var s = new i.constructor(i.source, So.exec(i));
          return s.lastIndex = i.lastIndex, s;
        }
        function k_(i) {
          return No ? it(No.call(i)) : {};
        }
        function Hf(i, s) {
          var l = s ? _l(i.buffer) : i.buffer;
          return new i.constructor(l, i.byteOffset, i.length);
        }
        function Wf(i, s) {
          if (i !== s) {
            var l = i !== t, d = i === null, v = i === i, M = Sn(i), P = s !== t, R = s === null, F = s === s, Y = Sn(s);
            if (!R && !Y && !M && i > s || M && P && F && !R && !Y || d && P && F || !l && F || !v)
              return 1;
            if (!d && !M && !Y && i < s || Y && l && v && !d && !M || R && l && v || !P && v || !F)
              return -1;
          }
          return 0;
        }
        function $_(i, s, l) {
          for (var d = -1, v = i.criteria, M = s.criteria, P = v.length, R = l.length; ++d < P; ) {
            var F = Wf(v[d], M[d]);
            if (F) {
              if (d >= R)
                return F;
              var Y = l[d];
              return F * (Y == "desc" ? -1 : 1);
            }
          }
          return i.index - s.index;
        }
        function jf(i, s, l, d) {
          for (var v = -1, M = i.length, P = l.length, R = -1, F = s.length, Y = kt(M - P, 0), X = G(F + Y), ne = !d; ++R < F; )
            X[R] = s[R];
          for (; ++v < P; )
            (ne || v < M) && (X[l[v]] = i[v]);
          for (; Y--; )
            X[R++] = i[v++];
          return X;
        }
        function Vf(i, s, l, d) {
          for (var v = -1, M = i.length, P = -1, R = l.length, F = -1, Y = s.length, X = kt(M - R, 0), ne = G(X + Y), ue = !d; ++v < X; )
            ne[v] = i[v];
          for (var _e = v; ++F < Y; )
            ne[_e + F] = s[F];
          for (; ++P < R; )
            (ue || v < M) && (ne[_e + l[P]] = i[v++]);
          return ne;
        }
        function un(i, s) {
          var l = -1, d = i.length;
          for (s || (s = G(d)); ++l < d; )
            s[l] = i[l];
          return s;
        }
        function sr(i, s, l, d) {
          var v = !l;
          l || (l = {});
          for (var M = -1, P = s.length; ++M < P; ) {
            var R = s[M], F = d ? d(l[R], i[R], R, l, i) : t;
            F === t && (F = i[R]), v ? vr(l, R, F) : Ro(l, R, F);
          }
          return l;
        }
        function O_(i, s) {
          return sr(i, Ml(i), s);
        }
        function N_(i, s) {
          return sr(i, ad(i), s);
        }
        function ia(i, s) {
          return function(l, d) {
            var v = ke(l) ? Bv : n_, M = s ? s() : {};
            return v(l, i, Me(d, 2), M);
          };
        }
        function Xi(i) {
          return Fe(function(s, l) {
            var d = -1, v = l.length, M = v > 1 ? l[v - 1] : t, P = v > 2 ? l[2] : t;
            for (M = i.length > 3 && typeof M == "function" ? (v--, M) : t, P && Qt(l[0], l[1], P) && (M = v < 3 ? t : M, v = 1), s = it(s); ++d < v; ) {
              var R = l[d];
              R && i(s, R, d, M);
            }
            return s;
          });
        }
        function Kf(i, s) {
          return function(l, d) {
            if (l == null)
              return l;
            if (!ln(l))
              return i(l, d);
            for (var v = l.length, M = s ? v : -1, P = it(l); (s ? M-- : ++M < v) && d(P[M], M, P) !== !1; )
              ;
            return l;
          };
        }
        function Jf(i) {
          return function(s, l, d) {
            for (var v = -1, M = it(s), P = d(s), R = P.length; R--; ) {
              var F = P[i ? R : ++v];
              if (l(M[F], F, M) === !1)
                break;
            }
            return s;
          };
        }
        function R_(i, s, l) {
          var d = s & C, v = Fo(i);
          function M() {
            var P = this && this !== Ut && this instanceof M ? v : i;
            return P.apply(d ? l : this, arguments);
          }
          return M;
        }
        function Yf(i) {
          return function(s) {
            s = Xe(s);
            var l = Wi(s) ? Xn(s) : t, d = l ? l[0] : s.charAt(0), v = l ? Gr(l, 1).join("") : s.slice(1);
            return d[i]() + v;
          };
        }
        function eo(i) {
          return function(s) {
            return qu(Kd(Vd(s).replace(Mv, "")), i, "");
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
            var l = Qi(i.prototype), d = i.apply(l, s);
            return mt(d) ? d : l;
          };
        }
        function z_(i, s, l) {
          var d = Fo(i);
          function v() {
            for (var M = arguments.length, P = G(M), R = M, F = to(v); R--; )
              P[R] = arguments[R];
            var Y = M < 3 && P[0] !== F && P[M - 1] !== F ? [] : Br(P, F);
            if (M -= Y.length, M < l)
              return nd(
                i,
                s,
                oa,
                v.placeholder,
                t,
                P,
                Y,
                t,
                t,
                l - M
              );
            var X = this && this !== Ut && this instanceof v ? d : i;
            return wn(X, this, P);
          }
          return v;
        }
        function Qf(i) {
          return function(s, l, d) {
            var v = it(s);
            if (!ln(s)) {
              var M = Me(l, 3);
              s = zt(s), l = function(R) {
                return M(v[R], R, v);
              };
            }
            var P = i(s, l, d);
            return P > -1 ? v[M ? s[P] : P] : t;
          };
        }
        function Xf(i) {
          return yr(function(s) {
            var l = s.length, d = l, v = Un.prototype.thru;
            for (i && s.reverse(); d--; ) {
              var M = s[d];
              if (typeof M != "function")
                throw new Fn(u);
              if (v && !P && la(M) == "wrapper")
                var P = new Un([], !0);
            }
            for (d = P ? d : l; ++d < l; ) {
              M = s[d];
              var R = la(M), F = R == "wrapper" ? Tl(M) : t;
              F && Cl(F[0]) && F[1] == (L | T | N | q) && !F[4].length && F[9] == 1 ? P = P[la(F[0])].apply(P, F[3]) : P = M.length == 1 && Cl(M) ? P[R]() : P.thru(M);
            }
            return function() {
              var Y = arguments, X = Y[0];
              if (P && Y.length == 1 && ke(X))
                return P.plant(X).value();
              for (var ne = 0, ue = l ? s[ne].apply(this, Y) : X; ++ne < l; )
                ue = s[ne].call(this, ue);
              return ue;
            };
          });
        }
        function oa(i, s, l, d, v, M, P, R, F, Y) {
          var X = s & L, ne = s & C, ue = s & S, _e = s & (T | A), Ee = s & oe, De = ue ? t : Fo(i);
          function Ce() {
            for (var Ze = arguments.length, We = G(Ze), Mn = Ze; Mn--; )
              We[Mn] = arguments[Mn];
            if (_e)
              var Xt = to(Ce), En = Vv(We, Xt);
            if (d && (We = jf(We, d, v, _e)), M && (We = Vf(We, M, P, _e)), Ze -= En, _e && Ze < Y) {
              var Ct = Br(We, Xt);
              return nd(
                i,
                s,
                oa,
                Ce.placeholder,
                l,
                We,
                Ct,
                R,
                F,
                Y - Ze
              );
            }
            var nr = ne ? l : this, Tr = ue ? nr[i] : i;
            return Ze = We.length, R ? We = ny(We, R) : Ee && Ze > 1 && We.reverse(), X && F < Ze && (We.length = F), this && this !== Ut && this instanceof Ce && (Tr = De || Fo(Tr)), Tr.apply(nr, We);
          }
          return Ce;
        }
        function ed(i, s) {
          return function(l, d) {
            return c_(l, i, s(d), {});
          };
        }
        function sa(i, s) {
          return function(l, d) {
            var v;
            if (l === t && d === t)
              return s;
            if (l !== t && (v = l), d !== t) {
              if (v === t)
                return d;
              typeof l == "string" || typeof d == "string" ? (l = Tn(l), d = Tn(d)) : (l = Bf(l), d = Bf(d)), v = i(l, d);
            }
            return v;
          };
        }
        function yl(i) {
          return yr(function(s) {
            return s = ht(s, xn(Me())), Fe(function(l) {
              var d = this;
              return i(s, function(v) {
                return wn(v, d, l);
              });
            });
          });
        }
        function aa(i, s) {
          s = s === t ? " " : Tn(s);
          var l = s.length;
          if (l < 2)
            return l ? fl(s, i) : s;
          var d = fl(s, js(i / ji(s)));
          return Wi(s) ? Gr(Xn(d), 0, i).join("") : d.slice(0, i);
        }
        function D_(i, s, l, d) {
          var v = s & C, M = Fo(i);
          function P() {
            for (var R = -1, F = arguments.length, Y = -1, X = d.length, ne = G(X + F), ue = this && this !== Ut && this instanceof P ? M : i; ++Y < X; )
              ne[Y] = d[Y];
            for (; F--; )
              ne[Y++] = arguments[++R];
            return wn(ue, v ? l : this, ne);
          }
          return P;
        }
        function td(i) {
          return function(s, l, d) {
            return d && typeof d != "number" && Qt(s, l, d) && (l = d = t), s = xr(s), l === t ? (l = s, s = 0) : l = xr(l), d = d === t ? s < l ? 1 : -1 : xr(d), x_(s, l, d, i);
          };
        }
        function ua(i) {
          return function(s, l) {
            return typeof s == "string" && typeof l == "string" || (s = Hn(s), l = Hn(l)), i(s, l);
          };
        }
        function nd(i, s, l, d, v, M, P, R, F, Y) {
          var X = s & T, ne = X ? P : t, ue = X ? t : P, _e = X ? M : t, Ee = X ? t : M;
          s |= X ? N : D, s &= ~(X ? D : N), s & I || (s &= -4);
          var De = [
            i,
            s,
            v,
            _e,
            ne,
            Ee,
            ue,
            R,
            F,
            Y
          ], Ce = l.apply(t, De);
          return Cl(i) && pd(Ce, De), Ce.placeholder = d, gd(Ce, i, s);
        }
        function bl(i) {
          var s = Pt[i];
          return function(l, d) {
            if (l = Hn(l), d = d == null ? 0 : Wt(Oe(d), 292), d && gf(l)) {
              var v = (Xe(l) + "e").split("e"), M = s(v[0] + "e" + (+v[1] + d));
              return v = (Xe(M) + "e").split("e"), +(v[0] + "e" + (+v[1] - d));
            }
            return s(l);
          };
        }
        var L_ = Ji && 1 / Ds(new Ji([, -0]))[1] == te ? function(i) {
          return new Ji(i);
        } : Zl;
        function rd(i) {
          return function(s) {
            var l = jt(s);
            return l == $e ? Ju(s) : l == Qe ? t1(s) : jv(s, i(s));
          };
        }
        function _r(i, s, l, d, v, M, P, R) {
          var F = s & S;
          if (!F && typeof i != "function")
            throw new Fn(u);
          var Y = d ? d.length : 0;
          if (Y || (s &= -97, d = v = t), P = P === t ? P : kt(Oe(P), 0), R = R === t ? R : Oe(R), Y -= v ? v.length : 0, s & D) {
            var X = d, ne = v;
            d = v = t;
          }
          var ue = F ? t : Tl(i), _e = [
            i,
            s,
            l,
            d,
            v,
            X,
            ne,
            M,
            P,
            R
          ];
          if (ue && X_(_e, ue), i = _e[0], s = _e[1], l = _e[2], d = _e[3], v = _e[4], R = _e[9] = _e[9] === t ? F ? 0 : i.length : kt(_e[9] - Y, 0), !R && s & (T | A) && (s &= -25), !s || s == C)
            var Ee = R_(i, s, l);
          else s == T || s == A ? Ee = z_(i, s, R) : (s == N || s == (C | N)) && !v.length ? Ee = D_(i, s, l, d) : Ee = oa.apply(t, _e);
          var De = ue ? Df : pd;
          return gd(De(Ee, _e), i, s);
        }
        function id(i, s, l, d) {
          return i === t || tr(i, Ki[l]) && !et.call(d, l) ? s : i;
        }
        function od(i, s, l, d, v, M) {
          return mt(i) && mt(s) && (M.set(s, i), ta(i, s, t, od, M), M.delete(s)), i;
        }
        function B_(i) {
          return qo(i) ? t : i;
        }
        function sd(i, s, l, d, v, M) {
          var P = l & _, R = i.length, F = s.length;
          if (R != F && !(P && F > R))
            return !1;
          var Y = M.get(i), X = M.get(s);
          if (Y && X)
            return Y == s && X == i;
          var ne = -1, ue = !0, _e = l & $ ? new mi() : t;
          for (M.set(i, s), M.set(s, i); ++ne < R; ) {
            var Ee = i[ne], De = s[ne];
            if (d)
              var Ce = P ? d(De, Ee, ne, s, i, M) : d(Ee, De, ne, i, s, M);
            if (Ce !== t) {
              if (Ce)
                continue;
              ue = !1;
              break;
            }
            if (_e) {
              if (!Gu(s, function(Ze, We) {
                if (!Io(_e, We) && (Ee === Ze || v(Ee, Ze, l, d, M)))
                  return _e.push(We);
              })) {
                ue = !1;
                break;
              }
            } else if (!(Ee === De || v(Ee, De, l, d, M))) {
              ue = !1;
              break;
            }
          }
          return M.delete(i), M.delete(s), ue;
        }
        function F_(i, s, l, d, v, M, P) {
          switch (l) {
            case z:
              if (i.byteLength != s.byteLength || i.byteOffset != s.byteOffset)
                return !1;
              i = i.buffer, s = s.buffer;
            case k:
              return !(i.byteLength != s.byteLength || !M(new qs(i), new qs(s)));
            case W:
            case J:
            case tt:
              return tr(+i, +s);
            case we:
              return i.name == s.name && i.message == s.message;
            case Ft:
            case yn:
              return i == s + "";
            case $e:
              var R = Ju;
            case Qe:
              var F = d & _;
              if (R || (R = Ds), i.size != s.size && !F)
                return !1;
              var Y = P.get(i);
              if (Y)
                return Y == s;
              d |= $, P.set(i, s);
              var X = sd(R(i), R(s), d, v, M, P);
              return P.delete(i), X;
            case Nn:
              if (No)
                return No.call(i) == No.call(s);
          }
          return !1;
        }
        function U_(i, s, l, d, v, M) {
          var P = l & _, R = wl(i), F = R.length, Y = wl(s), X = Y.length;
          if (F != X && !P)
            return !1;
          for (var ne = F; ne--; ) {
            var ue = R[ne];
            if (!(P ? ue in s : et.call(s, ue)))
              return !1;
          }
          var _e = M.get(i), Ee = M.get(s);
          if (_e && Ee)
            return _e == s && Ee == i;
          var De = !0;
          M.set(i, s), M.set(s, i);
          for (var Ce = P; ++ne < F; ) {
            ue = R[ne];
            var Ze = i[ue], We = s[ue];
            if (d)
              var Mn = P ? d(We, Ze, ue, s, i, M) : d(Ze, We, ue, i, s, M);
            if (!(Mn === t ? Ze === We || v(Ze, We, l, d, M) : Mn)) {
              De = !1;
              break;
            }
            Ce || (Ce = ue == "constructor");
          }
          if (De && !Ce) {
            var Xt = i.constructor, En = s.constructor;
            Xt != En && "constructor" in i && "constructor" in s && !(typeof Xt == "function" && Xt instanceof Xt && typeof En == "function" && En instanceof En) && (De = !1);
          }
          return M.delete(i), M.delete(s), De;
        }
        function yr(i) {
          return Il(fd(i, t, wd), i + "");
        }
        function wl(i) {
          return Ef(i, zt, Ml);
        }
        function xl(i) {
          return Ef(i, cn, ad);
        }
        var Tl = Ks ? function(i) {
          return Ks.get(i);
        } : Zl;
        function la(i) {
          for (var s = i.name + "", l = Yi[s], d = et.call(Yi, s) ? l.length : 0; d--; ) {
            var v = l[d], M = v.func;
            if (M == null || M == i)
              return v.name;
          }
          return s;
        }
        function to(i) {
          var s = et.call(w, "placeholder") ? w : i;
          return s.placeholder;
        }
        function Me() {
          var i = w.iteratee || Fl;
          return i = i === Fl ? If : i, arguments.length ? i(arguments[0], arguments[1]) : i;
        }
        function ca(i, s) {
          var l = i.__data__;
          return K_(s) ? l[typeof s == "string" ? "string" : "hash"] : l.map;
        }
        function Sl(i) {
          for (var s = zt(i), l = s.length; l--; ) {
            var d = s[l], v = i[d];
            s[l] = [d, v, cd(v)];
          }
          return s;
        }
        function yi(i, s) {
          var l = Qv(i, s);
          return Af(l) ? l : t;
        }
        function Z_(i) {
          var s = et.call(i, pi), l = i[pi];
          try {
            i[pi] = t;
            var d = !0;
          } catch {
          }
          var v = Us.call(i);
          return d && (s ? i[pi] = l : delete i[pi]), v;
        }
        var Ml = Qu ? function(i) {
          return i == null ? [] : (i = it(i), Dr(Qu(i), function(s) {
            return df.call(i, s);
          }));
        } : ql, ad = Qu ? function(i) {
          for (var s = []; i; )
            Lr(s, Ml(i)), i = Gs(i);
          return s;
        } : ql, jt = Yt;
        (Xu && jt(new Xu(new ArrayBuffer(1))) != z || ko && jt(new ko()) != $e || el && jt(el.resolve()) != On || Ji && jt(new Ji()) != Qe || $o && jt(new $o()) != cr) && (jt = function(i) {
          var s = Yt(i), l = s == xt ? i.constructor : t, d = l ? bi(l) : "";
          if (d)
            switch (d) {
              case S1:
                return z;
              case M1:
                return $e;
              case E1:
                return On;
              case C1:
                return Qe;
              case A1:
                return cr;
            }
          return s;
        });
        function q_(i, s, l) {
          for (var d = -1, v = l.length; ++d < v; ) {
            var M = l[d], P = M.size;
            switch (M.type) {
              case "drop":
                i += P;
                break;
              case "dropRight":
                s -= P;
                break;
              case "take":
                s = Wt(s, i + P);
                break;
              case "takeRight":
                i = kt(i, s - P);
                break;
            }
          }
          return { start: i, end: s };
        }
        function G_(i) {
          var s = i.match(Nu);
          return s ? s[1].split(As) : [];
        }
        function ud(i, s, l) {
          s = qr(s, i);
          for (var d = -1, v = s.length, M = !1; ++d < v; ) {
            var P = ar(s[d]);
            if (!(M = i != null && l(i, P)))
              break;
            i = i[P];
          }
          return M || ++d != v ? M : (v = i == null ? 0 : i.length, !!v && va(v) && br(P, v) && (ke(i) || wi(i)));
        }
        function H_(i) {
          var s = i.length, l = new i.constructor(s);
          return s && typeof i[0] == "string" && et.call(i, "index") && (l.index = i.index, l.input = i.input), l;
        }
        function ld(i) {
          return typeof i.constructor == "function" && !Uo(i) ? Qi(Gs(i)) : {};
        }
        function W_(i, s, l) {
          var d = i.constructor;
          switch (s) {
            case k:
              return _l(i);
            case W:
            case J:
              return new d(+i);
            case z:
              return I_(i, l);
            case H:
            case Q:
            case le:
            case Ae:
            case Be:
            case St:
            case Kt:
            case ut:
            case Te:
              return Hf(i, l);
            case $e:
              return new d();
            case tt:
            case yn:
              return new d(i);
            case Ft:
              return P_(i);
            case Qe:
              return new d();
            case Nn:
              return k_(i);
          }
        }
        function j_(i, s) {
          var l = s.length;
          if (!l)
            return i;
          var d = l - 1;
          return s[d] = (l > 1 ? "& " : "") + s[d], s = s.join(l > 2 ? ", " : " "), i.replace(To, `{
/* [wrapped with ` + s + `] */
`);
        }
        function V_(i) {
          return ke(i) || wi(i) || !!(pf && i && i[pf]);
        }
        function br(i, s) {
          var l = typeof i;
          return s = s ?? se, !!s && (l == "number" || l != "symbol" && Li.test(i)) && i > -1 && i % 1 == 0 && i < s;
        }
        function Qt(i, s, l) {
          if (!mt(l))
            return !1;
          var d = typeof s;
          return (d == "number" ? ln(l) && br(s, l.length) : d == "string" && s in l) ? tr(l[s], i) : !1;
        }
        function El(i, s) {
          if (ke(i))
            return !1;
          var l = typeof i;
          return l == "number" || l == "symbol" || l == "boolean" || i == null || Sn(i) ? !0 : ui.test(i) || !ai.test(i) || s != null && i in it(s);
        }
        function K_(i) {
          var s = typeof i;
          return s == "string" || s == "number" || s == "symbol" || s == "boolean" ? i !== "__proto__" : i === null;
        }
        function Cl(i) {
          var s = la(i), l = w[s];
          if (typeof l != "function" || !(s in Ge.prototype))
            return !1;
          if (i === l)
            return !0;
          var d = Tl(l);
          return !!d && i === d[0];
        }
        function J_(i) {
          return !!cf && cf in i;
        }
        var Y_ = Bs ? wr : Gl;
        function Uo(i) {
          var s = i && i.constructor, l = typeof s == "function" && s.prototype || Ki;
          return i === l;
        }
        function cd(i) {
          return i === i && !mt(i);
        }
        function hd(i, s) {
          return function(l) {
            return l == null ? !1 : l[i] === s && (s !== t || i in it(l));
          };
        }
        function Q_(i) {
          var s = ga(i, function(d) {
            return l.size === f && l.clear(), d;
          }), l = s.cache;
          return s;
        }
        function X_(i, s) {
          var l = i[1], d = s[1], v = l | d, M = v < (C | S | L), P = d == L && l == T || d == L && l == q && i[7].length <= s[8] || d == (L | q) && s[7].length <= s[8] && l == T;
          if (!(M || P))
            return i;
          d & C && (i[2] = s[2], v |= l & C ? 0 : I);
          var R = s[3];
          if (R) {
            var F = i[3];
            i[3] = F ? jf(F, R, s[4]) : R, i[4] = F ? Br(i[3], p) : s[4];
          }
          return R = s[5], R && (F = i[5], i[5] = F ? Vf(F, R, s[6]) : R, i[6] = F ? Br(i[5], p) : s[6]), R = s[7], R && (i[7] = R), d & L && (i[8] = i[8] == null ? s[8] : Wt(i[8], s[8])), i[9] == null && (i[9] = s[9]), i[0] = s[0], i[1] = v, i;
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
        function fd(i, s, l) {
          return s = kt(s === t ? i.length - 1 : s, 0), function() {
            for (var d = arguments, v = -1, M = kt(d.length - s, 0), P = G(M); ++v < M; )
              P[v] = d[s + v];
            v = -1;
            for (var R = G(s + 1); ++v < s; )
              R[v] = d[v];
            return R[s] = l(P), wn(i, this, R);
          };
        }
        function dd(i, s) {
          return s.length < 2 ? i : _i(i, qn(s, 0, -1));
        }
        function ny(i, s) {
          for (var l = i.length, d = Wt(s.length, l), v = un(i); d--; ) {
            var M = s[d];
            i[d] = br(M, l) ? v[M] : t;
          }
          return i;
        }
        function Al(i, s) {
          if (!(s === "constructor" && typeof i[s] == "function") && s != "__proto__")
            return i[s];
        }
        var pd = md(Df), Zo = v1 || function(i, s) {
          return Ut.setTimeout(i, s);
        }, Il = md(M_);
        function gd(i, s, l) {
          var d = s + "";
          return Il(i, j_(d, ry(G_(d), l)));
        }
        function md(i) {
          var s = 0, l = 0;
          return function() {
            var d = w1(), v = Je - (d - l);
            if (l = d, v > 0) {
              if (++s >= pe)
                return arguments[0];
            } else
              s = 0;
            return i.apply(t, arguments);
          };
        }
        function ha(i, s) {
          var l = -1, d = i.length, v = d - 1;
          for (s = s === t ? d : s; ++l < s; ) {
            var M = hl(l, v), P = i[M];
            i[M] = i[l], i[l] = P;
          }
          return i.length = s, i;
        }
        var vd = Q_(function(i) {
          var s = [];
          return i.charCodeAt(0) === 46 && s.push(""), i.replace(Or, function(l, d, v, M) {
            s.push(v ? M.replace(Ps, "$1") : d || l);
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
          return Bn(Ve, function(l) {
            var d = "_." + l[0];
            s & l[1] && !Rs(i, d) && i.push(d);
          }), i.sort();
        }
        function _d(i) {
          if (i instanceof Ge)
            return i.clone();
          var s = new Un(i.__wrapped__, i.__chain__);
          return s.__actions__ = un(i.__actions__), s.__index__ = i.__index__, s.__values__ = i.__values__, s;
        }
        function iy(i, s, l) {
          (l ? Qt(i, s, l) : s === t) ? s = 1 : s = kt(Oe(s), 0);
          var d = i == null ? 0 : i.length;
          if (!d || s < 1)
            return [];
          for (var v = 0, M = 0, P = G(js(d / s)); v < d; )
            P[M++] = qn(i, v, v += s);
          return P;
        }
        function oy(i) {
          for (var s = -1, l = i == null ? 0 : i.length, d = 0, v = []; ++s < l; ) {
            var M = i[s];
            M && (v[d++] = M);
          }
          return v;
        }
        function sy() {
          var i = arguments.length;
          if (!i)
            return [];
          for (var s = G(i - 1), l = arguments[0], d = i; d--; )
            s[d - 1] = arguments[d];
          return Lr(ke(l) ? un(l) : [l], Zt(s, 1));
        }
        var ay = Fe(function(i, s) {
          return Et(i) ? zo(i, Zt(s, 1, Et, !0)) : [];
        }), uy = Fe(function(i, s) {
          var l = Gn(s);
          return Et(l) && (l = t), Et(i) ? zo(i, Zt(s, 1, Et, !0), Me(l, 2)) : [];
        }), ly = Fe(function(i, s) {
          var l = Gn(s);
          return Et(l) && (l = t), Et(i) ? zo(i, Zt(s, 1, Et, !0), t, l) : [];
        });
        function cy(i, s, l) {
          var d = i == null ? 0 : i.length;
          return d ? (s = l || s === t ? 1 : Oe(s), qn(i, s < 0 ? 0 : s, d)) : [];
        }
        function hy(i, s, l) {
          var d = i == null ? 0 : i.length;
          return d ? (s = l || s === t ? 1 : Oe(s), s = d - s, qn(i, 0, s < 0 ? 0 : s)) : [];
        }
        function fy(i, s) {
          return i && i.length ? ra(i, Me(s, 3), !0, !0) : [];
        }
        function dy(i, s) {
          return i && i.length ? ra(i, Me(s, 3), !0) : [];
        }
        function py(i, s, l, d) {
          var v = i == null ? 0 : i.length;
          return v ? (l && typeof l != "number" && Qt(i, s, l) && (l = 0, d = v), s_(i, s, l, d)) : [];
        }
        function yd(i, s, l) {
          var d = i == null ? 0 : i.length;
          if (!d)
            return -1;
          var v = l == null ? 0 : Oe(l);
          return v < 0 && (v = kt(d + v, 0)), zs(i, Me(s, 3), v);
        }
        function bd(i, s, l) {
          var d = i == null ? 0 : i.length;
          if (!d)
            return -1;
          var v = d - 1;
          return l !== t && (v = Oe(l), v = l < 0 ? kt(d + v, 0) : Wt(v, d - 1)), zs(i, Me(s, 3), v, !0);
        }
        function wd(i) {
          var s = i == null ? 0 : i.length;
          return s ? Zt(i, 1) : [];
        }
        function gy(i) {
          var s = i == null ? 0 : i.length;
          return s ? Zt(i, te) : [];
        }
        function my(i, s) {
          var l = i == null ? 0 : i.length;
          return l ? (s = s === t ? 1 : Oe(s), Zt(i, s)) : [];
        }
        function vy(i) {
          for (var s = -1, l = i == null ? 0 : i.length, d = {}; ++s < l; ) {
            var v = i[s];
            d[v[0]] = v[1];
          }
          return d;
        }
        function xd(i) {
          return i && i.length ? i[0] : t;
        }
        function _y(i, s, l) {
          var d = i == null ? 0 : i.length;
          if (!d)
            return -1;
          var v = l == null ? 0 : Oe(l);
          return v < 0 && (v = kt(d + v, 0)), Hi(i, s, v);
        }
        function yy(i) {
          var s = i == null ? 0 : i.length;
          return s ? qn(i, 0, -1) : [];
        }
        var by = Fe(function(i) {
          var s = ht(i, ml);
          return s.length && s[0] === i[0] ? sl(s) : [];
        }), wy = Fe(function(i) {
          var s = Gn(i), l = ht(i, ml);
          return s === Gn(l) ? s = t : l.pop(), l.length && l[0] === i[0] ? sl(l, Me(s, 2)) : [];
        }), xy = Fe(function(i) {
          var s = Gn(i), l = ht(i, ml);
          return s = typeof s == "function" ? s : t, s && l.pop(), l.length && l[0] === i[0] ? sl(l, t, s) : [];
        });
        function Ty(i, s) {
          return i == null ? "" : y1.call(i, s);
        }
        function Gn(i) {
          var s = i == null ? 0 : i.length;
          return s ? i[s - 1] : t;
        }
        function Sy(i, s, l) {
          var d = i == null ? 0 : i.length;
          if (!d)
            return -1;
          var v = d;
          return l !== t && (v = Oe(l), v = v < 0 ? kt(d + v, 0) : Wt(v, d - 1)), s === s ? r1(i, s, v) : zs(i, tf, v, !0);
        }
        function My(i, s) {
          return i && i.length ? Of(i, Oe(s)) : t;
        }
        var Ey = Fe(Td);
        function Td(i, s) {
          return i && i.length && s && s.length ? cl(i, s) : i;
        }
        function Cy(i, s, l) {
          return i && i.length && s && s.length ? cl(i, s, Me(l, 2)) : i;
        }
        function Ay(i, s, l) {
          return i && i.length && s && s.length ? cl(i, s, t, l) : i;
        }
        var Iy = yr(function(i, s) {
          var l = i == null ? 0 : i.length, d = nl(i, s);
          return zf(i, ht(s, function(v) {
            return br(v, l) ? +v : v;
          }).sort(Wf)), d;
        });
        function Py(i, s) {
          var l = [];
          if (!(i && i.length))
            return l;
          var d = -1, v = [], M = i.length;
          for (s = Me(s, 3); ++d < M; ) {
            var P = i[d];
            s(P, d, i) && (l.push(P), v.push(d));
          }
          return zf(i, v), l;
        }
        function Pl(i) {
          return i == null ? i : T1.call(i);
        }
        function ky(i, s, l) {
          var d = i == null ? 0 : i.length;
          return d ? (l && typeof l != "number" && Qt(i, s, l) ? (s = 0, l = d) : (s = s == null ? 0 : Oe(s), l = l === t ? d : Oe(l)), qn(i, s, l)) : [];
        }
        function $y(i, s) {
          return na(i, s);
        }
        function Oy(i, s, l) {
          return dl(i, s, Me(l, 2));
        }
        function Ny(i, s) {
          var l = i == null ? 0 : i.length;
          if (l) {
            var d = na(i, s);
            if (d < l && tr(i[d], s))
              return d;
          }
          return -1;
        }
        function Ry(i, s) {
          return na(i, s, !0);
        }
        function zy(i, s, l) {
          return dl(i, s, Me(l, 2), !0);
        }
        function Dy(i, s) {
          var l = i == null ? 0 : i.length;
          if (l) {
            var d = na(i, s, !0) - 1;
            if (tr(i[d], s))
              return d;
          }
          return -1;
        }
        function Ly(i) {
          return i && i.length ? Lf(i) : [];
        }
        function By(i, s) {
          return i && i.length ? Lf(i, Me(s, 2)) : [];
        }
        function Fy(i) {
          var s = i == null ? 0 : i.length;
          return s ? qn(i, 1, s) : [];
        }
        function Uy(i, s, l) {
          return i && i.length ? (s = l || s === t ? 1 : Oe(s), qn(i, 0, s < 0 ? 0 : s)) : [];
        }
        function Zy(i, s, l) {
          var d = i == null ? 0 : i.length;
          return d ? (s = l || s === t ? 1 : Oe(s), s = d - s, qn(i, s < 0 ? 0 : s, d)) : [];
        }
        function qy(i, s) {
          return i && i.length ? ra(i, Me(s, 3), !1, !0) : [];
        }
        function Gy(i, s) {
          return i && i.length ? ra(i, Me(s, 3)) : [];
        }
        var Hy = Fe(function(i) {
          return Zr(Zt(i, 1, Et, !0));
        }), Wy = Fe(function(i) {
          var s = Gn(i);
          return Et(s) && (s = t), Zr(Zt(i, 1, Et, !0), Me(s, 2));
        }), jy = Fe(function(i) {
          var s = Gn(i);
          return s = typeof s == "function" ? s : t, Zr(Zt(i, 1, Et, !0), t, s);
        });
        function Vy(i) {
          return i && i.length ? Zr(i) : [];
        }
        function Ky(i, s) {
          return i && i.length ? Zr(i, Me(s, 2)) : [];
        }
        function Jy(i, s) {
          return s = typeof s == "function" ? s : t, i && i.length ? Zr(i, t, s) : [];
        }
        function kl(i) {
          if (!(i && i.length))
            return [];
          var s = 0;
          return i = Dr(i, function(l) {
            if (Et(l))
              return s = kt(l.length, s), !0;
          }), Vu(s, function(l) {
            return ht(i, Hu(l));
          });
        }
        function Sd(i, s) {
          if (!(i && i.length))
            return [];
          var l = kl(i);
          return s == null ? l : ht(l, function(d) {
            return wn(s, t, d);
          });
        }
        var Yy = Fe(function(i, s) {
          return Et(i) ? zo(i, s) : [];
        }), Qy = Fe(function(i) {
          return gl(Dr(i, Et));
        }), Xy = Fe(function(i) {
          var s = Gn(i);
          return Et(s) && (s = t), gl(Dr(i, Et), Me(s, 2));
        }), e2 = Fe(function(i) {
          var s = Gn(i);
          return s = typeof s == "function" ? s : t, gl(Dr(i, Et), t, s);
        }), t2 = Fe(kl);
        function n2(i, s) {
          return Zf(i || [], s || [], Ro);
        }
        function r2(i, s) {
          return Zf(i || [], s || [], Bo);
        }
        var i2 = Fe(function(i) {
          var s = i.length, l = s > 1 ? i[s - 1] : t;
          return l = typeof l == "function" ? (i.pop(), l) : t, Sd(i, l);
        });
        function Md(i) {
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
          var s = i.length, l = s ? i[0] : 0, d = this.__wrapped__, v = function(M) {
            return nl(M, i);
          };
          return s > 1 || this.__actions__.length || !(d instanceof Ge) || !br(l) ? this.thru(v) : (d = d.slice(l, +l + (s ? 1 : 0)), d.__actions__.push({
            func: fa,
            args: [v],
            thisArg: t
          }), new Un(d, this.__chain__).thru(function(M) {
            return s && !M.length && M.push(t), M;
          }));
        });
        function a2() {
          return Md(this);
        }
        function u2() {
          return new Un(this.value(), this.__chain__);
        }
        function l2() {
          this.__values__ === t && (this.__values__ = Bd(this.value()));
          var i = this.__index__ >= this.__values__.length, s = i ? t : this.__values__[this.__index__++];
          return { done: i, value: s };
        }
        function c2() {
          return this;
        }
        function h2(i) {
          for (var s, l = this; l instanceof Ys; ) {
            var d = _d(l);
            d.__index__ = 0, d.__values__ = t, s ? v.__wrapped__ = d : s = d;
            var v = d;
            l = l.__wrapped__;
          }
          return v.__wrapped__ = i, s;
        }
        function f2() {
          var i = this.__wrapped__;
          if (i instanceof Ge) {
            var s = i;
            return this.__actions__.length && (s = new Ge(this)), s = s.reverse(), s.__actions__.push({
              func: fa,
              args: [Pl],
              thisArg: t
            }), new Un(s, this.__chain__);
          }
          return this.thru(Pl);
        }
        function d2() {
          return Uf(this.__wrapped__, this.__actions__);
        }
        var p2 = ia(function(i, s, l) {
          et.call(i, l) ? ++i[l] : vr(i, l, 1);
        });
        function g2(i, s, l) {
          var d = ke(i) ? Xh : o_;
          return l && Qt(i, s, l) && (s = t), d(i, Me(s, 3));
        }
        function m2(i, s) {
          var l = ke(i) ? Dr : Sf;
          return l(i, Me(s, 3));
        }
        var v2 = Qf(yd), _2 = Qf(bd);
        function y2(i, s) {
          return Zt(da(i, s), 1);
        }
        function b2(i, s) {
          return Zt(da(i, s), te);
        }
        function w2(i, s, l) {
          return l = l === t ? 1 : Oe(l), Zt(da(i, s), l);
        }
        function Ed(i, s) {
          var l = ke(i) ? Bn : Ur;
          return l(i, Me(s, 3));
        }
        function Cd(i, s) {
          var l = ke(i) ? Fv : Tf;
          return l(i, Me(s, 3));
        }
        var x2 = ia(function(i, s, l) {
          et.call(i, l) ? i[l].push(s) : vr(i, l, [s]);
        });
        function T2(i, s, l, d) {
          i = ln(i) ? i : ro(i), l = l && !d ? Oe(l) : 0;
          var v = i.length;
          return l < 0 && (l = kt(v + l, 0)), _a(i) ? l <= v && i.indexOf(s, l) > -1 : !!v && Hi(i, s, l) > -1;
        }
        var S2 = Fe(function(i, s, l) {
          var d = -1, v = typeof s == "function", M = ln(i) ? G(i.length) : [];
          return Ur(i, function(P) {
            M[++d] = v ? wn(s, P, l) : Do(P, s, l);
          }), M;
        }), M2 = ia(function(i, s, l) {
          vr(i, l, s);
        });
        function da(i, s) {
          var l = ke(i) ? ht : Pf;
          return l(i, Me(s, 3));
        }
        function E2(i, s, l, d) {
          return i == null ? [] : (ke(s) || (s = s == null ? [] : [s]), l = d ? t : l, ke(l) || (l = l == null ? [] : [l]), Nf(i, s, l));
        }
        var C2 = ia(function(i, s, l) {
          i[l ? 0 : 1].push(s);
        }, function() {
          return [[], []];
        });
        function A2(i, s, l) {
          var d = ke(i) ? qu : rf, v = arguments.length < 3;
          return d(i, Me(s, 4), l, v, Ur);
        }
        function I2(i, s, l) {
          var d = ke(i) ? Uv : rf, v = arguments.length < 3;
          return d(i, Me(s, 4), l, v, Tf);
        }
        function P2(i, s) {
          var l = ke(i) ? Dr : Sf;
          return l(i, ma(Me(s, 3)));
        }
        function k2(i) {
          var s = ke(i) ? yf : T_;
          return s(i);
        }
        function $2(i, s, l) {
          (l ? Qt(i, s, l) : s === t) ? s = 1 : s = Oe(s);
          var d = ke(i) ? e_ : S_;
          return d(i, s);
        }
        function O2(i) {
          var s = ke(i) ? t_ : E_;
          return s(i);
        }
        function N2(i) {
          if (i == null)
            return 0;
          if (ln(i))
            return _a(i) ? ji(i) : i.length;
          var s = jt(i);
          return s == $e || s == Qe ? i.size : ul(i).length;
        }
        function R2(i, s, l) {
          var d = ke(i) ? Gu : C_;
          return l && Qt(i, s, l) && (s = t), d(i, Me(s, 3));
        }
        var z2 = Fe(function(i, s) {
          if (i == null)
            return [];
          var l = s.length;
          return l > 1 && Qt(i, s[0], s[1]) ? s = [] : l > 2 && Qt(s[0], s[1], s[2]) && (s = [s[0]]), Nf(i, Zt(s, 1), []);
        }), pa = m1 || function() {
          return Ut.Date.now();
        };
        function D2(i, s) {
          if (typeof s != "function")
            throw new Fn(u);
          return i = Oe(i), function() {
            if (--i < 1)
              return s.apply(this, arguments);
          };
        }
        function Ad(i, s, l) {
          return s = l ? t : s, s = i && s == null ? i.length : s, _r(i, L, t, t, t, t, s);
        }
        function Id(i, s) {
          var l;
          if (typeof s != "function")
            throw new Fn(u);
          return i = Oe(i), function() {
            return --i > 0 && (l = s.apply(this, arguments)), i <= 1 && (s = t), l;
          };
        }
        var $l = Fe(function(i, s, l) {
          var d = C;
          if (l.length) {
            var v = Br(l, to($l));
            d |= N;
          }
          return _r(i, d, s, l, v);
        }), Pd = Fe(function(i, s, l) {
          var d = C | S;
          if (l.length) {
            var v = Br(l, to(Pd));
            d |= N;
          }
          return _r(s, d, i, l, v);
        });
        function kd(i, s, l) {
          s = l ? t : s;
          var d = _r(i, T, t, t, t, t, t, s);
          return d.placeholder = kd.placeholder, d;
        }
        function $d(i, s, l) {
          s = l ? t : s;
          var d = _r(i, A, t, t, t, t, t, s);
          return d.placeholder = $d.placeholder, d;
        }
        function Od(i, s, l) {
          var d, v, M, P, R, F, Y = 0, X = !1, ne = !1, ue = !0;
          if (typeof i != "function")
            throw new Fn(u);
          s = Hn(s) || 0, mt(l) && (X = !!l.leading, ne = "maxWait" in l, M = ne ? kt(Hn(l.maxWait) || 0, s) : M, ue = "trailing" in l ? !!l.trailing : ue);
          function _e(Ct) {
            var nr = d, Tr = v;
            return d = v = t, Y = Ct, P = i.apply(Tr, nr), P;
          }
          function Ee(Ct) {
            return Y = Ct, R = Zo(Ze, s), X ? _e(Ct) : P;
          }
          function De(Ct) {
            var nr = Ct - F, Tr = Ct - Y, Qd = s - nr;
            return ne ? Wt(Qd, M - Tr) : Qd;
          }
          function Ce(Ct) {
            var nr = Ct - F, Tr = Ct - Y;
            return F === t || nr >= s || nr < 0 || ne && Tr >= M;
          }
          function Ze() {
            var Ct = pa();
            if (Ce(Ct))
              return We(Ct);
            R = Zo(Ze, De(Ct));
          }
          function We(Ct) {
            return R = t, ue && d ? _e(Ct) : (d = v = t, P);
          }
          function Mn() {
            R !== t && qf(R), Y = 0, d = F = v = R = t;
          }
          function Xt() {
            return R === t ? P : We(pa());
          }
          function En() {
            var Ct = pa(), nr = Ce(Ct);
            if (d = arguments, v = this, F = Ct, nr) {
              if (R === t)
                return Ee(F);
              if (ne)
                return qf(R), R = Zo(Ze, s), _e(F);
            }
            return R === t && (R = Zo(Ze, s)), P;
          }
          return En.cancel = Mn, En.flush = Xt, En;
        }
        var L2 = Fe(function(i, s) {
          return xf(i, 1, s);
        }), B2 = Fe(function(i, s, l) {
          return xf(i, Hn(s) || 0, l);
        });
        function F2(i) {
          return _r(i, oe);
        }
        function ga(i, s) {
          if (typeof i != "function" || s != null && typeof s != "function")
            throw new Fn(u);
          var l = function() {
            var d = arguments, v = s ? s.apply(this, d) : d[0], M = l.cache;
            if (M.has(v))
              return M.get(v);
            var P = i.apply(this, d);
            return l.cache = M.set(v, P) || M, P;
          };
          return l.cache = new (ga.Cache || mr)(), l;
        }
        ga.Cache = mr;
        function ma(i) {
          if (typeof i != "function")
            throw new Fn(u);
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
          return Id(2, i);
        }
        var Z2 = A_(function(i, s) {
          s = s.length == 1 && ke(s[0]) ? ht(s[0], xn(Me())) : ht(Zt(s, 1), xn(Me()));
          var l = s.length;
          return Fe(function(d) {
            for (var v = -1, M = Wt(d.length, l); ++v < M; )
              d[v] = s[v].call(this, d[v]);
            return wn(i, this, d);
          });
        }), Ol = Fe(function(i, s) {
          var l = Br(s, to(Ol));
          return _r(i, N, t, s, l);
        }), Nd = Fe(function(i, s) {
          var l = Br(s, to(Nd));
          return _r(i, D, t, s, l);
        }), q2 = yr(function(i, s) {
          return _r(i, q, t, t, t, s);
        });
        function G2(i, s) {
          if (typeof i != "function")
            throw new Fn(u);
          return s = s === t ? s : Oe(s), Fe(i, s);
        }
        function H2(i, s) {
          if (typeof i != "function")
            throw new Fn(u);
          return s = s == null ? 0 : kt(Oe(s), 0), Fe(function(l) {
            var d = l[s], v = Gr(l, 0, s);
            return d && Lr(v, d), wn(i, this, v);
          });
        }
        function W2(i, s, l) {
          var d = !0, v = !0;
          if (typeof i != "function")
            throw new Fn(u);
          return mt(l) && (d = "leading" in l ? !!l.leading : d, v = "trailing" in l ? !!l.trailing : v), Od(i, s, {
            leading: d,
            maxWait: s,
            trailing: v
          });
        }
        function j2(i) {
          return Ad(i, 1);
        }
        function V2(i, s) {
          return Ol(vl(s), i);
        }
        function K2() {
          if (!arguments.length)
            return [];
          var i = arguments[0];
          return ke(i) ? i : [i];
        }
        function J2(i) {
          return Zn(i, b);
        }
        function Y2(i, s) {
          return s = typeof s == "function" ? s : t, Zn(i, b, s);
        }
        function Q2(i) {
          return Zn(i, g | b);
        }
        function X2(i, s) {
          return s = typeof s == "function" ? s : t, Zn(i, g | b, s);
        }
        function eb(i, s) {
          return s == null || wf(i, s, zt(s));
        }
        function tr(i, s) {
          return i === s || i !== i && s !== s;
        }
        var tb = ua(ol), nb = ua(function(i, s) {
          return i >= s;
        }), wi = Cf(/* @__PURE__ */ function() {
          return arguments;
        }()) ? Cf : function(i) {
          return Tt(i) && et.call(i, "callee") && !df.call(i, "callee");
        }, ke = G.isArray, rb = jh ? xn(jh) : h_;
        function ln(i) {
          return i != null && va(i.length) && !wr(i);
        }
        function Et(i) {
          return Tt(i) && ln(i);
        }
        function ib(i) {
          return i === !0 || i === !1 || Tt(i) && Yt(i) == W;
        }
        var Hr = _1 || Gl, ob = Vh ? xn(Vh) : f_;
        function sb(i) {
          return Tt(i) && i.nodeType === 1 && !qo(i);
        }
        function ab(i) {
          if (i == null)
            return !0;
          if (ln(i) && (ke(i) || typeof i == "string" || typeof i.splice == "function" || Hr(i) || no(i) || wi(i)))
            return !i.length;
          var s = jt(i);
          if (s == $e || s == Qe)
            return !i.size;
          if (Uo(i))
            return !ul(i).length;
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
          var d = l ? l(i, s) : t;
          return d === t ? Lo(i, s, t, l) : !!d;
        }
        function Nl(i) {
          if (!Tt(i))
            return !1;
          var s = Yt(i);
          return s == we || s == he || typeof i.message == "string" && typeof i.name == "string" && !qo(i);
        }
        function cb(i) {
          return typeof i == "number" && gf(i);
        }
        function wr(i) {
          if (!mt(i))
            return !1;
          var s = Yt(i);
          return s == Ue || s == wt || s == U || s == Se;
        }
        function Rd(i) {
          return typeof i == "number" && i == Oe(i);
        }
        function va(i) {
          return typeof i == "number" && i > -1 && i % 1 == 0 && i <= se;
        }
        function mt(i) {
          var s = typeof i;
          return i != null && (s == "object" || s == "function");
        }
        function Tt(i) {
          return i != null && typeof i == "object";
        }
        var zd = Kh ? xn(Kh) : p_;
        function hb(i, s) {
          return i === s || al(i, s, Sl(s));
        }
        function fb(i, s, l) {
          return l = typeof l == "function" ? l : t, al(i, s, Sl(s), l);
        }
        function db(i) {
          return Dd(i) && i != +i;
        }
        function pb(i) {
          if (Y_(i))
            throw new Pe(a);
          return Af(i);
        }
        function gb(i) {
          return i === null;
        }
        function mb(i) {
          return i == null;
        }
        function Dd(i) {
          return typeof i == "number" || Tt(i) && Yt(i) == tt;
        }
        function qo(i) {
          if (!Tt(i) || Yt(i) != xt)
            return !1;
          var s = Gs(i);
          if (s === null)
            return !0;
          var l = et.call(s, "constructor") && s.constructor;
          return typeof l == "function" && l instanceof l && Fs.call(l) == f1;
        }
        var Rl = Jh ? xn(Jh) : g_;
        function vb(i) {
          return Rd(i) && i >= -se && i <= se;
        }
        var Ld = Yh ? xn(Yh) : m_;
        function _a(i) {
          return typeof i == "string" || !ke(i) && Tt(i) && Yt(i) == yn;
        }
        function Sn(i) {
          return typeof i == "symbol" || Tt(i) && Yt(i) == Nn;
        }
        var no = Qh ? xn(Qh) : v_;
        function _b(i) {
          return i === t;
        }
        function yb(i) {
          return Tt(i) && jt(i) == cr;
        }
        function bb(i) {
          return Tt(i) && Yt(i) == x;
        }
        var wb = ua(ll), xb = ua(function(i, s) {
          return i <= s;
        });
        function Bd(i) {
          if (!i)
            return [];
          if (ln(i))
            return _a(i) ? Xn(i) : un(i);
          if (Po && i[Po])
            return e1(i[Po]());
          var s = jt(i), l = s == $e ? Ju : s == Qe ? Ds : ro;
          return l(i);
        }
        function xr(i) {
          if (!i)
            return i === 0 ? i : 0;
          if (i = Hn(i), i === te || i === -te) {
            var s = i < 0 ? -1 : 1;
            return s * re;
          }
          return i === i ? i : 0;
        }
        function Oe(i) {
          var s = xr(i), l = s % 1;
          return s === s ? l ? s - l : s : 0;
        }
        function Fd(i) {
          return i ? vi(Oe(i), 0, ve) : 0;
        }
        function Hn(i) {
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
          i = of(i);
          var l = fr.test(i);
          return l || ci.test(i) ? Dv(i.slice(2), l ? 2 : 8) : Mo.test(i) ? ce : +i;
        }
        function Ud(i) {
          return sr(i, cn(i));
        }
        function Tb(i) {
          return i ? vi(Oe(i), -se, se) : i === 0 ? i : 0;
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
        }), Zd = Xi(function(i, s) {
          sr(s, cn(s), i);
        }), ya = Xi(function(i, s, l, d) {
          sr(s, cn(s), i, d);
        }), Mb = Xi(function(i, s, l, d) {
          sr(s, zt(s), i, d);
        }), Eb = yr(nl);
        function Cb(i, s) {
          var l = Qi(i);
          return s == null ? l : bf(l, s);
        }
        var Ab = Fe(function(i, s) {
          i = it(i);
          var l = -1, d = s.length, v = d > 2 ? s[2] : t;
          for (v && Qt(s[0], s[1], v) && (d = 1); ++l < d; )
            for (var M = s[l], P = cn(M), R = -1, F = P.length; ++R < F; ) {
              var Y = P[R], X = i[Y];
              (X === t || tr(X, Ki[Y]) && !et.call(i, Y)) && (i[Y] = M[Y]);
            }
          return i;
        }), Ib = Fe(function(i) {
          return i.push(t, od), wn(qd, t, i);
        });
        function Pb(i, s) {
          return ef(i, Me(s, 3), or);
        }
        function kb(i, s) {
          return ef(i, Me(s, 3), il);
        }
        function $b(i, s) {
          return i == null ? i : rl(i, Me(s, 3), cn);
        }
        function Ob(i, s) {
          return i == null ? i : Mf(i, Me(s, 3), cn);
        }
        function Nb(i, s) {
          return i && or(i, Me(s, 3));
        }
        function Rb(i, s) {
          return i && il(i, Me(s, 3));
        }
        function zb(i) {
          return i == null ? [] : ea(i, zt(i));
        }
        function Db(i) {
          return i == null ? [] : ea(i, cn(i));
        }
        function zl(i, s, l) {
          var d = i == null ? t : _i(i, s);
          return d === t ? l : d;
        }
        function Lb(i, s) {
          return i != null && ud(i, s, a_);
        }
        function Dl(i, s) {
          return i != null && ud(i, s, u_);
        }
        var Bb = ed(function(i, s, l) {
          s != null && typeof s.toString != "function" && (s = Us.call(s)), i[s] = l;
        }, Bl(hn)), Fb = ed(function(i, s, l) {
          s != null && typeof s.toString != "function" && (s = Us.call(s)), et.call(i, s) ? i[s].push(l) : i[s] = [l];
        }, Me), Ub = Fe(Do);
        function zt(i) {
          return ln(i) ? _f(i) : ul(i);
        }
        function cn(i) {
          return ln(i) ? _f(i, !0) : __(i);
        }
        function Zb(i, s) {
          var l = {};
          return s = Me(s, 3), or(i, function(d, v, M) {
            vr(l, s(d, v, M), d);
          }), l;
        }
        function qb(i, s) {
          var l = {};
          return s = Me(s, 3), or(i, function(d, v, M) {
            vr(l, v, s(d, v, M));
          }), l;
        }
        var Gb = Xi(function(i, s, l) {
          ta(i, s, l);
        }), qd = Xi(function(i, s, l, d) {
          ta(i, s, l, d);
        }), Hb = yr(function(i, s) {
          var l = {};
          if (i == null)
            return l;
          var d = !1;
          s = ht(s, function(M) {
            return M = qr(M, i), d || (d = M.length > 1), M;
          }), sr(i, xl(i), l), d && (l = Zn(l, g | m | b, B_));
          for (var v = s.length; v--; )
            pl(l, s[v]);
          return l;
        });
        function Wb(i, s) {
          return Gd(i, ma(Me(s)));
        }
        var jb = yr(function(i, s) {
          return i == null ? {} : b_(i, s);
        });
        function Gd(i, s) {
          if (i == null)
            return {};
          var l = ht(xl(i), function(d) {
            return [d];
          });
          return s = Me(s), Rf(i, l, function(d, v) {
            return s(d, v[0]);
          });
        }
        function Vb(i, s, l) {
          s = qr(s, i);
          var d = -1, v = s.length;
          for (v || (v = 1, i = t); ++d < v; ) {
            var M = i == null ? t : i[ar(s[d])];
            M === t && (d = v, M = l), i = wr(M) ? M.call(i) : M;
          }
          return i;
        }
        function Kb(i, s, l) {
          return i == null ? i : Bo(i, s, l);
        }
        function Jb(i, s, l, d) {
          return d = typeof d == "function" ? d : t, i == null ? i : Bo(i, s, l, d);
        }
        var Hd = rd(zt), Wd = rd(cn);
        function Yb(i, s, l) {
          var d = ke(i), v = d || Hr(i) || no(i);
          if (s = Me(s, 4), l == null) {
            var M = i && i.constructor;
            v ? l = d ? new M() : [] : mt(i) ? l = wr(M) ? Qi(Gs(i)) : {} : l = {};
          }
          return (v ? Bn : or)(i, function(P, R, F) {
            return s(l, P, R, F);
          }), l;
        }
        function Qb(i, s) {
          return i == null ? !0 : pl(i, s);
        }
        function Xb(i, s, l) {
          return i == null ? i : Ff(i, s, vl(l));
        }
        function ew(i, s, l, d) {
          return d = typeof d == "function" ? d : t, i == null ? i : Ff(i, s, vl(l), d);
        }
        function ro(i) {
          return i == null ? [] : Ku(i, zt(i));
        }
        function tw(i) {
          return i == null ? [] : Ku(i, cn(i));
        }
        function nw(i, s, l) {
          return l === t && (l = s, s = t), l !== t && (l = Hn(l), l = l === l ? l : 0), s !== t && (s = Hn(s), s = s === s ? s : 0), vi(Hn(i), s, l);
        }
        function rw(i, s, l) {
          return s = xr(s), l === t ? (l = s, s = 0) : l = xr(l), i = Hn(i), l_(i, s, l);
        }
        function iw(i, s, l) {
          if (l && typeof l != "boolean" && Qt(i, s, l) && (s = l = t), l === t && (typeof s == "boolean" ? (l = s, s = t) : typeof i == "boolean" && (l = i, i = t)), i === t && s === t ? (i = 0, s = 1) : (i = xr(i), s === t ? (s = i, i = 0) : s = xr(s)), i > s) {
            var d = i;
            i = s, s = d;
          }
          if (l || i % 1 || s % 1) {
            var v = mf();
            return Wt(i + v * (s - i + zv("1e-" + ((v + "").length - 1))), s);
          }
          return hl(i, s);
        }
        var ow = eo(function(i, s, l) {
          return s = s.toLowerCase(), i + (l ? jd(s) : s);
        });
        function jd(i) {
          return Ll(Xe(i).toLowerCase());
        }
        function Vd(i) {
          return i = Xe(i), i && i.replace(Eo, Kv).replace(Ev, "");
        }
        function sw(i, s, l) {
          i = Xe(i), s = Tn(s);
          var d = i.length;
          l = l === t ? d : vi(Oe(l), 0, d);
          var v = l;
          return l -= s.length, l >= 0 && i.slice(l, v) == s;
        }
        function aw(i) {
          return i = Xe(i), i && Jt.test(i) ? i.replace(kr, Jv) : i;
        }
        function uw(i) {
          return i = Xe(i), i && Di.test(i) ? i.replace(Rn, "\\$&") : i;
        }
        var lw = eo(function(i, s, l) {
          return i + (l ? "-" : "") + s.toLowerCase();
        }), cw = eo(function(i, s, l) {
          return i + (l ? " " : "") + s.toLowerCase();
        }), hw = Yf("toLowerCase");
        function fw(i, s, l) {
          i = Xe(i), s = Oe(s);
          var d = s ? ji(i) : 0;
          if (!s || d >= s)
            return i;
          var v = (s - d) / 2;
          return aa(Vs(v), l) + i + aa(js(v), l);
        }
        function dw(i, s, l) {
          i = Xe(i), s = Oe(s);
          var d = s ? ji(i) : 0;
          return s && d < s ? i + aa(s - d, l) : i;
        }
        function pw(i, s, l) {
          i = Xe(i), s = Oe(s);
          var d = s ? ji(i) : 0;
          return s && d < s ? aa(s - d, l) + i : i;
        }
        function gw(i, s, l) {
          return l || s == null ? s = 0 : s && (s = +s), x1(Xe(i).replace(Nr, ""), s || 0);
        }
        function mw(i, s, l) {
          return (l ? Qt(i, s, l) : s === t) ? s = 1 : s = Oe(s), fl(Xe(i), s);
        }
        function vw() {
          var i = arguments, s = Xe(i[0]);
          return i.length < 3 ? s : s.replace(i[1], i[2]);
        }
        var _w = eo(function(i, s, l) {
          return i + (l ? "_" : "") + s.toLowerCase();
        });
        function yw(i, s, l) {
          return l && typeof l != "number" && Qt(i, s, l) && (s = l = t), l = l === t ? ve : l >>> 0, l ? (i = Xe(i), i && (typeof s == "string" || s != null && !Rl(s)) && (s = Tn(s), !s && Wi(i)) ? Gr(Xn(i), 0, l) : i.split(s, l)) : [];
        }
        var bw = eo(function(i, s, l) {
          return i + (l ? " " : "") + Ll(s);
        });
        function ww(i, s, l) {
          return i = Xe(i), l = l == null ? 0 : vi(Oe(l), 0, i.length), s = Tn(s), i.slice(l, l + s.length) == s;
        }
        function xw(i, s, l) {
          var d = w.templateSettings;
          l && Qt(i, s, l) && (s = t), i = Xe(i), s = ya({}, s, d, id);
          var v = ya({}, s.imports, d.imports, id), M = zt(v), P = Ku(v, M), R, F, Y = 0, X = s.interpolate || Bi, ne = "__p += '", ue = Yu(
            (s.escape || Bi).source + "|" + X.source + "|" + (X === $r ? ks : Bi).source + "|" + (s.evaluate || Bi).source + "|$",
            "g"
          ), _e = "//# sourceURL=" + (et.call(s, "sourceURL") ? (s.sourceURL + "").replace(/\s/g, " ") : "lodash.templateSources[" + ++kv + "]") + `
`;
          i.replace(ue, function(Ce, Ze, We, Mn, Xt, En) {
            return We || (We = Mn), ne += i.slice(Y, En).replace(zu, Yv), Ze && (R = !0, ne += `' +
__e(` + Ze + `) +
'`), Xt && (F = !0, ne += `';
` + Xt + `;
__p += '`), We && (ne += `' +
((__t = (` + We + `)) == null ? '' : __t) +
'`), Y = En + Ce.length, Ce;
          }), ne += `';
`;
          var Ee = et.call(s, "variable") && s.variable;
          if (!Ee)
            ne = `with (obj) {
` + ne + `
}
`;
          else if (Is.test(Ee))
            throw new Pe(h);
          ne = (F ? ne.replace(Ht, "") : ne).replace(xo, "$1").replace(oi, "$1;"), ne = "function(" + (Ee || "obj") + `) {
` + (Ee ? "" : `obj || (obj = {});
`) + "var __t, __p = ''" + (R ? ", __e = _.escape" : "") + (F ? `, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
` : `;
`) + ne + `return __p
}`;
          var De = Jd(function() {
            return Ye(M, _e + "return " + ne).apply(t, P);
          });
          if (De.source = ne, Nl(De))
            throw De;
          return De;
        }
        function Tw(i) {
          return Xe(i).toLowerCase();
        }
        function Sw(i) {
          return Xe(i).toUpperCase();
        }
        function Mw(i, s, l) {
          if (i = Xe(i), i && (l || s === t))
            return of(i);
          if (!i || !(s = Tn(s)))
            return i;
          var d = Xn(i), v = Xn(s), M = sf(d, v), P = af(d, v) + 1;
          return Gr(d, M, P).join("");
        }
        function Ew(i, s, l) {
          if (i = Xe(i), i && (l || s === t))
            return i.slice(0, lf(i) + 1);
          if (!i || !(s = Tn(s)))
            return i;
          var d = Xn(i), v = af(d, Xn(s)) + 1;
          return Gr(d, 0, v).join("");
        }
        function Cw(i, s, l) {
          if (i = Xe(i), i && (l || s === t))
            return i.replace(Nr, "");
          if (!i || !(s = Tn(s)))
            return i;
          var d = Xn(i), v = sf(d, Xn(s));
          return Gr(d, v).join("");
        }
        function Aw(i, s) {
          var l = be, d = ge;
          if (mt(s)) {
            var v = "separator" in s ? s.separator : v;
            l = "length" in s ? Oe(s.length) : l, d = "omission" in s ? Tn(s.omission) : d;
          }
          i = Xe(i);
          var M = i.length;
          if (Wi(i)) {
            var P = Xn(i);
            M = P.length;
          }
          if (l >= M)
            return i;
          var R = l - ji(d);
          if (R < 1)
            return d;
          var F = P ? Gr(P, 0, R).join("") : i.slice(0, R);
          if (v === t)
            return F + d;
          if (P && (R += F.length - R), Rl(v)) {
            if (i.slice(R).search(v)) {
              var Y, X = F;
              for (v.global || (v = Yu(v.source, Xe(So.exec(v)) + "g")), v.lastIndex = 0; Y = v.exec(X); )
                var ne = Y.index;
              F = F.slice(0, ne === t ? R : ne);
            }
          } else if (i.indexOf(Tn(v), R) != R) {
            var ue = F.lastIndexOf(v);
            ue > -1 && (F = F.slice(0, ue));
          }
          return F + d;
        }
        function Iw(i) {
          return i = Xe(i), i && hr.test(i) ? i.replace(Pr, i1) : i;
        }
        var Pw = eo(function(i, s, l) {
          return i + (l ? " " : "") + s.toUpperCase();
        }), Ll = Yf("toUpperCase");
        function Kd(i, s, l) {
          return i = Xe(i), s = l ? t : s, s === t ? Xv(i) ? a1(i) : Gv(i) : i.match(s) || [];
        }
        var Jd = Fe(function(i, s) {
          try {
            return wn(i, t, s);
          } catch (l) {
            return Nl(l) ? l : new Pe(l);
          }
        }), kw = yr(function(i, s) {
          return Bn(s, function(l) {
            l = ar(l), vr(i, l, $l(i[l], i));
          }), i;
        });
        function $w(i) {
          var s = i == null ? 0 : i.length, l = Me();
          return i = s ? ht(i, function(d) {
            if (typeof d[1] != "function")
              throw new Fn(u);
            return [l(d[0]), d[1]];
          }) : [], Fe(function(d) {
            for (var v = -1; ++v < s; ) {
              var M = i[v];
              if (wn(M[0], this, d))
                return wn(M[1], this, d);
            }
          });
        }
        function Ow(i) {
          return i_(Zn(i, g));
        }
        function Bl(i) {
          return function() {
            return i;
          };
        }
        function Nw(i, s) {
          return i == null || i !== i ? s : i;
        }
        var Rw = Xf(), zw = Xf(!0);
        function hn(i) {
          return i;
        }
        function Fl(i) {
          return If(typeof i == "function" ? i : Zn(i, g));
        }
        function Dw(i) {
          return kf(Zn(i, g));
        }
        function Lw(i, s) {
          return $f(i, Zn(s, g));
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
        function Ul(i, s, l) {
          var d = zt(s), v = ea(s, d);
          l == null && !(mt(s) && (v.length || !d.length)) && (l = s, s = i, i = this, v = ea(s, zt(s)));
          var M = !(mt(l) && "chain" in l) || !!l.chain, P = wr(i);
          return Bn(v, function(R) {
            var F = s[R];
            i[R] = F, P && (i.prototype[R] = function() {
              var Y = this.__chain__;
              if (M || Y) {
                var X = i(this.__wrapped__), ne = X.__actions__ = un(this.__actions__);
                return ne.push({ func: F, args: arguments, thisArg: i }), X.__chain__ = Y, X;
              }
              return F.apply(i, Lr([this.value()], arguments));
            });
          }), i;
        }
        function Uw() {
          return Ut._ === this && (Ut._ = d1), this;
        }
        function Zl() {
        }
        function Zw(i) {
          return i = Oe(i), Fe(function(s) {
            return Of(s, i);
          });
        }
        var qw = yl(ht), Gw = yl(Xh), Hw = yl(Gu);
        function Yd(i) {
          return El(i) ? Hu(ar(i)) : w_(i);
        }
        function Ww(i) {
          return function(s) {
            return i == null ? t : _i(i, s);
          };
        }
        var jw = td(), Vw = td(!0);
        function ql() {
          return [];
        }
        function Gl() {
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
          if (i = Oe(i), i < 1 || i > se)
            return [];
          var l = ve, d = Wt(i, ve);
          s = Me(s), i -= ve;
          for (var v = Vu(d, s); ++l < i; )
            s(l);
          return v;
        }
        function Xw(i) {
          return ke(i) ? ht(i, ar) : Sn(i) ? [i] : un(vd(Xe(i)));
        }
        function e5(i) {
          var s = ++h1;
          return Xe(i) + s;
        }
        var t5 = sa(function(i, s) {
          return i + s;
        }, 0), n5 = bl("ceil"), r5 = sa(function(i, s) {
          return i / s;
        }, 1), i5 = bl("floor");
        function o5(i) {
          return i && i.length ? Xs(i, hn, ol) : t;
        }
        function s5(i, s) {
          return i && i.length ? Xs(i, Me(s, 2), ol) : t;
        }
        function a5(i) {
          return nf(i, hn);
        }
        function u5(i, s) {
          return nf(i, Me(s, 2));
        }
        function l5(i) {
          return i && i.length ? Xs(i, hn, ll) : t;
        }
        function c5(i, s) {
          return i && i.length ? Xs(i, Me(s, 2), ll) : t;
        }
        var h5 = sa(function(i, s) {
          return i * s;
        }, 1), f5 = bl("round"), d5 = sa(function(i, s) {
          return i - s;
        }, 0);
        function p5(i) {
          return i && i.length ? ju(i, hn) : 0;
        }
        function g5(i, s) {
          return i && i.length ? ju(i, Me(s, 2)) : 0;
        }
        return w.after = D2, w.ary = Ad, w.assign = Sb, w.assignIn = Zd, w.assignInWith = ya, w.assignWith = Mb, w.at = Eb, w.before = Id, w.bind = $l, w.bindAll = kw, w.bindKey = Pd, w.castArray = K2, w.chain = Md, w.chunk = iy, w.compact = oy, w.concat = sy, w.cond = $w, w.conforms = Ow, w.constant = Bl, w.countBy = p2, w.create = Cb, w.curry = kd, w.curryRight = $d, w.debounce = Od, w.defaults = Ab, w.defaultsDeep = Ib, w.defer = L2, w.delay = B2, w.difference = ay, w.differenceBy = uy, w.differenceWith = ly, w.drop = cy, w.dropRight = hy, w.dropRightWhile = fy, w.dropWhile = dy, w.fill = py, w.filter = m2, w.flatMap = y2, w.flatMapDeep = b2, w.flatMapDepth = w2, w.flatten = wd, w.flattenDeep = gy, w.flattenDepth = my, w.flip = F2, w.flow = Rw, w.flowRight = zw, w.fromPairs = vy, w.functions = zb, w.functionsIn = Db, w.groupBy = x2, w.initial = yy, w.intersection = by, w.intersectionBy = wy, w.intersectionWith = xy, w.invert = Bb, w.invertBy = Fb, w.invokeMap = S2, w.iteratee = Fl, w.keyBy = M2, w.keys = zt, w.keysIn = cn, w.map = da, w.mapKeys = Zb, w.mapValues = qb, w.matches = Dw, w.matchesProperty = Lw, w.memoize = ga, w.merge = Gb, w.mergeWith = qd, w.method = Bw, w.methodOf = Fw, w.mixin = Ul, w.negate = ma, w.nthArg = Zw, w.omit = Hb, w.omitBy = Wb, w.once = U2, w.orderBy = E2, w.over = qw, w.overArgs = Z2, w.overEvery = Gw, w.overSome = Hw, w.partial = Ol, w.partialRight = Nd, w.partition = C2, w.pick = jb, w.pickBy = Gd, w.property = Yd, w.propertyOf = Ww, w.pull = Ey, w.pullAll = Td, w.pullAllBy = Cy, w.pullAllWith = Ay, w.pullAt = Iy, w.range = jw, w.rangeRight = Vw, w.rearg = q2, w.reject = P2, w.remove = Py, w.rest = G2, w.reverse = Pl, w.sampleSize = $2, w.set = Kb, w.setWith = Jb, w.shuffle = O2, w.slice = ky, w.sortBy = z2, w.sortedUniq = Ly, w.sortedUniqBy = By, w.split = yw, w.spread = H2, w.tail = Fy, w.take = Uy, w.takeRight = Zy, w.takeRightWhile = qy, w.takeWhile = Gy, w.tap = o2, w.throttle = W2, w.thru = fa, w.toArray = Bd, w.toPairs = Hd, w.toPairsIn = Wd, w.toPath = Xw, w.toPlainObject = Ud, w.transform = Yb, w.unary = j2, w.union = Hy, w.unionBy = Wy, w.unionWith = jy, w.uniq = Vy, w.uniqBy = Ky, w.uniqWith = Jy, w.unset = Qb, w.unzip = kl, w.unzipWith = Sd, w.update = Xb, w.updateWith = ew, w.values = ro, w.valuesIn = tw, w.without = Yy, w.words = Kd, w.wrap = V2, w.xor = Qy, w.xorBy = Xy, w.xorWith = e2, w.zip = t2, w.zipObject = n2, w.zipObjectDeep = r2, w.zipWith = i2, w.entries = Hd, w.entriesIn = Wd, w.extend = Zd, w.extendWith = ya, Ul(w, w), w.add = t5, w.attempt = Jd, w.camelCase = ow, w.capitalize = jd, w.ceil = n5, w.clamp = nw, w.clone = J2, w.cloneDeep = Q2, w.cloneDeepWith = X2, w.cloneWith = Y2, w.conformsTo = eb, w.deburr = Vd, w.defaultTo = Nw, w.divide = r5, w.endsWith = sw, w.eq = tr, w.escape = aw, w.escapeRegExp = uw, w.every = g2, w.find = v2, w.findIndex = yd, w.findKey = Pb, w.findLast = _2, w.findLastIndex = bd, w.findLastKey = kb, w.floor = i5, w.forEach = Ed, w.forEachRight = Cd, w.forIn = $b, w.forInRight = Ob, w.forOwn = Nb, w.forOwnRight = Rb, w.get = zl, w.gt = tb, w.gte = nb, w.has = Lb, w.hasIn = Dl, w.head = xd, w.identity = hn, w.includes = T2, w.indexOf = _y, w.inRange = rw, w.invoke = Ub, w.isArguments = wi, w.isArray = ke, w.isArrayBuffer = rb, w.isArrayLike = ln, w.isArrayLikeObject = Et, w.isBoolean = ib, w.isBuffer = Hr, w.isDate = ob, w.isElement = sb, w.isEmpty = ab, w.isEqual = ub, w.isEqualWith = lb, w.isError = Nl, w.isFinite = cb, w.isFunction = wr, w.isInteger = Rd, w.isLength = va, w.isMap = zd, w.isMatch = hb, w.isMatchWith = fb, w.isNaN = db, w.isNative = pb, w.isNil = mb, w.isNull = gb, w.isNumber = Dd, w.isObject = mt, w.isObjectLike = Tt, w.isPlainObject = qo, w.isRegExp = Rl, w.isSafeInteger = vb, w.isSet = Ld, w.isString = _a, w.isSymbol = Sn, w.isTypedArray = no, w.isUndefined = _b, w.isWeakMap = yb, w.isWeakSet = bb, w.join = Ty, w.kebabCase = lw, w.last = Gn, w.lastIndexOf = Sy, w.lowerCase = cw, w.lowerFirst = hw, w.lt = wb, w.lte = xb, w.max = o5, w.maxBy = s5, w.mean = a5, w.meanBy = u5, w.min = l5, w.minBy = c5, w.stubArray = ql, w.stubFalse = Gl, w.stubObject = Kw, w.stubString = Jw, w.stubTrue = Yw, w.multiply = h5, w.nth = My, w.noConflict = Uw, w.noop = Zl, w.now = pa, w.pad = fw, w.padEnd = dw, w.padStart = pw, w.parseInt = gw, w.random = iw, w.reduce = A2, w.reduceRight = I2, w.repeat = mw, w.replace = vw, w.result = Vb, w.round = f5, w.runInContext = B, w.sample = k2, w.size = N2, w.snakeCase = _w, w.some = R2, w.sortedIndex = $y, w.sortedIndexBy = Oy, w.sortedIndexOf = Ny, w.sortedLastIndex = Ry, w.sortedLastIndexBy = zy, w.sortedLastIndexOf = Dy, w.startCase = bw, w.startsWith = ww, w.subtract = d5, w.sum = p5, w.sumBy = g5, w.template = xw, w.times = Qw, w.toFinite = xr, w.toInteger = Oe, w.toLength = Fd, w.toLower = Tw, w.toNumber = Hn, w.toSafeInteger = Tb, w.toString = Xe, w.toUpper = Sw, w.trim = Mw, w.trimEnd = Ew, w.trimStart = Cw, w.truncate = Aw, w.unescape = Iw, w.uniqueId = e5, w.upperCase = Pw, w.upperFirst = Ll, w.each = Ed, w.eachRight = Cd, w.first = xd, Ul(w, function() {
          var i = {};
          return or(w, function(s, l) {
            et.call(w.prototype, l) || (i[l] = s);
          }), i;
        }(), { chain: !1 }), w.VERSION = r, Bn(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(i) {
          w[i].placeholder = w;
        }), Bn(["drop", "take"], function(i, s) {
          Ge.prototype[i] = function(l) {
            l = l === t ? 1 : kt(Oe(l), 0);
            var d = this.__filtered__ && !s ? new Ge(this) : this.clone();
            return d.__filtered__ ? d.__takeCount__ = Wt(l, d.__takeCount__) : d.__views__.push({
              size: Wt(l, ve),
              type: i + (d.__dir__ < 0 ? "Right" : "")
            }), d;
          }, Ge.prototype[i + "Right"] = function(l) {
            return this.reverse()[i](l).reverse();
          };
        }), Bn(["filter", "map", "takeWhile"], function(i, s) {
          var l = s + 1, d = l == Le || l == He;
          Ge.prototype[i] = function(v) {
            var M = this.clone();
            return M.__iteratees__.push({
              iteratee: Me(v, 3),
              type: l
            }), M.__filtered__ = M.__filtered__ || d, M;
          };
        }), Bn(["head", "last"], function(i, s) {
          var l = "take" + (s ? "Right" : "");
          Ge.prototype[i] = function() {
            return this[l](1).value()[0];
          };
        }), Bn(["initial", "tail"], function(i, s) {
          var l = "drop" + (s ? "" : "Right");
          Ge.prototype[i] = function() {
            return this.__filtered__ ? new Ge(this) : this[l](1);
          };
        }), Ge.prototype.compact = function() {
          return this.filter(hn);
        }, Ge.prototype.find = function(i) {
          return this.filter(i).head();
        }, Ge.prototype.findLast = function(i) {
          return this.reverse().find(i);
        }, Ge.prototype.invokeMap = Fe(function(i, s) {
          return typeof i == "function" ? new Ge(this) : this.map(function(l) {
            return Do(l, i, s);
          });
        }), Ge.prototype.reject = function(i) {
          return this.filter(ma(Me(i)));
        }, Ge.prototype.slice = function(i, s) {
          i = Oe(i);
          var l = this;
          return l.__filtered__ && (i > 0 || s < 0) ? new Ge(l) : (i < 0 ? l = l.takeRight(-i) : i && (l = l.drop(i)), s !== t && (s = Oe(s), l = s < 0 ? l.dropRight(-s) : l.take(s - i)), l);
        }, Ge.prototype.takeRightWhile = function(i) {
          return this.reverse().takeWhile(i).reverse();
        }, Ge.prototype.toArray = function() {
          return this.take(ve);
        }, or(Ge.prototype, function(i, s) {
          var l = /^(?:filter|find|map|reject)|While$/.test(s), d = /^(?:head|last)$/.test(s), v = w[d ? "take" + (s == "last" ? "Right" : "") : s], M = d || /^find/.test(s);
          v && (w.prototype[s] = function() {
            var P = this.__wrapped__, R = d ? [1] : arguments, F = P instanceof Ge, Y = R[0], X = F || ke(P), ne = function(Ze) {
              var We = v.apply(w, Lr([Ze], R));
              return d && ue ? We[0] : We;
            };
            X && l && typeof Y == "function" && Y.length != 1 && (F = X = !1);
            var ue = this.__chain__, _e = !!this.__actions__.length, Ee = M && !ue, De = F && !_e;
            if (!M && X) {
              P = De ? P : new Ge(this);
              var Ce = i.apply(P, R);
              return Ce.__actions__.push({ func: fa, args: [ne], thisArg: t }), new Un(Ce, ue);
            }
            return Ee && De ? i.apply(this, R) : (Ce = this.thru(ne), Ee ? d ? Ce.value()[0] : Ce.value() : Ce);
          });
        }), Bn(["pop", "push", "shift", "sort", "splice", "unshift"], function(i) {
          var s = Ls[i], l = /^(?:push|sort|unshift)$/.test(i) ? "tap" : "thru", d = /^(?:pop|shift)$/.test(i);
          w.prototype[i] = function() {
            var v = arguments;
            if (d && !this.__chain__) {
              var M = this.value();
              return s.apply(ke(M) ? M : [], v);
            }
            return this[l](function(P) {
              return s.apply(ke(P) ? P : [], v);
            });
          };
        }), or(Ge.prototype, function(i, s) {
          var l = w[s];
          if (l) {
            var d = l.name + "";
            et.call(Yi, d) || (Yi[d] = []), Yi[d].push({ name: s, func: l });
          }
        }), Yi[oa(t, S).name] = [{
          name: "wrapper",
          func: t
        }], Ge.prototype.clone = I1, Ge.prototype.reverse = P1, Ge.prototype.value = k1, w.prototype.at = s2, w.prototype.chain = a2, w.prototype.commit = u2, w.prototype.next = l2, w.prototype.plant = h2, w.prototype.reverse = f2, w.prototype.toJSON = w.prototype.valueOf = w.prototype.value = d2, w.prototype.first = w.prototype.head, Po && (w.prototype[Po] = c2), w;
      }, Vi = u1();
      di ? ((di.exports = Vi)._ = Vi, Fu._ = Vi) : Ut._ = Vi;
    }).call(gA);
  }(Jo, Jo.exports)), Jo.exports;
}
var Vn = mA();
const vA = /* @__PURE__ */ Ms(Vn);
class _A {
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
const Mi = class Mi {
  constructor(e) {
    ba(this, vs);
    ba(this, _s);
    this.config = e, this.layers = e.layers, Vl(this, vs, Xa.parse({})), Vl(this, _s, Gc.parse({})), this.config.graph.addDefaultStyle && this.layers.unshift({
      node: {
        selector: "",
        style: Xa.parse(KC)
      },
      edge: {
        selector: "",
        style: Gc.parse(jC)
      }
    });
  }
  static fromJson(e) {
    const t = JSON.parse(e);
    return this.fromObject(t);
  }
  static fromObject(e) {
    const t = dA.parse(e);
    return new Mi(t);
  }
  static async fromUrl(e) {
    const t = await fetch(e);
    if (!t.body)
      throw new Error("JSON response had no body");
    const r = await t.json();
    return Mi.fromObject(r);
  }
  static default() {
    return Mi.fromObject({
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
      I0(a, e) && (a != null && a.style) && t.unshift(a.style);
    }
    const r = Vn.defaultsDeep({}, ...t, jl(this, vs));
    return t.length === 0 && (r.enabled = !1), Mi.getNodeIdForStyle(r);
  }
  getCalculatedStylesForNode(e) {
    const t = [];
    for (const r of this.layers) {
      const { node: o } = r;
      if (I0(o, e) && (o != null && o.calculatedStyle)) {
        const { inputs: u, output: h, expr: c } = o.calculatedStyle, f = new _A(u, h, c);
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
    const r = Vn.defaultsDeep({}, ...t, jl(this, _s));
    return t.length === 0 && (r.enabled = !1), Mi.getEdgeIdForStyle(r);
  }
  static getStyleForNodeStyleId(e) {
    const t = E0.get(e);
    if (!t)
      throw new TypeError(`couldn't find NodeStyleId: ${e}`);
    return t;
  }
  static getStyleForEdgeStyleId(e) {
    const t = C0.get(e);
    if (!t)
      throw new TypeError(`couldn't find NodeStyleId: ${e}`);
    return t;
  }
  static getNodeIdForStyle(e) {
    return A0(E0, e);
  }
  static getEdgeIdForStyle(e) {
    return A0(C0, e);
  }
};
vs = new WeakMap(), _s = new WeakMap();
let jn = Mi;
const E0 = /* @__PURE__ */ new Map(), C0 = /* @__PURE__ */ new Map();
function A0(n, e) {
  let t;
  for (const [r, o] of n.entries())
    if (Vn.isEqual(o, e)) {
      t = r;
      break;
    }
  return t === void 0 && (t = n.size, n.set(t, e)), t;
}
function I0(n, e) {
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
    var p;
    this.arrowMesh = null, this.label = null, this.parentGraph = e, this.srcId = t, this.dstId = r, this.id = `${t}:${r}`, this.data = a, this.opts = u;
    const h = e.nodeCache.get(t);
    if (!h)
      throw new Error(`Attempting to create edge '${t}->${r}', Node '${t}' hasn't been created yet.`);
    const c = e.nodeCache.get(r);
    if (!c)
      throw new Error(`Attempting to create edge '${t}->${r}', Node '${r}' hasn't been created yet.`);
    this.srcNode = h, this.dstNode = c, this.ray = new b5(this.srcNode.mesh.position, this.dstNode.mesh.position), this.styleId = o, this.parentGraph.layoutEngine.addEdge(this), this.mesh = rr.defaultEdgeMeshFactory(this, this.parentGraph, this.styleId);
    const f = jn.getStyleForEdgeStyleId(this.styleId);
    (p = f.label) != null && p.enabled && (this.label = rr.createLabel(this, f));
  }
  update() {
    const e = this.parentGraph.layoutEngine.getEdgePosition(this), { srcPoint: t, dstPoint: r } = this.transformArrowCap();
    if (t && r ? this.transformEdgeMesh(
      t,
      r
    ) : this.transformEdgeMesh(
      new $t(e.src.x, e.src.y, e.src.z),
      new $t(e.dst.x, e.dst.y, e.dst.z)
    ), this.label) {
      const o = new $t(
        (e.src.x + e.dst.x) / 2,
        (e.src.y + e.dst.y) / 2,
        ((e.src.z ?? 0) + (e.dst.z ?? 0)) / 2
      );
      this.label.attachTo(o, "center", 0);
    }
  }
  updateStyle(e) {
    var r;
    if (e === this.styleId)
      return;
    this.styleId = e, this.mesh.dispose(), this.mesh = rr.defaultEdgeMeshFactory(this, this.parentGraph, e);
    const t = jn.getStyleForEdgeStyleId(e);
    (r = t.label) != null && r.enabled ? (this.label && this.label.dispose(), this.label = rr.createLabel(this, t)) : this.label && (this.label.dispose(), this.label = null);
  }
  static updateRays(e) {
    var t;
    if (e.needRays) {
      for (const r of e.layoutEngine.edges) {
        const o = r.srcNode.mesh, a = r.dstNode.mesh, u = jn.getStyleForEdgeStyleId(r.styleId);
        ((t = u.arrowHead) == null ? void 0 : t.type) === void 0 || u.arrowHead.type === "none" || (r.ray.position = a.position, r.ray.direction = a.position.subtract(o.position));
      }
      e.scene.render();
    }
  }
  static defaultEdgeMeshFactory(e, t, r) {
    const o = jn.getStyleForEdgeStyleId(r);
    o.arrowHead && o.arrowHead.type !== "none" && (e.arrowMesh = t.meshCache.get(`edge-arrowhead-style-${r}`, () => {
      var f, p, g;
      const u = yA(((f = o.line) == null ? void 0 : f.width) ?? 0.25), h = P0(((p = o.line) == null ? void 0 : p.width) ?? 0.25), c = w5.GetArrowCap(
        new $t(0, 0, -h),
        // position
        new $t(0, 0, 1),
        // direction
        h,
        // length
        u,
        // widthUp
        u
        // widthDown
      );
      return Kl(
        "lines",
        {
          points: c.points,
          widths: c.widths,
          widthDistribution: x5.WIDTH_DISTRIBUTION_START
          // instance: line,
        },
        {
          color: Er.FromHexString(((g = o.line) == null ? void 0 : g.color) ?? "#FFFFFF")
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
    return Kl(
      "edge-plain",
      {
        points: rr.unitVectorPoints
      },
      {
        color: Er.FromHexString(((o = r.line) == null ? void 0 : o.color) ?? "#FFFFFF"),
        width: ((a = r.line) == null ? void 0 : a.width) ?? 0.25
      }
    );
  }
  static createMovingLine(e, t, r) {
    var C, S;
    const o = Er.FromHexString("#D3D3D3"), a = Er.FromHexString(((C = r.line) == null ? void 0 : C.color) ?? "#FF0000"), u = Math.floor(o.r * 255), h = Math.floor(o.g * 255), c = Math.floor(o.b * 255), f = Math.floor(a.r * 255), p = Math.floor(a.g * 255), g = Math.floor(a.b * 255), m = new Uint8Array([u, h, c, f, p, g]), b = new np(
      m,
      // data
      m.length / 3,
      // width
      1,
      // height
      Ha.TEXTUREFORMAT_RGB,
      // format
      t.scene,
      // sceneOrEngine
      !1,
      // generateMipMaps
      !0,
      // invertY
      Ha.TEXTURE_NEAREST_NEAREST
      // samplingMode
      // samplingMode
      // type
      // creationFlags
      // useSRGBBuffer
    );
    b.wrapU = np.WRAP_ADDRESSMODE, b.name = "moving-texture";
    const _ = Kl(
      "edge-moving",
      {
        points: rr.unitVectorPoints
      },
      {
        // color: Color3.FromHexString(colorNameToHex(edgeColor))
        width: ((S = r.line) == null ? void 0 : S.width) ?? 0.25,
        colorMode: T5.COLOR_MODE_MULTIPLY
      }
    ), $ = _.material;
    return $.emissiveTexture = b, $.disableLighting = !0, b.uScale = 5, t.scene.onBeforeRenderObservable.add(() => {
      b.uOffset -= 0.04 * t.scene.getAnimationRatio();
    }), _;
  }
  transformEdgeMesh(e, t) {
    const r = t.subtract(e), o = new $t(
      e.x + r.x / 2,
      e.y + r.y / 2,
      e.z + r.z / 2
    ), a = r.length();
    this.mesh.position = o, this.mesh.lookAt(t), this.mesh.scaling.z = a;
  }
  transformArrowCap() {
    if (this.arrowMesh) {
      this.parentGraph.stats.arrowCapUpdate.beginMonitoring();
      const { srcPoint: e, dstPoint: t, newEndPoint: r } = this.getInterceptPoints();
      if (!e || !t || !r)
        throw new Error("Internal Error: mesh intercept points not found");
      return this.arrowMesh.position = t, this.arrowMesh.lookAt(this.dstNode.mesh.position), this.parentGraph.stats.arrowCapUpdate.endMonitoring(), {
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
    var c;
    const e = this.srcNode.mesh, t = this.dstNode.mesh;
    this.parentGraph.stats.intersectCalc.beginMonitoring();
    const r = this.ray.intersectsMeshes([t]), o = this.ray.intersectsMeshes([e]);
    this.parentGraph.stats.intersectCalc.endMonitoring();
    let a = null, u = null, h = null;
    if (r.length && o.length) {
      const f = jn.getStyleForEdgeStyleId(this.styleId), p = P0(((c = f.line) == null ? void 0 : c.width) ?? 0.25);
      if (u = r[0].pickedPoint, a = o[0].pickedPoint, !a || !u)
        throw new TypeError("error picking points");
      const g = a.subtract(u).length(), m = g - p, { x: b, y: _, z: $ } = a, { x: C, y: S, z: I } = u, T = b + m / g * (C - b), A = _ + m / g * (S - _), N = $ + m / g * (I - $);
      h = new $t(T, A, N);
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
    var h, c, f, p, g, m, b, _, $, C, S, I, T, A, N, D, L, q, oe, be, ge, pe, Je, Le, rt, He, te, se, re, ce, ve, xe, Re, Ve, ae, ee, U, W, J, he, we, Ue, wt, $e, tt, Nt, xt, On, Se, Ft, Qe, yn;
    let r = e.id;
    const o = t.label;
    if (o.text !== void 0 && o.text !== null)
      (typeof o.text == "string" || typeof o.text == "number" || typeof o.text == "boolean") && (r = String(o.text));
    else if (o.textPath && typeof o.textPath == "string")
      try {
        const Nn = Gm.search(e.data, o.textPath);
        Nn != null && (r = String(Nn));
      } catch {
      }
    const a = {
      text: r
    };
    return ((h = t.label) == null ? void 0 : h.font) !== void 0 && (a.font = t.label.font), ((c = t.label) == null ? void 0 : c.fontSize) !== void 0 && (a.fontSize = t.label.fontSize), ((f = t.label) == null ? void 0 : f.fontWeight) !== void 0 && (a.fontWeight = t.label.fontWeight), ((p = t.label) == null ? void 0 : p.lineHeight) !== void 0 && (a.lineHeight = t.label.lineHeight), ((g = t.label) == null ? void 0 : g.textColor) !== void 0 && (a.textColor = t.label.textColor), ((m = t.label) == null ? void 0 : m.backgroundColor) !== void 0 && (a.backgroundColor = t.label.backgroundColor), ((b = t.label) == null ? void 0 : b.borderWidth) !== void 0 && (a.borderWidth = t.label.borderWidth), ((_ = t.label) == null ? void 0 : _.borderColor) !== void 0 && (a.borderColor = t.label.borderColor), (($ = t.label) == null ? void 0 : $.borders) !== void 0 && (a.borders = t.label.borders), ((C = t.label) == null ? void 0 : C.marginTop) !== void 0 && (a.marginTop = t.label.marginTop), ((S = t.label) == null ? void 0 : S.marginBottom) !== void 0 && (a.marginBottom = t.label.marginBottom), ((I = t.label) == null ? void 0 : I.marginLeft) !== void 0 && (a.marginLeft = t.label.marginLeft), ((T = t.label) == null ? void 0 : T.marginRight) !== void 0 && (a.marginRight = t.label.marginRight), ((A = t.label) == null ? void 0 : A.textAlign) !== void 0 && (a.textAlign = t.label.textAlign), ((N = t.label) == null ? void 0 : N.cornerRadius) !== void 0 && (a.cornerRadius = t.label.cornerRadius), ((D = t.label) == null ? void 0 : D.autoSize) !== void 0 && (a.autoSize = t.label.autoSize), ((L = t.label) == null ? void 0 : L.resolution) !== void 0 && (a.resolution = t.label.resolution), ((q = t.label) == null ? void 0 : q.billboardMode) !== void 0 && (a.billboardMode = t.label.billboardMode), ((oe = t.label) == null ? void 0 : oe.depthFadeEnabled) !== void 0 && (a.depthFadeEnabled = t.label.depthFadeEnabled), ((be = t.label) == null ? void 0 : be.depthFadeNear) !== void 0 && (a.depthFadeNear = t.label.depthFadeNear), ((ge = t.label) == null ? void 0 : ge.depthFadeFar) !== void 0 && (a.depthFadeFar = t.label.depthFadeFar), ((pe = t.label) == null ? void 0 : pe.textOutline) !== void 0 && (a.textOutline = t.label.textOutline), ((Je = t.label) == null ? void 0 : Je.textOutlineWidth) !== void 0 && (a.textOutlineWidth = t.label.textOutlineWidth), ((Le = t.label) == null ? void 0 : Le.textOutlineColor) !== void 0 && (a.textOutlineColor = t.label.textOutlineColor), ((rt = t.label) == null ? void 0 : rt.textOutlineJoin) !== void 0 && (a.textOutlineJoin = t.label.textOutlineJoin), ((He = t.label) == null ? void 0 : He.textShadow) !== void 0 && (a.textShadow = t.label.textShadow), ((te = t.label) == null ? void 0 : te.textShadowColor) !== void 0 && (a.textShadowColor = t.label.textShadowColor), ((se = t.label) == null ? void 0 : se.textShadowBlur) !== void 0 && (a.textShadowBlur = t.label.textShadowBlur), ((re = t.label) == null ? void 0 : re.textShadowOffsetX) !== void 0 && (a.textShadowOffsetX = t.label.textShadowOffsetX), ((ce = t.label) == null ? void 0 : ce.textShadowOffsetY) !== void 0 && (a.textShadowOffsetY = t.label.textShadowOffsetY), ((ve = t.label) == null ? void 0 : ve.backgroundPadding) !== void 0 && (a.backgroundPadding = t.label.backgroundPadding), ((xe = t.label) == null ? void 0 : xe.backgroundGradient) !== void 0 && (a.backgroundGradient = t.label.backgroundGradient), ((Re = t.label) == null ? void 0 : Re.backgroundGradientType) !== void 0 && (a.backgroundGradientType = t.label.backgroundGradientType), ((Ve = t.label) == null ? void 0 : Ve.backgroundGradientColors) !== void 0 && (a.backgroundGradientColors = t.label.backgroundGradientColors), ((ae = t.label) == null ? void 0 : ae.backgroundGradientDirection) !== void 0 && (a.backgroundGradientDirection = t.label.backgroundGradientDirection), ((ee = t.label) == null ? void 0 : ee.pointer) !== void 0 && (a.pointer = t.label.pointer), ((U = t.label) == null ? void 0 : U.pointerDirection) !== void 0 && (a.pointerDirection = t.label.pointerDirection), ((W = t.label) == null ? void 0 : W.pointerWidth) !== void 0 && (a.pointerWidth = t.label.pointerWidth), ((J = t.label) == null ? void 0 : J.pointerHeight) !== void 0 && (a.pointerHeight = t.label.pointerHeight), ((he = t.label) == null ? void 0 : he.pointerOffset) !== void 0 && (a.pointerOffset = t.label.pointerOffset), ((we = t.label) == null ? void 0 : we.pointerCurve) !== void 0 && (a.pointerCurve = t.label.pointerCurve), ((Ue = t.label) == null ? void 0 : Ue.animation) !== void 0 && (a.animation = t.label.animation), ((wt = t.label) == null ? void 0 : wt.animationSpeed) !== void 0 && (a.animationSpeed = t.label.animationSpeed), (($e = t.label) == null ? void 0 : $e.badge) !== void 0 && (a.badge = t.label.badge), ((tt = t.label) == null ? void 0 : tt.icon) !== void 0 && (a.icon = t.label.icon), ((Nt = t.label) == null ? void 0 : Nt.iconPosition) !== void 0 && (a.iconPosition = t.label.iconPosition), ((xt = t.label) == null ? void 0 : xt.progress) !== void 0 && (a.progress = t.label.progress), ((On = t.label) == null ? void 0 : On.smartOverflow) !== void 0 && (a.smartOverflow = t.label.smartOverflow), ((Se = t.label) == null ? void 0 : Se.maxNumber) !== void 0 && (a.maxNumber = t.label.maxNumber), ((Ft = t.label) == null ? void 0 : Ft.overflowSuffix) !== void 0 && (a.overflowSuffix = t.label.overflowSuffix), a.attachPosition = ((Qe = t.label) == null ? void 0 : Qe.location) ?? "center", a.attachOffset = ((yn = t.label) == null ? void 0 : yn.attachOffset) ?? 0, new eu(e.parentGraph.scene, a);
  }
}
function yA(n) {
  return Math.max(20 * n, 4);
}
function P0(n) {
  return Math.max(n, 0.5);
}
class bA {
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
const wA = Ie({
  path: qe().default("nodes"),
  schema: Zm().or(Ke()).default(null)
}).prefault({}), xA = Ie({
  path: qe().default("edges"),
  schema: Zm().or(Ke()).default(null)
}).prefault({}), TA = $i({
  data: qe(),
  node: wA,
  edge: xA
}), qh = class qh extends kh {
  constructor(e) {
    super();
    const t = TA.parse(e);
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
qh.type = "json";
let Wc = qh;
kh.register(Wc);
const tu = {
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
      t.push(...tu.array(n));
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
    return n.map((t) => tu.mean(t));
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
function Pn(n) {
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
function $h(n, e = null, t = 2, r = null) {
  const o = Kn(n, e, t), a = Pn(o.G);
  e = o.center;
  const u = new fs(r ?? void 0), h = {};
  return a.forEach((c) => {
    h[c] = u.rand(t).map((f, p) => f + e[p]);
  }), h;
}
function Hm(n, e = 1, t = null, r = 2) {
  if (r < 2)
    throw new Error("cannot handle dimensions < 2");
  const o = Kn(n, t, r), a = Pn(o.G);
  t = o.center;
  const u = {};
  if (a.length === 0)
    return u;
  if (a.length === 1)
    return u[a[0]] = t, u;
  const h = tu.linspace(0, 2 * Math.PI, a.length + 1).slice(0, -1);
  return a.forEach((c, f) => {
    const p = Math.cos(h[f]) * e + t[0], g = Math.sin(h[f]) * e + t[1];
    u[c] = Array(r).fill(0).map((m, b) => b === 0 ? p : b === 1 ? g : 0);
  }), u;
}
function SA(n, e = null, t = 1, r = null, o = 2) {
  if (o !== 2)
    throw new Error("can only handle 2 dimensions");
  const a = Kn(n, r, o), u = Pn(a.G);
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
  for (let p = 0; p < e.length; p++) {
    const g = e[p];
    if (g.length === 0 || g.length === 1 && p === 0)
      continue;
    const m = tu.linspace(0, 2 * Math.PI, g.length + 1).slice(0, -1);
    g.forEach((b, _) => {
      const $ = Math.cos(m[_]) * f + r[0], C = Math.sin(m[_]) * f + r[1];
      h[b] = [$, C];
    }), f += c;
  }
  return h;
}
function MA(n, e = null, t = null, r = null, o = 50, a = 1, u = null, h = 2, c = null) {
  return EA(n, e, t, r, o, a, u, h, c);
}
function EA(n, e = null, t = null, r = null, o = 50, a = 1, u = null, h = 2, c = null) {
  const f = Kn(n, u, h);
  let p = f.G;
  u = f.center;
  const g = Pn(p), m = ku(p);
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
        const I = new fs(c ?? void 0);
        b[S] = I.rand(h);
      }
  else {
    const S = new fs(c ?? void 0);
    for (const I of g)
      b[I] = S.rand(h);
  }
  const _ = new Set(r || []);
  e || (e = 1 / Math.sqrt(g.length));
  let $ = 0.1;
  const C = $ / (o + 1);
  for (let S = 0; S < o; S++) {
    const I = {};
    for (const T of g)
      I[T] = Array(h).fill(0);
    for (let T = 0; T < g.length; T++) {
      const A = g[T];
      for (let N = T + 1; N < g.length; N++) {
        const D = g[N], L = b[A].map((be, ge) => be - b[D][ge]), q = Math.sqrt(L.reduce((be, ge) => be + ge * ge, 0)) || 0.1, oe = e * e / q;
        for (let be = 0; be < h; be++) {
          const ge = L[be] / q;
          I[A][be] += ge * oe, I[D][be] -= ge * oe;
        }
      }
    }
    for (const [T, A] of m) {
      const N = b[T].map((q, oe) => q - b[A][oe]), D = Math.sqrt(N.reduce((q, oe) => q + oe * oe, 0)) || 0.1, L = D * D / e;
      for (let q = 0; q < h; q++) {
        const oe = N[q] / D;
        I[T][q] -= oe * L, I[A][q] += oe * L;
      }
    }
    for (const T of g) {
      if (_.has(T)) continue;
      const A = Math.sqrt(I[T].reduce((D, L) => D + L * L, 0)), N = Math.min(A, $);
      for (let D = 0; D < h; D++) {
        const L = A === 0 ? 0 : I[T][D] / A;
        b[T][D] += L * N;
      }
    }
    $ -= C;
  }
  return r || (b = ii(b, a, u)), b;
}
function CA(n, e = 1, t = null, r = 2) {
  const o = Kn(n, t, r), a = o.G;
  t = o.center;
  const u = Pn(a);
  if (u.length <= 2)
    return u.length === 0 ? {} : u.length === 1 ? { [u[0]]: t } : {
      [u[0]]: t.map((C) => C - e),
      [u[1]]: t.map((C) => C + e)
    };
  const h = u.length, c = {};
  u.forEach((C, S) => {
    c[C] = S;
  });
  const f = Array(h).fill(0).map(() => Array(h).fill(0)), p = ku(a);
  for (const [C, S] of p) {
    const I = c[C], T = c[S];
    f[I][T] = 1, f[T][I] = 1;
  }
  const g = Array(h).fill(0).map(() => Array(h).fill(0));
  for (let C = 0; C < h; C++) {
    g[C][C] = f[C].reduce((S, I) => S + I, 0);
    for (let S = 0; S < h; S++)
      g[C][S] -= f[C][S];
  }
  const m = [];
  for (let C = 0; C < r; C++) {
    let S = Array(h).fill(0).map(() => Math.random() - 0.5);
    for (const T of m) {
      const A = S.reduce((N, D, L) => N + D * T[L], 0);
      S = S.map((N, D) => N - A * T[D]);
    }
    const I = Math.sqrt(S.reduce((T, A) => T + A * A, 0));
    S = S.map((T) => T / I);
    for (let T = 0; T < 100; T++) {
      const A = Array(h).fill(0);
      for (let L = 0; L < h; L++)
        for (let q = 0; q < h; q++)
          A[L] += g[L][q] * S[q];
      const N = A.reduce((L, q) => L + q, 0) / h;
      A.forEach((L, q, oe) => {
        oe[q] = L - N;
      });
      const D = Math.sqrt(A.reduce((L, q) => L + q * q, 0));
      D < 1e-10 || (S = A.map((L) => L / D));
    }
    m.push(S);
  }
  const b = Array(h).fill(0).map(() => Array(r).fill(0));
  for (let C = 0; C < h; C++)
    for (let S = 0; S < r; S++)
      b[C][S] = m[S][C];
  const _ = ii(b, e), $ = {};
  return u.forEach((C, S) => {
    $[C] = _[S].map((I, T) => I + t[T]);
  }), $;
}
function AA(n, e = 1, t = null, r = 2, o = 0.35, a = !1) {
  if (r !== 2)
    throw new Error("can only handle 2 dimensions");
  const u = Kn(n, t || [0, 0], r), h = Pn(u.G);
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
    for (let $ = 0; $ < h.length; $++) {
      const C = 0.5 * _;
      _ += 1 / C, f.push([Math.cos(_) * C, Math.sin(_) * C]);
    }
  } else {
    const m = Array.from({ length: h.length }, (_, $) => parseFloat(String($))), b = m.map((_) => o * _);
    f = m.map((_, $) => [
      Math.cos(b[$]) * _,
      Math.sin(b[$]) * _
    ]);
  }
  const p = [];
  for (let m = 0; m < f.length; m++)
    p.push(f[m]);
  const g = ii(p, e);
  for (let m = 0; m < g.length; m++)
    g[m][0] += t[0], g[m][1] += t[1];
  for (let m = 0; m < h.length; m++)
    c[h[m]] = g[m];
  return c;
}
function ii(n, e = 1, t = [0, 0]) {
  if (Array.isArray(n)) {
    if (n.length === 0) return [];
  } else if (Object.keys(n).length === 0) return {};
  const r = Array.isArray(n) ? n : Object.values(n), o = r[0].length, a = Array(o).fill(0);
  for (const p of r)
    for (let g = 0; g < o; g++)
      a[g] += p[g] / r.length;
  let u = {};
  if (Array.isArray(n))
    u = n.map((p) => p.map((g, m) => g - a[m]));
  else
    for (const [p, g] of Object.entries(n))
      u[p] = g.map((m, b) => m - a[b]);
  let h = 0;
  const c = Array.isArray(u) ? u : Object.values(u);
  for (const p of c) {
    const g = Math.sqrt(p.reduce((m, b) => m + b * b, 0));
    h = Math.max(h, g);
  }
  let f = Array.isArray(n) ? [] : {};
  if (h > 0) {
    const p = e / h;
    if (Array.isArray(n))
      f = u.map(
        (g) => g.map((m, b) => m * p + t[b])
      );
    else
      for (const [g, m] of Object.entries(u))
        f[g] = m.map((b, _) => b * p + t[_]);
  } else if (Array.isArray(n))
    f = Array(n.length).fill(0).map(() => [...t]);
  else
    for (const p of Object.keys(n))
      f[p] = [...t];
  return f;
}
function IA(n, e = null, t = "vertical", r = 1, o = null, a = 4 / 3) {
  if (t !== "vertical" && t !== "horizontal")
    throw new Error("align must be either vertical or horizontal");
  const u = Kn(n, o || [0, 0], 2), h = u.G;
  o = u.center;
  const c = Pn(h);
  if (c.length === 0)
    return {};
  e || (e = c.filter((I, T) => T % 2 === 0));
  const f = new Set(e), p = new Set(c.filter((I) => !f.has(I))), g = 1, m = a * g, b = [m / 2, g / 2], _ = {}, $ = [...f];
  $.forEach((I, T) => {
    const N = T * g / ($.length || 1);
    _[I] = [0, N];
  });
  const C = [...p];
  C.forEach((I, T) => {
    const A = m, N = T * g / (C.length || 1);
    _[I] = [A, N];
  });
  for (const I in _)
    _[I][0] -= b[0], _[I][1] -= b[1];
  const S = ii(_, r, o);
  if (t === "horizontal")
    for (const I in S) {
      const T = S[I][0];
      S[I][0] = S[I][1], S[I][1] = T;
    }
  return S;
}
function Wm(n, e = "subset", t = "vertical", r = 1, o = null) {
  if (t !== "vertical" && t !== "horizontal")
    throw new Error("align must be either vertical or horizontal");
  const a = Kn(n, o || [0, 0], 2), u = a.G;
  o = a.center;
  const h = Pn(u);
  if (h.length === 0)
    return {};
  let c = {};
  if (typeof e == "string")
    console.warn("Using string subsetKey requires node attributes, using default partitioning"), c = { 0: h };
  else
    for (const [g, m] of Object.entries(e))
      Array.isArray(m) ? c[g] = m : c[g] = [m];
  const f = Object.keys(c).length;
  let p = {};
  if (Object.entries(c).forEach(([g, m], b) => {
    const _ = Array.isArray(m) ? m : [m], $ = _.length;
    _.forEach((C, S) => {
      const I = b - (f - 1) / 2, T = S - ($ - 1) / 2;
      p[C] = [I, T];
    });
  }), p = ii(p, r, o), t === "horizontal")
    for (const g in p) {
      const m = p[g][0];
      p[g][0] = p[g][1], p[g][1] = m;
    }
  return p;
}
function PA(n, e, t = "vertical", r = 1, o = null) {
  const a = Kn(n, o || [0, 0], 2), u = a.G;
  o = a.center;
  const h = Pn(u);
  if (h.length === 0)
    return {};
  const c = {}, f = /* @__PURE__ */ new Set();
  let p = 0;
  for (c[p] = [e], f.add(e); Object.values(c).flat().length < h.length; ) {
    const m = [], b = c[p];
    for (const _ of b) {
      const $ = g(u, _);
      for (const C of $)
        f.has(C) || (m.push(C), f.add(C));
    }
    if (m.length === 0) {
      if (h.filter(($) => !f.has($)).length > 0)
        throw new Error("bfs_layout didn't include all nodes. Graph may be disconnected.");
      break;
    }
    p++, c[p] = m;
  }
  return Wm(u, c, t, r, o);
  function g(m, b) {
    return m.edges ? m.edges().filter((_) => _[0] === b || _[1] === b).map((_) => _[0] === b ? _[1] : _[0]) : [];
  }
}
function kA(n, e = 1, t = null, r = 2) {
  if (r !== 2)
    throw new Error("can only handle 2 dimensions");
  const o = Kn(n, t || [0, 0], r), a = o.G;
  t = o.center;
  const u = Pn(a), h = ku(a);
  if (u.length === 0)
    return {};
  const { isPlanar: c, embedding: f } = $A(a, u, h);
  if (!c)
    throw new Error("G is not planar.");
  if (!f)
    throw new Error("Failed to generate planar embedding.");
  let p = LA(f, u);
  return p = ii(p, e, t), p;
}
function $A(n, e, t) {
  return e.length <= 4 ? { isPlanar: !0, embedding: jc(e, t) } : OA(e, t) || NA(e, t) ? { isPlanar: !1, embedding: null } : zA(e, t);
}
function OA(n, e) {
  if (n.length !== 5 || e.length !== 10) return !1;
  for (let t = 0; t < n.length; t++)
    for (let r = t + 1; r < n.length; r++)
      if (!e.some(
        (a) => a[0] === n[t] && a[1] === n[r] || a[0] === n[r] && a[1] === n[t]
      )) return !1;
  return !0;
}
function NA(n, e) {
  if (n.length !== 6 || e.length !== 9) return !1;
  const t = RA(n, e);
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
function RA(n, e) {
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
function zA(n, e) {
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
  return a(n[0]), o.length < n.length ? { isPlanar: !0, embedding: jc(n, e) } : e.length > 3 * n.length - 6 ? { isPlanar: !1, embedding: null } : { isPlanar: !0, embedding: jc(n, e) };
}
function jc(n, e) {
  const t = {
    nodeOrder: [...n],
    faceList: [],
    nodePositions: {}
  }, r = {};
  for (const h of n)
    r[h] = /* @__PURE__ */ new Set();
  for (const [h, c] of e)
    r[h].add(c), r[c].add(h);
  const o = DA(n, e, r) || n;
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
      let f = 0, p = 0, g = 0;
      for (const m of c)
        t.nodePositions[m] && (f += t.nodePositions[m][0], p += t.nodePositions[m][1], g++);
      if (g > 0) {
        const m = 0.1 * Math.random();
        t.nodePositions[h] = [
          f / g + m * (Math.random() - 0.5),
          p / g + m * (Math.random() - 0.5)
        ];
      } else {
        const m = 0.5 * Math.random(), b = 2 * Math.PI * Math.random();
        t.nodePositions[h] = [m * Math.cos(b), m * Math.sin(b)];
      }
    }
  }
  return t;
}
function DA(n, e, t) {
  if (n.length === 0) return null;
  if (n.length <= 2) return n;
  if (n.length <= 8) {
    let c = function(g) {
      if (p.push(g), f.add(g), p.length === n.length)
        return t[g].has(p[0]) ? !0 : (f.delete(g), p.pop(), !1);
      for (const m of t[g])
        if (!f.has(m) && c(m))
          return !0;
      return f.delete(g), p.pop(), !1;
    };
    const f = /* @__PURE__ */ new Set(), p = [];
    if (c(n[0]))
      return p;
  }
  const r = /* @__PURE__ */ new Set(), o = {};
  let a = null;
  function u(c, f) {
    r.add(c);
    for (const p of t[c])
      if (p !== f) {
        if (r.has(p))
          return a = h(c, p, o), !0;
        if (o[p] = c, u(p, c))
          return !0;
      }
    return !1;
  }
  function h(c, f, p) {
    const g = [f, c];
    let m = c;
    for (; p[m] !== void 0 && p[m] !== f; )
      m = p[m], g.push(m);
    return g;
  }
  for (const c of n)
    if (!r.has(c) && (o[c] = null, u(c, null)))
      break;
  return a || n;
}
function LA(n, e) {
  const t = {};
  for (const r of e)
    n.nodePositions[r] ? t[r] = n.nodePositions[r] : t[r] = [0, 0];
  return t;
}
function BA(n, e = null, t = null, r = "weight", o = 1, a = null, u = 2) {
  const h = Kn(n, a, u), c = h.G;
  a = h.center;
  const f = Pn(c);
  if (f.length === 0)
    return {};
  if (f.length === 1)
    return { [f[0]]: a };
  e || (e = FA(c, r));
  const p = Array.from(f), g = p.length, m = Array(g).fill(0).map(() => Array(g).fill(1e6));
  for (let C = 0; C < g; C++) {
    const S = p[C];
    if (m[C][C] = 0, !!e[S])
      for (let I = 0; I < g; I++) {
        const T = p[I];
        e[S][T] !== void 0 && (m[C][I] = e[S][T]);
      }
  }
  if (!t)
    if (u >= 3)
      t = $h(n, null, u);
    else if (u === 2)
      t = Hm(n, 1, [0, 0], u);
    else {
      const C = {};
      p.forEach((S, I) => {
        C[S] = [I / (g - 1 || 1)];
      }), t = C;
    }
  const b = new Array(g);
  for (let C = 0; C < g; C++) {
    const S = p[C];
    for (b[C] = t[S] ? [...t[S]] : Array(u).fill(0); b[C].length < u; )
      b[C].push(0);
  }
  const _ = UA(m, b, u), $ = {};
  for (let C = 0; C < g; C++)
    $[p[C]] = _[C];
  return ii($, o, a);
}
function FA(n, e) {
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
function UA(n, e, t) {
  const r = e.length, o = 1e-3, a = n.map(
    (_) => _.map(($) => $ === 0 ? 0 : 1 / ($ + 1e-3))
  );
  let u = e.flat();
  const h = 500, c = 1e-5, f = 10;
  let p = 1;
  const g = [], m = [];
  for (let _ = 0; _ < h; _++) {
    const [$, C] = fc(u, a, o, t), S = ZA(C, g, m);
    p = qA(
      u,
      S,
      $,
      C,
      (N) => fc(N, a, o, t)[0],
      p
    );
    const I = [...u];
    for (let N = 0; N < u.length; N++)
      u[N] += p * S[N];
    const [, T] = fc(u, a, o, t);
    if (g.push(u.map((N, D) => N - I[D])), m.push(T.map((N, D) => N - C[D])), g.length > f && (g.shift(), m.shift()), Math.sqrt(T.reduce((N, D) => N + D * D, 0)) < c)
      break;
  }
  const b = [];
  for (let _ = 0; _ < r; _++)
    b.push(u.slice(_ * t, (_ + 1) * t));
  return b;
}
function fc(n, e, t, r) {
  const o = e.length, a = [];
  for (let f = 0; f < o; f++)
    a.push(n.slice(f * r, (f + 1) * r));
  let u = 0;
  const h = Array(r).fill(0);
  for (let f = 0; f < o; f++)
    for (let p = 0; p < r; p++)
      h[p] += a[f][p];
  u += 0.5 * t * h.reduce((f, p) => f + p * p, 0);
  for (let f = 0; f < o; f++)
    for (let p = f + 1; p < o; p++) {
      const g = a[f].map(($, C) => $ - a[p][C]), m = Math.sqrt(g.reduce(($, C) => $ + C * C, 0)), b = e[f][p], _ = m * b - 1;
      u += 0.5 * _ * _;
    }
  const c = new Array(n.length).fill(0);
  for (let f = 0; f < o; f++)
    for (let p = 0; p < r; p++)
      c[f * r + p] += t * h[p];
  for (let f = 0; f < o; f++)
    for (let p = f + 1; p < o; p++) {
      const g = a[f].map((C, S) => C - a[p][S]), m = Math.sqrt(g.reduce((C, S) => C + S * S, 0)) || 1e-10, b = g.map((C) => C / m), _ = e[f][p], $ = m * _ - 1;
      for (let C = 0; C < r; C++) {
        const S = _ * $ * b[C];
        c[f * r + C] += S, c[p * r + C] -= S;
      }
    }
  return [u, c];
}
function ZA(n, e, t, r) {
  if (e.length === 0)
    return n.map((f) => -f);
  const o = n.slice(), a = Array(e.length).fill(0), u = [];
  for (let f = 0; f < e.length; f++) {
    const p = e[f], g = t[f];
    u.push(1 / g.reduce((m, b, _) => m + b * p[_], 0));
  }
  for (let f = e.length - 1; f >= 0; f--) {
    const p = e[f];
    a[f] = u[f] * p.reduce((g, m, b) => g + m * o[b], 0);
    for (let g = 0; g < o.length; g++)
      o[g] -= a[f] * t[f][g];
  }
  let h = 1;
  if (e.length > 0 && t.length > 0) {
    const f = t[t.length - 1];
    h = e[e.length - 1].reduce((g, m, b) => g + m * f[b], 0) / f.reduce((g, m) => g + m * m, 0);
  }
  const c = o.map((f) => -h * f);
  for (let f = 0; f < e.length; f++) {
    const p = e[f], g = t[f], m = u[f] * g.reduce((b, _, $) => b + _ * c[$], 0);
    for (let b = 0; b < c.length; b++)
      c[b] += p[b] * (a[f] - m);
  }
  return c;
}
function qA(n, e, t, r, o, a) {
  const c = r.reduce((g, m, b) => g + m * e[b], 0);
  if (c >= 0)
    return 1e-8;
  let f = a;
  const p = 20;
  for (let g = 0; g < p; g++) {
    const m = n.map((_, $) => _ + f * e[$]);
    if (o(m) <= t + 1e-4 * f * c)
      return f;
    f *= 0.9;
  }
  return f;
}
function GA(n, e = null, t = 100, r = 1, o = 2, a = 1, u = !1, h = !1, c = null, f = null, p = null, g = !1, m = !1, b = null, _ = 2) {
  const C = Kn(n, null, _).G, S = Pn(C);
  if (S.length === 0)
    return {};
  const I = new fs(b ?? void 0);
  let T;
  if (e === null) {
    e = {}, T = new Array(S.length);
    for (let re = 0; re < S.length; re++)
      T[re] = Array(_).fill(0).map(() => I.rand() * 2 - 1), e[S[re]] = T[re];
  } else if (Object.keys(e).length === S.length) {
    T = new Array(S.length);
    for (let re = 0; re < S.length; re++)
      T[re] = [...e[S[re]]];
  } else {
    let re = Array(_).fill(Number.POSITIVE_INFINITY), ce = Array(_).fill(Number.NEGATIVE_INFINITY);
    for (const ve in e)
      for (let xe = 0; xe < _; xe++)
        re[xe] = Math.min(re[xe], e[ve][xe]), ce[xe] = Math.max(ce[xe], e[ve][xe]);
    T = new Array(S.length);
    for (let ve = 0; ve < S.length; ve++) {
      const xe = S[ve];
      e[xe] ? T[ve] = [...e[xe]] : (T[ve] = Array(_).fill(0).map(
        (Re, Ve) => re[Ve] + I.rand() * (ce[Ve] - re[Ve])
      ), e[xe] = T[ve]);
    }
  }
  const A = new Array(S.length).fill(0), N = new Array(S.length).fill(0), D = f !== null;
  for (let re = 0; re < S.length; re++) {
    const ce = S[re];
    A[re] = c && c[ce] ? c[ce] : C.edges ? se(C, ce) + 1 : 1, N[re] = f && f[ce] ? f[ce] : 1;
  }
  const L = S.length, q = Array(L).fill(0).map(() => Array(L).fill(0)), oe = C.edges ? C.edges() : [], be = {};
  S.forEach((re, ce) => {
    be[re] = ce;
  });
  for (const [re, ce] of oe) {
    const ve = be[re], xe = be[ce];
    let Re = 1;
    p && C.getEdgeData && (Re = C.getEdgeData(re, ce, p) || 1), q[ve][xe] = Re, q[xe][ve] = Re;
  }
  const ge = Array(L).fill(0).map(() => Array(_).fill(0)), pe = Array(L).fill(0).map(() => Array(_).fill(0)), Je = Array(L).fill(0).map(() => Array(_).fill(0));
  let Le = 1, rt = 1;
  function He(re, ce, ve, xe, Re, Ve) {
    const ae = 0.05 * Math.sqrt(re), ee = Math.sqrt(ae), U = 10, W = 0.05, J = Math.min(U, ae * ve / (re * re));
    let he = Ve * Math.max(ee, J);
    ce / ve > 2 && (Re > W && (Re *= 0.5), he = Math.max(he, Ve));
    let we = ce === 0 ? Number.POSITIVE_INFINITY : he * Re * ve / ce;
    return ce > he * ve ? Re > W && (Re *= 0.7) : xe < 1e3 && (Re *= 1.3), xe = xe + Math.min(we - xe, 0.5 * xe), [xe, Re];
  }
  for (let re = 0; re < t; re++) {
    for (let U = 0; U < L; U++)
      for (let W = 0; W < _; W++)
        pe[U][W] = 0, Je[U][W] = 0, ge[U][W] = 0;
    const ce = Array(L).fill(0).map(
      () => Array(L).fill(0).map(() => Array(_).fill(0))
    ), ve = Array(L).fill(0).map(() => Array(L).fill(0));
    for (let U = 0; U < L; U++)
      for (let W = 0; W < L; W++)
        if (U !== W) {
          for (let J = 0; J < _; J++)
            ce[U][W][J] = T[U][J] - T[W][J];
          ve[U][W] = Math.sqrt(ce[U][W].reduce((J, he) => J + he * he, 0)), ve[U][W] < 0.01 && (ve[U][W] = 0.01);
        }
    if (m)
      for (let U = 0; U < L; U++)
        for (let W = 0; W < L; W++) {
          if (U === W || q[U][W] === 0) continue;
          const J = ve[U][W], he = -Math.log(1 + J) / J * q[U][W];
          for (let we = 0; we < _; we++) {
            const Ue = he * ce[U][W][we];
            pe[U][we] += Ue;
          }
        }
    else
      for (let U = 0; U < L; U++)
        for (let W = 0; W < L; W++)
          if (!(U === W || q[U][W] === 0))
            for (let J = 0; J < _; J++) {
              const he = -ce[U][W][J] * q[U][W];
              pe[U][J] += he;
            }
    if (u)
      for (let U = 0; U < L; U++)
        for (let W = 0; W < _; W++)
          pe[U][W] /= A[U];
    for (let U = 0; U < L; U++)
      for (let W = 0; W < L; W++) {
        if (U === W) continue;
        let J = ve[U][W];
        D && (J -= N[U] - N[W], J = Math.max(J, 0.01));
        const he = J * J, Ue = A[U] * A[W] / he * o;
        for (let wt = 0; wt < _; wt++) {
          const $e = ce[U][W][wt] / J;
          Je[U][wt] += $e * Ue;
        }
      }
    const xe = Array(_).fill(0);
    for (let U = 0; U < L; U++)
      for (let W = 0; W < _; W++)
        xe[W] += T[U][W] / L;
    for (let U = 0; U < L; U++) {
      const W = Array(_);
      for (let J = 0; J < _; J++)
        W[J] = T[U][J] - xe[J];
      if (h)
        for (let J = 0; J < _; J++)
          ge[U][J] = -a * A[U] * W[J];
      else {
        const J = Math.sqrt(W.reduce((he, we) => he + we * we, 0));
        if (J > 0.01)
          for (let he = 0; he < _; he++) {
            const we = W[he] / J;
            ge[U][he] = -a * A[U] * we;
          }
      }
    }
    const Re = Array(L).fill(0).map(() => Array(_).fill(0));
    let Ve = 0, ae = 0;
    for (let U = 0; U < L; U++) {
      for (let $e = 0; $e < _; $e++)
        Re[U][$e] = pe[U][$e] + Je[U][$e] + ge[U][$e];
      const W = [...T[U]], J = W.map(($e, tt) => $e + Re[U][tt]), he = W.map(($e, tt) => $e - J[tt]), we = W.map(($e, tt) => $e + J[tt]), Ue = Math.sqrt(he.reduce(($e, tt) => $e + tt * tt, 0)), wt = Math.sqrt(we.reduce(($e, tt) => $e + tt * tt, 0));
      Ve += A[U] * Ue, ae += 0.5 * A[U] * wt;
    }
    [Le, rt] = He(
      L,
      Ve,
      ae,
      Le,
      rt,
      r
    );
    let ee = 0;
    for (let U = 0; U < L; U++) {
      let W;
      if (D) {
        const J = Math.sqrt(Re[U].reduce((we, Ue) => we + Ue * Ue, 0)), he = A[U] * J;
        W = 0.1 * Le / (1 + Math.sqrt(Le * he)), W = Math.min(W * J, 10) / J;
      } else {
        const J = A[U] * Math.sqrt(Re[U].reduce((he, we) => he + we * we, 0));
        W = Le / (1 + Math.sqrt(Le * J));
      }
      for (let J = 0; J < _; J++) {
        const he = Re[U][J] * W;
        T[U][J] += he, ee += Math.abs(he);
      }
    }
    if (ee < 1e-10)
      break;
  }
  const te = {};
  for (let re = 0; re < L; re++)
    te[S[re]] = T[re];
  return ii(te);
  function se(re, ce) {
    return re.edges ? re.edges().filter(
      (ve) => ve[0] === ce || ve[1] === ce
    ).length : 0;
  }
}
function HA(n, e = null, t = 1, r = 1.1, o = 1e3, a = null) {
  if (r <= 1)
    throw new Error("The parameter a should be larger than 1");
  const u = Pn(n), h = ku(n);
  if (u.length === 0)
    return {};
  if (!e)
    e = $h(n, null, 2, a);
  else {
    const I = new fs(a ?? void 0), T = {};
    u.forEach((A) => {
      e[A] || (T[A] = [I.rand(), I.rand()]);
    }), e = { ...e, ...T };
  }
  const c = {};
  u.forEach((I, T) => {
    c[I] = T;
  });
  const f = u.map((I) => [...e[I]]), p = u.length, g = Array(p).fill(0).map(() => Array(p).fill(1));
  for (let I = 0; I < p; I++)
    g[I][I] = 0;
  for (const [I, T] of h) {
    if (I === T) continue;
    const A = c[I], N = c[T];
    g[A][N] = r, g[N][A] = r;
  }
  const m = t * Math.sqrt(p), b = 1e-3, _ = 1e-6;
  let $ = _ + 1, C = 0;
  for (; $ > _ && C < o; ) {
    const I = Array(p).fill(0).map(() => [0, 0]);
    for (let T = 0; T < p; T++)
      for (let A = 0; A < p; A++) {
        if (T === A) continue;
        const N = f[T].map((L, q) => L - f[A][q]), D = Math.sqrt(N.reduce((L, q) => L + q * q, 0)) || 0.01;
        for (let L = 0; L < N.length; L++)
          I[T][L] += g[T][A] * N[L] - m / D * N[L];
      }
    for (let T = 0; T < p; T++)
      for (let A = 0; A < f[T].length; A++)
        f[T][A] += I[T][A] * b;
    $ = I.reduce((T, A) => T + Math.sqrt(A.reduce((N, D) => N + D * D, 0)), 0), C++;
  }
  const S = {};
  return u.forEach((I, T) => {
    S[I] = f[T];
  }), S;
}
const dc = /* @__PURE__ */ new Map();
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
    return dc.set(t, e), e;
  }
  static get(e, t = {}) {
    const r = dc.get(e);
    return r ? new r(t) : null;
  }
  static getOptionsForDimension(e) {
    return e > this.maxDimensions ? null : {};
  }
  static getOptionsForDimensionByType(e, t) {
    const r = dc.get(e);
    return r ? r.getOptionsForDimension(t) : null;
  }
}
const vn = sC({
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
    return this.stale && this.doLayout(), pc(this.positions[e.id], this.scalingFactor);
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setNodePosition() {
  }
  getEdgePosition(e) {
    return this.stale && this.doLayout(), {
      src: pc(this.positions[e.srcId], this.scalingFactor),
      dst: pc(this.positions[e.dstId], this.scalingFactor)
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
function pc(n, e) {
  const t = n[0] * e, r = n[1] * e, o = (n[2] ?? 0) * e;
  return { x: t, y: r, z: o };
}
const WA = Ie({
  ...vn.shape,
  pos: Cr(
    V(),
    nt(V())
  ).or(Ke()).default(null),
  scaling: V().positive().default(1),
  a: V().positive().default(1.1),
  maxIter: V().positive().default(1e3),
  seed: V().positive().or(Ke()).default(null)
}), uu = class uu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = WA.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = HA(
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
let Vc = uu;
const jA = Ie({
  ...vn.shape,
  start: V().or(qe()),
  align: Bt(["vertical", "horizontal"]).default("vertical"),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null)
}), lu = class lu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 20, this.config = jA.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = PA(
      { nodes: e, edges: t },
      this.config.start,
      this.config.align,
      this.config.scale,
      this.config.center
    );
  }
};
lu.type = "bfs", lu.maxDimensions = 2;
let Kc = lu;
const VA = Ie({
  ...vn.shape,
  nodes: nt(V().or(qe())),
  align: Bt(["vertical", "horizontal"]).default("vertical"),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  aspectRatio: V().positive().default(4 / 3)
}), cu = class cu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 40, this.config = VA.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = IA(
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
let Jc = cu;
const KA = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2)
}), hu = class hu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 80, this.config = KA.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = Hm(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
hu.type = "circular", hu.maxDimensions = 2;
let Yc = hu;
function JA(n, e, t) {
  var r, o = 1;
  n == null && (n = 0), e == null && (e = 0), t == null && (t = 0);
  function a() {
    var u, h = r.length, c, f = 0, p = 0, g = 0;
    for (u = 0; u < h; ++u)
      c = r[u], f += c.x || 0, p += c.y || 0, g += c.z || 0;
    for (f = (f / h - n) * o, p = (p / h - e) * o, g = (g / h - t) * o, u = 0; u < h; ++u)
      c = r[u], f && (c.x -= f), p && (c.y -= p), g && (c.z -= g);
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
function YA(n) {
  const e = +this._x.call(null, n);
  return jm(this.cover(e), e, n);
}
function jm(n, e, t) {
  if (isNaN(e)) return n;
  var r, o = n._root, a = { data: t }, u = n._x0, h = n._x1, c, f, p, g, m;
  if (!o) return n._root = a, n;
  for (; o.length; )
    if ((p = e >= (c = (u + h) / 2)) ? u = c : h = c, r = o, !(o = o[g = +p])) return r[g] = a, n;
  if (f = +n._x.call(null, o.data), e === f) return a.next = o, r ? r[g] = a : n._root = a, n;
  do
    r = r ? r[g] = new Array(2) : n._root = new Array(2), (p = e >= (c = (u + h) / 2)) ? u = c : h = c;
  while ((g = +p) == (m = +(f >= c)));
  return r[m] = o, r[g] = a, n;
}
function QA(n) {
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
function XA(n) {
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
function e3() {
  var n = [];
  return this.visit(function(e) {
    if (!e.length) do
      n.push(e.data);
    while (e = e.next);
  }), n;
}
function t3(n) {
  return arguments.length ? this.cover(+n[0][0]).cover(+n[1][0]) : isNaN(this._x0) ? void 0 : [[this._x0], [this._x1]];
}
function Ar(n, e, t) {
  this.node = n, this.x0 = e, this.x1 = t;
}
function n3(n, e) {
  var t, r = this._x0, o, a, u = this._x1, h = [], c = this._root, f, p;
  for (c && h.push(new Ar(c, r, u)), e == null ? e = 1 / 0 : (r = n - e, u = n + e); f = h.pop(); )
    if (!(!(c = f.node) || (o = f.x0) > u || (a = f.x1) < r))
      if (c.length) {
        var g = (o + a) / 2;
        h.push(
          new Ar(c[1], g, a),
          new Ar(c[0], o, g)
        ), (p = +(n >= g)) && (f = h[h.length - 1], h[h.length - 1] = h[h.length - 1 - p], h[h.length - 1 - p] = f);
      } else {
        var m = Math.abs(n - +this._x.call(null, c.data));
        m < e && (e = m, r = n - m, u = n + m, t = c.data);
      }
  return t;
}
function r3(n) {
  if (isNaN(c = +this._x.call(null, n))) return this;
  var e, t = this._root, r, o, a, u = this._x0, h = this._x1, c, f, p, g, m;
  if (!t) return this;
  if (t.length) for (; ; ) {
    if ((p = c >= (f = (u + h) / 2)) ? u = f : h = f, e = t, !(t = t[g = +p])) return this;
    if (!t.length) break;
    e[g + 1 & 1] && (r = e, m = g);
  }
  for (; t.data !== n; ) if (o = t, !(t = t.next)) return this;
  return (a = t.next) && delete t.next, o ? (a ? o.next = a : delete o.next, this) : e ? (a ? e[g] = a : delete e[g], (t = e[0] || e[1]) && t === (e[1] || e[0]) && !t.length && (r ? r[m] = t : this._root = t), this) : (this._root = a, this);
}
function i3(n) {
  for (var e = 0, t = n.length; e < t; ++e) this.remove(n[e]);
  return this;
}
function o3() {
  return this._root;
}
function s3() {
  var n = 0;
  return this.visit(function(e) {
    if (!e.length) do
      ++n;
    while (e = e.next);
  }), n;
}
function a3(n) {
  var e = [], t, r = this._root, o, a, u;
  for (r && e.push(new Ar(r, this._x0, this._x1)); t = e.pop(); )
    if (!n(r = t.node, a = t.x0, u = t.x1) && r.length) {
      var h = (a + u) / 2;
      (o = r[1]) && e.push(new Ar(o, h, u)), (o = r[0]) && e.push(new Ar(o, a, h));
    }
  return this;
}
function u3(n) {
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
function l3(n) {
  return n[0];
}
function c3(n) {
  return arguments.length ? (this._x = n, this) : this._x;
}
function Vm(n, e) {
  var t = new Oh(e ?? l3, NaN, NaN);
  return n == null ? t : t.addAll(n);
}
function Oh(n, e, t) {
  this._x = n, this._x0 = e, this._x1 = t, this._root = void 0;
}
function k0(n) {
  for (var e = { data: n.data }, t = e; n = n.next; ) t = t.next = { data: n.data };
  return e;
}
var _n = Vm.prototype = Oh.prototype;
_n.copy = function() {
  var n = new Oh(this._x, this._x0, this._x1), e = this._root, t, r;
  if (!e) return n;
  if (!e.length) return n._root = k0(e), n;
  for (t = [{ source: e, target: n._root = new Array(2) }]; e = t.pop(); )
    for (var o = 0; o < 2; ++o)
      (r = e.source[o]) && (r.length ? t.push({ source: r, target: e.target[o] = new Array(2) }) : e.target[o] = k0(r));
  return n;
};
_n.add = YA;
_n.addAll = QA;
_n.cover = XA;
_n.data = e3;
_n.extent = t3;
_n.find = n3;
_n.remove = r3;
_n.removeAll = i3;
_n.root = o3;
_n.size = s3;
_n.visit = a3;
_n.visitAfter = u3;
_n.x = c3;
function h3(n) {
  const e = +this._x.call(null, n), t = +this._y.call(null, n);
  return Km(this.cover(e, t), e, t, n);
}
function Km(n, e, t, r) {
  if (isNaN(e) || isNaN(t)) return n;
  var o, a = n._root, u = { data: r }, h = n._x0, c = n._y0, f = n._x1, p = n._y1, g, m, b, _, $, C, S, I;
  if (!a) return n._root = u, n;
  for (; a.length; )
    if (($ = e >= (g = (h + f) / 2)) ? h = g : f = g, (C = t >= (m = (c + p) / 2)) ? c = m : p = m, o = a, !(a = a[S = C << 1 | $])) return o[S] = u, n;
  if (b = +n._x.call(null, a.data), _ = +n._y.call(null, a.data), e === b && t === _) return u.next = a, o ? o[S] = u : n._root = u, n;
  do
    o = o ? o[S] = new Array(4) : n._root = new Array(4), ($ = e >= (g = (h + f) / 2)) ? h = g : f = g, (C = t >= (m = (c + p) / 2)) ? c = m : p = m;
  while ((S = C << 1 | $) === (I = (_ >= m) << 1 | b >= g));
  return o[I] = a, o[S] = u, n;
}
function f3(n) {
  var e, t, r = n.length, o, a, u = new Array(r), h = new Array(r), c = 1 / 0, f = 1 / 0, p = -1 / 0, g = -1 / 0;
  for (t = 0; t < r; ++t)
    isNaN(o = +this._x.call(null, e = n[t])) || isNaN(a = +this._y.call(null, e)) || (u[t] = o, h[t] = a, o < c && (c = o), o > p && (p = o), a < f && (f = a), a > g && (g = a));
  if (c > p || f > g) return this;
  for (this.cover(c, f).cover(p, g), t = 0; t < r; ++t)
    Km(this, u[t], h[t], n[t]);
  return this;
}
function d3(n, e) {
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
function p3() {
  var n = [];
  return this.visit(function(e) {
    if (!e.length) do
      n.push(e.data);
    while (e = e.next);
  }), n;
}
function g3(n) {
  return arguments.length ? this.cover(+n[0][0], +n[0][1]).cover(+n[1][0], +n[1][1]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0], [this._x1, this._y1]];
}
function nn(n, e, t, r, o) {
  this.node = n, this.x0 = e, this.y0 = t, this.x1 = r, this.y1 = o;
}
function m3(n, e, t) {
  var r, o = this._x0, a = this._y0, u, h, c, f, p = this._x1, g = this._y1, m = [], b = this._root, _, $;
  for (b && m.push(new nn(b, o, a, p, g)), t == null ? t = 1 / 0 : (o = n - t, a = e - t, p = n + t, g = e + t, t *= t); _ = m.pop(); )
    if (!(!(b = _.node) || (u = _.x0) > p || (h = _.y0) > g || (c = _.x1) < o || (f = _.y1) < a))
      if (b.length) {
        var C = (u + c) / 2, S = (h + f) / 2;
        m.push(
          new nn(b[3], C, S, c, f),
          new nn(b[2], u, S, C, f),
          new nn(b[1], C, h, c, S),
          new nn(b[0], u, h, C, S)
        ), ($ = (e >= S) << 1 | n >= C) && (_ = m[m.length - 1], m[m.length - 1] = m[m.length - 1 - $], m[m.length - 1 - $] = _);
      } else {
        var I = n - +this._x.call(null, b.data), T = e - +this._y.call(null, b.data), A = I * I + T * T;
        if (A < t) {
          var N = Math.sqrt(t = A);
          o = n - N, a = e - N, p = n + N, g = e + N, r = b.data;
        }
      }
  return r;
}
function v3(n) {
  if (isNaN(p = +this._x.call(null, n)) || isNaN(g = +this._y.call(null, n))) return this;
  var e, t = this._root, r, o, a, u = this._x0, h = this._y0, c = this._x1, f = this._y1, p, g, m, b, _, $, C, S;
  if (!t) return this;
  if (t.length) for (; ; ) {
    if ((_ = p >= (m = (u + c) / 2)) ? u = m : c = m, ($ = g >= (b = (h + f) / 2)) ? h = b : f = b, e = t, !(t = t[C = $ << 1 | _])) return this;
    if (!t.length) break;
    (e[C + 1 & 3] || e[C + 2 & 3] || e[C + 3 & 3]) && (r = e, S = C);
  }
  for (; t.data !== n; ) if (o = t, !(t = t.next)) return this;
  return (a = t.next) && delete t.next, o ? (a ? o.next = a : delete o.next, this) : e ? (a ? e[C] = a : delete e[C], (t = e[0] || e[1] || e[2] || e[3]) && t === (e[3] || e[2] || e[1] || e[0]) && !t.length && (r ? r[S] = t : this._root = t), this) : (this._root = a, this);
}
function _3(n) {
  for (var e = 0, t = n.length; e < t; ++e) this.remove(n[e]);
  return this;
}
function y3() {
  return this._root;
}
function b3() {
  var n = 0;
  return this.visit(function(e) {
    if (!e.length) do
      ++n;
    while (e = e.next);
  }), n;
}
function w3(n) {
  var e = [], t, r = this._root, o, a, u, h, c;
  for (r && e.push(new nn(r, this._x0, this._y0, this._x1, this._y1)); t = e.pop(); )
    if (!n(r = t.node, a = t.x0, u = t.y0, h = t.x1, c = t.y1) && r.length) {
      var f = (a + h) / 2, p = (u + c) / 2;
      (o = r[3]) && e.push(new nn(o, f, p, h, c)), (o = r[2]) && e.push(new nn(o, a, p, f, c)), (o = r[1]) && e.push(new nn(o, f, u, h, p)), (o = r[0]) && e.push(new nn(o, a, u, f, p));
    }
  return this;
}
function x3(n) {
  var e = [], t = [], r;
  for (this._root && e.push(new nn(this._root, this._x0, this._y0, this._x1, this._y1)); r = e.pop(); ) {
    var o = r.node;
    if (o.length) {
      var a, u = r.x0, h = r.y0, c = r.x1, f = r.y1, p = (u + c) / 2, g = (h + f) / 2;
      (a = o[0]) && e.push(new nn(a, u, h, p, g)), (a = o[1]) && e.push(new nn(a, p, h, c, g)), (a = o[2]) && e.push(new nn(a, u, g, p, f)), (a = o[3]) && e.push(new nn(a, p, g, c, f));
    }
    t.push(r);
  }
  for (; r = t.pop(); )
    n(r.node, r.x0, r.y0, r.x1, r.y1);
  return this;
}
function T3(n) {
  return n[0];
}
function S3(n) {
  return arguments.length ? (this._x = n, this) : this._x;
}
function M3(n) {
  return n[1];
}
function E3(n) {
  return arguments.length ? (this._y = n, this) : this._y;
}
function Jm(n, e, t) {
  var r = new Nh(e ?? T3, t ?? M3, NaN, NaN, NaN, NaN);
  return n == null ? r : r.addAll(n);
}
function Nh(n, e, t, r, o, a) {
  this._x = n, this._y = e, this._x0 = t, this._y0 = r, this._x1 = o, this._y1 = a, this._root = void 0;
}
function $0(n) {
  for (var e = { data: n.data }, t = e; n = n.next; ) t = t.next = { data: n.data };
  return e;
}
var on = Jm.prototype = Nh.prototype;
on.copy = function() {
  var n = new Nh(this._x, this._y, this._x0, this._y0, this._x1, this._y1), e = this._root, t, r;
  if (!e) return n;
  if (!e.length) return n._root = $0(e), n;
  for (t = [{ source: e, target: n._root = new Array(4) }]; e = t.pop(); )
    for (var o = 0; o < 4; ++o)
      (r = e.source[o]) && (r.length ? t.push({ source: r, target: e.target[o] = new Array(4) }) : e.target[o] = $0(r));
  return n;
};
on.add = h3;
on.addAll = f3;
on.cover = d3;
on.data = p3;
on.extent = g3;
on.find = m3;
on.remove = v3;
on.removeAll = _3;
on.root = y3;
on.size = b3;
on.visit = w3;
on.visitAfter = x3;
on.x = S3;
on.y = E3;
function C3(n) {
  const e = +this._x.call(null, n), t = +this._y.call(null, n), r = +this._z.call(null, n);
  return Ym(this.cover(e, t, r), e, t, r, n);
}
function Ym(n, e, t, r, o) {
  if (isNaN(e) || isNaN(t) || isNaN(r)) return n;
  var a, u = n._root, h = { data: o }, c = n._x0, f = n._y0, p = n._z0, g = n._x1, m = n._y1, b = n._z1, _, $, C, S, I, T, A, N, D, L, q;
  if (!u) return n._root = h, n;
  for (; u.length; )
    if ((A = e >= (_ = (c + g) / 2)) ? c = _ : g = _, (N = t >= ($ = (f + m) / 2)) ? f = $ : m = $, (D = r >= (C = (p + b) / 2)) ? p = C : b = C, a = u, !(u = u[L = D << 2 | N << 1 | A])) return a[L] = h, n;
  if (S = +n._x.call(null, u.data), I = +n._y.call(null, u.data), T = +n._z.call(null, u.data), e === S && t === I && r === T) return h.next = u, a ? a[L] = h : n._root = h, n;
  do
    a = a ? a[L] = new Array(8) : n._root = new Array(8), (A = e >= (_ = (c + g) / 2)) ? c = _ : g = _, (N = t >= ($ = (f + m) / 2)) ? f = $ : m = $, (D = r >= (C = (p + b) / 2)) ? p = C : b = C;
  while ((L = D << 2 | N << 1 | A) === (q = (T >= C) << 2 | (I >= $) << 1 | S >= _));
  return a[q] = u, a[L] = h, n;
}
function A3(n) {
  Array.isArray(n) || (n = Array.from(n));
  const e = n.length, t = new Float64Array(e), r = new Float64Array(e), o = new Float64Array(e);
  let a = 1 / 0, u = 1 / 0, h = 1 / 0, c = -1 / 0, f = -1 / 0, p = -1 / 0;
  for (let g = 0, m, b, _, $; g < e; ++g)
    isNaN(b = +this._x.call(null, m = n[g])) || isNaN(_ = +this._y.call(null, m)) || isNaN($ = +this._z.call(null, m)) || (t[g] = b, r[g] = _, o[g] = $, b < a && (a = b), b > c && (c = b), _ < u && (u = _), _ > f && (f = _), $ < h && (h = $), $ > p && (p = $));
  if (a > c || u > f || h > p) return this;
  this.cover(a, u, h).cover(c, f, p);
  for (let g = 0; g < e; ++g)
    Ym(this, t[g], r[g], o[g], n[g]);
  return this;
}
function I3(n, e, t) {
  if (isNaN(n = +n) || isNaN(e = +e) || isNaN(t = +t)) return this;
  var r = this._x0, o = this._y0, a = this._z0, u = this._x1, h = this._y1, c = this._z1;
  if (isNaN(r))
    u = (r = Math.floor(n)) + 1, h = (o = Math.floor(e)) + 1, c = (a = Math.floor(t)) + 1;
  else {
    for (var f = u - r || 1, p = this._root, g, m; r > n || n >= u || o > e || e >= h || a > t || t >= c; )
      switch (m = (t < a) << 2 | (e < o) << 1 | n < r, g = new Array(8), g[m] = p, p = g, f *= 2, m) {
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
    this._root && this._root.length && (this._root = p);
  }
  return this._x0 = r, this._y0 = o, this._z0 = a, this._x1 = u, this._y1 = h, this._z1 = c, this;
}
function P3() {
  var n = [];
  return this.visit(function(e) {
    if (!e.length) do
      n.push(e.data);
    while (e = e.next);
  }), n;
}
function k3(n) {
  return arguments.length ? this.cover(+n[0][0], +n[0][1], +n[0][2]).cover(+n[1][0], +n[1][1], +n[1][2]) : isNaN(this._x0) ? void 0 : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
}
function st(n, e, t, r, o, a, u) {
  this.node = n, this.x0 = e, this.y0 = t, this.z0 = r, this.x1 = o, this.y1 = a, this.z1 = u;
}
function $3(n, e, t, r) {
  var o, a = this._x0, u = this._y0, h = this._z0, c, f, p, g, m, b, _ = this._x1, $ = this._y1, C = this._z1, S = [], I = this._root, T, A;
  for (I && S.push(new st(I, a, u, h, _, $, C)), r == null ? r = 1 / 0 : (a = n - r, u = e - r, h = t - r, _ = n + r, $ = e + r, C = t + r, r *= r); T = S.pop(); )
    if (!(!(I = T.node) || (c = T.x0) > _ || (f = T.y0) > $ || (p = T.z0) > C || (g = T.x1) < a || (m = T.y1) < u || (b = T.z1) < h))
      if (I.length) {
        var N = (c + g) / 2, D = (f + m) / 2, L = (p + b) / 2;
        S.push(
          new st(I[7], N, D, L, g, m, b),
          new st(I[6], c, D, L, N, m, b),
          new st(I[5], N, f, L, g, D, b),
          new st(I[4], c, f, L, N, D, b),
          new st(I[3], N, D, p, g, m, L),
          new st(I[2], c, D, p, N, m, L),
          new st(I[1], N, f, p, g, D, L),
          new st(I[0], c, f, p, N, D, L)
        ), (A = (t >= L) << 2 | (e >= D) << 1 | n >= N) && (T = S[S.length - 1], S[S.length - 1] = S[S.length - 1 - A], S[S.length - 1 - A] = T);
      } else {
        var q = n - +this._x.call(null, I.data), oe = e - +this._y.call(null, I.data), be = t - +this._z.call(null, I.data), ge = q * q + oe * oe + be * be;
        if (ge < r) {
          var pe = Math.sqrt(r = ge);
          a = n - pe, u = e - pe, h = t - pe, _ = n + pe, $ = e + pe, C = t + pe, o = I.data;
        }
      }
  return o;
}
const O3 = (n, e, t, r, o, a) => Math.sqrt((n - r) ** 2 + (e - o) ** 2 + (t - a) ** 2);
function N3(n, e, t, r) {
  const o = [], a = n - r, u = e - r, h = t - r, c = n + r, f = e + r, p = t + r;
  return this.visit((g, m, b, _, $, C, S) => {
    if (!g.length)
      do {
        const I = g.data;
        O3(n, e, t, this._x(I), this._y(I), this._z(I)) <= r && o.push(I);
      } while (g = g.next);
    return m > c || b > f || _ > p || $ < a || C < u || S < h;
  }), o;
}
function R3(n) {
  if (isNaN(m = +this._x.call(null, n)) || isNaN(b = +this._y.call(null, n)) || isNaN(_ = +this._z.call(null, n))) return this;
  var e, t = this._root, r, o, a, u = this._x0, h = this._y0, c = this._z0, f = this._x1, p = this._y1, g = this._z1, m, b, _, $, C, S, I, T, A, N, D;
  if (!t) return this;
  if (t.length) for (; ; ) {
    if ((I = m >= ($ = (u + f) / 2)) ? u = $ : f = $, (T = b >= (C = (h + p) / 2)) ? h = C : p = C, (A = _ >= (S = (c + g) / 2)) ? c = S : g = S, e = t, !(t = t[N = A << 2 | T << 1 | I])) return this;
    if (!t.length) break;
    (e[N + 1 & 7] || e[N + 2 & 7] || e[N + 3 & 7] || e[N + 4 & 7] || e[N + 5 & 7] || e[N + 6 & 7] || e[N + 7 & 7]) && (r = e, D = N);
  }
  for (; t.data !== n; ) if (o = t, !(t = t.next)) return this;
  return (a = t.next) && delete t.next, o ? (a ? o.next = a : delete o.next, this) : e ? (a ? e[N] = a : delete e[N], (t = e[0] || e[1] || e[2] || e[3] || e[4] || e[5] || e[6] || e[7]) && t === (e[7] || e[6] || e[5] || e[4] || e[3] || e[2] || e[1] || e[0]) && !t.length && (r ? r[D] = t : this._root = t), this) : (this._root = a, this);
}
function z3(n) {
  for (var e = 0, t = n.length; e < t; ++e) this.remove(n[e]);
  return this;
}
function D3() {
  return this._root;
}
function L3() {
  var n = 0;
  return this.visit(function(e) {
    if (!e.length) do
      ++n;
    while (e = e.next);
  }), n;
}
function B3(n) {
  var e = [], t, r = this._root, o, a, u, h, c, f, p;
  for (r && e.push(new st(r, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); t = e.pop(); )
    if (!n(r = t.node, a = t.x0, u = t.y0, h = t.z0, c = t.x1, f = t.y1, p = t.z1) && r.length) {
      var g = (a + c) / 2, m = (u + f) / 2, b = (h + p) / 2;
      (o = r[7]) && e.push(new st(o, g, m, b, c, f, p)), (o = r[6]) && e.push(new st(o, a, m, b, g, f, p)), (o = r[5]) && e.push(new st(o, g, u, b, c, m, p)), (o = r[4]) && e.push(new st(o, a, u, b, g, m, p)), (o = r[3]) && e.push(new st(o, g, m, h, c, f, b)), (o = r[2]) && e.push(new st(o, a, m, h, g, f, b)), (o = r[1]) && e.push(new st(o, g, u, h, c, m, b)), (o = r[0]) && e.push(new st(o, a, u, h, g, m, b));
    }
  return this;
}
function F3(n) {
  var e = [], t = [], r;
  for (this._root && e.push(new st(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1)); r = e.pop(); ) {
    var o = r.node;
    if (o.length) {
      var a, u = r.x0, h = r.y0, c = r.z0, f = r.x1, p = r.y1, g = r.z1, m = (u + f) / 2, b = (h + p) / 2, _ = (c + g) / 2;
      (a = o[0]) && e.push(new st(a, u, h, c, m, b, _)), (a = o[1]) && e.push(new st(a, m, h, c, f, b, _)), (a = o[2]) && e.push(new st(a, u, b, c, m, p, _)), (a = o[3]) && e.push(new st(a, m, b, c, f, p, _)), (a = o[4]) && e.push(new st(a, u, h, _, m, b, g)), (a = o[5]) && e.push(new st(a, m, h, _, f, b, g)), (a = o[6]) && e.push(new st(a, u, b, _, m, p, g)), (a = o[7]) && e.push(new st(a, m, b, _, f, p, g));
    }
    t.push(r);
  }
  for (; r = t.pop(); )
    n(r.node, r.x0, r.y0, r.z0, r.x1, r.y1, r.z1);
  return this;
}
function U3(n) {
  return n[0];
}
function Z3(n) {
  return arguments.length ? (this._x = n, this) : this._x;
}
function q3(n) {
  return n[1];
}
function G3(n) {
  return arguments.length ? (this._y = n, this) : this._y;
}
function H3(n) {
  return n[2];
}
function W3(n) {
  return arguments.length ? (this._z = n, this) : this._z;
}
function Qm(n, e, t, r) {
  var o = new Rh(e ?? U3, t ?? q3, r ?? H3, NaN, NaN, NaN, NaN, NaN, NaN);
  return n == null ? o : o.addAll(n);
}
function Rh(n, e, t, r, o, a, u, h, c) {
  this._x = n, this._y = e, this._z = t, this._x0 = r, this._y0 = o, this._z0 = a, this._x1 = u, this._y1 = h, this._z1 = c, this._root = void 0;
}
function O0(n) {
  for (var e = { data: n.data }, t = e; n = n.next; ) t = t.next = { data: n.data };
  return e;
}
var Gt = Qm.prototype = Rh.prototype;
Gt.copy = function() {
  var n = new Rh(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1), e = this._root, t, r;
  if (!e) return n;
  if (!e.length) return n._root = O0(e), n;
  for (t = [{ source: e, target: n._root = new Array(8) }]; e = t.pop(); )
    for (var o = 0; o < 8; ++o)
      (r = e.source[o]) && (r.length ? t.push({ source: r, target: e.target[o] = new Array(8) }) : e.target[o] = O0(r));
  return n;
};
Gt.add = C3;
Gt.addAll = A3;
Gt.cover = I3;
Gt.data = P3;
Gt.extent = k3;
Gt.find = $3;
Gt.findAllWithinRadius = N3;
Gt.remove = R3;
Gt.removeAll = z3;
Gt.root = D3;
Gt.size = L3;
Gt.visit = B3;
Gt.visitAfter = F3;
Gt.x = Z3;
Gt.y = G3;
Gt.z = W3;
function ns(n) {
  return function() {
    return n;
  };
}
function Mr(n) {
  return (n() - 0.5) * 1e-6;
}
function j3(n) {
  return n.index;
}
function N0(n, e) {
  var t = n.get(e);
  if (!t) throw new Error("node not found: " + e);
  return t;
}
function V3(n) {
  var e = j3, t = m, r, o = ns(30), a, u, h, c, f, p, g = 1;
  n == null && (n = []);
  function m(S) {
    return 1 / Math.min(c[S.source.index], c[S.target.index]);
  }
  function b(S) {
    for (var I = 0, T = n.length; I < g; ++I)
      for (var A = 0, N, D, L, q = 0, oe = 0, be = 0, ge, pe; A < T; ++A)
        N = n[A], D = N.source, L = N.target, q = L.x + L.vx - D.x - D.vx || Mr(p), h > 1 && (oe = L.y + L.vy - D.y - D.vy || Mr(p)), h > 2 && (be = L.z + L.vz - D.z - D.vz || Mr(p)), ge = Math.sqrt(q * q + oe * oe + be * be), ge = (ge - a[A]) / ge * S * r[A], q *= ge, oe *= ge, be *= ge, L.vx -= q * (pe = f[A]), h > 1 && (L.vy -= oe * pe), h > 2 && (L.vz -= be * pe), D.vx += q * (pe = 1 - pe), h > 1 && (D.vy += oe * pe), h > 2 && (D.vz += be * pe);
  }
  function _() {
    if (u) {
      var S, I = u.length, T = n.length, A = new Map(u.map((D, L) => [e(D, L, u), D])), N;
      for (S = 0, c = new Array(I); S < T; ++S)
        N = n[S], N.index = S, typeof N.source != "object" && (N.source = N0(A, N.source)), typeof N.target != "object" && (N.target = N0(A, N.target)), c[N.source.index] = (c[N.source.index] || 0) + 1, c[N.target.index] = (c[N.target.index] || 0) + 1;
      for (S = 0, f = new Array(T); S < T; ++S)
        N = n[S], f[S] = c[N.source.index] / (c[N.source.index] + c[N.target.index]);
      r = new Array(T), $(), a = new Array(T), C();
    }
  }
  function $() {
    if (u)
      for (var S = 0, I = n.length; S < I; ++S)
        r[S] = +t(n[S], S, n);
  }
  function C() {
    if (u)
      for (var S = 0, I = n.length; S < I; ++S)
        a[S] = +o(n[S], S, n);
  }
  return b.initialize = function(S, ...I) {
    u = S, p = I.find((T) => typeof T == "function") || Math.random, h = I.find((T) => [1, 2, 3].includes(T)) || 2, _();
  }, b.links = function(S) {
    return arguments.length ? (n = S, _(), b) : n;
  }, b.id = function(S) {
    return arguments.length ? (e = S, b) : e;
  }, b.iterations = function(S) {
    return arguments.length ? (g = +S, b) : g;
  }, b.strength = function(S) {
    return arguments.length ? (t = typeof S == "function" ? S : ns(+S), $(), b) : t;
  }, b.distance = function(S) {
    return arguments.length ? (o = typeof S == "function" ? S : ns(+S), C(), b) : o;
  }, b;
}
var K3 = { value: () => {
} };
function Xm() {
  for (var n = 0, e = arguments.length, t = {}, r; n < e; ++n) {
    if (!(r = arguments[n] + "") || r in t || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    t[r] = [];
  }
  return new qa(t);
}
function qa(n) {
  this._ = n;
}
function J3(n, e) {
  return n.trim().split(/^|\s+/).map(function(t) {
    var r = "", o = t.indexOf(".");
    if (o >= 0 && (r = t.slice(o + 1), t = t.slice(0, o)), t && !e.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name: r };
  });
}
qa.prototype = Xm.prototype = {
  constructor: qa,
  on: function(n, e) {
    var t = this._, r = J3(n + "", t), o, a = -1, u = r.length;
    if (arguments.length < 2) {
      for (; ++a < u; ) if ((o = (n = r[a]).type) && (o = Y3(t[o], n.name))) return o;
      return;
    }
    if (e != null && typeof e != "function") throw new Error("invalid callback: " + e);
    for (; ++a < u; )
      if (o = (n = r[a]).type) t[o] = R0(t[o], n.name, e);
      else if (e == null) for (o in t) t[o] = R0(t[o], n.name, null);
    return this;
  },
  copy: function() {
    var n = {}, e = this._;
    for (var t in e) n[t] = e[t].slice();
    return new qa(n);
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
function Y3(n, e) {
  for (var t = 0, r = n.length, o; t < r; ++t)
    if ((o = n[t]).name === e)
      return o.value;
}
function R0(n, e, t) {
  for (var r = 0, o = n.length; r < o; ++r)
    if (n[r].name === e) {
      n[r] = K3, n = n.slice(0, r).concat(n.slice(r + 1));
      break;
    }
  return t != null && n.push({ name: e, value: t }), n;
}
var vo = 0, Yo = 0, Wo = 0, ev = 1e3, nu, Qo, ru = 0, Oi = 0, $u = 0, ds = typeof performance == "object" && performance.now ? performance : Date, tv = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(n) {
  setTimeout(n, 17);
};
function nv() {
  return Oi || (tv(Q3), Oi = ds.now() + $u);
}
function Q3() {
  Oi = 0;
}
function Qc() {
  this._call = this._time = this._next = null;
}
Qc.prototype = rv.prototype = {
  constructor: Qc,
  restart: function(n, e, t) {
    if (typeof n != "function") throw new TypeError("callback is not a function");
    t = (t == null ? nv() : +t) + (e == null ? 0 : +e), !this._next && Qo !== this && (Qo ? Qo._next = this : nu = this, Qo = this), this._call = n, this._time = t, Xc();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Xc());
  }
};
function rv(n, e, t) {
  var r = new Qc();
  return r.restart(n, e, t), r;
}
function X3() {
  nv(), ++vo;
  for (var n = nu, e; n; )
    (e = Oi - n._time) >= 0 && n._call.call(void 0, e), n = n._next;
  --vo;
}
function z0() {
  Oi = (ru = ds.now()) + $u, vo = Yo = 0;
  try {
    X3();
  } finally {
    vo = 0, tI(), Oi = 0;
  }
}
function eI() {
  var n = ds.now(), e = n - ru;
  e > ev && ($u -= e, ru = n);
}
function tI() {
  for (var n, e = nu, t, r = 1 / 0; e; )
    e._call ? (r > e._time && (r = e._time), n = e, e = e._next) : (t = e._next, e._next = null, e = n ? n._next = t : nu = t);
  Qo = n, Xc(r);
}
function Xc(n) {
  if (!vo) {
    Yo && (Yo = clearTimeout(Yo));
    var e = n - Oi;
    e > 24 ? (n < 1 / 0 && (Yo = setTimeout(z0, n - ds.now() - $u)), Wo && (Wo = clearInterval(Wo))) : (Wo || (ru = ds.now(), Wo = setInterval(eI, ev)), vo = 1, tv(z0));
  }
}
const nI = 1664525, rI = 1013904223, D0 = 4294967296;
function iI() {
  let n = 1;
  return () => (n = (nI * n + rI) % D0) / D0;
}
var L0 = 3;
function gc(n) {
  return n.x;
}
function B0(n) {
  return n.y;
}
function oI(n) {
  return n.z;
}
var sI = 10, aI = Math.PI * (3 - Math.sqrt(5)), uI = Math.PI * 20 / (9 + Math.sqrt(221));
function lI(n, e) {
  e = e || 2;
  var t = Math.min(L0, Math.max(1, Math.round(e))), r, o = 1, a = 1e-3, u = 1 - Math.pow(a, 1 / 300), h = 0, c = 0.6, f = /* @__PURE__ */ new Map(), p = rv(b), g = Xm("tick", "end"), m = iI();
  n == null && (n = []);
  function b() {
    _(), g.call("tick", r), o < a && (p.stop(), g.call("end", r));
  }
  function _(S) {
    var I, T = n.length, A;
    S === void 0 && (S = 1);
    for (var N = 0; N < S; ++N)
      for (o += (h - o) * u, f.forEach(function(D) {
        D(o);
      }), I = 0; I < T; ++I)
        A = n[I], A.fx == null ? A.x += A.vx *= c : (A.x = A.fx, A.vx = 0), t > 1 && (A.fy == null ? A.y += A.vy *= c : (A.y = A.fy, A.vy = 0)), t > 2 && (A.fz == null ? A.z += A.vz *= c : (A.z = A.fz, A.vz = 0));
    return r;
  }
  function $() {
    for (var S = 0, I = n.length, T; S < I; ++S) {
      if (T = n[S], T.index = S, T.fx != null && (T.x = T.fx), T.fy != null && (T.y = T.fy), T.fz != null && (T.z = T.fz), isNaN(T.x) || t > 1 && isNaN(T.y) || t > 2 && isNaN(T.z)) {
        var A = sI * (t > 2 ? Math.cbrt(0.5 + S) : t > 1 ? Math.sqrt(0.5 + S) : S), N = S * aI, D = S * uI;
        t === 1 ? T.x = A : t === 2 ? (T.x = A * Math.cos(N), T.y = A * Math.sin(N)) : (T.x = A * Math.sin(N) * Math.cos(D), T.y = A * Math.cos(N), T.z = A * Math.sin(N) * Math.sin(D));
      }
      (isNaN(T.vx) || t > 1 && isNaN(T.vy) || t > 2 && isNaN(T.vz)) && (T.vx = 0, t > 1 && (T.vy = 0), t > 2 && (T.vz = 0));
    }
  }
  function C(S) {
    return S.initialize && S.initialize(n, m, t), S;
  }
  return $(), r = {
    tick: _,
    restart: function() {
      return p.restart(b), r;
    },
    stop: function() {
      return p.stop(), r;
    },
    numDimensions: function(S) {
      return arguments.length ? (t = Math.min(L0, Math.max(1, Math.round(S))), f.forEach(C), r) : t;
    },
    nodes: function(S) {
      return arguments.length ? (n = S, $(), f.forEach(C), r) : n;
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
      return arguments.length ? (m = S, f.forEach(C), r) : m;
    },
    force: function(S, I) {
      return arguments.length > 1 ? (I == null ? f.delete(S) : f.set(S, C(I)), r) : f.get(S);
    },
    find: function() {
      var S = Array.prototype.slice.call(arguments), I = S.shift() || 0, T = (t > 1 ? S.shift() : null) || 0, A = (t > 2 ? S.shift() : null) || 0, N = S.shift() || 1 / 0, D = 0, L = n.length, q, oe, be, ge, pe, Je;
      for (N *= N, D = 0; D < L; ++D)
        pe = n[D], q = I - pe.x, oe = T - (pe.y || 0), be = A - (pe.z || 0), ge = q * q + oe * oe + be * be, ge < N && (Je = pe, N = ge);
      return Je;
    },
    on: function(S, I) {
      return arguments.length > 1 ? (g.on(S, I), r) : g.on(S);
    }
  };
}
function cI() {
  var n, e, t, r, o, a = ns(-30), u, h = 1, c = 1 / 0, f = 0.81;
  function p(_) {
    var $, C = n.length, S = (e === 1 ? Vm(n, gc) : e === 2 ? Jm(n, gc, B0) : e === 3 ? Qm(n, gc, B0, oI) : null).visitAfter(m);
    for (o = _, $ = 0; $ < C; ++$) t = n[$], S.visit(b);
  }
  function g() {
    if (n) {
      var _, $ = n.length, C;
      for (u = new Array($), _ = 0; _ < $; ++_) C = n[_], u[C.index] = +a(C, _, n);
    }
  }
  function m(_) {
    var $ = 0, C, S, I = 0, T, A, N, D, L = _.length;
    if (L) {
      for (T = A = N = D = 0; D < L; ++D)
        (C = _[D]) && (S = Math.abs(C.value)) && ($ += C.value, I += S, T += S * (C.x || 0), A += S * (C.y || 0), N += S * (C.z || 0));
      $ *= Math.sqrt(4 / L), _.x = T / I, e > 1 && (_.y = A / I), e > 2 && (_.z = N / I);
    } else {
      C = _, C.x = C.data.x, e > 1 && (C.y = C.data.y), e > 2 && (C.z = C.data.z);
      do
        $ += u[C.data.index];
      while (C = C.next);
    }
    _.value = $;
  }
  function b(_, $, C, S, I) {
    if (!_.value) return !0;
    var T = [C, S, I][e - 1], A = _.x - t.x, N = e > 1 ? _.y - t.y : 0, D = e > 2 ? _.z - t.z : 0, L = T - $, q = A * A + N * N + D * D;
    if (L * L / f < q)
      return q < c && (A === 0 && (A = Mr(r), q += A * A), e > 1 && N === 0 && (N = Mr(r), q += N * N), e > 2 && D === 0 && (D = Mr(r), q += D * D), q < h && (q = Math.sqrt(h * q)), t.vx += A * _.value * o / q, e > 1 && (t.vy += N * _.value * o / q), e > 2 && (t.vz += D * _.value * o / q)), !0;
    if (_.length || q >= c) return;
    (_.data !== t || _.next) && (A === 0 && (A = Mr(r), q += A * A), e > 1 && N === 0 && (N = Mr(r), q += N * N), e > 2 && D === 0 && (D = Mr(r), q += D * D), q < h && (q = Math.sqrt(h * q)));
    do
      _.data !== t && (L = u[_.data.index] * o / q, t.vx += A * L, e > 1 && (t.vy += N * L), e > 2 && (t.vz += D * L));
    while (_ = _.next);
  }
  return p.initialize = function(_, ...$) {
    n = _, r = $.find((C) => typeof C == "function") || Math.random, e = $.find((C) => [1, 2, 3].includes(C)) || 2, g();
  }, p.strength = function(_) {
    return arguments.length ? (a = typeof _ == "function" ? _ : ns(+_), g(), p) : a;
  }, p.distanceMin = function(_) {
    return arguments.length ? (h = _ * _, p) : Math.sqrt(h);
  }, p.distanceMax = function(_) {
    return arguments.length ? (c = _ * _, p) : Math.sqrt(c);
  }, p.theta = function(_) {
    return arguments.length ? (f = _ * _, p) : Math.sqrt(f);
  }, p;
}
function eh(n) {
  return typeof n == "object" && n !== null && "index" in n && typeof n.index == "number" && "x" in n && typeof n.x == "number" && "y" in n && typeof n.y == "number" && "z" in n && typeof n.z == "number" && "vx" in n && typeof n.vx == "number" && "vy" in n && typeof n.vy == "number" && "vz" in n && typeof n.vz == "number";
}
const hI = Ie({
  alphaMin: V().positive().default(0.1),
  alphaTarget: V().min(0).default(0),
  alphaDecay: V().positive().default(0.0228),
  velocityDecay: V().positive().default(0.4)
});
function fI(n) {
  return !!(typeof n == "object" && n !== null && Object.hasOwn(n, "index") && "index" in n && typeof n.index == "number" && "source" in n && eh(n.source) && "target" in n && eh(n.target));
}
const fu = class fu extends _t {
  constructor(e = {}) {
    super(), this.nodeMapping = /* @__PURE__ */ new Map(), this.edgeMapping = /* @__PURE__ */ new Map(), this.newNodeMap = /* @__PURE__ */ new Map(), this.newEdgeMap = /* @__PURE__ */ new Map(), this.reheat = !1;
    const t = hI.parse(e);
    this.d3AlphaMin = t.alphaMin, this.d3AlphaTarget = t.alphaTarget, this.d3AlphaDecay = t.alphaDecay, this.d3VelocityDecay = t.velocityDecay;
    const r = V3();
    r.strength(0.9), this.d3ForceLayout = lI().numDimensions(3).alpha(1).force("link", r).force("charge", cI()).force("center", JA()).force("dagRadial", null).stop(), this.d3ForceLayout.force("link").id((o) => o.id);
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
        if (!eh(a))
          throw new Error("Internal error: Node is not settled as a complete D3 Node");
        this.nodeMapping.set(o, a);
      }
      this.newNodeMap.clear();
      let t = [...this.edgeMapping.values()];
      t = t.concat([...this.newEdgeMap.values()]), this.d3ForceLayout.force("link").links(t);
      for (const r of this.newEdgeMap.entries()) {
        const o = r[0], a = r[1];
        if (!fI(a))
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
let th = fu;
const dI = Ie({
  ...vn.shape,
  pos: Cr(V(), nt(V()).min(2).max(3)).or(Ke()).default(null),
  maxIter: V().positive().default(100),
  jitterTolerance: V().positive().default(1),
  scalingRatio: V().positive().default(2),
  gravity: V().positive().default(1),
  distributedAction: vt().default(!1),
  strongGravity: vt().default(!1),
  nodeMass: Cr(V(), V()).or(Ke()).default(null),
  nodeSize: Cr(V(), V()).or(Ke()).default(null),
  weightPath: qe().or(Ke()).default(null),
  dissuadeHubs: vt().default(!1),
  linlog: vt().default(!1),
  seed: V().or(Ke()).default(null),
  dim: V().default(2)
}), du = class du extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = dI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = GA(
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
let nh = du;
const pI = Ie({
  ...vn.shape,
  dist: Cr(V(), Cr(V(), V())).or(Ke()).default(null),
  pos: Cr(V(), nt(V()).min(1).max(3)).or(Ke()).default(null),
  weightProperty: qe().optional(),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(3)
}), pu = class pu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 50, this.config = pI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = BA(
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
let rh = pu;
const gI = Ie({
  ...vn.shape,
  // subsetKey: z.string().or(z.record(z.number(), z.array(z.string().or(z.number())))),
  subsetKey: Cr(qe(), nt(qe().or(V()))),
  align: Bt(["vertical", "horizontal"]).default("vertical"),
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null)
}), gu = class gu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 40, this.config = gI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = Wm(
      { nodes: e, edges: t },
      this.config.subsetKey,
      this.config.align,
      this.config.scale,
      this.config.center
    );
  }
};
gu.type = "multipartite", gu.maxDimensions = 2;
let ih = gu;
var Na = { exports: {} }, lo = { exports: {} }, mc, F0;
function iv() {
  return F0 || (F0 = 1, mc = function(e) {
    return e === 0 ? "x" : e === 1 ? "y" : e === 2 ? "z" : "c" + (e + 1);
  }), mc;
}
var vc, U0;
function bo() {
  if (U0) return vc;
  U0 = 1;
  const n = iv();
  return vc = function(t) {
    return r;
    function r(o, a) {
      let u = a && a.indent || 0, h = a && a.join !== void 0 ? a.join : `
`, c = Array(u + 1).join(" "), f = [];
      for (let p = 0; p < t; ++p) {
        let g = n(p), m = p === 0 ? "" : c;
        f.push(m + o.replace(/{var}/g, g));
      }
      return f.join(h);
    }
  }, vc;
}
var Z0;
function mI() {
  if (Z0) return lo.exports;
  Z0 = 1;
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
var Sr = { exports: {} }, q0;
function vI() {
  if (q0) return Sr.exports;
  q0 = 1;
  const n = bo(), e = iv();
  Sr.exports = t, Sr.exports.generateQuadTreeFunctionBody = r, Sr.exports.getInsertStackCode = c, Sr.exports.getQuadNodeCode = h, Sr.exports.isSamePosition = o, Sr.exports.getChildBodyCode = u, Sr.exports.setChildBodyCode = a;
  function t(f) {
    let p = r(f);
    return new Function(p)();
  }
  function r(f) {
    let p = n(f), g = Math.pow(2, f);
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
${$("      node.")}
      node.body = null;
      node.mass = ${p("node.mass_{var} = ", { join: "" })}0;
      ${p("node.min_{var} = node.max_{var} = ", { join: "" })}0;
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
    ${p("var d{var};", { indent: 4 })}
    var r; 
    ${p("var f{var} = 0;", { indent: 4 })}
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
        ${p("d{var} = body.pos.{var} - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${p("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${p("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${p("d{var} * d{var}", { join: " + " })});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${p("f{var} += v * d{var};", { indent: 8 })}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${p("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};", { indent: 8 })}
        r = Math.sqrt(${p("d{var} * d{var}", { join: " + " })});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${p("d{var} = (random.nextDouble() - 0.5) / 50;", { indent: 10 })}
          r = Math.sqrt(${p("d{var} * d{var}", { join: " + " })});
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${e(0)} - node.min_${e(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${p("f{var} += v * d{var};", { indent: 10 })}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${_()}
        }
      }
    }

    ${p("sourceBody.force.{var} += f{var};", { indent: 4 })}
  }

  function insertBodies(bodies) {
    ${p("var {var}min = Number.MAX_VALUE;", { indent: 4 })}
    ${p("var {var}max = Number.MIN_VALUE;", { indent: 4 })}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${p("if (pos.{var} < {var}min) {var}min = pos.{var};", { indent: 6 })}
      ${p("if (pos.{var} > {var}max) {var}max = pos.{var};", { indent: 6 })}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${p("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;", { indent: 4 })}

    currentInCache = 0;
    root = newNode();
    ${p("root.min_{var} = {var}min;", { indent: 4 })}
    ${p("root.max_{var} = {var}min + maxSideLength;", { indent: 4 })}

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
        ${p("var {var} = body.pos.{var};", { indent: 8 })}
        node.mass += body.mass;
        ${p("node.mass_{var} += body.mass * {var};", { indent: 8 })}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${p("var min_{var} = node.min_{var};", { indent: 8 })}
        ${p("var max_{var} = (min_{var} + node.max_{var}) / 2;", { indent: 8 })}

${b(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${p("child.min_{var} = min_{var};", { indent: 10 })}
          ${p("child.max_{var} = max_{var};", { indent: 10 })}
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
            ${p("var d{var} = (node.max_{var} - node.min_{var}) * offset;", { indent: 12 })}

            ${p("oldBody.pos.{var} = node.min_{var} + d{var};", { indent: 12 })}
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
    function b(C) {
      let S = [], I = Array(C + 1).join(" ");
      for (let T = 0; T < f; ++T)
        S.push(I + `if (${e(T)} > max_${e(T)}) {`), S.push(I + `  quadIdx = quadIdx + ${Math.pow(2, T)};`), S.push(I + `  min_${e(T)} = max_${e(T)};`), S.push(I + `  max_${e(T)} = node.max_${e(T)};`), S.push(I + "}");
      return S.join(`
`);
    }
    function _() {
      let C = Array(11).join(" "), S = [];
      for (let I = 0; I < g; ++I)
        S.push(C + `if (node.quad${I}) {`), S.push(C + `  queue[pushIdx] = node.quad${I};`), S.push(C + "  queueLength += 1;"), S.push(C + "  pushIdx += 1;"), S.push(C + "}");
      return S.join(`
`);
    }
    function $(C) {
      let S = [];
      for (let I = 0; I < g; ++I)
        S.push(`${C}quad${I} = null;`);
      return S.join(`
`);
    }
  }
  function o(f) {
    let p = n(f);
    return `
  function isSamePosition(point1, point2) {
    ${p("var d{var} = Math.abs(point1.{var} - point2.{var});", { indent: 2 })}
  
    return ${p("d{var} < 1e-8", { join: " && " })};
  }  
`;
  }
  function a(f) {
    var p = Math.pow(2, f);
    return `
function setChild(node, idx, child) {
  ${g()}
}`;
    function g() {
      let m = [];
      for (let b = 0; b < p; ++b) {
        let _ = b === 0 ? "  " : "  else ";
        m.push(`${_}if (idx === ${b}) node.quad${b} = child;`);
      }
      return m.join(`
`);
    }
  }
  function u(f) {
    return `function getChild(node, idx) {
${p()}
  return null;
}`;
    function p() {
      let g = [], m = Math.pow(2, f);
      for (let b = 0; b < m; ++b)
        g.push(`  if (idx === ${b}) return node.quad${b};`);
      return g.join(`
`);
    }
  }
  function h(f) {
    let p = n(f), g = Math.pow(2, f);
    var m = `
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
  ${p("this.mass_{var} = 0;", { indent: 2 })}

  // bounding box coordinates
  ${p("this.min_{var} = 0;", { indent: 2 })}
  ${p("this.max_{var} = 0;", { indent: 2 })}
}
`;
    return m;
    function b(_) {
      let $ = [];
      for (let C = 0; C < g; ++C)
        $.push(`${_}quad${C} = null;`);
      return $.join(`
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
var Ra = { exports: {} }, G0;
function _I() {
  if (G0) return Ra.exports;
  G0 = 1, Ra.exports = e, Ra.exports.generateFunctionBody = t;
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
var za = { exports: {} }, H0;
function yI() {
  if (H0) return za.exports;
  H0 = 1;
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
var Da = { exports: {} }, W0;
function bI() {
  if (W0) return Da.exports;
  W0 = 1;
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
var La = { exports: {} }, j0;
function wI() {
  if (j0) return La.exports;
  j0 = 1;
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
var _c, V0;
function xI() {
  if (V0) return _c;
  V0 = 1, _c = n;
  function n(e, t, r, o) {
    this.from = e, this.to = t, this.length = r, this.coefficient = o;
  }
  return _c;
}
var yc, K0;
function TI() {
  if (K0) return yc;
  K0 = 1, yc = n;
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
  return yc;
}
var bc, J0;
function zh() {
  if (J0) return bc;
  J0 = 1, bc = function(r) {
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
  return bc;
}
var jo = { exports: {} }, Y0;
function SI() {
  if (Y0) return jo.exports;
  Y0 = 1, jo.exports = n, jo.exports.random = n, jo.exports.randomIterator = h;
  function n(c) {
    var f = typeof c == "number" ? c : +/* @__PURE__ */ new Date();
    return new e(f);
  }
  function e(c) {
    this.seed = c;
  }
  e.prototype.next = u, e.prototype.nextDouble = a, e.prototype.uniform = a, e.prototype.gaussian = t, e.prototype.random = a;
  function t() {
    var c, f, p;
    do
      f = this.nextDouble() * 2 - 1, p = this.nextDouble() * 2 - 1, c = f * f + p * p;
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
    var p = f || n();
    if (typeof p.next != "function")
      throw new Error("customRandom does not match expected API: next() function is missing");
    return {
      /**
       * Visits every single element of a collection once, in a random order.
       * Note: collection is modified in place.
       */
      forEach: m,
      /**
       * Shuffles array randomly, in place.
       */
      shuffle: g
    };
    function g() {
      var b, _, $;
      for (b = c.length - 1; b > 0; --b)
        _ = p.next(b + 1), $ = c[_], c[_] = c[b], c[b] = $;
      return c;
    }
    function m(b) {
      var _, $, C;
      for (_ = c.length - 1; _ > 0; --_)
        $ = p.next(_ + 1), C = c[$], c[$] = c[_], c[_] = C, b(C);
      c.length && b(c[0]);
    }
  }
  return jo.exports;
}
var wc, Q0;
function X0() {
  if (Q0) return wc;
  Q0 = 1, wc = h;
  var n = mI(), e = vI(), t = _I(), r = yI(), o = bI(), a = wI(), u = {};
  function h(p) {
    var g = xI(), m = TI(), b = zh();
    if (p) {
      if (p.springCoeff !== void 0) throw new Error("springCoeff was renamed to springCoefficient");
      if (p.dragCoeff !== void 0) throw new Error("dragCoeff was renamed to dragCoefficient");
    }
    p = m(p, {
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
    var _ = u[p.dimensions];
    if (!_) {
      var $ = p.dimensions;
      _ = {
        Body: n($, p.debug),
        createQuadTree: e($),
        createBounds: t($),
        createDragForce: r($),
        createSpringForce: o($),
        integrate: a($)
      }, u[$] = _;
    }
    var C = _.Body, S = _.createQuadTree, I = _.createBounds, T = _.createDragForce, A = _.createSpringForce, N = _.integrate, D = (ae) => new C(ae), L = SI().random(42), q = [], oe = [], be = S(p, L), ge = I(q, p, L), pe = A(p, L), Je = T(p), Le = 0, rt = [], He = /* @__PURE__ */ new Map(), te = 0;
    ce("nbody", Re), ce("spring", Ve);
    var se = {
      /**
       * Array of bodies, registered with current simulator
       *
       * Note: To add new body, use addBody() method. This property is only
       * exposed for testing/performance purposes.
       */
      bodies: q,
      quadTree: be,
      /**
       * Array of springs, registered with current simulator
       *
       * Note: To add new spring, use addSpring() method. This property is only
       * exposed for testing/performance purposes.
       */
      springs: oe,
      /**
       * Returns settings with which current simulator was initialized
       */
      settings: p,
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
        var ee = N(q, p.timeStep, p.adaptiveTimeStepWeight);
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
        return q.push(ae), ae;
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
        var ee = D(ae);
        return q.push(ee), ee;
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
          var ee = q.indexOf(ae);
          if (!(ee < 0))
            return q.splice(ee, 1), q.length === 0 && ge.reset(), !0;
        }
      },
      /**
       * Adds a spring to this simulation.
       *
       * @returns {Object} - a handle for a spring. If you want to later remove
       * spring pass it to removeSpring() method.
       */
      addSpring: function(ae, ee, U, W) {
        if (!ae || !ee)
          throw new Error("Cannot add null spring to force simulator");
        typeof U != "number" && (U = -1);
        var J = new g(ae, ee, U, W >= 0 ? W : -1);
        return oe.push(J), J;
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
          var ee = oe.indexOf(ae);
          if (ee > -1)
            return oe.splice(ee, 1), !0;
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
        return ae !== void 0 ? (p.gravity = ae, be.options({ gravity: ae }), this) : p.gravity;
      },
      theta: function(ae) {
        return ae !== void 0 ? (p.theta = ae, be.options({ theta: ae }), this) : p.theta;
      },
      /**
       * Returns pseudo-random number generator instance.
       */
      random: L
    };
    return c(p, se), b(se), se;
    function re() {
      return ge.update(), ge.box;
    }
    function ce(ae, ee) {
      if (He.has(ae)) throw new Error("Force " + ae + " is already added");
      He.set(ae, ee), rt.push(ee);
    }
    function ve(ae) {
      var ee = rt.indexOf(He.get(ae));
      ee < 0 || (rt.splice(ee, 1), He.delete(ae));
    }
    function xe() {
      return He;
    }
    function Re() {
      if (q.length !== 0) {
        be.insertBodies(q);
        for (var ae = q.length; ae--; ) {
          var ee = q[ae];
          ee.isPinned || (ee.reset(), be.updateBodyForce(ee), Je.update(ee));
        }
      }
    }
    function Ve() {
      for (var ae = oe.length; ae--; )
        pe.update(oe[ae]);
    }
  }
  function c(p, g) {
    for (var m in p)
      f(p, g, m);
  }
  function f(p, g, m) {
    if (p.hasOwnProperty(m) && typeof g[m] != "function") {
      var b = Number.isFinite(p[m]);
      b ? g[m] = function(_) {
        if (_ !== void 0) {
          if (!Number.isFinite(_)) throw new Error("Value of " + m + " should be a valid number.");
          return p[m] = _, g;
        }
        return p[m];
      } : g[m] = function(_) {
        return _ !== void 0 ? (p[m] = _, g) : p[m];
      };
    }
  }
  return wc;
}
var eg;
function MI() {
  if (eg) return Na.exports;
  eg = 1, Na.exports = e, Na.exports.simulator = X0();
  var n = zh();
  function e(r, o) {
    if (!r)
      throw new Error("Graph structure cannot be undefined");
    var a = o && o.createSimulator || X0(), u = a(o);
    if (Array.isArray(o)) throw new Error("Physics settings is expected to be an object");
    var h = r.version > 19 ? He : rt;
    o && typeof o.nodeMass == "function" && (h = o.nodeMass);
    var c = /* @__PURE__ */ new Map(), f = {}, p = 0, g = u.settings.springTransform || t;
    D(), T();
    var m = !1, b = {
      /**
       * Performs one step of iterative layout algorithm
       *
       * @returns {boolean} true if the system should be considered stable; False otherwise.
       * The system is stable if no further call to `step()` can improve the layout.
       */
      step: function() {
        if (p === 0)
          return _(!0), !0;
        var te = u.step();
        b.lastMove = te, b.fire("step");
        var se = te / p, re = se <= 0.01;
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
        var se = Le(te);
        se.setPosition.apply(se, Array.prototype.slice.call(arguments, 1));
      },
      /**
       * @returns {Object} Link position by link id
       * @returns {Object.from} {x, y} coordinates of link start
       * @returns {Object.to} {x, y} coordinates of link end
       */
      getLinkPosition: function(te) {
        var se = f[te];
        if (se)
          return {
            from: se.from.pos,
            to: se.to.pos
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
      forEachBody: $,
      /*
       * Requests layout algorithm to pin/unpin node to its current position
       * Pinned nodes should not be affected by layout algorithm and always
       * remain at their position
       */
      pinNode: function(te, se) {
        var re = Le(te.id);
        re.isPinned = !!se;
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
      getBody: I,
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
      getForceVectorLength: C,
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
      m !== te && (m = te, A(te));
    }
    function $(te) {
      c.forEach(te);
    }
    function C() {
      var te = 0, se = 0;
      return $(function(re) {
        te += Math.abs(re.force.x), se += Math.abs(re.force.y);
      }), Math.sqrt(te * te + se * se);
    }
    function S(te, se) {
      var re;
      if (se === void 0)
        typeof te != "object" ? re = te : re = te.id;
      else {
        var ce = r.hasLink(te, se);
        if (!ce) return;
        re = ce.id;
      }
      return f[re];
    }
    function I(te) {
      return c.get(te);
    }
    function T() {
      r.on("changed", N);
    }
    function A(te) {
      b.fire("stable", te);
    }
    function N(te) {
      for (var se = 0; se < te.length; ++se) {
        var re = te[se];
        re.changeType === "add" ? (re.node && L(re.node.id), re.link && oe(re.link)) : re.changeType === "remove" && (re.node && q(re.node), re.link && be(re.link));
      }
      p = r.getNodesCount();
    }
    function D() {
      p = 0, r.forEachNode(function(te) {
        L(te.id), p += 1;
      }), r.forEachLink(oe);
    }
    function L(te) {
      var se = c.get(te);
      if (!se) {
        var re = r.getNode(te);
        if (!re)
          throw new Error("initBody() was called with unknown node id");
        var ce = re.position;
        if (!ce) {
          var ve = ge(re);
          ce = u.getBestNewBodyPosition(ve);
        }
        se = u.addBodyAt(ce), se.id = te, c.set(te, se), pe(te), Je(re) && (se.isPinned = !0);
      }
    }
    function q(te) {
      var se = te.id, re = c.get(se);
      re && (c.delete(se), u.removeBody(re));
    }
    function oe(te) {
      pe(te.fromId), pe(te.toId);
      var se = c.get(te.fromId), re = c.get(te.toId), ce = u.addSpring(se, re, te.length);
      g(te, ce), f[te.id] = ce;
    }
    function be(te) {
      var se = f[te.id];
      if (se) {
        var re = r.getNode(te.fromId), ce = r.getNode(te.toId);
        re && pe(re.id), ce && pe(ce.id), delete f[te.id], u.removeSpring(se);
      }
    }
    function ge(te) {
      var se = [];
      if (!te.links)
        return se;
      for (var re = Math.min(te.links.length, 2), ce = 0; ce < re; ++ce) {
        var ve = te.links[ce], xe = ve.fromId !== te.id ? c.get(ve.fromId) : c.get(ve.toId);
        xe && xe.pos && se.push(xe);
      }
      return se;
    }
    function pe(te) {
      var se = c.get(te);
      if (se.mass = h(te), Number.isNaN(se.mass))
        throw new Error("Node mass should be a number");
    }
    function Je(te) {
      return te && (te.isPinned || te.data && te.data.isPinned);
    }
    function Le(te) {
      var se = c.get(te);
      return se || (L(te), se = c.get(te)), se;
    }
    function rt(te) {
      var se = r.getLinks(te);
      return se ? 1 + se.length / 3 : 1;
    }
    function He(te) {
      var se = r.getLinks(te);
      return se ? 1 + se.size / 3 : 1;
    }
  }
  function t() {
  }
  return Na.exports;
}
var EI = MI();
const CI = /* @__PURE__ */ Ms(EI);
var xc, tg;
function AI() {
  if (tg) return xc;
  tg = 1, xc = e;
  var n = zh();
  function e(u) {
    if (u = u || {}, "uniqueLinkId" in u && (console.warn(
      "ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\nUse `multigraph` option instead\n",
      `
`,
      `Note: there is also change in default behavior: From now on each graph
is considered to be not a multigraph by default (each edge is unique).`
    ), u.multigraph = u.uniqueLinkId), u.multigraph === void 0 && (u.multigraph = !1), typeof Map != "function")
      throw new Error("ngraph.graph requires `Map` to be defined. Please polyfill it before using ngraph");
    var h = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ new Map(), f = {}, p = 0, g = u.multigraph ? be : oe, m = [], b = xe, _ = xe, $ = xe, C = xe, S = {
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
      addLink: q,
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
      removeNode: L,
      /**
       * Gets node with given identifier. If node does not exist undefined value is returned.
       *
       * @param nodeId requested node identifier;
       *
       * @return {node} in with requested identifier or undefined if no such node exists.
       */
      getNode: D,
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
      forEachLink: se,
      /**
       * Suspend all notifications about graph changes until
       * endUpdate is called.
       */
      beginUpdate: $,
      /**
       * Resumes all notifications about graph changes and fires
       * graph 'changed' event in case there are any pending changes.
       */
      endUpdate: C,
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
      hasLink: He,
      /**
       * Detects whether there is a node with given id
       * 
       * Operation complexity is O(1)
       * NOTE: this function is synonym for getNode()
       *
       * @returns node if there is one; Falsy value otherwise.
       */
      hasNode: D,
      /**
       * Gets an edge between two nodes.
       * Operation complexity is O(n) where n - number of links of a node.
       *
       * @param {string} fromId link start identifier
       * @param {string} toId link end identifier
       *
       * @returns link if there is one; undefined otherwise.
       */
      getLink: He
    };
    return n(S), I(), S;
    function I() {
      var ee = S.on;
      S.on = U;
      function U() {
        return S.beginUpdate = $ = Re, S.endUpdate = C = Ve, b = T, _ = A, S.on = ee, ee.apply(S, arguments);
      }
    }
    function T(ee, U) {
      m.push({
        link: ee,
        changeType: U
      });
    }
    function A(ee, U) {
      m.push({
        node: ee,
        changeType: U
      });
    }
    function N(ee, U) {
      if (ee === void 0)
        throw new Error("Invalid node identifier");
      $();
      var W = D(ee);
      return W ? (W.data = U, _(W, "update")) : (W = new t(ee, U), _(W, "add")), h.set(ee, W), C(), W;
    }
    function D(ee) {
      return h.get(ee);
    }
    function L(ee) {
      var U = D(ee);
      if (!U)
        return !1;
      $();
      var W = U.links;
      return W && (W.forEach(rt), U.links = null), h.delete(ee), _(U, "remove"), C(), !0;
    }
    function q(ee, U, W) {
      $();
      var J = D(ee) || N(ee), he = D(U) || N(U), we = g(ee, U, W), Ue = c.has(we.id);
      return c.set(we.id, we), r(J, we), ee !== U && r(he, we), b(we, Ue ? "update" : "add"), C(), we;
    }
    function oe(ee, U, W) {
      var J = a(ee, U), he = c.get(J);
      return he ? (he.data = W, he) : new o(ee, U, W, J);
    }
    function be(ee, U, W) {
      var J = a(ee, U), he = f.hasOwnProperty(J);
      if (he || He(ee, U)) {
        he || (f[J] = 0);
        var we = "@" + ++f[J];
        J = a(ee + we, U + we);
      }
      return new o(ee, U, W, J);
    }
    function ge() {
      return h.size;
    }
    function pe() {
      return c.size;
    }
    function Je(ee) {
      var U = D(ee);
      return U ? U.links : null;
    }
    function Le(ee, U) {
      return U !== void 0 && (ee = He(ee, U)), rt(ee);
    }
    function rt(ee) {
      if (!ee || !c.get(ee.id)) return !1;
      $(), c.delete(ee.id);
      var U = D(ee.fromId), W = D(ee.toId);
      return U && U.links.delete(ee), W && W.links.delete(ee), b(ee, "remove"), C(), !0;
    }
    function He(ee, U) {
      if (!(ee === void 0 || U === void 0))
        return c.get(a(ee, U));
    }
    function te() {
      $(), ae(function(ee) {
        L(ee.id);
      }), C();
    }
    function se(ee) {
      if (typeof ee == "function")
        for (var U = c.values(), W = U.next(); !W.done; ) {
          if (ee(W.value))
            return !0;
          W = U.next();
        }
    }
    function re(ee, U, W) {
      var J = D(ee);
      if (J && J.links && typeof U == "function")
        return W ? ve(J.links, ee, U) : ce(J.links, ee, U);
    }
    function ce(ee, U, W) {
      for (var J, he = ee.values(), we = he.next(); !we.done; ) {
        var Ue = we.value, wt = Ue.fromId === U ? Ue.toId : Ue.fromId;
        if (J = W(h.get(wt), Ue), J)
          return !0;
        we = he.next();
      }
    }
    function ve(ee, U, W) {
      for (var J, he = ee.values(), we = he.next(); !we.done; ) {
        var Ue = we.value;
        if (Ue.fromId === U && (J = W(h.get(Ue.toId), Ue), J))
          return !0;
        we = he.next();
      }
    }
    function xe() {
    }
    function Re() {
      p += 1;
    }
    function Ve() {
      p -= 1, p === 0 && m.length > 0 && (S.fire("changed", m), m.length = 0);
    }
    function ae(ee) {
      if (typeof ee != "function")
        throw new Error("Function is expected to iterate over graph nodes. You passed " + ee);
      for (var U = h.values(), W = U.next(); !W.done; ) {
        if (ee(W.value))
          return !0;
        W = U.next();
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
  return xc;
}
var II = AI();
const PI = /* @__PURE__ */ Ms(II), mu = class mu extends _t {
  constructor() {
    super(), this.nodeMapping = /* @__PURE__ */ new Map(), this.edgeMapping = /* @__PURE__ */ new Map(), this._settled = !0, this.ngraph = PI(), this.ngraphLayout = CI(this.ngraph, { dimensions: 3 });
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
let oh = mu;
const kI = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2)
}), vu = class vu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 70, this.config = kI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = kA(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
vu.type = "planar", vu.maxDimensions = 2;
let sh = vu;
const $I = Ie({
  ...vn.shape,
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2),
  seed: V().positive().or(Ke()).default(null)
}), _u = class _u extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = $I.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = $h(
      { nodes: e, edges: t },
      this.config.center,
      this.config.dim,
      this.config.seed
    );
  }
};
_u.type = "random", _u.maxDimensions = 3;
let ah = _u;
const OI = Ie({
  ...vn.shape,
  nlist: nt(nt(V())).or(Ke()).default(null),
  dim: V().default(2),
  center: nt(V()).length(2).or(Ke()).default(null),
  scale: V().positive().default(1)
}), yu = class yu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = OI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = SA(
      { nodes: e, edges: t },
      this.config.nlist,
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
yu.type = "shell", yu.maxDimensions = 2;
let uh = yu;
const NI = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2)
}), bu = class bu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 100, this.config = NI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = CA(
      { nodes: e, edges: t },
      this.config.scale,
      this.config.center,
      this.config.dim
    );
  }
};
bu.type = "spectral", bu.maxDimensions = 2;
let lh = bu;
const RI = Ie({
  ...vn.shape,
  scale: V().positive().default(1),
  center: nt(V()).length(2).or(Ke()).default(null),
  dim: V().default(2),
  resolution: V().positive().default(0.35),
  equidistant: vt().default(!1)
}), wu = class wu extends kn {
  constructor(e) {
    super(e), this.scalingFactor = 80, this.config = RI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = AA(
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
let ch = wu;
const zI = Ie({
  ...vn.shape,
  k: V().or(Ke()).default(null),
  pos: Cr(
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
    super(e), this.scalingFactor = 100, this.config = zI.parse(e);
  }
  doLayout() {
    this.stale = !1;
    const e = () => this._nodes.map((r) => r.id), t = () => this._edges.map((r) => [r.srcId, r.dstId]);
    this.positions = MA(
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
let hh = xu;
_t.register(th);
_t.register(oh);
_t.register(ch);
_t.register(Yc);
_t.register(uh);
_t.register(ah);
_t.register(hh);
_t.register(sh);
_t.register(rh);
_t.register(nh);
_t.register(Vc);
_t.register(lh);
_t.register(Kc);
_t.register(Jc);
_t.register(ih);
const ng = /* @__PURE__ */ new Map();
var Tu, ov;
class Dh {
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
    const o = ep(this, Tu, ov).call(this, t), a = this.graph.nodes.get(e);
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
    return ng.set(`${r}:${t}`, e), e;
  }
  static get(e, t, r) {
    const o = ng.get(`${t}:${r}`);
    return o ? new o(e) : null;
  }
}
Tu = new WeakSet(), ov = function(e) {
  const t = [];
  return t.push("algorithmResults"), t.push(this.namespace), t.push(this.type), t.push(e), t;
};
const Su = class Su extends Dh {
  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    const e = this.graph, t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
    function a(f, p) {
      let g = f.get(p);
      g ?? (g = 0), g++, f.set(p, g);
    }
    for (const f of e.edges.values())
      a(t, f.srcId), a(r, f.dstId), a(o, f.srcId), a(o, f.dstId);
    const u = Math.max(...t.values()), h = Math.max(...r.values()), c = Math.max(...o.values());
    for (const f of e.nodes.values()) {
      const p = t.get(f.id) ?? 0, g = r.get(f.id) ?? 0, m = o.get(f.id) ?? 0;
      this.addNodeResult(f.id, "inDegree", p), this.addNodeResult(f.id, "outDegree", g), this.addNodeResult(f.id, "degree", m), this.addNodeResult(f.id, "inDegreePct", p / u), this.addNodeResult(f.id, "outDegreePct", g / h), this.addNodeResult(f.id, "degreePct", m / c);
    }
  }
};
Su.namespace = "graphty", Su.type = "degree";
let fh = Su;
Dh.register(fh);
class DI {
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
class LI {
  constructor(e, t, r) {
    this.canvas = e, this.config = r, this.scene = t, this.scene.clearColor = new Eg(0, 0, 0, 1), this.pivot = new Cg("pivot", this.scene), this.cameraDistance = 10, this.camera = new S5("camera", new $t(0, 0, -this.cameraDistance), this.scene), this.camera.parent = this.pivot, this.camera.lockedTarget = this.pivot, this.camera.inputs.clear(), this.scene.activeCamera = this.camera, this.camera.attachControl(e, !0);
  }
  rotate(e, t) {
    this.pivot.rotate(Jl.Y, -e * this.config.trackballRotationSpeed, Yl.LOCAL), this.pivot.rotate(Jl.X, -t * this.config.trackballRotationSpeed, Yl.LOCAL);
  }
  spin(e) {
    this.pivot.rotate(Jl.Z, e, Yl.LOCAL);
  }
  zoom(e) {
    this.cameraDistance = rp.Clamp(this.cameraDistance + e, this.config.minZoomDistance, this.config.maxZoomDistance);
  }
  updateCameraPosition() {
    this.camera.position.copyFrom($t.Forward().scale(-this.cameraDistance));
  }
  zoomToBoundingBox(e, t) {
    const r = e.add(t).scale(0.5), o = t.subtract(e);
    this.pivot.position.copyFrom(r);
    const a = o.length();
    this.cameraDistance = rp.Clamp(a * 0.7, this.config.minZoomDistance, this.config.maxZoomDistance), this.updateCameraPosition();
  }
}
var Tc = { exports: {} };
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
var rg;
function BI() {
  return rg || (rg = 1, function(n) {
    (function(e, t, r, o) {
      var a = ["", "webkit", "Moz", "MS", "ms", "o"], u = t.createElement("div"), h = "function", c = Math.round, f = Math.abs, p = Date.now;
      function g(y, E, O) {
        return setTimeout(T(y, O), E);
      }
      function m(y, E, O) {
        return Array.isArray(y) ? (b(y, O[E], O), !0) : !1;
      }
      function b(y, E, O) {
        var Z;
        if (y)
          if (y.forEach)
            y.forEach(E, O);
          else if (y.length !== o)
            for (Z = 0; Z < y.length; )
              E.call(O, y[Z], Z, y), Z++;
          else
            for (Z in y)
              y.hasOwnProperty(Z) && E.call(O, y[Z], Z, y);
      }
      function _(y, E, O) {
        var Z = "DEPRECATED METHOD: " + E + `
` + O + ` AT 
`;
        return function() {
          var ie = new Error("get-stack-trace"), fe = ie && ie.stack ? ie.stack.replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@") : "Unknown Stack Trace", ze = e.console && (e.console.warn || e.console.log);
          return ze && ze.call(e.console, Z, fe), y.apply(this, arguments);
        };
      }
      var $;
      typeof Object.assign != "function" ? $ = function(E) {
        if (E === o || E === null)
          throw new TypeError("Cannot convert undefined or null to object");
        for (var O = Object(E), Z = 1; Z < arguments.length; Z++) {
          var ie = arguments[Z];
          if (ie !== o && ie !== null)
            for (var fe in ie)
              ie.hasOwnProperty(fe) && (O[fe] = ie[fe]);
        }
        return O;
      } : $ = Object.assign;
      var C = _(function(E, O, Z) {
        for (var ie = Object.keys(O), fe = 0; fe < ie.length; )
          (!Z || Z && E[ie[fe]] === o) && (E[ie[fe]] = O[ie[fe]]), fe++;
        return E;
      }, "extend", "Use `assign`."), S = _(function(E, O) {
        return C(E, O, !0);
      }, "merge", "Use `assign`.");
      function I(y, E, O) {
        var Z = E.prototype, ie;
        ie = y.prototype = Object.create(Z), ie.constructor = y, ie._super = Z, O && $(ie, O);
      }
      function T(y, E) {
        return function() {
          return y.apply(E, arguments);
        };
      }
      function A(y, E) {
        return typeof y == h ? y.apply(E && E[0] || o, E) : y;
      }
      function N(y, E) {
        return y === o ? E : y;
      }
      function D(y, E, O) {
        b(be(E), function(Z) {
          y.addEventListener(Z, O, !1);
        });
      }
      function L(y, E, O) {
        b(be(E), function(Z) {
          y.removeEventListener(Z, O, !1);
        });
      }
      function q(y, E) {
        for (; y; ) {
          if (y == E)
            return !0;
          y = y.parentNode;
        }
        return !1;
      }
      function oe(y, E) {
        return y.indexOf(E) > -1;
      }
      function be(y) {
        return y.trim().split(/\s+/g);
      }
      function ge(y, E, O) {
        if (y.indexOf && !O)
          return y.indexOf(E);
        for (var Z = 0; Z < y.length; ) {
          if (O && y[Z][O] == E || !O && y[Z] === E)
            return Z;
          Z++;
        }
        return -1;
      }
      function pe(y) {
        return Array.prototype.slice.call(y, 0);
      }
      function Je(y, E, O) {
        for (var Z = [], ie = [], fe = 0; fe < y.length; ) {
          var ze = y[fe][E];
          ge(ie, ze) < 0 && Z.push(y[fe]), ie[fe] = ze, fe++;
        }
        return Z = Z.sort(function(At, Rt) {
          return At[E] > Rt[E];
        }), Z;
      }
      function Le(y, E) {
        for (var O, Z, ie = E[0].toUpperCase() + E.slice(1), fe = 0; fe < a.length; ) {
          if (O = a[fe], Z = O ? O + ie : E, Z in y)
            return Z;
          fe++;
        }
        return o;
      }
      var rt = 1;
      function He() {
        return rt++;
      }
      function te(y) {
        var E = y.ownerDocument || y;
        return E.defaultView || E.parentWindow || e;
      }
      var se = /mobile|tablet|ip(ad|hone|od)|android/i, re = "ontouchstart" in e, ce = Le(e, "PointerEvent") !== o, ve = re && se.test(navigator.userAgent), xe = "touch", Re = "pen", Ve = "mouse", ae = "kinect", ee = 25, U = 1, W = 2, J = 4, he = 8, we = 1, Ue = 2, wt = 4, $e = 8, tt = 16, Nt = Ue | wt, xt = $e | tt, On = Nt | xt, Se = ["x", "y"], Ft = ["clientX", "clientY"];
      function Qe(y, E) {
        var O = this;
        this.manager = y, this.callback = E, this.element = y.element, this.target = y.options.inputTarget, this.domHandler = function(Z) {
          A(y.options.enable, [y]) && O.handler(Z);
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
          this.evEl && D(this.element, this.evEl, this.domHandler), this.evTarget && D(this.target, this.evTarget, this.domHandler), this.evWin && D(te(this.element), this.evWin, this.domHandler);
        },
        /**
         * unbind the events
         */
        destroy: function() {
          this.evEl && L(this.element, this.evEl, this.domHandler), this.evTarget && L(this.target, this.evTarget, this.domHandler), this.evWin && L(te(this.element), this.evWin, this.domHandler);
        }
      };
      function yn(y) {
        var E, O = y.options.inputClass;
        return O ? E = O : ce ? E = hr : ve ? E = Rn : re ? E = To : E = Ht, new E(y, Nn);
      }
      function Nn(y, E, O) {
        var Z = O.pointers.length, ie = O.changedPointers.length, fe = E & U && Z - ie === 0, ze = E & (J | he) && Z - ie === 0;
        O.isFirst = !!fe, O.isFinal = !!ze, fe && (y.session = {}), O.eventType = E, wo(y, O), y.emit("hammer.input", O), y.recognize(O), y.session.prevInput = O;
      }
      function wo(y, E) {
        var O = y.session, Z = E.pointers, ie = Z.length;
        O.firstInput || (O.firstInput = k(E)), ie > 1 && !O.firstMultiple ? O.firstMultiple = k(E) : ie === 1 && (O.firstMultiple = !1);
        var fe = O.firstInput, ze = O.firstMultiple, Mt = ze ? ze.center : fe.center, At = E.center = z(Z);
        E.timeStamp = p(), E.deltaTime = E.timeStamp - fe.timeStamp, E.angle = Ae(Mt, At), E.distance = le(Mt, At), cr(O, E), E.offsetDirection = Q(E.deltaX, E.deltaY);
        var Rt = H(E.deltaTime, E.deltaX, E.deltaY);
        E.overallVelocityX = Rt.x, E.overallVelocityY = Rt.y, E.overallVelocity = f(Rt.x) > f(Rt.y) ? Rt.x : Rt.y, E.scale = ze ? St(ze.pointers, Z) : 1, E.rotation = ze ? Be(ze.pointers, Z) : 0, E.maxPointers = O.prevInput ? E.pointers.length > O.prevInput.maxPointers ? E.pointers.length : O.prevInput.maxPointers : E.pointers.length, x(O, E);
        var Dn = y.element;
        q(E.srcEvent.target, Dn) && (Dn = E.srcEvent.target), E.target = Dn;
      }
      function cr(y, E) {
        var O = E.center, Z = y.offsetDelta || {}, ie = y.prevDelta || {}, fe = y.prevInput || {};
        (E.eventType === U || fe.eventType === J) && (ie = y.prevDelta = {
          x: fe.deltaX || 0,
          y: fe.deltaY || 0
        }, Z = y.offsetDelta = {
          x: O.x,
          y: O.y
        }), E.deltaX = ie.x + (O.x - Z.x), E.deltaY = ie.y + (O.y - Z.y);
      }
      function x(y, E) {
        var O = y.lastInterval || E, Z = E.timeStamp - O.timeStamp, ie, fe, ze, Mt;
        if (E.eventType != he && (Z > ee || O.velocity === o)) {
          var At = E.deltaX - O.deltaX, Rt = E.deltaY - O.deltaY, Dn = H(Z, At, Rt);
          fe = Dn.x, ze = Dn.y, ie = f(Dn.x) > f(Dn.y) ? Dn.x : Dn.y, Mt = Q(At, Rt), y.lastInterval = E;
        } else
          ie = O.velocity, fe = O.velocityX, ze = O.velocityY, Mt = O.direction;
        E.velocity = ie, E.velocityX = fe, E.velocityY = ze, E.direction = Mt;
      }
      function k(y) {
        for (var E = [], O = 0; O < y.pointers.length; )
          E[O] = {
            clientX: c(y.pointers[O].clientX),
            clientY: c(y.pointers[O].clientY)
          }, O++;
        return {
          timeStamp: p(),
          pointers: E,
          center: z(E),
          deltaX: y.deltaX,
          deltaY: y.deltaY
        };
      }
      function z(y) {
        var E = y.length;
        if (E === 1)
          return {
            x: c(y[0].clientX),
            y: c(y[0].clientY)
          };
        for (var O = 0, Z = 0, ie = 0; ie < E; )
          O += y[ie].clientX, Z += y[ie].clientY, ie++;
        return {
          x: c(O / E),
          y: c(Z / E)
        };
      }
      function H(y, E, O) {
        return {
          x: E / y || 0,
          y: O / y || 0
        };
      }
      function Q(y, E) {
        return y === E ? we : f(y) >= f(E) ? y < 0 ? Ue : wt : E < 0 ? $e : tt;
      }
      function le(y, E, O) {
        O || (O = Se);
        var Z = E[O[0]] - y[O[0]], ie = E[O[1]] - y[O[1]];
        return Math.sqrt(Z * Z + ie * ie);
      }
      function Ae(y, E, O) {
        O || (O = Se);
        var Z = E[O[0]] - y[O[0]], ie = E[O[1]] - y[O[1]];
        return Math.atan2(ie, Z) * 180 / Math.PI;
      }
      function Be(y, E) {
        return Ae(E[1], E[0], Ft) + Ae(y[1], y[0], Ft);
      }
      function St(y, E) {
        return le(E[0], E[1], Ft) / le(y[0], y[1], Ft);
      }
      var Kt = {
        mousedown: U,
        mousemove: W,
        mouseup: J
      }, ut = "mousedown", Te = "mousemove mouseup";
      function Ht() {
        this.evEl = ut, this.evWin = Te, this.pressed = !1, Qe.apply(this, arguments);
      }
      I(Ht, Qe, {
        /**
         * handle mouse events
         * @param {Object} ev
         */
        handler: function(E) {
          var O = Kt[E.type];
          O & U && E.button === 0 && (this.pressed = !0), O & W && E.which !== 1 && (O = J), this.pressed && (O & J && (this.pressed = !1), this.callback(this.manager, O, {
            pointers: [E],
            changedPointers: [E],
            pointerType: Ve,
            srcEvent: E
          }));
        }
      });
      var xo = {
        pointerdown: U,
        pointermove: W,
        pointerup: J,
        pointercancel: he,
        pointerout: he
      }, oi = {
        2: xe,
        3: Re,
        4: Ve,
        5: ae
        // see https://twitter.com/jacobrossi/status/480596438489890816
      }, Pr = "pointerdown", kr = "pointermove pointerup pointercancel";
      e.MSPointerEvent && !e.PointerEvent && (Pr = "MSPointerDown", kr = "MSPointerMove MSPointerUp MSPointerCancel");
      function hr() {
        this.evEl = Pr, this.evWin = kr, Qe.apply(this, arguments), this.store = this.manager.session.pointerEvents = [];
      }
      I(hr, Qe, {
        /**
         * handle mouse events
         * @param {Object} ev
         */
        handler: function(E) {
          var O = this.store, Z = !1, ie = E.type.toLowerCase().replace("ms", ""), fe = xo[ie], ze = oi[E.pointerType] || E.pointerType, Mt = ze == xe, At = ge(O, E.pointerId, "pointerId");
          fe & U && (E.button === 0 || Mt) ? At < 0 && (O.push(E), At = O.length - 1) : fe & (J | he) && (Z = !0), !(At < 0) && (O[At] = E, this.callback(this.manager, fe, {
            pointers: O,
            changedPointers: [E],
            pointerType: ze,
            srcEvent: E
          }), Z && O.splice(At, 1));
        }
      });
      var Jt = {
        touchstart: U,
        touchmove: W,
        touchend: J,
        touchcancel: he
      }, zi = "touchstart", si = "touchstart touchmove touchend touchcancel";
      function $r() {
        this.evTarget = zi, this.evWin = si, this.started = !1, Qe.apply(this, arguments);
      }
      I($r, Qe, {
        handler: function(E) {
          var O = Jt[E.type];
          if (O === U && (this.started = !0), !!this.started) {
            var Z = ai.call(this, E, O);
            O & (J | he) && Z[0].length - Z[1].length === 0 && (this.started = !1), this.callback(this.manager, O, {
              pointers: Z[0],
              changedPointers: Z[1],
              pointerType: xe,
              srcEvent: E
            });
          }
        }
      });
      function ai(y, E) {
        var O = pe(y.touches), Z = pe(y.changedTouches);
        return E & (J | he) && (O = Je(O.concat(Z), "identifier")), [O, Z];
      }
      var ui = {
        touchstart: U,
        touchmove: W,
        touchend: J,
        touchcancel: he
      }, Or = "touchstart touchmove touchend touchcancel";
      function Rn() {
        this.evTarget = Or, this.targetIds = {}, Qe.apply(this, arguments);
      }
      I(Rn, Qe, {
        handler: function(E) {
          var O = ui[E.type], Z = Di.call(this, E, O);
          Z && this.callback(this.manager, O, {
            pointers: Z[0],
            changedPointers: Z[1],
            pointerType: xe,
            srcEvent: E
          });
        }
      });
      function Di(y, E) {
        var O = pe(y.touches), Z = this.targetIds;
        if (E & (U | W) && O.length === 1)
          return Z[O[0].identifier] = !0, [O, O];
        var ie, fe, ze = pe(y.changedTouches), Mt = [], At = this.target;
        if (fe = O.filter(function(Rt) {
          return q(Rt.target, At);
        }), E === U)
          for (ie = 0; ie < fe.length; )
            Z[fe[ie].identifier] = !0, ie++;
        for (ie = 0; ie < ze.length; )
          Z[ze[ie].identifier] && Mt.push(ze[ie]), E & (J | he) && delete Z[ze[ie].identifier], ie++;
        if (Mt.length)
          return [
            // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
            Je(fe.concat(Mt), "identifier"),
            Mt
          ];
      }
      var Nr = 2500, Cs = 25;
      function To() {
        Qe.apply(this, arguments);
        var y = T(this.handler, this);
        this.touch = new Rn(this.manager, y), this.mouse = new Ht(this.manager, y), this.primaryTouch = null, this.lastTouches = [];
      }
      I(To, Qe, {
        /**
         * handle mouse and touch events
         * @param {Hammer} manager
         * @param {String} inputEvent
         * @param {Object} inputData
         */
        handler: function(E, O, Z) {
          var ie = Z.pointerType == xe, fe = Z.pointerType == Ve;
          if (!(fe && Z.sourceCapabilities && Z.sourceCapabilities.firesTouchEvents)) {
            if (ie)
              Nu.call(this, O, Z);
            else if (fe && Ru.call(this, Z))
              return;
            this.callback(E, O, Z);
          }
        },
        /**
         * remove the event listeners
         */
        destroy: function() {
          this.touch.destroy(), this.mouse.destroy();
        }
      });
      function Nu(y, E) {
        y & U ? (this.primaryTouch = E.changedPointers[0].identifier, As.call(this, E)) : y & (J | he) && As.call(this, E);
      }
      function As(y) {
        var E = y.changedPointers[0];
        if (E.identifier === this.primaryTouch) {
          var O = { x: E.clientX, y: E.clientY };
          this.lastTouches.push(O);
          var Z = this.lastTouches, ie = function() {
            var fe = Z.indexOf(O);
            fe > -1 && Z.splice(fe, 1);
          };
          setTimeout(ie, Nr);
        }
      }
      function Ru(y) {
        for (var E = y.srcEvent.clientX, O = y.srcEvent.clientY, Z = 0; Z < this.lastTouches.length; Z++) {
          var ie = this.lastTouches[Z], fe = Math.abs(E - ie.x), ze = Math.abs(O - ie.y);
          if (fe <= Cs && ze <= Cs)
            return !0;
        }
        return !1;
      }
      var Is = Le(u.style, "touchAction"), Ps = Is !== o, ks = "compute", So = "auto", Mo = "manipulation", fr = "none", li = "pan-x", ci = "pan-y", Li = zu();
      function Eo(y, E) {
        this.manager = y, this.set(E);
      }
      Eo.prototype = {
        /**
         * set the touchAction value on the element or enable the polyfill
         * @param {String} value
         */
        set: function(y) {
          y == ks && (y = this.compute()), Ps && this.manager.element.style && Li[y] && (this.manager.element.style[Is] = y), this.actions = y.toLowerCase().trim();
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
          return b(this.manager.recognizers, function(E) {
            A(E.options.enable, [E]) && (y = y.concat(E.getTouchAction()));
          }), Bi(y.join(" "));
        },
        /**
         * this method is called on each input cycle and provides the preventing of the browser behavior
         * @param {Object} input
         */
        preventDefaults: function(y) {
          var E = y.srcEvent, O = y.offsetDirection;
          if (this.manager.session.prevented) {
            E.preventDefault();
            return;
          }
          var Z = this.actions, ie = oe(Z, fr) && !Li[fr], fe = oe(Z, ci) && !Li[ci], ze = oe(Z, li) && !Li[li];
          if (ie) {
            var Mt = y.pointers.length === 1, At = y.distance < 2, Rt = y.deltaTime < 250;
            if (Mt && At && Rt)
              return;
          }
          if (!(ze && fe) && (ie || fe && O & Nt || ze && O & xt))
            return this.preventSrc(E);
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
        if (oe(y, fr))
          return fr;
        var E = oe(y, li), O = oe(y, ci);
        return E && O ? fr : E || O ? E ? li : ci : oe(y, Mo) ? Mo : So;
      }
      function zu() {
        if (!Ps)
          return !1;
        var y = {}, E = e.CSS && e.CSS.supports;
        return ["auto", "manipulation", "pan-y", "pan-x", "pan-x pan-y", "none"].forEach(function(O) {
          y[O] = E ? e.CSS.supports("touch-action", O) : !0;
        }), y;
      }
      var dr = 1, sn = 2, Rr = 4, ir = 8, zn = ir, zr = 16, bn = 32;
      function Yn(y) {
        this.options = $({}, this.defaults, y || {}), this.id = He(), this.manager = null, this.options.enable = N(this.options.enable, !0), this.state = dr, this.simultaneous = {}, this.requireFail = [];
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
          return $(this.options, y), this.manager && this.manager.touchAction.update(), this;
        },
        /**
         * recognize simultaneous with an other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        recognizeWith: function(y) {
          if (m(y, "recognizeWith", this))
            return this;
          var E = this.simultaneous;
          return y = Fi(y, this), E[y.id] || (E[y.id] = y, y.recognizeWith(this)), this;
        },
        /**
         * drop the simultaneous link. it doesnt remove the link on the other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        dropRecognizeWith: function(y) {
          return m(y, "dropRecognizeWith", this) ? this : (y = Fi(y, this), delete this.simultaneous[y.id], this);
        },
        /**
         * recognizer can only run when an other is failing
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        requireFailure: function(y) {
          if (m(y, "requireFailure", this))
            return this;
          var E = this.requireFail;
          return y = Fi(y, this), ge(E, y) === -1 && (E.push(y), y.requireFailure(this)), this;
        },
        /**
         * drop the requireFailure link. it does not remove the link on the other recognizer.
         * @param {Recognizer} otherRecognizer
         * @returns {Recognizer} this
         */
        dropRequireFailure: function(y) {
          if (m(y, "dropRequireFailure", this))
            return this;
          y = Fi(y, this);
          var E = ge(this.requireFail, y);
          return E > -1 && this.requireFail.splice(E, 1), this;
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
          var E = this, O = this.state;
          function Z(ie) {
            E.manager.emit(ie, y);
          }
          O < ir && Z(E.options.event + $s(O)), Z(E.options.event), y.additionalEvent && Z(y.additionalEvent), O >= ir && Z(E.options.event + $s(O));
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
          var E = $({}, y);
          if (!A(this.options.enable, [this, E])) {
            this.reset(), this.state = bn;
            return;
          }
          this.state & (zn | zr | bn) && (this.state = dr), this.state = this.process(E), this.state & (sn | Rr | ir | zr) && this.tryEmit(E);
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
      function $s(y) {
        return y & zr ? "cancel" : y & ir ? "end" : y & Rr ? "move" : y & sn ? "start" : "";
      }
      function Os(y) {
        return y == tt ? "down" : y == $e ? "up" : y == Ue ? "left" : y == wt ? "right" : "";
      }
      function Fi(y, E) {
        var O = E.manager;
        return O ? O.get(y) : y;
      }
      function an() {
        Yn.apply(this, arguments);
      }
      I(an, Yn, {
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
          var E = this.options.pointers;
          return E === 0 || y.pointers.length === E;
        },
        /**
         * Process the input and return the state for the recognizer
         * @memberof AttrRecognizer
         * @param {Object} input
         * @returns {*} State
         */
        process: function(y) {
          var E = this.state, O = y.eventType, Z = E & (sn | Rr), ie = this.attrTest(y);
          return Z && (O & he || !ie) ? E | zr : Z || ie ? O & J ? E | ir : E & sn ? E | Rr : sn : bn;
        }
      });
      function hi() {
        an.apply(this, arguments), this.pX = null, this.pY = null;
      }
      I(hi, an, {
        /**
         * @namespace
         * @memberof PanRecognizer
         */
        defaults: {
          event: "pan",
          threshold: 10,
          pointers: 1,
          direction: On
        },
        getTouchAction: function() {
          var y = this.options.direction, E = [];
          return y & Nt && E.push(ci), y & xt && E.push(li), E;
        },
        directionTest: function(y) {
          var E = this.options, O = !0, Z = y.distance, ie = y.direction, fe = y.deltaX, ze = y.deltaY;
          return ie & E.direction || (E.direction & Nt ? (ie = fe === 0 ? we : fe < 0 ? Ue : wt, O = fe != this.pX, Z = Math.abs(y.deltaX)) : (ie = ze === 0 ? we : ze < 0 ? $e : tt, O = ze != this.pY, Z = Math.abs(y.deltaY))), y.direction = ie, O && Z > E.threshold && ie & E.direction;
        },
        attrTest: function(y) {
          return an.prototype.attrTest.call(this, y) && (this.state & sn || !(this.state & sn) && this.directionTest(y));
        },
        emit: function(y) {
          this.pX = y.deltaX, this.pY = y.deltaY;
          var E = Os(y.direction);
          E && (y.additionalEvent = this.options.event + E), this._super.emit.call(this, y);
        }
      });
      function Ui() {
        an.apply(this, arguments);
      }
      I(Ui, an, {
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
            var E = y.scale < 1 ? "in" : "out";
            y.additionalEvent = this.options.event + E;
          }
          this._super.emit.call(this, y);
        }
      });
      function fi() {
        Yn.apply(this, arguments), this._timer = null, this._input = null;
      }
      I(fi, Yn, {
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
          var E = this.options, O = y.pointers.length === E.pointers, Z = y.distance < E.threshold, ie = y.deltaTime > E.time;
          if (this._input = y, !Z || !O || y.eventType & (J | he) && !ie)
            this.reset();
          else if (y.eventType & U)
            this.reset(), this._timer = g(function() {
              this.state = zn, this.tryEmit();
            }, E.time, this);
          else if (y.eventType & J)
            return zn;
          return bn;
        },
        reset: function() {
          clearTimeout(this._timer);
        },
        emit: function(y) {
          this.state === zn && (y && y.eventType & J ? this.manager.emit(this.options.event + "up", y) : (this._input.timeStamp = p(), this.manager.emit(this.options.event, this._input)));
        }
      });
      function Co() {
        an.apply(this, arguments);
      }
      I(Co, an, {
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
      I(Zi, an, {
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
          var E = this.options.direction, O;
          return E & (Nt | xt) ? O = y.overallVelocity : E & Nt ? O = y.overallVelocityX : E & xt && (O = y.overallVelocityY), this._super.attrTest.call(this, y) && E & y.offsetDirection && y.distance > this.options.threshold && y.maxPointers == this.options.pointers && f(O) > this.options.velocity && y.eventType & J;
        },
        emit: function(y) {
          var E = Os(y.offsetDirection);
          E && this.manager.emit(this.options.event + E, y), this.manager.emit(this.options.event, y);
        }
      });
      function pr() {
        Yn.apply(this, arguments), this.pTime = !1, this.pCenter = !1, this._timer = null, this._input = null, this.count = 0;
      }
      I(pr, Yn, {
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
          return [Mo];
        },
        process: function(y) {
          var E = this.options, O = y.pointers.length === E.pointers, Z = y.distance < E.threshold, ie = y.deltaTime < E.time;
          if (this.reset(), y.eventType & U && this.count === 0)
            return this.failTimeout();
          if (Z && ie && O) {
            if (y.eventType != J)
              return this.failTimeout();
            var fe = this.pTime ? y.timeStamp - this.pTime < E.interval : !0, ze = !this.pCenter || le(this.pCenter, y.center) < E.posThreshold;
            this.pTime = y.timeStamp, this.pCenter = y.center, !ze || !fe ? this.count = 1 : this.count += 1, this._input = y;
            var Mt = this.count % E.taps;
            if (Mt === 0)
              return this.hasRequireFailures() ? (this._timer = g(function() {
                this.state = zn, this.tryEmit();
              }, E.interval, this), sn) : zn;
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
          this.state == zn && (this._input.tapCount = this.count, this.manager.emit(this.options.event, this._input));
        }
      });
      function Qn(y, E) {
        return E = E || {}, E.recognizers = N(E.recognizers, Qn.defaults.preset), new qi(y, E);
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
        touchAction: ks,
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
          [Co, { enable: !1 }],
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
      var Du = 1, Ao = 2;
      function qi(y, E) {
        this.options = $({}, Qn.defaults, E || {}), this.options.inputTarget = this.options.inputTarget || y, this.handlers = {}, this.session = {}, this.recognizers = [], this.oldCssProps = {}, this.element = y, this.input = yn(this), this.touchAction = new Eo(this, this.options.touchAction), Gi(this, !0), b(this.options.recognizers, function(O) {
          var Z = this.add(new O[0](O[1]));
          O[2] && Z.recognizeWith(O[2]), O[3] && Z.requireFailure(O[3]);
        }, this);
      }
      qi.prototype = {
        /**
         * set options
         * @param {Object} options
         * @returns {Manager}
         */
        set: function(y) {
          return $(this.options, y), y.touchAction && this.touchAction.update(), y.inputTarget && (this.input.destroy(), this.input.target = y.inputTarget, this.input.init()), this;
        },
        /**
         * stop recognizing for this session.
         * This session will be discarded, when a new [input]start event is fired.
         * When forced, the recognizer cycle is stopped immediately.
         * @param {Boolean} [force]
         */
        stop: function(y) {
          this.session.stopped = y ? Ao : Du;
        },
        /**
         * run the recognizers!
         * called by the inputHandler function on every movement of the pointers (touches)
         * it walks through all the recognizers and tries to detect the gesture that is being made
         * @param {Object} inputData
         */
        recognize: function(y) {
          var E = this.session;
          if (!E.stopped) {
            this.touchAction.preventDefaults(y);
            var O, Z = this.recognizers, ie = E.curRecognizer;
            (!ie || ie && ie.state & zn) && (ie = E.curRecognizer = null);
            for (var fe = 0; fe < Z.length; )
              O = Z[fe], E.stopped !== Ao && // 1
              (!ie || O == ie || // 2
              O.canRecognizeWith(ie)) ? O.recognize(y) : O.reset(), !ie && O.state & (sn | Rr | ir) && (ie = E.curRecognizer = O), fe++;
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
          for (var E = this.recognizers, O = 0; O < E.length; O++)
            if (E[O].options.event == y)
              return E[O];
          return null;
        },
        /**
         * add a recognizer to the manager
         * existing recognizers with the same event name will be removed
         * @param {Recognizer} recognizer
         * @returns {Recognizer|Manager}
         */
        add: function(y) {
          if (m(y, "add", this))
            return this;
          var E = this.get(y.options.event);
          return E && this.remove(E), this.recognizers.push(y), y.manager = this, this.touchAction.update(), y;
        },
        /**
         * remove a recognizer by name or instance
         * @param {Recognizer|String} recognizer
         * @returns {Manager}
         */
        remove: function(y) {
          if (m(y, "remove", this))
            return this;
          if (y = this.get(y), y) {
            var E = this.recognizers, O = ge(E, y);
            O !== -1 && (E.splice(O, 1), this.touchAction.update());
          }
          return this;
        },
        /**
         * bind event
         * @param {String} events
         * @param {Function} handler
         * @returns {EventEmitter} this
         */
        on: function(y, E) {
          if (y !== o && E !== o) {
            var O = this.handlers;
            return b(be(y), function(Z) {
              O[Z] = O[Z] || [], O[Z].push(E);
            }), this;
          }
        },
        /**
         * unbind event, leave emit blank to remove all handlers
         * @param {String} events
         * @param {Function} [handler]
         * @returns {EventEmitter} this
         */
        off: function(y, E) {
          if (y !== o) {
            var O = this.handlers;
            return b(be(y), function(Z) {
              E ? O[Z] && O[Z].splice(ge(O[Z], E), 1) : delete O[Z];
            }), this;
          }
        },
        /**
         * emit event to the listeners
         * @param {String} event
         * @param {Object} data
         */
        emit: function(y, E) {
          this.options.domEvents && Lu(y, E);
          var O = this.handlers[y] && this.handlers[y].slice();
          if (!(!O || !O.length)) {
            E.type = y, E.preventDefault = function() {
              E.srcEvent.preventDefault();
            };
            for (var Z = 0; Z < O.length; )
              O[Z](E), Z++;
          }
        },
        /**
         * destroy the manager and unbinds all events
         * it doesn't unbind dom events, that is the user own responsibility
         */
        destroy: function() {
          this.element && Gi(this, !1), this.handlers = {}, this.session = {}, this.input.destroy(), this.element = null;
        }
      };
      function Gi(y, E) {
        var O = y.element;
        if (O.style) {
          var Z;
          b(y.options.cssProps, function(ie, fe) {
            Z = Le(O.style, fe), E ? (y.oldCssProps[Z] = O.style[Z], O.style[Z] = ie) : O.style[Z] = y.oldCssProps[Z] || "";
          }), E || (y.oldCssProps = {});
        }
      }
      function Lu(y, E) {
        var O = t.createEvent("Event");
        O.initEvent(y, !0, !0), O.gesture = E, E.target.dispatchEvent(O);
      }
      $(Qn, {
        INPUT_START: U,
        INPUT_MOVE: W,
        INPUT_END: J,
        INPUT_CANCEL: he,
        STATE_POSSIBLE: dr,
        STATE_BEGAN: sn,
        STATE_CHANGED: Rr,
        STATE_ENDED: ir,
        STATE_RECOGNIZED: zn,
        STATE_CANCELLED: zr,
        STATE_FAILED: bn,
        DIRECTION_NONE: we,
        DIRECTION_LEFT: Ue,
        DIRECTION_RIGHT: wt,
        DIRECTION_UP: $e,
        DIRECTION_DOWN: tt,
        DIRECTION_HORIZONTAL: Nt,
        DIRECTION_VERTICAL: xt,
        DIRECTION_ALL: On,
        Manager: qi,
        Input: Qe,
        TouchAction: Eo,
        TouchInput: Rn,
        MouseInput: Ht,
        PointerEventInput: hr,
        TouchMouseInput: To,
        SingleTouchInput: $r,
        Recognizer: Yn,
        AttrRecognizer: an,
        Tap: pr,
        Pan: hi,
        Swipe: Zi,
        Pinch: Ui,
        Rotate: Co,
        Press: fi,
        on: D,
        off: L,
        each: b,
        merge: S,
        extend: C,
        assign: $,
        inherit: I,
        bindFn: T,
        prefixed: Le
      });
      var Ns = typeof e < "u" ? e : typeof self < "u" ? self : {};
      Ns.Hammer = Qn, n.exports ? n.exports = Qn : e[r] = Qn;
    })(window, document, "Hammer");
  }(Tc)), Tc.exports;
}
var FI = BI();
const Ci = /* @__PURE__ */ Ms(FI);
class UI {
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
    this.hammer = new Ci.Manager(this.canvas), this.hammer.add(new Ci.Pinch()), this.hammer.add(new Ci.Rotate());
    let e = 0, t = 1;
    this.hammer.on("pinchstart rotatestart", () => {
      this.isMultiTouch = !0, e = 0, t = 1;
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
class ZI {
  constructor(e, t, r, o) {
    this.scene = e, this.engine = t, this.canvas = r, this.config = o, this.velocity = { x: 0, y: 0, zoom: 0, rotate: 0 }, this.camera = new M5("orthoCamera", new $t(0, 0, -10), e), this.camera.mode = E5.ORTHOGRAPHIC_CAMERA, this.camera.inertia = 0, this.camera.inputs.clear(), this.parent = new Cg("parent", e), this.updateOrtho(o.initialOrthoSize), this.camera.setTarget($t.Zero());
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
class qI {
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
        case Go.POINTERDOWN:
          e = !0, t = a.clientX, r = a.clientY, this.pointerDownHandler();
          break;
        case Go.POINTERUP:
          e = !1;
          break;
        case Go.POINTERMOVE:
          if (e && a.buttons === 1) {
            const u = this.cam.camera.orthoRight ?? 1, h = this.cam.camera.orthoLeft ?? 1, c = this.cam.camera.orthoTop ?? 1, f = this.cam.camera.orthoBottom ?? 1, p = (u - h) / this.cam.engine.getRenderWidth(), g = (c - f) / this.cam.engine.getRenderHeight(), m = a.clientX - t, b = a.clientY - r;
            this.cam.pan(-m * p * this.config.mousePanScale, b * g * this.config.mousePanScale), t = a.clientX, r = a.clientY;
          }
          break;
      }
    }), this.cam.scene.onPrePointerObservable.add((o) => {
      const a = o.event;
      if (o.type === Go.POINTERWHEEL) {
        const u = a.deltaY > 0 ? this.config.mouseWheelZoomSpeed : 1 / this.config.mouseWheelZoomSpeed;
        this.cam.zoom(u), a.preventDefault();
      }
    }, Go.POINTERWHEEL);
  }
  setupTouch() {
    this.hammer = new Ci.Manager(this.canvas);
    const e = new Ci.Pan({ threshold: 0, pointers: 0 }), t = new Ci.Pinch(), r = new Ci.Rotate();
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
      const a = this.cam.camera.orthoRight ?? 1, u = this.cam.camera.orthoLeft ?? 1, h = this.cam.camera.orthoTop ?? 1, c = this.cam.camera.orthoBottom ?? 1, f = (a - u) / this.cam.engine.getRenderWidth(), p = (h - c) / this.cam.engine.getRenderHeight(), g = o.center.x - this.gestureSession.panX, m = o.center.y - this.gestureSession.panY;
      this.cam.camera.position.x = this.gestureSession.panStartX - g * f * this.config.touchPanScale, this.cam.camera.position.y = this.gestureSession.panStartY + m * p * this.config.touchPanScale;
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
class GI {
  constructor() {
    this.meshCacheMap = /* @__PURE__ */ new Map(), this.hits = 0, this.misses = 0;
  }
  get(e, t) {
    let r = this.meshCacheMap.get(e);
    return r ? (this.hits++, r.createInstance(`${e}`)) : (this.misses++, r = t(), r.isVisible = !1, this.meshCacheMap.set(e, r), r.createInstance(`${e}`));
  }
  reset() {
    this.hits = 0, this.misses = 0;
  }
}
const Wr = ".", Lh = Symbol("target"), sv = Symbol("unsubscribe");
function dh(n) {
  return n instanceof Date || n instanceof Set || n instanceof Map || n instanceof WeakSet || n instanceof WeakMap || ArrayBuffer.isView(n);
}
function HI(n) {
  return (typeof n == "object" ? n === null : typeof n != "function") || n instanceof RegExp;
}
const tn = Array.isArray;
function iu(n) {
  return typeof n == "symbol";
}
const dn = {
  after(n, e) {
    return tn(n) ? n.slice(e.length) : e === "" ? n : n.slice(e.length + 1);
  },
  concat(n, e) {
    return tn(n) ? (n = [...n], e && n.push(e), n) : e && e.toString !== void 0 ? (n !== "" && (n += Wr), iu(e) ? n + e.toString() : n + e) : n;
  },
  initial(n) {
    if (tn(n))
      return n.slice(0, -1);
    if (n === "")
      return n;
    const e = n.lastIndexOf(Wr);
    return e === -1 ? "" : n.slice(0, e);
  },
  last(n) {
    if (tn(n))
      return n.at(-1) ?? "";
    if (n === "")
      return n;
    const e = n.lastIndexOf(Wr);
    return e === -1 ? n : n.slice(e + 1);
  },
  walk(n, e) {
    if (tn(n))
      for (const t of n)
        e(t);
    else if (n !== "") {
      let t = 0, r = n.indexOf(Wr);
      if (r === -1)
        e(n);
      else
        for (; t < n.length; )
          r === -1 && (r = n.length), e(n.slice(t, r)), t = r + 1, r = n.indexOf(Wr, t);
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
    return n.length < e.length ? !1 : n === e ? !0 : n.startsWith(e) ? n[e.length] === Wr : !1;
  },
  isRootPath(n) {
    return tn(n) ? n.length === 0 : n === "";
  }
};
function WI(n) {
  return typeof n == "object" && typeof n.next == "function";
}
function jI(n, e, t, r, o) {
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
    const u = t[Lh].keys();
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
function ig(n, e, t) {
  return n.isUnsubscribed || e.ignoreSymbols && iu(t) || e.ignoreUnderscores && t.charAt(0) === "_" || "ignoreKeys" in e && e.ignoreKeys.includes(t);
}
class VI {
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
function ph(n) {
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
]), KI = /* @__PURE__ */ new Set([
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
}, JI = /* @__PURE__ */ new Set([
  ...av,
  ...KI,
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
}, YI = /* @__PURE__ */ new Set([
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
const QI = /* @__PURE__ */ new Set([...cv, "get"]), fv = {
  set: Ua,
  clear: Ua,
  delete: Ua,
  forEach: Ua
}, XI = /* @__PURE__ */ new Set([
  ...QI,
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
    if (ph(e))
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
class og extends ri {
  static isHandledMethod(e) {
    return JI.has(e);
  }
}
class e4 extends ri {
  undo(e) {
    e.setTime(this.clone.getTime());
  }
  isChanged(e, t) {
    return !t(this.clone.valueOf(), e.valueOf());
  }
}
class sg extends ri {
  static isHandledMethod(e) {
    return YI.has(e);
  }
  undo(e) {
    for (const t of this.clone)
      e.add(t);
    for (const t of e)
      this.clone.has(t) || e.delete(t);
  }
}
class ag extends ri {
  static isHandledMethod(e) {
    return XI.has(e);
  }
  undo(e) {
    for (const [t, r] of this.clone.entries())
      e.set(t, r);
    for (const t of e.keys())
      this.clone.has(t) || e.delete(t);
  }
}
class t4 extends ri {
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
class n4 extends ri {
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
    return ph(e) || tn(e) || dh(e);
  }
  static isHandledMethod(e, t) {
    return ph(e) ? ri.isHandledMethod(t) : tn(e) ? og.isHandledMethod(t) : e instanceof Set ? sg.isHandledMethod(t) : e instanceof Map ? ag.isHandledMethod(t) : dh(e);
  }
  get isCloning() {
    return this._stack.length > 0;
  }
  start(e, t, r) {
    let o = ri;
    tn(e) ? o = og : e instanceof Date ? o = e4 : e instanceof Set ? o = sg : e instanceof Map ? o = ag : e instanceof WeakSet ? o = t4 : e instanceof WeakMap && (o = n4), this._stack.push(new o(e, t, r, this._hasOnValidate));
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
const r4 = {
  equals: Object.is,
  isShallow: !1,
  pathAsArray: !1,
  ignoreSymbols: !1,
  ignoreUnderscores: !1,
  ignoreDetached: !1,
  details: !1
}, Bh = (n, e, t = {}) => {
  t = {
    ...r4,
    ...t
  };
  const r = Symbol("ProxyTarget"), { equals: o, isShallow: a, ignoreDetached: u, details: h } = t, c = new VI(o), f = typeof t.onValidate == "function", p = new Si(f), g = (T, A, N, D, L) => !f || p.isCloning || t.onValidate(dn.concat(c.getPath(T), A), N, D, L) === !0, m = (T, A, N, D) => {
    !ig(c, t, A) && !(u && c.isDetached(T, n)) && b(c.getPath(T), A, N, D);
  }, b = (T, A, N, D, L) => {
    p.isCloning && p.isPartOfClone(T) ? p.update(T, A, D) : e(dn.concat(T, A), N, D, L);
  }, _ = (T) => T && (T[r] ?? T), $ = (T, A, N, D) => {
    if (HI(T) || N === "constructor" || a && !Si.isHandledMethod(A, N) || ig(c, t, N) || c.isGetInvariant(A, N) || u && c.isDetached(A, n))
      return T;
    D === void 0 && (D = c.getPath(A));
    const L = dn.concat(D, N), q = c.getPath(T);
    return q && C(L, q) ? c.getProxy(T, q, S, r) : c.getProxy(T, L, S, r);
  }, C = (T, A) => {
    if (iu(T) || T.length <= A.length || tn(A) && A.length === 0)
      return !1;
    const N = tn(T) ? T : T.split(Wr), D = tn(A) ? A : A.split(Wr);
    return N.length <= D.length ? !1 : !D.some((L, q) => L !== N[q]);
  }, S = {
    get(T, A, N) {
      if (iu(A)) {
        if (A === r || A === Lh)
          return T;
        if (A === sv && !c.isUnsubscribed && c.getPath(T).length === 0)
          return c.unsubscribe(), T;
      }
      const D = dh(T) ? Reflect.get(T, A) : Reflect.get(T, A, N);
      return $(D, T, A);
    },
    set(T, A, N, D) {
      N = _(N);
      const L = T[r] ?? T, q = L[A];
      if (o(q, N) && A in T)
        return !0;
      const oe = g(T, A, N, q);
      return oe && c.setProperty(L, A, N, D, q) ? (m(T, A, T[A], q), !0) : !oe;
    },
    defineProperty(T, A, N) {
      if (!c.isSameDescriptor(N, T, A)) {
        const D = T[A];
        g(T, A, N.value, D) && c.defineProperty(T, A, N, D) && m(T, A, N.value, D);
      }
      return !0;
    },
    deleteProperty(T, A) {
      if (!Reflect.has(T, A))
        return !0;
      const N = Reflect.get(T, A), D = g(T, A, void 0, N);
      return D && c.deleteProperty(T, A, N) ? (m(T, A, void 0, N), !0) : !D;
    },
    apply(T, A, N) {
      const D = A[r] ?? A;
      if (c.isUnsubscribed)
        return Reflect.apply(T, D, N);
      if ((h === !1 || h !== !0 && !h.includes(T.name)) && Si.isHandledType(D)) {
        let L = dn.initial(c.getPath(T));
        const q = Si.isHandledMethod(D, T.name);
        p.start(D, L, N);
        let oe = Reflect.apply(
          T,
          p.preferredThisArg(T, A, D),
          q ? N.map((pe) => _(pe)) : N
        );
        const be = p.isChanged(D, o), ge = p.stop();
        if (Si.isHandledType(oe) && q && (A instanceof Map && T.name === "get" && (L = dn.concat(L, N[0])), oe = c.getProxy(oe, L, S)), be) {
          const pe = {
            name: T.name,
            args: N,
            result: oe
          }, Je = p.isCloning ? dn.initial(L) : L, Le = p.isCloning ? dn.last(L) : "";
          g(dn.get(n, Je), Le, D, ge, pe) ? b(Je, Le, D, ge, pe) : p.undo(D);
        }
        return (A instanceof Map || A instanceof Set) && WI(oe) ? jI(oe, T, A, L, $) : oe;
      }
      return Reflect.apply(T, A, N);
    }
  }, I = c.getProxy(n, t.pathAsArray ? [] : "", S);
  return e = e.bind(I), f && (t.onValidate = t.onValidate.bind(I)), I;
};
Bh.target = (n) => (n == null ? void 0 : n[Lh]) ?? n;
Bh.unsubscribe = (n) => (n == null ? void 0 : n[sv]) ?? n;
class i4 {
  constructor() {
    this.watchedInputs = /* @__PURE__ */ new Map(), this.dataObjects = {}, this.calculatedValues = /* @__PURE__ */ new Set(), this.schemas = {};
  }
  watch(e, t, r) {
    const o = Bh(t, (a, u, h) => {
      if (typeof u == "object" && u !== null && Object.keys(u).length === 0 && h === void 0)
        return;
      const c = this.watchedInputs.get(`${e}.${a}`);
      if (c) {
        const f = o4(this.schemas, c.output);
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
function o4(n, e) {
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
const ug = 1.618;
class je {
  constructor(e, t, r, o, a = {}) {
    this.dragging = !1, this.parentGraph = e, this.id = t, this.opts = a, this.changeManager = new i4(), this.changeManager.loadCalculatedValues(this.parentGraph.styles.getCalculatedStylesForNode(o)), this.data = this.changeManager.watch("data", o), this.algorithmResults = this.changeManager.watch("algorithmResults", {}), this.styleUpdates = this.changeManager.addData("style", {}, Xa), this.styleId = r, this.parentGraph.layoutEngine.addNode(this), this.mesh = je.defaultNodeMeshFactory(this, this.parentGraph, r);
  }
  addCalculatedStyle(e) {
    this.changeManager.addCalculatedValue(e);
  }
  update() {
    const e = Object.keys(this.styleUpdates);
    if (e.length > 0) {
      let r = jn.getStyleForNodeStyleId(this.styleId);
      r = vA.defaultsDeep(this.styleUpdates, r);
      const o = jn.getNodeIdForStyle(r);
      this.updateStyle(o);
      for (const a of e)
        delete this.styleUpdates[a];
    }
    if (this.dragging)
      return;
    const t = this.parentGraph.layoutEngine.getNodePosition(this);
    this.mesh.position.x = t.x, this.mesh.position.y = t.y, t.z && (this.mesh.position.z = t.z);
  }
  updateStyle(e) {
    e !== this.styleId && (this.styleId = e, this.mesh.dispose(), this.mesh = je.defaultNodeMeshFactory(this, this.parentGraph, e));
  }
  pin() {
    this.parentGraph.layoutEngine.pin(this);
  }
  unpin() {
    this.parentGraph.layoutEngine.unpin(this);
  }
  static defaultNodeMeshFactory(e, t, r) {
    var a, u;
    const o = jn.getStyleForNodeStyleId(r);
    return e.size = ((a = o.shape) == null ? void 0 : a.size) ?? 0, e.mesh = t.meshCache.get(`node-style-${r}`, () => {
      var p, g, m;
      let h;
      if (!o.shape)
        throw new TypeError("shape required to create mesh");
      switch (o.shape.type) {
        case "box":
          h = je.createBox(e, t, o);
          break;
        case "sphere":
          h = je.createSphere(e, t, o);
          break;
        case "cylinder":
          h = je.createCylinder(e, t, o);
          break;
        case "cone":
          h = je.createCone(e, t, o);
          break;
        case "capsule":
          h = je.createCapsule(e, t, o);
          break;
        // Torus disabled because it breaks ray finding with arrowcaps whe
        // the ray shoots right through the hole in the center of the torus
        // case "torus":
        //     mesh = Node.createTorus(n, g, o);
        //     break;
        case "torus-knot":
          h = je.createTorusKnot(e, t, o);
          break;
        case "tetrahedron":
          h = je.createPolyhedron(0, e, t, o);
          break;
        case "octahedron":
          h = je.createPolyhedron(1, e, t, o);
          break;
        case "dodecahedron":
          h = je.createPolyhedron(2, e, t, o);
          break;
        case "icosahedron":
          h = je.createPolyhedron(3, e, t, o);
          break;
        case "rhombicuboctahedron":
          h = je.createPolyhedron(4, e, t, o);
          break;
        case "triangular_prism":
          h = je.createPolyhedron(5, e, t, o);
          break;
        case "pentagonal_prism":
          h = je.createPolyhedron(6, e, t, o);
          break;
        case "hexagonal_prism":
          h = je.createPolyhedron(7, e, t, o);
          break;
        case "square_pyramid":
          h = je.createPolyhedron(8, e, t, o);
          break;
        case "pentagonal_pyramid":
          h = je.createPolyhedron(9, e, t, o);
          break;
        case "triangular_dipyramid":
          h = je.createPolyhedron(10, e, t, o);
          break;
        case "pentagonal_dipyramid":
          h = je.createPolyhedron(11, e, t, o);
          break;
        case "elongated_square_dypyramid":
          h = je.createPolyhedron(12, e, t, o);
          break;
        case "elongated_pentagonal_dipyramid":
          h = je.createPolyhedron(13, e, t, o);
          break;
        case "elongated_pentagonal_cupola":
          h = je.createPolyhedron(14, e, t, o);
          break;
        case "goldberg":
          h = je.createGoldberg(e, t, o);
          break;
        case "icosphere":
          h = je.createIcoSphere(e, t, o);
          break;
        case "geodesic":
          h = je.createGeodesic(e, t, o);
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
      const c = new Mg("defaultMaterial");
      let f;
      if (typeof ((p = o.texture) == null ? void 0 : p.color) == "string")
        f = Er.FromHexString(o.texture.color);
      else if (typeof ((g = o.texture) == null ? void 0 : g.color) == "object")
        switch (o.texture.color.colorType) {
          case "solid":
            f = Er.FromHexString(o.texture.color.value ?? "##FFFFFF"), h.visibility = o.texture.color.opacity ?? 1;
            break;
          // TODO
          // case "gradient":
          // case "radial-gradient":
          default:
            throw new TypeError(`unknown advanced colorType ${o.texture.color.colorType}`);
        }
      return c.wireframe = ((m = o.effect) == null ? void 0 : m.wireframe) ?? !1, f && !t.styles.config.graph.twoD ? c.diffuseColor = f : f && (c.disableLighting = !0, c.emissiveColor = f), c.freeze(), h.material = c, h;
    }), (u = o.label) != null && u.enabled && (e.label = je.createLabel(e, o)), je.addDefaultBehaviors(e, e.opts), e.mesh;
  }
  static createBox(e, t, r) {
    var o;
    return Wn.CreateBox("box", { size: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createSphere(e, t, r) {
    var o;
    return Wn.CreateSphere("sphere", { diameter: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createCylinder(e, t, r) {
    var o, a;
    return Wn.CreateCylinder("cylinder", { height: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * ug, diameter: ((a = r.shape) == null ? void 0 : a.size) ?? 1 });
  }
  static createCone(e, t, r) {
    var o, a;
    return Wn.CreateCylinder("cylinder", { height: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * ug, diameterTop: 0, diameterBottom: ((a = r.shape) == null ? void 0 : a.size) ?? 1 });
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createCapsule(e, t, r) {
    return Wn.CreateCapsule("capsule", {});
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static createTorus(e, t, r) {
    return Wn.CreateTorus("torus", {});
  }
  static createTorusKnot(e, t, r) {
    var o, a;
    return Wn.CreateTorusKnot("tk", { radius: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * 0.3, tube: ((a = r.shape) == null ? void 0 : a.size) ?? 1 * 0.2, radialSegments: 128 });
  }
  static createPolyhedron(e, t, r, o) {
    var a;
    return Wn.CreatePolyhedron("polyhedron", { size: ((a = o.shape) == null ? void 0 : a.size) ?? 1, type: e });
  }
  static createGoldberg(e, t, r) {
    var o;
    return Wn.CreateGoldberg("goldberg", { size: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
  }
  static createIcoSphere(e, t, r) {
    var o;
    return Wn.CreateIcoSphere("icosphere", { radius: ((o = r.shape) == null ? void 0 : o.size) ?? 1 * 0.75 });
  }
  static createGeodesic(e, t, r) {
    var o;
    return Wn.CreateGeodesic("geodesic", { size: ((o = r.shape) == null ? void 0 : o.size) ?? 1 });
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
    const a = t.label ? qC(t.label) : {}, u = {
      text: r,
      attachTo: e.mesh,
      attachPosition: je.getAttachPosition(a.location ?? "top"),
      attachOffset: a.attachOffset ?? je.getDefaultAttachOffset(a.location ?? "top")
    };
    return a.font !== void 0 && (u.font = a.font), a.fontSize !== void 0 && (u.fontSize = a.fontSize), a.fontWeight !== void 0 && (u.fontWeight = a.fontWeight), a.lineHeight !== void 0 && (u.lineHeight = a.lineHeight), a.textColor !== void 0 && (u.textColor = a.textColor), a.backgroundColor !== void 0 && (u.backgroundColor = je.getBackgroundColor(a.backgroundColor)), a.borderWidth !== void 0 && (u.borderWidth = a.borderWidth), a.borderColor !== void 0 && (u.borderColor = a.borderColor), a.borders !== void 0 && (u.borders = a.borders), a.marginTop !== void 0 && (u.marginTop = a.marginTop), a.marginBottom !== void 0 && (u.marginBottom = a.marginBottom), a.marginLeft !== void 0 && (u.marginLeft = a.marginLeft), a.marginRight !== void 0 && (u.marginRight = a.marginRight), a.textAlign !== void 0 && (u.textAlign = a.textAlign), a.cornerRadius !== void 0 && (u.cornerRadius = a.cornerRadius), a.autoSize !== void 0 && (u.autoSize = a.autoSize), a.resolution !== void 0 && (u.resolution = a.resolution), a.billboardMode !== void 0 && (u.billboardMode = a.billboardMode), a.position !== void 0 && (u.position = a.position), a.attachOffset !== void 0 && (u.attachOffset = a.attachOffset), a.depthFadeEnabled !== void 0 && (u.depthFadeEnabled = a.depthFadeEnabled), a.depthFadeNear !== void 0 && (u.depthFadeNear = a.depthFadeNear), a.depthFadeFar !== void 0 && (u.depthFadeFar = a.depthFadeFar), a.textOutline !== void 0 && (u.textOutline = a.textOutline), a.textOutlineWidth !== void 0 && (u.textOutlineWidth = a.textOutlineWidth), a.textOutlineColor !== void 0 && (u.textOutlineColor = a.textOutlineColor), a.textOutlineJoin !== void 0 && (u.textOutlineJoin = a.textOutlineJoin), a.textShadow !== void 0 && (u.textShadow = a.textShadow), a.textShadowColor !== void 0 && (u.textShadowColor = a.textShadowColor), a.textShadowBlur !== void 0 && (u.textShadowBlur = a.textShadowBlur), a.textShadowOffsetX !== void 0 && (u.textShadowOffsetX = a.textShadowOffsetX), a.textShadowOffsetY !== void 0 && (u.textShadowOffsetY = a.textShadowOffsetY), a.backgroundPadding !== void 0 && (u.backgroundPadding = a.backgroundPadding), a.backgroundGradient !== void 0 && (u.backgroundGradient = a.backgroundGradient), a.backgroundGradientType !== void 0 && (u.backgroundGradientType = a.backgroundGradientType), a.backgroundGradientColors !== void 0 && (u.backgroundGradientColors = a.backgroundGradientColors), a.backgroundGradientDirection !== void 0 && (u.backgroundGradientDirection = a.backgroundGradientDirection), a.pointer !== void 0 && (u.pointer = a.pointer), a.pointerDirection !== void 0 && (u.pointerDirection = a.pointerDirection), a.pointerWidth !== void 0 && (u.pointerWidth = a.pointerWidth), a.pointerHeight !== void 0 && (u.pointerHeight = a.pointerHeight), a.pointerOffset !== void 0 && (u.pointerOffset = a.pointerOffset), a.pointerCurve !== void 0 && (u.pointerCurve = a.pointerCurve), a.animation !== void 0 && (u.animation = a.animation), a.animationSpeed !== void 0 && (u.animationSpeed = a.animationSpeed), a.badge !== void 0 && (u.badge = a.badge), a.icon !== void 0 && (u.icon = a.icon), a.iconPosition !== void 0 && (u.iconPosition = a.iconPosition), a.progress !== void 0 && (u.progress = a.progress), a.smartOverflow !== void 0 && (u.smartOverflow = a.smartOverflow), a.maxNumber !== void 0 && (u.maxNumber = a.maxNumber), a.overflowSuffix !== void 0 && (u.overflowSuffix = a.overflowSuffix), a.attachOffset !== void 0 && (u.attachOffset = a.attachOffset), new eu(e.parentGraph.scene, u);
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
    if (e.mesh.isPickable = !0, e.pinOnDrag = t.pinOnDrag ?? !0, e.meshDragBehavior = new C5(), e.mesh.addBehavior(e.meshDragBehavior), e.meshDragBehavior.onDragStartObservable.add(() => {
      e.parentGraph.running = !0, e.dragging = !0;
    }), e.meshDragBehavior.onDragEndObservable.add(() => {
      e.parentGraph.running = !0, e.pinOnDrag && e.pin(), e.dragging = !1;
    }), e.meshDragBehavior.onPositionChangedObservable.add((r) => {
      e.parentGraph.running = !0, e.parentGraph.layoutEngine.setNodePosition(e, r.position);
    }), e.mesh.actionManager = e.mesh.actionManager ?? new ip(e.parentGraph.scene), e.parentGraph.fetchNodes && e.parentGraph.fetchEdges) {
      const { fetchNodes: r, fetchEdges: o } = e.parentGraph;
      e.mesh.actionManager.registerAction(
        new A5(
          {
            trigger: ip.OnDoublePickTrigger
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
class s4 {
  constructor(e) {
    this.graphStep = new io(), this.nodeUpdate = new io(), this.edgeUpdate = new io(), this.arrowCapUpdate = new io(), this.intersectCalc = new io(), this.loadTime = new io(), this.totalUpdates = 0, this.graph = e, this.sceneInstrumentation = new I5(e.scene), this.sceneInstrumentation.captureFrameTime = !0, this.sceneInstrumentation.captureRenderTime = !0, this.sceneInstrumentation.captureInterFrameTime = !0, this.sceneInstrumentation.captureCameraRenderTime = !0, this.sceneInstrumentation.captureActiveMeshesEvaluationTime = !0, this.sceneInstrumentation.captureRenderTargetsRenderTime = !0, this.babylonInstrumentation = new P5(e.engine), this.babylonInstrumentation.captureGPUFrameTime = !0, this.babylonInstrumentation.captureShaderCompilationTime = !0;
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
class a4 {
  constructor(e) {
    if (this.nodes = /* @__PURE__ */ new Map(), this.edges = /* @__PURE__ */ new Map(), this.xrHelper = null, this.edgeCache = new bA(), this.nodeCache = /* @__PURE__ */ new Map(), this.needRays = !1, this.running = !1, this.initialized = !1, this.runAlgorithmsOnLoad = !1, this.graphObservable = new Ql(), this.nodeObservable = new Ql(), this.edgeObservable = new Ql(), this.meshCache = new GI(), this.styles = jn.default(), typeof e == "string") {
      const u = document.getElementById(e);
      if (!u)
        throw new Error(`getElementById() could not find element '${e}'`);
      this.element = u;
    } else if (e instanceof Element)
      this.element = e;
    else
      throw new TypeError("Graph constructor requires 'element' argument that is either a string specifying the ID of the HTML element or an Element");
    this.element.innerHTML = "", this.canvas = document.createElement("canvas"), this.canvas.setAttribute("id", `babylonForceGraphRenderCanvas${Date.now()}`), this.canvas.setAttribute("touch-action", "none"), this.canvas.setAttribute("autofocus", "true"), this.canvas.setAttribute("tabindex", "0"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.touchAction = "none", this.element.appendChild(this.canvas), op.LogLevels = op.ErrorLogLevel, this.engine = new Ha(this.canvas, !0), this.scene = new k5(this.engine), this.camera = new DI(this.scene);
    const t = new LI(this.canvas, this.scene, {
      trackballRotationSpeed: 5e-3,
      keyboardRotationSpeed: 0.03,
      keyboardZoomSpeed: 0.2,
      keyboardYawSpeed: 0.02,
      pinchZoomSensitivity: 10,
      twistYawSensitivity: 1.5,
      minZoomDistance: 2,
      maxZoomDistance: 500,
      inertiaDamping: 0.9
    }), r = new UI(this.canvas, t);
    this.camera.registerCamera("orbit", t, r);
    const o = new ZI(this.scene, this.engine, this.canvas, {
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
    }), a = new qI(o, this.canvas, {
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
    this.camera.registerCamera("2d", o, a), this.camera.activateCamera("orbit"), new $5("light", new $t(1, 1, 0)), this.setLayout("ngraph").catch((u) => {
      throw console.error("ERROR", u), u;
    }), this.stats = new s4(this);
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
    if (this.camera.update(), !this.running)
      return;
    this.stats.step(), this.stats.graphStep.beginMonitoring();
    for (let h = 0; h < this.styles.config.behavior.layout.stepMultiplier; h++)
      this.layoutEngine.step();
    this.stats.graphStep.endMonitoring();
    let e, t;
    function r(h) {
      const c = h.mesh.getAbsolutePosition(), f = h.size;
      if (!e || !t) {
        e = c.clone(), t = c.clone();
        return;
      }
      Sc(c, e, f, "x"), Sc(c, e, f, "y"), Sc(c, e, f, "z"), Mc(c, t, f, "x"), Mc(c, t, f, "y"), Mc(c, t, f, "z");
    }
    this.stats.nodeUpdate.beginMonitoring();
    for (const h of this.layoutEngine.nodes)
      h.update(), r(h);
    this.stats.nodeUpdate.endMonitoring(), this.stats.edgeUpdate.beginMonitoring(), rr.updateRays(this);
    for (const h of this.layoutEngine.edges)
      h.update();
    this.stats.edgeUpdate.endMonitoring();
    const o = 1.3, a = (e == null ? void 0 : e.multiplyByFloats(o, o, o)) ?? new $t(-20, -20, -20), u = (t == null ? void 0 : t.multiplyByFloats(o, o, o)) ?? new $t(20, 20, 20);
    this.camera.zoomToBoundingBox(a, u), this.layoutEngine.isSettled && (this.graphObservable.notifyObservers({ type: "graph-settled", graph: this }), this.running = !1);
  }
  async setStyleTemplate(e) {
    this.styles = jn.fromObject(e);
    for (const r of this.nodes.values()) {
      const o = this.styles.getStyleForNode(r.data);
      r.changeManager.loadCalculatedValues(this.styles.getCalculatedStylesForNode(r.data)), r.updateStyle(o);
    }
    for (const r of this.edges.values()) {
      const o = this.styles.getStyleForEdge(r.data);
      r.updateStyle(o);
    }
    if (this.styles.config.graph.background.backgroundType === "skybox" && typeof this.styles.config.graph.background.data == "string") {
      const r = new O5(
        "testdome",
        this.styles.config.graph.background.data,
        {
          resolution: 32,
          size: 500
        },
        this.scene
      );
      r.rotation.z = -Math.PI / 2, r.rotation.x = Math.PI;
    }
    this.styles.config.graph.background.backgroundType === "color" && this.styles.config.graph.background.color && (this.scene.clearColor = Eg.FromHexString(this.styles.config.graph.background.color));
    const t = this.styles.config.graph.twoD ? "2d" : "orbit";
    this.camera.activateCamera(t);
    try {
      if (this.layoutEngine) {
        const r = this.styles.config.graph.twoD ? 2 : 3, o = _t.getOptionsForDimensionByType(this.layoutEngine.type, r);
        if (o && Object.keys(o).length > 0) {
          const a = this.layoutEngine.type, u = this.layoutEngine.config ? { ...this.layoutEngine.config } : {}, h = _t.getOptionsForDimensionByType(a, 2), c = _t.getOptionsForDimensionByType(a, 3);
          (/* @__PURE__ */ new Set([
            ...Object.keys(h ?? {}),
            ...Object.keys(c ?? {})
          ])).forEach((p) => {
            delete u[p];
          }), await this.setLayout(a, u);
        }
      }
    } catch {
    }
    if (this.runAlgorithmsOnLoad && this.styles.config.data.algorithms)
      for (const r of this.styles.config.data.algorithms) {
        const [o, a] = r.split(":");
        await this.runAlgorithm(o, a);
      }
    return this.styles;
  }
  async addDataFromSource(e, t = {}) {
    this.stats.loadTime.beginMonitoring();
    const r = kh.get(e, t);
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
      const f = this.styles.getStyleForEdge(u), p = {}, g = new rr(this, h, c, f, u, p);
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
    const r = Dh.get(this, e, t);
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
function Sc(n, e, t, r) {
  const o = n[r] - t;
  o < e[r] && (e[r] = o);
}
function Mc(n, e, t, r) {
  const o = n[r] + t;
  o > e[r] && (e[r] = o);
}
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ga = globalThis, Fh = Ga.ShadowRoot && (Ga.ShadyCSS === void 0 || Ga.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, pv = Symbol(), lg = /* @__PURE__ */ new WeakMap();
let u4 = class {
  constructor(e, t, r) {
    if (this._$cssResult$ = !0, r !== pv) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Fh && e === void 0) {
      const r = t !== void 0 && t.length === 1;
      r && (e = lg.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), r && lg.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const l4 = (n) => new u4(typeof n == "string" ? n : n + "", void 0, pv), c4 = (n, e) => {
  if (Fh) n.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const r = document.createElement("style"), o = Ga.litNonce;
    o !== void 0 && r.setAttribute("nonce", o), r.textContent = t.cssText, n.appendChild(r);
  }
}, cg = Fh ? (n) => n : (n) => n instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const r of e.cssRules) t += r.cssText;
  return l4(t);
})(n) : n;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: h4, defineProperty: f4, getOwnPropertyDescriptor: d4, getOwnPropertyNames: p4, getOwnPropertySymbols: g4, getPrototypeOf: m4 } = Object, Jr = globalThis, hg = Jr.trustedTypes, v4 = hg ? hg.emptyScript : "", Ec = Jr.reactiveElementPolyfillSupport, rs = (n, e) => n, ou = { toAttribute(n, e) {
  switch (e) {
    case Boolean:
      n = n ? v4 : null;
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
} }, Uh = (n, e) => !h4(n, e), fg = { attribute: !0, type: String, converter: ou, reflect: !1, useDefault: !1, hasChanged: Uh };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), Jr.litPropertyMetadata ?? (Jr.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
class ho extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = fg) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const r = Symbol(), o = this.getPropertyDescriptor(e, r, t);
      o !== void 0 && f4(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, r) {
    const { get: o, set: a } = d4(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? fg;
  }
  static _$Ei() {
    if (this.hasOwnProperty(rs("elementProperties"))) return;
    const e = m4(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(rs("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(rs("properties"))) {
      const t = this.properties, r = [...p4(t), ...g4(t)];
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
      for (const o of r) t.unshift(cg(o));
    } else e !== void 0 && t.push(cg(e));
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
    return c4(e, this.constructor.elementStyles), e;
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
      const u = (((a = r.converter) == null ? void 0 : a.toAttribute) !== void 0 ? r.converter : ou).toAttribute(t, r.type);
      this._$Em = e, u == null ? this.removeAttribute(o) : this.setAttribute(o, u), this._$Em = null;
    }
  }
  _$AK(e, t) {
    var a, u;
    const r = this.constructor, o = r._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const h = r.getPropertyOptions(o), c = typeof h.converter == "function" ? { fromAttribute: h.converter } : ((a = h.converter) == null ? void 0 : a.fromAttribute) !== void 0 ? h.converter : ou;
      this._$Em = o, this[o] = c.fromAttribute(t, h.type) ?? ((u = this._$Ej) == null ? void 0 : u.get(o)) ?? null, this._$Em = null;
    }
  }
  requestUpdate(e, t, r) {
    var o;
    if (e !== void 0) {
      const a = this.constructor, u = this[e];
      if (r ?? (r = a.getPropertyOptions(e)), !((r.hasChanged ?? Uh)(u, t) || r.useDefault && r.reflect && u === ((o = this._$Ej) == null ? void 0 : o.get(e)) && !this.hasAttribute(a._$Eu(e, r)))) return;
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
ho.elementStyles = [], ho.shadowRootOptions = { mode: "open" }, ho[rs("elementProperties")] = /* @__PURE__ */ new Map(), ho[rs("finalized")] = /* @__PURE__ */ new Map(), Ec == null || Ec({ ReactiveElement: ho }), (Jr.reactiveElementVersions ?? (Jr.reactiveElementVersions = [])).push("2.1.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const is = globalThis, su = is.trustedTypes, dg = su ? su.createPolicy("lit-html", { createHTML: (n) => n }) : void 0, gv = "$lit$", jr = `lit$${Math.random().toFixed(9).slice(2)}$`, mv = "?" + jr, _4 = `<${mv}>`, Ni = document, ps = () => Ni.createComment(""), gs = (n) => n === null || typeof n != "object" && typeof n != "function", Zh = Array.isArray, y4 = (n) => Zh(n) || typeof (n == null ? void 0 : n[Symbol.iterator]) == "function", Cc = `[ 	
\f\r]`, Vo = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pg = /-->/g, gg = />/g, xi = RegExp(`>|${Cc}(?:([^\\s"'>=/]+)(${Cc}*=${Cc}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), mg = /'/g, vg = /"/g, vv = /^(?:script|style|textarea|title)$/i, _o = Symbol.for("lit-noChange"), Lt = Symbol.for("lit-nothing"), _g = /* @__PURE__ */ new WeakMap(), Ai = Ni.createTreeWalker(Ni, 129);
function _v(n, e) {
  if (!Zh(n) || !n.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return dg !== void 0 ? dg.createHTML(e) : e;
}
const b4 = (n, e) => {
  const t = n.length - 1, r = [];
  let o, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", u = Vo;
  for (let h = 0; h < t; h++) {
    const c = n[h];
    let f, p, g = -1, m = 0;
    for (; m < c.length && (u.lastIndex = m, p = u.exec(c), p !== null); ) m = u.lastIndex, u === Vo ? p[1] === "!--" ? u = pg : p[1] !== void 0 ? u = gg : p[2] !== void 0 ? (vv.test(p[2]) && (o = RegExp("</" + p[2], "g")), u = xi) : p[3] !== void 0 && (u = xi) : u === xi ? p[0] === ">" ? (u = o ?? Vo, g = -1) : p[1] === void 0 ? g = -2 : (g = u.lastIndex - p[2].length, f = p[1], u = p[3] === void 0 ? xi : p[3] === '"' ? vg : mg) : u === vg || u === mg ? u = xi : u === pg || u === gg ? u = Vo : (u = xi, o = void 0);
    const b = u === xi && n[h + 1].startsWith("/>") ? " " : "";
    a += u === Vo ? c + _4 : g >= 0 ? (r.push(f), c.slice(0, g) + gv + c.slice(g) + jr + b) : c + jr + (g === -2 ? h : b);
  }
  return [_v(n, a + (n[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), r];
};
class ms {
  constructor({ strings: e, _$litType$: t }, r) {
    let o;
    this.parts = [];
    let a = 0, u = 0;
    const h = e.length - 1, c = this.parts, [f, p] = b4(e, t);
    if (this.el = ms.createElement(f, r), Ai.currentNode = this.el.content, t === 2 || t === 3) {
      const g = this.el.content.firstChild;
      g.replaceWith(...g.childNodes);
    }
    for (; (o = Ai.nextNode()) !== null && c.length < h; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const g of o.getAttributeNames()) if (g.endsWith(gv)) {
          const m = p[u++], b = o.getAttribute(g).split(jr), _ = /([.?@])?(.*)/.exec(m);
          c.push({ type: 1, index: a, name: _[2], strings: b, ctor: _[1] === "." ? x4 : _[1] === "?" ? T4 : _[1] === "@" ? S4 : Ou }), o.removeAttribute(g);
        } else g.startsWith(jr) && (c.push({ type: 6, index: a }), o.removeAttribute(g));
        if (vv.test(o.tagName)) {
          const g = o.textContent.split(jr), m = g.length - 1;
          if (m > 0) {
            o.textContent = su ? su.emptyScript : "";
            for (let b = 0; b < m; b++) o.append(g[b], ps()), Ai.nextNode(), c.push({ type: 2, index: ++a });
            o.append(g[m], ps());
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
class w4 {
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
        c.type === 2 ? f = new Es(a, a.nextSibling, this, e) : c.type === 1 ? f = new c.ctor(a, c.name, c.strings, this, e) : c.type === 6 && (f = new M4(a, this, e)), this._$AV.push(f), c = r[++h];
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
class Es {
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
    e = yo(this, e, t), gs(e) ? e === Lt || e == null || e === "" ? (this._$AH !== Lt && this._$AR(), this._$AH = Lt) : e !== this._$AH && e !== _o && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : y4(e) ? this.k(e) : this._(e);
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
      const u = new w4(o, this), h = u.u(this.options);
      u.p(t), this.T(h), this._$AH = u;
    }
  }
  _$AC(e) {
    let t = _g.get(e.strings);
    return t === void 0 && _g.set(e.strings, t = new ms(e)), t;
  }
  k(e) {
    Zh(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let r, o = 0;
    for (const a of e) o === t.length ? t.push(r = new Es(this.O(ps()), this.O(ps()), this, this.options)) : r = t[o], r._$AI(a), o++;
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
class Ou {
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
class x4 extends Ou {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === Lt ? void 0 : e;
  }
}
class T4 extends Ou {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== Lt);
  }
}
class S4 extends Ou {
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
class M4 {
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
const Ac = is.litHtmlPolyfillSupport;
Ac == null || Ac(ms, Es), (is.litHtmlVersions ?? (is.litHtmlVersions = [])).push("3.3.0");
const E4 = (n, e, t) => {
  const r = (t == null ? void 0 : t.renderBefore) ?? e;
  let o = r._$litPart$;
  if (o === void 0) {
    const a = (t == null ? void 0 : t.renderBefore) ?? null;
    r._$litPart$ = o = new Es(e.insertBefore(ps(), a), a, void 0, t ?? {});
  }
  return o._$AI(n), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ki = globalThis;
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = E4(t, this.renderRoot, this.renderOptions);
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
var Sg;
os._$litElement$ = !0, os.finalized = !0, (Sg = ki.litElementHydrateSupport) == null || Sg.call(ki, { LitElement: os });
const Ic = ki.litElementPolyfillSupport;
Ic == null || Ic({ LitElement: os });
(ki.litElementVersions ?? (ki.litElementVersions = [])).push("4.2.0");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const C4 = (n) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(n, e);
  }) : customElements.define(n, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const A4 = { attribute: !0, type: String, converter: ou, reflect: !1, hasChanged: Uh }, I4 = (n = A4, e, t) => {
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
  return (e, t) => typeof t == "object" ? I4(n, e, t) : ((r, o, a) => {
    const u = o.hasOwnProperty(a);
    return o.constructor.createProperty(a, r), u ? Object.getOwnPropertyDescriptor(o, a) : void 0;
  })(n, e, t);
}
var P4 = Object.defineProperty, k4 = Object.getOwnPropertyDescriptor, yv = (n) => {
  throw TypeError(n);
}, $n = (n, e, t, r) => {
  for (var o = r > 1 ? void 0 : r ? k4(e, t) : e, a = n.length - 1, u; a >= 0; a--)
    (u = n[a]) && (o = (r ? u(e, t, o) : u(o)) || o);
  return r && o && P4(e, t, o), o;
}, bv = (n, e, t) => e.has(n) || yv("Cannot " + t), en = (n, e, t) => (bv(n, e, "read from private field"), t ? t.call(n) : e.get(n)), yg = (n, e, t) => e.has(n) ? yv("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(n) : e.set(n, t), bg = (n, e, t, r) => (bv(n, e, "write to private field"), e.set(n, t), t), Vt, Xo;
let pn = class extends os {
  constructor() {
    super(), yg(this, Vt), yg(this, Xo), bg(this, Xo, document.createElement("div")), bg(this, Vt, new a4(en(this, Xo)));
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
    if (n.has("layout2d") && this.layout2d !== void 0 && Vn.set(en(this, Vt).styles.config, "graph.twoD", this.layout2d), n.has("runAlgorithmsOnLoad") && this.runAlgorithmsOnLoad !== void 0 && (en(this, Vt).runAlgorithmsOnLoad = !0), n.has("layout") && this.layout) {
      const e = this.layoutConfig ?? {};
      await en(this, Vt).setLayout(this.layout, e);
    }
    if (n.has("nodeIdPath") && this.nodeIdPath && Vn.set(en(this, Vt).styles.config, "data.knownFields.nodeIdPath", this.nodeIdPath), n.has("edgeSrcIdPath") && this.edgeSrcIdPath && Vn.set(en(this, Vt).styles.config, "data.knownFields.edgeSrcIdPath", this.edgeSrcIdPath), n.has("edgeDstIdPath") && this.edgeDstIdPath && Vn.set(en(this, Vt).styles.config, "data.knownFields.edgeDstIdPath", this.edgeDstIdPath), n.has("nodeData") && Array.isArray(this.nodeData) && en(this, Vt).addNodes(this.nodeData), n.has("edgeData") && Array.isArray(this.edgeData) && en(this, Vt).addEdges(this.edgeData), n.has("dataSource") && this.dataSource) {
      const e = this.dataSourceConfig ?? {};
      await en(this, Vt).addDataFromSource(this.dataSource, e);
    }
    n.has("styleTemplate") && this.styleTemplate && await en(this, Vt).setStyleTemplate(this.styleTemplate), await en(this, Vt).init(), en(this, Vt).engine.resize();
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
  C4("graphty-element")
], pn);
export {
  kh as DataSource,
  rr as Edge,
  a4 as Graph,
  pn as Graphty,
  _t as LayoutEngine,
  je as Node,
  dA as StyleTemplate,
  jn as Styles
};
