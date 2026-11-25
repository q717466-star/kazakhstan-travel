'use client';

import type { Locale } from '@kt/core';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  DEFAULT_DESIGN,
  DESIGN_COOKIE,
  isAcceptedDesignInput,
  parseDesign,
  type DesignVariant,
} from '@/lib/design-theme';

interface DesignContextValue {
  design: DesignVariant;
  setDesign: (next: DesignVariant) => void;
}

const DesignContext = createContext<DesignContextValue>({
  design: DEFAULT_DESIGN,
  setDesign: () => {},
});

export function useDesign(): DesignContextValue {
  return useContext(DesignContext);
}

const ROOT_SURFACE_CLASSES: Record<DesignVariant, string> = {
  alpine: 'bg-white text-[#111111]',
  nomad: 'bg-[#EFECE6] text-[#0E0E0E]',
  cinema: 'bg-[#050608] text-[#F5F1E8]',
  horizon: 'bg-white text-[#111827]',
  voyage: 'bg-white text-[#111111]',
  aero: 'bg-white text-[#0F172A]',
};

export function DesignProvider({
  locale,
  initialDesign,
  children,
}: {
  locale: Locale;
  initialDesign: DesignVariant;
  children: ReactNode;
}) {
  const [design, setDesignState] = useState<DesignVariant>(initialDesign);

  useEffect(() => {
    setDesignState(initialDesign);
  }, [initialDesign]);

  const setDesign = useCallback((nextInput: DesignVariant) => {
    if (!isAcceptedDesignInput(nextInput)) return;
    const next = parseDesign(nextInput);
    setDesignState(next);

    document.cookie = `${DESIGN_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('design', next);
      window.history.replaceState(null, '', url.toString());
    } catch {
      // Ignore if URL update fails
    }

    if (window.scrollY > 120) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <DesignContext.Provider value={{ design, setDesign }}>
      <div
        lang={locale}
        data-design={design}
        className={`kt-site-root flex min-h-screen flex-col ${ROOT_SURFACE_CLASSES[design]}`}
      >
        {children}
      </div>
    </DesignContext.Provider>
  );
}
