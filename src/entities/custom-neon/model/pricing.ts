export type NeonFontId = "script" | "modern" | "display" | "retro";
export type NeonColorId =
  | "pink"
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "purple"
  | "white";
export type NeonSizeId = "sm" | "md" | "lg" | "xl";
export type NeonBackboardId = "contour" | "rectangle" | "canvas";
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

export interface CustomNeonSpec {
  text: string;
  fontId: NeonFontId;
  colorId: NeonColorId;
  sizeId: NeonSizeId;
  backboardId: NeonBackboardId;
  environment: NeonEnvironment;
  // Kings of Neon esinli gelişmiş stüdyo özellikleri (opsiyonel — varsayılanlarda mevcut fiyatı değiştirmez)
  symbolId?: NeonSymbolId;
  symbolColorId?: NeonColorId;
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
  widthCm: number;
  heightCm: number;
  neonLengthMeters: number;
  powerWatts: number;
  recommendedAmps: number;
}

export const NEON_FONTS: Record<
  NeonFontId,
  {
    label: string;
    cssFamily: string;
    description: string;
    tubeType: string;
    uppercase?: boolean;
  }
> = {
  script: {
    label: "El Yazısı",
    cssFamily: "'Pacifico', cursive",
    description: "Akıcı el yazısı neon kıvrımı",
    tubeType: "Single Neon · 6mm Esnek Silikon",
  },
  modern: {
    label: "Modern Sans",
    cssFamily: "'Tilt Neon', sans-serif",
    description: "Gerçek neon tüp geometrisi ve net hatlar",
    tubeType: "Single Neon · 8mm Keskin Hat",
  },
  display: {
    label: "Kalın Tabela",
    cssFamily: "'Oswald', sans-serif",
    description: "İşletme ve vitrinler için yüksek görünürlük",
    tubeType: "Bold Neon · 8mm Yüksek Kontrast",
    uppercase: true,
  },
  retro: {
    label: "Çift Hat Retro",
    cssFamily: "'Bungee Inline', sans-serif",
    description: "80'ler synthwave paralel çift tüp stili",
    tubeType: "Double Neon · Çift Kanal Tüp",
    uppercase: true,
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
      "Renkli silikon ceket: Işık kapalıyken gündüz pastel pembe görünür, açıldığında canlı magenta-pembe yanar.",
  },
  cyan: {
    label: "Buz Mavisi",
    hex: "#00f0ff",
    tubeHex: "#d6fcff",
    glowRgb: "0, 240, 255",
    unlitHex: "#67e8f9",
    unlitDescription:
      "Buz mavisi silikon ceket: Gündüz kapalıyken açık turkuaz-mavi okunur, gece keskin siber buz mavisi parlar.",
  },
  green: {
    label: "Zümrüt Yeşili",
    hex: "#10f56c",
    tubeHex: "#d6ffe6",
    glowRgb: "16, 245, 108",
    unlitHex: "#6ee7b7",
    unlitDescription:
      "Yeşil pigmentli silikon: Gündüz kapalıyken mat zümrüt yeşili durur, yanınca yüksek kontrastlı fosforlu yeşil verir.",
  },
  amber: {
    label: "Amber Sarı",
    hex: "#ffb800",
    tubeHex: "#fff2cc",
    glowRgb: "255, 184, 0",
    unlitHex: "#fcd34d",
    unlitDescription:
      "Altın-sarı silikon ceket: Gündüz sıcak sarı görünür, gece kafe ve barlar için sıcak kehribar (amber) ışık yayar.",
  },
  red: {
    label: "Ateş Kırmızısı",
    hex: "#ff2e2e",
    tubeHex: "#ffd6d6",
    glowRgb: "255, 46, 46",
    unlitHex: "#f87171",
    unlitDescription:
      "Kırmızı silikon ceket: Gündüz kapalıyken bile net kırmızı tabela etkisi verir, yanınca yoğun yakut kırmızısı parlar.",
  },
  purple: {
    label: "Ultraviyole Mor",
    hex: "#b538ff",
    tubeHex: "#f0d6ff",
    glowRgb: "181, 56, 255",
    unlitHex: "#e9d5ff",
    unlitDescription:
      "Beyaz/Lila difüzör silikon: Gündüz kapalıyken süt beyazı-lila görünür, açıldığında derin ultraviyole mor atmosfer kurar.",
  },
  white: {
    label: "Gün Işığı",
    hex: "#fff7e6",
    tubeHex: "#ffffff",
    glowRgb: "255, 247, 230",
    unlitHex: "#f8fafc",
    unlitDescription:
      "Saf beyaz silikon: Gündüz kapalıyken temiz mat beyaz durur, yanınca 3500K sıcak-doğal cam tüp beyazı verir.",
  },
};

export const NEON_SIZES: Record<
  NeonSizeId,
  {
    label: string;
    widthCm: number;
    heightCm: number;
    multiplier: number;
    recommendedFor: string;
  }
> = {
  sm: {
    label: "Küçük (50 cm)",
    widthCm: 50,
    heightCm: 22,
    multiplier: 1.0,
    scaleFactor: 0.72,
    tubeGaugeMm: "6mm Micro-Flex",
    recommendedFor: "Oda & Masaüstü",
    fontScaleRem: 3.2,
    symbolSizeClass: "size-10 sm:size-14",
  },
  md: {
    label: "Orta (75 cm)",
    widthCm: 75,
    heightCm: 32,
    multiplier: 1.35,
    scaleFactor: 1.0,
    tubeGaugeMm: "8mm Standart Flex",
    recommendedFor: "Duvar & Ev Dekoru",
    fontScaleRem: 4.5,
    symbolSizeClass: "size-14 sm:size-18",
  },
  lg: {
    label: "Büyük (100 cm)",
    widthCm: 100,
    heightCm: 42,
    multiplier: 1.75,
    scaleFactor: 1.28,
    tubeGaugeMm: "8mm / 10mm Yüksek Işık",
    recommendedFor: "Kafe & Stüdyo",
    fontScaleRem: 5.6,
    symbolSizeClass: "size-18 sm:size-24",
  },
  xl: {
    label: "Kurumsal (135 cm)",
    widthCm: 135,
    heightCm: 55,
    multiplier: 2.25,
    scaleFactor: 1.55,
    tubeGaugeMm: "10mm / 12mm Ultra-Geniş",
    recommendedFor: "Dükkan Cephesi & Bar",
    fontScaleRem: 7.0,
    symbolSizeClass: "size-22 sm:size-28",
  },
};

export const NEON_BACKBOARDS: Record<
  NeonBackboardId,
  { label: string; description: string; extraCost: number }
> = {
  contour: {
    label: "Harf Kesim Şeffaf Pleksi",
    description: "Yazı formuna göre sıfır kenar lazer kesim",
    extraCost: 0,
  },
  rectangle: {
    label: "Dikdörtgen Pleksi Pano",
    description: "Montajı kolay tam çerçeve şeffaf/siyah pleksi",
    extraCost: 150,
  },
  canvas: {
    label: "Baskılı Kanvas Tablo Üzeri",
    description: "Özel tasarım kanvas tablo üstü LED neon",
    extraCost: 300,
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
    label: "Çerçevesiz",
    description: "Sadece yazı ve sembol parlar",
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

// Tek noktadan güncellenebilir fiyatlandırma sabitleri
// shortcut: Harf sayısına dayalı doğrusal tahmin kullanır, gerçek CNC/LED metraj ölçümü gerektiğinde SVG path uzunluğu hesabına yükseltilmeli.
const PRICING_RULES = {
  baseCostTl: 650, // Adaptör, işçilik ve minimum pleksi taban maliyeti
  perCharCostTl: 75, // Harf başı ortalama LED + lehim maliyeti
  outdoorExtraTl: 400, // IP67 dış mekan silikon ve su geçirmez trafo farkı
  rangeSpreadRatio: 0.14, // +/- %14 esnaf güvenlik marjı
  roundingStepTl: 50,
} as const;

export function calculateNeonPrice(spec: CustomNeonSpec): PriceEstimate {
  const cleanText = spec.text.replace(/\s+/g, "");
  const effectiveCharCount = Math.max(1, Math.min(cleanText.length, 30));
  const sizeConfig = NEON_SIZES[spec.sizeId];
  const backboardConfig = NEON_BACKBOARDS[spec.backboardId];

  const rawCore =
    (PRICING_RULES.baseCostTl +
      effectiveCharCount * PRICING_RULES.perCharCostTl) *
    sizeConfig.multiplier;

  const envCost =
    spec.environment === "outdoor" ? PRICING_RULES.outdoorExtraTl : 0;
  const centerPrice = rawCore + backboardConfig.extraCost + envCost;

  const minRaw = centerPrice * (1 - PRICING_RULES.rangeSpreadRatio * 0.5);
  const maxRaw = centerPrice * (1 + PRICING_RULES.rangeSpreadRatio);

  const minPrice =
    Math.round(minRaw / PRICING_RULES.roundingStepTl) *
    PRICING_RULES.roundingStepTl;
  const maxPrice =
    Math.round(maxRaw / PRICING_RULES.roundingStepTl) *
    PRICING_RULES.roundingStepTl;

  // Mühendislik Paftası (Blueprint CAD Title Block) için gerçekçi LED metraj ve Güç (Watt / Amper) hesabı
  const symbolExtraMeters =
    spec.symbolId && spec.symbolId !== "none"
      ? NEON_SYMBOLS[spec.symbolId].extraMeters
      : 0;
  const borderExtraMeters =
    spec.borderId && spec.borderId !== "none"
      ? NEON_BORDERS[spec.borderId].extraMeters * (sizeConfig.widthCm / 75)
      : 0;

  const rawMeters =
    effectiveCharCount * 0.24 * (sizeConfig.widthCm / 75) +
    symbolExtraMeters +
    borderExtraMeters;
  const neonLengthMeters = Math.max(0.8, Math.round(rawMeters * 10) / 10);
  const wattsPerMeter = spec.tubeTech === "luminex" ? 11.5 : 9.0;
  const powerWatts = Math.max(12, Math.round(neonLengthMeters * wattsPerMeter));
  const recommendedAmps = Math.max(2, Math.ceil((powerWatts * 1.25) / 12));

  // Çerçeve geometrisine göre akrilik ve dış hat ölçüsü kalibrasyonu:
  // Daire çerçevede en ve boy eşittir (Çap = widthCm). Kapsülde oranlar yuvarlatılmış uçlara göre dengelenir.
  const calculatedWidthCm = sizeConfig.widthCm;
  let calculatedHeightCm = sizeConfig.heightCm;

  if (spec.borderId === "circle") {
    // Rozet/Daire çerçeve tam daireseldir: Çap taban genişliği baz alınır
    calculatedHeightCm = calculatedWidthCm;
  } else if (spec.borderId === "pill") {
    // Kapsül çerçeve stadyum formunda olduğundan yüksekliği daha dolgun bir orana kavuşur
    calculatedHeightCm = Math.round(calculatedWidthCm * 0.48);
  }

  return {
    minPrice,
    maxPrice: Math.max(minPrice + 150, maxPrice),
    charCount: cleanText.length,
    widthCm: calculatedWidthCm,
    heightCm: calculatedHeightCm,
    neonLengthMeters,
    powerWatts,
    recommendedAmps,
  };
}
