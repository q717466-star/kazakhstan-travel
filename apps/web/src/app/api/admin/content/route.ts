import {
  deleteBlogArticle,
  deleteDestination,
  deleteReview,
  getPageBlock,
  listBlogArticles,
  listDestinations,
  listReviews,
  upsertBlogArticle,
  upsertDestination,
  upsertPageBlock,
  upsertReview,
  type BlogArticle,
  type Destination,
  type Review,
} from '@kt/core';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireStaffApiAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await requireStaffApiAuth(['admin', 'editor']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json({
    destinations: listDestinations(false),
    reviews: listReviews(false),
    articles: listBlogArticles(false),
    settings: getPageBlock('site_settings'),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireStaffApiAuth(['admin', 'editor']);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json()) as {
    kind: 'destination' | 'review' | 'article' | 'settings';
    action?: 'upsert' | 'delete';
    id?: string;
    payload?: unknown;
  };

  if (body.kind === 'destination') {
    if (body.action === 'delete' && body.id) {
      const deleted = deleteDestination(body.id);
      revalidatePath('/', 'layout');
      return NextResponse.json({ deleted });
    }
    const item = upsertDestination(body.payload as Destination);
    revalidatePath('/', 'layout');
    return NextResponse.json({ item });
  }

  if (body.kind === 'review') {
    if (body.action === 'delete' && body.id) {
      const deleted = deleteReview(body.id);
      revalidatePath('/', 'layout');
      return NextResponse.json({ deleted });
    }
    const item = upsertReview(body.payload as Review);
    revalidatePath('/', 'layout');
    return NextResponse.json({ item });
  }

  if (body.kind === 'article') {
    if (body.action === 'delete' && body.id) {
      const deleted = deleteBlogArticle(body.id);
      revalidatePath('/', 'layout');
      return NextResponse.json({ deleted });
    }
    const item = upsertBlogArticle(body.payload as BlogArticle);
    revalidatePath('/', 'layout');
    return NextResponse.json({ item });
  }

  if (body.kind === 'settings') {
    const item = upsertPageBlock('site_settings', body.payload as Record<string, unknown>);
    revalidatePath('/', 'layout');
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: 'Unknown content kind' }, { status: 400 });
}
