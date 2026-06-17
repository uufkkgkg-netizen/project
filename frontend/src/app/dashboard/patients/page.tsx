"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, FileText, UserPlus, AlertTriangle, HeartPulse } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type Patient = {
  id: string;
  fileNumber: number;
  fullName: string;
  phone: string | null;
  bloodType: string | null;
  maritalStatus: string | null;
  createdAt: string;
};

// ── Full OB/GYN patient schema ──────────────────────────────────────────────
const patientSchema = z.object({
  // Personal
  fullName:              z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  dateOfBirth:           z.string().optional(),
  phone:                 z.string().optional(),
  nationalId:            z.string().optional(),
  maritalStatus:         z.string().optional(),
  husbandName:           z.string().optional(),
  address:               z.string().optional(),
  bloodType:             z.string().optional(),
  // Emergency
  emergencyContactName:  z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  // Medical
  allergies:             z.string().optional(),
  medicalHistory:        z.string().optional(),
  chronicDiseases:       z.string().optional(),
  previousSurgeries:     z.string().optional(),
  familyHistory:         z.string().optional(),
  medicalNotes:          z.string().optional(),
  // OB/GYN
  gravida:               z.coerce.number().int().nonnegative().optional(),
  para:                  z.coerce.number().int().nonnegative().optional(),
  abortus:               z.coerce.number().int().nonnegative().optional(),
  livingChildren:        z.coerce.number().int().nonnegative().optional(),
  lastMenstrualPeriod:   z.string().optional(),
  estimatedDueDate:      z.string().optional(),
  contraceptiveMethod:   z.string().optional(),
  gestationalAge:        z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

// ── Tabs inside the modal ───────────────────────────────────────────────────
const MODAL_TABS = [
  { id: "personal",    label: "البيانات الشخصية" },
  { id: "medical",     label: "التاريخ المرضي" },
  { id: "obgyn",       label: "النسائية والتوليد" },
] as const;

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "obgyn">("personal");

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "", dateOfBirth: "", phone: "", nationalId: "", maritalStatus: "",
      husbandName: "", address: "", bloodType: "", emergencyContactName: "",
      emergencyContactPhone: "", allergies: "", medicalHistory: "", chronicDiseases: "",
      previousSurgeries: "", familyHistory: "", medicalNotes: "",
      gravida: undefined, para: undefined, abortus: undefined, livingChildren: undefined,
      lastMenstrualPeriod: "", estimatedDueDate: "", contraceptiveMethod: "", gestationalAge: "",
    },
  });

  useEffect(() => { fetchPatients(); }, []);
  useEffect(() => {
    if (!searchQuery.trim()) { setFilteredPatients(patients); return; }
    const q = searchQuery.toLowerCase();
    setFilteredPatients(patients.filter(
      (p) => p.fullName.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber.toString().includes(q)
    ));
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
      setFilteredPatients(res.data);
    } catch { toast.error("فشل جلب قائمة المرضى"); }
    finally { setIsLoading(false); }
  };

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined && v !== null)
      );
      await api.post("/patients", payload);
      toast.success("تمت إضافة المريضة بنجاح! 🌸");
      setIsDialogOpen(false);
      form.reset();
      setActiveTab("personal");
      fetchPatients();
    } catch (err: any) {
      toast.error("فشل إضافة المريضة", {
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally { setIsSubmitting(false); }
  };

  const openDialog = () => { setActiveTab("personal"); setIsDialogOpen(true); };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{ background: "linear-gradient(135deg,#FFF1F2,#FFE4E6)", color: "#E11D48" }}>
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إدارة المرضى</h1>
            <p className="text-slate-500 text-sm mt-1">
              إجمالي المرضى: <span className="font-bold text-slate-700">{patients.length}</span> مريضة
            </p>
          </div>
        </div>
        <Button className="h-11 px-6 rounded-xl shadow-md" style={{ background: "linear-gradient(135deg,#E11D48,#9333EA)" }} onClick={openDialog}>
          <Plus className="ml-2 h-4 w-4" /> إضافة مريضة جديدة
        </Button>
      </div>

      {/* ── Add Patient Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => { if (!isSubmitting) setIsDialogOpen(o); }}>
        <DialogContent className="sm:max-w-[680px] rounded-2xl p-0 overflow-hidden" dir="rtl">
          {/* Dialog Header */}
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-500" /> إضافة مريضة جديدة
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات المريضة بشكل منظم. يمكنك الانتقال بين الأقسام.
              </DialogDescription>
            </DialogHeader>

            {/* Modal Tabs */}
            <div className="flex gap-1 mt-4 bg-slate-100 rounded-xl p-1">
              {MODAL_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === t.id
                      ? "bg-white text-rose-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto space-y-4">

                {/* ── TAB: Personal ── */}
                {activeTab === "personal" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="سارة علي محمد" className="rounded-xl h-10" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl><Input placeholder="077xxxxxxxx" dir="ltr" className="text-left rounded-xl h-10" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الميلاد</FormLabel>
                          <FormControl><Input type="date" className="rounded-xl h-10" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="nationalId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>الرقم الوطني / الهوية</FormLabel>
                          <FormControl><Input placeholder="xxxxxxxxxxxxxxxxxx" dir="ltr" className="text-left rounded-xl h-10" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحالة الاجتماعية</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger dir="rtl" className="rounded-xl h-10"><SelectValue placeholder="اختر الحالة" /></SelectTrigger></FormControl>
                            <SelectContent dir="rtl">
                              <SelectItem value="single">عزباء</SelectItem>
                              <SelectItem value="married">متزوجة</SelectItem>
                              <SelectItem value="divorced">مطلقة</SelectItem>
                              <SelectItem value="widowed">أرملة</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="bloodType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>فصيلة الدم</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger dir="rtl" className="rounded-xl h-10"><SelectValue placeholder="اختر الفصيلة" /></SelectTrigger></FormControl>
                            <SelectContent dir="rtl">
                              {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="husbandName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الزوج (للمتزوجات)</FormLabel>
                        <FormControl><Input placeholder="اسم الزوج" className="rounded-xl h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان السكني</FormLabel>
                        <FormControl><Input placeholder="المحافظة، الحي، الشارع..." className="rounded-xl h-10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {/* Emergency */}
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
                      <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> جهة الاتصال في حالات الطوارئ
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">اسم جهة الطوارئ</FormLabel>
                            <FormControl><Input placeholder="أحمد علي" className="rounded-xl h-9 text-sm" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">هاتف جهة الطوارئ</FormLabel>
                            <FormControl><Input placeholder="077xxxxxxxx" dir="ltr" className="text-left rounded-xl h-9 text-sm" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: Medical ── */}
                {activeTab === "medical" && (
                  <div className="space-y-4">
                    <FormField control={form.control} name="allergies" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-red-600 font-bold">
                          <AlertTriangle className="h-4 w-4" /> حساسية الأدوية والمواد
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: البنسلين، السلفا..." className="rounded-xl h-10 border-red-200 focus:ring-red-300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="chronicDiseases" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأمراض المزمنة</FormLabel>
                        <FormControl>
                          <Textarea placeholder="مثال: داء السكري، ارتفاع ضغط الدم..." className="rounded-xl resize-none h-20" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="medicalHistory" render={({ field }) => (
                      <FormItem>
                        <FormLabel>التاريخ المرضي السابق</FormLabel>
                        <FormControl>
                          <Textarea placeholder="أمراض سابقة، علاجات طويلة الأمد..." className="rounded-xl resize-none h-20" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="previousSurgeries" render={({ field }) => (
                      <FormItem>
                        <FormLabel>العمليات الجراحية السابقة</FormLabel>
                        <FormControl>
                          <Textarea placeholder="مثال: قيصرية 2020، استئصال زائدة 2018..." className="rounded-xl resize-none h-20" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="familyHistory" render={({ field }) => (
                      <FormItem>
                        <FormLabel>التاريخ العائلي المرضي</FormLabel>
                        <FormControl>
                          <Textarea placeholder="أمراض وراثية، تاريخ الأسرة..." className="rounded-xl resize-none h-16" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="medicalNotes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات طبية إضافية</FormLabel>
                        <FormControl>
                          <Textarea placeholder="أي معلومات إضافية يجب أن يعلمها الطبيب..." className="rounded-xl resize-none h-16" {...field} />
                        </FormControl>
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ── TAB: OB/GYN ── */}
                {activeTab === "obgyn" && (
                  <div className="space-y-4">
                    {/* GPAL */}
                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                      <p className="text-sm font-bold text-rose-700 mb-3">التاريخ التوليدي (G-P-A-L)</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { name: "gravida" as const,        label: "G — الحمل الكلي",     placeholder: "0" },
                          { name: "para" as const,           label: "P — الولادات",         placeholder: "0" },
                          { name: "abortus" as const,        label: "A — الإجهاضات",        placeholder: "0" },
                          { name: "livingChildren" as const, label: "L — الأطفال الأحياء", placeholder: "0" },
                        ].map(({ name, label, placeholder }) => (
                          <FormField key={name} control={form.control} name={name} render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-rose-700">{label}</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" placeholder={placeholder} className="rounded-xl h-10 text-center font-bold" {...field} />
                              </FormControl>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="lastMenstrualPeriod" render={({ field }) => (
                        <FormItem>
                          <FormLabel>آخر دورة شهرية (LMP)</FormLabel>
                          <FormControl><Input type="date" className="rounded-xl h-10" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="estimatedDueDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاريخ الولادة المتوقع (EDD)</FormLabel>
                          <FormControl><Input type="date" className="rounded-xl h-10" {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="gestationalAge" render={({ field }) => (
                        <FormItem>
                          <FormLabel>عمر الحمل الحالي</FormLabel>
                          <FormControl><Input placeholder="مثال: 28 أسبوع + 3 أيام" className="rounded-xl h-10" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="contraceptiveMethod" render={({ field }) => (
                        <FormItem>
                          <FormLabel>وسيلة منع الحمل</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger dir="rtl" className="rounded-xl h-10"><SelectValue placeholder="اختر الوسيلة" /></SelectTrigger></FormControl>
                            <SelectContent dir="rtl">
                              <SelectItem value="none">لا يوجد</SelectItem>
                              <SelectItem value="pills">حبوب منع الحمل</SelectItem>
                              <SelectItem value="iud">لولب (IUD)</SelectItem>
                              <SelectItem value="injection">حقن هرمونية</SelectItem>
                              <SelectItem value="implant">كبسولة تحت الجلد</SelectItem>
                              <SelectItem value="condom">الواقي الذكري</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex gap-2">
                  {MODAL_TABS.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={`h-2 rounded-full transition-all ${activeTab === t.id ? "w-6 bg-rose-500" : "w-2 bg-slate-300"}`}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="rounded-xl h-10" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl h-10 px-6 font-bold"
                    style={{ background: "linear-gradient(135deg,#E11D48,#9333EA)" }}
                  >
                    {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "جاري الحفظ..." : "حفظ المريضة 🌸"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Patients Table */}
      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                placeholder="البحث برقم الملف، الاسم، أو الهاتف..."
                className="pr-10 rounded-xl bg-white border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="hidden sm:block text-sm text-slate-500 font-medium whitespace-nowrap">
              النتائج: <span className="font-bold text-slate-700">{filteredPatients.length}</span> مريضة
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">رقم الملف</th>
                  <th className="px-6 py-4">اسم المريضة</th>
                  <th className="px-6 py-4">رقم الهاتف</th>
                  <th className="px-6 py-4">فصيلة الدم</th>
                  <th className="px-6 py-4">تاريخ التسجيل</th>
                  <th className="px-6 py-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10">
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col justify-center items-center gap-4">
                        <div className="p-4 bg-rose-50 rounded-full">
                          <FileText className="h-8 w-8 text-rose-300" />
                        </div>
                        <span className="font-medium">لا توجد مريضات {searchQuery ? "مطابقة للبحث" : "مسجلة بعد"}</span>
                        {!searchQuery && (
                          <Button size="sm" className="rounded-xl" style={{ background: "linear-gradient(135deg,#E11D48,#9333EA)" }} onClick={openDialog}>
                            <Plus className="ml-1 h-4 w-4" /> إضافة أول مريضة
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-rose-50/40 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/patients/${patient.id}`)}>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold px-2.5 py-1 rounded-md text-xs" style={{ background: "#FFF1F2", color: "#E11D48" }}>
                          #{patient.fileNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{patient.fullName}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono" dir="ltr">{patient.phone || "—"}</td>
                      <td className="px-6 py-4">
                        {patient.bloodType ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold ring-1 ring-inset ring-rose-200" dir="ltr">
                            {patient.bloodType}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(patient.createdAt).toLocaleDateString("ar-IQ")}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-rose-200 text-rose-600 bg-white hover:bg-rose-600 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/patients/${patient.id}`); }}
                        >
                          الملف الطبي
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
