export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
