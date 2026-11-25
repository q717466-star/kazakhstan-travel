'use client';

import type { BlogArticle, Destination, Review } from '@kt/core';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function ContentCmsClient({
  initialDestinations,
  initialReviews,
  initialArticles,
}: {
  initialDestinations: Destination[];
  initialReviews: Review[];
  initialArticles: BlogArticle[];
}) {
  const [tab, setTab] = useState<'destinations' | 'reviews' | 'blog'>('destinations');
  const [destinations, setDestinations] = useState(initialDestinations);
  const [reviews, setReviews] = useState(initialReviews);
  const [articles, setArticles] = useState(initialArticles);
  const [lang, setLang] = useState<'en' | 'ru' | 'kk'>('en');
  const [msg, setMsg] = useState<string | null>(null);

  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleBody, setNewArticleBody] = useState('');

  async function saveDestination(dest: Destination) {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'destination', action: 'upsert', payload: dest }),
    });
    if (res.ok) setMsg(`Saved destination: ${dest.title[lang]}`);
  }

  async function createArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!newArticleTitle.trim() || !newArticleBody.trim()) return;
    const slug =
      newArticleTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `post-${Date.now()}`;
    const payload: Omit<BlogArticle, 'id'> = {
      slug,
      category: { en: 'Field Notes', ru: 'Заметки гида', kk: 'Жол жазбалары' },
      title: { en: newArticleTitle, ru: newArticleTitle, kk: newArticleTitle },
      excerpt: {
        en: newArticleBody.slice(0, 140),
        ru: newArticleBody.slice(0, 140),
        kk: newArticleBody.slice(0, 140),
      },
      content: {
        en: [newArticleBody],
        ru: [newArticleBody],
        kk: [newArticleBody],
      },
      coverImage: '/images/tours/hero-charyn.webp',
      publishedAt: new Date().toISOString().slice(0, 10),
      readMinutes: 3,
      seoTitle: { en: newArticleTitle, ru: newArticleTitle, kk: newArticleTitle },
      seoDescription: {
        en: newArticleBody.slice(0, 140),
        ru: newArticleBody.slice(0, 140),
        kk: newArticleBody.slice(0, 140),
      },
      isPublished: true,
    };
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'article', action: 'upsert', payload }),
    });
    if (res.ok) {
      const data = (await res.json()) as { item: BlogArticle };
      setArticles([data.item, ...articles]);
      setNewArticleTitle('');
      setNewArticleBody('');
      setMsg('Blog article published.');
    }
  }

  async function removeReview(id: string) {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'review', action: 'delete', id }),
    });
    if (res.ok) {
      setReviews(reviews.filter((r) => r.id !== id));
      setMsg('Review deleted.');
    }
  }

  async function removeArticle(id: string) {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'article', action: 'delete', id }),
    });
    if (res.ok) {
      setArticles(articles.filter((a) => a.id !== id));
      setMsg('Article deleted.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-[#E5DCCB] p-1 text-xs font-semibold">
          {(['destinations', 'reviews', 'blog'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 capitalize ${
                tab === t ? 'bg-[#163024] text-white' : 'text-[#1B1E1D]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-full bg-[#F2ECE1] p-1 text-xs font-semibold">
          {(['en', 'ru', 'kk'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 uppercase ${
                lang === l ? 'bg-[#163024] text-white' : 'text-[#1B1E1D]'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <p className="rounded-xl bg-[#F2ECE1] px-4 py-2.5 text-xs font-semibold text-[#163024]">
          {msg}
        </p>
      )}

      {tab === 'destinations' && (
        <div className="grid gap-4 md:grid-cols-2">
          {destinations.map((dest, idx) => (
            <div
              key={dest.id}
              className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5 space-y-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-meta text-xs text-[#B85A3A]">{dest.slug}</span>
                <label className="inline-flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={dest.isFeatured}
                    onChange={(e) => {
                      const next = [...destinations];
                      next[idx] = { ...dest, isFeatured: e.target.checked };
                      setDestinations(next);
                    }}
                  />
                  <span>Featured on Home</span>
                </label>
              </div>

              <input
                type="text"
                value={dest.title[lang]}
                onChange={(e) => {
                  const next = [...destinations];
                  next[idx] = { ...dest, title: { ...dest.title, [lang]: e.target.value } };
                  setDestinations(next);
                }}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 font-semibold"
              />
              <textarea
                rows={2}
                value={dest.summary[lang]}
                onChange={(e) => {
                  const next = [...destinations];
                  next[idx] = { ...dest, summary: { ...dest.summary, [lang]: e.target.value } };
                  setDestinations(next);
                }}
                className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => void saveDestination(dest)}
                className="rounded-full bg-[#163024] px-4 py-2 text-xs font-semibold text-white"
              >
                Save Destination
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5"
            >
              <div>
                <p className="font-semibold text-sm">
                  {rev.authorName} · {rev.authorOrigin} ({rev.travelDate})
                </p>
                <p className="mt-1 text-sm text-[#555C58]">{rev.body[lang] || rev.body.en}</p>
              </div>
              <button
                type="button"
                onClick={() => void removeReview(rev.id)}
                className="rounded-lg p-2 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'blog' && (
        <div className="space-y-6">
          <form
            onSubmit={createArticle}
            className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5 space-y-3"
          >
            <h3 className="font-display text-2xl font-semibold">Publish New Blog Dispatch</h3>
            <input
              type="text"
              required
              value={newArticleTitle}
              onChange={(e) => setNewArticleTitle(e.target.value)}
              placeholder="Article title..."
              className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3.5 py-2.5 text-sm"
            />
            <textarea
              rows={3}
              required
              value={newArticleBody}
              onChange={(e) => setNewArticleBody(e.target.value)}
              placeholder="Write article text..."
              className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#163024] px-5 py-2.5 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Publish Article</span>
            </button>
          </form>

          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5"
              >
                <div>
                  <span className="font-mono-meta text-xs text-[#B85A3A]">{art.publishedAt}</span>
                  <h4 className="font-semibold text-base">{art.title[lang] || art.title.en}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => void removeArticle(art.id)}
                  className="rounded-lg p-2 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
