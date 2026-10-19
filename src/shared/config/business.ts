export const BUSINESS_CONFIG = {
  name: "C/CNEON'S GLOW",
  handle: "neons.glow",
  slogan: "Color your life",
  location: "Antalya / Manavgat",
  logoUrl:
    "https://cdn.shopier.app/logo_468/ccneonsglow_71d8ac3e4e7e07e06ae696efd6901290.jpeg",
  phones: [
    {
      label: "Sipariş & WhatsApp Hattı 1",
      raw: "905394682412",
      display: "+90 539 468 24 12",
    },
    {
      label: "Sipariş & WhatsApp Hattı 2",
      raw: "905378664207",
      display: "+90 537 866 42 07",
    },
  ],
  shopierUrl: "https://www.shopier.com/ccneonsglow",
  instagramUrl: "https://www.instagram.com/neons.glow/",
  studioCredit: {
    name: "archc.studio",
    url: "https://archc.studio",
    note: "Dijital Vitrin & Özel Yazılım Altyapısı",
  },
} as const;

/**
 * 6 Ayarlanabilir Neon & Hareket Parametresi (Bölüm 11.4)
 */
export const NEON_ENGINE_CONFIG = {
  glowIntensity: 1.0, // 1. Halo parlaklık çarpanı (CSS --glow-intensity ile senkron)
  ignitionDurationMs: 520, // 2. Açılışta tüp ateşleme titreme süresi (< 600ms kuralı)
  lenisLerp: 0.09, // 3. Lenis yumuşak kaydırma sönümleme katsayısı
  wallSpillOpacity: 0.38, // 4. Duvara düşen atmosferik ışık havuzu opaklığı
  tiltMaxDeg: 4.5, // 5. İnce işaretçili cihazlarda koleksiyon kartı 3B tilt açısı
  priceRollDurationMs: 280, // 6. Stüdyo kayan rakam (rolling digits) animasyon süresi
} as const;
