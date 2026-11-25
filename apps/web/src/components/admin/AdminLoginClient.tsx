'use client';

import { Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function AdminLoginClient({ showDemoHint }: { showDemoHint: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doLogin(loginEmail: string, loginPass: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#163024] p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#FAF8F4] p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#163024] text-white">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-[#1B1E1D]">
              Kazakhstan Travel CRM
            </h1>
            <p className="font-mono-meta text-[11px] uppercase tracking-wider text-[#555C58]">
              Staff Operations & CMS
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void doLogin(email, password);
          }}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#1B1E1D]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[rgba(27,30,29,0.16)] bg-white px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#1B1E1D]">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[rgba(27,30,29,0.16)] bg-white px-3.5 py-2.5 text-sm"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-[#B85A3A]/15 px-3.5 py-2 text-xs font-medium text-[#9B482C]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#163024] py-3 text-sm font-semibold text-white hover:bg-[#1F4232] disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {showDemoHint && (
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-[#F2ECE1] p-4 space-y-2 text-xs">
            <p className="font-mono-meta uppercase tracking-wider text-[#555C58]">
              Local Dev Accounts
            </p>
            <div className="grid gap-1.5">
              <button
                type="button"
                onClick={() => void doLogin('admin@kazakhstan-travel.local', 'Admin!2026')}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left hover:bg-[#FAF8F4]"
              >
                <span className="font-semibold text-[#163024]">Admin</span>
                <span className="font-mono-meta text-[11px] text-[#555C58]">
                  admin@kazakhstan-travel.local
                </span>
              </button>
              <button
                type="button"
                onClick={() => void doLogin('manager@kazakhstan-travel.local', 'Manager!2026')}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left hover:bg-[#FAF8F4]"
              >
                <span className="font-semibold text-[#163024]">Manager</span>
                <span className="font-mono-meta text-[11px] text-[#555C58]">
                  manager@kazakhstan-travel.local
                </span>
              </button>
              <button
                type="button"
                onClick={() => void doLogin('editor@kazakhstan-travel.local', 'Editor!2026')}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-left hover:bg-[#FAF8F4]"
              >
                <span className="font-semibold text-[#163024]">Editor</span>
                <span className="font-mono-meta text-[11px] text-[#555C58]">
                  editor@kazakhstan-travel.local
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link href="/en" className="text-xs font-medium text-[#555C58] hover:text-[#163024]">
            Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
