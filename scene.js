/* scene.js — the persistent 3D backdrop: a procedural torii gate, falling
   sakura petals, and a neon skyline. Everything here is built from raw
   geometry at runtime — no external model files, nothing downloaded,
   nothing traced from existing art. Three.js is vendored locally in
   vendor/three.module.min.js (MIT licensed) to keep the site's
   script-src 'self' CSP intact.

   This file is intentionally independent of app.js: it only touches the
   #bg-canvas element and never reaches into the content/routing layer.
   If WebGL isn't available, or the visitor has prefers-reduced-motion
   set, it quietly does nothing and the CSS gradient backdrop (in
   index.html) stands in on its own. */
import * as THREE from "./vendor/three.module.min.js";

const canvas = document.getElementById("bg-canvas");
if (canvas && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  try {
    initScene(canvas);
  } catch (err) {
    console.warn("3D backdrop disabled:", err.message);
    canvas.hidden = true;
  }
}

function initScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 120);
  camera.position.set(0, 1.4, 9);
  camera.lookAt(0, 0.4, 0);

  const isSmall = () => innerWidth < 720;

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener("resize", resize);

  /* ── lighting ─────────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0x4455aa, 0.55));
  const rim = new THREE.PointLight(0xff4d7e, 3.2, 24, 2);
  rim.position.set(0, 2.6, 3);
  scene.add(rim);
  const fill = new THREE.PointLight(0x7aa8ff, 1.4, 24, 2);
  fill.position.set(-4, 1, 4);
  scene.add(fill);

  /* ── torii gate, built from primitives ───────────────────────── */
  function buildTorii() {
    const group = new THREE.Group();
    const vermillion = new THREE.MeshStandardMaterial({
      color: 0x1a0a10, emissive: 0xff3b5c, emissiveIntensity: 0.85, roughness: 0.35, metalness: 0.15,
    });
    const pillarGeo = new THREE.CylinderGeometry(0.13, 0.17, 3.1, 10);
    const pL = new THREE.Mesh(pillarGeo, vermillion); pL.position.set(-1.25, 0, 0);
    const pR = new THREE.Mesh(pillarGeo, vermillion); pR.position.set(1.25, 0, 0);
    const kasagi = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.22, 0.34), vermillion);
    kasagi.position.set(0, 1.62, 0);
    const kasagiCap = new THREE.Mesh(new THREE.BoxGeometry(3.55, 0.12, 0.42), vermillion);
    kasagiCap.position.set(0, 1.48, 0);
    const nuki = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.16, 0.22), vermillion);
    nuki.position.set(0, 0.95, 0);
    const gakuzuka = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.26), vermillion);
    gakuzuka.position.set(0, 1.2, 0);
    group.add(pL, pR, kasagi, kasagiCap, nuki, gakuzuka);

    // a cheap "glow" behind the gate: an additive-blended sprite
    const glowTex = radialGlowTexture();
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xff3b5c, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.set(7, 7, 1);
    glow.position.set(0, 1, -0.6);
    group.add(glow);

    return group;
  }
  function radialGlowTexture() {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.4, "rgba(255,255,255,0.25)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  // Pushed back, scaled down, and low in frame: a distant monument
  // glimpsed past the reflective ground, not something sitting in the
  // middle of the page fighting the hero photo for attention.
  const torii = buildTorii();
  torii.scale.setScalar(0.62);
  torii.position.set(0, -1.1, -6.5);
  scene.add(torii);

  /* ── reflective ground plane ─────────────────────────────────── */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x0d0b16, roughness: 0.25, metalness: 0.6 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.05;
  scene.add(ground);

  /* ── neon skyline, procedural silhouettes with lit windows ──────
     Batched into two draw calls total (one InstancedMesh for every
     building body, one for every window), not one mesh per building
     and one per window — that version worked but issued hundreds of
     draw calls and tanked frame time on anything without a real GPU
     (software/CPU WebGL fallback). Real GPUs would have shrugged it
     off, but there's no reason to pay that cost either way. */
  function buildSkyline() {
    const group = new THREE.Group();
    const bldCount = isSmall() ? 10 : 18;
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x120a1c, roughness: 0.9 });
    const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), bodyMat, bldCount);
    const dummy = new THREE.Object3D();

    const winColors = [0xff6ea8, 0x7aa8ff, 0x8affea, 0xffc56e].map((c) => new THREE.Color(c));
    const winSpecs = [];
    for (let i = 0; i < bldCount; i++) {
      const w = 0.6 + Math.random() * 1.1;
      const d = 0.6 + Math.random() * 1.1;
      const h = 1.5 + Math.random() * 5;
      const side = i % 2 === 0 ? -1 : 1;
      const bx = side * (4 + Math.random() * 10);
      const by = h / 2 - 2.05;
      const bz = -6 - Math.random() * 14;
      dummy.position.set(bx, by, bz);
      dummy.scale.set(w, h, d);
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);

      const winCount = Math.floor(h * 2);
      for (let j = 0; j < winCount; j++) {
        if (Math.random() > 0.5) continue;
        winSpecs.push({
          x: bx + (Math.random() - 0.5) * w,
          y: by - h / 2 + Math.random() * h,
          z: bz + d / 2 + 0.01,
          color: winColors[(Math.random() * winColors.length) | 0],
        });
      }
    }
    bodies.instanceMatrix.needsUpdate = true;
    group.add(bodies);

    const winMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85 });
    const windows = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.08, 0.1), winMat, winSpecs.length);
    winSpecs.forEach((w, i) => {
      dummy.position.set(w.x, w.y, w.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      windows.setMatrixAt(i, dummy.matrix);
      windows.setColorAt(i, w.color);
    });
    windows.instanceMatrix.needsUpdate = true;
    if (windows.instanceColor) windows.instanceColor.needsUpdate = true;
    group.add(windows);

    return group;
  }
  scene.add(buildSkyline());

  /* ── falling sakura petals, instanced for performance ────────── */
  function buildPetals() {
    const count = isSmall() ? 60 : 110;
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.bezierCurveTo(0.12, 0.05, 0.12, 0.22, 0, 0.3);
    petalShape.bezierCurveTo(-0.12, 0.22, -0.12, 0.05, 0, 0);
    const geo = new THREE.ShapeGeometry(petalShape);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffb3cd, emissive: 0xff6ea8, emissiveIntensity: 0.2,
      side: THREE.DoubleSide, transparent: true, opacity: 0.9, roughness: 0.6,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    const data = [];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18;
      const y = Math.random() * 12 - 1;
      const z = (Math.random() - 0.5) * 14 - 1;
      const speed = 0.35 + Math.random() * 0.5;
      const drift = (Math.random() - 0.5) * 0.4;
      const spin = (Math.random() - 0.5) * 2;
      const scale = 0.5 + Math.random() * 0.7;
      data.push({ x, y, z, speed, drift, spin, scale, rot: Math.random() * Math.PI * 2 });
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return { mesh, data, dummy };
  }
  const petals = buildPetals();
  scene.add(petals.mesh);

  /* ── animation loop ───────────────────────────────────────────── */
  let targetRotX = 0, targetRotY = 0;
  addEventListener("pointermove", (e) => {
    targetRotY = (e.clientX / innerWidth - 0.5) * 0.25;
    targetRotX = (e.clientY / innerHeight - 0.5) * 0.12;
  }, { passive: true });

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; });

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    torii.rotation.y = Math.sin(t * 0.15) * 0.08;
    torii.position.y = -1.1 + Math.sin(t * 0.6) * 0.05;

    camera.rotation.y += (targetRotY - camera.rotation.y) * 0.03;
    camera.rotation.x += (targetRotX - camera.rotation.x) * 0.03;

    const { mesh, data, dummy } = petals;
    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      p.y -= p.speed * dt;
      p.x += Math.sin(t * 0.6 + i) * p.drift * dt;
      p.rot += p.spin * dt;
      if (p.y < -2.2) { p.y = 10 + Math.random() * 2; p.x = (Math.random() - 0.5) * 18; }
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rot * 0.6, p.rot, p.rot * 0.3);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    rim.intensity = 2.8 + Math.sin(t * 2) * 0.4;

    renderer.render(scene, camera);
  }
  animate();
}
