import nodemailer from 'nodemailer';
import { emailTemplateService } from './email-template-service';

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailLog {
  id: string;
  companyId: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt?: Date;
  createdAt: Date;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  /**
   * Initialize the email service with SMTP config
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('Email service not fully configured. Check SMTP_* environment variables.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Send a raw email
   */
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      await this.initialize();
    }

    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not configured. Check SMTP environment variables.',
      };
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        ...(options.cc && {
          cc: Array.isArray(options.cc) ? options.cc.join(',') : options.cc,
        }),
        ...(options.bcc && {
          bcc: Array.isArray(options.bcc) ? options.bcc.join(',') : options.bcc,
        }),
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent || options.htmlContent.replace(/<[^>]*>/g, ''),
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Failed to send email:', errorMsg);
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Send email using a template
   */
  async sendFromTemplate(
    templateId: string,
    companyId: string,
    to: string | string[],
    variables: Record<string, any>,
    cc?: string | string[],
    bcc?: string | string[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = await emailTemplateService.getTemplate(companyId, templateId);

    if (!template) {
      return {
        success: false,
        error: `Template ${templateId} not found`,
      };
    }

    if (!template.enabled) {
      return {
        success: false,
        error: `Template ${templateId} is disabled`,
      };
    }

    const rendered = await emailTemplateService.renderTemplate(template, variables);

    return this.send({
      to,
      cc,
      bcc,
      subject: rendered.subject,
      htmlContent: rendered.html,
      textContent: rendered.text,
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    companyId: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      orderDate: string;
      totalAmount: string;
      items?: Array<{ name: string; quantity: number; price: string }>;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
      <h2>Order Confirmation</h2>
      <p>Dear ${orderData.customerName},</p>
      <p>Thank you for your order! Here are the details:</p>
      <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
      <p><strong>Total Amount:</strong> ${orderData.totalAmount}</p>
      ${
        orderData.items
          ? `<h3>Items:</h3>
        <ul>
          ${orderData.items.map((item) => `<li>${item.name} (${item.quantity}x ${item.price})</li>`).join('')}
        </ul>`
          : ''
      }
      <p>We will notify you when your order ships.</p>
      <p>Best regards,<br>NexaGestion Team</p>
    `;

    const result = await this.send({
      to: email,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      htmlContent,
    });

    return { success: result.success, error: result.error };
  }

  /**
   * Send invoice email
   */
  async sendInvoice(
    email: string,
    companyId: string,
    invoiceData: {
      invoiceNumber: string;
      customerName: string;
      invoiceDate: string;
      dueDate: string;
      totalAmount: string;
      items?: Array<{ description: string; quantity: number; unitPrice: string; total: string }>;
    },
    invoiceAttachment?: { filename: string; content: Buffer | string }
  ): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
      <h2>Invoice</h2>
      <p>Dear ${invoiceData.customerName},</p>
      <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
      <p><strong>Invoice Date:</strong> ${invoiceData.invoiceDate}</p>
      <p><strong>Due Date:</strong> ${invoiceData.dueDate}</p>
      ${
        invoiceData.items
          ? `<h3>Invoice Items:</h3>
        <table border="1" cellpadding="5">
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
          ${invoiceData.items
            .map(
              (item) => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice}</td>
            <td>${item.total}</td>
          </tr>
          `
            )
            .join('')}
        </table>`
          : ''
      }
      <p><strong>Total Amount:</strong> ${invoiceData.totalAmount}</p>
      <p>Please make payment by the due date. Thank you for your business!</p>
      <p>Best regards,<br>NexaGestion Team</p>
    `;

    const attachments = invoiceAttachment ? [invoiceAttachment] : undefined;

    const result = await this.send({
      to: email,
      subject: `Invoice ${invoiceData.invoiceNumber}`,
      htmlContent,
      attachments,
    });

    return { success: result.success, error: result.error };
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    email: string,
    companyId: string,
    paymentData: {
      transactionId: string;
      amount: string;
      paymentDate: string;
      paymentMethod: string;
      invoiceNumber?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
      <h2>Payment Confirmation</h2>
      <p>Your payment has been received. Here are the details:</p>
      <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
      <p><strong>Amount:</strong> ${paymentData.amount}</p>
      <p><strong>Payment Date:</strong> ${paymentData.paymentDate}</p>
      <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
      ${paymentData.invoiceNumber ? `<p><strong>Invoice Number:</strong> ${paymentData.invoiceNumber}</p>` : ''}
      <p>Thank you for your payment!</p>
      <p>Best regards,<br>NexaGestion Team</p>
    `;

    const result = await this.send({
      to: email,
      subject: 'Payment Confirmation',
      htmlContent,
    });

    return { success: result.success, error: result.error };
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    resetLink: string,
    userName: string
  ): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the link below to create a new password:</p>
      <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>NexaGestion Team</p>
    `;

    const result = await this.send({
      to: email,
      subject: 'Password Reset Request',
      htmlContent,
    });

    return { success: result.success, error: result.error };
  }

  /**
   * Send welcome email
   */
  async sendWelcome(email: string, userName: string, loginUrl: string): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
      <h2>Welcome to NexaGestion!</h2>
      <p>Hi ${userName},</p>
      <p>Your account has been created successfully. You can now log in to your account:</p>
      <p><a href="${loginUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In</a></p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>NexaGestion Team</p>
    `;

    const result = await this.send({
      to: email,
      subject: 'Welcome to NexaGestion!',
      htmlContent,
    });

    return { success: result.success, error: result.error };
  }

  /**
   * Send notification email
   */
  async sendNotification(
    email: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<{ success: boolean; error?: string }> {
    const htmlContent = `
      <h2>${title}</h2>
      <p>${message}</p>
      ${
        actionUrl && actionText
          ? `<p><a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">${actionText}</a></p>`
          : ''
      }
      <p>Best regards,<br>NexaGestion Team</p>
    `;

    const result = await this.send({
      to: email,
      subject: title,
      htmlContent,
    });

    return { success: result.success, error: result.error };
  }

  /**
   * Check if email service is properly configured
   */
  isConfigured(): boolean {
    return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  /**
   * Get current email configuration status
   */
  getStatus(): {
    configured: boolean;
    initialized: boolean;
    host?: string;
    user?: string;
  } {
    return {
      configured: this.isConfigured(),
      initialized: this.initialized,
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
    };
  }
}

export const emailService = new EmailService();
