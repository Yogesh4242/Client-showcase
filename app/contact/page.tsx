"use client";

import { useState } from "react";

export default function Contact() {
  const [formStatus, setFormStatus] = useState<{ message: string; type: "success" | "error" | null }>({ message: "", type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ message: "", type: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setFormStatus({ message: "Message sent successfully! We'll get back to you soon.", type: "success" });
      (e.target as HTMLFormElement).reset();
    } catch {
      setFormStatus({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "14px 18px",
    backgroundColor: focused === name ? "#efe6d8" : "#e8ddd0",
    border: `1px solid ${focused === name ? "#4e2f10" : "rgba(168, 131, 90, 0.4)"}`,
    borderRadius: "10px",
    color: "#2c1a0a",
    fontSize: "0.93rem",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "all 0.25s ease",
    boxShadow: focused === name ? "0 0 0 3px rgba(78,47,16,0.1)" : "none",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#e8ddd0",
      paddingTop: "100px",
      paddingBottom: "60px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        ::placeholder { color: rgba(92, 58, 30, 0.4); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .contact-hero   { animation: fadeUp 0.7s ease both; }
        .contact-left   { animation: fadeUp 0.7s 0.15s ease both; }
        .contact-right  { animation: fadeUp 0.7s 0.28s ease both; }
        .contact-footer { animation: fadeUp 0.7s 0.4s ease both; }

        .contact-link {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 12px;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: background 0.2s ease;
        }
        .contact-link:hover { background: rgba(168,131,90,0.15); }

        .submit-btn {
          width: 100%;
          background: #2c1a0a;
          color: #e8ddd0;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.82rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) {
          background: #4e2f10;
          box-shadow: 0 6px 20px rgba(44,26,10,0.25);
          transform: translateY(-1px);
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(232,221,208,0.3);
          border-top-color: #e8ddd0;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .icon-circle {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(78,47,16,0.1);
          border: 1px solid rgba(168,131,90,0.35);
          display: flex; align-items: center; justify-content: center;
          color: #4e2f10;
          flex-shrink: 0;
        }

        .social-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(78,47,16,0.08);
          border: 1px solid rgba(168,131,90,0.3);
          color: #4e2f10;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .social-link:hover {
          background: #4e2f10;
          color: #e8ddd0;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .contact-grid { gap: 16px !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1060px", margin: "0 auto", padding: "0 24px" }}>

        {/* Hero */}
        <div className="contact-hero" style={{ marginBottom: "52px" }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#a8835a",
            display: "block",
            marginBottom: "10px",
          }}>Get In Touch</span>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.4rem, 6vw, 4rem)",
            fontWeight: 700,
            color: "#2c1a0a",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}>Let's Build Something<br />
            <span style={{
              background: "linear-gradient(120deg, #4e2f10 0%, #a8835a 50%, #4e2f10 100%)",
              backgroundSize: "200%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 6s ease infinite",
            }}>Together.</span>
          </h1>
        </div>

        {/* Grid */}
        <div className="contact-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "28px",
          alignItems: "start",
        }}>

          {/* LEFT — Info */}
          <div className="contact-left" style={{
            background: "#efe6d8",
            borderRadius: "20px",
            border: "1px solid rgba(168,131,90,0.3)",
            padding: "36px 32px",
            boxShadow: "0 8px 30px rgba(78,47,16,0.08)",
          }}>
            <div style={{
              width: "40px", height: "1px",
              background: "#a8835a",
              marginBottom: "20px",
            }} />
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.55rem",
              fontWeight: 700,
              color: "#2c1a0a",
              marginBottom: "8px",
            }}>SKS Groups</h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              color: "#5c3a1e",
              lineHeight: 1.7,
              marginBottom: "32px",
            }}>
              Transforming ideas into infrastructure reality. Based in Chennai, serving clients across India.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>

              <a href="tel:+918190923665" className="contact-link">
                <div className="icon-circle">
                  <i className="fas fa-phone-alt" style={{ fontSize: "0.8rem" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#a8835a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Phone</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", fontWeight: 500, color: "#2c1a0a" }}>+91 81909 23665</div>
                </div>
              </a>

              <a href="https://wa.me/918190923665" className="contact-link" target="_blank" rel="noopener noreferrer">
                <div className="icon-circle">
                  <i className="fab fa-whatsapp" style={{ fontSize: "0.9rem" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#a8835a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>WhatsApp</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", fontWeight: 500, color: "#2c1a0a" }}>81909 23665</div>
                </div>
              </a>

              <a href="mailto:sksgroupinfra@gmail.com" className="contact-link">
                <div className="icon-circle">
                  <i className="fas fa-envelope" style={{ fontSize: "0.8rem" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#a8835a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Email</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", fontWeight: 500, color: "#2c1a0a" }}>sksgroupinfra@gmail.com</div>
                </div>
              </a>

              <a href="https://maps.google.com/?q=Chennai+Tamil+Nadu" className="contact-link" target="_blank" rel="noopener noreferrer">
                <div className="icon-circle">
                  <i className="fas fa-map-marker-alt" style={{ fontSize: "0.8rem" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#a8835a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Location</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", fontWeight: 500, color: "#2c1a0a" }}>Chennai, Tamil Nadu</div>
                </div>
              </a>

              <div className="contact-link" style={{ cursor: "default" }}>
                <div className="icon-circle">
                  <i className="fas fa-clock" style={{ fontSize: "0.8rem" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#a8835a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Hours</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", fontWeight: 500, color: "#2c1a0a" }}>Mon – Sat, 9:00 AM – 5:00 PM</div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div style={{ marginTop: "32px" }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#a8835a",
                marginBottom: "12px"
              }}>Follow Us</div>
              <div className="social-links">
                <a href="https://linkedin.com/in/SKSGroup9972" className="social-link" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                  <i className="fab fa-linkedin-in" style={{ fontSize: "1.1rem" }} />
                </a>
                <a href="https://instagram.com/sksgroupinfra" className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram">
                  <i className="fab fa-instagram" style={{ fontSize: "1.1rem" }} />
                </a>
                <a href="https://t.me/SKSGroup9972" className="social-link" target="_blank" rel="noopener noreferrer" title="Telegram">
                  <i className="fab fa-telegram-plane" style={{ fontSize: "1.1rem" }} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="contact-right" style={{
            background: "#efe6d8",
            borderRadius: "20px",
            border: "1px solid rgba(168,131,90,0.3)",
            padding: "36px 32px",
            boxShadow: "0 8px 30px rgba(78,47,16,0.08)",
          }}>
            <div style={{
              width: "40px", height: "1px",
              background: "#a8835a",
              marginBottom: "20px",
            }} />
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.55rem",
              fontWeight: 700,
              color: "#2c1a0a",
              marginBottom: "28px",
            }}>Send a Message</h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Honeypot */}
              <div style={{ position: "absolute", left: "-5000px" }} aria-hidden="true">
                <input type="text" name="website" tabIndex={-1} defaultValue="" autoComplete="off" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8835a", display: "block", marginBottom: "6px" }}>Name</label>
                  <input
                    type="text" name="name" placeholder="Your name" required
                    style={inputStyle("name")}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8835a", display: "block", marginBottom: "6px" }}>Email</label>
                  <input
                    type="email" name="email" placeholder="your@email.com" required
                    style={inputStyle("email")}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8835a", display: "block", marginBottom: "6px" }}>Subject</label>
                <input
                  type="text" name="subject" placeholder="Project inquiry"
                  style={inputStyle("subject")}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div>
                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a8835a", display: "block", marginBottom: "6px" }}>Message</label>
                <textarea
                  name="message" rows={5} placeholder="Tell us about your project..." required
                  style={{ ...inputStyle("message"), resize: "vertical" }}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? (
                  <><span>Sending</span><span className="spinner" /></>
                ) : (
                  <><span>Send Message</span><i className="fas fa-arrow-right" style={{ fontSize: "0.75rem" }} /></>
                )}
              </button>

              {formStatus.message && (
                <div style={{
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  color: formStatus.type === "success" ? "#4a7c59" : "#9b3a3a",
                  padding: "10px",
                  borderRadius: "8px",
                  background: formStatus.type === "success" ? "rgba(74,124,89,0.1)" : "rgba(155,58,58,0.1)",
                  border: `1px solid ${formStatus.type === "success" ? "rgba(74,124,89,0.2)" : "rgba(155,58,58,0.2)"}`,
                }}>
                  {formStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="contact-footer" style={{
          marginTop: "52px",
          paddingTop: "24px",
          borderTop: "1px solid rgba(168,131,90,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#a8835a", letterSpacing: "0.08em" }}>
            © {new Date().getFullYear()} SKS Groups. All rights reserved.
          </span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontWeight: 600, color: "#4e2f10", letterSpacing: "0.04em" }}>
            Infrastructure · Construction · Consulting
          </span>
        </footer>

      </div>
    </div>
  );
}