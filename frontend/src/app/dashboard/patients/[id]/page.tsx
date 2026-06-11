"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, Activity, Calendar, FileText, Plus, Save, ArrowRight, Loader2,
  Stethoscope, Clock, HeartPulse, Edit, CheckCircle2, Printer
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import api from "@/lib/api";

// --- TYPES ---
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

// --- SCHEMAS ---
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

const editPatientSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
});

// --- Smart Report Editor (shows {{var}} as readable arabic chips) ---
const REPORT_VARIABLES = [
  { label: "اسم المريضة",  key: "patient_name" },
  { label: "العمر",         key: "age" },
  { label: "فصيلة الدم",   key: "blood_type" },
  { label: "رقم الهاتف",  key: "patient_phone" },
  { label: "التاريخ",      key: "date" },
];

function ReportEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  const insertVar = (key: string) => {
    const ta = taRef.current;
    const varStr = `{{${key}}}`;
    if (!ta) { onChange(value + " " + varStr + " "); return; }
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const before = value.substring(0, start);
    const after  = value.substring(end);
    const needBefore = before.length > 0 && !before.endsWith(" ") && !before.endsWith("\n");
    const needAfter  = after.length > 0 && !after.startsWith(" ") && !after.startsWith("\n");
    const insert = (needBefore ? " " : "") + varStr + (needAfter ? " " : "");
    const newVal = before + insert + after;
    onChange(newVal);
    const newPos = start + insert.length;
    setTimeout(() => { ta.focus(); ta.setSelectionRange(newPos, newPos); }, 0);
  };

  const preview = value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, k) => {
    const v = REPORT_VARIABLES.find(v => v.key === k);
    return v ? `[${v.label}]` : `[${k}]`;
  });

  return (
    <div className="space-y-4">
      {/* Variable chips */}
      <div className="flex flex-wrap gap-2">
        {REPORT_VARIABLES.map(v => (
          <button
            key={v.key} type="button" onClick={() => insertVar(v.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg ring-1 ring-indigo-200 hover:bg-indigo-100 active:scale-95 transition-all font-semibold"
          >
            <Plus className="h-3 w-3" />{v.label}
          </button>
        ))}
      </div>

      {/* Live preview (non-editable) */}
      {value.trim() && (
        <div
          dir="rtl"
          className="w-full bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-900 leading-7 font-medium"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {preview.split(/(\[.*?\])/g).map((part, i) =>
            part.startsWith("[") && part.endsWith("]") ? (
              <span key={i} className="inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md bg-indigo-200 text-indigo-800 text-xs font-bold ring-1 ring-indigo-300">
                {part.slice(1, -1)}
              </span>
            ) : <span key={i}>{part}</span>
          )}
        </div>
      )}

      {/* Editable raw textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={12}
        dir="auto"
        className="w-full resize-none bg-white border border-slate-200 rounded-2xl p-5 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow print-text"
        placeholder="محتوى التقرير يظهر هنا بعد اختيار القالب، يمكنك تعديله بحرية..."
      />
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

  // Templates & Ultrasound State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Visit Form
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

  // Edit Profile Form
  const profileForm = useForm<z.infer<typeof editPatientSchema>>({
    resolver: zodResolver(editPatientSchema),
  });

  useEffect(() => {
    fetchPatientData();
    fetchTemplates();
  }, [patientId]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/templates");
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to load templates");
    }
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
      });
    } catch (err) {
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
      toast.success("تم تحديث البيانات الشخصية بنجاح");
      setIsEditingProfile(false);
      fetchPatientData();
    } catch (error) {
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
      toast.error("فشل حفظ الزيارة", {
        description: error.response?.data?.message || "حدث خطأ",
      });
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
      const msg = error.response?.data?.message || "فشل توليد التقرير من القالب";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const onFinalizeReport = async () => {
    if (!previewText.trim()) return toast.error("التقرير فارغ!");
    setIsSavingReport(true);
    try {
      await api.post("/ultrasound", {
        patientId,
        templateId: selectedTemplateId || undefined,
        findings: previewText,
      });
      toast.success("تم اعتماد التقرير بنجاح!");
    } catch (error) {
      toast.error("فشل حفظ التقرير");
    } finally {
      setIsSavingReport(false);
    }
  };

  const onPrintReport = () => window.print();

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Profile Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-indigo-50 to-transparent rounded-br-full -z-0 opacity-50"></div>
        
        <button 
          onClick={() => router.push('/dashboard/patients')}
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors z-10"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="h-28 w-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-200 z-10 shrink-0">
          <User className="h-8 w-8 mb-1" />
          <span className="text-xs font-medium opacity-80">رقم الملف</span>
          <span className="font-mono font-bold text-lg">#{patient.fileNumber}</span>
        </div>
        
        <div className="flex-1 text-center md:text-right z-10 w-full pt-2">
          <h1 className="text-3xl font-bold text-slate-800">{patient.fullName}</h1>
          
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-100">
              <Calendar className="w-4 h-4 ml-2 text-slate-400" />
              {patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} سنة` : 'العمر غير مسجل'}
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 border border-rose-100">
              <Activity className="w-4 h-4 ml-2 text-rose-500" />
              فصيلة الدم: {patient.bloodType || 'غير مسجل'}
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-semibold bg-slate-50 text-slate-700 border border-slate-100" dir="ltr">
              {patient.phone || 'لا يوجد هاتف'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Layout (Tabs) */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full sm:w-auto flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-1">
          <TabsTrigger value="history" className="flex-1 sm:w-56 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-semibold h-11 text-base">
            السجل والزيارات
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 sm:w-48 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-semibold h-11 text-base">
            المعلومات الشخصية
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex-1 sm:w-48 rounded-xl data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-semibold h-11 text-base">
            القوالب السريرية
          </TabsTrigger>
        </TabsList>

        {/* --- TAB: Medical History / Encounters --- */}
        <TabsContent value="history" className="space-y-6">
          
          {/* Add New Visit Form */}
          <Card className="rounded-3xl border-indigo-100 shadow-sm overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white">
            <CardHeader className="border-b border-indigo-100/50 pb-4">
              <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                <Stethoscope className="h-6 w-6 text-indigo-600" />
                تسجيل زيارة سريرية جديدة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={visitForm.handleSubmit(onSubmitVisit)} className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الشكوى الرئيسية <span className="text-red-500">*</span></label>
                    <Textarea 
                      {...visitForm.register("chiefComplaint")} 
                      placeholder="ما الذي تشتكي منه المريضة اليوم؟" 
                      className="rounded-xl resize-none h-24 bg-white"
                    />
                    {visitForm.formState.errors.chiefComplaint && <p className="text-sm text-red-500">{visitForm.formState.errors.chiefComplaint.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">التشخيص والعلاج</label>
                    <div className="space-y-3">
                      <Input {...visitForm.register("diagnosis")} placeholder="التشخيص المبدئي / النهائي..." className="rounded-xl bg-white" />
                      <Textarea 
                        {...visitForm.register("treatment")} 
                        placeholder="الأدوية، خطة العلاج، والإجراءات..." 
                        className="rounded-xl resize-none h-11 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-500" /> العلامات الحيوية
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">ضغط الدم</label>
                      <Input {...visitForm.register("vitals.bloodPressure")} placeholder="120/80" className="rounded-lg bg-slate-50 border-0" dir="ltr" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">النبض</label>
                      <Input {...visitForm.register("vitals.heartRate")} placeholder="75 bpm" className="rounded-lg bg-slate-50 border-0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">الحرارة</label>
                      <Input {...visitForm.register("vitals.temperature")} placeholder="37 C" className="rounded-lg bg-slate-50 border-0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500">الوزن</label>
                      <Input {...visitForm.register("vitals.weight")} placeholder="65 kg" className="rounded-lg bg-slate-50 border-0" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-10 shadow-md shadow-indigo-200 text-base font-bold"
                    disabled={isSubmittingVisit}
                  >
                    {isSubmittingVisit ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Save className="ml-2 h-5 w-5" />}
                    حفظ الزيارة
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Visits Timeline */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Clock className="h-6 w-6 text-slate-400" />
              سجل الزيارات السابقة
            </h3>

            {patient.visits?.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-indigo-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">لا يوجد سجل سريري</h3>
                <p className="text-slate-500 mt-2">سيتم إدراج أي زيارة جديدة يتم تسجيلها هنا.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {patient.visits?.map((visit) => (
                  <div key={visit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <Stethoscope className="w-5 h-5" />
                    </div>

                    <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center rounded-t-2xl">
                        <span className="font-bold text-indigo-900 text-sm">
                          {new Date(visit.visitDate).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        {visit.doctor && (
                          <span className="text-xs font-semibold text-slate-500">
                            د. {visit.doctor.firstName} {visit.doctor.lastName}
                          </span>
                        )}
                      </div>
                      <CardContent className="p-5 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">الشكوى الرئيسية</h4>
                          <p className="text-slate-800 font-medium">{visit.chiefComplaint}</p>
                        </div>
                        {visit.diagnosis && (
                          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100/50">
                            <h4 className="text-xs font-bold text-emerald-600 mb-1">التشخيص</h4>
                            <p className="font-semibold">{visit.diagnosis}</p>
                          </div>
                        )}
                        {visit.treatment && (
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-2">خطة العلاج</h4>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{visit.treatment}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- TAB: Profile & Demographics --- */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-slate-800">البيانات الديموغرافية والطبية</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-indigo-600 hover:bg-indigo-50 rounded-xl"
              >
                <Edit className="h-4 w-4 ml-2" />
                تعديل البيانات
              </Button>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              
              {isEditingProfile ? (
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">الاسم الكامل</label>
                      <Input {...profileForm.register("fullName")} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">رقم الهاتف</label>
                      <Input {...profileForm.register("phone")} className="rounded-xl" dir="ltr" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">تاريخ الميلاد</label>
                      <Input type="date" {...profileForm.register("dateOfBirth")} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">فصيلة الدم</label>
                      <Input {...profileForm.register("bloodType")} className="rounded-xl" placeholder="مثال: O+" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-red-600">حساسية الأدوية</label>
                      <Input {...profileForm.register("allergies")} className="rounded-xl border-red-200 focus-visible:ring-red-500" placeholder="اذكر أي حساسية للمريضة..." />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-indigo-800">التاريخ المرضي</label>
                      <Textarea 
                        {...profileForm.register("medicalHistory")} 
                        className="rounded-xl resize-none h-24 border-indigo-200" 
                        placeholder="الأمراض المزمنة، العمليات السابقة..." 
                      />
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
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">معلومات أساسية</h4>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">تاريخ الميلاد</span>
                          <span className="font-semibold text-slate-800">{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('ar-IQ') : '—'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">رقم الهاتف</span>
                          <span className="font-semibold text-slate-800" dir="ltr">{patient.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">فصيلة الدم</span>
                          <span className="font-bold text-rose-600">{patient.bloodType || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">التحذيرات والحساسية</h4>
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-800 font-semibold">
                        {patient.allergies || 'لا توجد حساسية مسجلة.'}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">التاريخ المرضي العام</h4>
                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 text-indigo-900 leading-relaxed min-h-[100px]">
                        {patient.medicalHistory || 'لم يتم إدخال تاريخ مرضي سابق.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB: Clinical Templates & Ultrasound Reports --- */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden bg-white print-area">
            <CardContent className="p-6 md:p-8">

              {/* Template selector */}
              <div className="print-hidden mb-6 pb-6 border-b border-slate-100">
                <label className="text-sm font-bold text-slate-700 mb-2 block">اختيار قالب سريري</label>
                <div className="flex items-center gap-4">
                  <select
                    className="flex-1 h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={selectedTemplateId}
                    onChange={e => onGeneratePreview(e.target.value)}
                  >
                    <option value="">-- اختر القالب لتوليد التقرير تلقائياً --</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
                    ))}
                  </select>
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">جاري التوليد...</span>
                    </div>
                  )}
                </div>
                {templates.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg">
                    لا توجد قوالب متاحة. يرجى إنشاء قوالب أولاً من صفحة القوالب الطبية.
                  </p>
                )}
              </div>

              {/* Printable clinic header (hidden on screen) */}
              <div className="print-only hidden mb-8 text-center border-b-2 border-slate-800 pb-6">
                <h2 className="text-2xl font-bold">عيادة فيم كير - FemCare Clinic</h2>
                <p className="text-slate-600 mt-1">تقرير طبي سريري</p>
                <div className="grid grid-cols-3 gap-4 mt-6 text-sm text-right">
                  <div><strong>المريضة:</strong> {patient.fullName}</div>
                  <div><strong>رقم الملف:</strong> #{patient.fileNumber}</div>
                  <div><strong>التاريخ:</strong> {new Date().toLocaleDateString('ar-IQ')}</div>
                  <div><strong>فصيلة الدم:</strong> {patient.bloodType || '—'}</div>
                  <div><strong>العمر:</strong> {patient.dateOfBirth ? `${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} سنة` : '—'}</div>
                  <div><strong>الهاتف:</strong> {patient.phone || '—'}</div>
                </div>
              </div>

              {/* Report editor or empty state */}
              {previewText !== "" ? (
                <div className="space-y-6">
                  {/* Smart editor with variable chips */}
                  <ReportEditor value={previewText} onChange={setPreviewText} />

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 print-hidden pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      className="rounded-xl h-12 px-8 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 gap-2"
                      onClick={onPrintReport}
                    >
                      <Printer className="h-5 w-5" /> طباعة التقرير
                    </Button>
                    <Button
                      className="rounded-xl h-12 px-8 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 gap-2"
                      onClick={onFinalizeReport}
                      disabled={isSavingReport}
                    >
                      {isSavingReport ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                      اعتماد التقرير النهائي
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 print-hidden">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-10 w-10 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-2">لا يوجد تقرير حالي</h3>
                  <p className="text-slate-500 text-sm">اختر قالباً من القائمة أعلاه لتوليد التقرير وتعبئته تلقائياً ببيانات المريضة.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
