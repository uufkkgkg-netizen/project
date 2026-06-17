"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2, Save, Building2, Phone, Mail, MapPin, DollarSign,
  Clock, Printer, Bell, Shield, CheckCircle2, Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

// ── Schema ─────────────────────────────────────────────────────────────────
const settingsSchema = z.object({
  // General
  name: z.string().min(2, "اسم العيادة مطلوب"),
  logoUrl: z.string().url("رابط غير صالح").or(z.literal("")).optional(),
  defaultCurrency: z.string().default("IQD"),
  // Contact
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("بريد غير صالح").or(z.literal("")).optional(),
  address: z.string().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

// ── Tabs Config ────────────────────────────────────────────────────────────
const TABS = [
  { id: "general",    label: "الإعدادات العامة",     icon: Building2 },
  { id: "contact",    label: "معلومات التواصل",       icon: Phone },
  { id: "financial",  label: "الإعدادات المالية",     icon: DollarSign },
  { id: "operations", label: "التشغيل والمواعيد",    icon: Clock },
  { id: "print",      label: "الطباعة والهوية",       icon: Printer },
  { id: "notify",     label: "الإشعارات والتذكيرات", icon: Bell },
  { id: "security",   label: "الأمان والصلاحيات",    icon: Shield },
] as const;

type TabId = typeof TABS[number]["id"];

export default function ClinicSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: "", contactEmail: "", contactPhone: "", address: "", defaultCurrency: "IQD", logoUrl: "" },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/settings");
        setLocalSettings(res.data);
        form.reset({
          name: res.data.name || "",
          contactEmail: res.data.contactEmail || "",
          contactPhone: res.data.contactPhone || "",
          address: res.data.address || "",
          defaultCurrency: res.data.defaultCurrency || "IQD",
          logoUrl: res.data.logoUrl || "",
        });
      } catch {
        toast.error("فشل جلب إعدادات العيادة");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [form]);

  const onSubmit = async (data: SettingsValues) => {
    setIsSaving(true);
    try {
      await api.patch("/settings", data);
      toast.success("تم حفظ الإعدادات بنجاح ✓");
    } catch {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10" dir="rtl">

      {/* Header */}
      <div className="bg-gradient-to-l from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 flex items-center gap-4">
        <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-md shadow-purple-200">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إعدادات العيادة</h1>
          <p className="text-slate-500 text-sm mt-1">إدارة جميع إعدادات عيادتك بشكل احترافي ومتكامل</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-1 flex-wrap bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ── TAB: General ── */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" /> الهوية المرئية والأساسيات
                </CardTitle>
                <CardDescription>تظهر هذه البيانات في التقارير والفواتير المطبوعة.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">اسم العيادة <span className="text-red-500">*</span></label>
                    <Input {...form.register("name")} className="h-11 rounded-xl" placeholder="عيادة النور للنسائية والتوليد" />
                    {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رابط الشعار (Logo URL)</label>
                    <Input {...form.register("logoUrl")} dir="ltr" className="h-11 rounded-xl text-left" placeholder="https://..." />
                  </div>
                </div>

                {/* Logo Preview */}
                {localSettings.logoUrl && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <img src={localSettings.logoUrl} alt="شعار العيادة" className="h-16 w-16 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">الشعار الحالي</p>
                      <p className="text-xs text-slate-400 mt-0.5">يظهر في التقارير والوصفات الطبية</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">العملة الافتراضية</label>
                  <select
                    {...form.register("defaultCurrency")}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="IQD">دينار عراقي (IQD)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="KWD">دينار كويتي (KWD)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB: Contact ── */}
        {activeTab === "contact" && (
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" /> معلومات التواصل
              </CardTitle>
              <CardDescription>يمكن للمرضى التواصل عبر هذه المعلومات.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> رقم الهاتف الرئيسي</label>
                  <Input {...form.register("contactPhone")} className="h-11 rounded-xl" placeholder="+964 770 000 0000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> البريد الإلكتروني</label>
                  <Input {...form.register("contactEmail")} dir="ltr" type="email" className="h-11 rounded-xl text-left" placeholder="clinic@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> العنوان التفصيلي</label>
                <Input {...form.register("address")} className="h-11 rounded-xl" placeholder="بغداد، الكرادة، شارع السعدون..." />
              </div>

              {/* Info Fields (non-saved, display only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-amber-700 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> واتساب العيادة (للإشعارات)</label>
                  <Input disabled placeholder="يُضبط من إعدادات الواتساب" className="h-10 rounded-xl bg-amber-50 border-amber-200 text-slate-400 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-amber-700">رابط الموقع (اختياري)</label>
                  <Input disabled placeholder="www.yourclinic.com — قريباً" className="h-10 rounded-xl bg-amber-50 border-amber-200 text-slate-400 text-sm" />
                </div>
                <p className="col-span-2 text-xs text-amber-600 font-medium">⚠️ هذه الحقول ستكون متاحة في الإصدار القادم.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: Financial ── */}
        {activeTab === "financial" && (
          <div className="space-y-4">
            <Card className="rounded-2xl border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-500" /> الإعدادات المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">العملة الافتراضية</label>
                    <select
                      {...form.register("defaultCurrency")}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      <option value="IQD">دينار عراقي (IQD)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                      <option value="EGP">جنيه مصري (EGP)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400">نسبة الضريبة (%)</label>
                    <Input disabled placeholder="0% — قريباً" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-400">بادئة رقم الفاتورة</label>
                    <Input disabled placeholder="INV-2025- — قريباً" className="h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-800 font-medium">
                    الإعدادات المالية المتقدمة (الضريبة، الخصومات التلقائية، أرقام الفواتير المتسلسلة) ستكون متاحة في الإصدار القادم.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── TAB: Operations ── */}
        {activeTab === "operations" && (
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-500" /> إعدادات التشغيل والمواعيد
              </CardTitle>
              <CardDescription>حدد ساعات العمل وإعدادات الجدولة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "وقت بداية الدوام", placeholder: "09:00 ص" },
                  { label: "وقت نهاية الدوام", placeholder: "05:00 م" },
                  { label: "مدة الموعد الافتراضية (دقيقة)", placeholder: "30" },
                ].map((f) => (
                  <div key={f.label} className="space-y-2">
                    <label className="text-sm font-bold text-slate-400">{f.label}</label>
                    <Input disabled placeholder={`${f.placeholder} — قريباً`} className="h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-400" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "الفاصل بين المواعيد (دقيقة)", placeholder: "5" },
                  { label: "الحد الأقصى اليومي للمواعيد", placeholder: "20" },
                ].map((f) => (
                  <div key={f.label} className="space-y-2">
                    <label className="text-sm font-bold text-slate-400">{f.label}</label>
                    <Input disabled placeholder={`${f.placeholder} — قريباً`} className="h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-400" />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-800 font-semibold mb-2">أيام الدوام</p>
                <div className="flex flex-wrap gap-2">
                  {["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day) => (
                    <span key={day} className="px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700 opacity-60">
                      {day}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-indigo-500 mt-2">⚡ سيتم تفعيل إدارة أيام الدوام في الإصدار القادم.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: Print ── */}
        {activeTab === "print" && (
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                <Printer className="h-5 w-5 text-slate-500" /> إعدادات الطباعة والهوية الرسمية
              </CardTitle>
              <CardDescription>تُستخدم في الفواتير والوصفات الطبية وتقارير السونار.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "اسم الطبيب على الوصفات", placeholder: "د. محمد أحمد" },
                  { label: "التخصص الطبي", placeholder: "استشاري نسائية وتوليد" },
                  { label: "رأس صفحة الفاتورة", placeholder: "عيادة النور للنسائية..." },
                  { label: "رقم الترخيص الطبي", placeholder: "IQ-MED-2024-XXXXX" },
                ].map((f) => (
                  <div key={f.label} className="space-y-2">
                    <label className="text-sm font-bold text-slate-400">{f.label}</label>
                    <Input disabled placeholder={`${f.placeholder} — قريباً`} className="h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-400" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400">تذييل الفاتورة / الوصفة</label>
                <Textarea disabled placeholder="شكراً لثقتكم — قريباً" className="rounded-xl resize-none h-20 bg-slate-50 border-slate-200 text-slate-400" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Printer className="h-5 w-5 text-slate-500 shrink-0" />
                <p className="text-sm text-slate-600">إعدادات الطباعة المتقدمة (رأس الصفحة، التوقيع، الختم) ستكون متاحة مع نظام الطباعة المدمج في الإصدار القادم.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: Notifications ── */}
        {activeTab === "notify" && (
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" /> إعدادات الإشعارات والتذكيرات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { title: "تذكير الموعد (قبل 24 ساعة)", desc: "يُرسل واتساب تلقائياً قبل يوم من الموعد" },
                  { title: "تأكيد الحجز الفوري", desc: "رسالة تأكيد فور إضافة الموعد" },
                  { title: "رسالة ما بعد الزيارة", desc: "شكر وتذكير بالموعد القادم" },
                  { title: "إشعار الفاتورة المتأخرة", desc: "تنبيه عند وجود فاتورة غير مدفوعة" },
                ].map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="h-6 w-11 bg-slate-200 rounded-full relative opacity-50 cursor-not-allowed">
                      <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800 font-semibold">⚠️ إعدادات الإشعارات ستُفعَّل مع تكامل الواتساب في الإصدار القادم.</p>
                <Link href="/dashboard/whatsapp-logs" className="text-xs text-amber-600 underline mt-1 block">
                  اذهب لإعدادات الواتساب الحالية ←
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── TAB: Security ── */}
        {activeTab === "security" && (
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
                <Shield className="h-5 w-5 text-rose-500" /> الأمان والصلاحيات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">✓ المصادقة الآمنة (HttpOnly Cookie)</p>
                    <p className="text-xs text-emerald-600 mt-1">التوكن محمي داخل HttpOnly cookie — لا يمكن قراءته بواسطة JavaScript.</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">✓ تحديد معدل الطلبات (Rate Limiting)</p>
                    <p className="text-xs text-emerald-600 mt-1">الحد الأقصى لمحاولات الدخول: 10 محاولات / دقيقة لكل IP.</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">✓ حماية رؤوس HTTP (Helmet)</p>
                    <p className="text-xs text-emerald-600 mt-1">رؤوس الأمان مفعّلة: X-Content-Type, X-Frame-Options, HSTS وغيرها.</p>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">✓ نظام الأدوار (RBAC)</p>
                    <p className="text-xs text-emerald-600 mt-1">كل مستخدم يرى فقط ما يخوّله دوره: طبيب، محاسب، موظف استقبال...</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <Shield className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-600">المصادقة الثنائية (2FA) — قريباً</p>
                    <p className="text-xs text-slate-400 mt-1">سيتم إضافة دعم TOTP (Google Authenticator) في الإصدار القادم.</p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/dashboard/settings/audit" className="text-sm text-indigo-600 font-semibold underline">
                  عرض سجل التدقيق والنشاط ←
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button — only for tabs with editable fields */}
        {(activeTab === "general" || activeTab === "contact" || activeTab === "financial") && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl h-11 px-8" onClick={() => form.reset()}>
              إلغاء التغييرات
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 px-10 shadow-md shadow-purple-200 font-bold"
            >
              {isSaving ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
              {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}


