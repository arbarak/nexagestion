'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Warehouse, Navigation, BarChart3 } from 'lucide-react';

interface LogisticsMetrics {
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  warehouseUtilization: number;
  costPerDelivery: number;
}

export default function LogisticsPage() {
  const [metrics, setMetrics] = useState<LogisticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogisticsMetrics();
  }, []);

  const fetchLogisticsMetrics = async () => {
    try {
      const response = await fetch('/api/logistics?action=metrics');
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
    return <div className="p-8">Loading logistics information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Logistics Management
          </h1>
          <p className="text-gray-600">Manage warehouses, routes, and deliveries</p>
        </div>
        <Button>Create Delivery</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Logistics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold">{metrics.totalDeliveries}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedDeliveries}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{metrics.failedDeliveries}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Time</p>
                <p className="text-2xl font-bold">{metrics.averageDeliveryTime}h</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Warehouse Use</p>
                <p className="text-2xl font-bold">{metrics.warehouseUtilization.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Cost/Delivery</p>
                <p className="text-2xl font-bold">${metrics.costPerDelivery.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Logistics Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Warehouse className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Warehouse Management</h3>
                <p className="text-sm text-gray-600">Manage warehouse locations and capacity</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Route Management</h3>
                <p className="text-sm text-gray-600">Create and optimize delivery routes</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Delivery Tracking</h3>
                <p className="text-sm text-gray-600">Track deliveries in real-time</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Logistics Analytics</h3>
                <p className="text-sm text-gray-600">View logistics performance metrics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Delivery Success Rate</span>
                <span className="font-bold">
                  {metrics.totalDeliveries > 0
                    ? (((metrics.completedDeliveries) / metrics.totalDeliveries) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Warehouse Capacity Used</span>
                <span className="font-bold">{metrics.warehouseUtilization.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Average Cost per Delivery</span>
                <span className="font-bold">${metrics.costPerDelivery.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

