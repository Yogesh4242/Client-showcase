"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

// ─── Camera Views ─────────────────────────────────────────────────────────────
// Calibrated for scale = 12 (same as the test tool).
// Positions from the test tool paste directly here without any conversion.
const VIEWS = {
  interior: {
  position: new THREE.Vector3(0.691, 6.085, -0.8),  // Changed Z from -2.631 to -1.8 (closer = more zoomed in)
  target:   new THREE.Vector3(0.00, 4.44, 0.00),
},
  counter: {
    position: new THREE.Vector3(2.80, 7.20, 8.50),
    target:   new THREE.Vector3(0.00, 1.60, 0.00),
  },
  overview: {
    position: new THREE.Vector3(0, 27, 6),
        target: new THREE.Vector3(0, 0, -2)
  },
};

type ViewKey = keyof typeof VIEWS;

// ─── Per-View Orbit Constraints ────────────────────────────────────────────────
const VIEW_CONSTRAINTS = {
  interior: {
  minDistance:      0.5,
  maxDistance:      2.5,  // Changed from 30.0 to 2.5 - prevents zooming out
  minAzimuthAngle: -Infinity,
  maxAzimuthAngle:  Infinity,
  minPolarAngle:    0.1,
  maxPolarAngle:    Math.PI / 1.8,
},
   counter: {
    minDistance:      0.5,
    maxDistance:      Math.sqrt(Math.pow(2.80, 2) + Math.pow(8.50, 2) + Math.pow(7.20 - 1.60, 2)), // Lock at initial distance
    // Allow left rotation (negative values), block right rotation (can't go beyond initial angle)
    minAzimuthAngle: -Math.PI / 2,  // Allows up to 90° left rotation (adjust this value as needed)
    maxAzimuthAngle: Math.atan2(2.80, 8.50),  // Lock at initial angle - prevents right rotation
    minPolarAngle:    0.1,
    maxPolarAngle:    Math.PI / 1.8,
  },
  overview: {
    minDistance:      2.0,
    maxDistance:     60.0,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle:  Infinity,
    minPolarAngle:    0.0,
    maxPolarAngle:    Math.PI / 2.08,
  },
} as const;

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const TRANSITION_DURATION = 1.2;

function applyLimits(controls: OrbitControls, v: ViewKey) {
  const c = VIEW_CONSTRAINTS[v];
  controls.minDistance     = c.minDistance;
  controls.maxDistance     = c.maxDistance;
  controls.minAzimuthAngle = c.minAzimuthAngle;
  controls.maxAzimuthAngle = c.maxAzimuthAngle;
  controls.minPolarAngle   = c.minPolarAngle;
  controls.maxPolarAngle   = c.maxPolarAngle;
}

// ─── Create a beautiful procedural wood floor texture ─────────────────────────
function createFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  
  // Background color - warm wood tone
  ctx.fillStyle = "#c9a87b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw wood grain lines
  const numPlanks = 12;
  const plankWidth = canvas.width / numPlanks;
  
  for (let i = 0; i <= numPlanks; i++) {
    const x = i * plankWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.strokeStyle = "#a07d52";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  // Add wood grain details
  for (let p = 0; p < numPlanks; p++) {
    const startX = p * plankWidth + 10;
    const endX = (p + 1) * plankWidth - 10;
    
    for (let g = 0; g < 8; g++) {
      ctx.beginPath();
      const y = 50 + g * 120 + Math.random() * 40;
      ctx.moveTo(startX + Math.random() * 20, y);
      
      for (let seg = 0; seg < 5; seg++) {
        const x = startX + (seg / 4) * (endX - startX) + Math.random() * 15;
        const yOffset = Math.sin(seg * Math.PI) * 8 + Math.random() * 6;
        ctx.lineTo(x, y + yOffset);
      }
      
      ctx.strokeStyle = `rgba(90, 60, 30, ${0.2 + Math.random() * 0.2})`;
      ctx.lineWidth = 1.5 + Math.random() * 2;
      ctx.stroke();
    }
    
    // Add knots
    for (let k = 0; k < 3; k++) {
      const knotX = startX + Math.random() * (endX - startX);
      const knotY = 100 + Math.random() * 800;
      ctx.beginPath();
      ctx.ellipse(knotX, knotY, 12, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#8b6946";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(knotX, knotY, 6, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#6b4e30";
      ctx.fill();
    }
  }
  
  // Add subtle noise for realism
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
    data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise * 0.8)); // G
    data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise * 0.5)); // B
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  
  return texture;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Project3() {
  const [view, setView] = useState<ViewKey>("interior");

  const mountRef    = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameRef    = useRef<number>(0);
  const clockRef    = useRef(new THREE.Clock());

  const animating  = useRef(false);
  const elapsed    = useRef(0);
  const fromPos    = useRef(new THREE.Vector3());
  const destPos    = useRef(new THREE.Vector3());
  const prevView   = useRef<ViewKey | null>(null);
  const fromQuat   = useRef(new THREE.Quaternion());
  const destQuat   = useRef(new THREE.Quaternion());
  const fromTarget = useRef(new THREE.Vector3());
  const destTarget = useRef(new THREE.Vector3());
  const viewRef    = useRef<ViewKey>("interior");

  useEffect(() => { viewRef.current = view; }, [view]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── Renderer — matched to test tool settings ─────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ── Procedural Sky — Warm golden hour, reduced white ────────────────────────
    const sky = new Sky();
    sky.scale.setScalar(450_000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms["turbidity"].value       = 8.0;      // Higher turbidity = warmer, less white
    skyUniforms["rayleigh"].value        = 0.6;      // Reduced Rayleigh scattering = less white/blue
    skyUniforms["mieCoefficient"].value  = 0.015;    // More mie scattering for golden haze
    skyUniforms["mieDirectionalG"].value = 0.92;     // Stronger sun glow

    // Sun at golden hour angle (lower = warmer, less white)
    const sun = new THREE.Vector3();
    const sunPhi   = THREE.MathUtils.degToRad(70);  // 70° from zenith = 20° elevation (golden hour)
    const sunTheta = THREE.MathUtils.degToRad(220); // South-west direction
    sun.setFromSphericalCoords(1, sunPhi, sunTheta);
    skyUniforms["sunPosition"].value.copy(sun);

    // ── Camera — far=150 matches test tool, prevents depth precision loss ─────
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 150);
    camera.position.copy(VIEWS.interior.position);
    camera.lookAt(VIEWS.interior.target);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed   = 0.55;
    controls.zoomSpeed     = 0.8;
    controls.panSpeed      = 0.7;
    controls.target.copy(VIEWS.interior.target);
    controls.mouseButtons = {
      LEFT:   THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT:  THREE.MOUSE.PAN,
    };
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    applyLimits(controls, "interior");
    controls.update();
    controlsRef.current = controls;
    prevView.current = "interior";

    // ── Lights — warm golden lighting to match sky ────────────────────────────
    const ambient = new THREE.AmbientLight(0xffeedd, 1.2); // Warm ambient
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffe8c0, 2.5); // Warm golden sunlight
    key.position.copy(sun.clone().multiplyScalar(50));     // match sky sun direction
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far  = 80;
    key.shadow.camera.left = -20;
    key.shadow.camera.right  =  20;
    key.shadow.camera.top  =  20;
    key.shadow.camera.bottom = -20;
    scene.add(key);

    const fill1 = new THREE.DirectionalLight(0xc8d8ff, 0.8); // Soft cool fill
    fill1.position.set(-8, 10, -8);
    scene.add(fill1);

    const fill2 = new THREE.DirectionalLight(0xffd8a0, 0.7); // Warm bounce
    fill2.position.set(0, 5, 10);
    scene.add(fill2);

    const hemi = new THREE.HemisphereLight(0xffcc88, 0xc8a97e, 0.6); // Warm sky, warm ground
    scene.add(hemi);

    // ── Floor texture for canteen interior ────────────────────────────────────
    const floorTexture = createFloorTexture();
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.6,
      metalness: 0.05,
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    
    // Create a large floor plane at ground level
    const floorPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      floorMaterial
    );
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -0.1;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);

    // ── Load model ────────────────────────────────────────────────────────────
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load("/canteen.glb", (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      model.updateMatrixWorld(true);

      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());

      // ── scale = 12: identical to test tool ───────────────────────────────
      const scale = 12 / Math.max(size.x, size.y, size.z);
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
          if (mat.map)         mat.map.colorSpace         = THREE.SRGBColorSpace;
          if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
          mat.polygonOffset = true; mat.polygonOffsetFactor = 2; mat.polygonOffsetUnits = 4;
          if (mat.transparent || mat.opacity < 1) mat.depthWrite = false;
          mat.needsUpdate = true;
        });
      });

      scene.add(model);

      // ── Adjust floor plane position based on model's ground level ──────────
      const scaledBox = new THREE.Box3().setFromObject(model);
      const groundY = scaledBox.min.y;
      floorPlane.position.y = groundY - 0.05;
      floorPlane.scale.set(1, 1, 1);

      // ── Interior clipping plane: hides roof so inner surfaces show ───────
      const ceilingY  = scaledBox.max.y * 0.90;
      const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), ceilingY);

      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          (mat as THREE.Material & { _clip?: THREE.Plane })._clip = clipPlane;
          mat.clippingPlanes = [clipPlane]; // interior is starting view
          mat.needsUpdate    = true;
        });
      });

      console.log("Canteen loaded | scale=12 | ceiling clip Y:", ceilingY.toFixed(3));
      console.log("Floor positioned at Y:", floorPlane.position.y);
      console.log("Press P to snapshot camera position + target.");
    });

    // P key → snapshot camera
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "p") return;
      const cam = cameraRef.current; const ctrl = controlsRef.current;
      if (!cam || !ctrl) return;
      console.log(`position: new THREE.Vector3(${cam.position.x.toFixed(3)}, ${cam.position.y.toFixed(3)}, ${cam.position.z.toFixed(3)}),`);
      console.log(`target:   new THREE.Vector3(${ctrl.target.x.toFixed(3)}, ${ctrl.target.y.toFixed(3)}, ${ctrl.target.z.toFixed(3)}),`);
    };
    window.addEventListener("keydown", onKeyDown);

    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const ctrl  = controlsRef.current!;
      const cam   = cameraRef.current!;
      const cv    = viewRef.current;

      if (prevView.current !== cv) {
        fromPos.current.copy(cam.position);
        fromQuat.current.copy(cam.quaternion);
        fromTarget.current.copy(ctrl.target);
        destPos.current.copy(VIEWS[cv].position);
        destTarget.current.copy(VIEWS[cv].target);
        const sc = cam.clone();
        sc.position.copy(destPos.current); sc.lookAt(destTarget.current);
        destQuat.current.copy(sc.quaternion);
        prevView.current = cv;
        elapsed.current = 0; animating.current = true;
        ctrl.enabled = false;
        applyLimits(ctrl, cv);

        // Toggle clipping plane
        sceneRef.current?.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat) => {
            const p = (mat as THREE.Material & { _clip?: THREE.Plane })._clip;
            if (!p) return;
            mat.clippingPlanes = cv === "interior" ? [p] : [];
            mat.needsUpdate = true;
          });
        });
      }

      if (animating.current) {
        elapsed.current = Math.min(elapsed.current + delta, TRANSITION_DURATION);
        const raw = elapsed.current / TRANSITION_DURATION;
        const t   = easeInOutCubic(raw);
        cam.position.lerpVectors(fromPos.current, destPos.current, t);
        ctrl.target.copy(new THREE.Vector3().lerpVectors(fromTarget.current, destTarget.current, t));
        cam.quaternion.slerpQuaternions(fromQuat.current, destQuat.current, t);
        if (raw >= 1) {
          cam.position.copy(destPos.current);
          ctrl.target.copy(destTarget.current);
          cam.lookAt(destTarget.current);
          animating.current = false; ctrl.update(); ctrl.enabled = true;
        }
      } else { ctrl.update(); }

      renderer.render(scene, cam);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');
        :root {
          --cream: #e8ddd0; --parchment: #d9cbb8; --warm-white: #efe6d8;
          --brown-100: #cdbfa8; --brown-300: #a8835a; --brown-500: #7a5230;
          --brown-700: #4e2f10; --brown-900: #2c1a0a; --ink: #1a0f05;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: var(--cream); color: var(--ink); font-family: 'EB Garamond', serif; }
        .page-wrap { min-height: 100vh; background: var(--cream); position: relative; overflow-x: hidden; }
        .page-wrap::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.5;
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
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'JetBrains Mono', monospace; font-size: 1rem;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--brown-500);
          text-decoration: none; transition: color 0.2s, gap 0.2s; justify-self: start;
        }
        .nav-back:hover { color: var(--brown-700); gap: 12px; }
        .nav-back-arrow { font-size: 0.9rem; line-height: 1; transition: transform 0.2s; }
        .nav-back:hover .nav-back-arrow { transform: translateX(-3px); }
        .nav-logo {
          font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700;
          color: var(--brown-700); text-decoration: none; letter-spacing: 0.04em;
          justify-self: center; text-align: center;
        }
        .main { position: relative; z-index: 1; padding-top: 64px; display: grid; grid-template-columns: 300px 1fr; min-height: 100vh; }
        .sidebar {
          border-right: 1px solid var(--brown-100); padding: 56px 36px 56px 48px;
          display: flex; flex-direction: column; gap: 48px; background: var(--warm-white);
          position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto;
        }
        .sidebar-section { display: flex; flex-direction: column; gap: 12px; }
        .sidebar-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: var(--brown-300); }
        .sidebar-title { font-family: 'Playfair Display', serif; font-size: 2.4rem; font-weight: 700; line-height: 1.1; color: var(--brown-900); }
        .sidebar-title em { font-style: italic; color: var(--brown-500); }
        .sidebar-body { font-family: 'EB Garamond', serif; font-size: 1.05rem; line-height: 1.7; color: var(--brown-700); }
        .meta-row { display: flex; flex-direction: column; gap: 6px; }
        .meta-item { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 1px solid var(--brown-100); }
        .meta-key { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brown-300); }
        .meta-val { font-family: 'EB Garamond', serif; font-size: 0.95rem; color: var(--brown-700); }
        .back-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.7rem;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--brown-500);
          text-decoration: none; margin-top: auto; padding-top: 24px;
          border-top: 1px solid var(--brown-100); transition: color 0.2s, gap 0.2s;
        }
        .back-link:hover { color: var(--brown-700); gap: 12px; }
        .viewer-panel { display: flex; flex-direction: column; padding: 48px 56px; gap: 28px; background: var(--cream); }
        .viewer-header { display: flex; align-items: center; justify-content: space-between; }
        .viewer-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--brown-300); }
        .toggle-group { display: flex; background: var(--warm-white); border: 1px solid var(--brown-100); border-radius: 6px; overflow: hidden; padding: 3px; gap: 3px; }
        .toggle-btn { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 14px; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s ease; background: transparent; color: var(--brown-300); }
        .toggle-btn.active { background: var(--brown-700); color: var(--cream); }
        .toggle-btn:not(.active):hover { background: var(--brown-100); color: var(--brown-700); }
        .canvas-wrap {
          flex: 1; min-height: 520px; border-radius: 10px; overflow: hidden;
          border: 1px solid var(--brown-100);
          box-shadow: 0 2px 4px rgba(44,26,10,0.08), 0 8px 24px rgba(44,26,10,0.14), 0 32px 64px rgba(44,26,10,0.12);
          background: var(--parchment); position: relative;
        }
        .canvas-wrap::before, .canvas-wrap::after { content: ''; position: absolute; width: 20px; height: 20px; z-index: 10; pointer-events: none; }
        .canvas-wrap::before { top: 10px; left: 10px; border-top: 1px solid var(--brown-300); border-left: 1px solid var(--brown-300); }
        .canvas-wrap::after  { bottom: 10px; right: 10px; border-bottom: 1px solid var(--brown-300); border-right: 1px solid var(--brown-300); }
        .hints-bar { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
        .hint-item { display: flex; align-items: center; gap: 7px; font-family: 'JetBrains Mono', monospace; font-size: 0.63rem; letter-spacing: 0.08em; color: var(--brown-300); text-transform: uppercase; }
        .hint-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--brown-300); opacity: 0.5; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .sidebar      { animation: fadeUp 0.5s ease both; }
        .viewer-panel { animation: fadeUp 0.5s 0.1s ease both; }
        
        @media (max-width: 768px) {
          .nav { padding: 0 20px; height: 56px; }
          .nav-logo { font-size: 0.95rem; }
          .nav-back { font-size: 0.6rem; gap: 6px; }
          .main { grid-template-columns: 1fr; padding-top: 56px; }
          .sidebar {
            position: static; height: auto; border-right: none;
            border-bottom: 1px solid var(--brown-100); padding: 32px 24px; gap: 28px;
          }
          .sidebar-title { font-size: 1.8rem; }
          .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
          .meta-item {
            flex-direction: column; gap: 2px; padding: 10px 8px;
            border-bottom: 1px solid var(--brown-100); border-right: 1px solid var(--brown-100);
          }
          .meta-item:nth-child(even) { border-right: none; }
          .back-link { margin-top: 8px; padding-top: 16px; }
          .viewer-panel { padding: 24px 16px; gap: 16px; }
          .canvas-wrap { min-height: 300px; }
          .hints-bar { gap: 12px; }
          
          /* Mobile toggle buttons - pill style */
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
            <span className="nav-back-arrow">←</span>Back to Projects
          </Link>
          <div />
        </nav>

        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-section">
              <span className="sidebar-label">Portfolio — 03</span>
              <h1 className="sidebar-title">Modern <em>Canteen</em><br />Design</h1>
            </div>
            <div className="sidebar-section">
              <span className="sidebar-label">Overview</span>
              <p className="sidebar-body">
                Delivered within a live hospital environment, this project required precise execution without disruption.
Underutilized spaces were transformed into a functional canteen, meeting a critical need efficiently.
              </p>
            </div>
            <div className="sidebar-section">
              <span className="sidebar-label">Project Details</span>
             <div className="meta-row">
                {[
                  ["Type",     "Renovation"],
                  ["Year",     "2025"],
                  ["Status",   "Completed"],
                  ["Location", "Chennai, IN"],
                  ["Area",     "-"],
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
                {(["interior","counter","overview"] as ViewKey[]).map((v) => (
                  <button key={v} className={`toggle-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="canvas-wrap">
              <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
            </div>

            <div className="hints-bar">
              {view === "overview" ? (
                <><span className="hint-item">🎬 Smooth camera transitions</span><span className="hint-dot"/><span className="hint-item">Drag to orbit</span><span className="hint-dot"/><span className="hint-item">Scroll to zoom</span><span className="hint-dot"/><span className="hint-item">Full 360° exploration</span></>
              ) : view === "interior" ? (
                <><span className="hint-item">🎬 Smooth camera transitions</span><span className="hint-dot"/><span className="hint-item">Drag to explore interior</span><span className="hint-dot"/><span className="hint-item">Scroll to zoom</span></>
              ) : (
                <><span className="hint-item">🎬 Smooth camera transitions</span><span className="hint-dot"/><span className="hint-item">Drag to rotate around counter</span><span className="hint-dot"/><span className="hint-item">Scroll to zoom</span></>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}