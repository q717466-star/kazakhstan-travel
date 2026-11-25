export type DesignVariant = 'alpine' | 'nomad' | 'cinema' | 'horizon' | 'voyage' | 'aero';

export const DESIGN_COOKIE = 'kt_design';
export const DESIGN_HEADER = 'x-kt-design';
export const DEFAULT_DESIGN: DesignVariant = 'alpine';

export const DESIGN_VARIANTS: readonly DesignVariant[] = [
  'alpine',
  'nomad',
  'cinema',
  'horizon',
  'voyage',
  'aero',
];

export function isValidDesign(value: unknown): value is DesignVariant {
  return (
    value === 'alpine' ||
    value === 'nomad' ||
    value === 'cinema' ||
    value === 'horizon' ||
    value === 'voyage' ||
    value === 'aero'
  );
}

export function isAcceptedDesignInput(value: unknown): boolean {
  return (
    value === 'alpine' ||
    value === 'nomad' ||
    value === 'cinema' ||
    value === 'horizon' ||
    value === 'voyage' ||
    value === 'aero' ||
    value === 'obsidian' ||
    value === 'heritage' ||
    value === 'triverra' ||
    value === 'azure' ||
    value === 'travelworld'
  );
}

export function parseDesign(value: string | null | undefined): DesignVariant {
  if (!value) return DEFAULT_DESIGN;
  if (value === 'obsidian') return 'cinema';
  if (value === 'heritage') return 'nomad';
  if (value === 'triverra') return 'horizon';
  if (value === 'azure') return 'voyage';
  if (value === 'travelworld') return 'aero';
  if (isValidDesign(value)) return value;
  return DEFAULT_DESIGN;
}

export interface DesignMeta {
  id: DesignVariant;
  index: string;
  shortName: string;
  swatches: [string, string, string];
  inspiration: string;
}

export const DESIGN_CATALOG: readonly DesignMeta[] = [
  {
    id: 'alpine',
    index: '01',
    shortName: 'Alpine',
    swatches: ['#FFFFFF', '#F5F5F6', '#111111'],
    inspiration: 'Minimalist White',
  },
  {
    id: 'nomad',
    index: '02',
    shortName: 'Nomad',
    swatches: ['#EFECE6', '#0E0E0E', '#D94626'],
    inspiration: 'Swiss Editorial Studio',
  },
  {
    id: 'cinema',
    index: '03',
    shortName: 'Cinema',
    swatches: ['#050608', '#14171E', '#D6B36A'],
    inspiration: 'Dark Luxury Cinema',
  },
  {
    id: 'horizon',
    index: '04',
    shortName: 'Horizon',
    swatches: ['#FFFFFF', '#F4F5F7', '#F41D48'],
    inspiration: 'Modern Travel Portal',
  },
  {
    id: 'voyage',
    index: '05',
    shortName: 'Voyage',
    swatches: ['#FFFFFF', '#F6C88B', '#0284C7'],
    inspiration: 'Sunlit Editorial Cards',
  },
  {
    id: 'aero',
    index: '06',
    shortName: 'Aero',
    swatches: ['#F4FBFD', '#0C4A5E', '#0EA5C6'],
    inspiration: 'OTA Booking Portal',
  },
];
