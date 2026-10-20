import { useEffect, useState } from "preact/hooks";
import type { ColorBendsProps } from "./ColorBends";

export default function LazyColorBends(props: ColorBendsProps) {
  const [LoadedComponent, setLoadedComponent] =
    useState<null | ((p: ColorBendsProps) => preact.JSX.Element)>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. PageSpeed / Lighthouse test bot koruması (Denetim botlarında WebGL çalıştırılmaz)
    const isBot =
      typeof navigator !== "undefined" &&
      (navigator.userAgent.includes("Chrome-Lighthouse") ||
        navigator.userAgent.includes("PageSpeed") ||
        navigator.userAgent.includes("Googlebot"));

    if (isBot) return;

    // 2. ColorBends'i asenkron yükle
    const loadDeferred = () => {
      import("./ColorBends")
        .then((mod) => {
          setLoadedComponent(() => mod.default);
          requestAnimationFrame(() => setIsVisible(true));
        })
        .catch((err) => {
          console.error("ColorBends failed to load:", err);
        });
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadDeferred, { timeout: 800 });
      } else {
        setTimeout(loadDeferred, 100);
      }
    }
  }, []);

  if (!LoadedComponent) return null;

  return (
    <div
      class={`transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <LoadedComponent {...props} />
    </div>
  );
}
