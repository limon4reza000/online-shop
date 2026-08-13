import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { MessengerIcon, WhatsappIcon } from './SocialIcons';
import { usePublicStoreSettings } from '@/hooks/useSettings';

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const { data: storeSettings } = usePublicStoreSettings();

  const messengerHref = storeSettings?.messengerUrl || '#';
  const whatsappHref = storeSettings?.whatsappNumber
    ? `https://wa.me/${storeSettings.whatsappNumber.replace(/\D/g, '')}`
    : '#';

  const options = [
    { label: 'WhatsApp', href: whatsappHref, Icon: WhatsappIcon, bg: 'bg-[#25D366]' },
    { label: 'Messenger', href: messengerHref, Icon: MessengerIcon, bg: 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF]' },
  ];

  return (
    <div
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ease-out ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {options.map(({ label, href, Icon, bg }, i) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
            className="group/item flex items-center gap-2.5 transition-all duration-300"
          >
            <span className="rounded-full bg-text-primary text-white text-xs font-semibold px-3 py-1.5 shadow-soft opacity-0 translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200">
              {label}
            </span>
            <span className={`grid place-items-center h-12 w-12 rounded-full text-white shadow-lift hover:scale-110 hover:shadow-[0_0_0_4px_rgba(255,255,255,0.5)] transition-all duration-300 ${bg}`}>
              <Icon size={22} />
            </span>
          </a>
        ))}
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="যোগাযোগ করুন"
        aria-expanded={open}
        className="relative grid place-items-center h-14 w-14 rounded-full bg-primary text-white shadow-lift hover:bg-primary-hover transition-colors duration-300"
      >
        {!open && <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping-slow" />}
        <MessageCircle
          size={22}
          className={`absolute transition-all duration-300 ${open ? 'opacity-0 rotate-45 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
        />
        <X
          size={22}
          className={`absolute transition-all duration-300 ${open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-50'}`}
        />
      </button>
    </div>
  );
}
