'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Trash2 } from 'lucide-react';

interface PerformanceStats {
  endpoint: string;
  method: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  p99Duration: number;
  requestCount: number;
  errorCount: number;
}

export default function PerformancePage() {
  const [stats, setStats] = useState<PerformanceStats[]>([]);
  const [slowRequests, setSlowRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const [statsRes, slowRes] = await Promise.all([
        fetch('/api/admin/performance?action=all-stats'),
        fetch('/api/admin/performance?action=slow-requests&threshold=1000&limit=10'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (slowRes.ok) {
        const data = await slowRes.json();
        setSlowRequests(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMetrics = async () => {
    if (!confirm('Clear all performance metrics?')) return;

    try {
      const response = await fetch('/api/admin/performance', {
        method: 'DELETE',
      });

      if (response.ok) {
        setStats([]);
        setSlowRequests([]);
        alert('Metrics cleared');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to clear metrics');
    }
  };

  if (loading) {
    return <div className="p-8">Loading performance data...</div>;
  }

  const chartData = stats.map((s) => ({
    endpoint: `${s.method} ${s.endpoint}`,
    avg: Math.round(s.avgDuration),
    p95: Math.round(s.p95Duration),
    p99: Math.round(s.p99Duration),
  }));

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-gray-600">Track API performance and identify bottlenecks</p>
        </div>
        <Button variant="destructive" onClick={handleClearMetrics}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.reduce((sum, s) => sum + s.requestCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(stats.reduce((sum, s) => sum + s.avgDuration, 0) / (stats.length || 1))}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.reduce((sum, s) => sum + s.errorCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" fill="#3b82f6" name="Average" />
              <Bar dataKey="p95" fill="#f59e0b" name="P95" />
              <Bar dataKey="p99" fill="#ef4444" name="P99" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slow Requests (&gt;1000ms)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {slowRequests.length === 0 ? (
              <p className="text-gray-600">No slow requests</p>
            ) : (
              slowRequests.map((req, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{req.method} {req.endpoint}</p>
                    <p className="text-sm text-gray-600">{new Date(req.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{Math.round(req.duration)}ms</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Endpoint</th>
                  <th className="text-right py-2">Requests</th>
                  <th className="text-right py-2">Avg (ms)</th>
                  <th className="text-right py-2">P95 (ms)</th>
                  <th className="text-right py-2">Errors</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2">{s.method} {s.endpoint}</td>
                    <td className="text-right">{s.requestCount}</td>
                    <td className="text-right">{Math.round(s.avgDuration)}</td>
                    <td className="text-right">{Math.round(s.p95Duration)}</td>
                    <td className="text-right text-red-600">{s.errorCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

