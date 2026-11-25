// Landskapet: mark, vatten, skog och årstider. Allt ritas med egna färgprogram så att det går att zooma hur nära som helst.
(function () {
  'use strict';
  const V = window.VASA = window.VASA || {}, Geo = V.Geo, MB = V.MB, lin = V.hexToLin;
  const v3 = hex => { const c = lin(hex); return new THREE.Vector3(c.r, c.g, c.b); };

  // Gemensamma värden som alla färgprogram läser (tid, årstid, sol).
  const U = V.U = {
    uTime: { value: 0 }, uSnow: { value: 0 }, uGreen: { value: 1 }, uAutumn: { value: 0 }, uBare: { value: 0 }, uIce: { value: 0 }, uCloud: { value: 1 },
    uCropCol: { value: v3('#7fae3a') }, uCropAmt: { value: 1 }, uMap: { value: new THREE.Vector2(Geo.W, Geo.H) }, uParch: { value: v3('#e6d7b8') },
    uSunDir: { value: new THREE.Vector3(-0.45, 0.6, 0.55).normalize() }, uSunCol: { value: new THREE.Vector3(1, 0.95, 0.85) }, uAmb: { value: new THREE.Vector3(0.5, 0.55, 0.65) },
    uPaint: { value: null }, uData: { value: null }, uFlat: { value: new THREE.Vector3(1, 1, 1) }      // uFlat = ljuset på en plan yta, så att isen får samma ljus som snön
  };

  const NOISE = `
    float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash12(i), hash12(i+vec2(1.,0.)), u.x), mix(hash12(i+vec2(0.,1.)), hash12(i+vec2(1.,1.)), u.x), u.y); }
    float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a*vnoise(p); p = p*2.03 + vec2(11.7,-5.3); a *= .5; } return s/0.9375; }
  `;
  const EDGE = `
    { vec2 ep = vWPos.xz; float eg = min(min(ep.x + uMap.x*0.5, uMap.x*0.5 - ep.x), min(ep.y + uMap.y*0.5, uMap.y*0.5 - ep.y));
      float ef = smoothstep(0.0, 18.0, eg + (fbm(ep*0.09) - 0.5)*14.0); gl_FragColor.rgb = mix(uParch, gl_FragColor.rgb, ef); }
  `;

  // ---- årstider -----------------------------------------------------------------------------
  // t = 0 är nyår, 0.5 är midsommar. Tolv värden per kurva, ett för mitten av varje månad.
  const K = {
    snow: [1, 1, 0.86, 0.48, 0.12, 0, 0, 0, 0, 0.06, 0.45, 0.85],
    green: [0.05, 0.05, 0.1, 0.35, 0.8, 1, 1, 0.95, 0.8, 0.5, 0.2, 0.08],
    autumn: [0, 0, 0, 0, 0, 0, 0, 0.05, 0.5, 1, 0.6, 0],
    bare: [1, 1, 1, 0.75, 0.1, 0, 0, 0, 0, 0.25, 0.85, 1],
    ice: [1, 1, 0.9, 0.4, 0, 0, 0, 0, 0, 0, 0.15, 0.7],
    crop: [0, 0, 0, 0.1, 0.5, 0.9, 1, 1, 0.75, 0.35, 0, 0],
    sunEl: [20, 24, 31, 39, 46, 51, 50, 45, 38, 30, 23, 19]
  };
  const CROPC = ['#7fae3a', '#7fae3a', '#7fae3a', '#7fae3a', '#7fae3a', '#86ad3c', '#a3ad42', '#c9a94a', '#bfa258', '#ab9660', '#8f8455', '#7fae3a'];
  const SUNC = ['#ffd2a6', '#ffd8b0', '#ffe2c0', '#ffeacc', '#fff0d6', '#fff3dc', '#fff3dc', '#ffefd2', '#ffe6c2', '#ffdcb2', '#ffd4a8', '#ffcfa2'];
  const AMBC = ['#8fa4d6', '#93a8d6', '#9bb0d8', '#a3b8da', '#a9bfdc', '#adc4de', '#adc4de', '#a9bfda', '#a3b6d6', '#9aacd4', '#92a4d4', '#8ea2d6'];
  function key(arr, t) { const m = ((t % 1) + 1) % 1 * 12 - 0.5, i = Math.floor(m), f = m - i, a = arr[(i + 12) % 12], b = arr[(i + 13) % 12]; return a + (b - a) * f; }
  function keyCol(arr, t) { const m = ((t % 1) + 1) % 1 * 12 - 0.5, i = Math.floor(m), f = m - i; return lin(arr[(i + 12) % 12]).clone().lerp(lin(arr[(i + 13) % 12]), f); }
  const season = { t: 0.5, sunEl: 50, snow: 0 };
  function setSeason(t) {
    season.t = t;
    U.uSnow.value = season.snow = key(K.snow, t); U.uGreen.value = key(K.green, t); U.uAutumn.value = key(K.autumn, t); U.uBare.value = key(K.bare, t); U.uIce.value = key(K.ice, t);
    U.uCropAmt.value = key(K.crop, t); const cc = keyCol(CROPC, t); U.uCropCol.value.set(cc.r, cc.g, cc.b);
    season.sunEl = key(K.sunEl, t); season.sunCol = keyCol(SUNC, t); season.ambCol = keyCol(AMBC, t);
    const el = season.sunEl * Math.PI / 180, az = -0.72;      // solen står i sydväst
    U.uSunDir.value.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
    U.uSunCol.value.set(season.sunCol.r, season.sunCol.g, season.sunCol.b); U.uAmb.value.set(season.ambCol.r, season.ambCol.g, season.ambCol.b);
  }
  // Hur mycket snö som ligger på en plats just nu (samma räkning som i färgprogrammen).
  function snowAt(x, z) { const latN = 0.5 - z / Geo.H, s = U.uSnow.value * 1.25 + (latN - 0.5) * 0.5 + Geo.groundAt(x, z) * 0.05; return Geo.smooth(0.5, 0.72, s); }
  function iceAt(x, z) { return U.uIce.value > 0.55 && Geo.heightAt(x, z) < 0 && (Geo.freshAt(x, z) > 0.5 || Geo.sdAt(x, z) > -3.5); }

  // ---- målad mark: älvar (röd), stigar och gårdsplaner (grön), åkrar (blå) -------------------
  const Paint = {
    init() {
      const cw = 4096, ch = Math.round(cw * Geo.H / Geo.W); this.cw = cw; this.ch = ch;
      const c = this.canvas = document.createElement('canvas'); c.width = cw; c.height = ch;
      const x = this.ctx = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, cw, ch); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round'; x.lineJoin = 'round';
      this.k = cw / Geo.W;
      const t = this.tex = new THREE.CanvasTexture(c); t.flipY = false; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 4;
      U.uPaint.value = t;
    },
    X(x) { return (x / Geo.W + 0.5) * this.cw; }, Z(z) { return (z / Geo.H + 0.5) * this.ch; },
    line(pts, w, color, soft) {
      const x = this.ctx; x.strokeStyle = color;
      for (let pass = 0; pass < (soft ? 3 : 1); pass++) {
        x.globalAlpha = soft ? [0.3, 0.4, 0.6][pass] : 1; x.lineWidth = Math.max(1, w * this.k * (soft ? [1.9, 1.35, 0.85][pass] : 1));
        x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(this.X(p[0]), this.Z(p[1])) : x.moveTo(this.X(p[0]), this.Z(p[1]))); x.stroke();
      }
      x.globalAlpha = 1;
    },
    river(pts, w) { this.line(pts, w, '#ff0000', true); },
    road(pts, w) { this.line(pts, w || 0.16, '#00ff00', true); },
    yard(x, z, r) { const c = this.ctx, g = c.createRadialGradient(this.X(x), this.Z(z), 0, this.X(x), this.Z(z), r * this.k); g.addColorStop(0, 'rgba(0,255,0,0.85)'); g.addColorStop(0.6, 'rgba(0,255,0,0.6)'); g.addColorStop(1, 'rgba(0,255,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(this.X(x), this.Z(z), r * this.k, 0, 7); c.fill(); },
    field(x, z, w, d, ang) { const c = this.ctx; c.save(); c.translate(this.X(x), this.Z(z)); c.rotate(ang); c.fillStyle = '#0000ff'; c.fillRect(-w / 2 * this.k, -d / 2 * this.k, w * this.k, d * this.k); c.restore(); },
    commit() { this.tex.needsUpdate = true; }
  };

  // ---- marken -------------------------------------------------------------------------------
  function buildTerrain() {
    const G = Geo.G, NX = Geo.NX, NZ = Geo.NZ, n = NX * NZ, C = Geo.CELL;
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), bio = new Float32Array(n * 4), sd = new Float32Array(n);
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
      const k = j * NX + i;
      pos[3 * k] = -Geo.W / 2 + i * C; pos[3 * k + 1] = G.height[k]; pos[3 * k + 2] = -Geo.H / 2 + j * C;
      const hl = G.height[j * NX + Math.max(0, i - 1)], hr = G.height[j * NX + Math.min(NX - 1, i + 1)], hu = G.height[Math.max(0, j - 1) * NX + i], hd = G.height[Math.min(NZ - 1, j + 1) * NX + i];
      const nx = hl - hr, nz = hu - hd, ny = 2 * C, l = Math.hypot(nx, ny, nz);
      nor[3 * k] = nx / l; nor[3 * k + 1] = ny / l; nor[3 * k + 2] = nz / l;
      bio[4 * k] = G.forest[k]; bio[4 * k + 1] = G.field[k]; bio[4 * k + 2] = G.shoreF[k]; bio[4 * k + 3] = G.rock[k]; sd[k] = G.sd[k];
    }
    const idx = new Uint32Array(Geo.GW * Geo.GH * 6); let q = 0;
    for (let j = 0; j < Geo.GH; j++) for (let i = 0; i < Geo.GW; i++) { const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d; }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('aBio', new THREE.BufferAttribute(bio, 4)); g.setAttribute('aSd', new THREE.BufferAttribute(sd, 1)); g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.computeBoundingSphere();

    const m = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x000000, shininess: 1 });
    const C3 = { cGrassA: '#7a9f3a', cGrassB: '#4f8431', cGrassDry: '#948f55', cGrassAut: '#a39240', cFloor: '#2e5227', cMoss: '#426c2d', cSoil: '#6b5031', cRock: '#93908a', cRockD: '#6d6b68',
      cSand: '#d6c38f', cHeath: '#7f8650', cDirt: '#8a6c45', cSnow: '#eef3fb', cSnowPack: '#d5dcea', cRiver: '#3a8aa6', cIce: '#c3dbee', cBed: '#24555c', cReed: '#6f8a3a' };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U); for (const k in C3) sh.uniforms[k] = { value: v3(C3[k]) };
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aBio; attribute float aSd; varying vec4 vBio; varying float vSd; varying vec3 vWPos; varying vec3 vWNor;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvBio = aBio; vSd = aSd; vWPos = transformed; vWNor = normal;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
        varying vec4 vBio; varying float vSd; varying vec3 vWPos; varying vec3 vWNor;
        uniform float uTime, uSnow, uGreen, uAutumn, uCropAmt, uCloud; uniform vec3 uCropCol, uParch; uniform vec2 uMap; uniform sampler2D uPaint;
        uniform vec3 ${Object.keys(C3).join(', ')};
        ${NOISE}
        vec3 terrainColor() {
          vec2 p = vWPos.xz; float h = vWPos.y;
          float n1 = fbm(p * 0.33), n2 = fbm(p * 1.7 + 13.0), n3 = vnoise(p * 7.0 + 3.0);
          vec4 paint = texture2D(uPaint, p / uMap + 0.5);
          float slope = 1.0 - normalize(vWNor).y;
          vec3 grass = mix(cGrassA, cGrassB, smoothstep(0.3, 0.7, n1));
          grass = mix(cGrassDry, grass, uGreen); grass = mix(grass, cGrassAut, uAutumn * 0.55);
          float fo = smoothstep(0.3, 0.7, vBio.x + (n2 - 0.5) * 0.35);
          vec3 col = mix(grass, mix(cFloor, cMoss, n2), fo * 0.8);
          // åkrarnas lapptäcke
          vec2 cell = floor(p / 2.6 + vec2(n1, n2) * 0.5); float plot = hash12(cell);
          float lapp = step(1.0 - vBio.y * 0.85, plot) * step(0.2, vBio.y) * (1.0 - fo);
          float fieldAmt = max(lapp, paint.b);
          float ang = plot * 6.283, stripe = 0.5 + 0.5 * sin(dot(p, vec2(cos(ang), sin(ang))) * 16.0), kind = fract(plot * 7.31);
          vec3 soil = cSoil * (0.85 + 0.3 * stripe);
          vec3 crop = mix(soil, uCropCol * (0.9 + 0.2 * stripe), uCropAmt * step(0.25, kind));
          crop = mix(crop, grass * 1.06, step(kind, 0.25) * 0.8);
          col = mix(col, crop, fieldAmt);
          // klippor, strand, fjäll
          float rocky = smoothstep(0.38, 0.72, vBio.w + (n2 - 0.5) * 0.4 + slope * 3.0);
          vec3 rock = mix(cRockD, cRock, n3);
          col = mix(col, rock, rocky * 0.85);
          float shore = smoothstep(0.17, 0.05, h) * (1.0 - smoothstep(0.0, 0.5, vBio.w));
          float klipp = smoothstep(0.3, 0.46, 0.5 - p.y / uMap.y + (n1 - 0.5) * 0.12);          // norr om Skåne är kusten klippor, inte sand
          vec3 strand = mix(cSand * (0.92 + 0.16 * n3), mix(cRock, cSand, 0.25) * (0.8 + 0.3 * n3), klipp);
          col = mix(col, mix(strand, mix(cReed, grass, 0.4), vBio.z), shore);
          float fjall = smoothstep(2.5, 3.3, h + (n1 - 0.5) * 0.8);
          col = mix(col, mix(cHeath, rock, n2 * 0.7), fjall * 0.9);
          col = mix(col, cDirt * (0.85 + 0.3 * n3), paint.g * 0.9);
          col *= 0.88 + 0.24 * n2;
          col = mix(cBed, col, smoothstep(-0.1, 0.01, h));           // botten syns mörk genom grunt vatten
          // snö och is
          float latN = 0.5 - p.y / uMap.y;
          float s = uSnow * 1.25 + (latN - 0.5) * 0.5 + h * 0.05 + (n1 - 0.5) * 0.3 - rocky * slope * 0.6 + fjall * 0.35 * uSnow;
          float snow = smoothstep(0.5, 0.72, s);
          vec3 snowC = mix(cSnow * (0.95 + 0.07 * n3), cSnowPack, paint.g * 0.7);
          col = mix(col, snowC, snow);
          float riv = smoothstep(0.3, 0.55, paint.r);
          vec3 rc = cRiver * (0.8 + 0.35 * vnoise(p * 3.0 + vec2(uTime * 0.4, uTime * 0.15)));
          rc = mix(rc, mix(cSnow, cIce, 0.5) * (0.95 + 0.06 * n3), smoothstep(0.55, 0.8, s));
          col = mix(col, col * 0.72, smoothstep(0.08, 0.3, paint.r) * (1.0 - snow * 0.7));      // strandbrink
          col = mix(col, rc, riv);
          float cl = smoothstep(0.5, 0.75, fbm(p * 0.017 + uTime * vec2(0.011, 0.005)));
          col *= 1.0 - 0.28 * cl * uCloud;
          return col;
        }`)
        .replace('#include <map_fragment>', 'diffuseColor.rgb = terrainColor();')
        .replace('#include <tonemapping_fragment>', EDGE + '\n#include <tonemapping_fragment>');
    };
    const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.matrixAutoUpdate = false;
    return mesh;
  }

  // ---- vattnet ------------------------------------------------------------------------------
  function buildWater() {
    const G = Geo.G, NX = Geo.NX, NZ = Geo.NZ, data = new Uint8Array(NX * NZ * 4);
    for (let k = 0; k < NX * NZ; k++) {
      data[4 * k] = Math.max(0, Math.min(255, Math.round((G.sd[k] / 12 + 0.5) * 255)));
      data[4 * k + 1] = G.fresh[k] ? 255 : 0; data[4 * k + 2] = Math.max(0, Math.min(255, Math.round(-G.height[k] / 1.5 * 255))); data[4 * k + 3] = 255;
    }
    // sötvattnet ska inte läcka ut i havet när bilden jämnas ut: sprid sjömärket ett steg in över land
    const g1 = new Uint8Array(NX * NZ);
    for (let j = 1; j < NZ - 1; j++) for (let i = 1; i < NX - 1; i++) { const k = j * NX + i; if (G.land[k]) { let f = 0, w = 0; for (const o of [-1, 1, -NX, NX]) if (!G.land[k + o]) { w++; f += G.fresh[k + o]; } g1[k] = w ? Math.round(255 * f / w) : 0; } else g1[k] = G.fresh[k] ? 255 : 0; }
    for (let k = 0; k < NX * NZ; k++) data[4 * k + 1] = g1[k];
    const tex = new THREE.DataTexture(data, NX, NZ, THREE.RGBAFormat); tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.needsUpdate = true; U.uData.value = tex;
    const geo = new THREE.PlaneGeometry(Geo.W, Geo.H, 1, 1); geo.rotateX(-Math.PI / 2);
    const C3 = { cShallow: '#49b3bb', cMid: '#2c86b4', cDeep: '#1a4f8a', cLake: '#2d7fa3', cSky: '#bfd8f2', cIce: '#d3e5f3', cSnow: '#eef3fb' };
    const uni = Object.assign({ uCam: { value: new THREE.Vector3() } }, U); for (const k in C3) uni[k] = { value: v3(C3[k]) };
    const m = new THREE.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false,
      vertexShader: 'varying vec3 vWPos; void main(){ vWPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        varying vec3 vWPos; uniform sampler2D uData; uniform vec2 uMap; uniform float uTime, uIce, uCloud, uSnow; uniform vec3 uSunDir, uSunCol, uAmb, uCam, uParch, uFlat;
        uniform vec3 ${Object.keys(C3).join(', ')};
        ${NOISE}
        void main() {
          vec2 p = vWPos.xz; vec4 d = texture2D(uData, p / uMap + 0.5);
          float off = -(d.r - 0.5) * 12.0;                 // avstånd ut från land, noggrant nära stranden
          if (off < -0.5) discard;
          float fresh = d.g, deep = d.b * 1.5;             // djupet tar över längre ut
          vec2 w1 = p * 0.8 + uTime * vec2(0.06, 0.035), w2 = p * 2.6 - uTime * vec2(0.05, 0.08);
          float e = 0.2, a0 = fbm(w1), ax = fbm(w1 + vec2(e, 0.0)), az = fbm(w1 + vec2(0.0, e));
          float wv = a0 * 0.65 + vnoise(w2) * 0.35;
          vec3 n = normalize(vec3((a0 - ax) * 2.2, 1.0, (a0 - az) * 2.2));
          vec3 col = mix(cShallow, cMid, smoothstep(0.0, 3.2, off)); col = mix(col, cDeep, smoothstep(0.55, 1.15, deep));
          col = mix(col, mix(cShallow, cLake, smoothstep(0.0, 1.6, off)), fresh * 0.8);
          col *= 0.86 + 0.28 * wv;
          vec3 v = normalize(uCam - vWPos);
          float spec = pow(max(dot(reflect(-uSunDir, n), v), 0.0), 70.0);
          float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
          float light = clamp(uSunDir.y * 1.1 + 0.25, 0.4, 1.1);
          col = (mix(col, cSky, fres * 0.4) * light + spec * 0.55) * (uSunCol * 0.6 + uAmb * 0.55);
          // bränningar mot stranden
          float band = smoothstep(1.1, 0.05, off) * (1.0 - fresh * 0.85);
          float fo = band * smoothstep(0.35, 0.75, 0.5 + 0.5 * sin(off * 6.5 - uTime * 1.5 + vnoise(p * 1.3) * 6.0)) * (0.5 + 0.5 * vnoise(p * 4.0 + uTime * 0.3));
          fo = max(fo, smoothstep(0.07, 0.0, off) * 0.35 * (1.0 - fresh));
          col = mix(col, vec3(1.0) * (uSunCol * 0.6 + uAmb * 0.55), fo * 0.7 * (1.0 - uIce * 0.8));
          float alpha = mix(0.8, 0.97, smoothstep(0.0, 1.2, off));
          // is: sjöarna fryser helt, havet längs kusterna. Snön ligger kvar på isen utom där vinden blåst den ren.
          float latN = 0.5 - p.y / uMap.y, nz = fbm(p * 0.35);
          float amt = uIce * (0.55 + latN * 0.6) * max(fresh, smoothstep(0.75 + latN * 0.3, 0.2, deep));
          float ice = smoothstep(0.42, 0.56, amt + (nz - 0.5) * 0.35);
          float bare = smoothstep(0.58, 0.72, fbm(p * 0.55 + 4.0)) * smoothstep(0.3, 1.2, off);
          vec3 iceC = mix(cSnow * 0.985, cIce, bare * 0.8) * (0.97 + 0.04 * vnoise(p * 6.0));
          iceC *= uFlat;
          col = mix(col, iceC, ice); alpha = mix(alpha, 1.0, ice);
          float cl = smoothstep(0.5, 0.75, fbm(p * 0.017 + uTime * vec2(0.011, 0.005)));
          col *= 1.0 - 0.28 * cl * uCloud;
          gl_FragColor = vec4(col, alpha);
          ${EDGE}
          gl_FragColor = linearToOutputTexel(gl_FragColor);
        }`
    });
    const mesh = new THREE.Mesh(geo, m); mesh.renderOrder = 2; mesh.frustumCulled = false; mesh.matrixAutoUpdate = false;
    mesh.onBeforeRender = (r, s, cam) => uni.uCam.value.copy(cam.position);
    return mesh;
  }

  // ---- skogen -------------------------------------------------------------------------------
  function treeGeoms() {
    const out = {};
    const SN = { snowLow: 0, snowTip: 0.95 };
    let b = new MB(); b.kind = 0; b.cyl(0, 0, 0, 0.05, 0.035, 0.3, 5, '#4a3524'); b.kind = 1;                          // gran
    b.cone(0, 0.14, 0, 0.36, 0.52, 7, '#214f35', Object.assign({ low: '#143a27', tip: '#2b6340' }, SN)); b.cone(0, 0.44, 0, 0.29, 0.48, 7, '#245538', Object.assign({ low: '#173f2b', tip: '#2f6a43' }, SN));
    b.cone(0, 0.74, 0, 0.22, 0.44, 6, '#27583a', Object.assign({ low: '#19442e', tip: '#337048' }, SN)); b.cone(0, 1.02, 0, 0.14, 0.42, 6, '#2b603f', Object.assign({ low: '#1c4a32', tip: '#3a7a50' }, SN));
    out.gran = b.geometry();
    b = new MB(); b.kind = 0; b.cyl(0, 0, 0, 0.055, 0.035, 1.0, 5, '#a0683c', { low: '#5f422c' }); b.kind = 1;        // tall
    b.blob(0, 1.12, 0, 0.34, 0.2, 0.34, '#2f6238', { top: '#48824a', low: '#1f4a2c' }); b.blob(0.16, 0.92, 0.08, 0.2, 0.12, 0.2, '#2c5c36', { top: '#407842', low: '#1e452a' }); b.blob(-0.15, 1.0, -0.1, 0.18, 0.11, 0.18, '#2c5c36', { top: '#407842', low: '#1e452a' });
    out.tall = b.geometry();
    b = new MB(); b.kind = 0; b.cyl(0, 0, 0, 0.045, 0.025, 0.9, 5, '#efebe2', { low: '#bdb8ac' }); b.kind = 2;        // björk
    b.blob(0, 1.0, 0, 0.26, 0.34, 0.26, '#6f9f3a', { top: '#93c24d', low: '#4f8030' }); b.blob(-0.15, 0.74, 0.1, 0.2, 0.2, 0.2, '#6a9c38', { top: '#86b845', low: '#4a7a2d' }); b.blob(0.14, 0.82, -0.08, 0.19, 0.22, 0.19, '#6c9d39', { top: '#8cbd49', low: '#4c7c2e' });
    out.bjork = b.geometry();
    b = new MB(); b.kind = 0; b.cyl(0, 0, 0, 0.1, 0.07, 0.5, 5, '#5a4330', { low: '#3d2d20' }); b.kind = 2;         // ek och bok
    b.blob(0, 0.9, 0, 0.46, 0.38, 0.46, '#4c8033', { top: '#6ea343', low: '#335f27' }); b.blob(0.3, 0.7, -0.12, 0.3, 0.26, 0.3, '#4a7d32', { top: '#66993f', low: '#305a25' });
    b.blob(-0.28, 0.72, 0.14, 0.3, 0.25, 0.3, '#487a31', { top: '#63953d', low: '#2e5724' }); b.blob(0.02, 0.68, 0.3, 0.26, 0.22, 0.26, '#4a7d32', { top: '#66993f', low: '#305a25' });
    out.ek = b.geometry();
    return out;
  }
  let treeMat = null;
  function treeMaterial() {
    if (treeMat) return treeMat;
    const m = treeMat = new THREE.MeshLambertMaterial({ vertexColors: true });
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vBare; varying float vSnowK;\nfloat hashB(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }')
        .replace('#include <map_fragment>', 'if (vBare > 0.5 && hashB(floor(gl_FragCoord.xy * 0.75)) < (vBare - 0.5) * 1.2) discard;')       // kala kronor ritas glest, som kvistar
        .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.96, 1.0), smoothstep(0.38, 0.6, abs(vSnowK)) * step(0.0, vSnowK) + smoothstep(0.2, 0.9, -vSnowK) * 0.5);');
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aFx; uniform float uTime, uSnow, uAutumn, uBare; uniform vec2 uMap; varying float vBare; varying float vSnowK;')
        .replace('#include <color_vertex>', `#include <color_vertex>
          vec3 ipos = instanceMatrix[3].xyz;
          float rnd = fract(sin(dot(ipos.xz, vec2(12.9898, 78.233))) * 43758.5453);
          float sLoc = smoothstep(0.5, 0.72, uSnow * 1.25 + (0.5 - ipos.z / uMap.y - 0.5) * 0.5 + ipos.y * 0.05);
          float leafy = step(1.5, aFx.y);
          vec3 aut = mix(vec3(0.72, 0.42, 0.03), vec3(0.55, 0.11, 0.02), rnd * rnd) * (0.6 + 1.4 * vColor.g);
          vColor.rgb = mix(vColor.rgb, aut, leafy * uAutumn * (0.55 + 0.45 * rnd));
          vColor.rgb = mix(vColor.rgb, vec3(0.2, 0.15, 0.12), leafy * uBare);
          vSnowK = sLoc * aFx.x * mix(1.0, -1.0, leafy);          // barrträd får vita toppar, kala lövträd bara lite rimfrost
          vBare = leafy * uBare;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          if (aFx.y > 1.5) { transformed.xz *= 1.0 - 0.2 * uBare; }
          float sway = sin(uTime * 1.4 + ipos.x * 0.8 + ipos.z * 0.6) * 0.03 * transformed.y * transformed.y;
          transformed.x += sway; transformed.z += sway * 0.5;`);
    };
    return m;
  }

  // clear: [{x, z, r}], roads: [[[x,z],...]] där inga träd ska stå
  function buildForest(clear, roads) {
    const group = new THREE.Group(), geoms = treeGeoms(), rnd = Geo.rng(1520), CH = 44, SP = 0.74;
    const cx = Math.ceil(Geo.W / CH), cz = Math.ceil(Geo.H / CH), buckets = {};
    const blocked = (x, z) => {
      for (const c of clear) { const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz < c.r * c.r) return true; }
      for (const r of roads) for (let q = 0; q + 1 < r.length; q++) if (Math.abs(x - r[q][0]) < 6 && Math.abs(z - r[q][1]) < 6 && Geo.segDist(x, z, r[q], r[q + 1]) < 0.42) return true;
      return false;
    };
    let count = 0;
    for (let z = -Geo.H / 2 + 20; z < Geo.H / 2 - 20; z += SP) for (let x = -Geo.W / 2 + 20; x < Geo.W / 2 - 20; x += SP) {
      const px = x + (rnd() - 0.5) * SP * 0.95, pz = z + (rnd() - 0.5) * SP * 0.95, r0 = rnd(), r1 = rnd(), r2 = rnd(), r3 = rnd();
      const f = Geo.forestAt(px, pz); if (f < 0.04) continue;
      const clump = Geo.fbm(px * 0.42, pz * 0.42, 2, 91);
      if (r0 > f * (0.5 + clump * 1.1)) continue;
      const h = Geo.heightAt(px, pz); if (h < 0.09 || Geo.riverAt(px, pz) < 0.28) continue;
      if (blocked(px, pz)) continue;
      const lf = Geo.leafAt(px, pz), ll = Geo.toLonLat(px, pz);
      let kind;
      if (r1 < lf) kind = (ll[1] < 57.6 && r2 < 0.75) || r2 < 0.2 ? 'ek' : 'bjork'; else kind = r2 < 0.68 ? 'gran' : 'tall';
      const key = kind + ':' + Math.floor((px + Geo.W / 2) / CH) + ':' + Math.floor((pz + Geo.H / 2) / CH);
      (buckets[key] || (buckets[key] = [])).push(px, h, pz, r3, r2);
      count++;
    }
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), c = new THREE.Color();
    for (const key in buckets) {
      const arr = buckets[key], n = arr.length / 5, kind = key.split(':')[0], mesh = new THREE.InstancedMesh(geoms[kind], treeMaterial(), n);
      let minx = 1e9, maxx = -1e9, minz = 1e9, maxz = -1e9, maxy = 0;
      for (let k = 0; k < n; k++) {
        const x = arr[5 * k], y = arr[5 * k + 1], z = arr[5 * k + 2], a = arr[5 * k + 3], b = arr[5 * k + 4], sc = (kind === 'ek' ? 0.9 : 0.82) + a * 0.5;
        p.set(x, y - 0.03, z); q.setFromAxisAngle(up, a * 6.283); s.set(sc * (0.9 + b * 0.2), sc * (0.9 + (1 - b) * 0.3), sc * (0.9 + b * 0.2));
        mesh.setMatrixAt(k, m4.compose(p, q, s)); const t = 0.82 + ((a * 7.13) % 1) * 0.3; c.setRGB(t, t * (0.96 + b * 0.08), t * 0.97); mesh.setColorAt(k, c);
        if (x < minx) minx = x; if (x > maxx) maxx = x; if (z < minz) minz = z; if (z > maxz) maxz = z; if (y > maxy) maxy = y;
      }
      mesh.geometry = mesh.geometry.clone(); mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3((minx + maxx) / 2, maxy / 2, (minz + maxz) / 2), Math.hypot(maxx - minx, maxz - minz, maxy) / 2 + 2);
      mesh.frustumCulled = true;          // three stänger av gallringen för InstancedMesh. Med den egna sfären ovan ritas bara de skogsrutor som syns, inte alla 70 000 träd
      mesh.castShadow = true; mesh.receiveShadow = false; mesh.matrixAutoUpdate = false; group.add(mesh);
    }
    group.userData.count = count;
    return group;
  }

  V.World = {
    U, Paint, season, setSeason, snowAt, iceAt,
    build(scene, clear, roads) {
      Geo.init(); Paint.init();
      for (const r of Geo.G.rivers) Paint.river(r.pts, r.w);
      this.terrain = buildTerrain(); this.water = buildWater(); this.forest = buildForest(clear || [], roads || []);
      scene.add(this.terrain, this.water, this.forest);
      Paint.commit(); setSeason(0.5);
    }
  };
})();
