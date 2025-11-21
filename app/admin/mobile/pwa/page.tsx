'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface SyncStatus {
  isSyncing: boolean;
  pendingRequests: number;
  syncedRequests: number;
  lastSyncTime?: Date;
}

export default function PWAPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    fetchSyncStatus();
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/pwa/manifest?action=sync-status', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      await fetchSyncStatus();
      alert('Sync completed successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to sync');
    }
  };

  if (loading) {
    return <div className="p-8">Loading PWA information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="h-8 w-8" />
            Progressive Web App
          </h1>
          <p className="text-gray-600">Manage PWA settings and offline sync</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi className="h-6 w-6 text-green-500" />
                <span className="text-lg font-semibold text-green-600">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-6 w-6 text-red-500" />
                <span className="text-lg font-semibold text-red-600">Offline</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {syncStatus && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{syncStatus.pendingRequests}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Synced Requests</p>
                  <p className="text-2xl font-bold">{syncStatus.syncedRequests}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Syncing</p>
                  <p className="text-2xl font-bold">{syncStatus.isSyncing ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {syncStatus.lastSyncTime && (
                <p className="text-sm text-gray-600">
                  Last sync: {new Date(syncStatus.lastSyncTime).toLocaleString()}
                </p>
              )}

              <Button onClick={handleSync} disabled={syncStatus.isSyncing}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            NexaGestion can be installed as a standalone app on your device for quick access and offline functionality.
          </p>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Offline Support - Access your data without internet</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Push Notifications - Stay updated with real-time alerts</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>App Installation - Install as a standalone app</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Automatic Sync - Sync data when connection is restored</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Responsive Design - Works on all devices</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

