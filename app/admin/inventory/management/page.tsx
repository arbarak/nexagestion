'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

interface InventoryMetrics {
  totalItems: number;
  activeItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageInventoryTurnover: number;
  stockAccuracy: number;
}

export default function InventoryManagementPage() {
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryMetrics();
  }, []);

  const fetchInventoryMetrics = async () => {
    try {
      const response = await fetch('/api/inventory/management?action=metrics');
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
    return <div className="p-8">Loading inventory information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Inventory Management
          </h1>
          <p className="text-gray-600">Manage inventory and stock levels</p>
        </div>
        <Button>Add Item</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeItems}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(metrics.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">{metrics.lowStockItems}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold">{metrics.outOfStockItems}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Turnover</p>
                <p className="text-2xl font-bold">{metrics.averageInventoryTurnover.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold">{metrics.stockAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Inventory Items</h3>
                <p className="text-sm text-gray-600">Manage inventory items</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Stock Movements</h3>
                <p className="text-sm text-gray-600">Record stock movements</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Inventory Adjustments</h3>
                <p className="text-sm text-gray-600">Manage adjustments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Inventory Valuation</h3>
                <p className="text-sm text-gray-600">View inventory value</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

