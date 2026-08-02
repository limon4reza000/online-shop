import { Star } from 'lucide-react';

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(value) ? 'fill-primary text-primary' : 'fill-border text-border'}
          />
        ))}
      </div>
      <span className="text-xs text-text-secondary font-medium">
        {value.toFixed(1)}
        {count !== undefined && <span className="ml-1">({count})</span>}
      </span>
    </div>
  );
}
