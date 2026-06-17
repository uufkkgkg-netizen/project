"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, Home, Users, Calendar as CalendarIcon, Settings,
  LogOut, Menu, X, Bell, Search, FileText, Stethoscope, Receipt,
  Plus, Shield, ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

// ── Session Context ───────────────────────────────────────────────────────
type SessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  tenantId: string | null;
  avatarUrl?: string | null;
  tenant?: { name: string; logoUrl?: string | null; defaultCurrency: string } | null;
};

const SessionContext = createContext<SessionUser | null>(null);
export const useSession = () => useContext(SessionContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        // Validate session via HttpOnly cookie — no localStorage needed
        const res = await api.get<SessionUser>("/auth/me");
        if (!cancelled) {
          setSession(res.data);
          setIsLoading(false);
        }
      } catch {
        // Cookie invalid or expired → redirect to login
        if (!cancelled) {
          router.replace("/login");
        }
      }
    };

    verifySession();
    return () => { cancelled = true; };
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // clears HttpOnly cookie on backend
    } catch {}
    sessionStorage.removeItem("impersonated_tenant_id");
    router.replace("/login");
  };

  const userRole = session?.role ?? "";

  const allNavItems = [
    { name: "الرئيسية",             href: "/dashboard",               icon: Home,         roles: ["SUPER_ADMIN", "RECEPTIONIST", "ACCOUNTANT", "DOCTOR", "NURSE", "TENANT_ADMIN"] },
    { name: "المرضى",               href: "/dashboard/patients",      icon: Users,        roles: ["SUPER_ADMIN", "DOCTOR", "NURSE", "TENANT_ADMIN"] },
    { name: "المواعيد",             href: "/dashboard/appointments",  icon: CalendarIcon, roles: ["SUPER_ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE", "TENANT_ADMIN"] },
    { name: "السجلات الطبية",       href: "/dashboard/records",       icon: Stethoscope,  roles: ["SUPER_ADMIN", "DOCTOR", "TENANT_ADMIN"] },
    { name: "الوصفات الطبية",       href: "/dashboard/prescriptions", icon: FileText,     roles: ["SUPER_ADMIN", "DOCTOR", "TENANT_ADMIN"] },
    { name: "الفواتير والمدفوعات",  href: "/dashboard/billing",       icon: Receipt,      roles: ["SUPER_ADMIN", "ACCOUNTANT", "TENANT_ADMIN"] },
    { name: "التقارير والإحصاء",   href: "/dashboard/analytics",     icon: Activity,     roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { name: "الموظفون والصلاحيات", href: "/dashboard/settings/staff", icon: Users,        roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
    { name: "إشعارات الواتساب",     href: "/dashboard/whatsapp-logs", icon: Bell,         roles: ["SUPER_ADMIN"] },
    { name: "لوحة المدير العام",    href: "/dashboard/admin",         icon: Shield,       roles: ["SUPER_ADMIN"] },
    { name: "الإعدادات",            href: "/dashboard/settings",      icon: Settings,     roles: ["SUPER_ADMIN", "TENANT_ADMIN"] },
  ];

  const navItems = allNavItems.filter(
    (item) => session?.isSuperAdmin || (userRole && item.roles.includes(userRole))
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]" dir="rtl">
        <div className="flex flex-col items-center gap-6">
          <div
            className="h-12 w-12 rounded-2xl animate-pulse"
            style={{ background: "linear-gradient(135deg, #E11D48, #9333EA)" }}
          />
          <div className="space-y-2 w-48">
            <div className="h-3 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-3 rounded-full bg-slate-100 animate-pulse w-3/4 mx-auto" />
          </div>
          <p className="text-sm text-slate-400">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const initials = `${session.firstName?.[0] ?? ""}${session.lastName?.[0] ?? ""}`.toUpperCase();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-slate-50 px-4">
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

      {/* User Badge */}
      {session.tenant && (
        <div className="mx-3 mt-3 mb-1 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-700 truncate">{session.tenant.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{session.email}</p>
        </div>
      )}

      {/* Quick CTA */}
      <div className="px-4 py-3">
        <Link
          href="/dashboard/appointments?new=1"
          className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #E11D48, #9333EA)", boxShadow: "0 4px 14px rgba(190,24,93,0.25)" }}
        >
          <Plus className="h-4 w-4" />
          حجز موعد جديد
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                }`}
                style={isActive ? { background: "linear-gradient(135deg, #E11D48, #9333EA)", boxShadow: "0 4px 14px rgba(190,24,93,0.2)" } : {}}
              >
                <item.icon className={`h-4 w-4 ml-3 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span className={isActive ? "font-bold" : ""}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut className="h-4 w-4 ml-3 text-slate-400" />
          تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans" dir="rtl">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100 fixed inset-y-0 right-0 z-50 shadow-[0_0_30px_rgba(15,23,42,0.05)]">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          >
            <aside
              className="w-64 bg-white text-slate-800 h-full flex flex-col absolute right-0 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:mr-64 min-w-0">

          {/* Header */}
          <header className="h-16 bg-white/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 border-b border-slate-100">
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-rose-600 transition-colors border border-slate-100"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <div className="hidden md:flex flex-col justify-center flex-1">
              <h2 className="text-lg font-extrabold text-slate-800">
                مرحباً، {session.firstName} 🌸
              </h2>
              <p className="text-xs text-slate-400">نظام إدارة عيادة النسائية والتوليد</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden lg:flex relative w-52">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  placeholder="البحث عن مريضة..."
                  className="pr-10 bg-slate-50 !border-slate-200 !rounded-full h-9 !shadow-none text-sm"
                />
              </div>

              {/* User Avatar */}
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform text-xs"
                style={{ background: "linear-gradient(135deg, #E11D48, #9333EA)" }}
                title={`${session.firstName} ${session.lastName} — ${session.role}`}
              >
                {initials || "م"}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </SessionContext.Provider>
  );
}
