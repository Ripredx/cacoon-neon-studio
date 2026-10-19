import rawProducts from "../api/products.json" with { type: "json" };
import { type Product, ProductSchema } from "../model/schema.ts";

// Çalışma zamanında (runtime) tüm ürünleri Zod şemasından geçirerek tip güvenliğini garanti eder.
export function getVerifiedProducts(): Product[] {
  return ProductSchema.array().parse(rawProducts);
}
