import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  icon?: string;
}

/** A searchable dropdown for long option lists (e.g. brands) — filters as you type,
 * unlike a plain native `<select>` which forces scrolling through everything. */
export function SearchableSelect({
  options, value, onChange, placeholder = 'নির্বাচন করুন', searchPlaceholder = 'খুঁজুন...', disabled = false,
}: {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
    else setQuery('');
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="input-field flex items-center justify-between gap-2 text-left disabled:opacity-50"
      >
        <span className={selected ? '' : 'text-text-secondary'}>
          {selected ? `${selected.icon ? selected.icon + ' ' : ''}${selected.label}` : placeholder}
        </span>
        <ChevronDown size={15} className={`text-text-secondary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-border bg-surface shadow-lift overflow-hidden animate-fade-in">
          <div className="relative border-b border-border">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-transparent outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3.5 py-3 text-sm text-text-secondary text-center">কোনো ফলাফল পাওয়া যায়নি</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-primary-light transition-colors ${
                    o.value === value ? 'text-primary font-semibold' : 'text-text-primary'
                  }`}
                >
                  <span>{o.icon ? `${o.icon} ` : ''}{o.label}</span>
                  {o.value === value && <Check size={14} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
