import { resolveImageSrc } from '@/lib/media-manifest';

type SlotPriority = 'high' | 'normal';

export interface LivingMediaProps {
  src: string;
  alt: string;
  className?: string;
  mediaClassName?: string;
  mode?: 'ambient' | 'hover-or-dwell';
  active?: boolean;
  dwellMs?: number;
  hoverMs?: number;
  priority?: SlotPriority;
  loading?: 'eager' | 'lazy';
}

export function LivingMedia({
  src,
  alt,
  className = '',
  mediaClassName = '',
  loading = 'eager',
}: LivingMediaProps) {
  const imgSrc = resolveImageSrc(src);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <img
        src={imgSrc}
        alt={alt}
        loading={loading}
        decoding={loading === 'eager' ? 'sync' : 'async'}
        className={`pointer-events-none h-full w-full object-cover object-center ${mediaClassName}`}
      />
    </div>
  );
}
