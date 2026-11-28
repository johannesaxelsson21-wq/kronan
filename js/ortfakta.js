// Fakta om orterna (Johannes 2026-11-28: "Man ska kunna klicka på varje ort med namn å så står de historiskt fakta om vad som skedde i den staden vid den tiden").
// Ett tryck på ett ortnamn på kartan visar en kort ruta: vad orten är och vad som händer där det år världen står i. Inget om det som kommer senare.
// Nyckel = namnet så som det står på kartan. Varje rad: [från år, till år, text]. Den rad gäller vars år omfattar året nu; annars den senaste före.
// Egna baser som man äger öppnar sin flik som förut (ui.js) och får ingen ruta här. Källor: docs/ortfakta.md.
(function () {
  'use strict';
  const V = window.VASA;
  const F = {
    'Stockholm': [
      [0, 1519, 'Rikets största stad, med slottet vid strömmen. Den som har slottet har makten över Mälardalen. Tyska köpmän har stort inflytande i staden.'],
      [1520, 1522, 'Danskarna håller staden. I november 1520 avrättades över åttio män på Stortorget, sedan kung Kristian hade lovat att ingen skulle straffas.'],
      [1523, 1535, 'Gustav Vasa red in i staden på midsommarafton 1523. Danskarna är borta, och kungen har slottet.'],
      [1536, 1559, 'Kungen låter bygga en ny mur av tegel och en vallgrav kring slottet.'],
      [1560, 1567, 'Erik XIV:s hov håller till på slottet. Kungen samlar konstnärer, musiker och lärda kring sig.'],
      [1568, 1587, 'Johan III bygger om slottet efter sin smak, med nya gavlar och torn i renässansens stil.'],
      [1588, 1599, 'Tre förgyllda kronor sitter sedan 1588 på slottets höga torn.'],
      [1600, 1611, 'Hertig Karl styr riket sedan Sigismund avsatts 1599.']
    ],
    'Uppsala': [
      [0, 1519, 'Ärkebiskopens stad och rikets andliga mitt. Domkyrkan är Nordens största kyrka, och här finns sedan 1477 ett universitet.'],
      [1520, 1522, 'På långfredagen 1520 stod ett av de blodigaste slagen i rikets historia här, mellan upplänningar och den danska hären.'],
      [1523, 1548, 'Gustav Vasa kröntes i domkyrkan 1528. Kyrkan har förlorat sina gods till kronan, och ärkebiskopen sin makt.'],
      [1549, 1559, 'Kungen bygger sedan 1549 ett slott på åsen ovanför staden.'],
      [1560, 1566, 'Erik XIV kröntes i domkyrkan 1561, med en prakt som ingen svensk kung visat förut.'],
      [1567, 1568, 'I maj 1567 dödades Svante Sture och två av hans söner på slottet.'],
      [1569, 1571, 'Johan III kröntes i domkyrkan 1569.'],
      [1572, 1592, 'Slottet brann 1572 och byggs om till palats.'],
      [1593, 1599, 'På mötet i Uppsala 1593 bestämdes att Sverige ska vara lutherskt. Sigismund kröntes här 1594.'],
      [1600, 1611, 'Karl IX kröntes i domkyrkan 1607.']
    ],
    'Kalmar': [
      [0, 1519, 'Kalmar slott kallas rikets nyckel: det vaktar gränsen mot Danmark. Här slöts unionen mellan de nordiska rikena 1397.'],
      [1520, 1522, 'Gustav Eriksson gick i land vid Kalmar 1520 när han kom hem från Lübeck.'],
      [1523, 1534, 'Slottet är kungens. Härifrån vaktas gränsen mot Danmark och sjövägen till Öland.'],
      [1535, 1559, 'Gustav Vasa gör slottet till en modern fästning, med runda hörntorn för kanoner.'],
      [1560, 1569, 'Under kriget med Danmark från 1563 är Kalmar flottans hamn och ett viktigt fäste vid gränsen.'],
      [1570, 1598, 'Johan III låter bygga om slottet till ett renässanspalats med rika salar.'],
      [1599, 1610, 'Hertig Karl intog slottet 1599 från Sigismunds anhängare och lät avrätta flera av dem.'],
      [1611, 1611, 'Kristian IV av Danmark har förklarat krig. Kalmar belägras.']
    ],
    'Västerås': [
      [0, 1520, 'Biskopsstad vid Svartåns mynning i Mälaren, med domkyrka och slott.'],
      [1521, 1526, 'Gustav Vasa slog danskarna vid Västerås 1521.'],
      [1527, 1543, 'Vid riksdagen i Västerås 1527 tog kungen kyrkans gods och makt. Det var början på reformationen.'],
      [1544, 1572, 'Vid riksdagen i Västerås 1544 bestämdes att kronan ska gå i arv till kungens söner.'],
      [1573, 1611, 'Den avsatte Erik XIV har suttit fången på slottet. Staden är fortfarande biskopssäte.']
    ],
    'Örebro': [
      [0, 1520, 'Slottet vid Svartån styr Närke och vägen till Bergslagen.'],
      [1521, 1539, 'Danskarna höll länge slottet i Örebro, men det gav upp för Gustav Vasas folk.'],
      [1540, 1572, 'På mötet i Örebro 1540 svor rådet att Gustav Vasas söner ska ärva kronan.'],
      [1573, 1611, 'Hertig Karl bygger om slottet till ett vitt renässansslott med fyra längor kring en gård.']
    ],
    'Strängnäs': [
      [0, 1522, 'Biskopsstad vid Mälaren med en domkyrka i tegel och ett av rikets högsta kyrktorn.'],
      [1523, 1611, 'Här valdes Gustav Vasa till kung den 6 juni 1523.']
    ],
    'Linköping': [
      [0, 1597, 'Östergötlands biskopsstad, med en domkyrka i kalksten som byggts i flera hundra år.'],
      [1598, 1599, 'Hertig Karls här vann över Sigismunds vid Stångebro utanför staden 1598.'],
      [1600, 1611, 'I mars 1600 avrättades fem av Sigismunds anhängare i Linköping, efter en dom vid riksdagen.']
    ],
    'Vadstena': [
      [0, 1544, 'Den heliga Birgittas kloster, rikets rikaste och mest kända. Klosterkyrkan kallas Blåkyrkan efter sin kalksten.'],
      [1545, 1594, 'Gustav Vasa bygger ett slott vid vattnet sedan 1545. Klostret lever kvar, men får inga nya gåvor.'],
      [1595, 1611, 'Nunnorna har lämnat klostret 1595, efter riksdagens beslut.']
    ],
    'Nyköping': [
      [0, 1567, 'Nyköpingshus är en gammal borg vid Nyköpingsåns mynning, Södermanlands starkaste fäste.'],
      [1568, 1611, 'Hertig Karl har Nyköpingshus som sitt hem och bygger om det till ett renässansslott.']
    ],
    'Gripsholm': [
      [1537, 1562, 'Gustav Vasa bygger sedan 1537 ett slott med fyra runda torn vid Mälaren.'],
      [1563, 1567, 'Hertig Johan och hans hustru Katarina sitter fångna på slottet.'],
      [1568, 1611, 'Slottet vid Mälaren är ett av kungens fästen.']
    ],
    'Stäket': [[0, 1611, 'Ärkebiskopens borg vid Mälarens inlopp. Den som har den kan stänga sjövägen till Uppsala.']],
    'Mora': [
      [0, 1519, 'Socken vid Siljan med en gammal stenkyrka. Bönderna här har vapen och vana att strida.'],
      [1520, 1520, 'Gustav Eriksson har kommit till Dalarna på flykt och talar till dalkarlarna vid Mora kyrka.'],
      [1521, 1611, 'Vid Mora kyrka talade Gustav Eriksson till dalkarlarna kring jul 1520. Efter skidåkarnas bud i januari 1521 blev han deras hövding.']
    ],
    'Kopparberget': [[0, 1611, 'Rikets koppargruva vid Falun. Kopparen säljs ut i Europa och är en av kronans största inkomster.']],
    'Sala silvergruva': [[0, 1611, 'Silvergruvan i Sala. Silvret blir mynt, och Gustav Vasa har gjort gruvan till kronans.']],
    'Gävle': [[0, 1611, 'Handelsstad vid Gävlebukten, där Norrlands handel går ut över havet.']],
    'Hedemora': [[0, 1611, 'Dalarnas äldsta stad, med marknad för järnet och kopparen.']],
    'Åbo': [
      [0, 1555, 'Finlands största stad och biskopssäte, med domkyrka och slott vid Aura å.'],
      [1556, 1562, 'Hertig Johan håller hov på Åbo slott som hertig av Finland.'],
      [1563, 1611, 'Erik XIV:s här intog slottet 1563 och förde hertig Johan fången till Sverige.']
    ],
    'Viborg': [[0, 1611, 'Rikets fäste längst i öster, mot Ryssland. 1495 höll slottet ut mot en rysk belägring.']],
    'Helsingfors': [[1550, 1611, 'Gustav Vasa grundade staden 1550 för att ta handeln från Reval.']],
    'Reval': [
      [0, 1560, 'Hansastad i Estland, styrd av Svärdsorden och stadens köpmän.'],
      [1561, 1611, 'Reval svor trohet åt Erik XIV 1561 och är sedan dess svenskt.']
    ],
    'Narva': [
      [0, 1580, 'Handelsstad vid floden Narva, där handeln med Ryssland går.'],
      [1581, 1611, 'Pontus De la Gardie intog Narva 1581.']
    ],
    'Älvsborg': [
      [0, 1562, 'Fästningen vid Göta älvs mynning är rikets enda hamn mot Västerhavet.'],
      [1563, 1570, 'Danskarna intog Älvsborg 1563.'],
      [1571, 1611, 'Älvsborg köptes tillbaka från Danmark 1571 för en mycket stor summa silver.']
    ],
    'Stegeborg': [[0, 1611, 'Borg på en ö vid Slätbaken i Östergötland, som vaktar sjövägen in mot Söderköping.']],
    'Borgholm': [
      [0, 1571, 'En gammal borg på Öland, illa skadad i krigen.'],
      [1572, 1611, 'Johan III bygger sedan 1572 om Borgholm till en modern fästning med bastioner.']
    ],
    'Helsingborg': [[0, 1611, 'Dansk stad vid sundet. Det höga tornet Kärnan vaktar Öresund tillsammans med Helsingör på andra sidan.']],
    'Malmö': [[0, 1611, 'Dansk handelsstad. Kung Kristian III lät bygga Malmöhus på 1530-talet.']],
    'Lund': [[0, 1611, 'Ärkebiskopens stad i Danmark, med en domkyrka i sten från 1100-talet.']],
    'Landskrona': [[1549, 1611, 'Kristian III av Danmark låter bygga ett citadell vid hamnen sedan 1549.']],
    'Visby': [[0, 1611, 'Gotlands stad med ringmur och många kyrkor. Ön hör till Danmark. Lübeck brände staden 1525.']],
    'Sigtuna': [[0, 1611, 'Rikets äldsta stad. Dominikanernas kloster stängdes efter reformationen, men Mariakyrkan står kvar.']],
    'Skara': [[0, 1611, 'Västergötlands biskopsstad med en av rikets äldsta domkyrkor.']],
    'Mariestad': [[1583, 1611, 'Hertig Karl grundade staden 1583 och kallade den efter sin hustru Maria.']],
    'Kronoberg': [[1540, 1611, 'Gustav Vasa lät bygga borgen på en holme i Helgasjön för att hålla Småland lugnt.']],
    'Danzig': [[0, 1611, 'Polens stora hamnstad vid Weichsel, med Mariakyrkan, en av världens största tegelkyrkor.']],
    'Brunkeberg': [[0, 1611, 'Åsen norr om Stockholm. Här vann Sten Sture den äldre över danskarna 1471.']],
    'Söderköping': [[0, 1611, 'Gammal handelsstad i Östergötland där riksmöten ofta hålls.']],
    'Arboga': [[0, 1611, 'Stad vid Arbogaån, där många riksmöten har hållits.']],
    'Drottningholm': [[1580, 1611, 'Johan III lät bygga ett slott på Lovön åt drottning Katarina.']],
    'Örbyhus': [[0, 1611, 'Borg i norra Uppland.']],
    'Tavastehus': [[0, 1611, 'Tegelborgen i Tavastland, ett av Finlands viktigaste fästen.']],
    'Nyslott': [[0, 1611, 'Olofsborg byggdes 1475 på en klippö för att vakta gränsen mot Ryssland.']],
    'Nådendal': [[0, 1611, 'Birgittinernas kloster i Finland.']],
    'Visingsö': [
      [0, 1560, 'Ön mitt i Vättern. På södra udden står ruinen av kungaborgen Näs, där kung Magnus Ladulås dog 1290. Borgen brann 1318.'],
      [1561, 1574, 'Erik XIV gjorde 1561 Per Brahe till greve av Visingsborg. Ön och bygderna kring Vättern är hans grevskap.'],
      [1575, 1611, 'Greve Per Brahe bygger ett slott av tegel på öns östra strand. Ruinen av den gamla kungaborgen Näs står kvar på södra udden.']
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
      if (nu[1] >= 2) return stad && stad[0] <= 1000 ? 'En stad sedan medeltiden, med torg, kyrka och hantverkare.' : 'Har stadsrättigheter sedan ' + stad[0] + '.';
      if (nu[1] === 1) return 'En by med marknad, ännu ingen stad.';
      return null;
    }
    return null;
  }
  function text(namn) {
    const L = F[namn], Y = ar(); if (!L) return stadText(namn, Y);
    let r = L.find(q => Y >= q[0] && Y <= q[1]); if (!r) { const fore = L.filter(q => q[0] <= Y); r = fore[fore.length - 1]; }
    return r ? r[2] : null;
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
