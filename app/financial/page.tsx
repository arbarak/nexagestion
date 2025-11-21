"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FinancialHub() {
  const { data: session } = useSession();

  const modules = [
    {
      title: "Chart of Accounts",
      description: "Manage financial accounts and account structure",
      href: "/financial/accounts",
      icon: "📊",
    },
    {
      title: "Journal Entries",
      description: "Record and manage journal entries",
      href: "/financial/journal-entries",
      icon: "📝",
    },
    {
      title: "Financial Reports",
      description: "View balance sheet and income statement",
      href: "/financial/reports",
      icon: "📈",
    },
    {
      title: "Audit Logs",
      description: "Track all system activities and changes",
      href: "/financial/audit-logs",
      icon: "🔍",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Financial Management</h1>
        <p className="text-gray-600 mt-2">
          Manage accounts, journal entries, and financial reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{module.icon}</span>
                      {module.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Access Module →
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

