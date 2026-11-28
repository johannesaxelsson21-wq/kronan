// Början på ett helt nytt spel: först en kort berättelse om vad som har hänt före 1512, sedan titelskärmen Kronan.
// Johannes 2026-11-28: "kan du göra den som en intro för vad som hänt istället, så man får en liten början så man förstår lite mer
// än det som förklaras när spelet startar?" (i stället för trailern). Tidigare: "Kronan kan vara huvudnamnet, och Sveriges regenter undernamnet."
// Fyra lugna scener i spelets egen värld, var och en i sitt år och i presens: unionen, Engelbrekt, Brunkeberg och läget vintern 1512.
// Inget om det som händer i spelet (Sten Sture säger själv "Min far är död" när spelet börjar). Ett tryck visar nästa rad, och berättelsen
// går att hoppa över (knappen eller Esc). Raderna bygger på (källorna syns inte i spelet):
//  Kalmar 1397: Erik av Pommern kröns 17 juni 1397 i Kalmar till kung över Danmark, Norge och Sverige; unionen kommer till genom drottning
//    Margareta (en.wikipedia Kalmar Union och Eric of Pomerania).
//  Dalarna 1434: upproret har sin mitt i Dalarna och Bergslagen och leds av Engelbrekt Engelbrektsson; dalkarlarna reser sig 1434; orsaken är de danska fogdarnas
//    övergrepp och de tunga skatterna; sommaren 1434 bränns Borganäs (en.wikipedia Engelbrekt rebellion och Engelbrekt Engelbrektsson;
//    sv.wikipedia Jösse Eriksson: fogden i Västerås är dansk till börden). Unionens huvudstad är i praktiken Köpenhamn (en.wikipedia Kalmar Union).
//  Brunkeberg 1471: Sten Sture den äldre är riksföreståndare från 1470; Kristian I av Danmark kommer för att störta honom och förlorar
//    10 oktober 1471 vid Brunkebergsåsen, en ås strax norr om Stockholm; handbössor nämns (en.wikipedia Battle of Brunkeberg, Sten Sture the Elder).
//  Stockholm 1512: Svante Nilsson är riksföreståndare 1504 till 2 januari 1512, då han dör; i början av 1512 är det krig med kung Hans av Danmark,
//    som var Sveriges kung 1497–1501 (en.wikipedia Svante Nilsson, John King of Denmark, Dano-Swedish War 1512–1520). Sten "inte ens tjugo år" som i data.js.
(function () {
  'use strict';
  const V = window.VASA, Scene = V.Scene, Geo = V.Geo, R = V.Rike, B = V.Bygge, Folk = V.Folk, Fx = V.Fx, U = V.U, World = V.World, lin = V.hexToLin;
  const RAD = Math.PI / 180, mix = (a, b, f) => a + (b - a) * f, mjuk = t => t * t * (3 - 2 * t), q = new URLSearchParams(location.search);
  let E = null, sasong0 = 0.025, kam = null, fas = 'av', tid = 0, klarFn = null, nr = -1, scen = null, kT = 0, rad = 0, radT = 0, temp = [], tempM = [], hj = {}, spar = null, menyT = 0, svep = null, ut = 0;

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
    if (fas !== 'av') { if (V.Gustav.g) V.Gustav.g.visible = false; if (V.Bud.g) V.Bud.g.visible = false; }          // kartans hjälte och bud hör inte hemma i berättelsen
  };
  // Gläntorna i berättelsen: scenens egna kapslar går först (World.fri tar bara FRI_N stycken)
  const fri0 = World.fri;
  World.fri = function (lista) { const k = fas === 'film' && T._kaps; return fri0.call(this, k ? k.concat(lista).slice(0, World.FRI_N) : lista); };
  // Före 1512 vet spelet inte säkert vem som höll orterna, så där syns inga flaggor (Johannes: hellre ingen flagga än en gissning)
  const flagga0 = B.flagga; let dolda = [];
  if (flagga0) B.flagga = function () { const m = flagga0.apply(this, arguments); if (m) m.userData.flagga = 1; return m; };
  function flaggor(syns) {
    if (syns) { dolda.forEach(o => { o.visible = true; }); dolda = []; return; }
    Scene.scene.traverse(o => { if (o.userData && o.userData.flagga && o.visible) { o.visible = false; dolda.push(o); } });
  }

  // ---- ljuset och himlen ---------------------------------------------------------------------------------
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

  // ---- sådant som byggs för en scen och rivs efteråt ----------------------------------------------------
  const folk = (x, z, slag, o) => { const u = Folk.add(x, z, slag, o); temp.push(u); return u; };
  function hjalte(sort, titel) { let h = hj[sort]; if (!h) { h = hj[sort] = Object.create(V.Gustav); h.init(Scene.scene, sort); h.utanRing = true; } h.klad(titel || 'Riddare'); h.g.visible = true; h.spar = []; return h; }
  function rensa() {
    temp.forEach(u => Folk.remove(u)); temp = []; tempM.forEach(m => Scene.scene.remove(m)); tempM = [];
    for (const k in hj) { hj[k].g.visible = false; hj[k].spar = []; hj[k].drawSpar(0); }
    flaggor(true); V.Varld.friExtra = null; T._fri = null; T._kaps = null;
  }
  // En ledig plats på öppen mark nära (x, z): inte i vatten och inte i ett hus
  function torr(x, z, t) { for (let r = 0; r < 4; r += 0.2) for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (Geo.sdAt(px, pz) > 0.4 && !(t && V.Filmstad.iHus(t, px, pz, 0.12))) return [px, pz]; } return [x, z]; }
  const grader = a => a / RAD, vant = (x, z, mx, mz) => Math.atan2(mx - x, mz - z);

  // ---- scenerna ------------------------------------------------------------------------------------------
  // Varje scen bygger det som syns och ger kam(f) (kameran, f = 0..1 genom scenen) och steg(dt, f) (det som rör sig).
  // rader visas en i taget; var och en står kvar tills man trycker, eller så länge det tar att läsa den.
  const SCENER = [
    { plats: 'Kalmar · juni 1397', sasong: 0.47, el: 24, varm: 0.3, utanFlagg: true,
      rader: ['I Kalmar kröns Erik av Pommern till kung över tre riken: Danmark, Norge och Sverige.', 'Drottning Margareta har fört samman dem i en union.'],
      bygg() {
        // folket i Kalmar samlas utanför kyrkan, där kröningen är
        const p = R.P.kalmar, K = B.K, st = V.Varld.tomt.kalmar, S = V.Filmstad.stad('kalmar'), T0 = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T0.x * K, cz = p.z + T0.z * K;
        const mal = S && S.dom ? S.dom : (S && S.t && S.t.b && S.t.b.kyrka ? [p.x - 0.6 * K, p.z - 1.8 * K] : [cx, cz - 1.2]);
        const slag = ['borgare', 'kvinna', 'bonde', 'borgare', 'kvinna'];
        for (let i = 0; i < 22; i++) { const a = i * 2.39996, r = 0.35 + Math.sqrt(i) * 0.3, q0 = torr(cx + Math.cos(a) * r, cz + Math.sin(a) * r * 0.8, st); folk(q0[0], q0[1], slag[i % 5], { ang: vant(q0[0], q0[1], mal[0], mal[1]) }); }
        return { kam(f) { return { x: mix(cx, mal[0], 0.2), z: mix(cz, mal[1], 0.2), d: mix(15, 11, mjuk(f)), p: mix(34, 28, f), y: mix(168, 138, f), h: 0.3 }; } };
      } },
    { plats: 'Dalarna · sommaren 1434', sasong: 0.53, el: 22, varm: 0.3, utanFlagg: true, glanta: 1,
      rader: ['Unionens kung styr från Danmark. Hans danska fogdar är hårda mot folket, och skatterna är tunga.', 'I Dalarna och Bergslagen reser sig folket, med Engelbrekt Engelbrektsson i spetsen.'],
      bygg() {
        // folket tågar längs vägen från Kopparberget
        const l = R.path('kopparberget', 'hedemora'), L0 = R.length(l), n = 18, tag = [];
        for (let i = 0; i < n; i++) tag.push(folk(0, 0, i % 4 === 3 ? 'borgare' : 'bonde', { pike: i % 3 !== 2, gar: true }));          // ingen bild av Engelbrekt själv: han finns bara i raden
        let d = L0 * 0.32;
        const satt = () => { tag.forEach((u, i) => { const b = R.along(l, Math.max(0, d - 0.55 - Math.floor(i / 2) * 0.42)), s = (i % 2 ? 1 : -1) * 0.2; u.x = b.x + Math.cos(b.ang) * s; u.z = b.z - Math.sin(b.ang) * s; u.ang = b.ang; }); };
        return { steg(dt) { d = Math.min(L0, d + dt * 0.38); satt(); const a = R.along(l, d), b = R.along(l, Math.max(0, d - 5)); T._fri = [[a.x, a.z, b.x, b.z, -2.4]]; },
          kam(f) { const a = R.along(l, Math.max(0, d - 2.2)); return { x: a.x, z: a.z, d: mix(9, 7.5, f), p: mix(16, 13, f), y: grader(a.ang) + mix(-62, -78, f), h: 0.35 }; } };
      } },
    { plats: 'Brunkeberg · oktober 1471', sasong: 0.76, el: 14, varm: 0.45, utanFlagg: true, glanta: 1,
      rader: ['Riksföreståndaren Sten Sture den äldre styr Sverige. Danmarks kung Kristian I kommer med en här för att störta honom.', 'Vid Brunkeberg, strax norr om Stockholm, vinner Sten Sture.'],
      bygg() {
        // Kristians här på åsen norr om staden, Sten Stures här söderifrån (bara på öppen mark, ingen i ett hus)
        const p = R.P.stockholm, st = V.Varld.tomt.stockholm, mx = p.x + 2.8, mz = p.z - 11.4, D = [], Sv = [], ga = (u, dz) => { if (!(st && V.Filmstad.iHus(st, u.x, u.z + dz, 0.12)) && Geo.sdAt(u.x, u.z + dz) > 0.4) u.z += dz; };
        for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
          const qa = torr(mx + (i - 4) * 0.42, mz - 1.6 - r * 0.42, st); D.push(folk(qa[0], qa[1], 'dansk', { pike: (i + r) % 3 !== 1, ang: 0, gar: true }));
          const qb = torr(mx + (i - 4) * 0.42 + 0.2, mz + 1.6 + r * 0.42, st); Sv.push(folk(qb[0], qb[1], (i + r) % 3 === 2 ? 'bonde' : 'knekt', { pike: (i + r) % 3 !== 1, ang: Math.PI, gar: true }));
        }
        let krut = 0.6;
        T._fri = [[mx - 4.4, mz, mx + 4.4, mz, -4.6]];
        return { steg(dt, f) {
            Sv.forEach(u => ga(u, -dt * 0.42)); D.forEach(u => ga(u, dt * 0.12));
            krut -= dt; if (krut <= 0) { krut = 0.5 + Math.random() * 0.5; const L = Math.random() < 0.5 ? D : Sv, u = L[Math.floor(Math.random() * L.length)]; if (u) Fx.krut(u.x, Geo.groundAt(u.x, u.z) + 0.45, u.z); }          // handbössor
          },
          kam(f) { return { x: mx, z: mz + 0.6, d: mix(13, 10.5, mjuk(f)), p: mix(16, 12, f), y: mix(104, 82, f), h: 0.5 }; } };
      } },
    { plats: 'Stockholm · januari 1512', sasong: null, el: 12, varm: 0.45,
      rader: ['Sverige har ingen kung. Riksföreståndaren Svante Nilsson har styrt riket sedan 1504, och nu är han död.', 'Det är krig med kung Hans av Danmark, som en gång var Sveriges kung. Svantes son Sten är inte ens tjugo år.'],
      bygg() {
        // Sten i snön i Stockholm, där spelet börjar
        const st = V.Varld.tomt.stockholm, h0 = V.Varld.pos(V.DATA.VARLDAR[0].hem), q0 = torr(h0.x, h0.z + 0.5, st), s = hjalte('sten', 'Riddare');
        const a0 = -20 * RAD;          // han ser mot kameran, med solen på sig
        return { steg(dt) { s.place(q0[0], q0[1], a0, 0, tid, dt, false, true); T._liv(dt); },
          kam(f) { const e = mjuk(f); return { x: q0[0], z: q0[1], d: mix(28, 8, e), p: mix(38, 30, e), y: mix(12, -20, f), h: mix(0, 0.55, e) }; } };
      } }
  ];
  const lasTid = t => Math.max(5, 2 + t.length * 0.055);          // så länge en rad står kvar utan tryck

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
    r.innerHTML = '<div class="t-moln"></div><div class="t-vinj"></div><div class="t-svart"></div><div class="t-rand upp"></div><div class="t-rand ner"></div>' +
      '<div class="t-text"><div class="t-plats"></div><div class="t-rad"></div></div>' +
      '<div class="t-logo"><div class="t-krona">' + KRONA + '</div><h1>Kronan</h1><div class="t-orn"><i></i><b>✦</b><i></i></div><div class="t-under">Sveriges regenter</div></div>' +
      '<button class="t-borja">Börja</button><button class="t-hoppa">Hoppa över ▸▸</button>' +
      '<div class="t-port"><div class="t-krona liten">' + KRONA + '</div><div class="t-tryck">Tryck för att börja</div></div>';
    document.body.appendChild(r);
    const $ = s => r.querySelector(s);
    E = { r, plats: $('.t-plats'), rad: $('.t-rad'), svart: $('.t-svart'), logo: $('.t-logo'), borja: $('.t-borja'), hoppa: $('.t-hoppa'), port: $('.t-port') };
    E.borja.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); T.borja(); });
    E.hoppa.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); T.hoppa(); });
    E.port.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); T._starta(); });
    r.addEventListener('pointerdown', ev => { if (fas === 'film') { ev.preventDefault(); T.vidare(); } });          // ett tryck var som helst: nästa rad
    return E;
  }
  const svart = (a, sek) => { E.svart.style.transition = 'opacity ' + sek + 's'; E.svart.style.opacity = a; };
  const visa = (e, on) => e.classList.toggle('syns', !!on);
  function tangent(ev) {
    if (fas === 'av') return;
    const k = ev.code; if (!(k === 'Space' || k === 'Enter' || k === 'Escape' || k === 'NumpadEnter')) return;
    ev.preventDefault(); ev.stopImmediatePropagation(); if (ev.repeat) return;
    if (fas === 'port') T._starta(); else if (fas === 'film') { if (k === 'Escape') T.hoppa(); else T.vidare(); } else if (fas === 'meny' && k !== 'Escape') T.borja();
  }

  // ---- berättelsens gång ---------------------------------------------------------------------------------
  function nastaScen() {
    rensa(); nr++; const s = SCENER[nr]; if (!s) { slutFilm(); return; }
    ljus(s.sasong === null ? sasong0 : s.sasong, s.el, s.varm); Fx.sno = true; scen = s.bygg(); kT = 0; rad = 0; radT = 0; ut = 0;
    if (s.utanFlagg) flaggor(false);
    if (scen.steg) scen.steg(0.016, 0); kam = scen.kam(0);
    svart(0, 1.1); visa(E.plats, false); visa(E.rad, false);
    setTimeout(() => { if (SCENER[nr] === s && fas === 'film') { E.plats.textContent = s.plats; visa(E.plats, true); } }, 600);
    setTimeout(() => { if (SCENER[nr] === s && fas === 'film' && rad === 0) { E.rad.textContent = s.rader[0]; visa(E.rad, true); radT = 0; } }, 1300);
  }
  // nästa rad, eller ut ur scenen efter den sista
  function nastaRad() {
    const s = SCENER[nr]; if (!s || ut) return;
    if (rad < s.rader.length - 1) { rad++; radT = 0; visa(E.rad, false); const r0 = rad; setTimeout(() => { if (SCENER[nr] === s && fas === 'film' && rad === r0) { E.rad.textContent = s.rader[r0]; visa(E.rad, true); } }, 380); return; }
    ut = 1; visa(E.plats, false); visa(E.rad, false); svart(1, 0.9); setTimeout(() => { if (SCENER[nr] === s && fas === 'film') nastaScen(); }, 1000);
  }
  function slutFilm() { rensa(); kam = null; fas = 'paus'; svart(1, 0); setTimeout(() => menyn(false), 500); }
  // Titelskärmen: Stockholm vintern 1512, där spelet börjar. Kameran glider sakta runt staden.
  function titelKam(t) { const p = R.P.stockholm; return { x: p.x + 0.6, z: p.z - 0.4, d: 40 - Math.min(6, t * 0.12), p: 17, y: 146 - t * 0.6, h: 0 }; }
  function menyn(snabbt) {
    rensa(); fas = 'meny'; menyT = 0; nr = SCENER.length; ljus(sasong0, 12, 0.45); Fx.sno = true; kam = titelKam(0);
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
      if (V.Musik) { V.Musik.satt(musikPa()); V.Musik.spar('titel'); } V.Ljud.vakna();
      E.r.classList.add('film'); visa(E.hoppa, true); svart(1, 0); tid = 0; nr = -1; setTimeout(() => { if (fas === 'film') nastaScen(); }, 900);
    },
    vidare() { if (fas === 'film' && scen && E.rad.classList.contains('syns')) nastaRad(); },          // bara när raden syns: ingen rad hoppas över
    hoppa() {
      if (fas !== 'film') return; fas = 'paus'; svart(1, 0.3); visa(E.plats, false); visa(E.rad, false); visa(E.hoppa, false);
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
      if (fas === 'film' && scen) {
        const s = SCENER[nr], tot = s.rader.reduce((a, r) => a + lasTid(r), 1.3); kT += dt; radT += dt; const f = Math.min(1, kT / tot);
        if (scen.steg) scen.steg(dt, f); kam = scen.kam(f); if (T._over) kam = Object.assign(kam, T._over);
        // gläntor i skogen: kring dem som rör sig, och en bred gata från det kameran tittar på ända fram till kameran (krymp-kapslar, se world.js)
        const fl = (T._fri || []).slice(0, 8).map(g => g.length === 5 ? g : [g[0], g[1], g[0], g[1], -g[2]]);
        if (s.glanta) { const dd = kam.d * (Scene.cam.k || 1) * Math.cos(kam.p * RAD), cx = kam.x + dd * Math.sin(kam.y * RAD), cz = kam.z + dd * Math.cos(kam.y * RAD), r = Math.max(2.4, kam.d * (Scene.cam.k || 1) * 0.42);
          fl.push([kam.x, kam.z, cx, cz, -r], [mix(kam.x, cx, 0.7), mix(kam.z, cz, 0.7), cx, cz, -r * 1.6]); }
        T._kaps = fl.length ? fl : null;
        if (!ut && kT > 1.3 && radT > lasTid(s.rader[rad])) nastaRad();          // raden har stått länge nog
      }
      if (fas === 'meny') { menyT += dt; kam = titelKam(menyT); T._liv(dt); }
      if (fas === 'svep' && svep) {
        svep.t += dt; const e = mjuk(Math.min(1, svep.t / svep.dur)), a = svep.fran, b = svep.mal; let dy = b.y - a.y; while (dy > 180) dy -= 360; while (dy < -180) dy += 360;
        kam = { x: mix(a.x, b.x, e), z: mix(a.z, b.z, e), d: Math.exp(mix(Math.log(a.d), Math.log(b.d), e)), p: mix(a.p, b.p, e), y: a.y + dy * e, h: mix(a.h || 0, 0, e) };
        ljus(svep.s0, mix(12, 90, e), 0.45 * (1 - e)); T._liv(dt);
        if (svep.t >= svep.dur) T._klar();
      }
    },
    // livet i staden: folk som går och rök ur skorstenarna
    _liv(dt) {
      if (V.Varld._folk) { try { V.Varld._folk(dt, tid); } catch (e) { /* bara utsmyckning */ } }
      T._rokT = (T._rokT || 0) + dt; if (T._rokT > 0.25) { T._rokT = 0; const c = Scene.cam; for (const s of B.smoke) { if (Math.abs(s.x - c.x) > c.d * 1.2 + 10 || Math.abs(s.z - c.z) > c.d + 10 || s.slag === 'eld' || Math.random() < 0.4) continue; Fx.rok(s.x, s.y, s.z, false); } }
    },
    _klar() {
      fas = 'av'; svep = null; kam = null; rensa(); himmel(false); Scene.cam.fri = spar ? spar.fri : false; V.Varld.scenDolj(false);
      window.removeEventListener('keydown', tangent, true); if (E) { E.r.remove(); E = null; }
      const k = klarFn; klarFn = null; if (k) k();
    },
    // för prov och skärmbilder: V.Titel.prov(2, 3) visar scen 2 efter 3 sekunder
    prov(i, sek) { sida(); fas = 'film'; E.port.style.display = 'none'; E.r.classList.add('film'); V.UI.visa(false); himmel(true); nr = i - 1; nastaScen(); svart(0, 0); for (let s = 0; s < sek; s += 0.05) T.update(0.05); }
  };
  function ljudFritt() {
    const a = V.Ljud && V.Ljud.ac; if (a) return a.state === 'running';
    try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return true; const x = new C(), ok = x.state === 'running'; x.close(); return ok; } catch (e) { return true; }
  }
  // spelets ruta för bild körs varje bildruta medan titeln visas (main.js anropar Intro.update när spelet inte är igång)
  if (V.Intro) { const u0 = V.Intro.update; V.Intro.update = function (dt, t) { T.update(dt); return u0.call(V.Intro, dt, t); }; }
})();
