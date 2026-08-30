import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ensureSeeded } from "@/lib/queries";
import { addMemoryProduct, getMemoryProducts } from "@/lib/memory-store";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function normalizeCategories(input: {
  categorySlug?: string;
  categorySlugs?: string[];
}): { categorySlug: string; categorySlugs: string[] } | null {
  const slugs = [
    ...new Set(
      [...(input.categorySlugs ?? []), input.categorySlug ?? ""]
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  if (slugs.length === 0) return null;
  return { categorySlug: slugs[0], categorySlugs: slugs };
}

type ProductPayload = {
  slug: string;
  name: string;
  categorySlug?: string;
  categorySlugs?: string[];
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string;
  description?: string;
  material?: string;
  images?: string[];
  colors?: string[];
  details?: string[];
  rating?: number;
  reviewCount?: number;
  stock?: number;
  badge?: string | null;
  isNew?: boolean;
  isBestSeller?: boolean;
};

function sanitizePayload(body: ProductPayload) {
  const cats = normalizeCategories(body);
  if (!cats) return null;
  return {
    slug: body.slug.trim(),
    name: body.name.trim(),
    categorySlug: cats.categorySlug,
    categorySlugs: cats.categorySlugs,
    price: Math.max(0, Math.round(Number(body.price) || 0)),
    compareAtPrice: body.compareAtPrice
      ? Math.max(0, Math.round(Number(body.compareAtPrice) || 0))
      : null,
    shortDescription: body.shortDescription ?? "",
    description: body.description ?? "",
    material: body.material ?? "",
    images: body.images ?? [],
    colors: body.colors ?? [],
    details: body.details ?? [],
    rating: Math.max(0, Math.min(50, Math.round(Number(body.rating) || 50))),
    reviewCount: Math.max(0, Math.round(Number(body.reviewCount) || 0)),
    stock: Math.max(0, Math.round(Number(body.stock) || 0)),
    badge: body.badge || null,
    isNew: body.isNew ?? false,
    isBestSeller: body.isBestSeller ?? false,
  };
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();
  try {
    await ensureSeeded();
    const all = await db.select().from(products);
    return NextResponse.json({ products: all });
  } catch {
    return NextResponse.json({ products: getMemoryProducts() });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();
  try {
    const body = (await request.json()) as ProductPayload;
    const clean = sanitizePayload(body);
    if (!clean || !clean.name || !clean.slug || clean.price <= 0) {
      return NextResponse.json(
        { error: "Name, slug, at least one category and price are required." },
        { status: 400 },
      );
    }

    try {
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.slug, clean.slug));

      if (existing.length > 0) {
        return NextResponse.json(
          { error: "A product with this slug already exists." },
          { status: 409 },
        );
      }

      const result = await db.insert(products).values(clean).returning();
      addMemoryProduct(result[0]);
      return NextResponse.json({ product: result[0] });
    } catch {
      const existingMemory = getMemoryProducts().find((p) => p.slug === clean.slug);
      if (existingMemory) {
        return NextResponse.json(
          { error: "A product with this slug already exists." },
          { status: 409 },
        );
      }
      const created = addMemoryProduct({ ...clean, stock: clean.stock ?? 24, createdAt: new Date() });
      return NextResponse.json({ product: created });
    }
  } catch (error) {
    console.error("admin product create error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
