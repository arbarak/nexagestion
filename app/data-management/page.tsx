"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function DataManagementPage() {
  const { data: session } = useSession();
  const [selectedModule, setSelectedModule] = useState("sales");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [importing, setImporting] = useState(false);

  const modules = [
    { value: "sales", label: "Sales Orders" },
    { value: "purchases", label: "Purchase Orders" },
    { value: "inventory", label: "Inventory" },
    { value: "employees", label: "Employees" },
    { value: "financial", label: "Financial Accounts" },
  ];

  const formats = [
    { value: "csv", label: "CSV" },
    { value: "json", label: "JSON" },
    { value: "xlsx", label: "Excel (XLSX)" },
  ];

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: selectedModule,
          format: selectedFormat,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedModule}-export.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let data: any[] = [];

      if (file.name.endsWith(".csv")) {
        const lines = text.split("\n");
        const headers = lines[0].split(",");
        data = lines.slice(1).map((line) => {
          const values = line.split(",");
          return headers.reduce(
            (obj, header, index) => {
              obj[header.trim()] = values[index]?.trim();
              return obj;
            },
            {} as Record<string, string>
          );
        });
      } else if (file.name.endsWith(".json")) {
        data = JSON.parse(text);
      }

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: selectedModule,
          data,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Import successful: ${result.data.importedCount} records imported`
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-gray-600 mt-2">
          Import and export data across modules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="export-module">Module</Label>
              <Select
                id="export-module"
                className="mt-2"
                value={selectedModule}
                onChange={(event) => setSelectedModule(event.target.value)}
              >
                {modules.map((mod) => (
                  <option key={mod.value} value={mod.value}>
                    {mod.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="export-format">Format</Label>
              <Select
                id="export-format"
                className="mt-2"
                value={selectedFormat}
                onChange={(event) => setSelectedFormat(event.target.value)}
              >
                {formats.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={handleExport} className="w-full">
              📥 Export Data
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="import-module">Module</Label>
              <Select
                id="import-module"
                className="mt-2"
                value={selectedModule}
                onChange={(event) => setSelectedModule(event.target.value)}
              >
                {modules.map((mod) => (
                  <option key={mod.value} value={mod.value}>
                    {mod.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="import-file">Select File</Label>
              <input
                id="import-file"
                type="file"
                accept=".csv,.json"
                onChange={handleImport}
                disabled={importing}
                className="mt-2 block w-full"
              />
            </div>
            <p className="text-sm text-gray-600">
              Supported formats: CSV, JSON
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
