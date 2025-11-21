'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Bug, TrendingUp } from 'lucide-react';

interface QAMetrics {
  totalTestCases: number;
  activeTestCases: number;
  totalExecutions: number;
  passRate: number;
  openBugs: number;
  resolvedBugs: number;
  criticalBugs: number;
}

export default function TestCasesPage() {
  const [metrics, setMetrics] = useState<QAMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQAMetrics();
  }, []);

  const fetchQAMetrics = async () => {
    try {
      const response = await fetch('/api/qa/test-cases?action=metrics');
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
    return <div className="p-8">Loading QA information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Quality Assurance Management
          </h1>
          <p className="text-gray-600">Manage test cases, executions, and bug reports</p>
        </div>
        <Button>Create Test Case</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>QA Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{metrics.totalTestCases}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeTestCases}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Executions</p>
                <p className="text-2xl font-bold">{metrics.totalExecutions}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold">{metrics.passRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Open Bugs</p>
                <p className="text-2xl font-bold">{metrics.openBugs}</p>
              </div>
              <div className="p-4 bg-blue-100 rounded-lg">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{metrics.resolvedBugs}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold">{metrics.criticalBugs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Test Cases</h3>
                <p className="text-sm text-gray-600">Create and manage test cases</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Test Execution</h3>
                <p className="text-sm text-gray-600">Execute and track test results</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bug className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Bug Reports</h3>
                <p className="text-sm text-gray-600">Report and track bugs</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Test Suites</h3>
                <p className="text-sm text-gray-600">Organize tests into suites</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.criticalBugs > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Critical Bugs Found</p>
                <p className="text-sm text-red-700">{metrics.criticalBugs} critical bugs require immediate attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

