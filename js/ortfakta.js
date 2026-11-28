// Fakta om orterna (Johannes 2026-11-28: "Man ska kunna klicka på varje ort med namn å så står de historiskt fakta om vad som skedde i den staden vid den tiden").
// Ett tryck på ett ortnamn på kartan visar en kort ruta: vad orten är och vad som händer där det år världen står i. Inget om det som kommer senare.
// Nyckel = namnet så som det står på kartan. Varje rad: [från år, till år, text]. Den rad gäller vars år omfattar året nu; annars den senaste före.
// Egna städer visar också läget just nu (nivå, vad den ger, husen, steget som sker där). Källor: docs/ortfakta.md.
(function () {
  'use strict';
  const V = window.VASA;
  // Allt i nutid, som om man står där det året (Johannes 2026-11-28: "allt ska vara immersion, presence, nutid"). Ingen rad nämner ett år efter sitt eget första år.
  // Varje rad är kontrollerad mot svenska Wikipedia 2026-11-28 och säger bara det sidan säger (Johannes: "Du får ALDRIG gissa något i detta spelet").
  // En rad som nämner en händelse börjar först efter den: dagen efter när källan har datum, månaden efter när den bara har månad, året efter när den bara har år
  // (själva året skrivs "År 1527 ..."). Källa per ort: docs/ortfakta.md. Decimaler: år + (månad - 1 + (dag - 1) / 30) / 12.
  const F = {
    'Stockholm': [
      [0, 1520.08, 'Staden ligger vid Mälarens utlopp i Östersjön och har varit rikets största stad sedan 1400-talet. Vid Norrström ligger Stockholms slott.'],
      [1520.09, 1520.68, 'Kung Kristian II har anfallit Sverige. Sten Stures änka Kristina Gyllenstierna leder försvaret av staden.'],
      [1520.69, 1520.84, 'Stockholms slott har överlämnats till Kristian II den 7 september 1520. Kungen har lovat amnesti åt staden.'],
      [1520.85, 1520.85, 'Kristian II kröntes i Storkyrkan den 4 november 1520.'],
      [1520.86, 1521.47, 'Kristian II kröntes i Storkyrkan den 4 november 1520, och den 8–9 november avrättades Sten Stures anhängare i Stockholms blodbad. En dansk här håller staden.'],
      [1521.48, 1522.82, 'En dansk här håller staden. Sedan midsommar 1521 belägras den av Gustav Erikssons här.'],
      [1522.83, 1523.46, 'En dansk här håller staden. Gustav Erikssons här belägrar den, och sedan oktober 1522 stänger Lübecks örlogsfartyg vägen från havet.'],
      [1523.47, 1523.49, 'Staden ger sig i juni 1523.'],
      [1523.50, 1535, 'Staden gav sig i juni 1523, och Gustav Vasa tågade in.'],
      [1536, 1536, 'År 1536 börjar man bygga en ny yttre försvarsmur av tegel runt slottet.'],
      [1537, 1540, 'En ny yttre försvarsmur av tegel byggs runt slottet.'],
      [1541, 1547, 'Runt slottet byggs en ny mur av tegel, en vallgrav och ett porthus med vindbrygga.'],
      [1548, 1555, 'Stockholms slott har en ny mur av tegel och en vallgrav.'],
      [1556, 1556, 'År 1556 byggs slottets sydöstra torn.'],
      [1557, 1568, 'Stockholms slott har en mur av tegel, en vallgrav och ett nytt sydöstra torn.'],
      [1569, 1587, 'Kung Johan bygger om slottet i renässansstil, med påkostade gavlar, och kärntornet höjs med två våningar.'],
      [1588, 1588, 'År 1588 sätts tre förgyllda kronor på kärntornets spira, och slottet får namnet Tre Kronor.'],
      [1589, 1599.56, 'Slottet heter Tre Kronor efter de tre förgyllda kronorna på kärntornets spira.'],
      [1599.57, 1603.66, 'Hertig Karl är riksföreståndare, och kung Sigismund är avsatt.'],
      [1603.67, 1604.22, 'Karl styr riket, och kung Sigismund är avsatt.'],
      [1604.23, 1611.82, 'Karl är kung av Sverige.'],
      [1611.83, 1611, 'Kung Karl dog den 30 oktober 1611, och hans son Gustav Adolf är arvinge till kronan.']
    ],
    'Uppsala': [
      [0, 1520.26, 'Ärkebiskopens stad, kyrkligt centrum i Sverige sedan 1164. Domkyrkan är Nordens största gotiska kyrkobyggnad, och universitetet grundades 1477 för att utbilda präster.'],
      [1520.27, 1522, 'Den 6 april 1520 vann den danska hären slaget vid Uppsala mot en svensk bondehär.'],
      [1523, 1526, 'Kyrkligt centrum i Sverige sedan 1164. Domkyrkan är Nordens största gotiska kyrkobyggnad.'],
      [1527, 1527, 'År 1527 bryts kyrkans ekonomiska och militära makt vid riksdagen i Västerås.'],
      [1528, 1528.07, 'Kyrkans ekonomiska och militära makt bröts vid riksdagen i Västerås 1527, och kyrkans gods går till kronan.'],
      [1528.08, 1548, 'Gustav Vasa kröntes i Uppsala domkyrka i januari 1528. Kyrkans makt bröts vid riksdagen i Västerås 1527, och kyrkans gods går till kronan.'],
      [1549, 1549, 'År 1549 börjar man bygga ett slott på Kasåsen, högt över staden.'],
      [1550, 1561.49, 'På Kasåsen högt över staden byggs ett slott.'],
      [1561.50, 1566, 'Kung Erik kröntes i domkyrkan den 29 juni 1561. På Kasåsen högt över staden byggs ett slott.'],
      [1567, 1567.39, 'År 1567 blir de första boningsdelarna på slottet klara.'],
      [1567.40, 1569.52, 'Den 24 maj 1567 mördades Svante Sture och två av hans söner på slottet, på kung Eriks order.'],
      [1569.53, 1572.30, 'Kung Johan kröntes i Uppsala den 10 juli 1569.'],
      [1572.31, 1592, 'Slottet brann den 23 april 1572, och kung Johan bygger om det till ett renässanspalats.'],
      [1593, 1593.16, 'Slottet på Kasåsen är ett renässanspalats, utbyggt av kung Johan.'],
      [1593.17, 1593.21, 'Prästerna är samlade till Uppsala möte, som öppnades den 1 mars 1593.'],
      [1593.22, 1607.20, 'Efter Uppsala möte 1593 brukar Svenska kyrkan räknas som evangelisk-luthersk. Mötet beslöt också att universitetet ska öppnas igen.'],
      [1607.21, 1611, 'Kung Karl kröntes i domkyrkan den 15 mars 1607 och höll sin kröningsmiddag på slottet.']
    ],
    'Kalmar': [
      [0, 1519, 'Kalmar slott ligger på Slottsholmen vid Slottsfjärden. Under medeltiden var staden ett gränsfäste mot Danmark, Sveriges nyckel, och år 1397 stod slottet i centrum när Kalmarunionen bildades.'],
      [1520, 1520.41, 'Kalmar slott ligger på Slottsholmen vid Slottsfjärden, där stadens medeltida hamn ligger.'],
      [1520.42, 1520, 'Den 31 maj 1520 gick Gustav Eriksson i land vid Stensö udde söder om Kalmar.'],
      [1521, 1523.40, 'Kung Kristians knektar håller Kalmar slott.'],
      [1523.41, 1523.51, 'År 1523 strider Gustav Vasas folk om Kalmar slott.'],
      [1523.52, 1534, 'Kalmar slott gav sig sommaren 1523. Näst efter Stockholm var det den plats där kung Kristians knektar höll ut längst.'],
      [1535, 1535, 'År 1535 bygger man slottets fyra runda hörntorn under ledning av Henrik von Cöllen.'],
      [1536, 1556, 'Slottet har fått fyra runda hörntorn och nya flyglar.'],
      [1557, 1560.74, 'Kungens son Erik är hertig av Kalmar och Kronobergs län och har Kalmar slott som residens.'],
      [1560.75, 1569, 'Åren 1557–1560 var Kalmar slott residens för Erik, som nu är kung.'],
      [1570, 1588, 'Slottet byggs om, och salarna får rika inredningar.'],
      [1589, 1592, 'Slottskyrkan byggs.'],
      [1593, 1596, 'Slottskyrkan står färdig sedan 1592.'],
      [1597, 1597, 'Våren 1597 erövrar hertig Karls trupper Kalmar slott.'],
      [1598, 1598.58, 'Hertig Karls trupper erövrade Kalmar slott våren 1597.'],
      [1598.59, 1598, 'Kung Sigismunds här landsteg den 30 juli 1598, och den 1 augusti tågade kungen in i staden.'],
      [1599, 1600, 'Kalmar slott räknas till Sveriges fyra viktigaste fästen.'],
      [1601, 1601, 'År 1601 blir Peter Dionisius slottets byggmästare.'],
      [1602, 1602, 'År 1602 blir Kalmar stiftsstad.'],
      [1603, 1611.40, 'Kalmar är stiftsstad sedan 1602.'],
      [1611.41, 1611.58, 'En dansk här stormade staden den 27 maj 1611 och belägrar slottet.'],
      [1611.59, 1611, 'Danskarna har tagit Kalmar. Slottets hövitsman Christer Somme gav upp den 3 augusti 1611.']
    ],
    'Västerås': [
      [0, 1520, 'Biskopsstad sedan 1100-talet, vid Mälarens norra strand där Svartån mynnar. Västerås slott ligger intill åns mynning.'],
      [1521, 1521.38, 'Kung Kristians knektar håller staden och slottet.'],
      [1521.39, 1522.08, 'Kung Kristians soldater gav upp staden den 20 maj 1521, men slottet håller fortfarande ut.'],
      [1522.09, 1526, 'Slottet gav sig den 30 januari 1522 efter ett års belägring.'],
      [1527, 1527, 'År 1527 hålls riksdag här, och man beslutar att bryta banden med den katolska kyrkan.'],
      [1528, 1543, 'Vid riksdagen här 1527 beslutades att banden med den katolska kyrkan skulle brytas.'],
      [1544, 1544, 'År 1544 görs Sverige till ett arvkungadöme vid riksdagen här.'],
      [1545, 1572, 'Vid riksdagen här 1544 gjordes Sverige till ett arvkungadöme.'],
      [1573, 1573, 'År 1573 förs den avsatte kungen Erik hit som fånge.'],
      [1574, 1611, 'Den avsatte kungen Erik satt fången på slottet ett år från 1573.']
    ],
    'Örebro': [
      [0, 1519, 'Örebro slott ligger på en holme i Svartån i Närke.'],
      [1520, 1520, 'År 1520 tar den danske kungen Kristian II tillbaka borgen.'],
      [1521, 1521, 'Kung Kristians folk håller borgen. År 1521 belägrar Gustav Eriksson den.'],
      [1522, 1522.33, 'I början av 1522 intar riksföreståndaren Gustav Eriksson borgen efter nio månaders belägring.'],
      [1522.34, 1539, 'Gustav Eriksson intog borgen i början av 1522, efter nio månaders belägring.'],
      [1540, 1540, 'År 1540 låter kung Gustav införa arvmonarki.'],
      [1541, 1567, 'Örebro slott ligger på en holme i Svartån i Närke.'],
      [1568, 1568, 'År 1568 står de sista striderna vid Örebro slott, när hertigarna Johan och Karl gör uppror mot kung Erik.'],
      [1569, 1572, 'Örebro slott ligger på en holme i Svartån i Närke.'],
      [1573, 1611, 'Karl, Gustav Vasas yngste son, har fått slottet i arv och bygger om det till ett vitlimmat renässansslott med fyra längor kring en borggård.']
    ],
    'Strängnäs': [
      [0, 1523.43, 'Biskopssäte sedan början av 1100-talet, med en domkyrka av tegel.'],
      [1523.44, 1611, 'Biskopssäte med en domkyrka av tegel. Här valdes Gustav Vasa till kung den 6 juni 1523.']
    ],
    'Linköping': [
      [0, 1598.73, 'Biskopssäte med en domkyrka som började byggas på 1100-talet.'],
      [1598.74, 1599, 'Den 25 september 1598 vann hertig Karl slaget vid Stångebro.'],
      [1600, 1600.17, 'År 1600 håller hertig Karl riksdag i Linköping.'],
      [1600.18, 1600.21, 'En domstol dömer rådsherrar som stod på den förlorande sidan vid Stångebro.'],
      [1600.22, 1611, 'Den 20 mars 1600 avrättades fem rådsherrar som stått på den förlorande sidan vid Stångebro, troligen på Stora torget.']
    ],
    'Vadstena': [
      [0, 1526, 'Birgittinernas kloster invigdes här 1384 och blev snart Sveriges främsta andliga centrum och landets största jordägare. Klosterkyrkan kallas Blåkyrkan.'],
      [1527, 1527, 'År 1527 bestäms att nya nunnor bara får vigas med kungens tillstånd.'],
      [1528, 1544, 'Birgittinernas kloster. Sedan 1527 får nya nunnor bara vigas med kungens tillstånd.'],
      [1545, 1545, 'År 1545 börjar kung Gustav bygga ett slott vid Vätterns strand.'],
      [1546, 1554, 'Vid Vätterns strand byggs ett slott. I klostret lever både nunnor och munkar.'],
      [1555, 1555, 'År 1555 läggs klostrets manliga avdelning ner.'],
      [1556, 1560, 'Nunnorna bor kvar i klostret.'],
      [1561, 1594, 'Nunnorna bor kvar i klostret. Hertig Magnus har slottet som residens.'],
      [1595, 1595, 'År 1595 stängs klostrets kvinnliga del på hertig Karls order.'],
      [1596, 1611, 'Klostret är stängt sedan 1595. Av de elva nunnor som fanns kvar lämnade åtta Sverige.']
    ],
    'Nyköping': [
      [0, 1599, 'Nyköpingshus är en medeltida borg.'],
      [1600, 1611, 'Karl, Gustav Vasas yngste son, har byggt om Nyköpingshus till ett renässansslott.']
    ],
    'Gripsholm': [
      [1537, 1537, 'År 1537 börjar kung Gustav bygga ett slott av tegel vid Mälaren.'],
      [1538, 1545, 'Kung Gustav bygger ett slott av tegel vid Mälaren.'],
      [1546, 1563.66, 'Slottets kärna med fyra torn och en sluten borggård står i stort sett färdig sedan 1545.'],
      [1563.67, 1567.91, 'Hertig Johan och hans hustru Katarina Jagellonica sitter fångna på slottet.'],
      [1567.92, 1570, 'Hertig Johan och Katarina Jagellonica satt fångna här från 1563 tills Johan släpptes hösten 1567.'],
      [1571, 1571, 'År 1571 låter kung Johan fängsla sin bror Erik och hans familj på slottet.'],
      [1572, 1572, 'Den avsatte kungen Erik och hans familj sitter fångna på slottet.'],
      [1573, 1573, 'År 1573 förs den avsatte kungen Erik vidare från slottet.'],
      [1574, 1611, 'Den avsatte kungen Erik och hans familj satt fångna här från 1571.']
    ],
    'Stäket': [
      [0, 1515, 'Almarestäkets borg vid Stäksundet tillhör ärkebiskopen. Den som har kontroll över vattenvägarna har kontroll över riket.'],
      [1516, 1516, 'Ärkebiskop Gustav Trolle har borgen. År 1516 börjar Sten Sture belägra den.'],
      [1517, 1517.91, 'Sten Sture belägrar ärkebiskop Gustav Trolles borg.'],
      [1517.92, 1519, 'Riksrådet har beslutat att borgen ska rivas.'],
      [1520, 1611, 'Almarestäkets borg är riven, och teglet har fraktats till Stockholm.']
    ],
    'Mora': [
      [0, 1520.91, 'Socken väster om Siljan. Kyrkan har delar av en stenkyrka från slutet av 1200-talet eller början av 1300-talet.'],
      [1520.92, 1520.99, 'Det berättas att Gustav Eriksson har kommit hit på flykt och talar till allmogen på kyrkbacken i julhelgen.'],
      [1521, 1521.08, 'I januari 1521 utser morakarlarna Gustav Eriksson till hövitsman över Dalarna.'],
      [1521.09, 1611, 'Socken väster om Siljan. I januari 1521 utsåg morakarlarna Gustav Eriksson till hövitsman över Dalarna.']
    ],
    'Leksand': [[0, 1611, 'Socken söder och öster om Siljan. Kyrkan ligger på Kyrkudden, där älven rinner ut ur sjön.']],
    'Rättvik': [[0, 1611, 'Socken öster om Siljan, med kyrkbyn Rättvik. Socknen är en höglänt skogsbygd med fäbodar.']],
    'Kopparberget': [[0, 1611, 'Koppargruvan vid Falun.']],
    'Sala silvergruva': [
      [0, 1512, 'Silvergruvan i Sala har varit i drift sedan 1400-talet. Silvret är viktigt som myntmetall.'],
      [1513, 1611, 'Silvergruvan i Sala har varit i drift sedan 1400-talet. Enligt privilegiebrevet från 1512 ska allt silver säljas till kronan.']
    ],
    'Gävle': [[0, 1611, 'Handelsstad där Gavleån mynnar i Gävlebukten. Staden är utskeppningshamn för norra Bergslagen.']],
    'Hedemora': [[0, 1611, 'Dalarnas äldsta stad, med stadsrätt sedan 1459. Hit kommer folk till marknad, och bergsbrukets varor går vidare härifrån.']],
    'Åbo': [
      [0, 1556.49, 'Finlands äldsta stad och den viktigaste i rikets östra del. Domkyrkan är biskopskyrka, och slottet ligger vid Aura ås mynning.'],
      [1556.50, 1562, 'Hertig Johan är hertig av Finland och har Åbo slott som sitt huvudsäte.'],
      [1563, 1563.49, 'Hertig Johan och Katarina Jagellonica håller hov på Åbo slott.'],
      [1563.50, 1563.61, 'Hertig Johan är dömd för landsförräderi och innesluten på Åbo slott.'],
      [1563.62, 1599, 'Hertig Johan gav sig fången på Åbo slott den 12 augusti 1563 och fördes till Sverige.'],
      [1600, 1611, 'Mot slutet av 1500-talet var Åbo en av huvudplatserna i striden mellan kung Sigismund och hertig Karl.']
    ],
    'Viborg': [
      [0, 1556, 'Viborg ligger vid gränsen mot Ryssland, och slottet är rikets främsta värn österut. Det har hållit ut mot ryska belägringar 1411 och 1495.'],
      [1557, 1611, 'Viborg ligger vid gränsen mot Ryssland, och slottet är rikets främsta värn österut. Det har hållit ut mot ryska belägringar 1411, 1495, 1555 och 1556.']
    ],
    'Helsingfors': [
      [1550, 1550, 'År 1550 grundar Gustav Vasa Helsingfors vid Vanda ås utlopp, för att konkurrera med Reval om handeln.'],
      [1551, 1611, 'Gustav Vasa grundade staden 1550 vid Vanda ås utlopp, för att konkurrera med Reval om handeln.']
    ],
    'Reval': [
      [0, 1560, 'Hansestad i Estland. Livländska orden styr staden och landet runt, och tyska köpmän och hantverkare dominerar bland borgarna.'],
      [1561, 1561, 'År 1561 ansluts norra Estland med Reval till det svenska riket.'],
      [1562, 1611, 'Hansestad i Estland. Reval och norra Estland hör till Sverige sedan 1561.']
    ],
    'Narva': [
      [0, 1557, 'En viktig handelsstad vid floden Narva.'],
      [1558, 1558, 'År 1558 intar ryssarna under tsar Ivan IV staden.'],
      [1559, 1581.68, 'En handelsstad vid floden Narva. Ryssarna har haft staden sedan 1558.'],
      [1581.69, 1611, 'En handelsstad vid floden Narva. Staden är svensk sedan Pontus De la Gardie intog den den 6 september 1581.']
    ],
    'Älvsborg': [
      [0, 1563.67, 'Fästningen vid Göta älvs mynning är Sveriges enda hamn åt väster.'],
      [1563.68, 1570.95, 'Danskarna erövrade fästningen vid Göta älvs mynning den 4 september 1563.'],
      [1570.96, 1573, 'I freden i Stettin 1570 bestämdes att Sverige ska lösa tillbaka fästningen för 150 000 riksdaler silvermynt inom tre år.'],
      [1574, 1611, 'Fästningen vid Göta älvs mynning förstärks sedan 1573.']
    ],
    'Stegeborg': [
      [0, 1517.49, 'Borg på en ö i ett trångt sund vid viken Slätbaken i Östergötland.'],
      [1517.50, 1611, 'Borg på en ö i ett trångt sund vid viken Slätbaken. I juni 1517 brandskattade den danska flottan Söderköping, trots att Stegeborg spärrade inloppet.']
    ],
    'Borgholm': [
      [0, 1571, 'Borgholm på Öland är en borg från 1200-talet.'],
      [1572, 1593, 'Borgen förstördes i krigen i början av 1500-talet. Från 1572 byggs den om till en av Sveriges första bastionsfästningar.'],
      [1594, 1602, 'Arbetet på slottet stoppades 1593 på hertig Karls befallning.'],
      [1603, 1610, 'Sedan 1602 förstärks slottets försvarsverk.'],
      [1611, 1611.76, 'År 1611 faller Öland och Borgholms slott i danskarnas händer.'],
      [1611.77, 1611, 'Gustav Adolf tog tillbaka Borgholms slott den 7 oktober 1611.']
    ],
    'Helsingborg': [[0, 1611, 'Dansk stad vid Öresunds smalaste del. Tillsammans med Helsingör kontrollerar staden Öresundstullen. Kärnan, ett 35 meter högt torn från 1310-talet, hör till Helsingborgs slott.']],
    'Malmö': [
      [0, 1525, 'En stad vid Öresund, med stadsprivilegier sedan 1353 och en borg vid stranden som började byggas 1434.'],
      [1526, 1539, 'En stad vid Öresund. Under 1500-talet har staden en ekonomisk glansperiod, och slottet Malmöhus byggs.'],
      [1540, 1540, 'En stad vid Öresund, med slottet Malmöhus.'],
      [1541, 1611, 'En stad vid Öresund. Slottet Malmöhus har fyra kanontorn och en vallgrav.']
    ],
    'Lund': [
      [0, 1536, 'Ärkebiskopens stad, ärkestift sedan 1104. Domkyrkan av sandsten togs i bruk 1145.'],
      [1537, 1537, 'År 1537 får stiftets överhuvud titeln superintendent i stället för ärkebiskop.'],
      [1538, 1610, 'Lunds stift leds av en superintendent. Domkyrkan av sandsten togs i bruk 1145.'],
      [1611, 1611, 'År 1611 får stiftets ledare åter titeln biskop.']
    ],
    'Landskrona': [
      [1549, 1549, 'År 1549 beslutar kung Kristian III att anlägga en fästning här.'],
      [1550, 1559, 'Ett citadell byggs här: en kvadratisk borg med fyra torn och vattengrav.'],
      [1560, 1611, 'Landskrona citadell, en kvadratisk borg med fyra torn och vattengrav, stod färdigt 1559.']
    ],
    'Visby': [
      [0, 1522, 'Hansestad på Gotland, med ringmur och flera kyrkor. Gotland hör till Danmark.'],
      [1523, 1524, 'Hansestad på Gotland, med ringmur och flera kyrkor. Søren Norby håller Visborgs slott för Kristian II.'],
      [1525, 1525, 'År 1525 stormar trupper från Lübeck staden, och stora delar av den bränns.'],
      [1526, 1611, 'Hansestad på Gotland, med ringmur och flera kyrkor. År 1525 stormade trupper från Lübeck staden, och stora delar av den brändes. Gotland hör till Danmark.']
    ],
    'Sigtuna': [[0, 1611, 'Stad vid Mälaren, en av de första städerna i Sverige. Mariakyrkan byggdes som dominikanernas klosterkyrka och var färdig omkring 1250.']],
    'Skara': [[0, 1611, 'Biskopssäte i Skara stift, Sveriges första stift. Domkyrkan har anor från 1100-talet.']],
    'Mariestad': [
      [1583, 1583, 'År 1583 grundar hertig Karl staden vid Vänern och döper den efter sin hustru Maria.'],
      [1584, 1611, 'En ny stad vid Vänern, grundad 1583 av hertig Karl och döpt efter hans hustru Maria.']
    ],
    'Kronoberg': [[1544, 1611, 'Kronans borg på en holme i Helgasjön, fem kilometer norr om Växjö. Gustav Vasa lät bygga ut den för att förhindra fler uppror i Småland.']],
    'Danzig': [[0, 1611, 'En hansestad nära Weichsels mynning i Östersjön. Staden står under polsk överhöghet och skeppar ut Polens spannmål. Mariakyrkan är en av världens största tegelkyrkor.']],
    'Brunkeberg': [[0, 1611, 'Åsen på Norrmalm vid Stockholm. Här besegrade Sten Sture den äldre kung Kristian I:s unionsanhängare den 10 oktober 1471.']],
    'Söderköping': [
      [0, 1594, 'En gammal stad i Östergötland.'],
      [1595, 1595, 'År 1595 hålls riksdag i Söderköping.'],
      [1596, 1611, 'En gammal stad i Östergötland. Här hölls riksdag 1595.']
    ],
    'Arboga': [[0, 1611, 'Stad vid Arbogaån i Västmanland, med förbindelse till Bergslagen. Riksmötet här 1435 brukar räknas som Sveriges första riksdag.']],
    'Drottningholm': [[1580, 1611, 'Ett slott på Lovön, som kung Johan började bygga 1579 och uppkallade efter drottningen.']],
    'Örbyhus': [[1539, 1611, 'Slott i norra Uppland. Gustav Vasa köpte godset 1538 och lät befästa det med starka murar och kasematter.']],
    'Tavastehus': [
      [0, 1523, 'Tavastehus slott i Tavastland är byggt av gråsten och tegel.'],
      [1524, 1611, 'Tavastehus slott är byggt av gråsten och tegel. Sedan Gustav Vasa tog makten 1523 är slottet ett centrum där skatter drivs in.']
    ],
    'Nyslott': [
      [0, 1599, 'Olofsborg ligger på en holme i Kyrönsalmi sund i Savolax och är en gränsfästning mot Ryssland.'],
      [1600, 1611, 'Olofsborg ligger på en holme i Kyrönsalmi sund i Savolax.']
    ],
    'Nådendal': [
      [0, 1555, 'Staden har vuxit upp kring ett birgittinkloster, ett dubbelkloster med munkar och nunnor.'],
      [1556, 1556, 'Staden har vuxit upp kring ett birgittinkloster. År 1556 drar kronan in klostrets egendom.'],
      [1557, 1583, 'Staden har vuxit upp kring ett birgittinkloster. Klostrets egendom drogs in 1556, och klostret får ett underhåll i stället.'],
      [1584, 1591, 'Staden har vuxit upp kring ett birgittinkloster. Sedan 1584 är klosterkyrkan sockenkyrka.'],
      [1592, 1611, 'Staden har vuxit upp kring ett birgittinkloster, som upplöstes 1591. Klosterkyrkan är sockenkyrka sedan 1584.']
    ],
    'Visingsö': [
      [0, 1569, 'Vätterns största ö. På södra udden ligger Näs, där kung Magnus Ladulås dog 1290.'],
      [1570, 1579, 'Vätterns största ö hör till grevskapet Visingsborg. På 1570-talet börjar man bygga ett slott av tegel på östra stranden, och på södra udden står ruinen av Näs.'],
      [1580, 1611, 'Vätterns största ö hör till grevskapet Visingsborg, med ett slott av tegel på östra stranden. På södra udden står ruinen av Näs.']
    ],
    'Brahehus': [[1637, 1708, 'År 1637 började Per Brahe den yngre bygga Brahehus på bergskanten norr om Gränna, med milsvid utsikt över Vättern och Visingsö.']]
  };
  // Hjälpare så att andra namnformer också hittas
  F['Sala gruva'] = F['Sala silvergruva']; F['Falun'] = F['Kopparberget'];

  function ar() { try { return V.kalender ? V.kalender().ar : 1520; } catch (e) { return 1520; } }
  function tid() { try { const d = V.Game.datum(); return d.ar + (d.man - 1) / 12; } catch (e) { return ar(); } }          // år och månad, så att inget sägs innan det har hänt
  // En stad i orter.js som inte har egna rader: när den fick sina stadsrättigheter (orter.js har årtalen).
  function stadText(namn, Y) {
    const O = V.Orter; if (!O || !O.STADER) return null;
    for (const st of O.STADER) {
      const f = st[3]; if (!f || !f.some(q => q[2] === namn)) continue;
      let nu = null; for (const q of f) if (q[0] <= Y) nu = q; if (!nu) return null;
      const stad = f.find(q => q[1] >= 2 && q[0] <= Y);
      if (nu[1] >= 2) return stad && stad[0] <= 1000 ? 'En stad med stadsrättigheter sedan medeltiden.' : 'Har stadsrättigheter sedan ' + stad[0] + '.';          // årtalen ur listan över städer (docs/orter.md)
      if (nu[1] === 1) return 'Orten har inga stadsrättigheter.';
      return null;
    }
    return null;
  }
  function text(namn) {
    const L = F[namn], Y = tid(); if (!L) return stadText(namn, Math.floor(Y));
    let r = L.find(q => Y >= q[0] && Y < (q[1] === Math.floor(q[1]) ? q[1] + 1 : q[1] + 0.01)); if (!r) { const fore = L.filter(q => q[0] <= Y); r = fore[fore.length - 1]; }
    if (!r) return null;
    // säkerhet: en mening som nämner ett år efter året nu visas aldrig
    const t = r[2].split(/(?<=\.)\s+/).filter(m => !(m.match(/\b1[0-9]{3}\b/g) || []).some(a => +a > Math.floor(Y))).join(' ');
    return t || null;
  }

  // ---- rutan ----
  const css = document.createElement('style');
  css.textContent = '.ortfakta{position:absolute;z-index:40;max-width:260px;padding:9px 12px 8px;background:var(--perg,#eadfc4);color:#2b2017;border:2px solid var(--guld,#c9a24a);border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.35);font-size:14px;line-height:1.35;pointer-events:auto}'
    + '.ortfakta b{display:block;font-weight:normal;font-size:15.5px;letter-spacing:.04em;margin-bottom:3px;color:#5a2a14}.ortfakta .ar{float:right;font-size:12px;color:#7a6440;margin-left:8px}'
    + '.ortfakta .lage{margin:0 0 5px;padding-bottom:5px;border-bottom:1px solid rgba(122,100,64,.35);font-style:italic;color:#3d2a17}.ortfakta small{display:block;margin-top:5px;font-size:11px;color:#7a6440}@media (max-width:720px){.ortfakta{max-width:220px;font-size:13px}}';
  document.head.appendChild(css);
  let ruta = null;
  function stang() { if (ruta) { ruta.remove(); ruta = null; } }
  // Läget i en stad man själv har (Johannes 2026-11-28: "en statustext om vad som händer i staden nu, info om stadens dagsläge och info om staden").
  function lage(id) {
    const G = V.Game, D = V.DATA, S = G.s, b = G.BAS[id], tal = V.tal || (x => Math.round(x)), rader = [];
    const L = G.niva(id), p = G.prod(id), vad = b.ger === 'man' ? 'män' : 'mark';
    rader.push('Nivå ' + L + '. ' + (G.stoppad && G.stoppad(id) ? 'Arbetet står still just nu.' : 'Ger ' + tal(p < 10 ? Math.round(p * 10) / 10 : p) + ' ' + vad + ' i sekunden.'));
    const hus = (D.BYGGNADER || []).filter(h => h.plats === id && G.husFinns && G.husFinns(h.id) && G.hus(h.id) > 0).map(h => h.namn);
    if (hus.length) rader.push('Här står ' + (hus.length > 1 ? hus.slice(0, -1).join(', ') + ' och ' + hus[hus.length - 1] : hus[0]) + '.');
    const u = D.UPPDRAG[S.nasta];
    if (u && u.plats === id) rader.push((S.aktivt ? 'Just nu: ' : 'Snart: ') + u.titel.charAt(0).toLowerCase() + u.titel.slice(1) + '.');
    return rader;
  }
  function egenId(namn) { const G = V.Game; if (!G || !G.BAS || !G.s) return null; for (const id in G.BAS) if (G.BAS[id].namn === namn && G.s.bas[id]) return id; return null; }
  function visa(namn, el) {
    stang(); const t = text(namn), id = egenId(namn); if (!t && !id) return;
    ruta = document.createElement('div'); ruta.className = 'ortfakta';
    ruta.innerHTML = '<b></b><p class="lage"></p><div></div>';
    ruta.querySelector('b').textContent = namn + ', ' + ar(); ruta.querySelector('div').textContent = t || '';
    const lp = ruta.querySelector('.lage');
    const fyll = () => { if (!lp.isConnected) return; try { lp.textContent = lage(id).join(' '); } catch (e) { lp.textContent = ''; } setTimeout(fyll, 1000); };
    lp.remove();          // bara historisk info i rutan, ingen nivå eller produktion (Johannes 2026-11-28: "nivå grejen kan tas bort från denna rutan")
    if (!t && ruta.querySelector('small')) ruta.querySelector('small').remove();          // källan visas inte i spelet (Johannes 2026-11-28: bryter inlevelsen), den står i docs/ortfakta.md
    document.body.appendChild(ruta); if (id) fyll();
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
  // Ett tryck på ett namn på kartan. Fångas innan ui.js egen lyssnare, men stoppar den inte.
  let ned = null;          // var trycket började: att dra kartan stänger inte rutan
  document.addEventListener('pointerdown', ev => { ned = [ev.clientX, ev.clientY]; }, true);
  document.addEventListener('click', ev => {
    const el = ev.target && ev.target.closest ? ev.target.closest('.ortnamn') : null;
    const drog = ned && Math.hypot(ev.clientX - ned[0], ev.clientY - ned[1]) > 8;
    if (!el) { if (ruta && !drog && !(ev.target.closest && ev.target.closest('.ortfakta'))) stang(); return; }
    const namn = el.textContent.trim();
    if (egenId(namn)) ev.stopPropagation();          // en egen stad: rutan med läget i stället för fliken (fliken öppnas med ett tryck på staden själv)
    if (ruta && ruta._namn === namn) { stang(); return; }
    visa(namn, el); if (ruta) ruta._namn = namn;
  }, true);
  V.OrtFakta = { F, text, visa, stang, lage };
})();
