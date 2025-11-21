'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, BarChart3, GitBranch, TrendingUp } from 'lucide-react';

interface APIManagementMetrics {
  totalAPIKeys: number;
  activeAPIKeys: number;
  totalUsage: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalVersions: number;
  activeVersions: number;
}

export default function APIManagementPage() {
  const [metrics, setMetrics] = useState<APIManagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPIMetrics();
  }, []);

  const fetchAPIMetrics = async () => {
    try {
      const response = await fetch('/api/api-management?action=metrics');
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
    return <div className="p-8">Loading API management information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="h-8 w-8" />
            API Management
          </h1>
          <p className="text-gray-600">Manage API keys and versions</p>
        </div>
        <Button>New API Key</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>API Management Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">API Keys</p>
                <p className="text-2xl font-bold">{metrics.totalAPIKeys}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeAPIKeys}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Usage</p>
                <p className="text-2xl font-bold">{metrics.totalUsage}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Success</p>
                <p className="text-2xl font-bold">{metrics.successfulRequests}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{metrics.failedRequests}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(0)}ms</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Versions</p>
                <p className="text-2xl font-bold">{metrics.totalVersions}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeVersions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>API Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">API Keys</h3>
                <p className="text-sm text-gray-600">Manage API keys</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Usage</h3>
                <p className="text-sm text-gray-600">View API usage</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Versions</h3>
                <p className="text-sm text-gray-600">Manage API versions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View API analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

