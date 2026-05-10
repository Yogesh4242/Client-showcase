"use client";

const quickLinks = [
  { label: "Home",     href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Contact",  href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="ft-root">

        {/* //TOP BAR (Duplicate of bottom for symmetry) */}
        <div className="ft-bar">
        <div className="ft-bar-inner">
          
          
        </div>
      </div>

      {/* ── MAIN FOOTER ── */}
      <div className="ft-main">


        

        {/* Brand column */}
        <div className="ft-col ft-col--brand">
          <span className="ft-brand-word">SKS</span>
          <span className="ft-brand-word ft-brand-word--dim">GROUPS</span>
          <p className="ft-brand-desc">
            Building landmark infrastructure and sustainable spaces since 2001.
          </p>
          <div className="ft-socials">
            <a href="#" className="ft-social-btn" aria-label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href="#" className="ft-social-btn" aria-label="Instagram">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" className="ft-social-btn" aria-label="Twitter / X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Company */}
        <div className="ft-col">
          <h4 className="ft-col-title">Company</h4>
          <ul className="ft-links">
            {["About Us","Our Team","Careers","Press","Awards"].map(l => (
              <li key={l}><a href="#" className="ft-link">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="ft-col">
          <h4 className="ft-col-title">Quick Links</h4>
          <ul className="ft-links">
            {quickLinks.map(({ label, href }) => (
              <li key={label}>
                <a href={href} className="ft-link ft-link--arrow">
                  <svg className="ft-arrow-icon" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact (Added ft-col--contact class here) */}
        <div className="ft-col ft-col--contact">
          <h4 className="ft-col-title">Contact</h4>
          <ul className="ft-links ft-links--contact">
            <li className="ft-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ft-contact-icon">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>12 Builder's Lane, Chennai, Tamil Nadu</span>
            </li>
            <li className="ft-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ft-contact-icon">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.08 4.18 2 2 0 0 1 6.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L10.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+91 98765 43210</span>
            </li>
            <li className="ft-contact-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="ft-contact-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>hello@sksgroups.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
        
        <div className="ft-bar-inner">
          <span className="ft-copy">©️ {new Date().getFullYear()} SKS Groups. All rights reserved.</span>
          
      </div>
   

       {/* ── BOTTOM BAR ── */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── ROOT ── */
        .ft-root {
          background: #000000; /* Pure Black Background */
          font-family: 'DM Sans', sans-serif;
        }

        /* ── GRID ── */
        .ft-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1.3fr;
          gap: 48px;
          max-width: 1160px;
          margin: 0 auto;
          padding: 60px 32px 50px;
        }

        /* Tablet: 2-column, brand spans full width */
        @media (max-width: 860px) {
          .ft-main {
            grid-template-columns: 1fr 1fr;
            gap: 40px 32px;
            padding: 48px 28px 40px;
          }
          .ft-col--brand {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto auto;
            column-gap: 0;
            align-items: start;
          }
          .ft-brand-word { display: inline; font-size: 2.6rem; }
          .ft-brand-word--dim { margin-left: 0.15em; }
          .ft-brand-desc {
            grid-column: 1 / -1;
            max-width: 100%;
            margin-top: 14px;
          }
          .ft-socials { grid-column: 1 / -1; }
        }

        /* Mobile: Modified to match your annotations */
        @media (max-width: 520px) {
          .ft-main {
            grid-template-columns: 1fr 1fr; /* Set to 2 columns to put Company & Quick Links beside each other */
            gap: 32px 16px;
            padding: 40px 20px 32px;
          }
          .ft-col--brand {
            grid-column: 1 / -1; /* Keep brand spanning the full width */
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .ft-brand-word { display: block; font-size: 2.8rem; }
          .ft-brand-desc { max-width: 100%; }

          /* Center the newly targeted Contact section and force it full width */
          .ft-col--contact {
            grid-column: 1 / -1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .ft-col--contact .ft-links {
            align-items: center;
          }
          .ft-contact-item {
            align-items: center; /* Center the icons alongside text vertically */
          }
        }

        /* ── BRAND ── */
        .ft-brand-word {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 3.2rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          line-height: 0.92;
          color: #D4AF37; /* Primary Gold */
        }
        .ft-brand-word--dim { color: #8B5A2B; } /* Rich Brown */

        .ft-brand-desc {
          margin: 16px 0 22px;
          font-size: 0.85rem;
          line-height: 1.72;
          color: rgba(212, 175, 55, 0.6); /* Muted Gold */
          max-width: 230px;
        }

        /* ── SOCIALS ── */
        .ft-socials { display: flex; gap: 8px; }

        .ft-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(139, 90, 43, 0.15); /* Brown Tint */
          border: 1px solid rgba(212, 175, 55, 0.3); /* Gold Border */
          color: #D4AF37; /* Gold Icon */
          text-decoration: none;
          transition: background 0.22s, border-color 0.22s, color 0.22s, transform 0.22s;
        }
        .ft-social-btn:hover {
          background: rgba(212, 175, 55, 0.15); /* Gold Tint on Hover */
          border-color: #D4AF37;
          color: #FFF;
          transform: translateY(-2px);
        }

        /* ── COLUMN TITLES ── */
        .ft-col-title {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #D4AF37; /* Gold */
          margin: 0 0 18px;
        }

        /* ── LINK LIST ── */
        .ft-links {
          list-style: none;
          margin: 0; padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .ft-link {
          font-size: 0.875rem;
          color: rgba(243, 229, 171, 0.55); /* Pale Gold/Cream */
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
          position: relative;
        }

        /* underline for plain links */
        .ft-link:not(.ft-link--arrow)::after {
          content: '';
          position: absolute;
          left: 0; bottom: -2px;
          height: 1px; width: 0;
          background: #D4AF37; /* Gold Underline */
          transition: width 0.25s ease;
        }
        .ft-link:not(.ft-link--arrow):hover::after { width: 100%; }
        .ft-link:hover { color: #D4AF37; } /* Solid Gold on Hover */

        /* arrow icon links */
        .ft-arrow-icon {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s, transform 0.2s;
          flex-shrink: 0;
        }
        .ft-link--arrow:hover .ft-arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }
        .ft-link--arrow:hover { color: #D4AF37; }

        /* ── CONTACT ── */
        .ft-links--contact { gap: 15px; }

        .ft-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.82rem;
          line-height: 1.55;
        }
        .ft-contact-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: #D4AF37; /* Gold Icons */
        }
        .ft-contact-item span { color: rgba(243, 229, 171, 0.55); } /* Pale Gold Text */

        /* ── BOTTOM BAR ── */
        .ft-bar { border-top: 1px solid rgba(139, 90, 43, 0.35); } /* Subtle Brown Line */

        .ft-bar-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .ft-copy {
          font-size: 0.72rem;
          color: rgba(212, 175, 55, 0.45); /* Muted Gold */
          letter-spacing: 0.1em;
        }

        .ft-bar-links { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .ft-bar-group { display: flex; align-items: center; gap: 6px; }

        .ft-bar-link {
          font-size: 0.72rem;
          color: rgba(243, 229, 171, 0.35);
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: color 0.2s;
        }
        .ft-bar-link:hover { color: #D4AF37; }

        .ft-bar-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #8B5A2B; /* Brown Separator Dots */
          display: inline-block;
        }

        @media (max-width: 520px) {
          .ft-bar-inner {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 16px 20px;
          }
          .ft-bar-links { justify-content: center; }
        }
      `}</style>
    </footer>
  );
}