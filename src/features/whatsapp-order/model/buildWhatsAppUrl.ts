import {
  type CustomNeonSpec,
  NEON_BACKBOARDS,
  NEON_BORDERS,
  NEON_COLORS,
  NEON_FONTS,
  NEON_SIZES,
  NEON_SYMBOLS,
  type PriceEstimate,
} from "../../../entities/custom-neon/model/pricing.ts";
import { BUSINESS_CONFIG } from "../../../shared/config/business.ts";

export function buildLiveStudioUrl(
  spec: CustomNeonSpec,
  origin?: string,
): string {
  const base = origin || BUSINESS_CONFIG.siteUrl || "https://ccneons.com";
  const params = new URLSearchParams({
    text: spec.text,
    font: spec.fontId,
    color: spec.colorId,
    size: spec.sizeId,
    board: spec.backboardId,
    env: spec.environment,
    sym: spec.symbolId || "none",
    symColor: spec.symbolColorId || spec.colorId,
    border: spec.borderId || "none",
  });
  return `${base.replace(/\/$/, "")}/tasarla?${params.toString()}`;
}

export function buildCustomNeonWhatsAppUrl(
  spec: CustomNeonSpec,
  estimate: PriceEstimate,
  options?: {
    imageUrl?: string;
    liveUrl?: string;
  },
): string {
  const font = NEON_FONTS[spec.fontId]?.label || spec.fontId;
  const color = NEON_COLORS[spec.colorId]?.label || spec.colorId;
  const size = NEON_SIZES[spec.sizeId]?.label || spec.sizeId;
  const backboard =
    NEON_BACKBOARDS[spec.backboardId]?.label || spec.backboardId;
  const envLabel =
    spec.environment === "outdoor"
      ? "Dış Mekan (IP67 Sıvı Silikon İzolasyonlu & Su Geçirmez)"
      : "İç Mekan (IP20 Toz Korumalı)";

  const symbolLine =
    spec.symbolId && spec.symbolId !== "none"
      ? `• Ek Sembol: ${NEON_SYMBOLS[spec.symbolId]?.label || spec.symbolId} (${NEON_COLORS[spec.symbolColorId || spec.colorId]?.label || ""})`
      : null;

  const borderLine =
    spec.borderId && spec.borderId !== "none"
      ? `• Neon Çerçeve: ${NEON_BORDERS[spec.borderId]?.label || spec.borderId}`
      : null;

  const pleksiLine = `• Zemin & Pleksi: 4mm Döküm Pleksiglas (${backboard})`;
  const mountLine = spec.includeInstallation
    ? "• Montaj Tercihi: Manavgat & Antalya Yerinde Montaj Dahil (+1.000 ₺)"
    : "• Montaj Tercihi: Montaj Hariç (Kargo Teslim)";

  const imageLine = options?.imageUrl
    ? `• Teknik Üretim Paftası (Görsel): ${options.imageUrl}`
    : null;

  const rawLive = options?.liveUrl || buildLiveStudioUrl(spec);
  const cleanLiveUrl = rawLive.includes("#")
    ? rawLive.replace("#", rawLive.includes("?") ? "&" : "?")
    : rawLive;

  const liveLine = cleanLiveUrl
    ? `• Canlı Stüdyo 3D Simülasyonu: ${cleanLiveUrl}`
    : null;

  const linesOfText = spec.text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const textDisplay =
    linesOfText.length > 1
      ? linesOfText.map((l, i) => `Satır ${i + 1}: "${l}"`).join(" / ")
      : `"${spec.text.trim() || "GLOW"}"`;

  const lines = [
    `Merhaba ${BUSINESS_CONFIG.name}, web sitenizdeki Tasarım Stüdyosu üzerinden özel neon fiyat teklifi almak istiyorum:`,
    "",
    ...(imageLine ? [imageLine, ""] : []),
    `• Yazılacak Metin: ${textDisplay} (${estimate.lineCount > 1 ? `${estimate.lineCount} Satırlı Yerleşim` : "Tek Satır"})`,
    `• Font: ${font}`,
    `• Neon Rengi: ${color}`,
    ...(symbolLine ? [symbolLine] : []),
    ...(borderLine ? [borderLine] : []),
    `• Boyut: ${size} (~${estimate.widthCm}x${estimate.heightCm} cm)`,
    pleksiLine,
    `• LED Tüp: ${spec.tubeTech === "luminex" ? "Luminex™ Pro Çift Yoğunluklu Tüp" : "Splice™ Standart Silikon LED"}`,
    ...(spec.dimmer === "wireless"
      ? ["• Dimmer & Kontrol: Kablosuz RF Uzaktan Kumanda"]
      : []),
    `• Kullanım Alanı: ${envLabel}`,
    mountLine,
    `• LED Metraj: ~${estimate.neonLengthMeters} metre`,
    estimate.isCustomQuoteRequired
      ? "• Sitedeki Tahmini Durum: 140 cm üzeri özel ebat için doğrudan fiyat teklifi"
      : `• Sitedeki Tahmini Aralık: ${estimate.minPrice.toLocaleString("tr-TR")} TL - ${estimate.maxPrice.toLocaleString("tr-TR")} TL`,
    ...(liveLine ? ["", liveLine] : []),
    "",
    "Net fiyat ve teslim süresi hakkında bilgi alabilir miyim?",
  ];

  const encoded = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${BUSINESS_CONFIG.phones[0].raw}?text=${encoded}`;
}

export function buildB2BWhatsAppUrl(businessType?: string): string {
  const typeText = businessType ? ` (${businessType})` : "";
  const message = `Merhaba ${BUSINESS_CONFIG.name}, işletmemiz${typeText} için özel tasarım neon tabela / logo çalışması hakkında fiyat ve bilgi almak istiyorum.`;
  return `https://wa.me/${BUSINESS_CONFIG.phones[0].raw}?text=${encodeURIComponent(message)}`;
}
