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

  function tryck() {
    if (V.Intro && V.Intro.tar) { V.Ljud.vakna(); V.Intro.tar(); return; }          // i filmen och i scenerna är trycket det som scenen säger
    if (!spelar || (V.Intro && V.Intro.aktiv)) return; V.Ljud.vakna();
    const f = G.tryck(); if (f && !f.skede) V.Ljud.spela(V.Bud && V.Bud.sno ? 'skida' : 'hov');          // i striden låter världen själv (Varld._drag)
  }
  const UTSIKT = 32;          // en bra nivå att se sig omkring från: dit zoomar kameran ut efter ett inzoomat moment
  let haller = false, hallT = 0;          // mellanslag eller knappen hålls in: buden går i jämn takt utan att man behöver hamra
  function handelse(typ, d) {
    Varld.handelse(typ, d);
    if (typ === 'tryck') { if (spelar) UI.tryckt(d); }
    else if (typ === 'marknad') { UI.skylt('Marknadsdag i ' + G.BAS[d.bas].namn); V.Ljud.spela('klocka'); }
    else if (typ === 'marknadKlar') { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 2.2, p.z, 'Marknad +' + V.tal(d.antal) + (d.res === 'man' ? ' män' : ' mark'), d.res); V.Ljud.spela('dubbel'); }
    else if (typ === 'sold' && d.dubbel) UI.skylt('Soldaterna: dubbelt så många män');
    else if (typ === 'handling') { V.Ljud.spela(d.id === 'tal' ? 'sorl' : d.id === 'monstra' ? 'horn' : 'kop'); const h = D.HANDLINGAR.find(q => q.id === d.id); UI.skylt(UI.handlNamn(h) + (d.fick ? ': +' + V.tal(d.fick) + ' män' : '')); }
    else if (typ === 'skattUt') { if (!d.auto) V.Ljud.spela('kop'); }
    else if (typ === 'skatt') { UI.skattKlar(d.mark); const p = Varld.skattTill && Varld.pos(Varld.skattTill); if (p) UI.flyt(p.x, p.y + 1.8, p.z, 'Skatt +' + V.tal(d.mark) + ' mark', 'mark'); if (!d.auto) V.Ljud.spela('samling'); }
    else if (typ === 'samling' && !d.lopare) { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 1.8, p.z, d.res === 'mark' ? 'Skatt +' + V.tal(d.antal) + ' mark' : '+' + V.tal(d.antal) + ' män går med', d.res); V.Ljud.spela('samling'); }
    else if (typ === 'niva' && d.dubbel) UI.skylt(UI.byggnad(d.bas, d.niva));
    else if (typ === 'konst' && d.dubbel) UI.skylt(UI.konst(d.id)[0] + ': dubbelt upp');
    else if (typ === 'full') V.Ljud.spela('full');
    else if (typ === 'skickat') { V.Ljud.spela(d.u.slag === 'beslut' ? 'klocka' : 'horn'); if (V.Musik && (d.u.slag === 'tag' || d.u.strid)) V.Musik.spar('krig'); }
    else if (typ === 'val') {
      const visa = () => { if (!V.tyst) UI.text(d.u.valText || 'Biskop Brask säger nej. Riksdagen tvekar.', 30); V.Ljud.spela('sorl'); };
      if (d.u.valScen && !V.tyst && V.Intro && V.Intro.scener[d.u.valScen]) V.Intro.scen(d.u.valScen, visa); else visa();          // först scenen, sedan valet
    }
    else if (typ === 'klart') {
      const u = d.u; V.Ljud.spela(u.strid === 'nederlag' ? 'nej' : 'klart'); if (V.Musik) V.Musik.spar(V.Musik.grund());
      if (!V.tyst && Scene.cam.d < UTSIKT - 2 && !Scene.cam.locked) Scene.flyTo(Scene.cam.x, Scene.cam.z, UTSIKT, 1.8);
      if (!V.tyst) { if (u.scen && V.Intro && V.Intro.scener[u.scen]) setTimeout(() => V.Intro.scen(u.scen, () => UI.klart(u)), 1800); else UI.klart(u); }          // först scenen, sedan rutan som säger vad som hände
      if (u.ger && u.ger.titel && !V.tyst) setTimeout(() => UI.skylt(u.ger.titel === 'Kung' ? 'Sveriges kung' : u.ger.titel), 900);
      if (u.ger && u.ger.slut) setTimeout(() => UI.slut(), 5000);
      spara();
    } else if (typ === 'varldSlut') {
      // förspelet är över: portarna är öppnade. Nästa värld börjar med filmen om blodbadet.
      // Rutan med vad som hände står kvar tills spelaren trycker Fortsätt (eller en halv minut har gått).
      byter = true; Scene.cam.locked = true; let gjort = false;
      const vidare = () => { if (gjort) return; gjort = true; UI.visa(false); UI.dolj(); UI.film.svart(1, 3); setTimeout(() => { G.nyVarld(1); skriv(); laddaOm(); }, 3500); };
      UI.efter = vidare; setTimeout(vidare, 30000 / Math.min(snabb, 10));
    }
  }
  // Årstiden följer historien, inte klockan: den är den årstid då det senaste steget skedde,
  // och står still tills nästa steg görs. Då glider den fram till det stegets månad medan hären är på väg.
  function senaste() { const S = G.s, a = S.aktivt; if (a) return D.UPPDRAG.find(u => u.id === a.id); return S.nasta > 0 ? D.UPPDRAG[S.nasta - 1] : { ar: S.varld === 0 ? 1512 : 1521, man: 1 }; }
  function arstidSteg(dt) {
    const u = senaste(), a = G.s.aktivt; let df = ((((u.man - 1) / 12 - arstid) % 1) + 1) % 1; if (df > 0.96) df = 0;
    let v = 1 / 30; if (a && !a.val) v = Math.min(1 / 10, Math.max(v, df / Math.max(1, a.dur - a.t)));
    arstid = (arstid + Math.min(df, v * dt)) % 1;
  }
  // Datumet uppe i hörnet: året då det senaste steget skedde, årstiden så som den syns på kartan.
  V.kalender = () => ({ ar: senaste().ar, man: arstid * 12 + 1 });
  // Hoppa fram till ett visst uppdrag (för prov och skärmbilder):  ?fusk=7
  V.fusk = function (n) {
    V.tyst = true; G.s.intro = true;
    for (let guard = 0; guard < 400 && G.s.nasta < n && !G.s.slut; guard++) {
      const u = D.UPPDRAG[G.s.nasta]; G.s.res.man = G.tak(); G.s.res.mark = Math.max(G.s.res.mark, (G.kostnad(u).mark || 0) * 1.01, 1e3); if (!G.s.aktivt) G.skicka(0.01); G.steg(0.05); if (G.s.aktivt && G.s.aktivt.val) G.valj();
      for (const id in G.s.bas) for (let k = 0; k < 3; k++) { G.s.res[G.prisRes(id)] = Math.max(G.s.res[G.prisRes(id)], G.pris(id)); G.kop(id); }
    }
    G.s.res.man = G.tak() * 0.7; G.s.tryck = 10; G.s.tips = { ak: 1, full: 1, kop: 1, upp: 1, tak: 1, skatt: 1 }; G.s.handlSagt = 3; if (G.s.varld === 1 && G.s.nasta > 4) G.s.las.sold = true; G.s.skattSagt = 1; V.tyst = false; Varld.sync(true);
  };

  function hemma() { return Varld.pos(G.s.varld === 0 ? 'stockholm' : 'mora'); }
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
    UI.init(); Varld.init(Scene.scene);
    G.ut = handelse; V.Ljud.init(); V.Ljud.pa(G.s.ljud); if (V.Musik) { V.Musik.satt(G.s.ljud && G.s.musik !== false); V.Musik.spar(V.Musik.grund()); }
    if (q.has('fusk')) V.fusk(+q.get('fusk'));
    Varld.sync(true);
    arstid = hade && G.s.arstid >= 0 && !q.has('fusk') ? G.s.arstid % 1 : ((senaste().man - 1) / 12) % 1; Scene.setSeason(q.has('season') ? +q.get('season') : arstid);
    const p = q.has('lon') ? Geo.place(+q.get('lon'), +q.get('lat')) : hemma(); Scene.jump(p.x, p.z + 1.5, +q.get('d') || 30);
    UI.onTryck = tryck; UI.onSkicka = () => Varld.skicka(); UI.onSkatt = () => G.skatt();
    UI.onHitta = () => { const w = Varld.gustavVid(); Scene.cam.user = performance.now(); Scene.flyTo(w.x, w.z + 1.2, UTSIKT, 0.9); };          // knappen Hitta mig
    UI.onVisaBas = id => { const w = Varld.pos(id); Scene.flyTo(w.x, w.z + 1.2, Math.min(Scene.cam.d, 30), 0.9); };
    UI.onBorjaOm = () => { byter = true; try { localStorage.removeItem(SPAR); } catch (e) { /* inget */ } laddaOm(); };
    UI.onIgen = arv => { byter = true; G.s.arv += arv; G.s.varv++; const s = G.ny(true); s.intro = true; skriv(); laddaOm(); };
    Scene.onClick = (e, g) => {
      const id = Varld.basVid(g); if (!(id && spelar && G.s.bas[id])) { tryck(); return; }
      if (G.s.marknad && G.s.marknad.bas === id) { V.Ljud.vakna(); G.marknadTa(); UI.tick(); return; }
      UI.valj(id); V.Ljud.vakna();
      if (!UI.kop(id)) { const w = Varld.pos(id), res = G.prisRes(id), fattas = G.pris(id) - G.s.res[res]; UI.flyt(w.x, w.y + 2.4, w.z, G.stoppad(id) ? 'Uppror' : 'Fattas ' + V.tal(Math.ceil(fattas)) + (res === 'man' ? ' män' : ' mark'), 'nej'); V.Ljud.spela('trumma'); }
    };
    window.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) { haller = true; tryck(); } } else if (spelar && !e.repeat && /^Digit[1-3]$/.test(e.code)) UI.handla(+e.code.slice(5) - 1); });
    window.addEventListener('keyup', e => { if (e.code === 'Space') haller = false; }); window.addEventListener('blur', () => { haller = false; });
    const ak = document.getElementById('ak'); ak.addEventListener('pointerdown', () => { haller = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => ak.addEventListener(n, () => { haller = false; }));
    window.addEventListener('beforeunload', spara); document.addEventListener('visibilitychange', () => { if (document.hidden) spara(); });
    const S = G.s, film = q.get('intro') !== '0' && V.Intro;
    if (film && S.varld === 0 && S.t === 0) V.Intro.titel(() => { start(true); UI.forklara(0); });                                      // helt nytt spel: titeln, sedan Sten Stures tid
    else if (film && S.varld === 1 && !S.intro) V.Intro.kor(() => { G.s.intro = true; arstid = 0.04; start(true); spara(); UI.forklara(1); });      // Gustavs värld börjar med blodbadet
    else {
      if (S.varld === 1) S.intro = true; start(false);
      if (q.has('scen') && V.Intro) setTimeout(() => V.Intro.scen(q.get('scen')), 1200);          // ?scen=kalo spelar en scen direkt (för prov och skärmbilder)
      if (hade) { const b = G.borta((Date.now() - S.sparad) / 1000); if (b && (b.fick.man > 1 || b.fick.mark > 1)) UI.borta(b); }
    }
    requestAnimationFrame(frame);
  }
  function frame(now) {
    let dt = Math.min(0.1, (now - (last || now)) / 1000); last = now; const t = (V.U.uTime.value += dt);
    if (spelar && !(V.Intro && V.Intro.aktiv)) {
      if (haller && !UI.pausar() && !(V.Intro && V.Intro.tar) && (hallT += dt) > 0.2) { hallT = 0; tryck(); }
      if (!UI.pausar()) {                                 // tiden står still medan rutan i början läses
        for (let k = 0; k < snabb; k++) G.steg(dt);
        if (G.tvinga()) Varld.skicka();                    // förspelet går sin gång vad man än gör
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
