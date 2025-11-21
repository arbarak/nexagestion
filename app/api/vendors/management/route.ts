import { NextRequest, NextResponse } from 'next/server';
import { vendorManagementService } from '@/lib/vendor-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const vendorSchema = z.object({
  vendorCode: z.string(),
  vendorName: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  category: z.string(),
});

const ratingSchema = z.object({
  vendorId: z.string(),
  deliveryScore: z.number().min(0).max(5),
  qualityScore: z.number().min(0).max(5),
  priceScore: z.number().min(0).max(5),
  communicationScore: z.number().min(0).max(5),
});

const procurementSchema = z.object({
  requestCode: z.string(),
  description: z.string(),
  quantity: z.number(),
  estimatedBudget: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'vendors') {
      const status = searchParams.get('status');
      const vendors = await vendorManagementService.getVendors(session.companyId, status || undefined);
      return NextResponse.json(vendors);
    } else if (action === 'performances') {
      const vendorId = searchParams.get('vendorId');
      const performances = await vendorManagementService.getVendorPerformances(vendorId || undefined);
      return NextResponse.json(performances);
    } else if (action === 'requests') {
      const status = searchParams.get('status');
      const requests = await vendorManagementService.getProcurementRequests(
        session.companyId,
        status || undefined
      );
      return NextResponse.json(requests);
    } else if (action === 'metrics') {
      const metrics = await vendorManagementService.getVendorMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching vendor data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-vendor') {
      const body = await request.json();
      const { vendorCode, vendorName, contactPerson, email, phone, address, category } =
        vendorSchema.parse(body);

      const vendor = await vendorManagementService.createVendor(
        session.companyId,
        vendorCode,
        vendorName,
        contactPerson,
        email,
        phone,
        address,
        category
      );

      return NextResponse.json(vendor, { status: 201 });
    } else if (action === 'rate-vendor') {
      const body = await request.json();
      const { vendorId, deliveryScore, qualityScore, priceScore, communicationScore } =
        ratingSchema.parse(body);

      const performance = await vendorManagementService.rateVendor(
        vendorId,
        deliveryScore,
        qualityScore,
        priceScore,
        communicationScore
      );

      return NextResponse.json(performance, { status: 201 });
    } else if (action === 'create-request') {
      const body = await request.json();
      const { requestCode, description, quantity, estimatedBudget } = procurementSchema.parse(body);

      const procRequest = await vendorManagementService.createProcurementRequest(
        session.companyId,
        requestCode,
        description,
        quantity,
        estimatedBudget
      );

      return NextResponse.json(procRequest, { status: 201 });
    } else if (action === 'approve-request') {
      const body = await request.json();
      const { requestId } = z.object({ requestId: z.string() }).parse(body);

      const procRequest = await vendorManagementService.approveProcurementRequest(requestId);
      if (!procRequest) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      return NextResponse.json(procRequest);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing vendor action:', error);
    return NextResponse.json(
      { error: 'Failed to process vendor action' },
      { status: 500 }
    );
  }
}


