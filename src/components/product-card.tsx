"use client";

import Link from "next/link";
import type { Product } from "@/db/schema";
import { useCart } from "@/components/cart-provider";
import { HeartIcon } from "@/components/icons";
import { Stars } from "@/components/stars";
import { WhatsAppMark } from "@/components/whatsapp-mark";
import { formatPrice } from "@/lib/format";
import { defaultProductMessage, whatsappLink } from "@/lib/whatsapp";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { toggleWishlist, isWishlisted } = useCart();
  const image = product.images[0] ?? "/images/p-hoops.jpg";
  const hover = product.images[1] ?? image;
  const wished = isWishlisted(product.slug);

  const message = defaultProductMessage(product.name, product.slug);

  return (
    <article className="group relative flex flex-col">
      <div className="relative overflow-hidden rounded-sm bg-blush-soft">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hover}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
            />
          </div>
        </Link>

        {(product.badge || product.compareAtPrice) && (
          <span className="absolute top-3 left-3 rounded-sm bg-cream/90 px-2.5 py-1 text-[0.58rem] tracking-[0.2em] uppercase text-rose-deep">
            {product.badge ??
              `Save ${Math.round(
                (1 - product.price / (product.compareAtPrice ?? product.price)) *
                  100,
              )}%`}
          </span>
        )}

        <button
          aria-label="Add to wishlist"
          onClick={() => toggleWishlist(product.slug)}
          className={`absolute top-3 right-3 rounded-full bg-cream/90 p-2 transition hover:bg-cream ${
            wished ? "text-rose-deep" : "text-ink-soft"
          }`}
        >
          <HeartIcon className="h-4 w-4" filled={wished} />
        </button>

        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat on WhatsApp about ${product.name}`}
          className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-rose-deep to-rose text-cream shadow-sm transition-all duration-300 hover:scale-105 sm:h-auto sm:w-auto sm:translate-y-3 sm:gap-2 sm:px-3 sm:py-2 sm:text-[0.6rem] sm:tracking-[0.14em] sm:uppercase sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <WhatsAppMark className="h-4 w-4" />
          <span className="hidden sm:inline">Chat on WhatsApp</span>
        </a>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <Link
          href={`/product/${product.slug}`}
          className="font-serif text-[1.05rem] leading-snug text-ink transition hover:text-rose-deep"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-ink">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Stars rating={product.rating} className="text-gold" />
          <span className="text-[0.68rem] text-muted">
            ({product.reviewCount})
          </span>
        </div>
      </div>
    </article>
  );
}
