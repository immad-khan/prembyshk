import Link from "next/link";

export function AdminLink() {
  return (
    <Link
      href="/admin"
      aria-label="Studio"
      title="Studio"
      className="group relative flex h-5 w-5 items-center justify-center rounded-full border border-transparent transition hover:border-rose/40"
    >
      <span className="block h-1 w-1 rounded-full bg-rose/30 transition-all duration-300 group-hover:h-1.5 group-hover:w-1.5 group-hover:bg-rose" />
    </Link>
  );
}
