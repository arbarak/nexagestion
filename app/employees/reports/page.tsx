"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface ReportData {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  attendanceRate: number;
  totalAttendanceRecords: number;
}

export default function HRReportsPage() {
  const { data: session } = useSafeSession();
  const sessionUser = (session as any)?.user;
  const [data, setData] = useState<ReportData>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveEmployees: 0,
    totalPayroll: 0,
    averageSalary: 0,
    attendanceRate: 0,
    totalAttendanceRecords: 0,
  });
  const [loading, setLoading] = useState(true);

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
      const [employeesRes, attendanceRes, payrollRes] = await Promise.all([
        fetch(`/api/employees?companyId=${sessionUser.companyId || ""}`),
        fetch(`/api/employees/attendance?groupId=${sessionUser.groupId || ""}`),
        fetch(`/api/employees/payroll?groupId=${sessionUser.groupId || ""}`),
      ]);

      let employees = [];
      let attendance = [];
      let payroll = [];

      if (employeesRes.ok) {
        const result = await employeesRes.json();
        employees = result.data;
      }

      if (attendanceRes.ok) {
        const result = await attendanceRes.json();
        attendance = result.data;
      }

      if (payrollRes.ok) {
        const result = await payrollRes.json();
        payroll = result.data;
      }

      const activeEmployees = employees.filter((e: any) => e.status === "ACTIVE").length;
      const onLeaveEmployees = employees.filter((e: any) => e.status === "ON_LEAVE").length;
      const totalPayroll = payroll.reduce((sum: number, p: any) => sum + (p.netSalary || 0), 0);
      const averageSalary = employees.length > 0 ? employees.reduce((sum: number, e: any) => sum + (e.salary || 0), 0) / employees.length : 0;
      const presentCount = attendance.filter((a: any) => a.status === "PRESENT").length;
      const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

      setData({
        totalEmployees: employees.length,
        activeEmployees,
        onLeaveEmployees,
        totalPayroll,
        averageSalary,
        attendanceRate,
        totalAttendanceRecords: attendance.length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">HR Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-gray-600">Total Employees</div>
          <div className="text-3xl font-bold mt-2">{data.totalEmployees}</div>
          <div className="text-xs text-green-600 mt-2">{data.activeEmployees} active</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">On Leave</div>
          <div className="text-3xl font-bold mt-2">{data.onLeaveEmployees}</div>
          <div className="text-xs text-orange-600 mt-2">employees</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Average Salary</div>
          <div className="text-3xl font-bold mt-2">${data.averageSalary.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-2">per month</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-gray-600">Attendance Rate</div>
          <div className="text-3xl font-bold mt-2">{data.attendanceRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-2">present</div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Payroll Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Payroll</div>
            <div className="text-2xl font-bold mt-1">${data.totalPayroll.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Attendance Records</div>
            <div className="text-2xl font-bold mt-1">{data.totalAttendanceRecords}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
