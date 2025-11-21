"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";

export default function JournalEntriesPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      const response = await fetch(
        `/api/financial/journal-entries?companyId=${session?.user?.companyId}`
      );
      if (response.ok) {
        const result = await response.json();
        setEntries(result.data);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchEntries();
    }
  }, [session]);

  const handleCreateEntry = async () => {
    // This would open a modal for creating complex journal entries
    console.log("Create new journal entry");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Journal Entries</h1>
        <Button onClick={handleCreateEntry}>+ New Entry</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <DataTable
              data={entries}
              columns={[
                { key: "reference", label: "Reference" },
                { key: "description", label: "Description" },
                { key: "entryDate", label: "Date" },
              ]}
              searchField="reference"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

