'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Play } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  enabled: boolean;
  steps: any[];
  createdAt: string;
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/workflows');
      if (res.ok) {
        setWorkflows(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    const labels: { [key: string]: string } = {
      manual: 'Manual',
      order_created: 'Order Created',
      invoice_created: 'Invoice Created',
      payment_received: 'Payment Received',
    };
    return labels[trigger] || trigger;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-gray-600 mt-2">Automate business processes and tasks</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading workflows...</div>
        ) : workflows.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No workflows yet. Create one to automate your business processes.
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{workflow.name}</CardTitle>
                      <Badge variant={workflow.enabled ? 'default' : 'secondary'}>
                        {workflow.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm">
                  <span className="text-gray-600">Trigger: <span className="font-medium">{getTriggerLabel(workflow.trigger)}</span></span>
                  <span className="text-gray-600">Steps: <span className="font-medium">{workflow.steps.length}</span></span>
                  <span className="text-gray-600">Created: <span className="font-medium">{new Date(workflow.createdAt).toLocaleDateString()}</span></span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

