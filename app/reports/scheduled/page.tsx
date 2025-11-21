'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Clock } from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  type: 'sales' | 'inventory' | 'financial';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  enabled: boolean;
  nextRun?: Date;
}

export default function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'sales' as const,
    frequency: 'weekly' as const,
    recipients: '',
    enabled: true,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports/scheduled');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!formData.name || !formData.recipients) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/reports/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipients: formData.recipients.split(',').map(r => r.trim()),
        }),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newReport = await response.json();
      setReports([...reports, newReport]);
      setShowForm(false);
      setFormData({
        name: '',
        type: 'sales',
        frequency: 'weekly',
        recipients: '',
        enabled: true,
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create scheduled report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/reports/scheduled?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setReports(reports.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete report');
    }
  };

  const handleToggleReport = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/reports/scheduled', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: id,
          enabled: !enabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      const updated = await response.json();
      setReports(reports.map(r => r.id === id ? updated : r));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading scheduled reports...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Reports</h1>
          <p className="text-gray-600">Manage automated report generation</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Scheduled Report
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Scheduled Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Sales Report"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="sales">Sales</option>
                  <option value="inventory">Inventory</option>
                  <option value="financial">Financial</option>
                </select>
              </div>

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
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipients (comma-separated emails)</label>
              <input
                type="text"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="user@example.com, admin@example.com"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateReport}>Create Report</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No scheduled reports yet</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{report.name}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>Type: {report.type}</span>
                      <span>Frequency: {report.frequency}</span>
                      <span>Recipients: {report.recipients.length}</span>
                      {report.nextRun && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Next: {new Date(report.nextRun).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={report.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleReport(report.id, report.enabled)}
                    >
                      {report.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteReport(report.id)}
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

