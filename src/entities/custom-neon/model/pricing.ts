export type NeonFontId = "script" | "modern" | "italic" | "retro";
export type NeonColorId =
  | "pink"
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "white";
export type NeonSizeId = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type NeonBackboardId =
  | "contour_clear"
  | "rect_clear"
  | "contour_black"
  | "rect_black";
export type NeonEnvironment = "indoor" | "outdoor";

export type NeonSymbolId =
  | "none"
  | "heart"
  | "star"
  | "bolt"
  | "cocktail"
  | "crown"
  | "flame"
  | "infinity"
  | "moon"
  | "diamond"
  | "music"
  | "sparkles";

export type NeonBorderId = "none" | "rectangle" | "pill" | "circle" | "ticket";

export type NeonTubeTechId = "standard" | "luminex";
export type NeonDimmerId = "standard" | "wireless";
export type NeonMountId = "wall" | "hanging";
export type NeonTextAlign = "left" | "center" | "right";
export type NeonSymbolPosition = "left" | "right" | "top" | "bottom";

export interface CustomNeonSpec {
  text: string;
  fontId: NeonFontId;
  colorId: NeonColorId;
  sizeId: NeonSizeId;
  backboardId: NeonBackboardId;
  environment: NeonEnvironment;
  includeInstallation?: boolean;
  symbolId?: NeonSymbolId;
  symbolColorId?: NeonColorId;
  symbolPosition?: NeonSymbolPosition;
  symbolScale?: number;
  borderId?: NeonBorderId;
  tubeTech?: NeonTubeTechId;
  dimmer?: NeonDimmerId;
  mountType?: NeonMountId;
  align?: NeonTextAlign;
}

export interface PriceEstimate {
  minPrice: number;
  maxPrice: number;
  charCount: number;
  lineCount: number;
  widthCm: number;
  heightCm: number;
  minRecommendedWidthCm: number;
  isSizeConstrained: boolean;
  recommendedSizeId?: NeonSizeId;
  neonLengthMeters: number;
  powerWatts: number;
  recommendedAmps: number;
  isCustomQuoteRequired?: boolean;
}

export const NEON_FONTS: Record<
  NeonFontId,
  {
    label: string;
    cssFamily: string;
    description: string;
    tubeType: string;
    uppercase?: boolean;
    canvasWeight: number;
  }
> = {
  script: {
    label: "El Yazısı",
    cssFamily: "'Pacifico', cursive",
    description: "Akıcı el yazısı neon kıvrımı",
    tubeType: "Single Neon · 6mm Esnek Silikon",
    canvasWeight: 400,
  },
  modern: {
    label: "Modern Sans",
    cssFamily: "'Tilt Neon', sans-serif",
    description: "Gerçek neon tüp geometrisi ve net hatlar",
    tubeType: "Single Neon · 8mm Keskin Hat",
    canvasWeight: 400,
  },
  italic: {
    label: "İtalik Neon",
    cssFamily: "'Caveat', cursive",
    description: "Zarif, ince kıvrımlı italik neon akışı",
    tubeType: "Single Neon · 6mm Zarif Hat",
    canvasWeight: 700,
  },
  retro: {
    label: "Çift Hat Retro",
    cssFamily: "'Bungee Inline', sans-serif",
    description: "80'ler synthwave paralel çift tüp stili",
    tubeType: "Double Neon · Çift Kanal Tüp",
    uppercase: true,
    canvasWeight: 400,
  },
};

export const NEON_COLORS: Record<
  NeonColorId,
  {
    label: string;
    hex: string;
    tubeHex: string;
    glowRgb: string;
    unlitHex: string;
    unlitDescription: string;
  }
> = {
  pink: {
    label: "Neon Pembe",
    hex: "#ff2a85",
    tubeHex: "#ffd6e7",
    glowRgb: "255, 42, 133",
    unlitHex: "#f472b6",
    unlitDescription:
      "Renkli silikon ceket: Işık kapalıyken pastel pembe, yanınca canlı magenta-pembe yanar.",
  },
  cyan: {
    label: "Buz Mavisi",
    hex: "#00f0ff",
    tubeHex: "#d6fcff",
    glowRgb: "0, 240, 255",
    unlitHex: "#67e8f9",
    unlitDescription:
      "Buz mavisi silikon ceket: Gündüz açık turkuaz, gece keskin siber buz mavisi parlar.",
  },
  green: {
    label: "Zümrüt Yeşili",
    hex: "#10f56c",
    tubeHex: "#d6ffe6",
    glowRgb: "16, 245, 108",
    unlitHex: "#6ee7b7",
    unlitDescription:
      "Yeşil pigmentli silikon: Gündüz zümrüt yeşili, yanınca fosforlu parlak yeşil verir.",
  },
  amber: {
    label: "Amber Sarı",
    hex: "#ffb800",
    tubeHex: "#fff2cc",
    glowRgb: "255, 184, 0",
    unlitHex: "#fcd34d",
    unlitDescription: "Altın-sarı silikon: Sıcak amber altın rengi ışık yayar.",
  },
  red: {
    label: "Ateş Kırmızısı",
    hex: "#ff2e2e",
    tubeHex: "#ffd6d6",
    glowRgb: "255, 46, 46",
    unlitHex: "#f87171",
    unlitDescription:
      "Kırmızı silikon: Gündüz net kırmızı tabela etkisi verir, yanınca yoğun yakut kırmızısı parlar.",
  },
  purple: {
    label: "Ultraviyole Mor",
    hex: "#b538ff",
    tubeHex: "#f0d6ff",
    glowRgb: "181, 56, 255",
    unlitHex: "#e9d5ff",
    unlitDescription:
      "Lila difüzör: Açıldığında derin ultraviyole mor atmosfer kurar.",
  },
  white: {
    label: "Gün Işığı",
    hex: "#fff7e6",
    tubeHex: "#ffffff",
    glowRgb: "255, 247, 230",
    unlitHex: "#f8fafc",
    unlitDescription:
      "Saf beyaz silikon: 3500K sıcak-doğal cam tüp beyazı verir.",
  },
};

export const NEON_SIZES: Record<
  NeonSizeId,
  {
    label: string;
    widthCm: number;
    heightCm: number;
    multiplier: number;
    scaleFactor: number;
    tubeGaugeMm: string;
    recommendedFor: string;
    fontScaleRem: number;
    symbolSizeClass: string;
  }
> = {
  xs: {
    label: "Mini (45 cm)",
    widthCm: 45,
    heightCm: 20,
    multiplier: 0.85,
    scaleFactor: 0.65,
    tubeGaugeMm: "6mm Micro-Flex",
    recommendedFor: "Masaüstü & Raf",
    fontScaleRem: 2.8,
    symbolSizeClass: "size-9 sm:size-12",
  },
  sm: {
    label: "Küçük (60 cm)",
    widthCm: 60,
    heightCm: 26,
    multiplier: 1.0,
    scaleFactor: 0.82,
    tubeGaugeMm: "6mm / 8mm Flex",
    recommendedFor: "Oda & Kapı",
    fontScaleRem: 3.6,
    symbolSizeClass: "size-11 sm:size-15",
  },
  md: {
    label: "Standart (75 cm)",
    widthCm: 75,
    heightCm: 32,
    multiplier: 1.25,
    scaleFactor: 1.0,
    tubeGaugeMm: "8mm Standart Flex",
    recommendedFor: "Salon & Duvar Dekoru",
    fontScaleRem: 4.5,
    symbolSizeClass: "size-14 sm:size-18",
  },
  lg: {
    label: "Büyük (100 cm)",
    widthCm: 100,
    heightCm: 42,
    multiplier: 1.6,
    scaleFactor: 1.28,
    tubeGaugeMm: "8mm / 10mm Yüksek Işık",
    recommendedFor: "Kafe & Ofis",
    fontScaleRem: 5.6,
    symbolSizeClass: "size-18 sm:size-24",
  },
  xl: {
    label: "Ekstra Büyük (120 cm)",
    widthCm: 120,
    heightCm: 50,
    multiplier: 2.0,
    scaleFactor: 1.48,
    tubeGaugeMm: "10mm Ultra-Geniş",
    recommendedFor: "Dükkan & Giriş",
    fontScaleRem: 6.4,
    symbolSizeClass: "size-20 sm:size-26",
  },
  xxl: {
    label: "Kurumsal Vitrin (140 cm)",
    widthCm: 140,
    heightCm: 58,
    multiplier: 2.4,
    scaleFactor: 1.65,
    tubeGaugeMm: "10mm / 12mm Cadde Tipi",
    recommendedFor: "Cadde Cephesi & Bar",
    fontScaleRem: 7.2,
    symbolSizeClass: "size-22 sm:size-28",
  },
};

export const NEON_BACKBOARDS: Record<
  NeonBackboardId,
  {
    label: string;
    description: string;
    colorType: "clear" | "black";
    cutType: "contour" | "rectangle";
    extraCost: number;
  }
> = {
  contour_clear: {
    label: "Şeffaf Pleksi (Harf Kontur)",
    description: "Yazı formunu takip eden lazer kesim şeffaf akrilik",
    colorType: "clear",
    cutType: "contour",
    extraCost: 0,
  },
  rect_clear: {
    label: "Şeffaf Pleksi (Düz Pano)",
    description: "Montajı kolay düz dikdörtgen şeffaf akrilik levha",
    colorType: "clear",
    cutType: "rectangle",
    extraCost: 150,
  },
  contour_black: {
    label: "Siyah Pleksi (Harf Kontur)",
    description: "Yazı formuna göre kesilmiş opak siyah akrilik",
    colorType: "black",
    cutType: "contour",
    extraCost: 100,
  },
  rect_black: {
    label: "Siyah Pleksi (Düz Pano)",
    description: "Kontrastı artıran düz dikdörtgen siyah akrilik pano",
    colorType: "black",
    cutType: "rectangle",
    extraCost: 250,
  },
};

export const NEON_SYMBOLS: Record<
  NeonSymbolId,
  {
    label: string;
    glyph: string;
    svgPath: string;
    extraMeters: number;
  }
> = {
  none: {
    label: "Sembol Yok",
    glyph: "∅",
    svgPath: "",
    extraMeters: 0,
  },
  heart: {
    label: "Kalp",
    glyph: "♥",
    svgPath:
      "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    extraMeters: 0.45,
  },
  star: {
    label: "Yıldız",
    glyph: "★",
    svgPath:
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    extraMeters: 0.5,
  },
  bolt: {
    label: "Şimşek",
    glyph: "⚡",
    svgPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    extraMeters: 0.45,
  },
  cocktail: {
    label: "Kokteyl",
    glyph: "🍸",
    svgPath: "M8 21h8M12 15v6M19 3H5l7 9 7-9zM17 2a3 3 0 1 1 0 6",
    extraMeters: 0.65,
  },
  crown: {
    label: "Kral Tacı",
    glyph: "♛",
    svgPath: "M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14",
    extraMeters: 0.6,
  },
  flame: {
    label: "Alev",
    glyph: "🔥",
    svgPath:
      "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
    extraMeters: 0.55,
  },
  infinity: {
    label: "Sonsuzluk",
    glyph: "∞",
    svgPath:
      "M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z",
    extraMeters: 0.5,
  },
  moon: {
    label: "Hilal Ay",
    glyph: "☾",
    svgPath: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    extraMeters: 0.45,
  },
  diamond: {
    label: "Elmas",
    glyph: "◆",
    svgPath: "M6 3h12l4 6-10 12L2 9zM2 9h20",
    extraMeters: 0.55,
  },
  music: {
    label: "Müzik Notası",
    glyph: "♫",
    svgPath:
      "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
    extraMeters: 0.5,
  },
  sparkles: {
    label: "Parıltı",
    glyph: "✦",
    svgPath:
      "M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z",
    extraMeters: 0.45,
  },
};

export const NEON_BORDERS: Record<
  NeonBorderId,
  {
    label: string;
    description: string;
    extraMeters: number;
  }
> = {
  none: {
    label: "Çerçevesiz (Sade)",
    description: "Tabela etrafında ek ışık çerçevesi olmadan sade tasarım",
    extraMeters: 0,
  },
  rectangle: {
    label: "Dikdörtgen Neon Çerçeve",
    description: "Yazıyı dıştan saran keskin köşeli LED neon bordür",
    extraMeters: 1.6,
  },
  pill: {
    label: "Kapsül (Oval) Neon Çerçeve",
    description: "Yumuşak tam yuvarlak köşeli retro neon bordür",
    extraMeters: 1.5,
  },
  circle: {
    label: "Rozet / Daire Çerçeve",
    description: "Kafe ve stüdyo logoları için dairesel neon halka",
    extraMeters: 1.4,
  },
  ticket: {
    label: "Sinema Bileti (Ticket) Çerçeve",
    description: "Köşeleri içe oyuk klasik sinema/bar tabelası bordürü",
    extraMeters: 1.7,
  },
};

export const NEON_TUBE_TECHS: Record<
  NeonTubeTechId,
  {
    label: string;
    badge: string;
    description: string;
    specs: string[];
  }
> = {
  standard: {
    label: "Splice™ 1. Sınıf Silikon LED",
    badge: "Standart Üretim",
    description:
      "Esnek 6mm/8mm silikon ceketli, kırılmaz ve ısınmaz standart yüksek parlaklıklı LED neon.",
    specs: [
      "50.000+ saat kesintisiz LED ömrü",
      "Düşük enerji tüketimi (12V DC güvenli voltaj)",
      "Ev, ofis ve kafe iç mekanları için ideal",
    ],
  },
  luminex: {
    label: "Luminex™ Pro Çift Yoğunluklu Tüp",
    badge: "+%35 Daha Parlak",
    description:
      "Tam kapsüllü optik difüzörlü silikon. Noktasal LED izi göstermez, vitrin ve dış cephede maksimum parlaklık verir.",
    specs: [
      "Homojen cam tüp parlaklığı (Sıfır nokta izi)",
      "UV ve sararma dirençli kalın silikon gövde",
      "Cadde cephesi, bar ve stüdyo çekimleri için",
    ],
  },
};

// Dahili atölye maliyet katsayıları
const ATELIER_ENGINE_RULES = {
  plexiPerM2Cost: 4000,
  neonPerMeterCost: 100,
  luminexPerMeterCost: 160, // +%60 Çift yoğunluklu difüzörlü vitrin tipi
  marginMultiplier: 1.5,
  rangeSpreadRatio: 0.08,
  roundingStepTl: 50,
  installationFeeTl: 1000,
  wirelessDimmerCost: 180, // Kablosuz RF uzaktan kumandalı dimmer modülü
  outdoorExtraCost: 350, // IP67 su geçirmezlik, silikon conta yalıtımı ve koruma
} as const;

export function calculateNeonPrice(spec: CustomNeonSpec): PriceEstimate {
  const lines = spec.text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const effectiveLines = lines.length > 0 ? lines : ["GLOW"];
  const lineCount = effectiveLines.length;

  const maxLineLength = Math.max(
    ...effectiveLines.map((l) => l.replace(/\s+/g, "").length),
    1,
  );
  const totalChars = effectiveLines.reduce(
    (acc, l) => acc + l.replace(/\s+/g, "").length,
    0,
  );
  const effectiveCharCount = Math.max(1, Math.min(totalChars, 45));

  const sizeConfig = NEON_SIZES[spec.sizeId] || NEON_SIZES.md;
  const backboardConfig =
    NEON_BACKBOARDS[spec.backboardId] || NEON_BACKBOARDS.contour_clear;

  // Fiziksel Neon Atölye Kuralı: Harf başı min 7.5cm, sembol için ölçekli pay
  const hasActiveSymbol = Boolean(spec.symbolId && spec.symbolId !== "none");
  const symScale = Math.max(0.6, Math.min(1.8, spec.symbolScale ?? 1));
  const symPos: NeonSymbolPosition = spec.symbolPosition || "right";
  const isVerticalSymbol =
    hasActiveSymbol && (symPos === "top" || symPos === "bottom");
  const symbolCm = hasActiveSymbol ? Math.round(18 * symScale) : 0;
  const symbolBonusCm = hasActiveSymbol && !isVerticalSymbol ? symbolCm : 0;
  const symbolHeightBonusCm = isVerticalSymbol ? symbolCm : 0;
  const minRequiredWidthCm = Math.round(maxLineLength * 7.5 + symbolBonusCm);

  const isSizeConstrained = minRequiredWidthCm > sizeConfig.widthCm;
  let recommendedSizeId: NeonSizeId | undefined = undefined;
  if (isSizeConstrained) {
    if (minRequiredWidthCm <= 60) recommendedSizeId = "sm";
    else if (minRequiredWidthCm <= 75) recommendedSizeId = "md";
    else if (minRequiredWidthCm <= 100) recommendedSizeId = "lg";
    else if (minRequiredWidthCm <= 120) recommendedSizeId = "xl";
    else recommendedSizeId = "xxl";
  }

  let calculatedWidthCm = sizeConfig.widthCm;
  let calculatedHeightCm = sizeConfig.heightCm;

  const isContour = backboardConfig.cutType === "contour";
  const baseNaturalWidth = Math.max(
    18,
    Math.round(maxLineLength * 9.5 + symbolBonusCm),
  );
  const lineScaleDamping =
    lineCount > 2 ? Math.max(0.55, 1 - (lineCount - 2) * 0.14) : 1;
  const sizeRatio =
    sizeConfig.widthCm > 75
      ? 1 + (sizeConfig.widthCm / 75 - 1) * lineScaleDamping
      : 1;
  const scaledNaturalWidth = Math.round(baseNaturalWidth * sizeRatio);

  if (isContour && (!spec.borderId || spec.borderId === "none")) {
    if (effectiveCharCount === 1 && !hasActiveSymbol) {
      calculatedWidthCm = 18;
      calculatedHeightCm = 18;
    } else {
      calculatedWidthCm = Math.min(
        Math.max(scaledNaturalWidth, isVerticalSymbol ? symbolCm : 18),
        sizeConfig.widthCm,
      );
      const baseHeight = Math.max(
        18,
        Math.round(18 + (lineCount - 1) * 16 + symbolHeightBonusCm),
      );
      calculatedHeightCm = Math.min(
        135,
        Math.max(
          !isVerticalSymbol && hasActiveSymbol ? symbolCm : 18,
          Math.round(baseHeight * sizeRatio),
        ),
      );
    }
  } else {
    if (lineCount >= 3 && scaledNaturalWidth + 16 < sizeConfig.widthCm) {
      calculatedWidthCm = Math.max(
        sizeConfig.heightCm,
        scaledNaturalWidth + 16,
      );
    }
    if (lineCount > 1 || symbolHeightBonusCm > 0) {
      calculatedHeightCm = Math.min(
        135,
        Math.round(
          sizeConfig.heightCm * (1 + (lineCount - 1) * 0.45) +
            symbolHeightBonusCm,
        ),
      );
    }
  }

  // Harf metrajı için çerçeve genişlemesinden önceki doğal içerik kutusu saklanır:
  // Daire veya kapsül çerçeve eklendiğinde dış pleksi büyür ancak içteki harfler iki katına çıkmaz.
  const letterBoxWidthCm = calculatedWidthCm;
  const letterBoxHeightCm = calculatedHeightCm;

  if (spec.borderId === "circle") {
    if (lineCount >= 3) {
      const multiLineScale = 1 + (lineCount - 2) * 0.08;
      const symExtraDia = hasActiveSymbol ? Math.round(symbolCm * 0.45) : 0;
      const scaledDia =
        Math.ceil((sizeConfig.widthCm * multiLineScale + symExtraDia) / 2) * 2;
      const minSafeDia =
        Math.ceil(Math.max(60, minRequiredWidthCm + 12) / 2) * 2;
      const circleDiameter = Math.min(150, Math.max(scaledDia, minSafeDia));
      calculatedWidthCm = circleDiameter;
      calculatedHeightCm = circleDiameter;
    } else {
      const contentWidth = Math.max(
        minRequiredWidthCm,
        maxLineLength * 7.5 + symbolBonusCm,
      );
      const contentHeight = Math.max(
        16,
        Math.round(16 + (lineCount - 1) * 14 + symbolHeightBonusCm),
      );
      const marginCm =
        lineCount === 1 && !hasActiveSymbol && maxLineLength <= 4 ? 10 : 16;
      const requiredDiameter =
        Math.ceil(
          (Math.sqrt(
            contentWidth * contentWidth + contentHeight * contentHeight,
          ) +
            marginCm) /
            2,
        ) * 2;
      const circleDiameter = Math.max(sizeConfig.widthCm, requiredDiameter);
      calculatedWidthCm = circleDiameter;
      calculatedHeightCm = circleDiameter;
    }
  } else if (spec.borderId === "pill") {
    if (minRequiredWidthCm + 14 > sizeConfig.widthCm) {
      calculatedWidthCm = minRequiredWidthCm + 14;
    }
    const pillLineStepCm = lineCount >= 3 ? 10.5 : 16;
    calculatedHeightCm = Math.max(
      Math.round(calculatedWidthCm * 0.48),
      Math.round(
        18 + (lineCount - 1) * pillLineStepCm + symbolHeightBonusCm + 10,
      ),
    );
    // Kapsül (oval) her zaman yatay stadyum formundadır (genişlik >= yükseklik * 1.45)
    calculatedWidthCm = Math.max(
      calculatedWidthCm,
      Math.round(calculatedHeightCm * 1.45),
    );
  }

  // Metraj & Güç hesabı
  const fontNeonMultiplier = spec.fontId === "retro" ? 1.85 : 1.0;
  const symbolExtraMeters =
    spec.symbolId && spec.symbolId !== "none"
      ? NEON_SYMBOLS[spec.symbolId].extraMeters * symScale
      : 0;
  const borderExtraMeters =
    spec.borderId && spec.borderId !== "none"
      ? NEON_BORDERS[spec.borderId].extraMeters * (calculatedWidthCm / 75)
      : 0;

  // Harf başı silikon neon sarfiyatı:
  // Karakterin fiziksel boyutuna (genişlik/yükseklik) göre hesaplanır.
  // Sıkışık çok satırlı metinlerde harfler küçülür (min 0.16m), ferah büyük tabelalarda büyür (maks 0.38m).
  const availableLetterWidthCm = Math.max(
    14,
    letterBoxWidthCm - (hasActiveSymbol && !isVerticalSymbol ? symbolCm : 0),
  );
  const approxCharWidthCm = availableLetterWidthCm / Math.max(maxLineLength, 1);
  const availableLetterHeightCm = Math.max(
    14,
    letterBoxHeightCm - (isVerticalSymbol ? symbolCm : 0),
  );
  const approxCharHeightCm = availableLetterHeightCm / Math.max(lineCount, 1);
  const effectiveCharDimCm = Math.min(
    Math.max(7.0, approxCharWidthCm * 1.15),
    Math.max(7.5, approxCharHeightCm),
  );
  const singleStrokeMetersPerChar = Math.min(
    0.38,
    Math.max(0.16, (effectiveCharDimCm / 14) * 0.24),
  );

  // Retro font (çift kanal paralel tüp) sadece harfleri 1.85 ile çarpar; sembol ve çerçeve tek hat kalır.
  const lettersMeterage =
    effectiveCharCount * singleStrokeMetersPerChar * fontNeonMultiplier;
  const rawMeters = lettersMeterage + symbolExtraMeters + borderExtraMeters;
  const neonLengthMeters = Math.max(0.6, Math.round(rawMeters * 10) / 10);
  const powerWatts = Math.max(10, Math.round(neonLengthMeters * 9.0));
  const recommendedAmps = Math.max(2, Math.ceil((powerWatts * 1.25) / 12));

  // Trafo / Adaptör maliyeti amper gücüne göre dinamik kademelendirilir:
  // 2A prize tipi adaptör 120 TL, 4-6A metal trafo 220 TL, 8-10A 350 TL, 12A+ 480 TL
  const adapterCost =
    recommendedAmps <= 3
      ? 120
      : recommendedAmps <= 6
        ? 220
        : recommendedAmps <= 10
          ? 350
          : 480;

  // Ebat büyüdükçe kargo kırılma emniyeti ve ahşap kasa/sandık maliyeti:
  const overheadCost =
    sizeConfig.widthCm <= 60
      ? 250
      : sizeConfig.widthCm <= 75
        ? 300
        : sizeConfig.widthCm <= 100
          ? 380
          : sizeConfig.widthCm <= 120
            ? 450
            : 550;

  // Silikon tüp teknolojisi birim maliyet farkı:
  const neonUnitCost =
    spec.tubeTech === "luminex"
      ? ATELIER_ENGINE_RULES.luminexPerMeterCost
      : ATELIER_ENGINE_RULES.neonPerMeterCost;

  // Çevresel ve kumanda ek donanımları:
  const outdoorCost =
    spec.environment === "outdoor" ? ATELIER_ENGINE_RULES.outdoorExtraCost : 0;
  const dimmerCost =
    spec.dimmer === "wireless" ? ATELIER_ENGINE_RULES.wirelessDimmerCost : 0;

  // Dahili Atölye Taban Maliyet Hesabı:
  // Atölye kütük plaka tahsis kuralı: Müşteri bir boyut seçtiğinde atölye o ebadın
  // plakasını kesim tezgâhına bağlar. Kontur kesimde dahi levha o ebat kütüğünden
  // çıktığı için pleksi maliyeti plaka alanından aşağı düşemez.
  const plateAreaM2 = (sizeConfig.widthCm * sizeConfig.heightCm) / 10000;
  const contourAreaM2 = (calculatedWidthCm * calculatedHeightCm) / 10000;
  const billablePlexiAreaM2 = Math.max(contourAreaM2, plateAreaM2);

  const rawMaterialCost =
    billablePlexiAreaM2 * ATELIER_ENGINE_RULES.plexiPerM2Cost +
    neonLengthMeters * neonUnitCost +
    adapterCost +
    overheadCost +
    outdoorCost +
    dimmerCost;

  // Satış Fiyatı Hesabı (Kâr marjlı taban)
  let centerPrice =
    rawMaterialCost * ATELIER_ENGINE_RULES.marginMultiplier +
    backboardConfig.extraCost;

  if (spec.includeInstallation) {
    centerPrice += ATELIER_ENGINE_RULES.installationFeeTl;
  }

  const minRaw = centerPrice * (1 - ATELIER_ENGINE_RULES.rangeSpreadRatio);
  const maxRaw = centerPrice * (1 + ATELIER_ENGINE_RULES.rangeSpreadRatio);

  const minPrice =
    Math.round(minRaw / ATELIER_ENGINE_RULES.roundingStepTl) *
    ATELIER_ENGINE_RULES.roundingStepTl;
  const maxPrice =
    Math.round(maxRaw / ATELIER_ENGINE_RULES.roundingStepTl) *
    ATELIER_ENGINE_RULES.roundingStepTl;

  const isCustomQuoteRequired = calculatedWidthCm > 140;

  return {
    minPrice,
    maxPrice: Math.max(minPrice + 100, maxPrice),
    charCount: totalChars,
    lineCount,
    widthCm: calculatedWidthCm,
    heightCm: calculatedHeightCm,
    minRecommendedWidthCm: Math.max(minRequiredWidthCm, 30),
    isSizeConstrained,
    recommendedSizeId,
    neonLengthMeters,
    powerWatts,
    recommendedAmps,
    isCustomQuoteRequired,
  };
}
