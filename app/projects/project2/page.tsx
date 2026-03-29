"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ─── Camera Views (front, back, top only) ────────────────────────────────────
const TARGET = new THREE.Vector3(0, 2, 0);

const VIEWS = {
  front: { position: new THREE.Vector3(3,  3, -9) },
  back:  { position: new THREE.Vector3(-4, 4,  12) },
  top:   { position: new THREE.Vector3(0,  14,  0) },
};

type ViewKey = keyof typeof VIEWS;

// ─── Azimuth limits per view ──────────────────────────────────────────────────
const AZIMUTH = {
  front: { min: Math.PI - (Math.PI * 0.55), max: Math.PI + (Math.PI * 0.55) },
  back:  { min: -(Math.PI * 0.55),           max:  Math.PI * 0.55            },
  top:   { min: -Infinity,                   max:  Infinity                  },
};

// ─── Zoom limits per view ─────────────────────────────────────────────────────
const ZOOM_MAX: Record<ViewKey, number> = {
  front: VIEWS.front.position.distanceTo(new THREE.Vector3(0, 2, 0)),
  back:  VIEWS.back.position.distanceTo(new THREE.Vector3(0, 2, 0)),
  top:   35,
};

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const TRANSITION_DURATION = 1.1;

// ─── Apply orbit limits ───────────────────────────────────────────────────────
function applyLimits(controls: OrbitControls, v: ViewKey) {
  controls.minAzimuthAngle = AZIMUTH[v].min;
  controls.maxAzimuthAngle = AZIMUTH[v].max;
  controls.minDistance = 2;
  controls.maxDistance = ZOOM_MAX[v];
  if (v === "top") {
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI / 2;
  } else {
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Project2() {
  const [view, setView] = useState<ViewKey>("front");

  // Refs for Three.js objects (stable across renders)
  const mountRef      = useRef<HTMLDivElement>(null);
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef   = useRef<OrbitControls | null>(null);
  const frameRef      = useRef<number>(0);
  const clockRef      = useRef(new THREE.Clock());

  // Camera animation state (all refs — never trigger re-renders)
  const animating     = useRef(false);
  const elapsed       = useRef(0);
  const fromPos       = useRef(new THREE.Vector3());
  const destPos       = useRef(new THREE.Vector3());
  const prevView      = useRef<ViewKey | null>(null);
  const fromView      = useRef<ViewKey | null>(null);
  const fromQuat      = useRef(new THREE.Quaternion());
  const destQuat      = useRef(new THREE.Quaternion());

  // Current view ref so the animation loop can read it without stale closure
  const viewRef       = useRef<ViewKey>("front");

  // Keep viewRef in sync when state changes
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // ─── Init scene once on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#d9cbb8"); // --parchment
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.copy(VIEWS.front.position);
    camera.lookAt(TARGET);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.target.copy(TARGET);
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    applyLimits(controls, "front");
    controls.update();
    controlsRef.current = controls;
    prevView.current = "front";

    // Lights — matching Scene component exactly
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(10, 15, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far  = 50;
    key.shadow.camera.left   = -15;
    key.shadow.camera.right  =  15;
    key.shadow.camera.top    =  15;
    key.shadow.camera.bottom = -15;
    scene.add(key);

    const fill1 = new THREE.DirectionalLight(0xc8e0ff, 1.2);
    fill1.position.set(-8, 10, -8);
    scene.add(fill1);

    const fill2 = new THREE.DirectionalLight(0xffffff, 1.0);
    fill2.position.set(0, 5, 10);
    scene.add(fill2);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0xc8a97e, 0.7);
    scene.add(hemi);

    // Load the model
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load("/1.glb", (gltf) => {
      const model = gltf.scene;

      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      model.updateMatrixWorld(true);

      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      const scale  = 12 / Math.max(size.x, size.y, size.z);

      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (!(mat instanceof THREE.MeshStandardMaterial)) return;

          // Correct color-space on diffuse + emissive textures
          if (mat.map)         mat.map.colorSpace         = THREE.SRGBColorSpace;
          if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;

          // Strong polygon offset to eliminate z-fighting on coplanar surfaces (ground floor etc.)
          mat.polygonOffset       = true;
          mat.polygonOffsetFactor = 2;
          mat.polygonOffsetUnits  = 4;

          // Transparent materials (glass, decals) need depthWrite off to avoid sorting glitches
          if (mat.transparent || mat.opacity < 1) {
            mat.depthWrite = false;
          }

          mat.needsUpdate = true;
        });
      });

      scene.add(model);
    });

    // Resize handler
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Animation loop — camera transition logic lives here
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const ctrl  = controlsRef.current!;
      const cam   = cameraRef.current!;
      const currentView = viewRef.current;

      // View changed → kick off transition
      if (prevView.current !== currentView) {
        fromView.current = prevView.current;
        fromPos.current.copy(cam.position);
        fromQuat.current.copy(cam.quaternion);

        if (currentView === "top") {
          const zSign = cam.position.z >= 0 ? 1 : -1;
          destPos.current.set(0, 14, zSign * 0.001);
        } else {
          destPos.current.copy(VIEWS[currentView].position);
        }

        const scratchCam = cam.clone();
        scratchCam.position.copy(destPos.current);
        scratchCam.lookAt(TARGET);
        destQuat.current.copy(scratchCam.quaternion);

        prevView.current  = currentView;
        elapsed.current   = 0;
        animating.current = true;
        ctrl.enabled      = false;
        applyLimits(ctrl, currentView);
      }

      // Animate camera
      if (animating.current) {
        elapsed.current = Math.min(elapsed.current + delta, TRANSITION_DURATION);
        const raw = elapsed.current / TRANSITION_DURATION;
        const t   = easeInOutCubic(raw);

        const fromViewVal = fromView.current;
        const toView = currentView;

        const isFrontToTop = fromViewVal === "front" && toView === "top";
        const isTopToFront = fromViewVal === "top"   && toView === "front";
        const isBackToTop  = fromViewVal === "back"  && toView === "top";
        const isTopToBack  = fromViewVal === "top"   && toView === "back";

        if (isFrontToTop || isTopToFront || isBackToTop || isTopToBack) {
          cam.position.lerpVectors(fromPos.current, destPos.current, t);
          cam.lookAt(TARGET);
          ctrl.target.copy(TARGET);
        } else {
          const fromOff = fromPos.current.clone().sub(TARGET);
          const toOff   = destPos.current.clone().sub(TARGET);
          const fromDir = fromOff.clone().normalize();
          const toDir   = toOff.clone().normalize();
          const fromR   = fromOff.length();
          const toR     = toOff.length();

          const fromDirQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), fromDir);
          const toDirQ   = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toDir);
          const slerpedDirQ = fromDirQ.clone().slerp(toDirQ, t);
          const arcDir = new THREE.Vector3(0, 0, 1).applyQuaternion(slerpedDirQ);

          const arcLift = Math.sin(raw * Math.PI) * Math.max(fromR, toR) * 0.18;
          const radius  = THREE.MathUtils.lerp(fromR, toR, t) + arcLift;

          cam.position.copy(TARGET).addScaledVector(arcDir, radius);

          const isFrontBack =
            (fromView.current === "front" || fromView.current === "back") &&
            (toView === "front" || toView === "back");

          if (isFrontBack) {
            cam.lookAt(TARGET);
          } else {
            cam.quaternion.slerpQuaternions(fromQuat.current, destQuat.current, t);
          }

          ctrl.target.copy(TARGET);
        }

        if (raw >= 1) {
          cam.position.copy(destPos.current);
          cam.lookAt(TARGET);
          animating.current = false;
          ctrl.target.copy(TARGET);
          ctrl.update();
          ctrl.enabled = true;
        }
      } else {
        ctrl.update();
      }

      renderer.render(scene, cam);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');

        :root {
          --cream:      #e8ddd0;
          --parchment:  #d9cbb8;
          --warm-white: #efe6d8;
          --brown-100:  #cdbfa8;
          --brown-300:  #a8835a;
          --brown-500:  #7a5230;
          --brown-700:  #4e2f10;
          --brown-900:  #2c1a0a;
          --ink:        #1a0f05;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: var(--cream);
          color: var(--ink);
          font-family: 'EB Garamond', serif;
        }

        .page-wrap {
          min-height: 100vh;
          background: var(--cream);
          position: relative;
          overflow-x: hidden;
        }

        .page-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        .nav {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 100;
          background: var(--warm-white);
          border-bottom: 1px solid var(--brown-100);
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 64px;
        }

        .nav-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--brown-500);
          text-decoration: none;
          transition: color 0.2s, gap 0.2s;
          justify-self: start;
        }

        .nav-back:hover { color: var(--brown-700); gap: 12px; }

        .nav-back-arrow {
          font-size: 0.9rem;
          line-height: 1;
          transition: transform 0.2s;
        }

        .nav-back:hover .nav-back-arrow { transform: translateX(-3px); }

        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--brown-700);
          text-decoration: none;
          letter-spacing: 0.04em;
          justify-self: center;
          text-align: center;
        }

        .main {
          position: relative;
          z-index: 1;
          padding-top: 64px;
          display: grid;
          grid-template-columns: 300px 1fr;
          min-height: 100vh;
        }

        .sidebar {
          border-right: 1px solid var(--brown-100);
          padding: 56px 36px 56px 48px;
          display: flex;
          flex-direction: column;
          gap: 48px;
          background: var(--warm-white);
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
        }

        .sidebar-section { display: flex; flex-direction: column; gap: 12px; }

        .sidebar-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brown-300);
        }

        .sidebar-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          line-height: 1.1;
          color: var(--brown-900);
        }

        .sidebar-title em { font-style: italic; color: var(--brown-500); }

        .sidebar-body {
          font-family: 'EB Garamond', serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--brown-700);
        }

        .meta-row { display: flex; flex-direction: column; gap: 6px; }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding: 8px 0;
          border-bottom: 1px solid var(--brown-100);
        }

        .meta-key {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--brown-300);
        }

        .meta-val {
          font-family: 'EB Garamond', serif;
          font-size: 0.95rem;
          color: var(--brown-700);
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--brown-500);
          text-decoration: none;
          margin-top: auto;
          padding-top: 24px;
          border-top: 1px solid var(--brown-100);
          transition: color 0.2s, gap 0.2s;
        }

        .back-link:hover { color: var(--brown-700); gap: 12px; }

        .viewer-panel {
          display: flex;
          flex-direction: column;
          padding: 48px 56px;
          gap: 28px;
          background: var(--cream);
        }

        .viewer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .viewer-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brown-300);
        }

        .toggle-group {
          display: flex;
          background: var(--warm-white);
          border: 1px solid var(--brown-100);
          border-radius: 6px;
          overflow: hidden;
          padding: 3px;
          gap: 3px;
        }

        .toggle-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 8px 14px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: var(--brown-300);
        }

        .toggle-btn.active { background: var(--brown-700); color: var(--cream); }
        .toggle-btn:not(.active):hover { background: var(--brown-100); color: var(--brown-700); }

        .canvas-wrap {
          flex: 1;
          min-height: 520px;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--brown-100);
          box-shadow:
            0 2px 4px rgba(44,26,10,0.08),
            0 8px 24px rgba(44,26,10,0.14),
            0 32px 64px rgba(44,26,10,0.12);
          background: var(--parchment);
          position: relative;
        }

        .canvas-wrap::before,
        .canvas-wrap::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          z-index: 10;
          pointer-events: none;
        }
        .canvas-wrap::before {
          top: 10px; left: 10px;
          border-top: 1px solid var(--brown-300);
          border-left: 1px solid var(--brown-300);
        }
        .canvas-wrap::after {
          bottom: 10px; right: 10px;
          border-bottom: 1px solid var(--brown-300);
          border-right: 1px solid var(--brown-300);
        }

        .hints-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .hint-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.63rem;
          letter-spacing: 0.08em;
          color: var(--brown-300);
          text-transform: uppercase;
        }

        .hint-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--brown-300);
          opacity: 0.5;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .sidebar      { animation: fadeUp 0.5s ease both; }
        .viewer-panel { animation: fadeUp 0.5s 0.1s ease both; }

        @media (max-width: 768px) {
          .nav { padding: 0 20px; height: 56px; }
          .nav-logo { font-size: 0.95rem; }
          .nav-back { font-size: 0.6rem; gap: 6px; }
          .main { grid-template-columns: 1fr; padding-top: 56px; }
          .sidebar {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--brown-100);
            padding: 32px 24px;
            gap: 28px;
          }
          .sidebar-title { font-size: 1.8rem; }
          .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
          .meta-item {
            flex-direction: column;
            gap: 2px;
            padding: 10px 8px;
            border-bottom: 1px solid var(--brown-100);
            border-right: 1px solid var(--brown-100);
          }
          .meta-item:nth-child(even) { border-right: none; }
          .back-link { margin-top: 8px; padding-top: 16px; }
          .viewer-panel { padding: 24px 16px; gap: 16px; }
          .canvas-wrap { min-height: 300px; }
          .hints-bar { gap: 12px; }
          .toggle-btn { padding: 6px 12px; font-size: 0.6rem; }
        }
      `}</style>

      <div className="page-wrap">
        <nav className="nav">
          <Link href="/projects" className="nav-back">
            <span className="nav-back-arrow">←</span>
            Back to Projects
          </Link>
          <Link href="/" className="nav-logo">SKS Groups</Link>
          <div />
        </nav>

        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-section">
              <span className="sidebar-label">Portfolio — 02</span>
              <h1 className="sidebar-title">
                Modern <em>Commercial</em><br />Complex
              </h1>
            </div>

            <div className="sidebar-section">
              <span className="sidebar-label">Overview</span>
              <p className="sidebar-body">
                A state-of-the-art commercial development featuring contemporary
                architecture and sustainable design principles. Explore the
                structure in full 3D detail.
              </p>
            </div>

            <div className="sidebar-section">
              <span className="sidebar-label">Project Details</span>
              <div className="meta-row">
                {[
                  ["Type",     "Commercial"],
                  ["Year",     "2025"],
                  ["Status",   "In Progress"],
                  ["Location", "Chennai, IN"],
                  ["Area",     "25,000 sq ft"],
                ].map(([k, v]) => (
                  <div key={k} className="meta-item">
                    <span className="meta-key">{k}</span>
                    <span className="meta-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="viewer-panel">
            <div className="viewer-header">
              <span className="viewer-eyebrow">Interactive 3D Model</span>

              <div className="toggle-group">
                <button
                  className={`toggle-btn ${view === "front" ? "active" : ""}`}
                  onClick={() => setView("front")}
                >
                  Front View
                </button>
                <button
                  className={`toggle-btn ${view === "back" ? "active" : ""}`}
                  onClick={() => setView("back")}
                >
                  Back View
                </button>
                <button
                  className={`toggle-btn ${view === "top" ? "active" : ""}`}
                  onClick={() => setView("top")}
                >
                  Independent View
                </button>
              </div>
            </div>

            <div className="canvas-wrap">
              {/* Stable mount div — Three.js renderer appends its canvas here once */}
              <div
                ref={mountRef}
                style={{ position: "absolute", inset: 0 }}
              />
            </div>

            <div className="hints-bar">
              {["Left drag to rotate", "Scroll to zoom", "Right drag to pan"].map((h, i) => (
                <span key={h} className="hint-item">
                  {i > 0 && <span className="hint-dot" />}
                  {h}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}