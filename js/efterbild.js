// Efterbild: det som gör att hus, träd och gubbar står i landskapet i stället för att ligga på det.
// Djupet ritas en gång för sig. Sedan läggs tre saker ovanpå bilden: en mjuk skugga där något möter marken,
// en tunn mörk kant kring det som står fram, och lite mörkare hörn.
(function () {
  'use strict';
  const V = window.VASA;
  let rt = null, scenQ, camQ, mat, djupMat;
  const VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const FS = `
    precision highp float;
    uniform sampler2D tD; uniform vec2 uPx; uniform float uNear, uFar, uSkala, uAO, uKant, uVin; varying vec2 vUv;
    float lin(vec2 uv) { float d = texture2D(tD, uv).x; return uNear * uFar / (uFar - d * (uFar - uNear)); }
    void main() {
      float z = lin(vUv), zr = lin(vUv + vec2(uPx.x, 0.0)), zl = lin(vUv - vec2(uPx.x, 0.0)), zu = lin(vUv + vec2(0.0, uPx.y)), zd = lin(vUv - vec2(0.0, uPx.y));
      // markens egen lutning mot kameran räknas bort, annars skuggar en plan yta sig själv
      vec2 lut = vec2(abs(zr - z) < abs(z - zl) ? zr - z : z - zl, abs(zu - z) < abs(z - zd) ? zu - z : z - zd);
      float r = min(0.85 * uSkala / z, 46.0), vrid = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) * 6.2832, occ = 0.0;
      for (int i = 0; i < 12; i++) {
        float a = float(i) * 2.39996 + vrid, rr = r * sqrt((float(i) + 0.5) / 12.0); vec2 o = vec2(cos(a), sin(a)) * rr;
        float dz = (z + dot(lut, o)) - lin(vUv + o * uPx);          // hur mycket närmare kameran grannen är än marken skulle vara
        occ += smoothstep(0.05, 0.55, dz) * (1.0 - smoothstep(1.4, 3.6, dz));
      }
      occ /= 12.0;
      float hopp = max(max(abs(zr - z), abs(zl - z)), max(abs(zu - z), abs(zd - z))) - 2.0 * max(abs(lut.x), abs(lut.y));
      float kant = smoothstep(0.3, 1.0, hopp);
      vec2 q = (vUv - 0.5) * vec2(1.0, 0.86); float vin = 1.0 - uVin * smoothstep(0.42, 0.8, length(q));
      vec3 skugga = mix(vec3(1.0), vec3(0.5, 0.53, 0.66), uAO * smoothstep(0.04, 0.62, occ));
      gl_FragColor = vec4(skugga * (1.0 - uKant * kant) * vin, 1.0);
    }`;
  const E = V.Efterbild = {
    pa: !/[?&]efter=0/.test(location.search),
    init(renderer) {
      // eget enkelt program för djupet: det rör aldrig färgen per gubbe, så samma program duger åt träd, hus och folk
      djupMat = new THREE.ShaderMaterial({ colorWrite: false, uniforms: { uFri: V.U.uFri, uFriR: V.U.uFriR }, fragmentShader: 'void main() { gl_FragColor = vec4(1.0); }',
        vertexShader: 'attribute float aTrad; ' + V.World.FRI_DEKL + '\nvoid main() {\n vec3 transformed = position;\n #ifdef USE_INSTANCING\n if (aTrad > 0.5) ' + V.World.FRI_GLSL + '\n #endif\n vec4 p = vec4(transformed, 1.0);\n #ifdef USE_INSTANCING\n p = instanceMatrix * p;\n #endif\n gl_Position = projectionMatrix * modelViewMatrix * p;\n}' });
      mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false, blending: THREE.MultiplyBlending, transparent: true,
        uniforms: { tD: { value: null }, uPx: { value: new THREE.Vector2() }, uNear: { value: 1 }, uFar: { value: 100 }, uSkala: { value: 1000 }, uAO: { value: 0.5 }, uKant: { value: 0.28 }, uVin: { value: 0.2 } } });
      scenQ = new THREE.Scene(); camQ = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); q.frustumCulled = false; scenQ.add(q);
      E.resize(renderer);
    },
    resize(renderer) {
      if (!djupMat) return; const s = renderer.getDrawingBufferSize(new THREE.Vector2());
      if (rt) { rt.depthTexture.dispose(); rt.dispose(); }
      rt = new THREE.WebGLRenderTarget(s.x, s.y, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, stencilBuffer: false });
      rt.depthTexture = new THREE.DepthTexture(s.x, s.y); rt.depthTexture.type = THREE.UnsignedIntType;
      mat.uniforms.tD.value = rt.depthTexture; mat.uniforms.uPx.value.set(1 / s.x, 1 / s.y);
    },
    // Rita bilden. d = kamerans avstånd: långt uppifrån behövs varken skuggor eller kanter.
    render(renderer, scene, camera, d) {
      const svag = 1 - Math.min(1, Math.max(0, (d - 110) / 160));
      if (!E.pa || !djupMat || svag <= 0.01) { renderer.render(scene, camera); return; }
      const bg = scene.background, auto = renderer.shadowMap.autoUpdate;
      scene.background = null; scene.overrideMaterial = djupMat; camera.layers.set(0); renderer.shadowMap.autoUpdate = false;
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
      scene.overrideMaterial = null; scene.background = bg; camera.layers.enable(1); renderer.shadowMap.autoUpdate = auto;
      renderer.render(scene, camera);
      const u = mat.uniforms, h = rt.height; u.uNear.value = camera.near; u.uFar.value = camera.far; u.uSkala.value = h / (2 * Math.tan(camera.fov * Math.PI / 360));
      u.uAO.value = 0.5 * svag; u.uKant.value = 0.28 * svag * (1 - Math.min(1, Math.max(0, (d - 45) / 60)));
      renderer.autoClear = false; renderer.render(scenQ, camQ); renderer.autoClear = true;
    }
  };
})();
