"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Payroll {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  salary: number;
}

export default function PayrollPage() {
  const { data: session } = useSafeSession();
  const sessionUser = (session as any)?.user;
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      if (!sessionUser) {
        return;
      }

      setLoading(true);
      const [payrollRes, employeesRes] = await Promise.all([
        fetch(`/api/employees/payroll?groupId=${sessionUser.groupId || ""}`),
        fetch(`/api/employees?companyId=${sessionUser.companyId || ""}`),
      ]);

      if (payrollRes.ok) {
        const data = await payrollRes.json();
        setPayroll(data.data);
      }

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const response = await fetch("/api/employees/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: sessionUser?.groupId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving payroll:", error);
    }
  };

  const columns = [
    { key: "employeeId" as const, label: "Employee" },
    { key: "month" as const, label: "Month" },
    { key: "baseSalary" as const, label: "Base Salary" },
    { key: "bonus" as const, label: "Bonus" },
    { key: "deductions" as const, label: "Deductions" },
    { key: "netSalary" as const, label: "Net Salary" },
    { key: "status" as const, label: "Status" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Payroll Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title="Process Payroll"
            fields={[
              {
                name: "employeeId",
                label: "Employee",
                type: "select",
                required: true,
                options: employees.map((e) => ({
                  value: e.id,
                  label: `${e.firstName} ${e.lastName}`,
                })),
              },
              { name: "month", label: "Month", type: "month", required: true },
              { name: "baseSalary", label: "Base Salary", type: "number", required: true },
              { name: "bonus", label: "Bonus", type: "number", required: true },
              { name: "deductions", label: "Deductions", type: "number", required: true },
              { name: "netSalary", label: "Net Salary", type: "number", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "DRAFT", label: "Draft" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "PAID", label: "Paid" },
                  { value: "CANCELLED", label: "Cancelled" },
                ],
              },
            ]}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Process Payroll
            </button>
          </div>
          <DataTable
            data={payroll}
            columns={columns}
            onAdd={() => setShowForm(true)}
            searchField="employeeId"
          />
        </Card>
      )}
    </div>
  );
}
