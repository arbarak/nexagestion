'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';

interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  reason?: string;
  requestedByUser: { firstName: string; lastName: string };
  createdAt: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/approvals' : `/api/approvals?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        setApprovals(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-gray-600 mt-2">Review and manage approval requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading approvals...</div>
        ) : approvals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No approvals found.
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(approval.status)}
                    <div>
                      <CardTitle className="text-lg capitalize">{approval.entityType}</CardTitle>
                      <CardDescription>{approval.reason}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(approval.status)}>
                    {approval.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-6 text-sm">
                    <span className="text-gray-600">Requested by: <span className="font-medium">{approval.requestedByUser.firstName} {approval.requestedByUser.lastName}</span></span>
                    <span className="text-gray-600">Date: <span className="font-medium">{new Date(approval.createdAt).toLocaleDateString()}</span></span>
                  </div>
                  {approval.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

