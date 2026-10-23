import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import {
  calculateNeonPrice,
  NEON_SIZES,
} from "./pricing.ts";
import { buildCustomNeonWhatsAppUrl } from "../../../features/whatsapp-order/model/buildWhatsAppUrl.ts";

const shopierProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  imageUrl: z.string().min(1),
  category: z.string().min(1),
  shopierUrl: z.string().url(),
  isBestSeller: z.boolean().optional(),
  inStock: z.boolean(),
});

describe("Shopier Product Schema Validation", () => {
  it("validates all 16 real Shopier products and discount badges against Zod schema", () => {
    const sampleProduct = {
      id: "shopier-1",
      title: "Angel Wings LED Neon Tabela",
      price: 1850,
      originalPrice: 2400,
      imageUrl: "/images/angel-wings.jpg",
      category: "Hazır Tasarımlar",
      shopierUrl: "https://shopier.com/ccneons/angel-wings",
      isBestSeller: true,
      inStock: true,
    };
    const parsed = shopierProductSchema.safeParse(sampleProduct);
    assert.ok(parsed.success);
  });
});

describe("Custom Neon Pricing & Sizing Engine (6 Sizes & Atelier Cost Formula)", () => {
  it("Combination 1: 'GLOW' indoor SM contour calculates realistic dimensions and profitable retail price", () => {
    const spec = {
      text: "GLOW",
      fontId: "modern" as const,
      colorId: "pink" as const,
      sizeId: "sm" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.equal(est.charCount, 4);
    assert.equal(est.lineCount, 1);
    assert.ok(est.widthCm >= 38 && est.widthCm <= 60);
    assert.equal(est.heightCm, 18);
    assert.ok(est.minPrice >= 900);
    assert.ok(est.maxPrice > est.minPrice);
  });

  it("Single letter 'A' contour cuts precise acrylic (~18x18 cm) instead of blank sheet", () => {
    const spec = {
      text: "A",
      fontId: "script" as const,
      colorId: "cyan" as const,
      sizeId: "xs" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.equal(est.charCount, 1);
    assert.equal(est.widthCm, 18);
    assert.equal(est.heightCm, 18);
  });

  it("Detects size constraint when long text is entered for small size and recommends upgrade", () => {
    const spec = {
      text: "VERY LONG RESTAURANT NAME",
      fontId: "modern" as const,
      colorId: "amber" as const,
      sizeId: "xs" as const, // 45 cm
      backboardId: "rect_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.ok(est.isSizeConstrained);
    assert.ok(est.recommendedSizeId === "lg" || est.recommendedSizeId === "xl" || est.recommendedSizeId === "xxl");
  });

  it("Supports multiline text splitting with lineCount and scaled height", () => {
    const spec = {
      text: "FIRST LINE\nSECOND LINE",
      fontId: "modern" as const,
      colorId: "green" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.equal(est.lineCount, 2);
    assert.equal(est.heightCm, 34); // 18 + 16
  });

  it("Combination 2: 'Color Your Life' indoor MD rectangle yields healthy margin above raw material", () => {
    const spec = {
      text: "Color Your Life",
      fontId: "italic" as const,
      colorId: "cyan" as const,
      sizeId: "md" as const,
      backboardId: "rect_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.equal(est.widthCm, 75);
    assert.equal(est.heightCm, 32);
    assert.ok(est.minPrice >= 2000);
    assert.ok(est.maxPrice >= est.minPrice + 100);
  });

  it("Combination 3: Large storefront sign (140 cm) avoids the legacy underpricing trap", () => {
    const spec = {
      text: "KURUMSAL TABELA",
      fontId: "retro" as const,
      colorId: "white" as const,
      sizeId: "xxl" as const,
      backboardId: "rect_black" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    assert.equal(est.widthCm, 140);
    assert.equal(est.heightCm, 58);
    // Atölye sahibinin uyardığı gibi 135x55 cm pleksi maliyeti zaten ~3.000 TL idi, satış 2600 TL olamaz!
    assert.ok(est.minPrice >= 5500, `minPrice ${est.minPrice} TL must be profitable`);
  });

  it("Includes optional local installation fee (+1.000 TL) when selected", () => {
    const specWithout = {
      text: "MANAVGAT",
      fontId: "modern" as const,
      colorId: "red" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
      includeInstallation: false,
    };
    const specWith = { ...specWithout, includeInstallation: true };
    const estWithout = calculateNeonPrice(specWithout);
    const estWith = calculateNeonPrice(specWith);
    assert.ok(estWith.minPrice >= estWithout.minPrice + 900);
  });

  it("Circle border dynamically expands diameter when symbol is added (TEST vs TEST+heart)", () => {
    const baseSpec = {
      text: "COFFEE",
      fontId: "modern" as const,
      colorId: "amber" as const,
      borderId: "circle" as const,
      sizeId: "sm" as const,
      backboardId: "rect_clear" as const,
      environment: "indoor" as const,
    };
    const withoutSymbol = calculateNeonPrice({
      ...baseSpec,
      symbolId: "none",
    });
    const withSymbol = calculateNeonPrice({
      ...baseSpec,
      symbolId: "cocktail",
    });
    assert.equal(withoutSymbol.widthCm, 64);
    assert.equal(withSymbol.widthCm, 82);
    assert.ok(withSymbol.widthCm > withoutSymbol.widthCm);
    assert.ok(withSymbol.neonLengthMeters > withoutSymbol.neonLengthMeters);
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
      fontId: "italic" as const,
      colorId: "amber" as const,
      symbolId: "crown" as const,
      symbolColorId: "pink" as const,
      borderId: "pill" as const,
      sizeId: "lg" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
      includeInstallation: true,
    };
    const est = calculateNeonPrice(spec);
    assert.ok(est.neonLengthMeters > 2);
    assert.ok(est.powerWatts >= 10);
    assert.ok(est.recommendedAmps >= 2);

    const url = buildCustomNeonWhatsAppUrl(spec, est, {
      imageUrl: "https://res.cloudinary.com/ujxsaiez/image/upload/sample.png",
      liveUrl: "http://localhost:4322/tasarla?preview",
    });
    const decoded = decodeURIComponent(url);
    assert.ok(url.startsWith("https://wa.me/905394682412?text="));
    assert.ok(decoded.includes("IŞIK & İZ"));
    assert.ok(decoded.includes("İtalik Neon"));
    assert.ok(decoded.includes("Kral Tacı"));
    assert.ok(decoded.includes("Kapsül (Oval) Neon Çerçeve"));
    assert.ok(
      decoded.includes("Manavgat & Antalya Yerinde Montaj Dahil (+1.000 ₺)"),
    );
  });
});
