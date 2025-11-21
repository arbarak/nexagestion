'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Layers, Zap, TrendingUp } from 'lucide-react';

interface WarehouseMetrics {
  totalWarehouses: number;
  activeWarehouses: number;
  totalCapacity: number;
  totalUtilization: number;
  utilizationRate: number;
  pendingPickingOrders: number;
  completedPickingOrders: number;
  averagePickingTime: number;
}

export default function WarehouseOperationsPage() {
  const [metrics, setMetrics] = useState<WarehouseMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouseMetrics();
  }, []);

  const fetchWarehouseMetrics = async () => {
    try {
      const response = await fetch('/api/warehouse/operations?action=metrics');
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
    return <div className="p-8">Loading warehouse information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Warehouse Operations
          </h1>
          <p className="text-gray-600">Manage warehouses and operations</p>
        </div>
        <Button>Add Warehouse</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalWarehouses}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeWarehouses}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="text-2xl font-bold">{(metrics.totalCapacity / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold">{(metrics.totalUtilization / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Rate</p>
                <p className="text-2xl font-bold">{metrics.utilizationRate.toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{metrics.pendingPickingOrders}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedPickingOrders}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold">{metrics.averagePickingTime.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Warehouses</h3>
                <p className="text-sm text-gray-600">Manage warehouse locations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Warehouse Zones</h3>
                <p className="text-sm text-gray-600">Manage warehouse zones</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Picking Orders</h3>
                <p className="text-sm text-gray-600">Manage picking operations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Packing Orders</h3>
                <p className="text-sm text-gray-600">Manage packing operations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

