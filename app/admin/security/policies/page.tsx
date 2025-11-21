'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecurityMetrics {
  totalAudits: number;
  failedAttempts: number;
  successfulActions: number;
  uniqueUsers: number;
}

export default function SecurityPoliciesPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPolicyForm, setShowPolicyForm] = useState(false);

  useEffect(() => {
    fetchSecurityMetrics();
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch('/api/security/policies?action=metrics');
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
    return <div className="p-8">Loading security information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Policies
          </h1>
          <p className="text-gray-600">Manage security policies and settings</p>
        </div>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Security Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Audits</p>
                <p className="text-2xl font-bold">{metrics.totalAudits}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Failed Attempts</p>
                <p className="text-2xl font-bold">{metrics.failedAttempts}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Successful Actions</p>
                <p className="text-2xl font-bold">{metrics.successfulActions}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold">{metrics.uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Minimum 12 characters required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Uppercase letters required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Numbers required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Special characters required</span>
            </div>
          </div>
          <Button variant="outline">Edit Policy</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">Session Timeout</p>
            <p className="text-xl font-semibold">1 hour</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600">Multi-Factor Authentication</p>
            <p className="text-xl font-semibold">Disabled</p>
          </div>
          <Button variant="outline">Configure</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IP Whitelist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">No IP addresses whitelisted</p>
          <Button variant="outline">Add IP Address</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics && metrics.failedAttempts > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">Failed Login Attempts</p>
                  <p className="text-sm text-red-700">{metrics.failedAttempts} failed attempts detected</p>
                </div>
              </div>
            )}
            {metrics && metrics.failedAttempts === 0 && (
              <p className="text-gray-600">No security alerts</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

