export const CATEGORY_OPTIONS = [
  { slug: "earrings", name: "Earrings" },
  { slug: "cuffs", name: "Cuffs" },
  { slug: "rings", name: "Rings" },
  { slug: "bracelets", name: "Bracelets" },
  { slug: "necklaces", name: "Necklaces" },
  { slug: "watches", name: "Watches" },
  { slug: "hand-chains", name: "Hand Chains" },
  { slug: "premium", name: "Premium" },
  { slug: "sets", name: "Gift Sets" },
] as const;

export type CategorySlug = (typeof CATEGORY_OPTIONS)[number]["slug"];

export function productCategories(product: {
  categorySlug: string;
  categorySlugs?: string[] | null;
}): string[] {
  const extras = Array.isArray(product.categorySlugs)
    ? product.categorySlugs
    : [];
  return [...new Set([product.categorySlug, ...extras].filter(Boolean))];
}

export function categoryLabel(slug: string): string {
  if (
    slug === "hand-chains" ||
    slug === "handchains" ||
    slug === "wrist-bands" ||
    slug === "wristbands" ||
    slug === "wristband"
  ) {
    return "Hand Chains";
  }
  return CATEGORY_OPTIONS.find((c) => c.slug === slug)?.name ?? slug;
}
