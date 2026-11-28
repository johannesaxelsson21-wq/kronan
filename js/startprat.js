// Starten i förspelet: Sten Sture säger några meningar, en i taget, i pratbubblor ovanför sig på kartan (Johannes 2026-11-28:
// "det kom upp en mening i taget vid han som pratbubblor", inte en ruta). Spelet står still tills sista bubblan är borta.
// Sedan tar pekbubblorna i konsolen vid. Rutan med medaljongerna finns kvar bakom frågetecknet.
(function () {
  'use strict';
  const V = window.VASA, Scene = V.Scene, Geo = V.Geo;
  const RADER = {
    0: ['Sverige, 1512. Jag är Sten Sture, nitton år.', 'Min far styrde riket i kungens ställe. Nu är han död.', 'Rådet vill ge hans plats åt en vän till Danmark.', 'Jag ska bygga upp mina städer, vinna folket och hålla riket.']
  };
  let stil = false;
  function css() {
    if (stil) return; stil = true; const s = document.createElement('style');
    s.textContent = '.prat{position:fixed;left:0;top:0;z-index:40;max-width:min(330px,78vw);padding:12px 16px 10px;background:#f6ecd6;color:#3a2c1c;border:2px solid #8a6a3a;border-radius:16px;' +
      'box-shadow:0 6px 18px rgba(0,0,0,.35);font:17px/1.4 Georgia,"Times New Roman",serif;cursor:pointer;opacity:0;transition:opacity .45s;user-select:none;-webkit-tap-highlight-color:transparent}' +
      '.prat.in{opacity:1}.prat:after{content:"";position:absolute;left:var(--pil,50%);bottom:-12px;margin-left:-10px;border:10px solid transparent;border-top-color:#8a6a3a;border-bottom:0}' +
      '.prat:before{content:"";position:absolute;left:var(--pil,50%);bottom:-9px;margin-left:-8px;border:8px solid transparent;border-top-color:#f6ecd6;border-bottom:0;z-index:1}' +
      '.prat .prat-vem{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a6a3a;margin-bottom:3px}.prat .prat-vid{display:block;text-align:right;font-size:12px;color:#8a6a3a;margin-top:4px}';
    document.head.appendChild(s);
  }
  const P = V.Startprat = {
    aktiv: false,
    har(varld) { return !!RADER[varld]; },
    // klar() körs när sista bubblan är borta
    kor(varld, klar) {
      const rader = RADER[varld], UI = V.UI; if (!rader) { UI.forklara(varld); return; }
      css(); P.aktiv = true; { const r = document.getElementById('ruta'); if (r) r.style.display = 'none'; }          // pekbubblorna i konsolen väntar på att rutan är stängd if (V.Musik) V.Musik.spar('titel');
      const e = document.createElement('div'); e.className = 'prat'; document.body.appendChild(e);
      let i = -1, raf = 0;
      const hjalte = () => V.Gustav && V.Gustav.g ? V.Gustav : null;
      const lagg = () => {
        const h = hjalte(); if (h) { const sp = Scene.screenPoint(h.x, Geo.groundAt(h.x, h.z) + 1.7, h.z); if (sp && !sp.behind) {
          const w = e.offsetWidth, x = Math.max(8, Math.min(innerWidth - w - 8, sp.x - w / 2)), y = Math.max(8, sp.y - e.offsetHeight - 14);
          e.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)'; e.style.setProperty('--pil', Math.max(18, Math.min(w - 18, sp.x - x)) + 'px'); } }
        raf = requestAnimationFrame(lagg);
      };
      const nasta = () => {
        i++; if (i >= rader.length) { cancelAnimationFrame(raf); e.classList.remove('in'); setTimeout(() => e.remove(), 450); P.aktiv = false; if (V.Musik) V.Musik.spar(V.Musik.grund()); if (klar) klar(); return; }
        e.classList.remove('in'); setTimeout(() => { e.innerHTML = '<span class="prat-vem">Sten Sture</span>' + rader[i] + '<span class="prat-vid">' + (i < rader.length - 1 ? 'Tryck ▸' : 'Börja ▸') + '</span>'; void e.offsetWidth; e.classList.add('in'); if (V.Ljud) V.Ljud.spela && V.Ljud.spela('klocka'); }, i ? 260 : 0);
      };
      e.addEventListener('click', ev => { ev.stopPropagation(); nasta(); });
      window.addEventListener('keydown', function k(ev) { if (!P.aktiv) { window.removeEventListener('keydown', k); return; } if (ev.code === 'Space' || ev.code === 'Enter') { ev.preventDefault(); ev.stopImmediatePropagation(); nasta(); } }, true);
      setTimeout(() => { lagg(); nasta(); }, 1600);          // kameran hinner fram till honom först
    }
  };
  // spelet står still, och inga pekbubblor i konsolen, medan han pratar
  const UI = V.UI;
  if (UI) {
    const paus0 = UI.pausar; UI.pausar = function () { return P.aktiv || paus0.call(UI); };
    const tips0 = UI._tips; if (tips0) UI._tips = function () { const t = document.getElementById('tips'); if (t) t.style.visibility = P.aktiv ? 'hidden' : ''; return tips0.call(UI); };
  }
})();
