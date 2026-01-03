import { NextResponse } from 'next/server';
import { swaggerService } from '@/lib/swagger-service';

export async function GET() {
  const json = swaggerService.exportOpenAPIJSON();

  return NextResponse.json(JSON.parse(json), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="openapi.json"',
    },
  });
}
