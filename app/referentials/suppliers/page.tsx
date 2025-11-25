"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { SupplierDialog } from "@/components/referentials/supplier-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface Supplier {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  city?: string;
  isForeign: boolean;
  defaultCurrency: "MAD" | "EUR";
}

export default function SuppliersPage() {
  const { data: session } = useSafeSession();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/referentials/suppliers?groupId=${(session as any)?.user?.groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingSupplier
        ? `/api/referentials/suppliers/${editingSupplier.id}`
        : "/api/referentials/suppliers";

      const method = editingSupplier ? "PATCH" : "POST";

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
        setEditingSupplier(null);
        fetchSuppliers();
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        const response = await fetch(
          `/api/referentials/suppliers/${supplier.id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchSuppliers();
        }
      } catch (error) {
        console.error("Error deleting supplier:", error);
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
        <h1 className="text-3xl font-bold">Suppliers Management</h1>
        <Button onClick={() => {
          setEditingSupplier(null);
          setShowForm(true);
        }}>
          Add Supplier
        </Button>
      </div>

      <Card className="p-6">
        <DataTable
          data={suppliers}
          columns={columns}
          onEdit={(supplier) => {
            setEditingSupplier(supplier);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onAdd={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          searchField="name"
        />
      </Card>

      <SupplierDialog
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingSupplier || undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

