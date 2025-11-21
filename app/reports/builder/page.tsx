'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Plus, Trash2 } from 'lucide-react';

export default function ReportBuilder() {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'financial'>('sales');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [reportName, setReportName] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: '📊' },
    { value: 'inventory', label: 'Inventory Report', icon: '📦' },
    { value: 'financial', label: 'Financial Report', icon: '💰' },
  ];

  const handleGenerateReport = async () => {
    if (!reportName) {
      alert('Please enter a report name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reports/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportName,
          type: reportType,
          filters,
          columns,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate report');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'xlsx' | 'pdf') => {
    if (!reportData) return;

    try {
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: reportData.rows,
          format,
          filename: reportName,
          includeHeaders: true,
          includeTimestamp: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportName}.${format}`;
      a.click();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to export report');
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Report Builder</h1>
        <p className="text-gray-600">Create and export custom reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Name</label>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <div className="grid grid-cols-3 gap-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value as any)}
                    className={`p-3 rounded-md border-2 transition ${
                      reportType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Filters</label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600">Date From</label>
                  <input
                    type="date"
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Date To</label>
                  <input
                    type="date"
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reportData && (
              <>
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                <Button
                  onClick={() => handleExport('xlsx')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as XLSX
                </Button>
                <Button
                  onClick={() => handleExport('pdf')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">{key}</p>
                      <p className="text-lg font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {reportData.rows[0] && Object.keys(reportData.rows[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-semibold">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.slice(0, 10).map((row: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value: any, i: number) => (
                          <td key={i} className="p-2">{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-600">
                Showing {Math.min(10, reportData.rows.length)} of {reportData.totalRows} rows
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

