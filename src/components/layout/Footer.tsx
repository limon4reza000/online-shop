import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { MapPin, Phone, Mail, MessageCircle, ArrowUpRight, ChevronRight, Link2 } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import { Logo } from '@/components/ui/Logo';
import { usePublicStoreSettings } from '@/hooks/useSettings';
import { useLanguage } from '@/context/LanguageContext';

const quickLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Order Tracking', to: '/order-tracking' },
];

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors duration-200"
    >
      <ChevronRight
        size={13}
        className="text-primary -ml-4 opacity-0 -translate-x-1 transition-all duration-200 group-hover:ml-0 group-hover:opacity-100 group-hover:translate-x-0"
      />
      {children}
    </Link>
  );
}

function FooterColumnTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-bold text-text-primary tracking-wide">
      <span className="grid place-items-center h-7 w-7 rounded-full bg-primary-light text-primary">{icon}</span>
      {children}
    </h4>
  );
}

export function Footer() {
  const { data: storeSettings } = usePublicStoreSettings();
  const { t } = useLanguage();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const facebookHref = storeSettings?.facebookUrl || '#';
  const instagramHref = storeSettings?.instagramUrl || '#';
  const whatsappHref = storeSettings?.whatsappNumber
    ? `https://wa.me/${storeSettings.whatsappNumber.replace(/\D/g, '')}`
    : '#';

  return (
    <footer className="bg-bg mt-6 sm:mt-20">
      <div className="container-app pt-6 sm:pt-16 pb-12">
        <div className="flex items-center gap-4 mb-10">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold tracking-[0.2em] text-text-secondary uppercase shrink-0">{t('footer.sectionLabel')}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <h2 className="font-serif font-bold text-4xl sm:text-6xl leading-[1.15]">
          <span className="text-text-primary">{t('footer.headlineLead')}</span>
          <span className="text-primary">{t('footer.headlineHighlight')}</span>
          <br />
          <span className="italic font-semibold text-text-secondary/60">{t('footer.headlineTail')}</span>
        </h2>
        <p className="mt-4 text-sm text-text-secondary">A fresh edit lands every morning</p>
        <button
          onClick={scrollToTop}
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-text-primary text-white text-xs font-bold uppercase tracking-wide px-5 py-3.5 shadow-soft hover:bg-primary hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
        >
          Back to the Top
          <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="container-app pb-8 sm:pb-10">
        <div className="border-t-4 border-primary-light bg-white p-8 sm:p-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-10">
            <div className="col-span-2 sm:col-span-1">
              <Link to="/"><Logo variant="dark" size={48} /></Link>
              <p className="mt-3.5 text-sm text-text-secondary leading-relaxed max-w-xs">
                Trusted quality for all your everyday needs, in one place.
              </p>
              <div className="mt-5 flex gap-2.5">
                {[
                  { Icon: FacebookIcon, href: facebookHref },
                  { Icon: InstagramIcon, href: instagramHref },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid place-items-center h-10 w-10 rounded-full bg-primary-light text-primary shadow-soft hover:bg-primary hover:text-white hover:shadow-lift hover:-translate-y-1 transition-all duration-300"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <FooterColumnTitle icon={<Link2 size={14} />}>Quick Links</FooterColumnTitle>
              <ul className="mt-5 space-y-3">
                {quickLinks.map((l) => (
                  <li key={l.label}><FooterLink to={l.to}>{l.label}</FooterLink></li>
                ))}
              </ul>
            </div>

            <div>
              <FooterColumnTitle icon={<Phone size={14} />}>Contact Us</FooterColumnTitle>
              <ul className="mt-5 space-y-3.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-primary shrink-0 mt-0.5" /> Tangail, Dhaka
                </li>
                <li>
                  <a href="mailto:support@nityaghor.com" className="group inline-flex items-center gap-2.5 hover:text-primary transition-colors duration-200">
                    <Mail size={15} className="text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" /> support@nityaghor.com
                  </a>
                </li>
                <li>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2.5 hover:text-primary transition-colors duration-200">
                    <MessageCircle size={15} className="text-primary shrink-0 transition-transform duration-200 group-hover:scale-110" /> WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-300 flex justify-center">
          <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm font-medium text-text-secondary whitespace-nowrap">
            <span>© {new Date().getFullYear()} Nityaghor. All rights reserved.</span>
            <span className="text-border">·</span>
            <Link to="/privacy" className="hover:text-primary transition-colors duration-200">Privacy Policy</Link>
            <span className="text-border">·</span>
            <Link to="/terms" className="hover:text-primary transition-colors duration-200">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
