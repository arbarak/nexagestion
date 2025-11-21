import { Sidebar } from "@/components/sidebar";

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = [
    { label: "Financial Hub", href: "/financial" },
    { label: "Chart of Accounts", href: "/financial/accounts" },
    { label: "Journal Entries", href: "/financial/journal-entries" },
    { label: "Financial Reports", href: "/financial/reports" },
    { label: "Audit Logs", href: "/financial/audit-logs" },
  ];

  return (
    <div className="flex">
      <Sidebar items={navigationItems} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

