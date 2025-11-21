'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, AlertCircle, Zap } from 'lucide-react';

interface StorageStats {
  quota: {
    totalQuota: number;
    usedSpace: number;
    fileCount: number;
  } | null;
  usagePercentage: number;
  remainingSpace: number;
  averageFileSize: number;
}

export default function StoragePage() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [newQuotaSize, setNewQuotaSize] = useState('');

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const fetchStorageStats = async () => {
    try {
      const response = await fetch('/api/storage/quota');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeQuota = async () => {
    if (!newQuotaSize) {
      alert('Please enter a quota size');
      return;
    }

    try {
      const response = await fetch('/api/storage/quota?action=upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newQuotaSize: parseInt(newQuotaSize) }),
      });

      if (!response.ok) throw new Error('Failed to upgrade');
      await fetchStorageStats();
      setShowUpgradeForm(false);
      setNewQuotaSize('');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upgrade quota');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="p-8">Loading storage information...</div>;
  }

  if (!stats || !stats.quota) {
    return <div className="p-8">Storage information not available</div>;
  }

  const usagePercentage = stats.usagePercentage;
  const isNearLimit = usagePercentage > 80;

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HardDrive className="h-8 w-8" />
            Storage Management
          </h1>
          <p className="text-gray-600">Monitor and manage your storage quota</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Total Usage</span>
              <span className="text-sm font-semibold">{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  isNearLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Used Space</p>
              <p className="text-2xl font-bold">{formatBytes(stats.quota.usedSpace)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold">{formatBytes(stats.remainingSpace)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Quota</p>
              <p className="text-2xl font-bold">{formatBytes(stats.quota.totalQuota)}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">File Count</p>
              <p className="text-2xl font-bold">{stats.quota.fileCount}</p>
            </div>
          </div>

          {isNearLimit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Storage Limit Warning</p>
                <p className="text-sm text-red-700">You are using {usagePercentage.toFixed(1)}% of your storage quota. Consider upgrading.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Average File Size</p>
              <p className="text-xl font-semibold">{formatBytes(stats.averageFileSize)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Files Stored</p>
              <p className="text-xl font-semibold">{stats.quota.fileCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quota Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showUpgradeForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Quota Size (bytes)</label>
                <input
                  type="number"
                  value={newQuotaSize}
                  onChange={(e) => setNewQuotaSize(e.target.value)}
                  placeholder="e.g., 21474836480 for 20GB"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpgradeQuota}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
                <Button variant="outline" onClick={() => setShowUpgradeForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowUpgradeForm(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Storage Quota
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

