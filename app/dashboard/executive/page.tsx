'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface KPI {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const fetchExecutiveData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/kpis');
      if (res.ok) {
        const data = await res.json();
        const formattedKpis: KPI[] = [
          {
            label: 'Total Revenue',
            value: `$${(data.totalRevenue || 0).toLocaleString()}`,
            change: data.revenueChange || 0,
            trend: (data.revenueChange || 0) >= 0 ? 'up' : 'down',
            icon: <DollarSign className="w-6 h-6" />,
          },
          {
            label: 'Total Orders',
            value: (data.totalOrders || 0).toString(),
            change: data.ordersChange || 0,
            trend: (data.ordersChange || 0) >= 0 ? 'up' : 'down',
            icon: <ShoppingCart className="w-6 h-6" />,
          },
          {
            label: 'Active Customers',
            value: (data.activeCustomers || 0).toString(),
            change: data.customersChange || 0,
            trend: (data.customersChange || 0) >= 0 ? 'up' : 'down',
            icon: <Users className="w-6 h-6" />,
          },
          {
            label: 'Inventory Value',
            value: `$${(data.inventoryValue || 0).toLocaleString()}`,
            change: data.inventoryChange || 0,
            trend: (data.inventoryChange || 0) >= 0 ? 'up' : 'down',
            icon: <Package className="w-6 h-6" />,
          },
        ];
        setKpis(formattedKpis);
      }
    } catch (error) {
      console.error('Failed to fetch executive data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Executive Dashboard</h1>
        <p className="text-gray-600 mt-2">High-level business performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading dashboard...</div>
        ) : (
          kpis.map((kpi, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                <div className="text-gray-600">{kpi.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(kpi.change)}%
                  </span>
                  <span className="text-gray-600 text-sm">vs last month</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Best sellers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm">Product {i}</span>
                  <span className="font-medium">${(Math.random() * 10000).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest business activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b">
                  <span className="text-sm">Transaction {i}</span>
                  <span className="font-medium text-green-600">+$5,000</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

