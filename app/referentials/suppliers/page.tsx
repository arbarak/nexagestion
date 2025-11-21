"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Supplier {
  id: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  city?: string;
}

export default function SuppliersPage() {
  const { data: session } = useSession();
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
        `/api/referentials/suppliers?groupId=${session?.user?.groupId}`
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
          groupId: session?.user?.groupId,
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
      <h1 className="text-3xl font-bold">Suppliers Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "name", label: "Name", required: true },
              { name: "email", label: "Email", type: "email" },
              { name: "phone", label: "Phone" },
              { name: "address", label: "Address" },
              { name: "city", label: "City" },
              { name: "country", label: "Country" },
              { name: "ice", label: "ICE" },
              { name: "if", label: "IF" },
            ]}
            initialData={editingSupplier || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingSupplier(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={suppliers}
            columns={columns}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="name"
          />
        </Card>
      )}
    </div>
  );
}

