// Gränssnittet: det som ligger ovanpå kartan. Alla knappar sitter samlade i en konsol längst ner.
// Allt nytt förklaras när det dyker upp, i en ruta som står kvar tills spelaren själv trycker bort den.
(function () {
  'use strict';
  const V = window.VASA, D = V.DATA, G = V.Game, tal = V.tal;
  const $ = id => document.getElementById(id), el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const IK = {
    man: '<svg viewBox="0 0 24 24"><path d="M12 2.5c3.3 0 5.6 2.3 5.6 5.4v1.6h1.2v1.8H5.2V9.5h1.2V7.9c0-3.1 2.3-5.4 5.6-5.4z" fill="#b9c0c8"/><path d="M8.2 11.3h7.6v2.2c0 2.2-1.6 3.9-3.8 3.9s-3.8-1.7-3.8-3.9z" fill="#e2b48e"/><path d="M4.5 22c0-3.6 3.2-5.6 7.5-5.6s7.5 2 7.5 5.6z" fill="#7d766a"/><path d="M20.2 3v19" stroke="#8a6a45" stroke-width="1.3"/><path d="M20.2 1.2l1.3 3h-2.6z" fill="#c8ccd0"/></svg>',
    mark: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.2" fill="#d9dde2" stroke="#8f979f" stroke-width="1.4"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="#a3abb3" stroke-width="0.9"/><path d="M8 14.6V9.8l2 1.9 2-2.9 2 2.9 2-1.9v4.8z" fill="#8f979f"/></svg>',
    skuld: '<svg viewBox="0 0 24 24"><path d="M6 3h10l3 3v15H6z" fill="#e9dcc0" stroke="#8a6a45" stroke-width="1.2"/><path d="M9 9h7M9 12.5h7M9 16h4" stroke="#8a6a45" stroke-width="1.2"/><circle cx="16" cy="17.5" r="2.6" fill="#b8312a"/></svg>',
    krona: '<svg viewBox="0 0 24 24"><path d="M3 18V7l4.5 5L12 4l4.5 8L21 7v11z" fill="#e8c040" stroke="#8a6a1f" stroke-width="1.2" stroke-linejoin="round"/><path d="M3 20.5h18" stroke="#8a6a1f" stroke-width="1.6"/></svg>',
    bok: '<svg viewBox="0 0 24 24"><path d="M4 4.5h7c1 0 1 .6 1 1.2V20c0-.7-.4-1.2-1-1.2H4zM20 4.5h-7c-1 0-1 .6-1 1.2V20c0-.7.4-1.2 1-1.2h7z" fill="#e9dcc0" stroke="#5a4634" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    ljud: '<svg viewBox="0 0 24 24"><path d="M4 9.5h4l5-4v13l-5-4H4z" fill="#e9dcc0" stroke="#5a4634" stroke-width="1.2" stroke-linejoin="round"/><path class="vag" d="M16 9c1.2 1.6 1.2 4.4 0 6M18.5 7c2.2 2.8 2.2 7.2 0 10" fill="none" stroke="#e9dcc0" stroke-width="1.5" stroke-linecap="round"/></svg>',
    pil: '<svg viewBox="0 0 24 24"><path d="M12 3l8 9h-5v9H9v-9H4z" fill="#f2cf5a" stroke="#6b4a12" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    kugg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" fill="none" stroke="#e9dcc0" stroke-width="1.8"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="#e9dcc0" stroke-width="1.8" stroke-linecap="round"/></svg>',
    fraga: '<svg viewBox="0 0 24 24"><path d="M8.2 9.2c0-2.3 1.7-3.9 3.9-3.9 2.3 0 3.9 1.5 3.9 3.5 0 3-3.6 3-3.6 6" fill="none" stroke="#e9dcc0" stroke-width="2.2" stroke-linecap="round"/><circle cx="12.3" cy="18.6" r="1.4" fill="#e9dcc0"/></svg>',
    las: '<svg class="las" viewBox="0 0 24 24"><title>Kan inte bli större förrän armén har vuxit</title><path d="M7 10.5V8a5 5 0 0 1 10 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor"/></svg>',
    tal: '<svg viewBox="0 0 24 24"><path d="M4 5h16v10h-8l-5 4v-4H4z" fill="#e9dcc0" stroke="#5a4634" stroke-width="1.3" stroke-linejoin="round"/><path d="M7.5 9h9M7.5 12h6" stroke="#5a4634" stroke-width="1.4" stroke-linecap="round"/></svg>',
    brev: '<svg viewBox="0 0 24 24"><path d="M3 6h18v12H3z" fill="#e9dcc0" stroke="#5a4634" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 6l9 7 9-7" fill="none" stroke="#5a4634" stroke-width="1.3"/><circle cx="12" cy="14.5" r="2.6" fill="#b8312a"/></svg>',
    monstra: '<svg viewBox="0 0 24 24"><path d="M6 3v18" stroke="#e9dcc0" stroke-width="1.8" stroke-linecap="round"/><path d="M7 4h12l-3 3.5 3 3.5H7z" fill="#27539e" stroke="#e9dcc0" stroke-width="1"/><circle cx="11" cy="7.5" r="1.2" fill="#e8c040"/></svg>',
    sikte: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="none" stroke="#e9dcc0" stroke-width="2"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke="#e9dcc0" stroke-width="2"/></svg>'
  };
  // Vad tillgångarna är, varför man får dem och vad de är till för.
  const RES = {
    mark: { namn: 'Mark', rad: 'Mark är pengar. Städer, gruvor och slott ger mark hela tiden. Du bygger ut och betalar nästa steg med den.' },
    man: { namn: 'Män', rad: 'Män är din armé. Du har dem till tre saker: nästa strid, att få fler att sluta upp (platser som ger män byggs ut med män), och att driva in skatt, som ger mark.' }
  };
  // En liten bild för varje slags bas.
  const SLAG = {
    bygd: '<svg viewBox="0 0 24 24"><path d="M2.5 12.5L12 4l9.5 8.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M5.5 12.5V20h13v-7.5L12 6.8z" fill="currentColor"/></svg>',
    stad: '<svg viewBox="0 0 24 24"><path d="M3 20V11l3.5-3 3.5 3v9zM10.5 20V7l1.5-4.5L13.5 7v13zM14 20v-7l3.5-3 3.5 3v7z" fill="currentColor"/></svg>',
    gruva: '<svg viewBox="0 0 24 24"><path d="M4 7c5-4 11-4 16 0-5-1.6-11-1.6-16 0z" fill="currentColor"/><path d="M12 5.5V21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    slott: '<svg viewBox="0 0 24 24"><path d="M3 20V6h3v2.5h2.5V6h3v2.5H14V6h3v2.5h1V6h3v14z" fill="currentColor"/></svg>'
  };
  let root, rows = {}, krows = {}, skattRad = null, soldRad = null, byggRader = [], fogdeKnappar = [], kortNu = null, hrows = {}, sistaHandl = '?', flikar = {}, flik = '', pilar = {}, ortEl = {}, rows2 = {}, husRader = [], sistaBaser = '', caption = null, capT = 0, tips = { nu: null }, valdBas = null;
  const sek = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
  V.pek = /[?&]mobil=1/.test(location.search) || !!(window.matchMedia && matchMedia('(hover: none)').matches);          // pekskärm: inget mellanslag, ingen muspekare som svävar
  const HALL = V.pek ? 'håll in' : 'håll in mellanslag', KLICKA = V.pek ? 'tryck' : 'klicka';
  // Skriv bara i sidan när något har ändrats. Ett kort är namn och nivå överst, och under det vad nästa köp ger och vad det kostar.
  function uppd(r, o) {
    if (r._n !== o.namn) { r._n = o.namn; r.n.textContent = o.namn; } const nv = o.niva === undefined ? '' : String(o.niva); if (r._l !== nv) { r._l = nv; r.l.textContent = nv; r.l.style.display = nv === '' ? 'none' : ''; }
    if (r._v !== o.v) { r._v = o.v; r.v.innerHTML = o.v; } if (r._k !== o.k) { r._k = o.k; r.k.innerHTML = o.k; r.k.style.display = o.k ? '' : 'none'; }
    r.row.classList.toggle('ej', !o.ok); r.row.classList.toggle('snart', !!o.snart); r.row.classList.toggle('dubbel', !!o.snart && !!o.ok); r.bar.style.width = (o.bar || 0) + '%';
    const nf = o.mot === undefined ? -1 : Math.round(o.mot * 100); if (r._nf !== nf) { r._nf = nf; r.l.style.background = nf < 0 ? '' : 'linear-gradient(90deg, rgba(242, 207, 90, 0.5) ' + nf + '%, rgba(0, 0, 0, 0.35) ' + nf + '%)'; }
  }
  // Varje plats arbetar i varv på några sekunder. När varvet är fullt syns klumpen den gav. (Inkomsten rinner in hela tiden, varvet gör den synlig.)
  const varv = id => 3 + (D.BASER.findIndex(b => b.id === id) % 5) * 0.6;
  // Vad en förmåga ger nu och på nästa nivå, i klartext.
  function konstInfo(id) {
    const L = G.s.konst[id], N = L + 1, dub = N % 10 === 0;
    const f0 = G.s.varld === 0;
    if (id === 'sigill') return { kort: f0 ? 'tryck ger 5 % mer' : '+5 % per tryck', nu: 'Ett tryck i sekunden ger ' + sek(0.3 * (1 + 0.05 * L)) + ' sekunders inkomst.', nasta: sek(0.3 * (1 + 0.05 * N)) + ' sekunders inkomst.' };
    if (id === 'skidor') return { kort: dub ? 'full mätare ×' + (2 + N / 10) : f0 ? 'ritt 4,5 % fortare' : '+4,5 % fart', nu: (f0 ? 'Du rider ' : 'Budet far ') + Math.round(L * 4.5) + ' % fortare än från början. Full mätare ger ×' + G.fullX() + '.', nasta: Math.round(N * 4.5) + ' % fortare' + (dub ? ', och full mätare ger ×' + (2 + N / 10) : '') + '.' };
    if (id === 'tal') { const f = l => (6 + l * 0.8) * Math.pow(2, Math.floor(l / 10)); return { kort: dub ? (f0 ? 'besök ger dubbelt' : '×2 per besök') : f0 ? 'besök ger mer' : '+' + sek(f(N) - f(L)) + ' s per besök', nu: 'Varje besök ger ' + sek(f(L)) + ' sekunders produktion från platsen.', nasta: sek(f(N)) + ' sekunder per besök.' }; }
    if (id === 'bud') { const n = l => l > 0 ? Math.min(6, 1 + Math.floor(l / 5)) : 0; return { kort: n(N) > n(L) ? '+1 löpare' : dub ? '×2 per löpare' : '+3 % fart', nu: (n(L) ? n(L) + ' löpare far runt åt dig.' : 'Inga löpare än.') + (n(L) >= 3 ? ' Mätaren står full av sig själv.' : ' Med tre löpare står mätaren full av sig själv.'), nasta: n(N) > n(L) ? n(N) + ' löpare' + (n(N) === 3 ? ', och mätaren står full av sig själv.' : '.') : dub ? 'Löparna ger dubbelt.' : 'Löparna far fortare.' }; }
    return { kort: f0 ? 'skatt ger 5 % mer' : '+5 % skatt', nu: 'Driv in skatt ger ' + sek(12 * (1 + 0.05 * L)) + ' sekunders markinkomst.', nasta: sek(12 * (1 + 0.05 * N)) + ' sekunders markinkomst.' };
  }
  const ger = id => G.BAS[id].ger === 'man' ? 'män' : 'mark';
  const basRad = id => { const b = G.BAS[id]; return '<b>' + b.namn + '</b>. ' + b.rad + '. Ger ' + ger(id) + '.'; };

  const UI = V.UI = {
    IK,
    init() {
      root = $('ui');
      root.innerHTML = `
        <div id="datum"><div id="dat-ar"></div><div id="dat-titel"></div><div id="dat-tron"></div></div>
        <div id="meny"><button id="m-fraga" title="Så fungerar det">${IK.fraga}</button><button id="m-bok" title="Krönikan">${IK.bok}</button><button id="m-krona" title="Regentlängden">${IK.krona}</button><button id="m-ljud" title="Ljud">${IK.ljud}</button><button id="m-kugg" title="Inställningar">${IK.kugg}</button></div>
        <div id="konsol">
          <div id="uppdrag"><div id="upp-akt"></div><div id="upp-titel"></div><div id="upp-kost"></div><div id="upp-bar"><div id="upp-fyll"></div></div><button id="upp-knapp"></button></div>
          <div id="akwrap"><i id="ak-order" style="display:none"></i><button id="ak"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="spar"/><circle cx="60" cy="60" r="54" id="ak-ring" class="ring"/></svg><span id="ak-txt">Skicka<br>bud</span><span id="fullx"></span></button><div id="ak-hint">${HALL}</div></div>
          <div id="handl"></div>
          <div id="baser"></div>
          <button id="hitta" title="Visa var du är på kartan">${IK.sikte}<span>Hitta mig</span></button>
        </div>
        <div id="kort" style="display:none"></div>
        <div id="berattar" style="display:none"></div>
        <div id="ortnamn"></div><div id="pilar"></div><div id="slag-mal" style="display:none"><i></i><b></b></div><div id="stadmeny" style="display:none"></div><div id="vem-du" class="vem" style="display:none">Du</div><div id="vem-bud" class="vem" style="display:none">Ditt bud</div><div id="flyt"></div><div id="text"></div><div id="tips"></div>
        <div id="film"><div class="rand upp"></div><div class="rand ner"></div><div id="film-plats"></div><div id="film-text"></div><div id="film-tal"></div><div id="film-knapp"></div><div id="film-svart"></div></div>
        <div id="ruta" style="display:none"></div>`;
      $('ak').addEventListener('pointerdown', e => { e.preventDefault(); UI.onTryck && UI.onTryck(); });
      $('upp-knapp').addEventListener('click', () => { const a = G.s.aktivt; if (a && a.val) { G.valj(); V.Ljud && V.Ljud.spela('klocka'); } else UI.onSkicka && UI.onSkicka(); });
      $('hitta').addEventListener('click', () => { V.Ljud && V.Ljud.vakna(); UI.onHitta && UI.onHitta(); });
      $('m-bok').addEventListener('click', UI.kronika); $('m-krona').addEventListener('click', UI.regenter); $('m-kugg').addEventListener('click', UI.installningar); $('m-fraga').addEventListener('click', () => UI.forklara(G.s.varld, true));
      $('m-ljud').addEventListener('click', () => { G.s.ljud = !G.s.ljud; V.Ljud && V.Ljud.pa(G.s.ljud); V.Musik && V.Musik.satt(G.s.ljud && G.s.musik === true); UI.tick(true); });
      $('ruta').addEventListener('click', e => { if (e.target.id === 'ruta' && !UI._last) UI.stang(); });
      root.addEventListener('pointerdown', e => { if (e.target.closest('button, .bas')) V.Ljud && V.Ljud.vakna(); }, true);
      window.addEventListener('resize', () => { sistaBaser = ''; });
      if (V.pek) document.addEventListener('contextmenu', e => e.preventDefault());
      window.addEventListener('keydown', e => { if (!root.classList.contains('spel') || e.repeat) return; const f = { KeyQ: 0, KeyE: 1, KeyR: 2 }[e.code]; const k = Object.keys(flikar); if (f !== undefined && k[f]) { flik = k[f]; G.s.flik = flik; UI.tick(); } });
    },
    visa(on) { root.classList.toggle('spel', !!on); },

    // ---- uppdateras några gånger i sekunden ------------------------------------------------------
    tick(force) {
      const S = G.s, d = G.datum();
      $('dat-ar').textContent = V.arstid(V.kalender ? V.kalender(d) : d);
      $('dat-titel').textContent = S.varld === 0 ? (S.hjalte === 'kristina' ? 'Kristina Gyllenstierna, Sten Stures änka' : 'Sten Sture, ' + S.titel.toLowerCase()) : (S.titel === 'Kung' ? 'Gustav, Sveriges kung' : 'Gustav Eriksson, ' + (S.titel === 'Hövitsman' ? 'dalkarlarnas ledare' : S.titel.toLowerCase()));
      // vem som är kung just nu, sagt i förbigående under titeln
      const tron = S.varld === 0 ? (S.uppror.dagtingan ? ['Herrarna har gått över till Kristian II', 'fara'] : ['Sverige har ingen kung', '']) : S.titel === 'Kung' ? ['', ''] : ['Kung: Kristian II av Danmark', 'fara'];
      const te = $('dat-tron'); te.textContent = tron[0]; te.className = tron[1]; te.style.display = tron[0] ? '' : 'none';
      te.title = S.varld === 0 ? 'Riket hör till unionen med Danmark och Norge, men har inte erkänt någon unionskung sedan 1501. Riksföreståndaren styr i kungens ställe.' : 'Kristian II kröntes i Stockholm den 4 november 1520.';
      $('m-ljud').classList.toggle('av', !S.ljud);
      // uppdraget
      const u = G.uppdrag(), box = $('uppdrag');
      if (!u || S.slut) { box.className = 'slut'; $('upp-akt').textContent = ''; $('upp-titel').textContent = S.varld === 0 ? 'Portarna är öppna' : 'Kronan går i arv'; $('upp-kost').innerHTML = ''; $('upp-knapp').style.display = 'none'; $('upp-fyll').style.width = '100%'; }
      else {
        const a = S.aktivt, k = G.kostnad(u);
        $('upp-akt').textContent = 'Steg ' + (S.nasta + 1) + ' av ' + D.UPPDRAG.length + ' · ' + D.AKTER[u.akt]; $('upp-titel').textContent = u.titel;
        if (a) {
          box.className = a.val ? 'val' : 'pagar'; $('upp-kost').innerHTML = a.val ? '' : '<span class="plats">' + UI.platsnamn(u.plats) + ' ' + u.ar + '</span>' + (G.skede() === 'strid' ? '<span class="chip strid">strid</span>' : '');
          $('upp-fyll').style.width = Math.min(100, a.t / a.dur * 100) + '%'; $('upp-knapp').textContent = a.val ? u.val : ''; $('upp-knapp').style.display = a.val ? '' : 'none'; $('upp-knapp').disabled = false;
        } else {
          let h = ''; for (const r of ['man', 'mark']) if (k[r] > 0) { const ok = S.res[r] >= k[r]; h += '<span class="chip' + (ok ? ' ok' : '') + '" title="' + (r === 'man' ? (u.slag === 'bygg' ? 'Män som gör dagsverken på bygget' : 'Män som skickas iväg') : 'Mark som det kostar') + '">' + IK[r] + tal(k[r]) + (r === 'man' ? (u.slag === 'bygg' ? ' dagsverken' : ' män') : ' mark') + '</span>'; }
          if (u.lan) h = '<span class="chip ok">' + IK.skuld + 'på kredit</span>'; if (!h) h = '<span class="chip ok">' + IK.krona + 'ditt ord' + '</span>';
          const ok = G.kanSkicka(); box.className = ok ? 'redo' : ''; $('upp-kost').innerHTML = h; $('upp-fyll').style.width = G.framsteg(u) * 100 + '%';
          $('upp-knapp').style.display = ''; $('upp-knapp').textContent = u.titel.split(' ')[0]; $('upp-knapp').disabled = !ok;
        }
      }
      // flikarna med tillgångarna, och korten under dem
      const ids = Object.keys(S.bas).filter(id => S.bas[id] && G.BAS[id]), key = ids.join(',') + '|' + (S.las.fogdar ? 1 : 0) + (S.las.konster ? 1 : 0) + (G.harSkatt() ? 1 : 0) + (S.las.sold ? 1 : 0) + (G.harKonst('langd') ? 1 : 0) + '|' + G.byggnader().map(b => b.id).join(',') + '|' + D.KONSTER.filter(k => G.harKonst(k.id)).map(k => k.id).join(',') + '|' + (S.varld === 0 ? UI.stadNu(ids) + ':' + G.husLista().join(',') : '');
      if (key !== sistaBaser || force) { sistaBaser = key; UI._byggBaser(ids); }
      const fx = S.full ? G.fullX() : 1, tak = G.tak(), satt = (id, f) => { const e = $(id); if (e) f(e); };
      satt('man-v', e => { e.textContent = tal(Math.floor(S.res.man)); }); satt('man-tak', e => { e.textContent = 'av ' + tal(tak) + ' män'; }); satt('man-t', e => { e.textContent = '+' + tal(G.takt('man')) + '/s'; });
      satt('res-man', e => e.classList.toggle('fullt', S.res.man >= tak * 0.999)); satt('man-m', e => { e.style.width = Math.min(100, S.res.man / tak * 100) + '%'; });
      { const nu = D.UPPDRAG[S.nasta], km = nu && !S.aktivt ? (G.kostnad(nu).mark || 0) : 0; satt('mark-m', e => { e.style.width = (km > 0 ? Math.min(100, S.res.mark / km * 100) : 0) + '%'; }); }
      satt('mark-v', e => { e.textContent = tal(Math.floor(S.res.mark)); }); satt('mark-t', e => { e.textContent = '+' + tal(G.takt('mark')) + '/s'; });
      satt('res-skuld', e => { e.style.display = S.skuld > 0 ? '' : 'none'; }); satt('skuld-v', e => { e.textContent = tal(S.skuld); });
      if (skattRad) {            // driv in skatt: män ut, mark hem
        const sk = S.skatt, ute = G.skattUte(), fullt = ute >= G.skattMax();
        uppd(skattRad, { namn: 'Driv in skatt', niva: ute ? ute + ' ute' : undefined, v: fullt ? 'alla lag är ute' : 'ger ' + IK.mark + tal(G.skattGer()), k: fullt ? '' : IK.man + tal(G.skattPris()), ok: G.kanSkatt(), bar: sk ? Math.min(100, sk.t / sk.dur * 100) : 0 });
        skattRad.row.classList.toggle('pagar', fullt);
      }
      for (const id of ids) for (const r of [rows[id], rows2[id]]) { if (!r) continue;          // staden står både under männen eller marken och i sin egen flik
        const L = S.bas[id], res = G.prisRes(id), pris = G.pris(id), max = G.maxad(id), stopp = G.stoppad(id), dub = G.rad(id), dv = G.dagsverke(id), mk = !!S.marknad && S.marknad.bas === id;
        uppd(r, { namn: G.BAS[id].kort || G.BAS[id].namn, niva: L, v: mk ? 'Marknad! Tryck här' : stopp ? D.UPPROR[stopp].namn : max ? 'kan inte växa just nu' : dub ? 'dubbelt på nästa nivå' : '+' + tal((G.prod(id, L + 1) - G.prod(id, L)) * fx) + ' ' + ger(id) + '/s',
          k: mk || max || stopp ? '' : IK[res] + tal(pris) + (dv ? ' ' + IK.man + tal(dv) : ''), ok: mk || (S.res[res] >= pris && S.res.man >= dv && !max && !stopp), snart: dub && !max && !stopp && !mk, bar: stopp ? 0 : (S.t / varv(id)) % 1 * 100, mot: (L % 10) / 10 });
        const fas = stopp ? 0 : (S.t / varv(id)) % 1; if (r === rows[id] && r._fas !== undefined && fas < r._fas - 0.5 && !stopp) UI._klump(id, r.row, G.prod(id) * fx * varv(id), ger(id) === 'män' ? 'man' : 'mark'); r._fas = fas;
        r.row.classList.toggle('dags', dv > 0 && !mk && !stopp); r.row.classList.toggle('stopp', !!stopp); r.row.classList.toggle('vald', valdBas === id); r.row.classList.toggle('marknad', mk); r.row.classList.toggle('fogde', !!S.fogde[id]); r.row.classList.toggle('last', max && !mk);
      }
      for (const id in (UI._arows || {})) { const n = G.arb(id), full = G.arbMax(id); uppd(UI._arows[id], { namn: 'Gruvarbetare', niva: n, v: full ? 'armén är för liten än' : '+10 % i ' + (G.BAS[id].kort || G.BAS[id].namn), k: full ? '' : IK.man + tal(G.arbPris(id)), ok: G.kanArb(id), bar: 0 }); }
      byggRader.forEach(r => uppd(r, { namn: 'Bygg: ' + r.b.namn, v: r.b.ger, k: IK.mark + tal(r.b.kostar), ok: G.kanBygga(r.b.id), snart: true }));
      husRader.forEach(r => { const h = r.h, L = G.hus(h.id), res = G.husRes(h); uppd(r, { namn: h.namn, niva: L || undefined, v: '+' + Math.round(h.ger * 100) + ' % ' + (res === 'man' ? 'män' : 'mark'), k: IK[res] + tal(G.husPris(h.id)), ok: G.kanHus(h.id), snart: !L }); });
      if (soldRad) { const L = S.sold || 0, dub = (L + 1) % 10 === 0; uppd(soldRad, { namn: S.varld === 0 ? 'Knektar i tjänst' : 'Värva soldater', niva: L, v: dub ? 'dubbelt på nästa nivå' : '+' + tal((G.soldProd(L + 1) - G.soldProd(L)) * fx) + ' män/s', k: IK.mark + tal(G.soldPris()), ok: G.kanSold(), snart: dub, bar: L ? (S.t / 4) % 1 * 100 : 0, mot: (L % 10) / 10 }); }
      for (const id in krows) { const L = S.konst[id], max = L >= G.KONST_MAX, dub = (L + 1) % 10 === 0; uppd(krows[id], { namn: UI.konst(id)[0], niva: L, v: max ? 'kan inte bli bättre' : konstInfo(id).kort, k: max ? '' : IK.mark + tal(G.konstPris(id)), ok: G.kanKonst(id), snart: dub && !max, bar: 0, mot: (L % 10) / 10 }); }
      // en fogde i taget: kortet sätter en fogde på den plats där det är billigast
      for (const f of fogdeKnappar) { const utan = f.ids().filter(id => !S.fogde[id]); let b = null; for (const id of utan) if (!b || G.fogdePris(id) < G.fogdePris(b)) b = id; f.mal = b; f.r.row.style.display = b ? '' : 'none'; if (b) uppd(f.r, { namn: 'Sätt en fogde', v: 'bygger ut ' + G.BAS[b].namn + ' åt dig', k: IK.mark + tal(G.fogdePris(b)), ok: S.res.mark >= G.fogdePris(b) }); }
      // en prick på fliken när något där går att köpa
      for (const f in flikar) { const fl = flikar[f]; fl.knapp.classList.toggle('vald', f === flik); fl.sida.classList.toggle('dold', f !== flik); fl.knapp.classList.toggle('kan', f !== flik && !!fl.sida.querySelector('.bas:not(.ej):not(.pagar)')); }
      UI._kort();
      // egna handlingar: tre stora knappar bredvid den runda, med vila emellan
      const hl = G.handlingar(), hk = hl.map(h => h.id).join(',') + S.hjalte;
      if (hk !== sistaHandl) {
        sistaHandl = hk; const box = $('handl'); box.innerHTML = ''; hrows = {};
        hl.forEach((h, i) => {
          const b = el('button', 'hk', '<span class="hk-b">' + IK[h.id] + '<i class="hk-v"></i><b class="hk-s"></b><u class="hk-n">' + (i + 1) + '</u></span><span class="hk-t">' + UI.handlNamn(h).split(' ')[0] + '</span>'); box.appendChild(b); hrows[h.id] = { b, v: b.querySelector('.hk-v'), s: b.querySelector('.hk-s') };
          b.addEventListener('click', () => { if (b._hallen) { b._hallen = false; return; } if (G.handla(h.id)) UI.tick(); else UI._nej(b); });
          UI._svava(b, () => { kortNu = { row: b, t: performance.now(), kort: () => { const o = G.handl(h.id); return '<b>' + UI.handlNamn(h) + '</b>' + (V.pek ? '' : '<span class="kort-n">tangent ' + (i + 1) + '</span>') + '<p>' + h.vad + '</p>' + (o.t > 0 ? '<p class="kort-g">Verkar i ' + Math.ceil(o.t) + ' sekunder till.</p>' : '') + (o.v > 0 ? '<p class="kort-x">Vilar i ' + Math.ceil(o.v) + ' sekunder.</p>' : '<p class="kort-p">Redo.</p>'); } }; UI._kort(); },
            () => { if (kortNu && kortNu.row === b) { kortNu = null; UI._kort(); } });
        });
        sistaBaser = '';          // bredden på korten beror på hur många handlingar som finns
      }
      for (const h of hl) { const r = hrows[h.id], o = G.handl(h.id); r.b.classList.toggle('vilar', o.v > 0 && o.t <= 0); r.b.classList.toggle('verkar', o.t > 0); r.b.classList.toggle('redo', o.v <= 0); r.v.style.height = (o.t > 0 ? 0 : Math.min(100, o.v / h.vila * 100)) + '%'; const s = o.t > 0 ? Math.ceil(o.t) : o.v > 0 ? Math.ceil(o.v) : ''; if (r._s !== s) { r._s = s; r.s.textContent = s; } }
      // medan striden pågår är den runda knappen spelarens del i den
      { const sk = G.skede(), ord = sk && u ? UI.drivOrd(u, sk) : null, nyckel = ord ? ord[0] : UI.gorOrd(u);
        if (UI._akOrd !== nyckel + (ord ? ord[1] : '')) { UI._akOrd = nyckel + (ord ? ord[1] : ''); $('ak-txt').innerHTML = nyckel; $('ak-hint').textContent = ord ? ord[1] : HALL; $('akwrap').classList.toggle('driv', !!ord); $('akwrap').classList.toggle('strid', !!ord && sk === 'strid'); } }
      // förspelet: under ett slag tonas allt bort utom uppdraget, den runda knappen och raderna (Johannes 2026-11-26 20:34). Kameran går nära (varld.js).
      { const slag = S.varld === 0 && G.skede() === 'strid'; if (root.classList.contains('slag') !== slag) root.classList.toggle('slag', slag); if (root.classList.contains('forspel') !== (S.varld === 0)) root.classList.toggle('forspel', S.varld === 0); }
      // farten
      const ring = $('ak-ring'), C = 2 * Math.PI * 54; ring.style.strokeDasharray = C; const hm = S.aktivt && S.aktivt.mom && S.aktivt.mom.typ === 'hugg' && !S.aktivt.mom.svar ? Math.min(1, S.aktivt.mom.traff / Math.floor(G.ORDER.hugg / G.ORDER.takt)) : null; ring.style.strokeDashoffset = C * (1 - (hm !== null ? hm : S.fart)); $('akwrap').classList.toggle('hugg', hm !== null);          // i ett hugg visar ringen hur många hugg som tog
      $('akwrap').classList.toggle('full', S.full); $('fullx').textContent = S.full ? 'allt ×' + G.fullX() : '';
      // rutan med berättelsen och textraderna ligger strax ovanför konsolen
      const h = $('konsol').offsetHeight + 22; $('berattar').style.bottom = h + 'px'; $('text').style.bottom = (h + 28) + 'px';          // ovanför knappen Hitta mig
      V.Scene.lyft = (innerWidth < 720 || innerHeight < 520) && root.classList.contains('spel') ? (h - 22) / 2 : 0;          // se scene.js: bilden lyfts så att mitten hamnar ovanför konsolen
      UI._tips();
    },
    // Tre flikar: män, mark och egna förmågor. Tillgången står i själva fliken. Under dem ligger den valda flikens kort.
    _byggBaser(ids) {
      const S = G.s, box = $('baser'); box.innerHTML = '<div id="flikar"></div>'; UI._arows = {}; rows = {}; rows2 = {}; husRader = []; krows = {}; skattRad = null; soldRad = null; byggRader = []; fogdeKnappar = []; kortNu = null; flikar = {};
      const nyFlik = (f, id, huvud, titel) => {
        const knapp = el('button', 'flik', huvud + '<u class="prick"></u>'); if (id) knapp.id = id; knapp.title = titel; box.firstChild.appendChild(knapp);
        const sida = el('div', 'sida'); box.appendChild(sida); knapp.addEventListener('click', () => { if (f === 'stad' && flik === 'stad') { UI.stadMeny(); return; } flik = f; S.flik = f; if (f === 'stad') S.stadSett = 1; UI.stadMeny(false); UI.tick(); });          // stadens flik: ett tryck till visar alla städerna
        flikar[f] = { knapp, sida }; return sida;
      };
      const kort = (sida, cls, ikon, text, klick, hoger) => {
        const row = el('div', 'bas ' + cls, '<div class="k-topp"><i class="k-ikon">' + ikon + '</i><span class="k-namn"></span><b class="k-niva"></b></div><div class="k-rad"><span class="k-ger"></span><span class="k-pris"></span></div><i class="bas-bar"><i></i></i>'); sida.appendChild(row);
        row.addEventListener('click', () => { if (row._hallen) { row._hallen = false; return; } klick(row); UI.tick(); }); if (hoger) row.addEventListener('contextmenu', e => { e.preventDefault(); hoger(); });
        UI._svava(row, () => { kortNu = { row, kort: text, t: performance.now() }; UI._kort(); }, () => { if (kortNu && kortNu.row === row) { kortNu = null; UI._kort(); } });
        return { row, n: row.querySelector('.k-namn'), l: row.querySelector('.k-niva'), v: row.querySelector('.k-ger'), k: row.querySelector('.k-pris'), bar: row.querySelector('.bas-bar i') };
      };
      const fogde = (sida, lista) => { if (!S.las.fogdar) return; const f = { ids: lista, mal: null }; f.r = kort(sida, 'fogdekort', IK.krona, () => '<b>Sätt en fogde</b><p>En fogde är din man på platsen. Han bygger ut den åt dig så fort det finns råd.</p>' + (f.mal ? '<p class="kort-p">Nästa: ' + G.BAS[f.mal].namn + ', ' + IK.mark + tal(G.fogdePris(f.mal)) + ' mark</p>' : ''), row => { if (f.mal && G.kopFogde(f.mal)) V.Ljud && V.Ljud.spela('kop'); else UI._nej(row); }); fogdeKnappar.push(f); };
      const bas = (sida, id, karta) => {
        const b = G.BAS[id];
        (karta || rows)[id] = kort(sida, '', SLAG[b.slag], () => {
          const L = S.bas[id], res = G.prisRes(id), enh = ger(id), fx = S.full ? G.fullX() : 1, dub = G.rad(id), stopp = G.stoppad(id);
          return '<b>' + b.namn + '</b><span class="kort-n">nivå ' + L + '</span><p>' + b.rad + '.</p>' + (stopp ? '<p class="kort-f">' + D.UPPROR[stopp].namn + '. Platsen ger ingenting just nu.</p>' : '<p class="kort-g">Ger ' + tal(G.prod(id) * fx) + ' ' + enh + ' i sekunden.</p>') +
            (G.maxad(id) ? '<p class="kort-x">Kan inte bli större än armén tillåter. Armén växer längre fram i historien.</p>' : '<p class="kort-x">Nästa nivå: ' + (dub ? (UI.byggNamn(id, L + 1) || 'dubbling') + ', dubbelt så ' + (res === 'man' ? 'många män' : 'mycket mark') : '+' + tal((G.prod(id, L + 1) - G.prod(id, L)) * fx) + ' ' + enh + ' i sekunden') + '.</p><p class="kort-p">Kostar ' + IK[res] + tal(G.pris(id)) + ' ' + (res === 'man' ? 'män' : 'mark') + '</p>' + (G.dagsverke(id) ? '<p class="kort-x">Stort bygge: ' + IK.man + tal(G.dagsverke(id)) + ' män gör dagsverken på det.</p>' : '')) +
            (S.fogde[id] ? '<p class="kort-h">En fogde bygger ut här åt dig.</p>' : '') + (V.pek ? '' : '<p class="kort-h">Högerklick visar platsen på kartan.</p>');
        }, row => { valdBas = id; if (G.s.marknad && G.s.marknad.bas === id) { G.marknadTa(); return; } if (!UI.kop(id)) { UI._nej(row); if (G.maxad(id)) UI.text(b.namn + ' kan inte bli större än armén tillåter. Armén växer längre fram i historien.', 6); } },
        () => { valdBas = id; UI.onVisaBas && UI.onVisaBas(id); });
      };
      const konstKort = (s, kd) => { const id = kd.id;
        krows[id] = kort(s, 'konst', IK.krona, () => { const L = S.konst[id], i = konstInfo(id), max = L >= G.KONST_MAX; return '<b>' + UI.konst(id)[0] + '</b><span class="kort-n">nivå ' + L + '</span><p>' + UI.konst(id)[1] + '</p>' + (S.varld === 0 && kd.fran0 ? '<p class="svag">' + (kd.bygg0 ? 'Den kommer från ' : 'Du har den ') + kd.fran0 + '.</p>' : '') + '<p class="kort-g">Nu: ' + i.nu + '</p>' + (max ? '' : '<p class="kort-x">Nästa nivå: ' + i.nasta + '</p><p class="kort-p">Kostar ' + IK.mark + tal(G.konstPris(id)) + ' mark</p>'); },
          row => { if (G.kopKonst(id)) V.Ljud && V.Ljud.spela('kop'); else UI._nej(row); });
      };
      const byggKort = (s2, lista) => lista.forEach(b => { const r = kort(s2, 'bygge', IK.pil, () => '<b>Bygg: ' + b.namn + '</b><p>' + b.vad + '</p><p class="kort-p">Kostar ' + IK.mark + tal(b.kostar) + ' mark</p>', row => { if (G.bygg(b.id)) V.Ljud && V.Ljud.spela('dubbel'); else UI._nej(row); }); r.row.id = 'bygg-' + b.id; r.b = b; byggRader.push(r); });
      const konstUnder = (s, f) => { if (S.varld === 0) D.KONSTER.filter(k => k.flik0 === f && !k.bygg0 && G.harKonst(k.id)).forEach(k => konstKort(s, k)); };          // förspelet: förmågorna ligger under männen och marken
      const soldKort = s => { soldRad = kort(s, 'sold', IK.man, () => { const L = S.sold || 0, fx = S.full ? G.fullX() : 1, dub = (L + 1) % 10 === 0; return (S.varld === 0 ? '<b>Ta knektar i tjänst</b><span class="kort-n">nivå ' + L + '</span><p>Knektar som får lön stannar hos dig. De bor i huset vid slottet.</p>' : '<b>Värva soldater</b><span class="kort-n">nivå ' + L + '</span><p>Soldater som får lön stannar hos dig. Det är därför du gör egna mynt i Hedemora.</p>') + '<p class="kort-g">Ger ' + tal(G.soldProd() * fx) + ' män i sekunden.</p><p class="kort-x">Nästa nivå: ' + (dub ? 'dubbelt så många män' : '+' + tal((G.soldProd(L + 1) - G.soldProd(L)) * fx) + ' män i sekunden') + '.</p><p class="kort-p">Kostar ' + IK.mark + tal(G.soldPris()) + ' mark</p>'; }, row => { if (G.kopSold()) V.Ljud && V.Ljud.spela(G.s.sold % 10 === 0 ? 'dubbel' : 'kop'); else UI._nej(row); }); soldRad.row.id = 'sold'; };
      // ett av stadens hus: nivå, vad nästa nivå ger staden, och priset i det staden ger
      const husKort = (s, h) => { const r = kort(s, 'hus', IK.pil, () => { const L = G.hus(h.id), res = G.husRes(h), enh = res === 'man' ? 'män' : 'mark'; return '<b>' + h.namn + '</b><span class="kort-n">nivå ' + L + '</span><p>' + h.vad + '</p><p class="kort-g">Nu: ' + (L ? G.BAS[h.plats].namn + ' ger ' + Math.round(h.ger * L * 100) + ' % mer ' + enh : 'inte byggt än') + '.</p><p class="kort-x">Nästa nivå: ' + Math.round(h.ger * 100) + ' % mer ' + enh + ' till.</p><p class="kort-p">Kostar ' + IK[res] + tal(G.husPris(h.id)) + ' ' + enh + '</p>'; }, row => { if (G.kopHus(h.id)) V.Ljud && V.Ljud.spela(G.hus(h.id) === 1 ? 'hammare' : 'kop'); else UI._nej(row); }); r.h = h; r.row.id = 'hus-' + h.id; husRader.push(r); };
      const man = () => {
        const m = ids.filter(id => G.BAS[id].ger === 'man'); if (!m.length) return;
        const s = nyFlik('man', 'res-man', IK.man + '<b id="man-v"></b><span class="fl-s" id="man-tak"></span><i id="man-t"></i><u class="fl-m"><u id="man-m"></u></u>', RES.man.rad + ' Mätaren visar hur full armén är.');
        if (G.harSkatt()) { skattRad = kort(s, 'skatt', IK.mark, () => '<b>Driv in skatt</b><p>Skicka ut män för att samla in skatten. Efter tolv sekunder kommer de hem med mark. Upp till tre lag kan vara ute samtidigt, så en full armé behöver aldrig stå stilla.</p><p class="kort-g">Ger ' + IK.mark + tal(G.skattGer()) + ' mark</p><p class="kort-p">Kostar ' + IK.man + tal(G.skattPris()) + ' män</p>', row => { if (!(UI.onSkatt && UI.onSkatt())) UI._nej(row); }); skattRad.row.id = 'skatt'; }
        m.forEach(id => bas(s, id));
        if (S.las.sold && S.varld !== 0) soldKort(s);
        konstUnder(s, 'man'); fogde(s, () => m);
      };
      const mark = () => {
        const m = ids.filter(id => G.BAS[id].ger !== 'man'); if (!m.length) return;
        const s = nyFlik('mark', 'res-mark', IK.mark + '<b id="mark-v"></b><span class="fl-s">mark</span><i id="mark-t"></i><em id="res-skuld" title="Det du är skyldig Lübeck för skeppen och soldaterna.">skuld <b id="skuld-v"></b></em><u class="fl-m"><u id="mark-m"></u></u>', RES.mark.rad + ' Mätaren visar hur långt du har kvar till nästa steg.');
        m.forEach(id => {
          bas(s, id); if (G.BAS[id].slag !== 'gruva') return;          // en gruva har också ett kort för att sätta män i arbete där
          UI._arows[id] = kort(s, 'arb', IK.man, () => '<b>Gruvarbetare i ' + G.BAS[id].namn + '</b><span class="kort-n">' + G.arb(id) + ' lag</span><p>Du sätter män i arbete i gruvan. De lämnar armén och bryter malm i stället.</p><p class="kort-g">Varje lag ger gruvan en tiondel mer. Nu: +' + G.arb(id) * 10 + ' %.</p>' + (G.arbMax(id) ? '<p class="kort-x">Nästa lag är större än armén rymmer. Armén växer längre fram i historien.</p>' : '<p class="kort-p">Nästa lag: ' + IK.man + tal(G.arbPris(id)) + ' män</p>'),
            row => { if (G.kopArb(id)) V.Ljud && V.Ljud.spela('hammare'); else UI._nej(row); });
        });
        konstUnder(s, 'mark'); fogde(s, () => m);
      };
      man(); mark();          // alltid samma ordning: män, mark, förmågor (Johannes 2026-11-26, sista beskedet)
      // Stadens egen flik (förspelet, Johannes 2026-11-26 21:22 och 21:25): staden, husen som ger staden mer, byggnaderna där och det de ger.
      // Den visar den stad man senast tryckte på (först Stockholm). Ett tryck på en stad, dess namn eller ett av dess hus på kartan öppnar den.
      if (S.varld === 0) { const sid = UI.stadNu(ids); if (sid) {
        const b = G.BAS[sid], s = nyFlik('stad', 'flik-stad', SLAG[b.slag] + '<b class="fl-n">' + b.namn + '</b>' + (ids.length > 1 ? '<i class="fl-byt">▾</i>' : ''), b.namn + ': staden och dess hus. Tryck på fliken igen för att välja en annan stad, eller på en stad på kartan.');
        bas(s, sid, rows2);
        D.BYGGNADER.filter(h => h.niva && h.plats === sid && G.husFinns(h.id)).forEach(h => husKort(s, h));
        byggKort(s, G.byggnader().filter(h => (h.stad || h.plats) === sid));
        if (sid === 'stockholm' && S.las.sold) soldKort(s);
        D.KONSTER.filter(k => { const h = k.bygg0 && D.BYGGNADER.find(q => q.id === k.bygg0); return h && (h.stad || h.plats) === sid && G.harKonst(k.id); }).forEach(k => konstKort(s, k));
      } }
      if (S.las.konster && S.varld !== 0) {          // i förspelet finns ingen flik för förmågor: de ligger hos det de hör till
        const s = nyFlik('konst', '', IK.krona + '<b class="fl-n">Förmågor</b>', G.s.varld === 0 ? 'Dina egna förmågor gör din ritt, dina tryck och skatten bättre.' : 'Dina egna förmågor gör buden, trycken och skatten bättre.');
        for (const kd of D.KONSTER) {
          if (G.harKonst(kd.id)) konstKort(s, kd);
        }
      }
      if (!flikar[flik]) flik = flikar[S.flik] ? S.flik : Object.keys(flikar)[0];
      // två rader kort om det får plats på bredden, annars tre
      const fri = innerWidth - 16 - 226 - 104 - ($('handl').offsetWidth || 0) - 8 * 4 - 22; let flest = 0; for (const f in flikar) flest = Math.max(flest, flikar[f].sida.children.length);
      let rader = 2, bredd = 196; for (; rader < 5; rader++) { const kol = Math.ceil(flest / rader); if (kol * (bredd + 5) <= fri) break; if (kol * 181 <= fri) { bredd = 176; break; } }
      if (innerWidth < 720) { rader = flest <= 2 ? 1 : 2; bredd = Math.floor((innerWidth - 12 - 14 - 5) / 2); } else if (innerHeight < 520) { rader = 2; bredd = 176; }          // telefon: två rader, resten bläddrar man fram i sidled
      box.style.setProperty('--rader', rader); box.style.setProperty('--bredd', bredd + 'px');
    },
    // När ska rutan om en knapp visas? Med mus: när pekaren är över knappen. På pekskärm: bara när fingret hålls kvar en stund,
    // och då räknas trycket inte som ett köp. Ett vanligt tryck på telefon köper utan att någon ruta kommer upp.
    _svava(e, visa, dolj) {
      if (!V.pek) { e.addEventListener('mouseenter', visa); e.addEventListener('mouseleave', dolj); return; }
      let tm = null; const slut = () => { clearTimeout(tm); tm = null; if (e._visar) { e._visar = false; dolj(); } };
      e.addEventListener('pointerdown', () => { e._hallen = false; clearTimeout(tm); tm = setTimeout(() => { e._hallen = true; e._visar = true; visa(); }, 450); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => e.addEventListener(n, slut));
    },
    // Kortet som säger exakt vad en knapp ger. Det står ovanför knappen så länge pekaren är där.
    _kort() {
      const k = $('kort');
      if (innerWidth < 720) k.style.setProperty('--kortb', (($('konsol').offsetHeight || 0) + 14) + 'px');
      if (!kortNu || !document.body.contains(kortNu.row)) { if (k.style.display !== 'none') k.style.display = 'none'; return; }
      const h = kortNu.kort(); if (k._h !== h) { k._h = h; k.innerHTML = h; } k.style.display = '';
      const r = kortNu.row.getBoundingClientRect(), w = k.offsetWidth; k.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px'; k.style.top = Math.max(8, r.top - k.offsetHeight - 8) + 'px';
    },
    // Vad som byggs när en plats når en ny tiotal: det som faktiskt reser sig på kartan.
    byggnad(id, niva) { const b = G.BAS[id], n = UI.byggNamn(id, niva); return b.namn + ': ' + (n ? n + '. ' : '') + 'Dubbelt så ' + (b.ger === 'man' ? 'många män' : 'mycket mark'); },
    byggNamn(id, niva) {
      const b = G.BAS[id], s = Math.floor(niva / 10); let n = '';
      if (s <= 7) {
        if (b.slag === 'bygd') n = s === 1 ? (b.kyrka && !b.kloster ? 'klocktorn av trä, gårdar och lada' : 'nya gårdar och lada') : s === 2 ? 'gårdar, förrådsbodar och marknadsstånd' : s === 3 ? 'stora gårdar och lador' : 'nya gårdar';
        else if (b.slag === 'gruva') n = s === 1 ? 'ny smälthytta och kolmilor' : 'ny smälthytta, stugor och kolmilor';
        else if (b.slag === 'stad') n = s === 2 && b.mur ? 'stadsmur och nya hus' : s === 1 || s === 3 ? 'nya hus och torgstånd' : 'nya hus';
        else n = s <= 3 ? 'slottet byggs ut' : 'nya gårdar vid slottet';
      }
      return n;
    },
    // Vad en handling heter för den som utför den.
    handlNamn(h) { const S = G.s; return S.hjalte === 'kristina' && h.kristina ? h.kristina : S.varld === 0 && h.sture ? h.sture : h.namn; },
    handla(n) { const h = G.handlingar()[n]; if (h && G.handla(h.id)) UI.tick(); },
    // Förmågornas namn och vad de gör, i den värld som spelas.
    konst(id) { const k = G.KONST[id], f = G.s.varld === 0; return [f && k.sture ? k.sture : k.namn, f && k.vad0 ? k.vad0 : k.vad]; },
    _nej(e) { e.classList.remove('skaka'); void e.offsetWidth; e.classList.add('skaka'); V.Ljud && V.Ljud.spela('trumma'); },
    kop(id) { if (G.kop(id)) { V.Ljud && V.Ljud.spela(G.s.bas[id] % 10 === 0 ? 'dubbel' : 'kop'); UI.tick(); return true; } return false; },
    valj(id) { valdBas = id; },
    // Stadens flik (förspelet): vilken stad den visar, och att byta
    stadNu(ids) { const S = G.s; ids = ids || Object.keys(S.bas).filter(id => S.bas[id] && G.BAS[id]); return S.stad && S.bas[S.stad] ? S.stad : ids.indexOf('stockholm') >= 0 ? 'stockholm' : ids[0]; },
    stadVald(id) { return flik === 'stad' && UI.stadNu() === id; },
    visaStad(id) { const S = G.s; if (!S.bas[id]) return; S.stad = id; flik = 'stad'; S.flik = 'stad'; S.stadSett = 1; valdBas = id; sistaBaser = ''; UI.tick(true); },
    // Menyn med alla städerna, ovanför stadens flik: namn, nivå och vad de ger. on = true visar, false stänger, inget = växlar.
    stadMeny(on) {
      const e = $('stadmeny'), S = G.s; if (!e) return; if (on === undefined) on = e.style.display === 'none'; if (!on || !$('flik-stad')) { e.style.display = 'none'; return; }
      S.stadMenyN = (S.stadMenyN || 0) + 1; const ids = Object.keys(S.bas).filter(id => S.bas[id] && G.BAS[id]), nu = UI.stadNu(ids);
      e.innerHTML = '<div class="sm-r">Välj stad</div>' + ids.map(id => '<button data-id="' + id + '"' + (id === nu ? ' class="vald"' : '') + '>' + SLAG[G.BAS[id].slag] + '<b>' + G.BAS[id].namn + '</b><span>nivå ' + S.bas[id] + ' · ' + tal(G.prod(id)) + ' ' + (G.BAS[id].ger === 'man' ? 'män' : 'mark') + ' i sekunden</span></button>').join('');
      e.querySelectorAll('button').forEach(b => b.addEventListener('click', ev => { ev.stopPropagation(); e.style.display = 'none'; UI.visaStad(b.dataset.id); if (UI.onVisaBas) UI.onVisaBas(b.dataset.id); }));
      e.style.display = ''; const r = $('flik-stad').getBoundingClientRect(); e.style.left = Math.max(8, Math.min(innerWidth - e.offsetWidth - 8, r.left + r.width / 2 - e.offsetWidth / 2)) + 'px'; e.style.bottom = (innerHeight - r.top + 6) + 'px';
      setTimeout(() => document.addEventListener('pointerdown', function st(ev) { if (e.contains(ev.target) || (ev.target.closest && ev.target.closest('#flik-stad'))) return; e.style.display = 'none'; document.removeEventListener('pointerdown', st); }), 0);          // ett tryck någon annanstans stänger den
    },
    nastaStad() { const S = G.s, ids = Object.keys(S.bas).filter(id => S.bas[id] && G.BAS[id]), i = ids.indexOf(UI.stadNu(ids)); S.stad = ids[(i + 1) % ids.length]; sistaBaser = ''; if (UI.onVisaBas) UI.onVisaBas(S.stad); },
    platsnamn(id) { const b = G.BAS[id]; if (b) return b.namn; return ({ brunnback: 'Brunnbäcks färja', brunkeberg: 'Brunkeberg', stegeborg: 'Stegeborg', orebro: 'Örebro', strangnas: 'Strängnäs', soderkoping: 'Söderköping', malmo: 'Malmö', lubeck: 'Lübeck', storatuna: 'Stora Tuna', skara: 'Västergötland', smaland: 'Småland', kisa: 'Kisa', virserum: 'Virserum', bornholm: 'Bornholm', staket: 'Stäket', vadla: 'Vädla', brannkyrka: 'Brännkyrka', bogesund: 'Åsundens is' })[id] || id; },

    // ---- varje bildruta: pilar över baser som går att bygga ut -----------------------------------
    frame() {
      const S = G.s, box = $('pilar'), spel = root.classList.contains('spel'), golv = innerHeight - ($('konsol').offsetHeight || 0) - 30;
      for (const b of D.BASER) {
        const id = b.id, can = spel && S.bas[id] && G.kanKopa(id) && !G.stoppad(id) && !(S.marknad && S.marknad.bas === id); let p = pilar[id];
        if (!can) { if (p) p.style.display = 'none'; continue; }
        if (!p) { p = pilar[id] = el('button', 'pil', IK.pil); p.title = 'Bygg ut ' + b.namn; box.appendChild(p); p.addEventListener('click', e => { e.stopPropagation(); UI.kop(id); }); }
        const w = V.Varld.pos(id), sp = V.Scene.screenPoint(w.x, w.y + 3.6, w.z), dold = sp.behind || sp.x < 20 || sp.x > innerWidth - 40 || sp.y < 60 || sp.y > golv;
        p.style.display = dold ? 'none' : ''; p.style.transform = 'translate(' + (sp.x - 17) + 'px,' + (sp.y - 34) + 'px)'; p.classList.toggle('dubbel', G.rad(id));
      }
      // ortnamnen vid varje ort (förspelet, Johannes 2026-11-26: "deras namn ska synas på nåt sätt så man ser vid orten vilken det är")
      { const lista = spel && S.varld === 0 && !root.classList.contains('slag') ? V.Varld.ortnamn() : [], sett = {};
        for (const o of lista) { let e = ortEl[o.id]; if (!e) { e = ortEl[o.id] = el('div', 'ortnamn', o.namn); $('ortnamn').appendChild(e); const oid = o.id; e.addEventListener('click', ev => { ev.stopPropagation(); if (G.s.bas[oid]) { V.Ljud && V.Ljud.vakna(); UI.visaStad(oid); } }); }          // ett tryck på namnet öppnar stadens flik sett[o.id] = 1;
          const sp = V.Scene.screenPoint(o.x, o.y, o.z), dold = sp.behind || sp.x < 12 || sp.x > innerWidth - 12 || sp.y < 56 || sp.y > golv + 10; e.style.display = dold ? 'none' : ''; if (!dold) e.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%, 0)'; }
        for (const id in ortEl) if (!sett[id] && ortEl[id].style.display !== 'none') ortEl[id].style.display = 'none'; }
      // marknadsdag: en gyllene knapp över platsen
      const mk = S.marknad && spel ? S.marknad.bas : null; let mb = pilar._marknad;
      if (!mk) { if (mb) mb.style.display = 'none'; }
      else {
        if (!mb) { mb = pilar._marknad = el('button', 'pil marknad', IK.mark); mb.title = 'Marknadsdag'; box.appendChild(mb); mb.addEventListener('click', e => { e.stopPropagation(); G.marknadTa(); UI.tick(); }); }
        const w = V.Varld.pos(mk), sp = V.Scene.screenPoint(w.x, w.y + 4.4, w.z), dold = sp.behind || sp.x < 20 || sp.x > innerWidth - 40 || sp.y < 60 || sp.y > golv;
        mb.style.display = dold ? 'none' : ''; mb.style.transform = 'translate(' + (sp.x - 23) + 'px,' + (sp.y - 46) + 'px)';
      }
      // de första minuterna i en värld står det Du över den man är (och Ditt bud över budet, när man är Kristina och budet rider)
      { const visa = spel && S.t < 150 && !S.slut, slag = spel && root.classList.contains('slag'), kr = spel && !S.slut && S.hjalte === 'kristina' && S.hjalteT !== undefined && S.t - S.hjalteT < 90 ? V.Varld._kristina : null,          // och en stund efter att man har blivit Kristina
        lagg = (id, o, h, pa) => { const e = $(id), sp = pa && o && o.g && o.g.visible ? V.Scene.screenPoint(o.x, V.Geo.groundAt(o.x, o.z) + h, o.z) : null, syns = sp && !sp.behind && sp.y > 50 && sp.y < golv; e.style.display = syns ? 'block' : 'none'; if (syns) e.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%, -100%)'; };
        lagg('vem-du', kr ? { x: kr.x, z: kr.z, g: { visible: true } } : V.Gustav, kr ? 1.45 : V.Gustav.stupad ? 0.6 : 1.75, visa || !!kr || slag); lagg('vem-bud', V.Bud, 1.9, visa); }
      // ordern i ett slag: en ring som sluter sig kring knappen. Rätt läge är när den är framme vid knappens kant.
      { const a = S.aktivt, m = a && a.mom, e = $('ak-order'), O = G.ORDER; if (!m || m.svar || !spel || m.typ === 'vanta' || S.varld === 0) { if (e.style.display !== 'none') e.style.display = 'none'; }          // i förspelet står ringen i världen (nedan)
        else { const hg = m.typ === 'hugg', j = Math.round(m.tm / O.takt), sk = hg ? 1 + (1 - (m.tm % O.takt) / O.takt) * 0.55 : Math.max(0.86, 1 + (O.mal - m.tm) / O.mal * 1.1), nara = hg ? j >= 1 && Math.abs(m.tm - j * O.takt) <= O.fonster : Math.abs(m.tm - O.mal) <= O.slack, kr = $('ak').getBoundingClientRect(), wr = $('akwrap').getBoundingClientRect();
          e.style.display = 'block'; e.style.width = e.style.height = (kr.width + 6) + 'px'; e.style.left = (kr.left - wr.left - 3) + 'px'; e.style.top = (kr.top - wr.top - 3) + 'px'; e.style.transform = 'scale(' + sk.toFixed(3) + ')'; e.classList.toggle('nara', nara); } }
      // förspelets slag: ringen står i världen där det händer (Varld.malPunkt), och man trycker på den. Den krymper till pricken när det är dags.
      { const a = S.aktivt, m = a && a.mom, e = $('slag-mal'), O = G.ORDER, q = spel && S.varld === 0 && m && !m.svar && m.typ !== 'vanta' ? V.Varld.malSkarm() : null;
        if (!q) { if (e.style.display !== 'none') e.style.display = 'none'; }
        else { const hg = m.typ === 'hugg', jn = Math.round(m.tm / O.takt), d = hg ? jn * O.takt - m.tm : O.mal - m.tm, sk = hg ? 1 + Math.max(0, d) / O.takt * 1.6 : 1 + Math.max(0, d) / O.mal * 2.2, nara = hg ? jn >= 1 && Math.abs(d) <= O.fonster : Math.abs(d) <= O.slack;
          e.style.display = 'block'; e.style.transform = 'translate(' + Math.round(q.x) + 'px,' + Math.round(q.y) + 'px) translate(-50%, -50%)'; e.firstChild.style.transform = 'scale(' + sk.toFixed(3) + ')'; e.classList.toggle('nara', nara); e.classList.toggle('hugg', hg); } }
      if (caption && performance.now() > capT) { caption.classList.add('bort'); const c = caption; caption = null; setTimeout(() => c.remove(), 900); }
    },
    // Vad den runda knappen heter annars: det man gör inför nästa steg i historien (D.GOR). Som kung tar man upp skatt när inget annat står.
    gorOrd(u) { const S = G.s; return (u && D.GOR[u.id]) || (S.varld === 1 && S.titel === 'Kung' ? 'Ta upp<br>skatt' : 'Skicka<br>bud'); },
    // Vad den runda knappen heter medan striden pågår: [ordet på knappen, raden under]. På vägen dit heter den som vanligt.
    drivOrd(u, sk) {
      if (sk !== 'strid') return null;
      if (G.s.varld === 0 && u.order) { const m = G.s.aktivt && G.s.aktivt.mom; return G.s.aktivt && G.s.aktivt.kula ? ['Du är<br>träffad', ''] : m && u.order[m.i] && u.order[m.i].ord ? [u.order[m.i].ord, m.svar || m.typ === 'vanta' ? '' : m.typ === 'hugg' ? 'tryck på ringarna i slaget' : 'tryck på ringen i slaget'] : [u.belagring ? 'Håll<br>ut' : 'Slaget<br>börjar', 'vänta på ordern']; }
      return u.strid === 'nederlag' ? ['Håll<br>emot', 'tryck: håll emot'] : u.strid === 'pilar' ? ['Skjut!', 'tryck: en salva'] : u.strid === 'kanoner' || u.strid === 'sjo' ? ['Skjut!', 'tryck: kanonerna'] : ['Anfall!', 'tryck: anfall'];
    },
    // Siffra som stiger upp från en plats i världen.
    flyt(x, y, z, txt, cls) {
      const sp = V.Scene.screenPoint(x, y, z); if (sp.behind || !root.classList.contains('spel')) return;
      const e = el('div', 'flyt ' + (cls || ''), txt); e.style.left = sp.x + 'px'; e.style.top = sp.y + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 1500);
    },
    // Varje tryck syns: det man fick stiger upp ur knappen, och knappen ger till ett litet hopp.
    tryckt(f) {
      const a = $('ak'), b = a.getBoundingClientRect(); let k = 0;
      for (const r of ['mark', 'man']) if (f[r] >= 0.05) { const e = el('div', 'flyt tr ' + r, '+' + tal(f[r]) + IK[r]); e.style.left = (b.left + b.width / 2 + (Math.random() - 0.5) * 80 + (k++ ? 30 : -6)) + 'px'; e.style.top = (b.top - 4 - Math.random() * 16) + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 950); }
      a.classList.remove('puls'); void a.offsetWidth; a.classList.add('puls');
    },
    _klump(id, row, n, res) {
      if (!root.classList.contains('spel') || n < 0.05) return;
      if (row.offsetParent) { const b = row.getBoundingClientRect(), e = el('div', 'flyt tr liten ' + res, '+' + tal(n)); e.style.left = (b.right - 34) + 'px'; e.style.top = (b.top + 8) + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 950); }
      const w = V.Varld.pos(id); if (w && $('flyt').children.length < 26) UI.flyt(w.x, w.y + 2.6, w.z, '+' + tal(n), res + ' liten');
    },
    // Skatten kom hem: summan stiger upp ur knappen.
    skattKlar(m) {
      if (!skattRad || !root.classList.contains('spel')) return; const b = skattRad.row.getBoundingClientRect(), e = el('div', 'flyt tr mark', '+' + tal(m) + IK.mark);
      e.style.left = (b.left + b.width / 2) + 'px'; e.style.top = (b.top - 4) + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 950);
    },
    // En kort rad som försvinner av sig själv (bara för sådant som inte behöver läsas noga).
    text(t, sek, stor) { if (caption) caption.remove(); caption = el('div', 'text' + (stor ? ' stor' : ''), t); $('text').appendChild(caption); capT = performance.now() + (sek || 7) * 1000; },          // riktig tid: på en skärm med 120 bilder i sekunden försvann raden annars dubbelt så fort
    skylt(t, iSlag) { if (!iSlag && root.classList.contains('slag')) return; const e = el('div', 'skylt', t); $('text').appendChild(e); setTimeout(() => e.classList.add('bort'), 2600); setTimeout(() => e.remove(), 3400); },

    // ---- berättelsen: en ruta ovanför konsolen som står kvar tills man trycker bort den -------------
    berattar(rubrik, rader) {
      const b = $('berattar'); b.innerHTML = '<div class="ber-r">' + rubrik + '</div>' + rader.map((r, i) => '<p' + (i ? ' class="ber-x"' : '') + '>' + r + '</p>').join('') + '<button>Fortsätt</button>';
      b.style.display = ''; b.classList.remove('in'); void b.offsetWidth; b.classList.add('in'); if (caption) { caption.remove(); caption = null; }
      b.querySelector('button').addEventListener('click', () => { b.style.display = 'none'; const f = UI.efter; UI.efter = null; if (f) f(); });
    },
    dolj() { $('berattar').style.display = 'none'; },
    textBort() { if (caption) { caption.remove(); caption = null; } },          // raden mitt på skärmen (valets fråga) ska inte ligga kvar över en scen
    // Tiden står still medan rutan i början läses.
    pausar() { return !!UI._paus && $('ruta').style.display !== 'none'; },
    // Ett uppdrag är klart: vad som hände, och vad det betyder för spelet.
    klart(u) {
      const S = G.s, g = u.ger || {}, x = [];
      (g.bas || []).forEach(id => x.push(basRad(id)));
      if (g.las && g.las.indexOf('mark') >= 0) x.push('<b>Mark</b> är pengar. Gruvor och städer ger mark, och den behövs till större uppdrag.');
      const scen = !!S.sistaScen && (S.sistaScen === u.scen || S.sistaScen === u.valScen), sagt = scen && u.sagt || [];          // det scenen just visade sägs inte en gång till i rutan
      if (u.vet && sagt.indexOf('vet') < 0) x.push(u.vet); if (u.vet2 && sagt.indexOf('vet2') < 0) x.push(u.vet2);
      if (u.id === 'sAbo') x.push('<b>Män</b> är din armé. Platser som ger män bygger du ut med män: de du har får fler att sluta upp. Under männen kan du också bygga ett <b>hus för knektar</b> för mark.');
      if ((g.bas || []).some(id => G.BAS[id].slag === 'gruva')) x.push('Med kortet <b>Gruvarbetare</b> sätter du män i arbete i gruvan. De lämnar armén, och gruvan ger mer.');
      if (S.varld === 0) D.KONSTER.filter(k => k.steg0 === u.id).forEach(k => x.push('Nytt kort under ' + (k.flik0 === 'man' ? 'männen' : 'marken') + ': <b>' + UI.konst(k.id)[0] + '</b>. ' + UI.konst(k.id)[1]));
      if (g.las && g.las.indexOf('konster') >= 0 && S.varld !== 0) x.push(('Under fliken <b>Förmågor</b> gör du dina bud och tryck bättre. Håll ') + (V.pek ? 'fingret kvar på' : 'pekaren över') + ' ett kort så ser du exakt vad det ger.');
      if (g.las && g.las.indexOf('sold') >= 0) x.push('Nu kan du <b>värva soldater</b> för mark. De får lön, och du får fler män.');
      if (g.x) for (const r in g.x) x.push('Allt som ger ' + (r === 'man' ? 'män' : 'mark') + ' ger nu ' + String(g.x[r]).replace('.', ',') + ' gånger så mycket.');
      if (S.hem && S.hem.id === u.id) x.push('<b>' + tal(S.hem.hem) + '</b> av dina ' + tal(S.hem.av) + ' män kommer hem' + (S.hem.p >= 0.9 ? ': du ledde slaget väl.' : S.hem.p > 0.3 ? '.' : '. Följ knappen och ringen i slaget, så kommer fler hem.'));
      if (g.markTid || g.mark) x.push('Du fick en rejäl summa mark på en gång.');
      if (g.man) x.push('Du fick ' + tal(g.man) + ' män.');
      if (g.fart) x.push('Din armé rör sig fortare från och med nu.');
      if (g.titel === 'Kung') x.push('Du är nu <b>Sveriges kung</b>.');
      if (u.lan) x.push('Du har nu en <b>skuld</b> till Lübeck. Den syns bredvid dina mark.');
      if (g.las && g.las.indexOf('privilegier') >= 0) x.push('Så länge Lübeck har handeln ger dina <b>städer bara hälften</b> så mycket mark.');
      if (g.slutar === 'privilegier') x.push('Städerna ger full mark igen.');
      if (g.las && g.las.indexOf('fogdar') >= 0) x.push('Nu finns kortet <b>Sätt en fogde</b>. En fogde är din man på platsen, och han bygger ut den åt dig.');
      if (g.las && g.las.indexOf('arv') >= 0) x.push('Det du bygger från och med nu går i <b>arv</b> till nästa regent.');
      if (g.startar === 'dagtingan') x.push('De flesta herrarna har gått över till Kristian. <b>Uppsala</b> ger dig ingenting längre.');
      else if (g.startar && D.UPPROR[g.startar].baser.length) x.push('<b>' + D.UPPROR[g.startar].namn + '</b>: ' + D.UPPROR[g.startar].baser.filter(id => S.bas[id]).map(id => G.BAS[id].namn).join(', ') + ' ger ingenting förrän du har gjort något åt det.');
      if (g.slutar && g.slutar !== 'privilegier') x.push('Baserna ger som vanligt igen.');
      const hn = G.handlingar(); if (!S.handlSedda) { S.handlSedda = {}; if (S.handlSagt) hn.forEach(h => { S.handlSedda[h.id] = 1; }); }          // äldre sparfiler räknade bara antalet
      hn.filter(h => !S.handlSedda[h.id]).forEach(h => { S.handlSedda[h.id] = 1; x.push('Ny handling ' + (innerWidth < 720 ? 'ovanför' : 'bredvid') + ' den runda knappen: <b>' + UI.handlNamn(h) + '</b>. ' + h.vad + ' Sedan behöver du vila.'); });
      if (g.hjalte) x.push('Du är nu <b>Kristina Gyllenstierna</b>, hans änka. Du håller Stockholms slott och skriver till bönderna om hjälp.');
      UI.berattar(UI.platsnamn(u.plats) + ' ' + u.ar, [scen && u.efter ? u.efter : u.kronika].concat(x));
    },
    // Rutan i början: vem du är, hur läget ser ut och vad du ska göra. Går att ta fram igen med frågetecknet.
    forklara(varld, igen) {
      const hur = varld === 0
        ? [['Bud', 'Den runda knappen är det du gör just nu. Först skickar du bud till din fars slott. Varje tryck ger mark, och knappen byter namn när historien går vidare.'], [IK.mark, '<b>Mark</b> är rikets pengar. Städerna ger mark hela tiden, och mer varje gång du rider förbi.'], [IK.pil, '<b>Bygg ut</b> en stad med knappen, eller ' + KLICKA + ' på den på kartan. Var tionde nivå dubblar.'], [IK.krona, '<b>Nästa steg</b> är historien. Den går vidare när du har råd.']]
        : [['Bud', 'Den runda knappen är det du gör just nu. Först skickar du bud till byarna. Varje tryck ger män, och knappen byter namn när historien går vidare.'], [IK.man, '<b>Män</b> är de som följer dig. Byarna ger män hela tiden, och du behöver dem för att slåss.'], [IK.pil, '<b>Bygg ut</b> en by med knappen, eller ' + KLICKA + ' på den på kartan. Var tionde nivå dubblar.'], [IK.krona, '<b>Nästa steg</b> är historien. Den går vidare när du har folk nog.']];
      const text = varld === 0
        ? '<h2>Sverige 1512</h2><p>Du är <b>Sten Sture</b>, nitton år och riddare. Du är inte kung. Sverige har ingen: riket hör till en union med Danmark och Norge, men har inte erkänt unionens kung sedan 1501.</p><p>I kungens ställe styr en riksföreståndare. Det var din far, och nu är han död. Rådet tänker ge hans plats till en man som vill gå Danmarks kung till mötes.</p><p class="mal">Bygg upp dina städer, vinn folket och håll riket.</p>'
        : '<h2>Dalarna 1521</h2><p>Du är <b>Gustav Eriksson</b>, 24 år. Sveriges kung heter nu Kristian II av Danmark, och han lät halshugga din far i Stockholm.</p><p>Dalkarlarna har valt dig till sin ledare. Resten av riket lyder Kristian.</p><p class="mal">Samla folk, ta Kopparberget och driv ut danskarna.</p>';
      UI.ruta(text + '<div class="hur">' + hur.map(h => '<div><span class="hur-i">' + h[0] + '</span><span>' + h[1] + '</span></div>').join('') + '</div><button class="stang" id="forklara-knapp">' + (igen ? 'Stäng' : 'Börja') + '</button>', !igen);
      UI._paus = !igen; if (!igen && V.Musik) V.Musik.spar('titel');
    },

    // ---- första stegen: en pekande ruta i taget, som står kvar tills steget är gjort ------------------
    _tips() {
      const S = G.s, T = S.tips, e = $('tips'), spel = root.classList.contains('spel') && $('ruta').style.display === 'none' && $('berattar').style.display === 'none' && !root.classList.contains('slag');          // ingen ruta som pekar medan berättelsen står uppe (Johannes 2026-11-26: "Rutan ligger ovanpå här och stör")
      if (!spel) { e.innerHTML = ''; tips.nu = null; return; }
      const forst = S.varld === 0 ? 'stockholm' : 'mora', synlig = sel => { const m = document.querySelector(sel); return !!(m && m.offsetParent); };
      const steg = [
        ['ak', '#ak', 'Tryck här. Det är det du gör just nu.' + (V.pek ? '' : ' Mellanslag går också.'), S.tryck < 5, S.tryck >= 5],
        ['full', '#ak', 'Fortsätt trycka, eller håll in. Full mätare ger dubbelt av allt och håller i sig en stund.', S.tryck >= 5 && !S.full && S.nasta < 2, S.full],
        ['kop', '#baser .bas:not(.skatt)', 'Bygg ut ' + G.BAS[forst].namn + ' här, eller ' + KLICKA + ' på den på kartan.', G.kanKopa(forst) && S.bas[forst] === 1, S.bas[forst] > 1],
        ['upp', '#uppdrag', 'Nästa steg i historien. Tryck på knappen när du har råd.', S.nasta === 0 && G.kanSkicka(), S.nasta > 0 || !!S.aktivt],
        ['driv', '#ak', 'Striden har börjat. Tryck så anfaller dina män.', !!G.skede(), !!(S.aktivt && S.aktivt.slag >= 3)],
        ['dags', '#baser .sida:not(.dold) .bas.dags', 'Ett stort bygge. Det kostar mark, och dina män gör dagsverken på det.', !!document.querySelector('#baser .sida:not(.dold) .bas.dags'), S.dagsN > 0],
        ['byggFlik', '#flik-stad', 'Under Stockholm kan du bygga ett hus för knektar. Sedan blir mark till män.', G.kanBygga('knektar') && !synlig('#bygg-knektar'), !!(S.bygg && S.bygg.knektar) || synlig('#bygg-knektar')],
        ['bygg', '#bygg-knektar', 'Bygg huset här. Det kostar mark.', G.kanBygga('knektar'), !!(S.bygg && S.bygg.knektar)],
        ['knekt', '#sold', 'Ta en knekt i tjänst här. Mark blir män.', S.varld === 0 && G.kanSold() && !S.sold, S.sold > 0],
        ['stad', '#flik-stad', 'Varje stad har en egen flik med sina hus. Tryck på en stad på kartan, så öppnas den.', S.varld === 0 && G.husLista().length > 0 && !S.stadSett, !!S.stadSett],
        ['stadByt', '#flik-stad', 'Tryck på fliken igen för att välja en annan stad.', S.varld === 0 && flik === 'stad' && Object.keys(S.bas).length > 1 && !S.stadMenyN, !!S.stadMenyN],
        ['skattFlik', '#res-man', 'Här under finns kortet Driv in skatt. Med det blir män till mark.', G.kanSkatt() && !S.skattN && !synlig('#skatt'), S.skattN > 0 || synlig('#skatt')],
        ['skatt', '#skatt', 'Skicka ut män här. De kommer hem med mark.', G.kanSkatt() && !S.skattN, !!S.skatt || S.skattN > 0],
        ['tak', '#res-man', 'Armén är full. Driv in skatt (det gröna kortet) så blir männen till mark.', S.res.man >= G.tak() * 0.999 && S.nasta >= 2 && !S.aktivt, S.res.man < G.tak() * 0.9]
      ];
      if (tips.nu) { const s = steg.find(q => q[0] === tips.nu); if (!s || s[4]) { T[tips.nu] = 1; tips.nu = null; e.innerHTML = ''; } else if (!s[3] || !synlig(s[1])) { tips.nu = null; e.innerHTML = ''; } }
      if (!tips.nu) { const s = steg.find(q => !T[q[0]] && q[3] && synlig(q[1])); if (s) { tips.nu = s[0]; e.innerHTML = '<div class="tip">' + s[2] + '</div>'; } }
      if (tips.nu) {            // håll rutan ovanför det den pekar på
        const s = steg.find(q => q[0] === tips.nu), mal = document.querySelector(s[1]), t = e.firstChild; if (!mal || !t) return; t.style.visibility = mal.offsetParent ? '' : 'hidden';
        const r = mal.getBoundingClientRect(), w = t.offsetWidth; t.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px'; t.style.top = (r.top - t.offsetHeight - (mal.closest('.sida') ? 50 : 14)) + 'px';
        t.style.setProperty('--pil', Math.max(14, Math.min(w - 14, r.left + r.width / 2 - parseFloat(t.style.left))) + 'px');
      }
    },

    // ---- rutor --------------------------------------------------------------------------------
    ruta(html, last) { const r = $('ruta'); r.innerHTML = '<div class="ruta-in">' + html + '</div>'; r.style.display = ''; UI._last = !!last; const x = r.querySelector('.stang'); if (x) x.addEventListener('click', UI.stang); return r; },
    stang() { if (UI._paus && V.Musik) V.Musik.spar(V.Musik.grund()); $('ruta').style.display = 'none'; UI._last = false; UI._paus = false; },
    kronika() {
      const S = G.s; let h = '<h2>Krönikan</h2><div class="krono">', akt = -1; const alla = G.alla();
      for (const k of S.kronika) { const u = alla.find(q => q.id === k.id); if (!u) continue; if (u.akt !== akt) { akt = u.akt; h += '<h3>' + D.AKTER[akt] + '</h3>'; } h += '<p>' + u.kronika + '</p>'; }
      if (!S.kronika.length && S.varld === 0) h += '<p class="svag">Året är 1512. Du är Sten Sture, nitton år. Din far riksföreståndaren har just dött, och rådet vill ha en annan man i hans ställe.</p>';
      else if (!S.kronika.length) h += '<p class="svag">Julen 1520 talade Gustav Eriksson till männen i Mora. De sade nej, och han åkte mot Norge. I Sälen hann två skidlöpare upp honom: Mora hade ändrat sig. Så berättar Peder Svarts krönika.</p>';
      UI.ruta(h + '</div><button class="stang">Stäng</button>');
    },
    regenter() {
      const S = G.s; let h = '<h2>Regentlängden</h2><div class="regent">'; const nu = S.varld === 0 ? -1 : 0;
      h += '<div class="reg' + (nu === -1 ? ' nu' : '') + '"><div class="reg-k">' + (nu === -1 ? IK.krona : '') + '</div><b>Sten Sture den yngre</b><span>riksföreståndare 1512–1520</span><i>' + (nu === -1 ? 'pågår' : 'förspel') + '</i></div><div></div>';
      D.REGENTER.forEach((r, i) => { h += '<div class="reg' + (i === nu ? ' nu' : '') + '"><div class="reg-k">' + (i === nu ? IK.krona : '') + '</div><b>' + r[0] + '</b><span>' + r[1] + '–' + (r[2] || '') + '</span>' + (i === nu ? '<i>' + (S.slut ? 'klar' : 'pågår') + '</i>' : i === nu + 1 ? '<i>nästa värld</i>' : '') + '</div>'; });
      UI.ruta(h + '</div><p class="svag">Varje regent blir en egen värld. Det du bygger går i arv till nästa.</p><button class="stang">Stäng</button>');
    },
    installningar() {
      const musikText = () => 'Musik: ' + (G.s.musik === true ? 'på' : 'av');
      UI.ruta('<h2>Inställningar</h2><p class="svag">Spelet sparas av sig självt i den här webbläsaren.</p>' + (V.Musik && V.Musik.finns() ? '<button id="musik-knapp">' + musikText() + '</button>' : '') + '<button id="nollstall" class="fara">Börja om från början</button><button class="stang">Stäng</button>');
      if ($('musik-knapp')) $('musik-knapp').addEventListener('click', () => { G.s.musik = G.s.musik !== true; V.Musik && V.Musik.satt(G.s.ljud && G.s.musik === true); $('musik-knapp').textContent = musikText(); });
      $('nollstall').addEventListener('click', () => { if (confirm('Börja om från 1512? Allt du byggt försvinner.')) UI.onBorjaOm && UI.onBorjaOm(); });
    },
    borta(b) {
      const h = Math.floor(b.sek / 3600), m = Math.floor(b.sek % 3600 / 60);
      UI.ruta('<h2>Medan du var borta</h2><p>' + (h ? h + ' tim ' : '') + m + ' min har gått. Baserna har arbetat på.</p><div class="fick">' + (b.fick.man > 0 ? '<span class="chip ok">' + IK.man + '+' + tal(b.fick.man) + ' män</span>' : '') + (b.fick.mark > 0 ? '<span class="chip ok">' + IK.mark + '+' + tal(b.fick.mark) + ' mark</span>' : '') + '</div><button class="stang">Fortsätt</button>');
    },
    slut() {
      const S = G.s, arv = S.arvNu || G.arvVid();
      UI.ruta('<h2>Kronan går i arv</h2><p>Den 29 september 1560 dog Gustav på Stockholms slott. Han hade tagit ett rike utan pengar och lämnade efter sig ett arvrike med full skattkammare.</p><div class="arv">' + IK.krona + '<b>' + arv + '</b><span>arv till nästa regent</span></div><p class="svag">Erik XIV:s värld är inte byggd än. Tills dess kan du spela Gustav Vasa igen. Varje arv ger en fjärdedel mer av allt.</p><button id="igen">Spela igen med arvet</button><button class="stang">Stanna kvar i riket</button>', true);
      $('igen').addEventListener('click', () => UI.onIgen && UI.onIgen(arv));
    },

    // ---- filmen: svarta ränder, plats och text -------------------------------------------------------
    film: {
      pa(on) { $('film').classList.toggle('pa', !!on); },
      plats(t) { const e = $('film-plats'); e.classList.remove('syns'); if (t) { e.textContent = t; void e.offsetWidth; e.classList.add('syns'); } },
      text(t) { const e = $('film-text'); e.classList.remove('syns'); if (t) { e.innerHTML = t; void e.offsetWidth; e.classList.add('syns'); } },
      tal(t) { $('film-tal').textContent = t === null ? '' : t; $('film-tal').classList.toggle('syns', t !== null); },
      svart(a, sek) { const e = $('film-svart'); e.style.transition = 'opacity ' + (sek === undefined ? 1.2 : sek) + 's'; e.style.opacity = a; },
      knapp(txt, fn) { const e = $('film-knapp'); e.innerHTML = ''; if (!txt) return null; const b = el('button', 'filmknapp' + (txt === 'Åk' ? ' rund' : ''), txt); e.appendChild(b); b.addEventListener('pointerdown', ev => { ev.preventDefault(); V.Ljud && V.Ljud.vakna(); fn(); }); return b; }
    }
  };
})();
