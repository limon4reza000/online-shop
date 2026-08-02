import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from '@/components/ui/SocialIcons';
import { Logo } from '@/components/ui/Logo';
import { useLanguage } from '@/context/LanguageContext';

const linkGroups = [
  {
    title: 'গ্রাহক সহায়তা',
    links: [
      { label: 'যোগাযোগ করুন', to: '/contact' },
      { label: 'সাধারণ জিজ্ঞাসা', to: '/faq' },
      { label: 'অর্ডার ট্র্যাকিং', to: '/order-tracking' },
      { label: 'শিপিং ও রিটার্ন', to: '/faq' },
    ],
  },
  {
    title: 'দ্রুত লিংক',
    links: [
      { label: 'আমাদের সম্পর্কে', to: '/about' },
      { label: 'শপ', to: '/shop' },
      { label: 'ক্যাটাগরি', to: '/categories' },
      { label: 'উইশলিস্ট', to: '/wishlist' },
    ],
  },
  {
    title: 'আইনি তথ্য',
    links: [
      { label: 'প্রাইভেসি পলিসি', to: '/privacy' },
      { label: 'শর্তাবলী', to: '/terms' },
    ],
  },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-border mt-20">
      <div className="container-app section-y">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/"><Logo variant="dark" size={60} /></Link>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed max-w-sm">
              {t('আধুনিক ওয়ারড্রোবের জন্য বাছাই করা প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল পণ্য। মার্জিত ডিজাইন, নির্ভেজাল মান, আপনার দোরগোড়ায় পৌঁছে যায়।')}
            </p>
            <div className="mt-5 space-y-2 text-sm text-text-secondary">
              <p className="flex items-center gap-2"><MapPin size={15} className="text-primary" /> ২১ ব্লুম অ্যাভিনিউ, নিউ ইয়র্ক, এনওয়াই</p>
              <p className="flex items-center gap-2"><Phone size={15} className="text-primary" /> +১ (৮০০) ৫৫৫-০১৯২</p>
              <p className="flex items-center gap-2"><Mail size={15} className="text-primary" /> hello@nityaghor.com</p>
            </div>
            <div className="mt-5 flex gap-2">
              {[FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon].map((Icon, i) => (
                <a key={i} href="#" className="grid place-items-center h-9 w-9 rounded-full bg-primary-light text-primary hover:bg-primary hover:text-white transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-bold text-text-primary">{t(group.title)}</h4>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-text-secondary hover:text-primary transition-colors">{t(l.label)}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-secondary">© {new Date().getFullYear()} নিত্যঘর। {t('সর্বস্বত্ব সংরক্ষিত।')}</p>
          <div className="flex items-center gap-2 text-text-secondary">
            <CreditCard size={22} />
            <span className="text-xs font-medium">{t('ভিসা · মাস্টারকার্ড · অ্যামেক্স · পেপ্যাল · অ্যাপল পে')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
