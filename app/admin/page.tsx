"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { api } from "@/app/services/api";

export default function AdminAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/users/login" : "/users";
      const payload = isLogin 
        ? { email: form.email, password: form.password }
        : { ...form, role: "admin" }; // Explicitly register as admin for this portal

      const res = await api.post(endpoint, payload);
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data.user || res.data.data));
        window.dispatchEvent(new Event("auth-change"));
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <Zap className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-slate-400 mt-2 text-sm">
            {isLogin ? "Welcome back, please sign in." : "Create a new administrator account."}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition duration-200"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition duration-200"
                placeholder="admin@qualysec.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition duration-200"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                <span className="flex items-center gap-2">Sign In <LogIn size={18} /></span>
              ) : (
                <span className="flex items-center gap-2">Create Account <UserPlus size={18} /></span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-slate-400 hover:text-white transition"
            >
              {isLogin ? "Don't have an admin account? Register" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-medium text-slate-600 hover:text-slate-400 flex items-center justify-center gap-1 mx-auto"
          >
            ← Back to main site
          </button>
        </div>
      </div>
    </div>
  );
}
