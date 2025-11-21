'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Phone, Mail } from 'lucide-react';

interface CRMMetrics {
  totalCustomers: number;
  activeCustomers: number;
  totalLeads: number;
  convertedLeads: number;
  totalInteractions: number;
  averageCustomerValue: number;
}

export default function CustomersPage() {
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCRMMetrics();
  }, []);

  const fetchCRMMetrics = async () => {
    try {
      const response = await fetch('/api/crm/customers?action=metrics');
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
    return <div className="p-8">Loading CRM information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Customer Relationship Management
          </h1>
          <p className="text-gray-600">Manage customers, leads, and interactions</p>
        </div>
        <Button>Add Customer</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>CRM Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{metrics.totalCustomers}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeCustomers}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{metrics.totalLeads}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold">{metrics.convertedLeads}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Interactions</p>
                <p className="text-2xl font-bold">{metrics.totalInteractions}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Value</p>
                <p className="text-2xl font-bold">${metrics.averageCustomerValue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">View All Customers</h3>
                <p className="text-sm text-gray-600">Browse and manage customer database</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Customer Communications</h3>
                <p className="text-sm text-gray-600">Email and message history</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Call Logs</h3>
                <p className="text-sm text-gray-600">Track customer calls and notes</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Customer Analytics</h3>
                <p className="text-sm text-gray-600">Customer insights and trends</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-600">Manage and track sales leads through the pipeline</p>
          <Button>Manage Leads</Button>
        </CardContent>
      </Card>
    </div>
  );
}

