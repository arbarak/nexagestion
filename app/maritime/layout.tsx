import Link from "next/link";

export default function MaritimeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 text-white p-6 min-h-screen sticky top-0">
        <h2 className="text-xl font-bold mb-8">Maritime</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/maritime"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Overview
          </Link>
          <Link
            href="/maritime/vessels"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Vessels
          </Link>
          <Link
            href="/maritime/voyages"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Voyages
          </Link>
          <Link
            href="/maritime/cargo"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Cargo
          </Link>
          <Link
            href="/maritime/reports"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Reports
          </Link>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}

