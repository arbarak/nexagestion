"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const adminModules = [
    {
      title: "User Management",
      description: "Manage system users and their roles",
      href: "/admin/users",
      icon: "👥",
      color: "bg-blue-100",
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings",
      href: "/admin/settings",
      icon: "⚙️",
      color: "bg-gray-100",
    },
    {
      title: "Audit Logs",
      description: "View system audit trail",
      href: "/financial/audit-logs",
      icon: "📋",
      color: "bg-yellow-100",
    },
    {
      title: "Integrations",
      description: "Manage API keys and webhooks",
      href: "/integrations",
      icon: "🔗",
      color: "bg-purple-100",
    },
    {
      title: "Data Management",
      description: "Import and export data",
      href: "/data-management",
      icon: "📊",
      color: "bg-green-100",
    },
    {
      title: "Backup & Recovery",
      description: "Manage backups and recovery",
      href: "/admin/backup",
      icon: "💾",
      color: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-gray-600 mt-2">
          System administration and configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{module.icon}</span>
                      {module.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      {module.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Access →
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Total Companies</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-sm text-gray-600">API Calls (24h)</p>
            <p className="text-2xl font-bold">--</p>
          </div>
          <div className="p-4 bg-purple-50 rounded">
            <p className="text-sm text-gray-600">Database Size</p>
            <p className="text-2xl font-bold">--</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

