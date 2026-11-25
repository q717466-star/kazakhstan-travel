'use client';

import type { StaffUser } from '@kt/core';
import {
  Bot,
  Compass,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export function AdminShell({
  user,
  unreadCount = 0,
  children,
}: {
  user: StaffUser;
  unreadCount?: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard, roles: ['admin', 'manager', 'editor'] },
    { href: '/admin/leads', label: 'Lead Registry', icon: Inbox, badge: unreadCount, roles: ['admin', 'manager'] },
    { href: '/admin/tours', label: 'Tours CMS', icon: Compass, roles: ['admin', 'editor'] },
    { href: '/admin/content', label: 'Destinations & Blog', icon: FileText, roles: ['admin', 'editor'] },
    { href: '/admin/simulator', label: 'Bot Simulator', icon: Bot, roles: ['admin', 'manager', 'editor'] },
    { href: '/admin/users', label: 'Staff & RBAC', icon: Users, roles: ['admin'] },
  ].filter((item) => item.roles.includes(user.role));

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F4] lg:flex">
      <aside className="w-full shrink-0 bg-[#163024] text-[#FAF8F4] lg:w-64 lg:min-h-screen flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <p className="font-display text-2xl font-semibold leading-none">Kazakhstan Travel</p>
              <span className="font-mono-meta mt-1 block text-[10px] uppercase tracking-widest text-[#B85A3A]">
                CRM · CMS · BOTS
              </span>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    active ? 'bg-[#B85A3A] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="font-mono-meta rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 border-t border-white/15 pt-4 space-y-3 text-xs">
          <div>
            <p className="font-semibold text-white">{user.fullName}</p>
            <p className="font-mono-meta uppercase text-white/60">Role: {user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/en"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 px-3 py-2 text-white/85 hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Public Site</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-white hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl">{children}</main>
    </div>
  );
}
