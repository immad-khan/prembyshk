import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Testimonials } from "@/components/testimonials";
import { ArrowRight, PROMISE_ICONS } from "@/components/icons";
import { COLLECTION_BANNERS, JOURNAL, PROMISES } from "@/lib/content";
import { getBestSellers, getCategories, getNewArrivals } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, bestSellers, newArrivals] = await Promise.all([
    getCategories(),
    getBestSellers(6),
    getNewArrivals(4),
  ]);

  return (
    <>
      {/* HERO — fully responsive layout with photo behind text */}
      <section className="relative isolate overflow-hidden bg-cream-deep">
        <div className="absolute inset-0 -z-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero.jpg"
            alt="Model wearing Prem by SHK gold jewellery"
            className="h-full w-full object-cover object-[78%_25%] sm:object-[70%_center] lg:object-center"
          />
        </div>

        {/* Soft responsive scrim: keeps text perfectly readable while displaying the photo */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-cream/95 via-cream/80 to-transparent sm:from-cream-deep/90 sm:via-cream/60 lg:from-cream-deep/85 lg:via-cream/45" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-cream/90 via-cream/20 to-transparent sm:hidden" />

        <div className="mx-auto flex min-h-[500px] w-full max-w-7xl items-center px-4 py-12 sm:min-h-[580px] sm:px-6 sm:py-16 md:min-h-[620px] lg:min-h-[680px] lg:px-8">
          <div className="animate-fade-up max-w-full sm:max-w-xl">
            <p className="eyebrow flex items-center gap-3 text-xs sm:text-sm">
              <span className="hairline inline-block w-8 sm:w-10" />
              The Art of Adornment
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-[1.04] font-light text-ink sm:text-5xl md:text-6xl lg:text-[5.2rem]">
              Timeless
              <span className="mt-1 block font-script text-5xl leading-none rose-gradient-text sm:text-6xl md:text-7xl lg:text-[5.8rem]">
                Brilliance
              </span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:mt-6 sm:text-[0.95rem]">
              Exquisite designs, masterfully crafted for life&rsquo;s most meaningful
              moments — hand-finished in warm gold, mother-of-pearl and
              hand-poured enamel.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:mt-8">
              <Link
                href="/shop"
                className="group flex items-center gap-3 rounded-sm bg-gradient-to-r from-rose-deep to-rose px-6 py-3.5 text-[0.64rem] tracking-[0.2em] uppercase text-cream shadow-sm transition hover:from-rose hover:to-rose-deep sm:px-7 sm:py-4 sm:text-[0.68rem] sm:tracking-[0.24em]"
              >
                Discover Signature Pieces
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/shop?category=sets"
                className="border-b border-rose pb-1 text-[0.64rem] tracking-[0.2em] uppercase text-rose-deep transition hover:border-ink hover:text-ink sm:text-[0.68rem]"
              >
                Shop Gift Sets
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.62rem] tracking-[0.16em] uppercase text-muted sm:mt-10 sm:gap-x-8 sm:text-[0.68rem] sm:tracking-[0.18em]">
              <span>Hypoallergenic</span>
              <span>Tarnish Resistant</span>
              <span>Gift Boxed</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/shop?category=${category.slug}`}
              className="group flex flex-col items-center rounded-sm border border-line/70 bg-blush-soft/50 p-4 transition hover:border-rose-light hover:bg-blush-soft"
            >
              <div className="h-24 w-24 overflow-hidden rounded-full border border-line bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <p className="mt-4 text-[0.68rem] tracking-[0.22em] uppercase text-ink">
                {category.name}
              </p>
              <span className="mt-1 text-rose-light transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* COLLECTION BANNERS */}
      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTION_BANNERS.map((banner) => (
            <Link
              key={banner.title}
              href={banner.href}
              className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-sm p-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
              <div className="relative">
                <h3 className="font-serif text-2xl text-cream">{banner.title}</h3>
              </div>
              <div className="relative">
                <p className="max-w-[85%] text-xs leading-relaxed text-cream/85">
                  {banner.body}
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-[0.62rem] tracking-[0.24em] uppercase text-cream">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Our Signature Selection</p>
            <h2 className="mt-2 font-serif text-4xl font-light text-ink">
              Loved Most
            </h2>
            <span className="hairline mt-3 block w-16" />
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-2 text-[0.66rem] tracking-[0.22em] uppercase text-rose-deep"
          >
            View all best sellers
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
          {bestSellers.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 3} />
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="bg-cream-deep">
        <div className="mx-auto grid max-w-7xl items-stretch gap-0 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-4 py-14 lg:px-12">
            <p className="eyebrow">Crafted to be Cherished</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight font-light text-ink">
              The Beauty Behind
              <span className="block italic">Every Detail</span>
            </h2>
            <span className="hairline mt-4 block w-16" />
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-soft">
              At Prem by SHK, every creation begins with a feeling. Our artisans
              shape, plate and hand-finish each piece in small batches — setting
              natural mother-of-pearl, pouring enamel by hand and polishing warm
              gold until it glows. The result is jewellery that feels precious
              yet lives easily with you, every single day.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { title: "Ethically Sourced", body: "Materials you can trust" },
                { title: "Handcrafted", body: "By master artisans" },
                { title: "Heirloom Quality", body: "Built to be kept" },
              ].map((item) => (
                <div key={item.title}>
                  <span className="block h-px w-8 bg-rose-light" />
                  <p className="mt-3 text-sm text-ink">{item.title}</p>
                  <p className="mt-1 text-xs text-muted">{item.body}</p>
                </div>
              ))}
            </div>
            <Link
              href="/about"
              className="mt-9 inline-flex w-fit items-center gap-3 border-b border-rose pb-1 text-[0.66rem] tracking-[0.24em] uppercase text-rose-deep transition hover:gap-5"
            >
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/8105129/pexels-photo-8105129.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900"
              alt="Artisan hand-finishing a gold ring"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* PROMISES */}
      <section className="border-y border-line bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-3 lg:grid-cols-5 lg:px-8">
          {PROMISES.map((promise) => {
            const Icon = PROMISE_ICONS[promise.icon];
            return (
              <div key={promise.title} className="flex flex-col items-center text-center">
                <Icon className="h-7 w-7 text-rose" />
                <p className="mt-3 text-sm text-ink">{promise.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {promise.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Just Landed</p>
            <h2 className="mt-2 font-serif text-4xl font-light text-ink">
              New This Season
            </h2>
            <span className="hairline mt-3 block w-16" />
          </div>
          <Link
            href="/shop?sort=newest"
            className="group flex items-center gap-2 text-[0.66rem] tracking-[0.22em] uppercase text-rose-deep"
          >
            View all new in
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-blush-soft/70">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="text-center">
            <p className="eyebrow">Kind Words</p>
            <h2 className="mt-2 font-serif text-4xl font-light text-ink">
              Treasured by Our Clients
            </h2>
            <span className="hairline mx-auto mt-3 block w-16" />
          </div>
          <div className="mt-10">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The Journal</p>
            <h2 className="mt-2 font-serif text-4xl font-light text-ink">
              Inspiration &amp; Stories
            </h2>
            <span className="hairline mt-3 block w-16" />
          </div>
          <Link
            href="/about"
            className="group flex items-center gap-2 text-[0.66rem] tracking-[0.22em] uppercase text-rose-deep"
          >
            View all articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNAL.map((post) => (
            <article key={post.slug} className="group">
              <div className="aspect-[4/3] overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-[0.62rem] tracking-[0.2em] uppercase text-muted">
                {post.date}
              </p>
              <h3 className="mt-1 font-serif text-xl text-ink transition group-hover:text-rose-deep">
                {post.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
