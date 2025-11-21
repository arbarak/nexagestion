"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Category {
  id: string;
  name: string;
  code: string;
}

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/referentials/categories?groupId=${session?.user?.groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingCategory
        ? `/api/referentials/categories/${editingCategory.id}`
        : "/api/referentials/categories";

      const method = editingCategory ? "PATCH" : "POST";

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
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (category: Category) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(
          `/api/referentials/categories/${category.id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchCategories();
        }
      } catch (error) {
        console.error("Error deleting category:", error);
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
      <h1 className="text-3xl font-bold">Categories Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingCategory ? "Edit Category" : "Add New Category"}
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "name", label: "Name", required: true },
            ]}
            initialData={editingCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={categories}
            columns={columns}
            onEdit={(category) => {
              setEditingCategory(category);
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

