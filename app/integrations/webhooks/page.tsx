"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table";

interface Webhook {
  id: string;
  [key: string]: any;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  });

  const availableEvents = [
    "order.created",
    "order.updated",
    "order.cancelled",
    "invoice.created",
    "payment.received",
    "stock.low",
    "user.created",
  ];

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks");
      if (response.ok) {
        const result = await response.json();
        setWebhooks(result.data);
      }
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreateWebhook = async () => {
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: session?.user?.groupId,
          companyId: session?.user?.companyId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ name: "", url: "", events: [] });
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Error creating webhook:", error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (confirm("Are you sure you want to delete this webhook?")) {
      try {
        const response = await fetch(`/api/webhooks/${webhookId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchWebhooks();
        }
      } catch (error) {
        console.error("Error deleting webhook:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <Button onClick={() => setShowForm(true)}>+ Create Webhook</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Order Notification"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com/webhook"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableEvents.map((event) => (
                  <label key={event} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            events: [...formData.events, event],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            events: formData.events.filter((ev) => ev !== event),
                          });
                        }
                      }}
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateWebhook}>Create Webhook</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", url: "", events: [] });
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
          <CardTitle>Active Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <DataTable
              data={webhooks}
              columns={[
                { key: "name", label: "Name" },
                { key: "url", label: "URL" },
                { key: "active", label: "Status" },
                { key: "createdAt", label: "Created" },
              ]}
              onDelete={(webhook) => handleDelete(webhook.id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

