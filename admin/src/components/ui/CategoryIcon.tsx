import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { CUSTOM_CATEGORY_ICONS } from '@/lib/customCategoryIcons';

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  if (name && CUSTOM_CATEGORY_ICONS[name]) {
    const Custom = CUSTOM_CATEGORY_ICONS[name];
    return <Custom className={className} />;
  }
  return <FontAwesomeIcon icon={getCategoryIcon(name)} className={className} />;
}
