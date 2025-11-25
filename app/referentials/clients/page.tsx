"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ClientDialog } from "@/components/referentials/client-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface Client {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  city?: string;
}

export default function ClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/referentials/clients?groupId=${(session as any)?.user?.groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setClients(data.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingClient
        ? `/api/referentials/clients/${editingClient.id}`
        : "/api/referentials/clients";

      const method = editingClient ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: (session as any)?.user?.groupId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingClient(null);
        fetchClients();
      }
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleDelete = async (client: Client) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await fetch(
          `/api/referentials/clients/${client.id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchClients();
        }
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  const columns = [
    { key: "code" as const, label: "Code" },
    { key: "name" as const, label: "Name" },
    { key: "email" as const, label: "Email" },
    { key: "phone" as const, label: "Phone" },
    { key: "city" as const, label: "City" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clients Management</h1>
        <Button onClick={() => {
          setEditingClient(null);
          setShowForm(true);
        }}>
          Add Client
        </Button>
      </div>

      <Card className="p-6">
        <DataTable
          data={clients}
          columns={columns}
          onEdit={(client) => {
            setEditingClient(client);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingClient(null);
            setShowForm(true);
          }}
          searchField="name"
        />
      </Card>

      <ClientDialog
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingClient || undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

