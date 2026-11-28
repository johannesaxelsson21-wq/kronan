// Gångbarheten: ingen figur står i eller går genom ett hus, en mur eller ett torn, varken i spelet, i slagen eller i filmerna
// (Johannes 2026-11-28, många gånger: "de ska inte gå igenom byggnader, inte i filmer eller i spelet").
// Fotavtrycken läses ur det som faktiskt är ritat, så de stämmer hur husen än byggs (städerna, de kända byggnaderna, orter.js, filmstäderna,
// tälten i en scen): varje triangel som står i en gubbes höjd spärrar sin ruta, och ett hus med väggar runt om och tak över är fyllt.
// En borggård utan tak är fri, så den som är instängd i borgen står på gården och inte i tornet.
// Alla figurer ritas genom två ställen: Folk.update (alla gubbar) och Gustav.place (hjältarna och personerna på kartan). Där får figuren
// en plats utanför husen, och rör den sig går den runt husen (och runt sjöarna, om den går på land) i stället för rakt igenom.
// Den som går men inte kommer någonstans står stilla i stället för att trampa på stället.
// Den som står still bakom ett hus, där kameran inte ser den, kliver fram en bit dit den syns (aldrig genom en vägg).
// Träden kring figurerna kliver undan åt kameran till, så att ingen skyms av ett träd.
// V.Hinder.prov() listar varje figur som står i ett hus, skyms av ett hus eller av ett träd just nu. tools/hus-prov.js kör det genom alla scener och steg.
(function () {
  'use strict';
  const V = window.VASA; if (!V || !V.Geo || !V.Scene || !V.Folk || !V.Gustav) return;
  const Geo = V.Geo, Scene = V.Scene, World = V.World;
  const C = 0.1, TS = 8, PAD = 3, NP = Math.round((TS + 2 * PAD) / C), P0 = Math.round(PAD / C), NT = Math.round(TS / C);
  const B0 = 0.12, B1 = 0.95;          // gubbens kropp: från knäna till huvudet, över marken
  const MAXD = 40;                     // avståndsfältet räknas så här många rutor ut
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  const nu = () => performance.now() / 1000;
  const stat = { ms: 0, max: 0, n: 0, aStar: 0, rutor: 0 };          // hur mycket tid det här tar (V.Hinder.stat)

  // ---- det som står på kartan -------------------------------------------------------------------------------------
  // Varje synligt nät som inte är en figur, ett skepp, marken eller vattnet. Det som flyttar sig (en släde, en fana som bärs) räknas inte.
  const post = new Map();          // nät -> { sig, t0, box, rorlig }
  const hink = new Map();          // ruta (TS x TS) -> Set av poster
  let samlatT = -1;
  const ej = o => { const u = o.userData; return !!(u && (u.kropp || u.skepp || u.ring || u.hinderEj || u.figur)); };
  function synligaNat(o, ut) {
    if (!o.visible || ej(o)) return;
    if (o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh) {
      const m = o.material, g = o.geometry;
      if (g && g.attributes && g.attributes.position && !(m && m.transparent && m.depthWrite === false) && !(o.layers && o.layers.mask === 2)) ut.push(o);
    }
    const ch = o.children; for (let i = 0; i < ch.length; i++) synligaNat(ch[i], ut);
  }
  const hk = (i, j) => (i + 4096) * 8192 + (j + 4096);
  function signatur(o) {
    const e = o.matrixWorld.elements; let h = o.geometry.id * 2654435761 >>> 0;
    for (const k of [0, 2, 5, 8, 10, 12, 13, 14]) h = (h * 31 + Math.round(e[k] * 1000)) >>> 0;
    return (h ^ Math.imul(o.geometry.attributes.position.count + 1, 2246822519)) >>> 0;
  }
  function samla() {
    const t = nu(); if (t - samlatT < 0.25) return; samlatT = t;
    const sc = Scene.scene; if (!sc) return; sc.updateMatrixWorld();
    const nat = []; synligaNat(sc, nat); const sedda = new Set();
    for (const o of nat) {
      const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (!g.boundingBox) g.computeBoundingBox();
      const rad = g.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis(); if (rad > 40 || rad < 0.02) continue;          // marken och vattnet är stora
      sedda.add(o); const sig = signatur(o); let p = post.get(o);
      if (p && p.sig === sig) continue;
      const bb = g.boundingBox; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, y1 = -1e9;
      for (let k = 0; k < 8; k++) { v1.set(k & 1 ? bb.max.x : bb.min.x, k & 2 ? bb.max.y : bb.min.y, k & 4 ? bb.max.z : bb.min.z).applyMatrix4(o.matrixWorld); x0 = Math.min(x0, v1.x); x1 = Math.max(x1, v1.x); z0 = Math.min(z0, v1.z); z1 = Math.max(z1, v1.z); y1 = Math.max(y1, v1.y); }
      if (p) { ta(p); p.sig = sig; p.t0 = t; p.rorlig = (p.rorlig || 0) + 1; p.verts = null; } else p = { o, sig, t0: -1e9, rorlig: 0 };          // första gången: står still; flyttar det sig sedan väntar vi tills det stått still en stund
      p.box = [x0, z0, x1, z1]; p.y1 = y1; post.set(o, p); lagg(p);
    }
    for (const [o, p] of post) if (!sedda.has(o)) { ta(p); post.delete(o); }
    // rutor vars innehåll har ändrats byggs om (en i taget, när någon frågar)
    for (const [k, r] of rutor) { const s = rutSig(r.i, r.j); if (s !== r.sig) r.gammal = true; }
  }
  function tackta(p, f) { const b = p.box, i0 = Math.floor((b[0] - PAD) / TS), i1 = Math.floor((b[2] + PAD) / TS), j0 = Math.floor((b[1] - PAD) / TS), j1 = Math.floor((b[3] + PAD) / TS); for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) f(hk(i, j)); }
  function lagg(p) { tackta(p, k => { let s = hink.get(k); if (!s) hink.set(k, s = new Set()); s.add(p); }); }
  function ta(p) { tackta(p, k => { const s = hink.get(k); if (s) s.delete(p); }); }
  const stilla = (p, t) => t - p.t0 > 0.6;          // det som just har flyttat sig (eller växer fram) räknas när det har stått still en stund
  function rutSig(i, j) { const s = hink.get(hk(i, j)); if (!s) return 0; const t = nu(); let a = 0, b = 0, n = 0; for (const p of s) if (stilla(p, t)) { n++; a = (a + p.sig) >>> 0; b = (b ^ Math.imul(p.sig, 2654435761)) >>> 0; } return n * 1e10 + a + b * 3.1e-3; }

  // ---- rutnätet: var husen står ---------------------------------------------------------------------------------
  const rutor = new Map();          // nyckel -> { i, j, sig, d (avstånd till närmaste hus, i världsenheter), bl, t }
  let epok = 0, byggdaDenna = 0;
  function rasta(p, x0, z0, kr, tak, hm) {
    const o = p.o, g = o.geometry, pos = g.attributes.position, idx = g.index, nv = pos.count;
    if (!p.verts) { const w = new Float32Array(nv * 3), mw = o.matrixWorld; for (let k = 0; k < nv; k++) { v1.fromBufferAttribute(pos, k).applyMatrix4(mw); w[3 * k] = v1.x; w[3 * k + 1] = v1.y; w[3 * k + 2] = v1.z; } p.verts = w; }
    const w = p.verts, nt = idx ? idx.count / 3 : nv / 3, X1 = x0 + NP * C, Z1 = z0 + NP * C;
    let hi = 0;
    const satt = (L, x, z) => { const i = Math.floor((x - x0) / C), j = Math.floor((z - z0) / C); if (i >= 0 && j >= 0 && i < NP && j < NP) { const k = j * NP + i; L[k] = 1; if (hm[k] < hi) hm[k] = hi; } };
    const linje = (L, ax, az, bx, bz) => { const l = Math.hypot(bx - ax, bz - az), st = Math.max(1, Math.ceil(l / (C * 0.45))); for (let s = 0; s <= st; s++) { const f = s / st; satt(L, ax + (bx - ax) * f, az + (bz - az) * f); } };
    for (let t = 0; t < nt; t++) {
      const a = 3 * (idx ? idx.getX(3 * t) : 3 * t), b = 3 * (idx ? idx.getX(3 * t + 1) : 3 * t + 1), c = 3 * (idx ? idx.getX(3 * t + 2) : 3 * t + 2);
      const ax = w[a], ay = w[a + 1], az = w[a + 2], bx = w[b], by = w[b + 1], bz = w[b + 2], cx = w[c], cy = w[c + 1], cz = w[c + 2];
      const mx0 = Math.min(ax, bx, cx), mx1 = Math.max(ax, bx, cx), mz0 = Math.min(az, bz, cz), mz1 = Math.max(az, bz, cz);
      if (mx1 < x0 || mz1 < z0 || mx0 > X1 || mz0 > Z1) continue;
      const gy = Geo.groundAt((ax + bx + cx) / 3, (az + bz + cz) / 3), lo = Math.min(ay, by, cy) - gy; hi = Math.max(ay, by, cy) - gy;
      if (hi < B0) continue;          // platt på marken: gårdar, gator, mattor
      const iKropp = lo < B1;          // står i gubbens höjd
      if (!iKropp && lo < B0) continue;
      const L = iKropp ? kr : tak;
      const ar = (bx - ax) * (cz - az) - (cx - ax) * (bz - az), lang = Math.max(Math.hypot(bx - ax, bz - az), Math.hypot(cx - bx, cz - bz), Math.hypot(ax - cx, az - cz));
      linje(L, ax, az, bx, bz); linje(L, bx, bz, cx, cz); linje(L, cx, cz, ax, az);          // kanterna alltid, så att tunna väggar blir täta
      if (Math.abs(ar) / Math.max(lang, 1e-6) < C * 0.8) continue;          // en vägg rakt uppifrån är bara en linje
      const i0 = Math.max(0, Math.floor((mx0 - x0) / C)), i1 = Math.min(NP - 1, Math.floor((mx1 - x0) / C)), j0 = Math.max(0, Math.floor((mz0 - z0) / C)), j1 = Math.min(NP - 1, Math.floor((mz1 - z0) / C));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px = x0 + (i + 0.5) * C, pz = z0 + (j + 0.5) * C, w1 = ((bx - px) * (cz - pz) - (cx - px) * (bz - pz)) / ar, w2 = ((cx - px) * (az - pz) - (ax - px) * (cz - pz)) / ar;
        if (w1 >= -0.02 && w2 >= -0.02 && w1 + w2 <= 1.02) { const k = j * NP + i; L[k] = 1; if (hm[k] < hi) hm[k] = hi; }
      }
    }
  }
  function byggRuta(i, j) {
    const x0 = i * TS - PAD, z0 = j * TS - PAD, N = NP * NP, kr = new Uint8Array(N), tak = new Uint8Array(N), hm = new Float32Array(N), t = nu();
    const s = hink.get(hk(i, j)); if (s) for (const p of s) if (stilla(p, t)) rasta(p, x0, z0, kr, tak, hm);
    // inneslutet: det man inte når från kanten utan att gå genom en vägg. Inneslutet och med tak över = inne i ett hus.
    const nadd = new Uint8Array(N), q = new Int32Array(N); let h = 0, e = 0;
    const in_ = k => { if (!kr[k] && !nadd[k]) { nadd[k] = 1; q[e++] = k; } };
    for (let k = 0; k < NP; k++) { in_(k); in_((NP - 1) * NP + k); in_(k * NP); in_(k * NP + NP - 1); }
    while (h < e) { const k = q[h++], ci = k % NP, cj = (k / NP) | 0; if (ci > 0) in_(k - 1); if (ci < NP - 1) in_(k + 1); if (cj > 0) in_(k - NP); if (cj < NP - 1) in_(k + NP); }
    const bl = new Uint8Array(N); for (let k = 0; k < N; k++) bl[k] = kr[k] || (!nadd[k] && tak[k]) ? 1 : 0;
    // avståndet till närmaste hus (två svep, rutor; diagonalen sqrt 2)
    const d = new Float32Array(N); for (let k = 0; k < N; k++) d[k] = bl[k] ? 0 : MAXD;
    const D2 = Math.SQRT2;
    for (let jj = 0; jj < NP; jj++) for (let ii = 0; ii < NP; ii++) { const k = jj * NP + ii; let v = d[k]; if (v === 0) continue; if (ii > 0) v = Math.min(v, d[k - 1] + 1); if (jj > 0) { v = Math.min(v, d[k - NP] + 1); if (ii > 0) v = Math.min(v, d[k - NP - 1] + D2); if (ii < NP - 1) v = Math.min(v, d[k - NP + 1] + D2); } d[k] = v; }
    for (let jj = NP - 1; jj >= 0; jj--) for (let ii = NP - 1; ii >= 0; ii--) { const k = jj * NP + ii; let v = d[k]; if (v === 0) continue; if (ii < NP - 1) v = Math.min(v, d[k + 1] + 1); if (jj < NP - 1) { v = Math.min(v, d[k + NP] + 1); if (ii < NP - 1) v = Math.min(v, d[k + NP + 1] + D2); if (ii > 0) v = Math.min(v, d[k + NP - 1] + D2); } d[k] = v; }
    for (let k = 0; k < N; k++) d[k] *= C;
    epok++; stat.rutor++; return { i, j, x0, z0, d, bl, hm, sig: rutSig(i, j), t, gammal: false };
  }
  function ruta(x, z) {
    const i = Math.floor(x / TS), j = Math.floor(z / TS), k = hk(i, j); let r = rutor.get(k);
    if (!r || (r.gammal && byggdaDenna < 2)) { if (r) byggdaDenna++; r = byggRuta(i, j); rutor.set(k, r); if (rutor.size > 96) { let ak = null, at = 1e18; for (const [kk, rr] of rutor) if (rr.anv < at && kk !== k) { at = rr.anv; ak = kk; } if (ak !== null) rutor.delete(ak); } }
    r.anv = nu(); return r;
  }
  // avståndet från (x, z) till närmaste hus, i världsenheter (0 = i huset)
  function avst(x, z) { const r = ruta(x, z), i = Math.floor((x - r.x0) / C), j = Math.floor((z - r.z0) / C); return r.d[j * NP + i]; }
  // hur högt det som står i rutan når (0 = inget)
  function hojd(x, z) { const r = ruta(x, z), i = Math.floor((x - r.x0) / C), j = Math.floor((z - r.z0) / C); return r.hm[j * NP + i]; }
  // syns en figur som står i (x, z) från kameran, eller skyms den av ett hus? Strålen mot kameran får inte gå under något tak eller någon mur.
  function synlig(x, z) {
    const cam = Scene.camera; let hx = 0, hz = 1, lut = 0.75;
    if (cam) { const dx = cam.position.x - x, dz = cam.position.z - z, l = Math.hypot(dx, dz); if (l > 1e-3) { hx = dx / l; hz = dz / l; lut = Math.atan2(cam.position.y - Geo.groundAt(x, z), l); } }
    return sikt(x, z, hx, hz, lut);
  }
  // samma sak sett rakt söderifrån (där kameran alltid står) med vinkeln lut (grader): för en scen som ställer upp folk innan kameran är där
  function syns(x, z, lut) { const c = Scene.cam; return sikt(x, z, 0, 1, (lut || (c && c.lut) || 45) * Math.PI / 180); }
  function sikt(x, z, hx, hz, lut) {
    const tl = Math.tan(Math.max(0.2, lut));
    for (let s = 0.15; s < 5; s += 0.1) { const y = 0.55 + s * tl; if (y > 3.5) break; if (hojd(x + hx * s, z + hz * s) > y) return false; }
    return true;
  }
  const vatten = (x, z) => Geo.sdAt(x, z) < 0.05 && !(World.iceAt && World.iceAt(x, z));
  const fri = (x, z, r) => avst(x, z) >= (r || 0.15);
  const ledig = (x, z, r, land) => fri(x, z, r) && !(land && vatten(x, z));
  // närmaste ställe där en figur med radien r får stå (inte i ett hus; på land om land)
  function ut(x, z, r, land) {
    if (ledig(x, z, r, land)) return [x, z];
    let best = null, bd = 1e9;
    for (let k = 1; k <= 45; k++) {
      const rr = k * C; if (best && rr > bd + C) break;
      const n = Math.max(8, Math.ceil(rr * 2 * Math.PI / (C * 0.8)));
      for (let s = 0; s < n; s++) { const a = s / n * 6.2832, px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr; if (ledig(px, pz, r + C * 0.5, land)) { const dd = Math.hypot(px - x, pz - z); if (dd < bd) { bd = dd; best = [px, pz]; } } }
    }
    return best || [x, z];
  }
  // går det att gå rakt från a till b?
  function rak(ax, az, bx, bz, r, land) {
    const l = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(l / (C * 0.5)));
    for (let s = 1; s <= n; s++) { const f = s / n, x = ax + (bx - ax) * f, z = az + (bz - az) * f; if (!ledig(x, z, r, land)) return false; }
    return true;
  }
  // En väg från a till b runt husen (och runt vattnet om land). Svar: punkter i världskoordinater, eller null om det inte går.
  function vag(a, b, r, land, max) {
    r = r || 0.15; const ax = a[0], az = a[1]; let [bx, bz] = ut(b[0], b[1], r, land);
    if (rak(ax, az, bx, bz, r, land)) return [[ax, az], [bx, bz]];
    const L = Math.hypot(bx - ax, bz - az), M = Math.min(10, 2.5 + L * 0.35), G = L + 2 * M > 26 ? 0.2 : 0.1;
    const x0 = Math.min(ax, bx) - M, z0 = Math.min(az, bz) - M, nx = Math.min(400, Math.ceil((Math.max(ax, bx) + M - x0) / G)), nz = Math.min(400, Math.ceil((Math.max(az, bz) + M - z0) / G)), N = nx * nz;
    const okc = new Int8Array(N).fill(-1), nara = new Float32Array(N);          // rutorna räknas först när sökningen kommer dit
    const ok = k => { let v = okc[k]; if (v < 0) { const x = x0 + (k % nx + 0.5) * G, z = z0 + (((k / nx) | 0) + 0.5) * G, d = avst(x, z); nara[k] = d; v = okc[k] = d >= r && !(land && vatten(x, z)) ? 1 : 0; } return v === 1; };
    const cell = (x, z) => { const i = Math.floor((x - x0) / G), j = Math.floor((z - z0) / G); return i < 0 || j < 0 || i >= nx || j >= nz ? -1 : j * nx + i; };
    let s = cell(ax, az), e = cell(bx, bz); if (s < 0 || e < 0) return null;
    if (!ok(s)) { // den som står fast börjar i närmaste fria ruta
      let bs = -1, bd = 1e9; const si = s % nx, sj = (s / nx) | 0; for (let j = Math.max(0, sj - 8); j <= Math.min(nz - 1, sj + 8); j++) for (let i = Math.max(0, si - 8); i <= Math.min(nx - 1, si + 8); i++) { const k = j * nx + i; if (ok(k)) { const dd = (i - si) * (i - si) + (j - sj) * (j - sj); if (dd < bd) { bd = dd; bs = k; } } }
      if (bs < 0) return null; s = bs;
    }
    if (!ok(e)) return null;
    const gk = new Float32Array(N).fill(1e9), fr = new Int32Array(N).fill(-1), st = new Uint8Array(N), heap = [];
    const ei = e % nx, ej = (e / nx) | 0, hv = k => { const i = k % nx, j = (k / nx) | 0, dx = Math.abs(i - ei), dz = Math.abs(j - ej); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    const push = (k, f) => { heap.push([f, k]); let c = heap.length - 1; while (c > 0) { const pp = (c - 1) >> 1; if (heap[pp][0] <= heap[c][0]) break; const tmp = heap[pp]; heap[pp] = heap[c]; heap[c] = tmp; c = pp; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, rr = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (rr < heap.length && heap[rr][0] < heap[m][0]) m = rr; if (m === c) break; const tmp = heap[m]; heap[m] = heap[c]; heap[c] = tmp; c = m; } } return top; };
    gk[s] = 0; push(s, hv(s)); let n = 0; const MAX = max || 90000;
    const DIR = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    while (heap.length && n++ < MAX) {
      const [, k] = pop(); if (st[k]) continue; st[k] = 1; if (k === e) break;
      const i = k % nx, j = (k / nx) | 0;
      for (const [di, dj, c] of DIR) {
        const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue; const kk = jj * nx + ii; if (st[kk] || !ok(kk)) continue;
        if (di && dj && (!ok(j * nx + ii) || !ok(jj * nx + i))) continue;          // inte snett förbi ett hörn
        const g2 = gk[k] + c * (1 + 0.8 * Math.max(0, 0.45 - nara[kk]) / 0.45);          // mitt i gatan hellre än tätt intill husen
        if (g2 < gk[kk]) { gk[kk] = g2; fr[kk] = k; push(kk, g2 + hv(kk)); }
      }
    }
    if (fr[e] < 0 && e !== s) return null;
    const rutt = []; for (let k = e; k >= 0; k = fr[k]) { rutt.push([x0 + (k % nx + 0.5) * G, z0 + (((k / nx) | 0) + 0.5) * G]); if (k === s) break; }
    rutt.reverse(); rutt[0] = [ax, az]; rutt[rutt.length - 1] = [bx, bz];
    // dra åt snöret: hoppa över punkter man ser förbi
    const ut2 = [rutt[0]]; let i = 0;
    while (i < rutt.length - 1) { let j = rutt.length - 1; while (j > i + 1 && !rak(rutt[i][0], rutt[i][1], rutt[j][0], rutt[j][1], r * 0.95, land)) j--; ut2.push(rutt[j]); i = j; }
    return ut2;
  }
  // En väg som någon annan har räknat ut (punkter), lagad där den går genom ett hus: den biten byts mot en väg runt huset.
  function laga(pts, r, land) {
    if (!pts || pts.length < 2) return pts; r = r || 0.15; const ut3 = [pts[0]];
    for (let k = 1; k < pts.length; k++) {
      const a = ut3[ut3.length - 1], b = pts[k];
      if (rak(a[0], a[1], b[0], b[1], r, false)) { ut3.push(b); continue; }
      // hoppa fram till nästa punkt som är fri och gå dit runt husen
      let m = k; while (m < pts.length - 1 && !fri(pts[m][0], pts[m][1], r)) m++;
      const v = vag(a, pts[m], r, land); if (v) { for (let q = 1; q < v.length; q++) ut3.push(v[q]); k = m; } else ut3.push(b);
    }
    return ut3;
  }

  // ---- att synas: den som står still bakom ett hus kliver fram dit kameran ser den -----------------------------------
  // Bara ett litet kliv (högst 0,8), rakt dit utan att gå genom någon vägg och inte in i någon annan. Den som är instängd på en borggård
  // stannar på gården, på den del av den som syns.
  const upptagna = new Map();          // var figurerna ritades förra bildrutan (rutor om 0,5)
  const uk = (x, z) => (Math.floor(x * 2) + 8192) * 16384 + (Math.floor(z * 2) + 8192);
  function upptagen(x, z, jag) { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const l = upptagna.get(uk(x + a * 0.5, z + b * 0.5)); if (l) for (const q of l) if (q[2] !== jag && Math.hypot(q[0] - x, q[1] - z) < 0.2) return true; } return false; }
  function iBild(x, z) { const cam = Scene.camera; if (!cam) return false; v1.set(x, Geo.groundAt(x, z) + 0.5, z).project(cam); return Math.abs(v1.x) < 1.05 && Math.abs(v1.y) < 1.05 && v1.z < 1; }
  function fram(qx, qz, r, jag) {
    const cam = Scene.camera; if (!cam) return null; const a0 = Math.atan2(cam.position.z - qz, cam.position.x - qx);          // helst ett kliv mot kameran
    for (let rr = 0.15; rr <= 0.81; rr += 0.1) { const n = Math.max(8, Math.round(rr * 30));
      for (let s = 0; s < n; s++) { const a = a0 + (s % 2 ? -1 : 1) * Math.ceil(s / 2) / n * 6.2832, x = qx + Math.cos(a) * rr, z = qz + Math.sin(a) * rr;
        if (fri(x, z, r) && !vatten(x, z) && !upptagen(x, z, jag) && synlig(x, z) && rak(qx, qz, x, z, r * 0.9, false)) return [x, z]; } }
    return null;
  }

  // ---- figurerna: var de syns -------------------------------------------------------------------------------------
  // o är en gubbe (Folk) eller en hjälte (Gustav). (x, z) är där koden vill ha den. Svar: där den ritas.
  // Står den still i ett hus flyttas den ut till närmaste lediga ställe. Rör den sig och vägen rakt fram går genom ett hus går den runt.
  const HOPP = 1.6;          // längre än så på en bildruta: den har flyttats, inte gått
  let aStar = 0, aStarMs = 0;          // vägsökningar den här bildrutan (resten väntar till nästa)
  function folj(o, x, z, r, dt, gar) {
    const p = o._fot;
    if (vatten(x, z) || (o.y && o.y > 0.15)) { o._fot = null; return null; }          // på ett skepp, på isen, på en brygga eller uppe på något: som koden säger
    if (!p || !p.syns || Math.hypot(x - p.dx, z - p.dz) > HOPP || p.epok === undefined) {
      const q = ut(x, z, r, false); o._fot = { rx: q[0], rz: q[1], dx: x, dz: z, tx: x, tz: z, mx: q[0], mz: q[1], qx: q[0], qz: q[1], syns: true, v: 0, vag: null, vi: 0, fast: 0, epok, rv: 0, stod: 0, sk: 0, ux: 0, uz: 1, gar };
      return o._fot;
    }
    p.syns = true;
    const sp = Math.hypot(x - p.dx, z - p.dz) / Math.max(dt, 1e-3); p.v = p.v * 0.85 + sp * 0.15;
    if (p.epok !== epok && avst(p.rx, p.rz) < r * 0.6) { const q = ut(p.rx, p.rz, r, false); p.rx = q[0]; p.rz = q[1]; p.vag = null; }          // ett hus har just kommit dit den står: ut på närmaste väg, inte genom väggarna
    const flytt = x !== p.dx || z !== p.dz; p.stod = flytt ? 0 : p.stod + dt; p.gar = gar;
    if (flytt || p.epok !== epok) {
      if (p.epok !== epok && p.vag) for (let k = p.vi; k < p.vag.length; k++) { const a = k === p.vi ? [p.rx, p.rz] : p.vag[k - 1], b = p.vag[k]; if (!rak(a[0], a[1], b[0], b[1], r * 0.8, false)) { p.vag = null; break; } }          // ett nytt hus på vägen: en ny väg
      p.dx = x; p.dz = z; p.epok = epok; const q = ut(x, z, r, false);
      const kliv = !flytt && (p.mx !== p.qx || p.mz !== p.qz) && q[0] === p.qx && q[1] === p.qz && fri(p.mx, p.mz, r);          // ett kliv fram gäller så länge den står kvar
      p.qx = q[0]; p.qz = q[1]; if (!kliv) { p.mx = q[0]; p.mz = q[1]; }
    }
    if (p.stod > 0.4 && (p.sk -= dt) <= 0) {          // står den still där kameran inte ser den (bakom ett hus): ett litet kliv fram
      p.sk = 0.6 + Math.random() * 0.4;
      if (iBild(p.qx, p.qz)) { if (synlig(p.qx, p.qz)) { p.mx = p.qx; p.mz = p.qz; } else if (!((p.mx !== p.qx || p.mz !== p.qz) && synlig(p.mx, p.mz))) { const f = fram(p.qx, p.qz, r, o); if (f) { p.mx = f[0]; p.mz = f[1]; const k = uk(f[0], f[1]); let l = upptagna.get(k); if (!l) upptagna.set(k, l = []); l.push([f[0], f[1], o]); } } }          // platsen är tagen
    }
    const tx = p.mx, tz = p.mz, steg = Math.max(p.v * 1.6, gar ? 0.9 : 0.6) * dt + 1e-4, bx = p.rx, bz = p.rz;
    const l = Math.hypot(tx - p.rx, tz - p.rz);
    if (l < 1e-5) { p.vag = null; }
    else if (!p.vag && (l <= steg + 1e-6 ? rak(p.rx, p.rz, tx, tz, r * 0.9, false) : rak(p.rx, p.rz, tx, tz, r * 0.9, true))) {
      if (l <= steg) { p.rx = tx; p.rz = tz; } else { p.rx += (tx - p.rx) / l * steg; p.rz += (tz - p.rz) / l * steg; }
    } else {
      const slut = p.vag && p.vag[p.vag.length - 1];
      if (!p.vag || Math.hypot(slut[0] - tx, slut[1] - tz) > 0.3) {
        if (aStarMs < 4) { const t0 = performance.now(); aStar++; p.vag = vag([p.rx, p.rz], [tx, tz], r * 0.9, !vatten(p.rx, p.rz)) || vag([p.rx, p.rz], [tx, tz], r * 0.9, false); aStarMs += performance.now() - t0; p.vi = 1; if (!p.vag) p.fast += dt; } else p.vag = null;          // högst några millisekunder sökning per bildruta, resten väntar
      }
      if (p.vag) {
        let kvar = steg;
        while (kvar > 0 && p.vi < p.vag.length) { const m = p.vag[p.vi], dx = m[0] - p.rx, dz = m[1] - p.rz, dl = Math.hypot(dx, dz); if (dl <= kvar) { p.rx = m[0]; p.rz = m[1]; kvar -= dl; p.vi++; } else { p.rx += dx / dl * kvar; p.rz += dz / dl * kvar; kvar = 0; } }
        if (p.vi >= p.vag.length) p.vag = null; p.fast = 0;
      } else if (p.fast > 2.5) { p.rx = tx; p.rz = tz; p.fast = 0; }          // ingen väg dit på länge: då står den där den ska
    }
    p.rv = p.rv * 0.8 + Math.hypot(p.rx - bx, p.rz - bz) / Math.max(dt, 1e-3) * 0.2;          // hur fort den syns gå
    if (p.rx !== bx || p.rz !== bz) { p.ux = p.rx - bx; p.uz = p.rz - bz; }
    return p;
  }

  // alla gubbar: de ritas där folj säger, och den som går utan att komma någonstans står stilla
  const F = V.Folk, upd0 = F.update; let sistT = null, sv = [];
  F.update = function (t) {
    const t0 = performance.now();
    const dt = sistT === null ? 0.016 : Math.max(0.001, Math.min(0.1, t - sistT)); sistT = t; byggdaDenna = 0; aStar = 0; aStarMs = 0;
    try { samla(); } catch (e) { console.warn('hinder', e); }
    sv.length = 0; upptagna.clear();
    const upp = (x, z, o) => { const k = uk(x, z); let l = upptagna.get(k); if (!l) upptagna.set(k, l = []); l.push([x, z, o]); };
    for (const h of hjaltar) if (h._fot && h._fot.syns) upp(h._fot.rx, h._fot.rz, h);
    for (const u of F.units) {
      if (!u.vis) { if (u._fot) u._fot.syns = false; continue; }
      let p = null; try { p = folj(u, u.x, u.z, 0.15 * (u.sc || 1), dt, u.gar); } catch (e) { p = null; }
      const stilla = u.gar && p && p.rv < 0.04 && (p.still = (p.still || 0) + dt) > 0.3; if (p && !(p.rv < 0.04)) p.still = 0;
      const kliver = p && !u.gar && p.rv > 0.25;          // koden låter den stå, men den kliver ut ur ett hus eller fram dit den syns: då går den dit
      if (p && (p.rx !== u.x || p.rz !== u.z || stilla || kliver)) { sv.push(u, u.x, u.z, u.gar, u.ang); u.x = p.rx; u.z = p.rz; if (stilla) u.gar = false; if (kliver) { u.gar = true; u.ang = Math.atan2(p.ux, p.uz); } }
      upp(u.x, u.z, u);
    }
    const t1 = performance.now(); stat.ms = stat.ms * 0.95 + (t1 - t0) * 0.05; stat.max = Math.max(stat.max, t1 - t0); stat.n++; stat.aStar += aStar;
    try { return upd0.call(this, t); }
    finally { for (let k = 0; k < sv.length; k += 5) { const u = sv[k]; u.x = sv[k + 1]; u.z = sv[k + 2]; u.gar = sv[k + 3]; u.ang = sv[k + 4]; } }
  };
  // hjältarna och personerna på kartan
  const plac0 = V.Gustav.place;
  V.Gustav.place = function (x, z, ang, fart, t, dt, tillSjoss, tillFots) {
    if (!tillSjoss) { try { const p = folj(this, x, z, tillFots ? 0.2 : 0.3, Math.max(0.001, Math.min(0.1, dt || 0.016)), fart > 0.05); if (p) { x = p.rx; z = p.rz; if (!(fart > 0.05) && p.rv > 0.25) { fart = Math.min(0.5, p.rv); ang = Math.atan2(p.ux, p.uz); } } } catch (e) { /* som förut */ } }          // kliver den ut ur ett hus eller fram dit den syns går den
    else if (this._fot) this._fot.syns = false;
    return plac0.call(this, x, z, ang, fart, t, dt, tillSjoss, tillFots);
  };
  // skeppen är inga hus
  if (V.skepp) { const sk0 = V.skepp; V.skepp = function () { const g = sk0.apply(this, arguments); g.userData.skepp = 1; return g; }; }

  // ---- träden: ingen skyms av ett träd ---------------------------------------------------------------------------------
  // Kring varje grupp av figurer som syns kliver träden undan, i en kapsel från figurerna mot kameran (ett träd framför en gubbe skymmer honom).
  if (World && World.fri) {
    const fri0 = World.fri;
    World.fri = function (lista) {
      try {
        const N = World.FRI_N || 12, ut4 = lista.slice(); if (ut4.length >= N) return fri0.call(this, ut4);
        const cam = Scene.camera, c = Scene.cam; if (!cam || !c) return fri0.call(this, ut4);
        const syns = figurer(true), grupp = [];
        for (const f of syns) { const d = Math.hypot(f.x - c.x, f.z - c.z); if (d > Math.max(10, c.d * 0.75) || vatten(f.x, f.z)) continue; let g = null; for (const q of grupp) if (Math.hypot(q.x - f.x, q.z - f.z) < 1.4) { g = q; break; } if (g) { g.n++; g.r = Math.max(g.r, Math.hypot(g.x - f.x, g.z - f.z)); } else grupp.push({ x: f.x, z: f.z, n: 1, r: 0, d }); }
        grupp.sort((a, b) => a.d - b.d);
        const cx = cam.position.x, cz = cam.position.z, cy = cam.position.y;
        for (const g of grupp) {
          if (ut4.length >= N) break;
          const hx = cx - g.x, hz = cz - g.z, hl = Math.hypot(hx, hz) || 1, lut = Math.atan2(cy - Geo.groundAt(g.x, g.z), hl), lang = Math.min(3.2, 1.7 / Math.max(0.35, Math.tan(lut)));          // så långt fram ett träd kan stå och ändå skymma
          const r = 0.75 + g.r, ex = g.x + hx / hl * lang, ez = g.z + hz / hl * lang;
          if (ut4.some(q => q[4] && Math.abs(q[4]) >= r && segAvst(g.x, g.z, q) < 0.3 && segAvst(ex, ez, q) < 0.3)) continue;          // redan en glänta där
          ut4.push([g.x, g.z, ex, ez, -r]);
        }
        return fri0.call(this, ut4);
      } catch (e) { return fri0.call(this, lista); }
    };
  }
  function segAvst(x, z, q) { const ax = q[0], az = q[1], bx = q[2], bz = q[3], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz, f = l2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)) : 0; return Math.hypot(x - ax - dx * f, z - az - dz * f) - Math.abs(q[4]); }

  // ---- alla figurer som syns just nu ------------------------------------------------------------------------------
  // hjältarna hittas i scenen: varje ledad figur har userData.kropp
  function figurer(baraSyns) {
    const ut5 = [];
    for (const u of F.units) if (u.vis || !baraSyns) ut5.push({ typ: 'gubbe', o: u, x: u._fot ? u._fot.rx : u.x, z: u._fot ? u._fot.rz : u.z, rx: u.x, rz: u.z, y: u.y || 0, r: 0.15 * (u.sc || 1), namn: u.namn || u.slag, gar: !!u.gar });
    const sc = Scene.scene; if (sc) for (const g of sc.children) if (g.userData && g.userData.kropp && (g.visible || !baraSyns)) { let syns = true; for (let p = g; p; p = p.parent) if (!p.visible) syns = false; if (!syns && baraSyns) continue; const h = hjalteTill(g); ut5.push({ typ: 'hjälte', o: h || g, x: g.position.x, z: g.position.z, rx: h && h._fot ? h._fot.dx : g.position.x, rz: h && h._fot ? h._fot.dz : g.position.z, y: 0, r: g.userData.hast && g.userData.hast.visible ? 0.3 : 0.2, namn: h ? h.sort : '?', gar: !!(h && h._fot && h._fot.gar) }); }
    return ut5;
  }
  const hjaltar = new Set(); const init0 = V.Gustav.init;
  V.Gustav.init = function () { const r = init0.apply(this, arguments); hjaltar.add(this); return r; };
  hjaltar.add(V.Gustav); if (V.Bud) hjaltar.add(V.Bud);
  function hjalteTill(g) { for (const h of hjaltar) if (h.g === g) return h; return null; }

  // ---- provet: vem står i ett hus, och vem skyms ----------------------------------------------------------------------
  const ray = new THREE.Raycaster();
  function skymd(x, y, z, nat) {
    const cam = Scene.camera; if (!cam) return false; v1.set(x, y, z); v2.copy(v1).sub(cam.position); const l = v2.length(); v2.normalize();
    ray.set(cam.position, v2); ray.far = l - 0.12; const h = ray.intersectObjects(nat, false); return h.length > 0;
  }
  // träden: varje träd är ungefär en kägla; gläntorna (uFri) räknas som i färgprogrammet
  function tradLista() { const ut6 = []; Scene.scene.traverse(m => { if (m.isInstancedMesh && m.visible && m.customDepthMaterial && m.geometry.boundingSphere) ut6.push(m); }); return ut6; }
  function tradSkymmer(x, y, z, trad) {
    const cam = Scene.camera, U = V.U; if (!cam || !U || !U.uFri) return false; const fq = U.uFri.value, fr = U.uFriR.value;
    const ox = cam.position.x, oy = cam.position.y, oz = cam.position.z, dx = x - ox, dy = y - oy, dz = z - oz, d2 = dx * dx + dz * dz;
    for (const m of trad) {
      const bs = m.geometry.boundingSphere; if (Math.hypot(bs.center.x - x, bs.center.z - z) > bs.radius + 4) continue;
      const a = m.instanceMatrix.array, n = m.count;
      for (let k = 0; k < n; k++) {
        let tx = a[16 * k + 12], tz = a[16 * k + 14]; if (Math.abs(tx - x) > 3.5 || Math.abs(tz - z) > 3.5) continue; const ty = a[16 * k + 13];
        const sc = Math.hypot(a[16 * k + 4], a[16 * k + 5], a[16 * k + 6]); let fri = 1, ux = 0, uz = 0;
        for (let i = 0; i < fr.length; i++) { const r = fr[i]; if (r === 0) break; const q = fq[i], px = tx - q.x, pz = tz - q.y, bx = q.z - q.x, bz = q.w - q.y, l2 = bx * bx + bz * bz, f = Math.max(0, Math.min(1, l2 > 1e-4 ? (px * bx + pz * bz) / l2 : 0)), vx = px - bx * f, vz = pz - bz * f, d = Math.hypot(vx, vz);
          if (r < 0) fri = Math.min(fri, Math.max(0, Math.min(1, (d + r * 0.5) / (-r * 0.5)))); else if (d < r) { const fk = 1 - d / r, s = (r - d) * 0.85 / Math.max(d, 1e-3); if (s * d > Math.hypot(ux, uz)) { ux = vx * s; uz = vz * s; } fri = Math.min(fri, 1 - 0.55 * fk); } }
        if (fri < 0.15) continue; tx += ux; tz += uz; const Ht = 1.45 * sc * fri, R = 0.4 * sc * fri;
        const f = Math.max(0, Math.min(1, ((tx - ox) * dx + (tz - oz) * dz) / d2)); if (f > 0.985) continue;          // trädet står bakom figuren
        const py = oy + dy * f - ty; if (py < 0 || py > Ht) continue; const rh = R * (1 - py / Ht) + 0.06;
        if (Math.hypot(ox + dx * f - tx, oz + dz * f - tz) < rh) return true;
      }
    }
    return false;
  }
  function skymdAvHus(x, y, z, nat) {
    const cam = Scene.camera; if (!cam) return false; const ox = cam.position.x, oz = cam.position.z;
    const nara = nat.filter(o => { const b = post.get(o).box; return b[2] >= Math.min(ox, x) - 0.5 && b[0] <= Math.max(ox, x) + 0.5 && b[3] >= Math.min(oz, z) - 0.5 && b[1] <= Math.max(oz, z) + 0.5; });
    return nara.length > 0 && skymd(x, y, z, nara);
  }
  const H = V.Hinder = {
    avst, fri, ut, vag, laga, rak, figurer, vatten, synlig, syns, hojd, stat, fram, iBild, get epok() { return epok; },
    // ett bra ställe att stå på: inte i ett hus, inte i vattnet, och där kameran ser en (om det är i bild)
    bra(x, z, r) { return fri(x, z, r || 0.2) && !vatten(x, z) && (!iBild(x, z) || synlig(x, z)); },
    // ett ställe nära (x, z) där en figur kan stå: inte i ett hus och inte i vattnet
    plats(x, z, r) { return ut(x, z, r || 0.18, true); },
    // nollställ allt (efter en scen som rivit sina hus)
    nollstall() { rutor.clear(); post.clear(); hink.clear(); samlatT = -1; epok++; },
    // Provet. Svar: en lista med det som är fel just nu. raa = också de som koden ställde i ett hus men som flyttades ut.
    prov(opt) {
      opt = opt || {}; samlatT = -1; samla(); const fel = [], nat = []; for (const p of post.values()) nat.push(p.o);
      const cam = Scene.camera, trad = opt.sikt !== false && cam ? tradLista() : [];
      for (const f of figurer(true)) {
        if (vatten(f.x, f.z) || f.y > 0.15) continue;
        const d = avst(f.x, f.z), d0 = avst(f.rx, f.rz), namn = f.namn, p = f.o && f.o._fot;
        if (d < f.r * 0.55 && !(p && p.epok !== epok)) fel.push({ fel: 'i hus', typ: f.typ, namn, x: +f.x.toFixed(2), z: +f.z.toFixed(2), d: +d.toFixed(2) });
        else if (opt.raa && d0 < f.r * 0.55) fel.push({ fel: 'flyttad ut', typ: f.typ, namn, x: +f.rx.toFixed(2), z: +f.rz.toFixed(2), d: +d0.toFixed(2) });
        if (opt.sikt === false || !cam) continue;
        const gy = Geo.groundAt(f.x, f.z); v1.set(f.x, gy + 0.5, f.z).project(cam); if (!(Math.abs(v1.x) < 0.95 && Math.abs(v1.y) < 0.95 && v1.z < 1)) continue;          // bara de som är i bild
        const star = !f.gar && !(p && (p.rv > 0.1 || p.stod < 2));          // den som går förbi bakom ett hus en stund räknas inte, bara den som står där
        if (star && !synlig(f.x, f.z) && skymdAvHus(f.x, gy + 0.45, f.z, nat) && skymdAvHus(f.x, gy + 0.8, f.z, nat)) fel.push({ fel: 'skymd av hus', typ: f.typ, namn, x: +f.x.toFixed(2), z: +f.z.toFixed(2) });
        else if (tradSkymmer(f.x, gy + 0.45, f.z, trad) && tradSkymmer(f.x, gy + 0.8, f.z, trad)) fel.push({ fel: 'skymd av träd', typ: f.typ, namn, x: +f.x.toFixed(2), z: +f.z.toFixed(2) });
      }
      return fel;
    },
    // för felsökning: rutnätet kring (x, z) som text (# = hus, + = för nära, . = fritt)
    rita(x, z, rad) { rad = rad || 2; let s = ''; for (let zz = z - rad; zz <= z + rad; zz += C) { for (let xx = x - rad; xx <= x + rad; xx += C) { const d = avst(xx, zz); s += d === 0 ? '#' : d < 0.15 ? '+' : vatten(xx, zz) ? '~' : '.'; } s += '\n'; } return s; }
  };
})();
