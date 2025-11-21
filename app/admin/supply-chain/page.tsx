'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Package, AlertCircle, TrendingUp } from 'lucide-react';

interface SupplyChainMetrics {
  totalSuppliers: number;
  activeSuppliers: number;
  totalOrders: number;
  pendingOrders: number;
  totalShipments: number;
  inTransitShipments: number;
  averageLeadTime: number;
}

export default function SupplyChainPage() {
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplyChainMetrics();
  }, []);

  const fetchSupplyChainMetrics = async () => {
    try {
      const response = await fetch('/api/supply-chain?action=metrics');
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
    return <div className="p-8">Loading supply chain information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Supply Chain Management
          </h1>
          <p className="text-gray-600">Manage suppliers, orders, and shipments</p>
        </div>
        <Button>Create Order</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-2xl font-bold">{metrics.totalSuppliers}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeSuppliers}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Shipments</p>
                <p className="text-2xl font-bold">{metrics.totalShipments}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold">{metrics.inTransitShipments}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Lead Time</p>
                <p className="text-2xl font-bold">{metrics.averageLeadTime.toFixed(0)}d</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Supplier Management</h3>
                <p className="text-sm text-gray-600">Manage supplier information and ratings</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Purchase Orders</h3>
                <p className="text-sm text-gray-600">Create and track purchase orders</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Shipment Tracking</h3>
                <p className="text-sm text-gray-600">Track shipments and deliveries</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Inventory Management</h3>
                <p className="text-sm text-gray-600">Monitor inventory levels and reorders</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.pendingOrders > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Action Required</p>
                <p className="text-sm text-yellow-700">{metrics.pendingOrders} orders pending confirmation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

