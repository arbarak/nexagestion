'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface HRMMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  averageSalary: number;
  departmentCount: number;
  pendingLeaveRequests: number;
}

export default function EmployeesPage() {
  const [metrics, setMetrics] = useState<HRMMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRMMetrics();
  }, []);

  const fetchHRMMetrics = async () => {
    try {
      const response = await fetch('/api/hrm/employees?action=metrics');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading HRM information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Human Resources Management
          </h1>
          <p className="text-gray-600">Manage employees, leave, and attendance</p>
        </div>
        <Button>Add Employee</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>HRM Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeEmployees}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold">{metrics.onLeave}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold">{metrics.departmentCount}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Salary</p>
                <p className="text-2xl font-bold">${(metrics.averageSalary / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending Leaves</p>
                <p className="text-2xl font-bold">{metrics.pendingLeaveRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Employee Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">View All Employees</h3>
                <p className="text-sm text-gray-600">Browse and manage employee database</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Leave Management</h3>
                <p className="text-sm text-gray-600">Manage leave requests and approvals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Attendance Tracking</h3>
                <p className="text-sm text-gray-600">Track employee attendance and hours</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Performance Reviews</h3>
                <p className="text-sm text-gray-600">Manage employee performance evaluations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.pendingLeaveRequests > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Action Required</p>
                <p className="text-sm text-yellow-700">{metrics.pendingLeaveRequests} leave requests pending approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

