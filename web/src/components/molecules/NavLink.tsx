import Link from "next/link";

export function NavLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} style={{ marginRight: 16 }}>{label}</Link>;
}
