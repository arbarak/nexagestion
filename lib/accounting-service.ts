export interface ChartOfAccounts {
  id: string;
  companyId: string;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  entryNumber: string;
  description: string;
  entries: { accountId: string; debit: number; credit: number }[];
  entryDate: Date;
  status: 'draft' | 'posted' | 'reversed';
  createdAt: Date;
}

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNumber: string;
  customerId: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
}

export interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  profitMargin: number;
}

export class AccountingService {
  private chartOfAccounts: Map<string, ChartOfAccounts> = new Map();
  private journalEntries: Map<string, JournalEntry> = new Map();
  private invoices: Map<string, Invoice> = new Map();

  async createAccount(
    companyId: string,
    accountCode: string,
    accountName: string,
    accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  ): Promise<ChartOfAccounts> {
    const account: ChartOfAccounts = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      accountCode,
      accountName,
      accountType,
      balance: 0,
      createdAt: new Date(),
    };

    this.chartOfAccounts.set(account.id, account);
    console.log(`Account created: ${accountCode}`);
    return account;
  }

  async createJournalEntry(
    companyId: string,
    description: string,
    entries: { accountId: string; debit: number; credit: number }[]
  ): Promise<JournalEntry> {
    const entry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      entryNumber: `JE-${Date.now()}`,
      description,
      entries,
      entryDate: new Date(),
      status: 'draft',
      createdAt: new Date(),
    };

    this.journalEntries.set(entry.id, entry);
    console.log(`Journal entry created: ${entry.entryNumber}`);
    return entry;
  }

  async postJournalEntry(entryId: string): Promise<JournalEntry | null> {
    const entry = this.journalEntries.get(entryId);
    if (!entry) return null;

    entry.status = 'posted';
    entry.entries.forEach((e) => {
      const account = this.chartOfAccounts.get(e.accountId);
      if (account) {
        account.balance += e.debit - e.credit;
        this.chartOfAccounts.set(e.accountId, account);
      }
    });

    this.journalEntries.set(entryId, entry);
    console.log(`Journal entry posted: ${entryId}`);
    return entry;
  }

  async createInvoice(
    companyId: string,
    customerId: string,
    items: { description: string; quantity: number; unitPrice: number }[],
    tax: number,
    dueDate: Date
  ): Promise<Invoice> {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const total = subtotal + tax;

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      invoiceNumber: `INV-${Date.now()}`,
      customerId,
      items,
      subtotal,
      tax,
      total,
      status: 'draft',
      dueDate,
      createdAt: new Date(),
    };

    this.invoices.set(invoice.id, invoice);
    console.log(`Invoice created: ${invoice.invoiceNumber}`);
    return invoice;
  }

  async sendInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    invoice.status = 'sent';
    this.invoices.set(invoiceId, invoice);
    console.log(`Invoice sent: ${invoiceId}`);
    return invoice;
  }

  async markInvoicePaid(invoiceId: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    invoice.status = 'paid';
    this.invoices.set(invoiceId, invoice);
    console.log(`Invoice marked paid: ${invoiceId}`);
    return invoice;
  }

  async getChartOfAccounts(companyId: string): Promise<ChartOfAccounts[]> {
    return Array.from(this.chartOfAccounts.values()).filter(
      (a) => a.companyId === companyId
    );
  }

  async getInvoices(companyId: string, status?: string): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values()).filter(
      (i) => i.companyId === companyId
    );

    if (status) {
      invoices = invoices.filter((i) => i.status === status);
    }

    return invoices;
  }

  async getFinancialMetrics(companyId: string): Promise<FinancialMetrics> {
    const accounts = Array.from(this.chartOfAccounts.values()).filter(
      (a) => a.companyId === companyId
    );

    const totalAssets = accounts
      .filter((a) => a.accountType === 'asset')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalLiabilities = accounts
      .filter((a) => a.accountType === 'liability')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalEquity = accounts
      .filter((a) => a.accountType === 'equity')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalRevenue = accounts
      .filter((a) => a.accountType === 'revenue')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalExpenses = accounts
      .filter((a) => a.accountType === 'expense')
      .reduce((sum, a) => sum + a.balance, 0);

    const netIncome = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin,
    };
  }
}

export const accountingService = new AccountingService();

