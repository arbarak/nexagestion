export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'prospect';
  totalPurchases: number;
  lastPurchaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string;
  date: Date;
  duration?: number;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  value: number;
  probability: number;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CRMService {
  private customers: Map<string, Customer> = new Map();
  private interactions: Interaction[] = [];
  private leads: Map<string, Lead> = new Map();

  async createCustomer(
    companyId: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    country: string,
    type: 'individual' | 'business' = 'individual'
  ): Promise<Customer> {
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      email,
      phone,
      address,
      city,
      country,
      type,
      status: 'active',
      totalPurchases: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.customers.set(customer.id, customer);
    console.log(`Customer created: ${name}`);
    return customer;
  }

  async getCustomers(companyId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(
      (c) => c.companyId === companyId
    );
  }

  async getCustomer(customerId: string): Promise<Customer | null> {
    return this.customers.get(customerId) || null;
  }

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customer = this.customers.get(customerId);
    if (!customer) return null;

    const updated = { ...customer, ...updates, updatedAt: new Date() };
    this.customers.set(customerId, updated);
    console.log(`Customer updated: ${customerId}`);
    return updated;
  }

  async recordInteraction(
    customerId: string,
    type: 'call' | 'email' | 'meeting' | 'note',
    subject: string,
    description: string,
    createdBy: string,
    duration?: number,
    notes: string = ''
  ): Promise<Interaction> {
    const interaction: Interaction = {
      id: Math.random().toString(36).substr(2, 9),
      customerId,
      type,
      subject,
      description,
      date: new Date(),
      duration,
      notes,
      createdBy,
      createdAt: new Date(),
    };

    this.interactions.push(interaction);
    console.log(`Interaction recorded: ${type} with ${customerId}`);
    return interaction;
  }

  async getInteractions(customerId: string): Promise<Interaction[]> {
    return this.interactions.filter((i) => i.customerId === customerId);
  }

  async createLead(
    companyId: string,
    name: string,
    email: string,
    phone: string,
    company: string,
    source: string,
    value: number,
    assignedTo: string
  ): Promise<Lead> {
    const lead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      email,
      phone,
      company,
      status: 'new',
      source,
      value,
      probability: 0,
      assignedTo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.leads.set(lead.id, lead);
    console.log(`Lead created: ${name}`);
    return lead;
  }

  async getLeads(companyId: string, status?: string): Promise<Lead[]> {
    let leads = Array.from(this.leads.values()).filter(
      (l) => l.companyId === companyId
    );

    if (status) {
      leads = leads.filter((l) => l.status === status);
    }

    return leads;
  }

  async updateLeadStatus(leadId: string, status: string, probability?: number): Promise<Lead | null> {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    lead.status = status;
    if (probability !== undefined) {
      lead.probability = probability;
    }
    lead.updatedAt = new Date();

    this.leads.set(leadId, lead);
    console.log(`Lead status updated: ${status}`);
    return lead;
  }

  async convertLeadToCustomer(leadId: string): Promise<Customer | null> {
    const lead = this.leads.get(leadId);
    if (!lead) return null;

    const customer = await this.createCustomer(
      lead.companyId,
      lead.name,
      lead.email,
      lead.phone,
      '',
      '',
      '',
      'business'
    );

    await this.updateLeadStatus(leadId, 'converted');
    console.log(`Lead converted to customer: ${leadId}`);
    return customer;
  }

  async getCRMMetrics(companyId: string): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalLeads: number;
    convertedLeads: number;
    totalInteractions: number;
    averageCustomerValue: number;
  }> {
    const customers = Array.from(this.customers.values()).filter(
      (c) => c.companyId === companyId
    );
    const leads = Array.from(this.leads.values()).filter(
      (l) => l.companyId === companyId
    );

    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const convertedLeads = leads.filter((l) => l.status === 'converted').length;

    const totalValue = customers.reduce((sum, c) => sum + c.totalPurchases, 0);
    const averageCustomerValue = customers.length > 0 ? totalValue / customers.length : 0;

    const companyInteractions = this.interactions.filter((i) => {
      const customer = this.customers.get(i.customerId);
      return customer && customer.companyId === companyId;
    });

    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalLeads: leads.length,
      convertedLeads,
      totalInteractions: companyInteractions.length,
      averageCustomerValue,
    };
  }
}

export const crmService = new CRMService();

