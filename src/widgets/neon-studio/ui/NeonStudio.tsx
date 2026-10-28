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
  type NeonSymbolPosition,
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
  | "buy";

const PRESET_TEXTS = [
  "Open Late",
  "CC NEON'S",
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
  backboardId: "contour_clear",
  environment: "indoor",
  symbolId: "none",
  symbolColorId: "cyan",
  symbolPosition: "right",
  symbolScale: 1,
  borderId: "none",
  tubeTech: "standard",
  dimmer: "wireless",
  mountType: "wall",
  align: "center",
};

function parseInitialSpecFromUrl(): CustomNeonSpec {
  if (typeof window === "undefined") {
    return DEFAULT_SPEC;
  }

  // Hem ? query parametrelerini hem # hash parametrelerini destekle
  let searchStr = "";
  if (window.location.search && window.location.search.length > 1) {
    searchStr = window.location.search.slice(1);
  } else if (window.location.hash && window.location.hash.length > 1) {
    searchStr = window.location.hash.replace(/^#\/?/, "");
    if (searchStr.includes("?")) {
      searchStr = searchStr.split("?")[1] || searchStr;
    }
  }

  if (!searchStr) {
    return DEFAULT_SPEC;
  }

  const params = new URLSearchParams(searchStr);
  const rawText = params.get("text");
  const rawFont = params.get("font") as NeonFontId | null;
  const rawColor = params.get("color") as NeonColorId | null;
  const rawSize = params.get("size") as NeonSizeId | null;
  const rawBoard = params.get("board") as NeonBackboardId | null;
  const rawEnv = params.get("env") as NeonEnvironment | null;
  const rawSym = params.get("sym") as NeonSymbolId | null;
  const rawSymColor = (params.get("symColor") ||
    params.get("scolor")) as NeonColorId | null;
  const rawSymPos = params.get("symPos") as NeonSymbolPosition | null;
  const rawSymScale = Number(params.get("symScale"));
  const rawBorder = params.get("border") as NeonBorderId | null;
  const rawTech = params.get("tech") as NeonTubeTechId | null;

  return {
    text:
      rawText && rawText.trim().length > 0
        ? rawText.slice(0, 65)
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
    symbolPosition:
      rawSymPos === "left" ||
      rawSymPos === "right" ||
      rawSymPos === "top" ||
      rawSymPos === "bottom"
        ? rawSymPos
        : DEFAULT_SPEC.symbolPosition,
    symbolScale:
      !Number.isNaN(rawSymScale) && rawSymScale >= 0.6 && rawSymScale <= 1.8
        ? Number(rawSymScale.toFixed(2))
        : DEFAULT_SPEC.symbolScale,
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
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);
  const [showConstraintTip, setShowConstraintTip] = useState<boolean>(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentBoxRef = useRef<HTMLDivElement>(null);
  const [contentSizePx, setContentSizePx] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [viewportPx, setViewportPx] = useState<{ w: number; h: number }>({
    w: 1280,
    h: 800,
  });
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => {
      setViewportPx({ w: window.innerWidth, h: window.innerHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = contentBoxRef.current;
    if (!el || typeof window === "undefined") return;
    const measure = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (w > 0 && h > 0) {
        setContentSizePx((prev) =>
          Math.abs(prev.w - w) <= 1 && Math.abs(prev.h - h) <= 1
            ? prev
            : { w, h },
        );
      }
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [
    spec.text,
    spec.fontId,
    spec.sizeId,
    spec.symbolId,
    spec.symbolPosition,
    spec.symbolScale,
    spec.borderId,
    igniteTick,
    viewportPx.w,
  ]);

  useEffect(() => {
    const fromUrl = parseInitialSpecFromUrl();
    setSpec(fromUrl);
    setHistory([fromUrl]);
    setHistoryIndex(0);
    if (fromUrl.colorId && NEON_COLORS[fromUrl.colorId]) {
      const c = NEON_COLORS[fromUrl.colorId];
      document.documentElement.style.setProperty("--neon-color", c.hex);
      document.documentElement.style.setProperty("--neon-rgb", c.glowRgb);
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
  const activeSize = NEON_SIZES[spec.sizeId];

  const rawDisplay = spec.text.trim().length > 0 ? spec.text : "Open Late";
  const displayLines = rawDisplay
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const formattedLines = displayLines.map((line) =>
    activeFont.uppercase ? line.toLocaleUpperCase("tr-TR") : line,
  );
  const formattedText = formattedLines.join(" / ");
  const activeSymbolPos: NeonSymbolPosition = spec.symbolPosition || "right";
  const activeSymbolScale = Math.max(0.6, Math.min(1.8, spec.symbolScale ?? 1));
  const symbolFlexDirClass =
    activeSymbolPos === "top"
      ? "flex-col-reverse"
      : activeSymbolPos === "bottom"
        ? "flex-col"
        : activeSymbolPos === "left"
          ? "flex-row-reverse"
          : "flex-row";

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
      symPos: next.symbolPosition || "right",
      symScale: String(next.symbolScale ?? 1),
      border: next.borderId || "none",
      tech: next.tubeTech || "standard",
    });
    // WhatsApp ve tüm mobil istemcilerde eksiksiz taranabilen query parametresi olarak senkronize et
    window.history.replaceState(null, "", `?${hashParams.toString()}`);
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
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Spam ve ardisik tiklama korumasi (15 sn cooldown)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const lastOrderTime = Number(
        sessionStorage.getItem("ccneons_order_cooldown") || 0,
      );
      const elapsed = Math.floor((Date.now() - lastOrderTime) / 1000);
      if (elapsed < 15) {
        setCooldownSeconds(15 - elapsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  async function generatePaftaDataUrl(): Promise<string | null> {
    if (typeof document === "undefined") return null;

    // Fontların tam yüklenmesini bekle (fallback sans-serif'e düşüşü engeller)
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Fallback
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Koyu Atölye CAD Zemin
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // CAD Kılavuz Grid Ağı
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

    // Ortam Parıltısı (Radial Glow)
    if (isLit) {
      const grad = ctx.createRadialGradient(800, 430, 30, 800, 430, 520);
      grad.addColorStop(0, `rgba(${activeColor.glowRgb}, 0.38)`);
      grad.addColorStop(0.5, `rgba(${activeColor.glowRgb}, 0.12)`);
      grad.addColorStop(1, "rgba(5, 5, 5, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Üst Başlık & Sertifika Metinleri
    ctx.fillStyle = activeColor.hex;
    ctx.font = "700 28px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TEKNİK ÜRETİM PAFTASI · CC NEON'S", 80, 85);
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "400 17px monospace";
    ctx.fillText(
      "EL İŞÇİLİĞİ SİLİKON NEON · 4MM CNC AKRİLİK TABAN · 12V DC CE SERTİFİKALI",
      80,
      118,
    );

    // 1. Metin & Sembol Boyutlandırması ve Ölçümleme
    const hasSymbol =
      activeSymbolId !== "none" && Boolean(activeSymbol.svgPath);
    const maxCharsInLine = Math.max(...formattedLines.map((l) => l.length), 1);
    const circleFontScale =
      activeBorderId === "circle"
        ? Math.min(1.0, 5.8 / Math.max(maxCharsInLine, 4.0))
        : 1.0;

    let canvasFontSize = Math.round(
      (formattedLines.length > 1 ? 76 : 94) *
        activeSize.scaleFactor *
        circleFontScale,
    );
    let lineSpacing = Math.round(canvasFontSize * 1.25);
    const canvasFontWeight = activeFont.canvasWeight || 400;
    ctx.font = `${canvasFontWeight} ${canvasFontSize}px ${activeFont.cssFamily}`;

    // Metin genişlikleri ölçümü
    let textLineWidths = formattedLines.map((l) => ctx.measureText(l).width);
    let maxTextWidth = Math.max(...textLineWidths, 40);
    const symbolGap = 28;
    const isCanvasVerticalSymbol =
      hasSymbol && (activeSymbolPos === "top" || activeSymbolPos === "bottom");
    const symbolScale = 1.05 * activeSymbolScale;
    let symbolSize = Math.round(canvasFontSize * symbolScale);

    let totalContentWidth = isCanvasVerticalSymbol
      ? Math.max(maxTextWidth, symbolSize)
      : maxTextWidth + (hasSymbol ? symbolGap + symbolSize : 0);

    const maxAllowedWidth = activeBorderId === "circle" ? 460 : 1160;
    if (totalContentWidth > maxAllowedWidth) {
      const factor = maxAllowedWidth / totalContentWidth;
      canvasFontSize = Math.max(26, Math.floor(canvasFontSize * factor));
      lineSpacing = Math.round(canvasFontSize * 1.25);
      symbolSize = Math.round(canvasFontSize * symbolScale);
      ctx.font = `${canvasFontWeight} ${canvasFontSize}px ${activeFont.cssFamily}`;
      textLineWidths = formattedLines.map((l) => ctx.measureText(l).width);
      maxTextWidth = Math.max(...textLineWidths, 40);
      totalContentWidth = isCanvasVerticalSymbol
        ? Math.max(maxTextWidth, symbolSize)
        : maxTextWidth + (hasSymbol ? symbolGap + symbolSize : 0);
    }

    let textBlockHeight = (formattedLines.length - 1) * lineSpacing;
    let totalSignHeight = isCanvasVerticalSymbol
      ? textBlockHeight + canvasFontSize + symbolGap + symbolSize
      : Math.max(textBlockHeight + canvasFontSize, hasSymbol ? symbolSize : 0);
    const maxAllowedHeight = activeBorderId === "circle" ? 430 : 450;
    if (totalSignHeight > maxAllowedHeight) {
      const hFactor = maxAllowedHeight / totalSignHeight;
      canvasFontSize = Math.max(24, Math.floor(canvasFontSize * hFactor));
      lineSpacing = Math.round(canvasFontSize * 1.25);
      symbolSize = Math.round(canvasFontSize * symbolScale);
      ctx.font = `${canvasFontWeight} ${canvasFontSize}px ${activeFont.cssFamily}`;
      textLineWidths = formattedLines.map((l) => ctx.measureText(l).width);
      maxTextWidth = Math.max(...textLineWidths, 40);
      totalContentWidth = isCanvasVerticalSymbol
        ? Math.max(maxTextWidth, symbolSize)
        : maxTextWidth + (hasSymbol ? symbolGap + symbolSize : 0);
      textBlockHeight = (formattedLines.length - 1) * lineSpacing;
      totalSignHeight = isCanvasVerticalSymbol
        ? textBlockHeight + canvasFontSize + symbolGap + symbolSize
        : Math.max(
            textBlockHeight + canvasFontSize,
            hasSymbol ? symbolSize : 0,
          );
    }

    if (activeBorderId === "circle") {
      const contentDiag = Math.hypot(totalContentWidth, totalSignHeight);
      const maxCircleDiag = 480;
      if (contentDiag > maxCircleDiag) {
        const dFactor = maxCircleDiag / contentDiag;
        canvasFontSize = Math.max(24, Math.floor(canvasFontSize * dFactor));
        lineSpacing = Math.round(canvasFontSize * 1.25);
        symbolSize = Math.round(canvasFontSize * symbolScale);
        ctx.font = `${canvasFontWeight} ${canvasFontSize}px ${activeFont.cssFamily}`;
        textLineWidths = formattedLines.map((l) => ctx.measureText(l).width);
        maxTextWidth = Math.max(...textLineWidths, 40);
        totalContentWidth = isCanvasVerticalSymbol
          ? Math.max(maxTextWidth, symbolSize)
          : maxTextWidth + (hasSymbol ? symbolGap + symbolSize : 0);
        textBlockHeight = (formattedLines.length - 1) * lineSpacing;
        totalSignHeight = isCanvasVerticalSymbol
          ? textBlockHeight + canvasFontSize + symbolGap + symbolSize
          : Math.max(
              textBlockHeight + canvasFontSize,
              hasSymbol ? symbolSize : 0,
            );
      }
    }
    const centerY = 430;
    const opticalYOffset = Math.round(canvasFontSize * 0.06);
    const startY = isCanvasVerticalSymbol
      ? activeSymbolPos === "top"
        ? centerY -
          totalSignHeight / 2 +
          symbolSize +
          symbolGap +
          Math.round(canvasFontSize * 0.5) +
          opticalYOffset
        : centerY -
          totalSignHeight / 2 +
          Math.round(canvasFontSize * 0.5) +
          opticalYOffset
      : centerY - textBlockHeight / 2 + opticalYOffset;

    // Yatay & Dikey Yerleşim Koordinatları
    const contentStartX = 800 - totalContentWidth / 2;
    const textBlockCenterX = isCanvasVerticalSymbol
      ? 800
      : hasSymbol && activeSymbolPos === "left"
        ? contentStartX + symbolSize + symbolGap + maxTextWidth / 2
        : contentStartX + maxTextWidth / 2;
    const textStartX = textBlockCenterX - maxTextWidth / 2;
    const getLineX = () =>
      spec.align === "left"
        ? textStartX
        : spec.align === "right"
          ? textStartX + maxTextWidth
          : textBlockCenterX;
    const symbolX = isCanvasVerticalSymbol
      ? 800 - symbolSize / 2
      : activeSymbolPos === "left"
        ? contentStartX
        : contentStartX + maxTextWidth + symbolGap;
    const symbolY = isCanvasVerticalSymbol
      ? activeSymbolPos === "top"
        ? centerY - totalSignHeight / 2
        : startY +
          textBlockHeight +
          Math.round(canvasFontSize * 0.48) +
          symbolGap
      : centerY - symbolSize / 2;

    // Pleksi / Çerçeve Alanı Sınırları (Gerçek en/boy oranına ve oval/daire kavis payına duyarlı)
    const circleRadius = Math.max(
      180,
      Math.min(
        310,
        Math.round(Math.hypot(totalContentWidth, totalSignHeight) / 2 + 48),
      ),
    );
    const pillPadBoostX =
      activeBorderId === "pill"
        ? Math.round(Math.max(48, totalSignHeight * 0.22))
        : 0;
    const pillPadBoostY =
      activeBorderId === "pill"
        ? Math.round(Math.max(36, totalContentWidth * 0.14))
        : 0;
    const padY =
      activeBorderId === "circle"
        ? circleRadius
        : Math.max(105, Math.round(totalSignHeight / 2 + 45 + pillPadBoostY));
    const aspectRatio = estimate.widthCm / Math.max(1, estimate.heightCm);
    const minPadX =
      estimate.widthCm < estimate.heightCm
        ? Math.max(135, Math.round(padY * aspectRatio))
        : Math.min(260, Math.max(150, Math.round(padY * aspectRatio)));
    const padX =
      activeBorderId === "circle"
        ? circleRadius
        : Math.max(
            activeBorderId === "pill" ? Math.round(padY * 1.65) : minPadX,
            Math.min(
              680,
              Math.round(totalContentWidth / 2 + 52 + pillPadBoostX),
            ),
          );
    const rx = 800 - padX;
    const ry = centerY - padY;
    const rw = padX * 2;
    const rh = padY * 2;

    // Yardımcı Vida Çizim Fonksiyonu (Paslanmaz Krom Yükseltme Vidası)
    const drawScrew = (sx: number, sy: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      const sGrad = ctx.createLinearGradient(sx - 5, sy - 5, sx + 5, sy + 5);
      sGrad.addColorStop(0, "#F0F0F5");
      sGrad.addColorStop(0.5, "#8E8E98");
      sGrad.addColorStop(1, "#36363E");
      ctx.fillStyle = sGrad;
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Vida Yarığı
      ctx.beginPath();
      ctx.moveTo(sx - 3.5, sy);
      ctx.lineTo(sx + 3.5, sy);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.restore();
    };

    // 2. Akrilik Taban ve Çerçeve Çizimi
    const isBlackBoard = activeBackboard.colorType === "black";
    const isContourBoard = activeBackboard.cutType === "contour";

    if (activeBorderId !== "none") {
      // Belirgin Neon Çerçeveli Taban (Rectangle, Pill, Circle, Ticket)
      ctx.save();
      ctx.beginPath();
      if (activeBorderId === "circle") {
        ctx.arc(800, centerY, circleRadius, 0, Math.PI * 2);
      } else {
        const radius = activeBorderId === "pill" ? Math.min(rw, rh) / 2 : 16;
        ctx.roundRect(rx, ry, rw, rh, radius);
      }

      // Akrilik Zemin Dolgusu
      if (isBlackBoard) {
        ctx.fillStyle = "#0A0A0E";
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 12;
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 8;
        ctx.fill();
      }

      // Neon Çerçeve Hattı
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
        ctx.shadowBlur = 4;
        ctx.stroke();
      } else {
        ctx.strokeStyle = activeColor.unlitHex;
        ctx.stroke();
      }
      ctx.restore();

      // Montaj Vidaları
      if (activeBorderId === "circle") {
        const screwDist = circleRadius * 0.65;
        for (const s of [
          { x: 800 - screwDist, y: centerY - screwDist },
          { x: 800 + screwDist, y: centerY - screwDist },
          { x: 800 - screwDist, y: centerY + screwDist },
          { x: 800 + screwDist, y: centerY + screwDist },
        ]) {
          drawScrew(s.x, s.y);
        }
      } else {
        const screwInsetX =
          activeBorderId === "pill" ? Math.round(rw * 0.15) : 22;
        const screwInsetY =
          activeBorderId === "pill" ? Math.round(rh * 0.15) : 22;
        for (const s of [
          { x: rx + screwInsetX, y: ry + screwInsetY },
          { x: rx + rw - screwInsetX, y: ry + screwInsetY },
          { x: rx + screwInsetX, y: ry + rh - screwInsetY },
          { x: rx + rw - screwInsetX, y: ry + rh - screwInsetY },
        ]) {
          drawScrew(s.x, s.y);
        }
      }
    } else if (!isContourBoard) {
      // Düz Dikdörtgen Pleksi Pano (rect_clear veya rect_black)
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 16);
      if (isBlackBoard) {
        ctx.fillStyle = "#0A0A0E";
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 14;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 10;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // 4 Köşe Krom Yükseltme Vidaları
      const screwInset = 22;
      [
        { x: rx + screwInset, y: ry + screwInset },
        { x: rx + rw - screwInset, y: ry + screwInset },
        { x: rx + screwInset, y: ry + rh - screwInset },
        { x: rx + rw - screwInset, y: ry + rh - screwInset },
      ].forEach((s) => drawScrew(s.x, s.y));
    } else {
      // Gerçek Lazer Kesim Harf Kontur Tabanı (contour_clear veya contour_black)
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.textAlign =
        spec.align === "left"
          ? "left"
          : spec.align === "right"
            ? "right"
            : "center";
      ctx.textBaseline = "middle";

      const contourStrokeWidth = Math.round(canvasFontSize * 0.44);

      if (isBlackBoard) {
        // Siyah Pleksi Harf Konturu
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;
        ctx.lineWidth = contourStrokeWidth;
        ctx.strokeStyle = "#0A0A0E";
        ctx.fillStyle = "#0A0A0E";

        // Harf silueti
        formattedLines.forEach((lineText, idx) => {
          const lineY = startY + idx * lineSpacing;
          const lineX = getLineX();
          ctx.strokeText(lineText, lineX, lineY);
          ctx.fillText(lineText, lineX, lineY);
        });

        // Sembol silueti
        if (hasSymbol) {
          ctx.save();
          ctx.translate(symbolX, symbolY);
          const scale = symbolSize / 24;
          ctx.scale(scale, scale);
          const p = new Path2D(activeSymbol.svgPath);
          ctx.lineWidth = contourStrokeWidth / scale;
          ctx.stroke(p);
          ctx.fill(p);
          ctx.restore();
        }

        // İnce Parlak Kenar Rim
        ctx.shadowColor = "transparent";
        ctx.lineWidth = Math.round(contourStrokeWidth - 4);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        formattedLines.forEach((lineText, idx) => {
          const lineY = startY + idx * lineSpacing;
          const lineX = getLineX();
          ctx.strokeText(lineText, lineX, lineY);
        });
      } else {
        // Şeffaf Pleksi Harf Konturu (Lazer Kenar Kırılması ve Cam Gölgesi)
        ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 8;
        ctx.lineWidth = contourStrokeWidth;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillStyle = "rgba(255, 255, 255, 0.02)";

        formattedLines.forEach((lineText, idx) => {
          const lineY = startY + idx * lineSpacing;
          const lineX = getLineX();
          ctx.strokeText(lineText, lineX, lineY);
          ctx.fillText(lineText, lineX, lineY);
        });

        if (hasSymbol) {
          ctx.save();
          ctx.translate(symbolX, symbolY);
          const scale = symbolSize / 24;
          ctx.scale(scale, scale);
          const p = new Path2D(activeSymbol.svgPath);
          ctx.lineWidth = contourStrokeWidth / scale;
          ctx.stroke(p);
          ctx.restore();
        }

        // Cam Kenar Işığı (3D Lazer Kenar Çizgisi)
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        formattedLines.forEach((lineText, idx) => {
          const lineY = startY + idx * lineSpacing;
          const lineX = getLineX();
          ctx.strokeText(lineText, lineX, lineY);
        });
      }
      ctx.restore();
    }

    // 3. Neon Metin Çizimi (Canlı Işık & Cam Çekirdek)
    ctx.save();
    ctx.textAlign =
      spec.align === "left"
        ? "left"
        : spec.align === "right"
          ? "right"
          : "center";
    ctx.textBaseline = "middle";

    formattedLines.forEach((lineText, idx) => {
      const lineY = startY + idx * lineSpacing;
      const lineX = getLineX();

      if (isLit) {
        // 1. Katman: Geniş dış aurası
        ctx.shadowColor = `rgba(${activeColor.glowRgb}, 0.8)`;
        ctx.shadowBlur = 55;
        ctx.fillStyle = activeColor.hex;
        ctx.fillText(lineText, lineX, lineY);

        // 2. Katman: Orta gövde halesi
        ctx.shadowBlur = 18;
        ctx.shadowColor = activeColor.hex;
        ctx.fillStyle = activeColor.hex;
        ctx.fillText(lineText, lineX, lineY);

        // 3. Katman: İnce beyaz tüp çekirdeği
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 4;
        ctx.fillStyle = activeColor.hex;
        ctx.fillText(lineText, lineX, lineY);
      } else {
        ctx.fillStyle = activeColor.unlitHex;
        ctx.fillText(lineText, lineX, lineY);
      }
    });
    ctx.restore();

    // 4. Vektörel SVG Sembol Çizimi (Bağımsız Path2D & Kendi Neon Rengi)
    if (hasSymbol) {
      ctx.save();
      ctx.translate(symbolX, symbolY);
      const scale = symbolSize / 24;
      ctx.scale(scale, scale);

      const symbolPath = new Path2D(activeSymbol.svgPath);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (isLit) {
        // 1. Dış Hâlâ
        ctx.shadowColor = `rgba(${activeSymbolColor.glowRgb}, 0.85)`;
        ctx.shadowBlur = 32 / scale;
        ctx.strokeStyle = activeSymbolColor.hex;
        ctx.lineWidth = 2.4;
        ctx.stroke(symbolPath);

        // 2. Orta Canlı Hâlâ
        ctx.shadowBlur = 14 / scale;
        ctx.shadowColor = activeSymbolColor.hex;
        ctx.strokeStyle = activeSymbolColor.hex;
        ctx.lineWidth = 2.0;
        ctx.stroke(symbolPath);

        // 3. İç Beyaz Tüp Çekirdeği
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 3 / scale;
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.3;
        ctx.stroke(symbolPath);
      } else {
        ctx.strokeStyle = activeSymbolColor.unlitHex;
        ctx.lineWidth = 2.0;
        ctx.stroke(symbolPath);
      }
      ctx.restore();
    }

    // 5. Teknik Ölçü Kılavuz Çizgileri ve Okları (Her Zaman Çizilir)
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1;

    // A) Alt Genişlik Ölçü Oku (X Ekseni)
    const dimY = ry + rh + 38;
    const dimX1 = rx;
    const dimX2 = rx + rw;

    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(dimX1, dimY);
    ctx.lineTo(dimX2, dimY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sol/Sağ Ok Başları
    ctx.beginPath();
    ctx.moveTo(dimX1 + 8, dimY - 4);
    ctx.lineTo(dimX1, dimY);
    ctx.lineTo(dimX1 + 8, dimY + 4);
    ctx.moveTo(dimX2 - 8, dimY - 4);
    ctx.lineTo(dimX2, dimY);
    ctx.lineTo(dimX2 - 8, dimY + 4);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "700 14px monospace";
    ctx.fillText(`${estimate.widthCm}cm`, 800, dimY + 6);
    ctx.font = "400 11px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(
      activeBorderId === "circle" ? "çap ölçüsü" : "akrilik genişlik",
      800,
      dimY + 24,
    );

    // B) Sağ Yükseklik Ölçü Oku (Y Ekseni)
    const dimHX = rx + rw + 38;
    const dimHY1 = ry;
    const dimHY2 = ry + rh;

    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(dimHX, dimHY1);
    ctx.lineTo(dimHX, dimHY2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Üst/Alt Ok Başları
    ctx.beginPath();
    ctx.moveTo(dimHX - 4, dimHY1 + 8);
    ctx.lineTo(dimHX, dimHY1);
    ctx.lineTo(dimHX + 4, dimHY1 + 8);
    ctx.moveTo(dimHX - 4, dimHY2 - 8);
    ctx.lineTo(dimHX, dimHY2);
    ctx.lineTo(dimHX + 4, dimHY2 - 8);
    ctx.stroke();

    ctx.save();
    ctx.translate(dimHX + 18, (dimHY1 + dimHY2) / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "700 14px monospace";
    ctx.fillText(`${estimate.heightCm}cm`, 0, 0);
    ctx.font = "400 10px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("yükseklik", 0, 14);
    ctx.restore();

    ctx.restore();

    // Alt Teknik Bilgi Tablosu
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fillStyle = "#0A0A0E";
    ctx.fillRect(80, 820, 1440, 110);
    ctx.strokeRect(80, 820, 1440, 110);

    const cols = [
      {
        title: "TABELA METNİ",
        val:
          formattedText.length > 16
            ? `${formattedText.slice(0, 15).trimEnd()}…`
            : formattedText,
      },
      {
        title: "AKRİLİK ÖLÇÜ",
        val: `${estimate.widthCm} × ${estimate.heightCm} cm`,
      },
      { title: "TOPLAM METRAJ", val: `~${estimate.neonLengthMeters} m` },
      {
        title: "KULLANIM ALANI",
        val: spec.environment === "outdoor" ? "Dış Mekan" : "İç Mekan",
      },
      {
        title: "TAHMİNİ ARALIK",
        val: `${estimate.minPrice.toLocaleString("tr-TR")} - ${estimate.maxPrice.toLocaleString("tr-TR")} ₺`,
      },
      { title: "ÜRETİCİ ATÖLYE", val: "CC NEON'S" },
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
    if (isOrdering || cooldownSeconds > 0) return;
    if (typeof window !== "undefined") {
      try {
        const lastOrderTime = Number(
          sessionStorage.getItem("ccneons_order_cooldown") || 0,
        );
        const elapsed = Math.floor((Date.now() - lastOrderTime) / 1000);
        if (elapsed < 15) {
          setCooldownSeconds(15 - elapsed);
          return;
        }
      } catch {}
    }
    setIsOrdering(true);
    setOrderStatus("Teknik pafta hazırlanıyor...");

    try {
      syncUrlHash(spec);
      const liveUrl =
        typeof window !== "undefined" ? window.location.href : undefined;
      const dataUrl = await generatePaftaDataUrl();

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
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "ccneons_order_cooldown",
            Date.now().toString(),
          );
        } catch {}
      }
      setCooldownSeconds(15);
      setIsOrdering(false);
      setOrderStatus(null);
    }
  }

  async function handleExportPng() {
    const dataUrl = await generatePaftaDataUrl();
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

  const isBlackBackboard = activeBackboard.colorType === "black";
  const isContourBackboard = activeBackboard.cutType === "contour";
  const hasExplicitFrame = !isContourBackboard || activeBorderId !== "none";
  const acrylicPlateBg = isBlackBackboard
    ? "bg-[#0A0A0E]/95 shadow-[inset_0_0_30px_rgba(0,0,0,0.95)]"
    : "bg-[#0A0A0E]/65 backdrop-blur-[2px]";

  const maxCharsInLine = Math.max(...formattedLines.map((l) => l.length), 1);
  const hasHorizontalSymbol =
    activeSymbolId !== "none" &&
    (activeSymbolPos === "left" || activeSymbolPos === "right");
  const totalCharsWithSymbol =
    maxCharsInLine + (hasHorizontalSymbol ? 2.8 * activeSymbolScale : 0);
  const isMobileViewport = viewportPx.w < 640;
  const sizeStageFactor =
    spec.sizeId === "xs"
      ? 0.8
      : spec.sizeId === "sm"
        ? 0.9
        : spec.sizeId === "md"
          ? 1.0
          : spec.sizeId === "lg"
            ? 1.12
            : spec.sizeId === "xl"
              ? 1.24
              : 1.36;
  const lineCountScale =
    formattedLines.length >= 6
      ? 0.62
      : formattedLines.length === 5
        ? 0.69
        : formattedLines.length === 4
          ? 0.77
          : formattedLines.length === 3
            ? 0.85
            : formattedLines.length === 2
              ? 0.93
              : 1.0;
  // Tüm çerçeve tiplerinde (Sade, Dikdörtgen, Kapsül, Daire, Bilet) ortak sahne ölçeği:
  // Hem mobil hem masaüstünde güçlü ve doyurucu görünür, boyut değiştirildiğinde her kademede belirgin büyür.
  const charDensityScale = Math.min(
    1.0,
    Math.max(0.62, 12.6 / Math.max(totalCharsWithSymbol, 7.5)),
  );
  const circleFontScale = Math.min(
    1.0,
    Math.max(0.55, charDensityScale * lineCountScale),
  );
  const maxPreviewFontRem = Math.min(
    3.9 * sizeStageFactor * circleFontScale,
    (12.6 * sizeStageFactor) / Math.max(formattedLines.length, 2.2),
    14.4 / Math.max(formattedLines.length, 2.2),
  );
  const mobileHorizontalCeilingRem =
    ((Math.max(320, viewportPx.w) - 108) /
      16 /
      Math.max(totalCharsWithSymbol * 0.58, 3.1)) *
    (0.84 + (sizeStageFactor - 0.8) * 0.55);
  const minPreviewFontRem = Math.min(
    maxPreviewFontRem,
    mobileHorizontalCeilingRem,
    (11.4 * sizeStageFactor) / Math.max(formattedLines.length, 2.1),
    Math.max(1.35 * sizeStageFactor, 3.15 * sizeStageFactor * circleFontScale),
  );
  const previewFontSizeCss = isMobileViewport
    ? `${minPreviewFontRem.toFixed(2)}rem`
    : `clamp(${minPreviewFontRem.toFixed(2)}rem, calc(${(minPreviewFontRem * 0.65).toFixed(2)}rem + ${(2.45 * sizeStageFactor * circleFontScale).toFixed(2)}vw), ${maxPreviewFontRem.toFixed(2)}rem)`;
  const maxPreviewSymRem = Math.min(
    3.6 * sizeStageFactor * circleFontScale * activeSymbolScale,
    5.4 * sizeStageFactor * activeSymbolScale * lineCountScale,
  );
  const minPreviewSymRem = Math.min(
    maxPreviewSymRem,
    Math.max(
      1.55 * sizeStageFactor * activeSymbolScale,
      2.75 * sizeStageFactor * circleFontScale * activeSymbolScale,
    ),
  );
  const previewSymbolSizeCss = isMobileViewport
    ? `${minPreviewSymRem.toFixed(2)}rem`
    : `clamp(${minPreviewSymRem.toFixed(2)}rem, calc(${(minPreviewSymRem * 0.65).toFixed(2)}rem + ${(2.1 * sizeStageFactor * circleFontScale * activeSymbolScale).toFixed(2)}vw), ${maxPreviewSymRem.toFixed(2)}rem)`;

  // Lazer Kesim Akrilik Taban Stilleri (Şeffaf Kristal Cam & Piyano Siyahı)
  const acrylicGlassPlateBg = isBlackBackboard
    ? "bg-[#0A0A0E]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.15)]"
    : "bg-white/[0.04] border border-white/30 backdrop-blur-[2px] shadow-[0_16px_40px_rgba(0,0,0,0.55),inset_0_1.5px_0_rgba(255,255,255,0.4),inset_0_-1px_0_rgba(255,255,255,0.1)]";

  // Kuyruklu harfler (p, g, y, j, q) ve oval/daire kavis payı için dengeli iç boşluk
  const hasDescenderRisk = spec.fontId === "script" || spec.fontId === "italic";
  const tailoredPaddingClass =
    formattedLines.length >= 3
      ? "py-6 sm:py-9 px-7 sm:px-12"
      : hasDescenderRisk
        ? "pt-7 sm:pt-11 pb-9 sm:pb-13 px-8 sm:px-16"
        : "py-7 sm:py-11 px-8 sm:px-16";
  const pillPaddingClass =
    contentSizePx.w > 0
      ? "px-7 py-5"
      : formattedLines.length >= 3
        ? "py-9 sm:py-12 px-14 sm:px-22"
        : "py-8 sm:py-11 px-14 sm:px-20";
  const circlePaddingClass = contentSizePx.w > 0 ? "p-6" : "p-10 sm:p-14";

  // Tüm çerçeveler için dengeli sahne geometrisi:
  // Daire 1:1 tam çember, Kapsül yatay stadyum (width >= height * 1.52), Dikdörtgen/Bilet boyut kademesine duyarlı kutu
  const frameGeometryStyle: Record<string, string> = (() => {
    const maxViewportW = Math.max(
      240,
      viewportPx.w - (isMobileViewport ? 64 : 120),
    );
    const maxViewportH = Math.max(
      240,
      viewportPx.h - (isMobileViewport ? 265 : 295),
    );
    if (activeBorderId === "circle") {
      if (contentSizePx.w <= 0 || contentSizePx.h <= 0) return {};
      const diagFactor = formattedLines.length >= 3 ? 0.88 : 0.98;
      const padPx = Math.round(
        (formattedLines.length >= 3
          ? isMobileViewport
            ? 38
            : 48
          : isMobileViewport
            ? 48
            : 62) * sizeStageFactor,
      );
      const minCirclePx = Math.round(
        (isMobileViewport ? 195 : 225) * sizeStageFactor,
      );
      const rawDia = Math.max(
        minCirclePx,
        Math.ceil(
          Math.hypot(
            contentSizePx.w * diagFactor,
            contentSizePx.h * diagFactor,
          ) + padPx,
        ),
      );
      const d = Math.min(maxViewportW, maxViewportH, rawDia);
      return {
        width: `${d}px`,
        height: `${d}px`,
        minWidth: `${d}px`,
        minHeight: `${d}px`,
      };
    }
    if (activeBorderId === "pill") {
      if (contentSizePx.w <= 0 || contentSizePx.h <= 0) return {};
      const minPillH = Math.round(
        (isMobileViewport ? 115 : 135) * sizeStageFactor,
      );
      const pillPadY = Math.round(
        (formattedLines.length >= 3
          ? isMobileViewport
            ? 38
            : 48
          : isMobileViewport
            ? 46
            : 58) * sizeStageFactor,
      );
      const pillH = Math.min(
        maxViewportH,
        Math.max(minPillH, Math.ceil(contentSizePx.h + pillPadY)),
      );
      const pillW = Math.min(
        maxViewportW,
        Math.max(
          Math.ceil(contentSizePx.w + pillH * 0.48 + 28 * sizeStageFactor),
          Math.ceil(pillH * 1.54),
        ),
      );
      return {
        width: `${pillW}px`,
        height: `${pillH}px`,
        minWidth: `${pillW}px`,
        minHeight: `${pillH}px`,
      };
    }
    if (hasExplicitFrame) {
      const minBoxW = Math.min(
        maxViewportW,
        Math.round((isMobileViewport ? 195 : 265) * sizeStageFactor),
      );
      const minBoxH = Math.min(
        maxViewportH,
        Math.round((isMobileViewport ? 95 : 118) * sizeStageFactor),
      );
      const padX = Math.round(
        (formattedLines.length >= 3
          ? isMobileViewport
            ? 24
            : 38
          : isMobileViewport
            ? 30
            : 48) * sizeStageFactor,
      );
      const padTop = Math.round(
        (formattedLines.length >= 3
          ? isMobileViewport
            ? 20
            : 28
          : isMobileViewport
            ? 24
            : 34) * sizeStageFactor,
      );
      const padBottom =
        hasDescenderRisk && formattedLines.length < 3 ? padTop + 8 : padTop;
      return {
        minWidth: `${minBoxW}px`,
        minHeight: `${minBoxH}px`,
        paddingLeft: `${padX}px`,
        paddingRight: `${padX}px`,
        paddingTop: `${padTop}px`,
        paddingBottom: `${padBottom}px`,
      };
    }
    return {};
  })();

  const backboardShapeClass =
    activeBorderId === "circle"
      ? `aspect-square rounded-full flex items-center justify-center ${circlePaddingClass} relative ${acrylicGlassPlateBg}`
      : activeBorderId === "pill"
        ? `flex items-center justify-center rounded-full ${pillPaddingClass} relative ${acrylicGlassPlateBg}`
        : activeBorderId === "ticket"
          ? `flex items-center justify-center rounded-3xl border-dashed ${tailoredPaddingClass} ${acrylicGlassPlateBg}`
          : activeBackboard.cutType === "rectangle"
            ? `flex items-center justify-center rounded-xl ${acrylicGlassPlateBg} ${tailoredPaddingClass}`
            : activeBorderId !== "none"
              ? `flex items-center justify-center rounded-xl ${acrylicGlassPlateBg} ${tailoredPaddingClass}`
              : `relative flex items-center justify-center p-4 sm:p-6`;

  const neonBorderStyle =
    activeBorderId !== "none"
      ? {
          borderColor: isLit ? "#FFFFFF" : activeColor.unlitHex,
          boxShadow: isLit
            ? `0 0 14px rgba(${activeColor.glowRgb}, 0.95), inset 0 0 14px rgba(${activeColor.glowRgb}, 0.6), 0 0 38px rgba(${activeColor.glowRgb}, 0.5)`
            : "none",
          ...frameGeometryStyle,
        }
      : hasExplicitFrame
        ? { ...frameGeometryStyle }
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
      <header class="h-14 sm:h-16 shrink-0 w-full border-b border-white/[0.07] bg-[#0A0A0E] px-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 z-30">
        <div class="flex items-center gap-2 sm:gap-5">
          <a
            href="/"
            class="cursor-pointer flex items-center gap-2 focus-visible:outline-none"
          >
            <span class="font-display text-base sm:text-xl font-bold tracking-tight text-white">
              CC NEON'S
              <span class="text-[10px] sm:text-xs font-mono text-white/45 ml-0.5">
                ™
              </span>
            </span>
          </a>

          <span class="hidden sm:inline-block h-4 w-px bg-white/10" />

          <span
            class="hidden sm:inline-block font-mono text-xs font-bold uppercase tracking-widest"
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

        <div class="flex items-center gap-2.5 sm:gap-5">
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
              class="block font-mono text-sm sm:text-xl font-bold text-white leading-tight"
            >
              {estimate.minPrice.toLocaleString("tr-TR")} ₺
              <span class="hidden sm:inline text-white/70">
                {" "}
                – {estimate.maxPrice.toLocaleString("tr-TR")} ₺
              </span>
            </output>
            <span class="font-mono block text-[9px] sm:text-[11px] text-white/55 font-medium leading-none mt-0.5">
              <span
                class="hidden sm:inline-block size-1.5 rounded-full mr-1"
                style={{ backgroundColor: activeColor.hex }}
              />
              <span>{NEON_SIZES[spec.sizeId].label}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleOrderClick}
            disabled={isOrdering || cooldownSeconds > 0}
            title={
              cooldownSeconds > 0
                ? `Lütfen bekleyin (${cooldownSeconds}s)`
                : "Sipariş Ver / Sepete Ekle"
            }
            aria-label="Sipariş Ver"
            class="cursor-pointer whitespace-nowrap inline-flex h-9 sm:h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3 sm:px-6 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:border-[var(--neon-color)] hover:bg-white/[0.15] hover:shadow-[0_0_24px_rgba(var(--neon-rgb),0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isOrdering ? (
              <svg
                class="size-4 animate-spin text-[var(--neon-color)]"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            ) : cooldownSeconds > 0 ? (
              <span class="text-white/60 font-mono text-[11px]">
                {cooldownSeconds}s BEKLEYİN
              </span>
            ) : (
              <>
                <svg
                  class="size-4 sm:hidden"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span class="hidden sm:inline">SİPARİŞ VER →</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. ANA TAM EKRAN ÇALIŞMA ALANI (Sol İkon Rayı + Açılır/Kapanır Çekmece + Sağ CAD Sahnesi) */}
      <div class="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* BÖLGE A: Sol İnce Dikey İkon Rayı (Masaüstünde sol ray, mobilde gizli çünkü mobilde en altta Bottom Bar var) */}
        <nav
          aria-label="Tasarım Adımları"
          data-lenis-prevent
          class="hidden lg:flex studio-drawer-scroll flex-col shrink-0 overflow-y-auto border-r border-white/[0.07] bg-[#050505] w-[72px]"
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
                class={`cursor-pointer relative flex flex-col items-center justify-center gap-1.5 py-4 w-full text-center transition-all duration-150 border-b border-white/[0.04] ${
                  isActive
                    ? "bg-[#0A0A0E] text-white"
                    : "text-white/50 hover:bg-white/[0.03] hover:text-white/85"
                }`}
              >
                {isActive && (
                  <span
                    class="absolute inset-y-0 left-0 w-0.5 h-full"
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

        {/* BÖLGE B: Sol Araç Çekmecesi (Masaüstünde sol sabit panel; mobilde ise alttan açılan Bottom Sheet) */}
        {(isDrawerOpen || isMobileSheetOpen) && (
          <aside
            data-lenis-prevent
            class={`shrink-0 border-white/[0.07] bg-[#0A0A0E] flex flex-col z-40 transition-all duration-300 ${
              isMobileSheetOpen
                ? "fixed inset-x-0 bottom-0 max-h-[82vh] rounded-t-3xl border-t shadow-[0_-12px_40px_rgba(0,0,0,0.9)] lg:static lg:rounded-none lg:border-t-0 lg:border-r lg:shadow-none lg:w-[380px] xl:w-[400px] lg:max-h-none"
                : "hidden lg:flex lg:w-[380px] xl:w-[400px] lg:border-r lg:max-h-none"
            }`}
          >
            {/* Mobilde sürükleme / kapatma kulpu (Sheet Handle) */}
            <div class="lg:hidden flex items-center justify-center pt-2.5 pb-1">
              <span class="h-1.5 w-12 rounded-full bg-white/20" />
            </div>

            {/* Çekmece Üst Başlığı + KingsOfNeon Tarzı Aksiyon Butonları (Reset, Undo, Onay ✓) */}
            <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.07]">
              <div>
                <h1 class="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-white flex items-center gap-2">
                  <span>{TABS.find((t) => t.id === activeTab)?.label}</span>
                  <span class="lg:hidden text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    ADIM {TABS.findIndex((t) => t.id === activeTab) + 1}/
                    {TABS.length}
                  </span>
                </h1>
                <p class="hidden sm:block mt-0.5 text-xs text-white/55 leading-relaxed">
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
                  {activeTab === "buy" &&
                    "Manavgat atölyemizde üretilecek tam teknik reçete ve teslimat takvimi."}
                </p>
              </div>

              {/* Sağ Aksiyon Grubu: Sıfırla + Geri Al + Mobil Onay (✓) / Masaüstü Daralt («) */}
              <div class="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "text")
                      updateSpec({
                        text: "Open Late",
                        symbolId: "none",
                        symbolPosition: "right",
                        symbolScale: 1,
                      });
                    else if (activeTab === "font")
                      updateSpec({ fontId: "script" });
                    else if (activeTab === "color")
                      updateSpec({ colorId: "cyan", symbolColorId: "cyan" });
                    else if (activeTab === "borders")
                      updateSpec({ borderId: "none" });
                    else if (activeTab === "size") updateSpec({ sizeId: "md" });
                    else if (activeTab === "acrylic")
                      updateSpec({ backboardId: "contour_clear" });
                  }}
                  title="Bu adımı varsayılana sıfırla"
                  class="cursor-pointer rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-semibold text-white/75 hover:bg-white/10 hover:text-white"
                >
                  Sıfırla
                </button>

                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Geri Al"
                  aria-label="Geri Al"
                  class="cursor-pointer inline-flex size-7.5 sm:size-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] font-mono text-xs text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ↩
                </button>

                {/* Mobilde Yeşil Tik Onay Butonu (Görseldeki Gibi Sheet'i Kapatıp Sahneye Döner) */}
                <button
                  type="button"
                  onClick={() => setIsMobileSheetOpen(false)}
                  title="Uygula ve Önizlemeye Dön"
                  aria-label="Uygula ve Önizlemeye Dön"
                  class="lg:hidden cursor-pointer inline-flex size-8 items-center justify-center rounded-full bg-[#1CFF8A] text-black font-bold text-sm shadow-[0_0_12px_rgba(28,255,138,0.4)] active:scale-95 transition-transform"
                >
                  ✓
                </button>

                {/* Masaüstü Daraltma Butonu */}
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
            </div>

            {/* Çekmece Kaydırılabilir İçerik Gövdesi (Mobilde alt navigasyon barını aşması için pb-32 eklendi) */}
            <div
              key={activeTab}
              class="studio-drawer-scroll flex-1 overflow-y-auto p-4 sm:p-5 pb-32 lg:pb-6 space-y-4"
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

                    {/* Seçili Fontla Canlı Çok Satırlı Yazı Alanı (Enter tuşu ile yeni satır) */}
                    <div
                      class="relative rounded-xl border-2 bg-[#0A0A0E] px-3.5 pt-3 pb-7 transition-colors"
                      style={{
                        borderColor: estimate.isSizeConstrained
                          ? "#FFB020"
                          : activeColor.hex,
                      }}
                    >
                      <textarea
                        id="neon-text-input"
                        rows={
                          estimate.lineCount > 1
                            ? Math.min(estimate.lineCount, 4)
                            : 1
                        }
                        maxLength={65}
                        value={spec.text}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          const cappedLines = target.value
                            .split(/\r?\n/)
                            .slice(0, 4);
                          let nonSpaceCount = 0;
                          let sanitized = "";
                          for (let i = 0; i < cappedLines.length; i++) {
                            if (i > 0) sanitized += "\n";
                            for (const ch of cappedLines[i]) {
                              if (/\s/.test(ch)) {
                                sanitized += ch;
                              } else if (nonSpaceCount < 45) {
                                sanitized += ch;
                                nonSpaceCount++;
                              }
                            }
                          }
                          if (target.value !== sanitized) {
                            target.value = sanitized;
                          }
                          updateSpec({ text: sanitized }, true, true);
                        }}
                        placeholder="Open Late&#10;(En fazla 4 satır, 45 harf)"
                        style={{ fontFamily: activeFont.cssFamily }}
                        class="w-full resize-none bg-transparent text-xl sm:text-2xl text-white placeholder:text-white/25 focus:outline-none leading-snug"
                      />
                      <div class="absolute bottom-2 left-3.5 right-3 flex items-center justify-between font-mono text-[11px]">
                        <span class="text-white/45">
                          {estimate.lineCount > 1
                            ? `${estimate.lineCount} / 4 SATIR`
                            : "TEK SATIR"}{" "}
                          · {spec.text.replace(/\s+/g, "").length} / 45
                        </span>
                        <span class="text-[10px] text-white/35">
                          ↵ Enter ile alt satır (maks. 4)
                        </span>
                      </div>
                    </div>

                    {/* Boyut Sıkışma / Üretilebilirlik Uyarısı & Otomatik Tavsiye */}
                    {estimate.isSizeConstrained && (
                      <div class="rounded-xl border border-[#FFB020]/40 bg-[#FFB020]/10 p-3 flex flex-col gap-1.5 text-left font-mono">
                        <div class="flex items-center gap-2 text-xs font-bold text-[#FFB020]">
                          <span>⚠️</span>
                          <span>ATÖLYE ÜRETİM UYARISI</span>
                        </div>
                        <p class="text-[11px] text-white/80 leading-relaxed">
                          Yazınızın uzunluğu seçtiğiniz{" "}
                          <strong>{NEON_SIZES[spec.sizeId].label}</strong> için
                          sıkışık kalabilir. 6mm LED tüp kıvrımının net
                          okunabilmesi için minimum{" "}
                          <strong>~{estimate.minRecommendedWidthCm} cm</strong>{" "}
                          tavsiye edilir.
                        </p>
                        {estimate.recommendedSizeId &&
                          estimate.recommendedSizeId !== spec.sizeId &&
                          (() => {
                            const recSize = estimate.recommendedSizeId;
                            return (
                              <button
                                type="button"
                                onClick={() =>
                                  updateSpec({
                                    sizeId: recSize,
                                  })
                                }
                                class="cursor-pointer mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#FFB020] bg-[#FFB020]/20 px-2.5 py-1 text-[11px] font-bold text-[#FFB020] hover:bg-[#FFB020]/35 transition-colors"
                              >
                                <span>
                                  ⚡ {NEON_SIZES[recSize].label} Ebadına Yükselt
                                </span>
                              </button>
                            );
                          })()}
                      </div>
                    )}

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

                    {activeSymbolId !== "none" && (
                      <div class="mt-3 pt-3 border-t border-white/[0.08] space-y-3">
                        {/* Sembol Konumu (Sol / Üst / Alt / Sağ) */}
                        <div class="space-y-1.5">
                          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/55">
                            <span>SEMBOL KONUMU</span>
                            <span class="text-[#35E7FF] font-bold">
                              {activeSymbolPos === "left"
                                ? "SOL"
                                : activeSymbolPos === "top"
                                  ? "ÜST"
                                  : activeSymbolPos === "bottom"
                                    ? "ALT"
                                    : "SAĞ"}
                            </span>
                          </div>
                          <div class="grid grid-cols-4 gap-1.5">
                            {(
                              [
                                { id: "left", label: "← Sol" },
                                { id: "top", label: "↑ Üst" },
                                { id: "bottom", label: "↓ Alt" },
                                { id: "right", label: "Sağ →" },
                              ] as { id: NeonSymbolPosition; label: string }[]
                            ).map((posItem) => {
                              const isCurrentPos =
                                activeSymbolPos === posItem.id;
                              return (
                                <button
                                  key={posItem.id}
                                  type="button"
                                  onClick={() =>
                                    updateSpec({ symbolPosition: posItem.id })
                                  }
                                  class={`cursor-pointer rounded-lg border py-1.5 font-mono text-[11px] font-semibold transition-all ${
                                    isCurrentPos
                                      ? "border-[#35E7FF] bg-[#35E7FF]/15 text-[#35E7FF]"
                                      : "border-white/10 bg-[#0A0A0E] text-white/65 hover:border-white/25 hover:text-white"
                                  }`}
                                >
                                  {posItem.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sembol Büyüklüğü (0.6x - 1.8x) */}
                        <div class="space-y-1.5">
                          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/55">
                            <label for="symbol-scale-slider">
                              SEMBOL BÜYÜKLÜĞÜ
                            </label>
                            <span class="text-[#35E7FF] font-bold">
                              %{Math.round(activeSymbolScale * 100)} (
                              {activeSymbolScale.toFixed(1)}x)
                            </span>
                          </div>
                          <input
                            id="symbol-scale-slider"
                            type="range"
                            min="0.6"
                            max="1.8"
                            step="0.1"
                            value={activeSymbolScale}
                            onInput={(e) => {
                              const val = Number(
                                (e.target as HTMLInputElement).value,
                              );
                              updateSpec({ symbolScale: val }, true, true);
                            }}
                            class="w-full accent-[#35E7FF] cursor-pointer h-1.5 rounded-lg bg-white/15"
                          />
                          <div class="grid grid-cols-4 gap-1.5 pt-0.5">
                            {[
                              { val: 0.7, label: "Küçük" },
                              { val: 1.0, label: "Standart" },
                              { val: 1.3, label: "Büyük" },
                              { val: 1.6, label: "Dev" },
                            ].map((preset) => {
                              const isCurrentScale =
                                Math.abs(activeSymbolScale - preset.val) < 0.05;
                              return (
                                <button
                                  key={preset.label}
                                  type="button"
                                  onClick={() =>
                                    updateSpec({ symbolScale: preset.val })
                                  }
                                  class={`cursor-pointer rounded-md border py-1 font-mono text-[10px] transition-colors ${
                                    isCurrentScale
                                      ? "border-[#35E7FF]/70 bg-[#35E7FF]/15 text-[#35E7FF] font-bold"
                                      : "border-white/10 bg-[#0A0A0E] text-white/55 hover:border-white/25 hover:text-white"
                                  }`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
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
                            <span class="font-mono mt-0.5 text-[10px] text-white/70">
                              {sizeItem.tubeGaugeMm}
                            </span>
                            <span class="mt-1 text-[11px] text-white/50">
                              {sizeItem.recommendedFor}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  {(() => {
                    const humanPx = 115; // 170cm = 115px (y=20 to y=135)
                    const cmScale = humanPx / 170; // ~0.676 px/cm
                    const rawW = Math.max(
                      28,
                      Math.round(estimate.widthCm * cmScale),
                    );
                    const rawH = Math.max(
                      20,
                      Math.round(estimate.heightCm * cmScale),
                    );
                    const fitScale = Math.min(1, 215 / rawW, 118 / rawH);
                    const signW = Math.max(28, Math.round(rawW * fitScale));
                    const signH = Math.max(20, Math.round(rawH * fitScale));
                    const signCenterX = 230;
                    const signCenterY = 74;
                    const signX = Math.round(signCenterX - signW / 2);
                    const signY = Math.round(signCenterY - signH / 2);
                    const isCircle = activeBorderId === "circle";
                    const isPill = activeBorderId === "pill";
                    const radius = Math.round(Math.min(signW, signH) / 2);

                    return (
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
                          {/* Zemin çizgisi */}
                          <line
                            x1="25"
                            y1="135"
                            x2="335"
                            y2="135"
                            stroke="rgba(255,255,255,0.12)"
                            stroke-width="1"
                            stroke-dasharray="3 3"
                          />

                          {/* 170 cm Yükseklik Cetveli */}
                          <line
                            x1="45"
                            y1="20"
                            x2="45"
                            y2="135"
                            stroke="rgba(255,255,255,0.2)"
                            stroke-width="1"
                          />
                          <path
                            d="M42 24 L45 20 L48 24 M42 131 L45 135 L48 131"
                            stroke="rgba(255,255,255,0.3)"
                            stroke-width="1"
                            fill="none"
                          />
                          <text
                            x="24"
                            y="78"
                            fill="rgba(255,255,255,0.5)"
                            font-size="9"
                            font-family="monospace"
                            text-anchor="middle"
                          >
                            170cm
                          </text>

                          {/* 170 cm İnsan Silüeti */}
                          <circle
                            cx="75"
                            cy="30"
                            r="10"
                            fill="rgba(255,255,255,0.25)"
                          />
                          <path
                            d="M58 55 C58 43, 92 43, 92 55 L90 95 L84 95 L82 135 L68 135 L66 95 L60 95 Z"
                            fill="rgba(255,255,255,0.25)"
                          />

                          {/* Tabela Gövdesi (Gerçek Ölçekli & Seçili Çerçeve Formunda) */}
                          {isCircle ? (
                            <circle
                              cx={signCenterX}
                              cy={signCenterY}
                              r={radius}
                              fill={`rgba(${activeColor.glowRgb}, 0.16)`}
                              stroke={activeColor.hex}
                              stroke-width="1.5"
                            />
                          ) : (
                            <rect
                              x={signX}
                              y={signY}
                              width={signW}
                              height={signH}
                              rx={isPill ? Math.round(signH / 2) : 6}
                              fill={`rgba(${activeColor.glowRgb}, 0.16)`}
                              stroke={activeColor.hex}
                              stroke-width="1.5"
                            />
                          )}

                          {/* Tabela Ölçü Metni */}
                          <text
                            x={signCenterX}
                            y={signCenterY + 4}
                            fill="#FFFFFF"
                            font-size={Math.min(
                              11,
                              Math.max(8, Math.round(signH * 0.28)),
                            )}
                            font-weight="bold"
                            font-family="monospace"
                            text-anchor="middle"
                          >
                            {isCircle
                              ? `Ø${estimate.widthCm}cm`
                              : `${estimate.widthCm}×${estimate.heightCm}cm`}
                          </text>
                        </svg>
                      </div>
                    );
                  })()}
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

              {/* SEKME 7: REÇETE & SİPARİŞ */}
              {activeTab === "buy" && (
                <div class="space-y-3.5">
                  <label class="cursor-pointer flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#050505] p-3 hover:border-white/20 transition-colors">
                    <div class="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={!!spec.includeInstallation}
                        onChange={(e) =>
                          updateSpec({
                            includeInstallation: (e.target as HTMLInputElement)
                              .checked,
                          })
                        }
                        class="size-4 accent-[#35E7FF] rounded cursor-pointer"
                      />
                      <div>
                        <span class="block text-xs font-bold text-white">
                          Manavgat & Antalya Yerinde Montaj
                        </span>
                        <span class="text-[11px] text-white/50">
                          Atölye ekibimizce adrese teslim ve profesyonel montaj
                        </span>
                      </div>
                    </div>
                    <span class="font-mono text-xs font-bold text-[#35E7FF]">
                      +1.000 ₺
                    </span>
                  </label>
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
                          ? ` + ${activeSymbol.label} (${activeSymbolPos === "left" ? "Sol" : activeSymbolPos === "top" ? "Üst" : activeSymbolPos === "bottom" ? "Alt" : "Sağ"}, %${Math.round(activeSymbolScale * 100)})`
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
                      <span>LED Metraj:</span>
                      <strong class="text-[#35E7FF]">
                        ~{estimate.neonLengthMeters} metre
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
                    disabled={isOrdering || cooldownSeconds > 0}
                    class="cursor-pointer flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#1CFF8A]/50 bg-[#1CFF8A]/15 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#1CFF8A]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isOrdering ? (
                      <span>{orderStatus || "HAZIRLANIYOR..."}</span>
                    ) : cooldownSeconds > 0 ? (
                      <span class="text-white/70">
                        LÜTFEN BEKLEYİN ({cooldownSeconds} sn)...
                      </span>
                    ) : (
                      <span>BU REÇETEYİ WHATSAPP'TAN SİPARİŞ ET →</span>
                    )}
                  </button>
                </div>
              )}

              {/* Alt Bilgi / İpucu Kutusu (Masaüstünde Gösterilir, Mobilde Yer Tasarrufu İçin Gizlenir) */}
              <div class="hidden sm:flex rounded-xl border border-[#35E7FF]/20 bg-[#35E7FF]/[0.05] p-3.5 items-start gap-2.5 text-left">
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

        {/* BÖLGE C: SAĞ TAM SAHNE CAD ÖNİZLEME ALANI (Geriye Kalan Tüm Alan / Mobilde Ekranın Tamamı) */}
        <div
          ref={stageRef}
          class={`relative flex-1 min-h-[460px] lg:min-h-0 h-full flex flex-col justify-between overflow-hidden transition-colors duration-300 lg:border-l border-white/[0.07] ${wallTextureClass}`}
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
          {/* Çekmece Daraltıldığında Sol Üstte Beliren "Paneli Aç »" Butonu */}
          {!isDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              class="hidden lg:inline-flex cursor-pointer absolute top-6 left-6 z-30 items-center gap-2 rounded-xl border border-white/15 bg-[#0A0A0E]/90 px-3.5 py-2 font-mono text-xs font-semibold text-white backdrop-blur-md transition-colors hover:border-white/35 shadow-lg"
            >
              <span>» Araç Panelini Aç</span>
            </button>
          )}
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

          {/* CAD KUTUSU ÜST BAŞLIK: "GÖRSEL ÖNİZLEME" + Sahne Kontrolleri (Mobilde Sade İkon Çubuğu) */}
          <div class="relative z-20 shrink-0 flex items-center justify-between gap-2 px-3.5 pt-3 sm:px-8 sm:pt-6">
            <div class="text-left">
              <h2
                class="hidden sm:block font-display text-xl sm:text-2xl font-bold uppercase tracking-wide"
                style={{ color: activeColor.hex }}
              >
                GÖRSEL ÖNİZLEME
              </h2>
              <p class="hidden sm:block mt-0.5 max-w-md text-xs text-white/60 leading-relaxed">
                Görsel tahmin amaçlı önizlemedir. Üretim öncesi nihai
                profesyonel CNC kesim çizimi onayınıza sunulur.
              </p>
              {/* Mobilde Minimal Durum Etiketi */}
              <span class="sm:hidden font-mono text-[10px] tracking-widest uppercase text-white/50 flex items-center gap-1.5">
                <span
                  class="size-1.5 rounded-full"
                  style={{ backgroundColor: activeColor.hex }}
                />
                <span>CANLI CAD ÖNİZLEME</span>
              </span>
            </div>

            <div class="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleTogglePower}
                aria-pressed={isLit}
                title={isLit ? "Neon Işığını Kapat" : "Neon Işığını Aç"}
                class={`cursor-pointer inline-flex h-7.5 sm:h-8 items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] font-semibold transition-colors ${
                  isLit
                    ? "border-white/25 bg-[#0A0A0E]/90 text-white"
                    : "border-white/10 bg-[#0A0A0E]/90 text-white/55"
                }`}
              >
                <span
                  class="size-1.5 sm:size-2 rounded-full"
                  style={
                    isLit
                      ? {
                          backgroundColor: activeColor.hex,
                          boxShadow: `0 0 8px ${activeColor.hex}`,
                        }
                      : { backgroundColor: "rgba(255,255,255,0.25)" }
                  }
                />
                <span class="hidden sm:inline">
                  {isLit ? "IŞIK: AÇIK" : "IŞIK: KAPALI"}
                </span>
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
                    class={`cursor-pointer rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-[10px] sm:text-[11px] font-medium ${
                      sceneBg === bg.id
                        ? "bg-white/15 text-white"
                        : "text-white/55 hover:text-white"
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>

              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phones[0].raw}?text=${encodeURIComponent("Merhaba CC NEON'S, neon tabela tasarımıma dair destek almak istiyorum.")}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Destek"
                aria-label="WhatsApp Canlı Danışman"
                class="cursor-pointer inline-flex h-7.5 sm:h-8 items-center gap-1 rounded-lg border border-[#1CFF8A]/35 bg-[#1CFF8A]/10 px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] font-semibold text-[#1CFF8A] hover:bg-[#1CFF8A]/20"
              >
                <svg
                  class="size-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span class="hidden sm:inline">DESTEK</span>
              </a>

              <button
                type="button"
                onClick={handleExportPng}
                title="Teknik Paftayı PNG Olarak İndir"
                class="cursor-pointer inline-flex h-7.5 sm:h-8 items-center gap-1 rounded-lg border border-white/15 bg-[#0A0A0E]/90 px-2 sm:px-2.5 font-mono text-[10px] sm:text-[11px] font-semibold text-white hover:bg-white/15"
              >
                <span>PNG ↓</span>
              </button>
            </div>
          </div>

          {/* GERÇEK CNC LAZER HARF KESİM AKRİLİK KONTUR FİLTRELERİ */}
          <svg
            width="1"
            height="1"
            class="absolute opacity-0 pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              {/* 1. Şeffaf Pleksi Harf Kontur Filtresi */}
              <filter
                id="clear-acrylic-contour"
                x="-30%"
                y="-40%"
                width="160%"
                height="180%"
              >
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="16"
                  result="dilated_outer"
                />
                <feGaussianBlur
                  in="dilated_outer"
                  stdDeviation="6"
                  result="shadow_blur"
                />
                <feOffset
                  in="shadow_blur"
                  dx="0"
                  dy="10"
                  result="shadow_offset"
                />
                <feComponentTransfer in="shadow_offset" result="shadow">
                  <feFuncA type="linear" slope="0.8" />
                </feComponentTransfer>
                <feComponentTransfer in="dilated_outer" result="acrylic_body">
                  <feFuncR type="linear" slope="1" />
                  <feFuncG type="linear" slope="1" />
                  <feFuncB type="linear" slope="1" />
                  <feFuncA type="linear" slope="0.04" />
                </feComponentTransfer>
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="14"
                  result="dilated_inner"
                />
                <feComposite
                  in="dilated_outer"
                  in2="dilated_inner"
                  operator="out"
                  result="rim_edge"
                />
                <feComponentTransfer in="rim_edge" result="glass_rim">
                  <feFuncR type="linear" slope="1" />
                  <feFuncG type="linear" slope="1" />
                  <feFuncB type="linear" slope="1" />
                  <feFuncA type="linear" slope="0.45" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="acrylic_body" />
                  <feMergeNode in="glass_rim" />
                </feMerge>
              </filter>

              {/* 2. Siyah Pleksi Harf Kontur Filtresi */}
              <filter
                id="black-acrylic-contour"
                x="-30%"
                y="-40%"
                width="160%"
                height="180%"
              >
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="16"
                  result="dilated_outer"
                />
                <feGaussianBlur
                  in="dilated_outer"
                  stdDeviation="8"
                  result="shadow_blur"
                />
                <feOffset
                  in="shadow_blur"
                  dx="0"
                  dy="12"
                  result="shadow_offset"
                />
                <feComponentTransfer in="shadow_offset" result="shadow">
                  <feFuncA type="linear" slope="0.95" />
                </feComponentTransfer>
                <feComponentTransfer in="dilated_outer" result="black_body">
                  <feFuncR type="linear" slope="0.04" />
                  <feFuncG type="linear" slope="0.04" />
                  <feFuncB type="linear" slope="0.05" />
                  <feFuncA type="linear" slope="0.95" />
                </feComponentTransfer>
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="14.5"
                  result="dilated_inner"
                />
                <feComposite
                  in="dilated_outer"
                  in2="dilated_inner"
                  operator="out"
                  result="rim_edge"
                />
                <feComponentTransfer in="rim_edge" result="black_rim">
                  <feFuncR type="linear" slope="1" />
                  <feFuncG type="linear" slope="1" />
                  <feFuncB type="linear" slope="1" />
                  <feFuncA type="linear" slope="0.25" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="shadow" />
                  <feMergeNode in="black_body" />
                  <feMergeNode in="black_rim" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* CAD KUTUSU MERKEZ: FERAH NEON ÖNİZLEME + SAĞ VE ALT ÖLÇÜ OKLARI */}
          <div class="relative z-10 flex-1 min-h-0 flex w-full flex-col items-center justify-center px-4 sm:px-6 py-2">
            <div class="inline-grid grid-cols-[minmax(140px,auto)_auto] items-center justify-items-center max-w-full">
              {/* Neon Tabela Gövdesi */}
              <div
                key={igniteTick}
                style={{
                  boxShadow:
                    hasExplicitFrame && isLit
                      ? `0 20px 60px rgba(0,0,0,0.85), 0 0 42px rgba(${activeColor.glowRgb}, 0.24), inset 0 0 22px rgba(${activeColor.glowRgb}, 0.12)`
                      : undefined,
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
                {hasExplicitFrame &&
                  (activeBorderId === "circle" ? (
                    <>
                      <span class="absolute top-[20%] left-[20%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                      <span class="absolute top-[20%] right-[20%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                      <span class="absolute bottom-[20%] left-[20%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                      <span class="absolute bottom-[20%] right-[20%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                    </>
                  ) : activeBorderId === "pill" ? (
                    <>
                      <span class="absolute top-[18%] left-[14%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                      <span class="absolute top-[18%] right-[14%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                      <span class="absolute bottom-[18%] left-[14%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                      <span class="absolute bottom-[18%] right-[14%] size-2 rounded-full bg-white/40 ring-1 ring-black pointer-events-none" />
                    </>
                  ) : (
                    <>
                      <span class="absolute top-3 left-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                      <span class="absolute top-3 right-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                      <span class="absolute bottom-3 left-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                      <span class="absolute bottom-3 right-3 size-2 rounded-full bg-white/40 ring-1 ring-black" />
                    </>
                  ))}

                <div
                  ref={contentBoxRef}
                  class={`relative z-10 flex ${symbolFlexDirClass} items-center gap-3 sm:gap-4 max-w-full ${
                    spec.align === "left"
                      ? "justify-start text-left"
                      : spec.align === "right"
                        ? "justify-end text-right"
                        : "justify-center text-center"
                  }`}
                >
                  {/* Gerçek CNC Lazer Harf Kesim Akrilik Kontur Tabanı */}
                  {isContourBackboard && activeBorderId === "none" && (
                    <div
                      aria-hidden="true"
                      style={{
                        filter: isBlackBackboard
                          ? "url(#black-acrylic-contour)"
                          : "url(#clear-acrylic-contour)",
                      }}
                      class={`absolute inset-0 flex ${symbolFlexDirClass} items-center justify-center gap-3 sm:gap-4 pointer-events-none select-none z-0`}
                    >
                      <div
                        style={{
                          fontFamily: activeFont.cssFamily,
                          fontSize: previewFontSizeCss,
                          letterSpacing:
                            spec.sizeId === "sm"
                              ? "0.06em"
                              : spec.sizeId === "md"
                                ? "0.03em"
                                : "0.01em",
                          color: isBlackBackboard ? "#0A0A0E" : "#000000",
                        }}
                        class="flex flex-col shrink min-w-0 leading-[1.12]"
                      >
                        {formattedLines.map((line, idx) => (
                          <span
                            key={`${idx}-${line}`}
                            class="block whitespace-pre-wrap"
                          >
                            {line}
                          </span>
                        ))}
                      </div>

                      {activeSymbolId !== "none" && (
                        <svg
                          viewBox="0 0 24 24"
                          fill={isBlackBackboard ? "#0A0A0E" : "#000000"}
                          stroke={isBlackBackboard ? "#0A0A0E" : "#000000"}
                          stroke-width="2"
                          style={{
                            width: previewSymbolSizeCss,
                            height: previewSymbolSizeCss,
                          }}
                          class="shrink-0"
                        >
                          <path d={activeSymbol.svgPath} />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Fiziksel Neon Boyut & Tüp Kalibrasyonlu Çok Satırlı Metin */}
                  <div
                    style={{
                      fontFamily: activeFont.cssFamily,
                      color: isLit ? activeColor.hex : activeColor.unlitHex,
                      textShadow: tubeShadow,
                      fontSize: previewFontSizeCss,
                      letterSpacing:
                        spec.sizeId === "sm"
                          ? "0.06em"
                          : spec.sizeId === "md"
                            ? "0.03em"
                            : "0.01em",
                    }}
                    class={`relative z-10 select-none leading-[1.12] transition-all duration-300 flex flex-col shrink min-w-0 ${
                      spec.align === "left"
                        ? "items-start text-left"
                        : spec.align === "right"
                          ? "items-end text-right"
                          : "items-center text-center"
                    }`}
                  >
                    {formattedLines.map((line, idx) => (
                      <span
                        key={`${idx}-${line}`}
                        class="block whitespace-pre-wrap"
                      >
                        {line}
                      </span>
                    ))}
                  </div>

                  {activeSymbolId !== "none" && (
                    <svg
                      key={activeSymbolId}
                      role="img"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isLit ? "#FFFFFF" : activeSymbolColor.unlitHex}
                      stroke-width={
                        spec.sizeId === "sm"
                          ? "2.4"
                          : spec.sizeId === "md"
                            ? "2.0"
                            : "1.6"
                      }
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      style={{
                        width: previewSymbolSizeCss,
                        height: previewSymbolSizeCss,
                        filter: isLit
                          ? `drop-shadow(0 0 4px #FFFFFF) drop-shadow(0 0 14px ${activeSymbolColor.hex}) drop-shadow(0 0 28px ${activeSymbolColor.hex})`
                          : "none",
                      }}
                      class="relative z-10 shrink-0 transition-all duration-300"
                      aria-label={activeSymbol.label}
                    >
                      <title>{activeSymbol.label}</title>
                      <path d={activeSymbol.svgPath} />
                    </svg>
                  )}
                </div>
              </div>

              {/* SAĞ DİKEY YÜKSEKLİK OKU (Tabela yüksekliğine birebir kilitli) */}
              <div
                aria-hidden="true"
                class="self-stretch flex flex-col items-center justify-between ml-3 sm:ml-6 lg:ml-8 py-1 font-mono text-white min-h-[72px]"
              >
                <span class="mb-1 text-[11px] sm:text-xs font-bold text-white/90">
                  {estimate.heightCm}cm
                </span>
                <div class="flex flex-1 flex-col items-center w-full">
                  <span class="text-xs leading-none text-white/80">↑</span>
                  <div class="w-px flex-1 bg-white/60 min-h-[36px]" />
                  <span class="text-xs leading-none text-white/80">↓</span>
                </div>
              </div>

              {/* ALT YATAY GENİŞLİK OKU (Tabela genişliğine birebir kilitli) */}
              <div
                aria-hidden="true"
                class="col-start-1 row-start-2 mt-2.5 sm:mt-3.5 w-full min-w-[140px] flex items-center gap-2 sm:gap-3 font-mono text-white"
              >
                <span class="text-xs text-white/80">←</span>
                <div class="h-px flex-1 bg-white/60" />
                <div class="text-center leading-tight px-1 shrink-0">
                  <span class="block text-xs font-bold text-white">
                    {estimate.widthCm}cm
                  </span>
                  <span class="block text-[10px] text-white/55">
                    {activeBorderId === "circle"
                      ? "çap ölçüsü"
                      : "akrilik ölçüsü"}
                  </span>
                </div>
                <div class="h-px flex-1 bg-white/60" />
                <span class="text-xs text-white/80">→</span>
              </div>
            </div>

            {/* ATÖLYE ÜRETİM VE BÜKÜM UYARISI ROZETİ */}
            {estimate.isSizeConstrained && (
              <div class="relative mt-2 flex flex-col items-center z-30">
                <button
                  type="button"
                  aria-expanded={showConstraintTip}
                  onClick={() => setShowConstraintTip((prev) => !prev)}
                  onMouseEnter={() => setShowConstraintTip(true)}
                  onMouseLeave={() => setShowConstraintTip(false)}
                  class="cursor-pointer inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-[#0E0E14]/90 px-3 py-1 font-mono text-[11px] font-semibold text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.22)] backdrop-blur-md transition-all hover:bg-amber-500/20 hover:border-amber-400 hover:scale-[1.03] active:scale-95"
                >
                  <span class="animate-pulse text-xs text-amber-400">⚠️</span>
                  <span>Üretim Uyarısı: Sıkışık Metin</span>
                  <span class="ml-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[9px] text-amber-200">
                    Detay
                  </span>
                </button>

                {showConstraintTip && (
                  <div
                    role="tooltip"
                    class="absolute bottom-full mb-2 w-72 sm:w-84 rounded-xl border border-amber-400/40 bg-[#0A0A0E]/95 p-3.5 text-left font-sans shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150 z-50 pointer-events-auto"
                  >
                    <div class="flex items-start justify-between gap-2 mb-1.5 border-b border-white/10 pb-1.5">
                      <div class="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                        <span>⚠️</span>
                        <span>ATÖLYE BÜKÜM UYARISI</span>
                      </div>
                      <button
                        type="button"
                        aria-label="Kapat"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConstraintTip(false);
                        }}
                        class="text-white/40 hover:text-white text-xs px-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <p class="text-xs text-white/85 leading-relaxed">
                      Silikon neon tüplerin net ve estetik bükülebilmesi için
                      harf başına en az <strong>7.5 cm</strong> mesafe gerekir.
                    </p>

                    <p class="mt-2 text-xs text-amber-200/90 leading-relaxed">
                      Bu satırdaki harfler seçilen{" "}
                      <strong>{NEON_SIZES[spec.sizeId].widthCm} cm</strong>{" "}
                      ebada sığdırıldığında harf aralıkları kapanabilir ve ışık
                      birbirine karışabilir (ideal alan:{" "}
                      <strong>~{estimate.minRecommendedWidthCm} cm</strong>).
                    </p>

                    <div class="mt-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-100/90 leading-normal">
                      💡 <strong>Tavsiye:</strong> Uzun metni{" "}
                      <strong>Enter</strong> tuşuyla 2 veya 3 satıra bölerek
                      harflerin ferah ve kusursuz görünmesini sağlayabilirsiniz.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CAD KUTUSU ALT BÖLÜM: SIFIRLAMA KAPSÜLLERİ + KENARDAN KENARA 6 SÜTUNLU ANTET TABLOSU */}
          <div class="relative z-20 shrink-0 space-y-2.5 pb-20 lg:pb-0">
            {/* Sıfırlama / Geri Al / İleri Al Kapsülleri (Mobilde gizli veya kompakt) */}
            <div class="hidden sm:flex flex-wrap items-center justify-center gap-2 px-4">
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
                    backboardId: "contour_clear",
                    borderId: "none",
                    symbolPosition: "right",
                    symbolScale: 1,
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

            {/* KENARDAN KENARA YAPIŞIK 6 SÜTUNLU CAD MÜHENDİSLİK ANTETİ (Masaüstünde tam, mobilde kompakt 3 sütun) */}
            <div class="grid grid-cols-3 sm:grid-cols-6 border-t border-[#35E7FF]/25 bg-[#050505]/95 divide-x divide-y sm:divide-y-0 divide-[#35E7FF]/20 text-left font-mono">
              <div class="px-2.5 py-1.5 sm:px-3.5 sm:py-3">
                <span class="block text-[8px] sm:text-[9px] uppercase tracking-wider text-[#35E7FF]">
                  TABELA ADI
                </span>
                <strong class="mt-0.5 block text-[11px] sm:text-sm font-bold text-white truncate">
                  {formattedText}
                </strong>
              </div>
              <div class="px-2.5 py-1.5 sm:px-3.5 sm:py-3">
                <span class="block text-[8px] sm:text-[9px] uppercase tracking-wider text-[#35E7FF]">
                  AKRİLİK TABAN
                </span>
                <strong class="mt-0.5 block text-[11px] sm:text-sm font-bold text-white">
                  {estimate.widthCm}×{estimate.heightCm} cm
                </strong>
              </div>
              <div class="px-2.5 py-1.5 sm:px-3.5 sm:py-3">
                <span class="block text-[8px] sm:text-[9px] uppercase tracking-wider text-[#35E7FF]">
                  TOPLAM NEON
                </span>
                <strong class="mt-0.5 block text-[11px] sm:text-sm font-bold text-white">
                  {estimate.neonLengthMeters} m
                </strong>
              </div>
              <div class="hidden sm:block px-3.5 py-3">
                <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                  KULLANIM
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-white">
                  {spec.environment === "outdoor" ? "Dış Mekan" : "İç Mekan"}
                </strong>
              </div>
              <div class="hidden sm:block px-3.5 py-3">
                <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                  TARİH
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-white">
                  {fmtDate(today)} {today.getFullYear()}
                </strong>
              </div>
              <div class="hidden sm:block px-3.5 py-3">
                <span class="block text-[9px] uppercase tracking-wider text-[#35E7FF]">
                  ÜRETİCİ ATÖLYE
                </span>
                <strong class="mt-0.5 block text-sm font-bold text-white truncate">
                  CC NEON'S™
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBİL SABİT ALT NAVİGASYON BARI (Siyah / Koyu Füme Stüdyo Teması) */}
      <nav
        aria-label="Mobil Tasarım Adımları"
        class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0A0A0E] border-t border-white/[0.08] py-2 px-1 shadow-[0_-8px_30px_rgba(0,0,0,0.95)] flex items-center justify-around"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {TABS.map((tab) => {
          const isCurrentActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileSheetOpen(true);
              }}
              class="relative flex flex-col items-center justify-center flex-1 py-1 px-0.5 text-center transition-transform active:scale-95"
            >
              {/* Yeşil Onay Rozeti (Adım Tamamlandı Rozeti) */}
              <span class="absolute top-0 right-1 sm:right-2 size-3.5 rounded-full bg-[#1CFF8A] border-2 border-[#0A0A0E] flex items-center justify-center text-[8px] font-bold text-black shadow-xs">
                ✓
              </span>

              <div
                class={`size-6 flex items-center justify-center transition-colors ${
                  isCurrentActive ? "text-white" : "text-white/55"
                }`}
              >
                <svg
                  class="size-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d={tab.icon} />
                </svg>
              </div>

              <span
                class={`font-mono text-[10px] font-medium leading-tight tracking-tight mt-0.5 ${
                  isCurrentActive ? "text-white font-bold" : "text-white/50"
                }`}
              >
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
