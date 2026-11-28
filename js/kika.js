// Ett tryck på ett understruket namn i en ruta (Läs mer) tar kameran dit, men rutan stannar öppen (Johannes 2026-11-28:
// "när man trycker på namnen här så ska man komma dit på kartan, men rutan ska inte försvinna"). Medan kameran står där
// flyttar rutan åt sidan, blir lite mindre och mörkar inte kartan, så att man ser platsen. Den stängs som vanligt med Stäng.
(function () {
  'use strict';
  const V = window.VASA, L = V.Levande, UI = V.UI; if (!L || !UI || !L.gaTill) return;
  const s = document.createElement('style');
  s.textContent = '#ruta.kika{background:transparent;pointer-events:none!important;justify-content:flex-start;align-items:center;transition:background .3s}' +
    '#ruta.kika .ruta-in{pointer-events:auto;width:min(380px,40vw);max-height:70vh;margin-left:16px;font-size:.9em;box-shadow:0 8px 26px rgba(0,0,0,.45)}' +
    '#ruta.kika .ruta-in h2{font-size:22px}#ruta.kika .ruta-in p{font-size:15px}' +
    '@media (max-width:720px){#ruta.kika{align-items:flex-start;justify-content:center}#ruta.kika .ruta-in{width:92vw;max-height:38vh;margin:10px 0 0}}';
  document.head.appendChild(s);
  const ruta = () => document.getElementById('ruta');
  const ga0 = L.gaTill;
  L.gaTill = function (m) {
    const r = ruta(), oppen = r && r.style.display !== 'none'; if (!oppen) return ga0.call(L, m);
    const st0 = UI.stang, paus = UI._paus; UI.stang = function () {};          // gaTill stänger rutan: inte nu
    try { ga0.call(L, m); } finally { UI.stang = st0; UI._paus = paus; }
    r.classList.add('kika');
  };
  const stang0 = UI.stang; UI.stang = function () { const r = ruta(); if (r) r.classList.remove('kika'); return stang0.apply(UI, arguments); };
  const ruta0 = UI.ruta; UI.ruta = function () { const r = ruta(); if (r) r.classList.remove('kika'); return ruta0.apply(UI, arguments); };
})();
