'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, TrendingUp, BarChart3 } from 'lucide-react';

interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  newFeedback: number;
  addressedFeedback: number;
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
}

export default function FeedbackPage() {
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbackMetrics();
  }, []);

  const fetchFeedbackMetrics = async () => {
    try {
      const response = await fetch('/api/support/feedback?action=metrics');
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
    return <div className="p-8">Loading feedback information...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Customer Feedback
          </h1>
          <p className="text-gray-600">Manage customer feedback and surveys</p>
        </div>
        <Button>Create Survey</Button>
      </div>

      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{metrics.totalFeedback}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold">{metrics.newFeedback}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Addressed</p>
                <p className="text-2xl font-bold">{metrics.addressedFeedback}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Surveys</p>
                <p className="text-2xl font-bold">{metrics.totalSurveys}</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{metrics.activeSurveys}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600">Responses</p>
                <p className="text-2xl font-bold">{metrics.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Feedback Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <h3 className="font-semibold">Customer Ratings</h3>
                <p className="text-sm text-gray-600">View and manage customer ratings</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Comments & Reviews</h3>
                <p className="text-sm text-gray-600">Review customer comments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Survey Management</h3>
                <p className="text-sm text-gray-600">Create and manage surveys</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>

          <div className="p-4 border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Feedback Analytics</h3>
                <p className="text-sm text-gray-600">View feedback trends and insights</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Satisfaction Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Average Customer Rating</span>
                <span className="font-bold flex items-center gap-1">
                  {metrics.averageRating.toFixed(1)} <Star className="h-4 w-4 text-yellow-500" />
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Feedback Response Rate</span>
                <span className="font-bold">
                  {metrics.totalFeedback > 0
                    ? ((metrics.addressedFeedback / metrics.totalFeedback) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-gray-600">Survey Response Rate</span>
                <span className="font-bold">
                  {metrics.totalSurveys > 0
                    ? ((metrics.totalResponses / (metrics.totalSurveys * 10)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

