import { sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, reviews } from "@/db/schema";

const P = {
  tulip: "/images/p-tulip.jpg",
  shell: "/images/p-pearlshell.jpg",
  hoops: "/images/p-hoops.jpg",
  bangles: "/images/p-bangles.jpg",
  rings: "/images/p-rings.jpg",
  pearlset: "/images/p-pearlset.jpg",
  onyx: "/images/p-onyx.jpg",
  gift: "/images/banner-gift.jpg",
  atelier: "/images/atelier.jpg",
  hero: "/images/hero.jpg",
};

const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900`;

const S = {
  earringsDisplay: px(19869443),
  earringsRibbon: px(16055228),
  starEarring: px(10581780),
  goldHoops: px(16038189),
  hoopStar: px(34372559),
  necklacesPink: px(9173459),
  pendantsPearl: px(23495720),
  pearlStand: px(8100401),
  womanPendant: px(6153885),
  seaNecklace: px(38909351),
  trayFlat: px(4155246),
  handBracelets: px(10828766),
  handRings: px(18092913),
  goldPlate: px(8105129),
  goldMarble: px(19895297),
  womanEarrings: px(27902413),
  womanBraceletsRings: px(16918130),
  handsPink: px(8183922),
};

export const CATEGORY_SEED = [
  {
    slug: "earrings",
    name: "Earrings",
    tagline: "Studs, drops & statement hoops",
    imageUrl: P.hoops,
    sortOrder: 1,
  },
  {
    slug: "rings",
    name: "Rings",
    tagline: "Stackable & sculptural",
    imageUrl: P.rings,
    sortOrder: 2,
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    tagline: "Cuffs, bangles & wire stacks",
    imageUrl: P.bangles,
    sortOrder: 3,
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    tagline: "Pendants & layering chains",
    imageUrl: S.necklacesPink,
    sortOrder: 4,
  },
  {
    slug: "sets",
    name: "Gift Sets",
    tagline: "Perfectly paired, beautifully boxed",
    imageUrl: P.pearlset,
    sortOrder: 5,
  },
];

type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  categorySlugs?: string[];
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  material: string;
  images: string[];
  colors: string[];
  details: string[];
  rating: number;
  reviewCount: number;
  badge?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
};

export const PRODUCT_SEED: SeedProduct[] = [
  {
    slug: "amara-tulip-drop-earrings",
    name: "Amara Tulip Drop Earrings",
    categorySlug: "earrings",
    price: 3450,
    compareAtPrice: 4200,
    shortDescription: "Hand-enamelled tulip buds on a twisted gold stem.",
    description:
      "A quiet bloom for everyday elegance. The Amara drops pair a softly twisted gold-plated stem with a hand-enamelled tulip bud, catching the light with every turn of the head. Feather-light on the ear and endlessly wearable.",
    material: "18K gold plated brass, hand-enamelled bud",
    images: [P.tulip, S.earringsRibbon, S.womanEarrings],
    colors: ["Ivory Gold", "Noir Gold", "Ivory Silver"],
    details: [
      "Length 4.2 cm, weight 3.1 g per earring",
      "Hypoallergenic 925 silver posts",
      "Tarnish-resistant PVD finish",
      "Arrives in a signature blush gift box",
    ],
    rating: 49,
    reviewCount: 128,
    badge: "Bestseller",
    isBestSeller: true,
  },
  {
    slug: "noir-tulip-drop-earrings",
    name: "Noir Tulip Drop Earrings",
    categorySlug: "earrings",
    price: 3450,
    shortDescription: "Glossy black bud, warm gold stem — quiet drama.",
    description:
      "The Noir edition of our signature tulip drop. Deep obsidian enamel meets warm gold for an evening-ready silhouette that still feels effortless with denim.",
    material: "18K gold plated brass, black enamel bud",
    images: [P.tulip, P.onyx, S.earringsDisplay],
    colors: ["Noir Gold", "Ivory Gold"],
    details: [
      "Length 4.2 cm",
      "Hypoallergenic 925 silver posts",
      "Water and sweat resistant finish",
      "Signature blush gift box included",
    ],
    rating: 48,
    reviewCount: 96,
    isBestSeller: true,
  },
  {
    slug: "seraphine-shell-heart-earrings",
    name: "Seraphine Shell Heart Earrings",
    categorySlug: "earrings",
    price: 2950,
    compareAtPrice: 3600,
    shortDescription: "Mother-of-pearl hearts framed in polished gold.",
    description:
      "Iridescent mother-of-pearl hearts, each one unique in its shimmer, set into a slim gold frame. Romantic without ever feeling loud.",
    material: "Gold plated brass with natural mother-of-pearl",
    images: [P.shell, S.starEarring, S.earringsDisplay],
    colors: ["Pearl Gold"],
    details: [
      "Drop length 5 cm",
      "Natural shell — each piece varies slightly",
      "Lightweight at 4 g per earring",
      "Nickel and lead free",
    ],
    rating: 49,
    reviewCount: 74,
    isBestSeller: true,
    isNew: true,
  },
  {
    slug: "luna-pearl-drop-studs",
    name: "Luna Pearl Drop Studs",
    categorySlug: "earrings",
    price: 3850,
    shortDescription: "Textured gold square with a luminous pearl drop.",
    description:
      "A modern heirloom. A hammered gold square holds a large shell pearl that swings gently as you move — the finishing touch for weddings, dinners and every celebration in between.",
    material: "Gold plated brass with 12 mm shell pearl",
    images: [P.hoops, S.pearlStand, S.pendantsPearl],
    colors: ["Pearl Gold"],
    details: [
      "Total length 3.8 cm",
      "12 mm premium shell pearl",
      "Secure butterfly backs included",
      "Polishing cloth included",
    ],
    rating: 50,
    reviewCount: 112,
    isBestSeller: true,
  },
  {
    slug: "croissant-gold-hoops",
    name: "Croissant Chunky Hoops",
    categorySlug: "earrings",
    price: 2650,
    shortDescription: "Sculpted, hollow-light chunky hoops in glossy gold.",
    description:
      "Our most-worn hoop. Generously scaled yet feather-light thanks to a hollow build, with a rippled croissant texture that keeps catching the light.",
    material: "18K gold plated stainless steel",
    images: [P.hoops, S.goldHoops, S.hoopStar],
    colors: ["Polished Gold", "Silver"],
    details: [
      "Diameter 3.5 cm",
      "Waterproof stainless steel core",
      "Will not tarnish or turn skin green",
      "Post and butterfly closure",
    ],
    rating: 48,
    reviewCount: 203,
    isBestSeller: true,
  },
  {
    slug: "magnolia-flower-danglers",
    name: "Magnolia Flower Danglers",
    categorySlug: "earrings",
    price: 3250,
    shortDescription: "Three cascading textured blooms in warm gold.",
    description:
      "Three hand-finished magnolia blossoms cascade in graduating sizes for a soft, romantic movement. A favourite for mehndi days and garden weddings.",
    material: "18K gold plated brass",
    images: [P.hoops, S.earringsDisplay, S.womanEarrings],
    colors: ["Polished Gold"],
    details: [
      "Drop length 7 cm",
      "Hand-textured petals",
      "Hypoallergenic posts",
      "Blush gift box included",
    ],
    rating: 47,
    reviewCount: 58,
    isNew: true,
  },
  {
    slug: "onyx-orchid-danglers",
    name: "Onyx Orchid Danglers",
    categorySlug: "earrings",
    price: 4150,
    shortDescription: "Black enamel orchids on a slender gold branch.",
    description:
      "Long, elegant and unapologetically striking. A slender gold branch blossoms into a glossy black orchid — our most photographed evening earring.",
    material: "Gold plated brass with black enamel",
    images: [P.onyx, P.tulip, S.earringsRibbon],
    colors: ["Noir Gold"],
    details: [
      "Drop length 9 cm",
      "Weight 5.4 g per earring",
      "High-gloss enamel finish",
      "Presented in a signature box",
    ],
    rating: 49,
    reviewCount: 41,
    badge: "New",
    isNew: true,
  },
  {
    slug: "bijou-shell-oval-drops",
    name: "Bijou Shell Oval Drops",
    categorySlug: "earrings",
    price: 2750,
    shortDescription: "Layered mother-of-pearl ovals with a gold rim.",
    description:
      "Soft ivory shell discs stacked in graduating ovals and rimmed in gold — the easiest way to lift a plain kurta or a linen shirt.",
    material: "Gold plated brass with mother-of-pearl",
    images: [P.shell, S.earringsDisplay, S.starEarring],
    colors: ["Pearl Gold"],
    details: [
      "Drop length 6 cm",
      "Natural shell inlay",
      "Lightweight everyday wear",
      "Nickel free",
    ],
    rating: 47,
    reviewCount: 66,
  },
  {
    slug: "aurelia-teardrop-studs",
    name: "Aurelia Teardrop Studs",
    categorySlug: "earrings",
    price: 2450,
    compareAtPrice: 2950,
    shortDescription: "The classic dome teardrop, polished to a mirror shine.",
    description:
      "A wardrobe essential. Smooth, weightless and mirror polished, the Aurelia teardrop flatters every face shape and never leaves the rotation.",
    material: "18K gold plated stainless steel",
    images: [P.hoops, S.goldHoops, S.trayFlat],
    colors: ["Polished Gold", "Silver"],
    details: [
      "Length 3.2 cm",
      "Waterproof and tarnish free",
      "Weightless hollow build",
      "Everyday wear approved",
    ],
    rating: 48,
    reviewCount: 187,
    isBestSeller: true,
  },
  {
    slug: "fleur-blossom-ring",
    name: "Fleur Blossom Ring",
    categorySlug: "rings",
    price: 2350,
    shortDescription: "A sculpted five-petal bloom with a crystal centre.",
    description:
      "A single gold blossom with a sparkling crystal heart, shaped to sit softly across the finger. Adjustable band for a perfect fit.",
    material: "18K gold plated stainless steel, cubic zirconia",
    images: [P.rings, S.handRings, S.goldMarble],
    colors: ["Polished Gold"],
    details: [
      "Adjustable — fits sizes 6 to 8",
      "Flower diameter 2 cm",
      "Waterproof, tarnish resistant",
      "Gift boxed",
    ],
    rating: 49,
    reviewCount: 89,
    isBestSeller: true,
  },
  {
    slug: "serpentine-wrap-ring",
    name: "Serpentine Wrap Ring",
    categorySlug: "rings",
    price: 2150,
    shortDescription: "A smooth gold serpent coiled twice around the finger.",
    description:
      "Sleek and a little bit daring. The Serpentine coils twice for a double-band look while remaining feather-light and comfortable all day.",
    material: "18K gold plated stainless steel",
    images: [P.rings, S.handRings, S.goldPlate],
    colors: ["Polished Gold"],
    details: [
      "Adjustable fit",
      "Polished high-shine finish",
      "Waterproof stainless steel",
      "Gift boxed",
    ],
    rating: 47,
    reviewCount: 52,
  },
  {
    slug: "mariposa-butterfly-ring",
    name: "Mariposa Butterfly Ring",
    categorySlug: "rings",
    price: 1950,
    shortDescription: "An open-winged butterfly on a fine gold band.",
    description:
      "Delicate, sweet and endlessly stackable. Wear it alone or layered with the Fleur and Helmet rings for a curated hand.",
    material: "18K gold plated stainless steel",
    images: [P.rings, S.goldMarble, S.handsPink],
    colors: ["Polished Gold"],
    details: [
      "Adjustable band",
      "Butterfly width 1.4 cm",
      "Tarnish resistant",
      "Perfect for stacking",
    ],
    rating: 46,
    reviewCount: 47,
    isNew: true,
  },
  {
    slug: "helmet-dome-ring",
    name: "Helmet Dome Ring",
    categorySlug: "rings",
    price: 2650,
    shortDescription: "A bold mirror-polished dome statement ring.",
    description:
      "Clean architecture in solid gold tone. The Helmet dome reads sculptural and modern — a single-piece statement that needs nothing else.",
    material: "18K gold plated stainless steel",
    images: [P.rings, S.goldPlate, S.handRings],
    colors: ["Polished Gold", "Silver"],
    details: [
      "Available sizes 6 to 9",
      "Mirror polished dome",
      "Waterproof finish",
      "Weight 6 g",
    ],
    rating: 48,
    reviewCount: 63,
    isBestSeller: true,
  },
  {
    slug: "aurora-wire-bangle-stack",
    name: "Aurora Wire Bangle Stack",
    categorySlug: "bracelets",
    price: 4650,
    compareAtPrice: 5500,
    shortDescription: "Sixty fine gold wires that move like liquid light.",
    description:
      "A cloud of ultra-fine gold wires that stack into one flexible cuff. Beautifully weightless, and impossible to stop playing with.",
    material: "Gold plated memory wire",
    images: [P.bangles, S.handBracelets, S.womanBraceletsRings],
    colors: ["Polished Gold", "Rose Gold"],
    details: [
      "One size, flexible memory wire",
      "Approx. 60 strands",
      "Optional crystal-set version",
      "Presented in a blush pouch",
    ],
    rating: 49,
    reviewCount: 118,
    isBestSeller: true,
  },
  {
    slug: "isla-dome-cuff",
    name: "Isla Dome Cuff",
    categorySlug: "bracelets",
    price: 3950,
    shortDescription: "A wide, softly domed cuff with a mirror finish.",
    description:
      "The cuff that finishes every outfit. Smooth, generous and gently open at the back so it slips on and stays put.",
    material: "18K gold plated brass",
    images: [P.bangles, S.handBracelets, S.trayFlat],
    colors: ["Polished Gold", "Silver"],
    details: [
      "Width 1.8 cm, adjustable opening",
      "Hollow build for light wear",
      "Tarnish resistant",
      "Gift boxed",
    ],
    rating: 48,
    reviewCount: 71,
  },
  {
    slug: "celeste-crystal-bangle",
    name: "Celeste Crystal Bangle",
    categorySlug: "bracelets",
    price: 4250,
    shortDescription: "Fine gold wires scattered with tiny crystals.",
    description:
      "Our Aurora stack, dusted with hand-set crystals that flicker as you move. Understated sparkle for daytime, quiet glamour by night.",
    material: "Gold plated memory wire with crystals",
    images: [P.bangles, S.womanBraceletsRings, S.goldMarble],
    colors: ["Polished Gold"],
    details: [
      "One size flexible fit",
      "Hand-set crystal accents",
      "Approx. 45 strands",
      "Blush pouch included",
    ],
    rating: 49,
    reviewCount: 54,
    isNew: true,
  },
  {
    slug: "mariposa-butterfly-chain",
    name: "Mariposa Butterfly Chain",
    categorySlug: "necklaces",
    price: 3250,
    shortDescription: "A shell butterfly on a fine paperclip chain.",
    description:
      "A mother-of-pearl butterfly rests on a slim paperclip chain — light enough to layer, pretty enough to wear alone.",
    material: "Gold plated stainless steel, mother-of-pearl",
    images: [S.pendantsPearl, S.necklacesPink, P.shell],
    colors: ["Pearl Gold"],
    details: [
      "Chain 42 cm + 5 cm extender",
      "Butterfly width 1.6 cm",
      "Waterproof stainless steel",
      "Lobster clasp",
    ],
    rating: 48,
    reviewCount: 83,
    isBestSeller: true,
  },
  {
    slug: "perla-blossom-pendant",
    name: "Perla Blossom Pendant",
    categorySlug: "necklaces",
    price: 3550,
    shortDescription: "An ivory enamel flower with a pearl centre.",
    description:
      "Five soft ivory petals rimmed in gold cradle a single pearl. A romantic pendant that feels bridal without being formal.",
    material: "Gold plated brass, enamel, shell pearl",
    images: [P.pearlset, S.womanPendant, S.pearlStand],
    colors: ["Ivory Gold"],
    details: [
      "Chain 45 cm adjustable",
      "Flower diameter 2.4 cm",
      "Hand-set pearl centre",
      "Gift boxed",
    ],
    rating: 50,
    reviewCount: 61,
    isNew: true,
  },
  {
    slug: "moonbeam-charm-necklace",
    name: "Moonbeam Charm Necklace",
    categorySlug: "necklaces",
    price: 3950,
    compareAtPrice: 4600,
    shortDescription: "A pavé crescent and pearl on a layered chain.",
    description:
      "A pavé-set crescent moon and a single pearl swing together on a fine double chain. The layered look, ready-made.",
    material: "Gold plated brass with cubic zirconia",
    images: [S.seaNecklace, S.necklacesPink, S.pendantsPearl],
    colors: ["Polished Gold"],
    details: [
      "Double chain 40 cm and 45 cm",
      "Pavé crescent charm",
      "Freshwater-look shell pearl",
      "Lobster clasp with extender",
    ],
    rating: 47,
    reviewCount: 39,
  },
  {
    slug: "perla-blossom-gift-set",
    name: "Perla Blossom Gift Set",
    categorySlug: "sets",
    categorySlugs: ["sets", "earrings", "necklaces"],
    price: 5950,
    compareAtPrice: 7100,
    shortDescription: "Matching blossom pendant and stud earrings, boxed.",
    description:
      "Our Perla Blossom pendant paired with matching studs, nestled in a blush keepsake box with a hand-tied rose gold ribbon. The gift that always lands.",
    material: "Gold plated brass, enamel, shell pearls",
    images: [P.pearlset, P.gift, S.pearlStand],
    colors: ["Ivory Gold"],
    details: [
      "Necklace 45 cm + matching studs",
      "Keepsake gift box and ribbon",
      "Complimentary handwritten note",
      "Save 16% versus buying separately",
    ],
    rating: 50,
    reviewCount: 47,
    badge: "Gift Ready",
    isBestSeller: true,
  },
  {
    slug: "noir-elegance-duo",
    name: "Noir Elegance Duo",
    categorySlug: "sets",
    categorySlugs: ["sets", "earrings"],
    price: 6450,
    shortDescription: "Onyx orchid earrings with the Noir tulip drops.",
    description:
      "Two evening favourites in one box — the Onyx Orchid danglers and the Noir Tulip drops, for the woman who owns every room she enters.",
    material: "Gold plated brass with black enamel",
    images: [P.onyx, P.tulip, P.gift],
    colors: ["Noir Gold"],
    details: [
      "Two pairs of statement earrings",
      "Keepsake gift box",
      "Complimentary polishing cloth",
      "Save 15% as a duo",
    ],
    rating: 49,
    reviewCount: 28,
    isNew: true,
  },
];

const REVIEW_SEED = [
  {
    productSlug: "amara-tulip-drop-earrings",
    author: "Isabella N.",
    rating: 5,
    title: "Simply unmatched",
    body: "The craftsmanship is beautiful. Even more delicate in person and the packaging felt like a luxury experience.",
  },
  {
    productSlug: "amara-tulip-drop-earrings",
    author: "Hira S.",
    rating: 5,
    title: "So light",
    body: "I wore these for twelve hours at a wedding and forgot I had them on. Everyone asked where they were from.",
  },
  {
    productSlug: "croissant-gold-hoops",
    author: "Ethan R.",
    rating: 5,
    title: "Perfect gift",
    body: "Bought these for my wife's anniversary and she was speechless. The gold has not faded at all after months.",
  },
  {
    productSlug: "luna-pearl-drop-studs",
    author: "Sophia L.",
    rating: 5,
    title: "Worth every rupee",
    body: "From the quality to the service, everything was perfect. Prem by SHK is now my go-to for every occasion.",
  },
  {
    productSlug: "aurora-wire-bangle-stack",
    author: "Mahnoor A.",
    rating: 5,
    title: "My daily stack",
    body: "It looks like a hundred bangles but weighs nothing. I have not taken it off since it arrived.",
  },
  {
    productSlug: "perla-blossom-gift-set",
    author: "Ayesha K.",
    rating: 5,
    title: "Beautifully boxed",
    body: "Gifted this to my sister and the presentation alone made her cry. The pearl detail is stunning.",
  },
];

export async function seedDatabase() {
  if (!db) return { seeded: false };
  const existing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products);

  if ((existing[0]?.count ?? 0) > 0) {
    return { seeded: false };
  }

  await db.insert(categories).values(CATEGORY_SEED).onConflictDoNothing();
  await db.insert(products).values(
    PRODUCT_SEED.map((p) => ({
      ...p,
      categorySlugs: p.categorySlugs ?? [p.categorySlug],
    })),
  ).onConflictDoNothing();
  await db.insert(reviews).values(REVIEW_SEED).onConflictDoNothing();

  return { seeded: true };
}
