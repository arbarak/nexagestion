'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
}

export default function AccountingPage() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialMetrics();
  }, []);

  const fetchFinancialMetrics = async () => {
    try {
      const response = await fetch('/api/accounting?action=metrics');
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
    return <div className="p-8">Loading accounting information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Accounting & Finance
          </h1>
          <p className="text-gray-600">Manage accounts, invoices, and financial records</p>
        </div>
        <Button>Create Invoice</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Assets</p>
                <p className="text-2xl font-bold">${(metrics.totalAssets / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Liabilities</p>
                <p className="text-2xl font-bold">${(metrics.totalLiabilities / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Equity</p>
                <p className="text-2xl font-bold">${(metrics.totalEquity / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${(metrics.totalRevenue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-2xl font-bold">${(metrics.totalExpenses / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-2xl font-bold">${(metrics.netIncome / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Accounting Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Chart of Accounts</h3>
                <p className="text-sm text-gray-600">Manage accounts and balances</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Journal Entries</h3>
                <p className="text-sm text-gray-600">Record and post journal entries</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Invoices</h3>
                <p className="text-sm text-gray-600">Create and manage invoices</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Financial Reports</h3>
                <p className="text-sm text-gray-600">View financial statements</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Total Assets</span>
                <span className="font-bold">${(metrics.totalAssets / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Total Liabilities</span>
                <span className="font-bold">${(metrics.totalLiabilities / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Net Income</span>
                <span className="font-bold text-green-600">${(metrics.netIncome / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-bold">{metrics.profitMargin.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

