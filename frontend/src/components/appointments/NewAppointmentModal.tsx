"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Calendar, Clock, FileText, User, Stethoscope } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

const schema = z.object({
  patientId: z.string().min(1, "الرجاء اختيار المريض"),
  doctorId: z.string().min(1, "الرجاء اختيار الطبيب"),
  appointmentDate: z.string().min(1, "تاريخ ووقت الموعد مطلوب"),
  durationMinutes: z.coerce.number().min(5, "المدة يجب أن تكون 5 دقائق على الأقل"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type Props = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

export function NewAppointmentModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: "", doctorId: "", appointmentDate: "", durationMinutes: 30, notes: "" },
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch Patients
      api.get("/patients").then(res => setPatients(res.data)).catch(() => toast.error("فشل جلب المرضى"));
      // Fetch Doctors
      api.get("/staff").then(res => {
        const docs = res.data.filter((s: any) => s.role === "DOCTOR");
        setDoctors(docs);
      }).catch(() => toast.error("فشل جلب الأطباء"));
    }
  }, [isOpen]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert local datetime-local string to ISO 8601 Date String
      const payload = {
        ...data,
        appointmentDate: new Date(data.appointmentDate).toISOString()
      };
      await api.post("/appointments", payload);
      toast.success("تم حجز الموعد بنجاح");
      form.reset();
      onSuccess();
    } catch (err: any) {
      toast.error("فشل حجز الموعد", {
        description: err.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-violet-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" /> حجز موعد جديد
          </DialogTitle>
          <DialogDescription>أدخل تفاصيل الموعد الطبي لجدولته للمريض.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-3">
            
            {/* Patient & Doctor */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>المريض <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl" className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر المريض" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {patients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.fullName} - ملف #{p.fileNumber}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="doctorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>الطبيب المعالج <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl" className="h-11 rounded-xl">
                        <SelectValue placeholder="اختر الطبيب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {doctors.map(d => (
                        <SelectItem key={d.id} value={d.id}>د. {d.firstName} {d.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Date & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="appointmentDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>تاريخ ووقت الموعد <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="h-11 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                <FormItem>
                  <FormLabel>المدة (بالدقائق) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="number" min="5" className="pr-10 h-11 rounded-xl" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Notes */}
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                <FormControl>
                  <Textarea placeholder="أضف أي ملاحظات تهم الطبيب..." className="rounded-xl min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button type="button" variant="ghost" className="ml-2" onClick={onClose} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700 rounded-xl h-11 px-8">
                {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "جاري الحفظ…" : "تأكيد الموعد"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
