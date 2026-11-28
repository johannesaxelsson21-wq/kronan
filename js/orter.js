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
      const ll = G.toLonLat(x, z);
      if (egen) { platser.push({ st, x, z, egen, lon: ll[0], lat: ll[1] }); continue; }
      if (G.sdAt(x, z) < 0.8) { let bast = null; for (let r = 0.3; r < 3 && !bast; r += 0.3) for (let a = 0; a < 6.283; a += 0.5 / r) { const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (G.sdAt(px, pz) > 0.8) { bast = [px, pz]; break; } } if (!bast) continue; [x, z] = bast; }
      platser.push({ st, x, z, lon: st[1], lat: st[2] });
    }
    return platser;
  }
  // ---- stadsplanen (Johannes 2026-11-28: "Jag vill att städerna ska likna hur de såg ut på riktigt", "kan du ändra lite layout osv så varje stad blir unik?") ----
  // Varje stad har en egen beskrivning (STAD nedan) efter hur den låg och såg ut: form, kyrka, borg, vatten. Källor och förenklingar: docs/orter.md.
  // Former: lang = långgata längs stranden, a = ån genom staden med hus på båda stränderna och en bro, backe = husen klättrar upp mot kyrkan på höjden,
  // kors = två gator som korsas på slätten, rutnat = planlagda raka kvarter (städer grundade från 1580), o = tätt på en ö eller udde.
  // Kyrkor: sten (vitkalkad gråsten), tegel, tra (träkyrka med klockstapel), dom (stor kyrka med två torn), ingen.
  // Tillägg: borg (liten borg), ruin, hytta (kopparhytta), kloster, mur (stadsmur eller vall), kanal, hamn (bryggor och sjöbodar), tvakyrkor.
  const STAD = {
    sigtuna: { f: 'lang', k: 'tegel', x: ['ruin', 'ruin', 'hamn'], l: 1.3 }, sodertalje: { f: 'kors', k: 'sten', x: ['hamn'] }, torshalla: { f: 'a', k: 'sten', kp: 'hojd' },
    koping: { f: 'a', k: 'sten', x: ['hamn'] }, trosa: { f: 'a', k: 'sten', l: 0.8 }, osthammar: { f: 'lang', k: 'sten', l: 0.8 }, oregrund: { f: 'lang', k: 'tra', x: ['hamn'], l: 0.8 },
    norrtalje: { f: 'rutnat', k: 'sten', x: ['a'] }, vaxholm: { f: 'o', k: 'tra', x: ['borg'] }, eskilstuna: { f: 'rutnat', k: 'sten', x: ['a', 'hytta'] }, avesta: { f: 'a', k: 'tra', x: ['hytta', 'hytta'] },
    sater: { f: 'lang', k: 'tra', l: 0.9, smal: 1 }, nora: { f: 'rutnat', k: 'tra', x: ['hytta'] }, lindesberg: { f: 'rutnat', k: 'sten' }, askersund: { f: 'rutnat', k: 'sten', x: ['hamn'] },
    karlstad: { f: 'rutnat', k: 'sten', x: ['a', 'hamn'] }, kristinehamn: { f: 'rutnat', k: 'tra', x: ['a', 'hamn'] }, filipstad: { f: 'rutnat', k: 'tra', x: ['hytta'] }, amal: { f: 'rutnat', k: 'tra', x: ['a', 'hamn'] },
    soderhamn: { f: 'rutnat', k: 'sten', x: ['a'] }, hudiksvall: { f: 'lang', k: 'sten', x: ['hamn'] },
    norrkoping: { f: 'a', k: 'sten', x: ['kvarnar'], l: 1.2 }, skanninge: { f: 'kors', k: 'tegel', x: ['ruin'] }, vastervik: { f: 'lang', k: 'sten', x: ['ruin', 'hamn'] }, vimmerby: { f: 'lang', k: 'sten', l: 0.8 },
    eksjo: { f: 'kors', k: 'sten' }, granna: { f: 'lang', k: 'sten', x: ['ruin'], rak: 1, l: 1.2 }, monsteras: { f: 'lang', k: 'tra', l: 0.7 }, hjo: { f: 'lang', k: 'sten', x: ['hamn'], l: 0.8 },
    skovde: { f: 'kors', k: 'sten' }, falkoping: { f: 'kors', k: 'sten', kp: 'hojd' }, lidkoping: { f: 'a', k: 'sten', x: ['hamn'] }, mariestad: { f: 'rutnat', k: 'sten', x: ['a', 'hamn'] },
    alingsas: { f: 'rutnat', k: 'tra', x: ['a'] }, boras: { f: 'rutnat', k: 'tra', x: ['a'] }, lodose: { f: 'lang', k: 'sten', l: 0.9 }, nyalodose: { f: 'a', k: 'sten', l: 0.8 },
    goteborg: { f: 'rutnat', k: 'sten', x: ['kanal', 'mur', 'hamn'] }, bratte: { f: 'lang', k: 'tra', l: 0.7 }, vanersborg: { f: 'rutnat', k: 'tra', x: ['hamn'] },
    kungsbacka: { f: 'a', k: 'tra', l: 0.8 }, laholm: { f: 'backe', k: 'sten', x: ['borg', 'a'] }, uddevalla: { f: 'a', k: 'sten', x: ['hamn'] }, marstrand: { f: 'o', k: 'sten', x: ['hamn', 'kloster'] },
    stromstad: { f: 'lang', k: 'tra', x: ['hamn'] }, helsingborg: { f: 'backe', k: 'tegel', x: ['borg', 'hamn', 'kloster'], l: 1.2 }, landskrona: { f: 'lang', k: 'tegel', x: ['borg', 'hamn'] },
    lund: { f: 'kors', k: 'dom', x: ['mur', 'kloster', 'tvakyrkor'] }, ystad: { f: 'lang', k: 'tegel', x: ['kloster', 'hamn'] }, trelleborg: { f: 'lang', k: 'tegel', x: ['hamn'], l: 0.8 },
    skanor: { f: 'lang', k: 'tegel', x: ['ruin'], l: 0.8 }, falsterbo: { f: 'o', k: 'tegel', x: ['ruin'] }, simrishamn: { f: 'lang', k: 'sten', x: ['hamn'] }, ahus: { f: 'lang', k: 'tegel', x: ['ruin', 'mur'] },
    va: { f: 'kors', k: 'sten', x: ['mur'] }, kristianstad: { f: 'rutnat', k: 'tegel', x: ['mur', 'a'] }, angelholm: { f: 'a', k: 'tegel', l: 0.8 }, bastad: { f: 'lang', k: 'sten', l: 0.8 },
    solvesborg: { f: 'lang', k: 'tegel', x: ['borg'], kp: 'ande' }, elleholm: { f: 'o', k: 'sten', l: 0.6 }, ronneby: { f: 'backe', k: 'sten', x: ['a'] }, lycka: { f: 'a', k: 'tra', x: ['borg'], l: 0.7 },
    kristianopel: { f: 'rutnat', k: 'sten', x: ['mur', 'hamn'], l: 0.7 }, karlshamn: { f: 'rutnat', k: 'sten', x: ['hamn'] }, karlskrona: { f: 'rutnat', k: 'sten', x: ['hamn', 'tvakyrkor'] },
    nadendal: { f: 'lang', k: 'sten', x: ['kloster'], kp: 'ande' }, bjorneborg: { f: 'rutnat', k: 'tra', x: ['a'] }, nystad: { f: 'rutnat', k: 'tra', x: ['hamn'] }, tavastehus: { f: 'rutnat', k: 'tra', x: ['borg'] },
    nyslott: { f: 'o', k: 'tra', x: ['borg'] }, villmanstrand: { f: 'rutnat', k: 'tra', x: ['mur'] }, fredrikshamn: { f: 'rutnat', k: 'tra', x: ['mur', 'hamn'] },
    // spelets egna platser, som de ser ut innan spelet bygger dem
    stockholm: { f: 'o', k: 'tegel', x: ['borg', 'hamn', 'kloster'] }, uppsala: { f: 'a', k: 'dom', x: ['borg'] }, vasteras: { f: 'a', k: 'dom', x: ['borg', 'hamn'] }, orebro: { f: 'a', k: 'sten', x: ['borg'] },
    arboga: { f: 'a', k: 'sten', x: ['kloster'] }, strangnas: { f: 'backe', k: 'dom', x: ['hamn'] }, nykoping: { f: 'a', k: 'sten', x: ['borg', 'hamn'] }, soderkoping: { f: 'lang', k: 'tegel', x: ['kloster'] },
    linkoping: { f: 'kors', k: 'dom', x: ['borg'] }, vadstena: { f: 'lang', k: 'sten', x: ['kloster', 'borg'] }, skara: { f: 'kors', k: 'dom', x: ['kloster'] }, jonkoping: { f: 'lang', k: 'sten', x: ['borg', 'kloster'] },
    enkoping: { f: 'kors', k: 'sten', x: ['ruin'] }, hedemora: { f: 'kors', k: 'sten' }, gavle: { f: 'a', k: 'sten', x: ['hamn'] }, sala: { f: 'kors', k: 'sten', x: ['hytta'] }, kalmar: { f: 'o', k: 'sten', x: ['borg', 'mur', 'hamn'] },
    visby: { f: 'backe', k: 'dom', x: ['mur', 'ruin', 'ruin', 'hamn'] }, halmstad: { f: 'a', k: 'tegel', x: ['mur', 'hamn'] }, varberg: { f: 'lang', k: 'tegel', x: ['borg', 'hamn'] }, falkenberg: { f: 'a', k: 'tra' },
    malmo: { f: 'lang', k: 'tegel', x: ['borg', 'mur', 'hamn'], l: 1.3 }, kopenhamn: { f: 'lang', k: 'tegel', x: ['borg', 'mur', 'hamn'], l: 1.4 }, abo: { f: 'a', k: 'dom', x: ['borg', 'hamn'] },
    borga: { f: 'backe', k: 'sten', x: ['a'] }, raumo: { f: 'lang', k: 'sten', x: ['kloster', 'hamn'] }, ulvsby: { f: 'a', k: 'sten' }, ekenas: { f: 'o', k: 'sten', x: ['hamn'] },
    helsingfors: { f: 'a', k: 'tra', x: ['hamn'] }, viborg: { f: 'o', k: 'sten', x: ['borg', 'mur', 'hamn'] }, reval: { f: 'backe', k: 'tegel', x: ['borg', 'mur', 'hamn', 'tvakyrkor'] }, narva: { f: 'a', k: 'sten', x: ['borg', 'mur'] }
  };
  const SKALA = 0.72;
  // Var en känd byggnad (kanda.js) står i en stad från den här listan: i stadens mitt, eller närmast torr mark intill
  function kandaPlats(q) { const G = V.Geo; if (G.sdAt(q.x, q.z) > 0.6) return { x: q.x, z: q.z }; for (let r = 0.4; r < 3; r += 0.4) for (let a = 0; a < 6.283; a += 0.5) { const x = q.x + Math.cos(a) * r, z = q.z + Math.sin(a) * r; if (G.sdAt(x, z) > 0.6) return { x, z }; } return { x: q.x, z: q.z }; }
  // orter där kanda.js ritar ortens kända kyrka (i stället för stadens egen)
  const KANDA_KYRKA = { strangnas: 1, linkoping: 1, lund: 1, skara: 1, mariestad: 1, sigtuna: 1, nadendal: 1, uppsala: 1, vasteras: 1, stockholm: 1, abo: 1, visby: 1 };
  // en egen slump per stad, så att också två städer med samma form ser olika ut
  function slump(id) { let h = 7; for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 2654435761) >>> 0; return V.Geo.rng(h); }
  function stadsplan(id, n, planerad) {
    const d = STAD[id] || {}, rnd = slump(id), ut = [], L0 = (n === 3 ? 2.7 : n === 2 ? 1.9 : 1.0) * Math.min(1, d.l || 1);
    let f = d.f || (planerad ? 'rutnat' : 'lang'); if (n === 1) f = f === 'rutnat' ? 'kors' : f;
    const h = (x, z, rot, stor) => ut.push({ x: x + (rnd() - 0.5) * 0.07, z: z + (rnd() - 0.5) * 0.07, rot: rot + (rnd() - 0.5) * 0.1, typ: 'hus', stor });
    const tat = 0.92 + rnd() * 0.14, bojd = d.rak ? 0 : (rnd() - 0.5) * 0.5;          // hur tätt husen står och hur mycket gatan böjer sig
    const gata = (x0, x1, z0, sid, steg) => { for (let x = x0; x <= x1 + 1e-6; x += steg || tat) { const t = x / Math.max(1, L0), z = z0 + bojd * t * t * L0, a = Math.atan(2 * bojd * t); for (const s of sid) if (rnd() > 0.08) h(x, z + s * (d.smal ? 0.45 : 0.55), (s > 0 ? Math.PI : 0) - a * s); } };
    let kyrka = [0, 1.7], torg = [0, 0.75];
    if (f === 'rutnat') {
      const nx = n === 3 ? 4 : n === 2 ? 3 : 2, nz = n === 3 ? 3 : 2, B = 1.25 * (0.95 + rnd() * 0.15), tx = Math.floor(nx / 2) - (nx % 2 ? 0 : rnd() < 0.5 ? 1 : 0), tz = nz > 2 ? 1 : 0;
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
        const cx = (i - (nx - 1) / 2) * B * 1.35, cz = (j - (nz - 1) / 2) * B * 1.35 + 0.4;
        if (i === tx && j === tz) { torg = [cx, cz]; continue; }
        if (i === tx && j === tz + 1 || (nz === 2 && i === tx && j !== tz)) { kyrka = [cx, cz]; continue; }
        const per = rnd() < 0.5 ? 2 : 3;          // två eller tre gårdar mot varje gata
        for (let q = 0; q < per; q++) { const o = (q - (per - 1) / 2) * 0.78; h(cx + o, cz - 0.3, 0); h(cx + o, cz + 0.3, Math.PI); }
      }
      if ((d.x || []).indexOf('kanal') >= 0) ut.push({ typ: 'kanal', x: 0, z: (torg[1] + 0.4) / 2 - 0.25, w: nx * B * 1.35 });
    } else if (f === 'kors') {
      const vrid = (rnd() - 0.5) * 0.5, c = Math.cos(vrid), s = Math.sin(vrid);
      gata(-L0, L0, 0, [-1, 1]); const tmp = []; ut.splice(0).forEach(u => tmp.push(u));
      for (let z = -L0 * 0.8; z <= L0 * 0.8 + 1e-6; z += tat) if (Math.abs(z) > 0.8) for (const sx of [-1, 1]) if (rnd() > 0.1) tmp.push({ x: sx * 0.55 * c + z * s, z: z * c - sx * 0.55 * s, rot: sx > 0 ? -Math.PI / 2 : Math.PI / 2, typ: 'hus' });
      tmp.forEach(u => { if (Math.abs(u.x) > 0.8 || Math.abs(u.z) > 0.8) ut.push(u); }); torg = [0, 0]; kyrka = rnd() < 0.5 ? [1.4, 1.3] : [-1.4, 1.3];
    } else if (f === 'a') {
      // ån går längs lokal x genom mitten: gator på båda stränderna, en bro, torget på ena sidan och kyrkan på den andra
      for (const s of [-1, 1]) gata(-L0, L0, s * 0.95, [s]);
      for (const s of [-1, 1]) for (let x = -L0 * 0.7; x <= L0 * 0.7 + 1e-6; x += tat * 1.1) if (Math.abs(x) > 0.7 && rnd() < 0.8) h(x, s * 2.15, s > 0 ? 0 : Math.PI);
      ut.push({ typ: 'bro', x: (rnd() - 0.5) * 0.8, z: 0 }); torg = [-0.6, 1.25]; kyrka = [0.9, -1.75];
    } else if (f === 'backe') {
      // gatan längs stranden och husen i terrasser upp mot kyrkan
      gata(-L0, L0, -0.4, [-1, 1]);
      for (let r = 1; r <= (n === 3 ? 3 : 2); r++) for (let x = -L0 * (1 - r * 0.22); x <= L0 * (1 - r * 0.22) + 1e-6; x += tat) if (rnd() > 0.15) h(x, 0.35 + r * 0.72, Math.PI);
      torg = [L0 * 0.45, 0.4]; kyrka = [0, (n === 3 ? 3 : 2) * 0.72 + 1.2];
    } else if (f === 'o') {
      // tätt på en ö eller udde: korta gator kring torget, hus åt alla håll
      const ring = n === 3 ? 3 : 2;
      for (let r = 1; r <= ring; r++) { const m = Math.round(5 * r * (0.9 + rnd() * 0.3)); for (let k = 0; k < m; k++) { const a = k / m * 6.283 + rnd() * 0.3; if (rnd() > 0.1) h(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.75, Math.atan2(-Math.cos(a), -Math.sin(a))); } }
      torg = [0, 0]; kyrka = [0.35, 0.05]; ut.forEach(u => { if (Math.hypot(u.x - kyrka[0], u.z - kyrka[1]) < 0.95) u.typ = 'bort'; });
    } else {
      // lang: långgatan längs stranden, torget mot land, kyrkan en bit upp, gränder upp från gatan
      gata(-L0, L0, 0, [-1, 1]); ut.forEach(u => { if (Math.abs(u.x - torg[0]) < 0.7 && u.z > 0) u.typ = 'bort'; });
      for (const sx of [-1, 1]) { const gx = sx * L0 * (0.45 + rnd() * 0.3); h(gx - 0.42, 1.35, Math.PI / 2); h(gx + 0.42, 1.35, -Math.PI / 2); if (n === 3) { h(gx - 0.42, 2.05, Math.PI / 2); h(gx + 0.42, 2.05, -Math.PI / 2); } }
      if (n === 3) gata(-L0 * 0.8, L0 * 0.8, 2.6, [-1, 1]);
      if (d.kp === 'ande') { kyrka = [L0 + 0.9, 0.5]; torg = [-0.3, 0.75]; }
      else kyrka = [(rnd() - 0.5) * L0 * 0.6, n === 3 ? 1.9 : 1.75];
    }
    if (n >= 2 && d.k !== 'ingen') ut.push({ typ: 'kyrka', x: kyrka[0], z: kyrka[1], rot: Math.PI + (rnd() - 0.5) * 0.3, sort: n === 1 ? 'tra' : d.k || 'sten' });
    if (n >= 2) ut.push({ typ: 'torg', x: torg[0], z: torg[1] });
    // tilläggen: på egna platser runt staden
    const ext = (d.x || []).filter(e => e !== 'a' && e !== 'kanal'), R = (n === 3 ? 3.6 : 2.6) * (d.l || 1);
    ext.forEach((e, i) => {
      const sida = i % 2 ? 1 : -1, x = sida * (R * 0.75 + rnd() * 0.4), z = e === 'hamn' ? -1.15 : 0.6 + rnd() * 1.2;
      if (e === 'mur') ut.push({ typ: 'mur', rx: R * 1.05, rz: R * 0.75 + 0.6 });
      else if (e === 'hamn') ut.push({ typ: 'hamn', x: (rnd() - 0.5) * L0, z: -1.25 });
      else ut.push({ typ: e, x, z, rot: rnd() * 6.283 });
    });
    if (n >= 2 && (d.x || []).indexOf('tvakyrkor') >= 0) ut.push({ typ: 'kyrka', x: -kyrka[0] - 1.2, z: kyrka[1] + 0.3, rot: Math.PI, sort: 'sten', extra: 1 });
    return { ut: ut.filter(u => u.typ !== 'bort'), f };
  }
  // åt vilket håll vattnet ligger (stranden): stadens gata går längs den. Långt från vatten: efter fröet.
  function landRiktning(x, z, seed) {
    const G = V.Geo; let bx = 0, bz = 0, min = 1e9;
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283; for (const r of [1.5, 3, 4.5]) { const d = G.sdAt(x + Math.cos(a) * r, z + Math.sin(a) * r); if (d < min) { min = d; bx = Math.cos(a); bz = Math.sin(a); } } }
    if (min > 1.2) { const a = seed * 2.4; return [Math.cos(a), Math.sin(a)]; }
    return [-bx, -bz];          // bort från vattnet
  }
  // åns riktning vid staden (närmaste älv på kartan), för städer som ligger vid en å
  function aRiktning(x, z) {
    let best = 3, dir = null;
    for (const r of (V.Geo.G && V.Geo.G.rivers) || []) for (let q = 0; q + 1 < r.pts.length; q++) { const a = r.pts[q], b = r.pts[q + 1], d = V.Geo.segDist(x, z, a, b); if (d < best) { best = d; const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; dir = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; } }
    return dir;
  }
  // kyrkorna: vitkalkad gråsten, tegel, trä med klockstapel, eller en stor kyrka med två torn
  function kyrka(mb, sort) {
    const B = V.Bygge;
    if (sort === 'sten') { B.kyrka(mb); return; }
    const vagg = sort === 'tra' ? '#7b6650' : '#a1503a', lag = sort === 'tra' ? '#4f3f31' : '#733526', tak = sort === 'tegel' || sort === 'dom' ? '#52635f' : '#4a3e34', k = sort === 'dom' ? 1.45 : 1;
    mb.push().scale(k);
    mb.box(0, 0, 0, 1.3, 0.62, 0.62, vagg, { low: lag, noTop: true }); mb.gable(0, 0.62, 0, 1.3, 0.42, 0.62, tak, { over: 0.04, gable: vagg });
    mb.box(0.85, 0, 0, 0.42, 0.48, 0.5, vagg, { low: lag, noTop: true }); mb.gable(0.85, 0.48, 0, 0.42, 0.32, 0.5, tak, { over: 0.03, gable: vagg });
    if (sort === 'tra') { mb.push().move(-1.1, 0, 0.5); mb.box(0, 0, 0, 0.34, 0.75, 0.34, '#5e4a38', { noTop: true }); mb.cone(0, 0.75, 0, 0.3, 0.42, 4, tak); mb.pop(); }          // klockstapeln
    else if (sort === 'dom') for (const sz of [-0.2, 0.2]) { mb.box(-0.78, 0, sz, 0.3, 1.35, 0.3, vagg, { low: lag, noTop: true }); mb.cone(-0.78, 1.35, sz, 0.22, 0.55, 4, tak); }
    else { mb.box(-0.8, 0, 0, 0.42, 1.15, 0.42, vagg, { low: lag, noTop: true }); mb.gable(-0.8, 1.15, 0, 0.42, 0.35, 0.42, tak, { gable: vagg }); }          // tegelkyrkans torn med sadeltak
    mb.pop();
  }
  function hus(p, n, seed, maxR) {
    const B = V.Bygge, G = V.Geo, mb = new V.MB();
    let sk = B.K * SKALA; const id = p.st[0], start = p.st[3][0][0] === ST ? ST : (p.st[3].find(f => f[1] >= 2) || [0])[0];
    const planerad = !p.egen && start >= 1580, dansk = (p.lat < 56.95 && p.lon < 16.3) || (p.lon < 12.5 && p.lat < 57.55);          // Skåne, Blekinge, Halland och Danmark
    const plan = stadsplan(id, n, planerad), d = STAD[id] || {}, rnd = slump(id + 'h');
    { let ext = 0.5; for (const it of plan.ut) ext = Math.max(ext, it.typ === 'mur' ? Math.max(it.rx, it.rz) : Math.hypot(it.x || 0, it.z || 0) + 0.5); if (maxR && ext * sk > maxR) sk = maxR / ext; }          // ingen stad flyter ihop med grannen
    let u = landRiktning(p.x, p.z, seed);
    if (plan.f === 'a' || (d.x || []).indexOf('a') >= 0) { const ar = aRiktning(p.x, p.z); if (ar) u = plan.f === 'a' ? [-ar[1], ar[0]] : u; }          // ån: gatorna längs ån
    const rot = Math.atan2(u[0], u[1]), c = Math.cos(rot), s = Math.sin(rot), y0 = G.groundAt(p.x, p.z);
    const varld = (x, z) => [p.x + (x * c + z * s) * sk, p.z + (-x * s + z * c) * sk], torr = (x, z, m) => { const w = varld(x, z); return G.sdAt(w[0], w[1]) > (m || 0.35) && G.riverAt(w[0], w[1]) > 0.25; };
    const Y = (x, z) => { const w = varld(x, z); return (G.groundAt(w[0], w[1]) - y0) / sk; };
    const roof = () => dansk ? 'tegel' : rnd() < 0.3 ? 'torv' : 'span';
    // en känd byggnad från kanda.js (Lunds domkyrka, Kärnan, Malmöhus ...) står strax norr om staden: då ritas inte stadens egen kyrka eller borg, och platsen hålls fri
    const kl = V.Kanda && V.Kanda.lista ? V.Kanda.lista() : null, kandaHar = kl && ['borg', 'dom', 'kyrka', 'ort'].some(k => kl[k].indexOf(id) >= 0);
    const kandaKyrka = kl && (kl.dom.indexOf(id) >= 0 || kl.kyrka.indexOf(id) >= 0 || KANDA_KYRKA[id]);
    let kp = null; if (kandaHar) { const k = kandaPlats(p); kp = [k.x, k.z]; }
    for (const it of plan.ut) {
      if (kandaHar && (it.typ === 'borg' || (it.typ === 'kyrka' && kandaKyrka && !it.extra))) continue;
      if (kp && it.typ !== 'mur') { const w = varld(it.x || 0, it.z || 0); if (Math.hypot(w[0] - kp[0], w[1] - kp[1]) < 1.35) continue; }
      if (it.typ === 'mur') { for (let k = 0; k < 28; k++) { if (k % 7 === 3) continue; const a0 = k / 28 * 6.283, a1 = (k + 1) / 28 * 6.283, x0 = Math.cos(a0) * it.rx, z0 = Math.sin(a0) * it.rz, x1 = Math.cos(a1) * it.rx, z1 = Math.sin(a1) * it.rz; if (!torr((x0 + x1) / 2, (z0 + z1) / 2, 0.2)) continue; const L = Math.hypot(x1 - x0, z1 - z0); mb.push().move((x0 + x1) / 2, Y((x0 + x1) / 2, (z0 + z1) / 2), (z0 + z1) / 2).rotY(Math.atan2(-(z1 - z0), x1 - x0)); mb.box(0, 0, 0, L + 0.05, 0.3, 0.12, dansk ? '#7a8a55' : '#a49c8c', { low: dansk ? '#5c6a3e' : '#7d776a' }); mb.pop(); } continue; }
      if (it.typ === 'kanal') { mb.box(it.x, Y(it.x, it.z) + 0.005, it.z, it.w, 0.02, 0.28, '#4f7f9a', { low: '#3c6178' }); continue; }
      if (it.typ === 'hamn') { for (let k = -1; k <= 1; k++) { const x = it.x + k * 0.9; if (torr(x, it.z + 0.5) && !torr(x, it.z - 0.4)) { mb.box(x, 0, it.z - 0.15, 0.14, 0.05, 0.9, '#7b6650'); mb.push().move(x + 0.3, Y(x + 0.3, it.z + 0.45), it.z + 0.45); B.stuga(mb, 0.42, 0.34, 0.24, 'span', { vagg: '#8a3b2a', vaggLag: '#5e2a1f', gavel: '#8a3b2a' }); mb.pop(); } } continue; }
      if (!torr(it.x, it.z)) continue;
      const y = Y(it.x, it.z);
      if (it.typ === 'torg') { mb.push().move(it.x, y, it.z); mb.box(0, 0, 0, 1.0 + rnd() * 0.3, 0.03, 0.7 + rnd() * 0.2, '#9b8f78', { low: '#7d735f' }); mb.pop(); continue; }
      if (it.typ === 'bro') { mb.push().move(it.x, Math.max(0.05, y), it.z); mb.box(0, 0, 0, 0.32, 0.08, 1.4, '#6f5c49', { low: '#4f3f31' }); mb.pop(); continue; }
      mb.push().move(it.x, y, it.z).rotY(it.rot || 0);
      if (it.typ === 'kyrka') kyrka(mb, it.sort);
      else if (it.typ === 'borg') { mb.scale(0.75); B.borg(mb, 'liten', 0); }
      else if (it.typ === 'ruin') { mb.box(0, 0, 0, 0.9, 0.32, 0.12, '#9a9384', { low: '#6f6a60' }); mb.box(-0.4, 0, 0.3, 0.12, 0.45, 0.6, '#9a9384', { low: '#6f6a60' }); }
      else if (it.typ === 'hytta') B.hytta(mb, 1);
      else if (it.typ === 'kloster') { B.stuga(mb, 1.5, 0.55, 0.4, dansk ? 'tegel' : 'span', { vagg: '#e2dbc9', vaggLag: '#bfb7a5', gavel: '#e2dbc9' }); }
      else if (it.typ === 'kvarnar') for (let k = 0; k < 3; k++) { mb.push().move(k * 0.6, 0, 0); B.stuga(mb, 0.45, 0.4, 0.3, 'span', {}); mb.pop(); }
      else { const sz = 0.8 + rnd() * 0.3, hog = !dansk && n >= 2 && rnd() < 0.18, opt = { skorsten: rnd() < 0.6 ? 1 : 0, ljus: rnd() < 0.4 };
        if (dansk) { opt.vagg = rnd() < 0.5 ? '#d6ccb4' : '#cbbfa2'; opt.vaggLag = '#9c907a'; opt.gavel = opt.vagg; }
        B.stuga(mb, 0.58 * sz, 0.5 * (0.9 + rnd() * 0.25), (hog ? 0.56 : 0.34) * (0.9 + rnd() * 0.2), roof(), opt); }
      mb.pop();
    }
    const m = B.mesh(mb); m.scale.setScalar(sk); m.rotation.y = rot; return m;
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
    // grannarna: mina städer och spelets egna (som är stora, ungefär 5 enheter i radie)
    const mina = lagg().filter(p => { const l = lage(p.st, ar); return l.n && !(p.egen && ritas[p.st[0]]); }), spelets = [];
    for (const id in ritas) if (V.Rike.P[id]) spelets.push({ x: V.Rike.P[id].x, z: V.Rike.P[id].z, r: V.Game.s.bas[id] ? 5.2 : 2.7 });
    // de kända byggnaderna (kanda.js) står strax norr om sin stad: de får inte heller hamna i grannstaden
    const kl = V.Kanda && V.Kanda.lista ? V.Kanda.lista() : null;
    if (kl) for (const q of lagg()) if (['borg', 'dom', 'kyrka', 'ort'].some(k => kl[k].indexOf(q.st[0]) >= 0)) { const k = kandaPlats(q); spelets.push({ x: k.x, z: k.z, r: 1.5, agare: q }); }
    mina.forEach((p, i) => {
      const l = lage(p.st, ar); let maxR = 9;
      for (const q of mina) if (q !== p) maxR = Math.min(maxR, Math.hypot(q.x - p.x, q.z - p.z) * 0.42);
      for (const q of spelets) { if (q.agare === p) continue; const dd = Math.hypot(q.x - p.x, q.z - p.z); if (dd > 0.5) maxR = Math.min(maxR, dd - q.r); }
      if (maxR < 0.6) maxR = 0.6;
      const m = hus(p, l.n, lagg().indexOf(p) + 1, maxR); m.position.set(p.x, V.Geo.groundAt(p.x, p.z), p.z); grupp.add(m); });
    scene.add(grupp);
  }

  // gläntor i skogen där städerna står (skogen ritas en gång, så alla städer får sin plats från början)
  if (V.Rike && V.Rike.clearings) {
    const fore = V.Rike.clearings;
    V.Rike.clearings = function () { const c = fore.apply(this, arguments); try { for (const p of lagg()) { const n = Math.max(...p.st[3].map(f => f[1])); c.push({ x: p.x, z: p.z, r: n === 3 ? 3.8 : n === 2 ? 2.9 : 1.8 }); } } catch (e) { /* kartan inte klar */ } return c; };
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
  // Spelets stora städer (Tomt.plan i bygge.js frågar här): gatorna längs ån för städer vid en å, och slingrande gator i medeltida städer.
  // Planlagda städer (rutnät i STAD) behåller sina raka kvarter.
  // Slottets och domkyrkans lägen i spelets stora städer, i tomtens enheter (x österut, z söderut, staden är ungefär 4,5 i radie).
  // Uppsala: domkyrkan och slottet väster om Fyrisån, slottet söder om domkyrkan på åsen, staden öster om ån. Stockholm: slottet på Stadsholmens norra del,
  // Storkyrkan strax söder om det. Västerås: slottet i söder vid Mälaren, domkyrkan i norr. Kalmar: slottet söder om staden. Viborg: slottet på holmen i väster.
  // Reval: Domberget med slottet i väster, nedre staden österut. Narva: slottet vid ån i öster. (sv. Wikipedia om städerna och slotten; avstånden är förenklade.)
  const LAGE = { uppsala: { dom: [-1.7, -0.3], borg: [-2.0, 1.7] }, stockholm: { borg: [0.3, -2.5], dom: [1.2, -0.7] }, vasteras: { borg: [0.4, 2.1], dom: [-0.4, -1.9] },
    kalmar: { borg: [0.3, 2.3] }, viborg: { borg: [-2.3, -0.6] }, reval: { borg: [-2.4, 0.2] }, narva: { borg: [2.2, 0.2] } };
  V.Stadsplan = function (id, p) {
    const d = STAD[id]; if (!d) return null;
    const ut = { oregelbunden: d.f !== 'rutnat' }, lg = LAGE[id]; if (lg) { ut.borg = lg.borg; ut.dom = lg.dom; }
    if (d.f === 'a' || (d.x || []).indexOf('a') >= 0) { const r = aRiktning(p.x, p.z); if (r) ut.u = r; }
    return ut;
  };
  V.Orter = { kandaPlats, STADER, lage, lagg: () => lagg(), rita };
})();
