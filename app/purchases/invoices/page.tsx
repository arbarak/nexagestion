"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  supplier?: { name: string };
}

export default function PurchaseInvoicesPage() {
  const { data: session } = useSafeSession();
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, suppliersRes] = await Promise.all([
        fetch(
          `/api/purchases/invoices?groupId=${(session as any)?.user?.groupId}&companyId=${(session as any)?.user?.companyId}`
        ),
        fetch(
          `/api/referentials/suppliers?groupId=${(session as any)?.user?.groupId}`
        ),
      ]);

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setInvoices(data.data);
      }
      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingInvoice
        ? `/api/purchases/invoices/${editingInvoice.id}`
        : "/api/purchases/invoices";

      const method = editingInvoice ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: (session as any)?.user?.groupId,
          companyId: (session as any)?.user?.companyId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingInvoice(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const handleDelete = async (invoice: PurchaseInvoice) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        const response = await fetch(`/api/purchases/invoices/${invoice.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
      }
    }
  };

  const columns = [
    { key: "invoiceNumber" as const, label: "Invoice #" },
    { key: "invoiceDate" as const, label: "Date" },
    {
      key: "supplier" as const,
      label: "Supplier",
      render: (value: any) => value?.name || "-",
    },
    { key: "status" as const, label: "Status" },
    { key: "totalAmount" as const, label: "Total" },
    { key: "paidAmount" as const, label: "Paid" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Purchase Invoices</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingInvoice ? "Edit Invoice" : "New Purchase Invoice"}
            fields={[
              { name: "invoiceNumber", label: "Invoice #", required: true },
              {
                name: "supplierId",
                label: "Supplier",
                type: "select",
                required: true,
                options: suppliers.map((s) => ({ value: s.id, label: s.name })),
              },
              { name: "invoiceDate", label: "Invoice Date", type: "text", required: true },
              { name: "dueDate", label: "Due Date", type: "text", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "DRAFT", label: "Draft" },
                  { value: "RECEIVED", label: "Received" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "PAID", label: "Paid" },
                  { value: "CANCELLED", label: "Cancelled" },
                ],
              },
              { name: "paidAmount", label: "Paid Amount", type: "number" },
              { name: "notes", label: "Notes" },
            ]}
            initialData={editingInvoice || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingInvoice(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={invoices}
            columns={columns}
            onEdit={(invoice) => {
              setEditingInvoice(invoice);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="invoiceNumber"
          />
        </Card>
      )}
    </div>
  );
}

