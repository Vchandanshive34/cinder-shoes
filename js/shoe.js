/**
 * Cinder · 02 — an original, procedurally-built low-top track shoe.
 * No external model files: the silhouette is drawn as 2D profiles and
 * lofted/extruded in three.js, so the whole shoe is defined in code.
 * Exposes a single global: buildShoe() -> THREE.Group
 */
function buildShoe() {
  const shoe = new THREE.Group();

  const soleMat   = new THREE.MeshPhysicalMaterial({ color: 0x1f2226, roughness: 0.75, clearcoat: 0.1 });
  const midMat    = new THREE.MeshPhysicalMaterial({ color: 0xf4c430, roughness: 0.4, clearcoat: 0.45 });
  const upperMat  = new THREE.MeshPhysicalMaterial({ color: 0x2b2e33, roughness: 0.8 });
  const overlayMat= new THREE.MeshPhysicalMaterial({ color: 0xe8432c, roughness: 0.55, clearcoat: 0.25 });
  const eyeletMat = new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.35, metalness: 0.3 });
  const laceMat   = new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.65 });
  const heelTabMat= new THREE.MeshPhysicalMaterial({ color: 0xf3f1ec, roughness: 0.5, clearcoat: 0.3 });

  function mesh(geo, mat, shadows = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = shadows;
    m.receiveShadow = true;
    return m;
  }

  // ---- Original sole silhouette --------------------------------------
  // Drawn top-down: x = width (lateral), y = length (heel -1.15 to toe 1.45)
  function soleFootprint(padding) {
    const p = padding || 0;
    const s = new THREE.Shape();
    s.moveTo(0, -1.15 - p);
    s.quadraticCurveTo(-0.50 - p, -1.10 - p, -0.55 - p, -0.40);
    s.quadraticCurveTo(-0.60 - p, 0.30, -0.50 - p, 0.75 + p * 0.5);
    s.quadraticCurveTo(-0.42 - p, 1.12, -0.18, 1.35 + p);
    s.quadraticCurveTo(0, 1.46 + p * 1.4, 0.18, 1.35 + p);
    s.quadraticCurveTo(0.42 + p, 1.12, 0.50 + p, 0.75 + p * 0.5);
    s.quadraticCurveTo(0.60 + p, 0.30, 0.55 + p, -0.40);
    s.quadraticCurveTo(0.50 + p, -1.10 - p, 0, -1.15 - p);
    return s;
  }

  // Outsole: thin lofted rubber slab following the footprint
  const outsoleGeo = new THREE.ExtrudeGeometry(soleFootprint(0), {
    depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2, curveSegments: 24
  });
  outsoleGeo.rotateX(-Math.PI / 2);
  outsoleGeo.translate(0, -0.72, 0);
  const outsole = mesh(outsoleGeo, soleMat);
  shoe.add(outsole);

  // Heel lug pod (traction blocks under the heel only, an original detail)
  const lugGroup = new THREE.Group();
  const lugGeo = new THREE.BoxGeometry(0.14, 0.05, 0.16);
  for (let i = -1; i <= 1; i++) {
    for (let j = 0; j < 2; j++) {
      const lug = mesh(lugGeo, soleMat);
      lug.position.set(i * 0.18, -0.83, -1.0 + j * 0.2);
      lugGroup.add(lug);
    }
  }
  shoe.add(lugGroup);

  // Midsole: thicker foam slab, slightly larger footprint, sits above outsole
  const midGeo = new THREE.ExtrudeGeometry(soleFootprint(0.03), {
    depth: 0.42, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 3, curveSegments: 24
  });
  midGeo.rotateX(-Math.PI / 2);
  midGeo.translate(0, -0.60, 0);
  const midsole = mesh(midGeo, midMat);
  shoe.add(midsole);

  // ---- Upper -----------------------------------------------------------
  // Base last: an asymmetric lofted volume standing in for the knit body
  const upperBody = mesh(new THREE.SphereGeometry(0.78, 36, 26), upperMat);
  upperBody.scale.set(0.74, 0.56, 1.35);
  upperBody.position.set(0, -0.06, 0.02);
  shoe.add(upperBody);

  // Toe spring: the base tilts the toe upward slightly, like a real last
  upperBody.rotation.x = -0.05;

  // Toe cap overlay (original color-block, not a logo)
  const toeCapShape = new THREE.Shape();
  toeCapShape.moveTo(-0.42, 0);
  toeCapShape.quadraticCurveTo(0, 0.32, 0.42, 0);
  toeCapShape.quadraticCurveTo(0.30, -0.26, 0, -0.32);
  toeCapShape.quadraticCurveTo(-0.30, -0.26, -0.42, 0);
  const toeCapGeo = new THREE.ExtrudeGeometry(toeCapShape, { depth: 0.02, bevelEnabled: false, curveSegments: 16 });
  const toeCap = mesh(toeCapGeo, overlayMat);
  toeCap.position.set(0, -0.16, 1.28);
  shoe.add(toeCap);

  // Heel counter overlay, wraps the back
  const heelCounter = mesh(new THREE.SphereGeometry(0.46, 24, 18, 0, Math.PI * 2, 0, Math.PI / 1.7), overlayMat);
  heelCounter.scale.set(0.72, 0.62, 0.5);
  heelCounter.rotation.x = Math.PI;
  heelCounter.position.set(0, 0.05, -1.28);
  shoe.add(heelCounter);

  // Heel pull tab (loop)
  const pullTab = mesh(new THREE.TorusGeometry(0.09, 0.028, 10, 16, Math.PI), heelTabMat);
  pullTab.rotation.set(0, Math.PI, Math.PI / 2);
  pullTab.position.set(0, 0.34, -1.42);
  shoe.add(pullTab);

  // Ankle collar (padded ring around the opening)
  const collar = mesh(new THREE.TorusGeometry(0.34, 0.075, 14, 28, Math.PI * 1.3), upperMat);
  collar.rotation.set(Math.PI / 2.05, 0, -0.32);
  collar.position.set(0, 0.36, -0.95);
  shoe.add(collar);

  // Tongue
  const tongueGeo = new THREE.BoxGeometry(0.30, 0.46, 0.05);
  tongueGeo.translate(0, 0.23, 0);
  const tongue = mesh(tongueGeo, upperMat);
  tongue.rotation.x = -0.5;
  tongue.position.set(0, 0.24, -0.05);
  shoe.add(tongue);

  // Eyelets + crossed laces (an original lacing pattern, 5 rows)
  const eyeletGeo = new THREE.TorusGeometry(0.035, 0.012, 8, 14);
  const rows = 5;
  const eyeletPositions = [];
  for (let i = 0; i < rows; i++) {
    const z = -0.42 + i * 0.24;
    const y = 0.14 + i * 0.045;
    for (const side of [-1, 1]) {
      const e = mesh(eyeletGeo, eyeletMat, false);
      e.position.set(side * 0.19, y, z);
      e.rotation.y = Math.PI / 2;
      shoe.add(e);
      eyeletPositions.push({ x: side * 0.19, y, z });
    }
  }
  // crisscross laces between opposite eyelets on consecutive rows
  for (let i = 0; i < rows - 1; i++) {
    const a = eyeletPositions[i * 2];
    const b = eyeletPositions[i * 2 + 3];
    const c = eyeletPositions[i * 2 + 1];
    const d = eyeletPositions[i * 2 + 2];
    [[a, b], [c, d]].forEach(([p1, p2]) => {
      const dir = new THREE.Vector3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
      const len = dir.length();
      const lace = mesh(new THREE.CylinderGeometry(0.018, 0.018, len, 6), laceMat, false);
      lace.position.set((p1.x + p2.x) / 2, (p1.y + p2.y) / 2 + 0.03, (p1.z + p2.z) / 2);
      lace.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      shoe.add(lace);
    });
  }

  // Side accent — a single sweeping arc, an original mark (not a real logo)
  function sideStripe() {
    const st = new THREE.Shape();
    st.moveTo(-0.95, -0.06);
    st.quadraticCurveTo(-0.1, 0.30, 0.92, 0.10);
    st.quadraticCurveTo(0.3, 0.0, -0.9, -0.30);
    st.closePath();
    return new THREE.ExtrudeGeometry(st, { depth: 0.015, bevelEnabled: false, curveSegments: 20 });
  }
  const stripeL = mesh(sideStripe(), overlayMat, false);
  stripeL.position.set(-0.52, -0.02, -0.1);
  stripeL.rotation.y = Math.PI / 2;
  shoe.add(stripeL);
  const stripeR = mesh(sideStripe(), overlayMat, false);
  stripeR.position.set(0.52, -0.02, -0.1);
  stripeR.rotation.y = -Math.PI / 2;
  shoe.add(stripeR);

  shoe.rotation.set(0.1, 0.7, 0);
  shoe.position.set(0, -0.05, 0);
  return shoe;
}
