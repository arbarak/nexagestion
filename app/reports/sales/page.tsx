'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface SalesReport {
  period: string;
  sales: number;
  target: number;
  orders: number;
  avgOrderValue: number;
}

export default function SalesReportsPage() {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12');

  useEffect(() => {
    fetchSalesReports();
  }, [period]);

  const fetchSalesReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/sales?months=${period}`);
      if (res.ok) {
        setReports(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch sales reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = reports.reduce((sum, r) => sum + r.sales, 0);
  const totalTarget = reports.reduce((sum, r) => sum + r.target, 0);
  const totalOrders = reports.reduce((sum, r) => sum + r.orders, 0);
  const achievement = totalTarget > 0 ? ((totalSales / totalTarget) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Reports</h1>
          <p className="text-gray-600 mt-2">Detailed sales performance analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sales Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTarget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Achievement %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(achievement) >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
              {achievement}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Summary</CardTitle>
          <CardDescription>Sales performance by month</CardDescription>
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
                    <th className="text-right py-2 px-4">Sales</th>
                    <th className="text-right py-2 px-4">Target</th>
                    <th className="text-right py-2 px-4">Achievement</th>
                    <th className="text-right py-2 px-4">Orders</th>
                    <th className="text-right py-2 px-4">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => {
                    const achievement = report.target > 0 ? ((report.sales / report.target) * 100).toFixed(1) : '0';
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{report.period}</td>
                        <td className="text-right py-2 px-4">${report.sales.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">${report.target.toLocaleString()}</td>
                        <td className={`text-right py-2 px-4 ${parseFloat(achievement) >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                          {achievement}%
                        </td>
                        <td className="text-right py-2 px-4">{report.orders}</td>
                        <td className="text-right py-2 px-4">${report.avgOrderValue.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

