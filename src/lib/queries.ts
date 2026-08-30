import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews } from "@/db/schema";
import type { Category, Product, Review } from "@/db/schema";
import { productCategories } from "@/lib/categories";
import {
  getMemoryCategories,
  getMemoryProducts,
} from "@/lib/memory-store";

function matchesCategory(slug: string) {
  return or(
    eq(products.categorySlug, slug),
    sql`COALESCE(${products.categorySlugs}, '[]'::jsonb) @> ${JSON.stringify([slug])}::jsonb`,
  );
}

// No-op when db is not configured
export async function ensureSeeded() {
  return null;
}

export async function getCategories(): Promise<Category[]> {
  if (!db) return getMemoryCategories();
  try {
    return await db.select().from(categories).orderBy(asc(categories.sortOrder));
  } catch {
    return getMemoryCategories();
  }
}

export async function getBestSellers(limit = 6): Promise<Product[]> {
  if (!db) return getMemoryProducts().filter((p) => p.isBestSeller).slice(0, limit);
  try {
    return await db
      .select()
      .from(products)
      .where(eq(products.isBestSeller, true))
      .orderBy(desc(products.reviewCount))
      .limit(limit);
  } catch {
    return getMemoryProducts().filter((p) => p.isBestSeller).slice(0, limit);
  }
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  if (!db) return getMemoryProducts().filter((p) => p.isNew).slice(0, limit);
  try {
    return await db
      .select()
      .from(products)
      .where(eq(products.isNew, true))
      .orderBy(desc(products.id))
      .limit(limit);
  } catch {
    return getMemoryProducts().filter((p) => p.isNew).slice(0, limit);
  }
}

export type ShopFilters = {
  category?: string;
  sort?: string;
  q?: string;
  max?: number;
  min?: number;
};

function applyMemoryFilters(filters: ShopFilters): Product[] {
  let list = [...getMemoryProducts()];
  if (filters.category && filters.category !== "all") {
    list = list.filter((p) => productCategories(p).includes(filters.category!));
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q),
    );
  }
  if (typeof filters.min === "number") list = list.filter((p) => p.price >= filters.min!);
  if (typeof filters.max === "number") list = list.filter((p) => p.price <= filters.max!);

  if (filters.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (filters.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  else if (filters.sort === "newest") list.sort((a, b) => b.id - a.id);
  else list.sort((a, b) => b.reviewCount - a.reviewCount);

  return list;
}

export async function getProducts(filters: ShopFilters = {}): Promise<Product[]> {
  if (!db) return applyMemoryFilters(filters);
  try {
    const conditions = [];
    if (filters.category && filters.category !== "all") {
      conditions.push(matchesCategory(filters.category));
    }
    if (filters.q) {
      const term = `%${filters.q}%`;
      conditions.push(
        or(
          ilike(products.name, term),
          ilike(products.shortDescription, term),
          ilike(products.material, term),
        ),
      );
    }
    if (typeof filters.min === "number") conditions.push(gte(products.price, filters.min));
    if (typeof filters.max === "number") conditions.push(lte(products.price, filters.max));

    const orderBy = (() => {
      switch (filters.sort) {
        case "price-asc": return asc(products.price);
        case "price-desc": return desc(products.price);
        case "rating": return desc(products.rating);
        case "newest": return desc(products.id);
        default: return desc(products.reviewCount);
      }
    })();

    const query = db.select().from(products);
    if (conditions.length > 0) return await query.where(and(...conditions)).orderBy(orderBy);
    return await query.orderBy(orderBy);
  } catch {
    return applyMemoryFilters(filters);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!db) return getMemoryProducts().find((p) => p.slug === slug) ?? null;
  try {
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch {
    return getMemoryProducts().find((p) => p.slug === slug) ?? null;
  }
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  if (!db) return getMemoryProducts().filter((p) => slugs.includes(p.slug));
  try {
    return await db.select().from(products).where(inArray(products.slug, slugs));
  } catch {
    return getMemoryProducts().filter((p) => slugs.includes(p.slug));
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const cats = productCategories(product);
  if (!db) {
    return getMemoryProducts()
      .filter((p) => p.slug !== product.slug && productCategories(p).some((c) => cats.includes(c)))
      .slice(0, limit);
  }
  try {
    const categoryMatch =
      cats.length === 1
        ? matchesCategory(cats[0])
        : or(...cats.map((slug) => matchesCategory(slug)));

    return await db
      .select()
      .from(products)
      .where(and(categoryMatch, sql`${products.slug} <> ${product.slug}`))
      .limit(limit);
  } catch {
    return getMemoryProducts()
      .filter((p) => p.slug !== product.slug && productCategories(p).some((c) => cats.includes(c)))
      .slice(0, limit);
  }
}

export async function getReviews(slug: string): Promise<Review[]> {
  if (!db) return [];
  try {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.productSlug, slug))
      .orderBy(desc(reviews.createdAt));
  } catch {
    return [];
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  if (!db) return getMemoryProducts().map((p) => p.slug);
  try {
    const rows = await db.select({ slug: products.slug }).from(products);
    return rows.map((row) => row.slug);
  } catch {
    return getMemoryProducts().map((p) => p.slug);
  }
}
