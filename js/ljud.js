// Ljud: allt utom musiken görs i webbläsaren (inga ljudfiler). Vind i bakgrunden, klockor, horn, mynt och skidor. Musiken ligger i musik.js.
(function () {
  'use strict';
  const V = window.VASA;
  let ac = null, master = null, pa = true, vind = null, brus = null;
  const L = V.Ljud = {
    init() { /* ljudet vaknar vid första trycket, det kräver webbläsaren */ },
    get ac() { return ac; },
    vakna() {
      if (ac) { if (ac.state === 'suspended') ac.resume(); if (V.Musik) V.Musik.vakna(); return; }
      try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { if (V.Musik) V.Musik.vakna(); return; }
      setTimeout(() => { if (V.Musik) V.Musik.vakna(); }, 0);
      master = ac.createGain(); master.gain.value = pa ? (V.lugn ? 0.3 : 0.5) : 0; master.connect(ac.destination);
      const n = ac.sampleRate * 2; brus = ac.createBuffer(1, n, ac.sampleRate); const d = brus.getChannelData(0); for (let k = 0; k < n; k++) d[k] = Math.random() * 2 - 1;
      // vinden: brus genom ett filter som andas långsamt
      const src = ac.createBufferSource(); src.buffer = brus; src.loop = true; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380; const g = ac.createGain(); g.gain.value = 0.07;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.09; const lg = ac.createGain(); lg.gain.value = 160; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
      src.connect(f); f.connect(g); g.connect(master); src.start(); vind = g;
    },
    pa(on) { pa = !!on; if (master) master.gain.setTargetAtTime(pa ? (V.lugn ? 0.3 : 0.5) : 0, ac.currentTime, 0.05); },
    vindstyrka(v) { if (vind) vind.gain.setTargetAtTime(v, ac.currentTime, 0.8); },
    ton(freq, t0, dur, typ, vol, glid) {
      if (!ac || !pa || ac.state !== 'running') return; if (t0 === undefined) t0 = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain(); o.type = typ || 'sine'; o.frequency.setValueAtTime(freq, t0); if (glid) o.frequency.exponentialRampToValueAtTime(glid, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
    },
    sus(t0, dur, f0, f1, vol, q) {
      if (!ac || !pa || ac.state !== 'running') return;
      const s = ac.createBufferSource(); s.buffer = brus; s.loop = true; const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q || 1.2; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(f); f.connect(g); g.connect(master); s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
    },
    klockton(f, t0, vol, dur) { if (!ac) return; if (t0 === undefined) t0 = ac.currentTime; [[1, 1], [2.0, 0.6], [2.4, 0.45], [3.0, 0.3], [4.2, 0.2], [5.4, 0.12]].forEach(p => L.ton(f * p[0], t0, (dur || 3.2) / Math.sqrt(p[0]), 'sine', vol * p[1])); },
    // En liten röst (slagen 2026-11-28): en surrande ton genom tre formantfilter, så att det låter som en vokal som glider ("a" till "j", eller "o"). p = tonhöjd.
    roest(p, sort) {
      if (!ac || !pa || ac.state !== 'running') return; const t = ac.currentTime, oh = sort === 'oh', oj = sort === 'oj', f0 = p * (oh ? 170 : 260), d = oh ? 0.6 : oj ? 0.16 : 0.24;
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * (oh ? 1.15 : 1.3), t); o.frequency.exponentialRampToValueAtTime(f0 * (oh ? 0.6 : 0.85), t + d);
      const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = oh ? 6 : 11; vg.gain.value = f0 * 0.05; v.connect(vg); vg.connect(o.frequency);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(oh ? 0.2 : 0.17, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      const F = oh ? [[520, 480], [880, 780], [2500, 2400]] : oj ? [[480, 320], [900, 2000], [2500, 2700]] : [[780, 330], [1250, 2150], [2600, 2900]];
      F.forEach((f, k) => { const b = ac.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = 7 + k * 2; b.frequency.setValueAtTime(f[0], t); b.frequency.linearRampToValueAtTime(f[1], t + d * 0.8); const bg = ac.createGain(); bg.gain.value = [1, 0.55, 0.2][k] * 3; o.connect(b); b.connect(bg); bg.connect(g); });
      g.connect(master); o.start(t); v.start(t); o.stop(t + d + 0.05); v.stop(t + d + 0.05);
    },
    spela(namn) {
      if (!ac || !pa || ac.state !== 'running') return; const t = ac.currentTime;
      if (namn === 'skida') L.sus(t, 0.22, 1800 + Math.random() * 600, 700, 0.09, 0.8);
      else if (namn === 'hov') { L.ton(90, t, 0.07, 'triangle', 0.16, 50); L.ton(110, t + 0.09, 0.06, 'triangle', 0.1, 60); }
      else if (namn === 'kop') { L.ton(1175, t, 0.16, 'triangle', 0.13); L.ton(1568, t + 0.06, 0.22, 'triangle', 0.11); }
      else if (namn === 'dubbel') { [523, 659, 784, 1047].forEach((f, i) => { L.ton(f, t + i * 0.09, 0.5, 'triangle', 0.16); L.ton(f / 2, t + i * 0.09, 0.5, 'sawtooth', 0.04); }); L.klockton(1047, t + 0.36, 0.1, 1.6); }
      else if (namn === 'samling') { L.sus(t, 0.5, 500, 1100, 0.07, 0.9); L.ton(98, t, 0.2, 'sine', 0.18, 60); }
      else if (namn === 'full') { L.sus(t, 0.7, 400, 2600, 0.1, 1.5); L.ton(392, t + 0.1, 0.5, 'triangle', 0.1, 784); }
      else if (namn === 'horn') { [[147, 0, 0.5], [196, 0.42, 0.9]].forEach(n => { L.ton(n[0], t + n[1], n[2], 'sawtooth', 0.08); L.ton(n[0] * 2, t + n[1], n[2], 'triangle', 0.07); }); }
      else if (namn === 'klart') { L.klockton(392, t, 0.16); L.klockton(523, t + 0.5, 0.13); L.klockton(659, t + 1.0, 0.12); }
      else if (namn === 'klocka') L.klockton(147, t, 0.3, 4.5);
      else if (namn === 'kanon') { L.sus(t, 0.5, 300, 70, 0.4, 0.6); L.ton(70, t, 0.4, 'sine', 0.35, 30); }
      else if (namn === 'port') { L.ton(62, t, 0.6, 'sine', 0.45, 34); L.sus(t, 0.35, 220, 90, 0.2, 0.7); }
      else if (namn === 'trumma') { L.ton(82, t, 0.25, 'sine', 0.3, 48); L.sus(t, 0.12, 900, 300, 0.05, 0.7); }
      else if (namn === 'sorl') L.sus(t, 1.6, 420, 520, 0.1, 0.5);
      else if (namn === 'pil') { L.sus(t, 0.28, 2600, 900, 0.07, 2); L.sus(t + 0.07, 0.25, 2200, 800, 0.05, 2); }
      else if (namn === 'aj') L.roest(0.85 + Math.random() * 0.45, 'aj');          // en träffad gubbe: ett kort, lite komiskt aj
      else if (namn === 'ajDo') L.roest(0.7 + Math.random() * 0.25, 'oh');          // den sista träffen: ett längre ooh
      else if (namn === 'oj') L.roest(1.15 + Math.random() * 0.3, 'oj');          // en vakt som rycker till
      else if (namn === 'fall') { L.ton(110, t, 0.22, 'sine', 0.22, 55); L.sus(t, 0.18, 700, 250, 0.07, 0.8); }          // en fiende faller i slaget: en mjuk duns
      else if (namn === 'svard') { L.ton(1900, t, 0.12, 'triangle', 0.05, 1400); L.sus(t, 0.1, 3200, 1500, 0.06, 1.5); L.ton(95, t, 0.12, 'sine', 0.2, 60); }
      else if (namn === 'vag') L.sus(t, 0.55, 300, 760, 0.08, 0.6);
      else if (namn === 'hammare') { L.ton(620, t, 0.05, 'square', 0.05, 300); L.sus(t, 0.06, 2000, 800, 0.07, 0.8); }
      else if (namn === 'steg') L.sus(t, 0.1, 520, 260, 0.08, 0.9);
      else if (namn === 'nej') { L.ton(196, t, 0.3, 'triangle', 0.1, 147); L.ton(147, t + 0.25, 0.5, 'triangle', 0.1, 110); }
    }
  };
})();
