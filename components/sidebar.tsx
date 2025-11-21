"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/referentials", label: "Referentials", icon: "📋" },
  { href: "/sales", label: "Sales", icon: "💰" },
  { href: "/purchases", label: "Purchases", icon: "📦" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
  { href: "/maritime", label: "Maritime", icon: "⛵" },
  { href: "/employees", label: "Employees", icon: "👥" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold">NexaGestion</h1>
      </div>
      <nav className="space-y-2 px-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname.startsWith(item.href) ? "default" : "ghost"}
              className="w-full justify-start"
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

