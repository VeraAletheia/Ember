"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export function NavLink({
  href,
  label,
  icon: Icon,
  variant = "sidebar",
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className={`flex flex-col items-center gap-1 transition-colors ${
          isActive
            ? "text-ember-amber"
            : "text-ember-text-muted hover:text-ember-amber"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        isActive
          ? "bg-ember-amber/10 text-ember-amber"
          : "text-ember-text-secondary hover:bg-ember-surface-hover hover:text-ember-text"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
