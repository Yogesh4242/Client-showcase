
//change open and close animation of hamburger menu in mobile like a circular open like it was before not a fade in like it is now 


"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

// Plus Jakarta Sans offers a very premium, modern, and clean aesthetic
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const links = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const runCycle = (isPhoneCycle: boolean) => {
      setShowPhone(isPhoneCycle);
      timeoutId = setTimeout(() => runCycle(!isPhoneCycle), isPhoneCycle ? 8000 : 4000);
    };

    timeoutId = setTimeout(() => runCycle(false), 8000);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const handleLinkClick = () => setIsMobileMenuOpen(false);

  // Scaled down, refined logo
  const BrandLogo = ({ isMobile = false }) => (
    <Link href="/" className={`brand-logo ${isMobile ? "mobile-logo" : ""}`}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="84" height="28">
         <defs>
<linearGradient id="sSheen" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#FFFFFF" />
  <stop offset="50%" stopColor="#FFFFFF" />
  <stop offset="100%" stopColor="#FFFFFF" />
</linearGradient>
         </defs>
         <text 
           x="125" 
           y="76" 
          fontFamily="'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', serif" 
          fontSize="85" 
          fontWeight="500" 
          letterSpacing="4"
          textAnchor="middle" 
           fill="url(#sSheen)"
         >
           SKS
         </text>
       </svg>
    </Link>
  );

  return (
    <div className={`navbar-container ${plusJakarta.className}`}>
      
      {/* --- DESKTOP NAV PILL --- */}
      <nav className="navbar-wrapper desktop-only">
        
        <BrandLogo />

        <ul className="navbar-track">
          {links.map(({ label, href }) => {
            const isActive = pathname === href;

            return (
              <li key={label}>
                <Link
                  href={href}
                  className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Refined, smaller CTA Pill */}
        <div className="cta-wrapper">
          <div className="cta-inner">
            <a 
              href="tel:+918190923665" 
              className={`cta-text ${showPhone ? "visible" : "hidden-up"}`}
            >
              +91 81909 23665
            </a>
            <a 
              href="mailto:contact.sksgroups.net" 
              className={`cta-text ${!showPhone ? "visible" : "hidden-down"}`}
            >
              contact.sksgroups.net
            </a>
          </div>
        </div>
      </nav>

      {/* --- MOBILE LOGO & TOGGLE --- */}
      <BrandLogo isMobile={true} />

      <button
  className={`mobile-toggle ${
    isMobileMenuOpen ? 'mobile-toggle--open' : ''
  }`}
  onClick={toggleMenu}
  aria-label="Toggle Menu"
>
  <div className="hamburger-lines">
    <span
      className={`line line-1 ${
        isMobileMenuOpen ? 'open' : ''
      }`}
    />

    <span
      className={`line line-2 ${
        isMobileMenuOpen ? 'open' : ''
      }`}
    />

    <span
      className={`line line-3 ${
        isMobileMenuOpen ? 'open' : ''
      }`}
    />
  </div>
</button>

      {/* --- MOBILE OVERLAY --- */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? "mobile-overlay--open" : ""}`}>
        <ul className="mobile-menu-track">
          {links.map(({ label, href }, index) => {
            const isActive = pathname === href;
            
            return (
              <li key={label} style={{ "--delay": `${index * 0.06}s` } as React.CSSProperties}>
                <Link
                  href={href}
                  onClick={handleLinkClick}
                  className={`mobile-nav-item ${isActive ? "mobile-nav-item--active" : ""}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          
          <li style={{ "--delay": `${links.length * 0.06}s` } as React.CSSProperties} className="mobile-cta-container">
             <div className="cta-wrapper cta-wrapper--mobile">
              <div className="cta-inner">
                <a href="tel:+918190923665" className={`cta-text ${showPhone ? "visible" : "hidden-up"}`}>
                  +91 81909 23665
                </a>
                <a href="mailto:contact.sksgroups.net" className={`cta-text ${!showPhone ? "visible" : "hidden-down"}`}>
                  contact.sksgroups.net
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <style>{`
        /* Container Setup */
        .navbar-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: center;
          padding-top: 28px;
          pointer-events: none; 
        }

        /* Classy, Slightly Thinner Pill */
        .navbar-wrapper {
          pointer-events: auto; 
          display: inline-flex;
          align-items: center;
          background: rgba(10, 10, 10, 0.98); /* Premium deep dark gray/black */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 999px; 
          padding: 5px; /* Thinner padding */
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3); /* Softer shadow */
        }

        /* Spaced Text Logo */
        .brand-logo {
           display: flex;
           align-items: center;
           gap: 10px;
           color: #FFFFFF;
           text-decoration: none;
           font-weight: 600;
           letter-spacing: 0.04em;
           padding-left: 7px;
           padding-right: px;
           padding-top: 2px;
           font-size: 15px;
           border-right: 1px solid rgba(168, 131, 90, 0.2);
           margin-right: 8px;
         }

        /* Center Nav Links */
        .navbar-track {
          display: flex;
          align-items: center;
          gap: 4px; 
          list-style: none;
          margin: 0 16px 0 0; 
          padding: 0;
        }

        /* Modern, Slightly Smaller Typography */
        .nav-item {
          font-size: 12.5px; /* Scaled down */
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55); 
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.25s ease;
          white-space: nowrap;
          display: block;
          letter-spacing: 0.01em;
        }

        .nav-item:hover {
          color: #FFFFFF;
        }

        /* Clean, Crisp Active State */
        .nav-item--active {
          color: #0A0A0A !important;
          background: #FFFFFF;
          font-weight: 600;
        }

        /* CTA Button Pill */
        .cta-wrapper {
          width: 190px; /* Slightly narrower */
          height: 40px; /* Thinner button */
          background: #FFFFFF; 
          border-radius: 999px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .cta-inner {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Classy CTA Text */
        .cta-text {
          position: absolute;
          font-size: 12.5px;
          font-weight: 600;
          color: #0A0A0A; 
          text-decoration: none;
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        /* Sliding Animation Classes */
        .cta-text.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .cta-text.hidden-up { opacity: 0; transform: translateY(-20px); pointer-events: none; }
        .cta-text.hidden-down { opacity: 0; transform: translateY(20px); pointer-events: none; }

        /* --- MOBILE STYLES --- */
        .mobile-toggle, .mobile-overlay, .mobile-logo {
          display: none; 
        }

        @media (max-width: 1024px) {
          .desktop-only { display: none; }
          
          .mobile-logo {
            display: flex;
            pointer-events: auto;
            position: fixed;
            top: 24px;
            left: 20px;
            z-index: 1002;
            padding: 0; 
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
          }

          .mobile-toggle {
             display: flex;
             pointer-events: auto;
             position: fixed;
             top: 20px;
             right: 20px;
             width: 50px;
             height: 50px;
             align-items: center;
             justify-content: center;
             background: #2c1a0a;
             border: 1px solid rgba(168, 131, 90, 0.3);
             border-radius: 50%;
             color: #e8ddd0;
             cursor: pointer;
             box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
             transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
             z-index: 1002; 
           }

.mobile-toggle:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(18, 18, 18, 0.88);
}

.mobile-toggle:active {
  transform: scale(0.96);
}

.mobile-toggle--open {
  background: rgba(18, 18, 18, 0.92);
}

.hamburger-lines {
  width: 20px;
  height: 14px;
  position: relative;
}

.line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1.8px;
  border-radius: 999px;
  background: #ffffff;
  transform-origin: center;
  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease,
    width 0.3s ease;
}

/* Initial Positions */
.line-1 {
  top: 0;
}

.line-2 {
  top: 6px;
  width: 100%;
  right: 0;
  left: auto;
}

.line-3 {
  bottom: 0;
}

/* Open Animation */
.line-1.open {
  top: 6px;
  transform: rotate(45deg);
}

.line-2.open {
  opacity: 0;
  transform: translateX(6px);
}

.line-3.open {
  bottom: 6px;
  transform: rotate(-45deg);
}


          .mobile-overlay {
            display: flex;
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0A0A0A; 
            z-index: 1001;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.4s ease;
          }

          .mobile-overlay--open {
            pointer-events: auto;
            opacity: 1;
          }

          .mobile-menu-track {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 28px;
            text-align: center;
          }

          .mobile-cta-container {
            margin-top: 36px;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.4s ease, transform 0.4s ease;
          }

          .mobile-overlay--open .mobile-cta-container {
             opacity: 1;
             transform: translateY(0);
             transition-delay: calc(0.1s + var(--delay)); 
          }

          .cta-wrapper--mobile {
            width: 220px;
            height: 48px;
          }
          
          .cta-wrapper--mobile .cta-text {
            font-size: 14px;
          }

          .mobile-nav-item {
            display: inline-block;
            font-size: 28px; 
            font-weight: 500;
            color: rgba(255, 255, 255, 0.4);
            text-decoration: none;
            padding: 8px 20px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .mobile-overlay--open .mobile-nav-item {
            opacity: 1;
            transform: translateY(0);
            transition-delay: calc(0.1s + var(--delay)); 
          }

          .mobile-nav-item--active {
            color: #FFFFFF;
          }
        }
      `}</style>
    </div>
  );
} 

















// "use client";

// import { useState, useEffect } from "react";
// import { usePathname } from "next/navigation";
// import Link from "next/link";
// import { DM_Sans } from "next/font/google";

// const dmSans = DM_Sans({
//   subsets: ["latin"],
//   weight: ["400", "500", "600"],
// });

// const links = [
//   { label: "Home",     href: "/" },
//   { label: "Projects", href: "/projects" },
//   { label: "Services", href: "/services" },
//   { label: "Contact",  href: "/contact" },
// ];

// export default function Navbar() {
//   const pathname = usePathname();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [showPhone, setShowPhone] = useState(true);

//   // The 10s / 5s timing loop for the flipping CTA
//   useEffect(() => {
//     let timeoutId: NodeJS.Timeout;
    
//     const runCycle = (isPhoneCycle: boolean) => {
//       setShowPhone(isPhoneCycle);
//       if (isPhoneCycle) {
//         timeoutId = setTimeout(() => runCycle(false), 10000);
//       } else {
//         timeoutId = setTimeout(() => runCycle(true), 5000);
//       }
//     };

//     timeoutId = setTimeout(() => runCycle(false), 10000);

//     return () => clearTimeout(timeoutId);
//   }, []);

//   const toggleMenu = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//   };

//   const handleLinkClick = (href: string) => {
//     setIsMobileMenuOpen(false);
//   };

//   // Reusable Logo Component with your updated "SKS" SVG
//   const BrandLogo = ({ isMobile = false }) => (
//     <Link href="/" className={`brand-logo ${isMobile ? "mobile-logo" : ""}`}>
//       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100" width="84" height="28">
//         <defs>
//           <linearGradient id="sSheen" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#D3C7B9" />
//             <stop offset="50%" stopColor="#B2A392" />
//             <stop offset="100%" stopColor="#CBBDB0" />
//           </linearGradient>
//         </defs>
//         <text 
//           x="150" 
//           y="76" 
//           fontFamily="'Playfair Display', 'Didot', 'Bodoni MT', 'Times New Roman', serif" 
//           fontSize="85" 
//           fontWeight="400" 
//           letterSpacing="4"
//           textAnchor="middle" 
//           fill="url(#sSheen)"
//         >
//           SKS
//         </text>
//       </svg>
//       {/* Shortened to just "GROUPS" so it doesn't repeat SKS */}
//       {/* <span>GROUPS</span> */}
//     </Link>
//   );

//   return (
//     <div className={`navbar-container ${dmSans.className}`}>
      
//       {/* --- DESKTOP NAV PILL (Hidden on Mobile) --- */}
//       <nav className="navbar-wrapper desktop-only">
        
//         <BrandLogo />

//         <ul className="navbar-track">
//           {links.map(({ label, href }) => {
//             const isActive = pathname === href;

//             return (
//               <li key={label}>
//                 <Link
//                   href={href}
//                   className={`nav-item ${isActive ? "nav-item--active" : ""}`}
//                 >
//                   {label}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>

//         {/* The Flipping CTA Button */}
//         <div className="cta-flipper">
//           <div className={`cta-inner ${showPhone ? "" : "flipped"}`}>
//             <a href="tel:+918190923665" className="cta-face cta-front">
//               +91 81909 23665
//             </a>
//             <a href="mailto:info@sksgroups.com" className="cta-face cta-back">
//               contact.sksgroups.net
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* --- MOBILE LOGO --- */}
//       <BrandLogo isMobile={true} />

//       {/* --- MOBILE FLOATING BUTTON --- */}
//       <button 
//         className={`mobile-toggle ${isMobileMenuOpen ? "mobile-toggle--open" : ""}`} 
//         onClick={toggleMenu}
//       >
//         {isMobileMenuOpen ? (
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <line x1="18" y1="6" x2="6" y2="18"></line>
//             <line x1="6" y1="6" x2="18" y2="18"></line>
//           </svg>
//         ) : (
//           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//             <line x1="3" y1="12" x2="21" y2="12"></line>
//             <line x1="3" y1="6" x2="21" y2="6"></line>
//             <line x1="3" y1="18" x2="21" y2="18"></line>
//           </svg>
//         )}
//       </button>

//       {/* --- MOBILE OVERLAY --- */}
//       <div className={`mobile-overlay ${isMobileMenuOpen ? "mobile-overlay--open" : ""}`}>
//         <ul className="mobile-menu-track">
//           {links.map(({ label, href }, index) => {
//             const isActive = pathname === href;
            
//             return (
//               <li key={label} style={{ "--delay": `${index * 0.1}s` } as React.CSSProperties}>
//                 <Link
//                   href={href}
//                   onClick={() => handleLinkClick(href)}
//                   className={`mobile-nav-item ${isActive ? "mobile-nav-item--active" : ""}`}
//                 >
//                   {label}
//                 </Link>
//               </li>
//             );
//           })}
          
//           {/* Mobile Flip Button */}
//           <li style={{ "--delay": `${links.length * 0.1}s` } as React.CSSProperties} className="mobile-cta-wrapper">
//              <div className="cta-flipper">
//               <div className={`cta-inner ${showPhone ? "" : "flipped"}`}>
//                 <a href="tel:+918190923665" className="cta-face cta-front">+91 81909 23665</a>
//                 <a href="mailto:contact.sksgroups.net" className="cta-face cta-back">contact.sksgroups.net</a>
//               </div>
//             </div>
//           </li>
//         </ul>
//       </div>

//       <style>{`
//         .navbar-container {
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100%;
//           z-index: 1000;
//           display: flex;
//           justify-content: center;
//           padding-top: 20px;
//           pointer-events: none; 
//         }

//         .navbar-wrapper {
//           pointer-events: auto; 
//           display: inline-flex;
//           align-items: center;
//           background: #2c1a0a;
//           border-radius: 34px;
//           padding: 8px 10px;
//           box-shadow:
//             0 0 0 1px rgba(168, 131, 90, 0.25),
//             0 8px 32px rgba(44, 26, 10, 0.4),
//             inset 0 1px 0 rgba(255, 255, 255, 0.06);
//         }

//         .brand-logo {
//           display: flex;
//           align-items: center;
//           gap: 10px;
//           color: #e8ddd0;
//           text-decoration: none;
//           font-weight: 600;
//           letter-spacing: 0.04em;
//           padding-left: 12px;
//           padding-right: 18px;
//           font-size: 15px;
//           border-right: 1px solid rgba(168, 131, 90, 0.2);
//           margin-right: 8px;
//         }

//         .navbar-track {
//           display: flex;
//           align-items: center;
//           gap: 3px;
//           list-style: none;
//           margin: 0;
//           padding: 0;
//         }

//         .nav-item {
//           font-size: 13px;
//           font-weight: 500;
//           color: rgba(232, 221, 208, 0.55);
//           text-decoration: none;
//           padding: 8px 18px;
//           border-radius: 24px;
//           transition: all 0.22s ease;
//           white-space: nowrap;
//           display: block;
//           letter-spacing: 0.02em;
//         }

//         .nav-item:hover {
//           color: #e8ddd0;
//           background: rgba(168, 131, 90, 0.15);
//         }

//         .nav-item--active {
//           background: #4e2f10;
//           color: #e8ddd0;
//           box-shadow:
//             0 2px 6px rgba(44, 26, 10, 0.5),
//             inset 0 1px 0 rgba(255, 255, 255, 0.1);
//         }

//         .cta-flipper {
//           perspective: 1000px;
//           width: 170px;
//           height: 36px;
//           margin-left: 8px;
//         }

//         .cta-inner {
//           position: relative;
//           width: 100%;
//           height: 100%;
//           text-align: center;
//           transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
//           transform-style: preserve-3d;
//         }

//         .cta-inner.flipped {
//           transform: rotateX(180deg);
//         }

//         .cta-face {
//           position: absolute;
//           width: 100%;
//           height: 100%;
//           backface-visibility: hidden;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           background: #e8ddd0;
//           color: #2c1a0a;
//           font-weight: 600;
//           font-size: 13px;
//           border-radius: 24px;
//           text-decoration: none;
//           box-shadow:
//             0 0 0 1px rgba(168, 131, 90, 0.4),
//             0 3px 10px rgba(44, 26, 10, 0.2);
//           transition: all 0.2s ease;
//         }

//         .cta-face:hover {
//           background: #f5ede0;
//           box-shadow:
//             0 0 0 1px rgba(168, 131, 90, 0.6),
//             0 6px 16px rgba(44, 26, 10, 0.28);
//         }

//         .cta-back {
//           transform: rotateX(180deg);
//         }

//         .mobile-toggle, .mobile-overlay, .mobile-logo {
//           display: none; 
//         }

//         @media (max-width: 1024px) {
//           .desktop-only {
//             display: none; 
//           }
          
//           .mobile-logo {
//             display: flex;
//             pointer-events: auto;  
//             position: fixed;
//             top: 24px;
//             left: 20px;
//             z-index: 1002;
//             border-right: none;
//             padding: 0;
//             margin: 0;
//             filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); 
//           }

//           .mobile-toggle {
//             display: flex;
//             pointer-events: auto;
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             width: 50px;
//             height: 50px;
//             align-items: center;
//             justify-content: center;
//             background: #2c1a0a;
//             border: 1px solid rgba(168, 131, 90, 0.3);
//             border-radius: 50%;
//             color: #e8ddd0;
//             cursor: pointer;
//             box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
//             transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
//             z-index: 1002; 
//           }

//           .mobile-toggle:active {
//             transform: scale(0.92);
//           }

//           .mobile-toggle--open {
//             background: transparent;
//             border-color: transparent;
//             box-shadow: none;
//             color: #e8ddd0;
//           }

//           .mobile-overlay {
//             display: flex;
//             pointer-events: none;
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100vw;
//             height: 100vh;
//             background: #120a05; 
//             z-index: 1001;
//             align-items: center;
//             justify-content: center;
//             clip-path: circle(0px at calc(100% - 45px) 45px);
//             transition: clip-path 0.7s cubic-bezier(0.7, 0, 0.2, 1);
//           }

//           .mobile-overlay--open {
//             pointer-events: auto;
//             clip-path: circle(150vh at calc(100% - 45px) 45px);
//           }

//           .mobile-menu-track {
//             list-style: none;
//             padding: 0;
//             margin: 0;
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             gap: 24px;
//             text-align: center;
//           }

//           .mobile-cta-wrapper {
//             margin-top: 20px;
//             opacity: 0;
//             transform: translateY(40px);
//             transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
//             transition-delay: 0s;
//           }

//           .mobile-overlay--open .mobile-cta-wrapper {
//              opacity: 1;
//              transform: translateY(0);
//              transition-delay: calc(0.2s + var(--delay)); 
//           }

//           .mobile-cta-wrapper .cta-flipper {
//             width: 220px;
//             height: 48px;
//             margin: 0;
//           }
          
//           .mobile-cta-wrapper .cta-face {
//             font-size: 16px;
//           }

//           .mobile-nav-item {
//             display: inline-block;
//             font-size: 10vw; 
//             font-weight: 500;
//             letter-spacing: -0.02em;
//             color: rgba(232, 221, 208, 0.4);
//             text-decoration: none;
//             padding: 10px 20px;
//             opacity: 0;
//             transform: translateY(40px);
//             transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
//             transition-delay: 0s;
//           }

//           .mobile-overlay--open .mobile-nav-item {
//             opacity: 1;
//             transform: translateY(0);
//             transition-delay: calc(0.2s + var(--delay)); 
//           }

//           .mobile-nav-item:hover, .mobile-nav-item:active {
//             color: #ffffff;
//           }

//           .mobile-nav-item--active {
//             color: #e8ddd0;
//             font-style: italic;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }