import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") await signup(email, password);
      else await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-[#050816]">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/[0.04]">
        <Link to="/" className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Back to FlowPilot</Link>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950 dark:text-white">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {mode === "signup" ? "Two premium actions are included in your free trial." : "Sign in to continue to your dashboard."}
        </p>
        {error && <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">{error}</p>}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-slate-950" />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-slate-950" />
          </label>
          <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white disabled:opacity-60 dark:bg-cyan-300 dark:text-slate-950">
            <FiMail /> {loading ? "Working..." : mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>
        <button onClick={google} disabled={loading} className="mt-3 w-full rounded-full border border-slate-200 px-5 py-3 font-semibold text-slate-800 dark:border-white/10 dark:text-white">
          Continue with Google
        </button>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === "signup" ? "Already have an account?" : "New to FlowPilot?"}{" "}
          <Link className="font-semibold text-cyan-700 dark:text-cyan-300" to={mode === "signup" ? "/login" : "/signup"}>
            {mode === "signup" ? "Log in" : "Create one"}
          </Link>
        </p>
      </section>
    </main>
  );
}
