'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface WorkflowExecution {
  id: string;
  workflowId: string;
  entityId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export default function WorkflowExecutions() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'running'>('all');

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      const response = await fetch('/api/workflows/execute');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setExecutions(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredExecutions = filter === 'all'
    ? executions
    : executions.filter(e => e.status === filter);

  if (loading) {
    return <div className="p-8">Loading workflow executions...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Workflow Executions</h1>
        <p className="text-gray-600">Monitor workflow execution history</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All ({executions.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Completed ({executions.filter(e => e.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('running')}
          className={`px-4 py-2 rounded-md ${filter === 'running' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Running ({executions.filter(e => e.status === 'running').length})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-md ${filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Failed ({executions.filter(e => e.status === 'failed').length})
        </button>
      </div>

      <div className="space-y-3">
        {filteredExecutions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No executions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredExecutions.map((execution) => (
            <Card key={execution.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {getStatusIcon(execution.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Workflow {execution.workflowId}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(execution.status)}`}>
                        {execution.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Entity: {execution.entityId} | Step: {execution.currentStep}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Started: {new Date(execution.startedAt).toLocaleString()}
                      {execution.completedAt && ` | Completed: ${new Date(execution.completedAt).toLocaleString()}`}
                    </p>
                    {execution.error && (
                      <p className="text-xs text-red-600 mt-2">Error: {execution.error}</p>
                    )}
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

