export interface NotificationTemplate {
  id: string;
  companyId: string;
  name: string;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  actionUrl?: string;
  actionLabel?: string;
  variables: string[];
  channels: ('email' | 'push' | 'in-app' | 'sms')[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationTemplateService {
  private templates: Map<string, NotificationTemplate> = new Map();

  async createTemplate(
    companyId: string,
    name: string,
    title: string,
    message: string,
    channels: NotificationTemplate['channels'],
    priority: NotificationTemplate['priority'] = 'medium',
    variables: string[] = [],
    icon?: string,
    color?: string,
    actionUrl?: string,
    actionLabel?: string
  ): Promise<NotificationTemplate> {
    const template: NotificationTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      title,
      message,
      icon,
      color,
      actionUrl,
      actionLabel,
      variables,
      channels,
      priority,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    console.log(`Created notification template: ${name}`);
    return template;
  }

  async getTemplate(companyId: string, templateId: string): Promise<NotificationTemplate | null> {
    const template = this.templates.get(templateId);
    if (template && template.companyId === companyId) {
      return template;
    }
    return null;
  }

  async getTemplates(companyId: string, priority?: string): Promise<NotificationTemplate[]> {
    const templates = Array.from(this.templates.values()).filter((t) => {
      if (t.companyId !== companyId) return false;
      if (priority && t.priority !== priority) return false;
      return true;
    });
    return templates;
  }

  async updateTemplate(
    companyId: string,
    templateId: string,
    updates: Partial<NotificationTemplate>
  ): Promise<NotificationTemplate | null> {
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
    console.log(`Updated notification template: ${templateId}`);
    return updated;
  }

  async deleteTemplate(companyId: string, templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (template && template.companyId === companyId) {
      this.templates.delete(templateId);
      console.log(`Deleted notification template: ${templateId}`);
    }
  }

  async renderTemplate(
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<{ title: string; message: string }> {
    let title = template.title;
    let message = template.message;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      message = message.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { title, message };
  }

  async validateTemplate(template: NotificationTemplate): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!template.name) errors.push('Template name is required');
    if (!template.title) errors.push('Title is required');
    if (!template.message) errors.push('Message is required');
    if (template.channels.length === 0) errors.push('At least one channel is required');

    return { valid: errors.length === 0, errors };
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      critical: '#ef4444',
    };
    return colors[priority] || '#3b82f6';
  }

  getPriorityIcon(priority: string): string {
    const icons: Record<string, string> = {
      low: 'info',
      medium: 'alert',
      high: 'warning',
      critical: 'alert-circle',
    };
    return icons[priority] || 'info';
  }
}

export const notificationTemplateService = new NotificationTemplateService();

