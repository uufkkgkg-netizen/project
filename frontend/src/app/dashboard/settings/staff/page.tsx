"use client";

import { useState, useEffect } from "react";
import {
  Users, Plus, Loader2, ShieldCheck, Shield, Stethoscope,
  Phone, Calculator, ToggleLeft, ToggleRight, Search, CheckCircle2, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";
import { NewStaffModal } from "@/components/staff/NewStaffModal";

// ── Types ──────────────────────────────────────────────────────
type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  role: string;
  tenant: { id: string; name: string } | null;
};

// ── Role UI config ─────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  SUPER_ADMIN:  { label: "مدير عام",      icon: <ShieldCheck className="h-3.5 w-3.5" />, classes: "bg-slate-900 text-white" },
  DOCTOR:       { label: "طبيب/ة",       icon: <Stethoscope className="h-3.5 w-3.5" />, classes: "bg-violet-100 text-violet-700" },
  RECEPTIONIST: { label: "استقبال",     icon: <Phone className="h-3.5 w-3.5" />,        classes: "bg-sky-100 text-sky-700" },
  ACCOUNTANT:   { label: "محاسب",        icon: <Calculator className="h-3.5 w-3.5" />,   classes: "bg-amber-100 text-amber-700" },
  NURSE:        { label: "ممرض/ة",       icon: <Stethoscope className="h-3.5 w-3.5" />,  classes: "bg-teal-100 text-teal-700" },
};

// ── Page ───────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff]           = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [togglingId, setTogglingId]   = useState<string | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<StaffMember[]>("/staff");
      setStaff(res.data);
    } catch {
      toast.error("فشل جلب بيانات الموظفين");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const toggleStatus = async (member: StaffMember) => {
    setTogglingId(member.id);
    try {
      await api.patch(`/staff/${member.id}/status`);
      toast.success(`تم ${member.isActive ? "تعليق" : "تفعيل"} حساب ${member.firstName}`);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "فشل تحديث الحالة");
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = staff.filter(m =>
    `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Summary counts
  const activeCount   = staff.filter(m => m.isActive).length;
  const suspendedCount = staff.filter(m => !m.isActive).length;
  const doctorCount   = staff.filter(m => m.role === "DOCTOR").length;

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-100 text-violet-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين والصلاحيات</h1>
            <p className="text-slate-500 mt-1 text-sm">إضافة الموظفين وتحديد أدوارهم وإدارة وصولهم للنظام.</p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md shadow-violet-200 h-11 px-6"
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة موظف
        </Button>
      </div>

      <NewStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setIsModalOpen(false); fetchStaff(); }}
      />

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "الموظفون النشطون",  value: activeCount,    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, bg: "bg-emerald-50", text: "text-emerald-700" },
          { label: "حسابات معلقة",      value: suspendedCount, icon: <XCircle className="h-5 w-5 text-red-500" />,         bg: "bg-red-50",     text: "text-red-700" },
          { label: "الأطباء والطبيبات", value: doctorCount,    icon: <Stethoscope className="h-5 w-5 text-violet-600" />,  bg: "bg-violet-50",  text: "text-violet-700" },
        ].map(s => (
          <Card key={s.label} className="rounded-2xl border-slate-100 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Table Card ── */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Search bar */}
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="relative w-full sm:w-80">
              <Search className="absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="البحث بالاسم أو البريد الإلكتروني…"
                className="pr-10 bg-slate-50 border-none rounded-xl h-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">الموظف</th>
                  <th className="px-6 py-4">الدور</th>
                  <th className="px-6 py-4">العيادة</th>
                  <th className="px-6 py-4">آخر دخول</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-violet-400 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-16 w-16 bg-violet-50 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 text-violet-300" />
                        </div>
                        <p className="font-semibold text-slate-700">لا يوجد موظفون</p>
                        <p className="text-slate-500 text-sm">اضغط "إضافة موظف" لإنشاء أول حساب.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(member => {
                  const roleConf = ROLE_CONFIG[member.role] ?? { label: member.role, icon: <Shield className="h-3.5 w-3.5" />, classes: "bg-slate-100 text-slate-700" };
                  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Staff info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 font-black flex items-center justify-center shrink-0 text-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleConf.classes}`}>
                          {roleConf.icon} {roleConf.label}
                        </span>
                      </td>
                      {/* Tenant */}
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {member.tenant?.name ?? <span className="text-slate-400 italic">نظام</span>}
                      </td>
                      {/* Last login */}
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {member.lastLogin
                          ? new Date(member.lastLogin).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })
                          : "لم يسجل دخول"}
                      </td>
                      {/* Status badge */}
                      <td className="px-6 py-4">
                        {member.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-600/20">
                            <CheckCircle2 className="h-3.5 w-3.5" /> نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset bg-red-50 text-red-700 ring-red-600/20">
                            <XCircle className="h-3.5 w-3.5" /> معلق
                          </span>
                        )}
                      </td>
                      {/* Toggle action */}
                      <td className="px-6 py-4 text-left">
                        {member.role !== "SUPER_ADMIN" ? (
                          <Button
                            variant="ghost" size="sm"
                            className={`rounded-lg h-8 px-3 text-xs font-semibold gap-1.5 ${member.isActive ? "text-red-500 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                            onClick={() => toggleStatus(member)}
                            disabled={togglingId === member.id}
                          >
                            {togglingId === member.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : member.isActive
                                ? <><ToggleLeft className="h-4 w-4" /> تعليق</>
                                : <><ToggleRight className="h-4 w-4" /> تفعيل</>
                            }
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-xs">محمي</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
