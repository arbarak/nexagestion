import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ReferentialsPage() {
  const referentials = [
    {
      title: "Clients",
      description: "Manage your clients and customer information",
      href: "/referentials/clients",
      icon: "👥",
    },
    {
      title: "Suppliers",
      description: "Manage your suppliers and vendor information",
      href: "/referentials/suppliers",
      icon: "🏭",
    },
    {
      title: "Products",
      description: "Manage your product catalog",
      href: "/referentials/products",
      icon: "📦",
    },
    {
      title: "Categories",
      description: "Manage product categories",
      href: "/referentials/categories",
      icon: "🏷️",
    },
    {
      title: "Brands",
      description: "Manage product brands",
      href: "/referentials/brands",
      icon: "🎯",
    },
    {
      title: "Tax Rates",
      description: "Manage tax rates (TVA, TSP)",
      href: "/referentials/tax-rates",
      icon: "💰",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Referentials Management</h1>
        <p className="text-gray-600">
          Manage all your business referential data in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referentials.map((ref) => (
          <Card key={ref.href} className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">{ref.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{ref.title}</h2>
            <p className="text-gray-600 mb-4">{ref.description}</p>
            <Link href={ref.href}>
              <Button className="w-full">Manage {ref.title}</Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">💡 Tip</h3>
        <p className="text-sm text-gray-700">
          All referential data is shared across your group companies. Make sure
          to maintain consistency when managing these master data items.
        </p>
      </Card>
    </div>
  );
}

