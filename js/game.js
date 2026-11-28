// Spelets regler. Rör aldrig sidan eller 3D-världen: allt som ska synas skickas ut som händelser via Game.ut.
// Går att köra i node (tools/balansbot.js).
(function (root) {
  'use strict';
  const V = root.VASA = root.VASA || {}, D = V.DATA || require('./data.js');
  const BAS = {}; D.BASER.forEach(b => BAS[b.id] = b);
  const KONST = {}; D.KONSTER.forEach(k => KONST[k.id] = k);
  const TID = { bud: 7, tag: 16, rid: 11, flotta: 18, bygg: 12, beslut: 2.5 };       // uppdragens längd i sekunder om världen inte säger annat
  const KONST_MAX = 30, SOLD = { p0: 2, c0: 250, r: 1.3 }, SOLD0 = { p0: 0.25, c0: 80, r: 1.32 }, KAMP = 0.6;          // KAMP: så långt in i ett fälttåg börjar striden

  // varld 0 = förspelet (Sten Sture den yngre 1512–1520), varld 1 = Gustav Vasa.
  function nytt(varld) {
    const v = D.VARLDAR[varld] ? varld : 1, Vd = D.VARLDAR[v];          // varje värld: sin start, sin hjälte, sin titel (D.VARLDAR)
    return { v: 1, varld: v, t: 0, sparad: Date.now(), res: { man: 0, mark: 0 }, tot: { man: 0, mark: 0 }, skuld: 0, skuldMax: 0, bas: Object.assign({}, Vd.start), konst: { skidor: 0, tal: 0, bud: 0, sigill: 0, langd: 0 }, sold: 0, handl: {},
      nasta: 0, aktivt: null, x: { man: 1, mark: 1 }, las: Object.assign({}, Vd.las), uppror: {}, fart: 0, full: false, sistaTryck: 99, tryck: 0, fartX: 1, fogde: {}, titel: Vd.titel, hjalte: Vd.hjalte,
      kronika: [], datum: 0, intro: false, arv: 0, varv: 0, slut: false, borg: {}, ljud: true, tips: {}, forspel: {}, husPlan: 1 };
  }
  let S = nytt(1);
  const par = {};          // basens siffror i den värld som spelas
  function P(id) { const k = S.varld + id, O = S.varld === 0 ? D.STURE_BAS : D[(D.VARLDAR[S.varld] || {}).basVarden] || null; return par[k] || (par[k] = O && O[id] ? Object.assign({}, BAS[id], O[id]) : BAS[id]); }          // förspelet och Eriks värld har egna siffror
  Object.defineProperty(D, 'UPPDRAG', { get() { return D[(D.VARLDAR[S.varld] || D.VARLDAR[1]).lista]; }, configurable: true });
  const G = V.Game = {
    get s() { return S; }, BAS, KONST, KONST_MAX,
    ut: function () {},                 // händelser till gränssnittet: (typ, data)
    ny(arv) { const gammal = S; S = nytt(gammal.varld); if (arv) { S.arv = gammal.arv; S.varv = gammal.varv; S.intro = true; S.ljud = gammal.ljud; S.forspel = gammal.forspel; } return S; },
    // Byt värld. Från förspelet följer städernas storlek med (de står kvar, nu i Kristians händer) och krönikan.
    nyVarld(v) { const g = S; S = nytt(v); S.ljud = g.ljud; S.musik = g.musik; S.arv = g.arv; S.varv = g.varv; if (v === 1 && g.varld === 0 && g.nasta > 0) { S.forspel = Object.assign({}, g.bas); S.kronika = g.kronika.slice(); } if (v === 2 && g.varld === 1) S.forspel = Object.assign({}, g.bas); return S; },          // Gustavs städer står kvar när Erik tar över
    // ---- en ny sak i taget (förspelet, Johannes 2026-11-26): varje ny knapp, byggnad och förmåga kommer för sig, med en lugn rad om vad den är ----
    // nar = när den annars hade funnits. Den första som kan komma kommer, sedan dröjer det minst INFOR_MELLAN sekunder till nästa.
    INFOR_MELLAN: 55,
    INFOR: [
      { id: 'bryggor', nar: () => G.husFinns0('bryggor'), text: 'Stockholm har bryggor där Hansans skepp lägger till. Under Stockholms flik kan du bygga ut dem, så ger staden mer mark.' },
      { id: 'skatt', nar: () => G.harSkatt0(), text: 'Nu kan du driva in skatt: skicka ut män, så kommer de hem med mark. Kortet ligger under Män.' },
      { id: 'knektar', nar: () => G.byggnader0().some(b => b.id === 'knektar'), text: 'Vid slottet kan du bygga ett hus för knektar. Sedan kan mark bli män.' },
      { id: 'vhamn', nar: () => G.husFinns0('vhamn'), text: 'I Västerås hamn skeppas järn och koppar från Bergslagen ut. Under Västerås flik kan den byggas ut.' },
      { id: 'garnison', nar: () => G.husFinns0('garnison'), text: 'Vid Åbo slott ligger en garnison. Under Åbos flik kan den växa, så ger Åbo fler män.' },
      { id: 'h:tal', nar: () => G.harHandling0('tal'), text: 'Sten Sture kan tala till folket. Knappen Tala ger män, och sedan behöver han vila en stund.' },
      { id: 'radstuga', nar: () => G.byggnader0().some(b => b.id === 'radstuga'), text: 'I Stockholm kan du bygga rådstugan. Där skrivs och beseglas breven.' },
      { id: 'k:tal', nar: () => G.harKonst0('tal'), text: 'Sedan bönderna valde Sten Sture lyssnar fler när han kommer. Förmågan Ordets makt ligger under Män.' },
      { id: 'gardar', nar: () => G.husFinns0('gardar'), text: 'Kring Nyköping kan det bli fler gårdar. Då ger bönderna där fler män.' },
      { id: 'marknad', nar: () => S.t > 60, text: 'Ibland är det marknadsdag i en stad. Då står en gyllene knapp över staden: tryck på den.' },
      { id: 'ladugard', nar: () => G.byggnader0().some(b => b.id === 'ladugard'), text: 'Kronans gård vid Vädla kan byggas ut. Då rymmer armén fler.' },
      { id: 'k:bud', nar: () => G.harKonst0('bud'), text: 'Efter segern vid Vädla kan Sten Sture skicka fler bud. Förmågan Fler bud ligger under Mark.' },
      { id: 'disting', nar: () => G.husFinns0('disting'), text: 'Uppsala har en stor marknad i februari, Distingen. Under Uppsalas flik kan den byggas ut.' },
      { id: 'torn', nar: () => G.byggnader0().some(b => b.id === 'torn'), text: 'Stockholms mur kan få nya torn. De ger fler män och skjuter när staden belägras.' },
    ],
    inford(id) { return S.varld !== 0 || !G.INFOR.some(q => q.id === id) || !!(S.inford && S.inford[id]); },
    _infor() {
      if (S.varld !== 0 || S.slut || G.skede() || S.t < 45 || S.t - (S.infordT || 0) < G.INFOR_MELLAN) return; const inf = S.inford || (S.inford = {});
      for (const q of G.INFOR) { if (inf[q.id] || !q.nar()) continue; inf[q.id] = S.t; S.infordT = S.t; G.ut('infor', { id: q.id, text: q.text }); return; }
    },
    inforAlla() { const inf = S.inford || (S.inford = {}); for (const q of G.INFOR) if (!inf[q.id]) inf[q.id] = S.t || 1; },          // för provet
    ladda(o) { S = Object.assign(nytt(D.VARLDAR[o.varld] ? o.varld : 1), o); S.res = Object.assign({ man: 0, mark: 0 }, o.res); S.x = Object.assign({ man: 1, mark: 1 }, o.x); S.konst = Object.assign({ skidor: 0, tal: 0, bud: 0, sigill: 0, langd: 0 }, o.konst); if (S.varld === 1 && S.nasta > D.VASA.findIndex(u => u.id === 'hedemora')) S.las.sold = true; if (!S.husPlan) { S.husPos = {}; S.husPlan = 1; } if (!S.skattLag) S.skattLag = S.skatt ? [Object.assign({ nr: 1 }, S.skatt)] : []; if (S.varld === 0 && !S.inford && S.t > 0) { S.inford = {}; for (const q of G.INFOR) if (q.nar()) S.inford[q.id] = 1; } return S; },
    alla() { return D.STURE.concat(D.VASA); },

    // Hären kan inte bli hur stor som helst: taket följer vad nästa fälttåg kräver (uppdragens manskap är historiens siffror).
    // Män är alltså en mätare som fylls på, inte en hög som växer: de används till fälttåg, till att bygga ut bygderna och till att driva in skatt.
    tak() {
      let n = 0; for (let k = S.nasta; k < D.UPPDRAG.length && !n; k++) n = D.UPPDRAG[k].kostar.man || 0;
      const lg = S.varld === 0 && S.bygg && S.bygg.ladugard ? 1.25 : 1, tk = S.titel === 'Kung' && (D.VARLDAR[S.varld] || {}).takKung || 0, t = Math.max(30, tk, Math.ceil(n * 1.25 * lg / 10) * 10); if (!(S.tak >= t)) S.tak = t; return S.tak;          // kungsladugården föder fler; takKung: som kung har man rikets stående armé (Eriks värld, Johannes 2026-11-28)
    },
    // En bygd kan inte bli större än hären tillåter: kostar nästa nivå fler män än hären rymmer får den vänta tills hären har vuxit.
    maxad(id) { return G.prisRes(id) === 'man' && !!S.bas[id] && (G.pris(id) > G.tak() || G.manFull()); },
    // Från Eriks värld (Johannes 2026-11-28: "jag genererar så mycket män så jag kan spamma den och inte förlora en enda"): armén fylls som fortast på MAN_FYLL sekunder.
    // Det som ger män kan inte ge mer än så, och kan inte byggas ut förbi det. Då kostar det något att skicka iväg män. Förspelet och Gustavs värld är som förut.
    MAN_FYLL: 40,
    manRa() { let s = G.soldProd(); for (const id in S.bas) if (BAS[id].ger === 'man') s += G.prod(id); return s; },
    manTak() { return S.varld >= 2 ? G.tak() / G.MAN_FYLL : Infinity; },
    manF() { const ra = G.manRa(), t = G.manTak(); return ra > t ? t / ra : 1; },
    manFull() { return S.varld >= 2 && G.manRa() >= G.manTak(); },
    // ---- baser ------------------------------------------------------------------------------
    niva(id) { return S.bas[id] || 0; },
    stoppad(id) { for (const u in S.uppror) if (S.uppror[u] && D.UPPROR[u].baser.indexOf(id) >= 0) return u; return null; },
    // Hur mycket var tionde nivå ger (Johannes 2026-11-28: summorna ska passa verkligheten, samma tempo). 2 = dubbelt, som förut. Världen sätter sin egen i D.VARLDAR (dubbel).
    dub() { return (D.VARLDAR[S.varld] || {}).dubbel || 2; },
    arvX() { return 1 + S.arv * 0.25; },
    // produktion per sekund för en bas, utan fartbonus
    prod(id, niva) {
      const b = P(id), L = niva === undefined ? (S.bas[id] || 0) : niva; if (!L) return 0;
      if (niva === undefined && G.stoppad(id)) return 0;
      let p = b.p0 * L * Math.pow(G.dub(), Math.floor(L / 10)) * S.x[b.ger] * G.arvX() * G.gang(b.ger);
      p *= G.husX(id);          // stadens hus
      if (b.slag === 'stad' && S.las.privilegier) p *= 0.5;                         // Lübeck tar handeln
      if (b.slag === 'gruva') p *= 1 + 0.1 * G.arb(id);                             // gruvarbetare: en tiondel mer för varje lag
      p *= b.ger === 'mark' ? G.tullX() : G.egX('man');                              // skeppens tull och kungens krigskonst (Eriks värld)
      return p;
    },
    fullX() { return 2 + Math.floor(S.konst.skidor / 10); },                       // så mycket ger full fart
    takt(res) { let s = res === 'man' ? G.soldProd() : 0; for (const id in S.bas) if (BAS[id].ger === res) s += G.prod(id); if (res === 'man') s *= G.manF(); return s * (S.full ? G.fullX() : 1); },
    // ---- sold: knektar som får betalt. Köps för mark och ger män, och var tionde nivå dubblar som allt annat. ----
    // Mynten i Hedemora 1521 slogs för att betala hären, och 1522 kom de första tyska legoknektarna.
    // I förspelet (SOLD0) är det knektar i Sten Stures tjänst, med förspelets små siffror. De låses upp av huset för knektar (D.BYGGNADER).
    soldProd(L) { const So = S.varld === 0 ? SOLD0 : SOLD; L = L === undefined ? (S.sold || 0) : L; return L ? So.p0 * L * Math.pow(G.dub(), Math.floor(L / 10)) * S.x.man * G.arvX() * G.gang('man') * G.egX('man') : 0; },
    soldPris() { const So = S.varld === 0 ? SOLD0 : SOLD, p = So.c0 * Math.pow(So.r, S.sold || 0); return p < 1000 ? Math.ceil(p) : p; },
    // ---- byggnader (förspelet): köps för mark, byggs vid platsen och låser upp något ----
    byggnader() { return G.byggnader0().filter(b => G.inford(b.id)); },
    byggnader0() { return S.varld === 0 && !S.slut ? D.BYGGNADER.filter(b => !b.niva && S.nasta >= b.fran && (!b.plats || S.bas[b.plats]) && !(S.bygg && S.bygg[b.id])) : []; },
    kanBygga(id) { const b = G.byggnader().find(q => q.id === id); return !!b && S.res.mark >= b.kostar; },
    bygg(id) { if (!G.kanBygga(id)) return false; const b = D.BYGGNADER.find(q => q.id === id); S.res.mark -= b.kostar; (S.bygg || (S.bygg = {}))[id] = 1; if (b.las) S.las[b.las] = true; if (b.xman) S.x.man *= b.xman; G.ut('byggnad', { id, b }); return true; },
    // ---- stadens hus (förspelet): köps i stadens flik, och varje nivå ger staden mer av det den ger (Johannes 2026-11-26) ----
    hus(id) { return (S.hus && S.hus[id]) || 0; },
    iVarld(h) { const v = h.varld || 0; return Array.isArray(v) ? v.indexOf(S.varld) >= 0 : v === S.varld; },          // hör huset till världen som spelas?
    husFinns(id) { return G.husFinns0(id) && G.inford(id); },
    husFinns0(id) { const h = D.BYGGNADER.find(q => q.id === id); return !!h && G.iVarld(h) && !S.slut && !!h.niva && S.nasta >= h.fran && !!S.bas[h.plats]; },
    husLista() { return D.BYGGNADER.filter(h => h.niva && G.husFinns(h.id)).map(h => h.id); },
    husRes(h) { return BAS[h.plats].ger; },
    husPris(id) { const h = D.BYGGNADER.find(q => q.id === id), p = (h.c0 || P(h.plats).c0 * h.cx) * Math.pow(h.r, G.hus(id)); return p < 1000 ? Math.ceil(p) : p; },          // Gustavs hus: cx gånger platsens första pris
    kanHus(id) { const h = D.BYGGNADER.find(q => q.id === id); return G.husFinns(id) && S.res[G.husRes(h)] >= G.husPris(id); },
    kopHus(id) { if (!G.kanHus(id)) return false; const h = D.BYGGNADER.find(q => q.id === id), res = G.husRes(h); S.res[res] -= G.husPris(id); (S.hus || (S.hus = {}))[id] = G.hus(id) + 1; G.ut('hus', { id, h, niva: S.hus[id] }); return true; },
    husX(plats) { if (!S.hus) return 1; let x = 1; for (const h of D.BYGGNADER) if (h.niva && G.iVarld(h) && h.plats === plats && S.hus[h.id]) x *= 1 + h.ger * S.hus[h.id]; return x; },
    kanSold() { return !!S.las.sold && !G.manFull() && S.res.mark >= G.soldPris(); },
    kopSold() { if (!G.kanSold()) return false; S.res.mark -= G.soldPris(); S.sold = (S.sold || 0) + 1; G.ut('sold', { niva: S.sold, dubbel: S.sold % 10 === 0 }); return true; },
    pris(id, L) { const b = P(id), p = b.c0 * Math.pow(b.r, L === undefined ? (S.bas[id] || 0) : L); return p < 1000 ? Math.ceil(p) : p; },
    // Vad en utbyggnad betalas med: män bygger män, allt annat kostar mark. (Johannes prövade tanken att allt skulle kosta mark
    // natten mot 2026-11-26 och ångrade sig: "Män ska bygga män, det är bättre så".) De män man har får fler att sluta upp.
    prisRes(id) { return BAS[id].ger === 'man' ? 'man' : 'mark'; },
    rad(id) { const L = S.bas[id] || 0; return (L + 1) % 10 === 0; },             // är nästa nivå en dubbling?
    // Dagsverken: när något stort byggs på en plats som ger mark (var tionde nivå: stadsmuren, slottet, en ny hytta) arbetar män på bygget.
    // Det kostar tre tiondelar av vad armén rymmer, utöver marken. Finns inga män än kostar det inget.
    dagsverke(id) { if (BAS[id].ger === 'man' || !G.rad(id) || !Object.keys(S.bas).some(b => BAS[b].ger === 'man')) return 0; return Math.max(5, Math.ceil(G.tak() * 0.3 / 5) * 5); },
    kanKopa(id) { return !!S.bas[id] && S.res[G.prisRes(id)] >= G.pris(id) && S.res.man >= G.dagsverke(id); },
    kop(id) {
      if (!G.kanKopa(id)) return false; const dv = G.dagsverke(id);
      S.res[G.prisRes(id)] -= G.pris(id); if (dv) { S.res.man -= dv; S.dagsN = (S.dagsN || 0) + 1; } S.bas[id]++;
      G.ut('niva', { bas: id, niva: S.bas[id], dubbel: S.bas[id] % 10 === 0, dagsverke: dv });
      return true;
    },
    // Gruvarbetare: män som sätts i arbete i en gruva. De lämnar armén, och gruvan ger en tiondel mer för varje lag.
    // Ett lag kan inte vara större än armén, så antalet växer med historien.
    arb(id) { return (S.arb && S.arb[id]) || 0; },
    arbPris(id) { return Math.ceil(20 * Math.pow(1.35, G.arb(id)) / 5) * 5; },
    arbMax(id) { return G.arbPris(id) > G.tak(); },
    kanArb(id) { return BAS[id].slag === 'gruva' && !!S.bas[id] && !G.stoppad(id) && !G.arbMax(id) && S.res.man >= G.arbPris(id); },
    kopArb(id) { if (!G.kanArb(id)) return false; S.res.man -= G.arbPris(id); if (!S.arb) S.arb = {}; S.arb[id] = G.arb(id) + 1; G.ut('arbetare', { bas: id, antal: S.arb[id] }); return true; },
    // ---- varvet (Eriks värld, Johannes 2026-11-28: "ett tidsenligt korrekt arbete att sätta män i"): män bygger skepp på Björkenäs skeppsgård norr om Kalmar,
    // där Mars kölsträcktes 1561. Lag av män arbetar där och bygger skepp efter skepp, fler män går fortare (Johannes 01:48). Färdiga skepp tar tull av fartygen på Östersjön (Klas Horns flotta 1565–1566):
    // varje skepp ger en tjugofemtedel mer mark. Männen lämnar armén, så armén har plats igen. Grunden och förenklingen står i docs/historia.md.
    VARV_ARB: 150000, VARV_LAG: 50, VARV_MAX: 500, TULL: 0.02, SKEPP_MAX: 25,          // 500 män bygger första skeppet på fem minuter, ett lag på 50 min          // VARV_ARB: mansekunder för första skeppet (hela armén på 750 bygger det på en minut, ett lag på 75 på tio), varje skepp en femtedel mer
    harVarv() { return S.varld === 2 && !!S.bas.kalmar && !S.slut; },
    skepp() { return S.skepp || 0; },
    varvMan() { return S.varvMan || 0; },          // män som arbetar på skeppsgården. De stannar där och bygger skepp efter skepp.
    varvLag() { return G.VARV_LAG; },
    varvFullt() { return G.varvMan() >= G.VARV_MAX; },          // skeppsgården har plats för några hundra arbetare, inte fler
    skeppArbete() { return G.VARV_ARB * Math.pow(1.15, G.skepp()); },
    flottanFull() { return G.skepp() >= G.SKEPP_MAX; },          // flottan blir inte större än så (tullen högst +50 %)
    skeppKvar() { const s = S.stapel; return s && G.varvMan() && !G.flottanFull() ? (1 - s.t) * G.skeppArbete() / G.varvMan() : Infinity; },          // sekunder kvar på skeppet som byggs
    kanSkepp() { return G.harVarv() && !G.flottanFull() && !G.varvFullt() && S.res.man >= G.varvLag(); },
    kopSkepp() { if (!G.kanSkepp()) return false; const m = G.varvLag(); S.res.man -= m; S.varvMan = G.varvMan() + m; if (!S.stapel) S.stapel = { t: 0 }; G.ut('stapel', { man: m, alla: S.varvMan }); return true; },          // ett lag till på varvet
    tullX() { return S.varld === 2 ? 1 + G.TULL * G.skepp() * (1 + 0.1 * G.eg('flotta')) : 1; },          // flottans egenskap gör varje skepp värt mer
    _varv(dt) { const s = S.stapel; if (s && s.man && !S.varvMan) { S.varvMan = s.man; s.t = Math.min(0.99, s.t / 30); delete s.man; } if (!G.varvMan() || G.flottanFull()) return; const q = S.stapel || (S.stapel = { t: 0 }); q.t += dt * G.varvMan() / G.skeppArbete(); while (q.t >= 1 && !G.flottanFull()) { q.t -= 1; S.skepp = G.skepp() + 1; G.ut('skepp', { n: S.skepp }); } },          // äldre sparfiler: ett skepp på stapeln blir ett lag på varvet
    // ---- kungens egenskaper (Johannes 2026-11-28): tryck på kungen, så öppnas hans sida. Dyra nivåer som gör en sak mer givande, aldrig en resa kortare.
    // Varje värld har sina egna (D.EGENSKAPER[varld]), med grund i det källorna säger om regenten (docs/historia.md).
    egLista() { return (D.EGENSKAPER && D.EGENSKAPER[S.varld]) || []; },
    eg(id) { return (S.eg && S.eg[id]) || 0; },
    EG_MAX: 10,
    egPris(id) { const e = G.egLista().find(q => q.id === id); return e ? e.c0 * Math.pow(e.r, G.eg(id)) : Infinity; },
    kanEg(id) { const e = G.egLista().find(q => q.id === id); return !!e && !S.slut && G.eg(id) < G.EG_MAX && S.res.mark >= G.egPris(id); },
    kopEg(id) { if (!G.kanEg(id)) return false; S.res.mark -= G.egPris(id); if (!S.eg) S.eg = {}; S.eg[id] = G.eg(id) + 1; G.ut('egenskap', { id, niva: S.eg[id] }); return true; },
    egX(vad) { let x = 1; for (const e of G.egLista()) if (e.ger === vad) x *= 1 + e.steg * G.eg(e.id); return x; },          // vad = 'man' (all produktion av män) eller 'skatt'
    // ---- kungens förmågor ---------------------------------------------------------------------
    konstPris(id) { const k = KONST[id], p = k.c0 * Math.pow(k.r, S.konst[id]); return p < 1000 ? Math.ceil(p) : p; },
    // I förspelet kommer varje förmåga från en byggnad eller ett steg (KONSTER bygg0 och steg0). I Gustavs värld låses alla upp på en gång.
    harKonst(id) { return G.harKonst0(id) && (S.varld !== 0 || !KONST[id].steg0 || G.inford('k:' + id)); },
    harKonst0(id) {
      if (id === 'langd' && !G.harSkatt()) return false;          // skattelistor först när det finns skatt att driva in
      if (S.varld !== 0) return !!S.las.konster; const k = KONST[id];
      return k.bygg0 ? !!(S.bygg && S.bygg[k.bygg0]) : S.nasta > D.STURE.findIndex(u => u.id === k.steg0);
    },
    kanKonst(id) { return G.harKonst(id) && S.konst[id] < KONST_MAX && S.res.mark >= G.konstPris(id); },
    tryckSek() { return 0.3 * (1 + 0.05 * S.konst.sigill); },                 // så många sekunders inkomst ger ett tryck
    skattSek() { return 12 * (1 + 0.05 * S.konst.langd); },                    // och så många ger en skatteindrivning
    kopKonst(id) { if (!G.kanKonst(id)) return false; S.res.mark -= G.konstPris(id); S.konst[id]++; G.ut('konst', { id, niva: S.konst[id], dubbel: S.konst[id] % 10 === 0 }); return true; },
    hastighet() { return 2.3 * (1 + Math.min(40, S.konst.skidor) * 0.045); },                                    // Gustavs toppfart i världsenheter per sekund
    samling() { return (6 + S.konst.tal * 0.8) * Math.pow(G.dub(), Math.floor(S.konst.tal / 10)); },     // sekunders produktion per besök
    lopare() { return S.las.konster && S.konst.bud > 0 ? Math.min(6, 1 + Math.floor(S.konst.bud / 5)) : 0; },
    lopFart() { return 1.5 * (1 + S.konst.bud * 0.03); },
    lopSamling() { return G.samling() * 0.15 * Math.pow(G.dub(), Math.floor(S.konst.bud / 10)); },

    // ---- farten: mätaren fylls av tryck, sjunker sakta och ger dubbel produktion när den är full ----
    // ---- egna handlingar: sådant hjälten gör själv, med vila emellan ------------------------------
    harHandling(id) { return G.harHandling0(id) && (id !== 'tal' || G.inford('h:tal')); },
    harHandling0(id) {
      if (S.slut) return false; const harMan = Object.keys(S.bas).some(b => BAS[b].ger === 'man');
      // i förspelet kommer en ny sak i taget: breven när man blivit riksföreståndare (steg 3), talet steget efter
      if (id === 'tal') return S.nasta >= (S.varld === 0 ? 4 : 1) && harMan;
      if (id === 'brev') return (S.varld === 0 ? !!(S.bygg && S.bygg.radstuga) : S.nasta >= 1) && !!S.las.mark && G.takt('mark') > 0;          // i förspelet skrivs breven i rådstugan
      return S.varld >= 1 && !!S.las.sold;                              // mönstra: först när armén har övats i Hedemora (finns inte i förspelet)
    },
    handlingar() { return D.HANDLINGAR.filter(h => G.harHandling(h.id)); },
    handl(id) { if (!S.handl) S.handl = {}; return S.handl[id] || (S.handl[id] = { t: 0, v: 0 }); },
    kanHandla(id) { return G.harHandling(id) && G.handl(id).v <= 0; },
    handla(id) {
      if (!G.kanHandla(id)) return false; const h = D.HANDLINGAR.find(q => q.id === id), o = G.handl(id); o.v = h.vila; o.t = h.tid || 0;
      let fick = 0; if (h.direkt) { fick = Math.max(0, Math.min(G.tak() * h.direkt, G.tak() - S.res.man)); S.res.man += fick; S.tot.man += fick; }
      G.ut('handling', { id, fick }); return true;
    },
    // så många gånger mer ger allt av en tillgång just nu, medan en handling verkar
    gang(res) { let x = 1; if (S.handl) for (const h of D.HANDLINGAR) if (h.ger && h.ger[res] && S.handl[h.id] && S.handl[h.id].t > 0) x *= h.ger[res]; return x; },

    // Varje tryck svarar direkt: mätaren fylls på sex tryck, budet får ett ryck framåt (upp till dubbel fart),
    // och man får något direkt i handen: minst en mark eller en man, annars en kvarts sekunds inkomst.
    tryck(auto, mal) {          // mal = 'traff' eller 'miss' när man trycker på slagfältet i förspelets slag (main.js), annars inget          // auto = knappen hålls in och spelet trycker själv: det räknas inte som en order i ett slag
      { const m = S.aktivt && S.aktivt.mom; if (m && !m.svar && !auto && m.typ !== 'vanta') {          // förspelets slag: först ringen i slaget, sedan knappen. Att hålla in räknas inte.
        if (mal !== 'ring') { if (mal !== 'karta') G.ut('malForst', {}); }          // knappen räknas inte: man trycker på ringen
        else { m.n = (m.n || 0) + 1; const a = S.aktivt, u = D.UPPDRAG.find(q => q.id === a.id); a.lage = Math.min(u && (u.strid === 'nederlag' || u.forlust) ? 0.7 : 0.94, (a.lage === undefined ? 0.5 : a.lage) + 0.018); G.ut('slagTryck', { o: u && u.order && u.order[m.i] }); } } }
      const kraft = Math.min(1, S.sistaTryck);          // det man får laddas upp över en sekund: att hamra ger inte mer än att trycka i lugn takt
      S.fart = Math.min(1, S.fart + 0.17); S.sistaTryck = 0; S.tryck++; S.ryck = Math.min(1, (S.ryck || 0) + 0.5);
      if (S.fart >= 1 && !S.full) { S.full = true; G.ut('full', {}); }
      const fick = {}, tak = G.tak(), sk = G.skede(); if (sk) { fick.skede = sk; S.aktivt.slag = (S.aktivt.slag || 0) + 1; }
      for (const r of ['mark', 'man']) {
        if (r === 'mark' ? !S.las.mark : !Object.keys(S.bas).some(id => BAS[id].ger === 'man')) continue;
        let n = Math.max(1 + S.konst.sigill * 0.25, G.takt(r) * G.tryckSek()) * kraft; if (r === 'man') n = Math.max(0, Math.min(n, tak - S.res.man)); if (n <= 0) continue;
        S.res[r] += n; S.tot[r] += n; fick[r] = n;
      }
      G.ut('tryck', fick); return fick;
    },
    // ---- striden: där är spelaren med ------------------------------------------------------------
    // Medan striden pågår syns varje tryck på kartan (en salva, en stöt). Det går aldrig fortare för det:
    // inget tryck får göra en resa eller ett moment kortare, man ska alltid se hela vägen (Johannes 2026-11-25).
    KAMP,
    skede() { const a = S.aktivt; if (!a || a.val) return null; const u = D.UPPDRAG.find(q => q.id === a.id); return u && (u.strid || (u.belagring && u.order)) && a.t / a.dur >= (u.belagring ? 0 : (a.k0 || KAMP)) ? 'strid' : null; },          // förspelets belägring av Stockholm är också ett slag, från början
    // ---- förspelets slag: order i rätt ögonblick -----------------------------------------------
    // Slaget har två eller tre ögonblick (D.STURE order). I vart och ett sluter sig en ring kring knappen, och ett tryck när den är framme
    // är rätt läge. Utgången följer historien vad man än gör: det man spelar om är hur många av männen som kommer hem (_klar).
    ORDER: { borjan: 1.5, langd: 5, mellan: 1.5, mal: 3.2, slack: 0.7, hugg: 7, takt: 1.1, fonster: 0.35, tps: 2.2, efterKula: 9 },          // tps = tryck i sekunden som ger fullt
    // Slagets ögonblick i tid: när vart och ett börjar och hur länge det varar. slut = när det sista är över (efter kanonkulan: när han är buren ur striden).
    _plan(u) {
      if (u._plan) return u._plan; const O = G.ORDER, mom = []; let t = O.borjan, kula = false;
      for (const o of u.order) { const typ = o.hand === 'kula' ? 'kula' : o.hugg ? 'hugg' : o.vanta ? 'vanta' : 'order', langd = typ === 'kula' ? 0 : typ === 'hugg' ? O.hugg : typ === 'vanta' ? o.vanta : O.langd; mom.push({ typ, start: t, langd }); if (typ === 'kula') { kula = true; t += O.efterKula; break; } t += langd + (u.belagring ? 2.5 : O.mellan); }          // belägringen i lugnare takt
      return (u._plan = { mom, slut: t, kula });
    },
    slagTid(u) { const P = G._plan(u); return P.slut + (u.strid === 'nederlag' && !P.kula ? 6 : 3); },          // och en stund efteråt: de som vann trycker på, de som förlorade flyr
    _order(dt) {
      const a = S.aktivt; if (!a || a.val || a.kula) return; const u = D.UPPDRAG.find(q => q.id === a.id); if (!u || !u.order || G.skede() !== 'strid') return;
      const P = G._plan(u), tb = a.t - (u.belagring ? 0 : a.dur * (a.k0 || KAMP)); if (!a.borjat) { a.borjat = 1; a.lage = 0.5; G.ut('slagStart', { u }); }
      { const seger = u.strid !== 'nederlag';          // dragkampen: dina tryck för den mot dig, motståndaren tar tillbaka, och efter sista ordern går den dit historien gick
        if (tb > P.slut) a.lage += ((seger ? 0.88 : 0.12) - a.lage) * Math.min(1, (dt || 0) * 0.8);
        else if (a.mom && !a.mom.svar && a.mom.typ !== 'vanta') a.lage -= 0.035 * (dt || 0);
        else a.lage += (0.5 - a.lage) * 0.12 * (dt || 0);
        a.lage = Math.max(0.04, Math.min(0.96, a.lage)); }
      let i = -1; for (let k = 0; k < P.mom.length; k++) if (tb >= P.mom[k].start) i = k;
      if (a.mom && !a.mom.svar && (a.mom.i !== i || tb - P.mom[a.mom.i].start > P.mom[a.mom.i].langd)) G._momSlut(u, P);          // ögonblicket är över
      if (i < 0) return; const m = P.mom[i], tm = tb - m.start; if (tm > m.langd) return;          // pausen mellan två
      if (!a.mom || a.mom.i !== i) {
        const o = u.order[i]; if (m.typ === 'kula') { a.kula = true; a.mom = null; a.lage = 0.22; G.ut('kula', { u, o }); return; }
        const forst = !(S.lart && S.lart[m.typ]); S.lart = S.lart || {}; S.lart[m.typ] = 1;          // första gången varje sort kommer förklaras den
        a.mom = { i, typ: m.typ, svar: null, tm: 0, traff: 0, miss: 0, slag: {} }; G.ut('order', { u, o, i, typ: m.typ, forst });
      }
      a.mom.tm = tm;
    },
    // Hugg i takt: en ring når knappen var takt-sekund. Ett tryck när den är där är ett hugg som tar. Tryck emellan är slag i luften.
    _hugg(m) {
      const O = G.ORDER, j = Math.round(m.tm / O.takt), n = Math.floor(O.hugg / O.takt), u = D.UPPDRAG.find(q => q.id === S.aktivt.id), o = u && u.order[m.i];
      const d = m.tm - Math.max(1, j) * O.takt;          // hur långt från takten trycket kom: minus är för tidigt
      if (j >= 1 && j <= n && Math.abs(d) <= O.fonster && !m.slag[j]) { m.slag[j] = 1; m.traff++; G.ut('hugg', { traff: true, o, d }); } else { m.miss++; G.ut('hugg', { traff: false, o, d, igen: !!m.slag[j] }); }
    },
    _momSlut(u, P) {
      const a = S.aktivt, m = a.mom, o = u.order[m.i], O = G.ORDER;
      if (m.typ === 'vanta') { m.svar = 'klar'; return; }
      const mal = Math.max(4, P.mom[m.i].langd * O.tps), p = Math.min(1, (m.n || 0) / mal), bra = p >= 0.5;          // halva vägen räcker för att det ska gå bra
      m.svar = bra ? 'bra' : 'svag'; if (!o.alltid) a.poang = (a.poang || 0) + p; else a.lage = Math.max(0.12, (a.lage || 0.5) - 0.3); G.ut('orderSvar', { u, o, i: m.i, bra, svar: m.svar, typ: m.typ });          // anfallet som slogs tillbaka
    },
    _orderSvar(tryckt) {
      const a = S.aktivt, u = D.UPPDRAG.find(q => q.id === a.id), o = u.order[a.mom.i], O = G.ORDER, d = a.mom.tm - O.mal, bra = tryckt && Math.abs(d) <= O.slack;
      a.mom.svar = bra ? 'bra' : !tryckt ? 'sent' : d < 0 ? 'tidigt' : 'sent'; if (bra && !o.alltid) a.poang = (a.poang || 0) + 1; G.ut('orderSvar', { u, o, i: a.mom.i, bra, svar: a.mom.svar, typ: 'order' });
    },
    fartNu() { return (0.12 + 0.88 * S.fart) * (1 + (S.ryck || 0)); },          // hur fort hjälten far just nu, som del av toppfarten

    // ---- driv in skatt: skicka ut män som kommer hem med mark ---------------------------------
    // Det kostar fyra tiondelar av vad hären rymmer och ger en kvarts minuts inkomst. Så är män värda något också mellan fälttågen.
    harSkatt() { return G.harSkatt0() && G.inford('skatt'); },
    harSkatt0() { return !!S.las.mark && G.takt('mark') > 0 && Object.keys(S.bas).some(id => BAS[id].ger === 'man'); },
    skattPris() { return Math.max(10, Math.ceil(G.tak() * 0.4 / 5) * 5); },
    skattGer() { return Math.max(10, G.takt('mark') * G.skattSek() * G.egX('skatt')); },
    skattMax() { return 3; },                                              // så många skattelag kan vara ute på en gång
    skattUte() { return S.skattLag ? S.skattLag.length : 0; },
    kanSkatt() { return G.harSkatt() && G.skattUte() < G.skattMax() && !S.slut && S.res.man >= G.skattPris(); },
    skatt(dur, auto) {
      if (!G.kanSkatt()) return false;
      const man = G.skattPris(); S.res.man -= man; S.skattNr = (S.skattNr || 0) + 1; const lag = { t: 0, dur: dur || 12, man, auto: !!auto, nr: S.skattNr };
      if (!S.skattLag) S.skattLag = []; S.skattLag.push(lag); S.skatt = S.skattLag[0];
      G.ut('skattUt', { man, auto: !!auto, nr: lag.nr }); return true;
    },
    // Gustav eller en löpare kom fram till en bas: folk sluter upp (eller pengar samlas in).
    besok(id, lopare) {
      const p = G.prod(id); if (!p) return 0;
      const n = p * (lopare ? G.lopSamling() : G.samling()), r = BAS[id].ger;
      S.res[r] += n; S.tot[r] += n; if (r === 'man') S.res.man = Math.min(S.res.man, G.tak()); G.ut('samling', { bas: id, antal: n, res: r, lopare: !!lopare });
      return n;
    },

    // ---- uppdrag ----------------------------------------------------------------------------
    uppdrag() { return S.aktivt ? D.UPPDRAG.find(u => u.id === S.aktivt.id) : D.UPPDRAG[S.nasta] || null; },
    kostnad(u) {
      const k = Object.assign({}, u.kostar);
      if (k.skuldDel) { k.mark = Math.min(S.skuld, S.skuldMax * k.skuldDel); delete k.skuldDel; }
      else if (k.mark > 0 && D.UPPDRAG[S.nasta] === u) { if (!S.sett || S.sett.id !== u.id) S.sett = { id: u.id, mark: k.mark }; else if (S.sett.mark > k.mark) S.sett.mark = k.mark; k.mark = S.sett.mark; }
      return k;
    },
    framsteg(u) { const k = G.kostnad(u); let f = 1; for (const r in k) if (k[r] > 0) f = Math.min(f, S.res[r] / k[r]); return Math.max(0, Math.min(1, f)); },
    kanSkicka() { const u = D.UPPDRAG[S.nasta]; return !!u && !S.aktivt && !S.slut && G.framsteg(u) >= 1; },
    skicka(dur, k0) {          // k0 = hur stor del av uppdraget som är vägen dit, när den inte är KAMP (förspelets slag)
      if (!G.kanSkicka()) return false;
      const u = D.UPPDRAG[S.nasta], k = G.kostnad(u);
      for (const r in k) S.res[r] -= k[r];
      if (u.kostar.skuldDel) S.skuld = Math.max(0, S.skuld - k.mark);
      S.aktivt = { id: u.id, t: 0, dur: (u.tid || dur || TID[u.slag]) / (u.slag === 'beslut' || u.slag === 'bygg' ? 1 : S.fartX), val: false, k0: k0 || undefined, man: k.man || 0 };
      G.ut('skickat', { u, kostnad: k });
      return true;
    },
    // Förspelet går sin gång vad spelaren än gör: när uppdragets minut är inne fylls kassan på så att det går iväg.
    tvinga() {
      const u = D.UPPDRAG[S.nasta]; if (!u || S.aktivt || S.slut || !u.senast || S.t / 60 < u.senast) return false;
      const k = G.kostnad(u); for (const r in k) if (S.res[r] < k[r]) S.res[r] = k[r]; return true;
    },
    // Riksdagen 1527: uppdraget blir inte klart förrän spelaren själv har hotat att avgå.
    valj() { if (S.aktivt && S.aktivt.val) { S.aktivt.val = false; S.aktivt.valt = true; G._klar(); } },
    _klar() {
      const u = D.UPPDRAG.find(q => q.id === S.aktivt.id), g = u.ger || {}, akt = S.aktivt;
      S.aktivt = null; S.nasta++; S.datum = 0;
      // förspelets slag: en femtedel av männen kommer alltid hem, och upp till två tredjedelar om orderna gavs i rätt läge
      S.fick = { mark: 0, man: g.man || 0 };          // det som kom in på en gång, för medaljongerna i rutan
      S.hem = null; if (u.order && akt.man && !u.belagring) { const n = u.order.filter(o => o.ord && !o.alltid && !o.vanta).length || 1, p = Math.min(1, (akt.poang || 0) / n), hem = Math.round(akt.man * (0.2 + 0.45 * p)); S.res.man = Math.min(G.tak(), S.res.man + hem); S.hem = { id: u.id, hem, av: akt.man, p }; }
      if (g.bas) g.bas.forEach(id => { if (!S.bas[id]) S.bas[id] = 1; });
      if (g.x) for (const r in g.x) S.x[r] *= r === 'mark' ? Math.pow(g.x[r], (D.VARLDAR[S.varld] || {}).xExp || 1) : g.x[r];          // xExp < 1: stegens lyft blir mindre (historiska belopp, Johannes 2026-11-28)
      if (g.las) g.las.forEach(l => S.las[l] = true);
      if (g.mark) { const m = g.mark * S.x.mark; S.res.mark += m; S.tot.mark += m; S.fick.mark += m; }
      if (g.man) { S.res.man = Math.min(G.tak(), S.res.man + g.man); S.tot.man += g.man; }
      if (g.markTid) { const m = Math.max(1000, G.takt('mark') / (S.full ? G.fullX() : 1) * g.markTid); S.res.mark += m; S.tot.mark += m; S.fick.mark += m; }
      if (g.fart) S.fartX *= g.fart;
      if (g.titel) S.titel = g.titel;
      if (g.borg) Object.assign(S.borg, g.borg);
      if (u.lan) { S.skuld = S.skuldMax = Math.max(42000, G.takt('mark') / (S.full ? G.fullX() : 1) * 2400); }           // lånet väger som fyrtio minuters inkomst
      if (g.skuldDel) S.skuld = Math.max(0, S.skuld - S.skuldMax * g.skuldDel);
      if (g.startar) S.uppror[g.startar] = true;
      if (g.slutar) { if (g.slutar === 'privilegier') S.las.privilegier = false; else S.uppror[g.slutar] = false; }
      if (g.slut) { S.slut = true; S.arvNu = G.arvVid(); }
      if (g.hjalte) { S.hjalte = g.hjalte; S.titel = 'Kristina'; S.hjalteT = S.t; }                  // Sten Sture är död, Kristina Gyllenstierna för riket vidare
      if (g.slutVarld) S.slut = true;
      S.kronika.push({ id: u.id, ar: u.ar });
      G.ut('klart', { u });
      if (g.slutVarld) G.ut('varldSlut', { u });
    },
    // Arvet till nästa regent: växer med allt du byggt upp.
    arvVid() { let n = 0; for (const id in S.bas) n += S.bas[id]; return Math.max(1, Math.floor(n / 25 + Math.log10(Math.max(10, S.tot.mark)) / 3)); },

    // ---- fogdar: sköter en bas åt kungen ----------------------------------------------------
    fogdePris(id) { return G.pris(id) * 25; },
    kopFogde(id) { if (!S.las.fogdar || S.fogde[id] || S.res.mark < G.fogdePris(id)) return false; S.res.mark -= G.fogdePris(id); S.fogde[id] = true; G.ut('fogde', { bas: id }); return true; },

    // ---- tidens gång --------------------------------------------------------------------------
    // Kalendern rör sig mot nästa uppdrags datum i takt med att man närmar sig det.
    datum() {
      const prev = S.nasta > 0 ? D.UPPDRAG[S.nasta - 1] : { ar: D.VARLDAR[S.varld].ar0, man: D.VARLDAR[S.varld].man0 || 1 }, next = D.UPPDRAG[S.nasta] || prev, akt = S.aktivt ? D.UPPDRAG.find(u => u.id === S.aktivt.id) : null;
      if (akt) return { ar: akt.ar, man: akt.man };
      const tot = (next.ar - prev.ar) * 12 + (next.man - prev.man), f = Math.max(S.datum, G.framsteg(next) * 0.92); S.datum = f;
      const m = (prev.ar * 12 + prev.man - 1) + Math.max(0, tot) * f;
      return { ar: Math.floor(m / 12), man: m % 12 + 1 };
    },
    steg(dt) {
      S.t += dt; S.sistaTryck += dt; if (S.ryck > 0) S.ryck = Math.max(0, S.ryck - 0.9 * dt);
      if (G.lopare() >= 3) { S.fart = Math.min(1, S.fart + 0.25 * dt); if (S.fart >= 1 && !S.full) { S.full = true; G.ut('full', {}); } }          // tre löpare håller mätaren full av sig själva
      else if (S.sistaTryck > 1.2) S.fart = Math.max(0, S.fart - 0.02 * dt);          // mätaren sjunker sakta: full fart håller i sig i tio sekunder utan tryck
      if (S.handl) for (const id in S.handl) { const o = S.handl[id]; if (o.t > 0) o.t = Math.max(0, o.t - dt); if (o.v > 0) o.v = Math.max(0, o.v - dt); }
      if (S.full && S.fart < 0.8) { S.full = false; G.ut('slutFull', {}); }
      const fx = S.full ? G.fullX() : 1;
      const mf = G.manF(); for (const id in S.bas) { const r = BAS[id].ger, p = G.prod(id) * fx * dt * (r === 'man' ? mf : 1); if (p) { S.res[r] += p; S.tot[r] += p; } }
      if (S.sold) { const p = G.soldProd() * fx * dt * mf; S.res.man += p; S.tot.man += p; }
      const tak = G.tak(); if (S.res.man > tak) S.res.man = tak;
      if (S.aktivt && S.aktivt.val && S.varld === 0) { S.aktivt.valT = (S.aktivt.valT || 0) + dt; if (S.aktivt.valT > 30) G.valj(); }      // i förspelet väntar historien inte
      if (S.aktivt && !S.aktivt.val) {
        S.aktivt.t += dt; G._order(dt);
        if (S.aktivt.t >= S.aktivt.dur) { const u = D.UPPDRAG.find(q => q.id === S.aktivt.id); if (u.val && !S.aktivt.valt) { S.aktivt.val = true; G.ut('val', { u }); } else G._klar(); }
      }
      if (S.las.fogdar) for (const id in S.fogde) { let n = 0; while (S.fogde[id] && G.kanKopa(id) && G.pris(id) <= S.res[G.prisRes(id)] * 0.12 && n++ < 5) G.kop(id); }
      if (S.skattLag && S.skattLag.length) {
        for (let k = S.skattLag.length - 1; k >= 0; k--) { const l = S.skattLag[k]; l.t += dt; if (l.t >= l.dur) { S.skattLag.splice(k, 1); const m = G.skattGer(); S.res.mark += m; S.tot.mark += m; S.skattN = (S.skattN || 0) + 1; G.ut('skatt', { mark: m, auto: l.auto, nr: l.nr }); } }
      }
      S.skatt = S.skattLag && S.skattLag[0] || null;
      {          // står hären full i tjugo sekunder ger den sig ut och driver in skatt av sig själv (med fogdar i riket genast). Inte om nästa steg i historien går att ta.
        S.fullT = S.res.man >= G.tak() * 0.999 ? (S.fullT || 0) + dt : 0;
        if ((S.las.fogdar ? S.fullT > 0 : S.fullT > 4) && !G.kanSkicka() && G.kanSkatt()) G.skatt(0, true);
      }
      G._varv(dt);          // skeppet på stapeln
      G._infor();          // förspelet: en ny sak i taget
      // marknadsdag: då och då är det marknad i en bygd eller stad. Den som trycker där får en klump på en gång.
      if (S.marknad) { S.marknad.t -= dt; if (S.marknad.t <= 0) { S.marknad = null; G.ut('marknadSlut', {}); } }
      else if (!S.slut && S.t > 40 && G.skede() !== 'strid' && G.inford('marknad')) {          // förspelet: ingen marknad mitt i ett slag
        S.marknadT = (S.marknadT === undefined ? 35 : S.marknadT) - dt;
        if (S.marknadT <= 0) { const ids = Object.keys(S.bas).filter(id => (BAS[id].slag === 'bygd' || BAS[id].slag === 'stad') && G.prod(id) > 0); S.marknadT = 140 + Math.random() * 60; if (ids.length) { S.marknad = { bas: ids[Math.floor(Math.random() * ids.length)], t: 30 }; G.ut('marknad', { bas: S.marknad.bas }); } }
      }
    },
    marknadTa() {
      const m = S.marknad; if (!m) return false; const id = m.bas; let r = BAS[id].ger, n;
      if (S.varld === 0) {          // förspelet: tjugo sekunder av hela inkomsten av det platsen ger, så att det alltid märks. Är armén nästan full blir det mark i stället.
        n = Math.max(5, G.takt(r) * 20);
        if (r === 'man' && G.tak() - S.res.man < n * 0.5 && S.las.mark) { r = 'mark'; n = Math.max(5, G.takt('mark') * 20); }
        else if (r === 'man') n = Math.max(0, Math.min(n, G.tak() - S.res.man));
      } else { n = Math.max(5, G.prod(id) * (S.full ? G.fullX() : 1) * 40); if (r === 'man') n = Math.max(0, Math.min(n, G.tak() - S.res.man)); }
      S.res[r] += n; S.tot[r] += n; S.marknad = null; G.ut('marknadKlar', { bas: id, antal: n, res: r }); return true;
    },
    // Tid som gått medan spelet var stängt: baserna har arbetat på (utan fartbonus), högst åtta timmar.
    borta(sek) {
      sek = Math.min(8 * 3600, sek); if (sek < 20) return null; S.handl = {};
      const f = { man: 0, mark: 0 }, var_full = S.full; S.full = false; S.fart = 0;
      const mf = G.manF(); for (const id in S.bas) { const r = BAS[id].ger, p = G.prod(id) * sek * (r === 'man' ? mf : 1); S.res[r] += p; S.tot[r] += p; f[r] += p; }
      if (S.sold) { const p = G.soldProd() * sek * mf; S.res.man += p; S.tot.man += p; f.man += p; }
      if (S.aktivt && !S.aktivt.val) S.aktivt.t += sek;
      G._varv(sek);
      S.res.man = Math.min(S.res.man, G.tak());
      return { sek, fick: f, var_full };
    }
  };

  // ---- siffror på svenska ---------------------------------------------------------------------
  const ORD = ['', ' tusen', ' milj.', ' mdr', ' bilj.', ' bdr', ' trilj.', ' tdr', ' kv.', ' kvdr', ' kvint.', ' kvintdr'];
  V.tal = function (n) {
    if (!isFinite(n)) return '∞'; if (n < 0) return '-' + V.tal(-n);
    if (n < 10) return (Math.floor(n * 10) / 10).toString().replace('.', ',');
    if (n < 10000) return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    if (n >= 1e36) { const x = Math.floor(Math.log10(n)); return (n / Math.pow(10, x)).toFixed(2).replace('.', ',') + ' · 10^' + x; }
    let e = Math.min(ORD.length - 1, Math.floor(Math.log10(n) / 3)), v = n / Math.pow(1000, e);
    if (v >= 999.5 && e < ORD.length - 1) { v /= 1000; e++; }
    return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace('.', ',') + ORD[e];
  };
  const MAN = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
  V.arstid = function (d) { const m = Math.floor(d.man); return (m <= 2 || m === 12 ? 'Vintern' : m <= 5 ? 'Våren' : m <= 8 ? 'Sommaren' : 'Hösten') + ' ' + d.ar; };
  V.manad = d => MAN[Math.max(0, Math.min(11, Math.floor(d.man) - 1))];
  if (typeof module !== 'undefined' && module.exports) module.exports = G;
})(typeof window !== 'undefined' ? window : globalThis);
