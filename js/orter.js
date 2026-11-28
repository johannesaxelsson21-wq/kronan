// Rikets städer efter året (Johannes 2026-11-28): "Det ska vara tidsenligt, så man ser när sverige skapas, men om staden finns kan de vara
// en liten skylt och nåt litet hus och sen bli större om det blir större under historien."
// Varje stad som fanns får en liten skylt och några hus från det år den fick stadsrättigheter, och växer eller försvinner med historien.
// Städer som redan är platser i spelet (data.js, levande.js) ritas inte här. Källor och förenklingar: docs/orter.md.
// Kopplingen: V.Levande.orter (skyltarna) och V.Levande.init (scenen) lindas in, och V.Rike.clearings får gläntor för städerna.
(function () {
  'use strict';
  const V = window.VASA;

  // [id, longitud, latitud, faser]. Fas: [från år, storlek, namn]. Storlek 0 = ingen stad, 1 = by eller marknadsplats, 2 = stad, 3 = stor stad.
  // Namnet gäller från den fasen och framåt (utelämnat = samma som förut). Årtalen är året för stadsrättigheter enligt sv. Wikipedia.
  const ST = 1000;          // stad sedan medeltiden: finns från början
  const STADER = [
    // Svealand
    ['sigtuna', 17.72, 59.62, [[ST, 2, 'Sigtuna']]],
    ['sodertalje', 17.63, 59.20, [[ST, 2, 'Södertälje']]],
    ['torshalla', 16.47, 59.42, [[ST, 2, 'Torshälla']]],
    ['koping', 15.99, 59.51, [[ST, 2, 'Köping']]],
    ['trosa', 17.55, 58.90, [[ST, 1, 'Trosa'], [1610, 2]]],
    ['osthammar', 18.37, 60.26, [[ST, 2, 'Östhammar'], [1491, 1], [1539, 2]]],
    ['oregrund', 18.44, 60.34, [[1491, 2, 'Öregrund'], [1521, 1], [1554, 2]]],
    ['norrtalje', 18.70, 59.76, [[1622, 2, 'Norrtälje']]],
    ['vaxholm', 18.35, 59.40, [[1652, 2, 'Vaxholm']]],
    ['eskilstuna', 16.51, 59.37, [[1659, 2, 'Eskilstuna']]],
    ['avesta', 16.17, 60.15, [[1641, 2, 'Avesta'], [1688, 1]]],
    ['sater', 15.75, 60.35, [[1642, 2, 'Säter']]],
    ['nora', 15.04, 59.52, [[1643, 2, 'Nora']]],
    ['lindesberg', 15.23, 59.59, [[1643, 2, 'Lindesberg']]],
    ['askersund', 14.90, 58.88, [[1643, 2, 'Askersund']]],
    ['karlstad', 13.50, 59.38, [[ST, 1, 'Tingvalla'], [1584, 2, 'Karlstad']]],
    ['kristinehamn', 14.11, 59.31, [[ST, 1, 'Bro'], [1582, 2, 'Broo'], [1584, 1, 'Bro'], [1642, 2, 'Kristinehamn']]],
    ['filipstad', 14.16, 59.71, [[1611, 2, 'Filipstad'], [1695, 1]]],
    ['amal', 12.70, 59.05, [[1643, 2, 'Åmål']]],
    ['soderhamn', 17.06, 61.30, [[1620, 2, 'Söderhamn']]],
    ['hudiksvall', 17.10, 61.73, [[1582, 2, 'Hudiksvall']]],
    // Götaland
    ['norrkoping', 16.19, 58.59, [[ST, 2, 'Norrköping'], [1620, 3]]],
    ['skanninge', 15.09, 58.39, [[ST, 2, 'Skänninge']]],
    ['vastervik', 16.64, 57.76, [[ST, 2, 'Västervik']]],
    ['vimmerby', 15.86, 57.67, [[ST, 2, 'Vimmerby'], [1532, 1], [1604, 2]]],
    ['eksjo', 14.97, 57.67, [[ST, 2, 'Eksjö']]],
    ['granna', 14.47, 58.02, [[1652, 2, 'Gränna']]],
    ['monsteras', 16.44, 57.04, [[1604, 2, 'Mönsterås'], [1620, 1]]],
    ['hjo', 14.28, 58.30, [[ST, 2, 'Hjo']]],
    ['skovde', 13.85, 58.39, [[ST, 2, 'Skövde']]],
    ['falkoping', 13.55, 58.17, [[ST, 2, 'Falköping']]],
    ['lidkoping', 13.16, 58.50, [[ST, 2, 'Lidköping']]],
    ['mariestad', 13.83, 58.71, [[1583, 2, 'Mariestad']]],
    ['alingsas', 12.53, 57.93, [[1619, 2, 'Alingsås']]],
    ['boras', 12.94, 57.72, [[1621, 2, 'Borås']]],
    ['lodose', 12.16, 58.03, [[ST, 2, 'Lödöse'], [1526, 1], [1586, 2], [1646, 1]]],
    ['nyalodose', 12.00, 57.73, [[1473, 2, 'Nya Lödöse'], [1624, 0]]],
    ['goteborg', 11.97, 57.71, [[1621, 2, 'Göteborg'], [1640, 3]]],
    ['bratte', 12.33, 58.36, [[1585, 2, 'Brätte'], [1644, 0]]],
    ['vanersborg', 12.32, 58.38, [[1644, 2, 'Vänersborg']]],
    // Halland, Bohuslän, Skåne och Blekinge (danska och norska till 1645 och 1658)
    ['kungsbacka', 12.08, 57.49, [[ST, 2, 'Kungsbacka']]],
    ['laholm', 13.04, 56.51, [[ST, 2, 'Laholm']]],
    ['uddevalla', 11.94, 58.35, [[ST, 2, 'Uddevalla']]],
    ['marstrand', 11.58, 57.89, [[ST, 2, 'Marstrand']]],
    ['stromstad', 11.17, 58.94, [[1672, 2, 'Strömstad']]],
    ['helsingborg', 12.70, 56.05, [[ST, 2, 'Helsingborg']]],
    ['landskrona', 12.83, 55.87, [[ST, 2, 'Landskrona']]],
    ['lund', 13.19, 55.70, [[ST, 3, 'Lund'], [1537, 2]]],
    ['ystad', 13.82, 55.43, [[ST, 2, 'Ystad']]],
    ['trelleborg', 13.16, 55.37, [[ST, 2, 'Trelleborg'], [1619, 1]]],
    ['skanor', 12.85, 55.42, [[ST, 2, 'Skanör']]],
    ['falsterbo', 12.82, 55.39, [[ST, 2, 'Falsterbo']]],
    ['simrishamn', 14.35, 55.56, [[ST, 2, 'Simrishamn']]],
    ['ahus', 14.29, 55.93, [[ST, 2, 'Åhus'], [1617, 1]]],
    ['va', 14.08, 56.00, [[ST, 2, 'Vä'], [1617, 0]]],
    ['kristianstad', 14.16, 56.03, [[1622, 2, 'Kristianstad']]],
    ['angelholm', 12.86, 56.24, [[1516, 2, 'Ängelholm'], [1547, 1]]],
    ['bastad', 12.85, 56.43, [[ST, 2, 'Båstad'], [1664, 1]]],
    ['solvesborg', 14.58, 56.05, [[ST, 2, 'Sölvesborg'], [1654, 1]]],
    ['elleholm', 14.75, 56.18, [[ST, 2, 'Elleholm'], [1600, 1]]],
    ['ronneby', 15.28, 56.21, [[ST, 2, 'Ronneby'], [1680, 1]]],
    ['lycka', 15.63, 56.21, [[ST, 2, 'Lyckå'], [1600, 1]]],
    ['kristianopel', 16.04, 56.25, [[1600, 2, 'Kristianopel'], [1677, 1]]],
    ['karlshamn', 14.86, 56.17, [[1664, 2, 'Karlshamn']]],
    ['karlskrona', 15.59, 56.16, [[1680, 2, 'Karlskrona'], [1690, 3]]],
    // Finland
    ['nadendal', 22.03, 60.47, [[ST, 2, 'Nådendal']]],
    ['bjorneborg', 21.80, 61.48, [[1558, 2, 'Björneborg']]],
    ['nystad', 21.41, 60.80, [[1617, 2, 'Nystad']]],
    ['tavastehus', 24.46, 61.00, [[1639, 2, 'Tavastehus']]],
    ['nyslott', 28.88, 61.87, [[1639, 2, 'Nyslott']]],
    ['villmanstrand', 28.19, 61.06, [[1649, 2, 'Villmanstrand']]],
    ['fredrikshamn', 27.20, 60.57, [[1653, 2, 'Fredrikshamn']]],
    // Städer som också är platser i spelet (läget tas därifrån). De står här tills spelet själv ritar dem, så att de alltid syns (Johannes 2026-11-28: "Staden finns inte ens med?" om Örebro i förspelet)
    ['stockholm', null, null, [[ST, 3, 'Stockholm']]], ['uppsala', null, null, [[ST, 2, 'Uppsala']]], ['vasteras', null, null, [[ST, 2, 'Västerås']]],
    ['orebro', null, null, [[ST, 2, 'Örebro']]], ['arboga', null, null, [[ST, 2, 'Arboga']]], ['strangnas', null, null, [[ST, 2, 'Strängnäs']]],
    ['nykoping', null, null, [[ST, 2, 'Nyköping']]], ['soderkoping', null, null, [[ST, 2, 'Söderköping']]], ['linkoping', null, null, [[ST, 2, 'Linköping']]],
    ['vadstena', null, null, [[ST, 2, 'Vadstena']]], ['skara', null, null, [[ST, 2, 'Skara']]], ['jonkoping', null, null, [[ST, 2, 'Jönköping']]],
    ['enkoping', null, null, [[ST, 2, 'Enköping']]], ['hedemora', null, null, [[ST, 2, 'Hedemora']]], ['gavle', null, null, [[ST, 2, 'Gävle']]],
    ['sala', null, null, [[ST, 1, 'Sala'], [1624, 2]]], ['kalmar', null, null, [[ST, 2, 'Kalmar']]], ['visby', null, null, [[ST, 2, 'Visby']]],
    ['halmstad', null, null, [[ST, 2, 'Halmstad']]], ['varberg', null, null, [[ST, 2, 'Varberg']]], ['falkenberg', null, null, [[ST, 2, 'Falkenberg']]],
    ['malmo', null, null, [[ST, 3, 'Malmö']]], ['kopenhamn', null, null, [[ST, 3, 'Köpenhamn']]], ['abo', null, null, [[ST, 2, 'Åbo']]],
    ['borga', null, null, [[ST, 2, 'Borgå']]], ['raumo', null, null, [[ST, 2, 'Raumo']]], ['ulvsby', null, null, [[ST, 2, 'Ulvsby'], [1558, 1]]],
    ['ekenas', null, null, [[1546, 2, 'Ekenäs']]], ['helsingfors', null, null, [[1550, 2, 'Helsingfors']]], ['viborg', null, null, [[ST, 2, 'Viborg']]],
    ['reval', null, null, [[ST, 3, 'Reval']]], ['narva', null, null, [[ST, 2, 'Narva']]], ['goteborg', null, null, [[1621, 2, 'Göteborg'], [1640, 3]]]
  ];

  // Läget för året: storlek och namn
  function lage(st, ar) { let n = 0, namn = ''; for (const f of st[3]) { if (f[2]) namn = namn || f[2]; if (f[0] <= ar) { n = f[1]; if (f[2]) namn = f[2]; } } return { n, namn }; }
  function arNu() { try { return V.kalender ? V.kalender().ar : 1520; } catch (e) { return 1520; } }

  let scene = null, grupp = null, ritatAr = -1, platser = null;
  // var staden står: på land en bit från stranden, och inte ovanpå en plats som spelet redan har
  function lagg() {
    if (platser) return platser;
    const R = V.Rike, G = V.Geo, D = V.DATA, L = V.Levande; platser = [];
    const andra = []; for (const id in R.P) andra.push([R.P[id].x, R.P[id].z]);
    if (L && L.ORT) for (const id in L.ORT) { const w = G.toWorld(L.ORT[id][0], L.ORT[id][1]); andra.push(w); }
    const sett = {};
    for (const st of STADER) {
      if (sett[st[0]]) continue;
      let x, z, egen = st[1] === null;
      if (egen) { if (R.P[st[0]]) { x = R.P[st[0]].x; z = R.P[st[0]].z; } else if (L && L.ORT && L.ORT[st[0]]) [x, z] = G.toWorld(L.ORT[st[0]][0], L.ORT[st[0]][1]); else continue; }
      else { if (R.P[st[0]] || D.PLATSER[st[0]]) continue; [x, z] = G.toWorld(st[1], st[2]); if (andra.some(a => Math.hypot(a[0] - x, a[1] - z) < 1.6)) continue; }
      sett[st[0]] = 1;
      if (egen) { platser.push({ st, x, z, egen }); continue; }
      if (G.sdAt(x, z) < 0.8) { let bast = null; for (let r = 0.3; r < 3 && !bast; r += 0.3) for (let a = 0; a < 6.283; a += 0.5 / r) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (G.sdAt(px, pz) > 0.8) { bast = [px, pz]; break; } } if (!bast) continue; [x, z] = bast; }
      platser.push({ st, x, z });
    }
    return platser;
  }
  // små hus i samma stil som byarna (bygge.js): en stuga för en by, några hus och en kyrka för en stad, fler för en stor stad
  const HUS = [[0, 0, 0], [1.25, 0.55, 0.5], [-1.1, 0.7, -0.4], [0.4, -1.2, 0.2], [-0.5, 1.5, 0.9], [1.6, -0.8, -0.6], [-1.6, -0.9, 0.3]];
  function hus(n, seed) {
    const B = V.Bygge, mb = new V.MB(), antal = n === 1 ? 2 : n === 2 ? 4 : 7;
    if (n >= 2) { mb.push().move(0, 0, -0.2); B.kyrka(mb); mb.pop(); }
    for (let k = n >= 2 ? 1 : 0; k < antal; k++) { const h = HUS[k], s = 0.85 + ((seed * 7 + k * 3) % 5) * 0.05; mb.push().move(h[0] * 1.15, 0, h[1] * 1.15).rotY(h[2] + seed); B.stuga(mb, 0.95 * s, 0.62 * s, 0.36 * s, n >= 2 && k % 2 ? 'tegel' : k % 3 ? 'span' : 'torv', { skorsten: 1, ljus: 1 }); mb.pop(); }
    const m = B.mesh(mb); m.scale.setScalar(B.K * (n === 1 ? 0.55 : 0.62)); return m;
  }
  // orter som spelet själv ritar hus för: egna baser och orterna i den här världens steg (Varld._orter)
  function spelRitar() {
    const S = V.Game.s, D = V.DATA, ut = {}; for (const id in S.bas) ut[id] = 1;
    for (const u of D.UPPDRAG) { if (u.plats) ut[u.plats] = 1; if (u.fran) ut[u.fran] = 1; }
    const Vd = D.VARLDAR && D.VARLDAR[S.varld]; if (Vd && Vd.orter) for (const id in Vd.orter) ut[id] = 1;
    return ut;
  }
  let husNyckel = '';
  function rita() {
    if (!scene || !V.Bygge || !V.MB) return;
    const ar = arNu(), nyckel = ar + ':' + Object.keys(V.Game.s.bas).length + ':' + V.Game.s.varld; if (nyckel === husNyckel && grupp) return; husNyckel = nyckel; ritatAr = ar;
    if (grupp) scene.remove(grupp); grupp = new THREE.Group(); grupp.name = 'orter';
    const ritas = spelRitar();
    lagg().forEach((p, i) => { const l = lage(p.st, ar); if (!l.n || (p.egen && ritas[p.st[0]])) return; const m = hus(l.n, i); m.position.set(p.x, V.Geo.groundAt(p.x, p.z), p.z); grupp.add(m); });
    scene.add(grupp);
  }

  // gläntor i skogen där städerna står (skogen ritas en gång, så alla städer får sin plats från början)
  if (V.Rike && V.Rike.clearings) {
    const fore = V.Rike.clearings;
    V.Rike.clearings = function () { const c = fore.apply(this, arguments); try { for (const p of lagg()) c.push({ x: p.x, z: p.z, r: 2.2 }); } catch (e) { /* kartan inte klar */ } return c; };
  }
  if (V.Levande) {
    const initFore = V.Levande.init, orterFore = V.Levande.orter;
    V.Levande.init = function (sc) { const r = initFore.apply(this, arguments); if (grupp && scene) scene.remove(grupp); scene = sc; grupp = null; ritatAr = -1; husNyckel = ""; return r; };
    // skyltarna: tidens namn, bara när staden finns. Inte i slag och filmer (då visar levande.js inget heller).
    V.Levande.orter = function (upptagna) {
      const ut = orterFore.apply(this, arguments);
      if (V.Game.skede() === 'strid' || (V.Intro && V.Intro.aktiv)) return ut;
      try {
        rita(); const ar = arNu(), har = ut.map(o => [o.x, o.z]), finns = {}; for (const o of ut) finns[o.plats] = 1;
        for (const k in upptagna) if (k[0] === '_') { const q = k.slice(1).split(','); har.push([q[0] * 2.2, q[1] * 2.2]); }
        for (const p of lagg()) { const l = lage(p.st, ar); if (!l.n) continue;
          if (p.egen && (upptagna[p.st[0]] || finns[p.st[0]] || har.some(a => Math.hypot(a[0] - p.x, a[1] - p.z - 0.9) < 1.5))) continue; const z = p.z + 1.1; ut.push({ id: 't:' + p.st[0] + ':' + l.namn, plats: p.st[0], namn: l.namn, x: p.x, z, y: Math.max(0.02, V.Geo.groundAt(p.x, z)), liten: true }); }
      } catch (e) { /* inget */ }
      return ut;
    };
  }
  V.Orter = { STADER, lage, lagg: () => lagg(), rita };
})();
