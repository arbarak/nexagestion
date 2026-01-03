import { prisma } from './prisma';

export interface WebhookEvent {
  id?: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed';
  deliveryAttempts?: number;
  nextRetryAt?: Date;
  error?: string;
  createdAt?: Date;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  eventId: string;
  attempt: number;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  createdAt: Date;
}

export class WebhookDeliveryService {
  private maxRetries = 5;
  private baseRetryDelay = 60 * 1000; // 1 minute

  /**
   * Queue a webhook event for delivery
   */
  async queueEvent(webhookId: string, eventType: string, payload: Record<string, any>): Promise<WebhookEvent> {
    const event: WebhookEvent = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      webhookId,
      eventType,
      payload,
      status: 'pending',
      deliveryAttempts: 0,
      createdAt: new Date(),
    };

    // In production, save to database
    // await prisma.webhookEvent.create({ data: event });

    // Immediately attempt delivery
    await this.deliverEvent(event);

    return event;
  }

  /**
   * Deliver a webhook event
   */
  async deliverEvent(event: WebhookEvent): Promise<void> {
    try {
      const webhook = await prisma.webhook.findUnique({
        where: { id: event.webhookId },
      });

      if (!webhook) {
        console.error(`Webhook ${event.webhookId} not found`);
        return;
      }

      if (!webhook.active) {
        console.log(`Webhook ${event.webhookId} is inactive`);
        return;
      }

      const deliveryAttempts = (event.deliveryAttempts || 0) + 1;
      const startTime = Date.now();

      try {
        const response = await this.sendWebhookRequest(webhook.url, event, webhook.headers);
        const responseTime = Date.now() - startTime;

        // Log successful delivery
        await this.logDelivery({
          webhookId: event.webhookId,
          eventId: event.id!,
          attempt: deliveryAttempts,
          statusCode: response.status,
          responseTime,
          createdAt: new Date(),
          id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        });

        // Mark event as delivered
        console.log(`Webhook ${event.webhookId} delivered successfully on attempt ${deliveryAttempts}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);

        if (deliveryAttempts < this.maxRetries) {
          // Schedule retry
          const nextRetryAt = new Date(Date.now() + this.baseRetryDelay * Math.pow(2, deliveryAttempts - 1));

          console.warn(
            `Webhook ${event.webhookId} delivery failed. Retry attempt ${deliveryAttempts} of ${this.maxRetries}. Next retry at ${nextRetryAt.toISOString()}`
          );

          // In production, update event in database with nextRetryAt
          // await this.scheduleRetry(event.id!, nextRetryAt);
        } else {
          // Max retries exceeded
          console.error(`Webhook ${event.webhookId} delivery failed after ${this.maxRetries} attempts`);

          // Log final failure
          await this.logDelivery({
            webhookId: event.webhookId,
            eventId: event.id!,
            attempt: deliveryAttempts,
            error: errorMsg,
            createdAt: new Date(),
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          });
        }
      }
    } catch (error) {
      console.error('Error delivering webhook:', error);
    }
  }

  /**
   * Send webhook request
   */
  private async sendWebhookRequest(
    url: string,
    event: WebhookEvent,
    headers?: Record<string, string>
  ): Promise<Response> {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'NexaGestion/1.0',
      'X-Webhook-Event': event.eventType,
      'X-Webhook-Delivery': event.id || '',
      'X-Webhook-Timestamp': new Date().toISOString(),
    };

    const allHeaders = { ...defaultHeaders, ...headers };

    const response = await fetch(url, {
      method: 'POST',
      headers: allHeaders,
      body: JSON.stringify({
        event: event.eventType,
        data: event.payload,
        timestamp: new Date().toISOString(),
      }),
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with status ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Log delivery attempt
   */
  private async logDelivery(log: WebhookDeliveryLog): Promise<void> {
    // In production, save to database
    // await prisma.webhookDeliveryLog.create({ data: log });
    console.log(`Delivery log: ${log.webhookId} - Attempt ${log.attempt} - Status: ${log.statusCode || 'error'}`);
  }

  /**
   * Get delivery logs for a webhook
   */
  async getDeliveryLogs(webhookId: string, limit: number = 50): Promise<WebhookDeliveryLog[]> {
    // In production, query from database
    // return await prisma.webhookDeliveryLog.findMany({
    //   where: { webhookId },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    // });

    return [];
  }

  /**
   * Retry failed webhooks
   */
  async retryFailedWebhooks(): Promise<number> {
    // In production, query all failed webhooks and retry them
    // const failedEvents = await prisma.webhookEvent.findMany({
    //   where: {
    //     status: 'failed',
    //     nextRetryAt: { lte: new Date() },
    //   },
    //   take: 100,
    // });

    // for (const event of failedEvents) {
    //   await this.deliverEvent(event);
    // }

    // return failedEvents.length;

    return 0;
  }

  /**
   * Handle webhook triggered events
   */
  async triggerEvent(
    companyId: string,
    eventType: string,
    entityId: string,
    entityType: string,
    data?: Record<string, any>
  ): Promise<number> {
    // Find all webhooks subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        companyId,
        active: true,
        events: {
          has: eventType,
        },
      },
    });

    console.log(`Found ${webhooks.length} webhooks for event ${eventType}`);

    const payload = {
      entityId,
      entityType,
      eventType,
      triggeredAt: new Date().toISOString(),
      ...data,
    };

    let queuedCount = 0;

    for (const webhook of webhooks) {
      try {
        await this.queueEvent(webhook.id, eventType, payload);
        queuedCount++;
      } catch (error) {
        console.error(`Failed to queue webhook ${webhook.id}:`, error);
      }
    }

    return queuedCount;
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(webhookId: string): Promise<{
    totalEvents: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    averageResponseTime: number;
    lastDelivery?: Date;
  }> {
    // In production, calculate from database
    const logs = await this.getDeliveryLogs(webhookId, 1000);

    const stats = {
      totalEvents: logs.length,
      successfulDeliveries: logs.filter((l) => l.statusCode && l.statusCode < 400).length,
      failedDeliveries: logs.filter((l) => !l.statusCode || l.statusCode >= 400).length,
      averageResponseTime:
        logs.filter((l) => l.responseTime).reduce((sum, l) => sum + (l.responseTime || 0), 0) / Math.max(logs.length, 1),
      lastDelivery: logs.length > 0 ? logs[0].createdAt : undefined,
    };

    return stats;
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(webhookId: string, testData?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    try {
      const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId },
      });

      if (!webhook) {
        return { success: false, error: 'Webhook not found' };
      }

      const testPayload = testData || {
        event: 'test',
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString(),
      };

      const response = await this.sendWebhookRequest(webhook.url, {
        id: 'test_' + Date.now(),
        webhookId,
        eventType: 'test',
        payload: testPayload,
        status: 'pending',
      });

      return { success: response.ok };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

export const webhookDeliveryService = new WebhookDeliveryService();
