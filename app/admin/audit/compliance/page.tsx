'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'hipaa' | 'pci-dss' | 'sox';
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: {
    totalActions: number;
    failedActions: number;
    dataAccessCount: number;
    dataModificationCount: number;
    dataDeleteCount: number;
  };
}

export default function ComplianceReports() {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'gdpr' as const,
    dateFrom: '',
    dateTo: '',
  });

  const handleGenerateReport = async () => {
    if (!formData.dateFrom || !formData.dateTo) {
      alert('Please select date range');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/audit/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');
      const report = await response.json();
      setReports([report, ...reports]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate compliance report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId: string, format: 'pdf' | 'json') => {
    try {
      const response = await fetch(`/api/audit/compliance/${reportId}?format=${format}`);
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report.${format}`;
      a.click();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to download report');
    }
  };

  const getComplianceLabel = (type: string) => {
    const labels: Record<string, string> = {
      'gdpr': 'GDPR Compliance',
      'hipaa': 'HIPAA Compliance',
      'pci-dss': 'PCI-DSS Compliance',
      'sox': 'SOX Compliance',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Compliance Reports</h1>
        <p className="text-gray-600">Generate compliance reports for regulatory requirements</p>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Compliance Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Compliance Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="gdpr">GDPR</option>
                <option value="hipaa">HIPAA</option>
                <option value="pci-dss">PCI-DSS</option>
                <option value="sox">SOX</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">From Date</label>
              <input
                type="date"
                value={formData.dateFrom}
                onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">To Date</label>
              <input
                type="date"
                value={formData.dateTo}
                onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <Button onClick={handleGenerateReport} disabled={loading} size="lg">
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No compliance reports generated yet</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">{getComplianceLabel(report.type)}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Period: {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                    </p>

                    <div className="grid grid-cols-5 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Total Actions</p>
                        <p className="text-xl font-bold">{report.summary.totalActions}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Failed Actions</p>
                        <p className="text-xl font-bold">{report.summary.failedActions}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Data Access</p>
                        <p className="text-xl font-bold">{report.summary.dataAccessCount}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Modifications</p>
                        <p className="text-xl font-bold">{report.summary.dataModificationCount}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Deletions</p>
                        <p className="text-xl font-bold">{report.summary.dataDeleteCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report.id, 'pdf')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report.id, 'json')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

