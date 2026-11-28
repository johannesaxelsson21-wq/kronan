// Städer för filmerna: orter utanför spelets karta (Kalø, Lübeck) byggs med samma kod och samma stadsplan som spelets egna städer
// (Bygge.Tomt och Bygge.steg): torget i mitten, gator med husen tätt på båda sidor, gränder, mur och hamn.
// Staden vet var husen står, så den som går i en scen följer gatorna och går aldrig genom ett hus (vag() söker vägen runt allt).
// Johannes 2026-11-28: "han går genom husen" i Kalø och Lübeck. Allt här tas bort när scenen är slut, också gatorna på marken.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, R = V.Rike, B = V.Bygge, World = V.World, Scene = V.Scene, Folk = V.Folk;
  const C = 0.1;          // rutnätet för vägsökningen, i världsenheter

  // Gatorna målas på marken medan scenen går. Biten av målarduken sparas först och läggs tillbaka efteråt.
  function sparaMark(x, z, r) {
    const P = World.Paint; if (!P || !P.ctx) return null;
    const x0 = Math.max(0, Math.floor(P.X(x - r))), z0 = Math.max(0, Math.floor(P.Z(z - r))), w = Math.min(P.cw - x0, Math.ceil(2 * r * P.k)), h = Math.min(P.ch - z0, Math.ceil(2 * r * P.k));
    try { return { x0, z0, d: P.ctx.getImageData(x0, z0, w, h) }; } catch (e) { return null; }
  }
  function aterMark(s) { const P = World.Paint; if (!s || !P) return; P.ctx.putImageData(s.d, s.x0, s.z0); P.commit(); }

  // Närmaste punkt i havet, för hamnen (samma regel som spelets hamnstäder)
  function havVid(x, z) {
    let best = null, bd = 1e9;
    for (let r = 0.5; r < 14 && !best; r += 0.5) for (let k = 0; k < 32; k++) { const a = k / 32 * 6.283, hx = x + Math.cos(a) * r, hz = z + Math.sin(a) * r; if (Geo.sdAt(hx, hz) < -1.2 && Geo.freshAt(hx, hz) < 0.3) { const d = Math.hypot(hx - x, hz - z); if (d < bd) { bd = d; best = { x: hx, z: hz }; } } }
    return best;
  }

  // o: { id, x, z, slag ('stad'), stor, mur, hamn, steg (hur utbyggd), vagar: [[[x, z], ...]] gator in i staden (världskoordinater),
  //      upptaget: [[x, z, r]] platser där inga hus ska stå, landmarken(mb, st): ritar ortens egna byggnader i tomtens enheter (från torget) }
  function bygg(o) {
    const K = B.K, y = Geo.groundAt(o.x, o.z), hav = o.hamn ? (o.hav || havVid(o.x, o.z)) : null;
    const p = { id: o.id, x: o.x, z: o.z, y, hav }, base = { id: o.id, slag: o.slag || 'stad', stor: o.stor, mur: o.mur, hamn: o.hamn, borg: o.borg, kyrka: o.kyrka, dom: o.dom };
    const RR = R.RADIE[base.slag] * (base.stor ? 1.35 : 1), mark = sparaMark(o.x, o.z, RR * 2.2 + 4);
    const tat = l => { const ut = [l[0]]; for (let i = 1; i < l.length; i++) { const a = l[i - 1], b = l[i], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.4)); for (let k = 1; k <= n; k++) ut.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return ut; }, vagar = (o.vagar || []).map(tat), vv = R.vagarVid; R.vagarVid = id => id === o.id ? vagar : vv.call(R, id);
    const fire0 = B.fire.length, smoke0 = B.smoke.length, grp = new THREE.Group(); grp.position.set(o.x, y, o.z); grp.scale.setScalar(K);
    const hinder = [];          // { x, z, r } eller { x, z, w, d, a } i världskoordinater
    let t, T, st;
    try {
      t = new B.Tomt(base, p); T = t.plan().torg;
      const tu = (x, z) => [(x - o.x) / K, (z - o.z) / K];
      for (const q of o.upptaget || []) { const [ux, uz] = tu(q[0], q[1]); t.take(ux, uz, q[2] / K); }
      // ortens egna byggnader (kyrka, rådhus, porten), i torgets riktning
      st = { t, T, K, p, hinder, UV: (u, v) => [u * T.ux + v * T.vx, T.z + u * T.uz + v * T.vz], world: (x, z) => [o.x + x * K, o.z + z * K] };
      if (o.landmarken) { const mb = new V.MB(); o.landmarken(mb, st); grp.add(B.mesh(mb)); }
      // spelets egen byggkod: torget först, sedan kvarter för kvarter. take() loggas så att vi vet vad som är fast.
      const take0 = t.take, torg0 = t.torg, fasta = []; let iTorg = false;
      t.take = function (x, z, r) { if (!iTorg) fasta.push([x, z, r]); return take0.call(this, x, z, r); };
      t.torg = function () { iTorg = true; try { return torg0.call(this); } finally { iTorg = false; } };
      if (o.utanStand) T.stand.length = 0;          // ett tomt torg, där scenen ska spelas
      const stand0 = T.stand.slice();
      const egenPort = o.mur && o.port !== undefined; if (egenPort) base.mur = false;          // planen vet om muren, men muren ritas här nedan, med porten där den ska vara
      for (let s = 0; s < (o.steg || 6); s++) grp.add(B.mesh(B.steg(t, s, World.Paint)));
      if (egenPort) { base.mur = true; const mb = new V.MB(); egenMur(mb, st, o.port); grp.add(B.mesh(mb)); }
      World.Paint.commit();
      t.take = take0; t.torg = torg0;
      // husen i stadsplanen: ett rektangulärt golv var, med gaveln mot gatan
      const lotter = []; for (const q of t.plan().hus) if (q.tagen) { lotter.push(q); const w = st.world(q.x, q.z); hinder.push({ x: w[0], z: w[1], w: 0.64 * K, d: 0.84 * K, a: q.a }); }
      for (const f of fasta) { if (lotter.some(q => Math.abs(q.x - f[0]) < 1e-6 && Math.abs(q.z - f[1]) < 1e-6)) continue; if (f[2] < 0.45 && lotter.length) continue; const w = st.world(f[0], f[1]); hinder.push({ x: w[0], z: w[1], r: f[2] * K * 0.92 }); }
      stand0.slice(0, stand0.length - T.stand.length).forEach(q => { const w = st.world(q[0], q[1]); hinder.push({ x: w[0], z: w[1], r: 0.26 * K }); });
      // muren (samma linje som Bygge.stadsmur), utom porten i söder
      if (o.mur && !egenPort && (o.steg || 6) > 2) {
        const Rm = t.R / K * 0.92, n = 12;
        for (let k = 0; k < n; k++) {
          const a0 = k / n * 6.283 + 0.2, a1 = (k + 1) / n * 6.283 + 0.2, x0 = Math.cos(a0) * Rm, z0 = Math.sin(a0) * Rm * 0.85, x1 = Math.cos(a1) * Rm, z1 = Math.sin(a1) * Rm * 0.85;
          if (Geo.sdAt(o.x + (x0 + x1) / 2 * K, o.z + (z0 + z1) / 2 * K) < 0.5 || Math.abs(a0 - 1.57) < 0.4) continue;
          const w0 = st.world(x0, z0), w1 = st.world(x1, z1); hinder.push({ l: [w0, w1], r: 0.16 * K });
        }
      }
      st.mur = o.mur;
      (o.extraHinder || []).forEach(h => hinder.push(h));
    } finally { R.vagarVid = vv; }
    Scene.scene.add(grp);
    // det som redan står på platsen (ortens lilla symbol på kartan) göms medan scenen går
    const gomda = []; Scene.scene.children.forEach(m => { if (m !== grp && m.visible && m.position && (m.position.x || m.position.z) && Math.hypot(m.position.x - o.x, m.position.z - o.z) < RR * 1.4 && !m.isLight && !m.isCamera) { m.visible = false; gomda.push(m); } });
    const S = { o, t, T, K, grp, hinder, p, R: RR, folk: [], hooks: [], port: st.port };
    natet(S);
    S.world = (x, z) => [o.x + x * K, o.z + z * K];
    S.torg = () => { const w = S.world(T.x, T.z); return { x: w[0], z: w[1], ux: T.ux, uz: T.uz, vx: T.vx, vz: T.vz, TU: T.TU * K, TV: T.TV * K }; };
    S.UV = (u, v) => S.world(u * T.ux + v * T.vx, T.z + u * T.uz + v * T.vz);          // u, v i tomtens enheter från torgets mitt
    S.vag = (a, b) => { const v = vag(S, a, b); (S._vagar || (S._vagar = [])).push(v); return v; };
    S.ledig = (x, z) => ledig(S, x, z);
    S.narmast = (x, z) => narmast(S, x, z);
    S.slump = rnd => slumpPunkt(S, rnd || Math.random);
    S.vandrare = (n, slag, nara) => vandrare(S, n, slag, nara);
    S.update = dt => uppdatera(S, dt);
    S.bort = () => {
      S.folk.forEach(f => Folk.remove(f.u)); S.folk = []; Scene.scene.remove(grp); gomda.forEach(m => { m.visible = true; });
      B.fire.length = Math.min(B.fire.length, fire0); B.smoke.length = Math.min(B.smoke.length, smoke0); aterMark(mark);
    };
    V.Filmstad.sist = S; return S;
  }

  // Muren runt staden med porten åt det håll vägen kommer ifrån (vinkeln port i tomtens enheter, som i Bygge.stadsmur).
  function egenMur(mb, st, port) {
    const t = st.t, K = st.K, Rm = t.R / K * 0.92, n = 18, pt = a => [Math.cos(a) * Rm, Math.sin(a) * Rm * 0.85], vatten = (x, z) => Geo.sdAt(st.p.x + x * K, st.p.z + z * K) < 0.5;
    const dvinkel = (a, b) => { let d = (a - b) % 6.283; if (d > 3.1416) d -= 6.283; if (d < -3.1416) d += 6.283; return Math.abs(d); };
    const gap = 0.3, P = pt(port);
    const ut = Math.atan2(P[0], P[1]), tower = (x, z, h) => { mb.push().move(x, t.y(x, z), z); mb.cyl(0, 0, 0, 0.24, 0.22, h, 9, '#9a4a36', { low: '#733526' }); mb.cone(0, h, 0, 0.28, 0.4, 9, '#52635f', { low: '#3f4d4a' }); mb.pop(); };
    for (let k = 0; k < n; k++) {
      const a0 = port + gap + k / n * (6.283 - 2 * gap) , a1 = port + gap + (k + 1) / n * (6.283 - 2 * gap), [x0, z0] = pt(a0), [x1, z1] = pt(a1);
      if (vatten((x0 + x1) / 2, (z0 + z1) / 2)) continue;
      murbit(mb, x0, z0, x1, z1, 0.5, t.y((x0 + x1) / 2, (z0 + z1) / 2)); if (k % 3 === 1) tower(x1, z1, 0.8);
      const w0 = st.world(x0, z0), w1 = st.world(x1, z1); st.hinder.push({ l: [w0, w1], r: 0.18 * K });
    }
    // porten: tornet mitt i öppningen, muren fram till dess sidor
    mb.push().move(P[0], t.y(P[0], P[1]), P[1]).rotY(ut); stadsport(mb); mb.pop();
    const sid = s => [P[0] + Math.cos(ut) * 0.85 * s, P[1] - Math.sin(ut) * 0.85 * s];
    for (const s of [-1, 1]) { const [ex, ez] = pt(port + s * gap), [sx, sz] = sid(s); murbit(mb, ex, ez, sx, sz, 0.5, t.y(ex, ez)); st.hinder.push({ l: [st.world(ex, ez), st.world(sx, sz)], r: 0.18 * K }); }
    const W = st.world(P[0], P[1]); st.port = { x: W[0], z: W[1], ut, ute: st.world(P[0] + Math.sin(ut) * 1.4, P[1] + Math.cos(ut) * 1.4), inne: st.world(P[0] - Math.sin(ut) * 1.2, P[1] - Math.cos(ut) * 1.2) };
    for (const s of [-1, 1]) { const c = st.world(P[0] + Math.cos(ut) * 0.45 * s, P[1] - Math.sin(ut) * 0.45 * s); st.hinder.push({ x: c[0], z: c[1], w: 0.5 * K, d: 0.85 * K, a: ut }); const f = st.world(P[0] + Math.cos(ut) * 0.62 * s, P[1] - Math.sin(ut) * 0.62 * s); st.hinder.push({ x: f[0], z: f[1], r: 0.3 * K }); }
  }

  // ---- rutnätet: vad är gata och vad är hus ----------------------------------------------------
  function natet(S) {
    const half = S.R * 1.75 + 4, n = Math.ceil(2 * half / C), x0 = S.o.x - half, z0 = S.o.z - half, bl = new Uint8Array(n * n);
    S.g = { n, x0, z0, bl };
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * C, z = z0 + (j + 0.5) * C; if (Geo.sdAt(x, z) < 0.3 || Geo.riverAt(x, z) < 0.3) bl[j * n + i] = 1; }
    const marg = 0.07;          // gubbarna är inte punkter
    for (const h of S.hinder) {
      if (h.l) { // en mur: sträcka med tjocklek
        const [a, b] = h.l, L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let s = 0; s <= L; s += C * 0.5) { const f = s / L; disk(S, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, h.r / 2 + marg); }
      } else if (h.w) { // ett hus: rektangel vriden efter gatan
        const ca = Math.cos(h.a), sa = Math.sin(h.a), ext = Math.hypot(h.w, h.d) / 2 + marg;
        rutor(S, h.x, h.z, ext, (x, z) => { const dx = x - h.x, dz = z - h.z, lx = dx * ca - dz * sa, lz = dx * sa + dz * ca; return Math.abs(lx) < h.w / 2 + marg && Math.abs(lz) < h.d / 2 + marg; });
      } else disk(S, h.x, h.z, h.r + marg);
    }
    // avstånd till närmaste hinder (i rutor), så att vägen håller sig mitt i gatan
    const dist = new Uint8Array(n * n), q = []; for (let k = 0; k < n * n; k++) { if (bl[k]) { dist[k] = 0; q.push(k); } else dist[k] = 255; }
    for (let h = 0; h < q.length; h++) { const k = q[h], i = k % n, j = (k / n) | 0, d = dist[k] + 1; if (d > 12) continue; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; const kk = jj * n + ii; if (dist[kk] > d) { dist[kk] = d; q.push(kk); } } }
    S.g.dist = dist;
  }
  function rutor(S, cx, cz, r, inne) { const { n, x0, z0, bl } = S.g, i0 = Math.max(0, Math.floor((cx - r - x0) / C)), i1 = Math.min(n - 1, Math.ceil((cx + r - x0) / C)), j0 = Math.max(0, Math.floor((cz - r - z0) / C)), j1 = Math.min(n - 1, Math.ceil((cz + r - z0) / C)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (inne(x0 + (i + 0.5) * C, z0 + (j + 0.5) * C)) bl[j * n + i] = 1; }
  function disk(S, x, z, r) { rutor(S, x, z, r, (px, pz) => Math.hypot(px - x, pz - z) < r); }
  function cell(S, x, z) { const { n, x0, z0 } = S.g, i = Math.floor((x - x0) / C), j = Math.floor((z - z0) / C); return i < 0 || j < 0 || i >= n || j >= n ? -1 : j * n + i; }
  function ledig(S, x, z) { const k = cell(S, x, z); return k < 0 ? Geo.sdAt(x, z) > 0.3 : !S.g.bl[k]; }
  function narmast(S, x, z) {
    if (ledig(S, x, z)) return [x, z];
    for (let r = C; r < 4; r += C) for (let k = 0; k < 24; k++) { const a = k / 24 * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (ledig(S, px, pz) && S.g.dist[cell(S, px, pz)] >= 2) return [px, pz]; }
    return [x, z];
  }
  // A* längs gatorna. Kostnaden är högre nära husen, så att man går mitt i gatan. Svar: punkter i världskoordinater.
  function vag(S, a, b) {
    const { n, x0, z0, bl, dist } = S.g; a = narmast(S, a[0], a[1]); b = narmast(S, b[0], b[1]);
    const s = cell(S, a[0], a[1]), e = cell(S, b[0], b[1]); if (s < 0 || e < 0) return [a, b];
    const gk = new Float32Array(n * n).fill(1e9), fr = new Int32Array(n * n).fill(-1), stang = new Uint8Array(n * n), heap = [];
    const ei = e % n, ej = (e / n) | 0, hv = k => { const i = k % n, j = (k / n) | 0, dx = Math.abs(i - ei), dz = Math.abs(j - ej); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    const push = (k, f) => { heap.push([f, k]); let c = heap.length - 1; while (c > 0) { const pp = (c - 1) >> 1; if (heap[pp][0] <= heap[c][0]) break; [heap[pp], heap[c]] = [heap[c], heap[pp]]; c = pp; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c = 0; for (;;) { const l = 2 * c + 1, r = l + 1; let m = c; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === c) break; [heap[m], heap[c]] = [heap[c], heap[m]]; c = m; } } return top; };
    gk[s] = 0; push(s, hv(s));
    const N8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
    let hittad = false;
    while (heap.length) {
      const [, k] = pop(); if (stang[k]) continue; stang[k] = 1; if (k === e) { hittad = true; break; }
      const i = k % n, j = (k / n) | 0;
      for (const [di, dj, c] of N8) {
        const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue; const kk = jj * n + ii; if (bl[kk] || stang[kk]) continue;
        if (di && dj && (bl[j * n + ii] || bl[jj * n + i])) continue;          // inte snett förbi ett hushörn
        const nar = Math.max(0, 4 - dist[kk]) * 0.9, g = gk[k] + c * (1 + nar); if (g < gk[kk]) { gk[kk] = g; fr[kk] = k; push(kk, g + hv(kk)); }
      }
    }
    if (!hittad) return [a, b];
    const rutt = []; for (let k = e; k >= 0; k = fr[k]) rutt.push(k); rutt.reverse();
    const pts = rutt.map(k => [x0 + (k % n + 0.5) * C, z0 + (((k / n) | 0) + 0.5) * C]);
    // dra åt snöret: hoppa över punkter så länge den raka linjen går fritt och inte nära ett hus
    const fritt = (p, q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]); for (let s2 = 0; s2 <= L; s2 += C * 0.4) { const f = L ? s2 / L : 0, kk = cell(S, p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f); if (kk < 0 || bl[kk] || dist[kk] < 2) return false; } return true; };
    const ut = [a]; let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !fritt(pts[i], pts[j])) j--; ut.push(pts[j]); i = j; }
    ut.push(b);
    // runda hörnen lite (Chaikin), utan att gå in i något
    let sm = ut; for (let r = 0; r < 2; r++) { const nx = [sm[0]]; for (let k = 0; k < sm.length - 1; k++) { const p = sm[k], q = sm[k + 1], A = [p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25], Bq = [p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75]; if (k > 0 && ledig(S, A[0], A[1])) nx.push(A); if (k < sm.length - 2 && ledig(S, Bq[0], Bq[1])) nx.push(Bq); } nx.push(sm[sm.length - 1]); sm = nx; }
    return sm;
  }
  // en punkt mitt i en gata eller på torget
  function slumpPunkt(S, rnd) {
    const { n, x0, z0, dist } = S.g, r = S.R * 0.9;
    for (let k = 0; k < 200; k++) { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * r, x = S.o.x + Math.cos(a) * d, z = S.o.z + Math.sin(a) * d * 0.85, c = cell(S, x, z); if (c >= 0 && !S.g.bl[c] && dist[c] >= 2 && dist[c] <= 5 && !(S.undvik || []).some(q => Math.hypot(x - q[0], z - q[1]) < q[2])) return [x, z]; }
    return S.narmast(S.o.x, S.o.z);
  }
  // Folk som går mellan gatorna, stannar en stund och går vidare. nara = [x, z, r]: håll dem inom den cirkeln (där kameran är).
  function vandrare(S, n, slag, nara) {
    const lista = [];
    for (let k = 0; k < n; k++) {
      let p = null; for (let f = 0; f < 30 && !p; f++) { const q = S.slump(); if (!nara || Math.hypot(q[0] - nara[0], q[1] - nara[1]) < nara[2]) p = q; }
      if (!p) continue;
      const sl = Array.isArray(slag) ? slag[k % slag.length] : slag, u = Folk.add(p[0], p[1], sl), f = { u, vag: null, d: 0, vila: Math.random() * 4, nara, fart: 0.32 + Math.random() * 0.16 };
      S.folk.push(f); lista.push(f);
    }
    return lista;
  }
  function uppdatera(S, dt) {
    for (const f of S.folk) {
      if (f.stilla) continue;
      if (f.vila > 0) { f.vila -= dt; f.u.gar = false; if (f.vila <= 0) { let mal = null; for (let k = 0; k < 20 && !mal; k++) { const q = S.slump(); if (Math.hypot(q[0] - f.u.x, q[1] - f.u.z) > 1.2 && (!f.nara || Math.hypot(q[0] - f.nara[0], q[1] - f.nara[1]) < f.nara[2])) mal = q; } if (mal) { f.vag = S.vag([f.u.x, f.u.z], mal); f.L = R.length(f.vag); f.d = 0; } else f.vila = 2; } continue; }
      if (!f.vag) { f.vila = 1 + Math.random() * 3; continue; }
      f.d += dt * f.fart; const a = R.along(f.vag, Math.min(f.d, f.L)); f.u.x = a.x; f.u.z = a.z; f.u.ang = a.ang; f.u.gar = true;
      if (f.d >= f.L) { f.vag = null; f.vila = 2 + Math.random() * 5; f.u.gar = false; }
    }
  }

  // ---- ortens egna byggnader, i samma klossiga stil som bygge.js --------------------------------
  const TEGEL = '#a1503a', TEGELL = '#733526', TAK = '#4a3e34', KOPPAR = '#52635f', KOPPARL = '#3f4d4a', GLASERAD = '#3a3430';
  function hus(mb, w, h, d, c, lo, tak, th) { mb.box(0, 0, 0, w, h, d, c, { low: lo, noTop: true }); mb.gable(0, h, 0, w, th || d * 0.6, d, tak || TAK, { over: 0.04, gable: c }); }
  function fon(mb, x, y, z, w, h) { mb.quad([x - w / 2, y, z], [x + w / 2, y, z], [x + w / 2, y + h, z], [x - w / 2, y + h, z], '#2f3a44', null, 0); }
  // Marienkirche i Lübeck: hög kyrka av rött tegel med två spetsiga tvillingtorn i väster (färdig på 1350-talet)
  function marienkirche(mb) {
    // långhuset längs x, tornen i väster (-x), koret i öster (+x)
    mb.box(0, 0, 0, 2.6, 1.55, 1.0, TEGEL, { low: TEGELL, noTop: true }); mb.gable(0, 1.55, 0, 2.6, 0.75, 1.0, KOPPAR, { over: 0.04, gable: TEGEL, ridge: '#687a76' });
    for (const s of [-1, 1]) { mb.box(0.1, 0, s * 0.68, 2.3, 0.85, 0.36, '#9a4a36', { low: TEGELL, noTop: true }); mb.box(0.1, 0.85, s * 0.68, 2.3, 0.06, 0.36, KOPPAR); for (let k = 0; k < 5; k++) fon(mb, -0.75 + k * 0.42, 0.9, s * 0.505 + (s > 0 ? 0.002 : -0.002), 0.1, 0.5); }
    for (const s of [-1, 1]) { mb.box(-1.45, 0, s * 0.3, 0.5, 2.55, 0.5, '#a5523c', { low: TEGELL, noTop: true }); fon(mb, -1.45, 1.9, s * 0.3 + 0.255, 0.12, 0.3); mb.hip(-1.45, 2.55, s * 0.3, 0.54, 0.2, 0.54, KOPPAR, 0.03); mb.cone(-1.45, 2.72, s * 0.3, 0.24, 1.35, 8, '#5e726d', { low: KOPPARL }); }
    mb.cyl(1.3, 0, 0, 0.5, 0.5, 1.4, 8, TEGEL, { low: TEGELL }); mb.cone(1.3, 1.4, 0, 0.55, 0.55, 8, KOPPAR, { low: KOPPARL });
  }
  // Rådhuset i Lübeck: lång tegelbyggnad mot torget med en hög prakt-fasad av mörkt glaserat tegel, runda hål och små torn
  function radhus(mb) {
    hus(mb, 1.5, 0.8, 0.7, TEGEL, TEGELL, TAK, 0.42);
    mb.box(0, 0, 0.36, 1.6, 1.45, 0.08, GLASERAD, { low: '#2a2522' });
    for (let k = 0; k < 5; k++) { const x = -0.64 + k * 0.32; mb.box(x, 1.45, 0.36, 0.1, 0.28, 0.08, GLASERAD); mb.cone(x, 1.73, 0.36, 0.06, 0.16, 6, KOPPAR, { low: KOPPARL }); }
    for (let k = 0; k < 3; k++) { const x = -0.4 + k * 0.4; mb.cyl(x, 1.05, 0.405, 0.08, 0.08, 0.004, 8, '#9db0c8'); fon(mb, x, 0.45, 0.405, 0.12, 0.3); }
    for (let k = 0; k < 5; k++) mb.box(-0.6 + k * 0.3, 0, 0.47, 0.06, 0.34, 0.06, '#7a3a2c');          // laubengången
  }
  // Stadsporten: ett högt fyrkantigt porttorn av tegel med valvport och pyramidtak, och låga flygeltorn (Lübecks portar är av tegel)
  function stadsport(mb) {
    mb.box(0, 0, 0, 0.9, 1.7, 0.8, TEGEL, { low: TEGELL, noTop: true }); mb.hip(0, 1.7, 0, 0.98, 0.7, 0.88, KOPPAR, 0.05); mb.cone(0, 2.3, 0, 0.05, 0.3, 4, KOPPAR);
    for (const z of [0.405, -0.405]) { mb.quad([-0.19, 0, z], [0.19, 0, z], [0.19, 0.5, z], [-0.19, 0.5, z], '#2a2018', null, 0); mb.tri([-0.19, 0.5, z], [0.19, 0.5, z], [0, 0.66, z], '#2a2018', 0); fon(mb, -0.2, 1.15, z, 0.1, 0.22); fon(mb, 0.2, 1.15, z, 0.1, 0.22); }
    for (const s of [-1, 1]) { mb.cyl(s * 0.62, 0, 0, 0.26, 0.25, 1.05, 10, '#9a4a36', { low: TEGELL }); mb.cone(s * 0.62, 1.05, 0, 0.3, 0.55, 10, KOPPAR, { low: KOPPARL }); }
  }
  // låg mur mellan två punkter (tomtens enheter)
  function murbit(mb, ax, az, bx, bz, h, ty) {
    const L = Math.hypot(bx - ax, bz - az), a = Math.atan2(-(bz - az), bx - ax);
    mb.push().move((ax + bx) / 2, ty || 0, (az + bz) / 2).rotY(a); mb.box(0, 0, 0, L, h, 0.16, '#9a948a', { low: '#6f6a62' }); for (let k = 0; k < Math.floor(L / 0.22); k++) mb.box(-L / 2 + 0.11 + k * 0.22, h, 0.05, 0.1, 0.09, 0.06, '#9a948a'); mb.pop();
  }

  // För prov: rita rutnätet uppifrån (svart = hus/vatten), vägarna (röda) och folket (blå) över skärmen.  V.Filmstad.visa()
  function visa(S) {
    S = S || V.Filmstad.sist; if (!S) return; const { n, bl } = S.g, c = document.createElement('canvas'); c.width = c.height = n; c.style.cssText = 'position:fixed;left:0;top:0;width:100vh;height:100vh;z-index:2147483647;image-rendering:pixelated;opacity:0.9';
    const x = c.getContext('2d'), im = x.createImageData(n, n); for (let k = 0; k < n * n; k++) { const v = bl[k] ? 30 : 235; im.data[4 * k] = im.data[4 * k + 1] = im.data[4 * k + 2] = v; im.data[4 * k + 3] = 255; } x.putImageData(im, 0, 0);
    const P = q => [(q[0] - S.g.x0) / C, (q[1] - S.g.z0) / C];
    x.strokeStyle = '#e02020'; x.lineWidth = 1.5; (S._vagar || []).forEach(v => { x.beginPath(); v.forEach((q, i) => { const p = P(q); i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); }); x.stroke(); });
    x.fillStyle = '#2050e0'; Folk.units.forEach(u => { const p = P([u.x, u.z]); if (p[0] > 0 && p[1] > 0 && p[0] < n && p[1] < n) x.fillRect(p[0] - 1.5, p[1] - 1.5, 3, 3); });
    document.documentElement.appendChild(c); return c;
  }
  // Står punkten (världskoordinater) i ett hus i en av spelets egna städer? t = Varld.tomt[id]. För scener i städer som redan finns.
  function iHus(t, x, z, marg) {
    if (!t || !t._plan) return false; const K = B.K, ux = (x - t.p.x) / K, uz = (z - t.p.z) / K, m = (marg || 0.06) / K;
    for (const q of t._plan.hus) { if (!q.tagen) continue; const dx = ux - q.x, dz = uz - q.z; if (Math.abs(dx) > 0.7 || Math.abs(dz) > 0.7) continue; const ca = Math.cos(q.a), sa = Math.sin(q.a), lx = dx * ca - dz * sa, lz = dx * sa + dz * ca; if (Math.abs(lx) < 0.32 + m && Math.abs(lz) < 0.42 + m) return true; }
    for (let i = t.vag.length; i < t.occ.length; i++) { const o = t.occ[i]; if (o[2] >= 0.6 && Math.hypot(ux - o[0], uz - o[1]) < o[2] * 0.9 + m) return true; }
    return false;
  }
  V.Filmstad = { iHus, visa, bygg, marienkirche, radhus, stadsport, murbit };
})();
