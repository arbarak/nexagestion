'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Hammer, Clock, TrendingUp } from 'lucide-react';

interface CorrectiveMaintenanceMetrics {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalRepairs: number;
  completedRepairs: number;
  averageResolutionTime: number;
}

export default function CorrectiveMaintenancePage() {
  const [metrics, setMetrics] = useState<CorrectiveMaintenanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/maintenance/corrective?action=metrics');
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
    return <div className="p-8">Loading corrective maintenance information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Hammer className="h-8 w-8" />
            Corrective Maintenance
          </h1>
          <p className="text-gray-600">Manage maintenance requests and work orders</p>
        </div>
        <Button>New Request</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Corrective Maintenance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Requests</p>
                <p className="text-2xl font-bold">{metrics.totalRequests}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">{metrics.openRequests}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedRequests}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Work Orders</p>
                <p className="text-2xl font-bold">{metrics.totalWorkOrders}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedWorkOrders}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Repairs</p>
                <p className="text-2xl font-bold">{metrics.totalRepairs}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedRepairs}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">{metrics.averageResolutionTime.toFixed(1)}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Corrective Maintenance Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Requests</h3>
                <p className="text-sm text-gray-600">Manage maintenance requests</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hammer className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Work Orders</h3>
                <p className="text-sm text-gray-600">Manage work orders</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Repairs</h3>
                <p className="text-sm text-gray-600">Manage repairs</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

