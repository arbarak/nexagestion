"use client";

export const dynamic = "force-dynamic";

import { useSafeSession } from "@/lib/use-safe-session";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ReferentialForm, type FormField } from "@/components/referential-form";
import { useSession } from "next-auth/react";

interface Account {
  id: string;
  [key: string]: any;
}

export default function AccountsPage() {
  const { data: session } = useSafeSession();
  const sessionUser = (session as any)?.user;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/financial/accounts");
      if (response.ok) {
        const result = await response.json();
        setAccounts(result.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingAccount
        ? `/api/financial/accounts/${editingAccount.id}`
        : "/api/financial/accounts";

      const method = editingAccount ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          groupId: sessionUser?.groupId,
          companyId: sessionUser?.companyId,
        }),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingAccount(null);
        fetchAccounts();
      }
    } catch (error) {
      console.error("Error saving account:", error);
    }
  };

  const handleDelete = async (account: any) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        const response = await fetch(`/api/financial/accounts/${account.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchAccounts();
        }
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  const fields: FormField[] = [
    { name: "accountCode", label: "Account Code", type: "text", required: true },
    { name: "accountName", label: "Account Name", type: "text", required: true },
    {
      name: "accountType",
      label: "Account Type",
      type: "select",
      options: [
        { value: "ASSET", label: "ASSET" },
        { value: "LIABILITY", label: "LIABILITY" },
        { value: "EQUITY", label: "EQUITY" },
        { value: "REVENUE", label: "REVENUE" },
        { value: "EXPENSE", label: "EXPENSE" },
      ],
      required: true,
    },
    { name: "balance", label: "Balance", type: "number", required: true },
    { name: "currency", label: "Currency", type: "text", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "ACTIVE", label: "ACTIVE" },
        { value: "INACTIVE", label: "INACTIVE" },
        { value: "ARCHIVED", label: "ARCHIVED" },
      ],
      required: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chart of Accounts</h1>
        <Button onClick={() => setShowForm(true)}>+ New Account</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAccount ? "Edit Account" : "Create New Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReferentialForm
              title={editingAccount ? "Edit Account" : "Create New Account"}
              fields={fields}
              initialData={editingAccount || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAccount(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Accounts List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <DataTable
              data={accounts}
              columns={[
                { key: "accountCode", label: "Code" },
                { key: "accountName", label: "Name" },
                { key: "accountType", label: "Type" },
                { key: "balance", label: "Balance" },
                { key: "status", label: "Status" },
              ]}
              onEdit={(account) => {
                setEditingAccount(account);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
