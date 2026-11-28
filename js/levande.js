// Den levande kartan (Johannes 2026-11-28): andra personer i historien syns på kartan medan din egen berättelse pågår.
// De går runt i staden där de är, och reser vidare när det hände i verkligheten (styrs av spelets datum, G.datum()).
// Och alla orter som texterna nämner har en liten skylt på rätt plats.
(function () {
  'use strict';
  const V = window.VASA, D = V.DATA;

  // Orter som texterna nämner men som inte är egna platser i spelet: [longitud, latitud, namn]. Namn null = ingen skylt (en punkt till sjöss).
  const ORT = {
    kalo: [10.48, 56.29, 'Kalø'], jonkoping: [14.16, 57.78, 'Jönköping'], nydala: [14.43, 57.28, 'Nydala kloster'], asunden: [13.33, 57.70, 'Åsunden'],
    enkoping: [17.08, 59.64, 'Enköping'], romfartuna: [16.53, 59.72, 'Romfartuna'], dalaro: [18.40, 59.13, 'Dalarö'], falkenberg: [12.49, 56.90, 'Falkenberg'],
    bohus: [11.99, 57.86, 'Bohus'], hova: [14.21, 58.86, 'Hova'], aspeboda: [15.46, 60.58, 'Aspeboda'], rankhyttan: [15.57, 60.51, 'Rankhyttan'],
    vissefjarda: [15.58, 56.53, 'Vissefjärda'], borga: [25.66, 60.39, 'Borgå'], ekenas: [23.43, 59.97, 'Ekenäs'], raumo: [21.51, 61.13, 'Raumo'], ulvsby: [21.88, 61.43, 'Ulvsby'],
    vilnius: [25.28, 54.69, 'Vilnius'], warnemunde: [12.08, 54.17, 'Warnemünde'], mon: [12.35, 54.95, 'Mön'], bukow: [11.7, 54.12, 'Bukow'], storakarlso: [17.97, 57.29, 'Stora Karlsö'],
    odensala: [17.83, 59.66, 'Odensala'], bjorkenas: [16.33, 56.71, 'Björkenäs'], hapsal: [23.54, 58.94, 'Hapsal'], jamburg: [28.6, 59.38, 'Jamburg'], koporje: [29.03, 59.71, 'Koporje'],
    plussa: [28.3, 59.12, 'Plussa'], ivangorod: [28.24, 59.37, 'Ivangorod'], kastelholm: [19.98, 60.23, 'Kastelholm'], varfruberga: [16.93, 59.37, 'Vårfruberga'],
    kattegatt: [11.5, 57.3, null], oresund: [12.75, 55.95, null]
  };
  // Namn på platser i spelet som inte är baser (baserna har sina egna namn)
  const NAMN = { vadla: 'Vädla', brannkyrka: 'Brännkyrka', bogesund: 'Bogesund', rafsnas: 'Räfsnäs', lubeck: 'Lübeck', kopenhamn: 'Köpenhamn', malmo: 'Malmö', alvsborg: 'Älvsborg',
    soderkoping: 'Söderköping', storatuna: 'Stora Tuna', kisa: 'Kisa', virserum: 'Virserum', skara: 'Skara', strangnas: 'Strängnäs', stegeborg: 'Stegeborg', orebro: 'Örebro', arboga: 'Arboga',
    halmstad: 'Halmstad', varberg: 'Varberg', axtorna: 'Axtorna', mared: 'Mared', visby: 'Visby', getaryggen: 'Getaryggen', wenden: 'Wenden', wesenberg: 'Wesenberg', kexholm: 'Kexholm',
    orbyhus: 'Örbyhus', borgholm: 'Borgholm', drottningholm: 'Drottningholm', staket: 'Stäket', brunkeberg: 'Brunkeberg', brunnback: 'Brunnbäck', kronoberg: 'Kronoberg', bornholm: 'Bornholm',
    smaland: 'Småland', halsingland: 'Hälsingland', lima: 'Lima', salen: 'Sälen', kivinebb: 'Kivinebb', olandsudde: 'Ölands norra udde', narva: 'Narva', reval: 'Reval', nykoping: 'Nyköping' };
  const KALLA = 'sv. Wikipedia';

  // Personerna, per värld. stopp: [år, månad, plats, { sjo: flagga på skeppet, via: [platser på vägen], mer: vad personen gör där }].
  // Plats null = personen lämnar kartan. Datumen följer historien. Namnskyltarna säger bara vem det är, aldrig vad som ska hända.
  const FIG = {
    0: [
      { id: 'gustavE', namn: 'Gustav Eriksson', sort: 'gustav', kalla: 'sv. Wikipedia, Gustav Vasa och Kalø', stopp: [
        [1512, 1, 'uppsala', { mer: 'Gustav Eriksson är en ung adelsman, son till riksrådet Erik Johansson. Han har gått i skola i Uppsala.' }],
        [1514, 6, 'stockholm', { mer: 'Gustav Eriksson tjänar vid Sten Stures hov i Stockholm, som många unga adelsmän.' }],
        [1518, 7.4, 'brannkyrka', { via: ['nykoping'], mer: 'Gustav Eriksson rider med Sten Stures här. Vid Brännkyrka bär han rikets fana.' }],
        [1518, 8.6, 'stockholm', { mer: 'Kristian II vill förhandla och kräver gisslan. Gustav Eriksson är en av de sex unga männen som skickas ut till honom.' }],
        [1518, 9.6, 'kopenhamn', { sjo: 'danmark', mer: 'Kristian håller inte sitt ord. Han seglar hem till Danmark med gisslan ombord, och Gustav Eriksson är fånge.' }],
        [1518, 10.6, 'kalo', { sjo: 'danmark', mer: 'Gustav Eriksson hålls fången på Kalø slott på Jylland, hos Erik Banér, en släkting till honom.' }],
        [1519, 9.3, 'lubeck', { mer: 'Gustav Eriksson rymmer från Kalø. Det berättas att han är klädd som oxdrivare. Han tar sig söderut till den fria staden Lübeck.' }],
        [1520, 5.95, 'kalmar', { sjo: 'lubeck', mer: 'Med ett lybskt skepp kommer Gustav Eriksson hem. Den 31 maj går han i land vid Stensö strax söder om Kalmar.' }],
        [1520, 6.8, 'smaland', { mer: 'Kalmar vill inte resa sig. Gustav Eriksson tar sig upp genom Småland och söker stöd hos bönderna, men få lyssnar.' }],
        [1520, 8.4, 'rafsnas', { via: ['soderkoping', 'nykoping'], mer: 'Gustav Eriksson kommer till sin fars gård Räfsnäs i Södermanland, vid Mälaren. Där väntar han på vad som ska hända med Stockholm.' }]] },
      { id: 'kristian', namn: 'Kristian II', sort: 'kristian', kalla: 'sv. Wikipedia, Kristian II och Slaget vid Brännkyrka', stopp: [
        [1512, 1, 'kopenhamn', { mer: 'Kristian är son till kung Hans av Danmark. Från 1513 är han själv kung i Danmark och Norge, och han vill ha Sverige tillbaka i unionen.' }],
        [1518, 5.8, 'stockholm', { sjo: 'danmark', mer: 'Kristian II kommer själv med flotta och här och belägrar Stockholm från midsommar.' }],
        [1518, 9.5, 'kopenhamn', { sjo: 'danmark', mer: 'Belägringen har misslyckats. Kristian seglar hem till Köpenhamn med sex svenska gisslan ombord.' }],
        [1520, 5.5, 'stockholm', { sjo: 'danmark', mer: 'Kristian II kommer med sin flotta i slutet av maj, och Stockholm stängs in till lands och sjöss.' }]] },
      { id: 'trolle', namn: 'Gustav Trolle', sort: 'trolle', kalla: 'sv. Wikipedia, Gustav Trolle och Almarestäkets borg', stopp: [
        [1515, 6, 'uppsala', { mer: 'Gustav Trolle kommer hem från Rom som ny ärkebiskop i Uppsala, kyrkans högste man i Sverige.' }],
        [1516, 9, 'staket', { mer: 'Ärkebiskopen sitter på sin borg Stäket vid Mälaren. Han håller på unionen och Danmarks kung.' }],
        [1517, 12, 'stockholm', { mer: 'Gustav Trolle är avsatt och hålls fången.' }],
        [1520, 3, 'uppsala', { via: ['brunkeberg'], mer: 'Sten Sture är död. Gustav Trolle är fri, och Kristian vill ha honom tillbaka som ärkebiskop.' }]] },
      { id: 'kristina', namn: 'Kristina Gyllenstierna', kvinna: ['#7a2a3a', '#f2eee2'], ej: 'kristina', kalla: 'sv. Wikipedia, Kristina Nilsdotter (Gyllenstierna)', stopp: [
        [1512, 1, 'stockholm', { mer: 'Kristina Gyllenstierna är gift med Sten Sture och bor på Stockholms slott.' }]] }
    ],
    1: [
      { id: 'kristian', namn: 'Kristian II', sort: 'kristian', kalla: 'sv. Wikipedia, Kristian II och Blodbadet i Nydala', stopp: [
        [1520, 12, 'stockholm', { mer: 'Kristian II är krönt till kung av Sverige. Nu gör han sig redo att lämna Stockholm och resa hem till Danmark.' }],
        [1521, 1.6, 'jonkoping', { via: ['nykoping', 'soderkoping'], mer: 'Kristian II reser söderut genom Sverige, mot Danmark.' }],
        [1521, 2.05, 'nydala', { mer: 'Vid Nydala kloster i Småland låter Kristian avrätta abboten och flera munkar.' }],
        [1521, 2.4, 'kopenhamn', { mer: 'Kristian II är tillbaka i Köpenhamn.' }],
        [1523, 4.3, 'kattegatt', { sjo: 'danmark', mer: 'De danska stormännen har avsatt Kristian. I april 1523 lämnar han Danmark med sina skepp för att söka hjälp utomlands.' }],
        [1523, 4.7, null, {}]] },
      { id: 'trolle', namn: 'Gustav Trolle', sort: 'trolle', kalla: 'sv. Wikipedia, Gustav Trolle', stopp: [
        [1521, 1, 'stockholm', { mer: 'Ärkebiskop Gustav Trolle är i Stockholm, där danskarna styr.' }],
        [1521, 4.5, 'uppsala', { mer: 'Ärkebiskopen är i sin stad Uppsala.' }],
        [1521, 5.7, 'stockholm', { via: ['brunkeberg'], mer: 'Bönderna har tagit ärkebiskopsgården i Uppsala, och Gustav Trolle har tagit sig till Stockholm.' }],
        [1521, 9.2, 'kopenhamn', { sjo: 'danmark', mer: 'I september 1521 måste Gustav Trolle lämna Sverige. Han far till Danmark.' }]] },
      { id: 'kristina', namn: 'Kristina Gyllenstierna', kvinna: ['#7a2a3a', '#f2eee2'], kalla: 'sv. Wikipedia, Kristina Nilsdotter (Gyllenstierna) och Blåtårn', stopp: [
        [1521, 1, 'stockholm', { mer: 'Sten Stures änka Kristina Gyllenstierna sitter fången på Stockholms slott.' }],
        [1521, 9, 'kopenhamn', { sjo: 'danmark', mer: 'Kristina Gyllenstierna förs till Danmark och sätts i Blåtårn, fängelsetornet på Köpenhamns slott.' }],
        [1524, 1.5, 'kalmar', { sjo: 'danmark', mer: 'I januari 1524 får Kristina Gyllenstierna komma hem till Sverige, tillsammans med sin mor och sin son Nils.' }],
        [1524, 3, null, {}]] },
      { id: 'slagheck', namn: 'Didrik Slagheck', sort: 'slagheck', kalla: 'sv. Wikipedia, Didrik Slagheck', stopp: [
        [1521, 1, 'stockholm', { mer: 'Didrik Slagheck styr Sverige åt Kristian II, från Stockholms slott.' }],
        [1521, 4, 'vasteras', { mer: 'Didrik Slagheck leder danskarna i Västerås.' }],
        [1521, 5, 'stockholm', { mer: 'Didrik Slagheck är tillbaka i Stockholm.' }],
        [1521, 9, 'kopenhamn', { sjo: 'danmark', mer: 'Didrik Slagheck kallas hem till Danmark. Kristian gör honom till ärkebiskop i Lund.' }],
        [1522, 1.8, null, {}]] },
      { id: 'norby', namn: 'Søren Norby', sort: 'norby', kalla: 'sv. Wikipedia, Sören Norby', stopp: [
        [1521, 1, 'visby', { mer: 'Den danske sjöhjälten Søren Norby håller Gotland och Visby åt Kristian II.' }],
        [1525, 8, null, {}]] }
    ],
    2: [
      { id: 'johan', namn: 'Hertig Johan', sort: 'johan', kalla: 'sv. Wikipedia, Johan III', stopp: [
        [1560, 8, 'abo', { mer: 'Eriks bror Johan är hertig av Finland och håller hov på Åbo slott.' }],
        [1561, 3.6, 'arboga', { sjo: 'sverige', via: ['stockholm'], mer: 'Hertig Johan kommer till riksmötet i Arboga.' }],
        [1561, 6, 'abo', { via: ['stockholm'], sjo: 'sverige', mer: 'Hertig Johan är tillbaka i Åbo.' }],
        [1562, 8.6, 'reval', { sjo: 'sverige', mer: 'Hertig Johan reser söderut för att gifta sig med Katarina Jagellonica, syster till Polens kung.' }],
        [1562, 9.8, 'vilnius', { mer: 'I oktober 1562 gifter sig Johan och Katarina i Vilnius.' }],
        [1562, 12.2, 'reval', { mer: 'Johan och Katarina reser hem mot Finland.' }],
        [1562, 12.6, 'abo', { sjo: 'sverige', mer: 'Hertig Johan och hertiginnan Katarina är i Åbo.' }],
        [1563, 8.8, 'gripsholm', { sjo: 'sverige', mer: 'Hertig Johan är fånge och förs till Gripsholm.' }],
        [1567, 10.2, 'stockholm', { mer: 'Hertig Johan är fri igen.' }],
        [1568, 7, 'vadstena', { mer: 'Hertigarna Johan och Karl samlas i Östergötland.' }],
        [1568, 8.6, 'stockholm', { mer: 'Hertigarna kommer till Stockholm.' }]] },
      { id: 'rantzau', namn: 'Daniel Rantzau', sort: 'rantzau', kalla: 'sv. Wikipedia, Daniel Rantzau', stopp: [
        [1565, 8.5, 'halmstad', { mer: 'Daniel Rantzau, en holsteinsk adelsman, leder den danska hären.' }],
        [1565, 10.5, 'axtorna', { mer: 'Daniel Rantzau går mot den svenska hären i Halland.' }],
        [1565, 11.5, 'halmstad', { mer: 'Daniel Rantzau är tillbaka i Halmstad.' }],
        [1567, 10.4, 'getaryggen', { mer: 'Daniel Rantzau går in i Sverige med hären, upp längs Nissastigen.' }],
        [1568, 2.5, 'halmstad', { via: ['jonkoping'], mer: 'Efter vintertåget genom Östergötland och Småland går Rantzau tillbaka till Halland.' }]] },
      { id: 'karin', namn: 'Karin Månsdotter', kvinna: ['#8a6a3a', '#efe9dc'], kalla: 'sv. Wikipedia, Karin Månsdotter', stopp: [
        [1565, 1, 'stockholm', { mer: 'Karin Månsdotter, dotter till en knekt, lever vid Eriks hov.' }],
        [1567, 5, 'uppsala', { mer: 'Karin Månsdotter är med kungen i Uppsala.' }],
        [1567, 9, 'stockholm', { mer: 'Karin Månsdotter är i Stockholm.' }]] }
    ],
    3: [
      { id: 'erik', namn: 'Erik', sort: 'erik', kalla: 'sv. Wikipedia, Erik XIV', stopp: [
        [1568, 10, 'stockholm', { mer: 'Den avsatte kungen Erik sitter fången i ett torn på slottet Tre Kronor.' }],
        [1570, 7, 'abo', { sjo: 'sverige', mer: 'Erik förs över havet och hålls fången på Åbo slott.' }],
        [1571, 7, 'kastelholm', { sjo: 'sverige', mer: 'Erik flyttas till Kastelholm på Åland.' }],
        [1571, 10, 'gripsholm', { sjo: 'sverige', mer: 'Erik flyttas till Gripsholm.' }],
        [1573, 7, 'vasteras', { mer: 'Erik flyttas till Västerås slott.' }],
        [1574, 6, 'orbyhus', { mer: 'Erik flyttas till Örbyhus i Uppland. Där vaktas han hårt.' }],
        [1577, 2.3, null, {}]] }
    ]
  };

  let scene = null, figs = [], taggEl = {}, orter = null, orterV = -1;
  const datumNu = () => { const d = V.Game.datum(); return d.ar + (d.man - 1) / 12; };
  const dat = s => s[0] + (s[1] - 1) / 12;
  function punkt(id) {
    const R = V.Rike; if (R.P[id]) return { x: R.P[id].x, z: R.P[id].z };
    const o = ORT[id]; if (!o) return null; const w = V.Geo.toWorld(o[0], o[1]); return { x: w[0], z: w[1] };
  }
  const platsNamn = id => { const b = D.BASER.find(q => q.id === id); return b ? b.namn : NAMN[id] || (ORT[id] && ORT[id][2]) || ''; };
  // vägen mellan två stopp: via de platser som stoppet anger, landsväg eller sjöväg
  function vag(fran, till, sjo, via) {
    const R = V.Rike, kedja = [fran].concat(via || [], [till]); let pts = [];
    for (let k = 0; k + 1 < kedja.length; k++) {
      const a = kedja[k], b = kedja[k + 1]; let del;
      if (R.P[a] && R.P[b]) del = sjo ? R.seaPath(a, b) : R.path(a, b);
      else { const p = punkt(a), q = punkt(b); del = [[p.x, p.z], [q.x, q.z]]; }
      if (sjo && R.P[a] && R.P[a].hav && k === 0) del = [[R.P[a].x, R.P[a].z]].concat(del);
      if (sjo && R.P[b] && R.P[b].hav && k === kedja.length - 2) del = del.concat([[R.P[b].x, R.P[b].z]]);
      pts = pts.concat(k ? del.slice(1) : del);
    }
    return pts;
  }

  const L = V.Levande = {
    ORT, FIG, NAMN, get figs() { return figs; },
    init(sc) {
      for (const f of figs) { if (f.h) f.h.scene.remove(f.h.g); if (f.u) V.Folk.remove(f.u); if (f.skepp) f.skepp.parent && f.skepp.parent.remove(f.skepp); }
      for (const id in taggEl) taggEl[id].remove(); taggEl = {};
      scene = sc; figs = []; orter = null;
      const S = V.Game.s;
      for (const d of FIG[S.varld] || []) {
        const f = { d, k: undefined, leg: null, vandra: null };
        if (d.kvinna) f.u = V.Folk.add(0, 0, 'kvinna', { col: d.kvinna[0], col2: d.kvinna[1], sc: 1.3, vis: false });
        else { const h = Object.create(V.Gustav); h.init(sc, d.sort); h.utanRing = true; h.kanSkida = d.sort === 'gustav'; h.g.scale.setScalar(1.4 * 1.06); h.g.visible = false; f.h = h; }
        figs.push(f);
      }
    },
    // hur långt personen har kommit: det sista stoppet vars datum har passerat (-1 = inte ännu)
    _mal(f, nu) { let k = -1; f.d.stopp.forEach((s, i) => { if (dat(s) <= nu + 1e-6) k = i; }); return k; },
    update(dt, t) {
      if (!scene || !figs.length) return;
      const S = V.Game.s, nu = datumNu(), dold = !!(V.Intro && V.Intro.aktiv) || S.slut || V.Game.skede() === 'strid';
      for (const f of figs) {
        const st = f.d.stopp, mal = f.d.ej && S.hjalte === f.d.ej ? -1 : L._mal(f, nu);
        if (f.k === undefined || mal < f.k) { f.k = mal; f.leg = null; f.vandra = null; f.pos = mal >= 0 && st[mal][2] ? punkt(st[mal][2]) : null; }      // vid start: personen står på sin plats
        else if (!f.leg && mal - f.k > 1) { f.k = mal - 1; f.vandra = null; f.pos = st[f.k][2] ? punkt(st[f.k][2]) : null; }          // tiden har hoppat: bara den sista resan syns
        if (!f.leg && f.k < mal) {          // dags att resa vidare till nästa stopp
          const nx = st[f.k + 1], o = nx[3] || {};
          if (!nx[2]) { f.k++; f.pos = null; }
          else if (f.k < 0 || !f.pos) { f.k++; f.pos = punkt(nx[2]); }
          else { const fr = st[f.k][2], pts = vag(fr, nx[2], o.sjo, o.via); pts.unshift([f.pos.x, f.pos.z]); f.leg = { pts, len: V.Rike.length(pts), d: 0, sjo: o.sjo }; f.vandra = null; }
        }
        let x, z, ang = 0, fart = 0, sjo = false, fots = true, syns = !!f.pos && !dold;
        if (f.leg) {
          const lg = f.leg; lg.d += dt * (lg.sjo ? 3.2 : 2.4); const a = V.Rike.along(lg.pts, Math.min(lg.d, lg.len)); x = a.x; z = a.z; ang = a.ang; fart = 0.55; sjo = !!lg.sjo; fots = false; f.pos = { x, z }; syns = !dold;
          if (lg.d >= lg.len) { f.leg = null; f.k++; f.pos = punkt(st[f.k][2]); f.vandra = null; }
        } else if (f.pos) {          // går runt i staden, stannar en stund, går vidare
          const c = punkt(st[f.k][2]), v = f.vandra || (f.vandra = { x: f.pos.x, z: f.pos.z, tx: f.pos.x, tz: f.pos.z, vila: 1 + Math.random() * 2, ang: Math.random() * 6 });
          if (v.vila > 0) { v.vila -= dt; if (v.vila <= 0) { for (let k = 0; k < 12; k++) { const a = Math.random() * 6.283, r = 0.5 + Math.random() * 1.6, px = c.x + Math.cos(a) * r, pz = c.z + Math.sin(a) * r; if (V.Geo.sdAt(px, pz) > 0.6) { v.tx = px; v.tz = pz; break; } } } }
          else { const dx = v.tx - v.x, dz = v.tz - v.z, l = Math.hypot(dx, dz); if (l < 0.05) v.vila = 2 + Math.random() * 5; else { const s = Math.min(l, dt * 0.45); v.x += dx / l * s; v.z += dz / l * s; v.ang = Math.atan2(dx, dz); fart = 0.3; } }
          x = v.x; z = v.z; ang = v.ang; f.pos = { x, z };
        }
        if (f.h) { if (syns) f.h.place(x, z, ang, fart, t, dt, sjo, fots); else f.h.g.visible = false; }
        if (f.u) { f.u.vis = syns && !sjo; if (syns) { f.u.x = x; f.u.z = z; f.u.ang = ang; f.u.gar = fart > 0; } }
        // till sjöss: ett skepp
        if (syns && sjo) {
          if (!f.skepp || f.skeppFlagga !== f.leg.sjo) { if (f.skepp) scene.remove(f.skepp); f.skepp = V.skepp(f.leg.sjo); f.skepp.scale.setScalar(2.0); f.skeppFlagga = f.leg.sjo; scene.add(f.skepp); }
          f.skepp.visible = true; f.skepp.position.set(x, 0.02 + Math.sin(t * 1.4) * 0.03, z); f.skepp.rotation.y = ang;
        } else if (f.skepp) f.skepp.visible = false;
        f.syns = syns; f.sx = x; f.sz = z; f.till = sjo ? 2.7 : f.h ? (fots ? 2.0 : 2.45) : 1.2;
      }
    },
    // namnskyltarna över personerna. Ett tryck visar vad personen gör just nu.
    taggar(spel, golv) {
      const box = document.getElementById('ortnamn'); if (!box) return;
      const satta = [];          // skyltar som redan står: flera personer i samma stad får sina namn i en liten stapel
      for (const id of ['vem-du', 'vem-bud']) { const h = document.getElementById(id); if (h && h.style.display === 'block') { const r = h.getBoundingClientRect(); satta.push({ x: r.left + r.width / 2, y: r.bottom, w: r.width }); } }          // hjältens namn står kvar, de andra flyttar upp
      for (const f of figs) {
        let e = taggEl[f.d.id];
        // boken i skylten visar att man kan trycka och läsa mer
        if (!e) { e = taggEl[f.d.id] = document.createElement('div'); e.className = 'vem annan'; e.innerHTML = f.d.namn + '<svg class="vem-bok" viewBox="0 0 24 24"><path d="M4 4.5h7c1 0 1 .6 1 1.2V20c0-.7-.4-1.2-1-1.2H4zM20 4.5h-7c-1 0-1 .6-1 1.2V20c0-.7.4-1.2 1-1.2h7z" fill="#fff3d6" stroke="#5a4634" stroke-width="1.6" stroke-linejoin="round"/></svg>'; box.appendChild(e); e.addEventListener('click', ev => { ev.stopPropagation(); L.mer(f); }); }
        let syns = spel && f.syns;
        if (syns) { const sp = V.Scene.screenPoint(f.sx, V.Geo.groundAt(f.sx, f.sz) + f.till, f.sz); syns = !sp.behind && sp.y > 50 && sp.y < golv && sp.x > 10 && sp.x < innerWidth - 10 && !V.UI._skymd(sp); if (syns) { let y = sp.y - 8; const bw = f.d.namn.length * 7.6 + 18; for (let k = 0; k < 4; k++) { const krock = satta.find(r => Math.abs(r.x - sp.x) < (r.w + bw) / 2 && Math.abs(r.y - y) < 21); if (!krock) break; y = krock.y - 22; } satta.push({ x: sp.x, y, w: bw }); e.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(y) + 'px) translate(-50%, -100%)'; } }
        e.style.display = syns ? 'flex' : 'none';
      }
    },
    mer(f) {
      const st = f.d.stopp, s = f.leg ? st[f.k + 1] : st[Math.max(0, f.k)], o = (s && s[3]) || {}, d = V.Game.datum();
      const var_ = f.leg ? 'På väg till ' + platsNamn(s[2]) : platsNamn(s[2]);
      V.UI.ruta('<h2>' + f.d.namn + '</h2><p class="mal">' + var_ + ', ' + d.ar + '</p><p>' + (o.mer || '') + '</p>' + (f.d.kalla ? '<p class="svag">Källa: ' + f.d.kalla + '.</p>' : '') + '<button class="stang">Stäng</button>', false); V.UI._paus = true;
    },
    // ortsskyltarna: platser som den här världens texter nämner, och platser där personerna är, som inte redan har ett namn på kartan
    orter(upptagna) {
      const S = V.Game.s; if (V.Game.skede() === 'strid' || (V.Intro && V.Intro.aktiv)) return [];
      if (!orter || orterV !== S.varld) {
        orterV = S.varld; const steg = D.UPPDRAG, txt = steg.map(u => [u.titel, u.mer, u.kronika, u.vet, u.vet2, u.efter].join(' ')).join(' '), ids = {};
        for (const u of steg) { if (u.plats) ids[u.plats] = 1; if (u.fran) ids[u.fran] = 1; }
        for (const f of FIG[S.varld] || []) for (const s of f.stopp) if (s[2]) ids[s[2]] = 1;
        for (const id in NAMN) if (txt.indexOf(NAMN[id]) >= 0) ids[id] = 1;
        for (const id in ORT) if (ORT[id][2] && txt.indexOf(ORT[id][2]) >= 0) ids[id] = 1;
        orter = [];
        for (const id in ids) { const n = platsNamn(id), p = punkt(id); if (!n || !p || (ORT[id] && !ORT[id][2])) continue; orter.push({ id: 'o:' + id, plats: id, namn: n, x: p.x, z: p.z + 0.9, y: Math.max(0.02, V.Geo.groundAt(p.x, p.z + 0.9)), liten: true }); }
      }
      // inte där det redan står ett namn
      return orter.filter(o => !upptagna[o.plats] && !upptagna['_' + Math.round(o.x / 2.2) + ',' + Math.round(o.z / 2.2)]);
    }
  };
})();
