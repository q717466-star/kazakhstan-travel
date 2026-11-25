import crypto from 'node:crypto';
import { getDb } from '../db/client.js';
import type {
  ActivityType,
  DifficultyLevel,
  SeasonType,
  Tour,
  TourCategory,
} from '../types.js';

export interface TourFilters {
  includeInactive?: boolean;
  featuredOnly?: boolean;
  country?: string;
  region?: string;
  category?: TourCategory | string;
  durationBucket?: '1' | '2-3' | '4+' | string;
  maxPrice?: number;
  minPrice?: number;
  season?: SeasonType | string;
  activity?: ActivityType | string;
  difficulty?: DifficultyLevel | string;
  guests?: number;
  query?: string;
  sort?: 'recommended' | 'popularity' | 'price_asc' | 'price_desc' | 'duration_asc' | 'duration_desc';
}

interface TourRow {
  data_json: string;
}

function parseTour(row: TourRow): Tour {
  return JSON.parse(row.data_json) as Tour;
}

export function listTours(filters: TourFilters = {}): Tour[] {
  const db = getDb();
  const rows = db.prepare(`SELECT data_json FROM tours`).all() as unknown as TourRow[];
  let items = rows.map(parseTour);

  if (!filters.includeInactive) {
    items = items.filter((t) => t.isActive);
  }
  if (filters.featuredOnly) {
    items = items.filter((t) => t.isFeatured);
  }
  if (filters.country && filters.country !== 'all') {
    const target = filters.country.toLowerCase();
    items = items.filter((t) => t.country.toLowerCase() === target);
  }
  if (filters.region && filters.region !== 'all') {
    const r = filters.region.toLowerCase();
    items = items.filter(
      (t) =>
        t.region.en.toLowerCase().includes(r) ||
        t.region.ru.toLowerCase().includes(r) ||
        t.region.kk.toLowerCase().includes(r) ||
        t.slug.toLowerCase().includes(r)
    );
  }
  if (filters.category && filters.category !== 'all') {
    items = items.filter((t) => t.category === filters.category);
  }
  if (filters.durationBucket && filters.durationBucket !== 'all') {
    if (filters.durationBucket === '1') {
      items = items.filter((t) => t.durationDays === 1);
    } else if (filters.durationBucket === '2-3') {
      items = items.filter((t) => t.durationDays >= 2 && t.durationDays <= 3);
    } else if (filters.durationBucket === '4+') {
      items = items.filter((t) => t.durationDays >= 4);
    }
  }
  if (typeof filters.minPrice === 'number' && !Number.isNaN(filters.minPrice)) {
    items = items.filter((t) => t.priceFromUsd >= filters.minPrice!);
  }
  if (typeof filters.maxPrice === 'number' && !Number.isNaN(filters.maxPrice) && filters.maxPrice > 0) {
    items = items.filter((t) => t.priceFromUsd <= filters.maxPrice!);
  }
  if (filters.season && filters.season !== 'all') {
    items = items.filter((t) => t.seasons.includes(filters.season as SeasonType));
  }
  if (filters.activity && filters.activity !== 'all') {
    items = items.filter((t) => t.activities.includes(filters.activity as ActivityType));
  }
  if (filters.difficulty && filters.difficulty !== 'all') {
    items = items.filter((t) => t.difficulty === filters.difficulty);
  }
  if (typeof filters.guests === 'number' && filters.guests > 0) {
    items = items.filter((t) => t.maxGuests >= filters.guests!);
  }
  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    items = items.filter((t) => {
      const haystack = [
        t.code,
        t.slug,
        t.title.en,
        t.title.ru,
        t.title.kk,
        t.subtitle.en,
        t.subtitle.ru,
        t.subtitle.kk,
        t.region.en,
        t.region.ru,
        t.region.kk,
        ...t.highlights.en,
        ...t.highlights.ru,
        ...t.highlights.kk,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  switch (filters.sort) {
    case 'popularity':
      items.sort((a, b) => b.popularityScore - a.popularityScore);
      break;
    case 'price_asc':
      items.sort((a, b) => a.priceFromUsd - b.priceFromUsd);
      break;
    case 'price_desc':
      items.sort((a, b) => b.priceFromUsd - a.priceFromUsd);
      break;
    case 'duration_asc':
      items.sort((a, b) => a.durationDays - b.durationDays);
      break;
    case 'duration_desc':
      items.sort((a, b) => b.durationDays - a.durationDays);
      break;
    case 'recommended':
    default:
      items.sort((a, b) => a.recommendedOrder - b.recommendedOrder);
      break;
  }

  return items;
}

export function getTourBySlug(slug: string): Tour | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT data_json FROM tours WHERE slug = ?`)
    .get(slug.trim()) as unknown as TourRow | undefined;
  return row ? parseTour(row) : null;
}

export function getTourByCode(code: string): Tour | null {
  const db = getDb();
  const normalized = code.trim().toUpperCase();
  const row = db
    .prepare(`SELECT data_json FROM tours WHERE upper(code) = ?`)
    .get(normalized) as unknown as TourRow | undefined;
  return row ? parseTour(row) : null;
}

export function getTourById(id: string): Tour | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT data_json FROM tours WHERE id = ?`)
    .get(id.trim()) as unknown as TourRow | undefined;
  return row ? parseTour(row) : null;
}

export function upsertTour(tourInput: Omit<Tour, 'id' | 'updatedAt'> & { id?: string }): Tour {
  const db = getDb();
  const now = new Date().toISOString();
  const tour: Tour = {
    ...tourInput,
    id: tourInput.id || `tour_${crypto.randomUUID().slice(0, 8)}`,
    code: tourInput.code.trim().toUpperCase(),
    slug: tourInput.slug.trim().toLowerCase(),
    updatedAt: now,
  };

  db.prepare(
    `INSERT INTO tours (
       id, code, slug, category, country, duration_days, price_from_usd,
       difficulty, max_guests, popularity_score, recommended_order,
       is_featured, is_active, cover_image, data_json, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       code = excluded.code,
       slug = excluded.slug,
       category = excluded.category,
       country = excluded.country,
       duration_days = excluded.duration_days,
       price_from_usd = excluded.price_from_usd,
       difficulty = excluded.difficulty,
       max_guests = excluded.max_guests,
       popularity_score = excluded.popularity_score,
       recommended_order = excluded.recommended_order,
       is_featured = excluded.is_featured,
       is_active = excluded.is_active,
       cover_image = excluded.cover_image,
       data_json = excluded.data_json,
       updated_at = excluded.updated_at`
  ).run(
    tour.id,
    tour.code,
    tour.slug,
    tour.category,
    tour.country,
    tour.durationDays,
    tour.priceFromUsd,
    tour.difficulty,
    tour.maxGuests,
    tour.popularityScore,
    tour.recommendedOrder,
    tour.isFeatured ? 1 : 0,
    tour.isActive ? 1 : 0,
    tour.coverImage,
    JSON.stringify(tour),
    tour.updatedAt
  );

  return tour;
}

export function deleteTourById(id: string): boolean {
  const db = getDb();
  const res = db.prepare(`DELETE FROM tours WHERE id = ?`).run(id);
  return res.changes > 0;
}
