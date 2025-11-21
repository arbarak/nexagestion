import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <aside className="w-64 sticky top-0 h-screen">
        <Card className="p-6 rounded-none h-full">
          <h2 className="font-bold text-lg mb-6">Sales Module</h2>
          <nav className="space-y-2">
            <Link
              href="/sales"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/sales/orders"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              📋 Sales Orders
            </Link>
            <Link
              href="/sales/invoices"
              className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              📄 Sales Invoices
            </Link>
            <Link
              href="/sales/reports"
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

