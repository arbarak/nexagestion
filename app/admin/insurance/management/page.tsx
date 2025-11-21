'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, CheckCircle, TrendingUp } from 'lucide-react';

interface InsuranceMetrics {
  totalPolicies: number;
  activePolicies: number;
  totalCoverage: number;
  totalPremiums: number;
  totalClaims: number;
  approvedClaims: number;
  claimApprovalRate: number;
  insuranceCostRatio: number;
}

export default function InsuranceManagementPage() {
  const [metrics, setMetrics] = useState<InsuranceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsuranceMetrics();
  }, []);

  const fetchInsuranceMetrics = async () => {
    try {
      const response = await fetch('/api/insurance/management?action=metrics');
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
    return <div className="p-8">Loading insurance information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Insurance Management
          </h1>
          <p className="text-gray-600">Manage insurance policies and claims</p>
        </div>
        <Button>New Policy</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Insurance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Policies</p>
                <p className="text-2xl font-bold">{metrics.totalPolicies}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activePolicies}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Coverage</p>
                <p className="text-2xl font-bold">${(metrics.totalCoverage / 1000000).toFixed(0)}M</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Premiums</p>
                <p className="text-2xl font-bold">${(metrics.totalPremiums / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Claims</p>
                <p className="text-2xl font-bold">{metrics.totalClaims}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{metrics.approvedClaims}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold">{metrics.claimApprovalRate.toFixed(0)}%</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Cost Ratio</p>
                <p className="text-2xl font-bold">{metrics.insuranceCostRatio.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Insurance Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Policies</h3>
                <p className="text-sm text-gray-600">Manage insurance policies</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Claims</h3>
                <p className="text-sm text-gray-600">Manage insurance claims</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Approvals</h3>
                <p className="text-sm text-gray-600">Manage claim approvals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Insurance Analytics</h3>
                <p className="text-sm text-gray-600">View insurance analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

