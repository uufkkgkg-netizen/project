"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, FileText, UserPlus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Patient = {
  id: string;
  fileNumber: number;
  fullName: string;
  phone: string | null;
  bloodType: string | null;
  createdAt: string;
};

const patientSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  bloodType: z.string().optional(),
  medicalNotes: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      phone: "",
      bloodType: "",
      medicalNotes: "",
      allergies: "",
      medicalHistory: "",
    },
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredPatients(
      patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.phone?.includes(q) ||
          p.fileNumber.toString().includes(q)
      )
    );
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      const response = await api.get("/patients");
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      toast.error("فشل جلب قائمة المرضى");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth || undefined,
        phone: data.phone || undefined,
        bloodType: data.bloodType || undefined,
        medicalNotes: data.medicalNotes || undefined,
        allergies: data.allergies || undefined,
        medicalHistory: data.medicalHistory || undefined,
      };

      await api.post("/patients", payload);
      toast.success("تمت إضافة المريضة بنجاح!");
      setIsDialogOpen(false);
      form.reset();
      fetchPatients();
    } catch (error: any) {
      toast.error("فشل إضافة المريضة", {
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl" style={{background:"linear-gradient(135deg,#FFF1F2,#FFE4E6)",color:"#E11D48"}}>
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">إدارة المرضى</h1>
            <p className="text-slate-500 text-sm mt-1">عرض وإدارة سجلات المراجعات في عيادتك.</p>
          </div>
        </div>
        
        <Button
          className="h-11 px-6"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="ml-2 h-4 w-4" /> إضافة مريضة جديدة
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">إضافة مريضة جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات المريضة الأساسية. يمكنك إضافة المزيد من التفاصيل لاحقاً في الملف الطبي.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="سارة علي محمد" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="077xxxxxx" dir="ltr" className="text-left rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ الميلاد</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>فصيلة الدم</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger dir="rtl" className="rounded-xl">
                              <SelectValue placeholder="اختر الفصيلة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent dir="rtl">
                            {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حساسية الأدوية</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: البنسلين..." className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button type="submit" className="w-full sm:w-auto rounded-xl px-8" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? "جاري الحفظ..." : "حفظ بيانات المريضة"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
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
            <div className="hidden sm:block text-sm text-slate-500 font-medium">
              العدد الكلي: {filteredPatients.length} مريضة
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
                        <div className="p-4 bg-slate-100 rounded-full">
                          <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <span>لا توجد مريضات مطابقة للبحث.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-rose-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold px-2.5 py-1 rounded-md" style={{background:"#FFF1F2",color:"#E11D48"}}>
                          #{patient.fileNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{patient.fullName}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono" dir="ltr">{patient.phone || '—'}</td>
                      <td className="px-6 py-4">
                        {patient.bloodType ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold ring-1 ring-inset ring-rose-200" dir="ltr">
                            {patient.bloodType}
                          </span>
                        ) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(patient.createdAt).toLocaleDateString('ar-IQ')}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl border-rose-200 text-rose-600 bg-white hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
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
