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

export function buildCustomNeonWhatsAppUrl(
  spec: CustomNeonSpec,
  estimate: PriceEstimate,
): string {
  const font = NEON_FONTS[spec.fontId].label;
  const color = NEON_COLORS[spec.colorId].label;
  const size = NEON_SIZES[spec.sizeId].label;
  const backboard = NEON_BACKBOARDS[spec.backboardId].label;
  const envLabel =
    spec.environment === "outdoor"
      ? "Dış Mekan (IP67 Su Geçirmez)"
      : "İç Mekan";

  const symbolLine =
    spec.symbolId && spec.symbolId !== "none"
      ? `• Ek Sembol: ${NEON_SYMBOLS[spec.symbolId].label} (${NEON_COLORS[spec.symbolColorId || spec.colorId].label})`
      : null;

  const borderLine =
    spec.borderId && spec.borderId !== "none"
      ? `• Neon Çerçeve: ${NEON_BORDERS[spec.borderId].label}`
      : null;

  const techLine = spec.tubeTech
    ? `• Tüp Teknolojisi: ${NEON_TUBE_TECHS[spec.tubeTech].label}`
    : null;

  const extrasLine =
    spec.dimmer || spec.mountType
      ? `• Donanım: ${spec.dimmer === "wireless" ? "Kablosuz RF Kumanda & Dimmer" : "Standart 12V Güç"} · ${spec.mountType === "hanging" ? "Çelik Telli Askı Seti" : "Krom Duvar yükseltme Vidaları"}`
      : null;

  const lines = [
    `Merhaba ${BUSINESS_CONFIG.name}, web sitenizdeki Tasarım Stüdyosu üzerinden özel neon fiyat teklifi almak istiyorum:`,
    "",
    `• Yazılacak Metin: "${spec.text.trim() || "GLOW"}"`,
    `• Font: ${font}`,
    `• Neon Rengi: ${color}`,
    ...(symbolLine ? [symbolLine] : []),
    ...(borderLine ? [borderLine] : []),
    `• Boyut: ${size} (~${estimate.widthCm}x${estimate.heightCm} cm)`,
    `• Zemin Kesimi: ${backboard}`,
    `• Kullanım Alanı: ${envLabel}`,
    ...(techLine ? [techLine] : []),
    ...(extrasLine ? [extrasLine] : []),
    `• Teknik Metraj: ~${estimate.neonLengthMeters}m LED Tüp · ${estimate.powerWatts}W (${estimate.recommendedAmps}A 12V Adaptör)`,
    `• Sitedeki Tahmini Aralık: ${estimate.minPrice.toLocaleString("tr-TR")} TL - ${estimate.maxPrice.toLocaleString("tr-TR")} TL`,
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
