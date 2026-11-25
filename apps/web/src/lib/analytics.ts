'use client';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export type KtAnalyticsEvent =
  | { name: 'view_tour'; tour_code: string; tour_title: string; locale: string }
  | { name: 'use_filter'; filter_name: string; filter_value: string; locale: string }
  | { name: 'start_booking_form'; source: 'tour_card' | 'planner' | 'contacts'; tour_code?: string }
  | { name: 'submit_lead_success'; request_number: string; request_type: string; tour_code?: string }
  | { name: 'submit_lead_error'; reason: string; tour_code?: string }
  | { name: 'click_whatsapp'; source: string; tour_code?: string }
  | { name: 'click_telegram'; source: string; tour_code?: string }
  | { name: 'click_phone'; source: string }
  | { name: 'use_trip_planner'; step: number; step_name: string };

export function trackEvent(evt: KtAnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  const payload = {
    event: `kt_${evt.name}`,
    ...evt,
    timestamp: new Date().toISOString(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === 'function') {
    window.gtag('event', evt.name, evt);
  }
}
