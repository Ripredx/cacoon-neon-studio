import {
  type CustomNeonSpec,
  NEON_BACKBOARDS,
  NEON_BORDERS,
  NEON_COLORS,
  NEON_FONTS,
  NEON_SIZES,
  NEON_SYMBOLS,
  NEON_TUBE_TECHS,
  type NeonBackboardId,
  type NeonBorderId,
  type NeonColorId,
  type NeonEnvironment,
  type NeonFontId,
  type NeonSizeId,
  type NeonSymbolId,
  type NeonTextAlign,
  type NeonTubeTechId,
  calculateNeonPrice,
} from "@/entities/custom-neon/model/pricing";
import { buildCustomNeonWhatsAppUrl } from "@/features/whatsapp-order/model/buildWhatsAppUrl";
import { NEON_ENGINE_CONFIG } from "@/shared/config/business";
import { useEffect, useRef, useState } from "preact/hooks";

type StudioTabId =
  | "text"
  | "font"
  | "color"
  | "borders"
  | "size"
  | "acrylic"
  | "options"
  | "buy";

const PRESET_TEXTS = [
  "Open Late",
  "C/CNEON'S",
  "LOUNGE",
  "STUDIO",
  "MINDSET",
  "CHEERS",
] as const;

const DEFAULT_SPEC: CustomNeonSpec = {
  text: "Open Late",
  fontId: "script",
  colorId: "cyan",
  sizeId: "md",
  backboardId: "contour",
  environment: "indoor",
  symbolId: "none",
  symbolColorId: "cyan",
  borderId: "none",
  tubeTech: "standard",
  dimmer: "wireless",
  mountType: "wall",
  align: "center",
};

function parseInitialSpecFromHash(): CustomNeonSpec {
  if (typeof window === "undefined" || !window.location.hash) {
    return DEFAULT_SPEC;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const rawText = params.get("text");
  const rawFont = params.get("font") as NeonFontId | null;
  const rawColor = params.get("color") as NeonColorId | null;
  const rawSize = params.get("size") as NeonSizeId | null;
  const rawBoard = params.get("board") as NeonBackboardId | null;
  const rawEnv = params.get("env") as NeonEnvironment | null;
  const rawSym = params.get("sym") as NeonSymbolId | null;
  const rawSymColor = (params.get("symColor") ||
    params.get("scolor")) as NeonColorId | null;
  const rawBorder = params.get("border") as NeonBorderId | null;
  const rawTech = params.get("tech") as NeonTubeTechId | null;

  return {
    text:
      rawText && rawText.trim().length > 0
        ? rawText.slice(0, 30)
        : DEFAULT_SPEC.text,
    fontId: rawFont && rawFont in NEON_FONTS ? rawFont : DEFAULT_SPEC.fontId,
    colorId:
      rawColor && rawColor in NEON_COLORS ? rawColor : DEFAULT_SPEC.colorId,
    sizeId: rawSize && rawSize in NEON_SIZES ? rawSize : DEFAULT_SPEC.sizeId,
    backboardId:
      rawBoard && rawBoard in NEON_BACKBOARDS
        ? rawBoard
        : DEFAULT_SPEC.backboardId,
    environment:
      rawEnv === "indoor" || rawEnv === "outdoor"
        ? rawEnv
        : DEFAULT_SPEC.environment,
    symbolId: rawSym && rawSym in NEON_SYMBOLS ? rawSym : DEFAULT_SPEC.symbolId,
    symbolColorId:
      rawSymColor && rawSymColor in NEON_COLORS
        ? rawSymColor
        : DEFAULT_SPEC.symbolColorId,
    borderId:
      rawBorder && rawBorder in NEON_BORDERS
        ? rawBorder
        : DEFAULT_SPEC.borderId,
    tubeTech:
      rawTech && rawTech in NEON_TUBE_TECHS ? rawTech : DEFAULT_SPEC.tubeTech,
    dimmer: DEFAULT_SPEC.dimmer,
    mountType: DEFAULT_SPEC.mountType,
    align: DEFAULT_SPEC.align,
  };
}

export default function NeonStudio() {
  const [spec, setSpec] = useState<CustomNeonSpec>(DEFAULT_SPEC);
  const [history, setHistory] = useState<CustomNeonSpec[]>([DEFAULT_SPEC]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<StudioTabId>("text");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [colorTarget, setColorTarget] = useState<"text" | "symbol">("text");
  const [isLit, setIsLit] = useState<boolean>(true);
  const [igniteTick, setIgniteTick] = useState<number>(1);
  const [sceneBg, setSceneBg] = useState<"blueprint" | "brick" | "concrete">(
    "blueprint",
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (window.location.hash) {
      const fromHash = parseInitialSpecFromHash();
      setSpec(fromHash);
      setHistory([fromHash]);
      setHistoryIndex(0);
    }
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const estimate = calculateNeonPrice(spec);
  const activeColor = NEON_COLORS[spec.colorId];
  const activeSymbolId: NeonSymbolId = spec.symbolId || "none";
  const activeSymbol = NEON_SYMBOLS[activeSymbolId];
  const activeSymbolColor =
    NEON_COLORS[spec.symbolColorId || spec.colorId] || activeColor;
  const activeFont = NEON_FONTS[spec.fontId];
  const activeBackboard = NEON_BACKBOARDS[spec.backboardId];
  const activeBorderId: NeonBorderId = spec.borderId || "none";
  const activeBorder = NEON_BORDERS[activeBorderId];
  const activeTechId: NeonTubeTechId = spec.tubeTech || "standard";

  const rawDisplay = spec.text.trim().length > 0 ? spec.text : "Open Late";
  const formattedText = activeFont.uppercase
    ? rawDisplay.toLocaleUpperCase("tr-TR")
    : rawDisplay;

  function syncUrlHash(next: CustomNeonSpec) {
    if (typeof window === "undefined") return;
    if (next.colorId) {
      const c = NEON_COLORS[next.colorId];
      document.documentElement.style.setProperty("--neon-color", c.hex);
      document.documentElement.style.setProperty("--neon-rgb", c.glowRgb);
    }
    const hashParams = new URLSearchParams({
      text: next.text,
      font: next.fontId,
      color: next.colorId,
      size: next.sizeId,
      board: next.backboardId,
      env: next.environment,
      sym: next.symbolId || "none",
      symColor: next.symbolColorId || next.colorId,
      border: next.borderId || "none",
      tech: next.tubeTech || "standard",
    });
    window.history.replaceState(null, "", `#${hashParams.toString()}`);
  }

  function updateSpec(
    partial: Partial<CustomNeonSpec>,
    recordHistory = true,
    debounceEffect = false,
  ) {
    const next: CustomNeonSpec = { ...spec, ...partial };
    setSpec(next);

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const commitSideEffects = () => {
      syncUrlHash(next);
      if (recordHistory) {
        setHistory((prevHist) => {
          const sliced = prevHist.slice(0, historyIndex + 1);
          const nextHist = [...sliced, next].slice(-25);
          setHistoryIndex(nextHist.length - 1);
          return nextHist;
        });
      }
    };

    if (debounceEffect && typeof window !== "undefined") {
      debounceRef.current = window.setTimeout(commitSideEffects, 180);
    } else {
      commitSideEffects();
    }
  }

  function handleUndo() {
    if (historyIndex <= 0) return;
    const prevIdx = historyIndex - 1;
    const prevSpec = history[prevIdx];
    if (!prevSpec) return;
    setHistoryIndex(prevIdx);
    setSpec(prevSpec);
    syncUrlHash(prevSpec);
  }

  function handleRedo() {
    if (historyIndex >= history.length - 1) return;
    const nextIdx = historyIndex + 1;
    const nextSpec = history[nextIdx];
    if (!nextSpec) return;
    setHistoryIndex(nextIdx);
    setSpec(nextSpec);
    syncUrlHash(nextSpec);
  }

  function handleTogglePower() {
    const nextLit = !isLit;
    setIsLit(nextLit);
    if (nextLit) {
      setIgniteTick((t) => t + 1);
    }
  }

  async function handleCopyShareUrl() {
    if (typeof window === "undefined") return;
    syncUrlHash(spec);
    const shareUrl = window.location.href;
    await navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  }

  const [isOrdering, setIsOrdering] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  function generatePaftaDataUrl(): string | null {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (isLit) {
      const grad = ctx.createRadialGradient(800, 430, 30, 800, 430, 520);
      grad.addColorStop(0, `rgba(${activeColor.glowRgb}, 0.42)`);
      grad.addColorStop(0.5, `rgba(${activeColor.glowRgb}, 0.14)`);
      grad.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = activeColor.hex;
    ctx.font = "700 28px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TEKNİK ÜRETİM PAFTASI · C/CNEON'S GLOW", 80, 85);
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "400 17px monospace";
    ctx.fillText(
      "EL İŞÇİLİĞİ SİLİKON NEON · 4MM CNC AKRİLİK TABAN · 12V DC CE SERTİFİKALI",
      80,
      118,
    );

    if (activeBorderId === "heart") {
      ctx.save();
      ctx.translate(800, 430);
      const scaleX = 4.8;
      const scaleY = 3.6;
      ctx.scale(scaleX, scaleY);
      ctx.beginPath();
      // Centered heart path (-50 to +50 range)
      ctx.moveTo(0, 38);
      ctx.bezierCurveTo(-28, 16, -46, -2, -46, -22);
      ctx.bezierCurveTo(-46, -38, -34, -46, -20, -46);
      ctx.bezierCurveTo(-11, -46, -4, -41, 0, -34);
      ctx.bezierCurveTo(4, -41, 11, -46, 20, -46);
      ctx.bezierCurveTo(34, -46, 46, -38, 46, -22);
      ctx.bezierCurveTo(46, -2, 28, 16, 0, 38);
      ctx.closePath();
      ctx.lineWidth = 1.2;
      if (isLit) {
        ctx.strokeStyle = activeColor.hex;
        ctx.shadowColor = activeColor.hex;
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.strokeStyle = "#FFFFFF";
        ctx.shadowBlur = 4;
        ctx.stroke();
      } else {
        ctx.strokeStyle = activeColor.unlitHex;
        ctx.stroke();
      }
      ctx.restore();
    } else if (activeBorderId !== "none") {
      ctx.save();
      ctx.beginPath();
      const padX = 260;
      const padY = 130;
      const rx = 800 - padX;
      const ry = 430 - padY;
      const rw = padX * 2;
      const rh = padY * 2;
      const radius =
        activeBorderId === "pill" || activeBorderId === "circle" ? 60 : 16;
      ctx.roundRect(rx, ry, rw, rh, radius);
      ctx.lineWidth = 4;
      if (activeBorderId === "ticket") {
        ctx.setLineDash([12, 10]);
      }
      if (isLit) {
        ctx.strokeStyle = activeColor.hex;
        ctx.shadowColor = activeColor.hex;
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.strokeStyle = "#FFFFFF";
        ctx.shadowBlur = 5;
        ctx.stroke();
      } else {
        ctx.strokeStyle = activeColor.unlitHex;
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 104px ${activeFont.cssFamily}`;
    const displayFull =
      activeSymbolId !== "none"
        ? `${formattedText} ${activeSymbol.glyph}`
        : formattedText;

    if (isLit) {
      ctx.shadowColor = activeColor.hex;
      ctx.shadowBlur = 65;
      ctx.fillStyle = activeColor.hex;
      ctx.fillText(displayFull, 800, 430);

      ctx.shadowBlur = 26;
      ctx.fillText(displayFull, 800, 430);

      ctx.shadowBlur = 6;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(displayFull, 800, 430);
    } else {
      ctx.fillStyle = activeColor.unlitHex;
      ctx.fillText(displayFull, 800, 430);
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fillStyle = "#0A0A0E";
    ctx.fillRect(80, 820, 1440, 110);
    ctx.strokeRect(80, 820, 1440, 110);

    const cols = [
      { title: "TABELA METNİ", val: formattedText.slice(0, 18) },
      {
        title: "AKRİLİK ÖLÇÜ",
        val: `${estimate.widthCm} × ${estimate.heightCm} cm`,
      },
      { title: "TOPLAM METRAJ", val: `~${estimate.neonLengthMeters} m` },
      {
        title: "GÜÇ / TRAFO",
        val: `${estimate.powerWatts} W (${estimate.recommendedAmps}A)`,
      },
      {
        title: "TAHMİNİ ARALIK",
        val: `${estimate.minPrice.toLocaleString("tr-TR")} - ${estimate.maxPrice.toLocaleString("tr-TR")} ₺`,
      },
      { title: "ÜRETİCİ ATÖLYE", val: "C/CNEON'S GLOW" },
    ];

    cols.forEach((col, i) => {
      const x = 110 + i * 238;
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = "600 12px monospace";
      ctx.textAlign = "left";
      ctx.fillText(col.title, x, 858);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "700 20px monospace";
      ctx.fillText(col.val, x, 895);
    });

    return canvas.toDataURL("image/png");
  }

  async function handleOrderClick() {
    if (isOrdering) return;
    setIsOrdering(true);
    setOrderStatus("Teknik pafta hazırlanıyor...");

    try {
      syncUrlHash(spec);
      const liveUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      const dataUrl = generatePaftaDataUrl();

      let imageUrl: string | undefined = undefined;

      if (dataUrl) {
        setOrderStatus("Görsel buluta aktarılıyor...");
        const fd = new FormData();
        fd.append("file", dataUrl);
        fd.append("upload_preset", "ccneons");

        const uploadRes = await fetch(
          "https://api.cloudinary.com/v1_1/ujxsaiez/image/upload",
          {
            method: "POST",
            body: fd,
          },
        );

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.secure_url || uploadData.url;
        }
      }

      setOrderStatus("WhatsApp hazırlanıyor...");
      const finalUrl = buildCustomNeonWhatsAppUrl(spec, estimate, {
        imageUrl,
        liveUrl,
      });

      if (typeof window !== "undefined") {
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Order dispatch error:", err);
      // Fallback direct WhatsApp without image
      const fallbackUrl = buildCustomNeonWhatsAppUrl(spec, estimate);
      if (typeof window !== "undefined") {
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setTimeout(() => {
        setIsOrdering(false);
        setOrderStatus(null);
      }, 1500);
    }
  }

  function handleExportPng() {
    const dataUrl = generatePaftaDataUrl();
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = `ccneons-glow-pafta-${rawDisplay.toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, "-")}.png`;
    link.href = dataUrl;
    link.click();
  }

  const isBrightTech = activeTechId === "luminex";
  const tubeShadow = isLit
    ? `0 0 ${isBrightTech ? "5px" : "4px"} #FFFFFF, 0 0 ${isBrightTech ? "22px" : "18px"} currentColor, 0 0 ${isBrightTech ? "46px" : "36px"} currentColor, 0 0 ${isBrightTech ? "90px" : "70px"} rgba(${activeColor.glowRgb}, 0.58)`
    : "0 1px 0 rgba(255,255,255,0.14), 0 4px 10px rgba(0,0,0,0.85)";

  const hasExplicitFrame =
    spec.backboardId !== "contour" || activeBorderId !== "none";

  const backboardShapeClass =
    spec.backboardId === "rectangle"
      ? "rounded-xl border border-white/20 bg-[#0A0A0E]/65 px-8 sm:px-14 py-8"
      : spec.backboardId === "canvas"
        ? "rounded-xl border border-white/30 bg-[#050505]/95 px-8 sm:px-14 py-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]"
        : activeBorderId !== "none"
          ? "rounded-xl px-8 sm:px-14 py-8"
          : "px-4 sm:px-8 py-4";

  const neonBorderStyle =
    activeBorderId !== "none"
      ? {
          borderColor: isLit ? "#FFFFFF" : activeColor.unlitHex,
          boxShadow: isLit
            ? `0 0 12px rgba(${activeColor.glowRgb}, 0.9), inset 0 0 12px rgba(${activeColor.glowRgb}, 0.65), 0 0 36px rgba(${activeColor.glowRgb}, 0.45)`
            : "none",
        }
      : {};

  const wallTextureClass =
    sceneBg === "blueprint"
      ? "bg-[#050505]"
      : sceneBg === "brick"
        ? "wall-texture-brick"
        : "wall-texture-concrete";

  const TABS: {
    id: StudioTabId;
    label: string;
    shortLabel: string;
    icon: string;
  }[] = [
    {
      id: "text",
      label: "METİN & SEMBOL",
      shortLabel: "Metin",
      icon: "M4 6h16M12 6v13",
    },
    {
      id: "font",
      label: "FONT STİLİ",
      shortLabel: "Font",
      icon: "M4 20l4-1 9.5-9.5-3-3L5 16l-1 4zM14.5 6.5l3 3",
    },
    {
      id: "color",
      label: "NEON RENGİ",
      shortLabel: "Renk",
      icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18V4a8 8 0 0 1 0 16z",
    },
    {
      id: "borders",
      label: "NEON ÇERÇEVE",
      shortLabel: "Çerçeve",
      icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z",
    },
    {
      id: "size",
      label: "BOYUT & ÖLÇEK",
      shortLabel: "Boyut",
      icon: "M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4",
    },
    {
      id: "acrylic",
      label: "AKRİLİK ZEMİN",
      shortLabel: "Pleksi",
      icon: "M4 5h16v14H4z",
    },
    {
      id: "options",
      label: "DONANIM & ORTAM",
      shortLabel: "Donanım",
      icon: "M4 8h10M18 8h2M16 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4 16h4M12 16h8M10 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
    },
    {
      id: "buy",
      label: "REÇETE & SİPARİŞ",
      shortLabel: "Reçete",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  const today = new Date();
  const shipDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const arriveDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <div
      id="neon-studio-app"
      class="flex flex-col w-full min-h-dvh lg:h-dvh bg-[#050505] text-white lg:overflow-hidden select-none"
      style={{
        "--neon-color": activeColor.hex,
        "--neon-rgb": activeColor.glowRgb,
      }}
    >
      {/* 1. TAM GENİŞLİKLİ ÜST UYGULAMA BARI (Edge-to-Edge Studio Top Bar) */}
      <header class="h-16 shrink-0 w-full border-b border-white/[0.07] bg-[#0A0A0E] px-4 sm:px-6 flex items-center justify-between gap-4 z-30">
        <div class="flex items-center gap-3 sm:gap-5">
          <a
            href="/"
            class="cursor-pointer flex items-center gap-2.5 focus-visible:outline-none"
          >
            <span class="font-display text-lg sm:text-xl font-bold tracking-tight text-white">
              C/CNEON'S GLOW
              <span class="text-xs font-mono text-white/45 ml-0.5">™</span>
            </span>
          </a>

          <span class="hidden sm:inline-block h-4 w-px bg-white/10" />

          <span
            class="font-mono text-xs font-bold uppercase tracking-widest"
            style={{ color: activeColor.hex }}
          >
            TEXT TO NEON · CANLI ATÖLYE
          </span>

          <a
            href="/"
            class="hidden md:inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/[0.07] bg-[#050505] px-2.5 py-1 font-mono text-[11px] text-white/65 transition-colors hover:border-white/20 hover:text-white"
          >
            <span>← Galeriye Dön</span>
          </a>
        </div>

        <div class="flex items-center gap-3 sm:gap-5">
          <div class="text-right">
            <span class="font-mono hidden sm:block text-[10px] uppercase tracking-wider text-white/45">
              ONLINE ATÖLYE FİYATI · KDV DAHİL
            </span>
            <output
              aria-live="polite"
              key={`${estimate.minPrice}-${estimate.maxPrice}`}
              style={{
                animationDuration: `${NEON_ENGINE_CONFIG.priceRollDurationMs}ms`,
              }}
              class="block font-mono text-base sm:text-xl font-bold text-white leading-tight"
            >
              {estimate.minPrice.toLocaleString("tr-TR")} ₺ –{" "}
              {estimate.maxPrice.toLocaleString("tr-TR")} ₺
            </output>
            <span class="font-mono hidden sm:inline-flex items-center justify-end gap-1.5 text-[11px] text-white/55">
              <span
                class="size-1.5 rounded-full"
                style={{ backgroundColor: activeColor.hex }}
              />
              <span>Canlı hesaplama · {NEON_SIZES[spec.sizeId].label}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleOrderClick}
            disabled={isOrdering}
            class="cursor-pointer whitespace-nowrap inline-flex h-10 sm:h-11 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 sm:px-6 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:border-[var(--neon-color)] hover:bg-white/[0.15] hover:shadow-[0_0_24px_rgba(var(--neon-rgb),0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isOrdering ? (
              <>
                <svg
                  class="size-4 animate-spin text-[var(--neon-color)]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>Yükleniyor</title>
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{orderStatus || "HAZIRLANIYOR..."}</span>
              </>
            ) : (
              <span>SİPARİŞ VER →</span>
            )}
          </button>
        </div>
      </header>

      {/* 2. ANA TAM EKRAN ÇALIŞMA ALANI (Sol İkon Rayı + Açılır/Kapanır Çekmece + Sağ CAD Sahnesi) */}
      <div class="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* BÖLGE A: Sol İnce Dikey İkon Rayı (68px) */}
        <nav
          aria-label="Tasarım Adımları"
          data-lenis-prevent
          class="studio-drawer-scroll flex lg:flex-col shrink-0 overflow-x-auto lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-[#050505] lg:w-[72px]"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsDrawerOpen(true);
                }}
                class={`cursor-pointer relative flex flex-col items-center justify-center gap-1.5 px-3 py-3 lg:py-4 min-w-[68px] lg:min-w-0 lg:w-full text-center transition-all duration-150 border-b border-white/[0.04] ${
                  isActive
                    ? "bg-[#0A0A0E] text-white"
                    : "text-white/50 hover:bg-white/[0.03] hover:text-white/85"
                }`}
              >
                {isActive && (
                  <span
                    class="absolute bottom-0 inset-x-0 h-0.5 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-0.5 lg:h-full"
                    style={{
                      backgroundColor: activeColor.hex,
                      boxShadow: `0 0 8px ${activeColor.hex}`,
                    }}
                  />
                )}
                <svg
                  class="size-4.5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d={tab.icon} />
                </svg>
                <span class="font-mono text-[11px] font-medium leading-none whitespace-nowrap">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>

        {/* BÖLGE B: Sol Araç Çekmecesi (380px, Daraltılabilir «) */}
        {isDrawerOpen && (
          <aside
            data-lenis-prevent
            class="w-full lg:w-[380px] xl:w-[400px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-[#0A0A0E] flex flex-col min-h-0 max-h-[62vh] lg:max-h-none"
          >
            {/* Çekmece Üst Başlığı + Daraltma («) Butonu */}
            <div class="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-white/[0.07]">
              <div>
                <h1 class="font-display text-lg font-bold uppercase tracking-tight text-white">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h1>
                <p class="mt-0.5 text-xs text-white/55 leading-relaxed">
                  {activeTab === "text" &&
                    "Tabelanızda yazacak kelimeleri girin, ardından aşağıdan sembol ekleyin."}
                  {activeTab === "font" &&
                    "Harf karakterini seçin. Tüm fontlar Türkçe karakter desteklidir."}
                  {activeTab === "color" &&
                    "Neon rengini seçin ve gündüz/gece silikon tüp görünümünü inceleyin."}
                  {activeTab === "borders" &&
                    "Yazınızı dıştan saran ışıklı bir LED neon çerçeve ekleyin."}
                  {activeTab === "size" &&
                    "Genişliği seçin ve 170 cm insan silüetiyle gerçek ölçeği kıyaslayın."}
                  {activeTab === "acrylic" &&
                    "5mm şeffaf akrilik arka plakanın CNC lazer kesim formunu seçin."}
                  {activeTab === "options" &&
                    "Tüp teknolojisini, IP67 dış mekan korumasını ve montaj tipini seçin."}
                  {activeTab === "buy" &&
                    "Manavgat atölyemizde üretilecek tam teknik reçete ve teslimat takvimi."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                title="Araç panelini daralt"
                aria-label="Araç panelini daralt"
                class="hidden lg:inline-flex cursor-pointer size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#050505] font-mono text-xs text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                «
              </button>
            </div>

            {/* Çekmece Kaydırılabilir İçerik Gövdesi */}
            <div
              key={activeTab}
              class="studio-drawer-scroll flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
            >
              {/* SEKME 1: METİN & HIZLI SEMBOLLER (Görsel 2 Düzeni) */}
              {activeTab === "text" && (
                <>
                  {/* Kart 1: Neon Yazınız + Hizalama + Karakter Sayacı */}
                  <div class="rounded-xl border border-white/[0.07] bg-[#050505] p-4 space-y-3">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <label
                          for="neon-text-input"
                          class="block text-xs font-bold uppercase tracking-wider text-white"
                        >
                          Neon Yazınız
                        </label>
                        <span class="text-[11px] text-white/50">
                          Metni yazın ve hizalamayı seçin.
                        </span>
                      </div>

                      <div class="flex flex-col items-end gap-1">
                        <span class="font-mono text-[9px] uppercase tracking-widest text-white/40">
                          HİZALAMA
                        </span>
                        <div class="flex items-center gap-1">
                          {(["left", "center", "right"] as NeonTextAlign[]).map(
                            (al) => {
                              const isCurrentAlign =
                                (spec.align || "center") === al;
                              return (
                                <button
                                  key={al}
                                  type="button"
                                  onClick={() => updateSpec({ align: al })}
                                  aria-label={`Hizala: ${al}`}
                                  class={`cursor-pointer inline-flex size-8 items-center justify-center rounded-lg border transition-colors ${
                                    isCurrentAlign
                                      ? "border-[#35E7FF] bg-[#35E7FF]/15 text-[#35E7FF]"
                                      : "border-white/10 bg-[#0A0A0E] text-white/55 hover:border-white/25 hover:text-white"
                                  }`}
                                >
                                  <svg
                                    class="size-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    aria-hidden="true"
                                  >
                                    {al === "left" && (
                                      <path d="M4 6h16M4 12h10M4 18h14" />
                                    )}
                                    {al === "center" && (
                                      <path d="M4 6h16M7 12h10M5 18h14" />
                                    )}
                                    {al === "right" && (
                                      <path d="M4 6h16M10 12h10M6 18h14" />
                                    )}
                                  </svg>
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Seçili Fontla Canlı Yazı Kutusu + Sağ Alt Karakter Sayacı */}
                    <div
                      class="relative rounded-xl border-2 bg-[#0A0A0E] px-3.5 pt-3 pb-6 transition-colors"
                      style={{
                        borderColor: activeColor.hex,
                      }}
                    >
                      <input
                        id="neon-text-input"
                        type="text"
                        maxLength={30}
                        value={spec.text}
                        onInput={(e) => {
                          const rawVal = (e.target as HTMLInputElement).value;
                          updateSpec({ text: rawVal }, true, true);
                        }}
                        placeholder="Open Late"
                        style={{ fontFamily: activeFont.cssFamily }}
                        class="w-full bg-transparent text-2xl text-white placeholder:text-white/25 focus:outline-none"
                      />
                      <span class="font-mono absolute bottom-2 right-3 text-[11px] text-white/45">
                        {spec.text.replace(/\s+/g, "").length} / 30
                      </span>
                    </div>

                    {/* Hızlı Hazır Kelimeler */}
                    <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {PRESET_TEXTS.map((sample) => (
                        <button
                          key={sample}
                          type="button"
                          onClick={() => {
                            updateSpec({ text: sample });
                            setIgniteTick((t) => t + 1);
                          }}
                          class="cursor-pointer rounded-md border border-white/10 bg-[#0A0A0E] px-2 py-1 font-mono text-[11px] text-white/70 transition-colors hover:border-white/30 hover:text-white"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Kart 2: Hızlı Semboller (6 Sütunlu Kompakt İkon Gridi — Görsel 2 Düzeni) */}
                  <div class="rounded-xl border border-white/[0.07] bg-[#050505] p-4 space-y-3">
                    <div class="flex items-center justify-between gap-2">
                      <div>
                        <span class="block text-xs font-bold uppercase tracking-wider text-white">
                          Hızlı Semboller
                        </span>
                        <span class="text-[11px] text-white/50">
                          Tabelanıza eklemek için bir sembole dokunun.
                        </span>
                      </div>
                      {activeSymbolId !== "none" && (
                        <button
                          type="button"
                          onClick={() => updateSpec({ symbolId: "none" })}
                          class="cursor-pointer rounded-md border border-white/10 bg-[#0A0A0E] px-2 py-1 font-mono text-[10px] text-[#35E7FF] hover:border-[#35E7FF]/50"
                        >
                          Kaldır ✕
                        </button>
                      )}
                    </div>

                    <div class="grid grid-cols-6 gap-1.5">
                      {(Object.keys(NEON_SYMBOLS) as NeonSymbolId[]).map(
                        (symKey) => {
                          const sym = NEON_SYMBOLS[symKey];
                          const isSelected = activeSymbolId === symKey;
                          return (
                            <button
                              key={symKey}
                              type="button"
                              title={sym.label}
                              aria-label={sym.label}
                              onClick={() => updateSpec({ symbolId: symKey })}
                              class={`cursor-pointer aspect-square flex items-center justify-center rounded-lg border transition-all duration-150 ${
                                isSelected
                                  ? "border-[#35E7FF] bg-[#35E7FF]/15 text-white shadow-[0_0_12px_rgba(53,231,255,0.25)]"
                                  : "border-white/10 bg-[#0A0A0E] text-white/70 hover:border-white/30 hover:text-white"
                              }`}
                            >
                              {symKey === "none" ? (
                                <span class="font-mono text-xs text-white/45">
                                  ✕
                                </span>
                              ) : (
                                <svg
                                  class="size-5"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="1.8"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d={sym.svgPath} />
                                </svg>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* SEKME 2: FONT STİLİ */}
              {activeTab === "font" && (
                <div class="grid grid-cols-1 gap-2.5">
                  {(Object.keys(NEON_FONTS) as NeonFontId[]).map((fontKey) => {
                    const fontItem = NEON_FONTS[fontKey];
                    const isSelected = spec.fontId === fontKey;
                    return (
                      <button
                        key={fontKey}
                        type="button"
                        onClick={() => updateSpec({ fontId: fontKey })}
                        class={`cursor-pointer flex flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all duration-150 ${
                          isSelected
                            ? "border-[#35E7FF] bg-[#050505] shadow-[0_0_18px_rgba(53,231,255,0.18)]"
                            : "border-white/[0.07] bg-[#050505]/60 hover:border-white/25"
                        }`}
                      >
                        <div class="flex w-full items-center justify-between gap-2">
                          <span class="text-xs font-bold uppercase tracking-wider text-white">
                            {fontItem.label}
                          </span>
                          <span class="font-mono rounded border border-white/10 bg-[#0A0A0E] px-2 py-0.5 text-[10px] text-[#35E7FF]">
                            {fontItem.tubeType}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: fontItem.cssFamily,
                            textShadow: isSelected
                              ? `0 0 10px rgba(${activeColor.glowRgb}, 0.8)`
                              : "none",
                          }}
                          class="mt-2 block text-2xl text-white"
                        >
                          {fontItem.uppercase
                            ? rawDisplay.toLocaleUpperCase("tr-TR")
                            : rawDisplay}
                        </span>
                        <span class="mt-1 text-xs text-white/50">
                          {fontItem.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SEKME 3: NEON RENGİ */}
              {activeTab === "color" && (
                <div class="space-y-3.5">
                  <div class="grid grid-cols-2 gap-1.5 rounded-xl border border-white/[0.07] bg-[#050505] p-1">
                    <button
                      type="button"
                      onClick={() => setColorTarget("text")}
                      class={`cursor-pointer rounded-lg py-1.5 font-mono text-xs font-bold transition-colors ${
                        colorTarget === "text"
                          ? "bg-white/15 text-white"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      Yazı ({activeColor.label.split(" ")[0]})
                    </button>
                    <button
                      type="button"
                      onClick={() => setColorTarget("symbol")}
                      class={`cursor-pointer rounded-lg py-1.5 font-mono text-xs font-bold transition-colors ${
                        colorTarget === "symbol"
                          ? "bg-white/15 text-white"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      Sembol ({activeSymbolColor.label.split(" ")[0]})
                    </button>
                  </div>

                  <div class="rounded-xl border border-white/[0.07] bg-[#050505] p-3.5 space-y-2.5">
                    <div class="flex items-center justify-between font-mono text-[11px]">
                      <span class="text-white/50 uppercase">
                        SİLİKON TÜP TESTİ
                      </span>
                      <span class="font-bold text-white">
                        {colorTarget === "symbol"
                          ? activeSymbolColor.label
                          : activeColor.label}
                      </span>
                    </div>

                    <div class="flex h-10 items-center justify-between rounded-lg bg-[#07050B] px-3 border border-white/10">
                      <span class="font-mono text-[10px] text-white/70">
                        GECE · AÇIK
                      </span>
                      <div
                        class="h-2.5 w-32 rounded-full bg-white"
                        style={{
                          boxShadow: `0 0 4px #FFF, 0 0 12px ${(colorTarget === "symbol" ? activeSymbolColor : activeColor).hex}, 0 0 24px ${(colorTarget === "symbol" ? activeSymbolColor : activeColor).hex}`,
                        }}
                      />
                    </div>

                    <div class="flex h-10 items-center justify-between rounded-lg bg-[#1c1a24] px-3 border border-white/10">
                      <span class="font-mono text-[10px] text-white/70">
                        GÜNDÜZ · KAPALI
                      </span>
                      <div
                        class="h-2.5 w-32 rounded-full border border-black/20"
                        style={{
                          backgroundColor: (colorTarget === "symbol"
                            ? activeSymbolColor
                            : activeColor
                          ).unlitHex,
                        }}
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    {(Object.keys(NEON_COLORS) as NeonColorId[]).map(
                      (colorKey) => {
                        const colorItem = NEON_COLORS[colorKey];
                        const currentTargetColor =
                          colorTarget === "symbol"
                            ? spec.symbolColorId || spec.colorId
                            : spec.colorId;
                        const isSelected = currentTargetColor === colorKey;
                        return (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => {
                              if (colorTarget === "symbol") {
                                updateSpec({ symbolColorId: colorKey });
                              } else {
                                updateSpec({ colorId: colorKey });
                              }
                            }}
                            class={`cursor-pointer flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                              isSelected
                                ? "border-white/40 bg-[#050505]"
                                : "border-white/[0.07] bg-[#050505]/60 hover:border-white/25"
                            }`}
                          >
                            <span
                              class="size-4 shrink-0 rounded-full"
                              style={{
                                backgroundColor: colorItem.hex,
                                boxShadow: `0 0 8px ${colorItem.hex}`,
                              }}
                            />
                            <span class="font-mono text-xs font-medium text-white truncate">
                              {colorItem.label}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* SEKME 4: NEON ÇERÇEVE */}
              {activeTab === "borders" && (
                <div class="grid grid-cols-2 gap-2.5">
                  {(Object.keys(NEON_BORDERS) as NeonBorderId[]).map((bKey) => {
                    const bItem = NEON_BORDERS[bKey];
                    const isSelected = activeBorderId === bKey;
                    return (
                      <button
                        key={bKey}
                        type="button"
                        onClick={() => updateSpec({ borderId: bKey })}
                        class={`cursor-pointer flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? "border-[#35E7FF] bg-[#050505]"
                            : "border-white/[0.07] bg-[#050505]/60 hover:border-white/25"
                        }`}
                      >
                        <div class="flex h-12 w-full items-center justify-center rounded-lg bg-[#0A0A0E] border border-white/[0.05] mb-2">
                          {bKey === "none" && (
                            <span class="font-mono text-[10px] text-white/50">
                              ÇERÇEVESİZ
                            </span>
                          )}
                          {bKey === "rectangle" && (
                            <div class="h-6 w-16 rounded-sm border-2 border-[#FF2E88]" />
                          )}
                          {bKey === "pill" && (
                            <div class="h-6 w-16 rounded-full border-2 border-[#35E7FF]" />
                          )}
                          {bKey === "circle" && (
                            <div class="size-8 rounded-full border-2 border-[#1CFF8A]" />
                          )}
                          {bKey === "ticket" && (
                            <div class="h-6 w-16 rounded border-2 border-dashed border-[#FFB020]" />
                          )}
                          {bKey === "heart" && (
                            <span class="text-xl text-[#FF2E88]">♡</span>
                          )}
                        </div>
                        <span class="text-xs font-bold text-white">
                          {bItem.label}
                        </span>
                        <span class="mt-0.5 text-[11px] text-white/50 leading-snug">
                          {bItem.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SEKME 5: BOYUT & ÖLÇEK */}
              {activeTab === "size" && (
                <div class="space-y-3.5">
                  <div class="grid grid-cols-2 gap-2">
                    {(Object.keys(NEON_SIZES) as NeonSizeId[]).map(
                      (sizeKey) => {
                        const sizeItem = NEON_SIZES[sizeKey];
                        const isSelected = spec.sizeId === sizeKey;
                        return (
                          <button
                            key={sizeKey}
                            type="button"
                            onClick={() => updateSpec({ sizeId: sizeKey })}
                            class={`cursor-pointer flex flex-col items-start justify-center rounded-xl border p-3 text-left transition-all ${
                              isSelected
                                ? "border-[#35E7FF] bg-[#050505]"
                                : "border-white/[0.07] bg-[#050505]/60 hover:border-white/25"
                            }`}
                          >
                            <span class="font-mono text-xs font-bold text-white">
                              {sizeItem.label}
                            </span>
                            <span class="font-mono mt-0.5 text-[11px] text-[#35E7FF]">
                              ~{sizeItem.widthCm} × {sizeItem.heightCm} cm
                            </span>
                            <span class="mt-1 text-[11px] text-white/50">
                              {sizeItem.recommendedFor}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  <div class="rounded-xl border border-white/[0.07] bg-[#050505] p-3.5 space-y-2">
                    <div class="flex items-center justify-between font-mono text-[11px] text-white/65">
                      <span>İNSAN ÖLÇEĞİ (170 CM)</span>
                      <span class="text-white font-bold">
                        {estimate.widthCm} × {estimate.heightCm} cm
                      </span>
                    </div>
                    <svg
                      role="img"
                      viewBox="0 0 360 150"
                      class="w-full h-32 rounded-lg bg-[#0A0A0E] border border-white/[0.07]"
                      aria-label="170 cm insan silüeti yanında tabela ölçeği"
                    >
                      <line
                        x1="45"
                        y1="15"
                        x2="45"
                        y2="135"
                        stroke="rgba(255,255,255,0.2)"
                        stroke-width="1"
                      />
                      <text
                        x="22"
                        y="80"
                        fill="rgba(255,255,255,0.5)"
                        font-size="9"
                        text-anchor="middle"
                      >
                        170cm
                      </text>
                      <circle
                        cx="75"
                        cy="28"
                        r="10"
                        fill="rgba(255,255,255,0.25)"
                      />
                      <path
                        d="M58 55 C58 42, 92 42, 92 55 L90 95 L84 95 L82 135 L68 135 L66 95 L60 95 Z"
                        fill="rgba(255,255,255,0.25)"
                      />
                      <rect
                        x="125"
                        y="35"
                        width={Math.round(estimate.widthCm * 1.3)}
                        height={Math.round(estimate.heightCm * 1.3)}
                        rx="6"
                        fill="rgba(53, 231, 255, 0.12)"
                        stroke={activeColor.hex}
                        stroke-width="1.5"
                      />
                      <text
                        x={125 + Math.round((estimate.widthCm * 1.3) / 2)}
                        y={39 + Math.round((estimate.heightCm * 1.3) / 2)}
                        fill="#FFFFFF"
                        font-size="11"
                        font-weight="bold"
                        text-anchor="middle"
                      >
                        {estimate.widthCm}×{estimate.heightCm}cm
                      </text>
                    </svg>
                  </div>
                </div>
              )}

              {/* SEKME 6: PLEKSİ ZEMİN */}
              {activeTab === "acrylic" && (
                <div class="space-y-2.5">
                  {(Object.keys(NEON_BACKBOARDS) as NeonBackboardId[]).map(
                    (boardKey) => {
                      const boardItem = NEON_BACKBOARDS[boardKey];
                      const isSelected = spec.backboardId === boardKey;
                      return (
                        <button
                          key={boardKey}
                          type="button"
                          onClick={() => updateSpec({ backboardId: boardKey })}
                          class={`cursor-pointer flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
                            isSelected
                              ? "border-[#35E7FF] bg-[#050505]"
                              : "border-white/[0.07] bg-[#050505]/60 hover:border-white/25"
                          }`}
                        >
                          <div class="space-y-1">
                            <span class="block text-xs font-bold text-white">
                              {boardItem.label}
                            </span>
                            <p class="text-[11px] text-white/55">
                              {boardItem.description}
                            </p>
                          </div>
                          <span class="font-mono shrink-0 text-xs font-bold text-[#35E7FF]">
                            {boardItem.extraCost === 0
                              ? "Standart"
                              : `+${boardItem.extraCost} ₺`}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              )}

              {/* SEKME 7: DONANIM & ORTAM */}
              {activeTab === "options" && (
                <div class="space-y-3">
                  <div class="space-y-2 rounded-xl border border-white/[0.07] bg-[#050505] p-3.5">
                    <span class="block text-xs font-bold uppercase tracking-wider text-white">
                      LED Tüp Teknolojisi
                    </span>
                    <div class="grid grid-cols-2 gap-2">
                      {(Object.keys(NEON_TUBE_TECHS) as NeonTubeTechId[]).map(
                        (tKey) => {
                          const tItem = NEON_TUBE_TECHS[tKey];
                          const isSelected = activeTechId === tKey;
                          return (
                            <button
                              key={tKey}
                              type="button"
                              onClick={() => updateSpec({ tubeTech: tKey })}
                              class={`cursor-pointer rounded-lg border p-2.5 text-left transition-all ${
                                isSelected
                                  ? "border-[#35E7FF] bg-[#0A0A0E]"
                                  : "border-white/10 bg-[#050505]"
                              }`}
                            >
                              <span class="font-mono block text-[10px] text-[#35E7FF]">
                                {tItem.badge}
                              </span>
                              <span class="mt-0.5 block text-xs font-bold text-white">
                                {tKey === "standard"
                                  ? "Splice™ LED"
                                  : "Luminex™ Pro"}
                              </span>
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div class="space-y-2 rounded-xl border border-white/[0.07] bg-[#050505] p-3.5">
                    <span class="block text-xs font-bold uppercase tracking-wider text-white">
                      Kullanım Ortamı
                    </span>
                    <div class="grid grid-cols-2 gap-2">
                      {(
                        [
                          {
                            id: "indoor",
                            label: "İç Mekan",
                            sub: "Ev, Ofis, Kafe",
                          },
                          {
                            id: "outdoor",
                            label: "IP67 Dış Mekan",
                            sub: "+400 ₺ Koruma",
                          },
                        ] as const
                      ).map((envItem) => (
                        <button
                          key={envItem.id}
                          type="button"
                          onClick={() =>
                            updateSpec({ environment: envItem.id })
                          }
                          class={`cursor-pointer rounded-lg border p-2.5 text-left ${
                            spec.environment === envItem.id
                              ? "border-[#FFB020] bg-[#0A0A0E]"
                              : "border-white/10 bg-[#050505]"
                          }`}
                        >
                          <span class="block text-xs font-bold text-white">
                            {envItem.label}
                          </span>
                          <span class="font-mono block text-[10px] text-white/50">
                            {envItem.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSpec({
                          dimmer:
                            spec.dimmer === "wireless"
                              ? "standard"
                              : "wireless",
                        })
                      }
                      class="cursor-pointer rounded-xl border border-white/[0.07] bg-[#050505] p-3 text-left"
                    >
                      <span class="font-mono block text-[10px] text-[#1CFF8A]">
                        PARLAKLIK
                      </span>
                      <span class="mt-0.5 block text-xs font-bold text-white">
                        {spec.dimmer === "wireless"
                          ? "RF Kumandalı ✓"
                          : "Standart Güç"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateSpec({
                          mountType:
                            spec.mountType === "hanging" ? "wall" : "hanging",
                        })
                      }
                      class="cursor-pointer rounded-xl border border-white/[0.07] bg-[#050505] p-3 text-left"
                    >
                      <span class="font-mono block text-[10px] text-[#35E7FF]">
                        MONTAJ KİTİ
                      </span>
                      <span class="mt-0.5 block text-xs font-bold text-white">
                        {spec.mountType === "hanging"
                          ? "Tavan Askı Seti"
                          : "Krom Duvar Vidası"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* SEKME 8: REÇETE & SİPARİŞ */}
              {activeTab === "buy" && (
                <div class="space-y-3.5">
                  <div class="rounded-xl border border-white/[0.07] bg-[#050505] p-3.5 space-y-2 font-mono text-xs text-white/70">
                    <div class="flex justify-between border-b border-white/[0.07] pb-1.5">
                      <span>Yazı & Font:</span>
                      <strong class="text-white">
                        "{formattedText}" · {activeFont.label}
                      </strong>
                    </div>
                    <div class="flex justify-between border-b border-white/[0.07] pb-1.5">
                      <span>Işık & Sembol:</span>
                      <strong class="text-white">
                        {activeColor.label}
                        {activeSymbolId !== "none"
                          ? ` + ${activeSymbol.label}`
                          : ""}
                      </strong>
                    </div>
                    <div class="flex justify-between border-b border-white/[0.07] pb-1.5">
                      <span>Akrilik & Çerçeve:</span>
                      <strong class="text-white">
                        {activeBackboard.label} · {activeBorder.label}
                      </strong>
                    </div>
                    <div class="flex justify-between border-b border-white/[0.07] pb-1.5">
                      <span>LED Metraj & Güç:</span>
                      <strong class="text-[#35E7FF]">
                        ~{estimate.neonLengthMeters}m · {estimate.powerWatts}W (
                        {estimate.recommendedAmps}A)
                      </strong>
                    </div>
                    <div class="flex justify-between">
                      <span>Teslimat:</span>
                      <strong class="text-[#1CFF8A]">
                        ~{fmtDate(shipDate)} – {fmtDate(arriveDate)}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOrderClick}
                    disabled={isOrdering}
                    class="cursor-pointer flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#1CFF8A]/50 bg-[#1CFF8A]/15 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#1CFF8A]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isOrdering ? (
                      <span>{orderStatus || "HAZIRLANIYOR..."}</span>
                    ) : (
                      <span>BU REÇETEYİ WHATSAPP'TAN SİPARİŞ ET →</span>
                    )}
                  </button>
                </div>
              )}

              {/* Alt Bilgi / İpucu Kutusu (Görsel 2'deki Alt İpucu Kartı) */}
              <div class="rounded-xl border border-[#35E7FF]/20 bg-[#35E7FF]/[0.05] p-3.5 flex items-start gap-2.5 text-left">
                <span class="font-mono text-sm leading-none text-[#35E7FF] mt-0.5">
                  💡
                </span>
                <p class="text-[11px] text-white/75 leading-relaxed">
                  <strong class="text-white font-semibold">
                    Atölye İpucu:
                  </strong>{" "}
                  Yazınızın fontunu sol menüdeki <strong>Font</strong>{" "}
                  sekmesinden değiştirebilirsiniz. El yazısı fontlarda büküm
                  hassasiyeti için minimum tabela ölçüsü otomatik kalibre
                  edilir.
                </p>
              </div>
            </div>
          </aside>
        )}

        {/* BÖLGE C: SAĞ TAM SAHNE ÇERÇEVELİ CAD ÖNİZLEME ALANI (Görsel 2 Mimarisi) */}
        <div
          ref={stageRef}
          class="relative flex-1 min-h-[520px] lg:min-h-0 h-full bg-[#050505] flex items-center justify-center p-3 sm:p-5 lg:p-7 overflow-hidden"
        >
          {/* Çekmece Daraltıldığında Sol Üstte Beliren "Paneli Aç »" Butonu */}
          {!isDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              class="hidden lg:inline-flex cursor-pointer absolute top-7 left-7 z-30 items-center gap-2 rounded-xl border border-white/15 bg-[#0A0A0E]/90 px-3.5 py-2 font-mono text-xs font-semibold text-white backdrop-blur-md transition-colors hover:border-white/35"
            >
              <span>» Araç Panelini Aç</span>
            </button>
          )}

          {/* ÇERÇEVELİ CAD BLUEPRINT KUTUSU (Görsel 2'deki Dış Çerçeve + Alt Antet Tablosu) */}
          <div
            class={`relative flex flex-col justify-between w-full max-w-[980px] h-full max-h-[760px] border border-[#35E7FF]/20 overflow-hidden transition-colors duration-300 ${wallTextureClass}`}
            style={
              sceneBg === "blueprint"
                ? {
                    backgroundImage:
                      "linear-gradient(rgba(53, 231, 255, 0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 231, 255, 0.045) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }
                : undefined
            }
          >
            {/* Sol Kenar CAD Satır Koordinatları (A / B / C) */}
            <div
              aria-hidden="true"
              class="pointer-events-none absolute left-3 top-28 bottom-36 hidden sm:flex flex-col justify-between font-mono text-xs font-semibold text-[#35E7FF]/40"
            >
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>

            {/* Duvara Düşen Atmosferik Neon Işık Havuzu */}
            <div
              aria-hidden="true"
              class="pointer-events-none absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: isLit ? NEON_ENGINE_CONFIG.wallSpillOpacity : 0,
                background: `radial-gradient(circle at 50% 46%, rgba(${activeColor.glowRgb}, 0.5) 0%, rgba(${activeSymbolColor.glowRgb}, 0.16) 42%, transparent 72%)`,
                mixBlendMode: "screen",
              }}
            />

            {/* CAD KUTUSU ÜST BAŞLIK: "GÖRSEL ÖNİZLEME" + Sahne Kontrolleri */}
            <div class="relative z-20 flex flex-wrap items-start justify-between gap-4 px-5 pt-5 sm:px-8 sm:pt-6">
              <div class="text-left">
                <h2
                  class="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide"
                  style={{ color: activeColor.hex }}
                >
                  GÖRSEL ÖNİZLEME
                </h2>
                <p class="mt-0.5 max-w-md text-xs text-white/60 leading-relaxed">
                  Görsel tahmin amaçlı önizlemedir. Üretim öncesi nihai
                  profesyonel CNC kesim çizimi onayınıza sunulur.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePower}
                  aria-pressed={isLit}
                  class={`cursor-pointer inline-flex h-8 items-center gap-2 rounded-lg border px-2.5 font-mono text-[11px] font-semibold transition-colors ${
                    isLit
                      ? "border-white/25 bg-[#0A0A0E]/90 text-white"
                      : "border-white/10 bg-[#0A0A0E]/90 text-white/55"
                  }`}
                >
                  <span
                    class="size-2 rounded-full"
                    style={
                      isLit
                        ? {
                            backgroundColor: activeColor.hex,
                            boxShadow: `0 0 8px ${activeColor.hex}`,
                          }
                        : { backgroundColor: "rgba(255,255,255,0.25)" }
                    }
                  />
                  <span>{isLit ? "IŞIK: AÇIK" : "IŞIK: KAPALI"}</span>
                </button>

                <div class="inline-flex rounded-lg border border-white/10 bg-[#0A0A0E]/90 p-0.5">
                  {(
                    [
                      { id: "blueprint", label: "CAD" },
                      { id: "brick", label: "Tuğla" },
                      { id: "concrete", label: "Beton" },
                    ] as const
                  ).map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setSceneBg(bg.id)}
                      class={`cursor-pointer rounded-md px-2 py-1 font-mono text-[11px] font-medium ${
                        sceneBg === bg.id
                          ? "bg-white/15 text-white"
                          : "text-white/55 hover:text-white"
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleExportPng}
                  class="cursor-pointer inline-flex h-8 items-center gap-1 rounded-lg border border-white/15 bg-[#0A0A0E]/90 px-2.5 font-mono text-[11px] font-semibold text-white hover:bg-white/15"
                >
                  <span>PNG İNDİR ↓</span>
                </button>
              </div>
            </div>

            {/* CAD KUTUSU MERKEZ: FERAH NEON ÖNİZLEME + SAĞ VE ALT ÖLÇÜ OKLARI */}
            <div class="relative z-10 my-auto flex w-full flex-col items-center justify-center px-6 py-4">
              <div class="relative flex w-full items-center justify-center">
                {/* Neon Tabela Gövdesi */}
                <div
                  key={igniteTick}
                  style={{
                    boxShadow:
                      hasExplicitFrame && isLit && activeBorderId !== "heart"
                        ? `0 20px 60px rgba(0,0,0,0.85), 0 0 42px rgba(${activeColor.glowRgb}, 0.24), inset 0 0 22px rgba(${activeColor.glowRgb}, 0.12)`
                        : undefined,
                    ...(activeBorderId !== "heart" ? neonBorderStyle : {}),
                  }}
                  class={`relative transition-all duration-300 ${backboardShapeClass} ${
                    activeBorderId !== "none" && activeBorderId !== "heart"
                      ? "border-[3px]"
                      : ""
                  } ${
                    activeBorderId === "pill" || activeBorderId === "circle"
                      ? "rounded-full"
                      : activeBorderId === "ticket"
                        ? "rounded-3xl border-dashed"
                        : ""
                  } ${isLit ? "animate-neon-ignite" : ""}`}
                >
                  {/* KALP NEON ÇERÇEVE (SVG Silhouette) */}
                  {activeBorderId === "heart" && (
                    <div
                      aria-hidden="true"
                      class="pointer-events-none absolute inset-[-35px] sm:inset-[-55px] z-0 flex items-center justify-center"
                    >
                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        class="h-full w-full"
                        style={{
                          filter: isLit
                            ? `drop-shadow(0 0 4px #FFFFFF) drop-shadow(0 0 12px ${activeColor.hex}) drop-shadow(0 0 28px rgba(${activeColor.glowRgb}, 0.75))`
                            : "none",
                        }}
                      >
                        <title>Kalp Neon Çerçeve</title>
                        <path
                          d="M 50,88 C 22,66 4,48 4,28 C 4,12 16,4 30,4 C 39,4 46,9 50,16 C 54,9 61,4 70,4 C 84,4 96,12 96,28 C 96,48 78,66 50,88 Z"
                          fill={
                            spec.backboardId === "rectangle" ||
                            spec.backboardId === "canvas"
                              ? "rgba(10, 10, 14, 0.4)"
                              : "none"
                          }
                          stroke={isLit ? "#FFFFFF" : activeColor.unlitHex}
                          stroke-width="2.5"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                  )}

                  {hasExplicitFrame && activeBorderId !== "heart" && (
                    <>
                      <span class="absolute top-3 left-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                      <span class="absolute top-3 right-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                      <span class="absolute bottom-3 left-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                      <span class="absolute bottom-3 right-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                    </>
                  )}

                  <div
                    class={`relative z-10 flex flex-wrap items-center gap-5 ${
                      spec.align === "left"
                        ? "justify-start text-left"
                        : spec.align === "right"
                          ? "justify-end text-right"
                          : "justify-center text-center"
                    }`}
                  >
                    <p
                      style={{
                        fontFamily: activeFont.cssFamily,
                        color: isLit ? activeColor.hex : activeColor.unlitHex,
                        textShadow: tubeShadow,
                        fontSize: "clamp(2.8rem, 5.8vw, 5.6rem)",
                      }}
                      class="select-none text-balance leading-tight transition-[color,text-shadow] duration-300"
                    >
                      {formattedText}
                    </p>

                    {activeSymbolId !== "none" && (
                      <svg
                        key={activeSymbolId}
                        role="img"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isLit ? "#FFFFFF" : activeSymbolColor.unlitHex}
                        stroke-width="1.9"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        style={{
                          filter: isLit
                            ? `drop-shadow(0 0 4px #FFFFFF) drop-shadow(0 0 14px ${activeSymbolColor.hex}) drop-shadow(0 0 28px ${activeSymbolColor.hex})`
                            : "none",
                        }}
                        class="size-14 sm:size-20 shrink-0 transition-all duration-300"
                        aria-label={activeSymbol.label}
                      >
                        <title>{activeSymbol.label}</title>
                        <path d={activeSymbol.svgPath} />
                      </svg>
                    )}
                  </div>
                </div>

                {/* SAĞ DİKEY YÜKSEKLİK OKU (Görsel 2'deki "25cm" Dikey Çizgi) */}
                <div
                  aria-hidden="true"
                  class="hidden sm:flex flex-col items-center ml-8 lg:ml-12 font-mono text-white"
                >
                  <span class="mb-1.5 text-xs font-bold">
                    {estimate.heightCm}cm
                  </span>
                  <div class="flex flex-col items-center h-36 sm:h-44">
                    <span class="text-xs leading-none text-white/80">↑</span>
                    <div class="w-px flex-1 bg-white/60" />
                    <span class="text-xs leading-none text-white/80">↓</span>
                  </div>
                </div>
              </div>

              {/* ALT YATAY GENİŞLİK OKU (Görsel 2'deki "77cm / acrylic size" Yatay Çizgi) */}
              <div
                aria-hidden="true"
                class="mt-6 flex w-[85%] max-w-xl items-center gap-3 font-mono text-white"
              >
                <span class="text-xs text-white/80">←</span>
                <div class="h-px flex-1 bg-white/60" />
                <div class="text-center leading-tight px-1">
                  <span class="block text-xs font-bold text-white">
                    {estimate.widthCm}cm
                  </span>
                  <span class="block text-[10px] text-white/55">
                    akrilik ölçüsü
                  </span>
                </div>
                <div class="h-px flex-1 bg-white/60" />
                <span class="text-xs text-white/80">→</span>
              </div>
            </div>

            {/* CAD KUTUSU ALT BÖLÜM: SIFIRLAMA KAPSÜLLERİ + KENARDAN KENARA 6 SÜTUNLU ANTET TABLOSU */}
            <div class="relative z-20 space-y-3">
              {/* Sıfırlama / Geri Al / İleri Al Kapsülleri */}
              <div class="flex flex-wrap items-center justify-center gap-2 px-4">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  class="cursor-pointer rounded-md border border-white/15 bg-[#0A0A0E]/90 px-3 py-1.5 font-mono text-[11px] font-semibold text-white/80 disabled:opacity-35 hover:border-white/35 hover:text-white"
                >
                  ↺ Geri Al
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  class="cursor-pointer rounded-md border border-white/15 bg-[#0A0A0E]/90 px-3 py-1.5 font-mono text-[11px] font-semibold text-white/80 disabled:opacity-35 hover:border-white/35 hover:text-white"
                >
                  ↻ İleri Al
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSpec({ colorId: "cyan", symbolColorId: "cyan" })
                  }
                  class="cursor-pointer rounded-md border border-[#35E7FF]/40 bg-[#0A0A0E]/90 px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:border-[#35E7FF]"
                >
                  ↺ Rengi Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSpec({
                      sizeId: "md",
                      backboardId: "contour",
                      borderId: "none",
                    })
                  }
                  class="cursor-pointer rounded-md border border-[#35E7FF]/40 bg-[#0A0A0E]/90 px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:border-[#35E7FF]"
                >
                  ↺ Ölçek & Boyut Sıfırla
                </button>
                <button
                  type="button"
                  onClick={() => updateSpec({ fontId: "script" })}
                  class="cursor-pointer rounded-md border border-[#35E7FF]/40 bg-[#0A0A0E]/90 px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:border-[#35E7FF]"
                >
                  ↺ Fontu Sıfırla
                </button>
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  class="cursor-pointer rounded-md border border-white/20 bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] font-semibold text-white hover:bg-white/15"
                >
                  {copiedLink ? "Link Kopyalandı ✓" : "🔗 Linki Kopyala"}
                </button>
              </div>

              {/* KENARDAN KENARA YAPIŞIK 6 SÜTUNLU CAD MÜHENDİSLİK ANTETİ (Görsel 2'deki Alt Tablo) */}
              <div class="grid grid-cols-2 sm:grid-cols-6 border-t border-[#35E7FF]/25 bg-[#050505]/95 divide-x divide-y sm:divide-y-0 divide-[#35E7FF]/20 text-left font-mono">
                <div class="px-3.5 py-2.5 sm:py-3">
                  <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                    TABELA ADI
                  </span>
                  <strong class="mt-0.5 block text-xs sm:text-sm font-bold text-white truncate">
                    {formattedText}
                  </strong>
                </div>
                <div class="px-3.5 py-2.5 sm:py-3">
                  <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                    AKRİLİK TABAN
                  </span>
                  <strong class="mt-0.5 block text-xs sm:text-sm font-bold text-white">
                    {estimate.widthCm} × {estimate.heightCm} cm
                  </strong>
                </div>
                <div class="px-3.5 py-2.5 sm:py-3">
                  <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                    TOPLAM NEON
                  </span>
                  <strong class="mt-0.5 block text-xs sm:text-sm font-bold text-white">
                    {estimate.neonLengthMeters} m
                  </strong>
                </div>
                <div class="px-3.5 py-2.5 sm:py-3">
                  <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                    GÜÇ / TRAFO
                  </span>
                  <strong class="mt-0.5 block text-xs sm:text-sm font-bold text-white">
                    {estimate.powerWatts} W
                  </strong>
                </div>
                <div class="px-3.5 py-2.5 sm:py-3">
                  <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                    TARİH
                  </span>
                  <strong class="mt-0.5 block text-xs sm:text-sm font-bold text-white">
                    {fmtDate(today)} {today.getFullYear()}
                  </strong>
                </div>
                <div class="px-3.5 py-2.5 sm:py-3">
                  <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                    ÜRETİCİ ATÖLYE
                  </span>
                  <strong class="mt-0.5 block text-xs sm:text-sm font-bold text-white truncate">
                    C/CNEON'S GLOW™
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
