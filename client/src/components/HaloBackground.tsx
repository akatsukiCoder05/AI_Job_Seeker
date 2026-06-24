import React, { useEffect, useRef } from "react";

export const HaloBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaEffectRef = useRef<any>(null);

  useEffect(() => {
    let threeScript: HTMLScriptElement | null = null;
    let vantaScript: HTMLScriptElement | null = null;

    const initVanta = () => {
      const windowWithVanta = window as any;
      if (
        containerRef.current &&
        windowWithVanta.THREE &&
        windowWithVanta.VANTA &&
        windowWithVanta.VANTA.HALO
      ) {
        if (vantaEffectRef.current) {
          vantaEffectRef.current.destroy();
          vantaEffectRef.current = null;
        }

        const isDark = document.documentElement.getAttribute("data-theme") !== "light";
        try {
          vantaEffectRef.current = windowWithVanta.VANTA.HALO({
            el: containerRef.current,
            THREE: windowWithVanta.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            backgroundColor: isDark ? 0x070715 : 0xf7f8fb, // Sleek dark slate vs light gray canvas
            baseColor: 0x4f46e5,       // Indigo base glow
            amplitudeFactor: isDark ? 1.5 : 0.8,
            xOffset: 0.0,
            yOffset: 0.0,
            size: isDark ? 1.5 : 1.2,
          });
          console.log("✨ [Vanta Background] Successfully initialized theme-responsive Vanta Halo!");
        } catch (err) {
          console.error("❌ [Vanta Background] Failed to initialize Vanta Halo:", err);
        }
      }
    };

    // Load scripts dynamically if they are not already loaded
    const loadScripts = async () => {
      const windowWithVanta = window as any;

      // 1. Check/Load Three.js
      if (!windowWithVanta.THREE) {
        threeScript = document.createElement("script");
        threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js";
        threeScript.async = true;
        document.head.appendChild(threeScript);
        
        await new Promise((resolve) => {
          if (threeScript) threeScript.onload = resolve;
        });
      }

      // 2. Check/Load Vanta Halo
      if (!windowWithVanta.VANTA || !windowWithVanta.VANTA.HALO) {
        vantaScript = document.createElement("script");
        vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js";
        vantaScript.async = true;
        document.head.appendChild(vantaScript);

        await new Promise((resolve) => {
          if (vantaScript) vantaScript.onload = resolve;
        });
      }

      initVanta();
    };

    loadScripts();

    // Observe theme changes
    const observer = new MutationObserver(() => {
      initVanta();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
      // Clean up Vanta effect when unmounting
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
      
      // Clean up script elements from DOM if necessary
      if (threeScript && document.head.contains(threeScript)) {
        document.head.removeChild(threeScript);
      }
      if (vantaScript && document.head.contains(vantaScript)) {
        document.head.removeChild(vantaScript);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ display: "block", position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
    />
  );
};

export default HaloBackground;
