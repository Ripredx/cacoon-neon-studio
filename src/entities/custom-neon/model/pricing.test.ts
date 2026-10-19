import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildCustomNeonWhatsAppUrl } from "../../../features/whatsapp-order/model/buildWhatsAppUrl.ts";
import { getVerifiedProducts } from "../../product/api/getProducts.ts";
import { calculateNeonPrice } from "./pricing.ts";

describe("Shopier Product Schema Validation", () => {
  it("validates all 16 real Shopier products and discount badges against Zod schema", () => {
    const products = getVerifiedProducts();
    assert.equal(products.length, 16);

    const tabloCount = products.filter((p) => p.category === "tablo").length;
    const pleksiCount = products.filter((p) => p.category === "pleksi").length;
    assert.equal(tabloCount, 8);
    assert.equal(pleksiCount, 8);

    const discounted = products.find((p) => p.id === "40507796");
    assert.ok(discounted);
    assert.equal(discounted.price, 800);
    assert.equal(discounted.oldPrice, 900);
    assert.equal(discounted.badge, "%11 İndirim");
  });
});

describe("Custom Neon Pricing Engine (3 Exact Combination Comparisons)", () => {
  it("Combination 1: 'GLOW' indoor SM contour matches exact legacy formula (900 TL - 1100 TL)", () => {
    const est = calculateNeonPrice({
      text: "GLOW",
      fontId: "script",
      colorId: "pink",
      sizeId: "sm",
      backboardId: "contour",
      environment: "indoor",
    });
    assert.equal(est.charCount, 4);
    assert.equal(est.widthCm, 38); // 4 harf contour: 4 * 9.5 = 38 cm (harf kesim pleksi boyutu)
    assert.equal(est.heightCm, 18);
    assert.equal(est.minPrice, 900);
    assert.equal(est.maxPrice, 1100);
  });

  it("Single letter 'A' contour cuts precise acrylic (~18x18 cm) instead of blank 50cm sheet", () => {
    const est = calculateNeonPrice({
      text: "A",
      fontId: "modern",
      colorId: "cyan",
      sizeId: "sm",
      backboardId: "contour",
      environment: "indoor",
    });
    assert.equal(est.charCount, 1);
    assert.equal(est.widthCm, 18); // Tek harf harf kesim akrilik
    assert.equal(est.heightCm, 18);
    assert.equal(est.isSizeConstrained, false);
  });

  it("Detects size constraint when long text is entered for small size and recommends upgrade", () => {
    const est = calculateNeonPrice({
      text: "WELCOME TO THE LOUNGE",
      fontId: "modern",
      colorId: "pink",
      sizeId: "sm", // 50 cm
      backboardId: "contour",
      environment: "indoor",
    });
    assert.equal(est.isSizeConstrained, true);
    assert.ok(est.minRecommendedWidthCm > 75);
    assert.ok(est.recommendedSizeId === "lg" || est.recommendedSizeId === "xl");
  });

  it("Supports multiline text splitting with lineCount and scaled height", () => {
    const est = calculateNeonPrice({
      text: "OPEN\nLATE",
      fontId: "modern",
      colorId: "pink",
      sizeId: "md",
      backboardId: "rectangle",
      environment: "indoor",
    });
    assert.equal(est.lineCount, 2);
    assert.equal(est.charCount, 8);
    assert.ok(est.heightCm > 32); // 2 satır için akrilik yüksekliği genişler
  });

  it("Combination 2: 'Color Your Life' indoor MD rectangle matches exact legacy formula (2200 TL - 2650 TL)", () => {
    const est = calculateNeonPrice({
      text: "Color Your Life",
      fontId: "modern",
      colorId: "cyan",
      sizeId: "md",
      backboardId: "rectangle",
      environment: "indoor",
    });
    assert.equal(est.charCount, 13);
    assert.equal(est.widthCm, 75);
    assert.equal(est.heightCm, 32);
    assert.equal(est.minPrice, 2200);
    assert.equal(est.maxPrice, 2650);
  });

  it("Combination 3: 'MANAVGAT' outdoor XL canvas matches exact legacy formula (3250 TL - 4000 TL)", () => {
    const est = calculateNeonPrice({
      text: "MANAVGAT",
      fontId: "display",
      colorId: "amber",
      sizeId: "xl",
      backboardId: "canvas",
      environment: "outdoor",
    });
    assert.equal(est.charCount, 8);
    assert.equal(est.widthCm, 135);
    assert.equal(est.heightCm, 55);
    assert.equal(est.minPrice, 3250);
    assert.equal(est.maxPrice, 4000);
  });
});

describe("Turkish Locale & WhatsApp URL Encoding", () => {
  it("converts Turkish characters accurately with toLocaleUpperCase('tr-TR')", () => {
    assert.equal("mindset".toLocaleUpperCase("tr-TR"), "MİNDSET");
    assert.equal("ışık".toLocaleUpperCase("tr-TR"), "IŞIK");
    assert.equal("İıĞğŞşÇçÖöÜü".toLocaleUpperCase("tr-TR"), "İIĞĞŞŞÇÇÖÖÜÜ");
  });

  it("encodes WhatsApp studio order URL with all selected specs and CAD metrics", () => {
    const spec = {
      text: "IŞIK & İZ",
      fontId: "display" as const,
      colorId: "amber" as const,
      symbolId: "crown" as const,
      symbolColorId: "pink" as const,
      borderId: "pill" as const,
      tubeTech: "luminex" as const,
      sizeId: "lg" as const,
      backboardId: "contour" as const,
      environment: "outdoor" as const,
      includeDimmer: true,
      mountType: "hanging" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.ok(est.neonLengthMeters > 2);
    assert.ok(est.powerWatts >= 12);
    assert.ok(est.recommendedAmps >= 2);

    const url = buildCustomNeonWhatsAppUrl(spec, est, {
      imageUrl: "https://res.cloudinary.com/ujxsaiez/image/upload/sample.png",
      liveUrl: "http://localhost:4321/tasarla#preview",
    });
    const decoded = decodeURIComponent(url);
    assert.ok(url.startsWith("https://wa.me/905530460610?text="));
    assert.ok(decoded.includes("IŞIK & İZ"));
    assert.ok(
      decoded.includes(
        "Dış Mekan (IP67 Sıvı Silikon İzolasyonlu & Su Geçirmez)",
      ),
    );
    assert.ok(decoded.includes("Kral Tacı"));
    assert.ok(decoded.includes("Kapsül (Oval) Neon Çerçeve"));
    assert.ok(decoded.includes("Luminex™ Pro"));
    assert.ok(
      decoded.includes(
        "Teknik Üretim Paftası (Görsel): https://res.cloudinary.com/ujxsaiez/image/upload/sample.png",
      ),
    );
    assert.ok(
      decoded.includes(
        "Canlı Stüdyo 3D Simülasyonu: http://localhost:4321/tasarla#preview",
      ),
    );
  });
});
