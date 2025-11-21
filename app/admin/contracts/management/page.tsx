'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface ContractMetrics {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalContractValue: number;
  upcomingRenewals: number;
  pendingApprovals: number;
  contractComplianceRate: number;
}

export default function ContractManagementPage() {
  const [metrics, setMetrics] = useState<ContractMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractMetrics();
  }, []);

  const fetchContractMetrics = async () => {
    try {
      const response = await fetch('/api/contracts/management?action=metrics');
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
    return <div className="p-8">Loading contract information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Contract Management
          </h1>
          <p className="text-gray-600">Manage contracts and renewals</p>
        </div>
        <Button>New Contract</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalContracts}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeContracts}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold">{metrics.expiredContracts}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(metrics.totalContractValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Renewals</p>
                <p className="text-2xl font-bold">{metrics.upcomingRenewals}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{metrics.pendingApprovals}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Compliance</p>
                <p className="text-2xl font-bold">{metrics.contractComplianceRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Contract Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Contracts</h3>
                <p className="text-sm text-gray-600">Manage all contracts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Clauses</h3>
                <p className="text-sm text-gray-600">Manage contract clauses</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Renewals</h3>
                <p className="text-sm text-gray-600">Manage contract renewals</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Contract Analytics</h3>
                <p className="text-sm text-gray-600">View contract analytics</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

