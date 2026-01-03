import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { importExportService } from '@/lib/import-export-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string;
    const format = formData.get('format') as 'csv' | 'excel' || 'csv';
    const skipErrors = formData.get('skipErrors') === 'true';
    const updateExisting = formData.get('updateExisting') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!entityType) {
      return NextResponse.json({ error: 'entityType is required' }, { status: 400 });
    }

    const validEntityTypes = ['products', 'clients', 'suppliers', 'invoices', 'sales'];
    if (!validEntityTypes.includes(entityType)) {
      return NextResponse.json(
        { error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    if (format === 'csv') {
      // Validate data first
      const lines = fileContent.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line) => {
        const values = line.split(',');
        const record: Record<string, any> = {};
        headers.forEach((header, index) => {
          record[header.trim()] = (values[index] || '').trim();
        });
        return record;
      });

      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: entityType as any,
        companyId: session.companyId,
        data,
        skipErrors,
        updateExisting,
      });

      if (!validation.valid) {
        return NextResponse.json(
          {
            status: 'validation_failed',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }

      // Import data
      const result = await importExportService.importFromCSV({
        format: 'csv',
        entityType: entityType as any,
        companyId: session.companyId,
        csvContent: fileContent,
        skipErrors,
        updateExisting,
      });

      return NextResponse.json({
        status: 'success',
        result,
      });
    } else if (format === 'excel') {
      // For Excel, parse as JSON
      try {
        const data = JSON.parse(fileContent);
        const arrayData = Array.isArray(data) ? data : [data];

        const validation = await importExportService.validateImportData({
          format: 'excel',
          entityType: entityType as any,
          companyId: session.companyId,
          data: arrayData,
          skipErrors,
          updateExisting,
        });

        if (!validation.valid) {
          return NextResponse.json(
            {
              status: 'validation_failed',
              errors: validation.errors,
            },
            { status: 400 }
          );
        }

        const result = await importExportService.importData({
          format: 'excel',
          entityType: entityType as any,
          companyId: session.companyId,
          data: arrayData,
          skipErrors,
          updateExisting,
        });

        return NextResponse.json({
          status: 'success',
          result,
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid Excel format. Expected JSON data.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Import failed' },
      { status: 500 }
    );
  }
}
