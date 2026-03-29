"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface ModelViewerProps {
  modelUrl?: string;
  hdrUrl?: string;
  autoRotate?: boolean;
  bloomStrength?: number;
  bloomThreshold?: number;
  exposure?: number;
  emissiveBoost?: number;
  backgroundColor?: string;
  className?: string;
}

type LoadingState = "idle" | "loading" | "success" | "error";

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  controls: OrbitControls
) {
  // Measure the raw bounding box before any scaling
  const box    = new THREE.Box3().setFromObject(object);
  const size   = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Normalise the model to a predictable unit size
  const scale = 3.0 / maxDim;
  object.scale.setScalar(scale);

  // Re-measure after scaling
  box.setFromObject(object);
  const scaledCenter = box.getCenter(new THREE.Vector3());
  const scaledSize   = box.getSize(new THREE.Vector3());

  // Centre the model at the world origin
  object.position.sub(scaledCenter);

  // ─── Camera: isometric-style 45° angle from top-right, matching the reference ───
  // Azimuth  ~225° from front-right (model faces toward camera from bottom-left)
  // Elevation ~40° above horizon — gives the "diorama" look in the reference
  const fov      = camera.fov * (Math.PI / 180);
  const fitDist  = (scaledSize.length() / 2) / Math.tan(fov / 2) * 1.35;

  const azimuth   = Math.PI * 1.25; // 225° — front-right corner view
  const elevation = Math.PI * 0.22; // ~40° above horizon

  camera.position.set(
    fitDist * Math.sin(elevation) * Math.sin(azimuth),
    fitDist * Math.cos(elevation),
    fitDist * Math.sin(elevation) * Math.cos(azimuth)
  );

  camera.near = fitDist / 100;
  camera.far  = fitDist * 100;
  camera.updateProjectionMatrix();

  // Orbit target at the vertical centre of the room
  controls.target.set(0, scaledSize.y * 0.05, 0);
  controls.update();
}

function fixMaterials(root: THREE.Object3D, emissiveBoost: number) {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow    = true;
    mesh.receiveShadow = true;

    // Frustum culling can hide parts of large models — disable per-mesh
    mesh.frustumCulled = false;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return;

      // Correct color-space on diffuse + emissive textures
      if (mat.map)         mat.map.colorSpace         = THREE.SRGBColorSpace;
      if (mat.emissiveMap) mat.emissiveMap.colorSpace  = THREE.SRGBColorSpace;

      // Only boost materials that have a dedicated emissive texture map
      if (mat.emissiveMap) {
        mat.emissiveIntensity = emissiveBoost;
      }

      // Strong polygon offset to eliminate z-fighting on coplanar surfaces
      mat.polygonOffset       = true;
      mat.polygonOffsetFactor = 2;   // was 1 — doubled to actually push surfaces apart
      mat.polygonOffsetUnits  = 4;   // was 1 — needs to be higher for dense geometry

      // Transparent materials (glass, decals) need depthWrite off to avoid sorting glitches
      if (mat.transparent || mat.opacity < 1) {
        mat.depthWrite = false;
      }

      mat.needsUpdate = true;
    });
  });
}

export default function ModelViewer({
  modelUrl = "/futuristic_room.glb",
  hdrUrl = "/hdri/studio2.hdr",
  autoRotate = false,
  bloomStrength = 0.2,
  bloomThreshold = 0.88,
  exposure = 0.75,          // lifted slightly from 0.6 — reference looks brighter
  emissiveBoost = 1.0,
  backgroundColor = "#808080", // neutral gray exactly like Sketchfab reference
  className = "",
}: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clockRef      = useRef(new THREE.Clock());
  const mixerClockRef = useRef(new THREE.Clock()); // dedicated clock for animation mixer
  const frameRef = useRef<number>(0);
  const modelRef = useRef<THREE.Object3D | null>(null);

  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState("Loading model…");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [modelName, setModelName] = useState("");
  const [isRotating, setIsRotating] = useState(autoRotate);

  const loadModelFromUrl = useCallback(
    (url: string, displayName: string) => {
      if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;
      setLoadingState("loading");
      setLoadingProgress(0);
      setLoadingMsg("Loading model…");
      setModelName(displayName);
      if (modelRef.current) {
        sceneRef.current.remove(modelRef.current);
        modelRef.current = null;
        mixerRef.current?.stopAllAction();
        mixerRef.current = null;
      }
      const draco = new DRACOLoader();
      draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      loader.load(
        url,
        (gltf) => {
          setLoadingMsg("Setting up PBR materials…");
          const model = gltf.scene;
          fixMaterials(model, emissiveBoost);
          fitCameraToObject(cameraRef.current!, model, controlsRef.current!);
          sceneRef.current!.add(model);
          modelRef.current = model;
          if (gltf.animations.length > 0) {
            // Attach mixer to the scene root so ALL object animations are found
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              action.reset();
              action.setEffectiveTimeScale(1);
              action.setEffectiveWeight(1);
              action.play();
            });
            mixerRef.current = mixer;
            // Reset the dedicated clock so animation starts fresh
            mixerClockRef.current.getDelta();
            console.log(
              `[ModelViewer] ${gltf.animations.length} animation(s):`,
              gltf.animations.map((c) => c.name)
            );
          } else {
            console.log("[ModelViewer] No animations found in this GLB.");
          }
          setLoadingState("success");
        },
        (progress) => {
          if (progress.total > 0) {
            setLoadingProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        },
        (err) => {
          console.error("[ModelViewer]", err);
          setErrorMsg(
            `Could not load "${displayName}". Check the file is in /public and the path is correct.`
          );
          setLoadingState("error");
        }
      );
    },
    [emissiveBoost]
  );

  const loadModelFromFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^.]+$/, "");
      loadModelFromUrl(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    [loadModelFromUrl]
  );

  // Init scene once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 2000);
    camera.position.set(0, 1.5, 5);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.05;
    controls.maxDistance = 500;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // Ambient fill — softens harsh shadow edges like Sketchfab's default lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);

    // One low-intensity shadow-casting key light only — IBL from HDR handles ambient/fill
    const key = new THREE.DirectionalLight(0xffffff, 0.3);
    key.position.set(3, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 200;
    key.shadow.camera.left = -20;
    key.shadow.camera.right = 20;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -20;
    key.shadow.bias = -0.001;
    scene.add(key);

    // HDR env — used for reflections + IBL only, NOT as background
    // Background stays the neutral gray set on scene.background above
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    new RGBELoader().load(
      hdrUrl,
      (hdr) => {
        const envMap = pmrem.fromEquirectangular(hdr).texture;
        scene.environment         = envMap;
        scene.environmentIntensity = 0.9; // enough for PBR reflections, not blowout
        // ✅ Do NOT set scene.background — keep the solid gray
        hdr.dispose();
        pmrem.dispose();
      },
      undefined,
      () => {
        console.warn("[ModelViewer] HDR not found — RoomEnvironment fallback active");
        const neutralEnv = pmrem.fromScene(new RoomEnvironment()).texture;
        scene.environment = neutralEnv;
        pmrem.dispose();
      }
    );

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), bloomStrength, 0.5, bloomThreshold));
    const fxaa = new ShaderPass(FXAAShader);
    fxaa.material.uniforms["resolution"].value.set(1 / W, 1 / H);
    composer.addPass(fxaa);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      fxaa.material.uniforms["resolution"].value.set(1 / w, 1 / h);
    };
    window.addEventListener("resize", onResize);

    const mixerClock = mixerClockRef.current;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      // Use dedicated clock so getDelta() always returns a real elapsed value
      const delta = mixerClock.getDelta();
      if (mixerRef.current) mixerRef.current.update(delta);
      composer.render();
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-load default model
  useEffect(() => {
    const t = setTimeout(() => {
      const name = modelUrl.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "model";
      loadModelFromUrl(modelUrl, name);
    }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadModelFromFile(file);
      e.target.value = "";
    },
    [loadModelFromFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && (file.name.endsWith(".glb") || file.name.endsWith(".gltf"))) {
        loadModelFromFile(file);
      } else {
        setErrorMsg("Please drop a .glb or .gltf file.");
        setLoadingState("error");
      }
    },
    [loadModelFromFile]
  );

  const toggleRotate = useCallback(() => {
    if (!controlsRef.current) return;
    const next = !controlsRef.current.autoRotate;
    controlsRef.current.autoRotate = next;
    setIsRotating(next);
  }, []);

  const resetCamera = useCallback(() => {
    if (modelRef.current && cameraRef.current && controlsRef.current) {
      fitCameraToObject(cameraRef.current, modelRef.current, controlsRef.current);
    }
  }, []);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: backgroundColor }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div ref={mountRef} className="absolute inset-0" />

      {isDragging && (
        <div className="absolute inset-0 z-30 pointer-events-none"
          style={{ border: "2px dashed #818cf8", background: "rgba(99,102,241,0.07)" }} />
      )}

      {loadingState === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
          style={{ background: "rgba(8,8,14,0.82)", backdropFilter: "blur(8px)" }}>
          <style>{`@keyframes _mv_spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ position: "relative", width: 52, height: 52, marginBottom: 18 }}>
            <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: "absolute", inset: 0 }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(99,102,241,0.13)" strokeWidth="3" />
            </svg>
            <svg width="52" height="52" viewBox="0 0 52 52"
              style={{ position: "absolute", inset: 0, animation: "_mv_spin 1s linear infinite" }}>
              <circle cx="26" cy="26" r="22" fill="none" stroke="#6366f1" strokeWidth="3"
                strokeLinecap="round" strokeDasharray="55 90" />
            </svg>
          </div>
          <div style={{ width: 210, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#64748b", fontSize: 11 }}>{loadingMsg}</span>
              <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>{loadingProgress}%</span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{
                height: "100%", width: `${loadingProgress}%`,
                background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                borderRadius: 2, transition: "width 0.25s ease",
              }} />
            </div>
          </div>
          <p style={{ color: "#1e293b", fontSize: 10, letterSpacing: "0.08em" }}>IBL · PBR · BLOOM · FXAA</p>
        </div>
      )}

      {loadingState === "error" && (
        <div style={{
          position: "absolute", bottom: 76, left: "50%", transform: "translateX(-50%)",
          background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 10, padding: "10px 18px", color: "#fca5a5", fontSize: 12,
          zIndex: 30, maxWidth: 400, textAlign: "center", backdropFilter: "blur(6px)",
        }}>
          {errorMsg}
          <button onClick={() => setLoadingState("idle")}
            style={{ marginLeft: 10, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}>
            ✕
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(10,10,18,0.88)", backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
        padding: "7px 14px", zIndex: 10, whiteSpace: "nowrap",
      }}>
        {modelName && (
          <>
            <span style={{ color: "#475569", fontSize: 11, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
              {modelName}
            </span>
            <Divider />
          </>
        )}
        <ToolbarBtn active={isRotating} onClick={toggleRotate} title="Toggle auto-rotate">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M10 6A4 4 0 1 1 6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M6 0l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Rotate
        </ToolbarBtn>
        <ToolbarBtn onClick={resetCamera} title="Reset camera">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          </svg>
          Reset
        </ToolbarBtn>
        <Divider />
        <label title="Open .glb or .gltf" style={{
          color: "#6366f1", fontSize: 11, cursor: "pointer",
          padding: "4px 6px", borderRadius: 6, display: "flex", alignItems: "center",
          gap: 5, transition: "color 0.15s",
        }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#818cf8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6366f1")}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 4l3-3 3 3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Open
          <input type="file" accept=".glb,.gltf" style={{ display: "none" }} onChange={onFileInput} />
        </label>
      </div>

      {/* Controls hint */}
      <div style={{
        position: "absolute", top: 16, right: 18, color: "#1e2d3d",
        fontSize: 10, lineHeight: 1.9, textAlign: "right",
        zIndex: 5, pointerEvents: "none", letterSpacing: "0.02em",
      }}>
        <div>Orbit — left drag</div>
        <div>Pan — right drag</div>
        <div>Zoom — scroll</div>
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />;
}

function ToolbarBtn({
  children, onClick, active, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      background: active ? "rgba(99,102,241,0.18)" : "transparent",
      border: "none", color: active ? "#818cf8" : "#64748b",
      cursor: "pointer", padding: "4px 7px", borderRadius: 6,
      fontSize: 11, display: "flex", alignItems: "center", gap: 5,
      transition: "color 0.15s, background 0.15s",
    }}
      onMouseEnter={(e) => { if (!active)(e.currentTarget as HTMLElement).style.color = "#cbd5e1"; }}
      onMouseLeave={(e) => { if (!active)(e.currentTarget as HTMLElement).style.color = "#64748b"; }}>
      {children}
    </button>
  );
}