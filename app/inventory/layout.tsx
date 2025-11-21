import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <aside className="w-64 sticky top-0 h-screen">
        <Card className="p-6 rounded-none h-full">
          <h2 className="font-bold text-lg mb-6">Inventory Module</h2>
          <nav className="space-y-2">
            <Link
              href="/inventory"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/inventory/stock"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              📦 Stock Management
            </Link>
            <Link
              href="/inventory/movements"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              🔄 Stock Movements
            </Link>
            <Link
              href="/inventory/reports"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              📊 Reports
            </Link>
          </nav>
        </Card>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}

