// Simple in-memory search service (replace with Elasticsearch in production)
const searchIndex: Map<string, Map<string, Record<string, any>>> = new Map();

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchFilters {
  type?: string;
  companyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  tags?: string[];
}

export class SearchService {
  async indexDocument(
    index: string,
    id: string,
    document: Record<string, any>
  ): Promise<void> {
    try {
      if (!searchIndex.has(index)) {
        searchIndex.set(index, new Map());
      }
      searchIndex.get(index)!.set(id, {
        ...document,
        indexed_at: new Date(),
      });
    } catch (error) {
      console.error('Error indexing document:', error);
      throw error;
    }
  }

  async search(
    query: string,
    filters?: SearchFilters,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Search through all indices
      for (const [, documents] of searchIndex) {
        for (const [id, doc] of documents) {
          // Apply filters
          if (filters?.type && doc.type !== filters.type) continue;
          if (filters?.companyId && doc.companyId !== filters.companyId) continue;
          if (filters?.status && doc.status !== filters.status) continue;

          // Simple text search
          const title = (doc.title || '').toLowerCase();
          const description = (doc.description || '').toLowerCase();
          if (title.includes(queryLower) || description.includes(queryLower)) {
            results.push({
              id,
              type: doc.type,
              title: doc.title,
              description: doc.description,
              score: title.includes(queryLower) ? 2 : 1,
              metadata: doc,
            });
          }
        }
      }

      // Sort by score and apply pagination
      return results
        .sort((a, b) => b.score - a.score)
        .slice(offset, offset + limit);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }

  async deleteDocument(index: string, id: string): Promise<void> {
    try {
      if (searchIndex.has(index)) {
        searchIndex.get(index)!.delete(id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async bulkIndex(
    index: string,
    documents: Array<{ id: string; data: Record<string, any> }>
  ): Promise<void> {
    try {
      if (!searchIndex.has(index)) {
        searchIndex.set(index, new Map());
      }
      const indexMap = searchIndex.get(index)!;
      for (const { id, data } of documents) {
        indexMap.set(id, data);
      }
    } catch (error) {
      console.error('Error bulk indexing:', error);
      throw error;
    }
  }

  async createIndex(index: string, mappings: Record<string, any>): Promise<void> {
    try {
      if (!searchIndex.has(index)) {
        searchIndex.set(index, new Map());
      }
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }
  }
}

export const searchService = new SearchService();

