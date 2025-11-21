import { NextRequest, NextResponse } from 'next/server';
import { supportTicketService } from '@/lib/support-ticket-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const ticketSchema = z.object({
  customerId: z.string(),
  subject: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
});

const commentSchema = z.object({
  ticketId: z.string(),
  content: z.string(),
  isInternal: z.boolean().optional(),
});

const assignSchema = z.object({
  ticketId: z.string(),
  assignedTo: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'tickets') {
      const status = searchParams.get('status');
      const tickets = await supportTicketService.getTickets(session.companyId, status || undefined);
      return NextResponse.json(tickets);
    } else if (action === 'comments') {
      const ticketId = searchParams.get('ticketId');
      if (!ticketId) {
        return NextResponse.json({ error: 'ticketId required' }, { status: 400 });
      }
      const comments = await supportTicketService.getTicketComments(ticketId);
      return NextResponse.json(comments);
    } else if (action === 'metrics') {
      const metrics = await supportTicketService.getSupportMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching support data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support data' },
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

    if (action === 'create-ticket') {
      const body = await request.json();
      const { customerId, subject, description, priority, category } = ticketSchema.parse(body);

      const ticket = await supportTicketService.createTicket(
        session.companyId,
        customerId,
        subject,
        description,
        priority,
        category
      );

      return NextResponse.json(ticket, { status: 201 });
    } else if (action === 'add-comment') {
      const body = await request.json();
      const { ticketId, content, isInternal } = commentSchema.parse(body);

      const comment = await supportTicketService.addComment(
        ticketId,
        session.userId,
        content,
        isInternal
      );

      return NextResponse.json(comment, { status: 201 });
    } else if (action === 'assign-ticket') {
      const body = await request.json();
      const { ticketId, assignedTo } = assignSchema.parse(body);

      const ticket = await supportTicketService.assignTicket(ticketId, assignedTo);
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      return NextResponse.json(ticket);
    } else if (action === 'resolve-ticket') {
      const body = await request.json();
      const { ticketId } = z.object({ ticketId: z.string() }).parse(body);

      const ticket = await supportTicketService.resolveTicket(ticketId);
      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      return NextResponse.json(ticket);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing support action:', error);
    return NextResponse.json(
      { error: 'Failed to process support action' },
      { status: 500 }
    );
  }
}


