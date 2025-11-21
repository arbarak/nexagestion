"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InventoryPage() {
  const modules = [
    {
      title: "Stock Management",
      description: "Manage product inventory and stock levels",
      icon: "📦",
      href: "/inventory/stock",
    },
    {
      title: "Stock Movements",
      description: "Track stock in, out, and adjustments",
      icon: "🔄",
      href: "/inventory/movements",
    },
    {
      title: "Inventory Reports",
      description: "View inventory analytics and reports",
      icon: "📊",
      href: "/inventory/reports",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Inventory Module</h1>
        <p className="text-gray-600">
          Manage your inventory including stock levels, movements, and reporting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.href} className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{module.icon}</div>
            <h2 className="text-xl font-bold mb-2">{module.title}</h2>
            <p className="text-gray-600 mb-4">{module.description}</p>
            <Link href={module.href}>
              <Button className="w-full">Manage</Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-blue-50">
        <h3 className="font-bold mb-2">💡 Tip</h3>
        <p className="text-sm text-gray-700">
          Track all stock movements to maintain accurate inventory levels. Use stock
          adjustments to correct discrepancies and maintain data integrity.
        </p>
      </Card>
    </div>
  );
}

