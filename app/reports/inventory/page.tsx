'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';

interface InventoryReport {
  category: string;
  quantity: number;
  value: number;
  reorderLevel: number;
  status: 'optimal' | 'low' | 'critical';
}

export default function InventoryReportsPage() {
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryReports();
  }, []);

  const fetchInventoryReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/inventory');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = reports.reduce((sum, r) => sum + r.quantity, 0);
  const totalValue = reports.reduce((sum, r) => sum + r.value, 0);
  const criticalItems = reports.filter((r) => r.status === 'critical').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Reports</h1>
          <p className="text-gray-600 mt-2">Stock levels and inventory analysis</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
              {criticalItems > 0 && <AlertTriangle className="w-5 h-5 text-red-600" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
          <CardDescription>Stock levels and status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading reports...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-right py-2 px-4">Quantity</th>
                    <th className="text-right py-2 px-4">Value</th>
                    <th className="text-right py-2 px-4">Reorder Level</th>
                    <th className="text-center py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{report.category}</td>
                      <td className="text-right py-2 px-4">{report.quantity.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">${report.value.toLocaleString()}</td>
                      <td className="text-right py-2 px-4">{report.reorderLevel}</td>
                      <td className="text-center py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status.toUpperCase()}
                        </span>
                      </td>
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

