'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, ToggleRight } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: { type: string; conditions: any };
  actions: any[];
  enabled: boolean;
  createdAt: string;
}

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automation-rules');
      if (res.ok) {
        setRules(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automation Rules</h1>
          <p className="text-gray-600 mt-2">Create and manage business automation rules</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading automation rules...</div>
        ) : rules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-600">
              No automation rules yet. Create one to automate your workflows.
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{rule.name}</CardTitle>
                      <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{rule.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <ToggleRight className="w-4 h-4" />
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
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Trigger</p>
                    <p className="text-sm text-gray-600 capitalize">{rule.trigger.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Actions</p>
                    <p className="text-sm text-gray-600">{rule.actions.length} action(s)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-600">{new Date(rule.createdAt).toLocaleDateString()}</p>
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

