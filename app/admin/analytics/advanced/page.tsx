'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Brain, AlertCircle, TrendingUp } from 'lucide-react';

interface AdvancedAnalyticsMetrics {
  totalQueries: number;
  completedQueries: number;
  totalModels: number;
  activeModels: number;
  totalAlerts: number;
  triggeredAlerts: number;
  averageQueryTime: number;
  modelAccuracy: number;
}

export default function AdvancedAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdvancedAnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsMetrics();
  }, []);

  const fetchAnalyticsMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/advanced?action=metrics');
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
    return <div className="p-8">Loading advanced analytics information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            Advanced Analytics
          </h1>
          <p className="text-gray-600">Manage queries, models, and alerts</p>
        </div>
        <Button>New Query</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Queries</p>
                <p className="text-2xl font-bold">{metrics.totalQueries}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedQueries}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Models</p>
                <p className="text-2xl font-bold">{metrics.totalModels}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeModels}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold">{metrics.totalAlerts}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Triggered</p>
                <p className="text-2xl font-bold">{metrics.triggeredAlerts}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Query Time</p>
                <p className="text-2xl font-bold">{metrics.averageQueryTime.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold">{metrics.modelAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Queries</h3>
                <p className="text-sm text-gray-600">Manage analytics queries</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Models</h3>
                <p className="text-sm text-gray-600">Manage predictive models</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Alerts</h3>
                <p className="text-sm text-gray-600">Manage analytics alerts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Insights</h3>
                <p className="text-sm text-gray-600">View analytics insights</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

