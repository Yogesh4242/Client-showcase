"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Projects() {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    document.body.style.backgroundColor = "#080706";
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.backgroundColor = "#080706";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflowX = "";
      document.documentElement.style.backgroundColor = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      projectRefs.current.forEach((ref, idx) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.5 && rect.bottom > 0) {
            setActiveIndex(idx);
          }
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToProject = (id: number) => {
    if (id === 1) router.push("/projects/project1");
    if (id === 2) router.push("/projects/project2");
    if (id === 3) router.push("/projects/project3");
    if (id === 4) router.push("/projects/project4");
  };

  const projects = [
    {
      id: 1,
      title: "The Terrace Garden",
      subtitle: "Residential",
      location: "Sowcarpet",
      name: "A Breathable Oasis",
      description:
        "Located in the dense urban fabric of Sowcarpet, this project required a careful balance between expansion and structural feasibility. Using lightweight construction methods, we enabled vertical growth without compromising stability. The terrace was transformed into a refined, functional landscape — creating a calm, usable space above the active commercial environment.",
      image: "/p1 preview.jpeg",
      reverse: false,
      year: "2024",
    },
    {
      id: 2,
      title: "NOVA (Villa)",
      subtitle: "Residential",
      location: "Chennai",
      name: "Modern Living",
      description:
        "Set on a challenging plot with irregular geometry, this project required a precise and adaptive design approach. Our team optimized the layout to resolve spatial constraints while maintaining comfort and usability. The 2-bedroom villa is aligned with Vastu principles and finished with a refined façade, delivering a balanced and premium living space.",
      image: "/image2.png",
      reverse: true,
      year: "2024",
    },
    {
      id: 3,
      title: "Canteen",
      subtitle: "Commercial / Healthcare",
      location: "Chennai",
      name: "Functional Design",
      description:
        "Executed within an active hospital environment, this project required careful coordination to ensure zero disruption to patients and medical staff. Our team managed material handling and on-site operations with precision, maintaining a smooth and controlled workflow throughout. By combining an underutilized storeroom and washroom, we developed a functional canteen space.",
      image: "/p3 preview.jpeg",
      reverse: false,
      year: "2023",
    },
    {
      id: 4,
      title: "Apache Residence",
      subtitle: "Residential",
      location: "Chennai",
      name: "Contemporary Comfort",
      description:
        "Defined by sharp lines and a neutral palette, Apache Residence is a masterclass in modern minimalism. The structural layout favors high ceilings and broad floorplates, allowing for a voluminous sense of space. Sustainable cooling techniques were integrated into the framework to ensure comfort throughout the seasons.",
      image: "/p4 preview.jpeg",
      reverse: true,
      year: "2023",
    },
  ];

  // New featured capabilities data
  const capabilities = [
    {
      title: "Spatial Intelligence",
      description: "Optimizing every square foot for life & function",
      icon: "✦",
    },
    {
      title: "Material Alchemy",
      description: "Where raw elements become refined expression",
      icon: "◈",
    },
    {
      title: "Light Geometry",
      description: "Sculpting spaces with natural illumination",
      icon: "◇",
    },
  ];

  return (
    <div className="root-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
          --gold: #c9a03d;
          --gold-light: #e2c06a;
          --gold-dim: rgba(201,160,61,0.18);
          --gold-faint: rgba(201,160,61,0.06);
          --bg: #080706;
          --surface: #0e0d0b;
          --surface-2: #141210;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(201,160,61,0.3);
          --text-primary: #f0ebe3;
          --text-secondary: #8a8279;
          --text-muted: #4a4740;
        }

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        /* ── KEYFRAMES ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(50px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes slideRight {
          from { transform:scaleX(0); } to { transform:scaleX(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -300% 0; }
          100% { background-position:  300% 0; }
        }
        @keyframes dotPulse {
          0%,100% { transform:scale(1); opacity:.4; }
          50%     { transform:scale(1.6); opacity:1; }
        }
        @keyframes countUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes borderGlow {
          0% { opacity: 0; transform: scaleX(0); }
          50% { opacity: 0.5; transform: scaleX(1); }
          100% { opacity: 0; transform: scaleX(0); }
        }

        /* ── ROOT ── */
        .root-container {
          width:100%;
          min-height:100vh;
          background: var(--bg);
          color: var(--text-primary);
          position:relative;
          overflow-x:hidden;
          font-family:'Outfit', sans-serif;
        }

        /* ── ARCHITECTURAL GRID OVERLAY ── */
        .arch-grid {
          position:fixed;
          inset:0;
          pointer-events:none;
          z-index:0;
          background-image:
            linear-gradient(rgba(201,160,61,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,160,61,0.025) 1px, transparent 1px);
          background-size: 80px 80px;
        }

        /* ── SIDE NAV ── */
        .side-nav {
          position:fixed;
          right:32px;
          top:50%;
          transform:translateY(-50%);
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:20px;
          z-index:100;
        }
        .side-nav-line {
          width:1px;
          height:40px;
          background: linear-gradient(to bottom, transparent, var(--gold-dim));
        }
        .side-nav-dot {
          width:6px;
          height:6px;
          border-radius:50%;
          border:1px solid var(--text-muted);
          transition: all 0.4s ease;
          cursor:pointer;
          position:relative;
        }
        .side-nav-dot.active {
          border-color: var(--gold);
          background: var(--gold);
          animation: dotPulse 2s ease infinite;
        }
        .side-nav-dot:hover { border-color: var(--gold); }
        @media(max-width:900px){ .side-nav { display:none; } }

        /* ── MAIN WRAPPER ── */
        .main-wrapper {
          width:100%;
          max-width:1750px;
          margin:0 auto;
          padding:0 6%;
          position:relative;
          z-index:2;
        }
        @media(max-width:768px){ .main-wrapper { padding:0 24px; } }

        /* ── HERO ── */
        .hero-section {
  min-height: 70vh; /* Reduced from 92vh */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 120px 0 40px; /* Reduced bottom padding significantly */
  position: relative;
}

/* ── PERMANENT BOLD NUMBERING ── */
.block-num-badge {
  font-size: 0.75rem;
  color: var(--gold); /* Always gold */
  letter-spacing: 0.18em;
  border: 1px solid var(--gold); /* Permanent border */
  padding: 4px 14px;
  border-radius: 4px; /* Squared off for a more architectural look */
  font-weight: 800; /* Bold */
  background: var(--gold-faint);
  transition: all 0.35s ease;
}

/* ── REMOVED BRACKETS & SIMPLIFIED IMAGE ── */
/* Delete .img-bracket and .img-bracket-br from your CSS */
.image-wrap {
  position: relative;
  min-height: 500px;
  overflow: hidden;
  cursor: pointer;
  background: #050504;
  border-bottom: 1px solid var(--border); /* Simple baseline instead */
}

/* ── UPDATED PROJECT GHOST NUMBER ── */
.project-ghost-num {
  position: absolute;
  top: -60px;
  left: -3%;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(120px, 18vw, 220px);
  font-weight: 700;
  color: transparent;
  -webkit-text-stroke: 1px rgba(201,160,61,0.12); /* Increased permanent visibility */
  line-height: 1;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

        /* Vertical rotating label */
        .hero-vertical-label {
          position:absolute;
          right:-20px;
          top:50%;
          transform:translateY(-50%) rotate(90deg);
          font-size:0.6rem;
          letter-spacing:0.35em;
          text-transform:uppercase;
          color: var(--text-muted);
          white-space:nowrap;
        }
        @media(max-width:768px){ .hero-vertical-label { display:none; } }

        .hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: var(--gold);
  margin-bottom: 40px; /* Space before the big "Where Vision" title */
  font-weight: 500;
}

.hero-eyebrow-line {
  width: 30px; /* Slightly shorter line for a cleaner look */
  height: 1px;
  background: var(--gold);
}

        .hero-title {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(3.4rem, 7.5vw, 6.8rem);
          font-weight:600;
          line-height:1.0;
          letter-spacing:-0.025em;
          margin-bottom:10px;
          color: var(--text-primary);
          animation: fadeUp 0.9s ease 0.15s forwards;
          opacity:0;
          animation-fill-mode:forwards;
        }
        .hero-title-italic {
          font-style:italic;
          font-weight:300;
          color: var(--gold-light);
          display:block;
        }

        .hero-desc {
          font-size:0.95rem;
          color: var(--text-secondary);
          line-height:1.85;
          max-width:480px;
          margin: 36px 0 0 0;
          animation: fadeUp 0.9s ease 0.3s forwards;
          opacity:0;
          animation-fill-mode:forwards;
          font-weight:300;
        }

        /* ── FEATURED CAPABILITIES SECTION (replaces stats) ── */
        .capabilities-section {
          margin-top: 80px;
          padding-top: 60px;
          border-top: 1px solid var(--border);
          animation: fadeUp 0.9s ease 0.45s forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .capabilities-grid {
          display: flex;
          gap: 40px;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .capability-card {
          flex: 1;
          min-width: 200px;
          padding: 28px 20px;
          background: var(--surface);
          border: 1px solid var(--border);
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);
          cursor: default;
        }
        .capability-card:hover {
          transform: translateY(-6px);
          border-color: var(--gold-dim);
          background: var(--surface-2);
        }
        .capability-icon {
          font-size: 2rem;
          margin-bottom: 24px;
          display: inline-block;
          color: var(--gold);
          opacity: 0.7;
          transition: all 0.3s ease;
        }
        .capability-card:hover .capability-icon {
          opacity: 1;
          transform: scale(1.05);
        }
        .capability-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .capability-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          font-weight: 300;
        }
        @media (max-width: 768px) {
          .capabilities-grid { gap: 20px; }
          .capability-card { min-width: 100%; }
        }

        /* ── PROJECTS SECTION ── */
        .projects-section {
          padding: 80px 0 100px;
        }

        /* ── PROJECT BLOCK ── */
        .project-block {
          margin-bottom:130px;
          position:relative;
        }

        /* Giant ghost number behind each block */
        .project-ghost-num {
          position:absolute;
          top:-60px;
          left:-3%;
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(120px, 18vw, 220px);
          font-weight:700;
          color:transparent;
          -webkit-text-stroke:1px rgba(201,160,61,0.055);
          line-height:1;
          pointer-events:none;
          user-select:none;
          transition: -webkit-text-stroke-color 0.5s ease;
          z-index:0;
        }
        .project-block:hover .project-ghost-num {
          -webkit-text-stroke-color: rgba(201,160,61,0.11);
        }

        /* Block header */
        .block-header {
          display:flex;
          justify-content:space-between;
          align-items:flex-end;
          margin-bottom:28px;
          position:relative;
          z-index:2;
        }
        .block-header-left {
          display:flex;
          align-items:baseline;
          gap:22px;
        }
        .block-num-badge {
          font-size:0.62rem;
          color: var(--text-muted);
          letter-spacing:0.18em;
          border:1px solid var(--text-muted);
          padding:4px 12px;
          border-radius:20px;
          transition: all 0.35s ease;
          font-weight:500;
        }
        .project-block:hover .block-num-badge {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-faint);
        }
        .block-title {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(1.6rem, 3vw, 2.4rem);
          font-weight:600;
          color: var(--text-primary);
          letter-spacing:-0.02em;
          transition: transform 0.35s ease;
        }
        .project-block:hover .block-title { transform:translateX(6px); }
        .block-category {
          font-size:0.6rem;
          color: var(--text-muted);
          letter-spacing:0.25em;
          text-transform:uppercase;
          font-weight:500;
          transition: color 0.35s ease;
        }
        .project-block:hover .block-category { color: var(--text-secondary); }

        /* Divider line with travel animation - REMOVED HOVER EFFECT */
        .block-divider {
          height:1px;
          background: var(--border);
          margin-bottom:32px;
          position:relative;
          overflow:hidden;
          z-index:2;
        }
        /* The hover gold line animation below the title is completely removed */

        /* ── CARD ── */
        .project-card {
          display:grid;
          grid-template-columns:1.35fr 1fr;
          background: var(--surface);
          border:1px solid var(--border);
          overflow:hidden;
          transition: all 0.55s cubic-bezier(0.2, 0.8, 0.3, 1);
          position:relative;
          z-index:2;
        }
        .project-card.reverse {
          grid-template-columns:1fr 1.35fr;
        }
        .project-card:hover {
          transform:translateY(-8px);
          border-color: rgba(201,160,61,0.2);
          box-shadow:
            0 30px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(201,160,61,0.08),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }
        @media(max-width:900px){
          .project-card, .project-card.reverse { grid-template-columns:1fr; }
        }

        /* ── IMAGE AREA ── */
        .image-wrap {
          position:relative;
          min-height:500px;
          overflow:hidden;
          cursor:pointer;
          background: #050504;
        }
        .project-card.reverse .image-wrap { order:2; }
        @media(max-width:900px){
          .project-card.reverse .image-wrap { order:0; }
          .image-wrap { min-height:360px; }
        }

        .image-wrap img {
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transition: transform 1s cubic-bezier(0.2, 0.8, 0.3, 1);
        }
        .project-card:hover .image-wrap img { transform:scale(1.07); }

        /* Corner accent bracket */
        .img-bracket {
          position:absolute;
          top:20px;
          left:20px;
          width:32px;
          height:32px;
          border-top:2px solid var(--gold);
          border-left:2px solid var(--gold);
          opacity:0;
          transition: all 0.4s ease 0.1s;
        }
        .img-bracket-br {
          position:absolute;
          bottom:20px;
          right:20px;
          width:32px;
          height:32px;
          border-bottom:2px solid var(--gold);
          border-right:2px solid var(--gold);
          opacity:0;
          transition: all 0.4s ease 0.1s;
        }
        .project-card:hover .img-bracket,
        .project-card:hover .img-bracket-br {
          opacity:1;
          top:16px; left:16px;
        }
        .project-card:hover .img-bracket-br {
          bottom:16px; right:16px;
        }

        /* Year stamp */
        .img-year {
          position:absolute;
          top:20px;
          right:20px;
          font-size:0.6rem;
          letter-spacing:0.2em;
          color:rgba(255,255,255,0.4);
          text-transform:uppercase;
          font-weight:600;
          background:rgba(0,0,0,0.5);
          padding:5px 10px;
          border:1px solid rgba(255,255,255,0.08);
        }

        /* Gradient overlay */
        .img-overlay {
          position:absolute;
          inset:0;
          background:linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 45%, transparent 100%);
          transition: all 0.5s ease;
        }
        .project-card:hover .img-overlay {
          background:linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.04) 45%, transparent 100%);
        }

        /* View button */
        .view-btn {
          position:absolute;
          bottom:28px;
          left:28px;
          display:inline-flex;
          align-items:center;
          gap:10px;
          padding:10px 22px;
          background:rgba(8,7,6,0.88);
          border:1px solid rgba(201,160,61,0.5);
          color: var(--gold);
          font-size:0.62rem;
          text-transform:uppercase;
          letter-spacing:0.15em;
          cursor:pointer;
          font-weight:600;
          font-family:'Outfit', sans-serif;
          transform:translateY(20px);
          opacity:0;
          transition: all 0.4s ease;
        }
        .project-card:hover .view-btn {
          transform:translateY(0);
          opacity:1;
        }
        .view-btn:hover {
          background: var(--gold);
          color:#000;
          letter-spacing:0.2em;
        }
        .view-btn-arrow {
          transition: transform 0.3s ease;
        }
        .view-btn:hover .view-btn-arrow { transform:translateX(4px); }

        /* ── INFO AREA ── */
        .info-area {
          padding:52px 48px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          background: var(--surface);
          position:relative;
          overflow:hidden;
          transition: background 0.4s ease;
        }
        .project-card:hover .info-area { background: var(--surface-2); }

        /* Vertical gold accent bar that reveals on hover */
        .info-accent-bar {
          position:absolute;
          left:0;
          top:15%;
          width:2px;
          height:0%;
          background: linear-gradient(to bottom, transparent, var(--gold), transparent);
          transition: height 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        .project-card:hover .info-accent-bar { height:70%; }

        /* Location row */
        .info-location {
          display:flex;
          align-items:center;
          gap:10px;
          font-size:0.62rem;
          color: var(--text-muted);
          text-transform:uppercase;
          letter-spacing:0.2em;
          margin-bottom:22px;
          font-weight:600;
        }
        .loc-diamond {
          width:5px;
          height:5px;
          background: var(--gold);
          transform:rotate(45deg);
          flex-shrink:0;
          transition: transform 0.4s ease;
        }
        .project-card:hover .loc-diamond { transform:rotate(225deg); }

        /* Project name */
        .info-name {
          font-family:'Cormorant Garamond', serif;
          font-size:clamp(1.7rem, 2.5vw, 2.5rem);
          font-weight:600;
          color: var(--text-primary);
          line-height:1.15;
          letter-spacing:-0.02em;
          margin-bottom:24px;
          transition: transform 0.35s ease;
        }
        .project-card:hover .info-name { transform:translateX(6px); }

        /* Thin gold rule below name */
        .info-name-rule {
          width:40px;
          height:1px;
          background: var(--gold);
          margin-bottom:24px;
          transition: none;
        }

        .info-desc {
          font-size:0.88rem;
          line-height:1.85;
          color: var(--text-secondary);
          margin-bottom:36px;
          font-weight:300;
        }

        /* Explore button */
        .explore-btn {
          display:inline-flex;
          align-items:center;
          gap:14px;
          background:transparent;
          border:none;
          color: var(--gold);
          font-size:0.62rem;
          text-transform:uppercase;
          letter-spacing:0.2em;
          cursor:pointer;
          padding:0;
          font-family:'Outfit', sans-serif;
          font-weight:600;
          transition: all 0.4s ease;
          width:fit-content;
          position:relative;
        }
        .explore-btn::after {
          content:'';
          position:absolute;
          bottom:-4px;
          left:0;
          width:0%;
          height:1px;
          background: var(--gold);
          transition: width 0.4s ease;
        }
        .explore-btn:hover::after { width:100%; }
        .explore-btn:hover { gap:20px; letter-spacing:0.25em; }

        .explore-arrow {
          width:28px;
          height:1px;
          background: var(--gold);
          position:relative;
          transition: width 0.4s ease;
        }
        .explore-arrow::after {
          content:'';
          position:absolute;
          right:0;
          top:-3px;
          width:6px;
          height:6px;
          border-top:1px solid var(--gold);
          border-right:1px solid var(--gold);
          transform:rotate(45deg);
        }
        .explore-btn:hover .explore-arrow { width:42px; }

        @media(max-width:600px){
          .info-area { padding:36px 28px; }
          .info-name { font-size:1.7rem; }
        }

        /* ── BOTTOM SIGNATURE (replaces bottom band) ── */
        .bottom-signature {
          margin-top: 80px;
          padding: 40px 0 60px;
          text-align: center;
          border-top: 1px solid var(--border);
        }
        .signature-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: 24px;
          letter-spacing: -0.01em;
        }
        .signature-mark {
          font-size: 0.7rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 16px;
        }
        .signature-mark-line {
          width: 30px;
          height: 1px;
          background: var(--gold-dim);
        }
      `}</style>

      {/* Architectural grid */}
      <div className="arch-grid" />

      {/* Side navigation dots */}
      <nav className="side-nav">
        <div className="side-nav-line" />
        {projects.map((p, i) => (
          <div
            key={p.id}
            className={`side-nav-dot ${activeIndex === i ? "active" : ""}`}
            onClick={() => projectRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            title={p.title}
          />
        ))}
        <div className="side-nav-line" style={{ transform: "scaleY(-1)" }} />
      </nav>

      {/* ── HERO ── */}
      <div className="main-wrapper">
        <section className="hero-section">
  <div className="hero-ghost-text" aria-hidden="true">PORTFOLIO</div>
  <div className="hero-eyebrow">
    <div className="hero-eyebrow-line" />
    Est. 2026 &nbsp;·&nbsp; Chennai, India
  </div>

  <h1 className="hero-title">
    Where Vision
    <span className="hero-title-italic">Meets Craft</span>
  </h1>

  <p className="hero-desc">
    Transforming spaces into timeless expressions of design,
    functionality, and innovation.
  </p>
</section>
      </div>

      {/* ── PROJECTS ── */}
      <div className="projects-section">
        <div className="main-wrapper">
          {/* Project blocks */}
          {projects.map((project, idx) => (
            <div
              key={project.id}
              className="project-block"
              ref={(el) => { projectRefs.current[idx] = el; }}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Ghost number */}
              <div className="project-ghost-num" aria-hidden="true">
                {String(project.id).padStart(2, "0")}
              </div>

              {/* Block header */}
              <div className="block-header">
                <div className="block-header-left">
                  <span className="block-num-badge">
                    {String(project.id).padStart(2, "0")}
                  </span>
                  <h2 className="block-title">{project.title}</h2>
                </div>
                <span className="block-category">{project.subtitle}</span>
              </div>

              {/* Static divider - no hover animation */}
              <div className="block-divider" />

              {/* Card */}
              <div className={`project-card ${project.reverse ? "reverse" : ""}`}>
                {/* Image */}
                <div
  className="image-wrap"
  onClick={() => goToProject(project.id)}
>
  <img src={project.image} alt={project.title} />
  <div className="img-overlay" />
  {/* Brackets removed from here */}
  <div className="img-year">{project.year}</div>
  <button className="view-btn">
    View Project
    <span className="view-btn-arrow">→</span>
  </button>
</div>

                {/* Info */}
                <div className="info-area">
                  <div className="info-accent-bar" />

                  <div className="info-location">
                    <span className="loc-diamond" />
                    {project.id.toString().padStart(2, "0")} — {project.location}
                  </div>

                  <h3 className="info-name">{project.name}</h3>
                  <div className="info-name-rule" />

                  <p className="info-desc">{project.description}</p>

                  <button
                    className="explore-btn"
                    onClick={() => goToProject(project.id)}
                  >
                    Explore Project
                    <span className="explore-arrow" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* New Bottom Signature (replaces bottom band) */}
          <div className="bottom-signature">
            <div className="signature-quote">
              “ Architecture begins where engineering ends. ”
            </div>
            <div className="signature-mark">
              <span className="signature-mark-line" />
              Chennai — India
              <span className="signature-mark-line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}