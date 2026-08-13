import { useRef } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ImagePlus, Loader2, X } from 'lucide-react';
import { useUploadImage } from '@/hooks/useUpload';
import { useToast } from '@/context/ToastContext';

function SortableThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: url });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="relative h-24 w-24 rounded-xl overflow-hidden border border-border shrink-0 group">
      <img src={url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-1 left-1 grid place-items-center h-6 w-6 rounded-full bg-text-primary/60 text-white cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={12} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 grid place-items-center h-6 w-6 rounded-full bg-text-primary/60 text-white hover:bg-error transition-colors"
      >
        <X size={12} />
      </button>
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

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  return (
    <div>
      {label && <span className="text-sm font-medium mb-1.5 block">{label}</span>}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-3">
            {value.map((url) => (
              <SortableThumb key={url} url={url} onRemove={() => onChange(value.filter((u) => u !== url))} />
            ))}
            {!atLimit && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="h-24 w-24 rounded-xl border-2 border-dashed border-border hover:border-primary grid place-items-center text-text-secondary hover:text-primary transition-colors shrink-0"
              >
                {upload.isPending ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
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
