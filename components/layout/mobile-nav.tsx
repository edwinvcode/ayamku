"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Egg, Bird, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/eggs", label: "Telur", icon: Egg },
  { href: "/chickens", label: "Ayam", icon: Bird },
  { href: "/finances", label: "Keuangan", icon: DollarSign },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
