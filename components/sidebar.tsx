"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const defaultMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/referentials", label: "Referentials", icon: "📚" },
  { href: "/sales", label: "Sales", icon: "💰" },
  { href: "/purchases", label: "Purchases", icon: "🛒" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
  { href: "/maritime", label: "Maritime", icon: "🚢" },
  { href: "/employees", label: "Employees", icon: "👥" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

type SidebarItem = {
  href: string;
  label: string;
  icon?: string;
};

export function Sidebar({ items = defaultMenuItems }: { items?: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold">NexaGestion</h1>
      </div>
      <nav className="space-y-2 px-4">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname.startsWith(item.href) ? "default" : "ghost"}
              className="w-full justify-start"
            >
              {item.icon ? <span className="mr-2">{item.icon}</span> : null}
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
