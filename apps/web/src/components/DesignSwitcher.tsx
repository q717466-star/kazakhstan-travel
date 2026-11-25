'use client';

import type { Locale } from '@kt/core';
import { ChevronRight, Layers, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { DESIGN_CATALOG, type DesignVariant } from '@/lib/design-theme';
import { useDesign } from './DesignProvider';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
}

export function DesignSwitcher({ locale, dict }: Props) {
  const { design, setDesign } = useDesign();
  const [collapsed, setCollapsed] = useState(false);

  const labelMap: Record<DesignVariant, { desc: string }> = {
    alpine: { desc: dict.designSwitcher.alpineDesc },
    nomad: { desc: dict.designSwitcher.nomadDesc },
    cinema: { desc: dict.designSwitcher.cinemaDesc },
    horizon: { desc: dict.designSwitcher.horizonDesc },
    voyage: { desc: dict.designSwitcher.voyageDesc },
    aero: { desc: dict.designSwitcher.aeroDesc },
  };

  const containerTheme =
    design === 'cinema'
      ? 'rounded-[22px] border-white/15 bg-[#0A0C10] text-[#F5F1E8] shadow-[0_20px_56px_rgba(0,0,0,0.75)]'
      : design === 'nomad'
        ? 'rounded-none border-[#0E0E0E]/30 bg-[#0E0E0E] text-[#EFECE6] shadow-[0_18px_46px_rgba(0,0,0,0.3)]'
        : design === 'horizon'
          ? 'rounded-[22px] border-black/[0.08] bg-white text-[#111827] shadow-[0_18px_48px_rgba(17,24,39,0.14)]'
          : design === 'voyage'
            ? 'rounded-[22px] border-black/[0.08] bg-white text-[#111111] shadow-[0_18px_48px_rgba(2,132,199,0.14)]'
            : design === 'aero'
              ? 'rounded-[22px] border-[#0EA5C6]/25 bg-white text-[#0F172A] shadow-[0_18px_48px_rgba(14,165,198,0.18)]'
              : 'rounded-[22px] border-black/[0.1] bg-white text-[#111111] shadow-[0_16px_44px_rgba(0,0,0,0.14)]';

  const mutedText =
    design === 'cinema'
      ? 'text-[#9CA3AF]'
      : design === 'nomad'
        ? 'text-[#A8A39B]'
        : 'text-[#737373]';

  if (collapsed) {
    return (
      <div lang={locale} className="fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
        <button
          type="button"
          data-testid="design-switcher-expand"
          onClick={() => setCollapsed(false)}
          aria-label={dict.designSwitcher.badgeLabel}
          className={`inline-flex items-center gap-2 border px-3.5 py-2 text-xs font-semibold backdrop-blur-xl transition-transform hover:scale-[1.03] ${
            design === 'nomad' ? 'rounded-none' : 'rounded-full'
          } ${containerTheme}`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{DESIGN_CATALOG.length} {dict.designSwitcher.badgeLabel}</span>
          <span className="flex items-center gap-1">
            {DESIGN_CATALOG.map((item) => (
              <span
                key={item.id}
                className={`h-2 w-2 rounded-full border border-black/25 ${
                  design === item.id ? 'ring-2 ring-current' : 'opacity-60'
                }`}
                style={{ backgroundColor: item.swatches[design === item.id ? 2 : 0] }}
              />
            ))}
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      key={`switcher-${design}`}
      lang={locale}
      aria-label={dict.designSwitcher.badgeLabel}
      data-testid="design-switcher"
      className={`fixed bottom-4 right-4 z-50 w-auto max-w-[calc(100vw-2rem)] border p-2.5 sm:bottom-5 sm:right-5 sm:p-3 ${containerTheme}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles
            className={`h-3 w-3 ${
              design === 'cinema'
                ? 'text-[#D6B36A]'
                : design === 'nomad'
                  ? 'text-[#D94626]'
                  : design === 'horizon'
                    ? 'text-[#F41D48]'
                    : design === 'voyage'
                      ? 'text-[#0284C7]'
                      : design === 'aero'
                        ? 'text-[#0EA5C6]'
                        : 'text-[#111111]'
            }`}
          />
          <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${mutedText}`}>
            {dict.designSwitcher.badgeLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label={dict.designSwitcher.collapseLabel}
          title={dict.designSwitcher.collapseLabel}
          className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
            design === 'cinema' || design === 'nomad'
              ? 'text-white/60 hover:bg-white/10 hover:text-white'
              : 'text-[#737373] hover:bg-black/5 hover:text-[#111111]'
          }`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {DESIGN_CATALOG.map((item) => {
          const isActive = design === item.id;
          const info = labelMap[item.id];

          const shape = design === 'nomad' ? 'rounded-none' : 'rounded-2xl';
          const buttonClasses = isActive
            ? design === 'cinema'
              ? 'bg-[#D6B36A] text-[#050608] border-[#D6B36A] shadow-sm'
              : design === 'nomad'
                ? 'bg-[#D94626] text-[#EFECE6] border-[#D94626] shadow-sm'
                : design === 'horizon'
                  ? 'bg-[#F41D48] text-white border-[#F41D48] shadow-sm'
                  : design === 'voyage'
                    ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                    : design === 'aero'
                      ? 'bg-[#0EA5C6] text-white border-[#0EA5C6] shadow-sm'
                      : 'bg-[#111111] text-white border-[#111111] shadow-sm'
            : design === 'cinema' || design === 'nomad'
              ? 'bg-white/[0.06] text-[#E6E2D8] border-white/12 hover:bg-white/[0.12]'
              : 'bg-[#F5F5F6] text-[#111111] border-black/[0.07] hover:bg-[#ECECEE]';

          const titleTextClass = isActive
            ? design === 'cinema'
              ? 'text-[#050608]'
              : design === 'nomad'
                ? 'text-[#EFECE6]'
                : 'text-white'
            : design === 'cinema' || design === 'nomad'
              ? 'text-[#E6E2D8]'
              : 'text-[#111111]';

          const subTextClass = isActive
            ? design === 'cinema'
              ? 'text-[#050608]/80'
              : design === 'nomad'
                ? 'text-[#EFECE6]/85'
                : 'text-white/85'
            : mutedText;

          return (
            <button
              key={item.id}
              type="button"
              data-testid={`design-option-${item.id}`}
              aria-pressed={isActive}
              onClick={() => setDesign(item.id)}
              className={`group flex items-center gap-1.5 border px-2 py-1.5 text-left focus:outline-none ${shape} ${buttonClasses}`}
            >
              <span className="flex h-4 w-4 shrink-0 overflow-hidden rounded-full border border-black/25">
                <span className="h-full w-1/2" style={{ backgroundColor: item.swatches[0] }} />
                <span className="h-full w-1/2" style={{ backgroundColor: item.swatches[2] }} />
              </span>

              <span className="min-w-0 leading-tight">
                <span className={`block whitespace-nowrap text-[11px] font-semibold ${titleTextClass}`}>
                  {item.index} · {item.shortName}
                </span>
                <span className={`hidden whitespace-nowrap text-[9px] sm:block ${subTextClass}`}>
                  {info.desc}
                </span>
              </span>

              {isActive && <ChevronRight className={`hidden h-3 w-3 shrink-0 sm:block ${titleTextClass}`} />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
