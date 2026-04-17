"use client";

import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { canAccessAdminPortal } from "@/app/utils/permissions";
import {
  clearAdminSession,
  persistAdminSession,
  persistPrimarySession,
} from "@/app/utils/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Connect to the local backend /api/users/login endpoint
      const response = await api.post("/users/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      const { token, ...userData } = data?.data ?? {};
      const user = userData.user || userData;
      
      if (token && user) {
        persistPrimarySession(token, user, false);

        if (canAccessAdminPortal(user.role)) {
          persistAdminSession(token, user, false);
        } else {
          clearAdminSession(false);
        }

        window.dispatchEvent(new Event("auth-change"));
        window.dispatchEvent(new Event("admin-auth-change"));
      }

      if (canAccessAdminPortal(user?.role)) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      alert(message || "Login failed. Please verify credentials.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="text-sm text-slate-500 mt-2">Sign in to your CRM dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email Address
          </label>
          <Input 
            className="text-slate-700" 
            id="email" 
            type="email" 
            placeholder="you@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={loginMutation.isPending}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <Link href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Forgot password?
            </Link>
          </div>
          <Input 
            className="text-slate-700" 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={loginMutation.isPending}
          />
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
