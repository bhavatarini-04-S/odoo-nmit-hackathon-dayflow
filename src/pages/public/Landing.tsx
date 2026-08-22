import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
export function Landing() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 dark:bg-slate-950">
      <section className="max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
          <Sparkles className="size-4" /> Human resources, in flow
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Every workday,{" "}
          <span className="text-indigo-600">perfectly aligned.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">
          Dayflow brings people, time, and operations together in one calm
          workspace.
        </p>
        <Link
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          to="/login"
        >
          Enter Dayflow <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
