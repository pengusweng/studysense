import Link from "next/link";

export function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ marginRight: "var(--proposal-space-3)", color: "var(--ink)" }}>
      {label}
    </Link>
  );
}
