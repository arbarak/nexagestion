'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, RotateCw, Eye, EyeOff } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  enabled: boolean;
  lastUsed?: Date;
  createdAt: Date;
}

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    rateLimit: 1000,
  });

  const permissionOptions = [
    'read:orders',
    'write:orders',
    'read:invoices',
    'write:invoices',
    'read:products',
    'write:products',
    'read:reports',
    'write:reports',
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/admin/api-keys');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!formData.name) {
      alert('Please enter a name');
      return;
    }

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create');
      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      setShowForm(false);
      setFormData({ name: '', permissions: [], rateLimit: 1000 });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const response = await fetch(`/api/admin/api-keys?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete API key');
    }
  };

  const handleRotateApiKey = async (id: string) => {
    if (!confirm('Rotate this API key?')) return;

    try {
      const response = await fetch(`/api/admin/api-keys/${id}/rotate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to rotate');
      const updated = await response.json();
      setApiKeys(apiKeys.map(k => k.id === id ? updated : k));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to rotate API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  if (loading) {
    return <div className="p-8">Loading API keys...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-gray-600">Manage API keys and access tokens</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          Create API Key
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Key Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production API Key"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rate Limit (requests/hour)</label>
              <input
                type="number"
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <div className="space-y-2">
                {permissionOptions.map((perm) => (
                  <label key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            permissions: [...formData.permissions, perm],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter(p => p !== perm),
                          });
                        }
                      }}
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateApiKey}>Create Key</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No API keys yet</p>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{key.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Key: {showSecrets[key.id] ? key.key : '••••••••••••••••'}</p>
                      <p>Rate Limit: {key.rateLimit} requests/hour</p>
                      <p>Permissions: {key.permissions.length > 0 ? key.permissions.join(', ') : 'None'}</p>
                      {key.lastUsed && <p>Last Used: {new Date(key.lastUsed).toLocaleString()}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSecrets({ ...showSecrets, [key.id]: !showSecrets[key.id] })}
                    >
                      {showSecrets[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(key.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotateApiKey(key.id)}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteApiKey(key.id)}
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

