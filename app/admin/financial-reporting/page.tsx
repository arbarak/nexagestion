'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, PieChart, LineChart, TrendingUp } from 'lucide-react';

interface FinancialReports {
  incomeStatements: number;
  balanceSheets: number;
  cashFlowStatements: number;
  budgets: number;
}

export default function FinancialReportingPage() {
  const [reports, setReports] = useState<FinancialReports>({
    incomeStatements: 0,
    balanceSheets: 0,
    cashFlowStatements: 0,
    budgets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [incomeRes, balanceRes, cashFlowRes, budgetRes] = await Promise.all([
        fetch('/api/financial-reporting?action=income-statements'),
        fetch('/api/financial-reporting?action=balance-sheets'),
        fetch('/api/financial-reporting?action=cash-flow-statements'),
        fetch('/api/financial-reporting?action=budgets'),
      ]);

      const incomeData = await incomeRes.json();
      const balanceData = await balanceRes.json();
      const cashFlowData = await cashFlowRes.json();
      const budgetData = await budgetRes.json();

      setReports({
        incomeStatements: Array.isArray(incomeData) ? incomeData.length : 0,
        balanceSheets: Array.isArray(balanceData) ? balanceData.length : 0,
        cashFlowStatements: Array.isArray(cashFlowData) ? cashFlowData.length : 0,
        budgets: Array.isArray(budgetData) ? budgetData.length : 0,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading financial reports...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Financial Reporting
          </h1>
          <p className="text-gray-600">View and manage financial statements and reports</p>
        </div>
        <Button>Generate Report</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Income Statements</p>
              <p className="text-2xl font-bold">{reports.incomeStatements}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Balance Sheets</p>
              <p className="text-2xl font-bold">{reports.balanceSheets}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Cash Flow Statements</p>
              <p className="text-2xl font-bold">{reports.cashFlowStatements}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Budgets</p>
              <p className="text-2xl font-bold">{reports.budgets}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Statements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Income Statement</h3>
                <p className="text-sm text-gray-600">Revenue, expenses, and net income</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Balance Sheet</h3>
                <p className="text-sm text-gray-600">Assets, liabilities, and equity</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Cash Flow Statement</h3>
                <p className="text-sm text-gray-600">Operating, investing, and financing activities</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Budget Analysis</h3>
                <p className="text-sm text-gray-600">Budget allocation and spending</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Generate Financial Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Create comprehensive financial statements for analysis and compliance</p>
            <div className="flex gap-2">
              <Button size="sm">Income Statement</Button>
              <Button size="sm" variant="outline">Balance Sheet</Button>
              <Button size="sm" variant="outline">Cash Flow</Button>
              <Button size="sm" variant="outline">Budget Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

