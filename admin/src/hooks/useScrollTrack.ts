import { useEffect, useRef, useState } from 'react';

// Native OS scrollbars (esp. Windows/Chromium overlay scrollbars) can stay
// fully invisible until the user actively scrolls or hovers. Charts need an
// always-visible affordance, so this tracks scroll metrics and drives a
// custom track+thumb bar rendered below the chart instead of relying on the
// browser's own scrollbar.
export function useScrollTrack<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);
  const [metrics, setMetrics] = useState({ thumbWidth: 100, thumbLeft: 0 });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    const thumbWidth = scrollWidth > 0 ? Math.min(100, (clientWidth / scrollWidth) * 100) : 100;
    const maxScroll = scrollWidth - clientWidth;
    const thumbLeft = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - thumbWidth) : 0;
    setMetrics({ thumbWidth, thumbLeft });
  };

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ref, metrics, onScroll: update };
}
