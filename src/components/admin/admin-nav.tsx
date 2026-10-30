"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", match: "exact" as const },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/training", label: "Training" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/reviews", label: "Reviews" },
];

function linkActive(pathname: string, href: string, match?: "exact") {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 text-sm font-semibold">
      {LINKS.map((item) => {
        const active = linkActive(pathname, item.href, item.match);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-foreground hover:bg-muted"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        View site
      </Link>
    </nav>
  );
}
