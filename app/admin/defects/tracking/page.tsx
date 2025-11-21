'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface DefectMetrics {
  totalDefects: number;
  openDefects: number;
  resolvedDefects: number;
  closedDefects: number;
  totalActions: number;
  completedActions: number;
  averageResolutionTime: number;
  defectTrendScore: number;
}

export default function DefectTrackingPage() {
  const [metrics, setMetrics] = useState<DefectMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDefectMetrics();
  }, []);

  const fetchDefectMetrics = async () => {
    try {
      const response = await fetch('/api/defects/tracking?action=metrics');
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
    return <div className="p-8">Loading defect tracking information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Defect Tracking
          </h1>
          <p className="text-gray-600">Track and manage defects</p>
        </div>
        <Button>New Defect Report</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Defect Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalDefects}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">{metrics.openDefects}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{metrics.resolvedDefects}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold">{metrics.closedDefects}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Actions</p>
                <p className="text-2xl font-bold">{metrics.totalActions}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedActions}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">{metrics.averageResolutionTime.toFixed(1)}d</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Trend Score</p>
                <p className="text-2xl font-bold">{metrics.defectTrendScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Defect Tracking Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Reports</h3>
                <p className="text-sm text-gray-600">Manage defect reports</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Actions</h3>
                <p className="text-sm text-gray-600">Manage corrective actions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Resolution</h3>
                <p className="text-sm text-gray-600">Track resolutions</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View defect analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

