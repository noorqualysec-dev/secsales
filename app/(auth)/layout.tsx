import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Decorative background element */}
      <div className="absolute inset-0 bg-indigo-50 [mask-image:linear-gradient(to_bottom,white,transparent)] z-0" />
      
      <div className="w-full max-w-md z-10 relative">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Qualysec Sales
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
