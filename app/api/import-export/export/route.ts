import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { importExportService } from '@/lib/import-export-service';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'excel';
    const entityType = searchParams.get('entityType') as
      | 'products'
      | 'clients'
      | 'suppliers'
      | 'invoices'
      | 'sales';

    if (!entityType) {
      return NextResponse.json({ error: 'entityType is required' }, { status: 400 });
    }

    if (format === 'csv') {
      const csvContent = await importExportService.exportToCSV({
        format: 'csv',
        entityType,
        companyId: session.companyId,
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${entityType}-${Date.now()}.csv"`,
        },
      });
    } else if (format === 'excel') {
      const excelData = await importExportService.exportToExcel({
        format: 'excel',
        entityType,
        companyId: session.companyId,
      });

      return NextResponse.json({
        status: 'success',
        data: excelData,
        filename: `${entityType}-${Date.now()}.xlsx`,
      });
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
