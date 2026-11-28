// Fakta om orterna (Johannes 2026-11-28: "Man ska kunna klicka på varje ort med namn å så står de historiskt fakta om vad som skedde i den staden vid den tiden").
// Ett tryck på ett ortnamn på kartan visar en kort ruta: vad orten är och vad som händer där det år världen står i. Inget om det som kommer senare.
// Nyckel = namnet så som det står på kartan. Varje rad: [från år, till år, text]. Den rad gäller vars år omfattar året nu; annars den senaste före.
// Egna baser som man äger öppnar sin flik som förut (ui.js) och får ingen ruta här. Källor: docs/ortfakta.md.
(function () {
  'use strict';
  const V = window.VASA;
  // Allt i nutid, som om man står där det året (Johannes 2026-11-28: "allt ska vara immersion, presence, nutid"). Ingen rad nämner ett år efter sitt eget första år.
  const F = {
    'Stockholm': [
      [0, 1519, 'Rikets största stad, tätt byggd på holmen mellan Mälaren och Saltsjön. Slottet vid strömmen är rikets starkaste fäste, och tyska köpmän sätter tonen i rådhuset.'],
      [1520, 1522, 'Danskarna håller staden. Minnet av avrättningarna på Stortorget i november ligger tungt över gränderna.'],
      [1523, 1535, 'Kungen har tagit staden och bor på slottet. Danskarna är borta, och köpmännen från Lübeck vill ha betalt för sin hjälp.'],
      [1536, 1559, 'Kring slottet byggs en ny mur av tegel och en vallgrav. Kungens skrivare och fogdar går ut och in genom porten.'],
      [1560, 1567, 'Kung Eriks hov håller till på slottet, med musiker, konstnärer och lärda män från hela Europa.'],
      [1568, 1587, 'Slottet byggs om efter kung Johans smak, med nya gavlar och torn i renässansens stil.'],
      [1588, 1599, 'Tre förgyllda kronor glänser högst upp på slottets torn.'],
      [1600, 1611, 'Hertig Karl styr riket härifrån. Kung Sigismund är avsatt.']
    ],
    'Uppsala': [
      [0, 1519, 'Ärkebiskopens stad och rikets andliga mitt. Domkyrkan är Nordens största kyrka, och vid universitetet läser präster och lärda.'],
      [1520, 1522, 'Fältet utanför staden bär spåren av långfredagens slag mellan upplänningarna och den danska hären.'],
      [1523, 1548, 'Kyrkans gods har gått till kronan, och ärkebiskopen har förlorat sin makt. Kungen kröntes i domkyrkan 1528.'],
      [1549, 1559, 'På åsen ovanför staden bygger kungen ett slott.'],
      [1560, 1566, 'Kung Erik kröntes här 1561, med en prakt som ingen svensk kung visat förut.'],
      [1567, 1568, 'Staden är tyst efter morden på slottet i maj, då Svante Sture och två av hans söner dödades.'],
      [1569, 1571, 'Kung Johan kröntes i domkyrkan 1569.'],
      [1572, 1592, 'Slottet har brunnit och byggs nu om till ett palats.'],
      [1593, 1599, 'Prästerna har mötts i Uppsala och slagit fast att riket ska vara lutherskt.'],
      [1600, 1611, 'Biskopar och präster väntar på att hertig Karl ska krönas i domkyrkan.']
    ],
    'Kalmar': [
      [0, 1519, 'Kalmar slott kallas rikets nyckel. Det vaktar gränsen mot Danmark och sundet mot Öland. Här slöts unionen mellan de nordiska rikena 1397.'],
      [1520, 1522, 'Handelsstad och fäste vid gränsen. Gustav Eriksson gick i land här när han kom hem från Lübeck.'],
      [1523, 1534, 'Slottet är kungens. Härifrån vaktas gränsen mot Danmark och sjövägen till Öland.'],
      [1535, 1559, 'Murare bygger runda hörntorn för kanoner på slottet.'],
      [1560, 1569, 'Kriget med Danmark pågår, och Kalmar är flottans hamn och ett fäste vid gränsen.'],
      [1570, 1598, 'Slottet byggs om till ett renässanspalats med rika salar.'],
      [1599, 1610, 'Hertig Karls folk har slottet. Flera av Sigismunds anhängare har avrättats här.'],
      [1611, 1611, 'Danmark har förklarat krig. Kalmar belägras.']
    ],
    'Västerås': [
      [0, 1520, 'Biskopsstad vid Svartåns mynning i Mälaren, med domkyrka och slott.'],
      [1521, 1526, 'Biskopsstad vid Mälaren. Gustav Vasa slog danskarna här 1521.'],
      [1527, 1543, 'Biskopsstad vid Mälaren. Vid riksdagen här 1527 tog kungen kyrkans gods och makt.'],
      [1544, 1572, 'Biskopsstad vid Mälaren. Vid riksdagen här 1544 bestämdes att kronan går i arv till kungens söner.'],
      [1573, 1611, 'Biskopsstad vid Mälaren. På slottet har den avsatte kung Erik suttit fången.']
    ],
    'Örebro': [
      [0, 1520, 'Slottet vid Svartån styr Närke och vägen till Bergslagen.'],
      [1521, 1539, 'Slottet vid Svartån styr Närke. Danskarna höll det länge innan det gav upp.'],
      [1540, 1572, 'Slottet vid Svartån styr Närke. Här svor rådet 1540 att kungens söner ska ärva kronan.'],
      [1573, 1611, 'Hertig Karl bygger om slottet till ett vitt renässansslott med fyra längor kring en gård.']
    ],
    'Strängnäs': [
      [0, 1522, 'Biskopsstad vid Mälaren, med en domkyrka i tegel och ett av rikets högsta kyrktorn.'],
      [1523, 1611, 'Biskopsstad vid Mälaren. Här valdes Gustav Vasa till kung den 6 juni 1523.']
    ],
    'Linköping': [
      [0, 1597, 'Östergötlands biskopsstad, med en domkyrka i kalksten som byggts i flera hundra år.'],
      [1598, 1599, 'Östergötlands biskopsstad. Vid Stångebro utanför staden har hertig Karls här slagit Sigismunds.'],
      [1600, 1611, 'Östergötlands biskopsstad. På torget avrättades i mars fem av Sigismunds anhängare.']
    ],
    'Vadstena': [
      [0, 1544, 'Den heliga Birgittas kloster, rikets rikaste och mest kända. Klosterkyrkan kallas Blåkyrkan efter sin kalksten.'],
      [1545, 1594, 'Vid vattnet bygger kungen ett slott. Klostret lever kvar, men får inga nya gåvor.'],
      [1595, 1611, 'Klostret står tomt. Nunnorna har lämnat det.']
    ],
    'Nyköping': [
      [0, 1567, 'Nyköpingshus är en gammal borg vid Nyköpingsåns mynning, Södermanlands starkaste fäste.'],
      [1568, 1611, 'Hertig Karl har sitt hem på Nyköpingshus och bygger om det till ett renässansslott.']
    ],
    'Gripsholm': [
      [1537, 1562, 'Kungen bygger ett slott med fyra runda torn vid Mälaren.'],
      [1563, 1567, 'Hertig Johan och hans hustru Katarina sitter fångna på slottet.'],
      [1568, 1611, 'Slottet vid Mälaren är ett av kungens fästen.']
    ],
    'Stäket': [[0, 1611, 'Ärkebiskopens borg vid Mälarens inlopp. Den som har den kan stänga sjövägen till Uppsala.']],
    'Mora': [
      [0, 1519, 'Socken vid Siljan med en gammal stenkyrka. Bönderna här har vapen och vana att strida.'],
      [1520, 1520, 'Socken vid Siljan. Gustav Eriksson har kommit hit på flykt och talar till dalkarlarna vid kyrkan.'],
      [1521, 1611, 'Socken vid Siljan. Här blev Gustav Eriksson dalkarlarnas hövding vintern 1521.']
    ],
    'Kopparberget': [[0, 1611, 'Rikets koppargruva vid Falun. Kopparen säljs ut i Europa och är en av kronans största inkomster.']],
    'Sala silvergruva': [[0, 1611, 'Silvergruvan i Sala. Silvret blir mynt i kronans kistor.']],
    'Gävle': [[0, 1611, 'Handelsstad vid Gävlebukten, där Norrlands handel går ut över havet.']],
    'Hedemora': [[0, 1611, 'Dalarnas äldsta stad, med marknad för järnet och kopparen.']],
    'Åbo': [
      [0, 1555, 'Finlands största stad och biskopssäte, med domkyrka och slott vid Aura å.'],
      [1556, 1562, 'Hertig Johan håller hov på Åbo slott som hertig av Finland.'],
      [1563, 1611, 'Finlands största stad. Slottet är kungens sedan hertig Johan fördes fången till Sverige.']
    ],
    'Viborg': [[0, 1611, 'Rikets fäste längst i öster, mot Ryssland. Slottet har hållit ut mot ryska belägringar förut.']],
    'Helsingfors': [[1550, 1611, 'En ny stad vid Vandaås mynning, som ska ta handeln från Reval.']],
    'Reval': [
      [0, 1560, 'Hansastad i Estland, styrd av Svärdsorden och stadens köpmän.'],
      [1561, 1611, 'Hansastad i Estland. Staden har svurit trohet åt Sveriges kung.']
    ],
    'Narva': [
      [0, 1580, 'Handelsstad vid floden Narva, där handeln med Ryssland går.'],
      [1581, 1611, 'Handelsstad vid floden Narva. Den är svensk sedan Pontus De la Gardie tog den.']
    ],
    'Älvsborg': [
      [0, 1562, 'Fästningen vid Göta älvs mynning är rikets enda hamn mot Västerhavet.'],
      [1563, 1570, 'Fästningen vid Göta älvs mynning är i danska händer.'],
      [1571, 1611, 'Fästningen vid Göta älvs mynning är svensk igen, köpt tillbaka från Danmark för en mycket stor summa silver.']
    ],
    'Stegeborg': [[0, 1611, 'Borg på en ö vid Slätbaken i Östergötland, som vaktar sjövägen in mot Söderköping.']],
    'Borgholm': [
      [0, 1571, 'En gammal borg på Öland, illa skadad i krigen.'],
      [1572, 1611, 'På Öland byggs den gamla borgen om till en modern fästning med bastioner.']
    ],
    'Helsingborg': [[0, 1611, 'Dansk stad vid sundet. Det höga tornet Kärnan vaktar Öresund.']],
    'Malmö': [
      [0, 1529, 'Dansk handelsstad vid Öresund, med en borg vid stranden.'],
      [1530, 1611, 'Dansk handelsstad vid Öresund. Malmöhus vaktar staden med sina kanontorn.']
    ],
    'Lund': [[0, 1611, 'Ärkebiskopens stad i Danmark, med en domkyrka i sten från 1100-talet.']],
    'Landskrona': [[1549, 1611, 'Dansk hamnstad. Vid hamnen byggs ett citadell med vallgrav.']],
    'Visby': [
      [0, 1524, 'Gotlands stad, med ringmur och fler kyrkor än någon annan stad i Norden. Ön hör till Danmark.'],
      [1525, 1611, 'Gotlands stad, med ringmur och många kyrkor. Ön hör till Danmark. Lübeck har bränt staden.']
    ],
    'Sigtuna': [
      [0, 1526, 'Rikets äldsta stad, med dominikanernas kloster och Mariakyrkan.'],
      [1527, 1611, 'Rikets äldsta stad. Klostret står tomt, men Mariakyrkan används.']
    ],
    'Skara': [[0, 1611, 'Västergötlands biskopsstad med en av rikets äldsta domkyrkor.']],
    'Mariestad': [[1583, 1611, 'En ny stad vid Vänern, som hertig Karl har grundat och kallat efter sin hustru Maria.']],
    'Kronoberg': [[1540, 1611, 'Kungens borg på en holme i Helgasjön, som ska hålla Småland lugnt.']],
    'Danzig': [[0, 1611, 'Polens stora hamnstad vid Weichsel, med Mariakyrkan, en av världens största tegelkyrkor.']],
    'Brunkeberg': [[0, 1611, 'Åsen norr om Stockholm. Här slog Sten Sture den äldre danskarna 1471.']],
    'Söderköping': [[0, 1611, 'Gammal handelsstad i Östergötland, där riksmöten ofta hålls.']],
    'Arboga': [[0, 1611, 'Stad vid Arbogaån, där många riksmöten har hållits.']],
    'Drottningholm': [[1580, 1611, 'Ett nytt slott på Lovön, byggt åt drottning Katarina.']],
    'Örbyhus': [[0, 1611, 'Borg i norra Uppland.']],
    'Tavastehus': [[0, 1611, 'Tegelborgen i Tavastland, ett av Finlands viktigaste fästen.']],
    'Nyslott': [[0, 1611, 'Olofsborg på en klippö, som vaktar gränsen mot Ryssland.']],
    'Nådendal': [
      [0, 1554, 'Birgittinernas kloster i Finland.'],
      [1555, 1611, 'Liten stad kring det gamla birgittinklostret.']
    ],
    'Visingsö': [
      [0, 1560, 'Ön mitt i Vättern. På södra udden står ruinen av kungaborgen Näs, där kung Magnus Ladulås dog 1290.'],
      [1561, 1574, 'Ön mitt i Vättern hör till greve Per Brahes grevskap Visingsborg.'],
      [1575, 1611, 'På öns östra strand bygger greve Per Brahe ett slott av tegel. Ruinen av kungaborgen Näs står på södra udden.']
    ],
    'Brahehus': [[1637, 1708, 'Per Brahe den yngre bygger ett hus på berget ovanför Gränna, med utsikt över Vättern och Visingsö.']]
  };
  // Hjälpare så att andra namnformer också hittas
  F['Sala gruva'] = F['Sala silvergruva']; F['Falun'] = F['Kopparberget'];

  function ar() { try { return V.kalender ? V.kalender().ar : 1520; } catch (e) { return 1520; } }
  // En stad i orter.js som inte har egna rader: när den fick sina stadsrättigheter (orter.js har årtalen).
  function stadText(namn, Y) {
    const O = V.Orter; if (!O || !O.STADER) return null;
    for (const st of O.STADER) {
      const f = st[3]; if (!f || !f.some(q => q[2] === namn)) continue;
      let nu = null; for (const q of f) if (q[0] <= Y) nu = q; if (!nu) return null;
      const stad = f.find(q => q[1] >= 2 && q[0] <= Y);
      if (nu[1] >= 2) return stad && stad[0] <= 1000 ? 'En stad med torg, kyrka och hantverkare.' : 'Har stadsrättigheter sedan ' + stad[0] + '.';
      if (nu[1] === 1) return 'En by med marknad.';
      return null;
    }
    return null;
  }
  function text(namn) {
    const L = F[namn], Y = ar(); if (!L) return stadText(namn, Y);
    let r = L.find(q => Y >= q[0] && Y <= q[1]); if (!r) { const fore = L.filter(q => q[0] <= Y); r = fore[fore.length - 1]; }
    if (!r) return null;
    // säkerhet: en mening som nämner ett år efter året nu visas aldrig
    const t = r[2].split(/(?<=\.)\s+/).filter(m => !(m.match(/\b1[0-9]{3}\b/g) || []).some(a => +a > Y)).join(' ');
    return t || null;
  }

  // ---- rutan ----
  const css = document.createElement('style');
  css.textContent = '.ortfakta{position:absolute;z-index:40;max-width:260px;padding:9px 12px 8px;background:var(--perg,#eadfc4);color:#2b2017;border:2px solid var(--guld,#c9a24a);border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.35);font-size:14px;line-height:1.35;pointer-events:auto}'
    + '.ortfakta b{display:block;font-weight:normal;font-size:15.5px;letter-spacing:.04em;margin-bottom:3px;color:#5a2a14}.ortfakta .ar{float:right;font-size:12px;color:#7a6440;margin-left:8px}'
    + '.ortfakta small{display:block;margin-top:5px;font-size:11px;color:#7a6440}@media (max-width:720px){.ortfakta{max-width:220px;font-size:13px}}';
  document.head.appendChild(css);
  let ruta = null;
  function stang() { if (ruta) { ruta.remove(); ruta = null; } }
  function visa(namn, el) {
    stang(); const t = text(namn); if (!t) return;
    ruta = document.createElement('div'); ruta.className = 'ortfakta';
    ruta.innerHTML = '<b></b><div></div><small>Källa: svenska Wikipedia om orten</small>';
    ruta.querySelector('b').textContent = namn + ', ' + ar(); ruta.querySelector('div').textContent = t;
    document.body.appendChild(ruta);
    // Rutan står kvar vid orten: den följer namnskylten när kartan dras (Johannes 2026-11-28: "så ska den stanna där den spawnade, vid orten").
    const r0 = el.getBoundingClientRect(), under = r0.bottom + 6 + ruta.offsetHeight <= innerHeight - 8, me = ruta;
    const folj = () => {
      if (ruta !== me) return;
      if (!el.isConnected || el.style.display === 'none') me.style.display = 'none';
      else { const r = el.getBoundingClientRect(), w = me.offsetWidth || 240, h = me.offsetHeight; me.style.display = ''; me.style.left = (r.left + r.width / 2 - w / 2) + 'px'; me.style.top = (under ? r.bottom + 6 : r.top - h - 6) + 'px'; }
      requestAnimationFrame(folj);
    };
    folj();
    ruta.addEventListener('click', ev => { ev.stopPropagation(); stang(); });
  }
  function egenBas(namn) { const G = V.Game; if (!G || !G.BAS || !G.s) return false; for (const id in G.BAS) if (G.BAS[id].namn === namn && G.s.bas[id]) return true; return false; }
  // Ett tryck på ett namn på kartan. Fångas innan ui.js egen lyssnare, men stoppar den inte.
  let ned = null;          // var trycket började: att dra kartan stänger inte rutan
  document.addEventListener('pointerdown', ev => { ned = [ev.clientX, ev.clientY]; }, true);
  document.addEventListener('click', ev => {
    const el = ev.target && ev.target.closest ? ev.target.closest('.ortnamn') : null;
    const drog = ned && Math.hypot(ev.clientX - ned[0], ev.clientY - ned[1]) > 8;
    if (!el) { if (ruta && !drog && !(ev.target.closest && ev.target.closest('.ortfakta'))) stang(); return; }
    const namn = el.textContent.trim(); if (egenBas(namn)) { stang(); return; }
    if (ruta && ruta._namn === namn) { stang(); return; }
    visa(namn, el); if (ruta) ruta._namn = namn;
  }, true);
  V.OrtFakta = { F, text, visa, stang };
})();
