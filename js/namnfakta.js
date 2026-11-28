// Fakta för alla andra namn på kartan (Johannes 2026-11-28: "Jag vill kunna trycka på alla namn och få info, som Mälaren, kloster osv,
// allt som har ett namn ska ha en info ruta när man trycker på det"). Samma ruta och regler som ortfakta.js: nutid, inget om det som kommer
// senare, inga källor i spelet. Raderna läggs till i V.OrtFakta.F. Varje rad: [från år, till år, text]. Källor och osäkerheter: docs/namnfakta.md.
(function () {
  'use strict';
  const V = window.VASA; if (!V.OrtFakta) return;
  const A = 9999, DANSK = 'hör till Danmark';
  // Varje text är kontrollerad mot svenska Wikipedia 2026-11-28 och står bara det sidan säger (Johannes: "Du får ALDRIG gissa något i detta spelet").
  // Källa per rad: docs/namnfakta.md. Rader som källan inte stöder är borttagna.
  const N = {
    // ---- länder och landskap ----
    'Livland': [[0, 1560, 'Landet kring Riga styrs av Livländska orden.'], [1561, 1561, 'År 1561 upplöses Livländska ordens stat, och Polen tar över landet.'], [1562, 1620, 'Ordensstaten är upplöst, och Polen styr landet.'], [1621, 1621, 'Polen styr landet, men år 1621 erövrar Sverige Riga.'], [1622, 1629, 'Sverige har erövrat Riga 1621, och Polen och Sverige strider om resten av landet.'], [1630, A, 'I stilleståndet i Altmark 1629 har Polen lämnat norra Livland med Riga till Sverige.']],
    'Karelen': [[0, A, 'Karelen ligger mellan Vita havet och Finska viken, med sjöarna Ladoga och Onega.']],
    'Tyskland': [[0, A, 'Det tysk-romerska riket, Heliga romerska riket av tysk nation, är en valmonarki.']],
    'Östergötland': [[0, A, 'Östergötland har en bördig slätt.']],
    'Västergötland': [[0, A, 'Västergötland har slätter och skogar, och domkyrkan ligger i Skara.']],
    'Gotland': [[0, 1516, 'Gotland är en stor ö i Östersjön, med Visby och över nittio kyrkor från medeltiden.'], [1517, 1522, 'Gotland är en stor ö i Östersjön, med Visby och över nittio kyrkor från medeltiden. Ön hålls av den danske kungen.'], [1523, 1524, 'Gotland är en stor ö i Östersjön, med Visby och över nittio kyrkor från medeltiden. Søren Norby håller Visborgs slott i Visby för Kristian II.'], [1525, 1525, 'Gotland är en stor ö i Östersjön, med Visby och över nittio kyrkor från medeltiden.'], [1526, 1645.61, 'Gotland är en stor ö i Östersjön, med Visby och över nittio kyrkor från medeltiden. Ön hålls av den danske kungen.'], [1645.62, A, 'Gotland är en stor ö i Östersjön, med Visby och över nittio kyrkor från medeltiden. I freden i Brömsebro i augusti 1645 har ön lämnats till Sverige.']],
    'Skåne': [[0, 1657, 'Skåne tillhör Danmark.']],
    'Blekinge': [[0, 1657, 'Blekinge tillhör Danmark.']],
    'Halland': [[0, 1645.61, 'Halland har ljunghedar och sandstränder och tillhör Danmark.'], [1645.62, A, 'Halland har ljunghedar och sandstränder. I freden i Brömsebro i augusti 1645 har landskapet lämnats till Sverige på trettio år.']],
    'Österbotten': [[0, A, 'Österbotten är en del av Norrebotn, området kring Bottenviken.']],
    // ---- vatten ----
    'Mälaren': [[0, A, 'Mälaren är en av rikets största sjöar.']],
    'Vättern': [[0, A, 'Vid Vätterns stränder ligger Vadstena och Jönköping.']],
    'Vänern': [[0, A, 'Vänern är rikets största sjö.']],
    'Hjälmaren': [[0, A, 'Hjälmaren är en grund sjö.']],
    'Åsunden': [[0, A, 'Åsunden är en långsmal sjö i Västergötland, nära Bogesund. Om vintern används isen som väg.']],
    'Ladoga': [[0, A, 'Ladoga är Europas största sjö.']],
    'Kattegatt': [[0, A, 'Kattegatt ligger utanför Hallands kust.']],
    'Öresund': [[0, A, 'Vid Öresund tar den danske kungen ut Öresundstullen.']],
    'Göta älv': [[0, A, 'Göta älv rinner från Vänern ut mot Kattegatt.']],
    'Tiveden': [[0, A, 'Tiveden är en skog mellan Närke och Västergötland.']],
    // ---- orter och platser ----
    'Novgorod': [[0, 1611.54, 'En gammal handelsstad i Ryssland. Sedan 1478 har den förlorat sin självständighet och lyder under Moskva.'], [1611.55, 1616, 'En gammal handelsstad i Ryssland. Svenskarna under Jakob De la Gardie har intagit staden den 16 juli 1611.']],
    'Lübeck': [[0, 1535.43, 'Lübeck leder Hansan, ett förbund av handelsstäder i norra Tyskland, och stadens flottor behärskar Östersjön.'], [1535.44, A, 'Lübeck leder Hansan, ett förbund av handelsstäder i norra Tyskland.']],
    'Köpenhamn': [[0, A, 'Köpenhamn ligger vid Öresund på Själland och Amager. Sedan 1416 är staden kunglig besittning och Danmarks viktigaste stad.']],
    'Kalø': [[0, A, 'Kalø slott i Danmark tillhör kronan sedan 1407 och är residens för Kalø län.']],
    'Jönköping': [[0, A, 'Jönköping ligger vid Vätterns södra strand och har stadsprivilegier sedan 1284. Här möts Lagastigen och Nissastigen.']],
    'Nydala kloster': [[0, 1528, 'Ett cistercienserkloster vid sjön Rusken i Småland, grundat 1143. Klostret äger över 250 gårdar.'], [1529, 1529, 'Ett cistercienserkloster vid sjön Rusken i Småland, grundat 1143. År 1529 drar Gustav Vasa in klostret.'], [1530, A, 'Gustav Vasa har dragit in klostret, och klosterlivet har upphört.']],
    'Enköping': [[0, A, 'En handelsstad i Uppland vid Mälaren. Vårfrukyrkan är från 1100-talet, och det äldsta bevarade stadsprivilegiet är från 1413.']],
    'Romfartuna': [[0, A, 'En socken med medeltida ursprung norr om Västerås, kring Mungasjön.']],
    'Falkenberg': [[0, A, 'En stad vid Ätrans utlopp i Kattegatt, omtalad i skrift sedan slutet av 1200-talet.']],
    'Bohus': [[0, A, 'Bohus fästning står på en 40 meter hög klippa i Nordre älv, en arm av Göta älv. Den byggdes från 1308 för att försvara Norges sydgräns.']],
    'Hova': [[0, A, 'En kyrkby i Västergötland. Här stod ett slag den 14 juni 1275.']],
    'Aspeboda': [[0, A, 'Ett kapellag i Stora Tuna socken i Dalarna, väster om Falun.']],
    'Rankhyttan': [[0, A, 'En gård i Vika socken i Dalarna, som ägs av bergsmannen Anders Persson.']],
    'Vissefjärda': [[0, A, 'En socken i Smålands skogar, vid gränsen mot Danmark.']],
    'Borgå': [[0, A, 'En gammal stad i Nyland i Finland, vid Borgå ås mynning nära kusten.']],
    'Ekenäs': [[0, 1528, 'Ekenäs ligger på Finlands sydkust, nära Raseborgs slott.'], [1529, 1545, 'Ekenäs ligger på Finlands sydkust, nära Raseborgs slott. Sedan 1528 är orten förvaltningscentrum i Raseborgs län.'], [1546, 1546, 'Ekenäs ligger på Finlands sydkust, nära Raseborgs slott. År 1546 ger Gustav Vasa Ekenäs stadsrättigheter.'], [1547, A, 'Gustav Vasa har gett Ekenäs stadsrättigheter.']],
    'Raumo': [[0, 1537, 'En sjöfartsstad vid Bottenhavet med stadsrättigheter sedan 1442 och ett franciskankonvent.'], [1538, 1538, 'En sjöfartsstad vid Bottenhavet med stadsrättigheter sedan 1442. År 1538 upplöses franciskankonventet.'], [1539, A, 'En sjöfartsstad vid Bottenhavet med stadsrättigheter sedan 1442. Franciskankonventet upplöstes 1538.']],
    'Ulvsby': [[0, 1557, 'En stad vid utloppet av Kumo älv. Staden har inga stapelrättigheter och får bara handla med Stockholm och Åbo.'], [1558, 1558, 'En stad vid utloppet av Kumo älv. Landhöjningen har gjort hamnen för grund, och år 1558 grundar hertig Johan Björneborg närmare Bottenhavet.'], [1559, A, 'Landhöjningen har gjort hamnen för grund, och hertig Johan har grundat Björneborg närmare Bottenhavet.']],
    'Björneborg': [[1558, A, 'En ny stad vid Kumo älvs mynning, närmare Bottenhavet än Ulvsby, grundad av hertig Johan.']],
    'Vilnius': [[0, A, 'Vilnius nämns i skrift första gången 1323 och fick stadsrättigheter 1387.']],
    'Warnemünde': [[0, A, 'Warnemünde ligger vid floden Warnows mynning i Östersjön och hör sedan 1323 till staden Rostock.']],
    'Mön': [[0, A, 'En dansk ö sydost om Själland, med den höga branten Møns klint mot havet.']],
    'Bukow': [[0, A, 'En stad i Mecklenburg, som hör till hertigdömet sedan 1348.']],
    'Stora Karlsö': [[0, A, 'En ö med branta klippor sex kilometer utanför Gotlands västkust. Marmor från ön har fraktats till kyrkbyggen på Gotland.']],
    'Odensala': [[0, A, 'En socken med medeltida ursprung i Uppland, nordost om Sigtuna.']],
    'Hapsal': [[0, 1558, 'Hapsal ligger på Estlands västkust och har stadsrättigheter sedan 1279. Här har biskopen av Ösel-Wiek sitt säte.'], [1559, 1559, 'Hapsal ligger på Estlands västkust och har stadsrättigheter sedan 1279. År 1559 blir staden dansk.'], [1560, 1580, 'Hapsal ligger på Estlands västkust och har stadsrättigheter sedan 1279. Staden är dansk sedan 1559.'], [1581, 1581, 'Hapsal ligger på Estlands västkust och har stadsrättigheter sedan 1279. År 1581 blir staden svensk.'], [1582, 1611, 'Hapsal ligger på Estlands västkust och har stadsrättigheter sedan 1279. Staden är svensk sedan 1581.'], [1612, A, 'Hapsal ligger på Estlands västkust och har stadsrättigheter sedan 1279.']],
    'Jamburg': [[0, A, 'Jama är en fästning vid floden Luga, två mil öster om Narva, grundad 1384.']],
    'Koporje': [[0, A, 'En fästning strax söder om Finska viken, återuppbyggd av Novgorod 1297.']],
    'Ivangorod': [[0, A, 'En rysk fästning mittemot Narva, på andra sidan floden, grundad 1492.']],
    'Kastelholm': [[0, A, 'Kastelholms slott är Ålands enda medeltida borg.']],
    'Vårfruberga': [[0, 1526, 'Ett nunnekloster från 1100-talet, en mil nordväst om Strängnäs.'], [1527, 1527, 'Ett nunnekloster från 1100-talet, en mil nordväst om Strängnäs. År 1527 upplöser Gustav Vasa klostret.'], [1528, A, 'Här, en mil nordväst om Strängnäs, låg ett nunnekloster från 1100-talet. Gustav Vasa upplöste det 1527.']],
    'Brännkyrka': [[0, A, 'En socken med medeltida ursprung på Södertörn, söder om Stockholm.']],
    'Bogesund': [[0, A, 'En stad vid sjön Åsunden i Västergötland, där ridvägen från Halland går fram.']],
    'Räfsnäs': [[0, A, 'Ett gammalt fiskeläge på Rådmansös östra kust.']],
    'Stora Tuna': [[0, A, 'En socken med medeltida ursprung i Dalarna, kring Dalälven och Tunaån.']],
    'Kisa': [[0, A, 'En kyrkby i Östergötland, där Kisaån flyter ihop med Lillån.']],
    'Virserum': [[0, A, 'En kyrkby i Småland, vid Virserumssjön och Virserumsån.']],
    'Halmstad': [[0, 1645.61, 'En hamnstad vid Nissans mynning i Halland. Halland tillhör Danmark.'], [1645.62, A, 'En hamnstad vid Nissans mynning i Halland.']],
    'Varberg': [[0, 1565.65, 'Varbergs fästning står på en klippa vid Kattegatt i Halland och tillhör Danmark.'], [1565.66, 1569.86, 'Svenskarna har tagit Varbergs fästning.'], [1569.87, 1645.61, 'Danskarna har tagit tillbaka Varbergs fästning efter en belägring.'], [1645.62, A, 'Varbergs fästning står på en klippa vid Kattegatt i Halland.']],
    'Axtorna': [[0, A, 'En by i Köinge socken i Halland.']],
    'Mared': [[0, A, 'En plats i Halland, söder om Oskarström.']],
    'Wenden': [[0, A, 'En stad vid floden Gauja med en medeltida borg.']],
    'Wesenberg': [[0, A, 'En handelsstad i Estland med stadsrättigheter sedan 1302 och en borg från 1223.']],
    'Kexholm': [[0, A, 'Korela är en befäst stad vid Vuoksen, några kilometer från dess utlopp i Ladoga.']],
    'Brunnbäck': [[1521, A, 'Vid Brunnbäck nära Krylbo finns en färjeplats över Dalälven.']],
    'Bornholm': [[0, 1524, 'En dansk ö i södra Östersjön, med klippor längs kusten.'], [1525, 1525, 'En dansk ö i södra Östersjön, med klippor längs kusten. År 1525 pantsätts ön till Lübeck på femtio år.'], [1526, 1574, 'En dansk ö i södra Östersjön, med klippor längs kusten. Sedan 1525 är ön pantsatt till Lübeck.'], [1575, A, 'En dansk ö i södra Östersjön, med klippor längs kusten.']],
    'Lima': [[0, A, 'En socken med medeltida ursprung i Dalarna, kring Västerdalälven.']],
    'Sälen': [[0, A, 'Ett område med fäbodar vid Västerdalälven i Dalarna.']],
    'Kivinebb': [[0, A, 'En kyrksocken på Karelska näset, som skildes från Äyräpää i början av 1400-talet.']],
    'Teusina': [[0, A, 'En by i Ingermanland, nära Ivangorod.']],
    'Riga': [[0, A, 'Riga ligger vid floden Daugava nära Rigabukten. Staden är med i Hansan sedan 1282 och är Baltikums viktigaste handelsstad.']],
    'Kirkholm': [[0, A, 'En plats i Livland, omkring 25 kilometer sydost om Riga.']],
    'Skultuna': [[0, 1606, 'Vid Svartån i Skultuna driver forsarna en kronokvarn och en såg.'], [1607, 1607, 'Vid Svartån i Skultuna driver forsarna en kronokvarn och en såg. År 1607 anlägger kung Karl IX ett mässingsbruk här.'], [1608, A, 'Kung Karl IX har anlagt ett mässingsbruk i Skultuna.']],
    'Ryssby': [[0, A, 'En socken i Småland.']],
    // ---- städerna ----
    'Sigtuna': [[0, A, 'Sigtuna är rikets första stad, vid Mälaren. Dominikanernas kyrka av tegel står kvar sedan 1200-talet.']],
    'Södertälje': [[0, A, 'En stad med stadsprivilegier sedan 1300-talet, vid sundet mellan Mälaren och Östersjön.']],
    'Torshälla': [[0, A, 'En stad vid de första fallen i Eskilstunaån, där ån når Mälaren. Staden har privilegier sedan 1317.']],
    'Köping': [[0, A, 'En stad vid nordvästra Mälaren vid Köpingsån, med stadsrättigheter sedan 1474.']],
    'Trosa': [[0, A, 'En stad med stadsprivilegium från kung Karl Knutsson, sedan 1454.']],
    'Östhammar': [[1520, A, 'En stad nära kusten i norra Uppland, vid Östhammarsfjärden.']],
    'Öregrund': [[1491, A, 'En stad vid havet i norra Uppland, sedan 1491. Härifrån skeppas järnet från de uppländska järnbruken ut.']],
    'Norrtälje': [[1622, A, 'En ny stad i Roslagen, vid ån där en gevärsfaktori har anlagts.']],
    'Vaxholm': [[0, A, 'En holme i sundet mellan Vaxön och Rindö, vid farleden in till Stockholm. Här finns ett blockhus från början av 1500-talet.']],
    'Eskilstuna': [[0, 1526, 'En ort vid Eskilstunaån med johanniternas kloster, hantverkare och en kvarn.'], [1527, 1527, 'En ort vid Eskilstunaån med hantverkare och en kvarn. År 1527 stängs johanniternas kloster i Gustav Vasas reduktion.'], [1528, A, 'En ort vid Eskilstunaån med hantverkare och en kvarn. Johanniternas kloster stängdes 1527.']],
    'Avesta': [[0, A, 'Avesta ligger vid Avestaforsen i Dalälven. Strax utanför orten har det funnits en hytta sedan medeltiden.']],
    'Säter': [[0, A, 'En ort vid sjön Ljustern i Dalarna, där det har legat en kungsgård.']],
    'Nora': [[0, A, 'Nora ligger vid Norasjön och är centralort i Nora bergslag.']],
    'Lindesberg': [[0, A, 'Lindesås är en kyrkby vid Lindessjöns norra strand och centralort för handeln i Lindesbergs bergslag.']],
    'Askersund': [[0, A, 'Askersund ligger vid Alsen, Vätterns nordligaste del. Här möts tre vägar, och här finns en skyddad hamn.']],
    'Tingvalla': [[0, A, 'Tingvalla på ön i Klarälvens delta är sedan vikingatiden en viktig handelsplats.']],
    'Karlstad': [[1584, 1584, 'År 1584 grundar hertig Karl staden Karlstad på Tingvallaön i Klarälvens delta och ger den namn och stadsrättigheter.'], [1585, A, 'Karl har grundat staden Karlstad på Tingvallaön i Klarälvens delta och gett den namn och stadsrättigheter.']],
    'Bro': [[0, A, 'En hamn- och marknadsplats vid bron över Varnan, där riksvägen mellan Sverige och Norge går fram.']],
    'Broo': [[1582, 1582, 'År 1582 får Bro stadsrättigheter för att bli Värmlands centralort.'], [1583, 1583, 'Bro har fått stadsrättigheter för att bli Värmlands centralort.']],
    'Kristinehamn': [[1642, A, 'En stad vid Vänern. Hit fraktas stångjärn från Bergslagen, som skeppas vidare över Vänern.']],
    'Filipstad': [[1611.27, A, 'En ny stad i östra Värmland, med stadsprivilegier från den 6 april 1611, uppkallad efter prins Karl Filip.']],
    'Åmål': [[0, A, 'En ort i Dalsland vid Vänern.']],
    'Söderhamn': [[0, A, 'En hamnplats vid Hälsinglands kust med fiske och handel, där borgen Faxehus anlades på medeltiden.']],
    'Hudiksvall': [[1582, A, 'En ny stad i Hälsingland vid Hornåns mynning, där byarna Hudik och Vallen har slagits ihop. Här lever man av fiske, sjöfart och handel.']],
    'Norrköping': [[0, A, 'En stad sedan 1384, vid forsarna i Motala ström som driver kvarnar.']],
    'Skänninge': [[0, 1543, 'En av rikets äldsta städer, i Östergötland, med två dominikankloster.'], [1544, A, 'En av rikets äldsta städer, i Östergötland.']],
    'Västervik': [[0, 1516, 'En stad i Småland vid Gamlebyvikens mynning, i skydd av borgen Stegeholm.'], [1517, 1517, 'En stad i Småland vid Gamlebyvikens mynning. År 1517 bränner Kristian II:s danska flotta staden och borgen Stegeholm.'], [1518, 1520, 'En stad i Småland vid Gamlebyvikens mynning. Kristian II:s danska flotta brände staden och borgen Stegeholm 1517.'], [1521, 1521, 'En stad i Småland vid Gamlebyvikens mynning. År 1521 återtar Sverige borgen Stegeholm och bygger upp den igen.'], [1522, A, 'En stad i Småland vid Gamlebyvikens mynning, i skydd av borgen Stegeholm.']],
    'Vimmerby': [[0, A, 'En ort i Småland och marknadsplats för bönder från Östergötland och trakten omkring.']],
    'Eksjö': [[0, A, 'En stad i Småland med stadsrättigheter sedan 1403, där vägen mellan Linköping och Kalmar möter vägen från Västergötland.']],
    'Gränna': [[1652, A, 'En ny stad vid Vätterns östra strand, mittemot Visingsö, grundad av greve Per Brahe den yngre.']],
    'Mönsterås': [[0, A, 'En kyrkby vid kusten, fyra och en halv mil norr om Kalmar, med marknad och ting.']],
    'Hjo': [[0, A, 'En stad vid Vätterns västra strand.']],
    'Skövde': [[0, A, 'En liten stad i Västergötland, på östra sidan av Billingen.']],
    'Falköping': [[0, A, 'En stad på Falbygden mellan Ålleberg och Mösseberg, en handelsplats främst för kreatur.']],
    'Lidköping': [[0, A, 'En stad vid Lidans mynning i Vänern, med handel på sjön.']],
    'Alingsås': [[0, 1618, 'En kyrkby vid Säveån i Västergötland.']],
    'Borås': [[1621, A, 'En ny stad i Västergötland, grundad av kung Gustav II Adolf. Traktens bönder har länge sålt smide och träslöjd.']],
    'Lödöse': [[0, 1525, 'En av rikets äldsta städer, vid Göta älv, med stor handel sedan medeltiden.']],
    'Nya Lödöse': [[1473, 1546, 'En stad vid Säveåns utlopp i Göta älv, grundad 1473 av borgare från Gamla Lödöse.']],
    'Brätte': [[1585, A, 'En stad vid Vänerns sydligaste vik.']],
    'Vänersborg': [[1644, A, 'En ny stad vid Vänern.']],
    'Göteborg': [[1603, 1611, 'En ny stad vid Göta älvs mynning.'], [1621, A, 'En ny stad vid Göta älvs mynning, med kanaler och vallar efter holländsk förebild.']],
    'Kungsbacka': [[1582, 1645.61, 'En stad i Halland, som har fått tillbaka sina stadsprivilegier. Halland tillhör Danmark.'], [1645.62, A, 'En stad i Halland.']],
    'Laholm': [[0, A, 'En liten stad i Halland vid Lagans utlopp, med borgen Lagaholm.']],
    'Uddevalla': [[0, A, 'En stad i Bohuslän vid Byfjorden och Bäveåns mynning.']],
    'Marstrand': [[0, 1657, 'En stad på Marstrandsön i Bohuslän, där sillfisket styr stadens liv. Ön hör till Danmark-Norge.']],
    'Ystad': [[0, 1531, 'En hamnstad på Skånes sydkust, med ett gråbrödrakloster.'], [1532, 1532, 'En hamnstad på Skånes sydkust. År 1532 drivs gråbröderna bort från klostret.'], [1533, A, 'En hamnstad på Skånes sydkust.']],
    'Trelleborg': [[0, A, 'En stad på Söderslätt i Skåne, med handel och hantverk.']],
    'Skanör': [[0, A, 'En stad på Falsterbonäset, med en av norra Europas viktigaste marknader för sill.']],
    'Falsterbo': [[0, 1595, 'En stad på Falsterbonäset med borgen Falsterbohus. På stranden mot Skanör hålls Skånemarknaden.'], [1596, 1596, 'En stad på Falsterbonäset. År 1596 rivs borgen Falsterbohus.'], [1597, A, 'En stad på Falsterbonäset. Borgen Falsterbohus revs 1596.']],
    'Simrishamn': [[0, A, 'En hamnstad på Österlen i Skåne, viktig för trafiken till Bornholm.']],
    'Åhus': [[0, A, 'En stad vid Helge ås norra utlopp i Hanöbukten, med stadsrättigheter sedan 1326.']],
    'Vä': [[0, A, 'En gammal stad i Skåne, omtalad som stad sedan 1250-talet.']],
    'Kristianstad': [[1614, A, 'En ny fästningsstad i Skåne, grundad av den danske kungen Kristian IV efter att Vä brändes, som skydd mot svenskarna.']],
    'Ängelholm': [[1516, 1547, 'En ny stad vid Rönne å, som fått stadsprivilegier av kung Kristian II 1516.']],
    'Båstad': [[0, A, 'En stad vid Hallandsåsen, med stadsprivilegier från 1462 som förnyades 1513.']],
    'Sölvesborg': [[0, 1564.68, 'En stad i sydvästra Blekinge med stadsprivilegier sedan 1445, nedanför Sölvesborgs slott.'], [1564.69, A, 'En stad i sydvästra Blekinge med stadsprivilegier sedan 1445. Länsherren satte själv eld på Sölvesborgs slott när han flydde den 6 september 1564.']],
    'Elleholm': [[0, 1599, 'En liten stad på en holme i Mörrumsån, med stadsrättigheter sedan 1450.']],
    'Ronneby': [[0, A, 'En stad vid Ronnebyån med stadsprivilegier sedan 1387. Heliga Kors kyrka är från 1100-talet.']],
    'Lyckå': [[0, 1599, 'En liten handelsstad vid Lyckebyåns mynning.']],
    'Kristianopel': [[1599, A, 'En ny befäst stad vid Blekinges kust, anlagd av den danske kungen Kristian IV som gränsfästning mot Sverige.']],
    'Karlshamn': [[1664, A, 'En ny hamnstad i Blekinge.']],
    'Karlskrona': [[1680, A, 'En ny stad på öarna i Blekinge skärgård, där flottan har sin bas.']],
    'Nystad': [[1617, A, 'En ny stad i Egentliga Finland, grundad av kung Gustav II Adolf.']],
    'Villmanstrand': [[1649, A, 'En ny stad vid Saimens strand i Finland.']],
    'Fredrikshamn': [[1653, A, 'Veckelax Nystad är en ny stad vid Finska viken, som fått stadsrättigheter av Per Brahe den yngre.']],
    'Sala': [[0, 1623, 'En gruvby vid Sala silvergruva.'], [1624, A, 'En ny stad vid Sala silvergruva, grundad av Gustav II Adolf.']],
    // ---- namn som saknade ruta (Johannes 2026-11-28: "jag kan inte trycka på vädla?"), kontrollerade mot sv. Wikipedia, se docs/namnfakta.md ----
    'Danmark': [[0, 1522, 'Ett kungarike i Kalmarunionen tillsammans med Norge och Sverige. Skåne, Halland och Blekinge tillhör Danmark.'], [1523, 1523, 'År 1523 lämnar Sverige unionen när Gustav Vasa blir kung.'], [1524, 1536, 'Sverige lämnade unionen 1523. Skåne, Halland och Blekinge tillhör Danmark.'], [1537, 1645.61, 'Danmark och Norge har samma kung sedan 1536. Skåne, Halland och Blekinge tillhör Danmark.'], [1645.62, 1658.15, 'Danmark och Norge har samma kung. Skåne och Blekinge tillhör Danmark.'], [1658.16, A, 'Danmark och Norge har samma kung.']],
    'Norge': [[0, 1536, 'Genom Kalmarunionen har Norge kommit under danskt inflytande.'], [1537, A, 'Sedan 1536 är Norge ett landskap under den danska kronan.']],
    'Finland': [[0, A, 'Finland är en del av det svenska riket.']],
    'Polen': [[0, 1568, 'Ett kungarike i personalunion med storfurstendömet Litauen.'], [1569, 1569, 'År 1569 går Polen och Litauen samman i en realunion.'], [1570, A, 'Polen och Litauen bildar sedan 1569 en realunion, det polsk-litauiska samväldet.']],
    'Ryssland': [[0, 1599, 'Storfurstendömet Moskva har vuxit fram under senare medeltiden.'], [1600, A, 'Storfurstendömet Moskva har vuxit fram under senare medeltiden, och under 1500-talet har det vuxit österut in i Asien.']],
    'Estland': [[0, 1560, 'Reval i norra Estland styrs av Livländska orden.'], [1561, 1561, 'År 1561 ansluts norra Estland med Reval till det svenska riket.'], [1562, A, 'Norra Estland med Reval hör till Sverige sedan 1561.']],
    'Dalarna': [[0, A, 'Ett landskap i norra Svealands inland. Mitt i landskapet ligger sjön Siljan.']],
    'Gästrikland': [[0, A, 'Ett landskap i södra Norrland. Det är mest slättland, och skogen dominerar.']],
    'Uppland': [[0, A, 'Ett landskap i östra Svealand, med ärkebiskopens stad Uppsala.']],
    'Södermanland': [[0, A, 'Södermanland, även kallat Sörmland, är ett landskap i sydöstra Svealand.']],
    'Västmanland': [[0, A, 'Ett landskap i mellersta Svealand, med Bergslagen och Mälardalen. Gruvorna har sedan medeltiden gett landskapet en viktig plats i rikets ekonomi.']],
    'Närke': [[0, A, 'Ett landskap i södra Svealands inland. Mitt i det ligger Närkeslätten, bördig och uppodlad.']],
    'Värmland': [[0, A, 'Ett landskap norr om Vänern, rikt på sjöar och skogar.']],
    'Småland': [[0, A, 'Ett landskap i södra Sverige med mycket skog och många sjöar.']],
    'Hälsingland': [[0, A, 'Ett landskap i södra Norrland.']],
    'Siljan': [[0, A, 'En stor insjö mitt i Dalarna.']],
    'Västerhavet': [[0, A, 'Havet väster om Sverige: Skagerrak, Kattegatt och Öresund.']],
    'Vädla': [[0, 1516, 'En gammal bebyggelse norr om Djurgården vid Stockholm. Var den låg exakt är oklart.'], [1517, 1517, 'År 1517 besegrar Sten Sture den yngre en dansk styrka här.'], [1518, A, 'En gammal bebyggelse norr om Djurgården vid Stockholm. År 1517 besegrade Sten Sture den yngre en dansk styrka här.']],
    'Getaryggen': [[0, 1567.83, 'En höjd vid Västra Jära, 13 kilometer väster om Jönköping, nära Nissastigen.'], [1567.84, A, 'En höjd vid Västra Jära väster om Jönköping. Här besegrade Daniel Rantzaus danska här det svenska försvaret den 31 oktober 1567.']],
    'Björkenäs': [[0, 1568, 'En udde strax norr om Kalmar.'], [1569, A, 'En udde strax norr om Kalmar. Skeppsgården här är en av kronans största.']],
    'Dalarö': [[0, 1564.41, 'En skärgårdsort vid stora farleden söderifrån mot Stockholm.'], [1564.42, A, 'En skärgårdsort vid stora farleden söderifrån mot Stockholm. I maj 1564 samlades den svenska flottan här inför sjöslaget vid Öland.']],
    'Plussa': [[0, 1583.60, 'En biflod till Narvafloden, som rinner ut i den strax ovanför staden Narva.'], [1583.61, 1585.96, 'En biflod till Narvafloden. Här slöts den 10 augusti 1583 ett stillestånd på tre år mellan Sverige och Ryssland.'], [1585.97, A, 'En biflod till Narvafloden. Här slöts stillestånd den 10 augusti 1583 och igen den 19 december 1585, då på fyra år.']],
    'Nokia': [[0, 1596, 'Nokia gård i Finland.'], [1597, A, 'Vid Nokia gård besegrades klubbekrigets huvudstyrka under Jacob Ilkka den 31 december 1596.']],
    'Ölands norra udde': [[0, 1564.41, 'En udde i Böda socken på norra Öland.'], [1564.42, 1564.62, 'Den 30–31 maj 1564 vann den dansk-lybska flottan ett sjöslag här, och det svenska flaggskeppet Mars sprang i luften.'], [1564.63, 1566.57, 'I augusti 1564 vann den svenska flottan ett sjöslag här och tog tre danska skepp.'], [1566.58, A, 'Den 26 juli 1566 möttes flottorna här igen, och slaget slutade utan att någon sida vann.']]
  };
  if (N['Brunnbäck']) N['Brunnbäcks färja'] = N['Brunnbäck']; if (N['Åsunden']) N['Åsundens is'] = N['Åsunden'];
  // lägg bara till där ortfakta.js inte redan har något
  for (const k in N) if (!V.OrtFakta.F[k]) V.OrtFakta.F[k] = N[k];
})();

// ---- läget just nu, efter spelets steg (Johannes 2026-11-28: "är uppsala danskt här? Jag vill att inforutorna ska ändras med vad som händer ...
// Danskarna har tagit det, så står det, är det svenskt så ska det stå, så att rutorna ändras under spelets gång hela tiden") ----
// Överst i rutan: vem som håller orten nu, vad som just har hänt där, och vad som är på väg att hända. Räknas fram ur världens steg varje gång rutan öppnas.
(function () {
  'use strict';
  const V = window.VASA; if (!V.OrtFakta) return;
  function platsId(namn) {
    const D = V.DATA, L = V.Levande, R = V.Rike;
    const b = D.BASER.find(q => q.namn === namn); if (b) return b.id;
    if (L && L.NAMN) for (const id in L.NAMN) if (L.NAMN[id] === namn) return id;
    if (L && L.ORT) for (const id in L.ORT) if (L.ORT[id][2] === namn) return id;
    if (R && R.P && V.UI) for (const id in R.P) if (V.UI.platsnamn(id) === namn) return id;
    return null;
  }
  function forsta(t) { const m = (t || '').split(/(?<=\.)\s+/); return m[0] || ''; }
  function lage(namn) {
    const G = V.Game, D = V.DATA, S = G && G.s; if (!S || !D.UPPDRAG) return [];
    const id = platsId(namn); if (!id) return [];
    const steg = D.UPPDRAG, ut = []; let senast = -1, kvar = null;
    steg.forEach((u, i) => { if (u.plats !== id) return; if (i < S.nasta) { senast = i; } else if (kvar === null) kvar = i; });
    if (S.bas && S.bas[id]) ut.push('Du håller ' + namn + '.');
    else if (V.Agare) { const a = V.Agare(id); if (a[1]) ut.push((a[0] === 'ryssland' ? 'Ryssarna' : 'Danskarna') + ' håller ' + namn + '.'); }          // samma regel som flaggan på orten (orter.js), bara det källorna säger
    if (senast >= 0 && S.nasta - senast <= 6) { const u = steg[senast], k = forsta(u.kronika || u.efter || ''); if (k) ut.push(k); }
    if (kvar !== null && kvar === S.nasta) { const u = steg[kvar]; ut.push((S.aktivt ? 'Just nu: ' : 'Härnäst: ') + u.titel.charAt(0).toLowerCase() + u.titel.slice(1) + '.'); }
    // personerna i historien som står här nu
    const L = V.Levande, p = L && L.figs ? L.figs.filter(f => f.syns && f.k >= 0 && !f.leg && f.d.stopp[f.k] && f.d.stopp[f.k][2] === id).map(f => f.d.namn) : [];
    if (p.length) ut.push((p.length > 1 ? p.slice(0, -1).join(', ') + ' och ' + p[p.length - 1] + ' är' : p[0] + ' är') + ' här.');
    return ut;
  }
  // efter ortfakta.js har ritat rutan: lägg läget överst (dess egen läges-rad för egna städer står kvar)
  document.addEventListener('click', ev => {
    const el = ev.target && ev.target.closest ? ev.target.closest('.ortnamn') : null; if (!el) return;
    const namn = el.textContent.trim();
    setTimeout(() => {
      const r = document.querySelector('.ortfakta'); if (!r || r._lage) return; r._lage = 1;
      let rader = []; try { rader = lage(namn); } catch (e) { rader = []; }
      if (!rader.length) return;
      const p = document.createElement('p'); p.className = 'lage'; p.textContent = rader.join(' ');
      r.querySelector('b').after(p);          // en egen stad har dessutom ortfakta.js rad med nivån under
    }, 0);
  }, true);
  V.NamnLage = lage;
})();

// ---- Mer om personen (Johannes 2026-11-28: "när man trycker på denna så ska de finnas en mer info knapp om karaktären här så man kan läsa ännu mer
// om man vill, så man får koll på vem det är, vad den har för impakt och vad som sker") ----
// Personrutan (levande.js mer()) får en knapp. Den visar vem personen är och vilken betydelse den har just nu (efter året), i nutid och utan källor.
(function () {
  'use strict';
  const V = window.VASA, A = 9999;
  // Varje rad är kontrollerad mot svenska Wikipedia 2026-11-28 och säger bara det sidorna säger (Johannes: "Du får ALDRIG gissa något i detta spelet").
  // Källa per person: docs/namnfakta.md. Varje rad gäller från sitt datum till nästa rads datum; null = ingen text då.
  // Datumet är dagen efter händelsen, eller början av nästa månad när källan bara säger månaden, så att ingen rad säger något innan det har hänt.
  const D = (ar, man, dag) => ar + (man - 1 + ((dag || 1) - 1) / 30) / 12;          // samma räkning som kalendern (år + (månad - 1) / 12)
  const P = {
    gustavE: { vem: 'Han är en ung adelsman av Vasaätten, son till riksrådet Erik Johansson.', b: [
      [0, 'Hans far Erik Johansson är svåger till Sten Sture den yngre.'],
      [D(1520, 11, 10), 'Hans far och hans svåger Joakim Brahe har avrättats i Stockholms blodbad den 8–9 november 1520.'],
      [D(1520, 11, 26), 'Hans far och hans svåger avrättades i Stockholms blodbad. Den 25 november 1520 gav han sig av till Dalarna för att samla motstånd mot Kristian II.']] },
    kristian: { vem: '', b: [
      [0, 'Han är son till kung Hans av Danmark och tronföljare i Danmark och Norge.'],
      [D(1513, 2, 21), 'Han är kung av Danmark och Norge och anser sig ha rätt till den svenska tronen.'],
      [D(1520, 2, 4), 'Han är kung av Danmark och Norge. I januari 1520 har hans här gått in i Sverige, och Sten Sture den yngre har dött den 3 februari.'],
      [D(1520, 3, 7), 'Han är kung av Danmark och Norge. Den 6 mars 1520 har svenska riksråd i Uppsala erkänt honom som kung, men Stockholm står emot.'],
      [D(1520, 9, 8), 'Han är kung av Danmark och Norge, och hösten 1520 har Stockholm gett upp mot ett löfte om amnesti.'],
      [D(1520, 11, 5), 'Han har hyllats på Brunkeberg den 1 november 1520 och krönts till svensk kung i Stockholm den 4 november.'],
      [D(1520, 11, 10), 'Han har krönts till svensk kung i Stockholm den 4 november 1520, och den 8–9 november har Sten Stures anhängare avrättats i Stockholms blodbad.'],
      [D(1521, 2, 1), 'Han är svensk kung, men bönder i Småland och Dalarna gör uppror mot honom.'],
      [D(1521, 8, 24), 'Han är kung av Danmark och Norge. I augusti 1521 har Gustav Eriksson blivit riksföreståndare i Sverige.'],
      [D(1523, 1, 1), 'Han är kung av Danmark och Norge, men i januari 1523 gör man uppror mot honom på Jylland.'],
      [D(1523, 4, 14), 'Han lämnade Danmark den 13 april 1523 och har förlorat makten i både Sverige och Danmark.']] },
    trolle: { vem: 'Han kommer från adelssläkten Trolle.', b: [
      [0, null],
      [D(1515, 7, 1), 'Han är ärkebiskop i Uppsala.'],
      [D(1516, 1, 1), 'Han är ärkebiskop i Uppsala och har sedan 1515 en tvist med riksföreståndaren Sten Sture den yngre.'],
      [D(1516, 10, 1), 'Han är ärkebiskop i Uppsala, och Sten Sture belägrar hans borg Almarestäket.'],
      [D(1517, 12, 1), 'Han är avsatt som ärkebiskop.'],
      [D(1520, 9, 8), 'Kristian II har erövrat Sverige, och under hösten 1520 återinsätts han som ärkebiskop i Uppsala.'],
      [D(1520, 11, 5), 'Han är ärkebiskop i Uppsala och har krönt Kristian II i Storkyrkan den 4 november 1520.'],
      [D(1520, 11, 10), 'Han är ärkebiskop i Uppsala och har krönt Kristian II. Hans anklagelser om kätteri mot Sten Stures anhängare blev grunden för avrättningarna i Stockholms blodbad den 8–9 november.'],
      [D(1521, 1, 1), 'Han är ärkebiskop i Uppsala.'],
      [D(1521, 10, 1), 'Efter upproren i Småland och Dalarna har han tvingats fly, och i september 1521 kom han till Danmark. Där stannar han och fortsätter att kämpa för Kristians sak.']] },
    kristina: { vem: 'Hon är dotter till Nils Eriksson och kommer från adelssläkten Gyllenstierna.', b: [
      [0, 'Hon är gift med Sten Sture den yngre.'],
      [D(1512, 7, 24), 'Hon är gift med riksföreståndaren Sten Sture den yngre.'],
      [D(1520, 2, 4), 'Hennes man Sten Sture den yngre har dött av sina sår den 3 februari 1520. Hon leder försvaret av Stockholm mot Kristian II.'],
      [D(1520, 9, 8), 'Hösten 1520 har hon gett upp Stockholm mot ett löfte om amnesti.'],
      [D(1520, 11, 10), 'Hon är änka efter Sten Sture den yngre och hålls fången på Stockholms slott.'],
      [D(1521, 9, 1), 'Hon är fånge hos Kristian II. Sommaren 1521 har hennes söner och hennes mor förts till Danmark.'],
      [D(1521, 10, 1), 'Hon sitter fången i Danmark, dit hon fördes hösten 1521.'],
      [D(1524, 1, 1), 'I januari 1524 får hon lov att återvända till Sverige.'],
      [D(1524, 1, 29), 'Hon är fri och är tillbaka i Sverige med sin äldste son Nils.']] },
    slagheck: { vem: 'Han är en präst från Westfalen i kung Kristian II:s tjänst.', b: [
      [0, null],
      [D(1520, 11, 10), 'Han sägs ha inspirerat de hårda domarna vid Stockholms blodbad.'],
            [D(1521, 1, 2), 'Han är biskop i Skara och leder det regeringsråd som styr Sverige medan kungen är borta. Han är illa omtyckt i Sverige.'],
      [D(1521, 9, 1), 'Hösten 1521 reser han tillbaka till Danmark.'],
      [D(1521, 12, 1), 'Han har rest tillbaka till Danmark och är ärkebiskop i Lund.'],
      [D(1522, 1, 25), 'Han har bränts levande i Köpenhamn den 24 januari 1522.']] },
    norby: { vem: 'Han är en dansk sjöofficer.', b: [
      [0, 'Han tjänar den danske kungen till sjöss och har kaparbrev mot fiendens skepp.'],
      [D(1517, 5, 1), 'Han är kung Kristians amiral och länsherre på Gotland sedan april 1517. Från Visby härjar han i Östersjön mot svenska och tyska skepp.'],
      [D(1520, 9, 8), 'Han är dansk amiral och länsherre på Visborg. Han har blockerat Stockholm från sjösidan och hjälpt Kristian II att erövra staden.'],
      [D(1520, 11, 5), 'Han är dansk amiral och länsherre på Visborg. Han hjälpte Kristian II att erövra Stockholm, bar spiran vid kungens kröning och dubbades då till riddare. I augusti 1519 intog han Borgholm på Öland.'],
      [D(1523, 1, 1), 'Han håller Gotland för Kristian II.'],
      [D(1523, 4, 1), 'Han är ensam bland länsherrarna om att vara trogen Kristian II. Han håller Gotland och tar hanseatiska handelsskepp.'],
      [D(1525, 1, 1), 'År 1525 tar hans folk Sölvesborg och Åhus, och bönderna i Blekinge och Skåne sluter upp kring honom.'],
      [D(1526, 1, 1), 'År 1525 tog hans folk Sölvesborg och Åhus, och bönderna i Blekinge och Skåne slöt upp kring honom.'],
      [D(1527, 1, 1), 'Hans flotta har förstörts, och han har flytt österut.']] },
    johan: { vem: 'Han är Gustav Vasas son.', b: [
      [0, null],
      [D(1556, 6, 28), 'Han är hertig av Finland.'],
      [D(1562, 1, 1), 'Han är hertig av Finland, med ett eget hertigdöme. Han blandar sig i Livland och söker Polens hjälp.'],
      [D(1562, 11, 1), 'Han är hertig av Finland. I oktober 1562 har han gift sig med den polska prinsessan Katarina Jagellonica, mot sin bror kung Eriks vilja, och Erik misstänker honom för förräderi.'],
      [D(1563, 7, 1), 'I juni 1563 har ständerna dömt honom för landsförräderi, och han belägras på Åbo slott.'],
      [D(1563, 9, 1), 'Han gav sig fången i augusti 1563 och hålls fången på Gripsholm.'],
      [D(1567, 12, 1), 'Hösten 1567 släpptes han ur fångenskapen på Gripsholm, och i november fick han bo på Arboga kungsgård.'],
      [D(1568, 8, 1), 'I juli 1568 har han, hans bror Karl och delar av adeln rest sig mot kung Erik.'],
      [D(1568, 10, 1), 'Stockholms portar öppnades för hertigarna den 29 september 1568. Erik är tillfångatagen, och han har låtit hylla sig som kung.'],
      [D(1569, 2, 1), 'Han är kung. Riksdagen erkände honom i januari 1569.'],
      [D(1569, 7, 11), 'Han är kung och kröntes i Uppsala den 10 juli 1569.'],
      [D(1592, 11, 18), 'Han dog i Stockholm den 17 november 1592.']] },
    rantzau: { vem: 'Han är en holsteinsk adelsman.', b: [
      [0, 'Han har tjänat hertig Adolf av Holstein och kejsar Karl V.'],
      [D(1563, 1, 1), 'Han har tjänat hertig Adolf av Holstein och kejsar Karl V och är dansk överste sedan 1562.'],
      [D(1565, 10, 21), 'Han är dansk överste och har besegrat den svenska hären vid Axtorna den 20 oktober 1565, trots att han hade färre män.'],
      [D(1567, 1, 1), 'Han är dansk överste. År 1566 härjade han i Västergötland men stoppades av Charles de Mornay vid Brobacka.'],
      [D(1567, 11, 1), 'Vintern 1567–1568 leder han ett härtåg genom Småland och Östergötland, djupt in i riket.'],
      [D(1568, 3, 1), 'Han har tvingats till återtåg.'],
      [D(1569, 11, 12), 'Han dödades av en kanonkula vid belägringen av Varbergs fästning den 11 november 1569.']] },
    karin: { vem: '', b: [
      [0, null],
      [D(1565, 1, 1), 'Hon är en ung kvinna av enkel börd vid kung Eriks hov.'],
      [D(1565, 4, 1), 'Hon är kammarjungfru vid hovet och kung Eriks erkända älskarinna, med egna tjänare.'],
      [D(1567, 7, 14), 'Hon är kung Eriks erkända älskarinna, och den 13 juli 1567 gifte de sig troligen i hemlighet.'],
      [D(1568, 7, 6), 'Hon har gift sig med kungen den 4 juli 1568 och krönts till drottning dagen efter. Högadeln ser ogillande på giftermålet.'],
      [D(1568, 10, 1), 'Hon är fånge tillsammans med sin avsatte make Erik.']] },
    delagardie: { vem: 'Han är en svensk fältherre, född i Reval 1583, son till Pontus De la Gardie.', b: [
      [0, null],
      [D(1602, 4, 1), 'Han har försvarat Wolmar mot polackerna och tagits till fånga när staden föll.'],
      [D(1606, 1, 1), 'Han är fri ur polsk fångenskap och tjänar i Nederländerna under Moritz av Oranien.'],
      [D(1609, 1, 1), 'Han leder de trupper som kung Karl har skickat till hjälp åt tsar Vasilij Sjujskij mot Polen.'],
      [D(1610, 4, 1), 'Han har intagit Moskva i mars 1610 tillsammans med Skopin-Sjujskij.'],
      [D(1610, 9, 1), 'Efter nederlaget vid Klusjino den 24 juni 1610 har han tagit sig tillbaka till svenska gränsen med en liten styrka.'],
      [D(1611, 4, 1), 'Han har intagit Kexholm i mars 1611.'],
      [D(1611, 7, 17), 'Han har intagit Novgorod den 16 juli 1611.']] },
    gustavadolf: { vem: 'Han är Karls son, född i december 1594.', b: [
      [0, null],
      [D(1602, 1, 1), 'Johan Skytte är hans lärare.'],
      [D(1604, 3, 23), 'Han är kronprins och tronföljare.'],
      [D(1611, 10, 31), 'Hans far kung Karl dog den 30 oktober 1611, och han är arvinge till kronan.'],
      [D(1611, 12, 27), 'Ständerna hyllade honom som kung den 26 december 1611.']] },
    karl: { vem: 'Han är Gustav Vasas yngste son.', b: [
      [0, null],
      [D(1562, 1, 1), 'Han är hertig över större delen av Södermanland och Närke och hela Värmland. Arboga artiklar från 1561 begränsar hertigdömena.'],
      [D(1570, 1, 1), 'Han är hertig över större delen av Södermanland och Närke och hela Värmland. Kung Johan III har bekräftat hertigdömet utan Arboga artiklars inskränkningar.'],
      [D(1578, 1, 1), 'Han är hertig. Han vägrar införa kung Johans nya liturgi och tar emot präster som motsätter sig kungens kyrkopolitik.'],
      [D(1592, 11, 18), 'Efter Johan III:s död styr han riket tillsammans med rådet.'],
      [D(1594, 9, 1), 'Medan kung Sigismund är i Polen är han riksföreståndare tillsammans med rådet, och han och Sigismund är i konflikt.'],
      [D(1598, 9, 26), 'Han har besegrat kung Sigismund vid Stångebro den 25 september 1598.'],
      [D(1599, 7, 25), 'Riksdagen har avsatt Sigismund, och sedan den 24 juli 1599 är han riksföreståndare.'],
      [D(1603, 9, 1), 'Han styr riket sedan Sigismund avsattes 1599.'],
      [D(1604, 3, 23), 'Han är kung av Sverige.'],
      [D(1607, 3, 16), 'Han är kung av Sverige och krönades i Uppsala domkyrka den 15 mars 1607.'],
      [D(1611, 10, 31), 'Han dog den 30 oktober 1611.']] },
    fleming: { vem: '', b: [
      [0, null],
      [D(1591, 1, 1), 'Han är riksamiral och hövitsman över Finland och Estland, och han leder kriget mot Ryssland.'],
      [D(1592, 11, 18), 'Han är riksamiral och hövitsman över Finland och Estland. Efter Johan III:s död sluter han sig till kung Sigismund mot hertig Karl.'],
      [D(1595, 1, 1), 'Han är riksmarsk och lyder bara kung Sigismund. Han trotsar hertig Karls och rådets order och håller Finland och sin flotta.'],
      [D(1597, 1, 1), 'Han lyder bara kung Sigismund och håller Finland. Han slog ner böndernas uppror vid Nokia den 31 december 1596.'],
      [D(1597, 2, 25), 'Han lyder bara kung Sigismund och håller Finland. Böndernas uppror har krossats vid Ilmola den 24 februari 1597.'],
      [D(1597, 4, 14), 'Han dog i Pojo den 13 april 1597.']] },
    erik: { vem: 'Han är Gustav Vasas äldste son.', b: [
      [0, null],
      [D(1559, 1, 1), 'Han är tronföljare, lärd och musikalisk, och han planerar att gifta sig med drottning Elisabet I av England.'],
      [D(1560, 9, 30), 'Han är kung. Han misstror högadeln, och sekreteraren Jöran Persson är hans främste förtrogne.'],
      [D(1561, 6, 30), 'Han är kung och kröntes i Uppsala domkyrka den 29 juni 1561. Han misstror högadeln, och sekreteraren Jöran Persson är hans främste förtrogne.'],
      [D(1568, 10, 1), 'Han är fånge hos sina bröder Johan och Karl.'],
      [D(1569, 1, 27), 'Han avsattes den 26 januari 1569 och hålls fången.'],
      [D(1577, 2, 27), 'Han dog i fångenskapen på Örbyhus den 26 februari 1577.']] },
    hDansk0: { vem: 'Det är kung Kristian II:s här.', b: [
      [0, 'Kung Kristian II vill föra Sverige tillbaka in i unionen.'],
      [D(1519, 12, 1), 'Hären är legoknektar från bland annat Pommern, Brandenburg och Sachsen. Kung Kristian II vill med den föra Sverige tillbaka in i unionen.'],
      [D(1521, 1, 1), 'Större delen av hären har återvänt till Danmark med kungen.']] },
    hDansk1: { vem: 'Det är kung Kristians knektar i Sverige.', b: [
      [0, 'De håller slotten i Stockholm, Kalmar, Stegeborg, Västerås och Örebro.'],
      [D(1521, 12, 25), 'Stegeborg har fallit till upprorsmännen. Kungens knektar håller ännu slotten i Stockholm, Kalmar och Västerås.'],
      [D(1522, 1, 31), 'Västerås slott har fallit. De håller Stockholm och Kalmar, och utan örlogsskepp och tungt artilleri kan Gustav inte ta dem.'],
      [D(1523, 5, 28), 'De håller Stockholm, och om Kalmar slott strids det.'],
      [D(1523, 6, 21), 'Stockholm har gett sig i juni 1523, och samma sommar ger sig Kalmar slott.'],
      [D(1523, 7, 8), 'Stockholm och Kalmar har gett sig sommaren 1523.']] },
    hDansk2: { vem: 'Det är den danske kungens här i det nordiska sjuårskriget.', b: [
      [0, 'Danmark är missnöjt med att unionen har upplösts och håller Sverige under blockad i Östersjön och Västerhavet.']] },
    fDansk2: { vem: 'Det är den danske kungens örlogsflotta.', b: [
      [0, null],
      [D(1563, 5, 1), 'Den seglar in i Östersjön i maj 1563, och Danmark håller Sverige under blockad.']] },
    fLubeck1: { vem: 'Det är Lübecks örlogsskepp.', b: [
      [0, null],
      [D(1522, 5, 1), 'Lübeck hjälper riksföreståndaren Gustav Eriksson mot danskarna och vill kunna handla utan den danske kungens hinder.']] },
    fLubeck2: { vem: 'Det är Lübecks örlogsskepp.', b: [
      [0, null],
      [D(1534, 6, 1), 'Lübeck vill hålla nederländska köpmän borta från Östersjön och få makt i Norden genom att sätta tillbaka Kristian II.'],
      [D(1535, 6, 10), 'Den lybska flottan har besegrats vid Bornholm den 9 juni 1535 av en dansk-svensk flotta.'],
      [D(1536, 7, 30), 'Grevefejden är slut, och Köpenhamn har fallit.']] },
    hDacke: { vem: 'Det är bönder från Småland under Nils Dacke.', b: [
      [0, 'De är missnöjda med kungens skatter och kyrkopolitik.'],
      [D(1542, 1, 1), 'År 1542 reser de sig mot kungens skatter och kyrkopolitik.'],
      [D(1542, 11, 9), 'Vid Kisa har kungens styrkor lidit ett hårt nederlag. Efter fredsuppgörelsen den 8 november 1542 styr Dacke Småland utom Kalmar och Jönköping och återinför den katolska gudstjänsten.'],
      [D(1543, 1, 1), 'Kungens trupper slår tillbaka. Det avgörande slaget står på isarna vid Virserum.'],
      [D(1543, 9, 1), 'Dacke har skjutits och stupat sommaren 1543.']] },
    hRysk3: { vem: 'Det är tsarens här.', b: [
      [0, 'Ryssland har tagit Dorpat och Narva och strider om Livland.'],
      [D(1579, 1, 1), 'Polen-Litauen under Stefan Batory vinner mot Ryssland i Livland.'],
      [D(1583, 1, 1), 'Ryssland har förlorat sina livländska områden i stilleståndet med Polen 1582.']] },
    hPolsk3: { vem: 'Det är Polens här i kriget om Livland.', b: [
      [0, 'Polen och Ryssland strider om Livland.'],
      [D(1578, 10, 22), 'Den 21 oktober 1578 har en förenad svensk-polsk armé besegrat en rysk armé i grunden vid Wenden.']] },
    hPolsk4: { vem: 'Det är kung Sigismunds här.', b: [
      [0, 'Den är omkring 5 000 man: tyska, kroatiska och ungerska legoknektar och det polska gardet. Med den vill kungen ta tillbaka sin makt i Sverige.'],
      [D(1598, 7, 31), 'Den 30 juli 1598 har hären gått i land vid Avaskär. Den är omkring 5 000 man: tyska, kroatiska och ungerska legoknektar och det polska gardet.'],
      [D(1598, 9, 26), 'Kungens här har besegrats av hertig Karl vid Stångebro den 25 september 1598.'],
      [D(1599, 7, 25), 'Riksdagen 1599 har avsatt kung Sigismund.']] },
    hKarl: { vem: 'Det är hertig Karls här, soldater och beväpnade bönder.', b: [
      [0, null],
      [D(1598, 7, 1), 'Sommaren 1598 sätter hertig Karl upp en egen här på ett par tusen man mot kung Sigismund.'],
      [D(1598, 9, 26), 'De strider för hertigen mot kung Sigismund och har segrat vid Stångebro den 25 september 1598.']] },
    hFinsk: { vem: 'Det är knektarna i Finland.', b: [
      [0, 'De håller Finland för kung Sigismund under Klas Fleming.'],
      [D(1597, 4, 14), 'Klas Fleming dog i april 1597. De håller Finland för kung Sigismund.'],
      [D(1598, 6, 1), 'De håller Finland för kung Sigismund under ståthållaren Arvid Stålarm.'],
      [D(1598, 8, 1), 'Under ståthållaren Arvid Stålarm har de landstigit i Uppland, en vecka före kungens landstigning, för att inta Stockholm.'],
      [D(1600, 1, 1), 'Hertig Karl har erövrat Finland från Sigismunds anhängare.']] },
    hKlubbor: { vem: 'Det är bönder i Österbotten.', b: [
      [0, 'De klagar hos hertig Karl över knektarna som ligger i borgläger på deras gårdar.'],
      [D(1596, 12, 1), 'De har rest sig mot knektarna, som ligger i borgläger på deras gårdar och kräver deras mat.'],
      [D(1597, 2, 25), 'Upproret har krossats vid Ilmola den 24 februari 1597, och upprorsledaren Ilkka har avrättats.']] }
  };
  function ar() { try { return V.kalender ? V.kalender().ar : 1520; } catch (e) { return 1520; } }
  function tid() { try { const d = V.Game.datum(); return d.ar + (d.man - 1) / 12; } catch (e) { return ar(); } }
  // raden som gäller är den sista som har börjat; utan text för den tiden får personen ingen Läs mer
  function text(id) { const p = P[id]; if (!p) return null; const Y = tid(), f = p.b.filter(q => q[0] <= Y), r = f.length ? f[f.length - 1][1] : null; if (!r && !p.vem) return null; return p.vem ? [p.vem, r || ''] : [r, '']; }
  function koppla() {
    const L = V.Levande; if (!L || !L.mer || L._merOm) return; L._merOm = 1;
    const fore = L.mer;
    L.mer = function (f) {
      const r = fore.apply(this, arguments);
      try {
        const t = text(f.d.id), ruta = document.getElementById('ruta'), stang = ruta && ruta.querySelector('.stang'); if (!t || !stang) return r;
        const knapp = document.createElement('button'); const bok = (V.UI && V.UI.IK && V.UI.IK.bok) || '';
        // Samma knapp som Läs mer i stegrutan, uppe till höger i rutan (Johannes 2026-11-28: "gör den som de andra mer info ser ut så det blir enhetligt genom spelet")
        knapp.innerHTML = bok + 'Läs mer'; knapp.title = 'Mer om ' + f.d.namn;
        knapp.style.cssText = 'position:absolute;right:10px;top:10px;display:inline-flex;align-items:center;gap:4px;width:auto;margin:0;padding:2px 8px 2px 5px;font-size:11.5px;font-weight:600;letter-spacing:.03em;color:#2b1c08;background:linear-gradient(180deg,#fbf0cf,#e3cc8e);border:1px solid #8a6a1f;border-radius:10px;box-shadow:0 2px 5px rgba(0,0,0,.45);cursor:pointer;text-shadow:none';
        const svg = knapp.querySelector('svg'); if (svg) { svg.style.width = '15px'; svg.style.height = '15px'; }
        const inre = ruta.querySelector('.ruta-in'); if (inre) inre.style.position = 'relative';
        knapp.addEventListener('click', ev => {
          ev.stopPropagation();
          // samma ordning och samma centrerade text för alla: vem det är, vad det betyder, vad som sker just nu (Johannes: "texten är olika? endel längs sidan och endel i mitten")
          const nuEl = ruta.querySelector('.ruta-in > p:not(.mal)'), nu = nuEl ? nuEl.innerHTML : '';
          const del = document.createElement('div'); del.style.textAlign = 'center';
          del.innerHTML = '<p></p>' + (nu ? '<p class="nu"></p>' : '');          // löpande text utan rubriker (Johannes 2026-11-28: "det fattar man när man läser ändå")
          const ps = del.querySelectorAll('p'); ps[0].textContent = t[0] + (t[1] ? ' ' + t[1] : ''); if (nu) del.querySelector('.nu').innerHTML = nu;
          if (nuEl) nuEl.remove(); stang.before(del); knapp.remove(); if (L.lanka) try { L.lanka(ps[0]); } catch (e) { /* inget */ }
        });
        (inre || ruta).appendChild(knapp);
      } catch (e) { /* rutan står som förut */ }
      return r;
    };
  }
  document.addEventListener('DOMContentLoaded', koppla); setTimeout(koppla, 0);
  V.PersonFakta = { P, text };
})();

// ---- Samlade namn (Johannes 2026-11-28: "när de är många på samma plats så tar de lite mycket plats av bilden, kan vi lösa det på något sätt?") ----
// Står flera personer och härar på samma ställe på skärmen blir deras skyltar en liten bricka ("4 här") när kartan är utzoomad.
// Ett tryck på brickan fäller ut namnen en stund. Närzoomat visas namnen som förut.
(function () {
  'use strict';
  const V = window.VASA;
  let brickor = {}, utfalld = null, utTid = 0;
  function koppla() {
    const L = V.Levande; if (!L || !L.taggar || L._samlad) return; L._samlad = 1;
    const fore = L.taggar;
    L.taggar = function (spel, golv) {
      const r = fore.apply(this, arguments);
      try { samla(spel); } catch (e) { /* skyltarna står som förut */ }
      return r;
    };
  }
  function samla(spel) {
    const L = V.Levande, box = document.getElementById('ortnamn'), c = V.Scene && V.Scene.cam; if (!box || !c) return;
    const nara = c.d < 34;          // närzoomat: inga brickor
    const syns = []; for (const f of L.figs || []) { const e = document.querySelector('.vem.annan[data-fig="' + f.d.id + '"]') || hitta(f); if (e && e.style.display === 'flex') { const sp = V.Scene.screenPoint(f.sx, V.Geo.groundAt(f.sx, f.sz) + (f.till || 2), f.sz); syns.push({ f, e, x: sp.x, y: sp.y }); } }
    // grupper: skyltar vars fötter står nära varandra på skärmen
    const grupper = []; for (const s of syns) { const g = grupper.find(q => Math.abs(q.x - s.x) < 70 && Math.abs(q.y - s.y) < 55); if (g) { g.m.push(s); g.y = Math.max(g.y, s.y); } else grupper.push({ x: s.x, y: s.y, m: [s] }); }
    if (utfalld && performance.now() > utTid) utfalld = null;
    const kvar = {};
    for (const g of grupper) {
      if (nara || !spel || g.m.length < (c.d > 90 ? 2 : 3)) continue;          // långt utzoomat räcker två
      const nyckel = g.m.map(s => s.f.d.id).sort().join(','); if (utfalld === nyckel) continue;
      kvar[nyckel] = 1; g.m.forEach(s => { s.e.style.display = 'none'; });
      let b = brickor[nyckel];
      if (!b) {
        b = brickor[nyckel] = document.createElement('div'); b.className = 'vem annan'; b.dataset.fig = 'bricka'; b.style.fontStyle = 'normal'; box.appendChild(b);
        b.innerHTML = '<b style="font-weight:600"></b><span></span>'; b.querySelector('b').textContent = g.m.length; const harar = g.m.filter(q => /^[hf][A-Z]/.test(q.f.d.id)).length; b.querySelector('span').textContent = harar === g.m.length ? ' härar' : harar ? ' personer och härar' : ' personer';
        b.title = g.m.map(s => s.f.d.namn).join(', ');
        b.addEventListener('click', ev => { ev.stopPropagation(); utfalld = nyckel; utTid = performance.now() + 9000; });
      }
      b.style.display = 'flex'; b.style.transform = 'translate(' + Math.round(g.x) + 'px,' + Math.round(g.y - 8) + 'px) translate(-50%, -100%)';
    }
    for (const k in brickor) if (!kvar[k]) brickor[k].style.display = 'none';
  }
  // skylten för en person: levande.js sparar dem inte utåt, så den hittas på namnet en gång och märks
  function hitta(f) { for (const e of document.querySelectorAll('.vem.annan:not([data-fig])')) if (e.textContent.trim() === f.d.namn) { e.dataset.fig = f.d.id; return e; } return null; }
  document.addEventListener('DOMContentLoaded', koppla); setTimeout(koppla, 0);
})();

// ---- Notiser när huvudpersonerna reser (Johannes 2026-11-28: "Någon notis vill jag ha när huvudkaraktärer rör sig, som när de seglar från stockholm
// till danmark med trolle och kristina, nån notis ska man få så man kan se och följa sånna event") ----
// När en person eller en här i historien ger sig av (levande.js) kommer en lugn rad längst ner med Visa, som för kameran dit. En rad i taget:
// de som ger sig av samtidigt på samma väg nämns i samma rad, och raden väntar tills ingen annan rad står där.
(function () {
  'use strict';
  const V = window.VASA;
  const sist = {}, ko = []; let start = 0;
  const namnPa = id => (V.UI && V.UI.platsnamn ? V.UI.platsnamn(id) : id);
  const lista = n => n.length > 1 ? n.slice(0, -1).join(', ') + ' och ' + n[n.length - 1] : n[0];
  function koppla() {
    const L = V.Levande; if (!L || !L.update || L._notis) return; L._notis = 1;
    const fore = L.update;
    L.update = function (dt, t) {
      const r = fore.apply(this, arguments);
      try { kolla(); } catch (e) { /* inga notiser */ }
      try { enaFlotta(); } catch (e) { /* inget */ }
      return r;
    };
    const initFore = L.init; L.init = function () { start = performance.now(); for (const k in sist) delete sist[k]; ko.length = 0; return initFore.apply(this, arguments); };
    setInterval(visa, 1000);
  }
  function kolla() {
    const L = V.Levande, nu = performance.now(); if (!start) start = nu;
    for (const f of L.figs || []) {
      const nyckel = f.leg ? f.k : -1, var_ = sist[f.d.id]; sist[f.d.id] = nyckel;
      if (var_ === undefined || nu - start < 4000) continue;          // läget när världen laddas är ingen nyhet
      if (!f.leg || var_ === nyckel || !f.syns) continue;
      const st = f.d.stopp, fran = st[f.k] && st[f.k][2], till = st[f.k + 1] && st[f.k + 1][2]; if (!fran || !till || fran === till) continue;
      const sjo = !!(st[f.k + 1][3] && st[f.k + 1][3].sjo), har = /^[hf][A-Z]/.test(f.d.id);
      const q = ko.find(x => x.fran === fran && x.till === till && nu - x.t < 3000);
      if (q) { if (q.n.indexOf(f.d.namn) < 0) q.n.push(f.d.namn); continue; }
      ko.push({ fran, till, sjo, har, n: [f.d.namn], f, t: nu });
    }
  }

  // Ingen flotta eller här två gånger (Johannes 2026-11-28: "lubecks flotta är dubbel nu?"): när ett steg visar sina egna skepp eller sin fiende
  // (varld.js vis), göms samma flotta eller här i den levande kartan, och dess namn följer stegets skepp och gubbar i stället.
  function enaFlotta() {
    const W = V.Varld, vis = W && W.vis ? W.vis() : null, L = V.Levande; if (!vis || !vis.u || !L) return;
    const u = vis.u, sida = u.fran === 'lubeck' || u.id === 'lubeck' ? 'lubeck' : 'sverige', P = V.Rike.P[u.plats];
    for (const f of L.figs || []) {
      if (!f.syns) continue;
      const d = f.d, sammaSteg = d.steg === u.id;
      // skeppen: stegets flotta har samma flagga, eller figuren hör till just det steget
      if (vis.skepp && vis.skepp.length && f.skeppen && f.skeppen.some(k => k.visible) && (sammaSteg || (d.flagga || 'sverige') === sida)) {
        f.skeppen.forEach(k => { k.visible = false; }); const s0 = vis.skepp.find(k => k.visible !== false) || vis.skepp[0]; f.sx = s0.position.x; f.sz = s0.position.z; continue;
      }
      // härarna: fienden i stegets slag är samma här, om den står nära platsen
      if (vis.fi && vis.fi.length && f.us && f.us.some(q => q.vis) && P && /[Dd]ansk|Rantzau/.test(u.fiende || '') && d.flagga === 'danmark' && Math.hypot(f.sx - P.x, f.sz - P.z) < 15) {
        f.us.forEach(q => { q.vis = false; }); if (f.fana) f.fana.visible = false; const m = vis.fi.find(q => !q.dod) || vis.fi[0]; f.sx = m.x; f.sz = m.z;
      }
    }
  }
  function visa() {
    if (!ko.length || V.tyst || (V.Intro && V.Intro.aktiv) || (V.Game.skede && V.Game.skede() === 'strid')) return;
    if (document.querySelector('#text .text')) return;          // en annan rad står redan där
    const q = ko[0]; if (performance.now() - q.t < 2500) return;          // vänta lite så att alla som följer med hinner komma med i raden
    ko.shift();
    const verb = q.sjo ? 'seglar' : q.har ? 'drar' : 'reser';
    const rad = lista(q.n) + ' ' + verb + ' från ' + namnPa(q.fran) + ' till ' + namnPa(q.till) + '.';
    V.UI.text(rad, 9, false, () => { try { V.Levande.gaTill({ f: q.f }); } catch (e) { /* inget */ } });
  }
  document.addEventListener('DOMContentLoaded', koppla); setTimeout(koppla, 0);
})();
