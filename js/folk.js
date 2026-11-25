// Gubbarna, Gustav, skeppen och allt som ryker, gnistrar och snöar.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, MB = V.MB, U = V.U, World = V.World;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3(), e3 = new THREE.Euler(), c3 = new THREE.Color();

  // Klädfärger. Bönder går i grått och brunt vadmal, legoknektar i brokigt, danskarna i rött.
  const FARG = { bonde: ['#7d766a', '#6a5f52', '#8a7f6e', '#5f5a50', '#7a6a55', '#6f7468'], knekt: ['#b8482f', '#d0a030', '#3f6fa8', '#5a8a3c', '#8a3f8a'], dansk: ['#b8312a', '#c8423a', '#a82a24'], borgare: ['#5a4a6a', '#3f5f6a', '#7a4a3a', '#4f6a4a'], rysk: ['#4f6a3a', '#6a5a2a'] };

  // ---- folk: alla gubbar ritas i ett svep --------------------------------------------------------
  const MAXN = 700, units = [];
  let body, pike, ski, matFolk;
  function folkMaterial() {
    if (matFolk) return matFolk;
    matFolk = new THREE.MeshLambertMaterial({ vertexColors: true });
    matFolk.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aFx;')
        .replace('#include <color_vertex>', 'vColor = color.xyz;\n#ifdef USE_INSTANCING_COLOR\n if (aFx.y > 4.5) vColor *= instanceColor;\n#endif');
    };
    return matFolk;
  }
  function gubbe() {
    const b = new MB(); b.snow = 0;
    b.box(-0.035, 0, 0, 0.05, 0.14, 0.06, '#3a3028'); b.box(0.035, 0, 0, 0.05, 0.14, 0.06, '#3a3028');
    b.kind = 5; b.box(0, 0.13, 0, 0.16, 0.16, 0.1, '#ffffff', { low: '#c8c8c8' }); b.box(-0.1, 0.15, 0, 0.045, 0.13, 0.05, '#e0e0e0'); b.box(0.1, 0.15, 0, 0.045, 0.13, 0.05, '#e0e0e0'); b.kind = 0;
    b.blob(0, 0.345, 0, 0.058, 0.06, 0.058, '#dcae8a', { low: '#b98a68', snow: 0 }); b.cone(0, 0.375, 0, 0.075, 0.07, 6, '#4a3a2c', { snowLow: 0, snowTip: 0 });
    return b.geometry();
  }
  const Folk = V.Folk = {
    units, FARG,
    init(scene) {
      body = new THREE.InstancedMesh(gubbe(), folkMaterial(), MAXN); body.castShadow = true; body.frustumCulled = false; body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const pb = new MB(); pb.snow = 0; pb.box(0.11, 0, 0.02, 0.018, 0.86, 0.018, '#7b6650'); pb.cone(0.11, 0.86, 0.02, 0.022, 0.08, 4, '#c8ccd0', { snowLow: 0, snowTip: 0 });
      pike = new THREE.InstancedMesh(pb.geometry(), V.Bygge.material(), 400); pike.frustumCulled = false; pike.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const sb = new MB(); sb.snow = 0; sb.box(-0.045, 0, 0.04, 0.03, 0.012, 0.62, '#8a6a45'); sb.box(0.045, 0, 0.04, 0.03, 0.012, 0.62, '#8a6a45'); sb.box(0.13, 0.02, 0.1, 0.012, 0.3, 0.012, '#6b5743');
      ski = new THREE.InstancedMesh(sb.geometry(), V.Bygge.material(), 120); ski.frustumCulled = false; ski.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      for (let k = 0; k < MAXN; k++) body.setColorAt(k, c3.set('#ffffff'));
      scene.add(body, pike, ski);
    },
    // Ny gubbe. slag styr klädfärgen.
    add(x, z, slag, opt) {
      const pal = FARG[slag] || FARG.bonde, u = Object.assign({ x, z, ang: Math.random() * 6.28, sc: 0.92 + Math.random() * 0.2, col: pal[Math.floor(Math.random() * pal.length)], pike: false, ski: false, vis: true, gar: false, fas: Math.random() * 6.28, lean: 0, fall: 0, y: 0, slag }, opt || {});
      units.push(u); return u;
    },
    remove(u) { const i = units.indexOf(u); if (i >= 0) units.splice(i, 1); },
    update(t) {
      let n = 0, np = 0, ns = 0;
      for (const u of units) {
        if (!u.vis || n >= MAXN) continue;
        const gy = Geo.groundAt(u.x, u.z) + u.y, bob = u.gar ? Math.abs(Math.sin(t * 9 + u.fas)) * 0.04 : 0, sc = u.sc * 1.35 * (1 - u.fall * 0.25);
        e3.set(u.lean + u.fall * 1.45, u.ang, u.gar ? Math.sin(t * 9 + u.fas) * 0.07 : 0, 'YXZ'); q4.setFromEuler(e3);
        p3.set(u.x, gy + bob * (u.skidar ? 0.3 : 1) + u.fall * 0.04, u.z); s3.set(sc, sc, sc); m4.compose(p3, q4, s3);
        body.setMatrixAt(n, m4); body.setColorAt(n, V.col(u.col)); n++;
        if (u.pike && np < 400) pike.setMatrixAt(np++, m4);
        if (u.skidar && ns < 120) { e3.set(0, u.ang, 0); q4.setFromEuler(e3); p3.y = gy + 0.01; m4.compose(p3, q4, s3); ski.setMatrixAt(ns++, m4); }
      }
      body.count = n; pike.count = np; ski.count = ns;
      body.instanceMatrix.needsUpdate = true; if (body.instanceColor) body.instanceColor.needsUpdate = true; pike.instanceMatrix.needsUpdate = true; ski.instanceMatrix.needsUpdate = true;
    }
  };

  // ---- Gustav: på skidor när det ligger snö, annars till häst ------------------------------------
  function gustavModel(sort) {
    const g = new THREE.Group(), mat = V.Bygge.material(), sten = sort === 'sten', rock = sten ? '#2f4f8a' : '#75808a', rock2 = sten ? '#223c6c' : '#56606a', arm = sten ? '#2a4780' : '#6b7680', hatt = sten ? '#d9b030' : '#a8322a', hatt2 = sten ? '#b08a1c' : '#8f2a22', balte = sten ? '#d9b030' : '#3a2a1e';
    const fot = new MB(); fot.snow = 0;
    fot.box(-0.05, 0, 0, 0.07, 0.2, 0.08, '#4a3b2d'); fot.box(0.05, 0, 0, 0.07, 0.2, 0.08, '#4a3b2d');
    fot.box(0, 0.19, 0, 0.24, 0.24, 0.15, rock, { low: rock2 }); fot.box(0, 0.19, 0, 0.25, 0.035, 0.16, balte);               // Gustav i grå vadmal, Sten Sture i Sturarnas blått och guld
    fot.box(-0.15, 0.22, 0, 0.06, 0.2, 0.07, arm); fot.box(0.15, 0.22, 0, 0.06, 0.2, 0.07, arm);
    fot.blob(0, 0.5, 0, 0.085, 0.09, 0.085, '#e0b490', { low: '#bb8c6a', snow: 0 }); fot.blob(0, 0.46, 0.05, 0.06, 0.045, 0.045, '#a5673a', { snow: 0 });      // skägg
    fot.cyl(0, 0.555, 0, 0.12, 0.12, 0.02, 8, hatt2, { cap: hatt2 }); fot.blob(0, 0.585, 0, 0.085, 0.05, 0.085, hatt, { snow: 0 });                // mössan: röd på Gustav, gul på Sten Sture
    const kropp = new THREE.Mesh(fot.geometry(), mat); kropp.castShadow = true;
    const sk = new MB(); sk.snow = 0; sk.box(-0.06, 0, 0.06, 0.04, 0.014, 0.9, '#9a7648'); sk.box(0.06, 0, 0.06, 0.04, 0.014, 0.9, '#9a7648'); sk.box(-0.06, 0.012, 0.5, 0.04, 0.03, 0.06, '#9a7648'); sk.box(0.06, 0.012, 0.5, 0.04, 0.03, 0.06, '#9a7648');
    const skidor = new THREE.Mesh(sk.geometry(), mat);
    const st = new MB(); st.snow = 0; st.box(0, 0, 0, 0.016, 0.46, 0.016, '#6b5743');
    const stavV = new THREE.Mesh(st.geometry(), mat), stavH = new THREE.Mesh(st.geometry(), mat); stavV.position.set(-0.19, 0.02, 0.1); stavH.position.set(0.19, 0.02, 0.1);
    const hb = new MB(); hb.snow = 0;                                                                                // hästen
    hb.box(0, 0.26, 0, 0.2, 0.2, 0.52, '#6a4a32', { low: '#4f3624' }); for (const [x, z] of [[-0.07, 0.2], [0.07, 0.2], [-0.07, -0.2], [0.07, -0.2]]) hb.box(x, 0, z, 0.055, 0.27, 0.06, '#4f3624');
    hb.push().move(0, 0.4, 0.26).rotX(-0.7); hb.box(0, 0, 0, 0.12, 0.26, 0.13, '#6a4a32'); hb.pop(); hb.box(0, 0.58, 0.4, 0.1, 0.11, 0.2, '#6a4a32', { low: '#4f3624' }); hb.box(0, 0.36, -0.28, 0.04, 0.16, 0.04, '#2e2118');
    hb.box(0, 0.46, -0.02, 0.22, 0.03, 0.2, sten ? '#2f4f8a' : '#8f2a22');
    const hast = new THREE.Mesh(hb.geometry(), mat); hast.castShadow = true;
    g.add(kropp, skidor, stavV, stavH, hast);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.44, 28), new THREE.MeshBasicMaterial({ color: 0xf2b830, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.035; ring.renderOrder = 3; g.add(ring);
    g.userData = { kropp, skidor, stavV, stavH, hast, ring };
    return g;
  }
  V.Gustav = {
    init(scene, sort) { this.sort = sort; this.g = gustavModel(sort); this.g.scale.setScalar(1.65); scene.add(this.g); this.x = 0; this.z = 0; this.ang = 0; this.fart = 0; this.spar = []; this.initSpar(scene); },
    // Flytta och animera. fart 0..1 styr hur ivrigt han stakar eller galopperar.
    place(x, z, ang, fart, t, dt, tillSjoss) {
      const d = this.g.userData, sno = this.sort !== 'sten' && (World.snowAt(x, z) > 0.45 || World.iceAt(x, z)), gy = Geo.groundAt(x, z);
      this.x = x; this.z = z; let da = ang - this.ang; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; this.ang += da * Math.min(1, dt * 8);
      this.fart += (fart - this.fart) * Math.min(1, dt * 6); this.sno = sno;
      this.g.visible = !tillSjoss; this.g.position.set(x, gy, z); this.g.rotation.y = this.ang;
      d.skidor.visible = d.stavV.visible = d.stavH.visible = sno; d.hast.visible = !sno;
      const f = this.fart, w = t * (5 + f * 7);
      if (sno) {
        d.kropp.position.set(0, 0.012 + Math.abs(Math.sin(w)) * 0.012 * f, 0); d.kropp.rotation.x = 0.1 + 0.25 * f + Math.sin(w * 2) * 0.05 * f;
        d.stavV.rotation.x = -0.5 + Math.sin(w) * 0.7 * (0.3 + f); d.stavH.rotation.x = -0.5 - Math.sin(w) * 0.7 * (0.3 + f);
      } else {
        const gal = Math.abs(Math.sin(w * 0.9)) * 0.07 * (0.2 + f);
        d.hast.position.y = gal; d.hast.rotation.x = Math.sin(w * 0.9) * 0.09 * (0.2 + f); d.kropp.position.set(0, 0.3 + gal, -0.02); d.kropp.rotation.x = 0.08 + 0.12 * f;
      }
      d.ring.material.opacity = 0.7 + 0.2 * Math.sin(t * 3); d.ring.scale.setScalar(1 + 0.06 * Math.sin(t * 3));
      if (sno && !tillSjoss) this.addSpar(x, z, gy); this.drawSpar(t);
    },
    // Skidspåren ligger kvar en stund efter honom.
    initSpar(scene) {
      const N = 160; this.sparN = N; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 4 * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 4 * 3).fill(1), 3));
      const idx = []; for (let k = 0; k < N - 1; k++) for (const o of [0, 2]) { const a = k * 4 + o, b = a + 1, c = a + 4, d = a + 5; idx.push(a, c, b, b, c, d); }
      g.setIndex(idx); this.sparMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      this.sparMesh.frustumCulled = false; this.sparMesh.renderOrder = 3; scene.add(this.sparMesh);
    },
    addSpar(x, z, y) { const l = this.spar[this.spar.length - 1]; if (l && Math.hypot(l.x - x, l.z - z) < 0.22) return; this.spar.push({ x, z, y, ang: this.ang, t: U.uTime.value }); if (this.spar.length > this.sparN) this.spar.shift(); },
    drawSpar(t) {
      const pos = this.sparMesh.geometry.attributes.position, col = this.sparMesh.geometry.attributes.color, n = this.spar.length;
      for (let k = 0; k < this.sparN; k++) {
        const s = this.spar[Math.min(k, n - 1)] || { x: 0, z: 0, y: -5, ang: 0, t: -99 }, cx = Math.cos(s.ang), sz = -Math.sin(s.ang), age = Math.min(1, (t - s.t) / 45), c = 0.74 + 0.26 * age;
        [-0.095, -0.05, 0.05, 0.095].forEach((o, j) => { pos.setXYZ(k * 4 + j, s.x + cx * o, s.y + 0.025, s.z + sz * o); col.setXYZ(k * 4 + j, k >= n ? 1 : c, k >= n ? 1 : c + 0.02, k >= n ? 1 : Math.min(1, c + 0.06)); });
      }
      pos.needsUpdate = true; col.needsUpdate = true; this.sparMesh.geometry.setDrawRange(0, Math.max(0, n - 1) * 12);
    }
  };

  // ---- skepp: kogg eller kravell med ett råsegel -------------------------------------------------
  V.skepp = function (flagga, stor) {
    const b = new MB(); b.snow = 0; const s = stor ? 1.5 : 1;
    b.push().scale(s);
    b.box(0, -0.06, 0, 0.36, 0.2, 0.9, '#6f5540', { low: '#4a3628', top: '#8a7256' }); b.tri([-0.18, -0.06, 0.45], [0.18, -0.06, 0.45], [0, -0.06, 0.78], '#4a3628', 0); b.tri([0.18, 0.14, 0.45], [-0.18, 0.14, 0.45], [0, 0.18, 0.78], '#8a7256', 0);
    b.quad([-0.18, -0.06, 0.45], [0, -0.06, 0.78], [0, 0.18, 0.78], [-0.18, 0.14, 0.45], '#5a4534', '#6f5540', 0); b.quad([0, -0.06, 0.78], [0.18, -0.06, 0.45], [0.18, 0.14, 0.45], [0, 0.18, 0.78], '#5a4534', '#6f5540', 0);
    b.box(0, 0.14, -0.33, 0.38, 0.14, 0.26, '#7b6048', { low: '#5a4534', top: '#8a7256' }); if (stor) b.box(0, 0.14, 0.34, 0.34, 0.1, 0.2, '#7b6048', { low: '#5a4534', top: '#8a7256' });
    b.box(0, 0.14, 0.02, 0.035, 0.95, 0.035, '#5a4838'); b.box(0, 0.92, 0.02, 0.62, 0.025, 0.025, '#5a4838');
    b.kind = 4; const col = V.col('#eadfc4'), col2 = V.col('#cfc2a3');
    for (const side of [1, -1]) { const z = 0.03 + side * 0.004, i0 = b._v(-0.29, 0.42, z, 0, 0, side, col2, 0.3), i1 = b._v(0.29, 0.42, z, 0, 0, side, col2, 0.3), i2 = b._v(0.3, 0.92, z, 0, 0, side, col, 0.05), i3 = b._v(-0.3, 0.92, z, 0, 0, side, col, 0.05), im = b._v(0, 0.4, z, 0, 0, side, col2, 0.9); if (side > 0) b.i.push(i0, im, i3, im, i1, i2, im, i2, i3); else b.i.push(i0, i3, im, im, i2, i1, im, i3, i2); }
    b.kind = 0; b.pop();
    const g = new THREE.Group(), hull = new THREE.Mesh(b.geometry(), V.Bygge.material()); hull.castShadow = true; g.add(hull);
    const f = V.Bygge.flagga(flagga); f.scale.setScalar(0.5 * s); f.position.set(0, 0.86 * s, 0.02 * s); g.add(f);
    return g;
  };

  // ---- rök, gnistor, pilar och snöfall ----------------------------------------------------------
  const PN = 1800, part = [];
  let pGeo, pMesh, pFree = [];
  const Fx = V.Fx = {
    init(scene) {
      pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PN * 3), 3)); pGeo.setAttribute('aCol', new THREE.BufferAttribute(new Float32Array(PN * 4), 4)); pGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(PN), 1));
      const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uH: { value: 800 } },
        vertexShader: 'attribute vec4 aCol; attribute float aSize; varying vec4 vCol; uniform float uH; void main(){ vCol = aCol; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uH / -mv.z; }',
        fragmentShader: 'varying vec4 vCol; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.15, length(d)); if (a < 0.01) discard; gl_FragColor = linearToOutputTexel(vec4(vCol.rgb, vCol.a * a)); }' });
      pMesh = new THREE.Points(pGeo, mat); pMesh.frustumCulled = false; pMesh.renderOrder = 5; pMesh.layers.set(1); scene.add(pMesh);
      for (let k = 0; k < PN; k++) { part.push({ life: 0 }); pFree.push(k); }
      this.mat = mat;
    },
    spawn(o) { const k = pFree.pop(); if (k === undefined) return null; const p = part[k]; Object.assign(p, { vx: 0, vy: 0, vz: 0, g: 0, drag: 0, size: 0.3, grow: 0, r: 1, gr: 1, b: 1, a: 1, fade: 1, max: 1 }, o); p.life = p.max; return p; },
    // färdiga effekter
    rok(x, y, z, mork) { const c = mork ? 0.16 : 0.5 + Math.random() * 0.2; Fx.spawn({ x: x + (Math.random() - 0.5) * 0.06, y, z, vx: 0.12 + Math.random() * 0.1, vy: 0.35 + Math.random() * 0.2, vz: (Math.random() - 0.5) * 0.08, size: 0.16, grow: 0.3, r: c, gr: c, b: c * 1.05, a: mork ? 0.5 : 0.36, max: 2.6 + Math.random() * 1.2 }); },
    gnista(x, y, z) { Fx.spawn({ x: x + (Math.random() - 0.5) * 0.1, y, z: z + (Math.random() - 0.5) * 0.1, vx: (Math.random() - 0.5) * 0.2, vy: 0.5 + Math.random() * 0.5, vz: (Math.random() - 0.5) * 0.2, size: 0.05, r: 1, gr: 0.6, b: 0.15, a: 1, max: 0.6 + Math.random() * 0.5 }); },
    guld(x, y, z, n, rad) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, d = Math.random() * (rad || 1.5); Fx.spawn({ x: x + Math.cos(a) * d, y: y + Math.random() * 0.3, z: z + Math.sin(a) * d, vy: 0.9 + Math.random() * 1.3, vx: Math.cos(a) * 0.2, vz: Math.sin(a) * 0.2, size: 0.09 + Math.random() * 0.08, r: 1, gr: 0.82, b: 0.3, a: 1, max: 0.9 + Math.random() * 0.9 }); } },
    damm(x, y, z, n) { for (let k = 0; k < n; k++) { const a = Math.random() * 6.283; Fx.spawn({ x, y: y + 0.05, z, vx: Math.cos(a) * (0.5 + Math.random()), vy: 0.25 + Math.random() * 0.3, vz: Math.sin(a) * (0.5 + Math.random()), drag: 2.5, size: 0.22, grow: 0.5, r: 0.72, gr: 0.66, b: 0.56, a: 0.5, max: 0.9 + Math.random() * 0.5 }); } },
    pil(x0, y0, z0, x1, y1, z1) { const T = 0.7 + Math.random() * 0.25, g = 4; Fx.spawn({ x: x0, y: y0, z: z0, vx: (x1 - x0) / T, vz: (z1 - z0) / T, vy: (y1 - y0) / T + g * T / 2, g, size: 0.045, r: 0.12, gr: 0.1, b: 0.08, a: 1, fade: 0, max: T }); },
    krut(x, y, z) { for (let k = 0; k < 10; k++) Fx.spawn({ x, y, z, vx: (Math.random() - 0.5) * 0.8, vy: 0.3 + Math.random() * 0.6, vz: (Math.random() - 0.5) * 0.8, drag: 1.5, size: 0.25, grow: 0.6, r: 0.85, gr: 0.85, b: 0.85, a: 0.6, max: 1.4 + Math.random() }); Fx.spawn({ x, y, z, size: 0.5, r: 1, gr: 0.8, b: 0.4, a: 1, max: 0.12 }); },
    update(dt, cam) {
      const pos = pGeo.attributes.position.array, col = pGeo.attributes.aCol.array, sz = pGeo.attributes.aSize.array;
      // snöfall kring kameran när vintern är som djupast
      if (U.uSnow.value > 0.55 && cam && this.sno !== false) { const n = Math.round(60 * dt * Math.min(1, cam.d / 30) * (U.uSnow.value - 0.4) * 3), r = Math.min(60, cam.d * 0.8); for (let k = 0; k < n; k++) Fx.spawn({ x: cam.x + (Math.random() - 0.5) * r * 2, y: cam.gy + 2 + Math.random() * Math.min(10, cam.d * 0.2), z: cam.z + (Math.random() - 0.7) * r * 1.4, vx: 0.3, vy: -0.9 - Math.random() * 0.5, vz: 0.1, size: 0.035 + cam.d * 0.0012, r: 1, gr: 1, b: 1, a: 0.85, max: 3.5, golv: 1 }); }
      for (let k = 0; k < PN; k++) {
        const p = part[k];
        if (p.life > 0) {
          p.life -= dt; if (p.life <= 0 || (p.golv && p.y < Geo.groundAt(p.x, p.z))) { p.life = 0; pFree.push(k); sz[k] = 0; continue; }
          p.vy -= p.g * dt; if (p.drag) { const f = Math.exp(-p.drag * dt); p.vx *= f; p.vz *= f; p.vy *= f; }
          p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.size += p.grow * dt;
          pos[3 * k] = p.x; pos[3 * k + 1] = p.y; pos[3 * k + 2] = p.z; col[4 * k] = p.r; col[4 * k + 1] = p.gr; col[4 * k + 2] = p.b; col[4 * k + 3] = p.a * (p.fade ? Math.min(1, p.life / p.max * 1.6) : 1); sz[k] = p.size;
        }
      }
      pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aCol.needsUpdate = true; pGeo.attributes.aSize.needsUpdate = true;
    }
  };
})();
