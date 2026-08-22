interface ComingSoonProps {
  title: string;
  description?: string;
}
export function ComingSoon({
  title,
  description = "This workspace is being prepared for you.",
}: ComingSoonProps) {
  return (
    <section className="rounded-xl border bg-white p-8 shadow-sm dark:bg-slate-900">
      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
        Dayflow
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </section>
  );
}
