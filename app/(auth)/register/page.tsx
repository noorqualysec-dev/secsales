"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/app/services/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Connect to the local backend /api/users endpoint
      const response = await api.post("/users", { name, email, password });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.token) localStorage.setItem("token", data.token);
      alert("Registration successful! Welcome to the CRM.");
      router.push("/");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Registration failed. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
        <p className="text-sm text-slate-500 mt-2">Start managing your sales pipeline today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="name">
            Full Name
          </label>
          <Input 
            className="text-slate-800"
            id="name" 
            placeholder="John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
            disabled={registerMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Work Email
          </label>
          <Input 
            className="text-slate-800"
            id="email" 
            type="email" 
            placeholder="john@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={registerMutation.isPending}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input 
            className="text-slate-800"
            id="password" 
            type="password" 
            placeholder="Create a strong password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={registerMutation.isPending}
          />
        </div>

        <Button type="submit" className="w-full mt-4" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
