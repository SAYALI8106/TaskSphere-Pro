import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Card from "./ui/Card";
import ErrorMessage from "./ui/ErrorMessage";
import Button from "./ui/Button";
import { isAxiosError } from "axios";

type LoginProps = {
  onToggleForm: () => void;
};

const Login = ({ onToggleForm }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({ email, password });
    } catch (e: unknown) {
      const defaultError = "Failed to login. Please check your credentials.";
      if (isAxiosError(e)) {
        setError(e.response?.data.message || defaultError);
      } else {
        setError(defaultError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login({ email: "sam@example.com", password: "password123" });
    } catch (e: unknown) {
      const defaultError = "Failed to login with demo account.";
      if (isAxiosError(e)) {
        setError(e.response?.data.message || defaultError);
      } else {
        setError(defaultError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 px-4 py-8">
      <Card className="w-full max-w-md p-8 shadow-2xl border border-sky-500/20 backdrop-blur-md bg-white/95 dark:bg-gray-800/95 rounded-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white text-2xl shadow-lg mb-3">
            ⚡
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-2">
            TaskSphere <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold">PRO</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enterprise Task & Workflow Intelligence Platform
          </p>
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white transition-all"
              placeholder="••••••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md transition-all active:scale-[0.99]"
          >
            {loading ? "Authenticating..." : "Sign In to TaskSphere"}
          </Button>

          {/* Quick Demo Login Option */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Instant Access
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚀</span> Demo Login (Sam Smith • Preloaded Tasks)
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onToggleForm}
            className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            Create account
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Login;
