'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Zap, TrendingUp } from 'lucide-react';

interface QualityMetrics {
  totalStandards: number;
  activeStandards: number;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  totalDefects: number;
  openDefects: number;
  qualityScore: number;
}

export default function QualityManagementPage() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQualityMetrics();
  }, []);

  const fetchQualityMetrics = async () => {
    try {
      const response = await fetch('/api/quality/management?action=metrics');
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
    return <div className="p-8">Loading quality management information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8" />
            Quality Management
          </h1>
          <p className="text-gray-600">Manage quality standards and inspections</p>
        </div>
        <Button>New Standard</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Standards</p>
                <p className="text-2xl font-bold">{metrics.totalStandards}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeStandards}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Inspections</p>
                <p className="text-2xl font-bold">{metrics.totalInspections}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Passed</p>
                <p className="text-2xl font-bold">{metrics.passedInspections}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold">{metrics.failedInspections}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Defects</p>
                <p className="text-2xl font-bold">{metrics.totalDefects}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">{metrics.openDefects}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold">{metrics.qualityScore.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quality Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Standards</h3>
                <p className="text-sm text-gray-600">Manage quality standards</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Inspections</h3>
                <p className="text-sm text-gray-600">Manage inspections</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Defects</h3>
                <p className="text-sm text-gray-600">Manage defects</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-gray-600">View quality analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

