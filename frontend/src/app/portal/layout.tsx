"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Activity, FileText, LogOut, HeartPulse } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    if (!token || !patientStr) {
      router.push("/portal/login");
    } else {
      setPatient(JSON.parse(patientStr));
    }
  }, [router]);

  if (!patient) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">جاري التحقق...</div>;

  const handleLogout = () => {
    router.push("/portal/login");
  };

  const navItems = [
    { name: "الرئيسية", href: "/portal", icon: Home },
    { name: "مواعيدي", href: "/portal/appointments", icon: Calendar },
    { name: "التقارير", href: "/portal/records", icon: Activity },
    { name: "الوصفات", href: "/portal/prescriptions", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FE] text-slate-800 font-sans pb-20 md:pb-0 md:pt-16" dir="rtl">
      
      {/* Top Header (Desktop) */}
      <header className="hidden md:flex fixed top-0 w-full h-16 bg-white border-b border-slate-100 items-center justify-between px-8 z-50">
        <div className="flex items-center gap-2 text-rose-600">
          <HeartPulse className="h-6 w-6" />
          <span className="font-bold text-xl">بوابة المريضة</span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`font-medium px-3 py-2 rounded-xl transition-colors ${
                  pathname === item.href ? "bg-rose-50 text-rose-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700">{patient.fullName}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Top Header (Mobile) */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2 text-rose-600">
          <HeartPulse className="h-6 w-6" />
          <span className="font-bold text-lg">بوابة المريضة</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 rounded-full bg-slate-50">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 flex items-center justify-around py-3 px-2 z-50 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 min-w-[64px] ${isActive ? "text-rose-600" : "text-slate-400"}`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "fill-rose-100" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
    </div>
  );
}
