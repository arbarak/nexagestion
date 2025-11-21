export interface EmailTemplate {
  id: string;
  companyId: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'order' | 'invoice' | 'payment' | 'notification' | 'alert' | 'custom';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailTemplateVariable {
  name: string;
  description: string;
  example: string;
}

export class EmailTemplateService {
  private templates: Map<string, EmailTemplate> = new Map();

  async createTemplate(
    companyId: string,
    name: string,
    subject: string,
    htmlContent: string,
    textContent: string,
    category: EmailTemplate['category'],
    variables: string[] = []
  ): Promise<EmailTemplate> {
    const template: EmailTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      subject,
      htmlContent,
      textContent,
      variables,
      category,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    console.log(`Created email template: ${name}`);
    return template;
  }

  async getTemplate(companyId: string, templateId: string): Promise<EmailTemplate | null> {
    const template = this.templates.get(templateId);
    if (template && template.companyId === companyId) {
      return template;
    }
    return null;
  }

  async getTemplates(companyId: string, category?: string): Promise<EmailTemplate[]> {
    const templates = Array.from(this.templates.values()).filter((t) => {
      if (t.companyId !== companyId) return false;
      if (category && t.category !== category) return false;
      return true;
    });
    return templates;
  }

  async updateTemplate(
    companyId: string,
    templateId: string,
    updates: Partial<EmailTemplate>
  ): Promise<EmailTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template || template.companyId !== companyId) {
      return null;
    }

    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    this.templates.set(templateId, updated);
    console.log(`Updated email template: ${templateId}`);
    return updated;
  }

  async deleteTemplate(companyId: string, templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (template && template.companyId === companyId) {
      this.templates.delete(templateId);
      console.log(`Deleted email template: ${templateId}`);
    }
  }

  async renderTemplate(
    template: EmailTemplate,
    variables: Record<string, any>
  ): Promise<{ subject: string; html: string; text: string }> {
    let subject = template.subject;
    let html = template.htmlContent;
    let text = template.textContent;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
      text = text.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { subject, html, text };
  }

  async validateTemplate(template: EmailTemplate): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!template.name) errors.push('Template name is required');
    if (!template.subject) errors.push('Subject is required');
    if (!template.htmlContent) errors.push('HTML content is required');

    // Check for unmatched variables
    const variableRegex = /{{(\w+)}}/g;
    const usedVariables = new Set<string>();
    let match;

    while ((match = variableRegex.exec(template.htmlContent)) !== null) {
      usedVariables.add(match[1]);
    }

    for (const variable of usedVariables) {
      if (!template.variables.includes(variable)) {
        errors.push(`Variable {{${variable}}} is used but not declared`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  getDefaultVariables(category: string): EmailTemplateVariable[] {
    const defaults: Record<string, EmailTemplateVariable[]> = {
      order: [
        { name: 'orderNumber', description: 'Order number', example: 'ORD-001' },
        { name: 'customerName', description: 'Customer name', example: 'John Doe' },
        { name: 'orderDate', description: 'Order date', example: '2024-01-15' },
        { name: 'totalAmount', description: 'Total amount', example: '$1,000.00' },
      ],
      invoice: [
        { name: 'invoiceNumber', description: 'Invoice number', example: 'INV-001' },
        { name: 'customerName', description: 'Customer name', example: 'John Doe' },
        { name: 'invoiceDate', description: 'Invoice date', example: '2024-01-15' },
        { name: 'dueDate', description: 'Due date', example: '2024-02-15' },
        { name: 'totalAmount', description: 'Total amount', example: '$1,000.00' },
      ],
      payment: [
        { name: 'paymentAmount', description: 'Payment amount', example: '$1,000.00' },
        { name: 'paymentDate', description: 'Payment date', example: '2024-01-15' },
        { name: 'paymentMethod', description: 'Payment method', example: 'Credit Card' },
        { name: 'transactionId', description: 'Transaction ID', example: 'TXN-001' },
      ],
    };

    return defaults[category] || [];
  }
}

export const emailTemplateService = new EmailTemplateService();

