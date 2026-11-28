// Gränssnittet: det som ligger ovanpå kartan. Alla knappar sitter samlade i en konsol längst ner.
// Allt nytt förklaras när det dyker upp, i en ruta som står kvar tills spelaren själv trycker bort den.
(function () {
  'use strict';
  const V = window.VASA, D = V.DATA, G = V.Game, tal = V.tal;
  const $ = id => document.getElementById(id), el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  const IK = {
    skepp: '<svg viewBox="0 0 24 24"><path d="M3 15h18l-3 5H6z" fill="#8a5a32" stroke="#3a2614" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 3v12" stroke="#3a2614" stroke-width="1.4"/><path d="M12.6 4.5c3.4 1.4 5 4 5 8.3h-5z" fill="#efe3c6" stroke="#5a4634" stroke-width="1"/><path d="M11.4 6c-2.6 1.3-3.8 3.4-3.8 6.8h3.8z" fill="#efe3c6" stroke="#5a4634" stroke-width="1"/></svg>',
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
  let root, rows = {}, krows = {}, skattRad = null, varvRad = null, soldRad = null, byggRader = [], fogdeKnappar = [], kortNu = null, hrows = {}, sistaHandl = '?', flikar = {}, flik = '', pilar = {}, ortEl = {}, rows2 = {}, husRader = [], sistaBaser = '', caption = null, capT = 0, tips = { nu: null }, valdBas = null;
  const sek = n => (Math.round(n * 100) / 100).toString().replace('.', ',');
  V.pek = /[?&]mobil=1/.test(location.search) || !!(window.matchMedia && matchMedia('(hover: none)').matches);          // pekskärm: inget mellanslag, ingen muspekare som svävar
  // Testläge (Johannes 2026-11-27): i Regentlängden (kronan uppe till höger) kan man börja vilken byggd värld som helst direkt.
  // Sätt till false inför Steam-släppet, så försvinner knapparna.
  V.TESTLAGE = true;
  const HALL = V.pek ? '' : 'eller mellanslag', KLICKA = V.pek ? 'tryck' : 'klicka';
  // Skriv bara i sidan när något har ändrats. Ett kort är namn och nivå överst, och under det vad nästa köp ger och vad det kostar.
  function uppd(r, o) {
    if (r._n !== o.namn) { r._n = o.namn; r.n.textContent = o.namn; } const nv = o.niva === undefined ? '' : String(o.niva); if (r._l !== nv) { r._l = nv; r.l.textContent = nv; r.l.style.display = nv === '' ? 'none' : ''; }
    if (r._v !== o.v) { r._v = o.v; r.v.innerHTML = o.v; } if (r._k !== o.k) { r._k = o.k; r.k.innerHTML = o.k; r.k.style.display = o.k ? '' : 'none'; }
    r.row.classList.toggle('ej', !o.ok); r.row.classList.toggle('snart', !!o.snart); r.row.classList.toggle('dubbel', !!o.snart && !!o.ok); r.bar.style.width = (o.bar || 0) + '%';
    const nf = o.mot === undefined ? -1 : Math.round(o.mot * 100); if (r._nf !== nf) { r._nf = nf; r.l.style.background = nf < 0 ? '' : 'linear-gradient(90deg, rgba(242, 207, 90, 0.5) ' + nf + '%, rgba(0, 0, 0, 0.35) ' + nf + '%)'; }
  }
  // Varje plats arbetar i varv på några sekunder. När varvet är fullt syns klumpen den gav. (Inkomsten rinner in hela tiden, varvet gör den synlig.)
  const varv = id => 8 + (D.BASER.findIndex(b => b.id === id) % 5) * 1.0;          // så ofta en plats lämnar en klump (Johannes 2026-11-28: staplarna gick för fort)
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
  // var tionde nivå: dubbelt i de gamla världarna, mindre där summorna är historiska (G.dub, Johannes 2026-11-28)
  const dubKort = () => G.dub() === 2 ? '×2' : '+' + Math.round((G.dub() - 1) * 100) + ' %', dubOrd = res => G.dub() === 2 ? (res === 'mark' ? 'dubbelt så mycket' : 'dubbelt så många') : Math.round((G.dub() - 1) * 100) + ' % mer';
  const basRad = id => { const b = G.BAS[id]; return '<b>' + b.namn + '</b>. ' + b.rad + '. Ger ' + ger(id) + '.'; };

  const UI = V.UI = {
    IK,
    init() {
      root = $('ui');
      root.innerHTML = `
        <div id="datum"><div id="dat-ar"></div><div id="dat-titel"></div><div id="dat-tron"></div></div>
        <div id="meny"><button id="m-fraga" title="Så fungerar det">${IK.fraga}</button><button id="m-bok" title="Krönikan">${IK.bok}</button><button id="m-krona" title="Regentlängden">${IK.krona}</button><button id="m-ljud" title="Ljud">${IK.ljud}</button><button id="m-kugg" title="Inställningar">${IK.kugg}</button></div>
        <div id="kassa"></div>
        <div id="konsol">
          <div id="uppdrag"><span id="upp-mer" style="display:none">${IK.bok}Läs mer</span><div id="upp-akt"></div><div id="upp-titel"></div><div id="upp-vag" style="display:none"></div><div id="upp-kost"></div><div id="upp-bar"><div id="upp-fyll"></div></div><button id="upp-knapp"></button></div>
          <div id="akwrap"><i id="ak-order" style="display:none"></i><button id="ak"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" class="spar"/><circle cx="60" cy="60" r="54" id="ak-ring" class="ring"/></svg><span id="ak-txt">Skicka<br>bud</span><span id="fullx"></span></button><div id="ak-hint">${HALL}</div></div>
          <div id="handl"></div>
          <div id="baser"></div>
          <button id="hitta" title="Visa var du är på kartan">${IK.sikte}<span>Hitta mig</span></button>
        </div>
        <div id="kort" style="display:none"></div>
        <div id="berattar" style="display:none"></div>
        <div id="ortnamn"></div><div id="pilar"></div><div id="slag-mal" style="display:none"><i></i><b></b></div><div id="stadmeny" style="display:none"></div><div id="stadlista" style="display:none"></div><div id="slag-bar" style="display:none"><span class="sb-egen"></span><div class="sb-spar"><i class="sb-fyll"></i></div><span class="sb-fiende"></span></div><div id="vem-du" class="vem" style="display:none">Du</div><div id="vem-bud" class="vem" style="display:none">Ditt bud</div><div id="flyt"></div><div id="text"></div><div id="tips"></div>
        <div id="film"><div class="rand upp"></div><div class="rand ner"></div><div id="film-plats"></div><div id="film-text"></div><div id="film-tal"></div><div id="film-knapp"></div><div id="film-svart"></div></div>
        <div id="ruta" style="display:none"></div>`;
      $('ak').addEventListener('pointerdown', e => { e.preventDefault(); UI.onTryck && UI.onTryck(); });
      $('uppdrag').addEventListener('click', e => { if (e.target.closest && e.target.closest('#upp-knapp')) return; const u = G.uppdrag(); if (u && u.mer) UI.merInfo(u); });          // ett tryck på steget: läs mer om varför
      $('upp-knapp').addEventListener('click', () => { const a = G.s.aktivt; if (a && a.val) { G.valj(); V.Ljud && V.Ljud.spela('klocka'); } else UI.onSkicka && UI.onSkicka(); });
      $('datum').addEventListener('click', () => { V.Ljud && V.Ljud.vakna(); UI.kung(); });
      $('hitta').addEventListener('click', () => { V.Ljud && V.Ljud.vakna(); UI.onHitta && UI.onHitta(); });
      $('m-bok').addEventListener('click', UI.kronika); $('m-krona').addEventListener('click', UI.regenter); $('m-kugg').addEventListener('click', UI.installningar); $('m-fraga').addEventListener('click', () => UI.forklara(G.s.varld, true));
      $('m-ljud').addEventListener('click', () => { G.s.ljud = !G.s.ljud; V.Ljud && V.Ljud.pa(G.s.ljud); V.Musik && V.Musik.satt(G.s.ljud && G.s.musik !== false); UI.tick(true); });
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
      $('dat-titel').textContent = S.varld >= 2 ? (D.VARLDAR[S.varld].titlar[S.titel] || D.VARLDAR[S.varld].namn) : S.varld === 0 ? (S.hjalte === 'kristina' ? 'Kristina Gyllenstierna, Sten Stures änka' : 'Sten Sture, ' + S.titel.toLowerCase()) : (S.titel === 'Kung' ? 'Gustav, Sveriges kung' : 'Gustav Eriksson, ' + (S.titel === 'Hövitsman' ? 'dalkarlarnas ledare' : S.titel.toLowerCase()));
      // vem som är kung just nu, sagt i förbigående under titeln
      const tron = S.varld >= 2 ? (S.titel === 'Kung' || !D.VARLDAR[S.varld].tron ? ['', ''] : [D.VARLDAR[S.varld].tron, '']) : S.varld === 0 ? (S.uppror.dagtingan ? ['Herrarna har gått över till Kristian II', 'fara'] : ['Sverige har ingen kung', '']) : S.titel === 'Kung' ? ['', ''] : ['Kung: Kristian II av Danmark', 'fara'];
      const te = $('dat-tron'); te.textContent = tron[0]; te.className = tron[1]; te.style.display = tron[0] ? '' : 'none';
      te.title = S.varld === 0 ? 'Riket hör till unionen med Danmark och Norge, men har inte erkänt någon unionskung sedan 1501. Riksföreståndaren styr i kungens ställe.' : 'Kristian II kröntes i Stockholm den 4 november 1520.';
      $('m-ljud').classList.toggle('av', !S.ljud);
      // uppdraget
      const u = G.uppdrag(), box = $('uppdrag'); { const m = $('upp-mer'), visa = !!(u && u.mer && !S.slut) ? '' : 'none'; if (m.style.display !== visa) m.style.display = visa; }
      if (!u || S.slut) { box.className = 'slut'; $('upp-akt').textContent = ''; $('upp-titel').textContent = S.varld === 0 ? 'Portarna är öppna' : S.varld >= 2 ? D.VARLDAR[S.varld].slutRubrik : 'Kronan går i arv'; $('upp-vag').style.display = 'none'; $('upp-kost').innerHTML = ''; $('upp-knapp').style.display = 'none'; $('upp-fyll').style.width = '100%'; }
      else {
        const a = S.aktivt, k = G.kostnad(u);
        $('upp-akt').textContent = 'Steg ' + (S.nasta + 1) + ' av ' + D.UPPDRAG.length + ' · ' + D.AKTER[u.akt]; $('upp-titel').textContent = u.titel;
        { const v = UI.vagText(u), e = $('upp-vag'); if (e.textContent !== v) e.textContent = v; const d = v ? '' : 'none'; if (e.style.display !== d) e.style.display = d; }          // varifrån och vart
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
      if (varvRad) { const tidT = n => !isFinite(n) ? '' : n < 60 ? Math.ceil(n) + ' s' : n < 3600 ? Math.ceil(n / 60) + ' min' : (n / 3600).toFixed(1).replace('.', ',') + ' tim'; const vm = G.varvMan(), st = S.stapel; uppd(varvRad, { namn: 'Varvet', niva: vm ? tal(vm) + ' män' : undefined, v: G.flottanFull() ? 'flottan är full' : vm ? 'skepp om ' + tidT(G.skeppKvar()) : '+' + Math.round(G.TULL * 100 * (1 + 0.1 * G.eg('flotta'))) + ' % mark per skepp', k: G.flottanFull() || G.varvFullt() ? '' : IK.man + tal(G.varvLag()), ok: G.kanSkepp(), bar: st && vm ? Math.min(100, st.t * 100) : 0 }); }
      UI._kassaPlats();
      { const dt = $('datum'); if (dt) dt.classList.toggle('kan', G.egLista().some(e => G.kanEg(e.id)) || D.KONSTER.some(k => G.kanKonst(k.id))); }          // kungens sida har något att köpa
      { const k = $('kassa'); if (k) {          // kassan: byggs en gång, sedan skrivs bara siffrorna (så att den kan lysa till när en leverans kommer)
        const sk = G.harVarv() || G.skepp() > 0, nyck = sk ? 3 : 2;
        if (!k._klick) { k._klick = 1; k.addEventListener('click', e => { const ks = e.target.closest('.ks'); if (!ks) return; const f = 'man'; if (!flikar[f]) return;          // skeppen: varvet ligger under Män
 flik = f; G.s.flik = f; V.Ljud && V.Ljud.vakna(); UI.tick(); if (ks.classList.contains('ks-skepp')) { const v = $('varv'); if (v) { v.classList.remove('glod-ny'); void v.offsetWidth; v.classList.add('glod-ny'); setTimeout(() => v.classList.remove('glod-ny'), 2500); } } }); }          // ett tryck på män eller mark öppnar dess flik, skeppen visar varvet
        if (k._n !== nyck) { k._n = nyck; k.innerHTML = (sk ? '<div class="ks ks-skepp" title="Skepp byggs av männen du sätter på varvet vid Björkenäs (kortet Varvet under Män). Flottan tar tull av fartygen på Östersjön.">' + IK.skepp + '<b></b><span>skepp</span><i></i></div>' : ''); }
        const sv = (sel, txt) => { const e = document.querySelector(sel); if (e && e._t !== txt) { e._t = txt; e.textContent = txt; } }, bv = (sel, p) => { const e = document.querySelector(sel); if (e) e.style.width = p.toFixed(1) + '%'; };
        UI._rulla('.ks-man b', S.res.man); sv('.ks-man span', 'av ' + tal(tak) + ' män'); sv('.ks-man i', '+' + tal(G.takt('man')) + ' /s'); UI._strom('man', G.takt('man'), S.res.man < tak * 0.999); bv('.ks-man u u', Math.min(100, S.res.man / tak * 100)); { const km0 = document.querySelector('.ks-man'); if (km0) km0.classList.toggle('fullt', S.res.man >= tak * 0.999); }
        const nu = D.UPPDRAG[S.nasta], km = nu && !S.aktivt ? (G.kostnad(nu).mark || 0) : 0;
        UI._rulla('.ks-mark b', S.res.mark); sv('.ks-mark i', '+' + tal(G.takt('mark')) + ' /s'); UI._strom('mark', G.takt('mark'), true); bv('.ks-mark u u', km > 1 ? Math.min(100, S.res.mark / km * 100) : 0);
        if (sk) { const kv = G.skeppKvar(); sv('.ks-skepp b', String(G.skepp())); sv('.ks-skepp i', isFinite(kv) ? 'nästa om ' + (kv < 60 ? Math.ceil(kv) + ' s' : Math.ceil(kv / 60) + ' min') : '+' + Math.round((G.tullX() - 1) * 100) + ' % mark'); }
      } }
      if (UI._kungOppen) { if ($('ruta').style.display === 'none') UI._kungOppen = false; else UI._kungKort(); }
      if (S.t > 25 && !S.aktivt && !G.skede() && root.classList.contains('spel')) {          // en ny sak i taget, med en lugn rad
        if ((D.VARLDAR[S.varld] || {}).takKung && S.titel === 'Kung' && !S.takSagt) { S.takSagt = 1; UI.text('Som kung har ' + ((D.KUNGINFO[S.varld] || {}).namn || 'kungen') + ' rikets stående armé av svenskt fotfolk. Armén rymmer nu ' + tal(G.tak()) + ' män.', 10); }
        else if (G.harVarv() && !S.varvSagt) { S.varvSagt = 1; UI.text('På skeppsgården vid Björkenäs kan män bygga skepp. Kortet ligger under Män.', 10); }
        else if (G.egLista().length && S.varvSagt && !S.kungSagt && S.t > 70) { S.kungSagt = 1; UI.text('Tryck på ' + ((D.KUNGINFO[S.varld] || {}).namn || 'kungen') + ', så ser du vem han är och vad han kan bli bättre på.', 10); }
      }
      if (skattRad) {            // driv in skatt: män ut, mark hem
        const sk = S.skatt, ute = G.skattUte(), fullt = ute >= G.skattMax();
        uppd(skattRad, { namn: 'Driv in skatt', niva: ute ? ute + ' ute' : undefined, v: fullt ? 'alla lag är ute' : 'ger ' + IK.mark + tal(G.skattGer()), k: fullt ? '' : IK.man + tal(G.skattPris()), ok: G.kanSkatt(), bar: sk ? Math.min(100, sk.t / sk.dur * 100) : 0 });
        skattRad.row.classList.toggle('pagar', fullt);
      }
      for (const id of ids) for (const r of [rows[id], rows2[id]]) { if (!r) continue;          // staden står både under männen eller marken och i sin egen flik
        const L = S.bas[id], res = G.prisRes(id), pris = G.pris(id), max = G.maxad(id), stopp = G.stoppad(id), dub = G.rad(id), dv = G.dagsverke(id), mk = !!S.marknad && S.marknad.bas === id;
        uppd(r, { namn: G.BAS[id].kort || G.BAS[id].namn, niva: L, v: mk ? 'Marknad! Tryck här' : stopp ? D.UPPROR[stopp].namn : '<b class="k-ps">' + tal(G.prod(id) * fx) + ' ' + ger(id) + '/s</b>' + (max ? ' <small class="k-mer">full</small>' : ' <small class="k-mer">' + (dub ? dubKort() : '+' + tal((G.prod(id, L + 1) - G.prod(id, L)) * fx)) + '</small>'),
          k: mk || max || stopp ? '' : IK[res] + tal(pris) + (dv ? ' ' + IK.man + tal(dv) : ''), ok: mk || (S.res[res] >= pris && S.res.man >= dv && !max && !stopp), snart: dub && !max && !stopp && !mk, bar: stopp ? 0 : G.levFas(id) * 100, mot: (L % 10) / 10 });
        r.row.classList.toggle('dags', dv > 0 && !mk && !stopp); r.row.classList.toggle('stopp', !!stopp); r.row.classList.toggle('vald', valdBas === id); r.row.classList.toggle('marknad', mk); r.row.classList.toggle('fogde', !!S.fogde[id]); r.row.classList.toggle('last', max && !mk);
      }
      for (const id in (UI._arows || {})) { const n = G.arb(id), full = G.arbMax(id); uppd(UI._arows[id], { namn: 'Gruvarbetare', niva: n, v: full ? 'armén är för liten än' : '+10 % i ' + (G.BAS[id].kort || G.BAS[id].namn), k: full ? '' : IK.man + tal(G.arbPris(id)), ok: G.kanArb(id), bar: 0 }); }
      byggRader.forEach(r => uppd(r, { namn: 'Bygg: ' + r.b.namn, v: r.b.ger, k: IK.mark + tal(r.b.kostar), ok: G.kanBygga(r.b.id), snart: true }));
      husRader.forEach(r => { const h = r.h, L = G.hus(h.id), res = G.husRes(h); uppd(r, { namn: h.namn, niva: L || undefined, v: '+' + Math.round(h.ger * 100) + ' % ' + (res === 'man' ? 'män' : 'mark'), k: IK[res] + tal(G.husPris(h.id)), ok: G.kanHus(h.id), snart: !L }); });
      if (soldRad && S.sold) { const fas = (S.t / 9) % 1; if (soldRad._fas !== undefined && fas < soldRad._fas - 0.5) UI._klump(null, soldRad.row, G.soldProd() * fx * 9, 'man'); soldRad._fas = fas; }
      if (soldRad) { const L = S.sold || 0, dub = (L + 1) % 10 === 0; uppd(soldRad, { namn: S.varld === 0 ? 'Knektar i tjänst' : 'Värva soldater', niva: L, v: G.manFull() ? 'armén fylls redan på ' + G.MAN_FYLL + ' s' : '<b class="k-ps">' + tal(G.soldProd() * fx) + ' män/s</b> <small class="k-mer">' + (dub ? dubKort() : '+' + tal((G.soldProd(L + 1) - G.soldProd(L)) * fx)) + '</small>', k: IK.mark + tal(G.soldPris()), ok: G.kanSold(), snart: dub, bar: 0, mot: (L % 10) / 10 }); }
      for (const id in krows) { const L = S.konst[id], max = L >= G.KONST_MAX, dub = (L + 1) % 10 === 0; uppd(krows[id], { namn: UI.konst(id)[0], niva: L, v: max ? 'kan inte bli bättre' : konstInfo(id).kort, k: max ? '' : IK.mark + tal(G.konstPris(id)), ok: G.kanKonst(id), snart: dub && !max, bar: 0, mot: (L % 10) / 10 }); }
      // en fogde i taget: kortet sätter en fogde på den plats där det är billigast
      for (const f of fogdeKnappar) { const utan = f.ids().filter(id => !S.fogde[id]); let b = null; for (const id of utan) if (!b || G.fogdePris(id) < G.fogdePris(b)) b = id; f.mal = b; f.r.row.style.display = b ? '' : 'none'; if (b) uppd(f.r, { namn: 'Sätt en fogde', v: 'bygger ut ' + G.BAS[b].namn + ' åt dig', k: IK.mark + tal(G.fogdePris(b)), ok: S.res.mark >= G.fogdePris(b) }); }
      // en prick på fliken när något där går att köpa
      for (const f in flikar) { const fl = flikar[f]; fl.knapp.classList.toggle('vald', f === flik); fl.sida.classList.toggle('dold', f !== flik); fl.knapp.classList.toggle('kan', f !== flik && !!fl.sida.querySelector('.bas:not(.ej):not(.pagar)')); }
      UI._stadLista(ids);
      UI._kort();
      // egna handlingar: tre stora knappar bredvid den runda, med vila emellan
      const hl = G.handlingar(), hk = hl.map(h => h.id).join(',') + S.hjalte;
      if (hk !== sistaHandl) {
        sistaHandl = hk; const box = $('handl'); box.innerHTML = ''; hrows = {};
        hl.forEach((h, i) => {
          const b = el('button', 'hk', '<span class="hk-b">' + IK[h.id] + '<i class="hk-v"></i><b class="hk-s"></b><u class="hk-n">' + (i + 1) + '</u></span><span class="hk-t">' + UI.handlNamn(h).split(' ')[0] + '</span>'); b.id = 'hk-' + h.id; box.appendChild(b); hrows[h.id] = { b, v: b.querySelector('.hk-v'), s: b.querySelector('.hk-s') };
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
      { const slag = G.skede() === 'strid' && !!(G.uppdrag() || {}).order; if (root.classList.contains('slag') !== slag) root.classList.toggle('slag', slag); if (root.classList.contains('forspel') !== (S.varld === 0)) root.classList.toggle('forspel', S.varld === 0); }
      // farten
      const ring = $('ak-ring'), C = 2 * Math.PI * 54; ring.style.strokeDasharray = C; const mm = S.aktivt && S.aktivt.mom, pl = mm && !mm.svar && mm.typ !== 'vanta' && u && u.order ? G._plan(u).mom[mm.i] : null; $('akwrap').classList.toggle('vantar', !!pl && S.varld === 0); const hm = pl ? Math.min(1, (mm.n || 0) / Math.max(4, pl.langd * G.ORDER.tps)) : null; ring.style.strokeDashoffset = C * (1 - (hm !== null ? hm : S.fart)); $('akwrap').classList.toggle('hugg', hm !== null);          // i ett hugg visar ringen hur många hugg som tog          // i förspelets slag trycker man på ringen, inte på knappen
      $('akwrap').classList.toggle('full', S.full && hm === null); $('fullx').textContent = hm !== null ? 'kraft ' + Math.round(hm * 100) + ' %' : S.full ? 'allt ×' + G.fullX() : ''; $('akwrap').classList.toggle('kraft', hm !== null && hm >= 0.5);          // i ett slag: hur hårt dina män går på
      // rutan med berättelsen och textraderna ligger strax ovanför konsolen
      const h = $('konsol').offsetHeight + 22; $('berattar').style.bottom = h + 'px'; $('text').style.bottom = (h + 28) + 'px';          // ovanför knappen Hitta mig
      V.Scene.lyft = (innerWidth < 720 || innerHeight < 520) && root.classList.contains('spel') ? (h - 22) / 2 : 0;          // se scene.js: bilden lyfts så att mitten hamnar ovanför konsolen
      UI._tips();
    },
    // Tre flikar: män, mark och egna förmågor. Tillgången står i själva fliken. Under dem ligger den valda flikens kort.
    _byggBaser(ids) {
      const S = G.s, box = $('baser'); box.innerHTML = '<div id="flikar"></div>'; UI._arows = {}; rows = {}; rows2 = {}; husRader = []; krows = {}; skattRad = null; varvRad = null; soldRad = null; byggRader = []; fogdeKnappar = []; kortNu = null; flikar = {};
      const nyFlik = (f, id, huvud, titel) => {
        const knapp = el('button', 'flik', huvud + '<u class="prick"></u>'); if (id) knapp.id = id; knapp.setAttribute('aria-label', titel); box.firstChild.appendChild(knapp);          // ingen vit webbläsarruta när man håller över fliken (Johannes 2026-11-28)
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
            (G.maxad(id) ? '<p class="kort-x">Kan inte bli större än armén tillåter.</p>' : '<p class="kort-x">Nästa nivå: ' + (dub ? (UI.byggNamn(id, L + 1) || 'dubbling') + ', ' + dubOrd(res) + ' ' + (res === 'man' ? 'män' : 'mark') : '+' + tal((G.prod(id, L + 1) - G.prod(id, L)) * fx) + ' ' + enh + ' i sekunden') + '.</p><p class="kort-p">Kostar ' + IK[res] + tal(G.pris(id)) + ' ' + (res === 'man' ? 'män' : 'mark') + '</p>' + (G.dagsverke(id) ? '<p class="kort-x">Stort bygge: ' + IK.man + tal(G.dagsverke(id)) + ' män gör dagsverken på det.</p>' : '')) +
            (S.fogde[id] ? '<p class="kort-h">En fogde bygger ut här åt dig.</p>' : '') + (V.pek ? '' : '<p class="kort-h">Högerklick visar platsen på kartan.</p>');
        }, row => { valdBas = id; if (G.s.marknad && G.s.marknad.bas === id) { G.marknadTa(); return; } if (!UI.kop(id)) { UI._nej(row); if (G.maxad(id)) UI.text(b.namn + ' kan inte bli större än armén tillåter.', 6); } },
        () => { valdBas = id; UI.onVisaBas && UI.onVisaBas(id); });
      };
      const konstKort = (s, kd) => { const id = kd.id;
        krows[id] = kort(s, 'konst', IK.krona, () => { const L = S.konst[id], i = konstInfo(id), max = L >= G.KONST_MAX; return '<b>' + UI.konst(id)[0] + '</b><span class="kort-n">nivå ' + L + '</span><p>' + UI.konst(id)[1] + '</p>' + (S.varld === 0 && kd.fran0 ? '<p class="svag">' + (kd.bygg0 ? 'Den kommer från ' : 'Du har den ') + kd.fran0 + '.</p>' : '') + '<p class="kort-g">Nu: ' + i.nu + '</p>' + (max ? '' : '<p class="kort-x">Nästa nivå: ' + i.nasta + '</p><p class="kort-p">Kostar ' + IK.mark + tal(G.konstPris(id)) + ' mark</p>'); },
          row => { if (G.kopKonst(id)) V.Ljud && V.Ljud.spela('kop'); else UI._nej(row); });
        krows[id].row.id = 'konst-' + id;
      };
      const byggKort = (s2, lista) => lista.forEach(b => { const r = kort(s2, 'bygge', IK.pil, () => '<b>Bygg: ' + b.namn + '</b><p>' + b.vad + '</p><p class="kort-p">Kostar ' + IK.mark + tal(b.kostar) + ' mark</p>', row => { if (G.bygg(b.id)) V.Ljud && V.Ljud.spela('dubbel'); else UI._nej(row); }); r.row.id = 'bygg-' + b.id; r.b = b; byggRader.push(r); });
      const konstUnder = (s, f) => { D.KONSTER.filter(k => k.flik0 === f && (S.varld !== 0 || !k.bygg0) && G.harKonst(k.id)).forEach(k => konstKort(s, k)); };          // förspelet: förmågorna ligger under männen och marken
      const soldKort = s => { soldRad = kort(s, 'sold', IK.man, () => { const L = S.sold || 0, fx = S.full ? G.fullX() : 1, dub = (L + 1) % 10 === 0; return (S.varld === 0 ? '<b>Ta knektar i tjänst</b><span class="kort-n">nivå ' + L + '</span><p>Knektar som får lön stannar hos dig. De bor i huset vid slottet.</p>' : '<b>Värva soldater</b><span class="kort-n">nivå ' + L + '</span><p>Soldater som får lön stannar hos dig. Det är därför du gör egna mynt i Hedemora.</p>') + '<p class="kort-g">Ger ' + tal(G.soldProd() * fx) + ' män i sekunden.</p><p class="kort-x">Nästa nivå: ' + (dub ? dubOrd() + ' män' : '+' + tal((G.soldProd(L + 1) - G.soldProd(L)) * fx) + ' män i sekunden') + '.</p><p class="kort-p">Kostar ' + IK.mark + tal(G.soldPris()) + ' mark</p>'; }, row => { if (G.kopSold()) V.Ljud && V.Ljud.spela(G.s.sold % 10 === 0 ? 'dubbel' : 'kop'); else UI._nej(row); }); soldRad.row.id = 'sold'; };
      // ett av stadens hus: nivå, vad nästa nivå ger staden, och priset i det staden ger
      const husKort = (s, h) => { const r = kort(s, 'hus', IK.pil, () => { const L = G.hus(h.id), res = G.husRes(h), enh = res === 'man' ? 'män' : 'mark'; return '<b>' + h.namn + '</b><span class="kort-n">nivå ' + L + '</span><p>' + h.vad + '</p><p class="kort-g">Nu: ' + (L ? G.BAS[h.plats].namn + ' ger ' + Math.round(h.ger * L * 100) + ' % mer ' + enh : 'inte byggt än') + '.</p><p class="kort-x">Nästa nivå: ' + Math.round(h.ger * 100) + ' % mer ' + enh + ' till.</p><p class="kort-p">Kostar ' + IK[res] + tal(G.husPris(h.id)) + ' ' + enh + '</p>'; }, row => { if (G.kopHus(h.id)) V.Ljud && V.Ljud.spela(G.hus(h.id) === 1 ? 'hammare' : 'kop'); else UI._nej(row); }); r.h = h; r.row.id = 'hus-' + h.id; husRader.push(r); };
      const man = () => {
        const m = ids.filter(id => G.BAS[id].ger === 'man'); if (!m.length) return;
        const ksMan = '<div class="ks ks-man">' + IK.man + '<b></b><span></span><i></i><u><u></u></u></div>', ksMark = '<div class="ks ks-mark">' + IK.mark + '<b></b><span>mark</span><i></i><u><u></u></u></div>';          // flikarna Män och Mark är själva tillgångsrutorna (Johannes 2026-11-28 03:48)
        const s = nyFlik('man', 'res-man', ksMan, RES.man.rad + ' Stapeln visar hur full armén är.'); flikar.man.knapp.classList.add('flik-res');          // en flik för män och mark (Johannes 2026-11-28 03:43: "slå ihop ... som förut, men tydliga som nu")
        if (G.harSkatt()) { skattRad = kort(s, 'skatt', IK.mark, () => '<b>Driv in skatt</b><p>Skicka ut män för att samla in skatten. Efter tolv sekunder kommer de hem med mark. Upp till tre lag kan vara ute samtidigt, så en full armé behöver aldrig stå stilla.</p><p class="kort-g">Ger ' + IK.mark + tal(G.skattGer()) + ' mark</p><p class="kort-p">Kostar ' + IK.man + tal(G.skattPris()) + ' män</p>', row => { if (!(UI.onSkatt && UI.onSkatt())) UI._nej(row); }); skattRad.row.id = 'skatt'; }
        if (G.harVarv()) { varvRad = kort(s, 'varv', IK.skepp, () => { const per = Math.round(G.TULL * 100 * (1 + 0.1 * G.eg('flotta'))), vm = G.varvMan(); return '<b>Varvet vid Björkenäs</b><span class="kort-n">' + G.skepp() + ' skepp</span><p>Skeppsgården norr om Kalmar, där kungens örlogsskepp byggs. Varje tryck sätter 50 män i arbete där, och det finns plats för högst 500. De lämnar armén och stannar på varvet, och bygger skepp efter skepp. Ju fler män, desto fortare går det.</p><p class="kort-g">Flottan tar tull av fartygen på Östersjön. Varje skepp ger ' + per + ' % mer mark. Nu: +' + Math.round((G.tullX() - 1) * 100) + ' %.</p>' + (vm ? '<p class="kort-x">' + tal(vm) + ' män arbetar på varvet. Nästa skepp är klart om ' + (G.skeppKvar() < 60 ? Math.ceil(G.skeppKvar()) + ' sekunder' : Math.ceil(G.skeppKvar() / 60) + ' minuter') + '.</p>' : '') + (G.varvFullt() ? '<p class="kort-x">Varvet är fullt.</p>' : '<p class="kort-p">Ett lag till: ' + IK.man + tal(G.varvLag()) + ' män</p>'); }, row => { if (G.kopSkepp()) V.Ljud && V.Ljud.spela('hammare'); else UI._nej(row); }); varvRad.row.id = 'varv'; }
        m.forEach(id => bas(s, id));
        if (S.las.sold && S.varld !== 0) soldKort(s);
        fogde(s, () => m);          // förmågorna ligger på kungens sida (Johannes 2026-11-28 11:07: "under en egen knapp, kanske under Regenten")
      };
      const mark = () => {
        const m = ids.filter(id => G.BAS[id].ger !== 'man'); if (!m.length) return;
        const s = nyFlik('mark', 'res-mark', '<div class="ks ks-mark">' + IK.mark + '<b></b><span>mark</span><i></i><u><u></u></u></div><em id="res-skuld" title="Det du är skyldig Lübeck för skeppen och soldaterna.">skuld <b id="skuld-v"></b></em>', RES.mark.rad + ' Stapeln visar hur långt du har kvar till nästa steg.'); flikar.mark.knapp.classList.add('flik-res');
        m.forEach(id => {
          bas(s, id); if (G.BAS[id].slag !== 'gruva') return;          // en gruva har också ett kort för att sätta män i arbete där
          UI._arows[id] = kort(s, 'arb', IK.man, () => '<b>Gruvarbetare i ' + G.BAS[id].namn + '</b><span class="kort-n">' + G.arb(id) + ' lag</span><p>Du sätter män i arbete i gruvan. De lämnar armén och bryter malm i stället.</p><p class="kort-g">Varje lag ger gruvan en tiondel mer. Nu: +' + G.arb(id) * 10 + ' %.</p>' + (G.arbMax(id) ? '<p class="kort-x">Nästa lag är större än armén rymmer.</p>' : '<p class="kort-p">Nästa lag: ' + IK.man + tal(G.arbPris(id)) + ' män</p>'),
            row => { if (G.kopArb(id)) V.Ljud && V.Ljud.spela('hammare'); else UI._nej(row); });
        });
        fogde(s, () => m);
      };
      man(); mark();          // alltid samma ordning: män, mark, förmågor (Johannes 2026-11-26, sista beskedet)
      // Stadens egen flik (förspelet, Johannes 2026-11-26 21:22 och 21:25): staden, husen som ger staden mer, byggnaderna där och det de ger.
      // Den visar den stad man senast tryckte på (först Stockholm). Ett tryck på en stad, dess namn eller ett av dess hus på kartan öppnar den.
      { const sid = UI.stadNu(ids); if (sid) {
        const b = G.BAS[sid], s = nyFlik('stad', 'flik-stad', SLAG[b.slag] + '<b class="fl-n">' + b.namn + '</b>' + (ids.length > 1 ? '<i class="fl-byt">▾</i>' : ''), b.namn + ': staden och dess hus. Tryck på fliken igen för att välja en annan stad, eller på en stad på kartan.');
        bas(s, sid, rows2);
        D.BYGGNADER.filter(h => h.niva && h.plats === sid && G.husFinns(h.id)).forEach(h => husKort(s, h));
        byggKort(s, G.byggnader().filter(h => (h.stad || h.plats) === sid));
        if (S.varld === 0 && sid === 'stockholm' && S.las.sold) soldKort(s);          // i Gustavs värld ligger soldaterna under männen
        if (false) D.KONSTER.filter(k => { const h = k.bygg0 && D.BYGGNADER.find(q => q.id === k.bygg0); return h && (h.stad || h.plats) === sid && G.harKonst(k.id); }).forEach(k => konstKort(s, k));          // förmågor från förspelets byggnader
      } }
      // Ingen egen flik för förmågor: de ligger under männen och marken, hos det de hör till (förspelet 2026-11-26, Gustavs värld 2026-11-27)
      if (!flikar[flik]) flik = flikar[S.flik] ? S.flik : Object.keys(flikar)[0];
      // två rader kort om det får plats på bredden, annars tre
      const fri = innerWidth - 16 - 226 - 104 - ($('handl').offsetWidth || 0) - 8 * 4 - 22; let flest = 0; for (const f in flikar) flest = Math.max(flest, flikar[f].sida.children.length);
      let rader = 2, bredd = 196; for (; rader < 5; rader++) { const kol = Math.ceil(flest / rader); if (kol * (bredd + 5) <= fri) break; if (kol * 181 <= fri) { bredd = 176; break; } }
      if (innerWidth < 720) { rader = flest <= 2 ? 1 : 2; bredd = Math.floor((innerWidth - 12 - 14 - 5) / 2); } else if (innerHeight < 520) { rader = 2; bredd = 176; }          // telefon: två rader, resten bläddrar man fram i sidled
      box.style.setProperty('--rader', rader); box.style.setProperty('--bredd', bredd + 'px');
      { const kol = Math.max(1, Math.ceil(flest / rader)); box._maxW = innerWidth < 720 ? 0 : kol * bredd + (kol - 1) * 5 + 16; }          // den bredaste flikens bredd: panelen växer bara åt höger, flikarna och kassan står still (Johannes 2026-11-28)
    },
    // När ska rutan om en knapp visas? Med mus: när pekaren är över knappen. På pekskärm: bara när fingret hålls kvar en stund,
    // och då räknas trycket inte som ett köp. Ett vanligt tryck på telefon köper utan att någon ruta kommer upp.
    _svava(e, visa, dolj) {
      if (!V.pek) { let mt = null, uppe = false; e.addEventListener('mouseenter', () => { clearTimeout(mt); mt = setTimeout(() => { uppe = true; visa(); }, 2000); }); e.addEventListener('mousemove', () => { if (!uppe) { clearTimeout(mt); mt = setTimeout(() => { uppe = true; visa(); }, 2000); } }); e.addEventListener('mouseleave', () => { clearTimeout(mt); mt = null; if (uppe) { uppe = false; dolj(); } }); return; }          // med mus: rutan kommer först när pekaren har stått still över kortet en stund (Johannes 2026-11-28: "den poppar upp för mycket")
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
    konst(id) { const k = G.KONST[id], f = G.s.varld === 0; return [f && k.sture ? k.sture : k.namn, k.vad0 || k.vad]; },          // hjälten rider själv i båda världarna
    _nej(e) { e.classList.remove('skaka'); void e.offsetWidth; e.classList.add('skaka'); V.Ljud && V.Ljud.spela('trumma'); },
    kop(id) { if (G.kop(id)) { V.Ljud && V.Ljud.spela(G.s.bas[id] % 10 === 0 ? 'dubbel' : 'kop'); UI.tick(); return true; } return false; },
    valj(id) { valdBas = id; },
    // Läs mer om ett steg: varför det händer. Spelet står still medan rutan är uppe.
    // händelserutans Läs mer: vad som hände, varför och vad det betydde (js/djup.js)
    djupInfo(u) { UI.ruta('<h2>' + u.titel + '</h2><p class="mal">' + (UI.vagText(u) || UI.platsnamn(u.plats)) + ', ' + u.ar + '</p><p>' + V.DJUP[u.id] + '</p>' + '<button class="stang">Stäng</button>', false); UI._paus = true; },
    merInfo(u) { UI.ruta('<h2>' + u.titel + '</h2><p class="mal">' + (UI.vagText(u) || UI.platsnamn(u.plats)) + ', ' + u.ar + '</p><p>' + u.mer + '</p>' + '<button class="stang">Stäng</button>', false); UI._paus = true; },
    // Ligger punkten på skärmen under en av knapparna? Då ska ingen skylt stå där.
    _skymd(sp) { for (const id of ['handl', 'hitta', 'akwrap', 'stadlista']) { const e = $(id); if (!e || !e.offsetParent) continue; const r = e.getBoundingClientRect(); if (sp.x > r.left - 12 && sp.x < r.right + 12 && sp.y > r.top - 14 && sp.y < r.bottom + 8) return true; } return false; },
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
    // Stadslistan till höger (Johannes 2026-11-28: "man ser denna listan hela tiden ... så man lättare ser vilka städer man har och kan uppgradera").
    // Bara på dator; på telefon finns menyn bakom stadens flik. Ett tryck på raden tar en till staden. Här byggs inget ut (Johannes 2026-11-28: man ska gå in i staden).
    _stadLista(ids) {
      const e = $('stadlista'), S = G.s; if (!e) return;
      const syns = !V.pek && innerWidth >= 1200 && innerHeight >= 640 && root.classList.contains('spel') && !S.slut && ids.length > 0;
      if (!syns) { if (e.style.display !== 'none') e.style.display = 'none'; return; }
      if (e.style.display === 'none') e.style.display = '';
      if (e._ids !== ids.join(',')) {
        e._ids = ids.join(','); e._r = {};
        e.innerHTML = '<div class="sl-rubrik"><span>Dina orter</span><i class="sl-antal"></i></div><div class="sl-rader"></div>';
        const box = e.querySelector('.sl-rader');
        for (const id of ids) {
          const b = G.BAS[id], r = el('div', 'sl-rad', '<i class="sl-ikon">' + SLAG[b.slag] + '</i><div class="sl-in"><div class="sl-r1"><span class="sl-namn">' + (b.kort || b.namn) + '</span><b class="sl-niva"></b></div><div class="sl-r2"><span class="sl-ger"></span></div></div>');
          r.dataset.id = id; box.appendChild(r);
          r.addEventListener('click', ev => { ev.stopPropagation(); V.Ljud && V.Ljud.vakna(); UI.visaStad(id); if (UI.onVisaBas) UI.onVisaBas(id); });
          e._r[id] = { r, niva: r.querySelector('.sl-niva'), ger: r.querySelector('.sl-ger') };
        }
      }
      const fx = S.full ? G.fullX() : 1; let kan = 0;
      for (const id of ids) {
        const o = e._r[id]; if (!o) continue;
        const L = S.bas[id], res = G.prisRes(id), max = G.maxad(id), stopp = G.stoppad(id), mk = !!S.marknad && S.marknad.bas === id, dv = G.dagsverke(id), ok = !max && !stopp && !mk && G.kanKopa(id), dub = G.rad(id) && !max && !stopp;
        if (ok) kan++;
        const nv = String(L), gv = stopp ? D.UPPROR[stopp].namn : tal(G.prod(id) * fx) + ' ' + (G.BAS[id].ger === 'man' ? 'män' : 'mark') + '/s';
        if (o._n !== nv) { o._n = nv; o.niva.textContent = nv; }
        if (o._g !== gv) { o._g = gv; o.ger.textContent = gv; }
        o.r.classList.toggle('kan', ok || mk); o.r.classList.toggle('dubbel', dub); o.r.classList.toggle('stopp', !!stopp); o.r.classList.toggle('full', !!max && !mk); o.r.classList.toggle('vald', UI.stadVald(id) || (flik !== 'stad' && valdBas === id));
      }
      { const a = e.querySelector('.sl-antal'), t = kan ? kan + ' kan byggas ut' : ''; if (a._t !== t) { a._t = t; a.textContent = t; } }
      // aldrig över konsolen: listan slutar ovanför det som står nertill på hennes sida av skärmen
      const top = e.offsetTop, vk = innerWidth - e.offsetWidth - 20; let golv = innerHeight - 10;
      for (const q of [...($('konsol').children), $('kassa'), $('hitta')]) { if (!q || !q.offsetParent) continue; const rr = q.getBoundingClientRect(); if (rr.width && rr.right > vk && rr.top > top) golv = Math.min(golv, rr.top - 10); }
      const mh = Math.max(120, Math.round(golv - top)) + 'px'; if (e.style.maxHeight !== mh) e.style.maxHeight = mh;
    },
    nastaStad() { const S = G.s, ids = Object.keys(S.bas).filter(id => S.bas[id] && G.BAS[id]), i = ids.indexOf(UI.stadNu(ids)); S.stad = ids[(i + 1) % ids.length]; sistaBaser = ''; if (UI.onVisaBas) UI.onVisaBas(S.stad); },
    // "Från Stockholm till Vädla" för ett steg där någon ger sig av (Johannes 2026-11-27: tydligt varifrån och vart)
    vagText(u) {
      if (!u || ['bud', 'flotta', 'tag', 'rid'].indexOf(u.slag) < 0) return ''; if (u.vag) return u.vag;
      const f = G.s.varld !== 0 && !u.fran && !u.med && u.slag !== 'rid' ? null : V.Varld.franId(u); return f && f !== u.plats ? 'Från ' + UI.platsnamn(f) + ' till ' + UI.platsnamn(u.plats) : 'Till ' + UI.platsnamn(u.plats);
    },
    platsnamn(id) { const b = G.BAS[id]; if (b) return b.namn; return ({ brunnback: 'Brunnbäcks färja', brunkeberg: 'Brunkeberg', stegeborg: 'Stegeborg', orebro: 'Örebro', strangnas: 'Strängnäs', soderkoping: 'Söderköping', malmo: 'Malmö', lubeck: 'Lübeck', storatuna: 'Stora Tuna', skara: 'Västergötland', smaland: 'Småland', kisa: 'Kisa', virserum: 'Virserum', bornholm: 'Bornholm', staket: 'Stäket', vadla: 'Vädla', brannkyrka: 'Brännkyrka', bogesund: 'Åsundens is', alvsborg: 'Älvsborg', wesenberg: 'Wesenberg', wenden: 'Wenden', kexholm: 'Kexholm', orbyhus: 'Örbyhus', borgholm: 'Borgholm', drottningholm: 'Drottningholm', linkoping: 'Linköping', teusina: 'Teusina', nokia: 'Nokia', olandsudde: 'Ölands norra udde', getaryggen: 'Getaryggen', arboga: 'Arboga', halmstad: 'Halmstad', varberg: 'Varberg', axtorna: 'Axtorna', mared: 'Mared', visby: 'Visby', kopenhamn: 'Köpenhamn', rafsnas: 'Räfsnäs', nykoping: 'Nyköping' })[id] || id; },

    // ---- varje bildruta: pilar över baser som går att bygga ut -----------------------------------
    frame() {
      const S = G.s, box = $('pilar'), spel = root.classList.contains('spel'), golv = innerHeight - ($('konsol').offsetHeight || 0) - 30;
      for (const b of D.BASER) {
        const id = b.id, can = spel && S.bas[id] && G.kanKopa(id) && !G.stoppad(id) && !(S.marknad && S.marknad.bas === id); let p = pilar[id];
        if (!can) { if (p) p.style.display = 'none'; continue; }
        if (!p) { p = pilar[id] = el('button', 'pil', IK.pil); p.title = 'Bygg ut ' + b.namn; box.appendChild(p); p.addEventListener('click', e => { e.stopPropagation(); UI.kop(id); }); }
        const w = V.Varld.pos(id), sp = V.Scene.screenPoint(w.x, w.y + 3.6, w.z), dold = sp.behind || sp.x < 20 || sp.x > innerWidth - 40 || sp.y < 60 || sp.y > golv || UI._skymd(sp);
        p.style.display = dold ? 'none' : ''; p.style.transform = 'translate(' + (sp.x - 13) + 'px,' + (sp.y - 26) + 'px)'; p.classList.toggle('dubbel', G.rad(id));
      }
      // ortnamnen vid varje ort (förspelet, Johannes 2026-11-26: "deras namn ska synas på nåt sätt så man ser vid orten vilken det är")
      { const lista = spel ? V.Varld.ortnamn() : [], sett = {}; if (spel && V.Levande) { const upp = {}; for (const o of lista) { upp[o.id] = 1; upp['_' + Math.round(o.x / 2.2) + ',' + Math.round(o.z / 2.2)] = 1; } lista.push(...V.Levande.orter(upp)); } const rekt = [];          // och de orter som texterna nämner (levande.js)          // i ett slag: vem som är vem
        for (const o of lista) { let e = ortEl[o.id]; if (!e) { e = ortEl[o.id] = el('div', o.liten ? 'ortnamn liten' : 'ortnamn', o.namn); $('ortnamn').appendChild(e); const oid = o.id; e.addEventListener('click', ev => { ev.stopPropagation(); if (G.s.bas[oid]) { V.Ljud && V.Ljud.vakna(); UI.visaStad(oid); if (UI.onVisaBas) UI.onVisaBas(oid); } }); } sett[o.id] = 1;          // ett tryck på namnet öppnar stadens flik
          const sp = V.Scene.screenPoint(o.x, o.y, o.z), bw = o.namn.length * 7.4 + 16; let dold = sp.behind || sp.x < 12 || sp.x > innerWidth - 12 || sp.y < 56 || sp.y > golv + 10 || UI._skymd(sp);
          if (!dold && o.liten && rekt.some(r => Math.abs(r.x - sp.x) < (r.w + bw) / 2 && Math.abs(r.y - sp.y) < 20)) dold = true; else if (!dold) rekt.push({ x: sp.x, y: sp.y, w: bw });          // de små skyltarna står aldrig över ett annat namn
          e.style.display = dold ? 'none' : ''; if (!dold) e.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(sp.y) + 'px) translate(-50%, 0)'; }
        for (const id in ortEl) if (!sett[id] && ortEl[id].style.display !== 'none') ortEl[id].style.display = 'none'; }
      // marknadsdag: en gyllene knapp över platsen
      const mk = S.marknad && spel ? S.marknad.bas : null; let mb = pilar._marknad;
      if (!mk) { if (mb) mb.style.display = 'none'; }
      else {
        if (!mb) { mb = pilar._marknad = el('button', 'pil marknad', IK.mark); mb.title = 'Marknadsdag'; box.appendChild(mb); mb.addEventListener('click', e => { e.stopPropagation(); G.marknadTa(); UI.tick(); }); }
        const w = V.Varld.pos(mk), sp = V.Scene.screenPoint(w.x, w.y + 4.4, w.z), dold = sp.behind || sp.x < 20 || sp.x > innerWidth - 40 || sp.y < 60 || sp.y > golv || UI._skymd(sp);
        mb.style.display = dold ? 'none' : ''; mb.style.transform = 'translate(' + (sp.x - 23) + 'px,' + (sp.y - 46) + 'px)';
      }
      // de första minuterna i en värld står det Du över den man är (och Ditt bud över budet, när man är Kristina och budet rider)
      { const nd = S.varld >= 2 ? D.VARLDAR[S.varld].namn : S.varld !== 0 ? 'Gustav' : S.hjalte === 'kristina' ? 'Kristina' : 'Sten Sture'; if ($('vem-du').textContent !== nd) { $('vem-du').textContent = nd; $('vem-bud').textContent = S.varld >= 2 ? D.VARLDAR[S.varld].namn + 's bud' : S.varld !== 0 ? 'Gustavs bud' : 'Kristinas bud'; } }          // namn, inte du (Johannes 2026-11-26)
      { const visa = spel && !S.slut, slag = spel && root.classList.contains('slag'), kr = spel && !S.slut && S.hjalte === 'kristina' && S.hjalteT !== undefined && S.t - S.hjalteT < 90 ? V.Varld._kristina : null,          // och en stund efter att man har blivit Kristina
        lagg = (id, o, h, pa) => { const e = $(id), sp = pa && o && o.g && o.g.visible ? V.Scene.screenPoint(o.x, V.Geo.groundAt(o.x, o.z) + h, o.z) : null, syns = sp && !sp.behind && sp.y > 50 && sp.y < golv && !UI._skymd(sp); e.style.display = syns ? 'block' : 'none'; if (syns) e.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(sp.y - 10) + 'px) translate(-50%, -100%)'; };
        lagg('vem-du', kr ? { x: kr.x, z: kr.z, g: { visible: true } } : V.Gustav, kr ? 1.7 : V.Gustav.stupad ? 0.8 : 2.45, visa || !!kr || slag); lagg('vem-bud', V.Bud, 2.45, visa); } V.Levande && V.Levande.taggar(spel && !S.slut, golv);          // skylten står ovanför hjälmen och fjädern, aldrig över figuren (Johannes 2026-11-28)
      // ordern i ett slag: en ring som sluter sig kring knappen. Rätt läge är när den är framme vid knappens kant.
      { const a = S.aktivt, m = a && a.mom, e = $('ak-order'), O = G.ORDER; if (!m || m.svar || !spel || m.typ === 'vanta' || S.varld === 0) { if (e.style.display !== 'none') e.style.display = 'none'; }          // i förspelet inga ringar: man trycker på knappen
        else { const hg = m.typ === 'hugg', j = Math.round(m.tm / O.takt), sk = hg ? 1 + (1 - (m.tm % O.takt) / O.takt) * 0.55 : Math.max(0.86, 1 + (O.mal - m.tm) / O.mal * 1.1), nara = hg ? j >= 1 && Math.abs(m.tm - j * O.takt) <= O.fonster : Math.abs(m.tm - O.mal) <= O.slack, kr = $('ak').getBoundingClientRect(), wr = $('akwrap').getBoundingClientRect();
          e.style.display = 'block'; e.style.width = e.style.height = (kr.width + 6) + 'px'; e.style.left = (kr.left - wr.left - 3) + 'px'; e.style.top = (kr.top - wr.top - 3) + 'px'; e.style.transform = 'scale(' + sk.toFixed(3) + ')'; e.classList.toggle('nara', nara); } }
      // förspelets slag: ringen står i världen där det händer (Varld.malPunkt), och man trycker på den. Den krymper till pricken när det är dags.
      { const a = S.aktivt, m = a && a.mom, e = $('slag-mal'), O = G.ORDER, q = spel && m && !m.svar && m.typ !== 'vanta' ? V.Varld.malSkarm() : null;          // ringen i slaget: där trycker man, eller på knappen (Johannes 2026-11-27 00:39)
        if (!q) { if (e.style.display !== 'none') e.style.display = 'none'; }
        else { const hg = m.typ === 'hugg', studs = Math.max(0, 1 - (performance.now() - (UI._studs || 0)) / 220), sk = 1 + Math.sin(performance.now() / 260) * 0.06 + studs * 0.22, nara = false;          // ingen tajming: den andas, och studsar vid varje tryck
          e.style.display = 'block'; e.style.transform = 'translate(' + Math.round(q.x) + 'px,' + Math.round(q.y) + 'px) translate(-50%, -50%)'; e.firstChild.style.transform = 'scale(' + sk.toFixed(3) + ')'; e.classList.toggle('nara', nara); e.classList.toggle('hugg', hg); e.classList.toggle('vald', false); const ord = (D.UPPDRAG.find(q => q.id === a.id).order[m.i].ord || '').replace(/<br>/g, ' '); if (e.dataset.ord !== ord) e.dataset.ord = ord; } }          // orderns ord under ringen
      // dragkampen högst upp under ett slag i förspelet: dina till vänster, motståndaren till höger
      { const a = S.aktivt, e = $('slag-bar'), u = a && G.uppdrag(), syns = spel && a && a.lage !== undefined && G.skede() === 'strid';
        if (!syns) { if (e.style.display !== 'none') e.style.display = 'none'; }
        else { if (e.style.display === 'none') { e.style.display = ''; e.querySelector('.sb-egen').textContent = u.belagring === 1 ? (u.egen || 'Stockholm') : u.egen || (u.id === 'sUppsala' ? 'Bönderna' : 'Sten Stures män'); e.querySelector('.sb-fiende').textContent = u.belagring === 1 ? (u.fiende || 'Kristians här') : u.fiende || 'Danskarna'; e.dataset.antal = ''; } e.querySelector('.sb-fyll').style.width = (a.lage * 100).toFixed(1) + '%';
          { const n = V.Varld.slagAntal && V.Varld.slagAntal(), t = n ? n.map(x => x.toLocaleString('sv-SE')).join('|') : ''; if (e.dataset.antal !== t) { e.dataset.antal = t; e.querySelectorAll('.sb-tal').forEach(q => q.remove()); if (n) { const k = (sel, x) => { const b = document.createElement('b'); b.className = 'sb-tal'; b.textContent = x.toLocaleString('sv-SE'); e.querySelector(sel).appendChild(b); }; k('.sb-egen', n[0]); k('.sb-fiende', n[1]); } } } } }          // hur många som är kvar på var sida, i de riktiga talen (slagen 2026-11-28)
      if (caption && performance.now() > capT) { caption.classList.add('bort'); const c = caption; caption = null; setTimeout(() => c.remove(), 900); }
    },
    // Vad den runda knappen heter annars: det man gör inför nästa steg i historien (D.GOR). Som kung tar man upp skatt när inget annat står.
    gorOrd(u) { const S = G.s; return (u && D.GOR[u.id]) || (S.varld === 1 && S.titel === 'Kung' ? 'Ta upp<br>skatt' : 'Skicka<br>bud'); },
    // Vad den runda knappen heter medan striden pågår: [ordet på knappen, raden under]. På vägen dit heter den som vanligt.
    drivOrd(u, sk) {
      if (sk !== 'strid') return null;
      if (u.order) { const m = G.s.aktivt && G.s.aktivt.mom; return G.s.aktivt && G.s.aktivt.kula ? ['Träffad', ''] : m && u.order[m.i] && u.order[m.i].ord ? [u.order[m.i].ord, m.svar || m.typ === 'vanta' ? '' : !u.belagring && (u.slag === 'tag' || u.slag === 'flotta') ? 'tryck på fienden' : 'tryck på ringen i slaget'] : [u.belagring ? 'Håll<br>ut' : 'Slaget<br>börjar', 'vänta på ordern']; }
      return u.strid === 'nederlag' ? ['Håll<br>emot', 'tryck: håll emot'] : u.strid === 'pilar' ? ['Skjut!', 'tryck: en salva'] : u.strid === 'kanoner' || u.strid === 'sjo' ? ['Skjut!', 'tryck: kanonerna'] : ['Anfall!', 'tryck: anfall'];
    },
    // Svaret på ett tryck i ett slag: stort, där ringen står (annars ovanför knappen), grönt när det var rätt.
    svar(t, bra) { const q = V.Varld.malSkarm(), k = $('ak').getBoundingClientRect(), x = q ? q.x : k.left + k.width / 2, y = q ? q.y - 56 : k.top - 20, e = el('div', 'flyt svar ' + (bra ? 'bra' : 'fel'), t); e.style.left = x + 'px'; e.style.top = y + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 1300); },
    // Siffra som stiger upp från en plats i världen.
    flyt(x, y, z, txt, cls) {
      const sp = V.Scene.screenPoint(x, y, z); if (sp.behind || !root.classList.contains('spel')) return;
      const e = el('div', 'flyt ' + (cls || ''), txt); e.style.left = sp.x + 'px'; e.style.top = sp.y + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), /stor/.test(cls || '') ? 2600 : 1500);
    },
    // Varje tryck syns: det man fick stiger upp ur knappen, och knappen ger till ett litet hopp.
    tryckt(f) {
      const a = $('ak'), b = a.getBoundingClientRect(); let k = 0;
      for (const r of ['mark', 'man']) if (f[r] >= 0.05) { const e = el('div', 'flyt tr ' + r, '+' + tal(f[r]) + IK[r]); e.style.left = (b.left + b.width / 2 + (Math.random() - 0.5) * 80 + (k++ ? 30 : -6)) + 'px'; e.style.top = (b.top - 4 - Math.random() * 16) + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 950); }
      a.classList.remove('puls'); void a.offsetWidth; a.classList.add('puls');
    },
    // En plats levererar sin klump: den flyger från kortet upp till fliken, och en dubbel leverans får sitt namn (Johannes 2026-11-28).
    leverans(d) { const r = rows[d.bas]; if (r) UI._klump(d.bas, r.row, d.n, d.res); else UI._klump(d.bas, { offsetParent: null }, d.n, d.res);
      if (d.krit && !V.tyst) { const b = G.BAS[d.bas], namn = { bygd: 'God skörd', gruva: 'Rik malmåder', stad: 'Rik handel', slott: 'Full skattkista' }[b.slag] || 'Dubbel leverans', w = V.Varld.pos(d.bas); if (w) UI.flyt(w.x, w.y + 3.4, w.z, namn + '! ×2', d.res); } },
    _klump(id, row, n, res) {
      if (!root.classList.contains('spel') || n < 0.05) return;
      if (row.offsetParent) {          // leveransen flyger från kortet upp till kassan, som lyser till (Johannes 2026-11-28: man ska se vad man får)
        const b = row.getBoundingClientRect(), mal = document.querySelector('#kassa .ks-' + res), e = el('div', 'flyt tr liten flyg ' + res, IK[res] + '+' + tal(n)); e.style.left = (b.right - 34) + 'px'; e.style.top = (b.top + 8) + 'px'; $('flyt').appendChild(e);
        if (mal && e.animate) { const m = mal.getBoundingClientRect(), dx = m.left + 40 - (b.right - 34), dy = m.top + m.height / 2 - (b.top + 8); e.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }, { transform: 'translate(-50%,-50%) translateY(-14px) scale(1.15)', opacity: 1, offset: 0.2 }, { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px)) scale(0.8)', opacity: 0.9 }], { duration: 1100, easing: 'cubic-bezier(.4,0,.6,1)', fill: 'forwards' }); setTimeout(() => { e.remove(); mal.classList.remove('puls'); void mal.offsetWidth; mal.classList.add('puls'); }, 1100); }
        else setTimeout(() => e.remove(), 950);
      }
      const w = id && V.Varld.pos(id); if (w && !V.lugn && $('flyt').children.length < 26) UI.flyt(w.x, w.y + 2.6, w.z, '+' + tal(n), res + ' liten');
    },
    // Skatten kom hem: summan stiger upp ur knappen.
    skattKlar(m) {
      if (!skattRad || !root.classList.contains('spel')) return; const b = skattRad.row.getBoundingClientRect(), e = el('div', 'flyt tr mark', '+' + tal(m) + IK.mark);
      e.style.left = (b.left + b.width / 2) + 'px'; e.style.top = (b.top - 4) + 'px'; $('flyt').appendChild(e); setTimeout(() => e.remove(), 950);
    },
    // En kort rad som försvinner av sig själv (bara för sådant som inte behöver läsas noga).
    // gaTill: vad ett tryck på raden gör (Johannes 2026-11-28: "om man trycker på den så kommer man dit den pekar")
    text(t, sek, stor, gaTill) {
      if (caption) caption.remove(); caption = el('div', 'text' + (stor ? ' stor' : '') + (gaTill ? ' kan' : ''), t + (gaTill ? '<span class="text-ga">Visa <svg viewBox="0 0 14 14"><path d="M3 2l8 5-8 5z"/></svg></span>' : '')); $('text').appendChild(caption); capT = performance.now() + (sek || 7) * 1000;
      if (gaTill) { const c = caption; c.addEventListener('pointerdown', ev => { ev.stopPropagation(); V.Ljud && V.Ljud.vakna(); gaTill(); c.remove(); if (caption === c) caption = null; }); }
    },
    // Vart en rad om något nytt pekar: staden där huset ska byggas, eller kortet och fliken där saken finns
    gaTill(id) {
      const lys = sel => { const m = document.querySelector(sel); if (!m) return; m.classList.add('glod-ny'); m.scrollIntoView && m.scrollIntoView({ block: 'nearest', inline: 'nearest' }); setTimeout(() => m.classList.remove('glod-ny'), 3500); };
      const flik = (fl, sel) => () => { const f = $('res-' + fl); if (f && !(f.classList.contains('vald') || f.classList.contains('aktiv'))) f.click(); setTimeout(() => lys(sel), 120); };
      const stad = p => () => { if (!p) return; if (G.s.bas[p]) UI.visaStad(p); if (UI.onVisaBas) UI.onVisaBas(p); };
      if (!id) return null;
      const b = D.BYGGNADER.find(q => q.id === id); if (b) return stad(b.stad || b.plats);
      if (id === 'skatt') return flik('man', '#skatt');
      if (id === 'marknad') return G.s.marknad ? stad(G.s.marknad.bas) : null;
      if (id.slice(0, 2) === 'h:') return () => lys('#hk-' + id.slice(2));
      if (id.slice(0, 2) === 'k:') return () => UI.kung();          // förmågorna finns på kungens sida
      return null;
    },          // riktig tid: på en skärm med 120 bilder i sekunden försvann raden annars dubbelt så fort
    skylt(t, iSlag) { if (!iSlag && root.classList.contains('slag')) return; const e = el('div', 'skylt', t); $('text').appendChild(e); setTimeout(() => e.classList.add('bort'), 2600); setTimeout(() => e.remove(), 3400); },

    // ---- berättelsen: en ruta ovanför konsolen som står kvar tills man trycker bort den -------------
    berattar(plats, ar, text, med, mer) {
      const b = $('berattar'), M = V.MED || {};
      b.innerHTML = '<i class="ber-hk a"></i><i class="ber-hk b"></i><i class="ber-hk c"></i><i class="ber-hk d"></i>' +
        '<div class="ber-band"><span>' + plats + (ar ? '<em>' + ar + '</em>' : '') + '</span></div>' +
        '<div class="ber-perg"><p class="ber-txt">' + text + '</p>' +
        (med.length ? '<div class="ber-lin">✦</div><div class="ber-med' + (med.length > 3 ? ' manga' : '') + '">' + med.map(m => '<div class="ber-mk' + (m.ny ? ' ny' : '') + '"><div class="ber-rund">' + (M[m.ik] || M.krona || '') + '</div><div class="ber-stor' + (String(m.stor).length > 11 ? ' lang' : '') + '">' + m.stor + '</div><div class="ber-liten">' + m.liten + '</div></div>').join('') + '</div>' : '') +
        '<div class="ber-fot">' + (mer ? '<a href="#" class="ber-mer">' + IK.bok + 'Läs mer</a>' : '<span></span>') + '<button>Fortsätt <svg viewBox="0 0 14 14"><path d="M3 2l8 5-8 5z"/></svg></button></div></div>';
      b.style.display = ''; b.classList.remove('in'); void b.offsetWidth; b.classList.add('in'); if (caption) { caption.remove(); caption = null; }
      if (mer) b.querySelector('.ber-mer').addEventListener('click', ev => { ev.preventDefault(); mer(); });
      b.querySelector('button').addEventListener('click', () => { b.style.display = 'none'; const f = UI.efter; UI.efter = null; if (f) f(); });
    },
    dolj() { $('berattar').style.display = 'none'; },
    berattarUppe() { return $('berattar').style.display !== 'none' || !!(V.Intro && V.Intro.aktiv); },
    textBort() { if (caption) { caption.remove(); caption = null; } },          // raden mitt på skärmen (valets fråga) ska inte ligga kvar över en scen
    // Tiden står still medan rutan i början läses.
    pausar() { return !!UI._paus && $('ruta').style.display !== 'none'; },
    // Vad en handling gör, med några få ord (till pekbubblan när den dyker upp).
    handlKort(h) {
      if (h.direkt) return 'en tredjedel av armén på en gång';
      const r = Object.keys(h.ger || {})[0], n = (h.ger || {})[r];
      return (n === 2 ? 'dubbelt' : n === 3 ? 'tre gånger' : '×' + n) + ' ' + (r === 'man' ? 'män' : 'mark') + ' i ' + h.tid + ' s';
    },
    // Ett uppdrag är klart. Rutan säger vad som hände med en eller två rader, och visar det du fick som bilder.
    // Det som är nytt att trycka på förklaras inte här: det glöder sedan i konsolen med en liten pekbubbla (S.nytt, se _tips).
    // Johannes 2026-11-27: "mycket text att läsa ... kan vi jobba mer i bilder och enkelhet?"
    klart(u) {
      const S = G.s, g = u.ger || {}, med = [], ny = [], fick = S.fick || {};
      const scen = !!S.sistaScen && (S.sistaScen === u.scen || S.sistaScen === u.valScen), sagt = scen && u.sagt || [];          // det scenen just visade sägs inte en gång till
      let text = scen && u.efter ? u.efter : u.kronika;
      if (u.vet && sagt.indexOf('vet') < 0) text += ' ' + u.vet; if (u.vet2 && sagt.indexOf('vet2') < 0) text += ' ' + u.vet2;
      if (V.KORT && V.KORT[u.id]) text = V.KORT[u.id];          // den korta raden; hela texten finns i Krönikan
      const m = (ik, stor, liten, nytt) => med.push({ ik, stor, liten, ny: !!nytt });
      (g.bas || []).forEach(id => { const b = G.BAS[id]; m(b.borg && b.slag === 'bygd' ? 'slott' : b.slag, b.kort || b.namn, 'ger ' + ger(id), 1); });
      if (g.hjalte) m('kvinna', 'Kristina', 'du spelar nu', 1);
      if (S.hem && S.hem.id === u.id) m('man', tal(S.hem.hem) + '<small> / ' + tal(S.hem.av) + '</small>', 'kom hem');
      if (fick.mark >= 1) m('mark', '+' + tal(fick.mark), 'mark');
      if (fick.man >= 1) m('man', '+' + tal(fick.man), 'män');
      if (g.x) for (const r in g.x) m('upp', '×' + String(g.x[r]).replace('.', ','), 'allt som ger ' + (r === 'man' ? 'män' : 'mark'));
      if (g.fart) m('fart', 'Fortare', 'armén rör sig');
      if (g.titel === 'Kung') m('krona', 'Kung', 'av Sverige', 1);
      if (u.lan) m('skuld', 'Skuld', 'till Lübeck', 1);
      if (g.las && g.las.indexOf('privilegier') >= 0) m('kogg', '½', 'mark från städerna');
      if (g.slutar === 'privilegier') m('stad', 'Full', 'mark från städerna igen');
      if (g.las && g.las.indexOf('arv') >= 0) m('kista', 'Arv', 'till nästa regent', 1);
      if (g.startar === 'dagtingan') m('uppror', 'Uppsala', 'ger ingenting nu');
      else if (g.startar && D.UPPROR[g.startar].baser.length) { const st = D.UPPROR[g.startar].baser.filter(id => S.bas[id]); m('uppror', st.length === 1 ? G.BAS[st[0]].namn : st.length + ' platser', 'ger ingenting nu'); }
      if (g.slutar && g.slutar !== 'privilegier') m('frid', 'Lugnt', 'allt ger igen');
      // nytt att trycka på: en pekbubbla i taget efter rutan
      if (g.las && g.las.indexOf('mark') >= 0) ny.push('mark');
      if (u.id === 'sAbo') ny.push('man');
      if ((g.bas || []).some(id => G.BAS[id].slag === 'gruva')) ny.push('arb');
      if (S.varld === 0) D.KONSTER.filter(k => k.steg0 === u.id).forEach(k => ny.push('k:' + k.id));
      if (g.las && g.las.indexOf('konster') >= 0 && S.varld !== 0) ny.push('konster');
      if (g.las && g.las.indexOf('sold') >= 0) ny.push('sold');
      if (g.las && g.las.indexOf('fogdar') >= 0) ny.push('fogde');
      if (u.lan) ny.push('skuld');
      const hn = G.handlingar(); if (!S.handlSedda) { S.handlSedda = {}; if (S.handlSagt) hn.forEach(h => { S.handlSedda[h.id] = 1; }); }          // äldre sparfiler räknade bara antalet
      hn.filter(h => !S.handlSedda[h.id]).forEach(h => { S.handlSedda[h.id] = 1; ny.push('h:' + h.id); });
      S.nytt = (S.nytt || []).concat(ny);
      const plats = UI.platsnamn(u.plats);
      UI.berattar(plats, u.ar, text, med.slice(0, 4), (V.DJUP && V.DJUP[u.id]) ? () => UI.djupInfo(u) : (u.mer ? () => UI.merInfo(u) : null));
      // när rutan trycks bort stiger det man fick upp ur platsen på kartan
      const fore = UI.efter; UI.efter = () => {
        if (fore) fore(); const w = V.Varld && V.Varld.pos && (V.Varld.pos(u.plats) || ((g.bas || [])[0] && V.Varld.pos(g.bas[0])));
        if (w) { let d = 0; if (fick.mark >= 1) { const t = '+' + tal(fick.mark) + IK.mark; setTimeout(() => UI.flyt(w.x, w.y + 2.6, w.z, t, 'mark stor'), d); d += 500; } if (fick.man >= 1) { const t = '+' + tal(fick.man) + IK.man; setTimeout(() => UI.flyt(w.x, w.y + 2.6, w.z, t, 'man stor'), d); } }
      };
    },
    // Rutan i början: vem du är, hur läget ser ut och vad du ska göra. Går att ta fram igen med frågetecknet.
    forklara(varld, igen) {
      // Kort: vem du är, målet, och tre bilder för hur man spelar. Resten visar pekbubblorna i spelet (Johannes 2026-11-27).
      const M = V.MED || {}, knapp = varld >= 2 ? 'Rid' : 'Bud';
      const hur = [['<span class="knapp">' + knapp + '</span>', 'Tryck', 'den runda knappen'], [M[varld === 1 ? 'man' : 'mark'], varld === 1 ? 'Män' : 'Mark', varld === 1 ? 'samla folk' : 'rikets pengar'], [M[varld === 1 ? 'bygd' : 'stad'], 'Bygg ut', KLICKA + ' på en ' + (varld === 1 ? 'by' : 'stad')], [M.krona, 'Nästa steg', 'när du har råd']];
      const text = varld >= 2
        ? D.VARLDAR[varld].startText
        : varld === 0
        ? '<h2>Sverige 1512</h2><p>Du är <b>Sten Sture</b>, nitton år. Din far styrde riket i kungens ställe, och nu är han död. Rådet vill ge hans plats åt en vän till Danmark.</p><p class="mal">Bygg upp dina städer, vinn folket och håll riket.</p>'
        : '<h2>Dalarna 1521</h2><p>Du är <b>Gustav Eriksson</b>, 24 år. Kristian II av Danmark lät halshugga din far i Stockholm. Nu har dalkarlarna valt dig till ledare.</p><p class="mal">Samla folk, ta Kopparberget och driv ut danskarna.</p>';
      UI.ruta(text + '<div class="ber-lin">✦</div><div class="ber-med start">' + hur.map(h => '<div class="ber-mk"><div class="ber-rund">' + h[0] + '</div><div class="ber-stor">' + h[1] + '</div><div class="ber-liten">' + h[2] + '</div></div>').join('') + '</div><button class="stang" id="forklara-knapp">' + (igen ? 'Stäng' : 'Börja') + '</button>', !igen);
      UI._paus = !igen; if (!igen && V.Musik) V.Musik.spar('titel');
    },

    // ---- första stegen: en pekande ruta i taget, som står kvar tills steget är gjort ------------------
    _tips() {
      const S = G.s, T = S.tips, e = $('tips'), spel = root.classList.contains('spel') && $('ruta').style.display === 'none' && $('berattar').style.display === 'none' && !root.classList.contains('slag');          // ingen ruta som pekar medan berättelsen står uppe (Johannes 2026-11-26: "Rutan ligger ovanpå här och stör")
      if (!spel) { e.innerHTML = ''; tips.nu = null; return; }
      const forst = (D.VARLDAR[S.varld] || D.VARLDAR[1]).hem, synlig = sel => { const m = document.querySelector(sel); return !!(m && m.offsetParent); };
      const steg = [
        ['ak', '#ak', 'Tryck här. Varje tryck ger mark och fyller ringen runt knappen.' + (V.pek ? '' : ' Mellanslag går också, ett tryck i taget.'), S.tryck < 5, S.tryck >= 5],
        ['full', '#ak', 'Fortsätt trycka. När ringen är full ger allt dubbelt en stund.', S.tryck >= 5 && !S.full && S.nasta < 2, S.full],
        ['kop', '#baser .bas:not(.skatt)', 'Bygg ut ' + G.BAS[forst].namn + ' här, eller ' + KLICKA + ' på den på kartan.', G.kanKopa(forst) && S.bas[forst] === 1, S.bas[forst] > 1],
        ['upp', '#uppdrag', 'Nästa steg i historien. Tryck på knappen när du har råd.', S.nasta === 0 && G.kanSkicka(), S.nasta > 0 || !!S.aktivt],
        ['driv', '#ak', 'Striden har börjat. Tryck så anfaller dina män.', !!G.skede(), !!(S.aktivt && S.aktivt.slag >= 3)],
        ['dags', '#baser .sida:not(.dold) .bas.dags', 'Ett stort bygge. Det kostar mark, och dina män gör dagsverken på det.', !!document.querySelector('#baser .sida:not(.dold) .bas.dags'), S.dagsN > 0],
        ['byggFlik', '#flik-stad', 'Under Stockholm kan du bygga ett hus för knektar. Sedan blir mark till män.', G.kanBygga('knektar') && !synlig('#bygg-knektar'), !!(S.bygg && S.bygg.knektar) || synlig('#bygg-knektar')],
        ['bygg', '#bygg-knektar', 'Bygg huset här. Det kostar mark.', G.kanBygga('knektar'), !!(S.bygg && S.bygg.knektar)],
        ['knekt', '#sold', 'Ta en knekt i tjänst här. Mark blir män.', S.varld === 0 && G.kanSold() && !S.sold, S.sold > 0],
        ['stad', '#flik-stad', 'Varje stad har en egen flik med sina hus. Tryck på en stad på kartan, så öppnas den.', G.husLista().length > 0 && !S.stadSett, !!S.stadSett],
        ['stadByt', '#flik-stad', 'Tryck på fliken igen för att byta stad.', flik === 'stad' && Object.keys(S.bas).length > 1 && !S.stadMenyN, !!S.stadMenyN],
        ['skattFlik', '#res-man', 'Här under finns kortet Driv in skatt. Med det blir män till mark.', G.kanSkatt() && !S.skattN && !synlig('#skatt'), S.skattN > 0 || synlig('#skatt')],
        ['skatt', '#skatt', 'Skicka ut män här. De kommer hem med mark.', G.kanSkatt() && !S.skattN, !!S.skatt || S.skattN > 0],
        ['tak', '#res-man', 'Armén är full. Driv in skatt (det gröna kortet) så blir männen till mark.', S.res.man >= G.tak() * 0.999 && S.nasta >= 2 && !S.aktivt, S.res.man < G.tak() * 0.9]
      ];
      // Nytt sedan förra rutan (S.nytt): en glödande pekbubbla i taget. Den går bort när man trycker på saken, eller efter en stund.
      const nyttSteg = UI._nyttSteg(); if (nyttSteg) steg.unshift(nyttSteg);
      if (tips.nu) { const s = steg.find(q => q[0] === tips.nu); if (!s || s[4]) { T[tips.nu] = 1; tips.nu = null; e.innerHTML = ''; } else if (!s[3] || !synlig(s[1])) { tips.nu = null; e.innerHTML = ''; } }
      if (tips.nu === 'stadByt' && performance.now() - tips.t0 > 6000) { tips.nu = null; e.innerHTML = ''; }          // flik-tipset visas en gång, en kort stund (Johannes 2026-11-28: "nu blir man bara irriterad")
      if (!tips.nu) { const s = steg.find(q => !T[q[0]] && q[3] && synlig(q[1])); if (s) { tips.nu = s[0]; tips.t0 = performance.now(); if (s[0] === 'stadByt') T.stadByt = 1; e.innerHTML = '<div class="tip' + (s[5] ? ' nytt' : '') + '">' + (s[5] ? '<span class="tip-ny">Nytt</span>' : '') + s[2] + '</div>'; } }
      if (tips.nu && tips.nu === (nyttSteg && nyttSteg[0])) { const m0 = document.querySelector(nyttSteg[1]); document.querySelectorAll('.glod-ny').forEach(x => { if (x !== m0) x.classList.remove('glod-ny'); }); if (m0) m0.classList.add('glod-ny'); } else document.querySelectorAll('.glod-ny').forEach(x => x.classList.remove('glod-ny'));
      if (tips.nu) {            // håll rutan ovanför det den pekar på
        const s = steg.find(q => q[0] === tips.nu), mal = document.querySelector(s[1]), t = e.firstChild; tips.malSel = s[1]; if (!mal || !t) return;
        // ett tryck på det bubblan pekar på tar bort den direkt (Johannes 2026-11-28: "rutorna ska försvinna när man trycker på knappen den visar till direkt")
        if (!tips.allm) { tips.allm = ev => { const k = tips.nu; if (!k || !tips.malSel) return; const m = document.querySelector(tips.malSel); if ((!m || !m.contains(ev.target)) && k.slice(0, 5) !== 'nytt:') return; if (k.slice(0, 5) === 'nytt:') { if (G.s.nytt) G.s.nytt.shift(); } else G.s.tips[k] = 1; tips.nu = null; tips.malSel = null; $('tips').innerHTML = ''; document.querySelectorAll('.glod-ny').forEach(x => x.classList.remove('glod-ny')); }; document.addEventListener('pointerdown', tips.allm, true); } t.style.visibility = mal.offsetParent ? '' : 'hidden';
        const r = mal.getBoundingClientRect(), w = t.offsetWidth, h = t.offsetHeight, pan = mal.closest('#baser'), pr = pan && pan.getBoundingClientRect();
        if (pr && pr.left - w - 16 >= 8) {          // pekar den på något i panelen står rutan bredvid panelen, inte över korten (Johannes 2026-11-28)
          t.classList.add('vid'); t.style.left = (pr.left - w - 14) + 'px'; t.style.top = Math.max(8, Math.min(innerHeight - h - 8, r.top + r.height / 2 - h / 2)) + 'px';
          t.style.setProperty('--pilY', Math.max(10, Math.min(h - 10, r.top + r.height / 2 - parseFloat(t.style.top))) + 'px');
        } else {
          t.classList.remove('vid'); t.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px'; t.style.top = (r.top - h - (mal.closest('.sida') ? 50 : 14)) + 'px';
          t.style.setProperty('--pil', Math.max(14, Math.min(w - 14, r.left + r.width / 2 - parseFloat(t.style.left))) + 'px');
        }
      }
    },

    // Det nya som står först i kön, som ett steg för _tips: [nyckel, väljare, text, visas, klart, nytt].
    // Ligger kortet under en annan flik pekar bubblan på fliken tills man öppnar den.
    _nyttSteg() {
      const S = G.s, k = (S.nytt || [])[0]; if (!k) return null;
      const synlig = sel => { const m = document.querySelector(sel); return !!(m && m.offsetParent); };
      let sel, alt, txt;
      if (k.slice(0, 2) === 'h:') { const h = D.HANDLINGAR.find(q => q.id === k.slice(2)); if (!h) { S.nytt.shift(); return null; } sel = '#hk-' + h.id; txt = '<b>' + UI.handlNamn(h) + '</b> ' + UI.handlKort(h); }
      else if (k.slice(0, 2) === 'k:') { const kd = D.KONSTER.find(q => q.id === k.slice(2)); if (!kd) { S.nytt.shift(); return null; } sel = '#datum'; alt = $('res-' + (kd.flik0 || 'mark')) ? '#res-' + (kd.flik0 || 'mark') : '#res-man'; txt = '<b>' + UI.konst(kd.id)[0] + '</b> ' + konstInfo(kd.id).kort; }
      else ({ mark: () => { sel = $('res-mark') ? '#res-mark' : '#kassa .ks-mark'; txt = '<b>Mark</b> är rikets pengar'; },
        man: () => { sel = '#res-man'; txt = '<b>Män</b> är din armé'; },
        arb: () => { sel = '.bas.arb'; alt = $('res-mark') ? '#res-mark' : '#res-man'; txt = '<b>Gruvarbetare</b> män gör gruvan rikare'; },
        konster: () => { sel = '#baser .bas.konst'; alt = '#res-man'; txt = '<b>Förmågor</b> gör dig starkare'; },
        sold: () => { sel = '#sold'; alt = '#res-man'; txt = '<b>Värva soldater</b> mark blir män'; },
        fogde: () => { sel = '.bas.fogdekort'; alt = $('res-mark') ? '#res-mark' : '#res-man'; txt = '<b>Fogdar</b> bygger ut åt dig'; },
        skuld: () => { sel = '#res-skuld'; alt = $('res-mark') ? '#res-mark' : '#res-man'; txt = '<b>Skuld</b> till Lübeck'; }
      }[k] || (() => {}))();
      if (!sel) { S.nytt.shift(); return null; }
      const har = synlig(sel), mal = har ? sel : alt && synlig(alt) ? alt : sel;
      if (!har && !(alt && synlig(alt))) { const nu = performance.now(); if (tips.osyn !== k) { tips.osyn = k; tips.osynT = nu; } else if (nu - tips.osynT > 8000) { S.nytt.shift(); tips.osyn = null; } return null; }          // syns inte alls: släpp den efter en stund, så att kön inte fastnar
      tips.osyn = null;
      const klar = () => { S.nytt.shift(); tips.nu = null; $('tips').innerHTML = ''; document.querySelectorAll('.glod-ny').forEach(x => x.classList.remove('glod-ny')); if (tips.klick) document.removeEventListener('pointerdown', tips.klick, true); tips.klick = null; };
      if (tips.nu && tips.nu.indexOf('nytt:' + k) === 0 && performance.now() - tips.t0 > 6000) { klar(); return null; }          // har stått en stund: nog sett, och rutan tas bort (Johannes 2026-11-28: "nyhet texten försvinner inte")
      return ['nytt:' + k + (mal === sel ? '' : ':alt'), mal, txt, true, false, true];
    },

    // ---- rutor --------------------------------------------------------------------------------
    // Kassan står nere till höger, i raden med flikarna över korten (Johannes 2026-11-28: "lägga den här"). Får den inte plats bredvid flikarna står den ovanför dem.
    // Kassans siffror rullar mjukt mot det man har (Johannes 2026-11-28: "det ska bli tydligare"), och det som kommer in syns som lugna +siffror.
    _rulla(sel, mal) {
      const e = document.querySelector(sel); if (!e) return; e._mal = mal; if (e._visa === undefined || Math.abs(mal - e._visa) > Math.max(mal, e._visa) * 0.5) e._visa = mal;
      if (UI._rullar) return; UI._rullar = true; let sist = performance.now();
      const steg = nu => { const dt = Math.min(0.1, (nu - sist) / 1000); sist = nu; let kvar = false;
        document.querySelectorAll('.ks > b').forEach(b => { if (b._mal === undefined) return; const d = b._mal - b._visa; if (Math.abs(d) < 0.5) b._visa = b._mal; else { b._visa += d * Math.min(1, dt * 6); kvar = true; } const t = tal(Math.floor(b._visa)); if (b._t !== t) { b._t = t; b.textContent = t; } });
        if (kvar) requestAnimationFrame(steg); else UI._rullar = false; };
      requestAnimationFrame(steg);
    },
    _strom(res, takt, pa) { if (G.s.lev) return;          // platserna levererar i klumpar som flyger från korten, så inga påhittade +siffror (2026-11-28)
      const k = document.querySelector('.ks-' + res); if (!k || !pa || !(takt > 0) || V.tyst) return; const nu = performance.now(); if (nu - (k._strom || 0) < 1600) return; k._strom = nu;
      const e = document.createElement('span'); e.className = 'ks-plus'; e.textContent = '+' + tal(takt * 1.6); k.appendChild(e); setTimeout(() => e.remove(), 1500);
    },
    _kassaPlats() {
      const k = $('kassa'), bx = $('baser'), fl = $('flikar'); if (!k || !bx || !fl || !bx.offsetParent) return;
      if (innerWidth < 720) { if (k._plats) { k._plats = ''; k.style.right = k.style.bottom = ''; } return; }          // telefon: kassan står uppe under datumet, där finns plats
      { const ko = $('konsol'), f0 = ko.firstElementChild, off = bx.offsetLeft - (f0 ? f0.offsetLeft : 0), pad = bx._maxW ? Math.max(0, Math.round((ko.clientWidth - off - bx._maxW) / 2)) : 0;          // vänsterkanten står still: konsolen läggs ut som om den bredaste fliken var vald
        if (ko._pad !== pad) { ko._pad = pad; ko.style.justifyContent = pad ? 'flex-start' : ''; ko.style.paddingLeft = pad ? pad + 'px' : ''; } }
      const br0 = bx.getBoundingClientRect(), br = { right: bx._maxW ? br0.left + bx._maxW : br0.right }, fr = fl.getBoundingClientRect(), kw = k.offsetWidth; let sista = 0; for (const c of fl.children) sista = Math.max(sista, c.getBoundingClientRect().right);
      { const kb = bx.querySelector('.sida:not(.dold) .bas'), kh = kb ? kb.offsetHeight : 0; if (kh > 20 && bx._kh !== kh) { bx._kh = kh; bx.style.setProperty('--korth', kh + 'px'); } }          // alla flikar lika höga: raderna är minst ett korts höjd
      const bredvid = br.right - sista - 10 >= kw, hoger = Math.max(6, innerWidth - br.right), kt = Math.min(fr.top, $('konsol').getBoundingClientRect().top), botten = bredvid ? innerHeight - fr.bottom : innerHeight - kt + 6;
      const nyck = hoger + '|' + botten; if (k._plats !== nyck) { k._plats = nyck; k.style.right = hoger + 'px'; k.style.bottom = botten + 'px'; }
    },
    // Kungens sida (Johannes 2026-11-28): vem han är, och dyra egenskaper som gör en sak mer givande. Öppnas med ett tryck på kungen eller på rutan uppe till vänster.
    kung() {
      const S = G.s, ki = D.KUNGINFO && D.KUNGINFO[S.varld], eg = G.egLista(); if (!ki && !eg.length) return false;
      const ar = G.datum().ar, alder = ki ? ar - ki.fodd - (ki.sent ? 1 : 0) : 0;
      let h = '<div class="kung-topp"><div class="kung-fig"><canvas width="260" height="330"></canvas><i class="kung-vrid">dra för att vrida</i></div><div class="kung-om"><div class="kung-krona">' + IK.krona + '</div><h2>' + $('dat-titel').textContent + '</h2>' + (ki ? '<p class="kung-ar">' + ar + ' · ' + alder + ' år</p><ul>' + ki.rader.map(r => '<li>' + r + '</li>').join('') + '</ul>' : '') + '</div></div>';
      if (eg.length) h += '<div class="kung-eg-rubrik">Egenskaper</div><div class="kung-eg">' + eg.map(e => '<div class="bas eg-kort" data-eg="' + e.id + '"><div class="k-topp"><i class="k-ikon">' + (IK[e.ikon] || IK.krona) + '</i><span class="k-namn">' + e.namn + '</span><b class="k-niva"></b></div><p class="eg-vad">' + e.vad + '</p><div class="k-rad"><span class="k-ger"></span><span class="k-pris"></span></div><i class="bas-bar"><i></i></i></div>').join('') + '</div>';
      { const ko = D.KONSTER.filter(k => G.harKonst(k.id)); if (ko.length) h += '<div class="kung-eg-rubrik">Förmågor</div><div class="kung-eg">' + ko.map(k => '<div class="bas eg-kort konst-kort" data-k="' + k.id + '"><div class="k-topp"><i class="k-ikon">' + IK.krona + '</i><span class="k-namn">' + UI.konst(k.id)[0] + '</span><b class="k-niva"></b></div><p class="eg-vad">' + UI.konst(k.id)[1] + '</p><div class="k-rad"><span class="k-ger"></span><span class="k-pris"></span></div><i class="bas-bar"><i></i></i></div>').join('') + '</div>'; }          // förmågorna: små uppgraderingar som förut låg bland korten
      h += '<button class="stang kung-stang">Tillbaka</button>';
      const r = UI.ruta(h); r.firstChild.classList.add('kung-in');
      r.querySelectorAll('.konst-kort').forEach(k => k.addEventListener('click', () => { if (G.kopKonst(k.dataset.k)) { V.Ljud && V.Ljud.spela('kop'); UI._kungKort(); UI.tick(); } else UI._nej(k); }));
      r.querySelectorAll('.eg-kort:not(.konst-kort)').forEach(k => k.addEventListener('click', () => { if (G.kopEg(k.dataset.eg)) { V.Ljud && V.Ljud.spela('dubbel'); UI._kungKort(); UI.tick(); } else UI._nej(k); }));
      UI._kungOppen = true; UI._kungKort(); UI._kungFig(r.querySelector('.kung-fig canvas')); return true;
    },
    // egenskapernas kort: samma utseende som spelets andra kort (nivå, vad nästa nivå ger, pris), stapeln visar hur långt mot tio nivåer
    _kungKort() {
      document.querySelectorAll('#ruta .konst-kort').forEach(k => { const id = k.dataset.k, L = G.s.konst[id], max = L >= G.KONST_MAX; k.classList.toggle('ej', !G.kanKonst(id)); k.querySelector('.k-niva').textContent = String(L);
        const v = max ? 'kan inte bli bättre' : konstInfo(id).kort; if (k._v !== v) { k._v = v; k.querySelector('.k-ger').textContent = v; } const p = max ? '' : IK.mark + tal(G.konstPris(id)); if (k._p !== p) { k._p = p; const pe = k.querySelector('.k-pris'); pe.innerHTML = p; pe.style.display = p ? '' : 'none'; } k.querySelector('.bas-bar i').style.width = (L % 10) * 10 + '%'; });
      document.querySelectorAll('#ruta .eg-kort:not(.konst-kort)').forEach(k => { const e = G.egLista().find(q => q.id === k.dataset.eg); if (!e) return; const L = G.eg(e.id), max = L >= G.EG_MAX, ok = G.kanEg(e.id);
        k.classList.toggle('ej', !ok); k.querySelector('.k-niva').textContent = L + ' / ' + G.EG_MAX;
        const vad = { man: 'Män', flotta: 'Tull per skepp', skatt: 'Skatt', mark: 'Mark', gruva: 'Gruvorna' }[e.ger] || e.namn, v = max ? 'full' : '<b class="k-ps">' + vad + ' +' + Math.round(e.steg * 100) + ' %</b>' + (L ? ' <small class="k-mer">nu +' + Math.round(e.steg * L * 100) + ' %</small>' : ''); if (k._v !== v) { k._v = v; k.querySelector('.k-ger').innerHTML = v; }
        const p = max ? '' : IK.mark + tal(G.egPris(e.id)); if (k._p !== p) { k._p = p; const pe = k.querySelector('.k-pris'); pe.innerHTML = p; pe.style.display = p ? '' : 'none'; }
        k.querySelector('.bas-bar i').style.width = (L / G.EG_MAX * 100) + '%'; });
    },
    // 3D-gubben ur spelet i en egen liten ruta. Han står till fots och vrider sig sakta; man kan dra för att vrida honom.
    _kungFig(cv) {
      if (!cv || !V.hjalteModell || !window.THREE) return; UI._kungStopp && UI._kungStopp();
      let ren; try { ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
      ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); ren.setSize(cv.clientWidth || 260, cv.clientHeight || 330, false);
      const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, (cv.clientWidth || 260) / (cv.clientHeight || 330), 0.1, 50);
      sc.add(new THREE.HemisphereLight(0xfff4dc, 0x5a4634, 1.0)); const sol = new THREE.DirectionalLight(0xfff0d0, 0.9); sol.position.set(1.5, 2.5, 2.5); sc.add(sol);
      const Gu = V.Gustav, g = V.hjalteModell(Gu.sort || G.s.hjalte, Gu.rang || 0), d = g.userData; sc.add(g);
      if (d.hast) d.hast.visible = false; if (d.ring) d.ring.visible = false; ['skV', 'skH', 'stavV', 'stavH', 'svH'].forEach(k => { if (d[k]) d[k].visible = false; });
      g.traverse(o => { if (o.layers) o.layers.enableAll(); });
      const box = new THREE.Box3().setFromObject(g), mitt = box.getCenter(new THREE.Vector3()), hojd = box.max.y - box.min.y || 1;
      cam.position.set(0, mitt.y + hojd * 0.08, hojd * 2.25); cam.lookAt(0, mitt.y, 0);
      let vrid = 0.5, drag = null, fri = 0, t0 = performance.now(), lever = true;
      cv.addEventListener('pointerdown', e => { drag = e.clientX; fri = performance.now(); cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', e => { if (drag === null) return; vrid += (e.clientX - drag) * 0.012; drag = e.clientX; fri = performance.now(); });
      cv.addEventListener('pointerup', () => { drag = null; });
      const ruta = () => { if (!lever) return; if (!document.body.contains(cv) || $('ruta').style.display === 'none') { UI._kungStopp(); return; }
        const t = (performance.now() - t0) / 1000; if (drag === null && performance.now() - fri > 1500) vrid += 0.006;
        g.rotation.y = vrid; d.kropp.position.set(0, 0.02 + Math.sin(t * 1.6) * 0.006, 0); d.kropp.rotation.set(0, 0, 0);
        d.benV.rotation.set(0, 0, 0); d.benH.rotation.set(0, 0, 0); d.armV.rotation.set(0.05, 0, 0.1); d.armH.rotation.set(-0.25 + Math.sin(t * 1.6) * 0.03, 0, -0.1);
        ren.render(sc, cam); requestAnimationFrame(ruta); };
      UI._kungStopp = () => { if (!lever) return; lever = false; UI._kungStopp = null; try { ren.dispose(); ren.forceContextLoss(); } catch (e) { /* redan borta */ } };
      requestAnimationFrame(ruta);
    },
    ruta(html, last) { const r = $('ruta'); r.innerHTML = '<div class="ruta-in">' + html + '</div>'; r.style.display = ''; UI._last = !!last; const x = r.querySelector('.stang'); if (x) x.addEventListener('click', UI.stang); return r; },
    stang() { if (UI._paus && V.Musik) V.Musik.spar(V.Musik.grund()); $('ruta').style.display = 'none'; UI._last = false; UI._paus = false; },
    kronika() {
      const S = G.s; let h = '<h2>Krönikan</h2><div class="krono">', akt = -1; const alla = G.alla();
      for (const k of S.kronika) { const u = alla.find(q => q.id === k.id); if (!u) continue; if (u.akt !== akt) { akt = u.akt; h += '<h3>' + D.AKTER[akt] + '</h3>'; } h += '<p>' + u.kronika + '</p>'; }
      if (!S.kronika.length && S.varld === 0) h += '<p class="svag">Sten Sture är nitton år. Hans far riksföreståndaren har just dött, och rådet vill ha en annan man i hans ställe.</p>';
      else if (!S.kronika.length) h += '<p class="svag">Det är nyår 1521. Vid jul talade Gustav Eriksson till männen i Mora, men de sade nej, och han for mot Norge. Nu har två skidlöpare hunnit upp honom i Sälen: Mora har ändrat sig.</p>';
      UI.ruta(h + '</div><button class="stang">Stäng</button>');
    },
    // Regentlängden: en rak tidslinje uppifrån och ner, grupperad efter kungahus (Johannes 2026-11-28: "en lista, en följd, tydligt och pedagogiskt").
    regenter() {
      const S = G.s, T = V.TESTLAGE, nu = S.varld;
      const HUS = [[0, 'Sturarna', 'riksföreståndare, som styr i kungens ställe'], [1, 'Vasaätten', ''], [8, 'Pfalziska huset', ''], [12, 'Hessiska huset', ''], [13, 'Holstein-Gottorpska huset', ''], [17, 'Bernadotte', '']];
      const rad = [['Sten Sture den yngre', 1512, 1520]].concat(D.REGENTER);
      let h = '<h2>Regentlängden</h2><p class="svag reg-in">Sveriges regenter, en efter en. Varje regent är en egen värld, och det du bygger går i arv till nästa.</p><div class="tidslinje">';
      rad.forEach((r, v) => {
        const hus = HUS.find(q => q[0] === v); if (hus) h += '<div class="tl-hus"><b>' + hus[1] + '</b>' + (hus[2] ? '<span>' + hus[2] + '</span>' : '') + '</div>';
        const byggd = !!D.VARLDAR[v], ar = r[1] + '–' + (r[2] || '');
        const status = v === nu ? (S.slut ? 'klar' : 'du spelar nu') : v === nu + 1 && byggd ? 'nästa värld' : '';          // de som inte är byggda än är bara ljusare
        h += '<div class="tl-rad' + (v === nu ? ' nu' : '') + (byggd ? ' byggd' : '') + '"><span class="tl-ar">' + ar + '</span><i class="tl-prick">' + (v === nu ? IK.krona : '') + '</i><b class="tl-namn">' + r[0] + '</b>' +
          (status ? '<em class="tl-st">' + status + '</em>' : '') + (T && byggd ? '<button class="reg-spela" data-v="' + v + '">Spela</button>' : '') + '</div>';
      });
      UI.ruta(h + '</div>' + (T ? '<p class="svag">Testläge: Spela börjar den världen från början.</p>' : '') + '<button class="stang">Stäng</button>');
      const nuRad = document.querySelector('.tl-rad.nu'); if (nuRad) nuRad.scrollIntoView({ block: 'center' });
      document.querySelectorAll('.reg-spela').forEach(b => b.addEventListener('click', () => { if (confirm('Börja ' + (b.dataset.v === '0' ? 'förspelet' : D.REGENTER[b.dataset.v - 1][0]) + ' från början? Det du har nu försvinner.')) UI.onTestVarld && UI.onTestVarld(+b.dataset.v); }));
    },
    installningar() {
      const musikText = () => 'Musik: ' + (G.s.musik !== false ? 'på' : 'av');
      UI.ruta('<h2>Inställningar</h2><p class="svag">Spelet sparas av sig självt i den här webbläsaren.</p>' + (V.Musik && V.Musik.finns() ? '<button id="musik-knapp">' + musikText() + '</button>' : '') + '<button id="nollstall" class="fara">Börja om från början</button><button class="stang">Stäng</button>');
      if ($('musik-knapp')) $('musik-knapp').addEventListener('click', () => { G.s.musik = G.s.musik === false; V.Musik && V.Musik.satt(G.s.ljud && G.s.musik !== false); $('musik-knapp').textContent = musikText(); });
      $('nollstall').addEventListener('click', () => { if (confirm('Börja om från 1512? Allt du byggt försvinner.')) UI.onBorjaOm && UI.onBorjaOm(); });
    },
    borta(b) {
      const h = Math.floor(b.sek / 3600), m = Math.floor(b.sek % 3600 / 60);
      UI.ruta('<h2>Medan du var borta</h2><p>' + (h ? h + ' tim ' : '') + m + ' min har gått. Baserna har arbetat på.</p><div class="fick">' + (b.fick.man > 0 ? '<span class="chip ok">' + IK.man + '+' + tal(b.fick.man) + ' män</span>' : '') + (b.fick.mark > 0 ? '<span class="chip ok">' + IK.mark + '+' + tal(b.fick.mark) + ' mark</span>' : '') + '</div><button class="stang">Fortsätt</button>');
    },
    slut() {
      const S = G.s, arv = S.arvNu || G.arvVid();
      if (S.varld >= 2) {          // Eriks och de följande regenternas slut: vidare till nästa värld när den finns
        const Vd = D.VARLDAR[S.varld], N = D.VARLDAR[S.varld + 1], vidare = N && D[N.lista] && D[N.lista].length >= 15;
        UI.ruta('<h2>' + Vd.slutRubrik + '</h2><p>' + Vd.slut + '</p><div class="arv">' + IK.krona + '<b>' + arv + '</b><span>arv till nästa regent</span></div>' + (vidare ? '<p class="svag">Arvet följer med till ' + N.kung + ': allt ger en fjärdedel mer för varje arv.</p><button id="vidare">Fortsätt med ' + N.kung + '</button>' : '<p class="svag">Nästa regents värld är inte byggd än. Tills dess kan du spela ' + Vd.kung + ' igen: varje arv ger en fjärdedel mer av allt.</p>') + '<button id="igen">Spela igen med arvet</button><button class="stang">Stanna kvar i riket</button>', true);
        $('igen').addEventListener('click', () => UI.onIgen && UI.onIgen(arv)); if ($('vidare')) $('vidare').addEventListener('click', () => UI.onVidare && UI.onVidare(arv)); return;
      }
      UI.ruta('<h2>Kronan går i arv</h2><p>Den 29 september 1560 dör Gustav på Stockholms slott. Han tog över ett rike utan pengar, och nu lämnar han ett arvrike med full skattkammare efter sig.</p><div class="arv">' + IK.krona + '<b>' + arv + '</b><span>arv till nästa regent</span></div>' + (D.ERIK.length >= 20 ? '<p class="svag">Arvet följer med till Erik XIV: allt ger en fjärdedel mer för varje arv. Städerna som Gustav byggde står kvar.</p><button id="vidare">Fortsätt med Erik XIV</button>' : '<p class="svag">Erik XIV:s värld byggs nu. Tills den är klar kan du spela Gustav Vasa igen: varje arv ger en fjärdedel mer av allt.</p>') + '<button id="igen">Spela igen med arvet</button><button class="stang">Stanna kvar i riket</button>', true);
      $('igen').addEventListener('click', () => UI.onIgen && UI.onIgen(arv));

      if ($('vidare')) $('vidare').addEventListener('click', () => UI.onVidare && UI.onVidare(arv));    },

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
