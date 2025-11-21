export interface Message {
  id: string;
  companyId: string;
  messageCode: string;
  senderId: string;
  recipientId: string;
  messageContent: string;
  messageType: 'text' | 'email' | 'notification' | 'alert';
  status: 'sent' | 'delivered' | 'read' | 'archived';
  createdAt: Date;
}

export interface Announcement {
  id: string;
  companyId: string;
  announcementCode: string;
  announcementTitle: string;
  announcementContent: string;
  priority: 'high' | 'medium' | 'low';
  targetAudience: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
}

export interface CommunicationChannel {
  id: string;
  companyId: string;
  channelCode: string;
  channelName: string;
  channelType: 'team' | 'department' | 'project' | 'general';
  description: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface CommunicationMetrics {
  totalMessages: number;
  deliveredMessages: number;
  readMessages: number;
  totalAnnouncements: number;
  publishedAnnouncements: number;
  totalChannels: number;
  activeChannels: number;
  communicationScore: number;
}

export class CommunicationService {
  private messages: Map<string, Message> = new Map();
  private announcements: Map<string, Announcement> = new Map();
  private channels: Map<string, CommunicationChannel> = new Map();

  async sendMessage(
    companyId: string,
    messageCode: string,
    senderId: string,
    recipientId: string,
    messageContent: string,
    messageType: 'text' | 'email' | 'notification' | 'alert'
  ): Promise<Message> {
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      messageCode,
      senderId,
      recipientId,
      messageContent,
      messageType,
      status: 'sent',
      createdAt: new Date(),
    };

    this.messages.set(message.id, message);
    console.log(`Message sent: ${messageCode}`);
    return message;
  }

  async publishAnnouncement(
    companyId: string,
    announcementCode: string,
    announcementTitle: string,
    announcementContent: string,
    priority: 'high' | 'medium' | 'low',
    targetAudience: string
  ): Promise<Announcement> {
    const announcement: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      announcementCode,
      announcementTitle,
      announcementContent,
      priority,
      targetAudience,
      status: 'published',
      createdAt: new Date(),
    };

    this.announcements.set(announcement.id, announcement);
    console.log(`Announcement published: ${announcementTitle}`);
    return announcement;
  }

  async createChannel(
    companyId: string,
    channelCode: string,
    channelName: string,
    channelType: 'team' | 'department' | 'project' | 'general',
    description: string
  ): Promise<CommunicationChannel> {
    const channel: CommunicationChannel = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      channelCode,
      channelName,
      channelType,
      description,
      status: 'active',
      createdAt: new Date(),
    };

    this.channels.set(channel.id, channel);
    console.log(`Communication Channel created: ${channelName}`);
    return channel;
  }

  async getCommunicationMetrics(companyId: string): Promise<CommunicationMetrics> {
    const messages = Array.from(this.messages.values()).filter((m) => m.companyId === companyId);
    const deliveredMessages = messages.filter((m) => m.status === 'delivered').length;
    const readMessages = messages.filter((m) => m.status === 'read').length;

    const announcements = Array.from(this.announcements.values()).filter((a) => a.companyId === companyId);
    const publishedAnnouncements = announcements.filter((a) => a.status === 'published').length;

    const channels = Array.from(this.channels.values()).filter((c) => c.companyId === companyId);
    const activeChannels = channels.filter((c) => c.status === 'active').length;

    return {
      totalMessages: messages.length,
      deliveredMessages,
      readMessages,
      totalAnnouncements: announcements.length,
      publishedAnnouncements,
      totalChannels: channels.length,
      activeChannels,
      communicationScore: 91.2,
    };
  }
}

export const communicationService = new CommunicationService();

