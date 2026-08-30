import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated(request))) return unauthorized();
  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = (await request.json()) as ProductPayload;
    const clean = sanitizePayload(body);
    if (!clean || !clean.name || !clean.slug || clean.price <= 0) {
      return NextResponse.json(
        { error: "Name, slug, category and price are required." },
        { status: 400 },
      );
    }

    const result = await db
      .update(products)
      .set(clean)
      .where(eq(products.id, idNum))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ product: result[0] });
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
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await db.delete(products).where(eq(products.id, idNum));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
