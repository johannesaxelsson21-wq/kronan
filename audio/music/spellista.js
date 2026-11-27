// Spellistan: vilka musikfiler spelet använder. Spelet spelar bara det som står här, och bara det läggs ut på länken.
// Namnet till vänster är stämningen eller scenen (samma namn som scenerna i js/intro.js). Se README.md här för vad varje spår är.
// Byt musik så här: lägg filen i den här mappen (mp3 går överallt, också på iPhone) och skriv in den vid rätt namn nedan.
// Flera filer inom [ ] spelas en i taget och turas om. Ett namn utan fil är tyst. Andra tagningar ligger i alt/.
window.VASA_MUSIK = {
  // vardagen (förspelet och Gustav Vasa)
  bygget: ['audio/music/bygget.mp3?v=202611271837', 'audio/music/bygget2.mp3?v=202611271837'],
  krig: 'audio/music/krig.mp3?v=202611271837',
  vinter: 'audio/music/vinter.mp3?v=202611271837',
  // början och filmen
  titel: 'audio/music/titel.mp3?v=202611271837',
  blodbadet: 'audio/music/blodbadet.mp3?v=202611271837',
  // scenerna
  staket: 'audio/music/staket.mp3?v=202611271837',
  sigill: 'audio/music/sigill.mp3?v=202611271837',
  gisslan: 'audio/music/gisslan.mp3?v=202611271837',
  kalo: 'audio/music/kalo.mp3?v=202611271837',
  isen: 'audio/music/isen.mp3?v=202611271837',
  vallen: 'audio/music/vallen.mp3?v=202611271837',
  kalmar: 'audio/music/kalmar.mp3?v=202611271837',
  // Erik XIV:s värld
  'erik-hov': 'audio/music/erik/hov.mp3?v=202611271837',
  'erik-krig': 'audio/music/erik/krig.mp3?v=202611271837',
  'erik-titel': 'audio/music/erik/titel.mp3?v=202611271837',
  'erik-kroning': 'audio/music/erik/kroning.mp3?v=202611271837',
  'erik-karin': 'audio/music/erik/karin.mp3?v=202611271837',
  'erik-sturemorden': 'audio/music/erik/sturemorden.mp3?v=202611271837',
  'erik-fange': 'audio/music/erik/fange.mp3?v=202611271837'
};
// Världarnas egna spår: värld (nummer i js/data.js, VARLDAR) -> stämning -> spår ovan. Det som saknas här spelas som vanligt.
window.VASA_MUSIK_VARLD = {
  2: { bygget: 'erik-hov', krig: 'erik-krig', titel: 'erik-titel', fange: 'erik-fange',
       kroning: 'erik-kroning', brollop: 'erik-karin', sturemord: 'erik-sturemorden' }
};
