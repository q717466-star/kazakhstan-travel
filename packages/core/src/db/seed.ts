import crypto from 'node:crypto';
import { getDb, runInTransaction } from './client.js';
import { SEED_TOURS_PART1 } from './seed-data-tours-part1.js';
import { SEED_TOURS_PART2 } from './seed-data-tours-part2.js';
import { SEED_BLOG, SEED_DESTINATIONS, SEED_REVIEWS } from './seed-data-content.js';
import { hashPassword } from '../repositories/users.repo.js';
import { upsertTour } from '../repositories/tours.repo.js';
import {
  upsertBlogArticle,
  upsertDestination,
  upsertPageBlock,
  upsertReview,
} from '../repositories/content.repo.js';

let seededDbInstance: unknown = null;

export function ensureSeeded(force = false): void {
  const db = getDb();
  if (!force && seededDbInstance === db) {
    return;
  }

  const countRow = db.prepare(`SELECT COUNT(*) as c FROM tours`).get() as { c: number };
  if (!force && countRow.c > 0) {
    seededDbInstance = db;
    return;
  }

  const allTours = [...SEED_TOURS_PART1, ...SEED_TOURS_PART2];

  runInTransaction(() => {
    for (const [idx, tour] of allTours.entries()) {
      upsertTour({ ...tour, id: `tour_seed_${idx + 1}` });
    }

    for (const [idx, dest] of SEED_DESTINATIONS.entries()) {
      upsertDestination({ ...dest, id: `dest_seed_${idx + 1}` });
    }

    for (const [idx, rev] of SEED_REVIEWS.entries()) {
      upsertReview({ ...rev, id: `rev_seed_${idx + 1}` });
    }

    for (const [idx, article] of SEED_BLOG.entries()) {
      upsertBlogArticle({ ...article, id: `blog_seed_${idx + 1}` });
    }

    upsertPageBlock('site_settings', {
      whatsappPhone: process.env.WHATSAPP_DISPLAY_PHONE || '77775259885',
      telegramUsername: process.env.TELEGRAM_BOT_USERNAME || 'travel32_bot',
      contactEmail: 'kztravel@mail.ru',
      phoneDisplay: '+7 (777) 525 98 85',
      officeAddress: {
        en: 'Almaty, Kazakhstan · Dispatch 08:00–21:00 (UTC+5)',
        ru: 'Алматы, Казахстан · Координация 08:00–21:00 (UTC+5)',
        kk: 'Алматы, Қазақстан · Үйлестіру 08:00–21:00 (UTC+5)',
      },
    });

    const userCount = db.prepare(`SELECT COUNT(*) as c FROM staff_users`).get() as { c: number };
    if (userCount.c === 0) {
      const now = new Date().toISOString();
      const stmt = db.prepare(
        `INSERT INTO staff_users (id, email, full_name, role, password_hash, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, 1, ?)`
      );
      stmt.run(
        'user_admin_1',
        'admin@kazakhstan-travel.local',
        'Aidos Bekov (Admin)',
        'admin',
        hashPassword('Admin!2026'),
        now
      );
      stmt.run(
        'user_manager_1',
        'manager@kazakhstan-travel.local',
        'Dinara Sadykova (Travel Manager)',
        'manager',
        hashPassword('Manager!2026'),
        now
      );
      stmt.run(
        'user_editor_1',
        'editor@kazakhstan-travel.local',
        'Timur Alimov (Content Editor)',
        'editor',
        hashPassword('Editor!2026'),
        now
      );
    }

    const leadCount = db.prepare(`SELECT COUNT(*) as c FROM leads`).get() as { c: number };
    if (leadCount.c === 0) {
      const now = new Date().toISOString();
      const sampleLeads = [
        {
          id: 'lead_seed_1',
          num: 'KT-00001',
          channel: 'website',
          locale: 'en',
          type: 'book_tour',
          tourCode: 'CHARYN-KOLSAI-2D',
          tourTitle: '2-Day Expedition: Charyn Canyon, Kolsai & Kaindy Lakes',
          customParams: null,
          date: '2027-06-14',
          flex: 0,
          pax: 2,
          name: 'Oliver Vance (Demo)',
          method: 'email',
          val: 'oliver.vance@example.test',
          country: 'United Kingdom',
          notes: 'Prefer boutique lodge in Saty with mountain view.',
          status: 'in_progress',
        },
        {
          id: 'lead_seed_2',
          num: 'KT-00002',
          channel: 'telegram',
          locale: 'ru',
          type: 'book_tour',
          tourCode: 'ALTYN-EMEL-2D',
          tourTitle: '2-дневная экспедиция в Алтын-Эмель: Поющий бархан и горы Актау',
          customParams: null,
          date: null,
          flex: 1,
          pax: 4,
          name: 'Мария Соколова (Демо)',
          method: 'chat',
          val: 'tg:@maria_demo',
          country: 'Germany',
          notes: 'Интересует комфортный джип с детским креслом.',
          status: 'new',
        },
        {
          id: 'lead_seed_3',
          num: 'KT-00003',
          channel: 'whatsapp',
          locale: 'kk',
          type: 'plan_trip',
          tourCode: null,
          tourTitle: null,
          customParams: JSON.stringify({
            destination: 'Almaty, Charyn & Kyrgyzstan',
            durationLabel: '6-8 days',
            interests: ['Nature', 'Mountains', 'Off-road 4x4'],
          }),
          date: '2027-07-02',
          flex: 0,
          pax: 3,
          name: 'Нұрлан Ахметов (Демо)',
          method: 'chat',
          val: '+491700000003',
          country: 'Kazakhstan',
          notes: 'Асы үстіртіне шығу мүмкін бе?',
          status: 'proposal_sent',
        },
      ];

      const insertLead = db.prepare(
        `INSERT INTO leads (
           id, request_number, channel, locale, request_type, tour_code, tour_title_snapshot,
           custom_params_json, preferred_date, is_flexible_dates, participants,
           customer_name, contact_method, contact_value, country, notes,
           consent_given, consent_at, status, external_chat_id, external_user_handle,
           idempotency_key, assigned_manager_id, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, NULL, NULL, ?, NULL, ?, ?)`
      );

      const insertEvent = db.prepare(
        `INSERT INTO lead_events (id, lead_id, actor, event_type, from_status, to_status, message, created_at)
         VALUES (?, ?, 'seed', 'created', NULL, ?, ?, ?)`
      );

      const insertNotif = db.prepare(
        `INSERT INTO manager_notifications (id, lead_id, request_number, channel, target_url, summary, delivery_status, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'simulated', ?, ?)`
      );

      for (const s of sampleLeads) {
        insertLead.run(
          s.id,
          s.num,
          s.channel,
          s.locale,
          s.type,
          s.tourCode,
          s.tourTitle,
          s.customParams,
          s.date,
          s.flex,
          s.pax,
          s.name,
          s.method,
          s.val,
          s.country,
          s.notes,
          now,
          s.status,
          `seed:${s.num}`,
          now,
          now
        );
        insertEvent.run(
          `evt_${crypto.randomUUID().slice(0, 8)}`,
          s.id,
          s.status,
          `Demo seed request via ${s.channel}`,
          now
        );
        insertNotif.run(
          `notif_${crypto.randomUUID().slice(0, 8)}`,
          s.id,
          s.num,
          s.channel,
          `/admin/leads/${s.id}`,
          `${s.tourTitle || 'Custom Trip'} · ${s.pax} pax`,
          s.status === 'new' ? 0 : 1,
          now
        );
      }

      db.prepare(`UPDATE lead_sequence SET next_val = 4 WHERE id = 1`).run();
    }
  });

  seededDbInstance = db;
}
