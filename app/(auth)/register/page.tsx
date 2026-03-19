import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function RegisterPage() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
        <p className="text-sm text-slate-500 mt-2">Start managing your sales pipeline today</p>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="firstName">
              First Name
            </label>
            <Input id="firstName" placeholder="John" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lastName">
              Last Name
            </label>
            <Input id="lastName" placeholder="Doe" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Work Email
          </label>
          <Input id="email" type="email" placeholder="john@company.com" required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="Create a strong password" required />
        </div>

        <Button type="button" className="w-full mt-4">
          Create Account
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
