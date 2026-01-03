import { NextResponse } from 'next/server';
import { swaggerService } from '@/lib/swagger-service';

export async function GET() {
  const html = swaggerService.generateSwaggerUI();

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
