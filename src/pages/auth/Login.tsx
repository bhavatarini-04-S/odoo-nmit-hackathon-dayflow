import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signIn } from "../../services/authService";
export function Login() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [email, setEmail] = useState("ananya.rao@dayflow.test");
  const [password, setPassword] = useState("dayflow123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      setCurrentUser(user);
      navigate(
        user.role === "employee" ? "/employee/dashboard" : "/admin/dashboard",
        { replace: true },
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to keep your workday flowing."
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <Field label="Work email">
          <input
            autoComplete="email"
            className="auth-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input
              autoComplete="current-password"
              className="auth-input pr-11"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 px-3 text-slate-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <button disabled={loading} className="auth-button" type="submit">
          {loading && <LoaderCircle className="size-4 animate-spin" />} Sign in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        New to Dayflow?{" "}
        <Link className="font-medium text-indigo-600" to="/signup">
          Create an account
        </Link>
      </p>
      <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Demo: any seeded email with <strong>dayflow123</strong>.
      </p>
    </AuthFrame>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-5 dark:bg-slate-950">
      <section className="w-full max-w-md rounded-2xl border bg-white p-7 shadow-sm sm:p-9 dark:bg-slate-900">
        <Link
          className="mb-8 flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-indigo-300"
          to="/"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
            D
          </span>{" "}
          Dayflow
        </Link>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 mb-6 text-sm text-slate-500">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
