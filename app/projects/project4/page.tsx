"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

// ─── Model Config ────────────────────────────────────────────────────────────
const MODELS = [
  { id: "main",      label: "Main Building", file: "/1.glb" },
  { id: "canteen",   label: "Canteen",        file: "/canteen.glb" },
  { id: "landscape", label: "Landscape",      file: "/landscape fpr renovation 2-blender.glb" },
] as const;

type ModelId = (typeof MODELS)[number]["id"];

const DEFAULT_CAMERA_POSITIONS: Record<ModelId, THREE.Vector3> = {
  main:      new THREE.Vector3(3, 3, -9),
  canteen:   new THREE.Vector3(3, 3, -9),
  landscape: new THREE.Vector3(3, 3, -9),
};

const DEFAULT_CAMERA_TARGETS: Record<ModelId, THREE.Vector3> = {
  main:      new THREE.Vector3(0, 2, 0),
  canteen:   new THREE.Vector3(0, 2, 0),
  landscape: new THREE.Vector3(0, 2, 0),
};

// ─── Disposal helpers ─────────────────────────────────────────────────────────
const disposeMaterial = (material: THREE.Material) => {
  material.dispose();
  const mat = material as any;
  if (mat.map) mat.map.dispose();
  if (mat.lightMap) mat.lightMap.dispose();
  if (mat.bumpMap) mat.bumpMap.dispose();
  if (mat.normalMap) mat.normalMap.dispose();
  if (mat.specularMap) mat.specularMap.dispose();
  if (mat.envMap) mat.envMap.dispose();
  if (mat.roughnessMap) mat.roughnessMap.dispose();
  if (mat.metalnessMap) mat.metalnessMap.dispose();
  if (mat.alphaMap) mat.alphaMap.dispose();
  if (mat.emissiveMap) mat.emissiveMap.dispose();
  if (mat.displacementMap) mat.displacementMap.dispose();
};

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach(disposeMaterial);
    else disposeMaterial(mesh.material as THREE.Material);
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Project4() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<ModelId>("main");
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const mountRef    = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef    = useRef<number>(0);

  // One loaded object per model — never cloned again after preload
  const loadedModels = useRef<Partial<Record<ModelId, THREE.Object3D>>>({});
  const activeModelId = useRef<ModelId>("main");

  // Per-model camera memory
  const savedCameraPos = useRef<Record<ModelId, THREE.Vector3>>({
    main:      DEFAULT_CAMERA_POSITIONS.main.clone(),
    canteen:   DEFAULT_CAMERA_POSITIONS.canteen.clone(),
    landscape: DEFAULT_CAMERA_POSITIONS.landscape.clone(),
  });
  const savedCameraTarget = useRef<Record<ModelId, THREE.Vector3>>({
    main:      DEFAULT_CAMERA_TARGETS.main.clone(),
    canteen:   DEFAULT_CAMERA_TARGETS.canteen.clone(),
    landscape: DEFAULT_CAMERA_TARGETS.landscape.clone(),
  });

  // Fade animation frame tracker so we can cancel orphaned loops
  const fadeFrameRef = useRef<number>(0);
  const currentFadePromise = useRef<((value: void) => void) | null>(null);

  // ─── Helper: set mesh opacity on an object (efficient, no extra allocations) ──
  const setModelOpacity = (obj: THREE.Object3D, opacity: number) => {
    obj.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        const m = mat as THREE.MeshStandardMaterial;
        m.transparent = opacity < 1;
        m.opacity = opacity;
        m.needsUpdate = true;
      });
    });
  };

  // ─── Smooth fade transition with Promise (no memory leaks) ──────────────────
  const fadeTransition = useCallback((fromObj: THREE.Object3D | null, toObj: THREE.Object3D | null, duration = 300): Promise<void> => {
    return new Promise((resolve) => {
      // Cancel any ongoing fade
      if (fadeFrameRef.current) {
        cancelAnimationFrame(fadeFrameRef.current);
        fadeFrameRef.current = 0;
      }
      if (currentFadePromise.current) {
        currentFadePromise.current();
      }
      currentFadePromise.current = resolve;

      const startTime = performance.now();

      // Prepare objects
      if (fromObj) {
        fromObj.visible = true;
        setModelOpacity(fromObj, 1);
      }
      if (toObj) {
        toObj.visible = true;
        setModelOpacity(toObj, 0);
      }

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease in-out cubic for smoother transition
        const easeProgress = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (fromObj) {
          setModelOpacity(fromObj, 1 - easeProgress);
        }
        if (toObj) {
          setModelOpacity(toObj, easeProgress);
        }

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure final states
          if (fromObj) {
            setModelOpacity(fromObj, 0);
            fromObj.visible = false;
            // Reset opacity to 1 for next time it becomes visible
            setModelOpacity(fromObj, 1);
          }
          if (toObj) {
            setModelOpacity(toObj, 1);
          }
          fadeFrameRef.current = 0;
          currentFadePromise.current = null;
          resolve();
        }
      };

      fadeFrameRef.current = requestAnimationFrame(animate);
    });
  }, []);

  // ─── Camera animation with smooth easing ─────────────────────────────────────
  const animateCameraTo = useCallback(
    (toPos: THREE.Vector3, toTarget: THREE.Vector3, duration = 600) => {
      if (!cameraRef.current || !controlsRef.current) return Promise.resolve();
      
      return new Promise<void>((resolve) => {
        const fromPos = cameraRef.current!.position.clone();
        const fromTarget = controlsRef.current!.target.clone();
        const startTime = performance.now();

        const animate = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease in-out cubic for smooth camera movement
          const easeProgress = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
          cameraRef.current!.position.lerpVectors(fromPos, toPos, easeProgress);
          controlsRef.current!.target.lerpVectors(fromTarget, toTarget, easeProgress);
          controlsRef.current!.update();
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        
        requestAnimationFrame(animate);
      });
    },
    [],
  );

  // ─── Model switching with sequential transitions (no memory leaks) ───────────
  const handleModelSwitch = useCallback(
    async (modelId: ModelId) => {
      if (modelId === activeModelId.current || isTransitioning) return;
      
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!scene || !camera || !controls) return;

      setIsTransitioning(true);

      const prevId = activeModelId.current;
      const prevObj = loadedModels.current[prevId];
      const nextObj = loadedModels.current[modelId];

      if (!nextObj) {
        setError(`Model ${modelId} not loaded`);
        setIsTransitioning(false);
        return;
      }

      // Save camera position for current model
      savedCameraPos.current[prevId].copy(camera.position);
      savedCameraTarget.current[prevId].copy(controls.target);

      // Get target camera position for new model
      const targetPos = savedCameraPos.current[modelId];
      const targetTarget = savedCameraTarget.current[modelId];

      // Perform fade transition
      await fadeTransition(prevObj || null, nextObj, 300);
      
      // Animate camera to new position
      await animateCameraTo(targetPos, targetTarget, 600);

      activeModelId.current = modelId;
      setActiveModel(modelId);
      setIsTransitioning(false);
    },
    [fadeTransition, animateCameraTo, isTransitioning],
  );

  // ─── Scene bootstrap (runs once) ─────────────────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping      = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8ddd0);
    sceneRef.current = scene;

    // Sky
    const sky = new Sky();
    sky.scale.setScalar(450_000);
    scene.add(sky);
    const su = sky.material.uniforms;
    su["turbidity"].value       = 4;
    su["rayleigh"].value        = 0.8;
    su["mieCoefficient"].value  = 0.004;
    su["mieDirectionalG"].value = 0.85;
    const sun = new THREE.Vector3();
    sun.setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(75),
      THREE.MathUtils.degToRad(195),
    );
    su["sunPosition"].value.copy(sun);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1500);
    camera.position.copy(DEFAULT_CAMERA_POSITIONS.main);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.copy(DEFAULT_CAMERA_TARGETS.main);
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controls.update();
    controlsRef.current = controls;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const key = new THREE.DirectionalLight(0xfff4e0, 2.0);
    key.position.set(10, 15, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0005;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8e0ff, 0.8);
    fill.position.set(-8, 10, -8);
    scene.add(fill);
    scene.add(new THREE.HemisphereLight(0x9ecfff, 0x6b8c5a, 0.6));

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x4a7040, roughness: 0.9, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // DRACO / GLTF loader
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    // ── Preload all models once, add ALL to scene (hidden), show the active one ──
    const preload = async () => {
      for (const modelCfg of MODELS) {
        try {
          const gltf = await new Promise<THREE.Group>((res, rej) =>
            loader.load(modelCfg.file, (g) => res(g.scene), undefined, rej),
          );

          // Scale & centre
          const box    = new THREE.Box3().setFromObject(gltf);
          const center = box.getCenter(new THREE.Vector3());
          const size   = box.getSize(new THREE.Vector3());
          const scale  = 12 / Math.max(size.x, size.y, size.z);
          gltf.scale.setScalar(scale);
          gltf.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
          gltf.traverse((child) => {
            const m = child as THREE.Mesh;
            if (!m.isMesh) return;
            m.castShadow    = true;
            m.receiveShadow = true;
            // Enable material for opacity transitions
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            mats.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.transparent = true;
              }
            });
          });

          // Start hidden; only "main" visible initially
          gltf.visible = modelCfg.id === "main";
          if (modelCfg.id === "main") {
            setModelOpacity(gltf, 1);
          } else {
            setModelOpacity(gltf, 0);
          }

          scene.add(gltf);
          loadedModels.current[modelCfg.id as ModelId] = gltf;
          console.log(`✓ Loaded: ${modelCfg.label}`);
        } catch (err) {
          console.error(`✗ Failed: ${modelCfg.file}`, err);
          setError(`Failed to load ${modelCfg.label}`);
        }
      }

      setIsInitialLoading(false);
    };

    preload();

    // Render loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameRef.current);
      if (fadeFrameRef.current) {
        cancelAnimationFrame(fadeFrameRef.current);
      }
      window.removeEventListener("resize", onResize);

      // Dispose every loaded model
      Object.values(loadedModels.current).forEach((obj) => {
        if (obj) {
          disposeObject(obj);
          scene.remove(obj);
        }
      });
      loadedModels.current = {};

      // Dispose ground
      disposeObject(ground);
      scene.remove(ground);

      draco.dispose();
      controls.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodically snapshot camera so per-model positions stay current
  useEffect(() => {
    const id = setInterval(() => {
      const camera   = cameraRef.current;
      const controls = controlsRef.current;
      if (!camera || !controls || isTransitioning) return;
      savedCameraPos.current[activeModelId.current].copy(camera.position);
      savedCameraTarget.current[activeModelId.current].copy(controls.target);
    }, 200);
    return () => clearInterval(id);
  }, [isTransitioning]);

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
          height: 100px;
        }

        .nav-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1rem;
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
        .toggle-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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

        .error-message {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          background: #dc2626;
          color: white;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.85rem;
          z-index: 30;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
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

          .viewer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .toggle-group {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 100px;
            padding: 6px;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            width: 100%;
            justify-content: center;
          }

          .toggle-btn {
            padding: 10px 18px;
            font-size: 0.75rem;
            border-radius: 100px;
            background: transparent;
            color: #555;
            font-weight: 600;
          }

          .toggle-btn.active {
            background: #111;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          }

          .toggle-btn:not(.active):hover {
            background: rgba(255, 255, 255, 0.6);
            color: #111;
          }
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
              <span className="sidebar-label">Portfolio — 04</span>
              <h1 className="sidebar-title">
                Mixed-Use <em>Development</em><br />Complex
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

            <Link href="/projects" className="back-link">← All Projects</Link>
          </aside>

          <section className="viewer-panel">
            <div className="viewer-header">
              <span className="viewer-eyebrow">Interactive 3D Model</span>

              <div className="toggle-group">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    className={`toggle-btn ${activeModel === m.id ? "active" : ""}`}
                    onClick={() => handleModelSwitch(m.id)}
                    disabled={isInitialLoading || isTransitioning}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="canvas-wrap">
              <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
              {error && <div className="error-message">⚠️ {error}</div>}
            </div>

            <div className="hints-bar">
              <span className="hint-item">🎬 Smooth crossfade transitions</span>
              <span className="hint-dot" />
              <span className="hint-item">Each model has independent camera view</span>
              <span className="hint-dot" />
              <span className="hint-item">Drag to orbit camera</span>
              <span className="hint-dot" />
              <span className="hint-item">Scroll to zoom</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}