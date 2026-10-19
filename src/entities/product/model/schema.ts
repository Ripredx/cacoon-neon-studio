import { z } from "zod";

export const ProductCategorySchema = z.enum(["tablo", "pleksi"]);

export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().positive(),
  oldPrice: z.number().positive().optional(),
  category: ProductCategorySchema,
  shopierUrl: z.string().url(),
  imageUrl: z.string().url(),
  glowColor: z.enum(["green", "pink", "amber", "red", "cyan", "purple"]),
  badge: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductCategory = z.infer<typeof ProductCategorySchema>;
