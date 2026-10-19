import {
  type CustomNeonSpec,
  NEON_BACKBOARDS,
  NEON_BORDERS,
  NEON_COLORS,
  NEON_FONTS,
  NEON_SIZES,
  NEON_SYMBOLS,
  NEON_TUBE_TECHS,
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
    tech: spec.tubeTech || "standard",
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
  const font = NEON_FONTS[spec.fontId].label;
  const color = NEON_COLORS[spec.colorId].label;
  const size = NEON_SIZES[spec.sizeId].label;
  const backboard = NEON_BACKBOARDS[spec.backboardId].label;
  const envLabel =
    spec.environment === "outdoor"
      ? "Dış Mekan (IP67 Sıvı Silikon İzolasyonlu & Su Geçirmez)"
      : "İç Mekan (IP20 Toz Korumalı)";

  const symbolLine =
    spec.symbolId && spec.symbolId !== "none"
      ? `• Ek Sembol: ${NEON_SYMBOLS[spec.symbolId].label} (${NEON_COLORS[spec.symbolColorId || spec.colorId].label})`
      : null;

  const borderLine =
    spec.borderId && spec.borderId !== "none"
      ? `• Neon Çerçeve: ${NEON_BORDERS[spec.borderId].label}`
      : null;

  const techLine = `• Tüp Teknolojisi: ${
    spec.tubeTech
      ? NEON_TUBE_TECHS[spec.tubeTech].label
      : "Splice™ 1. Sınıf Silikon LED (12V DC)"
  }`;

  const pleksiLine = `• Zemin & Pleksi: 4mm CNC Lazer Kesim Şeffaf Döküm Pleksiglas (${backboard})`;

  const dimmerLabel =
    spec.dimmer === "wireless" || spec.includeDimmer
      ? "Kablosuz RF Mini Kumanda (Dimmer, Çakar/Flaş, On/Off Hafızalı)"
      : "Standart 12V DC Inline Güç Girişi";

  const mountLabel =
    spec.mountType === "hanging"
      ? "Çelik Askı Teli + Tavan Kancası Kiti"
      : "4x Paslanmaz Krom Duvar Yükseltme Vidası + Dübel Seti (Ø5mm Havşalı Delikler)";

  const extrasLine = `• Donanım & Montaj: ${dimmerLabel} · ${mountLabel}`;

  const imageLine = options?.imageUrl
    ? `• Teknik Üretim Paftası (Görsel): ${options.imageUrl}`
    : null;

  const rawLive = options?.liveUrl || buildLiveStudioUrl(spec);
  // WhatsApp '#' parçalarını bazen link dışı bıraktığından '?' query string ile garantile
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
    `• Kullanım Alanı: ${envLabel}`,
    techLine,
    extrasLine,
    `• Teknik Metraj: ~${estimate.neonLengthMeters}m LED Tüp · ${estimate.powerWatts}W (${estimate.recommendedAmps}A 12V CE Adaptör Dahil)`,
    `• Sitedeki Tahmini Aralık: ${estimate.minPrice.toLocaleString("tr-TR")} TL - ${estimate.maxPrice.toLocaleString("tr-TR")} TL`,
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
