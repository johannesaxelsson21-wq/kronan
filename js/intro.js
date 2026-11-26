// Introt: Stockholms blodbad, flykten till Dalarna och skidfärden mot Norge.
// En kort film som inte går att hoppa över. Spelaren får trycka, men kan inte stoppa det som sker.
// Varje rad bygger på docs/historia.md.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, R = V.Rike, Scene = V.Scene, Fx = V.Fx, Folk = V.Folk, B = V.Bygge;
  let UI, L, waits = [], hooks = [], temp = [], tempM = [], regn = false, aka = null, tid = 0;
  const vanta = s => new Promise(r => waits.push({ t: s, r }));
  const text = t => UI.film.text(t), plats = t => UI.film.plats(t);
  function gubbar(n, cx, cz, slag, rad) { const list = []; for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, d = 0.5 + Math.random() * (rad || 2); const u = Folk.add(cx + Math.cos(a) * d, cz + Math.sin(a) * d * 0.8, slag); list.push(u); temp.push(u); } return list; }
  let skyltar = [];
  function rensa() { temp.forEach(u => Folk.remove(u)); temp = []; tempM.forEach(m => Scene.scene.remove(m)); tempM = []; skyltar.forEach(s => s.e.remove()); skyltar = []; }
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
  function gustavE() { if (!GE) { GE = Object.create(V.Gustav); GE.init(Scene.scene, 'gustav'); } GE.g.visible = true; GE.utanRing = false; return GE; }
  // Spelaren trycker n gånger på knappen (eller väntar ut tiden). vid(k) körs för varje tryck. Löfte som blir klart när det är gjort.
  function tryckN(knapp, n, vid, sek) {
    return new Promise(res => {
      let k = 0, klar = false; const slut = () => { if (klar) return; klar = true; UI.film.knapp(null); I.tar = null; res(k); };
      UI.film.knapp(knapp, () => I.tar && I.tar()); I.tar = () => { if (klar) return; k++; vid(k); if (k >= n) slut(); }; vanta(sek || 20).then(slut);
    });
  }
  const I = V.Intro = {
    tar: null, fart: +new URLSearchParams(location.search).get('introfart') || 1,          // ?introfart=4 spolar filmen (för prov)
    // Titelskärmen för ett helt nytt spel. Sedan börjar förspelet direkt.
    titel(klar) {
      UI = V.UI; L = V.Ljud; Scene.cam.locked = true; UI.visa(false); UI.film.svart(1, 0);
      UI.film.text('<span class="titel">Kronan</span><span class="under">Sveriges regenter, en värld i taget</span>'); document.getElementById('film-text').classList.add('mitt');
      UI.film.knapp('Börja', () => { UI.film.knapp(null); document.getElementById('film-text').classList.remove('mitt'); text(''); UI.film.svart(0, 2.5); Scene.cam.locked = false; klar(); });
    },
    // Gustavs värld börjar med filmen om blodbadet.
    kor(klar) {
      UI = V.UI; L = V.Ljud; Scene.cam.locked = true; UI.visa(false); UI.film.svart(1, 0);
      const sth = R.P.stockholm; Scene.setSeason(0.835); Scene.jump(sth.x - 8, sth.z + 9, 120); Fx.sno = false;
      UI.film.text('<span class="under">Två månader efter att portarna öppnades</span>'); document.getElementById('film-text').classList.add('mitt');
      UI.film.knapp('Fortsätt', () => { UI.film.knapp(null); document.getElementById('film-text').classList.remove('mitt'); text(''); I.film(klar).catch(e => { console.error(e); I.slut(klar); }); });
    },
    async film(klar) {
      const sth = R.P.stockholm, K = B.K, slott = { x: sth.x + 2.6 * K, z: sth.z - 2.2 * K };
      UI.film.pa(true); gubbar(12, sth.x, sth.z + 0.5, 'borgare', 3); if (V.Musik) V.Musik.spar('blodbadet');
      await vanta(0.6);
      // ---- Stockholm, november 1520 ----
      UI.film.svart(0.32, 3); plats('Stockholm, november 1520'); Scene.flyTo(sth.x + 1, sth.z + 2, 46, 15); regn = true;
      await vanta(2.5); text('Den 4 november kröns Kristian II till Sveriges kung. Kronan sätts på hans huvud av ärkebiskop Gustav Trolle.'); for (let k = 0; k < 6; k++) setTimeout(() => L.klockton(k % 2 ? 294 : 392, undefined, 0.16), k * 700);
      await vanta(8); text('I tre dagar firar kungen med rikets främsta på slottet. Han har lovat att ingen ska straffas.');
      await vanta(7.5); plats('Slottet, 7 november'); Scene.flyTo(slott.x, slott.z + 2.5, 22, 5); text('Mitt på dagen stängs portarna.');
      await vanta(2.6); L.spela('port'); Scene.shake(0.5); UI.film.svart(0.46, 1.5);
      await vanta(4); text('Ärkebiskopen anklagar dem som avsatte honom och rev hans borg. Han kallar dem kättare: fiender till kyrkan.');
      await vanta(8); text('Kungens löfte gäller inte den som kyrkan dömer. Nästa dag dömer fjorton kyrkomän dem alla.');
      await vanta(8.5); plats('Stortorget, 8 november'); Scene.flyTo(sth.x - 0.5, sth.z + 2, 17, 5); text('');
      await vanta(3);
      // räkningen går av sig själv. Trycker man händer ingenting, bara ett dovt slag.
      I.tar = () => L.spela('trumma');
      const namn = { 1: 'Biskop Mattias av Strängnäs', 2: 'Biskop Vincent av Skara', 7: 'Erik Johansson, Gustavs far', 12: 'Joakim Brahe, hans svåger', 20: 'Rikets herrar', 36: 'Stockholms borgmästare och råd', 56: 'Tjänare och drängar' };
      for (let n = 1; n <= 82; n++) {
        UI.film.tal(n); if (namn[n]) text(namn[n]); if (n <= 12 || n % 4 === 0) L.spela('klocka');
        await vanta(n <= 2 ? 2.2 : n <= 12 ? 0.75 : n <= 40 ? 0.24 : 0.14);
      }
      text('Åttiotvå, räknar bödeln.'); await vanta(5.5);
      UI.film.tal(null); I.tar = null; plats('Södermalm, 10 november'); Scene.flyTo(sth.x - 1, sth.z + 7, 30, 5); text('Kropparna bränns på Södermalm.');
      const bal = { x: sth.x - 1.5, z: sth.z + 8.5 }; hooks.push(dt => { if (Math.random() < dt * 26) Fx.spawn({ x: bal.x + (Math.random() - 0.5) * 0.8, y: Geo.groundAt(bal.x, bal.z) + 0.2, z: bal.z + (Math.random() - 0.5) * 0.6, vx: 0.5 + Math.random() * 0.3, vy: 1.1 + Math.random() * 0.7, vz: 0.1, size: 0.35, grow: 0.7, r: 0.1, gr: 0.09, b: 0.09, a: 0.6, max: 4.5 }); if (Math.random() < dt * 14) Fx.gnista(bal.x, Geo.groundAt(bal.x, bal.z) + 0.15, bal.z); });
      await vanta(7); UI.film.svart(1, 2); text(''); plats(''); await vanta(2.3);
      // ---- Räfsnäs ----
      hooks = []; rensa(); regn = false; const raf = R.P.rafsnas; Scene.setSeason(0.87); Scene.jump(raf.x, raf.z + 1.5, 20);
      V.Gustav.place(raf.x, raf.z, 2.2, 0, 0, 1, false); V.Gustav.g.visible = true; Scene.flyTo(raf.x, raf.z + 1, 13, 14);
      // Filmen fortsätter där förspelet slutade: han kom hem över havet i maj. Den berättar inte om gisslan och Lübeck en gång till.
      UI.film.svart(0.2, 2.5); plats('Räfsnäs vid Mälaren, november 1520'); await vanta(2.2); text('Gustav Eriksson kom hem över havet i maj. Nu är han på sin fars gård Räfsnäs.');
      await vanta(7); text('Hit når budet om blodbadet. Hans far är en av de döda, och kungens män letar efter honom.');
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
      gard(rank); gard(isala);
      const start = [rank.x + 5, rank.z + 22], talplats = [mora.x - 0.4, mora.z + 3.4];
      const ben1 = Wv._runt([start, [rank.x, rank.z + 0.9]], null, null, true), ben2 = Wv._runt([[rank.x, rank.z + 0.9], [isala.x, isala.z + 0.9]], null, null, true);
      const ben3 = Wv._runt([[isala.x, isala.z + 0.9], [ratt.x + 0.3, ratt.z + 3.0]].concat(R.path('rattvik', 'mora').filter(q => !nara(q, mora, 3.6) && !nara(q, ratt, 3.2)), [talplats]), null, null, true);
      const ben4 = Wv._runt([talplats].concat(R.path('mora', 'salen').filter(q => !nara(q, mora, 3.6))), null, null, true), L4 = R.length(ben4);
      const stanna = (ben) => { const a = R.along(ben, R.length(ben)); hooks.push(dt => V.Gustav.place(a.x, a.z, a.ang, 0, tid, dt, false)); return a; };
      const a0 = R.along(ben1, 0); V.Gustav.place(a0.x, a0.z, a0.ang, 0, 0, 1, false); Scene.jump(a0.x, a0.z + 1.5, 19); UI.film.svart(0, 1.6);
      // första benet: till Rankhyttan, där han tar tjänst som dräng
      await akFard(ben1, 0, R.length(ben1), 1.05, 'Åk', 'Tryck för att åka', { rader: [[0.3, 'Dalarna, november 1520', 'Vad som hände på vägen vet vi genom berättelser.']] });
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
      await akFard(ben4, 0, L4 - 1.5, 1.05, 'Åk', 'Tryck för att åka', { rader: [[0.5, '', 'Han ger upp och åker västerut, mot Norge.'], [L4 - 9, 'Sälen', 'Två skidlöpare från Mora hinner upp honom.']] });
      UI.film.knapp(null); I.tar = null;
      await new Promise(res => hooks.push(dt => { let klara = 0; jag.forEach((j, k) => { const mal = L4 - 2.4 - k * 0.7; if (j.d < 0) j.d = L4 - 12 - k * 1.2; j.d = Math.min(mal, j.d + 6 * dt); const a = R.along(ben4, j.d); j.u.x = a.x + k * 0.3; j.u.z = a.z; j.u.ang = a.ang; if (j.d >= mal) { klara++; j.u.gar = false; j.u.lean = 0; } }); if (klara === 2) { hooks = []; res(); } }));
      plats('Sälen'); text('Budet om blodbadet har nått Dalarna. Mora har ändrat sig.'); await vanta(6.5);
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
      // September 1518. Kristian kräver sex svenskar som säkerhet för en förhandling. När de är ombord seglar han hem med dem.
      async gisslan() {
        const sth = R.P.stockholm, hav = sth.hav || sth, bort = R.seaPath('stockholm', 'kalmar'); let sx = hav.x, sz = hav.z, d = 0;
        for (let k = 0; k < 60 && Geo.sdAt(sx - 0.3, sz) < -0.45; k++) sx -= 0.3;          // stranden nedanför staden
        Scene.setSeason(0.7);
        const skepp = [0, 1, 2].map(() => { const s = V.skepp('danmark'); s.scale.setScalar(2.1); Scene.scene.add(s); tempM.push(s); return s; });
        const lagg = () => skepp.forEach((s, i) => { const a = R.along(bort, 8.5 + d + i * 2.4); s.position.set(a.x + Math.cos(a.ang) * ((i % 2) - 0.5) * 1.4, 0.02 + Math.sin(tid * 1.4 + i) * 0.03, a.z - Math.sin(a.ang) * ((i % 2) - 0.5) * 1.4); s.rotation.y = a.ang; });
        lagg(); const forst = skepp[0].position, pts = [[sx, sz], [forst.x, forst.z]];
        const bat = V.skepp('sverige'); bat.scale.setScalar(0.95); bat.position.set(sx, 0.02, sz); bat.rotation.y = Math.atan2(forst.x - sx, forst.z - sz); Scene.scene.add(bat); tempM.push(bat);
        const sex = []; for (let i = 0; i < 5; i++) { const u = Folk.add(sx - 1.0 - (i % 3) * 0.32, sz - 0.25 + Math.floor(i / 3) * 0.38, 'borgare', { ang: 1.6 }); sex.push(u); temp.push(u); }
        const ge = gustavE(), star = dt => ge.place(sx - 1.72, sz + 0.2, 1.6, 0, tid, dt, false, true); ge.ang = 1.6; ge.utanRing = true; hooks.push(star); const gs = skylt('Gustav Eriksson', () => ({ x: sx - 1.72, z: sz + 0.2 }), 1.8);          // den sjätte är Gustav Eriksson, 22 år
        Scene.jump((sx + forst.x) / 2, sz + 2.4, 30); plats('Stockholm, september 1518'); hooks.push(lagg);
        await vanta(2); text('Kristian har förlorat slaget och vill förhandla. Hans bud kräver sex svenska herrar ombord på skeppen, som säkerhet.'); await vanta(8.5);
        sex.forEach(u => Folk.remove(u)); temp = temp.filter(u => sex.indexOf(u) < 0); hooks = hooks.filter(h => h !== star); ge.g.visible = false; gs.bort();
        await akFard(pts, 0, R.length(pts) - 0.9, 0.7, 'Skicka', 'Tryck för att skicka ut dem', { kd: innerWidth < innerHeight ? 31 : 27, sikt: [forst.x, forst.z], ljud: 'vag', satt: a => { bat.position.set(a.x, 0.02 + Math.sin(tid * 2) * 0.02, a.z); bat.rotation.y = a.ang; } });
        UI.film.knapp(null); I.tar = null; Scene.scene.remove(bat); L.spela('nej'); text('När de sex är ombord hissar Kristian segel.');
        hooks.push(dt => { d = Math.min(26, d + dt * 1.5); const c = Scene.cam, f = Math.min(1, dt * 1.2); c.tx += (forst.x - c.tx) * f; c.tz += (forst.z + 2 - c.tz) * f; c.td = 36; });
        await vanta(6); text('Det blir inget möte. De sex förs till Danmark som fångar. En av dem är Gustav Eriksson, 22 år.'); await vanta(8.5);
      },
      // 1516. Ärkebiskopen stängs in i sin borg Stäket. Man slår själv läger runt borgen, tält för tält, tills ringen är sluten.
      async staket() {
        const K = B.K, p = R.P.staket, ring = []; Scene.setSeason(0.75);
        for (let i = 0; i < 16; i++) { const a = 1.2 + i * 0.3927, x = p.x + Math.cos(a) * 3.3, z = p.z + Math.sin(a) * 2.7; if (Geo.sdAt(x, z) > 0.45) ring.push([x, z]); }          // bara på land: mot vattnet stänger sjön
        const per = Math.max(1, Math.ceil(ring.length / 6)); let satta = 0;
        const talt = () => { const q = ring[satta++]; if (!q) return; const mb = new V.MB(); B.talt(mb); const m = B.mesh(mb); m.position.set(q[0], Geo.groundAt(q[0], q[1]), q[1]); m.rotation.y = satta * 1.7; m.scale.setScalar(K); Scene.scene.add(m); tempM.push(m);
          const u = Folk.add(q[0] + (p.x - q[0]) * 0.16, q[1] + (p.z - q[1]) * 0.16, satta % 2 ? 'knekt' : 'bonde', { pike: true, ang: Math.atan2(p.x - q[0], p.z - q[1]) }); temp.push(u); Fx.damm(q[0], Geo.groundAt(q[0], q[1]), q[1], 5); };
        Scene.jump(p.x, p.z + 1.6, 25); plats('Stäket vid Mälaren, 1516');
        await vanta(2); text('Ärkebiskop Gustav Trolle håller på Danmarks kung. Du stänger in honom i hans borg.'); await vanta(7);
        text('Tryck för att slå läger runt borgen');
        await tryckN('Slå läger', 6, k => { for (let j = 0; j < per; j++) talt(); L.spela('hammare'); L.spela('trumma'); if (k === 2) text(''); }, 18);
        while (satta < ring.length) talt();
        text('Ingen kommer in och ingen ut. Nu är det bara att vänta.'); await vanta(6);
        text('Från Danmark kommer rykten: kungen tänker skicka soldater till hans hjälp.'); await vanta(6);
      },
      // November 1517. Riksmötet har avsatt ärkebiskopen, och alla sätter sitt sigill under brevet. Biskop Brask ska ha lagt en lapp under sitt.
      async sigill() {
        const K = B.K, h = V.Varld.sate(), tx = h.x, tz = h.z + 0.68, gy = Geo.groundAt(tx, tz); Scene.setSeason(0.87);          // bordet står framför Sten Sture, herrarna på rad bredvid honom
        const bord = new V.MB(); bord.snow = 0; bord.box(0, 0, 0, 0.95, 0.3, 0.46, '#6b4a2c', { low: '#4f3620' }); bord.box(0, 0.3, 0, 0.66, 0.012, 0.32, '#efe3c6');
        const bm = B.mesh(bord); bm.position.set(tx, gy, tz); bm.scale.setScalar(K); Scene.scene.add(bm); tempM.push(bm);
        const herrar = [], pos = [[-0.62, 0], [-1.12, 0.14], [-1.62, 0], [-2.12, 0.14], [-0.9, -0.5], [0.62, 0], [1.12, 0.12]]; for (let i = 0; i < 7; i++) { const x = h.x + pos[i][0], z = h.z - 0.05 + pos[i][1], o = { ang: pos[i][0] < 0 ? 0.25 : -0.25 }; if (i === 6) Object.assign(o, { col: '#6a2a7a', col2: '#f2eee2', sc: 1.12 }); const u = Folk.add(x, z, 'borgare', o); herrar.push(u); temp.push(u); }
        const sigill = k => { const mb = new V.MB(); mb.snow = 0; mb.cyl(-0.26 + k * 0.087, 0.312, 0.1, 0.036, 0.036, 0.016, 8, '#b8312a', { cap: '#b8312a' }); const m = B.mesh(mb); m.position.copy(bm.position); m.scale.setScalar(K); Scene.scene.add(m); tempM.push(m); };
        const hopp = u => { u.y = 0.1; setTimeout(() => { u.y = 0; }, 180); };
        hooks.push(dt => V.Gustav.place(h.x, h.z, 0, 0, tid, dt, false, true));          // Sten Sture står vid bordet, vänd mot oss (annars är han ute på sin runda)
        Scene.cam.lut = 60; Scene.jump(tx, tz + 0.35, 14); plats('Stockholm, november 1517');
        await vanta(2); text('Mötet har bestämt: ärkebiskopen avsätts och hans borg ska rivas. Nu sätter alla sitt sigill under brevet.'); await vanta(8);
        text('Tryck för att sätta sigillen');
        const n = await tryckN('Sigill', 6, k => { sigill(k - 1); hopp(herrar[k - 1]); L.spela('trumma'); L.spela('kop'); if (k === 2) text(''); }, 18);
        for (let k = n; k < 6; k++) sigill(k);
        await vanta(0.8); sigill(6); hopp(herrar[6]); L.spela('trumma');
        const brask = skylt('Biskop Brask', () => herrar[6], 1.75);
        text('Det berättas att biskop Brask gömmer en lapp under sitt sigill: "Härtill är jag nödd och tvungen."'); await vanta(8); brask.bort();
        text('Den som har sitt sigill under brevet har varit med om att avsätta en ärkebiskop.'); await vanta(7);
      },
      // September 1519: flykten från Kalø till Lübeck
      async kalo() {
        const K = B.K, k = Geo.place(10.48, 56.3), lb = R.P.lubeck; Scene.setSeason(0.71);
        const mb = new V.MB(); B.borg(mb, 'liten', 0); const borg = B.mesh(mb); borg.position.set(k.x, Geo.groundAt(k.x, k.z), k.z); borg.scale.setScalar(K); Scene.scene.add(borg); tempM.push(borg);
        const fl = B.flagga('danmark'); fl.position.set(k.x + 2.2, Geo.groundAt(k.x + 2.2, k.z + 0.6), k.z + 0.6); fl.scale.setScalar(1.7); Scene.scene.add(fl); tempM.push(fl);
        const ge = gustavE(), g = { x: k.x - 1.7, z: k.z + 0.9, ang: -1.4, v: 0 }, visa = dt => ge.place(g.x, g.z, g.ang, g.v, tid, dt, false, true); ge.ang = g.ang; hooks.push(visa); skylt('Gustav Eriksson', () => g, 1.8);
        [[k.x - 0.45, k.z + 1.3], [k.x + 0.55, k.z + 1.3]].forEach(q => temp.push(Folk.add(q[0], q[1], 'dansk', { pike: true, ang: 0 })));          // vakterna vid porten ser åt andra hållet
        const pts = [[k.x - 1.7, k.z + 0.9], [k.x - 3.6, k.z + 1.1], [k.x - 6, k.z + 2.2], [k.x - 8.5, k.z + 3.8]];
        Scene.jump(k.x - 0.8, k.z + 2.4, 21); plats('Kalø slott i Danmark, september 1519');
        await vanta(2); text('Gustav Eriksson har suttit fången här i ett år.'); await vanta(6);
        await akFard(pts, 0, R.length(pts) - 0.2, 0.8, 'Rym', 'Tryck för att rymma', { kd: 17, ljud: 'steg', satt: (a, v) => { g.x = a.x; g.z = a.z; g.ang = a.ang; g.v = v; } });
        UI.film.knapp(null); I.tar = null; g.v = 0; text('Han tar sig till Lübeck, en fri och rik handelsstad i Tyskland.'); await vanta(5.5);
        UI.film.svart(1, 0.8); text(''); plats(''); await vanta(1.1); hooks = [];
        // Lübeck: kyrka, köpmanshus och stadens vita och röda flagga
        const mb2 = new V.MB(); B.kyrka(mb2); for (let i = 0; i < 6; i++) { mb2.push().move(-2.2 + i * 0.95, 0, 1.3 + (i % 2) * 0.9).rotY((i % 3 - 1) * 0.25); B.stuga(mb2, 0.7, 0.6, 0.62, 'tegel', { vagg: '#b85f44', vaggLag: '#8a4533', gavel: '#b85f44', brant: 0.8 }); mb2.pop(); }
        const stad = B.mesh(mb2); stad.position.set(lb.x, Geo.groundAt(lb.x, lb.z), lb.z); stad.scale.setScalar(K); Scene.scene.add(stad); tempM.push(stad);
        const fl2 = B.flagga('lubeck'); fl2.position.set(lb.x + 2.6, Geo.groundAt(lb.x + 2.6, lb.z + 0.5), lb.z + 0.5); fl2.scale.setScalar(1.7); Scene.scene.add(fl2); tempM.push(fl2);
        gubbar(7, lb.x, lb.z + 2.4, 'borgare', 2.2);
        g.x = lb.x - 3.4; g.z = lb.z + 5.2; g.ang = 2.4; g.v = 0.45; ge.ang = 2.4; hooks.push(dt => { if (g.z > lb.z + 2.6) { g.z -= dt * 0.42; g.x += dt * 0.38; } else g.v = 0; visa(dt); });
        Scene.jump(lb.x - 0.3, lb.z + 2.2, 22); UI.film.svart(0, 1.2); plats('Lübeck');
        await vanta(5); text('Slottsherren från Kalø kommer efter och kräver att få honom tillbaka.');
        const jagare = Folk.add(lb.x - 6, lb.z + 5.8, 'dansk', { pike: true, gar: true, ang: 1.95 }); temp.push(jagare); skylt('Slottsherren', () => jagare, 1.35); hooks.push(dt => { if (jagare.x < lb.x - 3.2) { jagare.x += dt * 0.5; jagare.z -= dt * 0.2; } else jagare.gar = false; });
        await vanta(7); L.spela('klart'); text('Lübecks råd svarar nej. Gustav får stanna i staden.'); await vanta(7);
      },
      // Februari 1520. Sten Sture körs hem i släde över Mälarens is och dör på vägen.
      async isen() {
        const a0 = R.P.strangnas, a1 = R.P.stockholm, rak = [[a0.x, a0.z], [a1.x, a1.z]], l0 = R.length(rak), Bu = V.Bud, sk = Bu.g.scale.x; Scene.setSeason(0.09); V.Gustav.g.visible = false;
        let skift = 0; for (let f = 0.28; f <= 0.76; f += 0.04) { const a = R.along(rak, l0 * f); let s = 0; while (s < 5 && Geo.sdAt(a.x, a.z - s) > -1.4) s += 0.4; skift = Math.max(skift, s); }          // ut på öppen is, norr om stranden
        const p0 = R.along(rak, l0 * 0.28), p1 = R.along(rak, l0 * 0.76), pts = [[p0.x, p0.z - skift], [p1.x, p1.z - skift]], d0 = 0, d1 = R.length(pts);
        const sl = slade(); sl.scale.setScalar(sk); Scene.scene.add(sl); tempM.push(sl); skylt('Du', () => ({ x: sl.position.x, z: sl.position.z, gy: sl.position.y }), 0.95);
        const lagg = (a, v, t, dt) => {
          if (aka) { aka.ork = Math.max(0.3, 1 - (aka.d - d0) / (d1 - d0) * 0.85); aka.fartX = 0.8 * aka.ork; if (aka.ork <= 0.3) aka.d1 = aka.d; }          // hästen går tyngre och tyngre, och till sist står släden still
          Bu.place(a.x, a.z, a.ang, v * (aka ? aka.ork : 1), t, dt, false); Bu.g.userData.ring.visible = false;
          const bx = a.x - Math.sin(a.ang) * 1.15 * sk, bz = a.z - Math.cos(a.ang) * 1.15 * sk; sl.position.set(bx, Math.max(0.02, Geo.groundAt(bx, bz)) + 0.01, bz); sl.rotation.y = a.ang;
        };
        const s = R.along(pts, d0); Bu.ang = s.ang; lagg(s, 0, tid, 0.016); Scene.jump(s.x, s.z + 1.5, 19); plats('Mälarens is, februari 1520');
        let slut = s; hooks.push(dt => { if (!aka) lagg(slut, 0, tid, dt); });
        await vanta(2); text('En kanonkula har krossat ditt knä. Armén är slagen, och du körs hem mot Stockholm i släde.'); await vanta(7.5);
        hooks = []; await akFard(pts, d0, d1, 1, 'Kör', 'Tryck för att köra', { kd: 18, ljud: 'hov', satt: lagg });
        UI.film.knapp(null); I.tar = null; slut = { x: Bu.x, z: Bu.z, ang: Bu.ang }; hooks.push(dt => lagg(slut, 0, tid, dt));
        L.spela('klocka'); text('Den 3 februari dör Sten Sture på isen, 27 år gammal.'); await vanta(7);
        text('På Stockholms slott tar hans hustru Kristina Gyllenstierna befälet.'); await vanta(7);
      },
      // Sommaren 1520. Kristina Gyllenstierna håller Stockholm och står själv på vallen. Sedan kommer brevet om nåd.
      async vallen() {
        const sth = R.P.stockholm, K = B.K, kr = V.Varld._kristina, kx = kr ? kr.x : sth.x + 1.9 * K, kz = kr ? kr.z : sth.z - 0.5 * K, gy = Geo.groundAt(kx, kz); Scene.setSeason(0.55);
        const folk = [], stall = (x, z, slag, o) => { const u = Folk.add(x, z, slag, o); folk.push(u); temp.push(u); };
        for (let j = 0; j < 4; j++) for (const s of [-1, 1]) stall(kx + s * (0.6 + j * 0.56), kz + 0.04 + (j % 2) * 0.14, j % 2 ? 'borgare' : 'knekt', { pike: j % 2 === 0, ang: 0 });          // i rad framför slottsmuren, där hon står
        for (let i = 0; i < 4; i++) stall(kx - 3.1 - (i % 2) * 0.5, kz + 0.5 + Math.floor(i / 2) * 0.5, i % 2 ? 'knekt' : 'borgare', { pike: i === 1, ang: 1.3 });
        Scene.jump(kx - 0.4, kz + 2.0, 19); plats('Stockholms slott, sommaren 1520'); skylt('Du', () => kr || { x: kx, z: kz }, 1.5);
        await vanta(2); text('September 1520. Ni har hållit ut hela sommaren, men ingen hjälp har kommit.'); await vanta(7);
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
        await vanta(2); text('Efter åtta månader hjälper Lübecks råd honom hem över havet.'); await vanta(7);
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
      const Bu = V.Bud, budSyns = Bu.g.visible; if (namn !== 'isen') Bu.g.visible = false; V.Varld.scenDolj(true);          // budet hör inte hemma i scenen (på isen är det hästen som drar släden)
      try { await I.scener[namn](); } catch (e) { console.error(e); }
      UI.film.knapp(null); I.tar = null; text(''); plats(''); await new Promise(r => setTimeout(r, 950));          // sista raden tonar bort innan rutan kommer (i riktig tid, också i snabbspolning)
      Bu.g.visible = budSyns; V.Varld.scenDolj(false); c.lut = 0; hooks = []; waits = []; aka = null; I.tar = null; I.nu = null; UI.film.knapp(null); if (GE) GE.g.visible = false; if (V.Musik) V.Musik.spar(V.Musik.grund()); rensa(); text(''); plats(''); UI.film.svart(0, 0.6); UI.film.pa(false); UI.visa(true); c.locked = false; c.fri = false; Scene.jump(hem.x, hem.z, Math.max(hem.d, 32)); I.aktiv = false; I.scenFart = 1; if (klar) klar();
    },
    slut(klar) { hooks = []; waits = []; rensa(); aka = null; I.tar = null; regn = false; UI.film.knapp(null); UI.film.tal(null); UI.film.text(''); UI.film.plats(''); UI.film.svart(0, 1); UI.film.pa(false); Fx.sno = true; V.Varld._ruttKlar = false; V.Varld._ruttKey = null; klar(); },
    update(dt, t) {
      skyltar.forEach(s => { const p = s.var_(), sp = p ? Scene.screenPoint(p.x, (p.gy !== undefined ? p.gy : Geo.groundAt(p.x, p.z)) + s.h, p.z) : null; if (!sp || sp.behind) { s.e.style.display = 'none'; return; } s.e.style.display = ''; const w = s.e.offsetWidth / 2 + 6, x = Math.max(w, Math.min(innerWidth - w, sp.x)); s.e.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%, -100%)'; });
      tid = t; const fart = I.aktiv ? (I.scenFart || 1) : (I.fart || 1);
      for (let k = waits.length - 1; k >= 0; k--) { waits[k].t -= dt * fart; if (waits[k].t <= 0) { const w = waits.splice(k, 1)[0]; w.r(); } }
      hooks.slice().forEach(h => h(I.aktiv ? dt * fart : dt));
      if (regn) { const c = Scene.cam, n = Math.round(dt * 240); for (let k = 0; k < n; k++) Fx.spawn({ x: c.x + (Math.random() - 0.5) * c.d * 1.6, y: c.gy + 3 + Math.random() * 6, z: c.z + (Math.random() - 0.7) * c.d * 1.2, vx: 1.2, vy: -11, vz: 0.4, size: 0.03 + c.d * 0.0012, r: 0.7, gr: 0.76, b: 0.86, a: 0.5, max: 0.9, golv: 1, fade: 0 }); }
      if (I.aktiv && fart > 1 && I.tar) { autoT += dt; if (autoT > 0.08) { autoT = 0; I.tar(); } }          // i snabbspolning (provet) trycker scenen själv
      if (aka) {
        aka.v = Math.max(0, aka.v - 0.75 * dt); aka.d = Math.min(aka.d1, aka.d + aka.v * aka.fartX * dt * (I.aktiv ? fart : 1)); aka.stilla += dt;
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
