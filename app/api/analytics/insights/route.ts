import { NextRequest, NextResponse } from 'next/server';
import { predictiveInsights } from '@/lib/predictive-insights';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get('type') || 'all';

    let result: any = {};

    if (type === 'all' || type === 'revenue') {
      result.revenuePrediction = await predictiveInsights.predictSalesRevenue(session.companyId);
    }

    if (type === 'all' || type === 'inventory') {
      result.inventoryPrediction = await predictiveInsights.predictInventoryNeeds(session.companyId);
    }

    if (type === 'all' || type === 'churn') {
      result.churnPrediction = await predictiveInsights.predictCustomerChurn(session.companyId);
    }

    if (type === 'all' || type === 'insights') {
      result.insights = await predictiveInsights.generateInsights(session.companyId);
    }

    if (type === 'all' || type === 'recommendations') {
      result.recommendations = await predictiveInsights.getRecommendations(session.companyId);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

