import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { handleApiError, ErrorCodes } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const performanceMetricSchema = z.object({
  page: z.string(),
  loadTime: z.number(),
  firstContentfulPaint: z.number(),
  largestContentfulPaint: z.number(),
  cumulativeLayoutShift: z.number(),
  timeToInteractive: z.number(),
  userAgent: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        companyId: session.companyId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Calculate averages
    const avgLoadTime =
      metrics.reduce((sum: number, m: any) => sum + m.loadTime, 0) / metrics.length || 0;
    const avgFCP =
      metrics.reduce((sum: number, m: any) => sum + m.firstContentfulPaint, 0) /
      metrics.length || 0;
    const avgLCP =
      metrics.reduce((sum: number, m: any) => sum + m.largestContentfulPaint, 0) /
      metrics.length || 0;
    const avgCLS =
      metrics.reduce((sum: number, m: any) => sum + m.cumulativeLayoutShift, 0) /
      metrics.length || 0;

    return NextResponse.json({
      data: {
        metrics,
        averages: {
          loadTime: Math.round(avgLoadTime),
          firstContentfulPaint: Math.round(avgFCP),
          largestContentfulPaint: Math.round(avgLCP),
          cumulativeLayoutShift: Math.round(avgCLS * 100) / 100,
        },
        count: metrics.length,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw ErrorCodes.UNAUTHORIZED();
    if (!session.companyId) {
      throw ErrorCodes.VALIDATION_ERROR("companyId is required");
    }

    const body = await request.json();
    const data = performanceMetricSchema.parse(body);

    const metric = await prisma.performanceMetric.create({
      data: {
        groupId: session.userId,
        companyId: session.companyId,
        page: data.page,
        loadTime: data.loadTime,
        firstContentfulPaint: data.firstContentfulPaint,
        largestContentfulPaint: data.largestContentfulPaint,
        cumulativeLayoutShift: data.cumulativeLayoutShift,
        timeToInteractive: data.timeToInteractive,
        userAgent: data.userAgent,
      },
    });

    return NextResponse.json({ data: metric }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
