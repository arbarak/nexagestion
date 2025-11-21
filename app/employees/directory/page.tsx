"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  status: string;
}

export default function EmployeeDirectoryPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/employees?companyId=${session?.user?.companyId}`
      );

      if (response.ok) {
        const data = await response.json();
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
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : "/api/employees";

      const method = editingEmployee ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: session?.user?.groupId,
          companyId: session?.user?.companyId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingEmployee(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`/api/employees/${employee.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  const columns = [
    { key: "firstName" as const, label: "First Name" },
    { key: "lastName" as const, label: "Last Name" },
    { key: "email" as const, label: "Email" },
    { key: "department" as const, label: "Department" },
    { key: "position" as const, label: "Position" },
    { key: "status" as const, label: "Status" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Employee Directory</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingEmployee ? "Edit Employee" : "New Employee"}
            fields={[
              { name: "firstName", label: "First Name", required: true },
              { name: "lastName", label: "Last Name", required: true },
              { name: "email", label: "Email", type: "email", required: true },
              { name: "phone", label: "Phone", required: true },
              { name: "department", label: "Department", required: true },
              { name: "position", label: "Position", required: true },
              { name: "hireDate", label: "Hire Date", type: "datetime-local", required: true },
              { name: "salary", label: "Salary", type: "number", required: true },
              {
                name: "employmentType",
                label: "Employment Type",
                type: "select",
                required: true,
                options: [
                  { value: "FULL_TIME", label: "Full Time" },
                  { value: "PART_TIME", label: "Part Time" },
                  { value: "CONTRACT", label: "Contract" },
                  { value: "TEMPORARY", label: "Temporary" },
                ],
              },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "ON_LEAVE", label: "On Leave" },
                  { value: "TERMINATED", label: "Terminated" },
                ],
              },
            ]}
            initialData={editingEmployee || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingEmployee(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={employees}
            columns={columns}
            onEdit={(employee) => {
              setEditingEmployee(employee);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="firstName"
          />
        </Card>
      )}
    </div>
  );
}

