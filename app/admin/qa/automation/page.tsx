'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, BarChart3, FileText, Play } from 'lucide-react';

interface AutomationMetrics {
  totalScripts: number;
  activeScripts: number;
  totalRuns: number;
  averageSuccessRate: number;
  totalReports: number;
}

export default function AutomationPage() {
  const [metrics, setMetrics] = useState<AutomationMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationMetrics();
  }, []);

  const fetchAutomationMetrics = async () => {
    try {
      const response = await fetch('/api/qa/automation?action=metrics');
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
    return <div className="p-8">Loading automation information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8" />
            Test Automation
          </h1>
          <p className="text-gray-600">Manage automated test scripts and execution</p>
        </div>
        <Button>Create Script</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Automation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Scripts</p>
                <p className="text-2xl font-bold">{metrics.totalScripts}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeScripts}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Runs</p>
                <p className="text-2xl font-bold">{metrics.totalRuns}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.averageSuccessRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold">{metrics.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Automation Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Automation Scripts</h3>
                <p className="text-sm text-gray-600">Create and manage test automation scripts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Script Execution</h3>
                <p className="text-sm text-gray-600">Run and monitor automation scripts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Execution History</h3>
                <p className="text-sm text-gray-600">View script execution history and logs</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Test Reports</h3>
                <p className="text-sm text-gray-600">Generate and view test reports</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="font-semibold">Selenium</p>
              <p className="text-sm text-gray-600">Web automation</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="font-semibold">Cypress</p>
              <p className="text-sm text-gray-600">Modern web testing</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="font-semibold">Playwright</p>
              <p className="text-sm text-gray-600">Cross-browser testing</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="font-semibold">Appium</p>
              <p className="text-sm text-gray-600">Mobile automation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

