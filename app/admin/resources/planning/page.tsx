'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Zap, Calendar, TrendingUp } from 'lucide-react';

interface ResourceMetrics {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  totalAllocations: number;
  activeAllocations: number;
  averageUtilizationRate: number;
  resourceCostTotal: number;
}

export default function ResourcePlanningPage() {
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResourceMetrics();
  }, []);

  const fetchResourceMetrics = async () => {
    try {
      const response = await fetch('/api/resources/planning?action=metrics');
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
    return <div className="p-8">Loading resource information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Resource Planning
          </h1>
          <p className="text-gray-600">Manage resources and allocations</p>
        </div>
        <Button>Add Resource</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalResources}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{metrics.availableResources}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Allocated</p>
                <p className="text-2xl font-bold">{metrics.allocatedResources}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Allocations</p>
                <p className="text-2xl font-bold">{metrics.totalAllocations}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeAllocations}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold">{metrics.averageUtilizationRate.toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${(metrics.resourceCostTotal / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Resources</h3>
                <p className="text-sm text-gray-600">Manage all resources</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Allocations</h3>
                <p className="text-sm text-gray-600">Manage resource allocations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Schedules</h3>
                <p className="text-sm text-gray-600">Manage resource schedules</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Resource Analytics</h3>
                <p className="text-sm text-gray-600">View resource analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

