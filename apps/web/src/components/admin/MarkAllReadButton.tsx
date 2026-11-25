'use client';

import { CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MarkAllReadButton({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (unreadCount === 0) return null;

  async function onClick() {
    setBusy(true);
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3.5 py-1.5 text-xs font-semibold text-[#163024] hover:bg-[#F2ECE1] disabled:opacity-50"
    >
      <CheckCheck className="h-3.5 w-3.5" />
      <span>Mark all read</span>
    </button>
  );
}
