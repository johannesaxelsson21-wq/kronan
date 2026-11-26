// Scenen: ritare, kamera, sol och skuggor, och hur man pekar på marken.
(function () {
  'use strict';
  const V = window.VASA, Geo = V.Geo, World = V.World, U = V.U, lin = V.hexToLin;
  let renderer, scene, camera, sun, hemi, canvas;
  const cam = { x: 0, z: 0, d: 60, tx: 0, tz: 0, td: 60, gy: 0, fly: null, locked: false, minD: 9, maxD: 560, shake: 0, user: 0 };
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const pitchAt = d => (40 + 24 * Geo.smooth(14, 320, d)) * Math.PI / 180;

  const S = V.Scene = {
    cam,
    init(cv) {
      canvas = cv;
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
      // en telefon orkar mindre: lägre skärpa, mindre skuggkarta och ingen efterbild från början (?mobil=1 tvingar fram det, för prov)
      S.mobil = /[?&]mobil=1/.test(location.search) || !!(window.matchMedia && matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, S.mobil ? 1.5 : 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene = new THREE.Scene(); scene.background = new THREE.Color('#e6d7b8');
      camera = new THREE.PerspectiveCamera(30, 1, 1, 3000);
      sun = new THREE.DirectionalLight(0xffffff, 1); sun.castShadow = true; sun.shadow.mapSize.set(S.mobil ? 1024 : 2048, S.mobil ? 1024 : 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
      hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
      scene.add(sun, sun.target, hemi);
      camera.layers.enable(1);          // lager 1: genomskinligt som inte ska med när djupet ritas (rök, ringar, spår)
      S.renderer = renderer; S.scene = scene; S.camera = camera; if (V.Efterbild) { V.Efterbild.init(renderer); if (S.mobil && !/[?&]efter=1/.test(location.search)) V.Efterbild.pa = false; }
      S.resize(); window.addEventListener('resize', S.resize);
      S.bindInput();
    },
    resize() {
      const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      // på en skärm på höjden backar kameran, annars får ingenting plats på bredden
      cam.k = camera.aspect < 1.3 ? Math.min(1.9, Math.sqrt(1.3 / camera.aspect)) : 1; if (V.Efterbild) V.Efterbild.resize(renderer);
    },
    // Ljuset följer årstiden: låg varm sol och blå skuggor på vintern, hög ljus sol på sommaren.
    applySeason() {
      const se = World.season, sc = se.sunCol, ac = se.ambCol, k = 0.82 + 0.2 * Geo.smooth(18, 50, se.sunEl);
      sun.color.setRGB(sc.r * 1.12 * k, sc.g * 1.12 * k, sc.b * 1.12 * k);
      hemi.color.setRGB(ac.r * 0.86, ac.g * 0.86, ac.b * 0.9); hemi.groundColor.setRGB(ac.r * 0.5, ac.g * 0.46, ac.b * 0.4);
      const sy = Math.max(0, U.uSunDir.value.y); U.uFlat.value.set(sun.color.r * sy + hemi.color.r, sun.color.g * sy + hemi.color.g, sun.color.b * sy + hemi.color.b);
    },
    setSeason(t) { World.setSeason(t); S.applySeason(); },
    jump(x, z, d) { cam.x = cam.tx = x; cam.z = cam.tz = z; cam.d = cam.td = d; cam.fly = null; cam.gy = Geo.groundAt(x, z); },
    // Flyg mjukt till en plats. dur i sekunder; utan dur glider kameran dit i egen takt.
    flyTo(x, z, d, dur) {
      if (dur) cam.fly = { x0: cam.x, z0: cam.z, d0: cam.d, x1: x, z1: z, d1: d || cam.d, t: 0, dur };
      else { cam.tx = x; cam.tz = z; if (d) cam.td = d; cam.fly = null; }
    },
    flying() { return !!cam.fly; },
    update(dt) {
      if (cam.fly) {
        const f = cam.fly; f.t = Math.min(1, f.t + dt / f.dur); const e = ease(f.t);
        cam.x = f.x0 + (f.x1 - f.x0) * e; cam.z = f.z0 + (f.z1 - f.z0) * e;
        const ld = Math.log(f.d0) + (Math.log(f.d1) - Math.log(f.d0)) * e, far = Math.hypot(f.x1 - f.x0, f.z1 - f.z0);
        cam.d = Math.exp(ld) + Math.sin(Math.PI * e) * Math.min(120, far * 0.35);          // lyft lite på långa resor
        cam.tx = cam.x; cam.tz = cam.z; cam.td = f.d1; if (f.t >= 1) cam.fly = null;
      } else {
        const m = 22 + cam.td * 0.25;
        if (!cam.fri) { cam.tx = Math.max(-Geo.W / 2 + m, Math.min(Geo.W / 2 - m, cam.tx)); cam.tz = Math.max(-Geo.H / 2 + m * 0.6, Math.min(Geo.H / 2 - m * 0.3, cam.tz)); }          // i en scen får kameran gå ända ut till kartans kant
        cam.td = Math.max(cam.minD, Math.min(cam.maxD, cam.td));
        const a = 1 - Math.exp(-dt * 7);
        cam.x += (cam.tx - cam.x) * a; cam.z += (cam.tz - cam.z) * a; cam.d += (cam.td - cam.d) * a;
      }
      cam.gy += (Geo.groundAt(cam.x, cam.z) - cam.gy) * (1 - Math.exp(-dt * 4));
      const p = cam.lut ? cam.lut * Math.PI / 180 : pitchAt(cam.d), dd = cam.d * (cam.k || 1); let sx = 0, sy = 0;          /* cam.lut = en scen kan be om brantare vinkel (grader), så att hustaken inte skymmer */
      if (cam.shake > 0) { cam.shake = Math.max(0, cam.shake - dt * 1.6); sx = (Math.random() - 0.5) * cam.shake * cam.d * 0.012; sy = (Math.random() - 0.5) * cam.shake * cam.d * 0.012; }
      camera.position.set(cam.x + sx, cam.gy + dd * Math.sin(p) + sy, cam.z + dd * Math.cos(p));
      camera.lookAt(cam.x + sx, cam.gy, cam.z);
      camera.near = Math.max(0.5, dd * 0.2); camera.far = dd * 6 + 400; camera.updateProjectionMatrix();
      // på en smal skärm täcker konsolen nedre delen: lyft bilden så att det kameran tittar på hamnar mitt i det som syns
      cam.ly = (cam.ly || 0) + ((S.lyft || 0) - (cam.ly || 0)) * (dt > 0 ? 1 - Math.exp(-dt * 5) : 0);
      if (cam.ly > 0.5) { const w = canvas.clientWidth, h = canvas.clientHeight; camera.setViewOffset(w, h, 0, cam.ly, w, h); } else if (camera.view && camera.view.enabled) camera.clearViewOffset();
      // skuggorna täcker det kameran ser
      const r = Math.max(16, dd * 0.78), sd = U.uSunDir.value, cx = cam.x, cz = cam.z - dd * 0.16;
      sun.target.position.set(cx, 0, cz); sun.position.set(cx + sd.x * 420, sd.y * 420, cz + sd.z * 420);
      const sc = sun.shadow.camera; sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 50; sc.far = 900; sc.updateProjectionMatrix();
    },
    render() { if (V.Efterbild) V.Efterbild.render(renderer, scene, camera, cam.d * (cam.k || 1)); else renderer.render(scene, camera); },
    shake(a) { if (V.lugn) a *= 0.25; cam.shake = Math.max(cam.shake, a); },

    // Var på marken pekar den här punkten på skärmen?
    groundPoint(cx, cy) {
      const r = canvas.getBoundingClientRect(), v = new THREE.Vector3((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1, 0.5).unproject(camera);
      const o = camera.position, dir = v.sub(o).normalize(); if (dir.y >= -0.01) return null;
      let t0 = 0, t1 = (o.y + 2) / -dir.y; const steps = 90;
      for (let k = 1; k <= steps; k++) {
        const t = t1 * k / steps, y = o.y + dir.y * t, g = Geo.groundAt(o.x + dir.x * t, o.z + dir.z * t);
        if (y <= g) { let a = t0, b = t; for (let q = 0; q < 12; q++) { const m = (a + b) / 2; if (o.y + dir.y * m <= Geo.groundAt(o.x + dir.x * m, o.z + dir.z * m)) b = m; else a = m; } return { x: o.x + dir.x * b, z: o.z + dir.z * b }; }
        t0 = t;
      }
      const t = o.y / -dir.y; return { x: o.x + dir.x * t, z: o.z + dir.z * t };
    },
    // Var på skärmen hamnar en punkt i världen? (för pilar och siffror som svävar över baser)
    screenPoint(x, y, z) {
      const v = new THREE.Vector3(x, y, z).project(camera), r = canvas.getBoundingClientRect();
      return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, behind: v.z > 1 };
    },

    onClick: null, onHover: null,
    bindInput() {
      let down = null, moved = false, pinch = 0; const pts = new Map();
      canvas.addEventListener('pointerdown', e => { cam.user = performance.now(); pts.set(e.pointerId, e); canvas.setPointerCapture(e.pointerId); if (pts.size === 1) { down = { x: e.clientX, y: e.clientY, g: S.groundPoint(e.clientX, e.clientY) }; moved = false; } else pinch = 0; });
      canvas.addEventListener('pointermove', e => {
        if (pts.has(e.pointerId)) pts.set(e.pointerId, e);
        if (pts.size === 2 && !cam.locked) {            // nyp för att zooma
          const [a, b] = [...pts.values()], dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          if (pinch) cam.td = Math.max(cam.minD, Math.min(cam.maxD, cam.td * pinch / dist)); pinch = dist; moved = true; return;
        }
        if (down && pts.size === 1) {
          if (!moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) moved = true;
          if (moved && !cam.locked && down.g) { const g = S.groundPoint(e.clientX, e.clientY); if (g) { cam.tx += down.g.x - g.x; cam.tz += down.g.z - g.z; cam.x = cam.tx; cam.z = cam.tz; cam.fly = null; S.update(0); } }
        } else if (S.onHover) S.onHover(e);
      });
      const up = e => { pts.delete(e.pointerId); if (down && !moved && S.onClick) S.onClick(e, S.groundPoint(e.clientX, e.clientY)); if (!pts.size) down = null; pinch = 0; };
      canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', e => { pts.delete(e.pointerId); down = null; });
      canvas.addEventListener('wheel', e => {
        e.preventDefault(); if (cam.locked) return; cam.user = performance.now();
        const g = S.groundPoint(e.clientX, e.clientY), f = Math.exp(e.deltaY * 0.0012), nd = Math.max(cam.minD, Math.min(cam.maxD, cam.td * f)), k = nd / cam.td;
        if (g) { cam.tx = g.x + (cam.tx - g.x) * k; cam.tz = g.z + (cam.tz - g.z) * k; } cam.td = nd; cam.fly = null;
      }, { passive: false });
      const keys = S.keys = {};
      window.addEventListener('keydown', e => { keys[e.code] = true; }); window.addEventListener('keyup', e => { keys[e.code] = false; });
    },
    keyPan(dt) {
      if (cam.locked) return; const k = S.keys, sp = cam.td * 0.9 * dt;
      if (k.ArrowLeft || k.KeyA) cam.tx -= sp; if (k.ArrowRight || k.KeyD) cam.tx += sp; if (k.ArrowUp || k.KeyW) cam.tz -= sp; if (k.ArrowDown || k.KeyS) cam.tz += sp;
    }
  };
})();
