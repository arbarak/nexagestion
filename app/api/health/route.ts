import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbCheck = await checkDatabase();
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

    // Check uptime
    const uptime = process.uptime();

    const responseTime = Date.now() - startTime;

    const health = {
      status: dbCheck.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      responseTime: `${responseTime}ms`,
      checks: {
        database: {
          status: dbCheck.connected ? 'ok' : 'error',
          responseTime: `${dbCheck.responseTime}ms`,
        },
        memory: {
          status: memoryPercent < 90 ? 'ok' : 'warning',
          usage: `${memoryPercent.toFixed(2)}%`,
          heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        },
        cpu: {
          status: 'ok',
          usage: process.cpuUsage(),
        },
      },
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

async function checkDatabase(): Promise<{ connected: boolean; responseTime: number }> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: Date.now() - startTime,
    };
  }
}

