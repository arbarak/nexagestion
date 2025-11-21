'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, Play, Settings } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: any[];
  enabled: boolean;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    steps: [],
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!formData.name) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newWorkflow = await response.json();
      setWorkflows([...workflows, newWorkflow]);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        trigger: 'manual',
        steps: [],
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create workflow');
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/workflows?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setWorkflows(workflows.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete workflow');
    }
  };

  const handleToggleWorkflow = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: id,
          enabled: !enabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to update');
      const updated = await response.json();
      setWorkflows(workflows.map(w => w.id === id ? updated : w));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading workflows...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-gray-600">Create and manage automated workflows</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Workflow Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Order Approval Workflow"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this workflow does"
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trigger</label>
              <select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="manual">Manual</option>
                <option value="event">Event-based</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No workflows yet</p>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{workflow.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>Trigger: {workflow.trigger}</span>
                      <span>Steps: {workflow.steps.length}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={workflow.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleWorkflow(workflow.id, workflow.enabled)}
                    >
                      {workflow.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
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

