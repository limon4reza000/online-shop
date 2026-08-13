import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faShirt, faVest, faGem, faRing, faCrown, faWandMagicSparkles, faSpa, faScissors, faPumpSoap,
  faSoap, faSprayCanSparkles, faBabyCarriage, faChild, faCouch, faHouseChimney, faShoePrints,
  faGlasses, faBagShopping, faHeart, faTag, faPersonDress, faSuitcase, faClock, faPaintbrush,
  faBottleDroplet, faPencil, faPalette, faSun, faFlask, faPuzzlePiece, faBottleWater, faBaby,
  faSeedling, faImages, faTable, faLightbulb, faUtensils, faBoxArchive, faBoltLightning, faVial, faMask,
  faWineBottle, faSnowflake, faMugHot,
} from '@fortawesome/free-solid-svg-icons';

/** Curated Font Awesome icons an admin can pick for a category, grouped loosely by theme. */
export const CATEGORY_ICON_OPTIONS: { name: string; label: string; icon: IconDefinition }[] = [
  { name: 'shirt', label: 'শার্ট', icon: faShirt },
  { name: 'vest', label: 'ভেস্ট', icon: faVest },
  { name: 'person-dress', label: 'পোশাক', icon: faPersonDress },
  { name: 'shoe-prints', label: 'জুতা', icon: faShoePrints },
  { name: 'glasses', label: 'চশমা', icon: faGlasses },
  { name: 'bag-shopping', label: 'ব্যাগ', icon: faBagShopping },
  { name: 'suitcase', label: 'সুটকেস', icon: faSuitcase },
  { name: 'gem', label: 'জেম', icon: faGem },
  { name: 'ring', label: 'আংটি', icon: faRing },
  { name: 'crown', label: 'ক্রাউন', icon: faCrown },
  { name: 'clock', label: 'ঘড়ি', icon: faClock },
  { name: 'wand-magic-sparkles', label: 'ম্যাজিক ওয়ান্ড', icon: faWandMagicSparkles },
  { name: 'paintbrush', label: 'ব্রাশ', icon: faPaintbrush },
  { name: 'palette', label: 'প্যালেট', icon: faPalette },
  { name: 'pencil', label: 'পেন্সিল', icon: faPencil },
  { name: 'spa', label: 'স্পা', icon: faSpa },
  { name: 'sun', label: 'সূর্য', icon: faSun },
  { name: 'flask', label: 'ফ্লাস্ক', icon: faFlask },
  { name: 'vial', label: 'ভায়াল', icon: faVial },
  { name: 'bottle-droplet', label: 'বোতল', icon: faBottleDroplet },
  { name: 'bottle-water', label: 'পানির বোতল', icon: faBottleWater },
  { name: 'pump-soap', label: 'পাম্প সোপ', icon: faPumpSoap },
  { name: 'soap', label: 'সাবান', icon: faSoap },
  { name: 'spray-can-sparkles', label: 'স্প্রে', icon: faSprayCanSparkles },
  { name: 'scissors', label: 'কাঁচি', icon: faScissors },
  { name: 'mask', label: 'মাস্ক', icon: faMask },
  { name: 'bolt-lightning', label: 'ইলেকট্রিক', icon: faBoltLightning },
  { name: 'baby-carriage', label: 'বেবি ক্যারেজ', icon: faBabyCarriage },
  { name: 'baby', label: 'বেবি', icon: faBaby },
  { name: 'child', label: 'শিশু', icon: faChild },
  { name: 'puzzle-piece', label: 'খেলনা', icon: faPuzzlePiece },
  { name: 'couch', label: 'সোফা', icon: faCouch },
  { name: 'house-chimney', label: 'বাড়ি', icon: faHouseChimney },
  { name: 'table', label: 'টেবিল', icon: faTable },
  { name: 'lightbulb', label: 'বাতি', icon: faLightbulb },
  { name: 'seedling', label: 'গাছ', icon: faSeedling },
  { name: 'images', label: 'ছবি', icon: faImages },
  { name: 'utensils', label: 'রান্নাঘর', icon: faUtensils },
  { name: 'box-archive', label: 'স্টোরেজ', icon: faBoxArchive },
  { name: 'wine-bottle', label: 'ফুলদানি', icon: faWineBottle },
  { name: 'snowflake', label: 'স্নোফ্লেক', icon: faSnowflake },
  { name: 'mug-hot', label: 'মগ', icon: faMugHot },
  { name: 'heart', label: 'হার্ট', icon: faHeart },
  { name: 'tag', label: 'ট্যাগ', icon: faTag },
];

export const CATEGORY_ICON_MAP: Record<string, IconDefinition> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((o) => [o.name, o.icon])
);

export const DEFAULT_CATEGORY_ICON = faTag;

export function getCategoryIcon(name?: string | null): IconDefinition {
  if (!name) return DEFAULT_CATEGORY_ICON;
  return CATEGORY_ICON_MAP[name] || DEFAULT_CATEGORY_ICON;
}
