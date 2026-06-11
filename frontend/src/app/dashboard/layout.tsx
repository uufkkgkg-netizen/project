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
  MessageSquare,
  FileText,
  Stethoscope,
  Activity as HeartbeatIcon,
  Receipt,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const navItems = [
    { name: "الرئيسية",             href: "/dashboard",                          icon: Home },
    { name: "المراجعات (المرضى)",   href: "/dashboard/patients",                 icon: Users },
    { name: "المواعيد",             href: "/dashboard/appointments",             icon: CalendarIcon },
    { name: "السونار والتحاليل",   href: "/dashboard/ultrasound",               icon: Activity },
    { name: "القوالب الطبية",       href: "/dashboard/clinical/templates",       icon: FileText },
    { name: "الوصفات الطبية",      href: "/dashboard/prescriptions",            icon: FileText },
    { name: "الفواتير والمدفوعات", href: "/dashboard/billing",                  icon: Receipt },
    { name: "الموظفون والصلاحيات", href: "/dashboard/settings/staff",          icon: Users },
    { name: "سجل التدقيق",         href: "/dashboard/settings/audit",          icon: FileText },
    { name: "إعدادات العيادة",     href: "/dashboard/settings",                 icon: Settings },
  ];

  if (isAuthenticated === null) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50">جاري التحقق...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex text-slate-800 font-sans" dir="rtl">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100 fixed inset-y-0 right-0 z-50 shadow-[0_0_20px_rgba(0,0,0,0.03)]">
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-slate-50">
          <div className="flex items-center gap-2 text-purple-700">
            <span className="font-bold text-2xl tracking-tight">FemCare</span>
            <HeartbeatIcon className="h-6 w-6 text-pink-500" />
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? "bg-purple-700 text-white shadow-md shadow-purple-200" 
                      : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ml-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
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
            <LogOut className="h-5 w-5 ml-3 text-slate-400 group-hover:text-red-500" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-slate-900/40 backdrop-blur-sm">
          <aside className="w-64 bg-white text-slate-800 h-full flex flex-col absolute right-0 shadow-2xl">
            <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-purple-700">
                <span className="font-bold text-xl">FemCare</span>
                <HeartbeatIcon className="h-5 w-5 text-pink-500" />
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-purple-600 bg-slate-50 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-2xl transition-all ${
                        isActive ? "bg-purple-700 text-white shadow-md" : "text-slate-500 hover:bg-purple-50 hover:text-purple-700"
                      }`}
                    >
                      <item.icon className="h-5 w-5 ml-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl"
              >
                <LogOut className="h-5 w-5 ml-3" />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setIsSidebarOpen(false)}></div>
        </div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col md:mr-64 min-w-0 transition-all">
        
        {/* --- HEADER --- */}
        <header className="h-24 bg-white/60 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          
          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-purple-600"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Center Title (Welcome Message) */}
          <div className="hidden md:flex flex-col items-center justify-center flex-1">
            <h2 className="text-2xl font-bold text-slate-800">مرحباً د. سارة أحمد 🌸</h2>
            <p className="text-sm text-slate-500">مرحباً بك في نظام إدارة عيادة النسائية والتوليد</p>
          </div>

          {/* Left Actions (Search, Notifications, Profile) */}
          <div className="flex items-center gap-3 md:gap-5 justify-end flex-1 md:flex-none">
            
            {/* Search Bar */}
            <div className="hidden lg:flex relative w-64">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="البحث عن مريضة..." 
                className="pr-10 bg-white border-slate-200 rounded-full h-10 focus-visible:ring-purple-500"
              />
            </div>

            {/* Messages */}
            <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors relative shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <button className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors relative shadow-sm">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </button>

            {/* User Avatar */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
              د.س
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
