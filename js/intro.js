// Introt: flykten från Räfsnäs till Dalarna och skidfärden mot Norge.
// En kort film som inte går att hoppa över. Spelaren får trycka, men kan inte stoppa det som sker.
// Varje rad bygger på docs/historia.md.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, R = V.Rike, Scene = V.Scene, Fx = V.Fx, Folk = V.Folk, B = V.Bygge;
  let UI, L, waits = [], hooks = [], temp = [], tempM = [], regn = false, aka = null, tid = 0;
  const vanta = s => new Promise(r => waits.push({ t: s, r }));
  const text = t => UI.film.text(t), plats = t => UI.film.plats(t);
  function gubbar(n, cx, cz, slag, rad) { const list = []; for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, d = 0.5 + Math.random() * (rad || 2); const u = Folk.add(cx + Math.cos(a) * d, cz + Math.sin(a) * d * 0.8, slag); list.push(u); temp.push(u); } return list; }
  let skyltar = [], stader = [];          // stader: städer byggda för en scen (filmstad.js), rivs i rensa()
  function rensa() { stader.forEach(s => s.bort()); stader = []; temp.forEach(u => Folk.remove(u)); temp = []; tempM.forEach(m => Scene.scene.remove(m)); tempM = []; skyltar.forEach(s => s.e.remove()); skyltar = []; }
  // En namnskylt över någon i en scen, så att man ser vem det är. var_() ger platsen ({ x, z }) varje bildruta, h är höjden över marken.
  function skylt(t, var_, h) {
    const e = document.createElement('div'), film = document.getElementById('film'); e.className = 'filmnamn'; e.textContent = t; e.style.display = 'none'; film.insertBefore(e, document.getElementById('film-svart'));
    const s = { e, var_, h: h || 1.6, bort() { e.remove(); skyltar = skyltar.filter(q => q !== s); } }; skyltar.push(s); return s;
  }

  // Släden som Sten Sture kördes hem i, februari 1520
  function slade() {
    const mb = new V.MB(); mb.snow = 0;
    for (const s of [-1, 1]) { mb.box(s * 0.17, 0, 0, 0.035, 0.04, 1.05, '#5d4a38'); mb.push().move(s * 0.17, 0.02, 0.55).rotX(-0.6); mb.box(0, 0, 0, 0.035, 0.04, 0.2, '#5d4a38'); mb.pop(); mb.box(s * 0.15, 0.3, 0.72, 0.022, 0.022, 0.66, '#5d4a38'); }      // medar och skaklar
    mb.box(0, 0.09, -0.03, 0.44, 0.05, 0.9, '#8a6a44', { low: '#6b5030' }); mb.box(0, 0.14, -0.46, 0.44, 0.24, 0.05, '#8a6a44', { low: '#6b5030' });                    // flak och ryggstöd
    mb.box(0, 0.14, 0.03, 0.36, 0.12, 0.7, '#2f4f8a', { low: '#223c6c' });                                                                                       // den sårade under sin blå mantel
    mb.blob(0, 0.31, -0.3, 0.085, 0.085, 0.085, '#e2b48e', { snow: 0 }); mb.blob(0, 0.34, -0.34, 0.09, 0.07, 0.075, '#6a4a2a', { snow: 0 });
    return B.mesh(mb);
  }
  // Spelaren trycker, och den som scenen handlar om rör sig. Löfte som blir klart när den är framme.
  // o.satt(a, v, t, dt) flyttar något annat än hjälten (ett skepp, en släde, en man till fots). o.kd = kamerans avstånd.
  function akFard(pts, d0, d1, fartX, knapp, rad, o) {
    return new Promise(res => {
      o = o || {}; aka = { pts, d: d0, d0, d1, v: 0, fartX: fartX || 1, res, stilla: 0, rad: rad || 'Tryck för att åka', satt: o.satt, kd: o.kd || 19, sikt: o.sikt || null, ljud: o.ljud, ork: 1, rader: o.rader || null, radNr: 0, radT: 0 };
      UI.film.text(aka.rad); UI.film.knapp(knapp || 'Åk', () => I.tar && I.tar());
      I.tar = () => { if (!aka) return; aka.v = Math.min(3.4, aka.v + 0.8 * aka.ork); aka.stilla = 0; L.spela(aka.ljud || (V.Gustav.sno === false ? 'hov' : 'skida')); };
    });
  }
  const MELLAN = 100;          // så många sekunders spelande måste det gå mellan två scener (120 fram till 2026-11-26, sänkt när produktionen höjdes och stegen kom tätare)
  let autoT = 0, GE = null;
  // Gustav Eriksson som han ser ut i sin egen värld, till fots. I förspelet är hjälten Sten Sture, så scenerna om Gustav har en egen figur.
  // Erik XIV i sina scener: först i hertigens dräkt, sedan krönt
  let EE = null;
  function erikE(kung) { if (!EE) { EE = Object.create(V.Gustav); EE.init(Scene.scene, 'erik'); } EE.klad(kung ? 'Kung' : 'Hertig'); EE.g.visible = true; EE.utanRing = false; return EE; }
  // Johan III i sina scener, krönt
  let JE = null;
  function johanE() { if (!JE) { JE = Object.create(V.Gustav); JE.init(Scene.scene, 'johan'); } JE.klad('Kung'); JE.g.visible = true; JE.utanRing = false; return JE; }
  // Hertig Karl i scenerna (samma dräkt som på kartan)
  let KE = null;
  function karlE(kung) { if (!KE) { KE = Object.create(V.Gustav); KE.init(Scene.scene, 'karl'); } KE.klad(kung ? 'Kung' : 'Hertig'); KE.g.visible = true; KE.utanRing = false; return KE; }
  // Sigismund i sina scener, krönt
  let SE = null;
  function sigE() { if (!SE) { SE = Object.create(V.Gustav); SE.init(Scene.scene, 'sigismund'); } SE.klad('Kung'); SE.g.visible = true; SE.utanRing = false; return SE; }
  // En öppen plats mitt i en ort (torget, eller den största fria ytan nära mitten), för scener i orter som inte har en egen stadsplan.
  // T.S är ortens rutnät från gator.js (allt som är ritat där), så att ingen ställs i ett hus.
  function torgVid(id) {
    const p = R.P[id], t = V.Varld.tomt && V.Varld.tomt[id], S = V.Gator && V.Gator.ort(id);
    let x = p.x, z = p.z; if (t && t._plan) { x = p.x + t._plan.torg.x * B.K; z = p.z + t._plan.torg.z * B.K; }
    if (S) { const { n, x0, z0, dist } = S.g, C = V.Filmstad.sok.C; let bv = -1e9; for (let j = 0; j < n; j += 2) for (let i = 0; i < n; i += 2) { const qx = x0 + (i + 0.5) * C, qz = z0 + (j + 0.5) * C, d = Math.hypot(qx - x, qz - z); if (d > 3.5) continue; const v = Math.min(dist[j * n + i], 14) - d * 2.2; if (v > bv) { bv = v; p._t = [qx, qz]; } } if (p._t) { x = p._t[0]; z = p._t[1]; } }
    return { x, z, S };
  }
  // Kartans hjälte och bud hör inte hemma i scenen (de står ofta just där scenen spelas). Ger en funktion som tar tillbaka dem.
  function utanHjalte() { const H = V.Gustav, Bu = V.Bud, h = H.g && H.g.visible, b = Bu.g && Bu.g.visible, d = () => { if (H.g) H.g.visible = false; if (Bu.g) Bu.g.visible = false; }; d(); hooks.push(d); return () => { hooks = hooks.filter(q => q !== d); if (H.g) H.g.visible = h; if (Bu.g) Bu.g.visible = b; }; }
  function fritt(T, x, z) { return !T.S || V.Filmstad.sok.ledig(T.S, x, z); }
  function gustavE() { if (!GE) { GE = Object.create(V.Gustav); GE.init(Scene.scene, 'gustav'); } GE.g.visible = true; GE.utanRing = false; return GE; }
  // Spelaren trycker n gånger på knappen (eller väntar ut tiden). vid(k) körs för varje tryck. Löfte som blir klart när det är gjort.
  function tryckN(knapp, n, vid, sek) {
    return new Promise(res => {
      let k = 0, klar = false; const slut = () => { if (klar) return; klar = true; UI.film.knapp(null); I.tar = null; res(k); };
      const b = UI.film.knapp(knapp, () => I.tar && I.tar()), pips = n > 1 && b ? document.createElement('span') : null;          // prickar under knappen: hur många tryck som är kvar
      if (pips) { pips.className = 'knapp-pips'; pips.innerHTML = '<i></i>'.repeat(n); b.appendChild(pips); }
      I.tar = () => { if (klar) return; k++; vid(k); if (pips && pips.children[k - 1]) pips.children[k - 1].classList.add('full'); if (k >= n) slut(); }; vanta(sek || 20).then(slut);
    });
  }
  // Hoppa över: en diskret knapp i hörnet medan en film går (Johannes 2026-11-28). Filmen spolas fram bakom svart, så att spelet
  // hamnar i samma läge som om den hade spelats klart.
  let hoppEl = null;
  function hoppKnapp() {
    const syns = (I.aktiv || I.ifilm) && !I.hoppar;
    if (!hoppEl) { if (!syns) return; const film = document.getElementById('film'); if (!film) return; hoppEl = document.createElement('button'); hoppEl.className = 'hoppa'; hoppEl.textContent = 'Hoppa över ▸▸';
      hoppEl.style.cssText = 'position:absolute;right:18px;top:calc(env(safe-area-inset-top,0px) + 14px);z-index:60;padding:6px 14px;font:14px Georgia,serif;color:#f6ecd6;background:rgba(30,20,12,.55);border:1px solid rgba(232,192,64,.55);border-radius:16px;cursor:pointer;pointer-events:auto;opacity:.75';
      hoppEl.addEventListener('pointerdown', ev => { ev.stopPropagation(); ev.preventDefault(); I.hoppa(); }); film.appendChild(hoppEl); }
    const d = syns ? '' : 'none'; if (hoppEl.style.display !== d) hoppEl.style.display = d;
  }
  const I = V.Intro = {
    ifilm: false, hoppar: false,
    hoppa() {
      if (I.hoppar || !(I.aktiv || I.ifilm)) return; I.hoppar = true; const f = UI.film; f.svart(1, 0.3); f.text(''); f.plats(''); f.knapp(null); hoppKnapp();
      I._hf = { svart: f.svart, text: f.text, plats: f.plats, knapp: f.knapp, tal: f.tal }; f.svart = () => {}; f.text = () => {}; f.plats = () => {}; f.knapp = () => {}; if (f.tal) f.tal = () => {};          // allt som syns står still bakom det svarta
    },
    _slapp() { if (!I._hf) return; Object.assign(UI.film, I._hf); I._hf = null; UI.film.tal && UI.film.tal(null); },
    tar: null, fart: +new URLSearchParams(location.search).get('introfart') || 1,          // ?introfart=4 spolar filmen (för prov)
    // Ett helt nytt spel börjar med trailern och titelskärmen Kronan (js/titel.js). Sedan börjar förspelet direkt.
    titel(klar) { UI = V.UI; L = V.Ljud; V.Titel.kor(klar); },
    // Gustavs värld börjar med flykten från Räfsnäs (blodbadet sägs med en rad där).
    kor(klar) {
      UI = V.UI; L = V.Ljud; Scene.cam.locked = true; UI.visa(false); UI.film.svart(1, 0);
      const sth = R.P.stockholm; Scene.setSeason(0.835); Scene.jump(sth.x - 8, sth.z + 9, 120); Fx.sno = false;
      UI.film.text('<span class="under">November 1520</span>'); document.getElementById('film-text').classList.add('mitt');
      UI.film.knapp('Fortsätt', () => { UI.film.knapp(null); document.getElementById('film-text').classList.remove('mitt'); text(''); I.film(klar).catch(e => { console.error(e); I.slut(klar); }); });
    },
    async film(klar) {
      I.ifilm = true;
      const K = B.K;
      // Johannes 2026-11-28: världen börjar med flykten från Räfsnäs, så att man inte ser hela blodbadet igen. Budet om det kommer på Räfsnäs.
      UI.film.pa(true); if (V.Musik) V.Musik.spar('blodbadet');
      // ---- Räfsnäs ----
      hooks = []; rensa(); regn = false; const raf = R.P.rafsnas; Scene.setSeason(0.87); Scene.jump(raf.x, raf.z + 1.5, 20);
      V.Gustav.place(raf.x, raf.z, 2.2, 0, 0, 1, false); V.Gustav.g.visible = true; Scene.flyTo(raf.x, raf.z + 1, 13, 14);
      // Filmen fortsätter där förspelet slutade: han kom hem över havet i maj. Den berättar inte om gisslan och Lübeck en gång till.
      UI.film.svart(0.2, 2.5); plats('Räfsnäs vid Mälaren, november 1520'); await vanta(2.2); text('Gustav Eriksson kom hem över havet i maj. Nu är han på sin fars gård Räfsnäs.');
      await vanta(7); text('Hit når budet från Stockholm: kungen har låtit avrätta åttiotvå människor. Hans far är en av de döda, och kungens män letar efter honom.');
      await vanta(7.5);
      // Flykten är det första spelaren gör själv i Gustavs värld: till häst från Räfsnäs, sedan på skidor genom Dalarna till Sälen.
      // Två stopp på vägen där något händer (Rankhyttan och Isala), talet i Mora, och skidlöparna vid Sälen (Johannes 2026-11-26).
      // Det som hände på vägen är sägen (docs/historia.md). Filmen säger det en gång, i början av åket.
      const p0 = R.path('rafsnas', 'strangnas'), len0 = R.length(p0);
      await akFard(p0, 0.2, Math.min(len0 - 1, 9), 1.3, 'Fly', 'Tryck för att fly', { rader: [[5, null, 'Han flyr norrut, till Dalarna.']] });
      UI.film.knapp(null); I.tar = null; UI.film.svart(1, 1.0); await vanta(1.2); text(''); plats('');
      Scene.setSeason(0.965); Fx.sno = true; if (V.Musik) V.Musik.spar('vinter'); L.vindstyrka(0.11);
      const mora = R.P.mora, ratt = R.P.rattvik, fz = mora.z + 0.5 * K, rank = Geo.place(15.75, 60.45), isala = Geo.place(15.87, 60.71), Wv = V.Varld;
      const nara = (q, c, r) => Math.hypot(q[0] - c.x, q[1] - c.z) < r, gard = p => { const mb = new V.MB(); B.stuga(mb, 0.95, 0.62, 0.34, 'torv', { skorsten: 1, ljus: 1 }); mb.push().move(1.35, 0, 0.5).rotY(0.6); B.stuga(mb, 1.15, 0.7, 0.4, 'span', {}); mb.pop(); const m = B.mesh(mb), x = p.x + 1.1, z = p.z - 1.0; m.position.set(x, Geo.groundAt(x, z), z); m.scale.setScalar(K); Scene.scene.add(m); tempM.push(m); };
      gard(rank); gard(isala); const salen = R.P.salen; gard(salen); gard({ x: salen.x - 2.6, z: salen.z + 1.4 });          // byn Sälen
      const start = [rank.x + 5, rank.z + 22], talplats = [mora.x - 0.4, mora.z + 3.4];
      const ben1 = Wv._runt([start, [rank.x, rank.z + 0.9]], null, null, true), ben2 = Wv._runt([[rank.x, rank.z + 0.9], [isala.x, isala.z + 0.9]], null, null, true);
      const ben3 = Wv._runt([[isala.x, isala.z + 0.9], [ratt.x + 0.3, ratt.z + 3.0]].concat(R.path('rattvik', 'mora').filter(q => !nara(q, mora, 3.6) && !nara(q, ratt, 3.2)), [talplats]), null, null, true);
      const ben4 = Wv._runt([talplats].concat(R.path('mora', 'salen').filter(q => !nara(q, mora, 3.6))), null, null, true), L4 = R.length(ben4);
      const stanna = (ben) => { const a = R.along(ben, R.length(ben)); hooks.push(dt => V.Gustav.place(a.x, a.z, a.ang, 0, tid, dt, false)); return a; };
      const a0 = R.along(ben1, 0); V.Gustav.place(a0.x, a0.z, a0.ang, 0, 0, 1, false); Scene.jump(a0.x, a0.z + 1.5, 19); UI.film.svart(0, 1.6);
      // första benet: till Rankhyttan, där han tar tjänst som dräng
      await akFard(ben1, 0, R.length(ben1), 1.05, 'Åk', 'Tryck för att åka', { rader: [[0.3, 'Dalarna, november 1520', 'På vägen måste han gömma sig och byta kläder.']] });
      UI.film.knapp(null); I.tar = null; let st = stanna(ben1); plats('Rankhyttan'); text('Han tar tjänst som dräng på en gård och tröskar säd.');
      await tryckN('Tröska', 4, () => { L.spela('trumma'); Fx.damm(rank.x + 1.1, Geo.groundAt(rank.x + 1.1, rank.z) + 0.1, rank.z - 0.2, 4); }, 12);
      text('Någon känner igen honom. Han måste vidare.'); await vanta(4.5); hooks = [];
      // andra benet: till Isala, där en bonde gömmer honom när kungens män kommer
      await akFard(ben2, 0, R.length(ben2), 1.05, 'Åk', 'Tryck för att åka');
      UI.film.knapp(null); I.tar = null; st = stanna(ben2); plats('Isala'); text('Kungens män kommer. En bonde gömmer honom i sin lada.');
      await tryckN('Göm dig', 1, () => { L.spela('port'); }, 10); hooks = []; V.Gustav.g.visible = false;
      { const ryttare = [0, 1, 2].map(k => { const u = Folk.add(st.x - 4.5 - k * 0.6, st.z + 1.6 + (k % 2) * 0.3, 'dansk', { pike: true, gar: true, ang: 1.571 }); temp.push(u); return u; });
        hooks.push(dt => ryttare.forEach(u => { u.x += dt * 1.5; })); text(''); await vanta(5.5); text('De går förbi.'); await vanta(2.5); hooks = []; ryttare.forEach(u => Folk.remove(u)); temp = temp.filter(u => ryttare.indexOf(u) < 0); }
      V.Gustav.g.visible = true;
      // tredje benet: till Mora, där han talar till männen
      const hopen = []; for (let k = 0; k < 18; k++) { const a = 0.5 + k / 18 * 2.2, d = 1.0 + (k % 3) * 0.42, u = Folk.add(mora.x + Math.cos(a) * d * 1.3, fz + 0.5 + Math.sin(a) * d * 0.6, 'bonde', { ang: 0 }); hopen.push(u); temp.push(u); }
      await akFard(ben3, 0, R.length(ben3), 1.05, 'Åk', 'Tryck för att åka', { rader: [[R.length(ben3) - 12, 'Mora, julen 1520', '']] });
      UI.film.knapp(null); I.tar = null; hooks.push(dt => V.Gustav.place(talplats[0], talplats[1], Math.PI, 0, tid, dt, false)); plats('Mora, julen 1520'); text('Han talar till männen i Mora.');
      await tryckN('Tala', 5, n => { L.spela('sorl'); hopen.forEach((u, i) => { if (i % 3 === n % 3) { u.y = 0.08; setTimeout(() => { u.y = 0; }, 160); } }); }, 16);
      L.spela('nej'); text('Männen tvekar. De vill inte ha ett uppror till.');
      hooks.push(dt => hopen.forEach((u, i) => { u.gar = true; u.ang = 2.2 + i * 0.12; u.x += Math.sin(u.ang) * 0.6 * dt; u.z += Math.cos(u.ang) * 0.6 * dt; }));
      await vanta(5.5); hooks = []; hopen.forEach(u => Folk.remove(u)); temp = temp.filter(u => hopen.indexOf(u) < 0);
      // sista benet: västerut mot Norge. Vid Sälen hinner två skidlöpare från Mora upp honom.
      const jag = [0, 1].map(k => { const u = Folk.add(talplats[0], talplats[1] - 400, 'bonde', { gar: true, skidar: true, lean: 0.25, col: k ? '#7a6a55' : '#6a5f52' }); temp.push(u); return { u, d: -1 }; });
      hooks.push(dt => { if (!aka || aka.d < L4 - 17) return; jag.forEach((j, k) => { if (j.d < 0) j.d = aka.d - 11 - k * 1.2; j.d = Math.min(L4 - 2.4 - k * 0.7, j.d + 4.4 * dt); const a = R.along(ben4, j.d); j.u.x = a.x + k * 0.3; j.u.z = a.z; j.u.ang = a.ang; }); });
      skylt('Sälen', () => ({ x: salen.x + 0.6, z: salen.z - 0.6 }), 1.5);          // byn syns med namn redan när han åker dit
      await akFard(ben4, 0, L4 - 1.5, 1.05, 'Åk', 'Tryck för att åka', { rader: [[0.5, '', 'Han ger upp och åker västerut, mot Norge.'], [L4 - 12, 'Sälen', 'Bakom honom kommer två skidlöpare från Mora.']] });
      UI.film.knapp(null); I.tar = null;
      await new Promise(res => hooks.push(dt => { let klara = 0; jag.forEach((j, k) => { const mal = L4 - 2.4 - k * 0.7; if (j.d < 0) j.d = L4 - 12 - k * 1.2; j.d = Math.min(mal, j.d + 6 * dt); const a = R.along(ben4, j.d); j.u.x = a.x + k * 0.3; j.u.z = a.z; j.u.ang = a.ang; if (j.d >= mal) { klara++; j.u.gar = false; j.u.lean = 0; } }); if (klara === 2) { hooks = []; res(); } }));
      { const ga = R.along(ben4, L4 - 1.5); hooks.push(dt => V.Gustav.place(ga.x, ga.z, ga.ang + Math.PI, 0, tid, dt, false)); Scene.flyTo(ga.x, ga.z + 1, 13, 2); }          // han vänder sig om mot dem
      skylt('Lars från Kättilbo', () => jag[0].u, 1.2); skylt('Engelbrekt från Morkarlby', () => jag[1].u, 1.75);          // namnen på olika höjd så att de inte ligger på varandra
      plats('Sälen, nyåret 1521'); text('I Sälen hinner skidlöpare från Mora upp honom. Det berättas att två av dem heter Lars och Engelbrekt.'); L.spela('klart'); await vanta(6.5);
      text('Budet om blodbadet har nått Dalarna. Mora har ändrat sig.'); await vanta(6.5);
      // färden tillbaka mot Mora: man åker själv, skidlöparna efter
      hooks = []; const tillbaka = ben4.slice().reverse(), LT = R.length(tillbaka);
      hooks.push(() => { if (!aka) return; jag.forEach((j, k) => { const a = R.along(tillbaka, Math.max(0, aka.d - 0.9 - k * 0.8)); j.u.x = a.x + k * 0.3; j.u.z = a.z; j.u.ang = a.ang; j.u.gar = aka.v > 0.05; j.u.lean = aka.v > 0.05 ? 0.25 : 0; }); });
      await akFard(tillbaka, 1.5, Math.min(LT - 4, 18), 1.05, 'Åk hem', 'Tryck för att åka tillbaka till Mora', { rader: [[3, '', 'Tillsammans åker de tillbaka till Mora.'], [11, '', 'Det är en lång väg genom skogen. Men nu har Mora sin hövitsman.']] });
      UI.film.knapp(null); I.tar = null; await vanta(2);
      UI.film.svart(1, 1.5); text(''); plats(''); await vanta(1.8);
      // ---- Mora, januari 1521 ----
      rensa(); Scene.setSeason(0.04); Scene.jump(mora.x, fz + 1.5, 24); V.Gustav.place(mora.x, fz - 1.3, 0, 0, 0, 1, false);
      const jubel = []; for (let k = 0; k < 24; k++) { const a = 0.3 + k / 24 * 2.6, d = 1.5 + (k % 4) * 0.45, u = Folk.add(mora.x + Math.cos(a) * d * 1.3, fz + 0.4 + Math.sin(a) * d * 0.7, 'bonde', { ang: Math.PI, pike: k % 3 === 0 }); jubel.push(u); temp.push(u); }
      hooks.push(() => jubel.forEach((u, i) => { u.y = Math.abs(Math.sin(tid * 7 + i)) * 0.09; }));
      UI.film.svart(0, 2); plats('Mora, januari 1521'); Scene.flyTo(mora.x, fz + 1, 17, 6); await vanta(1.5);
      text('Dalkarlarna väljer honom till sin ledare.'); L.spela('klart'); Fx.guld(mora.x, mora.y + 0.4, fz, 80, 2.5);
      await vanta(6.5); text(''); plats('');
      I.slut(klar);
    },
    // ---- små scener mitt i spelet -----------------------------------------------------------------
    // Spelet står still medan scenen går. Varje rad bygger på docs/historia.md.
    aktiv: false, scenFart: 1, spelade: 0,
    scener: {
      // Hösten 1518. Kristian kräver sex svenskar som säkerhet för en förhandling. När de är ombord seglar han hem med dem.
      async gisslan() {
        const sth = R.P.stockholm, hav = sth.hav || sth, bort = R.seaPath('stockholm', 'kalmar'); let sx = hav.x, sz = hav.z, d = 0;
        for (let k = 0; k < 60 && Geo.sdAt(sx - 0.3, sz) < -0.45; k++) sx -= 0.3;          // stranden nedanför staden
        Scene.setSeason(0.7);
        const skepp = [0, 1, 2].map(() => { const s = V.skepp('danmark'); s.scale.setScalar(2.1); Scene.scene.add(s); tempM.push(s); return s; });
        const lagg = () => skepp.forEach((s, i) => { const a = R.along(bort, 8.5 + d + i * 2.4); s.position.set(a.x + Math.cos(a.ang) * ((i % 2) - 0.5) * 1.4, 0.02 + Math.sin(tid * 1.4 + i) * 0.03, a.z - Math.sin(a.ang) * ((i % 2) - 0.5) * 1.4); s.rotation.y = a.ang; });
        lagg(); const forst = skepp[0].position, pts = [[sx, sz], [forst.x, forst.z]];
        const bat = V.skepp('sverige'); bat.scale.setScalar(0.95); bat.position.set(sx, 0.02, sz); bat.rotation.y = Math.atan2(forst.x - sx, forst.z - sz); Scene.scene.add(bat); tempM.push(bat);
        const sex = []; for (let i = 0; i < 5; i++) { const u = Folk.add(sx - 1.0 - (i % 3) * 0.32, sz - 0.25 + Math.floor(i / 3) * 0.38, 'borgare', { ang: 1.6 }); sex.push(u); temp.push(u); }
        const ge = gustavE(), star = dt => ge.place(sx - 1.72, sz + 0.2, 1.6, 0, tid, dt, false, true); ge.ang = 1.6; ge.utanRing = true; hooks.push(star); /* inget namn över honom här: att han är en av de sex får man veta i texten (Johannes 2026-11-27) */          // den sjätte är Gustav Eriksson, 22 år
        Scene.jump((sx + forst.x) / 2, sz + 2.4, 30); plats('Stockholm, hösten 1518'); hooks.push(lagg);
        await vanta(2); text('Kristian har förlorat slaget och vill förhandla. Hans bud kräver sex svenska herrar ombord på skeppen, som säkerhet.'); await vanta(8.5);
        sex.forEach(u => Folk.remove(u)); temp = temp.filter(u => sex.indexOf(u) < 0); hooks = hooks.filter(h => h !== star); ge.g.visible = false;
        await akFard(pts, 0, R.length(pts) - 0.9, 0.7, 'Skicka', 'Tryck för att skicka ut dem', { kd: innerWidth < innerHeight ? 31 : 27, sikt: [forst.x, forst.z], ljud: 'vag', satt: a => { bat.position.set(a.x, 0.02 + Math.sin(tid * 2) * 0.02, a.z); bat.rotation.y = a.ang; } });
        UI.film.knapp(null); I.tar = null; Scene.scene.remove(bat); L.spela('nej'); text('När de sex är ombord hissar Kristian segel.');
        hooks.push(dt => { d = Math.min(26, d + dt * 1.5); const c = Scene.cam, f = Math.min(1, dt * 1.2); c.tx += (forst.x - c.tx) * f; c.tz += (forst.z + 2 - c.tz) * f; c.td = 36; });
        await vanta(6); text('Det blir inget möte. De sex förs till Danmark som fångar. En av dem är den unge Gustav Eriksson.'); await vanta(8.5);
      },
      // Midsommar 1523. Stockholm har gett upp efter två års belägring, och den nyvalde kungen rider in längs landsvägen söderifrån till torget.
      async intag() {
        const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }; Scene.setSeason(0.47);
        let vag = null, bz = -1e9; for (const l of V.Rike.vagarVid('stockholm')) { const q = l.find(q => Math.hypot(q[0] - p.x, q[1] - p.z) > 9) || l[l.length - 1]; if (q[1] > bz) { bz = q[1]; vag = l; } }
        const ut = (vag || [[p.x, p.z], [p.x, p.z + 10]]).filter(q => Math.hypot(q[0] - p.x, q[1] - p.z) < 11).reverse(), mal = [p.x + T.x * K, p.z + T.z * K], pts = ut.concat([mal]);
        const L0 = V.Rike.length(pts), folk = [];
        for (let s = L0 * 0.45; s < L0 - 0.8; s += 0.55) { const a = V.Rike.along(pts, s); for (const sd of [-1, 1]) { const x = a.x + Math.cos(a.ang) * 0.36 * sd, z = a.z - Math.sin(a.ang) * 0.36 * sd; if (Geo.sdAt(x, z) > 0.4 && !V.Filmstad.iHus(st, x, z)) {          /* längs gatan, framför husen och aldrig inne i ett */ const u = Folk.add(x, z, folk.length % 4 === 3 ? 'kvinna' : 'borgare', { ang: a.ang + sd * 1.571 }); folk.push(u); temp.push(u); } } }
        const ge = gustavE(), g = { x: pts[0][0], z: pts[0][1], ang: 0, v: 0 }; hooks.push(dt => ge.place(g.x, g.z, g.ang, g.v, tid, dt, false, false));          // till häst skylt('Gustav', () => g, 1.8);
        Scene.jump(pts[0][0], pts[0][1] + 2, 24); plats('Stockholm, midsommar 1523');
        await vanta(2); text('Stockholm har gett upp efter två års belägring. Portarna står öppna.'); await vanta(7);
        await akFard(pts, 0, L0 - 0.3, 0.7, 'Rid in', 'Tryck för att rida in i staden', { kd: 20, ljud: 'hov', satt: (a, v) => { g.x = a.x; g.z = a.z; g.ang = a.ang; g.v = v; } });
        UI.film.knapp(null); I.tar = null; folk.forEach((u, i) => setTimeout(() => { u.y = 0.1; setTimeout(() => { u.y = 0; }, 180); }, i * 40)); L.spela('klart');
        text('Gustav rider in i staden som kung.'); await vanta(6.5);
        text('Det är midsommarafton.'); await vanta(6);
      },
      // Juni 1527. Riksdagen i Västerås, i dominikanklostrets sal. Man kallar själv in stånden, ett i taget. Sedan kommer valet.
      async riksdag() {
        const p = R.P.vasteras, K = B.K, st = V.Varld.tomt.vasteras, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.45);
        const ge = gustavE(), g = { x: cx, z: cz - 0.9 }; hooks.push(dt => ge.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Kungen', () => g, 1.8);
        const stand = [['Rådet', 'borgare', '#5a2f2f'], ['Adeln', 'borgare', '#2f4f8a'], ['Borgarna', 'borgare', null], ['Bergsmännen', 'bergsman', null], ['Bönderna', 'bonde', null]], skyltar0 = [];
        const kallaIn = k => { const s = stand[k]; if (!s) return; const rz = cz + 0.1 + k * 0.42; for (let i = 0; i < 5; i++) { const x = cx + (i - 2) * 0.38, u = Folk.add(x, rz, s[1], s[2] ? { col: s[2], ang: Math.PI } : { ang: Math.PI }); temp.push(u); u.y = 0.1; setTimeout(() => { u.y = 0; }, 160); } skyltar0.push(skylt(s[0], () => ({ x: cx + 1.25, z: rz }), 0.9)); Fx.damm(cx, Geo.groundAt(cx, rz), rz, 4); };
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.4, 15); plats('Västerås, juni 1527');
        await vanta(2); text('Kungen har kallat riksdagen till Västerås. Den samlas i dominikanklostrets sal.'); await vanta(7);
        text('Tryck för att kalla in stånden');
        const n = await tryckN('Kalla in', 5, k => { kallaIn(k - 1); L.spela('trumma'); if (k === 2) text(''); }, 20);
        for (let k = n; k < 5; k++) kallaIn(k);
        text('Rådet, 129 adelsmän, borgare, 14 bergsmän och över hundra bönder.'); await vanta(7);
        text('Kronan har stora skulder, och kyrkan äger omkring en femtedel av jorden. Kungen vill att kyrkans rikedomar ska gå till kronan.'); await vanta(8);
        skyltar0.forEach(s => s.bort());
      },
      // Midsommar 1560. Kungen tar farväl av ständerna i Stockholm. Man låter honom själv tala, en sak i taget. Sedan läses testamentet upp.
      async farval() {
        const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.47);
        const ge = gustavE(), g = { x: cx, z: cz - 0.9 }; hooks.push(dt => ge.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Kung Gustav, 64 år', () => g, 1.8);
        const lyss = []; for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const u = Folk.add(cx + (i - 2.5) * 0.36, cz + 0.15 + r * 0.4, r === 3 ? 'bonde' : r === 2 ? 'bergsman' : 'borgare', r === 0 ? { col: '#2f4f8a', ang: Math.PI } : { ang: Math.PI }); lyss.push(u); temp.push(u); }
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.4, 15); plats('Stockholm, midsommar 1560');
        await vanta(2); text('Gustav har styrt riket i nästan fyrtio år. Nu har han kallat riksdagen till Stockholm för att tala till den en sista gång.'); await vanta(8);
        const delar = ['Han påminner om hur riket blev fritt.', 'Han ber dem hålla fast vid den nya läran.', 'Han ber dem vara trogna mot hans söner.'];
        text('Tryck för att låta kungen tala');
        const n = await tryckN('Tala', 3, k => { text(delar[k - 1]); L.spela('sorl'); lyss.forEach((u, i) => { if (i % 3 === k % 3) { u.y = 0.08; setTimeout(() => { u.y = 0; }, 200); } }); }, 24);
        for (let k = n; k < 3; k++) { text(delar[k]); await vanta(4); }
        await vanta(4); text('Sedan läses hans testamente upp.'); await vanta(6);
        text('Det är sista gången kungen talar till riksdagen.'); await vanta(6);
      },
      // ---- nyckelhändelser i Gustavs värld (Johannes 2026-11-28: "minnesvärda moment vid nyckelhändelser i historien") ----------------
      // 6 juni 1523. Rikets män väljer Gustav till kung i Strängnäs. Man låter dem själv rösta, ett stånd i taget.
      async val() {
        const tillbaka = utanHjalte();
        const T = torgVid('strangnas'), cx = T.x, cz = T.z; Scene.setSeason(0.43);
        const ge = gustavE(), g = { x: cx, z: cz - 0.8 }; ge.klad && ge.klad('Hövitsman'); hooks.push(dt => ge.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Gustav Eriksson', () => g, 1.8);
        const stand = [['borgare', '#2f4f8a'], ['borgare', null], ['bergsman', null], ['bonde', null], ['bonde', null]], rader = [];
        stand.forEach((s, r) => { const rad = []; for (let i = 0; i < 6; i++) { const x = cx + (i - 2.5) * 0.36, z = cz + 0.35 + r * 0.38; if (!fritt(T, x, z)) continue; const u = Folk.add(x, z, s[0], s[1] ? { col: s[1], ang: Math.PI } : { ang: Math.PI }); rad.push(u); temp.push(u); } rader.push(rad); });
        const lb = []; for (let i = 0; i < 2; i++) { const x = cx + 1.5, z = cz - 0.6 + i * 0.35; if (fritt(T, x, z)) { const u = Folk.add(x, z, 'borgare', { col: i ? '#f2ede2' : '#b8312a', ang: -1.2 }); lb.push(u); temp.push(u); } }
        if (lb.length) skylt('Lübecks sändebud', () => lb[0], 1.35);
        Scene.cam.lut = 58; Scene.jump(cx, cz + 1.3, 14); plats('Strängnäs, juni 1523');
        await vanta(2); text('Kristian är avsatt i Danmark och har flytt. Rikets män har samlats i Strängnäs för att välja en kung.'); await vanta(7);
        text('Tryck för att låta rikets män rösta');
        const hylla = k => { const rad = rader[(k - 1) % rader.length] || []; rad.forEach((u, i) => setTimeout(() => { u.y = 0.1; setTimeout(() => { u.y = 0; }, 170); }, i * 50)); L.spela('sorl'); if (k === 2) text(''); };
        const n = await tryckN('Rösta', rader.length, hylla, 20); for (let k = n + 1; k <= rader.length; k++) hylla(k);
        await vanta(1); ge.klad && ge.klad('Kung'); Fx.guld(g.x, Geo.groundAt(g.x, g.z) + 0.7, g.z, 50, 0.5); L.spela('klart'); L.klockton && [0, 1, 2, 3].forEach(k => setTimeout(() => L.klockton(k % 2 ? 294 : 392, undefined, 0.14), k * 650));
        text('Den 6 juni 1523 väljs Gustav Eriksson till Sveriges kung.'); await vanta(7); tillbaka();
      },
      // 1526. Nya testamentet trycks på svenska i Stockholm. Man drar själv pressen, ark för ark.
      async nt() {
        const tillbaka = utanHjalte();
        const T = torgVid('stockholm'), cx = T.x, cz = T.z; Scene.setSeason(0.6);
        const mb = new V.MB(); mb.snow = 0;
        for (const s of [-1, 1]) { mb.box(s * 0.3, 0, 0, 0.07, 0.95, 0.07, '#5d4a38'); mb.box(s * 0.3, 0, 0.4, 0.07, 0.4, 0.07, '#5d4a38'); }
        mb.box(0, 0.88, 0, 0.67, 0.09, 0.14, '#6b5743'); mb.box(0, 0.38, 0.2, 0.62, 0.05, 0.62, '#8a6a44'); mb.box(0, 0.6, 0, 0.08, 0.28, 0.08, '#7b6650'); mb.box(0.12, 0.66, 0, 0.36, 0.03, 0.03, '#3a2e24');          // pressen: ram, bord, skruv och spaken
        const press = B.mesh(mb); press.position.set(cx, Geo.groundAt(cx, cz), cz - 0.4); press.scale.setScalar(B.K * 0.8); Scene.scene.add(press); tempM.push(press);
        const hog = new V.MB(); hog.snow = 0; hog.box(0, 0, 0, 0.3, 0.012, 0.42, '#f2ecd8', { low: '#d8d0b8' }); const ark = [];
        const tr = []; for (let i = 0; i < 2; i++) { const u = Folk.add(cx - 0.5 + i * 1.0, cz - 0.1, 'borgare', { ang: i ? -1.2 : 1.2 }); tr.push(u); temp.push(u); }
        Scene.cam.lut = 64; Scene.jump(cx, cz + 0.3, 8); plats('Stockholm, 1526');
        await vanta(2); text('Olaus Petri och Laurentius Andreae har översatt Nya testamentet till svenska.'); await vanta(7);
        text('Tryck för att dra pressen');
        const dra = k => { const m = B.mesh(hog), x = cx + 0.55 * B.K * 0.8, z = cz - 0.4 + 0.1; m.position.set(x, Geo.groundAt(x, z) + 0.02 + k * 0.018, z); m.rotation.y = (k % 3 - 1) * 0.08; m.scale.setScalar(B.K * 0.8); Scene.scene.add(m); tempM.push(m); ark.push(m); press.position.y = Geo.groundAt(cx, cz - 0.4) - 0.03; setTimeout(() => { press.position.y = Geo.groundAt(cx, cz - 0.4); }, 160); tr.forEach(u => { u.y = 0.06; setTimeout(() => { u.y = 0; }, 160); }); L.spela('trumma'); if (k === 2) text(''); };
        const n = await tryckN('Tryck', 6, dra, 20); for (let k = n + 1; k <= 6; k++) dra(k);
        L.spela('klart'); Fx.guld(cx + 0.45, Geo.groundAt(cx, cz) + 0.3, cz - 0.3, 30, 0.3);
        text('Nu kan den som kan läsa läsa Guds ord på svenska, och präster kan läsa det högt för alla.'); await vanta(7); tillbaka();
      },
      // 1531. Varje sockenkyrka ska lämna en klocka till skulden i Lübeck. Man tar själv ned klockan i Leksand, och dalkarlarna kommer.
      async klockor() {
        const tillbaka = utanHjalte();
        const T = torgVid('leksand'), cx = T.x, cz = T.z; Scene.setSeason(0.62);
        const mb = new V.MB(); mb.snow = 0; for (const sx of [-0.25, 0.25]) for (const sz of [-0.25, 0.25]) mb.push().move(sx, 0, sz).rotZ(-sx * 0.25).rotX(sz * 0.25), mb.box(0, 0, 0, 0.06, 1.1, 0.06, '#5d4a38'), mb.pop();
        mb.box(0, 1.05, 0, 0.5, 0.06, 0.5, '#4a3a2c'); mb.hip(0, 1.11, 0, 0.62, 0.4, 0.62, '#4a3e34', 0.06); const stapel = B.mesh(mb);
        const sx0 = cx - 0.6, sz0 = cz - 0.7; stapel.position.set(sx0, Geo.groundAt(sx0, sz0), sz0); stapel.scale.setScalar(B.K * 0.8); Scene.scene.add(stapel); tempM.push(stapel);
        const kb = new V.MB(); kb.snow = 0; kb.cone(0, 0, 0, 0.13, 0.2, 10, '#8a6a2c', { low: '#5a4418', snowLow: 0, snowTip: 0 }); kb.cyl(0, -0.02, 0, 0.14, 0.14, 0.03, 10, '#9a7a34'); const klocka = B.mesh(kb), k0 = Geo.groundAt(sx0, sz0) + 0.82 * B.K * 0.8;
        klocka.position.set(sx0, k0, sz0); klocka.scale.setScalar(B.K * 0.8); Scene.scene.add(klocka); tempM.push(klocka);
        const fogde = []; for (let i = 0; i < 3; i++) { const u = Folk.add(sx0 + 0.4 + i * 0.3, sz0 + 0.5, 'knekt', { pike: i !== 1, ang: -0.6 }); fogde.push(u); temp.push(u); } skylt('Kungens män', () => fogde[1], 1.3);
        let sving = 0; hooks.push(dt => { sving += dt; klocka.rotation.z = Math.sin(sving * 2.2) * 0.06; });
        Scene.cam.lut = 62; Scene.jump(sx0 + 0.6, sz0 + 0.5, 8.5); plats('Leksand, 1531');
        await vanta(2); text('Skulden till Lübeck är inte betald. Kungen kräver en klocka från varje kyrka.'); await vanta(7);
        text('Tryck för att ta ned klockan');
        const ned = k => { klocka.position.y = k0 - k * 0.22; L.spela('klocka'); fogde.forEach(u => { u.y = 0.05; setTimeout(() => { u.y = 0; }, 150); }); if (k === 2) text(''); };
        const n = await tryckN('Ta ned', 3, ned, 18); for (let k = n + 1; k <= 3; k++) ned(k);
        const dal = []; for (let i = 0; i < 9; i++) { const u = Folk.add(cx + 3 + (i % 3) * 0.35, cz + 1.2 + Math.floor(i / 3) * 0.35, 'bonde', { gar: true, pike: i % 3 === 0, ang: -1.6 }); dal.push(u); temp.push(u); }
        hooks.push(dt => dal.forEach((u, i) => { const mx = cx + 0.6 + (i % 3) * 0.32; if (u.x > mx) u.x -= dt * 0.6; else u.gar = false; }));
        await vanta(2.5); L.spela('nej'); text('Dalkarlarna kommer. Klockan får inte tas, säger de. Kyrkan är deras.'); await vanta(7);
        text('I Dalarna vägrar de lämna klockorna.'); await vanta(6); tillbaka();
      },
      // 13 januari 1544. Riksdagen i Västerås gör Sverige till ett arvrike. Man låter stånden själva sätta sina sigill.
      async arvrike() {
        const tillbaka = utanHjalte();
        const T = torgVid('vasteras'), cx = T.x, cz = T.z; Scene.setSeason(0.05);
        const ge = gustavE(), g = { x: cx - 0.3, z: cz - 0.8 }; ge.klad && ge.klad('Kung'); hooks.push(dt => ge.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Kung Gustav', () => g, 1.8);
        const ek = erikE(false), e = { x: cx + 0.35, z: cz - 0.75 }; if (!ek._sk0) ek._sk0 = ek.g.scale.x; ek.g.scale.setScalar(ek._sk0 * 0.82);          // pojken hooks.push(dt => ek.place(e.x, e.z, 0, 0, tid, dt, false, true)); skylt('Erik, 10 år', () => e, 1.5);
        const mb = new V.MB(); mb.snow = 0; mb.box(0, 0, 0, 1.0, 0.24, 0.42, '#6b4a2c', { low: '#4f3620' }); mb.box(0, 0.24, 0, 1.06, 0.03, 0.48, '#7a1f2a'); mb.box(0, 0.27, 0, 0.32, 0.005, 0.22, '#f2ecd8'); const bord = B.mesh(mb); bord.position.set(cx, Geo.groundAt(cx, cz), cz - 0.15); bord.scale.setScalar(B.K * 0.85); Scene.scene.add(bord); tempM.push(bord);
        const stand = [['Rådet', 'borgare', '#5a2f2f'], ['Adeln', 'borgare', '#2f4f8a'], ['Prästerna', 'borgare', '#2a2a2a'], ['Borgarna', 'borgare', null], ['Bönderna', 'bonde', null]], sig = [];
        const folk = []; stand.forEach((s, r) => { for (let i = 0; i < 4; i++) { const x = cx + (i - 1.5) * 0.36 + (r % 2) * 0.1, z = cz + 0.45 + r * 0.36; if (!fritt(T, x, z)) continue; const u = Folk.add(x, z, s[1], s[2] ? { col: s[2], ang: Math.PI } : { ang: Math.PI }); temp.push(u); (folk[r] || (folk[r] = [])).push(u); } });
        Scene.cam.lut = 70; Scene.jump(cx, cz + 0.8, 11); plats('Västerås, januari 1544');
        await vanta(2); text('Kungen har kallat riksdagen till Västerås. Kronan ska inte längre väljas. Den ska gå i arv.'); await vanta(7);
        text('Tryck för att låta stånden sätta sina sigill');
        const satt = k => { const s = stand[k - 1]; if (!s) return; const m = new V.MB(); m.snow = 0; m.cyl(0, 0, 0, 0.035, 0.035, 0.015, 8, '#b3262a'); const x = cx - 0.36 + (k - 1) * 0.18, z = cz - 0.15 + 0.05; const me = B.mesh(m); me.position.set(x, Geo.groundAt(cx, cz) + 0.25 * B.K * 0.85 + 0.01, z); me.scale.setScalar(B.K); Scene.scene.add(me); tempM.push(me); sig.push(me); (folk[k - 1] || []).forEach(u => { u.y = 0.08; setTimeout(() => { u.y = 0; }, 170); }); L.spela('trumma'); if (k === 2) text(''); };
        const n = await tryckN('Sigill', stand.length, satt, 22); for (let k = n + 1; k <= stand.length; k++) satt(k);
        L.spela('klart'); Fx.guld(e.x, Geo.groundAt(e.x, e.z) + 0.6, e.z, 40, 0.4);
        text('Den 13 januari 1544 blir Sverige ett arvrike. Kronan ska gå till kungens äldste son, Erik.'); await vanta(7.5);
        ek.g.scale.setScalar(ek._sk0); tillbaka();
      },
      // 1550. Helsingfors grundas vid Vanda ås mynning. Borgare från fyra städer måste flytta dit. Man bygger själv de första husen.
      async helsingfors() {
        const tillbaka = utanHjalte();
        const p = R.P.helsingfors, hav = p.hav || { x: p.x + 2, z: p.z + 2 }; Scene.setSeason(0.5);
        let cx = p.x, cz = p.z; for (let k = 0; k < 20 && Geo.sdAt(cx, cz) < 0.9; k++) { cx += (p.x - hav.x) * 0.06; cz += (p.z - hav.z) * 0.06; }
        const skepp = []; for (let i = 0; i < 3; i++) { const s = V.skepp('sverige'); s.scale.setScalar(1.4); s.position.set(hav.x + (i - 1) * 1.3, 0.02, hav.z + (i % 2) * 0.8); s.rotation.y = Math.atan2(cx - hav.x, cz - hav.z); Scene.scene.add(s); tempM.push(s); skepp.push(s); }
        const platser = []; for (let i = 0; i < 6; i++) platser.push([cx + (i % 3 - 1) * 0.95, cz + (Math.floor(i / 3) - 0.5) * 0.85]);
        const stader = ['Borgå', 'Ekenäs', 'Raumo', 'Ulvsby'], folk = [];
        Scene.cam.lut = 55; Scene.jump(cx, cz + 1.0, 13); plats('Vanda å, 1550');
        await vanta(2); text('Handeln med Ryssland går genom Reval. Kungen vill ha en egen stad på den här sidan viken.'); await vanta(7);
        text('Borgare från Borgå, Ekenäs, Raumo och Ulvsby måste flytta hit.'); await vanta(6);
        text('Tryck för att bygga');
        const bygg = k => { const q = platser[k - 1]; if (!q) return; const m = new V.MB(); B.stuga(m, 0.9 + (k % 3) * 0.12, 0.6, 0.34, k % 2 ? 'span' : 'torv', { skorsten: 1, ljus: 1 }); const me = B.mesh(m); me.position.set(q[0], Geo.groundAt(q[0], q[1]), q[1]); me.rotation.y = Math.atan2(hav.x - q[0], hav.z - q[1]); me.scale.setScalar(B.K * 0.75); Scene.scene.add(me); tempM.push(me); Fx.damm(q[0], Geo.groundAt(q[0], q[1]), q[1], 8);
          const u = Folk.add(q[0] + 0.3, q[1] + 0.45, k % 2 ? 'borgare' : 'kvinna', { ang: 0 }); folk.push(u); temp.push(u); if (k <= 4) { const s = skylt('Från ' + stader[k - 1], () => u, 1.2); setTimeout(() => s.bort(), 3500); } L.spela('hammare'); if (k === 2) text(''); };
        const n = await tryckN('Bygg', 6, bygg, 22); for (let k = n + 1; k <= 6; k++) bygg(k);
        L.spela('klart'); text('Staden heter Helsingfors. Den ska ta handeln från Reval.'); await vanta(7); tillbaka();
      },
      // ---- nyckelhändelser i Eriks, Johans, Sigismunds och Karls världar --------------------------------------------------------
      // 14 april 1561. Arboga artiklar: hertigarna Johan och Karl måste lyda kungen. Man läser själv upp artiklarna, en i taget.
      async arboga() {
        const tillbaka = utanHjalte(), T = torgVid('arboga'), cx = T.x, cz = T.z; Scene.setSeason(0.3);
        const ek = erikE(true), e = { x: cx, z: cz - 0.9 }; hooks.push(dt => ek.place(e.x, e.z, 0, 0, tid, dt, false, true)); skylt('Kung Erik', () => e, 1.8);
        const jo = johanE(); jo.klad('Hertig'); const j = { x: cx - 0.55, z: cz + 0.3 }; hooks.push(dt => jo.place(j.x, j.z, Math.PI, 0, tid, dt, false, true)); skylt('Hertig Johan', () => j, 1.7);
        const ka = karlE(false), k = { x: cx + 0.55, z: cz + 0.3 }; hooks.push(dt => ka.place(k.x, k.z, Math.PI, 0, tid, dt, false, true)); skylt('Hertig Karl', () => k, 1.7);
        const folk = []; for (let i = 0; i < 10; i++) { const x = cx + (i % 5 - 2) * 0.36, z = cz + 0.9 + Math.floor(i / 5) * 0.36; if (fritt(T, x, z)) { const u = Folk.add(x, z, i % 2 ? 'borgare' : 'bonde', { ang: Math.PI }); folk.push(u); temp.push(u); } }
        Scene.cam.lut = 60; Scene.jump(cx, cz + 0.9, 12); plats('Arboga, april 1561');
        await vanta(2); text('Erik litar inte på sina bröder. Vid riksdagen i Arboga ska hertigarna lova att lyda kungen.'); await vanta(7);
        const art = ['Hertigarnas folk ska svära kungen trohet.', 'Deras soldater står under kungens befäl i krig.', 'De får inte sluta förbund utan kungens lov.', 'Den högsta domstolen är kungens.'];
        text('Tryck för att läsa upp artiklarna');
        const las = n => { text(art[n - 1]); L.spela('trumma'); folk.forEach((u, i) => { if (i % 4 === n % 4) { u.y = 0.07; setTimeout(() => { u.y = 0; }, 160); } }); };
        const n = await tryckN('Läs upp', 4, las, 26); for (let q = n + 1; q <= 4; q++) { las(q); await vanta(3); }
        await vanta(3.5); L.spela('nej'); text('Johan skriver under, men motvilligt.'); await vanta(6.5); tillbaka();
      },
      // 1561–1563. Skeppet Mars byggs vid Björkenäs norr om Kalmar. Man bygger själv skrovet, och sedan går hon av stapeln.
      async mars() {
        const tillbaka = utanHjalte(), p = R.P.kalmar, h = p.hav || { x: p.x + 2, z: p.z }, dx = h.x - p.x, dz = h.z - p.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl; Scene.setSeason(0.55);
        const nx0 = -uz, nz0 = ux, sgn = nz0 < 0 ? 1 : -1;          // en bit norr om staden (Björkenäs), på land vid stranden
        let sx = p.x + nx0 * 3.2 * sgn, sz = p.z + nz0 * 3.2 * sgn; for (let q = 0; q < 30 && Geo.sdAt(sx, sz) < 1.2; q++) { sx -= ux * 0.25; sz -= uz * 0.25; }
        let lx = ux, lz = uz, bast = 1e9; for (let a = 0; a < 16; a++) { const vx = Math.cos(a / 16 * 6.283), vz = Math.sin(a / 16 * 6.283); let d = 0; while (d < 5 && Geo.sdAt(sx + vx * d, sz + vz * d) > 0) d += 0.2; if (d < bast) { bast = d; lx = vx; lz = vz; } }          // sjösättningen går mot närmaste vatten
        const vrid = Math.atan2(lx, lz), steg = [];
        const lagg = st => { const mb = new V.MB(); mb.snow = 0; mb.box(0, 0.06, 0, 0.5, 0.06, 1.6, '#6b5743'); for (let k = -0.7; k <= 0.7; k += 0.35) mb.box(0, 0, k, 0.06, 0.2 + Math.min(st, 3) * 0.08, 0.06, '#b9935f');
          if (st >= 1) mb.box(0, 0.12, 0, 0.18, 0.08, 1.5, '#5a4838'); if (st >= 2) for (let k = -0.6; k <= 0.6; k += 0.2) mb.box(0, 0.16, k, 0.5, 0.03, 0.05, '#7b6650');
          if (st >= 3) { mb.box(0, 0.16, 0, 0.46, 0.22, 1.45, '#6b4a2c', { low: '#4f3620' }); } if (st >= 4) { mb.box(0, 0.38, -0.55, 0.42, 0.2, 0.35, '#7a5a3a'); mb.box(0, 0.38, 0.6, 0.38, 0.14, 0.25, '#7a5a3a'); }
          const m = B.mesh(mb); m.position.set(sx, Geo.groundAt(sx, sz), sz); m.rotation.y = vrid; m.scale.setScalar(B.K * 1.1); Scene.scene.add(m); tempM.push(m); steg.forEach(q => { Scene.scene.remove(q); }); steg.push(m); return m; };
        lagg(0);
        const folk = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283, x = sx + Math.cos(a) * 1.1, z = sz + Math.sin(a) * 1.1; if (Geo.sdAt(x, z) > 0.4) { const u = Folk.add(x, z, i % 2 ? 'bonde' : 'knekt', { ang: Math.atan2(sx - x, sz - z) }); folk.push(u); temp.push(u); } }
        Scene.cam.lut = 55; Scene.jump(sx, sz + 1.2, 11); plats('Björkenäs, 1561');
        await vanta(2); text('Erik vill ha ett krigsskepp större än något som har funnits. Vid Björkenäs norr om Kalmar sträcks kölen.'); await vanta(7);
        text('Tryck för att bygga');
        const bygg = q => { lagg(q); L.spela('hammare'); Fx.damm(sx, Geo.groundAt(sx, sz) + 0.1, sz, 8); folk.forEach(u => { u.y = 0.06; setTimeout(() => { u.y = 0; }, 140); }); if (q === 2) text(''); };
        const n = await tryckN('Bygg', 4, bygg, 22); for (let q = n + 1; q <= 4; q++) bygg(q);
        text('1563 går hon av stapeln.'); steg.forEach(q => Scene.scene.remove(q));
        const s = V.skepp('sverige', true); s.scale.setScalar(2.6); s.rotation.y = vrid; Scene.scene.add(s); tempM.push(s); let d = 0;
        const ut = bast + 1.4; hooks.push(dt => { d = Math.min(ut, d + dt * 0.7); s.position.set(sx + lx * d, Math.max(0.02, Geo.groundAt(sx + lx * d, sz + lz * d)), sz + lz * d); });
        Scene.flyTo(sx + lx * ut * 0.6, sz + lz * ut * 0.6 + 1.2, 13, 3); L.spela('klart'); await vanta(4);
        text('Skeppet heter Mars, men folk kallar henne Makalös.'); await vanta(7); tillbaka();
      },
      // 10 juli 1569. Johan och Katarina kröns samma dag i Uppsala domkyrka. Man bär själv fram de två kronorna.
      async johankroning() {
        const tillbaka = utanHjalte(), T = torgVid('uppsala'), cx = T.x, cz = T.z; Scene.setSeason(0.52);
        const jo = johanE(); jo.klad('Hertig'); const j = { x: cx - 0.3, z: cz - 0.7 }; hooks.push(dt => jo.place(j.x, j.z, 0, 0, tid, dt, false, true)); skylt('Johan', () => j, 1.7);
        const kat = Folk.add(cx + 0.3, cz - 0.7, 'kvinna', { col: '#8a2a3a', col2: '#f2eee2', sc: 1.35, ang: 0 }); temp.push(kat); skylt('Katarina', () => kat, 1.4);
        for (let i = 0; i < 12; i++) { const x = cx + (i % 6 - 2.5) * 0.36, z = cz + 0.4 + Math.floor(i / 6) * 0.38; if (fritt(T, x, z)) temp.push(Folk.add(x, z, i < 6 ? 'borgare' : 'bonde', i < 6 ? { col: '#2f4f8a', ang: Math.PI } : { ang: Math.PI })); }
        const krona = (x, z) => { const mb = new V.MB(); mb.snow = 0; mb.cyl(0, 0, 0, 0.07, 0.075, 0.045, 10, '#e8c040', { low: '#a8801e' }); for (let k = 0; k < 6; k++) { const v = k / 6 * 6.283; mb.cone(Math.cos(v) * 0.068, 0.045, Math.sin(v) * 0.068, 0.014, 0.035, 4, '#e8c040'); } const m = B.mesh(mb); m.scale.setScalar(B.K * 1.4); Scene.scene.add(m); tempM.push(m); return m; };
        Scene.cam.lut = 64; Scene.jump(cx, cz + 0.6, 11); plats('Uppsala, 10 juli 1569');
        await vanta(2); text('Erik är avsatt och sitter fången. Johan ska krönas i Uppsala domkyrka, och drottning Katarina med honom.'); await vanta(7.5);
        text('Tryck för att bära fram kronorna');
        const bar = q => { if (q === 1) { jo.klad('Kung'); Fx.guld(j.x, Geo.groundAt(j.x, j.z) + 0.75, j.z, 30, 0.3); } else { const m = krona(); m.position.set(kat.x, Geo.groundAt(kat.x, kat.z) + 0.58, kat.z); Fx.guld(kat.x, Geo.groundAt(kat.x, kat.z) + 0.7, kat.z, 30, 0.3); } L.spela('klocka'); };
        const n = await tryckN('Bär fram', 2, bar, 18); for (let q = n + 1; q <= 2; q++) bar(q);
        L.spela('klart'); text('Johan III och Katarina Jagellonica är krönta samma dag.'); await vanta(7); tillbaka();
      },
      // 18 maj 1595. Freden i Teusina vid gränsen mot Ryssland. Man skriver själv under, för kungen.
      async teusina() {
        const tillbaka = utanHjalte(), T = torgVid('teusina'), cx = T.x, cz = T.z; Scene.setSeason(0.38);
        const mb = new V.MB(); B.talt(mb); mb.push().move(0.9, 0, 0); B.talt(mb); mb.pop(); mb.box(0.45, 0, 0.55, 0.6, 0.22, 0.3, '#6b4a2c', { low: '#4f3620' }); mb.box(0.45, 0.22, 0.55, 0.64, 0.02, 0.34, '#2f4f8a'); const lag = B.mesh(mb); lag.position.set(cx - 0.6, Geo.groundAt(cx, cz), cz - 0.6); lag.scale.setScalar(B.K); Scene.scene.add(lag); tempM.push(lag);
        const bx = cx, bz = cz + 0.15, sv = [], ry = [];
        for (let i = 0; i < 6 && sv.length < 4; i++) { const x = bx - 1.2 - (i % 2) * 0.35, z = bz + Math.floor(i / 2) * 0.35 - 0.35; if (!fritt(T, x, z)) continue; const u = Folk.add(x, z, 'borgare', { col: '#2f4f8a', ang: 1.571 }); sv.push(u); temp.push(u); }
        for (let i = 0; i < 6 && ry.length < 4; i++) { const x = bx + 1.2 + (i % 2) * 0.35, z = bz + Math.floor(i / 2) * 0.35 - 0.35; if (!fritt(T, x, z)) continue; const u = Folk.add(x, z, 'rysk', { ang: -1.571 }); ry.push(u); temp.push(u); }
        if (!sv.length) sv.push(Folk.add(bx - 0.6, bz + 0.4, 'borgare', { col: '#2f4f8a' })); if (!ry.length) ry.push(Folk.add(bx + 0.6, bz + 0.4, 'rysk'));
        skylt('Sten Banér', () => sv[0], 1.35); skylt('Tsarens sändebud', () => ry[0], 1.7);
        Scene.cam.lut = 60; Scene.jump(bx, bz + 0.8, 12); plats('Teusina, maj 1595');
        await vanta(2); text('Kriget mot Ryssland har pågått i tjugofem år. I byn Teusina vid gränsen möts sändebuden.'); await vanta(7);
        const pkt = ['Estland blir svenskt.', 'Kexholm går tillbaka till Ryssland.'];
        text('Tryck för att skriva under');
        const skriv = q => { text(pkt[q - 1]); const u = q === 1 ? sv[0] : ry[0]; u.x = bx + (q === 1 ? -0.25 : 0.25); u.z = bz + 0.4; L.spela('trumma'); Fx.guld(u.x, Geo.groundAt(u.x, u.z) + 0.4, u.z, 14, 0.2); };
        const n = await tryckN('Skriv under', 2, skriv, 20); for (let q = n + 1; q <= 2; q++) { skriv(q); await vanta(3); }
        await vanta(3.5); L.spela('klart'); text('Den 18 maj 1595 är det fred i Teusina.'); await vanta(6.5); tillbaka();
      },
      // 1604. Riksdagen i Norrköping: hertig Johan avsäger sig tronen, och Karl blir kung. Man låter stånden hylla honom.
      async norrkoping() {
        const tillbaka = utanHjalte(), T = torgVid('norrkoping'), cx = T.x, cz = T.z; Scene.setSeason(0.2);
        const ka = karlE(false), k = { x: cx, z: cz - 0.8 }; hooks.push(dt => ka.place(k.x, k.z, 0, 0, tid, dt, false, true)); skylt('Karl', () => k, 1.8);
        const hj = Folk.add(cx + 0.75, cz - 0.55, 'borgare', { col: '#5a2f2f', ang: -0.8 }); temp.push(hj); const hs = skylt('Hertig Johan, 15 år', () => hj, 1.35);
        const rader = []; for (let r = 0; r < 4; r++) { const rad = []; for (let i = 0; i < 6; i++) { const x = cx + (i - 2.5) * 0.36, z = cz + 0.35 + r * 0.38; if (!fritt(T, x, z)) continue; const u = Folk.add(x, z, r === 3 ? 'bonde' : r === 2 ? 'bergsman' : 'borgare', r === 0 ? { col: '#2f4f8a', ang: Math.PI } : { ang: Math.PI }); rad.push(u); temp.push(u); } rader.push(rad); }
        Scene.cam.lut = 58; Scene.jump(cx, cz + 1.0, 12); plats('Norrköping, 1604');
        await vanta(2); text('Sigismund är avsatt. Hans halvbror hertig Johan avsäger sig sin rätt till tronen.'); await vanta(7);
        text('Tryck för att låta stånden hylla Karl');
        const hyll = q => { (rader[q - 1] || []).forEach((u, i) => setTimeout(() => { u.y = 0.1; setTimeout(() => { u.y = 0; }, 170); }, i * 50)); L.spela('sorl'); if (q === 2) text(''); };
        const n = await tryckN('Hylla', 4, hyll, 20); for (let q = n + 1; q <= 4; q++) hyll(q);
        karlE(true); Fx.guld(k.x, Geo.groundAt(k.x, k.z) + 0.7, k.z, 40, 0.4); L.spela('klart'); hs.bort();
        text('Karl blir Sveriges kung. Kronan ska sedan gå till hans söner.'); await vanta(7); tillbaka();
      },
      // 1571. Riksdagen har beslutat en tiondel av allt silver, all koppar och all boskap till Älvsborgs lösen. Man tar själv emot silvret.
      async silverskatt() {
        const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.5);
        const mb = new V.MB(); mb.snow = 0; mb.box(0, 0, 0, 0.5, 0.28, 0.34, '#6b4a2c', { low: '#4f3620' }); mb.box(0, 0.28, 0, 0.52, 0.06, 0.36, '#8a6a44'); const kista = B.mesh(mb); kista.position.set(cx, Geo.groundAt(cx, cz), cz - 0.3); kista.scale.setScalar(K); Scene.scene.add(kista); tempM.push(kista);
        const hog = new V.MB(); hog.snow = 0; hog.cone(0, 0, 0, 0.2, 0.18, 6, '#d8dde2', { snowLow: 0, snowTip: 0 }); const silver = B.mesh(hog); silver.position.set(cx, Geo.groundAt(cx, cz) + 0.48, cz - 0.3); silver.scale.setScalar(0.01); Scene.scene.add(silver); tempM.push(silver);
        const ek = johanE(), g = { x: cx - 0.9, z: cz - 0.5 }; hooks.push(dt => ek.place(g.x, g.z, 0.6, 0, tid, dt, false, true)); skylt('Kung Johan', () => g, 1.8);
        const kon = []; for (let i = 0; i < 6; i++) { const u = Folk.add(cx + 0.2 + i * 0.4, cz + 1.4 + (i % 2) * 0.2, 'bonde', { ang: Math.PI }); kon.push(u); temp.push(u); }
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.2, 13); plats('Stockholm, 1571');
        await vanta(2); text('Älvsborg ska lösas ut. Varje bonde ger en tiondel av sitt silver.'); await vanta(6);
        text('Tryck för att ta emot silvret');
        let fyllt = 0; const n = await tryckN('Ta emot', 6, k => { const u = kon[k - 1]; if (u) { u.x = cx + 0.2; u.z = cz - 0.05; u.y = 0.08; setTimeout(() => { u.y = 0; }, 180); } fyllt = k / 6; silver.scale.setScalar(K * (0.3 + fyllt * 0.9)); Fx.guld(cx, Geo.groundAt(cx, cz) + 0.5, cz - 0.3, 14, 0.4); L.spela('kop'); if (k === 2) text(''); }, 20);
        if (n < 6) silver.scale.setScalar(K * 1.2);
        text('Silver, koppar och boskap kommer in från hela riket.'); await vanta(6);
      },
      // September 1587. Sigismund seglar från Kalmar för att bli kung i Polen.
      async avsked() {
        const p = R.P.kalmar, K = B.K, hav = p.hav || { x: p.x + 3, z: p.z }, ut = R.seaPath('kalmar', 'bornholm'), L0 = Math.min(R.length(ut), 16); Scene.setSeason(0.7);
        const skepp = V.skepp('sverige', true); skepp.scale.setScalar(2.1); const a0 = R.along(ut, 0.5); skepp.position.set(a0.x, 0.02, a0.z); skepp.rotation.y = a0.ang; Scene.scene.add(skepp); tempM.push(skepp);
        const ek = johanE(), g = { x: p.x + 0.9, z: p.z + 0.6 }; hooks.push(dt => ek.place(g.x, g.z, Math.atan2(hav.x - g.x, hav.z - g.z), 0, tid, dt, false, true)); skylt('Kung Johan', () => g, 1.8);
        const sig = { x: a0.x, z: a0.z }; skylt('Sigismund', () => ({ x: skepp.position.x, z: skepp.position.z }), 1.6);
        Scene.jump((g.x + a0.x) / 2, (g.z + a0.z) / 2 + 2, 22); plats('Kalmar, september 1587');
        await vanta(2); text('Sigismund är 21 år. Han ska bli kung i Polen.'); await vanta(6);
        text('Sverige och Polen ska inte blandas samman, står det i stadgarna.'); await vanta(6);
        await akFard(ut, 0.5, L0, 0.7, 'Segla', 'Tryck för att segla', { kd: 26, ljud: 'vag', sikt: [g.x, g.z], satt: (a) => { skepp.position.set(a.x, 0.02 + Math.sin(tid * 1.4) * 0.03, a.z); skepp.rotation.y = a.ang; } });
        UI.film.knapp(null); I.tar = null; text('Sigismund seglar mot Polen.'); await vanta(5);
      },
      // September 1589. Johan möter sin son i Reval och vill få honom hem. Råden sätter stopp.
      async revalmote() {
        const p = R.P.reval, K = B.K, st = V.Varld.tomt.reval, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.7);
        const ek = johanE(), g = { x: cx - 0.35, z: cz - 0.3 }; hooks.push(dt => ek.place(g.x, g.z, 1.4, 0, tid, dt, false, true)); skylt('Kung Johan', () => g, 1.8);
        const sig = Folk.add(cx + 0.4, cz - 0.3, 'borgare', { col: '#6a1f2a', sc: 1.3, ang: -1.4 }); temp.push(sig); skylt('Sigismund', () => sig, 1.6);
        const rad = []; for (let i = 0; i < 8; i++) { const u = Folk.add(cx + (i - 3.5) * 0.36, cz + 0.6 + (i % 2) * 0.25, 'borgare', { ang: Math.PI }); rad.push(u); temp.push(u); }
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.1, 13); plats('Reval, september 1589');
        await vanta(2); text('Johan har inte sett sin son på två år. Han vill att Sigismund ska komma hem till Sverige.'); await vanta(7);
        text('Tryck för att övertala honom');
        await tryckN('Övertala', 3, k => { L.spela('sorl'); sig.y = 0.06; setTimeout(() => { sig.y = 0; }, 160); if (k === 1) text(''); }, 15);
        L.spela('nej'); text('Råden i båda länderna sätter stopp. Sigismund stannar i Polen.'); await vanta(6.5);
      },
      // 1604. De första nio stugorna i den nya staden på Hisingen, mitt emot Älvsborg.
      async goteborg() {
        const p0 = R.P.goteborg, K = B.K; Scene.setSeason(0.35); let p = null;
        for (let k = 0; k < 24 && !p; k++) { const an = k * 0.785, r = 3 + (k >> 3) * 0.8, x = p0.x + Math.cos(an) * r, z = p0.z + Math.sin(an) * r; if (Geo.sdAt(x, z) > 1.6) p = { x, z }; }          // en tom plats på land en bit från staden
        p = p || p0;
        const platser = []; for (let i = 0; i < 9; i++) platser.push({ x: p.x + (i % 3 - 1) * 1.0, z: p.z + (Math.floor(i / 3) - 1) * 0.9, a: 0 });          // tre rader med tre stugor
        while (platser.length < 9) platser.push({ x: p.x + (platser.length - 4) * 0.5, z: p.z + 1.6, a: 0 });
        for (let i = 0; i < 6; i++) temp.push(Folk.add(p.x - 1 + i * 0.4, p.z + 2.1 + (i % 2) * 0.2, 'borgare'));
        Scene.cam.lut = 58; Scene.jump(p.x, p.z + 1.4, 15); plats('Hisingen, 1604');
        await vanta(2); text('Holländska köpmän ska bo i den nya staden vid Göta älv, mitt emot Älvsborg.'); await vanta(6.5);
        text('Tryck för att bygga');
        const n = await tryckN('Bygg', 9, k => { const q = platser[k - 1], mb = new V.MB(); B.stuga(mb, 0.9 + (k % 3) * 0.1, 0.6, 0.34, k % 2 ? 'span' : 'torv', { skorsten: k % 3 === 0 ? 1 : 0 }); const m = B.mesh(mb); m.position.set(q.x, Geo.groundAt(q.x, q.z), q.z); m.rotation.y = -q.a; m.scale.setScalar(K * 0.45); Scene.scene.add(m); tempM.push(m); Fx.damm(q.x, Geo.groundAt(q.x, q.z), q.z, 12); L.spela('hammare'); if (k === 1) text(''); }, 25);
        L.spela('klart'); text('Nio stugor står på Hisingen. Staden ska heta Göteborg.'); await vanta(6);
      },
      // Mars 1607. Karl IX kröns i Uppsala domkyrka, tre år efter att han blev kung.
      async karlkroning() {
        const p = R.P.uppsala, K = B.K, st = V.Varld.tomt.uppsala, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.2);
        const ka = karlE(false), g = { x: cx, z: cz - 0.4 }; hooks.push(dt => ka.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Karl', () => g, 1.8);
        for (let i = 0; i < 10; i++) temp.push(Folk.add(cx + (i - 4.5) * 0.34, cz + 0.7 + (i % 2) * 0.25, i % 3 ? 'borgare' : 'bonde', { ang: Math.PI }));
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.1, 13); plats('Uppsala, mars 1607');
        await vanta(2); text('Karl har varit kung i tre år. Nu ska han krönas i Uppsala domkyrka.'); await vanta(6.5);
        text('Tryck för att bära fram kronan');
        await tryckN('Bär fram', 3, k => { L.spela('sorl'); if (k === 1) text(''); }, 15);
        karlE(true); Fx.guld(g.x, Geo.groundAt(g.x, g.z) + 0.6, g.z, 30, 0.5); L.spela('klocka'); text('Karl IX är krönt. Klockorna ringer i Uppsala.'); await vanta(6);
      },
      // 1611. Karl hos bergsfolket i Bergslagen, där Filipstad grundas.
      async bergsfolket() {
        const p = R.P.filipstad, K = B.K, cx = p.x - 0.6, cz = p.z + 1.6; Scene.setSeason(0.3);
        const mb = new V.MB(); B.stuga(mb, 1.1, 0.7, 0.38, 'torv', { skorsten: 1, ljus: 1 }); const hus = B.mesh(mb); hus.position.set(cx, Geo.groundAt(cx, cz), cz - 0.5); hus.scale.setScalar(K); Scene.scene.add(hus); tempM.push(hus);
        const ka = karlE(true), g = { x: cx - 0.7, z: cz + 0.3 }; hooks.push(dt => ka.place(g.x, g.z, 1.2, 0, tid, dt, false, true)); skylt('Kung Karl', () => g, 1.8);
        const folk = []; for (let i = 0; i < 4; i++) { const u = Folk.add(cx + 0.1 + i * 0.3, cz - 0.1, i === 3 ? 'kvinna' : 'bonde', { ang: Math.PI * 1.3, vis: false }); folk.push(u); temp.push(u); }
        Scene.cam.lut = 58; Scene.jump(cx, cz + 1.1, 12); plats('Bergslagen, 1611');
        await vanta(2); text('Karl tycker om bergsfolket, och de tycker om honom.'); await vanta(6);
        text('Tryck för att hälsa på');
        await tryckN('Hälsa på', 4, k => { const u = folk[k - 1]; if (u) { u.vis = true; u.z = cz + 0.2; } L.spela('sorl'); if (k === 1) text(''); }, 16);
        folk.forEach(u => { u.vis = true; });
        text('Han äter av deras mat och sover i deras sängar, och talar med dem som deras like.'); await vanta(7);
        L.spela('klart'); text('Den nya staden här får heta Filipstad, efter prins Karl Filip.'); await vanta(6);
      },
      // 30 september 1593. Sigismund kommer till Stockholm med drottning Anna.
      async ankomst() {
        const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.72);
        const in_ = R.seaPath('danzig', 'stockholm'), L0 = R.length(in_), d0 = Math.max(0, L0 - 15), d1 = Math.max(d0 + 2, L0 - 1.2);
        const skepp = V.skepp('sverige', true); skepp.scale.setScalar(2.1); const a0 = R.along(in_, d0); skepp.position.set(a0.x, 0.02, a0.z); skepp.rotation.y = a0.ang; Scene.scene.add(skepp); tempM.push(skepp);
        skylt('Sigismund och Anna', () => ({ x: skepp.position.x, z: skepp.position.z }), 1.7);
        for (let i = 0; i < 7; i++) temp.push(Folk.add(cx + (i - 3) * 0.34, cz + 0.9 + (i % 2) * 0.22, 'borgare'));
        Scene.jump(a0.x, a0.z + 2, 22); plats('Stockholm, 30 september 1593');
        await vanta(2); text('Sigismund är 27 år och kung av Polen. Nu kommer han för att ta Sveriges krona.'); await vanta(6);
        text('Med honom reser drottning Anna och påvens sändebud Germanico Malaspina.'); await vanta(6);
        await akFard(in_, d0, d1, 0.7, 'Segla', 'Tryck för att segla in till Stockholm', { kd: 24, ljud: 'vag', sikt: [cx, cz], satt: (a) => { skepp.position.set(a.x, 0.02 + Math.sin(tid * 1.4) * 0.03, a.z); skepp.rotation.y = a.ang; } });
        UI.film.knapp(null); I.tar = null; L.spela('klocka'); text('Kungen är framme i sitt arvrike.'); await vanta(5);
      },
      // Februari 1594. Sigismund lovar att hålla fast vid Uppsala mötes beslut, och kröns i Uppsala domkyrka.
      async forsakran() {
        const p = R.P.uppsala, K = B.K, st = V.Varld.tomt.uppsala, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.12);
        const mb = new V.MB(); mb.snow = 0; mb.box(0, 0, 0, 0.7, 0.32, 0.36, '#6b4a2c', { low: '#4f3620' }); mb.box(0, 0.32, 0, 0.74, 0.04, 0.4, '#8a6a44'); mb.box(0, 0.36, 0, 0.26, 0.012, 0.18, '#f4ead0');
        const bord = B.mesh(mb); bord.position.set(cx, Geo.groundAt(cx, cz), cz - 0.2); bord.scale.setScalar(K); Scene.scene.add(bord); tempM.push(bord);
        const ek = sigE(), g = { x: cx - 0.1, z: cz - 0.75 }; hooks.push(dt => ek.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Kung Sigismund', () => g, 1.8);
        const ka = karlE(), kg = { x: cx + 0.75, z: cz + 0.25 }; hooks.push(dt => ka.place(kg.x, kg.z, -2.4, 0, tid, dt, false, true)); skylt('Hertig Karl', () => kg, 1.8);
        for (let i = 0; i < 8; i++) temp.push(Folk.add(cx + (i - 3.5) * 0.36, cz + 0.85 + (i % 2) * 0.25, 'borgare', { ang: Math.PI }));
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.1, 13); plats('Uppsala, februari 1594');
        await vanta(2); text('Ständerna kröner inte Sigismund förrän han lovar att hålla fast vid Uppsala mötes beslut.'); await vanta(7);
        text('Tryck för att skriva under');
        await tryckN('Skriv under', 3, k => { L.spela('sorl'); if (k === 1) text(''); }, 15);
        L.spela('klocka'); text('Den 19 februari kröns Sigismund och Anna i Uppsala domkyrka.'); await vanta(6);
        text('I hemlighet har kungen skrivit en protest till påven.'); await vanta(6);
      },
      // Slutet av september 1598. Efter Stångebro skriver kungen under i Linköping, och sedan äter han middag med hertig Karl på slottet.
      async linkoping() {
        const p = R.P.linkoping, K = B.K, cx = p.x + 0.3, cz = p.z + 2.5; Scene.setSeason(0.74);
        const mb = new V.MB(); mb.snow = 0; mb.box(0, 0, 0, 1.1, 0.3, 0.42, '#6b4a2c', { low: '#4f3620' }); mb.box(0, 0.3, 0, 1.16, 0.04, 0.48, '#f2eee2');
        const bord = B.mesh(mb); bord.position.set(cx, Geo.groundAt(cx, cz), cz); bord.scale.setScalar(K); Scene.scene.add(bord); tempM.push(bord);
        const ek = sigE(), g = { x: cx - 0.85, z: cz }; hooks.push(dt => ek.place(g.x, g.z, Math.PI / 2, 0, tid, dt, false, true)); skylt('Kung Sigismund', () => g, 1.8);
        const ka = karlE(), kg = { x: cx + 0.85, z: cz }; hooks.push(dt => ka.place(kg.x, kg.z, -Math.PI / 2, 0, tid, dt, false, true)); skylt('Hertig Karl', () => kg, 1.8);
        for (let i = 0; i < 4; i++) temp.push(Folk.add(cx + (i - 1.5) * 0.4, cz + (i % 2 ? 0.55 : -0.55), 'borgare', { ang: i % 2 ? Math.PI : 0 }));
        Scene.cam.lut = 58; Scene.jump(cx, cz + 1.2, 13); plats('Linköping, september 1598');
        await vanta(2); text('Kungen har förlorat vid Stångebro. Hertig Karl ställer sina villkor.'); await vanta(6.5);
        text('Tryck för att skriva under');
        await tryckN('Skriv under', 3, k => { L.spela('sorl'); if (k === 1) text(''); }, 15);
        text('Hären ska skickas hem, och kungen ska regera efter lag och ed.'); await vanta(6);
        L.spela('klart'); text('Sedan äter kungen och hertigen middag på Linköpings slott.'); await vanta(6.5);
      },
      // 29 juni 1561. Erik går från Uppsala slott till domkyrkan på en röd matta, och man bär själv fram de nya regalierna.
      async kroning() {
        const p = R.P.uppsala, K = B.K, S = V.Filmstad.stad('uppsala'); Scene.setSeason(0.47); if (S) stader.push(S);
        // från slottets port till domkyrkans västport, längs gatorna och runt husen (Johannes 2026-11-28: han gick genom byggnaderna)
        const bo = S && S.borg ? S.borg : [p.x + 2.4 * K, p.z - 1.5 * K], dm = S && S.dom ? S.dom : [p.x - 0.9 * K, p.z - 1.9 * K], ds = S ? S.domSkala : 0.72;
        const a0 = [bo[0], bo[1] + 1.0 * K], b0 = [dm[0] + 0.3 * ds * K, dm[1] + 1.1 * ds * K + 0.75];          // framför kyrkans långsida, så att kyrkan står bakom honom när regalierna bärs fram
        const a = S ? S.narmast(a0[0], a0[1]) : a0, b = S ? S.narmast(b0[0], b0[1]) : b0, vag = S ? S.vag(a, b) : [a, b], L0 = R.length(vag);
        // den röda mattan längs vägen, bit för bit
        { const mb = new V.MB(); mb.snow = 0; for (let i = 1; i < vag.length; i++) { const q = vag[i - 1], r = vag[i], l = Math.hypot(r[0] - q[0], r[1] - q[1]); if (l < 1e-3) continue; mb.push().move((q[0] + r[0]) / 2, Geo.groundAt((q[0] + r[0]) / 2, (q[1] + r[1]) / 2) + 0.015, (q[1] + r[1]) / 2).rotY(Math.atan2(r[0] - q[0], r[1] - q[1])); mb.box(0, 0, 0, 0.34, 0.02, l + 0.06, '#b3262a', { low: '#8a1f24' }); mb.pop(); } const m = B.mesh(mb); Scene.scene.add(m); tempM.push(m); }
        // vakterna med sköldarna på båda sidor om mattan, bara där det är fri gata
        for (let d = 0.9; d < L0 - 1.6; d += 1.05) { const q = R.along(vag, d); for (const s of [-1, 1]) { const x = q.x + Math.cos(q.ang) * 0.42 * s, z = q.z - Math.sin(q.ang) * 0.42 * s; if (!S || S.ledig(x, z)) temp.push(Folk.add(x, z, 'knekt', { pike: true, ang: q.ang - s * 1.571 })); } }
        const ek = erikE(false), g = { x: a[0], z: a[1], ang: R.along(vag, 0).ang, v: 0 }; hooks.push(dt => ek.place(g.x, g.z, g.ang, g.v, tid, dt, false, true)); skylt('Erik', () => g, 1.8);
        Scene.jump(a[0], a[1] + 1.5, 17); plats('Uppsala, 29 juni 1561');
        await vanta(2); text('Erik går från slottet till domkyrkan på en röd matta, under en himmel av röd sammet.'); await vanta(6);
        await akFard(vag, 0, L0 - 0.1, 0.6, 'Gå', 'Tryck för att gå till kyrkan', { kd: 16, ljud: 'steg', satt: (q, v) => { g.x = q.x; g.z = q.z; g.ang = q.ang; g.v = v; } });
        UI.film.knapp(null); I.tar = null; g.v = 0;
        text('Vakterna bär sköldar med hans valspråk: Gud ger åt vem han vill.'); await vanta(6);
        // regalierna: fyra kuddar på en bänk framför kungen, och på varje kudde läggs en sak fram när man trycker
        let rikt = 0; for (const r of [0, 0.6, -0.6, 1.2, -1.2, 1.571, -1.571]) { const q = [g.x + Math.sin(r) * 0.6, g.z + Math.cos(r) * 0.6]; if (!S || (S.ledig(q[0], q[1]) && S.ledig(q[0] + Math.cos(r) * 0.4, q[1] - Math.sin(r) * 0.4) && S.ledig(q[0] - Math.cos(r) * 0.4, q[1] + Math.sin(r) * 0.4))) { rikt = r; break; } }
        g.ang = rikt;          // kungen vänder sig mot kameran, och bänken med regalierna står framför honom, där gatan är fri
        const fx = Math.sin(g.ang), fz = Math.cos(g.ang), sx = Math.cos(g.ang), sz = -Math.sin(g.ang), bankX = g.x + fx * 0.6, bankZ = g.z + fz * 0.6;
        { const mb = new V.MB(); mb.snow = 0; mb.box(0, 0, 0, 0.9, 0.14, 0.2, '#6b4a2c', { low: '#4f3620' }); for (let i = 0; i < 4; i++) mb.box(-0.33 + i * 0.22, 0.14, 0, 0.18, 0.035, 0.15, '#7a1f2a', { low: '#5a1620' }); const m = B.mesh(mb); m.position.set(bankX, Geo.groundAt(bankX, bankZ), bankZ); m.rotation.y = g.ang; m.scale.setScalar(K * 0.75); Scene.scene.add(m); tempM.push(m); }
        const GULD = '#e8c040', GULDL = '#a8801e', BLA = '#2f5aa8', regal = [
          mb => { mb.cyl(0, 0, 0, 0.065, 0.07, 0.04, 10, GULD, { low: GULDL }); for (let k = 0; k < 8; k++) { const v = k / 8 * 6.283; mb.cone(Math.cos(v) * 0.065, 0.04, Math.sin(v) * 0.065, 0.014, 0.03, 4, GULD); } for (const r of [0, 1.571]) { mb.push().rotY(r); for (let k = 0; k <= 6; k++) { const v = k / 6 * 3.1416; mb.box(Math.cos(v) * 0.06, 0.04 + Math.sin(v) * 0.06, 0, 0.012, 0.012, 0.012, GULD); } mb.pop(); } mb.blob(0, 0.035, 0, 0.055, 0.03, 0.055, '#8a1f2a', { snow: 0 }); mb.blob(0, 0.112, 0, 0.016, 0.016, 0.016, BLA, { snow: 0 }); mb.box(0, 0.125, 0, 0.006, 0.03, 0.006, GULD); },          // kronan: sluten, med byglar över
          mb => { mb.push().rotZ(1.571); mb.cyl(0, -0.11, 0, 0.008, 0.008, 0.22, 6, GULD, { low: GULDL }); mb.blob(0, 0.115, 0, 0.018, 0.018, 0.018, GULD, { snow: 0 }); mb.pop(); },          // spiran
          mb => { mb.blob(0, 0.035, 0, 0.035, 0.035, 0.035, GULD, { low: GULDL, snow: 0 }); mb.box(0, 0.07, 0, 0.008, 0.035, 0.008, GULD); mb.box(0, 0.085, 0, 0.026, 0.008, 0.008, GULD); },          // äpplet med korset
          mb => { mb.box(0, 0.006, 0, 0.13, 0.012, 0.012, GULD, { low: GULDL }); mb.cyl(-0.075, 0, 0, 0.022, 0.022, 0.012, 8, GULD); mb.box(0.055, 0.006, 0.014, 0.02, 0.012, 0.03, GULD); }          // nyckeln
        ], namn = ['Kronan', 'Spiran', 'Äpplet', 'Nyckeln'];
        const namnSk = [], visa = k => { const mb = new V.MB(); mb.snow = 0; regal[k](mb); const m = B.mesh(mb), x = bankX + sx * (-0.33 + k * 0.22) * K * 0.75, z = bankZ + sz * (-0.33 + k * 0.22) * K * 0.75, y = Geo.groundAt(bankX, bankZ) + 0.18 * K * 0.75; m.position.set(x, y, z); m.rotation.y = g.ang; m.scale.setScalar(K * 1.6); Scene.scene.add(m); tempM.push(m); Fx.guld(x, y + 0.1, z, 18, 0.15); namnSk.push(skylt(namn[k], () => ({ x, z }), 0.45 + (k % 2) * 0.22)); return m; };
        Scene.cam.lut = 52; Scene.flyTo(bankX, bankZ + 0.3, 7.5, 2.5); await vanta(2.5);
        const delar = ['Kronan. En sluten krona har ingen kung i Norden haft förut.', 'Spiran.', 'Äpplet.', 'Nyckeln. Den finns inte i något annat land.'], visade = [];
        text('Tryck för att bära fram regalierna');
        const n = await tryckN('Bär fram', 4, k => { text(delar[k - 1]); L.spela('klocka'); visade.push(visa(k - 1)); }, 26);
        for (let k = n; k < 4; k++) { text(delar[k]); visade.push(visa(k)); await vanta(3); }
        await vanta(3.5); erikE(true); Scene.flyTo(g.x, g.z + 0.6, 10, 2); visade[0].visible = false; namnSk.forEach(q => q.bort()); Fx.guld(g.x, Geo.groundAt(g.x, g.z) + 0.8, g.z, 30, 0.4); L.spela('klart');
        text('Ärkebiskop Laurentius Petri predikar, och Erik svär sin ed på Bibeln.'); await vanta(7);
      },
      // 24 maj 1567, Uppsala slott. Allvarligt och lugnt: inget blod, bara det som hände. Ingen knapp att trycka på.
      async sturemord() {
        const p = R.P.uppsala, K = B.K, bx = p.x + 2.4 * K, bz = p.z - 1.5 * K; Scene.setSeason(0.4);
        Scene.jump(bx, bz + 2.2, 20); plats('Uppsala slott, 24 maj 1567');
        await vanta(2); text('Sturarna sitter fångna på slottet. Kungen besöker Svante Sture och ber honom om förlåtelse.'); await vanta(8);
        text('Sedan förlorar kungen all besinning.'); await vanta(6);
        UI.film.svart(0.65, 2); await vanta(2.5);
        text('Svante Sture och hans söner Nils och Erik dödas, och med dem Abraham Stenbock och Ivar Ivarsson.'); await vanta(8);
        text('Kungen flyr ut i landet. Ingen vet var han är.'); await vanta(7);
        UI.film.svart(0, 2); await vanta(1);
        text('Adeln i hela riket är skräckslagen.'); await vanta(7);
      },
      // 4 juli 1568. Kungen gifter sig med Karin Månsdotter inför alla. Man ringer själv i kyrkklockorna.
      async brollop() {
        const p = R.P.stockholm, K = B.K, st = V.Varld.tomt.stockholm, T = st && st.plan ? st.plan().torg : { x: 0, z: 0.2 }, cx = p.x + T.x * K, cz = p.z + T.z * K; Scene.setSeason(0.5);
        const ek = erikE(true), g = { x: cx - 0.25, z: cz - 0.55 }; hooks.push(dt => ek.place(g.x, g.z, 0, 0, tid, dt, false, true)); skylt('Kung Erik', () => g, 1.8);
        const karin = Folk.add(cx + 0.3, cz - 0.55, 'kvinna', { col: '#f2eee2', col2: '#8a1f24', sc: 1.3, ang: 0 }); temp.push(karin); skylt('Karin Månsdotter', () => karin, 1.6);
        const folk = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const u = Folk.add(cx + (i - 3) * 0.36, cz + 0.3 + r * 0.4, (i + r) % 3 ? 'borgare' : 'kvinna', { ang: Math.PI }); folk.push(u); temp.push(u); }
        Scene.cam.lut = 60; Scene.jump(cx, cz + 1.3, 14); plats('Stockholm, 4 juli 1568');
        await vanta(2); text('Kungen gifter sig med Karin Månsdotter, en knekts dotter. De har redan två barn, Sigrid och Gustav.'); await vanta(8);
        text('Tryck för att ringa i kyrkklockorna');
        await tryckN('Ring', 4, k => { L.spela('klocka'); folk.forEach((u, i) => { if (i % 4 === k % 4) { u.y = 0.1; setTimeout(() => { u.y = 0; }, 200); } }); if (k === 2) text(''); }, 18);
        text('Dagen efter kröns Karin till drottning.'); await vanta(6);
      },
      // 1516. Ärkebiskopen stängs in i sin borg Stäket. Man slår själv läger runt borgen, tält för tält, tills ringen är sluten.
      async staket() {
        const K = B.K, p = R.P.staket, ring = []; Scene.setSeason(0.75);
        for (let i = 0; i < 16; i++) { const a = 1.2 + i * 0.3927, x = p.x + Math.cos(a) * 3.3, z = p.z + Math.sin(a) * 2.7; if (Geo.sdAt(x, z) > 0.45) ring.push([x, z]); }          // bara på land: mot vattnet stänger sjön
        const per = Math.max(1, Math.ceil(ring.length / 6)); let satta = 0;
        const talt = () => { const q = ring[satta++]; if (!q) return; const mb = new V.MB(); B.talt(mb); const m = B.mesh(mb); m.position.set(q[0], Geo.groundAt(q[0], q[1]), q[1]); m.rotation.y = satta * 1.7; m.scale.setScalar(K); Scene.scene.add(m); tempM.push(m);
          const u = Folk.add(q[0] + (p.x - q[0]) * 0.16, q[1] + (p.z - q[1]) * 0.16, satta % 2 ? 'knekt' : 'bonde', { pike: true, ang: Math.atan2(p.x - q[0], p.z - q[1]) }); temp.push(u); Fx.damm(q[0], Geo.groundAt(q[0], q[1]), q[1], 5); };
        Scene.jump(p.x, p.z + 1.6, 25); plats('Stäket vid Mälaren, 1516');
        await vanta(2); text('Ärkebiskop Gustav Trolle håller på Danmarks kung. Sten Sture stänger in honom i hans borg.'); await vanta(7);
        text('Tryck för att slå läger runt borgen');
        await tryckN('Slå läger', 6, k => { for (let j = 0; j < per; j++) talt(); L.spela('hammare'); L.spela('trumma'); if (k === 2) text(''); }, 18);
        while (satta < ring.length) talt();
        text('Ingen kommer in och ingen ut. Nu är det bara att vänta.'); await vanta(6);
        text('Från Danmark kommer rykten: kungen tänker skicka soldater till hans hjälp.'); await vanta(6);
      },
      // November 1517. Riksmötet har avsatt ärkebiskopen, och alla sätter sitt sigill under brevet. Biskop Brask ska ha lagt en lapp under sitt.
      async sigill() {
        // På en öppen plats nära torget (Johannes 2026-11-28: "de står i husen och det är otydligt"): bordet med brevet i mitten, Sten Sture bakom det,
        // herrarna i en båge framför. Var och en går fram till bordet när man trycker, sätter sitt röda sigill och går tillbaka.
        const K = B.K, T = torgVid('stockholm'), tx = T.x, tz = T.z, gy = Geo.groundAt(tx, tz); Scene.setSeason(0.87);
        const bord = new V.MB(); bord.snow = 0; bord.box(0, 0, 0, 0.95, 0.3, 0.46, '#6b4a2c', { low: '#4f3620' }); bord.box(0, 0.3, 0, 0.7, 0.012, 0.36, '#efe3c6');
        const bm = B.mesh(bord); bm.position.set(tx, gy, tz); bm.scale.setScalar(K); Scene.scene.add(bm); tempM.push(bm);
        const st = { x: tx, z: tz - 0.62 }; hooks.push(dt => V.Gustav.place(st.x, st.z, 0, 0, tid, dt, false, true)); skylt('Sten Sture', () => st, 1.7);          // bakom bordet, vänd mot oss
        // sju herrar i en båge framför bordet, Brask sist (i biskopens violett)
        const herrar = [], hem = [];
        for (let i = 0; i < 7; i++) {
          const sid = i < 4 ? -1 : 1, rad = i < 4 ? i : i - 4; let x = tx + sid * (0.95 + (rad % 2) * 0.05), z = tz - 0.15 + rad * 0.36;          // på båda sidor om bordet, så att bordet syns
          if (!fritt(T, x, z)) { const q = T.S ? V.Filmstad.sok.narmast(T.S, x, z) : [x, z]; x = q[0]; z = q[1]; }
          const o = { ang: Math.atan2(tx - x, tz - z) }; if (i === 6) Object.assign(o, { col: '#6a2a7a', col2: '#f2eee2', sc: 1.12 });
          const u = Folk.add(x, z, 'borgare', o); herrar.push(u); hem.push([x, z, o.ang]); temp.push(u);
        }
        const sigill = k => { const mb = new V.MB(); mb.snow = 0; mb.cyl(-0.27 + k * 0.09, 0.312, 0.08, 0.04, 0.04, 0.018, 10, '#b8312a', { cap: '#c8423a' }); const m = B.mesh(mb); m.position.copy(bm.position); m.scale.setScalar(K); Scene.scene.add(m); tempM.push(m); Fx.guld(tx + (-0.27 + k * 0.09) * K, gy + 0.45, tz + 0.1, 10, 0.12); return m; };
        // en herre går fram, sätter sigillet och går tillbaka
        const fram = (i, klar) => { const u = herrar[i], [hx, hz, ha] = hem[i], mx = tx + (-0.27 + i * 0.09) * K, mz = tz + 0.55; let t = 0;
          const h = dt => { t += dt; const f = t < 0.5 ? t / 0.5 : t < 0.9 ? 1 : Math.max(0, 1 - (t - 0.9) / 0.5); u.x = hx + (mx - hx) * f; u.z = hz + (mz - hz) * f; u.gar = t < 0.5 || (t > 0.9 && t < 1.4); u.ang = t < 0.9 ? Math.atan2(mx - hx, mz - hz) : Math.atan2(hx - mx, hz - mz); if (t >= 0.5 && !h.satt) { h.satt = 1; klar(); } if (t >= 1.4) { u.x = hx; u.z = hz; u.ang = ha; u.gar = false; hooks = hooks.filter(q => q !== h); } };
          hooks.push(h); };
        // stadens eget folk kliver undan medan scenen går
        const undan = Folk.units.filter(u => u.vis && herrar.indexOf(u) < 0 && Math.hypot(u.x - tx, u.z - tz) < 3.5); undan.forEach(u => { u.vis = false; }); hooks.push(() => undan.forEach(u => { u.vis = false; }));
        Scene.cam.lut = 52; Scene.jump(tx, tz + 0.15, 8); plats('Stockholm, november 1517');
        await vanta(2); text('Mötet har bestämt: ärkebiskopen avsätts och hans borg ska rivas. Nu sätter alla sitt sigill under brevet.'); await vanta(8);
        text('Tryck för att sätta sigillen');
        const n = await tryckN('Sigill', 6, k => { fram(k - 1, () => { sigill(k - 1); L.spela('trumma'); }); if (k === 2) text(''); }, 20);
        for (let k = n; k < 6; k++) sigill(k);
        await vanta(1.6);
        // Brask: lappen syns en kort stund innan sigillet läggs över den
        const brask = skylt('Biskop Brask', () => herrar[6], 1.25); Scene.flyTo(tx + 0.35, tz + 0.15, 6.5, 1.6);
        let lapp = null; fram(6, () => { const mb = new V.MB(); mb.snow = 0; mb.box(0.27, 0.314, 0.08, 0.09, 0.004, 0.06, '#fffbe8'); lapp = B.mesh(mb); lapp.position.copy(bm.position); lapp.scale.setScalar(K); Scene.scene.add(lapp); tempM.push(lapp); setTimeout(() => { sigill(6); L.spela('trumma'); }, 900); });
        text('Det berättas att biskop Brask gömmer en lapp under sitt sigill: "Härtill är jag nödd och tvungen."'); await vanta(8); brask.bort();
        Scene.flyTo(tx, tz + 0.15, 8, 1.5);
        text('Den som har sitt sigill under brevet har varit med om att avsätta en ärkebiskop.'); await vanta(7);
        undan.forEach(u => { u.vis = true; });
      },
      // 1519: flykten från Kalø till Lübeck (dit kommer han i september). Båda orterna är byggda som spelets egna städer (filmstad.js): torg, gator, mur och hamn,
      // och den som går följer gatorna runt husen (Johannes 2026-11-28: han gick genom husen).
      async kalo() {
        const K = B.K, Fs = V.Filmstad, k = Geo.place(10.48, 56.3), lb = R.P.lubeck; Scene.setSeason(0.71);
        // ---- Kalø: slottet vid viken och byn norr om det ----
        const by = [k.x + 2.4, k.z - 6.0], ut = [k.x - 1.2, k.z - 9.2], port = [k.x, k.z + 1.5];
        const SK = Fs.bygg({ id: 'kalo', x: by[0], z: by[1], hamn: 1, steg: 3, vagar: [[by, [k.x + 0.4, k.z - 2.0]], [by, ut]], upptaget: [[k.x, k.z, 1.75 * K], [k.x + 2.2, k.z + 0.6, 0.5]], extraHinder: [{ x: k.x, z: k.z, w: 2.3 * K, d: 1.95 * K, a: 0 }, { x: k.x + 2.2, z: k.z + 0.6, r: 0.25 }] }); stader.push(SK);
        const mb = new V.MB(); B.borg(mb, 'liten', 0); const borg = B.mesh(mb); borg.position.set(k.x, Geo.groundAt(k.x, k.z), k.z); borg.scale.setScalar(K); Scene.scene.add(borg); tempM.push(borg);
        const fl = B.flagga('danmark'); fl.position.set(k.x + 2.2, Geo.groundAt(k.x + 2.2, k.z + 0.6), k.z + 0.6); fl.scale.setScalar(1.7); Scene.scene.add(fl); tempM.push(fl);
        SK.vandrare(7, ['bonde', 'kvinna', 'bonde', 'borgare'], [by[0], by[1], 6]);
        const ge = gustavE(), g = { x: port[0] - 0.25, z: port[1], ang: Math.PI, v: 0 }, visa = dt => ge.place(g.x, g.z, g.ang, g.v, tid, dt, false, true); ge.ang = g.ang; hooks.push(visa); skylt('Gustav Eriksson', () => g, 1.8);
        [[k.x + 0.35, k.z + 1.45], [k.x + 0.95, k.z + 1.4]].forEach(q => temp.push(Folk.add(q[0], q[1], 'dansk', { pike: true, ang: 0 })));          // vakterna vid porten ser ut över viken
        const flykt = SK.vag([g.x, g.z], ut);
        Scene.jump(k.x + 0.4, k.z + 1.6, 20); plats('Kalø slott i Danmark, 1519');
        await vanta(2); text('Gustav Eriksson har suttit fången här i nästan ett år.'); await vanta(6);
        await akFard(flykt, 0, R.length(flykt) - 0.2, 0.8, 'Rym', 'Tryck för att rymma', { kd: 17, ljud: 'steg', satt: (a, v) => { g.x = a.x; g.z = a.z; g.ang = a.ang; g.v = v; } });
        UI.film.knapp(null); I.tar = null; g.v = 0; text('Han tar sig till Lübeck, en fri och rik handelsstad i Tyskland.'); await vanta(5.5);
        UI.film.svart(1, 0.8); text(''); plats(''); await vanta(1.1); hooks = []; rensa();
        // ---- Lübeck: muren, porten i norr, torget med rådhuset och Marienkirche, hamnen ----
        let radP = null, kyrkP = null;
        const SL = Fs.bygg({ id: 'lubeck', x: lb.x, z: lb.z, hav: lb.hav, stor: 1, mur: 1, hamn: 1, steg: 9, utanStand: 1, port: -Math.PI / 2, vagar: [[[lb.x, lb.z], [lb.x, lb.z - 15]]],
          landmarken: (m, st) => {
            const T = st.T, lagg = (u, v, th, fn, w, d) => { const [x, z] = st.UV(u, v); m.push().move(x, st.t.y(x, z), z).rotY(th); fn(m); m.pop(); const W = st.world(x, z); st.hinder.push({ x: W[0], z: W[1], w: w * K, d: d * K, a: th }); const r = Math.max(w, d) / 2; for (let f = -1; f <= 1; f++) { const ax = Math.cos(th) * f * (w / 2 - Math.min(w, d) / 2), az = -Math.sin(th) * f * (w / 2 - Math.min(w, d) / 2); st.t.take(x + ax, z + az, Math.min(w, d) / 2 + 0.25); } return W; };
            kyrkP = lagg(-(T.TU + 1.35), 0, Math.atan2(T.vz, -T.vx), Fs.marienkirche, 3.6, 1.8);
            radP = lagg(0, -(T.TV + 0.8), Math.atan2(T.vx, T.vz), Fs.radhus, 1.75, 0.95);
          } }); stader.push(SL);
        const Tg = SL.torg(), vx = Tg.vx, vz = Tg.vz;
        { const h = lb.hav, dl = Math.hypot(h.x - lb.x, h.z - lb.z) || 1, ux = (h.x - lb.x) / dl, uz = (h.z - lb.z) / dl; for (let i = 0; i < 3; i++) { const s = V.skepp('lubeck'); s.scale.setScalar(2.1); const f = 2.2 + i * 1.6, sd = (i - 1) * 2.2; s.position.set(h.x + ux * f - uz * sd, 0.02, h.z + uz * f + ux * sd); s.rotation.y = Math.atan2(-uz, ux) + i * 0.3; Scene.scene.add(s); tempM.push(s); } }          // skepp på redden utanför hamnen
        // rådet står framför rådhuset, vänt mot torget
        const radV = -Tg.TV * 0.35, rad = []; for (let i = 0; i < 5; i++) { const [x, z] = SL.UV((i - 2) * 0.32, radV / K); const u = Folk.add(x, z, 'borgare', { ang: Math.atan2(vx, vz), col: i === 2 ? '#2a2a2a' : undefined }); rad.push(u); temp.push(u); }
        SL.undvik = [[(rad[2].x + SL.UV(0, radV / K + 1.0)[0]) / 2, (rad[2].z + SL.UV(0, radV / K + 1.0)[1]) / 2, 2.2]];          // folket går runt mötet, inte genom det
        SL.vandrare(10, ['borgare', 'kvinna', 'borgare', 'bonde'], [Tg.x, Tg.z, 7.5]);
        const fram = SL.UV(0, radV / K + 1.0), pt = SL.port, inv = SL.vag([pt.ute[0], pt.ute[1]], fram);
        g.x = pt.ute[0]; g.z = pt.ute[1]; g.ang = Math.PI; g.v = 0; ge.ang = g.ang; hooks.push(visa);
        Scene.jump(pt.x, pt.z + 1.6, 19); UI.film.svart(0, 1.2); plats('Lübeck, hösten 1519');
        await vanta(1.5);
        await akFard(inv, 0, R.length(inv) - 0.1, 0.9, 'Gå', 'Tryck för att gå in i staden', { kd: 17, ljud: 'steg', satt: (a, v) => { g.x = a.x; g.z = a.z; g.ang = a.ang; g.v = v; } });
        UI.film.knapp(null); I.tar = null; g.v = 0; g.ang = Math.atan2(-vx, -vz); const radSkylt = skylt('Lübecks råd', () => rad[2], 1.35);
        Scene.cam.lut = 58; Scene.flyTo((g.x + rad[2].x) / 2, (g.z + rad[2].z) / 2 + 0.4, 15, 2.5);          // brantare, så att husen framför torget inte skymmer
        await vanta(2.5); text('Slottsherren från Kalø kommer efter och kräver att få honom tillbaka.');
        const jagare = Folk.add(pt.ute[0], pt.ute[1], 'dansk', { pike: true, gar: true }); temp.push(jagare); skylt('Slottsherren', () => jagare, 1.35);
        const jv = SL.vag(pt.ute, SL.UV(0.75, radV / K + 1.05)), jL = R.length(jv); let jd = 0;
        hooks.push(dt => { if (jd < jL) { jd = Math.min(jL, jd + dt * 1.1); const a = R.along(jv, jd); jagare.x = a.x; jagare.z = a.z; jagare.ang = a.ang; } else { jagare.gar = false; jagare.ang = Math.atan2(-vx, -vz); } });
        await new Promise(r => { const h = () => { if (jd >= jL) { hooks = hooks.filter(q => q !== hh); r(); } }, hh = dt => h(); hooks.push(hh); vanta(14).then(() => { jd = jL; r(); }); });
        await vanta(4.5); L.spela('klart'); rad.forEach((u, i) => setTimeout(() => { u.y = 0.08; setTimeout(() => { u.y = 0; }, 180); }, i * 90)); text('Lübecks råd svarar nej. Gustav får stanna i staden.'); await vanta(7);
        radSkylt.bort();
      },
      // Februari 1520. Sten Sture körs hem i släde över Mälarens is och dör på vägen.
      async isen() {
        const a0 = R.P.strangnas, a1 = R.P.stockholm, rak = [[a0.x, a0.z], [a1.x, a1.z]], l0 = R.length(rak), Bu = V.Bud, sk = Bu.g.scale.x; Scene.setSeason(0.09); V.Gustav.g.visible = false;
        let skift = 0; for (let f = 0.28; f <= 0.76; f += 0.04) { const a = R.along(rak, l0 * f); let s = 0; while (s < 5 && Geo.sdAt(a.x, a.z - s) > -1.4) s += 0.4; skift = Math.max(skift, s); }          // ut på öppen is, norr om stranden
        const p0 = R.along(rak, l0 * 0.28), p1 = R.along(rak, l0 * 0.76), pts = [[p0.x, p0.z - skift], [p1.x, p1.z - skift]], d0 = 0, d1 = R.length(pts);
        const sl = slade(); sl.scale.setScalar(sk); Scene.scene.add(sl); tempM.push(sl); skylt('Sten Sture', () => ({ x: sl.position.x, z: sl.position.z, gy: sl.position.y }), 0.95);
        const lagg = (a, v, t, dt) => {
          if (aka) { aka.ork = Math.max(0.3, 1 - (aka.d - d0) / (d1 - d0) * 0.85); aka.fartX = 0.8 * aka.ork; if (aka.ork <= 0.3) aka.d1 = aka.d; }          // hästen går tyngre och tyngre, och till sist står släden still
          Bu.place(a.x, a.z, a.ang, v * (aka ? aka.ork : 1), t, dt, false); Bu.g.userData.ring.visible = false;
          const bx = a.x - Math.sin(a.ang) * 1.15 * sk, bz = a.z - Math.cos(a.ang) * 1.15 * sk; sl.position.set(bx, Math.max(0.02, Geo.groundAt(bx, bz)) + 0.01, bz); sl.rotation.y = a.ang;
        };
        const s = R.along(pts, d0); Bu.ang = s.ang; lagg(s, 0, tid, 0.016); Scene.jump(s.x, s.z + 1.5, 19); plats('Mälarens is, februari 1520');
        let slut = s; hooks.push(dt => { if (!aka) lagg(slut, 0, tid, dt); });
        await vanta(2); text('En kanonkula har träffat Sten Sture i benet. Hans här är slagen, och han körs hem mot Stockholm i släde.'); await vanta(7.5);
        hooks = []; await akFard(pts, d0, d1, 1, 'Kör', 'Tryck för att köra', { kd: 18, ljud: 'hov', satt: lagg });
        UI.film.knapp(null); I.tar = null; slut = { x: Bu.x, z: Bu.z, ang: Bu.ang }; hooks.push(dt => lagg(slut, 0, tid, dt));
        L.spela('klocka'); text('Den 3 februari dör Sten Sture på isen.'); await vanta(7);
        text('På Stockholms slott tar hans hustru Kristina Gyllenstierna befälet.'); await vanta(7);
      },
      // Sommaren 1520. Kristina Gyllenstierna håller Stockholm och står själv på vallen. Sedan kommer brevet om nåd.
      async vallen() {
        const sth = R.P.stockholm, K = B.K, kr = V.Varld._kristina, kx = kr ? kr.x : sth.x + 1.9 * K, kz = kr ? kr.z : sth.z - 0.5 * K, gy = Geo.groundAt(kx, kz); Scene.setSeason(0.55);
        const folk = [], stall = (x, z, slag, o) => { const u = Folk.add(x, z, slag, o); folk.push(u); temp.push(u); };
        for (let j = 0; j < 4; j++) for (const s of [-1, 1]) stall(kx + s * (0.6 + j * 0.56), kz + 0.04 + (j % 2) * 0.14, j % 2 ? 'borgare' : 'knekt', { pike: j % 2 === 0, ang: 0 });          // i rad framför slottsmuren, där hon står
        for (let i = 0; i < 4; i++) stall(kx - 3.1 - (i % 2) * 0.5, kz + 0.5 + Math.floor(i / 2) * 0.5, i % 2 ? 'knekt' : 'borgare', { pike: i === 1, ang: 1.3 });
        Scene.jump(kx - 0.4, kz + 2.0, 19); plats('Stockholms slott, sommaren 1520'); skylt('Kristina', () => kr || { x: kx, z: kz }, 1.5);
        await vanta(2); text('September 1520. Stockholm har hållit ut hela sommaren, men ingen hjälp har kommit.'); await vanta(7);
        if (!V.Game.s.aktivt || !V.Game.s.aktivt.val) {          // spelas scenen för sig själv (?scen=vallen) manar man som förut
        text('Tryck för att mana dem');
        await tryckN('Mana', 8, k => {
          L.spela('sorl'); folk.forEach((u, i) => { if (i % 3 === k % 3) { u.y = 0.1; setTimeout(() => { u.y = 0; }, 170); } }); if (kr) { kr.y = 0.12; setTimeout(() => { kr.y = 0; }, 200); }
          if (k % 2 === 0) { Fx.krut(kx + 1.6, gy + 1.3, kz - 1.2); L.spela('kanon'); Scene.shake(0.16); } if (k === 3) text('');
        }, 18);
        }
        L.spela('klocka'); text('Den 5 september lovar Kristian i ett brev att ingen ska straffas.'); await vanta(7);
      },
      // 31 maj 1520: Lübeck hjälper honom hem över havet, och han går i land vid Kalmar
      async kalmar() {
        const km = R.P.kalmar, alla = R.seaPath('lubeck', 'kalmar'), L0 = R.length(alla), d0 = Math.max(0, L0 - 26); Scene.setSeason(0.4);
        const s = V.skepp('lubeck'); s.scale.setScalar(2.1); Scene.scene.add(s); tempM.push(s);
        const satt = a => { s.position.set(a.x, 0.02 + Math.sin(tid * 1.4) * 0.03, a.z); s.rotation.y = a.ang; s.rotation.z = Math.sin(tid * 1.2) * 0.05; };
        const a0 = R.along(alla, d0); satt(a0); Scene.jump(a0.x, a0.z + 2, 40); plats('Kalmarsund, maj 1520'); hooks.push(() => { if (!aka) satt(R.along(alla, d0)); });
        await vanta(2); text('Lybska köpmän hjälper honom hem över havet.'); await vanta(7);
        hooks = []; await akFard(alla, d0, L0 - 0.8, 1.5, 'Segla', 'Tryck för att segla', { kd: 40, ljud: 'vag', satt });
        UI.film.knapp(null); I.tar = null; const slut = R.along(alla, L0 - 0.8); hooks.push(() => satt(slut));
        const h = km.hav || km; let gx = h.x, gz = h.z; for (let k = 0; k < 40 && Geo.sdAt(gx, gz) < 0.35; k++) { gx += (km.x - h.x) * 0.04; gz += (km.z - h.z) * 0.04; }
        const ge = gustavE(), g = { x: gx, z: gz, ang: Math.atan2(km.x - gx, km.z - gz) }; ge.ang = g.ang;
        hooks.push(dt => { g.x += Math.sin(g.ang) * dt * 0.4; g.z += Math.cos(g.ang) * dt * 0.4; ge.place(g.x, g.z, g.ang, 0.45, tid, dt, false, true); }); Scene.flyTo(gx, gz + 1.6, 24, 3);
        plats('Kalmar, 31 maj 1520'); text('Han går i land vid Stensö udde, strax utanför Kalmar.'); await vanta(7);
        text('Han är hemma. Men Sten Sture är död, och Kristians armé står utanför Stockholm.'); await vanta(7.5);
      }
    },
    async scen(namn, klar, tvinga) {
      // Ingen scen för nära den förra: har det inte gått två minuters spelande hoppas den över (Johannes 2026-11-26: "man måste ha
      // spelat ett tag innan en ny film kan visas"). tvinga = spela ändå (?scen=namn, för prov och skärmbilder).
      const Sp = V.Game.s; if (!I.scener[namn] || I.aktiv || (!tvinga && Sp.scenT !== undefined && Sp.t - Sp.scenT < MELLAN)) { if (klar) klar(); return; }
      Sp.scenT = Sp.t; Sp.sistaScen = namn;
      UI = V.UI; L = V.Ljud; I.aktiv = true; I.spelade++; I.nu = namn; autoT = 0; I.scenFart = Math.min(6, +new URLSearchParams(location.search).get('snabb') || 1);
      if (V.Varld.popKlart) V.Varld.popKlart();
      if (V.Musik) V.Musik.spar(V.Musik.har(namn) ? namn : { staket: 'krig', gisslan: 'krig', vallen: 'krig', kalo: 'vinter', isen: 'vinter', kalmar: 'vinter' }[namn]);          // varje scen har sitt eget spår
      const c = Scene.cam, hem = { x: c.x, z: c.z, d: c.d }; c.locked = true; c.fly = null; c.fri = true; UI.visa(false); UI.dolj(); UI.textBort(); UI.film.pa(true); L.spela('klocka');
      const Bu = V.Bud, budSyns = Bu.g.visible; if (namn !== 'isen') Bu.g.visible = false; const Hj = V.Gustav, hjSyns = Hj.g.visible; if (V.Game.s.varld >= 2) Hj.g.visible = false; V.Varld.scenDolj(true);          // budet hör inte hemma i scenen (på isen är det hästen som drar släden)
      try { await I.scener[namn](); } catch (e) { console.error(e); }
      I._slapp(); UI.film.knapp(null); I.tar = null; text(''); plats(''); await new Promise(r => setTimeout(r, 950));          // sista raden tonar bort innan rutan kommer (i riktig tid, också i snabbspolning)
      Bu.g.visible = budSyns; if (V.Game.s.varld >= 2) V.Gustav.g.visible = hjSyns; V.Varld.scenDolj(false); c.lut = 0; hooks = []; waits = []; aka = null; I.tar = null; I.nu = null; UI.film.knapp(null); [GE, EE, JE, SE, KE].forEach(e => { if (e) e.g.visible = false; }); if (V.Musik) V.Musik.spar(V.Musik.grund()); rensa(); text(''); plats(''); UI.film.svart(0, 0.6); UI.film.pa(false); UI.visa(true); c.locked = false; c.fri = false; Scene.jump(hem.x, hem.z, Math.max(hem.d, 32)); I.aktiv = false; I.scenFart = 1; I.hoppar = false; hoppKnapp(); if (klar) klar();
    },
    slut(klar) { I.ifilm = false; I.hoppar = false; I._slapp(); hoppKnapp(); hooks = []; waits = []; rensa(); aka = null; I.tar = null; regn = false; UI.film.knapp(null); UI.film.tal(null); UI.film.text(''); UI.film.plats(''); UI.film.svart(0, 1); UI.film.pa(false); Fx.sno = true; V.Varld._ruttKlar = false; V.Varld._ruttKey = null; klar(); },
    update(dt, t) {
      skyltar.forEach(s => { const p = s.var_(), sp = p ? Scene.screenPoint(p.x, (p.gy !== undefined ? p.gy : Geo.groundAt(p.x, p.z)) + s.h, p.z) : null; if (!sp || sp.behind) { s.e.style.display = 'none'; return; } s.e.style.display = ''; const w = s.e.offsetWidth / 2 + 6, x = Math.max(w, Math.min(innerWidth - w, sp.x)); s.e.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%, -100%)'; });
      tid = t; const fart = I.hoppar ? 400 : I.aktiv ? (I.scenFart || 1) : (I.fart || 1); hoppKnapp();
      for (let k = waits.length - 1; k >= 0; k--) { waits[k].t -= dt * fart; if (waits[k].t <= 0) { const w = waits.splice(k, 1)[0]; w.r(); } }
      hooks.slice().forEach(h => h(I.aktiv || I.hoppar ? dt * fart : dt)); stader.forEach(s => s.update(I.aktiv || I.hoppar ? dt * fart : dt));
      if (regn) { const c = Scene.cam, n = Math.round(dt * 240); for (let k = 0; k < n; k++) Fx.spawn({ x: c.x + (Math.random() - 0.5) * c.d * 1.6, y: c.gy + 3 + Math.random() * 6, z: c.z + (Math.random() - 0.7) * c.d * 1.2, vx: 1.2, vy: -11, vz: 0.4, size: 0.03 + c.d * 0.0012, r: 0.7, gr: 0.76, b: 0.86, a: 0.5, max: 0.9, golv: 1, fade: 0 }); }
      if ((I.aktiv || I.ifilm) && fart > 1 && I.tar) { autoT += dt; if (autoT > 0.08) { autoT = 0; I.tar(); } }          // i snabbspolning (provet) trycker scenen själv
      if (aka) {
        aka.v = Math.max(0, aka.v - 0.75 * dt); aka.d = Math.min(aka.d1, aka.d + aka.v * aka.fartX * dt * (I.aktiv || I.hoppar ? fart : 1)); aka.stilla += dt;
        const a = R.along(aka.pts, aka.d); if (aka.satt) aka.satt(a, aka.v / 3.4, t, dt); else V.Gustav.place(a.x, a.z, a.ang, aka.v / 3.4, t, dt, false);
        V.Varld.friExtra = [[a.x, a.z, 1.1]];
        { const sk = aka.sikt; Scene.cam.fly = null; Scene.cam.tx = sk ? (a.x + sk[0]) / 2 : a.x; Scene.cam.tz = (sk ? (a.z + sk[1]) / 2 : a.z) + 1.5; Scene.cam.td = aka.kd; }          /* sikt = kameran håller både den som far och målet i bild */
        if (aka.rader && aka.radNr < aka.rader.length && aka.d >= aka.rader[aka.radNr][0]) { const r = aka.rader[aka.radNr++]; if (r[1] !== null) UI.film.plats(r[1]); UI.film.text(r[2]); aka.radT = 7; aka.stilla = 0; }          // en rad om det man just åker förbi
        if (aka.radT > 0) { aka.radT -= dt; if (aka.radT <= 0) UI.film.text(''); }
        else if (aka.stilla > 5) { UI.film.text(aka.rad); aka.stilla = 0; } else if (aka.v > 1.5 && aka.d > aka.d0 + 2) UI.film.text('');
        if (aka.d >= aka.d1) { const r = aka.res; aka = null; r(); }
      } else if (V.Varld.friExtra) {
        V.Varld.friExtra = GE && GE.g.visible ? [[GE.x, GE.z, 1.0]] : null;
      }
    }
  };
})();
