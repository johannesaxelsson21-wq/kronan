// Musik: loopande spår efter stämning. Vilka filer som finns står i audio/music/spellista.js, och en stämning utan fil är tyst.
// Spåret följer det som händer: bygget i vardagen, krig under fälttåg och belägring, vinter i Dalarna och på isen, blodbadet i filmen.
// Musiken startar vid första trycket (det kräver webbläsaren) och tonar över när stämningen byts.
(function () {
  'use strict';
  const V = window.VASA, LISTA = window.VASA_MUSIK || {}, SPAR = ['bygget', 'krig', 'blodbadet', 'vinter'], VOL = 0.3, STEG = 0.025;
  const lat = {}; let vill = null, pa = true, vaken = false, tm = null;
  // Ett spår är ett vanligt ljudelement. På nätet går det genom ljudmotorn, så att volymen går att styra också på iPhone
  // (där en sida inte får ändra ett ljudelements egen volym). Från fil (dubbelklick) styrs elementets volym direkt.
  function skaffa(n) {
    if (lat[n] || !LISTA[n]) return lat[n] || null;
    const a = new Audio(LISTA[n]), o = lat[n] = { a, g: null, v: 0 }; a.loop = true; a.preload = 'auto';
    const ac = V.Ljud && V.Ljud.ac;
    if (ac && location.protocol !== 'file:') { try { const src = ac.createMediaElementSource(a); o.g = ac.createGain(); o.g.gain.value = 0; src.connect(o.g); o.g.connect(ac.destination); } catch (e) { o.g = null; } }
    if (!o.g) { try { a.volume = 0; } catch (e) { /* får inte ändras */ } }
    return o;
  }
  function tona() {          // tio gånger i sekunden: det valda spåret tonas upp, de andra ner och pausas
    let klart = true;
    for (const n in lat) {
      const o = lat[n], mal = pa && vaken && !document.hidden && n === vill ? VOL : 0; o.v += Math.max(-STEG, Math.min(STEG, mal - o.v));
      if (o.g) o.g.gain.value = o.v; else { try { o.a.volume = o.v; } catch (e) { /* får inte ändras */ } }
      if (mal > 0 && o.a.paused) { const p = o.a.play(); if (p && p.catch) p.catch(() => { }); }
      if (mal === 0 && o.v <= 0.0005 && !o.a.paused) o.a.pause();
      if (Math.abs(o.v - mal) > 0.0005) klart = false;
    }
    if (klart) { clearInterval(tm); tm = null; }
  }
  const ga = () => { if (!tm) tm = setInterval(tona, 100); };
  const M = V.Musik = {
    SPAR,
    finns() { return SPAR.some(n => !!LISTA[n]); },          // finns det någon musik alls? (annars visas ingen musikknapp)
    // Byt stämning (tonar över). Okända namn struntas i. Saknar stämningen en fil tystnar musiken.
    spar(n) { if (SPAR.indexOf(n) < 0 || n === vill) return; vill = n; if (vaken) { skaffa(n); ga(); } },
    // Stämningen som hör till läget i spelet när inget särskilt händer
    grund() {
      const S = V.Game.s, D = V.DATA;
      if (S.varld === 0) return S.hjalte === 'kristina' && S.nasta >= D.UPPDRAG.length - 1 ? 'krig' : 'bygget';          // Stockholm belägras
      return S.nasta < 3 ? 'vinter' : 'bygget';                                                                              // Dalarna vintern 1521
    },
    vakna() { if (vaken) return; vaken = true; if (!vill) vill = M.grund(); skaffa(vill); ga(); },
    satt(on) { pa = !!on; if (vaken) ga(); },
    nu() { return vill; }
  };
  document.addEventListener('visibilitychange', () => { if (vaken) ga(); });
})();
