'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ComplianceItem {
  id: string;
  name: string;
  type: string;
  status: string;
  dueDate?: string;
  requirements: string[];
}

export default function CompliancePage() {
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compliance');
      if (res.ok) {
        setCompliance(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch compliance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'non_compliant':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Compliance Management</h1>
          <p className="text-gray-600 mt-2">Track and manage compliance requirements</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Requirement
        </Button>
      </div>

      {/* Compliance Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">GDPR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Compliant</div>
            <p className="text-xs text-gray-600 mt-1">General Data Protection Regulation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ISO 27001</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">In Progress</div>
            <p className="text-xs text-gray-600 mt-1">Information Security Management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SOC 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Planned</div>
            <p className="text-xs text-gray-600 mt-1">Service Organization Control</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Items */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>Track all compliance items and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading compliance items...</div>
          ) : compliance.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No compliance requirements yet. Add one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {compliance.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="mt-1">{getStatusIcon(item.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.type.toUpperCase()}</p>
                    {item.dueDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {item.requirements.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p className="font-medium">Requirements:</p>
                        <ul className="list-disc list-inside">
                          {item.requirements.slice(0, 2).map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                          {item.requirements.length > 2 && (
                            <li>+{item.requirements.length - 2} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

