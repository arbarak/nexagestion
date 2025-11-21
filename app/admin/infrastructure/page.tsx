'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Download, HardDrive, Zap } from 'lucide-react';

interface Deployment {
  id: string;
  version: string;
  environment: string;
  status: string;
  deployedAt: string;
  user: { firstName: string; lastName: string };
}

interface Backup {
  id: string;
  type: string;
  status: string;
  size: string;
  createdAt: string;
}

export default function InfrastructurePage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deploymentsRes, backupsRes] = await Promise.all([
          fetch('/api/deployments?limit=10'),
          fetch('/api/backups?limit=10'),
        ]);

        const deploymentsData = await deploymentsRes.json();
        const backupsData = await backupsRes.json();

        setDeployments(deploymentsData);
        setBackups(backupsData.backups || []);
      } catch (error) {
        console.error('Failed to fetch infrastructure data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeploy = async () => {
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0.0',
          environment: 'production',
        }),
      });

      if (response.ok) {
        alert('Deployment initiated successfully');
        // Refresh deployments
        const res = await fetch('/api/deployments?limit=10');
        const data = await res.json();
        setDeployments(data);
      }
    } catch (error) {
      console.error('Failed to deploy:', error);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full' }),
      });

      if (response.ok) {
        alert('Backup initiated successfully');
        // Refresh backups
        const res = await fetch('/api/backups?limit=10');
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Failed to backup:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading infrastructure data...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Infrastructure Management</h1>
        <p className="text-gray-600">Manage deployments, backups, and infrastructure</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleDeploy} className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Deploy to Production
        </Button>
        <Button onClick={handleBackup} variant="outline" className="flex items-center gap-2">
          <HardDrive className="h-4 w-4" />
          Create Backup
        </Button>
      </div>

      {/* Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">v{deployment.version}</p>
                  <p className="text-sm text-gray-600">
                    {deployment.user.firstName} {deployment.user.lastName} • {deployment.environment}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {deployment.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : deployment.status === 'failed' ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <Zap className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className="text-sm capitalize">{deployment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium capitalize">{backup.type} Backup</p>
                  <p className="text-sm text-gray-600">{backup.size}</p>
                </div>
                <div className="flex items-center gap-2">
                  {backup.status === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

