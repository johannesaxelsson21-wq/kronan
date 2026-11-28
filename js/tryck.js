// Ett tryck ska kännas (Johannes 2026-11-28: "Nu fattar man inte om man tryckte eller inte, det ska vara skönt att trycka på knappen").
// Knappen trycks ned och studsar tillbaka, och en liten guldglimt flyter upp där fingret var. Lugnt: inga blixtar, inget skrik.
// Gäller filmernas knapp (Tala, Åk, Rym ...) och spelets runda knapp.
(function () {
  'use strict';
  const s = document.createElement('style');
  s.textContent = '@keyframes tryckStuds{0%{transform:scale(1)}30%{transform:scale(.9)}65%{transform:scale(1.04)}100%{transform:scale(1)}}' +
    '.tryckt{animation:tryckStuds .3s ease-out!important}' +
    '@keyframes glimtUpp{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) translateY(-38px) scale(1.15)}}' +
    '.glimt{position:fixed;left:0;top:0;pointer-events:none;z-index:9999;color:#f6d978;font-size:20px;text-shadow:0 0 8px rgba(242,207,90,.9),0 1px 2px rgba(0,0,0,.6);animation:glimtUpp .75s ease-out forwards}' +
    '.knapp-pips{display:flex;gap:5px;justify-content:center;margin-top:7px}.knapp-pips i{width:8px;height:8px;border-radius:50%;background:rgba(43,28,8,.25);transition:background .2s,transform .2s}.knapp-pips i.full{background:#5d430f;transform:scale(1.15)}' +
    '.filmknapp.rund .knapp-pips i{background:rgba(255,247,223,.25)}.filmknapp.rund .knapp-pips i.full{background:#f6d978}';
  document.head.appendChild(s);
  function studs(b, x, y) {
    b.classList.remove('tryckt'); void b.offsetWidth; b.classList.add('tryckt');
    clearTimeout(b._tt); b._tt = setTimeout(() => b.classList.remove('tryckt'), 320);
    const r = b.getBoundingClientRect(), g = document.createElement('span'); g.className = 'glimt'; g.textContent = '✦';
    const gx = x || r.left + r.width / 2, gy = (y || r.top + r.height / 2) - 6; g.style.left = gx + 'px'; g.style.top = gy + 'px'; g.style.marginLeft = ((Math.random() - 0.5) * 16) + 'px';
    document.body.appendChild(g); setTimeout(() => g.remove(), 800);
  }
  document.addEventListener('pointerdown', ev => { const b = ev.target.closest && ev.target.closest('.filmknapp, #ak'); if (b) studs(b, ev.clientX, ev.clientY); }, true);
  // mellanslaget räknas som ett tryck på knappen som syns
  document.addEventListener('keydown', ev => { if (ev.code !== 'Space' || ev.repeat) return; const b = document.querySelector('#film-knapp .filmknapp') || document.getElementById('ak'); if (b && b.offsetParent) studs(b); }, true);
  window.VASA.Tryck = { studs };
})();
