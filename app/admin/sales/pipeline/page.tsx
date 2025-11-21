'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

interface PipelineMetrics {
  totalDeals: number;
  totalPipelineValue: number;
  dealsByStage: Record<string, number>;
  averageDealValue: number;
  winRate: number;
}

export default function SalesPipelinePage() {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipelineMetrics();
  }, []);

  const fetchPipelineMetrics = async () => {
    try {
      const response = await fetch('/api/sales/pipeline?action=metrics');
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
    return <div className="p-8">Loading sales pipeline...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Sales Pipeline
          </h1>
          <p className="text-gray-600">Track deals and manage sales opportunities</p>
        </div>
        <Button>Create Deal</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold">{metrics.totalDeals}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold">${(metrics.totalPipelineValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Deal Value</p>
                <p className="text-2xl font-bold">${(metrics.averageDealValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Closed Won</p>
                <p className="text-2xl font-bold">{metrics.dealsByStage['closed-won'] || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="space-y-3">
              {Object.entries(metrics.dealsByStage).map(([stage, count]) => (
                <div key={stage} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold capitalize">{stage.replace('-', ' ')}</h3>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(count / (metrics.totalDeals || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Activities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Active Deals</h3>
                <p className="text-sm text-gray-600">Manage ongoing sales opportunities</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Sales Forecast</h3>
                <p className="text-sm text-gray-600">Revenue projections and forecasts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Sales Performance</h3>
                <p className="text-sm text-gray-600">Track sales metrics and KPIs</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

