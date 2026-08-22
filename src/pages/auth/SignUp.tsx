import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signUp } from "../../services/authService";
import { AuthFrame } from "./Login";
export function SignUp() {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (fullName.trim().length < 2) return setError("Enter your full name.");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 8)
      return setError("Use at least 8 characters for your password.");
    setLoading(true);
    try {
      const user = await signUp(fullName.trim(), email, password);
      setCurrentUser(user);
      navigate("/employee/dashboard", { replace: true });
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthFrame
      title="Create your account"
      subtitle="Start bringing every workday into alignment."
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Full name</span>
          <input
            className="auth-input"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Work email</span>
          <input
            className="auth-input"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Password</span>
          <div className="relative">
            <input
              className="auth-input pr-11"
              autoComplete="new-password"
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
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <button disabled={loading} className="auth-button" type="submit">
          {loading && <LoaderCircle className="size-4 animate-spin" />} Create
          account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-medium text-indigo-600" to="/login">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
