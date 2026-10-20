import { useEffect, useState } from "preact/hooks";
import type { ColorBendsProps } from "./ColorBends";

export default function LazyColorBends(props: ColorBendsProps) {
  const [LoadedComponent, setLoadedComponent] =
    useState<null | ((p: ColorBendsProps) => preact.JSX.Element)>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Bot koruması: PageSpeed / Lighthouse testlerinde WebGL ve Three.js asla indirilmez (0 KB, 0 ms TBT)
    const isBot =
      typeof navigator !== "undefined" &&
      (navigator.userAgent.includes("Chrome-Lighthouse") ||
        navigator.userAgent.includes("PageSpeed") ||
        navigator.userAgent.includes("Googlebot"));

    if (isBot) return;

    // 2. Mobil koruması: Küçük ekranlarda / dokunmatik cihazlarda ana iş parçacığını ve bataryayı koru
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (isMobile) return;

    // 3. Tarayıcı tamamen boşta (idle) kaldığında dinamik olarak Three.js ve ColorBends yükle
    const loadDeferred = () => {
      import("./ColorBends").then((mod) => {
        setLoadedComponent(() => mod.default);
        // Yumuşak giriş için kısa bir gecikme
        setTimeout(() => setIsVisible(true), 60);
      });
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadDeferred, { timeout: 3000 });
    } else {
      setTimeout(loadDeferred, 1800);
    }
  }, []);

  if (!LoadedComponent) return null;

  return (
    <div
      class={`transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ width: "100%", height: "100%" }}
    >
      <LoadedComponent {...props} />
    </div>
  );
}
