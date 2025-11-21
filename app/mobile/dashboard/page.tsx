'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShoppingCart, Package, DollarSign } from 'lucide-react';

interface MobileKPI {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export default function MobileDashboard() {
  const [kpis, setKpis] = useState<MobileKPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMobileData();
  }, []);

  const fetchMobileData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/analytics/kpis');
      if (res.ok) {
        const data = await res.json();
        const formattedKpis: MobileKPI[] = [
          {
            label: 'Revenue',
            value: `$${(data.totalRevenue || 0).toLocaleString()}`,
            icon: <DollarSign className="w-5 h-5" />,
            color: 'bg-blue-500',
          },
          {
            label: 'Orders',
            value: (data.totalOrders || 0).toString(),
            icon: <ShoppingCart className="w-5 h-5" />,
            color: 'bg-green-500',
          },
          {
            label: 'Stock',
            value: (data.inventoryValue || 0).toString(),
            icon: <Package className="w-5 h-5" />,
            color: 'bg-purple-500',
          },
          {
            label: 'Growth',
            value: `${(data.revenueChange || 0).toFixed(1)}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'bg-orange-500',
          },
        ];
        setKpis(formattedKpis);
      }
    } catch (error) {
      console.error('Failed to fetch mobile data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back!</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          kpis.map((kpi, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg text-white`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <Button className="w-full justify-start" variant="outline">
          📋 New Order
        </Button>
        <Button className="w-full justify-start" variant="outline">
          📦 Check Stock
        </Button>
        <Button className="w-full justify-start" variant="outline">
          💰 View Invoices
        </Button>
        <Button className="w-full justify-start" variant="outline">
          👥 Customers
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-medium text-sm">Order #ORD001</p>
                <p className="text-xs text-gray-600">Today at 10:30 AM</p>
              </div>
              <span className="text-sm font-semibold">$5,000</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-medium text-sm">Invoice #INV001</p>
                <p className="text-xs text-gray-600">Yesterday</p>
              </div>
              <span className="text-sm font-semibold">$3,500</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Stock Updated</p>
                <p className="text-xs text-gray-600">2 days ago</p>
              </div>
              <span className="text-sm font-semibold">+150 units</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

