import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews } from "@/db/schema";
import { seedDatabase } from "@/db/seed";
import type { Category, Product, Review } from "@/db/schema";
import { productCategories } from "@/lib/categories";

function matchesCategory(slug: string) {
  return or(
    eq(products.categorySlug, slug),
    sql`COALESCE(${products.categorySlugs}, '[]'::jsonb) @> ${JSON.stringify([slug])}::jsonb`,
  );
}

let seedPromise: Promise<unknown> | null = null;

export async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedDatabase().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

export async function getCategories(): Promise<Category[]> {
  await ensureSeeded();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getBestSellers(limit = 6): Promise<Product[]> {
  await ensureSeeded();
  return db
    .select()
    .from(products)
    .where(eq(products.isBestSeller, true))
    .orderBy(desc(products.reviewCount))
    .limit(limit);
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  await ensureSeeded();
  return db
    .select()
    .from(products)
    .where(eq(products.isNew, true))
    .orderBy(desc(products.id))
    .limit(limit);
}

export type ShopFilters = {
  category?: string;
  sort?: string;
  q?: string;
  max?: number;
  min?: number;
};

export async function getProducts(filters: ShopFilters = {}): Promise<Product[]> {
  await ensureSeeded();

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
  if (typeof filters.min === "number") {
    conditions.push(gte(products.price, filters.min));
  }
  if (typeof filters.max === "number") {
    conditions.push(lte(products.price, filters.max));
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case "price-asc":
        return asc(products.price);
      case "price-desc":
        return desc(products.price);
      case "rating":
        return desc(products.rating);
      case "newest":
        return desc(products.id);
      default:
        return desc(products.reviewCount);
    }
  })();

  const query = db.select().from(products);
  if (conditions.length > 0) {
    return query.where(and(...conditions)).orderBy(orderBy);
  }
  return query.orderBy(orderBy);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  await ensureSeeded();
  return db.select().from(products).where(inArray(products.slug, slugs));
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  await ensureSeeded();
  const cats = productCategories(product);
  const categoryMatch =
    cats.length === 1
      ? matchesCategory(cats[0])
      : or(...cats.map((slug) => matchesCategory(slug)));

  return db
    .select()
    .from(products)
    .where(and(categoryMatch, sql`${products.slug} <> ${product.slug}`))
    .limit(limit);
}

export async function getReviews(slug: string): Promise<Review[]> {
  await ensureSeeded();
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productSlug, slug))
    .orderBy(desc(reviews.createdAt));
}

export async function getAllProductSlugs(): Promise<string[]> {
  await ensureSeeded();
  const rows = await db.select({ slug: products.slug }).from(products);
  return rows.map((row) => row.slug);
}
