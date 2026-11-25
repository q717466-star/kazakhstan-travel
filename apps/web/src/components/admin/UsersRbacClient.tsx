'use client';

import type { StaffUser, UserRole } from '@kt/core';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

export function UsersRbacClient({ initialUsers }: { initialUsers: StaffUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, role, password }),
    });
    const data = (await res.json()) as { user?: StaffUser; error?: string };
    if (res.ok && data.user) {
      setUsers([...users, data.user]);
      setEmail('');
      setFullName('');
      setPassword('');
      setMsg(`Created staff account: ${data.user.email}`);
    } else {
      setMsg(data.error || 'Could not create user');
    }
  }

  async function toggleActive(u: StaffUser) {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, isActive: !u.isActive }),
    });
    if (res.ok) {
      const data = (await res.json()) as { user: StaffUser };
      setUsers(users.map((x) => (x.id === u.id ? data.user : x)));
    }
  }

  async function changeRole(u: StaffUser, nextRole: UserRole) {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, role: nextRole }),
    });
    if (res.ok) {
      const data = (await res.json()) as { user: StaffUser };
      setUsers(users.map((x) => (x.id === u.id ? data.user : x)));
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={addStaff}
        className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-6 space-y-4"
      >
        <h2 className="font-display text-2xl font-semibold">Add Staff Member</h2>
        <div className="grid gap-3 sm:grid-cols-4 text-sm">
          <input
            type="text"
            required
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
          />
          <input
            type="email"
            required
            placeholder="staff@kazakhstan-travel.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
          >
            <option value="manager">Manager (CRM Leads)</option>
            <option value="editor">Editor (CMS Content)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2"
          />
        </div>
        {msg && <p className="text-xs font-semibold text-[#163024]">{msg}</p>}
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-[#163024] px-5 py-2.5 text-xs font-semibold text-white"
        >
          <UserPlus className="h-4 w-4" />
          <span>Create Account</span>
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[rgba(27,30,29,0.1)] bg-[#FAF8F4] font-mono-meta text-xs uppercase text-[#555C58]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(27,30,29,0.08)]">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-semibold">{u.fullName}</td>
                <td className="px-4 py-3 font-mono-meta text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => void changeRole(u, e.target.value as UserRole)}
                    className="rounded-lg border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-2.5 py-1 text-xs font-semibold"
                  >
                    <option value="admin">admin</option>
                    <option value="manager">manager</option>
                    <option value="editor">editor</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void toggleActive(u)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      u.isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
