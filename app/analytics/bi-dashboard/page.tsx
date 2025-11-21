'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, AlertCircle } from 'lucide-react';

interface MetricCard {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export default function BIDashboard() {
  const [salesData, setSalesData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [sales, inventory, financial] = await Promise.all([
          fetch('/api/analytics/sales?days=90').then(r => r.json()),
          fetch('/api/analytics/inventory').then(r => r.json()),
          fetch('/api/analytics/financial').then(r => r.json()),
        ]);

        setSalesData(sales);
        setInventoryData(inventory);
        setFinancialData(financial);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8">Loading BI Dashboard...</div>;
  }

  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: salesData?.totalRevenue?.value || 0,
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Total Orders',
      value: salesData?.totalOrders?.value || 0,
      change: 8.2,
      trend: 'up',
      icon: <ShoppingCart className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Stock Value',
      value: inventoryData?.stockValue?.value || 0,
      change: -3.1,
      trend: 'down',
      icon: <Package className="h-6 w-6 text-purple-600" />,
    },
    {
      title: 'Low Stock Items',
      value: inventoryData?.lowStockItems?.value || 0,
      change: 5.0,
      trend: 'down',
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
    },
  ];

  const chartData = [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 221 },
    { month: 'Mar', revenue: 2000, orders: 229 },
    { month: 'Apr', revenue: 2780, orders: 200 },
    { month: 'May', revenue: 1890, orders: 229 },
    { month: 'Jun', revenue: 2390, orders: 200 },
  ];

  const pieData = [
    { name: 'Draft', value: 400 },
    { name: 'Pending', value: 300 },
    { name: 'Confirmed', value: 300 },
    { name: 'Shipped', value: 200 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
        <p className="text-gray-600">Real-time analytics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold mt-2">${metric.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {metric.change}%
                    </span>
                  </div>
                </div>
                {metric.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">Product {i}</span>
                  <span className="font-semibold">${(1000 * i).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">Client {i}</span>
                  <span className="font-semibold">${(5000 * i).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">Revenue</span>
                <span className="font-semibold text-green-600">${(financialData?.totalRevenue?.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-red-50 rounded">
                <span className="text-sm">A/R</span>
                <span className="font-semibold text-red-600">${(financialData?.accountsReceivable?.value || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm">Net Profit</span>
                <span className="font-semibold text-blue-600">${(financialData?.netProfit?.value || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

