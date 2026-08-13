import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="grid place-items-center h-10 w-10 rounded-full border border-border bg-white hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
            p === page ? 'bg-primary text-white shadow-card' : 'bg-white border border-border hover:border-primary hover:text-primary'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="grid place-items-center h-10 w-10 rounded-full border border-border bg-white hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
