// Den levande kartan (Johannes 2026-11-28): andra personer i historien syns på kartan medan din egen berättelse pågår.
// De går runt i staden där de är, och reser vidare när det hände i verkligheten (styrs av spelets datum, G.datum()).
// Och alla orter som texterna nämner har en liten skylt på rätt plats.
(function () {
  'use strict';
  const V = window.VASA, D = V.DATA;

  // Orter som texterna nämner men som inte är egna platser i spelet: [longitud, latitud, namn]. Namn null = ingen skylt (en punkt till sjöss).
  const ORT = {
    kalo: [10.48, 56.29, 'Kalø'], jonkoping: [14.16, 57.78, 'Jönköping'], nydala: [14.43, 57.28, 'Nydala kloster'], asunden: [13.33, 57.70, 'Åsunden'],
    enkoping: [17.08, 59.64, 'Enköping'], romfartuna: [16.53, 59.72, 'Romfartuna'], dalaro: [18.40, 59.13, 'Dalarö'], falkenberg: [12.49, 56.90, 'Falkenberg'],
    bohus: [11.99, 57.86, 'Bohus'], hova: [14.21, 58.86, 'Hova'], aspeboda: [15.46, 60.58, 'Aspeboda'], rankhyttan: [15.57, 60.51, 'Rankhyttan'],
    vissefjarda: [15.58, 56.53, 'Vissefjärda'], borga: [25.66, 60.39, 'Borgå'], ekenas: [23.43, 59.97, 'Ekenäs'], raumo: [21.51, 61.13, 'Raumo'], ulvsby: [21.88, 61.43, 'Ulvsby'],
    vilnius: [25.28, 54.69, 'Vilnius'], warnemunde: [12.08, 54.17, 'Warnemünde'], mon: [12.35, 54.95, 'Mön'], bukow: [11.7, 54.12, 'Bukow'], storakarlso: [17.97, 57.29, 'Stora Karlsö'],
    odensala: [17.83, 59.66, 'Odensala'], bjorkenas: [16.33, 56.71, 'Björkenäs'], hapsal: [23.54, 58.94, 'Hapsal'], jamburg: [28.6, 59.38, 'Jamburg'], koporje: [29.03, 59.71, 'Koporje'],
    plussa: [28.3, 59.12, 'Plussa'], ivangorod: [28.24, 59.37, 'Ivangorod'], kastelholm: [19.98, 60.23, 'Kastelholm'], varfruberga: [16.93, 59.37, 'Vårfruberga'],
    kattegatt: [11.5, 57.3, null], oresund: [12.75, 55.95, null]
  };
  // Namn på platser i spelet som inte är baser (baserna har sina egna namn)
  const NAMN = { vadla: 'Vädla', brannkyrka: 'Brännkyrka', bogesund: 'Bogesund', rafsnas: 'Räfsnäs', lubeck: 'Lübeck', kopenhamn: 'Köpenhamn', malmo: 'Malmö', alvsborg: 'Älvsborg',
    soderkoping: 'Söderköping', storatuna: 'Stora Tuna', kisa: 'Kisa', virserum: 'Virserum', skara: 'Skara', strangnas: 'Strängnäs', stegeborg: 'Stegeborg', orebro: 'Örebro', arboga: 'Arboga',
    halmstad: 'Halmstad', varberg: 'Varberg', axtorna: 'Axtorna', mared: 'Mared', visby: 'Visby', getaryggen: 'Getaryggen', wenden: 'Wenden', wesenberg: 'Wesenberg', kexholm: 'Kexholm',
    orbyhus: 'Örbyhus', borgholm: 'Borgholm', drottningholm: 'Drottningholm', staket: 'Stäket', brunkeberg: 'Brunkeberg', brunnback: 'Brunnbäck', kronoberg: 'Kronoberg', bornholm: 'Bornholm',
    smaland: 'Småland', halsingland: 'Hälsingland', lima: 'Lima', salen: 'Sälen', kivinebb: 'Kivinebb', olandsudde: 'Ölands norra udde', narva: 'Narva', reval: 'Reval', nykoping: 'Nyköping',
    linkoping: 'Linköping', teusina: 'Teusina', nokia: 'Nokia', norrkoping: 'Norrköping', riga: 'Riga', kirkholm: 'Kirkholm', skultuna: 'Skultuna', novgorod: 'Novgorod', filipstad: 'Filipstad', ryssby: 'Ryssby', kristianopel: 'Kristianopel' };
  const KALLA = 'sv. Wikipedia';

  // Personerna, per värld. stopp: [år, månad, plats, { sjo: flagga på skeppet, via: [platser på vägen], mer: vad personen gör där }].
  // sok = namnet som texterna introducerar personen med; före det syns hen inte (kand = känd från start). Plats null = personen lämnar kartan. Datumen följer historien. Namnskyltarna säger bara vem det är, aldrig vad som ska hända.
  const FIG = {
    0: [
      { id: 'gustavE', namn: 'Gustav Eriksson', sort: 'gustav', sok: 'Gustav Eriksson', kalla: 'sv. Wikipedia, Gustav Vasa och Kalø', stopp: [
        [1512, 1, 'uppsala', { mer: 'Gustav Eriksson är en ung adelsman, son till riksrådet Erik Johansson. Han har gått i skola i Uppsala.' }],
        [1514, 6, 'stockholm', { mer: 'Gustav Eriksson tjänar vid Sten Stures hov i Stockholm, som många unga adelsmän.' }],
        [1518, 7.4, 'brannkyrka', { via: ['nykoping'], mer: 'Gustav Eriksson rider med Sten Stures här. Vid Brännkyrka bär han rikets fana.' }],
        [1518, 8.6, 'stockholm', { mer: 'Kristian II vill förhandla och kräver gisslan. Gustav Eriksson är en av de sex unga männen som skickas ut till honom.' }],
        [1518, 9.6, 'kopenhamn', { sjo: 'danmark', mer: 'Kristian håller inte sitt ord. Han seglar hem till Danmark med gisslan ombord, och Gustav Eriksson är fånge.' }],
        [1518, 10.6, 'kalo', { sjo: 'danmark', mer: 'Gustav Eriksson hålls fången på Kalø slott på Jylland, hos Erik Banér, en släkting till honom.' }],
        [1519, 9.3, 'lubeck', { mer: 'Gustav Eriksson rymmer från Kalø. Det berättas att han är klädd som oxdrivare. Han tar sig söderut till den fria staden Lübeck.' }],
        [1520, 5.95, 'kalmar', { sjo: 'lubeck', mer: 'Med ett lybskt skepp kommer Gustav Eriksson hem. Den 31 maj går han i land vid Stensö strax söder om Kalmar.' }],
        [1520, 6.8, 'smaland', { mer: 'Kalmar vill inte resa sig. Gustav Eriksson tar sig upp genom Småland och söker stöd hos bönderna, men få lyssnar.' }],
        [1520, 8.4, 'rafsnas', { via: ['soderkoping', 'nykoping'], mer: 'Gustav Eriksson kommer till sin fars gård Räfsnäs i Södermanland, vid Mälaren. Där väntar han på vad som ska hända med Stockholm.' }]] },
      { id: 'kristian', namn: 'Kristian II', sort: 'kristian', sok: 'Kristian', kalla: 'sv. Wikipedia, Kristian II och Slaget vid Brännkyrka', stopp: [
        [1512, 1, 'kopenhamn', { mer: 'Kristian är son till kung Hans av Danmark och tronföljare i Danmark och Norge. Han vill ha Sverige tillbaka i unionen.' }],
        [1518, 5.8, 'stockholm', { sjo: 'danmark', mer: 'Kristian II kommer själv med flotta och här och belägrar Stockholm från midsommar.' }],
        [1518, 9.5, 'kopenhamn', { sjo: 'danmark', mer: 'Belägringen har misslyckats. Kristian seglar hem till Köpenhamn med sex svenska gisslan ombord.' }],
        [1520, 5.5, 'stockholm', { sjo: 'danmark', mer: 'Kristian II kommer med sin flotta i slutet av maj, och Stockholm stängs in till lands och sjöss.' }]] },
      { id: 'trolle', namn: 'Gustav Trolle', sort: 'trolle', sok: 'Gustav Trolle', kalla: 'sv. Wikipedia, Gustav Trolle och Almarestäkets borg', stopp: [
        [1515, 6, 'uppsala', { mer: 'Gustav Trolle kommer hem från Rom som ny ärkebiskop i Uppsala, kyrkans högste man i Sverige.' }],
        [1516, 9, 'staket', { mer: 'Ärkebiskopen sitter på sin borg Stäket vid Mälaren. Han håller på unionen och Danmarks kung.' }],
        [1517, 12, 'stockholm', { mer: 'Gustav Trolle är avsatt och hålls fången.' }],
        [1520, 3, 'uppsala', { via: ['brunkeberg'], mer: 'Sten Sture är död. Gustav Trolle är fri, och Kristian vill ha honom tillbaka som ärkebiskop.' }]] },
      { id: 'kristina', namn: 'Kristina Gyllenstierna', kvinna: ['#7a2a3a', '#f2eee2'], ej: 'kristina', sok: 'Kristina', kalla: 'sv. Wikipedia, Kristina Nilsdotter (Gyllenstierna)', stopp: [
        [1512, 1, 'stockholm', { mer: 'Kristina Gyllenstierna är gift med Sten Sture och bor på Stockholms slott.' }]] }
    ],
    1: [
      { id: 'kristian', namn: 'Kristian II', sort: 'kristian', kand: 1, kalla: 'sv. Wikipedia, Kristian II och Blodbadet i Nydala', stopp: [
        [1520, 12, 'stockholm', { mer: 'Kristian II är krönt till kung av Sverige. Nu gör han sig redo att lämna Stockholm och resa hem till Danmark.' }],
        [1521, 1.6, 'jonkoping', { via: ['nykoping', 'soderkoping'], mer: 'Kristian II reser söderut genom Sverige, mot Danmark.' }],
        [1521, 2.05, 'nydala', { mer: 'Vid Nydala kloster i Småland låter Kristian avrätta abboten och flera munkar.' }],
        [1521, 2.4, 'kopenhamn', { mer: 'Kristian II är tillbaka i Köpenhamn.' }],
        [1523, 4.3, 'kattegatt', { sjo: 'danmark', mer: 'De danska stormännen har avsatt Kristian. I april 1523 lämnar han Danmark med sina skepp för att söka hjälp utomlands.' }],
        [1523, 4.7, null, {}]] },
      { id: 'trolle', namn: 'Gustav Trolle', sort: 'trolle', sok: 'Trolle', kalla: 'sv. Wikipedia, Gustav Trolle', stopp: [
        [1521, 1, 'stockholm', { mer: 'Ärkebiskop Gustav Trolle är i Stockholm, där danskarna styr.' }],
        [1521, 4.5, 'uppsala', { mer: 'Ärkebiskopen är i sin stad Uppsala.' }],
        [1521, 5.7, 'stockholm', { via: ['brunkeberg'], mer: 'Bönderna har tagit ärkebiskopsgården i Uppsala, och Gustav Trolle har tagit sig till Stockholm.' }],
        [1521, 9.2, 'kopenhamn', { sjo: 'danmark', mer: 'I september 1521 måste Gustav Trolle lämna Sverige. Han far till Danmark.' }]] },
      { id: 'kristina', namn: 'Kristina Gyllenstierna', kvinna: ['#7a2a3a', '#f2eee2'], kand: 1, kalla: 'sv. Wikipedia, Kristina Nilsdotter (Gyllenstierna) och Blåtårn', stopp: [
        [1521, 1, 'stockholm', { mer: 'Sten Stures änka Kristina Gyllenstierna sitter fången på Stockholms slott.' }],
        [1521, 9, 'kopenhamn', { sjo: 'danmark', mer: 'Kristina Gyllenstierna förs till Danmark och sätts i Blåtårn, fängelsetornet på Köpenhamns slott.' }],
        [1524, 1.5, 'kalmar', { sjo: 'danmark', mer: 'I januari 1524 får Kristina Gyllenstierna komma hem till Sverige, tillsammans med sin mor och sin son Nils.' }],
        [1524, 3, null, {}]] },
      { id: 'slagheck', namn: 'Didrik Slagheck', sort: 'slagheck', sok: 'Slagheck', kalla: 'sv. Wikipedia, Didrik Slagheck', stopp: [
        [1521, 1, 'stockholm', { mer: 'Didrik Slagheck styr Sverige åt Kristian II, från Stockholms slott.' }],
        [1521, 4, 'vasteras', { mer: 'Didrik Slagheck leder danskarna i Västerås.' }],
        [1521, 5, 'stockholm', { mer: 'Didrik Slagheck är tillbaka i Stockholm.' }],
        [1521, 9, 'kopenhamn', { sjo: 'danmark', mer: 'Didrik Slagheck kallas hem till Danmark. Kristian gör honom till ärkebiskop i Lund.' }],
        [1522, 1.8, null, {}]] },
      { id: 'norby', namn: 'Søren Norby', sort: 'norby', sok: 'Norby', kalla: 'sv. Wikipedia, Sören Norby', stopp: [
        [1521, 1, 'visby', { mer: 'Den danske sjöhjälten Søren Norby håller Gotland och Visby åt Kristian II.' }],
        [1525, 8, null, {}]] }
    ],
    2: [
      { id: 'johan', namn: 'Hertig Johan', sort: 'johan', kand: 1, kalla: 'sv. Wikipedia, Johan III', stopp: [
        [1560, 8, 'abo', { mer: 'Eriks bror Johan är hertig av Finland och håller hov på Åbo slott.' }],
        [1561, 3.6, 'arboga', { sjo: 'sverige', via: ['stockholm'], mer: 'Hertig Johan kommer till riksmötet i Arboga.' }],
        [1561, 6, 'abo', { via: ['stockholm'], sjo: 'sverige', mer: 'Hertig Johan är tillbaka i Åbo.' }],
        [1562, 8.6, 'reval', { sjo: 'sverige', mer: 'Hertig Johan reser söderut för att gifta sig med Katarina Jagellonica, syster till Polens kung.' }],
        [1562, 9.8, 'vilnius', { mer: 'I oktober 1562 gifter sig Johan och Katarina i Vilnius.' }],
        [1562, 12.2, 'reval', { mer: 'Johan och Katarina reser hem mot Finland.' }],
        [1562, 12.6, 'abo', { sjo: 'sverige', mer: 'Hertig Johan och hertiginnan Katarina är i Åbo.' }],
        [1563, 8.8, 'gripsholm', { sjo: 'sverige', mer: 'Hertig Johan är fånge och förs till Gripsholm.' }],
        [1567, 10.2, 'stockholm', { mer: 'Hertig Johan är fri igen.' }],
        [1568, 7, 'vadstena', { mer: 'Hertigarna Johan och Karl samlas i Östergötland.' }],
        [1568, 8.6, 'stockholm', { mer: 'Hertigarna kommer till Stockholm.' }]] },
      { id: 'rantzau', namn: 'Daniel Rantzau', sort: 'rantzau', sok: 'Rantzau', kalla: 'sv. Wikipedia, Daniel Rantzau', stopp: [
        [1565, 8.5, 'halmstad', { mer: 'Daniel Rantzau, en holsteinsk adelsman, leder den danska hären.' }],
        [1565, 10.5, 'axtorna', { mer: 'Daniel Rantzau går mot den svenska hären i Halland.' }],
        [1565, 11.5, 'halmstad', { mer: 'Daniel Rantzau är tillbaka i Halmstad.' }],
        [1567, 10.4, 'getaryggen', { mer: 'Daniel Rantzau går in i Sverige med hären, upp längs Nissastigen.' }],
        [1568, 2.5, 'halmstad', { via: ['jonkoping'], mer: 'Efter vintertåget genom Östergötland och Småland går Rantzau tillbaka till Halland.' }]] },
      { id: 'karin', namn: 'Karin Månsdotter', kvinna: ['#8a6a3a', '#efe9dc'], sok: 'Karin', kalla: 'sv. Wikipedia, Karin Månsdotter', stopp: [
        [1565, 1, 'stockholm', { mer: 'Karin Månsdotter, dotter till en knekt, lever vid Eriks hov.' }],
        [1567, 5, 'uppsala', { mer: 'Karin Månsdotter är med kungen i Uppsala.' }],
        [1567, 9, 'stockholm', { mer: 'Karin Månsdotter är i Stockholm.' }]] }
    ],
    5: [
      { id: 'delagardie', namn: 'Jakob De la Gardie', sort: 'delagardie', sok: 'De la Gardie', kalla: 'sv. Wikipedia, De la Gardieska fälttåget', stopp: [
        [1609, 2.9, 'viborg', { mer: 'Jakob De la Gardie samlar 5 000 man i Viborg.' }],
        [1609, 5, 'novgorod', { mer: 'Jakob De la Gardie går från Novgorod mot Moskva.' }],
        [1609, 6, null, {}]] },
      { id: 'gustavadolf', namn: 'Gustav Adolf', sort: 'gustavadolf', sok: 'Gustav Adolf', kalla: 'sv. Wikipedia, Karl IX och Kalmarkriget', stopp: [
        [1599, 11, 'stockholm', { mer: 'Prins Gustav Adolf, Karls son, föddes på Tre Kronor i december 1594.' }],
        [1611, 6.8, 'kristianopel', { mer: 'Gustav Adolf, 16 år, tar den danska staden Kristianopel med en överraskning.' }],
        [1611, 8, 'ryssby', { mer: 'Gustav Adolf är med sin far i lägret vid Ryssby.' }],
        [1611, 10.2, 'borgholm', { sjo: 'sverige', mer: 'Gustav Adolf tar tillbaka Borgholm på Öland.' }]] }
    ],
    4: [
      { id: 'karl', namn: 'Hertig Karl', sort: 'karl', sok: 'Karl', kalla: 'sv. Wikipedia, Avsättningskriget mot Sigismund och Uppsala möte', stopp: [
        [1592, 11, 'stockholm', { mer: 'Hertig Karl, kungens farbror, är den förnämste i regeringen medan kungen är i Polen.' }],
        [1593, 2.8, 'uppsala', { mer: 'Hertig Karl har kallat rikets präster till Uppsala möte.' }],
        [1593, 4, 'nykoping', { mer: 'Hertig Karl är hemma på Nyköpings slott, i sitt hertigdöme.' }],
        [1593, 9.9, 'stockholm', { mer: 'Hertig Karl väntar på kungen i Stockholm.' }],
        [1594, 8, 'nykoping', { mer: 'Hertig Karl styr riket tillsammans med rådet.' }],
        [1595, 9, 'soderkoping', { mer: 'Hertig Karl har kallat till riksdag i Söderköping, trots kungens förbud.' }],
        [1595, 11, 'nykoping', { mer: 'Hertig Karl är hemma på Nyköpings slott.' }],
        [1597, 3, 'arboga', { mer: 'Hertig Karl håller riksdag i Arboga, mot kungens förbud.' }],
        [1597, 9, 'abo', { sjo: 'sverige', mer: 'Hertig Karl belägrar Åbo slott. Klas Flemings änka Ebba Stenbock håller det.' }],
        [1597, 11, 'stockholm', { sjo: 'sverige', mer: 'Det sägs att kungen ska komma med en här. Hertig Karl återvänder till Stockholm.' }],
        [1598, 2.2, 'uppsala', { mer: 'Hertig Karl håller riksdag i Uppsala.' }],
        [1598, 6, 'nykoping', { mer: 'Hertig Karl tar emot kungens sändebud Samuel Laski i Nyköping.' }],
        [1598, 8.7, 'linkoping', { via: ['soderkoping'], mer: 'Hertig Karl och hans här står i Linköping och spärrar vägen för kungens folk.' }],
        [1598, 9.1, 'stegeborg', { via: ['soderkoping'], mer: 'Hertig Karl ligger i läger vid Mem, nära Stegeborg.' }],
        [1598, 9.7, 'linkoping', { via: ['soderkoping'], mer: 'Hertig Karl följer efter kungens här mot Linköping.' }],
        [1598, 11, 'stockholm', { via: ['soderkoping', 'nykoping'], mer: 'Hertig Karl tar Stockholm.' }],
        [1599, 2.9, 'kalmar', { mer: 'Hertig Karl leder själv anfallet mot Kalmars västra port.' }],
        [1599, 7.6, 'stockholm', { sjo: 'sverige', mer: 'Riksdagen i Stockholm avsätter kungen.' }],
        [1599, 8.6, 'abo', { sjo: 'sverige', mer: 'Hertig Karl tar själv befälet i Finland.' }]] },
      { id: 'fleming', namn: 'Klas Fleming', sort: 'fleming', sok: 'Fleming', kalla: 'sv. Wikipedia, Klubbekriget', stopp: [
        [1592, 11, 'abo', { mer: 'Riksmarsken Klas Fleming styr Finland från Åbo slott. Han är trogen kungen.' }],
        [1596, 12.8, 'nokia', { mer: 'Klas Fleming slår ner böndernas uppror vid Nokia.' }],
        [1597, 1.5, 'abo', { mer: 'Klas Fleming är tillbaka på Åbo slott.' }],
        [1597, 4.3, null, {}]] }
    ],
    3: [
      { id: 'erik', namn: 'Erik', sort: 'erik', kand: 1, kalla: 'sv. Wikipedia, Erik XIV', stopp: [
        [1568, 10, 'stockholm', { mer: 'Den avsatte kungen Erik sitter fången i ett torn på slottet Tre Kronor.' }],
        [1570, 7, 'abo', { sjo: 'sverige', mer: 'Erik förs över havet och hålls fången på Åbo slott.' }],
        [1571, 7, 'kastelholm', { sjo: 'sverige', mer: 'Erik flyttas till Kastelholm på Åland.' }],
        [1571, 10, 'gripsholm', { sjo: 'sverige', mer: 'Erik flyttas till Gripsholm.' }],
        [1573, 7, 'vasteras', { mer: 'Erik flyttas till Västerås slott.' }],
        [1574, 6, 'orbyhus', { mer: 'Erik flyttas till Örbyhus i Uppland. Där vaktas han hårt.' }],
        [1577, 2.3, null, {}]] }
    ]
  };

  // Landskap, länder och vatten som texterna nämner: en skylt mitt i området
  Object.assign(ORT, {
    danmark: [11.75, 55.45, 'Danmark'], norge: [11.0, 60.4, 'Norge'], finland: [24.3, 61.5, 'Finland'], polen: [19.6, 53.95, 'Polen'], ryssland: [30.4, 58.9, 'Ryssland'],
    estland: [25.6, 58.85, 'Estland'], livland: [25.9, 57.7, 'Livland'], karelen: [29.9, 61.4, 'Karelen'], tyskland: [12.6, 53.85, 'Tyskland'], halland: [12.75, 56.85, 'Halland'],
    dalarna: [14.6, 61.25, 'Dalarna'], gastrikland: [16.75, 60.55, 'Gästrikland'], uppland: [17.95, 60.05, 'Uppland'], sodermanland: [16.75, 59.05, 'Södermanland'], vastmanland: [16.1, 59.75, 'Västmanland'],
    ostergotland: [15.7, 58.25, 'Östergötland'], vastergotland: [13.3, 58.1, 'Västergötland'], gotland: [18.55, 57.45, 'Gotland'], skane: [13.55, 55.85, 'Skåne'], blekinge: [15.1, 56.25, 'Blekinge'],
    narke: [15.1, 59.15, 'Närke'], varmland: [13.3, 59.75, 'Värmland'], siljan: [14.8, 60.85, 'Siljan'], malaren: [17.0, 59.45, 'Mälaren'], vattern: [14.55, 58.35, 'Vättern'],
    vasterhavet: [11.1, 57.55, 'Västerhavet'], ladoga: [31.0, 60.9, 'Ladoga'], novgorod: [31.25, 58.52, 'Novgorod'], tiveden: [14.6, 58.75, 'Tiveden'],
    osterbotten: [22.3, 61.9, null], upplandkust: [18.75, 59.8, null]
  });

  // Härar och flottor, per värld: syns från steget som nämner dem (steg) och rör sig som de gjorde i verkligheten.
  // har = soldater till fots (slag = klädfärg), skepp = antal skepp till sjöss, flotta = bara skepp. flagga på skeppen och fanan.
  const HAR = {
    5: [
      { id: 'hKarl5', namn: 'Karls här', steg: 'kReval', har: { n: 10, slag: 'knekt' }, skepp: 4, flagga: 'sverige', alias: ['Karls här', 'svenskarna', 'Svenskarna'], kalla: 'sv. Wikipedia, Karl IX och Slaget vid Kirkholm', stopp: [
        [1600, 8, 'reval', { sjo: 'sverige', mer: 'Karl har gått i land i Reval med sin här.' }],
        [1600, 10, 'wenden', { mer: 'Hären går in i Livland. Först går det bra mot de oförberedda polackerna.' }],
        [1602, 6, 'reval', { mer: 'De följande åren går det sämre. Hären håller Estland.' }],
        [1605, 8.5, 'riga', { sjo: 'sverige', mer: 'Karl har kommit med 40 skepp. Hären belägrar Riga.' }],
        [1605, 9.5, 'kirkholm', { mer: 'Hären har gått tre mil i regn för att möta polackerna vid Kirkholm.' }],
        [1605, 10.5, 'reval', { mer: 'Det som är kvar av hären har tagit sig till Reval.' }],
        [1605, 12, null, {}]] },
      { id: 'hPolsk5', namn: 'Polska hären', steg: 'kLivland', har: { n: 8, slag: 'knekt' }, flagga: 'polen', alias: ['polackerna', 'Polackerna', 'Chodkiewicz ryttare'], kalla: 'sv. Wikipedia, Karl IX och Slaget vid Kirkholm', stopp: [
        [1600, 9, 'wenden', { mer: 'Polen har inte väntat sig krig. I Livland finns bara små styrkor.' }],
        [1605, 9, 'kirkholm', { mer: 'Jan Karol Chodkiewicz har slagit läger vid Kirkholm med omkring 3 600 ryttare, de bevingade husarerna.' }],
        [1605, 11, null, {}]] },
      { id: 'hDansk5', namn: 'Danska hären', steg: 'kOrebro', har: { n: 10, slag: 'dansk' }, skepp: 5, flagga: 'danmark', alias: ['danskarna', 'Danskarna', 'danska hären', 'danska lägret'], kalla: 'sv. Wikipedia, Kalmarkriget och Slaget vid Ryssby', stopp: [
        [1611, 4, 'kopenhamn', { mer: 'Kristian IV samlar sin här för att anfalla Sverige.' }],
        [1611, 5.1, 'kalmar', { sjo: 'danmark', mer: 'Kristian IV belägrar Kalmar själv. Den 27 maj tar danskarna staden med storm.' }],
        [1611, 8.7, 'ryssby', { mer: 'Kristian IV anfaller det svenska lägret vid Ryssby.' }],
        [1611, 9.2, 'kalmar', { mer: 'Danskarna håller Kalmar och Öland.' }]] }
    ],
    0: [
      { id: 'hDansk0', namn: 'Danska hären', steg: 'sVadla', har: { n: 9, slag: 'dansk' }, skepp: 4, flagga: 'danmark', alias: ['danska hären', 'danskarna', 'Kristians här'], kalla: 'sv. Wikipedia, Slaget vid Vädla, Slaget vid Brännkyrka och Slaget på Åsundens is', stopp: [
        [1517, 5, 'kopenhamn', { mer: 'Kristian II rustar en här och en flotta i Köpenhamn. De ska hjälpa ärkebiskopen Gustav Trolle.' }],
        [1517, 6.8, 'vadla', { sjo: 'danmark', mer: 'Den danska hären har gått i land vid Vädla, nära Stockholm.' }],
        [1517, 8.5, 'kopenhamn', { sjo: 'danmark', mer: 'Efter Vädla seglar danskarna hem till Köpenhamn.' }],
        [1518, 6, 'kopenhamn', { mer: 'Kristian II samlar en ny och större här, och leder den själv.' }],
        [1518, 7.5, 'brannkyrka', { sjo: 'danmark', mer: 'Danskarna har gått i land söder om Stockholm och vill belägra staden.' }],
        [1518, 9.6, 'kopenhamn', { sjo: 'danmark', mer: 'Efter Brännkyrka seglar hären hem igen.' }],
        [1519, 12, 'halmstad', { sjo: 'danmark', mer: 'En stor här av legoknektar samlas i Halland, under Otto Krumpen.' }],
        [1520, 1.4, 'bogesund', { mer: 'Hären går över gränsen in i Västergötland. Vid Åsunden väntar Sten Stures folk.' }],
        [1520, 2.2, 'tiveden', { mer: 'Danskarna tar sig igenom skogarna i Tiveden, där svenskarna har fällt träd över vägen.' }],
        [1520, 3, 'strangnas', { mer: 'Hären går mot Mälardalen, och rådsherrarna i Uppsala förhandlar med Otto Krumpen.' }],
        [1520, 4, 'uppsala', { mer: 'Danskarna står vid Uppsala. På långfredagen kommer bönderna mot dem.' }],
        [1520, 5, 'stockholm', { mer: 'Hären belägrar Stockholm hela sommaren. Kristina Gyllenstierna håller staden.' }]] }
    ],
    1: [
      { id: 'hDansk1', namn: 'Danska hären', steg: 'brunnback', har: { n: 8, slag: 'dansk' }, flagga: 'danmark', alias: ['danska hären', 'danskarna'], kalla: 'sv. Wikipedia, Befrielsekriget', stopp: [
        [1521, 1, 'stockholm', { mer: 'Kristian II:s knektar håller Stockholm och slotten runt Mälaren.' }],
        [1521, 3.6, 'vasteras', { mer: 'En dansk här går från Stockholm mot Dalarna för att slå ner upproret.' }],
        [1521, 3.95, 'brunnback', { mer: 'Danskarna vill över Dalälven vid Brunnbäcks färja.' }],
        [1521, 4.5, 'vasteras', { mer: 'Efter Brunnbäck drar sig danskarna tillbaka till Västerås.' }],
        [1521, 5.3, 'stockholm', { mer: 'Det som är kvar av hären tar sig till Stockholm. Där håller danskarna ut bakom murarna.' }],
        [1523, 6.7, null, {}]] },
      { id: 'fLubeck1', namn: 'Lübecks flotta', steg: 'lubeck', flotta: 1, skepp: 4, flagga: 'lubeck', alias: ['Lübecks skepp', 'Lübecks flotta', 'lybska skepp'], kalla: 'sv. Wikipedia, Befrielsekriget', stopp: [
        [1522, 4, 'lubeck', { mer: 'Lübeck rustar skepp åt Gustav, på kredit.' }],
        [1522, 6, 'soderkoping', { sjo: 'lubeck', mer: 'Tio skepp med 750 tyska knektar kommer till Söderköping.' }],
        [1522, 9, 'stockholm', { sjo: 'lubeck', mer: 'Lübecks skepp stänger inloppet till Stockholm.' }],
        [1523, 7.2, 'lubeck', { sjo: 'lubeck', mer: 'Stockholm är taget. Skeppen seglar hem till Lübeck.' }],
        [1523, 9, null, {}]] },
      { id: 'fLubeck2', namn: 'Lübecks flotta', steg: 'grevefejden', flotta: 1, skepp: 4, flagga: 'lubeck', alias: ['Lübecks flotta'], kalla: 'sv. Wikipedia, Grevefejden', stopp: [
        [1535, 3, 'lubeck', { mer: 'I Grevefejden strider Lübeck om Danmarks tron. Flottan ska hålla Östersjön.' }],
        [1535, 6.1, 'bornholm', { sjo: 'lubeck', mer: 'Lübecks flotta möter den svenska, danska och preussiska flottan vid Bornholm.' }],
        [1535, 7, 'lubeck', { sjo: 'lubeck', mer: 'Slagen till sjöss seglar flottan hem.' }],
        [1535, 9, null, {}]] },
      { id: 'hDacke', namn: 'Dackes bönder', steg: 'kisa', har: { n: 9, slag: 'bonde' }, alias: ['Dackes män', 'Dackes bönder'], kalla: 'sv. Wikipedia, Dackefejden', stopp: [
        [1542, 7, 'vissefjarda', { mer: 'Bönderna i Småland har rest sig under Nils Dacke. De är arga över skatterna och över att kyrkornas silver tas.' }],
        [1542, 8.8, 'kisa', { mer: 'Dackes män väntar i skogarna vid Kisa, där vägen går fram.' }],
        [1542, 11, 'vissefjarda', { mer: 'Efter Kisa styr Dacke stora delar av Småland. Kungen sluter stillestånd med honom.' }],
        [1543, 2.8, 'virserum', { mer: 'Dackes bönder samlas på isarna vid Virserum.' }],
        [1543, 3.5, null, {}]] },
      { id: 'hRysk1', namn: 'Ryska hären', steg: 'viborg', har: { n: 9, slag: 'rysk' }, alias: ['Ryssarna', 'ryssarna', 'ryska hären'], kalla: 'sv. Wikipedia, Rysk-svenska kriget 1554–1557', stopp: [
        [1555, 11, 'novgorod', { mer: 'Tsar Ivan IV samlar en här i Novgorod. Kriget gäller gränsen i Karelen.' }],
        [1555, 12.8, 'viborg', { via: ['kivinebb'], mer: 'Den ryska hären belägrar Viborg.' }],
        [1556, 3, 'novgorod', { via: ['kivinebb'], mer: 'Ryssarna drar sig tillbaka efter belägringen.' }],
        [1557, 4.5, null, {}]] }
    ],
    2: [
      { id: 'fDansk2', namn: 'Danska flottan', steg: 'eBornholm', flotta: 1, skepp: 5, flagga: 'danmark', alias: ['danska flottan', 'den danska flottan'], kalla: 'sv. Wikipedia, Nordiska sjuårskriget', stopp: [
        [1563, 4, 'kopenhamn', { mer: 'Danmarks flotta ligger i Köpenhamn.' }],
        [1563, 5.8, 'bornholm', { sjo: 'danmark', mer: 'En dansk eskader seglar vid Bornholm.' }],
        [1563, 7, 'kopenhamn', { sjo: 'danmark', mer: 'Kriget har börjat. Flottan är hemma i Köpenhamn.' }],
        [1564, 5.6, 'olandsudde', { sjo: 'danmark', mer: 'Den danska och lybska flottan under Herluf Trolle möter svenskarna vid Öland.' }],
        [1564, 6.6, 'kopenhamn', { sjo: 'danmark', mer: 'Flottan är tillbaka i Köpenhamn.' }],
        [1564, 7.9, 'olandsudde', { sjo: 'danmark', mer: 'Herluf Trolle möter Klas Horn vid Öland igen.' }],
        [1564, 9, 'kopenhamn', { sjo: 'danmark', mer: 'Flottan är tillbaka i Köpenhamn.' }],
        [1565, 6.6, 'bornholm', { sjo: 'danmark', mer: 'Flottan går mot svenskarna mellan Rügen och Bornholm.' }],
        [1565, 7.5, 'kopenhamn', { sjo: 'danmark', mer: 'Flottan är tillbaka i Köpenhamn.' }],
        [1566, 7.2, 'olandsudde', { sjo: 'danmark', mer: 'Den danska och lybska flottan möter svenskarna vid Ölands norra udde.' }],
        [1566, 7.7, 'visby', { sjo: 'danmark', mer: 'Flottan ankrar på redden utanför Visby.' }],
        [1566, 8, null, {}]] },
      { id: 'hDansk2', namn: 'Danska hären', steg: 'eKagge', har: { n: 9, slag: 'dansk' }, flagga: 'danmark', alias: ['danska hären', 'danskarna'], kalla: 'sv. Wikipedia, Nordiska sjuårskriget och Daniel Rantzau', stopp: [
        [1563, 8, 'halmstad', { mer: 'Kung Fredrik II samlar den danska hären i Halland.' }],
        [1563, 8.9, 'alvsborg', { mer: 'Den danska hären belägrar Älvsborg, Sveriges enda hamn mot väster.' }],
        [1563, 10, 'halmstad', { mer: 'Danskarna är tillbaka i Halland.' }],
        [1563, 10.8, 'mared', { mer: 'Den danska hären följer efter svenskarna när de lämnar Halmstad.' }],
        [1563, 12, 'halmstad', { mer: 'Hären ligger i vinterkvarter i Halland.' }],
        [1565, 10.4, 'axtorna', { mer: 'Under Daniel Rantzau går hären mot den svenska hären i Halland.' }],
        [1565, 11.5, 'halmstad', { mer: 'Hären är tillbaka i Halmstad.' }],
        [1567, 10.4, 'getaryggen', { mer: 'Hären går in i Sverige, upp längs Nissastigen.' }],
        [1568, 2.5, 'halmstad', { via: ['jonkoping'], mer: 'Efter vintertåget genom Östergötland och Småland går hären tillbaka till Halland.' }]] }
    ],
    3: [
      { id: 'hRysk3', namn: 'Ryska hären', steg: 'jReval1', har: { n: 10, slag: 'rysk' }, alias: ['Ryssarna', 'ryssarna', 'ryska hären'], kalla: 'sv. Wikipedia, Belägringen av Reval, Slaget vid Wenden och Livländska kriget', stopp: [
        [1570, 7, 'narva', { mer: 'Tsar Ivan IV har gjort Magnus av Ösel till kung i Livland. Med en rysk här ska han ta Reval.' }],
        [1570, 8.8, 'reval', { via: ['wesenberg'], mer: 'Hären belägrar Reval. Ryssarna tänker ligga kvar över vintern.' }],
        [1571, 3.2, 'narva', { via: ['wesenberg'], mer: 'Magnus av Ösel bränner sitt läger och drar sig undan.' }],
        [1576, 12, 'narva', { mer: 'En stor rysk här samlas för att ta Reval.' }],
        [1577, 1.2, 'reval', { via: ['wesenberg'], mer: 'Ryssarna belägrar Reval igen.' }],
        [1577, 3.3, 'narva', { via: ['wesenberg'], mer: 'Efter sju veckor drar sig ryssarna tillbaka.' }],
        [1578, 9.5, 'wenden', { mer: 'Den ryska hären belägrar Wenden i Livland.' }],
        [1578, 11, null, {}],
        [1590, 12, 'novgorod', { mer: 'Ryssland vill ha tillbaka städerna vid Finska viken.' }],
        [1591, 1.8, 'narva', { via: ['jamburg'], mer: 'Ryssarna anfaller Narva.' }],
        [1591, 4, null, {}]] },
      { id: 'hPolsk3', namn: 'Polska hären', steg: 'jWenden', har: { n: 8, slag: 'knekt' }, alias: ['polackerna', 'polacker'], kalla: 'sv. Wikipedia, Slaget vid Wenden', stopp: [
        [1578, 8, 'vilnius', { mer: 'Kung Stefan Batory av Polen och Litauen skickar en här till Livland.' }],
        [1578, 10.3, 'wenden', { mer: 'Polacker och svenskar går mot ryssarna vid Wenden tillsammans.' }],
        [1578, 12, 'vilnius', { mer: 'Polackerna går tillbaka mot Litauen.' }],
        [1579, 2, null, {}]] }
    ],
    4: [
      { id: 'hPolsk4', namn: 'Polska hären', steg: 'siFlottan', har: { n: 10, slag: 'knekt' }, skepp: 6, flagga: 'polen', alias: ['kungens här', 'Kungens här', 'polska hären', 'en här'], kalla: 'sv. Wikipedia, Kriget mot Sigismund', stopp: [
        [1598, 5, 'danzig', { mer: 'Kungens här samlas i Danzig: omkring 5 000 man, de flesta legoknektar, och omkring hundra skepp.' }],
        [1598, 7.9, 'kalmar', { sjo: 'polen', mer: 'Hären har gått i land vid Kalmar.' }],
        [1598, 8.9, 'stegeborg', { sjo: 'polen', mer: 'Flottan och hären går norrut till Stegeborg.' }],
        [1598, 9.6, 'linkoping', { mer: 'Kungens här går mot Linköping.' }],
        [1598, 10.2, 'kalmar', { mer: 'Efter Stångebro lovar kungen att skicka hem sin här.' }],
        [1598, 10.6, 'danzig', { sjo: 'polen', mer: 'Hären och flottan seglar hem till Danzig.' }],
        [1598, 12, null, {}]] },
      { id: 'hKarl', namn: 'Hertig Karls här', steg: 'siStegeborg', har: { n: 10, slag: 'knekt' }, flagga: 'sverige', alias: ['Karls här', 'Karls folk'], kalla: 'sv. Wikipedia, Slaget vid Stegeborg och Slaget vid Stångebro', stopp: [
        [1598, 7, 'nykoping', { mer: 'Hertig Karl samlar sin här i Södermanland.' }],
        [1598, 8.7, 'linkoping', { via: ['soderkoping'], mer: 'Karls här står i Linköping och spärrar vägen.' }],
        [1598, 9.1, 'stegeborg', { via: ['soderkoping'], mer: 'Karls här ligger i läger vid Mem, nära Stegeborg.' }],
        [1598, 9.7, 'linkoping', { via: ['soderkoping'], mer: 'Karls här följer efter kungens folk mot Linköping.' }],
        [1598, 11, 'stockholm', { via: ['soderkoping', 'nykoping'], mer: 'Hertig Karls här tar Stockholm.' }],
        [1599, 2.9, 'kalmar', { mer: 'Karls här belägrar Kalmar slott.' }],
        [1599, 5.6, null, {}]] },
      { id: 'hFinsk', namn: 'Finska hären', steg: 'siKorv', har: { n: 8, slag: 'knekt' }, skepp: 3, flagga: 'sverige', alias: ['finnarna'], kalla: 'sv. Wikipedia, Arvid Stålarm', stopp: [
        [1598, 6, 'abo', { mer: 'Arvid Stålarm, som håller Finland åt kungen, rustar en här.' }],
        [1598, 7.3, 'upplandkust', { sjo: 'sverige', mer: 'Finnarna går i land på Upplandskusten.' }],
        [1598, 8, 'abo', { sjo: 'sverige', mer: 'Upplandsbönderna möter dem, och finnarna seglar tillbaka.' }],
        [1598, 9, null, {}]] },
      { id: 'hKlubbor', namn: 'Böndernas här', steg: 'siKlubbor', har: { n: 9, slag: 'bonde' }, alias: ['Bönderna', 'bönderna'], kalla: 'sv. Wikipedia, Klubbekriget', stopp: [
        [1596, 11, 'osterbotten', { mer: 'Bönderna i Österbotten har rest sig mot knektarna som bor i deras gårdar. Deras vapen är klubbor.' }],
        [1596, 12.4, 'nokia', { mer: 'Böndernas här möter Klas Flemings ryttare vid Nokia.' }],
        [1597, 1.5, null, {}]] }
    ]
  };

  const txt2 = [];
  let scene = null, figs = [], taggEl = {}, orter = null, orterV = -1;
  const datumNu = () => { const d = V.Game.datum(); return d.ar + (d.man - 1) / 12; };
  const dat = s => s[0] + (s[1] - 1) / 12;
  function punkt(id) {
    const R = V.Rike; if (R.P[id]) return { x: R.P[id].x, z: R.P[id].z };
    const o = ORT[id]; if (!o) return null; const w = V.Geo.toWorld(o[0], o[1]); return { x: w[0], z: w[1] };
  }
  const platsNamn = id => { const b = D.BASER.find(q => q.id === id); return b ? b.namn : NAMN[id] || (ORT[id] && ORT[id][2]) || ''; };
  // vägen mellan två stopp: via de platser som stoppet anger, landsväg eller sjöväg
  function vag(fran, till, sjo, via) {
    const R = V.Rike, kedja = [fran].concat(via || [], [till]); let pts = [];
    for (let k = 0; k + 1 < kedja.length; k++) {
      const a = kedja[k], b = kedja[k + 1]; let del;
      if (R.P[a] && R.P[b]) del = sjo ? R.seaPath(a, b) : R.path(a, b);
      else { const p = punkt(a), q = punkt(b); del = [[p.x, p.z], [q.x, q.z]]; }
      if (sjo && R.P[a] && R.P[a].hav && k === 0) del = [[R.P[a].x, R.P[a].z]].concat(del);
      if (sjo && R.P[b] && R.P[b].hav && k === kedja.length - 2) del = del.concat([[R.P[b].x, R.P[b].z]]);
      pts = pts.concat(k ? del.slice(1) : del);
    }
    return pts;
  }

  const L = V.Levande = {
    ORT, FIG, NAMN, get figs() { return figs; },
    init(sc) {
      for (const f of figs) { if (f.h) f.h.scene.remove(f.h.g); if (f.u) V.Folk.remove(f.u); if (f.us) f.us.forEach(u => V.Folk.remove(u)); if (f.fana) f.fana.parent && f.fana.parent.remove(f.fana); if (f.skeppen) f.skeppen.forEach(k => k.parent && k.parent.remove(k)); if (f.skepp) f.skepp.parent && f.skepp.parent.remove(f.skepp); }
      for (const id in taggEl) taggEl[id].remove(); taggEl = {};
      scene = sc; figs = []; orter = null;
      const S = V.Game.s;
      L._lankStil();
      for (const d of (FIG[S.varld] || []).concat(HAR[S.varld] || [])) {
        const f = { d, k: undefined, leg: null, vandra: null };
        if (d.har || d.flotta) {          // en här: en klunga soldater med fana, till sjöss några skepp
          f.us = []; if (d.har) for (let i = 0; i < d.har.n; i++) f.us.push(V.Folk.add(0, 0, d.har.slag, { pike: i % 3 !== 1, sc: 1.25, vis: false }));
          if (d.flagga && d.har) { f.fana = V.Bygge.flagga(d.flagga); f.fana.scale.setScalar(1.3); f.fana.visible = false; sc.add(f.fana); }
          f.skeppen = [];
        }
        else if (d.kvinna) f.u = V.Folk.add(0, 0, 'kvinna', { col: d.kvinna[0], col2: d.kvinna[1], sc: 1.3, vis: false });
        else { const h = Object.create(V.Gustav); h.init(sc, d.sort); h.utanRing = true; h.kanSkida = d.sort === 'gustav'; h.g.scale.setScalar(1.4 * 1.06); h.g.visible = false; f.h = h; }
        figs.push(f);
      }
    },
    // Har berättelsen introducerat personen? (Johannes 2026-11-28: ingen huvudperson syns på kartan innan hen har introducerats.)
    // Nämns hen i ett stegs titel eller Läs mer syns hen när steget står på tur; nämns hen först i krönikan efter steget syns hen när steget är klart.
    // kand = känd från början av världen (världens inledning eller förra världen).
    _introducerad(d, nasta) {
      if (d.kand) return true;
      if (d.steg) { const i = D.UPPDRAG.findIndex(u => u.id === d.steg); return i >= 0 && nasta >= i; }          // härar och flottor: från steget som nämner dem
      if (!d.sok) return true;
      const L0 = D.UPPDRAG;
      if (d._intro === undefined || d._introL !== L0) { d._introL = L0; d._intro = 1e9; for (let i = 0; i < L0.length; i++) { const u = L0[i]; if ([u.titel, u.mer].join(' ').indexOf(d.sok) >= 0) { d._intro = i; break; } if ([u.kronika, u.vet, u.vet2, u.efter].join(' ').indexOf(d.sok) >= 0) { d._intro = i + 1; break; } } }
      return nasta >= d._intro;
    },
    // hur långt personen har kommit: det sista stoppet vars datum har passerat (-1 = inte ännu)
    _mal(f, nu) { let k = -1; f.d.stopp.forEach((s, i) => { if (dat(s) <= nu + 1e-6) k = i; }); return k; },
    update(dt, t) {
      if (!scene || !figs.length) return;
      const S = V.Game.s, nu = datumNu(), dold = !!(V.Intro && V.Intro.aktiv) || S.slut || V.Game.skede() === 'strid';
      for (const f of figs) {
        const st = f.d.stopp, intro = !L._introducerad(f.d, S.nasta), mal = (f.d.ej && S.hjalte === f.d.ej) || intro ? -1 : L._mal(f, nu);          // efter: personen syns först när steget med hans egen introduktion är klart 
        if (f.k === undefined || mal < f.k) { f.k = mal; f.leg = null; f.vandra = null; f.pos = mal >= 0 && st[mal][2] ? punkt(st[mal][2]) : null; }      // vid start: personen står på sin plats
        else if (!f.leg && mal - f.k > 1) { f.k = mal - 1; f.vandra = null; f.pos = st[f.k][2] ? punkt(st[f.k][2]) : null; }          // tiden har hoppat: bara den sista resan syns
        if (!f.leg && f.k < mal) {          // dags att resa vidare till nästa stopp
          const nx = st[f.k + 1], o = nx[3] || {};
          if (!nx[2]) { f.k++; f.pos = null; }
          else if (f.k < 0 || !f.pos) { f.k++; f.pos = punkt(nx[2]); }
          else { const fr = st[f.k][2], pts = vag(fr, nx[2], o.sjo, o.via); pts.unshift([f.pos.x, f.pos.z]); f.leg = { pts, len: V.Rike.length(pts), d: 0, sjo: o.sjo }; f.vandra = null; }
        }
        let x, z, ang = 0, fart = 0, sjo = false, fots = true, syns = !!f.pos && !dold;
        if (f.leg) {
          const lg = f.leg; lg.d += dt * (lg.sjo ? 3.2 : 2.4); const a = V.Rike.along(lg.pts, Math.min(lg.d, lg.len)); x = a.x; z = a.z; ang = a.ang; fart = 0.55; sjo = !!lg.sjo; fots = false; f.pos = { x, z }; syns = !dold;
          if (lg.d >= lg.len) { f.leg = null; f.k++; f.pos = punkt(st[f.k][2]); f.vandra = null; }
        } else if (f.pos && (f.d.har || f.d.flotta)) { x = f.pos.x; z = f.pos.z; ang = f.vila === undefined ? 0 : f.vila; }          // en här ligger i läger, en flotta för ankar
        else if (f.pos) {          // går runt i staden, stannar en stund, går vidare
          const c = punkt(st[f.k][2]), v = f.vandra || (f.vandra = { x: f.pos.x, z: f.pos.z, tx: f.pos.x, tz: f.pos.z, vila: 1 + Math.random() * 2, ang: Math.random() * 6 });
          if (v.vila > 0) { v.vila -= dt; if (v.vila <= 0) { for (let k = 0; k < 12; k++) { const a = Math.random() * 6.283, r = 0.5 + Math.random() * 1.6, px = c.x + Math.cos(a) * r, pz = c.z + Math.sin(a) * r; if (V.Geo.sdAt(px, pz) > 0.6) { v.tx = px; v.tz = pz; break; } } } }
          else { const dx = v.tx - v.x, dz = v.tz - v.z, l = Math.hypot(dx, dz); if (l < 0.05) v.vila = 2 + Math.random() * 5; else { const s = Math.min(l, dt * 0.45); v.x += dx / l * s; v.z += dz / l * s; v.ang = Math.atan2(dx, dz); fart = 0.3; } }
          x = v.x; z = v.z; ang = v.ang; f.pos = { x, z };
        }
        if (f.us) { if (!L._har(f, x, z, ang, syns, sjo, t)) syns = false; const ak = f.d.flotta && !f.leg && f.ankar && f.ankar[0]; f.syns = syns; f.sx = ak ? ak.x : x; f.sz = ak ? ak.z : z; f.till = ak ? 2.6 : 2.4; if (f.leg) f.vila = ang; continue; }
        if (f.h) { if (syns) f.h.place(x, z, ang, fart, t, dt, sjo, fots); else f.h.g.visible = false; }
        if (f.u) { f.u.vis = syns && !sjo; if (syns) { f.u.x = x; f.u.z = z; f.u.ang = ang; f.u.gar = fart > 0; } }
        // till sjöss: ett skepp
        if (syns && sjo) {
          if (!f.skepp || f.skeppFlagga !== f.leg.sjo) { if (f.skepp) scene.remove(f.skepp); f.skepp = V.skepp(f.leg.sjo); f.skepp.scale.setScalar(2.0); f.skeppFlagga = f.leg.sjo; scene.add(f.skepp); }
          f.skepp.visible = true; f.skepp.position.set(x, 0.02 + Math.sin(t * 1.4) * 0.03, z); f.skepp.rotation.y = ang;
        } else if (f.skepp) f.skepp.visible = false;
        f.syns = syns; f.sx = x; f.sz = z; f.till = sjo ? 2.7 : f.h ? (fots ? 2.0 : 2.45) : 1.2;
      }
    },
    // namnskyltarna över personerna. Ett tryck visar vad personen gör just nu.
    // En här på kartan: soldaterna går i en kolonn längs vägen och ligger i läger på platsen; till sjöss och för ankar syns skeppen.
    _har(f, x, z, ang, syns, sjo, t) {
      const d = f.d, lg = f.leg, Geo = V.Geo, tillSjoss = syns && (sjo || (!!d.flotta && !lg)), nS = tillSjoss ? (d.skepp || 3) : 0;
      while (f.skeppen.length < nS) { const k = V.skepp(d.flagga || 'sverige'); k.scale.setScalar(1.8); k.visible = false; scene.add(k); f.skeppen.push(k); }
      let ankar = null;
      if (tillSjoss && !lg) { if (f.ankarK !== f.k) { f.ankarK = f.k; f.ankar = L._ankarplats(x, z, nS); } ankar = f.ankar; }
      let syntSkepp = 0;
      f.skeppen.forEach((k, i) => {
        if (i >= nS || (ankar && !ankar[i])) { k.visible = false; return; }
        let px, pz, a;
        if (lg && lg.d - i * 1.1 < 0) { k.visible = false; return; }          // skeppen lämnar hamnen ett i taget
        if (lg) { const b = V.Rike.along(lg.pts, Math.max(0, Math.min(lg.d, lg.len) - i * 1.1)), sid = i ? (i % 2 ? 0.55 : -0.55) : 0; px = b.x + Math.cos(b.ang) * sid; pz = b.z - Math.sin(b.ang) * sid; a = b.ang; }
        else { px = ankar[i].x; pz = ankar[i].z; a = 0.6 + i * 0.9; }
        if (lg && V.Geo.sdAt(px, pz) > -0.1) { k.visible = false; return; }          // inga skepp på land (där vägen går genom en flodmynning)
        k.position.set(px, 0.02 + Math.sin(t * 1.4 + i) * 0.03, pz); k.rotation.y = a; k.visible = true; syntSkepp++;
      });
      const iland = syns && !sjo && !d.flotta;
      f.us.forEach((u, i) => {
        u.vis = iland; if (!iland) return;
        if (lg) { const b = V.Rike.along(lg.pts, Math.max(0, Math.min(lg.d, lg.len) - (i >> 1) * 0.45)), sid = (i % 2 ? 0.2 : -0.2); u.x = b.x + Math.cos(b.ang) * sid; u.z = b.z - Math.sin(b.ang) * sid; u.ang = b.ang; u.gar = true; }
        else {          // lägret: i en ring runt platsen, på land
          const a = i * 2.4, r = 0.5 + 0.3 * Math.sqrt(i), cx = Geo.sdAt(x + 1.3, z + 0.4) > 0.6 ? x + 1.3 : x, cz = cx !== x ? z + 0.4 : z; let px = cx + Math.cos(a) * r, pz = cz + Math.sin(a) * r;          // lägret ligger strax utanför staden
          if (Geo.sdAt(px, pz) < 0.3) { px = x; pz = z; }
          u.x = px; u.z = pz; u.ang = a + Math.PI + Math.sin(t * 0.3 + i) * 0.4; u.gar = false;
        }
      });
      if (f.fana) { f.fana.visible = iland; if (iland) { const u = f.us[0]; f.fana.position.set(u.x + 0.2, Geo.groundAt(u.x, u.z), u.z); f.fana.rotation.y = u.ang + 1.2; } }
      if (tillSjoss && !syntSkepp) return false;
      return true;
    },
    // var skeppen ankrar: på vattnet närmast platsen
    _ankarplats(x, z, n) {
      const Geo = V.Geo, vatten = (px, pz) => Geo.sdAt(px, pz) < -0.5; let c = null;
      for (let r = 0.5; r <= 7 && !c; r += 0.5) for (let k = 0; k < 16; k++) { const a = k / 16 * 6.283, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r; if (vatten(px, pz)) { c = { x: px, z: pz }; break; } }
      const ut = []; if (!c) return ut;
      for (let i = 0; i < n; i++) { let p = null; for (let k = 0; k < 10 && !p; k++) { const a = i * 2.1 + k * 0.7, r = i ? 1.7 + k * 0.35 : 0, px = c.x + Math.cos(a) * r, pz = c.z + Math.sin(a) * r; if (vatten(px, pz)) p = { x: px, z: pz }; } ut.push(p); }
      return ut;
    },
    // Läs mer-rutorna: platser, personer och härar som nämns går att trycka på, och kameran åker dit
    _lankStil() {
      if (!document.getElementById('lank-stil')) { const st = document.createElement('style'); st.id = 'lank-stil'; st.textContent = '.lank{color:#7a3410;font-weight:600;text-decoration:underline dotted 1.5px;text-underline-offset:3px;cursor:pointer;border-radius:3px}.lank:hover{color:#a5481a;background:rgba(232,192,64,.18)}'; document.head.appendChild(st); }
      const UI = V.UI; if (UI && !UI._lankad) { UI._lankad = 1; const ruta = UI.ruta; UI.ruta = function (html) { const r = ruta.apply(this, arguments); try { if (/class="mal"/.test(html)) L.lanka(r.querySelector('.ruta-in') || r); } catch (e) { } return r; }; }
    },
    _mal_namn() {
      const S = V.Game.s, R = V.Rike, ut = [], sett = {};
      const lagg = (n, m) => { if (n && n.length > 2 && !sett[n]) { sett[n] = 1; ut.push([n, m]); } };
      for (const f of figs) if (f.syns) for (const n of [f.d.namn, f.d.sok].concat(f.d.alias || [])) lagg(n, { f });
      if (S.hjalte !== 'kristina') for (const n of ({ 0: ['Sten Sture'], 1: ['Gustav Eriksson', 'Gustav'], 2: ['Erik'], 3: ['Johan'], 4: ['Sigismund'] })[S.varld] || []) lagg(n, { hjalte: 1 });
      for (const b of D.BASER) if (R.P[b.id]) lagg(b.namn, { plats: b.id });
      for (const id in NAMN) if (punkt(id)) lagg(NAMN[id], { plats: id });
      for (const id in ORT) if (ORT[id][2]) lagg(ORT[id][2], { plats: id });
      for (const id in R.P) { const n = V.UI.platsnamn(id); if (n !== id) lagg(n, { plats: id }); }
      return ut;
    },
    lanka(el) {
      if (!el) return; const mal = L._mal_namn(); if (!mal.length) return;
      mal.sort((a, b) => b[0].length - a[0].length);
      const karta = {}; for (const [n, m] of mal) karta[n] = m;
      const re = new RegExp('(?<![\\p{L}])(' + mal.map(m => m[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(s)?(?![\\p{L}])', 'gu');
      const tagna = new Set(), noder = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) { const nd = w.currentNode, p = nd.parentElement; if (p && !p.closest('h2, .svag, button, .lank, .mal')) noder.push(nd); }
      for (const nd of noder) {
        const t = nd.nodeValue; re.lastIndex = 0; let m, sist = 0, frag = null;
        while ((m = re.exec(t))) {
          const mm = karta[m[1]], nyckel = mm.f ? 'f' + mm.f.d.id : mm.hjalte ? 'h' : 'p' + mm.plats; if (tagna.has(nyckel)) continue; tagna.add(nyckel);
          frag = frag || document.createDocumentFragment(); frag.appendChild(document.createTextNode(t.slice(sist, m.index)));
          const s = document.createElement('span'); s.className = 'lank'; s.textContent = m[0]; s.addEventListener('click', ev => { ev.stopPropagation(); L.gaTill(mm); }); frag.appendChild(s); sist = m.index + m[0].length;
        }
        if (frag) { frag.appendChild(document.createTextNode(t.slice(sist))); nd.parentNode.replaceChild(frag, nd); }
      }
    },
    gaTill(m) {
      const UI = V.UI, W = V.Varld, Sc = V.Scene, G = V.Game; UI.stang(); V.Ljud && V.Ljud.vakna && V.Ljud.vakna();
      const d = Math.min(Sc.cam.d, 34);
      if (m.f) { const f = m.f; Sc.flyTo(f.sx, f.sz + 1.2, d, 1.0); W._foljer = { t: performance.now(), pos: () => f.syns ? { x: f.sx, z: f.sz } : null }; return; }
      if (m.hjalte) { W.foljHjalten(); const h = V.Gustav; if (h && h.g) Sc.flyTo(h.g.position.x, h.g.position.z + 1.2, d, 1.0); return; }
      if (G.s.bas[m.plats] && UI.onVisaBas) { UI.visaStad(m.plats); UI.onVisaBas(m.plats); return; }
      const p = punkt(m.plats); if (!p) return; Sc.flyTo(p.x, p.z + 1.2, Math.min(Sc.cam.d, 40), 1.0); W._foljer = { t: performance.now(), pos: () => ({ x: p.x, z: p.z }) };
    },
    taggar(spel, golv) {
      const box = document.getElementById('ortnamn'); if (!box) return;
      const satta = [];          // skyltar som redan står: flera personer i samma stad får sina namn i en liten stapel
      for (const id of ['vem-du', 'vem-bud']) { const h = document.getElementById(id); if (h && h.style.display === 'block') { const r = h.getBoundingClientRect(); satta.push({ x: r.left + r.width / 2, y: r.bottom, w: r.width }); } }          // hjältens namn står kvar, de andra flyttar upp
      for (const f of figs) {
        let e = taggEl[f.d.id];
        // boken i skylten visar att man kan trycka och läsa mer
        if (!e) { e = taggEl[f.d.id] = document.createElement('div'); e.className = 'vem annan'; e.innerHTML = f.d.namn + '<svg class="vem-bok" viewBox="0 0 24 24"><path d="M4 4.5h7c1 0 1 .6 1 1.2V20c0-.7-.4-1.2-1-1.2H4zM20 4.5h-7c-1 0-1 .6-1 1.2V20c0-.7.4-1.2 1-1.2h7z" fill="#fff3d6" stroke="#5a4634" stroke-width="1.6" stroke-linejoin="round"/></svg>'; box.appendChild(e); e.addEventListener('click', ev => { ev.stopPropagation(); L.mer(f); }); }
        let syns = spel && f.syns;
        if (syns) { const sp = V.Scene.screenPoint(f.sx, V.Geo.groundAt(f.sx, f.sz) + f.till, f.sz); syns = !sp.behind && sp.y > 50 && sp.y < golv && sp.x > 10 && sp.x < innerWidth - 10 && !V.UI._skymd(sp); if (syns) { let y = sp.y - 8; const bw = f.d.namn.length * 7.6 + 18; for (let k = 0; k < 4; k++) { const krock = satta.find(r => Math.abs(r.x - sp.x) < (r.w + bw) / 2 && Math.abs(r.y - y) < 21); if (!krock) break; y = krock.y - 22; } satta.push({ x: sp.x, y, w: bw }); e.style.transform = 'translate(' + Math.round(sp.x) + 'px,' + Math.round(y) + 'px) translate(-50%, -100%)'; } }
        e.style.display = syns ? 'flex' : 'none';
      }
    },
    mer(f) {
      const st = f.d.stopp, s = f.leg ? st[f.k + 1] : st[Math.max(0, f.k)], o = (s && s[3]) || {}, d = V.Game.datum();
      const var_ = f.leg ? 'På väg till ' + platsNamn(s[2]) : platsNamn(s[2]);
      V.UI.ruta('<h2>' + f.d.namn + '</h2><p class="mal">' + var_ + ', ' + d.ar + '</p><p>' + (o.mer || '') + '</p>' + (f.d.kalla ? '<p class="svag">Källa: ' + f.d.kalla + '.</p>' : '') + '<button class="stang">Stäng</button>', false); V.UI._paus = true;
    },
    // ortsskyltarna: platser som den här världens texter nämner, och platser där personerna är, som inte redan har ett namn på kartan
    orter(upptagna) {
      const S = V.Game.s; if (V.Game.skede() === 'strid' || (V.Intro && V.Intro.aktiv)) return [];
      const nyckel = S.varld + ':' + S.nasta + ':' + figs.filter(f => f.syns).length;
      if (!orter || orterV !== nyckel) {          // kartan växer med berättelsen: bara platser som har nämnts hittills, och dit personerna och härarna har gått
        orterV = nyckel; const steg = D.UPPDRAG, ids = {};
        const txt = steg.map((u, i) => i < S.nasta ? [u.titel, u.mer, u.kronika, u.vet, u.vet2, u.efter, V.DJUP && V.DJUP[u.id]].join(' ') : i === S.nasta ? [u.titel, u.mer].join(' ') : '').join(' ');
        steg.forEach((u, i) => { if (i > S.nasta) return; if (u.plats) ids[u.plats] = 1; if (u.fran) ids[u.fran] = 1; });
        for (const f of figs) if (f.k !== undefined && f.k >= 0) for (let i = 0; i <= Math.min(f.k + 1, f.d.stopp.length - 1); i++) { const s = f.d.stopp[i]; if (s[2]) ids[s[2]] = 1; if (s[3].mer) txt2.push(s[3].mer); }
        const alla = txt + ' ' + txt2.join(' '); txt2.length = 0;
        for (const id in NAMN) if (alla.indexOf(NAMN[id]) >= 0) ids[id] = 1;
        for (const id in ORT) if (ORT[id][2] && alla.indexOf(ORT[id][2]) >= 0) ids[id] = 1;
        orter = [];
        for (const id in ids) { const n = platsNamn(id), p = punkt(id); if (!n || !p || (ORT[id] && !ORT[id][2])) continue; orter.push({ id: 'o:' + id, plats: id, namn: n, x: p.x, z: p.z + 0.9, y: Math.max(0.02, V.Geo.groundAt(p.x, p.z + 0.9)), liten: true }); }
      }
      // inte där det redan står ett namn
      return orter.filter(o => !upptagna[o.plats] && !upptagna['_' + Math.round(o.x / 2.2) + ',' + Math.round(o.z / 2.2)]);
    }
  };
})();
