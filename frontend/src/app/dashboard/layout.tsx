"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Home,
  Users,
  Calendar as CalendarIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  FileText,
  Stethoscope,
  Receipt,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import { jwtDecode } from "jwt-decode";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      // Try reading role from stored user_info first (faster, no decode needed)
      const userInfoStr = localStorage.getItem("user_info");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        setUserRole(userInfo.role || "SUPER_ADMIN");
        setIsAuthenticated(true);
        return;
      }
      // Fallback: decode JWT directly
      const decoded: any = jwtDecode(token);
      setUserRole(decoded.role || "SUPER_ADMIN");
      setIsAuthenticated(true);
    } catch (e) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_info");
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      // Clear backend HttpOnly cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://femcare-backend-api.onrender.com/api'}/auth/logout`, {
        method: 'POST', credentials: 'include'
      });
    } catch {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("impersonated_tenant_id");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  const allNavItems = [
    { name: "الرئيسية",            href: "/dashboard",              icon: Home,           roles: ["SUPER_ADMIN", "RECEPTIONIST", "ACCOUNTANT", "DOCTOR", "NURSE", "TENANT_ADMIN"] },
    { name: "المرضى",              href: "/dashboard/patients",     icon: Users,          roles: ["SUPER_ADMIN", "DOCTOR", "NURSE", "TENANT_ADMIN"] },
    { name: "المواعيد",            href: "/dashboard/appointments", icon: CalendarIcon,   roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "TENANT_ADMIN"] },
    { name: "السجلات الطبية",      href: "/dashboard/records",      icon: Stethoscope,    roles: ["SUPER_ADMIN", "DOCTOR", "TENANT_ADMIN"] },
    { name: "الفواتير والمدفوعات", href: "/dashboard/billing",      icon: Receipt,        roles: ["SUPER_ADMIN", "ACCOUNTANT", "TENANT_ADMIN"] },
    { name: "التقارير والإحصاء",  href: "/dashboard/analytics",    icon: Activity,       roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { name: "الموظفون والصلاحيات",href: "/dashboard/settings/staff",icon: Users,          roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { name: "إشعارات الواتساب",    href: "/dashboard/whatsapp-logs",icon: Bell,           roles: ["SUPER_ADMIN"] },
    { name: "الإعدادات",          href: "/dashboard/settings",     icon: Settings,       roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
  ];

  const navItems = allNavItems.filter(item => userRole && item.roles.includes(userRole));

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]" dir="rtl">
        <div className="flex flex-col items-center gap-6">
          {/* Logo skeleton */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-32 rounded-xl bg-slate-100 animate-pulse" />
          </div>
          {/* Skeleton cards */}
          <div className="space-y-3 w-64">
            <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
            <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <p className="text-sm text-slate-400">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-slate-50">
        <div className="flex items-center gap-2">
          <span
            className="font-extrabold text-2xl tracking-tight"
            style={{ background: "linear-gradient(135deg, #E11D48, #9333EA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            FemCare
          </span>
          <span className="text-xl">🌸</span>
        </div>
      </div>

      {/* Quick CTA */}
      <div className="px-4 py-4">
        <Link
          href="/dashboard/appointments?new=1"
          className="btn-primary flex items-center justify-center gap-2 w-full py-2.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>+ حجز موعد جديد</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #E11D48, #9333EA)", boxShadow: "0 4px 14px rgba(190, 24, 93, 0.25)" } : {}}
              >
                <item.icon className={`h-5 w-5 ml-3 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className={`text-sm font-medium ${isActive ? "font-bold" : ""}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
        >
          <LogOut className="h-5 w-5 ml-3 text-slate-400" />
          <span className="text-sm font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans" dir="rtl">

      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100 fixed inset-y-0 right-0 z-50 shadow-[0_0_30px_rgba(15,23,42,0.05)]">
        <SidebarContent />
      </aside>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}>
          <aside
            className="w-64 bg-white text-slate-800 h-full flex flex-col absolute right-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="absolute top-4 left-4">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col md:mr-64 min-w-0 transition-all">

        {/* --- HEADER --- */}
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 border-b border-slate-100">

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-rose-600 transition-colors border border-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Center Title */}
          <div className="hidden md:flex flex-col justify-center flex-1">
            <h2 className="text-xl font-extrabold text-slate-800">مرحباً 🌸</h2>
            <p className="text-xs text-slate-400">نظام إدارة عيادة النسائية والتوليد</p>
          </div>

          {/* Left Actions */}
          <div className="flex items-center gap-3 justify-end">

            {/* Search Bar */}
            <div className="hidden lg:flex relative w-56">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="البحث عن مريضة..."
                className="pr-10 bg-slate-50 !border-slate-200 !rounded-full h-10 !shadow-none"
              />
            </div>

            {/* Notifications */}
            <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors relative shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform text-sm"
              style={{ background: "linear-gradient(135deg, #E11D48, #9333EA)" }}
            >
              م
            </div>
          </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
