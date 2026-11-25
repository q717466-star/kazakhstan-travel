'use client';

import type { Destination, Locale, RoutePoint, Tour } from '@kt/core';
import { ArrowUpRight, Compass, MapPin, Mountain } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SiteDictionary } from '@/i18n';
import { useDesign } from './DesignProvider';
import { LivingMedia } from './LivingMedia';

export interface AtlasProps {
  mode: 'atlas';
  locale: Locale;
  dict: SiteDictionary;
  destinations: Destination[];
  tours: Tour[];
}

export interface RouteMapProps {
  mode: 'route';
  locale: Locale;
  dict: SiteDictionary;
  points: RoutePoint[];
}

export function InteractiveMap(props: AtlasProps | RouteMapProps) {
  const { design } = useDesign();
  const isCinema = design === 'cinema';
  const isNomad = design === 'nomad';
  const isHorizon = design === 'horizon';
  const isVoyage = design === 'voyage';
  const isAero = design === 'aero';

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const coords = useMemo(
    () =>
      props.mode === 'atlas'
        ? props.destinations.map((d) => ({ lat: d.lat, lng: d.lng }))
        : props.points.map((p) => ({ lat: p.lat, lng: p.lng })),
    [props.mode, props.mode === 'atlas' ? props.destinations : props.points]
  );

  const activePinBg = isCinema ? '#D6B36A' : isNomad ? '#D94626' : isHorizon ? '#F41D48' : isVoyage ? '#0284C7' : isAero ? '#0EA5C6' : '#111111';
  const idlePinBg = isCinema ? '#3F4652' : isNomad ? '#0E0E0E' : '#525252';
  const pinTextColor = isCinema ? '#050608' : '#FFFFFF';
  const lineColor = isCinema ? '#D6B36A' : isNomad ? '#D94626' : isHorizon ? '#F41D48' : isVoyage ? '#0284C7' : isAero ? '#0EA5C6' : '#111111';

  useEffect(() => {
    let active = true;
    const container = containerRef.current;
    if (!container || coords.length === 0) return;

    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    import('leaflet').then((L) => {
      if (!active || !containerRef.current) return;
      leafletRef.current = L;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapRef.current = map;

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors',
          maxZoom: 17,
        }
      ).addTo(map);

      if (props.mode === 'route' && coords.length > 1) {
        L.polyline(
          coords.map((p) => [p.lat, p.lng]),
          {
            color: lineColor,
            weight: 2.5,
            dashArray: '6 6',
            opacity: 0.85,
          }
        ).addTo(map);
      }

      coords.forEach((p, idx) => {
        const label = props.mode === 'route' ? String(idx + 1) : '';
        const icon = L.divIcon({
          className: 'kt-map-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `<div style="width:28px;height:28px;border-radius:9999px;background:${
            idx === 0 ? activePinBg : idlePinBg
          };color:${idx === 0 ? pinTextColor : '#FFFFFF'};border:2.5px solid #FFFFFF;box-shadow:0 4px 12px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;">${
            label ||
            `<span style="width:6px;height:6px;background:${idx === 0 ? pinTextColor : '#FFFFFF'};border-radius:9999px;display:block;"></span>`
          }</div>`,
        });

        const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
        marker.on('click', () => {
          setSelectedIdx(idx);
        });
        markersRef.current.push(marker);
      });

      const bounds = L.latLngBounds(coords.map((p) => [p.lat, p.lng] as [number, number]));
      if (coords.length === 1) {
        map.setView([coords[0].lat, coords[0].lng], 10);
      } else {
        map.fitBounds(bounds, { padding: [45, 45] });
      }
    });

    return () => {
      active = false;
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [props.mode, coords, lineColor]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!L || markersRef.current.length === 0) return;
    markersRef.current.forEach((marker, idx) => {
      const isSelected = idx === selectedIdx;
      const label = props.mode === 'route' ? String(idx + 1) : '';
      marker.setIcon(
        L.divIcon({
          className: 'kt-map-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          html: `<div style="width:28px;height:28px;border-radius:9999px;background:${
            isSelected ? activePinBg : idlePinBg
          };color:${isSelected ? pinTextColor : '#FFFFFF'};border:2.5px solid #FFFFFF;box-shadow:0 4px 12px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;cursor:pointer;transform:scale(${
            isSelected ? '1.15' : '1'
          });transition:transform 0.2s ease;">${
            label ||
            `<span style="width:6px;height:6px;background:${isSelected ? pinTextColor : '#FFFFFF'};border-radius:9999px;display:block;"></span>`
          }</div>`,
        })
      );
    });
  }, [selectedIdx, props.mode, activePinBg, idlePinBg, pinTextColor]);

  const radiusCls = isNomad ? 'rounded-none' : 'rounded-[24px]';
  const mapFrameCls = isCinema
    ? 'border-white/12 bg-[#0B0D11]'
    : isNomad
      ? 'border-[#0E0E0E]/20 bg-[#EFECE6]'
      : 'border-black/[0.08] bg-[#F4F4F5]';

  const panelCls = isCinema
    ? 'border-white/12 bg-[#0D1016] text-[#F5F1E8]'
    : isNomad
      ? 'border-[#0E0E0E]/20 bg-white text-[#0E0E0E]'
      : 'border-black/[0.08] bg-white text-[#111111]';

  const mutedTextCls = isCinema
    ? 'text-[#9CA3AF]'
    : isNomad
      ? 'text-[#57534E]'
      : 'text-[#737373]';

  if (props.mode === 'atlas') {
    const activeDest = props.destinations[selectedIdx] ?? props.destinations[0];
    if (!activeDest) return null;
    const matchingTours = props.tours.filter((t) => activeDest.tourCodes.includes(t.code));

    return (
      <div className="grid items-stretch gap-6 lg:grid-cols-12">
        <div className={`lg:col-span-7 flex min-h-[420px] sm:min-h-[520px] overflow-hidden border shadow-xs ${radiusCls} ${mapFrameCls}`}>
          <div ref={containerRef} className="h-full min-h-[420px] w-full sm:min-h-[520px]" />
        </div>

        <div className={`lg:col-span-5 flex flex-col justify-between border p-5 sm:p-6 shadow-xs ${radiusCls} ${panelCls}`}>
          <div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {props.destinations.map((dest, idx) => {
                const isActive = idx === selectedIdx;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`border px-3 py-1 text-xs font-medium transition-colors ${
                      isNomad ? 'rounded-none' : 'rounded-full'
                    } ${
                      isActive
                        ? isCinema
                          ? 'border-[#D6B36A] bg-[#D6B36A] text-[#050608] shadow-xs'
                          : isNomad
                            ? 'border-[#0E0E0E] bg-[#0E0E0E] text-[#EFECE6]'
                            : isHorizon
                              ? 'border-[#F41D48] bg-[#F41D48] text-white shadow-xs'
                              : isVoyage
                                ? 'border-[#0284C7] bg-[#0284C7] text-white shadow-xs'
                                : isAero
                                  ? 'border-[#0EA5C6] bg-[#0EA5C6] text-white shadow-xs'
                                  : 'border-[#111111] bg-[#111111] text-white shadow-xs'
                        : isCinema
                          ? 'border-white/12 bg-[#14181F] text-[#D8D6CF] hover:bg-white/10'
                          : isNomad
                            ? 'border-[#0E0E0E]/15 bg-[#EFECE6] text-[#0E0E0E] hover:border-[#0E0E0E]'
                            : 'border-black/[0.1] bg-[#F5F5F6] text-[#111111] hover:bg-[#ECECEE]'
                    }`}
                  >
                    {dest.title[props.locale] || dest.title.en}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDest.id}
                initial={{ opacity: 0.4, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.4, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`mb-4 aspect-[16/9] overflow-hidden ${isNomad ? 'rounded-none bg-[#EFECE6]' : isCinema ? 'rounded-[16px] bg-[#14181F]' : 'rounded-[16px] bg-[#F5F5F6]'}`}>
                  <LivingMedia
                    key={activeDest.id}
                    src={activeDest.image}
                    alt={activeDest.title[props.locale] || activeDest.title.en}
                    mode="ambient"
                    dwellMs={1100}
                    priority="high"
                  />
                </div>

                <div className={`mb-2 flex flex-wrap items-center gap-3 text-xs font-mono-meta ${mutedTextCls}`}>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className={`h-3.5 w-3.5 ${isCinema ? 'text-[#D6B36A]' : isNomad ? 'text-[#D94626]' : isHorizon ? 'text-[#F41D48]' : isVoyage ? 'text-[#0284C7]' : isAero ? 'text-[#0EA5C6]' : 'text-[#111111]'}`} />
                    {activeDest.lat.toFixed(2)}°N, {activeDest.lng.toFixed(2)}°E
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mountain className={`h-3.5 w-3.5 ${isCinema ? 'text-[#D6B36A]' : isNomad ? 'text-[#D94626]' : isHorizon ? 'text-[#F41D48]' : isVoyage ? 'text-[#0284C7]' : isAero ? 'text-[#0EA5C6]' : 'text-[#111111]'}`} />
                    {activeDest.elevationM} m
                  </span>
                  <span className="font-sans">
                    {activeDest.bestMonths[props.locale] || activeDest.bestMonths.en}
                  </span>
                </div>

                <h3
                  className={`text-2xl font-semibold ${
                    isCinema ? 'font-editorial text-3xl font-normal text-[#F5F1E8]' : isNomad ? 'font-display font-bold uppercase text-[#0E0E0E]' : 'font-display text-[#111111]'
                  }`}
                >
                  {activeDest.title[props.locale] || activeDest.title.en}
                </h3>
                <p className={`mt-2 text-sm ${mutedTextCls}`}>
                  {activeDest.summary[props.locale] || activeDest.summary.en}
                </p>

                {matchingTours.length > 0 && (
                  <div className={`mt-4 space-y-2 border-t pt-4 ${isCinema ? 'border-white/[0.08]' : isNomad ? 'border-[#0E0E0E]/15' : 'border-black/[0.08]'}`}>
                    <p className={`text-[11px] font-medium uppercase tracking-wider ${mutedTextCls}`}>
                      {props.dict.home.mapOpenTours}
                    </p>
                    {matchingTours.slice(0, 3).map((t) => (
                      <Link
                        key={t.id}
                        href={`/${props.locale}/tours/${t.slug}`}
                        className={`group flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors ${
                          isNomad ? 'rounded-none' : 'rounded-xl'
                        } ${
                          isCinema
                            ? 'bg-[#14181F] text-[#F5F1E8] hover:bg-white/[0.1]'
                            : isNomad
                              ? 'bg-[#EFECE6] text-[#0E0E0E] hover:bg-[#0E0E0E] hover:text-[#EFECE6]'
                              : 'bg-[#F5F5F6] text-[#111111] hover:bg-[#ECECEE]'
                        }`}
                      >
                        <span className="truncate pr-2">{t.title[props.locale] || t.title.en}</span>
                        <ArrowUpRight className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isCinema ? 'text-[#D6B36A]' : ''}`} />
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={`mt-5 border-t pt-3 ${isCinema ? 'border-white/[0.08]' : isNomad ? 'border-[#0E0E0E]/15' : 'border-black/[0.08]'}`}>
            <Link
              href={`/${props.locale}/tours?country=${encodeURIComponent(activeDest.country)}`}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline ${
                isCinema ? 'text-[#D6B36A]' : isNomad ? 'text-[#D94626]' : isHorizon ? 'text-[#F41D48]' : isVoyage ? 'text-[#0284C7]' : isAero ? 'text-[#0EA5C6]' : 'text-[#111111]'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{props.dict.home.destViewTours}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeStop = props.points[selectedIdx] ?? props.points[0];
  return (
    <div className="grid gap-5 lg:grid-cols-12">
      <div className={`lg:col-span-7 overflow-hidden border ${isNomad ? 'rounded-none' : 'rounded-[22px]'} ${mapFrameCls}`}>
        <div ref={containerRef} className="h-[320px] w-full sm:h-[380px]" />
      </div>
      <div className={`lg:col-span-5 flex flex-col justify-between border p-5 ${isNomad ? 'rounded-none' : 'rounded-[22px]'} ${panelCls}`}>
        <div>
          <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextCls}`}>
            {props.dict.tourDetail.mapStopsLabel}
          </span>
          <div className="mt-3 space-y-2">
            {props.points.map((pt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`flex w-full items-start gap-3 border p-3 text-left transition-colors ${
                  isNomad ? 'rounded-none' : 'rounded-xl'
                } ${
                  idx === selectedIdx
                    ? isCinema
                      ? 'border-[#D6B36A] bg-[#14181F]'
                      : isNomad
                        ? 'border-[#0E0E0E] bg-[#EFECE6]'
                        : isHorizon
                          ? 'border-[#F41D48] bg-[#F41D48]/5'
                          : isVoyage
                            ? 'border-[#0284C7] bg-[#0284C7]/5'
                            : isAero
                              ? 'border-[#0EA5C6] bg-[#0EA5C6]/5'
                              : 'border-[#111111] bg-[#F5F5F6]'
                    : isCinema
                      ? 'border-white/[0.08] hover:bg-white/[0.04]'
                      : isNomad
                        ? 'border-[#0E0E0E]/15 hover:bg-[#EFECE6]/50'
                        : 'border-black/[0.08] hover:bg-[#FAFAFA]'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform ${
                    idx === selectedIdx
                      ? isCinema
                        ? 'scale-110 bg-[#D6B36A] text-[#050608]'
                        : isNomad
                          ? 'scale-110 bg-[#D94626] text-white'
                          : isHorizon
                            ? 'scale-110 bg-[#F41D48] text-white'
                            : isVoyage
                              ? 'scale-110 bg-[#0284C7] text-white'
                              : isAero
                                ? 'scale-110 bg-[#0EA5C6] text-white'
                                : 'scale-110 bg-[#111111] text-white'
                      : isCinema
                        ? 'bg-[#262B34] text-white'
                        : isNomad
                          ? 'bg-[#0E0E0E] text-white'
                          : 'bg-[#737373] text-white'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <p className={`text-sm font-semibold ${isCinema ? 'text-[#F5F1E8]' : isNomad ? 'text-[#0E0E0E]' : 'text-[#111111]'}`}>
                    {pt.name[props.locale] || pt.name.en}
                  </p>
                  <p className={`mt-0.5 text-xs ${mutedTextCls}`}>
                    {pt.description[props.locale] || pt.description.en}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
        {activeStop && (
          <div className={`mt-4 flex items-center justify-between border-t pt-3 text-xs font-mono-meta ${isCinema ? 'border-white/[0.08]' : isNomad ? 'border-[#0E0E0E]/15' : 'border-black/[0.08]'} ${mutedTextCls}`}>
            <span>
              {activeStop.lat.toFixed(4)}°N, {activeStop.lng.toFixed(4)}°E
            </span>
            {activeStop.elevationM ? <span>{activeStop.elevationM} m ASL</span> : null}
          </div>
        )}
      </div>
    </div>
  );
}
