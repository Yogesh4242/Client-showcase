"use client";

import { useRouter } from "next/navigation";

export default function Projects() {
  const router = useRouter();

  const goToProject = (id: number) => {
    if (id === 1) router.push("/projects/project1");
    if (id === 2) router.push("/projects/project2");
    if (id === 3) router.push("/projects/project3");
    if (id === 4) router.push("/projects/project4");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Manrope:wght@300;400;500&family=Marcellus&display=swap');

        :root {
          --gold:        #d4af37;
          --gold-muted:  #8c7322;
          --bg:          #070707;
          --bg-surface:  #0f0f0f;
          --border:      rgba(212, 175, 55, 0.2);
          --text-main:   #f5f5f5;
          --text-muted:  #a1a1aa;
        }

        *{
          box-sizing:border-box;
          margin:0;
          padding:0;
        }

        body{
          background: var(--bg);
          color: var(--text-main);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden; /* Prevent horizontal scrolling on mobile */
        }

        /* ─── TYPOGRAPHY ─── */
        h2, h3, .brand-font {
          font-family: 'Marcellus', serif;
          font-weight: 400; 
        }

        p, span, a, button {
          font-family: 'Manrope', sans-serif;
        }

        /* ─── HERO ─── */
        .hero{
          padding: 140px 20px 80px;
          max-width: 1000px;
          margin: auto;
          text-align: center;
        }

        .hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.2rem, 8vw, 4.5rem); 
          font-weight: 700; 
          line-height: 1.1;
          letter-spacing: -0.02em;
          background: linear-gradient(45deg, #c59b48 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #8c6014 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0px 8px 16px rgba(197, 155, 72, 0.25));
        }

        /* ─── CATEGORY & SECTION ─── */
        .services-category{
          max-width: 1500px;
          margin: auto;
          padding: 60px 20px 20px; /* Reduced bottom padding */
        }

        .services-category-title {
          font-family: 'Marcellus', serif;
          font-size: clamp(2rem, 8vw, 4rem); /* Adjusted for better mobile scaling */
          color: transparent;
          -webkit-text-stroke: 1px var(--gold-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.5s ease, text-shadow 0.5s ease, -webkit-text-stroke 0.5s ease;
          cursor: default;
        }

        .services-category-title:hover {
          color: var(--gold);
          -webkit-text-stroke: 1px var(--gold);
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        .section{
          max-width: 1200px;
          margin: auto;
          padding: 40px 20px; /* Adjusted padding for mobile */
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-bottom: 1px solid var(--border);
          padding-bottom: 20px;
          margin-bottom: 30px; /* Reduced margin */
          flex-wrap: wrap; /* Ensure text wraps if needed */
          gap: 10px;
        }

        .section-title{
          font-size: clamp(1.3rem, 5vw, 2rem); /* Slightly smaller base for mobile */
          color: var(--gold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-right: 15px;
        }

        .section-subtitle {
          color: var(--text-muted);
          font-size: clamp(0.75rem, 3vw, 0.85rem);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        /* ─── GRID ─── */
        .project-row{
          display: grid;
          gap: 0; 
        }

        @media(min-width:900px){
          .project-row{
            grid-template-columns: 1.5fr 1fr;
            border: 1px solid var(--border);
          }
          .reverse{
            grid-template-columns: 1fr 1.5fr;
          }
          .project-row > div:first-child {
            border-right: 1px solid var(--border);
          }
        }

        /* ─── CARD & HOVER EFFECTS ─── */
        .project-card{
          width: 100%;
          height: 100%; 
          min-height: 300px; /* Slightly lower min-height for mobile */
          position: relative;
          cursor: pointer;
          overflow: hidden;
          background: #000;
          display: flex; 
        }

        .project-card img{
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), filter 0.6s ease;
          opacity: 1; 
          filter: blur(0px) brightness(1); 
        }

        .project-card:hover img{
          transform: scale(1.05);
          filter: blur(8px) brightness(0.6); 
        }

        /* View in 3D Overlay Pill */
        .view-3d {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          opacity: 0;
          transform: translateY(15px);
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none; 
        }

        .view-3d span {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid rgba(212, 175, 55, 0.5);
          color: var(--text-main);
          padding: 10px 24px; /* Slightly smaller padding for mobile */
          border-radius: 40px;
          font-family: 'Manrope', sans-serif;
          font-size: 0.75rem; /* Slightly smaller font */
          letter-spacing: 0.2em;
          text-transform: uppercase;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .project-card:hover .view-3d {
          opacity: 1;
          transform: translateY(0);
        }

        .overlay{
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 30px 20px; /* Adjusted padding for mobile */
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%);
          z-index: 1;
        }

        .overlay h3{
          font-size: clamp(1.5rem, 5vw, 2rem);
          color: var(--text-main);
          transform: translateY(10px);
          transition: transform 0.4s ease;
        }

        .project-card:hover .overlay h3 {
          transform: translateY(0);
          color: var(--gold);
        }

        /* ─── INFO CARD ─── */
        .info-card{
          background: var(--bg-surface);
          padding: 40px 25px; /* Adjusted padding for mobile */
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
        }

        .info-number {
          font-size: 0.8rem;
          color: var(--gold-muted);
          margin-bottom: 15px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .info-title{
          font-size: clamp(1.5rem, 5vw, 1.8rem);
          margin-bottom: 15px;
          color: var(--text-main);
        }

        .info-text{
          font-size: 0.9rem; /* Slightly smaller text for better readability on narrow screens */
          font-weight: 300;
          line-height: 1.7;
          color: var(--text-muted);
        }

        /* ─── MOBILE ONLY ADJUSTMENTS ─── */
        @media(max-width:899px){
          .project-row{
            grid-template-columns: 1fr;
            border: 1px solid var(--border);
            margin-bottom: 30px;
          }
          /* Ensure images are above text on mobile for non-reversed rows */
          .project-row > .project-card {
            order: -1;
          }
          .project-row > div:first-child {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .hero { padding: 100px 20px 50px; }
          
          .hero h1 {
            line-height: 1.2; 
            filter: drop-shadow(0px 4px 8px rgba(197, 155, 72, 0.35));
          }
        }
      `}</style>

      <div>
        <section className="hero">
          <h1>
            Building the future with innovative infrastructure solutions.
          </h1>
        </section>

        {/* <section className="services-category">
          <div className="section-header">
            <h2 className="services-category-title">Projects - Infrastructure</h2>
          </div>
        </section> */}

        {/* SECTION 1 - Terrace Landscape */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Terrace Landscape</h2>
            <span className="section-subtitle">Residential</span>
          </div>

          <div className="project-row">
            <div
              className="project-card"
              onClick={() => goToProject(1)}
            >
              <img src="/p1 preview.jpeg" alt="Terrace Landscape"/>
              <div className="view-3d">
                <span>View in 3D</span>
              </div>
              <div className="overlay">
                <h3>Terrace Landscape</h3>
              </div>
            </div>

            <div className="info-card">
              <span className="info-number">01 // Sowcarpet</span>
              <h3 className="info-title">A Breathable Oasis</h3>
              <p className="info-text">
                Navigating the dense, highly congested streets of Sowcarpet presented a unique 
                logistical challenge for the SKS team. Our client, a busy garment businessman, 
                desperately needed a tranquil escape from the relentless pace of his daily life. 
                By strategically lifting materials and maximizing the structural layout of the 
                existing building, we bypassed the neighborhood's spatial limits. We transformed 
                a bare rooftop into a lush, private oasis—giving the client a serene, 
                breathable sanctuary right in his own home.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2 - NOVA (Villa) */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">NOVA (Villa)</h2>
            <span className="section-subtitle">Residential</span>
          </div>

          <div className="project-row reverse">
            <div className="info-card">
              <span className="info-number">02 // [Location To Be Filled]</span>
              <h3 className="info-title">Modern Living</h3>
              <p className="info-text">
                [Description to be filled...]
              </p>
            </div>

            <div
              className="project-card"
              onClick={() => goToProject(2)}
            >
              <img src="/image2.png" alt="NOVA Villa"/>
              <div className="view-3d">
                <span>View in 3D</span>
              </div>
              <div className="overlay">
                <h3>NOVA (Villa)</h3>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 - Canteen */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Canteen</h2>
            <span className="section-subtitle">Commercial / Healthcare</span>
          </div>

          <div className="project-row">
            <div
              className="project-card"
              onClick={() => goToProject(3)}
            >
              <img src="/p3 preview.jpeg" alt="Hospital Canteen"/>
              <div className="view-3d">
                <span>View in 3D</span>
              </div>
              <div className="overlay">
                <h3>Canteen</h3>
              </div>
            </div>

            <div className="info-card">
              <span className="info-number">03 // Hospital, [Locality To Be Filled]</span>
              <h3 className="info-title">Functional Design</h3>
              <p className="info-text">
                [Description to be filled...]
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 - Apache Residence */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Apache Residence</h2>
            <span className="section-subtitle">Residential</span>
          </div>

          <div className="project-row reverse">
            <div className="info-card">
              <span className="info-number">04 // [Location To Be Filled]</span>
              <h3 className="info-title">Contemporary Comfort</h3>
              <p className="info-text">
                [Description to be filled...]
              </p>
            </div>

            <div
              className="project-card"
              onClick={() => goToProject(4)}
            >
              <img src="/p4 preview.jpeg" alt="Apache Residence"/>
              <div className="view-3d">
                <span>View in 3D</span>
              </div>
              <div className="overlay">
                <h3>Apache Residence</h3>
              </div>
            </div>
          </div>
        </section>

        <Footer/>
      </div>
    </>
  );
}

function Footer(){
  return(
    <footer style={{
      borderTop:"1px solid var(--border)",
      padding:"30px 20px", /* Adjusted for mobile */
      marginTop:"40px", /* Adjusted for mobile */
      display:"flex",
      justifyContent:"space-between",
      alignItems: "center",
      flexWrap:"wrap",
      gap:"15px",
      maxWidth: "1400px",
      margin: "40px auto 0" /* Adjusted for mobile */
    }}>

      <span style={{
        fontSize:".75rem", /* Slightly smaller for mobile */
        color:"var(--text-muted)",
        fontFamily:"'Manrope', sans-serif",
        letterSpacing: ".05em"
      }}>
        © 2024 — All Rights Reserved
      </span>

      <span style={{
        fontFamily:"'Marcellus', serif",
        fontSize: "1rem", /* Slightly smaller for mobile */
        color:"var(--gold)",
        letterSpacing: ".05em"
      }}>
        Infrastructure  <span style={{color: "var(--text-muted)"}}>/</span>  Construction
      </span>

    </footer>
  )
}