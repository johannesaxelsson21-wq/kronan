// All speldata för första världen: platser, baser, uppdrag och texter.
// Varje uppdrag bygger på docs/historia.md. Ändra aldrig ett årtal här utan att ha slagit upp det där.
(function (root) {
  'use strict';
  const V = root.VASA = root.VASA || {};

  // Platser: [longitud, latitud]
  const PLATSER = {
    mora: [14.56, 61.012], rattvik: [15.15, 60.89], leksand: [15.0, 60.7], kopparberget: [15.63, 60.625], gavle: [17.13, 60.675], hedemora: [15.99, 60.275],
    brunnback: [16.24, 60.115], vasteras: [16.55, 59.625], uppsala: [17.64, 59.86], stockholm: [18.075, 59.335], brunkeberg: [18.02, 59.55], vadstena: [14.93, 58.45], stegeborg: [16.6, 58.43],
    orebro: [15.21, 59.275], kalmar: [16.34, 56.66], strangnas: [17.03, 59.37], abo: [22.27, 60.46], viborg: [28.75, 60.72], sala: [16.6, 59.92], gripsholm: [17.21, 59.25],
    alvsborg: [11.93, 57.69], helsingfors: [24.98, 60.21], salen: [13.27, 61.16], rafsnas: [17.27, 59.22], lubeck: [10.72, 53.9], kopenhamn: [12.55, 55.68], malmo: [13.03, 55.6],
    soderkoping: [16.32, 58.485], storatuna: [15.5, 60.43], kisa: [15.63, 57.99], virserum: [15.58, 57.32], smaland: [15.3, 57.1], skara: [13.44, 58.39], bornholm: [15.5, 55.45],
    kivinebb: [29.3, 60.4], halsingland: [16.6, 61.3], nykoping: [17.01, 58.76], lima: [13.36, 60.94], evertsberg: [13.96, 61.13], oxberg: [14.2, 61.12], ostersjon: [17.6, 57.6], finskaviken: [25.5, 59.85],
    staket: [17.72, 59.5], vadla: [18.5, 59.6], brannkyrka: [17.81, 59.03], bogesund: [13.42, 57.79]          // förspelet: lagda en bit utanför Stockholm så att de syns för sig
  };

  // Baser. slag: bygd (ger män), gruva, stad, slott (ger mark). p0 = produktion per nivå och sekund, c0 = första nivåns pris, r = prisökning per nivå.
  const BASER = [
    { id: 'mora', namn: 'Mora', rad: 'By vid sjön Siljan. Härifrån kommer dalkarlarna', slag: 'bygd', ger: 'man', p0: 0.2, c0: 4, r: 1.2, kyrka: 1 },
    { id: 'rattvik', namn: 'Rättvik', rad: 'By vid Siljan. Bönderna här går med dig', slag: 'bygd', ger: 'man', p0: 0.25, c0: 25, r: 1.2, kyrka: 1 },
    { id: 'leksand', namn: 'Leksand', rad: 'By där älven lämnar Siljan. Fler dalkarlar', slag: 'bygd', ger: 'man', p0: 0.6, c0: 120, r: 1.2, kyrka: 1 },
    { id: 'kopparberget', namn: 'Kopparberget', rad: 'Rikets koppargruva vid Falun. Kopparen blir pengar', slag: 'gruva', ger: 'mark', p0: 1.5, c0: 40, r: 1.3 },
    { id: 'gavle', namn: 'Gävle', rad: 'Gästrikland går med dig', slag: 'bygd', ger: 'man', p0: 1, c0: 700, r: 1.2, hamn: 1, kyrka: 1 },
    { id: 'hedemora', namn: 'Hedemora', rad: 'Stad i Bergslagen där du gör egna mynt', slag: 'stad', ger: 'mark', p0: 9, c0: 300, r: 1.3, mynt: 1, kyrka: 1 },
    { id: 'vasteras', namn: 'Västerås', rad: 'Stad och slott vid Mälaren. Handel och tull', slag: 'stad', ger: 'mark', p0: 55, c0: 4500, r: 1.3, borg: 'liten', dom: 1, hamn: 1 },
    { id: 'uppsala', namn: 'Uppsala', rad: 'Ärkebiskopens stad med rikets största kyrka', slag: 'stad', ger: 'mark', p0: 320, c0: 60000, r: 1.3, dom: 2, borg: 'liten' },
    { id: 'vadstena', namn: 'Vadstena', rad: 'Östergötlands folk samlas vid klostret', slag: 'bygd', ger: 'man', p0: 2.5, c0: 4000, r: 1.2, kloster: 1, hamn: 1 },
    { id: 'kalmar', namn: 'Kalmar', rad: 'Slott och stad vid sundet mot Öland. Tull och sjöfart', slag: 'stad', ger: 'mark', p0: 1900, c0: 8e5, r: 1.3, borg: 'kalmar', hamn: 1, mur: 1 },
    { id: 'stockholm', namn: 'Stockholm', rad: 'Rikets största stad. Hit kommer handeln och skatten', slag: 'stad', ger: 'mark', p0: 11000, c0: 1e7, r: 1.3, borg: 'stockholm', dom: 1, hamn: 1, mur: 1, stor: 1 },
    { id: 'abo', namn: 'Åbo', rad: 'Finlands folk samlas vid Åbo slott', slag: 'bygd', ger: 'man', p0: 5, c0: 12000, r: 1.2, borg: 'liten', dom: 1, hamn: 1 },
    { id: 'sala', namn: 'Sala silvergruva', kort: 'Sala gruva', rad: 'Silvergruvan, rikets skattkammare', slag: 'gruva', ger: 'mark', p0: 7e4, c0: 1.4e8, r: 1.3, silver: 1 },
    { id: 'gripsholm', namn: 'Gripsholm', rad: 'Kungens nya slott vid Mälaren. Hit kommer skatten från trakten', slag: 'slott', ger: 'mark', p0: 4.5e5, c0: 2e9, r: 1.3, borg: 'gripsholm' },
    { id: 'helsingfors', namn: 'Helsingfors', rad: 'Ny handelsstad som ska ta handeln från Reval', slag: 'stad', ger: 'mark', p0: 3e6, c0: 3e10, r: 1.3, hamn: 1, ny: 1 },
    { id: 'viborg', namn: 'Viborg', rad: 'Slottet längst i öster, med handeln mot Ryssland', slag: 'stad', ger: 'mark', p0: 2e7, c0: 4.5e11, r: 1.3, borg: 'viborg', hamn: 1, mur: 1 },
    { id: 'nykoping', namn: 'Nyköping', rad: 'Slott i Södermanland. Bönderna här håller på dig', slag: 'bygd', ger: 'man', p0: 0.4, c0: 8, r: 1.2, borg: 'liten', hamn: 1, kyrka: 1 }          // bara i förspelet: allmogen i Södermanland
  ];
  // Förspelet har egna, små siffror för de baser som finns med.
  // 2026-11-26: Stockholm och Västerås ger drygt en tredjedel mer än förut, Åbo hälften mer, Nyköping en tredjedel mer och Uppsala en femtedel mer (Johannes: "Det är lite för segt, öka tempot på produktion lite"). Priserna på stegen är desamma.
  const STURE_BAS = { stockholm: { p0: 0.7, c0: 5 }, vasteras: { p0: 1.65, c0: 25 }, abo: { p0: 0.15, c0: 6 }, nykoping: { p0: 0.2, c0: 20 }, uppsala: { p0: 17, c0: 1200 } };

  // Byggnader (förspelet, sedan 2026-11-26): köps för mark, byggs synligt vid en plats och låser upp något man kan göra.
  // x, z = var huset står, i platsens egna mått. fran = från och med vilket steg kortet finns. las = det som låses upp. Grunden står i docs/historia.md.
  const BYGGNADER = [
    { id: 'knektar', namn: 'Hus för knektar', plats: 'stockholm', x: 0.7, z: -2.2, kostar: 1500, fran: 2, las: 'sold', ger: 'ger kortet mark för män',
      vad: 'Ett hus vid slottet för knektar i din tjänst. När det står klart kan du ta knektar i tjänst för mark, och få fler män.' },
    { id: 'radstuga', namn: 'Rådstugan', skylt: 'Rådstugan står klar', flik: 'mark', plats: 'stockholm', x: -1.55, z: -0.7, kostar: 3500, fran: 3, ger: 'ger breven och Sigillet',
      vad: 'Stadens rådstuga vid Stortorget. Här skrivs och beseglas dina brev. Ger handlingen Skriv brev och förmågorna Sigillet och Skattelistor.',
      klart: 'Nu kan du skriva brev (knappen vid den runda), och Sigillet finns under marken.' },
    { id: 'ladugard', namn: 'Kungsladugården', skylt: 'Kungsladugården står klar', vid: 'vadla', x: -3.0, z: -1.0, kostar: 9000, fran: 4, tak: 1.25, ger: 'armén rymmer fler',
      vad: 'Kronans gård vid Vädla norr om staden. Den föder ditt folk och dina hästar: armén rymmer en fjärdedel fler, och du får förmågan Hästar.',
      klart: 'Armén rymmer en fjärdedel fler, och Hästar finns under marken.' },
    { id: 'torn', namn: 'Torn i stadsmuren', skylt: 'Tornen står klara', plats: 'stockholm', kostar: 400000, fran: 8, x: 0, z: 0, xman: 1.2, ger: 'fler män, starkare försvar',
      vad: 'Stockholms mur får nya torn. Allt som ger män ger en femtedel mer, och fler kanoner svarar när staden belägras.',
      klart: 'Allt som ger män ger en femtedel mer.' }
  ];

  // Kungens egna förmågor. Var tionde nivå dubblar.
  // vad0 = texten i förspelet, där man rider själv (i Gustavs värld är det än så länge ett bud som far)
  const KONSTER = [
    { id: 'sigill', bygg0: 'radstuga', flik0: 'mark', fran0: 'Rådstugan', namn: 'Sigillet', vad: 'Ditt eget sigill under brevet, så att alla ser att budet kommer från dig. Varje tryck ger mer.', c0: 30, r: 2.4 },
    { id: 'skidor', bygg0: 'ladugard', flik0: 'mark', fran0: 'Kungsladugården', namn: 'Skidor och hästar', sture: 'Hästar', vad: 'Budet far fortare mellan platserna. Var tionde nivå ger full mätare en gång till.', vad0: 'Du rider fortare mellan platserna. Var tionde nivå ger full mätare en gång till.', c0: 40, r: 2.4 },
    { id: 'tal', steg0: 'sAllmoge', flik0: 'man', fran0: 'sedan du vann bönderna 1512', namn: 'Ordets makt', vad: 'Fler lyssnar när budet kommer fram: varje besök ger mer.', vad0: 'Fler lyssnar när du kommer fram: varje besök ger mer.', c0: 60, r: 2.4 },
    { id: 'bud', steg0: 'sVadla', flik0: 'mark', fran0: 'sedan segern vid Vädla 1517', namn: 'Fler bud', vad: 'Löpare som far runt åt dig, också när du inte trycker. Med tre löpare står mätaren full av sig själv.', c0: 250, r: 2.4 },
    { id: 'langd', bygg0: 'radstuga', flik0: 'man', fran0: 'Rådstugan', namn: 'Skattelistor', vad: 'Listor över vem som ska betala skatt. Driv in skatt ger mer.', c0: 150, r: 2.4 }
  ];

  // Egna handlingar: sådant hjälten gör själv. tid = hur länge verkan varar, vila = hur länge han måste vänta sedan (sekunder).
  // Grunden står i docs/historia.md: talet på kyrkbacken i Mora, breven i kungens registratur, mönstringen i Romfartuna 1521.
  // Vad den runda knappen heter inför varje steg: det man gör just då för att komma dit (docs/historia.md).
  // Trycket ger samma sak hela tiden (mark och män). Det är namnet som följer historien. Steg som inte står här: se UI.gorOrd.
  const GOR = {
    sVasteras: 'Skicka<br>bud', sAbo: 'Skicka<br>bud', sAllmoge: 'Vinn<br>bönderna', sStaket: 'Kalla<br>män', sVadla: 'Kalla<br>män', sRiv: 'Kalla till<br>möte',
    sBrannkyrka: 'Kalla<br>män', sTegel: 'Bär<br>tegel', sAsunden: 'Kalla<br>män', sUppsala: 'Skriv till<br>bönderna', sStockholm: 'Mana<br>försvaret',
    budRattvik: 'Skicka<br>bud', budLeksand: 'Skicka<br>bud', kopparberget: 'Samla<br>dalkarlar', gavle: 'Skicka<br>bud', hedemora: 'Slå<br>mynt',
    brunnback: 'Kalla<br>män', vasteras: 'Kalla<br>män', uppsala: 'Kalla<br>män', brunkeberg: 'Kalla<br>män', vadstena: 'Skriv<br>brev', stegeborg: 'Kalla<br>män', slotten: 'Kalla<br>män',
    lubeck: 'Skriv till<br>Lübeck', blockad: 'Rusta<br>skepp', kalmar: 'Kalla<br>män', strangnas: 'Kalla till<br>riksdag', intag: 'Kalla<br>män', finland: 'Rusta<br>skepp',
    nt: 'Tryck<br>böcker', riksdag: 'Kalla till<br>riksdag', tuna: 'Kalla<br>soldater', kravelen: 'Bygg<br>skepp', kopparberget2: 'Kalla<br>soldater', sala: 'Bryt<br>silver',
    grevefejden: 'Rusta<br>flottan', gripsholm: 'Bygg<br>slott', bibeln: 'Tryck<br>Bibeln', kisa: 'Kalla<br>soldater', virserum: 'Kalla<br>soldater', arv: 'Kalla till<br>riksdag',
    fotfolk: 'Värva<br>soldater', vadstenaslott: 'Bygg<br>slott', helsingfors: 'Bygg<br>stad', viborg: 'Rusta<br>flottan'
  };
  const HANDLINGAR = [
    { id: 'tal', namn: 'Tala till folket', sture: 'Tala till bönderna', kristina: 'Mana försvararna', vad: 'Du talar själv till dem som har samlats. I tjugo sekunder ger allt som ger män tre gånger så mycket.', tid: 20, vila: 60, ger: { man: 3 } },
    { id: 'brev', namn: 'Skriv brev', vad: 'Brev till dem som tar upp skatten åt dig. I tjugo sekunder ger allt som ger mark dubbelt.', tid: 20, vila: 75, ger: { mark: 2 } },
    { id: 'monstra', namn: 'Mönstra armén', vad: 'Kalla ihop armén och räkna den. Du får genast en tredjedel av vad armén rymmer.', vila: 90, direkt: 1 / 3 }
  ];

  // Uppdragen i tur och ordning. slag: bud (löpare), tag (hären marscherar), rid (Gustav far dit själv), flotta, bygg, beslut.
  // kostar: det som skickas eller betalas. ger: bas (nya baser), x (gånger produktion), mark/man (engångsbelopp), las (låser upp), stoppar/startar (uppror).
  const UPPDRAG = [
    // ---- Akt 1: Upproret -------------------------------------------------------------------
    { id: 'budRattvik', mal: 0.4, akt: 1, titel: 'Skicka bud till Rättvik', plats: 'rattvik', ar: 1521, man: 1, slag: 'bud', kostar: { man: 12 }, ger: { bas: ['rattvik'] },
      kronika: 'Januari 1521. Byarna i norra Dalarna hade valt dig till sin ledare i Mora. Nu gick Rättvik med.' },
    { id: 'budLeksand', mal: 1, akt: 1, titel: 'Skicka bud till Leksand', plats: 'leksand', ar: 1521, man: 1, slag: 'bud', kostar: { man: 70 }, ger: { bas: ['leksand'] },
      kronika: 'Leksand följde efter. Folket kring sjön Siljan reste sig mot kung Kristian.' },
    { id: 'kopparberget', med: 1, mal: 2.2, akt: 1, titel: 'Gå mot Kopparberget', plats: 'kopparberget', ar: 1521, man: 2, slag: 'tag', strid: 'liten', kostar: { man: 400 }, ger: { bas: ['kopparberget'], mark: 60, las: ['mark'] },
      kronika: '10 februari 1521. Vid koppargruvan i Falun tog ni kungens skatteindrivare till fånga. Skattepengarna och köpmännens tyg blev era. Sedan gick folket vid gruvan med.' },
    { id: 'gavle', mal: 4, akt: 1, titel: 'Skicka bud till Gästrikland', plats: 'gavle', ar: 1521, man: 3, slag: 'bud', kostar: { man: 300, mark: 1 }, ger: { bas: ['gavle'], las: ['konster'] },
      kronika: 'Gästrikland gick med, och Gävle blev den första staden på din sida.' },
    { id: 'hedemora', mal: 5.5, akt: 1, titel: 'Gör egna mynt i Hedemora', plats: 'hedemora', ar: 1521, man: 3, slag: 'bygg', kostar: { mark: 1 }, ger: { bas: ['hedemora'], x: { mark: 1.5 }, las: ['sold'] },
      kronika: 'Våren 1521. I Hedemora gjorde ni egna mynt. Armén övades och delades in i grupper.' },
    { id: 'brunnback', mal: 8, akt: 1, titel: 'Stoppa danskarna vid Brunnbäck', plats: 'brunnback', ar: 1521, man: 4, slag: 'tag', strid: 'pilar', kostar: { man: 1500, mark: 1 }, ger: { x: { man: 1.25 }, markTid: 90 },
      kronika: 'Början av april 1521. Vid färjan i Brunnbäck sköt dalkarlarna pilar över Dalälven och drev danskarna tillbaka.' },
    { id: 'vasteras', med: 1, mal: 11, akt: 1, titel: 'Storma Västerås', plats: 'vasteras', ar: 1521, man: 4.95, slag: 'tag', strid: 'stor', kostar: { man: 4000, mark: 1 }, ger: { bas: ['vasteras'] },
      kronika: '29 april 1521. Ni vann slaget utanför Västerås. Staden var din, men slottet höll emot.' },
    { id: 'uppsala', mal: 14, akt: 1, titel: 'Ta Uppsala', plats: 'uppsala', ar: 1521, man: 5.6, slag: 'tag', strid: 'liten', kostar: { man: 3000, mark: 1 }, ger: { bas: ['uppsala'] },
      kronika: '18 maj 1521. Uppsala, ärkebiskopens stad, var din.' },
    { id: 'brunkeberg', mal: 18, akt: 1, titel: 'Slå läger utanför Stockholm', plats: 'brunkeberg', ar: 1521, man: 7, slag: 'tag', kostar: { man: 6000, mark: 1 }, ger: { las: ['belagring'], x: { mark: 1.5 } },
      kronika: 'Sommaren 1521. Armén slog läger på Brunkeberg utanför Stockholm. Men staden fick mat och soldater med skepp, och du hade inga skepp.' },
    { id: 'vadstena', mal: 21, akt: 1, titel: 'Rid till mötet i Vadstena', plats: 'vadstena', ar: 1521, man: 8.7, slag: 'rid', kostar: { mark: 1 }, ger: { bas: ['vadstena'], x: { mark: 2 }, titel: 'Riksföreståndare' },
      kronika: '23 augusti 1521. Rikets herrar samlades i Vadstena och valde dig till riksföreståndare, samma plats som Sten Sture hade haft.' },
    { id: 'stegeborg', mal: 25, akt: 1, titel: 'Ta slottet Stegeborg', plats: 'stegeborg', ar: 1521, man: 11.9, slag: 'tag', strid: 'liten', kostar: { man: 8000, mark: 1 }, ger: { fart: 1.6, markTid: 90 },
      kronika: 'Strax före jul 1521. Slottet Stegeborg gav upp, och dess befälhavare gick över till dig.' },
    { id: 'slotten', mal: 29, akt: 1, titel: 'Ta slotten i Västerås och Örebro', plats: 'orebro', ar: 1522, man: 1.9, slag: 'tag', strid: 'liten', kostar: { man: 12000, mark: 1 }, ger: { x: { mark: 2 } },
      kronika: 'Vintern 1522. Slotten i Västerås och Örebro gav upp efter långa belägringar.' },
    { id: 'lubeck', mal: 31, akt: 1, titel: 'Köp skepp i Lübeck på kredit', plats: 'soderkoping', ar: 1522, man: 6.2, slag: 'flotta', fran: 'lubeck', kostar: {}, lan: 1, ger: { las: ['skuld', 'flotta'], man: 750, x: { man: 1.25 } },
      kronika: '7 juni 1522. Tio skepp och 750 tyska soldater kom till Söderköping. Köpmän i Lübeck sålde dem för 42 000 mark, och du fick betala senare. Det var till Lübeck du flydde 1519.' },
    { id: 'blockad', mal: 35, akt: 1, titel: 'Stäng Stockholm från havet', plats: 'stockholm', ar: 1522, man: 10.5, slag: 'flotta', fran: 'soderkoping', kostar: { man: 15000, mark: 1 }, ger: { x: { mark: 1.5 } },
      kronika: 'Hösten 1522. Dina skepp stängde vägen in till Stockholm. Nu fick staden ingen mat.' },
    { id: 'kalmar', mal: 39, akt: 1, titel: 'Ta Kalmar', plats: 'kalmar', ar: 1523, man: 5.9, slag: 'tag', strid: 'stor', kostar: { man: 18000, mark: 1 }, ger: { bas: ['kalmar'] },
      kronika: '27 maj 1523. Kalmar var ditt. I Danmark hade Kristian II redan blivit avsatt och flytt landet.' },
    { id: 'strangnas', mal: 42, akt: 1, titel: 'Rid till riksdagen i Strängnäs', plats: 'strangnas', ar: 1523, man: 6.2, slag: 'rid', kostar: { mark: 1 }, ger: { x: { man: 1.25, mark: 2 }, titel: 'Kung', las: ['privilegier'] },
      kronika: '6 juni 1523. I Strängnäs valdes du till Sveriges kung. Som tack fick Lübeck sälja sina varor här utan tull och ta hand om nästan all handel.' },
    { id: 'intag', mal: 45, akt: 1, titel: 'Rid in i Stockholm', plats: 'stockholm', ar: 1523, man: 6.8, slag: 'rid', kostar: { man: 20000, mark: 1 }, ger: { bas: ['stockholm'] },
      kronika: 'Midsommar 1523. Stockholm öppnade portarna och du red in. Efter belägringen stod vartannat hus tomt.' },
    { id: 'finland', mal: 49, akt: 1, titel: 'Befria Finland', plats: 'abo', ar: 1523, man: 10, slag: 'flotta', fran: 'stockholm', kostar: { man: 25000, mark: 1 }, ger: { bas: ['abo'], x: { mark: 1.5 } },
      kronika: 'Hösten 1523. De sista slotten i Finland gav upp. Unionen med Danmark var slut.' },
    // ---- Akt 2: Kung utan pengar -----------------------------------------------------------
    { id: 'malmo', mal: 54, akt: 2, titel: 'Segla till mötet i Malmö', plats: 'malmo', ar: 1524, man: 8.9, slag: 'flotta', fran: 'kalmar', gustav: 1, kostar: { mark: 1 }, ger: { x: { mark: 1.5 } },
      kronika: '1 september 1524. Du slöt fred med Danmark i Malmö. Gotland, Skåne och Blekinge stannade hos Danmark.' },
    { id: 'betala1', mal: 59, akt: 2, titel: 'Betala av på skulden till Lübeck', plats: 'lubeck', ar: 1524, man: 10, slag: 'flotta', fran: 'stockholm', kostar: { skuldDel: 0.3 }, ger: { startar: 'dal1' },
      kronika: 'Lübeck krävde sina pengar. Du höjde skatterna och gjorde mynt med mindre silver i. I Dalarna började folk bli arga.' },
    { id: 'dal1', mal: 64, akt: 2, titel: 'Kräv lydnad av Dalarna', plats: 'storatuna', ar: 1525, man: 10, slag: 'bud', kostar: { mark: 1 }, ger: { slutar: 'dal1' },
      kronika: '1525. Två kyrkomän fick dalkarlarna att resa sig mot de dåliga mynten, de höga priserna och Lübecks köpmän. De flydde till Norge, lämnades ut och avrättades.' },
    { id: 'mariefred', mal: 65, akt: 2, titel: 'Stäng klostret i Mariefred', plats: 'gripsholm', ar: 1526, man: 1, slag: 'beslut', kostar: {}, ger: { markTid: 240 },
      kronika: 'Januari 1526. Du stängde klostret i Mariefred och tog det som fanns där. Det var det första klostret du tog.' },
    { id: 'nt', mal: 70, akt: 2, titel: 'Tryck Nya testamentet på svenska', plats: 'stockholm', ar: 1526, man: 8, slag: 'bygg', kostar: { mark: 1 }, ger: { x: { man: 1.25, mark: 1.5 } },
      kronika: '1526. Nya testamentet trycktes på svenska.' },
    { id: 'riksdag', mal: 76, akt: 2, titel: 'Kalla riksdagen till Västerås', plats: 'vasteras', ar: 1527, man: 6.5, slag: 'rid', kostar: { mark: 1 }, val: 'Hota att avgå', ger: { x: { mark: 4 }, las: ['reformation'], startar: 'dal2' },
      kronika: 'Juni 1527. I Västerås sade du att du inte längre ville vara kung. Då gav riksdagen med sig: kyrkans rikedomar och biskoparnas slott gick till kungen.' },
    { id: 'kroning', mal: 81, akt: 2, titel: 'Låt kröna dig i Uppsala', plats: 'uppsala', ar: 1528, man: 1.4, slag: 'rid', kostar: { mark: 1 }, ger: { x: { mark: 1.5 } },
      kronika: 'Januari 1528. Du kröntes till kung i Uppsala domkyrka.' },
    { id: 'tuna', med: 1, mal: 85, akt: 2, titel: 'Möt dalkarlarna vid Stora Tuna', plats: 'storatuna', ar: 1528, man: 2.5, slag: 'tag', strid: 'kanoner', kostar: { man: 14000, mark: 1 }, ger: { slutar: 'dal2' },
      kronika: 'Februari 1528. Du kom till Dalarna med fjorton tusen man och riktade kanonerna mot bönderna. Deras andra uppror var över.' },
    { id: 'vastgota', mal: 90, akt: 2, titel: 'Lugna herrarna i Västergötland', plats: 'skara', ar: 1529, man: 5, slag: 'bud', kostar: { mark: 1 }, ger: { x: { mark: 1.5 } },
      kronika: 'Våren 1529. Herrarna i Västergötland reste sig mot den nya tron. Du lovade att ge med dig, upproret föll ihop och ledarna flydde till Danmark. Ingen behövde slåss.' },
    { id: 'klockor', mal: 91, akt: 2, titel: 'Ta en klocka från varje kyrka', plats: 'leksand', ar: 1531, man: 3, slag: 'beslut', kostar: {}, ger: { skuldDel: 0.5, startar: 'klock' },
      kronika: '1531. Varje kyrka skulle lämna en klocka för att betala skulden till Lübeck. I Dalarna slog de dina sändebud och vägrade.' },
    { id: 'kravelen', mal: 97, akt: 2, titel: 'Bygg skeppet Stora Kravelen', plats: 'stockholm', ar: 1532, man: 6, slag: 'bygg', kostar: { mark: 1 }, ger: { las: ['orlog'], x: { mark: 1.5 } },
      kronika: '1532. Stora Kravelen sjösattes i Stockholm: 55 meter lång, med plats för 300 sjömän och tusen soldater.' },
    { id: 'kopparberget2', med: 1, mal: 101, akt: 2, titel: 'Gå mot Kopparberget med soldater', plats: 'kopparberget', ar: 1533, man: 1.5, slag: 'tag', kostar: { man: 16000, mark: 1 }, ger: { slutar: 'klock' },
      kronika: 'Januari 1533. Du kom med soldater till Kopparberget. Några avrättades på platsen. Bland de dömda fanns män som hade hjälpt dig vintern 1520.' },
    { id: 'sala', mal: 107, akt: 2, titel: 'Samla silverbrytningen till Sala', plats: 'sala', ar: 1534, man: 5, slag: 'bygg', kostar: { mark: 1 }, ger: { bas: ['sala'] },
      kronika: '1534. All silverbrytning samlades till gruvan i Sala. De bästa åren gav den över tre ton silver.' },
    { id: 'grevefejden', mal: 115, akt: 2, titel: 'Segla mot Lübecks flotta', plats: 'bornholm', ar: 1535, man: 6.3, slag: 'flotta', fran: 'kalmar', strid: 'sjo', kostar: { man: 20000, mark: 1 }, ger: { skuldDel: 1, slutar: 'privilegier', x: { mark: 2 } },
      kronika: '9 juni 1535. Tillsammans med danskarna vann du till sjöss vid Bornholm. Skulden till Lübeck var borta, och Lübeck styrde inte längre över handeln.' },
    // ---- Akt 3: Riket byggs ----------------------------------------------------------------
    { id: 'gripsholm', mal: 122, akt: 3, titel: 'Bygg slottet Gripsholm', plats: 'gripsholm', ar: 1537, man: 5, slag: 'bygg', kostar: { man: 6000, mark: 1 }, ger: { bas: ['gripsholm'] },
      kronika: '1537. Slottet Gripsholm började byggas, med tegel från klostren du hade stängt.' },
    { id: 'pyhy', mal: 128, akt: 3, titel: 'Anställ tyska ämbetsmän', plats: 'stockholm', ar: 1538, man: 8, slag: 'beslut', kostar: { mark: 1 }, ger: { las: ['fogdar'], x: { mark: 1.5 } },
      kronika: '1538. Du tog in kunniga tyskar för att sköta riket. Varje gård skrevs in i böcker, och fogdarna, dina skatteindrivare, samlade in skatten åt kungen i stället för åt sig själva.' },
    { id: 'orebro', mal: 134, akt: 3, titel: 'Låt rådet svära på svärdet', plats: 'orebro', ar: 1540, man: 1, slag: 'rid', kostar: { mark: 1 }, ger: { x: { mark: 1.5 } },
      kronika: 'Nyåret 1540 i Örebro. Rikets råd svor med handen på ett draget svärd att dina söner skulle ärva kronan.' },
    { id: 'bibeln', mal: 140, akt: 3, titel: 'Tryck hela Bibeln på svenska', plats: 'uppsala', ar: 1541, man: 5, slag: 'bygg', kostar: { mark: 1 }, ger: { x: { mark: 1.5 } },
      kronika: '1541. Hela Bibeln kom ut på svenska. Den kallas Gustav Vasas bibel.' },
    { id: 'kyrksilver', mal: 141, akt: 3, titel: 'Ta kyrkornas silver i Småland', plats: 'smaland', ar: 1541, man: 9, slag: 'beslut', kostar: {}, ger: { markTid: 300, startar: 'dacke' },
      kronika: '1541. Du tog kyrkornas silver i Småland och förbjöd handeln över gränsen till Danmark. Sommaren 1542 reste sig bönderna, ledda av Nils Dacke.' },
    { id: 'kisa', mal: 145, akt: 3, titel: 'Skicka de hyrda soldaterna mot Dacke', plats: 'kisa', ar: 1542, man: 9, slag: 'tag', strid: 'nederlag', kostar: { man: 12000, mark: 1 }, ger: {},
      kronika: '1542. Vid Kisa fastnade dina tyska soldater bland fällda träd och blev nedhuggna. Den 8 november tvingades du till vapenvila. Dacke firade jul på Kronobergs slott.' },
    { id: 'virserum', mal: 153, akt: 3, titel: 'Slå Dacke på isen', plats: 'virserum', ar: 1543, man: 3, slag: 'tag', strid: 'stor', kostar: { man: 28000, mark: 1 }, ger: { slutar: 'dacke', x: { mark: 1.5 } },
      kronika: 'Mars 1543. Dackes bönder förlorade på isen utanför Virserum. I augusti dödades han vid gränsen mot Blekinge.' },
    { id: 'arv', mal: 161, akt: 3, titel: 'Kalla riksdagen till Västerås', plats: 'vasteras', ar: 1544, man: 1.4, slag: 'rid', kostar: { mark: 1 }, ger: { las: ['arv'], x: { mark: 2 } },
      kronika: '13 januari 1544. Riksdagen i Västerås bestämde att kronan ska gå i arv från far till äldste son. Förut valdes kungen.' },
    // ---- Akt 4: Landsfadern ----------------------------------------------------------------
    { id: 'fotfolk', mal: 167, akt: 4, titel: 'Skaffa svenska soldater', plats: 'vasteras', ar: 1544, man: 4, slag: 'beslut', kostar: { mark: 1 }, ger: { x: { man: 2 } },
      kronika: '1544. Du började sätta upp en armé av svenska soldater i stället för dyra hyrda tyskar.' },
    { id: 'vadstenaslott', mal: 175, akt: 4, titel: 'Bygg Vadstena slott', plats: 'vadstena', ar: 1545, man: 5, slag: 'bygg', kostar: { man: 8000, mark: 1 }, ger: { borg: { vadstena: 'vadstena' }, x: { mark: 2 } },
      kronika: '1545. Vadstena slott började byggas som skydd mot Danmark och mot nya uppror i Småland.' },
    { id: 'gardar', mal: 183, akt: 4, titel: 'Anlägg kungens egna gårdar', plats: 'gripsholm', ar: 1547, man: 6, slag: 'beslut', kostar: { mark: 1 }, ger: { x: { mark: 2 } },
      kronika: 'Kungen ägde mer jord än någon annan i landet. På sina stora gårdar provade han nya sätt att bruka jorden, och varorna sålde han själv.' },
    { id: 'helsingfors', mal: 192, akt: 4, titel: 'Grunda Helsingfors', plats: 'helsingfors', ar: 1550, man: 6, slag: 'bygg', kostar: { mark: 1 }, ger: { bas: ['helsingfors'] },
      kronika: '1550. Helsingfors grundades för att ta handeln från Reval, dagens Tallinn. Köpmän från fyra andra städer tvingades flytta dit.' },
    { id: 'viborg', mal: 202, akt: 4, titel: 'Skicka flottan för att skydda Viborg', plats: 'viborg', ar: 1556, man: 1, slag: 'flotta', fran: 'stockholm', strid: 'liten', kostar: { man: 40000, mark: 1 }, ger: { bas: ['viborg'] },
      kronika: 'Januari 1556. Ryssarna anföll Viborg men drog sig tillbaka efter några dagar. Du var själv i Finland och ledde försvaret därifrån.' },
    { id: 'novgorod', mal: 209, akt: 4, titel: 'Slut fred i Novgorod', plats: 'viborg', ar: 1557, man: 4, slag: 'beslut', kostar: { mark: 1 }, ger: { x: { mark: 2 } },
      kronika: '2 april 1557. Fred med Ryssland i Novgorod. Gränsen låg kvar där den hade legat.' },
    { id: 'hertigar', mal: 216, akt: 4, titel: 'Ge sönerna egna län', plats: 'abo', ar: 1557, man: 8, slag: 'beslut', kostar: { mark: 1 }, ger: { x: { mark: 2 } },
      kronika: 'Johan fick Finland, Magnus Östergötland och Karl Södermanland att styra som hertigar. Äldste sonen Erik skulle ärva kronan.' },
    { id: 'farval', mal: 225, akt: 4, titel: 'Ta farväl av riksdagen', plats: 'stockholm', ar: 1560, man: 6.8, slag: 'rid', kostar: { mark: 1 }, ger: { slut: 1 },
      kronika: 'Midsommar 1560. Du tog farväl av riksdagen i Stockholm och lät läsa upp ditt testamente. Den 29 september dog du på Stockholms slott.' }
  ];

  // Uppror: vilka baser som står still tills upproret är över.
  // ---- Förspelet: Sten Sture den yngre 1512–1520 -----------------------------------------------
  // Tar ungefär tjugo minuter och slutar alltid på samma sätt. senast = den minut då uppdraget går iväg av sig självt, vad spelaren än gör.
  // efterMan = månaden kartan står i efter steget, när scenen efteråt slutar senare än steget (gisslan i september 1518, Kalø i september 1519, Sten Stures död i februari 1520).
  // folk = hur många figurer som syns i tåget och hos fienden. Åsunden: 10 000 man på var sida, en figur för fyrtio. Uppsala: 4 000 till 7 000 sammanlagt.
  // För Stäket, Vädla och Brännkyrka står inga antal i det lästa (vid Brännkyrka låg 1 600 bönder kvar på platsen), så där är storleken spelets val.
  // order = slagets ögonblick, i den ordning de kom: ord (knappen), rad (vad som händer), bra och miss (vad det ledde till), alltid (det som hände vad man än gör).
  //   Utan mer är det en order: en ring sluter sig kring knappen, ett tryck när den är framme. hugg: 1 = hugg i takt, ett tryck varje gång en ring når knappen
  //   (att hamra hjälper inte). vanta: sekunder = något händer som man inte kan göra något åt. hand: 'kula' = kanonkulan på Åsunden, efter den inga fler.
  //   Slaget varar så länge ögonblicken tar (G._plan), minst en halv minut (Johannes 2026-11-26: "30 sec minst, helst längre"). rader = det som sägs i ett slag utan ögonblick.
  // nytt = [månad, rad]: en rad som visas när kalendern under uppdraget når den månaden (belägringen av Stockholm 1520).
  // Texterna står i deras nutid (Johannes 2026-11-26): presens, och det som sägs kommer från folk i världen. Sägner är rykten ("Det berättas att").
  // tid = uppdraget tar så här många sekunder (belägringen av Stockholm: från maj till september, och längre än pausen mellan två scener).
  const STURE = [
    // vet = en rad om vad steget betyder för det som kommer sedan (visas under krönikan)
    { id: 'sVasteras', senast: 2, akt: 0, titel: 'Skicka bud till slottet i Västerås', plats: 'vasteras', ar: 1512, man: 1.3, slag: 'bud', fran: 'stockholm', kostar: { mark: 60 }, ger: { bas: ['vasteras'] },
      kronika: 'Januari 1512. Din far Svante Nilsson, som har styrt Sverige, är död. Budet är tillbaka från Västerås, och slottsherren svarar: "Slottet står på er sida."' },
    { id: 'sAbo', senast: 4, akt: 0, titel: 'Skicka bud över havet till Åbo', plats: 'abo', ar: 1512, man: 4.5, slag: 'flotta', fran: 'stockholm', kostar: { mark: 500 }, ger: { bas: ['abo'] },
      kronika: 'Samma år. Skeppet kommer tillbaka från Åbo. "Åbo slott är ert", hälsar slottsherren. Nu har du din fars stora slott.' },
    { id: 'sAllmoge', senast: 6, akt: 0, titel: 'Få bönderna på din sida', plats: 'nykoping', ar: 1512, man: 7.7, slag: 'bud', fran: 'stockholm', kostar: { man: 40, mark: 2500 }, ger: { bas: ['nykoping'], titel: 'Riksföreståndare' },
      kronika: '23 juli 1512. Rådet, rikets mäktigaste herrar, har valt Erik Trolle att styra. Han vill hålla ihop med Danmark. Men bönderna står bakom dig, och rådet ger med sig. Du är riksföreståndare: den som styr ett rike utan kung.' },
    { id: 'sStaket', folk: [30], med: 1, scen: 'staket', efter: '1516. Ärkebiskopens borg Stäket är instängd.', senast: 8.5, akt: 0, titel: 'Stäng in ärkebiskopen i hans borg', plats: 'staket', ar: 1516, man: 10, slag: 'tag', kostar: { man: 200, mark: 5500 }, ger: {},
      kronika: '1516. Erik Trolles son Gustav Trolle är ärkebiskop, kyrkans högste man i Sverige, och han håller på Danmarks kung. Nu är det krig mellan er. Dina män står runt hans borg Stäket vid Mälaren.' },
    { id: 'sVadla', folk: [48, 44], order: [{ ord: 'Anfall!', rad: 'Danskarna har gått i land och står på Vädla gärde.', bra: 'Dina män går rakt på dem.', miss: 'Anfallet kommer i otakt.' }, { hugg: 1, ord: 'Hugg!', rad: 'Leden möts.', bra: 'Danskarna viker.', miss: 'Leden står still.' }, { ord: 'Driv dem<br>tillbaka', rad: 'De viker mot skeppen.', bra: 'Danskarna drar sig tillbaka.', miss: 'De hinner samla sig, men viker till sist.' }, { hugg: 1, ord: 'Följ<br>efter!', rad: 'Följ efter dem mot skeppen.', bra: 'Gärdet är ditt.', miss: 'De hinner ut till skeppen.' }], med: 1, senast: 11, akt: 0, titel: 'Stoppa danskarna vid Vädla', plats: 'vadla', ar: 1517, man: 7, slag: 'tag', strid: 'liten', kostar: { man: 600, mark: 10000 }, ger: { x: { mark: 1.5 }, las: ['konster'] },
      kronika: 'Sommaren 1517. Kristian II, Danmarks kung, har skickat soldater för att hjälpa ärkebiskopen. Vid Vädla utanför Stockholm viker de tillbaka mot skeppen. Segern är din.' },
    { id: 'sRiv', scen: 'sigill', efter: 'November 1517. Brevet är beseglat.', senast: 13, akt: 0, titel: 'Kalla rikets ledare till Stockholm', plats: 'stockholm', ar: 1517, man: 11.8, slag: 'beslut', val: 'Riv Stäket', valText: 'Rikets ledare är samlade i Stockholm. Alla väntar på vad du säger.', kostar: { mark: 80000 }, ger: { bas: ['uppsala'] },
      kronika: 'November 1517. Mötet tar ifrån Gustav Trolle hans ämbete, och hans borg ska rivas. Alla sätter sitt sigill under brevet. Det berättas att biskop Brask gömmer en lapp under sitt: "Härtill är jag nödd och tvungen."',
      vet: 'Bara påven får avsätta en ärkebiskop. Gustav Trolle glömmer inte det här.' },
    { id: 'sBrannkyrka', folk: [110, 100], order: [{ ord: 'Anfall!', rad: 'Det är gryning den 27 juli. Du går till anfall.', alltid: 'En vaktpost har varnat danskarna. Anfallet slås tillbaka.' }, { hugg: 1, ord: 'Hugg!', rad: 'Danskarna står bakom sina försvarsverk.', bra: 'Försvarsverken vacklar.', miss: 'Försvarsverken håller än.' }, { ord: 'Anfall<br>igen', rad: 'Dina bönder faller danskarna i sidan, söderifrån.', bra: 'Danskarnas led brister.', miss: 'Det tar tid, men deras led brister.' }, { hugg: 1, ord: 'Hugg!', rad: 'Ditt fotfolk kommer fram.', bra: 'Danskarnas front går sönder.', miss: 'De håller ihop en stund till.' }, { ord: 'Driv dem<br>på flykt', rad: 'Danskarna flyr. Deras tunga rytteri fastnar i kärret.', bra: 'Du tar trehundra fångar.', miss: 'Många hinner undan.' }], efterMan: 9.4, med: 1, scen: 'gisslan', efter: '27 juli 1518. Kristian II är slagen vid Brännkyrka söder om Stockholm.', senast: 15.5, akt: 0, titel: 'Möt Kristian vid Brännkyrka', plats: 'brannkyrka', ar: 1518, man: 7.9, slag: 'tag', strid: 'stor', kostar: { man: 2500, mark: 200000 }, ger: { x: { man: 1.5 } },
      kronika: '27 juli 1518. Kristian II är slagen vid Brännkyrka söder om Stockholm. I september seglar han hem med sex svenskar som gisslan, bland dem den unge Gustav Eriksson.' },
    { id: 'sTegel', efterMan: 9.5, scen: 'kalo', sagt: ['vet2'], senast: 18, akt: 0, titel: 'Bär teglet från Stäket till Stockholm', plats: 'stockholm', ar: 1519, man: 6, slag: 'bygg', kostar: { man: 1500, mark: 750000 }, ger: { x: { mark: 2 } },
      kronika: '1519. Stäket är rivet, och teglet bärs till Stockholm. Kristian klagar hos påven. Med påvens stöd lyses du och dina män i bann, kyrkans hårdaste straff.',
      vet: 'Nu kan Kristian säga att hans krig mot dig är kyrkans krig.',
      vet2: 'I september rymmer Gustav Eriksson ur fångenskapen i Danmark. Han tar sig till Lübeck i Tyskland.' },
    { id: 'sAsunden', folk: [250, 250], order: [{ ord: 'Håll<br>emot', rad: 'Danskarna kommer tågande över isen.', bra: 'Leden håller.', miss: 'Leden vacklar.' }, { hugg: 1, ord: 'Hugg!', rad: 'Leden möts på isen.', bra: 'Ni står emot.', miss: 'Ni trängs bakåt.' }, { ord: 'Håll<br>leden', rad: 'Danskarnas kanoner skjuter över isen.', bra: 'Dina män står kvar.', miss: 'Leden glesnar.' }, { hand: 'kula', rad: 'En kanonkula studsar på isen och träffar dig ovanför knät. Din häst stupar.', efter: 'Dina män bär dig ur striden. Armén flyr.' }], efterMan: 2.1, med: 1, scen: 'isen', efter: '19 januari 1520. Slaget på Åsundens is är förlorat.', senast: 20.5, akt: 0, titel: 'Möt danskarna på sjön Åsundens is', plats: 'bogesund', ar: 1520, man: 1.6, slag: 'tag', strid: 'nederlag', kostar: { man: 10000, mark: 1500000 }, ger: { hjalte: 'kristina', startar: 'dagtingan' },
      kronika: '19 januari 1520. En kanonkula studsar på isen och träffar dig strax ovanför knät. Din armé flyr. Du körs hem i släde, och den 3 februari dör du på Mälarens is, 27 år gammal.' },
    { id: 'sUppsala', folk: [70, 70], order: [{ hugg: 1, ord: 'Anfall!', rad: 'Bönderna anfaller i snöoväder.', bra: 'I snön kommer danskarnas ryttare inte loss.', miss: 'Danskarna står emot.' }, { hugg: 1, ord: 'Hugg!', rad: 'Böndernas yxor går hårt åt i handgemänget.', bra: 'Danskarna viker.', miss: 'Danskarna står emot.' }, { vanta: 5, ord: 'Vänta', rad: 'Bönderna tror att slaget är vunnet och börjar plundra slagfältet.' }, { ord: 'Samla<br>leden', rad: 'Danskarna går till motanfall.', bra: 'Några led håller ihop.', miss: 'Leden faller sönder.' }], senast: 21.5, akt: 0, titel: 'Skicka bönderna mot Uppsala', plats: 'uppsala', ar: 1520, man: 4.2, slag: 'tag', strid: 'nederlag', kostar: { man: 3000, mark: 250000 }, ger: {},
      kronika: 'Långfredagen 6 april 1520. Budet når dig på Stockholms slott: bönderna har förlorat mot danskarna i Uppsala. Du, Kristina Gyllenstierna, håller fortfarande Stockholm.' },
    { id: 'sStockholm', senast: 22.5, akt: 0, titel: 'Håll Stockholm', plats: 'stockholm', ar: 1520, man: 9.2, slag: 'beslut', tid: 105, belagring: 1, val: 'Öppna portarna', valScen: 'vallen', efter: '7 september 1520. Du öppnar portarna till Stockholms slott.', nytt: [[5.95, '31 maj. Gustav Eriksson går i land vid Kalmar, hemma från Lübeck.']], valText: 'Staden är instängd. Kristian lovar att ingen ska straffas.', kostar: { man: 6000, mark: 300000 }, ger: { slutVarld: 1 },
      kronika: '7 september 1520. Du, Kristina Gyllenstierna, ger upp Stockholms slott. Kristian har lovat i ett brev att ingen ska straffas för det som har hänt.',
      vet: 'Men om att ärkebiskopen avsattes säger brevet inget tydligt.' }
  ];

  const UPPROR = {
    dagtingan: { namn: 'Har gått över till Kristian', baser: ['uppsala'] },
    dal1: { namn: 'Uppror i Dalarna', baser: ['mora', 'rattvik', 'leksand'] },
    dal2: { namn: 'Nytt uppror i Dalarna', baser: ['mora', 'rattvik', 'leksand'] },
    klock: { namn: 'Uppror om klockorna', baser: ['mora', 'rattvik', 'leksand', 'kopparberget', 'hedemora'] },
    dacke: { namn: 'Dackes uppror', baser: ['kalmar', 'vadstena'] },
    privilegier: { namn: 'Lübecks privilegier', baser: [] }
  };

  const AKTER = { 0: 'Sten Stures tid', 1: 'Upproret', 2: 'Kung utan pengar', 3: 'Riket byggs', 4: 'Landsfadern' };

  // Regentlängden: varje regent blir en egen värld. Bara den första är byggd.
  const REGENTER = [
    ['Gustav Vasa', 1523, 1560], ['Erik XIV', 1560, 1568], ['Johan III', 1568, 1592], ['Sigismund', 1592, 1599], ['Karl IX', 1599, 1611], ['Gustav II Adolf', 1611, 1632],
    ['Kristina', 1632, 1654], ['Karl X Gustav', 1654, 1660], ['Karl XI', 1660, 1697], ['Karl XII', 1697, 1718], ['Ulrika Eleonora', 1719, 1720], ['Fredrik I', 1720, 1751],
    ['Adolf Fredrik', 1751, 1771], ['Gustav III', 1771, 1792], ['Gustav IV Adolf', 1792, 1809], ['Karl XIII', 1809, 1818], ['Karl XIV Johan', 1818, 1844], ['Oscar I', 1844, 1859],
    ['Karl XV', 1859, 1872], ['Oscar II', 1872, 1907], ['Gustaf V', 1907, 1950], ['Gustaf VI Adolf', 1950, 1973], ['Carl XVI Gustaf', 1973, null]
  ];

  // Priser och produktion som balansboten har räknat fram (js/balans.js, skrivs av: node tools/balansbot.js kalibrera)
  let BAL = V.BALANS;
  if (typeof module !== 'undefined' && module.exports && !process.env.KALIBRERA) { try { BAL = require('./balans.js'); } catch (e) { BAL = null; } }
  if (BAL && !(typeof process !== 'undefined' && process.env && process.env.KALIBRERA)) {
    BASER.forEach(b => { if (BAL.bas[b.id]) Object.assign(b, BAL.bas[b.id]); });
    UPPDRAG.forEach(u => { if (BAL.mark[u.id] !== undefined) u.kostar.mark = BAL.mark[u.id]; });
  }

  // UPPDRAG pekar på den värld som spelas just nu (game.js byter): VASA eller STURE.
  V.DATA = { PLATSER, BASER, BYGGNADER, KONSTER, HANDLINGAR, GOR, UPPDRAG, VASA: UPPDRAG, STURE, STURE_BAS, UPPROR, AKTER, REGENTER };
  if (typeof module !== 'undefined' && module.exports) module.exports = V.DATA;
})(typeof window !== 'undefined' ? window : globalThis);
