import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteMemoryProduct, updateMemoryProduct } from "@/lib/memory-store";
import { ensureSeeded } from "@/lib/queries";

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

function sanitize(body: ProductPayload) {
  const cats = normalizeCategories(body);
  if (!cats) return null;
  return {
    slug: body.slug.trim(),
    name: body.name.trim(),
    categorySlug: cats.categorySlug,
    categorySlugs: cats.categorySlugs,
    price: Math.max(0, Math.round(Number(body.price) || 0)),
    compareAtPrice: body.compareAtPrice ? Math.max(0, Math.round(Number(body.compareAtPrice))) : null,
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    const isNumeric = !Number.isNaN(idNum);

    const body = (await request.json()) as ProductPayload;
    const clean = sanitize(body);
    if (!clean || !clean.name || !clean.slug || clean.price <= 0) {
      return NextResponse.json({ error: "Name, slug, category and price are required." }, { status: 400 });
    }

    if (db) {
      try {
        await ensureSeeded();
        const condition = isNumeric
          ? or(eq(products.id, idNum), eq(products.slug, id), eq(products.slug, clean.slug))
          : or(eq(products.slug, id), eq(products.slug, clean.slug));
        
        const result = await db.update(products).set(clean).where(condition).returning();
        if (result.length > 0) {
          updateMemoryProduct(isNumeric ? idNum : id, clean);
          return NextResponse.json({ product: result[0] });
        }

        // If not found in DB, insert/upsert new row
        const inserted = await db.insert(products).values(clean).returning();
        if (inserted.length > 0) {
          updateMemoryProduct(inserted[0].id, inserted[0]);
          return NextResponse.json({ product: inserted[0] });
        }
      } catch (err) {
        console.error("DB update error", err);
      }
    }

    const updated = updateMemoryProduct(isNumeric ? idNum : id, clean);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("admin product update error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    const isNumeric = !Number.isNaN(idNum);

    if (db) {
      try {
        await ensureSeeded();
        const condition = isNumeric
          ? or(eq(products.id, idNum), eq(products.slug, id))
          : eq(products.slug, id);
        await db.delete(products).where(condition);
      } catch {
        // fall through
      }
    }

    deleteMemoryProduct(isNumeric ? idNum : id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
