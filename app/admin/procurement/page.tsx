'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, FileText, Package, DollarSign } from 'lucide-react';

interface ProcurementMetrics {
  totalPurchaseOrders: number;
  pendingOrders: number;
  receivedOrders: number;
  totalOrderValue: number;
  averageOrderValue: number;
  totalInvoices: number;
  paidInvoices: number;
  totalInvoiceAmount: number;
}

export default function ProcurementPage() {
  const [metrics, setMetrics] = useState<ProcurementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcurementMetrics();
  }, []);

  const fetchProcurementMetrics = async () => {
    try {
      const response = await fetch('/api/procurement?action=metrics');
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
    return <div className="p-8">Loading procurement information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Procurement
          </h1>
          <p className="text-gray-600">Manage purchase orders and invoices</p>
        </div>
        <Button>Create PO</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Procurement Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total POs</p>
                <p className="text-2xl font-bold">{metrics.totalPurchaseOrders}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Received</p>
                <p className="text-2xl font-bold">{metrics.receivedOrders}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(metrics.totalOrderValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Value</p>
                <p className="text-2xl font-bold">${(metrics.averageOrderValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Invoices</p>
                <p className="text-2xl font-bold">{metrics.totalInvoices}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{metrics.paidInvoices}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Invoice Total</p>
                <p className="text-2xl font-bold">${(metrics.totalInvoiceAmount / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Procurement Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Purchase Orders</h3>
                <p className="text-sm text-gray-600">Create and manage purchase orders</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Goods Receipt</h3>
                <p className="text-sm text-gray-600">Record goods receipt</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Invoices</h3>
                <p className="text-sm text-gray-600">Manage vendor invoices</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Payment Processing</h3>
                <p className="text-sm text-gray-600">Process vendor payments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

