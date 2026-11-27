// Den levande världen: baserna som växer, Gustavs färd, löparna, folket och uppdragen som syns på kartan.
// Lyssnar på spelets händelser och ritar dem. Reglerna själva ligger i game.js.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, D = V.DATA, G = V.Game, R = V.Rike, B = V.Bygge, Folk = V.Folk, Fx = V.Fx, World = V.World, Scene = V.Scene;
  const tomt = {}, grp = {}, steg = {}, flagga = {}, pops = [], vandrare = {}, hop = [], dekor = {};
  let scene, route = [], gseg = 0, gd = 0, lopare = [], vis = null, sistaBas = 'mora', smokeAcc = 0, paintDirty = false, pre = null, skattVis = null;
  // de sista 'max' enheterna av en väg (skattetruppen går inte genom halva riket)
  function svans(pts, max) { let d = 0; for (let k = pts.length - 1; k > 0; k--) { d += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); if (d >= max) return pts.slice(k - 1); } return pts; }
  const idx = id => { const i = D.UPPDRAG.findIndex(u => u.id === id); return i < 0 ? 1e9 : i; };          // uppdrag från en annan värld räknas som aldrig gjorda
  const stegAv = L => Math.min(MAXSTEG, Math.floor((L || 0) / 10));
  function lager(p, n) { const mb = new V.MB(); for (let k = 0; k < (n || 9); k++) { const a = k * 2.4, d = 0.5 + (k % 3) * 0.6; mb.push().move(Math.cos(a) * d, 0, Math.sin(a) * d * 0.8).rotY(a); B.talt(mb); mb.pop(); } B.eld(mb); const m = B.mesh(mb); m.position.set(p.x, Geo.groundAt(p.x, p.z), p.z); m.scale.setScalar(B.K); B.smoke.push({ x: p.x, y: Geo.groundAt(p.x, p.z) + 0.3, z: p.z, slag: 'eld', bas: 'stockholm' }); return m; }
  const finns = b => !(b.slag === 'slott' || b.ny || b.id === 'sala');          // fanns platsen redan 1520?
  const JAMN = 0.6;          // förspelet: så stor del av toppfarten håller den som rider rundan, hela tiden
  const MAXSTEG = 7, SATE = ['kopparberget', 'hedemora', 'vasteras', 'uppsala', 'brunkeberg'];

  const W = V.Varld = {
    tomt, P: R.P,
    init(sc) {
      R.kapaVandor = G.s.varld === 0;
      scene = sc; W._kristina = null; W._kring = null; W._kvar = null; W._borta = false; W._plats = null; W._placerad = false; W._byggda = {}; W._foljer = null; W._foljVis = null; if (W._foljMig === undefined) W._foljMig = 1; Folk.init(sc); Fx.init(sc); V.Gustav.init(sc, G.s.varld === 0 ? 'sten' : 'gustav'); V.Bud.init(sc, 'bud'); V.Bud.kanSkida = G.s.varld === 1;          // bud på skidor hör Dalarna och Gustavs tid till
      for (const b of D.BASER) {
        const p = R.P[b.id]; tomt[b.id] = new B.Tomt(b, p); steg[b.id] = [];
        const g = grp[b.id] = new THREE.Group(); g.position.set(p.x, p.y, p.z); g.scale.setScalar(B.K); sc.add(g);
      }
      for (const e of R.roads()) World.Paint.road(e, 0.13);
      World.Paint.commit();
    },
    // Se till att världen stämmer med spelets läge (vid start, efter laddning och efter varje uppdrag).
    sync(tyst) {
      const S = G.s; if (!S.bas[sistaBas]) sistaBas = Object.keys(S.bas)[0];
      if (S.varld === 0 && S.husPos) for (const id in S.husPos) { const h = D.BYGGNADER.find(q => q.id === id), t = h && tomt[h.plats]; if (t && !(t._hus && t._hus[id])) { t.take(S.husPos[id][0], S.husPos[id][1], 0.9); (t._hus || (t._hus = {}))[id] = 1; } }          // stadens hus står kvar där de byggdes, och inga andra hus på dem if (V.Gustav.klad) V.Gustav.klad(S.titel);
      for (const b of D.BASER) {
        // det som byggdes i förspelet står kvar, också i Kristians händer
        const L = S.bas[b.id] || 0, forr = stegAv(S.forspel && S.forspel[b.id]), want = L ? Math.max(stegAv(L), forr) : (finns(b) ? forr : -1);
        while (steg[b.id].length <= want) W.byggSteg(b.id, tyst || !L);
        // flagga: tre kronor där du styr, Dannebrogen på det Kristian håller
        let sort = null;
        if (L) sort = G.stoppad(b.id) === 'dagtingan' ? 'danmark' : 'sverige';
        else if (finns(b) && b.borg) {
          if (S.varld === 0) sort = b.id === 'uppsala' ? (S.hjalte === 'kristina' ? 'danmark' : null) : 'sverige';
          else sort = S.nasta <= idx(b.id === 'abo' || b.id === 'viborg' ? 'finland' : 'intag') ? 'danmark' : 'sverige';
        }
        if ((flagga[b.id] && flagga[b.id].sort) !== sort && steg[b.id].length) {
          if (flagga[b.id] && flagga[b.id].m) grp[b.id].remove(flagga[b.id].m);
          flagga[b.id] = { sort, m: null };
          if (sort) { const m = B.flagga(sort), f = tomt[b.id].flag; if (f) { m.position.set(f[0], f[1] - 0.3, f[2]); } else { const q = tomt[b.id].find(0.8, 2.2, 0.2) || [-1.2, 0.9]; m.position.set(q[0], tomt[b.id].y(q[0], q[1]), q[1]); m.scale.setScalar(1.25); } grp[b.id].add(m); flagga[b.id].m = m; }
        }
        if (S.borg[b.id] && !dekor['borg' + b.id]) { const q = tomt[b.id].find(1.6, 3.6, 2.0) || [2.8, -1.8]; W._borg(b.id, S.borg[b.id], q, tyst); dekor['borg' + b.id] = 1; }
      }
      // förspelet: ärkebiskopens borg Stäket tills den rivs, belägringslägret, och till sist danskarna utanför Stockholm
      const f0 = S.varld === 0;
      W._dekor('staket', f0 && S.nasta <= idx('sRiv'), () => { const mb = new V.MB(); B.borg(mb, 'liten', 0); const m = B.mesh(mb), p = R.P.staket; m.position.set(p.x, p.y, p.z); m.scale.setScalar(B.K); return m; });
      W._dekor('staketLager', f0 && S.nasta > idx('sStaket') && S.nasta <= idx('sRiv'), () => { const q = R.P.staket, c = [[4.6, 2.4], [4.8, 0.4], [3.6, -3], [0, -5]].find(o => Geo.sdAt(q.x + o[0], q.z + o[1]) > 1.6) || [4.6, 2.4]; return lager({ x: q.x + c[0], z: q.z + c[1] }, 7); });
      if (f0 && S.bygg) for (const id in S.bygg) W._byggnad(id, true);
      if (f0 && S.hus) for (const id in S.hus) if (S.hus[id]) W._byggnad(id, true);          // och stadens hus          // byggnaderna man har köpt (se D.BYGGNADER)
      // sjön Åsunden finns inte i kartans vatten: den målas dit där slaget står, långsmal längs vägen in mot Bogesund
      if (f0 && S.nasta >= idx('sAsunden') - 1 && !dekor.asunden) { const v = R.path('skara', 'bogesund'), e = v[v.length - 1], q = v[Math.max(0, v.length - 6)], L = Math.hypot(e[0] - q[0], e[1] - q[1]) || 1, dx = (e[0] - q[0]) / L, dz = (e[1] - q[1]) / L;
        World.Paint.river([[e[0] - dx * 6.5, e[1] - dz * 6.5], [e[0] + dx * 8, e[1] + dz * 8]], 10.5); dekor.asunden = { sjo: { x: e[0] + dx * 0.7, z: e[1] + dz * 0.7, r: 8.2 } }; paintDirty = true; W._isAsunden(e, dx, dz); }
      W._dekor('danskLager', f0 && S.nasta > idx('sUppsala'), () => lager(R.P.brunkeberg, 12));
      W._dekor('danskFlotta', f0 && S.nasta > idx('sUppsala'), () => W._flotta('stockholm', 4, 'danmark'));
      // belägringen av Stockholm, flottor som ligger kvar
      W._dekor('lager', S.nasta > idx('brunkeberg') && S.nasta <= idx('intag'), () => lager(R.P.brunkeberg, 9));
      W._dekor('blockad', S.nasta > idx('blockad') && S.nasta <= idx('intag'), () => W._flotta('stockholm', 3, 'lubeck'));
      W._dekor('lybska', S.nasta > idx('lubeck') && S.nasta <= idx('blockad'), () => W._flotta('soderkoping', 4, 'lubeck'));
      W._dekor('kravelen', S.nasta > idx('kravelen'), () => W._flotta('stockholm', 1, 'sverige', true));
      for (const b of D.BASER) if (S.bas[b.id] && !dekor['gard' + b.id]) { World.Paint.yard(R.P[b.id].x, R.P[b.id].z, tomt[b.id].R * 0.8); dekor['gard' + b.id] = 1; paintDirty = true; }
      for (const b of D.BASER) if (!S.bas[b.id] && finns(b) && !dekor['gard0' + b.id]) { World.Paint.yard(R.P[b.id].x, R.P[b.id].z, tomt[b.id].R * 0.55); dekor['gard0' + b.id] = 1; paintDirty = true; }
      W.rutt();
    },
    _borg(id, sort, q, tyst) {
      const mb = new V.MB(); B.borg(mb, sort, 3); const m = B.mesh(mb); m.position.set(q[0], tomt[id].y(q[0], q[1]), q[1]); grp[id].add(m); if (!tyst) W._pop(m, id);
    },
    // En köpt byggnad reses vid sin plats: huset, och två knektar på vakt utanför.
    byggPlats(id) { const b = D.BYGGNADER.find(q => q.id === id), p = b && R.P[b.plats || b.vid]; if (b && b.niva && p) { const q = W._husPlats(b); return q ? { x: p.x + q[0] * B.K, z: p.z + q[1] * B.K } : null; } return p ? (b.vid ? { x: p.x + b.x, z: p.z + b.z } : { x: p.x + b.x * B.K, z: p.z + b.z * B.K }) : null; },          // vid = står för sig själv utanför en plats (världens mått)
    _byggnad(id, tyst) {
      if (W._byggda[id]) return; const b = D.BYGGNADER.find(q => q.id === id); if (!b) return; const t = b.plats && tomt[b.plats], w = W.byggPlats(id), K = B.K, mb = new V.MB(); let folk = [], m;
      const vakt = (q, slag, pik) => Folk.add(w.x + q[0] * K, w.z + q[1] * K, slag, { pike: pik, ang: 0 });
      if (id === 'knektar') {
        B.stuga(mb, 1.2, 0.62, 0.48, 'span', { skorsten: 1, ljus: 1 });
        mb.box(-0.72, 0, 0.18, 0.05, 0.62, 0.05, '#5a4630'); mb.box(-0.72, 0.5, 0.18, 0.3, 0.2, 0.02, '#b8312a');          // en stång med ett rött baner vid gaveln
        folk = [[-0.3, 0.62], [0.3, 0.62]].map(q => vakt(q, 'knekt', true));
      } else if (id === 'radstuga') {          // ett stenhus med brant tegeltak och en liten takryttare, vid torget
        B.stuga(mb, 0.9, 0.62, 0.66, 'tegel', { vagg: '#b9ad98', vaggLag: '#8f8473', gavel: '#b9ad98', brant: 0.85, ljus: 1 });
        mb.box(0, 1.05, 0, 0.13, 0.26, 0.13, '#8f8473'); mb.cone(0, 1.31, 0, 0.12, 0.26, 4, '#a04a30', { snowLow: 0, snowTip: 0 });
        folk = [vakt([0.15, 0.6], 'borgare', false)];
      } else if (id === 'ladugard') {          // kronans gård: en stor lada med halmtak, ett boningshus och en gärdsgård
        mb.push().move(0, 0, 0); B.stuga(mb, 1.6, 0.8, 0.5, 'halm', {}); mb.pop();
        mb.push().move(1.25, 0, 0.75).rotY(1.2); B.stuga(mb, 0.85, 0.58, 0.34, 'torv', { skorsten: 1, ljus: 1 }); mb.pop();
        for (let k = 0; k < 9; k++) { mb.box(-1.3 + k * 0.33, 0, 1.25, 0.04, 0.2, 0.04, '#6b5743'); if (k < 8) mb.box(-1.135 + k * 0.33, 0.13, 1.25, 0.33, 0.03, 0.02, '#7a6650'); }
        folk = [vakt([-0.5, 0.75], 'bonde', false), vakt([0.4, 0.95], 'by', false)];
        World.Paint.yard(w.x, w.z + 0.4, 2.0); World.Paint.field(w.x - 2.6, w.z + 1.2, 2.6, 1.8, 0.2); World.Paint.field(w.x - 2.2, w.z - 1.6, 2.2, 1.6, -0.15); paintDirty = true;
      } else if (id === 'torn') {          // tre torn utanför husen, åt de håll där det är land
        const p0 = R.P[b.plats], lagen = []; for (let k = 0; k < 12 && lagen.length < 3; k++) { const a = 2.0 + k * 0.52, x = Math.cos(a) * 6.0, z = Math.sin(a) * 6.0 * 0.9; if (Geo.sdAt(p0.x + x * K, p0.z + z * K) > 0.8 && !lagen.some(q => Math.hypot(q[0] - x, q[1] - z) < 2.6)) lagen.push([x, z]); }
        lagen.forEach(q => { mb.push().move(q[0], t.y(q[0], q[1]), q[1]); mb.cyl(0, 0, 0, 0.34, 0.38, 1.15, 8, '#9a948a', { low: '#6a655d' }); mb.cyl(0, 1.15, 0, 0.4, 0.4, 0.12, 8, '#8a8479', { cap: '#8a8479' }); mb.cone(0, 1.27, 0, 0.36, 0.5, 8, '#4a3e34', {}); mb.pop(); });
        W._tornLagen = lagen.map(q => ({ x: p0.x + q[0] * K, z: p0.z + q[1] * K }));
      } else if (b.modell === 'hamn') {          // sjöbodar och lådor vid stranden, och ett skepp som ligger ute i vattnet
        B.stuga(mb, 0.8, 0.5, 0.42, 'span', {}); mb.push().move(0.75, 0, 0.1).rotY(0.3); B.stuga(mb, 0.6, 0.45, 0.4, 'span', {}); mb.pop();
        for (let k = 0; k < 4; k++) mb.box(-0.5 + k * 0.32, 0, 0.55, 0.22, 0.2, 0.22, '#7a5a3a');
        folk = [vakt([0.2, 0.8], 'borgare', false)];
        const p0 = R.P[b.plats], dx = w.x - p0.x, dz = w.z - p0.z, L = Math.hypot(dx, dz) || 1; let sx = w.x, sz = w.z; for (let k = 0; k < 40 && Geo.sdAt(sx, sz) > -0.6; k++) { sx += dx / L * 0.2; sz += dz / L * 0.2; }
        if (Geo.sdAt(sx, sz) <= -0.6) { const s = V.skepp('sverige'); s.scale.setScalar(1.6); s.position.set(sx, 0.02, sz); s.rotation.y = Math.atan2(dx, dz) + 1.57; scene.add(s); dekor['skepp' + id] = { userData: { skepp: [s] } }; }
      } else if (b.modell === 'bod') {          // ett lagerhus av sten vid hamnen, med en stång och flagga
        B.stuga(mb, 0.8, 0.55, 0.55, 'tegel', { vagg: '#b9ad98', vaggLag: '#8f8473', gavel: '#b9ad98', ljus: 1 }); mb.box(0.52, 0, 0.3, 0.05, 0.7, 0.05, '#5a4630'); mb.box(0.52, 0.56, 0.3, 0.3, 0.18, 0.02, '#c9a24a');
        for (let k = 0; k < 3; k++) mb.box(-0.3 + k * 0.3, 0, 0.55, 0.22, 0.2, 0.22, '#6a4a2a');          // järn och koppar i lådor
        folk = [vakt([0, 0.75], 'bergsman', false)];
      } else if (b.modell === 'disting') {          // marknadsstånd med tyg i olika färger
        ['#b8312a', '#2f4f8a', '#c9a24a', '#5d7a3a'].forEach((c, k) => { const x = (k % 2) * 0.7 - 0.35, z = Math.floor(k / 2) * 0.7 - 0.35; for (const q of [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]]) mb.box(x + q[0], 0, z + q[1], 0.03, 0.34, 0.03, '#5a4630'); mb.box(x, 0.34, z, 0.48, 0.05, 0.38, c); mb.box(x, 0.12, z + 0.05, 0.4, 0.12, 0.22, '#8a6a42'); });
        folk = [vakt([-0.6, 0.5], 'borgare', false), vakt([0.55, -0.4], 'by', false)];
      } else if (b.modell === 'garnison') {          // tält för knektarna och ett baner
        [[-0.5, 0], [0.45, -0.15], [0, 0.55]].forEach(q => { mb.push().move(q[0], 0, q[1]); B.talt(mb); mb.pop(); }); mb.box(0.75, 0, 0.5, 0.05, 0.75, 0.05, '#5a4630'); mb.box(0.75, 0.62, 0.5, 0.3, 0.2, 0.02, '#b8312a');
        folk = [[-0.2, 0.95], [0.4, 0.9]].map(q => vakt(q, 'knekt', true));
      } else if (b.modell === 'gardar') {          // två gårdar med halmtak och en gärdsgård
        B.stuga(mb, 0.85, 0.5, 0.45, 'halm', { skorsten: 1, ljus: 1 }); mb.push().move(0.95, 0, 0.35).rotY(1.3); B.stuga(mb, 0.7, 0.45, 0.4, 'halm', {}); mb.pop();
        for (let k = 0; k < 7; k++) { mb.box(-0.6 + k * 0.3, 0, 0.75, 0.04, 0.18, 0.04, '#6b5743'); if (k < 6) mb.box(-0.45 + k * 0.3, 0.12, 0.75, 0.3, 0.03, 0.02, '#7a6650'); }
        folk = [vakt([0.3, 1.0], 'by', false)];
      }
      m = B.mesh(mb);
      if (b.vid) { m.position.set(w.x, Geo.groundAt(w.x, w.z), w.z); m.scale.setScalar(K); scene.add(m); }
      else if (id === 'torn') grp[b.plats].add(m);
      else { if (!t || !grp[b.plats]) return; const q = b.niva ? W._husPlats(b) : [b.x, b.z]; m.position.set(q[0], t.y(q[0], q[1]), q[1]); grp[b.plats].add(m); }
      W._byggda[id] = { m, folk }; if (!tyst) { if (b.vid) { m.scale.setScalar(0.01); pops.push({ m, t: 0, fran: 0.01, till: K }); } else W._pop(m, b.plats); Fx.damm(w.x, Geo.groundAt(w.x, w.z) + 0.1, w.z, 14); }
    },
    _dekor(key, on, make) { if (on && !dekor[key]) { dekor[key] = make(); scene.add(dekor[key]); } else if (!on && dekor[key]) { scene.remove(dekor[key]); dekor[key] = null; } },
    _flotta(plats, n, sort, stor) {
      const g = new THREE.Group(), p = R.P[plats].hav; g.userData.skepp = [];
      for (let k = 0; k < n; k++) { const s = V.skepp(sort, stor); s.scale.setScalar(2.1); let x = p.x + (k - (n - 1) / 2) * 1.5, z = p.z + (k % 2) * 1.2, t = 0; while (Geo.sdAt(x, z) > -0.9 && t++ < 12) { x += (p.x - R.P[plats].x) * 0.15; z += (p.z - R.P[plats].z) * 0.15; } s.position.set(x, 0.02, z); s.rotation.y = 0.6 + k; g.add(s); g.userData.skepp.push(s); }
      return g;
    },
    byggSteg(id, tyst) {
      const t = tomt[id], s = steg[id].length, mb = B.steg(t, s, World.Paint), m = B.mesh(mb); grp[id].add(m); steg[id].push(m); paintDirty = true;
      if (!tyst) W._pop(m, id);
    },
    _pop(m, id, liten) { const fran = liten === true ? 0.82 : liten ? liten : 0.01; m.scale.setScalar(fran); pops.push({ m, t: 0, fran }); const p = R.P[id]; if (!liten) { Fx.damm(p.x, p.y, p.z, 26); Fx.guld(p.x, p.y + 0.2, p.z, 40, tomt[id].R * 0.6); } },
    // Hus som håller på att växa fram ställs färdiga på en gång (innan en scen, där världen annars står still med halvstora hus)
    popKlart() { pops.forEach(p => p.m.scale.setScalar(p.till || 1)); pops.length = 0; },
    // Under en scen syns inte skattelagen och de extra buden: spelet står still då, och de skulle stå som statyer mitt i bilden
    scenDolj(on) { (skattVis || []).forEach(v => v.enh.forEach(e => { e.vis = !on; })); lopare.forEach(l => { l.u.vis = !on; }); },
    pos(id) { const p = R.P[id]; return p ? { x: p.x, y: p.y || 0, z: p.z } : null; },
    // Ortnamnen på kartan (förspelet): varje plats som syns, och borgen Stäket så länge den står. Namnet står strax nedanför husen.
    ortnamn() {
      if (G.s.varld === 0 && vis && G.skede() === 'strid') return W._slagNamn();          // i ett slag: vem som är vem, inte städernas namn
      const ut = [], lagg = (id, namn, x, z) => ut.push({ id, namn, x, z, y: Math.max(0.02, Geo.groundAt(x, z)) });
      for (const b of D.BASER) { if (!steg[b.id] || !steg[b.id].length) continue; const p = R.P[b.id], r = tomt[b.id] ? tomt[b.id].R * 0.34 : 1; lagg(b.id, b.namn, p.x, p.z + r); }
      if (dekor.staket) { const p = R.P.staket; lagg('staket', 'Stäket', p.x, p.z + 1.5); }
      return ut;
    },
    // Vilken bas ligger under den här punkten på marken?
    // En byggnad utanför staden (Kungsladugården vid Vädla): vilken stads flik den hör till
    byggVid(g) { if (!g || G.s.varld !== 0) return null; for (const id in W._byggda) { const b = D.BYGGNADER.find(q => q.id === id); if (!b || !b.vid) continue; const w = W.byggPlats(id); if (w && Math.hypot(w.x - g.x, w.z - g.z) < 2.2) return b.stad || null; } return null; },
    // Var ett av stadens hus står (förspelet): en ledig plats på land i utkanten av staden. Bryggorna står vid stranden. Platsen sparas.
    _husPlats(b) {
      const S = G.s, P = S.husPos || (S.husPos = {}); if (P[b.id]) return P[b.id]; const tm = tomt[b.plats]; if (!tm) return null; const K = B.K, p = tm.p;
      for (let varv = 0; varv < 2; varv++) for (let k = 0; k < 240; k++) {          // först vid stranden om det är bryggor, sedan var som helst på land
        const a = 0.9 + k * 0.61, r = 1.3 + (k % 16) * 0.4, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85 + 0.3, sd = Geo.sdAt(p.x + x * K, p.z + z * K);
        if (sd < 0.6 || (b.modell === 'hamn' && !varv && sd > 2.6) || !tm.ok(x, z, 0.9)) continue; tm.take(x, z, 0.9); (tm._hus || (tm._hus = {}))[b.id] = 1; return (P[b.id] = [x, z]);
      }
      const q = tm.find(1.2, 8, 0.9) || [2.0, 1.4]; (tm._hus || (tm._hus = {}))[b.id] = 1; return (P[b.id] = q);
    },
    basVid(g) { if (!g) return null; let best = null, bd = 1e9; for (const b of D.BASER) { if (!steg[b.id].length) continue; const p = R.P[b.id], d = Math.hypot(p.x - g.x, p.z - g.z); if (d < tomt[b.id].R + 0.6 && d < bd) { bd = d; best = b.id; } } return best; },

    // ---- Gustavs rundtur ---------------------------------------------------------------------
    rutt() {
      const S = G.s, ids = Object.keys(S.bas), tour = R.tour(ids), key = tour.join(','); if (key === W._ruttKey) return; W._ruttKey = key;
      const fr = W._ruttKlar && W._placerad ? W._framTill() : null;          // vägen han är på just nu, i den gamla rundan
      route = [];
      if (tour.length === 1 && S.varld === 0) { /* förspelet: en enda plats och ingen runda, han står vid slottet (se _gustav) */ }
      else if (tour.length === 1) {
        const u = D.UPPDRAG[S.nasta], mal = u && R.P[u.plats] ? u.plats : 'rattvik', full = R.path(tour[0], mal), ut = []; let d = 0;
        for (let q = 0; q < full.length && d < 3.4; q++) { ut.push(full[q]); if (q) d += Math.hypot(full[q][0] - full[q - 1][0], full[q][1] - full[q - 1][1]); }
        route.push({ pts: ut, len: R.length(ut), to: null }, { pts: ut.slice().reverse(), len: R.length(ut), to: tour[0] });
      } else tour.forEach((id, i) => { const pts = R.path(id, tour[(i + 1) % tour.length]); route.push({ pts, len: R.length(pts), to: tour[(i + 1) % tour.length], from: id }); });
      // fortsätt därifrån han är: gå först till närmaste bas på den nya rundan
      const ry = W._ryttare(), gx = ry.x, gz = ry.z;
      if (W._ruttKlar && route.length && W._placerad) {          // _placerad: ryttaren har stått på rundan minst en gång (annars finns ingen plats att fortsätta ifrån)
        let best = 0, bd = 1e9; route.forEach((s, i) => { if (!s.to) return; const p = R.P[s.to], d = Math.hypot(p.x - gx, p.z - gz); if (d < bd) { bd = d; best = i; } });
        const p = R.P[route[best].to]; let pts = [[gx, gz], [p.x, p.z]]; if (W._fran && grafHar(W._fran) && grafHar(route[best].to) && W._fran !== route[best].to) pts = [[gx, gz]].concat(R.path(W._fran, route[best].to));
        pre = bd > 0.3 ? { pts, len: R.length(pts), to: route[best].to } : null; gseg = (best + 1) % route.length; gd = 0; W._fran = null;
      } else { gseg = 0; gd = 0; pre = null; }
      if (fr) { const vidare = route.findIndex(s => s.from === fr.id); if (vidare >= 0) { pre = { pts: fr.pts, len: R.length(fr.pts), to: fr.id }; gseg = vidare; gd = 0; } }
      W._ruttKlar = true;
      lopare.forEach((l, i) => { l.seg = Math.floor(i * route.length / Math.max(1, lopare.length)) % route.length; l.d = 0; });
    },
    // Var spelarens egen figur är just nu (Kristina efter Sten Stures död)
    gustavVid() { const k = G.s.hjalte === 'kristina' && W._kristina; return k ? { x: k.x, z: k.z } : { x: V.Gustav.x, z: V.Gustav.z }; },
    // Var hjälten står när han inte själv är ute: där källorna har honom, i grova drag.
    // Sten Sture på Stockholms slott. Gustav i Mora, sedan med hären (Kopparberget, Hedemora, Västerås, Uppsala, lägret på Brunkeberg) och från midsommar 1523 i Stockholm.
    // Sedan 2026-11-26 rider han själv rundan (_gustav). Platsen här används för scenen med sigillen, för Kristina, och när det inte finns någon runda.
    sate() {
      const S = G.s; let id = S.varld === 0 || S.bas.stockholm ? 'stockholm' : 'mora';
      if (id === 'mora') for (let k = 0; k < S.nasta && k < D.UPPDRAG.length; k++) { const u = D.UPPDRAG[k]; if (SATE.indexOf(u.id) >= 0 && R.P[u.plats]) id = u.plats; }
      const p = R.P[id], K = B.K; W._sateId = id;
      const b = G.BAS[id];          // på torget i en stad, vid elden i en bygd
      return b && (b.slag === 'stad' || b.slag === 'slott') ? { x: p.x + 0.15, z: p.z + 0.2 * K + 0.25, ang: 0 } : b ? { x: p.x + 0.75, z: p.z + 0.5 * K + 0.55, ang: -0.5 } : { x: p.x + 0.7, z: p.z + 0.7, ang: 0 };
    },

    // ---- uppdrag ------------------------------------------------------------------------------
    // Räkna ut vägen och hur lång tid färden tar, och be spelet skicka iväg dem.
    skicka() {
      const S = G.s, u = D.UPPDRAG[S.nasta]; if (!u || !G.kanSkicka()) return false;
      const man = S.res.man; let pts = null, dur = null, fran = u.fran, hem = null, k0 = 0;
      if (u.slag === 'flotta') { pts = R.seaPath(fran, u.plats); dur = Math.max(10, Math.min(24, R.length(pts) / 7)) + (u.strid ? 8 : 0); }
      else if (u.slag === 'tag' || u.slag === 'bud' || u.slag === 'rid') {
        const sjalv = u.slag === 'rid' || (u.slag === 'tag' && !!u.med);          // hjälten är själv med: då går tåget från platsen där han står
        if (sjalv) fran = null;
        else if (!fran) { let bd = 1e9; for (const id in S.bas) { if (G.BAS[id].ger !== 'man' || ['abo'].indexOf(id) >= 0) continue; const p = R.P[id], q = R.P[u.plats], d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd && d > 1) { bd = d; fran = id; } } }
        if (sjalv) { W.sate(); hem = W._sateId; const a = grafHar(hem) ? hem : sistaBas, full = R.path(a, R.P[u.plats] && grafHar(u.plats) ? u.plats : a); const mal = R.P[u.plats];
          if (u.slag === 'rid') {          // du rider dit själv, därifrån du är: vägen du är på fram till nästa plats, och vidare därifrån
            const fr = W._framTill(), stod = S.varld === 0 && W._kvar && W._kvar.plats && R.P[W._kvar.plats] ? W._kvar.plats : null;
            if (fr && grafHar(fr.id) && grafHar(u.plats)) { pts = fr.pts.concat(R.path(fr.id, u.plats).slice(1)); hem = fr.id; }
            else if (stod && stod !== u.plats) pts = [[V.Gustav.x, V.Gustav.z]].concat(R.path(stod, u.plats));
            else pts = grafHar(u.plats) ? [[V.Gustav.x, V.Gustav.z]].concat(full) : [[V.Gustav.x, V.Gustav.z], [mal.x, mal.z]];
          }
          else { const ut = W._utanfor(hem, mal), c = R.P[hem], rr = Math.hypot(ut[0] - c.x, ut[1] - c.z) + 0.5; pts = [ut].concat(grafHar(u.plats) ? full.filter(q => Math.hypot(q[0] - c.x, q[1] - c.z) > rr) : [[mal.x, mal.z]]); if (pts.length < 2) pts.push([mal.x, mal.z]); }          // armén samlas utanför staden, på den sida som vetter mot målet
        }
        else pts = grafHar(u.plats) && grafHar(fran) ? R.path(fran, u.plats) : [[R.P[fran].x, R.P[fran].z], [R.P[u.plats].x, R.P[u.plats].z]];
        pts = W._runt(pts, sjalv ? hem : fran, u.plats, u.slag === 'rid');
        const sp = u.slag === 'bud' ? 4.5 : u.slag === 'rid' ? 5 : 3.4, lim = u.slag === 'bud' ? [5, 12] : [9, 26];
        dur = Math.max(lim[0], Math.min(lim[1], R.length(pts) / sp)) + (u.strid ? 10 : 0);
        if (S.varld === 0 && u.strid) { const marsch = Math.max(6, Math.min(26, R.length(pts) / sp)), slag = u.order ? G.slagTid(u) : 12; dur = marsch + slag; k0 = marsch / dur; }
      }
      if (!G.skicka(dur ? dur * G.s.fartX : undefined, k0)) return false;
      W._startVis(u, pts, fran, man);
      return true;
    },
    // Gläntorna i skogen kring dem som rör sig, så att ingen går genom ett träd. Varje glänta är en sträcka med en bredd (en kapsel): [x1, z1, x2, z2, r].
    // I förspelet kliver träden åt sidan (Johannes 2026-11-26: "fixa så att träden flyttar på sig för gubbarna också"), och kring ett tåg eller ett slag
    // ligger gläntan längs hela kolonnen och kring båda leden. Negativ radie: träden krymper bort som förut (sjön, ladugården, scenerna och Gustavs värld).
    fri() {
      const noll = G.s.varld === 0, max = noll ? World.FRI_N : 8, l = [], G0 = V.Gustav, Bu = V.Bud, kaps = q => { if (q && l.length < max) l.push(q); }, lagg = (x, z, r) => kaps([x, z, x, z, noll ? r : -r]), krymp = (x, z, r) => kaps([x, z, x, z, -r]);
      if (dekor.asunden) { const q = dekor.asunden.sjo; krymp(q.x, q.z, q.r * 1.9); }          // inga träd på sjön
      if (W._byggda && W._byggda.ladugard) { const q = W.byggPlats('ladugard'); krymp(q.x + 0.4, q.z + 0.4, 4.2); }          // och inga genom kungsladugården
      if (G0.g && G0.g.visible) lagg(G0.x, G0.z, 1.0); if (Bu.g && Bu.g.visible) lagg(Bu.x, Bu.z, 0.9);
      if (vis && vis.noll) W._friTag(kaps);
      else {
        if (vis && vis.enh.length) { const e = vis.enh; lagg(e[0].x, e[0].z, 1.3); if (e.length > 6) { const m = e[e.length >> 1], s = e[e.length - 1]; lagg(m.x, m.z, 1.3); lagg(s.x, s.z, 1.3); } }
        if (vis && vis.fi.length) { const m = vis.fi[vis.fi.length >> 1]; lagg(m.x, m.z, 1.6); }
      }
      (skattVis || []).forEach(v => { if (v.enh[0]) lagg(v.enh[0].x, v.enh[0].z, 1.0); });
      (W.friExtra || []).forEach(q => krymp(q[0], q[1], q[2])); World.fri(l);
    },
    // Gläntan kring ett tåg i förspelet: fyra kapslar längs kolonnen på vägen, och en kring båda leden i slaget, efter var gubbarna står.
    _friTag(kaps) {
      const a = G.s.aktivt; if (!a || !vis.pts) return; const u = vis.u, K0 = a.k0 || G.KAMP, f = Math.min(1, a.t / a.dur), strid = !!u.strid, kamp = strid && f > K0, gf = strid ? Math.min(1, f / K0) : f;
      const ut = kamp ? Geo.smooth(0, 0.22, (f - K0) / (1 - K0)) : 0;
      if (ut < 1) {
        const dist = Math.max(0, vis.len - (strid ? 0.9 : 1.8)) * gf, sist = vis.enh[vis.enh.length - 1], bak = (sist ? sist.rad * 0.4 : 0) + (vis.gustav ? 0.95 : 0), fram = dist + 0.4, slut = Math.max(0, dist - bak), r = vis.kol * 0.16 + 0.6;
        let p = R.along(vis.pts, fram); for (let k = 1; k <= 4; k++) { const q = R.along(vis.pts, fram + (slut - fram) * k / 4); kaps([p.x, p.z, q.x, q.z, r]); p = q; }
      }
      const lista = kamp ? vis.enh.concat(vis.fi) : vis.fi; if (lista.length) kaps(W._kapsel(lista, 0.75));
    },
    // En kapsel kring en skara: längs den längsta sidan av rutan de står i, sedd i slagfältets riktning
    _kapsel(lista, marg) {
      const e = R.along(vis.pts, vis.len), fx = Math.sin(e.ang), fz = Math.cos(e.ang); let f0 = 1e9, f1 = -1e9, s0 = 1e9, s1 = -1e9;
      for (const m of lista) { const dx = m.x - e.x, dz = m.z - e.z, pf = dx * fx + dz * fz, ps = dx * fz - dz * fx; if (pf < f0) f0 = pf; if (pf > f1) f1 = pf; if (ps < s0) s0 = ps; if (ps > s1) s1 = ps; }
      const cf = (f0 + f1) / 2, cs = (s0 + s1) / 2, hf = (f1 - f0) / 2, hs = (s1 - s0) / 2, pt = (pf, ps) => [e.x + fx * pf + fz * ps, e.z + fz * pf - fx * ps];
      const ab = hs >= hf ? [pt(cf, cs - hs), pt(cf, cs + hs)] : [pt(cf - hf, cs), pt(cf + hf, cs)];
      return [ab[0][0], ab[0][1], ab[1][0], ab[1][1], Math.min(hs, hf) + marg];
    },
    // Ingen går rakt genom en stad eller en borg: vägen börjar och slutar vid kanten av platsen, och böjer av runt allt annat med hus på vägen.
    // inIMalet = man ska in i platsen (en ritt in i staden), då går vägen ända fram.
    _hinder() { const ut = []; for (const b of D.BASER) if (steg[b.id].length) ut.push({ id: b.id, x: R.P[b.id].x, z: R.P[b.id].z, r: tomt[b.id].R * 0.5 + 0.5 }); if (dekor.staket) ut.push({ id: 'staket', x: R.P.staket.x, z: R.P.staket.z, r: 2.4 }); return ut; },
    _runt(pts, startId, malId, inIMalet) {
      const H = W._hinder(), inne = (q, h) => Math.hypot(q[0] - h.x, q[1] - h.z) < h.r, hs = H.find(h => h.id === startId), hm = H.find(h => h.id === malId), kant = (h, q) => { const d = Math.hypot(q[0] - h.x, q[1] - h.z) || 1; return [h.x + (q[0] - h.x) / d * h.r, h.z + (q[1] - h.z) / d * h.r]; };
      let p = pts.slice();
      if (hs && inne(p[0], hs)) { let k = 0; while (k < p.length - 1 && inne(p[k], hs)) k++; p = [kant(hs, p[k])].concat(p.slice(k)); }
      if (hm && !inIMalet && inne(p[p.length - 1], hm)) { let k = p.length - 1; while (k > 0 && inne(p[k], hm)) k--; p = p.slice(0, k + 1).concat([kant(hm, p[k])]); }
      for (const h of H) {
        if (h === hs || h === hm) continue;
        p = p.filter((q, k) => k === 0 || k === p.length - 1 || !inne(q, h));          // punkter mitt i platsen stryks
        for (let k = 0; k + 1 < p.length; k++) {
          const a = p[k], b = p[k + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((h.x - a[0]) * dx + (h.z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
          let nx = a[0] + dx * t - h.x, nz = a[1] + dz * t - h.z, d = Math.hypot(nx, nz); if (d >= h.r || t <= 0.001 || t >= 0.999) continue;
          if (d < 0.05) { nx = -dz; nz = dx; d = Math.hypot(nx, nz) || 1; }
          p.splice(k + 1, 0, [h.x + nx / d * (h.r + 0.6), h.z + nz / d * (h.r + 0.6)]); k++;
        }
      }
      return p;
    },
    // Går det ingen väg dit samlas tåget strax utanför platsen där hjälten står, på den sida som vetter mot målet (annars går det rakt genom husen)
    _utanfor(id, mal) { const p = R.P[id], dx = mal.x - p.x, dz = mal.z - p.z, L = Math.hypot(dx, dz) || 1, r = Math.max(1.5, Math.min((tomt[id] ? tomt[id].R * 0.8 : 2) + 0.6, L - 2.4)); return [p.x + dx / L * r, p.z + dz / L * r]; },
    _startVis(u, pts, fran, man) {
      W._slutVis(); const p = R.P[u.plats];
      vis = { u, pts, len: pts ? R.length(pts) : 0, enh: [], fi: [], skepp: [], t0: V.U.uTime.value, start: performance.now() };
      if (u.slag === 'tag' && G.s.varld === 0) W._tag0Start(u, pts);
      else if (u.slag === 'tag') {
        vis.gustav = !!u.med;
        const n = Math.max(8, Math.min(40, Math.round(4 + Math.log10(Math.max(10, u.kostar.man || 100)) * 8)));
        for (let k = 0; k < n; k++) { const kn = G.s.las.flotta && k % 3 === 0; vis.enh.push(Folk.add(pts[0][0], pts[0][1], kn ? 'knekt' : 'bonde', { pike: k % 2 === 0, rad: Math.floor(k / 4), kol: k % 4 - 1.5, gar: true })); }
        const f = B.flagga(G.s.titel === 'Kung' || G.s.varld === 0 ? 'sverige' : 'vasa'); f.scale.setScalar(0.8); scene.add(f); vis.fana = f;
        if (u.strid && u.strid !== 'kanoner') { const m = u.strid === 'stor' ? 16 : u.strid === 'nederlag' ? 18 : 9, slag = u.plats === 'viborg' ? 'rysk' : ['kisa', 'virserum'].indexOf(u.plats) >= 0 ? 'bonde' : 'dansk', e = R.along(pts, vis.len), bak = u.strid === 'pilar' ? 2.6 : 1.3;
          for (let k = 0; k < m; k++) vis.fi.push(Folk.add(e.x + Math.sin(e.ang) * (bak + Math.floor(k / 5) * 0.32) + Math.cos(e.ang) * (k % 5 - 2) * 0.3, e.z + Math.cos(e.ang) * (bak + Math.floor(k / 5) * 0.32) - Math.sin(e.ang) * (k % 5 - 2) * 0.3, slag, { pike: k % 2 === 0, ang: e.ang + Math.PI, bx: 0, bz: 0 })); vis.fi.forEach(f2 => { f2.bx = f2.x; f2.bz = f2.z; }); }
        if (u.strid === 'kanoner') { const e = R.along(pts, vis.len); for (let k = 0; k < 14; k++) vis.fi.push(Folk.add(e.x + Math.sin(e.ang) * (2 + Math.floor(k / 7) * 0.35) + Math.cos(e.ang) * (k % 7 - 3) * 0.32, e.z + Math.cos(e.ang) * (2 + Math.floor(k / 7) * 0.35) - Math.sin(e.ang) * (k % 7 - 3) * 0.32, 'bonde', { ang: e.ang + Math.PI })); }
      } else if (u.slag === 'bud') vis.enh.push(Folk.add(pts[0][0], pts[0][1], 'bonde', { gar: true, sc: 1.05 }));
      else if (u.slag === 'rid') { for (let k = 0; k < 4; k++) vis.enh.push(Folk.add(pts[0][0], pts[0][1], 'knekt', { pike: true, gar: true, rad: 1 + Math.floor(k / 2), kol: k % 2 - 0.5 })); vis.gustav = true; }
      else if (u.slag === 'flotta') { const n = u.id === 'lubeck' ? 5 : u.strid === 'sjo' ? 5 : 3, sort = u.fran === 'lubeck' ? 'lubeck' : 'sverige'; for (let k = 0; k < n; k++) { const s = V.skepp(sort, k === 0 && G.s.las.orlog); s.scale.setScalar(2.1); scene.add(s); vis.skepp.push(s); } vis.gustav = !!u.gustav;
        if (u.strid === 'sjo') { vis.fiende = []; const e = R.along(pts, vis.len); for (let k = 0; k < 4; k++) { const s = V.skepp('lubeck'); s.scale.setScalar(2.1); s.position.set(e.x + 3 + k * 2.4, 0.02, e.z - 2 + (k % 2) * 2.4); s.rotation.y = -1.6; scene.add(s); vis.fiende.push(s); } } }
      else if (u.slag === 'bygg') { const mb = new V.MB(); B.stallning(mb, 0, 0, 1.3, 1.1); const m = B.mesh(mb), bas = G.BAS[u.plats], off = bas && steg[u.plats].length ? tomt[u.plats].R * 0.5 : 0; m.position.set(p.x + off, p.y, p.z + off * 0.4); scene.add(m); vis.stallning = m; for (let k = 0; k < 5; k++) vis.enh.push(Folk.add(p.x + off + (Math.random() - 0.5) * 1.6, p.z + off * 0.4 + 0.5 + Math.random() * 0.8, 'bonde', { gar: true, arb: 1 })); }
      if (u.belagring && u.order && G.s.varld === 0) W._belStart(p);
      if (!V.tyst) { if (pts) Scene.flyTo(pts[0][0], pts[0][1] + 1, u.slag === 'flotta' ? 46 : 32, 1.4); else Scene.flyTo(p.x, p.z + 1, 28, 1.4); }
    },
    _slutVis() {
      if (!vis) return; V.Gustav.slass = 0; V.Gustav.stupad = false; W._foljVis = null;
      vis.enh.forEach(e => Folk.remove(e)); vis.fi.forEach(e => Folk.remove(e)); vis.skepp.forEach(s => scene.remove(s)); (vis.fiende || []).forEach(s => scene.remove(s));
      if (vis.fana) scene.remove(vis.fana); if (vis.stallning) scene.remove(vis.stallning); vis = null;
    },
    vis() { return vis; },
    // Driv in skatt: en liten trupp går från en bygd till närmaste stad eller gruva. Reglerna ligger i game.js.
    _skattUt(nr) {
      const S = G.s; let best = null, bd = 1e9;
      for (const a in S.bas) { if (G.BAS[a].ger !== 'man' || !grafHar(a)) continue; for (const b in S.bas) { if (G.BAS[b].ger !== 'mark' || !grafHar(b)) continue; const p = R.P[a], q = R.P[b], d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd) { bd = d; best = [a, b]; } } }
      if (!best) { const m = Object.keys(S.bas).filter(id => G.BAS[id].ger === 'mark' && grafHar(id)); if (m.length < 2) return; best = [m[1], m[0]]; }
      const pts = svans(W._runt(R.path(best[0], best[1]), best[0], best[1], false), 24), v = { pts, len: R.length(pts), enh: [], till: best[1], nr }; W.skattTill = best[1]; if (!skattVis) skattVis = []; skattVis.push(v);
      for (let k = 0; k < 6; k++) v.enh.push(Folk.add(pts[0][0], pts[0][1], S.las.flotta ? 'knekt' : 'bonde', { pike: k % 2 === 0, gar: true }));
    },
    _skattSlut(nr) { if (!skattVis) return null; let ut = null; skattVis = skattVis.filter(v => { if (nr === undefined || v.nr === nr) { v.enh.forEach(e => Folk.remove(e)); ut = v; return false; } return true; }); return ut; },
    _skatt() {
      if (!skattVis || !skattVis.length) return; const lag = G.s.skattLag || [];
      for (const v of skattVis.slice()) { const s = lag.find(l => l.nr === v.nr); if (!s) { W._skattSlut(v.nr); continue; } W._skattLag(v, s); }
    },
    _skattLag(skattVis, s) {
      const dist = skattVis.len * Math.min(1, s.t / s.dur);
      skattVis.enh.forEach((e, i) => { const a = R.along(skattVis.pts, Math.max(0, dist - Math.floor(i / 2) * 0.36)), kol = ((i % 2) - 0.5) * 0.3 + (G.s.varld === 0 ? 0.24 : 0); e.x = a.x + Math.cos(a.ang) * kol; e.z = a.z - Math.sin(a.ang) * kol; e.ang = a.ang; e.gar = true; e.skidar = false; });
    },
    // Spelaren trycker medan striden pågår: en salva pilar, kanonerna eller en stöt framåt. Striden blir inte kortare av det.
    _drag(skede) {
      if (!vis || skede !== 'strid') return; const u = vis.u, Lj = V.Ljud, slump = l => l[Math.floor(Math.random() * l.length)], gy = e => Geo.groundAt(e.x, e.z);
      {
        if (u.slag === 'flotta') { for (let k = 0; k < 2; k++) { const s = slump(vis.skepp).position; Fx.krut(s.x, 0.4, s.z); } Lj && Lj.spela('kanon'); Scene.shake(0.2); return; }
        if (!vis.enh.length) return;
        if (u.strid === 'kanoner') { for (let k = 0; k < 2; k++) { const e = slump(vis.enh); Fx.krut(e.x, gy(e) + 0.25, e.z); } Lj && Lj.spela('kanon'); Scene.shake(0.3); return; }
        if (vis.fi.length) { const n = u.strid === 'pilar' ? 10 : 5; for (let k = 0; k < n; k++) { const e = slump(vis.enh), m = slump(vis.fi); Fx.pil(e.x, gy(e) + 0.35, e.z, m.x + (Math.random() - 0.5) * 0.3, 0.2, m.z + (Math.random() - 0.5) * 0.3); } }
        if (u.strid === 'pilar') Lj && Lj.spela('pil'); else { vis.stot = 1; Scene.shake(0.12); Lj && Lj.spela('svard'); const e = slump(vis.enh); Fx.damm(e.x, gy(e), e.z, 3); }
      }
    },
    // Det man trycker på i världen följer kameran, tills man själv flyttar kartan (Johannes 2026-11-26: "man följer det man klickar på"):
    // hjälten, tåget och fienden, flottan, budet och skattelagen. Städerna är kvar som förut: ett tryck på en stad bygger ut den.
    valjVid(sx, sy, iStad) {          // iStad: trycket är på en stad, då måste man träffa nästan precis för att följa i stället för att bygga
      const Gu = V.Gustav, Bu = V.Bud; let best = null, bd = iStad ? (Scene.mobil ? 24 : 18) : Scene.mobil ? 46 : 34;
      const prova = (x, z, h, mal) => { const p = Scene.screenPoint(x, Geo.groundAt(x, z) + h, z); if (p.behind) return; const d = Math.hypot(p.x - sx, p.y - sy); if (d < bd) { bd = d; best = mal; } };
      if (vis) { const mal = W._malUppdrag(); vis.skepp.forEach(s => prova(s.position.x, s.position.z, 0.6, mal));
        const st = l => Math.max(1, Math.floor(l.length / 40)); for (let k = 0; k < vis.enh.length; k += st(vis.enh)) { const e = vis.enh[k]; if (e.vis !== false) prova(e.x, e.z, 0.4, mal); } for (let k = 0; k < vis.fi.length; k += st(vis.fi)) prova(vis.fi[k].x, vis.fi[k].z, 0.4, mal); }
      if (Gu.g && Gu.g.visible) prova(Gu.x, Gu.z, 0.7, W._malHjalten());
      if (Bu.g && Bu.g.visible) prova(Bu.x, Bu.z, 0.7, { pos: () => Bu.g.visible ? { x: Bu.x, z: Bu.z } : null });
      (skattVis || []).forEach(v => { const e = v.enh[0]; if (e) prova(e.x, e.z, 0.4, { pos: () => skattVis && skattVis.indexOf(v) >= 0 && v.enh[0] ? { x: v.enh[0].x, z: v.enh[0].z } : null }); });
      if (!best) return false; W._foljer = Object.assign({ t: performance.now() }, best); return true;
    },
    _malUppdrag() { return { pos: () => vis && W._foljVis ? { x: W._foljVis.x, z: W._foljVis.z, d: G.skede() === 'strid' ? W._foljVis.d : 0 } : null }; },
    _malHjalten() { const Gu = V.Gustav; return { pos: () => { const k = G.s.hjalte === 'kristina' && W._kristina; if (k) return { x: k.x, z: k.z }; if (vis && vis.gustav && W._foljVis) return W._malUppdrag().pos(); return Gu.g.visible ? { x: Gu.x, z: Gu.z } : null; } }; },
    foljUppdraget() { if (vis && !V.tyst) W._foljer = Object.assign({ t: performance.now() }, W._malUppdrag()); },          // i slaget: varje tryck tar kameran tillbaka dit
    foljPlats(id) { if (!V.tyst && R.P[id]) W._foljer = { t: performance.now(), pos: () => ({ x: R.P[id].x, z: R.P[id].z }) }; },          // en vald stad: kameran står där tills man drar eller väljer något annat
    foljHjalten() { if (!V.tyst) W._foljer = Object.assign({ t: performance.now() }, W._malHjalten()); },          // knappen Hitta mig
    _foljNu() {
      const fo = W._foljer; if (!fo) return; const c = Scene.cam, p = c.user > fo.t || c.locked || V.tyst ? null : fo.pos();
      if (!p) { W._foljer = null; return; } if (c.fly) return;
      c.tx = p.x; c.tz = p.z + (Scene.lyft ? 0 : 1); if (p.d) c.td += (p.d - c.td) * 0.03;
    },
    // Kameran följer det som är ute på uppdrag, tills spelaren själv flyttar kartan.
    _folj(x, z, d) { W._foljVis = { x, z, d }; const c = Scene.cam; if (V.tyst || !vis || c.fly || c.user > vis.start) return; c.tx = x; c.tz = z + (Scene.lyft ? 0 : 1); c.td += (d - c.td) * 0.03; },

    // Händelser från spelet.
    handelse(typ, d) {
      if (typ === 'tryck') {
        if (W._kristina) W._kristina.hoppT = 0.45; const ry = W._ryttare(); if (ry.g && ry.g.visible) Fx.damm(ry.x, Geo.groundAt(ry.x, ry.z) + 0.05, ry.z, 2); if (d.skede && !(vis && vis.u.order && G.s.varld === 0)) W._drag(d.skede);          // i förspelets slag syns bara hugg som tar (handelse hugg)
        // belägringen: du manar försvaret, och vart tredje tryck skjuter slottet. Det ändrar inte hur länge belägringen varar.
        if (vis && vis.u.belagring && !vis.u.order && G.s.aktivt && !G.s.aktivt.val) { W._belTryck = (W._belTryck || 0) + 1; if (W._belTryck % 3 === 0) { const p = R.P[vis.u.plats], x = p.x + 1.2 + Math.random() * 1.4, z = p.z - 1.3; Fx.krut(x, Geo.groundAt(x, z) + 1.3, z); V.Ljud && V.Ljud.spela('kanon'); Scene.shake(0.12); } }
      }
      else if (typ === 'marknadKlar') { const p = R.P[d.bas]; Fx.guld(p.x, p.y + 0.3, p.z, 60, tomt[d.bas].R * 0.7); (vandrare[d.bas] || []).forEach(v => { v.hopp = 0.9; }); }
      else if (typ === 'handling') { for (const id in vandrare) vandrare[id].forEach(v => { v.hopp = 0.9; }); hop.forEach((u, i) => { u.y = 0.1; setTimeout(() => { u.y = 0; }, 180 + i * 12); }); if (V.Gustav.g.visible) Fx.guld(V.Gustav.x, Geo.groundAt(V.Gustav.x, V.Gustav.z) + 0.4, V.Gustav.z, 40, 1.4); }
      else if (typ === 'skattUt') W._skattUt(d.nr);
      else if (typ === 'skatt') { const v = W._skattSlut(d.nr); if (v) { const p = R.P[v.till]; Fx.guld(p.x, p.y + 0.3, p.z, 36, 1.3); } }
      else if (typ === 'niva') {
        const p = R.P[d.bas], s = Math.min(MAXSTEG, Math.floor(d.niva / 10));
        if (d.dubbel) { Fx.guld(p.x, p.y + 0.3, p.z, 70, tomt[d.bas].R * 0.8); Scene.shake(0.25); }
        else { Fx.guld(p.x, p.y + 0.3, p.z, 7, 1.2); Fx.damm(p.x, p.y + 0.1, p.z, 3); const m = steg[d.bas][steg[d.bas].length - 1]; if (m && !pops.some(o => o.m === m)) W._pop(m, d.bas, 0.95); }          // varje köp syns: husen ger till ett litet hopp
        while (steg[d.bas].length <= s) W.byggSteg(d.bas, false);
      } else if (typ === 'samling') { const p = R.P[d.bas]; if (!d.lopare) Fx.guld(p.x, p.y + 0.2, p.z, 10, 1.0); (vandrare[d.bas] || []).forEach(v => { v.hopp = 0.5; }); }
      else if (typ === 'byggnad') W._byggnad(d.id, false);
      else if (typ === 'hus') { if (d.niva === 1) W._byggnad(d.id, false); else { const w = W.byggPlats(d.id); if (w) Fx.guld(w.x, Geo.groundAt(w.x, w.z) + 0.3, w.z, 25, 0.8); } }          // stadens hus: byggs första gången, glimmar sedan
      else if (typ === 'slagTryck' && vis) { const nu = performance.now(); if (nu > (W._slagT || 0)) { W._slagT = nu + 280; W._slagTryck(d.o); } }          // förspelets slag: trycken syns i slaget
      else if (typ === 'hugg' && vis && vis.u.belagring) { if (d.traff) W._belBild(d.o && d.o.bild, true, 'hugg'); }          // belägringen: varje tryck i takt syns på vallen eller i tornen
      else if (typ === 'hugg' && vis && d.traff) { const q = W.malPunkt(); if (q) Fx.damm(q.x, Geo.groundAt(q.x, q.z), q.z, 5); vis.stot = 1; Scene.shake(0.08); V.Ljud && V.Ljud.spela('svard'); const e = vis.enh[Math.floor(Math.random() * Math.min(vis.enh.length, vis.bredd || 6))]; if (e) Fx.damm(e.x, Geo.groundAt(e.x, e.z), e.z, 3); }          // ett hugg i takt: leden trycker på
      else if (typ === 'orderSvar' && vis && vis.u.belagring) W._belBild(d.o.bild, d.bra, 'svar');
      else if (typ === 'orderSvar' && vis) { if (d.bra && !d.o.alltid) { vis.stot = 1; Scene.shake(0.18); } else if (d.o.alltid) vis.stot = -1.6; }          // rätt läge: en stöt framåt. Anfallet i gryningen vid Brännkyrka slås tillbaka
      else if (typ === 'kula' && vis) { const Gu = V.Gustav; Fx.krut(Gu.x, Geo.groundAt(Gu.x, Gu.z) + 0.4, Gu.z); Fx.damm(Gu.x, Geo.groundAt(Gu.x, Gu.z) + 0.1, Gu.z, 12); }
      else if (typ === 'klart') {
        const u = d.u, p = R.P[u.plats]; if (vis && vis.u.strid === 'nederlag') { /* de stupade ligger kvar ett ögonblick */ }
        if (vis && vis.gustav && u.slag !== 'flotta') W._kvar = { x: V.Gustav.x, z: V.Gustav.z, ang: 0, t: G.s.varld === 0 ? 8 : 14, plats: u.plats };          // du stannar en stund där du kom fram, sedan rider du tillbaka till rundan
        W._slutVis(); W.sync(false);
        if (u.ger && u.ger.bas) u.ger.bas.forEach(id => { const q = R.P[id]; Fx.guld(q.x, q.y + 0.3, q.z, 90, tomt[id].R); steg[id].forEach(m => { if (!pops.some(o => o.m === m)) W._pop(m, id, true); }); });
        else if (p) Fx.guld(p.x, (p.y || 0) + 0.3, p.z, 40, 1.5);
        W._ruttKey = null; W.rutt();
      } else if (typ === 'konst' && d.dubbel) { const ry = W._ryttare(); Fx.guld(ry.x, Geo.groundAt(ry.x, ry.z) + 0.3, ry.z, 50, 1); }
    },

    // ---- varje bildruta -------------------------------------------------------------------------
    update(dt, t) {
      const S = G.s;
      for (let k = pops.length - 1; k >= 0; k--) { const p = pops[k]; p.t += dt / 0.65; const e = p.t >= 1 ? 1 : 1 + 2.2 * Math.pow(p.t - 1, 3) + 1.2 * Math.pow(p.t - 1, 2); p.m.scale.setScalar(Math.max(0.01, p.fran + ((p.till || 1) - p.fran) * e)); if (p.t >= 1) pops.splice(k, 1); }
      if (paintDirty && !pops.length) { World.Paint.commit(); paintDirty = false; }
      W._gustav(dt, t); W._lopare(dt, t); W._folk(dt, t); W._uppdrag(dt, t); W._skatt(); W._foljNu();
      if (S.marknad && Math.random() < dt * 5) { const p = R.P[S.marknad.bas]; Fx.guld(p.x, p.y + 0.3, p.z, 2, tomt[S.marknad.bas].R * 0.6); }
      // rök ur skorstenar och hyttor, gnistor ur eldar
      smokeAcc += dt; if (smokeAcc > 0.22) { smokeAcc = 0; const c = Scene.cam; for (const s of B.smoke) { if (Math.abs(s.x - c.x) > c.d * 1.2 + 10 || Math.abs(s.z - c.z) > c.d + 10) continue; if (!S.bas[s.bas] && s.slag !== 'eld') { if (Math.random() < 0.5) continue; } if (s.slag === 'eld') Fx.gnista(s.x, s.y, s.z); else if (Math.random() < 0.7) Fx.rok(s.x, s.y, s.z, false); }
        for (const u in S.uppror) if (S.uppror[u]) for (const id of D.UPPROR[u].baser) if (S.bas[id]) { const p = R.P[id]; Fx.rok(p.x + (Math.random() - 0.5) * 2, p.y + 0.4, p.z + (Math.random() - 0.5) * 2, true); } }
      if (dekor.asundenIs) { const o = Math.max(0, Math.min(1, (V.U.uIce.value - 0.3) * 3)); dekor.asundenIs.visible = o > 0.01; dekor.asundenIs.material.opacity = o; }          // isen på Åsunden bara när sjöarna är frusna
      for (const k in dekor) { const g = dekor[k]; if (g && g.userData && g.userData.skepp) g.userData.skepp.forEach((s, i) => { s.position.y = 0.02 + Math.sin(t * 1.3 + i) * 0.025; s.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.04; }); }
    },
    // Vem som rider rundan mellan platserna: du själv (Johannes 2026-11-26: "det var roligare när man åkte runt mellan städerna").
    // Som Kristina är du instängd i Stockholm, och då är det ett bud som rider ut med dina brev.
    _ryttare() { return G.s.varld === 0 && G.s.hjalte !== 'kristina' ? V.Gustav : V.Bud; },          // i Gustavs värld rider budet tills vidare
    // Vägen du är på just nu, från där du är fram till nästa plats på rundan (när du ska rida vidare till ett möte)
    _framTill() {
      const seg = pre || route[gseg]; if (G.s.varld !== 0 || !seg || !seg.to || W._kvar || W._borta || G.s.hjalte === 'kristina') return null;
      const pts = [[V.Gustav.x, V.Gustav.z]]; let d = 0;
      for (let q = 0; q + 1 < seg.pts.length; q++) { d += Math.hypot(seg.pts[q + 1][0] - seg.pts[q][0], seg.pts[q + 1][1] - seg.pts[q][1]); if (d > gd) pts.push(seg.pts[q + 1]); }
      if (pts.length < 2) pts.push(seg.pts[seg.pts.length - 1]);
      return { id: seg.to, pts };
    },
    // Rid tillbaka till rundan därifrån du står (efter ett fälttåg eller ett möte): längs vägen till närmaste plats på rundan.
    _tillRundan(x, z, plats) {
      if (!route.length) return;
      let best = -1, bd = 1e9; route.forEach((s, i) => { if (!s.to) return; const p = R.P[s.to], d = Math.hypot(p.x - x, p.z - z); if (d < bd) { bd = d; best = i; } });
      if (best < 0) { gseg = 0; gd = 0; pre = null; return; }
      const to = route[best].to, p = R.P[to]; let pts = [[x, z], [p.x, p.z]];
      gseg = (best + 1) % route.length; gd = 0; pre = null;
      // kom han sjövägen (Malmö 1524), står han utan känd plats långt bort, eller är vägen hem mycket lång: fortsätt rundan från närmaste plats
      if (Geo.sdAt(x, z) < 0.2 || (!(plats && R.P[plats]) && bd > 6)) return;
      if (plats && R.P[plats] && plats !== to) pts = [[x, z]].concat(R.path(plats, to));
      pts = W._runt(pts, null, to, true); const len = R.length(pts);
      if (bd > 0.3 && len < 45) pre = { pts, len, to };
    },
    _gustav(dt, t) {
      const S = G.s, Gu = V.Gustav, Bu = V.Bud, kristina = S.hjalte === 'kristina';
      if (S.varld !== 0) return W._gustavGammal(dt, t);
      if (kristina) {          // Sten Sture är död. Kristina Gyllenstierna står vid Stockholms slott.
        Gu.g.visible = false;
        if (!W._kristina) { const p = R.P.stockholm; W._kristina = Folk.add(p.x + 1.9 * B.K, p.z - 0.5 * B.K, 'kvinna', { col: '#2f4f8a', col2: '#f2eee2', sc: 1.4, ang: 0.3 }); }
        const k = W._kristina; k.hoppT = Math.max(0, (k.hoppT || 0) - dt); k.y = Math.abs(Math.sin(k.hoppT * 14)) * 0.1 * Math.min(1, k.hoppT * 4);
        if (k.bx === undefined) k.bx = k.x; { const c = Math.cos(t * 0.2); k.x = k.bx + Math.sin(t * 0.2) * 1.1; k.gar = Math.abs(c) > 0.3; k.ang = k.gar ? (c > 0 ? 1.571 : -1.571) : 0.2; }          // hon går av och an framför slottet
        // ringen visar vem som är du, också när du är Kristina
        if (!W._kring) { const r0 = Gu.g.userData.ring; W._kring = r0.clone(); W._kring.material = r0.material.clone(); W._kring.scale.setScalar(Gu.g.scale.x); scene.add(W._kring); }
        W._kring.visible = true; W._kring.position.set(k.x, Geo.groundAt(k.x, k.z) + 0.05, k.z); W._kring.material.opacity = 0.7 + 0.2 * Math.sin(t * 3);
      } else {
        if (W._kring) W._kring.visible = false; Bu.g.visible = false;
        if (vis && vis.gustav) { W._borta = true; return; }          // du leder ett tåg eller rider till ett möte (se _uppdrag). Rundan väntar på dig.
        if (W._kvar) {          // du stannar en stund där du kom fram
          if ((W._kvar.t -= dt) > 0) { Gu.place(W._kvar.x, W._kvar.z, W._kvar.ang, 0, t, dt, false, true); W._borta = true; return; }
          W._borta = true; W._plats = W._kvar.plats; W._kvar = null;
        }
        if (W._borta) { W._borta = false; W._tillRundan(Gu.x, Gu.z, W._plats); W._plats = null; }
      }
      const ry = kristina ? Bu : Gu;
      if (!route.length) { if (kristina) Bu.g.visible = false; else { const q = W.sate(); Gu.place(q.x, q.z, q.ang, 0, t, dt, false, true); W._placerad = true; W._stodStilla = true; } return; }          // han står still vid slottet, och kameran står still
      if (W._stodStilla && !kristina) { W._stodStilla = false; if (Scene.cam.user <= (W._foljMig || 0) || Scene.cam.user < 1) W._foljMig = performance.now(); }          // nu rider han iväg: först nu följer kameran honom (om man inte själv har flyttat kartan)
      // jämn takt: trycken gör ingen resa snabbare (Johannes 2026-11-26: "Det får inte snabba upp något typ av resande"). Förmågan Hästar gör den snabbare för gott.
      const v = G.hastighet() * JAMN * dt; let seg = pre || route[gseg]; gd += v;
      let guard = 0;
      while (gd >= seg.len && guard++ < 20) {
        gd -= seg.len; if (seg.to) { sistaBas = seg.to; G.besok(seg.to, false); }
        if (pre) pre = null; else gseg = (gseg + 1) % route.length; seg = route[gseg];
      }
      const a = R.along(seg.pts, gd), hi = []; (skattVis || []).forEach(q => q.enh.forEach(e => hi.push(e))); lopare.forEach(l => hi.push(l.u)); W._filR = W._fil(W._filR, a, dt, hi);
      ry.place(a.x + Math.cos(a.ang) * W._filR, a.z - Math.sin(a.ang) * W._filR, a.ang, 0.85, t, dt, false); W._placerad = true;          // vägens högra sida (W._fil)
      // kameran följer dig, tills du själv flyttar kartan. Knappen Hitta mig slår på det igen.
      if (!kristina) { const c = Scene.cam; if (!V.tyst && c.user <= (W._foljMig || 0) && !c.fly && !c.locked && !vis && performance.now() > (W._foljPaus || 0)) { if (W._foljD) { c.td = W._foljD; W._foljD = 0; } c.tx = a.x; c.tz = a.z + (Scene.lyft ? 0 : 1.2); } }
    },
    // Gustavs värld, orörd tills förspelet är klart (Johannes 2026-11-26): hjälten står på sin plats och ett bud rider rundan.
    _gustavGammal(dt, t) {
      const S = G.s, Gu = V.Gustav, Bu = V.Bud;
      // hjälten själv är antingen ute på ett uppdrag (se _uppdrag) eller står på sin plats
      if (!(vis && vis.gustav)) {
        if (S.hjalte === 'kristina') {          // Sten Sture är död. Kristina Gyllenstierna står vid Stockholms slott.
          Gu.g.visible = false;
          if (!W._kristina) { const p = R.P.stockholm; W._kristina = Folk.add(p.x + 1.9 * B.K, p.z - 0.5 * B.K, 'kvinna', { col: '#2f4f8a', col2: '#f2eee2', sc: 1.4, ang: 0.3 }); }
          const k = W._kristina; k.hoppT = Math.max(0, (k.hoppT || 0) - dt); k.y = Math.abs(Math.sin(k.hoppT * 14)) * 0.1 * Math.min(1, k.hoppT * 4);
          if (k.bx === undefined) k.bx = k.x; { const c = Math.cos(t * 0.2); k.x = k.bx + Math.sin(t * 0.2) * 1.1; k.gar = Math.abs(c) > 0.3; k.ang = k.gar ? (c > 0 ? 1.571 : -1.571) : 0.2; }          // hon går av och an framför slottet
          // ringen visar vem som är du, också när du är Kristina
          if (!W._kring) { const r0 = Gu.g.userData.ring; W._kring = r0.clone(); W._kring.material = r0.material.clone(); W._kring.scale.setScalar(Gu.g.scale.x); scene.add(W._kring); }
          W._kring.visible = true; W._kring.position.set(k.x, Geo.groundAt(k.x, k.z) + 0.05, k.z); W._kring.material.opacity = 0.7 + 0.2 * Math.sin(t * 3);
        } else {
          if (W._kring) W._kring.visible = false;
          if (W._kvar && (W._kvar.t -= dt) <= 0) W._kvar = null;
          const q = W._kvar || W.sate();
          if (W._kvar) { Gu.place(q.x, q.z, q.ang, 0, t, dt, false, true); W._vandr = null; }
          else {
            // han går mellan fria fläckar nära sin plats (torget, kyrkan, slottsporten) och stannar en stund på varje
            let v = W._vandr; if (!v || v.hem !== W._sateId) v = W._vandr = { hem: W._sateId, x: q.x, z: q.z, tx: q.x, tz: q.z, vila: 2.5, ang: q.ang };
            const dx = v.tx - v.x, dz = v.tz - v.z, d = Math.hypot(dx, dz);
            if (d > 0.05) { const st = Math.min(d, 0.5 * dt); v.x += dx / d * st; v.z += dz / d * st; v.ang = Math.atan2(dx, dz); Gu.place(v.x, v.z, v.ang, 0.32, t, dt, false, true); }
            else {
              v.vila -= dt; Gu.place(v.x, v.z, v.ang, 0, t, dt, false, true);
              if (v.vila <= 0) {
                v.vila = 2.5 + Math.random() * 4.5; const tm = tomt[W._sateId], fri = (x, z) => !tm || (Geo.sdAt(x, z) > 0.4 && !tm.occ.some(o => Math.hypot(o[0] - (x - tm.p.x) / B.K, o[1] - (z - tm.p.z) / B.K) < o[2] * 0.8));
                for (let k = 0; k < 10; k++) { const a = Math.random() * 6.283, r = 0.5 + Math.random() * 1.0, x = v.x + Math.sin(a) * r, z = v.z + Math.cos(a) * r; if (Math.hypot(x - q.x, z - q.z) < 2.4 && fri(x, z) && fri((x + v.x) / 2, (z + v.z) / 2)) { v.tx = x; v.tz = z; break; } }
              }
            }
          }
        }
      }
      // budet far runt mellan platserna med bud och brev
      if (!route.length) { Bu.g.visible = false; return; }
      const v = G.hastighet() * G.fartNu() * dt; let seg = pre || route[gseg]; gd += v;
      let guard = 0;
      while (gd >= seg.len && guard++ < 20) {
        gd -= seg.len; if (seg.to) { sistaBas = seg.to; G.besok(seg.to, false); }
        if (pre) pre = null; else gseg = (gseg + 1) % route.length; seg = route[gseg];
      }
      const a = R.along(seg.pts, gd); Bu.place(a.x, a.z, a.ang, Math.min(1.6, S.fart * (1 + 0.6 * (S.ryck || 0))), t, dt, false); W._placerad = true;
    },
    _lopare(dt, t) {
      const n = G.lopare(); while (lopare.length < n) lopare.push({ seg: lopare.length % Math.max(1, route.length), d: 0, u: Folk.add(0, 0, 'bonde', { gar: true, sc: 1.0, col: '#8a5a3a' }) });
      if (!route.length) return; const v = G.lopFart() * dt;
      for (const l of lopare) {
        l.seg %= route.length; let seg = route[l.seg]; l.d += v; let guard = 0;
        while (l.d >= seg.len && guard++ < 20) { l.d -= seg.len; if (seg.to) G.besok(seg.to, true); l.seg = (l.seg + 1) % route.length; seg = route[l.seg]; }
        const a = R.along(seg.pts, l.d), ry = W._ryttare(); if (G.s.varld === 0) l.fil = W._fil(l.fil, a, dt, ry.g && ry.g.visible ? [ry] : []); const lf = l.fil || 0; l.u.x = a.x + Math.cos(a.ang) * lf; l.u.z = a.z - Math.sin(a.ang) * lf; l.u.ang = a.ang; l.u.skidar = G.s.varld === 1 && (World.snowAt(a.x, a.z) > 0.45 || World.iceAt(a.x, a.z)); l.u.lean = 0.2;
      }
    },
    // Folket i baserna: några som går omkring, och uppbådet som samlas kring elden.
    _folk(dt, t) {
      const S = G.s;
      for (const b of D.BASER) {
        const L = S.bas[b.id] || 0, want = L ? Math.min(9, 3 + Math.floor(L / 8)) + (b.slag === 'gruva' ? Math.min(8, G.arb(b.id)) : 0) : (steg[b.id].length ? 2 : 0), list = vandrare[b.id] || (vandrare[b.id] = []), p = R.P[b.id], tm = tomt[b.id];
        while (list.length < want) { const q = W._ledig(tm), u = Folk.add(p.x + q[0], p.z + q[1], b.slag === 'bygd' ? 'by' : b.slag === 'gruva' ? 'bergsman' : 'borgare'); list.push({ u, tx: u.x, tz: u.z, vanta: Math.random() * 3, hopp: 0 }); }
        for (const v of list) {
          const u = v.u, dx = v.tx - u.x, dz = v.tz - u.z, d = Math.hypot(dx, dz);
          if (v.hopp > 0) { v.hopp -= dt; u.y = Math.abs(Math.sin(v.hopp * 12)) * 0.1; } else u.y = 0;
          if (d > 0.06) { u.gar = true; u.ang = Math.atan2(dx, dz); const st = Math.min(d, 0.5 * dt), nx = u.x + dx / d * st, nz = u.z + dz / d * st; if (S.varld === 0 && W._iHus(tm, nx, nz) && !W._iHus(tm, u.x, u.z)) { v.tx = u.x; v.tz = u.z; } else { u.x = nx; u.z = nz; } }          // förspelet: aldrig in i ett hus
          else { u.gar = false; v.vanta -= dt; if (v.vanta <= 0) { const q = S.varld === 0 ? W._ledigVag(tm, u.x, u.z) : W._ledig(tm); if (q) { v.tx = p.x + q[0]; v.tz = p.z + q[1]; } v.vanta = 1 + Math.random() * 4; } }
        }
      }
      if (S.varld === 0) W._kroppar();
      // uppbådet: ju fullare hären är, desto fler står kring elden i bygderna
      const bygder = D.BASER.filter(b => b.slag === 'bygd' && S.bas[b.id]), tak = G.tak(), want = bygder.length ? Math.round(Math.min(1, S.res.man / tak) * Math.min(40, 10 + bygder.length * 8)) : 0;
      W._hopT = (W._hopT || 0) + dt;
      if (W._hopT > 0.12) { W._hopT = 0;
        if (hop.length < want) { const b = bygder[hop.length % bygder.length], p = R.P[b.id], fz = p.z + 0.5 * B.K, xz = W._hopPlats(p.x, fz), x = xz[0], z = xz[1]; hop.push(Folk.add(x, z, S.las.flotta && Math.random() < 0.25 ? 'knekt' : 'bonde', { ang: Math.atan2(p.x - x, fz - z), pike: Math.random() < 0.5 })); }
        else if (hop.length > want) Folk.remove(hop.pop());
      }
    },
    // Ett tryck i förspelets slag: leden trycker på och det dammar vid fronten, eller (belägringen) tornen skjuter, försvararna jublar, brevet beseglas.
    _slagTryck(o) {
      if (vis.u.belagring) { W._belBild(o && o.bild, true, 'hugg'); return; }
      vis.stot = 1; Scene.shake(0.14); const fi = vis.fi.filter(e => e.br === 0 && e.fall < 0.5), e = fi[Math.floor(Math.random() * fi.length)] || vis.enh[0];
      if (e) Fx.damm(e.x, Geo.groundAt(e.x, e.z), e.z, 3); if (Math.random() < 0.5) V.Ljud && V.Ljud.spela('svard');
    },
    // Var i världen ringen står i förspelets slag (Johannes 2026-11-26: "så man klickar på slagfältet"). null = ingen ring just nu.
    malPunkt() {
      const a = G.s.aktivt, m = a && a.mom; if (!vis || !m || m.svar || m.typ === 'vanta' || G.s.varld !== 0) return null;
      const u = vis.u, o = u.order && u.order[m.i]; if (!o) return null; const O = G.ORDER, gy = (x, z) => Geo.groundAt(x, z), j = Math.round(m.tm / O.takt);
      const mitt = (l, f) => { let x = 0, z = 0, n = 0; for (const e of l) if (f(e)) { x += e.x; z += e.z; n++; } return n ? { x: x / n, z: z / n } : null; };
      if (u.belagring) {          // belägringen: lägret vid Brunkeberg, Kristina med breven, försvararna och tornen
        const p = R.P.stockholm;
        if (m.typ === 'hugg') { if (o.bild === 'kanon') { const t = W._tornLagen && W._tornLagen.length ? W._tornLagen : [{ x: p.x + 1.4, z: p.z - 1.3 }], q = t[j % t.length]; return { x: q.x, y: gy(q.x, q.z) + 1.4, z: q.z }; } const e = vis.enh[(j * 3) % Math.max(1, vis.enh.length)]; return e ? { x: e.x, y: gy(e.x, e.z) + 0.5, z: e.z } : null; }
        if (o.bild === 'brev') { const k = W._kristina; return k ? { x: k.x, y: gy(k.x, k.z) + 0.6, z: k.z } : null; }
        const b = R.P.brunkeberg || p; return { x: b.x, y: gy(b.x, b.z) + 0.4, z: b.z };
      }
      if (!vis.noll) return null;
      const egen = mitt(vis.enh, e => e.br === 0 && e.fall < 0.5), fi = mitt(vis.fi, e => e.br === 0 && e.fall < 0.5);
      if (m.typ === 'hugg') {          // huggen kommer på olika ställen längs fronten, där leden möts
        if (!egen || !fi) { const q = egen || fi; return q ? { x: q.x, y: gy(q.x, q.z) + 0.35, z: q.z } : null; }
        const mon = [0, 0.6, -0.5, 0.25, -0.75, 0.8, -0.2, 0.45, -0.6, 0.1], r = vis.ram || { sx: 1, sz: 0 }, k = mon[j % mon.length] * (vis.bredd || 6) * 0.32 / 2, x = (egen.x + fi.x) / 2 + r.sx * k, z = (egen.z + fi.z) / 2 + r.sz * k;
        return { x, y: gy(x, z) + 0.35, z };
      }
      let q = null; const mal = o.mal || 'fiende';
      if (mal === 'egen') q = egen;
      else if (mal === 'flank') { const r0 = vis.fi.filter(e => e.br === 0); if (r0.length) { const a0 = r0[0], a1 = r0[r0.length - 1]; q = a0.z > a1.z ? a0 : a1; } }          // den södra flanken (söder är nedåt på kartan)
      else if (mal === 'bak') { let mx = 0; vis.fi.forEach(e => { if ((e.br || 0) > mx) mx = e.br; }); q = mitt(vis.fi, e => (e.br || 0) === mx); }
      else q = fi;
      q = q || fi || egen; return q ? { x: q.x, y: gy(q.x, q.z) + 0.35, z: q.z } : null;
    },
    malSkarm() { const q = W.malPunkt(); if (!q) return null; const p = Scene.screenPoint(q.x, q.y, q.z); return p.behind ? null : { x: p.x, y: p.y, r: Scene.mobil ? 48 : 40 }; },          // r = hur nära man måste trycka
    // En kanonkula som syns flyga i en båge och slår ner (förspelet): så ser man vem som skjuter på vem
    _kula(x0, y0, z0, x1, z1, rok) {
      const y1 = Geo.groundAt(x1, z1) + 0.1, T = 1.0, g = 4; Fx.krut(x0, y0, z0);
      Fx.spawn({ x: x0, y: y0, z: z0, vx: (x1 - x0) / T, vz: (z1 - z0) / T, vy: (y1 - y0) / T + g * T / 2, g, size: 0.16, r: 0.08, gr: 0.07, b: 0.06, a: 1, fade: 0, max: T });
      setTimeout(() => { Fx.krut(x1, y1, z1); Fx.damm(x1, y1, z1, 8); if (rok) for (let k = 0; k < 3; k++) Fx.rok(x1, y1 + 0.2, z1, true); Scene.shake(0.14); }, T * 1000);
    },
    // Namn över dem som slåss (förspelet), så att man ser vem som är vem
    _slagNamn() {
      const ut = [], gy = (x, z) => Geo.groundAt(x, z), mitt = l => { let x = 0, z = 0, n = 0; for (const e of l) if (e.vis !== false && e.fall < 0.5) { x += e.x; z += e.z; n++; } return n ? { x: x / n, z: z / n } : null; };
      if (vis.u.belagring) { const b = R.P.brunkeberg; if (b) ut.push({ id: 'slag-lager', namn: 'Kristians läger', x: b.x, z: b.z + 0.9, y: gy(b.x, b.z) + 0.2 }); const f = mitt(vis.enh); if (f) ut.push({ id: 'slag-egen', namn: 'Försvararna', x: f.x, z: f.z + 0.4, y: gy(f.x, f.z) }); return ut; }
      const e = mitt(vis.enh), f = mitt(vis.fi), egen = vis.u.id === 'sUppsala' ? 'Bönderna' : 'Sten Stures män';
      if (e) ut.push({ id: 'slag-egen', namn: egen, x: e.x, z: e.z, y: gy(e.x, e.z) + 1.1 }); if (f) ut.push({ id: 'slag-fiende', namn: 'Danskarna', x: f.x, z: f.z, y: gy(f.x, f.z) + 1.1 });
      return ut;
    },
    // Belägringen av Stockholm 1520 (förspelet): försvarare i rad framför slottet där Kristina står, och det ögonblicken visar.
    _belStart(p) {
      const K = B.K, kr = W._kristina, kx = kr ? (kr.bx !== undefined ? kr.bx : kr.x) : p.x + 1.9 * K, kz = kr ? kr.z : p.z - 0.5 * K;
      for (let j = 0; j < 4; j++) for (const s of [-1, 1]) vis.enh.push(Folk.add(kx + s * (0.6 + j * 0.56), kz + 0.5 + (j % 2) * 0.16, j % 2 ? 'borgare' : 'knekt', { pike: j % 2 === 0, ang: 0 }));
    },
    _belBild(bild, bra, nar) {
      const p = R.P.stockholm, Lj = V.Ljud, kr = W._kristina, gy = (x, z) => Geo.groundAt(x, z), torn = W._tornLagen && W._tornLagen.length ? W._tornLagen : [{ x: p.x + 1.6, z: p.z - 1.2 }];
      if (bild === 'mana') { if (vis) vis.enh.forEach((u, i) => { if (bra || i % 2) { u.y = 0.1; setTimeout(() => { u.y = 0; }, 170 + i * 15); } }); if (kr) kr.hoppT = 0.45; if (Lj) Lj.spela(nar === 'hugg' ? 'sorl' : bra ? 'klart' : 'nej'); return; }
      if (bild === 'kanon') {
        const b = R.P.brunkeberg || p, mot = () => [b.x + (Math.random() - 0.5) * 1.4, b.z + (Math.random() - 0.5) * 1.4];
        if (nar === 'hugg') { const q = torn[Math.floor(Math.random() * torn.length)], m = mot(); W._kula(q.x, gy(q.x, q.z) + 1.5, q.z, m[0], m[1], false); if (Lj) Lj.spela('kanon'); return; }          // ett tryck: ett torn skjuter mot lägret, och man ser kulan flyga
        if (bra) torn.forEach((q, i) => setTimeout(() => { const m = mot(); W._kula(q.x, gy(q.x, q.z) + 1.5, q.z, m[0], m[1], false); }, i * 220));          // tornen skjuter mot lägret
        else { const x = p.x + (Math.random() - 0.5) * 2.4, z = p.z + 0.6 + Math.random() * 1.2; W._kula(b.x, gy(b.x, b.z) + 0.4, b.z, x, z, true); }          // en kula från lägret slår ner bland husen
        if (Lj) Lj.spela('kanon'); return;
      }
      if (bild === 'brev' && bra) { const x = kr ? kr.x : p.x, z = kr ? kr.z : p.z; Fx.guld(x, gy(x, z) + 0.4, z, 40, 1.2); if (Lj) Lj.spela('klart'); }
    },
    // Isen på Åsunden (förspelet): sjön finns inte i kartans vatten, så den målas i marken (sync) och får här en egen yta med blå is och snödrivor,
    // lagd efter marken, så att den syns mot snön. Den tonas in när det är is på sjöarna (update).
    _isAsunden(e, dx, dz) {
      const L = h => { const q = V.hexToLin(h); return new THREE.Color(q.r, q.g, q.b); }, is = L('#8fb4c9'), klar = L('#5d8ea9'), sno = L('#e4ecf2'), c = new THREE.Color();
      const A = [e[0] - dx * 6.2, e[1] - dz * 6.2], Bp = [e[0] + dx * 7.6, e[1] + dz * 7.6], nx = -dz, nz = dx, NU = 40, NV = 14, pos = [], col = [], idx = [];
      for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) {
        const u = i / NU, v = j / NV * 2 - 1, hw = 4.4 * Math.sqrt(Math.max(0, 1 - Math.pow(2 * u - 1, 2))) * (0.9 + 0.12 * Math.sin(u * 17 + (v > 0 ? 1 : 4))), x = A[0] + (Bp[0] - A[0]) * u + nx * v * hw, z = A[1] + (Bp[1] - A[1]) * u + nz * v * hw;
        pos.push(x, Math.max(0.02, Geo.groundAt(x, z)) + 0.035, z);
        const n1 = Math.sin(x * 0.9 + z * 0.35) * Math.sin(z * 0.8 - x * 0.2), drev = Math.max(0, Math.sin((x * 0.55 + z * 0.85) * 1.7 + n1 * 1.5));
        c.copy(is).lerp(klar, Math.max(0, n1) * 0.85).lerp(sno, Math.min(1, Math.pow(drev, 8) * 0.6 + Math.pow(Math.abs(v), 5) * 0.55)); col.push(c.r, c.g, c.b);
      }
      for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
      m.receiveShadow = true; m.renderOrder = 1; m.visible = false; scene.add(m); dekor.asundenIs = m;
    },
    // Fasta kroppar (förspelet, Johannes 2026-11-26: "alla modeller ska ha en fast kropp, en hitbox").
    // Vägens högra sida: fil = hur långt till höger om vägens mitt. Ligger någon framför i samma riktning går man ut till vänster och kör om.
    _fil(fil, a, dt, hinder) {
      let mal = 0.16; for (const id in G.s.bas) { const q = R.P[id]; if (q && Math.hypot(q.x - a.x, q.z - a.z) < 2.6) { mal = 0; break; } }          // inne i en stad: mitt på vägen
      const fx = Math.sin(a.ang), fz = Math.cos(a.ang), sx = Math.cos(a.ang), sz = -Math.sin(a.ang), x0 = a.x + sx * 0.16, z0 = a.z + sz * 0.16;
      if (mal) for (const u of hinder) { if (!u || u.vis === false) continue; const dx = u.x - x0, dz = u.z - z0, fram = dx * fx + dz * fz, sid = dx * sx + dz * sz; if (fram > -0.3 && fram < 0.9 && Math.abs(sid) < 0.3 && Math.cos((u.ang || 0) - a.ang) > 0.3) { mal = -0.24; break; } }
      const f0 = fil === undefined ? 0.16 : fil; return f0 + (mal - f0) * Math.min(1, dt * 3);
    },
    // Står punkten i ett hus eller i vattnet (i en plats med hus)?
    _iHus(tm, x, z) { const K = B.K, lx = (x - tm.p.x) / K, lz = (z - tm.p.z) / K; return Geo.sdAt(x, z) <= 0.4 || tm.occ.some(o => Math.hypot(o[0] - lx, o[1] - lz) < o[2] * 0.75); },
    // En ledig fläck att gå till, dit vägen inte går genom något hus
    _ledigVag(tm, x0, z0) {
      const inne = W._iHus(tm, x0, z0);          // står man redan i ett hus (staden har vuxit runt en) får man gå ut åt vilket håll som helst
      for (let k = 0; k < 12; k++) { const q = W._ledig(tm), x = tm.p.x + q[0], z = tm.p.z + q[1], n = Math.max(2, Math.ceil(Math.hypot(x - x0, z - z0) / 0.25)); let ok = true; if (!inne) for (let s = 1; s < n; s++) if (W._iHus(tm, x0 + (x - x0) * s / n, z0 + (z - z0) * s / n)) { ok = false; break; } if (ok) return q; }
      return null;
    },
    // Folket i städerna kliver åt sidan för varandra och för dem som går på vägen (ryttaren, skattelagen, löparna, hären), men aldrig in i ett hus
    _kroppar() {
      const hard = [], Gu = V.Gustav, Bu = V.Bud;
      if (Gu.g && Gu.g.visible) hard.push([Gu.x, Gu.z, 0.3]); if (Bu.g && Bu.g.visible) hard.push([Bu.x, Bu.z, 0.3]); if (W._kristina) hard.push([W._kristina.x, W._kristina.z, 0.14]);
      (skattVis || []).forEach(q => q.enh.forEach(e => hard.push([e.x, e.z, 0.12]))); lopare.forEach(l => hard.push([l.u.x, l.u.z, 0.12])); hop.forEach(h => hard.push([h.x, h.z, 0.12]));
      if (vis) { vis.enh.forEach(e => { if (e.vis !== false) hard.push([e.x, e.z, 0.12]); }); vis.fi.forEach(e => hard.push([e.x, e.z, 0.12])); }
      for (const id in vandrare) {
        const tm = tomt[id], l = vandrare[id]; if (!tm || !l.length) continue; const nara = hard.filter(h => Math.abs(h[0] - tm.p.x) < tm.R + 1 && Math.abs(h[1] - tm.p.z) < tm.R + 1);
        for (let i = 0; i < l.length; i++) {
          const u = l[i].u; let px = 0, pz = 0;
          for (const h of nara) { const dx = u.x - h[0], dz = u.z - h[1], d = Math.hypot(dx, dz), m = 0.11 + h[2]; if (d < m && d > 1e-4) { px += dx / d * (m - d); pz += dz / d * (m - d); } }
          for (let j = 0; j < l.length; j++) { if (j === i) continue; const o = l[j].u, dx = u.x - o.x, dz = u.z - o.z, d = Math.hypot(dx, dz); if (d < 0.22 && d > 1e-4) { px += dx / d * (0.22 - d) * 0.5; pz += dz / d * (0.22 - d) * 0.5; } }
          if (px || pz) { if (!W._iHus(tm, u.x + px, u.z + pz)) { u.x += px; u.z += pz; } else if (!W._iHus(tm, u.x + pz, u.z - px)) { u.x += pz; u.z -= px; } }
        }
      }
    },
    // För provet: hur många i städerna står i varandra, i ett hus, eller i den som rider förbi
    _provKroppar() {
      const ut = { folk: 0, par: 0, iHus: 0, vidRyttaren: 0, pavagen: 0 }, ry = W._ryttare();
      if (ry.g && ry.g.visible) { (skattVis || []).forEach(q => q.enh.forEach(e => { if (Math.hypot(e.x - ry.x, e.z - ry.z) < 0.15) ut.pavagen++; })); lopare.forEach(l => { if (Math.hypot(l.u.x - ry.x, l.u.z - ry.z) < 0.15) ut.pavagen++; }); }          // ryttaren i någon som går på vägen
      for (const id in vandrare) { const tm = tomt[id], l = vandrare[id]; if (!tm) continue; ut.folk += l.length;
        l.forEach((v, i) => { const u = v.u; if (W._iHus(tm, u.x, u.z)) ut.iHus++; if (ry.g && ry.g.visible && Math.hypot(u.x - ry.x, u.z - ry.z) < 0.25) ut.vidRyttaren++; for (let j = i + 1; j < l.length; j++) if (Math.hypot(u.x - l[j].u.x, u.z - l[j].u.z) < 0.15) ut.par++; }); }
      return ut;
    },
    // En plats kring elden där ingen annan redan står (förspelet; i Gustavs värld som förut)
    _hopPlats(cx, cz) {
      let x = cx, z = cz;
      for (let k = 0; k < 8; k++) { const a = Math.random() * 6.283, d = 0.6 + Math.random() * 1.5; x = cx + Math.cos(a) * d; z = cz + Math.sin(a) * d * 0.8; if (G.s.varld !== 0 || !hop.some(h => Math.hypot(h.x - x, h.z - z) < 0.24)) break; }
      return [x, z];
    },
    _ledig(tm) { const K = B.K; for (let k = 0; k < 12; k++) { const a = Math.random() * 6.283, d = Math.random() * tm.R / K * 0.75, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.85 + 0.3; if (Geo.sdAt(tm.p.x + x * K, tm.p.z + z * K) > 0.4) { let ok = true; for (const o of tm.occ) if (Math.hypot(o[0] - x, o[1] - z) < o[2] * 0.75) { ok = false; break; } if (ok) return [x * K, z * K]; } } return [0, 0.6 * K]; },
    // ---- förspelets fälttåg och slag (Johannes 2026-11-26) ----
    // Så många som de var (D.STURE folk: en figur för ungefär fyrtio man där antalet är känt). På vägen går de i kolonn, led för led.
    // I slaget ställer de upp i bredd mot fienden, och leden möts utan att gå in i varandra. Du rider mitt i främsta leden och hugger själv.
    _tag0Start(u, pts) {
      const S = G.s, tak = Scene.mobil ? 180 : 260, n = Math.min(tak, (u.folk && u.folk[0]) || 24), m = u.strid ? Math.min(tak, (u.folk && u.folk[1]) || n) : 0;
      vis.gustav = !!u.med; vis.noll = true; vis.kol = n > 60 ? 6 : 4; vis.bredd = Math.max(6, Math.min(26, Math.ceil(Math.sqrt(Math.max(n, m) * 2.3))));
      const platser = []; for (let r = 0; platser.length < n; r++) for (let c = 0; c < vis.bredd && platser.length < n; c++) { const bk = c - (vis.bredd - 1) / 2; if (vis.gustav && r < 3 && Math.abs(bk) < 1.3) continue; platser.push([r, bk]); }          // en lucka mitt i de främsta leden, där du rider
      for (let k = 0; k < n; k++) { const e = Folk.add(pts[0][0], pts[0][1], S.sold > 0 && k % 5 === 0 ? 'knekt' : 'bonde', { pike: k % 2 === 0, rad: Math.floor(k / vis.kol), kol: k % vis.kol - (vis.kol - 1) / 2, gar: true }); e.br = platser[k][0]; e.bk = platser[k][1]; vis.enh.push(e); }
      const f = B.flagga('sverige'); f.scale.setScalar(0.8); scene.add(f); vis.fana = f;
      if (m) { const e = R.along(pts, vis.len), fx = Math.sin(e.ang), fz = Math.cos(e.ang), sx = Math.cos(e.ang), sz = -Math.sin(e.ang);
        for (let k = 0; k < m; k++) { const r = Math.floor(k / vis.bredd), c = k % vis.bredd - (vis.bredd - 1) / 2, x = e.x + fx * (1.3 + r * 0.4) + sx * c * 0.32, z = e.z + fz * (1.3 + r * 0.4) + sz * c * 0.32, q = Folk.add(x, z, 'dansk', { pike: k % 2 === 0, ang: e.ang + Math.PI }); q.bx = x; q.bz = z; q.br = r; vis.fi.push(q); } }
    },
    _tag0(dt, t, a, u) {
      const Gu = V.Gustav, f = Math.min(1, a.t / a.dur), strid = !!u.strid, K0 = a.k0 || G.KAMP, gf = strid ? Math.min(1, f / K0) : f, kamp = strid && f > K0, kf = strid ? Math.max(0, (f - K0) / (1 - K0)) : 0, forlust = u.strid === 'nederlag';
      const DR = 0.4, DK = 0.32, stopp = strid ? 0.9 : 1.8, dist = Math.max(0, vis.len - stopp) * gf, lead = R.along(vis.pts, dist), fx = Math.sin(lead.ang), fz = Math.cos(lead.ang), sx = Math.cos(lead.ang), sz = -Math.sin(lead.ang);
      vis.ram = { sx, sz };          // åt vilket håll leden står (för ringen på slagfältet)
      // leden går varandra till mötes tills det är en knapp armlängd emellan (2,2 mellan dem från början, 1,85 går de)
      const in0 = Math.min(1, kf / 0.3), A = in0 * 1.0 + (vis.stot > 0 ? 0.12 : 0.35) * (vis.stot || 0), Bf = in0 * 0.85, ut = kamp ? Geo.smooth(0, 0.22, kf) : 0, P = u.order ? G._plan(u) : null, pt = a.t - a.dur * K0, flykt = forlust ? (P ? (a.kula ? Math.min(1, (vis.kulaT = (vis.kulaT || 0) + dt) / 7) : Math.max(0, Math.min(1, (pt - P.slut) / 5))) : Math.max(0, (kf - 0.45) / 0.55)) : 0, vinst = !forlust ? (P ? Math.max(0, Math.min(1, (pt - P.slut + 3) / 5)) : Math.max(0, (kf - 0.6) / 0.4)) : 0;
      if (kamp) { W._folj(lead.x + fx * 1.1, lead.z + fz * 1.1 + 0.4, vis.bredd > 14 ? 24 : 18); if (!vis.iSlag) { vis.iSlag = true; W.foljUppdraget(); } } else W._folj(lead.x, lead.z, 30);
      if (vis.gustav) { const hf = kamp ? A - 0.55 - (a.kula ? 3.2 * Math.max(0, flykt - 0.15) : flykt * 2) : 0; Gu.slass = kamp && !flykt && !a.kula ? 1 : 0; Gu.stupad = !!a.kula; Gu.place(lead.x + fx * hf, lead.z + fz * hf, lead.ang, gf < 1 ? 0.9 : 0, t, dt, false, !!a.kula); }
      if (u.rader && kamp) { const nr = Math.min(u.rader.length - 1, Math.floor(kf * u.rader.length)); if (vis.radNr !== nr) { vis.radNr = nr; if (!V.tyst) V.UI.text(u.rader[nr], 4.5); } }          // ett slag där du inte är med: raderna säger vad som händer
      const bak0 = vis.gustav ? 0.95 : 0;
      vis.enh.forEach((e, i) => {
        const d0 = dist - e.rad * DR - bak0, back = R.along(vis.pts, Math.max(0, d0)); let x = back.x + Math.cos(back.ang) * e.kol * DK, z = back.z - Math.sin(back.ang) * e.kol * DK, ang = back.ang;
        e.vis = d0 > -0.25 || kamp;          // de kommer fram led för led, inte i en hög
        if (kamp) {
          const j = Math.sin(t * 11 + e.fas) * (e.br < 2 ? 0.05 : 0.015), fl = flykt * (2.5 + (i % 5) * 0.5), fram = A + j - e.br * DR - fl, bx = lead.x + fx * fram + sx * e.bk * DK, bz = lead.z + fz * fram + sz * e.bk * DK;
          x += (bx - x) * ut; z += (bz - z) * ut; ang = flykt > 0.05 && e.fall < 0.3 ? lead.ang + Math.PI : lead.ang;
          if (forlust && i % 3 === 0 && kf > 0.3 + (i % 9) * 0.05) e.fall = Math.min(1, e.fall + dt * 3);
        }
        e.x = x; e.z = z; e.ang = ang; e.gar = e.fall < 0.3 && (gf < 1 || (kamp && (ut < 1 || flykt > 0))); e.strid = kamp && ut > 0.8 && e.br < 3 && e.fall < 0.3 && !flykt;
      });
      if (vis.fana) { const e0 = vis.enh[0]; vis.fana.position.set(e0.x, Geo.groundAt(e0.x, e0.z) + 0.1, e0.z); }
      if (!kamp) return;
      W._kampT = (W._kampT || 0) + dt;
      if (W._kampT > 0.09) { W._kampT = 0; const e = vis.enh[Math.floor(Math.random() * Math.min(vis.enh.length, vis.bredd * 2))], m = vis.fi[Math.floor(Math.random() * Math.min(vis.fi.length, vis.bredd * 2))]; if (e && m && e.fall < 0.3 && m.fall < 0.3) { if (Math.random() < 0.3) Fx.pil(e.x, Geo.groundAt(e.x, e.z) + 0.35, e.z, m.x, 0.2, m.z); Fx.damm((e.x + m.x) / 2, Geo.groundAt(e.x, e.z), (e.z + m.z) / 2, 1); } }
      vis.fi.forEach((m, i) => {
        const j = Math.sin(t * 11 + m.fas) * (m.br < 2 ? 0.05 : 0.015), fram = Bf + j + flykt * 1.6 - vinst * (2.2 + (i % 5) * 0.5);          // vinner de trycker de på när dina flyr, förlorar de drar de sig undan
        m.x = m.bx - fx * fram; m.z = m.bz - fz * fram; m.gar = m.fall < 0.3; m.strid = m.br < 3 && m.fall < 0.3 && !vinst; m.ang = vinst > 0.05 && m.fall < 0.3 ? lead.ang : lead.ang + Math.PI;
        if (!forlust && i % 3 === 0 && kf > 0.3 + (i % 9) * 0.05) m.fall = Math.min(1, m.fall + dt * 3);
      });
    },
    _uppdrag(dt, t) {
      const S = G.s; if (!vis) return; const a = S.aktivt; if (!a) return;
      const u = vis.u, f = Math.min(1, a.t / a.dur), p = R.P[u.plats], strid = !!u.strid, K0 = G.KAMP, gf = strid ? Math.min(1, f / K0) : f, kamp = strid && f > K0, kf = strid ? Math.max(0, (f - K0) / (1 - K0)) : 0;
      if (vis.stot > 0) vis.stot = Math.max(0, vis.stot - dt * 2.5); else if (vis.stot < 0) vis.stot = Math.min(0, vis.stot + dt * 0.8);
      if (vis.noll) return W._tag0(dt, t, a, u);          // förspelets fälttåg och slag har sin egen ordning
      if (u.belagring && !a.val) {          // Stockholm sommaren 1520: lägret på Brunkeberg och slottet skjuter på varandra medan månaderna går
        if (u.order) W._folj(p.x + 0.9, p.z - 0.2, 26);          // kameran står vid slottet medan staden försvaras
        if (u.nytt && V.kalender && !V.tyst) { const m = V.kalender().man; vis.nytt = vis.nytt || {}; u.nytt.forEach((q, i) => { if (!vis.nytt[i] && m >= q[0]) { vis.nytt[i] = 1; V.UI.text(q[1], 7); } }); }          // nyheter medan staden är instängd
        W._belT = (W._belT === undefined ? 1.5 : W._belT) - dt;
        if (W._belT <= 0 && G.s.varld === 0 && u.order) { W._belN = (W._belN || 0) + 1; W._belT = 3.2 + Math.random() * 2.4; const b = R.P.brunkeberg, ute = W._belN % 2 === 1;          // förspelet: man ser kulorna flyga, från lägret in i staden och från tornen till lägret
          if (b) { if (ute) { const x = p.x + (Math.random() - 0.5) * 2.2, z = p.z + 0.4 + Math.random() * 1.2; W._kula(b.x, Geo.groundAt(b.x, b.z) + 0.4, b.z, x, z, true); } else { const t = W._tornLagen && W._tornLagen.length ? W._tornLagen[W._belN % W._tornLagen.length] : { x: p.x + 1.4, z: p.z - 1.3 }; W._kula(t.x, Geo.groundAt(t.x, t.z) + 1.5, t.z, b.x + (Math.random() - 0.5) * 1.2, b.z + (Math.random() - 0.5) * 1.2, false); } } }
        else if (W._belT <= 0) { W._belN = (W._belN || 0) + 1; W._belT = 1.8 + Math.random() * 2.4; const ute = W._belN % 2 === 1, q = ute ? R.P.brunkeberg : p, x = q.x + (Math.random() - 0.5) * 1.6, z = q.z + (ute ? 0.5 : -0.9); Fx.krut(x, Geo.groundAt(x, z) + (ute ? 0.3 : 1.2), z); if (!ute && V.Ljud) V.Ljud.spela('kanon'); if (!ute && W._tornLagen && W._tornLagen.length) { const q = W._tornLagen[W._belN % W._tornLagen.length]; Fx.krut(q.x, Geo.groundAt(q.x, q.z) + 1.7, q.z); } }
      }
      if (vis.pts && (u.slag === 'tag' || u.slag === 'bud' || u.slag === 'rid')) {
        const stopp = strid ? (u.strid === 'pilar' ? 2.2 : u.strid === 'kanoner' ? 1.6 : 0.9) : u.slag === 'tag' ? 1.8 : 0, dist = Math.max(0, vis.len - stopp) * gf;
        const lead = R.along(vis.pts, dist);
        if (kamp && vis.fi.length) { const m0 = vis.fi[0], m1 = vis.fi[vis.fi.length - 1], v = (m, k) => m['b' + k] !== undefined ? m['b' + k] : m[k]; W._folj((lead.x * 2 + v(m0, 'x') + v(m1, 'x')) / 4, (lead.z * 2 + v(m0, 'z') + v(m1, 'z')) / 4 + 0.6, 21); }          // i striden ska båda sidor synas
        else W._folj(lead.x, lead.z, u.slag === 'rid' ? 24 : 30);
        if (vis.gustav) V.Gustav.place(lead.x, lead.z, lead.ang, gf < 1 ? 0.9 : 0, t, dt, false);
        vis.enh.forEach((e, i) => {
          const rad = e.rad || 0, back = R.along(vis.pts, Math.max(0, dist - rad * 0.36 - (vis.gustav ? 0.5 : 0))), kol = (e.kol || 0) * 0.3;
          e.x = back.x + Math.cos(back.ang) * kol; e.z = back.z - Math.sin(back.ang) * kol; e.ang = back.ang; e.gar = gf < 1 || kamp; e.strid = kamp && e.fall < 0.3; e.skidar = u.slag === 'bud' && S.varld === 1 && (World.snowAt(e.x, e.z) > 0.45 || World.iceAt(e.x, e.z));
          if (kamp && u.strid !== 'pilar' && u.strid !== 'kanoner') { const j = Math.sin(t * 11 + e.fas) * 0.12; const fram = 0.5 * kf + j + 0.3 * (vis.stot || 0); e.x += Math.sin(back.ang) * fram; e.z += Math.cos(back.ang) * fram; if (u.strid === 'nederlag' && kf > 0.35 + (i % 7) * 0.08) { e.fall = Math.min(1, e.fall + dt * 3); e.gar = false; } }
        });
        if (vis.fana) { const e0 = vis.enh[0]; vis.fana.position.set(e0.x, Geo.groundAt(e0.x, e0.z) + 0.1, e0.z); }
        if (kamp) {
          W._kampT = (W._kampT || 0) + dt;
          if (W._kampT > 0.09) { W._kampT = 0; const e = vis.enh[Math.floor(Math.random() * vis.enh.length)], m = vis.fi.length ? vis.fi[Math.floor(Math.random() * vis.fi.length)] : null;
            if (u.strid === 'kanoner') { if (Math.random() < 0.12) { Fx.krut(e.x, Geo.groundAt(e.x, e.z) + 0.25, e.z); Scene.shake(0.2); V.Ljud && V.Ljud.spela('kanon'); } }
            else if (m) { if (u.strid === 'pilar' || Math.random() < 0.5) { Fx.pil(e.x, Geo.groundAt(e.x, e.z) + 0.35, e.z, m.x, 0.2, m.z); if (u.strid !== 'pilar' && u.strid !== 'nederlag') { /* bara vi skjuter */ } } if (u.strid !== 'pilar') Fx.damm((e.x + m.x) / 2, Geo.groundAt(e.x, e.z), (e.z + m.z) / 2, 1); } }
          vis.fi.forEach((m, i) => { m.strid = u.strid !== 'kanoner' && m.fall < 0.3;
            if (u.strid === 'pilar') { m.gar = true; const fly = Math.max(0, kf - 0.25 - (i % 5) * 0.05) * 3.2; m.x = m.bx + Math.sin(lead.ang) * fly; m.z = m.bz + Math.cos(lead.ang) * fly; m.ang = lead.ang + (fly > 0 ? 0 : Math.PI); if (kf > 0.4 && i % 4 === 0) m.fall = Math.min(1, m.fall + dt * 2); }
            else if (u.strid === 'kanoner') { if (kf > 0.55) m.lean = Math.min(0.9, m.lean + dt * 1.5); }
            else if (u.strid === 'nederlag') { m.gar = true; const j = Math.sin(t * 11 + m.fas) * 0.1; m.x = m.bx - Math.sin(lead.ang) * (0.4 * kf + j); m.z = m.bz - Math.cos(lead.ang) * (0.4 * kf + j); }
            else { m.gar = true; const j = Math.sin(t * 11 + m.fas) * 0.1; m.x = m.bx - Math.sin(lead.ang) * (0.3 * kf + j); m.z = m.bz - Math.cos(lead.ang) * (0.3 * kf + j); if (kf > 0.3 + (i % 6) * 0.1) { m.fall = Math.min(1, m.fall + dt * 3); m.gar = false; } }
          });
        }
      } else if (u.slag === 'flotta') {
        const dist = vis.len * gf; { const l0 = R.along(vis.pts, dist); W._folj(l0.x, l0.z, 46); }
        vis.skepp.forEach((s, i) => { const a2 = R.along(vis.pts, Math.max(0, dist - i * 2.3)); s.position.set(a2.x + Math.cos(a2.ang) * ((i % 2) - 0.5) * 1.5, 0.02 + Math.sin(t * 1.4 + i) * 0.03, a2.z - Math.sin(a2.ang) * ((i % 2) - 0.5) * 1.5); s.rotation.y = a2.ang; s.rotation.z = Math.sin(t * 1.2 + i * 2) * 0.05; });
        if (vis.gustav) { const s0 = vis.skepp[0].position; V.Gustav.place(s0.x, s0.z, 0, 0, t, dt, true); }
        if (kamp && vis.fiende) { W._kampT = (W._kampT || 0) + dt; if (W._kampT > 0.25) { W._kampT = 0; const s = vis.skepp[Math.floor(Math.random() * vis.skepp.length)].position; Fx.krut(s.x, 0.4, s.z); V.Ljud && V.Ljud.spela('kanon'); } vis.fiende.forEach((s, i) => { if (kf > 0.4 + i * 0.12) { s.position.y -= dt * 0.25; s.rotation.z += dt * 0.3; } }); }
      } else if (u.slag === 'bygg') {
        vis.enh.forEach(e => { e.gar = true; e.ang += dt * (0.5 + e.fas); }); if (Math.random() < dt * 5) Fx.damm(vis.stallning.position.x + (Math.random() - 0.5), p.y + 0.1, vis.stallning.position.z + (Math.random() - 0.5), 1);
        vis.stallning.scale.set(1, 0.3 + 0.7 * f, 1);
      }
    }
  };
  function grafHar(id) { return R.VAGAR.some(e => e[0] === id || e[1] === id) && id !== 'lubeck'; }
})();
