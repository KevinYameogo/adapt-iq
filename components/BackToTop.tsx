"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Check if the user has scrolled down halfway (approx 500px or based on document height)
      if (window.scrollY > window.innerHeight / 2) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-6 h-10 w-10 bg-white border border-slate-200 text-slate-900 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-all z-40 animate-in fade-in slide-in-from-bottom-4"
      aria-label="Back to top"
    >
      <span className="text-xl">↑</span>
    </button>
  );
}
