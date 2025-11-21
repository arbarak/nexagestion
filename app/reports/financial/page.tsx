'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Filter } from 'lucide-react';

interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12');

  useEffect(() => {
    fetchFinancialReports();
  }, [period]);

  const fetchFinancialReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/financial?months=${period}`);
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch financial reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const totalExpenses = reports.reduce((sum, r) => sum + r.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const avgMargin = reports.length > 0 ? (reports.reduce((sum, r) => sum + r.margin, 0) / reports.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive financial analysis and reporting</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {['3', '6', '12'].map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            onClick={() => setPeriod(p)}
          >
            {p} Months
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Summary</CardTitle>
          <CardDescription>Detailed breakdown by month</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Period</th>
                    <th className="text-right py-2 px-4">Revenue</th>
                    <th className="text-right py-2 px-4">Expenses</th>
                    <th className="text-right py-2 px-4">Profit</th>
                    <th className="text-right py-2 px-4">Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{report.period}</td>
                      <td className="text-right py-2 px-4">${report.revenue.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">${report.expenses.toLocaleString()}</td>
                      <td className={`text-right py-2 px-4 ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${report.profit.toLocaleString()}
                      </td>
                      <td className="text-right py-2 px-4">{report.margin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

