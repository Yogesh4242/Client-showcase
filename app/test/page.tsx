"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ModelStats {
  meshes: number;
  verts: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

interface CameraState {
  px: number; py: number; pz: number;
  tx: number; ty: number; tz: number;
}

// ─── Loaded Model ─────────────────────────────────────────────────────────────
function LoadedModel({ url, onStats }: { url: string; onStats: (s: ModelStats) => void }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!scene) return;
    const box    = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const scale  = 40 / Math.max(size.x, size.y, size.z);

    scene.scale.setScalar(scale);
    scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

    let meshes = 0, verts = 0;
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = mesh.receiveShadow = true;
        meshes++;
        if (mesh.geometry?.attributes?.position)
          verts += mesh.geometry.attributes.position.count;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.map)         mat.map.colorSpace         = THREE.SRGBColorSpace;
        if (mat?.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
        if (mat)              mat.needsUpdate             = true;
      }
    });

    const scaled = new THREE.Box3().setFromObject(scene);
    const scaledSize = scaled.getSize(new THREE.Vector3());
    onStats({ meshes, verts, sizeX: scaledSize.x, sizeY: scaledSize.y, sizeZ: scaledSize.z });
  }, [scene, onStats]);

  return <primitive object={scene} />;
}

// ─── HUD Updater — runs inside Canvas, pushes camera state up every frame ────
function HUDUpdater({
  controlsRef,
  onUpdate,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  onUpdate: (s: CameraState) => void;
}) {
  const { camera } = useThree();
  const prev = useRef<string>("");

  useFrame(() => {
    if (!controlsRef.current) return;
    const p = camera.position;
    const t = controlsRef.current.target;
    const key = `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)},${t.x.toFixed(2)},${t.y.toFixed(2)},${t.z.toFixed(2)}`;
    if (key === prev.current) return;
    prev.current = key;
    onUpdate({ px: p.x, py: p.y, pz: p.z, tx: t.x, ty: t.y, tz: t.z });
  });

  return null;
}

// ─── Reset handler — lives inside Canvas to access camera ─────────────────────
function CameraResetter({
  controlsRef,
  resetSignal,
  defaultPos,
  defaultTarget,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl>;
  resetSignal: number;
  defaultPos: THREE.Vector3;
  defaultTarget: THREE.Vector3;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (resetSignal === 0) return;
    camera.position.copy(defaultPos);
    if (controlsRef.current) {
      controlsRef.current.target.copy(defaultTarget);
      controlsRef.current.update();
    }
  }, [resetSignal, camera, controlsRef, defaultPos, defaultTarget]);

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({
  modelUrl,
  onStats,
  onCameraUpdate,
  resetSignal,
  defaultPos,
  defaultTarget,
}: {
  modelUrl: string | null;
  onStats: (s: ModelStats) => void;
  onCameraUpdate: (s: CameraState) => void;
  resetSignal: number;
  defaultPos: THREE.Vector3;
  defaultTarget: THREE.Vector3;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight
        position={[10, 20, 8]} intensity={2.8} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1} shadow-camera-far={200}
        shadow-camera-left={-40} shadow-camera-right={40}
        shadow-camera-top={40}   shadow-camera-bottom={-40}
      />
      <directionalLight position={[-8, 6, -10]} intensity={0.8} color="#c0d8ff" />
      <hemisphereLight args={["#87ceeb", "#3a2a1a", 0.5]} />
      <Environment preset="sunset" environmentIntensity={0.3} backgroundIntensity={0} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#111113" roughness={1} />
      </mesh>

      {/* Grid */}
      <Grid
        position={[0, -0.01, 0]}
        args={[80, 80]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#1a1a1e"
        sectionSize={5}
        sectionThickness={0.6}
        sectionColor="#222228"
        fadeDistance={60}
        fadeStrength={1}
        infiniteGrid
      />

      {/* Model */}
      {modelUrl && (
        <Suspense fallback={null}>
          <LoadedModel url={modelUrl} onStats={onStats} />
        </Suspense>
      )}

      <HUDUpdater controlsRef={controlsRef} onUpdate={onCameraUpdate} />
      <CameraResetter
        controlsRef={controlsRef}
        resetSignal={resetSignal}
        defaultPos={defaultPos}
        defaultTarget={defaultTarget}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        // No min/maxDistance — zoom is fully unlimited
        minDistance={0}
        maxDistance={Infinity}
        zoomSpeed={1.2}
        mouseButtons={{
          LEFT:   THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT:  THREE.MOUSE.PAN,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
        target={defaultTarget.toArray()}
      />
    </>
  );
}

// ─── Coord display ────────────────────────────────────────────────────────────
function CoordValue({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 3 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#444", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 500, color, minWidth: 56, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {value.toFixed(2)}
      </span>
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CameraCalibrator() {
  const [modelUrl,   setModelUrl]   = useState<string | null>(null);
  const [modelName,  setModelName]  = useState<string>("");
  const [stats,      setStats]      = useState<ModelStats | null>(null);
  const [camState,   setCamState]   = useState<CameraState>({ px:0,py:0,pz:0,tx:0,ty:0,tz:0 });
  const [dragOver,   setDragOver]   = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [resetSig,   setResetSig]   = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default camera pos/target — updated when model loads
  const defaultPos    = useRef(new THREE.Vector3(14, 10, 18));
  const defaultTarget = useRef(new THREE.Vector3(0, 2, 0));

  const handleStats = useCallback((s: ModelStats) => {
    setStats(s);
    // Position camera based on model size
    const d = Math.max(s.sizeX, s.sizeZ) * 1.2;
    defaultPos.current.set(d * 0.8, s.sizeY * 1.5, d);
    defaultTarget.current.set(0, s.sizeY * 0.3, 0);
    setResetSig(n => n + 1); // trigger reset to snap to new default
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!/\.(glb|gltf)$/i.test(file.name)) {
      alert("Please select a .glb or .gltf file");
      return;
    }
    if (modelUrl) URL.revokeObjectURL(modelUrl);
    setModelUrl(URL.createObjectURL(file));
    setModelName(file.name.replace(/\.(glb|gltf)$/i, ""));
    setStats(null);
  }, [modelUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const copyCode = useCallback(() => {
    const fmt = (v: number) => v.toFixed(2);
    const { px, py, pz, tx, ty, tz } = camState;
    const text = `position: [${fmt(px)}, ${fmt(py)}, ${fmt(pz)}] as [number, number, number],\ntarget:   [${fmt(tx)}, ${fmt(ty)}, ${fmt(tz)}] as [number, number, number],`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [camState]);

  // Keyboard shortcut R = reset
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey)
        setResetSig(n => n + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const fmt = (v: number) => v.toFixed(2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0b; overflow: hidden; }

        .calibrator {
          position: fixed; inset: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #c8c8d0;
        }

        /* Scanlines */
        .calibrator::after {
          content: '';
          position: fixed; inset: 0; z-index: 9999;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px
          );
        }

        /* Drop screen */
        .drop-screen {
          position: absolute; inset: 0; z-index: 200;
          background: #0a0a0b;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .drop-screen.drag-over { background: #0b150c; }

        .drop-box {
          width: 460px; max-width: 90vw;
          border: 1.5px dashed #252528;
          padding: 60px 44px;
          text-align: center; cursor: pointer;
          position: relative;
          transition: border-color 0.2s, background 0.2s;
        }
        .drop-screen.drag-over .drop-box {
          border-color: #4ade80;
          background: rgba(74,222,128,0.03);
        }
        .drop-box:hover { border-color: #333338; }

        .drop-corner { position: absolute; width: 10px; height: 10px; }
        .dc-tl { top:-1px; left:-1px; border-top:2px solid #4ade80; border-left:2px solid #4ade80; }
        .dc-tr { top:-1px; right:-1px; border-top:2px solid #4ade80; border-right:2px solid #4ade80; }
        .dc-bl { bottom:-1px; left:-1px; border-bottom:2px solid #4ade80; border-left:2px solid #4ade80; }
        .dc-br { bottom:-1px; right:-1px; border-bottom:2px solid #4ade80; border-right:2px solid #4ade80; }

        /* HUD panels */
        .hud { position: absolute; z-index: 100; pointer-events: none; }

        .panel {
          background: rgba(14,14,16,0.92);
          border: 1px solid #1e1e22;
          backdrop-filter: blur(8px);
        }
        .panel + .panel { border-top: none; }

        .panel-tag {
          padding: 5px 10px;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #444;
        }

        /* Coord block */
        .coord-block { padding: 10px 14px; min-width: 268px; }
        .coord-header {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          margin-bottom: 7px;
        }
        .coord-row { display: flex; gap: 8px; align-items: baseline; }

        .copy-row {
          display: flex; align-items: center; gap: 8px;
          margin-top: 9px; padding-top: 9px;
          border-top: 1px solid #1e1e22;
          pointer-events: all;
        }
        .copy-btn {
          cursor: pointer; background: transparent;
          border: 1px solid #252528; color: #555;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 4px 10px;
          transition: all 0.15s;
        }
        .copy-btn:hover { border-color: #4ade80; color: #4ade80; }
        .copy-btn.copied { border-color: #4ade80; color: #4ade80; }

        .copy-preview {
          font-size: 9px; color: #333;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 160px;
        }

        /* Stats */
        .stat-row {
          padding: 6px 12px;
          display: flex; gap: 12px; align-items: baseline;
        }
        .stat-row + .stat-row { border-top: 1px solid #1a1a1e; }
        .sk { font-size: 9px; color: #444; letter-spacing: 0.1em; text-transform: uppercase; }
        .sv { font-size: 11px; color: #bbb; font-weight: 500; }

        /* Hints */
        .hint-row { display: flex; align-items: center; gap: 8px; padding: 4px 12px; }
        .hk { background: #111113; border: 1px solid #1e1e22; padding: 2px 7px; font-size: 9px; color: #333; letter-spacing: 0.08em; text-transform: uppercase; }
        .hd { font-size: 10px; color: #444; letter-spacing: 0.04em; }

        /* Reset btn */
        .reset-btn {
          pointer-events: all; cursor: pointer;
          background: rgba(14,14,16,0.92);
          border: 1px solid #1e1e22;
          color: #444; font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 7px 18px; backdrop-filter: blur(8px);
          transition: all 0.15s;
        }
        .reset-btn:hover { border-color: #fb923c; color: #fb923c; }

        /* Model name */
        .model-name {
          padding: 7px 12px;
          font-size: 11px; font-weight: 500; color: #4ade80;
          max-width: 260px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }

        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease both; }
      `}</style>

      <div className="calibrator">

        {/* Canvas — always mounted */}
        <Canvas
          style={{ position: "absolute", inset: 0 }}
          shadows
          camera={{ position: defaultPos.current.toArray() as [number,number,number], fov: 55, near: 0.001, far: 5000 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.9,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
        >
          <Scene
            modelUrl={modelUrl}
            onStats={handleStats}
            onCameraUpdate={setCamState}
            resetSignal={resetSig}
            defaultPos={defaultPos.current}
            defaultTarget={defaultTarget.current}
          />
        </Canvas>

        {/* Drop screen — shown when no model loaded */}
        {!modelUrl && (
          <div
            className={`drop-screen${dragOver ? " drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="drop-box" onClick={() => fileInputRef.current?.click()}>
              <div className="drop-corner dc-tl" />
              <div className="drop-corner dc-tr" />
              <div className="drop-corner dc-bl" />
              <div className="drop-corner dc-br" />
              <div style={{ fontSize: 36, marginBottom: 24, opacity: 0.3 }}>⬡</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                Drop GLB / GLTF here
              </div>
              <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.06em", lineHeight: 1.8 }}>
                or <span style={{ color: "#4ade80" }}>click to browse</span><br />
                Live position + target readout<br />
                Copy exact coords for your VIEWS config
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              style={{ display: "none" }}
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
          </div>
        )}

        {/* HUD — shown once model is loaded */}
        {modelUrl && (
          <>
            {/* Top-left: tool label + model name */}
            <div className="hud fade-in" style={{ top: 16, left: 16 }}>
              <div className="panel">
                <div className="panel-tag">3D Camera Calibrator</div>
              </div>
              <div className="panel" style={{ marginTop: 4 }}>
                <div className="model-name">{modelName || "model"}</div>
              </div>
            </div>

            {/* Top-right: model stats */}
            {stats && (
              <div className="hud fade-in" style={{ top: 16, right: 16 }}>
                <div className="panel">
                  <div className="stat-row">
                    <span className="sk">Meshes</span><span className="sv">{stats.meshes}</span>
                    <span className="sk" style={{ marginLeft: 8 }}>Verts</span>
                    <span className="sv">{stats.verts > 1000 ? `${(stats.verts/1000).toFixed(1)}k` : stats.verts}</span>
                  </div>
                  <div className="stat-row">
                    <span className="sk">W</span><span className="sv">{stats.sizeX.toFixed(1)}</span>
                    <span className="sk">H</span><span className="sv">{stats.sizeY.toFixed(1)}</span>
                    <span className="sk">D</span><span className="sv">{stats.sizeZ.toFixed(1)}</span>
                    <span className="sk" style={{ marginLeft: 4, fontSize: 8 }}>(scaled units)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom-left: hints */}
            <div className="hud fade-in" style={{ bottom: 16, left: 16 }}>
              <div className="panel" style={{ paddingTop: 4, paddingBottom: 4 }}>
                <div className="hint-row"><span className="hk">LMB</span><span className="hd">rotate</span></div>
                <div className="hint-row"><span className="hk">RMB</span><span className="hd">pan</span></div>
                <div className="hint-row"><span className="hk">Scroll</span><span className="hd">zoom</span></div>
                <div className="hint-row"><span className="hk">R</span><span className="hd">reset camera</span></div>
              </div>
              {/* Load new model */}
              <div className="panel" style={{ marginTop: 4, padding: "6px 12px", pointerEvents: "all" }}>
                <label style={{ cursor: "pointer", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#60a5fa" }}>↑</span> Load new model
                  <input
                    type="file" accept=".glb,.gltf"
                    style={{ display: "none" }}
                    onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  />
                </label>
              </div>
            </div>

            {/* Bottom-right: LIVE COORDS — the main readout */}
            <div className="hud fade-in" style={{ bottom: 16, right: 16 }}>

              {/* Position */}
              <div className="panel coord-block">
                <div className="coord-header" style={{ color: "#4ade80" }}>position</div>
                <div className="coord-row">
                  <CoordValue label="X" value={camState.px} color="#f0f0f8" />
                  <span style={{ color: "#252528" }}>,</span>
                  <CoordValue label="Y" value={camState.py} color="#f0f0f8" />
                  <span style={{ color: "#252528" }}>,</span>
                  <CoordValue label="Z" value={camState.pz} color="#f0f0f8" />
                </div>
              </div>

              {/* Target */}
              <div className="panel coord-block">
                <div className="coord-header" style={{ color: "#60a5fa" }}>target</div>
                <div className="coord-row">
                  <CoordValue label="X" value={camState.tx} color="#f0f0f8" />
                  <span style={{ color: "#252528" }}>,</span>
                  <CoordValue label="Y" value={camState.ty} color="#f0f0f8" />
                  <span style={{ color: "#252528" }}>,</span>
                  <CoordValue label="Z" value={camState.tz} color="#f0f0f8" />
                </div>
                <div className="copy-row">
                  <button
                    className={`copy-btn${copied ? " copied" : ""}`}
                    onClick={copyCode}
                  >
                    {copied ? "✓ Copied!" : "Copy as code"}
                  </button>
                  <span className="copy-preview">
                    [{fmt(camState.px)}, {fmt(camState.py)}, {fmt(camState.pz)}]
                  </span>
                </div>
              </div>
            </div>

            {/* Top-center: reset button */}
            <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100 }}>
              <button className="reset-btn" onClick={() => setResetSig(n => n + 1)}>
                ↺ Reset Camera
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}