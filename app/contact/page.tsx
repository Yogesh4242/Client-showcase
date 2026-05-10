"use client";

import { useState, useRef } from "react";

export default function Contact() {
  const [formStatus, setFormStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({
    message: "",
    type: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    setFormStatus({ message: "", type: null });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setFormStatus({
        message: "Message sent successfully!",
        type: "success",
      });

      (e.target as HTMLFormElement).reset();
    } catch {
      setFormStatus({
        message: "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: "100%",
    padding: "16px 20px",
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${
      focused === name
        ? "rgba(198,161,91,0.45)"
        : "rgba(255,255,255,0.06)"
    }`,
    borderRadius: "16px",
    color: "#F5E6C8",
    fontSize: "0.95rem",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    transition: "all 0.3s ease",
    backdropFilter: "blur(12px)",
    boxShadow:
      focused === name
        ? "0 0 0 4px rgba(198,161,91,0.05)"
        : "none",
  });

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "#000000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        body{
          background:#000;
        }

        ::placeholder{
          color:rgba(255,255,255,0.25);
        }

        @keyframes fadeUp{
          from{
            opacity:0;
            transform:translateY(40px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        @keyframes spin{
          to{
            transform:rotate(360deg);
          }
        }

        .animated{
          animation:fadeUp 0.8s ease both;
        }

        .contact-card{
          background: linear-gradient(
            145deg,
            rgba(16,16,16,0.95),
            rgba(8,8,8,0.92)
          );

          border:1px solid rgba(255,255,255,0.05);

          backdrop-filter:blur(18px);

          box-shadow:
            0 10px 30px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.02);

          transition:all 0.35s ease;

          position:relative;
          overflow:hidden;
        }

        .contact-card:hover{
          transform:translateY(-6px);

          border-color:rgba(198,161,91,0.15);

          box-shadow:
            0 18px 45px rgba(0,0,0,0.6);
        }

        .contact-link{
          display:flex;
          align-items:center;
          gap:16px;
          padding:16px;
          border-radius:18px;
          text-decoration:none;

          background:rgba(255,255,255,0.02);

          border:1px solid rgba(255,255,255,0.04);

          transition:0.3s ease;
        }

        .contact-link:hover{
          transform:translateX(6px);

          background:rgba(255,255,255,0.04);

          border-color:rgba(198,161,91,0.14);
        }

        .icon-circle{
          width:48px;
          height:48px;
          border-radius:50%;

          display:flex;
          align-items:center;
          justify-content:center;

          color:#C6A15B;

          background:rgba(255,255,255,0.03);

          border:1px solid rgba(255,255,255,0.05);

          flex-shrink:0;

          transition:0.3s ease;
        }

        .contact-link:hover .icon-circle{
          transform:translateY(-2px);
          border-color:rgba(198,161,91,0.2);
        }

        .submit-btn{
          width:100%;

          border:none;

          padding:16px;

          border-radius:16px;

          cursor:pointer;

          background:linear-gradient(
            135deg,
            #8A6A2F,
            #B8924A
          );

          color:#fff;

          font-size:0.9rem;
          font-weight:600;

          letter-spacing:0.08em;
          text-transform:uppercase;

          transition:0.3s ease;

          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;

          box-shadow:
            0 10px 25px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .submit-btn:hover:not(:disabled){
          transform:translateY(-2px);
          filter:brightness(1.06);
        }

        .submit-btn:disabled{
          opacity:0.6;
          cursor:not-allowed;
        }

        .spinner{
          width:16px;
          height:16px;
          border-radius:50%;
          border:2px solid rgba(255,255,255,0.3);
          border-top-color:#fff;
          animation:spin 0.8s linear infinite;
        }

        .social-links{
          display:flex;
          gap:14px;
          flex-wrap:wrap;
          margin-top:22px;
        }

        .social-link{
          width:48px;
          height:48px;
          border-radius:50%;

          display:flex;
          align-items:center;
          justify-content:center;

          color:#C6A15B;

          text-decoration:none;

          background:rgba(255,255,255,0.02);

          border:1px solid rgba(255,255,255,0.05);

          transition:0.3s ease;
        }

        .social-link:hover{
          transform:translateY(-3px);

          background:rgba(255,255,255,0.04);

          border-color:rgba(198,161,91,0.15);
        }

        @media(max-width:900px){
          .grid{
            grid-template-columns:1fr !important;
          }
        }

        @media(max-width:600px){
          .two-col{
            grid-template-columns:1fr !important;
          }
        }
      `}</style>

      {/* SOFT GLOW */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "340px",
          height: "340px",
          background:
            "radial-gradient(circle, rgba(184,134,11,0.08), transparent 70%)",
          filter: "blur(70px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "-140px",
          left: "-100px",
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(218,165,32,0.05), transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "100px 24px 60px",
        }}
      >
        {/* HERO */}
        <div
          className="animated"
          style={{
            textAlign: "center",
            marginBottom: "70px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "8px 18px",
              borderRadius: "50px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#C6A15B",
              fontSize: "0.7rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              marginBottom: "24px",
            }}
          >
            Get In Touch
          </span>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginBottom: "14px",
              background:
                "linear-gradient(135deg, #E0C38A 0%, #B8924A 45%, #8A6A2F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Let's Build Something
          </h1>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 8vw, 5.5rem)",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Together.
          </h1>

          <p
            style={{
              maxWidth: "620px",
              margin: "28px auto 0",
              color: "rgba(255,255,255,0.58)",
              fontSize: "1rem",
              lineHeight: 1.8,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Transform your vision into reality with SKS Groups —
            where excellence meets innovation in infrastructure
            and construction.
          </p>
        </div>

        {/* GRID */}
        <div
          className="grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: "32px",
          }}
        >
          {/* LEFT */}
          <div
            className="contact-card animated"
            style={{
              borderRadius: "28px",
              padding: "38px 32px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "1px",
                background:
                  "linear-gradient(90deg, #9B7A3A, transparent)",
                marginBottom: "24px",
                opacity: 0.7,
              }}
            />

            <h2
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "12px",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              SKS Groups
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.8,
                fontSize: "0.95rem",
                marginBottom: "34px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Transforming ideas into infrastructure reality.
              Based in Chennai, serving clients across India
              with excellence and integrity.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <a href="tel:+918190923665" className="contact-link">
                <div className="icon-circle">
                  <i className="fas fa-phone-alt" />
                </div>

                <div>
                  <div
                    style={{
                      color: "#9B7A3A",
                      fontSize: "0.7rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Phone
                  </div>

                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    +91 81909 23665
                  </div>
                </div>
              </a>

              <a
                href="mailto:sksgroupinfra@gmail.com"
                className="contact-link"
              >
                <div className="icon-circle">
                  <i className="fas fa-envelope" />
                </div>

                <div>
                  <div
                    style={{
                      color: "#9B7A3A",
                      fontSize: "0.7rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Email
                  </div>

                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    sksgroupinfra@gmail.com
                  </div>
                </div>
              </a>

              <a
                href="https://maps.google.com/?q=Chennai+Tamil+Nadu"
                className="contact-link"
                target="_blank"
              >
                <div className="icon-circle">
                  <i className="fas fa-map-marker-alt" />
                </div>

                <div>
                  <div
                    style={{
                      color: "#9B7A3A",
                      fontSize: "0.7rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Location
                  </div>

                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 600,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Chennai, Tamil Nadu
                  </div>
                </div>
              </a>
            </div>

            {/* SOCIAL */}
            <div style={{ marginTop: "38px" }}>
              <div
                style={{
                  color: "#9B7A3A",
                  marginBottom: "18px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Connect With Us
              </div>

              <div className="social-links">
                <a href="#" className="social-link">
                  <i className="fab fa-instagram" />
                </a>

                <a href="#" className="social-link">
                  <i className="fab fa-linkedin-in" />
                </a>

                <a href="#" className="social-link">
                  <i className="fab fa-facebook-f" />
                </a>

                <a href="#" className="social-link">
                  <i className="fab fa-whatsapp" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div
            className="contact-card animated"
            style={{
              borderRadius: "28px",
              padding: "38px 32px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "1px",
                background:
                  "linear-gradient(90deg, #9B7A3A, transparent)",
                marginBottom: "24px",
                opacity: 0.7,
              }}
            />

            <h3
              style={{
                color: "#fff",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "32px",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              Send a Message
            </h3>

            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div
                className="two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#9B7A3A",
                      fontSize: "0.72rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="John Doe"
                    required
                    style={inputStyle("name")}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#9B7A3A",
                      fontSize: "0.72rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="hello@example.com"
                    required
                    style={inputStyle("email")}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#9B7A3A",
                    fontSize: "0.72rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Subject
                </label>

                <input
                  type="text"
                  placeholder="Project Inquiry"
                  required
                  style={inputStyle("subject")}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#9B7A3A",
                    fontSize: "0.72rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Message
                </label>

                <textarea
                  rows={6}
                  placeholder="Tell us about your project..."
                  required
                  style={{
                    ...inputStyle("message"),
                    resize: "vertical",
                  }}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <span>Sending</span>
                    <span className="spinner" />
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <i className="fas fa-paper-plane" />
                  </>
                )}
              </button>

              {formStatus.message && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    textAlign: "center",
                    fontSize: "0.9rem",
                    fontFamily: "'Inter', sans-serif",
                    color:
                      formStatus.type === "success"
                        ? "#C6A15B"
                        : "#ff7d7d",

                    background:
                      formStatus.type === "success"
                        ? "rgba(198,161,91,0.08)"
                        : "rgba(255,125,125,0.08)",

                    border:
                      formStatus.type === "success"
                        ? "1px solid rgba(198,161,91,0.15)"
                        : "1px solid rgba(255,125,125,0.15)",
                  }}
                >
                  {formStatus.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}