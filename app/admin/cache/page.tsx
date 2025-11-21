'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';

interface CacheStats {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  size: number;
  entries: number;
}

interface CacheKey {
  key: string;
  hits: number;
}

export default function CachePage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [topKeys, setTopKeys] = useState<CacheKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [invalidatePattern, setInvalidatePattern] = useState('');

  useEffect(() => {
    fetchCacheData();
    const interval = setInterval(fetchCacheData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchCacheData = async () => {
    try {
      const [statsRes, keysRes] = await Promise.all([
        fetch('/api/admin/cache?action=stats'),
        fetch('/api/admin/cache?action=top-keys&limit=20'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (keysRes.ok) {
        const data = await keysRes.json();
        setTopKeys(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Clear entire cache?')) return;

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (response.ok) {
        alert('Cache cleared');
        fetchCacheData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to clear cache');
    }
  };

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchCacheData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to cleanup cache');
    }
  };

  const handleInvalidatePattern = async () => {
    if (!invalidatePattern) {
      alert('Please enter a pattern');
      return;
    }

    try {
      const response = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invalidate', pattern: invalidatePattern }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setInvalidatePattern('');
        fetchCacheData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to invalidate pattern');
    }
  };

  if (loading) {
    return <div className="p-8">Loading cache data...</div>;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cache Management</h1>
          <p className="text-gray-600">Monitor and manage application cache</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCacheData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleClearCache}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.entries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatBytes(stats.size)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hit Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.hitRate.toFixed(2)}%</div>
              <p className="text-sm text-gray-600 mt-2">
                Hits: {stats.totalHits} | Misses: {stats.totalMisses}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cache Operations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Invalidate Pattern (regex)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={invalidatePattern}
                onChange={(e) => setInvalidatePattern(e.target.value)}
                placeholder="e.g., ^user:.*"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <Button onClick={handleInvalidatePattern}>Invalidate</Button>
            </div>
          </div>

          <Button variant="outline" onClick={handleCleanup} className="w-full">
            Cleanup Expired Entries
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Cache Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topKeys.length === 0 ? (
              <p className="text-gray-600">No cache entries</p>
            ) : (
              topKeys.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <p className="font-mono text-sm truncate">{item.key}</p>
                  <p className="text-sm font-semibold text-blue-600">{item.hits} hits</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

