// Kända byggnader: varje ort får sina egna slott och kyrkor, så som de såg ut på 1500-talet, så att man känner igen dem.
// Samma klossiga stil och färger som resten av husen (bygge.js). Källor och förenklingar står i docs/historia.md under "Kända byggnader".
// Byggnaderna följer året: Tre Kronor får sin spira med kronorna 1588, Kalmar sina runda hörntorn från 1535 och så vidare.
// Kopplingen: bygge.js frågar V.Kanda först i borg(), domkyrka() och kyrka(). Vilken ort som byggs sätts här genom att Bygge.steg
// och Varld._dekor lindas in, så att bygge.js och varld.js bara behöver en rad var.
(function () {
  'use strict';
  const V = window.VASA, B = V.Bygge, MB = V.MB;

  // ---- färger (samma familj som bygge.js) ----
  const STEN = '#aba395', STENL = '#6a655d', KALK = '#c4bdab', KALKL = '#827c70', TEGEL = '#a1503a', TEGELL = '#733526';
  const TAK = '#4a3e34', TAKL = '#372e28', KOPPAR = '#52635f', KOPPARL = '#3f4d4a', KOPPARR = '#6d807b', GULD = '#e8c040', VIT = '#e6dfce', VITL = '#bfb7a5';

  // Året då världen står: året för det senaste steget. Byggnaderna ritas om när världen laddas.
  function ar() { if (K.arTest) return K.arTest; try { return V.kalender ? V.kalender().ar : 1540; } catch (e) { return 1540; } }

  // ---- små byggstenar ----
  function fon(mb, x, y, z, w, h) { w = w || 0.05; h = h || w * 1.8; mb.quad([x - w / 2, y, z], [x + w / 2, y, z], [x + w / 2, y + h, z], [x - w / 2, y + h, z], '#2f3a44', null, 0); }
  function slits(mb, x, z, r, h) { for (const y of [0.35, 0.62, 0.85]) if (y * h < h - 0.15) fon(mb, x, y * h, z + r + 0.004, 0.03, 0.1); }
  function port(mb, x, z, w, h) { mb.quad([x - w / 2, 0, z], [x + w / 2, 0, z], [x + w / 2, h * 0.72, z], [x - w / 2, h * 0.72, z], '#2a2018', '#3a2c20', 0); mb.tri([x - w / 2, h * 0.72, z], [x + w / 2, h * 0.72, z], [x, h, z], '#3a2c20', 0); }
  function mur(mb, x0, z0, x1, z1, h, c, lo) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), a = Math.atan2(-dz, dx);
    mb.push().move((x0 + x1) / 2, 0, (z0 + z1) / 2).rotY(a); mb.box(0, 0, 0, L, h, 0.16, c, { low: lo });
    for (let k = 0; k < Math.floor(L / 0.22); k++) mb.box(-L / 2 + 0.11 + k * 0.22, h, 0.05, 0.1, 0.09, 0.06, c, { low: c });
    mb.pop();
  }
  // Runt torn. tak: 'kon' (spetsig huv), 'huv' (renässanshuv med lanternin), 'platt' (bara krenelering), eller inget.
  function runt(mb, x, z, r, h, c, lo, tak, takc) {
    mb.cyl(x, 0, z, r, r * 0.95, h, 12, c, { low: lo }); slits(mb, x, z, r * 0.95, h);
    mb.cyl(x, h, z, r * 1.08, r * 1.08, 0.1, 12, c, { low: lo });
    if (tak === 'kon') mb.cone(x, h + 0.1, z, r * 1.12, r * 1.45, 12, takc || TAK, { low: TAKL });
    else if (tak === 'huv') { mb.blob(x, h + 0.1, z, r * 1.05, r * 0.62, r * 1.05, takc || KOPPAR, { top: KOPPARR, low: KOPPARL, snow: 0.8 }); mb.cyl(x, h + 0.1 + r * 0.55, z, r * 0.22, r * 0.2, r * 0.35, 6, takc || KOPPAR); mb.cone(x, h + 0.1 + r * 0.9, z, r * 0.24, r * 0.75, 6, takc || KOPPAR, { low: KOPPARL }); }
    else if (tak === 'platt') for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; mb.box(x + Math.cos(a) * r, h + 0.1, z + Math.sin(a) * r, 0.09, 0.09, 0.09, c, { low: c }); }
  }
  // Fyrkantigt torn med tälttak, eller med spira (spets > 0: hur hög spiran är).
  function fyr(mb, x, z, w, h, c, lo, takc, spets) {
    mb.box(x, 0, z, w, h, w, c, { low: lo, noTop: true }); fon(mb, x, h * 0.55, z + w / 2 + 0.005, 0.045); fon(mb, x, h * 0.8, z + w / 2 + 0.005, 0.04);
    if (spets) { mb.hip(x, h, z, w, w * 0.25, w, takc || TAK, 0.04); mb.cone(x, h + w * 0.2, z, w * 0.32, spets, 8, takc || TAK, { low: TAKL }); }
    else mb.hip(x, h, z, w, w * 0.8, w, takc || TAK, 0.05);
  }
  // En slottslänga eller ett kyrkskepp: låda med sadeltak. rot: nocken går längs z i stället för x.
  function langa(mb, x, z, w, h, d, c, lo, takc, opt) {
    opt = opt || {}; mb.push().move(x, 0, z); if (opt.rot) mb.rotY(Math.PI / 2);
    mb.box(0, 0, 0, w, h, d, c, { low: lo, noTop: true }); mb.gable(0, h, 0, w, opt.th || d * 0.62, d, takc || TAK, { over: 0.04, gable: c, ridge: opt.ridge || takc || TAK });
    if (opt.fon !== false) for (let k = 0; k < Math.floor(w / 0.32); k++) { const fx = -w / 2 + 0.2 + k * 0.32; fon(mb, fx, h * 0.55, d / 2 + 0.005, 0.045); if (h > 0.8) fon(mb, fx, h * 0.2, d / 2 + 0.005, 0.04); }
    if (opt.trapp) for (const s of [-1, 1]) trapp(mb, s * w / 2, h, d, opt.th || d * 0.62, c);
    mb.pop();
  }
  // Trappgavel (renässans): trappsteg längs gavelns kanter.
  function trapp(mb, x, y, d, th, c) {
    for (let i = 0; i <= 3; i++) { const f = i / 4, zz = (d / 2) * (1 - f); for (const s of [-1, 1]) mb.box(x, y + th * f - 0.02, s * zz, 0.07, 0.1, 0.08, c, { low: c }); }
    mb.box(x, y + th - 0.02, 0, 0.08, 0.14, 0.08, c, { low: c });
  }
  // Krona av guld: en ring och fem uddar.
  function krona(mb, x, y, z, r) {
    mb.cyl(x, y, z, r, r * 1.05, r * 0.5, 10, GULD, { low: '#b8902a' });
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; mb.cone(x + Math.cos(a) * r * 0.85, y + r * 0.5, z + Math.sin(a) * r * 0.85, r * 0.2, r * 0.55, 4, GULD, { low: '#b8902a', snowLow: 0, snowTip: 0 }); }
  }

  // =====================================================================================
  // Stockholms slott (Tre Kronor). Mitt i borgen det runda kärntornet (kastalen) från 1200-talet, ungefär 15 m brett och 25 m högt.
  // Gustav Vasa lät bygga en ny yttre mur i tegel med vallgrav och porthus 1536–1547 och höjde tornet på 1540-talet.
  // Sydöstra tornet byggdes 1556. Johan III höjde kärntornet igen och satte 1588 upp tre förgyllda kronor på spiran: därav namnet.
  function treKronor(mb, Y) {
    const tegel = Y >= 1536, mc = tegel ? TEGEL : STEN, ml = tegel ? TEGELL : STENL;
    // yttre muren, med öppning för porten framtill
    mur(mb, -1.75, -1.25, 1.75, -1.25, 0.62, mc, ml); mur(mb, -1.75, -1.25, -1.75, 1.25, 0.62, mc, ml); mur(mb, 1.75, -1.25, 1.75, 1.25, 0.62, mc, ml);
    mur(mb, -1.75, 1.25, -0.98, 1.25, 0.62, mc, ml); mur(mb, -0.42, 1.25, 1.75, 1.25, 0.62, mc, ml);
    if (tegel) { for (const [x, z] of [[-1.75, -1.25], [1.75, -1.25], [-1.75, 1.25], [1.75, 1.25]]) runt(mb, x, z, 0.3, 0.78, TEGEL, TEGELL, 'kon'); fyr(mb, -0.7, 1.25, 0.56, 1.05, TEGEL, TEGELL); port(mb, -0.7, 1.534, 0.26, 0.38); }          // porthuset
    else { for (const [x, z] of [[-1.75, -1.25], [1.75, -1.25], [-1.75, 1.25], [1.75, 1.25]]) fyr(mb, x, z, 0.42, 0.9, STEN, STENL); port(mb, -0.7, 1.26, 0.3, 0.4); }
    // högborgens längor kring en trång gård
    const j3 = Y >= 1575;          // Johan III:s renässansgavlar
    langa(mb, 0.15, -0.82, 2.9, 1.15, 0.6, STEN, STENL, TAK, { trapp: j3 });
    langa(mb, -1.22, -0.05, 1.3, 1.0, 0.56, STEN, STENL, TAK, { rot: 1, trapp: j3 });
    langa(mb, 1.35, -0.1, 1.2, 1.05, 0.56, STEN, STENL, TAK, { rot: 1, trapp: j3 });
    langa(mb, 0.55, 0.62, 1.4, 0.72, 0.42, STEN, STENL, TAK, {});
    if (Y >= 1556) fyr(mb, 1.38, 0.62, 0.56, 1.6, STEN, STENL, Y >= 1575 ? KOPPAR : TAK, Y >= 1575 ? 0.55 : 0);          // sydöstra tornet
    if (j3) { mb.cyl(0.95, 1.15 + 0.3, -0.82, 0.1, 0.09, 0.28, 6, STEN); mb.cone(0.95, 1.73, -0.82, 0.13, 0.5, 6, KOPPAR, { low: KOPPARL }); }          // takryttare på norra längan
    // kärntornet
    const x = 0.05, z = -0.12, r = 0.58, h = Y < 1544 ? 2.0 : Y < 1585 ? 2.5 : 2.95;
    mb.cyl(x, 0, z, r, r * 0.94, h, 14, '#b0a899', { low: STENL });
    for (let y = 0.45; y < h - 0.2; y += 0.42) { fon(mb, x, y, z + r * 0.96 + 0.004, 0.05, 0.09); fon(mb, x + r * 0.55, y + 0.1, z + r * 0.78, 0.04, 0.08); }
    mb.cyl(x, h, z, r * 1.08, r * 1.08, 0.14, 14, '#b0a899', { low: '#8a8479' });
    let top;
    if (Y < 1588) { mb.cone(x, h + 0.14, z, r * 1.08, 0.8, 14, TAK, { low: TAKL }); top = h + 0.9; }
    else {
      // lanternin, huv och den höga spiran med de tre kronorna
      mb.cone(x, h + 0.14, z, r * 1.08, 0.42, 14, KOPPAR, { low: KOPPARL });
      mb.cyl(x, h + 0.42, z, 0.24, 0.22, 0.42, 8, '#b0a899', { low: STENL }); for (let k = 0; k < 4; k++) { const a = k / 4 * 6.283 + 0.4; fon(mb, x + Math.cos(a) * 0.235, h + 0.52, z + Math.sin(a) * 0.235, 0.05, 0.14); }
      mb.blob(x, h + 0.86, z, 0.28, 0.2, 0.28, KOPPAR, { top: KOPPARR, low: KOPPARL, snow: 0.6 });
      mb.cone(x, h + 0.95, z, 0.1, 1.5, 8, KOPPAR, { low: KOPPARL, snowTip: 0 });
      krona(mb, x, h + 1.08, z, 0.17); krona(mb, x, h + 1.42, z, 0.14); krona(mb, x, h + 1.74, z, 0.115);
      top = h + 2.45;
    }
    K._flagga = [x + r * 0.85, h + 0.35, z + 0.1];          // fanan på kärntornets krön
    return top;
  }

  // =====================================================================================
  // Kalmar slott. En medeltida borg med längor kring en gård och ett kärntorn i mitten.
  // Från 1535 byggdes runda hörntorn (rondeller) på udden; kärntornet revs 1555–1559 när Erik och Johan gjorde om borgen
  // till renässansslott, och tornen fick huvar med lanterniner.
  function kalmar(mb, Y) {
    const ren = Y >= 1558, c = KALK, lo = KALKL;
    // längorna kring borggården
    langa(mb, 0, -0.82, 2.0, 1.0, 0.5, c, lo, TAK, { trapp: ren });
    langa(mb, -0.84, 0.02, 1.2, 0.9, 0.46, c, lo, TAK, { rot: 1 });
    langa(mb, 0.84, 0.02, 1.2, 0.95, 0.46, c, lo, TAK, { rot: 1 });
    langa(mb, 0.2, 0.84, 1.4, 0.82, 0.44, c, lo, TAK, { trapp: ren });
    // porttornet framtill, med spira efter ombyggnaden
    fyr(mb, -0.62, 0.95, 0.46, 1.25, c, lo, ren ? KOPPAR : TAK, ren ? 0.75 : 0); port(mb, -0.62, 1.185, 0.2, 0.32);
    // hörnen: medeltida fyrkantiga torn, som byts mot runda rondeller ett i taget från 1535
    const H = [[-1.12, 1.12], [1.12, 1.12], [1.12, -1.12], [-1.12, -1.12]], runda = Y < 1535 ? 0 : Y < 1545 ? 2 : Y < 1555 ? 3 : 4;
    H.forEach(([x, z], k) => { if (k < runda) runt(mb, x, z, 0.46, 1.0, c, lo, ren ? 'huv' : 'kon'); else fyr(mb, x, z, 0.46, 1.2, c, lo); });
    mur(mb, -1.12, 1.12, 1.12, 1.12, 0.55, c, lo); mur(mb, -1.12, -1.12, 1.12, -1.12, 0.55, c, lo); mur(mb, -1.12, -1.12, -1.12, 1.12, 0.55, c, lo); mur(mb, 1.12, -1.12, 1.12, 1.12, 0.55, c, lo);
    // kärntornet i mitten, rivet 1555–1559
    if (!ren) fyr(mb, 0.05, 0.0, 0.55, 1.95, c, lo);
    K._flagga = ren ? [1.12, 1.6, 1.12] : [0.05, 2.35, 0.0];
    return ren ? 1.7 : 2.4;
  }

  // =====================================================================================
  // Uppsala domkyrka: rikets största kyrka, i tegel. Långhus med sidoskepp, tvärskepp, ett högt kor med omgång i öster och två torn i väster.
  // Tornen var inte färdigbyggda när reformationen tog pengarna och fick sina höga spiror först 1614–1619; på 1500-talet hade de låga tak.
  function uppsalaDom(mb, Y, s) {
    const c = '#a5523c', lo = TEGELL, tak = KOPPAR, r = '#687a76';
    mb.push().scale(s || 1).move(-0.15, 0, 0);
    langa(mb, -0.3, 0, 2.4, 1.35, 0.95, c, lo, tak, { th: 0.85, ridge: r, fon: false });
    for (const sz of [-0.64, 0.64]) { mb.box(-0.3, 0, sz, 2.3, 0.7, 0.36, '#964733', { low: '#6e3223', noTop: true }); mb.quad([-1.45, 0.7, sz + Math.sign(sz) * 0.19], [0.85, 0.7, sz + Math.sign(sz) * 0.19], [0.85, 1.05, sz - Math.sign(sz) * 0.18], [-1.45, 1.05, sz - Math.sign(sz) * 0.18], tak, r, 1); }
    for (let k = 0; k < 5; k++) { const x = -1.3 + k * 0.48; for (const sz of [-0.85, 0.85]) mb.box(x, 0, sz, 0.1, 0.78, 0.1, '#8a4230', { low: '#663022' }); fon(mb, x + 0.24, 0.18, 0.825, 0.06, 0.32); fon(mb, x + 0.24, 0.85, 0.48, 0.06, 0.3); }
    langa(mb, 1.05, 0, 2.2, 1.35, 0.56, c, lo, tak, { rot: 1, th: 0.6, ridge: r, fon: false }); fon(mb, 1.05, 0.5, 1.105, 0.12, 0.55);          // tvärskeppet med sitt stora gavelfönster
    langa(mb, 1.7, 0, 0.8, 1.3, 0.86, c, lo, tak, { th: 0.8, ridge: r, fon: false });
    mb.cyl(2.12, 0, 0, 0.66, 0.64, 0.72, 10, '#964733', { low: '#6e3223' }); mb.cone(2.12, 0.72, 0, 0.7, 0.38, 10, tak, { low: KOPPARL });          // koromgången
    mb.cyl(2.12, 0, 0, 0.43, 0.43, 1.3, 8, c, { low: lo }); mb.cone(2.12, 1.3, 0, 0.47, 0.72, 8, tak, { low: KOPPARL });          // koret
    mb.cyl(1.05, 1.35 + 0.55, 0, 0.09, 0.08, 0.3, 6, c); mb.cone(1.05, 2.2, 0, 0.12, 0.6, 6, tak, { low: KOPPARL });          // takryttaren över korsmitten
    // västtornen
    const th = 2.6;
    mb.box(-1.82, 0, 0, 0.6, 1.5, 0.5, '#a95740', { low: lo, noTop: true }); mb.gable(-1.82, 1.5, 0, 0.6, 0.3, 0.5, tak, { gable: '#a95740' });          // mellanbyggnaden med porten
    for (const z of [-0.46, 0.46]) {
      mb.box(-1.82, 0, z, 0.6, th, 0.6, '#a95740', { low: lo, noTop: true }); fon(mb, -1.82, th * 0.62, z + 0.305, 0.08, 0.2); fon(mb, -1.82, th * 0.82, z + 0.305, 0.07, 0.14);
      for (const sx of [-0.27, 0.27]) mb.box(-1.82 + sx, 0, z + 0.27, 0.08, th * 0.7, 0.08, '#8a4230', { low: '#663022' });          // strävpelare i hörnen
      if (Y < 1614) { mb.hip(-1.82, th, z, 0.62, 0.62, 0.62, tak, 0.04); mb.cone(-1.82, th + 0.55, z, 0.05, 0.3, 4, tak); }
      else { mb.hip(-1.82, th, z, 0.68, 0.2, 0.68, tak, 0.04); mb.cyl(-1.82, th + 0.18, z, 0.2, 0.18, 0.3, 8, tak); mb.cone(-1.82, th + 0.48, z, 0.22, 1.9, 8, tak, { low: KOPPARL }); }
    }
    port(mb, -1.82, 0.762, 0.2, 0.42);
    mb.pop();
    return th + (Y < 1614 ? 0.4 : 2.4);
  }

  // =====================================================================================
  // Kyrkor med torn i väster: långhus, kor i öster och ett västtorn med spira. Används för domkyrkorna och de stora stadskyrkorna.
  // o: L längd, H murhöjd, D bredd, c färg, tw/th tornets bredd och höjd, sp spirans höjd (0 = tälttak), horn = fyra småtorn kring spiran,
  // apsis = runt kor, kor = rakt kor, dyrk = takryttare, strav = strävpelare, platt = tornet slutar platt med en låg huv.
  function tornkyrka(mb, o) {
    const c = o.c || TEGEL, lo = o.lo || TEGELL, tak = o.tak || KOPPAR, L = o.L || 2.2, H = o.H || 1.05, D = o.D || 0.95, tx = -L / 2 - (o.tw || 0.62) / 2 + 0.02;
    langa(mb, 0, 0, L, H, D, c, lo, tak, { th: o.tH || D * 0.85, ridge: tak === KOPPAR ? KOPPARR : tak, fon: false });
    for (let k = 0; k < Math.floor(L / 0.45); k++) { const x = -L / 2 + 0.3 + k * 0.45; fon(mb, x, H * 0.25, D / 2 + 0.005, 0.07, H * 0.45); if (o.strav !== false) mb.box(x + 0.22, 0, D / 2 + 0.04, 0.08, H * 0.75, 0.08, c, { low: lo }); }
    if (o.apsis) { mb.cyl(L / 2, 0, 0, D * 0.46, D * 0.46, H * 0.95, 8, c, { low: lo }); mb.cone(L / 2, H * 0.95, 0, D * 0.5, D * 0.6, 8, tak, { low: KOPPARL }); }
    else if (o.kor !== false) langa(mb, L / 2 + 0.35, 0, 0.7, H * 0.85, D * 0.7, c, lo, tak, { th: D * 0.6, fon: false });
    if (o.ryttare) { mb.cyl(L * 0.15, H + D * 0.8, 0, 0.08, 0.07, 0.22, 6, c); mb.cone(L * 0.15, H + D * 0.8 + 0.2, 0, 0.11, 0.55, 6, tak, { low: KOPPARL }); }
    const tw = o.tw || 0.62, th = o.th || 2.0;
    mb.box(tx, 0, 0, tw, th, tw, c, { low: lo, noTop: true }); port(mb, tx, tw / 2 + 0.005, 0.2, 0.42);
    for (const y of [0.55, 0.78]) fon(mb, tx, th * y, tw / 2 + 0.005, 0.07, 0.17);
    if (o.platt) { mb.box(tx, th, 0, tw + 0.06, 0.08, tw + 0.06, c, { low: lo }); mb.hip(tx, th + 0.08, 0, tw * 0.6, 0.25, tw * 0.6, tak, 0.02); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mb.cone(tx + a * tw * 0.42, th + 0.08, b * tw * 0.42, 0.06, 0.35, 5, tak); }
    else if (o.sp) {
      mb.hip(tx, th, 0, tw, tw * 0.22, tw, tak, 0.04); mb.cone(tx, th + tw * 0.18, 0, tw * 0.36, o.sp, 8, tak, { low: KOPPARL });
      if (o.horn) for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mb.cone(tx + a * tw * 0.4, th, b * tw * 0.4, 0.08, o.sp * 0.3, 6, tak, { low: KOPPARL });
    } else mb.hip(tx, th, 0, tw, tw * 0.9, tw, tak, 0.05);
    return th + (o.sp || 0.6);
  }
  const medSkala = f => (mb, Y, s) => { mb.push().scale(s || 1); const h = f(mb, Y); mb.pop(); return h * (s || 1); };

  // Västerås domkyrka: bred hallkyrka (fem skepp från 1517), halvrund absid och ett västtorn från omkring 1420 med hög medeltida spira.
  const vasterasDom = medSkala((mb, Y) => tornkyrka(mb, { L: 2.3, H: 1.0, D: 1.35, tH: 0.95, apsis: 1, tw: 0.7, th: 2.15, sp: 1.9 }));
  // Storkyrkan (S:t Nikolai) i Stockholm: stadens kyrka i tegel med hög spira, så som den syns på Vädersolstavlan 1535.
  const storkyrkan = medSkala((mb, Y) => tornkyrka(mb, { L: 2.0, H: 1.0, D: 1.05, tw: 0.6, th: 1.85, sp: 1.6 }));
  // Åbo domkyrka: tegelkyrka med ett västtorn, en hög spira och fyra små hörntorn kring den (troligen den senmedeltida formen).
  const aboDom = medSkala((mb, Y) => tornkyrka(mb, { L: 2.2, H: 1.1, D: 1.0, tw: 0.7, th: 2.0, sp: 1.45, horn: 1, ryttare: 1 }));
  // Strängnäs domkyrka: västtornet murat 1424–1444, ett av rikets högsta, och ett gemensamt tak över hela kyrkan från omkring 1500.
  const strangnasDom = medSkala((mb, Y) => tornkyrka(mb, { L: 2.1, H: 1.05, D: 1.1, tw: 0.72, th: 2.4, sp: 1.5, ryttare: 1 }));
  // Linköpings domkyrka: lång katedral i kalksten med västtorn.
  const linkopingDom = medSkala((mb, Y) => tornkyrka(mb, { L: 2.4, H: 1.1, D: 1.0, c: '#c9c2b0', lo: KALKL, tw: 0.66, th: 1.9, sp: 1.2, kor: true }));
  // Mariakyrkan i Danzig: världens största tegelkyrka, en jättelik hallkyrka med ett tungt torn som slutar platt.
  const danzigDom = medSkala((mb, Y) => tornkyrka(mb, { L: 2.6, H: 1.35, D: 1.4, tH: 1.0, tw: 0.95, th: 2.5, platt: 1, kor: true, tak: '#a04a30' }));

  // Mora kyrka: vitkalkad stenkyrka. Tornet med sin höga spira byggdes 1581; före det en enkel västgavel.
  function moraKyrka(mb, Y) {
    if (Y >= 1581) return tornkyrka(mb, { L: 1.4, H: 0.78, D: 0.85, c: VIT, lo: VITL, tak: TAK, tw: 0.46, th: 1.35, sp: 1.25, strav: false });
    langa(mb, 0, 0, 1.5, 0.78, 0.85, VIT, VITL, TAK, { th: 0.75, fon: false }); langa(mb, 0.98, 0, 0.56, 0.6, 0.58, VIT, VITL, TAK, { th: 0.5, fon: false });
    port(mb, -0.3, 0.43, 0.16, 0.34); fon(mb, 0.2, 0.32, 0.43, 0.06, 0.2); return 1.6;
  }
  // Vadstena klosterkyrka (Blåkyrkan): lång hallkyrka av blågrå kalksten utan torn, med väldigt högt tak och en takryttare.
  // Klockorna hänger i Rödtornet, ett fristående tegeltorn bredvid.
  function blakyrkan(mb, Y) {
    const c = '#a3abb0', lo = '#6e767c';
    langa(mb, -0.25, 0, 2.5, 0.95, 1.0, c, lo, TAK, { th: 1.15, fon: false });
    for (let k = 0; k < 5; k++) { const x = -1.3 + 0.25 + k * 0.48; fon(mb, x + 0.1, 0.22, 0.505, 0.08, 0.5); mb.box(x - 0.13, 0, 0.53, 0.09, 0.8, 0.07, c, { low: lo }); }
    mb.cyl(-0.25, 2.08, 0, 0.08, 0.07, 0.2, 6, c); mb.cone(-0.25, 2.26, 0, 0.12, 0.6, 6, TAK, { low: TAKL });
    port(mb, -1.0, 0.505, 0.18, 0.4);
    fyr(mb, -1.75, 0.85, 0.42, 1.55, TEGEL, TEGELL);          // Rödtornet
    return 2.8;
  }

  // ---- slott och borgar ----
  // Stäket: ärkebiskopens borg vid Mälarens inlopp, med ett högt fyrkantigt kärntorn innanför ringmuren. Riven 1517–1518.
  function staket(mb, Y) {
    mur(mb, -1.1, 0.85, 1.1, 0.85, 0.55, STEN, STENL); mur(mb, -1.1, -0.85, 1.1, -0.85, 0.55, STEN, STENL); mur(mb, -1.1, -0.85, -1.1, 0.85, 0.55, STEN, STENL); mur(mb, 1.1, -0.85, 1.1, 0.85, 0.55, STEN, STENL);
    port(mb, 0.35, 0.935, 0.28, 0.36);
    fyr(mb, -0.35, -0.2, 0.75, 1.95, '#a39c90', STENL);
    langa(mb, 0.55, -0.35, 0.9, 0.75, 0.55, TEGEL, TEGELL, TAK, { rot: 1, trapp: 1 });
    runt(mb, 1.1, 0.85, 0.28, 0.85, STEN, STENL, 'kon'); runt(mb, -1.1, -0.85, 0.26, 0.8, STEN, STENL, 'kon');
    K._flagga = [-0.35, 2.4, -0.2]; return 2.7;
  }
  // Västerås slott: medeltida borg vid Svartåns mynning med ett fyrkantigt kärntorn i fyra våningar. Gustav Vasa byggde på längorna 1540–1544.
  function vasterasSlott(mb, Y) {
    const hog = Y >= 1544;
    langa(mb, 0.72, 0.05, 1.5, hog ? 1.15 : 0.85, 0.5, STEN, STENL, TAK, { rot: 1, trapp: Y >= 1575 });
    langa(mb, -0.72, 0.05, 1.4, hog ? 1.0 : 0.8, 0.48, STEN, STENL, TAK, { rot: 1 });
    langa(mb, 0, -0.6, 1.0, 0.75, 0.42, STEN, STENL, TAK, {});
    mur(mb, -0.95, 0.85, 0.95, 0.85, 0.5, STEN, STENL); port(mb, 0, 0.935, 0.26, 0.36);
    fyr(mb, 0.72, -0.68, 0.66, 2.0, '#b0a899', STENL);          // kärntornet i nordöstra hörnet
    K._flagga = [0.72, 2.55, -0.68]; return 2.6;
  }
  // Uppsala: ärkebiskopens gård i tegel fram till 1540-talet. Gustav Vasa började bygga slottet på åsen 1549 som en fästning med runda torn;
  // Johan III byggde om det till palats efter branden 1572.
  function uppsalaSlott(mb, Y) {
    if (Y < 1549) { langa(mb, 0, -0.1, 1.7, 0.9, 0.6, TEGEL, TEGELL, TAK, { trapp: 1 }); fyr(mb, -0.95, 0.1, 0.5, 1.4, TEGEL, TEGELL); K._flagga = [-0.95, 1.8, 0.1]; return 1.9; }
    const pal = Y >= 1572;
    langa(mb, 0, -0.15, 2.3, pal ? 1.25 : 1.05, 0.7, TEGEL, TEGELL, TAK, { trapp: pal });
    runt(mb, -1.25, 0, 0.55, 1.15, TEGEL, TEGELL, pal ? 'huv' : 'kon'); runt(mb, 1.25, 0, 0.55, 1.15, TEGEL, TEGELL, pal ? 'huv' : 'kon');
    if (Y < 1567) { mb.box(0.3, 1.05, -0.15, 0.04, 0.4, 0.04, '#b9935f'); }
    K._flagga = [-1.25, 1.75, 0]; return 1.9;
  }
  // Åbo slott: lång gråstensborg vid Aura ås mynning, huvudborg med förborg. Hertig Johan byggde om det i renässans 1556–1563.
  function aboSlott(mb, Y) {
    const ren = Y >= 1556, c = '#b4ad9e';
    langa(mb, 0.1, -0.2, 2.2, ren ? 1.35 : 1.05, 0.8, c, STENL, TAK, { trapp: ren });
    fyr(mb, -1.15, -0.2, 0.62, ren ? 1.95 : 1.7, c, STENL, TAK, ren ? 0.6 : 0); fyr(mb, 1.15, -0.25, 0.55, 1.6, c, STENL);
    mur(mb, -1.2, 0.85, 1.2, 0.85, 0.45, c, STENL); mur(mb, -1.2, 0.85, -1.2, 0.15, 0.45, c, STENL); mur(mb, 1.2, 0.85, 1.2, 0.15, 0.45, c, STENL); port(mb, 0.4, 0.935, 0.24, 0.32);
    K._flagga = [-1.15, 2.35, -0.2]; return 2.4;
  }
  // Nyköpingshus: rektangulär borg med förborgar, Gustav Vasas runda kanontorn och Kungstornet. Hertig Karl gjorde om det till renässanspalats från 1580-talet.
  function nykopingshus(mb, Y) {
    const ren = Y >= 1585;
    langa(mb, 0, -0.55, 2.0, ren ? 1.15 : 0.9, 0.55, ren ? VIT : STEN, ren ? VITL : STENL, TAK, { trapp: ren });
    langa(mb, -0.8, 0.15, 1.0, 0.8, 0.45, STEN, STENL, TAK, { rot: 1 });
    fyr(mb, 0.75, 0.2, 0.62, 1.7, STEN, STENL, TAK, ren ? 0.5 : 0);          // Kungstornet
    runt(mb, -0.95, 0.85, 0.5, 0.85, STEN, STENL, 'platt');          // kanontornet
    mur(mb, -0.45, 0.85, 1.1, 0.85, 0.45, STEN, STENL); port(mb, 0.2, 0.935, 0.24, 0.32);
    K._flagga = [0.75, 2.15, 0.2]; return 2.2;
  }
  // Stegeborg: borg på en ö vid Slätbaken. Ett fyrkantigt tegeltorn från 1200-talet och ett runt torn från slutet av 1400-talet,
  // som Johan III lät höja när han byggde om borgen 1578–1590.
  function stegeborg(mb, Y) {
    const j3 = Y >= 1578;
    langa(mb, -0.1, -0.5, 1.6, 0.85, 0.5, STEN, STENL, TAK, { trapp: j3 }); langa(mb, -0.1, 0.55, 1.4, 0.75, 0.45, STEN, STENL, TAK, {});
    fyr(mb, 0.85, 0.5, 0.6, 1.55, TEGEL, TEGELL);
    runt(mb, -1.0, 0, 0.45, j3 ? 1.6 : 1.15, STEN, STENL, j3 ? 'huv' : 'kon');
    K._flagga = [0.85, 1.95, 0.5]; return 2.1;
  }
  // Borgholm på Öland: en kastal (runt torn) i en ringmur, illa skadad i krigen i början av 1500-talet.
  // Från 1572 byggdes den om till en av rikets första bastionsfästningar: ett fyrkantigt slott med spetsiga bastioner i hörnen.
  function borgholm(mb, Y) {
    if (Y < 1572) {
      for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283, b = (k + 1) / 10 * 6.283; if (k === 3) continue; mur(mb, Math.cos(a) * 1.0, Math.sin(a) * 0.85, Math.cos(b) * 1.0, Math.sin(b) * 0.85, k % 3 ? 0.5 : 0.35, STEN, STENL); }
      runt(mb, -0.15, -0.1, 0.45, 1.25, STEN, STENL, 'platt'); langa(mb, 0.45, -0.35, 0.7, 0.55, 0.42, STEN, STENL, TAK, { rot: 1 });
      K._flagga = [-0.15, 1.6, -0.1]; return 1.5;
    }
    const c = '#b8b09f';
    langa(mb, 0, -0.65, 1.7, 1.15, 0.45, c, STENL, TAK, {}); langa(mb, 0, 0.65, 1.7, 1.05, 0.45, c, STENL, TAK, {});
    langa(mb, -0.75, 0, 0.85, 1.1, 0.42, c, STENL, TAK, { rot: 1 }); langa(mb, 0.75, 0, 0.85, 1.1, 0.42, c, STENL, TAK, { rot: 1 });
    port(mb, 0, 0.88, 0.22, 0.4);
    for (const [x, z] of [[-1.0, -0.88], [1.0, -0.88], [-1.0, 0.88], [1.0, 0.88]]) { mb.push().move(x, 0, z).rotY(Math.PI / 4); mb.box(0, 0, 0, 0.62, 0.7, 0.62, c, { low: STENL }); mb.pop(); }          // bastionerna
    K._flagga = [0, 1.75, -0.65]; return 1.8;
  }
  // Örebro slott: på medeltiden en borg med längor kring en gård och ett kärntorn i sydväst, inom en sju meter hög ringmur.
  // Hertig Karl byggde om det från 1573: fyra längor i fyrkant, vitkalkade, med låga runda hörntorn.
  function orebro(mb, Y) {
    if (Y < 1573) {
      langa(mb, 0, -0.7, 1.8, 0.95, 0.48, STEN, STENL, TAK, {}); langa(mb, -0.75, 0.05, 1.1, 0.9, 0.45, STEN, STENL, TAK, { rot: 1 }); langa(mb, 0.75, 0.05, 1.1, 0.9, 0.45, STEN, STENL, TAK, { rot: 1 });
      fyr(mb, -0.75, 0.75, 0.6, 1.8, STEN, STENL);
      mur(mb, -0.45, 0.85, 1.1, 0.85, 0.55, STEN, STENL); port(mb, 0.3, 0.935, 0.24, 0.36);
      K._flagga = [-0.75, 2.2, 0.75]; return 2.3;
    }
    langa(mb, 0, -0.72, 1.9, 1.3, 0.48, VIT, VITL, TAK, { trapp: 1 }); langa(mb, 0, 0.72, 1.9, 1.2, 0.46, VIT, VITL, TAK, { trapp: 1 });
    langa(mb, -0.75, 0, 1.0, 1.2, 0.44, VIT, VITL, TAK, { rot: 1 }); langa(mb, 0.75, 0, 1.0, 1.2, 0.44, VIT, VITL, TAK, { rot: 1 });
    port(mb, 0, 0.955, 0.22, 0.42);
    for (const [x, z] of [[-1.0, -0.95], [1.0, -0.95], [-1.0, 0.95], [1.0, 0.95]]) runt(mb, x, z, 0.4, 0.7, STEN, STENL, 'platt');
    K._flagga = [0, 2.0, -0.72]; return 2.0;
  }
  // Viborgs slott: på en holme i viken. S:t Olofs torn reser sig högt över resten, fyrkantigt nedtill och åttakantigt upptill.
  function viborg(mb, Y) {
    const c = '#e2dccd', lo = '#a39c90';
    mb.box(-0.2, 0, -0.2, 0.8, 1.5, 0.8, c, { low: lo, noTop: true }); fon(mb, -0.2, 0.9, 0.205, 0.06, 0.12);
    mb.cyl(-0.2, 1.5, -0.2, 0.42, 0.38, 1.05, 8, c, { low: lo }); fon(mb, -0.2, 1.9, 0.18, 0.05, 0.12);
    mb.cyl(-0.2, 2.55, -0.2, 0.44, 0.44, 0.08, 8, c, { low: lo }); mb.cone(-0.2, 2.63, -0.2, 0.45, 0.75, 8, TAK, { low: TAKL });
    langa(mb, 0.65, -0.1, 1.1, 1.0, 0.6, '#d8d1c0', lo, TAK, { rot: 1 });
    mur(mb, -1.2, 0.85, 1.0, 0.9, 0.55, c, lo); mur(mb, -1.2, -0.85, 1.0, -0.75, 0.55, c, lo); mur(mb, -1.2, -0.85, -1.2, 0.85, 0.55, c, lo); mur(mb, 1.0, -0.75, 1.0, 0.9, 0.55, c, lo);
    runt(mb, 1.0, 0.9, 0.32, 0.95, c, lo, 'kon');
    K._flagga = [-0.2, 3.0, -0.2]; return 3.4;
  }
  // Reval (Domberget) och Narva (Hermanns borg): fyrkantiga ordensborgar med ett mycket högt fyrkantigt torn, Lange Hermann och Hermann.
  function ordensborg(mb, Y, hojd) {
    const c = '#b9b2a2';
    langa(mb, 0, -0.55, 1.6, 0.9, 0.5, c, STENL, TAK, {}); langa(mb, -0.6, 0.15, 0.9, 0.8, 0.45, c, STENL, TAK, { rot: 1 });
    mur(mb, -0.95, 0.85, 0.95, 0.85, 0.6, c, STENL); mur(mb, 0.95, -0.85, 0.95, 0.85, 0.6, c, STENL); port(mb, 0, 0.935, 0.24, 0.36);
    fyr(mb, 0.65, 0.5, 0.6, hojd, c, STENL);
    K._flagga = [0.65, hojd + 0.4, 0.5]; return hojd + 0.5;
  }
  // Vadstena slott: Gustav Vasas fästning från 1545, som hertig Magnus gjorde till palats 1555–1563: två våningar höga paviljonger
  // förenade av lägre längor, med runda kanontorn i hörnen och vallgrav.
  function vadstenaSlott(mb, Y) {
    const c = '#bdb4a4';
    langa(mb, 0, 0, 2.6, 1.0, 0.75, c, STENL, KOPPAR, { th: 0.5, ridge: KOPPARR, trapp: Y >= 1555 });
    for (const x of [-0.9, 0.9]) { mb.box(x, 0, 0, 0.7, 1.4, 0.85, c, { low: STENL, noTop: true }); mb.hip(x, 1.4, 0, 0.72, 0.55, 0.87, KOPPAR, 0.04); fon(mb, x, 0.8, 0.43, 0.06); fon(mb, x, 0.3, 0.43, 0.06); }
    fyr(mb, 0, 0.02, 0.6, 1.75, c, STENL, KOPPAR, 0.6); port(mb, 0, 0.33, 0.2, 0.36);
    for (const [x, z] of [[-1.7, -0.9], [1.7, -0.9], [-1.7, 0.9], [1.7, 0.9]]) runt(mb, x, z, 0.46, 0.55, '#a8a093', STENL, 'kon', KOPPAR);
    mur(mb, -1.7, 0.9, 1.7, 0.9, 0.42, '#a8a093', STENL); mur(mb, -1.7, -0.9, 1.7, -0.9, 0.42, '#a8a093', STENL); mur(mb, -1.7, -0.9, -1.7, 0.9, 0.42, '#a8a093', STENL); mur(mb, 1.7, -0.9, 1.7, 0.9, 0.42, '#a8a093', STENL);
    return 2.4;
  }

  // Orter som bara syns på kartan och inte har en borg: deras kända byggnad i stället för två stugor.
  const ORT = { strangnas: (mb, Y) => strangnasDom(mb, Y, 0.8), linkoping: (mb, Y) => linkopingDom(mb, Y, 0.8), orebro, borgholm, staket };

  // ---- uppslagen: ortens id först, sedan borgens sort ----
  const BORG = { stockholm: treKronor, kalmar, staket, vasteras: vasterasSlott, uppsala: uppsalaSlott, abo: aboSlott, nykoping: nykopingshus, stegeborg, borgholm, orebro, viborg, vadstena: vadstenaSlott,
    reval: (mb, Y) => ordensborg(mb, Y, 2.4), narva: (mb, Y) => ordensborg(mb, Y, 2.7) };
  const DOM = { uppsala: uppsalaDom, vasteras: vasterasDom, stockholm: storkyrkan, abo: aboDom, strangnas: strangnasDom, linkoping: linkopingDom, danzig: danzigDom };
  const KYRKA = { mora: moraKyrka, vadstena: blakyrkan };

  const K = V.Kanda = {
    plats: null, arTest: 0, _flagga: null,
    // Svarar true om orten har en egen borg och den är ritad.
    borg(mb, sort, steg) { const f = BORG[K.plats] || (sort !== 'liten' && BORG[sort]); if (!f) return false; K._flagga = null; if (!K._tom) f(mb, ar(), steg); return true; },          // _tom: ett slott ritas en gång, inte en gång per steg
    dom(mb, torn, s) { const f = DOM[K.plats]; if (!f) return false; f(mb, ar(), s); return true; },
    kyrka(mb) { const f = KYRKA[K.plats]; if (!f) return false; f(mb, ar()); return true; },
    // För prov och skärmbilder: rita en ort direkt, oberoende av spelet.  V.Kanda.rita('stockholm', 'borg', 1590)
    rita(id, sort, Y, s) { const mb = new MB(), was = K.arTest; K.arTest = Y || 0; K.plats = id; try { (sort === 'dom' ? DOM : sort === 'kyrka' ? KYRKA : sort === 'ort' ? ORT : BORG)[id](mb, ar(), s || 1); } finally { K.arTest = was; K.plats = null; } return B.mesh(mb); },
    lista() { return { borg: Object.keys(BORG), dom: Object.keys(DOM), kyrka: Object.keys(KYRKA), ort: Object.keys(ORT) }; }
  };

  // Bygge.steg vet vilken ort som byggs: tala om det för borg(), domkyrka() och kyrka(). Fanan flyttas till den nya borgens krön.
  const stegFore = B.steg;
  B.steg = function (t, s, paint) {
    K.plats = t && t.b ? t.b.id : null; K._tom = !!(t && t.b && t.b.slag === 'slott' && s > 0 && BORG[t.b.id]);
    try {
      const mb = stegFore.call(this, t, s, paint);
      if (s === 0 && K._flagga && t.b.borg && BORG[t.b.id] && t.b.slag === 'stad') { const bx = t.b.stor ? 2.6 : 2.4, bz = t.b.stor ? -2.2 : -1.5, f = K._flagga; t.flag = [bx + f[0], f[1], bz + f[2]]; }
      return mb;
    } finally { K.plats = null; K._flagga = null; K._tom = false; }
  };
  // Orterna som bara syns på kartan (Varld._orter) ritas i _dekor med nyckeln 'ort' + id.
  if (V.Varld && V.Varld._dekor) {
    const dekorFore = V.Varld._dekor;
    V.Varld._dekor = function (key, on, make) {
      const id = typeof key === 'string' && key.indexOf('ort') === 0 ? key.slice(3) : key, egen = key !== id && (ORT[id] || BORG[id]);
      // en ort på kartan med en känd byggnad: den i stället för stugorna (samma storlek som borgarna där)
      if (egen && on) make = () => { const mb = new MB(); K.plats = id; egen(mb, ar(), 1); const m = B.mesh(mb), p = V.Rike.P[id]; m.position.set(p.x, V.Geo.groundAt(p.x, p.z), p.z); m.scale.setScalar(B.K * 0.8); return m; };
      K.plats = id;
      try { return dekorFore.call(this, key, on, make); } finally { K.plats = null; }
    };
  }
  // De kända byggnaderna står kvar på kartan i alla världar och år där de fanns, också där orten bara är en skylt
  // (Johannes 2026-11-28: "Örebro slott nämns i introt men det finns inget slott där?"). När orten blir en egen bas med tomt
  // tar basen över (den ritar samma borg och kyrka), och en ort som Varld._orter redan ritar hoppas över.
  const INTE = { staket: 1 };          // Stäket ritas av förspelet och rivs 1518
  function finnsBas(b, S) { return !(b.varld && b.varld.indexOf(S.varld) < 0) && (S.varld >= 2 || !(b.slag === 'slott' || b.ny || b.id === 'sala')); }
  function stallning(id, Y) {
    const borg = id !== 'vadstena' && BORG[id], kyrka = DOM[id] || KYRKA[id] || (!borg && ORT[id]);
    if (!borg && !kyrka) return null;
    const mb = new MB(); K.plats = id;
    try {
      if (borg && kyrka) { mb.push().move(1.25, 0, -0.45); borg(mb, Y, 0); mb.pop(); mb.push().move(-1.45, 0, 0.35); kyrka(mb, Y, 0.7); mb.pop(); }
      else if (borg) borg(mb, Y, 0);
      else kyrka(mb, Y, DOM[id] ? 0.8 : 1);
    } finally { K.plats = null; K._flagga = null; }
    return mb;
  }
  K.stall = function () {
    const W = V.Varld, G = V.Game, D = V.DATA, R = V.Rike; if (!W || !G || !G.s || !R || !R.P) return;
    const S = G.s, Y = ar(), ort = {}; (W._ortLista || []).forEach(o => { ort[o.id] = 1; });
    const ids = {}; [BORG, DOM, KYRKA, ORT].forEach(t => Object.keys(t).forEach(id => { ids[id] = 1; }));
    for (const id in ids) {
      if (INTE[id]) continue; const p = R.P[id]; if (!p || V.Geo.sdAt(p.x, p.z) < 0.3) continue;
      const b = D.BASER.find(q => q.id === id), egen = b && finnsBas(b, S) && S.bas && S.bas[id];
      const pa = !egen && !ort['ort' + id];
      if (pa && K._stallAr[id] !== undefined && K._stallAr[id] !== Y) W._dekor('kanda' + id, false);          // ett annat år: rita om
      W._dekor('kanda' + id, pa, () => { K._stallAr[id] = Y; const mb = stallning(id, Y), m = B.mesh(mb); m.position.set(p.x, V.Geo.groundAt(p.x, p.z), p.z); m.scale.setScalar(B.K * 0.8); return m; });
    }
  };
  K._stallAr = {};
  if (V.Varld && V.Varld.sync) {
    const syncFore = V.Varld.sync;
    V.Varld.sync = function () { const r = syncFore.apply(this, arguments); try { K.stall(); } catch (e) { console.warn('kanda', e); } return r; };
  }
})();
