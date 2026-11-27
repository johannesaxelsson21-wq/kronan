// Start och huvudloop: bygger världen, laddar sparfilen och kopplar ihop regler, värld och gränssnitt.
// Spelet har två världar än så länge: förspelet (Sten Sture den yngre, varld 0) och Gustav Vasa (varld 1).
// När en värld tar slut sparas nästa världs början och sidan laddas om, så byggs kartan upp på nytt.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, World = V.World, Scene = V.Scene, G = V.Game, UI = V.UI, Varld = V.Varld, R = V.Rike, D = V.DATA, q = new URLSearchParams(location.search);
  const SPAR = 'kronan_v1';
  let spelar = false, arstid = 0, last = 0, uiAcc = 0, sparAcc = 0, frames = 0, snabb = +q.get('snabb') || 1, byter = false;

  function skriv() { try { G.s.sparad = Date.now(); G.s.arstid = arstid; localStorage.setItem(SPAR, JSON.stringify(G.s)); } catch (e) { /* fullt eller avstängt */ } }
  function spara() { if (spelar && !byter) skriv(); }
  function ladda() { try { const t = localStorage.getItem(SPAR); if (t) { G.ladda(JSON.parse(t)); return true; } } catch (e) { /* trasig sparfil: börja om */ } return false; }
  // Ladda om sidan utan ?ny, så att den nya sparfilen gäller.
  function laddaOm() { const p = new URLSearchParams(location.search); ['ny', 'fusk', 'varld'].forEach(k => p.delete(k)); const s = p.toString(); location.href = location.pathname + (s ? '?' + s : ''); }

  function tryck(auto, mal) {
    if (V.Intro && V.Intro.tar) { V.Ljud.vakna(); V.Intro.tar(); return; }          // i filmen och i scenerna är trycket det som scenen säger
    if (!spelar || (V.Intro && V.Intro.aktiv)) return; V.Ljud.vakna();
    const f = G.tryck(auto === true, mal); if (f && !f.skede) V.Ljud.spela(Varld._ryttare().sno ? 'skida' : 'hov');          // i striden låter världen själv (Varld._drag)
  }
  const UTSIKT = 32;          // en bra nivå att se sig omkring från: dit zoomar kameran ut efter ett inzoomat moment
  let haller = false, hallT = 0;          // mellanslag eller knappen hålls in: buden går i jämn takt utan att man behöver hamra
  function handelse(typ, d) {
    Varld.handelse(typ, d);
    if (typ === 'tryck') { if (spelar && !(V.lugn && d.skede)) UI.tryckt(d); }          // i förspelets slag inga siffror från knappen: där syns trycken i slaget
    else if (typ === 'marknad') { if (!V.lugn) { UI.skylt('Marknadsdag i ' + G.BAS[d.bas].namn); V.Ljud.spela('klocka'); } }
    else if (typ === 'marknadKlar') { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 2.2, p.z, 'Marknad +' + V.tal(d.antal) + (d.res === 'man' ? ' män' : ' mark'), d.res); V.Ljud.spela('dubbel');
    }
    else if (typ === 'sold' && d.dubbel) UI.skylt((G.s.varld === 0 ? 'Knektarna' : 'Soldaterna') + ': dubbelt så många män');
    else if (typ === 'infor') { if (!V.tyst) { UI.text(d.text, 10); V.Ljud.spela('klart'); } UI.tick(true); }          // en ny sak i taget, med en lugn rad
    else if (typ === 'slagTryck') UI._studs = performance.now();
    else if (typ === 'malVald') { UI._studs = performance.now(); UI.svar('Tryck nu på knappen', true); V.Ljud.spela('kop'); }
    else if (typ === 'malForst') { if (performance.now() > (UI._forstT || 0)) { UI._forstT = performance.now() + 1800; UI.svar('Tryck på ringen i slaget', false); } }          // ringen i slaget studsar till
    else if (typ === 'slagStart') { UI.skylt(d.u.belagring ? 'Belägringen börjar' : 'Slaget börjar', true); V.Ljud.spela('horn'); }
    else if (typ === 'order') { const a0 = G.s.aktivt, ex = d.typ !== 'vanta' && a0 && !a0.forklarad ? 'Tryck många gånger på ringen i slaget. Den flyttar sig dit varje order gäller. Stapeln högst upp visar vem som är på väg att vinna.' : ''; if (ex) a0.forklarad = 1; UI.text(d.o.rad + (d.o.hur ? '<br>' + d.o.hur : '') + (ex ? '<br><b>' + ex + '</b>' : ''), d.typ === 'hugg' ? 6.8 : d.typ === 'vanta' ? 5.5 : 5, !!ex); V.Ljud.spela(d.typ === 'hugg' ? 'trumma' : 'horn'); }          // första gången förklaras varje sort          // i början av varje slag
    else if (typ === 'hugg') { UI.svar(d.traff ? 'Träff' : d.igen ? 'Vänta på nästa ring' : d.d < 0 ? 'Lite tidigt' : 'Lite sent', d.traff); }          // varje hugg får ett svar där ringen är
    else if (typ === 'orderVanta') UI.svar('Vänta tills ringen når pricken', false);
    else if (typ === 'orderSvar') { if (!d.o.alltid && d.bra) UI.svar('Bra', true); }
    if (typ === 'orderSvar') { UI.text(d.o.alltid || (d.bra ? d.o.bra : d.o.miss), 3.2); if (d.bra && !d.o.alltid) V.Ljud.spela('klart'); }
    else if (typ === 'kula') { UI.text(d.o.rad, 6.5); V.Ljud.spela('kanon'); Scene.shake(0.5); if (d.o.efter && !V.tyst) setTimeout(() => UI.text(d.o.efter, 6), 6800 / Math.min(snabb, 10)); }
    else if (typ === 'byggnad') { UI.skylt(d.b.skylt || d.b.namn + ' står klart'); if (d.b.klart && !V.tyst) UI.text(d.b.klart, 9); V.Ljud.spela('hammare'); const w = Varld.byggPlats(d.id); if (w && !V.tyst) { Varld._foljPaus = performance.now() + 4000; Varld._foljD = Scene.cam.td; Scene.flyTo(w.x, w.z + 1, 22, 1.0); } UI.tick(true); }          // kameran går dit så att man ser huset resas
    else if (typ === 'hus') { if (d.niva === 1) { UI.skylt(d.h.namn + ' står klart'); const w = Varld.byggPlats(d.id); if (w && !V.tyst) { Varld._foljPaus = performance.now() + 4000; Varld._foljD = Scene.cam.td; Scene.flyTo(w.x, w.z + 1, 22, 1.0); } } UI.tick(true); }          // stadens hus: kameran går dit första gången
    else if (typ === 'handling') { V.Ljud.spela(d.id === 'tal' ? 'sorl' : d.id === 'monstra' ? 'horn' : 'kop'); const h = D.HANDLINGAR.find(q => q.id === d.id); UI.skylt(UI.handlNamn(h) + (d.fick ? ': +' + V.tal(d.fick) + ' män' : '')); }
    else if (typ === 'skattUt') { if (!d.auto) V.Ljud.spela('kop'); }
    else if (typ === 'skatt') { UI.skattKlar(d.mark); const p = Varld.skattTill && Varld.pos(Varld.skattTill); if (p) UI.flyt(p.x, p.y + 1.8, p.z, 'Skatt +' + V.tal(d.mark) + ' mark', 'mark'); if (!d.auto) V.Ljud.spela('samling'); }
    else if (typ === 'samling' && !d.lopare) { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 1.8, p.z, d.res === 'mark' ? 'Skatt +' + V.tal(d.antal) + ' mark' : '+' + V.tal(d.antal) + ' män går med', d.res); V.Ljud.spela('samling'); }
    else if (typ === 'niva' && d.dubbel) UI.skylt(UI.byggnad(d.bas, d.niva));
    else if (typ === 'arbetare') { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 2.4, p.z, d.antal + ' lag i gruvan', 'mark'); V.Fx.damm(p.x, p.y + 0.2, p.z, 10); }
    else if (typ === 'konst' && d.dubbel) UI.skylt(UI.konst(d.id)[0] + ': dubbelt upp');
    else if (typ === 'full') V.Ljud.spela('full');
    else if (typ === 'skickat') { V.Ljud.spela(d.u.slag === 'beslut' ? 'klocka' : 'horn'); if (V.Musik && (d.u.slag === 'tag' || d.u.strid)) V.Musik.spar('krig'); if (d.u.belagring && !d.u.order && !V.tyst) UI.text('Kristians armé och flotta stänger in Stockholm. Håll ut.', 9); }
    else if (typ === 'val') {
      const visa = () => { if (!V.tyst) UI.text(d.u.valText || 'Biskop Brask säger nej. Riksdagen tvekar.', 30); V.Ljud.spela('sorl'); };
      if (d.u.valScen && !V.tyst && V.Intro && V.Intro.scener[d.u.valScen]) V.Intro.scen(d.u.valScen, visa); else visa();          // först scenen, sedan valet
    }
    else if (typ === 'klart') {
      const u = d.u; V.Ljud.spela(u.strid === 'nederlag' ? 'nej' : 'klart'); if (V.Musik) V.Musik.spar(V.Musik.grund()); UI.textBort();
      if (!V.tyst && Scene.cam.d < UTSIKT - 2 && !Scene.cam.locked) Scene.flyTo(Scene.cam.x, Scene.cam.z, UTSIKT, 1.8);
      if (!V.tyst) { if (u.scen && V.Intro && V.Intro.scener[u.scen]) setTimeout(() => V.Intro.scen(u.scen, () => UI.klart(u)), 1800 / Math.min(snabb, 10)); else UI.klart(u); }          // först scenen, sedan rutan som säger vad som hände
      if (u.ger && u.ger.titel && !V.tyst) setTimeout(() => UI.skylt(u.ger.titel === 'Kung' ? 'Sveriges kung' : u.ger.titel), 900);
      if (u.ger && u.ger.slut) setTimeout(() => UI.slut(), 5000);
      spara();
    } else if (typ === 'varldSlut') {
      // förspelet är över: portarna är öppnade. Nästa värld börjar med filmen om blodbadet.
      // Rutan med vad som hände står kvar tills spelaren trycker Fortsätt (eller en halv minut har gått).
      byter = true; Scene.cam.locked = true; let gjort = false;
      const vidare = () => { if (gjort) return; gjort = true; UI.visa(false); UI.dolj(); UI.film.svart(1, 3); setTimeout(() => { G.nyVarld(G.s.varld + 1); skriv(); laddaOm(); }, 3500); };
      UI.efter = vidare; setTimeout(vidare, 30000 / Math.min(snabb, 10));
    }
  }
  // Årstiden följer historien, inte klockan: den är den årstid då det senaste steget skedde,
  // och står still tills nästa steg görs. Då glider den fram till det stegets månad medan hären är på väg.
  // Det steg vars datum kartan ska visa: det som pågår, annars det senaste. efterMan = månaden som scenen efter steget slutade i (förspelet).
  function senaste() {
    const S = G.s, a = S.aktivt; if (a) return D.UPPDRAG.find(u => u.id === a.id);
    if (S.nasta > 0) { const p = D.UPPDRAG[S.nasta - 1]; return S.varld === 0 && p.efterMan ? { ar: p.ar, man: p.efterMan } : p; }
    return { ar: D.VARLDAR[S.varld].ar0, man: D.VARLDAR[S.varld].man0 || 1 };          // världens början
  }
  function arstidSteg(dt) {
    const u = senaste(), a = G.s.aktivt, mal = (u.man - 1) / 12;
    {
      // Det som händer visas i den årstid det hände (Johannes 2026-11-26). När ett steg går iväg är kartan framme vid stegets
      // årstid inom en sekund, kortaste vägen (från höst till sommar går den bakåt genom sensommaren, inte framåt genom vintern).
      // Bara belägringen av Stockholm låter månaderna gå medan den pågår: från april till september.
      let d = ((((mal - arstid) % 1) + 1.5) % 1) - 0.5; if (Math.abs(d) < 0.002) return;
      const v = a && !a.val ? (u.belagring ? Math.abs(d) / Math.max(1, a.dur - a.t) : 0.5) : 1 / 30;
      arstid = (((arstid + Math.sign(d) * Math.min(Math.abs(d), v * dt)) % 1) + 1) % 1; return;
    }
  }
  // Datumet uppe i hörnet: året då det senaste steget skedde, årstiden så som den syns på kartan.
  V.kalender = () => ({ ar: senaste().ar, man: arstid * 12 + 1 });
  // Hoppa fram till ett visst uppdrag (för prov och skärmbilder):  ?fusk=7
  V.fusk = function (n) {
    V.tyst = true; G.s.intro = true;
    for (let guard = 0; guard < 400 && G.s.nasta < n && !G.s.slut; guard++) {
      const u = D.UPPDRAG[G.s.nasta]; G.s.res.man = G.tak(); G.s.res.mark = Math.max(G.s.res.mark, (G.kostnad(u).mark || 0) * 1.01, 1e3); if (!G.s.aktivt) G.skicka(0.01); if (G.s.aktivt && !G.s.aktivt.val) G.s.aktivt.t = Math.max(G.s.aktivt.t, G.s.aktivt.dur - 0.01); G.steg(0.05); if (G.s.aktivt && G.s.aktivt.val) G.valj();
      for (const id in G.s.bas) for (let k = 0; k < 3; k++) { G.s.res[G.prisRes(id)] = Math.max(G.s.res[G.prisRes(id)], G.pris(id)); G.kop(id); }
    }
    G.s.res.man = G.tak() * 0.7; G.s.tryck = 10; G.s.tips = { ak: 1, full: 1, kop: 1, upp: 1, tak: 1, skatt: 1 }; G.s.handlSagt = 3; if (G.s.varld === 1 && G.s.nasta > 4) G.s.las.sold = true; G.s.skattSagt = 1; V.tyst = false; Varld.sync(true);
  };

  function hemma() { return Varld.pos((D.VARLDAR[G.s.varld] || D.VARLDAR[1]).hem); }
  function start(nyss) {
    spelar = true; UI.visa(true); UI.film.pa(false); Scene.cam.locked = false;
    const p = hemma(); if (nyss) Scene.flyTo(p.x, p.z + 1.5, G.s.varld === 0 ? 34 : 30, 2.2); UI.tick(true);
  }
  function boot() {
    Scene.init(document.getElementById('view'));
    Geo.init(); R.init();
    World.build(Scene.scene, R.clearings(), R.roads());
    // sparfilen läses innan världen befolkas, eftersom förspelet och Gustavs värld har olika hjältar
    const hade = !q.has('ny') && ladda();
    if (!hade) G.nyVarld(q.has('varld') ? +q.get('varld') : q.has('fusk') ? 1 : 0);
    V.lugn = true;          // förspelet är lugnt: färre gnistor, lägre ljud, nästan ingen skakning (Johannes 2026-11-26: "det ska vara lugnt och skönt")
    UI.init(); Varld.init(Scene.scene);
    G.ut = handelse; V.Ljud.init(); V.Ljud.pa(G.s.ljud); if (V.Musik) { V.Musik.satt(G.s.ljud && G.s.musik !== false); V.Musik.spar(V.Musik.grund()); }
    if (q.has('fusk')) V.fusk(+q.get('fusk'));
    Varld.sync(true);
    arstid = hade && G.s.arstid >= 0 && !q.has('fusk') ? G.s.arstid % 1 : ((senaste().man - 1) / 12) % 1; Scene.setSeason(q.has('season') ? +q.get('season') : arstid);
    const p = q.has('lon') ? Geo.place(+q.get('lon'), +q.get('lat')) : hemma(); Scene.jump(p.x, p.z + 1.5, +q.get('d') || 30);
    UI.onTryck = tryck; UI.onSkicka = () => Varld.skicka(); UI.onSkatt = () => G.skatt();
    UI.onHitta = () => { const w = Varld.gustavVid(); Scene.cam.user = performance.now(); Varld._foljMig = Scene.cam.user; Scene.flyTo(w.x, w.z + 1.2, UTSIKT, 0.9); Varld.foljHjalten(); };          // knappen Hitta mig
    UI.onVisaBas = id => { const w = Varld.pos(id); Scene.flyTo(w.x, w.z + 1.2, Math.min(Scene.cam.d, 30), 0.9); Varld.foljPlats(id); };          // förspelet: kameran stannar vid staden
    UI.onBorjaOm = () => { byter = true; try { localStorage.removeItem(SPAR); } catch (e) { /* inget */ } laddaOm(); };
    UI.onVidare = arv => { byter = true; G.s.arv += arv; G.s.varv++; G.nyVarld(G.s.varld + 1); skriv(); laddaOm(); };          // nästa regents värld, med arvet
    UI.onIgen = arv => { byter = true; G.s.arv += arv; G.s.varv++; const s = G.ny(true); s.intro = true; skriv(); laddaOm(); };
    Scene.onClick = (e, g) => {
      if (spelar && G.skede() === 'strid' && (G.uppdrag() || {}).order) { Varld.foljUppdraget(); const q = Varld.malSkarm(); tryck(false, q && Math.hypot(q.x - e.clientX, q.y - e.clientY) <= q.r + 12 ? 'ring' : 'karta'); return; }          // ett tryck på ringen räknas, annars inte          // i ett slag i förspelet är varje tryck på kartan en order, och kameran går tillbaka till slaget
      const id = Varld.basVid(g) || Varld.byggVid(g), egen = !!(id && spelar && G.s.bas[id]);
      if (egen && !(G.s.marknad && G.s.marknad.bas === id) && !UI.stadVald(id)) { V.Ljud.vakna(); UI.visaStad(id); Varld.foljPlats(id); return; }          // ett tryck på en egen stad öppnar alltid dess flik först, också när hjälten står mitt i den (Johannes 2026-11-27); nästa tryck bygger ut den
      if (spelar && Varld.valjVid(e.clientX, e.clientY, egen)) { V.Ljud.vakna(); return; }          // förspelet: det man trycker på följs (Johannes 2026-11-26)
      if (!egen) { tryck(); return; }
      if (G.s.marknad && G.s.marknad.bas === id) { V.Ljud.vakna(); G.marknadTa(); UI.tick(); return; }
      UI.valj(id); V.Ljud.vakna();
      if (!UI.kop(id)) { const w = Varld.pos(id), res = G.prisRes(id), fattas = G.pris(id) - G.s.res[res]; UI.flyt(w.x, w.y + 2.4, w.z, G.stoppad(id) ? 'Uppror' : fattas > 0 ? 'Fattas ' + V.tal(Math.ceil(fattas)) + (res === 'man' ? ' män' : ' mark') : 'Fattas ' + V.tal(Math.ceil(G.dagsverke(id) - G.s.res.man)) + ' män till dagsverken', 'nej'); V.Ljud.spela('trumma'); }
    };
    window.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) { haller = true; tryck(); } } else if (spelar && !e.repeat && /^Digit[1-3]$/.test(e.code)) UI.handla(+e.code.slice(5) - 1); });
    window.addEventListener('keyup', e => { if (e.code === 'Space') haller = false; }); window.addEventListener('blur', () => { haller = false; });
    const ak = document.getElementById('ak'); ak.addEventListener('pointerdown', () => { haller = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => ak.addEventListener(n, () => { haller = false; }));
    window.addEventListener('beforeunload', spara); document.addEventListener('visibilitychange', () => { if (document.hidden) spara(); });
    const S = G.s, film = q.get('intro') !== '0' && V.Intro;
    if (film && S.varld === 0 && S.t === 0) V.Intro.titel(() => { start(true); UI.forklara(0); });                                      // helt nytt spel: titeln, sedan Sten Stures tid
    else if (film && S.varld === 1 && !S.intro) V.Intro.kor(() => { G.s.intro = true; arstid = 0.04; start(true); spara(); UI.forklara(1); });      // Gustavs värld börjar med blodbadet
    else if (film && S.varld >= 2 && !S.intro) { G.s.intro = true; start(true); spara(); UI.forklara(S.varld); }          // Eriks värld börjar med rutan om vem man är
    else {
      if (S.varld >= 1) S.intro = true; start(false);
      if (q.has('scen') && V.Intro) setTimeout(() => V.Intro.scen(q.get('scen'), null, true), 1200);          // ?scen=kalo spelar en scen direkt (för prov och skärmbilder)
      if (hade) { const b = G.borta((Date.now() - S.sparad) / 1000); if (b && (b.fick.man > 1 || b.fick.mark > 1)) UI.borta(b); }
    }
    requestAnimationFrame(frame);
  }
  function frame(now) {
    let dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; const t = (V.U.uTime.value += dt);
    if (spelar && !(V.Intro && V.Intro.aktiv)) {
      if (haller && !UI.pausar() && !(V.Intro && V.Intro.tar) && (hallT += dt) > 0.2) { hallT = 0; tryck(true); }
      if (!UI.pausar()) {                                 // tiden står still medan rutan i början läses
        for (let k = 0; k < snabb; k++) G.steg(dt);
        // (förspelet startade förr nästa steg av sig själv. Johannes 2026-11-27: "Inget startar förrän man har alla resurser".)
        arstidSteg(dt * snabb);
      }
      if (!q.has('season')) Scene.setSeason(arstid);
      Varld.update(dt * Math.min(snabb, 4), t);
      sparAcc += dt; if (sparAcc > 10) { sparAcc = 0; spara(); }
    } else if (V.Intro && V.Intro.update) V.Intro.update(dt, t);
    Varld.fri(); V.Folk.update(t); V.Fx.mat.uniforms.uH.value = Scene.renderer.domElement.height * 1.866; V.Fx.update(dt, Scene.cam);
    Scene.keyPan(dt); Scene.update(dt); Scene.render(); UI.frame();
    uiAcc += dt; if (uiAcc > 0.1) { uiAcc = 0; if (spelar) UI.tick(); }
    if (++frames === 3) { document.getElementById('load').classList.add('gone'); window.VASA_READY = true; }
    V.fps = V.fps ? V.fps * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05 : 60;
    // orkar datorn inte med sänks skärpan först och skuggorna sedan
    if (frames > (Scene.mobil ? 200 : 400) && frames % (Scene.mobil ? 120 : 240) === 0 && V.fps < 27 && !document.hidden) { const r = Scene.renderer; if (V.Efterbild && V.Efterbild.pa) V.Efterbild.pa = false; else if (r.getPixelRatio() > 1) { r.setPixelRatio(1); Scene.resize(); } else if (r.shadowMap.enabled) { r.shadowMap.enabled = false; Scene.scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } }
    requestAnimationFrame(frame);
  }
  window.addEventListener('load', () => setTimeout(boot, 30));
})();
