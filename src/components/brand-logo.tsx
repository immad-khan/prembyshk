import Link from "next/link";

export function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const scale = {
    sm: { script: "text-3xl sm:text-4xl", sub: "text-[0.58rem] sm:text-[0.64rem]", pad: "px-4 py-1.5" },
    md: { script: "text-4xl sm:text-5xl", sub: "text-[0.66rem] sm:text-[0.72rem]", pad: "px-5 py-2" },
    lg: { script: "text-6xl sm:text-7xl", sub: "text-[0.78rem] sm:text-[0.85rem]", pad: "px-7 py-2.5" },
  }[size];

  return (
    <Link href="/" className={`group inline-flex flex-col items-center ${className}`}>
      <span className={`relative inline-flex flex-col items-center ${scale.pad}`}>
        <span className="pointer-events-none absolute inset-0 -z-10 gold-frame rounded-[2px]" />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-1 inset-y-0 -z-20 rounded-full bg-blush/70 blur-[6px] transition-all duration-500 group-hover:bg-blush"
        />
        <span
          className={`font-script leading-[0.95] rose-gradient-text ${scale.script}`}
        >
          Prem
        </span>
        <span
          className={`font-sans font-light tracking-[0.42em] text-rose-deep ${scale.sub}`}
        >
          BY SHK
        </span>
      </span>
    </Link>
  );
}
