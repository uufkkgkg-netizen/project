"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User, Activity, Calendar, FileText, Plus, Save, ArrowRight, Loader2,
  Stethoscope, Clock, HeartPulse, Edit, CheckCircle2, Printer, ChevronDown,
  Baby, Pill, AlertTriangle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

type Patient = {
  id: string;
  fileNumber: number;
  fullName: string;
  dateOfBirth: string | null;
  phone: string | null;
  bloodType: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  medicalNotes: string | null;
  createdAt: string;
  // OB/GYN Fields
  gravida?: number | null;
  para?: number | null;
  abortus?: number | null;
  livingChildren?: number | null;
  lastMenstrualPeriod?: string | null;
  estimatedDueDate?: string | null;
  gestationalAge?: string | null;
  contraceptiveMethod?: string | null;
  previousSurgeries?: string | null;
  chronicDiseases?: string | null;
  familyHistory?: string | null;
  visits: Visit[];
};

type Visit = {
  id: string;
  visitDate: string;
  chiefComplaint: string;
  diagnosis: string | null;
  treatment: string | null;
  vitals: any;
  notes: string | null;
  doctor: { firstName: string; lastName: string } | null;
};

const visitSchema = z.object({
  chiefComplaint: z.string().min(1, "الشكوى الرئيسية مطلوبة"),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  vitals: z.object({
    bloodPressure: z.string().optional(),
    weight: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

type VisitFormValues = z.infer<typeof visitSchema>;

// Tab type
type TabId = "history" | "profile" | "obgyn" | "templates";

const tabs: { id: TabId; label: string }[] = [
  { id: "history", label: "السجل والزيارات" },
  { id: "profile", label: "البيانات الشخصية" },
  { id: "obgyn", label: "النسائية والتوليد" },
  { id: "templates", label: "القوالب السريرية" },
];

const REPORT_VARIABLES = [
  { label: "اسم المريضة", key: "patient_name" },
  { label: "العمر", key: "age" },
  { label: "فصيلة الدم", key: "blood_type" },
  { label: "رقم الهاتف", key: "patient_phone" },
  { label: "التاريخ", key: "date" },
  { label: "الحمل (G/P/A)", key: "gravida" },
];

function ReportEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  const insertVar = (key: string) => {
    const ta = taRef.current;
    const varStr = `{{${key}}}`;
    if (!ta) { onChange(value + " " + varStr + " "); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const needBefore = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
    const needAfter = after.length > 0 && !after.startsWith(" ") && !after.startsWith("\n");
    const insert = (needBefore ? " " : "") + varStr + (needAfter ? " " : "");
    onChange(before + insert + after);
    const newPos = start + insert.length;
    setTimeout(() => { ta.focus(); ta.setSelectionRange(newPos, newPos); }, 0);
  };

  const preview = value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, k) => {
    const v = REPORT_VARIABLES.find(v => v.key === k);
    return v ? `[${v.label}]` : `[${k}]`;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {REPORT_VARIABLES.map(v => (
          <button key={v.key} type="button" onClick={() => insertVar(v.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg ring-1 ring-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all font-semibold">
            <Plus className="h-3 w-3" />{v.label}
          </button>
        ))}
      </div>
      {value.trim() && (
        <div dir="rtl" className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-900 leading-7 font-medium" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {preview.split(/(\[.*?\])/g).map((part, i) =>
            part.startsWith("[") && part.endsWith("]") ? (
              <span key={i} className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md bg-indigo-200 text-indigo-800 text-xs font-bold ring-1 ring-indigo-300">{part.slice(1, -1)}</span>
            ) : <span key={i}>{part}</span>
          )}
        </div>
      )}
      <textarea ref={taRef} value={value} onChange={e => onChange(e.target.value)} rows={12} dir="auto"
        className="w-full resize-none bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
        placeholder="محتوى التقرير يظهر هنا بعد اختيار القالب..." />
    </div>
  );
}

export default function PatientEMRPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("history");

  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);

  const visitForm = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      chiefComplaint: "",
      diagnosis: "",
      treatment: "",
      vitals: { bloodPressure: "", weight: "", heartRate: "", temperature: "" },
      notes: "",
    },
  });

  const profileForm = useForm<any>({ defaultValues: {} });

  useEffect(() => {
    fetchPatientData();
    fetchTemplates();
  }, [patientId]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/templates");
      setTemplates(res.data);
    } catch {}
  };

  const fetchPatientData = async () => {
    try {
      const res = await api.get(`/patients/${patientId}`);
      setPatient(res.data);
      profileForm.reset({
        fullName: res.data.fullName,
        dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : "",
        phone: res.data.phone || "",
        bloodType: res.data.bloodType || "",
        allergies: res.data.allergies || "",
        medicalHistory: res.data.medicalHistory || "",
        gravida: res.data.gravida ?? "",
        para: res.data.para ?? "",
        abortus: res.data.abortus ?? "",
        livingChildren: res.data.livingChildren ?? "",
        lastMenstrualPeriod: res.data.lastMenstrualPeriod ? res.data.lastMenstrualPeriod.split('T')[0] : "",
        estimatedDueDate: res.data.estimatedDueDate ? res.data.estimatedDueDate.split('T')[0] : "",
        gestationalAge: res.data.gestationalAge || "",
        contraceptiveMethod: res.data.contraceptiveMethod || "",
        previousSurgeries: res.data.previousSurgeries || "",
        chronicDiseases: res.data.chronicDiseases || "",
        familyHistory: res.data.familyHistory || "",
      });
    } catch {
      toast.error("حدث خطأ أثناء جلب الملف الطبي للمريضة");
      router.push("/dashboard/patients");
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdateProfile = async (data: any) => {
    setIsUpdatingProfile(true);
    try {
      await api.patch(`/patients/${patientId}`, data);
      toast.success("تم تحديث البيانات بنجاح");
      setIsEditingProfile(false);
      fetchPatientData();
    } catch {
      toast.error("فشل تحديث البيانات");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitVisit = async (data: VisitFormValues) => {
    setIsSubmittingVisit(true);
    try {
      await api.post(`/patients/${patientId}/visits`, data);
      toast.success("تم حفظ الزيارة السريرية بنجاح!");
      visitForm.reset();
      fetchPatientData();
    } catch (error: any) {
      toast.error("فشل حفظ الزيارة", { description: error.response?.data?.message || "حدث خطأ" });
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const onGeneratePreview = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) { setPreviewText(""); return; }
    setIsGenerating(true);
    try {
      const res = await api.get(`/ultrasound/generate-preview/${templateId}/${patientId}`);
      setPreviewText(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل توليد التقرير من القالب");
    } finally {
      setIsGenerating(false);
    }
  };

  const onFinalizeReport = async () => {
    if (!previewText.trim()) return toast.error("التقرير فارغ!");
    setIsSavingReport(true);
    try {
      await api.post("/ultrasound", { patientId, templateId: selectedTemplateId || undefined, findings: previewText });
      toast.success("تم اعتماد التقرير بنجاح!");
    } catch {
      toast.error("فشل حفظ التقرير");
    } finally {
      setIsSavingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <HeartPulse className="h-12 w-12 text-rose-500 animate-pulse" />
          <span className="text-slate-500 font-medium">جاري تجهيز الملف الطبي...</span>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : null;

  return (
    <div dir="rtl" className="w-full max-w-7xl mx-auto space-y-6">

      {/* ─── Patient Header ─── */}
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-rose-50/40 via-transparent to-indigo-50/40 pointer-events-none" />
        <div className="relative p-6 flex items-start gap-5">
          {/* Back button */}
          <button
            onClick={() => router.push("/dashboard/patients")}
            className="absolute top-5 left-5 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors z-10"
            aria-label="رجوع"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Avatar */}
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white flex flex-col items-center justify-center shadow-lg shrink-0">
            <User className="h-7 w-7 mb-1" />
            <span className="text-[10px] font-medium opacity-80">ملف</span>
            <span className="font-mono font-bold text-base leading-tight">#{patient.fileNumber}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 truncate">{patient.fullName}</h1>
            <div className="flex flex-wrap gap-2 mt-3">
              {age !== null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                  <Calendar className="w-3.5 h-3.5" /> {age} سنة
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                <Activity className="w-3.5 h-3.5" /> {patient.bloodType || "فصيلة غير محددة"}
              </span>
              {patient.phone && (
                <span dir="ltr" className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                  {patient.phone}
                </span>
              )}
              {patient.gravida != null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-pink-50 text-pink-600 border border-pink-100">
                  <Baby className="w-3.5 h-3.5" /> G{patient.gravida}P{patient.para ?? 0}A{patient.abortus ?? 0}
                </span>
              )}
              {patient.allergies && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> حساسية: {patient.allergies}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Custom Tabs ─── */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1.5 shadow-sm w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: History ─── */}
      {activeTab === "history" && (
        <div className="space-y-6">
          {/* New Visit Form */}
          <Card className="rounded-2xl border-indigo-100 shadow-sm bg-gradient-to-b from-indigo-50/50 to-white">
            <CardHeader className="border-b border-indigo-100/50 pb-4">
              <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
                تسجيل زيارة سريرية جديدة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={visitForm.handleSubmit(onSubmitVisit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الشكوى الرئيسية <span className="text-red-500">*</span></label>
                    <Textarea {...visitForm.register("chiefComplaint")} placeholder="ما الذي تشتكي منه المريضة اليوم؟"
                      className="rounded-xl resize-none h-24 bg-white" />
                    {visitForm.formState.errors.chiefComplaint && (
                      <p className="text-xs text-red-600">{visitForm.formState.errors.chiefComplaint.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">التشخيص والعلاج</label>
                    <Input {...visitForm.register("diagnosis")} placeholder="التشخيص..." className="rounded-xl bg-white" />
                    <Textarea {...visitForm.register("treatment")} placeholder="خطة العلاج..." className="rounded-xl resize-none h-11 bg-white mt-2" />
                  </div>
                </div>

                {/* Vitals */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" /> العلامات الحيوية
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "vitals.bloodPressure" as const, label: "ضغط الدم", placeholder: "120/80" },
                      { name: "vitals.heartRate" as const, label: "النبض", placeholder: "75 bpm" },
                      { name: "vitals.temperature" as const, label: "الحرارة", placeholder: "37 °C" },
                      { name: "vitals.weight" as const, label: "الوزن", placeholder: "65 kg" },
                    ].map(f => (
                      <div key={f.name} className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500">{f.label}</label>
                        <Input {...visitForm.register(f.name)} placeholder={f.placeholder} className="rounded-lg bg-slate-50 border-0 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmittingVisit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-10 shadow-md shadow-indigo-200 font-bold">
                    {isSubmittingVisit ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
                    حفظ الزيارة
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Visits Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              سجل الزيارات السابقة ({patient.visits?.length || 0})
            </h3>

            {!patient.visits?.length ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-600">لا يوجد سجل سريري</h3>
                <p className="text-slate-400 mt-2 text-sm">سيتم عرض الزيارات المسجلة هنا.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {patient.visits.map((visit) => (
                  <div key={visit.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="flex items-center gap-2 font-bold text-indigo-900 text-sm">
                        <Stethoscope className="h-4 w-4 text-indigo-500" />
                        {new Date(visit.visitDate).toLocaleDateString("ar-IQ", {
                          year: "numeric", month: "long", day: "numeric"
                        })}
                      </span>
                      {visit.doctor && (
                        <span className="text-xs font-medium text-slate-500">
                          د. {visit.doctor.firstName} {visit.doctor.lastName}
                        </span>
                      )}
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">الشكوى الرئيسية</h4>
                        <p className="text-slate-800 font-medium">{visit.chiefComplaint}</p>
                      </div>
                      {visit.diagnosis && (
                        <div>
                          <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">التشخيص</h4>
                          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-semibold border border-emerald-100">
                            {visit.diagnosis}
                          </span>
                        </div>
                      )}
                      {visit.treatment && (
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">خطة العلاج</h4>
                          <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm">{visit.treatment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB: Personal Profile ─── */}
      {activeTab === "profile" && (
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-800">البيانات الشخصية والطبية</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-indigo-600 hover:bg-indigo-50 rounded-xl">
              <Edit className="h-4 w-4 ml-2" /> تعديل
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {isEditingProfile ? (
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { name: "fullName", label: "الاسم الكامل", type: "text" },
                    { name: "phone", label: "رقم الهاتف", type: "tel" },
                    { name: "dateOfBirth", label: "تاريخ الميلاد", type: "date" },
                    { name: "bloodType", label: "فصيلة الدم", type: "text", placeholder: "مثال: O+" },
                  ].map(f => (
                    <div key={f.name} className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">{f.label}</label>
                      <Input {...profileForm.register(f.name)} type={f.type} placeholder={f.placeholder} className="rounded-xl" />
                    </div>
                  ))}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-red-600">حساسية الأدوية</label>
                    <Input {...profileForm.register("allergies")} className="rounded-xl border-red-200" placeholder="اذكر أي حساسية للمريضة..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">التاريخ المرضي العام</label>
                    <Textarea {...profileForm.register("medicalHistory")} className="rounded-xl resize-none h-24" placeholder="الأمراض المزمنة، العمليات السابقة..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)} className="rounded-xl">إلغاء</Button>
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                    {isUpdatingProfile ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null} حفظ التعديلات
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">معلومات أساسية</h4>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                    {[
                      { label: "تاريخ الميلاد", value: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("ar-IQ") : "—" },
                      { label: "رقم الهاتف", value: patient.phone || "—", dir: "ltr" },
                      { label: "فصيلة الدم", value: patient.bloodType || "—" },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between items-center px-4 py-3">
                        <span className="text-slate-500 text-sm">{r.label}</span>
                        <span className={`font-semibold text-slate-800 text-sm ${(r as any).dir === 'ltr' ? 'dir-ltr' : ''}`} dir={(r as any).dir}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">التحذيرات والحساسية</h4>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-800 font-semibold text-sm min-h-[60px]">
                    {patient.allergies || "لا توجد حساسية مسجلة."}
                  </div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">التاريخ المرضي العام</h4>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-indigo-900 text-sm min-h-[80px] leading-relaxed">
                    {patient.medicalHistory || "لم يتم إدخال تاريخ مرضي سابق."}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── TAB: OB/GYN ─── */}
      {activeTab === "obgyn" && (
        <Card className="rounded-2xl border-slate-100 shadow-sm">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Baby className="h-5 w-5 text-pink-500" /> بيانات النساء والتوليد
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-indigo-600 hover:bg-indigo-50 rounded-xl">
              <Edit className="h-4 w-4 ml-2" /> تعديل
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isEditingProfile ? (
              <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                {/* Obstetric History */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-4">تاريخ الحمل والولادة (G-P-A-L)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "gravida", label: "Gravida (إجمالي الحمل)", type: "number" },
                      { name: "para", label: "Para (الولادات)", type: "number" },
                      { name: "abortus", label: "Abortus (الإجهاضات)", type: "number" },
                      { name: "livingChildren", label: "الأطفال الأحياء", type: "number" },
                    ].map(f => (
                      <div key={f.name} className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600">{f.label}</label>
                        <Input {...profileForm.register(f.name, { valueAsNumber: true })} type={f.type} min="0" className="rounded-xl text-center text-lg font-bold" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Menstrual & Pregnancy */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">آخر دورة شهرية (LMP)</label>
                    <Input {...profileForm.register("lastMenstrualPeriod")} type="date" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">تاريخ الولادة المتوقع (EDD)</label>
                    <Input {...profileForm.register("estimatedDueDate")} type="date" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">عمر الحمل</label>
                    <Input {...profileForm.register("gestationalAge")} placeholder="مثال: 28 أسبوعاً" className="rounded-xl" />
                  </div>
                </div>
                {/* Gynecological */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">وسيلة منع الحمل</label>
                    <Input {...profileForm.register("contraceptiveMethod")} placeholder="IUD، حبوب، إلخ" className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">الأمراض المزمنة</label>
                    <Input {...profileForm.register("chronicDiseases")} placeholder="السكري، ضغط الدم..." className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">العمليات الجراحية السابقة</label>
                    <Textarea {...profileForm.register("previousSurgeries")} className="rounded-xl resize-none h-20" placeholder="قيصرية 2020، إلخ" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">التاريخ العائلي</label>
                    <Textarea {...profileForm.register("familyHistory")} className="rounded-xl resize-none h-20" placeholder="والدتها مصابة بالسكري..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)} className="rounded-xl">إلغاء</Button>
                  <Button type="submit" disabled={isUpdatingProfile} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl">
                    {isUpdatingProfile ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />} حفظ بيانات التوليد
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* GPAL Summary */}
                <div>
                  <h4 className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-3">ملخص G-P-A-L</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Gravida", value: patient.gravida ?? "—", desc: "إجمالي الحمل" },
                      { label: "Para", value: patient.para ?? "—", desc: "الولادات" },
                      { label: "Abortus", value: patient.abortus ?? "—", desc: "الإجهاضات" },
                      { label: "Living", value: patient.livingChildren ?? "—", desc: "الأحياء" },
                    ].map(item => (
                      <div key={item.label} className="bg-pink-50 rounded-xl p-4 text-center border border-pink-100">
                        <div className="text-2xl font-bold text-pink-700">{item.value}</div>
                        <div className="text-xs font-bold text-pink-500 mt-1">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Other details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
                    {[
                      { label: "آخر دورة شهرية", value: patient.lastMenstrualPeriod ? new Date(patient.lastMenstrualPeriod).toLocaleDateString("ar-IQ") : "—" },
                      { label: "تاريخ الولادة المتوقع", value: patient.estimatedDueDate ? new Date(patient.estimatedDueDate).toLocaleDateString("ar-IQ") : "—" },
                      { label: "عمر الحمل", value: patient.gestationalAge || "—" },
                      { label: "وسيلة منع الحمل", value: patient.contraceptiveMethod || "—" },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between items-center px-4 py-3">
                        <span className="text-slate-500 text-sm">{r.label}</span>
                        <span className="font-semibold text-slate-800 text-sm">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
                      <h5 className="text-xs font-bold text-amber-600 mb-1.5">العمليات الجراحية السابقة</h5>
                      <p className="text-slate-700 text-sm">{patient.previousSurgeries || "لا يوجد"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                      <h5 className="text-xs font-bold text-slate-500 mb-1.5">الأمراض المزمنة</h5>
                      <p className="text-slate-700 text-sm">{patient.chronicDiseases || "لا يوجد"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── TAB: Clinical Templates ─── */}
      {activeTab === "templates" && (
        <Card className="rounded-2xl border-slate-100 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="mb-6 pb-6 border-b border-slate-100">
              <label className="text-sm font-bold text-slate-700 mb-2 block">اختيار قالب سريري</label>
              <div className="flex items-center gap-4">
                <select className="flex-1 h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={selectedTemplateId} onChange={e => onGeneratePreview(e.target.value)}>
                  <option value="">-- اختر القالب لتوليد التقرير تلقائياً --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                  ))}
                </select>
                {isGenerating && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
              </div>
              {templates.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">لا توجد قوالب متاحة. يرجى إنشاء قوالب من صفحة القوالب الطبية.</p>
              )}
            </div>

            {previewText !== "" ? (
              <div className="space-y-6">
                <ReportEditor value={previewText} onChange={setPreviewText} />
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-slate-100">
                  <Button variant="outline" className="rounded-xl h-12 px-8 font-bold gap-2" onClick={() => window.print()}>
                    <Printer className="h-5 w-5" /> طباعة التقرير
                  </Button>
                  <Button className="rounded-xl h-12 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    onClick={onFinalizeReport} disabled={isSavingReport}>
                    {isSavingReport ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    اعتماد التقرير النهائي
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-600 mb-2">لا يوجد تقرير حالي</h3>
                <p className="text-slate-400 text-sm">اختر قالباً من القائمة أعلاه لتوليد التقرير تلقائياً.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
