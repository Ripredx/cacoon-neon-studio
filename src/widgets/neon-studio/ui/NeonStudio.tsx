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
import { BUSINESS_CONFIG, NEON_ENGINE_CONFIG } from "@/shared/config/business";
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
  "Color Your Life",
  "C/CNEON'S",
  "Open 24/7",
  "Good Vibes",
  "Mindset",
  "Cheers",
] as const;

const DEFAULT_SPEC: CustomNeonSpec = {
  text: "Color Your Life",
  fontId: "script",
  colorId: "pink",
  sizeId: "md",
  backboardId: "contour",
  environment: "indoor",
  symbolId: "cocktail",
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
  const [colorTarget, setColorTarget] = useState<"text" | "symbol">("text");
  const [isLit, setIsLit] = useState<boolean>(true);
  const [igniteTick, setIgniteTick] = useState<number>(1);
  const [sceneBg, setSceneBg] = useState<
    "blueprint" | "brick" | "obsidian" | "concrete"
  >("blueprint");
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

  // Fiyat ve Mühendislik Hesapları (derived in render)
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
  const whatsappUrl = buildCustomNeonWhatsAppUrl(spec, estimate);

  // Türkçe büyük harf kuralı: toLocaleUpperCase('tr-TR')
  const rawDisplay = spec.text.trim().length > 0 ? spec.text : "Neon Yazınız";
  const formattedText = activeFont.uppercase
    ? rawDisplay.toLocaleUpperCase("tr-TR")
    : rawDisplay;

  function syncUrlHash(next: CustomNeonSpec) {
    if (typeof window === "undefined") return;
    if (next.colorId) {
      const c = NEON_COLORS[next.colorId];
      document.documentElement.style.setProperty("--accent", c.hex);
      document.documentElement.style.setProperty("--accent-rgb", c.glowRgb);
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

  // Canvas 2D Çok Geçişli Blueprint / Teknik Pafta PNG İndirme
  function handleExportPng() {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. CAD Blueprint Koyu Gece Zemini (#0C061A)
    ctx.fillStyle = "#0B0616";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Milimetrik CAD Grid Çizgileri
    ctx.strokeStyle = "rgba(53, 231, 255, 0.06)";
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

    // 3. Duvar Işık Havuzu
    if (isLit) {
      const grad = ctx.createRadialGradient(800, 430, 30, 800, 430, 520);
      grad.addColorStop(0, `rgba(${activeColor.glowRgb}, 0.42)`);
      grad.addColorStop(0.5, `rgba(${activeColor.glowRgb}, 0.14)`);
      grad.addColorStop(1, "rgba(11, 6, 22, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 4. Üst Başlık: GÖRSEL ÖNİZLEME & TEKNİK PAFTA
    ctx.fillStyle = "#FF2E88";
    ctx.font = "700 28px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("GÖRSEL ÖNİZLEME · C/CNEON'S TEKNİK PAFTA", 80, 85);
    ctx.fillStyle = "rgba(234, 230, 242, 0.7)";
    ctx.font = "400 18px sans-serif";
    ctx.fillText(
      "Bu pafta görsel ölçek ve metraj tahmini içindir. Üretim öncesi CNC kesim onayı alınır.",
      80,
      118,
    );

    // 5. Akrilik Plaka Çizimi
    ctx.save();
    ctx.strokeStyle = isLit
      ? `rgba(${activeColor.glowRgb}, 0.55)`
      : "rgba(255, 255, 255, 0.2)";
    ctx.fillStyle = "rgba(23, 20, 31, 0.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(
      260,
      220,
      1080,
      400,
      spec.backboardId === "contour" ? 72 : 24,
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 6. Çok Katmanlı Neon Tüp ve Çekirdek
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 92px ${activeFont.cssFamily}`;
    const displayFull =
      activeSymbolId !== "none"
        ? `${formattedText} ${activeSymbol.glyph}`
        : formattedText;

    if (isLit) {
      ctx.shadowColor = activeColor.hex;
      ctx.shadowBlur = 60;
      ctx.fillStyle = activeColor.hex;
      ctx.fillText(displayFull, 800, 420);

      ctx.shadowBlur = 24;
      ctx.fillText(displayFull, 800, 420);

      ctx.shadowBlur = 6;
      ctx.fillStyle = "#FFF4F8";
      ctx.fillText(displayFull, 800, 420);
    } else {
      ctx.fillStyle = activeColor.unlitHex;
      ctx.fillText(displayFull, 800, 420);
    }
    ctx.restore();

    // 7. Alt Mühendislik Anteti (Title Block)
    ctx.strokeStyle = "rgba(53, 231, 255, 0.28)";
    ctx.fillStyle = "rgba(10, 7, 16, 0.92)";
    ctx.fillRect(80, 820, 1440, 110);
    ctx.strokeRect(80, 820, 1440, 110);

    const cols = [
      { title: "PROJE ADI", val: formattedText.slice(0, 18) },
      {
        title: "PLEKSİ ÖLÇÜSÜ",
        val: `${estimate.widthCm} × ${estimate.heightCm} cm`,
      },
      { title: "TOPLAM NEON TÜP", val: `${estimate.neonLengthMeters} m` },
      {
        title: "GÜÇ / TRAFO",
        val: `${estimate.powerWatts} W (12V ${estimate.recommendedAmps}A)`,
      },
      {
        title: "TAHMİNİ ARALIK",
        val: `${estimate.minPrice.toLocaleString("tr-TR")} - ${estimate.maxPrice.toLocaleString("tr-TR")} ₺`,
      },
      { title: "ATÖLYE", val: "C/CNEON'S MANAVGAT" },
    ];

    cols.forEach((col, i) => {
      const x = 110 + i * 238;
      ctx.fillStyle = "#35E7FF";
      ctx.font = "700 13px monospace";
      ctx.textAlign = "left";
      ctx.fillText(col.title, x, 858);
      ctx.fillStyle = "#FFF4F8";
      ctx.font = "700 22px sans-serif";
      ctx.fillText(col.val, x, 895);
    });

    const link = document.createElement("a");
    link.download = `ccneons-pafta-${rawDisplay.toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // Sıfır Offsetli 3 Katmanlı Gerçekçi Neon Gölgesi
  const isBrightTech = activeTechId === "luminex";
  const tubeShadow = isLit
    ? `0 0 ${isBrightTech ? "4px" : "2px"} #FFF4F8, 0 0 ${isBrightTech ? "16px" : "11px"} rgba(${activeColor.glowRgb}, 0.98), 0 0 ${isBrightTech ? "38px" : "28px"} rgba(${activeColor.glowRgb}, 0.72), 0 0 ${isBrightTech ? "82px" : "62px"} rgba(${activeColor.glowRgb}, 0.44)`
    : "0 1px 0 rgba(255,255,255,0.14), 0 4px 10px rgba(0,0,0,0.85)";

  const backboardShapeClass =
    spec.backboardId === "rectangle"
      ? "rounded-2xl border-2 border-white/30 bg-[#17141F]/60 px-7 sm:px-11 py-8"
      : spec.backboardId === "canvas"
        ? "rounded-xl border-2 border-white/40 bg-[#0A0710]/95 px-7 sm:px-11 py-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]"
        : "rounded-[3rem] border border-white/20 bg-white/[0.03] px-7 sm:px-12 py-8";

  // Neon Çerçeve (Border) Sınıfları
  const neonBorderStyle =
    activeBorderId !== "none"
      ? {
          borderColor: isLit ? "#FFF4F8" : activeColor.unlitHex,
          boxShadow: isLit
            ? `0 0 12px rgba(${activeColor.glowRgb}, 0.9), inset 0 0 12px rgba(${activeColor.glowRgb}, 0.65), 0 0 36px rgba(${activeColor.glowRgb}, 0.45)`
            : "none",
        }
      : {};

  const wallTextureClass =
    sceneBg === "blueprint"
      ? "bg-[#0D061C]"
      : sceneBg === "brick"
        ? "wall-texture-brick"
        : sceneBg === "concrete"
          ? "wall-texture-concrete"
          : "wall-texture-obsidian";

  const signScalePercent = Math.min(
    92,
    Math.max(72, Math.round((estimate.widthCm / 120) * 100)),
  );

  const TABS: {
    id: StudioTabId;
    label: string;
    shortLabel: string;
    icon: string;
  }[] = [
    {
      id: "text",
      label: "Metin & Sembol",
      shortLabel: "Metin",
      icon: "M4 6h16M12 6v13",
    },
    {
      id: "font",
      label: "Font Stili",
      shortLabel: "Font",
      icon: "M4 20l4-1 9.5-9.5-3-3L5 16l-1 4zM14.5 6.5l3 3",
    },
    {
      id: "color",
      label: "Neon Rengi",
      shortLabel: "Renk",
      icon: "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18V4a8 8 0 0 1 0 16z",
    },
    {
      id: "borders",
      label: "Çerçeve",
      shortLabel: "Çerçeve",
      icon: "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z",
    },
    {
      id: "size",
      label: "Ölçü & Boyut",
      shortLabel: "Boyut",
      icon: "M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4",
    },
    {
      id: "acrylic",
      label: "Pleksi Zemin",
      shortLabel: "Pleksi",
      icon: "M4 5h16v14H4z",
    },
    {
      id: "options",
      label: "Donanım",
      shortLabel: "Donanım",
      icon: "M4 8h10M18 8h2M16 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM4 16h4M12 16h8M10 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
    },
    {
      id: "buy",
      label: "Teknik Reçete & Sipariş",
      shortLabel: "Sipariş",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  // Teslimat Takvimi Hesaplama (Manavgat Atölye Üretimi: Bugün Sipariş -> +3 Gün Üretim -> +3 Gün Kargo)
  const today = new Date();
  const shipDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const arriveDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });

  return (
    <div
      id="neon-studio-app"
      class="rounded-3xl border border-white/15 bg-[#120D1D] shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden"
      style={{
        "--accent": activeColor.hex,
        "--accent-rgb": activeColor.glowRgb,
      }}
    >
      {/* ÜST UYGULAMA BARI (Kings of Neon Tarzı Canlı Fiyat, Güç Özeti ve Hızlı Sipariş CTA) */}
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#0A0710]/95 px-5 py-3.5 sm:px-7">
        <div class="flex items-center gap-3">
          <span class="inline-flex size-3 rounded-full bg-[#FF2E88] shadow-[0_0_12px_#FF2E88]" />
          <div>
            <span class="font-display text-sm sm:text-base font-bold tracking-tight text-[#FFF4F8]">
              C/CNEON'S · TEXT TO NEON™ PRO
            </span>
            <span class="hidden sm:inline-block ml-3 rounded-md border border-[#35E7FF]/30 bg-[#35E7FF]/10 px-2 py-0.5 text-[13px] font-semibold text-[#35E7FF]">
              CAD Mühendislik Motoru v2
            </span>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-4 sm:gap-6">
          <div class="text-right">
            <span class="block text-[13px] font-medium text-[#EAE6F2]">
              ATÖLYE TAHMİNİ ÜRETİM ARALIĞI
            </span>
            <output
              aria-live="polite"
              key={`${estimate.minPrice}-${estimate.maxPrice}`}
              style={{
                animationDuration: `${NEON_ENGINE_CONFIG.priceRollDurationMs}ms`,
              }}
              class="block font-display text-xl sm:text-2xl font-bold text-[#FFF4F8] tabular-nums"
            >
              {estimate.minPrice.toLocaleString("tr-TR")} ₺ –{" "}
              {estimate.maxPrice.toLocaleString("tr-TR")} ₺
            </output>
            <span class="block text-[13px] font-semibold text-[#1CFF8A] whitespace-nowrap">
              12V Adaptör Dahil · Ücretsiz Montaj Seti
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="cursor-pointer whitespace-nowrap inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#35E7FF] px-5 py-2.5 text-sm font-bold text-[#0A0710] shadow-[0_0_25px_rgba(255,46,136,0.4)] transition-transform duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF4F8]"
          >
            <span>WhatsApp'tan Net Fiyat Al</span>
          </a>
        </div>
      </div>

      {/* ANA 3 BÖLGELİ UYGULAMA KABUĞU (Sol İkon Rayı + Kontrol Çekmecesi + Sağ CAD Blueprint Sahnesi) */}
      <div class="grid grid-cols-1 lg:grid-cols-12">
        {/* BÖLGE 1 & 2: Sol İkon Rayı + Sekme Kontrol Çekmecesi (5 Sütun) */}
        <div class="lg:col-span-5 flex flex-col sm:flex-row border-b lg:border-b-0 lg:border-r border-white/10 bg-[#17141F]">
          {/* Sol 8 Adımlı İkon Rayı */}
          <nav
            aria-label="Tasarım Adımları"
            data-lenis-prevent
            class="studio-drawer-scroll flex sm:flex-col overflow-x-auto sm:overflow-visible border-b sm:border-b-0 sm:border-r border-white/10 bg-[#0A0710] p-1.5 sm:p-2 gap-1 sm:w-22 shrink-0"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  class={`cursor-pointer flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2.5 min-h-14 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF] ${
                    isActive
                      ? "bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/50 shadow-[0_0_16px_rgba(255,46,136,0.2)]"
                      : "text-[#EAE6F2]/75 hover:bg-white/5 hover:text-[#FFF4F8] border border-transparent"
                  }`}
                >
                  <svg
                    class="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d={tab.icon} />
                  </svg>
                  <span class="text-[13px] font-semibold leading-none whitespace-nowrap">
                    {tab.shortLabel}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Aktif Sekme Kontrol Çekmecesi (Lenis'ten Bağımsız İzole Kaydırma + 160ms GPU Sekme Geçişi) */}
          <div
            key={activeTab}
            data-lenis-prevent
            class="studio-drawer-scroll animate-studio-tab flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[680px]"
          >
            {/* SEKME 1: METİN & 12 HIZLI NEON SEMBOLÜ */}
            {activeTab === "text" && (
              <div class="space-y-5">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    1. METİN & NEON SEMBOL
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Tabelanızda yazacak metni girin ve yanına tek tıkla ayrı
                    renkte parlayan neon ikon ekleyin.
                  </p>
                </div>

                {/* Metin Kutusu + Hizalama */}
                <div class="space-y-2 rounded-2xl border border-white/10 bg-[#0A0710] p-4">
                  <div class="flex items-center justify-between gap-2">
                    <label
                      for="neon-text-input"
                      class="text-sm font-bold text-[#FFF4F8]"
                    >
                      Neon Yazınız
                    </label>
                    <div class="flex items-center gap-1.5">
                      {(["left", "center", "right"] as NeonTextAlign[]).map(
                        (al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => updateSpec({ align: al })}
                            aria-label={`Hizala: ${al}`}
                            class={`cursor-pointer rounded-lg border px-2.5 py-1 text-[13px] font-semibold ${
                              (spec.align || "center") === al
                                ? "border-[#35E7FF] bg-[#35E7FF]/15 text-[#35E7FF]"
                                : "border-white/10 text-[#EAE6F2] hover:border-white/25"
                            }`}
                          >
                            {al === "left"
                              ? "Sol"
                              : al === "center"
                                ? "Orta"
                                : "Sağ"}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <input
                    id="neon-text-input"
                    type="text"
                    maxLength={30}
                    value={spec.text}
                    onInput={(e) => {
                      const rawVal = (e.target as HTMLInputElement).value;
                      updateSpec({ text: rawVal }, true, true);
                    }}
                    placeholder="Örn: Cheers, C/CNEON'S, Open 24/7"
                    class="w-full min-h-12 rounded-xl border-2 border-[#FF2E88]/60 bg-[#17141F] px-4 py-3 text-lg font-semibold text-[#FFF4F8] placeholder:text-[#EAE6F2]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35E7FF]"
                  />

                  <div class="flex items-center justify-between text-[13px] text-[#EAE6F2]">
                    <span>Hazır şablonlar:</span>
                    <span class="tabular-nums font-semibold text-[#35E7FF]">
                      {spec.text.replace(/\s+/g, "").length} / 30 harf
                    </span>
                  </div>

                  <div class="flex flex-wrap gap-1.5 pt-1">
                    {PRESET_TEXTS.map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => {
                          updateSpec({ text: sample });
                          setIgniteTick((t) => t + 1);
                        }}
                        class="cursor-pointer rounded-lg border border-white/15 bg-[#17141F] px-2.5 py-1 text-[13px] font-semibold text-[#EAE6F2] hover:border-[#35E7FF] hover:text-[#FFF4F8]"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hızlı Neon Sembolleri (Quick Symbols — Kings of Neon Özelliği) */}
                <div class="space-y-3 rounded-2xl border border-white/10 bg-[#0A0710] p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-bold text-[#FFF4F8]">
                      Hızlı Neon Sembolleri (Quick Symbols)
                    </span>
                    <span class="text-[13px] font-semibold text-[#35E7FF]">
                      {activeSymbol.label}
                    </span>
                  </div>
                  <p class="text-[13px] text-[#EAE6F2]">
                    Yazınızın sağ tarafına bağımsız renkte parlayan bir neon
                    sembol ekleyin:
                  </p>

                  <div class="grid grid-cols-4 gap-2">
                    {(Object.keys(NEON_SYMBOLS) as NeonSymbolId[]).map(
                      (symKey) => {
                        const sym = NEON_SYMBOLS[symKey];
                        const isSelected = activeSymbolId === symKey;
                        return (
                          <button
                            key={symKey}
                            type="button"
                            onClick={() => updateSpec({ symbolId: symKey })}
                            class={`cursor-pointer flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 min-h-16 transition-colors duration-150 ${
                              isSelected
                                ? "border-[#35E7FF] bg-[#35E7FF]/15 text-[#FFF4F8] shadow-[0_0_14px_rgba(53,231,255,0.25)]"
                                : "border-white/10 bg-[#17141F] text-[#EAE6F2] hover:border-white/30"
                            }`}
                          >
                            {symKey === "none" ? (
                              <span class="text-lg font-bold text-[#EAE6F2]/60">
                                ✕
                              </span>
                            ) : (
                              <svg
                                class="size-6 text-[#35E7FF]"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                              >
                                <path d={sym.svgPath} />
                              </svg>
                            )}
                            <span class="text-[13px] font-medium whitespace-nowrap">
                              {sym.label.split(" ")[0]}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SEKME 2: FONT STİLİ (Single vs Double Neon) */}
            {activeTab === "font" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    2. FONT & TÜP KARAKTERİ
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Single Neon ince ve akıcıdır; Double Neon çift hatlı ve
                    yüksek kontrastlıdır. Tüm fontlar Türkçe (İ, Ğ, Ş, Ç, Ö, Ü)
                    desteklidir.
                  </p>
                </div>

                <div class="grid grid-cols-1 gap-3">
                  {(Object.keys(NEON_FONTS) as NeonFontId[]).map((fontKey) => {
                    const fontItem = NEON_FONTS[fontKey];
                    const isSelected = spec.fontId === fontKey;
                    return (
                      <button
                        key={fontKey}
                        type="button"
                        onClick={() => updateSpec({ fontId: fontKey })}
                        class={`cursor-pointer flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-150 ${
                          isSelected
                            ? "border-[#35E7FF] bg-[#0A0710] shadow-[0_0_20px_rgba(53,231,255,0.2)]"
                            : "border-white/10 bg-[#0A0710]/60 hover:border-white/30"
                        }`}
                      >
                        <div class="flex w-full items-center justify-between gap-2">
                          <span class="text-sm font-bold text-[#FFF4F8]">
                            {fontItem.label}
                          </span>
                          <span class="rounded-md border border-white/15 bg-[#17141F] px-2 py-0.5 text-[13px] font-semibold text-[#35E7FF]">
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
                          class="mt-2 block text-2xl sm:text-3xl text-[#FFF4F8]"
                        >
                          {fontItem.uppercase
                            ? rawDisplay.toLocaleUpperCase("tr-TR")
                            : rawDisplay}
                        </span>
                        <span class="mt-1.5 text-[13px] text-[#EAE6F2]">
                          {fontItem.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SEKME 3: NEON RENGİ + LIT / UNLIT (GECE AÇIK vs GÜNDÜZ KAPALI SİLİKON ÖNİZLEMESİ) */}
            {activeTab === "color" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    3. NEON RENGİ & SİLİKON CEKET
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Yazı ve sembol rengini ayrı ayrı seçebilir, silikon tüpün
                    gündüz kapalıyken nasıl göründüğünü inceleyebilirsiniz.
                  </p>
                </div>

                {/* Hedef Seçici: Yazı Rengi vs Sembol Rengi (Kings of Neon Multi-Color) */}
                <div class="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#0A0710] p-1.5">
                  <button
                    type="button"
                    onClick={() => setColorTarget("text")}
                    class={`cursor-pointer rounded-lg py-2 text-[13px] font-bold transition-colors ${
                      colorTarget === "text"
                        ? "bg-[#FF2E88] text-[#0A0710]"
                        : "text-[#EAE6F2] hover:text-[#FFF4F8]"
                    }`}
                  >
                    Yazı Rengi ({activeColor.label.split(" ")[0]})
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorTarget("symbol")}
                    class={`cursor-pointer rounded-lg py-2 text-[13px] font-bold transition-colors ${
                      colorTarget === "symbol"
                        ? "bg-[#35E7FF] text-[#0A0710]"
                        : "text-[#EAE6F2] hover:text-[#FFF4F8]"
                    }`}
                  >
                    Sembol Rengi ({activeSymbolColor.label.split(" ")[0]})
                  </button>
                </div>

                {/* LIT vs UNLIT (Gece Açık vs Gündüz Kapalı) Gerçek Silikon Tüp Karşılaştırma Kartı */}
                <div class="rounded-2xl border border-white/15 bg-[#0A0710] p-4 space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-[13px] font-bold uppercase tracking-wider text-[#35E7FF]">
                      SİLİKON TÜP ÖRNEĞİ
                    </span>
                    <span class="text-sm font-bold text-[#FFF4F8]">
                      {colorTarget === "symbol"
                        ? activeSymbolColor.label
                        : activeColor.label}
                    </span>
                  </div>

                  {/* Lit (Açık) Tüp Barı */}
                  <div class="relative flex h-12 items-center justify-between rounded-xl bg-[#07050B] px-4 border border-white/10 overflow-hidden">
                    <span class="rounded bg-white/10 px-2 py-0.5 text-[13px] font-bold text-[#FFF4F8] z-10">
                      GECE · AÇIK
                    </span>
                    <div
                      class="h-3 w-36 sm:w-44 rounded-full bg-[#FFF4F8]"
                      style={{
                        boxShadow: `0 0 4px #FFF4F8, 0 0 14px ${(colorTarget === "symbol" ? activeSymbolColor : activeColor).hex}, 0 0 28px ${(colorTarget === "symbol" ? activeSymbolColor : activeColor).hex}`,
                      }}
                    />
                  </div>

                  {/* Unlit (Gündüz Kapalı) Tüp Barı */}
                  <div class="relative flex h-12 items-center justify-between rounded-xl bg-[#2B2635] px-4 border border-white/15 overflow-hidden">
                    <span class="rounded bg-black/40 px-2 py-0.5 text-[13px] font-bold text-[#EAE6F2] z-10">
                      GÜNDÜZ · KAPALI
                    </span>
                    <div
                      class="h-3 w-36 sm:w-44 rounded-full shadow-inner border border-black/20"
                      style={{
                        backgroundColor: (colorTarget === "symbol"
                          ? activeSymbolColor
                          : activeColor
                        ).unlitHex,
                      }}
                    />
                  </div>

                  <p class="text-[13px] text-[#EAE6F2] leading-relaxed">
                    {
                      (colorTarget === "symbol"
                        ? activeSymbolColor
                        : activeColor
                      ).unlitDescription
                    }
                  </p>
                </div>

                {/* 7 Renk Seçim Gridi */}
                <div class="grid grid-cols-2 gap-2.5">
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
                          class={`cursor-pointer flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-2 text-left transition-all duration-150 ${
                            isSelected
                              ? "border-[#FFF4F8] bg-[#0A0710] shadow-[0_0_16px_rgba(255,255,255,0.15)]"
                              : "border-white/10 bg-[#0A0710]/70 hover:border-white/30"
                          }`}
                        >
                          <span
                            class="size-5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: colorItem.hex,
                              boxShadow: `0 0 10px ${colorItem.hex}`,
                            }}
                          />
                          <span class="text-sm font-semibold text-[#FFF4F8] whitespace-nowrap">
                            {colorItem.label}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* SEKME 4: NEON ÇERÇEVE (BORDERS) */}
            {activeTab === "borders" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    4. NEON ÇERÇEVE (BORDERS)
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Yazınızı dıştan saran ışıklı bir LED neon çerçeve ekleyin.
                    Kafe, bar ve vitrin tabelalarında odak etkisi yaratır.
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  {(Object.keys(NEON_BORDERS) as NeonBorderId[]).map((bKey) => {
                    const bItem = NEON_BORDERS[bKey];
                    const isSelected = activeBorderId === bKey;
                    return (
                      <button
                        key={bKey}
                        type="button"
                        onClick={() => updateSpec({ borderId: bKey })}
                        class={`cursor-pointer flex flex-col items-start justify-between rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-[#35E7FF] bg-[#0A0710] shadow-[0_0_18px_rgba(53,231,255,0.2)]"
                            : "border-white/10 bg-[#0A0710]/60 hover:border-white/30"
                        }`}
                      >
                        <div class="flex h-14 w-full items-center justify-center rounded-xl bg-[#140D26] border border-white/5 mb-2.5">
                          {bKey === "none" && (
                            <span class="text-xs font-bold text-[#EAE6F2]/60">
                              SADECE YAZI
                            </span>
                          )}
                          {bKey === "rectangle" && (
                            <div class="h-8 w-20 rounded-sm border-2 border-[#FF2E88] shadow-[0_0_8px_#FF2E88]" />
                          )}
                          {bKey === "pill" && (
                            <div class="h-8 w-20 rounded-full border-2 border-[#35E7FF] shadow-[0_0_8px_#35E7FF]" />
                          )}
                          {bKey === "circle" && (
                            <div class="size-10 rounded-full border-2 border-[#1CFF8A] shadow-[0_0_8px_#1CFF8A]" />
                          )}
                          {bKey === "ticket" && (
                            <div class="h-8 w-20 rounded-md border-2 border-dashed border-[#FFB020] shadow-[0_0_8px_#FFB020]" />
                          )}
                          {bKey === "heart" && (
                            <span class="text-2xl text-[#FF2E88] drop-shadow-[0_0_8px_#FF2E88]">
                              ♡
                            </span>
                          )}
                        </div>
                        <span class="text-sm font-bold text-[#FFF4F8]">
                          {bItem.label}
                        </span>
                        <span class="mt-1 text-[13px] text-[#EAE6F2] leading-snug">
                          {bItem.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SEKME 5: ÖLÇÜ & 170 CM İNSAN SİLÜETİ ÖLÇEK KIYASLAMASI */}
            {activeTab === "size" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    5. TABELA BOYUTU & ÖLÇEK
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Genişliği seçin; yükseklik harf sayınıza göre orantılı
                    ayarlanır. Alttaki 170 cm insan silüetiyle gerçek boyutu
                    kıyaslayın.
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-2.5">
                  {(Object.keys(NEON_SIZES) as NeonSizeId[]).map((sizeKey) => {
                    const sizeItem = NEON_SIZES[sizeKey];
                    const isSelected = spec.sizeId === sizeKey;
                    return (
                      <button
                        key={sizeKey}
                        type="button"
                        onClick={() => updateSpec({ sizeId: sizeKey })}
                        class={`cursor-pointer flex flex-col items-start justify-center rounded-2xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-[#35E7FF] bg-[#0A0710] shadow-[0_0_18px_rgba(53,231,255,0.22)]"
                            : "border-white/10 bg-[#0A0710]/60 hover:border-white/30"
                        }`}
                      >
                        <span class="text-sm font-bold text-[#FFF4F8] tabular-nums">
                          {sizeItem.label}
                        </span>
                        <span class="mt-0.5 text-[13px] text-[#35E7FF] tabular-nums">
                          Pleksi: ~{sizeItem.widthCm} × {sizeItem.heightCm} cm
                        </span>
                        <span class="mt-1 text-[13px] text-[#EAE6F2]">
                          {sizeItem.recommendedFor}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 170 cm İnsan Silüeti Yanında Canlı Ölçek Diyagramı (Kings of Neon Scale Preview) */}
                <div class="rounded-2xl border border-white/15 bg-[#0A0710] p-4 space-y-2">
                  <div class="flex items-center justify-between text-[13px] font-semibold text-[#EAE6F2]">
                    <span>GERÇEK İNSAN ÖLÇEĞİ (170 cm Boy)</span>
                    <span class="text-[#FF2E88] tabular-nums">
                      {estimate.widthCm} × {estimate.heightCm} cm
                    </span>
                  </div>
                  <svg
                    role="img"
                    viewBox="0 0 360 170"
                    class="w-full h-40 rounded-xl bg-[#130C22] border border-white/10"
                    aria-label="170 cm insan silüeti yanında tabela ölçeği"
                  >
                    {/* Ölçek ızgarası */}
                    <line
                      x1="45"
                      y1="15"
                      x2="45"
                      y2="155"
                      stroke="rgba(255,255,255,0.25)"
                      stroke-width="1"
                    />
                    <text
                      x="22"
                      y="90"
                      fill="#EAE6F2"
                      font-size="10"
                      text-anchor="middle"
                    >
                      170cm
                    </text>
                    {/* İnsan Silüeti */}
                    <circle
                      cx="75"
                      cy="30"
                      r="11"
                      fill="rgba(234,230,242,0.3)"
                    />
                    <path
                      d="M58 60 C58 46, 92 46, 92 60 L90 105 L84 105 L82 155 L68 155 L66 105 L60 105 Z"
                      fill="rgba(234,230,242,0.3)"
                    />
                    {/* Dinamik Ölçeklenen Neon Tabela Kutusu */}
                    <rect
                      x="130"
                      y="42"
                      width={Math.round(estimate.widthCm * 1.35)}
                      height={Math.round(estimate.heightCm * 1.35)}
                      rx="8"
                      fill="rgba(255, 46, 136, 0.14)"
                      stroke="#FF2E88"
                      stroke-width="2"
                    />
                    <text
                      x={130 + Math.round((estimate.widthCm * 1.35) / 2)}
                      y={46 + Math.round((estimate.heightCm * 1.35) / 2)}
                      fill="#FFF4F8"
                      font-size="12"
                      font-weight="bold"
                      text-anchor="middle"
                    >
                      {estimate.widthCm} × {estimate.heightCm} cm
                    </text>
                  </svg>
                </div>
              </div>
            )}

            {/* SEKME 6: PLEKSİ ZEMİN KESİM TİPİ (ACRYLIC BACKBOARD) */}
            {activeTab === "acrylic" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    6. PLEKSİ ZEMİN KESİMİ
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    5mm 1. sınıf şeffaf akrilik (pleksi) arka plakanın CNC
                    lazerde nasıl kesileceğini seçin.
                  </p>
                </div>

                <div class="space-y-3">
                  {(Object.keys(NEON_BACKBOARDS) as NeonBackboardId[]).map(
                    (boardKey) => {
                      const boardItem = NEON_BACKBOARDS[boardKey];
                      const isSelected = spec.backboardId === boardKey;
                      return (
                        <button
                          key={boardKey}
                          type="button"
                          onClick={() => updateSpec({ backboardId: boardKey })}
                          class={`cursor-pointer flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? "border-[#35E7FF] bg-[#0A0710] shadow-[0_0_18px_rgba(53,231,255,0.2)]"
                              : "border-white/10 bg-[#0A0710]/60 hover:border-white/30"
                          }`}
                        >
                          <div class="space-y-1">
                            <div class="flex items-center gap-2">
                              <span class="text-base font-bold text-[#FFF4F8]">
                                {boardItem.label}
                              </span>
                              {boardKey === "contour" && (
                                <span class="rounded bg-[#1CFF8A]/20 px-2 py-0.5 text-[13px] font-bold text-[#1CFF8A]">
                                  En Çok Tercih Edilen
                                </span>
                              )}
                            </div>
                            <p class="text-[13px] text-[#EAE6F2]">
                              {boardItem.description}
                            </p>
                          </div>
                          <span class="shrink-0 text-sm font-bold text-[#35E7FF] tabular-nums">
                            {boardItem.extraCost === 0
                              ? "Standart"
                              : `+${boardItem.extraCost} ₺`}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* SEKME 7: DONANIM, TÜP TEKNOLOJİSİ (SPLICE vs LUMINEX), KUMANDA VE ORTAM */}
            {activeTab === "options" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    7. TÜP TEKNOLOJİSİ & DONANIM
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Tabelanızın silikon teknolojisini, dış mekan korumasını ve
                    montaj kitini belirleyin.
                  </p>
                </div>

                {/* Splice vs Luminex Tüp Teknolojisi */}
                <div class="space-y-2 rounded-2xl border border-white/10 bg-[#0A0710] p-4">
                  <span class="block text-sm font-bold text-[#FFF4F8]">
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
                            class={`cursor-pointer rounded-xl border p-3 text-left transition-all ${
                              isSelected
                                ? "border-[#35E7FF] bg-[#17141F]"
                                : "border-white/10 bg-[#0A0710] hover:border-white/25"
                            }`}
                          >
                            <span class="block text-[13px] font-bold text-[#35E7FF]">
                              {tItem.badge}
                            </span>
                            <span class="mt-0.5 block text-sm font-bold text-[#FFF4F8]">
                              {tKey === "standard"
                                ? "Splice™ LED"
                                : "Luminex™ Pro"}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                  <p class="pt-1 text-[13px] text-[#EAE6F2]">
                    {NEON_TUBE_TECHS[activeTechId].description}
                  </p>
                </div>

                {/* İç Mekan vs IP67 Dış Mekan */}
                <div class="space-y-2 rounded-2xl border border-white/10 bg-[#0A0710] p-4">
                  <span class="block text-sm font-bold text-[#FFF4F8]">
                    Kullanım Ortamı (Su / Toz Koruması)
                  </span>
                  <div class="grid grid-cols-2 gap-2">
                    {(
                      [
                        {
                          id: "indoor",
                          label: "İç Mekan (Standart)",
                          sub: "Ev, Ofis, Kafe İçi",
                        },
                        {
                          id: "outdoor",
                          label: "IP67 Dış Mekan (+400 ₺)",
                          sub: "Yağmur & Güneş Korumalı",
                        },
                      ] as const
                    ).map((envItem) => (
                      <button
                        key={envItem.id}
                        type="button"
                        onClick={() => updateSpec({ environment: envItem.id })}
                        class={`cursor-pointer rounded-xl border p-3 text-left ${
                          spec.environment === envItem.id
                            ? "border-[#FFB020] bg-[#17141F]"
                            : "border-white/10 bg-[#0A0710]"
                        }`}
                      >
                        <span class="block text-sm font-bold text-[#FFF4F8]">
                          {envItem.label}
                        </span>
                        <span class="block text-[13px] text-[#EAE6F2]">
                          {envItem.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dimmer & Montaj Tipi */}
                <div class="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateSpec({
                        dimmer:
                          spec.dimmer === "wireless" ? "standard" : "wireless",
                      })
                    }
                    class="cursor-pointer rounded-xl border border-white/15 bg-[#0A0710] p-3 text-left"
                  >
                    <span class="block text-[13px] font-bold text-[#1CFF8A]">
                      PARLAKLIK KONTROLÜ
                    </span>
                    <span class="mt-0.5 block text-sm font-bold text-[#FFF4F8]">
                      {spec.dimmer === "wireless"
                        ? "RF Kablosuz Dimmer ✓"
                        : "Standart 12V Güç"}
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
                    class="cursor-pointer rounded-xl border border-white/15 bg-[#0A0710] p-3 text-left"
                  >
                    <span class="block text-[13px] font-bold text-[#35E7FF]">
                      MONTAJ SETİ (DAHİL)
                    </span>
                    <span class="mt-0.5 block text-sm font-bold text-[#FFF4F8]">
                      {spec.mountType === "hanging"
                        ? "Çelik Telli Tavan Askı"
                        : "Krom Duvar Vidaları"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* SEKME 8: TEKNİK REÇETE (WHAT GETS BUILT) & TESLİMAT ZAMAN ÇİZELGESİ (BUY) */}
            {activeTab === "buy" && (
              <div class="space-y-4">
                <div>
                  <h2 class="font-display text-xl font-bold text-[#FFF4F8]">
                    8. ÜRETİM REÇETESİ & TESLİMAT
                  </h2>
                  <p class="mt-1 text-base text-[#EAE6F2]">
                    Manavgat atölyemizde bu tasarım için üretilecek tam teknik
                    paket ve kargo takvimi:
                  </p>
                </div>

                {/* Teknik Paket Özeti */}
                <div class="rounded-2xl border border-white/15 bg-[#0A0710] p-4 space-y-2.5 text-[13px] text-[#EAE6F2]">
                  <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>Yazı & Font:</span>
                    <strong class="text-[#FFF4F8]">
                      "{formattedText}" · {activeFont.label}
                    </strong>
                  </div>
                  <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>Işık & Sembol:</span>
                    <strong class="text-[#FFF4F8]">
                      {activeColor.label}
                      {activeSymbolId !== "none"
                        ? ` + ${activeSymbol.label}`
                        : ""}
                    </strong>
                  </div>
                  <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>Pleksi & Çerçeve:</span>
                    <strong class="text-[#FFF4F8]">
                      {activeBackboard.label} · {activeBorder.label}
                    </strong>
                  </div>
                  <div class="flex justify-between border-b border-white/10 pb-2">
                    <span>LED Metrajı & Güç:</span>
                    <strong class="text-[#35E7FF] tabular-nums">
                      ~{estimate.neonLengthMeters} m Tüp · {estimate.powerWatts}
                      W (12V {estimate.recommendedAmps}A Trafo)
                    </strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Kutu İçeriği:</span>
                    <strong class="text-[#1CFF8A]">
                      12V Adaptör + Montaj Seti Dahil
                    </strong>
                  </div>
                </div>

                {/* Kings of Neon Tarzı 3 Adımlı Teslimat Zaman Çizelgesi */}
                <div class="rounded-2xl border border-white/15 bg-[#0A0710] p-4 space-y-3">
                  <span class="block text-[13px] font-bold uppercase tracking-wider text-[#35E7FF]">
                    TAHMİNİ ÜRETİM & TESLİMAT TAKVİMİ
                  </span>
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="rounded-xl bg-[#17141F] p-2.5 border border-white/10">
                      <span class="block text-[13px] font-bold text-[#FF2E88]">
                        SİPARİŞ ONAYI
                      </span>
                      <span class="mt-1 block text-sm font-bold text-[#FFF4F8]">
                        Bugün ({fmtDate(today)})
                      </span>
                    </div>
                    <div class="rounded-xl bg-[#17141F] p-2.5 border border-white/10">
                      <span class="block text-[13px] font-bold text-[#35E7FF]">
                        ATÖLYE ÇIKIŞI
                      </span>
                      <span class="mt-1 block text-sm font-bold text-[#FFF4F8]">
                        {fmtDate(shipDate)}
                      </span>
                    </div>
                    <div class="rounded-xl bg-[#17141F] p-2.5 border border-white/10">
                      <span class="block text-[13px] font-bold text-[#1CFF8A]">
                        TESLİMAT
                      </span>
                      <span class="mt-1 block text-sm font-bold text-[#FFF4F8]">
                        ~{fmtDate(arriveDate)}
                      </span>
                    </div>
                  </div>
                  <p class="text-[13px] text-[#EAE6F2]">
                    Üretim öncesi WhatsApp üzerinden son CNC kesim taslağınız
                    onayınıza sunulur.
                  </p>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cursor-pointer flex min-h-13 w-full items-center justify-center gap-2.5 rounded-xl bg-[#1CFF8A] px-5 py-3.5 text-base font-bold text-[#0A0710] shadow-[0_0_28px_rgba(28,255,138,0.4)] hover:bg-[#4dff9e]"
                >
                  <span>Bu Reçeteyi WhatsApp'tan Sipariş Et</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* BÖLGE 3: SAĞ SABİT CAD BLUEPRINT SAHNESİ + ÖLÇÜ OKLARI + MÜHENDİSLİK ANTETİ (7 Sütun) */}
        <div
          ref={stageRef}
          class={`lg:col-span-7 relative flex min-h-[540px] sm:min-h-[640px] flex-col justify-between overflow-hidden p-5 sm:p-8 transition-colors duration-300 ${wallTextureClass}`}
          style={
            sceneBg === "blueprint"
              ? {
                  backgroundImage:
                    "linear-gradient(rgba(53, 231, 255, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 231, 255, 0.055) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }
              : undefined
          }
        >
          {/* CAD Satır İndeks Harfleri (A / B / C — Kings of Neon Blueprint Detayı) */}
          <div
            aria-hidden="true"
            class="pointer-events-none absolute left-3 top-28 bottom-36 hidden sm:flex flex-col justify-between text-[13px] font-mono font-bold text-[#35E7FF]/45"
          >
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </div>

          {/* Üst Sahne Başlığı + Aç/Kapa + Zemin Seçici + PNG İndir */}
          <div class="relative z-20 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="block font-display text-lg sm:text-xl font-bold tracking-wide text-[#FF2E88]">
                VISUAL ESTIMATE · CANLI TEKNİK PAFTA
              </span>
              <span class="block text-[13px] text-[#EAE6F2]/80">
                Üretim öncesi nihai CNC vektör çizimi WhatsApp'tan onayınıza
                gönderilir.
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePower}
                aria-pressed={isLit}
                class={`cursor-pointer inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
                  isLit
                    ? "border-[#1CFF8A]/60 bg-[#17141F]/90 text-[#1CFF8A]"
                    : "border-white/20 bg-[#17141F]/90 text-[#EAE6F2]"
                }`}
              >
                <span
                  class={`size-2.5 rounded-full ${
                    isLit
                      ? "bg-[#1CFF8A] shadow-[0_0_10px_#1CFF8A]"
                      : "bg-white/30"
                  }`}
                />
                <span>{isLit ? "Işık: AÇIK" : "Işık: KAPALI (Gündüz)"}</span>
              </button>

              <div class="inline-flex rounded-xl border border-white/10 bg-[#17141F]/90 p-1">
                {(
                  [
                    { id: "blueprint", label: "CAD Pafta" },
                    { id: "brick", label: "Tuğla" },
                    { id: "concrete", label: "Beton" },
                  ] as const
                ).map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setSceneBg(bg.id)}
                    class={`cursor-pointer rounded-lg px-2.5 py-1 text-[13px] font-semibold ${
                      sceneBg === bg.id
                        ? "bg-[#FFF4F8] text-[#0A0710]"
                        : "text-[#EAE6F2] hover:text-[#FFF4F8]"
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportPng}
                class="cursor-pointer inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#35E7FF]/40 bg-[#35E7FF]/10 px-3 py-1.5 text-[13px] font-bold text-[#35E7FF] hover:bg-[#35E7FF]/20"
              >
                <span>Paftayı PNG İndir</span>
              </button>
            </div>
          </div>

          {/* Duvara Düşen Atmosferik Işık Havuzu */}
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: isLit ? NEON_ENGINE_CONFIG.wallSpillOpacity : 0,
              background: `radial-gradient(circle at 50% 45%, rgba(${activeColor.glowRgb}, 0.65) 0%, rgba(${activeSymbolColor.glowRgb}, 0.22) 40%, transparent 72%)`,
              mixBlendMode: "screen",
            }}
          />

          {/* MERKEZ SAHNE: NEON TABELA + ÇİFT YÖNLÜ CANLI ÖLÇÜ OKLARI (GENİŞLİK & YÜKSEKLİK) */}
          <div class="relative z-10 my-auto flex w-full flex-col items-center justify-center py-8">
            <div class="relative flex w-full items-center justify-center">
              {/* Neon Akrilik Plaka + Opsiyonel Işıklı Neon Çerçeve */}
              <div
                key={igniteTick}
                style={{
                  width: `${signScalePercent}%`,
                  maxWidth: "660px",
                  boxShadow: isLit
                    ? `0 20px 60px rgba(0,0,0,0.85), 0 0 42px rgba(${activeColor.glowRgb}, 0.24), inset 0 0 22px rgba(${activeColor.glowRgb}, 0.14)`
                    : "0 20px 50px rgba(0,0,0,0.85)",
                  ...neonBorderStyle,
                }}
                class={`relative transition-all duration-300 ${backboardShapeClass} ${
                  activeBorderId !== "none" ? "border-[3px]" : ""
                } ${
                  activeBorderId === "pill" || activeBorderId === "circle"
                    ? "rounded-full"
                    : activeBorderId === "ticket"
                      ? "rounded-3xl border-dashed"
                      : ""
                } ${isLit ? "animate-neon-ignite" : ""}`}
              >
                {/* 4 Köşe Krom Montaj Vidası */}
                <span class="absolute top-3.5 left-3.5 size-2.5 rounded-full bg-white/40 ring-2 ring-black/50" />
                <span class="absolute top-3.5 right-3.5 size-2.5 rounded-full bg-white/40 ring-2 ring-black/50" />
                <span class="absolute bottom-3.5 left-3.5 size-2.5 rounded-full bg-white/40 ring-2 ring-black/50" />
                <span class="absolute bottom-3.5 right-3.5 size-2.5 rounded-full bg-white/40 ring-2 ring-black/50" />

                {/* Neon Metin + Seçili Vektör Neon Sembolü */}
                <div
                  class={`relative z-10 flex flex-wrap items-center gap-4 ${
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
                      color: isLit ? "#FFF4F8" : activeColor.unlitHex,
                      textShadow: tubeShadow,
                      fontSize: "clamp(2rem, 4.2vw, 3.8rem)",
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
                      stroke={isLit ? "#FFF4F8" : activeSymbolColor.unlitHex}
                      stroke-width="1.9"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      style={{
                        filter: isLit
                          ? `drop-shadow(0 0 3px #FFF4F8) drop-shadow(0 0 12px ${activeSymbolColor.hex}) drop-shadow(0 0 28px ${activeSymbolColor.hex})`
                          : "none",
                      }}
                      class="size-12 sm:size-16 shrink-0 transition-all duration-300"
                      aria-label={activeSymbol.label}
                    >
                      <title>{activeSymbol.label}</title>
                      <path d={activeSymbol.svgPath} />
                    </svg>
                  )}
                </div>
              </div>

              {/* SAĞ DİKEY ÖLÇÜ OKU (Height Dimension Arrow — Kings of Neon Tarzı) */}
              <div
                aria-hidden="true"
                class="hidden sm:flex flex-col items-center justify-between h-44 ml-4 text-[#FFF4F8]/85"
              >
                <span class="text-xs">↑</span>
                <div class="w-px flex-1 bg-white/35 my-1" />
                <span class="py-1 text-[13px] font-bold tabular-nums whitespace-nowrap">
                  {estimate.heightCm} cm
                </span>
                <div class="w-px flex-1 bg-white/35 my-1" />
                <span class="text-xs">↓</span>
              </div>
            </div>

            {/* ALT YATAY ÖLÇÜ OKU (Width Dimension Arrow — Kings of Neon Tarzı) */}
            <div
              aria-hidden="true"
              class="mt-5 flex w-4/5 max-w-xl items-center justify-between gap-3 text-[#FFF4F8]/85"
            >
              <span class="text-xs">←</span>
              <div class="h-px flex-1 bg-white/35" />
              <div class="text-center">
                <span class="block text-sm font-bold tabular-nums text-[#FFF4F8]">
                  {estimate.widthCm} cm
                </span>
                <span class="block text-[13px] text-[#EAE6F2]/70">
                  pleksi genişliği
                </span>
              </div>
              <div class="h-px flex-1 bg-white/35" />
              <span class="text-xs">→</span>
            </div>
          </div>

          {/* ALT KONTROL ÇUBUĞU (Undo / Redo / Reset Butonları + Mühendislik Anteti Title Block) */}
          <div class="relative z-20 space-y-3">
            {/* Undo / Redo / Reset Barı */}
            <div class="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                class="cursor-pointer rounded-full border border-white/15 bg-[#0A0710]/85 px-3.5 py-1.5 text-[13px] font-semibold text-[#EAE6F2] disabled:opacity-40 hover:border-[#35E7FF]"
              >
                ↺ Geri Al
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                class="cursor-pointer rounded-full border border-white/15 bg-[#0A0710]/85 px-3.5 py-1.5 text-[13px] font-semibold text-[#EAE6F2] disabled:opacity-40 hover:border-[#35E7FF]"
              >
                ↻ İleri Al
              </button>
              <button
                type="button"
                onClick={() =>
                  updateSpec({ colorId: "pink", symbolColorId: "cyan" })
                }
                class="cursor-pointer rounded-full border border-white/15 bg-[#0A0710]/85 px-3.5 py-1.5 text-[13px] font-semibold text-[#EAE6F2] hover:border-[#35E7FF]"
              >
                ↺ Rengi Sıfırla
              </button>
              <button
                type="button"
                onClick={() => updateSpec({ sizeId: "md", borderId: "none" })}
                class="cursor-pointer rounded-full border border-white/15 bg-[#0A0710]/85 px-3.5 py-1.5 text-[13px] font-semibold text-[#EAE6F2] hover:border-[#35E7FF]"
              >
                ↺ Ölçüyü Sıfırla
              </button>
              <button
                type="button"
                onClick={handleCopyShareUrl}
                class="cursor-pointer rounded-full border border-[#35E7FF]/40 bg-[#35E7FF]/10 px-3.5 py-1.5 text-[13px] font-bold text-[#35E7FF] hover:bg-[#35E7FF]/20"
              >
                {copiedLink
                  ? "Tasarım Linki Kopyalandı ✓"
                  : "Tasarım Linkini Kopyala"}
              </button>
            </div>

            {/* CAD MÜHENDİSLİK ANTETİ (BLUEPRINT TITLE BLOCK — Kings of Neon İmza Alanı) */}
            <div class="grid grid-cols-2 sm:grid-cols-6 border border-[#35E7FF]/25 bg-[#090514]/95 rounded-xl overflow-hidden text-left">
              <div class="p-2.5 sm:p-3 border-b sm:border-b-0 border-r border-white/10">
                <span class="block text-[11px] font-mono uppercase tracking-wider text-[#35E7FF]">
                  TABELA ADI
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-[#FFF4F8] truncate">
                  {formattedText}
                </strong>
              </div>
              <div class="p-2.5 sm:p-3 border-b sm:border-b-0 sm:border-r border-white/10">
                <span class="block text-[11px] font-mono uppercase tracking-wider text-[#35E7FF]">
                  PLEKSİ ÖLÇÜSÜ
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-[#FFF4F8] tabular-nums">
                  {estimate.widthCm} × {estimate.heightCm} cm
                </strong>
              </div>
              <div class="p-2.5 sm:p-3 border-b sm:border-b-0 border-r border-white/10">
                <span class="block text-[11px] font-mono uppercase tracking-wider text-[#35E7FF]">
                  TOPLAM NEON
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-[#FFF4F8] tabular-nums">
                  {estimate.neonLengthMeters} metre
                </strong>
              </div>
              <div class="p-2.5 sm:p-3 border-b sm:border-b-0 sm:border-r border-white/10">
                <span class="block text-[11px] font-mono uppercase tracking-wider text-[#35E7FF]">
                  GÜÇ / TRAFO
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-[#FFF4F8] tabular-nums">
                  {estimate.powerWatts} W ({estimate.recommendedAmps}A)
                </strong>
              </div>
              <div class="p-2.5 sm:p-3 border-r border-white/10">
                <span class="block text-[11px] font-mono uppercase tracking-wider text-[#35E7FF]">
                  TARİH
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-[#FFF4F8] tabular-nums">
                  {fmtDate(today)}
                </strong>
              </div>
              <div class="p-2.5 sm:p-3">
                <span class="block text-[11px] font-mono uppercase tracking-wider text-[#35E7FF]">
                  ÜRETİCİ ATÖLYE
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-[#FFF4F8] truncate">
                  {BUSINESS_CONFIG.name}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
