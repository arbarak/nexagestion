'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plug, Link2, Activity, TrendingUp } from 'lucide-react';

interface IntegrationMetrics {
  totalIntegrations: number;
  activeIntegrations: number;
  totalEndpoints: number;
  activeEndpoints: number;
  totalLogs: number;
  successfulSyncs: number;
  failedSyncs: number;
  integrationHealthScore: number;
}

export default function IntegrationManagementPage() {
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrationMetrics();
  }, []);

  const fetchIntegrationMetrics = async () => {
    try {
      const response = await fetch('/api/integrations/management?action=metrics');
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
    return <div className="p-8">Loading integration information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="h-8 w-8" />
            Integration Management
          </h1>
          <p className="text-gray-600">Manage integrations and endpoints</p>
        </div>
        <Button>New Integration</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Integrations</p>
                <p className="text-2xl font-bold">{metrics.totalIntegrations}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeIntegrations}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Endpoints</p>
                <p className="text-2xl font-bold">{metrics.totalEndpoints}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeEndpoints}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Logs</p>
                <p className="text-2xl font-bold">{metrics.totalLogs}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Success</p>
                <p className="text-2xl font-bold">{metrics.successfulSyncs}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{metrics.failedSyncs}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Health</p>
                <p className="text-2xl font-bold">{metrics.integrationHealthScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integration Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plug className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Integrations</h3>
                <p className="text-sm text-gray-600">Manage integrations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Endpoints</h3>
                <p className="text-sm text-gray-600">Manage endpoints</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Logs</h3>
                <p className="text-sm text-gray-600">View integration logs</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View integration analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

