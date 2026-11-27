// Byggsats för modeller: lådor, tak, torn, koner och klumpar som läggs ihop till ett enda nät.
// Varje hörn får färg och två extra tal (fx.x = hur mycket snö som fastnar, fx.y = slag: 0 fast, 1 barr, 2 löv, 3 rök/ljus).
(function () {
  'use strict';
  const V = window.VASA = window.VASA || {};

  function hexToLin(hex) { const c = new THREE.Color(hex); c.convertSRGBToLinear(); return c; }
  const colCache = {};
  function col(hex) { return colCache[hex] || (colCache[hex] = hexToLin(hex)); }

  class MB {
    constructor() { this.p = []; this.n = []; this.c = []; this.f = []; this.i = []; this.m = new THREE.Matrix4(); this.stack = []; this.nm = new THREE.Matrix3(); this.kind = 0; this.snow = 1; this.tint = 1; this.part = 0; this.g = []; }
    push() { this.stack.push(this.m.clone()); return this; }
    pop() { this.m.copy(this.stack.pop()); return this; }
    move(x, y, z) { this.m.multiply(new THREE.Matrix4().makeTranslation(x, y, z)); return this; }
    rotY(a) { this.m.multiply(new THREE.Matrix4().makeRotationY(a)); return this; }
    rotX(a) { this.m.multiply(new THREE.Matrix4().makeRotationX(a)); return this; }
    rotZ(a) { this.m.multiply(new THREE.Matrix4().makeRotationZ(a)); return this; }
    scale(x, y, z) { this.m.multiply(new THREE.Matrix4().makeScale(x, y === undefined ? x : y, z === undefined ? x : z)); return this; }
    at(x, y, z, a, fn) { this.push().move(x, y, z); if (a) this.rotY(a); fn(this); return this.pop(); }

    _v(x, y, z, nx, ny, nz, c, snow) {
      const v = new THREE.Vector3(x, y, z).applyMatrix4(this.m);
      const nn = new THREE.Vector3(nx, ny, nz).applyMatrix3(this.nm.getNormalMatrix(this.m)).normalize();
      this.p.push(v.x, v.y, v.z); this.n.push(nn.x, nn.y, nn.z); this.c.push(c.r * this.tint, c.g * this.tint, c.b * this.tint);
      this.f.push(snow === undefined ? this.snow : snow, this.kind); this.g.push(this.part);
      return this.p.length / 3 - 1;
    }
    // Platt fyrhörning a-b-c-d (moturs sett utifrån), en eller två färger (nederkant, överkant).
    quad(a, b, c, d, hex, hex2, snow) {
      const u = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), w = new THREE.Vector3(d[0] - a[0], d[1] - a[1], d[2] - a[2]), n = u.cross(w).normalize();
      const c1 = col(hex), c2 = hex2 ? col(hex2) : c1;
      const i0 = this._v(a[0], a[1], a[2], n.x, n.y, n.z, c1, snow), i1 = this._v(b[0], b[1], b[2], n.x, n.y, n.z, c1, snow), i2 = this._v(c[0], c[1], c[2], n.x, n.y, n.z, c2, snow), i3 = this._v(d[0], d[1], d[2], n.x, n.y, n.z, c2, snow);
      this.i.push(i0, i1, i2, i0, i2, i3); return this;
    }
    tri(a, b, c, hex, snow) {
      const u = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), w = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]), n = u.cross(w).normalize(), cc = col(hex);
      const i0 = this._v(a[0], a[1], a[2], n.x, n.y, n.z, cc, snow), i1 = this._v(b[0], b[1], b[2], n.x, n.y, n.z, cc, snow), i2 = this._v(c[0], c[1], c[2], n.x, n.y, n.z, cc, snow);
      this.i.push(i0, i1, i2); return this;
    }
    // Låda med mitten av bottnen i (x, y, z). hexTop = färg på ovansidan, hexLow = mörkare nederkant på väggarna.
    box(x, y, z, w, h, d, hex, opt) {
      opt = opt || {}; const x0 = x - w / 2, x1 = x + w / 2, y0 = y, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2, lo = opt.low || hex, top = opt.top || hex;
      this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], lo, hex, 0);
      this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], lo, hex, 0);
      this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], lo, hex, 0);
      this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], lo, hex, 0);
      if (!opt.noTop) this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], top, top, opt.snowTop === undefined ? 1 : opt.snowTop);
      return this;
    }
    // Sadeltak över en låda: nocken går längs x. over = taksprång, hexGable = gavelspetsarnas färg.
    gable(x, y, z, w, h, d, hex, opt) {
      opt = opt || {}; const o = opt.over === undefined ? 0.06 : opt.over, x0 = x - w / 2 - o, x1 = x + w / 2 + o, z0 = z - d / 2 - o, z1 = z + d / 2 + o, yr = y + h, ye = y - o * (h / (d / 2)) * 0.6, hex2 = opt.ridge || hex;
      this.quad([x0, ye, z1], [x1, ye, z1], [x1, yr, z], [x0, yr, z], hex, hex2, 1);
      this.quad([x1, ye, z0], [x0, ye, z0], [x0, yr, z], [x1, yr, z], hex, hex2, 1);
      const g = opt.gable; if (g) { this.tri([x - w / 2, y, z - d / 2], [x - w / 2, y, z + d / 2], [x - w / 2, yr - 0.01, z], g, 0); this.tri([x + w / 2, y, z + d / 2], [x + w / 2, y, z - d / 2], [x + w / 2, yr - 0.01, z], g, 0); }          // gavelspetsarna vända utåt (de var vända inåt och syntes inte utifrån: taket såg ut att sitta fel)
      return this;
    }
    // Pyramidtak (tälttak) på en fyrkant.
    hip(x, y, z, w, h, d, hex, over) {
      const o = over === undefined ? 0.05 : over, x0 = x - w / 2 - o, x1 = x + w / 2 + o, z0 = z - d / 2 - o, z1 = z + d / 2 + o, t = [x, y + h, z];
      this.tri([x0, y, z1], [x1, y, z1], t, hex, 1); this.tri([x1, y, z1], [x1, y, z0], t, hex, 1); this.tri([x1, y, z0], [x0, y, z0], t, hex, 1); this.tri([x0, y, z0], [x0, y, z1], t, hex, 1);
      return this;
    }
    // Rund pelare eller torn. r1 nedtill, r2 upptill. Mjuka normaler.
    cyl(x, y, z, r1, r2, h, seg, hex, opt) {
      opt = opt || {}; const c1 = col(opt.low || hex), c2 = col(hex), base = [], top = [], sl = (r1 - r2) / h;
      for (let k = 0; k <= seg; k++) {
        const a = k / seg * Math.PI * 2, cx = Math.cos(a), sz = Math.sin(a);
        base.push(this._v(x + cx * r1, y, z + sz * r1, cx, sl, sz, c1, 0)); top.push(this._v(x + cx * r2, y + h, z + sz * r2, cx, sl, sz, c2, 0));
      }
      for (let k = 0; k < seg; k++) this.i.push(base[k], top[k], top[k + 1], base[k], top[k + 1], base[k + 1]);
      if (opt.cap) { const ct = col(opt.cap), cs = opt.capSnow === undefined ? 1 : opt.capSnow, m = this._v(x, y + h, z, 0, 1, 0, ct, cs), ring = []; for (let k = 0; k <= seg; k++) { const a = k / seg * Math.PI * 2; ring.push(this._v(x + Math.cos(a) * r2, y + h, z + Math.sin(a) * r2, 0, 1, 0, ct, cs)); } for (let k = 0; k < seg; k++) this.i.push(m, ring[k + 1], ring[k]); }
      return this;
    }
    // Kon (gran, spira, tornhuv). snowTop: toppen samlar snö, kanten gör det inte.
    cone(x, y, z, r, h, seg, hex, opt) {
      opt = opt || {}; const cb = col(opt.low || hex), ct = col(opt.tip || hex), sl = r / h, ring = [];
      for (let k = 0; k <= seg; k++) { const a = k / seg * Math.PI * 2, cx = Math.cos(a), sz = Math.sin(a); ring.push(this._v(x + cx * r, y, z + sz * r, cx, sl, sz, cb, opt.snowLow === undefined ? 0.25 : opt.snowLow)); }
      for (let k = 0; k < seg; k++) { const a = (k + 0.5) / seg * Math.PI * 2, t = this._v(x, y + h, z, Math.cos(a) * 0.6, 0.8, Math.sin(a) * 0.6, ct, opt.snowTip === undefined ? 1 : opt.snowTip); this.i.push(ring[k], t, ring[k + 1]); }
      return this;
    }
    // Rund klump (lövkrona, buske, sten, huvud). Ikosaeder med mjuka normaler.
    blob(x, y, z, rx, ry, rz, hex, opt) {
      opt = opt || {}; const g = MB._ico || (MB._ico = new THREE.IcosahedronGeometry(1, 0)), pa = g.attributes.position, ct = col(opt.top || hex), cb = col(opt.low || hex), start = this.p.length / 3;
      const seen = new Map();
      const idx = [];
      for (let k = 0; k < pa.count; k++) {
        const px = pa.getX(k), py = pa.getY(k), pz = pa.getZ(k), key = px.toFixed(3) + ',' + py.toFixed(3) + ',' + pz.toFixed(3);
        if (!seen.has(key)) { const t = py * 0.5 + 0.5, c = cb.clone().lerp(ct, t); seen.set(key, this._v(x + px * rx, y + py * ry, z + pz * rz, px / rx, py / ry, pz / rz, c, opt.snow === undefined ? Math.max(0, py) : opt.snow)); }
        idx.push(seen.get(key));
      }
      for (let k = 0; k < idx.length; k++) this.i.push(idx[k]);
      return this;
    }
    geometry() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.p), 3));
      g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(this.n), 3));
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.c), 3));
      g.setAttribute('aFx', new THREE.BufferAttribute(new Float32Array(this.f), 2));
      g.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(this.g), 1));
      g.setIndex(this.p.length / 3 > 65535 ? new THREE.BufferAttribute(new Uint32Array(this.i), 1) : new THREE.BufferAttribute(new Uint16Array(this.i), 1));
      g.computeBoundingSphere();
      return g;
    }
  }
  V.MB = MB; V.col = col; V.hexToLin = hexToLin;
})();
