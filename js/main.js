(function () {
  const stage = document.getElementById('canvas-stage');
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.1, 7.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  // Lighting — warm key + cool fill, track-lamp feel
  const hemi = new THREE.HemisphereLight(0x8899aa, 0x1a1c1f, 0.55);
  scene.add(hemi);

  const key = new THREE.SpotLight(0xfff2e0, 2.4, 20, Math.PI / 5, 0.4, 1.2);
  key.position.set(4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  const rim = new THREE.PointLight(0xe8432c, 1.4, 12);
  rim.position.set(-4, 1.5, -3);
  scene.add(rim);

  const fill = new THREE.PointLight(0xf4c430, 0.7, 10);
  fill.position.set(-2, -1, 3);
  scene.add(fill);

  // Ground shadow catcher
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(6, 48),
    new THREE.ShadowMaterial({ opacity: 0.35 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.15;
  ground.receiveShadow = true;
  scene.add(ground);

  // The shoe itself — built in js/shoe.js
  const shoe = buildShoe();
  scene.add(shoe);

  // Soft floating particles for atmosphere
  const DUST_N = 120;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST_N * 3);
  for (let i = 0; i < DUST_N; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 10;
    dustPos[i * 3 + 1] = Math.random() * 5 - 1;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xf4c430, size: 0.02, transparent: true, opacity: 0.5 }));
  scene.add(dust);

  // ---------- Scroll-driven animation ----------
  // 4 keyframes matching the 4 sections: hero, sole, upper, cta
  const keyframes = [
    { rotY: 0.7,  rotX: 0.10, posY: -0.05, posX: 0.9,  camZ: 6.6, camY: 1.05, camX: 0.0 },
    { rotY: 1.85, rotX: 0.55, posY: 0.05,  posX: 0.6,  camZ: 5.0, camY: 0.15, camX: 0.4 },
    { rotY: -1.4, rotX: 0.05, posY: 0.15,  posX: -0.9, camZ: 5.4, camY: 0.55, camX: -0.5 },
    { rotY: 3.4,  rotX: 0.15, posY: 0.0,   posX: 0.0,  camZ: 7.2, camY: 0.95, camX: 0.0 },
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }

  function getScrollProgress() {
    const track = document.querySelector('.scroll-track');
    const max = track.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    return Math.max(0, Math.min(1, y / max));
  }

  function applyFrame() {
    const p = getScrollProgress();
    const segments = keyframes.length - 1;
    const scaled = p * segments;
    const idx = Math.min(segments - 1, Math.floor(scaled));
    const t = scaled - idx;
    const a = keyframes[idx], b = keyframes[idx + 1];

    shoe.rotation.y = lerp(a.rotY, b.rotY, t);
    shoe.rotation.x = lerp(a.rotX, b.rotX, t);
    shoe.position.y = lerp(a.posY, b.posY, t);
    shoe.position.x = lerp(a.posX, b.posX, t);

    camera.position.z = lerp(a.camZ, b.camZ, t);
    camera.position.y = lerp(a.camY, b.camY, t);
    camera.position.x = lerp(a.camX, b.camX, t);
    camera.lookAt(0, -0.05, 0);

    const cue = document.getElementById('scrollCue');
    if (cue) cue.style.opacity = p > 0.04 ? '0' : '1';
  }

  window.addEventListener('scroll', applyFrame, { passive: true });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t0 = 0;
  function animate(t) {
    const dt = (t - t0) / 1000;
    t0 = t;
    shoe.rotation.y += dt * 0.06; // slow idle drift layered on top of the scroll pose
    dust.rotation.y += dt * 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  applyFrame();
  requestAnimationFrame(animate);
})();
