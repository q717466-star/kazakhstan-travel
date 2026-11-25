import crypto from 'node:crypto';
import { getDb } from '../db/client.js';
import type { BlogArticle, Destination, LocalizedText, Review } from '../types.js';

export function listDestinations(featuredOnly = false): Destination[] {
  const db = getDb();
  const rows = db
    .prepare(
      featuredOnly
        ? `SELECT data_json FROM destinations WHERE is_featured = 1 ORDER BY sort_order ASC`
        : `SELECT data_json FROM destinations ORDER BY sort_order ASC`
    )
    .all() as unknown as Array<{ data_json: string }>;
  return rows.map((r) => JSON.parse(r.data_json) as Destination);
}

export function upsertDestination(dest: Omit<Destination, 'id'> & { id?: string }): Destination {
  const db = getDb();
  const item: Destination = {
    ...dest,
    id: dest.id || `dest_${crypto.randomUUID().slice(0, 8)}`,
  };
  db.prepare(
    `INSERT INTO destinations (
       id, slug, country, region_tag, lat, lng, elevation_m, sort_order, is_featured, image, data_json
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       slug = excluded.slug,
       country = excluded.country,
       region_tag = excluded.region_tag,
       lat = excluded.lat,
       lng = excluded.lng,
       elevation_m = excluded.elevation_m,
       sort_order = excluded.sort_order,
       is_featured = excluded.is_featured,
       image = excluded.image,
       data_json = excluded.data_json`
  ).run(
    item.id,
    item.slug,
    item.country,
    item.regionTag,
    item.lat,
    item.lng,
    item.elevationM,
    item.sortOrder,
    item.isFeatured ? 1 : 0,
    item.image,
    JSON.stringify(item)
  );
  return item;
}

export function deleteDestination(id: string): boolean {
  const db = getDb();
  return db.prepare(`DELETE FROM destinations WHERE id = ?`).run(id).changes > 0;
}

export function listReviews(featuredOnly = false): Review[] {
  const db = getDb();
  const rows = db
    .prepare(
      featuredOnly
        ? `SELECT data_json FROM reviews WHERE is_featured = 1 ORDER BY travel_date DESC`
        : `SELECT data_json FROM reviews ORDER BY travel_date DESC`
    )
    .all() as unknown as Array<{ data_json: string }>;
  return rows.map((r) => JSON.parse(r.data_json) as Review);
}

export function upsertReview(rev: Omit<Review, 'id'> & { id?: string }): Review {
  const db = getDb();
  const item: Review = {
    ...rev,
    id: rev.id || `rev_${crypto.randomUUID().slice(0, 8)}`,
  };
  db.prepare(
    `INSERT INTO reviews (id, author_name, author_origin, travel_date, rating, tour_code, is_featured, data_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       author_name = excluded.author_name,
       author_origin = excluded.author_origin,
       travel_date = excluded.travel_date,
       rating = excluded.rating,
       tour_code = excluded.tour_code,
       is_featured = excluded.is_featured,
       data_json = excluded.data_json`
  ).run(
    item.id,
    item.authorName,
    item.authorOrigin,
    item.travelDate,
    item.rating,
    item.tourCode,
    item.isFeatured ? 1 : 0,
    JSON.stringify(item)
  );
  return item;
}

export function deleteReview(id: string): boolean {
  const db = getDb();
  return db.prepare(`DELETE FROM reviews WHERE id = ?`).run(id).changes > 0;
}

export function listBlogArticles(publishedOnly = true): BlogArticle[] {
  const db = getDb();
  const rows = db
    .prepare(
      publishedOnly
        ? `SELECT data_json FROM blog_articles WHERE is_published = 1 ORDER BY published_at DESC`
        : `SELECT data_json FROM blog_articles ORDER BY published_at DESC`
    )
    .all() as unknown as Array<{ data_json: string }>;
  return rows.map((r) => JSON.parse(r.data_json) as BlogArticle);
}

export function getBlogArticleBySlug(slug: string): BlogArticle | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT data_json FROM blog_articles WHERE slug = ?`)
    .get(slug.trim()) as unknown as { data_json: string } | undefined;
  return row ? (JSON.parse(row.data_json) as BlogArticle) : null;
}

export function upsertBlogArticle(art: Omit<BlogArticle, 'id'> & { id?: string }): BlogArticle {
  const db = getDb();
  const item: BlogArticle = {
    ...art,
    id: art.id || `blog_${crypto.randomUUID().slice(0, 8)}`,
  };
  db.prepare(
    `INSERT INTO blog_articles (id, slug, cover_image, published_at, read_minutes, is_published, data_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       slug = excluded.slug,
       cover_image = excluded.cover_image,
       published_at = excluded.published_at,
       read_minutes = excluded.read_minutes,
       is_published = excluded.is_published,
       data_json = excluded.data_json`
  ).run(
    item.id,
    item.slug,
    item.coverImage,
    item.publishedAt,
    item.readMinutes,
    item.isPublished ? 1 : 0,
    JSON.stringify(item)
  );
  return item;
}

export function deleteBlogArticle(id: string): boolean {
  const db = getDb();
  return db.prepare(`DELETE FROM blog_articles WHERE id = ?`).run(id).changes > 0;
}

export interface SiteCmsSettings {
  heroHeadline?: LocalizedText;
  heroSubheadline?: LocalizedText;
  seoHomeTitle?: LocalizedText;
  seoHomeDescription?: LocalizedText;
  whatsappPhone?: string;
  telegramUsername?: string;
  contactEmail?: string;
}

export function getPageBlock<T = Record<string, unknown>>(key: string): T | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT data_json FROM page_blocks WHERE key = ?`)
    .get(key) as unknown as { data_json: string } | undefined;
  return row ? (JSON.parse(row.data_json) as T) : null;
}

export function upsertPageBlock<T = Record<string, unknown>>(key: string, data: T): T {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO page_blocks (key, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
  ).run(key, JSON.stringify(data), now);
  return data;
}
