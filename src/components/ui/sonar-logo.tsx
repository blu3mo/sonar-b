import Link from "next/link";

export function SonarLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-block text-[var(--foreground)] no-underline ${className}`}
    >
      <span
        className="inline-block font-black italic tracking-tighter text-lg leading-none"
        style={{ transform: "skewX(-6deg)" }}
      >
        倍速アンケート
      </span>
    </Link>
  );
}
