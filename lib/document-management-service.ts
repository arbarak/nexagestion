export interface Document {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  category: 'invoice' | 'contract' | 'report' | 'receipt' | 'other';
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
  accessCount: number;
  lastAccessedAt?: Date;
  metadata?: Record<string, any>;
}

export interface DocumentFolder {
  id: string;
  companyId: string;
  name: string;
  parentId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentManagementService {
  private documents: Map<string, Document> = new Map();
  private folders: Map<string, DocumentFolder> = new Map();
  private documentFolderMap: Map<string, string[]> = new Map();

  async createFolder(
    companyId: string,
    name: string,
    description?: string,
    parentId?: string
  ): Promise<DocumentFolder> {
    const folder: DocumentFolder = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      parentId,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.folders.set(folder.id, folder);
    console.log(`Created folder: ${name}`);
    return folder;
  }

  async uploadDocument(
    companyId: string,
    name: string,
    fileType: string,
    fileSize: number,
    mimeType: string,
    category: Document['category'],
    uploadedBy: string,
    folderId?: string,
    tags: string[] = [],
    isPublic: boolean = false,
    expiresAt?: Date,
    metadata?: Record<string, any>
  ): Promise<Document> {
    const document: Document = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      fileType,
      fileSize,
      mimeType,
      category,
      tags,
      uploadedBy,
      uploadedAt: new Date(),
      expiresAt,
      isPublic,
      accessCount: 0,
      metadata,
    };

    this.documents.set(document.id, document);

    if (folderId) {
      const docs = this.documentFolderMap.get(folderId) || [];
      docs.push(document.id);
      this.documentFolderMap.set(folderId, docs);
    }

    console.log(`Uploaded document: ${name}`);
    return document;
  }

  async getDocument(companyId: string, documentId: string): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (document && document.companyId === companyId) {
      document.accessCount++;
      document.lastAccessedAt = new Date();
      return document;
    }
    return null;
  }

  async getDocuments(
    companyId: string,
    category?: string,
    tags?: string[]
  ): Promise<Document[]> {
    const documents = Array.from(this.documents.values()).filter((d) => {
      if (d.companyId !== companyId) return false;
      if (category && d.category !== category) return false;
      if (tags && tags.length > 0) {
        return tags.some(tag => d.tags.includes(tag));
      }
      return true;
    });
    return documents;
  }

  async getFolderDocuments(companyId: string, folderId: string): Promise<Document[]> {
    const docIds = this.documentFolderMap.get(folderId) || [];
    const documents = docIds
      .map(id => this.documents.get(id))
      .filter((d): d is Document => d !== undefined && d.companyId === companyId);
    return documents;
  }

  async updateDocument(
    companyId: string,
    documentId: string,
    updates: Partial<Document>
  ): Promise<Document | null> {
    const document = this.documents.get(documentId);
    if (!document || document.companyId !== companyId) {
      return null;
    }

    const updated = {
      ...document,
      ...updates,
    };

    this.documents.set(documentId, updated);
    console.log(`Updated document: ${documentId}`);
    return updated;
  }

  async deleteDocument(companyId: string, documentId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (document && document.companyId === companyId) {
      this.documents.delete(documentId);
      console.log(`Deleted document: ${documentId}`);
    }
  }

  async deleteFolder(companyId: string, folderId: string): Promise<void> {
    const folder = this.folders.get(folderId);
    if (folder && folder.companyId === companyId) {
      this.folders.delete(folderId);
      this.documentFolderMap.delete(folderId);
      console.log(`Deleted folder: ${folderId}`);
    }
  }

  async getDocumentStats(companyId: string): Promise<{
    totalDocuments: number;
    totalSize: number;
    categoryStats: Record<string, number>;
    topTags: Array<{ tag: string; count: number }>;
  }> {
    let totalDocuments = 0;
    let totalSize = 0;
    const categoryStats: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const [, document] of this.documents) {
      if (document.companyId === companyId) {
        totalDocuments++;
        totalSize += document.fileSize;
        categoryStats[document.category] = (categoryStats[document.category] || 0) + 1;

        document.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { totalDocuments, totalSize, categoryStats, topTags };
  }

  async searchDocuments(
    companyId: string,
    query: string
  ): Promise<Document[]> {
    const lowerQuery = query.toLowerCase();
    const results = Array.from(this.documents.values()).filter((d) => {
      if (d.companyId !== companyId) return false;
      return (
        d.name.toLowerCase().includes(lowerQuery) ||
        d.description?.toLowerCase().includes(lowerQuery) ||
        d.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
    return results;
  }
}

export const documentManagementService = new DocumentManagementService();

