import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="font-serif text-xl font-bold tracking-tight text-ink">
        Scorpio <span className="text-ink-soft">Rising</span>
      </span>
    </Link>
  );
}
