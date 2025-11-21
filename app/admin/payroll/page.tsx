'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react';

interface PayrollReport {
  id: string;
  month: string;
  totalPayroll: number;
  totalBonuses: number;
  totalDeductions: number;
  employeeCount: number;
  averageSalary: number;
}

export default function PayrollPage() {
  const [reports, setReports] = useState<PayrollReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayrollReports();
  }, []);

  const fetchPayrollReports = async () => {
    try {
      const response = await fetch('/api/payroll?action=reports');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading payroll information...</div>;
  }

  const latestReport = reports[reports.length - 1];
  const totalPayroll = reports.reduce((sum, r) => sum + r.totalPayroll, 0);
  const totalBonuses = reports.reduce((sum, r) => sum + r.totalBonuses, 0);
  const totalDeductions = reports.reduce((sum, r) => sum + r.totalDeductions, 0);

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Payroll Management
          </h1>
          <p className="text-gray-600">Manage employee salaries, bonuses, and deductions</p>
        </div>
        <Button>Process Payroll</Button>
      </div>

      {latestReport && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Payroll Report - {latestReport.month}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold">${(latestReport.totalPayroll / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Bonuses</p>
                <p className="text-2xl font-bold">${(latestReport.totalBonuses / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Deductions</p>
                <p className="text-2xl font-bold">${(latestReport.totalDeductions / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold">{latestReport.employeeCount}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Salary</p>
                <p className="text-2xl font-bold">${(latestReport.averageSalary / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total Payroll (All Time)</p>
              <p className="text-3xl font-bold">${(totalPayroll / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total Bonuses</p>
              <p className="text-3xl font-bold">${(totalBonuses / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-3xl font-bold">${(totalDeductions / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Create Payroll</h3>
                <p className="text-sm text-gray-600">Create new payroll for employees</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Create</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Manage Bonuses</h3>
                <p className="text-sm text-gray-600">Add and manage employee bonuses</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Payroll Reports</h3>
                <p className="text-sm text-gray-600">View and export payroll reports</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Process Payroll</h3>
                <p className="text-sm text-gray-600">Process and finalize payroll</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Process</Button>
          </div>
        </CardContent>
      </Card>

      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.slice(-6).reverse().map((report) => (
                <div key={report.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{report.month}</p>
                    <p className="text-sm text-gray-600">{report.employeeCount} employees</p>
                  </div>
                  <p className="font-bold">${(report.totalPayroll / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

