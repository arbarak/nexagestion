"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AttendancePage() {
  const { data: session } = useSafeSession();
  const sessionUser = (session as any)?.user;
  const [attendance, setAttendance] = useState<Attendance[]>([]);
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
      const [attendanceRes, employeesRes] = await Promise.all([
        fetch(`/api/employees/attendance?groupId=${sessionUser.groupId || ""}`),
        fetch(`/api/employees?companyId=${sessionUser.companyId || ""}`),
      ]);

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendance(data.data);
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
      const response = await fetch("/api/employees/attendance", {
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
      console.error("Error saving attendance:", error);
    }
  };

  const columns = [
    { key: "employeeId" as const, label: "Employee" },
    { key: "date" as const, label: "Date" },
    { key: "status" as const, label: "Status" },
    { key: "checkIn" as const, label: "Check In" },
    { key: "checkOut" as const, label: "Check Out" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Attendance Tracking</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title="Record Attendance"
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
              { name: "date", label: "Date", type: "datetime-local", required: true },
              { name: "checkIn", label: "Check In Time", type: "time" },
              { name: "checkOut", label: "Check Out Time", type: "time" },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "PRESENT", label: "Present" },
                  { value: "ABSENT", label: "Absent" },
                  { value: "LATE", label: "Late" },
                  { value: "HALF_DAY", label: "Half Day" },
                  { value: "ON_LEAVE", label: "On Leave" },
                ],
              },
              { name: "notes", label: "Notes" },
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
              Record Attendance
            </button>
          </div>
          <DataTable
            data={attendance}
            columns={columns}
            onAdd={() => setShowForm(true)}
            searchField="employeeId"
          />
        </Card>
      )}
    </div>
  );
}
