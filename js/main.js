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
  // Slag där man trycker direkt på fienden (Johannes 2026-11-28): fältslag, överfall, samtal och sjöslag. Belägringarna har kvar sina ringar.
  function fritt(u) { u = u || G.uppdrag(); return !!(u && u.order); }          // alla slag och händelser med order, också belägringarna (Johannes 2026-11-28: "Inga ringar i eventen")
  function slagHur(u) { u = u || {}; return u.belagring ? 'Tryck på fienden. Varje tryck gör skada.' : u.typ === 'overfall' ? 'Tryck på vakterna.' : u.typ === 'samtal' ? 'Tryck på dem.' : u.slag === 'flotta' ? 'Tryck på fiendens skepp.' : 'Tryck på fiendens här. Varje tryck fäller några av dem.'; }
  function handelse(typ, d) {
    Varld.handelse(typ, d);
    if (typ === 'tryck') { if (spelar && !(V.lugn && d.skede)) UI.tryckt(d); }          // i förspelets slag inga siffror från knappen: där syns trycken i slaget
    else if (typ === 'marknad') { if (!V.lugn) { UI.skylt('Marknadsdag i ' + G.BAS[d.bas].namn); V.Ljud.spela('klocka'); } }
    else if (typ === 'marknadKlar') { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 2.2, p.z, 'Marknad +' + V.tal(d.antal) + (d.res === 'man' ? ' män' : ' mark'), d.res); V.Ljud.spela('dubbel');
    }
    else if (typ === 'sold' && d.dubbel) UI.nivaSkylt('sold', null, d.niva);          // guldrutan med siffror före och efter (Johannes 2026-11-28)
    else if (typ === 'infor') { if (UI.nyttHar(d.id)) { G.s.nyttText = Object.assign(G.s.nyttText || {}, { [d.id]: d.text }); if ((G.s.nytt || []).indexOf(d.id) < 0) G.s.nytt = (G.s.nytt || []).concat(d.id); } else UI.notis(d.text, d.id); UI.tick(true); }          // en ny sak i taget, som en notis som står kvar tills man har tryckt på den eller stängt den (Johannes 2026-11-28)
    else if (typ === 'slagTryck') UI._studs = performance.now();
    else if (typ === 'malVald' && !fritt()) { UI._studs = performance.now(); UI.svar('Tryck nu på knappen', true); V.Ljud.spela('kop'); }
    else if (typ === 'malForst') { if (performance.now() > (UI._forstT || 0)) { UI._forstT = performance.now() + (fritt() ? 4000 : 1800); if (fritt()) UI.text(slagHur(G.uppdrag()), 3); else UI.svar('Tryck på ringen i slaget', false); } }          // ringen i slaget studsar till
    else if (typ === 'slagStart') { V.Ljud.spela('horn'); if (fritt(d.u)) { if (!V.tyst) { const a0 = G.s.aktivt, o0 = d.u.order[0]; a0.lasa = 1; UI.efter = () => { a0.lasa = 0; }; UI.berattar(UI.platsnamn(d.u.plats), d.u.ar, (o0 && o0.vanta ? o0.rad + '<br>' : '') + '<b>' + slagHur(d.u) + '</b>', []); } } else UI.skylt(d.u.belagring ? 'Belägringen börjar' : 'Slaget börjar', true); }          // en ruta att läsa och trycka bort, sedan strid (Johannes 2026-11-28)
    else if (typ === 'order' && fritt(d.u)) { if (!(d.i === 0 && d.typ === 'vanta')) UI.text(d.o.rad, 4.5); V.Ljud.spela(d.typ === 'vanta' ? 'trumma' : 'horn'); }          // slag utan ring: en kort rad per order, på samma ställe
    else if (typ === 'order') { const a0 = G.s.aktivt, ex = d.typ !== 'vanta' && a0 && !a0.forklarad ? 'Tryck många gånger på ringen i slaget. Den flyttar sig dit varje order gäller. Stapeln högst upp visar vem som är på väg att vinna.' : ''; if (ex) a0.forklarad = 1; UI.text(d.o.rad + (d.o.hur ? '<br>' + d.o.hur : '') + (ex ? '<br><b>' + ex + '</b>' : ''), d.typ === 'hugg' ? 6.8 : d.typ === 'vanta' ? 5.5 : 5, !!ex); V.Ljud.spela(d.typ === 'hugg' ? 'trumma' : 'horn'); }          // första gången förklaras varje sort          // i början av varje slag
    else if (typ === 'hugg') { UI.svar(d.traff ? 'Träff' : d.igen ? 'Vänta på nästa ring' : d.d < 0 ? 'Lite tidigt' : 'Lite sent', d.traff); }          // varje hugg får ett svar där ringen är
    else if (typ === 'orderVanta') UI.svar('Vänta tills ringen når pricken', false);
    else if (typ === 'orderSvar' && !fritt(d.u)) { if (!d.o.alltid && d.bra) UI.svar('Bra', true); }
    if (typ === 'orderSvar' && !fritt(d.u)) { UI.text(d.o.alltid || (d.bra ? d.o.bra : d.o.miss), 3.2); if (d.bra && !d.o.alltid) V.Ljud.spela('klart'); }
    else if (typ === 'kula') { UI.text(d.o.rad, 6.5); V.Ljud.spela('kanon'); Scene.shake(0.5); if (d.o.efter && !V.tyst) setTimeout(() => UI.text(d.o.efter, 6), 6800 / Math.min(snabb, 10)); }
    else if (typ === 'byggnad') { UI.skylt(d.b.skylt || d.b.namn + ' står klart'); if (d.b.klart) UI.notis(d.b.klart, d.id); V.Ljud.spela('hammare'); const w = Varld.byggPlats(d.id); if (w && !V.tyst) { Varld._foljPaus = performance.now() + 4000; Varld._foljD = Scene.cam.td; Scene.flyTo(w.x, w.z + 1, 22, 1.0); } UI.tick(true); }          // kameran går dit så att man ser huset resas
    else if (typ === 'hus') { if (d.niva === 1 && !d.h.start) { const ord = d.h.namn.split(' ')[0]; UI.skylt(d.h.namn + ' står ' + (/na$/.test(ord) ? 'klara' : /et$/.test(ord) ? 'klart' : 'klar')); const w = Varld.byggPlats(d.id); if (w && !V.tyst) { Varld._foljPaus = performance.now() + 4000; Varld._foljD = Scene.cam.td; Scene.flyTo(w.x, w.z + 1, 22, 1.0); } } UI.tick(true); }          // stadens hus: kameran går dit första gången
    else if (typ === 'handling') { V.Ljud.spela(d.id === 'tal' ? 'sorl' : d.id === 'monstra' ? 'horn' : 'kop'); const h = D.HANDLINGAR.find(q => q.id === d.id); UI.skylt(UI.handlNamn(h) + (d.fick ? ': +' + V.tal(d.fick) + ' män' : '')); }
    else if (typ === 'skattUt') { if (!d.auto) V.Ljud.spela('kop'); }
    else if (typ === 'skatt') { UI.skattKlar(d.mark); const p = Varld.skattTill && Varld.pos(Varld.skattTill); if (p) UI.flyt(p.x, p.y + 1.8, p.z, 'Skatt +' + V.tal(d.mark) + ' mark', 'mark'); if (!d.auto) V.Ljud.spela('samling'); }
    else if (typ === 'samling' && !d.lopare) { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 1.8, p.z, d.res === 'mark' ? 'Skatt +' + V.tal(d.antal) + ' mark' : '+' + V.tal(d.antal) + ' män går med', d.res); V.Ljud.spela('samling'); }
    else if (typ === 'niva' && d.dubbel) UI.nivaSkylt('bas', d.bas, d.niva);          // står kvar så att man hinner läsa den (Johannes 2026-11-28)
    else if (typ === 'stapel') { const q = Varld.varvPlats(); UI.flyt(q.x, 2.2, q.z, '+' + d.man + ' män på varvet (' + V.tal(d.alla) + ')', 'man'); }
    else if (typ === 'skepp') { const q = Varld.varvPlats(); UI.flyt(q.x, 2.2, q.z, 'Skeppet sjösätts vid Björkenäs', 'mark'); UI.skylt(d.n === 1 ? 'Ditt första skepp är sjösatt vid Björkenäs' : 'Ett skepp till är sjösatt: ' + d.n + ' i flottan'); V.Ljud.spela('dubbel'); }
    else if (typ === 'egenskap') { const e = G.egLista().find(q => q.id === d.id); if (e) UI.skylt(e.namn + ', nivå ' + d.niva); }
    else if (typ === 'leverans') UI.leverans(d);
    else if (typ === 'arbetare') { const p = Varld.pos(d.bas); UI.flyt(p.x, p.y + 2.4, p.z, d.antal + ' lag i gruvan', 'mark'); V.Fx.damm(p.x, p.y + 0.2, p.z, 10); }
    else if (typ === 'konst' && d.dubbel) UI.nivaSkylt('konst', d.id, d.niva);          // förmågorna dubblar inte var tionde nivå: rutan kommer bara när något faktiskt händer
    else if (typ === 'full') V.Ljud.spela('full');
    else if (typ === 'skickat') { V.Ljud.spela(d.u.slag === 'beslut' ? 'klocka' : 'horn'); if (V.Musik && (d.u.slag === 'tag' || d.u.strid)) V.Musik.spar('krig'); if (d.u.belagring && !d.u.order && !V.tyst) UI.text('Kristians armé och flotta stänger in Stockholm. Håll ut.', 9); }
    else if (typ === 'val') {
      const visa = () => { if (!V.tyst) UI.text(d.u.valText || 'Biskop Brask säger nej. Riksdagen tvekar.', 30); V.Ljud.spela('sorl'); };
      if (d.u.valScen && !V.tyst && V.Intro && V.Intro.scener[d.u.valScen]) V.Intro.scen(d.u.valScen, visa); else visa();          // först scenen, sedan valet
    }
    else if (typ === 'klart') {
      const u = d.u; V.Ljud.spela(u.strid === 'nederlag' ? 'nej' : 'klart'); if (V.Musik) V.Musik.spar(V.Musik.grund()); UI.textBort();
      if (!V.tyst && Scene.cam.d < UTSIKT - 2 && !Scene.cam.locked) Scene.flyTo(Scene.cam.x, Scene.cam.z, UTSIKT, 1.8);
      if (!V.tyst) { if (u.scen && V.Intro && V.Intro.scener[u.scen]) setTimeout(() => V.Intro.scen(u.scen, () => UI.klart(u)), (u.slag === 'tag' ? 250 : 1800) / Math.min(snabb, 10)); else UI.klart(u); }          // först scenen, sedan rutan som säger vad som hände
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

  // Ett tryck på ett av husen man byggt (Johannes 2026-11-28: "Man ska kunna trycka direkt på rådstugan för att uppgradera den, det gäller alla byggnader som hamnar osv").
  // Som med städerna: första trycket öppnar husets kort och kameran går dit och stannar där, nästa tryck bygger ut det.
  function husTryck(id) {
    const w = Varld.husPos(id);
    if (!UI.husVald(id)) { UI.visaHus(id); if (w) { Scene.flyTo(w.x, w.z + 1.2, Math.min(Scene.cam.d, 26), 0.9); Varld.foljHus(id); } return; }
    const svar = UI.husKop(id), h = D.BYGGNADER.find(q => q.id === id);
    if (svar === true) { if (!(h && h.niva)) Varld.husHopp(id); return; }          // stadens hus hoppar redan av sig själva (varld.js, händelsen hus)
    if (svar && w) UI.flyt(w.x, w.y + 2.2, w.z, svar, 'nej');
  }
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
    UI.onTestVarld = v => { byter = true; const lj = G.s.ljud, mu = G.s.musik; G.ny(); G.s.ljud = lj; G.s.musik = mu; G.s.arv = (D.VARLDAR[v] || {}).arvTest || 0; G.nyVarld(v); skriv(); laddaOm(); };          // testläget: vilken värld som helst från början, med dess film (Eriks värld är vägd för ungefär 40 arv från Gustav)
    UI.onIgen = arv => { byter = true; G.s.arv += arv; G.s.varv++; const s = G.ny(true); s.intro = true; skriv(); laddaOm(); };
    Scene.onClick = (e, g) => {
      if (spelar && G.skede() === 'strid' && (G.uppdrag() || {}).order) { const tr = Varld.slagKlick(e.clientX, e.clientY);          /* kameran ligger kvar där den är när man trycker på fienden (Johannes 2026-11-28) */ if (tr === 'traff') { tryck(false, 'ring'); return; } if (tr === 'ring') { tryck(false, 'ring'); return; } if (tr === 'miss') return; tryck(false, 'karta'); return; }          // slagen 2026-11-28: man trycker direkt på fienden (belägringarna har kvar sina ringar)          // ett tryck på ringen räknas, annars inte          // i ett slag i förspelet är varje tryck på kartan en order
      if (spelar && !G.skede() && Varld.hjalteVid && Varld.hjalteVid(e.clientX, e.clientY) && UI.kung()) { V.Ljud.vakna(); return; }          // kungen går före staden han står i
      { const hid = spelar ? Varld.husVid(e.clientX, e.clientY) : null; if (hid && UI.husMal(hid)) { V.Ljud.vakna(); husTryck(hid); return; } }          // ett av husen man byggt, som rådstugan eller hamnen (Johannes 2026-11-28)
      const id = Varld.basVid(g) || Varld.byggVid(g), egen = !!(id && spelar && G.s.bas[id]);
      if (egen && !(G.s.marknad && G.s.marknad.bas === id) && (!UI.stadVald(id) || UI.husValt())) { V.Ljud.vakna(); UI.visaStad(id); Varld.foljPlats(id); return; }          // ett tryck på en egen stad öppnar alltid dess flik först, också när hjälten står mitt i den (Johannes 2026-11-27); nästa tryck bygger ut den
      if (spelar && Varld.valjVid(e.clientX, e.clientY, egen)) { V.Ljud.vakna(); if (Varld.valdHjalte && !G.skede()) UI.kung(); return; }          // ett tryck på kungen öppnar hans sida (Johannes 2026-11-28)          // förspelet: det man trycker på följs (Johannes 2026-11-26)
      if (!egen) { tryck(); return; }
      if (G.s.marknad && G.s.marknad.bas === id) { V.Ljud.vakna(); G.marknadTa(); UI.tick(); return; }
      UI.valj(id); V.Ljud.vakna();
      if (!UI.kop(id)) { const w = Varld.pos(id), res = G.prisRes(id), fattas = G.pris(id) - G.s.res[res]; UI.flyt(w.x, w.y + 2.4, w.z, G.stoppad(id) ? 'Uppror' : fattas > 0 ? 'Fattas ' + V.tal(Math.ceil(fattas)) + (res === 'man' ? ' män' : ' mark') : 'Fattas ' + V.tal(Math.ceil(G.dagsverke(id) - G.s.res.man)) + ' män till dagsverken', 'nej'); V.Ljud.spela('trumma'); }
    };
    let svavT = 0;          // med mus: handen visar vad som går att trycka på, ett hus man byggt eller en egen stad
    Scene.onHover = e => {
      const nu = performance.now(); if (nu - svavT < 100) return; svavT = nu; const c = Scene.renderer.domElement; let ja = false;
      if (spelar && !V.pek && G.skede() !== 'strid' && !(V.Intro && V.Intro.aktiv)) { const hid = Varld.husVid(e.clientX, e.clientY); if (hid && UI.husMal(hid)) ja = true; else { const g = Scene.groundPoint(e.clientX, e.clientY), id = g && (Varld.basVid(g) || Varld.byggVid(g)); ja = !!(id && G.s.bas[id]); } }
      if (c.style.cursor !== (ja ? 'pointer' : '')) c.style.cursor = ja ? 'pointer' : '';
    };
    window.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) { haller = true; tryck(); } } else if (spelar && !e.repeat && /^Digit[1-3]$/.test(e.code)) UI.handla(+e.code.slice(5) - 1); });
    window.addEventListener('keyup', e => { if (e.code === 'Space') haller = false; }); window.addEventListener('blur', () => { haller = false; });
    const ak = document.getElementById('ak'); ak.addEventListener('pointerdown', () => { haller = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => ak.addEventListener(n, () => { haller = false; }));
    window.addEventListener('beforeunload', spara); document.addEventListener('visibilitychange', () => { if (document.hidden) spara(); });
    const S = G.s, film = q.get('intro') !== '0' && V.Intro;
    if (film && S.varld === 0 && S.t === 0) V.Intro.titel(() => { start(true); if (V.Startprat) V.Startprat.kor(0); else UI.forklara(0); });          // Sten Sture säger sina meningar i pratbubblor (startprat.js)                                      // helt nytt spel: titeln, sedan Sten Stures tid
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
      // att hålla in knappen eller mellanslag trycker inte längre av sig själv: varje tryck räknas en gång (Johannes 2026-11-28: "Man ska inte kunna hålla in, man måste trycka")
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
