"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// Register once at module level so both Lenis and GSAP effects find it ready
gsap.registerPlugin(ScrollTrigger);

const projectsData = [
  {
    id: 1,
    code: "SKS — 001",
    title: "The Grand Meridian Tower",
    location: "Mumbai, Maharashtra",
    year: "2023",
    category: "VERTICAL CONSTRUCTION",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=85&fit=crop",
  },
  {
    id: 2,
    code: "SKS — 002",
    title: "Coastal Highway Corridor",
    location: "Konkan Belt, Maharashtra",
    year: "2022",
    category: "CIVIL INFRASTRUCTURE",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&q=85&fit=crop",
  },
  {
    id: 3,
    code: "SKS — 003",
    title: "Navi Port Logistics Hub",
    location: "Navi Mumbai, Maharashtra",
    year: "2024",
    category: "INDUSTRIAL WORKS",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85&fit=crop",
  },
  {
    id: 4,
    code: "SKS — 004",
    title: "Deccan Metro Elevated Line",
    location: "Pune, Maharashtra",
    year: "2023",
    category: "METRO & TRANSIT",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=85&fit=crop",
  },
];

const services = [
  {
    id: "01", slug: "infra", tag: "CIVIL & STRUCTURAL", title: "SKS INFRA", subtitle: "Building the bones of tomorrow's cities.",
    desc: "We engineer and deliver robust infrastructure systems—from complex civil installations to large-scale urban frameworks. Every structure is built for lasting performance, safety, and scale.",
    stat1: { value: "120+", label: "Projects Delivered" }, stat2: { value: "25yr", label: "Industry Experience" },
    img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2200&auto=format&fit=crop", accent: "#c9a84c",
  },
  {
    id: "02", slug: "pile", tag: "GEOTECHNICAL ENGINEERING", title: "SKS PILES", subtitle: "Precision that goes deeper than the surface.",
    desc: "Expert piling solutions for every ground condition. We handle driven, bored, and micro-pile systems, backed by advanced load-testing protocols and geotechnical analysis.",
    stat1: { value: "80M+", label: "Linear Meters Piled" }, stat2: { value: "99.8%", label: "Load Test Pass Rate" },
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2200&auto=format&fit=crop", accent: "#a87d3a",
  },
  {
    id: "03", slug: "tech", tag: "SMART CONSTRUCTION", title: "SKS TECH", subtitle: "Where engineering meets the digital frontier.",
    desc: "We harness BIM modeling, IoT site sensors, and AI-driven analytics to transform project delivery. From app development to digital twin infrastructure—we build the software layer of modern construction.",
    stat1: { value: "40+", label: "Digital Tools Built" }, stat2: { value: "3×", label: "Faster Project Insights" },
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2200&auto=format&fit=crop", accent: "#e8c97a",
  },
];

export default function Services() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Featured Projects State
  const [activeProject, setActiveProject] = useState(0);
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false);

  const handleSelectProject = (idx: number) => {
    if (idx === activeProject || isProjectTransitioning) return;
    setIsProjectTransitioning(true);
    setTimeout(() => {
      setActiveProject(idx);
      setIsProjectTransitioning(false);
    }, 400);
  };

  // 1. Lenis Smooth Scrolling
  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Tell ScrollTrigger to use Lenis's scroll position instead of native
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value as number, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });

    lenis.on("scroll", () => ScrollTrigger.update());
    
    const tickFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(tickFn);
    gsap.ticker.lagSmoothing(0, 0);

    // Refresh after Lenis proxy is wired so ScrollTrigger recalculates all positions
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      setTimeout(onLoad, 200);
    } else {
      window.addEventListener("load", onLoad);
    }
    
    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickFn);
      window.removeEventListener("load", onLoad);
      ScrollTrigger.clearScrollMemory();
    };
  }, []);

  // 2. Three.js Infinite Starfield & Responsive Parallax
  useEffect(() => {
    const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    const count = 1200; 
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * 2 * Math.PI; 
      const phi = Math.acos(2 * Math.random() - 1); 
      
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({
      color: 0xffffff, 
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);
    
    let mouseX = 0, mouseY = 0;
    const skyBg = document.querySelector(".sky-bg");
    const cloudOverlay = document.querySelector(".cloud-overlay");

    const onMouse = (e: MouseEvent) => {
      if (window.innerWidth > 900) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 0.1;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 0.1;

        const xMove = (e.clientX / window.innerWidth - 0.5) * 40; 
        const yMove = (e.clientY / window.innerHeight - 0.5) * 40;

        if (skyBg && cloudOverlay) {
          gsap.to(skyBg, { x: -xMove * 0.5, y: -yMove * 0.5, duration: 1, ease: "power2.out" });
          gsap.to(cloudOverlay, { x: -xMove * 1.5, y: -yMove * 1.5, duration: 1, ease: "power2.out" });
        }
      }
    };
    
    window.addEventListener("mousemove", onMouse);
    
    const clock = new THREE.Clock();
    let animId: number;
    
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      
      particles.rotation.y = t * 0.005 + mouseX;
      particles.rotation.x = mouseY * 0.1;
      
      renderer.render(scene, camera);
    };
    animate();
    
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  // 3. GSAP Animations
  useEffect(() => {
    // plugin already registered at module level
    
    const ctx = gsap.context(() => {
      
      gsap.from(".hero-label", { y: 30, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });
      gsap.from(".hero-headline span", {
        y: "110%", opacity: 0, stagger: 0.12, duration: 1, ease: "power4.out", delay: 0.5,
      });
      gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 1, ease: "power3.out", delay: 1 });
      
      let mm = gsap.matchMedia();

      mm.add("(min-width: 901px)", () => {
        const panels = gsap.utils.toArray<HTMLElement>(".service-panel");
        const track = document.querySelector(".panels-track") as HTMLElement;
        
        gsap.to(track, {
          x: "-200vw",
          ease: "none",
          scrollTrigger: {
            id: "panels",
            trigger: ".panels-scroll-container",
            start: "top top",
            end: "+=2500", 
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });


      });

      mm.add("(max-width: 900px)", () => {
        gsap.to(".sky-bg", {
          y: "15%",
          ease: "none",
          scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }
        });
        gsap.to(".cloud-overlay", {
          y: "30%",
          ease: "none",
          scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }
        });
        gsap.to(".hero-canvas", {
          y: "40%", 
          ease: "none",
          scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true }
        });

        const panels = gsap.utils.toArray<HTMLElement>(".service-panel");
        panels.forEach((panel) => {
          gsap.from(panel.querySelectorAll(".panel-animate"), {
            y: 30, stagger: 0.1, duration: 0.8, ease: "power2.out", force3D: true,
            scrollTrigger: {
              trigger: panel,
              start: "top 75%",
              once: true,
            }
          });
        });
      });

      gsap.to(".scroll-marquee-inner", {
        xPercent: -50,
        duration: 30,
        ease: "none",
        repeat: -1,
      });

    }, containerRef);

    // Refresh after all ScrollTriggers are created so pin sizes and positions
    // are correct even if fonts or images haven't loaded yet during first paint
    const refreshId = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(refreshId);
      ctx.revert();
    };
  }, []);

  const currentProject = projectsData[activeProject];

  return (
    <div ref={containerRef} className="main-wrapper">

      <section className="hero-section">
        <div className="sky-bg"></div>
        <div className="cloud-overlay"></div>
        <canvas id="hero-canvas" className="hero-canvas" />
        
        <div className="hero-inner">
          <p className="hero-label panel-animate">WHAT WE DO</p>
          <h1 className="hero-headline">
            <span>Engineering</span>
            <span className="headline-gold">Excellence</span>
            <span>Across Every</span>
            <span>Scale.</span>
          </h1>
          <p className="hero-sub">
            Infrastructure · Geotechnical · Smart Construction
          </p>
        </div>
      </section>

      <div className="panels-scroll-container">
        <div className="panels-track">
          {services.map((svc) => (
            <div className="service-panel" key={svc.id}>
              <div className="panel-left">
                <div className="img-scale-wrapper">
                  <img className="panel-img" src={svc.img} alt={svc.title} />
                  <div className="panel-img-overlay" />
                </div>
                <div className="panel-id">{svc.id}</div>
              </div>
              
              <div className="panel-right">
                <span className="panel-tag panel-animate">{svc.tag}</span>
                <h2 className="panel-title panel-animate">{svc.title}</h2>
                <p className="panel-subtitle panel-animate">{svc.subtitle}</p>
                <p className="panel-desc panel-animate">{svc.desc}</p>
                
                <div className="panel-stats panel-animate">
                  <div className="stat-box">
                    <span className="stat-value" style={{ color: svc.accent }}>{svc.stat1.value}</span>
                    <span className="stat-label">{svc.stat1.label}</span>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-box">
                    <span className="stat-value" style={{ color: svc.accent }}>{svc.stat2.value}</span>
                    <span className="stat-label">{svc.stat2.label}</span>
                  </div>
                </div>

                <div className="panel-cta-wrapper panel-animate">
                  <Link href={`/${svc.slug}`} className="panel-btn-solid">
                    EXPLORE {svc.title} <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="fp-section">
        <div className="fp-grain" />
        <div className="fp-line-h" style={{ top: "0", left: 0, right: 0 }} />
        <div className="fp-line-v" style={{ left: "8%", top: 0, bottom: 0, opacity: 0.4 }} />
        <div className="fp-line-v" style={{ right: "8%", top: 0, bottom: 0, opacity: 0.4 }} />

        <div className="fp-container">
          <div className="fp-eyebrow">
            <div className="fp-eyebrow-line" />
            <span className="fp-eyebrow-text">Our Finest Works</span>
            <div className="fp-eyebrow-line" style={{ opacity: 0.3, width: 20 }} />
          </div>

          <h2 className="fp-heading">
            Featured <em>Projects</em>
          </h2>
          <p className="fp-subheading">
            Engineered with conviction. Built to outlive the century.
          </p>

          <div className="fp-grid">
            <div className="fp-image-wrap">
              <img
                src={currentProject.image}
                alt={currentProject.title}
                className={`fp-image ${isProjectTransitioning ? "transitioning" : ""}`}
              />
              <div className="fp-image-badge">
                <span className="fp-badge-code">{currentProject.code}</span>
                <span className="fp-badge-cat">{currentProject.category}</span>
              </div>
              <div className="fp-image-year">{currentProject.year}</div>
            </div>

            <div className="fp-list">
              {projectsData.map((p, idx) => (
                <div
                  key={p.id}
                  className={`fp-list-item ${activeProject === idx ? "active" : ""}`}
                  onClick={() => handleSelectProject(idx)}
                >
                  <div className="fp-item-num">0{idx + 1}</div>
                  <div className="fp-item-title">{p.title}</div>
                  <div className="fp-item-location">{p.location}</div>
                  <span className="fp-item-arrow">→</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fp-progress">
            {projectsData.map((_, idx) => (
              <div
                key={idx}
                className={`fp-progress-dot ${activeProject === idx ? "active" : ""}`}
                onClick={() => handleSelectProject(idx)}
              />
            ))}
            <div className="fp-progress-line">
              <div
                className="fp-progress-line-fill"
                style={{ width: `${((activeProject + 1) / projectsData.length) * 100}%` }}
              />
            </div>
            <span className="fp-progress-counter">
              {String(activeProject + 1).padStart(2, "0")} / {String(projectsData.length).padStart(2, "0")}
            </span>
          </div>

          {/* Text Reveal Effect - Without View All Projects button and border line */}
          <div className="text-reveal-wrapper">
            <div className="text-reveal-container">
              <h1 className="reveal-headline fade-from-left">
                Visit Our Projects
              </h1>
              <p className="reveal-description fade-from-right">
                Explore our portfolio of completed and ongoing infrastructure projects 
                delivered with precision, quality, and care.
              </p>
              <div className="reveal-button-wrapper fade-from-top">
                <Link href="/projects" className="reveal-button">
                  <span>Explore Projects →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section">
        
        <div className="scroll-marquee">
          <div className="scroll-marquee-inner">
            {Array(10).fill("LET'S BUILD SOMETHING EXTRAORDINARY — ").map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
        
        <div className="contact-bottom">
          <div className="contact-cta-wrapper">
            <p className="contact-sub">Bring your vision to life with precision engineering.</p>
            <Link href="/contact" className="massive-contact-btn">
              GET IN TOUCH 
            </Link>
          </div>
          
          <div className="contact-footer-bar">
            <span>© 2026 SKS GROUPS</span>
            <span>ELEVATING STANDARDS</span>
          </div>
        </div>

      </section>

      <style jsx global>{`
        @font-face {
          font-family: 'Harmond';
          src: url('/fonts/Harmond-ExtBdItaExtExp.woff2') format('woff2'),
               url('/fonts/Harmond-ExtBdItaExtExp.otf') format('opentype');
          font-weight: 800;
          font-style: italic;
          font-display: swap;
        }

        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

        html.lenis, html.lenis body { height: auto; }
        .lenis.lenis-smooth { scroll-behavior: auto !important; }
        .lenis.lenis-stopped { overflow: hidden; }
        
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --gold: #c9a84c;
          --bg: #03070b; 
          --bg-dark: #000000;
          --text: #ffffff;
          --text-color: #c9a84c;
        }
        
        body { 
          background: var(--bg); 
          color: var(--text); 
          font-family: 'Inter', sans-serif; 
          overflow-x: hidden; 
        }

        .main-wrapper {
          position: relative;
          width: 100vw;
          overflow-x: hidden;
        }

        .hero-section {
          position: relative;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }
        
        .sky-bg {
          position: absolute;
          top: -15%; left: -10%;
          width: 120%; height: 130%;
          background: linear-gradient(180deg, #020b14 0%, #051320 60%, #000000 100%);
          z-index: 0;
          will-change: transform;
        }
        
        .cloud-overlay {
          position: absolute;
          top: -15%; left: -10%;
          width: 120%; height: 130%;
          background-image: url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          opacity: 0.12;
          mix-blend-mode: screen;
          z-index: 1;
          will-change: transform;
        }
        
        .hero-canvas {
          position: absolute;
          inset: 0;
          height: 120%;
          z-index: 2;
          will-change: transform;
        }
        
        .hero-inner {
          position: relative;
          z-index: 5;
          padding: 0 6% 8vh;
          width: 100%;
        }
        
        .hero-label {
          font-family: 'Harmond', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.25em;
          color: var(--gold);
          font-weight: 500;
          margin-bottom: 2rem;
        }
        
        .hero-headline {
          display: flex;
          flex-direction: column;
          font-family: 'Harmond', serif; 
          font-size: clamp(2.2rem, 8vw, 7rem); 
          font-weight: 1000;
          line-height: 1.1;
          letter-spacing: -0.01em; 
          margin-bottom: 2.5rem;
          overflow-wrap: break-word; 
          word-wrap: break-word;
          max-width: 120%;
        }
        
        .hero-headline span {
          display: block;
          width: fit-content; 
          clip-path: inset(0 -80px -20px -20px); 
          max-width: 100%;
        }
        
        .headline-gold { 
          background: linear-gradient(45deg, #c59b48 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #8c6014 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 8px 16px rgba(197, 155, 72, 0.25));
          padding-right: 20px;
        }
        
        .hero-sub {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.6);
        }

        .panels-scroll-container { 
          width: 100vw; 
          overflow: hidden; 
          background: var(--bg-dark);
          position: relative;
        }
        
        .panels-track { 
          display: flex; 
          width: 300vw; 
          height: 100vh; 
          transform: translateZ(0); 
          will-change: transform;
        }

        .service-panel {
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-shrink: 0;
          background: var(--bg-dark);
          border-left: 1px solid rgba(255,255,255,0.05);
          border-right: none;
          gap: 0;
          margin: 0;
          padding: 0;
        }
        
        .panel-animate {
          will-change: transform, opacity;
        }
        
        .panel-left { 
          position: relative; 
          width: 50%; 
          height: 100%; 
          overflow: hidden; 
          flex-shrink: 0;
          background-color: #000000;
          margin-right: -1px;
          border-right: none;
          outline: none;
        }
        
        .img-scale-wrapper {
          width: calc(100% + 2px);
          height: 100%;
          overflow: hidden;
          transform: translateZ(0); 
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          position: relative;
          right: -1px;
          background-color: #000000;
        }
        
        .panel-img {
          width: 100%; 
          height: 100%; 
          object-fit: cover;
          filter: grayscale(20%) brightness(0.8);
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          min-width: 100%;
          min-height: 100%;
        }
        
        .panel-img-overlay {
          position: absolute; 
          inset: 0;
          background: linear-gradient(to right, transparent 50%, #000 100%);
          pointer-events: none;
          right: -1px;
          width: calc(100% + 2px);
        }
        
        .panel-id {
          position: absolute; 
          top: 40px; 
          left: 40px;
          font-family: 'Syne', sans-serif; 
          font-size: clamp(3rem, 6vw, 6rem); 
          font-weight: 800;
          color: rgba(255,255,255,0.05); 
          line-height: 1; 
          pointer-events: none;
        }
        
        .panel-right { 
          flex: 1; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          padding: 0 8%;
          margin-left: -1px;
          position: relative;
          z-index: 2;
          background: var(--bg-dark);
        }
        
        .panel-tag { 
          font-family: 'Inter', sans-serif; 
          font-size: 0.75rem; 
          letter-spacing: 0.2em; 
          color: var(--gold); 
          margin-bottom: 1.5rem; 
        }
        
        .panel-title { 
          font-family: 'Harmond', serif;
          font-size: clamp(1.5rem, 3.5vw, 3.8rem);
          font-weight: 800; 
          margin-bottom: 1rem; 
        }
        
        .panel-subtitle { 
          font-family: 'Cormorant Garamond', serif; 
          font-size: clamp(1.4rem, 2vw, 1.8rem); 
          font-style: italic; 
          color: rgba(255,255,255,0.7); 
          margin-bottom: 2rem; 
        }
        
        .panel-desc { 
          font-family: 'Inter', sans-serif; 
          font-size: 1rem; 
          font-weight: 300; 
          line-height: 1.7; 
          color: rgba(255,255,255,0.6); 
          max-width: 480px; 
          margin-bottom: 3rem; 
        }
        
        .panel-stats { 
          display: flex; 
          gap: 40px; 
          margin-bottom: 4rem; 
        }
        
        .stat-box { 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
        }
        
        .stat-value { 
          font-family: 'Syne', sans-serif; 
          font-size: clamp(2rem, 3vw, 2.5rem); 
          font-weight: 800; 
        }
        
        .stat-label { 
          font-family: 'Inter', sans-serif; 
          font-size: 0.75rem; 
          letter-spacing: 0.1em; 
          color: rgba(255,255,255,0.4); 
        }
        
        .stat-divider { 
          width: 1px; 
          height: 50px; 
          background: rgba(255,255,255,0.1); 
        }
        
        .panel-cta-wrapper { 
          margin-top: 1rem; 
        }
        
        .panel-btn-solid {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--gold);
          color: #000;
          padding: 22px 50px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(201, 168, 76, 0.2);
          transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
          border-radius: 4px;
        }
        
        .panel-btn-solid:hover {
          background: #e8c97a;
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(201, 168, 76, 0.4);
        }

        .fp-section {
          font-family: 'Montserrat', sans-serif;
          background: #080808;
          color: #e8dfc8;
          position: relative;
          overflow: hidden;
        }
        
        .fp-grain {
          position: absolute; inset: 0;
          background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAABVVVUzMzNEREQMDAwhISEmJibC5Hw5AAAAXUlEQVR42mOQAAZBEgYGBzEGBiMDMwaG//8ZmBkYGBiMGHwYGf//B2EQ//8fw/8HMBgZGIzQBRnEIxR///wP0gBSI16g/v8PpMF/9GBkZIBxDP/R/I/mJNKcI7SYAQBEM2X/N/M4tAAAAABJRU5ErkJggg==");
          background-repeat: repeat;
          opacity: 0.05;
          pointer-events: none;
          z-index: 0;
        }
        
        .fp-line-h { 
          position: absolute; 
          height: 1px; 
          background: linear-gradient(90deg, transparent, #C9A84C44, transparent); 
          pointer-events: none; 
        }
        
        .fp-line-v { 
          position: absolute; 
          width: 1px; 
          background: linear-gradient(180deg, transparent, #C9A84C44, transparent); 
          pointer-events: none; 
        }

        .fp-container {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 100px 60px;
        }
        
        .fp-float-num {
          position: absolute; 
          right: -20px; 
          top: 60px;
          font-family: 'Cormorant Garamond', serif; 
          font-size: 200px; 
          font-weight: 300;
          color: rgba(201,168,76,0.03); 
          line-height: 1; 
          pointer-events: none; 
          user-select: none; 
          z-index: 0;
        }

        .fp-eyebrow { 
          display: flex; 
          align-items: center; 
          gap: 18px; 
          margin-bottom: 20px; 
        }
        
        .fp-eyebrow-line { 
          width: 40px; 
          height: 1px; 
          background: #C9A84C; 
        }
        
        .fp-eyebrow-text { 
          font-family: 'Montserrat', sans-serif; 
          font-size: 10px; 
          font-weight: 600; 
          letter-spacing: 4px; 
          color: #C9A84C; 
          text-transform: uppercase; 
        }
        
        .fp-heading { 
          font-family: 'Harmond', serif;
          font-size: clamp(28px, 4vw, 56px);
          font-weight: 300; 
          line-height: 1.0; 
          color: #f0e6cc; 
          margin-bottom: 12px; 
          letter-spacing: -1px; 
        }
        
        .fp-heading em { 
          font-style: italic; 
          color: #C9A84C; 
        }
        
        .fp-subheading { 
          font-family: 'Cormorant Garamond', serif; 
          font-size: clamp(16px, 1.6vw, 22px); 
          font-weight: 300; 
          font-style: italic; 
          color: #8a7d65; 
          margin-bottom: 70px; 
          max-width: 540px; 
          line-height: 1.6; 
        }

        .fp-grid { 
          display: grid; 
          grid-template-columns: 1fr 420px; 
          gap: 0; 
          align-items: start; 
          min-height: 520px; 
        }

        .fp-image-wrap { 
          position: relative; 
          height: 560px; 
          overflow: hidden; 
          border: 1px solid #C9A84C22; 
        }
        
        .fp-image-wrap::before { 
          content: ''; 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(135deg, rgba(8,8,8,0.3), transparent 50%, rgba(8,8,8,0.6)); 
          z-index: 1; 
        }
        
        .fp-image-wrap::after { 
          content: ''; 
          position: absolute; 
          top: 0; 
          left: 0; 
          right: 0; 
          height: 2px; 
          background: linear-gradient(90deg, transparent, #C9A84C, transparent); 
          z-index: 2; 
        }
        
        .fp-image { 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          transition: transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease; 
          transform-origin: center; 
          will-change: transform; 
        }
        
        .fp-image.transitioning { 
          opacity: 0; 
          transform: scale(1.04); 
        }
        
        .fp-image-wrap:hover .fp-image { 
          transform: scale(1.04); 
        }
        
        .fp-image-badge { 
          position: absolute; 
          bottom: 28px; 
          left: 28px; 
          z-index: 3; 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }
        
        .fp-badge-code { 
          font-size: 10px; 
          font-weight: 600; 
          letter-spacing: 4px; 
          color: #C9A84C; 
          text-transform: uppercase; 
        }
        
        .fp-badge-cat { 
          font-family: 'Montserrat', sans-serif; 
          font-size: 9px; 
          font-weight: 500; 
          letter-spacing: 3px; 
          color: rgba(232,223,200,0.6); 
          text-transform: uppercase; 
          background: rgba(8,8,8,0.6); 
          padding: 4px 10px; 
          border-left: 2px solid #C9A84C; 
        }
        
        .fp-image-year { 
          position: absolute; 
          top: 28px; 
          right: 28px; 
          z-index: 3; 
          font-family: 'Cormorant Garamond', serif; 
          font-size: 72px; 
          font-weight: 300; 
          color: rgba(201,168,76,0.15); 
          line-height: 1; 
          pointer-events: none; 
        }

        .fp-list { 
          display: flex; 
          flex-direction: column; 
          border-left: 1px solid #C9A84C22; 
          height: 560px; 
          overflow: hidden; 
        }
        
        .fp-list-item { 
          flex: 1; 
          padding: 0 32px; 
          border-bottom: 1px solid #C9A84C11; 
          cursor: pointer; 
          position: relative; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          transition: background 0.4s ease; 
          overflow: hidden; 
        }
        
        .fp-list-item::before { 
          content: ''; 
          position: absolute; 
          left: 0; 
          top: 0; 
          bottom: 0; 
          width: 2px; 
          background: #C9A84C; 
          transform: scaleY(0); 
          transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94); 
          transform-origin: bottom; 
        }
        
        .fp-list-item.active::before, 
        .fp-list-item:hover::before { 
          transform: scaleY(1); 
        }
        
        .fp-list-item.active { 
          background: rgba(201,168,76,0.04); 
        }
        
        .fp-list-item:hover { 
          background: rgba(201,168,76,0.02); 
        }
        
        .fp-list-item:last-child { 
          border-bottom: none; 
        }
        
        .fp-item-num { 
          font-size: 9px; 
          font-weight: 600; 
          letter-spacing: 3px; 
          color: #C9A84C66; 
          text-transform: uppercase; 
          margin-bottom: 8px; 
          transition: color 0.3s; 
        }
        
        .fp-list-item.active .fp-item-num, 
        .fp-list-item:hover .fp-item-num { 
          color: #C9A84C; 
        }
        
        .fp-item-title { 
          font-family: 'Cormorant Garamond', serif; 
          font-size: 18px; 
          font-weight: 400; 
          color: #c8bfa8; 
          transition: color 0.3s; 
          line-height: 1.2; 
          margin-bottom: 4px; 
        }
        
        .fp-list-item.active .fp-item-title, 
        .fp-list-item:hover .fp-item-title { 
          color: #f0e6cc; 
        }
        
        .fp-item-location { 
          font-size: 9px; 
          font-weight: 400; 
          letter-spacing: 2px; 
          color: #5a5040; 
          text-transform: uppercase; 
          transition: color 0.3s; 
        }
        
        .fp-list-item.active .fp-item-location, 
        .fp-list-item:hover .fp-item-location { 
          color: #8a7d65; 
        }
        
        .fp-item-arrow { 
          position: absolute; 
          right: 28px; 
          font-size: 18px; 
          color: #C9A84C; 
          opacity: 0; 
          transform: translateX(-8px); 
          transition: opacity 0.3s, transform 0.3s; 
        }
        
        .fp-list-item.active .fp-item-arrow, 
        .fp-list-item:hover .fp-item-arrow { 
          opacity: 1; 
          transform: translateX(0); 
        }

        .fp-progress { 
          margin-top: 32px; 
          display: flex; 
          gap: 8px; 
          align-items: center; 
        }
        
        .fp-progress-dot { 
          width: 6px; 
          height: 6px; 
          border-radius: 50%; 
          background: #2a2520; 
          border: 1px solid #C9A84C44; 
          cursor: pointer; 
          transition: background 0.3s, transform 0.3s; 
        }
        
        .fp-progress-dot.active { 
          background: #C9A84C; 
          transform: scale(1.3); 
        }
        
        .fp-progress-line { 
          flex: 1; 
          height: 1px; 
          background: #1a1510; 
          position: relative; 
          overflow: hidden; 
        }
        
        .fp-progress-line-fill { 
          position: absolute; 
          top: 0; 
          left: 0; 
          height: 100%; 
          background: linear-gradient(90deg, #C9A84C, #e8d08a); 
          transition: width 0.6s cubic-bezier(0.25,0.46,0.45,0.94); 
        }
        
        .fp-progress-counter { 
          font-size: 9px; 
          letter-spacing: 3px; 
          color: #5a5040; 
          font-weight: 600; 
          text-transform: uppercase; 
        }

        /* Text Reveal Effect Styles - Without border line */
        .text-reveal-wrapper {
          margin-top: 80px;
          padding: 60px 0 20px;
        }

        .text-reveal-container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .reveal-headline {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          background: 
            linear-gradient(to top left, transparent 50%, var(--text-color) 60%, var(--text-color) 0) left bottom 25vh / 100vw 30vh fixed no-repeat,
            linear-gradient(to top, transparent 55%, var(--text-color) 0) left bottom 0vh / 100vw 100vh fixed no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .reveal-description {
          font-size: clamp(1.1rem, 2vw, 1.4rem);
          font-family: 'DM Sans', sans-serif;
          line-height: 1.6;
          margin-bottom: 2.5rem;
          color: #8a7d65;
          background: 
            linear-gradient(to top right, transparent 50%, var(--text-color) 60%, var(--text-color) 0) left bottom 25vh / 100vw 30vh fixed no-repeat,
            linear-gradient(to top, transparent 55%, var(--text-color) 0) left bottom 0vh / 100vw 100vh fixed no-repeat;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .reveal-button-wrapper {
          display: inline-block;
        }

        .reveal-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          background: #C9A84C;
          border: 2px solid #C9A84C;
          color: #080808;
          font-family: 'Syne', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.4s ease;
          border-radius: 40px;
        }

        .reveal-button:hover {
          background: transparent;
          color: #C9A84C;
          transform: translateY(-3px);
        }

        .reveal-button span {
          position: relative;
          z-index: 1;
        }

        .contact-section {
          height: 100vh;
          background: #000;
          color: var(--gold);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          position: relative;
          overflow: hidden;
        }
        
        .scroll-marquee {
          position: absolute;
          top: 35%;
          left: 0;
          transform: translateY(-50%);
          width: 100vw;
          overflow: hidden;
          z-index: 1;
        }
        
        .scroll-marquee-inner {
          display: flex;
          width: max-content; 
          will-change: transform;
        }
        
        .scroll-marquee-inner span {
          font-family: 'Syne', sans-serif;
          font-size: clamp(4.5rem, 12vw, 15rem);
          font-weight: 800;
          line-height: 1;
          padding-right: 40px;
          letter-spacing: -0.04em;
        }
        
        .contact-bottom {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .contact-cta-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 5% 60px;
        }
        
        .contact-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.4rem, 3vw, 2.2rem);
          font-style: italic;
          margin-bottom: 30px;
        }
        
        .massive-contact-btn {
          background: #282828;
          color: var(--gold);
          font-family: 'Syne', sans-serif;
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 25px 60px;
          border-radius: 100px;
          text-decoration: none;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .massive-contact-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }

        .contact-footer-bar {
          display: flex; 
          justify-content: space-between;
          padding: 30px 6%; 
          border-top: 1px solid rgba(0,0,0,0.1);
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem; 
          font-weight: 600; 
          letter-spacing: 0.1em;
        }

        .panels-scroll-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 15vh;
          background: linear-gradient(180deg, #000000 0%, transparent 100%);
          z-index: 20; 
          pointer-events: none;
        }

        @media (max-width: 1024px) {
          .fp-container { padding: 70px 30px; }
          .fp-grid { grid-template-columns: 1fr; gap: 0; }
          .fp-list { height: auto; border-left: none; border-top: 1px solid #C9A84C22; }
          .fp-list-item { min-height: 90px; }
          .fp-image-wrap { height: 400px; }
          .fp-float-num { display:none; }
          .text-reveal-wrapper { margin-top: 60px; padding: 40px 0 20px; }
        }

        @media (max-width: 900px) {
          .panels-track {
            flex-direction: column;
            width: 100vw;
            height: auto;
            transform: none !important; 
          }
          
          .service-panel {
            width: 100vw;
            height: auto;
            min-height: 100vh;
            flex-direction: column;
            border-left: none;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          
          .panel-left { 
            width: 100%; 
            height: 45vh; 
            min-height: 350px;
            margin-right: 0;
          }
          
          .panel-img-overlay { 
            background: linear-gradient(to top, #000 0%, transparent 60%);
            width: 100%;
            right: 0;
          }
          
          .panel-right {
            width: 100%;
            height: auto;
            padding: 50px 6% 80px;
            text-align: left;
            margin-left: 0;
          }
          
          .panel-id { 
            font-size: 4rem; 
            top: 20px; 
            left: 20px; 
          }
          
          .panel-desc { max-width: 100%; }
          .panel-stats { justify-content: flex-start; gap: 30px; }
          .panel-btn-solid { width: 100%; justify-content: center; }
          
          .contact-footer-bar { 
            flex-direction: column; 
            align-items: center; 
            gap: 15px; 
            text-align: center; 
          }
          
          .img-scale-wrapper {
            width: 100%;
            right: 0;
          }
          
          .text-reveal-wrapper { margin-top: 50px; padding: 30px 20px 20px; }
          .reveal-headline { font-size: 2rem; }
          .reveal-description { font-size: 1rem; }
        }
        
        @media (max-width: 600px) {
          .hero-inner { padding-bottom: 12vh; }
          .panel-btn-solid { padding: 18px 20px; font-size: 0.8rem; }
          .massive-contact-btn { padding: 20px 40px; }
          .fp-heading { font-size: 42px; }
          .text-reveal-wrapper { margin-top: 40px; padding: 20px 15px 15px; }
          .reveal-button { padding: 12px 28px; font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}