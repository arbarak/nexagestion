'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Wrench, AlertCircle, TrendingUp } from 'lucide-react';

interface AssetMetrics {
  totalAssets: number;
  activeAssets: number;
  totalAssetValue: number;
  totalDepreciation: number;
  maintenanceScheduled: number;
  maintenanceOverdue: number;
  totalMaintenanceCost: number;
}

export default function AssetManagementPage() {
  const [metrics, setMetrics] = useState<AssetMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetMetrics();
  }, []);

  const fetchAssetMetrics = async () => {
    try {
      const response = await fetch('/api/assets/management?action=metrics');
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
    return <div className="p-8">Loading asset information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Asset Management
          </h1>
          <p className="text-gray-600">Manage company assets and maintenance</p>
        </div>
        <Button>Register Asset</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Asset Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold">{metrics.totalAssets}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeAssets}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(metrics.totalAssetValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Depreciation</p>
                <p className="text-2xl font-bold">${(metrics.totalDepreciation / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{metrics.maintenanceScheduled}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{metrics.maintenanceOverdue}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Maint. Cost</p>
                <p className="text-2xl font-bold">${(metrics.totalMaintenanceCost / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Asset Registry</h3>
                <p className="text-sm text-gray-600">Register and manage company assets</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Maintenance Scheduling</h3>
                <p className="text-sm text-gray-600">Schedule and track maintenance</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Depreciation Tracking</h3>
                <p className="text-sm text-gray-600">Track asset depreciation</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Asset Disposal</h3>
                <p className="text-sm text-gray-600">Record asset disposals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.maintenanceOverdue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Overdue Maintenance</p>
                <p className="text-sm text-red-700">{metrics.maintenanceOverdue} maintenance tasks overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

