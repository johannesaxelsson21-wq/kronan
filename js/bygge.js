// Husen: timrade stugor, kyrkor, borgar, gruvor och städer. Allt byggs av enkla former med kraftiga proportioner.
// En bas växer i steg (var tionde nivå): varje steg är ett eget nät som poppar upp och sedan står kvar.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, MB = V.MB, U = V.U;

  const TAK = { torv: { c: '#587a38', r: '#6c8f45' }, span: { c: '#4a3e34', r: '#5c4d40' }, tegel: { c: '#a04a30', r: '#b55a3a' }, halm: { c: '#b39a58', r: '#c7ae68' }, bly: { c: '#5e6f6c', r: '#74868a' } };
  const PUTS = ['#d9cfb6', '#c9a56c', '#b85f44', '#e3dccb', '#a9785a', '#cdb58a'];
  const K = 1.4;          // husen ritas större än de står: kraftiga proportioner

  // Husens färgprogram: snö på taken, flaggor som vajar, och en målad yta i stället för platt färg
  // (plankor och stenar skiftar lite i ton, och taken har rader av spån). slat = utan den målade ytan, för gubbar och vapen.
  const mats = {};
  function material(slat) {
    const key = slat ? 'slat' : 'hus'; if (mats[key]) return mats[key];
    const mat = mats[key] = new THREE.MeshLambertMaterial({ vertexColors: true }); mat.extensions = { derivatives: true };
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aFx; uniform float uTime, uSnow; uniform vec2 uMap; varying float vSnowB; varying vec4 vYtaB;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 wp4 = modelMatrix * vec4(transformed, 1.0);
          float sLocB = smoothstep(0.5, 0.72, uSnow * 1.25 + (0.5 - wp4.z / uMap.y - 0.5) * 0.5);
          vSnowB = aFx.y < 3.5 ? sLocB * aFx.x * smoothstep(0.15, 0.5, normal.y) : 0.0;
          vYtaB = vec4(wp4.xyz, aFx.y < 2.5 ? smoothstep(0.25, 0.4, normal.y) * (1.0 - smoothstep(0.9, 0.97, normal.y)) : -1.0);
          if (aFx.y > 3.5 && aFx.y < 4.5) transformed += normal * sin(uTime * 5.0 + aFx.x * 5.0 + wp4.x * 2.0) * 0.075 * aFx.x;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vSnowB; varying vec4 vYtaB;')
        .replace('#include <color_fragment>', `#include <color_fragment>
          ${slat ? '' : `if (vYtaB.w > -0.5) {
            float narB = clamp(1.0 - fwidth(vYtaB.x) * 26.0, 0.0, 1.0);                                   // på håll flyter ytan ihop till ren färg
            vec3 rutaB = floor(vec3(vYtaB.x * 9.0 + floor(vYtaB.y * 15.0) * 0.5, vYtaB.y * 15.0, vYtaB.z * 9.0));
            float tonB = fract(sin(dot(rutaB, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
            float radB = smoothstep(0.0, 0.16, fract(vYtaB.y * 15.0));                                    // en mörk fog under varje rad
            diffuseColor.rgb *= mix(1.0, (0.9 + 0.17 * tonB) * mix(1.0, 0.8 + 0.2 * radB, vYtaB.w), narB);
          }`}
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.96, 1.0), vSnowB);`);
    };
    return mat;
  }

  // ---- husdelar -------------------------------------------------------------------------------
  function dorr(mb, x, z, h, w) { w = w || 0.14; mb.quad([x - w / 2 - 0.016, 0.045, z - 0.002], [x + w / 2 + 0.016, 0.045, z - 0.002], [x + w / 2 + 0.016, 0.066 + h, z - 0.002], [x - w / 2 - 0.016, 0.066 + h, z - 0.002], '#8a6a45', '#a5845a', 0); mb.quad([x - w / 2, 0.05, z], [x + w / 2, 0.05, z], [x + w / 2, 0.05 + h, z], [x - w / 2, 0.05 + h, z], '#2c1f16', '#3a2a1e', 0); }
  // Fönster med ljus karm och spröjs i kors
  function fonster(mb, x, y, z, s, lit) {
    const k = '#ead9b8', p = lit ? '#f0c060' : '#2f3a44', H = s * 2.2, f = 0.013, sp = 0.0045;
    mb.quad([x - s - f, y - f, z - 0.002], [x + s + f, y - f, z - 0.002], [x + s + f, y + H + f, z - 0.002], [x - s - f, y + H + f, z - 0.002], k, null, 0);
    mb.quad([x - s, y, z], [x + s, y, z], [x + s, y + H, z], [x - s, y + H, z], p, null, 0);
    mb.quad([x - sp, y, z + 0.001], [x + sp, y, z + 0.001], [x + sp, y + H, z + 0.001], [x - sp, y + H, z + 0.001], k, null, 0); mb.quad([x - s, y + H * 0.55 - sp, z + 0.001], [x + s, y + H * 0.55 - sp, z + 0.001], [x + s, y + H * 0.55 + sp, z + 0.001], [x - s, y + H * 0.55 + sp, z + 0.001], k, null, 0);
  }
  // Timrad stuga. Nocken längs x, dörren mot söder.
  function stuga(mb, w, d, h, tak, opt) {
    opt = opt || {}; const t = TAK[tak || 'torv'];
    mb.box(0, 0, 0, w + 0.08, 0.06, d + 0.08, '#8d877d', { low: '#6f6a62' });
    mb.box(0, 0.06, 0, w, h, d, opt.vagg || '#7b6650', { low: opt.vaggLag || '#4f3f31', noTop: true });
    if (!opt.vagg) for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) mb.box(sx * (w / 2 + 0.014), 0.06 + h * (k + 0.5) / 4 - 0.018, sz * (d / 2 + 0.014), 0.052, 0.036, 0.052, '#5e4a38');          // knutar
    for (let k = 1; k < 4; k++) { const y = 0.06 + h * k / 4; mb.quad([-w / 2 - 0.005, y - 0.012, d / 2 + 0.004], [w / 2 + 0.005, y - 0.012, d / 2 + 0.004], [w / 2 + 0.005, y + 0.012, d / 2 + 0.004], [-w / 2 - 0.005, y + 0.012, d / 2 + 0.004], '#4a3a2c', null, 0); }
    mb.gable(0, 0.06 + h, 0, w, d * (opt.brant || 0.58), d, t.c, { over: 0.1, gable: opt.gavel || '#6a5642', ridge: t.r });
    dorr(mb, opt.dx || -w * 0.18, d / 2 + 0.006, h * 0.72); fonster(mb, w * 0.24, 0.06 + h * 0.4, d / 2 + 0.006, 0.045, opt.ljus);
    if (opt.skorsten) mb.box(w * 0.22, 0.06 + h + d * 0.2, 0, 0.13, d * 0.42, 0.13, '#8d877d', { low: '#6f6a62' });
  }
  // Härbre: liten bod på stolpar med utskjutande övervåning.
  function harbre(mb) {
    for (const sx of [-0.18, 0.18]) for (const sz of [-0.14, 0.14]) mb.box(sx, 0, sz, 0.07, 0.14, 0.07, '#5a4838');
    mb.box(0, 0.14, 0, 0.5, 0.2, 0.42, '#735e49', { low: '#4f3f31', noTop: true }); mb.box(0, 0.34, 0, 0.62, 0.2, 0.5, '#7b6650', { low: '#5a4838', noTop: true });
    mb.gable(0, 0.54, 0, 0.62, 0.26, 0.5, TAK.span.c, { over: 0.08, gable: '#6a5642', ridge: TAK.span.r }); dorr(mb, 0, 0.215, 0.26, 0.1);
  }
  function lada(mb) { mb.box(0, 0, 0, 1.15, 0.42, 0.7, '#6f5c49', { low: '#473829', noTop: true }); mb.gable(0, 0.42, 0, 1.15, 0.5, 0.7, TAK.halm.c, { over: 0.12, gable: '#5f4d3c', ridge: TAK.halm.r }); mb.quad([-0.2, 0.02, 0.356], [0.2, 0.02, 0.356], [0.2, 0.36, 0.356], [-0.2, 0.36, 0.356], '#2c1f16', '#3a2a1e', 0); }
  // Sockenkyrka i vitkalkad sten med brant spåntak, kor i öster och vapenhus i söder.
  function kyrka(mb) {
    mb.box(0, 0, 0, 1.5, 0.78, 0.8, '#e6dfce', { low: '#bfb7a5', noTop: true }); mb.gable(0, 0.78, 0, 1.5, 0.78, 0.8, TAK.span.c, { over: 0.08, gable: '#e6dfce', ridge: TAK.span.r });
    mb.box(0.98, 0, 0, 0.56, 0.6, 0.58, '#e2dbc9', { low: '#bfb7a5', noTop: true }); mb.gable(0.98, 0.6, 0, 0.56, 0.55, 0.58, TAK.span.c, { over: 0.06, gable: '#e2dbc9', ridge: TAK.span.r });
    mb.push().move(-0.28, 0, 0.58).rotY(Math.PI / 2); mb.box(0, 0, 0, 0.36, 0.42, 0.36, '#e2dbc9', { low: '#bfb7a5', noTop: true }); mb.gable(0, 0.42, 0, 0.36, 0.34, 0.36, TAK.span.c, { over: 0.05, gable: '#e2dbc9' }); mb.pop();
    dorr(mb, -0.28, 0.77, 0.3, 0.13);
    for (const fx of [0.15, 0.5]) fonster(mb, fx, 0.34, 0.406, 0.04, false);
    mb.box(-0.75, 1.56, 0, 0.03, 0.22, 0.03, '#3a2a1e'); mb.box(-0.75, 1.68, 0, 0.12, 0.03, 0.03, '#3a2a1e');
  }
  // Klockstapel: fristående rödtjärat klocktorn av trä.
  function klockstapel(mb) {
    mb.box(0, 0, 0, 0.46, 0.5, 0.46, '#6a3526', { low: '#45231a', noTop: true }); mb.hip(0, 0.5, 0, 0.5, 0.22, 0.5, '#4a3e34', 0.06);
    mb.box(0, 0.66, 0, 0.3, 0.42, 0.3, '#74392a', { low: '#55291e', noTop: true }); mb.box(0, 0.82, 0.151, 0.14, 0.16, 0.01, '#1e1814');
    mb.hip(0, 1.08, 0, 0.34, 0.2, 0.34, '#4a3e34', 0.06); mb.cone(0, 1.24, 0, 0.09, 0.5, 6, '#4a3e34', { low: '#3a3029' });
  }
  // Domkyrka i tegel. torn: antal västtorn.
  function domkyrka(mb, torn, s) {
    s = s || 1; mb.push().scale(s);
    mb.box(0, 0, 0, 2.4, 1.15, 0.9, '#9c4c38', { low: '#733526', noTop: true }); mb.gable(0, 1.15, 0, 2.4, 0.8, 0.9, '#52635f', { over: 0.05, gable: '#9c4c38', ridge: '#687a76' });
    for (const sz of [-0.62, 0.62]) { mb.box(0, 0, sz, 2.2, 0.62, 0.36, '#964733', { low: '#6e3223', noTop: true }); mb.quad([-1.1, 0.62, sz + (sz > 0 ? 0.18 : -0.18)], [1.1, 0.62, sz + (sz > 0 ? 0.18 : -0.18)], [1.1, 0.95, sz - (sz > 0 ? 0.18 : -0.18)], [-1.1, 0.95, sz - (sz > 0 ? 0.18 : -0.18)], '#52635f', '#687a76', 1); }
    for (let k = 0; k < 5; k++) { const x = -0.9 + k * 0.45; mb.box(x, 0, 0.84, 0.1, 0.7, 0.1, '#8a4230', { low: '#663022' }); mb.box(x, 0, -0.84, 0.1, 0.7, 0.1, '#8a4230', { low: '#663022' }); fonster(mb, x + 0.22, 0.2, 0.805, 0.05, false); }
    mb.cyl(1.2, 0, 0, 0.46, 0.46, 1.0, 8, '#9c4c38', { low: '#733526' }); mb.cone(1.2, 1.0, 0, 0.5, 0.6, 8, '#52635f', { low: '#3f4d4a' });
    const tz = torn === 2 ? [-0.36, 0.36] : [0];
    for (const z of tz) { mb.box(-1.42, 0, z, 0.62, 2.0, 0.62, '#a5523c', { low: '#733526', noTop: true }); mb.hip(-1.42, 2.0, z, 0.66, 0.3, 0.66, '#52635f', 0.04); mb.cone(-1.42, 2.2, z, 0.2, 1.0, 6, '#5e726d', { low: '#3f4d4a' }); fonster(mb, -1.42, 1.3, z + 0.312, 0.06, false); }
    dorr(mb, -1.42, torn === 2 ? 0.675 : 0.312, 0.4, 0.2);
    mb.pop();
  }
  // Borgarhus i en stad: smalt, högt, gaveln mot gatan (söder).
  function stadshus(mb, w, d, h, puts, tak) {
    const t = TAK[tak || 'tegel'];
    const th = w * 0.6, sten = puts !== '#7b6650';          // takhöjden: lagom brant (förut 0,85 och taket stack ut som en fena)
    mb.push().rotY(Math.PI / 2); mb.box(0, 0, 0, d, h, w, puts, { low: '#6f6253', noTop: true }); mb.gable(0, h, 0, d, th, w, t.c, { over: 0.035, gable: puts, ridge: t.r }); mb.pop();
    if (sten) { for (let i = 1; i <= 3; i++) { const f = i / 4, y = h + th * f - 0.03, x = (w / 2) * (1 - f) + 0.02; for (const s of [-1, 1]) mb.box(s * x, y, d / 2 - 0.035, 0.075, 0.07, 0.075, puts, { low: puts }); } mb.box(0, h + th - 0.02, d / 2 - 0.035, 0.08, 0.08, 0.075, puts, { low: puts }); }          // trappgavel
    fonster(mb, 0, h + th * 0.22, d / 2 + 0.006, 0.026, false);          // gavelfönster
    dorr(mb, -w * 0.15, d / 2 + 0.006, 0.26, 0.11); fonster(mb, w * 0.2, 0.12, d / 2 + 0.006, 0.04, false); fonster(mb, -w * 0.2, h * 0.62, d / 2 + 0.006, 0.035, false); fonster(mb, w * 0.2, h * 0.62, d / 2 + 0.006, 0.035, false);
  }
  function mur(mb, x0, z0, x1, z1, h) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), a = Math.atan2(-dz, dx);
    mb.push().move((x0 + x1) / 2, 0, (z0 + z1) / 2).rotY(a); mb.box(0, 0, 0, L, h, 0.16, '#9a948a', { low: '#6f6a62' });
    for (let k = 0; k < Math.floor(L / 0.22); k++) mb.box(-L / 2 + 0.11 + k * 0.22, h, 0.05, 0.1, 0.09, 0.06, '#9a948a', { low: '#827c73' });
    mb.pop();
  }
  function glugg(mb, x, y, z, h) { mb.quad([x - 0.016, y, z], [x + 0.016, y, z], [x + 0.016, y + h, z], [x - 0.016, y + h, z], '#1e1a17', null, 0); }          // skottglugg
  function port(mb, x, z, w, h) { mb.quad([x - w / 2 - 0.03, 0, z - 0.002], [x + w / 2 + 0.03, 0, z - 0.002], [x + w / 2 + 0.03, h + 0.05, z - 0.002], [x - w / 2 - 0.03, h + 0.05, z - 0.002], '#7f786d', '#8f887c', 0); mb.quad([x - w / 2, 0, z], [x + w / 2, 0, z], [x + w / 2, h * 0.75, z], [x - w / 2, h * 0.75, z], '#2a2018', '#3a2c20', 0); mb.tri([x - w / 2, h * 0.75, z], [x + w / 2, h * 0.75, z], [x, h, z], '#3a2c20', 0); }
  function rundtorn(mb, x, z, r, h, sten, tak, spets) { glugg(mb, x, h * 0.45, z + r * 0.97 + 0.004, 0.12); glugg(mb, x, h * 0.75, z + r * 0.955 + 0.004, 0.1); mb.cyl(x, 0, z, r, r * 0.94, h, 9, sten || '#9a948a', { low: '#6a655d' }); mb.cyl(x, h, z, r * 1.1, r * 1.1, 0.1, 9, sten || '#9a948a', { low: '#827c73' }); mb.cone(x, h + 0.1, z, r * 1.15, spets || r * 1.5, 9, tak || '#4a3e34', { low: '#372e28' }); }
  function fyrtorn(mb, x, z, w, h, sten, tak) { glugg(mb, x, h * 0.5, z + w / 2 + 0.004, 0.13); fonster(mb, x, h * 0.72, z + w / 2 + 0.005, 0.03, false); mb.box(x, 0, z, w, h, w, sten || '#9a948a', { low: '#6a655d', noTop: true }); mb.hip(x, h, z, w, w * 0.8, w, tak || '#4a3e34', 0.06); }

  // Borgar. Varje sort har en tydlig siluett.
  function borg(mb, sort, steg) {
    if (sort === 'liten') {
      mur(mb, -1, 0.8, 1, 0.8, 0.5); mur(mb, -1, -0.8, 1, -0.8, 0.5); mur(mb, -1, -0.8, -1, 0.8, 0.5); mur(mb, 1, -0.8, 1, 0.8, 0.5);
      port(mb, -0.45, 0.885, 0.3, 0.34); fyrtorn(mb, -0.1, -0.2, 0.8, 1.25, '#a39c90', '#4a3e34'); rundtorn(mb, 1, 0.8, 0.3, 0.8); rundtorn(mb, -1, 0.8, 0.26, 0.7); mb.box(0.5, 0, -0.35, 0.6, 0.5, 0.5, '#a39c90', { low: '#6a655d', noTop: true }); mb.gable(0.5, 0.5, -0.35, 0.6, 0.3, 0.5, '#4a3e34', { gable: '#a39c90' });
    } else if (sort === 'kalmar') {
      mur(mb, -1.1, 1.1, 1.1, 1.1, 0.62); mur(mb, -1.1, -1.1, 1.1, -1.1, 0.62); mur(mb, -1.1, -1.1, -1.1, 1.1, 0.62); mur(mb, 1.1, -1.1, 1.1, 1.1, 0.62);
      for (const [x, z] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) rundtorn(mb, x, z, 0.38, 1.05, '#a8a093', '#4a3e34', 0.7);
      mb.box(0, 0, -0.5, 1.5, 0.9, 0.6, '#aaa295', { low: '#6a655d', noTop: true }); mb.gable(0, 0.9, -0.5, 1.5, 0.45, 0.6, '#4a3e34', { gable: '#aaa295' }); fyrtorn(mb, -0.55, 0.25, 0.55, 1.2, '#a8a093'); mb.box(0.4, 0, 0.3, 0.8, 0.6, 0.5, '#a39c90', { low: '#6a655d', noTop: true }); mb.gable(0.4, 0.6, 0.3, 0.8, 0.35, 0.5, '#4a3e34', { gable: '#a39c90' });
    } else if (sort === 'stockholm') {
      // Stockholms slott: det runda kärntornet från 1200-talet mitt i en muromgärdad borg. Namnet Tre Kronor kom först 1588.
      mur(mb, -1.7, 1.2, 1.7, 1.2, 0.75); mur(mb, -1.7, -1.2, 1.7, -1.2, 0.75); mur(mb, -1.7, -1.2, -1.7, 1.2, 0.75); mur(mb, 1.7, -1.2, 1.7, 1.2, 0.75);
      port(mb, -0.75, 1.285, 0.34, 0.4); for (const [x, z] of [[-1.7, -1.2], [1.7, -1.2], [-1.7, 1.2], [1.7, 1.2]]) fyrtorn(mb, x, z, 0.52, 1.1, '#a39c90');
      for (const y of [0.7, 1.25, 1.7]) fonster(mb, 0.2, y, -0.1 + 0.565, 0.035, y < 1);          // fönster i kärntornet
      mb.cyl(0.2, 0, -0.1, 0.56, 0.52, 2.0, 12, '#aba395', { low: '#6a655d' }); mb.cyl(0.2, 2.0, -0.1, 0.62, 0.62, 0.14, 12, '#aba395', { low: '#8a8479' }); mb.cone(0.2, 2.14, -0.1, 0.6, 0.7, 12, '#4a3e34', { low: '#372e28' });
      mb.box(-0.95, 0, -0.65, 1.1, 0.95, 0.6, '#a8a093', { low: '#6a655d', noTop: true }); mb.gable(-0.95, 0.95, -0.65, 1.1, 0.4, 0.6, '#4a3e34', { gable: '#a8a093' });
      mb.box(1.05, 0, 0.5, 0.9, 0.8, 0.55, '#a39c90', { low: '#6a655d', noTop: true }); mb.gable(1.05, 0.8, 0.5, 0.9, 0.36, 0.55, '#4a3e34', { gable: '#a39c90' }); fyrtorn(mb, 0, 1.2, 0.5, 0.95, '#9a948a');
    } else if (sort === 'gripsholm') {
      // Fyra runda tegeltorn kring en trång borggård. Byggs steg för steg från 1537.
      const T = [[-0.85, -0.7, 0.5, 1.55], [0.9, -0.6, 0.44, 1.35], [-0.8, 0.75, 0.4, 1.2], [0.85, 0.8, 0.46, 1.4]], n = Math.min(4, 1 + steg);
      for (let k = 0; k < n; k++) { const t = T[k]; mb.cyl(t[0], 0, t[1], t[2], t[2] * 0.95, t[3], 10, '#a1503a', { low: '#733526' }); mb.cyl(t[0], t[3], t[1], t[2] * 1.06, t[2] * 1.06, 0.08, 10, '#a1503a', { low: '#8a4230' }); mb.blob(t[0], t[3] + 0.08, t[1], t[2] * 1.02, t[2] * 0.7, t[2] * 1.02, '#52635f', { top: '#6d807b', low: '#3f4d4a', snow: 0.8 }); mb.cone(t[0], t[3] + 0.5, t[1], 0.07, 0.34, 5, '#52635f'); }
      if (steg >= 1) { mb.box(0, 0, -0.75, 1.5, 0.95, 0.5, '#9c4c38', { low: '#733526', noTop: true }); mb.gable(0, 0.95, -0.75, 1.5, 0.4, 0.5, '#52635f', { gable: '#9c4c38' }); }
      if (steg >= 2) { mb.push().rotY(Math.PI / 2); mb.box(0, 0, 0.95, 1.2, 0.85, 0.45, '#9c4c38', { low: '#733526', noTop: true }); mb.gable(0, 0.85, 0.95, 1.2, 0.36, 0.45, '#52635f', { gable: '#9c4c38' }); mb.pop(); }
      if (steg >= 3) { mb.box(0.05, 0, 0.85, 1.4, 0.8, 0.45, '#9c4c38', { low: '#733526', noTop: true }); mb.gable(0.05, 0.8, 0.85, 1.4, 0.36, 0.45, '#52635f', { gable: '#9c4c38' }); mb.push().rotY(Math.PI / 2); mb.box(0, 0, -0.9, 1.2, 0.85, 0.45, '#9c4c38', { low: '#733526', noTop: true }); mb.gable(0, 0.85, -0.9, 1.2, 0.36, 0.45, '#52635f', { gable: '#9c4c38' }); mb.pop(); }
      if (steg < 3) stallning(mb, 0.1, 0.1, 1.2, 1.0 + steg * 0.2);
    } else if (sort === 'vadstena') {
      mb.box(0, 0, 0, 2.6, 1.0, 0.75, '#b9b0a0', { low: '#7a7469', noTop: true }); mb.gable(0, 1.0, 0, 2.6, 0.5, 0.75, '#52635f', { gable: '#b9b0a0', ridge: '#6d807b' });
      fyrtorn(mb, 0, 0, 0.62, 1.7, '#bdb4a4', '#52635f'); mb.cone(0, 2.15, 0, 0.12, 0.6, 6, '#52635f');
      for (const [x, z] of [[-1.7, -0.9], [1.7, -0.9], [-1.7, 0.9], [1.7, 0.9]]) { mb.cyl(x, 0, z, 0.5, 0.46, 0.55, 10, '#a8a093', { low: '#6a655d' }); mb.cone(x, 0.55, z, 0.52, 0.3, 10, '#52635f', { low: '#3f4d4a' }); }
      mur(mb, -1.7, 0.9, 1.7, 0.9, 0.42); mur(mb, -1.7, -0.9, 1.7, -0.9, 0.42); mur(mb, -1.7, -0.9, -1.7, 0.9, 0.42); mur(mb, 1.7, -0.9, 1.7, 0.9, 0.42);
    } else if (sort === 'viborg') {
      mb.cyl(0, 0, 0, 0.5, 0.44, 2.3, 10, '#e2dccd', { low: '#a39c90' }); mb.cone(0, 2.3, 0, 0.5, 0.7, 10, '#4a3e34', { low: '#372e28' });
      mur(mb, -1.2, 0.9, 1.2, 0.9, 0.6); mur(mb, -1.2, -0.9, 1.2, -0.9, 0.6); mur(mb, -1.2, -0.9, -1.2, 0.9, 0.6); mur(mb, 1.2, -0.9, 1.2, 0.9, 0.6);
      mb.box(0.75, 0, -0.3, 0.7, 0.85, 0.9, '#d8d1c0', { low: '#9a948a', noTop: true }); mb.gable(0.75, 0.85, -0.3, 0.7, 0.4, 0.9, '#4a3e34', { gable: '#d8d1c0' }); rundtorn(mb, -1.2, 0.9, 0.3, 0.9, '#d8d1c0');
    }
  }
  function stallning(mb, x, z, w, h) {       // byggnadsställning av ljust virke
    for (const sx of [-w / 2, 0, w / 2]) for (const sz of [-w / 2, w / 2]) mb.box(x + sx, 0, z + sz, 0.04, h, 0.04, '#b9935f');
    for (let y = 0.35; y < h; y += 0.35) { mb.box(x, y, z + w / 2, w, 0.03, 0.05, '#b9935f'); mb.box(x, y, z - w / 2, w, 0.03, 0.05, '#b9935f'); mb.box(x, y, z, w * 0.9, 0.02, w, '#c9a46f', { snowTop: 0.3 }); }
  }
  // Gruvan: dagbrott med stenkant, spel (vindspel), hyttor och malmhögar.
  function gruvhal(mb, r) {
    mb.cyl(0, 0.012, 0, r, r * 0.9, 0.004, 14, '#241f1c', { cap: '#1c1816', capSnow: 0 });
    for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283, rr = r * (1 + ((k * 7) % 5) * 0.03); mb.blob(Math.cos(a) * rr, 0.04, Math.sin(a) * rr, 0.2 + (k % 3) * 0.05, 0.13, 0.18, '#857f77', { top: '#9d968c', low: '#5f5a54' }); }
    mb.cyl(0, 0.014, 0, r * 0.55, r * 0.5, 0.003, 10, '#120f0e', { cap: '#0d0b0a', capSnow: 0 });
  }
  function spel(mb) {
    for (const s of [-1, 1]) { mb.push().move(s * 0.22, 0, 0).rotZ(s * 0.28); mb.box(0, 0, 0, 0.05, 0.62, 0.05, '#7b6650'); mb.pop(); }
    mb.push().move(0, 0.42, 0).rotZ(Math.PI / 2); mb.cyl(0, -0.2, 0, 0.07, 0.07, 0.4, 6, '#5a4838'); mb.pop();
    mb.gable(0, 0.56, 0, 0.5, 0.16, 0.34, '#4a3e34', { over: 0.04 });
  }
  function hytta(mb, hjul) {
    mb.box(0, 0, 0, 0.8, 0.36, 0.6, '#8d877d', { low: '#5f5a54', noTop: true }); mb.gable(0, 0.36, 0, 0.8, 0.32, 0.6, '#4a3e34', { over: 0.08, gable: '#6a5642' });
    mb.box(0.2, 0.3, -0.05, 0.2, 0.62, 0.2, '#7a746b', { low: '#5f5a54' }); dorr(mb, -0.15, 0.306, 0.24, 0.13);
    if (hjul) { mb.push().move(-0.48, 0.3, 0).rotZ(Math.PI / 2); mb.cyl(0, -0.04, 0, 0.3, 0.3, 0.08, 10, '#6b5743', { cap: '#5a4838' }); mb.pop(); }
  }
  function mila(mb) { mb.cone(0, 0, 0, 0.34, 0.34, 8, '#2e2824', { low: '#1f1b18', tip: '#3a332e', snowLow: 0, snowTip: 0.2 }); }
  function malm(mb, c) { mb.blob(0, 0.05, 0, 0.2, 0.12, 0.18, c, { low: '#3a2a22' }); mb.blob(0.16, 0.04, 0.08, 0.13, 0.09, 0.12, c, { low: '#3a2a22' }); }
  function talt(mb) { mb.hip(0, 0, 0, 0.44, 0.36, 0.44, '#d8cdb2', 0); mb.box(0, 0.36, 0, 0.02, 0.1, 0.02, '#5a4838'); }
  function eld(mb) { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283; mb.blob(Math.cos(a) * 0.1, 0.02, Math.sin(a) * 0.1, 0.045, 0.03, 0.045, '#6f6a62'); } const k0 = mb.kind; mb.kind = 3; mb.cone(0, 0.02, 0, 0.07, 0.2, 5, '#ffb030', { tip: '#ffe9a0', low: '#ff6a1a', snowLow: 0, snowTip: 0 }); mb.kind = k0; }
  function brygga(mb, len) { mb.box(0, 0.05, len / 2, 0.3, 0.04, len, '#8a7256', { low: '#5a4838' }); for (let k = 0; k < len; k += 0.4) for (const s of [-0.13, 0.13]) mb.box(s, -0.2, k + 0.1, 0.05, 0.27, 0.05, '#4f3f31'); }
  function gardsgard(mb, x0, z0, x1, z1) { const L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(-(z1 - z0), x1 - x0); mb.push().move((x0 + x1) / 2, 0, (z0 + z1) / 2).rotY(a); for (let k = -L / 2; k < L / 2; k += 0.16) { mb.push().move(k, 0, 0).rotZ(-0.9); mb.box(0, -0.02, 0, 0.022, 0.26, 0.022, '#8f8475'); mb.pop(); } mb.box(0, 0.09, 0, L, 0.02, 0.02, '#8f8475'); mb.pop(); }
  function stand(mb) { for (const sx of [-0.2, 0.2]) for (const sz of [-0.12, 0.12]) mb.box(sx, 0, sz, 0.03, 0.3, 0.03, '#6b5743'); mb.box(0, 0.14, 0, 0.44, 0.03, 0.28, '#8a7256'); mb.gable(0, 0.3, 0, 0.46, 0.1, 0.3, '#b8482f', { over: 0.03 }); }
  // Skrov på stapelbädden (Stora Kravelen byggs i Stockholm 1532).
  function stapel(mb) { mb.box(0, 0.08, 0, 1.5, 0.22, 0.4, '#7b6650', { low: '#4f3f31' }); mb.box(0.62, 0.3, 0, 0.3, 0.18, 0.36, '#735e49'); mb.box(-0.6, 0.3, 0, 0.36, 0.26, 0.38, '#735e49'); for (let k = -0.6; k <= 0.6; k += 0.3) mb.box(k, 0, 0.3, 0.04, 0.36, 0.04, '#b9935f'), mb.box(k, 0, -0.3, 0.04, 0.36, 0.04, '#b9935f'); }

  // ---- en tomt håller reda på var det redan står något ----------------------------------------
  class Tomt {
    constructor(base, p) { this.b = base; this.p = p; this.K = K; this.occ = []; this.vag = [];
      // vägarna in till platsen hålls fria, så blir det gator mellan husen
      for (const pts of (V.Rike.vagarVid ? V.Rike.vagarVid(base.id) : [])) { let last = null; for (const q of pts) { const d = Math.hypot(q[0] - p.x, q[1] - p.z); if (d > 9) break; if (last && Math.hypot(q[0] - last[0], q[1] - last[1]) < 0.5) continue; last = q; this.occ.push([(q[0] - p.x) / K, (q[1] - p.z) / K, 0.36]); this.vag.push([(q[0] - p.x) / K, (q[1] - p.z) / K]); } }
      for (const h of V.DATA.BYGGNADER) if (h.plats === base.id && !h.niva && h.x !== undefined && h.id !== 'torn') this.occ.push([h.x, h.z, 0.75]);          // köpta byggnader har sin plats från början
      this.rnd = Geo.rng(base.id.length * 7919 + base.id.charCodeAt(0) * 131 + base.id.charCodeAt(1)); this.R = V.Rike.RADIE[base.slag] * (base.stor ? 1.35 : 1); }
    ok(x, z, r) {
      const wx = this.p.x + x * K, wz = this.p.z + z * K; if (Geo.sdAt(wx, wz) < 0.45 || Geo.riverAt(wx, wz) < 0.3) return false;
      for (const o of this.occ) if (Math.hypot(o[0] - x, o[1] - z) < o[2] + r) return false; return true;
    }
    take(x, z, r) { this.occ.push([x, z, r]); }
    // hitta en ledig plats i ringen rmin..rmax
    find(rmin, rmax, r) {
      for (let k = 0; k < 60; k++) { const a = this.rnd() * 6.283, d = rmin + this.rnd() * (rmax - rmin) * (0.4 + k / 100), x = Math.cos(a) * d, z = Math.sin(a) * d * 0.9; if (this.ok(x, z, r)) { this.take(x, z, r); return [x, z]; } }
      return null;
    }
    y(x, z) { return (Geo.groundAt(this.p.x + x * K, this.p.z + z * K) - this.p.y) / K; }
    // Huset vänder dörren mot den närmaste vägen, eller mot mitten av platsen om ingen väg är nära (förut stod husen åt alla håll).
    vand(x, z) {
      let bx = 0, bz = 0.5, bd = 2.2; for (const q of this.vag) { const d = Math.hypot(q[0] - x, q[1] - z); if (d < bd) { bd = d; bx = q[0]; bz = q[1]; } }
      return Math.atan2(bx - x, bz - z) + (this.rnd() - 0.5) * 0.2;
    }
    // Stadsplanen (Johannes 2026-11-27). Vägarna in till staden blir dess gator. Där de möts ligger torget. Husen står tätt i rader på båda sidor
    // om gatorna, med gaveln och dörren mot gatan, som i en medeltida stad. Smala gränder går ut från gatorna med fler hus. Tomterna är
    // sorterade från torget och utåt, så staden växer längs sina gator. Är staden omgiven av en mur står alla hus innanför den.
    plan() {
      if (this._plan) return this._plan;
      const b = this.b, p = this.p, k = b.stor ? 1.45 : 1, Rw = this.R / K * 0.92, rnd = Geo.rng(b.id.length * 131 + b.id.charCodeAt(0) * 7 + 17);
      const P = this._plan = { hus: [], torg: null };
      const ell = (x, z) => Math.sqrt((x * x) / (Rw * Rw) + (z * z) / (Rw * Rw * 0.72)) * Rw, inne = (x, z) => b.mur ? (ell(x, z) < Rw - 0.55 || (ell(x, z) > Rw + 0.55 && Math.hypot(x, z) < this.R / K * 1.25)) : Math.hypot(x, z) < this.R / K * 1.15;          // är staden omgiven av en mur står husen innanför, och när det blir fullt där växer förstäder utanför (som på malmarna kring Stockholm)
      // en tomt: läge, vart dörren vetter (fx, fz), ordning (d) och gatbiten framför huset (seg)
      const lot = (x, z, fx, fz, d, seg) => { if (inne(x, z)) P.hus.push({ x: x + (rnd() - 0.5) * 0.03, z: z + (rnd() - 0.5) * 0.03, a: Math.atan2(fx, fz) + (rnd() - 0.5) * 0.06, d, seg }); };
      const vagar = (V.Rike.vagarVid ? V.Rike.vagarVid(b.id) : []).map(pts => pts.map(q => [(q[0] - p.x) / K, (q[1] - p.z) / K])).filter(l => l.length > 1);
      // torget: långt åt det håll stranden går (eller längs den första vägen in)
      let ux = 1, uz = 0;
      if (p.hav) { const dx = p.hav.x - p.x, dz = p.hav.z - p.z, L = Math.hypot(dx, dz) || 1; ux = -dz / L; uz = dx / L; }
      else if (vagar[0]) { const q = vagar[0].find(q => Math.hypot(q[0], q[1]) > 2) || vagar[0][vagar[0].length - 1], L = Math.hypot(q[0], q[1]) || 1; ux = q[0] / L; uz = q[1] / L; }
      const vx = -uz, vz = ux, TU = 0.9 * k, TV = 0.7 * k, cz = 0.2, T = P.torg = { x: 0, z: cz, ux, uz, vx, vz, TU, TV, a: Math.atan2(ux, uz) };
      const UV = (u, v) => [u * ux + v * vx, cz + u * uz + v * vz];
      T.stand = [[-0.6, -0.45], [0.6, 0.45], [0.6, -0.45], [-0.6, 0.45]].map(q => UV(q[0] * TU, q[1] * TV));
      for (const s of [-1, 1]) {
        for (let u = -TU + 0.33; u <= TU - 0.32; u += 0.66) { const q = UV(u, s * (TV + 0.42)); lot(q[0], q[1], -s * vx, -s * vz, -2 + Math.abs(u), 'torg'); }
        for (let v = -TV + 0.33; v <= TV - 0.32; v += 0.66) { const q = UV(s * (TU + 0.42), v); lot(q[0], q[1], -s * ux, -s * uz, -1.5 + Math.abs(v), 'torg'); }
      }
      // huvudgatorna: vägarna in, med hus tätt på båda sidor. Var 2,3 längdenhet går en gränd ut åt båda håll.
      const fran = Math.hypot(TU, TV) + 0.55, GR = 2.3, glangd = 3.0 * k;
      vagar.forEach(pts => {
        let acc = 0, nasta = fran, gnasta = fran + 1.0;
        for (let i = 1; i < pts.length; i++) {
          const ax = pts[i - 1][0], az = pts[i - 1][1], bx = pts[i][0], bz = pts[i][1], L = Math.hypot(bx - ax, bz - az); if (L < 1e-6) continue;
          const tx = (bx - ax) / L, tz = (bz - az) / L, nx = -tz, nz = tx, vid = f => [ax + (bx - ax) * f, az + (bz - az) * f];
          while (Math.min(nasta, gnasta) <= acc + L) {
            if (gnasta <= nasta) {
              const [x, z] = vid((gnasta - acc) / L);
              for (const s of [-1, 1]) for (let e = 1.5; e <= glangd; e += 0.66) {
                const seg = [[x + nx * s * (e - 0.4), z + nz * s * (e - 0.4)], [x + nx * s * (e + 0.33), z + nz * s * (e + 0.33)]];
                for (const r of [-1, 1]) lot(x + nx * s * e + tx * r * 0.62, z + nz * s * e + tz * r * 0.62, -tx * r, -tz * r, gnasta + e * 1.1, seg);
              }
              gnasta += GR;
            } else {
              const [x, z] = vid((nasta - acc) / L);
              if (Math.abs(nasta - (gnasta - GR)) > 0.45 && Math.abs(nasta - gnasta) > 0.45) for (const s of [-1, 1]) lot(x + nx * s * 0.68, z + nz * s * 0.68, -nx * s, -nz * s, nasta, null);
              nasta += 0.66;
            }
          }
          acc += L; if (Math.hypot(ax, az) > this.R / K * 1.2) break;
        }
      });
      // rutnätet fyller ut mellan vägarna: gator i torgets riktning med hus på båda sidor, och gränder tvärs över var 2,6 längdenhet
      const GS = 2.1, AL = 2.6;
      for (let j = -4; j <= 4; j++) for (const s of [-1, 1]) for (let i = -13; i <= 13; i++) {
        const u = i * 0.66, v = j * GS + s * 0.62, m = ((u % AL) + AL) % AL; if (Math.abs(m - AL / 2) < 0.4 || (j === 0 && Math.abs(u) < TU + 0.5)) continue;
        const q = UV(u, v); lot(q[0], q[1], -s * vx, -s * vz, Math.hypot(u, v) + 0.5 + (b.mur && ell(q[0], q[1]) > Rw ? 6 : 0), [UV(u - 0.36, j * GS), UV(u + 0.36, j * GS)]);
      }
      P.hus.sort((a, c) => a.d - c.d);
      return P;
    }
    // Nästa lediga tomt i planen. Gatan framför huset målas på marken när huset byggs.
    lott() {
      for (const q of this.plan().hus) {
        if (q.tagen || !this.ok(q.x, q.z, 0.25)) continue; q.tagen = 1; this.take(q.x, q.z, 0.4);
        if (q.seg) (this._nyGata || (this._nyGata = [])).push(q.seg);
        return q;
      }
      return null;
    }
    torg() { const T = this.plan().torg; for (let u = -T.TU * 0.75; u <= T.TU * 0.75 + 1e-6; u += T.TU * 0.375) for (let v = -T.TV * 0.5; v <= T.TV * 0.5 + 1e-6; v += T.TV * 0.5) this.take(u * T.ux + v * T.vx, T.z + u * T.uz + v * T.vz, 0.32); }
  }
  const fire = [], smoke = [];        // lägereldar och skorstenar (världskoordinater), läses av Folk
  function addSmoke(t, x, y, z, slag) { smoke.push({ x: t.p.x + x * K, y: t.p.y + y * K, z: t.p.z + z * K, slag: slag || 'rok', bas: t.b.id }); }

  // Bygg ett steg av en bas. Ger ett nät i tomtens egna koordinater.
  function steg(t, s, paint) {
    const mb = new MB(), b = t.b, rnd = t.rnd, put = (x, z, a, fn) => { mb.push().move(x, t.y(x, z), z); if (a) mb.rotY(a); fn(mb); mb.pop(); };
    const hus = (rmin, rmax, n, fn, rad) => { for (let k = 0; k < n; k++) { const q = t.find(rmin, rmax, rad || 0.62); if (q) put(q[0], q[1], t.vand(q[0], q[1]), m => fn(m, q)); } };
    if (b.slag === 'bygd') {
      const tak = () => rnd() < 0.6 ? 'torv' : 'span';
      if (s === 0) {
        t.take(0, 0.5, 0.5); put(0, 0.5, 0, eld); fire.push({ x: t.p.x, z: t.p.z + 0.5 * K, y: t.p.y }); addSmoke(t, 0, 0.3, 0.5, 'eld');
        hus(0.9, 1.6, 2, m => stuga(m, 0.95, 0.62, 0.34, tak(), { skorsten: 1, ljus: 1 })); hus(1.0, 1.8, 1, harbre, 0.45);
        if (b.kloster) { t.take(-0.3, -2.4, 1.3); put(-0.3, -2.4, 0, m => { kyrka(m); m.box(1.3, 0, 0.8, 1.2, 0.5, 0.5, '#e2dbc9', { low: '#bfb7a5', noTop: true }); m.gable(1.3, 0.5, 0.8, 1.2, 0.36, 0.5, TAK.span.c, { gable: '#e2dbc9' }); }); }
        if (b.borg) { t.take(2.3, -1.6, 1.5); put(2.3, -1.6, 0, m => borg(m, b.borg, 0)); t.flag = [2.2, 1.9, -1.8]; }
        if (b.kyrka && !b.kloster) { t.take(-0.4, -2.0, 1.15); put(-0.4, -2.0, 0, kyrka); }          // sockenkyrkan står där från början
      } else if (s === 1) {
        if (b.kyrka && !b.kloster) { const k = t.find(1.4, 2.6, 0.42); if (k) put(k[0], k[1], 0, klockstapel); }
        if (b.dom) { const q = t.find(1.8, 2.8, 1.3) || [0, -2.5]; put(q[0], q[1], 0, m => domkyrka(m, 1, 0.7)); }
        hus(1.3, 2.4, 2, m => stuga(m, 0.9, 0.6, 0.32, tak(), { skorsten: 1 })); hus(1.4, 2.6, 1, lada, 0.75);
      } else if (s === 2) { hus(1.6, 3.0, 3, m => stuga(m, 0.9 + rnd() * 0.2, 0.6, 0.33, tak(), { skorsten: 1, ljus: 1 })); hus(1.4, 2.8, 2, harbre, 0.45); hus(0.9, 1.6, 1, stand, 0.4); }
      else if (s === 3) { hus(1.8, 3.4, 2, m => { stuga(m, 1.25, 0.7, 0.62, 'span', { skorsten: 1, ljus: 1 }); }, 0.8); hus(2.0, 3.6, 2, lada, 0.75); hus(1.0, 2.0, 2, stand, 0.4); }
      else { hus(2.2, 3.9, 4, m => stuga(m, 0.9 + rnd() * 0.3, 0.62, 0.33 + (rnd() < 0.3 ? 0.28 : 0), tak(), { skorsten: 1, ljus: rnd() < 0.5 }), 0.66); hus(2.2, 3.8, 1, harbre, 0.45); }
      if (b.hamn && s === 1 && t.p.hav) hamn(t, mb, 1);
      // åkertegar runt byn, fler för varje steg
      if (paint) for (let k = 0; k < 2 + s; k++) { const a = rnd() * 6.283, d = t.R + 0.8 + rnd() * (1.5 + s * 0.6), x = t.p.x + Math.cos(a) * d, z = t.p.z + Math.sin(a) * d; if (Geo.sdAt(x, z) > 0.8 && Geo.heightAt(x, z) < 1.6) paint.field(x, z, 1.2 + rnd() * 1.4, 0.7 + rnd() * 0.8, rnd() * 3.14); }
    } else if (b.slag === 'gruva') {
      const c = b.silver ? '#9a9da3' : '#8a4f33';
      if (s === 0) {
        t.take(0, -0.2, 1.5); put(0, -0.2, 0, m => gruvhal(m, 1.25)); put(-0.9, -0.5, 0.4, spel); put(1.0, 0.3, -0.3, spel);
        hus(1.8, 2.6, 1, m => hytta(m, false), 0.6); addSmoke(t, t.occ[t.occ.length - 1][0] + 0.2, 1.0, t.occ[t.occ.length - 1][1], 'rok'); hus(1.7, 2.6, 2, m => malm(m, c), 0.3);
        hus(2.0, 3.0, 1, m => stuga(m, 0.9, 0.6, 0.33, 'span', { skorsten: 1, ljus: 1 }));
      } else if (s === 1) { put(0.1, -1.2, 1.2, spel); hus(1.9, 3.0, 1, m => hytta(m, true), 0.7); addSmoke(t, t.occ[t.occ.length - 1][0] + 0.2, 1.0, t.occ[t.occ.length - 1][1], 'rok'); hus(1.9, 3.2, 2, mila, 0.4); addSmoke(t, t.occ[t.occ.length - 1][0], 0.35, t.occ[t.occ.length - 1][1], 'rok'); hus(1.7, 2.8, 2, m => malm(m, c), 0.3); }
      else { hus(2.0, 3.6, 1, m => hytta(m, s % 2 === 0), 0.7); addSmoke(t, t.occ[t.occ.length - 1][0] + 0.2, 1.0, t.occ[t.occ.length - 1][1], 'rok'); hus(2.0, 3.8, 2, m => stuga(m, 0.9, 0.6, 0.33, 'span', { skorsten: 1, ljus: rnd() < 0.5 })); hus(2.0, 3.8, 1 + (s % 2), mila, 0.4); addSmoke(t, t.occ[t.occ.length - 1][0], 0.35, t.occ[t.occ.length - 1][1], 'rok'); hus(1.6, 3.2, 2, m => malm(m, c), 0.3); if (s === 2) put(-0.3, 0.9, 2.4, spel); }
    } else if (b.slag === 'stad') {
      const k = b.stor ? 1.45 : 1, ritaHus = m => { const w = 0.46 + rnd() * 0.16, timmer = rnd() < (b.stor ? 0.3 : 0.5); stadshus(m, w, 0.62 + rnd() * 0.2, 0.5 + rnd() * 0.42, timmer ? '#7b6650' : PUTS[Math.floor(rnd() * PUTS.length)], timmer ? 'span' : rnd() < 0.7 ? 'tegel' : 'span'); };
      const husN = n => { for (let i = 0; i < Math.round(n * k); i++) { const q = t.lott(); if (!q) break; put(q.x, q.z, q.a, ritaHus); } };          // på tomterna i stadsplanen, med gaveln mot gatan
      const stand2 = n => { const T = t.plan().torg; for (let i = 0; i < n && T.stand.length; i++) { const q = T.stand.shift(); put(q[0], q[1], T.a, stand); } };          // marknadsstånd på torget
      if (s === 0) {
        if (b.borg) { const bx = b.stor ? 2.6 : 2.4, bz = b.stor ? -2.2 : -1.5; t.take(bx, bz, b.borg === 'stockholm' ? 2.2 : 1.6); put(bx, bz, 0, m => borg(m, b.borg, 0)); t.flag = [bx + (b.borg === 'stockholm' ? 0.2 : -0.1), b.borg === 'stockholm' ? 2.84 : b.borg === 'viborg' ? 3.0 : 2.1, bz + (b.borg === 'stockholm' ? -0.1 : -0.2)]; }
        if (b.dom) { const dx = b.stor ? -1.6 : -0.9, dz = b.stor ? -1.9 : -1.9; t.take(dx, dz, 1.5 * (b.stor ? 0.8 : 0.72)); put(dx, dz, 0, m => domkyrka(m, b.dom, b.stor ? 0.8 : 0.72)); }
        else if (b.kyrka) { t.take(-0.6, -1.8, 1.1); put(-0.6, -1.8, 0, kyrka); }
        if (b.mynt) { t.take(1.4, -0.9, 0.7); put(1.4, -0.9, 0, m => { m.box(0, 0, 0, 0.9, 0.5, 0.7, '#9a948a', { low: '#6a655d', noTop: true }); m.gable(0, 0.5, 0, 0.9, 0.4, 0.7, TAK.tegel.c, { gable: '#9a948a' }); m.box(0.25, 0.5, 0, 0.18, 0.6, 0.18, '#7a746b'); dorr(m, -0.1, 0.356, 0.3, 0.14); }); addSmoke(t, 1.65, 1.2, -0.9, 'rok'); }
        if (b.hamn && t.p.hav) hamn(t, mb, b.stor ? 3 : 2);
        t.torg(); husN(b.stor ? 11 : 6);
      } else if (s === 1) { husN(6); stand2(2); }
      else if (s === 2) { husN(6); if (b.mur) stadsmur(t, mb, put); }
      else { husN(6); if (s === 3) stand2(2); }
      if (paint && t._nyGata) { for (const g of t._nyGata) { if (g === 'torg') { if (!t._torgRitat) { t._torgRitat = 1; const T = t.plan().torg; paint.yard(t.p.x, t.p.z + T.z * K, (Math.max(T.TU, T.TV) + 0.35) * K); } } else paint.road(g.map(q => [t.p.x + q[0] * K, t.p.z + q[1] * K]), 0.2); } t._nyGata = null; }          // gatorna syns på marken
      if (b.ny && s === 0) { /* en nygrundad stad har inga gamla hus */ }
    } else if (b.slag === 'slott') {
      if (s === 0) t.take(0, -0.3, 1.9);
      if (s <= 3) put(0, -0.3, 0, m => borg(m, b.borg, s));
      if (s === 0) t.flag = [-0.85, 2.5, -1.0];
      hus(2.2, 3.4, 1 + (s > 1 ? 1 : 0), m => stuga(m, 1.0, 0.62, 0.34, 'span', { skorsten: 1, ljus: 1 }), 0.66); if (s >= 1) hus(2.2, 3.6, 1, lada, 0.75);
      if (paint) for (let q = 0; q < 2; q++) { const a = rnd() * 6.283, d = t.R + 1 + rnd() * 2, x = t.p.x + Math.cos(a) * d, z = t.p.z + Math.sin(a) * d; if (Geo.sdAt(x, z) > 0.8) paint.field(x, z, 1.8 + rnd(), 1 + rnd() * 0.6, rnd() * 3.14); }
    }
    return mb;
  }
  function hamn(t, mb, n) {
    const dx = t.p.hav.x - t.p.x, dz = t.p.hav.z - t.p.z, d = Math.hypot(dx, dz), a = Math.atan2(dx, dz);
    for (let k = 0; k < n; k++) {
      // gå från tomten mot vattnet tills stranden tar slut
      const off = (k - (n - 1) / 2) * 0.9; let s = 0.5; for (; s < d + 2; s += 0.15) if (Geo.sdAt(t.p.x + dx / d * s - dz / d * off, t.p.z + dz / d * s + dx / d * off) < 0.1) break;
      const x = (dx / d * (s - 0.3) - dz / d * off) / K, z = (dz / d * (s - 0.3) + dx / d * off) / K;
      mb.push().move(x, -t.p.y / K, z).rotY(a); brygga(mb, 1.5); mb.pop(); t.take(x, z, 0.5);
    }
    t.kaj = { x: t.p.x + dx / d * 1.2, z: t.p.z + dz / d * 1.2 };
  }
  function stadsmur(t, mb, put) {
    const R = t.R / K * 0.92, n = 12;
    for (let k = 0; k < n; k++) {
      const a0 = k / n * 6.283 + 0.2, a1 = (k + 1) / n * 6.283 + 0.2, x0 = Math.cos(a0) * R, z0 = Math.sin(a0) * R * 0.85, x1 = Math.cos(a1) * R, z1 = Math.sin(a1) * R * 0.85, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      if (Geo.sdAt(t.p.x + mx * K, t.p.z + mz * K) < 0.5 || (Math.abs(a0 - 1.57) < 0.4)) continue;        // ingen mur i vattnet, och en öppning för porten i söder
      mb.push().move(0, t.y(mx, mz), 0); mur(mb, x0, z0, x1, z1, 0.5); if (k % 3 === 0) rundtorn(mb, x0, z0, 0.24, 0.75); mb.pop();
    }
  }

  // ---- flaggor: tre kronor, Dannebrogen, Lübecks vitt och rött ---------------------------------
  function flagga(sort) {
    const mb = new MB(); mb.cyl(0, 0, 0, 0.022, 0.016, 1.0, 5, '#5a4838');
    mb.kind = 4;
    const duk = (c, y0, y1, x0, x1, off) => { for (const s of [1, -1]) { const z = s * (0.004 + (off || 0)), A = [x0, y0, z], B = [x1, y0, z], C = [x1, y1, z], Dd = [x0, y1, z], col = V.col(c), n = s; const i0 = mb._v(A[0], A[1], A[2], 0, 0, n, col, x0 / 0.55), i1 = mb._v(B[0], B[1], B[2], 0, 0, n, col, x1 / 0.55), i2 = mb._v(C[0], C[1], C[2], 0, 0, n, col, x1 / 0.55), i3 = mb._v(Dd[0], Dd[1], Dd[2], 0, 0, n, col, x0 / 0.55); if (s > 0) mb.i.push(i0, i1, i2, i0, i2, i3); else mb.i.push(i0, i2, i1, i0, i3, i2); } };
    const seg = (c, y0, y1, off) => { for (let k = 0; k < 4; k++) duk(c, y0, y1, 0.02 + k * 0.1325, 0.02 + (k + 1) * 0.1325, off); };
    if (sort === 'sverige') {          // tre kronor på blått: en ring och tre uddar per krona
      seg('#27539e', 0.64, 0.98);
      for (const [x, y] of [[0.11, 0.845], [0.335, 0.845], [0.222, 0.695]]) { duk('#e8c040', y, y + 0.032, x, x + 0.112, 0.004); for (const k of [0, 1, 2]) duk('#e8c040', y + 0.032, y + (k === 1 ? 0.09 : 0.072), x + 0.004 + k * 0.04, x + 0.028 + k * 0.04, 0.004); }
    }
    else if (sort === 'danmark') { seg('#b8312a', 0.64, 0.98); duk('#f2ede2', 0.78, 0.84, 0.02, 0.55, 0.004); duk('#f2ede2', 0.64, 0.98, 0.16, 0.23, 0.004); }
    else if (sort === 'lubeck') { seg('#f2ede2', 0.81, 0.98); seg('#b8312a', 0.64, 0.81); }
    else if (sort === 'vasa') { seg('#e8c040', 0.64, 0.98); duk('#2a2622', 0.7, 0.92, 0.22, 0.34, 0.004); duk('#2a2622', 0.76, 0.86, 0.14, 0.42, 0.004); }
    const m = new THREE.Mesh(mb.geometry(), material()); m.castShadow = true; return m;
  }

  V.Bygge = {
    K, material, Tomt, steg, flagga, fire, smoke, talt, eld, stallning, stapel, stuga, kyrka, borg,
    mesh(mb) { const m = new THREE.Mesh(mb.geometry(), material()); m.castShadow = true; m.receiveShadow = true; return m; }
  };
})();
