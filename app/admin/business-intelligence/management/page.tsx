'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

interface AnalyticsMetrics {
  totalDashboards: number;
  activeDashboards: number;
  totalReports: number;
  publishedReports: number;
  totalVisualizations: number;
  dataQualityScore: number;
  analyticsUsageRate: number;
}

export default function BusinessIntelligencePage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsMetrics();
  }, []);

  const fetchAnalyticsMetrics = async () => {
    try {
      const response = await fetch('/api/business-intelligence/management?action=metrics');
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
    return <div className="p-8">Loading business intelligence information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Business Intelligence
          </h1>
          <p className="text-gray-600">Manage dashboards and reports</p>
        </div>
        <Button>New Dashboard</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Dashboards</p>
                <p className="text-2xl font-bold">{metrics.totalDashboards}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeDashboards}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold">{metrics.totalReports}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">{metrics.publishedReports}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Visualizations</p>
                <p className="text-2xl font-bold">{metrics.totalVisualizations}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Data Quality</p>
                <p className="text-2xl font-bold">{metrics.dataQualityScore.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Usage Rate</p>
                <p className="text-2xl font-bold">{metrics.analyticsUsageRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Business Intelligence Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Dashboards</h3>
                <p className="text-sm text-gray-600">Manage dashboards</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Reports</h3>
                <p className="text-sm text-gray-600">Manage reports</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Visualizations</h3>
                <p className="text-sm text-gray-600">Manage visualizations</p>
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

