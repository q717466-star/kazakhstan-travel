'use client';

import type { Locale } from '@kt/core';
import type { ReactNode } from 'react';
import type { SiteDictionary } from '@/i18n';
import { useDesign } from './DesignProvider';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { AeroShell } from './sites/aero/AeroChrome';
import { CinemaShell } from './sites/cinema/CinemaChrome';
import { HorizonShell } from './sites/horizon/HorizonChrome';
import { NomadShell } from './sites/nomad/NomadChrome';
import { VoyageShell } from './sites/voyage/VoyageChrome';

interface Props {
  locale: Locale;
  dict: SiteDictionary;
  tgUrl: string;
  waUrl: string;
  children: ReactNode;
}

export function SiteChromeShell({ locale, dict, tgUrl, waUrl, children }: Props) {
  const { design } = useDesign();

  if (design === 'nomad') {
    return (
      <NomadShell locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl}>
        {children}
      </NomadShell>
    );
  }

  if (design === 'cinema') {
    return (
      <CinemaShell locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl}>
        {children}
      </CinemaShell>
    );
  }

  if (design === 'horizon') {
    return (
      <HorizonShell locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl}>
        {children}
      </HorizonShell>
    );
  }

  if (design === 'voyage') {
    return (
      <VoyageShell locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl}>
        {children}
      </VoyageShell>
    );
  }

  if (design === 'aero') {
    return (
      <AeroShell locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl}>
        {children}
      </AeroShell>
    );
  }

  return (
    <>
      <SiteHeader locale={locale} dict={dict} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} dict={dict} tgUrl={tgUrl} waUrl={waUrl} />
    </>
  );
}
