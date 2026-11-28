// Fakta för alla andra namn på kartan (Johannes 2026-11-28: "Jag vill kunna trycka på alla namn och få info, som Mälaren, kloster osv,
// allt som har ett namn ska ha en info ruta när man trycker på det"). Samma ruta och regler som ortfakta.js: nutid, inget om det som kommer
// senare, inga källor i spelet. Raderna läggs till i V.OrtFakta.F. Varje rad: [från år, till år, text]. Källor och osäkerheter: docs/namnfakta.md.
(function () {
  'use strict';
  const V = window.VASA; if (!V.OrtFakta) return;
  const A = 9999, DANSK = 'hör till Danmark';
  const N = {
    // ---- länder ----
    'Danmark': [[0, A, 'Ett kungarike kring sunden mellan Östersjön och Västerhavet. Den danske kungen äger också Skåne, Halland, Blekinge och Gotland, och tar tull av varje skepp som seglar genom Öresund.']],
    'Norge': [[0, A, 'Ett land av berg och fjordar i väster. Norge lyder under den danske kungen.']],
    'Finland': [[0, A, 'Rikets östra del, med skog, sjöar och skärgård. Åbo är den största staden, och slotten i Åbo, Tavastehus och Viborg håller landet.']],
    'Polen': [[0, 1568, 'Ett stort kungarike söder om Östersjön, med rika städer och mäktiga adelsmän.'], [1569, A, 'Ett stort rike söder om Östersjön. Polen och Litauen är förenade under en kung, och adeln väljer kungen.']],
    'Ryssland': [[0, A, 'Storfurstendömet Moskva, ett väldigt rike i öster. Storfursten vill nå Östersjön och dess handel.']],
    'Estland': [[0, A, 'Landet söder om Finska viken. Reval är den största staden, tyska herrar äger gårdarna och bönderna talar estniska.']],
    'Livland': [[0, 1560, 'Landet kring Riga, söder om Estland. Här styr tyska ordensriddare och biskopar över estniska och lettiska bönder.'], [1561, A, 'Landet kring Riga. Ordensstaten är upplöst, och Polen och Litauen styr över det mesta av landet.']],
    'Karelen': [[0, A, 'Ett skogsland mellan Finska viken och Ladoga, där gränsen mellan riket och Ryssland går.']],
    'Tyskland': [[0, A, 'Det tysk-romerska rikets länder söder om Östersjön, med hansestäder som Lübeck, Rostock och Stralsund.']],
    'Ryska gränsen': [[0, A, 'Här går gränsen mot Ryssland, genom skog och myr där få bor.']],
    // ---- landskap ----
    'Uppland': [[0, A, 'Landskapet norr om Mälaren, med bördiga slätter, Uppsala och huvudstaden Stockholm.']],
    'Södermanland': [[0, A, 'Landskapet söder om Mälaren, med herrgårdar, sjöar och staden Nyköping.']],
    'Västmanland': [[0, A, 'Landskapet norr om Mälaren väster om Uppland, med Västerås och gruvorna i Bergslagen.']],
    'Dalarna': [[0, A, 'Ett landskap av skog, sjöar och gruvor kring Dalälven. Dalkarlarna säger ifrån när fogdarna går för långt.']],
    'Gästrikland': [[0, A, 'Ett litet landskap kring Gävle, med skog, järnbruk och fiske vid kusten.']],
    'Hälsingland': [[0, A, 'Ett skogslandskap vid Bottenhavet, med stora bondgårdar och lin på åkrarna.']],
    'Närke': [[0, A, 'Landskapet kring Örebro och Hjälmaren, med slätt i mitten och skog runt omkring.']],
    'Värmland': [[0, A, 'Ett skogsland kring Klarälven och Vänerns norra strand, med finnar som bränner skog i nordost och bergsmän vid gruvorna i öster.']],
    'Östergötland': [[0, A, 'En bördig slätt kring Linköping och Vadstena, ett av rikets rikaste landskap.']],
    'Västergötland': [[0, A, 'Ett stort landskap mellan Vänern och Vättern, med slätter, skogar och domkyrkan i Skara.']],
    'Småland': [[0, A, 'Ett stort landskap av skog, sten och små gårdar. Bönderna här är vana att klara sig själva.']],
    'Gotland': [[0, A, 'En stor ö mitt i Östersjön, med Visby och nästan hundra stenkyrkor. Ön ' + DANSK + '.']],
    'Öland': [[0, A, 'En lång och smal ö utanför Kalmar, med kalkslätter och väderkvarnar. Kungen jagar gärna här.']],
    'Skåne': [[0, A, 'Ett bördigt slättland med Lund, Malmö och Helsingborg. Skåne ' + DANSK + '.']],
    'Blekinge': [[0, A, 'Ett skogigt kustland med många öar och vikar. Blekinge ' + DANSK + '.']],
    'Halland': [[0, A, 'Ett kustland med åar, sandstränder och ljunghedar. Halland ' + DANSK + '.']],
    'Österbotten': [[0, A, 'Finlands långa kust mot Bottenviken, med bönder, sälfångare och tjärbrännare.']],
    // ---- vatten ----
    'Mälaren': [[0, A, 'Rikets stora sjö, med hundratals öar. Den är rikets viktigaste väg: båtar fraktar järn, koppar och spannmål in till Stockholm.']],
    'Vättern': [[0, A, 'En lång och djup sjö med klart vatten mellan Östergötland och Västergötland. Vadstena och Jönköping ligger vid stränderna, och Visingsö mitt i.']],
    'Vänern': [[0, A, 'Rikets största sjö. Båtar för järn från Värmland söderut, och Göta älv rinner ut mot Västerhavet.']],
    'Hjälmaren': [[0, A, 'En grund sjö mellan Närke och Södermanland. Stränderna är sankiga och vattnet stiger om våren.']],
    'Siljan': [[0, A, 'En stor sjö i Dalarna. Kring stränderna ligger Mora, Rättvik och Leksand, och om vintern går vägen över isen.']],
    'Åsunden': [[0, A, 'En lång sjö i Västergötland vid Bogesund. Om vintern bär isen både folk och hästar.']],
    'Västerhavet': [[0, A, 'Havet i väster. Vid Älvsborg i Göta älvs mynning har riket sin enda hamn mot väster, utan dansk tull.']],
    'Östersjön': [[0, A, 'Havet mellan riket, Danmark, Tyskland, Polen och Livland. Här seglar hansans koggar med salt, tyg, säd och järn.']],
    'Finska viken': [[0, A, 'Den långa viken mellan Finland och Estland. Den leder österut mot Ryssland.']],
    'Ladoga': [[0, A, 'Europas största sjö, långt i öster mellan Karelen och Ryssland. Stormarna här är fruktade.']],
    'Kattegatt': [[0, A, 'Havet mellan Halland och Jylland, på väg in mot Öresund.']],
    'Öresund': [[0, A, 'Det smala sundet mellan Skåne och Själland. Varje skepp som passerar betalar tull till den danske kungen vid Helsingör.']],
    'Dalälven': [[0, A, 'Dalarnas stora älv, som rinner från fjällen genom Siljan och ut i havet vid Gästrikland.']],
    'Göta älv': [[0, A, 'Älven från Vänern ut mot Västerhavet. Vid mynningen ligger Älvsborg.']],
    'Klarälven': [[0, A, 'Värmlands stora älv, som rinner från Norge ner till Vänern.']],
    'Motala ström': [[0, A, 'Ån från Vättern genom Östergötland ut mot havet, med forsar och kvarnar.']],
    // ---- trakter och platser ----
    'Tiveden': [[0, A, 'En stor och mörk skog mellan Närke och Västergötland. Vägen genom den är smal, stenig och svår.']],
    'Novgorod': [[0, A, 'En gammal handelsstad i Ryssland, som lyder under storfursten i Moskva.']],
    'Lübeck': [[0, A, 'Hansans mäktigaste stad, med rika köpmän och stora skepp. Lübeck vill bestämma över handeln på Östersjön.']],
    'Köpenhamn': [[0, A, 'Den danske kungens stad vid Öresund, med slott, flotta och tullkammare.']],
    'Kalø': [[0, A, 'Ett slott på en halvö i en vik på Jylland, i den danske kungens tjänst.']],
    'Jönköping': [[0, A, 'En stad vid Vätterns södra spets, där vägarna från Småland och Västergötland möts.']],
    'Nydala kloster': [[0, 1529, 'Ett kloster i Smålands skogar, ett av de äldsta i riket. Munkarna odlar jorden och äger många gårdar.'], [1530, A, 'Klostret har dragits in till kronan, och munkarna har lämnat det.']],
    'Enköping': [[0, A, 'En liten stad i Uppland mellan Mälaren och Uppsala, med torg och kyrka.']],
    'Romfartuna': [[0, A, 'En socken med en stenkyrka norr om Västerås.']],
    'Dalarö': [[0, A, 'En plats i skärgården söder om Stockholm, där skeppen väntar på vind innan de seglar ut.']],
    'Falkenberg': [[0, A, 'En liten stad i Halland vid Ätrans mynning, med laxfiske i ån. Halland ' + DANSK + '.']],
    'Bohus': [[0, A, 'En fästning på en klippa vid Göta älv, på den norska sidan av gränsen.']],
    'Hova': [[0, A, 'En by i Västergötland vid vägen mot Närke, där skogen Tiveden börjar.']],
    'Aspeboda': [[0, A, 'En by nära Kopparberget i Dalarna, med bergsmansgårdar.']],
    'Rankhyttan': [[0, A, 'En hytta i Dalarna där malmen smälts till metall.']],
    'Vissefjärda': [[0, A, 'En socken i Smålands skogar nära gränsen mot Blekinge.']],
    'Borgå': [[0, A, 'En gammal stad i Nyland i Finland, vid en å nära kusten.']],
    'Ekenäs': [[0, 1545, 'En by på Finlands sydkust, nära Raseborgs slott.'], [1546, A, 'En ny stad på Finlands sydkust. Kungen vill att handeln ska gå härifrån och inte till Reval.']],
    'Raumo': [[0, A, 'En stad på Finlands västkust, med ett franciskanerkloster och sjöfart.']],
    'Ulvsby': [[0, 1557, 'En stad vid Kumo älvs mynning i Finland, dit bönderna från inlandet kommer med sina varor.'], [1558, A, 'Hamnen har blivit för grund när landet stiger, och borgarna har flyttat till Björneborg.']],
    'Björneborg': [[1558, A, 'En ny stad vid Kumo älv, närmare havet än Ulvsby, vars borgare har flyttat hit.']],
    'Vilnius': [[0, A, 'Huvudstad i storfurstendömet Litauen.']],
    'Warnemünde': [[0, A, 'En hamn där floden från Rostock når Östersjön.']],
    'Mön': [[0, A, 'En dansk ö med höga vita kalkklippor mot havet.']],
    'Bukow': [[0, A, 'En by i Mecklenburg nära Östersjökusten.']],
    'Stora Karlsö': [[0, A, 'En liten ö med branta klippor väster om Gotland, där sjöfåglarna häckar.']],
    'Odensala': [[0, A, 'En socken i Uppland nära Sigtuna, med en gammal stenkyrka.']],
    'Björkenäs': [[0, A, 'En gård vid kusten strax norr om Kalmar.']],
    'Hapsal': [[0, A, 'En liten stad med en biskopsborg på Estlands västkust.']],
    'Jamburg': [[0, A, 'En fästning vid floden Luga, öster om Narva.']],
    'Koporje': [[0, A, 'En fästning på en klippa söder om Finska viken.']],
    'Plussa': [[0, A, 'En flod i skogarna söder om Narva.']],
    'Ivangorod': [[0, A, 'En rysk fästning mittemot Narva, på andra sidan floden.']],
    'Kastelholm': [[0, A, 'Ett slott på Åland, där kronans fogde bor.']],
    'Vårfruberga': [[0, A, 'Ett kloster vid Mälarens strand i Södermanland.']],
    'Vädla': [[0, A, 'En plats vid vattnet strax utanför Stockholm.']],
    'Brännkyrka': [[0, A, 'En socken med kyrka söder om Stockholm, vid vägen mot Södertälje.']],
    'Bogesund': [[0, A, 'En liten stad vid sjön Åsunden i Västergötland, vid vägen mot den danska gränsen.']],
    'Räfsnäs': [[0, A, 'En adelsgård i Södermanland.']],
    'Stora Tuna': [[0, A, 'En stor socken i Dalarna med en mäktig stenkyrka, nära Kopparberget.']],
    'Kisa': [[0, A, 'En socken i Östergötlands skogsbygd.']],
    'Virserum': [[0, A, 'En socken i Smålands skogar.']],
    'Halmstad': [[0, A, 'En stad i Halland vid Nissans mynning, med borgare och fiskare. Halland ' + DANSK + '.']],
    'Varberg': [[0, 1564, 'En stad och en fästning på Hallands kust. Halland ' + DANSK + '.'], [1565, 1568, 'Fästningen på Hallands kust är tagen av svenskarna.'], [1569, A, 'En stad och en fästning på Hallands kust. Danskarna har tagit tillbaka den.']],
    'Axtorna': [[0, A, 'En by i Hallands skogar, öster om Varberg.']],
    'Mared': [[0, A, 'En by i Halland nära gränsen mot Småland.']],
    'Getaryggen': [[0, A, 'En höjd vid vägen i Västergötland.']],
    'Wenden': [[0, A, 'En stad med en stor borg i Livland, där ordensmästaren har haft sitt säte.']],
    'Wesenberg': [[0, A, 'En liten stad med en ordensborg i Estland, mellan Reval och Narva.']],
    'Kexholm': [[0, A, 'En fästning där Vuoksen rinner ut i Ladoga.']],
    'Brunnbäck': [[0, A, 'En färjeplats över Dalälven, där vägen från Västerås går in i Dalarna.']],
    'Bornholm': [[0, A, 'En ö mitt i Östersjön, med klippor och fiskelägen.']],
    'Lima': [[0, A, 'En socken i västra Dalarna vid Västerdalälven, nära Norge.']],
    'Sälen': [[0, A, 'De sista gårdarna i Dalarnas skogar mot den norska gränsen.']],
    'Kivinebb': [[0, A, 'En skans vid gränsen mot Ryssland på Karelska näset.']],
    'Ölands norra udde': [[0, A, 'Den norra spetsen av Öland, där skeppen rundar ön.']],
    'Teusina': [[0, A, 'En by nära Ivangorod, vid gränsen mot Ryssland.']],
    'Nokia': [[0, A, 'En gård vid en fors i Kumo älv i Finlands inland.']],
    'Riga': [[0, A, 'Livlands största stad vid floden Dünas mynning, en rik hansestad.']],
    'Kirkholm': [[0, A, 'En borg vid floden Düna, uppströms från Riga.']],
    'Skultuna': [[0, 1606, 'En by vid Svartån norr om Västerås.'], [1607, A, 'Ett mässingsbruk vid Svartån norr om Västerås.']],
    'Ryssby': [[0, A, 'En socken i Småland.']],
    // ---- städerna i orter.js: vad staden är ----
    'Sigtuna': [[0, A, 'Rikets äldsta stad, vid en vik av Mälaren. Kyrkorna står som ruiner, men dominikanernas kyrka av tegel är kvar.']],
    'Södertälje': [[0, A, 'En stad vid ett smalt näs mellan Mälaren och havet. Båtarna dras över land här.']],
    'Torshälla': [[0, A, 'En liten stad vid ån från Mälaren upp mot Eskilstuna.']],
    'Köping': [[0, A, 'En stad vid Mälarens västra ände. Hit kommer järnet från Bergslagen.']],
    'Trosa': [[0, A, 'En liten stad vid en å nära kusten i Södermanland.']],
    'Östhammar': [[0, A, 'En liten stad vid en vik i norra Uppland.']],
    'Öregrund': [[0, A, 'En liten stad vid havet i norra Uppland, med fiskare och skeppare.']],
    'Norrtälje': [[1622, A, 'En ny stad i Roslagen, vid ån där en gevärsfaktori har anlagts.']],
    'Vaxholm': [[0, A, 'En ö i skärgården, där kungen har byggt ett torn som vaktar inloppet till Stockholm.']],
    'Eskilstuna': [[0, A, 'En liten ort vid ån mellan Hjälmaren och Mälaren, med kungsgård och smedjor.']],
    'Avesta': [[0, A, 'En plats vid forsarna i Dalälven, där kopparn från Falun smälts.']],
    'Säter': [[0, A, 'En liten ort i en djup dal i södra Dalarna.']],
    'Nora': [[0, A, 'En bergslagsort vid en sjö i norra Närke, med gruvor och hyttor runt omkring.']],
    'Lindesberg': [[0, A, 'En bergslagsort vid en sjö i Västmanland.']],
    'Askersund': [[0, A, 'En liten ort vid Vätterns norra spets.']],
    'Tingvalla': [[0, A, 'En marknadsplats på ön i Klarälvens mynning, där värmlänningarna möts för att handla och hålla ting.']],
    'Karlstad': [[1584, A, 'En ny stad på ön i Klarälvens mynning, där marknadsplatsen Tingvalla låg. Hertig Karl har gett den namn och stadsrättigheter.']],
    'Bro': [[0, A, 'En marknadsplats vid Vänerns nordöstra hörn, där järnet från Bergslagen lastas på båtar.']],
    'Broo': [[1582, A, 'En ny stad vid Vänerns nordöstra hörn, där järnet från Bergslagen lastas på båtar.']],
    'Kristinehamn': [[1642, A, 'En stad vid Vänerns nordöstra hörn, där järnet från Bergslagen lastas på båtar.']],
    'Filipstad': [[1611, A, 'En ny stad bland gruvorna i östra Värmland, uppkallad efter hertig Karl Filip.']],
    'Åmål': [[0, A, 'En liten ort vid Vänerns västra strand i Dalsland.']],
    'Söderhamn': [[0, A, 'En hamn vid Hälsinglands kust.']],
    'Hudiksvall': [[0, A, 'En stad vid en vik i Hälsingland, med köpmän som handlar med lin och fisk.']],
    'Norrköping': [[0, A, 'En liten stad vid forsarna i Motala ström, med kvarnar och laxfiske.']],
    'Skänninge': [[0, A, 'En gammal stad på Östergötlands slätt, med stora tegelkyrkor och kloster.']],
    'Västervik': [[0, A, 'En stad vid kusten i Småland, med borgen Stegeholm vid inloppet.']],
    'Vimmerby': [[0, A, 'En liten stad i Smålands skogar, med marknad för boskap.']],
    'Eksjö': [[0, A, 'En liten stad i Smålands höglänt skogsbygd, med hus av trä.']],
    'Gränna': [[1652, A, 'En ny stad vid Vätterns strand, under Per Brahes slott på berget.']],
    'Mönsterås': [[0, A, 'En liten ort vid Kalmarsund.']],
    'Hjo': [[0, A, 'En liten stad vid Vätterns västra strand.']],
    'Skövde': [[0, A, 'En liten stad vid foten av Billingen i Västergötland.']],
    'Falköping': [[0, A, 'En stad på Västergötlands slätt mellan bergen, med marknader och en stor stenkyrka.']],
    'Lidköping': [[0, A, 'En stad vid Lidans mynning i Vänern, med handel på sjön.']],
    'Alingsås': [[0, A, 'En liten ort vid Säveån i Västergötland.']],
    'Borås': [[1621, A, 'En ny stad i Västergötland, där bönderna har handlat med tyg och trävaror.']],
    'Lödöse': [[0, A, 'En gammal handelsstad vid Göta älv, på vägen mellan Vänern och havet.']],
    'Nya Lödöse': [[0, A, 'En stad nära Göta älvs mynning, där handeln mot väster går.']],
    'Brätte': [[0, A, 'En liten stad vid Vänerns södra spets.']],
    'Vänersborg': [[1644, A, 'En ny stad vid Vänerns södra spets, där Göta älv rinner ut.']],
    'Göteborg': [[1603, 1611, 'En ny stad på Hisingen vid Göta älvs mynning.'], [1621, A, 'En ny stad vid Göta älvs mynning, med kanaler och vallar som i Holland.']],
    'Kungsbacka': [[0, A, 'En liten stad i norra Halland. Halland ' + DANSK + '.']],
    'Laholm': [[0, A, 'En liten stad vid Lagan i Halland, under borgen Lagaholm. Halland ' + DANSK + '.']],
    'Uddevalla': [[0, A, 'En stad vid en fjord i Bohuslän, på den norska sidan av gränsen.']],
    'Marstrand': [[0, A, 'En stad på en ö i Bohuslän, där sillen fångas. Ön hör till Norge.']],
    'Strömstad': [[0, A, 'En liten stad vid kusten i norra Bohuslän.']],
    'Ystad': [[0, A, 'En hamnstad på Skånes sydkust, med ett gråbrödrakloster. Skåne ' + DANSK + '.']],
    'Trelleborg': [[0, A, 'En liten hamnstad på Skånes sydkust. Skåne ' + DANSK + '.']],
    'Skanör': [[0, A, 'En stad på Skånes sydvästra udde, där sillmarknaden har lockat köpmän från hela Östersjön. Skåne ' + DANSK + '.']],
    'Falsterbo': [[0, A, 'En stad längst ut på Skånes sydvästra udde, med en borg och sillmarknad. Skåne ' + DANSK + '.']],
    'Simrishamn': [[0, A, 'En liten hamnstad på Skånes östkust. Skåne ' + DANSK + '.']],
    'Åhus': [[0, A, 'En stad vid Helge ås mynning, med ärkebiskopens borg. Skåne ' + DANSK + '.']],
    'Vä': [[0, A, 'En gammal stad på slätten i nordöstra Skåne, med en stor stenkyrka. Skåne ' + DANSK + '.']],
    'Kristianstad': [[1614, A, 'En ny fästningsstad i nordöstra Skåne, byggd av den danske kungen mot svenskarna.']],
    'Ängelholm': [[0, A, 'En liten stad vid Rönne å i nordvästra Skåne. Skåne ' + DANSK + '.']],
    'Båstad': [[0, A, 'En liten stad vid havet under Hallandsåsen. Skåne ' + DANSK + '.']],
    'Sölvesborg': [[0, A, 'En stad i västra Blekinge, under slottet på höjden. Blekinge ' + DANSK + '.']],
    'Elleholm': [[0, A, 'En liten stad på en holme i Mörrumsån. Blekinge ' + DANSK + '.']],
    'Ronneby': [[0, A, 'Blekinges största stad, på en backe vid ån, med Heliga Kors kyrka överst. Blekinge ' + DANSK + '.']],
    'Lyckå': [[0, A, 'En liten stad vid Lyckebyån, under slottet Lyckå. Blekinge ' + DANSK + '.']],
    'Kristianopel': [[1600, A, 'En liten befäst stad vid gränsen mellan Blekinge och Småland, byggd av den danske kungen.']],
    'Karlshamn': [[1664, A, 'En ny hamnstad i Blekinge.']],
    'Karlskrona': [[1680, A, 'En ny stad på öarna i östra Blekinge, där flottan har sin bas.']],
    'Nystad': [[1617, A, 'En ny stad på Finlands västkust.']],
    'Villmanstrand': [[1649, A, 'En ny stad vid Saimens strand i Finland.']],
    'Fredrikshamn': [[1653, A, 'En ny stad vid Finska viken, nära den ryska gränsen.']],
    'Sala': [[0, 1623, 'En gruvby vid Sala silvergruva, rikets rikaste gruva.'], [1624, A, 'En ny stad vid Sala silvergruva, rikets rikaste gruva.']]
  };
  N['Brunnbäcks färja'] = N['Brunnbäck']; N['Åsundens is'] = N['Åsunden'];
  // lägg bara till där ortfakta.js inte redan har något
  for (const k in N) if (!V.OrtFakta.F[k]) V.OrtFakta.F[k] = N[k];
})();

// ---- läget just nu, efter spelets steg (Johannes 2026-11-28: "är uppsala danskt här? Jag vill att inforutorna ska ändras med vad som händer ...
// Danskarna har tagit det, så står det, är det svenskt så ska det stå, så att rutorna ändras under spelets gång hela tiden") ----
// Överst i rutan: vem som håller orten nu, vad som just har hänt där, och vad som är på väg att hända. Räknas fram ur världens steg varje gång rutan öppnas.
(function () {
  'use strict';
  const V = window.VASA; if (!V.OrtFakta) return;
  const HALLER = { 'Danskarna': 'Danskarna', 'Fogdens män': 'Kungens fogde', 'Slottets knektar': 'Fiendens knektar', 'Knektarna': 'Fiendens knektar', 'Ryssarna': 'Ryssarna', 'Hertig Karls här': 'Hertig Karls folk', 'Dackes bönder': 'Dackes bönder' };
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
    const steg = D.UPPDRAG, ut = []; let senast = -1, fiende = null, kvar = null;
    steg.forEach((u, i) => { if (u.plats !== id) return; if (i < S.nasta) { senast = i; } else if (kvar === null) kvar = i; if (u.fiende && i >= S.nasta && !fiende) fiende = u.fiende; });
    if (S.bas && S.bas[id]) ut.push('Du håller ' + namn + '.');
    else if (fiende && HALLER[fiende]) ut.push(HALLER[fiende] + ' håller ' + namn + '.');
    else if (V.Agare) { const a = V.Agare(id); if (a[1]) ut.push((a[0] === 'ryssland' ? 'Ryssarna' : 'Danskarna') + ' håller ' + namn + '.'); }          // samma som flaggan på orten (orter.js)
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
  // Vem personen är, och vilken betydelse den har. Inget om var personen är: det står under Just nu (levande.js), så att rutan aldrig motsäger sig själv
  // (Johannes 2026-11-28: "hon hålls fången i danmark? Hon sitter ju i Stockholm? Allt måste vara historiskt korrekt och det måste vara info som är viktig").
  // Tiden räknas med månad (1520.84 = november 1520), så att ingen rad säger något innan det har hänt.
  const P = {
    gustavE: { vem: 'Gustav Eriksson av Vasaätten, en ung adelsman. Hans far Erik Johansson sitter i riksrådet.', b: [[0, 1520.83, 'Släkten står på Sturarnas sida, mot unionen med Danmark och mot ärkebiskop Gustav Trolle.'], [1520.84, A, 'Hans far och svåger avrättades i Stockholms blodbad. Han är den som kan samla svenskarna mot kung Kristian.']] },
    kristian: { vem: 'Kristian II, kung av Danmark och Norge.', b: [[0, 1520.83, 'Han vill återupprätta unionen och bli kung också i Sverige. Ärkebiskop Gustav Trolle står på hans sida.'], [1520.84, 1522.99, 'Han är krönt till Sveriges kung, men avrättningarna i Stockholm har vänt många svenskar mot honom.'], [1523, A, 'Han har förlorat makten i både Sverige och Danmark.']] },
    trolle: { vem: 'Gustav Trolle, ärkebiskop i Uppsala, av en mäktig adelssläkt.', b: [[0, 1520.83, 'Som ärkebiskop är han rikets främste kyrkoman och en av de mäktigaste herrarna. Han står på kung Kristians sida mot Sturarna.'], [1520.84, A, 'Hans anklagelse om kätteri mot Sturarnas anhängare blev skälet till avrättningarna i Stockholm. Svenskarna hatar honom.']] },
    kristina: { vem: 'Kristina Gyllenstierna, gift med riksföreståndaren Sten Sture den yngre, och själv av den mäktiga släkten Gyllenstierna.', b: [[0, 1520.08, 'Hon är rikets främsta kvinna, vid sin makes sida.'], [1520.09, 1520.83, 'Hennes make har dött av sina sår, och hon leder motståndet mot danskarna.'], [1520.84, A, 'Hon försvarade Stockholm mot danskarna efter sin makes död, och för många är hon Sturarnas sak.']] },
    slagheck: { vem: 'Didrik Slagheck, en präst från Westfalen i kung Kristians tjänst.', b: [[0, 1520.83, 'Han är en av kungens närmaste rådgivare.'], [1520.84, A, 'Han sägs ha rått kungen till avrättningarna i Stockholm, och han styr nu i Sverige i kungens namn.']] },
    norby: { vem: 'Søren Norby, sjökapten och kung Kristians trognaste man.', b: [[0, A, 'Från Gotland för han kriget vidare till sjöss, mot svenska och lybska skepp.']] },
    johan: { vem: 'Hertig Johan, Gustav Vasas son och hertig av Finland.', b: [[0, 1562.75, 'Som hertig av Finland har han egen makt och egna planer, och han söker förbund med Polen.'], [1562.76, 1563.55, 'Han har gift sig med den polska prinsessan Katarina Jagellonica, och kung Erik ser honom som ett hot.'], [1563.56, 1567.75, 'Kung Erik har låtit döma honom för förräderi och håller honom fången.'], [1567.76, A, 'Han är fri igen och samlar herrarna mot sin bror kung Erik.']] },
    rantzau: { vem: 'Daniel Rantzau, en holsteinsk adelsman och den danske kungens främste fältherre.', b: [[0, A, 'Han är Danmarks skickligaste fältherre, och hans fälttåg djupt in i Sverige visar hur sårbart riket är.']] },
    karin: { vem: 'Karin Månsdotter, en ung kvinna av enkel börd vid kung Eriks hov.', b: [[0, A, 'Kungen litar mer på henne än på sina rådsherrar, och adeln ogillar att en kvinna av folket står honom så nära.']] },
    delagardie: { vem: 'Jakob De la Gardie, en ung fältherre av fransk släkt.', b: [[0, A, 'Han leder de svenska trupper som kung Karl har skickat för att hjälpa tsaren mot Polen.']] },
    gustavadolf: { vem: 'Gustav Adolf, hertig Karls son.', b: [[0, A, 'Han är tronföljare och uppfostras för att bli kung: språk, krigskonst och att styra.']] },
    karl: { vem: 'Hertig Karl, Gustav Vasas yngste son, hertig över Södermanland, Närke och Värmland.', b: [[0, 1592, 'Han styr sitt hertigdöme nästan som ett eget rike, och han håller hårt på den lutherska läran.'], [1593, 1599, 'Han leder riket medan kung Sigismund är i Polen, och de två drar åt olika håll.'], [1600, A, 'Han styr riket och tar makten från dem som höll med Sigismund.']] },
    fleming: { vem: 'Klas Fleming, riksamiral och ståthållare i Finland.', b: [[0, A, 'Han är kung Sigismunds starkaste man i riket, och från Finland håller han landet mot hertig Karl.']] },
    erik: { vem: 'Erik, Gustav Vasas äldste son.', b: [[0, 1560.7, 'Kronprinsen. Han är lärd och musikalisk och har stora planer, bland annat att gifta sig med drottning Elisabet av England.'], [1560.71, 1568.7, 'Kung Erik XIV. Han litar mer på sina egna tjänare än på de höga herrarna.'], [1568.71, A, 'Han är avsatt och hålls fången av sin bror Johan.']] },
    hDansk0: { vem: 'Kung Kristians här, mest tyska legoknektar.', b: [[0, A, 'Knektarna slåss för betalning. Med dem vill kungen tvinga Sverige tillbaka in i unionen.']] },
    hDansk1: { vem: 'Kung Kristians knektar i Sverige, mest tyska legosoldater.', b: [[0, A, 'Så länge de håller slotten kan Gustav inte styra riket.']] },
    hDansk2: { vem: 'Den danske kungens här, med danska adelsmän och tyska legoknektar.', b: [[0, A, 'Danmark vill hålla Sverige borta från Västerhavet och ta tillbaka Kalmarunionens makt.']] },
    fLubeck1: { vem: 'Lübecks örlogsskepp.', b: [[0, A, 'Lübeck hjälper Gustav mot danskarna, men vill ha betalt och få handeln på Östersjön för egen del.']] },
    fLubeck2: { vem: 'Lübecks örlogsskepp.', b: [[0, A, 'Lübeck vill behålla sin makt över Östersjöns handel och har gått i krig för det.']] },
    hDacke: { vem: 'Bönder från Smålands skogar under Nils Dacke.', b: [[0, A, 'De har rest sig mot kungens skatter och fogdar och mot den nya kyrkan. Det är det största upproret mot kungen.']] },
    hRysk1: { vem: 'Storfursten av Moskvas här.', b: [[0, A, 'Med ryttare och bågskyttar vill storfursten flytta gränsen mot riket västerut.']] },
    hRysk3: { vem: 'Tsarens här.', b: [[0, A, 'Ryssarna vill ha Livland och en hamn vid Östersjön.']] },
    fDansk2: { vem: 'Den danske kungens örlogsflotta.', b: [[0, A, 'Den vill stänga Östersjön för svenska skepp.']] },
    hPolsk3: { vem: 'Den polske kungens här.', b: [[0, A, 'Polska ryttare och tyska knektar strider om Livland.']] },
    hPolsk4: { vem: 'Kung Sigismunds här.', b: [[0, A, 'Med polska ryttare och tyska knektar har kungen kommit för att ta tillbaka makten i Sverige.']] },
    hKarl: { vem: 'Hertig Karls bönder och knektar.', b: [[0, A, 'De strider för hertigen mot kung Sigismund och hans anhängare.']] },
    hFinsk: { vem: 'Knektarna i Finland under Klas Fleming.', b: [[0, A, 'De håller Finland för kung Sigismund.']] },
    hKlubbor: { vem: 'Bönder i Österbotten.', b: [[0, A, 'De har rest sig mot knektarna som ligger på deras gårdar och tar deras mat.']] }
  };
  function ar() { try { return V.kalender ? V.kalender().ar : 1520; } catch (e) { return 1520; } }
  function tid() { try { const d = V.Game.datum(); return d.ar + (d.man - 1) / 12; } catch (e) { return ar(); } }
  function text(id) { const p = P[id]; if (!p) return null; const Y = tid(); let r = p.b.find(q => Y >= q[0] && Y < (q[1] === Math.floor(q[1]) ? q[1] + 1 : q[1] + 0.01)); if (!r) { const f = p.b.filter(q => q[0] <= Y); r = f[f.length - 1]; } return [p.vem, r ? r[2] : '']; }
  function koppla() {
    const L = V.Levande; if (!L || !L.mer || L._merOm) return; L._merOm = 1;
    const fore = L.mer;
    L.mer = function (f) {
      const r = fore.apply(this, arguments);
      try {
        const t = text(f.d.id), ruta = document.getElementById('ruta'), stang = ruta && ruta.querySelector('.stang'); if (!t || !stang) return r;
        // knappen: en liten pill med boken, som Läs mer i steget (Johannes 2026-11-28: "knappen mer info ... var inge bra, gör den bättre")
        const knapp = document.createElement('button'); const bok = (V.UI && V.UI.IK && V.UI.IK.bok) || '';
        knapp.innerHTML = bok + '<span></span>'; knapp.querySelector('span').textContent = 'Mer om ' + f.d.namn;
        knapp.style.cssText = 'display:inline-flex;align-items:center;gap:6px;width:auto;margin:4px auto 2px;padding:5px 14px 5px 9px;font-size:14.5px;font-weight:600;letter-spacing:.03em;color:#2b1c08;background:linear-gradient(180deg,#fbf0cf,#e3cc8e);border:1px solid #8a6a1f;border-radius:14px;box-shadow:0 1px 2px rgba(0,0,0,.25);cursor:pointer';
        const svg = knapp.querySelector('svg'); if (svg) { svg.style.width = '18px'; svg.style.height = '18px'; }
        const rad = document.createElement('div'); rad.style.textAlign = 'center'; rad.appendChild(knapp);
        knapp.addEventListener('click', ev => {
          ev.stopPropagation();
          // samma ordning och samma centrerade text för alla: vem det är, vad det betyder, vad som sker just nu (Johannes: "texten är olika? endel längs sidan och endel i mitten")
          const nuEl = ruta.querySelector('.ruta-in > p:not(.mal)'), nu = nuEl ? nuEl.innerHTML : '';
          const del = document.createElement('div'); del.style.textAlign = 'center';
          del.innerHTML = '<h3>Vem</h3><p></p><h3>Betydelse</h3><p></p>' + (nu ? '<h3>Just nu</h3><p class="nu"></p>' : '');
          const ps = del.querySelectorAll('p'); ps[0].textContent = t[0]; ps[1].textContent = t[1]; if (nu) del.querySelector('.nu').innerHTML = nu;
          if (nuEl) nuEl.remove(); rad.replaceWith(del); if (L.lanka) try { L.lanka(ps[0]); L.lanka(ps[1]); } catch (e) { /* inget */ }
        });
        stang.before(rad);
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
