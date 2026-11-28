// Gatorna på huvudkartan: den som går in i eller ut ur en ort följer gatorna runt husen i stället för att gå rakt igenom dem
// (Johannes 2026-11-28: "Det springer fortfarande igenom alla husen när de går mellan orterna").
// Vägarna mellan orterna (Rike.path) räknas som förut. Inne i varje ort som vägen börjar, slutar eller går igenom byts biten mot
// en väg längs gatorna. Var husen står vet vi genom att läsa det som faktiskt är ritat där (spelets hus, kända byggnader, orter.js,
// murar): varje triangel som står över marken spärrar sin ruta. Det håller sig rätt hur de andra delarna än ritar sina hus.
(function () {
  'use strict';
  const V = window.VASA, R = V.Rike, Geo = V.Geo, Scene = V.Scene, F = V.Filmstad; if (!R || !F || !F.sok) return;
  const C = F.sok.C, HALV = 9, RAD = 6.5;          // rutnätets halva sida och ortens radie (världsenheter)
  const cache = {};
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

  // det som rör sig ska inte räknas som hus
  function rorlig(o) { for (let p = o; p; p = p.parent) { if (p.userData && p.userData.ring) return true; if (V.Gustav && p === V.Gustav.g) return true; if (V.Bud && p === V.Bud.g) return true; if (p.isInstancedMesh || p.isPoints || p.isSprite) return true; } return false; }
  function maskor(x, z) {
    const ut = []; Scene.scene.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || !o.visible || !o.geometry || !o.geometry.attributes.position) return;
      const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); const bs = g.boundingSphere; v1.copy(bs.center).applyMatrix4(o.matrixWorld);
      const r = bs.radius * o.matrixWorld.getMaxScaleOnAxis(); if (r > 40 || Math.hypot(v1.x - x, v1.z - z) > HALV + r) return;          // marken och vattnet är stora
      let syns = true; for (let p = o; p; p = p.parent) if (p.visible === false) { syns = false; break; } if (!syns || rorlig(o)) return; ut.push(o);
    });
    return ut;
  }
  function nyckel(ms) { let k = ms.length; for (const m of ms) k = (k * 31 + m.geometry.id * 7 + Math.round(m.position.x * 10)) >>> 0; return k; }
  // ritar husen på rutnätet: trianglar ovanför marken, och väggar som syns från sidan som linjer
  function rasta(S, ms) {
    const { n, x0, z0, bl } = S.g, upp = 0.1;
    const satt = (i, j) => { if (i >= 0 && j >= 0 && i < n && j < n) bl[j * n + i] = 1; };
    const linje = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), st = Math.max(1, Math.ceil(L / (C * 0.5))); for (let s = 0; s <= st; s++) { const f = s / st; satt(Math.floor((ax + (bx - ax) * f - x0) / C), Math.floor((az + (bz - az) * f - z0) / C)); } };
    for (const m of ms) {
      m.updateMatrixWorld(); const pos = m.geometry.attributes.position, idx = m.geometry.index, mw = m.matrixWorld, nt = idx ? idx.count / 3 : pos.count / 3;
      for (let t = 0; t < nt; t++) {
        const a = idx ? idx.getX(3 * t) : 3 * t, b = idx ? idx.getX(3 * t + 1) : 3 * t + 1, c = idx ? idx.getX(3 * t + 2) : 3 * t + 2;
        v1.fromBufferAttribute(pos, a).applyMatrix4(mw); v2.fromBufferAttribute(pos, b).applyMatrix4(mw); v3.fromBufferAttribute(pos, c).applyMatrix4(mw);
        const cx = (v1.x + v2.x + v3.x) / 3, cz = (v1.z + v2.z + v3.z) / 3; if (Math.abs(cx - S.o.x) > HALV + 1 || Math.abs(cz - S.o.z) > HALV + 1) continue;
        if (Math.max(v1.y, v2.y, v3.y) < Geo.groundAt(cx, cz) + upp) continue;          // platt på marken (gårdar, mattor)
        const ar = (v2.x - v1.x) * (v3.z - v1.z) - (v3.x - v1.x) * (v2.z - v1.z);
        if (Math.abs(ar) < 1e-4) { linje(v1.x, v1.z, v2.x, v2.z); linje(v2.x, v2.z, v3.x, v3.z); continue; }          // en vägg rakt uppifrån är bara en linje
        const i0 = Math.max(0, Math.floor((Math.min(v1.x, v2.x, v3.x) - x0) / C)), i1 = Math.min(n - 1, Math.floor((Math.max(v1.x, v2.x, v3.x) - x0) / C)), j0 = Math.max(0, Math.floor((Math.min(v1.z, v2.z, v3.z) - z0) / C)), j1 = Math.min(n - 1, Math.floor((Math.max(v1.z, v2.z, v3.z) - z0) / C));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const px = x0 + (i + 0.5) * C, pz = z0 + (j + 0.5) * C, w1 = ((v2.x - px) * (v3.z - pz) - (v3.x - px) * (v2.z - pz)) / ar, w2 = ((v3.x - px) * (v1.z - pz) - (v1.x - px) * (v3.z - pz)) / ar;
          if (w1 >= -0.05 && w2 >= -0.05 && w1 + w2 <= 1.05) bl[j * n + i] = 1;
        }
      }
    }
  }
  // en ort: rutnätet byggs om bara när det som står där har ändrats
  function ort(id) {
    const p = R.P[id]; if (!p) return null; const c = cache[id], nu = performance.now(); if (c && nu - c.t < 1500) return c.S;          // samma bildruta eller strax efter: samma nät
    const ms = maskor(p.x, p.z); if (!ms.length) return null;
    const k = nyckel(ms); if (c && c.k === k) { c.t = nu; return c.S; }
    const n = Math.ceil(2 * HALV / C), x0 = p.x - HALV, z0 = p.z - HALV, bl = new Uint8Array(n * n);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * C, z = z0 + (j + 0.5) * C; if (Geo.sdAt(x, z) < 0.25) bl[j * n + i] = 1; }
    const S = { o: { x: p.x, z: p.z }, R: RAD, g: { n, x0, z0, bl } };
    rasta(S, ms);
    // lite luft runt husen: en ruta till
    const b2 = bl.slice(); for (let j = 1; j < n - 1; j++) for (let i = 1; i < n - 1; i++) { const q = j * n + i; if (!bl[q] && (bl[q - 1] || bl[q + 1] || bl[q - n] || bl[q + n])) b2[q] = 1; } S.g.bl = b2;
    F.sok.avstand(S); cache[id] = { k, S, t: nu }; return S;
  }
  // byt biten av vägen som ligger inne i orten mot en väg längs gatorna
  function genom(pts, id) {
    const p = R.P[id], S = p && ort(id); if (!S) return pts;
    const inne = q => Math.hypot(q[0] - p.x, q[1] - p.z) < RAD;
    let i0 = -1, i1 = -1; for (let i = 0; i < pts.length; i++) if (inne(pts[i])) { if (i0 < 0) i0 = i; i1 = i; }
    if (i0 < 0) return pts;
    const a = pts[Math.max(0, i0 - (i0 > 0 ? 1 : 0))], b = pts[Math.min(pts.length - 1, i1 + (i1 < pts.length - 1 ? 1 : 0))];
    const ia = pts.indexOf(a), ib = pts.lastIndexOf(b); if (ib <= ia) return pts;
    const v = F.sok.vag(S, a, b); if (!v || v.length < 2) return pts;
    // A* gav upp (raka linjen tillbaka): behåll den gamla vägen
    if (v.length === 2 && Math.hypot(v[0][0] - a[0], v[0][1] - a[1]) < 1e-6 && Math.hypot(v[1][0] - b[0], v[1][1] - b[1]) < 1e-6) return pts;
    return pts.slice(0, ia).concat(v, pts.slice(ib + 1));
  }
  function ortenVid(q) { let best = null, bd = 1.6; for (const id in R.P) { const p = R.P[id], d = Math.hypot(p.x - q[0], p.z - q[1]); if (d < bd) { bd = d; best = id; } } return best; }
  const path0 = R.path;
  R.path = function (a, b) {
    let pts = path0.apply(R, arguments); if (!pts || pts.length < 2 || a === b) return pts;
    try {
      const orter = [a]; for (let i = 1; i < pts.length - 1; i += 3) { const id = ortenVid(pts[i]); if (id && orter.indexOf(id) < 0 && id !== b) orter.push(id); } orter.push(b);
      for (const id of orter) pts = genom(pts, id);
    } catch (e) { console.warn('gator', e); }
    return pts;
  };
  V.Gator = { ort, genom, cache };
})();
