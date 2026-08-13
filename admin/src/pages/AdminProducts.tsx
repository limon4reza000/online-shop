import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Pencil, Trash2, X, Copy, Eye, EyeOff, Loader2, Inbox, Search, Star, TrendingUp, Sparkles,
} from 'lucide-react';
import { Seo } from '@/components/ui/Seo';
import { Pagination } from '@/components/ui/Pagination';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { GalleryUploader } from '@/components/admin/GalleryUploader';
import { SearchableSelect } from '@/components/admin/SearchableSelect';
import { useToast } from '@/context/ToastContext';
import { formatPrice } from '@/lib/format';
import { useAdminCategories } from '@/hooks/useCategories';
import {
  useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useDuplicateProduct, useToggleProducts, type ProductFormInput,
} from '@/hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 12;
const slugify = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9ঀ-৿]+/g, '-').replace(/^-+|-+$/g, '');

const schema = z.object({
  name: z.string().min(2, 'পণ্যের নাম আবশ্যক'),
  subtitle: z.string().optional(),
  slug: z.string().min(2, 'স্লাগ আবশ্যক').regex(/^[a-z0-9ঀ-৿-]+$/, 'শুধু ছোট হাতের ইংরেজি/বাংলা অক্ষর, সংখ্যা এবং - ব্যবহার করুন'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'বিস্তারিত বিবরণ আবশ্যক (কমপক্ষে ১০ অক্ষর)'),
  richContent: z.string().optional(),
  price: z.string().min(1, 'মূল্য আবশ্যক').refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'সঠিক মূল্য দিন'),
  oldPrice: z.string().optional(),
  deliveryCharge: z.string().min(1, 'ডেলিভারি চার্জ আবশ্যক').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'সঠিক মূল্য দিন'),
  vat: z.string().min(1, 'ভ্যাট আবশ্যক').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'সঠিক মূল্য দিন'),
  stock: z.string().min(1, 'স্টক আবশ্যক').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'সঠিক পরিমাণ দিন'),
  sku: z.string().optional(),
  productCode: z.string().optional(),
  weight: z.string().optional(),
  material: z.string().optional(),
  warranty: z.string().optional(),
  returnPolicy: z.string().optional(),
  video: z.string().optional(),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).min(1, 'কমপক্ষে ১টি ছবি আবশ্যক'),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  tags: z.string().optional(),
  isFeatured: z.boolean(),
  isBestSeller: z.boolean(),
  isNewArrival: z.boolean(),
  isActive: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  mainCategorySlug: z.string().min(1, 'মেইন ক্যাটাগরি নির্বাচন করুন'),
  categoryId: z.string().min(1, 'সাব ক্যাটাগরি নির্বাচন করুন'),
  brandId: z.string().min(1, 'ব্র্যান্ড নির্বাচন করুন'),
});
type FormData = z.infer<typeof schema>;

const emptyDefaults: FormData = {
  name: '', subtitle: '', slug: '', shortDescription: '', description: '', richContent: '',
  price: '', oldPrice: '', deliveryCharge: '60', vat: '0', stock: '0', sku: '', productCode: '',
  weight: '', material: '', warranty: '', returnPolicy: '', video: '', thumbnail: '', images: [],
  colors: '', sizes: '', tags: '', isFeatured: false, isBestSeller: false, isNewArrival: false, isActive: true,
  seoTitle: '', seoDescription: '', metaKeywords: '', mainCategorySlug: '', categoryId: '', brandId: '',
};

function productToForm(p: Product, mainCategorySlug: string): FormData {
  return {
    name: p.name, subtitle: p.subtitle || '', slug: p.slug, shortDescription: p.shortDescription || '',
    description: p.description, richContent: p.richContent || '',
    price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : '',
    deliveryCharge: String(p.deliveryCharge), vat: String(p.vat), stock: String(p.stock),
    sku: p.sku || '', productCode: p.productCode || '', weight: p.weight ? String(p.weight) : '',
    material: p.material || '', warranty: p.warranty || '', returnPolicy: p.returnPolicy || '',
    video: p.video || '', thumbnail: p.thumbnail || '', images: p.images,
    colors: (p.colors || []).map((c) => `${c.name}:${c.hex}`).join(', '),
    sizes: (p.sizes || []).join(', '), tags: (p.tags || []).join(', '),
    isFeatured: !!p.isFeatured, isBestSeller: !!p.isBestSeller, isNewArrival: !!p.isNewArrival, isActive: p.isActive !== false,
    seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', metaKeywords: p.metaKeywords || '',
    mainCategorySlug, categoryId: p.categoryId || '', brandId: p.brandId || '',
  };
}

function parseColors(s?: string) {
  if (!s) return undefined;
  const parsed = s.split(',').map((chunk) => {
    const [name, hex] = chunk.split(':').map((x) => x.trim());
    return name && hex ? { name, hex } : null;
  }).filter((x): x is { name: string; hex: string } => !!x);
  return parsed.length ? parsed : undefined;
}
const parseList = (s?: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : undefined);

export default function AdminProducts() {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: catRows = [] } = useAdminCategories();
  const mains = useMemo(() => catRows.filter((c) => !c.parentId), [catRows]);
  const { data: brands = [] } = useBrands();

  const { data, isLoading, isFetching } = useAdminProducts({
    page, pageSize: PAGE_SIZE,
    q: search || undefined,
    subCategory: categoryFilter || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const products = data?.items ?? [];
  const meta = data?.meta;

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const duplicateMutation = useDuplicateProduct();
  const toggleMutation = useToggleProducts();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const nameValue = watch('name');
  const mainCategorySlug = watch('mainCategorySlug');
  const subOptions = useMemo(() => catRows.filter((c) => {
    const main = mains.find((m) => m.slug === mainCategorySlug);
    return main && c.parentId === main.id;
  }), [catRows, mains, mainCategorySlug]);

  useEffect(() => {
    if (!slugTouched && formOpen && !editing) setValue('slug', slugify(nameValue || ''));
  }, [nameValue, slugTouched, formOpen, editing, setValue]);

  const openCreate = () => {
    reset(emptyDefaults);
    setSlugTouched(false);
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    const sub = catRows.find((c) => c.id === p.categoryId);
    const main = sub ? catRows.find((c) => c.id === sub.parentId) : undefined;
    reset(productToForm(p, main?.slug || ''));
    setSlugTouched(true);
    setEditing(p);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  const onSubmit = (data: FormData) => {
    const payload: ProductFormInput = {
      name: data.name,
      subtitle: data.subtitle || undefined,
      slug: data.slug,
      shortDescription: data.shortDescription || undefined,
      description: data.description,
      richContent: data.richContent || undefined,
      price: Number(data.price),
      oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
      deliveryCharge: Number(data.deliveryCharge),
      vat: Number(data.vat),
      stock: Number(data.stock),
      sku: data.sku || undefined,
      productCode: data.productCode || undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      material: data.material || undefined,
      warranty: data.warranty || undefined,
      returnPolicy: data.returnPolicy || undefined,
      thumbnail: data.thumbnail || undefined,
      images: data.images,
      video: data.video || undefined,
      colors: parseColors(data.colors),
      sizes: parseList(data.sizes),
      tags: parseList(data.tags),
      isFeatured: data.isFeatured,
      isBestSeller: data.isBestSeller,
      isNewArrival: data.isNewArrival,
      isActive: data.isActive,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
      metaKeywords: data.metaKeywords || undefined,
      categoryId: data.categoryId,
      brandId: data.brandId,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { showToast('পণ্যটি হালনাগাদ করা হয়েছে', 'success'); closeForm(); },
        onError: () => showToast('আপডেট করা যায়নি, আবার চেষ্টা করুন', 'error'),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => { showToast('নতুন পণ্য তৈরি করা হয়েছে', 'success'); closeForm(); },
        onError: () => showToast('তৈরি করা যায়নি, আবার চেষ্টা করুন', 'error'),
      });
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => { showToast('পণ্যটি মুছে ফেলা হয়েছে', 'info'); setDeleteTarget(null); },
      onError: () => showToast('মুছে ফেলা যায়নি', 'error'),
    });
  };

  const duplicate = (p: Product) => {
    duplicateMutation.mutate(p.id, {
      onSuccess: () => showToast('পণ্যটি কপি করা হয়েছে', 'success'),
      onError: () => showToast('কপি করা যায়নি', 'error'),
    });
  };

  const toggleOne = (p: Product) => {
    toggleMutation.mutate({ ids: [p.id], isActive: !p.isActive }, {
      onError: () => showToast('অবস্থা পরিবর্তন করা যায়নি', 'error'),
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === products.length ? [] : products.map((p) => p.id)));
  };
  const bulkToggle = (isActive: boolean) => {
    toggleMutation.mutate({ ids: selectedIds, isActive }, {
      onSuccess: () => { showToast(isActive ? 'নির্বাচিতগুলো সক্রিয় করা হয়েছে' : 'নির্বাচিতগুলো নিষ্ক্রিয় করা হয়েছে', 'success'); setSelectedIds([]); },
      onError: () => showToast('অবস্থা পরিবর্তন করা যায়নি', 'error'),
    });
  };

  return (
    <div className="space-y-6">
      <Seo title="Manage Products" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">পণ্য ব্যবস্থাপনা</h2>
          <p className="text-sm text-text-secondary mt-1">ক্যাটালগে {meta?.total ?? 0}টি পণ্য রয়েছে।</p>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm"><Plus size={15} /> পণ্য যোগ করুন</button>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="পণ্য, SKU, ব্র্যান্ড খুঁজুন..." className="input-field pl-9 !py-2.5 text-sm" />
            </div>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field !w-auto text-sm py-2.5">
              <option value="">সব সাব ক্যাটাগরি</option>
              {catRows.filter((c) => c.parentId).map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }} className="input-field !w-auto text-sm py-2.5">
              <option value="all">সব অবস্থা</option>
              <option value="active">সক্রিয়</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </select>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <span className="text-xs text-text-secondary">{selectedIds.length}টি নির্বাচিত</span>
              <button onClick={() => bulkToggle(true)} className="btn-outline btn-sm !py-2">সক্রিয় করুন</button>
              <button onClick={() => bulkToggle(false)} className="btn-outline btn-sm !py-2">নিষ্ক্রিয় করুন</button>
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
                  <input type="checkbox" checked={products.length > 0 && selectedIds.length === products.length} onChange={toggleSelectAll} className="h-4 w-4 accent-primary rounded" />
                </th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">পণ্য</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">ক্যাটাগরি</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">মূল্য</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">স্টক</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">ট্যাগ</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">অবস্থা</th>
                <th className="text-left font-semibold text-xs uppercase tracking-wide text-text-secondary px-4 py-3">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-14 text-text-secondary"><Loader2 size={24} className="mx-auto animate-spin text-primary/40" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-14 text-text-secondary"><Inbox size={30} className="mx-auto text-primary/30 mb-2" /> কোনো পণ্য পাওয়া যায়নি</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-primary-light/30 transition-colors">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="h-4 w-4 accent-primary rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <img src={p.thumbnail || p.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-text-secondary">{p.brand} {p.sku && `· ${p.sku}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">{catRows.find((c) => c.id === p.categoryId)?.name || p.category}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{formatPrice(p.price)}</span>
                      {p.oldPrice && <span className="block text-xs text-text-secondary line-through">{formatPrice(p.oldPrice)}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${p.stock > 5 ? 'bg-success/10 text-success' : p.stock > 0 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'}`}>
                        {p.stock > 0 ? `${p.stock}টি স্টকে` : 'স্টক নেই'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {p.isFeatured && <span title="ফিচার্ড"><Sparkles size={13} className="text-primary" /></span>}
                        {p.isBestSeller && <span title="বেস্ট সেলার"><Star size={13} className="text-warning" /></span>}
                        {p.isNewArrival && <span title="নতুন"><TrendingUp size={13} className="text-success" /></span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleOne(p)} className={`badge ${p.isActive ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}>
                        {p.isActive ? <Eye size={12} /> : <EyeOff size={12} />} {p.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Pencil size={14} /></button>
                        <button onClick={() => duplicate(p)} className="p-2 rounded-full hover:bg-primary-light text-text-secondary hover:text-primary"><Copy size={14} /></button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-full hover:bg-error/10 text-text-secondary hover:text-error"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="p-4">
            <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={closeForm} />
          <form onSubmit={handleSubmit(onSubmit)} className="relative w-full max-w-3xl bg-surface rounded-3xl shadow-lift p-6 sm:p-8 max-h-[92vh] overflow-y-auto animate-fade-in">
            <button type="button" onClick={closeForm} className="absolute top-4 right-4 btn-icon !h-9 !w-9"><X size={16} /></button>
            <h3 className="text-lg font-bold mb-5">{editing ? 'পণ্য সম্পাদনা করুন' : 'নতুন পণ্য যোগ করুন'}</h3>

            <div className="space-y-6">
              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary">মৌলিক তথ্য</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">পণ্যের নাম</span>
                    <input {...register('name')} className="input-field" autoFocus />
                    {errors.name && <span className="text-xs text-error mt-1 block">{errors.name.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">সাবটাইটেল</span>
                    <input {...register('subtitle')} className="input-field" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">স্লাগ (URL)</span>
                  <input {...register('slug')} onChange={(e) => { setSlugTouched(true); setValue('slug', e.target.value); }} className="input-field" />
                  {errors.slug && <span className="text-xs text-error mt-1 block">{errors.slug.message}</span>}
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">সংক্ষিপ্ত বিবরণ</span>
                  <input {...register('shortDescription')} className="input-field" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">বিস্তারিত বিবরণ</span>
                  <textarea {...register('description')} rows={4} className="input-field resize-none" />
                  {errors.description && <span className="text-xs text-error mt-1 block">{errors.description.message}</span>}
                </label>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary">ক্যাটাগরি ও ব্র্যান্ড</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">মেইন ক্যাটাগরি</span>
                    <select {...register('mainCategorySlug')} onChange={(e) => { setValue('mainCategorySlug', e.target.value); setValue('categoryId', ''); }} className="input-field">
                      <option value="">নির্বাচন করুন</option>
                      {mains.map((m) => <option key={m.id} value={m.slug}>{m.icon} {m.name}</option>)}
                    </select>
                    {errors.mainCategorySlug && <span className="text-xs text-error mt-1 block">{errors.mainCategorySlug.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">সাব ক্যাটাগরি</span>
                    <select {...register('categoryId')} disabled={!mainCategorySlug} className="input-field disabled:opacity-50">
                      <option value="">নির্বাচন করুন</option>
                      {subOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.categoryId && <span className="text-xs text-error mt-1 block">{errors.categoryId.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">ব্র্যান্ড</span>
                    <SearchableSelect
                      value={watch('brandId')}
                      onChange={(v) => setValue('brandId', v, { shouldValidate: true })}
                      options={brands.map((b) => ({ value: b.id, label: b.name }))}
                      placeholder="ব্র্যান্ড নির্বাচন করুন"
                      searchPlaceholder="ব্র্যান্ড খুঁজুন..."
                    />
                    {errors.brandId && <span className="text-xs text-error mt-1 block">{errors.brandId.message}</span>}
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary">মূল্য ও স্টক</h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">মূল্য (৳)</span>
                    <input {...register('price')} type="number" step="0.01" className="input-field" />
                    {errors.price && <span className="text-xs text-error mt-1 block">{errors.price.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">পুরাতন/ছাড়ের আগের মূল্য (৳)</span>
                    <input {...register('oldPrice')} type="number" step="0.01" className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">স্টক পরিমাণ</span>
                    <input {...register('stock')} type="number" className="input-field" />
                    {errors.stock && <span className="text-xs text-error mt-1 block">{errors.stock.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">ডেলিভারি চার্জ (৳)</span>
                    <input {...register('deliveryCharge')} type="number" step="0.01" className="input-field" />
                    {errors.deliveryCharge && <span className="text-xs text-error mt-1 block">{errors.deliveryCharge.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">ভ্যাট (৳)</span>
                    <input {...register('vat')} type="number" step="0.01" className="input-field" />
                    {errors.vat && <span className="text-xs text-error mt-1 block">{errors.vat.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">ওজন (কেজি)</span>
                    <input {...register('weight')} type="number" step="0.01" className="input-field" />
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary">মিডিয়া</h4>
                <div className="flex flex-wrap gap-4">
                  <ImageUploader label="থাম্বনেইল" value={watch('thumbnail')} onChange={(url) => setValue('thumbnail', url)} />
                </div>
                <GalleryUploader label="গ্যালারি (একাধিক ছবি, টেনে সাজান)" value={watch('images')} onChange={(urls) => setValue('images', urls, { shouldValidate: true })} />
                {errors.images && <span className="text-xs text-error block">{errors.images.message}</span>}
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">ভিডিও URL (ঐচ্ছিক)</span>
                  <input {...register('video')} placeholder="https://..." className="input-field" />
                </label>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary">বৈশিষ্ট্য</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">SKU</span>
                    <input {...register('sku')} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">প্রোডাক্ট কোড</span>
                    <input {...register('productCode')} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">উপাদান (Material)</span>
                    <input {...register('material')} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">ওয়ারেন্টি</span>
                    <input {...register('warranty')} className="input-field" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">রঙ (নাম:হেক্স, কমা দিয়ে আলাদা করুন)</span>
                  <input {...register('colors')} placeholder="কালো:#000000, সাদা:#FFFFFF" className="input-field" />
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">সাইজ (কমা দিয়ে আলাদা করুন)</span>
                    <input {...register('sizes')} placeholder="S, M, L, XL" className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">ট্যাগ (কমা দিয়ে আলাদা করুন)</span>
                    <input {...register('tags')} placeholder="bestseller, new" className="input-field" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">রিটার্ন পলিসি</span>
                  <textarea {...register('returnPolicy')} rows={2} className="input-field resize-none" />
                </label>
                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 accent-primary rounded" /> <span className="text-sm font-medium">ফিচার্ড পণ্য</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isBestSeller')} className="h-4 w-4 accent-primary rounded" /> <span className="text-sm font-medium">বেস্ট সেলার</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isNewArrival')} className="h-4 w-4 accent-primary rounded" /> <span className="text-sm font-medium">নতুন সংযোজন</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isActive')} className="h-4 w-4 accent-primary rounded" /> <span className="text-sm font-medium">সক্রিয় (স্টোরফ্রন্টে দেখানো হবে)</span>
                  </label>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wide text-primary">SEO</h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">SEO শিরোনাম</span>
                    <input {...register('seoTitle')} className="input-field" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium mb-1.5 block">মেটা কীওয়ার্ড</span>
                    <input {...register('metaKeywords')} placeholder="কমা দিয়ে আলাদা করুন" className="input-field" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-medium mb-1.5 block">SEO বিবরণ</span>
                  <textarea {...register('seoDescription')} rows={2} className="input-field resize-none" />
                </label>
              </section>
            </div>

            <button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending} className="btn-primary w-full mt-6 disabled:opacity-60">
              {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : editing ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্য তৈরি করুন'}
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
