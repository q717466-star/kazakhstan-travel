import {
  listBlogArticles,
  listDestinations,
  listManagerNotifications,
  listReviews,
} from '@kt/core';
import { AdminShell } from '@/components/admin/AdminShell';
import { ContentCmsClient } from '@/components/admin/ContentCmsClient';
import { requireStaffPageAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const user = await requireStaffPageAuth(['admin', 'editor']);
  const destinations = listDestinations(false);
  const reviews = listReviews(false);
  const articles = listBlogArticles(false);
  const unreadCount = listManagerNotifications(50).filter((n) => !n.isRead).length;

  return (
    <AdminShell user={user} unreadCount={unreadCount}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[#1B1E1D]">
            Destinations, Reviews & Travel Blog
          </h1>
          <p className="mt-1 text-sm text-[#555C58]">
            Edit popular destination cards, manage client reviews, and publish field journal posts.
          </p>
        </div>
        <ContentCmsClient
          initialDestinations={destinations}
          initialReviews={reviews}
          initialArticles={articles}
        />
      </div>
    </AdminShell>
  );
}
