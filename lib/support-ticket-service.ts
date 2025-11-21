export interface SupportTicket {
  id: string;
  companyId: string;
  ticketNumber: string;
  customerId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  category: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface KnowledgeBase {
  id: string;
  companyId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  customerSatisfaction: number;
}

export class SupportTicketService {
  private tickets: Map<string, SupportTicket> = new Map();
  private comments: TicketComment[] = [];
  private knowledgeBase: Map<string, KnowledgeBase> = new Map();

  async createTicket(
    companyId: string,
    customerId: string,
    subject: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    category: string
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      ticketNumber: `TKT-${Date.now()}`,
      customerId,
      subject,
      description,
      priority,
      status: 'open',
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(ticket.id, ticket);
    console.log(`Support ticket created: ${ticket.ticketNumber}`);
    return ticket;
  }

  async assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket | null> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    ticket.assignedTo = assignedTo;
    ticket.status = 'in-progress';
    ticket.updatedAt = new Date();
    this.tickets.set(ticketId, ticket);
    console.log(`Ticket assigned: ${ticketId}`);
    return ticket;
  }

  async addComment(
    ticketId: string,
    authorId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<TicketComment> {
    const comment: TicketComment = {
      id: Math.random().toString(36).substr(2, 9),
      ticketId,
      authorId,
      content,
      isInternal,
      createdAt: new Date(),
    };

    this.comments.push(comment);
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.updatedAt = new Date();
      this.tickets.set(ticketId, ticket);
    }

    console.log(`Comment added to ticket: ${ticketId}`);
    return comment;
  }

  async resolveTicket(ticketId: string): Promise<SupportTicket | null> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();
    this.tickets.set(ticketId, ticket);
    console.log(`Ticket resolved: ${ticketId}`);
    return ticket;
  }

  async createKnowledgeArticle(
    companyId: string,
    title: string,
    content: string,
    category: string,
    tags: string[]
  ): Promise<KnowledgeBase> {
    const article: KnowledgeBase = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      title,
      content,
      category,
      tags,
      views: 0,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.knowledgeBase.set(article.id, article);
    console.log(`Knowledge article created: ${title}`);
    return article;
  }

  async getTickets(companyId: string, status?: string): Promise<SupportTicket[]> {
    let tickets = Array.from(this.tickets.values()).filter(
      (t) => t.companyId === companyId
    );

    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }

    return tickets;
  }

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return this.comments.filter((c) => c.ticketId === ticketId);
  }

  async getKnowledgeArticles(companyId: string, category?: string): Promise<KnowledgeBase[]> {
    let articles = Array.from(this.knowledgeBase.values()).filter(
      (a) => a.companyId === companyId
    );

    if (category) {
      articles = articles.filter((a) => a.category === category);
    }

    return articles;
  }

  async getSupportMetrics(companyId: string): Promise<SupportMetrics> {
    const tickets = Array.from(this.tickets.values()).filter(
      (t) => t.companyId === companyId
    );

    const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved').length;

    return {
      totalTickets: tickets.length,
      openTickets,
      resolvedTickets,
      averageResolutionTime: 24,
      customerSatisfaction: 4.5,
    };
  }
}

export const supportTicketService = new SupportTicketService();

