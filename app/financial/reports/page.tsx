"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FinancialReportsPage() {
  const { data: session } = useSession();
  const [reportType, setReportType] = useState("balance-sheet");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (type: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports/financial?companyId=${session?.user?.companyId}&type=${type}`
      );
      if (response.ok) {
        const result = await response.json();
        setReport(result.data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchReport(reportType);
    }
  }, [reportType, session]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-gray-600 mt-2">View and analyze financial statements</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={reportType === "balance-sheet" ? "default" : "outline"}
          onClick={() => setReportType("balance-sheet")}
        >
          Balance Sheet
        </Button>
        <Button
          variant={reportType === "income-statement" ? "default" : "outline"}
          onClick={() => setReportType("income-statement")}
        >
          Income Statement
        </Button>
      </div>

      {loading ? (
        <p>Loading report...</p>
      ) : report ? (
        <div className="space-y-6">
          {reportType === "balance-sheet" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.assets.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.accountName}</span>
                        <span className="font-semibold">${item.balance.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Assets</span>
                      <span>${report.assets.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Liabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.liabilities.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.accountName}</span>
                        <span className="font-semibold">${item.balance.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Liabilities</span>
                      <span>${report.liabilities.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.equity.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.accountName}</span>
                        <span className="font-semibold">${item.balance.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Equity</span>
                      <span>${report.equity.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {reportType === "income-statement" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Revenues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.revenues.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.accountName}</span>
                        <span className="font-semibold">${item.balance.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Revenue</span>
                      <span>${report.revenues.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {report.expenses.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.accountName}</span>
                        <span className="font-semibold">${item.balance.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Expenses</span>
                      <span>${report.expenses.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardHeader>
                  <CardTitle>Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    ${report.netIncome.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

