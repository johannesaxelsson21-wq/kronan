// Spellistan: vilka musikfiler spelet använder. Spelet spelar bara det som står här, och bara det läggs ut på länken.
// Namnet till vänster är stämningen eller scenen (samma namn som scenerna i js/intro.js). Se README.md här för vad varje spår är.
// Byt musik så här: lägg filen i den här mappen (mp3 går överallt, också på iPhone) och skriv in den vid rätt namn nedan.
// Flera filer inom [ ] spelas en i taget och turas om. Ett namn utan fil är tyst. Andra tagningar ligger i alt/.
window.VASA_MUSIK = {
  // vardagen (förspelet och Gustav Vasa)
  bygget: ['audio/music/bygget.mp3?v=202611280135', 'audio/music/bygget2.mp3?v=202611280135'],
  krig: 'audio/music/krig.mp3?v=202611280135',
  vinter: 'audio/music/vinter.mp3?v=202611280135',
  // början och filmen
  titel: 'audio/music/titel.mp3?v=202611280135',
  blodbadet: 'audio/music/blodbadet.mp3?v=202611280135',
  // scenerna
  staket: 'audio/music/staket.mp3?v=202611280135',
  sigill: 'audio/music/sigill.mp3?v=202611280135',
  gisslan: 'audio/music/gisslan.mp3?v=202611280135',
  kalo: 'audio/music/kalo.mp3?v=202611280135',
  isen: 'audio/music/isen.mp3?v=202611280135',
  vallen: 'audio/music/vallen.mp3?v=202611280135',
  kalmar: 'audio/music/kalmar.mp3?v=202611280135',
  // Erik XIV:s värld
  'erik-hov': 'audio/music/erik/hov.mp3?v=202611280135',
  'erik-krig': 'audio/music/erik/krig.mp3?v=202611280135',
  'erik-titel': 'audio/music/erik/titel.mp3?v=202611280135',
  'erik-kroning': 'audio/music/erik/kroning.mp3?v=202611280135',
  'erik-karin': 'audio/music/erik/karin.mp3?v=202611280135',
  'erik-sturemorden': 'audio/music/erik/sturemorden.mp3?v=202611280135',
  'erik-fange': 'audio/music/erik/fange.mp3?v=202611280135',
  // Johan III:s värld
  'johan-hov': 'audio/music/johan/hov.mp3?v=202611280135',
  'johan-krig': 'audio/music/johan/krig.mp3?v=202611280135',
  'johan-avsked': 'audio/music/johan/avsked.mp3?v=202611280135'
};
// Världarnas egna spår: värld (nummer i js/data.js, VARLDAR) -> stämning -> spår ovan. Det som saknas här spelas som vanligt.
window.VASA_MUSIK_VARLD = {
  2: { bygget: 'erik-hov', krig: 'erik-krig', titel: 'erik-titel', fange: 'erik-fange',
       kroning: 'erik-kroning', brollop: 'erik-karin', sturemord: 'erik-sturemorden' },
  3: { bygget: 'johan-hov', krig: 'johan-krig', avsked: 'johan-avsked' }
};
