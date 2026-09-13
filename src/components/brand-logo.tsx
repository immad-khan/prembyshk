import Link from "next/link";

export function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const scale = {
    sm: { script: "text-2xl sm:text-3xl", sub: "text-[0.52rem] sm:text-[0.58rem]", tracking: "tracking-[0.38em]" },
    md: { script: "text-3xl sm:text-4xl lg:text-[2.75rem]", sub: "text-[0.6rem] sm:text-[0.66rem]", tracking: "tracking-[0.42em]" },
    lg: { script: "text-5xl sm:text-6xl", sub: "text-[0.72rem] sm:text-[0.78rem]", tracking: "tracking-[0.45em]" },
  }[size];

  return (
    <Link
      href="/"
      className={`group inline-flex flex-col items-center select-none ${className}`}
    >
      <span className="flex flex-col items-center transition-transform duration-300 group-hover:scale-[1.02]">
        <span
          className={`font-script leading-none rose-gradient-text drop-shadow-sm ${scale.script}`}
        >
          Prem
        </span>
        <span
          className={`mt-0.5 font-sans font-light uppercase text-rose-deep/90 ${scale.tracking} ${scale.sub}`}
        >
          BY SHK
        </span>
      </span>
    </Link>
  );
}
