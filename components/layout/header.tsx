"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Egg,
  Bird,
  DollarSign,
  Syringe,
  Brush,
  Tag,
  LogOut,
  Receipt,
  ShoppingCart,
  ChevronDown,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/eggs": "Manajemen Telur",
  "/chickens": "Ayam (Lifecycle)",
  "/finances": "Keuangan",
  "/finances/expenses": "Pengeluaran",
  "/finances/sales": "Penjualan",
  "/vaccinations": "Vaksinasi & Kesehatan",
  "/cleaning": "Jadwal Kandang",
  "/reports": "Laporan",
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/eggs", label: "Manajemen Telur", icon: Egg },
  { href: "/chickens", label: "Ayam (Lifecycle)", icon: Bird },
  {
    href: "/finances",
    label: "Keuangan",
    icon: DollarSign,
    children: [
      { href: "/finances/expenses", label: "Pengeluaran", icon: Receipt },
      { href: "/finances/sales", label: "Penjualan", icon: ShoppingCart },
    ],
  },
  { href: "/categories", label: "Kategori", icon: Tag },
  { href: "/vaccinations", label: "Vaksinasi", icon: Syringe },
  { href: "/cleaning", label: "Jadwal Kandang", icon: Brush },
];

export function Header({ role }: { role?: string | null }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Ayamku";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allNavItems = [
    ...navItems,
    ...(role === "superadmin" ? [{ href: "/admin/users", label: "Pengguna", icon: Users }] : []),
  ];

  return (
    <>
      <header className="bg-card border-b px-4 lg:px-6 py-4 flex items-center gap-4">
        <button
          className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-xl">🐔</span>
          <span className="font-bold">Ayamku</span>
        </div>
        <h1 className="hidden lg:block text-xl font-semibold">{title}</h1>
      </header>

      {/* Mobile drawer - always mounted so transitions work */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
              drawerOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <aside className={cn(
            "absolute left-0 top-0 h-full w-64 bg-card border-r flex flex-col shadow-2xl transition-transform duration-300 ease-in-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🐔</span>
                <div>
                  <div className="font-bold text-lg leading-tight">Ayamku</div>
                  <div className="text-xs text-muted-foreground">Farm Management</div>
                </div>
              </div>
              <button
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                if (item.children) {
                  return (
                    <div key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                          isActive ? "text-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isActive && "rotate-180")} />
                      </Link>
                      <div className={cn("overflow-hidden transition-all duration-200", isActive ? "max-h-40 opacity-100 mt-0.5 mb-1" : "max-h-0 opacity-0")}>
                        <div className="ml-3 pl-4 border-l border-border/50 space-y-0.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href || pathname.startsWith(child.href + "/");
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setDrawerOpen(false)}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                                  isChildActive
                                    ? "bg-foreground/10 text-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-foreground/10 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 py-4 border-t">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </form>
            </div>
          </aside>
      </div>
    </>
  );
}
