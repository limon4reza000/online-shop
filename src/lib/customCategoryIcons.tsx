// Hand-drawn fallback icons for category concepts Font Awesome's free set has
// no good match for (South Asian garments, jewelry pieces, cosmetics). Drawn
// as simple filled monochrome silhouettes on the same 512x512 grid Font
// Awesome uses, sized in em units, so they sit visually consistent next to
// real FontAwesomeIcon glyphs wherever both appear together.
import type { SVGProps } from 'react';

type IconProps = { className?: string };

function Base({ className, children, stroke }: { className?: string; children: React.ReactNode; stroke?: boolean }) {
  const common: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 512 512',
    className,
    style: { width: '1em', height: '1em' },
  };
  return stroke ? (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  ) : (
    <svg {...common} fill="currentColor">{children}</svg>
  );
}

export function HijabIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="256" cy="180" r="90" />
      <path d="M166,220 Q256,196 346,220 L400,420 Q256,472 112,420 Z" />
    </Base>
  );
}

export function BraIcon({ className }: IconProps) {
  return (
    <Base className={className} stroke>
      <circle cx="196" cy="240" r="86" />
      <circle cx="316" cy="240" r="86" />
      <path d="M196,160 L150,90 M316,160 L362,90" />
    </Base>
  );
}

export function UnderwearIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <path d="M140,150 h232 a12,12 0 0 1 12,14 L340,380 Q256,432 172,380 L128,164 a12,12 0 0 1 12,-14 Z" />
    </Base>
  );
}

export function NecklaceIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="256" cy="186" r="140" fill="none" stroke="currentColor" strokeWidth="26" />
      <line x1="256" y1="322" x2="256" y2="352" stroke="currentColor" strokeWidth="20" />
      <circle cx="256" cy="384" r="36" />
    </Base>
  );
}

export function EarringsIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <circle cx="256" cy="120" r="42" />
      <line x1="256" y1="162" x2="256" y2="230" stroke="currentColor" strokeWidth="18" />
      <ellipse cx="256" cy="310" rx="52" ry="74" />
    </Base>
  );
}

export function BraceletIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <ellipse cx="256" cy="256" rx="180" ry="120" fill="none" stroke="currentColor" strokeWidth="34" />
    </Base>
  );
}

export function LipstickIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="196" y="300" width="120" height="170" rx="14" />
      <path d="M196,300 L316,300 L300,180 L212,180 Z" />
    </Base>
  );
}

export function NailPolishIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="226" y="140" width="60" height="46" rx="8" />
      <path d="M226,186 L286,186 L306,230 L206,230 Z" />
      <rect x="180" y="230" width="152" height="220" rx="24" />
    </Base>
  );
}

export function RazorIcon({ className }: IconProps) {
  return (
    <Base className={className}>
      <rect x="236" y="220" width="40" height="260" rx="12" />
      <rect x="186" y="160" width="140" height="60" rx="14" />
    </Base>
  );
}

export const CUSTOM_CATEGORY_ICONS: Record<string, (props: IconProps) => React.JSX.Element> = {
  hijab: HijabIcon,
  bra: BraIcon,
  underwear: UnderwearIcon,
  necklace: NecklaceIcon,
  earrings: EarringsIcon,
  bracelet: BraceletIcon,
  anklet: BraceletIcon,
  lipstick: LipstickIcon,
  'nail-polish': NailPolishIcon,
  'body-razor': RazorIcon,
};

/** Shown in the admin icon picker alongside Font Awesome options — Font Awesome's free set has no match for these. */
export const CUSTOM_CATEGORY_ICON_OPTIONS: { name: string; label: string }[] = [
  { name: 'hijab', label: 'হিজাব' },
  { name: 'bra', label: 'ব্রা' },
  { name: 'underwear', label: 'আন্ডারওয়্যার' },
  { name: 'necklace', label: 'নেকলেস' },
  { name: 'earrings', label: 'কানের দুল' },
  { name: 'bracelet', label: 'ব্রেসলেট' },
  { name: 'lipstick', label: 'লিপস্টিক' },
  { name: 'nail-polish', label: 'নেইল পলিশ' },
  { name: 'body-razor', label: 'রেজার' },
];
