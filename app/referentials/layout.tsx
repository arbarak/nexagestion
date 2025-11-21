import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function ReferentialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const referentialLinks = [
    { href: "/referentials/clients", label: "Clients" },
    { href: "/referentials/suppliers", label: "Suppliers" },
    { href: "/referentials/products", label: "Products" },
    { href: "/referentials/categories", label: "Categories" },
    { href: "/referentials/brands", label: "Brands" },
    { href: "/referentials/tax-rates", label: "Tax Rates" },
  ];

  return (
    <div className="flex gap-6 p-8">
      <aside className="w-48">
        <Card className="p-4 sticky top-8">
          <h3 className="font-semibold mb-4">Referentials</h3>
          <nav className="space-y-2">
            {referentialLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded hover:bg-gray-100 text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Card>
      </aside>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

