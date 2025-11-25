"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { ReferentialForm } from "@/components/referential-form";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface Vessel {
  id: string;
  vesselName: string;
  imoNumber: string;
  vesselType: string;
  status: string;
  grossTonnage: number;
}

export default function VesselsPage() {
  const { data: session } = useSession();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/maritime/vessels?groupId=${(session as any)?.user?.groupId}`
      );

      if (response.ok) {
        const data = await response.json();
        setVessels(data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const url = editingVessel
        ? `/api/maritime/vessels/${editingVessel.id}`
        : "/api/maritime/vessels";

      const method = editingVessel ? "PATCH" : "POST";

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
        setEditingVessel(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error saving vessel:", error);
    }
  };

  const handleDelete = async (vessel: Vessel) => {
    if (confirm("Are you sure you want to delete this vessel?")) {
      try {
        const response = await fetch(`/api/maritime/vessels/${vessel.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting vessel:", error);
      }
    }
  };

  const columns = [
    { key: "vesselName" as const, label: "Vessel Name" },
    { key: "imoNumber" as const, label: "IMO #" },
    { key: "vesselType" as const, label: "Type" },
    { key: "status" as const, label: "Status" },
    { key: "grossTonnage" as const, label: "GT" },
  ];

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Vessel Management</h1>

      {showForm ? (
        <Card className="p-6">
          <ReferentialForm
            title={editingVessel ? "Edit Vessel" : "New Vessel"}
            fields={[
              { name: "vesselName", label: "Vessel Name", required: true },
              { name: "imoNumber", label: "IMO Number", required: true },
              {
                name: "vesselType",
                label: "Vessel Type",
                type: "select",
                required: true,
                options: [
                  { value: "CONTAINER", label: "Container" },
                  { value: "BULK", label: "Bulk Carrier" },
                  { value: "TANKER", label: "Tanker" },
                  { value: "GENERAL", label: "General Cargo" },
                  { value: "RO_RO", label: "RoRo" },
                ],
              },
              { name: "flag", label: "Flag", required: true },
              { name: "grossTonnage", label: "Gross Tonnage", type: "number", required: true },
              { name: "netTonnage", label: "Net Tonnage", type: "number", required: true },
              { name: "deadweightTonnage", label: "DWT", type: "number", required: true },
              { name: "yearBuilt", label: "Year Built", type: "number", required: true },
              {
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                options: [
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "MAINTENANCE", label: "Maintenance" },
                  { value: "RETIRED", label: "Retired" },
                ],
              },
            ]}
            initialData={editingVessel || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingVessel(null);
            }}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={vessels}
            columns={columns}
            onEdit={(vessel) => {
              setEditingVessel(vessel);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
            searchField="vesselName"
          />
        </Card>
      )}
    </div>
  );
}

