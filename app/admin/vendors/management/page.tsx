'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Star, TrendingUp, CheckCircle } from 'lucide-react';

interface VendorMetrics {
  totalVendors: number;
  activeVendors: number;
  topRatedVendors: number;
  averageRating: number;
  totalProcurementRequests: number;
  approvedRequests: number;
  totalBudgetAllocated: number;
}

export default function VendorManagementPage() {
  const [metrics, setMetrics] = useState<VendorMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorMetrics();
  }, []);

  const fetchVendorMetrics = async () => {
    try {
      const response = await fetch('/api/vendors/management?action=metrics');
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
    return <div className="p-8">Loading vendor information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Vendor Management
          </h1>
          <p className="text-gray-600">Manage vendors and procurement</p>
        </div>
        <Button>Add Vendor</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{metrics.totalVendors}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeVendors}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Top Rated</p>
                <p className="text-2xl font-bold">{metrics.topRatedVendors}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Requests</p>
                <p className="text-2xl font-bold">{metrics.totalProcurementRequests}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{metrics.approvedRequests}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Budget</p>
                <p className="text-2xl font-bold">${(metrics.totalBudgetAllocated / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vendor Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Vendor Registry</h3>
                <p className="text-sm text-gray-600">Manage vendor information</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-semibold">Vendor Performance</h3>
                <p className="text-sm text-gray-600">Rate and evaluate vendors</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Procurement Requests</h3>
                <p className="text-sm text-gray-600">Create and manage requests</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Vendor Compliance</h3>
                <p className="text-sm text-gray-600">Track vendor compliance</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

