import { NextRequest, NextResponse } from 'next/server';
import { crmService } from '@/lib/crm-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  type: z.enum(['individual', 'business']).optional(),
});

const interactionSchema = z.object({
  customerId: z.string(),
  type: z.enum(['call', 'email', 'meeting', 'note']),
  subject: z.string(),
  description: z.string(),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'customers') {
      const customers = await crmService.getCustomers(session.companyId);
      return NextResponse.json(customers);
    } else if (action === 'metrics') {
      const metrics = await crmService.getCRMMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching CRM data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM data' },
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

    if (action === 'create-customer') {
      const body = await request.json();
      const { name, email, phone, address, city, country, type } = customerSchema.parse(body);

      const customer = await crmService.createCustomer(
        session.companyId,
        name,
        email,
        phone,
        address,
        city,
        country,
        type
      );

      return NextResponse.json(customer, { status: 201 });
    } else if (action === 'record-interaction') {
      const body = await request.json();
      const { customerId, type, subject, description, duration, notes } = interactionSchema.parse(body);

      const interaction = await crmService.recordInteraction(
        customerId,
        type,
        subject,
        description,
        session.userId,
        duration,
        notes
      );

      return NextResponse.json(interaction, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing CRM action:', error);
    return NextResponse.json(
      { error: 'Failed to process CRM action' },
      { status: 500 }
    );
  }
}


