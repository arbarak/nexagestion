"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface TaxRate {
  id: string;
  name: string;
  code: string;
  rate: number;
  type: "TVA" | "TSP";
}

export default function TaxRatesPage() {
  const { data: session } = useSession();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);

  useEffect(() => {
    fetchTaxRates();
  }, []);

  const fetchTaxRates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/referentials/tax-rates?groupId=${session?.user?.groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        setTaxRates(data.data);
      }
    } catch (error) {
      console.error("Error fetching tax rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingTaxRate
        ? `/api/referentials/tax-rates/${editingTaxRate.id}`
        : "/api/referentials/tax-rates";

      const method = editingTaxRate ? "PATCH" : "POST";

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
        setEditingTaxRate(null);
        fetchTaxRates();
      }
    } catch (error) {
      console.error("Error saving tax rate:", error);
    }
  };

  const handleDelete = async (taxRate: TaxRate) => {
    if (confirm("Are you sure you want to delete this tax rate?")) {
      try {
        const response = await fetch(
          `/api/referentials/tax-rates/${taxRate.id}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          fetchTaxRates();
        }
      } catch (error) {
        console.error("Error deleting tax rate:", error);
      }
    }
  };

  const columns = [
    { key: "code" as const, label: "Code" },
    { key: "name" as const, label: "Name" },
    { key: "rate" as const, label: "Rate (%)" },
    { key: "type" as const, label: "Type" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Tax Rates Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingTaxRate ? "Edit Tax Rate" : "Add New Tax Rate"}
            fields={[
              { name: "code", label: "Code", required: true },
              { name: "name", label: "Name", required: true },
              { name: "rate", label: "Rate (%)", type: "number", required: true },
              {
                name: "type",
                label: "Type",
                type: "select",
                required: true,
                options: [
                  { value: "TVA", label: "TVA" },
                  { value: "TSP", label: "TSP" },
                ],
              },
            ]}
            initialData={editingTaxRate || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingTaxRate(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={taxRates}
            columns={columns}
            onEdit={(taxRate) => {
              setEditingTaxRate(taxRate);
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

