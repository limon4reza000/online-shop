export function SkeletonCard() {
  return (
    <div className="overflow-hidden border-r border-b border-border bg-white">
      <div className="skeleton aspect-[4/5]" />
      <div className="p-3.5 space-y-2">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    </div>
  );
}
