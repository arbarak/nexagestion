"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MaritimePage() {
  const modules = [
    {
      title: "Vessel Management",
      description: "Manage your fleet of vessels",
      icon: "⛴️",
      href: "/maritime/vessels",
    },
    {
      title: "Voyages",
      description: "Track and manage vessel voyages",
      icon: "🗺️",
      href: "/maritime/voyages",
    },
    {
      title: "Cargo Tracking",
      description: "Monitor cargo shipments and deliveries",
      icon: "📦",
      href: "/maritime/cargo",
    },
    {
      title: "Maritime Reports",
      description: "View maritime operations analytics",
      icon: "📊",
      href: "/maritime/reports",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Maritime Operations</h1>
        <p className="text-gray-600">
          Manage your maritime fleet, voyages, and cargo operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          Track your vessels across multiple voyages and monitor cargo status in real-time.
          Maintain compliance with maritime regulations and optimize your shipping operations.
        </p>
      </Card>
    </div>
  );
}

