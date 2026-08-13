import { useEffect, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Pencil, X, GripVertical, Eye, EyeOff, Loader2, Inbox, Star } from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useToast } from '@/context/ToastContext';
import {
  useAdminBrands, useCreateBrand, useUpdateBrand, useDeleteBrand, useToggleBrands, useReorderBrands,
} from '@/hooks/useBrands';
import type { Brand } from '@/lib/types';

const slugify = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9ঀ-৿]+/g, '-').replace(/^-+|-+$/g, '');

function SortableRow({
  item, onEdit, onDelete, onToggleActive,
}: {
  item: Brand;
  onEdit: (item: Brand) => void;
  onDelete: (item: Brand) => void;
  onToggleActive: (item: Brand) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-border last:border-0 hover:bg-primary-light/30 transition-colors">
      <td className="px-2 py-3 w-8 text-text-secondary">
        <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 touch-none" aria-label="টেনে সাজান">
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full overflow-hidden border border-border bg-white shrink-0 grid place-items-center">
            {item.logoUrl ? <img src={item.logoUrl} alt="" className="h-full w-full object-contain" /> : <span className="text-xs text-text-secondary">?</span>}
          </span>
          <div>
            <p className="font-medium text-sm flex items-center gap-1.5">
              {item.name}
              {item.featured && <span title="ফিচার্ড"><Star size={12} className="fill-primary text-primary" /></span>}
            </p>
            <code className="text-[11px] text-text-secondary">{item.slug}</code>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary">{item.productCount}টি পণ্য</td>
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleActive(item)}
          className={`badge ${item.isActive ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}
        >
          {item.isActive ? <Eye size={12} /> : <EyeOff size={12} />} {item.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
          <button onClick={() => onDelete(item)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminBrands() {
  const { showToast } = useToast();
  const { data: brands = [], isLoading } = useAdminBrands();
  const [localOrder, setLocalOrder] = useState<Brand[]>([]);
  useEffect(() => setLocalOrder(brands), [brands]);

  const [formState, setFormState] = useState<{ open: boolean; editing: Brand | null }>({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [banner, setBanner] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const deleteMutation = useDeleteBrand();
  const toggleMutation = useToggleBrands();
  const reorderMutation = useReorderBrands();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!slugTouched && formState.open && !formState.editing) setSlug(slugify(name));
  }, [name, slugTouched, formState.open, formState.editing]);

  const openCreate = () => {
    setFormState({ open: true, editing: null });
    setSlugTouched(false);
    setName(''); setSlug(''); setDescription(''); setLogoUrl(''); setBanner(''); setFeatured(false); setIsActive(true);
  };

  const openEdit = (item: Brand) => {
    setFormState({ open: true, editing: item });
    setSlugTouched(true);
    setName(item.name); setSlug(item.slug); setDescription(item.description || '');
    setLogoUrl(item.logoUrl || ''); setBanner(item.banner || ''); setFeatured(item.featured); setIsActive(item.isActive);
  };

  const closeForm = () => setFormState({ open: false, editing: null });

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    const payload = {
      name: name.trim(), slug: slug.trim(), description: description.trim() || undefined,
      logoUrl: logoUrl || undefined, banner: banner || undefined, featured, isActive,
    };

    if (formState.editing) {
      updateMutation.mutate(
        { id: formState.editing.id, ...payload },
        {
          onSuccess: () => { showToast('ব্র্যান্ড হালনাগাদ করা হয়েছে', 'success'); closeForm(); },
          onError: () => showToast('আপডেট করা যায়নি, আবার চেষ্টা করুন', 'error'),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { showToast('নতুন ব্র্যান্ড যোগ করা হয়েছে', 'success'); closeForm(); },
        onError: () => showToast('যোগ করা যায়নি, আবার চেষ্টা করুন', 'error'),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { showToast('ব্র্যান্ড মুছে ফেলা হয়েছে', 'info'); setDeleteTarget(null); },
      onError: () => { showToast('মুছে ফেলা যায়নি — এই ব্র্যান্ডে পণ্য থাকতে পারে', 'error'); setDeleteTarget(null); },
    });
  };

  const toggleOne = (item: Brand) => {
    toggleMutation.mutate(
      { ids: [item.id], isActive: !item.isActive },
      { onError: () => showToast('অবস্থা পরিবর্তন করা যায়নি', 'error') }
    );
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = localOrder.findIndex((i) => i.id === active.id);
    const newIndex = localOrder.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(localOrder, oldIndex, newIndex);
    setLocalOrder(reordered);
    reorderMutation.mutate(reordered.map((i) => i.id), {
      onError: () => { showToast('সাজানো সংরক্ষণ করা যায়নি', 'error'); setLocalOrder(brands); },
    });
  };

  return (
    <div className="space-y-6">
      <Seo title="Manage Brands" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">ব্র্যান্ড ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">সকল ব্র্যান্ড পরিচালনা করুন — যেগুলো "ফিচার্ড" ও সক্রিয়, শুধু সেগুলোই হোমপেজের "বিশেষ ব্র্যান্ড" সেকশনে দেখানো হবে।</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm"><Plus size={15} /> নতুন ব্র্যান্ড</button>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-primary-light/40">
                <th className="px-2 py-3 w-8"></th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">ব্র্যান্ড</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">পণ্য</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">অবস্থা</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-14 text-text-secondary"><Loader2 size={24} className="mx-auto animate-spin text-primary/40" /></td></tr>
              ) : localOrder.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-text-secondary">
                    <Inbox size={30} className="mx-auto text-primary/30 mb-2" />
                    কোনো ব্র্যান্ড পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={localOrder.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {localOrder.map((item) => (
                      <SortableRow key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteTarget} onToggleActive={toggleOne} />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formState.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={closeForm} />
          <form onSubmit={submitForm} className="relative w-full max-w-lg bg-surface rounded-3xl shadow-lift p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <button type="button" onClick={closeForm} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">{formState.editing ? 'ব্র্যান্ড সম্পাদনা করুন' : 'নতুন ব্র্যান্ড যোগ করুন'}</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">ব্র্যান্ডের নাম</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="যেমন: Aurelia" className="input-field" autoFocus />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">স্লাগ (URL)</span>
                <input
                  value={slug}
                  onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                  required
                  placeholder="aurelia"
                  className="input-field font-mono text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">বিবরণ (ঐচ্ছিক)</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="এই ব্র্যান্ড সম্পর্কে সংক্ষিপ্ত বিবরণ — ব্র্যান্ড পেজে দেখানো হবে"
                  className="input-field resize-none"
                />
              </label>
              <div className="flex flex-wrap gap-4">
                <ImageUploader label="লোগো" value={logoUrl} onChange={setLogoUrl} aspect="aspect-square" size="max-w-[140px]" />
                <ImageUploader label="ব্যানার (ঐচ্ছিক)" value={banner} onChange={setBanner} aspect="aspect-video" size="max-w-[220px]" />
              </div>
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                  <span className="text-sm font-medium">ফিচার্ড (হোমপেজের "বিশেষ ব্র্যান্ড" সেকশনে দেখানো হবে)</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                  <span className="text-sm font-medium">সক্রিয়</span>
                </label>
              </div>
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
            <p className="font-semibold mb-6">&ldquo;{deleteTarget.name}&rdquo; মুছে ফেলতে চান?</p>
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
