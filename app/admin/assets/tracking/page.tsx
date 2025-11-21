'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';

interface AssetTrackingMetrics {
  totalLocations: number;
  assetsInUse: number;
  assetsInStorage: number;
  assetsInTransit: number;
  assetsLost: number;
  totalDepreciation: number;
  totalDisposals: number;
  totalDisposalValue: number;
}

export default function AssetTrackingPage() {
  const [metrics, setMetrics] = useState<AssetTrackingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingMetrics();
  }, []);

  const fetchTrackingMetrics = async () => {
    try {
      const response = await fetch('/api/assets/tracking?action=metrics');
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
    return <div className="p-8">Loading asset tracking information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8" />
            Asset Tracking
          </h1>
          <p className="text-gray-600">Track asset locations and depreciation</p>
        </div>
        <Button>Track Asset</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Locations</p>
                <p className="text-2xl font-bold">{metrics.totalLocations}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">In Use</p>
                <p className="text-2xl font-bold">{metrics.assetsInUse}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">In Storage</p>
                <p className="text-2xl font-bold">{metrics.assetsInStorage}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">{metrics.assetsInTransit}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Lost</p>
                <p className="text-2xl font-bold">{metrics.assetsLost}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Depreciation</p>
                <p className="text-2xl font-bold">${(metrics.totalDepreciation / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Disposals</p>
                <p className="text-2xl font-bold">{metrics.totalDisposals}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Disposal Value</p>
                <p className="text-2xl font-bold">${(metrics.totalDisposalValue / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asset Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Location Tracking</h3>
                <p className="text-sm text-gray-600">Track asset locations and assignments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Depreciation Schedule</h3>
                <p className="text-sm text-gray-600">Manage asset depreciation</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Asset Disposal</h3>
                <p className="text-sm text-gray-600">Record asset disposals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Asset Audit</h3>
                <p className="text-sm text-gray-600">Audit asset inventory</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.assetsLost > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-900">Lost Assets</p>
                <p className="text-sm text-orange-700">{metrics.assetsLost} assets marked as lost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

