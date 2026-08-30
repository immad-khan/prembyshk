import { NextResponse } from "next/server";
import { getProducts, getProductsBySlugs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slugs = searchParams.get("slugs");

  if (slugs !== null) {
    const list = slugs.split(",").map((s) => s.trim()).filter(Boolean);
    const products = await getProductsBySlugs(list);
    return NextResponse.json({ products });
  }

  const products = await getProducts({
    category: searchParams.get("category") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });
  return NextResponse.json({ products });
}
