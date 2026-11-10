export const CATEGORY_OPTIONS = [
  { slug: "premium", name: "Premium" },
  { slug: "watches", name: "Watches" },
  { slug: "rings", name: "Rings" },
  { slug: "earrings", name: "Earrings" },
  { slug: "cuffs", name: "Cuffs" },
  { slug: "bracelets", name: "Bracelets" },
  { slug: "pendants", name: "Pendants" },
  { slug: "hand-chains", name: "Hand Chains" },
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
  if (
    slug === "pendants" ||
    slug === "pendant" ||
    slug === "necklaces" ||
    slug === "necklace"
  ) {
    return "Pendants";
  }
  return CATEGORY_OPTIONS.find((c) => c.slug === slug)?.name ?? slug;
}
