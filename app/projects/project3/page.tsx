"use client";

import Link from "next/link";
import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

// ─── Camera Views ─────────────────────────────────────────────────────────────
const VIEWS = {
  front: {

    position: new THREE.Vector3(0, 3, -15),
    target:   new THREE.Vector3(0, 2, 0),
    
  },
  back: {

    position: new THREE.Vector3(0, 3, 15),
    target:   new THREE.Vector3(0, 2, 0),
    
  },
  top: {
    position: new THREE.Vector3(0, 20, 0),
    target:   new THREE.Vector3(0, 2, 0),
  },
  side: {
    position: new THREE.Vector3(15, 3, 0),
    target:   new THREE.Vector3(0, 2, 0),
  },
};

type ViewKey = keyof typeof VIEWS;

// ─── Camera Controller ────────────────────────────────────────────────────────
function CameraController({ view }: { view: ViewKey }) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  const animating  = useRef(false);
  const progress   = useRef(0);
  const fromPos    = useRef(new THREE.Vector3());
  const fromTarget = useRef(new THREE.Vector3());
  const prevView   = useRef<ViewKey | null>(null);

  useFrame((_, delta) => {
    const ctrl = controlsRef.current;

    if (prevView.current === null) {
      prevView.current = view;
      camera.position.copy(VIEWS[view].position);
      if (ctrl) {
        ctrl.target.copy(VIEWS[view].target);
        ctrl.update();
      }
      return;
    }

    if (prevView.current !== view) {
      prevView.current = view;
      fromPos.current.copy(camera.position);
      fromTarget.current.copy(ctrl ? ctrl.target : VIEWS[view].target);
      progress.current = 0;
      animating.current = true;
    }

    if (animating.current) {
      progress.current = Math.min(progress.current + delta * 1.8, 1);
      const t = 1 - Math.pow(1 - progress.current, 3);
      camera.position.lerpVectors(fromPos.current, VIEWS[view].position, t);
      if (ctrl) {
        ctrl.target.lerpVectors(fromTarget.current, VIEWS[view].target, t);
        ctrl.update();
      }
      if (progress.current >= 1) animating.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={1}
      panSpeed={0.8}
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
      minDistance={5}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2}
    />
  );
}


// ─── Building Model ───────────────────────────────────────────────────────────
function BuildingModel() {
  const { scene: rawScene } = useGLTF("/1.glb");

  const scene = useRef<THREE.Group>(rawScene.clone(true)).current;

  const applied = useRef(false);
  if (!applied.current) {
    applied.current = true;

    scene.scale.set(1, 1, 1);
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box    = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const scale  = 12 / Math.max(size.x, size.y, size.z);

    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          if (mat.map)         mat.map.colorSpace         = THREE.SRGBColorSpace;
          if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
          mat.needsUpdate = true;
        }
      }
    });
  }

  return <primitive object={scene} />;
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.2;
      ref.current.rotation.x += delta * 0.4;
    }
  });
  return (
    <mesh ref={ref} position={[0, 1.5, 0]}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color="#c8a97e" wireframe />
    </mesh>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ view }: { view: ViewKey }) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={3.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-8, 10, -8]} intensity={1.2} color="#c8e0ff" />
      <directionalLight position={[0, 5, 10]}   intensity={1.0} color="#ffffff" />
      <hemisphereLight args={["#87ceeb", "#c8a97e", 0.7]} />

      <Environment preset="city" environmentIntensity={0.5} backgroundIntensity={0} />
      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={30} blur={2} far={8} />

      <CameraController view={view} />

      <Suspense fallback={<Loader />}>
        <BuildingModel />
      </Suspense>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Project2() {
  const [view, setView] = useState<ViewKey>("front");

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
                {(["front", "back", "side", "top"] as ViewKey[]).map((v) => (
                  <button
                    key={v}
                    className={`toggle-btn ${view === v ? "active" : ""}`}
                    onClick={() => setView(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)} View
                  </button>
                ))}
              </div>
            </div>

            <div className="canvas-wrap">
              <Canvas
                shadows
                camera={{ fov: 45, near: 0.1, far: 100, position: [0, 3, 15] }}
                gl={{
                  antialias: true,
                  toneMapping: THREE.ACESFilmicToneMapping,
                  toneMappingExposure: 1.0,
                  outputColorSpace: THREE.SRGBColorSpace,
                }}
              >
                <Scene view={view} />
              </Canvas>
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