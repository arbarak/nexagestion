'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface PerformanceStats {
  averageLoadTime: number;
  averageFirstPaint: number;
  averageFirstContentfulPaint: number;
  averageLargestContentfulPaint: number;
}

interface Recommendation {
  feature: string;
  reason: string;
  priority: string;
}

export default function MobileOptimizationPage() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptimizationData();
  }, []);

  const fetchOptimizationData = async () => {
    try {
      const [statsRes, recsRes] = await Promise.all([
        fetch('/api/mobile/optimization?action=performance'),
        fetch('/api/mobile/optimization?action=recommendations'),
      ]);

      if (!statsRes.ok || !recsRes.ok) throw new Error('Failed to fetch');

      const statsData = await statsRes.json();
      const recsData = await recsRes.json();

      setStats(statsData);
      setRecommendations(recsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-8">Loading optimization data...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Mobile Optimization
          </h1>
          <p className="text-gray-600">Monitor and improve mobile performance</p>
        </div>
      </div>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Load Time</p>
                <p className="text-2xl font-bold">{stats.averageLoadTime.toFixed(2)}ms</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">First Paint</p>
                <p className="text-2xl font-bold">{stats.averageFirstPaint.toFixed(2)}ms</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">FCP</p>
                <p className="text-2xl font-bold">{stats.averageFirstContentfulPaint.toFixed(2)}ms</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">LCP</p>
                <p className="text-2xl font-bold">{stats.averageLargestContentfulPaint.toFixed(2)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-gray-600">No recommendations at this time</p>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{rec.feature}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Optimization Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Image Optimization</h3>
                <p className="text-sm text-gray-600">Automatically optimize images for different devices</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>

            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Lazy Loading</h3>
                <p className="text-sm text-gray-600">Load content on demand to improve initial load time</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>

            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Code Splitting</h3>
                <p className="text-sm text-gray-600">Reduce initial bundle size by splitting code</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>

            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Service Worker Caching</h3>
                <p className="text-sm text-gray-600">Cache assets for offline access</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>

            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Compression</h3>
                <p className="text-sm text-gray-600">Compress assets to reduce data transfer</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

