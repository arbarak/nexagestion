"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Brand {
  id: string;
  name: string;
  code: string;
}

export default function BrandsPage() {
  const { data: session } = useSession();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/referentials/brands?groupId=${session?.user?.groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setBrands(data.data);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingBrand
        ? `/api/referentials/brands/${editingBrand.id}`
        : "/api/referentials/brands";

      const method = editingBrand ? "PATCH" : "POST";

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
        setEditingBrand(null);
        fetchBrands();
      }
    } catch (error) {
      console.error("Error saving brand:", error);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      try {
        const response = await fetch(
          `/api/referentials/brands/${brand.id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchBrands();
        }
      } catch (error) {
        console.error("Error deleting brand:", error);
      }
    }
  };

  const columns = [
    { key: "code" as const, label: "Code" },
    { key: "name" as const, label: "Name" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Brands Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingBrand ? "Edit Brand" : "Add New Brand"}
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "name", label: "Name", required: true },
            ]}
            initialData={editingBrand || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingBrand(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={brands}
            columns={columns}
            onEdit={(brand) => {
              setEditingBrand(brand);
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

