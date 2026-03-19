import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function LoginPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-black-900">Welcome Back</h1>
        <p className="text-sm text-black-500 mt-2">Sign in to your CRM dashboard</p>
      </div>

      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email Address
          </label>
          <Input className="text-slate-700" id="email" type="email" placeholder="you@company.com" required />
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
          <Input className="text-slate-700" id="password" type="password" placeholder="••••••••" required />
        </div>

        <Button type="button" className="w-full mt-2">
          Sign In
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
