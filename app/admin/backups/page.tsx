'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  size: number;
  location: string;
  createdAt: Date;
  completedAt?: Date;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'full' as const,
  });

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/backups/management');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!formData.name) {
      alert('Please enter a backup name');
      return;
    }

    try {
      const response = await fetch('/api/backups/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newBackup = await response.json();
      setBackups([...backups, newBackup]);
      setShowForm(false);
      setFormData({ name: '', type: 'full' });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create backup');
    }
  };

  const handleDeleteBackup = async (id: string) => {
    if (!confirm('Delete this backup?')) return;

    try {
      const response = await fetch(`/api/backups/management?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setBackups(backups.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete backup');
    }
  };

  const handleRestoreBackup = async (id: string) => {
    if (!confirm('Restore from this backup? This will overwrite current data.')) return;

    try {
      const response = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId: id }),
      });

      if (!response.ok) throw new Error('Failed to restore');
      alert('Restore initiated successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to restore backup');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="p-8">Loading backups...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backups & Recovery</h1>
          <p className="text-gray-600">Manage database backups and restore points</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          Create Backup
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Backup Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Daily Backup"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Backup Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="full">Full Backup</option>
                <option value="incremental">Incremental</option>
                <option value="differential">Differential</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateBackup}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {backups.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No backups yet</p>
            </CardContent>
          </Card>
        ) : (
          backups.map((backup) => (
            <Card key={backup.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(backup.status)}
                      <h3 className="font-semibold">{backup.name}</h3>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Type: {backup.type}</p>
                      <p>Size: {formatSize(backup.size)}</p>
                      <p>Created: {new Date(backup.createdAt).toLocaleString()}</p>
                      <p>Status: {backup.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={backup.status !== 'completed'}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBackup(backup.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

