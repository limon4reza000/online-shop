import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { useCategoryTree } from '@/hooks/useCategories';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

/**
 * Live, database-driven main-category list with accordion expand/collapse for
 * subcategories. Shared by the desktop Sidebar and the mobile drawer so both
 * navs stay in sync with whatever the admin has configured — no code changes
 * needed when categories are added, renamed, reordered, or removed.
 */
export function CategoryAccordionNav({ onNavigate }: { onNavigate?: () => void }) {
  const { mainCategories, getSubCategories, isLoading } = useCategoryTree();
  const { t } = useLanguage();
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {mainCategories.map((c) => {
        const isOpen = openSlug === c.slug;
        const subs = getSubCategories(c.slug);

        return (
          <div key={c.id}>
            <button
              type="button"
              onClick={() => setOpenSlug(isOpen ? null : c.slug)}
              aria-expanded={isOpen}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-base font-medium leading-normal transition-colors ${
                isOpen ? 'bg-primary-light text-primary' : 'text-text-secondary hover:bg-primary-light hover:text-primary'
              }`}
            >
              <CategoryIcon name={c.icon} className="text-base w-4.25 text-center shrink-0" />
              <span className="flex-1 min-w-0 text-left truncate" title={c.name}>{c.name}</span>
              {subs.length > 0 && (
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className={`text-base w-4 text-center shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-90' : ''}`}
                />
              )}
            </button>

            {subs.length > 0 && (
              <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="mt-0.5 mb-1 ml-6 pl-3.5 border-l border-border flex flex-col gap-0.5">
                    {subs.map((s) => (
                      <Link
                        key={s.id}
                        to={`/categories/${s.slug}`}
                        onClick={onNavigate}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] font-medium leading-normal text-text-secondary hover:bg-primary-light hover:text-primary transition-colors"
                      >
                        <CategoryIcon name={s.icon} className="text-[15px] w-4 text-center shrink-0" />
                        <span className="min-w-0 truncate" title={s.name}>{s.name}</span>
                      </Link>
                    ))}
                    <Link
                      to={`/categories/${c.slug}`}
                      onClick={onNavigate}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:underline"
                    >
                      {t('common.viewAll')} <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
