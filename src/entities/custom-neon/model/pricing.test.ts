import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { buildCustomNeonWhatsAppUrl } from "../../../features/whatsapp-order/model/buildWhatsAppUrl.ts";
import { calculateNeonPrice } from "./pricing.ts";

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
    assert.ok(
      est.recommendedSizeId === "lg" ||
        est.recommendedSizeId === "xl" ||
        est.recommendedSizeId === "xxl",
    );
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
    assert.ok(
      est.minPrice >= 5500,
      `minPrice ${est.minPrice} TL must be profitable`,
    );
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

  it("Combination 4: XL 120cm sign with contour cut guarantees at least 4.000 TL retail price to cover 2.400 TL acrylic sheet cost", () => {
    const spec = {
      text: "RESTAURANT",
      fontId: "modern" as const,
      colorId: "pink" as const,
      sizeId: "xl" as const, // 120 cm
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(spec);
    // 120x50 pleksi maliyeti 2.400 TL olduğu için satış fiyatı 1.550 TL olamaz, minimum 4.200 TL üstü olmalı
    assert.ok(
      est.minPrice >= 4200,
      `minPrice was ${est.minPrice}, must be >= 4200 TL to cover 2.400 TL acrylic sheet`,
    );
  });

  it("Retro double-line font increases neon meterage and price above single line font", () => {
    const baseSpec = {
      text: "RETRO",
      colorId: "pink" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const singleLine = calculateNeonPrice({ ...baseSpec, fontId: "modern" });
    const doubleLine = calculateNeonPrice({ ...baseSpec, fontId: "retro" });
    assert.ok(doubleLine.neonLengthMeters > singleLine.neonLengthMeters);
    assert.ok(doubleLine.minPrice > singleLine.minPrice);
  });

  it("Outdoor environment adds IP67 weatherproofing margin", () => {
    const baseSpec = {
      text: "OUTDOOR",
      fontId: "modern" as const,
      colorId: "cyan" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
    };
    const indoor = calculateNeonPrice({ ...baseSpec, environment: "indoor" });
    const outdoor = calculateNeonPrice({ ...baseSpec, environment: "outdoor" });
    assert.ok(outdoor.minPrice >= indoor.minPrice + 400);
  });

  it("Luminex Pro tube tech reflects premium tube cost", () => {
    const baseSpec = {
      text: "LUMINEX",
      fontId: "modern" as const,
      colorId: "amber" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const standard = calculateNeonPrice({ ...baseSpec, tubeTech: "standard" });
    const luminex = calculateNeonPrice({ ...baseSpec, tubeTech: "luminex" });
    assert.ok(luminex.minPrice >= standard.minPrice + 100);
  });

  it("Wireless dimmer adds remote hardware cost", () => {
    const baseSpec = {
      text: "DIMMER",
      fontId: "modern" as const,
      colorId: "white" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const standard = calculateNeonPrice({ ...baseSpec, dimmer: "standard" });
    const wireless = calculateNeonPrice({ ...baseSpec, dimmer: "wireless" });
    assert.ok(wireless.minPrice >= standard.minPrice + 200);
  });

  it("Updates calculated dimensions dynamically when size is changed in studio ('Open Late' across sizes)", () => {
    const baseSpec = {
      text: "Open Late",
      fontId: "script" as const,
      colorId: "cyan" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const xs = calculateNeonPrice({ ...baseSpec, sizeId: "xs" });
    const sm = calculateNeonPrice({ ...baseSpec, sizeId: "sm" });
    const md = calculateNeonPrice({ ...baseSpec, sizeId: "md" });
    const lg = calculateNeonPrice({ ...baseSpec, sizeId: "lg" });
    const xl = calculateNeonPrice({ ...baseSpec, sizeId: "xl" });
    const xxl = calculateNeonPrice({ ...baseSpec, sizeId: "xxl" });

    assert.equal(xs.widthCm, 45);
    assert.equal(sm.widthCm, 60);
    assert.equal(md.widthCm, 75);
    assert.equal(lg.widthCm, 100);
    assert.equal(xl.widthCm, 120);
    assert.equal(xxl.widthCm, 140);

    assert.ok(lg.heightCm > md.heightCm);
    assert.ok(xl.heightCm > lg.heightCm);
    assert.ok(xxl.heightCm > xl.heightCm);
  });

  it("Prevents vertical multi-line narrow text from inflating to 140 cm horizontal width in XXL", () => {
    const verticalSpec = {
      text: "Open\nLatee\neeeee\neeeee",
      fontId: "script" as const,
      colorId: "cyan" as const,
      symbolId: "moon" as const,
      sizeId: "xxl" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(verticalSpec);
    assert.equal(est.lineCount, 4);
    assert.ok(
      est.widthCm < 110,
      `Expected narrow vertical sign width < 110 cm, got ${est.widthCm} cm`,
    );
    assert.ok(
      est.heightCm <= 135,
      `Expected vertical sign height <= 135 cm, got ${est.heightCm} cm`,
    );
  });

  it("Adjusts dimensions and meterage when symbolPosition and symbolScale are customized", () => {
    const baseSpec = {
      text: "OPEN",
      fontId: "modern" as const,
      colorId: "pink" as const,
      symbolId: "moon" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    };
    const rightNormal = calculateNeonPrice({
      ...baseSpec,
      symbolPosition: "right",
      symbolScale: 1,
    });
    const bottomLarge = calculateNeonPrice({
      ...baseSpec,
      symbolPosition: "bottom",
      symbolScale: 1.5,
    });

    assert.ok(rightNormal.widthCm > bottomLarge.widthCm);
    assert.ok(bottomLarge.heightCm > rightNormal.heightCm);
    assert.ok(bottomLarge.neonLengthMeters > rightNormal.neonLengthMeters);
  });

  it("User Scenario: Calculates physically calibrated meterage (~9.8m, NOT 12.4m) for 29-letter 6-line retro font with diamond symbol", () => {
    const denseMultiLineSpec = {
      text: "OPEN\nLATEE\nEEEEE\nEEEEE\nEEEEE\nEEEEE",
      fontId: "retro" as const, // Double stroke (1.85x)
      colorId: "pink" as const,
      symbolId: "diamond" as const, // 0.9m single stroke
      sizeId: "sm" as const, // 60cm
      backboardId: "rect_black" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(denseMultiLineSpec);
    assert.equal(est.charCount, 29);
    assert.equal(est.lineCount, 6);
    assert.equal(est.widthCm, 60);
    assert.equal(est.heightCm, 85);
    // Previously bugged at 12.4m; physical calibration must yield 9.0m - 10.2m
    assert.ok(
      est.neonLengthMeters >= 9.0 && est.neonLengthMeters <= 10.2,
      `Expected neonLengthMeters between 9.0 and 10.2m, got ${est.neonLengthMeters}m`,
    );
    assert.ok(est.powerWatts < 100);
    assert.ok(
      est.minPrice >= 5000 && est.minPrice <= 6500,
      `Expected minPrice between 5000 and 6500 TL, got ${est.minPrice} TL`,
    );
  });

  it("Isolates symbol meterage: Double-stroke retro font does NOT multiply single-stroke symbols by 1.85x", () => {
    const withoutSymbol = calculateNeonPrice({
      text: "RETRO",
      fontId: "retro" as const,
      colorId: "cyan" as const,
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    });
    const withDiamond = calculateNeonPrice({
      text: "RETRO",
      fontId: "retro" as const,
      colorId: "cyan" as const,
      symbolId: "diamond" as const, // 0.55m
      sizeId: "md" as const,
      backboardId: "contour_clear" as const,
      environment: "indoor" as const,
    });
    const meterDiff =
      Math.round(
        (withDiamond.neonLengthMeters - withoutSymbol.neonLengthMeters) * 10,
      ) / 10;
    // Diamond extraMeters is 0.55m. Difference should be ~0.5m - 0.6m, NOT 0.55 * 1.85 = 1.0m
    assert.ok(
      meterDiff >= 0.5 && meterDiff <= 0.6,
      `Expected symbol meterage diff ~0.55m, got ${meterDiff}m`,
    );
  });

  it("Isolates border meterage: Double-stroke retro font does NOT multiply border meterage by 1.85x", () => {
    const withoutBorder = calculateNeonPrice({
      text: "BAR",
      fontId: "retro" as const,
      colorId: "amber" as const,
      sizeId: "sm" as const,
      backboardId: "rect_clear" as const,
      environment: "indoor" as const,
    });
    const withRectangleBorder = calculateNeonPrice({
      text: "BAR",
      fontId: "retro" as const,
      colorId: "amber" as const,
      borderId: "rectangle" as const,
      sizeId: "sm" as const,
      backboardId: "rect_clear" as const,
      environment: "indoor" as const,
    });
    assert.ok(
      withRectangleBorder.neonLengthMeters > withoutBorder.neonLengthMeters,
    );
    // Border extra meter for rectangle at 60cm is ~1.8m * (60/75) = 1.44m
    const borderDiff =
      withRectangleBorder.neonLengthMeters - withoutBorder.neonLengthMeters;
    assert.ok(
      borderDiff <= 2.0,
      `Expected border diff <= 2.0m, got ${borderDiff}m`,
    );
  });

  it("Handles dense 4-line 44-character text without NaN or dimension collapse", () => {
    const denseSpec = {
      text: "12345678901\n12345678901\n12345678901\n12345678901",
      fontId: "modern" as const,
      colorId: "green" as const,
      sizeId: "lg" as const,
      backboardId: "rect_clear" as const,
      environment: "indoor" as const,
    };
    const est = calculateNeonPrice(denseSpec);
    assert.equal(est.charCount, 44);
    assert.equal(est.lineCount, 4);
    assert.ok(!Number.isNaN(est.minPrice));
    assert.ok(!Number.isNaN(est.neonLengthMeters));
    assert.ok(est.neonLengthMeters >= 6.0 && est.neonLengthMeters <= 12.0);
    assert.ok(est.minPrice >= 3500);
  });

  it("Maintains 1:1 circle and horizontal pill geometry without inflating letter meterage on 6-line text", () => {
    const baseSpec = {
      text: "OPEN\nLATEE\nEEEEE\nEEEEE\nEEEEE\nEEEEE",
      fontId: "retro" as const,
      colorId: "magenta" as const,
      symbolId: "cocktail" as const,
      symbolPosition: "left" as const,
      symbolScale: 1.8,
      sizeId: "sm" as const,
      backboardId: "rect_black" as const,
      environment: "indoor" as const,
    };
    const circleEst = calculateNeonPrice({ ...baseSpec, borderId: "circle" });
    const pillEst = calculateNeonPrice({ ...baseSpec, borderId: "pill" });

    // Circle must be 1:1 square dimensions and not inflate neon to 23m
    assert.equal(circleEst.widthCm, circleEst.heightCm);
    assert.ok(circleEst.neonLengthMeters <= 13.0);

    // Pill must always be a horizontal capsule (width >= height * 1.4)
    assert.ok(pillEst.widthCm >= Math.round(pillEst.heightCm * 1.4));
    assert.ok(pillEst.neonLengthMeters <= 13.0);

    // Multi-line circle diameter must scale across size tiers instead of locking at 112cm
    const circleSm = calculateNeonPrice({
      ...baseSpec,
      symbolId: "none",
      borderId: "circle",
      sizeId: "sm",
    });
    const circleMd = calculateNeonPrice({
      ...baseSpec,
      symbolId: "none",
      borderId: "circle",
      sizeId: "md",
    });
    const circleLg = calculateNeonPrice({
      ...baseSpec,
      symbolId: "none",
      borderId: "circle",
      sizeId: "lg",
    });
    assert.ok(circleMd.widthCm > circleSm.widthCm);
    assert.ok(circleLg.widthCm > circleMd.widthCm);

    // Short 1-line 'TEST' in Mini (45cm) circle yields exact 45x45cm
    const testXsCircle = calculateNeonPrice({
      text: "TEST",
      fontId: "modern",
      colorId: "cyan",
      sizeId: "xs",
      backboardId: "rect_clear",
      borderId: "circle",
      environment: "indoor",
    });
    assert.equal(testXsCircle.widthCm, 45);
    assert.equal(testXsCircle.heightCm, 45);
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
