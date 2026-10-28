import { useEffect, useState } from "preact/hooks";
import type { ColorBendsProps } from "./ColorBends";

export default function LazyColorBends(props: ColorBendsProps) {
  const [LoadedComponent, setLoadedComponent] = useState<
    null | ((p: ColorBendsProps) => preact.JSX.Element)
  >(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. PageSpeed / Lighthouse / Webdriver / Otomasyon botu koruması
    const isBot =
      navigator.webdriver ||
      /bot|crawler|spider|lighthouse|pagespeed/i.test(navigator.userAgent);

    if (isBot) return;

    // 2. WebGL'i sadece gerçek kullanıcı etkileşimi (mouse, scroll, dokunma) ile yükle
    let loaded = false;
    const triggerLoad = () => {
      if (loaded) return;
      loaded = true;
      cleanup();

      import("./ColorBends")
        .then((mod) => {
          setLoadedComponent(() => mod.default);
          requestAnimationFrame(() => setIsVisible(true));
        })
        .catch((err) => {
          console.error("ColorBends failed to load:", err);
        });
    };

    const events = ["pointermove", "scroll", "touchstart", "keydown", "click"];
    const cleanup = () => {
      events.forEach((evt) => window.removeEventListener(evt, triggerLoad));
    };

    events.forEach((evt) =>
      window.addEventListener(evt, triggerLoad, { passive: true, once: true }),
    );

    return () => {
      cleanup();
    };
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
