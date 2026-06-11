"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";

const itemSchema = z.object({
  description: z.string().min(1, "الوصف مطلوب"),
  amount: z.coerce.number().min(0, "يجب أن يكون المبلغ 0 أو أكثر"),
});

const schema = z.object({
  patientId: z.string().min(1, "اختر المريض"),
  appointmentId: z.string().optional(),
  items: z.array(itemSchema).min(1, "أضف بنداً واحداً على الأقل"),
  discount: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type Props = { isOpen: boolean; onClose: () => void; onSuccess: () => void };

export function NewInvoiceModal({ isOpen, onClose, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: "", appointmentId: "", items: [{ description: "كشف طبي", amount: 0 }], discount: 0, tax: 0, notes: "" },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const discount = form.watch("discount") ?? 0;
  const tax = form.watch("tax") ?? 0;
  const subtotal = watchedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const finalAmount = subtotal - Number(discount) + Number(tax);

  useEffect(() => {
    if (isOpen) {
      api.get("/patients").then(res => setPatients(res.data)).catch(() => {});
      api.get("/appointments").then(res => {
        const completed = res.data.filter((a: any) => a.status === "COMPLETED" || a.status === "IN_PROGRESS");
        setAppointments(completed);
      }).catch(() => {});
    }
  }, [isOpen]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        appointmentId: data.appointmentId || undefined,
      };
      await api.post("/billing", payload);
      toast.success("تم إنشاء الفاتورة بنجاح");
      form.reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error("فشل إنشاء الفاتورة", { description: err.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[620px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-emerald-700 flex items-center gap-2">
            <Receipt className="h-5 w-5" /> إنشاء فاتورة جديدة
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">

            {/* Patient & Appointment */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>المريض <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger dir="rtl" className="h-11 rounded-xl"><SelectValue placeholder="اختر المريض" /></SelectTrigger></FormControl>
                    <SelectContent dir="rtl">
                      {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName} #{p.fileNumber}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="appointmentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>الموعد المرتبط (اختياري)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger dir="rtl" className="h-11 rounded-xl"><SelectValue placeholder="اختر موعداً" /></SelectTrigger></FormControl>
                    <SelectContent dir="rtl">
                      {appointments.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.patient?.fullName} - {new Date(a.appointmentDate).toLocaleDateString('ar')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Invoice Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>بنود الفاتورة <span className="text-red-500">*</span></FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={() => append({ description: "", amount: 0 })} className="h-8 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                  <Plus className="h-3.5 w-3.5 ml-1" /> إضافة بند
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                    <FormItem className="flex-1">
                      {index === 0 && <FormLabel className="text-xs text-slate-500">الوصف</FormLabel>}
                      <FormControl><Input placeholder="مثال: كشف طبي" className="h-10 rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${index}.amount`} render={({ field }) => (
                    <FormItem className="w-32">
                      {index === 0 && <FormLabel className="text-xs text-slate-500">المبلغ (د.ع)</FormLabel>}
                      <FormControl><Input type="number" min="0" className="h-10 rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Discount, Tax, Total */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="discount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>الخصم (د.ع)</FormLabel>
                    <FormControl><Input type="number" min="0" className="h-10 rounded-xl bg-white" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="tax" render={({ field }) => (
                  <FormItem>
                    <FormLabel>الضريبة (د.ع)</FormLabel>
                    <FormControl><Input type="number" min="0" className="h-10 rounded-xl bg-white" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-700">المبلغ الصافي:</span>
                <span className="text-2xl font-extrabold text-emerald-700">{finalAmount.toLocaleString()} د.ع</span>
              </div>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>ملاحظات</FormLabel>
                <FormControl><Textarea placeholder="أي ملاحظات إضافية..." className="rounded-xl min-h-[60px]" {...field} /></FormControl>
              </FormItem>
            )} />

            <div className="flex justify-end pt-2 border-t border-slate-100 gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-8">
                {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "جاري الحفظ…" : "إنشاء الفاتورة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
