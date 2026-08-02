import { useEffect, useMemo, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, Pencil, X, GripVertical, Search, Eye, EyeOff, Loader2, Inbox, Sparkles,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/context/ToastContext';
import { useTypewriter } from '@/hooks/useTypewriter';
import {
  useAdminSearchPlaceholders,
  useCreateSearchPlaceholder,
  useUpdateSearchPlaceholder,
  useDeleteSearchPlaceholder,
  useBulkDeleteSearchPlaceholders,
  useToggleSearchPlaceholders,
  useReorderSearchPlaceholders,
} from '@/hooks/useSearchPlaceholders';
import type { SearchPlaceholder } from '@/lib/types';

const PAGE_SIZE = 50;

function SortableRow({
  item, selected, onToggleSelect, onEdit, onDelete, onToggleActive,
}: {
  item: SearchPlaceholder;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (item: SearchPlaceholder) => void;
  onDelete: (item: SearchPlaceholder) => void;
  onToggleActive: (item: SearchPlaceholder) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border last:border-0 hover:bg-primary-light/30 transition-colors">
      <td className="px-3 py-3 w-10">
        <input type="checkbox" checked={selected} onChange={() => onToggleSelect(item.id)} className="h-4 w-4 accent-primary rounded" />
      </td>
      <td className="px-2 py-3 w-8 text-text-secondary">
        <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 touch-none" aria-label="টেনে সাজান">
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3 font-medium text-sm">{item.text}</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleActive(item)}
          className={`badge ${item.isActive ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}
        >
          {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />} {item.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </button>
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary whitespace-nowrap">{new Date(item.updatedAt).toLocaleDateString('bn-BD')}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
          <button onClick={() => onDelete(item)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminSearchPlaceholders() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formState, setFormState] = useState<{ open: boolean; editing: SearchPlaceholder | null }>({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState<SearchPlaceholder | null>(null);
  const [formText, setFormText] = useState('');
  const [formActive, setFormActive] = useState(true);

  // Debounce the search box before it hits the server.
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useAdminSearchPlaceholders({ page, pageSize: PAGE_SIZE, search: search || undefined });
  const items = useMemo(() => data?.data ?? [], [data]);
  const [localOrder, setLocalOrder] = useState<SearchPlaceholder[]>([]);
  useEffect(() => setLocalOrder(items), [items]);

  const createMutation = useCreateSearchPlaceholder();
  const updateMutation = useUpdateSearchPlaceholder();
  const deleteMutation = useDeleteSearchPlaceholder();
  const bulkDeleteMutation = useBulkDeleteSearchPlaceholders();
  const toggleMutation = useToggleSearchPlaceholders();
  const reorderMutation = useReorderSearchPlaceholders();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const previewWords = useMemo(
    () => localOrder.filter((p) => p.isActive).map((p) => p.text),
    [localOrder]
  );
  const previewText = useTypewriter(previewWords.length ? previewWords : ['শাড়ি'], false);

  const openCreate = () => {
    setFormState({ open: true, editing: null });
    setFormText('');
    setFormActive(true);
  };

  const openEdit = (item: SearchPlaceholder) => {
    setFormState({ open: true, editing: item });
    setFormText(item.text);
    setFormActive(item.isActive);
  };

  const closeForm = () => setFormState({ open: false, editing: null });

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const text = formText.trim();
    if (!text) return;

    if (formState.editing) {
      updateMutation.mutate(
        { id: formState.editing.id, text, isActive: formActive },
        {
          onSuccess: () => { showToast('পরিবর্তন সংরক্ষণ করা হয়েছে', 'success'); closeForm(); },
          onError: () => showToast('আপডেট করা যায়নি, আবার চেষ্টা করুন', 'error'),
        }
      );
    } else {
      createMutation.mutate(
        { text, isActive: formActive },
        {
          onSuccess: () => { showToast('নতুন টেক্সট যোগ করা হয়েছে', 'success'); closeForm(); },
          onError: () => showToast('যোগ করা যায়নি, আবার চেষ্টা করুন', 'error'),
        }
      );
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { showToast('মুছে ফেলা হয়েছে', 'info'); setDeleteTarget(null); },
      onError: () => showToast('মুছে ফেলা যায়নি', 'error'),
    });
  };

  const toggleOne = (item: SearchPlaceholder) => {
    toggleMutation.mutate(
      { ids: [item.id], isActive: !item.isActive },
      { onError: () => showToast('অবস্থা পরিবর্তন করা যায়নি', 'error') }
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === localOrder.length ? [] : localOrder.map((i) => i.id)));
  };

  const bulkEnable = (isActive: boolean) => {
    toggleMutation.mutate(
      { ids: selectedIds, isActive },
      {
        onSuccess: () => { showToast(isActive ? 'নির্বাচিতগুলো সক্রিয় করা হয়েছে' : 'নির্বাচিতগুলো নিষ্ক্রিয় করা হয়েছে', 'success'); setSelectedIds([]); },
        onError: () => showToast('অবস্থা পরিবর্তন করা যায়নি', 'error'),
      }
    );
  };

  const bulkDelete = () => {
    bulkDeleteMutation.mutate(selectedIds, {
      onSuccess: () => { showToast('নির্বাচিতগুলো মুছে ফেলা হয়েছে', 'info'); setSelectedIds([]); },
      onError: () => showToast('মুছে ফেলা যায়নি', 'error'),
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = localOrder.findIndex((i) => i.id === active.id);
    const newIndex = localOrder.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(localOrder, oldIndex, newIndex);
    setLocalOrder(reordered);
    reorderMutation.mutate(reordered.map((i) => i.id), {
      onError: () => { showToast('সাজানো সংরক্ষণ করা যায়নি', 'error'); setLocalOrder(items); },
    });
  };

  return (
    <div className="space-y-6">
      <Seo title="Search Placeholder Manager" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">Content Management</p>
          <h2 className="text-2xl font-bold mt-0.5">সার্চ প্লেসহোল্ডার ম্যানেজার</h2>
          <p className="text-sm text-text-secondary mt-1">সার্চ বারে ঘুরে ঘুরে দেখানো টাইপরাইটার টেক্সট পরিচালনা করুন।</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm"><Plus size={15} /> নতুন টেক্সট</button>
      </div>

      <div className="card-surface p-5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-1.5"><Sparkles size={13} className="text-primary" /> লাইভ প্রিভিউ</p>
        <div className="relative max-w-md">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" />
          <div className="w-full rounded-lg bg-gray-100 pl-11 pr-4 py-3.5 text-sm whitespace-nowrap overflow-hidden">
            <span className="text-text-secondary">নিত্যঘরে খুঁজুন </span>
            <span className="text-primary font-medium">&ldquo;{previewText}</span>
            <span className="inline-block w-px h-4 -mb-0.5 bg-primary animate-blink-caret" />
            <span className="text-primary font-medium">&rdquo;</span>
          </div>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-border">
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="টেক্সট খুঁজুন..."
              className="input-field pl-9 !py-2.5 text-sm"
            />
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <span className="text-xs text-text-secondary">{selectedIds.length}টি নির্বাচিত</span>
              <button onClick={() => bulkEnable(true)} className="btn-outline btn-sm !py-2">সক্রিয় করুন</button>
              <button onClick={() => bulkEnable(false)} className="btn-outline btn-sm !py-2">নিষ্ক্রিয় করুন</button>
              <button onClick={bulkDelete} className="btn-sm !py-2 rounded-full bg-error/10 text-error font-semibold px-4 hover:bg-error/20 transition-colors inline-flex items-center gap-1.5">
                <Trash2 size={13} /> মুছুন
              </button>
            </div>
          ) : (
            isFetching && !isLoading && <Loader2 size={16} className="animate-spin text-primary/60" />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-light/40">
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={localOrder.length > 0 && selectedIds.length === localOrder.length} onChange={toggleSelectAll} className="h-4 w-4 accent-primary rounded" />
                </th>
                <th className="px-2 py-3 w-8"></th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">টেক্সট</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">অবস্থা</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">আপডেট</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-14 text-text-secondary"><Loader2 size={24} className="mx-auto animate-spin text-primary/40" /></td></tr>
              ) : localOrder.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-text-secondary">
                    <Inbox size={30} className="mx-auto text-primary/30 mb-2" />
                    কোনো তথ্য পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={localOrder.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {localOrder.map((item) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        selected={selectedIds.includes(item.id)}
                        onToggleSelect={toggleSelect}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                        onToggleActive={toggleOne}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="p-4">
            <Pagination page={page} totalPages={data.meta.totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {formState.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={closeForm} />
          <form onSubmit={submitForm} className="relative w-full max-w-md bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in">
            <button type="button" onClick={closeForm} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">{formState.editing ? 'টেক্সট সম্পাদনা করুন' : 'নতুন টেক্সট যোগ করুন'}</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">টেক্সট</span>
                <input
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  required
                  maxLength={60}
                  placeholder="যেমন: শাড়ি"
                  className="input-field"
                  autoFocus
                />
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                <span className="text-sm font-medium">সক্রিয় (সার্চ বারে দেখানো হবে)</span>
              </label>
            </div>
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary w-full mt-6 disabled:opacity-60">
              {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : formState.editing ? 'সংরক্ষণ করুন' : 'যোগ করুন'}
            </button>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-lift p-6 sm:p-8 animate-fade-in text-center">
            <p className="text-sm text-text-secondary mb-1">নিশ্চিত করুন</p>
            <p className="font-semibold mb-6">&ldquo;{deleteTarget.text}&rdquo; মুছে ফেলতে চান?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-outline flex-1 justify-center">বাতিল</button>
              <button onClick={confirmDelete} disabled={deleteMutation.isPending} className="btn-primary flex-1 justify-center !bg-error hover:!bg-error/90 disabled:opacity-60">
                {deleteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
