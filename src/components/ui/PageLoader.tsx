export function PageLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <span className="h-10 w-10 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
        <p className="text-sm text-text-secondary">লোড হচ্ছে…</p>
      </div>
    </div>
  );
}
