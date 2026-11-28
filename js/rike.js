// Riket: var platserna ligger i världen, vägarna mellan dem och sjövägarna.
// Vägnätet är fast (handskrivet nedan) och räknas ut en gång när spelet startar.
(function (root) {
  'use strict';
  const V = root.VASA = root.VASA || {}, Geo = V.Geo, D = V.DATA;

  // Landsvägar mellan platser. Alla resor på land följer de här.
  const VAGAR = [['mora', 'rattvik'], ['rattvik', 'leksand'], ['leksand', 'storatuna'], ['storatuna', 'kopparberget'], ['storatuna', 'hedemora'], ['kopparberget', 'gavle'], ['hedemora', 'brunnback'],
    ['brunnback', 'sala'], ['sala', 'vasteras'], ['sala', 'uppsala'], ['gavle', 'uppsala'], ['uppsala', 'brunkeberg'], ['brunkeberg', 'stockholm'], ['vasteras', 'orebro'], ['vasteras', 'strangnas'],
    ['strangnas', 'gripsholm'], ['gripsholm', 'rafsnas'], ['rafsnas', 'nykoping'], ['gripsholm', 'stockholm'], ['nykoping', 'soderkoping'], ['soderkoping', 'stegeborg'], ['soderkoping', 'vadstena'], ['orebro', 'vadstena'],
    ['soderkoping', 'kisa'], ['kisa', 'virserum'], ['virserum', 'smaland'], ['smaland', 'kalmar'], ['vadstena', 'skara'], ['skara', 'alvsborg'], ['mora', 'oxberg'], ['oxberg', 'evertsberg'], ['evertsberg', 'salen'],
    ['salen', 'lima'], ['gavle', 'halsingland'], ['staket', 'stockholm'], ['vadla', 'stockholm'], ['brannkyrka', 'stockholm'], ['brannkyrka', 'nykoping'], ['vasteras', 'uppsala'], ['kalmar', 'kronoberg'], ['kronoberg', 'halmstad'], ['halmstad', 'mared'], ['mared', 'getaryggen'], ['getaryggen', 'vadstena'], ['halmstad', 'axtorna'], ['axtorna', 'varberg'], ['varberg', 'alvsborg'], ['arboga', 'vasteras'], ['arboga', 'orebro'], ['reval', 'wesenberg'], ['wesenberg', 'narva'], ['reval', 'wenden'], ['viborg', 'kexholm'], ['uppsala', 'orbyhus'], ['soderkoping', 'linkoping'], ['linkoping', 'vadstena'], ['skara', 'bogesund'], ['abo', 'helsingfors'], ['helsingfors', 'viborg'], ['viborg', 'kivinebb'], ['lubeck', 'lubeck']];
  const HAMN = { danzig: 1, narva: 1, reval: 1, visby: 1, varberg: 1, halmstad: 1, nykoping: 1, stockholm: 1, kalmar: 1, abo: 1, helsingfors: 1, viborg: 1, soderkoping: 1, lubeck: 1, malmo: 1, kopenhamn: 1, gavle: 1, alvsborg: 1, stegeborg: 1, vasteras: 0 };
  const TILL_SJOSS = { bornholm: 1, ostersjon: 1, finskaviken: 1, olandsudde: 1 };
  const RADIE = { bygd: 5.2, gruva: 5.6, stad: 6.4, slott: 5.6 };

  const P = {};          // plats-id → { x, z, hav: {x,z} }
  const edges = {};      // 'a|b' → [[x,z], ...]
  const graph = {};      // a → [b, ...]

  // Närmaste ruta som duger: land en bit från vatten, eller öppet vatten.
  function snap(x, z, ok) {
    if (ok(x, z)) return [x, z];
    for (let r = 0.6; r < 14; r += 0.6) for (let a = 0; a < 6.283; a += 0.5 / r) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (ok(px, pz)) return [px, pz]; }
    return [x, z];
  }

  // ---- kortaste vägen över rutnätet (A*) ------------------------------------------------------
  function astar(x0, z0, x1, z1, sea) {
    const NX = Geo.NX, NZ = Geo.NZ, C = Geo.CELL, G = Geo.G, toI = x => Math.max(0, Math.min(NX - 1, Math.round((x + Geo.W / 2) / C))), toJ = z => Math.max(0, Math.min(NZ - 1, Math.round((z + Geo.H / 2) / C)));
    const si = toI(x0), sj = toJ(z0), ti = toI(x1), tj = toJ(z1), start = sj * NX + si, goal = tj * NX + ti;
    const pass = sea ? (k => G.sd[k] < -0.7) : (k => G.sd[k] > 0.3);
    const cost = sea ? (k => 1 + Math.max(0, 2.5 + G.sd[k]) * 1.2) : (k => 1 + Math.max(0, 1.6 - G.sd[k]) * 1.5 + Math.max(0, G.height[k] - 1.5) * 0.8 + (G.rdist[k] < 0.3 ? 2.5 : 0));
    const g = new Float32Array(NX * NZ).fill(1e9), from = new Int32Array(NX * NZ).fill(-1), closed = new Uint8Array(NX * NZ);
    const heap = [], hk = [];          // binär hög med (f, k)
    const push = (f, k) => { let i = heap.length; heap.push(f); hk.push(k); while (i > 0) { const p = (i - 1) >> 1; if (heap[p] <= f) break; heap[i] = heap[p]; hk[i] = hk[p]; i = p; } heap[i] = f; hk[i] = k; };
    const pop = () => { const top = hk[0], f = heap.pop(), k = hk.pop(), n = heap.length; if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && heap[c + 1] < heap[c]) c++; if (heap[c] >= f) break; heap[i] = heap[c]; hk[i] = hk[c]; i = c; } heap[i] = f; hk[i] = k; } return top; };
    const h = k => { const i = k % NX, j = (k - i) / NX; return Math.hypot(i - ti, j - tj); };
    g[start] = 0; push(h(start), start);
    let found = false, guard = 0;
    while (heap.length && guard++ < 400000) {
      const k = pop(); if (closed[k]) continue; closed[k] = 1; if (k === goal) { found = true; break; }
      const i = k % NX, j = (k - i) / NX;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ) continue;
        const nk = nj * NX + ni; if (closed[nk] || (!pass(nk) && nk !== goal)) continue;
        const ng = g[k] + (di && dj ? 1.414 : 1) * cost(nk);
        if (ng < g[nk]) { g[nk] = ng; from[nk] = k; push(ng + h(nk), nk); }
      }
    }
    const pts = [];
    if (found) { for (let k = goal; k >= 0; k = from[k]) { const i = k % NX, j = (k - i) / NX; pts.push([-Geo.W / 2 + i * C, -Geo.H / 2 + j * C]); if (k === start) break; } pts.reverse(); }
    if (pts.length < 2) return [[x0, z0], [x1, z1]];
    pts[0] = [x0, z0]; pts[pts.length - 1] = [x1, z1];
    // glesa ut och runda av
    const thin = [pts[0]]; for (let q = 3; q < pts.length - 2; q += 3) thin.push(pts[q]); thin.push(pts[pts.length - 1]);
    return Geo.smoothLine(thin, 0.45, 0);
  }
  function length(pts) { let s = 0; for (let q = 0; q + 1 < pts.length; q++) s += Math.hypot(pts[q + 1][0] - pts[q][0], pts[q + 1][1] - pts[q][1]); return s; }

  const R = V.Rike = {
    P, VAGAR, RADIE, HAMN,
    // Körs innan marken byggs: lägg ut platserna, jämna till tomterna och räkna ut vägarna.
    init() {
      const G = Geo.G;
      for (const id in D.PLATSER) {
        const w = Geo.toWorld(D.PLATSER[id][0], D.PLATSER[id][1]); let p;
        if (TILL_SJOSS[id]) p = snap(w[0], w[1], (x, z) => Geo.sdAt(x, z) < -3);
        else if (HAMN[id]) p = snap(w[0], w[1], (x, z) => { const s = Geo.sdAt(x, z); return s > 1.5 && s < 3.6 && Geo.freshAt(x, z) < 0.5; });
        else p = snap(w[0], w[1], (x, z) => Geo.sdAt(x, z) > 2.2);
        P[id] = { id, x: p[0], z: p[1] };
        if (HAMN[id]) { const h = snap(p[0], p[1], (x, z) => Geo.sdAt(x, z) < -1.2 && Geo.freshAt(x, z) < 0.3); P[id].hav = { x: h[0], z: h[1] }; }
      }
      // tomterna: plan mark där baserna står
      const bas = {}; D.BASER.forEach(b => bas[b.id] = b);
      for (const id in P) {
        if (TILL_SJOSS[id]) continue;
        const r = bas[id] ? RADIE[bas[id].slag] * (bas[id].stor ? 1.35 : 1) + 1 : 2.6, p = P[id], hc = Math.max(0.16, Math.min(1.4, Geo.heightAt(p.x, p.z)));
        const i0 = Math.max(0, Math.floor((p.x - r + Geo.W / 2) / Geo.CELL)), i1 = Math.min(Geo.NX - 1, Math.ceil((p.x + r + Geo.W / 2) / Geo.CELL)), j0 = Math.max(0, Math.floor((p.z - r + Geo.H / 2) / Geo.CELL)), j1 = Math.min(Geo.NZ - 1, Math.ceil((p.z + r + Geo.H / 2) / Geo.CELL));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const k = j * Geo.NX + i, d = Math.hypot(-Geo.W / 2 + i * Geo.CELL - p.x, -Geo.H / 2 + j * Geo.CELL - p.z);
          if (G.sd[k] <= 0.15 && d < 2.4 && G.sd[k] > -1.6) { G.sd[k] = 0.5; G.land[k] = 1; G.fresh[k] = 0; G.height[k] = hc * 0.7; }          // inga pölar mitt på torget
          if (G.sd[k] <= 0.15) continue;
          const f = Geo.smooth(r, r * 0.5, d) * Geo.smooth(0.15, 1.2, G.sd[k]);
          G.height[k] += (hc - G.height[k]) * f; G.forest[k] *= 1 - f * 0.9; G.rock[k] *= 1 - f;
        }
        p.y = hc;
      }
      for (const [a, b] of VAGAR) {
        if (a === b) continue;
        const pts = astar(P[a].x, P[a].z, P[b].x, P[b].z, false); edges[a + '|' + b] = pts; edges[b + '|' + a] = pts.slice().reverse();
        (graph[a] || (graph[a] = [])).push(b); (graph[b] || (graph[b] = [])).push(a);
      }
    },
    // Röjda ytor och vägar som skogen ska hålla sig borta från.
    clearings() {
      const c = [], bas = {}; D.BASER.forEach(b => bas[b.id] = b);
      // städerna får plats för förstäderna när de växer (Johannes 2026-11-28)
      for (const id in P) if (!TILL_SJOSS[id]) c.push({ x: P[id].x, z: P[id].z, r: bas[id] ? RADIE[bas[id].slag] * (bas[id].stor ? 1.35 : 1) * (bas[id].slag === 'stad' ? 1.42 : 1) + 0.6 : 2.4 });
      return c;
    },
    roads() { const out = []; for (const [a, b] of VAGAR) if (a !== b) out.push(edges[a + '|' + b]); return out; },
    vagarVid(id) { const out = []; for (const [a, b] of VAGAR) { if (a === b) continue; if (a === id) out.push(edges[a + '|' + b]); else if (b === id) out.push(edges[b + '|' + a]); } return out; },
    // Kortaste landsvägen mellan två platser (genom vägnätet). Finns ingen väg räknas en ny ut rakt över terrängen.
    // Vägen går knut för knut i vägnätet, och vid en del knutar (Gripsholm på vägen Stockholm–Nyköping, Stäket, Brännkyrka) gick den förbi
    // avtaget, fram till knuten och samma väg tillbaka. Med kapaVandor tas sådana blindtarmar bort (förspelet, sedan 2026-11-26: Johannes såg
    // budet till Nyköping gå fram till knuten och vända). Gustavs värld går som förut tills förspelet är klart.
    path(a, b) { const p = R._path(a, b); return R.kapaVandor ? R.utanVandor(p) : p; },
    utanVandor(pts) {
      const p = pts.slice();
      for (let i = 0; i < p.length - 3; i++) {
        let s = 0, klipp = -1;
        for (let j = i + 1; j < p.length && s < 16; j++) { s += Math.hypot(p[j][0] - p[j - 1][0], p[j][1] - p[j - 1][1]); if (j > i + 2 && s > 1 && Math.hypot(p[j][0] - p[i][0], p[j][1] - p[i][1]) < 0.4) klipp = j; }
        if (klipp > 0) p.splice(i + 1, klipp - i);
      }
      return p;
    },
    _path(a, b) {
      if (a === b) return [[P[a].x, P[a].z], [P[a].x + 0.01, P[a].z]];
      const dist = {}, prev = {}, todo = new Set(Object.keys(graph)); for (const n of todo) dist[n] = 1e9; if (dist[a] === undefined || dist[b] === undefined) return astar(P[a].x, P[a].z, P[b].x, P[b].z, false);
      dist[a] = 0;
      while (todo.size) {
        let u = null; for (const n of todo) if (u === null || dist[n] < dist[u]) u = n; todo.delete(u); if (u === b || dist[u] >= 1e9) break;
        for (const w of graph[u]) { const d = dist[u] + R.edgeLen(u, w); if (d < dist[w]) { dist[w] = d; prev[w] = u; } }
      }
      if (prev[b] === undefined) return astar(P[a].x, P[a].z, P[b].x, P[b].z, false);
      const chain = [b]; while (chain[0] !== a) chain.unshift(prev[chain[0]]);
      let pts = []; for (let q = 0; q + 1 < chain.length; q++) { const e = edges[chain[q] + '|' + chain[q + 1]]; pts = pts.concat(q ? e.slice(1) : e); }
      return pts;
    },
    edgeLen(a, b) { const e = edges[a + '|' + b]; return e._len || (e._len = length(e)); },
    // Sjövägen mellan två hamnar eller platser till sjöss.
    seaPath(a, b) {
      const key = 'hav:' + a + '|' + b; if (edges[key]) return edges[key];
      const pa = P[a].hav || P[a], pb = P[b].hav || P[b], pts = astar(pa.x, pa.z, pb.x, pb.z, true); edges[key] = pts; return pts;
    },
    length,
    // Punkt och riktning en viss sträcka in på en väg.
    along(pts, d) {
      for (let q = 0; q + 1 < pts.length; q++) {
        const dx = pts[q + 1][0] - pts[q][0], dz = pts[q + 1][1] - pts[q][1], l = Math.hypot(dx, dz);
        if (d <= l || q + 2 === pts.length) { const t = l > 0 ? Math.min(1, d / l) : 0; return { x: pts[q][0] + dx * t, z: pts[q][1] + dz * t, ang: Math.atan2(dx, dz) }; }
        d -= l;
      }
      return { x: pts[0][0], z: pts[0][1], ang: 0 };
    },
    // Gustavs rundtur: närmaste granne genom de baser han äger på fastlandet.
    tour(ids) {
      const land = ids.filter(id => ['abo', 'helsingfors', 'viborg', 'reval', 'narva', 'danzig'].indexOf(id) < 0); if (!land.length) return [];
      const left = land.slice(), order = [left.shift()];
      while (left.length) { let best = 0, bd = 1e9; const c = P[order[order.length - 1]]; left.forEach((id, i) => { const d = Math.hypot(P[id].x - c.x, P[id].z - c.z); if (d < bd) { bd = d; best = i; } }); order.push(left.splice(best, 1)[0]); }
      return order;
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = R;
})(typeof window !== 'undefined' ? window : globalThis);
