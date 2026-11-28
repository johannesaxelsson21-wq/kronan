// Stadens byggnader som växer (Johannes 2026-11-28: "Gör att de sakerna som byggs ut är på rätt plats och har rätt modeller som motsvarar det som byggs ut").
// Platsen är tom tills byggnaden byggs. Varje nivå lägger till en ny bit där den hör hemma: bryggorna en ny brygga med en skuta vid stranden,
// garnisonen fler tält vid slottet, gårdarna en gård till ute i bygden, hyttan en hytta eller kolmilor till och så vidare.
// Det som fanns i staden före spelets början (stadens egna bryggor, myntverket i Hedemora) står kvar: bitarna läggs bredvid.
// Här finns bara var bitarna står och hur de ser ut. Varld._husNiva sätter ut dem, och platserna sparas (S.husPos2) så att de står kvar.
// En plats är [x, z, vinkel, i vattnet, sort] i stadens egna mått (som tomten i bygge.js). Vinkeln vänder bitens +z mot vattnet eller gatan.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, B = V.Bygge, K = B.K, TAK = B.TAK;

  // samma modell kan vara olika saker: hamnen i Västerås är en lastkaj, myntverket, tullen och varvet har egna bitar
  const SORT = { vhamn: 'kaj', vhamn1: 'kaj', myntet: 'mynt', tullen: 'tull', varvet: 'varv', vaveri5: 'vaveri' };
  // så många bitar syns som mest. Nivåer över det ger bara ett hopp och glimmer (siffrorna växer ändå).
  const MAX = { hamn: 8, kaj: 7, tull: 7, varv: 6, mynt: 6, garnison: 8, gardar: 7, vaveri: 6, hytta: 7, disting: 8, radstuga: 6 };
  const typ = h => SORT[h.id] || h.modell;

  const varldAv = (t, x, z) => [t.p.x + x * K, t.p.z + z * K];
  const sdL = (t, x, z) => Geo.sdAt(t.p.x + x * K, t.p.z + z * K);
  const rund = q => q.map(v => typeof v === 'number' ? Math.round(v * 1000) / 1000 : v);
  // åt vilket håll vattnet ligger från en punkt (världens mått): bort från stranden
  function motVatten(x, z) { const e = 0.3, gx = Geo.sdAt(x + e, z) - Geo.sdAt(x - e, z), gz = Geo.sdAt(x, z + e) - Geo.sdAt(x, z - e); return Math.atan2(-gx, -gz); }
  // vänd mot närmaste gata (som tomtens vand(), men utan att ta av tomtens slumptal: då blir staden likadan när spelet laddas)
  function vand(t, x, z) { let bx = 0, bz = 0.5, bd = 2.2; for (const q of t.vag) { const d = Math.hypot(q[0] - x, q[1] - z); if (d < bd) { bd = d; bx = q[0]; bz = q[1]; } } return Math.atan2(bx - x, bz - z); }
  // avståndet från en punkt till en sträcka
  function tillLinje(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); return Math.hypot(x - a[0] - u * dx, z - a[1] - u * dz); }
  // ledig mark: som tomtens ok(), men vägarna in till staden får man ställa saker intill
  function ledig(t, x, z, r, minSd, utom) {
    const w = varldAv(t, x, z); if (Geo.sdAt(w[0], w[1]) < (minSd === undefined ? 0.45 : minSd) || Geo.riverAt(w[0], w[1]) < 0.3) return false;
    for (const o of t.occ) if (!(utom && utom(o)) && Math.hypot(o[0] - x, o[1] - z) < o[2] + r) return false; return true;
  }
  // n lediga platser i en ring kring (cx, cz), minst 'mellan' från varandra. rnd gör ordningen olika för varje byggnad men alltid densamma.
  function ring(t, cx, cz, rmin, rmax, r, n, mellan, rnd, minSd, utom) {
    const ut = [], tagna = [];
    for (let k = 0; k < 400 && ut.length < n; k++) {
      const a = rnd() * 6.283, d = rmin + (rmax - rmin) * Math.min(1, rnd() * (0.35 + k / 160)), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
      if (!ledig(t, x, z, r, minSd, utom) || ut.some(q => Math.hypot(q[0] - x, q[1] - z) < mellan)) continue;
      ut.push([x, z]); tagna.push([x, z, r]); t.occ.push([x, z, r]);          // tas tillfälligt, så att nästa inte hamnar ovanpå
    }
    t.occ.length -= tagna.length; return ut;
  }
  // fler platser längre ut när de närmaste inte räcker: de första hålls upptagna medan nästa ring letas
  function utfyll(t, q, r, n, mer) { if (q.length >= n) return q; for (const p of q) t.occ.push([p[0], p[1], r]); const ut = q.concat(mer(n - q.length)); t.occ.length -= q.length; return ut; }
  // åt vilket håll hamnen ligger från staden (världens mått): mot hamnpunkten om staden har en, annars mot närmaste vatten (Västerås vid Mälaren)
  function motHamn(t) {
    const p = t.p; if (p.hav) { const dx = p.hav.x - p.x, dz = p.hav.z - p.z, d = Math.hypot(dx, dz) || 1; return [dx / d, dz / d, d]; }
    let bast = null; for (let a = 0; a < 6.283; a += 0.1) for (let d = 0.5; d < 12; d += 0.2) if (Geo.sdAt(p.x + Math.cos(a) * d, p.z + Math.sin(a) * d) < -0.6) { if (!bast || d < bast[2]) bast = [Math.cos(a), Math.sin(a), d]; break; }
    return bast;
  }
  // Bryggor i rad längs stranden, på var sida om stadens egna (bygge.js hamn(): n0 bryggor 0,9 isär). Får de inte plats där läggs de
  // vinkelräta mot stranden på andra ställen i staden. Mellan dem skutor för ankar ute på redden: två bryggor, sedan en skuta.
  function bryggor(t, n0, n, rnd) {
    const m = motHamn(t), piren = [], skutor = []; if (!m) return [];
    const [ux, uz, d] = m, a = Math.atan2(ux, uz), linjer = [], offs = [];
    // en brygga från stranden: gå från staden (förskjuten off åt sidan) mot vattnet tills marken tar slut, som hamn() i bygge.js
    const brygga = off => { const ox = t.p.x - uz * off, oz = t.p.z + ux * off; let s = 0.3; for (; s < d + 3; s += 0.12) if (Geo.sdAt(ox + ux * s, oz + uz * s) < 0.1) break; return s >= d + 3 ? null : { s, bx: ox + ux * (s - 0.3), bz: oz + uz * (s - 0.3) }; };
    for (let k = 0; k < n0; k++) { const q = brygga((k - (n0 - 1) / 2) * 0.9); if (q) linjer.push([[q.bx, q.bz], [q.bx + ux * 2.1, q.bz + uz * 2.1]]); }          // stadens egna bryggor
    const mitt = brygga(0), maxR = Math.max(t.R * 1.25, mitt ? Math.hypot(mitt.bx - t.p.x, mitt.bz - t.p.z) + 2.5 : 0);          // en by som Gävle har stranden en bit bort
    const prova = (bx, bz, dx, dz) => {          // går en brygga härifrån ut i vattnet, utan att stå i ett hus eller för nära en annan brygga?
      if (Geo.sdAt(bx, bz) < 0.02 || Math.hypot(bx - t.p.x, bz - t.p.z) > maxR || Geo.sdAt(bx + dx * 2.0, bz + dz * 2.0) > -0.3 || Geo.sdAt(bx + dx * 1.1, bz + dz * 1.1) > 0.05) return false;
      const lx = (bx - t.p.x) / K, lz = (bz - t.p.z) / K; if (t.occ.some(o => o[2] >= 0.38 && Math.hypot(o[0] - lx, o[1] - lz) < o[2] + 0.2)) return false;
      const L = [[bx, bz], [bx + dx * 2.6, bz + dz * 2.6]]; if (linjer.some(M => Math.min(tillLinje(L[0][0], L[0][1], M[0], M[1]), tillLinje(L[1][0], L[1][1], M[0], M[1]), tillLinje(M[0][0], M[0][1], L[0], L[1]), tillLinje(M[1][0], M[1][1], L[0], L[1])) < 1.05)) return false;
      linjer.push(L); piren.push(rund([lx, lz, Math.atan2(dx, dz), 1, 'b'])); return true;
    };
    const bas = n0 ? (n0 - 1) / 2 * 0.9 + 1.15 : 0;          // 1,15 isär: skutan vid en brygga når inte nästa brygga
    for (let j = 0; j < 12; j++) { const o = bas + j * 1.15; if (o === 0) offs.push(0); else offs.push(o, -o); }
    for (const off of offs) { if (piren.length >= n) break; const q = brygga(off); if (q) prova(q.bx, q.bz, ux, uz); }
    // andra ställen längs stranden i staden, de närmast hamnen först: bryggan vinkelrät mot stranden
    if (piren.length < n) {
      const kand = [];
      for (let v = 0; v < 6.283; v += 0.06) { const cx = Math.cos(v), cz = Math.sin(v); let s = 0.3; for (; s < maxR; s += 0.12) if (Geo.sdAt(t.p.x + cx * s, t.p.z + cz * s) < 0.1) break; if (s >= maxR) continue; const bx = t.p.x + cx * (s - 0.3), bz = t.p.z + cz * (s - 0.3), w = motVatten(bx, bz); kand.push({ bx, bz, dx: Math.sin(w), dz: Math.cos(w), fel: Math.abs(Math.atan2(Math.sin(v - Math.atan2(uz, ux)), Math.cos(v - Math.atan2(uz, ux)))) }); }
      kand.sort((p, q) => p.fel - q.fel); for (const c of kand) { if (piren.length >= n) break; prova(c.bx, c.bz, c.dx, c.dz); }
    }
    // skutor för ankar: ute på vattnet framför hamnen, en bit från stranden och från alla bryggor
    const cx = t.p.x + ux * (d + 1.4), cz = t.p.z + uz * (d + 1.4), ankrade = [];
    for (let k = 0; k < 500 && skutor.length < n; k++) {
      const r = rnd() * (1.0 + k / 50), v = rnd() * 6.283, x = cx + Math.cos(v) * r, z = cz + Math.sin(v) * r;
      if (Geo.sdAt(x, z) > -1.0 || linjer.some(L => tillLinje(x, z, L[0], L[1]) < 1.4) || ankrade.some(q => Math.hypot(q[0] - x, q[1] - z) < 1.5)) continue;
      ankrade.push([x, z]); skutor.push(rund([(x - t.p.x) / K, (z - t.p.z) / K, a + 1.2 + rnd() * 0.8, 1, 's']));
    }
    const ut = []; for (let k = 0; k < n; k++) { const q = (k % 3 === 2 && skutor.length) || !piren.length ? skutor.shift() : piren.shift(); if (q) ut.push(q); }
    return ut;
  }
  // nära stranden på land, vänd mot vattnet (varvet vid Björkenäs). c = mitten i världens mått.
  function strand(t, c, n, rnd) {
    const ut = [];
    for (let k = 0; k < 500 && ut.length < n; k++) {
      const v = rnd() * 6.283, r = 1.4 + rnd() * (1.2 + k / 150), x = c.x + Math.cos(v) * r, z = c.z + Math.sin(v) * r, sd = Geo.sdAt(x, z);
      if (sd < 0.3 || sd > 1.3 || Geo.riverAt(x, z) < 0.3) continue;
      const lx = (x - t.p.x) / K, lz = (z - t.p.z) / K;
      if (ut.some(q => Math.hypot(q[0] - lx, q[1] - lz) < 1.25) || t.occ.some(o => Math.hypot(o[0] - lx, o[1] - lz) < o[2] + 0.5)) continue;
      ut.push(rund([lx, lz, motVatten(x, z), 0, 'l']));
    }
    return ut;
  }

  // ---- var bitarna står ----------------------------------------------------------------------
  // ctx: det varld.js vet (varvPlats). Platserna på land ska tas i tomten av den som anropar.
  function platser(h, t, ctx) {
    const s = typ(h), n = MAX[s] || 6, b = t.b, rnd = Geo.rng(h.id.length * 977 + h.id.charCodeAt(0) * 31 + h.id.charCodeAt(h.id.length - 1)), R = t.R / K;
    const landa = (q, a) => q.map(p => rund([p[0], p[1], a === undefined ? vand(t, p[0], p[1]) : a(p), 0, 'l']));
    if (s === 'hamn' || s === 'kaj' || s === 'tull') {
      const n0 = b.hamn && t.p.hav && !b.ny ? (b.slag === 'stad' ? (b.stor ? 3 : 2) : 1) : 0;          // stadens egna bryggor (bygge.js), de står kvar
      const ut = bryggor(t, n0, s === 'tull' ? n - 1 : n, rnd);
      if (s === 'tull') for (const b0 of ut.filter(q => q[4] === 'b')) { const q = ring(t, b0[0], b0[1], 0.4, 2.2, 0.4, 1, 0, rnd, 0.2); if (q.length) { ut.unshift(rund([q[0][0], q[0][1], Math.atan2(b0[0] - q[0][0], b0[1] - q[0][1]), 0, 'l'])); break; } }          // tullen: först tullboden vid stranden, där skepparna betalar, sedan bryggorna
      return ut;
    }
    if (s === 'varv') { const c = ctx && ctx.varvPlats ? ctx.varvPlats() : null; return c ? strand(t, c, n, rnd) : []; }
    if (s === 'mynt') { const c = b.mynt ? [1.4, -0.9] : [0, 0]; return landa(ring(t, c[0], c[1], 0.9, 2.6, 0.42, n, 0.95, rnd)); }
    if (s === 'garnison') { const c = t.borgPos || (b.borg ? [2.3, -1.6] : [0, 0]); return landa(ring(t, c[0], c[1], 1.4, 3.0, 0.34, n, 0.8, rnd), p => Math.atan2(c[0] - p[0], c[1] - p[1])); }          // tälten vänder öppningen mot slottet
    if (s === 'gardar') return landa(ring(t, 0, 0, R * 0.7, R * 1.35, 0.85, n, 1.9, rnd, 0.8));
    if (s === 'vaveri') return landa(utfyll(t, ring(t, 0, 0, R * 0.55, R * 1.15, 0.7, n, 1.4, rnd, 0.8), 0.7, n, k => ring(t, 0, 0, R * 1.15, R * 1.75, 0.7, k, 1.4, rnd, 0.6)));
    if (s === 'hytta') return landa(ring(t, 0, 0, 2.2, 4.4, 0.55, n, 1.15, rnd));
    if (s === 'disting') {          // marknaden samlas på en öppen plats i stadens utkant: först ett ställe, sedan stånd runt det
      const f = ring(t, 0, 0, R * 0.35, R * 0.95, 0.65, 1, 0, rnd); if (!f.length) return [];
      t.occ.push([f[0][0], f[0][1], 0.5]); const rest = ring(t, f[0][0], f[0][1], 0.55, 1.8, 0.4, n - 1, 0.68, rnd); t.occ.pop();
      const c = f[0]; return landa([c].concat(rest), p => p === c ? vand(t, p[0], p[1]) : Math.atan2(c[0] - p[0], c[1] - p[1]));
    }
    if (s === 'radstuga') {          // på den tomma tomten kring rådstugan (D.BYGGNADER tomt), som hålls fri tills rådstugan växer
      const r0 = V.DATA.BYGGNADER.find(q => q.id === 'radstuga'), c = r0 ? [r0.x, r0.z] : [0, 0], egen = o => o[0] === c[0] && o[1] === c[1] && o[2] > 1;
      const q = utfyll(t, ring(t, c[0], c[1], 0.8, 1.5, 0.3, n, 0.58, rnd, 0.45, egen), 0.3, n, k => ring(t, c[0], c[1], 1.5, 3.2, 0.32, k, 0.6, rnd));
      return landa(q, p => Math.atan2(c[0] - p[0], c[1] - p[1]));
    }          // husen vid rådstugan vänder sig mot den
    return landa(ring(t, 0, 0, 1.5, R * 0.9, 0.5, n, 0.9, rnd));
  }
  // hur stor plats en bit på land tar i tomten
  const RAD = { hamn: 0.3, kaj: 0.3, tull: 0.45, varv: 0.6, mynt: 0.42, garnison: 0.34, gardar: 0.85, vaveri: 0.7, hytta: 0.55, disting: 0.42, radstuga: 0.36 };

  // ---- små modeller --------------------------------------------------------------------------
  // En skuta: ett litet handelsfartyg med en mast. Seglet är beslaget, för hon ligger stilla. Ingen flagga (vems hon är vet vi inte).
  function skuta(mb, s, last) {
    mb.push().scale(s);
    mb.box(0, -0.07, 0, 0.32, 0.17, 0.78, '#6f5540', { low: '#4a3628', top: '#8a7256' });
    mb.tri([-0.16, -0.07, 0.39], [0.16, -0.07, 0.39], [0, -0.07, 0.66], '#4a3628', 0); mb.tri([0.16, 0.1, 0.39], [-0.16, 0.1, 0.39], [0, 0.13, 0.66], '#8a7256', 0);
    mb.quad([-0.16, -0.07, 0.39], [0, -0.07, 0.66], [0, 0.13, 0.66], [-0.16, 0.1, 0.39], '#5a4534', '#6f5540', 0); mb.quad([0, -0.07, 0.66], [0.16, -0.07, 0.39], [0.16, 0.1, 0.39], [0, 0.13, 0.66], '#5a4534', '#6f5540', 0);
    mb.box(0, 0.1, -0.3, 0.33, 0.1, 0.2, '#7b6048', { low: '#5a4534', top: '#8a7256' });          // akterkastellet
    mb.box(0, 0.1, 0.06, 0.03, 0.72, 0.03, '#5a4838'); mb.box(0, 0.66, 0.06, 0.4, 0.025, 0.025, '#5a4838'); mb.box(0, 0.62, 0.06, 0.36, 0.045, 0.05, '#d8ccb0', { low: '#bfb39a' });          // masten och rån med seglet beslaget
    if (last === 'tunnor') for (const q of [[-0.06, 0.12], [0.07, 0.2], [0.0, -0.08]]) mb.cyl(q[0], 0.1, q[1], 0.05, 0.05, 0.1, 6, '#7a5a3a', { cap: '#8a6a45' });
    else if (last === 'lador') { mb.box(-0.05, 0.1, 0.18, 0.12, 0.09, 0.12, '#8a6a42'); mb.box(0.06, 0.1, -0.06, 0.12, 0.1, 0.12, '#7a5a3a'); }
    mb.pop();
  }
  // Ett skepp som byggs på stapelbädden: kölen på klossar, nedre bordläggningen, och spanten som står upp som revben. Stöttor från sidorna. Fören (+z) mot vattnet.
  function nybygge(mb) {
    for (const x of [-0.13, 0.13]) mb.box(x, 0, 0.1, 0.05, 0.05, 1.35, '#5f4b3a', { low: '#4a3a2c' });          // bädden ner mot vattnet
    for (const z of [-0.4, -0.05, 0.3]) mb.box(0, 0.04, z, 0.28, 0.08, 0.08, '#6b5743');          // klossar under kölen
    mb.push().move(0, 0.12, 0);
    mb.box(0, 0, -0.02, 0.32, 0.12, 0.82, '#8a6a45', { low: '#6b5743', top: '#9a7a52' });
    mb.tri([-0.16, 0, 0.39], [0.16, 0, 0.39], [0, 0, 0.64], '#6b5743', 0); mb.tri([0.16, 0.12, 0.39], [-0.16, 0.12, 0.39], [0, 0.12, 0.64], '#9a7a52', 0);
    mb.quad([-0.16, 0, 0.39], [0, 0, 0.64], [0, 0.12, 0.64], [-0.16, 0.12, 0.39], '#7a5c40', '#8a6a45', 0); mb.quad([0, 0, 0.64], [0.16, 0, 0.39], [0.16, 0.12, 0.39], [0, 0.12, 0.64], '#7a5c40', '#8a6a45', 0);
    mb.box(0, 0, 0.62, 0.04, 0.46, 0.04, '#5a4534'); mb.box(0, 0, -0.43, 0.05, 0.42, 0.05, '#5a4534');          // förstäven och akterstäven
    for (let z = -0.36; z <= 0.37; z += 0.12) for (const x of [-1, 1]) { const w = 0.15 - Math.max(0, z - 0.2) * 0.4; mb.push().move(x * w, 0.1, z).rotZ(-x * 0.18); mb.box(0, 0, 0, 0.025, 0.28, 0.025, '#b9935f'); mb.pop(); }          // spanten
    mb.box(0, 0.36, -0.02, 0.03, 0.03, 0.9, '#b9935f');          // en bjälke längs spantens toppar
    mb.pop();
    for (const z of [-0.25, 0.2]) for (const x of [-1, 1]) { mb.push().move(x * 0.34, 0, z).rotZ(x * 0.55); mb.box(0, 0, 0, 0.025, 0.34, 0.025, '#7b6650'); mb.pop(); }          // stöttor
  }
  function tunna(mb, x, z, c) { mb.cyl(x, 0, z, 0.07, 0.07, 0.15, 7, c || '#7a5a3a', { cap: '#8a6a45', low: '#5a4230' }); }
  function stand(mb, x, z, a, tyg) { mb.push().move(x, 0, z).rotY(a); for (const sx of [-0.2, 0.2]) for (const sz of [-0.12, 0.12]) mb.box(sx, 0, sz, 0.03, 0.3, 0.03, '#6b5743'); mb.box(0, 0.14, 0, 0.44, 0.03, 0.28, '#8a7256'); mb.box(0, 0.17, 0.02, 0.36, 0.06, 0.16, '#a88a5a'); mb.gable(0, 0.3, 0, 0.46, 0.1, 0.3, tyg, { over: 0.03 }); mb.pop(); }
  function stenhus(mb, w, d, h) { B.stuga(mb, w, d, h, 'tegel', { vagg: '#b9ad98', vaggLag: '#8f8473', gavel: '#b9ad98', brant: 0.85, ljus: 1 }); }
  function stock(mb, x, y, z, L, a) { mb.push().move(x, y, z).rotY(a).rotZ(Math.PI / 2); mb.cyl(0, -L / 2, 0, 0.05, 0.05, L, 6, '#8a6a45', { cap: '#c9a46f', low: '#6b5743' }); mb.pop(); }
  function stockar(mb, x, z, a) { for (let r = 0; r < 3; r++) for (let k = 0; k < 3 - r; k++) stock(mb, x + (k - (2 - r) / 2) * 0.1 * Math.sin(a), 0.05 + r * 0.085, z + (k - (2 - r) / 2) * 0.1 * Math.cos(a), 0.75, a); }
  function far(mb, x, z, a) { mb.push().move(x, 0, z).rotY(a); mb.blob(0, 0.1, 0, 0.11, 0.07, 0.07, '#e8e2d2', { low: '#c9c2b0' }); mb.blob(0.11, 0.13, 0, 0.04, 0.04, 0.035, '#3a3430'); for (const q of [[-0.06, -0.04], [-0.06, 0.04], [0.06, -0.04], [0.06, 0.04]]) mb.box(q[0], 0, q[1], 0.02, 0.06, 0.02, '#3a3430'); mb.pop(); }

  // ---- en bit -----------------------------------------------------------------------------------
  // k = vilken bit i ordningen, q = platsen. Ut: { mb, rok: [[x, y, z]] (bitens mått, före vinkeln), falt: [x, z, bredd, djup] }
  function bit(h, k, q, t) {
    const s = typ(h), mb = new V.MB(), rok = [], ut = { mb, rok };
    if (q[4] === 's') { skuta(mb, 1.15, k % 2 ? 'lador' : 'tunnor'); return ut; }          // en skuta för ankar
    if (q[4] === 'b') {          // en brygga ut i vattnet, med en skuta förtöjd vid sidan och last på bryggan
      B.brygga(mb, 1.5);
      mb.push().move(0.38, 0.02, 0.95); skuta(mb, 1.05, s === 'kaj' ? 'tunnor' : k % 2 ? 'lador' : 'tunnor'); mb.pop();          // skutan alltid på samma sida, så att två skutor aldrig ligger i samma glipa
      if (s === 'kaj') { for (const z of [0.25, 0.45]) mb.push().move(0, 0.09, z), tunna(mb, -0.06, 0, '#5d5550'), tunna(mb, 0.07, 0.03, '#5d5550'), mb.pop(); mb.box(0.02, 0.09, 0.7, 0.16, 0.05, 0.1, '#4a4644'); mb.box(0.02, 0.14, 0.7, 0.14, 0.04, 0.08, '#b06a3a'); }          // järn i tunnor och tackor av koppar
      else { mb.box(-0.06, 0.09, 0.3, 0.13, 0.11, 0.13, '#8a6a42'); mb.push().move(0.07, 0.09, 0.42); tunna(mb, 0, 0); mb.pop(); }
      return ut;
    }
    if (s === 'tull') { B.stuga(mb, 0.75, 0.52, 0.44, 'tegel', { ljus: 1, skorsten: 1 }); rok.push([0.16, 0.8, 0]); tunna(mb, -0.5, 0.15); tunna(mb, -0.55, -0.05); mb.box(0.52, 0, 0.2, 0.16, 0.14, 0.16, '#8a6a42'); return ut; }          // tullboden
    if (s === 'varv') {
      const n = k % 3;
      if (n === 0) { nybygge(mb); stockar(mb, 0.66, -0.2, Math.PI / 2); }          // ett skepp på stapelbädden, vänt mot vattnet, och timmer bredvid
      else if (n === 1) { stockar(mb, 0, -0.25, 0.1); stockar(mb, 0.05, 0.25, -0.12); }          // timmer till skeppen
      else { B.stuga(mb, 0.85, 0.55, 0.4, 'span', { skorsten: 1 }); rok.push([0.19, 0.75, 0]); mb.box(0.65, 0, 0.1, 0.3, 0.12, 0.25, '#4a3e34'); }          // en smedja för spik och beslag
      return ut;
    }
    if (s === 'mynt') {
      if (k % 2 === 0) { mb.box(0, 0, 0, 0.6, 0.4, 0.5, '#9a948a', { low: '#6a655d', noTop: true }); mb.gable(0, 0.4, 0, 0.6, 0.3, 0.5, TAK.tegel.c, { gable: '#9a948a' }); mb.box(0.16, 0.4, 0, 0.14, 0.45, 0.14, '#7a746b'); B.dorr(mb, -0.1, 0.256, 0.24, 0.12); rok.push([0.16, 0.9, 0]); }          // en smedja där mynten slås
      else { B.stuga(mb, 0.65, 0.48, 0.34, 'span', { ljus: 1 }); for (let j = 0; j < 4; j++) mb.box(-0.5, 0.04 + j * 0.06, -0.1 + (j % 2) * 0.05, 0.12, 0.06, 0.32, '#7a6650'); }          // en bod med ved till ässjorna
      return ut;
    }
    if (s === 'garnison') {
      mb.push().move(-0.2, 0, 0); B.talt(mb); mb.pop(); mb.push().move(0.28, 0, -0.18).rotY(0.4); B.talt(mb); mb.pop();
      if (k % 3 === 1) { mb.push().move(0.1, 0, 0.42); B.eld(mb); mb.pop(); rok.push([0.1, 0.25, 0.42]); }          // en lägereld
      if (k % 3 === 2) for (const x of [-0.08, 0, 0.08]) { mb.push().move(0.15 + x, 0, 0.42).rotZ(x * 2); mb.box(0, 0, 0, 0.02, 0.55, 0.02, '#6b5743'); mb.cone(0, 0.55, 0, 0.025, 0.08, 4, '#9a9da3', { snowLow: 0, snowTip: 0 }); mb.pop(); }          // pikar lutade mot varandra
      return ut;
    }
    if (s === 'gardar') {
      const tak = k % 2 ? 'torv' : 'halm';
      B.stuga(mb, 0.85, 0.5, 0.42, tak, { skorsten: 1, ljus: 1 }); rok.push([0.19, 0.72, 0]);
      mb.push().move(0.95, 0, -0.35).rotY(Math.PI / 2); if (k % 3 === 2) B.harbre(mb); else { mb.push().scale(0.8); B.lada(mb); mb.pop(); } mb.pop();
      B.gardsgard(mb, -0.6, 0.7, 0.9, 0.7); B.gardsgard(mb, -0.6, 0.7, -0.6, -0.5);
      ut.falt = [-1.5 - (k % 2) * 0.3, 0.3, 1.5, 1.0]; return ut;          // en åker bredvid gården
    }
    if (s === 'vaveri') {
      if (k % 2 === 0) { B.stuga(mb, 1.3, 0.6, 0.42, 'span', { skorsten: 1, ljus: 1 }); B.fonster(mb, -0.35, 0.25, 0.306, 0.045, true); B.fonster(mb, 0.05, 0.25, 0.306, 0.045, true); rok.push([0.29, 0.75, 0]); }          // ett långt hus där vävstolarna står
      else { const L = 0.55; B.gardsgard(mb, -L, -L, L, -L); B.gardsgard(mb, L, -L, L, L); B.gardsgard(mb, L, L, -L, L); B.gardsgard(mb, -L, L, -L, -L); [[-0.25, -0.2, 0.3], [0.15, 0.1, 2.1], [0.3, -0.25, 1.2], [-0.15, 0.28, 4.0]].forEach(f => far(mb, f[0], f[1], f[2])); }          // en fålla med får
      return ut;
    }
    if (s === 'hytta') {
      const c = h.plats === 'sala' ? '#9a9da3' : '#8a4f33';
      if (k % 2 === 0) { B.hytta(mb, true); rok.push([0.2, 1.0, -0.05]); mb.push().move(0.1, 0, 0.62); B.malm(mb, c); mb.pop(); }          // en hytta vid bäcken, med malm som väntar
      else { mb.push().move(-0.3, 0, 0); B.mila(mb); mb.pop(); mb.push().move(0.32, 0, 0.15); B.mila(mb); mb.pop(); rok.push([-0.3, 0.35, 0], [0.32, 0.35, 0.15]); }          // kolmilor: kolet till hyttan
      return ut;
    }
    if (s === 'disting') {          // två stånd med tyg och varor
      const tyg = ['#b8312a', '#2f4f8a', '#c9a24a', '#5d7a3a', '#8a4a6a', '#a8652a'];
      stand(mb, -0.27, 0, 0, tyg[(2 * k) % tyg.length]); stand(mb, 0.27, 0, 0, tyg[(2 * k + 1) % tyg.length]);
      return ut;
    }
    if (s === 'radstuga') {          // rådstugan växer: fler stenhus intill, för rådet, skrivarna och stadens kistor
      const w = [0.62, 0.5, 0.7, 0.55, 0.6, 0.5][k % 6], hh = [0.5, 0.42, 0.56, 0.46, 0.5, 0.44][k % 6];
      stenhus(mb, w, 0.46, hh); return ut;
    }
    B.stuga(mb, 0.8, 0.5, 0.42, 'span', {}); return ut;
  }

  V.HusNiva = { typ, MAX, RAD, platser, bit, max: h => MAX[typ(h)] || 6 };
})();
