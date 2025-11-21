'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Headphones, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}

export default function SupportTicketsPage() {
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportMetrics();
  }, []);

  const fetchSupportMetrics = async () => {
    try {
      const response = await fetch('/api/support/tickets?action=metrics');
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
    return <div className="p-8">Loading support information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Headphones className="h-8 w-8" />
            Support Tickets
          </h1>
          <p className="text-gray-600">Manage customer support tickets and inquiries</p>
        </div>
        <Button>Create Ticket</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Support Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">{metrics.totalTickets}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">{metrics.openTickets}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{metrics.resolvedTickets}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">{metrics.averageResolutionTime}h</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{metrics.customerSatisfaction}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ticket Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Open Tickets</h3>
                <p className="text-sm text-gray-600">View and manage open support tickets</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">In Progress</h3>
                <p className="text-sm text-gray-600">Tickets being worked on</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Resolved Tickets</h3>
                <p className="text-sm text-gray-600">Completed support tickets</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Headphones className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Knowledge Base</h3>
                <p className="text-sm text-gray-600">Self-service help articles</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      {metrics && metrics.openTickets > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-orange-900">Pending Tickets</p>
                <p className="text-sm text-orange-700">{metrics.openTickets} tickets awaiting response</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

