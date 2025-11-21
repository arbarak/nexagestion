'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ComplianceStatus {
  frameworks: number;
  totalRequirements: number;
  compliantRequirements: number;
  averageCompliance: number;
}

export default function ComplianceFrameworksPage() {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceStatus();
  }, []);

  const fetchComplianceStatus = async () => {
    try {
      const response = await fetch('/api/compliance/frameworks?action=status');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading compliance information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="h-8 w-8" />
            Compliance Frameworks
          </h1>
          <p className="text-gray-600">Manage compliance requirements and frameworks</p>
        </div>
        <Button>
          Create Framework
        </Button>
      </div>

      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Frameworks</p>
                <p className="text-2xl font-bold">{status.frameworks}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Requirements</p>
                <p className="text-2xl font-bold">{status.totalRequirements}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-2xl font-bold">{status.compliantRequirements}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold">{status.averageCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'ISO 27001'].map((framework) => (
              <div key={framework} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{framework}</h3>
                  <p className="text-sm text-gray-600">Compliance framework</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirement Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Compliant Requirements</span>
              <span className="ml-auto font-semibold">{status?.compliantRequirements || 0}</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Non-Compliant Requirements</span>
              <span className="ml-auto font-semibold">
                {status ? status.totalRequirements - status.compliantRequirements : 0}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>In-Progress Requirements</span>
              <span className="ml-auto font-semibold">0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {status && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Compliance</span>
                <span className="text-sm font-semibold">{status.averageCompliance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-green-500 transition-all"
                  style={{ width: `${status.averageCompliance}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

