"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";

interface AuditLog {
  id: string;
  [key: string]: any;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/audit-logs?limit=200");
      if (response.ok) {
        const result = await response.json();
        setLogs(result.data);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-600 mt-2">
          Track all system activities and changes for compliance and security
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <DataTable
              data={logs}
              columns={[
                { key: "action", label: "Action" },
                { key: "module", label: "Module" },
                { key: "entityType", label: "Entity Type" },
                { key: "user.email", label: "User" },
                { key: "createdAt", label: "Timestamp" },
              ]}
              searchField="action"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

