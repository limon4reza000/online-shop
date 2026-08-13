import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Pencil, Trash2, X, GripVertical, Eye, EyeOff, Loader2, Inbox, ChevronRight, FolderTree,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { GalleryUploader } from '@/components/admin/GalleryUploader';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { CATEGORY_ICON_OPTIONS } from '@/lib/categoryIcons';
import { CUSTOM_CATEGORY_ICON_OPTIONS } from '@/lib/customCategoryIcons';

const ALL_ICON_OPTIONS = [...CATEGORY_ICON_OPTIONS, ...CUSTOM_CATEGORY_ICON_OPTIONS];
import { useToast } from '@/context/ToastContext';
import {
  useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  useToggleCategories, useReorderCategories, type AdminCategoryRow,
} from '@/hooks/useCategories';

const slugify = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9ঀ-৿]+/g, '-').replace(/^-+|-+$/g, '');

const schema = z.object({
  name: z.string().min(1, 'নাম আবশ্যক'),
  slug: z.string().min(1, 'স্লাগ আবশ্যক').regex(/^[a-z0-9ঀ-৿-]+$/, 'শুধু ছোট হাতের ইংরেজি/বাংলা অক্ষর, সংখ্যা এবং - ব্যবহার করুন'),
  icon: z.string().optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
  bannerImages: z.array(z.string()).max(3).optional(),
  isActive: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function SortableItem({
  id, children,
}: { id: string; children: (drag: { attributes: ReturnType<typeof useSortable>['attributes']; listeners: ReturnType<typeof useSortable>['listeners'] }) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return <div ref={setNodeRef} style={style}>{children({ attributes, listeners })}</div>;
}

export default function AdminCategories() {
  const { showToast } = useToast();
  const { data: rows = [], isLoading } = useAdminCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const toggleMutation = useToggleCategories();
  const reorderMutation = useReorderCategories();

  const mains = useMemo(() => rows.filter((c) => !c.parentId), [rows]);
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMainId && mains.length > 0) setSelectedMainId(mains[0].id);
  }, [mains, selectedMainId]);

  const selectedMain = mains.find((m) => m.id === selectedMainId) || null;
  const subs = useMemo(() => rows.filter((c) => c.parentId === selectedMainId), [rows, selectedMainId]);

  const [localMains, setLocalMains] = useState<AdminCategoryRow[]>([]);
  const [localSubs, setLocalSubs] = useState<AdminCategoryRow[]>([]);
  useEffect(() => setLocalMains(mains), [mains]);
  useEffect(() => setLocalSubs(subs), [subs]);

  const [formState, setFormState] = useState<{ open: boolean; mode: 'main' | 'sub'; editing: AdminCategoryRow | null }>({ open: false, mode: 'main', editing: null });
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryRow | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', icon: '', image: '', banner: '', bannerImages: [], isActive: true },
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const nameValue = watch('name');

  useEffect(() => {
    if (!slugTouched && formState.open && !formState.editing) setValue('slug', slugify(nameValue || ''));
  }, [nameValue, slugTouched, formState.open, formState.editing, setValue]);

  const openCreateMain = () => {
    reset({ name: '', slug: '', icon: '', image: '', banner: '', bannerImages: [], isActive: true });
    setSlugTouched(false);
    setFormState({ open: true, mode: 'main', editing: null });
  };
  const openCreateSub = () => {
    if (!selectedMain) return;
    reset({ name: '', slug: '', icon: '', image: '', banner: '', bannerImages: [], isActive: true });
    setSlugTouched(false);
    setFormState({ open: true, mode: 'sub', editing: null });
  };
  const openEdit = (row: AdminCategoryRow, mode: 'main' | 'sub') => {
    reset({
      name: row.name, slug: row.slug, icon: row.icon || '', image: row.image || '', banner: row.banner || '',
      bannerImages: row.bannerImages || [], isActive: row.isActive ?? true,
    });
    setSlugTouched(true);
    setFormState({ open: true, mode, editing: row });
  };
  const closeForm = () => setFormState((s) => ({ ...s, open: false }));

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
      icon: data.icon,
      image: data.image,
      banner: data.banner,
      bannerImages: data.bannerImages,
      ...(formState.mode === 'sub' && !formState.editing ? { parentId: selectedMainId } : {}),
    };

    if (formState.editing) {
      updateMutation.mutate(
        { id: formState.editing.id, ...payload },
        {
          onSuccess: () => { showToast('পরিবর্তন সংরক্ষণ করা হয়েছে', 'success'); closeForm(); },
          onError: () => showToast('আপডেট করা যায়নি, আবার চেষ্টা করুন', 'error'),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          showToast(formState.mode === 'main' ? 'নতুন মেইন ক্যাটাগরি যোগ করা হয়েছে' : 'নতুন সাব ক্যাটাগরি যোগ করা হয়েছে', 'success');
          closeForm();
        },
        onError: () => showToast('তৈরি করা যায়নি, আবার চেষ্টা করুন', 'error'),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        showToast('মুছে ফেলা হয়েছে', 'info');
        if (deleteTarget.id === selectedMainId) setSelectedMainId(null);
        setDeleteTarget(null);
      },
      onError: () => showToast('মুছে ফেলা যায়নি — আগে এর সাবক্যাটাগরি/পণ্য সরান', 'error'),
    });
  };

  const toggleOne = (row: AdminCategoryRow) => {
    toggleMutation.mutate({ ids: [row.id], isActive: !row.isActive }, {
      onError: () => showToast('অবস্থা পরিবর্তন করা যায়নি', 'error'),
    });
  };

  const handleMainDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = localMains.findIndex((i) => i.id === active.id);
    const newIndex = localMains.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(localMains, oldIndex, newIndex);
    setLocalMains(reordered);
    reorderMutation.mutate(reordered.map((i) => i.id), {
      onError: () => { showToast('সাজানো সংরক্ষণ করা যায়নি', 'error'); setLocalMains(mains); },
    });
  };

  const handleSubDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = localSubs.findIndex((i) => i.id === active.id);
    const newIndex = localSubs.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(localSubs, oldIndex, newIndex);
    setLocalSubs(reordered);
    reorderMutation.mutate(reordered.map((i) => i.id), {
      onError: () => { showToast('সাজানো সংরক্ষণ করা যায়নি', 'error'); setLocalSubs(subs); },
    });
  };

  return (
    <div className="space-y-6">
      <Seo title="Manage Categories" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5"><FolderTree size={13} /> Catalog</p>
          <h2 className="text-2xl font-bold mt-0.5">ক্যাটাগরি ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">{mains.length}টি মেইন ক্যাটাগরি · {rows.length - mains.length}টি সাব ক্যাটাগরি</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card-surface p-14 text-center"><Loader2 size={26} className="mx-auto animate-spin text-primary/40" /></div>
      ) : (
        <div className="grid lg:grid-cols-[340px_1fr] gap-5 items-start">
          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-bold">মেইন ক্যাটাগরি</h3>
              <button onClick={openCreateMain} className="btn-primary btn-sm !py-1.5"><Plus size={13} /> যোগ করুন</button>
            </div>
            {localMains.length === 0 ? (
              <div className="text-center py-12 text-text-secondary text-sm"><Inbox size={26} className="mx-auto text-primary/30 mb-2" /> কোনো ক্যাটাগরি নেই</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMainDragEnd}>
                <SortableContext items={localMains.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-border">
                    {localMains.map((m) => (
                      <SortableItem key={m.id} id={m.id}>
                        {({ attributes, listeners }) => (
                          <div
                            onClick={() => setSelectedMainId(m.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${selectedMainId === m.id ? 'bg-primary-light' : 'hover:bg-primary-light/40'}`}
                          >
                            <button type="button" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()} className="text-text-secondary cursor-grab active:cursor-grabbing p-1 touch-none">
                              <GripVertical size={14} />
                            </button>
                            <CategoryIcon name={m.icon} className="text-lg w-5 text-center shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium truncate ${!m.isActive ? 'text-text-secondary line-through' : ''}`}>{m.name}</p>
                              <p className="text-xs text-text-secondary">{m.subCount}টি সাব · {m.count}টি পণ্য</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); toggleOne(m); }} className="p-1.5 rounded-full hover:bg-white text-text-secondary" title={m.isActive ? 'লুকান' : 'দেখান'}>
                              {m.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openEdit(m, 'main'); }} className="p-1.5 rounded-full hover:bg-white text-text-secondary hover:text-primary"><Pencil size={13} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(m); }} className="p-1.5 rounded-full hover:bg-white text-text-secondary hover:text-error"><Trash2 size={13} /></button>
                            <ChevronRight size={14} className="text-text-secondary shrink-0" />
                          </div>
                        )}
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-bold">
                {selectedMain ? <>সাব ক্যাটাগরি — <span className="text-primary">{selectedMain.name}</span></> : 'সাব ক্যাটাগরি'}
              </h3>
              <button onClick={openCreateSub} disabled={!selectedMain} className="btn-primary btn-sm !py-1.5 disabled:opacity-50"><Plus size={13} /> সাব যোগ করুন</button>
            </div>
            {!selectedMain ? (
              <div className="text-center py-16 text-text-secondary text-sm">একটি মেইন ক্যাটাগরি নির্বাচন করুন</div>
            ) : localSubs.length === 0 ? (
              <div className="text-center py-16 text-text-secondary text-sm"><Inbox size={26} className="mx-auto text-primary/30 mb-2" /> কোনো সাব ক্যাটাগরি নেই</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSubDragEnd}>
                <SortableContext items={localSubs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-border">
                    {localSubs.map((s) => (
                      <SortableItem key={s.id} id={s.id}>
                        {({ attributes, listeners }) => (
                          <div className="flex items-center gap-3 px-4 py-3">
                            <button type="button" {...attributes} {...listeners} className="text-text-secondary cursor-grab active:cursor-grabbing p-1 touch-none">
                              <GripVertical size={14} />
                            </button>
                            <span className="grid place-items-center h-9 w-9 rounded-lg bg-primary-light text-primary text-sm shrink-0">
                              <CategoryIcon name={s.icon} />
                            </span>
                            {s.image && <img src={s.image} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium truncate ${!s.isActive ? 'text-text-secondary line-through' : ''}`}>{s.name}</p>
                              <code className="text-[11px] text-text-secondary">{s.slug}</code>
                            </div>
                            <span className="text-xs text-text-secondary shrink-0">{s.count}টি পণ্য</span>
                            <button onClick={() => toggleOne(s)} className="p-2 rounded-full hover:bg-primary-light text-text-secondary" title={s.isActive ? 'লুকান' : 'দেখান'}>
                              {s.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>
                            <button onClick={() => openEdit(s, 'sub')} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
                            <button onClick={() => setDeleteTarget(s)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
                          </div>
                        )}
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      )}

      {formState.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={closeForm} />
          <form onSubmit={handleSubmit(onSubmit)} className="relative w-full max-w-md bg-surface rounded-3xl shadow-lift p-6 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <button type="button" onClick={closeForm} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">
              {formState.editing ? 'ক্যাটাগরি সম্পাদনা করুন' : formState.mode === 'main' ? 'নতুন মেইন ক্যাটাগরি' : `নতুন সাব ক্যাটাগরি (${selectedMain?.name})`}
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">নাম</span>
                <input {...register('name')} className="input-field" autoFocus />
                {errors.name && <span className="text-xs text-error mt-1 block">{errors.name.message}</span>}
              </label>
              <label className="block">
                <span className="text-sm font-medium mb-1.5 block">স্লাগ (URL)</span>
                <input {...register('slug')} onChange={(e) => { setSlugTouched(true); setValue('slug', e.target.value); }} className="input-field" />
                {errors.slug && <span className="text-xs text-error mt-1 block">{errors.slug.message}</span>}
              </label>

              <div className="block">
                <span className="text-sm font-medium mb-1.5 block">আইকন</span>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-0.5">
                  {ALL_ICON_OPTIONS.map((opt) => {
                    const selected = watch('icon') === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        title={opt.label}
                        onClick={() => setValue('icon', opt.name)}
                        className={`aspect-square rounded-xl border-2 grid place-items-center text-base transition-colors ${
                          selected ? 'border-primary bg-primary-light text-primary' : 'border-border text-text-secondary hover:border-primary/40'
                        }`}
                      >
                        <CategoryIcon name={opt.name} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {formState.mode === 'sub' && (
                <GalleryUploader
                  label="হিরো ব্যানার — সর্বোচ্চ ৩টি ছবি (সাব ক্যাটাগরি পেজে ২ সেকেন্ড পরপর অটো-স্লাইড হবে)"
                  value={watch('bannerImages') || []}
                  onChange={(urls) => setValue('bannerImages', urls)}
                  max={3}
                />
              )}

              <div className="flex flex-wrap gap-4">
                {formState.mode === 'main' && (
                  <ImageUploader
                    label="মেইন ক্যাটাগরি ব্যানার"
                    value={watch('banner')}
                    onChange={(url) => setValue('banner', url)}
                    aspect="aspect-video"
                  />
                )}
                <ImageUploader label={formState.mode === 'main' ? 'থাম্বনেইল' : 'ছবি'} value={watch('image')} onChange={(url) => setValue('image', url)} />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                <input type="checkbox" {...register('isActive')} className="h-4 w-4 accent-primary rounded" />
                <span className="text-sm font-medium">সক্রিয় (স্টোরফ্রন্টে দেখানো হবে)</span>
              </label>
            </div>
            <button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending} className="btn-primary w-full mt-6 disabled:opacity-60">
              {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : formState.editing ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}
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
