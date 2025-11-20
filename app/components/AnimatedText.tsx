"use client";

import { useEffect, useState, useRef } from "react";
import { useI18n } from "@/app/contexts/I18nContext";

type AnimatedTextProps = {
  children: string;
  className?: string;
  duration?: number;
};

export function AnimatedText({ 
  children, 
  className = "", 
  duration = 400 
}: AnimatedTextProps) {
  const { language } = useI18n();
  const [displayText, setDisplayText] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevTextRef = useRef(children);
  const prevLangRef = useRef(language);

  useEffect(() => {
    // Only animate if text or language actually changed
    if (children !== prevTextRef.current || language !== prevLangRef.current) {
      setIsAnimating(true);
      
      // Fade out (smoke disappear)
      const fadeOutTimer = setTimeout(() => {
        setDisplayText(children);
        prevTextRef.current = children;
        prevLangRef.current = language;
        
        // Fade in (smoke appear)
        requestAnimationFrame(() => {
          setIsAnimating(false);
        });
      }, duration / 2);

      return () => clearTimeout(fadeOutTimer);
    }
  }, [children, language, duration]);

  // Check if this is a gradient text (has bg-clip-text)
  const isGradientText = className.includes("bg-clip-text") || className.includes("text-transparent");
  
  return (
    <span
      className={`inline-block transition-all ${
        isAnimating
          ? isGradientText
            ? "opacity-0 scale-95"
            : "opacity-0 blur-sm scale-95"
          : isGradientText
            ? "opacity-100 scale-100"
            : "opacity-100 blur-0 scale-100"
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {displayText}
    </span>
  );
}

