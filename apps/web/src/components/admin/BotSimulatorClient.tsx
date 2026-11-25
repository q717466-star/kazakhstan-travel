'use client';

import type { BotButton, BotReply, Lead, Tour } from '@kt/core';
import { AlertTriangle, Bot, CopyCheck, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ChatTurn {
  role: 'user' | 'bot';
  text: string;
  buttons?: BotButton[];
  eventId?: string;
}

interface TelegramSetupStatus {
  tokenConfigured: boolean;
  webhookSecretConfigured: boolean;
  siteUrl: string;
  webhookUrl: string;
  bot?: { id: number; username?: string; first_name?: string };
  webhookInfo?: { url: string; pending_update_count?: number; last_error_message?: string };
  error?: string;
}

export function BotSimulatorClient({ tours }: { tours: Tour[] }) {
  const [channel, setChannel] = useState<'telegram' | 'whatsapp'>('telegram');
  const [chatId, setChatId] = useState('900100');
  const [selectedTourCode, setSelectedTourCode] = useState(tours[0]?.code || 'CHARYN-1D');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [simFailure, setSimFailure] = useState(false);
  const [tgSetup, setTgSetup] = useState<TelegramSetupStatus | null>(null);
  const [tgSetupBusy, setTgSetupBusy] = useState(false);
  const [tgSetupMsg, setTgSetupMsg] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<{
    text?: string;
    callbackData?: string;
    eventId?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadTelegramSetup() {
    try {
      const res = await fetch('/api/admin/telegram/setup');
      if (res.ok) {
        const data = (await res.json()) as TelegramSetupStatus;
        setTgSetup(data);
      }
    } catch {
      // ignore setup probe error
    }
  }

  async function activateTelegramWebhook() {
    setTgSetupBusy(true);
    setTgSetupMsg(null);
    try {
      const res = await fetch('/api/admin/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl: tgSetup?.siteUrl }),
      });
      const data = (await res.json()) as TelegramSetupStatus & { ok?: boolean };
      if (res.ok && data.ok) {
        setTgSetup(data);
        setTgSetupMsg(`Webhook & menu active: ${data.webhookUrl}`);
      } else {
        setTgSetupMsg(data.error || 'Failed to configure Telegram webhook.');
      }
    } catch {
      setTgSetupMsg('Network error activating Telegram webhook.');
    } finally {
      setTgSetupBusy(false);
    }
  }

  async function loadState(targetChannel: 'telegram' | 'whatsapp', targetChatId: string) {
    const res = await fetch(`/api/admin/simulator?channel=${targetChannel}&chatId=${targetChatId}`);
    if (res.ok) {
      const data = (await res.json()) as { simulateDbFailure: boolean; recentLeads: Lead[] };
      setSimFailure(data.simulateDbFailure);
      setRecentLeads(data.recentLeads);
    }
  }

  useEffect(() => {
    const defaultId = channel === 'telegram' ? '900100' : '442079460958';
    setChatId(defaultId);
    setMessages([]);
    void loadState(channel, defaultId);
    if (channel === 'telegram') {
      void loadTelegramSetup();
    }
  }, [channel]);

  async function dispatch(payload: {
    text?: string;
    callbackData?: string;
    label?: string;
    replayEventId?: string;
  }) {
    setBusy(true);
    const eventId = payload.replayEventId || `sim_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    setLastPayload({ text: payload.text, callbackData: payload.callbackData, eventId });

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: payload.label || payload.text || payload.callbackData || '',
        eventId,
      },
    ]);

    try {
      const res = await fetch('/api/admin/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          channel,
          chatId,
          text: payload.text,
          callbackData: payload.callbackData,
          eventId,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          replies: BotReply[];
          recentLeads: Lead[];
        };
        setRecentLeads(data.recentLeads);
        if (data.replies.length === 0) {
          setMessages((prev) => [
            ...prev,
            { role: 'bot', text: '[Deduplicated webhook event — zero duplicate reply/lead created]' },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            ...data.replies.map((r) => ({ role: 'bot' as const, text: r.text, buttons: r.buttons })),
          ]);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleDbFailure() {
    const next = !simFailure;
    const res = await fetch('/api/admin/simulator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_db_failure', simulateDbFailure: next }),
    });
    if (res.ok) setSimFailure(next);
  }

  function launchDeepLink() {
    if (channel === 'telegram') {
      void dispatch({
        text: `/start tour_${selectedTourCode}`,
        label: `/start tour_${selectedTourCode}`,
      });
    } else {
      void dispatch({
        text: `Hello Kazakhstan Travel! I want to inquire about tour ${selectedTourCode}`,
        label: `WhatsApp prefill: tour ${selectedTourCode}`,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950">
        <strong>Verification Mode Notice:</strong> This bench dispatches authentic Telegram Update &
        WhatsApp Cloud API webhook structures directly through the shared server bot engine and
        unified SQLite database. Live Meta Cloud delivery is marked separately from webhook
        simulation until Meta Business credentials are placed in <code>.env</code>.
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Chat Interface */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-[rgba(27,30,29,0.12)] bg-white overflow-hidden">
          {/* Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(27,30,29,0.1)] bg-[#FAF8F4] p-4">
            <div className="inline-flex rounded-full bg-[#E5DCCB] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChannel('telegram')}
                className={`rounded-full px-4 py-1.5 ${
                  channel === 'telegram' ? 'bg-[#163024] text-white' : 'text-[#1B1E1D]'
                }`}
              >
                Telegram Bot
              </button>
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`rounded-full px-4 py-1.5 ${
                  channel === 'whatsapp' ? 'bg-[#B85A3A] text-white' : 'text-[#1B1E1D]'
                }`}
              >
                WhatsApp Cloud API
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => void dispatch({ text: '/start', label: '/start' })}
                className="rounded-lg border border-[rgba(27,30,29,0.15)] bg-white px-3 py-1.5 font-medium hover:bg-[#F2ECE1]"
              >
                Start Menu
              </button>
              <button
                type="button"
                onClick={() => void dispatch({ text: '/cancel', label: '/cancel' })}
                className="inline-flex items-center gap-1 rounded-lg border border-[rgba(27,30,29,0.15)] bg-white px-3 py-1.5 font-medium hover:bg-[#F2ECE1]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>/cancel</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[460px] overflow-y-auto space-y-4 bg-[#F5F1EA] p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-[#555C58] space-y-2">
                <Bot className="h-10 w-10 text-[#163024]/40" />
                <p>Click “Start Menu” or launch a tour deep-link to begin testing {channel}.</p>
              </div>
            )}

            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#163024] text-white'
                      : 'border border-[rgba(27,30,29,0.1)] bg-white text-[#1B1E1D]'
                  }`}
                >
                  {m.text}
                </div>

                {m.buttons && m.buttons.length > 0 && (
                  <div className="mt-2 flex max-w-[85%] flex-wrap gap-1.5">
                    {m.buttons.map((b) =>
                      b.url ? (
                        <a
                          key={b.id}
                          href={b.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-[#163024]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#163024] hover:bg-[#163024] hover:text-white transition-colors"
                        >
                          {b.label} ↗
                        </a>
                      ) : (
                        <button
                          key={b.id}
                          type="button"
                          disabled={busy}
                          onClick={() => void dispatch({ callbackData: b.id, label: b.label })}
                          className="rounded-xl border border-[#163024]/25 bg-white px-3 py-1.5 text-xs font-semibold text-[#163024] hover:bg-[#163024] hover:text-white transition-colors"
                        >
                          {b.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputText.trim() || busy) return;
              const val = inputText.trim();
              setInputText('');
              void dispatch({ text: val, label: val });
            }}
            className="flex items-center gap-2 border-t border-[rgba(27,30,29,0.1)] bg-white p-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type YYYY-MM-DD, participant count, name, phone (+44...) or email..."
              className="flex-1 rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#163024] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1F4232]"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right Defense Controls & Live DB Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Telegram Webhook & Menu Setup */}
          {channel === 'telegram' && (
            <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-2xl font-semibold">Live Telegram Bot Setup</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    tgSetup?.tokenConfigured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {tgSetup?.tokenConfigured
                    ? 'Configured'
                    : 'Not set — add TELEGRAM_BOT_TOKEN in Render Env'}
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#555C58]">
                <p>
                  <span className="font-semibold text-[#1B1E1D]">Webhook URL:</span>{' '}
                  <code className="break-all rounded bg-[#FAF8F4] px-1.5 py-0.5">
                    {tgSetup?.webhookUrl || '/api/webhooks/telegram'}
                  </code>
                </p>
                {tgSetup?.bot?.username && (
                  <p>
                    <span className="font-semibold text-[#1B1E1D]">Bot:</span>{' '}
                    <a
                      href={`https://t.me/${tgSetup.bot.username}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#163024] underline"
                    >
                      @{tgSetup.bot.username}
                    </a>
                  </p>
                )}
                {tgSetup?.webhookInfo?.url && (
                  <p>
                    <span className="font-semibold text-[#1B1E1D]">Active hook:</span>{' '}
                    <code className="break-all">{tgSetup.webhookInfo.url}</code>
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={tgSetupBusy || !tgSetup?.tokenConfigured}
                onClick={() => void activateTelegramWebhook()}
                className="w-full rounded-xl bg-[#163024] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1F4232] disabled:opacity-45"
              >
                {tgSetupBusy ? 'Activating...' : 'Activate Webhook & Menu'}
              </button>

              {tgSetupMsg && (
                <p className="rounded-xl bg-[#FAF8F4] px-3 py-2 text-xs text-[#1B1E1D]">
                  {tgSetupMsg}
                </p>
              )}
            </div>
          )}

          {/* Deep-Link Tester */}
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5 space-y-3">
            <h2 className="font-display text-2xl font-semibold">Tour Card Deep-Link Launcher</h2>
            <div className="flex gap-2">
              <select
                value={selectedTourCode}
                onChange={(e) => setSelectedTourCode(e.target.value)}
                className="flex-1 rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-3 py-2 text-xs"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.code}>
                    {t.code} — {t.title.en}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={launchDeepLink}
                className="rounded-xl bg-[#B85A3A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9B482C]"
              >
                Launch
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                void dispatch({
                  text: channel === 'telegram' ? '/start tour_INVALID-99' : 'tour INVALID-99',
                  label: 'Unknown tour code test',
                })
              }
              className="w-full rounded-xl border border-[rgba(27,30,29,0.15)] py-2 text-xs font-medium text-[#555C58] hover:bg-[#FAF8F4]"
            >
              Test Unknown Tour Code (INVALID-99)
            </button>
          </div>

          {/* Edge-Case Stress Controls */}
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5 space-y-3">
            <h2 className="font-display text-2xl font-semibold">Reliability & Edge Tests</h2>
            <button
              type="button"
              onClick={toggleDbFailure}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold ${
                simFailure
                  ? 'border-red-500 bg-red-50 text-red-800'
                  : 'border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] text-[#1B1E1D]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Simulate DB Save Failure</span>
              </span>
              <span>{simFailure ? 'ON (Failing)' : 'OFF'}</span>
            </button>

            <button
              type="button"
              disabled={!lastPayload || busy}
              onClick={() =>
                lastPayload &&
                void dispatch({
                  ...lastPayload,
                  replayEventId: lastPayload.eventId,
                  label: `Replay duplicate event (${lastPayload.eventId})`,
                })
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(27,30,29,0.15)] bg-[#FAF8F4] px-4 py-2.5 text-xs font-semibold text-[#163024] disabled:opacity-40"
            >
              <CopyCheck className="h-4 w-4" />
              <span>Replay Duplicate Webhook Event</span>
            </button>
          </div>

          {/* Recent Leads Saved via This Channel */}
          <div className="rounded-2xl border border-[rgba(27,30,29,0.1)] bg-white p-5 space-y-3">
            <h2 className="font-display text-2xl font-semibold">
              Latest {channel.toUpperCase()} Leads in Unified DB
            </h2>
            <div className="space-y-2 text-xs">
              {recentLeads.map((l) => (
                <Link
                  key={l.id}
                  href={`/admin/leads/${l.id}`}
                  className="flex items-center justify-between rounded-xl bg-[#FAF8F4] p-3 hover:bg-[#F2ECE1]"
                >
                  <div>
                    <span className="font-mono-meta font-bold text-[#163024]">
                      #{l.requestNumber}
                    </span>
                    <span className="ml-2 font-medium">{l.customerName}</span>
                    <p className="text-[11px] text-[#555C58]">
                      {l.tourCode || l.customParams?.destination} · {l.participants} pax
                    </p>
                  </div>
                  <span className="font-semibold text-[#B85A3A]">Open →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
