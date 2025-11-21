'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  type: 'full' | 'incremental';
  retentionDays: number;
  enabled: boolean;
  nextRun: Date;
}

export default function BackupSchedulesPage() {
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily' as const,
    type: 'full' as const,
    retentionDays: 30,
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/backups/management?action=schedules');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    if (!formData.name) {
      alert('Please enter a schedule name');
      return;
    }

    try {
      const response = await fetch('/api/backups/management?action=create-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      setShowForm(false);
      setFormData({ name: '', frequency: 'daily', type: 'full', retentionDays: 30 });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;

    try {
      const response = await fetch(`/api/backups/management?scheduleId=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setSchedules(schedules.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete schedule');
    }
  };

  if (loading) {
    return <div className="p-8">Loading schedules...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backup Schedules</h1>
          <p className="text-gray-600">Configure automatic backup schedules</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          Create Schedule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Schedule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Daily Full Backup"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="full">Full</option>
                  <option value="incremental">Incremental</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Retention (days)</label>
              <input
                type="number"
                value={formData.retentionDays}
                onChange={(e) => setFormData({ ...formData, retentionDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateSchedule}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No schedules configured</p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{schedule.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Frequency: {schedule.frequency}</p>
                      <p>Type: {schedule.type}</p>
                      <p>Retention: {schedule.retentionDays} days</p>
                      <p>Next Run: {new Date(schedule.nextRun).toLocaleString()}</p>
                      <p>Status: {schedule.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
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

