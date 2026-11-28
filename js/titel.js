// Början på ett helt nytt spel: först en kort trailer, sedan titelskärmen Kronan.
// Johannes 2026-11-28: "Gör om introt så det blir proffsigt och sätter tonen för spelet." "De ska vara teasers genom de olika regenterna,
// så korta filmer om historiska saker som ska väcka nyfikenheten och lusten hos spelaren." "Korta klipp, dramatisk uppbyggnad till slutet
// med ett klimax, och sen titelskärmen." "Kronan kan vara huvudnamnet, och Sveriges regenter undernamnet."
// Sju klipp från 1520 till 1598, ur Sten Stures, Gustavs, Eriks, Johans, Sigismunds och Karls tid, sedan kronan och titeln.
// Allt spelas i spelets egen värld. Trailern går att hoppa över (knappen, Esc eller Enter).
// Varje rad bygger på (källorna syns inte i spelet):
//  Mälaren 1520: Sten Sture blir dödligt sårad vid Bogesund i januari 1520 och dör på Mälarens is på väg hem till Stockholm
//    (en.wikipedia Sten Sture the Younger och Battle of Bogesund, SNL Sten Svantesson Sture). Släden som i intro.js (isen).
//  Stockholm november 1520: Kristian smörjs till kung i Storkyrkan 4 november, och sedan hålls fest i tre dagar (en.wikipedia Stockholm Bloodbath).
//  Dalarna 1520: när Gustav Eriksson får höra om blodbadet far han norrut till Dalarna för att få hjälp till ett nytt uppror (samma källa).
//  Stockholm 1523: staden och slottet ger upp 17 juni, och Gustav tågar in på midsommarafton (en.wikipedia Conquest of Stockholm).
//  Uppsala 1561: kronan görs i Stockholm 1561 av Cornelis ver Weiden för Erik XIV:s kröning (en.wikipedia Crown of Erik XIV, kungligaslotten.se);
//    kröningen i Uppsala domkyrka 29 juni 1561 som i intro.js (kroning).
//  Stockholm 1568: Eriks bröder hertig Johan och hertig Karl belägrar Stockholm, som ger upp 28 september (en.wikipedia Uprising against Erik XIV).
//  Stångebro 1598: hertig Karl slår sin brorson Sigismund vid Linköping 25 september 1598 (en.wikipedia Battle of Stångebro, historyofwar.org).
//  Kronan: Erik XIV:s krona, med fyra byglar i kors och ett riksäpple med kors överst. Den används fortfarande (kungligaslotten.se).
(function () {
  'use strict';
  const V = window.VASA, Scene = V.Scene, Geo = V.Geo, R = V.Rike, B = V.Bygge, Folk = V.Folk, Fx = V.Fx, U = V.U, World = V.World, lin = V.hexToLin;
  const RAD = Math.PI / 180, mix = (a, b, f) => a + (b - a) * f, mjuk = t => t * t * (3 - 2 * t), q = new URLSearchParams(location.search);
  let E = null, sasong0 = 0.025, kam = null, fas = 'av', tid = 0, klarFn = null, nr = -1, klipp = null, kT = 0, temp = [], tempM = [], flaggByte = [], hj = {}, spar = null, menyT = 0, svep = null;

  // ---- kameran: vridning och lutning, som en filmkamera ------------------------------------------------
  // kam = { x, z (det kameran tittar på), d (avstånd), p (lutning i grader), y (vridning i grader: 0 = från söder), h (höjd över marken) }
  const upd0 = Scene.update;
  Scene.update = function (dt) {
    if (kam) { const C = Scene.cam; C.x = C.tx = kam.x; C.z = C.tz = kam.z; C.d = C.td = kam.d; C.fly = null; C.fri = true; }
    upd0.call(Scene, dt);
    if (!kam) return;
    const c = Scene.camera, k = Scene.cam.k || 1, d = kam.d * k, gy = Geo.groundAt(kam.x, kam.z) + (kam.h || 0), p = kam.p * RAD, y = kam.y * RAD;
    c.position.set(kam.x + d * Math.cos(p) * Math.sin(y), gy + d * Math.sin(p), kam.z + d * Math.cos(p) * Math.cos(y));
    c.lookAt(kam.x, gy, kam.z); c.near = Math.max(0.05, d * 0.05); c.far = d * 12 + 700; c.updateProjectionMatrix();
    if (fas !== 'av') { if (V.Gustav.g) V.Gustav.g.visible = false; if (V.Bud.g) V.Bud.g.visible = false; }          // kartans hjälte och bud hör inte hemma i trailern
  };

  // Gläntorna i trailern: klippets egna kapslar går först (World.fri tar bara FRI_N stycken)
  const fri0 = World.fri;
  World.fri = function (lista) { const k = fas === 'film' && T._kaps; return fri0.call(this, k ? k.concat(lista).slice(0, World.FRI_N) : lista); };

  // ---- ljuset och himlen ---------------------------------------------------------------------------------
  // Låg och varm sol i alla klipp (som en eftermiddag), och en himmel som går från blått till varmt mot horisonten.
  let himmel0 = null, parch0 = null, himmelTex = null;
  function ljus(sasong, el, varm) {
    Scene.setSeason(sasong); const se = World.season;
    if (el !== undefined) { se.sunEl = Math.min(se.sunEl, el); const e = se.sunEl * RAD, az = -0.72; U.uSunDir.value.set(Math.sin(az) * Math.cos(e), Math.sin(e), Math.cos(az) * Math.cos(e)).normalize(); }
    if (varm) { se.sunCol = se.sunCol.clone().lerp(lin('#ffb27a'), varm); U.uSunCol.value.set(se.sunCol.r, se.sunCol.g, se.sunCol.b); }
    Scene.applySeason();
  }
  function himmel(on) {
    const sc = Scene.scene;
    if (on) {
      if (!himmel0) { himmel0 = sc.background; parch0 = U.uParch.value.clone(); }
      if (!himmelTex) { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 256; const g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
        gr.addColorStop(0, '#56628e'); gr.addColorStop(0.3, '#9a98b4'); gr.addColorStop(0.55, '#e7c6a6'); gr.addColorStop(1, '#efd6b8'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
        himmelTex = new THREE.CanvasTexture(cv); himmelTex.encoding = THREE.sRGBEncoding; }
      sc.background = himmelTex; const h = lin('#ead0b0'); U.uParch.value.set(h.r, h.g, h.b);          // kartans kant tonar in i diset vid horisonten
    } else if (himmel0) { sc.background = himmel0; U.uParch.value.copy(parch0); himmel0 = null; }
  }

  // ---- sådant som byggs för ett klipp och rivs efteråt ---------------------------------------------------
  const folk = (x, z, slag, o) => { const u = Folk.add(x, z, slag, o); temp.push(u); return u; };
  const lagg = m => { Scene.scene.add(m); tempM.push(m); return m; };
  function hjalte(sort, titel) { let h = hj[sort]; if (!h) { h = hj[sort] = Object.create(V.Gustav); h.init(Scene.scene, sort); h.utanRing = true; } h.klad(titel || 'Riddare'); h.g.visible = true; h.spar = []; return h; }
  function rensa() {
    temp.forEach(u => Folk.remove(u)); temp = []; tempM.forEach(m => Scene.scene.remove(m)); tempM = [];
    for (const k in hj) { hj[k].g.visible = false; hj[k].spar = []; hj[k].drawSpar(0); }
    flaggByte.forEach(f => { f.ny.parent && f.ny.parent.remove(f.ny); f.gammal.visible = true; }); flaggByte = [];
    V.Varld.friExtra = null; T._fri = null; T._kaps = null;
  }
  // Byt flaggan på en stad under ett klipp (staden står som den gör år 1512, men klippet kan vara ett annat år).
  function flagga(id, sort) {
    const t = V.Varld.tomt && V.Varld.tomt[id], f = t && t.flag; if (!f) return;
    Scene.scene.traverse(o => { if (o.isMesh && o.parent && o.parent.isGroup && Math.abs(o.parent.position.x - t.p.x) < 1e-3 && Math.abs(o.parent.position.z - t.p.z) < 1e-3 && Math.abs(o.position.x - f[0]) < 1e-4 && Math.abs(o.position.z - f[2]) < 1e-4 && o.visible) {
      const ny = B.flagga(sort); ny.position.copy(o.position); ny.rotation.copy(o.rotation); ny.scale.copy(o.scale); o.parent.add(ny); o.visible = false; flaggByte.push({ ny, gammal: o }); } });
  }
  // Släden som Sten Sture förs hem i (samma som i intro.js)
  function slade() {
    const mb = new V.MB(); mb.snow = 0;
    for (const s of [-1, 1]) { mb.box(s * 0.17, 0, 0, 0.035, 0.04, 1.05, '#5d4a38'); mb.push().move(s * 0.17, 0.02, 0.55).rotX(-0.6); mb.box(0, 0, 0, 0.035, 0.04, 0.2, '#5d4a38'); mb.pop(); mb.box(s * 0.15, 0.3, 0.72, 0.022, 0.022, 0.66, '#5d4a38'); }
    mb.box(0, 0.09, -0.03, 0.44, 0.05, 0.9, '#8a6a44', { low: '#6b5030' }); mb.box(0, 0.14, -0.46, 0.44, 0.24, 0.05, '#8a6a44', { low: '#6b5030' });
    mb.box(0, 0.14, 0.03, 0.36, 0.12, 0.7, '#2f4f8a', { low: '#223c6c' });
    mb.blob(0, 0.31, -0.3, 0.085, 0.085, 0.085, '#e2b48e', { snow: 0 }); mb.blob(0, 0.34, -0.34, 0.09, 0.07, 0.075, '#6a4a2a', { snow: 0 });
    return B.mesh(mb);
  }
  // Erik XIV:s krona i närbild: ringen med stenar, uddar, två byglar i kors, och riksäpplet med korset överst (kungligaslotten.se)
  function kronMesh() {
    const mb = new V.MB(), GULD = '#efc64a', GULDL = '#a8801e', ROD = '#b3262a', BLA = '#2f5aa8'; mb.snow = 0;
    mb.blob(0, 0.05, 0, 0.06, 0.05, 0.06, '#8a1f2a', { low: '#5a1018', snow: 0 });          // sammetsmössan inuti
    mb.cyl(0, 0, 0, 0.07, 0.072, 0.042, 16, GULD, { low: GULDL });
    for (let k = 0; k < 8; k++) { const v = k / 8 * 6.283, cx = Math.cos(v), sz = Math.sin(v); mb.blob(cx * 0.073, 0.021, sz * 0.073, 0.011, 0.011, 0.007, k % 2 ? BLA : ROD, { snow: 0 }); }          // stenar runt ringen
    for (let k = 0; k < 8; k++) { const v = (k + 0.5) / 8 * 6.283, cx = Math.cos(v) * 0.069, sz = Math.sin(v) * 0.069;          // uddar: höga och låga om vartannat
      if (k % 2) { mb.cone(cx, 0.042, sz, 0.013, 0.034, 5, GULD, { low: GULDL, snowTip: 0, snowLow: 0 }); mb.blob(cx, 0.08, sz, 0.007, 0.007, 0.007, '#f4efe2', { snow: 0 }); }
      else mb.cone(cx, 0.042, sz, 0.01, 0.02, 5, GULD, { low: GULDL, snowTip: 0, snowLow: 0 }); }
    for (const r of [0, Math.PI / 2]) { mb.push().rotY(r); const N = 16; for (let k = 0; k < N; k++) { const a0 = k / N * Math.PI, a1 = (k + 1) / N * Math.PI, x0 = Math.cos(a0) * 0.066, y0 = 0.042 + Math.sin(a0) * 0.075, x1 = Math.cos(a1) * 0.066, y1 = 0.042 + Math.sin(a1) * 0.075, Ln = Math.hypot(x1 - x0, y1 - y0);
      mb.push().move((x0 + x1) / 2, (y0 + y1) / 2, 0).rotZ(Math.atan2(y1 - y0, x1 - x0)); mb.box(0, -0.0055, 0, Ln + 0.002, 0.011, 0.012, GULD, { low: GULDL }); mb.pop(); if (k % 4 === 2) mb.blob(x0, y0 + 0.007, 0, 0.005, 0.005, 0.005, '#f4efe2', { snow: 0 }); } mb.pop(); }
    mb.blob(0, 0.133, 0, 0.017, 0.017, 0.017, BLA, { snow: 0 }); mb.cyl(0, 0.13, 0, 0.0175, 0.0175, 0.005, 10, GULD);          // riksäpplet
    mb.box(0, 0.148, 0, 0.006, 0.03, 0.006, GULD); mb.box(0, 0.163, 0, 0.02, 0.006, 0.006, GULD);          // korset
    return B.mesh(mb);
  }
  // En ledig plats på öppen mark nära (x, z): inte i vatten och inte i ett hus
  function torr(x, z, t) { for (let r = 0; r < 4; r += 0.2) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (Geo.sdAt(px, pz) > 0.4 && !(t && V.Filmstad.iHus(t, px, pz, 0.12))) return [px, pz]; } return [x, z]; }
  const grader = a => a / RAD;

  // ---- klippen ---------------------------------------------------------------------------------------
  // Varje klipp bygger sin scen och ger kam(f) (kameran, f = 0..1 genom klippet) och steg(dt, f) (det som rör sig).
  const KLIPP = [
    { sek: 5.8, sasong: 0.09, el: 11, varm: 0.5, plats: 'Mälaren · februari 1520', rad: 'Sten Sture förs hem över isen, dödligt sårad.', musik: 'blodbadet', in: 1.4, bygg() {
      const a0 = R.P.strangnas, a1 = R.P.stockholm, rak = [[a0.x, a0.z], [a1.x, a1.z]], l0 = R.length(rak);
      let skift = 0; for (let f = 0.3; f <= 0.46; f += 0.04) { const a = R.along(rak, l0 * f); let s = 0; while (s < 5 && Geo.sdAt(a.x, a.z - s) > -1.4) s += 0.4; skift = Math.max(skift, s); }          // ut på öppen is
      const p0 = R.along(rak, l0 * 0.3), p1 = R.along(rak, l0 * 0.46), pts = [[p0.x, p0.z - skift], [p1.x, p1.z - skift]], L0 = R.length(pts);
      const bud = hjalte('bud'), sk = bud.g.scale.x, sl = lagg(slade()); sl.scale.setScalar(sk);
      const foljd = [0, 1, 2, 3].map(i => folk(0, 0, 'knekt', { pike: i % 2 === 0, gar: true }));
      let d = 1.5;
      const satt = (dt) => {
        const a = R.along(pts, d); bud.place(a.x, a.z, a.ang, 0.3, tid, dt, false); bud.g.userData.ring.visible = false;
        const bx = a.x - Math.sin(a.ang) * 1.15 * sk, bz = a.z - Math.cos(a.ang) * 1.15 * sk; sl.position.set(bx, Math.max(0.02, Geo.groundAt(bx, bz)) + 0.01, bz); sl.rotation.y = a.ang;
        foljd.forEach((u, i) => { const b = R.along(pts, Math.max(0, d - 1.9 - Math.floor(i / 2) * 0.7)), s = (i % 2 ? 1 : -1) * 0.42; u.x = b.x + Math.cos(b.ang) * s; u.z = b.z - Math.sin(b.ang) * s; u.ang = b.ang; });
        return a;
      };
      return { L: L0, steg(dt) { d = Math.min(L0, d + dt * 0.5); satt(dt); },
        kam(f) { const a = R.along(pts, d - 0.9); return { x: a.x, z: a.z, d: mix(9.5, 7.2, f), p: mix(13, 9, f), y: grader(a.ang) - mix(62, 88, f), h: 0.25 }; } };
    } },
    { sek: 5.4, sasong: 0.85, el: 10, varm: 0.6, plats: 'Stockholm · november 1520', rad: 'Kung Kristian bjuder till kröningsfest.', in: 0.6, ut: 'klocka', bygg() {
      const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K;
      flagga('stockholm', 'danmark');
      for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const q0 = torr(cx + (i - 2.5) * 0.42, cz - 0.9 - r * 0.42, st); folk(q0[0], q0[1], 'dansk', { pike: true, ang: 0 }); }          // Kristians knektar i rader på torget
      for (let i = 0; i < 7; i++) { const q0 = torr(cx + (i - 3) * 0.5, cz + 0.7 + (i % 2) * 0.3, st); folk(q0[0], q0[1], i % 3 ? 'borgare' : 'kvinna', { ang: Math.PI }); }
      return { kam(f) { return { x: cx, z: cz - 1.3, d: mix(11, 8, mjuk(f)), p: mix(13, 17, f), y: mix(-30, -14, f), h: 0.7 }; } };
    } },
    { glanta: 1, sek: 4.4, sasong: 0.965, el: 9, varm: 0.4, plats: 'Dalarna · vintern 1520', rad: 'Gustav Eriksson söker hjälp i Dalarna.', musik: 'krig', in: 0.2, svartFore: 1.0, bygg() {
      const r0 = R.P.rattvik, mo = R.P.mora, l = R.path('rattvik', 'mora'), L0 = R.length(l), g = hjalte('gustav');
      let d = L0 * 0.35; Fx.sno = true;
      return { steg(dt) { d = Math.min(L0, d + dt * 1.6); const a = R.along(l, d); g.place(a.x, a.z, a.ang, 0.9, tid, dt, false); T._fri = [[a.x, a.z, 1.1]]; },
        kam(f) { const a = R.along(l, d); return { x: a.x, z: a.z, d: mix(6.5, 8.5, f), p: mix(10, 15, f), y: grader(a.ang) + mix(130, 110, f), h: 0.4 }; } };
    } },
    { sek: 3.9, sasong: 0.47, el: 16, varm: 0.35, plats: 'Stockholm · midsommarafton 1523', rad: 'Staden öppnar portarna för Gustav.', in: 0.15, slag: 1, bygg() {
      const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 };
      let vag = null, bz = -1e9; for (const l of R.vagarVid('stockholm')) { const q0 = l.find(q1 => Math.hypot(q1[0] - p.x, q1[1] - p.z) > 9) || l[l.length - 1]; if (q0[1] > bz) { bz = q0[1]; vag = l; } }
      const ut = (vag || [[p.x, p.z], [p.x, p.z + 10]]).filter(q1 => Math.hypot(q1[0] - p.x, q1[1] - p.z) < 11).reverse(), mal = [p.x + T.x * K, p.z + T.z * K], pts = ut.concat([mal]), L0 = R.length(pts);
      for (let s = L0 * 0.35; s < L0 - 0.8; s += 0.5) { const a = R.along(pts, s); for (const sd of [-1, 1]) { const x = a.x + Math.cos(a.ang) * 0.36 * sd, z = a.z - Math.sin(a.ang) * 0.36 * sd; if (Geo.sdAt(x, z) > 0.4 && !V.Filmstad.iHus(st, x, z)) folk(x, z, (s * 7 | 0) % 4 === 3 ? 'kvinna' : 'borgare', { ang: a.ang + sd * 1.571 }); } }
      const g = hjalte('gustav', 'Riksföreståndare'); let d = L0 * 0.42;          // vald till kung, men ännu inte krönt (det blir han 1528)
      return { steg(dt) { d = Math.min(L0 - 0.5, d + dt * 1.1); const a = R.along(pts, d); g.place(a.x, a.z, a.ang, 0.5, tid, dt, false, false); T._fri = [[a.x, a.z, 1.1]]; temp.forEach((u, i) => { u.y = Math.abs(Math.sin(tid * 6 + i * 1.3)) * 0.07; }); },
        kam(f) { const a = R.along(pts, d); return { x: a.x, z: a.z, d: mix(8.5, 7.5, f), p: mix(21, 25, f), y: grader(a.ang) + 20, h: 1.0 }; } };
    } },
    { sek: 3.6, sasong: 0.47, el: 15, varm: 0.35, plats: 'Uppsala · juni 1561', rad: 'Erik XIV kröns med en ny krona.', in: 0.15, slag: 1, bygg() {
      // samma väg som i spelets kröningsscen (intro.js kroning): från slottet längs gatorna till domkyrkan, och klippet visar sista biten
      const p = R.P.uppsala, K = B.K, S = V.Filmstad.stad('uppsala'), bo = S && S.borg ? S.borg : [p.x + 2.4 * K, p.z - 1.5 * K], dm = S && S.dom ? S.dom : [p.x - 0.9 * K, p.z - 1.9 * K], ds = S ? S.domSkala : 0.72;
      const a0 = [bo[0], bo[1] + 1.0 * K], b0 = [dm[0] + 0.3 * ds * K, dm[1] + 1.1 * ds * K + 0.75], a = S ? S.narmast(a0[0], a0[1]) : a0, b = S ? S.narmast(b0[0], b0[1]) : b0;
      const hel = S ? S.vag(a, b) : [a, b], LH = R.length(hel), d0 = Math.max(0, LH - 3.4), vag = [];
      for (let s = d0; s <= LH + 1e-6; s += 0.1) { const q0 = R.along(hel, Math.min(s, LH)); vag.push([q0.x, q0.z]); }
      const L0 = R.length(vag);
      { const mb = new V.MB(); mb.snow = 0; for (let i = 1; i < vag.length; i++) { const q0 = vag[i - 1], r = vag[i], l = Math.hypot(r[0] - q0[0], r[1] - q0[1]); if (l < 1e-3) continue; mb.push().move((q0[0] + r[0]) / 2, Geo.groundAt((q0[0] + r[0]) / 2, (q0[1] + r[1]) / 2) + 0.015, (q0[1] + r[1]) / 2).rotY(Math.atan2(r[0] - q0[0], r[1] - q0[1])); mb.box(0, 0, 0, 0.34, 0.02, l + 0.06, '#b3262a', { low: '#8a1f24' }); mb.pop(); } lagg(B.mesh(mb)); }
      for (let s = 0.5; s < L0 - 0.4; s += 0.7) { const q0 = R.along(vag, s); for (const sd of [-1, 1]) { const x = q0.x + Math.cos(q0.ang) * 0.42 * sd, z = q0.z - Math.sin(q0.ang) * 0.42 * sd; if (!S || S.ledig(x, z)) folk(x, z, 'knekt', { pike: true, ang: q0.ang - sd * 1.571 }); } }
      const e = hjalte('erik', 'Hertig'); let d = 0.2;          // han går till kröningen i hertigens dräkt
      return { steg(dt) { d = Math.min(L0 - 0.5, d + dt * 0.5); const q0 = R.along(vag, d); e.place(q0.x, q0.z, q0.ang, 0.6, tid, dt, false, true); },
        kam(f) { const q0 = R.along(vag, d); return { x: q0.x, z: q0.z, d: mix(9, 7.6, f), p: mix(28, 32, f), y: mix(40, 22, f), h: 0.5 }; } };
    } },
    { sek: 3.0, sasong: 0.7, el: 12, varm: 0.5, plats: 'Stockholm · september 1568', rad: 'Bröder mot bror.', in: 0.12, slag: 1.15, bygg() {
      const p = R.P.stockholm, ax = p.x - 0.5, az = p.z + 6.5, rad = [];
      for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const q0 = torr(ax + (i - 4) * 0.46 + (r % 2) * 0.2, az + r * 0.45); rad.push(folk(q0[0], q0[1], 'knekt', { pike: (i + r) % 3 !== 1, ang: Math.PI, gar: true })); }
      const jo = hjalte('johan', 'Hertig'), ka = hjalte('karl', 'Hertig'), j0 = torr(ax - 0.7, az - 0.8), k0 = torr(ax + 0.7, az - 0.8);
      return { steg(dt, f) { rad.forEach(u => { u.z -= dt * 0.25; }); jo.place(j0[0], j0[1] - f * 0.75, Math.PI, 0.35, tid, dt, false, false); ka.place(k0[0], k0[1] - f * 0.75, Math.PI, 0.35, tid, dt, false, false); },
        kam(f) { return { x: ax, z: mix(az - 2.2, az - 3.2, f), d: mix(9, 13, f), p: mix(9, 15, f), y: mix(8, -6, f), h: 0.8 }; } };
    } },
    { glanta: 1, sek: 3.0, sasong: 0.72, el: 12, varm: 0.55, plats: 'Stångebro · september 1598', rad: 'Farbror mot brorson.', in: 0.12, slag: 1.3, bygg() {
      const p = R.P.linkoping, st = V.Varld.tomt && V.Varld.tomt.linkoping, mx = p.x + 2.2, mz = p.z + 1.6, A = [], Bs = [], ga = (u, dx) => { if (!(st && V.Filmstad.iHus(st, u.x + dx, u.z, 0.12))) u.x += dx; };          // ingen går in i ett hus
      for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) { const qa = torr(mx - 2.6 - r * 0.42, mz + (i - 3.5) * 0.42, st); A.push(folk(qa[0], qa[1], 'knekt', { pike: (i + r) % 3 !== 1, ang: Math.PI / 2, gar: true, col: '#3f6fa8', col2: '#e8c040' })); const qb = torr(mx + 2.6 + r * 0.42, mz + (i - 3.5) * 0.42, st); Bs.push(folk(qb[0], qb[1], 'knekt', { pike: (i + r) % 3 !== 1, ang: -Math.PI / 2, gar: true, col: '#8a1f2a', col2: '#f0e6c8' })); }
      const ka = hjalte('karl', 'Hertig'), si = hjalte('sigismund', 'Kung'), kq = torr(mx - 3.9, mz, st), sq = torr(mx + 3.9, mz, st); let krut = 0; T._fri = [[mx - 4.8, mz, mx + 4.8, mz, -5.2]];          // fältet vid ån, där båda leden står
      return { steg(dt, f) {
          A.forEach(u => ga(u, dt * 0.55)); Bs.forEach(u => ga(u, -dt * 0.55)); ka.place(kq[0] + f * 1.2, kq[1], Math.PI / 2, 0.6, tid, dt, false, false); si.place(sq[0] - f * 1.2, sq[1], -Math.PI / 2, 0.6, tid, dt, false, false);
          krut -= dt; if (krut <= 0) { krut = 0.32; const u = (Math.random() < 0.5 ? A : Bs)[Math.floor(Math.random() * 24)]; if (u) Fx.krut(u.x, Geo.groundAt(u.x, u.z) + 0.45, u.z); }
        },
        kam(f) { return { x: mx, z: mz, d: mix(13, 10, f), p: mix(13, 10, f), y: mix(-22, -8, f), h: 0.5 }; } };
    } },
    { sek: 3.6, sasong: 0.47, el: 9, varm: 0.7, klimax: true, in: 0.12, slag: 1.4, bygg() {
      // kronan på en hög fot sydväst om domkyrkan: solen lyser på den från kamerans håll, och kyrkan står bakom den
      const p = R.P.uppsala, K = B.K, S = V.Filmstad.stad('uppsala'), dm = S && S.dom ? S.dom : [p.x - 0.9 * K, p.z - 1.9 * K];
      let q0 = null; for (const [dx, dz] of [[-4, 4], [-4.5, 4.5], [-5, 3], [-4, 5]]) { const c = [dm[0] + dx, dm[1] + dz]; if (!S || (S.ledig(c[0], c[1]) && S.ledig(c[0] - 2, c[1] + 2) && S.ledig(c[0] - 3, c[1] + 2.5))) { q0 = c; break; } }
      if (!q0) q0 = torr(dm[0] - 4, dm[1] + 4); const gy = Geo.groundAt(q0[0], q0[1]);
      const H = 1.05, fot = new V.MB(); fot.snow = 0; fot.box(0, 0, 0, 0.52, H, 0.52, '#6b5a48', { low: '#4a3e32' }); fot.box(0, H, 0, 0.6, 0.06, 0.6, '#7a6854'); fot.box(0, H + 0.06, 0, 0.42, 0.08, 0.42, '#8a1f2a', { low: '#6a1620' }); const fm = lagg(B.mesh(fot)); fm.position.set(q0[0], gy, q0[1]);
      const kr = lagg(kronMesh()); kr.scale.setScalar(3.6); const ky = gy + H + 0.14; kr.position.set(q0[0], ky, q0[1]); let gl = 0;
      return { steg(dt, f) { kr.rotation.y += dt * 0.45; gl -= dt; if (gl <= 0) { gl = 0.18 - f * 0.12; Fx.guld(q0[0], ky + 0.3, q0[1], 6, 0.3 + f * 0.25); } },
        kam(f) { const e = mjuk(f); return { x: q0[0], z: q0[1], d: mix(3.4, 1.9, e), p: mix(-7, 3, e), y: mix(-62, -30, f), h: H + mix(0.3, 0.32, e) }; } };
    } }
  ];

  // ---- ljud --------------------------------------------------------------------------------------------
  const ac = () => { const a = V.Ljud && V.Ljud.ac; return a && a.state === 'running' ? a : null; };
  function slag(s) { const a = ac(), L = V.Ljud; if (!a) return; const t = a.currentTime; L.ton(55, t, 1.5, 'sine', 0.34 * s, 32); L.ton(110, t, 0.35, 'triangle', 0.08 * s, 70); L.sus(t, 0.5, 520, 80, 0.07 * s, 0.7); L.klockton(110, t + 0.01, 0.07 * s, 3.5); }
  function klocka() { const a = ac(); if (!a) return; V.Ljud.klockton(98, a.currentTime, 0.26, 6); V.Ljud.ton(49, a.currentTime, 2.5, 'sine', 0.2, 40); }
  function stiger(sek) { const a = ac(), L = V.Ljud; if (!a) return; const t = a.currentTime; L.sus(t, sek, 180, 4800, 0.09, 1.2); L.ton(110, t, sek, 'sawtooth', 0.022, 440); L.ton(165, t, sek, 'sine', 0.05, 660); }
  function klimax() { const a = ac(), L = V.Ljud; if (!a) return; const t = a.currentTime; slag(1.7); [147, 220, 294, 440].forEach((f, i) => L.klockton(f, t + i * 0.012, [0.3, 0.2, 0.15, 0.08][i], 7)); L.ton(1760, t, 2.4, 'triangle', 0.02, 1760); }
  const musikPa = () => { const S = V.Game.s; return S.ljud !== false && S.musik !== false; };

  // ---- sidan -------------------------------------------------------------------------------------------
  const KRONA = '<svg viewBox="0 0 120 92" aria-hidden="true"><defs><linearGradient id="tk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".45" stop-color="#eec24a"/><stop offset="1" stop-color="#a5701c"/></linearGradient></defs>' +
    '<g stroke="#4a3008" stroke-width="2.6" stroke-linejoin="round" fill="url(#tk-g)">' +
    '<path d="M18 66 C 22 40, 40 26, 60 24 C 80 26, 98 40, 102 66 Z" fill="#7a1f2a"/>' +
    '<path d="M60 24 C 52 34, 50 52, 52 66 L 58 66 C 57 52, 58 36, 60 24 Z"/><path d="M60 24 C 68 34, 70 52, 68 66 L 62 66 C 63 52, 62 36, 60 24 Z"/>' +
    '<path d="M22 66 C 24 46, 40 30, 60 26 C 46 34, 34 48, 30 66 Z"/><path d="M98 66 C 96 46, 80 30, 60 26 C 74 34, 86 48, 90 66 Z"/>' +
    '<circle cx="60" cy="17" r="7" fill="#2f5aa8"/><path d="M57 2 h6 v5 h5 v5 h-5 v1 h-6 v-1 h-5 v-5 h5 Z"/>' +
    '<path d="M12 64 L 18 54 L 24 64 L 34 52 L 42 64 L 52 52 L 60 62 L 68 52 L 78 64 L 86 52 L 96 64 L 102 54 L 108 64 Z"/>' +
    '<rect x="10" y="64" width="100" height="16" rx="3"/></g>' +
    '<g stroke="#4a3008" stroke-width="1.6"><circle cx="30" cy="72" r="3.6" fill="#b3262a"/><circle cx="50" cy="72" r="3.6" fill="#2f5aa8"/><circle cx="70" cy="72" r="3.6" fill="#b3262a"/><circle cx="90" cy="72" r="3.6" fill="#2f5aa8"/></g></svg>';
  function sida() {
    if (E) return E; const r = document.createElement('div'); r.id = 'titel';
    r.innerHTML = '<div class="t-moln"></div><div class="t-vinj"></div><div class="t-svart"></div><div class="t-vitt"></div><div class="t-rand upp"></div><div class="t-rand ner"></div>' +
      '<div class="t-plats"></div><div class="t-rad"></div>' +
      '<div class="t-logo"><div class="t-krona">' + KRONA + '</div><h1>Kronan</h1><div class="t-orn"><i></i><b>✦</b><i></i></div><div class="t-under">Sveriges regenter</div></div>' +
      '<button class="t-borja">Börja</button><button class="t-hoppa">Hoppa över ▸▸</button>' +
      '<div class="t-port"><div class="t-krona liten">' + KRONA + '</div><div class="t-tryck">Tryck för att börja</div></div>';
    document.body.appendChild(r);
    const $ = s => r.querySelector(s);
    E = { r, plats: $('.t-plats'), rad: $('.t-rad'), svart: $('.t-svart'), vitt: $('.t-vitt'), logo: $('.t-logo'), borja: $('.t-borja'), hoppa: $('.t-hoppa'), port: $('.t-port') };
    E.borja.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); T.borja(); });
    E.hoppa.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); T.hoppa(); });
    E.port.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); T._starta(); });
    return E;
  }
  const svart = (a, sek) => { E.svart.style.transition = 'opacity ' + sek + 's'; E.svart.style.opacity = a; };
  const vitt = (a, sek) => { E.vitt.style.transition = 'opacity ' + sek + 's'; E.vitt.style.opacity = a; };
  const visa = (e, on) => e.classList.toggle('syns', !!on);
  function tangent(ev) {
    if (fas === 'av') return;
    const k = ev.code; if (!(k === 'Space' || k === 'Enter' || k === 'Escape' || k === 'NumpadEnter')) return;
    ev.preventDefault(); ev.stopImmediatePropagation(); if (ev.repeat) return;
    if (fas === 'port') T._starta(); else if (fas === 'film' && k !== 'Space') T.hoppa(); else if (fas === 'meny' && k !== 'Escape') T.borja();
  }

  // ---- trailerns gång ------------------------------------------------------------------------------------
  function nastaKlipp() {
    rensa(); nr++; const k = KLIPP[nr]; if (!k) { slutFilm(); return; }
    ljus(k.sasong, k.el, k.varm); Fx.sno = true; klipp = k.bygg(); kT = 0; k._ut = false;
    if (k.musik && V.Musik) V.Musik.spar(k.musik);
    if (k.slag) slag(k.slag);
    if (k.klimax) { stiger(k.sek + 0.1); if (V.Musik) V.Musik.satt(false); E.r.classList.add('klimax'); }
    if (klipp.steg) klipp.steg(0.016, 0); kam = klipp.kam(0);
    svart(0, k.in || 0.15); visa(E.plats, false); visa(E.rad, false);
    if (k.plats) setTimeout(() => { if (KLIPP[nr] === k && fas === 'film') { E.plats.textContent = k.plats; visa(E.plats, true); } }, (k.in > 0.5 ? 500 : 120));
    if (k.rad) setTimeout(() => { if (KLIPP[nr] === k && fas === 'film') { E.rad.textContent = k.rad; visa(E.rad, true); } }, (k.in > 0.5 ? 1100 : 380));
  }
  function slutFilm() {
    // klimax: ett vitt ljus, ett slag, svart, och sedan titeln
    klimax(); vitt(1, 0.12); setTimeout(() => { svart(1, 0); vitt(0, 0.9); E.r.classList.remove('klimax'); }, 160);
    rensa(); kam = null; fas = 'paus'; setTimeout(() => menyn(false), 1500);
  }
  // Titelskärmen: Stockholm vintern 1512, där spelet börjar. Kameran glider sakta runt staden.
  function titelKam(t) { const p = R.P.stockholm; return { x: p.x + 0.6, z: p.z - 0.4, d: 40 - Math.min(6, t * 0.12), p: 17, y: 146 - t * 0.6, h: 0 }; }
  function menyn(snabbt) {
    rensa(); fas = 'meny'; menyT = 0; nr = KLIPP.length; ljus(sasong0, 12, 0.45); Fx.sno = true; kam = titelKam(0);
    E.r.classList.remove('film'); E.r.classList.add('meny'); visa(E.plats, false); visa(E.rad, false); visa(E.hoppa, false);
    if (V.Musik) { V.Musik.satt(musikPa()); V.Musik.spar('titel'); }
    svart(0, snabbt ? 1.2 : 2.6); setTimeout(() => visa(E.logo, true), snabbt ? 200 : 700); setTimeout(() => { if (fas === 'meny') visa(E.borja, true); }, snabbt ? 1600 : 3000);
  }

  const T = V.Titel = {
    aktiv() { return fas !== 'av'; },
    // klar() körs när spelaren har tryckt på Börja och kameran har landat där spelet börjar
    kor(klar) {
      klarFn = klar; sida(); fas = 'port'; tid = 0; nr = -1; sasong0 = World.season.t;          // årstiden där spelet börjar (main.js har redan ställt in den)
      const UI = V.UI; UI.visa(false); Scene.cam.locked = true; V.Varld.scenDolj(true); himmel(true); spar = { fri: Scene.cam.fri };
      window.addEventListener('keydown', tangent, true);
      if (q.has('titelmeny')) { svart(1, 0); E.port.style.display = 'none'; V.Ljud.vakna(); menyn(true); return; }          // ?titelmeny: direkt till titelskärmen (för prov)
      // webbläsaren släpper inte fram ljud förrän man har tryckt någonstans: då kommer en lugn fråga först (inte i en app där ljudet redan får spelas)
      if (ljudFritt()) T._starta(); else { E.port.classList.add('syns'); }
    },
    _starta() {
      if (fas !== 'port') return; fas = 'film'; E.port.classList.remove('syns'); E.port.style.display = 'none';
      if (V.Musik) { V.Musik.satt(musikPa()); V.Musik.spar(KLIPP[0].musik); } V.Ljud.vakna();
      E.r.classList.add('film'); visa(E.hoppa, true); svart(1, 0); tid = 0; nr = -1; setTimeout(() => { if (fas === 'film') nastaKlipp(); }, 900);
    },
    hoppa() {
      if (fas !== 'film') return; fas = 'paus'; svart(1, 0.3); visa(E.plats, false); visa(E.rad, false); visa(E.hoppa, false); E.r.classList.remove('klimax');
      setTimeout(() => { rensa(); kam = null; menyn(true); }, 350);
    },
    borja() {
      if (fas !== 'meny') return; fas = 'svep'; visa(E.logo, false); visa(E.borja, false); E.r.classList.remove('meny'); V.Ljud.vakna();
      if (V.Musik) V.Musik.spar(V.Musik.grund());
      // kameran sveper ner till där spelet börjar, och ljuset blir spelets eget
      const p = V.Varld.pos(V.DATA.VARLDAR[0].hem), d1 = 34, mal = { x: p.x, z: p.z + 1.5, d: d1, p: 40 + 24 * Geo.smooth(14, 320, d1), y: 0, h: 0 };
      svep = { fran: Object.assign({}, kam), mal, t: 0, dur: 2.6, s0: sasong0 };
    },
    update(dt) {
      if (fas === 'av') return; tid += dt;
      if (fas === 'film' && klipp) {
        const k = KLIPP[nr]; kT += dt; const f = Math.min(1, kT / k.sek);
        if (klipp.steg) klipp.steg(dt, f); kam = klipp.kam(f); if (T._over) kam = Object.assign(kam, T._over);
        // gläntor i skogen: kring dem som rör sig, och en bred gata från det kameran tittar på ända fram till kameran (krymp-kapslar, se world.js)
        const fl = (T._fri || []).slice(0, 8).map(g => g.length === 5 ? g : [g[0], g[1], g[0], g[1], -g[2]]);
        if (k.glanta) { const dd = kam.d * (Scene.cam.k || 1) * Math.cos(kam.p * RAD), cx = kam.x + dd * Math.sin(kam.y * RAD), cz = kam.z + dd * Math.cos(kam.y * RAD), r = Math.max(2.4, kam.d * (Scene.cam.k || 1) * 0.42);
          fl.push([kam.x, kam.z, cx, cz, -r], [mix(kam.x, cx, 0.7), mix(kam.z, cz, 0.7), cx, cz, -r * 1.6]); }
        T._kaps = fl.length ? fl : null;
        if (!k._ut && kT > k.sek - 0.3) { k._ut = true; visa(E.plats, false); visa(E.rad, false); if (!k.klimax) svart(1, k.svartFore ? 0.35 : 0.12); if (k.ut === 'klocka') klocka(); }
        if (kT >= k.sek + (k.svartFore ? 0 : 0) && !k.klimax) { const n = KLIPP[nr + 1]; if (!(n && n.svartFore) || kT >= k.sek + n.svartFore) nastaKlipp(); }
        else if (k.klimax && kT >= k.sek) slutFilm();
      }
      if (fas === 'meny') { menyT += dt; kam = titelKam(menyT); T._liv(dt); }
      if (fas === 'svep' && svep) {
        svep.t += dt; const e = mjuk(Math.min(1, svep.t / svep.dur)), a = svep.fran, b = svep.mal; let dy = b.y - a.y; while (dy > 180) dy -= 360; while (dy < -180) dy += 360;
        kam = { x: mix(a.x, b.x, e), z: mix(a.z, b.z, e), d: Math.exp(mix(Math.log(a.d), Math.log(b.d), e)), p: mix(a.p, b.p, e), y: a.y + dy * e, h: mix(a.h || 0, 0, e) };
        ljus(svep.s0, mix(12, 90, e), 0.45 * (1 - e)); T._liv(dt);
        if (svep.t >= svep.dur) T._klar();
      }
    },
    // livet i staden bakom titeln: folk som går och rök ur skorstenarna
    _liv(dt) {
      if (V.Varld._folk) { try { V.Varld._folk(dt, tid); } catch (e) { /* bara utsmyckning */ } }
      T._rokT = (T._rokT || 0) + dt; if (T._rokT > 0.25) { T._rokT = 0; const c = Scene.cam; for (const s of B.smoke) { if (Math.abs(s.x - c.x) > c.d * 1.2 + 10 || Math.abs(s.z - c.z) > c.d + 10 || s.slag === 'eld' || Math.random() < 0.4) continue; Fx.rok(s.x, s.y, s.z, false); } }
    },
    _klar() {
      fas = 'av'; svep = null; kam = null; rensa(); himmel(false); Scene.cam.fri = spar ? spar.fri : false; V.Varld.scenDolj(false);
      window.removeEventListener('keydown', tangent, true); if (E) { E.r.remove(); E = null; }
      const k = klarFn; klarFn = null; if (k) k();
    },
    // för prov och skärmbilder: V.Titel.prov(3, 1.5) visar klipp 3 efter 1,5 sekunder
    prov(i, sek) { sida(); fas = 'film'; E.port.style.display = 'none'; E.r.classList.add('film'); V.UI.visa(false); himmel(true); nr = i - 1; nastaKlipp(); svart(0, 0); for (let s = 0; s < sek; s += 0.05) T.update(0.05); }
  };
  function ljudFritt() {
    const a = V.Ljud && V.Ljud.ac; if (a) return a.state === 'running';
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return true; const x = new C(), ok = x.state === 'running'; x.close(); return ok; } catch (e) { return true; }
  }
  // spelets ruta för bild körs varje bildruta medan titeln visas (main.js anropar Intro.update när spelet inte är igång)
  if (V.Intro) { const u0 = V.Intro.update; V.Intro.update = function (dt, t) { T.update(dt); return u0.call(V.Intro, dt, t); }; }
})();
