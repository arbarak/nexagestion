'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, CheckCircle, BarChart3 } from 'lucide-react';

interface RiskMetrics {
  totalRisks: number;
  highRisks: number;
  criticalRisks: number;
  mitigatedRisks: number;
  averageRiskScore: number;
  riskTrend: string;
  complianceRiskRate: number;
}

export default function RiskManagementPage() {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskMetrics();
  }, []);

  const fetchRiskMetrics = async () => {
    try {
      const response = await fetch('/api/risks/management?action=metrics');
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
    return <div className="p-8">Loading risk information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Risk Management
          </h1>
          <p className="text-gray-600">Manage risks and mitigations</p>
        </div>
        <Button>New Risk</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalRisks}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">High</p>
                <p className="text-2xl font-bold">{metrics.highRisks}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold">{metrics.criticalRisks}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Mitigated</p>
                <p className="text-2xl font-bold">{metrics.mitigatedRisks}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">{metrics.averageRiskScore.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-2xl font-bold">{metrics.riskTrend}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Compliance</p>
                <p className="text-2xl font-bold">{metrics.complianceRiskRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Risk Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-semibold">Risks</h3>
                <p className="text-sm text-gray-600">Manage all risks</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Assessments</h3>
                <p className="text-sm text-gray-600">Manage risk assessments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Mitigations</h3>
                <p className="text-sm text-gray-600">Manage risk mitigations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Risk Analytics</h3>
                <p className="text-sm text-gray-600">View risk analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

