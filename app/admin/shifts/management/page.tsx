'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Users, Repeat2, TrendingUp } from 'lucide-react';

interface ShiftMetrics {
  totalShifts: number;
  activeShifts: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingSwaps: number;
  approvedSwaps: number;
  averageShiftUtilization: number;
  shiftCoverageRate: number;
}

export default function ShiftManagementPage() {
  const [metrics, setMetrics] = useState<ShiftMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShiftMetrics();
  }, []);

  const fetchShiftMetrics = async () => {
    try {
      const response = await fetch('/api/shifts/management?action=metrics');
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
    return <div className="p-8">Loading shift information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Shift Management
          </h1>
          <p className="text-gray-600">Manage shifts and assignments</p>
        </div>
        <Button>Create Shift</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Shift Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalShifts}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeShifts}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold">{metrics.totalAssignments}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedAssignments}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending Swaps</p>
                <p className="text-2xl font-bold">{metrics.pendingSwaps}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Approved Swaps</p>
                <p className="text-2xl font-bold">{metrics.approvedSwaps}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold">{metrics.averageShiftUtilization.toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">{metrics.shiftCoverageRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Shifts</h3>
                <p className="text-sm text-gray-600">Manage all shifts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Assignments</h3>
                <p className="text-sm text-gray-600">Manage shift assignments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Repeat2 className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Shift Swaps</h3>
                <p className="text-sm text-gray-600">Manage shift swaps</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Shift Analytics</h3>
                <p className="text-sm text-gray-600">View shift analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

