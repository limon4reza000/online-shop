import { useMemo, useState, type ReactNode } from 'react';
import { Search, Inbox } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  pageSize?: number;
  toolbar?: ReactNode;
}

export function DataTable<T>({ columns, data, rowKey, searchPlaceholder = 'অনুসন্ধান করুন...', searchFn, pageSize = 8, toolbar }: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query || !searchFn) return data;
    return data.filter((row) => searchFn(row, query.toLowerCase()));
  }, [data, query, searchFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-border">
        {searchFn && (
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={searchPlaceholder}
              className="input-field pl-9 !py-2.5 text-sm"
            />
          </div>
        )}
        {toolbar && <div className="flex items-center gap-2 w-full sm:w-auto justify-end">{toolbar}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-primary-light/40">
              {columns.map((col) => (
                <th key={col.key} className={`text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3 whitespace-nowrap ${col.className || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-14 text-text-secondary">
                  <Inbox size={30} className="mx-auto text-primary/30 mb-2" />
                  কোনো তথ্য পাওয়া যায়নি
                </td>
              </tr>
            ) : (
              pageItems.map((row) => (
                <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-primary-light/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 align-middle ${col.className || ''}`}>{col.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
