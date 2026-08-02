import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTypewriter } from '@/hooks/useTypewriter';
import { usePublicSearchPlaceholders } from '@/hooks/useSearchPlaceholders';
import { useLanguage } from '@/context/LanguageContext';

const SEARCH_PREFIX = 'নিত্যঘরে খুঁজুন ';

// Shown until the backend list loads (or if it's unreachable) so the animation never renders empty.
const FALLBACK_WORDS = [
  'শাড়ি', 'চুড়ি', 'আংটি', 'ঘড়ি', 'কানের দুল', 'নেকলেস', 'ব্রেসলেট', 'কসমেটিকস', 'সানগ্লাস', 'ফেসওয়াশ',
  'মেকআপ', 'স্কিন কেয়ার', 'পারফিউম', 'নেইল পলিশ', 'লিপস্টিক', 'হ্যান্ডব্যাগ', 'ভ্যানিটি ব্যাগ', 'ওয়ালেট',
  'থ্রি-পিস', 'টু-পিস', 'হিজাব', 'নিকাব', 'বাচ্চাদের পোশাক', 'ডায়াপার', 'বেবি কেয়ার',
  'ফিডিং বোতল', 'বেবি টয়', 'বেবিদের জুতা',
];

export function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: placeholders } = usePublicSearchPlaceholders();
  const words = useMemo(() => (placeholders?.length ? placeholders.map((p) => p.text) : FALLBACK_WORDS), [placeholders]);
  const animatedWord = useTypewriter(words, query.length > 0);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div>
      <div className="px-3 lg:px-5 pt-3 pb-1">
        <form onSubmit={submitSearch} className="relative">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`${t(SEARCH_PREFIX)}${animatedWord}`}
            className="w-full rounded-lg border-none bg-gray-200 pl-11 pr-4 py-3.5 text-sm text-text-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all"
          />
          {!query && (
            <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-sm whitespace-nowrap overflow-hidden">
              <span className="text-text-secondary">{t(SEARCH_PREFIX)}</span>
              <span className="text-primary font-medium">&ldquo;{animatedWord}</span>
              <span className="inline-block w-px h-4 -mb-0.5 bg-primary animate-blink-caret" />
              <span className="text-primary font-medium">&rdquo;</span>
            </span>
          )}
        </form>
      </div>
    </div>
  );
}
