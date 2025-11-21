'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

export default function AIDashboard() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const [predRes, recRes, anomRes] = await Promise.all([
        fetch('/api/ai/predictions?limit=5'),
        fetch('/api/ai/recommendations?limit=5'),
        fetch('/api/ai/anomalies?limit=5'),
      ]);

      if (predRes.ok) setPredictions(await predRes.json());
      if (recRes.ok) setRecommendations(await recRes.json());
      if (anomRes.ok) setAnomalies(await anomRes.json());
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8" />
            AI Intelligence Hub
          </h1>
          <p className="text-gray-600 mt-2">Predictive analytics and intelligent insights</p>
        </div>
        <Button>Generate Insights</Button>
      </div>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <CardTitle>Sales Predictions</CardTitle>
          </div>
          <CardDescription>AI-powered sales forecasts for next quarter</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading predictions...</div>
          ) : predictions.length === 0 ? (
            <p className="text-sm text-gray-600">No predictions available</p>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred) => (
                <div key={pred.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium text-sm">{pred.type.toUpperCase()}</p>
                    <p className="text-xs text-gray-600">{pred.period}</p>
                  </div>
                  <Badge variant="secondary">{Math.round(pred.confidence * 100)}% confidence</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            <CardTitle>Smart Recommendations</CardTitle>
          </div>
          <CardDescription>AI-generated business recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <p className="text-sm text-gray-600">No recommendations available</p>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium text-sm">{rec.type.toUpperCase()}</p>
                    <p className="text-xs text-gray-600">Score: {(rec.score * 100).toFixed(0)}%</p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomalies */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle className="text-orange-900">Detected Anomalies</CardTitle>
          </div>
          <CardDescription className="text-orange-800">Unusual patterns detected in your data</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading anomalies...</div>
          ) : anomalies.length === 0 ? (
            <p className="text-sm text-orange-800">No anomalies detected</p>
          ) : (
            <div className="space-y-3">
              {anomalies.map((anom) => (
                <div key={anom.id} className="flex justify-between items-center p-3 bg-white rounded border border-orange-200">
                  <div>
                    <p className="font-medium text-sm">{anom.type.toUpperCase()}</p>
                    <p className="text-xs text-gray-600">Severity: {anom.severity}</p>
                  </div>
                  <Badge variant="destructive">{anom.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

