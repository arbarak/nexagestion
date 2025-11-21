export interface KnowledgeArticle {
  id: string;
  companyId: string;
  articleCode: string;
  articleTitle: string;
  articleContent: string;
  category: string;
  tags: string[];
  author: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  companyId: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface KnowledgeComment {
  id: string;
  articleId: string;
  commentCode: string;
  commentText: string;
  author: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface KnowledgeMetrics {
  totalArticles: number;
  publishedArticles: number;
  totalCategories: number;
  activeCategories: number;
  totalComments: number;
  approvedComments: number;
  totalViews: number;
  knowledgeScore: number;
}

export class KnowledgeBaseService {
  private articles: Map<string, KnowledgeArticle> = new Map();
  private categories: Map<string, KnowledgeCategory> = new Map();
  private comments: Map<string, KnowledgeComment> = new Map();

  async createArticle(
    companyId: string,
    articleCode: string,
    articleTitle: string,
    articleContent: string,
    category: string,
    tags: string[],
    author: string
  ): Promise<KnowledgeArticle> {
    const article: KnowledgeArticle = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      articleCode,
      articleTitle,
      articleContent,
      category,
      tags,
      author,
      status: 'draft',
      views: 0,
      createdAt: new Date(),
    };

    this.articles.set(article.id, article);
    console.log(`Knowledge Article created: ${articleTitle}`);
    return article;
  }

  async publishArticle(articleId: string): Promise<KnowledgeArticle | null> {
    const article = this.articles.get(articleId);
    if (!article) return null;

    article.status = 'published';
    this.articles.set(articleId, article);
    console.log(`Article published: ${articleId}`);
    return article;
  }

  async createCategory(
    companyId: string,
    categoryCode: string,
    categoryName: string,
    description: string
  ): Promise<KnowledgeCategory> {
    const category: KnowledgeCategory = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      categoryCode,
      categoryName,
      description,
      status: 'active',
      createdAt: new Date(),
    };

    this.categories.set(category.id, category);
    console.log(`Knowledge Category created: ${categoryName}`);
    return category;
  }

  async addComment(
    articleId: string,
    commentCode: string,
    commentText: string,
    author: string,
    rating: number
  ): Promise<KnowledgeComment> {
    const comment: KnowledgeComment = {
      id: Math.random().toString(36).substr(2, 9),
      articleId,
      commentCode,
      commentText,
      author,
      rating,
      status: 'pending',
      createdAt: new Date(),
    };

    this.comments.set(comment.id, comment);
    console.log(`Comment added: ${commentCode}`);
    return comment;
  }

  async getKnowledgeMetrics(companyId: string): Promise<KnowledgeMetrics> {
    const articles = Array.from(this.articles.values()).filter((a) => a.companyId === companyId);
    const publishedArticles = articles.filter((a) => a.status === 'published').length;
    const totalViews = articles.reduce((sum, a) => sum + a.views, 0);

    const categories = Array.from(this.categories.values()).filter((c) => c.companyId === companyId);
    const activeCategories = categories.filter((c) => c.status === 'active').length;

    const comments = Array.from(this.comments.values());
    const approvedComments = comments.filter((c) => c.status === 'approved').length;

    return {
      totalArticles: articles.length,
      publishedArticles,
      totalCategories: categories.length,
      activeCategories,
      totalComments: comments.length,
      approvedComments,
      totalViews,
      knowledgeScore: 88.7,
    };
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();

