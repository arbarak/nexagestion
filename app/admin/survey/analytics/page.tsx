'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, FileText, Zap } from 'lucide-react';

interface AnalyticsMetrics {
  totalAnalyses: number;
  averageSentimentScore: number;
  topInsights: string[];
  feedbackTrendDirection: string;
  reportCount: number;
  publishedReports: number;
}

export default function SurveyAnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsMetrics();
  }, []);

  const fetchAnalyticsMetrics = async () => {
    try {
      const response = await fetch('/api/survey/analytics?action=metrics');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading analytics information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Survey Analytics
          </h1>
          <p className="text-gray-600">Analyze survey data and generate reports</p>
        </div>
        <Button>Generate Report</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold">{metrics.totalAnalyses}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Sentiment Score</p>
                <p className="text-2xl font-bold">{metrics.averageSentimentScore.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-2xl font-bold capitalize">{metrics.feedbackTrendDirection}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold">{metrics.reportCount}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">{metrics.publishedReports}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Insights</p>
                <p className="text-2xl font-bold">{metrics.topInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {metrics && metrics.topInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {metrics.topInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Analytics Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Survey Analysis</h3>
                <p className="text-sm text-gray-600">Analyze survey data</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Feedback Trends</h3>
                <p className="text-sm text-gray-600">Track feedback trends</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Survey Reports</h3>
                <p className="text-sm text-gray-600">Generate and view reports</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-semibold">Key Insights</h3>
                <p className="text-sm text-gray-600">View key insights</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

