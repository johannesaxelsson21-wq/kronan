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
      scene = sc; W._kristina = null; W._kring = null; W._kvar = null; W._borta = false; W._plats = null; W._placerad = false; if (W._foljMig === undefined) W._foljMig = 1; Folk.init(sc); Fx.init(sc); V.Gustav.init(sc, G.s.varld === 0 ? 'sten' : 'gustav'); V.Bud.init(sc, 'bud'); V.Bud.kanSkida = G.s.varld === 1;          // bud på skidor hör Dalarna och Gustavs tid till
      for (const b of D.BASER) {
        const p = R.P[b.id]; tomt[b.id] = new B.Tomt(b, p); steg[b.id] = [];
        const g = grp[b.id] = new THREE.Group(); g.position.set(p.x, p.y, p.z); g.scale.setScalar(B.K); sc.add(g);
      }
      for (const e of R.roads()) World.Paint.road(e, 0.13);
      World.Paint.commit();
    },
    // Se till att världen stämmer med spelets läge (vid start, efter laddning och efter varje uppdrag).
    sync(tyst) {
      const S = G.s; if (!S.bas[sistaBas]) sistaBas = Object.keys(S.bas)[0]; if (V.Gustav.klad) V.Gustav.klad(S.titel);
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
    popKlart() { pops.forEach(p => p.m.scale.setScalar(1)); pops.length = 0; },
    // Under en scen syns inte skattelagen och de extra buden: spelet står still då, och de skulle stå som statyer mitt i bilden
    scenDolj(on) { (skattVis || []).forEach(v => v.enh.forEach(e => { e.vis = !on; })); lopare.forEach(l => { l.u.vis = !on; }); },
    pos(id) { const p = R.P[id]; return p ? { x: p.x, y: p.y || 0, z: p.z } : null; },
    // Vilken bas ligger under den här punkten på marken?
    basVid(g) { if (!g) return null; let best = null, bd = 1e9; for (const b of D.BASER) { if (!steg[b.id].length) continue; const p = R.P[b.id], d = Math.hypot(p.x - g.x, p.z - g.z); if (d < tomt[b.id].R + 0.6 && d < bd) { bd = d; best = b.id; } } return best; },

    // ---- Gustavs rundtur ---------------------------------------------------------------------
    rutt() {
      const S = G.s, ids = Object.keys(S.bas), tour = R.tour(ids), key = tour.join(','); if (key === W._ruttKey) return; W._ruttKey = key;
      const fr = W._ruttKlar && W._placerad ? W._framTill() : null;          // vägen han är på just nu, i den gamla rundan
      route = [];
      if (tour.length === 1) {
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
      const man = S.res.man; let pts = null, dur = null, fran = u.fran, hem = null;
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
      }
      if (!G.skicka(dur ? dur * G.s.fartX : undefined)) return false;
      W._startVis(u, pts, fran, man);
      return true;
    },
    // Gläntorna i skogen: en kring var och en som rör sig (hjälten, budet, tåget, skattelagen och den som en scen handlar om)
    fri() {
      const l = [], G0 = V.Gustav, Bu = V.Bud, lagg = (x, z, r) => { if (l.length < 8) l.push([x, z, r]); };
      if (G0.g && G0.g.visible) lagg(G0.x, G0.z, 1.0); if (Bu.g && Bu.g.visible) lagg(Bu.x, Bu.z, 0.9);
      if (vis && vis.enh.length) { const e = vis.enh; lagg(e[0].x, e[0].z, 1.3); if (e.length > 6) { const m = e[e.length >> 1], s = e[e.length - 1]; lagg(m.x, m.z, 1.3); lagg(s.x, s.z, 1.3); } }
      if (vis && vis.fi.length) { const m = vis.fi[vis.fi.length >> 1]; lagg(m.x, m.z, 1.6); }
      (skattVis || []).forEach(v => { if (v.enh[0]) lagg(v.enh[0].x, v.enh[0].z, 1.0); });
      (W.friExtra || []).forEach(q => lagg(q[0], q[1], q[2])); World.fri(l);
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
      if (u.slag === 'tag') {
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
      if (!V.tyst) { if (pts) Scene.flyTo(pts[0][0], pts[0][1] + 1, u.slag === 'flotta' ? 46 : 32, 1.4); else Scene.flyTo(p.x, p.z + 1, 28, 1.4); }
    },
    _slutVis() {
      if (!vis) return;
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
      skattVis.enh.forEach((e, i) => { const a = R.along(skattVis.pts, Math.max(0, dist - Math.floor(i / 2) * 0.36)), kol = ((i % 2) - 0.5) * 0.3; e.x = a.x + Math.cos(a.ang) * kol; e.z = a.z - Math.sin(a.ang) * kol; e.ang = a.ang; e.gar = true; e.skidar = false; });
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
    // Kameran följer det som är ute på uppdrag, tills spelaren själv flyttar kartan.
    _folj(x, z, d) { const c = Scene.cam; if (V.tyst || !vis || c.fly || c.user > vis.start) return; c.tx = x; c.tz = z + (Scene.lyft ? 0 : 1); c.td += (d - c.td) * 0.03; },

    // Händelser från spelet.
    handelse(typ, d) {
      if (typ === 'tryck') {
        if (W._kristina) W._kristina.hoppT = 0.45; const ry = W._ryttare(); if (ry.g && ry.g.visible) Fx.damm(ry.x, Geo.groundAt(ry.x, ry.z) + 0.05, ry.z, 2); if (d.skede) W._drag(d.skede);
        // belägringen: du manar försvaret, och vart tredje tryck skjuter slottet. Det ändrar inte hur länge belägringen varar.
        if (vis && vis.u.belagring && G.s.aktivt && !G.s.aktivt.val) { W._belTryck = (W._belTryck || 0) + 1; if (W._belTryck % 3 === 0) { const p = R.P[vis.u.plats], x = p.x + 1.2 + Math.random() * 1.4, z = p.z - 1.3; Fx.krut(x, Geo.groundAt(x, z) + 1.3, z); V.Ljud && V.Ljud.spela('kanon'); Scene.shake(0.12); } }
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
      for (let k = pops.length - 1; k >= 0; k--) { const p = pops[k]; p.t += dt / 0.65; const e = p.t >= 1 ? 1 : 1 + 2.2 * Math.pow(p.t - 1, 3) + 1.2 * Math.pow(p.t - 1, 2); p.m.scale.setScalar(Math.max(0.01, p.fran + (1 - p.fran) * e)); if (p.t >= 1) pops.splice(k, 1); }
      if (paintDirty && !pops.length) { World.Paint.commit(); paintDirty = false; }
      W._gustav(dt, t); W._lopare(dt, t); W._folk(dt, t); W._uppdrag(dt, t); W._skatt();
      if (S.marknad && Math.random() < dt * 5) { const p = R.P[S.marknad.bas]; Fx.guld(p.x, p.y + 0.3, p.z, 2, tomt[S.marknad.bas].R * 0.6); }
      // rök ur skorstenar och hyttor, gnistor ur eldar
      smokeAcc += dt; if (smokeAcc > 0.22) { smokeAcc = 0; const c = Scene.cam; for (const s of B.smoke) { if (Math.abs(s.x - c.x) > c.d * 1.2 + 10 || Math.abs(s.z - c.z) > c.d + 10) continue; if (!S.bas[s.bas] && s.slag !== 'eld') { if (Math.random() < 0.5) continue; } if (s.slag === 'eld') Fx.gnista(s.x, s.y, s.z); else if (Math.random() < 0.7) Fx.rok(s.x, s.y, s.z, false); }
        for (const u in S.uppror) if (S.uppror[u]) for (const id of D.UPPROR[u].baser) if (S.bas[id]) { const p = R.P[id]; Fx.rok(p.x + (Math.random() - 0.5) * 2, p.y + 0.4, p.z + (Math.random() - 0.5) * 2, true); } }
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
      if (!route.length) { if (kristina) Bu.g.visible = false; else { const q = W.sate(); Gu.place(q.x, q.z, q.ang, 0, t, dt, false, true); } return; }
      // jämn takt: trycken gör ingen resa snabbare (Johannes 2026-11-26: "Det får inte snabba upp något typ av resande"). Förmågan Hästar gör den snabbare för gott.
      const v = G.hastighet() * JAMN * dt; let seg = pre || route[gseg]; gd += v;
      let guard = 0;
      while (gd >= seg.len && guard++ < 20) {
        gd -= seg.len; if (seg.to) { sistaBas = seg.to; G.besok(seg.to, false); }
        if (pre) pre = null; else gseg = (gseg + 1) % route.length; seg = route[gseg];
      }
      const a = R.along(seg.pts, gd); ry.place(a.x, a.z, a.ang, 0.85, t, dt, false); W._placerad = true;
      // kameran följer dig, tills du själv flyttar kartan. Knappen Hitta mig slår på det igen.
      if (!kristina) { const c = Scene.cam; if (!V.tyst && c.user <= (W._foljMig || 0) && !c.fly && !c.locked && !vis) { c.tx = a.x; c.tz = a.z + (Scene.lyft ? 0 : 1.2); } }
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
        const a = R.along(seg.pts, l.d); l.u.x = a.x; l.u.z = a.z; l.u.ang = a.ang; l.u.skidar = G.s.varld === 1 && (World.snowAt(a.x, a.z) > 0.45 || World.iceAt(a.x, a.z)); l.u.lean = 0.2;
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
          if (d > 0.06) { u.gar = true; u.ang = Math.atan2(dx, dz); const st = Math.min(d, 0.5 * dt); u.x += dx / d * st; u.z += dz / d * st; }
          else { u.gar = false; v.vanta -= dt; if (v.vanta <= 0) { const q = W._ledig(tm); v.tx = p.x + q[0]; v.tz = p.z + q[1]; v.vanta = 1 + Math.random() * 4; } }
        }
      }
      // uppbådet: ju fullare hären är, desto fler står kring elden i bygderna
      const bygder = D.BASER.filter(b => b.slag === 'bygd' && S.bas[b.id]), tak = G.tak(), want = bygder.length ? Math.round(Math.min(1, S.res.man / tak) * Math.min(40, 10 + bygder.length * 8)) : 0;
      W._hopT = (W._hopT || 0) + dt;
      if (W._hopT > 0.12) { W._hopT = 0;
        if (hop.length < want) { const b = bygder[hop.length % bygder.length], p = R.P[b.id], a = Math.random() * 6.283, d = 0.6 + Math.random() * 1.5, fz = p.z + 0.5 * B.K, x = p.x + Math.cos(a) * d, z = fz + Math.sin(a) * d * 0.8; hop.push(Folk.add(x, z, S.las.flotta && Math.random() < 0.25 ? 'knekt' : 'bonde', { ang: Math.atan2(p.x - x, fz - z), pike: Math.random() < 0.5 })); }
        else if (hop.length > want) Folk.remove(hop.pop());
      }
    },
    _ledig(tm) { const K = B.K; for (let k = 0; k < 12; k++) { const a = Math.random() * 6.283, d = Math.random() * tm.R / K * 0.75, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.85 + 0.3; if (Geo.sdAt(tm.p.x + x * K, tm.p.z + z * K) > 0.4) { let ok = true; for (const o of tm.occ) if (Math.hypot(o[0] - x, o[1] - z) < o[2] * 0.75) { ok = false; break; } if (ok) return [x * K, z * K]; } } return [0, 0.6 * K]; },
    _uppdrag(dt, t) {
      const S = G.s; if (!vis) return; const a = S.aktivt; if (!a) return;
      const u = vis.u, f = Math.min(1, a.t / a.dur), p = R.P[u.plats], strid = !!u.strid, K0 = G.KAMP, gf = strid ? Math.min(1, f / K0) : f, kamp = strid && f > K0, kf = strid ? Math.max(0, (f - K0) / (1 - K0)) : 0;
      if (vis.stot > 0) vis.stot = Math.max(0, vis.stot - dt * 2.5);
      if (u.belagring && !a.val) {          // Stockholm sommaren 1520: lägret på Brunkeberg och slottet skjuter på varandra medan månaderna går
        W._belT = (W._belT === undefined ? 1.5 : W._belT) - dt;
        if (W._belT <= 0) { W._belN = (W._belN || 0) + 1; W._belT = 1.8 + Math.random() * 2.4; const ute = W._belN % 2 === 1, q = ute ? R.P.brunkeberg : p, x = q.x + (Math.random() - 0.5) * 1.6, z = q.z + (ute ? 0.5 : -0.9); Fx.krut(x, Geo.groundAt(x, z) + (ute ? 0.3 : 1.2), z); if (!ute && V.Ljud) V.Ljud.spela('kanon'); }
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
