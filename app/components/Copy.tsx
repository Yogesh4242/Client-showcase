"use client";

import React, { useRef, ReactNode, useEffect } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(SplitText, ScrollTrigger);

interface CopyProps {
  children: ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  className?: string;
}

export default function Copy({ 
  children, 
  animateOnScroll = true, 
  delay = 0,
  className = ""
}: CopyProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const element = containerRef.current;
    
    // Split the text
    const split = SplitText.create(element, {
      type: "chars",
      charsClass: "char",
    });

    // Set initial state
    if (split.chars && split.chars.length > 0) {
      gsap.set(split.chars, { y: "100%" });

      const animationProps: gsap.TweenVars = {
        y: "0%",
        duration: 1,
        stagger: 0.03,
        ease: "power4.out",
        delay: delay,
      };

      if (animateOnScroll) {
        gsap.to(split.chars, {
          ...animationProps,
          scrollTrigger: {
            trigger: element,
            start: "top 75%",
            once: true,
          },
        });
      } else {
        gsap.to(split.chars, animationProps);
      }
    }

    // Cleanup
    return () => {
      if (split) {
        split.revert();
      }
    };
  }, [animateOnScroll, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}