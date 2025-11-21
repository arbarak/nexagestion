import Link from "next/link";

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 text-white p-6 min-h-screen sticky top-0">
        <h2 className="text-xl font-bold mb-8">HR</h2>
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Dashboard
          </Link>
          <Link
            href="/employees"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Overview
          </Link>
          <Link
            href="/employees/directory"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Directory
          </Link>
          <Link
            href="/employees/attendance"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Attendance
          </Link>
          <Link
            href="/employees/payroll"
            className="block px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Payroll
          </Link>
          <Link
            href="/employees/reports"
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

