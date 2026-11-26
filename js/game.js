// Spelets regler. Rör aldrig sidan eller 3D-världen: allt som ska synas skickas ut som händelser via Game.ut.
// Går att köra i node (tools/balansbot.js).
(function (root) {
  'use strict';
  const V = root.VASA = root.VASA || {}, D = V.DATA || require('./data.js');
  const BAS = {}; D.BASER.forEach(b => BAS[b.id] = b);
  const KONST = {}; D.KONSTER.forEach(k => KONST[k.id] = k);
  const TID = { bud: 7, tag: 16, rid: 11, flotta: 18, bygg: 12, beslut: 2.5 };       // uppdragens längd i sekunder om världen inte säger annat
  const KONST_MAX = 30, SOLD = { p0: 2, c0: 250, r: 1.3 }, KAMP = 0.6;          // KAMP: så långt in i ett fälttåg börjar striden

  // varld 0 = förspelet (Sten Sture den yngre 1512–1520), varld 1 = Gustav Vasa.
  function nytt(varld) {
    const v = varld === 0 ? 0 : 1;
    return { v: 1, varld: v, t: 0, sparad: Date.now(), res: { man: 0, mark: 0 }, tot: { man: 0, mark: 0 }, skuld: 0, skuldMax: 0, bas: v ? { mora: 1 } : { stockholm: 1 }, konst: { skidor: 0, tal: 0, bud: 0, sigill: 0, langd: 0 }, sold: 0, handl: {},
      nasta: 0, aktivt: null, x: { man: 1, mark: 1 }, las: v ? {} : { mark: true }, uppror: {}, fart: 0, full: false, sistaTryck: 99, tryck: 0, fartX: 1, fogde: {}, titel: v ? 'Hövitsman' : 'Riddare', hjalte: v ? 'gustav' : 'sten',
      kronika: [], datum: 0, intro: false, arv: 0, varv: 0, slut: false, borg: {}, ljud: true, tips: {}, forspel: {} };
  }
  let S = nytt();
  const par = {};          // basens siffror i den värld som spelas
  function P(id) { const k = S.varld + id; return par[k] || (par[k] = S.varld === 0 && D.STURE_BAS[id] ? Object.assign({}, BAS[id], D.STURE_BAS[id]) : BAS[id]); }
  Object.defineProperty(D, 'UPPDRAG', { get() { return S.varld === 0 ? D.STURE : D.VASA; }, configurable: true });
  const G = V.Game = {
    get s() { return S; }, BAS, KONST, KONST_MAX,
    ut: function () {},                 // händelser till gränssnittet: (typ, data)
    ny(arv) { const gammal = S; S = nytt(1); if (arv) { S.arv = gammal.arv; S.varv = gammal.varv; S.intro = true; S.ljud = gammal.ljud; S.forspel = gammal.forspel; } return S; },
    // Byt värld. Från förspelet följer städernas storlek med (de står kvar, nu i Kristians händer) och krönikan.
    nyVarld(v) { const g = S; S = nytt(v); S.ljud = g.ljud; S.arv = g.arv; S.varv = g.varv; if (v === 1 && g.varld === 0 && g.nasta > 0) { S.forspel = Object.assign({}, g.bas); S.kronika = g.kronika.slice(); } return S; },
    ladda(o) { S = Object.assign(nytt(o.varld === 0 ? 0 : 1), o); S.res = Object.assign({ man: 0, mark: 0 }, o.res); S.x = Object.assign({ man: 1, mark: 1 }, o.x); S.konst = Object.assign({ skidor: 0, tal: 0, bud: 0, sigill: 0, langd: 0 }, o.konst); if (S.varld === 1 && S.nasta > D.VASA.findIndex(u => u.id === 'hedemora')) S.las.sold = true; if (!S.skattLag) S.skattLag = S.skatt ? [Object.assign({ nr: 1 }, S.skatt)] : []; return S; },
    alla() { return D.STURE.concat(D.VASA); },

    // Hären kan inte bli hur stor som helst: taket följer vad nästa fälttåg kräver (uppdragens manskap är historiens siffror).
    // Män är alltså en mätare som fylls på, inte en hög som växer: de används till fälttåg, till att bygga ut bygderna och till att driva in skatt.
    tak() {
      let n = 0; for (let k = S.nasta; k < D.UPPDRAG.length && !n; k++) n = D.UPPDRAG[k].kostar.man || 0;
      const t = Math.max(30, Math.ceil(n * 1.25 / 10) * 10); if (!(S.tak >= t)) S.tak = t; return S.tak;
    },
    // En bygd kan inte bli större än hären tillåter: kostar nästa nivå fler män än hären rymmer får den vänta tills hären har vuxit.
    maxad(id) { return G.prisRes(id) === 'man' && !!S.bas[id] && G.pris(id) > G.tak(); },
    // ---- baser ------------------------------------------------------------------------------
    niva(id) { return S.bas[id] || 0; },
    stoppad(id) { for (const u in S.uppror) if (S.uppror[u] && D.UPPROR[u].baser.indexOf(id) >= 0) return u; return null; },
    arvX() { return 1 + S.arv * 0.25; },
    // produktion per sekund för en bas, utan fartbonus
    prod(id, niva) {
      const b = P(id), L = niva === undefined ? (S.bas[id] || 0) : niva; if (!L) return 0;
      if (niva === undefined && G.stoppad(id)) return 0;
      let p = b.p0 * L * Math.pow(2, Math.floor(L / 10)) * S.x[b.ger] * G.arvX() * G.gang(b.ger);
      if (b.slag === 'stad' && S.las.privilegier) p *= 0.5;                         // Lübeck tar handeln
      if (b.slag === 'gruva') p *= 1 + 0.1 * G.arb(id);                             // gruvarbetare: en tiondel mer för varje lag
      return p;
    },
    fullX() { return 2 + Math.floor(S.konst.skidor / 10); },                       // så mycket ger full fart
    takt(res) { let s = res === 'man' ? G.soldProd() : 0; for (const id in S.bas) if (BAS[id].ger === res) s += G.prod(id); return s * (S.full ? G.fullX() : 1); },
    // ---- sold: knektar som får betalt. Köps för mark och ger män, och var tionde nivå dubblar som allt annat. ----
    // Mynten i Hedemora 1521 slogs för att betala hären, och 1522 kom de första tyska legoknektarna.
    soldProd(L) { L = L === undefined ? (S.sold || 0) : L; return L ? SOLD.p0 * L * Math.pow(2, Math.floor(L / 10)) * S.x.man * G.arvX() * G.gang('man') : 0; },
    soldPris() { const p = SOLD.c0 * Math.pow(SOLD.r, S.sold || 0); return p < 1000 ? Math.ceil(p) : p; },
    kanSold() { return !!S.las.sold && S.res.mark >= G.soldPris(); },
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
    // ---- kungens förmågor ---------------------------------------------------------------------
    konstPris(id) { const k = KONST[id], p = k.c0 * Math.pow(k.r, S.konst[id]); return p < 1000 ? Math.ceil(p) : p; },
    harKonst(id) { return !!S.las.konster && (id !== 'langd' || G.harSkatt()); },          // skattelängder först när det finns skatt att driva in
    kanKonst(id) { return G.harKonst(id) && S.konst[id] < KONST_MAX && S.res.mark >= G.konstPris(id); },
    tryckSek() { return 0.3 * (1 + 0.05 * S.konst.sigill); },                 // så många sekunders inkomst ger ett tryck
    skattSek() { return 12 * (1 + 0.05 * S.konst.langd); },                    // och så många ger en skatteindrivning
    kopKonst(id) { if (!G.kanKonst(id)) return false; S.res.mark -= G.konstPris(id); S.konst[id]++; G.ut('konst', { id, niva: S.konst[id], dubbel: S.konst[id] % 10 === 0 }); return true; },
    hastighet() { return 2.3 * (1 + Math.min(40, S.konst.skidor) * 0.045); },                                    // Gustavs toppfart i världsenheter per sekund
    samling() { return (6 + S.konst.tal * 0.8) * Math.pow(2, Math.floor(S.konst.tal / 10)); },     // sekunders produktion per besök
    lopare() { return S.las.konster && S.konst.bud > 0 ? Math.min(6, 1 + Math.floor(S.konst.bud / 5)) : 0; },
    lopFart() { return 1.5 * (1 + S.konst.bud * 0.03); },
    lopSamling() { return G.samling() * 0.15 * Math.pow(2, Math.floor(S.konst.bud / 10)); },

    // ---- farten: mätaren fylls av tryck, sjunker sakta och ger dubbel produktion när den är full ----
    // ---- egna handlingar: sådant hjälten gör själv, med vila emellan ------------------------------
    harHandling(id) {
      if (S.slut) return false; const harMan = Object.keys(S.bas).some(b => BAS[b].ger === 'man');
      // i förspelet kommer en ny sak i taget: breven när man blivit riksföreståndare (steg 3), talet steget efter
      if (id === 'tal') return S.nasta >= (S.varld === 0 ? 4 : 1) && harMan;
      if (id === 'brev') return S.nasta >= (S.varld === 0 ? 3 : 1) && !!S.las.mark && G.takt('mark') > 0;
      return !!S.las.sold;                                                 // mönstra: först när armén har övats i Hedemora
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
    tryck() {
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
    skede() { const a = S.aktivt; if (!a || a.val) return null; const u = D.UPPDRAG.find(q => q.id === a.id); return u && u.strid && a.t / a.dur >= KAMP ? 'strid' : null; },
    fartNu() { return (0.12 + 0.88 * S.fart) * (1 + (S.ryck || 0)); },          // hur fort hjälten far just nu, som del av toppfarten

    // ---- driv in skatt: skicka ut män som kommer hem med mark ---------------------------------
    // Det kostar fyra tiondelar av vad hären rymmer och ger en kvarts minuts inkomst. Så är män värda något också mellan fälttågen.
    harSkatt() { return !!S.las.mark && G.takt('mark') > 0 && Object.keys(S.bas).some(id => BAS[id].ger === 'man'); },
    skattPris() { return Math.max(10, Math.ceil(G.tak() * 0.4 / 5) * 5); },
    skattGer() { return Math.max(10, G.takt('mark') * G.skattSek()); },
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
    skicka(dur) {
      if (!G.kanSkicka()) return false;
      const u = D.UPPDRAG[S.nasta], k = G.kostnad(u);
      for (const r in k) S.res[r] -= k[r];
      if (u.kostar.skuldDel) S.skuld = Math.max(0, S.skuld - k.mark);
      S.aktivt = { id: u.id, t: 0, dur: (u.tid || dur || TID[u.slag]) / (u.slag === 'beslut' || u.slag === 'bygg' ? 1 : S.fartX), val: false };
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
      const u = D.UPPDRAG.find(q => q.id === S.aktivt.id), g = u.ger || {};
      S.aktivt = null; S.nasta++; S.datum = 0;
      if (g.bas) g.bas.forEach(id => { if (!S.bas[id]) S.bas[id] = 1; });
      if (g.x) for (const r in g.x) S.x[r] *= g.x[r];
      if (g.las) g.las.forEach(l => S.las[l] = true);
      if (g.mark) { const m = g.mark * S.x.mark; S.res.mark += m; S.tot.mark += m; }
      if (g.man) { S.res.man = Math.min(G.tak(), S.res.man + g.man); S.tot.man += g.man; }
      if (g.markTid) { const m = Math.max(1000, G.takt('mark') / (S.full ? G.fullX() : 1) * g.markTid); S.res.mark += m; S.tot.mark += m; }
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
      const prev = S.nasta > 0 ? D.UPPDRAG[S.nasta - 1] : { ar: S.varld === 0 ? 1512 : 1521, man: 1 }, next = D.UPPDRAG[S.nasta] || prev, akt = S.aktivt ? D.UPPDRAG.find(u => u.id === S.aktivt.id) : null;
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
      for (const id in S.bas) { const p = G.prod(id) * fx * dt; if (p) { const r = BAS[id].ger; S.res[r] += p; S.tot[r] += p; } }
      if (S.sold) { const p = G.soldProd() * fx * dt; S.res.man += p; S.tot.man += p; }
      const tak = G.tak(); if (S.res.man > tak) S.res.man = tak;
      if (S.aktivt && S.aktivt.val && S.varld === 0) { S.aktivt.valT = (S.aktivt.valT || 0) + dt; if (S.aktivt.valT > 30) G.valj(); }      // i förspelet väntar historien inte
      if (S.aktivt && !S.aktivt.val) {
        S.aktivt.t += dt;
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
      // marknadsdag: då och då är det marknad i en bygd eller stad. Den som trycker där får en klump på en gång.
      if (S.marknad) { S.marknad.t -= dt; if (S.marknad.t <= 0) { S.marknad = null; G.ut('marknadSlut', {}); } }
      else if (!S.slut && S.t > 40) {
        S.marknadT = (S.marknadT === undefined ? 35 : S.marknadT) - dt;
        if (S.marknadT <= 0) { const ids = Object.keys(S.bas).filter(id => (BAS[id].slag === 'bygd' || BAS[id].slag === 'stad') && G.prod(id) > 0); S.marknadT = 75 + Math.random() * 60; if (ids.length) { S.marknad = { bas: ids[Math.floor(Math.random() * ids.length)], t: 30 }; G.ut('marknad', { bas: S.marknad.bas }); } }
      }
    },
    marknadTa() {
      const m = S.marknad; if (!m) return false; const id = m.bas, r = BAS[id].ger; let n = Math.max(5, G.prod(id) * (S.full ? G.fullX() : 1) * 40);
      if (r === 'man') n = Math.max(0, Math.min(n, G.tak() - S.res.man)); S.res[r] += n; S.tot[r] += n; S.marknad = null; G.ut('marknadKlar', { bas: id, antal: n, res: r }); return true;
    },
    // Tid som gått medan spelet var stängt: baserna har arbetat på (utan fartbonus), högst åtta timmar.
    borta(sek) {
      sek = Math.min(8 * 3600, sek); if (sek < 20) return null; S.handl = {};
      const f = { man: 0, mark: 0 }, var_full = S.full; S.full = false; S.fart = 0;
      for (const id in S.bas) { const r = BAS[id].ger, p = G.prod(id) * sek; S.res[r] += p; S.tot[r] += p; f[r] += p; }
      if (S.sold) { const p = G.soldProd() * sek; S.res.man += p; S.tot.man += p; f.man += p; }
      if (S.aktivt && !S.aktivt.val) S.aktivt.t += sek;
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
