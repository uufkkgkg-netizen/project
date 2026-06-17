"use client";

import { useState, useEffect } from "react";
import {
  Shield, Building2, CheckCircle2, XCircle, AlertTriangle, Loader2, Info, UserCheck, UserX
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

type ClinicInfo = {
  id: string;
  name: string;
  subdomain: string;
  contactEmail: string;
  isActive: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string;
  createdAt: string;
  _count: { patients: number; appointments: number; users: number; };
};

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [impersonatedTenantId, setImpersonatedTenantId] = useState<string | null>(null);

  useEffect(() => {
    setImpersonatedTenantId(sessionStorage.getItem('impersonated_tenant_id'));
  }, []);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ClinicInfo[]>("/admin/clinics");
      setClinics(res.data);
    } catch {
      toast.error("فشل جلب بيانات العيادات. تأكد من صلاحياتك.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchClinics(); }, []);

  const handleUpdate = async (id: string, newStatus: string, newPlan: string) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/clinics/${id}/subscription`, {
        status: newStatus,
        plan: newPlan,
        reason: "Updated via Admin Dashboard",
      });
      toast.success("تم التحديث بنجاح");
      fetchClinics();
    } catch {
      toast.error("فشل تحديث حالة العيادة");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleImpersonate = (clinicId: string, clinicName: string) => {
    if (impersonatedTenantId === clinicId) {
      sessionStorage.removeItem('impersonated_tenant_id');
      setImpersonatedTenantId(null);
      toast.success("تم إلغاء تسجيل الدخول بصلاحية العيادة", { description: "أنت الآن تعمل بصلاحيات الإدارة العامة من جديد." });
    } else {
      sessionStorage.setItem('impersonated_tenant_id', clinicId);
      setImpersonatedTenantId(clinicId);
      toast.success(`تم تسجيل الدخول كـ ${clinicName}`, { description: "النظام بأكمله سيعمل الآن كأنك مدير هذه العيادة." });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إدارة العيادات (SaaS Admin)</h1>
            <p className="text-slate-500 mt-1 text-sm">لوحة تحكم النظام لإدارة اشتراكات وحالة العيادات المشتركة.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : clinics.map((clinic) => (
          <Card key={clinic.id} className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                
                {/* Clinic Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                      {clinic.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{clinic.name}</h3>
                      <p className="text-sm text-slate-500">{clinic.contactEmail} • {clinic.subdomain || "no-subdomain"}.femcare.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div><span className="font-semibold text-slate-800">{clinic._count.patients}</span> مرضى</div>
                    <div><span className="font-semibold text-slate-800">{clinic._count.appointments}</span> مواعيد</div>
                    <div><span className="font-semibold text-slate-800">{clinic._count.users}</span> مستخدمين</div>
                  </div>
                  <div>
                    {impersonatedTenantId === clinic.id ? (
                      <Button variant="destructive" onClick={() => toggleImpersonate(clinic.id, clinic.name)} className="h-9 px-4 rounded-xl font-semibold w-full sm:w-auto">
                        <UserX className="ml-2 h-4 w-4" /> إنهاء وضع المحاكاة
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => toggleImpersonate(clinic.id, clinic.name)} className="h-9 px-4 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 font-semibold w-full sm:w-auto">
                        <UserCheck className="ml-2 h-4 w-4" /> دخول بصلاحية العيادة
                      </Button>
                    )}
                  </div>
                </div>

                {/* Subscription Control */}
                <div className="flex-1 border-t md:border-t-0 md:border-r border-slate-100 md:pr-6 pt-4 md:pt-0">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" /> التحكم بالاشتراك
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-600 w-20">الباقة:</span>
                      <Select 
                        defaultValue={clinic.subscriptionPlan} 
                        onValueChange={(val) => handleUpdate(clinic.id, clinic.subscriptionStatus || "", val || "")}
                        disabled={updatingId === clinic.id}
                      >
                        <SelectTrigger className="h-9 rounded-lg bg-white w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="basic">الأساسية (Basic)</SelectItem>
                          <SelectItem value="professional">الاحترافية (Professional)</SelectItem>
                          <SelectItem value="enterprise">المؤسسية (Enterprise)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-600 w-20">الحالة:</span>
                      <Select 
                        defaultValue={clinic.subscriptionStatus} 
                        onValueChange={(val) => handleUpdate(clinic.id, val || "", clinic.subscriptionPlan || "")}
                        disabled={updatingId === clinic.id}
                      >
                        <SelectTrigger className="h-9 rounded-lg bg-white w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="trial">تجريبي (Trial)</SelectItem>
                          <SelectItem value="active">نشط (Active)</SelectItem>
                          <SelectItem value="suspended">معلق (Suspended)</SelectItem>
                          <SelectItem value="canceled">ملغى (Canceled)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

              </div>
              {/* Status Banner */}
              <div className={`px-6 py-3 text-sm flex items-center gap-2 border-t font-medium
                ${clinic.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  clinic.subscriptionStatus === 'trial' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                  'bg-red-50 text-red-700 border-red-100'}`}>
                {clinic.subscriptionStatus === 'active' && <CheckCircle2 className="h-4 w-4" />}
                {clinic.subscriptionStatus === 'trial' && <Info className="h-4 w-4" />}
                {(clinic.subscriptionStatus === 'suspended' || clinic.subscriptionStatus === 'canceled') && <XCircle className="h-4 w-4" />}
                
                الحالة الحالية: {
                  clinic.subscriptionStatus === 'active' ? "اشتراك نشط وفعال" :
                  clinic.subscriptionStatus === 'trial' ? "فترة تجريبية" :
                  "الاشتراك متوقف - الوصول مقيد"
                }
                {updatingId === clinic.id && <Loader2 className="h-3 w-3 animate-spin mr-auto" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
