import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId } = chatSchema.parse(body);

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      });
    } else {
      conversation = await prisma.aiConversation.create({
        data: {
          companyId: session.companyId,
          userId: session.userId,
          title: message.substring(0, 50),
        },
      });
    }

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Store user message
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Generate AI response
    const response = await generateAIResponse(message, session.companyId);

    // Store AI response
    const aiMessage = await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: response,
      },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      message: aiMessage.content,
      timestamp: aiMessage.createdAt,
    });
  } catch (error) {
    console.error('Failed to process chat:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}

async function generateAIResponse(message: string, companyId: string): Promise<string> {
  const lowerMessage = message.toLowerCase();

  // Simple intent matching
  if (lowerMessage.includes('sales') || lowerMessage.includes('revenue')) {
    const sales = await prisma.sale.findMany({
      where: { companyId },
      take: 1,
      orderBy: { createdAt: 'desc' },
    });
    const total = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    return `Based on recent data, your total sales are $${total.toLocaleString()}. Would you like more details?`;
  }

  if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
    const stocks = await prisma.stock.findMany({
      where: { companyId },
    });
    const lowStock = stocks.filter(s => s.quantity < s.minQuantity).length;
    return `You have ${lowStock} products with low stock levels. Would you like me to show you which ones?`;
  }

  if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
    const clients = await prisma.client.findMany({
      where: { companyId },
    });
    return `You have ${clients.length} customers in your system. Would you like to see top customers?`;
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can')) {
    return `I can help you with:\n• Sales and revenue information\n• Inventory and stock levels\n• Customer information\n• Order status\n• Financial reports\n\nWhat would you like to know?`;
  }

  return `I understand you're asking about "${message}". I can help with sales, inventory, customers, and orders. What specific information do you need?`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      // Get all conversations
      const conversations = await prisma.aiConversation.findMany({
        where: { companyId: session.companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      return NextResponse.json(conversations);
    }

    // Get messages in conversation
    const messages = await prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

