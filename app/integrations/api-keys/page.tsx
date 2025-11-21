"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table";

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", permissions: [] });

  const fetchApiKeys = async () => {
    try {
      const response = await fetch(
        `/api/api-keys?companyId=${session?.user?.companyId}`
      );
      if (response.ok) {
        const result = await response.json();
        setApiKeys(result.data);
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchApiKeys();
    }
  }, [session]);

  const handleCreateKey = async () => {
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: session?.user?.groupId,
          companyId: session?.user?.companyId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`API Key created: ${result.data.key}\n\nSave this key securely!`);
        setShowForm(false);
        setFormData({ name: "", permissions: [] });
        fetchApiKeys();
      }
    } catch (error) {
      console.error("Error creating API key:", error);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      try {
        const response = await fetch(`/api/api-keys/${keyId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchApiKeys();
        }
      } catch (error) {
        console.error("Error deleting API key:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <Button onClick={() => setShowForm(true)}>+ Create API Key</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Mobile App Integration"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateKey}>Create Key</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", permissions: [] });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <DataTable
              data={apiKeys}
              columns={[
                { key: "name", label: "Name" },
                { key: "active", label: "Status" },
                { key: "createdAt", label: "Created" },
                { key: "lastUsedAt", label: "Last Used" },
              ]}
              onDelete={(key) => handleDelete(key.id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

