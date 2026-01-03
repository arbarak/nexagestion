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
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId } = chatSchema.parse(body);

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
      });
    } else {
      conversation = await prisma.aIConversation.create({
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
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Generate AI response
    const response = await generateAIResponse(message, session.companyId);

    // Store AI response
    const aiMessage = await prisma.aIMessage.create({
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

  try {
    // Sales and Revenue Intelligence
    if (lowerMessage.includes('sales') || lowerMessage.includes('revenue') || lowerMessage.includes('order')) {
      const sales = await prisma.sale.findMany({
        where: { companyId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      if (sales.length === 0) {
        return 'You don\'t have any sales recorded yet. Start by creating your first sale!';
      }

      const total = sales.reduce((sum: number, s: any) => sum + Number(s.totalAmount || 0), 0);
      const avgValue = total / sales.length;
      const lastSale = sales[0];

      return `📊 Sales Analytics:\n• Total Sales: $${total.toLocaleString('en-US', { maximumFractionDigits: 2 })}\n• Average Order Value: $${avgValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}\n• Recent Order: ${lastSale.client?.name} - $${Number(lastSale.totalAmount).toLocaleString('en-US', { maximumFractionDigits: 2 })}\n• Total Orders: ${sales.length}\n\nWould you like to see more details about specific orders or time periods?`;
    }

    // Inventory and Stock Intelligence
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') || lowerMessage.includes('product')) {
      const stocks = await prisma.stock.findMany({
        where: { companyId },
        include: { product: true },
      });

      if (stocks.length === 0) {
        return 'No inventory items found. Start by adding products to your inventory.';
      }

      const lowStock = stocks.filter((s: any) => s.quantity < (s.minimumLevel || 10));
      const totalValue = stocks.reduce((sum: number, s: any) => sum + (s.quantity * (s.product?.price || 0)), 0);

      let response = `📦 Inventory Status:\n• Total Items: ${stocks.length}\n• Low Stock Items: ${lowStock.length}`;
      if (lowStock.length > 0) {
        response += `\n\nLow Stock Products:\n${lowStock.slice(0, 3).map((s: any) => `- ${s.product?.name || 'Unknown'}: ${s.quantity} units`).join('\n')}`;
      }
      response += `\n• Inventory Value: $${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}\n\nWould you like me to flag items for reordering?`;
      return response;
    }

    // Customer Intelligence
    if (lowerMessage.includes('customer') || lowerMessage.includes('client') || lowerMessage.includes('contact')) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { groupId: true },
      });

      if (!company) {
        return `I couldn't access your company information. Please try again.`;
      }

      const clients = await prisma.client.findMany({
        where: { groupId: company.groupId },
        take: 5,
      });

      if (clients.length === 0) {
        return 'No customers found. Start by adding your first customer!';
      }

      return `👥 Customer Information:\n• Total Customers: ${clients.length}\n• Sample Customers:\n${clients.slice(0, 3).map((c: any) => `- ${c.name} (${c.email})`).join('\n')}\n\nWould you like to see customer analytics or transaction history?`;
    }

    // Financial Intelligence
    if (lowerMessage.includes('finance') || lowerMessage.includes('profit') || lowerMessage.includes('expense')) {
      const invoices = await prisma.invoice.findMany({
        where: { companyId },
      });

      if (invoices.length === 0) {
        return 'No financial data available. Create invoices to see financial analytics.';
      }

      const totalRevenue = invoices.reduce((sum: number, i: any) => sum + Number(i.totalAmount || 0), 0);
      const paidInvoices = invoices.filter((i: any) => i.status === 'PAID').length;

      return `💰 Financial Summary:\n• Total Invoiced: $${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}\n• Paid Invoices: ${paidInvoices}/${invoices.length}\n• Outstanding: ${invoices.length - paidInvoices} invoices\n\nWould you like detailed profit analysis or cash flow projections?`;
    }

    // Help and Capabilities
    if (lowerMessage.includes('help') || lowerMessage.includes('what can') || lowerMessage.includes('capabilities')) {
      return `🤖 AI Assistant Capabilities:\n\nI can help you with:\n• 📊 **Sales Analytics** - Ask about revenue, orders, and trends\n• 📦 **Inventory Management** - Check stock levels and products\n• 👥 **Customer Intelligence** - View customer data and metrics\n• 💰 **Financial Reports** - See revenue and invoice status\n• 📈 **Insights** - Ask for recommendations and trends\n\nTry asking me things like:\n• "How are my sales today?"\n• "Show me low stock items"\n• "How many customers do I have?"\n• "What's my total revenue?"\n\nWhat would you like to know?`;
    }

    // Default response with helpful suggestions
    return `I understand you're asking about "${message}". \n\nI can help with:\n• Sales & Revenue\n• Inventory & Stock\n• Customers & Contacts\n• Financial Reports\n\nFor more help, just ask "help" or tell me what you'd like to know!`;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I encountered an error processing your request. Please try again.';
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      // Get all conversations
      const conversations = await prisma.aIConversation.findMany({
        where: { companyId: session.companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      return NextResponse.json(conversations);
    }

    // Get messages in conversation
    const messages = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}


