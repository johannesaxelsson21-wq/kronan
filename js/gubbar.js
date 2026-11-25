// Gubbarna och hjältarna. Kraftiga proportioner som i Warcraft 3: stora huvuden, tydliga händer, mössor och vapen som syns på håll.
// Vanligt folk ritas i svep (en omgång per sort) och rör ben och armar i färgprogrammet. Hjälten är en egen ledad figur.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, MB = V.MB, U = V.U, World = V.World;
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3(), e3 = new THREE.Euler();
  const SKALA = 1.4, HUD = '#e2b48e', HUD2 = '#c08e6a', STAL = '#b4bac0', STAL2 = '#858c93';

  // Kläder: första färgen är rocken, den andra mössan, huvan eller förklädet. Bönder i vadmal, knektar i brokigt, danskar i rött.
  const FARG = {
    bonde: [['#8a8273', '#a8322a'], ['#6f6558', '#2f4f8a'], ['#9a8f78', '#3f6a3a'], ['#5f6a5a', '#8a6a2a'], ['#7d6a52', '#a8322a'], ['#a39a86', '#6a3a5a'], ['#77705f', '#c9b48a']],
    knekt: [['#c8452c', '#d9a82e'], ['#d9a82e', '#c8452c'], ['#3a6fb0', '#f0e6c8'], ['#4f9a3c', '#d9a82e'], ['#9a3f9a', '#f0e6c8'], ['#c8452c', '#3a6fb0']],
    dansk: [['#b8312a', '#f0ece2'], ['#c23a30', '#f0ece2']],
    borgare: [['#5a4a6a', '#2a2622'], ['#3f5f6a', '#5a2a2a'], ['#7a4a3a', '#2f3f5a'], ['#4f6a4a', '#2a2622'], ['#6a5a3a', '#5a2a2a']],
    kvinna: [['#7a4a3a', '#efe9dc'], ['#4f6a5a', '#efe9dc'], ['#6a5a7a', '#e6dcc8'], ['#8a6a3a', '#efe9dc'], ['#5a6a8a', '#e6dcc8']],
    bergsman: [['#5a5550', '#3a2e24'], ['#6a5f52', '#3a2e24'], ['#4f4a45', '#4a3a2c']],
    rysk: [['#4f6a3a', '#5a4030'], ['#6a5a2a', '#4a3526'], ['#7a3a2a', '#5a4030']]
  };
  const HAR = { bonde: '#7a5a3a', bage: '#b8935a', knekt: '#8a4a2a', dansk: '#5a4a3a', borgare: '#8a8580', bergsman: '#3a2e24', rysk: '#2e2620', kvinna: '#7a5a3a' };

  // ---- en gubbe: kroppsdelar märkta så att färgprogrammet kan svänga ben och armar -------------
  function figur(typ) {
    const b = new MB(); b.snow = 0;
    const del = (part, kind) => { b.part = part; b.kind = kind; };
    const kvinna = typ === 'kvinna', lang = typ === 'borgare' || typ === 'rysk', knekt = typ === 'knekt', har = HAR[typ];
    for (const [s, part] of [[-1, 1], [1, 2]]) {                                          // stövlar och ben
      del(part, 0); b.box(s * 0.055, 0, 0.014, 0.08, 0.055, 0.118, knekt || typ === 'dansk' ? '#2a2420' : '#3d2e22', { low: '#241c16' });
      del(part, knekt ? 6 : 7); b.box(s * 0.055, 0.05, 0, 0.072, 0.17, 0.082, '#ffffff', { low: '#d2d2d2' });
    }
    del(0, 5);
    if (kvinna) { b.cyl(0, 0.03, 0, 0.135, 0.09, 0.21, 8, '#ffffff', { low: '#c6c6c6' }); del(0, 6); b.box(0, 0.06, 0.082, 0.105, 0.16, 0.02, '#ffffff', { low: '#dcdcdc' }); del(0, 5); }
    else b.box(0, lang ? 0.09 : 0.15, 0, 0.195, lang ? 0.14 : 0.08, 0.13, '#eeeeee', { low: '#c4c4c4', noTop: true });      // rockskört
    b.box(0, 0.215, 0, 0.178, 0.07, 0.118, '#ffffff', { low: '#dedede' }); b.box(0, 0.27, 0, 0.21, 0.13, 0.128, '#ffffff', { low: '#e4e4e4' });      // bål, bred över axlarna
    del(0, 0); b.box(0, 0.226, 0, 0.19, 0.028, 0.128, knekt ? '#d9b030' : '#2e2118');                                             // bälte
    if (typ === 'dansk') b.box(0, 0.262, 0.002, 0.196, 0.135, 0.14, STAL, { low: STAL2 });                                       // bröstharnesk
    for (const [s, part] of [[-1, 3], [1, 4]]) {                                          // armar och händer
      del(part, knekt ? 6 : 5); b.box(s * 0.14, 0.235, 0, knekt ? 0.078 : 0.062, 0.16, knekt ? 0.088 : 0.074, '#e8e8e8', { low: '#c2c2c2' });
      del(part, 0); b.box(s * 0.14, 0.188, 0.006, 0.056, 0.052, 0.062, HUD, { low: HUD2 });
    }
    del(0, 0); b.box(0, 0.395, 0, 0.07, 0.03, 0.06, HUD2);                                                                          // hals
    b.blob(0, 0.492, 0, 0.09, 0.094, 0.088, HUD, { low: HUD2, snow: 0 });                                                           // huvud
    b.box(-0.033, 0.494, 0.078, 0.021, 0.024, 0.012, '#2a1f18'); b.box(0.033, 0.494, 0.078, 0.021, 0.024, 0.012, '#2a1f18');      // ögon
    b.box(0, 0.468, 0.084, 0.024, 0.032, 0.018, HUD2);                                                                              // näsa
    if (!kvinna) b.blob(0, 0.51, -0.028, 0.092, 0.085, 0.072, har, { snow: 0 });                                                    // hår
    if (!kvinna && typ !== 'dansk') b.blob(0, 0.442, 0.05, typ === 'rysk' ? 0.075 : 0.062, typ === 'rysk' ? 0.07 : 0.046, 0.046, har, { snow: 0 });      // skägg
    // huvudbonad
    if (typ === 'bonde') { del(0, 6); b.blob(0, 0.568, -0.004, 0.095, 0.05, 0.092, '#ffffff', { low: '#cccccc', snow: 0 }); b.push().move(0, 0.59, -0.02).rotX(-0.55); b.cone(0, 0, 0, 0.062, 0.13, 6, '#ffffff', { low: '#d0d0d0', snowLow: 0, snowTip: 0 }); b.pop(); }
    else if (typ === 'bage') { del(0, 6); b.blob(0, 0.518, -0.022, 0.102, 0.098, 0.096, '#ffffff', { low: '#c8c8c8', snow: 0 }); b.box(0, 0.378, 0, 0.235, 0.046, 0.155, '#f0f0f0', { low: '#cfcfcf' }); }
    else if (typ === 'bergsman') { del(0, 0); b.blob(0, 0.562, 0, 0.094, 0.046, 0.092, '#4a3a2c', { snow: 0 }); b.box(0, 0.47, -0.085, 0.13, 0.09, 0.02, '#4a3a2c'); }
    else if (knekt) { del(0, 5); b.cyl(0, 0.556, 0, 0.155, 0.155, 0.018, 9, '#ffffff', { cap: '#f0f0f0', capSnow: 0 }); b.blob(0, 0.59, 0, 0.088, 0.046, 0.088, '#ffffff', { snow: 0 }); del(0, 0); b.push().move(0.075, 0.6, -0.03).rotZ(-0.6); b.box(0, 0, 0, 0.026, 0.15, 0.052, '#f4f1e8'); b.pop(); }
    else if (typ === 'dansk') { del(0, 0); b.cyl(0, 0.548, 0, 0.13, 0.13, 0.016, 9, STAL, { cap: STAL, capSnow: 0 }); b.blob(0, 0.572, 0, 0.092, 0.058, 0.092, STAL, { low: STAL2, snow: 0 }); }
    else if (typ === 'borgare') { del(0, 6); b.blob(0.012, 0.568, 0, 0.108, 0.036, 0.102, '#ffffff', { snow: 0 }); del(0, 0); b.box(0, 0.383, 0, 0.222, 0.032, 0.146, '#5a4030'); }
    else if (kvinna) { del(0, 6); b.blob(0, 0.518, -0.018, 0.1, 0.1, 0.096, '#ffffff', { low: '#d8d8d8', snow: 0 }); }
    else if (typ === 'rysk') { del(0, 0); b.cyl(0, 0.54, 0, 0.1, 0.09, 0.1, 8, '#4a3526', { low: '#352518', cap: '#5a4030', capSnow: 0 }); }
    // vapen och redskap
    if (typ === 'bonde') { del(4, 0); b.box(0.14, 0.12, 0.055, 0.022, 0.4, 0.022, '#7b6650'); b.box(0.14, 0.43, 0.092, 0.02, 0.09, 0.08, STAL, { low: STAL2 }); }                                // yxa
    else if (typ === 'bage') { del(0, 0); b.push().move(-0.02, 0.19, -0.088).rotZ(0.4); b.box(0, 0, 0, 0.02, 0.44, 0.02, '#6b5743'); b.pop(); b.box(0.07, 0.24, -0.085, 0.05, 0.2, 0.05, '#5a4030'); b.box(0.07, 0.44, -0.085, 0.04, 0.03, 0.04, '#e6dcc8'); }      // båge och koger
    else if (typ === 'bergsman') { del(4, 0); b.box(0.14, 0.12, 0.055, 0.022, 0.38, 0.022, '#7b6650'); b.box(0.14, 0.48, 0.055, 0.19, 0.026, 0.026, STAL2); }                              // hacka
    else if (knekt || typ === 'dansk' || typ === 'rysk') { del(0, 0); b.push().move(-0.118, 0.215, -0.01).rotX(0.55); b.box(0, -0.24, 0, 0.02, 0.26, 0.032, STAL, { low: STAL2 }); b.box(0, 0.01, 0, 0.07, 0.016, 0.03, '#d9b030'); b.pop(); }      // svärd vid höften
    return b.geometry();
  }
  let matFolk = null;
  function folkMaterial() {
    if (matFolk) return matFolk;
    matFolk = new THREE.MeshLambertMaterial({ vertexColors: true });
    matFolk.onBeforeCompile = sh => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aFx; attribute float aPart; attribute vec4 aAnim; attribute vec3 aCol2;')
        .replace('#include <color_vertex>', `vColor = color.xyz;
          #ifdef USE_INSTANCING_COLOR
            if (aFx.y > 4.5 && aFx.y < 5.5) vColor *= instanceColor; else if (aFx.y > 5.5 && aFx.y < 6.5) vColor *= aCol2; else if (aFx.y > 6.5) vColor *= instanceColor * 0.6;
          #endif`)
        .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
          // ben och armar svänger kring höft och axel. aAnim: steg, hur mycket han går, hur mycket han slåss, läge (0 går, 1 skidor, 2 bär pik)
          float pAng = 0.0; vec3 pPiv = vec3(0.0, 0.215, 0.0);
          { float sw = sin(aAnim.x) * aAnim.y, ski = step(0.5, aAnim.w) * step(aAnim.w, 1.5), still = step(1.5, aAnim.w);
            if (aPart > 0.5 && aPart < 1.5) pAng = sw * mix(0.8, 0.25, ski);
            else if (aPart > 1.5 && aPart < 2.5) pAng = -sw * mix(0.8, 0.25, ski);
            else if (aPart > 2.5 && aPart < 3.5) { pAng = mix(-sw * 0.7, (-0.45 + sw * 0.8) * step(0.01, aAnim.y), ski) * (1.0 - still * 0.8); pPiv.y = 0.385; }
            else if (aPart > 3.5) { pAng = mix(sw * 0.7, (-0.45 - sw * 0.8) * step(0.01, aAnim.y), ski) * (1.0 - still) - aAnim.z * (1.25 + 0.95 * sin(aAnim.x * 1.7)); pPiv.y = 0.385; } }
          float pC = cos(pAng), pS = sin(pAng);
          objectNormal = vec3(objectNormal.x, objectNormal.y * pC - objectNormal.z * pS, objectNormal.y * pS + objectNormal.z * pC);`)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n{ vec3 pq = transformed - pPiv; transformed = pPiv + vec3(pq.x, pq.y * pC - pq.z * pS, pq.y * pS + pq.z * pC); }');
    };
    return matFolk;
  }

  // ---- folk: alla gubbar av samma sort ritas i ett svep ------------------------------------------
  const MAX = { bonde: 320, bage: 260, knekt: 220, dansk: 140, borgare: 90, kvinna: 90, bergsman: 70, rysk: 70 }, units = [], mesh = {};
  let pike, ski, sistT = 0;
  const Folk = V.Folk = {
    units, FARG,
    init(scene) {
      for (const typ in MAX) {
        const g = figur(typ), m = mesh[typ] = new THREE.InstancedMesh(g, folkMaterial(), MAX[typ]);
        g.setAttribute('aAnim', new THREE.InstancedBufferAttribute(new Float32Array(MAX[typ] * 4), 4)); g.setAttribute('aCol2', new THREE.InstancedBufferAttribute(new Float32Array(MAX[typ] * 3).fill(1), 3));
        m.castShadow = true; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.setColorAt(0, new THREE.Color(1, 1, 1)); m.count = 0; scene.add(m);
      }
      const pb = new MB(); pb.snow = 0; pb.box(0.165, 0, 0.03, 0.02, 1.12, 0.02, '#7b6650'); pb.cone(0.165, 1.12, 0.03, 0.03, 0.11, 4, STAL, { snowLow: 0, snowTip: 0 });
      pike = new THREE.InstancedMesh(pb.geometry(), V.Bygge.material(true), 420); pike.frustumCulled = false; pike.castShadow = true; pike.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const sb = new MB(); sb.snow = 0; for (const s of [-1, 1]) { sb.box(s * 0.055, 0, 0.05, 0.036, 0.014, 0.74, '#9a7648'); sb.box(s * 0.055, 0.012, 0.42, 0.036, 0.028, 0.06, '#9a7648'); sb.box(s * 0.17, 0.0, 0.1, 0.014, 0.36, 0.014, '#6b5743'); }
      ski = new THREE.InstancedMesh(sb.geometry(), V.Bygge.material(true), 140); ski.frustumCulled = false; ski.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      scene.add(pike, ski);
    },
    // Ny gubbe. slag styr sort och kläder: bonde, knekt, dansk, borgare, by (bybor), bergsman, rysk.
    add(x, z, slag, opt) {
      opt = opt || {}; let typ = slag;
      if (slag === 'bonde') typ = opt.pike || Math.random() < 0.42 ? 'bage' : 'bonde';
      else if (slag === 'by') typ = Math.random() < 0.38 ? 'kvinna' : Math.random() < 0.5 ? 'bage' : 'bonde';
      else if (slag === 'borgare') typ = Math.random() < 0.42 ? 'kvinna' : 'borgare';
      const pal = FARG[typ === 'bage' ? 'bonde' : typ] || FARG.bonde, f = pal[Math.floor(Math.random() * pal.length)];
      const u = Object.assign({ x, z, ang: Math.random() * 6.28, sc: 0.94 + Math.random() * 0.14, col: f[0], col2: f[1], typ, pike: false, skidar: false, vis: true, gar: false, strid: false, fas: Math.random() * 6.28, ph: Math.random() * 6.28, amp: 0, akt: 0, lean: 0, fall: 0, y: 0, slag }, opt);
      units.push(u); return u;
    },
    remove(u) { const i = units.indexOf(u); if (i >= 0) units.splice(i, 1); },
    update(t) {
      const dt = Math.max(0, Math.min(0.1, t - sistT)); sistT = t; const n = {}; let np = 0, ns = 0;
      for (const typ in mesh) n[typ] = 0;
      for (const u of units) {
        const m = mesh[u.typ]; if (!u.vis || !m || n[u.typ] >= MAX[u.typ]) continue;
        const ror = u.gar || u.strid; if (ror) u.ph += dt * (u.skidar ? 7 : u.strid ? 13 : 10.5);
        u.amp += ((u.gar ? 1 : 0) - u.amp) * Math.min(1, dt * 8); u.akt += ((u.strid ? 1 : 0) - u.akt) * Math.min(1, dt * 6);
        const gy = Geo.groundAt(u.x, u.z) + u.y, bob = Math.abs(Math.sin(u.ph)) * 0.022 * u.amp * (u.skidar ? 0.3 : 1), sc = u.sc * SKALA * (1 - u.fall * 0.2), i = n[u.typ]++;
        e3.set(u.lean + u.fall * 1.5 + (u.skidar ? 0.16 * u.amp : 0), u.ang, 0, 'YXZ'); q4.setFromEuler(e3);
        p3.set(u.x, gy + bob + u.fall * 0.06, u.z); s3.set(sc, sc, sc); m4.compose(p3, q4, s3);
        m.setMatrixAt(i, m4); m.setColorAt(i, V.col(u.col)); const c2 = V.col(u.col2), a2 = m.geometry.attributes.aCol2, an = m.geometry.attributes.aAnim;
        a2.setXYZ(i, c2.r, c2.g, c2.b); an.setXYZW(i, u.ph, u.amp, u.akt, u.skidar ? 1 : u.pike && !u.strid ? 2 : 0);
        if (u.pike && np < 420 && u.fall < 0.5) pike.setMatrixAt(np++, m4);
        if (u.skidar && ns < 140) { e3.set(0, u.ang, 0); q4.setFromEuler(e3); p3.y = gy + 0.012; m4.compose(p3, q4, s3); ski.setMatrixAt(ns++, m4); }
      }
      for (const typ in mesh) { const m = mesh[typ]; m.count = n[typ]; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; m.geometry.attributes.aCol2.needsUpdate = true; m.geometry.attributes.aAnim.needsUpdate = true; }
      pike.count = np; ski.count = ns; pike.instanceMatrix.needsUpdate = true; ski.instanceMatrix.needsUpdate = true;
    }
  };

  // ---- hjälten: Gustav Eriksson eller Sten Sture, på skidor när det ligger snö och annars till häst ----
  // Kläderna följer titeln: Gustav börjar i grå vadmal och röd mössa och slutar i kungens mantel och krona.
  const DRAKT = {
    gustav: [{ rock: '#7b8690', rock2: '#59636d', hatt: '#b0352c', mantel: null }, { rock: '#2f4a7a', rock2: '#22375c', hatt: '#1e1c22', mantel: '#5a4030', kedja: 1, fjader: 1 }, { rock: '#8a1f24', rock2: '#641519', hatt: '#1e1c22', mantel: '#f2eee2', kedja: 1, krona: 1 }],
    bud: [{ rock: '#7a6a52', rock2: '#5c4f3d', hatt: '#8a3a2a', mantel: null }],
    sten: [{ rock: '#2f4f8a', rock2: '#223c6c', hatt: '#d9b030', mantel: null, fjader: 1 }, { rock: '#2f4f8a', rock2: '#223c6c', hatt: '#d9b030', mantel: '#d9b030', kedja: 1, fjader: 1 }]
  };
  function del(fn) { const b = new MB(); b.snow = 0; fn(b); const m = new THREE.Mesh(b.geometry(), V.Bygge.material(true)); m.castShadow = true; return m; }
  function hjalteModell(sort, rang) {
    const d = DRAKT[sort][Math.min(rang, DRAKT[sort].length - 1)], g = new THREE.Group(), skagg = sort === 'sten' ? '#6a4a2a' : '#b07a3a';
    const kropp = new THREE.Group(); g.add(kropp);
    const bal = del(b => {
      b.box(0, -0.08, 0, 0.27, 0.1, 0.18, d.rock, { low: d.rock2, noTop: true });                             // rockskört
      b.box(0, 0, 0, 0.245, 0.09, 0.165, d.rock, { low: d.rock2 }); b.box(0, 0.075, 0, 0.29, 0.17, 0.18, d.rock, { low: d.rock2 });
      b.box(0, 0.012, 0, 0.26, 0.036, 0.175, d.kedja ? '#d9b030' : '#3a2a1e');                               // bälte
      if (d.kedja) for (let k = -2; k <= 2; k++) b.box(k * 0.045, 0.17 - Math.abs(k) * 0.022, 0.092, 0.03, 0.03, 0.012, '#e8c040');      // guldkedja över bröstet
      if (d.mantel) { b.push().move(0, 0.245, -0.1).rotX(0.16); b.box(0, -0.4, 0, 0.34, 0.4, 0.03, d.mantel, { low: d.mantel }); b.pop(); b.box(0, 0.225, 0, 0.33, 0.045, 0.21, d.mantel === '#f2eee2' ? '#f2eee2' : '#6a4a34'); }      // mantel och krage
      b.push().move(-0.16, 0.02, -0.01).rotX(0.5); b.box(0, -0.3, 0, 0.024, 0.32, 0.04, STAL, { low: STAL2 }); b.box(0, 0.012, 0, 0.09, 0.02, 0.04, '#d9b030'); b.pop();      // svärd
    });
    const huvud = del(b => {
      b.box(0, -0.04, 0, 0.09, 0.05, 0.08, HUD2);
      b.blob(0, 0.09, 0, 0.118, 0.122, 0.114, HUD, { low: HUD2, snow: 0 });
      b.box(-0.044, 0.095, 0.102, 0.027, 0.03, 0.014, '#2a1f18'); b.box(0.044, 0.095, 0.102, 0.027, 0.03, 0.014, '#2a1f18'); b.box(0, 0.06, 0.108, 0.03, 0.045, 0.024, HUD2);
      b.blob(0, 0.11, -0.036, 0.12, 0.11, 0.094, skagg, { snow: 0 }); b.blob(0, 0.022, 0.066, 0.086, 0.062, 0.06, skagg, { snow: 0 });                          // hår och kort skägg
      b.cyl(0, 0.175, 0, 0.158, 0.158, 0.024, 10, d.hatt, { cap: d.hatt, capSnow: 0 }); b.blob(0, 0.215, 0, 0.115, 0.058, 0.115, d.hatt, { snow: 0 });           // mössa eller barett
      if (d.fjader) { b.push().move(0.09, 0.23, -0.04).rotZ(-0.7); b.box(0, 0, 0, 0.03, 0.2, 0.06, '#f4f1e8'); b.pop(); }
      if (d.krona) { b.cyl(0, 0.2, 0, 0.122, 0.13, 0.05, 10, '#e8c040', { low: '#b08a1c' }); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; b.cone(Math.cos(a) * 0.118, 0.25, Math.sin(a) * 0.118, 0.026, 0.07, 4, '#e8c040', { snowLow: 0, snowTip: 0 }); } }
    });
    const arm = s => del(b => { b.box(s * 0.035, -0.22, 0, 0.085, 0.24, 0.1, d.rock, { low: d.rock2 }); b.box(s * 0.035, -0.285, 0.008, 0.074, 0.07, 0.084, HUD, { low: HUD2 }); });
    const stav = () => del(b => { b.box(0, -0.62, 0.02, 0.02, 0.62, 0.02, '#6b5743'); b.cyl(0, -0.58, 0.02, 0.05, 0.05, 0.012, 6, '#3a2a1e', { cap: '#3a2a1e', capSnow: 0 }); });
    const ben = s => del(b => { b.box(0, -0.25, 0, 0.1, 0.27, 0.112, '#4a3b2d', { low: '#3a2c20' }); b.box(0, -0.33, 0.02, 0.112, 0.085, 0.16, '#2a2018'); });
    const skida = () => del(b => { b.box(0, 0, 0.1, 0.055, 0.018, 1.15, '#9a7648', { low: '#7a5a34' }); b.push().move(0, 0.016, 0.66).rotX(-0.5); b.box(0, 0, 0, 0.055, 0.018, 0.1, '#9a7648'); b.pop(); });
    bal.position.y = 0.42; huvud.position.y = 0.72; kropp.add(bal, huvud);
    const armV = arm(-1), armH = arm(1), stavV = stav(), stavH = stav(); armV.position.set(-0.16, 0.655, 0); armH.position.set(0.16, 0.655, 0); stavV.position.set(-0.035, -0.26, 0.02); stavH.position.set(0.035, -0.26, 0.02); armV.add(stavV); armH.add(stavH); kropp.add(armV, armH);
    const benV = ben(-1), benH = ben(1); benV.position.set(-0.075, 0.42, 0); benH.position.set(0.075, 0.42, 0); kropp.add(benV, benH);
    const skV = skida(), skH = skida(); skV.position.set(-0.075, 0.012, 0); skH.position.set(0.075, 0.012, 0); g.add(skV, skH);
    // hästen
    const hast = new THREE.Group(), pals = '#6a4a32', pals2 = '#4f3624', man = '#2e2118';
    const hk = del(b => {
      b.box(0, 0.42, 0, 0.3, 0.3, 0.78, pals, { low: pals2 }); b.box(0, 0.5, -0.36, 0.26, 0.2, 0.1, pals, { low: pals2 });
      b.push().move(0, 0.66, 0.34).rotX(-0.75); b.box(0, 0, 0, 0.17, 0.36, 0.2, pals, { low: pals2 }); b.box(0, 0.02, -0.105, 0.05, 0.34, 0.05, man); b.pop();          // hals och man
      b.push().move(0, 0.94, 0.56).rotX(0.35); b.box(0, -0.06, 0, 0.15, 0.16, 0.3, pals, { low: pals2 }); b.box(-0.055, 0.09, -0.1, 0.035, 0.07, 0.04, pals2); b.box(0.055, 0.09, -0.1, 0.035, 0.07, 0.04, pals2); b.box(-0.076, 0.03, 0.02, 0.012, 0.03, 0.03, '#1a1410'); b.box(0.076, 0.03, 0.02, 0.012, 0.03, 0.03, '#1a1410'); b.pop();      // huvud, öron, ögon
      b.box(0, 0.715, -0.02, 0.33, 0.035, 0.36, sort === 'sten' ? '#2f4f8a' : sort === 'bud' ? '#5a4634' : d.krona ? '#8a1f24' : '#7a2a22', { low: sort === 'bud' ? '#3a2c20' : '#d9b030' }); b.box(0, 0.74, -0.02, 0.2, 0.05, 0.26, '#4a3526');      // schabrak och sadel
    });
    const hben = () => del(b => { b.box(0, -0.4, 0, 0.085, 0.42, 0.095, pals, { low: pals2 }); b.box(0, -0.44, 0.005, 0.095, 0.06, 0.105, '#2a2018'); });
    const svans = del(b => { b.box(0, -0.3, -0.03, 0.06, 0.32, 0.06, man); });
    const hb = [hben(), hben(), hben(), hben()]; hb[0].position.set(-0.1, 0.44, 0.3); hb[1].position.set(0.1, 0.44, 0.3); hb[2].position.set(-0.1, 0.44, -0.3); hb[3].position.set(0.1, 0.44, -0.3);
    svans.position.set(0, 0.68, -0.4); svans.rotation.x = 0.35; hast.add(hk, svans, ...hb); g.add(hast);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.54, 32), new THREE.MeshBasicMaterial({ color: 0xf2b830, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.035; ring.renderOrder = 3; ring.layers.set(1); g.add(ring);
    g.userData = { kropp, bal, huvud, armV, armH, stavV, stavH, benV, benH, skV, skH, hast, hb, svans, ring };
    return g;
  }
  const RANG = { Riddare: 0, 'Hövitsman': 0, 'Riksföreståndare': 1, Kung: 2, Kristina: 1 };
  V.Gustav = {
    init(scene, sort) { this.scene = scene; this.sort = sort || 'gustav'; this.kanSkida = this.sort === 'gustav'; this.rang = 0; this.g = hjalteModell(this.sort, 0); this.g.scale.setScalar(SKALA * (this.sort === 'bud' ? 1.0 : 1.18)); this.g.visible = false; scene.add(this.g); this.x = 0; this.z = 0; this.ang = 0; this.fart = 0; this.steg = 0; this.spar = []; this.initSpar(scene); },
    // Byt kläder när titeln ändras.
    klad(titel) { const r = RANG[titel] || 0; if (r === this.rang) return; this.rang = r; const gammal = this.g; this.g = hjalteModell(this.sort, r); this.g.scale.copy(gammal.scale); this.g.position.copy(gammal.position); this.g.rotation.copy(gammal.rotation); this.g.visible = gammal.visible; this.scene.remove(gammal); this.scene.add(this.g); },
    // Flytta och animera. fart 0..1 styr hur ivrigt han stakar eller galopperar.
    // tillFots = han står på sin plats, utan häst och skidor
    place(x, z, ang, fart, t, dt, tillSjoss, tillFots) {
      const d = this.g.userData, sno = !tillFots && this.kanSkida && (World.snowAt(x, z) > 0.45 || World.iceAt(x, z)), gy = Geo.groundAt(x, z);          // Sten Sture och hans bud rider året om
      this.x = x; this.z = z; let da = ang - this.ang; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; this.ang += da * Math.min(1, dt * 8);
      this.fart += (fart - this.fart) * Math.min(1, dt * 6); this.sno = sno; const f = this.fart; this.steg += dt * (sno ? 4 + f * 6 : 5 + f * 9); const w = this.steg, s = Math.sin(w), ror = Math.min(1, f * 3);
      this.g.visible = !tillSjoss; this.g.position.set(x, gy, z); this.g.rotation.y = this.ang;
      d.skV.visible = d.skH.visible = d.stavV.visible = d.stavH.visible = sno; d.hast.visible = !sno && !tillFots; d.ring.visible = !tillFots;
      if (tillFots && f > 0.04) {       // går till fots (scenerna om Gustav Eriksson före 1520)
        const gg = Math.min(1, f * 4); d.kropp.position.set(0, 0.02 + Math.abs(s) * 0.02 * gg, 0); d.kropp.rotation.set(0.08 * gg, 0, 0);
        d.benV.rotation.set(s * 0.55 * gg, 0, 0); d.benH.rotation.set(-s * 0.55 * gg, 0, 0); d.armV.rotation.set(-s * 0.45 * gg, 0, 0.1); d.armH.rotation.set(s * 0.45 * gg, 0, -0.1);
      } else if (tillFots) {       // står och ser ut över sitt folk
        d.kropp.position.set(0, 0.02 + Math.sin(t * 1.6) * 0.006, 0); d.kropp.rotation.set(0, Math.sin(t * 0.5) * 0.12, 0);
        d.benV.rotation.set(0, 0, 0); d.benH.rotation.set(0, 0, 0); d.armV.rotation.set(0.05, 0, 0.1); d.armH.rotation.set(-0.25 + Math.sin(t * 1.6) * 0.03, 0, -0.1);
      } else if (sno) {            // diagonalåkning: ben och motsatt arm fram, stavarna i snön
        d.kropp.position.set(0, 0.02 + Math.abs(s) * 0.015 * ror, 0); d.kropp.rotation.set(0.1 + 0.22 * f, 0, 0);
        d.benV.rotation.set(s * 0.42 * ror, 0, 0); d.benH.rotation.set(-s * 0.42 * ror, 0, 0); d.skV.position.z = -s * 0.16 * ror; d.skH.position.z = s * 0.16 * ror;
        d.armV.rotation.set(-0.35 - s * 0.75 * (0.25 + ror * 0.75), 0, 0.12); d.armH.rotation.set(-0.35 + s * 0.75 * (0.25 + ror * 0.75), 0, -0.12);
      } else {             // till häst: galopp med fram- och bakben i otakt
        const gal = Math.abs(Math.sin(w * 0.5)) * 0.07 * (0.15 + ror);
        d.hast.position.y = gal; d.hast.rotation.x = Math.sin(w) * 0.06 * ror;
        d.hb[0].rotation.x = s * 0.75 * ror; d.hb[1].rotation.x = Math.sin(w + 0.9) * 0.75 * ror; d.hb[2].rotation.x = Math.sin(w + 3.1) * 0.7 * ror; d.hb[3].rotation.x = Math.sin(w + 4.0) * 0.7 * ror; d.svans.rotation.x = 0.35 + 0.3 * ror + Math.sin(w * 0.7) * 0.1;
        d.kropp.position.set(0, 0.4 + gal, -0.04); d.kropp.rotation.set(0.06 + 0.12 * f + Math.sin(w) * 0.03 * ror, 0, 0);
        d.benV.rotation.set(-0.5, 0, -0.5); d.benH.rotation.set(-0.5, 0, 0.5); d.armV.rotation.set(-1.0, 0, 0.25); d.armH.rotation.set(-1.0 + Math.sin(w) * 0.08 * ror, 0, -0.25);
      }
      d.ring.material.opacity = 0.7 + 0.2 * Math.sin(t * 3); d.ring.scale.setScalar(1 + 0.06 * Math.sin(t * 3));
      if (sno && !tillSjoss) this.addSpar(x, z, gy); this.drawSpar(t);
    },
    // Skidspåren ligger kvar en stund efter honom.
    initSpar(scene) {
      const N = 160; this.sparN = N; const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 4 * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 4 * 3).fill(1), 3));
      const idx = []; for (let k = 0; k < N - 1; k++) for (const o of [0, 2]) { const a = k * 4 + o, b = a + 1, c = a + 4, dd = a + 5; idx.push(a, c, b, b, c, dd); }
      g.setIndex(idx); this.sparMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      this.sparMesh.frustumCulled = false; this.sparMesh.renderOrder = 3; this.sparMesh.layers.set(1); scene.add(this.sparMesh);
    },
    addSpar(x, z, y) { const l = this.spar[this.spar.length - 1]; if (l && Math.hypot(l.x - x, l.z - z) < 0.22) return; this.spar.push({ x, z, y, ang: this.ang, t: U.uTime.value }); if (this.spar.length > this.sparN) this.spar.shift(); },
    drawSpar(t) {
      const pos = this.sparMesh.geometry.attributes.position, col = this.sparMesh.geometry.attributes.color, n = this.spar.length;
      for (let k = 0; k < this.sparN; k++) {
        const s = this.spar[Math.min(k, n - 1)] || { x: 0, z: 0, y: -5, ang: 0, t: -99 }, cx = Math.cos(s.ang), sz = -Math.sin(s.ang), age = Math.min(1, (t - s.t) / 45), c = 0.74 + 0.26 * age;
        [-0.15, -0.09, 0.09, 0.15].forEach((o, j) => { pos.setXYZ(k * 4 + j, s.x + cx * o, s.y + 0.025, s.z + sz * o); col.setXYZ(k * 4 + j, k >= n ? 1 : c, k >= n ? 1 : c + 0.02, k >= n ? 1 : Math.min(1, c + 0.06)); });
      }
      pos.needsUpdate = true; col.needsUpdate = true; this.sparMesh.geometry.setDrawRange(0, Math.max(0, n - 1) * 12);
    }
  };
  // Budet: den som far runt med bud och brev åt hjälten. Samma ledade figur i enklare kläder.
  V.Bud = Object.create(V.Gustav);
})();
