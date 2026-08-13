import { useRef, useState } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, Loader2, RefreshCw, X } from 'lucide-react';
import { useUploadImage } from '@/hooks/useUpload';
import { useToast } from '@/context/ToastContext';

function SortableThumb({
  url, onRemove, onReplace, replacing,
}: { url: string; onRemove: () => void; onReplace: (file: File) => void; replacing: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-28 w-28 rounded-2xl overflow-hidden border border-border bg-surface shadow-soft shrink-0 group hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
    >
      <img src={url} alt="" className="h-full w-full object-cover" />

      {replacing ? (
        <div className="absolute inset-0 bg-text-primary/55 grid place-items-center">
          <Loader2 size={20} className="animate-spin text-white" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="ছবি পরিবর্তন করুন"
          className="absolute inset-0 flex items-center justify-center bg-text-primary/0 group-hover:bg-text-primary/45 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <span className="flex items-center gap-1.5 rounded-full bg-white text-text-primary text-[11px] font-semibold px-3 py-1.5 shadow-card">
            <RefreshCw size={12} /> পরিবর্তন
          </span>
        </button>
      )}

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-1.5 left-1.5 z-10 grid place-items-center h-6 w-6 rounded-full bg-white/95 text-text-primary shadow-soft cursor-grab active:cursor-grabbing touch-none hover:bg-primary hover:text-white transition-colors"
      >
        <GripVertical size={12} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 z-10 grid place-items-center h-6 w-6 rounded-full bg-white/95 text-text-primary shadow-soft hover:bg-error hover:text-white transition-colors"
      >
        <X size={12} />
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onReplace(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export function GalleryUploader({
  value, onChange, label, max,
}: { value: string[]; onChange: (urls: string[]) => void; label?: string; max?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();
  const { showToast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const atLimit = max !== undefined && value.length >= max;
  const [replacingUrl, setReplacingUrl] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const room = max !== undefined ? Math.max(0, max - value.length) : files.length;
    if (room === 0) {
      showToast(`সর্বোচ্চ ${max}টি ছবি দেওয়া যাবে`, 'error');
      return;
    }
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const url = await upload.mutateAsync(file);
        uploaded.push(url);
      } catch {
        showToast(`"${file.name}" আপলোড করা যায়নি`, 'error');
      }
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
  };

  const handleReplace = async (oldUrl: string, file: File) => {
    setReplacingUrl(oldUrl);
    try {
      const url = await upload.mutateAsync(file);
      onChange(value.map((u) => (u === oldUrl ? url : u)));
    } catch {
      showToast(`"${file.name}" আপলোড করা যায়নি`, 'error');
    } finally {
      setReplacingUrl(null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium">{label}</span>
          {max !== undefined && <span className="text-xs text-text-secondary">{value.length}/{max}</span>}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-3">
            {value.map((url) => (
              <SortableThumb
                key={url}
                url={url}
                onRemove={() => onChange(value.filter((u) => u !== url))}
                onReplace={(file) => handleReplace(url, file)}
                replacing={replacingUrl === url}
              />
            ))}
            {!atLimit && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="h-28 w-28 rounded-2xl border-2 border-dashed border-border bg-primary-light/30 hover:border-primary hover:bg-primary-light/60 hover:-translate-y-0.5 grid place-items-center text-text-secondary hover:text-primary transition-all duration-300 shrink-0"
              >
                {upload.isPending && !replacingUrl ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <span className="flex flex-col items-center gap-1">
                    <ImagePlus size={20} />
                    <span className="text-[11px] font-semibold">ছবি যোগ করুন</span>
                  </span>
                )}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
