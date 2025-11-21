"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeesPage() {
  const modules = [
    {
      title: "Employee Directory",
      description: "Manage employee information and profiles",
      icon: "👥",
      href: "/employees/directory",
    },
    {
      title: "Attendance",
      description: "Track employee attendance and time tracking",
      icon: "📋",
      href: "/employees/attendance",
    },
    {
      title: "Payroll",
      description: "Manage payroll and salary processing",
      icon: "💰",
      href: "/employees/payroll",
    },
    {
      title: "HR Reports",
      description: "View HR analytics and reports",
      icon: "📊",
      href: "/employees/reports",
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Human Resources</h1>
        <p className="text-gray-600">
          Manage your employees, attendance, and payroll
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
          Keep your employee records up to date and track attendance regularly.
          Use payroll management to ensure timely and accurate salary processing.
        </p>
      </Card>
    </div>
  );
}

