import { NextRequest, NextResponse } from 'next/server';
import { knowledgeBaseService } from '@/lib/knowledge-base-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const articleSchema = z.object({
  articleCode: z.string(),
  articleTitle: z.string(),
  articleContent: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  author: z.string(),
});

const categorySchema = z.object({
  categoryCode: z.string(),
  categoryName: z.string(),
  description: z.string(),
});

const commentSchema = z.object({
  articleId: z.string(),
  commentCode: z.string(),
  commentText: z.string(),
  author: z.string(),
  rating: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await knowledgeBaseService.getKnowledgeMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching knowledge data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-article') {
      const body = await request.json();
      const { articleCode, articleTitle, articleContent, category, tags, author } =
        articleSchema.parse(body);

      const article = await knowledgeBaseService.createArticle(
        session.companyId,
        articleCode,
        articleTitle,
        articleContent,
        category,
        tags,
        author
      );

      return NextResponse.json(article, { status: 201 });
    } else if (action === 'publish-article') {
      const body = await request.json();
      const { articleId } = z.object({ articleId: z.string() }).parse(body);

      const article = await knowledgeBaseService.publishArticle(articleId);
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

      return NextResponse.json(article);
    } else if (action === 'create-category') {
      const body = await request.json();
      const { categoryCode, categoryName, description } = categorySchema.parse(body);

      const category = await knowledgeBaseService.createCategory(
        session.companyId,
        categoryCode,
        categoryName,
        description
      );

      return NextResponse.json(category, { status: 201 });
    } else if (action === 'add-comment') {
      const body = await request.json();
      const { articleId, commentCode, commentText, author, rating } = commentSchema.parse(body);

      const comment = await knowledgeBaseService.addComment(
        articleId,
        commentCode,
        commentText,
        author,
        rating
      );

      return NextResponse.json(comment, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing knowledge action:', error);
    return NextResponse.json(
      { error: 'Failed to process knowledge action' },
      { status: 500 }
    );
  }
}

