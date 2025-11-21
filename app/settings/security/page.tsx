'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const backupRes = await fetch('/api/backup');
      if (backupRes.ok) {
        setBackups(await backupRes.json());
      }
    } catch (error) {
      console.error('Failed to fetch security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'email' }),
      });
      if (res.ok) {
        setTwoFAEnabled(true);
      }
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full', description: 'Manual backup' }),
      });
      if (res.ok) {
        fetchSecuritySettings();
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-gray-600 mt-2">Manage security and compliance settings</p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <Badge variant={twoFAEnabled ? 'default' : 'secondary'}>
              {twoFAEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleEnable2FA} disabled={twoFAEnabled}>
            {twoFAEnabled ? 'Already Enabled' : 'Enable 2FA'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Encryption */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <CardTitle>Data Encryption</CardTitle>
          </div>
          <CardDescription>All sensitive data is encrypted at rest and in transit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">✅ AES-256 encryption for sensitive data</p>
            <p className="text-sm">✅ TLS 1.3 for data in transit</p>
            <p className="text-sm">✅ Secure key management</p>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Recovery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Backup & Recovery</CardTitle>
            </div>
            <Button size="sm" onClick={handleCreateBackup}>
              Create Backup
            </Button>
          </div>
          <CardDescription>Manage database backups and recovery</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading backups...</div>
          ) : (
            <div className="space-y-4">
              {backups.length === 0 ? (
                <p className="text-sm text-gray-600">No backups yet</p>
              ) : (
                <div className="space-y-2">
                  {backups.map((backup) => (
                    <div key={backup.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{backup.type.toUpperCase()} Backup</p>
                        <p className="text-xs text-gray-600">{new Date(backup.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                        {backup.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-orange-900">Security Recommendations</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-orange-800">• Enable two-factor authentication for all users</p>
          <p className="text-sm text-orange-800">• Review access logs regularly</p>
          <p className="text-sm text-orange-800">• Update passwords every 90 days</p>
          <p className="text-sm text-orange-800">• Create regular backups</p>
        </CardContent>
      </Card>
    </div>
  );
}

