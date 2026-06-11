"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

const itemSchema = z.object({
  medicineName: z.string().min(1, "اسم الدواء مطلوب"),
  dosage: z.string().min(1, "الجرعة مطلوبة"),
  duration: z.string().min(1, "المدة مطلوبة"),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "يرجى اختيار مريضة"),
  medicalRecordId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "يجب إضافة دواء واحد على الأقل"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

type Patient = {
  id: string;
  fullName: string;
};

type NewPrescriptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function NewPrescriptionModal({ isOpen, onClose, onSuccess }: NewPrescriptionModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      medicalRecordId: "",
      notes: "",
      items: [{ medicineName: "", dosage: "", duration: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  useEffect(() => {
    if (isOpen && patients.length === 0) {
      fetchPatients();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const fetchPatients = async () => {
    setIsPatientsLoading(true);
    try {
      const response = await api.get<Patient[]>("/patients");
      setPatients(response.data);
    } catch (error) {
      toast.error("فشل جلب قائمة المرضى");
    } finally {
      setIsPatientsLoading(false);
    }
  };

  const onSubmit = async (data: PrescriptionFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean up empty optional fields
      const payload = {
        ...data,
        medicalRecordId: data.medicalRecordId || undefined,
      };
      
      await api.post("/prescriptions", payload);
      toast.success("تم إنشاء الوصفة الطبية بنجاح");
      onSuccess();
    } catch (error: any) {
      toast.error("فشل إنشاء الوصفة", {
        description: error.response?.data?.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-indigo-800">وصفة طبية جديدة</DialogTitle>
          <DialogDescription>
            قم بإضافة تفاصيل الوصفة الطبية والأدوية للمريضة.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1 overflow-y-auto pr-2 mt-4">
            
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">المريضة <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isPatientsLoading}>
                    <FormControl>
                      <SelectTrigger dir="rtl" className="h-11 rounded-xl">
                        <SelectValue placeholder={isPatientsLoading ? "جاري تحميل المرضى..." : "اختر مريضة من السجل"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl" className="max-h-60 rounded-xl">
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="cursor-pointer">
                          {p.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">الأدوية الموصوفة</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => append({ medicineName: "", dosage: "", duration: "" })}
                >
                  <Plus className="h-4 w-4 ml-1" /> إضافة دواء
                </Button>
              </div>
              
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <FormField
                        control={form.control}
                        name={`items.${index}.medicineName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="اسم الدواء" className="h-9 rounded-lg bg-white" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="الجرعة (مثال: حبة مرتين)" className="h-9 rounded-lg bg-white" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="المدة (مثال: 5 أيام)" className="h-9 rounded-lg bg-white" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1} // Prevent deleting the last item
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">تعليمات عامة أو ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="مثال: تناول الدواء بعد الأكل، تجنب منتجات الألبان..." 
                      className="resize-none rounded-xl bg-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11 px-8" 
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "جاري الحفظ..." : "حفظ الوصفة الطبية"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
