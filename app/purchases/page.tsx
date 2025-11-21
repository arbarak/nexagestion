"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PurchasesPage() {
  const modules = [
    {
      title: "Purchase Orders",
      description: "Create and manage supplier purchase orders",
      icon: "📋",
      href: "/purchases/orders",
    },
    {
      title: "Purchase Invoices",
      description: "Track and manage purchase invoices",
      icon: "📄",
      href: "/purchases/invoices",
    },
    {
      title: "Purchase Reports",
      description: "View purchase analytics and reports",
      icon: "📊",
      href: "/purchases/reports",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Purchases Module</h1>
        <p className="text-gray-600">
          Manage your purchase operations including orders, invoices, and reporting
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
          Purchase orders are converted to invoices for payment. Track order status and
          payment status to manage your procurement pipeline effectively.
        </p>
      </Card>
    </div>
  );
}

