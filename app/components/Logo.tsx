"use client";

import { forwardRef } from "react";

interface AnimatedLogoLoaderProps {
  className?: string;
}

const AnimatedLogoLoader = forwardRef<SVGSVGElement, AnimatedLogoLoaderProps>(({ className = "" }, ref) => {
  // Restored Navy Theme Colors
  const colors = {
    base: "#0A1128",     // Deep background navy
    building: "#162A5A", // Mid navy for building fills
    highlight: "#274684",// Lighter navy gradient top
    glow: "#60A5FA",     // Vibrant neon blue for outlines/pulse
    text: "#0A1128",     // FIXED: Changed to actual Crisp white (was #0A1128)
  };

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      width="100%"
      height="100%"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sleek vertical gradient for the buildings */}
        <linearGradient id="buildingGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={colors.building} />
          <stop offset="100%" stopColor={colors.highlight} />
        </linearGradient>

        {/* Neon glow effect for the center spire */}
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* --- Pure CSS Animations for buttery smooth 60fps rendering --- */}
      <style>{`
        /* 1. Blueprint Line Drawing */
        .outline-1,
        .outline-2,
        .outline-3 {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawOutline 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }
        .outline-1 { animation-delay: 0.1s; }
        .outline-2 { animation-delay: 0.3s; }
        .outline-3 { animation-delay: 0.5s; }

        /* 2. Gradient Fill Rising */
        .fill {
          transform-origin: bottom;
          transform-box: fill-box; /* CRITICAL FIX FOR iOS SAFARI */
          transform: scaleY(0);
          animation: riseUp 1s cubic-bezier(0.7, 0, 0.3, 1) forwards;
        }
        .fill-1 { animation-delay: 0.8s; }
        .fill-2 { animation-delay: 1.0s; }
        .fill-3 { animation-delay: 1.2s; }

        /* 3. Infinite Glow Pulse */
        .pulse {
          opacity: 0;
          animation: fadePulse 2s ease-in-out infinite alternate;
          animation-delay: 1.8s;
        }

        /* 4. Typography Reveal */
        .text-reveal {
          opacity: 0;
          transform: translateY(15px);
          animation: slideFade 0.8s ease-out forwards;
        }
        .text-title { animation-delay: 1.5s; }
        .text-sub { animation-delay: 1.7s; }

        /* Keyframes */
        @keyframes drawOutline {
          to { stroke-dashoffset: 0; }
        }
        @keyframes riseUp {
          to { transform: scaleY(1); }
        }
        @keyframes fadePulse {
          0% { opacity: 0.3; height: 10px; }
          100% { opacity: 1; height: 35px; }
        }
        @keyframes slideFade {
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Force the dark background so it never shows a white screen */}
      

      {/* --- Graphic Elements --- */}
      <g transform="translate(200, 220)">
        {/* Ground Base Line */}
        <line x1="-100" y1="0" x2="100" y2="0" stroke={colors.highlight} strokeWidth="2" strokeLinecap="round" opacity="0.4" />

        {/* LEFT BUILDING */}
        <g>
          <path d="M-65,0 L-65,-90 L-35,-90 L-35,0" fill="none" stroke={colors.glow} strokeWidth="1.5" className="outline-1" />
          <rect x="-65" y="-90" width="30" height="90" fill="url(#buildingGrad)" className="fill fill-1" />
        </g>

        {/* RIGHT BUILDING */}
        <g>
          <path d="M35,0 L35,-110 L65,-110 L65,0" fill="none" stroke={colors.glow} strokeWidth="1.5" className="outline-2" />
          <rect x="35" y="-110" width="30" height="110" fill="url(#buildingGrad)" className="fill fill-2" />
        </g>

        {/* CENTER BUILDING (Hero with angled roof) */}
        <g>
          <path d="M-25,0 L-25,-140 L-10,-160 L10,-160 L25,-140 L25,0" fill="none" stroke={colors.glow} strokeWidth="1.5" className="outline-3" />
          <polygon points="-25,0 -25,-140 -10,-160 10,-160 25,-140 25,0" fill="url(#buildingGrad)" className="fill fill-3" />
          
          {/* Glowing Center Spire */}
          <rect x="-2" y="-160" width="4" height="10" fill={colors.glow} filter="url(#neonGlow)" className="pulse" />
        </g>
      </g>

      {/* --- Typography --- */}
      <g transform="translate(200, 290)">
        <text
          className="text-reveal text-title"
          fontFamily="Inter, sans-serif"
          fontSize="36"
          fontWeight="900"
          fill={colors.text}
          textAnchor="middle"
          letterSpacing="2"
        >
          SKS GROUPS
        </text>
        <text
          className="text-reveal text-sub"
          y="32"
          fontFamily="Inter, sans-serif"
          fontSize="11"
          fontWeight="600"
          fill={colors.glow}
          textAnchor="middle"
          letterSpacing="8"
        >
          BUILDING YOUR FUTURE
        </text>
      </g>
    </svg>
  );
});

AnimatedLogoLoader.displayName = "AnimatedLogoLoader";

export default AnimatedLogoLoader as typeof AnimatedLogoLoader;