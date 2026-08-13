import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 16) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' });

export function FacebookIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TwitterIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M18.24 2H21l-6.5 7.43L22 22h-6.19l-4.85-6.34L5.4 22H2.6l6.95-7.94L2 2h6.34l4.38 5.8L18.24 2Zm-1.08 18.17h1.72L7 3.73H5.16l12 16.44Z" />
    </svg>
  );
}

export function MessengerIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 2C6.48 2 2 6.15 2 11.27c0 2.91 1.44 5.51 3.7 7.21V22l3.38-1.86c.9.25 1.87.39 2.87.39 5.52 0 10-4.15 10-9.27C22 6.15 17.52 2 12 2Zm1.02 12.48-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82Z" />
    </svg>
  );
}

export function WhatsappIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.08L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm5.6 14.15c-.24.68-1.18 1.24-1.94 1.4-.53.11-1.21.2-3.52-.75-2.96-1.22-4.86-4.22-5.01-4.42-.15-.19-1.2-1.6-1.2-3.05 0-1.45.75-2.15 1.03-2.45.24-.26.52-.32.7-.32.18 0 .35 0 .5.01.16.01.38-.06.6.46.24.58.8 1.99.87 2.13.07.14.12.31.02.5-.1.19-.15.3-.29.46-.14.16-.3.36-.43.48-.14.13-.29.28-.13.55.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.18-.28.36-.23.6-.14.24.1 1.55.73 1.82.86.27.14.44.2.51.31.07.11.07.65-.17 1.33Z" />
    </svg>
  );
}

export function YoutubeIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M23 12s0-3.5-.45-5.14a2.9 2.9 0 0 0-2.05-2.05C18.86 4.36 12 4.36 12 4.36s-6.86 0-8.5.45A2.9 2.9 0 0 0 1.45 6.86C1 8.5 1 12 1 12s0 3.5.45 5.14a2.9 2.9 0 0 0 2.05 2.05c1.64.45 8.5.45 8.5.45s6.86 0 8.5-.45a2.9 2.9 0 0 0 2.05-2.05C23 15.5 23 12 23 12Z" opacity="0.15" />
      <path d="M23 12s0-3.5-.45-5.14a2.9 2.9 0 0 0-2.05-2.05C18.86 4.36 12 4.36 12 4.36s-6.86 0-8.5.45A2.9 2.9 0 0 0 1.45 6.86C1 8.5 1 12 1 12s0 3.5.45 5.14a2.9 2.9 0 0 0 2.05 2.05c1.64.45 8.5.45 8.5.45s6.86 0 8.5-.45a2.9 2.9 0 0 0 2.05-2.05C23 15.5 23 12 23 12Z" fill="none" stroke="currentColor" strokeWidth={1.4} />
      <path d="M9.75 8.9v6.2l5.4-3.1-5.4-3.1Z" />
    </svg>
  );
}
